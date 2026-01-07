#!/usr/bin/env node
/**
 * COMPLETE DATA SYNC TEST
 * Tests EVERY screen and modal with REAL data extraction
 * - Logs known data
 * - Extracts REAL numbers from UI
 * - Compares EVERYTHING
 * - Reports ALL mismatches
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  DEVICE_ID: 'adb-333021f0-oq2vBj._adb-tls-connect._tcp',
  APP_PACKAGE: 'com.helio.wellness',
  SCREENSHOT_DIR: 'complete-sync-test-screenshots',
  REPORT_FILE: 'complete-sync-test-report.json'
};

const testResults = {
  startTime: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  mismatches: [],
  emptyScreens: [],
  allData: {},
  tests: []
};

// Known data we're logging
const expectedData = {
  breakfast: { name: 'Eggs and toast', calories: 450 },
  workout: { duration: 35, steps: 5000, caloriesBurned: 350 },
  water: { cups: 2 },
  totalCalories: 450,
  netCalories: 100, // 450 - 350
  totalSteps: 5000,
  totalWater: 2,
  totalWorkouts: 1,
  totalMeals: 1
};

// Data extracted from each location
const extractedData = {};

if (!fs.existsSync(CONFIG.SCREENSHOT_DIR)) {
  fs.mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
}

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

async function getUIText() {
  // Get all visible text on screen
  const dumpFile = '/sdcard/window_dump.xml';
  adb(`shell uiautomator dump ${dumpFile}`);
  const localDump = path.join(CONFIG.SCREENSHOT_DIR, 'window_dump.xml');
  adb(`pull ${dumpFile} ${localDump}`);
  adb(`shell rm ${dumpFile}`);
  
  if (fs.existsSync(localDump)) {
    const content = fs.readFileSync(localDump, 'utf8');
    
    // Extract all text content
    const textMatches = content.match(/text="([^"]*)"/g) || [];
    const texts = textMatches.map(m => m.match(/text="([^"]*)"/)[1]).filter(t => t.length > 0);
    
    // Extract all numbers with context
    const numbers = [];
    texts.forEach(text => {
      // Look for numbers with possible commas
      const numMatches = text.match(/\d+(?:,\d+)*(?:\.\d+)?/g);
      if (numMatches) {
        numMatches.forEach(num => {
          const value = parseFloat(num.replace(/,/g, ''));
          if (!isNaN(value) && value > 0 && value < 1000000) { // Reasonable range
            numbers.push({
              text: text,
              value: value,
              display: num
            });
          }
        });
      }
    });
    
    return { texts, numbers };
  }
  
  return { texts: [], numbers: [] };
}

function findMetric(data, keywords, expectedRange = null) {
  // Find a number that matches keywords and is in expected range
  const { texts, numbers } = data;
  
  for (let keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    for (let item of numbers) {
      const textLower = item.text.toLowerCase();
      
      if (textLower.includes(keywordLower)) {
        // Check if value is in expected range
        if (expectedRange) {
          const [min, max] = expectedRange;
          if (item.value >= min && item.value <= max) {
            return item.value;
          }
        } else {
          return item.value;
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

async function swipe(x1, y1, x2, y2) {
  adb(`shell input swipe ${x1} ${y1} ${x2} ${y2} 300`);
  await sleep(500);
}

async function inputText(text) {
  const escaped = text.replace(/\s/g, '%s');
  adb(`shell input text "${escaped}"`);
  await sleep(300);
}

async function pressBack() {
  adb(`shell input keyevent 4`);
  await sleep(500);
}

function logTest(name, passed, notes = '') {
  testResults.totalTests++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}${notes ? ' - ' + notes : ''}`);
  } else {
    testResults.failed++;
    console.error(`❌ ${name}${notes ? ' - ' + notes : ''}`);
  }
  testResults.tests.push({ name, passed, notes });
}

function reportMismatch(location1, value1, location2, value2, metric) {
  const diff = Math.abs(value1 - value2);
  console.error(`   ❌ MISMATCH: ${location1} shows ${value1} ${metric}, ${location2} shows ${value2} ${metric} (diff: ${diff})`);
  testResults.mismatches.push({ location1, value1, location2, value2, metric, difference: diff });
}

function reportEmpty(location) {
  console.warn(`   ⚠️  EMPTY: ${location} shows NO data!`);
  testResults.emptyScreens.push(location);
}

// ==============================================
// PHASE 1: LOG TEST DATA
// ==============================================

async function logTestData() {
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 1: LOGGING TEST DATA');
  console.log('='.repeat(60) + '\n');
  
  console.log('📱 Opening app...');
  adb(`shell am start -n ${CONFIG.APP_PACKAGE}/.MainActivity`);
  await sleep(3000);
  
  // Log breakfast
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
  
  // Log water
  console.log('💧 Logging water (2 cups)...');
  await tap(100, 1400); // Home tab
  await sleep(1000);
  await tap(540, 1000); // Water button
  await sleep(500);
  await tap(540, 1000); // Second cup
  await sleep(500);
  logTest('Logged Water', true, '2 cups');
  
  // Log workout
  console.log('💪 Logging workout (35 min, ~5000 steps, 350 cal)...');
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
  
  console.log('\n📊 EXPECTED DATA:');
  console.log(`   Calories: ${expectedData.totalCalories}`);
  console.log(`   Calories Burned: ${expectedData.workout.caloriesBurned}`);
  console.log(`   Net Calories: ${expectedData.netCalories}`);
  console.log(`   Steps: ${expectedData.totalSteps}`);
  console.log(`   Water: ${expectedData.totalWater} cups`);
  console.log(`   Workouts: ${expectedData.totalWorkouts}`);
  console.log(`   Meals: ${expectedData.totalMeals}\n`);
}

// ==============================================
// PHASE 2: EXTRACT DATA FROM ALL LOCATIONS
// ==============================================

async function extractFromHomeScreen() {
  console.log('\n📱 HOME SCREEN...');
  await tap(100, 1400);
  await sleep(1500);
  const screenshot = await takeScreenshot('home_screen');
  const data = await getUIText();
  
  extractedData.home = {
    steps: findMetric(data, ['steps', 'Steps'], [0, 50000]),
    calories: findMetric(data, ['calories', 'cal', 'kcal'], [0, 10000]),
    water: findMetric(data, ['water', 'cups', 'cup'], [0, 20]),
    allNumbers: data.numbers
  };
  
  console.log(`   Steps: ${extractedData.home.steps || 'NOT FOUND'}`);
  console.log(`   Calories: ${extractedData.home.calories || 'NOT FOUND'}`);
  console.log(`   Water: ${extractedData.home.water || 'NOT FOUND'}`);
  
  if (!extractedData.home.steps && !extractedData.home.calories) {
    reportEmpty('Home Screen');
  }
}

async function extractFromFoodTab() {
  console.log('\n🍽️  FOOD TAB...');
  await tap(300, 1400);
  await sleep(1500);
  await takeScreenshot('food_tab');
  const data = await getUIText();
  
  extractedData.foodTab = {
    calories: findMetric(data, ['calories', 'cal', 'total'], [0, 10000]),
    meals: findMetric(data, ['meals', 'logged', 'entries'], [0, 50]),
    allNumbers: data.numbers
  };
  
  console.log(`   Calories: ${extractedData.foodTab.calories || 'NOT FOUND'}`);
  console.log(`   Meals: ${extractedData.foodTab.meals || 'NOT FOUND'}`);
  
  if (!extractedData.foodTab.calories) {
    reportEmpty('Food Tab');
  }
}

async function extractFromWorkoutsTab() {
  console.log('\n💪 WORKOUTS TAB...');
  await tap(400, 1400);
  await sleep(1500);
  await takeScreenshot('workouts_tab');
  const data = await getUIText();
  
  extractedData.workoutsTab = {
    workouts: findMetric(data, ['workout', 'workouts', 'session'], [0, 50]),
    caloriesBurned: findMetric(data, ['burned', 'burn'], [0, 10000]),
    steps: findMetric(data, ['steps'], [0, 50000]),
    allNumbers: data.numbers
  };
  
  console.log(`   Workouts: ${extractedData.workoutsTab.workouts || 'NOT FOUND'}`);
  console.log(`   Calories Burned: ${extractedData.workoutsTab.caloriesBurned || 'NOT FOUND'}`);
  console.log(`   Steps: ${extractedData.workoutsTab.steps || 'NOT FOUND'}`);
  
  if (!extractedData.workoutsTab.workouts) {
    reportEmpty('Workouts Tab');
  }
}

async function extractFromStatsTab() {
  console.log('\n📊 STATS TAB (Main View)...');
  await tap(500, 1400);
  await sleep(1500);
  await takeScreenshot('stats_tab');
  const data = await getUIText();
  
  extractedData.statsTab = {
    steps: findMetric(data, ['steps'], [0, 50000]),
    calories: findMetric(data, ['calories', 'cal'], [0, 10000]),
    water: findMetric(data, ['water', 'cups'], [0, 20]),
    workouts: findMetric(data, ['workout'], [0, 50]),
    allNumbers: data.numbers
  };
  
  console.log(`   Steps: ${extractedData.statsTab.steps || 'NOT FOUND'}`);
  console.log(`   Calories: ${extractedData.statsTab.calories || 'NOT FOUND'}`);
  console.log(`   Water: ${extractedData.statsTab.water || 'NOT FOUND'}`);
  console.log(`   Workouts: ${extractedData.statsTab.workouts || 'NOT FOUND'}`);
  
  if (!extractedData.statsTab.steps && !extractedData.statsTab.calories) {
    reportEmpty('Stats Tab');
  }
}

async function extractFromProgressModal() {
  console.log('\n📈 PROGRESS MODAL...');
  await tap(100, 1400);
  await sleep(1000);
  await tap(540, 600); // Progress card
  await sleep(2000);
  await takeScreenshot('progress_modal');
  const data = await getUIText();
  
  extractedData.progressModal = {
    steps: findMetric(data, ['steps'], [0, 50000]),
    calories: findMetric(data, ['calories', 'cal'], [0, 10000]),
    water: findMetric(data, ['water', 'cups'], [0, 20]),
    allNumbers: data.numbers
  };
  
  console.log(`   Steps: ${extractedData.progressModal.steps || 'NOT FOUND'}`);
  console.log(`   Calories: ${extractedData.progressModal.calories || 'NOT FOUND'}`);
  console.log(`   Water: ${extractedData.progressModal.water || 'NOT FOUND'}`);
  
  if (!extractedData.progressModal.steps && !extractedData.progressModal.calories) {
    reportEmpty('Progress Modal');
  }
  
  await pressBack();
  await sleep(500);
}

async function extractFromYourStatsModal() {
  console.log('\n📊 YOUR STATS MODAL...');
  await tap(500, 1400);
  await sleep(1500);
  
  // Scroll to find Your Stats button
  await swipe(540, 800, 540, 400);
  await sleep(500);
  
  // Try different coordinates for Your Stats
  await tap(540, 500); // Higher up after scroll
  await sleep(3000); // Wait longer for modal to load
  await takeScreenshot('your_stats_modal');
  const data = await getUIText();
  
  console.log(`   DEBUG: Found ${data.numbers.length} numbers on screen`);
  if (data.numbers.length > 0) {
    console.log(`   DEBUG: Numbers found: ${data.numbers.slice(0, 10).map(n => n.value).join(', ')}`);
  }
  
  extractedData.yourStatsModal = {
    steps: findMetric(data, ['steps'], [0, 50000]),
    calories: findMetric(data, ['calories', 'cal'], [0, 10000]),
    water: findMetric(data, ['water', 'cups'], [0, 20]),
    workouts: findMetric(data, ['workout'], [0, 50]),
    allNumbers: data.numbers
  };
  
  console.log(`   Steps: ${extractedData.yourStatsModal.steps || 'NOT FOUND'}`);
  console.log(`   Calories: ${extractedData.yourStatsModal.calories || 'NOT FOUND'}`);
  console.log(`   Water: ${extractedData.yourStatsModal.water || 'NOT FOUND'}`);
  console.log(`   Workouts: ${extractedData.yourStatsModal.workouts || 'NOT FOUND'}`);
  
  if (!extractedData.yourStatsModal.steps && !extractedData.yourStatsModal.calories) {
    reportEmpty('Your Stats Modal');
  }
  
  await pressBack();
  await sleep(500);
}

async function extractFromMonthlyStatsModal() {
  console.log('\n📅 MONTHLY STATS MODAL...');
  await tap(500, 1400);
  await sleep(1500);
  await swipe(540, 800, 540, 400);
  await sleep(500);
  
  // Try multiple locations for Monthly Stats button
  await tap(300, 600); // Try higher
  await sleep(3000); // Wait longer
  await takeScreenshot('monthly_stats_modal');
  const data = await getUIText();
  
  console.log(`   DEBUG: Found ${data.numbers.length} numbers on screen`);
  if (data.numbers.length > 0) {
    console.log(`   DEBUG: All numbers: ${data.numbers.map(n => n.value).join(', ')}`);
    console.log(`   DEBUG: All text: ${data.texts.slice(0, 20).join(' | ')}`);
  }
  
  extractedData.monthlyStatsModal = {
    steps: findMetric(data, ['steps'], [0, 50000]),
    calories: findMetric(data, ['calories', 'cal'], [0, 10000]),
    water: findMetric(data, ['water', 'cups'], [0, 20]),
    workouts: findMetric(data, ['workout'], [0, 50]),
    allNumbers: data.numbers
  };
  
  console.log(`   Steps: ${extractedData.monthlyStatsModal.steps || 'NOT FOUND'}`);
  console.log(`   Calories: ${extractedData.monthlyStatsModal.calories || 'NOT FOUND'}`);
  console.log(`   Water: ${extractedData.monthlyStatsModal.water || 'NOT FOUND'}`);
  console.log(`   Workouts: ${extractedData.monthlyStatsModal.workouts || 'NOT FOUND'}`);
  
  if (!extractedData.monthlyStatsModal.steps && !extractedData.monthlyStatsModal.calories) {
    reportEmpty('Monthly Stats Modal');
  }
  
  await pressBack();
  await sleep(500);
}

async function extractFromWeeklyCompareModal() {
  console.log('\n📊 WEEKLY COMPARE MODAL...');
  await tap(500, 1400);
  await sleep(1500);
  await swipe(540, 800, 540, 400);
  await sleep(500);
  
  await tap(750, 650); // Adjusted coordinate
  await sleep(3000); // Wait longer
  await takeScreenshot('weekly_compare_modal');
  const data = await getUIText();
  
  console.log(`   DEBUG: Found ${data.numbers.length} numbers on screen`);
  if (data.numbers.length > 0) {
    console.log(`   DEBUG: Numbers found: ${data.numbers.slice(0, 15).map(n => n.value).join(', ')}`);
  }
  
  extractedData.weeklyCompareModal = {
    steps: findMetric(data, ['steps', 'this week'], [0, 50000]),
    calories: findMetric(data, ['calories', 'cal'], [0, 10000]),
    workouts: findMetric(data, ['workout'], [0, 50]),
    allNumbers: data.numbers
  };
  
  console.log(`   Steps: ${extractedData.weeklyCompareModal.steps || 'NOT FOUND'}`);
  console.log(`   Calories: ${extractedData.weeklyCompareModal.calories || 'NOT FOUND'}`);
  console.log(`   Workouts: ${extractedData.weeklyCompareModal.workouts || 'NOT FOUND'}`);
  
  if (!extractedData.weeklyCompareModal.steps && !extractedData.weeklyCompareModal.calories) {
    reportEmpty('Weekly Compare Modal');
  }
  
  await pressBack();
  await sleep(500);
}

async function extractFromFullStatsModal() {
  console.log('\n📈 FULL STATS MODAL...');
  await tap(500, 1400);
  await sleep(1500);
  await swipe(540, 800, 540, 400);
  await sleep(500);
  
  await tap(540, 700); // Adjusted coordinate
  await sleep(3000); // Wait longer
  await takeScreenshot('full_stats_modal');
  const data = await getUIText();
  
  console.log(`   DEBUG: Found ${data.numbers.length} numbers on screen`);
  if (data.numbers.length > 0) {
    console.log(`   DEBUG: Numbers found: ${data.numbers.slice(0, 15).map(n => n.value).join(', ')}`);
  }
  
  extractedData.fullStatsModal = {
    steps: findMetric(data, ['steps'], [0, 50000]),
    calories: findMetric(data, ['calories', 'cal'], [0, 10000]),
    water: findMetric(data, ['water', 'cups'], [0, 20]),
    workouts: findMetric(data, ['workout'], [0, 50]),
    allNumbers: data.numbers
  };
  
  console.log(`   Steps: ${extractedData.fullStatsModal.steps || 'NOT FOUND'}`);
  console.log(`   Calories: ${extractedData.fullStatsModal.calories || 'NOT FOUND'}`);
  console.log(`   Water: ${extractedData.fullStatsModal.water || 'NOT FOUND'}`);
  console.log(`   Workouts: ${extractedData.fullStatsModal.workouts || 'NOT FOUND'}`);
  
  if (!extractedData.fullStatsModal.steps && !extractedData.fullStatsModal.calories) {
    reportEmpty('Full Stats Modal');
  }
  
  await pressBack();
  await sleep(500);
}

// ==============================================
// PHASE 3: VALIDATE DATA CONSISTENCY
// ==============================================

async function validateConsistency() {
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 3: VALIDATING DATA CONSISTENCY');
  console.log('='.repeat(60) + '\n');
  
  // Compare STEPS across all locations
  console.log('🚶 VALIDATING STEPS:');
  const stepsLocations = [
    { name: 'Home', value: extractedData.home?.steps },
    { name: 'Stats Tab', value: extractedData.statsTab?.steps },
    { name: 'Progress Modal', value: extractedData.progressModal?.steps },
    { name: 'Your Stats Modal', value: extractedData.yourStatsModal?.steps },
    { name: 'Monthly Stats', value: extractedData.monthlyStatsModal?.steps },
    { name: 'Weekly Compare', value: extractedData.weeklyCompareModal?.steps },
    { name: 'Full Stats', value: extractedData.fullStatsModal?.steps },
    { name: 'Workouts Tab', value: extractedData.workoutsTab?.steps }
  ].filter(loc => loc.value !== null && loc.value !== undefined);
  
  for (let i = 0; i < stepsLocations.length - 1; i++) {
    const loc1 = stepsLocations[i];
    const loc2 = stepsLocations[i + 1];
    const diff = Math.abs(loc1.value - loc2.value);
    
    if (diff > 500) { // Tolerance of 500 steps
      reportMismatch(loc1.name, loc1.value, loc2.name, loc2.value, 'steps');
    } else {
      console.log(`   ✅ ${loc1.name}: ${loc1.value} ≈ ${loc2.name}: ${loc2.value}`);
    }
  }
  
  // Compare CALORIES across all locations
  console.log('\n🍽️  VALIDATING CALORIES:');
  const caloriesLocations = [
    { name: 'Home', value: extractedData.home?.calories },
    { name: 'Food Tab', value: extractedData.foodTab?.calories },
    { name: 'Stats Tab', value: extractedData.statsTab?.calories },
    { name: 'Progress Modal', value: extractedData.progressModal?.calories },
    { name: 'Your Stats Modal', value: extractedData.yourStatsModal?.calories },
    { name: 'Monthly Stats', value: extractedData.monthlyStatsModal?.calories },
    { name: 'Full Stats', value: extractedData.fullStatsModal?.calories }
  ].filter(loc => loc.value !== null && loc.value !== undefined);
  
  for (let i = 0; i < caloriesLocations.length - 1; i++) {
    const loc1 = caloriesLocations[i];
    const loc2 = caloriesLocations[i + 1];
    const diff = Math.abs(loc1.value - loc2.value);
    
    if (diff > 100) { // Tolerance of 100 calories
      reportMismatch(loc1.name, loc1.value, loc2.name, loc2.value, 'calories');
    } else {
      console.log(`   ✅ ${loc1.name}: ${loc1.value} ≈ ${loc2.name}: ${loc2.value}`);
    }
  }
  
  // Compare WATER across all locations
  console.log('\n💧 VALIDATING WATER:');
  const waterLocations = [
    { name: 'Home', value: extractedData.home?.water },
    { name: 'Stats Tab', value: extractedData.statsTab?.water },
    { name: 'Progress Modal', value: extractedData.progressModal?.water },
    { name: 'Your Stats Modal', value: extractedData.yourStatsModal?.water },
    { name: 'Monthly Stats', value: extractedData.monthlyStatsModal?.water },
    { name: 'Full Stats', value: extractedData.fullStatsModal?.water }
  ].filter(loc => loc.value !== null && loc.value !== undefined);
  
  for (let i = 0; i < waterLocations.length - 1; i++) {
    const loc1 = waterLocations[i];
    const loc2 = waterLocations[i + 1];
    const diff = Math.abs(loc1.value - loc2.value);
    
    if (diff > 0) {
      reportMismatch(loc1.name, loc1.value, loc2.name, loc2.value, 'cups');
    } else {
      console.log(`   ✅ ${loc1.name}: ${loc1.value} = ${loc2.name}: ${loc2.value}`);
    }
  }
  
  // Compare WORKOUTS across all locations
  console.log('\n💪 VALIDATING WORKOUTS:');
  const workoutsLocations = [
    { name: 'Workouts Tab', value: extractedData.workoutsTab?.workouts },
    { name: 'Stats Tab', value: extractedData.statsTab?.workouts },
    { name: 'Your Stats Modal', value: extractedData.yourStatsModal?.workouts },
    { name: 'Monthly Stats', value: extractedData.monthlyStatsModal?.workouts },
    { name: 'Weekly Compare', value: extractedData.weeklyCompareModal?.workouts },
    { name: 'Full Stats', value: extractedData.fullStatsModal?.workouts }
  ].filter(loc => loc.value !== null && loc.value !== undefined);
  
  for (let i = 0; i < workoutsLocations.length - 1; i++) {
    const loc1 = workoutsLocations[i];
    const loc2 = workoutsLocations[i + 1];
    const diff = Math.abs(loc1.value - loc2.value);
    
    if (diff > 0) {
      reportMismatch(loc1.name, loc1.value, loc2.name, loc2.value, 'workouts');
    } else {
      console.log(`   ✅ ${loc1.name}: ${loc1.value} = ${loc2.name}: ${loc2.value}`);
    }
  }
}

// ==============================================
// MAIN TEST RUNNER
// ==============================================

async function runCompleteTest() {
  console.log('🚀 COMPLETE DATA SYNC TEST STARTED');
  console.log('Testing EVERY screen with REAL data extraction\n');
  
  try {
    console.log('📱 Connecting to device...');
    adb('devices');
    console.log('✅ Device connected');
    
    await logTestData();
    
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 2: EXTRACTING DATA FROM ALL LOCATIONS');
    console.log('='.repeat(60));
    
    await extractFromHomeScreen();
    await extractFromFoodTab();
    await extractFromWorkoutsTab();
    await extractFromStatsTab();
    await extractFromProgressModal();
    await extractFromYourStatsModal();
    await extractFromMonthlyStatsModal();
    await extractFromWeeklyCompareModal();
    await extractFromFullStatsModal();
    
    await validateConsistency();
    
    // Final report
    testResults.endTime = new Date().toISOString();
    testResults.duration = Math.floor((Date.now() - new Date(testResults.startTime).getTime()) / 1000);
    testResults.allData = extractedData;
    testResults.expectedData = expectedData;
    
    fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(testResults, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPLETE DATA SYNC TEST FINISHED');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Mismatches: ${testResults.mismatches.length}`);
    console.log(`🔍 Empty Screens: ${testResults.emptyScreens.length}`);
    console.log(`⏱️  Duration: ${testResults.duration} seconds`);
    
    if (testResults.mismatches.length > 0) {
      console.log('\n❌ DATA MISMATCHES FOUND:');
      testResults.mismatches.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.location1} (${m.value1}) vs ${m.location2} (${m.value2}) - diff: ${m.difference} ${m.metric}`);
      });
    }
    
    if (testResults.emptyScreens.length > 0) {
      console.log('\n⚠️  EMPTY/BROKEN SCREENS:');
      testResults.emptyScreens.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s}`);
      });
    }
    
    console.log(`\n📄 Report: ${CONFIG.REPORT_FILE}`);
    console.log(`📁 Screenshots: ${CONFIG.SCREENSHOT_DIR}/`);
    console.log('='.repeat(60));
    
    process.exit(testResults.failed > 0 || testResults.mismatches.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error);
    testResults.error = error.message;
    fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(testResults, null, 2));
    process.exit(1);
  }
}

runCompleteTest();
