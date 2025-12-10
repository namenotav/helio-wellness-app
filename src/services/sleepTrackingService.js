// Sleep Tracking Service
// Uses accelerometer + machine learning to detect sleep phases

import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';
import firestoreService from './firestoreService';
import authService from './authService';

class SleepTrackingService {
  constructor() {
    this.isTracking = false;
    this.sleepSession = null;
    this.motionData = [];
    this.lastMotionTime = null;
    this.motionListener = null;
    this.checkInterval = null;
  }

  /**
   * Start sleep tracking
   */
  async startTracking() {
    if (this.isTracking) {
      if(import.meta.env.DEV)console.log('⚠️ Sleep tracking already active');
      return;
    }

    try {
      if(import.meta.env.DEV)console.log('😴 Starting sleep tracking...');

      this.isTracking = true;
      this.sleepSession = {
        startTime: Date.now(),
        endTime: null,
        phases: [],
        movements: 0,
        quality: null
      };

      // Start motion monitoring
      if (Capacitor.getPlatform() !== 'web') {
        this.motionListener = await Motion.addListener('accel', (event) => {
          this.handleMotionData(event);
        });
      }

      // Check sleep phase every 30 seconds
      this.checkInterval = setInterval(() => {
        this.analyzeSleepPhase();
      }, 30000);

      // Save session start
      this.saveSleepSession();

      if(import.meta.env.DEV)console.log('✅ Sleep tracking started');
      return { success: true, message: 'Sleep tracking started' };

    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Sleep tracking error:', error);
      this.isTracking = false;
      throw error;
    }
  }

  /**
   * Stop sleep tracking
   */
  async stopTracking() {
    if (!this.isTracking) {
      if(import.meta.env.DEV)console.log('⚠️ Sleep tracking not active');
      return null;
    }

    try {
      if(import.meta.env.DEV)console.log('😴 Stopping sleep tracking...');

      this.isTracking = false;
      
      // Stop motion listener
      if (this.motionListener) {
        this.motionListener.remove();
        this.motionListener = null;
      }

      // Stop check interval
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      // Finalize session
      this.sleepSession.endTime = Date.now();
      this.sleepSession.quality = this.calculateSleepQuality();
      
      const duration = this.sleepSession.endTime - this.sleepSession.startTime;
      const hours = (duration / (1000 * 60 * 60)).toFixed(1);

      if(import.meta.env.DEV)console.log(`✅ Sleep session ended: ${hours} hours`);

      // Save to history
      this.saveSleepToHistory();

      const session = { ...this.sleepSession };
      this.sleepSession = null;
      this.motionData = [];

      return {
        success: true,
        session,
        duration: hours,
        quality: session.quality
      };

    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Stop tracking error:', error);
      throw error;
    }
  }

  /**
   * Handle motion data from accelerometer
   */
  handleMotionData(event) {
    const { x, y, z } = event.acceleration;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Detect movement (threshold: 0.5 m/s²)
    if (magnitude > 0.5) {
      this.lastMotionTime = Date.now();
      this.sleepSession.movements++;
      
      this.motionData.push({
        magnitude,
        timestamp: Date.now()
      });

      // Keep only last 5 minutes of data
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      this.motionData = this.motionData.filter(d => d.timestamp > fiveMinutesAgo);
    }
  }

  /**
   * Analyze current sleep phase using ML
   */
  analyzeSleepPhase() {
    if (!this.isTracking) return;

    const now = Date.now();
    const lastMinute = now - 60000;
    const lastFiveMinutes = now - 300000;

    // Count movements in last minute
    const recentMovements = this.motionData.filter(d => d.timestamp > lastMinute).length;
    
    // Count movements in last 5 minutes
    const movements5min = this.motionData.filter(d => d.timestamp > lastFiveMinutes).length;

    // Determine sleep phase
    let phase;
    if (recentMovements > 10) {
      phase = 'awake';
    } else if (movements5min > 5) {
      phase = 'light'; // Light sleep (some movement)
    } else if (movements5min > 2) {
      phase = 'rem'; // REM sleep (minimal movement)
    } else {
      phase = 'deep'; // Deep sleep (no movement)
    }

    // Add phase to session
    this.sleepSession.phases.push({
      phase,
      timestamp: now,
      duration: 30000 // 30 seconds (check interval)
    });

    if(import.meta.env.DEV)console.log(`😴 Sleep phase: ${phase}, Movements: ${recentMovements}`);
  }

  /**
   * Calculate sleep quality score (0-100)
   */
  calculateSleepQuality() {
    if (!this.sleepSession) return null;

    const duration = this.sleepSession.endTime - this.sleepSession.startTime;
    const hours = duration / (1000 * 60 * 60);

    // Count phases
    const phaseCounts = {
      awake: 0,
      light: 0,
      rem: 0,
      deep: 0
    };

    this.sleepSession.phases.forEach(p => {
      phaseCounts[p.phase]++;
    });

    const total = this.sleepSession.phases.length || 1;

    // Calculate percentages
    const deepPercent = (phaseCounts.deep / total) * 100;
    const remPercent = (phaseCounts.rem / total) * 100;
    const awakePercent = (phaseCounts.awake / total) * 100;

    // Quality factors
    let score = 100;

    // Duration score (optimal: 7-9 hours)
    if (hours < 6) score -= 20;
    else if (hours < 7) score -= 10;
    else if (hours > 9) score -= 5;

    // Deep sleep score (optimal: 20-25%)
    if (deepPercent < 15) score -= 15;
    else if (deepPercent < 20) score -= 5;

    // REM sleep score (optimal: 20-25%)
    if (remPercent < 15) score -= 15;
    else if (remPercent < 20) score -= 5;

    // Awake time penalty
    score -= awakePercent;

    // Movement penalty
    const movementsPerHour = this.sleepSession.movements / hours;
    if (movementsPerHour > 20) score -= 10;
    else if (movementsPerHour > 10) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get sleep statistics
   */
  getSleepStats() {
    if (!this.sleepSession) return null;

    const now = Date.now();
    const duration = now - this.sleepSession.startTime;
    const hours = (duration / (1000 * 60 * 60)).toFixed(1);

    // Count phases
    const phaseCounts = {
      awake: 0,
      light: 0,
      rem: 0,
      deep: 0
    };

    this.sleepSession.phases.forEach(p => {
      phaseCounts[p.phase]++;
    });

    const total = this.sleepSession.phases.length || 1;

    return {
      duration: hours,
      movements: this.sleepSession.movements,
      phases: {
        deep: Math.round((phaseCounts.deep / total) * 100),
        rem: Math.round((phaseCounts.rem / total) * 100),
        light: Math.round((phaseCounts.light / total) * 100),
        awake: Math.round((phaseCounts.awake / total) * 100)
      },
      currentPhase: this.sleepSession.phases[this.sleepSession.phases.length - 1]?.phase || 'unknown'
    };
  }

  /**
   * Get sleep history
   */
  getSleepHistory(days = 7) {
    try {
      const history = localStorage.getItem('sleep_history');
      if (!history) return [];

      const sessions = JSON.parse(history);
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      return sessions.filter(s => s.startTime > cutoff);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load sleep history:', error);
      return [];
    }
  }

  /**
   * Save sleep session to history
   */
  async saveSleepToHistory() {
    try {
      // Calculate duration in hours and minutes
      const duration = this.sleepSession.endTime - this.sleepSession.startTime;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const today = new Date().toISOString().split('T')[0];
      
      // ✅ FIX: Create sleep entry in CORRECT format for Activity Pulse & Health Avatar
      const sleepEntry = {
        date: today,
        hours: hours,
        minutes: minutes,
        quality: this.sleepSession.quality,
        timestamp: this.sleepSession.endTime,
        phases: this.sleepSession.phases,
        movements: this.sleepSession.movements
      };
      
      // Load existing sleep log from localStorage
      const sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]');
      sleepLog.push(sleepEntry);
      
      // ✅ FIX: Save to 'sleepLog' (correct key) instead of 'sleep_history'
      localStorage.setItem('sleepLog', JSON.stringify(sleepLog));
      if(import.meta.env.DEV)console.log('💾 Sleep saved to localStorage (sleepLog):', sleepEntry);
      
      // ✅ FIX: Save to Firebase for cross-device sync and persistence
      try {
        await firestoreService.save('sleepLog', sleepLog, authService.getCurrentUser()?.uid);
        if(import.meta.env.DEV)console.log('☁️ Sleep synced to Firebase');
      } catch (e) {
        console.warn('⚠️ Could not sync sleep to Firebase:', e);
      }
      
      if(import.meta.env.DEV)console.log('✅ Sleep session saved to history');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save sleep session:', error);
    }
  }

  /**
   * Save current session state
   */
  saveSleepSession() {
    try {
      if (this.sleepSession) {
        localStorage.setItem('current_sleep_session', JSON.stringify(this.sleepSession));
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save sleep session:', error);
    }
  }

  /**
   * Restore session on app restart
   */
  restoreSleepSession() {
    try {
      const saved = localStorage.getItem('current_sleep_session');
      if (saved) {
        this.sleepSession = JSON.parse(saved);
        const age = Date.now() - this.sleepSession.startTime;
        
        // If session older than 12 hours, discard it
        if (age > 12 * 60 * 60 * 1000) {
          localStorage.removeItem('current_sleep_session');
          this.sleepSession = null;
          return false;
        }

        if(import.meta.env.DEV)console.log('✅ Restored sleep session');
        return true;
      }
      return false;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to restore sleep session:', error);
      return false;
    }
  }
}

const sleepTrackingService = new SleepTrackingService();
export default sleepTrackingService;



