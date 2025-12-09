import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// FORCE CACHE CLEAR - Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      console.log('🗑️ Unregistering service worker:', registration);
      registration.unregister();
    });
  });
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        console.log('🗑️ Deleting cache:', name);
        caches.delete(name);
      });
    });
  }
}

console.log('🔄 APP VERSION: ' + new Date().toISOString());
console.log('🆕 CACHE BUSTED - Fresh load!');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



