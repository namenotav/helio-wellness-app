#!/usr/bin/env node

/**
 * Batch 3 Quick Verification Script
 * Run with: node batch3-verify.js
 */

console.log(`
╔═══════════════════════════════════════════════════════════╗
║         BATCH 3 - FEATURE VERIFICATION SCRIPT            ║
╚═══════════════════════════════════════════════════════════╝
`);

const fs = require('fs');
const path = require('path');

// Files that must exist
const requiredFiles = [
  'src/services/supportTicketService.js',
  'src/services/featureFlagService.js',
  'src/services/moneyEscrowService.js',
  'src/services/adMobService.js',
  'src/components/SupportModal.jsx',
  'src/components/SupportModal.css'
];

// Check if files exist
console.log('📁 Checking required files...\n');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Some files are missing! Run batch 3 implementation again.\n');
  process.exit(1);
}

console.log('\n✅ All required files exist!\n');

// Check for known bugs
console.log('🔍 Checking for known bugs...\n');

const supportService = fs.readFileSync('src/services/supportTicketService.js', 'utf8');
const escrowService = fs.readFileSync('src/services/moneyEscrowService.js', 'utf8');
const featureFlagService = fs.readFileSync('src/services/featureFlagService.js', 'utf8');

let bugCount = 0;

// Bug 1: Firestore import
if (supportService.includes("from 'firestore'")) {
  console.log("❌ BUG: supportTicketService.js has wrong Firestore import");
  console.log("   Expected: from 'firebase/firestore'");
  console.log("   Found: from 'firestore'\n");
  bugCount++;
} else {
  console.log("✅ supportTicketService.js Firestore import is correct\n");
}

if (featureFlagService.includes("from 'firestore'")) {
  console.log("❌ BUG: featureFlagService.js has wrong Firestore import");
  console.log("   Expected: from 'firebase/firestore'");
  console.log("   Found: from 'firestore'\n");
  bugCount++;
} else {
  console.log("✅ featureFlagService.js Firestore import is correct\n");
}

// Bug 2: Function name typo
if (escrowService.includes('canUseMoney Battles')) {
  console.log("❌ BUG: moneyEscrowService.js has typo in function name");
  console.log("   Expected: canUseMoneyBattles()");
  console.log("   Found: canUseMoney Battles()\n");
  bugCount++;
} else {
  console.log("✅ moneyEscrowService.js function names are correct\n");
}

// Check Dashboard integration
console.log('🔗 Checking Dashboard integration...\n');

const dashboard = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

if (!dashboard.includes('SupportModal')) {
  console.log("❌ SupportModal not imported in Dashboard.jsx\n");
  bugCount++;
} else {
  console.log("✅ SupportModal imported in Dashboard.jsx\n");
}

if (!dashboard.includes('showSupport')) {
  console.log("❌ showSupport state not found in Dashboard.jsx\n");
  bugCount++;
} else {
  console.log("✅ showSupport state found in Dashboard.jsx\n");
}

if (!dashboard.includes('onOpenSupport')) {
  console.log("❌ onOpenSupport prop not passed to AdventureMap\n");
  bugCount++;
} else {
  console.log("✅ onOpenSupport prop found in AdventureMap\n");
}

// Check server.js endpoints
console.log('🌐 Checking server endpoints...\n');

const server = fs.readFileSync('server.js', 'utf8');

const endpoints = [
  '/api/support/notify',
  '/api/stripe/create-escrow',
  '/api/stripe/release-escrow',
  '/api/stripe/refund-escrow',
  '/api/stripe/connect/onboard'
];

endpoints.forEach(endpoint => {
  if (server.includes(endpoint)) {
    console.log(`✅ ${endpoint}`);
  } else {
    console.log(`❌ ${endpoint} not found`);
    bugCount++;
  }
});

// Final summary
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    VERIFICATION RESULTS                   ║
╚═══════════════════════════════════════════════════════════╝
`);

if (bugCount === 0) {
  console.log(`✅ ALL CHECKS PASSED! Ready to test.

📋 Next Steps:
1. Run: npm run dev
2. Open dashboard
3. Click Killer Features (⚡)
4. Click Support Center (🎧)
5. Submit a test ticket

🚀 Your Batch 3 implementation is ready!
`);
} else {
  console.log(`⚠️  Found ${bugCount} issue(s) that need fixing.

📋 To fix:
1. Review the errors above
2. Make the necessary changes
3. Run this script again

See BATCH-3-ACTIVATION-GUIDE.md for detailed fixes.
`);
  process.exit(1);
}
