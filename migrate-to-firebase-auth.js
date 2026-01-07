/**
 * Firebase Auth Migration Script
 * 
 * Problem: Users created accounts with custom authService (local storage only)
 * Solution: Create Firebase Auth accounts for existing local users
 * 
 * This script:
 * 1. Reads local users from Preferences storage
 * 2. For each user without Firebase Auth account:
 *    - Creates Firebase Auth account with same email/password
 *    - Signs in to Firebase Auth
 *    - Syncs profile to Firestore
 * 
 * Usage: node migrate-to-firebase-auth.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account
const serviceAccount = JSON.parse(
  readFileSync('./service-account-key.json', 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const auth = admin.auth();
const db = admin.firestore();

/**
 * Create Firebase Auth account for existing local user
 */
async function migrateUser(email, password, userData) {
  try {
    console.log(`\n🔄 Migrating user: ${email}`);
    
    // Check if user already exists in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
      console.log(`✅ Firebase Auth account already exists: ${firebaseUser.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new Firebase Auth user
        console.log(`📝 Creating Firebase Auth account...`);
        firebaseUser = await auth.createUser({
          email: email,
          password: password, // Use the original password
          displayName: userData.name || userData.displayName,
          emailVerified: false
        });
        console.log(`✅ Created Firebase Auth account: ${firebaseUser.uid}`);
      } else {
        throw error;
      }
    }
    
    // Create or update user profile in Firestore
    console.log(`💾 Syncing profile to Firestore...`);
    const userProfile = {
      email: email,
      displayName: userData.name || userData.displayName,
      createdAt: userData.createdAt || new Date().toISOString(),
      profile: userData.profile || {},
      stats: userData.stats || {},
      subscription: userData.subscription || {
        plan: 'free',
        active: false
      },
      uid: firebaseUser.uid,
      id: firebaseUser.uid, // Use Firebase UID as user ID
      migratedAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(firebaseUser.uid).set(userProfile, { merge: true });
    console.log(`✅ Profile synced to Firestore`);
    
    // Set custom claims if admin
    if (email === 'miphoma@gmail.com') {
      await auth.setCustomUserClaims(firebaseUser.uid, { admin: true });
      console.log(`👑 Admin role set`);
      
      // Add to admins collection
      await db.collection('admins').doc(firebaseUser.uid).set({
        email: email,
        createdAt: new Date().toISOString()
      });
      console.log(`👑 Added to admins collection`);
    }
    
    return {
      success: true,
      uid: firebaseUser.uid
    };
  } catch (error) {
    console.error(`❌ Migration failed for ${email}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log(`\n🚀 Firebase Auth Migration Script`);
  console.log(`================================\n`);
  
  // Manual user data (from your local storage)
  // You'll need to provide the original password for migration
  const localUsers = [
    {
      email: 'miphoma@gmail.com',
      password: 'YOUR_PASSWORD_HERE', // ⚠️ REPLACE WITH ACTUAL PASSWORD
      name: 'Julian',
      createdAt: '2025-12-13T15:49:30.357Z',
      profile: {
        age: null,
        gender: null,
        height: null,
        weight: null,
        goalSteps: 10000,
        notifications: true
      },
      stats: {
        totalSteps: 0,
        totalDays: 0,
        longestStreak: 0,
        currentStreak: 0
      }
    }
    // Add more users if needed
  ];
  
  if (localUsers[0].password === 'YOUR_PASSWORD_HERE') {
    console.error(`\n❌ ERROR: You must set the actual password in localUsers array!`);
    console.error(`Edit this script and replace 'YOUR_PASSWORD_HERE' with your actual password.\n`);
    process.exit(1);
  }
  
  // Migrate each user
  const results = [];
  for (const user of localUsers) {
    const result = await migrateUser(user.email, user.password, user);
    results.push({ email: user.email, ...result });
  }
  
  // Summary
  console.log(`\n\n📊 Migration Summary`);
  console.log(`==================`);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log(`\n🎉 Migration complete! Users can now:`);
    console.log(`   1. Sign in normally (authService will use Firebase Auth)`);
    console.log(`   2. Create support tickets (Firestore permissions will work)`);
    console.log(`   3. Access admin dashboard (if admin role was set)`);
    console.log(`\n⚠️  Users must sign in again to establish Firebase Auth session.`);
  }
  
  process.exit(0);
}

// Run migration
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
