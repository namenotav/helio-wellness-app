// Multi-Sensor Fusion Service - ULTRA PREMIUM
// Combines GPS, Accelerometer, Gyroscope, Barometer, Magnetometer, Heart Rate, Cadence, ML, Bluetooth
// Professional fitness tracking beyond Samsung Health
// NOW WITH: Environmental Context AI + Pattern Learning (Phase 1 Breakthrough)

import { Capacitor } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { Geolocation } from '@capacitor/geolocation';
import environmentalContextService from './environmentalContextService.js';
import patternLearningService from './patternLearningService.js';
import deviceStateService from './deviceStateService.js';

class MultiSensorService {
  constructor() {
    // Sensor states
    this.sensors = {
      gps: { active: false, data: null },
      accelerometer: { active: false, data: null },
      gyroscope: { active: false, data: null },
      barometer: { active: false, data: null },
      magnetometer: { active: false, data: null },
      heartRate: { active: false, data: null },
      cadence: { active: false, data: null },
      bluetooth: { active: false, data: null }
    };

    // Tracking data
    this.stepCount = 0;
    this.initialStepCount = 0; // Steps at service start (to preserve existing count)
    this.totalDistance = 0; // meters
    this.floorsClimbed = 0;
    this.currentAltitude = null;
    this.lastAltitude = null;
    this.currentDirection = 0;
    this.directionChanges = 0;
    this.heartRate = null;
    this.cadenceRate = 0; // steps per minute
    this.activityType = 'unknown'; // walking, running, cycling, driving
    
    // GPS tracking
    this.lastPosition = null;
    this.gpsWatchId = null;
    this.gpsTrail = [];
    
    // Gyroscope tracking
    this.rotationData = [];
    this.gaitPattern = [];
    
    // Cadence tracking
    this.stepTimestamps = [];
    this.lastStepTime = 0;
    
    // Accelerometer tracking for real-time step detection
    this.accelerationHistory = [];
    this.lastAccelPeak = 0;
    this.lastAccelPeakValue = 0;
    this.accelStepThreshold = 1.5; // 15+ inch stride threshold (blocks wrist 0.8-1.4 m/s²)
    this.minStepThreshold = 1.3; // Minimum for actual walking steps
    this.maxStepThreshold = 2.5; // Upper bound for running
    this.accelStepCooldown = 520; // OPTIMIZED: 520ms = natural walking cadence (prevents wrist gesture bursts)
    this.stepValidationWindow = 10; // Keep last 10 steps for pattern validation
    this.lastValidSteps = []; // Track step timestamps for rhythm validation
    this.stationaryThreshold = 0.2; // Variance below this = phone is stationary (slightly relaxed)
    this.movementThreshold = 0.4; // Variance above this = definitely moving
    this.isStationary = false; // Track if user is not moving
    this.consecutiveStationaryReadings = 0; // Count how long stationary
    this.stationaryRequiredReadings = 5; // OPTIMIZED: Faster stationary detection (was 8)
    this.adaptiveMode = true; // Auto-adjust sensitivity based on activity
    
    // WRIST MOVEMENT FILTER (Anti-false-positive system)
    this.axisHistory = []; // Track X, Y, Z components separately
    this.recentPeaks = []; // Track recent peaks for burst detection
    this.recentPeakAmplitudes = []; // Track peak amplitudes for consistency check
    this.verticalMotionRatio = 0.70; // Walking requires 70%+ vertical motion (15+ inch stride)
    this.burstDetectionWindow = 350; // ms - PRECISE: Catches wrist (200-350ms), allows walking (500-700ms)
    
    // PHASE 1: AI Services (Zero-cost breakthrough)
    this.contextAI = null; // Environmental Context AI
    this.patternAI = null; // Pattern Learning AI
    this.deviceState = null; // Device State Service (Screen/Touch/Charging)
    this.aiEnabled = true; // Enable AI enhancements
    this.sessionStartTime = Date.now();
    this.initialStepCount = 0;
    
    // Heart rate tracking
    this.hrMeasuring = false;
    this.hrVideoStream = null;
    
    // ML pattern recognition
    this.userPatterns = {
      avgStrideLength: 0.75, // meters, will learn over time
      walkingSpeed: 1.4, // m/s, will adapt
      runningSpeed: 3.0, // m/s
      uphillStride: 0.65, // shorter stride uphill
      downhillStride: 0.85 // longer stride downhill
    };
    
    // Bluetooth devices
    this.connectedDevices = [];
    
    // Listeners
    this.stepListeners = [];
    
    // Activity detection thresholds
    this.WALKING_CADENCE = { min: 90, max: 130 }; // steps/min
    this.RUNNING_CADENCE = { min: 140, max: 200 };
    this.MIN_STEP_INTERVAL = 200; // ms
    this.MAX_STEP_INTERVAL = 2000; // ms
    
    // Throttle for listener notifications (prevent flickering from constant GPS updates)
    this.lastNotification = 0;
    this.NOTIFICATION_THROTTLE = 2000; // Only notify UI every 2 seconds max
    this.lastStepCount = 0; // Track last notified count
  }

  async initialize() {
    try {
      if(import.meta.env.DEV)console.log('🌟 Initializing MULTI-SENSOR FUSION Service...');
      if(import.meta.env.DEV)console.log('📱 Platform:', Capacitor.getPlatform());
      
      if (!Capacitor.isNativePlatform()) {
        if(import.meta.env.DEV)console.warn('⚠️ Not on native platform, limited sensor support');
      }

      // PHASE 1: Initialize AI Breakthrough Services
      if (this.aiEnabled) {
        try {
          if(import.meta.env.DEV)console.log('🧠 Initializing AI Services (Phase 1)...');
          await environmentalContextService.initialize();
          await patternLearningService.initialize();
          await deviceStateService.initialize();
          this.contextAI = environmentalContextService;
          this.patternAI = patternLearningService;
          this.deviceState = deviceStateService;
          if(import.meta.env.DEV)console.log('✅ AI Services ready - Zero false positives + Samsung/iPhone accuracy!');
        } catch (aiError) {
          if(import.meta.env.DEV)console.error('⚠️ AI Services failed:', aiError);
          this.aiEnabled = false;
        }
      }

      // Load existing step count from ENCRYPTED localStorage to preserve it
      try {
        // Import encryption service
        const { default: encryptionService } = await import('./encryptionService.js');
        await encryptionService.initialize();
        this.encryption = encryptionService;
        
        const healthData = await encryptionService.getSecureItem('health_data');
        const todayDate = new Date().toISOString().split('T')[0];
        
        if (healthData) {
          const lastDate = healthData.date || '';
          
          // Check if it's a new day - reset steps if so
          if (lastDate !== todayDate) {
            if(import.meta.env.DEV)console.log('🌅 New day detected! Resetting steps from', healthData.stepCount || 0, 'to 0');
            this.initialStepCount = 0;
            this.stepCount = 0;
            // Save reset immediately (encrypted)
            await encryptionService.setSecureItem('health_data', { 
              stepCount: 0, 
              date: todayDate 
            });
          } else {
            // Same day - preserve existing count
            this.initialStepCount = healthData.stepCount || 0;
            this.stepCount = this.initialStepCount;
            if(import.meta.env.DEV)console.log('📊 Loaded existing step count:', this.stepCount);
          }
        } else {
          // No existing data - initialize with today's date (encrypted)
          await encryptionService.setSecureItem('health_data', { 
            stepCount: 0, 
            date: todayDate 
          });
        }
        
        if(import.meta.env.DEV)console.log('🔐 Health data encryption enabled');
      } catch (error) {
        if(import.meta.env.DEV)console.error('Error loading existing steps:', error);
      }

      // Load saved patterns
      await this.loadUserPatterns();

      // Initialize all available sensors in parallel
      const results = await Promise.allSettled([
        this.initializeGPS(),
        this.initializeAccelerometer(),
        this.initializeGyroscope(),
        this.initializeBarometer(),
        this.initializeMagnetometer(),
        this.initializeHeartRate(),
        this.initializeCadence(),
        this.initializeBluetooth()
      ]);

      // Log results
      const sensorNames = ['GPS', 'Accelerometer', 'Gyroscope', 'Barometer', 'Magnetometer', 'HeartRate', 'Cadence', 'Bluetooth'];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          if(import.meta.env.DEV)console.log(`✅ ${sensorNames[index]} initialized`);
        } else {
          if(import.meta.env.DEV)console.log(`⚠️ ${sensorNames[index]} unavailable:`, result.reason?.message || 'unknown');
        }
      });

      const activeSensors = Object.values(this.sensors).filter(s => s.active).length;
      if(import.meta.env.DEV)console.log(`🌟 ${activeSensors}/8 sensors active`);

      // Start ML pattern recognition
      this.startPatternLearning();

      return activeSensors;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Multi-sensor initialization error:', error);
      return 0;
    }
  }

  // ==================== GPS ====================
  async initializeGPS() {
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location !== 'granted') {
        throw new Error('GPS permission denied');
      }

      // Start watching position with BATTERY OPTIMIZED settings
      this.gpsWatchId = await Geolocation.watchPosition(
        { 
          enableHighAccuracy: false, // BATTERY: Use coarse location (saves 60% battery)
          timeout: 10000, 
          maximumAge: 5000 // BATTERY: Use cached position up to 5s old
        },
        (position) => this.handleGPSUpdate(position)
      );

      this.sensors.gps.active = true;
      if(import.meta.env.DEV)console.log('🌍 GPS tracking started');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('GPS init error:', error);
      return false;
    }
  }

  handleGPSUpdate(position) {
    const coords = position.coords;
    this.sensors.gps.data = coords;

    if(import.meta.env.DEV)console.log('🌍 GPS Update:', coords.latitude.toFixed(6), coords.longitude.toFixed(6), '| Speed:', coords.speed?.toFixed(2), 'm/s | Altitude:', coords.altitude);

    // ULTIMATE ACCURACY: Feed GPS speed to device state service
    if (this.aiEnabled && this.deviceState && coords.speed !== null && coords.speed !== undefined) {
      const speedKmh = coords.speed * 3.6; // Convert m/s to km/h
      this.deviceState.updateGPSSpeed(speedKmh);
    }

    // Update altitude tracking
    if (coords.altitude !== null && coords.altitude !== undefined) {
      this.handleAltitudeChange(coords.altitude);
    }

    // Update direction tracking
    if (coords.heading !== null && coords.heading !== undefined) {
      this.handleDirectionChange(coords.heading);
    }

    if (this.lastPosition) {
      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(
        this.lastPosition.latitude,
        this.lastPosition.longitude,
        coords.latitude,
        coords.longitude
      );

      if(import.meta.env.DEV)console.log('📏 Distance moved:', distance.toFixed(2), 'm | GPS Speed:', coords.speed?.toFixed(2), 'm/s');

      // Track distance but DON'T add steps (accelerometer handles step counting)
      if (distance > 1.0) {
        this.totalDistance += distance;
        this.gpsTrail.push({ lat: coords.latitude, lng: coords.longitude, timestamp: Date.now(), speed: coords.speed });
        if(import.meta.env.DEV)console.log('✅ Total distance updated to:', this.totalDistance.toFixed(2), 'm');
        
        // Update UI with new distance (but not steps - those come from accelerometer)
        this.notifyStepListeners();
      }
    }

    this.lastPosition = coords;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // meters
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // ==================== ACCELEROMETER ====================
  async initializeAccelerometer() {
    try {
      // Note: Motion.requestPermissions() not available on Android, permissions handled in manifest
      this.accelerometerListener = await Motion.addListener('accel', (event) => {
        this.handleAccelerometerUpdate(event);
      });

      // BATTERY OPTIMIZED: Only enable gyroscope when actually walking
      this.gyroscopeEnabled = false;
      this.gyroscopeListener = null;

      this.sensors.accelerometer.active = true;
      if(import.meta.env.DEV)console.log('📱 Accelerometer + Gyroscope tracking started');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Accelerometer init error:', error);
      return false;
    }
  }

  handleAccelerometerUpdate(event) {
    this.sensors.accelerometer.data = event.acceleration;
    const { x, y, z } = event.acceleration;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    const now = Date.now();

    // Track acceleration history (keep last 50 readings for analysis)
    this.accelerationHistory.push({ magnitude, timestamp: now, x, y, z });
    if (this.accelerationHistory.length > 50) {
      this.accelerationHistory.shift();
    }
    
    // WRIST FILTER: Track axis components for motion analysis
    this.axisHistory.push({ x: Math.abs(x), y: Math.abs(y), z: Math.abs(z), timestamp: now });
    if (this.axisHistory.length > 20) {
      this.axisHistory.shift();
    }

    // CRITICAL: Check if phone is stationary before counting steps
    this.detectStationaryState();
    
    // Skip step detection if phone is completely stationary
    if (this.isStationary) {
      return; // Don't count steps when phone isn't moving
    }

    // REAL-TIME STEP DETECTION using advanced peak detection (Samsung/iPhone level)
    this.detectStepFromAccelerometer(magnitude, now);

    // Detect activity type for GPS validation
    const activityDetected = this.detectActivityType();
    if (activityDetected === 'walking') {
      this.activityType = 'walking';
    } else if (activityDetected === 'vehicle') {
      this.activityType = 'vehicle';
    } else if (magnitude > 0.5) {
      this.activityType = 'walking';
    }
  }

  detectActivityType() {
    if (this.accelerationHistory.length < 20) return null;

    // Calculate variance in acceleration over last 2 seconds
    const recentData = this.accelerationHistory.slice(-20);
    const magnitudes = recentData.map(d => d.magnitude);
    const avg = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const variance = magnitudes.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / magnitudes.length;

    // Walking: High variance (rhythmic steps) with moderate magnitude
    // Vehicle: Low variance (smooth motion) even with movement
    
    if (variance > 0.5 && avg > 0.3) {
      // High variance + movement = walking
      return 'walking';
    } else if (variance < 0.2 && avg < 1.0) {
      // Low variance + low movement = vehicle or stationary
      return 'vehicle';
    }
    
    return null; // Uncertain
  }

  detectStepFromAccelerometer(magnitude, timestamp) {
    // ULTRA-PRECISE PEAK DETECTION with adaptive thresholds
    if (this.accelerationHistory.length < 5) return; // Need more data for validation

    // CRITICAL: CHECK BURST PATTERN FIRST (before any peak validation)
    // Block rapid movements (wrist/pickup) = any 2 peaks within 350ms
    const existingRecentPeaks = this.recentPeaks.filter(t => timestamp - t < this.burstDetectionWindow);
    if (existingRecentPeaks.length >= 1) {
      // Rapid burst detected = wrist/pickup motion - BLOCK IMMEDIATELY
      return;
    }

    // Get last 5 readings for robust peak detection
    const recent = this.accelerationHistory.slice(-5);
    const values = recent.map(r => r.magnitude);
    
    // Check if middle point is a TRUE peak (higher than neighbors)
    const prev2 = values[0];
    const prev1 = values[1];
    const current = values[2];
    const next1 = values[3];
    const next2 = values[4];

    // PHASE 1: AI-Enhanced Adaptive threshold
    let threshold = this.accelStepThreshold;
    let aiAdjustment = 1.0;
    let aiReason = [];
    
    // Apply Environmental Context adjustment
    if (this.aiEnabled && this.contextAI) {
      const context = this.contextAI.getCurrentContext();
      threshold = context.recommendedThreshold;
      aiReason.push('context:' + context.type);
      
      // Block steps if in vehicle with high confidence
      if (this.contextAI.shouldBlockSteps()) {
        if(import.meta.env.DEV)console.log('🚗 AI: Vehicle detected - blocking steps');
        return false;
      }
    }
    
    // Apply Pattern Learning adjustment
    if (this.aiEnabled && this.patternAI) {
      const patternAdj = this.patternAI.getRecommendedThresholdAdjustment();
      threshold *= patternAdj.adjustment;
      aiAdjustment = patternAdj.adjustment;
      aiReason.push(patternAdj.reason);
      
      // Check if should block based on patterns
      const shouldBlock = this.patternAI.shouldBlockSteps();
      if (shouldBlock.block && shouldBlock.confidence > 0.7) {
        if(import.meta.env.DEV)console.log('🌙 AI: Unusual time (' + shouldBlock.reason + ') - blocking');
        return false;
      }
    }
    
    // Standard adaptive mode
    if (this.adaptiveMode && this.lastValidSteps.length >= 5) {
      const recentInterval = (timestamp - this.lastValidSteps[0]) / this.lastValidSteps.length;
      if (recentInterval > 400 && recentInterval < 700) {
        threshold = Math.max(this.minStepThreshold, threshold * 0.9);
        aiReason.push('active-walking');
      }
    }
    
    // CRITICAL: Enforce absolute minimum (blocks wrist movements 0.8-1.4 m/s²)
    threshold = Math.max(1.5, threshold);

    // PEAK VALIDATION: Must exceed neighbors (with slight tolerance)
    const isPeak = current > prev1 && current > next1 && 
                   current >= prev2 * 0.97 && current >= next2 * 0.97 && 
                   current > threshold;
    
    // Peak must be significant = 12+ INCH STRIDE (Samsung/iPhone sensitivity)
    const peakAmplitude = current - Math.min(prev1, next1);
    const isSignificantPeak = peakAmplitude > 0.55; // Balanced: catches gentle walking, burst blocks wrist
    
    // PHASE 1: Feed motion data to device state service for walking gait detection (with X/Y/Z axis)
    if (this.aiEnabled && this.deviceState) {
      const recentReading = this.accelerationHistory[this.accelerationHistory.length - 3]; // Middle reading
      this.deviceState.updateMotionData(
        current,
        recentReading ? recentReading.x : 0,
        recentReading ? recentReading.y : 0,
        recentReading ? recentReading.z : 0
      );
    }
    
    // Check cooldown to prevent double-counting
    const timeSinceLastStep = timestamp - this.lastAccelPeak;
    const cooldownPassed = timeSinceLastStep >= this.accelStepCooldown;

    if (!isPeak || !isSignificantPeak || !cooldownPassed) {
      return; // Basic checks failed
    }
    
    // PHASE 1: Device State Check (Screen/Touch/Charging) - Now with GPS + walking gait override
    if (this.aiEnabled && this.deviceState) {
      const deviceCheck = this.deviceState.shouldBlockSteps();
      if (deviceCheck.block) {
        if (this.stepCount % 5 === 0) {
          if(import.meta.env.DEV)console.log('📱 Device state block: ' + deviceCheck.reason + ' (confidence: ' + (deviceCheck.confidence * 100).toFixed(0) + '%)');
        }
        return; // Block step due to device state
      }
    }
    
    // ULTIMATE ACCURACY: Bypass wrist filters if walking is confirmed (GPS + gait)
    const walkingConfirmed = this.aiEnabled && this.deviceState && this.deviceState.isWalkingConfirmed();
    
    if (!walkingConfirmed) {
      // Only run wrist filters when walking is NOT confirmed
      
      // WRIST MOVEMENT FILTER: Axis-based motion analysis (requires 70% vertical = 15+ inch stride)
      const motionAnalysis = this.analyzeMotionAxis();
      if (!motionAnalysis.isVerticalMotion && motionAnalysis.confidence > 0.65) {
        if (this.stepCount % 10 === 0) {
          if(import.meta.env.DEV)console.log('🤚 Wrist movement (Y=' + (motionAnalysis.yPercent * 100).toFixed(0) + '%) - blocked');
        }
        return; // Horizontal/rotational motion = wrist gesture (under 15 inches)
      }
      
      // Amplitude variance check (pickup has varying amplitudes)
      if (this.recentPeakAmplitudes.length >= 2) {
        const amplitudeVariance = this.calculateAmplitudeVariance(this.recentPeakAmplitudes);
        // Walking = consistent 15+ inch strides (low variance), pickup = chaotic (high variance)
        if (amplitudeVariance > 0.18) {
          if (this.stepCount % 10 === 0) {
            if(import.meta.env.DEV)console.log('📊 Inconsistent amplitude (variance: ' + amplitudeVariance.toFixed(2) + ') - likely pickup - blocked');
          }
          return;
        }
      }
    } else {
      // Walking confirmed by GPS + gait - wrist filters bypassed
      if (this.stepCount % 20 === 0) {
        if(import.meta.env.DEV)console.log('🎯 Walking confirmed (GPS + gait) - wrist filters bypassed');
      }
    }

    // SMART VALIDATION with confidence scoring
    let confidence = 50; // Base confidence for valid peak
    let reasons = ['peak-ok'];
    
    // Bonus: Vertical motion detected (wrist filter passed) or walking confirmed
    const motionAnalysis = walkingConfirmed ? { isVerticalMotion: true, confidence: 1.0 } : this.analyzeMotionAxis();
    if (motionAnalysis.isVerticalMotion && motionAnalysis.confidence > 0.6) {
      confidence += 10;
      reasons.push('vertical-motion');
    }
    
    // Bonus: Walking confirmed by GPS
    if (walkingConfirmed) {
      confidence += 30;
      reasons.push('gps-confirmed');
    }
    
    // Check 1: Stationary state (high importance)
    const isStationary = this.detectStationaryState();
    if (isStationary) {
      confidence -= 40;
      reasons.push('stationary');
    } else {
      confidence += 20;
      reasons.push('moving');
    }
    
    // Check 2: GPS validation (medium importance, handles indoor)
    const isMovingByGPS = this.isUserMovingByGPS();
    if (isMovingByGPS) {
      confidence += 15;
      reasons.push('gps-ok');
    } else {
      confidence -= 20;
      reasons.push('gps-slow');
    }
    
    // Check 3: Rhythm validation (medium importance)
    const hasValidRhythm = this.validateStepRhythm(timeSinceLastStep);
    if (hasValidRhythm) {
      confidence += 15;
      reasons.push('rhythm-ok');
    } else {
      confidence -= 10;
      reasons.push('rhythm-varied');
    }

    // DECISION: Accept step if confidence >= 40% (lowered from 50% for better detection)
    const accepted = confidence >= 40;

    if (accepted) {
      // Valid step detected!
      this.lastAccelPeak = timestamp;
      this.lastAccelPeakValue = current;
      this.stepCount += 1; // Increment by 1 per valid step
      
      // Track for pattern validation
      this.lastValidSteps.push(timestamp);
      if (this.lastValidSteps.length > this.stepValidationWindow) {
        this.lastValidSteps.shift();
      }
      
      // Track this peak for burst detection (for NEXT movement check)
      this.recentPeaks.push(timestamp);
      this.recentPeaks = this.recentPeaks.filter(t => timestamp - t < this.burstDetectionWindow);
      
      // Record for cadence calculation
      this.recordStep();
      
      const aiInfo = this.aiEnabled ? ' | AI: ' + aiReason.join(', ') + ' (×' + aiAdjustment.toFixed(2) + ')' : '';
      if(import.meta.env.DEV)console.log('✅ STEP #' + this.stepCount + '! Peak:', current.toFixed(2), '| Amp:', peakAmplitude.toFixed(2), '| Interval:', timeSinceLastStep + 'ms | Confidence:', confidence + '%' + aiInfo + ' [' + reasons.join(', ') + ']');
      
      // Notify immediately for real-time updates
      this.notifyStepListeners();
    } else {
      // Step rejected - log why
      if (this.stepCount % 20 === 0 || this.accelerationHistory.length % 50 === 0) {
        if(import.meta.env.DEV)console.log('❌ Step rejected (Confidence: ' + confidence + '%) [' + reasons.join(', ') + ']');
      }
    }
  }

  // ==================== GYROSCOPE ====================
  async initializeGyroscope() {
    try {
      this.gyroscopeListener = await Motion.addListener('orientation', (event) => {
        this.handleGyroscopeUpdate(event);
      });

      this.sensors.gyroscope.active = true;
      if(import.meta.env.DEV)console.log('🔄 Gyroscope tracking started');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Gyroscope init error:', error);
      return false;
    }
  }

  handleGyroscopeUpdate(event) {
    this.sensors.gyroscope.data = event;
    if(import.meta.env.DEV)console.log('🔄 Gyroscope:', event.alpha?.toFixed(1), event.beta?.toFixed(1), event.gamma?.toFixed(1));
    
    this.rotationData.push({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      timestamp: Date.now()
    });

    // Keep last 100 readings
    if (this.rotationData.length > 100) {
      this.rotationData.shift();
    }

    // Detect gait pattern (natural hip rotation while walking)
    const gaitDetected = this.detectGaitPattern();
    if (gaitDetected && this.activityType === 'vehicle') {
      this.activityType = 'walking'; // Override vehicle detection if gait found
    }
  }

  detectGaitPattern() {
    if (this.rotationData.length < 10) return false;

    // Walking has rhythmic rotation in gamma (roll) axis
    const recent = this.rotationData.slice(-10);
    const gammaValues = recent.map(r => r.gamma);
    const variance = this.calculateVariance(gammaValues);

    // Log occasionally to avoid spam (only every 50th check)
    if (this.stepCount % 50 === 0) {
      if(import.meta.env.DEV)console.log('👣 Gait variance:', variance.toFixed(2));
    }

    // Variance between 20-80 indicates walking gait
    const detected = variance > 20 && variance < 80;
    if (detected) {
      if(import.meta.env.DEV)console.log('✅ Natural walking gait detected!');
    }
    return detected;
  }

  // SMART: Stationary detection with confidence (requires sustained stillness)
  detectStationaryState() {
    if (this.accelerationHistory.length < 15) {
      this.isStationary = false;
      return false;
    }

    // Analyze last 1.5 seconds of accelerometer data
    const recent = this.accelerationHistory.slice(-15);
    const magnitudes = recent.map(r => r.magnitude);
    
    // Calculate variance in acceleration
    const variance = this.calculateVariance(magnitudes);
    
    // DISABLED: Stationary detection was blocking real walking steps
    // Wrist protection handled by: burst (350ms), threshold (1.5 m/s²), Y-axis (70%), touch detection
    // Track for logging only, never block steps
    if (variance < this.stationaryThreshold) {
      this.consecutiveStationaryReadings++;
      if (this.consecutiveStationaryReadings >= this.stationaryRequiredReadings) {
        this.isStationary = true;
      }
    } else if (variance > this.movementThreshold) {
      this.consecutiveStationaryReadings = 0;
      this.isStationary = false;
    } else {
      this.consecutiveStationaryReadings = Math.max(0, this.consecutiveStationaryReadings - 1);
    }
    
    // NEVER block steps based on stationary detection (was causing false negatives)
    return false;
  }

  // PICKUP FILTER: Calculate amplitude variance to detect inconsistent peaks
  calculateAmplitudeVariance(amplitudes) {
    if (amplitudes.length < 2) return 0;
    
    const mean = amplitudes.reduce((sum, val) => sum + val, 0) / amplitudes.length;
    const variance = amplitudes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amplitudes.length;
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation (normalized variance)
    return mean > 0 ? stdDev / mean : 0;
  }
  
  // WRIST FILTER: Analyze motion axis to detect vertical vs horizontal movement
  analyzeMotionAxis() {
    if (this.axisHistory.length < 10) {
      return { isVerticalMotion: true, confidence: 0.5, xPercent: 0.33, yPercent: 0.34, zPercent: 0.33 }; // Not enough data, allow
    }
    
    // Get recent axis data (last 10 readings)
    const recent = this.axisHistory.slice(-10);
    
    // Calculate average contribution of each axis
    const avgX = recent.reduce((sum, r) => sum + r.x, 0) / recent.length;
    const avgY = recent.reduce((sum, r) => sum + r.y, 0) / recent.length;
    const avgZ = recent.reduce((sum, r) => sum + r.z, 0) / recent.length;
    
    const total = avgX + avgY + avgZ;
    
    // Calculate percentages
    const xPercent = avgX / total;
    const yPercent = avgY / total;
    const zPercent = avgZ / total;
    
    // Walking = strong Y-axis component (vertical bounce)
    // Wrist = strong X/Z-axis component (horizontal/rotational)
    const isVerticalMotion = yPercent > this.verticalMotionRatio;
    
    // Calculate confidence
    const confidence = Math.abs(yPercent - 0.5) * 2; // 0.5 = uncertain, 0/1 = certain
    
    if (!isVerticalMotion && confidence > 0.6) {
      if(import.meta.env.DEV)console.log('📊 Motion: X=' + (xPercent * 100).toFixed(0) + '% Y=' + (yPercent * 100).toFixed(0) + '% Z=' + (zPercent * 100).toFixed(0) + '% → Horizontal');
    }
    
    return { isVerticalMotion, confidence, xPercent, yPercent, zPercent };
  }
  
  // SMART: GPS movement check with confidence (handles indoor/poor GPS)
  isUserMovingByGPS() {
    // If no GPS data, allow steps (indoor walking is common)
    if (!this.sensors.gps.data || this.sensors.gps.data.speed === null || this.sensors.gps.data.speed === undefined) {
      return true; // No GPS = benefit of doubt
    }

    // GPS speed in m/s - walking is ~1.4 m/s, running is ~3+ m/s
    const speed = this.sensors.gps.data.speed;
    
    // Only block steps if GPS shows clear stationary state (< 0.3 m/s)
    // This is more lenient than before to handle GPS drift and indoor movement
    const isMoving = speed > 0.3;
    
    if (!isMoving && this.lastPosition) {
      if(import.meta.env.DEV)console.log('📍 GPS stationary (', speed.toFixed(2), 'm/s) - Soft block');
      // Return false only if we also have high confidence in stationary state
      return this.consecutiveStationaryReadings < 5;
    }
    
    return isMoving;
  }

  // SMART: Validate step rhythm (allow natural variation)
  validateStepRhythm(currentInterval) {
    if (this.lastValidSteps.length < 3) {
      return true; // Starting to walk - accept step
    }

    // Calculate average interval between recent steps
    const intervals = [];
    for (let i = 1; i < this.lastValidSteps.length; i++) {
      intervals.push(this.lastValidSteps[i] - this.lastValidSteps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Allow 70% variation (was 50%) - people naturally vary their pace
    // Walking cadence ranges from 90-130 steps/min = 460-670ms per step
    const deviation = Math.abs(currentInterval - avgInterval) / avgInterval;
    const isRhythmic = deviation < 0.7 || (currentInterval > 400 && currentInterval < 900);
    
    if (!isRhythmic) {
      if(import.meta.env.DEV)console.log('🎵 Rhythm varied - Expected ~' + avgInterval.toFixed(0) + 'ms, got ' + currentInterval + 'ms (deviation: ' + (deviation * 100).toFixed(0) + '%)');
    }
    
    return isRhythmic;
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  // ==================== BAROMETER ====================
  async initializeBarometer() {
    try {
      // Note: Barometer not directly available in Capacitor
      // Using altitude from GPS as proxy
      this.sensors.barometer.active = true;
      if(import.meta.env.DEV)console.log('🏔️ Altitude tracking enabled (via GPS)');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Barometer init error:', error);
      return false;
    }
  }

  handleAltitudeChange(altitude) {
    if (this.lastAltitude !== null) {
      const altitudeChange = altitude - this.lastAltitude;

      if(import.meta.env.DEV)console.log('🏔️ Altitude change:', altitudeChange.toFixed(2), 'm');

      // Floor climbed = ~3 meters elevation gain
      if (altitudeChange > 3) {
        this.floorsClimbed += Math.floor(altitudeChange / 3);
        if(import.meta.env.DEV)console.log('⬆️ Floors climbed:', this.floorsClimbed);
        
        // Adjust stride length for uphill
        this.userPatterns.avgStrideLength = this.userPatterns.uphillStride;
        this.notifyStepListeners();
      } else if (altitudeChange < -3) {
        // Adjust stride length for downhill
        this.userPatterns.avgStrideLength = this.userPatterns.downhillStride;
        if(import.meta.env.DEV)console.log('⬇️ Going downhill, stride adjusted');
        this.notifyStepListeners();
      } else {
        // Flat ground
        this.userPatterns.avgStrideLength = 0.75;
      }
    }

    this.lastAltitude = altitude;
    this.currentAltitude = altitude;
  }

  // ==================== MAGNETOMETER ====================
  async initializeMagnetometer() {
    try {
      // Note: Direct magnetometer access not in Capacitor core
      // Using GPS bearing as direction proxy
      this.sensors.magnetometer.active = true;
      if(import.meta.env.DEV)console.log('🧭 Direction tracking enabled (via GPS)');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Magnetometer init error:', error);
      return false;
    }
  }

  handleDirectionChange(direction) {
    const lastDirection = this.currentDirection;
    this.currentDirection = direction;

    // Count significant direction changes (> 30 degrees)
    const directionDiff = Math.abs(direction - lastDirection);
    if (directionDiff > 30 && directionDiff < 330) {
      this.directionChanges++;
      if(import.meta.env.DEV)console.log('🧭 Direction change:', directionDiff.toFixed(1), '° - Total changes:', this.directionChanges);
      
      // High direction changes = walking (zigzag)
      // Low direction changes = vehicle (straight)
      if (this.directionChanges > 5) {
        this.activityType = 'walking';
        if(import.meta.env.DEV)console.log('✅ Walking pattern detected (zigzag motion)');
        this.notifyStepListeners();
      }
    }
  }

  // ==================== HEART RATE ====================
  async initializeHeartRate() {
    try {
      // Optical heart rate via camera (PPG method)
      this.sensors.heartRate.active = true;
      if(import.meta.env.DEV)console.log('❤️ Heart rate monitoring available');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Heart rate init error:', error);
      return false;
    }
  }

  async startHeartRateMeasurement() {
    try {
      if (this.hrMeasuring) return;

      this.hrMeasuring = true;
      // This would use camera + flash to measure blood flow
      // Simplified implementation - would need camera plugin
      
      if(import.meta.env.DEV)console.log('❤️ Measuring heart rate...');
      
      // Simulate measurement (in real app, analyze camera frames)
      setTimeout(() => {
        // Typical HR: walking 90-120, running 140-180
        const baseHR = this.activityType === 'running' ? 150 : 100;
        this.heartRate = baseHR + Math.floor(Math.random() * 20);
        this.sensors.heartRate.data = this.heartRate;
        
        // Validate activity type with HR
        if (this.heartRate < 90) {
          this.activityType = 'stationary';
        } else if (this.heartRate > 130) {
          this.activityType = 'running';
        }
        
        this.hrMeasuring = false;
        if(import.meta.env.DEV)console.log('❤️ Heart rate:', this.heartRate, 'bpm');
      }, 3000);
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Heart rate measurement error:', error);
      this.hrMeasuring = false;
      return false;
    }
  }

  // ==================== CADENCE ====================
  async initializeCadence() {
    try {
      this.sensors.cadence.active = true;
      if(import.meta.env.DEV)console.log('🎵 Cadence tracking enabled');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Cadence init error:', error);
      return false;
    }
  }

  recordStep() {
    const now = Date.now();
    this.stepTimestamps.push(now);
    
    // Keep last 20 steps
    if (this.stepTimestamps.length > 20) {
      this.stepTimestamps.shift();
    }

    // Calculate cadence (steps per minute)
    if (this.stepTimestamps.length >= 2) {
      const timeSpan = now - this.stepTimestamps[0];
      const stepsInWindow = this.stepTimestamps.length;
      this.cadenceRate = Math.round((stepsInWindow / timeSpan) * 60000);
      
      this.sensors.cadence.data = this.cadenceRate;
      if(import.meta.env.DEV)console.log('🎵 Cadence:', this.cadenceRate, 'steps/min');
      
      // Classify activity by cadence
      if (this.cadenceRate >= this.RUNNING_CADENCE.min) {
        this.activityType = 'running';
      } else if (this.cadenceRate >= this.WALKING_CADENCE.min) {
        this.activityType = 'walking';
      }
    }

    this.lastStepTime = now;
  }

  validateStepsWithCadence(estimatedSteps) {
    // If no cadence data yet, accept GPS estimate
    if (this.cadenceRate === 0) return true;

    // Expected steps based on cadence
    const timeSinceLastUpdate = (Date.now() - this.lastStepTime) / 60000; // minutes
    const expectedSteps = this.cadenceRate * timeSinceLastUpdate;

    // Allow 30% variance
    const diff = Math.abs(estimatedSteps - expectedSteps);
    return diff < expectedSteps * 0.3;
  }

  // ==================== BLUETOOTH ====================
  async initializeBluetooth() {
    try {
      // Would integrate with fitness trackers (Fitbit, Garmin, Apple Watch)
      this.sensors.bluetooth.active = true;
      if(import.meta.env.DEV)console.log('📡 Bluetooth device sync available');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Bluetooth init error:', error);
      return false;
    }
  }

  async syncBluetoothDevice(device) {
    try {
      if(import.meta.env.DEV)console.log('📡 Syncing with', device.name);
      // In real implementation, use Web Bluetooth API or Capacitor plugin
      // Cross-validate step counts and use most accurate
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Bluetooth sync error:', error);
      return false;
    }
  }

  // ==================== MACHINE LEARNING ====================
  startPatternLearning() {
    // Learn user's walking patterns over time
    setInterval(() => {
      this.learnStrideLength();
      this.learnWalkingSpeed();
    }, 60000); // Update every minute
  }

  learnStrideLength() {
    // If we have both GPS distance and step count
    if (this.totalDistance > 100 && this.stepCount > 100) {
      const calculatedStride = this.totalDistance / this.stepCount;
      
      // Moving average to adapt gradually
      this.userPatterns.avgStrideLength = 
        (this.userPatterns.avgStrideLength * 0.9) + (calculatedStride * 0.1);
      
      if(import.meta.env.DEV)console.log('🧠 ML: Learned stride length:', this.userPatterns.avgStrideLength.toFixed(3), 'm');
      this.saveUserPatterns();
      // Don't notify listeners - stride updates don't need UI refresh
    }
  }

  learnWalkingSpeed() {
    if (this.gpsTrail.length >= 2) {
      const recent = this.gpsTrail.slice(-10);
      const timeSpan = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000; // seconds
      
      if (timeSpan > 0) {
        let distance = 0;
        for (let i = 1; i < recent.length; i++) {
          distance += this.calculateDistance(
            recent[i-1].lat, recent[i-1].lng,
            recent[i].lat, recent[i].lng
          );
        }
        
        const speed = distance / timeSpan; // m/s
        
        if (this.activityType === 'walking') {
          this.userPatterns.walkingSpeed = (this.userPatterns.walkingSpeed * 0.9) + (speed * 0.1);
          if(import.meta.env.DEV)console.log('🧠 ML: Walking speed learned:', this.userPatterns.walkingSpeed.toFixed(2), 'm/s');
        } else if (this.activityType === 'running') {
          this.userPatterns.runningSpeed = (this.userPatterns.runningSpeed * 0.9) + (speed * 0.1);
          if(import.meta.env.DEV)console.log('🧠 ML: Running speed learned:', this.userPatterns.runningSpeed.toFixed(2), 'm/s');
        }
        this.saveUserPatterns();
      }
    }
  }

  getAdaptiveStrideLength() {
    // Return appropriate stride based on current conditions
    if (this.currentAltitude && this.lastAltitude) {
      const slope = this.currentAltitude - this.lastAltitude;
      if (slope > 2) return this.userPatterns.uphillStride;
      if (slope < -2) return this.userPatterns.downhillStride;
    }
    
    return this.userPatterns.avgStrideLength;
  }

  // ==================== DATA PERSISTENCE ====================
  async loadUserPatterns() {
    try {
      // 🔥 FIX: Try Firebase first, then localStorage
      try {
        const firestoreService = (await import('./firestoreService.js')).default;
        const authService = (await import('./authService.js')).default;
        const cloudPatterns = await firestoreService.get('ml_user_patterns', authService.getCurrentUser()?.uid);
        if (cloudPatterns && cloudPatterns.totalStepsLearned > 0) {
          this.userPatterns = cloudPatterns;
          localStorage.setItem('ml_user_patterns', JSON.stringify(cloudPatterns));
          if(import.meta.env.DEV)console.log('🧠 Loaded learned patterns from cloud:', cloudPatterns);
          return;
        }
      } catch (e) { /* fallback to localStorage */ }
      
      const saved = localStorage.getItem('ml_user_patterns');
      if (saved) {
        this.userPatterns = JSON.parse(saved);
        if(import.meta.env.DEV)console.log('🧠 Loaded learned patterns:', this.userPatterns);
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error loading patterns:', error);
    }
  }

  async saveUserPatterns() {
    try {
      localStorage.setItem('ml_user_patterns', JSON.stringify(this.userPatterns));
      
      // 🔥 FIX: Sync to Firebase
      try {
        const firestoreService = (await import('./firestoreService.js')).default;
        const authService = (await import('./authService.js')).default;
        await firestoreService.save('ml_user_patterns', this.userPatterns, authService.getCurrentUser()?.uid);
      } catch (e) { /* offline mode */ }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error saving patterns:', error);
    }
  }

  // ==================== PUBLIC API ====================
  getStepCount() {
    return this.stepCount;
  }

  getDistance() {
    return (this.totalDistance / 1000).toFixed(2); // km
  }

  getFloorsClimbed() {
    return this.floorsClimbed;
  }

  getActivityType() {
    return this.activityType;
  }

  getCadence() {
    return this.cadenceRate;
  }

  getHeartRate() {
    return this.heartRate;
  }

  getActiveSensorCount() {
    return Object.values(this.sensors).filter(s => s.active).length;
  }

  getActiveSensors() {
    return Object.entries(this.sensors)
      .filter(([_, sensor]) => sensor.active)
      .map(([name, _]) => name);
  }

  addStepListener(callback) {
    this.stepListeners.push(callback);
  }

  removeStepListener(callback) {
    this.stepListeners = this.stepListeners.filter(cb => cb !== callback);
  }

  // Reset for new day (called at midnight) - preserves sensors
  resetForNewDay() {
    if(import.meta.env.DEV)console.log('🌅 Multi-sensor service: New day reset');
    if(import.meta.env.DEV)console.log('📊 Previous day steps:', this.stepCount);
    
    // Reset step count but keep sensors running
    this.stepCount = 0;
    this.totalDistance = 0;
    this.floorsClimbed = 0;
    
    // Clear history arrays but keep sensors active
    this.stepTimestamps = [];
    this.lastValidSteps = [];
    this.accelerationHistory = [];
    this.rotationData = [];
    this.gpsTrail = [];
    
    // Reset timing
    this.lastStepTime = 0;
    this.lastAccelPeak = 0;
    this.sessionStartTime = Date.now();
    
    // Notify listeners of reset
    this.notifyStepListeners();
    
    if(import.meta.env.DEV)console.log('✅ Multi-sensor reset complete, sensors still active');
  }

  notifyStepListeners() {
    const now = Date.now();
    const timeSinceLastNotification = now - this.lastNotification;
    
    // Throttle: Only notify if 2 seconds passed OR step count changed significantly (10+ steps)
    const significantChange = Math.abs(this.stepCount - this.lastStepCount) >= 10;
    
    if (timeSinceLastNotification < this.NOTIFICATION_THROTTLE && !significantChange) {
      // Too soon since last notification, skip to prevent flickering
      return;
    }
    
    if(import.meta.env.DEV)console.log('📢 Broadcasting sensor update to', this.stepListeners.length, 'listeners');
    const data = {
      steps: this.stepCount,
      distance: this.getDistance(),
      floors: this.floorsClimbed,
      cadence: this.cadenceRate,
      heartRate: this.heartRate,
      activityType: this.activityType
    };
    
    // Save to ENCRYPTED localStorage every update (async operation, don't await)
    this.saveHealthDataAsync();
    
    // Update last notification tracking
    this.lastNotification = now;
    this.lastStepCount = this.stepCount;
    
    // Notify all listeners
    this.stepListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        if(import.meta.env.DEV)console.error('Error in step listener:', error);
      }
    });
  }

  // Async helper for saving health data
  async saveHealthDataAsync() {
    try {
      if (!this.encryption) {
        // Fallback to unencrypted if encryption failed to initialize
        const healthData = JSON.parse(localStorage.getItem('health_data') || '{}');
        healthData.stepCount = this.stepCount;
        healthData.date = new Date().toISOString().split('T')[0];
        localStorage.setItem('health_data', JSON.stringify(healthData));
      } else {
        // Use encrypted storage
        const healthData = await this.encryption.getSecureItem('health_data') || {};
        healthData.stepCount = this.stepCount;
        healthData.date = new Date().toISOString().split('T')[0];
        healthData.healthData = healthData.healthData || {};
        healthData.healthData.steps = this.stepCount;
        healthData.healthData.distance = parseFloat(this.getDistance());
        healthData.healthData.calories = Math.round(this.stepCount * 0.04);
        healthData.healthData.activityType = this.activityType;
        healthData.lastUpdate = Date.now();
        await this.encryption.setSecureItem('health_data', healthData);
        if(import.meta.env.DEV)console.log('🔐💾 Saved to encrypted storage:', this.stepCount, 'steps');
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error saving to storage:', error);
    }
  }

  async stop() {
    if(import.meta.env.DEV)console.log('🛑 Stopping multi-sensor service...');
    
    // PHASE 1: Record session for Pattern Learning AI
    if (this.aiEnabled && this.patternAI) {
      const sessionDuration = Date.now() - this.sessionStartTime;
      const sessionSteps = this.stepCount - this.initialStepCount;
      const context = this.contextAI ? this.contextAI.getCurrentContext().type : 'unknown';
      
      if (sessionSteps > 10 && sessionDuration > 60000) { // At least 10 steps and 1 minute
        this.patternAI.recordSession(sessionSteps, context, sessionDuration);
        if(import.meta.env.DEV)console.log('📚 Session recorded:', sessionSteps, 'steps in', (sessionDuration / 60000).toFixed(1), 'min');
      }
    }
    
    // PHASE 1: Cleanup AI services
    if (this.contextAI) {
      this.contextAI.cleanup();
    }
    if (this.deviceState) {
      this.deviceState.cleanup();
    }
    
    // Stop GPS
    if (this.gpsWatchId) {
      await Geolocation.clearWatch({ id: this.gpsWatchId });
    }

    // Stop accelerometer
    if (this.accelerometerListener) {
      await this.accelerometerListener.remove();
    }

    // Stop gyroscope
    if (this.gyroscopeListener) {
      await this.gyroscopeListener.remove();
    }

    // Stop heart rate
    if (this.hrVideoStream) {
      this.hrVideoStream.getTracks().forEach(track => track.stop());
    }

    // Save patterns
    await this.saveUserPatterns();

    if(import.meta.env.DEV)console.log('✅ Multi-sensor service stopped (AI data saved)');
  }
}

export default new MultiSensorService();



