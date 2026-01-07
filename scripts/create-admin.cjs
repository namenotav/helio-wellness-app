#!/usr/bin/env node

/**
 * Admin Management Script
 * Creates/manages admin users in Firestore for support dashboard access
 * 
 * Usage:
 *   node scripts/create-admin.cjs add admin@example.com
 *   node scripts/create-admin.cjs remove admin@example.com
 *   node scripts/create-admin.cjs list
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function addAdmin(email) {
  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email format');
      return false;
    }

    // Check if user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log(`✅ Found Firebase user: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️  No Firebase Auth user found for ${email}`);
        const create = await question('Create Firebase Auth account for this email? (y/n): ');
        
        if (create.toLowerCase() === 'y') {
          const password = await question('Enter password (min 8 characters): ');
          if (password.length < 8) {
            console.error('❌ Password must be at least 8 characters');
            return false;
          }
          
          userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: true
          });
          console.log(`✅ Created Firebase Auth user: ${userRecord.uid}`);
        } else {
          console.log('❌ Admin account requires Firebase Auth user');
          return false;
        }
      } else {
        throw error;
      }
    }

    // Add to admins collection
    await db.collection('admins').doc(userRecord.uid).set({
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: {
        viewAllTickets: true,
        respondToTickets: true,
        updateTicketStatus: true,
        deleteTickets: true
      }
    });

    console.log(`✅ Added ${email} to admins collection (UID: ${userRecord.uid})`);
    console.log('✅ User can now access Admin Support Dashboard');
    return true;

  } catch (error) {
    console.error('❌ Error adding admin:', error.message);
    return false;
  }
}

async function removeAdmin(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    
    await db.collection('admins').doc(userRecord.uid).delete();
    
    console.log(`✅ Removed ${email} from admins (UID: ${userRecord.uid})`);
    console.log('⚠️  Firebase Auth account still exists, but admin access revoked');
    return true;

  } catch (error) {
    console.error('❌ Error removing admin:', error.message);
    return false;
  }
}

async function listAdmins() {
  try {
    const snapshot = await db.collection('admins').get();
    
    if (snapshot.empty) {
      console.log('📋 No admins found');
      return;
    }

    console.log('\n📋 Current Admins:\n');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.email} (UID: ${doc.id})`);
      console.log(`    Role: ${data.role}`);
      console.log(`    Created: ${data.createdAt?.toDate().toLocaleString() || 'Unknown'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];

  console.log('🔐 Admin Management Script\n');

  if (!command) {
    console.log('Usage:');
    console.log('  node scripts/create-admin.cjs add admin@example.com');
    console.log('  node scripts/create-admin.cjs remove admin@example.com');
    console.log('  node scripts/create-admin.cjs list');
    rl.close();
    process.exit(0);
  }

  switch (command) {
    case 'add':
      if (!email) {
        console.error('❌ Email required: node scripts/create-admin.cjs add admin@example.com');
        break;
      }
      await addAdmin(email);
      break;

    case 'remove':
      if (!email) {
        console.error('❌ Email required: node scripts/create-admin.cjs remove admin@example.com');
        break;
      }
      await removeAdmin(email);
      break;

    case 'list':
      await listAdmins();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Valid commands: add, remove, list');
  }

  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
