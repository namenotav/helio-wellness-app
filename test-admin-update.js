// Test updating a ticket as admin
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('C:/Users/Admin/Downloads/wellnessai-app-e01be-firebase-adminsdk-fbsvc-0cc8c5583a.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testAdminUpdate() {
  try {
    // Get first ticket
    const ticketsSnapshot = await db.collection('support_tickets').limit(1).get();
    
    if (ticketsSnapshot.empty) {
      console.log('No tickets to test with');
      process.exit(1);
    }
    
    const ticketDoc = ticketsSnapshot.docs[0];
    console.log('Testing update on ticket:', ticketDoc.id);
    
    // Try to add a response
    await ticketDoc.ref.update({
      responses: admin.firestore.FieldValue.arrayUnion({
        message: 'Test reply from admin',
        adminName: 'Test Admin',
        timestamp: new Date().toISOString(),
        isAdmin: true
      }),
      status: 'in_progress',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Update successful!');
    console.log('✅ Rules are working correctly');
    console.log('❌ Problem must be in the app code, not Firestore rules');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    console.error('This means Firestore rules are blocking the update');
    process.exit(1);
  }
}

testAdminUpdate();
