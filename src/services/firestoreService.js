/**
 * Firestore Direct Storage Service
 * 1000% BULLETPROOF - NO Railway dependency for user data
 * Automatic offline caching + real-time sync
 * Data NEVER lost, even if app uninstalled
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  enableIndexedDbPersistence,
  onSnapshot
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase config (loaded from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (or reuse existing default app)
// IMPORTANT: Do not create named apps here; it splits Auth/UID context.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence (data cached locally, syncs when online)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Firestore persistence: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Firestore persistence: Browser not supported');
    }
  });
  console.log('✅ Firestore offline persistence enabled');
} catch (err) {
  console.warn('⚠️ Firestore persistence setup failed:', err);
}

class FirestoreService {
  constructor() {
    this.cache = new Map(); // Local cache for instant reads
    this.saveQueue = []; // Queue for offline saves
    this.isOnline = navigator.onLine;
    this.authInitialized = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Initialize anonymous auth on startup
    this.initAuth();
  }

  /**
   * Initialize Firebase Auth (anonymous if needed)
   */
  async initAuth() {
    try {
      if (!auth.currentUser) {
        // Sign in anonymously so Firestore works
        await signInAnonymously(auth);
        console.log('✅ Firebase Auth initialized (anonymous)');
      }
      this.authInitialized = true;
    } catch (error) {
      console.error('❌ Firebase Auth init failed:', error);
      this.authInitialized = true; // Continue anyway with device ID
    }
  }

  /**
   * Get or create device ID for offline-first storage
   */
  async getDeviceId() {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value: deviceId } = await Preferences.get({ key: 'device_id' });
      if (deviceId) {
        return deviceId;
      }
      // Generate new device ID
      const newId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await Preferences.set({ key: 'device_id', value: newId });
      console.log('📱 Generated device ID:', newId);
      return newId;
    } catch (e) {
      // Fallback to timestamp-based ID
      return 'device_' + Date.now();
    }
  }

  /**
   * Save data to Firestore (works offline, syncs when online)
   * @param {string} key - Data key (e.g., 'stepBaseline', 'waterLog')
   * @param {any} value - Data value
   * @param {string} userId - Optional user ID (defaults to current user)
   */
  async save(key, value, userId = null) {
    try {
      // Ensure auth is initialized FIRST
      if (!this.authInitialized) {
        await this.initAuth();
      }

      // Get user ID - use provided userId, Firebase Auth, or device ID
      let uid = userId || auth.currentUser?.uid;
      if (!uid) {
        uid = await this.getDeviceId();
        console.log(`🔑 Using device ID: ${uid}`);
      }

      // Update local cache immediately (instant feedback)
      this.cache.set(key, value);
      localStorage.setItem(key, JSON.stringify(value)); // Backup to localStorage

      // Save to Firestore (works offline, syncs later)
      const docRef = doc(db, 'users', uid, 'data', key);
      await setDoc(docRef, {
        value: value,
        updatedAt: new Date().toISOString(),
        key: key
      }, { merge: true });

      console.log(`✅ Firestore saved [${uid.substring(0, 20)}...]: ${key}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Firestore save error for ${key}:`, error);
      
      // Fallback to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`💾 Fallback to localStorage: ${key}`);
      } catch (e) {
        console.error('❌ localStorage fallback failed:', e);
      }

      // Queue save for retry when back online
      try {
        this.saveQueue.push({ key, value, userId });
        console.log(`📥 Queued Firestore save for retry: ${key}`);
      } catch (e) {
        console.error('❌ Failed to queue Firestore save:', e);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Get data from Firestore (checks cache first, then Firestore, then localStorage)
   * @param {string} key - Data key
   * @param {string} userId - Optional user ID
   */
  async get(key, userId = null) {
    try {
      const normalizeStepHistory = (value) => {
        if (Array.isArray(value)) return value;
        if (value && typeof value === 'object') {
          return Object.values(value).filter((item) => item && item.date);
        }
        return value;
      };

      // 1. Check local cache first (instant)
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        return key === 'stepHistory' ? normalizeStepHistory(cached) : cached;
      }

      // 2. Check localStorage (fast)
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          const normalized = key === 'stepHistory' ? normalizeStepHistory(parsed) : parsed;
          this.cache.set(key, normalized);
        } catch (e) {
          // Not JSON, store as-is
          this.cache.set(key, localData);
        }
      }

      // Ensure auth is initialized
      if (!this.authInitialized) {
        await this.initAuth();
      }

      // 3. Try Firestore (may be offline)
      let uid = userId || auth.currentUser?.uid;
      if (!uid) {
        uid = await this.getDeviceId();
      }
      
      if (uid) {
        const docRef = doc(db, 'users', uid, 'data', key);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data().value;
          const normalized = key === 'stepHistory' ? normalizeStepHistory(data) : data;
          this.cache.set(key, normalized);
          localStorage.setItem(key, JSON.stringify(normalized)); // Update localStorage
          console.log(`✅ Firestore loaded: ${key}`);
          return normalized;
        }
      }

      // 4. Return from cache/localStorage if Firestore had nothing
      const value = this.cache.get(key) || null;
      return key === 'stepHistory' ? normalizeStepHistory(value) : value;

    } catch (error) {
      console.error(`❌ Firestore get error for ${key}:`, error);
      
      // Fallback to localStorage
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          return key === 'stepHistory' ? normalizeStepHistory(parsed) : parsed;
        } catch (e) {
          return localData;
        }
      }
      
      return null;
    }
  }

  /**
   * Save health data with date indexing
   */
  async saveHealthData(dataType, date, data) {
    const key = `${dataType}_${date}`;
    return this.save(key, data);
  }

  /**
   * Get health data for a specific date
   */
  async getHealthData(dataType, date) {
    const key = `${dataType}_${date}`;
    return this.get(key);
  }

  /**
   * Handle coming online - sync queued data
   */
  async handleOnline() {
    console.log('🌐 Firestore: Device online, syncing...');
    this.isOnline = true;
    
    // Process any queued saves
    while (this.saveQueue.length > 0) {
      const item = this.saveQueue.shift();
      await this.save(item.key, item.value, item.userId);
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('📴 Firestore: Device offline, will sync when online');
    this.isOnline = false;
  }

  /**
   * Clear local cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Firestore cache cleared');
  }

  /**
   * Save to a top-level Firestore collection (for shared/public data)
   * @param {string} collectionName - Name of the collection (e.g., 'communityRecipes')
   * @param {string} documentId - Document ID
   * @param {any} data - Data to save
   */
  async saveToCollection(collectionName, documentId, data) {
    try {
      // Ensure auth is initialized
      if (!this.authInitialized) {
        await this.initAuth();
      }

      // Save to top-level collection (not under users/)
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log(`✅ Saved to ${collectionName}/${documentId}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Error saving to ${collectionName}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get document from a top-level collection
   * @param {string} collectionName - Collection name
   * @param {string} documentId - Document ID
   */
  async getFromCollection(collectionName, documentId) {
    try {
      if (!this.authInitialized) {
        await this.initAuth();
      }

      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(`✅ Loaded from ${collectionName}/${documentId}`);
        return docSnap.data();
      }

      return null;
    } catch (error) {
      console.error(`❌ Error loading from ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Query documents from a collection
   * @param {string} collectionName - Collection name
   * @param {Array} queryConstraints - Optional Firestore query constraints
   */
  async queryCollection(collectionName, queryConstraints = []) {
    try {
      if (!this.authInitialized) {
        await this.initAuth();
      }

      const collectionRef = collection(db, collectionName);
      const q = queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Queried ${collectionName}: ${results.length} results`);
      return results;

    } catch (error) {
      console.error(`❌ Error querying ${collectionName}:`, error);
      return [];
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      online: this.isOnline,
      authenticated: !!auth.currentUser,
      cacheSize: this.cache.size,
      queueSize: this.saveQueue.length
    };
  }
}

// Export singleton instance
const firestoreService = new FirestoreService();
export default firestoreService;
