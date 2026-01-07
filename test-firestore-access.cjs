const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://wellnessai-app-e01be.firebaseio.com'
});

const db = admin.firestore();

async function testFirestoreAccess() {
  console.log('\n🔍 FIRESTORE ACCESS DIAGNOSTIC\n');
  
  const targetUID = 'iI3Wext3hKNotphutrozhEkZ5QO2';
  
  // Test 1: Can we read rules?
  console.log('📋 Test 1: Checking deployed rules...');
  try {
    // Just verify we can connect
    const testDoc = await db.collection('support_tickets').limit(1).get();
    console.log('✅ Connection to Firestore: OK');
    console.log(`   Found ${testDoc.size} existing tickets`);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
  
  // Test 2: Check if user exists in Auth
  console.log('\n📋 Test 2: Checking Firebase Auth user...');
  try {
    const userRecord = await admin.auth().getUser(targetUID);
    console.log('✅ User exists in Firebase Auth:');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Email verified: ${userRecord.emailVerified}`);
    console.log(`   Created: ${userRecord.metadata.creationTime}`);
    console.log(`   Providers: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);
  } catch (error) {
    console.error('❌ User not found in Firebase Auth:', error.message);
  }
  
  // Test 3: Check admin status
  console.log('\n📋 Test 3: Checking admin status...');
  const adminDoc = await db.collection('admins').doc(targetUID).get();
  if (adminDoc.exists) {
    console.log('✅ User IS an admin:');
    console.log('   Data:', JSON.stringify(adminDoc.data(), null, 2));
  } else {
    console.log('❌ User is NOT an admin');
  }
  
  // Test 4: Try to create ticket with Admin SDK
  console.log('\n📋 Test 4: Creating test ticket with Admin SDK...');
  try {
    const testTicket = {
      userId: targetUID,
      userEmail: 'miphoma@gmail.com',
      userName: 'Test',
      subject: 'Admin SDK Test ' + Date.now(),
      message: 'Testing from Admin SDK',
      category: 'technical',
      priority: 'standard',
      status: 'open',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      responses: []
    };
    
    const docRef = await db.collection('support_tickets').add(testTicket);
    console.log('✅ Admin SDK ticket created:', docRef.id);
  } catch (error) {
    console.error('❌ Admin SDK failed:', error.message);
  }
  
  // Test 5: Check rules deployment time
  console.log('\n📋 Test 5: Rules deployment status...');
  console.log('⏱️ Rules were deployed at: ~02:16 (current time: ' + new Date().toLocaleTimeString() + ')');
  const deployTime = new Date('2026-01-04T02:16:49');
  const now = new Date();
  const minutesSince = Math.floor((now - deployTime) / 1000 / 60);
  console.log(`   Time since deployment: ${minutesSince} minutes`);
  
  if (minutesSince < 3) {
    console.log('⚠️ Rules may still be propagating (wait 3-5 minutes)');
  } else {
    console.log('✅ Enough time has passed for rules to propagate');
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. If < 3 minutes: Wait for rules to propagate');
  console.log('2. Check Firebase Console → Authentication → Sign-in methods');
  console.log('3. Verify Email/Password provider is ENABLED');
  console.log('4. If still failing: Clear app cache and re-authenticate');
  console.log('\n🔗 Firebase Console: https://console.firebase.google.com/project/wellnessai-app-e01be/authentication/providers\n');
  
  process.exit(0);
}

testFirestoreAccess().catch(console.error);
