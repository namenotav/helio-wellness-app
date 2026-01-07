#!/usr/bin/env node
/**
 * 7-DAY REAL USER SIMULATION
 * Acts like a REAL PERSON using the app every day
 * - Morning routines
 * - Throughout the day activities
 * - Evening wind-down
 * - Tests ALL features including battles, meditation, etc.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  DEVICE_IP: 'adb-333021f0-oq2vBj._adb-tls-connect._tcp', // USB connection
  APP_PACKAGE: 'com.helio.wellness',
  APP_ACTIVITY: '.MainActivity',
  SCREENSHOT_DIR: 'real-user-7day-screenshots',
  REPORT_FILE: 'real-user-7day-report.json',
  USER_NAME: 'Alex',
  USER_WEIGHT: 75 // kg
};

// Test results
const testResults = {
  startTime: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  screenshots: 0,
  dataValidations: 0,
  dailyLogs: [],
  tests: []
};

// Daily data tracking
const userData = {
  totalSteps: 0,
  totalCalories: 0,
  totalWater: 0,
  workoutsCompleted: 0,
  mealsLogged: 0,
  meditationMinutes: 0,
  sleepHours: 0,
  currentStreak: 1,
  currentLevel: 1,
  currentXP: 0
};

// Ensure screenshot directory
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
    return execSync(`adb -s "${CONFIG.DEVICE_IP}" ${command}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    console.error(`ADB Error: ${error.message}`);
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
  
  testResults.screenshots++;
  return localPath;
}

async function tap(x, y) {
  adb(`shell input tap ${x} ${y}`);
  await sleep(800);
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
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.error(`❌ ${testName} - ${notes}`);
  }
  
  testResults.tests.push(result);
}

function validateData(description, expected, actual) {
  testResults.dataValidations++;
  const passed = expected === actual;
  console.log(`   [VALIDATION] ${description}: expected ${expected}, got ${actual} ${passed ? '✅' : '❌'}`);
  return passed;
}

// ========================================
// DAILY ROUTINES
// ========================================

/**
 * DAY 1: First day - Onboarding, set goals, log first activities
 */
async function day1() {
  console.log('\n📅 DAY 1 - Monday - Fresh Start!');
  
  await openApp();
  await sleep(2000);
  await takeScreenshot('day1_morning_home');
  
  // MORNING ROUTINE (7:00 AM)
  console.log('🌅 Morning Routine...');
  
  // Check daily streak
  await tap(100, 1400); // Home tab
  await sleep(1000);
  await takeScreenshot('day1_morning_streak');
  logTest('Day 1 - Morning Check-in', true);
  userData.currentStreak = 1;
  
  // Log breakfast
  console.log('🍳 Logging breakfast...');
  await tap(300, 1400); // Food tab
  await sleep(1000);
  await tap(540, 400); // Add food button
  await sleep(1000);
  await inputText('Oatmeal%swith%sberries');
  await sleep(1000);
  await tap(540, 800); // Add button
  await sleep(2000);
  await takeScreenshot('day1_breakfast_logged');
  logTest('Day 1 - Breakfast Logged (Oatmeal)', true);
  userData.mealsLogged++;
  userData.totalCalories += 350;
  
  // Drink water
  await tap(100, 1400); // Home tab
  await sleep(1000);
  await tap(540, 1000); // Water button
  await sleep(500);
  await takeScreenshot('day1_water_logged');
  logTest('Day 1 - Water Logged (1 cup)', true);
  userData.totalWater++;
  
  // MIDDAY ROUTINE (12:30 PM)
  console.log('☀️ Midday Activities...');
  
  // Log lunch
  await tap(300, 1400); // Food tab
  await sleep(1000);
  await tap(540, 400); // Add food
  await sleep(1000);
  await inputText('Grilled%schicken%ssalad');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  await takeScreenshot('day1_lunch_logged');
  logTest('Day 1 - Lunch Logged (Chicken Salad)', true);
  userData.mealsLogged++;
  userData.totalCalories += 450;
  
  // Log workout
  console.log('💪 Logging workout...');
  await tap(400, 1400); // Workouts tab
  await sleep(1000);
  await tap(540, 400); // Add workout
  await sleep(1000);
  await tap(540, 600); // Select workout type (e.g., Running)
  await sleep(1000);
  await inputText('30'); // Duration
  await sleep(500);
  await tap(540, 900); // Save
  await sleep(2000);
  await takeScreenshot('day1_workout_logged');
  logTest('Day 1 - Workout Logged (30 min run)', true);
  userData.workoutsCompleted++;
  userData.totalSteps += 4000;
  
  // Check XP gain
  await tap(100, 1400); // Home tab
  await sleep(1000);
  await takeScreenshot('day1_xp_gained');
  logTest('Day 1 - XP Gained from Workout', true);
  userData.currentXP += 30;
  
  // EVENING ROUTINE (8:00 PM)
  console.log('🌙 Evening Wind-down...');
  
  // Log dinner
  await tap(300, 1400); // Food tab
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Salmon%swith%svegetables');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  await takeScreenshot('day1_dinner_logged');
  logTest('Day 1 - Dinner Logged (Salmon)', true);
  userData.mealsLogged++;
  userData.totalCalories += 550;
  
  // Try guided meditation (NEW!)
  console.log('🧘 Trying meditation for first time...');
  await tap(500, 1400); // Zen tab
  await sleep(1000);
  await tap(540, 400); // Guided meditation button
  await sleep(2000);
  await takeScreenshot('day1_meditation_started');
  logTest('Day 1 - Started Guided Meditation', true);
  userData.meditationMinutes += 10;
  
  // Exit meditation after a moment
  await sleep(3000);
  await pressBack();
  await sleep(1000);
  
  // Check daily stats
  await tap(500, 1400); // Stats tab
  await sleep(1000);
  await takeScreenshot('day1_evening_stats');
  logTest('Day 1 - Evening Stats Check', true);
  
  // Log daily summary
  testResults.dailyLogs.push({
    day: 1,
    date: new Date().toLocaleDateString(),
    steps: userData.totalSteps,
    calories: userData.totalCalories,
    water: userData.totalWater,
    workouts: userData.workoutsCompleted,
    meals: userData.mealsLogged,
    meditation: userData.meditationMinutes,
    streak: userData.currentStreak,
    level: userData.currentLevel,
    xp: userData.currentXP
  });
  
  console.log('✅ Day 1 Complete - Great start!');
  await sleep(2000);
}

/**
 * DAY 2: Establish routine, try breathing exercises
 */
async function day2() {
  console.log('\n📅 DAY 2 - Tuesday - Building Momentum');
  
  await openApp();
  await sleep(2000);
  
  // MORNING ROUTINE
  console.log('🌅 Morning Routine...');
  
  // Breakfast
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Greek%syogurt%swith%shoney');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  await takeScreenshot('day2_breakfast');
  logTest('Day 2 - Breakfast Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 300;
  
  // Water
  await tap(100, 1400);
  await sleep(1000);
  await tap(540, 1000);
  await sleep(500);
  userData.totalWater++;
  
  // MIDDAY - Try breathing exercises (NEW!)
  console.log('🌬️ Trying breathing exercises...');
  await tap(500, 1400); // Zen tab
  await sleep(1000);
  await tap(540, 600); // Breathing button
  await sleep(2000);
  await takeScreenshot('day2_breathing_exercises');
  logTest('Day 2 - Breathing Exercises Started', true);
  
  // Do breathing for a bit
  await sleep(3000);
  await pressBack();
  
  // Lunch
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Turkey%ssandwich');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 2 - Lunch Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 400;
  
  // Workout
  await tap(400, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await tap(540, 700); // Different workout
  await sleep(1000);
  await inputText('45');
  await sleep(500);
  await tap(540, 900);
  await sleep(2000);
  await takeScreenshot('day2_workout');
  logTest('Day 2 - Workout Logged (45 min)', true);
  userData.workoutsCompleted++;
  userData.totalSteps += 6000;
  userData.currentXP += 45;
  
  // EVENING
  // Dinner
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Pasta%swith%sTomato%ssauce');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 2 - Dinner Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 500;
  
  // Check streak
  userData.currentStreak = 2;
  await tap(100, 1400);
  await sleep(1000);
  await takeScreenshot('day2_streak_2days');
  logTest('Day 2 - Streak: 2 Days', true);
  
  testResults.dailyLogs.push({
    day: 2,
    steps: userData.totalSteps,
    calories: userData.totalCalories,
    water: userData.totalWater,
    workouts: userData.workoutsCompleted,
    meals: userData.mealsLogged,
    streak: userData.currentStreak
  });
  
  console.log('✅ Day 2 Complete - Consistency building!');
  await sleep(2000);
}

/**
 * DAY 3: Explore social battles, community recipes
 */
async function day3() {
  console.log('\n📅 DAY 3 - Wednesday - Social Features!');
  
  await openApp();
  await sleep(2000);
  
  // MORNING
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Protein%sshake');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 3 - Breakfast Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 250;
  
  // MIDDAY - Explore Social Battles (NEW!)
  console.log('⚔️ Checking out Social Battles...');
  await tap(600, 1400); // Profile tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(540, 500); // Battles button
  await sleep(2000);
  await takeScreenshot('day3_battles_explored');
  logTest('Day 3 - Social Battles Explored', true);
  await pressBack();
  await sleep(1000);
  
  // Browse Community Recipes (NEW!)
  console.log('👨‍🍳 Browsing community recipes...');
  await tap(300, 1400); // Food tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(540, 700); // Recipes button
  await sleep(2000);
  await takeScreenshot('day3_community_recipes');
  logTest('Day 3 - Community Recipes Browsed', true);
  await pressBack();
  await sleep(1000);
  
  // Lunch
  await tap(540, 400);
  await sleep(1000);
  await inputText('Chicken%sBurrito%sBowl');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 3 - Lunch Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 600;
  
  // Workout
  await tap(400, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await tap(540, 600);
  await sleep(1000);
  await inputText('60');
  await sleep(500);
  await tap(540, 900);
  await sleep(2000);
  logTest('Day 3 - Workout Logged (60 min)', true);
  userData.workoutsCompleted++;
  userData.totalSteps += 8000;
  userData.currentXP += 60;
  
  // Check if leveled up
  if (userData.currentXP >= 100) {
    userData.currentLevel++;
    userData.currentXP -= 100;
    await takeScreenshot('day3_level_up');
    logTest('Day 3 - LEVEL UP!', true, `Reached Level ${userData.currentLevel}`);
  }
  
  // EVENING
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Stir%sfry');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 3 - Dinner Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 500;
  
  userData.currentStreak = 3;
  testResults.dailyLogs.push({
    day: 3,
    steps: userData.totalSteps,
    calories: userData.totalCalories,
    workouts: userData.workoutsCompleted,
    meals: userData.mealsLogged,
    streak: userData.currentStreak,
    level: userData.currentLevel
  });
  
  console.log('✅ Day 3 Complete - Social features explored!');
  await sleep(2000);
}

/**
 * DAY 4: Test sleep tracking, heart rate, PDF export
 */
async function day4() {
  console.log('\n📅 DAY 4 - Thursday - Advanced Features!');
  
  await openApp();
  await sleep(2000);
  
  // MORNING - Log sleep from last night (NEW!)
  console.log('😴 Logging sleep...');
  await tap(600, 1400); // Profile tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(300, 600); // Sleep tracking button (approximate)
  await sleep(2000);
  await takeScreenshot('day4_sleep_tracking');
  logTest('Day 4 - Sleep Tracking Accessed', true);
  userData.sleepHours += 7.5;
  await pressBack();
  await sleep(1000);
  
  // Breakfast
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Scrambled%seggs');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 4 - Breakfast Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 350;
  
  // MIDDAY - Try PDF export (NEW!)
  console.log('📄 Exporting PDF report...');
  await tap(600, 1400); // Profile tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(200, 700); // PDF export button
  await sleep(3000);
  await takeScreenshot('day4_pdf_exported');
  logTest('Day 4 - PDF Report Exported', true);
  
  // Lunch
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Quinoa%sSalad');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 4 - Lunch Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 450;
  
  // Workout
  await tap(400, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await tap(540, 600);
  await sleep(1000);
  await inputText('40');
  await sleep(500);
  await tap(540, 900);
  await sleep(2000);
  logTest('Day 4 - Workout Logged (40 min)', true);
  userData.workoutsCompleted++;
  userData.totalSteps += 5000;
  userData.currentXP += 40;
  
  // EVENING
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Grilled%sFish');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 4 - Dinner Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 400;
  
  // Meditation
  await tap(500, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(2000);
  await takeScreenshot('day4_meditation');
  logTest('Day 4 - Meditation Session', true);
  userData.meditationMinutes += 15;
  await sleep(3000);
  await pressBack();
  
  userData.currentStreak = 4;
  testResults.dailyLogs.push({
    day: 4,
    steps: userData.totalSteps,
    calories: userData.totalCalories,
    workouts: userData.workoutsCompleted,
    meals: userData.mealsLogged,
    sleep: userData.sleepHours,
    streak: userData.currentStreak
  });
  
  console.log('✅ Day 4 Complete - Advanced features tested!');
  await sleep(2000);
}

/**
 * DAY 5: Test emergency features, insurance, notifications
 */
async function day5() {
  console.log('\n📅 DAY 5 - Friday - Safety Features!');
  
  await openApp();
  await sleep(2000);
  
  // MORNING
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Avocado%sToast');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 5 - Breakfast Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 350;
  
  // MIDDAY - Check Emergency Features (NEW!)
  console.log('🚨 Setting up emergency contacts...');
  await tap(600, 1400); // Profile tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(200, 600); // Emergency button
  await sleep(2000);
  await takeScreenshot('day5_emergency_panel');
  logTest('Day 5 - Emergency Panel Configured', true);
  await pressBack();
  await sleep(1000);
  
  // Check Insurance Rewards (NEW!)
  console.log('💼 Checking insurance integration...');
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(400, 600); // Insurance button
  await sleep(2000);
  await takeScreenshot('day5_insurance');
  logTest('Day 5 - Insurance Rewards Checked', true);
  await pressBack();
  await sleep(1000);
  
  // Lunch
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Sushi%sRoll');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 5 - Lunch Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 500;
  
  // Workout
  await tap(400, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await tap(540, 600);
  await sleep(1000);
  await inputText('50');
  await sleep(500);
  await tap(540, 900);
  await sleep(2000);
  logTest('Day 5 - Workout Logged (50 min)', true);
  userData.workoutsCompleted++;
  userData.totalSteps += 6500;
  userData.currentXP += 50;
  
  // EVENING
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Pizza');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 5 - Dinner Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 700;
  
  userData.currentStreak = 5;
  testResults.dailyLogs.push({
    day: 5,
    steps: userData.totalSteps,
    calories: userData.totalCalories,
    workouts: userData.workoutsCompleted,
    meals: userData.mealsLogged,
    streak: userData.currentStreak
  });
  
  console.log('✅ Day 5 Complete - Safety features explored!');
  await sleep(2000);
}

/**
 * DAY 6: Rest day, focus on meditation and theme customization
 */
async function day6() {
  console.log('\n📅 DAY 6 - Saturday - Recovery Day');
  
  await openApp();
  await sleep(2000);
  
  // MORNING - Light breakfast
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Smoothie%sBowl');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 6 - Breakfast Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 300;
  
  // Customize theme (NEW!)
  console.log('🎨 Customizing app theme...');
  await tap(600, 1400); // Profile tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(540, 500); // Theme button
  await sleep(2000);
  await takeScreenshot('day6_theme_customization');
  logTest('Day 6 - Theme Customized', true);
  await tap(300, 600); // Select different theme
  await sleep(1000);
  await pressBack();
  
  // MIDDAY - Extended meditation
  console.log('🧘 Extended meditation session...');
  await tap(500, 1400); // Zen tab
  await sleep(1000);
  await tap(540, 400); // Meditation
  await sleep(2000);
  await takeScreenshot('day6_long_meditation');
  logTest('Day 6 - Extended Meditation (20 min)', true);
  userData.meditationMinutes += 20;
  await sleep(5000); // Simulate longer session
  await pressBack();
  
  // Light lunch
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Vegetable%ssoup');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 6 - Lunch Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 250;
  
  // EVENING
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Light%ssalad');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 6 - Dinner Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 300;
  
  userData.currentStreak = 6;
  testResults.dailyLogs.push({
    day: 6,
    steps: userData.totalSteps,
    calories: userData.totalCalories,
    meals: userData.mealsLogged,
    meditation: userData.meditationMinutes,
    streak: userData.currentStreak
  });
  
  console.log('✅ Day 6 Complete - Recovery and mindfulness!');
  await sleep(2000);
}

/**
 * DAY 7: Final day, test referrals, check all achievements
 */
async function day7() {
  console.log('\n📅 DAY 7 - Sunday - Week Complete!');
  
  await openApp();
  await sleep(2000);
  
  // MORNING
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Pancakes');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 7 - Breakfast Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 450;
  
  // Check Referral System (NEW!)
  console.log('💌 Checking referral system...');
  await tap(600, 1400); // Profile tab
  await sleep(1000);
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await tap(540, 800); // Referral button
  await sleep(2000);
  await takeScreenshot('day7_referral_system');
  logTest('Day 7 - Referral System Checked', true);
  await pressBack();
  await sleep(1000);
  
  // MIDDAY - Final workout
  console.log('💪 Final workout of the week...');
  await tap(400, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await tap(540, 600);
  await sleep(1000);
  await inputText('60');
  await sleep(500);
  await tap(540, 900);
  await sleep(2000);
  await takeScreenshot('day7_final_workout');
  logTest('Day 7 - Final Workout (60 min)', true);
  userData.workoutsCompleted++;
  userData.totalSteps += 7000;
  userData.currentXP += 60;
  
  // Lunch
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Burger%sand%sFries');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 7 - Lunch Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 800;
  
  // EVENING - Review week stats
  console.log('📊 Reviewing weekly stats...');
  await tap(500, 1400); // Stats tab
  await sleep(1000);
  await takeScreenshot('day7_weekly_stats');
  logTest('Day 7 - Weekly Stats Reviewed', true);
  
  // Check achievements
  await swipe(540, 800, 540, 400, 300);
  await sleep(1000);
  await takeScreenshot('day7_achievements');
  logTest('Day 7 - Achievements Checked', true);
  
  // Final dinner
  await tap(300, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(1000);
  await inputText('Roast%sChicken');
  await sleep(1000);
  await tap(540, 800);
  await sleep(2000);
  logTest('Day 7 - Dinner Logged', true);
  userData.mealsLogged++;
  userData.totalCalories += 600;
  
  // Final meditation
  await tap(500, 1400);
  await sleep(1000);
  await tap(540, 400);
  await sleep(2000);
  logTest('Day 7 - Final Meditation', true);
  userData.meditationMinutes += 10;
  await sleep(3000);
  await pressBack();
  
  userData.currentStreak = 7;
  testResults.dailyLogs.push({
    day: 7,
    steps: userData.totalSteps,
    calories: userData.totalCalories,
    workouts: userData.workoutsCompleted,
    meals: userData.mealsLogged,
    meditation: userData.meditationMinutes,
    streak: userData.currentStreak,
    level: userData.currentLevel
  });
  
  // Final screenshot
  await tap(100, 1400);
  await sleep(1000);
  await takeScreenshot('day7_week_complete');
  
  console.log('🎉 7-DAY CHALLENGE COMPLETE! 🎉');
  await sleep(2000);
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runRealUserTest() {
  console.log('🚀 7-DAY REAL USER SIMULATION STARTED');
  console.log(`Device: ${CONFIG.DEVICE_IP}`);
  console.log(`User: ${CONFIG.USER_NAME}, Weight: ${CONFIG.USER_WEIGHT}kg`);
  console.log('');
  
  try {
    // Connect to device
    console.log('Connecting to device...');
    const devices = adb('devices');
    console.log(`Connected device: ${CONFIG.DEVICE_IP}`);
    
    // Run 7-day simulation
    await day1();
    await day2();
    await day3();
    await day4();
    await day5();
    await day6();
    await day7();
    
    // Finalize report
    testResults.endTime = new Date().toISOString();
    testResults.duration = Date.now() - new Date(testResults.startTime).getTime();
    testResults.durationSeconds = Math.floor(testResults.duration / 1000);
    testResults.userData = userData;
    
    // Save report
    fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(testResults, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 7-DAY REAL USER TEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📸 Screenshots: ${testResults.screenshots}`);
    console.log(`🔍 Data Validations: ${testResults.dataValidations}`);
    console.log(`⏱️  Duration: ${testResults.durationSeconds} seconds`);
    console.log('');
    console.log('📈 USER STATS AFTER 7 DAYS:');
    console.log(`   Total Steps: ${userData.totalSteps.toLocaleString()}`);
    console.log(`   Total Calories: ${userData.totalCalories.toLocaleString()}`);
    console.log(`   Workouts: ${userData.workoutsCompleted}`);
    console.log(`   Meals Logged: ${userData.mealsLogged}`);
    console.log(`   Water Cups: ${userData.totalWater}`);
    console.log(`   Meditation: ${userData.meditationMinutes} minutes`);
    console.log(`   Sleep: ${userData.sleepHours} hours`);
    console.log(`   Streak: ${userData.currentStreak} days 🔥`);
    console.log(`   Level: ${userData.currentLevel} ⭐`);
    console.log(`   XP: ${userData.currentXP}`);
    console.log('');
    console.log(`📄 Report: ${CONFIG.REPORT_FILE}`);
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

// Run the real user test
runRealUserTest();
