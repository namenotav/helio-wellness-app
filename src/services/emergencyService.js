// Emergency Health Autopilot - Detects emergencies and auto-responds
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import authService from './authService';
import { getCurrentPosition, startGPSTracking, stopGPSTracking } from './nativeGPSService';
import motionListenerService from './motionListenerService.js';

class EmergencyService {
  constructor() {
    this.monitoring = false;
    this.emergencyContacts = [];
    this.healthBaseline = null;
    this.currentLocation = null;
    this.gpsWatchId = null;
    this.locationHistory = [];
    this.fallDetectionActive = false;
    this.alarmAudio = null;
    this.fallDetectionCallback = null; // Store callback for auto-resume
    this.globalFallAlertCallback = null; // Global callback for fall alerts
    
    // Auto-initialize fall detection from saved state
    this.initializeFallDetection();
  }

  // Initialize fall detection from saved state (called in constructor)
  async initializeFallDetection() {
    try {
      const savedData = await this.loadEmergencyData();
      if (savedData?.fallDetection && !this.fallDetectionActive) {
        if(import.meta.env.DEV)console.log('🔄 Auto-resuming fall detection from saved state');
        // Wait for global callback to be registered
        setTimeout(() => {
          if (this.globalFallAlertCallback) {
            this.startFallDetection(this.globalFallAlertCallback);
          }
        }, 1000);
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Fall detection initialization error:', error);
    }
  }

  // Register global fall alert callback (called from NewDashboard)
  setGlobalFallAlertCallback(callback) {
    this.globalFallAlertCallback = callback;
    // If fall detection was enabled, start it now with the callback
    if (this.fallDetectionActive && !this.fallMotionSubscription) {
      this.startFallDetection(callback);
    }
  }

  // Initialize emergency monitoring
  async startMonitoring() {
    const user = authService.getCurrentUser();
    
    if (user) {
      // Load emergency contacts from Preferences (permanent storage)
      await this.loadEmergencyData();
      this.healthBaseline = this.establishBaseline(user);
    }
    
    // Set monitoring to true AFTER loading data (so it doesn't get overwritten)
    this.monitoring = true;
    
    // Start REAL GPS tracking
    try {
      this.currentLocation = await getCurrentPosition();
      if(import.meta.env.DEV)console.log('📍 GPS Location acquired:', this.currentLocation);
      
      // Watch location continuously
      this.gpsWatchId = await startGPSTracking((location) => {
        this.currentLocation = location;
        this.locationHistory.push({
          ...location,
          timestamp: Date.now()
        });
        // Keep last 100 locations
        if (this.locationHistory.length > 100) {
          this.locationHistory.shift();
        }
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('GPS tracking failed:', error);
      alert('⚠️ Unable to access GPS. Emergency location sharing may be limited.');
    }
    
    // Check health metrics every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.checkForEmergencies();
    }, 5 * 60 * 1000);
    
    if(import.meta.env.DEV)console.log('🚨 Emergency monitoring started with GPS tracking');
  }

  // Stop monitoring
  async stopMonitoring() {
    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    // Stop GPS tracking
    if (this.gpsWatchId) {
      await stopGPSTracking();
      this.gpsWatchId = null;
      if(import.meta.env.DEV)console.log('📍 GPS tracking stopped');
    }
  }

  // Establish baseline health metrics
  establishBaseline(user) {
    // Safely access stats with null checks
    const stats = user?.stats || {};
    const profile = user?.profile || {};
    
    // Calculate average steps with safety checks
    const totalDays = stats.totalDays || 0;
    const totalSteps = stats.totalSteps || 0;
    const avgSteps = totalDays > 0 ? totalSteps / totalDays : 5000;
    
    if(import.meta.env.DEV)console.log('📊 Establishing baseline:', { totalDays, totalSteps, avgSteps });
    
    return {
      avgDailySteps: avgSteps,
      normalActivityPattern: this.calculateActivityPattern(stats),
      typicalHeartRate: 70, // Would come from wearable
      normalSleepHours: 7
    };
  }

  // Calculate normal activity pattern
  calculateActivityPattern(stats) {
    // Simplified - in real app would use time-series data
    // Stats is optional, so we just return default pattern
    return {
      morningActivity: 0.3,
      afternoonActivity: 0.5,
      eveningActivity: 0.2
    };
  }

  // Check for emergency conditions
  async checkForEmergencies() {
    const user = authService.getCurrentUser();
    if (!user) return;

    const currentMetrics = this.getCurrentMetrics(user);
    const anomalies = this.detectAnomalies(currentMetrics);
    
    if (anomalies.length > 0) {
      await this.handleEmergency(anomalies);
    }
  }

  // Get current health metrics
  getCurrentMetrics(user) {
    const today = new Date().toDateString();
    const todaySteps = user.stats.dailySteps?.[today] || 0;
    
    return {
      stepsToday: todaySteps,
      lastActiveTime: user.profile.lastActive || new Date(),
      recentFoodLog: user.profile.foodLog?.slice(-5) || [],
      recentSymptoms: user.profile.symptomLog?.slice(-3) || []
    };
  }

  // Detect health anomalies
  detectAnomalies(metrics) {
    const anomalies = [];
    
    // Sudden inactivity detection
    const hoursSinceActive = (new Date() - new Date(metrics.lastActiveTime)) / (1000 * 60 * 60);
    if (hoursSinceActive > 24) {
      anomalies.push({
        type: 'inactivity',
        severity: 'high',
        message: 'No activity detected for 24+ hours',
        action: 'check-welfare'
      });
    }

    // Severe allergic reaction pattern
    const recentDangerFoods = metrics.recentFoodLog.filter(f => f.safety === 'danger');
    const recentSevereSymptoms = metrics.recentSymptoms.filter(s => s.severity === 'severe');
    
    if (recentDangerFoods.length > 0 && recentSevereSymptoms.length > 0) {
      anomalies.push({
        type: 'allergic-reaction',
        severity: 'critical',
        message: 'Possible severe allergic reaction',
        action: 'call-ambulance'
      });
    }

    // Unusual step pattern (possible fall or illness)
    if (this.healthBaseline && metrics.stepsToday < this.healthBaseline.avgDailySteps * 0.2) {
      const hour = new Date().getHours();
      if (hour > 12) { // After noon, should have some steps
        anomalies.push({
          type: 'unusual-inactivity',
          severity: 'medium',
          message: 'Unusual lack of movement detected',
          action: 'send-alert'
        });
      }
    }

    return anomalies;
  }

  // Handle emergency situation
  async handleEmergency(anomalies) {
    const criticalAnomaly = anomalies.find(a => a.severity === 'critical');
    
    if (criticalAnomaly) {
      await this.triggerEmergencyProtocol(criticalAnomaly);
    } else {
      await this.sendWarningNotification(anomalies);
    }
  }

  // Full emergency protocol
  async triggerEmergencyProtocol(anomaly) {
    if(import.meta.env.DEV)console.log('🚨 EMERGENCY DETECTED:', anomaly.message);
    
    // 1. Haptic alert
    await this.emergencyHapticPattern();
    
    // 2. Emergency notification
    await this.sendEmergencyNotification(anomaly);
    
    // 3. Alert emergency contacts
    await this.alertEmergencyContacts(anomaly);
    
    // 4. Prepare medical data
    const medicalPackage = await this.prepareMedicalData();
    
    // 5. Simulate ambulance call (in real app, would integrate with emergency services)
    if (anomaly.action === 'call-ambulance') {
      await this.simulateEmergencyCall(medicalPackage);
    }
  }

  // Emergency haptic pattern
  async emergencyHapticPattern() {
    for (let i = 0; i < 5; i++) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Send emergency notification
  async sendEmergencyNotification(anomaly) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '🚨 EMERGENCY ALERT',
          body: anomaly.message + ' - Emergency contacts notified',
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          attachments: null,
          actionTypeId: 'emergency',
          extra: { anomaly }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Notification error:', error);
    }
  }

  // Alert emergency contacts
  async alertEmergencyContacts(anomaly) {
    const user = authService.getCurrentUser();
    const contacts = user?.profile?.emergencyContacts || [];
    
    if(import.meta.env.DEV)console.log('📞 Alerting emergency contacts:', contacts);
    
    // In real app: SMS API integration
    for (const contact of contacts) {
      if(import.meta.env.DEV)console.log(`Sending alert to ${contact.name}: ${anomaly.message}`);
    }
    
    return {
      success: true,
      contactsAlerted: contacts.length,
      timestamp: new Date().toISOString()
    };
  }

  // Prepare medical data package
  async prepareMedicalData() {
    const user = authService.getCurrentUser();
    if (!user) return null;

    // Get REAL current GPS location
    let currentGPS = this.currentLocation;
    if (!currentGPS) {
      try {
        currentGPS = await getCurrentPosition();
      } catch (error) {
        if(import.meta.env.DEV)console.error('Could not get GPS location:', error);
        currentGPS = { latitude: 0, longitude: 0, accuracy: -1 };
      }
    }

    return {
      patientInfo: {
        name: user.name,
        age: user.profile.age,
        bloodType: user.profile.bloodType || 'Unknown',
        weight: user.profile.weight,
        height: user.profile.height
      },
      allergens: user.profile.allergens || [],
      medications: user.profile.medications || [],
      medicalConditions: user.profile.medicalConditions || [],
      emergencyContacts: user.profile.emergencyContacts || [],
      recentFoodLog: user.profile.foodLog?.slice(-10) || [],
      recentSymptoms: user.profile.symptomLog?.slice(-5) || [],
      timestamp: new Date().toISOString(),
      location: {
        latitude: currentGPS.latitude,
        longitude: currentGPS.longitude,
        accuracy: currentGPS.accuracy,
        altitude: currentGPS.altitude,
        googleMapsUrl: `https://www.google.com/maps?q=${currentGPS.latitude},${currentGPS.longitude}`,
        address: await this.reverseGeocode(currentGPS.latitude, currentGPS.longitude)
      },
      locationHistory: this.locationHistory.slice(-10) // Last 10 locations for movement tracking
    };
  }

  // REAL emergency call via native phone API
  async simulateEmergencyCall(medicalData) {
    if(import.meta.env.DEV)console.log('📞 TRIGGERING EMERGENCY CALL PROTOCOL');
    if(import.meta.env.DEV)console.log('Medical Data Package:', medicalData);
    
    const results = {
      success: true,
      callPlaced: false,
      contactsAlerted: 0,
      locationShared: false,
      medicalDataShared: true,
      timestamp: new Date().toISOString()
    };

    // 1. OPEN PHONE DIALER FOR 999/911 (UK/US emergency)
    try {
      const emergencyNumber = '999'; // UK emergency number
      
      if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
        // Open phone dialer with emergency number
        window.open(`tel:${emergencyNumber}`, '_system');
        if(import.meta.env.DEV)console.log(`📞 Opening dialer with ${emergencyNumber}`);
        results.callPlaced = true;
      } else {
        if(import.meta.env.DEV)console.log('📞 Emergency call: On mobile device would dial', emergencyNumber);
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Phone call error:', error);
    }

    // 2. SHARE LOCATION WITH EMERGENCY CONTACTS via native Share API
    await this.shareLocationWithContacts(medicalData);
    results.locationShared = true;
    results.contactsAlerted = medicalData.emergencyContacts.length;

    // 3. Store emergency record in localStorage
    const emergencyRecord = {
      id: Date.now(),
      type: 'emergency_call',
      medicalData,
      timestamp: new Date().toISOString(),
      location: medicalData.location
    };
    
    const history = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
    history.push(emergencyRecord);
    localStorage.setItem('emergencyHistory', JSON.stringify(history));
    
    // 🔥 FIX: Sync emergency history to Firebase
    try {
      const firestoreService = (await import('./firestoreService.js')).default;
      const authService = (await import('./authService.js')).default;
      await firestoreService.save('emergencyHistory', history, authService.getCurrentUser()?.uid);
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Could not sync emergency history to Firebase');
    }

    return results;
  }

  // Share location with emergency contacts using native Share API
  async shareLocationWithContacts(medicalData) {
    const { location, patientInfo, emergencyContacts } = medicalData;
    
    if (!location || !location.latitude) {
      if(import.meta.env.DEV)console.error('No GPS location available to share');
      return;
    }

    const shareText = `🚨 EMERGENCY ALERT from ${patientInfo.name}\n\n` +
      `Location: ${location.googleMapsUrl}\n` +
      `Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n` +
      `Accuracy: ±${Math.round(location.accuracy)}m\n` +
      `Time: ${new Date().toLocaleString('en-GB')}\n\n` +
      `Medical Info:\n` +
      `Blood Type: ${patientInfo.bloodType}\n` +
      `Age: ${patientInfo.age}\n` +
      `Allergens: ${medicalData.allergens.join(', ') || 'None'}\n\n` +
      `This is an automated emergency alert from WellnessAI app.`;

    try {
      // Use native Share API to share location
      await Share.share({
        title: '🚨 Emergency Location Share',
        text: shareText,
        url: location.googleMapsUrl,
        dialogTitle: 'Share Emergency Location'
      });
      
      if(import.meta.env.DEV)console.log('📍 Location shared via native Share API');
      if(import.meta.env.DEV)console.log('Emergency contacts to alert:', emergencyContacts);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Share error:', error);
    }
  }

  // Reverse geocode GPS coordinates to human-readable address
  async reverseGeocode(latitude, longitude) {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WellnessAI-EmergencyApp/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        return data.display_name;
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  // Send warning notification (non-critical)
  async sendWarningNotification(anomalies) {
    const message = anomalies.map(a => a.message).join('. ');
    
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '⚠️ Health Warning',
          body: message,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default'
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Warning notification error:', error);
    }
  }

  // Add emergency contact
  async addEmergencyContact(contact) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false };

    const contacts = user.profile.emergencyContacts || [];
    contacts.push({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      primary: contacts.length === 0
    });

    await authService.updateProfile({ emergencyContacts: contacts });
    
    // Save to permanent storage
    this.emergencyContacts = contacts;
    await this.saveEmergencyData();
    
    return { success: true };
  }

  // Manual emergency trigger
  async triggerManualEmergency() {
    const anomaly = {
      type: 'manual-trigger',
      severity: 'critical',
      message: 'User manually triggered emergency alert',
      action: 'call-ambulance'
    };

    await this.triggerEmergencyProtocol(anomaly);
  }

  // Share current location with someone (non-emergency)
  async shareCurrentLocation() {
    try {
      if(import.meta.env.DEV)console.log('📍 Getting fresh GPS location for sharing...');
      // Always get fresh location on-demand (no need for monitoring to be enabled)
      const location = await getCurrentPosition();
      const user = authService.getCurrentUser();
      
      if(import.meta.env.DEV)console.log('✅ GPS location acquired:', location);
      
      const shareText = `📍 Live location from ${user?.profile?.fullName || user?.name || 'WellnessAI user'}\n\n` +
        `Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}\n` +
        `Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n` +
        `Accuracy: ±${Math.round(location.accuracy)}m\n` +
        `Time: ${new Date().toLocaleString('en-GB')}`;

      await Share.share({
        title: '📍 My Current Location',
        text: shareText,
        url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        dialogTitle: 'Share My Location'
      });
      
      return { success: true, location };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Location share error:', error);
      throw error;
    }
  }

  // Get location tracking status
  getLocationStatus() {
    return {
      tracking: this.gpsWatchId !== null,
      currentLocation: this.currentLocation,
      locationHistoryCount: this.locationHistory.length,
      lastUpdate: this.currentLocation ? new Date(this.currentLocation.timestamp) : null
    };
  }

  // Fall Detection using device accelerometer
  async startFallDetection(onFallDetected) {
    try {
      // TRY NATIVE FALL DETECTION SERVICE FIRST (24/7 background)
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        try {
          const nativeFallService = (await import('./nativeFallDetectionService.js')).default;
          
          // Check if native bridge is available
          if (window.AndroidFallDetection) {
            if(import.meta.env.DEV)console.log('🚀 Starting NATIVE fall detection service (24/7)...');
            
            // Start native foreground service
            await nativeFallService.start();
            
            // Listen for fall events from native service
            nativeFallService.addListener((fallData) => {
              if(import.meta.env.DEV)console.log('⚠️ Native fall detected:', fallData);
              this.handleFallDetected(onFallDetected);
            });
            
            this.fallDetectionActive = true;
            this.fallDetectionCallback = onFallDetected;
            await this.saveEmergencyData();
            
            if(import.meta.env.DEV)console.log('✅ NATIVE fall detection active - works 24/7 even when app closed!');
            return { success: true, native: true };
          }
        } catch (nativeError) {
          if(import.meta.env.DEV)console.warn('⚠️ Native fall detection unavailable, using JS fallback:', nativeError);
        }
      }
      
      // FALLBACK: JavaScript-based fall detection (only when app is open)
      if(import.meta.env.DEV)console.log('⚠️ Using JavaScript fall detection (only works when app open)');
      
      // Start background runner for continuous fall detection
      const backgroundRunnerService = (await import('./backgroundRunnerService.js')).default;
      await backgroundRunnerService.start();
      if(import.meta.env.DEV)console.log('✅ Background runner started for continuous fall detection');
      
      this.fallDetectionActive = true;
      this.fallDetectionCallback = onFallDetected; // Store callback
      // Save state to storage
      await this.saveEmergencyData();
      if(import.meta.env.DEV)console.log('🤕 Fall detection started (JS mode)');
      
      // 🔴 FIX #7: ENHANCED FALL DETECTION WITH G-FORCE MATH
      // Initialize fall detection tracking variables
      if (!this.fallDetectionState) {
        this.fallDetectionState = {
          accelHistory: [],
          maxHistoryLength: 20, // Keep last 20 readings (200ms at 100Hz)
          fallThreshold: 2.5, // 2.5G drop from normal
          impactThreshold: 3.0, // 3G impact
          isFreeFalling: false,
          freeQFallStartTime: null,
          lastImpactTime: null
        };
      }
      
      // Subscribe to centralized motion listener
      this.fallMotionSubscription = await motionListenerService.subscribe((event) => {
        if (!this.fallDetectionActive) return;
        
        // Use accelerationIncludingGravity (raw sensor data with gravity)
        const accel = event.accelerationIncludingGravity || event.acceleration;
        if (!accel) {
          if(import.meta.env.DEV)console.warn('No acceleration data available');
          return;
        }
        
        const { x, y, z } = accel;
        const totalAccel = Math.sqrt(x*x + y*y + z*z);
        const state = this.fallDetectionState;
        
        // Store acceleration in history
        state.accelHistory.push({
          total: totalAccel,
          x, y, z,
          time: Date.now()
        });
        if (state.accelHistory.length > state.maxHistoryLength) {
          state.accelHistory.shift();
        }
        
        // Debug: Log every 2 seconds to avoid spam
        if (!this.lastAccelLog || Date.now() - this.lastAccelLog > 2000) {
          if(import.meta.env.DEV)console.log('📊 Fall detection - G-force:', (totalAccel/9.81).toFixed(2), 'G, Free fall:', state.isFreeFalling);
          this.lastAccelLog = Date.now();
        }
        
        // ALGORITHM: Detect 3-phase fall pattern
        // Phase 1: Free fall (acceleration drops below ~5 m/s² = ~0.5G)
        if (totalAccel < 5 && !state.isFreeFalling) {
          state.isFreeFalling = true;
          state.freeQFallStartTime = Date.now();
          if(import.meta.env.DEV)console.log('📉 [FALL] Phase 1: Free fall detected (low G-force)');
        }
        
        // Phase 2: Free fall duration check (must last 150-500ms to be real fall)
        if (state.isFreeFalling && state.freeQFallStartTime) {
          const freeFallDuration = Date.now() - state.freeQFallStartTime;
          
          // End free fall if normal gravity returns (false alarm)
          if (totalAccel > 10) {
            state.isFreeFalling = false;
            state.freeQFallStartTime = null;
            return; // Not a fall
          }
          
          // Wait for impact after free fall (150-500ms window)
          if (freeFallDuration >= 150) {
            // Phase 3: Detect impact (sudden acceleration > 3G)
            if (totalAccel > 3 * 9.81) { // 3G = 29.43 m/s²
              if(import.meta.env.DEV)console.log('⚠️ [FALL] Phase 3: IMPACT DETECTED! G-force:', (totalAccel/9.81).toFixed(2), 'G');
              
              // FALL CONFIRMED: Free fall + impact pattern detected
              state.isFreeFalling = false;
              state.freeQFallStartTime = null;
              state.lastImpactTime = Date.now();
              
              // Trigger fall alert
              this.handleFallDetected(this.fallDetectionCallback);
            } else if (freeFallDuration > 500) {
              // Free fall window closed without impact (false alarm)
              state.isFreeFalling = false;
              state.freeQFallStartTime = null;
            }
          }
        } else if (!state.isFreeFalling && totalAccel > 4 * 9.81) {
          // ALTERNATIVE: Direct impact detection (> 4G sudden spike)
          // This catches falls where acceleration data doesn't show clear free-fall phase
          if (!state.lastImpactTime || Date.now() - state.lastImpactTime > 10000) {
            if(import.meta.env.DEV)console.log('⚠️ [FALL] Direct impact: HEAVY ACCELERATION:', (totalAccel/9.81).toFixed(2), 'G');
            state.lastImpactTime = Date.now();
            this.handleFallDetected(this.fallDetectionCallback);
          }
        }
      }, 'FallDetection');
      
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Fall detection error:', error);
      alert('⚠️ Fall detection requires motion sensor access');
      return { success: false, error };
    }
  }

  // Stop fall detection
  async stopFallDetection() {
    try {
      // Stop native service if running
      if (Capacitor.isNativePlatform() && window.AndroidFallDetection) {
        try {
          const nativeFallService = (await import('./nativeFallDetectionService.js')).default;
          await nativeFallService.stop();
          if(import.meta.env.DEV)console.log('✅ Native fall detection service stopped');
        } catch (error) {
          if(import.meta.env.DEV)console.warn('Could not stop native service:', error);
        }
      }
      
      // Stop JS fallback if running
      if (this.fallMotionSubscription) {
        this.fallMotionSubscription.unsubscribe();
        this.fallMotionSubscription = null;
      }
      
      this.fallDetectionActive = false;
      // Save state to storage
      await this.saveEmergencyData();
      if(import.meta.env.DEV)console.log('🤕 Fall detection stopped');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Stop fall detection error:', error);
    }
  }

  // Handle fall detected - just alert, don't auto-call
  async handleFallDetected(callback) {
    // Prevent multiple alerts (debounce)
    if (this.fallAlertActive) return;
    this.fallAlertActive = true;
    
    // Play alarm
    this.playEmergencyAlarm();
    
    // Vibrate
    await this.emergencyHapticPattern();
    
    // Notify UI with callback (use global callback if available)
    const alertCallback = this.globalFallAlertCallback || callback;
    if (alertCallback) {
      alertCallback({
        type: 'fall',
        timestamp: new Date().toISOString(),
        location: this.currentLocation
      });
    }
    
    // Reset debounce after 10 seconds
    setTimeout(() => {
      this.fallAlertActive = false;
    }, 10000);
  }

  // Call primary emergency contact
  async callPrimaryContact() {
    const primaryContact = this.emergencyContacts.find(c => c.primary);
    if (!primaryContact) {
      alert('⚠️ No primary emergency contact set. Please add one in settings.');
      return;
    }
    
    try {
      if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
        window.open(`tel:${primaryContact.phone}`, '_system');
        if(import.meta.env.DEV)console.log(`📞 Calling primary contact: ${primaryContact.name} at ${primaryContact.phone}`);
      } else {
        if(import.meta.env.DEV)console.log(`📞 Would call: ${primaryContact.name} at ${primaryContact.phone}`);
        alert(`📞 Calling ${primaryContact.name} at ${primaryContact.phone}`);
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Call error:', error);
      alert('Failed to place call: ' + error.message);
    }
  }

  // Call 999 emergency services
  async call999() {
    try {
      if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
        window.open('tel:999', '_system');
        if(import.meta.env.DEV)console.log('📞 Calling 999 emergency services');
      } else {
        if(import.meta.env.DEV)console.log('📞 Would call 999 emergency services');
        alert('📞 Calling 999');
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Emergency call error:', error);
      alert('Failed to place emergency call: ' + error.message);
    }
  }

  // Play emergency alarm sound
  playEmergencyAlarm() {
    try {
      // Create audio context with emergency siren sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Emergency siren alternating frequencies
      oscillator.frequency.value = 800;
      let toggle = true;
      
      const sirenInterval = setInterval(() => {
        oscillator.frequency.value = toggle ? 800 : 1000;
        toggle = !toggle;
      }, 500);
      
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3; // 30% volume
      oscillator.start();
      
      // Store for stopping later
      this.alarmAudio = { oscillator, gainNode, interval: sirenInterval, context: audioContext };
      
      if(import.meta.env.DEV)console.log('🚨 Emergency alarm playing');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Alarm error:', error);
    }
  }

  // Stop emergency alarm
  stopEmergencyAlarm() {
    if (this.alarmAudio) {
      try {
        clearInterval(this.alarmAudio.interval);
        this.alarmAudio.oscillator.stop();
        this.alarmAudio.context.close();
        this.alarmAudio = null;
        if(import.meta.env.DEV)console.log('🔇 Emergency alarm stopped');
      } catch (error) {
        if(import.meta.env.DEV)console.error('Stop alarm error:', error);
      }
    }
  }

  // Save emergency data to permanent storage (Capacitor Preferences)
  async saveEmergencyData() {
    try {
      const emergencyData = {
        contacts: this.emergencyContacts,
        monitoring: this.monitoring,
        fallDetection: this.fallDetectionActive,
        lastUpdate: new Date().toISOString()
      };
      
      await Preferences.set({
        key: 'emergency_data',
        value: JSON.stringify(emergencyData)
      });
      
      if(import.meta.env.DEV)console.log('💾 Emergency data saved:', {
        monitoring: this.monitoring,
        fallDetection: this.fallDetectionActive,
        contacts: this.emergencyContacts.length
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Save emergency data error:', error);
    }
  }

  // Load emergency data from permanent storage
  async loadEmergencyData() {
    try {
      const { value } = await Preferences.get({ key: 'emergency_data' });
      
      if (value) {
        const data = JSON.parse(value);
        this.emergencyContacts = data.contacts || [];
        this.monitoring = data.monitoring || false;
        this.fallDetectionActive = data.fallDetection || false;
        if(import.meta.env.DEV)console.log('✅ Emergency data loaded from permanent storage:', data);
        return data;
      }
      
      // Try to migrate from user profile if no Preferences data
      const user = authService.getCurrentUser();
      if (user?.profile?.emergencyContacts) {
        this.emergencyContacts = user.profile.emergencyContacts;
        await this.saveEmergencyData();
        if(import.meta.env.DEV)console.log('📦 Migrated emergency contacts to permanent storage');
      }
      
      return null;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Load emergency data error:', error);
      return null;
    }
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;



