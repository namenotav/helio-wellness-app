// Quick script to check Firebase data for user
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function checkUserData() {
  console.log('🔍 Searching Firebase for: miphoma@gmail.com');
  console.log('=' .repeat(60));
  
  try {
    // Get all users
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No users found in database');
      return;
    }
    
    const users = snapshot.val();
    let foundUser = null;
    let userId = null;
    
    // Search for user by email
    for (const [uid, userData] of Object.entries(users)) {
      if (userData.email === 'miphoma@gmail.com') {
        foundUser = userData;
        userId = uid;
        break;
      }
    }
    
    if (!foundUser) {
      console.log('❌ User miphoma@gmail.com NOT found in Firebase');
      console.log('📝 Available users:');
      Object.entries(users).forEach(([uid, data]) => {
        console.log(`   - ${data.email || 'No email'} (${uid})`);
      });
      return;
    }
    
    console.log('✅ USER FOUND!');
    console.log('User ID:', userId);
    console.log('Email:', foundUser.email);
    console.log('=' .repeat(60));
    
    // Check step data
    console.log('\n📊 STEP DATA:');
    console.log('-'.repeat(60));
    
    if (foundUser.stepBaseline !== undefined) {
      console.log('✅ stepBaseline:', foundUser.stepBaseline);
    } else {
      console.log('❌ stepBaseline: NOT FOUND');
    }
    
    if (foundUser.stepBaselineDate) {
      console.log('✅ stepBaselineDate:', foundUser.stepBaselineDate);
    } else {
      console.log('❌ stepBaselineDate: NOT FOUND');
    }
    
    if (foundUser.todaySteps !== undefined) {
      console.log('✅ todaySteps:', foundUser.todaySteps);
    } else {
      console.log('❌ todaySteps: NOT FOUND');
    }
    
    if (foundUser.weeklySteps) {
      console.log('✅ weeklySteps:', JSON.stringify(foundUser.weeklySteps, null, 2));
    } else {
      console.log('❌ weeklySteps: NOT FOUND');
    }
    
    if (foundUser.stepHistory) {
      console.log('✅ stepHistory:', foundUser.stepHistory.length || 0, 'entries');
      if (foundUser.stepHistory.length > 0) {
        console.log('   Latest:', foundUser.stepHistory[foundUser.stepHistory.length - 1]);
      }
    } else {
      console.log('❌ stepHistory: NOT FOUND');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 FULL USER PROFILE:');
    console.log('-'.repeat(60));
    console.log(JSON.stringify(foundUser, null, 2));
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RECOVERY STATUS:');
    console.log('-'.repeat(60));
    
    const hasStepData = foundUser.stepBaseline !== undefined || 
                        foundUser.weeklySteps || 
                        foundUser.stepHistory;
    
    if (hasStepData) {
      console.log('✅ STEP DATA EXISTS IN FIREBASE!');
      console.log('✅ Data can be recovered by logging into the app');
      console.log('✅ The app will automatically restore from Firebase');
    } else {
      console.log('❌ NO STEP DATA FOUND IN FIREBASE');
      console.log('⚠️  Data was never synced to cloud before uninstall');
      console.log('⚠️  Recovery not possible - must start fresh');
    }
    
  } catch (error) {
    console.error('❌ Error checking Firebase:', error.message);
  }
  
  process.exit(0);
}

checkUserData();
