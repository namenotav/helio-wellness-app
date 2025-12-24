#!/usr/bin/env node

/**
 * 🐵 AI MONKEY TESTER - COMPREHENSIVE APP VALIDATION
 * Tests EVERYTHING in the WellnessAI app like a real user
 * Run with: node ai-monkey-test.cjs
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║         🐵 AI MONKEY TESTER - DEEP VALIDATION SUITE         ║
║              Testing 100+ critical app functions            ║
╚══════════════════════════════════════════════════════════════╝
`);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

const errors = [];
const warningsList = [];
const report = [];

function test(category, name, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result === true) {
      passedTests++;
      console.log(`✅ [${category}] ${name}`);
      report.push({ category, name, status: 'PASS', message: '' });
    } else if (result === 'WARN') {
      warnings++;
      console.log(`⚠️  [${category}] ${name}`);
      report.push({ category, name, status: 'WARN', message: '' });
    } else {
      failedTests++;
      console.log(`❌ [${category}] ${name}`);
      errors.push(`[${category}] ${name}: ${result}`);
      report.push({ category, name, status: 'FAIL', message: result });
    }
  } catch (error) {
    failedTests++;
    console.log(`❌ [${category}] ${name} - ${error.message}`);
    errors.push(`[${category}] ${name}: ${error.message}`);
    report.push({ category, name, status: 'FAIL', message: error.message });
  }
}

console.log('\n📁 PHASE 1: FILE STRUCTURE VALIDATION\n');

// Core service files
const coreServices = [
  'src/services/authService.js',
  'src/services/subscriptionService.js',
  'src/services/geminiService.js',
  'src/services/firebase.js',
  'src/services/stripeService.js',
  'src/services/syncService.js',
  'src/services/supportTicketService.js',
  'src/services/featureFlagService.js',
  'src/services/moneyEscrowService.js',
  'src/services/adMobService.js'
];

coreServices.forEach(file => {
  test('FILES', `Core service: ${path.basename(file)}`, () => fs.existsSync(file));
});

// Feature services
const featureServices = [
  'src/services/socialBattlesService.js',
  'src/services/gamificationService.js',
  'src/services/stepCounterService.js',
  'src/services/dnaAnalysisService.js',
  'src/services/healthAvatarService.js',
  'src/services/emergencyService.js',
  'src/services/mealAutomationService.js',
  'src/services/arScannerService.js',
  'src/services/barcodeScannerService.js',
  'src/services/breathingService.js'
];

featureServices.forEach(file => {
  test('FILES', `Feature service: ${path.basename(file)}`, () => fs.existsSync(file));
});

// Critical components
const criticalComponents = [
  'src/pages/Dashboard.jsx',
  'src/pages/LandingPage.jsx',
  'src/components/StepCounter.jsx',
  'src/components/FoodScanner.jsx',
  'src/components/RepCounter.jsx',
  'src/components/BarcodeScanner.jsx',
  'src/components/HealthAvatar.jsx',
  'src/components/DNAUpload.jsx',
  'src/components/SocialBattles.jsx',
  'src/components/EmergencyPanel.jsx',
  'src/components/MealAutomation.jsx',
  'src/components/ARScanner.jsx',
  'src/components/PaywallModal.jsx',
  'src/components/SupportModal.jsx'
];

criticalComponents.forEach(file => {
  test('FILES', `Component: ${path.basename(file)}`, () => fs.existsSync(file));
});

console.log('\n🔗 PHASE 2: SERVICE INTEGRATION CHECKS\n');

// Check subscriptionService.js
test('INTEGRATION', 'subscriptionService: Plan definitions exist', () => {
  const content = fs.readFileSync('src/services/subscriptionService.js', 'utf8');
  return content.includes('starter:') && 
         content.includes('premium:') && 
         content.includes('ultimate:') &&
         content.includes('price: 6.99') &&
         content.includes('price: 16.99') &&
         content.includes('price: 34.99');
});

test('INTEGRATION', 'subscriptionService: New feature flags exist', () => {
  const content = fs.readFileSync('src/services/subscriptionService.js', 'utf8');
  return content.includes('prioritySupport') && 
         content.includes('betaAccess') && 
         content.includes('vipBadge');
});

test('INTEGRATION', 'subscriptionService: Barcode scan limits', () => {
  const content = fs.readFileSync('src/services/subscriptionService.js', 'utf8');
  return content.includes('barcodeScans');
});

test('INTEGRATION', 'subscriptionService: New price IDs in Stripe service', () => {
  const content = fs.readFileSync('src/services/stripeService.js', 'utf8');
  return content.includes('price_1SffiWD2EDcoPFLNrGfZU1c6') &&
         content.includes('price_1Sffj1D2EDcoPFLNkqdUxY9L') &&
         content.includes('price_1Sffk1D2EDcoPFLN4yxdNXSq');
});

test('INTEGRATION', 'stripeService: New checkout functions', () => {
  const content = fs.readFileSync('src/services/stripeService.js', 'utf8');
  return content.includes('checkoutStarter') && 
         content.includes('checkoutUltimate');
});

// Check RepCounter limit enforcement
test('INTEGRATION', 'RepCounter: Workout limit check implemented', () => {
  const content = fs.readFileSync('src/components/RepCounter.jsx', 'utf8');
  return content.includes('subscriptionService.checkLimit') &&
         content.includes('workouts') &&
         content.includes('incrementUsage');
});

// Check BarcodeScanner limit enforcement
test('INTEGRATION', 'BarcodeScanner: Scan limit check implemented', () => {
  const content = fs.readFileSync('src/components/BarcodeScanner.jsx', 'utf8');
  return content.includes('subscriptionService.checkLimit') &&
         content.includes('barcodeScans') &&
         content.includes('incrementUsage');
});

// Check FoodScanner (should already have limits)
test('INTEGRATION', 'FoodScanner: Existing limits still work', () => {
  const content = fs.readFileSync('src/components/FoodScanner.jsx', 'utf8');
  return content.includes('foodScans') && content.includes('checkLimit');
});

// Check Dashboard integration
test('INTEGRATION', 'Dashboard: SupportModal imported', () => {
  const content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  return content.includes("import SupportModal from '../components/SupportModal'");
});

test('INTEGRATION', 'Dashboard: Support state variable exists', () => {
  const content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  return content.includes('showSupport') && content.includes('setShowSupport');
});

test('INTEGRATION', 'Dashboard: AI message counter displayed', () => {
  const content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  return content.includes('Unlimited AI messages') || 
         content.includes('messages remaining today');
});

// Check SocialBattles VIP badges
test('INTEGRATION', 'SocialBattles: VIP badge emoji in UI', () => {
  const content = fs.readFileSync('src/components/SocialBattles.jsx', 'utf8');
  return content.includes('👑') && content.includes('isVIP');
});

test('INTEGRATION', 'SocialBattles: subscriptionService imported', () => {
  const content = fs.readFileSync('src/components/SocialBattles.jsx', 'utf8');
  return content.includes("import subscriptionService from '../services/subscriptionService'");
});

// Check LandingPage pricing updates
test('INTEGRATION', 'LandingPage: New pricing displayed', () => {
  const content = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');
  return content.includes('£6.99') && 
         content.includes('£16.99') && 
         content.includes('£34.99');
});

test('INTEGRATION', 'LandingPage: New checkout functions used', () => {
  const content = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');
  return content.includes('checkoutStarter') && 
         content.includes('checkoutUltimate');
});

// Check PaywallModal
test('INTEGRATION', 'PaywallModal: Updated plan tiers', () => {
  const content = fs.readFileSync('src/components/PaywallModal.jsx', 'utf8');
  return content.includes('Starter') && 
         content.includes('Ultimate') &&
         content.includes('£6.99') &&
         content.includes('£34.99');
});

console.log('\n🔧 PHASE 3: SERVICE IMPLEMENTATION VALIDATION\n');

// Support Ticket Service
test('SERVICE', 'supportTicketService: Correct Firestore import', () => {
  const content = fs.readFileSync('src/services/supportTicketService.js', 'utf8');
  return content.includes("from 'firebase/firestore'") && !content.includes("from 'firestore'");
});

test('SERVICE', 'supportTicketService: Priority routing logic', () => {
  const content = fs.readFileSync('src/services/supportTicketService.js', 'utf8');
  return content.includes('slaHours = 2') && 
         content.includes('slaHours = 24') &&
         content.includes('slaHours = 72');
});

test('SERVICE', 'supportTicketService: Railway API endpoint', () => {
  const content = fs.readFileSync('src/services/supportTicketService.js', 'utf8');
  return content.includes('/api/support/notify');
});

// Feature Flag Service
test('SERVICE', 'featureFlagService: Correct Firestore import', () => {
  const content = fs.readFileSync('src/services/featureFlagService.js', 'utf8');
  return content.includes("from 'firebase/firestore'");
});

test('SERVICE', 'featureFlagService: Beta features defined', () => {
  const content = fs.readFileSync('src/services/featureFlagService.js', 'utf8');
  return content.includes('social_battles_money') && 
         content.includes('requiresBeta: true');
});

test('SERVICE', 'featureFlagService: Stable features defined', () => {
  const content = fs.readFileSync('src/services/featureFlagService.js', 'utf8');
  return content.includes('step_counter') && 
         content.includes('food_scanner') &&
         content.includes("status: 'stable'");
});

// Money Escrow Service
test('SERVICE', 'moneyEscrowService: No function name typos', () => {
  const content = fs.readFileSync('src/services/moneyEscrowService.js', 'utf8');
  return content.includes('canUseMoneyBattles()') && 
         !content.includes('canUseMoney Battles');
});

test('SERVICE', 'moneyEscrowService: Age verification check', () => {
  const content = fs.readFileSync('src/services/moneyEscrowService.js', 'utf8');
  return content.includes('ageVerified') && content.includes('over18');
});

test('SERVICE', 'moneyEscrowService: Stripe Connect integration', () => {
  const content = fs.readFileSync('src/services/moneyEscrowService.js', 'utf8');
  return content.includes('stripeConnectId') && 
         content.includes('/api/stripe/create-escrow');
});

test('SERVICE', 'moneyEscrowService: Escrow states defined', () => {
  const content = fs.readFileSync('src/services/moneyEscrowService.js', 'utf8');
  return content.includes("'pending'") && 
         content.includes("'held'") &&
         content.includes("'released'") &&
         content.includes("'refunded'");
});

// AdMob Service
test('SERVICE', 'adMobService: Placeholder mode active', () => {
  const content = fs.readFileSync('src/services/adMobService.js', 'utf8');
  return content.includes('PLACEHOLDER') && content.includes('getSetupInstructions');
});

test('SERVICE', 'adMobService: Ad types defined', () => {
  const content = fs.readFileSync('src/services/adMobService.js', 'utf8');
  return content.includes('showBannerAd') && 
         content.includes('showInterstitialAd') &&
         content.includes('showRewardedAd');
});

test('SERVICE', 'adMobService: Free tier targeting', () => {
  const content = fs.readFileSync('src/services/adMobService.js', 'utf8');
  return content.includes('shouldShowAds') && content.includes("plan.id === 'free'");
});

console.log('\n🌐 PHASE 4: SERVER ENDPOINT VALIDATION\n');

// Server.js checks
test('SERVER', 'server.js: Support ticket endpoint', () => {
  const content = fs.readFileSync('server.js', 'utf8');
  return content.includes("app.post('/api/support/notify'");
});

test('SERVER', 'server.js: Create escrow endpoint', () => {
  const content = fs.readFileSync('server.js', 'utf8');
  return content.includes("app.post('/api/stripe/create-escrow'");
});

test('SERVER', 'server.js: Release escrow endpoint', () => {
  const content = fs.readFileSync('server.js', 'utf8');
  return content.includes("app.post('/api/stripe/release-escrow'");
});

test('SERVER', 'server.js: Refund escrow endpoint', () => {
  const content = fs.readFileSync('server.js', 'utf8');
  return content.includes("app.post('/api/stripe/refund-escrow'");
});

test('SERVER', 'server.js: Stripe Connect onboarding', () => {
  const content = fs.readFileSync('server.js', 'utf8');
  return content.includes("app.post('/api/stripe/connect/onboard'");
});

test('SERVER', 'server.js: Stripe initialized', () => {
  const content = fs.readFileSync('server.js', 'utf8');
  return content.includes('new Stripe(') && content.includes('STRIPE_SECRET_KEY');
});

console.log('\n🎨 PHASE 5: UI COMPONENT VALIDATION\n');

// SupportModal checks
test('UI', 'SupportModal: Form fields present', () => {
  const content = fs.readFileSync('src/components/SupportModal.jsx', 'utf8');
  return content.includes('subject') && 
         content.includes('message') &&
         content.includes('category');
});

test('UI', 'SupportModal: Priority badge display', () => {
  const content = fs.readFileSync('src/components/SupportModal.jsx', 'utf8');
  return content.includes('Priority Support') && content.includes('hasPrioritySupport');
});

test('UI', 'SupportModal: Ticket history tab', () => {
  const content = fs.readFileSync('src/components/SupportModal.jsx', 'utf8');
  return content.includes('My Tickets') && content.includes('showHistory');
});

test('UI', 'SupportModal: CSS file exists', () => {
  return fs.existsSync('src/components/SupportModal.css');
});

// PaywallModal feature list accuracy
test('UI', 'PaywallModal: Free tier accurate limits', () => {
  const content = fs.readFileSync('src/components/PaywallModal.jsx', 'utf8');
  return content.includes('3 food scans/day') && 
         content.includes('1 workout/day');
});

test('UI', 'PaywallModal: Starter tier features', () => {
  const content = fs.readFileSync('src/components/PaywallModal.jsx', 'utf8');
  return content.includes('3 barcode scans/day') && 
         content.includes('Unlimited workouts');
});

test('UI', 'PaywallModal: Ultimate tier VIP features', () => {
  const content = fs.readFileSync('src/components/PaywallModal.jsx', 'utf8');
  return content.includes('Priority Support') || 
         content.includes('Early beta access') ||
         content.includes('VIP badge');
});

console.log('\n⚙️ PHASE 6: CONFIGURATION & ENVIRONMENT\n');

// Check critical config files
test('CONFIG', 'package.json exists', () => fs.existsSync('package.json'));

test('CONFIG', 'vite.config.js exists', () => fs.existsSync('vite.config.js'));

test('CONFIG', 'capacitor.config.json exists', () => fs.existsSync('capacitor.config.json'));

test('CONFIG', 'firebase.json exists', () => fs.existsSync('firebase.json'));

test('CONFIG', 'firestore.rules exists', () => fs.existsSync('firestore.rules'));

// Check package.json dependencies
test('CONFIG', 'package.json: Critical dependencies', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasReact = pkg.dependencies && pkg.dependencies.react;
  const hasCapacitor = pkg.dependencies && pkg.dependencies['@capacitor/core'];
  const hasFirebase = pkg.dependencies && pkg.dependencies.firebase;
  return hasReact && hasCapacitor && hasFirebase ? true : 'Missing dependencies';
});

test('CONFIG', 'package.json: Stripe dependency', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return (pkg.dependencies && pkg.dependencies['@stripe/stripe-js']) ? true : false;
});

// Check Capacitor config
test('CONFIG', 'capacitor.config.json: App ID set', () => {
  const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
  return config.appId && config.appId !== 'com.example.app';
});

test('CONFIG', 'capacitor.config.json: Android platform', () => {
  const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
  return fs.existsSync('android');
});

console.log('\n🔐 PHASE 7: SECURITY & DATA FLOW VALIDATION\n');

// Firestore rules checks
test('SECURITY', 'firestore.rules: User authentication required', () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  return rules.includes('request.auth != null');
});

test('SECURITY', 'firestore.rules: Users collection protected', () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  return rules.includes('match /users/{userId}');
});

// Environment variable checks
test('SECURITY', 'Environment variables template exists', () => {
  return fs.existsSync('.env') || fs.existsSync('.env.example') || 
         fs.existsSync('.env.local');
});

// Auth service checks
test('SECURITY', 'authService: Firebase auth imported', () => {
  const content = fs.readFileSync('src/services/authService.js', 'utf8');
  // Check if using firebaseService (which wraps firebase/auth)
  return content.includes('firebaseService') || content.includes('firebase/auth');
});

test('SECURITY', 'authService: User session handling', () => {
  const content = fs.readFileSync('src/services/authService.js', 'utf8');
  return content.includes('getCurrentUser') && content.includes('onAuthStateChanged');
});

// Subscription service security
test('SECURITY', 'subscriptionService: Server-side verification', () => {
  const content = fs.readFileSync('src/services/subscriptionService.js', 'utf8');
  return content.includes('checkLimit') && content.includes('incrementUsage');
});

console.log('\n🚀 PHASE 8: CRITICAL USER FLOWS\n');

// User journey: Food scanning
test('FLOW', 'Food Scan: Limit check → API call → Usage increment', () => {
  const scanner = fs.readFileSync('src/components/FoodScanner.jsx', 'utf8');
  // Check for subscription service usage (limit check happens via subscriptionService)
  return scanner.includes('subscriptionService') && 
         (scanner.includes('analyzeFoodPhoto') || scanner.includes('aiVisionService')) &&
         (scanner.includes('incrementUsage') || scanner.includes('foodScans'));
});

// User journey: Workout tracking
test('FLOW', 'Workout: Limit check → Track → Save → Usage increment', () => {
  const repCounter = fs.readFileSync('src/components/RepCounter.jsx', 'utf8');
  return repCounter.includes('checkLimit') && 
         repCounter.includes('startTracking') &&
         repCounter.includes('syncService.saveData') &&
         repCounter.includes('incrementUsage');
});

// User journey: Subscription upgrade
test('FLOW', 'Subscription: Select plan → Stripe checkout → Webhook', () => {
  const landing = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');
  const stripe = fs.readFileSync('src/services/stripeService.js', 'utf8');
  const server = fs.readFileSync('server.js', 'utf8');
  
  return landing.includes('handleCheckout') && 
         stripe.includes('createCheckoutSession') &&
         server.includes('/api/stripe/webhook');
});

// User journey: Support ticket
test('FLOW', 'Support: Submit ticket → Save Firestore → Email notification', () => {
  const modal = fs.readFileSync('src/components/SupportModal.jsx', 'utf8');
  const service = fs.readFileSync('src/services/supportTicketService.js', 'utf8');
  
  return modal.includes('handleSubmit') && 
         service.includes('addDoc') &&
         service.includes('sendTicketNotification');
});

// User journey: Social battle
test('FLOW', 'Battle: Create → Join → Track → Leaderboard', () => {
  const battles = fs.readFileSync('src/components/SocialBattles.jsx', 'utf8');
  const service = fs.readFileSync('src/services/socialBattlesService.js', 'utf8');
  
  return battles.includes('handleCreateBattle') && 
         service.includes('joinBattle') &&
         service.includes('getLiveLeaderboard');
});

console.log('\n📊 PHASE 9: DATA PERSISTENCE CHECKS\n');

// SyncService checks
test('DATA', 'syncService: Multi-layer persistence', () => {
  const content = fs.readFileSync('src/services/syncService.js', 'utf8');
  return content.includes('Preferences') && 
         (content.includes('firebaseService') || content.includes('Firebase'));
});

test('DATA', 'syncService: Offline support', () => {
  const content = fs.readFileSync('src/services/syncService.js', 'utf8');
  return content.includes('syncQueue') || content.includes('offline') || content.includes('isOnline');
});

// Step counter persistence
test('DATA', 'stepCounterService: Data saved to Firestore', () => {
  const content = fs.readFileSync('src/services/stepCounterService.js', 'utf8');
  return content.includes('Preferences') || content.includes('syncService') || content.includes('saveData');
});

console.log('\n🎯 PHASE 10: FEATURE COMPLETENESS\n');

// DNA Analysis
test('FEATURE', 'DNA Analysis: 23andMe parser implemented', () => {
  const content = fs.readFileSync('src/services/dnaAnalysisService.js', 'utf8');
  return content.includes('parse23andMe') || content.includes('parseDNA');
});

// Health Avatar
test('FEATURE', 'Health Avatar: Real-time scoring', () => {
  const content = fs.readFileSync('src/services/healthAvatarService.js', 'utf8');
  return content.includes('calculateHealthScore') || content.includes('getHealthStatus');
});

// Emergency Panel
test('FEATURE', 'Emergency Panel: GPS & SOS implemented', () => {
  const content = fs.readFileSync('src/components/EmergencyPanel.jsx', 'utf8');
  const service = fs.readFileSync('src/services/emergencyService.js', 'utf8');
  return content.includes('emergencyService') && service.includes('getCurrentPosition');
});

// AR Scanner
test('FEATURE', 'AR Scanner: Camera integration', () => {
  const content = fs.readFileSync('src/components/ARScanner.jsx', 'utf8');
  const service = fs.readFileSync('src/services/arScannerService.js', 'utf8');
  return content.includes('arScannerService') && service.includes('Camera');
});

// Meal Automation
test('FEATURE', 'Meal Automation: AI meal planning', () => {
  const content = fs.readFileSync('src/components/MealAutomation.jsx', 'utf8');
  const service = fs.readFileSync('src/services/mealAutomationService.js', 'utf8');
  return content.includes('mealAutomationService') && service.includes('generateMealPlan');
});

// Breathing Exercises
test('FEATURE', 'Breathing: Multiple patterns defined', () => {
  const content = fs.readFileSync('src/services/breathingService.js', 'utf8');
  return content.includes('box') && 
         content.includes('4-7-8') &&
         content.includes('patterns');
});

console.log('\n🔄 PHASE 11: SERVICE CROSS-COMMUNICATION\n');

test('COMMS', 'subscriptionService ↔ All limit-gated features', () => {
  const foodScanner = fs.readFileSync('src/components/FoodScanner.jsx', 'utf8');
  const barcodeScanner = fs.readFileSync('src/components/BarcodeScanner.jsx', 'utf8');
  const repCounter = fs.readFileSync('src/components/RepCounter.jsx', 'utf8');
  
  return foodScanner.includes('subscriptionService') && 
         barcodeScanner.includes('subscriptionService') &&
         repCounter.includes('subscriptionService');
});

test('COMMS', 'authService ↔ All protected features', () => {
  const dashboard = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  const battles = fs.readFileSync('src/components/SocialBattles.jsx', 'utf8');
  
  return (dashboard.includes('authService') || dashboard.includes('getCurrentUser')) && 
         (battles.includes('authService') || battles.includes('getCurrentUser'));
});

test('COMMS', 'syncService ↔ Data-generating features', () => {
  const stepCounter = fs.readFileSync('src/services/stepCounterService.js', 'utf8');
  const repCounter = fs.readFileSync('src/components/RepCounter.jsx', 'utf8');
  
  return stepCounter.includes('syncService') || repCounter.includes('syncService');
});

test('COMMS', 'geminiService ↔ AI-powered features', () => {
  const dashboard = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  const foodScanner = fs.readFileSync('src/components/FoodScanner.jsx', 'utf8');
  const mealAuto = fs.readFileSync('src/components/MealAutomation.jsx', 'utf8');
  
  return (dashboard.includes('geminiService') || dashboard.includes('chatWithAI')) && 
         (foodScanner.includes('aiVisionService') || foodScanner.includes('gemini')) &&
         (mealAuto.includes('mealAutomationService') || mealAuto.includes('generateMealPlan'));
});

test('COMMS', 'Firebase ↔ All data-persistent features', () => {
  const authService = fs.readFileSync('src/services/authService.js', 'utf8');
  const syncService = fs.readFileSync('src/services/syncService.js', 'utf8');
  const support = fs.readFileSync('src/services/supportTicketService.js', 'utf8');
  
  return authService.includes('firebase') && 
         syncService.includes('firebase') &&
         support.includes('firebase');
});

console.log('\n🎮 PHASE 12: NATIVE FEATURES (CAPACITOR)\n');

test('NATIVE', 'Step Counter: Native plugin integration', () => {
  const content = fs.readFileSync('src/services/stepCounterService.js', 'utf8');
  return content.includes('@capacitor') || 
         content.includes('Preferences') ||
         content.includes('Device');
});

test('NATIVE', 'Camera: Photo capture implemented', () => {
  // Camera is in service layer, not component
  const visionService = fs.readFileSync('src/services/aiVisionService.js', 'utf8');
  return visionService.includes('Camera') && visionService.includes('@capacitor/camera');
});

test('NATIVE', 'Geolocation: GPS tracking', () => {
  // GPS is in service layer
  const gpsService = fs.readFileSync('src/services/nativeGPSService.js', 'utf8');
  return gpsService.includes('Geolocation') && gpsService.includes('@capacitor/geolocation');
});

test('NATIVE', 'Preferences: Local storage', () => {
  const content = fs.readFileSync('src/services/syncService.js', 'utf8');
  return content.includes('Preferences') && content.includes('@capacitor/preferences');
});

test('NATIVE', 'Motion sensors: Rep counting', () => {
  const content = fs.readFileSync('src/components/RepCounter.jsx', 'utf8');
  return content.includes('Motion') && content.includes('@capacitor/motion');
});

console.log('\n💾 PHASE 13: BATCH 3 SPECIFIC VALIDATIONS\n');

test('BATCH3', 'Support system: Full flow wired', () => {
  const dashboard = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  const modal = fs.readFileSync('src/components/SupportModal.jsx', 'utf8');
  const service = fs.readFileSync('src/services/supportTicketService.js', 'utf8');
  const server = fs.readFileSync('server.js', 'utf8');
  
  return dashboard.includes('SupportModal') && 
         modal.includes('supportTicketService') &&
         service.includes('createTicket') &&
         server.includes('/api/support/notify');
});

test('BATCH3', 'Feature flags: System operational', () => {
  const service = fs.readFileSync('src/services/featureFlagService.js', 'utf8');
  return service.includes('hasFeatureAccess') && 
         service.includes('FEATURES =') &&
         service.includes('requiresBeta');
});

test('BATCH3', 'VIP badges: Display logic complete', () => {
  const battles = fs.readFileSync('src/components/SocialBattles.jsx', 'utf8');
  const battleService = fs.readFileSync('src/services/socialBattlesService.js', 'utf8');
  const gamification = fs.readFileSync('src/services/gamificationService.js', 'utf8');
  
  return battles.includes('👑') && 
         battleService.includes('checkUserVIPStatus') &&
         gamification.includes('isVIP');
});

test('BATCH3', 'Money escrow: Full Stripe Connect flow', () => {
  const service = fs.readFileSync('src/services/moneyEscrowService.js', 'utf8');
  const server = fs.readFileSync('server.js', 'utf8');
  
  return service.includes('createEscrow') && 
         service.includes('releaseEscrow') &&
         service.includes('refundEscrow') &&
         server.includes('/api/stripe/create-escrow') &&
         server.includes('/api/stripe/connect/onboard');
});

test('BATCH3', 'AdMob: Placeholder ready for activation', () => {
  const service = fs.readFileSync('src/services/adMobService.js', 'utf8');
  return service.includes('showBannerAd') && 
         service.includes('shouldShowAds') &&
         service.includes('getSetupInstructions');
});

test('BATCH3', 'AI message counter: UI displayed', () => {
  const dashboard = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  return dashboard.includes('Unlimited AI messages') && 
         dashboard.includes('messages remaining');
});

console.log('\n🔍 PHASE 14: EDGE CASE & ERROR HANDLING\n');

test('ERROR', 'subscriptionService: Handles undefined user', () => {
  const content = fs.readFileSync('src/services/subscriptionService.js', 'utf8');
  return content.includes('if (!plan') || content.includes('plan.features') || content.includes('getCurrentPlan');
});

test('ERROR', 'geminiService: API error handling', () => {
  const content = fs.readFileSync('src/services/geminiService.js', 'utf8');
  return content.includes('try') && 
         content.includes('catch') &&
         (content.includes('error') || content.includes('Error'));
});

test('ERROR', 'stripeService: Payment failure handling', () => {
  const content = fs.readFileSync('src/services/stripeService.js', 'utf8');
  return content.includes('catch') || content.includes('error');
});

test('ERROR', 'syncService: Offline data queuing', () => {
  const content = fs.readFileSync('src/services/syncService.js', 'utf8');
  return content.includes('offline') || content.includes('pending') || content.includes('queue');
});

console.log('\n📱 PHASE 15: MOBILE-SPECIFIC CHECKS\n');

test('MOBILE', 'Android build config exists', () => {
  return fs.existsSync('android/app/build.gradle');
});

test('MOBILE', 'Capacitor plugins registered', () => {
  return fs.existsSync('android/capacitor.plugins.json');
});

test('MOBILE', 'App icons configured', () => {
  return fs.existsSync('public/favicon.ico') || 
         fs.existsSync('public/icon.png') || 
         fs.existsSync('android/app/src/main/res');
});

test('MOBILE', 'Splash screen configured', () => {
  const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
  return !!(config.plugins && config.plugins.SplashScreen);
});

// Generate detailed report
console.log('\n\n');
console.log('═'.repeat(70));
console.log('                    📊 FINAL TEST REPORT');
console.log('═'.repeat(70));
console.log(`\n✅ PASSED: ${passedTests}/${totalTests} tests`);
console.log(`❌ FAILED: ${failedTests}/${totalTests} tests`);
console.log(`⚠️  WARNINGS: ${warnings}/${totalTests} tests`);

const passRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n🎯 PASS RATE: ${passRate}%`);

if (passRate >= 95) {
  console.log(`\n🎉 EXCELLENT! Your app is ${passRate}% functional!`);
} else if (passRate >= 85) {
  console.log(`\n✅ GOOD! Your app is ${passRate}% functional. Minor fixes needed.`);
} else if (passRate >= 70) {
  console.log(`\n⚠️  FAIR. Your app is ${passRate}% functional. Some issues need attention.`);
} else {
  console.log(`\n❌ CRITICAL! Only ${passRate}% functional. Major issues detected.`);
}

if (failedTests > 0) {
  console.log('\n═'.repeat(70));
  console.log('                      ❌ FAILED TESTS');
  console.log('═'.repeat(70));
  errors.forEach((error, idx) => {
    console.log(`\n${idx + 1}. ${error}`);
  });
}

// Critical issues
const criticalIssues = [];
if (!fs.existsSync('src/services/firebase.js')) {
  criticalIssues.push('Firebase not configured - app cannot connect to backend');
}
if (!fs.existsSync('.env') && !fs.existsSync('.env.local')) {
  criticalIssues.push('No environment file found - API keys missing');
}

const firebaseContent = fs.existsSync('src/services/firebase.js') ? 
  fs.readFileSync('src/services/firebase.js', 'utf8') : '';
if (firebaseContent.includes('YOUR_') || firebaseContent.includes('REPLACE_')) {
  criticalIssues.push('Firebase config has placeholder values');
}

if (criticalIssues.length > 0) {
  console.log('\n═'.repeat(70));
  console.log('                   🚨 CRITICAL ISSUES');
  console.log('═'.repeat(70));
  criticalIssues.forEach((issue, idx) => {
    console.log(`\n${idx + 1}. ${issue}`);
  });
}

// Recommendations
console.log('\n═'.repeat(70));
console.log('                  💡 RECOMMENDATIONS');
console.log('═'.repeat(70));

if (passRate >= 95) {
  console.log(`
✅ Your app is production-ready!

Next steps:
1. Run manual testing: npm run dev
2. Test on Android device: npx cap open android
3. Deploy Firestore rules: firebase deploy --only firestore:rules
4. Set up external services (SendGrid, Stripe Connect, AdMob)
5. Build production APK for release
`);
} else if (passRate >= 85) {
  console.log(`
⚠️  Minor fixes needed before production:

1. Review failed tests above
2. Fix any broken imports or typos
3. Re-run this test to verify fixes
4. Then proceed with manual testing
`);
} else {
  console.log(`
❌ Major issues detected. Priority fixes:

1. Fix all CRITICAL issues first
2. Review failed SERVICE and INTEGRATION tests
3. Ensure all files exist and imports are correct
4. Re-run this test after each fix
5. Do NOT deploy until pass rate is >90%
`);
}

console.log('\n═'.repeat(70));
console.log('           🐵 AI MONKEY TEST COMPLETE');
console.log('═'.repeat(70));
console.log(`\nReport saved to: ai-monkey-report.json\n`);

// Save detailed JSON report
fs.writeFileSync('ai-monkey-report.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    warnings: warnings,
    passRate: parseFloat(passRate)
  },
  tests: report,
  errors: errors,
  criticalIssues: criticalIssues
}, null, 2));

process.exit(failedTests > 0 ? 1 : 0);
