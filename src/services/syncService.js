// Sync Service - Hybrid Preferences + localStorage + Firebase Cloud Sync
// Priority: Preferences (permanent) → Firebase (cloud) → localStorage (cache)
import firebaseService from './firebaseService.js';
import { Preferences } from '@capacitor/preferences';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.lastSyncTime = null;
    
    // Critical data keys that MUST survive app updates
    this.criticalKeys = [
      'stepBaseline',
      'stepBaselineDate', 
      'weeklySteps',
      'todaySteps',
      'water_daily_goal',
      'water_today_intake',
      'water_intake_history',
      'water_reminders',
      'foodLog',
      'workoutHistory',
      'activityLog',
      'sleepLog',
      'meditationLog',
      'stepHistory',
      'loginHistory',
      'gamification_data',
      'notificationSettings',
      'themeSettings',
      'dark_mode',
      'dark_mode_auto',
      'onboardingCompleted',
      'emergency_data'
    ];
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // Initialize sync service
  async initialize() {
    try {
      // Initialize Firebase
      const initialized = firebaseService.initialize();
      if (!initialized) {
        if(import.meta.env.DEV)console.log('⚠️ Sync service running in offline-only mode (Firebase not configured)');
        return false;
      }

      // Check if user is authenticated
      const user = firebaseService.getCurrentUser();
      if (user) {
        if(import.meta.env.DEV)console.log('✅ Sync service initialized for user:', user.email);
        // Sync pending data if online
        if (this.isOnline) {
          await this.syncAllData();
        }
        return true;
      } else {
        if(import.meta.env.DEV)console.log('⚠️ No user logged in, sync service in standby');
        return false;
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Sync service initialization failed:', error);
      return false;
    }
  }

  // Handle coming online
  async handleOnline() {
    if(import.meta.env.DEV)console.log('🌐 Device is ONLINE - syncing data...');
    this.isOnline = true;
    await this.syncAllData();
  }

  // Handle going offline
  handleOffline() {
    if(import.meta.env.DEV)console.log('📴 Device is OFFLINE - data will be saved locally');
    this.isOnline = false;
  }

  // ========================================
  // HYBRID STORAGE METHODS (localStorage + Firebase)
  // ========================================

  // Save data (works offline and online)
  async saveData(key, value, userId = null) {
    try {
      const isCritical = this.criticalKeys.includes(key);
      
      // ALWAYS save to localStorage (for backward compatibility & caching)
      localStorage.setItem(key, JSON.stringify(value));
      if(import.meta.env.DEV)console.log(`💾 Saved to localStorage: ${key}`);

      // Save critical data to Preferences (survives app updates)
      if (isCritical) {
        await Preferences.set({
          key: `wellnessai_${key}`,
          value: JSON.stringify(value)
        });
        if(import.meta.env.DEV)console.log(`🔒 Saved to Preferences (permanent): ${key}`);
      }

      // If online and user logged in, sync to Firebase
      if (this.isOnline && firebaseService.isAuthenticated()) {
        const uid = userId || firebaseService.getCurrentUserId();
        if (uid) {
          await firebaseService.updateUserProfile(uid, { [key]: value });
          if(import.meta.env.DEV)console.log(`☁️ Synced to Firebase: ${key}`);
        }
      } else {
        // Queue for later sync
        this.addToSyncQueue({ key, value, action: 'save' });
      }

      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Save data failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get data (Priority: Preferences → Firebase → localStorage)
  async getData(key, userId = null) {
    try {
      const isCritical = this.criticalKeys.includes(key);
      
      // FIRST: Try Preferences for critical data (survives updates)
      if (isCritical) {
        const { value: prefsData } = await Preferences.get({ key: `wellnessai_${key}` });
        if (prefsData) {
          try {
            const parsed = JSON.parse(prefsData);
            // Update localStorage cache
            localStorage.setItem(key, JSON.stringify(parsed));
            if(import.meta.env.DEV)console.log(`🔒 Retrieved from Preferences: ${key}`);
            return parsed;
          } catch (parseError) {
            if(import.meta.env.DEV)console.warn(`⚠️ Preferences parse error for ${key}, trying Firebase`);
          }
        }
      }

      // SECOND: Try Firebase if online
      if (this.isOnline && firebaseService.isAuthenticated()) {
        const uid = userId || firebaseService.getCurrentUserId();
        if (uid) {
          const profile = await firebaseService.getUserProfile(uid);
          if (profile && profile[key]) {
            // Update both Preferences and localStorage
            if (isCritical) {
              await Preferences.set({
                key: `wellnessai_${key}`,
                value: JSON.stringify(profile[key])
              });
            }
            localStorage.setItem(key, JSON.stringify(profile[key]));
            if(import.meta.env.DEV)console.log(`☁️ Retrieved from Firebase: ${key}`);
            return profile[key];
          }
        }
      }

      // THIRD: Fallback to localStorage (cache only)
      const localData = localStorage.getItem(key);
      if (localData) {
        if(import.meta.env.DEV)console.log(`💾 Retrieved from localStorage: ${key}`);
        try {
          const parsed = JSON.parse(localData);
          // Upgrade to Preferences if critical
          if (isCritical) {
            await Preferences.set({
              key: `wellnessai_${key}`,
              value: localData
            });
            if(import.meta.env.DEV)console.log(`⬆️ Migrated ${key} from localStorage to Preferences`);
          }
          return parsed;
        } catch (parseError) {
          if(import.meta.env.DEV)console.warn(`⚠️ JSON parse error for ${key}, returning default:`, parseError.message);
          // Clear corrupted data
          localStorage.removeItem(key);
          if (isCritical) {
            await Preferences.remove({ key: `wellnessai_${key}` });
          }
          // Return appropriate default based on key type
          if (key === 'weeklySteps') {
            return [
              { steps: 0, date: null },
              { steps: 0, date: null },
              { steps: 0, date: null },
              { steps: 0, date: null },
              { steps: 0, date: null },
              { steps: 0, date: null },
              { steps: 0, date: null }
            ];
          }
          return null;
        }
      }

      return null;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Get data failed:', error);
      // Always fallback to localStorage on error with safe parsing
      try {
        const localData = localStorage.getItem(key);
        if (localData) {
          return JSON.parse(localData);
        }
      } catch (parseError) {
        if(import.meta.env.DEV)console.warn(`⚠️ Failed to parse ${key}, clearing corrupted data`);
        localStorage.removeItem(key);
      }
      return null;
    }
  }

  // Save health data (steps, water, meals)
  async saveHealthData(dataType, date, data) {
    try {
      const key = `${dataType}_${date}`;
      
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(data));
      if(import.meta.env.DEV)console.log(`💾 Saved ${dataType} to localStorage: ${date}`);

      // Sync to Firebase if online
      if (this.isOnline && firebaseService.isAuthenticated()) {
        const userId = firebaseService.getCurrentUserId();
        if (userId) {
          await firebaseService.saveHealthData(userId, date, dataType, data);
          if(import.meta.env.DEV)console.log(`☁️ Synced ${dataType} to Firebase: ${date}`);
        }
      } else {
        this.addToSyncQueue({ dataType, date, data, action: 'saveHealth' });
      }

      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error(`❌ Save ${dataType} failed:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get health data
  async getHealthData(dataType, date) {
    try {
      // Try Firebase first if online
      if (this.isOnline && firebaseService.isAuthenticated()) {
        const userId = firebaseService.getCurrentUserId();
        if (userId) {
          const firebaseData = await firebaseService.getHealthData(userId, date, dataType);
          if (firebaseData) {
            // Update localStorage
            const key = `${dataType}_${date}`;
            localStorage.setItem(key, JSON.stringify(firebaseData));
            return firebaseData;
          }
        }
      }

      // Fallback to localStorage
      const key = `${dataType}_${date}`;
      const localData = localStorage.getItem(key);
      return localData ? JSON.parse(localData) : null;
    } catch (error) {
      if(import.meta.env.DEV)console.error(`❌ Get ${dataType} failed:`, error);
      const key = `${dataType}_${date}`;
      const localData = localStorage.getItem(key);
      return localData ? JSON.parse(localData) : null;
    }
  }

  // ========================================
  // SYNC QUEUE MANAGEMENT
  // ========================================

  // Add item to sync queue
  addToSyncQueue(item) {
    this.syncQueue.push({
      ...item,
      timestamp: new Date().toISOString()
    });
    if(import.meta.env.DEV)console.log(`📋 Added to sync queue (${this.syncQueue.length} items)`);
  }

  // Process sync queue
  async processSyncQueue() {
    if (this.syncQueue.length === 0) {
      return;
    }

    if(import.meta.env.DEV)console.log(`🔄 Processing sync queue (${this.syncQueue.length} items)...`);
    
    const userId = firebaseService.getCurrentUserId();
    if (!userId) {
      if(import.meta.env.DEV)console.log('⚠️ No user logged in, skipping sync');
      return;
    }

    const processed = [];
    const failed = [];

    for (const item of this.syncQueue) {
      try {
        if (item.action === 'save') {
          await firebaseService.updateUserProfile(userId, { [item.key]: item.value });
          processed.push(item);
        } else if (item.action === 'saveHealth') {
          await firebaseService.saveHealthData(userId, item.date, item.dataType, item.data);
          processed.push(item);
        }
      } catch (error) {
        if(import.meta.env.DEV)console.error('❌ Sync failed for item:', item, error);
        failed.push(item);
      }
    }

    // Remove processed items from queue
    this.syncQueue = failed;
    
    if(import.meta.env.DEV)console.log(`✅ Synced ${processed.length} items, ${failed.length} failed`);
    this.lastSyncTime = new Date().toISOString();
  }

  // Sync all local data to Firebase
  async syncAllData() {
    if (this.isSyncing) {
      if(import.meta.env.DEV)console.log('⚠️ Sync already in progress...');
      return;
    }

    try {
      this.isSyncing = true;
      if(import.meta.env.DEV)console.log('🔄 Starting full data sync...');

      const userId = firebaseService.getCurrentUserId();
      if (!userId) {
        if(import.meta.env.DEV)console.log('⚠️ No user logged in, skipping sync');
        return;
      }

      // Process queued items
      await this.processSyncQueue();

      // Sync common data keys
      const keysToSync = [
        'stepBaseline',
        'stepBaselineDate',
        'weeklySteps',
        'waterLog',
        'foodLog',
        'workoutLog',
        'sleepLog',
        'journalEntries',
        'onboardingCompleted',
        'subscription_plan'
      ];

      let syncedCount = 0;
      for (const key of keysToSync) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            await firebaseService.updateUserProfile(userId, { [key]: JSON.parse(value) });
            syncedCount++;
          } catch (error) {
            if(import.meta.env.DEV)console.error(`Failed to sync ${key}:`, error);
          }
        }
      }

      if(import.meta.env.DEV)console.log(`✅ Full sync complete: ${syncedCount} items synced`);
      this.lastSyncTime = new Date().toISOString();
      
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Full sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Pull data from Firebase to localStorage
  async pullFromFirebase() {
    try {
      const userId = firebaseService.getCurrentUserId();
      if (!userId) {
        return;
      }

      if(import.meta.env.DEV)console.log('⬇️ Pulling data from Firebase...');
      
      const profile = await firebaseService.getUserProfile(userId);
      if (!profile) {
        return;
      }

      // Update localStorage with Firebase data
      let updatedCount = 0;
      Object.keys(profile).forEach(key => {
        if (typeof profile[key] !== 'object' || Array.isArray(profile[key])) {
          localStorage.setItem(key, JSON.stringify(profile[key]));
          updatedCount++;
        }
      });

      if(import.meta.env.DEV)console.log(`✅ Pulled ${updatedCount} items from Firebase`);
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Pull from Firebase failed:', error);
    }
  }

  // ========================================
  // USER AUTHENTICATION HELPERS
  // ========================================

  // Called after user login
  async onUserLogin(userId) {
    try {
      if(import.meta.env.DEV)console.log('👤 User logged in, syncing data...');
      
      // Pull data from Firebase first
      await this.pullFromFirebase();
      
      // Then sync local changes to Firebase
      await this.syncAllData();
      
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ User login sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Called before user logout
  async onUserLogout() {
    try {
      if(import.meta.env.DEV)console.log('👤 User logging out, syncing data...');
      
      // Sync all pending changes before logout
      await this.syncAllData();
      
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ User logout sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // STATUS & UTILITIES
  // ========================================

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueSize: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      isAuthenticated: firebaseService.isAuthenticated()
    };
  }

  // Force sync now
  async forceSync() {
    return await this.syncAllData();
  }

  // Storage cleanup mechanism to prevent hitting 5MB localStorage limit
  async cleanupOldData() {
    try {
      const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
      
      // Clean old step history (keep last 90 days)
      const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      if (Array.isArray(stepHistory)) {
        const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const recentSteps = stepHistory.filter(entry => {
          try {
            return new Date(entry.date).getTime() >= ninetyDaysAgo;
          } catch {
            return false;
          }
        });
        if (recentSteps.length < stepHistory.length) {
          localStorage.setItem('stepHistory', JSON.stringify(recentSteps));
          if(import.meta.env.DEV)console.log('🧹 Cleaned up', stepHistory.length - recentSteps.length, 'old step entries');
        }
      }
      
      // Clean old food logs (keep last 90 days)
      const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
      if (Array.isArray(foodLog)) {
        const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const recentFood = foodLog.filter(entry => {
          try {
            return new Date(entry.timestamp || entry.date).getTime() >= ninetyDaysAgo;
          } catch {
            return false;
          }
        });
        if (recentFood.length < foodLog.length) {
          localStorage.setItem('foodLog', JSON.stringify(recentFood));
          if(import.meta.env.DEV)console.log('🧹 Cleaned up', foodLog.length - recentFood.length, 'old food entries');
        }
      }
      
      // Check total localStorage size
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      if(import.meta.env.DEV)console.log('📊 localStorage usage:', sizeMB, 'MB / 5 MB');
      
      // Warning if approaching limit
      if (totalSize > 4 * 1024 * 1024) { // 4MB warning threshold
        console.warn('⚠️ localStorage usage high:', sizeMB, 'MB - consider additional cleanup');
      }
      
      return { totalSize, sizeMB };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error during storage cleanup:', error);
      return null;
    }
  }

  // Get localStorage usage stats
  getStorageStats() {
    try {
      let totalSize = 0;
      const itemSizes = {};
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const itemSize = localStorage[key].length + key.length;
          totalSize += itemSize;
          itemSizes[key] = (itemSize / 1024).toFixed(2) + ' KB';
        }
      }
      
      return {
        totalSize: (totalSize / 1024 / 1024).toFixed(2) + ' MB',
        percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1) + '%',
        itemSizes
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error getting storage stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const syncService = new SyncService();

export default syncService;



