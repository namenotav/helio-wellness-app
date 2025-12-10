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
    this.retryTimer = null;
    this.authCheckInterval = null;
    this.maxRetries = 10;
    
    // Critical data keys that MUST survive app updates/uninstalls
    this.criticalKeys = [
      // ===== STEP TRACKING =====
      'stepBaseline',
      'stepBaselineDate', 
      'weeklySteps',
      'todaySteps',
      'stepHistory',
      'step_counter_baseline',
      'step_counter_date',
      
      // ===== WATER TRACKING =====
      'water_daily_goal',
      'water_today_intake',
      'water_intake_history',
      'water_reminders',
      'waterLog',
      
      // ===== MEALS & FOOD =====
      'foodLog',
      'meal_plans',
      'meal_preferences',
      'saved_recipes',
      
      // ===== WORKOUTS & EXERCISE =====
      'workoutHistory',
      'workoutLog',
      'activityLog',
      'rep_history',
      'exercise_preferences',
      
      // ===== HEART RATE =====
      'heart_rate_history',
      'hr_device_name',
      'heartRateData',
      
      // ===== SLEEP TRACKING =====
      'sleepLog',
      'sleep_history',
      'current_sleep_session',
      
      // ===== MENTAL HEALTH =====
      'meditationLog',
      'meditation_history',
      'gratitudeLog',
      'journalEntries',
      'gratitude_entries',
      'stressLog',
      'mood_history',
      
      // ===== PROFILE & USER DATA =====
      'user_profile',
      'profile_data',
      'user_preferences',
      'allergens',
      'dietary_restrictions',
      'health_goals',
      
      // ===== HEALTH AVATAR =====
      'health_avatar_data',
      'avatar_predictions',
      'avatar_history',
      
      // ===== EMERGENCY =====
      'emergency_data',
      'emergency_contacts',
      'emergencyHistory',
      'medical_info',
      
      // ===== DNA ANALYSIS =====
      'dnaAnalysis',
      'dnaRawData',
      'dna_last_tip',
      'dna_last_tip_date',
      'genetic_predictions',
      
      // ===== SOCIAL BATTLES =====
      'battles_data',
      'battle_history',
      'battle_stats',
      
      // ===== MEAL AUTOMATION =====
      'meal_automation_settings',
      'automated_meals',
      'meal_schedule',
      
      // ===== AUTHENTICATION =====
      'loginHistory',
      'social_login_provider',
      'social_login_data',
      'user_credentials',
      
      // ===== GAMIFICATION =====
      'gamification_data',
      'achievements',
      'level_data',
      'xp_history',
      'streaks',
      
      // ===== GENERAL HEALTH =====
      'healthMetrics',
      'health_data',
      'health_history',
      'ml_user_patterns',
      
      // ===== SETTINGS =====
      'notificationSettings',
      'themeSettings',
      'dark_mode',
      'dark_mode_auto',
      'onboardingCompleted',
      'subscription_plan',
      'paywall_interactions'
    ];
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Start aggressive Firebase auth checker (every 2 seconds until auth ready)
    this.startAuthChecker();
  }
  
  // Start checking for Firebase auth every 2 seconds
  startAuthChecker() {
    if (this.authCheckInterval) return;
    
    console.log('⚡ SYNC SERVICE: Auth checker started (checks every 2s)');
    
    this.authCheckInterval = setInterval(async () => {
      if (firebaseService.isAuthenticated() && this.syncQueue.length > 0) {
        console.log('✅ SYNC SERVICE: Auth ready! Processing', this.syncQueue.length, 'queued items');
        await this.processSyncQueue();
      }
    }, 2000); // Check every 2 seconds
  }

  // Stop auth checker
  stopAuthChecker() {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
      this.authCheckInterval = null;
    }
  }

  // Initialize sync service
  async initialize() {
    try {
      console.log('🔄 SYNC SERVICE: Initializing...');
      
      // Initialize Firebase
      const initialized = firebaseService.initialize();
      if (!initialized) {
        console.warn('⚠️ SYNC SERVICE: Firebase not configured, offline-only mode');
        return false;
      }

      console.log('🔄 SYNC SERVICE: Firebase initialized');

      // Check if user is authenticated
      const user = firebaseService.getCurrentUser();
      if (user) {
        console.log('✅ SYNC SERVICE: Initialized for user:', user.email);
        console.log('📋 SYNC SERVICE: Queue has', this.syncQueue.length, 'pending items');
        
        // Sync pending data if online
        if (this.isOnline) {
          console.log('🌐 SYNC SERVICE: Online, starting aggressive sync...');
          await this.aggressiveSyncAllData();
        } else {
          console.log('📴 SYNC SERVICE: Offline, will sync when online');
        }
        return true;
      } else {
        console.log('⚠️ SYNC SERVICE: No user logged in yet, waiting for auth...');
        console.log('⚡ SYNC SERVICE: Auth checker running (checks every 2s)');
        return false;
      }
    } catch (error) {
      console.error('❌ SYNC SERVICE: Initialization failed:', error);
      return false;
    }
  }

  // Handle coming online
  async handleOnline() {
    if(import.meta.env.DEV)console.log('🌐 Device is ONLINE - syncing data...');
    this.isOnline = true;
    await this.aggressiveSyncAllData();
  }

  // Handle going offline
  handleOffline() {
    if(import.meta.env.DEV)console.log('📴 Device is OFFLINE - data will be saved locally');
    this.isOnline = false;
  }

  // ========================================
  // HYBRID STORAGE METHODS (localStorage + Firebase)
  // ========================================

  // Save data with AGGRESSIVE Firebase retry (works offline and online)
  async saveData(key, value, userId = null) {
    try {
      const isCritical = this.criticalKeys.includes(key);
      
      // ALWAYS save to localStorage (for backward compatibility & caching)
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`💾 SYNC: Saved to localStorage: ${key}`);

      // Save critical data to Preferences (survives app updates)
      if (isCritical) {
        await Preferences.set({
          key: `wellnessai_${key}`,
          value: JSON.stringify(value)
        });
        console.log(`🔒 SYNC: Saved to Preferences (permanent): ${key}`);
      }

      // AGGRESSIVE Firebase sync - try immediately, queue if fails
      if (this.isOnline && firebaseService.isAuthenticated()) {
        const uid = userId || firebaseService.getCurrentUserId();
        if (uid) {
          try {
            await firebaseService.updateUserProfile(uid, { [key]: value });
            console.log(`☁️ ✅ SYNC: Firebase synced: ${key}`);
            return { success: true };
          } catch (firebaseError) {
            console.error(`☁️ ❌ SYNC: Firebase failed for ${key}:`, firebaseError.message);
            // Queue for retry
            this.addToSyncQueue({ key, value, action: 'save', userId: uid });
          }
        } else {
          console.log(`📋 SYNC: No user ID, queuing: ${key}`);
          // No user ID yet, queue for when auth is ready
          this.addToSyncQueue({ key, value, action: 'save' });
        }
      } else {
        // Not online or not authenticated - queue for later
        console.log(`📋 SYNC: Queued: ${key} (auth: ${firebaseService.isAuthenticated()}, online: ${this.isOnline})`);
        this.addToSyncQueue({ key, value, action: 'save', userId });
        
        // Start aggressive retry timer if not already running
        this.startAggressiveRetry();
      }

      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Save data failed:', error);
      // Even if everything fails, queue it
      this.addToSyncQueue({ key, value, action: 'save', userId });
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

  // Add item to sync queue (with deduplication)
  addToSyncQueue(item) {
    // Don't add duplicates
    const existing = this.syncQueue.findIndex(q => 
      q.key === item.key && q.action === item.action
    );
    
    if (existing >= 0) {
      // Update existing item with latest value
      this.syncQueue[existing] = {
        ...item,
        timestamp: Date.now(),
        retryCount: (this.syncQueue[existing].retryCount || 0)
      };
      if(import.meta.env.DEV)console.log(`📋 Updated in sync queue: ${item.key}`);
    } else {
      // Add new item
      this.syncQueue.push({
        ...item,
        timestamp: Date.now(),
        retryCount: 0
      });
      if(import.meta.env.DEV)console.log(`📋 Added to sync queue: ${item.key} (${this.syncQueue.length} items)`);
    }
    
    // Start aggressive retry immediately
    this.startAggressiveRetry();
  }
  
  // Start aggressive retry timer (tries every 5 seconds with exponential backoff)
  startAggressiveRetry() {
    if (this.retryTimer) return; // Already running
    
    console.log('⚡ SYNC: Starting aggressive retry timer');
    
    let retryDelay = 5000; // Start with 5 seconds
    const maxDelay = 60000; // Max 60 seconds between retries
    
    const retry = async () => {
      if (this.syncQueue.length === 0) {
        // Queue empty, stop timer
        if (this.retryTimer) {
          clearTimeout(this.retryTimer);
          this.retryTimer = null;
          console.log('✅ SYNC: Queue empty, stopping retry timer');
        }
        return;
      }
      
      // Try to process queue
      if (firebaseService.isAuthenticated() && this.isOnline) {
        console.log('🔄 SYNC: Retry attempt -', this.syncQueue.length, 'items in queue');
        await this.processSyncQueue();
        retryDelay = 5000; // Reset delay on successful attempt
      } else {
        console.log('⏳ SYNC: Waiting... (auth:', firebaseService.isAuthenticated(), ', online:', this.isOnline, ')');
        // Exponential backoff
        retryDelay = Math.min(retryDelay * 1.5, maxDelay);
      }
      
      // Schedule next retry
      this.retryTimer = setTimeout(retry, retryDelay);
    };
    
    // Start first retry
    this.retryTimer = setTimeout(retry, retryDelay);
  }

  // Process sync queue with retry logic
  async processSyncQueue() {
    if (this.syncQueue.length === 0) {
      return;
    }

    if(import.meta.env.DEV)console.log(`🔄 Processing sync queue (${this.syncQueue.length} items)...`);

    // Check if user is authenticated
    if (!firebaseService.isAuthenticated()) {
      if(import.meta.env.DEV)console.log('⚠️ Not authenticated yet, will retry in 5 seconds');
      return;
    }
    
    // Check if online
    if (!this.isOnline) {
      if(import.meta.env.DEV)console.log('⚠️ Offline, will retry when online');
      return;
    }

    const uid = firebaseService.getCurrentUserId();
    if (!uid) {
      if(import.meta.env.DEV)console.log('⚠️ No user ID, will retry');
      return;
    }

    const processed = [];
    const failed = [];

    for (const item of this.syncQueue) {
      try {
        if (item.action === 'save') {
          await firebaseService.updateUserProfile(
            item.userId || uid,
            { [item.key]: item.value }
          );
          console.log(`☁️ ✅ SYNC: Firebase synced queued item: ${item.key}`);
          processed.push(item);
        } else if (item.action === 'saveHealth') {
          await firebaseService.saveHealthData(uid, item.date, item.dataType, item.data);
          console.log(`☁️ ✅ SYNC: Firebase synced health data: ${item.dataType}`);
          processed.push(item);
        }
      } catch (error) {
        console.error(`☁️ ❌ SYNC: Failed to sync ${item.key || item.dataType}:`, error.message);
        
        // Track retry attempts
        const retries = (item.retryCount || 0) + 1;
        
        if (retries < this.maxRetries) {
          // Add back to queue with incremented retry count
          failed.push({
            ...item,
            retryCount: retries
          });
          console.log(`⏭️ SYNC: Will retry ${item.key || item.dataType} (attempt ${retries}/${this.maxRetries})`);
        } else {
          console.error(`💀 SYNC: Max retries reached for ${item.key || item.dataType}, giving up`);
          // Log to console so user can manually recover if needed
          console.error('CRITICAL: Failed to sync after max retries:', item.key || item.dataType, item.value || item.data);
        }
      }
    }

    // Remove processed items from queue
    this.syncQueue = failed;
    
    console.log(`🎯 SYNC: Processed ${processed.length} items, ${failed.length} failed`);
    this.lastSyncTime = new Date().toISOString();
  }

  // AGGRESSIVE sync all local data to Firebase (force sync everything)
  async aggressiveSyncAllData() {
    if (this.isSyncing) {
      if(import.meta.env.DEV)console.log('⚠️ Sync already in progress...');
      return;
    }

    try {
      this.isSyncing = true;
      console.log('🔄 SYNC: Starting AGGRESSIVE full data sync...');

      const userId = firebaseService.getCurrentUserId();
      if (!userId) {
        console.log('⚠️ SYNC: No user logged in, will retry');
        this.isSyncing = false;
        this.startAggressiveRetry();
        return;
      }

      // Process queued items FIRST
      await this.processSyncQueue();
      
      console.log('✅ SYNC: Queue processed, now syncing all critical keys...');

      // Sync ALL critical data keys - EVERYTHING user has generated
      const keysToSync = [
        // Steps
        'stepBaseline', 'stepBaselineDate', 'weeklySteps', 'todaySteps', 'stepHistory', 'step_counter_baseline', 'step_counter_date',
        // Water
        'waterLog', 'water_daily_goal', 'water_today_intake', 'water_intake_history', 'water_reminders',
        // Meals
        'foodLog', 'meal_plans', 'meal_preferences', 'saved_recipes',
        // Workouts
        'workoutLog', 'workoutHistory', 'activityLog', 'rep_history', 'exercise_preferences',
        // Heart Rate
        'heart_rate_history', 'hr_device_name', 'heartRateData',
        // Sleep
        'sleepLog', 'sleep_history', 'current_sleep_session',
        // Mental Health
        'meditationLog', 'meditation_history', 'gratitudeLog', 'journalEntries', 'gratitude_entries', 'stressLog', 'mood_history',
        // Profile
        'user_profile', 'profile_data', 'user_preferences', 'allergens', 'dietary_restrictions', 'health_goals',
        // Health Avatar
        'health_avatar_data', 'avatar_predictions', 'avatar_history',
        // Emergency
        'emergency_data', 'emergency_contacts', 'emergencyHistory', 'medical_info',
        // DNA
        'dnaAnalysis', 'dnaRawData', 'dna_last_tip', 'dna_last_tip_date', 'genetic_predictions',
        // Battles
        'battles_data', 'battle_history', 'battle_stats',
        // Meal Automation
        'meal_automation_settings', 'automated_meals', 'meal_schedule',
        // Auth
        'loginHistory', 'social_login_provider', 'social_login_data',
        // Gamification
        'gamification_data', 'achievements', 'level_data', 'xp_history', 'streaks',
        // Health
        'healthMetrics', 'health_data', 'health_history', 'ml_user_patterns',
        // Settings
        'notificationSettings', 'themeSettings', 'dark_mode', 'dark_mode_auto', 'onboardingCompleted', 'subscription_plan', 'paywall_interactions'
      ];

      let syncedCount = 0;
      let failedCount = 0;
      
      for (const key of keysToSync) {
        try {
          // Get from Preferences first (most reliable), then localStorage
          let value = null;
          
          if (this.criticalKeys.includes(key)) {
            const { value: prefsData } = await Preferences.get({ key: `wellnessai_${key}` });
            if (prefsData) {
              value = JSON.parse(prefsData);
            }
          }
          
          if (value === null) {
            const localData = localStorage.getItem(key);
            if (localData) {
              value = JSON.parse(localData);
            }
          }
          
          if (value !== null && value !== undefined) {
            await firebaseService.updateUserProfile(userId, { [key]: value });
            syncedCount++;
            console.log(`☁️ ✅ SYNC: Synced ${key} to Firebase`);
          }
        } catch (error) {
          failedCount++;
          console.error(`☁️ ❌ SYNC: Failed to sync ${key}:`, error.message);
          // Queue failed items for retry
          if (this.criticalKeys.includes(key)) {
            this.addToSyncQueue({ key, value: null, action: 'save' });
          }
        }
      }
      
      console.log(`🎯 SYNC: Aggressive sync complete - ${syncedCount} synced, ${failedCount} failed`);

      console.log('✅ SYNC: Aggressive full sync complete');
      this.lastSyncTime = new Date().toISOString();
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Aggressive sync failed:', error);
      // Retry on failure
      this.startAggressiveRetry();
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Original sync method (calls aggressive sync now)
  async syncAllData() {
    return this.aggressiveSyncAllData();
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



