const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920165-nativeFallDetectionService.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css","assets/chunk-1767948920261-backgroundRunnerService.js"])))=>i.map(i=>d[i]);
import { G as Geolocation, a as authService, H as Haptics, I as ImpactStyle, L as LocalNotifications, C as Capacitor, S as Share, _ as __vitePreload, D as motionListenerService, P as Preferences } from "./entry-1767948920134-index.js";
const getCurrentPosition = async () => {
  try {
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== "granted") {
      await Geolocation.requestPermissions();
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 1e4,
      maximumAge: 0
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: position.timestamp
    };
  } catch (error) {
    throw error;
  }
};
let watchId = null;
const startGPSTracking = async (callback) => {
  try {
    watchId = await Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 5e3,
      maximumAge: 0
    }, (position, err) => {
      if (err) {
        if (false) ;
        return;
      }
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        // meters/second
        timestamp: position.timestamp
      });
    });
    return watchId;
  } catch (error) {
    throw error;
  }
};
const stopGPSTracking = async () => {
  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }
};
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
    this.fallDetectionCallback = null;
    this.globalFallAlertCallback = null;
    this.initializeFallDetection();
  }
  // Initialize fall detection from saved state (called in constructor)
  async initializeFallDetection() {
    try {
      const savedData = await this.loadEmergencyData();
      if (savedData?.fallDetection && !this.fallDetectionActive) {
        if (false) ;
        setTimeout(() => {
          if (this.globalFallAlertCallback) {
            this.startFallDetection(this.globalFallAlertCallback);
          }
        }, 1e3);
      }
    } catch (error) {
    }
  }
  // Register global fall alert callback (called from NewDashboard)
  setGlobalFallAlertCallback(callback) {
    this.globalFallAlertCallback = callback;
    if (this.fallDetectionActive && !this.fallMotionSubscription) {
      this.startFallDetection(callback);
    }
  }
  // Initialize emergency monitoring
  async startMonitoring() {
    const user = authService.getCurrentUser();
    if (user) {
      await this.loadEmergencyData();
      this.healthBaseline = this.establishBaseline(user);
    }
    this.monitoring = true;
    try {
      this.currentLocation = await getCurrentPosition();
      if (false) ;
      this.gpsWatchId = await startGPSTracking((location) => {
        this.currentLocation = location;
        this.locationHistory.push({
          ...location,
          timestamp: Date.now()
        });
        if (this.locationHistory.length > 100) {
          this.locationHistory.shift();
        }
      });
    } catch (error) {
      alert("⚠️ Unable to access GPS. Emergency location sharing may be limited.");
    }
    this.monitoringInterval = setInterval(() => {
      this.checkForEmergencies();
    }, 5 * 60 * 1e3);
  }
  // Stop monitoring
  async stopMonitoring() {
    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.gpsWatchId) {
      await stopGPSTracking();
      this.gpsWatchId = null;
    }
  }
  // Establish baseline health metrics
  establishBaseline(user) {
    const stats = user?.stats || {};
    user?.profile || {};
    const totalDays = stats.totalDays || 0;
    const totalSteps = stats.totalSteps || 0;
    const avgSteps = totalDays > 0 ? totalSteps / totalDays : 5e3;
    return {
      avgDailySteps: avgSteps,
      normalActivityPattern: this.calculateActivityPattern(stats),
      typicalHeartRate: 70,
      // Would come from wearable
      normalSleepHours: 7
    };
  }
  // Calculate normal activity pattern
  calculateActivityPattern(stats) {
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
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const todaySteps = user.stats.dailySteps?.[today] || 0;
    return {
      stepsToday: todaySteps,
      lastActiveTime: user.profile.lastActive || /* @__PURE__ */ new Date(),
      recentFoodLog: user.profile.foodLog?.slice(-5) || [],
      recentSymptoms: user.profile.symptomLog?.slice(-3) || []
    };
  }
  // Detect health anomalies
  detectAnomalies(metrics) {
    const anomalies = [];
    const hoursSinceActive = (/* @__PURE__ */ new Date() - new Date(metrics.lastActiveTime)) / (1e3 * 60 * 60);
    if (hoursSinceActive > 24) {
      anomalies.push({
        type: "inactivity",
        severity: "high",
        message: "No activity detected for 24+ hours",
        action: "check-welfare"
      });
    }
    const recentDangerFoods = metrics.recentFoodLog.filter((f) => f.safety === "danger");
    const recentSevereSymptoms = metrics.recentSymptoms.filter((s) => s.severity === "severe");
    if (recentDangerFoods.length > 0 && recentSevereSymptoms.length > 0) {
      anomalies.push({
        type: "allergic-reaction",
        severity: "critical",
        message: "Possible severe allergic reaction",
        action: "call-ambulance"
      });
    }
    if (this.healthBaseline && metrics.stepsToday < this.healthBaseline.avgDailySteps * 0.2) {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour > 12) {
        anomalies.push({
          type: "unusual-inactivity",
          severity: "medium",
          message: "Unusual lack of movement detected",
          action: "send-alert"
        });
      }
    }
    return anomalies;
  }
  // Handle emergency situation
  async handleEmergency(anomalies) {
    const criticalAnomaly = anomalies.find((a) => a.severity === "critical");
    if (criticalAnomaly) {
      await this.triggerEmergencyProtocol(criticalAnomaly);
    } else {
      await this.sendWarningNotification(anomalies);
    }
  }
  // Full emergency protocol
  async triggerEmergencyProtocol(anomaly) {
    await this.emergencyHapticPattern();
    await this.sendEmergencyNotification(anomaly);
    await this.alertEmergencyContacts(anomaly);
    const medicalPackage = await this.prepareMedicalData();
    if (anomaly.action === "call-ambulance") {
      await this.simulateEmergencyCall(medicalPackage);
    }
  }
  // Emergency haptic pattern
  async emergencyHapticPattern() {
    for (let i = 0; i < 5; i++) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  // Send emergency notification
  async sendEmergencyNotification(anomaly) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: "🚨 EMERGENCY ALERT",
          body: anomaly.message + " - Emergency contacts notified",
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1e3) },
          sound: "default",
          attachments: null,
          actionTypeId: "emergency",
          extra: { anomaly }
        }]
      });
    } catch (error) {
    }
  }
  // Alert emergency contacts
  async alertEmergencyContacts(anomaly) {
    const user = authService.getCurrentUser();
    const contacts = user?.profile?.emergencyContacts || [];
    for (const contact of contacts) {
    }
    return {
      success: true,
      contactsAlerted: contacts.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // Prepare medical data package
  async prepareMedicalData() {
    const user = authService.getCurrentUser();
    if (!user) return null;
    let currentGPS = this.currentLocation;
    if (!currentGPS) {
      try {
        currentGPS = await getCurrentPosition();
      } catch (error) {
        currentGPS = { latitude: 0, longitude: 0, accuracy: -1 };
      }
    }
    return {
      patientInfo: {
        name: user.name,
        age: user.profile.age,
        bloodType: user.profile.bloodType || "Unknown",
        weight: user.profile.weight,
        height: user.profile.height
      },
      allergens: user.profile.allergens || [],
      medications: user.profile.medications || [],
      medicalConditions: user.profile.medicalConditions || [],
      emergencyContacts: user.profile.emergencyContacts || [],
      recentFoodLog: user.profile.foodLog?.slice(-10) || [],
      recentSymptoms: user.profile.symptomLog?.slice(-5) || [],
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      location: {
        latitude: currentGPS.latitude,
        longitude: currentGPS.longitude,
        accuracy: currentGPS.accuracy,
        altitude: currentGPS.altitude,
        googleMapsUrl: `https://www.google.com/maps?q=${currentGPS.latitude},${currentGPS.longitude}`,
        address: await this.reverseGeocode(currentGPS.latitude, currentGPS.longitude)
      },
      locationHistory: this.locationHistory.slice(-10)
      // Last 10 locations for movement tracking
    };
  }
  // REAL emergency call via native phone API
  async simulateEmergencyCall(medicalData) {
    const results = {
      success: true,
      callPlaced: false,
      contactsAlerted: 0,
      locationShared: false,
      medicalDataShared: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const emergencyNumber = "999";
      if (Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios") {
        window.open(`tel:${emergencyNumber}`, "_system");
        if (false) ;
        results.callPlaced = true;
      } else {
        if (false) ;
      }
    } catch (error) {
    }
    await this.shareLocationWithContacts(medicalData);
    results.locationShared = true;
    results.contactsAlerted = medicalData.emergencyContacts.length;
    const emergencyRecord = {
      id: Date.now(),
      type: "emergency_call",
      medicalData,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      location: medicalData.location
    };
    const history = JSON.parse(localStorage.getItem("emergencyHistory") || "[]");
    history.push(emergencyRecord);
    localStorage.setItem("emergencyHistory", JSON.stringify(history));
    return results;
  }
  // Share location with emergency contacts using native Share API
  async shareLocationWithContacts(medicalData) {
    const { location, patientInfo, emergencyContacts } = medicalData;
    if (!location || !location.latitude) {
      return;
    }
    const shareText = `🚨 EMERGENCY ALERT from ${patientInfo.name}

Location: ${location.googleMapsUrl}
Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
Accuracy: ±${Math.round(location.accuracy)}m
Time: ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}

Medical Info:
Blood Type: ${patientInfo.bloodType}
Age: ${patientInfo.age}
Allergens: ${medicalData.allergens.join(", ") || "None"}

This is an automated emergency alert from WellnessAI app.`;
    try {
      await Share.share({
        title: "🚨 Emergency Location Share",
        text: shareText,
        url: location.googleMapsUrl,
        dialogTitle: "Share Emergency Location"
      });
      if (false) ;
      if (false) ;
    } catch (error) {
    }
  }
  // Reverse geocode GPS coordinates to human-readable address
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "WellnessAI-EmergencyApp/1.0"
          }
        }
      );
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }
  // Send warning notification (non-critical)
  async sendWarningNotification(anomalies) {
    const message = anomalies.map((a) => a.message).join(". ");
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: "⚠️ Health Warning",
          body: message,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1e3) },
          sound: "default"
        }]
      });
    } catch (error) {
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
    this.emergencyContacts = contacts;
    await this.saveEmergencyData();
    return { success: true };
  }
  // Manual emergency trigger
  async triggerManualEmergency() {
    const anomaly = {
      type: "manual-trigger",
      severity: "critical",
      message: "User manually triggered emergency alert",
      action: "call-ambulance"
    };
    await this.triggerEmergencyProtocol(anomaly);
  }
  // Share current location with someone (non-emergency)
  async shareCurrentLocation() {
    try {
      if (false) ;
      const location = await getCurrentPosition();
      const user = authService.getCurrentUser();
      if (false) ;
      const shareText = `📍 Live location from ${user?.profile?.fullName || user?.name || "WellnessAI user"}

Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}
Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
Accuracy: ±${Math.round(location.accuracy)}m
Time: ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}`;
      await Share.share({
        title: "📍 My Current Location",
        text: shareText,
        url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        dialogTitle: "Share My Location"
      });
      return { success: true, location };
    } catch (error) {
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
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
        try {
          const nativeFallService = (await __vitePreload(async () => {
            const { default: __vite_default__ } = await import("./chunk-1767948920165-nativeFallDetectionService.js");
            return { default: __vite_default__ };
          }, true ? __vite__mapDeps([0,1,2]) : void 0)).default;
          if (window.AndroidFallDetection) {
            if (false) ;
            await nativeFallService.start();
            nativeFallService.addListener((fallData) => {
              if (false) ;
              this.handleFallDetected(onFallDetected);
            });
            this.fallDetectionActive = true;
            this.fallDetectionCallback = onFallDetected;
            await this.saveEmergencyData();
            if (false) ;
            return { success: true, native: true };
          }
        } catch (nativeError) {
          if (false) ;
        }
      }
      if (false) ;
      const backgroundRunnerService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./chunk-1767948920261-backgroundRunnerService.js");
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([3,1,2]) : void 0)).default;
      await backgroundRunnerService.start();
      if (false) ;
      this.fallDetectionActive = true;
      this.fallDetectionCallback = onFallDetected;
      await this.saveEmergencyData();
      if (false) ;
      this.fallMotionSubscription = await motionListenerService.subscribe((event) => {
        if (!this.fallDetectionActive) return;
        const accel = event.accelerationIncludingGravity || event.acceleration;
        if (!accel) {
          if (false) ;
          return;
        }
        const { x, y, z } = accel;
        const totalAccel = Math.sqrt(x * x + y * y + z * z);
        if (!this.lastAccelLog || Date.now() - this.lastAccelLog > 2e3) {
          if (false) ;
          this.lastAccelLog = Date.now();
        }
        if (totalAccel > 25) {
          if (false) ;
          this.handleFallDetected(this.fallDetectionCallback);
        }
      }, "FallDetection");
      return { success: true };
    } catch (error) {
      alert("⚠️ Fall detection requires motion sensor access");
      return { success: false, error };
    }
  }
  // Stop fall detection
  async stopFallDetection() {
    try {
      if (Capacitor.isNativePlatform() && window.AndroidFallDetection) {
        try {
          const nativeFallService = (await __vitePreload(async () => {
            const { default: __vite_default__ } = await import("./chunk-1767948920165-nativeFallDetectionService.js");
            return { default: __vite_default__ };
          }, true ? __vite__mapDeps([0,1,2]) : void 0)).default;
          await nativeFallService.stop();
          if (false) ;
        } catch (error) {
          if (false) ;
        }
      }
      if (this.fallMotionSubscription) {
        this.fallMotionSubscription.unsubscribe();
        this.fallMotionSubscription = null;
      }
      this.fallDetectionActive = false;
      await this.saveEmergencyData();
      if (false) ;
    } catch (error) {
    }
  }
  // Handle fall detected - just alert, don't auto-call
  async handleFallDetected(callback) {
    if (this.fallAlertActive) return;
    this.fallAlertActive = true;
    this.playEmergencyAlarm();
    await this.emergencyHapticPattern();
    const alertCallback = this.globalFallAlertCallback || callback;
    if (alertCallback) {
      alertCallback({
        type: "fall",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        location: this.currentLocation
      });
    }
    setTimeout(() => {
      this.fallAlertActive = false;
    }, 1e4);
  }
  // Call primary emergency contact
  async callPrimaryContact() {
    const primaryContact = this.emergencyContacts.find((c) => c.primary);
    if (!primaryContact) {
      alert("⚠️ No primary emergency contact set. Please add one in settings.");
      return;
    }
    try {
      if (Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios") {
        window.open(`tel:${primaryContact.phone}`, "_system");
        if (false) ;
      } else {
        if (false) ;
        alert(`📞 Calling ${primaryContact.name} at ${primaryContact.phone}`);
      }
    } catch (error) {
      alert("Failed to place call: " + error.message);
    }
  }
  // Call 999 emergency services
  async call999() {
    try {
      if (Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios") {
        window.open("tel:999", "_system");
        if (false) ;
      } else {
        if (false) ;
        alert("📞 Calling 999");
      }
    } catch (error) {
      alert("Failed to place emergency call: " + error.message);
    }
  }
  // Play emergency alarm sound
  playEmergencyAlarm() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      let toggle = true;
      const sirenInterval = setInterval(() => {
        oscillator.frequency.value = toggle ? 800 : 1e3;
        toggle = !toggle;
      }, 500);
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      oscillator.start();
      this.alarmAudio = { oscillator, gainNode, interval: sirenInterval, context: audioContext };
      if (false) ;
    } catch (error) {
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
        if (false) ;
      } catch (error) {
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
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
      };
      await Preferences.set({
        key: "emergency_data",
        value: JSON.stringify(emergencyData)
      });
      if (false) ;
    } catch (error) {
    }
  }
  // Load emergency data from permanent storage
  async loadEmergencyData() {
    try {
      const { value } = await Preferences.get({ key: "emergency_data" });
      if (value) {
        const data = JSON.parse(value);
        this.emergencyContacts = data.contacts || [];
        this.monitoring = data.monitoring || false;
        this.fallDetectionActive = data.fallDetection || false;
        if (false) ;
        return data;
      }
      const user = authService.getCurrentUser();
      if (user?.profile?.emergencyContacts) {
        this.emergencyContacts = user.profile.emergencyContacts;
        await this.saveEmergencyData();
        if (false) ;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
const emergencyService = new EmergencyService();
export {
  emergencyService as default,
  emergencyService
};
