// Secure Express server with rate limiting
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import Stripe from 'stripe';
import admin from 'firebase-admin';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Initialize Firebase Admin (for Firestore access)
let firebaseInitialized = false;
try {
  if (!admin.apps.length) {
    const credJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const credential = credJson
      ? admin.credential.cert(JSON.parse(credJson))
      : admin.credential.applicationDefault();
    admin.initializeApp({ credential, projectId: 'wellnessai-app-e01be' });
  }
  firebaseInitialized = true;
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization failed:', error.message);
  console.warn('Subscription features will use MongoDB fallback');
}

const db_firebase = firebaseInitialized ? admin.firestore() : null;
const firebaseAuth = firebaseInitialized ? admin.auth() : null;

// Verify the request's Firebase ID token belongs to the given userId.
// If Firebase Admin isn't configured yet (no db_firebase), this fails OPEN
// so behavior doesn't regress before the credential is added - it becomes
// enforced automatically the moment GOOGLE_APPLICATION_CREDENTIALS_JSON is set.
async function verifyOwnership(req, userId) {
  if (!firebaseAuth) return true;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return false;
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    return decoded.uid === userId;
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.warn('Token verification failed:', error.message);
    return false;
  }
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wellnessai';
let db = null;
let usersCollection = null;
let backupsCollection = null;
let battlesCollection = null;

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    usersCollection = db.collection('users');
    backupsCollection = db.collection('backups');
    battlesCollection = db.collection('battles');
    if(process.env.NODE_ENV!=="production")console.log('✅ MongoDB connected');
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.warn('⚠️ MongoDB connection failed, using memory storage:', error.message);
    // Fallback to in-memory storage
    db = { memory: true };
    usersCollection = { data: [] };
    backupsCollection = { data: [] };
    battlesCollection = { data: [] };
  }
}

connectDB();

// SECURITY: Rate limiting to prevent abuse
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 500; // 500 requests per 15 minutes per IP

// Rate limiting middleware
function rateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimiter.has(clientIP)) {
    rateLimiter.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimiter.get(clientIP);
  
  if (now > clientData.resetTime) {
    // Reset window
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  next();
}

// Clean up rate limiter every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimiter.entries()) {
    if (now > data.resetTime + 60000) {
      rateLimiter.delete(ip);
    }
  }
}, 300000);

// Enable CORS for all origins (allows your phone to connect)
app.use(cors());

// Stripe webhook needs raw body
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'account.updated':
        await handleConnectAccountUpdate(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handleEscrowPaymentSucceeded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({received: true});
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// JSON body parsing + rate limiting for ALL routes below this point.
// Must come AFTER the webhook route above (which needs the raw, unparsed body
// for Stripe signature verification) but BEFORE every other route that reads req.body.
app.use(express.json({ limit: '10mb' }));  // Increase limit for image data
app.use(rateLimit); // Apply rate limiting to all routes

// Helper function - Map Stripe product ID to plan name
function mapStripePriceToPlan(productId) {
  const priceMap = {
    [process.env.STRIPE_ESSENTIAL_PRICE_ID]: 'starter',   // £6.99 - Starter plan
    [process.env.STRIPE_PREMIUM_PRICE_ID]: 'premium',     // £16.99 - Premium plan
    [process.env.STRIPE_ULTIMATE_PRICE_ID]: 'ultimate'    // £34.99 - Ultimate plan
  };
  return priceMap[productId] || 'free';
}

// Webhook handler - Stripe Connect Express account onboarding status changed
async function handleConnectAccountUpdate(account) {
  try {
    const userId = account.metadata?.firebaseUserId;
    if (!userId || !db_firebase) return;

    const isActive = !!(account.charges_enabled && account.payouts_enabled);

    await db_firebase.collection('users').doc(userId).update({
      stripeConnectId: account.id,
      stripeConnectStatus: isActive ? 'active' : 'pending'
    });

    if(process.env.NODE_ENV!=="production")console.log(`Connect account ${account.id} for user ${userId}: ${isActive ? 'active' : 'pending'}`);
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Connect account webhook error:', error);
  }
}

// Webhook handler - Escrow payment confirmed by Stripe (authoritative, server-side)
async function handleEscrowPaymentSucceeded(paymentIntent) {
  try {
    const { battleId, escrowId } = paymentIntent.metadata || {};
    if (!battleId || !escrowId || !db_firebase) return;

    await db_firebase.collection('battle_escrow').doc(battleId).set({
      status: 'held',
      confirmedAt: new Date()
    }, { merge: true });

    if(process.env.NODE_ENV!=="production")console.log(`Escrow ${escrowId} confirmed held for battle ${battleId}`);
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Escrow payment webhook error:', error);
  }
}

// Webhook handler - Subscription updated or created
async function handleSubscriptionUpdate(subscription) {
  try {
    const userId = subscription.metadata?.firebaseUserId;
    if (!userId) {
      console.error('No firebaseUserId in subscription metadata');
      return;
    }

    const priceId = subscription.items.data[0]?.price?.product;
    const plan = mapStripePriceToPlan(priceId);
    
    await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').set({
      plan: plan,
      status: subscription.status,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date()
    }, { merge: true });

    console.log(`Subscription updated for user ${userId}: ${plan} (${subscription.status})`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Webhook handler - Subscription deleted/canceled
async function handleSubscriptionDeleted(subscription) {
  try {
    const userId = subscription.metadata?.firebaseUserId;
    if (!userId) return;

    await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').set({
      plan: 'free',
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Error deleting subscription:', error);
  }
}

// Webhook handler - Invoice paid successfully
async function handleInvoicePaid(invoice) {
  try {
    const subscription = invoice.subscription;
    if (!subscription) return;

    const subscriptionObj = await stripe.subscriptions.retrieve(subscription);
    await handleSubscriptionUpdate(subscriptionObj);
    
    console.log(`Invoice paid for subscription ${subscription}`);
  } catch (error) {
    console.error('Error handling paid invoice:', error);
  }
}

// Webhook handler - Payment failed
async function handlePaymentFailed(invoice) {
  try {
    const subscription = invoice.subscription;
    if (!subscription) return;

    const subscriptionObj = await stripe.subscriptions.retrieve(subscription);
    const userId = subscriptionObj.metadata?.firebaseUserId;
    if (!userId) return;

    await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').set({
      status: 'past_due',
      paymentFailed: true,
      lastPaymentAttempt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// API Endpoint - Create Stripe checkout session
app.post('/api/stripe/create-checkout', async (req, res) => {
  try {
    const { userId, priceId, plan } = req.body;
    
    if (!userId || !priceId) {
      return res.status(400).json({ error: 'Missing userId or priceId' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${req.headers.origin || 'https://helio-wellness-app-production.up.railway.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://helio-wellness-app-production.up.railway.app'}/payment-canceled`,
      metadata: {
        firebaseUserId: userId,
        plan: plan
      },
      subscription_data: {
        metadata: {
          firebaseUserId: userId,
          plan: plan
        }
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ===== Money Escrow Endpoints (Social Battles with money stakes) =====
// Uses Stripe's "separate charges and transfers" Connect pattern:
// 1. Charge the stake to the platform account (create-escrow)
// 2. When the battle finishes, transfer the held funds to the winner's connected account (release-escrow)
// 3. If cancelled/disputed, refund the original charge (refund-escrow)
// These endpoints fail CLOSED (503) if Firebase isn't connected - unlike the softer IDOR
// checks elsewhere, there is no existing fallback behavior to preserve for money movement.

app.post('/api/stripe/create-escrow', async (req, res) => {
  try {
    const { battleId, amount, userId, participants } = req.body;

    if (!battleId || !amount || !userId || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'Missing battleId, amount, userId, or participants' });
    }

    // Defense in depth: re-validate the stake range server-side (£5-£100 -> 500-10000 pence)
    if (amount < 500 || amount > 10000) {
      return res.status(400).json({ error: 'Stake amount must be between £5 and £100' });
    }

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!db_firebase) {
      return res.status(503).json({ error: 'Escrow service unavailable' });
    }

    const escrowId = `escrow_${battleId}_${Date.now()}`;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      metadata: { escrowId, battleId, creatorId: userId },
      transfer_group: escrowId
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      escrowId,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Create escrow error:', error);
    res.status(500).json({ error: 'Failed to create escrow payment' });
  }
});

app.post('/api/stripe/release-escrow', async (req, res) => {
  try {
    const { escrowId, battleId, winnerId, amount } = req.body;

    if (!escrowId || !battleId || !winnerId) {
      return res.status(400).json({ error: 'Missing escrowId, battleId, or winnerId' });
    }

    if (!db_firebase) {
      return res.status(503).json({ error: 'Escrow service unavailable' });
    }

    // Must be authenticated - identity checked against the escrow's own participant list below
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!firebaseAuth || !token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    let requesterUid;
    try {
      requesterUid = (await firebaseAuth.verifyIdToken(token)).uid;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const escrowDoc = await db_firebase.collection('battle_escrow').doc(battleId).get();
    if (!escrowDoc.exists) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    const escrow = escrowDoc.data();

    if (escrow.status !== 'held') {
      return res.status(400).json({ error: `Cannot release escrow in status: ${escrow.status}` });
    }
    // Only a participant of this exact battle can trigger a release
    if (![escrow.creatorId, ...(escrow.participants || [])].includes(requesterUid)) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }
    // The winner must actually be one of the declared participants
    if (!(escrow.participants || []).includes(winnerId)) {
      return res.status(400).json({ error: 'Winner is not a participant in this battle' });
    }

    const winnerDoc = await db_firebase.collection('users').doc(winnerId).get();
    const winnerData = winnerDoc.exists ? winnerDoc.data() : null;
    if (!winnerData?.stripeConnectId || winnerData.stripeConnectStatus !== 'active') {
      return res.status(400).json({ error: 'Winner has not completed payout onboarding' });
    }

    const transfer = await stripe.transfers.create({
      amount: amount || escrow.amount,
      currency: 'gbp',
      destination: winnerData.stripeConnectId,
      transfer_group: escrowId
    });

    res.json({ transferId: transfer.id });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Release escrow error:', error);
    res.status(500).json({ error: 'Failed to release escrow funds' });
  }
});

app.post('/api/stripe/refund-escrow', async (req, res) => {
  try {
    const { escrowId, paymentIntentId, reason } = req.body;

    if (!escrowId || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing escrowId or paymentIntentId' });
    }

    if (!db_firebase) {
      return res.status(503).json({ error: 'Escrow service unavailable' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!firebaseAuth || !token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    let requesterUid;
    try {
      requesterUid = (await firebaseAuth.verifyIdToken(token)).uid;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Find the escrow by escrowId (stored under the battleId doc key)
    const escrowQuery = await db_firebase.collection('battle_escrow').where('escrowId', '==', escrowId).limit(1).get();
    if (escrowQuery.empty) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    const escrow = escrowQuery.docs[0].data();

    if (escrow.status !== 'held' && escrow.status !== 'pending') {
      return res.status(400).json({ error: `Cannot refund escrow in status: ${escrow.status}` });
    }
    // Only the creator (who paid) or a fellow participant can request a refund
    if (![escrow.creatorId, ...(escrow.participants || [])].includes(requesterUid)) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: { escrowId, reason: reason || 'Battle cancelled' }
    });

    res.json({ refundId: refund.id });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Refund escrow error:', error);
    res.status(500).json({ error: 'Failed to refund escrow' });
  }
});

app.post('/api/stripe/connect/onboard', async (req, res) => {
  try {
    const { userId, email, returnUrl, refreshUrl } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true }
      },
      metadata: { firebaseUserId: userId }
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl || `${req.headers.origin || 'https://helio-wellness-app-production.up.railway.app'}/dashboard?connect=refresh`,
      return_url: returnUrl || `${req.headers.origin || 'https://helio-wellness-app-production.up.railway.app'}/dashboard?connect=success`,
      type: 'account_onboarding'
    });

    res.json({ url: accountLink.url, accountId: account.id });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Connect onboarding error:', error);
    res.status(500).json({ error: 'Failed to create Connect onboarding' });
  }
});

// API Endpoint - Verify a user's subscription plan is genuine (anti-tampering check)
app.post('/api/subscription/verify', async (req, res) => {
  try {
    const { userId, feature } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!db_firebase) {
      return res.status(503).json({ error: 'Verification unavailable' });
    }

    const subDoc = await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').get();

    if (!subDoc.exists) {
      return res.json({ hasAccess: false, plan: 'free' });
    }

    const data = subDoc.data();
    const now = new Date();
    const periodEnd = data.currentPeriodEnd?.toDate() || new Date(0);
    const isActive = data.status === 'active' && periodEnd > now;
    const plan = isActive ? data.plan : 'free';

    res.json({ hasAccess: isActive && plan !== 'free', plan, feature: feature || null });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Subscription verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// API Endpoint - Get subscription status
app.get('/api/subscription/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const subDoc = await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').get();
    
    if (!subDoc.exists) {
      return res.json({ plan: 'free', status: 'none', isActive: false });
    }

    const data = subDoc.data();
    const now = new Date();
    const periodEnd = data.currentPeriodEnd?.toDate() || new Date(0);
    const isActive = data.status === 'active' && periodEnd > now;

    res.json({
      plan: isActive ? data.plan : 'free',
      status: data.status,
      isActive: isActive,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// API Endpoint - Cancel subscription
app.post('/api/subscription/cancel', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const subDoc = await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').get();
    
    if (!subDoc.exists) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const data = subDoc.data();
    const subscriptionId = data.stripeSubscriptionId;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'No Stripe subscription ID found' });
    }

    // Cancel at period end (user keeps access until renewal date)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').set({
      cancelAtPeriodEnd: true,
      updatedAt: new Date()
    }, { merge: true });

    res.json({ 
      success: true, 
      message: 'Subscription will be canceled at period end',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// SECURITY: API key from environment variables only (never hardcoded)
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!API_KEY) {
  if(process.env.NODE_ENV!=="production")console.error('❌ FATAL: No API key found in environment variables!');
  if(process.env.NODE_ENV!=="production")console.error('Set VITE_GEMINI_API_KEY or GEMINI_API_KEY environment variable');
  if(process.env.NODE_ENV!=="production")console.error('Current env vars available:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
  process.exit(1);
}
if(process.env.NODE_ENV!=="production")console.log('✅ API key loaded from environment variables');

// Use a valid, stable Gemini model by default. Override via env var when needed.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WellnessAI API Server Running',
    database: db ? (db.memory ? (db_firebase ? 'firebase-proxy' : 'memory') : 'connected') : 'disconnected',
    version: '2.0.0',
    endpoints: ['/api/chat', '/api/v1/chat', '/api/vision', '/api/v1/vision', '/api/backup', '/api/user/delete', '/api/battles', '/api/feedback', '/api/logs']
  });
});

// Client Log Ingestion Endpoint
app.post('/api/logs', (req, res) => {
  try {
    const { sessionId, logs, timestamp } = req.body;
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'No logs provided' });
    }

    // Structured output to Railway log drain / console
    const errors = logs.filter(l => l.level === 'ERROR');
    const warnings = logs.filter(l => l.level === 'WARN');

    if (errors.length > 0) {
      console.error(`[CLIENT-ERROR] session=${sessionId} count=${errors.length}`, JSON.stringify(errors));
    }
    if (warnings.length > 0) {
      console.warn(`[CLIENT-WARN] session=${sessionId} count=${warnings.length}`, JSON.stringify(warnings));
    }
    // Summary line for all batches
    console.log(`[CLIENT-LOGS] session=${sessionId} total=${logs.length} errors=${errors.length} warns=${warnings.length} at=${timestamp}`);

    res.json({ received: logs.length });
  } catch (error) {
    console.error('Log ingestion error:', error);
    res.status(500).json({ error: 'Failed to process logs' });
  }
});

// Cloud Backup Endpoints
app.post('/api/backup', async (req, res) => {
  try {
    const { userId, data, encrypted } = req.body;
    
    if (!userId || !data) {
      return res.status(400).json({ error: 'Missing userId or data' });
    }

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const backup = {
      userId,
      data,
      encrypted: encrypted || false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    if (db_firebase) {
      await db_firebase.collection('backups').doc(userId).set(backup);
    } else if (db.memory) {
      backupsCollection.data.push(backup);
    } else {
      await backupsCollection.updateOne(
        { userId },
        { $set: backup },
        { upsert: true }
      );
    }

    res.json({ success: true, message: 'Backup saved' });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Backup error:', error);
    res.status(500).json({ error: 'Backup failed' });
  }
});

app.get('/api/backup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    let backup;
    if (db_firebase) {
      const doc = await db_firebase.collection('backups').doc(userId).get();
      backup = doc.exists ? doc.data() : null;
    } else if (db.memory) {
      backup = backupsCollection.data.find(b => b.userId === userId);
    } else {
      backup = await backupsCollection.findOne({ userId });
    }

    if (!backup) {
      return res.status(404).json({ error: 'No backup found' });
    }

    res.json(backup);
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Restore error:', error);
    res.status(500).json({ error: 'Restore failed' });
  }
});

// User Data Deletion (GDPR)
app.delete('/api/user/delete', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (!(await verifyOwnership(req, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (db_firebase) {
      await db_firebase.collection('backups').doc(userId).delete();
    }
    if (db.memory) {
      usersCollection.data = usersCollection.data.filter(u => u.userId !== userId);
      backupsCollection.data = backupsCollection.data.filter(b => b.userId !== userId);
    } else {
      await usersCollection.deleteOne({ userId });
      await backupsCollection.deleteMany({ userId });
    }

    res.json({ success: true, message: 'User data deleted' });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Deletion error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// Social Battles Endpoints
app.get('/api/battles', async (req, res) => {
  try {
    let battles;
    if (db_firebase) {
      const snapshot = await db_firebase.collection('battles').get();
      battles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (db.memory) {
      battles = battlesCollection.data;
    } else {
      battles = await battlesCollection.find({}).toArray();
    }

    res.json(battles);
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Battles error:', error);
    res.status(500).json({ error: 'Failed to load battles' });
  }
});

app.post('/api/battles', async (req, res) => {
  try {
    const battleId = Date.now().toString();
    const battle = {
      ...req.body,
      createdAt: new Date().toISOString(),
      id: battleId
    };

    if (db_firebase) {
      await db_firebase.collection('battles').doc(battleId).set(battle);
    } else if (db.memory) {
      battlesCollection.data.push(battle);
    } else {
      await battlesCollection.insertOne(battle);
    }

    res.json({ success: true, battle });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Battle creation error:', error);
    res.status(500).json({ error: 'Failed to create battle' });
  }
});

app.put('/api/battles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (db_firebase) {
      await db_firebase.collection('battles').doc(id).set(updates, { merge: true });
    } else if (db.memory) {
      const index = battlesCollection.data.findIndex(b => b.id === id);
      if (index >= 0) {
        battlesCollection.data[index] = { ...battlesCollection.data[index], ...updates };
      }
    } else {
      await battlesCollection.updateOne({ id }, { $set: updates });
    }

    res.json({ success: true });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Battle update error:', error);
    res.status(500).json({ error: 'Failed to update battle' });
  }
});

// Feedback Endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = {
      ...req.body,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };

    if(process.env.NODE_ENV!=="production")console.log('📝 Feedback received:', feedback);

    res.json({ success: true, message: 'Feedback received' });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Support Ticket Notification Endpoint
// NOTE: No email provider is configured yet (no SendGrid/Mailgun/etc credentials available).
// This endpoint logs the ticket prominently so it's visible in Railway logs instead of
// silently failing. Wire up a real email provider here once credentials are available.
app.post('/api/support/notify', async (req, res) => {
  try {
    const { ticketId, userEmail, userName, subject, message, priority, planTier, slaHours } = req.body;

    if (!ticketId) {
      return res.status(400).json({ error: 'Missing ticketId' });
    }

    console.log(`🎫 SUPPORT TICKET [${priority || 'normal'}] ${ticketId} from ${userName || 'unknown'} <${userEmail || 'no-email'}> (plan: ${planTier || 'free'}, SLA: ${slaHours || 'n/a'}h)\nSubject: ${subject || '(no subject)'}\nMessage: ${message || '(no message)'}`);

    res.json({ success: true, message: 'Ticket logged (email delivery not yet configured)' });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('Support notify error:', error);
    res.status(500).json({ error: 'Failed to log ticket notification' });
  }
});

// Chat endpoint
const chatHandler = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if(process.env.NODE_ENV!=="production")console.log('📱 Received message from phone:', message);

    const prompt = `You are a friendly AI wellness coach. Answer this question in a helpful, encouraging way (2-3 sentences max):

${message}

Keep it simple, friendly, and motivating!`;

    if(process.env.NODE_ENV!=="production")console.log('🤖 Calling Gemini API...');
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if(process.env.NODE_ENV!=="production")console.error('❌ Gemini API Error:', errorText);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    if(process.env.NODE_ENV!=="production")console.log('✅ AI Response:', text.substring(0, 100) + '...');

    return res.json({ response: text });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Backwards compatible routes (some app builds call /api/v1/*)
app.post('/api/chat', chatHandler);
app.post('/api/v1/chat', chatHandler);

// Vision endpoint for food scanning
const visionHandler = async (req, res) => {
  try {
    const { prompt, imageData } = req.body;
    
    if (!prompt || !imageData) {
      return res.status(400).json({ error: 'Prompt and imageData are required' });
    }

    if(process.env.NODE_ENV!=="production")console.log('📸 Received vision request');
    if(process.env.NODE_ENV!=="production")console.log('🖼️ Image data length:', imageData.length);
    
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: imageData
            }
          }
        ]
      }]
    };

    if(process.env.NODE_ENV!=="production")console.log('🤖 Calling Gemini Vision API...');
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      if(process.env.NODE_ENV!=="production")console.error('❌ Gemini Vision API Error:', errorText);
      return res.status(response.status).json({ error: 'AI vision service error' });
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts?.[0]?.text;

    if (!text) {
      if(process.env.NODE_ENV!=="production")console.error('❌ Empty AI response');
      return res.status(500).json({ error: 'Empty AI response' });
    }

    if(process.env.NODE_ENV!=="production")console.log('✅ AI Vision Response:', text.substring(0, 150) + '...');

    return res.json({ response: text });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Vision server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Backwards compatible routes (some app builds call /api/v1/*)
app.post('/api/vision', visionHandler);
app.post('/api/v1/vision', visionHandler);

// Mock /api/create-payment-intent removed — use /api/stripe/create-checkout for real payments

// NOTE: Stripe webhook is implemented earlier in this file with proper signature verification.
// Do not re-register the same route here, as it can cause body parsing/signature issues.

// Push Notification Endpoint
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { deviceToken, title, body, data } = req.body;

    if (!deviceToken || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Import FCM config dynamically
    const fcmModule = await import('./fcm-config.js').catch(() => null);
    
    if (!fcmModule) {
      return res.status(503).json({ error: 'Push notifications not configured' });
    }

    const result = await fcmModule.sendNotification(deviceToken, title, body, data);
    
    res.json(result);
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Notification send error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  if(process.env.NODE_ENV!=="production")console.log(`
🚀 WellnessAI API Server Running!
📱 Your phone can now connect to:
   - Chat: http://YOUR_COMPUTER_IP:${PORT}/api/chat
   - Vision: http://YOUR_COMPUTER_IP:${PORT}/api/vision
   - Backup: http://YOUR_COMPUTER_IP:${PORT}/api/backup
   - Battles: http://YOUR_COMPUTER_IP:${PORT}/api/battles
   - Feedback: http://YOUR_COMPUTER_IP:${PORT}/api/feedback
   - Notifications: http://YOUR_COMPUTER_IP:${PORT}/api/notifications/send
   - Stripe Webhook: http://YOUR_COMPUTER_IP:${PORT}/api/stripe/webhook

Database: ${db_firebase ? 'Firebase Connected' : (db ? (db.memory ? 'In-Memory (fallback)' : 'MongoDB Connected') : 'Not Connected')}

To find your computer's IP address:
  Windows: ipconfig
  Mac/Linux: ifconfig

Make sure your phone and computer are on the same WiFi network!
  `);
});

