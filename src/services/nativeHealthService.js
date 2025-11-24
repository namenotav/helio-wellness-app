// Native Health Data Integration Service - PREMIUM VERSION
// Real-time step counting, health metrics, achievements
// Uses device accelerometer for accurate step detection

import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';

class NativeHealthService {
  constructor() {
    this.stepCount = 0;
    this.stepGoal = 10000;
    this.lastStepUpdate = Date.now();
    this.healthData = {
      steps: 0,
      calories: 0,
      distance: 0,
      activeMinutes: 0,
      heartRate: null,
      weight: null,
      sleep: null
    };
    
    this.accelerometerListener = null;
    this.stepDetectionThreshold = 9.0; // Very low threshold - your movements show 8-10 m/s²
    this.lastStepTime = 0;
    this.stepListeners = [];
    
    // Advanced step detection
    this.recentAccelerations = [];
    this.stepCadence = []; // Track timing between steps
    this.minStepInterval = 250; // Minimum 250ms between steps (faster detection)
    
    // Debug and monitoring
    this.debugMode = true; // Enable detailed logging
    this.motionPermissionGranted = false;
    this.isListening = false;
    this.lastAccelEvent = null;
    this.totalEventsReceived = 0;
  }

  async initialize() {
    try {
      console.log('🏃 Initializing Native Health Service...');
      
      if (!Capacitor.isNativePlatform()) {
        console.warn('⚠️ Health tracking only available on native platforms');
        return false;
      }

      // Request motion sensor permissions
      console.log('📱 Requesting motion sensor permissions...');
      const permissionGranted = await this.requestMotionPermission();
      
      if (!permissionGranted) {
        console.error('❌ Motion permission denied');
        return false;
      }
      
      console.log('✅ Motion permission granted');
      
      await this.loadHealthData();
      
      // Start step counting with verification
      const started = await this.startStepCounting();
      
      if (started) {
        console.log('✅ Native Health Service initialized successfully');
        console.log(`📊 Current step count: ${this.stepCount}`);
        return true;
      } else {
        console.error('❌ Failed to start step counting');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize health service:', error);
      return false;
    }
  }
  
  async requestMotionPermission() {
    try {
      // Check if Motion API is available
      if (!Motion) {
        console.error('❌ Motion plugin not available');
        return false;
      }
      
      // For Android, motion sensors don't require explicit permission request
      // They're automatically granted with ACTIVITY_RECOGNITION permission in manifest
      console.log('✅ Motion sensors available (automatic on Android)');
      this.motionPermissionGranted = true;
      return true;
    } catch (error) {
      console.error('❌ Error checking motion permission:', error);
      return false;
    }
  }

  async startStepCounting() {
    try {
      // Remove any existing listener
      if (this.accelerometerListener) {
        console.log('🔄 Removing existing listener...');
        await this.accelerometerListener.remove();
      }
      
      console.log('🎧 Adding accelerometer listener...');
      console.log('📱 Motion plugin available:', Motion ? 'YES' : 'NO');
      
      // Add listener for accelerometer events
      this.accelerometerListener = await Motion.addListener('accel', (event) => {
        this.totalEventsReceived++;
        this.lastAccelEvent = event;
        
        // Log first few events to verify data structure
        if (this.totalEventsReceived <= 3) {
          console.log(`📊 Event #${this.totalEventsReceived}:`, JSON.stringify(event, null, 2));
        }
        
        if (this.debugMode && this.totalEventsReceived % 50 === 0) {
          console.log(`📡 Received ${this.totalEventsReceived} accelerometer events`);
        }
        
        this.detectStep(event);
      });
      
      this.isListening = true;
      console.log('✅ Listener added successfully');
      
      // Verify we're receiving events
      setTimeout(() => {
        if (this.totalEventsReceived === 0) {
          console.error('❌ CRITICAL: No accelerometer events received after 5 seconds!');
          console.error('🔍 This means Motion.addListener is not working');
          console.error('💡 Possible causes:');
          console.error('   1. Motion permission not granted in AndroidManifest.xml');
          console.error('   2. Motion plugin not properly initialized');
          console.error('   3. Device sensor not available');
          console.log('🧪 Click "Test +100" button to verify UI updates work');
        } else {
          console.log(`✅ Sensor verification: ${this.totalEventsReceived} events received`);
          console.log('🎯 Accelerometer is working! Waiting for steps...');
        }
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start step counting:', error);
      console.error('Error details:', error.message);
      this.isListening = false;
      return false;
    }
  }

  detectStep(event) {
    // Capacitor Motion plugin uses different property names
    // Try multiple possible data structures
    const acceleration = event.accelerationIncludingGravity || event.acceleration || event;
    
    if (!acceleration || typeof acceleration.x === 'undefined') {
      if (this.totalEventsReceived === 1) {
        console.error('❌ Cannot find acceleration data in event:', event);
      }
      return;
    }
    
    const now = Date.now();
    
    // Debounce - minimum time between steps
    if (now - this.lastStepTime < this.minStepInterval) return;
    
    // Calculate total magnitude
    const magnitude = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );
    
    // Debug logging - log every potential step for diagnosis
    if (this.debugMode && magnitude > 8.0) {
      const timeSinceLastStep = now - this.lastStepTime;
      const hasMovement = Math.abs(acceleration.x) > 0.5 || Math.abs(acceleration.y) > 0.5 || Math.abs(acceleration.z) > 0.5;
      const aboveThreshold = magnitude > this.stepDetectionThreshold;
      const passesDebounce = timeSinceLastStep >= this.minStepInterval;
      const passesPattern = this.isValidStepPattern(now);
      
      console.log(`🔍 Potential step:`, {
        magnitude: magnitude.toFixed(2),
        threshold: this.stepDetectionThreshold,
        timeSince: timeSinceLastStep + 'ms',
        checks: {
          hasMovement: hasMovement ? '✅' : '❌',
          aboveThreshold: aboveThreshold ? '✅' : '❌',
          passesDebounce: passesDebounce ? '✅' : '❌',
          passesPattern: passesPattern ? '✅' : '❌'
        }
      });
    }
    
    // Store recent accelerations for peak detection
    this.recentAccelerations.push({ magnitude, timestamp: now });
    if (this.recentAccelerations.length > 3) {
      this.recentAccelerations.shift();
    }
    
    // SIMPLE PEAK DETECTION: Look for acceleration spikes
    // When walking, phone bounces creating peaks above baseline
    
    // Log EVERY reading to see what's happening
    if (this.totalEventsReceived % 20 === 0) {
      console.log(`📊 Accel reading #${this.totalEventsReceived}: mag=${magnitude.toFixed(2)}, X=${acceleration.x.toFixed(2)}, Y=${acceleration.y.toFixed(2)}, Z=${acceleration.z.toFixed(2)}`);
    }
    
    // Detect if this is a peak (higher than surrounding values)
    let isPeak = false;
    if (this.recentAccelerations.length >= 3) {
      const prev = this.recentAccelerations[0].magnitude;
      const current = this.recentAccelerations[1].magnitude;
      const latest = magnitude;
      
      // Peak detection: slightly more sensitive - lowered to 12.7
      // Peak difference reduced to 1.0 for better detection
      const peakDifference = Math.min(current - prev, current - latest);
      isPeak = (current > prev && current > latest && current > 12.7 && peakDifference > 1.0);
    }
    
    // Debounce: reduced to 525ms for slightly better sensitivity
    const sufficientTimePassed = (now - this.lastStepTime) >= 525;
    
    // Log potential steps
    if (isPeak && sufficientTimePassed) {
      console.log(`🏃 PEAK DETECTED! magnitude=${magnitude.toFixed(2)}, isPeak=${isPeak ? '✅' : '❌'}, debounce=${sufficientTimePassed ? '✅' : '❌'}`);
    }
    
    // Count step if peak detected with proper timing
    if (isPeak && sufficientTimePassed) {
      this.stepCount++;
      const interval = now - this.lastStepTime;
      this.lastStepTime = now;
      
      console.log(`✅✅✅ STEP #${this.stepCount}! Magnitude: ${magnitude.toFixed(2)}, Interval: ${interval}ms`);
      
      if (this.debugMode) {
        console.log(`📊 X:${acceleration.x.toFixed(2)} Y:${acceleration.y.toFixed(2)} Z:${acceleration.z.toFixed(2)}`);
      }
      
      // Track step cadence for pattern analysis
      this.stepCadence.push(now);
      if (this.stepCadence.length > 5) {
        this.stepCadence.shift();
      }
      
      this.updateHealthMetrics();
      
      if (this.stepCount % 10 === 0) {
        this.saveHealthData();
      }
      
      this.notifyStepUpdate();
    }
  }
  
  isValidStepPattern(currentTime) {
    // SIMPLIFIED: Just check if time interval is reasonable
    // Don't enforce strict pattern matching - let magnitude threshold do the filtering
    const currentInterval = currentTime - this.lastStepTime;
    
    // Only reject if impossibly fast or suspiciously slow
    if (currentInterval < 150 || currentInterval > 3000) {
      return false;
    }
    
    // Accept all other steps
    return true;
  }

  updateHealthMetrics() {
    this.healthData.distance = (this.stepCount * 0.762) / 1000;
    this.healthData.calories = Math.round(this.stepCount * 0.04);
    this.healthData.activeMinutes = Math.round(this.stepCount / 100);
    this.healthData.steps = this.stepCount;
  }

  getStepCount() {
    return this.stepCount;
  }

  getStepProgress() {
    return Math.min(this.stepCount / this.stepGoal, 1);
  }

  setStepGoal(goal) {
    this.stepGoal = goal;
    this.saveHealthData();
  }

  getHealthData() {
    return {
      ...this.healthData,
      stepGoal: this.stepGoal,
      stepProgress: this.getStepProgress(),
      goalReached: this.stepCount >= this.stepGoal
    };
  }

  getHealthSummary() {
    const summary = {
      steps: {
        current: this.stepCount,
        goal: this.stepGoal,
        progress: Math.round(this.getStepProgress() * 100),
        remaining: Math.max(0, this.stepGoal - this.stepCount)
      },
      calories: {
        burned: this.healthData.calories,
        unit: 'kcal'
      },
      distance: {
        traveled: this.healthData.distance.toFixed(2),
        unit: 'km'
      },
      activeTime: {
        minutes: this.healthData.activeMinutes,
        hours: (this.healthData.activeMinutes / 60).toFixed(1)
      }
    };
    
    console.log('📊 getHealthSummary returning:', summary.steps.current, 'steps');
    return summary;
  }

  addHealthData(type, value) {
    switch (type) {
      case 'heartRate':
        this.healthData.heartRate = value;
        break;
      case 'weight':
        this.healthData.weight = value;
        break;
      case 'sleep':
        this.healthData.sleep = value;
        break;
    }
    
    this.saveHealthData();
  }

  resetDailyStats() {
    const history = this.getHealthData();
    this.saveToHistory(history);
    
    this.stepCount = 0;
    this.healthData = {
      steps: 0,
      calories: 0,
      distance: 0,
      activeMinutes: 0,
      heartRate: this.healthData.heartRate,
      weight: this.healthData.weight,
      sleep: null
    };
    
    this.saveHealthData();
  }

  saveToHistory(data) {
    try {
      const history = JSON.parse(localStorage.getItem('health_history') || '[]');
      
      history.push({
        date: new Date().toISOString().split('T')[0],
        ...data
      });
      
      if (history.length > 30) {
        history.shift();
      }
      
      localStorage.setItem('health_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  getHistory(days = 7) {
    try {
      const history = JSON.parse(localStorage.getItem('health_history') || '[]');
      return history.slice(-days);
    } catch (error) {
      return [];
    }
  }

  async saveHealthData() {
    try {
      localStorage.setItem('health_data', JSON.stringify({
        stepCount: this.stepCount,
        stepGoal: this.stepGoal,
        healthData: this.healthData,
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save health data:', error);
    }
  }

  async loadHealthData() {
    try {
      const saved = localStorage.getItem('health_data');
      console.log('📥 Loading saved data:', saved);
      
      if (saved) {
        const data = JSON.parse(saved);
        const lastUpdate = new Date(data.lastUpdate);
        const today = new Date();
        
        console.log('📅 Last update:', lastUpdate.toDateString());
        console.log('📅 Today:', today.toDateString());
        
        if (lastUpdate.toDateString() === today.toDateString()) {
          this.stepCount = data.stepCount || 0;
          this.stepGoal = data.stepGoal || 10000;
          this.healthData = data.healthData || this.healthData;
          console.log('✅ Loaded today\'s data - Steps:', this.stepCount);
        } else {
          console.log('🔄 New day detected - resetting stats');
          this.resetDailyStats();
        }
      } else {
        console.log('ℹ️ No saved data found - starting fresh');
      }
      
      console.log('📊 Current stepCount after load:', this.stepCount);
    } catch (error) {
      console.error('Failed to load health data:', error);
    }
  }

  notifyStepUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('healthDataUpdate', {
        detail: this.getHealthData()
      }));
    }
    
    this.stepListeners.forEach(callback => callback(this.getHealthData()));
  }

  watchStepCount(callback) {
    this.stepListeners.push(callback);
    return () => {
      this.stepListeners = this.stepListeners.filter(cb => cb !== callback);
    };
  }

  stopStepCounting() {
    if (this.accelerometerListener) {
      this.accelerometerListener.remove();
      this.accelerometerListener = null;
    }
    
    this.saveHealthData();
  }

  getAchievements() {
    const achievements = [];
    
    if (this.stepCount >= this.stepGoal) {
      achievements.push({
        id: 'daily_goal',
        name: 'Daily Goal Reached!',
        icon: '🎯',
        unlocked: true
      });
    }
    
    if (this.stepCount >= 5000) {
      achievements.push({
        id: 'halfway',
        name: 'Halfway Hero',
        icon: '⭐',
        unlocked: true
      });
    }
    
    if (this.stepCount >= 15000) {
      achievements.push({
        id: 'overachiever',
        name: 'Overachiever',
        icon: '🔥',
        unlocked: true
      });
    }
    
    return achievements;
  }
  
  // Diagnostic methods
  getDiagnosticInfo() {
    return {
      isListening: this.isListening,
      permissionGranted: this.motionPermissionGranted,
      totalEventsReceived: this.totalEventsReceived,
      lastEventTime: this.lastAccelEvent ? new Date(this.lastAccelEvent.timestamp).toLocaleTimeString() : 'None',
      currentSteps: this.stepCount,
      recentAccelerations: this.recentAccelerations.length,
      listenerActive: this.accelerometerListener !== null,
      lastAccelData: this.lastAccelEvent ? {
        x: this.lastAccelEvent.accelerationIncludingGravity.x.toFixed(2),
        y: this.lastAccelEvent.accelerationIncludingGravity.y.toFixed(2),
        z: this.lastAccelEvent.accelerationIncludingGravity.z.toFixed(2)
      } : null
    };
  }
  
  printDiagnostics() {
    console.log('📊 === STEP COUNTER DIAGNOSTICS ===');
    const info = this.getDiagnosticInfo();
    console.log('Listener Active:', info.listenerActive ? '✅' : '❌');
    console.log('Is Listening:', info.isListening ? '✅' : '❌');
    console.log('Permission:', info.permissionGranted ? '✅' : '❌');
    console.log('Total Events Received:', info.totalEventsReceived);
    console.log('Last Event:', info.lastEventTime);
    console.log('Current Steps:', info.currentSteps);
    console.log('Last Acceleration:', info.lastAccelData);
    console.log('====================================');
    return info;
  }
  
  // Test method to manually add steps
  addTestSteps(count = 100) {
    console.log(`🧪 Adding ${count} test steps...`);
    this.stepCount += count;
    this.updateHealthMetrics();
    this.notifyStepUpdate();
    console.log(`✅ Test steps added. Total: ${this.stepCount}`);
  }
  
  // Reset for testing
  resetSteps() {
    console.log('🔄 Resetting step counter...');
    this.stepCount = 0;
    this.updateHealthMetrics();
    this.notifyStepUpdate();
    console.log('✅ Steps reset to 0');
  }
}

export const nativeHealthService = new NativeHealthService();
export default nativeHealthService;
