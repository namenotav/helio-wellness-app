// Deployment preparation script
// Replaces build timestamp placeholders with actual build time
// Run this automatically during build process

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILD_TIMESTAMP = new Date().toISOString();
const BUILD_HASH = Date.now().toString(36);

console.log('🔨 Preparing deployment...');
console.log('📅 Build timestamp:', BUILD_TIMESTAMP);
console.log('🔑 Build hash:', BUILD_HASH);

// Files to update
const files = [
  join(__dirname, '../dist/index.html'),
  join(__dirname, '../dist/assets/*.js'), // Will be handled by glob in actual script
];

try {
  // Update index.html
  const indexPath = join(__dirname, '../dist/index.html');
  let indexContent = readFileSync(indexPath, 'utf-8');
  indexContent = indexContent.replace(/__BUILD_TIMESTAMP__/g, BUILD_TIMESTAMP);
  indexContent = indexContent.replace(/__BUILD_HASH__/g, BUILD_HASH);
  writeFileSync(indexPath, indexContent);
  console.log('✅ Updated index.html');

  // Note: main.jsx timestamp will be replaced by Vite during build via define option
  console.log('✅ Build preparation complete!');
  console.log('🚀 Ready for deployment');
} catch (error) {
  console.error('❌ Build preparation failed:', error);
  process.exit(1);
}
