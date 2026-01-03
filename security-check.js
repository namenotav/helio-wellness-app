#!/usr/bin/env node
/**
 * Security Validation Script
 * Scans source code for hardcoded API keys before building
 * Run this before every production build to prevent key exposure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns that indicate exposed secrets
const FORBIDDEN_PATTERNS = [
  {
    pattern: /AIzaSy[A-Za-z0-9_-]{33}/g,
    name: 'Google API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /sk_live_[A-Za-z0-9]{24,}/g,
    name: 'Stripe Secret Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /sk_test_[A-Za-z0-9]{24,}/g,
    name: 'Stripe Test Key',
    severity: 'WARNING'
  },
  {
    pattern: /firebase[_-]?admin[_-]?sdk/gi,
    name: 'Firebase Admin SDK Reference',
    severity: 'HIGH'
  },
  {
    pattern: /"apiKey"\s*:\s*"[^"]{20,}"/g,
    name: 'Hardcoded API Key in Object',
    severity: 'HIGH'
  }
];

// Files/folders to scan
const SCAN_DIRS = ['src', 'api'];

// Files/folders to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'www',
  'android',
  'ios',
  '.env',
  'security-check.js',
  '.example'
];

let violations = [];
let filesScanned = 0;

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath) {
  if (shouldSkip(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    filesScanned++;

    FORBIDDEN_PATTERNS.forEach(({ pattern, name, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        // Exception: Allow import.meta.env.VITE_* references
        const isEnvVar = content.includes('import.meta.env.VITE_');
        const isProcessEnv = content.includes('process.env.');
        
        if (!isEnvVar && !isProcessEnv) {
          violations.push({
            file: filePath.replace(__dirname, '.'),
            severity,
            type: name,
            count: matches.length,
            preview: matches[0].substring(0, 40) + '...'
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!shouldSkip(fullPath)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  });
}

// Main execution
console.log('🔒 SECURITY SCAN STARTING...');
console.log('━'.repeat(60));

SCAN_DIRS.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Scanning ${dir}/`);
    scanDirectory(fullPath);
  }
});

console.log('━'.repeat(60));
console.log(`📊 Scanned ${filesScanned} files\n`);

if (violations.length === 0) {
  console.log('✅ ✅ ✅ SECURITY SCAN PASSED ✅ ✅ ✅');
  console.log('No hardcoded secrets detected in source code.');
  console.log('Safe to build and deploy! 🚀\n');
  process.exit(0);
} else {
  console.log('🚨 🚨 🚨 SECURITY VIOLATIONS FOUND 🚨 🚨 🚨\n');
  
  const critical = violations.filter(v => v.severity === 'CRITICAL');
  const high = violations.filter(v => v.severity === 'HIGH');
  const warnings = violations.filter(v => v.severity === 'WARNING');
  
  if (critical.length > 0) {
    console.log('❌ CRITICAL ISSUES (Must fix before building):');
    critical.forEach(v => {
      console.log(`   ${v.file}`);
      console.log(`   └─ ${v.type}: ${v.count} occurrence(s)`);
      console.log(`   └─ Preview: ${v.preview}\n`);
    });
  }
  
  if (high.length > 0) {
    console.log('⚠️  HIGH PRIORITY ISSUES:');
    high.forEach(v => {
      console.log(`   ${v.file}`);
      console.log(`   └─ ${v.type}: ${v.count} occurrence(s)\n`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(v => {
      console.log(`   ${v.file}`);
      console.log(`   └─ ${v.type}: ${v.count} occurrence(s)\n`);
    });
  }
  
  console.log('━'.repeat(60));
  console.log('🛑 BUILD BLOCKED - Fix security issues above');
  console.log('━'.repeat(60));
  console.log('\n💡 How to fix:');
  console.log('1. Replace hardcoded keys with: import.meta.env.VITE_KEY_NAME');
  console.log('2. Add keys to .env file (never commit this!)');
  console.log('3. Use Railway server for sensitive operations\n');
  
  process.exit(1);
}
