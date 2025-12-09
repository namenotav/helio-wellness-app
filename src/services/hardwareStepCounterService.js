/**
 * Android Hardware Step Counter Service
 * Uses the phone's built-in step counter chip (like Samsung Health uses)
 * This counts steps even when app is closed!
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

class HardwareStepCounterService {
  constructor() {
    this.isAvailable = false;
    this.isTracking = false;
    this.baselineSteps = 0;
    this.todaySteps = 0;
    this.listeners = [];
  }

  /**
   * Check if hardware step counter is available
   */
  async checkAvailability() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Hardware step counter only on native');
      return false;
    }

    // Try to use the existing StepCounterPlugin
    try {
      const { StepCounter } = await import('@capacitor/core');
      const result = await StepCounter.isAvailable();
      this.isAvailable = result.available;
      return this.isAvailable;
    } catch (error) {
      console.log('Hardware step counter not available');
      return false;
    }
  }

  /**
   * Start tracking steps from hardware sensor
   */
  async startTracking() {
    try {
      const available = await this.checkAvailability();
      if (!available) {
        console.log('❌ Hardware step counter not available');
        return false;
      }

      // Get baseline (steps since phone boot)
      const { StepCounter } = await import('@capacitor/core');
      const result = await StepCounter.getStepCount();
      
      // Load saved baseline from yesterday
      const saved = await Preferences.get({ key: 'step_counter_baseline' });
      const savedDate = await Preferences.get({ key: 'step_counter_date' });
      
      const today = new Date().toDateString();
      
      if (savedDate.value === today && saved.value) {
        // Same day, use saved baseline
        this.baselineSteps = parseInt(saved.value);
      } else {
        // New day, reset baseline
        this.baselineSteps = result.steps;
        await Preferences.set({ key: 'step_counter_baseline', value: result.steps.toString() });
        await Preferences.set({ key: 'step_counter_date', value: today });
      }

      // Calculate today's steps
      this.todaySteps = Math.max(0, result.steps - this.baselineSteps);
      
      // Start listening for updates
      this.listener = await StepCounter.addListener('stepCount', (data) => {
        this.todaySteps = Math.max(0, data.steps - this.baselineSteps);
        this.notifyListeners();
      });

      this.isTracking = true;
      console.log(`✅ HARDWARE STEP COUNTER ACTIVE! ${this.todaySteps} steps today`);
      console.log('   This counts even when app is closed!');
      
      return true;
    } catch (error) {
      console.error('Error starting hardware step counter:', error);
      return false;
    }
  }

  /**
   * Get current step count
   */
  getSteps() {
    return this.todaySteps;
  }

  /**
   * Add listener for step updates
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.todaySteps);
      } catch (error) {
        console.error('Error in step listener:', error);
      }
    });
  }

  /**
   * Stop tracking
   */
  async stopTracking() {
    if (this.listener) {
      await this.listener.remove();
    }
    this.isTracking = false;
  }
}

const hardwareStepCounter = new HardwareStepCounterService();
export default hardwareStepCounter;
