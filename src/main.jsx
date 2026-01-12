import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initializeApp } from './init.js'
import productionValidator from './services/productionValidator';

// 🔥 AGGRESSIVE CACHE CLEARING - v1.0.8 Deployment
const APP_VERSION = '1.0.8';
const DEPLOYED_AT = '__BUILD_TIMESTAMP__';

// ✅ PRODUCTION: Validate environment before starting app
const isValid = productionValidator.validate();
if (!isValid && import.meta.env.PROD) {
  // Production validator will show error screen
  throw new Error('Environment validation failed');
}

// 1. Force unregister ALL service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      console.log('🗑️ Unregistering service worker:', registration);
      registration.unregister();
    });
  });
  
  // 2. Delete ALL caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        console.log('🗑️ Deleting cache:', name);
        caches.delete(name);
      });
    });
  }
}

// 3. Clear localStorage old cache flags
try {
  const oldVersion = localStorage.getItem('app_version');
  if (oldVersion !== APP_VERSION) {
    console.log(`🔄 Version upgrade detected: ${oldVersion} → ${APP_VERSION}`);
    localStorage.setItem('app_version', APP_VERSION);
    localStorage.setItem('last_cache_clear', new Date().toISOString());
    // Force reload on version change
    if (oldVersion && oldVersion !== 'null') {
      console.log('🔄 Forcing hard reload for version update...');
        window.location.reload();
    }
  }
} catch (e) {
  console.warn('localStorage check failed:', e);
}

console.log('🔄 APP VERSION:', APP_VERSION);
console.log('📅 BUILD TIME:', DEPLOYED_AT);
console.log('🆕 CACHE BUSTED - Fresh load!');

// 🎯 INITIALIZE APP BEFORE MOUNTING REACT (prevents useEffect loops)
initializeApp().then(() => {
  console.log('✅ App initialized - mounting React...');
  createRoot(document.getElementById('root')).render(
    <App />
  )
}).catch(error => {
  console.error('❌ App initialization failed:', error);
  // Mount anyway so user sees error UI
  createRoot(document.getElementById('root')).render(
    <App />
  )
});



