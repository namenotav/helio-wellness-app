import { C as Capacitor, r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import { emergencyService } from "./chunk-1767948920147-emergencyService.js";
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
      console.log("🚀 Starting native health monitoring service via WebView bridge...");
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
        throw new Error("Health monitoring only works on Android");
      }
      if (!window.AndroidHealthMonitoring) {
        console.error("❌ AndroidHealthMonitoring WebView bridge not found");
        throw new Error("AndroidHealthMonitoring bridge not available. App may need restart.");
      }
      console.log("✅ AndroidHealthMonitoring bridge found, starting service...");
      const resultJson = window.AndroidHealthMonitoring.startService();
      const result = JSON.parse(resultJson);
      console.log("📱 startService result:", result);
      if (result && result.started) {
        this.isRunning = true;
        console.log("✅ NATIVE HEALTH MONITORING SERVICE STARTED!");
        console.log("   → Persistent notification will appear");
        console.log("   → Monitors: Heart Rate, Movement, Location, Falls");
        console.log("   → Service runs 24/7 even when app closed");
        this.startStatusPolling();
        this.startAlertPolling();
        return true;
      }
      console.warn("⚠️ Service start failed:", result.error || "Unknown error");
      throw new Error(result.error || "Failed to start service");
    } catch (error) {
      console.error("❌ Failed to start native health monitoring service:", error);
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
        console.log("Health monitoring service stopped");
        return result.stopped;
      }
      return false;
    } catch (error) {
      console.error("Error stopping health monitoring service:", error);
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
      console.error("Error getting health status:", error);
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
        const alert2 = JSON.parse(alertJson);
        if (alert2.alertTriggered) {
          console.warn("⚠️ HEALTH ALERT:", alert2);
          this.handleAlert(alert2);
        }
        return alert2;
      }
      return {};
    } catch (error) {
      console.error("Error checking alerts:", error);
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
        console.log("Alert dismissed:", result);
        return result.dismissed;
      }
      return false;
    } catch (error) {
      console.error("Error dismissing alert:", error);
      return false;
    }
  }
  /**
   * Handle health alert (trigger callback)
   */
  handleAlert(alert2) {
    this.listeners.forEach((callback) => {
      try {
        callback({
          type: "health",
          alertType: alert2.alertType,
          message: alert2.alertMessage,
          timestamp: alert2.alertTimestamp
        });
      } catch (error) {
        console.error("Error in health alert listener:", error);
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
      if (status.heartRateAvailable && status.heartRate !== this.currentStatus.heartRate) {
        console.log("💓 Heart Rate:", status.heartRate, "bpm");
      }
      if (status.stillnessMinutes > 0 && status.stillnessMinutes % 30 === 0) {
        console.log("⏱️ Stillness:", status.stillnessMinutes, "minutes");
      }
    }, 5e3);
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
    }, 2e3);
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
    this.listeners = this.listeners.filter((cb) => cb !== callback);
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
      heartRate: status.heartRateAvailable ? `${Math.round(status.heartRate)} bpm` : "Not available",
      heartRateAvailable: status.heartRateAvailable || false,
      // Movement
      lastMovement: status.lastMovementTime ? new Date(status.lastMovementTime).toLocaleTimeString() : "Unknown",
      stillnessMinutes: status.stillnessMinutes || 0,
      stillnessHours: Math.floor((status.stillnessMinutes || 0) / 60),
      isMoving: status.isMoving || false,
      // Location
      location: status.locationAvailable ? `${status.latitude.toFixed(6)}, ${status.longitude.toFixed(6)}` : "GPS not available",
      locationAvailable: status.locationAvailable || false,
      locationStuckHours: status.locationStuckHours || 0,
      // Overall
      monitoring: this.isRunning,
      lastUpdate: (/* @__PURE__ */ new Date()).toLocaleTimeString()
    };
  }
}
const healthMonitoringService = new HealthMonitoringService();
function EmergencyPanel({ onClose }) {
  const [monitoring, setMonitoring] = reactExports.useState(false);
  const [status, setStatus] = reactExports.useState(null);
  const [contacts, setContacts] = reactExports.useState([]);
  const [newContact, setNewContact] = reactExports.useState({ name: "", phone: "", relationship: "", primary: false });
  const [showAddContact, setShowAddContact] = reactExports.useState(false);
  const [triggeringEmergency, setTriggeringEmergency] = reactExports.useState(false);
  const [locationStatus, setLocationStatus] = reactExports.useState(null);
  const [sharingLocation, setSharingLocation] = reactExports.useState(false);
  const [fallDetectionEnabled, setFallDetectionEnabled] = reactExports.useState(false);
  const [healthMonitoringEnabled, setHealthMonitoringEnabled] = reactExports.useState(false);
  const [healthStatus, setHealthStatus] = reactExports.useState({});
  const [countdown, setCountdown] = reactExports.useState(null);
  const [playingAlarm, setPlayingAlarm] = reactExports.useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = reactExports.useState(false);
  const [permissionChecked, setPermissionChecked] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadEmergencyData();
  }, []);
  const loadEmergencyData = async () => {
    const savedData = await emergencyService.loadEmergencyData();
    const service = emergencyService;
    setMonitoring(service.monitoring);
    setStatus(service.monitoringStatus);
    setContacts(service.emergencyContacts || []);
    setLocationStatus(service.getLocationStatus());
    setFallDetectionEnabled(service.fallDetectionActive || false);
    if (savedData?.monitoring && !service.monitoring) {
      await emergencyService.startMonitoring();
      setMonitoring(true);
      setTimeout(() => {
        setLocationStatus(emergencyService.getLocationStatus());
      }, 1e3);
    }
    if (savedData?.fallDetection && !service.fallDetectionActive) {
      emergencyService.startFallDetection(null);
      setFallDetectionEnabled(true);
    }
    if (healthMonitoringService.isActive()) {
      setHealthMonitoringEnabled(true);
      updateHealthStatus();
    }
  };
  const updateHealthStatus = async () => {
    const status2 = healthMonitoringService.getFormattedStatus();
    setHealthStatus(status2);
  };
  reactExports.useEffect(() => {
    let healthPollInterval;
    if (healthMonitoringEnabled) {
      healthPollInterval = setInterval(updateHealthStatus, 5e3);
      updateHealthStatus();
    }
    return () => {
      if (healthPollInterval) clearInterval(healthPollInterval);
    };
  }, [healthMonitoringEnabled]);
  const handleToggleMonitoring = async () => {
    try {
      if (monitoring) {
        await emergencyService.stopMonitoring();
      } else {
        await emergencyService.startMonitoring();
      }
      setMonitoring(!monitoring);
      await emergencyService.saveEmergencyData();
      setTimeout(() => {
        setLocationStatus(emergencyService.getLocationStatus());
      }, 1e3);
    } catch (error) {
      alert("⚠️ Error: " + error.message);
    }
  };
  const handleAddContact = async () => {
    if (newContact.name && newContact.phone) {
      await emergencyService.addEmergencyContact(newContact);
      await loadEmergencyData();
      setNewContact({ name: "", phone: "", relationship: "", primary: false });
      setShowAddContact(false);
    }
  };
  const handleTriggerEmergency = async () => {
    setPlayingAlarm(true);
    emergencyService.playEmergencyAlarm();
    let timeLeft = 5;
    setCountdown(timeLeft);
    const countdownInterval = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        executeEmergency();
      }
    }, 1e3);
    const cancelCountdown = () => {
      clearInterval(countdownInterval);
      setCountdown(null);
      setPlayingAlarm(false);
      emergencyService.stopEmergencyAlarm();
    };
    window.emergencyCancelCountdown = cancelCountdown;
  };
  const executeEmergency = async () => {
    setCountdown(null);
    setTriggeringEmergency(true);
    try {
      await emergencyService.triggerManualEmergency();
      setPlayingAlarm(false);
      alert("🚨 Emergency protocol activated!\n• Calling 999\n• Contacts notified\n• Location shared");
    } catch (error) {
      setPlayingAlarm(false);
      emergencyService.stopEmergencyAlarm();
      alert("Failed to trigger emergency: " + error.message);
    }
    setTriggeringEmergency(false);
  };
  const handleShareLocation = async () => {
    setSharingLocation(true);
    try {
      if (false) ;
      const result = await emergencyService.shareCurrentLocation();
      if (result.success) {
        if (false) ;
        setLocationStatus({
          tracking: locationStatus?.tracking || false,
          currentLocation: result.location,
          lastUpdate: /* @__PURE__ */ new Date()
        });
      }
    } catch (error) {
      const errorMsg = error.message.includes("denied") ? "Location permission denied. Please enable GPS in your device settings." : error.message.includes("timeout") ? "GPS timeout. Make sure location services are enabled and try again." : "Failed to get location: " + error.message;
      alert(errorMsg);
    }
    setSharingLocation(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "emergency-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "emergency-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "emergency-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "emergency-title", children: "🚨 Emergency Assistant" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "emergency-disclaimer", children: "⚠️ Requires manual activation. Not a medical device. Not a substitute for emergency services." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `monitoring-status ${monitoring ? "active" : "inactive"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-indicator", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-text", children: monitoring ? "✓ 24/7 Monitoring Active" : "⚠️ Monitoring Disabled" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `toggle-monitoring ${monitoring ? "active" : ""}`,
          onClick: handleToggleMonitoring,
          children: monitoring ? "Disable" : "Enable"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fall-detection-section", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fall-detection-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fall-icon", children: "🤕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fall-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Fall Detection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fall-description", children: "Automatically detect hard falls using phone sensors" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `toggle-fall-detection ${fallDetectionEnabled ? "active" : ""}`,
          onClick: async () => {
            if (fallDetectionEnabled) {
              await emergencyService.stopFallDetection();
              setFallDetectionEnabled(false);
            } else {
              if (window.AndroidPermission) {
                const isAndroid14Plus = window.AndroidPermission.isAndroid14Plus();
                const canUseFullScreen = window.AndroidPermission.canUseFullScreenIntent();
                if (isAndroid14Plus && !canUseFullScreen && !permissionChecked) {
                  setShowPermissionDialog(true);
                  setPermissionChecked(true);
                  return;
                }
              }
              await emergencyService.startFallDetection(null);
              setFallDetectionEnabled(true);
            }
            await emergencyService.saveEmergencyData();
          },
          children: fallDetectionEnabled ? "Disable" : "Enable"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fall-detection-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fall-detection-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fall-icon", children: "🩺" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fall-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "24/7 Health Monitoring" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fall-description", children: "Monitor heart rate, movement, location for emergencies" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `toggle-fall-detection ${healthMonitoringEnabled ? "active" : ""}`,
            onClick: async () => {
              try {
                if (healthMonitoringEnabled) {
                  await healthMonitoringService.stop();
                  setHealthMonitoringEnabled(false);
                } else {
                  await healthMonitoringService.start();
                  setHealthMonitoringEnabled(true);
                  updateHealthStatus();
                }
              } catch (error) {
                console.error("Health monitoring toggle error:", error);
                alert("⚠️ Error: " + error.message);
              }
            },
            children: healthMonitoringEnabled ? "Disable" : "Enable"
          }
        )
      ] }),
      healthMonitoringEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-status-display", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-metric", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-label", children: "💓 Heart Rate:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-value", children: healthStatus.heartRate || "N/A" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-metric", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-label", children: "🏃 Last Movement:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-value", children: healthStatus.lastMovement || "N/A" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-metric", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-label", children: "⏱️ Stillness:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-value", children: healthStatus.stillnessHours > 0 ? `${healthStatus.stillnessHours}h ${healthStatus.stillnessMinutes % 60}m` : `${healthStatus.stillnessMinutes || 0}m` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-metric", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-label", children: "📍 Location:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "metric-value", children: healthStatus.locationAvailable ? "✓ Tracking" : "Not available" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-features", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-badge", children: "✓ Heart Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-badge", children: "✓ Movement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-badge", children: "✓ Falls" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-badge", children: "✓ Location" })
        ] })
      ] })
    ] }),
    showPermissionDialog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "permission-dialog-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "permission-dialog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🔔 Enable Full-Screen Alerts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "permission-message", children: 'To show emergency alerts over the lock screen when a fall is detected, please enable "Display over other apps" permission.' }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "permission-steps", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step", children: '1️⃣ Tap "Open Settings" below' }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step", children: '2️⃣ Enable "Display over lock screen"' }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step", children: '3️⃣ Return here and tap "Enable" again' })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "permission-buttons", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "permission-btn open-settings",
            onClick: () => {
              if (window.AndroidPermission) {
                window.AndroidPermission.requestFullScreenIntentPermission();
              }
              setShowPermissionDialog(false);
            },
            children: "📱 Open Settings"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "permission-btn skip",
            onClick: async () => {
              setShowPermissionDialog(false);
              await emergencyService.startFallDetection(null);
              setFallDetectionEnabled(true);
              await emergencyService.saveEmergencyData();
            },
            children: "Skip (Notification Only)"
          }
        )
      ] })
    ] }) }),
    locationStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `location-status ${locationStatus.tracking ? "tracking" : "inactive"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "location-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "location-icon", children: "📍" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "location-text", children: locationStatus.tracking ? "GPS Tracking Active" : "Location Ready - Tap to Share" })
      ] }),
      locationStatus.currentLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "location-details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "location-coord", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Location:" }),
          " ",
          locationStatus.currentLocation.latitude.toFixed(6),
          ", ",
          locationStatus.currentLocation.longitude.toFixed(6)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "location-accuracy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Accuracy:" }),
          " ±",
          Math.round(locationStatus.currentLocation.accuracy),
          "m"
        ] }),
        locationStatus.lastUpdate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "location-time", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Last Update:" }),
          " ",
          new Date(locationStatus.lastUpdate).toLocaleTimeString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "share-location-btn",
          onClick: handleShareLocation,
          disabled: sharingLocation,
          children: sharingLocation ? "📍 Getting Location..." : "📍 Share My Location"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "emergency-trigger", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "panic-button",
          onClick: handleTriggerEmergency,
          disabled: triggeringEmergency,
          children: countdown ? `🚨 CALLING IN ${countdown}...` : triggeringEmergency ? "🚨 CALLING 999..." : "🆘 EMERGENCY - CALL 999"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "panic-help", children: "Press and hold to call 999 emergency services. Location will be shared with your contacts." })
    ] }),
    monitoring && status && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitoring-info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📊 Health Monitoring" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "info-label", children: "Last Check:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "info-value", children: new Date(status.lastCheck).toLocaleTimeString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "info-label", children: "Check Interval:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "info-value", children: "5 minutes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "info-label", children: "Anomalies:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "info-value", children: status.anomaliesDetected || 0 })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "emergency-contacts", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "contacts-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "👥 Emergency Contacts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "add-contact-btn",
            onClick: () => setShowAddContact(!showAddContact),
            children: [
              showAddContact ? "✕" : "+",
              " ",
              showAddContact ? "Cancel" : "Add"
            ]
          }
        )
      ] }),
      showAddContact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "add-contact-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Name",
            value: newContact.name,
            onChange: (e) => setNewContact({ ...newContact, name: e.target.value }),
            className: "contact-input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "tel",
            placeholder: "Phone",
            value: newContact.phone,
            onChange: (e) => setNewContact({ ...newContact, phone: e.target.value }),
            className: "contact-input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Relationship",
            value: newContact.relationship,
            onChange: (e) => setNewContact({ ...newContact, relationship: e.target.value }),
            className: "contact-input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "primary-checkbox", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: newContact.primary,
              onChange: (e) => setNewContact({ ...newContact, primary: e.target.checked })
            }
          ),
          "Primary Contact"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "save-contact-btn", onClick: handleAddContact, children: "✓ Save Contact" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contacts-list", children: contacts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-contacts", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "⚠️ No emergency contacts added" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "help-text", children: "Add at least one contact for emergency alerts" })
      ] }) : contacts.map((contact, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `contact-card ${contact.primary ? "primary" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contact-icon", children: contact.primary ? "⭐" : "👤" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "contact-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contact-name", children: contact.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contact-phone", children: contact.phone }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contact-relationship", children: contact.relationship })
        ] }),
        contact.primary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "primary-badge", children: "Primary" })
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "emergency-features", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "🔍" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Detects unusual health patterns" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "📱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Auto-alerts emergency contacts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "🚑" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Sends medical data to ambulance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "📍" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Shares your location instantly" })
      ] })
    ] })
  ] }) });
}
export {
  EmergencyPanel as default
};
