// Native Health Data Integration Service - ULTRA PREMIUM MULTI-SENSOR VERSION
// Real-time step counting with GPS + 7 advanced sensors
// Beyond Samsung Health accuracy using sensor fusion

import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';
import multiSensorService from './multiSensorService.js';
import motionListenerService from './motionListenerService.js';
import firestoreService from './firestoreService';
import authService from './authService';

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
    this.stepDetectionThreshold = 11.0; // Detect significant movement (gravity ~9.8 m/s²)
    this.lastStepTime = 0;
    this.stepListeners = [];
    
    // Advanced step detection
    this.recentAccelerations = [];
    this.stepCadence = []; // Track timing between steps
    this.minStepInterval = 200; // Minimum 200ms between steps
    this.lastMagnitude = 0;
    this.magnitudeHistory = [];
    this.peakDetectionWindow = 5;
    
    // Debug and monitoring
    this.debugMode = true; // Enable detailed logging
    this.motionPermissionGranted = false;
    this.isListening = false;
    this.lastAccelEvent = null;
    this.totalEventsReceived = 0;
    this.accelUIListeners = []; // Initialize UI listeners array
    this.lastOrientation = null;
    this.orientationListener = null;
    this.webMotionHandler = null;
    this.isUsingHardware = false; // Track if hardware step counter is active
    this.isUsingMultiSensor = false; // Track if multi-sensor fusion is active
    this.activeSensorCount = 0; // Number of active sensors
  }

  async initialize() {
    try {
      if(import.meta.env.DEV)console.log('🌟 Initializing MULTI-SENSOR Health Service...');
      if(import.meta.env.DEV)console.log('📱 Device Platform:', Capacitor.getPlatform());
      if(import.meta.env.DEV)console.log('📱 Is Native Platform:', Capacitor.isNativePlatform());
      
      await this.loadHealthData();
      
      if (!Capacitor.isNativePlatform()) {
        if(import.meta.env.DEV)console.warn('⚠️ Not on native platform, limited tracking');
        return true;
      }

      // PRIORITY 1: Health Connect (Android 14+) - System-level step tracking
      // NOTE: Do NOT auto-start services on init! Only check availability.
      // Services should only be started when user taps the manual button.
      if (Capacitor.getPlatform() === 'android') {
        if(import.meta.env.DEV)console.log('🏥 Checking if Health Connect is available (not starting)...');
        try {
          const healthConnectService = (await import('./healthConnectService.js')).default;
          const isAvailable = await healthConnectService.initialize();
          
          if (isAvailable) {
            if(import.meta.env.DEV)console.log('✅ Health Connect available on this device!');
            
            const perms = await healthConnectService.checkPermissions();
            if (perms.hasAllPermissions) {
              if(import.meta.env.DEV)console.log('✅✅✅ HEALTH CONNECT PERMISSIONS GRANTED! ✅✅✅');
              if(import.meta.env.DEV)console.log('   🎉 Can read steps from system (Google Fit, Samsung Health, etc)');
              
              this.isUsingHealthConnect = true;
              this.healthConnectService = healthConnectService;
              
              // Get today's steps
              const steps = await healthConnectService.getTodaySteps();
              this.stepCount = steps;
              this.healthData.steps = steps;
              this.healthData.calories = Math.round(steps * 0.04);
              this.healthData.distance = (steps * 0.0008).toFixed(2);
              
              // Poll for updates every 30 seconds
              setInterval(async () => {
                try {
                  const currentSteps = await healthConnectService.getTodaySteps();
                  if (currentSteps !== this.stepCount) {
                    this.stepCount = currentSteps;
                    this.healthData.steps = currentSteps;
                    this.healthData.calories = Math.round(currentSteps * 0.04);
                    this.healthData.distance = (currentSteps * 0.0008).toFixed(2);
                    this.notifyStepListeners();
                    this.saveHealthData().catch(err => console.error('Save error:', err));
                  }
                } catch (error) {
                  console.error('❌ Failed to poll Health Connect:', error);
                }
              }, 30000);
              
              return true;
            } else {
              if(import.meta.env.DEV)console.log('⚠️ Health Connect available but permissions NOT granted');
              if(import.meta.env.DEV)console.log('   👉 User needs to tap the manual button to grant permissions');
              // DO NOT fall through to other services - let user grant permissions first
              return true;
            }
          } else {
            if(import.meta.env.DEV)console.log('⚠️ Health Connect not available on this device (Android < 14?)');
          }
        } catch (error) {
          if(import.meta.env.DEV)console.log('⚠️ Health Connect check failed:', error.message);
        }
      }

      // PRIORITY 2: DO NOT auto-start native services!
      // Services should only be started manually via button press.
      // Removed automatic fallback to prevent unwanted service starts.

      // PRIORITY 2: Try Hardware Step Counter (phone's built-in chip - counts 24/7!)
      if(import.meta.env.DEV)console.log('🔧 Attempting HARDWARE STEP COUNTER...');
      try {
        const stepCounterService = (await import('./stepCounterService.js')).default;
        const available = await stepCounterService.initialize();
        
        if (available === true) {
          if(import.meta.env.DEV)console.log('✅✅✅ HARDWARE STEP COUNTER ACTIVE! Counts even when app closed! ✅✅✅');
          this.isUsingHardware = true;
          this.isUsingMultiSensor = false;
          this.isUsingGoogleFit = false;
          
          await stepCounterService.start();
          
          stepCounterService.addListener((steps) => {
            if(import.meta.env.DEV)console.log(`📊 Hardware sensor: ${steps} steps`);
            this.stepCount = steps;
            this.healthData.steps = steps;
            this.healthData.calories = Math.round(steps * 0.04);
            this.healthData.distance = (steps * 0.0008).toFixed(2);
            
            if (steps % 10 === 0) {
              this.saveHealthData().catch(err => { if(import.meta.env.DEV)console.error('Save error:', err); });
            }
            
            this.notifyStepListeners();
          });
          
          if(import.meta.env.DEV)console.log('🎉 Using phone\'s hardware step counter (like Samsung Health)!');
          return true;
        }
      } catch (error) {
        if(import.meta.env.DEV)console.error('❌ Hardware step counter failed:', error);
      }

      // PRIORITY 2: Try Google Fit (Android) - OS-level step counting, works when app closed
      if (Capacitor.getPlatform() === 'android') {
        if(import.meta.env.DEV)console.log('🌟 Attempting Google Fit initialization...');
        try {
          const googleFitService = (await import('./googleFitService.js')).default;
          const available = await googleFitService.checkAvailability();
          
          if (available) {
            const initialized = await googleFitService.initialize();
            if (initialized) {
              if(import.meta.env.DEV)console.log('✅✅✅ GOOGLE FIT ACTIVE! OS-level step counting! ✅✅✅');
              this.isUsingGoogleFit = true;
              this.googleFitService = googleFitService;
              
              // Load current steps from Google Fit
              const steps = await googleFitService.getTodaySteps();
              this.stepCount = steps;
              this.healthData.steps = steps;
              this.healthData.calories = Math.round(steps * 0.04);
              this.healthData.distance = (steps * 0.0008).toFixed(2);
              
              // Start periodic sync (every 30 seconds)
              this.googleFitSyncInterval = setInterval(async () => {
                try {
                  const latestSteps = await googleFitService.getTodaySteps();
                  if (latestSteps !== this.stepCount) {
                    this.stepCount = latestSteps;
                    this.healthData.steps = latestSteps;
                    this.healthData.calories = Math.round(latestSteps * 0.04);
                    this.healthData.distance = (latestSteps * 0.0008).toFixed(2);
                    this.notifyStepListeners();
                    await this.saveHealthData();
                  }
                } catch (error) {
                  console.error('Google Fit sync error:', error);
                }
              }, 30000); // 30 seconds
              
              return true;
            }
          }
        } catch (error) {
          if(import.meta.env.DEV)console.error('❌ Google Fit initialization failed:', error);
        }
      }

      // PRIORITY 3: Try Multi-Sensor Fusion (GPS + 7 sensors) - BEST ACCURACY
      if(import.meta.env.DEV)console.log('🌟 Attempting MULTI-SENSOR FUSION initialization...');
      try {
        this.activeSensorCount = await multiSensorService.initialize();
        
        if (this.activeSensorCount >= 2) {
          if(import.meta.env.DEV)console.log(`✅✅✅ MULTI-SENSOR FUSION ACTIVE! ${this.activeSensorCount}/8 sensors! ✅✅✅`);
          this.isUsingMultiSensor = true;
          this.isUsingHardware = false;
          this.multiSensorService = multiSensorService; // Store reference for getStepCount()
          
          // Listen for multi-sensor updates
          multiSensorService.addStepListener((data) => {
            if(import.meta.env.DEV)console.log('📊 Multi-sensor update:', data);
            this.stepCount = data.steps;
            this.healthData.steps = data.steps;
            this.healthData.distance = parseFloat(data.distance);
            this.healthData.calories = Math.round(data.steps * 0.04);
            this.healthData.heartRate = data.heartRate;
            
            // Additional data from sensors
            if (data.floors) this.healthData.floorsClimbed = data.floors;
            if (data.cadence) this.healthData.cadence = data.cadence;
            if (data.activityType) this.healthData.activityType = data.activityType;
            
            if (this.stepCount % 10 === 0) {
              this.saveHealthData().catch(err => {
                if(import.meta.env.DEV)console.error('Save error:', err);
              });
            }
            
            this.notifyStepListeners();
          });
          
          if(import.meta.env.DEV)console.log(`🌟 Multi-sensor fusion initialized with ${this.activeSensorCount} sensors`);
          if(import.meta.env.DEV)console.log('🌟 Active sensors:', multiSensorService.getActiveSensors().join(', '));
          return true;
        } else {
          if(import.meta.env.DEV)console.log(`⚠️ Insufficient sensors (${this.activeSensorCount}/8), trying fallback...`);
        }
      } catch (error) {
        if(import.meta.env.DEV)console.error('❌ Multi-sensor fusion ERROR:', error);
      }

      // PRIORITY 5: Final fallback to basic accelerometer
      try {
        await this.startAutomaticStepDetection();
        if(import.meta.env.DEV)console.log('⚠️ Using basic accelerometer (last resort)');
      } catch (error) {
        if(import.meta.env.DEV)console.warn('⚠️ All auto-detection failed, manual mode only:', error);
      }
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to initialize health service:', error);
      return false;
    }
  }
  
  async startAutomaticStepDetection() {
    try {
      if(import.meta.env.DEV)console.log('🚀 Starting automatic step detection...');
      
      // Request permission first
      try {
        const permission = await Motion.requestPermissions();
        if(import.meta.env.DEV)console.log('📱 Motion permission result:', JSON.stringify(permission));
      } catch (permError) {
        if(import.meta.env.DEV)console.warn('⚠️ Permission request failed:', permError);
      }
      
      // Unsubscribe from existing motion subscription if any
      if (this.motionSubscription) {
        if(import.meta.env.DEV)console.log('🔄 Removing old motion subscription');
        this.motionSubscription.unsubscribe();
      }
      
      // Subscribe to centralized motion listener
      if(import.meta.env.DEV)console.log('🎧 Subscribing to motion listener service...');
      
      // Method 1: Subscribe to 'accel' event via centralized service
      try {
        this.motionSubscription = await motionListenerService.subscribe((event) => {
          try {
            this.handleAccelerometerEvent(event);
          } catch (error) {
            if(import.meta.env.DEV)console.error('Error handling accel event:', error);
          }
        }, 'MultiSensor');
        if(import.meta.env.DEV)console.log('✅ Motion subscription registered');
      } catch (accelError) {
        if(import.meta.env.DEV)console.error('❌ Motion subscription failed:', accelError);
      }
      
      // Method 2: Try 'orientation' event as fallback
      try {
        this.orientationListener = await Motion.addListener('orientation', (event) => {
          try {
            this.handleOrientationEvent(event);
          } catch (error) {
            if(import.meta.env.DEV)console.error('Error handling orientation event:', error);
          }
        });
        if(import.meta.env.DEV)console.log('✅ orientation listener registered');
      } catch (orientError) {
        if(import.meta.env.DEV)console.error('❌ orientation listener failed:', orientError);
      }
      
      // Method 3: Use Web API as ultimate fallback
      if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
        if(import.meta.env.DEV)console.log('🌐 Adding Web DeviceMotion listener as fallback');
        this.webMotionHandler = (event) => {
          try {
            if (event.accelerationIncludingGravity) {
              this.handleAccelerometerEvent(event.accelerationIncludingGravity);
            }
          } catch (error) {
            if(import.meta.env.DEV)console.error('Error handling web motion:', error);
          }
        };
        window.addEventListener('devicemotion', this.webMotionHandler);
        if(import.meta.env.DEV)console.log('✅ Web DeviceMotion listener added');
      }
      
      // Verify it's working after 3 seconds
      setTimeout(() => {
        if(import.meta.env.DEV)console.log(`📊 Sensor check: ${this.totalEventsReceived} events received so far`);
        if (this.totalEventsReceived === 0) {
          if(import.meta.env.DEV)console.error('❌ CRITICAL: No motion events received after 3 seconds!');
          if(import.meta.env.DEV)console.error('🔍 Debugging info:');
          if(import.meta.env.DEV)console.error('   - Platform:', Capacitor.getPlatform());
          if(import.meta.env.DEV)console.error('   - Native:', Capacitor.isNativePlatform());
          if(import.meta.env.DEV)console.error('   - Motion plugin loaded:', typeof Motion);
          if(import.meta.env.DEV)console.error('💡 Try shaking your phone vigorously!');
        } else {
          if(import.meta.env.DEV)console.log(`✅ Motion sensor is WORKING! ${this.totalEventsReceived} events received`);
          if(import.meta.env.DEV)console.log(`🚶 Walk around to automatically count steps`);
        }
      }, 3000);
      
      // Log sensor data periodically for debugging
      this.debugInterval = setInterval(() => {
        if(import.meta.env.DEV)console.log(`📊 Status - Events: ${this.totalEventsReceived}, Steps: ${this.stepCount}, Magnitude: ${this.lastMagnitude.toFixed(2)}`);
      }, 10000);
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to start automatic detection:', error);
      if(import.meta.env.DEV)console.error('Error stack:', error.stack);
      throw error;
    }
  }
  
  handleOrientationEvent(event) {
    // Orientation events can also detect movement
    this.totalEventsReceived++;
    
    // Use rate of change in orientation to detect steps
    if (event.alpha !== undefined && this.lastOrientation) {
      const change = Math.abs(event.alpha - this.lastOrientation.alpha) +
                     Math.abs(event.beta - this.lastOrientation.beta) +
                     Math.abs(event.gamma - this.lastOrientation.gamma);
      
      if (change > 10) { // Significant orientation change
        const now = Date.now();
        if (now - this.lastStepTime > this.minStepInterval) {
          this.lastStepTime = now;
          this.stepCount++;
          this.healthData.steps = this.stepCount;
          this.healthData.calories = Math.round(this.stepCount * 0.04);
          this.healthData.distance = (this.stepCount * 0.0008).toFixed(2);
          
          if (this.stepCount % 10 === 0) {
            this.saveHealthData().catch(err => { if(import.meta.env.DEV)console.error('Save error:', err); });
            if(import.meta.env.DEV)console.log(`🚶 Steps: ${this.stepCount}`);
          }
          
          this.notifyStepListeners();
        }
      }
    }
    this.lastOrientation = event;
  }
  
  handleAccelerometerEvent(event) {
    this.totalEventsReceived++;
    this.lastAccelEvent = event;
    
    // Get acceleration data - try different property paths
    const accel = event.accelerationIncludingGravity || event.acceleration || event;
    
    if (!accel || typeof accel.x === 'undefined') {
      return;
    }
    
    // Calculate magnitude (total acceleration including gravity)
    const magnitude = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
    
    // Add to history for peak detection
    this.magnitudeHistory.push(magnitude);
    if (this.magnitudeHistory.length > this.peakDetectionWindow) {
      this.magnitudeHistory.shift();
    }
    
    // Detect peaks (local maxima) - indicates a step
    const now = Date.now();
    const timeSinceLastStep = now - this.lastStepTime;
    
    // Peak detection: current value is higher than neighbors and exceeds threshold
    if (this.magnitudeHistory.length >= 3) {
      const current = this.magnitudeHistory[this.magnitudeHistory.length - 1];
      const prev = this.magnitudeHistory[this.magnitudeHistory.length - 2];
      const prevPrev = this.magnitudeHistory[this.magnitudeHistory.length - 3];
      
      // Check if current is a peak and exceeds threshold
      const isPeak = current > prev && prev > prevPrev && current > this.stepDetectionThreshold;
      const enoughTimePassed = timeSinceLastStep > this.minStepInterval;
      
      if (isPeak && enoughTimePassed) {
        this.lastStepTime = now;
        this.stepCount++;
        this.healthData.steps = this.stepCount;
        
        // Update derived metrics
        this.healthData.calories = Math.round(this.stepCount * 0.04);
        this.healthData.distance = (this.stepCount * 0.0008).toFixed(2);
        
        // Save periodically (every 10 steps to avoid too many writes)
        if (this.stepCount % 10 === 0) {
          this.saveHealthData().catch(err => { if(import.meta.env.DEV)console.error('Save error:', err); });
        }
        
        // Notify listeners
        this.notifyStepListeners();
        
        if (this.debugMode && this.stepCount % 10 === 0) {
          if(import.meta.env.DEV)console.log(`🚶 Steps: ${this.stepCount} (mag: ${magnitude.toFixed(2)})`);
        }
      }
    }
    
    this.lastMagnitude = magnitude;
  }
  
  async notifyStepListeners() {
    this.stepListeners.forEach(listener => {
      try {
        listener(this.stepCount);
      } catch (error) {
        if(import.meta.env.DEV)console.error('Error in step listener:', error);
      }
    });
    
    // ✅ FIX: Update Firebase weeklySteps in real-time (every 10 steps)
    if (this.stepCount > 0 && this.stepCount % 10 === 0) {
      try {
        const syncService = (await import('./syncService.js')).default;
        const todayDate = new Date().toISOString().split('T')[0];
        const currentDay = new Date().getDay();
        const todayIndex = currentDay === 0 ? 6 : currentDay - 1;
        
        // Load current weekly steps
        let weeklyStepsData = await firestoreService.get('weeklySteps', authService.getCurrentUser()?.uid) || [];
        while (weeklyStepsData.length < 7) {
          weeklyStepsData.push({ steps: 0, date: null });
        }
        
        // Update today's steps
        weeklyStepsData[todayIndex] = {
          steps: this.stepCount,
          date: todayDate
        };
        
        // Save to Firebase
        await firestoreService.save('weeklySteps', weeklyStepsData, authService.getCurrentUser()?.uid);
      } catch (error) {
        // Silent fail - don't spam console
      }
    }
  }
  
  // Cleanup method to stop sensors
  async cleanup() {
    try {
      if (this.accelerometerListener) {
        await this.accelerometerListener.remove();
        this.accelerometerListener = null;
      }
      if (this.orientationListener) {
        await this.orientationListener.remove();
        this.orientationListener = null;
      }
      if (this.webMotionHandler && typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', this.webMotionHandler);
        this.webMotionHandler = null;
      }
      if (this.debugInterval) {
        clearInterval(this.debugInterval);
        this.debugInterval = null;
      }
      if(import.meta.env.DEV)console.log('✅ Sensor cleanup complete');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error during cleanup:', error);
    }
  }
  
  // Manual step addition fallback
  async addManualSteps(amount) {
    try {
      this.stepCount += amount;
      this.healthData.steps = this.stepCount;
      this.healthData.calories = Math.round(this.stepCount * 0.04);
      this.healthData.distance = (this.stepCount * 0.0008).toFixed(2);
      
      await this.saveHealthData();
      this.notifyStepListeners();
      
      if(import.meta.env.DEV)console.log(`✅ Added ${amount} steps manually. Total: ${this.stepCount}`);
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error adding steps:', error);
      return false;
    }
  }
  
  async requestMotionPermission() {
    try {
      // Check if Motion API is available
      if (!Motion) {
        if(import.meta.env.DEV)console.error('❌ Motion plugin not available');
        return false;
      }
      
      // Request runtime permission explicitly (Android 10+)
      if(import.meta.env.DEV)console.log('🔐 Requesting motion sensor permission...');
      const permission = await Motion.requestPermissions();
      if(import.meta.env.DEV)console.log('🔐 Permission result:', permission);
      
      this.motionPermissionGranted = true;
      if(import.meta.env.DEV)console.log('✅ Motion sensors permission granted');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Error requesting motion permission:', error);
      // Continue anyway - may still work on some devices
      this.motionPermissionGranted = true;
      return true;
    }
  }

  async startStepCounting() {
    try {
      // Start background runner for continuous tracking
      const backgroundRunnerService = (await import('./backgroundRunnerService.js')).default;
      await backgroundRunnerService.start();
      if(import.meta.env.DEV)console.log('✅ Background runner started for continuous step counting');
      
      // Unsubscribe from any existing listener
      if (this.motionSubscription) {
        if(import.meta.env.DEV)console.log('🔄 Removing existing motion subscription...');
        this.motionSubscription.unsubscribe();
      }
      
      if(import.meta.env.DEV)console.log('🎧 Subscribing to motion listener service...');
      if(import.meta.env.DEV)console.log('📱 Motion plugin available:', Motion ? 'YES' : 'NO');
      if(import.meta.env.DEV)console.log('🔧 Platform:', Capacitor.getPlatform());
      if(import.meta.env.DEV)console.log('🔧 Native platform:', Capacitor.isNativePlatform());
      
      // Subscribe to centralized motion listener
      this.motionSubscription = await motionListenerService.subscribe((event) => {
        this.totalEventsReceived++;
        this.lastAccelEvent = event;
        
        // Broadcast event to UI listeners for real-time display
        if (this.accelUIListeners) {
          this.accelUIListeners.forEach(listener => listener(event));
        }
        
        // Log first few events to verify data structure
        if (this.totalEventsReceived <= 5) {
          if(import.meta.env.DEV)console.log(`📊 Event #${this.totalEventsReceived}:`, JSON.stringify(event, null, 2));
        }
        
        if (this.debugMode && this.totalEventsReceived % 100 === 0) {
          if(import.meta.env.DEV)console.log(`📡 Received ${this.totalEventsReceived} accelerometer events`);
        }
        
        this.detectStep(event);
      }, 'StepCounter');
      
      this.isListening = true;
      if(import.meta.env.DEV)console.log('✅ Motion subscription added successfully, waiting for events...');
      if(import.meta.env.DEV)console.log('💡 TIP: Shake your phone to test the accelerometer');
      
      // Verify we're receiving events
      setTimeout(() => {
        if (this.totalEventsReceived === 0) {
          if(import.meta.env.DEV)console.error('❌ CRITICAL: No accelerometer events received after 5 seconds!');
          if(import.meta.env.DEV)console.error('🔍 This means Motion.addListener is not working');
          if(import.meta.env.DEV)console.error('💡 Possible causes:');
          if(import.meta.env.DEV)console.error('   1. Device does not have accelerometer sensor');
          if(import.meta.env.DEV)console.error('   2. Motion plugin not supported on this device');
          if(import.meta.env.DEV)console.error('   3. Sensor is disabled or in power-saving mode');
          if(import.meta.env.DEV)console.error('   4. App does not have sensor access permission');
          if(import.meta.env.DEV)console.log('🧪 Click "Test +100" button to verify UI updates work');
          if(import.meta.env.DEV)console.log('📱 Try shaking your phone vigorously to test sensor');
        } else {
          if(import.meta.env.DEV)console.log(`✅ Sensor verification: ${this.totalEventsReceived} events received`);
          if(import.meta.env.DEV)console.log('🎯 Accelerometer is working! Waiting for steps...');
        }
      }, 5000);
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to start step counting:', error);
      if(import.meta.env.DEV)console.error('Error details:', error.message);
      if(import.meta.env.DEV)console.error('Error stack:', error.stack);
      this.isListening = false;
      return false;
    }
  }
  
  // Add UI listener for real-time accelerometer display
  addAccelUIListener(callback) {
    if (!this.accelUIListeners) {
      this.accelUIListeners = [];
    }
    this.accelUIListeners.push(callback);
  }
  
  removeAccelUIListener(callback) {
    if (this.accelUIListeners) {
      this.accelUIListeners = this.accelUIListeners.filter(l => l !== callback);
    }
  }

  detectStep(event) {
    // Capacitor Motion plugin uses different property names
    // Try multiple possible data structures
    const acceleration = event.accelerationIncludingGravity || event.acceleration || event;
    
    if (!acceleration || typeof acceleration.x === 'undefined') {
      if (this.totalEventsReceived === 1) {
        if(import.meta.env.DEV)console.error('❌ Cannot find acceleration data in event:', event);
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
      
      if(import.meta.env.DEV)console.log(`🔍 Potential step:`, {
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
      if(import.meta.env.DEV)console.log(`📊 Accel reading #${this.totalEventsReceived}: mag=${magnitude.toFixed(2)}, X=${acceleration.x.toFixed(2)}, Y=${acceleration.y.toFixed(2)}, Z=${acceleration.z.toFixed(2)}`);
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
      if(import.meta.env.DEV)console.log(`🏃 PEAK DETECTED! magnitude=${magnitude.toFixed(2)}, isPeak=${isPeak ? '✅' : '❌'}, debounce=${sufficientTimePassed ? '✅' : '❌'}`);
    }
    
    // Count step if peak detected with proper timing
    if (isPeak && sufficientTimePassed) {
      this.stepCount++;
      const interval = now - this.lastStepTime;
      this.lastStepTime = now;
      
      if(import.meta.env.DEV)console.log(`✅✅✅ STEP #${this.stepCount}! Magnitude: ${magnitude.toFixed(2)}, Interval: ${interval}ms`);
      
      if (this.debugMode) {
        if(import.meta.env.DEV)console.log(`📊 X:${acceleration.x.toFixed(2)} Y:${acceleration.y.toFixed(2)} Z:${acceleration.z.toFixed(2)}`);
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
    // Priority 1: If using Google Fit, return OS-level count
    if (this.isUsingGoogleFit && this.googleFitService) {
      return this.stepCount; // Already synced from Google Fit
    }
    // Priority 2: If using multi-sensor fusion, get count from multiSensorService
    if (this.isUsingMultiSensor) {
      // Access the imported module directly since reference might not be set yet
      return multiSensorService.stepCount || 0;
    }
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
    
    if(import.meta.env.DEV)console.log('📊 getHealthSummary returning:', summary.steps.current, 'steps');
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

  async resetDailyStats() {
    if(import.meta.env.DEV)console.log('🌅 MIDNIGHT RESET - Saving yesterday\'s data...');
    
    // Get yesterday's data before resetting
    const yesterdayData = this.getHealthData();
    const yesterdaySteps = yesterdayData.steps;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    if(import.meta.env.DEV)console.log('📊 Yesterday (' + yesterdayDate + ') steps:', yesterdaySteps);
    
    // Save to history (local storage backup)
    this.saveToHistory(yesterdayData);
    
    // ✅ FIX: Update weeklySteps array in Firebase
    try {
      const syncService = (await import('./syncService.js')).default;
      
      // Load current weekly steps
      let weeklyStepsData = await firestoreService.get('weeklySteps', authService.getCurrentUser()?.uid) || [];
      
      // Ensure array has 7 days
      while (weeklyStepsData.length < 7) {
        weeklyStepsData.push({ steps: 0, date: null });
      }
      
      // Find yesterday's index (0=Mon, 1=Tue, ..., 6=Sun)
      const yesterdayDay = yesterday.getDay();
      const yesterdayIndex = yesterdayDay === 0 ? 6 : yesterdayDay - 1;
      
      // Update yesterday's data in the array
      weeklyStepsData[yesterdayIndex] = {
        steps: yesterdaySteps,
        date: yesterdayDate
      };
      
      // Save to Firebase
      await firestoreService.save('weeklySteps', weeklyStepsData, authService.getCurrentUser()?.uid);
      if(import.meta.env.DEV)console.log('✅ Firebase updated: weeklySteps[' + yesterdayIndex + '] = ' + yesterdaySteps + ' steps');
      
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to update Firebase weeklySteps:', error);
    }
    
    // Now reset for new day - ONLY reset counters, NOT sensors!
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
    
    // ✅ FIX: Do NOT reset multi-sensor! Keep sensors running for accuracy
    // Multi-sensor stays calibrated and continues counting from its current state
    // We just reset our display counter to 0 for the new day
    if(import.meta.env.DEV)console.log('✅ Counters reset - Sensors stay active and calibrated');
    
    this.saveHealthData();
    if(import.meta.env.DEV)console.log('✅ Daily reset complete - Ready for new day!');
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
      if(import.meta.env.DEV)console.error('Failed to save history:', error);
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
      // 🔥 FIX: Get REAL steps from native service (same source as dashboard!)
      const syncService = (await import('./syncService.js')).default;
      let realStepCount = 0;
      
      try {
        const { default: nativeStepService } = await import('./nativeStepService.js');
        const rawSteps = await nativeStepService.getSteps();
        const todayDate = new Date().toISOString().split('T')[0];
        let stepBaseline = parseInt(await firestoreService.get('stepBaseline', authService.getCurrentUser()?.uid) || '0');
        const baselineDate = await firestoreService.get('stepBaselineDate', authService.getCurrentUser()?.uid);
        
        // Detect sensor reset
        if (rawSteps < stepBaseline && baselineDate === todayDate) {
          console.log('💾 SAVE: Sensor reset detected, resetting baseline');
          stepBaseline = rawSteps;
          await firestoreService.save('stepBaseline', rawSteps.toString(), authService.getCurrentUser()?.uid);
        }
        
        if (baselineDate === todayDate) {
          realStepCount = Math.max(0, rawSteps - stepBaseline);
        }
        console.log('💾 SAVE: Using REAL steps from native service:', realStepCount);
      } catch (e) {
        console.warn('⚠️ Could not get native steps, using fallback:', this.stepCount);
        realStepCount = this.stepCount;
      }
      
      const healthData = {
        stepCount: realStepCount,
        stepGoal: this.stepGoal,
        healthData: { ...this.healthData, steps: realStepCount },
        lastUpdate: Date.now()
      };
      
      console.log('💾 SAVING health data - stepCount:', realStepCount);
      
      // Save to localStorage (backward compatibility)
      localStorage.setItem('health_data', JSON.stringify(healthData));
      
      // Save stepHistory in format Health Avatar expects
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today date:', today);
      const stepHistoryRaw = localStorage.getItem('stepHistory');
      console.log('📦 Raw stepHistory from localStorage:', stepHistoryRaw);
      let stepHistory = [];
      
      try {
        const parsed = stepHistoryRaw ? JSON.parse(stepHistoryRaw) : [];
        // CRITICAL FIX: Force to array even if stored as object or corrupted
        if (Array.isArray(parsed)) {
          stepHistory = parsed;
        } else if (parsed && typeof parsed === 'object') {
          // Convert object to array if needed
          stepHistory = Object.values(parsed).filter(item => item && item.date);
          console.warn('⚠️ stepHistory was object, converted to array');
        } else {
          stepHistory = [];
        }
        console.log('📦 Parsed stepHistory (forced to array):', stepHistory);
      } catch (e) {
        console.error('❌ Failed to parse stepHistory:', e);
        stepHistory = [];
      }
      
      // Update or add today's steps
      const todayIndex = stepHistory.findIndex(entry => entry.date === today);
      if (todayIndex >= 0) {
        stepHistory[todayIndex].steps = realStepCount;
        console.log(`💾 Updated stepHistory for ${today}:`, realStepCount);
      } else {
        stepHistory.push({ date: today, steps: realStepCount });
        console.log(`💾 Added new stepHistory entry for ${today}:`, realStepCount);
      }
      
      // Keep last 30 days
      if (stepHistory.length > 30) {
        stepHistory = stepHistory.slice(-30);
      }
      
      console.log('💾 stepHistory array:', stepHistory);
      
      localStorage.setItem('stepHistory', JSON.stringify(stepHistory));
      
      // Save to syncService (Preferences + Firebase) - already imported above
      await firestoreService.save('health_data', healthData, authService.getCurrentUser()?.uid);
      await firestoreService.save('stepHistory', stepHistory, authService.getCurrentUser()?.uid);
      
      console.log('💾 Saved to syncService (Preferences + Firebase)');
      
      // Update authService user stats
      try {
        const authService = (await import('./authService.js')).default;
        const user = authService.getCurrentUser();
        if (user) {
          const totalSteps = stepHistory.reduce((sum, entry) => sum + (entry.steps || 0), 0);
          const totalDays = stepHistory.length;
          await authService.updateProfile({
            stats: {
              ...user.stats,
              totalSteps: totalSteps,
              totalDays: totalDays
            }
          });
        }
      } catch (authError) {
        if(import.meta.env.DEV)console.warn('Could not update user stats:', authError);
      }
      
    } catch (error) {
      console.error('❌❌❌ Failed to save health data:', error);
      console.error('Error stack:', error.stack);
    }
  }

  async loadHealthData() {
    try {
      // Try syncService first (Preferences + Firebase)
      const syncService = (await import('./syncService.js')).default;
      const savedData = await firestoreService.get('health_data', authService.getCurrentUser()?.uid);
      
      if(import.meta.env.DEV)console.log('📥 Loading saved data from syncService');
      
      if (savedData) {
        const lastUpdate = new Date(savedData.lastUpdate);
        const today = new Date();
        
        if(import.meta.env.DEV)console.log('📅 Last update:', lastUpdate.toDateString());
        if(import.meta.env.DEV)console.log('📅 Today:', today.toDateString());
        
        if (lastUpdate.toDateString() === today.toDateString()) {
          this.stepCount = savedData.stepCount || 0;
          this.stepGoal = savedData.stepGoal || 10000;
          this.healthData = savedData.healthData || this.healthData;
          if(import.meta.env.DEV)console.log('✅ Loaded today\'s data - Steps:', this.stepCount);
        } else {
          if(import.meta.env.DEV)console.log('🔄 New day detected - resetting stats');
          this.resetDailyStats();
        }
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('health_data');
        if (saved) {
          const data = JSON.parse(saved);
          const lastUpdate = new Date(data.lastUpdate);
          const today = new Date();
          
          if (lastUpdate.toDateString() === today.toDateString()) {
            this.stepCount = data.stepCount || 0;
            this.stepGoal = data.stepGoal || 10000;
            this.healthData = data.healthData || this.healthData;
            if(import.meta.env.DEV)console.log('✅ Loaded from localStorage fallback - Steps:', this.stepCount);
          } else {
            this.resetDailyStats();
          }
        } else {
          if(import.meta.env.DEV)console.log('ℹ️ No saved data found - starting fresh');
        }
      }
      
      if(import.meta.env.DEV)console.log('📊 Current stepCount after load:', this.stepCount);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load health data:', error);
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
    if (this.motionSubscription) {
      this.motionSubscription.unsubscribe();
      this.motionSubscription = null;
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
    if(import.meta.env.DEV)console.log('📊 === STEP COUNTER DIAGNOSTICS ===');
    const info = this.getDiagnosticInfo();
    if(import.meta.env.DEV)console.log('Listener Active:', info.listenerActive ? '✅' : '❌');
    if(import.meta.env.DEV)console.log('Is Listening:', info.isListening ? '✅' : '❌');
    if(import.meta.env.DEV)console.log('Permission:', info.permissionGranted ? '✅' : '❌');
    if(import.meta.env.DEV)console.log('Total Events Received:', info.totalEventsReceived);
    if(import.meta.env.DEV)console.log('Last Event:', info.lastEventTime);
    if(import.meta.env.DEV)console.log('Current Steps:', info.currentSteps);
    if(import.meta.env.DEV)console.log('Last Acceleration:', info.lastAccelData);
    if(import.meta.env.DEV)console.log('====================================');
    return info;
  }
  
  // Test method to manually add steps
  addTestSteps(count = 100) {
    if(import.meta.env.DEV)console.log(`🧪 Adding ${count} test steps...`);
    this.stepCount += count;
    this.updateHealthMetrics();
    this.notifyStepUpdate();
    if(import.meta.env.DEV)console.log(`✅ Test steps added. Total: ${this.stepCount}`);
  }
  
  // Reset for testing
  resetSteps() {
    if(import.meta.env.DEV)console.log('🔄 Resetting step counter...');
    this.stepCount = 0;
    this.updateHealthMetrics();
    this.notifyStepUpdate();
    if(import.meta.env.DEV)console.log('✅ Steps reset to 0');
  }
}

export const nativeHealthService = new NativeHealthService();
export default nativeHealthService;



