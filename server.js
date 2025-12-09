// Secure Express server with rate limiting
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;

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
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per IP

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

// User Data Deletion (GDPR)
app.delete('/api/user/delete', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
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

// Stripe Webhook Endpoint
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

    if (!STRIPE_WEBHOOK_SECRET) {
      if(process.env.NODE_ENV!=="production")console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    // In production, verify signature with Stripe
    // const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

    const event = req.body;

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

Database: ${db ? (db.memory ? 'In-Memory (fallback)' : 'MongoDB Connected') : 'Not Connected'}

To find your computer's IP address:
  Windows: ipconfig
  Mac/Linux: ifconfig

Make sure your phone and computer are on the same WiFi network!
  `);
});

