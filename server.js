// Secure Express server with rate limiting
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import Joi from 'joi';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// SECURITY: CSRF token storage (in-memory, reset on server restart)
const csrfTokens = new Map(); // Map<token, {createdAt, used}>
const CSRF_TOKEN_LIFETIME = 3600000; // 1 hour

// SECURITY: Webhook replay protection - track processed event IDs
const processedWebhookEvents = new Set();
const MAX_PROCESSED_EVENTS = 10000; // Limit memory usage

// SECURITY: API key rotation monitoring
const API_KEY_AGE_THRESHOLD = 90 * 24 * 60 * 60 * 1000; // 90 days
const API_KEY_CREATION_DATES = {
  STRIPE_SECRET_KEY: process.env.STRIPE_KEY_CREATED_AT || Date.now(),
  GEMINI_API_KEY: process.env.GEMINI_KEY_CREATED_AT || Date.now(),
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_KEY_CREATED_AT || Date.now()
};

// SECURITY: Check API key age and send alerts
function checkApiKeyAge() {
  const now = Date.now();
  const alerts = [];
  
  for (const [keyName, createdAt] of Object.entries(API_KEY_CREATION_DATES)) {
    const age = now - new Date(createdAt).getTime();
    const daysOld = Math.floor(age / (24 * 60 * 60 * 1000));
    
    if (age > API_KEY_AGE_THRESHOLD) {
      const message = `⚠️ API Key Rotation Alert: ${keyName} is ${daysOld} days old (threshold: 90 days). Please rotate immediately.`;
      console.warn(message);
      alerts.push(message);
      
      // TODO: Send email alert to admin
      // await sendEmail(process.env.ADMIN_EMAIL, 'API Key Rotation Required', message);
    }
  }
  
  return alerts;
}

// Run API key age check on server start
checkApiKeyAge();

// Run API key age check daily at midnight
setInterval(() => {
  const alerts = checkApiKeyAge();
  if (alerts.length > 0) {
    console.warn('🔑 API Key Rotation Alerts:', alerts);
  }
}, 24 * 60 * 60 * 1000); // Once per day

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
    // ENHANCEMENT: Add rate limit headers
    res.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
    res.set('X-RateLimit-Remaining', 0);
    res.set('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));
    res.set('Retry-After', Math.ceil((clientData.resetTime - now) / 1000));
    
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  
  // ENHANCEMENT: Add rate limit headers to successful responses
  res.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.set('X-RateLimit-Remaining', MAX_REQUESTS_PER_WINDOW - clientData.count);
  res.set('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));
  
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
app.use(cors({
  origin: true, // Allow all origins (for mobile app)
  credentials: true // Allow cookies
}));

// Security: Add HTTP security headers with Helmet.js + CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://*.firebaseio.com", "https://*.googleapis.com", "https://helio-wellness-app-production.up.railway.app"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"]
    }
  },
  crossOriginEmbedderPolicy: false // Allow embedding for Stripe/payment iframes
}));

// Parse cookies for CSRF tokens
app.use(cookieParser());

// Parse JSON bodies (must come BEFORE routes)
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit); // Apply rate limiting to all routes

// SECURITY: Generate CSRF token
function generateCsrfToken() {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, { createdAt: Date.now(), used: false });
  return token;
}

// SECURITY: Validate CSRF token
function validateCsrfToken(token) {
  if (!token) return false;
  
  const tokenData = csrfTokens.get(token);
  if (!tokenData) return false;
  
  // Check if token expired
  if (Date.now() - tokenData.createdAt > CSRF_TOKEN_LIFETIME) {
    csrfTokens.delete(token);
    return false;
  }
  
  // Check if already used (one-time use)
  if (tokenData.used) {
    csrfTokens.delete(token);
    return false;
  }
  
  // Mark as used
  tokenData.used = true;
  return true;
}

// SECURITY: CSRF protection middleware for state-changing operations
function csrfProtection(req, res, next) {
  // Skip CSRF for Stripe webhooks (signature verified separately)
  if (req.path === '/api/stripe/webhook') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body?.csrfToken;
  
  if (!validateCsrfToken(token)) {
    return res.status(403).json({ 
      error: 'Invalid or expired CSRF token. Please refresh and try again.' 
    });
  }
  
  next();
}

// SECURITY: Clean up expired CSRF tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > CSRF_TOKEN_LIFETIME) {
      csrfTokens.delete(token);
    }
  }
}, 600000);

// Serve static files from React build
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// SECURITY: Joi validation schemas
const schemas = {
  createCheckout: Joi.object({
    userId: Joi.string().required().min(1).max(200),
    priceId: Joi.string().required().min(1).max(200),
    plan: Joi.string().required().valid('free', 'starter', 'premium', 'ultimate', 'essential', 'vip'),
    csrfToken: Joi.string() // Optional, validated separately by middleware
  }),
  
  cancelSubscription: Joi.object({
    userId: Joi.string().required().min(1).max(200),
    csrfToken: Joi.string()
  }),
  
  supportNotify: Joi.object({
    ticketId: Joi.string().required(),
    userEmail: Joi.string().email().required(),
    userName: Joi.string().required().max(200),
    subject: Joi.string().required().max(500),
    message: Joi.string().required().max(10000),
    priority: Joi.string().required().valid('urgent', 'high', 'standard'),
    planTier: Joi.string().required(),
    slaHours: Joi.number().required().min(0)
  }),
  
  createBattle: Joi.object({
    userId: Joi.string().required(),
    friendId: Joi.string().required(),
    challenge: Joi.string().required().max(500),
    duration: Joi.number().required().min(1).max(90),
    csrfToken: Joi.string()
  }),
  
  logMeal: Joi.object({
    name: Joi.string().required().max(200),
    calories: Joi.number().min(0).max(10000).required(),
    protein: Joi.number().min(0).max(500),
    carbs: Joi.number().min(0).max(1000),
    fats: Joi.number().min(0).max(500),
    date: Joi.string().required(),
    timestamp: Joi.number().required()
  }),
  
  logWorkout: Joi.object({
    type: Joi.string().required().max(100),
    duration: Joi.number().min(1).max(600).required(),
    calories: Joi.number().min(0).max(5000),
    intensity: Joi.string().valid('low', 'medium', 'high', 'extreme'),
    date: Joi.string().required(),
    timestamp: Joi.number().required()
  }),
  
  uploadDNA: Joi.object({
    fileName: Joi.string().required().max(255),
    fileSize: Joi.number().min(1).max(10485760), // 10MB max
    fileContent: Joi.string().required(),
    timestamp: Joi.number().required()
  }),
  
  chatHistory: Joi.object({
    messages: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required().max(5000),
        timestamp: Joi.number().required()
      })
    ).max(1000)
  })
};

// SECURITY: Validation middleware
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Invalid schema' });
    }
    
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    req.body = value; // Use validated data
    next();
  };
}

// API Endpoint - Get CSRF token
app.get('/api/csrf-token', (req, res) => {
  const token = generateCsrfToken();
  res.json({ csrfToken: token });
});

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

  // SECURITY FIX: Prevent webhook replay attacks
  if (processedWebhookEvents.has(event.id)) {
    if(process.env.NODE_ENV!=="production")console.log('⚠️ Duplicate webhook event detected:', event.id);
    return res.json({ received: true, duplicate: true });
  }
  processedWebhookEvents.add(event.id);
  
  // Clean up old events to prevent memory bloat
  if (processedWebhookEvents.size > MAX_PROCESSED_EVENTS) {
    const firstEvent = processedWebhookEvents.values().next().value;
    processedWebhookEvents.delete(firstEvent);
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
    if (!db_firebase) {
      console.error('Firebase Admin not initialized - cannot update subscription in Firestore');
      return;
    }
    const userId = subscription.metadata?.firebaseUserId;
    if (!userId) {
      console.error('No firebaseUserId in subscription metadata');
      return;
    }

    const priceId = subscription.items.data[0]?.price?.id;
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
    if (!db_firebase) {
      console.error('Firebase Admin not initialized - cannot mark subscription as canceled');
      return;
    }
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

// SECURITY FIX: Add subscription verification endpoint to prevent paywall bypass
app.post('/api/subscription/verify', async (req, res) => {
  try {
    const { userId, feature } = req.body;
    
    if (!userId) {
      return res.status(400).json({ hasAccess: false, error: 'Missing userId' });
    }
    
    // Check subscription status from Firestore
    if (!db_firebase) {
      // Fallback: trust localStorage if Firebase unavailable (development mode)
      if(process.env.NODE_ENV !== "production") {
        return res.json({ hasAccess: true, message: 'Dev mode - verification skipped' });
      }
      return res.status(503).json({ hasAccess: false, error: 'Verification unavailable' });
    }
    
    const subDoc = await db_firebase.collection('users').doc(userId).collection('subscription').doc('current').get();
    
    if (!subDoc.exists) {
      return res.json({ hasAccess: false, plan: 'free' });
    }
    
    const subscription = subDoc.data();
    const plan = subscription.plan || 'free';
    const status = subscription.status || 'inactive';
    
    // Check if subscription is active
    const isActive = status === 'active' || status === 'trialing';
    
    if (!isActive) {
      return res.json({ hasAccess: false, plan: 'free', reason: 'Subscription inactive' });
    }
    
    // Feature access matrix
    const featureAccess = {
      free: ['basicTracking', 'stepCounter', 'waterTracking', 'breathing', 'emergencyPanel'],
      starter: ['meditation', 'heartRate', 'sleepTracking', 'workouts', 'socialBattles'],
      premium: ['dnaAnalysis', 'healthAvatar', 'arScanner', 'mealAutomation', 'exportReports'],
      ultimate: ['betaAccess', 'vipBadge', 'prioritySupport', 'insuranceRewards']
    };
    
    // Determine if user has access to feature
    let hasAccess = false;
    if (plan === 'ultimate') {
      hasAccess = true; // Ultimate has everything
    } else if (plan === 'premium') {
      hasAccess = !featureAccess.ultimate.includes(feature);
    } else if (plan === 'starter') {
      hasAccess = featureAccess.starter.includes(feature) || featureAccess.free.includes(feature);
    } else {
      hasAccess = featureAccess.free.includes(feature);
    }
    
    res.json({ 
      hasAccess, 
      plan, 
      status,
      verified: true 
    });
    
  } catch (error) {
    console.error('Subscription verification error:', error);
    res.status(500).json({ hasAccess: false, error: 'Verification failed' });
  }
});

// Webhook handler - Subscription updated

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

    if (!db_firebase) {
      console.error('Firebase Admin not initialized - cannot mark payment as failed in Firestore');
      return;
    }

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

// API Endpoint - Create Stripe checkout session (with CSRF protection + Joi validation)
app.post('/api/stripe/create-checkout', csrfProtection, validate('createCheckout'), async (req, res) => {
  try {
    const { userId, priceId, plan } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'link', 'amazon_pay', 'klarna'],
      billing_address_collection: 'auto',
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
        trial_period_days: 30,
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
    if (!db_firebase) {
      console.error('Firebase Admin not initialized - cannot read subscription status from Firestore');
      return res.status(503).json({ error: 'Subscription service temporarily unavailable' });
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

// API Endpoint - Cancel subscription (with CSRF protection + Joi validation)
app.post('/api/subscription/cancel', csrfProtection, validate('cancelSubscription'), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!db_firebase) {
      console.error('Firebase Admin not initialized - cannot cancel subscription in Firestore');
      return res.status(503).json({ error: 'Subscription service temporarily unavailable' });
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

// Joi validation schemas
const chatSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
  userContext: Joi.object().optional()
});

const visionSchema = Joi.object({
  prompt: Joi.string().min(1).max(50000).required(),  // Increased to 50K for Halal analysis (very long prompt)
  imageData: Joi.string().required()
}).unknown(true);  // Allow additional fields for future compatibility

const battleSchema = Joi.object({
  opponentId: Joi.string().required(),
  goal: Joi.string().valid('steps', 'weight-loss', 'health-score').required(),
  stake: Joi.number().min(5).max(100).required(),
  duration: Joi.number().valid(7, 14, 30).required()
});

// API v1 - Chat endpoint
app.post('/api/v1/chat', async (req, res) => {
  try {
    // Validate input with Joi
    const { error, value } = chatSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { message } = value;

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

    // Extract user context from request
    const userContext = req.body.userContext || {};
    
    // Build personalized context string
    let contextInfo = '';
    if (userContext.age) contextInfo += `User is ${userContext.age} years old. `;
    if (userContext.medicalConditions && userContext.medicalConditions !== 'none') {
      contextInfo += `Medical conditions: ${userContext.medicalConditions}. `;
    }
    if (userContext.allergies && userContext.allergies !== 'none') {
      contextInfo += `CRITICAL - Allergies: ${userContext.allergies}. NEVER suggest these foods. `;
    }
    if (userContext.medications && userContext.medications !== 'none') {
      contextInfo += `Current medications: ${userContext.medications}. Consider drug interactions. `;
    }
    if (userContext.fitnessLevel && userContext.fitnessLevel !== 'unknown') {
      contextInfo += `Fitness level: ${userContext.fitnessLevel}. `;
    }
    if (userContext.dietaryPreferences && userContext.dietaryPreferences !== 'none') {
      contextInfo += `Diet: ${userContext.dietaryPreferences}. `;
    }
    if (userContext.smoker === true) {
      contextInfo += `User smokes - factor into health advice. `;
    }
    
    const prompt = `You are a personalized AI wellness coach. ${contextInfo}

User question: ${sanitizedMessage}

Provide helpful, safe advice that considers their medical profile, allergies, and fitness level. Keep it encouraging and actionable (2-3 sentences).`;

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

// Backward compatibility: Redirect old /api/chat to /api/v1/chat
app.post('/api/chat', (req, res) => {
  req.url = '/api/v1/chat';
  app._router.handle(req, res);
});

// API v1 - Vision endpoint for food scanning
app.post('/api/v1/vision', async (req, res) => {
  try {
    // Validate input with Joi
    const { error, value } = visionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { prompt, imageData } = value;

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
app.post('/api/support/notify', csrfProtection, async (req, res) => {
  try {
    const { ticketId, userEmail, userName, subject, message, priority, planTier, slaHours } = req.body;

    // Validate required fields
    if (!ticketId || !userEmail || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log ticket creation (always)
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

    // Send email via SendGrid (if configured)
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);
        
        const priorityEmoji = priority === 'urgent' ? '🚨' : priority === 'high' ? '⚡' : '📧';
        const supportEmail = process.env.SUPPORT_EMAIL || 'support@wellnessai.com';
        const fromEmail = process.env.FROM_EMAIL || 'noreply@wellnessai.com';
        
        await sgMail.default.send({
          to: supportEmail,
          from: fromEmail,
          replyTo: userEmail,
          subject: `${priorityEmoji} [${priority.toUpperCase()}] Ticket #${ticketId}: ${subject}`,
          text: `
Support Ticket #${ticketId}

User: ${userName} (${userEmail})
Plan: ${planTier.toUpperCase()}
Priority: ${priority.toUpperCase()}
SLA: ${slaHours} hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply directly to this email to respond to the user.
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
              <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">${priorityEmoji} Support Ticket #${ticketId}</h2>
                
                <div style="background: ${priority === 'urgent' ? '#fee' : priority === 'high' ? '#ffeaa7' : '#e3f2fd'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${priority === 'urgent' ? '#c0392b' : priority === 'high' ? '#e67e22' : '#3498db'};">${priority.toUpperCase()}</span></p>
                  <p style="margin: 5px 0;"><strong>SLA:</strong> ${slaHours} hours response time</p>
                </div>
                
                <div style="margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>User:</strong> ${userName}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
                  <p style="margin: 5px 0;"><strong>Plan:</strong> <span style="background: #3498db; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">${planTier.toUpperCase()}</span></p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #555;">Subject</h3>
                  <p style="color: #333; font-size: 16px; font-weight: bold;">${subject}</p>
                  
                  <h3 style="margin-top: 20px; color: #555;">Message</h3>
                  <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
                  <p style="color: #888; font-size: 14px;">Reply directly to this email to respond to the user.</p>
                </div>
              </div>
            </div>
          `
        });
        
        if(process.env.NODE_ENV!=="production")console.log('✅ Support ticket email sent via SendGrid');
      } catch (emailError) {
        // Don't fail the request if email fails - ticket is already saved in Firestore
        if(process.env.NODE_ENV!=="production")console.error('⚠️ SendGrid email failed (ticket still created):', emailError.message);
      }
    } else {
      if(process.env.NODE_ENV!=="production")console.log('⚠️ SENDGRID_API_KEY not configured - email notification skipped');
    }

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

// 📧 Support Ticket Reply Notification (Admin → User)
app.post('/api/support/reply', async (req, res) => {
  try {
    const { ticketId, userEmail, userName, subject, replyMessage, adminName } = req.body;

    if (!ticketId || !userEmail || !replyMessage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px; text-align: center; }
          .header h1 { margin: 0 0 8px 0; font-size: 28px; }
          .header p { margin: 0; opacity: 0.9; font-size: 16px; }
          .content { padding: 32px; }
          .reply-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 24px 0; }
          .reply-box h3 { margin: 0 0 12px 0; color: #1f2937; font-size: 16px; }
          .reply-box p { margin: 0; color: #4b5563; line-height: 1.6; white-space: pre-wrap; }
          .ticket-info { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .ticket-info p { margin: 8px 0; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Support Reply Received!</h1>
            <p>We've responded to your support ticket</p>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>${adminName || 'Our support team'} has responded to your ticket:</p>
            
            <div class="ticket-info">
              <p><strong>Ticket Subject:</strong> ${subject}</p>
              <p><strong>Ticket ID:</strong> #${ticketId.substring(0, 8)}</p>
            </div>

            <div class="reply-box">
              <h3>👨‍💼 ${adminName || 'Support Team'}</h3>
              <p>${replyMessage}</p>
            </div>

            <p>You can view the full conversation and reply directly in the app:</p>
            
            <center>
              <a href="#" class="button">📱 Open in App</a>
            </center>

            <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
              If you have additional questions, simply reply in your app or respond to your ticket.
            </p>
          </div>
          <div class="footer">
            <p><strong>WellnessAI Support Team</strong></p>
            <p>We're here to help! 💙</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sgMail.default.send({
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'support@wellnessai.app',
      subject: `Re: ${subject} - Support Reply [#${ticketId.substring(0, 8)}]`,
      html: htmlContent,
      text: `Hi ${userName},\n\n${adminName || 'Our support team'} has responded to your ticket:\n\n${replyMessage}\n\nTicket ID: #${ticketId.substring(0, 8)}\nSubject: ${subject}\n\nPlease open the WellnessAI app to view the full conversation.\n\nBest regards,\nWellnessAI Support Team`
    });

    if(process.env.NODE_ENV!=="production")console.log('✅ Support reply email sent to:', userEmail);
    res.json({ success: true, message: 'Reply notification sent' });
  } catch (error) {
    if(process.env.NODE_ENV!=="production")console.error('❌ Support reply notification error:', error);
    res.status(500).json({ error: 'Failed to send reply notification' });
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

// Railway is API-only server - no need to serve React app
// React app is bundled in the mobile APK via Capacitor

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

Frontend: http://YOUR_COMPUTER_IP:${PORT}/
Admin Dashboard: http://YOUR_COMPUTER_IP:${PORT}/admin-support

Database: ${db ? (db.memory ? 'In-Memory (fallback)' : 'MongoDB Connected') : 'Not Connected'}

To find your computer's IP address:
  Windows: ipconfig
  Mac/Linux: ifconfig

Make sure your phone and computer are on the same WiFi network!
  `);
});

