// Check if step baseline is backing up to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDl_S6z7hoCiInqHdNYvBXZBm87AFlmUo8",
  authDomain: "wellnessai-b7c05.firebaseapp.com",
  projectId: "wellnessai-b7c05",
  storageBucket: "wellnessai-b7c05.firebasestorage.app",
  messagingSenderId: "280691185279",
  appId: "1:280691185279:web:9c2b58c6a8b8c0c0f8b8c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkBaselineBackup() {
  console.log('🔍 CHECKING STEP BASELINE FIRESTORE BACKUP...\n');
  
  try {
    // Check for any stepCounterBaseline documents
    const baselinesRef = collection(db, 'stepCounterBaseline');
    const snapshot = await getDocs(baselinesRef);
    
    if (snapshot.empty) {
      console.log('❌ NO BASELINE BACKUPS FOUND IN FIRESTORE');
      console.log('⚠️  Either:');
      console.log('   1. App hasn\'t backed up yet (wait 3+ seconds with app open)');
      console.log('   2. User not logged in');
      console.log('   3. Backup code not running');
      return;
    }
    
    console.log(`✅ FOUND ${snapshot.size} BASELINE BACKUP(S):\n`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = new Date(data.timestamp);
      const age = Math.floor((Date.now() - data.timestamp) / 1000);
      
      console.log(`📍 User ID: ${doc.id}`);
      console.log(`   Baseline: ${data.baseline} steps`);
      console.log(`   Date: ${data.date}`);
      console.log(`   Last Backup: ${timestamp.toLocaleString()}`);
      console.log(`   Age: ${age} seconds ago`);
      console.log('');
    });
    
    // Check if backup is fresh (within last 10 seconds)
    const freshBackup = Array.from(snapshot.docs).find(doc => {
      const age = (Date.now() - doc.data().timestamp) / 1000;
      return age < 10;
    });
    
    if (freshBackup) {
      console.log('✅ BACKUP IS ACTIVE (updated within last 10 seconds)');
      console.log('✅ Reinstall recovery will work perfectly!');
    } else {
      console.log('⚠️  Backup exists but is older than 10 seconds');
      console.log('⚠️  Make sure app is open on phone with screen on');
    }
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error.message);
  }
  
  process.exit(0);
}

checkBaselineBackup();
