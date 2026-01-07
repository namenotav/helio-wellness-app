// Check what's ACTUALLY in Firestore for this user
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUv69QXH4MNNR2wkr_wcVH_cbsYrc3wjo",
  authDomain: "wellnessai-app-e01be.firebaseapp.com",
  projectId: "wellnessai-app-e01be",
  storageBucket: "wellnessai-app-e01be.firebasestorage.app",
  messagingSenderId: "863551474584",
  appId: "1:863551474584:web:a34f3f77742b7be4e7f9ed"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = 'tr4egqwoMMWbnuMSZXDk6xRG9aq1';

async function checkAllData() {
  console.log('🔍 Checking ALL Firestore data for user:', userId);
  console.log('=' .repeat(80));
  
  const keys = [
    'stepHistory',
    'workoutHistory',
    'waterLog',
    'sleepLog',
    'weeklySteps',
    'health_data',
    'stepBaseline',
    'loginHistory',
    'battles_data',
    'gamification_data'
  ];
  
  for (const key of keys) {
    try {
      const docRef = doc(db, 'users', userId, 'data', key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const value = data.value;
        
        console.log(`\n✅ ${key}:`);
        console.log(`   Type: ${typeof value}`);
        console.log(`   IsArray: ${Array.isArray(value)}`);
        
        if (Array.isArray(value)) {
          console.log(`   Length: ${value.length} entries`);
          if (value.length > 0) {
            console.log(`   First entry:`, JSON.stringify(value[0]));
            console.log(`   Last entry:`, JSON.stringify(value[value.length - 1]));
            
            // Check for January 2026 data
            if (key === 'stepHistory' || key === 'workoutHistory' || key === 'waterLog') {
              const jan2026 = value.filter(entry => {
                const date = entry.date || (entry.timestamp && new Date(entry.timestamp).toISOString().split('T')[0]);
                if (date) {
                  const d = new Date(date);
                  return d.getFullYear() === 2026 && d.getMonth() === 0;
                }
                return false;
              });
              console.log(`   📅 January 2026 entries: ${jan2026.length}`);
            }
          }
        } else if (typeof value === 'object') {
          console.log(`   Object keys:`, Object.keys(value));
          console.log(`   Sample:`, JSON.stringify(value).substring(0, 200));
        } else {
          console.log(`   Value:`, value);
        }
      } else {
        console.log(`\n❌ ${key}: Not found`);
      }
    } catch (error) {
      console.log(`\n❌ ${key}: Error -`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Summary:');
  console.log('If stepHistory, workoutHistory, waterLog are empty or not found,');
  console.log('then MonthlyStatsModal will show 0 for everything.');
}

checkAllData();
