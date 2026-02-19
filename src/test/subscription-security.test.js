// Test: subscriptionService hasAccess does NOT have dev mode bypass
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('subscriptionService security', () => {
  it('should NOT contain dev mode bypass in hasAccess method', () => {
    // Read the actual source file and verify the dev mode check is removed
    const servicePath = resolve(process.cwd(), 'src/services/subscriptionService.js');
    const content = readFileSync(servicePath, 'utf-8');
    
    // The hasAccess method should NOT check localStorage for helio_dev_mode
    expect(content).not.toMatch(/helio_dev_mode.*return true/s);
    expect(content).not.toMatch(/devMode.*return true/s);
  });

  it('should NOT have dev mode granting all access', () => {
    const servicePath = resolve(process.cwd(), 'src/services/subscriptionService.js');
    const content = readFileSync(servicePath, 'utf-8');
    
    // Find the hasAccess method and verify no dev mode shortcut
    const hasAccessMatch = content.match(/hasAccess\(featureName\)\s*\{([\s\S]*?)^\s{2}\}/m);
    if (hasAccessMatch) {
      const methodBody = hasAccessMatch[1];
      expect(methodBody).not.toContain('helio_dev_mode');
    }
  });
});
