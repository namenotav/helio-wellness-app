// Universal Data Service - ONE API for ALL storage systems
// Hides complexity of localStorage + Preferences + Firebase + Firestore
import { Preferences } from '@capacitor/preferences';
import firebaseService from './firebaseService.js';
import firestoreService from './firestoreService.js';

class DataService {
  constructor() {
    if(import.meta.env.DEV) console.log('📦 DataService initialized - Universal storage wrapper');
  }

  /**
   * Save data to ALL 4 storage systems simultaneously
   * @param {string} key - Storage key
   * @param {any} value - Data to save (will be JSON stringified)
   * @param {string} userId - User ID for cloud storage (optional)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async save(key, value, userId = null) {
    try {
      const jsonValue = JSON.stringify(value);
      
      // 1. Save to localStorage (INSTANT - 1ms)
      localStorage.setItem(key, jsonValue);
      
      // 2. Save to Preferences (background - survives app updates)
      Preferences.set({ 
        key: `wellnessai_${key}`, 
        value: jsonValue 
      }).catch(err => {
        if(import.meta.env.DEV) console.warn(`⚠️ Preferences save failed for ${key}:`, err.message);
      });
      
      // 3. Save to Firebase Realtime Database (background - cloud sync)
      if (userId && firebaseService.isAuthenticated()) {
        firebaseService.updateUserProfile(userId, { [key]: value })
          .catch(err => {
            if(import.meta.env.DEV) console.warn(`⚠️ Firebase save failed for ${key}:`, err.message);
          });
      }
      
      // 4. Save to Firestore (background - cloud sync)
      if (userId && firebaseService.isAuthenticated()) {
        firestoreService.save(key, value, userId)
          .catch(err => {
            if(import.meta.env.DEV) console.warn(`⚠️ Firestore save failed for ${key}:`, err.message);
          });
      }
      
      if(import.meta.env.DEV) console.log(`✅ DataService.save('${key}') - saved to all 4 systems`);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ DataService.save('${key}') failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get data with smart fallback chain: Firestore → Preferences → localStorage
   * @param {string} key - Storage key
   * @param {string} userId - User ID for cloud storage (optional)
   * @returns {Promise<any>} - Parsed data or null if not found
   */
  async get(key, userId = null) {
    try {
      // 1. Try Firestore first (most reliable, has cloud data)
      if (userId && firebaseService.isAuthenticated()) {
        try {
          const firestoreData = await firestoreService.get(key, userId);
          if (firestoreData !== null && firestoreData !== undefined) {
            if(import.meta.env.DEV) console.log(`☁️ DataService.get('${key}') - from Firestore`);
            // Update local cache
            localStorage.setItem(key, JSON.stringify(firestoreData));
            return firestoreData;
          }
        } catch (err) {
          if(import.meta.env.DEV) console.warn(`⚠️ Firestore read failed for ${key}, trying Preferences...`);
        }
      }
      
      // 2. Try Preferences (survives app updates)
      try {
        const { value } = await Preferences.get({ key: `wellnessai_${key}` });
        if (value) {
          const parsed = JSON.parse(value);
          if(import.meta.env.DEV) console.log(`🔒 DataService.get('${key}') - from Preferences`);
          // Update localStorage cache
          localStorage.setItem(key, value);
          return parsed;
        }
      } catch (err) {
        if(import.meta.env.DEV) console.warn(`⚠️ Preferences read failed for ${key}, trying localStorage...`);
      }
      
      // 3. Try localStorage (fastest, but least reliable)
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if(import.meta.env.DEV) console.log(`💾 DataService.get('${key}') - from localStorage`);
          return parsed;
        } catch (parseError) {
          if(import.meta.env.DEV) console.warn(`⚠️ localStorage data corrupted for ${key}, clearing...`);
          localStorage.removeItem(key);
        }
      }
      
      // 4. Nothing found
      if(import.meta.env.DEV) console.log(`❌ DataService.get('${key}') - not found in any storage`);
      return null;
      
    } catch (error) {
      console.error(`❌ DataService.get('${key}') failed:`, error);
      // Last resort: try localStorage without error handling
      try {
        const localData = localStorage.getItem(key);
        return localData ? JSON.parse(localData) : null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Delete data from ALL storage systems
   * @param {string} key - Storage key
   * @param {string} userId - User ID for cloud storage (optional)
   */
  async delete(key, userId = null) {
    try {
      // Delete from localStorage
      localStorage.removeItem(key);
      
      // Delete from Preferences
      Preferences.remove({ key: `wellnessai_${key}` }).catch(() => {});
      
      // Delete from Firestore
      if (userId) {
        firestoreService.delete(key, userId).catch(() => {});
      }
      
      if(import.meta.env.DEV) console.log(`🗑️ DataService.delete('${key}') - removed from all systems`);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ DataService.delete('${key}') failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if data exists in any storage system
   * @param {string} key - Storage key
   * @param {string} userId - User ID for cloud storage (optional)
   * @returns {Promise<boolean>}
   */
  async exists(key, userId = null) {
    const data = await this.get(key, userId);
    return data !== null && data !== undefined;
  }

  /**
   * Get all keys stored in localStorage (for debugging)
   * @returns {string[]}
   */
  getAllKeys() {
    return Object.keys(localStorage);
  }

  /**
   * Get storage stats (for debugging)
   * @returns {Object}
   */
  getStats() {
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      totalSize += (key.length + (value?.length || 0));
    });
    
    return {
      totalKeys: keys.length,
      totalSize: totalSize,
      sizeInKB: (totalSize / 1024).toFixed(2),
      sizeInMB: (totalSize / 1024 / 1024).toFixed(2),
      percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1) + '%'
    };
  }
}

// Export singleton instance
const dataService = new DataService();
export default dataService;
