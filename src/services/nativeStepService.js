/**
 * Native Step Counter Foreground Service
 * TRUE 24/7 background step counting using Android Foreground Service
 * Uses direct WebView bridge to bypass Capacitor plugin issues
 */

import { Capacitor } from '@capacitor/core';

class NativeStepService {
  constructor() {
    this.isRunning = false;
    this.listeners = [];
    this.currentSteps = 0;
  }

  /**
   * Start the native foreground service
   * Shows persistent notification and counts steps 24/7
   */
  async start() {
    try {
      console.log('🚀 Starting native foreground service via WebView bridge...');
      
      // Check if we're on Android
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        throw new Error('Step counter only works on Android');
      }
      
      // Check if WebView bridge is available
      if (!window.AndroidStepCounter) {
        console.error('❌ AndroidStepCounter WebView bridge not found');
        throw new Error('AndroidStepCounter bridge not available. App may need restart.');
      }
      
      console.log('✅ AndroidStepCounter bridge found, starting service...');
      const resultJson = window.AndroidStepCounter.startService();
      const result = JSON.parse(resultJson);
      console.log('📱 startService result:', result);
      
      if (result && result.started) {
        this.isRunning = true;
        console.log('✅ NATIVE FOREGROUND SERVICE STARTED!');
        console.log('   → Persistent notification will appear');
        console.log('   → Steps count even when app is CLOSED');
        console.log('   → Service runs 24/7');
        
        // Start polling for step updates
        this.startPolling();
        return true;
      }
      
      console.warn('⚠️ Service start failed:', result.error || 'Unknown error');
      throw new Error(result.error || 'Failed to start service');
      
    } catch (error) {
      console.error('❌ Failed to start native service:', error);
      throw error; // Re-throw so UI can handle it
    }
  }

  /**
   * Stop the foreground service
   */
  async stop() {
    try {
      if (window.AndroidStepCounter) {
        const resultJson = window.AndroidStepCounter.stopService();
        const result = JSON.parse(resultJson);
        this.isRunning = false;
        this.stopPolling();
        console.log('Service stopped');
        return result.stopped;
      }
      return false;
    } catch (error) {
      console.error('Error stopping service:', error);
      return false;
    }
  }

  /**
   * Get current step count from the service
   */
  async getSteps() {
    try {
      if (window.AndroidStepCounter) {
        const resultJson = window.AndroidStepCounter.getSteps();
        const result = JSON.parse(resultJson);
        this.currentSteps = result.steps || 0;
        return this.currentSteps;
      }
      return 0;
    } catch (error) {
      console.error('Error getting steps:', error);
      return 0;
    }
  }

  /**
   * Poll for step updates every 5 seconds
   */
  startPolling() {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(async () => {
      const steps = await this.getSteps();
      if (steps !== this.currentSteps) {
        this.currentSteps = steps;
        this.notifyListeners(steps);
      }
    }, 5000); // Poll every 5 seconds
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Add listener for step updates
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of step count change
   */
  notifyListeners(steps) {
    this.listeners.forEach(cb => {
      try {
        cb(steps);
      } catch (error) {
        console.error('Error in step listener:', error);
      }
    });
  }

  /**
   * Check if service is running
   */
  isActive() {
    return this.isRunning;
  }
}

// Export singleton
const nativeStepService = new NativeStepService();
export default nativeStepService;
