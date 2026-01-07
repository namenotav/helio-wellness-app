// Add admin UID to Firestore /admins collection for secure ticket updates
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('C:/Users/Admin/Downloads/wellnessai-app-e01be-firebase-adminsdk-fbsvc-0cc8c5583a.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function addAdminToFirestore() {
  try {
    // Get admin user by email
    const adminEmail = 'miphoma@gmail.com';
    console.log(`Looking up user: ${adminEmail}`);
    
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log(`✅ Found user: ${userRecord.uid}`);
    
    // Add to /admins collection with their UID
    await db.collection('admins').doc(userRecord.uid).set({
      email: adminEmail,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      canReplyToTickets: true,
      canUpdateTicketStatus: true
    });
    
    console.log(`✅ Admin UID ${userRecord.uid} added to /admins collection`);
    console.log('✅ Admin can now reply to support tickets!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAdminToFirestore();
