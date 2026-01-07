const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://wellnessai-app-e01be.firebaseio.com'
});

const db = admin.firestore();

async function debugPermissions() {
  console.log('\n🔍 PERMISSION DEBUGGING\n');
  
  // Check admins collection
  console.log('📋 Checking admins collection...');
  const adminsSnapshot = await db.collection('admins').get();
  console.log(`Found ${adminsSnapshot.size} admins:`);
  adminsSnapshot.forEach(doc => {
    console.log(`  - Admin UID: ${doc.id}`);
    console.log(`    Email: ${doc.data().email || 'N/A'}`);
  });
  
  // Check if miphoma@gmail.com UID exists in admins
  const targetUID = 'iI3Wext3hKNotphutrozhEkZ5QO2';
  console.log(`\n🔍 Checking if UID ${targetUID} is an admin...`);
  const adminDoc = await db.collection('admins').doc(targetUID).get();
  if (adminDoc.exists) {
    console.log('✅ YES - User IS in admins collection');
    console.log('   Data:', adminDoc.data());
  } else {
    console.log('❌ NO - User is NOT in admins collection');
    console.log('   This means they can CREATE tickets but not READ them as admin');
  }
  
  // Try to create a test ticket with this UID
  console.log('\n🔥 Testing ticket creation with Firebase Admin SDK...');
  try {
    const testTicket = {
      userId: targetUID,
      userEmail: 'miphoma@gmail.com',
      userName: 'Julian',
      subject: 'Test from Admin SDK',
      message: 'Testing permissions',
      category: 'technical',
      priority: 'standard',
      status: 'open',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      responses: []
    };
    
    const docRef = await db.collection('support_tickets').add(testTicket);
    console.log('✅ SUCCESS! Ticket created with ID:', docRef.id);
    
    // Try to read it back
    const readDoc = await docRef.get();
    console.log('✅ Can read ticket:', readDoc.exists);
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }
  
  // Check Firestore rules
  console.log('\n📜 Note: Rules deployed, but client SDK requires:');
  console.log('   1. request.auth != null (for create)');
  console.log('   2. request.auth.uid == resource.data.userId (for read)');
  console.log('\n💡 If client still fails, possible causes:');
  console.log('   - Rules cache (wait 1-2 minutes)');
  console.log('   - Client auth token expired (re-authenticate)');
  console.log('   - Firebase SDK not using correct project');
  
  process.exit(0);
}

debugPermissions().catch(console.error);
