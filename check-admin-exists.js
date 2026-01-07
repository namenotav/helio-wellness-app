// Check if admin exists in Firestore
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('C:/Users/Admin/Downloads/wellnessai-app-e01be-firebase-adminsdk-fbsvc-0cc8c5583a.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAdmin() {
  try {
    const adminEmail = 'miphoma@gmail.com';
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    console.log(`Admin UID: ${userRecord.uid}`);
    
    const adminDoc = await db.collection('admins').doc(userRecord.uid).get();
    
    if (adminDoc.exists) {
      console.log('✅ Admin document EXISTS in Firestore');
      console.log('Admin data:', adminDoc.data());
    } else {
      console.log('❌ Admin document DOES NOT EXIST');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
