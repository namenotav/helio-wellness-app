// Set Admin Role - Run this ONCE to grant admin access
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDm6kELRs3PC6xPQDXBBsVOKdDN_bTMQvE",
  authDomain: "wellnessai-app-e01be.firebaseapp.com",
  projectId: "wellnessai-app-e01be",
  storageBucket: "wellnessai-app-e01be.firebasestorage.app",
  messagingSenderId: "421608927740",
  appId: "1:421608927740:web:0ca47f4e52af30bccf4b6d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function setAdminRole() {
  try {
    console.log('🔐 Logging in as miphoma@gmail.com...');
    const userCredential = await signInWithEmailAndPassword(auth, 'miphoma@gmail.com', 'Elizabeth17!');
    const userId = userCredential.user.uid;
    
    console.log('✅ Logged in! User ID:', userId);
    console.log('📝 Setting isAdmin: true...');
    
    await setDoc(doc(db, 'users', userId), {
      isAdmin: true,
      adminSince: new Date().toISOString(),
      email: 'miphoma@gmail.com'
    }, { merge: true });
    
    console.log('✅ SUCCESS! Admin role granted to miphoma@gmail.com');
    console.log('🎉 You can now access /admin dashboard!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminRole();
