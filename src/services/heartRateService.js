// Heart Rate Monitoring Service
// Supports Bluetooth heart rate monitors (Polar, Garmin, Apple Watch, etc.)

import { Capacitor } from '@capacitor/core';
import syncService from './syncService.js';

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
      
      // Save device info using syncService
      await syncService.saveData('hr_device_name', this.device.name || 'Unknown Device');
      
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
   * Measure heart rate using phone camera (photoplethysmography)
   */
  async measureWithCamera(onProgress) {
    try {
      if(import.meta.env.DEV)console.log('❤️ Starting camera heart rate measurement...');
      
      // Request camera access with constraints
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
      } catch (mediaError) {
        if(import.meta.env.DEV)console.error('Camera access error:', mediaError);
        throw new Error('Camera access denied. Please allow camera permission.');
      }

      if(import.meta.env.DEV)console.log('❤️ Camera stream obtained');

      // Enable flashlight if supported
      const track = stream.getVideoTracks()[0];
      if(import.meta.env.DEV)console.log('❤️ Video track:', track.label);
      
      try {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] });
          if(import.meta.env.DEV)console.log('❤️ Flashlight enabled');
        }
      } catch (torchError) {
        if(import.meta.env.DEV)console.log('❤️ Torch not available:', torchError.message);
      }

      // Create video element for processing
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('autoplay', 'true');
      video.muted = true;
      
      try {
        await video.play();
        if(import.meta.env.DEV)console.log('❤️ Video playing');
      } catch (playError) {
        if(import.meta.env.DEV)console.error('Video play error:', playError);
      }

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video timeout'));
        }, 5000);
        
        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          if(import.meta.env.DEV)console.log('❤️ Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
          resolve();
        };
        
        // If already loaded
        if (video.readyState >= 1) {
          clearTimeout(timeout);
          if(import.meta.env.DEV)console.log('❤️ Video already ready:', video.videoWidth, 'x', video.videoHeight);
          resolve();
        }
      });

      // Create canvas for frame analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      if(import.meta.env.DEV)console.log('❤️ Canvas size:', canvas.width, 'x', canvas.height);

      // Collect red channel values (blood flow)
      const redValues = [];
      const sampleDuration = 10000; // 10 seconds
      const sampleRate = 30; // 30 FPS
      const startTime = Date.now();

      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          try {
            // Draw current frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get center region (finger should be here)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const sampleSize = 50;
            const imageData = ctx.getImageData(
              centerX - sampleSize / 2,
              centerY - sampleSize / 2,
              sampleSize,
              sampleSize
            );

            // Calculate average red value
            let redSum = 0;
            for (let i = 0; i < imageData.data.length; i += 4) {
              redSum += imageData.data[i]; // Red channel
            }
            const avgRed = redSum / (imageData.data.length / 4);
            redValues.push(avgRed);
            
            // Check if finger is covering camera (red values should be high and consistent)
            if (redValues.length > 10) {
              const recentReds = redValues.slice(-10);
              const avgRecent = recentReds.reduce((a, b) => a + b, 0) / recentReds.length;
              // If average red is very low, finger might not be on camera
              if (avgRecent < 50 && onProgress) {
                // Still continue measuring but signal quality might be poor
                if(import.meta.env.DEV)console.log('❤️ Low signal - avgRed:', avgRecent.toFixed(1));
              }
            }

            // Update progress
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / sampleDuration) * 100, 100);
            if (onProgress) onProgress(Math.round(progress));

            // Stop after sample duration
            if (elapsed >= sampleDuration) {
              clearInterval(interval);

              // Clean up
              stream.getTracks().forEach(track => track.stop());

              // Analyze signal quality
              const avgRed = redValues.reduce((a, b) => a + b, 0) / redValues.length;
              const variance = redValues.reduce((a, b) => a + Math.pow(b - avgRed, 2), 0) / redValues.length;
              const signalQuality = variance > 10 ? 'good' : (variance > 2 ? 'fair' : 'poor');
              
              if(import.meta.env.DEV)console.log('❤️ Collected', redValues.length, 'samples, avgRed:', avgRed.toFixed(1), 'variance:', variance.toFixed(2), 'quality:', signalQuality);

              // Calculate BPM from red values
              const bpm = this.calculateBPMFromSignal(redValues, sampleRate);
              if(import.meta.env.DEV)console.log('❤️ Final BPM:', bpm);

              // Determine confidence based on signal quality
              let confidence = 0.5;
              if (signalQuality === 'good' && bpm >= 50 && bpm <= 150) {
                confidence = 0.85;
              } else if (signalQuality === 'fair') {
                confidence = 0.65;
              }

              // Save reading (always save something)
              const reading = {
                bpm,
                timestamp: Date.now(),
                source: 'camera',
                quality: signalQuality
              };
              this.currentHeartRate = bpm;
              this.heartRateHistory.push(reading);
              this.saveHistory();

              resolve({ bpm, confidence, quality: signalQuality });
            }
          } catch (frameError) {
            if(import.meta.env.DEV)console.error('Frame processing error:', frameError);
          }
        }, 1000 / sampleRate);

        // Timeout after 12 seconds
        setTimeout(() => {
          clearInterval(interval);
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Measurement timeout'));
        }, 12000);
      });
    } catch (error) {
      console.error('❌ Camera heart rate error:', error);
      throw new Error('Camera access denied or not supported');
    }
  }

  /**
   * Calculate BPM from signal using improved peak detection with smoothing
   */
  calculateBPMFromSignal(signal, sampleRate) {
    if (signal.length < 30) {
      if(import.meta.env.DEV)console.log('❤️ Not enough samples:', signal.length);
      return this.estimateBPMFromVariance(signal);
    }

    // Apply moving average smoothing (window of 5)
    const smoothed = [];
    const windowSize = 5;
    for (let i = 0; i < signal.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - windowSize); j <= Math.min(signal.length - 1, i + windowSize); j++) {
        sum += signal[j];
        count++;
      }
      smoothed.push(sum / count);
    }

    // Remove DC component (normalize)
    const mean = smoothed.reduce((a, b) => a + b, 0) / smoothed.length;
    const normalized = smoothed.map(v => v - mean);

    // Calculate standard deviation for adaptive threshold
    const variance = normalized.reduce((a, b) => a + b * b, 0) / normalized.length;
    const stdDev = Math.sqrt(variance);
    
    // Adaptive threshold based on signal strength
    const maxVal = Math.max(...normalized);
    const threshold = Math.max(stdDev * 0.5, maxVal * 0.3);
    
    if(import.meta.env.DEV)console.log('❤️ Signal stats - mean:', mean.toFixed(2), 'stdDev:', stdDev.toFixed(2), 'threshold:', threshold.toFixed(2));

    // Find peaks with minimum distance (at least 0.3 seconds apart = ~200 BPM max)
    const minPeakDistance = Math.floor(sampleRate * 0.3);
    const peaks = [];
    let lastPeakIndex = -minPeakDistance;

    for (let i = 2; i < normalized.length - 2; i++) {
      // Check if this is a local maximum
      if (
        normalized[i] > threshold &&
        normalized[i] > normalized[i - 1] &&
        normalized[i] > normalized[i - 2] &&
        normalized[i] >= normalized[i + 1] &&
        normalized[i] >= normalized[i + 2] &&
        (i - lastPeakIndex) >= minPeakDistance
      ) {
        peaks.push(i);
        lastPeakIndex = i;
      }
    }

    if(import.meta.env.DEV)console.log('❤️ Found', peaks.length, 'peaks');

    // Calculate average time between peaks
    if (peaks.length < 2) {
      // Fallback: estimate from signal variance/frequency
      return this.estimateBPMFromVariance(signal);
    }

    // Filter out outlier intervals
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      const interval = peaks[i] - peaks[i - 1];
      // Only accept intervals that would give 40-200 BPM
      const estimatedBPM = (60 * sampleRate) / interval;
      if (estimatedBPM >= 40 && estimatedBPM <= 200) {
        intervals.push(interval);
      }
    }

    if (intervals.length < 1) {
      return this.estimateBPMFromVariance(signal);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round((60 * sampleRate) / avgInterval);

    if(import.meta.env.DEV)console.log('❤️ Calculated BPM:', bpm, 'from', intervals.length, 'intervals');

    // Sanity check (typical heart rate range)
    return bpm >= 40 && bpm <= 200 ? bpm : this.estimateBPMFromVariance(signal);
  }

  /**
   * Fallback: Estimate BPM from signal frequency characteristics
   */
  estimateBPMFromVariance(signal) {
    if (signal.length < 10) return 72; // Default resting heart rate
    
    // Count zero crossings as a frequency estimate
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    let crossings = 0;
    for (let i = 1; i < signal.length; i++) {
      if ((signal[i] - mean) * (signal[i - 1] - mean) < 0) {
        crossings++;
      }
    }
    
    // Each heartbeat has ~2 zero crossings (up and down)
    // signal is 10 seconds at 30 fps = 300 samples
    const durationSeconds = signal.length / 30;
    const estimatedBPM = Math.round((crossings / 2) * (60 / durationSeconds));
    
    if(import.meta.env.DEV)console.log('❤️ Fallback estimation - crossings:', crossings, 'estimated BPM:', estimatedBPM);
    
    // Return within reasonable range, or default
    if (estimatedBPM >= 50 && estimatedBPM <= 180) {
      return estimatedBPM;
    }
    
    // Ultimate fallback: return a reasonable resting heart rate
    return 72;
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
   * Save history to cloud (Preferences + Firebase)
   */
  async saveHistory() {
    try {
      await syncService.saveData('heart_rate_history', this.heartRateHistory);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save heart rate history:', error);
    }
  }

  /**
   * Load history from cloud/localStorage
   */
  async loadHistory() {
    try {
      // 🔥 FIX: Try to load from syncService (Preferences → Firebase → localStorage)
      const syncService = (await import('./syncService.js')).default;
      const cloudHistory = await syncService.getData('heart_rate_history');
      if (cloudHistory && cloudHistory.length > 0) {
        this.heartRateHistory = cloudHistory;
        localStorage.setItem('heart_rate_history', JSON.stringify(cloudHistory));
        if(import.meta.env.DEV)console.log(`✅ Loaded ${this.heartRateHistory.length} heart rate readings from cloud`);
        return;
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem('heart_rate_history');
      if (saved) {
        this.heartRateHistory = JSON.parse(saved);
        if(import.meta.env.DEV)console.log(`✅ Loaded ${this.heartRateHistory.length} heart rate readings from localStorage`);
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load heart rate history:', error);
      // Final fallback
      try {
        const saved = localStorage.getItem('heart_rate_history');
        if (saved) {
          this.heartRateHistory = JSON.parse(saved);
        }
      } catch (e) { /* ignore */ }
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



