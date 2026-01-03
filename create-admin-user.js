import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUv69QXH4MNNR2wkr_wcVH_cbsYrc3wjo",
  authDomain: "wellnessai-app-e01be.firebaseapp.com",
  projectId: "wellnessai-app-e01be",
  storageBucket: "wellnessai-app-e01be.firebasestorage.app",
  messagingSenderId: "863551474584",
  appId: "1:863551474584:web:a34f3f77742b7be4e7f9ed",
  measurementId: "G-CB4C84PTJ3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log('🔐 Signing in...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'miphoma@gmail.com',
      'Elizabeth17!'
    );
    
    const uid = userCredential.user.uid;
    console.log('✅ Signed in! UID:', uid);
    
    console.log('📝 Creating/updating user document with admin flag...');
    await setDoc(doc(db, 'users', uid), {
      email: 'miphoma@gmail.com',
      isAdmin: true,
      createdAt: new Date(),
      role: 'admin'
    }, { merge: true }); // merge: true will update existing or create new
    
    console.log('✅ SUCCESS! Admin user created in Firestore');
    console.log('🎉 You can now access /admin in the app!');
    console.log('\nDocument path: users/' + uid);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
