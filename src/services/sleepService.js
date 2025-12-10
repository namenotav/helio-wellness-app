// Sleep Tracking Service - Triple Storage (localStorage + Preferences + Firebase)
import syncService from './syncService.js';
import firestoreService from './firestoreService';
import authService from './authService';

class SleepService {
  constructor() {
    this.sleepLog = [];
  }

  /**
   * Initialize service and load data
   */
  async initialize() {
    await this.loadSleepLog();
    if(import.meta.env.DEV)console.log('😴 Sleep service initialized');
  }

  /**
   * Log sleep data
   */
  async logSleep(sleepData) {
    try {
      const sleep = {
        ...sleepData,
        id: 'sleep_' + Date.now(),
        timestamp: Date.now(),
        date: sleepData.date || new Date().toISOString().split('T')[0]
      };

      this.sleepLog.push(sleep);

      // Save to triple storage (localStorage + Preferences + Firebase)
      await this.saveSleepLog();

      if(import.meta.env.DEV)console.log('✅ Sleep logged:', sleep.duration || sleep.hours, 'hours');

      return {
        success: true,
        sleep: sleep
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to log sleep:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get sleep log
   */
  getSleepLog(days = 30) {
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.sleepLog.filter(s => s.timestamp > cutoffDate);
  }

  /**
   * Get last night's sleep
   */
  getLastNightSleep() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.sleepLog.find(s => s.date === today || s.date === yesterday);
  }

  /**
   * Delete a sleep entry
   */
  async deleteSleep(sleepId) {
    try {
      this.sleepLog = this.sleepLog.filter(s => s.id !== sleepId);
      await this.saveSleepLog();
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to delete sleep:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save sleep log to triple storage
   */
  async saveSleepLog() {
    try {
      // Keep last 90 days
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      const recentSleep = this.sleepLog.filter(s => s.timestamp > ninetyDaysAgo);
      this.sleepLog = recentSleep;

      // Save to localStorage (backward compatibility)
      localStorage.setItem('sleepLog', JSON.stringify(recentSleep));

      // Save to syncService (Preferences + Firebase)
      await firestoreService.save('sleepLog', recentSleep, authService.getCurrentUser()?.uid);

      if(import.meta.env.DEV)console.log('💾 Sleep log saved (localStorage + Preferences + Firebase)');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save sleep log:', error);
    }
  }

  /**
   * Load sleep log from storage
   */
  async loadSleepLog() {
    try {
      // Try syncService first (Preferences + Firebase)
      const log = await firestoreService.get('sleepLog', authService.getCurrentUser()?.uid);
      if (log && Array.isArray(log)) {
        this.sleepLog = log;
        if(import.meta.env.DEV)console.log('✅ Loaded sleep log from syncService:', log.length, 'entries');
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('sleepLog');
        if (saved) {
          this.sleepLog = JSON.parse(saved);
          if(import.meta.env.DEV)console.log('✅ Loaded sleep log from localStorage:', this.sleepLog.length, 'entries');
        } else {
          this.sleepLog = [];
          if(import.meta.env.DEV)console.log('ℹ️ No sleep log found - starting fresh');
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load sleep log:', error);
      this.sleepLog = [];
    }
  }

  /**
   * Get sleep statistics
   */
  getSleepStats() {
    const thirtyDays = this.getSleepLog(30);
    const sevenDays = this.getSleepLog(7);

    const avgSleep30 = thirtyDays.length > 0
      ? thirtyDays.reduce((sum, s) => sum + (s.duration || s.hours || 0), 0) / thirtyDays.length
      : 0;

    const avgSleep7 = sevenDays.length > 0
      ? sevenDays.reduce((sum, s) => sum + (s.duration || s.hours || 0), 0) / sevenDays.length
      : 0;

    return {
      total: this.sleepLog.length,
      last30Days: thirtyDays.length,
      last7Days: sevenDays.length,
      averageDuration30Days: avgSleep30.toFixed(1),
      averageDuration7Days: avgSleep7.toFixed(1),
      lastNight: this.getLastNightSleep()
    };
  }
}

const sleepService = new SleepService();
export default sleepService;
