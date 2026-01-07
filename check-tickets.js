// Check if support tickets exist in Firestore
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin with service account
const serviceAccount = JSON.parse(
  readFileSync('./service-account-key.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkTickets() {
  try {
    console.log('🔍 Checking support_tickets collection...');
    
    const ticketsRef = db.collection('support_tickets');
    const snapshot = await ticketsRef.orderBy('createdAt', 'desc').limit(10).get();
    
    console.log(`\n📋 Found ${snapshot.size} tickets\n`);
    
    if (snapshot.empty) {
      console.log('❌ No tickets found in Firestore');
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\nTicket ID: ${doc.id}`);
        console.log(`  Subject: ${data.subject}`);
        console.log(`  User: ${data.userName} (${data.userEmail})`);
        console.log(`  Status: ${data.status}`);
        console.log(`  Priority: ${data.priority}`);
        console.log(`  Created: ${data.createdAt?.toDate()}`);
        console.log(`  Responses: ${data.responses?.length || 0}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tickets:', error);
    process.exit(1);
  }
}

checkTickets();
