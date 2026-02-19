// Test: Firestore rules don't allow device_* wildcard access
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Firestore Rules Security', () => {
  const rulesPath = resolve(process.cwd(), 'firestore.rules');
  let rules;

  try {
    rules = readFileSync(rulesPath, 'utf-8');
  } catch {
    rules = '';
  }

  it('should not contain device_.* wildcard match', () => {
    expect(rules).not.toMatch(/device_\.\*/);
  });

  it('should require authentication for user data', () => {
    expect(rules).toMatch(/request\.auth\s*!=\s*null/);
  });

  it('should enforce UID ownership for user paths', () => {
    expect(rules).toMatch(/request\.auth\.uid\s*==\s*userId/);
  });

  it('should have a deny-all fallback rule', () => {
    expect(rules).toMatch(/allow read, write: if false/);
  });
});
