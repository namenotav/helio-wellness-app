// Test if we can actually write to Firestore with the current user
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
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

const testUserId = 'tr4egqwoMMWbnuMSZXDk6xRG9aq1'; // From console logs

async function testFirestore() {
  console.log('🔍 Testing Firestore write permissions...\n');
  
  try {
    // Step 1: Sign in anonymously
    console.log('1️⃣ Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    console.log('   ✅ Signed in, UID:', userCredential.user.uid);
    console.log('   📋 User from logs:', testUserId);
    console.log('   ⚠️ UID MISMATCH:', userCredential.user.uid !== testUserId);
    
    // Step 2: Try to write with the logged-in user's UID
    console.log('\n2️⃣ Attempting write to OWN UID path...');
    const ownDocRef = doc(db, 'users', userCredential.user.uid, 'data', 'test_write');
    try {
      await setDoc(ownDocRef, {
        value: { message: 'Test write', timestamp: Date.now() },
        updatedAt: new Date().toISOString(),
        key: 'test_write'
      });
      console.log('   ✅ Write to own UID succeeded!');
      
      // Try to read it back
      const snap = await getDoc(ownDocRef);
      if (snap.exists()) {
        console.log('   ✅ Read back successful:', snap.data());
      }
    } catch (err) {
      console.log('   ❌ Write to own UID FAILED:', err.code, err.message);
    }
    
    // Step 3: Try to write to the user ID from logs
    console.log('\n3️⃣ Attempting write to LOGGED USER path:', testUserId);
    const loggedUserDocRef = doc(db, 'users', testUserId, 'data', 'test_write');
    try {
      await setDoc(loggedUserDocRef, {
        value: { message: 'Test write to logged user', timestamp: Date.now() },
        updatedAt: new Date().toISOString(),
        key: 'test_write'
      });
      console.log('   ✅ Write to logged user UID succeeded!');
    } catch (err) {
      console.log('   ❌ Write to logged user UID FAILED:', err.code, err.message);
      console.log('   📋 This explains why stepHistory is empty!');
    }
    
    // Step 4: Try to write test stepHistory
    console.log('\n4️⃣ Testing stepHistory write...');
    const stepHistoryRef = doc(db, 'users', userCredential.user.uid, 'data', 'stepHistory');
    const testStepHistory = [
      { date: '2026-01-06', steps: 4493, timestamp: Date.now() },
      { date: '2026-01-05', steps: 3200, timestamp: Date.now() - 86400000 },
      { date: '2026-01-04', steps: 5100, timestamp: Date.now() - 172800000 }
    ];
    
    try {
      await setDoc(stepHistoryRef, {
        value: testStepHistory,
        updatedAt: new Date().toISOString(),
        key: 'stepHistory'
      });
      console.log('   ✅ stepHistory write succeeded!');
      console.log('   📊 Saved:', testStepHistory.length, 'entries');
      
      // Read it back
      const stepSnap = await getDoc(stepHistoryRef);
      if (stepSnap.exists()) {
        const data = stepSnap.data();
        console.log('   ✅ Read back successful!');
        console.log('   📊 Data type:', typeof data.value);
        console.log('   📊 Is array:', Array.isArray(data.value));
        console.log('   📊 Length:', data.value.length);
      }
    } catch (err) {
      console.log('   ❌ stepHistory write FAILED:', err.code, err.message);
    }
    
    // Step 5: Check if the logged user exists at all
    console.log('\n5️⃣ Checking if logged user exists in Firestore...');
    const loggedUserCheck = doc(db, 'users', testUserId, 'data', 'stepHistory');
    try {
      const snap = await getDoc(loggedUserCheck);
      if (snap.exists()) {
        console.log('   ✅ Logged user HAS stepHistory!');
        console.log('   📊 Data:', JSON.stringify(snap.data(), null, 2));
      } else {
        console.log('   ❌ Logged user has NO stepHistory document');
      }
    } catch (err) {
      console.log('   ❌ Cannot read logged user data:', err.code);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('   Current auth UID:', userCredential.user.uid);
    console.log('   App is using:', testUserId);
    console.log('   ⚠️ If these differ, writes fail due to security rules!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFirestore();
