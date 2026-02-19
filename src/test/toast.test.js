// Test: showToast function works correctly
import { describe, it, expect, beforeEach } from 'vitest';
import { showToast } from '../components/Toast';

describe('showToast', () => {
  it('should be a function', () => {
    expect(typeof showToast).toBe('function');
  });

  it('should not throw with valid arguments', () => {
    expect(() => showToast('Test message', 'success')).not.toThrow();
  });

  it('should not throw with error type', () => {
    expect(() => showToast('Error!', 'error')).not.toThrow();
  });

  it('should not throw with default type', () => {
    expect(() => showToast('Info message')).not.toThrow();
  });
});
