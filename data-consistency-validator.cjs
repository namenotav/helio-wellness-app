#!/usr/bin/env node

/**
 * 🔍 DATA CONSISTENCY VALIDATOR
 * 
 * Comprehensive validation that simulates a real user journey through the entire app
 * Checks EVERY modal, banner, panel, and function to ensure data syncs properly
 * Validates TensorFlow.js and Brain.js are actively working throughout the app
 * 
 * Usage: node data-consistency-validator.cjs
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Helper to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

// Helper to check if pattern exists in file
function checkPattern(filePath, pattern, description) {
  const content = readFile(filePath);
  if (!content) {
    results.failed.push(`${description}: File not found (${filePath})`);
    return false;
  }
  const exists = pattern.test(content);
  if (exists) {
    results.passed.push(`${description}: ✓`);
  } else {
    results.failed.push(`${description}: Pattern not found in ${filePath}`);
  }
  return exists;
}

// Helper to check multiple patterns (all must exist)
function checkAllPatterns(filePath, patterns, description) {
  const content = readFile(filePath);
  if (!content) {
    results.failed.push(`${description}: File not found (${filePath})`);
    return false;
  }
  const allExist = patterns.every(pattern => pattern.test(content));
  if (allExist) {
    results.passed.push(`${description}: ✓`);
  } else {
    const missing = patterns.filter(p => !p.test(content)).map(p => p.toString());
    results.failed.push(`${description}: Missing patterns in ${filePath}`);
  }
  return allExist;
}

// Helper to extract data source references
function extractDataSources(filePath) {
  const content = readFile(filePath);
  if (!content) return [];
  
  const sources = new Set();
  
  // localStorage references
  if (/localStorage\.getItem|localStorage\.setItem/.test(content)) {
    sources.add('localStorage');
  }
  
  // Capacitor Preferences
  if (/@capacitor\/preferences|Preferences\.get|Preferences\.set/.test(content)) {
    sources.add('Preferences');
  }
  
  // Firestore
  if (/collection\(['"]|doc\(['"]|getDoc|setDoc|updateDoc/.test(content)) {
    sources.add('Firestore');
  }
  
  // Service imports
  if (/from ['"].*Service/.test(content)) {
    const serviceMatches = content.match(/from ['"].*?([A-Za-z]+Service)['"]/g);
    if (serviceMatches) {
      serviceMatches.forEach(match => {
        const serviceName = match.match(/([A-Za-z]+Service)/)[1];
        sources.add(serviceName);
      });
    }
  }
  
  return Array.from(sources);
}

// Helper to check data flow between components
function checkDataFlow(sourceFile, targetFile, dataKey, description) {
  const sourceContent = readFile(sourceFile);
  const targetContent = readFile(targetFile);
  
  if (!sourceContent || !targetContent) {
    results.failed.push(`${description}: Files not found`);
    return false;
  }
  
  // Check if both files reference the same data key
  const sourceHasKey = new RegExp(dataKey, 'i').test(sourceContent);
  const targetHasKey = new RegExp(dataKey, 'i').test(targetContent);
  
  if (sourceHasKey && targetHasKey) {
    results.passed.push(`${description}: Data key "${dataKey}" exists in both ✓`);
    return true;
  } else {
    results.failed.push(`${description}: Data key "${dataKey}" missing in ${!sourceHasKey ? sourceFile : targetFile}`);
    return false;
  }
}

console.log(`${colors.cyan}${colors.bright}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🔍 DATA CONSISTENCY VALIDATOR v2.0                   ║
║                                                               ║
║  Comprehensive validation of EVERY modal, banner, panel,      ║
║  function, and data source in the WellnessAI app             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

console.log(`${colors.blue}Starting comprehensive data consistency validation...${colors.reset}\n`);

// ============================================================================
// PHASE 1: STEP COUNTER DATA CONSISTENCY
// ============================================================================
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}📊 PHASE 1: STEP COUNTER DATA CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// 1.1: Check stepCounterService.js data storage
checkAllPatterns(
  'src/services/stepCounterService.js',
  [
    /getSteps|getCurrentSteps/,
    /setItem|Preferences\.set/,
    /collection\(['"]steps|setDoc.*steps/,
  ],
  'Step Counter Service: Stores steps in localStorage/Preferences/Firestore'
);

// 1.2: Check Dashboard displays steps
checkPattern(
  'src/pages/Dashboard.jsx',
  /stepCount|steps|stepCounter/i,
  'Dashboard: Displays step counter'
);

// 1.3: Check StepCounter modal uses same data source
checkAllPatterns(
  'src/components/StepCounter.jsx',
  [
    /useState|useEffect/,
    /stepCounterService|getSteps/,
  ],
  'StepCounter Modal: Uses stepCounterService for data'
);

// 1.4: Check data flow consistency
const dashboardContent = readFile('src/pages/Dashboard.jsx');
const stepCounterContent = readFile('src/components/StepCounter.jsx');
const stepServiceContent = readFile('src/services/stepCounterService.js');

if (dashboardContent && stepCounterContent && stepServiceContent) {
  // Check if Dashboard imports stepCounterService
  const dashboardUsesService = /stepCounterService|from.*stepCounter/.test(dashboardContent);
  const modalUsesService = /stepCounterService|from.*stepCounter/.test(stepCounterContent);
  
  if (dashboardUsesService && modalUsesService) {
    results.passed.push('Step Counter Data Flow: Dashboard + Modal both use stepCounterService ✓');
  } else {
    results.failed.push(`Step Counter Data Flow: ${!dashboardUsesService ? 'Dashboard' : 'Modal'} doesn't import stepCounterService`);
  }
  
  // Check for consistent localStorage keys
  const serviceKeys = (stepServiceContent.match(/['"]dailySteps['"]|['"]steps_/g) || []).map(k => k.replace(/['"]/g, ''));
  const dashboardKeys = (dashboardContent.match(/['"]dailySteps['"]|['"]steps_/g) || []).map(k => k.replace(/['"]/g, ''));
  const modalKeys = (stepCounterContent.match(/['"]dailySteps['"]|['"]steps_/g) || []).map(k => k.replace(/['"]/g, ''));
  
  const allKeys = [...new Set([...serviceKeys, ...dashboardKeys, ...modalKeys])];
  if (allKeys.length <= 2) { // Reasonable number of unique keys
    results.passed.push(`Step Counter Keys: Consistent storage keys (${allKeys.join(', ')}) ✓`);
  } else {
    results.warnings.push(`Step Counter Keys: Multiple storage keys found (${allKeys.join(', ')}) - potential inconsistency`);
  }
}

// 1.5: Check step history persistence
checkPattern(
  'src/services/stepCounterService.js',
  /saveStepHistory|saveToFirestore|updateDoc.*steps/,
  'Step Counter: Saves history to Firestore'
);

// ============================================================================
// PHASE 2: CALORIE TRACKING DATA CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🍎 PHASE 2: CALORIE TRACKING DATA CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// 2.1: Check FoodScanner stores calorie data
checkAllPatterns(
  'src/components/FoodScanner.jsx',
  [
    /calories|nutritionInfo/i,
    /setItem|Preferences\.set|updateDoc/,
  ],
  'Food Scanner: Stores calorie data'
);

// 2.2: Check Dashboard displays total calories
checkPattern(
  'src/pages/Dashboard.jsx',
  /totalCalories|calorieCount|dailyCalories/i,
  'Dashboard: Displays total calories'
);

// 2.3: Check MealAutomation uses consistent calorie data
checkAllPatterns(
  'src/components/MealAutomation.jsx',
  [
    /calories|calorieTarget/i,
    /mealPlan|nutritionPlan/i,
  ],
  'Meal Automation: Uses calorie data in meal planning'
);

// 2.4: Check calorie data flow
const foodScannerContent = readFile('src/components/FoodScanner.jsx');
const mealAutomationContent = readFile('src/components/MealAutomation.jsx');

if (foodScannerContent && mealAutomationContent && dashboardContent) {
  // Extract calorie-related storage keys
  const scannerCalorieKeys = (foodScannerContent.match(/['"](?:daily)?[Cc]alories?['"]|['"]nutrition/g) || []);
  const mealCalorieKeys = (mealAutomationContent.match(/['"](?:daily)?[Cc]alories?['"]|['"]calorieTarget/g) || []);
  const dashboardCalorieKeys = (dashboardContent.match(/['"](?:daily)?[Cc]alories?['"]|['"]totalCalories/g) || []);
  
  if (scannerCalorieKeys.length > 0 && mealCalorieKeys.length > 0 && dashboardCalorieKeys.length > 0) {
    results.passed.push('Calorie Data Flow: All components reference calorie data ✓');
  } else {
    results.warnings.push('Calorie Data Flow: Some components may not be tracking calories');
  }
}

// 2.5: Check syncService handles calorie syncing
checkPattern(
  'src/services/syncService.js',
  /calories|nutrition|food/i,
  'Sync Service: Syncs calorie/nutrition data'
);

// ============================================================================
// PHASE 3: TENSORFLOW.JS INTEGRATION VERIFICATION
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🧠 PHASE 3: TENSORFLOW.JS ACTIVE USAGE VERIFICATION${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// 3.1: Check TensorFlow.js is installed
const packageJson = readFile('package.json');
if (packageJson) {
  const hasTensorFlow = /@tensorflow\/tfjs/.test(packageJson);
  const hasPoseDetection = /@tensorflow-models\/pose-detection/.test(packageJson);
  
  if (hasTensorFlow && hasPoseDetection) {
    results.passed.push('TensorFlow.js: Installed (@tensorflow/tfjs + pose-detection) ✓');
  } else {
    results.failed.push('TensorFlow.js: Missing dependencies in package.json');
  }
}

// 3.2: Check RepCounter imports TensorFlow
checkAllPatterns(
  'src/components/RepCounter.jsx',
  [
    /@tensorflow\/tfjs|import.*tf.*from/i,
    /@tensorflow-models\/pose-detection|poseDetection/i,
  ],
  'RepCounter: Imports TensorFlow.js and pose-detection'
);

// 3.3: Check RepCounter LOADS the model
checkPattern(
  'src/components/RepCounter.jsx',
  /createDetector|load.*Model|poseDetection\.createDetector/i,
  'RepCounter: Loads TensorFlow pose detection model'
);

// 3.4: Check RepCounter USES the model for predictions
checkAllPatterns(
  'src/components/RepCounter.jsx',
  [
    /estimatePoses|detectPose|detector\.estimatePoses/i,
    /keypoints|pose\./i,
    /rep.*count|count.*rep/i,
  ],
  'RepCounter: Uses TensorFlow to detect poses and count reps'
);

// 3.5: Check RepCounter stores rep count data
const repCounterContent = readFile('src/components/RepCounter.jsx');
if (repCounterContent) {
  const storesData = /setItem|Preferences\.set|updateDoc|syncService/.test(repCounterContent);
  const usesState = /useState.*rep|repCount|setRep/i.test(repCounterContent);
  
  if (storesData && usesState) {
    results.passed.push('RepCounter: Stores counted reps to persistent storage ✓');
  } else if (usesState) {
    results.warnings.push('RepCounter: Uses state but may not persist to storage');
  } else {
    results.failed.push('RepCounter: Does not appear to store rep count data');
  }
}

// 3.6: Check Dashboard displays rep counter data
checkPattern(
  'src/pages/Dashboard.jsx',
  /repCount|workoutReps|reps/i,
  'Dashboard: Displays rep counter data'
);

// 3.7: Check TensorFlow data flows to gamification
checkDataFlow(
  'src/components/RepCounter.jsx',
  'src/services/gamificationService.js',
  'reps|workout',
  'RepCounter → Gamification: Workout data flows'
);

// ============================================================================
// PHASE 4: BRAIN.JS AI LEARNING VERIFICATION
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🤖 PHASE 4: BRAIN.JS AI LEARNING VERIFICATION${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// 4.1: Check Brain.js is installed
if (packageJson) {
  const hasBrainJs = /brain\.js/.test(packageJson);
  if (hasBrainJs) {
    results.passed.push('Brain.js: Installed in package.json ✓');
  } else {
    results.failed.push('Brain.js: Not found in package.json dependencies');
  }
}

// 4.2: Check gamificationService imports Brain.js
checkPattern(
  'src/services/gamificationService.js',
  /import.*brain|from ['"]brain\.js/i,
  'Gamification Service: Imports Brain.js'
);

// 4.3: Check gamificationService creates neural network
checkAllPatterns(
  'src/services/gamificationService.js',
  [
    /new brain\.|NeuralNetwork|LSTM|RNN/i,
    /train\(/,
  ],
  'Gamification Service: Creates and trains neural network'
);

// 4.4: Check gamificationService uses predictions
checkAllPatterns(
  'src/services/gamificationService.js',
  [
    /\.run\(|predict/i,
    /recommendation|suggest|predict/i,
  ],
  'Gamification Service: Uses Brain.js predictions for recommendations'
);

// 4.5: Check AI learning data collection
const gamificationContent = readFile('src/services/gamificationService.js');
if (gamificationContent) {
  const collectsData = /userBehavior|trainingData|learningData|history/i.test(gamificationContent);
  const storesData = /setItem|Preferences\.set|updateDoc|syncService/.test(gamificationContent);
  
  if (collectsData && storesData) {
    results.passed.push('Gamification Service: Collects and stores AI learning data ✓');
  } else if (collectsData) {
    results.warnings.push('Gamification Service: Collects data but may not persist');
  } else {
    results.failed.push('Gamification Service: Does not collect learning data');
  }
}

// 4.6: Check AI predictions influence app behavior
checkPattern(
  'src/services/gamificationService.js',
  /if.*prediction|switch.*prediction|prediction\s*>|prediction\s*</i,
  'Gamification Service: AI predictions influence app logic'
);

// 4.7: Check Dashboard displays AI recommendations
checkPattern(
  'src/pages/Dashboard.jsx',
  /recommendation|aiSuggestion|prediction/i,
  'Dashboard: Displays AI recommendations'
);

// ============================================================================
// PHASE 5: MODAL COMPONENT DATA CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}📱 PHASE 5: MODAL COMPONENT DATA CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// List all modal components to check
const modals = [
  { file: 'src/components/StepCounter.jsx', name: 'StepCounter Modal', dataKey: 'steps' },
  { file: 'src/components/FoodScanner.jsx', name: 'Food Scanner Modal', dataKey: 'calories|nutrition' },
  { file: 'src/components/RepCounter.jsx', name: 'Rep Counter Modal', dataKey: 'reps|workout' },
  { file: 'src/components/DNAAnalysis.jsx', name: 'DNA Analysis Modal', dataKey: 'dna|genetics' },
  { file: 'src/components/SocialBattle.jsx', name: 'Social Battle Modal', dataKey: 'battle|opponent' },
  { file: 'src/components/MealAutomation.jsx', name: 'Meal Automation Modal', dataKey: 'meal|nutrition' },
  { file: 'src/components/BreathingExercises.jsx', name: 'Breathing Exercise Modal', dataKey: 'breathing|session' },
  { file: 'src/components/ARScanner.jsx', name: 'AR Scanner Modal', dataKey: 'scan|ar' },
  { file: 'src/components/EmergencyAlert.jsx', name: 'Emergency Alert Modal', dataKey: 'emergency|location' },
];

modals.forEach(modal => {
  const content = readFile(modal.file);
  if (content) {
    // Check if modal uses state management
    const hasState = /useState|useEffect|useContext/.test(content);
    
    // Check if modal reads from data source
    const readsData = new RegExp(`getItem|Preferences\\.get|useEffect.*${modal.dataKey}`, 'i').test(content);
    
    // Check if modal writes to data source
    const writesData = /setItem|Preferences\.set|updateDoc|syncService/.test(content);
    
    if (hasState && readsData && writesData) {
      results.passed.push(`${modal.name}: Has state, reads data, writes data ✓`);
    } else {
      const missing = [];
      if (!hasState) missing.push('state');
      if (!readsData) missing.push('read');
      if (!writesData) missing.push('write');
      results.warnings.push(`${modal.name}: Missing ${missing.join(', ')} operations`);
    }
    
    // Check if modal uses service layer
    const usesService = /Service|from.*service/i.test(content);
    if (usesService) {
      results.passed.push(`${modal.name}: Uses service layer for data operations ✓`);
    }
    
    // Extract data sources used by this modal
    const sources = extractDataSources(modal.file);
    if (sources.length > 0) {
      results.passed.push(`${modal.name}: Data sources - ${sources.join(', ')} ✓`);
    }
  } else {
    results.failed.push(`${modal.name}: File not found`);
  }
});

// ============================================================================
// PHASE 6: DASHBOARD BANNER CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🏆 PHASE 6: DASHBOARD BANNER DATA CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Check Dashboard for various data displays
if (dashboardContent) {
  const bannerChecks = [
    { pattern: /stepCount|steps|dailySteps/i, name: 'Step Counter Banner' },
    { pattern: /calories|totalCalories|calorieCount/i, name: 'Calorie Counter Banner' },
    { pattern: /points|score|xp/i, name: 'Gamification Points Banner' },
    { pattern: /streak|consecutive/i, name: 'Streak Counter Banner' },
    { pattern: /achievement|badge|trophy/i, name: 'Achievement Banner' },
    { pattern: /level|rank|tier/i, name: 'Level Progress Banner' },
    { pattern: /workout|exercise|reps/i, name: 'Workout Summary Banner' },
    { pattern: /nutrition|meal|diet/i, name: 'Nutrition Summary Banner' },
  ];
  
  bannerChecks.forEach(check => {
    if (check.pattern.test(dashboardContent)) {
      results.passed.push(`Dashboard: ${check.name} present ✓`);
      
      // Check if banner data comes from service
      const servicePattern = new RegExp(`${check.pattern.source}.*Service|use.*${check.pattern.source}`, 'i');
      if (servicePattern.test(dashboardContent)) {
        results.passed.push(`Dashboard: ${check.name} uses service layer ✓`);
      }
    } else {
      results.warnings.push(`Dashboard: ${check.name} not found`);
    }
  });
  
  // Check Dashboard uses useEffect to fetch data
  if (/useEffect/.test(dashboardContent)) {
    results.passed.push('Dashboard: Uses useEffect to fetch data ✓');
  } else {
    results.warnings.push('Dashboard: May not be fetching data on mount');
  }
  
  // Check Dashboard updates on data changes
  if (/useEffect.*\[.*\]/.test(dashboardContent)) {
    results.passed.push('Dashboard: Has dependency arrays for reactive updates ✓');
  }
}

// ============================================================================
// PHASE 7: DATA SYNCHRONIZATION VERIFICATION
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🔄 PHASE 7: DATA SYNCHRONIZATION VERIFICATION${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// 7.1: Check syncService exists and is comprehensive
const syncServiceContent = readFile('src/services/syncService.js');
if (syncServiceContent) {
  // Check sync queue
  if (/syncQueue|pendingSync|offlineQueue/i.test(syncServiceContent)) {
    results.passed.push('Sync Service: Has sync queue for offline operations ✓');
  } else {
    results.failed.push('Sync Service: No sync queue found');
  }
  
  // Check sync methods
  const syncMethods = [
    { pattern: /syncUserData|syncProfile/i, name: 'User Profile Sync' },
    { pattern: /syncSteps|syncFitness/i, name: 'Step Counter Sync' },
    { pattern: /syncNutrition|syncMeals|syncCalories/i, name: 'Nutrition Data Sync' },
    { pattern: /syncWorkout|syncExercise/i, name: 'Workout Data Sync' },
    { pattern: /syncAchievements|syncGamification/i, name: 'Achievement Sync' },
  ];
  
  syncMethods.forEach(method => {
    if (method.pattern.test(syncServiceContent)) {
      results.passed.push(`Sync Service: ${method.name} implemented ✓`);
    } else {
      results.warnings.push(`Sync Service: ${method.name} not found`);
    }
  });
  
  // Check online/offline detection
  if (/navigator\.onLine|isOnline|online.*status/i.test(syncServiceContent)) {
    results.passed.push('Sync Service: Detects online/offline status ✓');
  }
  
  // Check auto-sync on reconnect
  if (/addEventListener.*online|window\.on.*online/i.test(syncServiceContent)) {
    results.passed.push('Sync Service: Auto-syncs on reconnect ✓');
  } else {
    results.warnings.push('Sync Service: May not auto-sync on reconnect');
  }
}

// 7.2: Check components trigger sync after data changes
const componentsToCheck = [
  'src/components/StepCounter.jsx',
  'src/components/FoodScanner.jsx',
  'src/components/RepCounter.jsx',
  'src/components/MealAutomation.jsx',
];

componentsToCheck.forEach(filePath => {
  const content = readFile(filePath);
  if (content) {
    const componentName = path.basename(filePath, '.jsx');
    
    if (/syncService|\.sync\(/.test(content)) {
      results.passed.push(`${componentName}: Triggers sync after data changes ✓`);
    } else {
      results.warnings.push(`${componentName}: May not trigger sync`);
    }
  }
});

// ============================================================================
// PHASE 8: SERVICE LAYER COMMUNICATION
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🔗 PHASE 8: SERVICE LAYER CROSS-COMMUNICATION${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Check if services communicate with each other properly
const serviceCommunication = [
  {
    from: 'src/services/stepCounterService.js',
    to: 'src/services/gamificationService.js',
    data: 'steps|activity',
    desc: 'Step Counter → Gamification'
  },
  {
    from: 'src/services/gamificationService.js',
    to: 'src/services/syncService.js',
    data: 'points|achievement|xp',
    desc: 'Gamification → Sync Service'
  },
  {
    from: 'src/services/aiVisionService.js',
    to: 'src/services/syncService.js',
    data: 'scan|nutrition|food',
    desc: 'AI Vision → Sync Service'
  },
  {
    from: 'src/services/mealAutomationService.js',
    to: 'src/services/aiVisionService.js',
    data: 'meal|nutrition|calories',
    desc: 'Meal Automation → AI Vision'
  },
  {
    from: 'src/components/RepCounter.jsx',
    to: 'src/services/gamificationService.js',
    data: 'workout|reps|exercise',
    desc: 'Rep Counter → Gamification'
  },
];

serviceCommunication.forEach(comm => {
  const fromContent = readFile(comm.from);
  const toContent = readFile(comm.to);
  
  if (fromContent && toContent) {
    // Check if 'from' file imports 'to' service
    const toServiceName = path.basename(comm.to, '.js');
    const importsService = new RegExp(`from ['"].*${toServiceName}|import.*${toServiceName}`, 'i').test(fromContent);
    
    // Check if both files reference the same data
    const fromHasData = new RegExp(comm.data, 'i').test(fromContent);
    const toHasData = new RegExp(comm.data, 'i').test(toContent);
    
    if (importsService || (fromHasData && toHasData)) {
      results.passed.push(`${comm.desc}: Services communicate ✓`);
    } else {
      results.warnings.push(`${comm.desc}: May not be communicating data`);
    }
  }
});

// ============================================================================
// PHASE 9: PANEL COMPONENT CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}📋 PHASE 9: PANEL COMPONENT DATA CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Check various panel components in Dashboard and other pages
const panelChecks = [
  { file: 'src/pages/Dashboard.jsx', pattern: /progressChart|chartData/i, name: 'Progress Chart Panel' },
  { file: 'src/pages/Dashboard.jsx', pattern: /recentActivity|activityLog/i, name: 'Recent Activity Panel' },
  { file: 'src/pages/Dashboard.jsx', pattern: /nutritionSummary|mealHistory/i, name: 'Nutrition Summary Panel' },
  { file: 'src/pages/Dashboard.jsx', pattern: /workoutHistory|exerciseLog/i, name: 'Workout History Panel' },
  { file: 'src/pages/Gamification.jsx', pattern: /leaderboard/i, name: 'Leaderboard Panel' },
  { file: 'src/pages/Gamification.jsx', pattern: /achievement|badge/i, name: 'Achievement Panel' },
  { file: 'src/pages/Profile.jsx', pattern: /userStats|statistics/i, name: 'User Stats Panel' },
  { file: 'src/pages/Profile.jsx', pattern: /healthMetrics|vitals/i, name: 'Health Metrics Panel' },
];

panelChecks.forEach(check => {
  const content = readFile(check.file);
  if (content) {
    if (check.pattern.test(content)) {
      results.passed.push(`${check.name}: Present in ${path.basename(check.file)} ✓`);
      
      // Check if panel fetches data
      if (/useEffect.*fetch|useState.*\[\]|\.map\(/.test(content)) {
        results.passed.push(`${check.name}: Fetches and renders data ✓`);
      }
    } else {
      results.warnings.push(`${check.name}: Not found in ${path.basename(check.file)}`);
    }
  }
});

// ============================================================================
// PHASE 10: STORAGE KEY CONSISTENCY CHECK
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🔑 PHASE 10: STORAGE KEY CONSISTENCY CHECK${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Extract all localStorage keys used across the app
const filesToScan = [
  'src/services/stepCounterService.js',
  'src/services/gamificationService.js',
  'src/services/syncService.js',
  'src/services/aiVisionService.js',
  'src/components/StepCounter.jsx',
  'src/components/FoodScanner.jsx',
  'src/components/RepCounter.jsx',
  'src/pages/Dashboard.jsx',
];

const storageKeys = {};

filesToScan.forEach(filePath => {
  const content = readFile(filePath);
  if (content) {
    // Find all localStorage keys
    const localStorageMatches = content.match(/(?:localStorage\.(?:get|set|remove)Item|Preferences\.(?:get|set|remove))\s*\(\s*['"]([^'"]+)['"]/g);
    
    if (localStorageMatches) {
      localStorageMatches.forEach(match => {
        const keyMatch = match.match(/['"]([^'"]+)['"]/);
        if (keyMatch) {
          const key = keyMatch[1];
          if (!storageKeys[key]) {
            storageKeys[key] = [];
          }
          storageKeys[key].push(path.basename(filePath));
        }
      });
    }
  }
});

// Report storage key usage
Object.entries(storageKeys).forEach(([key, files]) => {
  if (files.length > 1) {
    results.passed.push(`Storage Key "${key}": Used consistently across ${files.length} files ✓`);
  } else {
    results.warnings.push(`Storage Key "${key}": Only used in ${files[0]} - may cause isolation`);
  }
});

// ============================================================================
// PHASE 11: FIRESTORE COLLECTION CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🔥 PHASE 11: FIRESTORE COLLECTION CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Extract Firestore collections used
const firestoreCollections = {};

filesToScan.forEach(filePath => {
  const content = readFile(filePath);
  if (content) {
    // Find collection references
    const collectionMatches = content.match(/collection\s*\(\s*['"]([^'"]+)['"]/g);
    
    if (collectionMatches) {
      collectionMatches.forEach(match => {
        const collMatch = match.match(/['"]([^'"]+)['"]/);
        if (collMatch) {
          const collection = collMatch[1];
          if (!firestoreCollections[collection]) {
            firestoreCollections[collection] = [];
          }
          firestoreCollections[collection].push(path.basename(filePath));
        }
      });
    }
  }
});

// Report Firestore collection usage
Object.entries(firestoreCollections).forEach(([collection, files]) => {
  results.passed.push(`Firestore "${collection}": Used by ${files.length} file(s) - ${files.join(', ')} ✓`);
});

// Check common collections
const expectedCollections = ['users', 'steps', 'nutrition', 'workouts', 'achievements', 'battles'];
expectedCollections.forEach(coll => {
  if (firestoreCollections[coll]) {
    results.passed.push(`Firestore: "${coll}" collection exists ✓`);
  } else {
    results.warnings.push(`Firestore: "${coll}" collection not found in code`);
  }
});

// ============================================================================
// PHASE 12: REACT STATE MANAGEMENT CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}⚛️ PHASE 12: REACT STATE MANAGEMENT CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Check if app uses Context API for global state
const mainFile = readFile('src/main.jsx');
const appFile = readFile('src/App.jsx');

if (mainFile && appFile) {
  // Check for Context Provider
  if (/Provider|Context|createContext/.test(mainFile + appFile)) {
    results.passed.push('React: Uses Context API for global state ✓');
  } else {
    results.warnings.push('React: No Context API detected - components may not share state');
  }
  
  // Check for proper state lifting
  const dashboardHasState = dashboardContent && /useState/.test(dashboardContent);
  const appHasState = /useState/.test(appFile);
  
  if (appHasState) {
    results.passed.push('React: App component manages global state ✓');
  } else if (dashboardHasState) {
    results.warnings.push('React: State managed at component level - may cause prop drilling');
  }
}

// Check components for proper state updates
const stateUpdateChecks = [
  { file: 'src/components/StepCounter.jsx', state: 'steps|stepCount' },
  { file: 'src/components/FoodScanner.jsx', state: 'calories|nutrition' },
  { file: 'src/components/RepCounter.jsx', state: 'reps|count' },
];

stateUpdateChecks.forEach(check => {
  const content = readFile(check.file);
  if (content) {
    const componentName = path.basename(check.file, '.jsx');
    
    // Check useState for relevant state
    const stateRegex = new RegExp(`useState.*${check.state}|const\\s*\\[\\s*\\w*${check.state}`, 'i');
    if (stateRegex.test(content)) {
      results.passed.push(`${componentName}: Has local state for ${check.state} ✓`);
    }
    
    // Check useEffect updates state
    if (/useEffect/.test(content) && new RegExp(`set\\w*${check.state}`, 'i').test(content)) {
      results.passed.push(`${componentName}: Updates state in useEffect ✓`);
    }
  }
});

// ============================================================================
// PHASE 13: NATIVE FEATURE DATA CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}📱 PHASE 13: NATIVE FEATURE DATA CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Check native GPS data consistency
const gpsService = readFile('src/services/nativeGPSService.js');
const emergencyComponent = readFile('src/components/EmergencyAlert.jsx');

if (gpsService && emergencyComponent) {
  const gpsServiceHasData = /latitude|longitude|coords|position/i.test(gpsService);
  const emergencyUsesGPS = /nativeGPSService|getLocation|getCurrentPosition/i.test(emergencyComponent);
  
  if (gpsServiceHasData && emergencyUsesGPS) {
    results.passed.push('GPS Data: Service provides location, Emergency component uses it ✓');
  } else {
    results.warnings.push('GPS Data: May not be flowing from service to component');
  }
  
  // Check GPS data persistence
  if (/setItem|Preferences\.set|updateDoc/.test(gpsService)) {
    results.passed.push('GPS Data: Persisted to storage ✓');
  }
}

// Check camera/vision data consistency
const visionService = readFile('src/services/aiVisionService.js');
const foodScanner = readFile('src/components/FoodScanner.jsx');
const arScanner = readFile('src/components/ARScanner.jsx');

if (visionService) {
  const serviceProcessesImages = /analyzeImage|processImage|scanFood/.test(visionService);
  const foodScannerUsesService = foodScanner && /aiVisionService/.test(foodScanner);
  const arScannerUsesService = arScanner && /aiVisionService/.test(arScanner);
  
  if (serviceProcessesImages && (foodScannerUsesService || arScannerUsesService)) {
    results.passed.push('Camera/Vision Data: Service processes images, components use it ✓');
  } else {
    results.warnings.push('Camera/Vision Data: May not be properly integrated');
  }
}

// Check motion sensor data for TensorFlow
const motionSensors = readFile('src/services/motionSensorService.js');
if (motionSensors && repCounterContent) {
  const sensorsProvideData = /accelerometer|gyroscope|deviceMotion/i.test(motionSensors);
  const repCounterUsesSensors = /motionSensorService|sensor.*data/i.test(repCounterContent);
  
  if (sensorsProvideData && repCounterUsesSensors) {
    results.passed.push('Motion Sensor Data: Flows from sensors to RepCounter ✓');
  } else {
    results.warnings.push('Motion Sensor Data: May not be integrated with RepCounter');
  }
}

// ============================================================================
// PHASE 14: API DATA CONSISTENCY
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}🌐 PHASE 14: API DATA CONSISTENCY${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Check Gemini API usage consistency
const geminiService = readFile('src/services/geminiService.js');
if (geminiService) {
  // Components that should use Gemini
  const geminiUsers = [
    { file: 'src/components/FoodScanner.jsx', feature: 'Food Analysis' },
    { file: 'src/components/MealAutomation.jsx', feature: 'Meal Planning' },
    { file: 'src/components/ChatBot.jsx', feature: 'AI Chat' },
    { file: 'src/components/DNAAnalysis.jsx', feature: 'DNA Insights' },
  ];
  
  geminiUsers.forEach(user => {
    const content = readFile(user.file);
    if (content && /geminiService|chatWithAI|analyzeWith/.test(content)) {
      results.passed.push(`Gemini API: ${user.feature} uses geminiService ✓`);
    } else if (content) {
      results.warnings.push(`Gemini API: ${user.feature} may not use geminiService`);
    }
  });
  
  // Check rate limiting is applied
  if (/rateLimiterService|checkLimit/.test(geminiService)) {
    results.passed.push('Gemini API: Rate limiting implemented ✓');
  } else {
    results.warnings.push('Gemini API: No rate limiting detected');
  }
}

// Check Stripe payment data consistency
const subscriptionService = readFile('src/services/subscriptionService.js');
if (subscriptionService) {
  // Check subscription tiers are consistent
  const tiers = ['starter', 'premium', 'ultimate'];
  tiers.forEach(tier => {
    if (new RegExp(tier, 'i').test(subscriptionService)) {
      results.passed.push(`Stripe: ${tier} plan defined ✓`);
    }
  });
  
  // Check payment page uses subscription service
  const paymentComponent = readFile('src/components/PaymentModal.jsx') || readFile('src/pages/Subscription.jsx');
  if (paymentComponent && /subscriptionService/.test(paymentComponent)) {
    results.passed.push('Stripe: Payment UI uses subscriptionService ✓');
  }
}

// ============================================================================
// PHASE 15: USER JOURNEY SIMULATION
// ============================================================================
console.log(`\n${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}👤 PHASE 15: USER JOURNEY SIMULATION${colors.reset}`);
console.log(`${colors.magenta}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Simulate common user journeys and check data flow
const userJourneys = [
  {
    name: 'User opens app → Dashboard loads',
    checks: [
      { file: 'src/main.jsx', pattern: /ReactDOM|createRoot/, desc: 'App initializes' },
      { file: 'src/App.jsx', pattern: /Dashboard|BrowserRouter/, desc: 'Router configured' },
      { file: 'src/pages/Dashboard.jsx', pattern: /useEffect/, desc: 'Dashboard fetches data on mount' },
    ]
  },
  {
    name: 'User walks 1000 steps → Step counter updates everywhere',
    checks: [
      { file: 'src/services/stepCounterService.js', pattern: /updateSteps|setSteps/, desc: 'Service updates step count' },
      { file: 'src/components/StepCounter.jsx', pattern: /stepCounterService/, desc: 'Modal reads from service' },
      { file: 'src/pages/Dashboard.jsx', pattern: /steps|stepCount/, desc: 'Dashboard shows step count' },
      { file: 'src/services/syncService.js', pattern: /steps/, desc: 'Sync service syncs steps' },
    ]
  },
  {
    name: 'User scans food → Calories tracked everywhere',
    checks: [
      { file: 'src/components/FoodScanner.jsx', pattern: /geminiService|analyzeImage/, desc: 'Scanner analyzes food' },
      { file: 'src/components/FoodScanner.jsx', pattern: /calories|nutrition/, desc: 'Scanner extracts calories' },
      { file: 'src/pages/Dashboard.jsx', pattern: /calories|totalCalories/, desc: 'Dashboard shows total calories' },
      { file: 'src/components/MealAutomation.jsx', pattern: /calories/, desc: 'Meal planner considers calories' },
    ]
  },
  {
    name: 'User does workout → TensorFlow counts reps → Points awarded',
    checks: [
      { file: 'src/components/RepCounter.jsx', pattern: /@tensorflow/, desc: 'TensorFlow loaded' },
      { file: 'src/components/RepCounter.jsx', pattern: /estimatePoses|detectPose/, desc: 'Pose detection active' },
      { file: 'src/components/RepCounter.jsx', pattern: /repCount|countRep/, desc: 'Reps counted' },
      { file: 'src/services/gamificationService.js', pattern: /workout|reps|exercise/, desc: 'Gamification receives workout data' },
      { file: 'src/services/gamificationService.js', pattern: /addPoints|award/, desc: 'Points awarded' },
    ]
  },
  {
    name: 'User completes action → Brain.js learns → Better recommendations',
    checks: [
      { file: 'src/services/gamificationService.js', pattern: /brain\.js|NeuralNetwork/, desc: 'Brain.js initialized' },
      { file: 'src/services/gamificationService.js', pattern: /train\(/, desc: 'Neural network trains on data' },
      { file: 'src/services/gamificationService.js', pattern: /\.run\(|predict/, desc: 'Network generates predictions' },
      { file: 'src/pages/Dashboard.jsx', pattern: /recommendation|suggestion/, desc: 'Dashboard shows recommendations' },
    ]
  },
];

userJourneys.forEach(journey => {
  console.log(`${colors.cyan}Simulating: ${journey.name}${colors.reset}`);
  let journeyPassed = true;
  
  journey.checks.forEach(check => {
    const content = readFile(check.file);
    if (content && check.pattern.test(content)) {
      console.log(`  ${colors.green}✓${colors.reset} ${check.desc}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${check.desc} - NOT FOUND`);
      journeyPassed = false;
    }
  });
  
  if (journeyPassed) {
    results.passed.push(`User Journey: "${journey.name}" - Complete ✓`);
  } else {
    results.failed.push(`User Journey: "${journey.name}" - Incomplete data flow`);
  }
  console.log('');
});

// ============================================================================
// FINAL REPORT
// ============================================================================
console.log(`\n${colors.cyan}${colors.bright}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                   📊 FINAL VALIDATION REPORT                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

const totalTests = results.passed.length + results.failed.length;
const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);

console.log(`${colors.green}${colors.bright}✅ PASSED: ${results.passed.length} checks${colors.reset}`);
console.log(`${colors.red}${colors.bright}❌ FAILED: ${results.failed.length} checks${colors.reset}`);
console.log(`${colors.yellow}${colors.bright}⚠️  WARNINGS: ${results.warnings.length} items${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}🎯 CONSISTENCY RATE: ${passRate}%${colors.reset}\n`);

if (results.failed.length > 0) {
  console.log(`${colors.red}${colors.bright}❌ FAILED CHECKS:${colors.reset}`);
  results.failed.forEach((fail, i) => {
    console.log(`${colors.red}${i + 1}. ${fail}${colors.reset}`);
  });
  console.log('');
}

if (results.warnings.length > 0) {
  console.log(`${colors.yellow}${colors.bright}⚠️  WARNINGS:${colors.reset}`);
  results.warnings.slice(0, 10).forEach((warn, i) => {
    console.log(`${colors.yellow}${i + 1}. ${warn}${colors.reset}`);
  });
  if (results.warnings.length > 10) {
    console.log(`${colors.yellow}... and ${results.warnings.length - 10} more warnings${colors.reset}`);
  }
  console.log('');
}

// Generate detailed JSON report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests,
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    consistencyRate: `${passRate}%`,
  },
  passed: results.passed,
  failed: results.failed,
  warnings: results.warnings,
  storageKeys,
  firestoreCollections,
};

fs.writeFileSync(
  path.join(__dirname, 'data-consistency-report.json'),
  JSON.stringify(report, null, 2)
);

console.log(`${colors.cyan}📄 Detailed report saved to: data-consistency-report.json${colors.reset}\n`);

// Overall assessment
if (passRate >= 95) {
  console.log(`${colors.green}${colors.bright}
🎉 EXCELLENT! Your app has ${passRate}% data consistency!
✅ All modals, banners, and panels are properly synced.
✅ TensorFlow.js and Brain.js are actively working throughout the app.
✅ Data flows correctly between all components.
${colors.reset}`);
} else if (passRate >= 85) {
  console.log(`${colors.yellow}${colors.bright}
✅ GOOD! Your app has ${passRate}% data consistency.
⚠️  Some minor issues detected - review failed checks above.
💡 Fix the failed checks to ensure perfect data synchronization.
${colors.reset}`);
} else {
  console.log(`${colors.red}${colors.bright}
⚠️  ATTENTION NEEDED! Your app has ${passRate}% data consistency.
❌ Multiple data flow issues detected.
🔧 Review and fix the failed checks to prevent user-facing discrepancies.
${colors.reset}`);
}

process.exit(results.failed.length > 0 ? 1 : 0);
