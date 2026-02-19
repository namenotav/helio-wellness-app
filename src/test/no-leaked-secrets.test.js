// Test: No leaked secrets in source files
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { resolve, join } from 'path';

function getAllFiles(dir, extensions = ['.js', '.jsx', '.md', '.json']) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      // Skip directories we don't care about
      if (['node_modules', '.git', 'android', 'dist', 'build', 'www'].includes(entry)) continue;
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...getAllFiles(fullPath, extensions));
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      } catch { /* skip unreadable */ }
    }
  } catch { /* skip unreadable dirs */ }
  return files;
}

describe('Secret Leak Prevention', () => {
  const projectRoot = resolve(process.cwd());
  const files = getAllFiles(projectRoot);

  it('should not contain Stripe webhook secrets (whsec_)', () => {
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      expect(content, `Leaked in ${file}`).not.toMatch(/whsec_[A-Za-z0-9]{20,}/);
    }
  });

  it('should not contain Stripe secret keys (sk_live_)', () => {
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      expect(content, `Leaked in ${file}`).not.toMatch(/sk_live_[A-Za-z0-9]{20,}/);
    }
  });

  it('should not have SUBSCRIPTION-VERIFICATION-COMPLETE.md file', () => {
    const filePath = resolve(projectRoot, 'SUBSCRIPTION-VERIFICATION-COMPLETE.md');
    let exists = false;
    try { statSync(filePath); exists = true; } catch { exists = false; }
    expect(exists).toBe(false);
  });
});
