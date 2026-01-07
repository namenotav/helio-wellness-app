import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('C:/Users/Admin/Downloads/wellnessai-app-e01be-firebase-adminsdk-fbsvc-0cc8c5583a.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const OLD_UID = 'tr4egqwoMMWbnuMSZXDk6xRG9aq1';
const NEW_UID = 'tr4egqwoMMWbnuMSZXDkOBjfYk93';

async function recoverData() {
  console.log(`\n🔍 Checking OLD UID data: ${OLD_UID}`);
  console.log(`🔍 Will copy to NEW UID: ${NEW_UID}\n`);
  
  const collections = [
    'stepHistory',
    'workoutHistory', 
    'waterLog',
    'sleepLog',
    'weeklySteps',
    'health_data',
    'foodLog',
    'battles_data',
    'gamification_data'
  ];
  
  let recovered = 0;
  
  for (const collectionName of collections) {
    try {
      const oldDoc = await db.doc(`users/${OLD_UID}/data/${collectionName}`).get();
      
      if (oldDoc.exists) {
        const data = oldDoc.data();
        console.log(`✅ Found ${collectionName}: ${JSON.stringify(data).length} bytes`);
        
        // Copy to new UID
        await db.doc(`users/${NEW_UID}/data/${collectionName}`).set(data);
        console.log(`   → Copied to new UID`);
        recovered++;
      } else {
        console.log(`❌ ${collectionName}: Not found in old UID`);
      }
    } catch (error) {
      console.error(`❌ Error with ${collectionName}:`, error.message);
    }
  }
  
  console.log(`\n✅ Recovery complete! Recovered ${recovered} collections.`);
  console.log(`\nReinstall the app and your data will be there!`);
}

recoverData().then(() => process.exit(0)).catch(err => {
  console.error('Recovery failed:', err);
  process.exit(1);
});
