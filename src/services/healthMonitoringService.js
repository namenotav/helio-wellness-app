/**
 * Native Health Monitoring Service
 * TRUE 24/7 background health monitoring using Android Foreground Service
 * Monitors: Heart Rate, Movement/Stillness, GPS Location, Falls
 * Uses direct WebView bridge to bypass Capacitor plugin issues
 */

import { Capacitor } from '@capacitor/core';

class HealthMonitoringService {
  constructor() {
    this.isRunning = false;
    this.listeners = [];
    this.pollInterval = null;
    this.alertCheckInterval = null;
    this.currentStatus = {};
  }

  /**
   * Start the native health monitoring foreground service
   * Shows persistent notification and monitors health 24/7
   */
  async start() {
    try {
      console.log('🚀 Starting native health monitoring service via WebView bridge...');
      
      // Check if we're on Android
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        throw new Error('Health monitoring only works on Android');
      }
      
      // Check if WebView bridge is available
      if (!window.AndroidHealthMonitoring) {
        console.error('❌ AndroidHealthMonitoring WebView bridge not found');
        throw new Error('AndroidHealthMonitoring bridge not available. App may need restart.');
      }
      
      console.log('✅ AndroidHealthMonitoring bridge found, starting service...');
      const resultJson = window.AndroidHealthMonitoring.startService();
      const result = JSON.parse(resultJson);
      console.log('📱 startService result:', result);
      
      if (result && result.started) {
        this.isRunning = true;
        console.log('✅ NATIVE HEALTH MONITORING SERVICE STARTED!');
        console.log('   → Persistent notification will appear');
        console.log('   → Monitors: Heart Rate, Movement, Location, Falls');
        console.log('   → Service runs 24/7 even when app closed');
        
        // Start polling for status updates
        this.startStatusPolling();
        
        // Start checking for alerts
        this.startAlertPolling();
        
        return true;
      }
      
      console.warn('⚠️ Service start failed:', result.error || 'Unknown error');
      throw new Error(result.error || 'Failed to start service');
      
    } catch (error) {
      console.error('❌ Failed to start native health monitoring service:', error);
      throw error;
    }
  }

  /**
   * Stop the foreground service
   */
  async stop() {
    try {
      if (window.AndroidHealthMonitoring) {
        const resultJson = window.AndroidHealthMonitoring.stopService();
        const result = JSON.parse(resultJson);
        this.isRunning = false;
        this.stopStatusPolling();
        this.stopAlertPolling();
        console.log('Health monitoring service stopped');
        return result.stopped;
      }
      return false;
    } catch (error) {
      console.error('Error stopping health monitoring service:', error);
      return false;
    }
  }

  /**
   * Get current health status from the service
   */
  async getStatus() {
    try {
      if (window.AndroidHealthMonitoring) {
        const statusJson = window.AndroidHealthMonitoring.getHealthStatus();
        const status = JSON.parse(statusJson);
        this.currentStatus = status;
        return status;
      }
      return {};
    } catch (error) {
      console.error('Error getting health status:', error);
      return {};
    }
  }

  /**
   * Check for active alerts
   */
  async checkAlerts() {
    try {
      if (window.AndroidHealthMonitoring) {
        const alertJson = window.AndroidHealthMonitoring.getAlertStatus();
        const alert = JSON.parse(alertJson);
        
        if (alert.alertTriggered) {
          console.warn('⚠️ HEALTH ALERT:', alert);
          this.handleAlert(alert);
        }
        
        return alert;
      }
      return {};
    } catch (error) {
      console.error('Error checking alerts:', error);
      return {};
    }
  }

  /**
   * Dismiss current alert
   */
  async dismissAlert() {
    try {
      if (window.AndroidHealthMonitoring) {
        const resultJson = window.AndroidHealthMonitoring.dismissAlert();
        const result = JSON.parse(resultJson);
        console.log('Alert dismissed:', result);
        return result.dismissed;
      }
      return false;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return false;
    }
  }

  /**
   * Handle health alert (trigger callback)
   */
  handleAlert(alert) {
    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback({
          type: 'health',
          alertType: alert.alertType,
          message: alert.alertMessage,
          timestamp: alert.alertTimestamp
        });
      } catch (error) {
        console.error('Error in health alert listener:', error);
      }
    });
  }

  /**
   * Poll for status updates every 5 seconds
   */
  startStatusPolling() {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(async () => {
      const status = await this.getStatus();
      
      // Log significant changes
      if (status.heartRateAvailable && status.heartRate !== this.currentStatus.heartRate) {
        console.log('💓 Heart Rate:', status.heartRate, 'bpm');
      }
      
      if (status.stillnessMinutes > 0 && status.stillnessMinutes % 30 === 0) {
        console.log('⏱️ Stillness:', status.stillnessMinutes, 'minutes');
      }
    }, 5000); // Poll every 5 seconds
  }

  /**
   * Stop status polling
   */
  stopStatusPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Poll for alerts every 2 seconds
   */
  startAlertPolling() {
    if (this.alertCheckInterval) return;
    
    this.alertCheckInterval = setInterval(async () => {
      await this.checkAlerts();
    }, 2000); // Check every 2 seconds for faster alert response
  }

  /**
   * Stop alert polling
   */
  stopAlertPolling() {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = null;
    }
  }

  /**
   * Add listener for health alerts
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Check if service is running
   */
  isActive() {
    return this.isRunning;
  }

  /**
   * Get formatted status for UI
   */
  getFormattedStatus() {
    const status = this.currentStatus;
    
    return {
      // Heart Rate
      heartRate: status.heartRateAvailable ? `${Math.round(status.heartRate)} bpm` : 'Not available',
      heartRateAvailable: status.heartRateAvailable || false,
      
      // Movement
      lastMovement: status.lastMovementTime 
        ? new Date(status.lastMovementTime).toLocaleTimeString() 
        : 'Unknown',
      stillnessMinutes: status.stillnessMinutes || 0,
      stillnessHours: Math.floor((status.stillnessMinutes || 0) / 60),
      isMoving: status.isMoving || false,
      
      // Location
      location: status.locationAvailable 
        ? `${status.latitude.toFixed(6)}, ${status.longitude.toFixed(6)}` 
        : 'GPS not available',
      locationAvailable: status.locationAvailable || false,
      locationStuckHours: status.locationStuckHours || 0,
      
      // Overall
      monitoring: this.isRunning,
      lastUpdate: new Date().toLocaleTimeString()
    };
  }
}

// Export singleton
const healthMonitoringService = new HealthMonitoringService();
export default healthMonitoringService;
