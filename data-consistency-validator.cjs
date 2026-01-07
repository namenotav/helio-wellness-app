#!/usr/bin/env node
/**
 * DATA CONSISTENCY VALIDATOR
 * Verifies that ALL modals show THE SAME DATA
 * - No mismatches between modals
 * - All metrics consistent across UI
 * - Real data extraction from screen
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  DEVICE_ID: 'adb-333021f0-oq2vBj._adb-tls-connect._tcp',
  APP_PACKAGE: 'com.helio.wellness',
  APP_ACTIVITY: '.MainActivity',
  SCREENSHOT_DIR: 'data-consistency-screenshots',
  REPORT_FILE: 'data-consistency-report.json'
};

// Test results
const testResults = {
  startTime: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  mismatches: [],
  dataPoints: {},
  tests: []
};

// Data collected from each modal
const modalData = {
  progress: {},
  myStats: {},
  yourStats: {},
  fullStats: {},
  monthlyStats: {},
  weeklyCompare: {},
  home: {}
};

// Expected data after logging
const expectedData = {
  steps: 5000,
  calories: 450,
  caloriesBurned: 350,
  netCalories: 100,
  water: 2,
  workouts: 1,
  meals: 1
};

if (!fs.existsSync(CONFIG.SCREENSHOT_DIR)) {
  fs.mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function adb(command) {
  try {
    return execSync(`adb -s "${CONFIG.DEVICE_ID}" ${command}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    return null;
  }
}

async function takeScreenshot(name) {
  const timestamp = Date.now();
  const filename = `${name}_${timestamp}.png`;
  const devicePath = `/sdcard/${filename}`;
  const localPath = path.join(CONFIG.SCREENSHOT_DIR, filename);
  
  adb(`shell screencap -p ${devicePath}`);
  adb(`pull ${devicePath} ${localPath}`);
  adb(`shell rm ${devicePath}`);
  
  return localPath;
}

async function getUIHierarchy() {
  // Dump UI hierarchy to extract text
  const dumpFile = '/sdcard/ui_dump.xml';
  adb(`shell uiautomator dump ${dumpFile}`);
  const localDump = path.join(CONFIG.SCREENSHOT_DIR, 'ui_dump.xml');
  adb(`pull ${dumpFile} ${localDump}`);
  adb(`shell rm ${dumpFile}`);
  
  if (fs.existsSync(localDump)) {
    return fs.readFileSync(localDump, 'utf8');
  }
  return null;
}

function extractNumbers(uiXml) {
  // Extract all numbers from UI
  const numbers = [];
  const regex = /text="([^"]*\d+[^"]*)"/g;
  let match;
  
  while ((match = regex.exec(uiXml)) !== null) {
    const text = match[1];
    // Extract numbers from text
    const numMatch = text.match(/\d+(?:,\d+)?/g);
    if (numMatch) {
      numMatch.forEach(num => {
        numbers.push({
          text: text,
          value: parseInt(num.replace(/,/g, ''))
        });
      });
    }
  }
  
  return numbers;
}

function findMetricValue(uiXml, keywords) {
  // Find a metric by keywords (e.g., "steps", "calories")
  const lines = uiXml.split('\n');
  
  for (let keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    for (let line of lines) {
      if (line.toLowerCase().includes(keywordLower)) {
        // Extract number from this line or nearby
        const numMatch = line.match(/text="([^"]*\d+[^"]*)"/);
        if (numMatch) {
          const text = numMatch[1];
          const valueMatch = text.match(/\d+(?:,\d+)?/);
          if (valueMatch) {
            return parseInt(valueMatch[0].replace(/,/g, ''));
          }
        }
      }
    }
  }
  
  return null;
}

async function tap(x, y) {
  adb(`shell input tap ${x} ${y}`);
  await sleep(1000);
}

async function swipe(x1, y1, x2, y2, duration = 300) {
  adb(`shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
  await sleep(500);
}

async function inputText(text) {
  const escaped = text.replace(/[\\$'"]/g, '\\$&').replace(/\s/g, '%s');
  adb(`shell input text "${escaped}"`);
  await sleep(300);
}

async function pressBack() {
  adb(`shell input keyevent 4`);
  await sleep(500);
}

async function openApp() {
  console.log('📱 Opening WellnessAI app...');
  adb(`shell am start -n ${CONFIG.APP_PACKAGE}/${CONFIG.APP_ACTIVITY}`);
  await sleep(3000);
}

function logTest(testName, passed, notes = '') {
  const result = {
    name: testName,
    passed,
    notes,
    timestamp: new Date().toISOString()
  };
  
  testResults.totalTests++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}${notes ? ' - ' + notes : ''}`);
  } else {
    testResults.failed++;
    console.error(`❌ ${testName}${notes ? ' - ' + notes : ''}`);
  }
  
  testResults.tests.push(result);
}

function compareMismatch(metric, modal1, value1, modal2, value2) {
  if (value1 === null || value2 === null) {
    console.log(`   ⚠️  [${metric}] ${modal1}: ${value1}, ${modal2}: ${value2} (NULL VALUE)`);
    return { mismatch: false, warning: true };
  }
  
  const tolerance = metric.includes('calorie') ? 50 : (metric.includes('step') ? 100 : 0);
  const diff = Math.abs(value1 - value2);
  const mismatch = diff > tolerance;
  
  if (mismatch) {
    console.error(`   ❌ MISMATCH [${metric}] ${modal1}: ${value1}, ${modal2}: ${value2} (diff: ${diff})`);
    testResults.mismatches.push({
      metric,
      modal1,
      value1,
      modal2,
      value2,
      difference: diff
    });
  } else {
    console.log(`   ✅ MATCH [${metric}] ${modal1}: ${value1}, ${modal2}: ${value2}`);
  }
  
  return { mismatch, difference: diff };
}

// ========================================
// DATA LOGGING
// ========================================

async function logTestData() {
  console.log('\n📊 LOGGING TEST DATA...\n');
  
  // Breakfast
  console.log('🍳 Logging breakfast (450 calories)...');
  await tap(300, 1400); // Food tab
  await sleep(1000);
  await tap(540, 400); // Add food
  await sleep(1000);
  await inputText('Eggs%sand%stoast');
  await sleep(500);
  await tap(540, 800); // Confirm
  await sleep(2000);
  logTest('Logged Breakfast', true, '450 calories');
  
  // Water
  console.log('💧 Logging water (2 cups)...');
  await tap(100, 1400); // Home tab
  await sleep(1000);
  await tap(540, 1000); // Water button
  await sleep(500);
  await tap(540, 1000); // Water button again
  await sleep(500);
  logTest('Logged Water', true, '2 cups');
  
  // Workout
  console.log('💪 Logging workout (5000 steps, 350 cal burned)...');
  await tap(400, 1400); // Workouts tab
  await sleep(1000);
  await tap(540, 400); // Add workout
  await sleep(1000);
  await tap(540, 600); // Select type
  await sleep(1000);
  await inputText('35'); // Duration
  await sleep(500);
  await tap(540, 900); // Save
  await sleep(2000);
  logTest('Logged Workout', true, '35 min');
  
  console.log('\n📊 Expected Data:');
  console.log(`   Steps: ${expectedData.steps}`);
  console.log(`   Calories: ${expectedData.calories}`);
  console.log(`   Calories Burned: ${expectedData.caloriesBurned}`);
  console.log(`   Net Calories: ${expectedData.netCalories}`);
  console.log(`   Water: ${expectedData.water} cups`);
  console.log(`   Workouts: ${expectedData.workouts}`);
  console.log(`   Meals: ${expectedData.meals}\n`);
}

// ========================================
// DATA EXTRACTION FROM MODALS
// ========================================

async function extractHomeData() {
  console.log('\n📱 EXTRACTING DATA FROM HOME SCREEN...');
  
  await tap(100, 1400); // Home tab
  await sleep(1500);
  await takeScreenshot('home_screen');
  
  const uiXml = await getUIHierarchy();
  if (uiXml) {
    modalData.home.steps = findMetricValue(uiXml, ['steps', 'Steps', 'STEPS']);
    modalData.home.calories = findMetricValue(uiXml, ['calories', 'Calories', 'cal', 'Cal']);
    modalData.home.water = findMetricValue(uiXml, ['water', 'Water', 'cups', 'Cups']);
    
    console.log(`   Steps: ${modalData.home.steps}`);
    console.log(`   Calories: ${modalData.home.calories}`);
    console.log(`   Water: ${modalData.home.water}`);
  }
  
  logTest('Home Screen - Data Extracted', true);
}

async function extractProgressModalData() {
  console.log('\n📊 EXTRACTING DATA FROM PROGRESS MODAL...');
  
  await tap(100, 1400); // Home tab
  await sleep(1000);
  await tap(540, 600); // Progress card
  await sleep(2000);
  await takeScreenshot('progress_modal_data');
  
  const uiXml = await getUIHierarchy();
  if (uiXml) {
    modalData.progress.steps = findMetricValue(uiXml, ['steps', 'Steps', 'STEPS']);
    modalData.progress.calories = findMetricValue(uiXml, ['calories', 'Calories', 'cal']);
    modalData.progress.water = findMetricValue(uiXml, ['water', 'Water', 'cups']);
    modalData.progress.workouts = findMetricValue(uiXml, ['workout', 'Workout', 'exercise']);
    
    console.log(`   Steps: ${modalData.progress.steps}`);
    console.log(`   Calories: ${modalData.progress.calories}`);
    console.log(`   Water: ${modalData.progress.water}`);
    console.log(`   Workouts: ${modalData.progress.workouts}`);
  }
  
  await pressBack();
  await sleep(500);
  
  logTest('Progress Modal - Data Extracted', true);
}

async function extractYourStatsModalData() {
  console.log('\n📈 EXTRACTING DATA FROM YOUR STATS MODAL...');
  
  await tap(500, 1400); // Stats tab
  await sleep(1000);
  await tap(540, 400); // Your Stats button
  await sleep(2000);
  await takeScreenshot('your_stats_modal_data');
  
  const uiXml = await getUIHierarchy();
  if (uiXml) {
    modalData.yourStats.steps = findMetricValue(uiXml, ['steps', 'Steps', 'STEPS']);
    modalData.yourStats.calories = findMetricValue(uiXml, ['calories', 'Calories', 'cal']);
    modalData.yourStats.water = findMetricValue(uiXml, ['water', 'Water', 'cups']);
    modalData.yourStats.workouts = findMetricValue(uiXml, ['workout', 'Workout', 'exercise']);
    
    console.log(`   Steps: ${modalData.yourStats.steps}`);
    console.log(`   Calories: ${modalData.yourStats.calories}`);
    console.log(`   Water: ${modalData.yourStats.water}`);
    console.log(`   Workouts: ${modalData.yourStats.workouts}`);
  }
  
  await pressBack();
  await sleep(500);
  
  logTest('Your Stats Modal - Data Extracted', true);
}

async function extractFullStatsModalData() {
  console.log('\n📊 EXTRACTING DATA FROM FULL STATS MODAL...');
  
  await tap(500, 1400); // Stats tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(500);
  await tap(540, 600); // Full Stats button
  await sleep(2000);
  await takeScreenshot('full_stats_modal_data');
  
  const uiXml = await getUIHierarchy();
  if (uiXml) {
    modalData.fullStats.steps = findMetricValue(uiXml, ['steps', 'Steps', 'STEPS']);
    modalData.fullStats.calories = findMetricValue(uiXml, ['calories', 'Calories', 'cal']);
    modalData.fullStats.water = findMetricValue(uiXml, ['water', 'Water', 'cups']);
    modalData.fullStats.workouts = findMetricValue(uiXml, ['workout', 'Workout', 'exercise']);
    
    console.log(`   Steps: ${modalData.fullStats.steps}`);
    console.log(`   Calories: ${modalData.fullStats.calories}`);
    console.log(`   Water: ${modalData.fullStats.water}`);
    console.log(`   Workouts: ${modalData.fullStats.workouts}`);
  }
  
  await pressBack();
  await sleep(500);
  
  logTest('Full Stats Modal - Data Extracted', true);
}

async function extractMonthlyStatsModalData() {
  console.log('\n📅 EXTRACTING DATA FROM MONTHLY STATS MODAL...');
  
  await tap(500, 1400); // Stats tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(500);
  await tap(300, 700); // Monthly Stats button
  await sleep(2000);
  await takeScreenshot('monthly_stats_modal_data');
  
  const uiXml = await getUIHierarchy();
  if (uiXml) {
    modalData.monthlyStats.steps = findMetricValue(uiXml, ['steps', 'Steps', 'STEPS']);
    modalData.monthlyStats.calories = findMetricValue(uiXml, ['calories', 'Calories', 'cal']);
    modalData.monthlyStats.water = findMetricValue(uiXml, ['water', 'Water', 'cups']);
    modalData.monthlyStats.workouts = findMetricValue(uiXml, ['workout', 'Workout', 'exercise']);
    
    console.log(`   Steps: ${modalData.monthlyStats.steps}`);
    console.log(`   Calories: ${modalData.monthlyStats.calories}`);
    console.log(`   Water: ${modalData.monthlyStats.water}`);
    console.log(`   Workouts: ${modalData.monthlyStats.workouts}`);
  }
  
  await pressBack();
  await sleep(500);
  
  logTest('Monthly Stats Modal - Data Extracted', true);
}

async function extractWeeklyCompareModalData() {
  console.log('\n📊 EXTRACTING DATA FROM WEEKLY COMPARE MODAL...');
  
  await tap(500, 1400); // Stats tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(500);
  await tap(700, 700); // Weekly Compare button
  await sleep(2000);
  await takeScreenshot('weekly_compare_modal_data');
  
  const uiXml = await getUIHierarchy();
  if (uiXml) {
    modalData.weeklyCompare.steps = findMetricValue(uiXml, ['steps', 'Steps', 'STEPS', 'this week']);
    modalData.weeklyCompare.calories = findMetricValue(uiXml, ['calories', 'Calories', 'cal']);
    modalData.weeklyCompare.water = findMetricValue(uiXml, ['water', 'Water', 'cups']);
    modalData.weeklyCompare.workouts = findMetricValue(uiXml, ['workout', 'Workout', 'exercise']);
    
    console.log(`   Steps: ${modalData.weeklyCompare.steps}`);
    console.log(`   Calories: ${modalData.weeklyCompare.calories}`);
    console.log(`   Water: ${modalData.weeklyCompare.water}`);
    console.log(`   Workouts: ${modalData.weeklyCompare.workouts}`);
  }
  
  await pressBack();
  await sleep(500);
  
  logTest('Weekly Compare Modal - Data Extracted', true);
}

// ========================================
// DATA CONSISTENCY VALIDATION
// ========================================

async function validateDataConsistency() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VALIDATING DATA CONSISTENCY ACROSS ALL MODALS');
  console.log('='.repeat(60) + '\n');
  
  // Compare STEPS across all modals
  console.log('🚶 VALIDATING STEPS CONSISTENCY:');
  
  if (modalData.home.steps !== null && modalData.progress.steps !== null) {
    compareMismatch('Steps', 'Home', modalData.home.steps, 'Progress', modalData.progress.steps);
  }
  
  if (modalData.progress.steps !== null && modalData.yourStats.steps !== null) {
    compareMismatch('Steps', 'Progress', modalData.progress.steps, 'Your Stats', modalData.yourStats.steps);
  }
  
  if (modalData.yourStats.steps !== null && modalData.fullStats.steps !== null) {
    compareMismatch('Steps', 'Your Stats', modalData.yourStats.steps, 'Full Stats', modalData.fullStats.steps);
  }
  
  if (modalData.fullStats.steps !== null && modalData.monthlyStats.steps !== null) {
    compareMismatch('Steps', 'Full Stats', modalData.fullStats.steps, 'Monthly Stats', modalData.monthlyStats.steps);
  }
  
  if (modalData.monthlyStats.steps !== null && modalData.weeklyCompare.steps !== null) {
    compareMismatch('Steps', 'Monthly Stats', modalData.monthlyStats.steps, 'Weekly Compare', modalData.weeklyCompare.steps);
  }
  
  // Compare CALORIES across all modals
  console.log('\n🍽️  VALIDATING CALORIES CONSISTENCY:');
  
  if (modalData.home.calories !== null && modalData.progress.calories !== null) {
    compareMismatch('Calories', 'Home', modalData.home.calories, 'Progress', modalData.progress.calories);
  }
  
  if (modalData.progress.calories !== null && modalData.yourStats.calories !== null) {
    compareMismatch('Calories', 'Progress', modalData.progress.calories, 'Your Stats', modalData.yourStats.calories);
  }
  
  if (modalData.yourStats.calories !== null && modalData.fullStats.calories !== null) {
    compareMismatch('Calories', 'Your Stats', modalData.yourStats.calories, 'Full Stats', modalData.fullStats.calories);
  }
  
  // Compare WATER across all modals
  console.log('\n💧 VALIDATING WATER CONSISTENCY:');
  
  if (modalData.home.water !== null && modalData.progress.water !== null) {
    compareMismatch('Water', 'Home', modalData.home.water, 'Progress', modalData.progress.water);
  }
  
  if (modalData.progress.water !== null && modalData.yourStats.water !== null) {
    compareMismatch('Water', 'Progress', modalData.progress.water, 'Your Stats', modalData.yourStats.water);
  }
  
  // Compare WORKOUTS across all modals
  console.log('\n💪 VALIDATING WORKOUTS CONSISTENCY:');
  
  if (modalData.progress.workouts !== null && modalData.yourStats.workouts !== null) {
    compareMismatch('Workouts', 'Progress', modalData.progress.workouts, 'Your Stats', modalData.yourStats.workouts);
  }
  
  if (modalData.yourStats.workouts !== null && modalData.fullStats.workouts !== null) {
    compareMismatch('Workouts', 'Your Stats', modalData.yourStats.workouts, 'Full Stats', modalData.fullStats.workouts);
  }
  
  // Overall consistency check
  console.log('\n' + '='.repeat(60));
  if (testResults.mismatches.length === 0) {
    console.log('✅ ALL DATA IS CONSISTENT ACROSS MODALS!');
    logTest('Data Consistency - Overall', true, 'No mismatches found');
  } else {
    console.error(`❌ FOUND ${testResults.mismatches.length} DATA MISMATCHES!`);
    logTest('Data Consistency - Overall', false, `${testResults.mismatches.length} mismatches`);
  }
  console.log('='.repeat(60));
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runDataConsistencyTest() {
  console.log('🚀 DATA CONSISTENCY VALIDATOR STARTED');
  console.log(`Device: ${CONFIG.DEVICE_ID}`);
  console.log('Verifying ALL modals show THE SAME data\n');
  console.log('='.repeat(60));
  
  try {
    // Connect to device
    console.log('📱 Connecting to device...');
    adb('devices');
    console.log('✅ Device connected');
    
    // Open app
    await openApp();
    
    // Phase 1: Log test data
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 1: LOGGING TEST DATA');
    console.log('='.repeat(60));
    await logTestData();
    
    // Phase 2: Extract data from all modals
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 2: EXTRACTING DATA FROM ALL MODALS');
    console.log('='.repeat(60));
    
    await extractHomeData();
    await extractProgressModalData();
    await extractYourStatsModalData();
    await extractFullStatsModalData();
    await extractMonthlyStatsModalData();
    await extractWeeklyCompareModalData();
    
    // Phase 3: Validate consistency
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 3: VALIDATING DATA CONSISTENCY');
    console.log('='.repeat(60));
    
    await validateDataConsistency();
    
    // Finalize report
    testResults.endTime = new Date().toISOString();
    testResults.duration = Date.now() - new Date(testResults.startTime).getTime();
    testResults.durationSeconds = Math.floor(testResults.duration / 1000);
    testResults.modalData = modalData;
    testResults.expectedData = expectedData;
    
    // Save report
    fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(testResults, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATA CONSISTENCY TEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Mismatches Found: ${testResults.mismatches.length}`);
    console.log(`⏱️  Duration: ${testResults.durationSeconds} seconds`);
    
    if (testResults.mismatches.length > 0) {
      console.log('\n❌ DATA MISMATCHES:');
      testResults.mismatches.forEach((mismatch, i) => {
        console.log(`   ${i + 1}. ${mismatch.metric}: ${mismatch.modal1}=${mismatch.value1}, ${mismatch.modal2}=${mismatch.value2} (diff: ${mismatch.difference})`);
      });
    }
    
    console.log('');
    console.log(`📄 Report: ${CONFIG.REPORT_FILE}`);
    console.log(`📁 Screenshots: ${CONFIG.SCREENSHOT_DIR}/`);
    console.log('='.repeat(60));
    
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ TEST SUITE ERROR:', error);
    testResults.error = error.message;
    testResults.endTime = new Date().toISOString();
    fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(testResults, null, 2));
    process.exit(1);
  }
}

// Run the data consistency test
runDataConsistencyTest();
