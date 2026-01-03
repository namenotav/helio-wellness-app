// Firebase Service - Cloud Database & Authentication
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, get, update, remove, onValue, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase Configuration - Loaded from environment variables for security
// Keys are stored in .env file (NOT committed to GitHub)
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

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.database = null;
    this.storage = null;
    this.currentUser = null;
    this.isInitialized = false;
  }

  // Initialize Firebase
  initialize() {
    try {
      // Check if already initialized
      if (this.isInitialized) {
        if(import.meta.env.DEV)console.log('✅ Firebase already initialized');
        return true;
      }

      // Check if config is set
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
        if(import.meta.env.DEV)console.error('❌ Firebase config not set! Please check .env file');
        return false;
      }

      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.database = getDatabase(this.app);
      this.storage = getStorage(this.app);

      if(import.meta.env.DEV)console.log('✅ Firebase initialized successfully');
      if(import.meta.env.DEV)console.log('📱 Project:', firebaseConfig.projectId);
      if(import.meta.env.DEV)console.log('🗄️ Database:', firebaseConfig.databaseURL);
      if(import.meta.env.DEV)console.log('💾 Storage:', firebaseConfig.storageBucket);

      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.currentUser = user;
          if(import.meta.env.DEV)console.log('👤 User signed in:', user.email);
        } else {
          this.currentUser = null;
          if(import.meta.env.DEV)console.log('👤 User signed out');
        }
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Firebase initialization failed:', error);
      return false;
    }
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Create user profile in database
      await this.createUserProfile(user.uid, {
        email: email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        profile: {
          age: null,
          gender: null,
          height: null,
          weight: null,
          goalSteps: 10000,
          notifications: true
        }
      });

      if(import.meta.env.DEV)console.log('✅ User created:', email);
      return { success: true, user: user };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Sign up failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      if(import.meta.env.DEV)console.log('✅ User signed in:', email);
      return { success: true, user: user };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Sign in failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Check if user profile exists, create if not
      const userProfile = await this.getUserProfile(user.uid);
      if (!userProfile) {
        await this.createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          profile: {
            goalSteps: 10000,
            notifications: true
          }
        });
      }

      if(import.meta.env.DEV)console.log('✅ Google sign in successful:', user.email);
      return { success: true, user: user };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Google sign in failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(this.auth);
      if(import.meta.env.DEV)console.log('✅ User signed out');
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Sign out failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Get current user ID
  getCurrentUserId() {
    return this.auth.currentUser?.uid || null;
  }

  // ========================================
  // DATABASE METHODS (Realtime Database)
  // ========================================

  // Create user profile
  async createUserProfile(userId, profileData) {
    try {
      const userRef = ref(this.database, `users/${userId}`);
      await set(userRef, profileData);
      if(import.meta.env.DEV)console.log('✅ User profile created');
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Create profile failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const userRef = ref(this.database, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Get profile failed:', error.message);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const userRef = ref(this.database, `users/${userId}`);
      await update(userRef, updates);
      if(import.meta.env.DEV)console.log('✅ Profile updated');
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Update profile failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Save health data (steps, water, meals, etc.)
  async saveHealthData(userId, date, dataType, data) {
    try {
      const dataRef = ref(this.database, `users/${userId}/healthData/${dataType}/${date}`);
      await set(dataRef, data);
      if(import.meta.env.DEV)console.log(`✅ ${dataType} data saved for ${date}`);
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error(`❌ Save ${dataType} failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Get health data
  async getHealthData(userId, date, dataType) {
    try {
      const dataRef = ref(this.database, `users/${userId}/healthData/${dataType}/${date}`);
      const snapshot = await get(dataRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      if(import.meta.env.DEV)console.error(`❌ Get ${dataType} failed:`, error.message);
      return null;
    }
  }

  // Add to log (water, meals, workouts)
  async addToLog(userId, logType, entry) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logRef = ref(this.database, `users/${userId}/healthData/${logType}/${date}`);
      
      // Get existing log
      const snapshot = await get(logRef);
      const existingLog = snapshot.exists() ? snapshot.val() : [];
      
      // Add new entry
      const updatedLog = Array.isArray(existingLog) ? [...existingLog, entry] : [entry];
      
      await set(logRef, updatedLog);
      if(import.meta.env.DEV)console.log(`✅ Added to ${logType} log`);
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error(`❌ Add to ${logType} failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Get log for date range
  async getLogRange(userId, logType, startDate, endDate) {
    try {
      const logRef = ref(this.database, `users/${userId}/healthData/${logType}`);
      const snapshot = await get(logRef);
      
      if (!snapshot.exists()) {
        return {};
      }

      const allLogs = snapshot.val();
      const filteredLogs = {};

      Object.keys(allLogs).forEach(date => {
        if (date >= startDate && date <= endDate) {
          filteredLogs[date] = allLogs[date];
        }
      });

      return filteredLogs;
    } catch (error) {
      if(import.meta.env.DEV)console.error(`❌ Get ${logType} range failed:`, error.message);
      return {};
    }
  }

  // Listen to data changes (real-time)
  listenToHealthData(userId, date, dataType, callback) {
    const dataRef = ref(this.database, `users/${userId}/healthData/${dataType}/${date}`);
    return onValue(dataRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });
  }

  // Save user settings
  async saveSettings(userId, settings) {
    try {
      const settingsRef = ref(this.database, `users/${userId}/settings`);
      await set(settingsRef, settings);
      if(import.meta.env.DEV)console.log('✅ Settings saved');
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Save settings failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get user settings
  async getSettings(userId) {
    try {
      const settingsRef = ref(this.database, `users/${userId}/settings`);
      const snapshot = await get(settingsRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Get settings failed:', error.message);
      return {};
    }
  }

  // ========================================
  // STORAGE METHODS (Cloud Storage)
  // ========================================

  // Upload file (profile photo, DNA file, etc.)
  async uploadFile(userId, filePath, file) {
    try {
      const fileRef = storageRef(this.storage, `users/${userId}/${filePath}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if(import.meta.env.DEV)console.log('✅ File uploaded:', filePath);
      return { success: true, url: downloadURL };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Upload failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get file URL
  async getFileURL(userId, filePath) {
    try {
      const fileRef = storageRef(this.storage, `users/${userId}/${filePath}`);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Get file URL failed:', error.message);
      return null;
    }
  }

  // Delete file
  async deleteFile(userId, filePath) {
    try {
      const fileRef = storageRef(this.storage, `users/${userId}/${filePath}`);
      await deleteObject(fileRef);
      if(import.meta.env.DEV)console.log('✅ File deleted:', filePath);
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Delete file failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  // Check if user is authenticated - with null safety
  isAuthenticated() {
    try {
      return this.auth && this.auth.currentUser !== null;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error checking firebase auth status:', error);
      return false;
    }
  }

  // Get user email
  getUserEmail() {
    return this.auth.currentUser?.email || null;
  }

  // Delete user account and all data
  async deleteAccount(userId) {
    try {
      // Delete user data from database
      const userRef = ref(this.database, `users/${userId}`);
      await remove(userRef);

      // Delete user from authentication
      await this.auth.currentUser.delete();

      if(import.meta.env.DEV)console.log('✅ Account deleted');
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Delete account failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Export all user data (GDPR compliance)
  async exportUserData(userId) {
    try {
      const userRef = ref(this.database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return { success: true, data: data };
      }
      
      return { success: false, error: 'No data found' };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Export data failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const firebaseService = new FirebaseService();

export default firebaseService;



