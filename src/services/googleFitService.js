/**
 * Google Fit Service - Android Health Data Integration
 * Allows background step counting even when app is closed
 */

import { Capacitor } from '@capacitor/core';

// OAuth Client ID from Google Cloud Console
const GOOGLE_FIT_CLIENT_ID = '883259593086-rc237o3rs1gm48oqmctei8l23bl3l64r.apps.googleusercontent.com';

// Data types we want to access
const DATA_TYPES = {
  STEP_COUNT: 'com.google.step_count.delta',
  DISTANCE: 'com.google.distance.delta',
  CALORIES: 'com.google.calories.expended',
  HEART_RATE: 'com.google.heart_rate.bpm',
  SLEEP: 'com.google.sleep.segment'
};

class GoogleFitService {
  constructor() {
    this.isAvailable = false;
    this.isInitialized = false;
    this.googleFit = null;
  }

  /**
   * Check if Google Fit is available on this device
   */
  async checkAvailability() {
    try {
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        console.log('Google Fit only available on Android');
        return false;
      }

      // Dynamically import the plugin
      const { GoogleFit } = await import('@perfood/capacitor-google-fit');
      this.googleFit = GoogleFit;
      this.isAvailable = true;
      console.log('✅ Google Fit available');
      return true;
    } catch (error) {
      console.log('Google Fit plugin not available:', error.message);
      return false;
    }
  }

  /**
   * Initialize Google Fit and request permissions
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('Google Fit already initialized');
        return true;
      }

      const available = await this.checkAvailability();
      if (!available) {
        return false;
      }

      console.log('Requesting Google Fit permissions...');
      
      // Request permissions for health data
      const result = await this.googleFit.requestPermissions({
        scopes: [
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.location.read',
          'https://www.googleapis.com/auth/fitness.body.read',
          'https://www.googleapis.com/auth/fitness.sleep.read'
        ]
      });

      if (result && result.granted) {
        this.isInitialized = true;
        console.log('✅ Google Fit permissions granted');
        return true;
      } else {
        console.log('❌ Google Fit permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Error initializing Google Fit:', error);
      return false;
    }
  }

  /**
   * Get step count for today
   */
  async getTodaySteps() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Google Fit not initialized');
        }
      }

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      
      const result = await this.googleFit.query({
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: 'com.google.step_count.delta',
        limit: 1000
      });

      // Sum up all step counts
      let totalSteps = 0;
      if (result && result.buckets) {
        result.buckets.forEach(bucket => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach(point => {
              if (point.value && point.value.length > 0) {
                totalSteps += point.value[0].intVal || 0;
              }
            });
          }
        });
      }

      console.log(`📊 Google Fit: ${totalSteps} steps today`);
      return totalSteps;
    } catch (error) {
      console.error('Error getting steps from Google Fit:', error);
      return 0;
    }
  }

  /**
   * Get steps for a specific date range
   */
  async getStepsInRange(startDate, endDate) {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Google Fit not initialized');
        }
      }

      const result = await this.googleFit.query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataTypeName: 'com.google.step_count.delta',
        limit: 1000
      });

      let totalSteps = 0;
      if (result && result.buckets) {
        result.buckets.forEach(bucket => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach(point => {
              if (point.value && point.value.length > 0) {
                totalSteps += point.value[0].intVal || 0;
              }
            });
          }
        });
      }

      return totalSteps;
    } catch (error) {
      console.error('Error getting steps from Google Fit:', error);
      return 0;
    }
  }

  /**
   * Get distance traveled today (in meters)
   */
  async getTodayDistance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      
      const result = await this.googleFit.query({
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: 'com.google.distance.delta',
        limit: 1000
      });

      let totalDistance = 0;
      if (result && result.buckets) {
        result.buckets.forEach(bucket => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach(point => {
              if (point.value && point.value.length > 0) {
                totalDistance += point.value[0].fpVal || 0;
              }
            });
          }
        });
      }

      return totalDistance; // meters
    } catch (error) {
      console.error('Error getting distance from Google Fit:', error);
      return 0;
    }
  }

  /**
   * Get calories burned today
   */
  async getTodayCalories() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      
      const result = await this.googleFit.query({
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: 'com.google.calories.expended',
        limit: 1000
      });

      let totalCalories = 0;
      if (result && result.buckets) {
        result.buckets.forEach(bucket => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach(point => {
              if (point.value && point.value.length > 0) {
                totalCalories += point.value[0].fpVal || 0;
              }
            });
          }
        });
      }

      return Math.round(totalCalories);
    } catch (error) {
      console.error('Error getting calories from Google Fit:', error);
      return 0;
    }
  }

  /**
   * Get heart rate data
   */
  async getHeartRate() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const result = await this.googleFit.query({
        startDate: oneHourAgo.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: 'com.google.heart_rate.bpm',
        limit: 100
      });

      let latestHeartRate = 0;
      if (result && result.buckets) {
        result.buckets.forEach(bucket => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach(point => {
              if (point.value && point.value.length > 0) {
                latestHeartRate = point.value[0].fpVal || 0;
              }
            });
          }
        });
      }

      return Math.round(latestHeartRate);
    } catch (error) {
      console.error('Error getting heart rate from Google Fit:', error);
      return 0;
    }
  }

  /**
   * Disconnect from Google Fit
   */
  async disconnect() {
    try {
      if (this.googleFit) {
        // Google Fit plugin doesn't have explicit disconnect
        // User can revoke permissions in phone settings
        this.isInitialized = false;
        console.log('Google Fit disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting Google Fit:', error);
    }
  }
}

// Export singleton instance
const googleFitService = new GoogleFitService();
export default googleFitService;
