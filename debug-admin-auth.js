// Debug: Check what auth state is being used when updating ticket
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function debugAdminAuth() {
  try {
    console.log('\n🔍 [DEBUG] Checking Firebase Auth Users...\n');
    
    // List all users
    const listUsersResult = await auth.listUsers(10);
    listUsersResult.users.forEach((userRecord) => {
      console.log('User UID:', userRecord.uid);
      console.log('User Email:', userRecord.email);
      console.log('Email Verified:', userRecord.emailVerified);
      console.log('Provider:', userRecord.providerData.map(p => p.providerId).join(', '));
      console.log('---');
    });
    
    console.log('\n🔍 [DEBUG] Checking /admins collection in Firestore...\n');
    
    // Check admins collection
    const adminsSnapshot = await db.collection('admins').get();
    if (adminsSnapshot.empty) {
      console.log('❌ No admins found in /admins collection!');
    } else {
      adminsSnapshot.forEach((doc) => {
        console.log('Admin Doc ID (UID):', doc.id);
        console.log('Admin Data:', doc.data());
        console.log('---');
      });
    }
    
    console.log('\n✅ [DEBUG] Analysis complete\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

debugAdminAuth();
