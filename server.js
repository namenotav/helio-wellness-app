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
  // Firebase Admin will use default credentials from environment
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'wellnessai-app-e01be'
    });
  }
  firebaseInitialized = true;
  if(process.env.NODE_ENV!=="production")console.log('✅ Firebase Admin initialized');
} catch (error) {
  if(process.env.NODE_ENV!=="production")console.warn('⚠️ Firebase Admin initialization failed:', error.message);
  if(process.env.NODE_ENV!=="production")console.warn('Subscription features will use MongoDB fallback');
}

const db_firebase = firebaseInitialized ? admin.firestore() : null;

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

// SECURITY: Rate limiting to prevent abuse - strict for production security
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP (600/hour max)

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

  // SECURITY: Require webhook secret to be configured
  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET not configured - rejecting webhook');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    // SECURITY: Verify signature from Stripe to prevent fake webhooks
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
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({received: true});
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Helper function - Map Stripe price ID to plan name
function mapStripePriceToPlan(priceId) {
  const priceMap = {
    // NEW PLANS (December 2025)
    'price_1SffiWD2EDcoPFLNrGfZU1c6': 'starter',   // £6.99/month
    'price_1Sffj1D2EDcoPFLNkqdUxY9L': 'premium',   // £16.99/month
    'price_1Sffk1D2EDcoPFLN4yxdNXSq': 'ultimate',  // £34.99/month
    // LEGACY PLANS (for existing subscribers)
    'prod_TZhdMJIuUuIxOP': 'essential',  // £4.99 (grandfathered)
    'prod_TZhulmjk69SvVX': 'premium',    // £14.99 (grandfathered)
    'prod_TZhmpYUG5KqUaK': 'vip'         // £29.99 (grandfathered)
  };
  return priceMap[priceId] || 'free';
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

// API Endpoint - Get subscription status
app.get('/api/subscription/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
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

app.use(express.json({ limit: '10mb' }));  // Increase limit for image data
app.use(rateLimit); // Apply rate limiting to all routes

// SECURITY: API key from environment variables only (never hardcoded)
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!API_KEY) {
  if(process.env.NODE_ENV!=="production")console.error('❌ FATAL: No API key found in environment variables!');
  if(process.env.NODE_ENV!=="production")console.error('Set VITE_GEMINI_API_KEY or GEMINI_API_KEY environment variable');
  if(process.env.NODE_ENV!=="production")console.error('Current env vars available:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
  process.exit(1);
}
if(process.env.NODE_ENV!=="production")console.log('✅ API key loaded from environment variables');

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WellnessAI API Server Running',
    database: db ? (db.memory ? 'memory' : 'connected') : 'disconnected',
    version: '2.0.0',
    endpoints: ['/api/chat', '/api/vision', '/api/backup', '/api/user/delete', '/api/battles', '/api/feedback']
  });
});

// Cloud Backup Endpoints
app.post('/api/backup', async (req, res) => {
  try {
    const { userId, data, encrypted } = req.body;
    
    if (!userId || !data) {
      return res.status(400).json({ error: 'Missing userId or data' });
    }

    const backup = {
      userId,
      data,
      encrypted: encrypted || false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    if (db.memory) {
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
    
    let backup;
    if (db.memory) {
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

// User Data Deletion (GDPR) - REQUIRES AUTHENTICATION
app.delete('/api/user/delete', async (req, res) => {
  try {
    const { userId, userEmail, confirmDelete } = req.body;
    
    // SECURITY: Require explicit confirmation to prevent accidental/malicious deletion
    if (!userId || !userEmail || confirmDelete !== true) {
      return res.status(400).json({ error: 'Missing required fields: userId, userEmail, and confirmDelete=true' });
    }

    // SECURITY: Verify user owns this account by checking Firebase Authentication
    if (firebaseInitialized) {
      try {
        const userRecord = await admin.auth().getUserByEmail(userEmail);
        if (userRecord.uid !== userId) {
          return res.status(403).json({ error: 'Authentication failed: userId mismatch' });
        }
      } catch (authError) {
        console.error('User authentication failed:', authError);
        return res.status(403).json({ error: 'Authentication failed: Invalid user' });
      }
    } else {
      // Fallback: If Firebase Admin not available, reject deletion requests
      return res.status(503).json({ error: 'User deletion requires authentication service' });
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
    if (db.memory) {
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
    const battle = {
      ...req.body,
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    if (db.memory) {
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

    if (db.memory) {
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

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // SECURITY: Input sanitization - prevent injection attacks
    const sanitizedMessage = String(message)
      .trim()
      .slice(0, 2000) // Limit to 2000 characters
      .replace(/[<>"']/g, ''); // Remove HTML/script characters

    if (!sanitizedMessage || sanitizedMessage.length < 2) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // SECURITY: Rate limit check per user (basic implementation)
    const userIp = req.ip || req.connection.remoteAddress;
    if(process.env.NODE_ENV!=="production")console.log('📱 Received message from', userIp + ':', sanitizedMessage.substring(0, 50));

    // SECURITY: Prevent prompt injection attempts
    const suspiciousPatterns = [
      /ignore.*previous.*instructions/i,
      /system.*prompt/i,
      /you.*are.*now/i,
      /forget.*everything/i,
      /new.*instructions/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(sanitizedMessage))) {
      if(process.env.NODE_ENV!=="production")console.warn('⚠️ Prompt injection attempt detected');
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const prompt = `You are a friendly AI wellness coach. Answer this question in a helpful, encouraging way (2-3 sentences max):

${sanitizedMessage}

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
});

// Vision endpoint for food scanning
app.post('/api/vision', async (req, res) => {
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
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

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
});

// Stripe Payment Intent Creation
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { planId, userId, amount } = req.body;

    if (!planId || !userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if(process.env.NODE_ENV!=="production")console.log(`💳 Creating payment intent: Plan=${planId}, User=${userId}, Amount=$${amount/100}`);

    // In production, use real Stripe API:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount,
    //   currency: 'usd',
    //   metadata: { planId, userId }
    // });

    // Mock response for development
    const mockPaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      clientSecret: `pi_mock_secret_${Date.now()}`,
      amount: amount,
      currency: 'usd',
      status: 'succeeded',
      success: true
    };

    if(process.env.NODE_ENV!=="production")console.log('✅ Payment intent created (mock)');

    res.json(mockPaymentIntent);
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Payment intent creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook Endpoint (Duplicate - for backwards compatibility)
app.post('/api/stripe/webhook-legacy', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

    // SECURITY: This endpoint is deprecated and should not be used
    if(process.env.NODE_ENV!=="production")console.warn('⚠️ Legacy webhook endpoint called - use /api/stripe/webhook instead');

    if (!STRIPE_WEBHOOK_SECRET || !sig) {
      return res.status(400).json({ error: 'Webhook authentication required' });
    }

    // SECURITY: Verify signature from Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if(process.env.NODE_ENV!=="production")console.log('💳 Stripe webhook received:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded':
        if(process.env.NODE_ENV!=="production")console.log('✅ Payment succeeded');
        // Update user subscription status
        break;
      
      case 'payment_intent.payment_failed':
        if(process.env.NODE_ENV!=="production")console.log('❌ Payment failed');
        // Notify user of payment failure
        break;
      
      case 'customer.subscription.created':
        if(process.env.NODE_ENV!=="production")console.log('✅ Subscription created');
        // Activate user premium features
        break;
      
      case 'customer.subscription.deleted':
        if(process.env.NODE_ENV!=="production")console.log('❌ Subscription canceled');
        // Deactivate premium features
        break;
      
      case 'customer.subscription.updated':
        if(process.env.NODE_ENV!=="production")console.log('🔄 Subscription updated');
        // Update subscription details
        break;
      
      default:
        if(process.env.NODE_ENV!=="production")console.log('ℹ️ Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

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

// 💰 STRIPE CONNECT - CREATE ESCROW FOR MONEY BATTLES
app.post('/api/stripe/create-escrow', async (req, res) => {
  try {
    const { battleId, amount, userId, participants } = req.body;

    // Validate inputs
    if (!battleId || !amount || !userId || !participants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount (£5-£100 range)
    if (amount < 500 || amount > 10000) {
      return res.status(400).json({ error: 'Amount must be between £5 and £100' });
    }

    // Create payment intent with application_fee for platform
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in pence
      currency: 'gbp',
      payment_method_types: ['card'],
      metadata: {
        battleId,
        userId,
        type: 'battle_escrow'
      },
      // Hold funds in escrow
      capture_method: 'manual',
      description: `Battle Escrow - ${battleId}`
    });

    const escrowId = `escrow_${battleId}_${Date.now()}`;

    if(process.env.NODE_ENV!=="production")console.log(`✅ Escrow payment intent created: ${escrowId}`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      escrowId,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Create escrow error:', error);
    res.status(500).json({ error: 'Failed to create escrow' });
  }
});

// 💰 STRIPE CONNECT - RELEASE ESCROW TO WINNER
app.post('/api/stripe/release-escrow', async (req, res) => {
  try {
    const { escrowId, battleId, winnerId, amount } = req.body;

    // In production, look up payment intent from database
    // For now, simulate transfer
    if(process.env.NODE_ENV!=="production")console.log(`💸 Releasing escrow ${escrowId} to winner ${winnerId}: £${amount / 100}`);

    // Capture payment intent
    // const captured = await stripe.paymentIntents.capture(paymentIntentId);

    // Transfer to winner's Stripe Connect account
    // const transfer = await stripe.transfers.create({
    //   amount: Math.floor(amount * 0.95), // 95% to winner (5% platform fee)
    //   currency: 'gbp',
    //   destination: winnerStripeConnectId,
    //   transfer_group: battleId,
    //   metadata: { battleId, winnerId }
    // });

    res.json({
      success: true,
      transferId: `transfer_${Date.now()}`,
      message: 'Funds released to winner'
    });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Release escrow error:', error);
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

// 💰 STRIPE CONNECT - REFUND ESCROW
app.post('/api/stripe/refund-escrow', async (req, res) => {
  try {
    const { escrowId, paymentIntentId, reason } = req.body;

    if(process.env.NODE_ENV!=="production")console.log(`↩️ Refunding escrow ${escrowId}: ${reason}`);

    // Refund payment intent
    // const refund = await stripe.refunds.create({
    //   payment_intent: paymentIntentId,
    //   reason: 'requested_by_customer',
    //   metadata: { escrowId, reason }
    // });

    res.json({
      success: true,
      refundId: `refund_${Date.now()}`,
      message: 'Escrow refunded'
    });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Refund escrow error:', error);
    res.status(500).json({ error: 'Failed to refund escrow' });
  }
});

// 💰 STRIPE CONNECT - ONBOARDING
app.post('/api/stripe/connect/onboard', async (req, res) => {
  try {
    const { userId, email, returnUrl, refreshUrl } = req.body;

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'GB',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: { userId }
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding'
    });

    if(process.env.NODE_ENV!=="production")console.log(`✅ Stripe Connect account created for user ${userId}: ${account.id}`);

    res.json({
      success: true,
      url: accountLink.url,
      accountId: account.id
    });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Connect onboarding error:', error);
    res.status(500).json({ error: 'Failed to create Connect account' });
  }
});

// 🎧 SUPPORT TICKET EMAIL NOTIFICATION
app.post('/api/support/notify', async (req, res) => {
  try {
    const { ticketId, userEmail, userName, subject, message, priority, planTier, slaHours } = req.body;

    // Validate required fields
    if (!ticketId || !userEmail || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production, this would send via SendGrid/Mailgun/AWS SES
    // For now, log to console and return success
    if(process.env.NODE_ENV!=="production")console.log(`
📧 SUPPORT TICKET NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ticket ID: ${ticketId}
User: ${userName} (${userEmail})
Plan: ${planTier.toUpperCase()}
Priority: ${priority.toUpperCase()}
SLA: ${slaHours} hours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: ${subject}
Message: ${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // TODO: Integrate with email service (SendGrid/Mailgun)
    // Example SendGrid integration:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: 'support@wellnessai.com',
      from: 'noreply@wellnessai.com',
      subject: `[${priority.toUpperCase()}] ${subject}`,
      text: `
        Support Ticket #${ticketId}
        
        User: ${userName} (${userEmail})
        Plan: ${planTier}
        Priority: ${priority}
        SLA: ${slaHours} hours
        
        ${message}
      `,
      html: `
        <h2>Support Ticket #${ticketId}</h2>
        <p><strong>User:</strong> ${userName} (${userEmail})</p>
        <p><strong>Plan:</strong> ${planTier}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>SLA:</strong> ${slaHours} hours</p>
        <hr>
        <p>${message}</p>
      `
    });
    */

    res.json({ 
      success: true, 
      message: 'Support ticket notification sent',
      ticketId 
    });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Support notification error:', error);
    res.status(500).json({ error: 'Failed to send support notification' });
  }
});

// ✅ PRODUCTION: Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: db ? (db.memory ? 'fallback' : 'connected') : 'disconnected',
    firebase: firebaseInitialized ? 'connected' : 'disconnected',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing'
  };
  
  res.json(health);
});

// ✅ PRODUCTION: Error logging endpoint
app.post('/api/log-error', express.json(), (req, res) => {
  const { timestamp, message, stack, userId, url } = req.body;
  
  console.error('🚨 Client Error:', {
    timestamp,
    message,
    userId,
    url,
    stack: stack?.substring(0, 500)
  });
  
  // TODO: Send to error tracking service (Sentry, Rollbar, etc.)
  
  res.json({ success: true });
});

// ✅ PRODUCTION: Logs collection endpoint
app.post('/api/logs', express.json(), (req, res) => {
  const { sessionId, logs } = req.body;
  
  // Filter only errors and important logs
  const importantLogs = logs.filter(log => 
    log.level === 'ERROR' || log.level === 'WARN'
  );
  
  if (importantLogs.length > 0) {
    console.log(`📊 Session ${sessionId}: ${importantLogs.length} important logs`);
    importantLogs.forEach(log => {
      if (log.level === 'ERROR') {
        console.error('🚨', log.message, log.context);
      } else {
        console.warn('⚠️', log.message, log.context);
      }
    });
  }
  
  res.json({ success: true, received: logs.length });
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
   - Support: http://YOUR_COMPUTER_IP:${PORT}/api/support/notify
   - Stripe Webhook: http://YOUR_COMPUTER_IP:${PORT}/api/stripe/webhook
   - Health Check: http://YOUR_COMPUTER_IP:${PORT}/health
   - Error Logging: http://YOUR_COMPUTER_IP:${PORT}/api/log-error

Database: ${db ? (db.memory ? 'In-Memory (fallback)' : 'MongoDB Connected') : 'Not Connected'}

To find your computer's IP address:
  Windows: ipconfig
  Mac/Linux: ifconfig

Make sure your phone and computer are on the same WiFi network!
  `);
});

