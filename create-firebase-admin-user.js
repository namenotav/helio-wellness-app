// Create admin user in Firebase Auth with specific UID
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function createAdminUser() {
  const adminEmail = 'miphoma@gmail.com';
  const adminPassword = 'Admin@Helio2026!'; // Use a strong password
  const adminUID = 'iI3Wext3hKNotphutrozhEkZ5QO2'; // Must match Firestore /admins collection
  
  try {
    console.log('\n🔐 Creating admin user in Firebase Auth...\n');
    
    // Try to get user first
    try {
      const existingUser = await auth.getUser(adminUID);
      console.log('✅ User already exists with UID:', existingUser.uid);
      console.log('   Email:', existingUser.email);
      
      // Update email if needed
      if (existingUser.email !== adminEmail) {
        console.log('\n📝 Updating email...');
        await auth.updateUser(adminUID, {
          email: adminEmail,
          emailVerified: true
        });
        console.log('✅ Email updated to:', adminEmail);
      }
      
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // User doesn't exist, create it
    console.log('Creating new user with UID:', adminUID);
    const userRecord = await auth.createUser({
      uid: adminUID,
      email: adminEmail,
      password: adminPassword,
      emailVerified: true,
      disabled: false
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('   UID:', userRecord.uid);
    console.log('   Email:', userRecord.email);
    console.log('   Password:', adminPassword);
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('\n✅ You can now login to the admin dashboard with:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
  
  process.exit(0);
}

createAdminUser();
