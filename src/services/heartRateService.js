// Heart Rate Monitoring Service
// Supports Bluetooth heart rate monitors (Polar, Garmin, Apple Watch, etc.)

import { Capacitor } from '@capacitor/core';

class HeartRateService {
  constructor() {
    this.isMonitoring = false;
    this.currentHeartRate = null;
    this.heartRateHistory = [];
    this.device = null;
    this.characteristic = null;
    this.listeners = [];
    this.maxHistorySize = 1000; // Keep last 1000 readings
  }

  /**
   * Request Bluetooth permissions and scan for HR monitors
   */
  async connectDevice() {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth not supported on this device');
    }

    try {
      if(import.meta.env.DEV)console.log('🫀 Scanning for heart rate monitors...');

      // Request Bluetooth device with Heart Rate service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information']
      });

      if(import.meta.env.DEV)console.log('✅ Connected to:', this.device.name);

      // Connect to GATT server
      const server = await this.device.gatt.connect();
      
      // Get Heart Rate service
      const service = await server.getPrimaryService('heart_rate');
      
      // Get Heart Rate Measurement characteristic
      this.characteristic = await service.getCharacteristic('heart_rate_measurement');

      // Start notifications
      await this.characteristic.startNotifications();
      
      // Listen for heart rate updates
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleHeartRateData(event.target.value);
      });

      this.isMonitoring = true;
      
      // Save device info
      localStorage.setItem('hr_device_name', this.device.name || 'Unknown Device');
      
      return {
        success: true,
        deviceName: this.device.name,
        message: 'Heart rate monitor connected'
      };

    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Heart rate connection error:', error);
      throw new Error('Failed to connect to heart rate monitor: ' + error.message);
    }
  }

  /**
   * Parse heart rate data from Bluetooth characteristic
   */
  handleHeartRateData(value) {
    // Heart Rate Measurement format (per Bluetooth spec)
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x01;
    
    let heartRate;
    if (is16Bit) {
      heartRate = value.getUint16(1, true); // little endian
    } else {
      heartRate = value.getUint8(1);
    }

    // Energy Expended (if present)
    const energyExpendedPresent = flags & 0x08;
    let energyExpended = null;
    if (energyExpendedPresent) {
      const offset = is16Bit ? 3 : 2;
      energyExpended = value.getUint16(offset, true);
    }

    // Update current heart rate
    this.currentHeartRate = heartRate;

    // Add to history
    const reading = {
      bpm: heartRate,
      timestamp: Date.now(),
      energyExpended
    };

    this.heartRateHistory.push(reading);

    // Trim history if too large
    if (this.heartRateHistory.length > this.maxHistorySize) {
      this.heartRateHistory.shift();
    }

    // Save to localStorage periodically (every 10 readings)
    if (this.heartRateHistory.length % 10 === 0) {
      this.saveHistory();
    }

    // Notify listeners
    this.notifyListeners(reading);

    if(import.meta.env.DEV)console.log(`💓 Heart Rate: ${heartRate} BPM`);
  }

  /**
   * Disconnect from heart rate monitor
   */
  async disconnect() {
    try {
      if (this.characteristic) {
        await this.characteristic.stopNotifications();
      }
      
      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect();
      }

      this.isMonitoring = false;
      this.device = null;
      this.characteristic = null;

      if(import.meta.env.DEV)console.log('🫀 Heart rate monitor disconnected');
      
      return { success: true, message: 'Disconnected' };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Disconnect error:', error);
      throw error;
    }
  }

  /**
   * Get current heart rate
   */
  getCurrentHeartRate() {
    return this.currentHeartRate;
  }

  /**
   * Get heart rate zone
   */
  getHeartRateZone(age = 30) {
    if (!this.currentHeartRate) return null;

    const maxHR = 220 - age;
    const percentage = (this.currentHeartRate / maxHR) * 100;

    if (percentage < 50) return { zone: 'Resting', color: '#4CAF50', intensity: 'Very Light' };
    if (percentage < 60) return { zone: 'Fat Burn', color: '#8BC34A', intensity: 'Light' };
    if (percentage < 70) return { zone: 'Cardio', color: '#FFC107', intensity: 'Moderate' };
    if (percentage < 80) return { zone: 'Peak', color: '#FF9800', intensity: 'Hard' };
    return { zone: 'Maximum', color: '#F44336', intensity: 'Maximum' };
  }

  /**
   * Calculate average heart rate
   */
  getAverageHeartRate(minutes = 5) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentReadings = this.heartRateHistory.filter(r => r.timestamp > cutoff);
    
    if (recentReadings.length === 0) return null;
    
    const sum = recentReadings.reduce((acc, r) => acc + r.bpm, 0);
    return Math.round(sum / recentReadings.length);
  }

  /**
   * Get heart rate variability (HRV)
   */
  getHeartRateVariability() {
    if (this.heartRateHistory.length < 10) return null;

    const recent = this.heartRateHistory.slice(-10);
    const intervals = [];
    
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i].timestamp - recent[i - 1].timestamp);
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    return Math.round(stdDev);
  }

  /**
   * Subscribe to heart rate updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(reading) {
    this.listeners.forEach(callback => {
      try {
        callback(reading);
      } catch (error) {
        if(import.meta.env.DEV)console.error('Listener error:', error);
      }
    });
  }

  /**
   * Save history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem('heart_rate_history', JSON.stringify(this.heartRateHistory));
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save heart rate history:', error);
    }
  }

  /**
   * Load history from localStorage
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem('heart_rate_history');
      if (saved) {
        this.heartRateHistory = JSON.parse(saved);
        if(import.meta.env.DEV)console.log(`✅ Loaded ${this.heartRateHistory.length} heart rate readings`);
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load heart rate history:', error);
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.device && this.device.gatt && this.device.gatt.connected;
  }

  /**
   * Get device name
   */
  getDeviceName() {
    return this.device?.name || localStorage.getItem('hr_device_name') || 'No device';
  }
}

const heartRateService = new HeartRateService();
export default heartRateService;



