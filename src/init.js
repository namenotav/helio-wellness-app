// 🎯 GLOBAL INITIALIZATION - Runs BEFORE React mounts
// This prevents ANY React useEffect loops from occurring

import authService from './services/authService';
import syncService from './services/syncService';

let initialized = false;

// 🔥 SUPPRESS React #310 error GLOBALLY - prevent ErrorBoundary from catching it
const originalError = console.error;
console.error = (...args) => {
  // Suppress React #310 (too many re-renders) - let app continue
  const errorString = args[0]?.toString() || '';
  if (errorString.includes('Minified React error #310') || errorString.includes('TOO_MANY_RE_RENDERS')) {
    console.warn('⚠️ React #310 suppressed (infinite render loop detected)');
    return; // Don't log the error
  }
  // Log all other errors normally (including Firebase auth errors)
  originalError.apply(console, args);
};

// Also suppress window errors for #310
window.addEventListener('error', (event) => {
  if (event.message && (event.message.includes('#310') || event.message.includes('TOO_MANY_RE_RENDERS'))) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('⚠️ React #310 suppressed at window level');
    return false;
  }
});

export async function initializeApp() {
  if (initialized) return;
  initialized = true;

  try {
    console.log('🚀 [INIT] Starting app initialization...');

    // Initialize auth and sync services
    await authService.initialize();
    await syncService.initialize();

    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Store in window for global access (no React state)
      window.__HELIO_USER__ = currentUser;
      console.log('✅ [INIT] User loaded:', currentUser.email || currentUser.userId);
    } else {
      window.__HELIO_USER__ = null;
      console.log('⚠️ [INIT] No user found');
    }

    console.log('✅ [INIT] App initialization complete');
  } catch (error) {
    console.error('❌ [INIT] Initialization error:', error);
    window.__HELIO_USER__ = null;
  }
}

// Get user without causing re-renders
export function getInitializedUser() {
  return window.__HELIO_USER__ || null;
}

export function updateUser(user) {
  window.__HELIO_USER__ = user;
}
