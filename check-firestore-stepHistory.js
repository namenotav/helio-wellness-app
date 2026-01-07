// Quick script to check what's actually in Firestore stepHistory
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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
const auth = getAuth(app);

// User ID from console logs
const userId = 'tr4egqwoMMWbnuMSZXDk6xRG9aq1';

async function checkStepHistory() {
  console.log('🔍 Checking Firestore for user:', userId);
  
  try {
    // Test auth first
    console.log('\n🔐 Testing Firebase Auth...');
    const userCred = await signInAnonymously(auth);
    console.log('✅ Signed in as:', userCred.user.uid);
    console.log('   Does UID match?', userCred.user.uid === userId);
    
    // Try to WRITE test data
    console.log('\n✍️ Testing WRITE permission...');
    try {
      const testRef = doc(db, 'users', userId, 'data', 'test');
      await setDoc(testRef, {
        value: 'test write',
        timestamp: new Date().toISOString()
      });
      console.log('✅ WRITE successful!');
    } catch (writeError) {
      console.log('❌ WRITE FAILED:', writeError.message);
      console.log('   Code:', writeError.code);
    }
    
    // Check all possible step-related collections
    const collections = [
      'stepHistory',
      'steps',
      'health_data',
      'stepBaseline',
      'weeklySteps'
    ];
    
    for (const collName of collections) {
      console.log(`\n📂 Checking: ${collName}`);
      const docRef = doc(db, 'users', userId, 'data', collName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`   ✅ Found! Type: ${typeof data.value}, IsArray: ${Array.isArray(data.value)}`);
        if (Array.isArray(data.value)) {
          console.log(`   📊 ${data.value.length} entries`);
          if (data.value.length > 0) {
            console.log(`   Sample:`, JSON.stringify(data.value[0], null, 2));
          }
        } else {
          console.log(`   Value:`, JSON.stringify(data.value).substring(0, 200));
        }
      } else {
        console.log(`   ❌ Not found`);
      }
    }
    
    // Now check stepHistory specifically
    const docRef = doc(db, 'users', userId, 'data', 'stepHistory');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📦 Raw Firestore document:', JSON.stringify(data, null, 2));
      console.log('\n📊 Value field type:', typeof data.value);
      console.log('📊 Value is array?', Array.isArray(data.value));
      
      if (Array.isArray(data.value)) {
        console.log(`\n✅ stepHistory contains ${data.value.length} entries`);
        console.log('\n📅 First 5 entries:');
        data.value.slice(0, 5).forEach((entry, i) => {
          console.log(`  ${i + 1}. Date: ${entry.date}, Steps: ${entry.steps}`);
        });
        
        console.log('\n📅 Last 5 entries:');
        data.value.slice(-5).forEach((entry, i) => {
          console.log(`  ${i + 1}. Date: ${entry.date}, Steps: ${entry.steps}`);
        });
        
        // Check for January 2026
        const jan2026 = data.value.filter(entry => {
          const d = new Date(entry.date);
          return d.getFullYear() === 2026 && d.getMonth() === 0;
        });
        
        console.log(`\n✅ January 2026 entries: ${jan2026.length}`);
        jan2026.forEach(entry => {
          console.log(`   - ${entry.date}: ${entry.steps} steps`);
        });
      } else {
        console.log('❌ ERROR: stepHistory value is NOT an array!');
        console.log('Value:', data.value);
      }
    } else {
      console.log('❌ No stepHistory document found in Firestore!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkStepHistory();
