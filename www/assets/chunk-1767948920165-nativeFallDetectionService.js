import { C as Capacitor } from "./entry-1767948920134-index.js";
class NativeFallDetectionService {
  constructor() {
    this.isRunning = false;
    this.listeners = [];
    this.pollInterval = null;
  }
  /**
   * Start the native fall detection foreground service
   * Shows persistent notification and monitors for falls 24/7
   */
  async start() {
    try {
      console.log("🚀 Starting native fall detection service...");
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
        throw new Error("Fall detection only works on Android");
      }
      if (!window.AndroidFallDetection) {
        console.error("❌ AndroidFallDetection WebView bridge not found");
        throw new Error("AndroidFallDetection bridge not available. App may need restart.");
      }
      console.log("✅ AndroidFallDetection bridge found, starting service...");
      const resultJson = window.AndroidFallDetection.startService();
      const result = JSON.parse(resultJson);
      console.log("📱 startService result:", result);
      if (result && result.started) {
        this.isRunning = true;
        console.log("✅ NATIVE FALL DETECTION SERVICE STARTED!");
        console.log("   → Persistent notification will appear");
        console.log("   → Monitors falls even when app is CLOSED");
        console.log("   → Service runs 24/7");
        this.startPolling();
        return true;
      }
      console.warn("⚠️ Service start failed:", result.error || "Unknown error");
      throw new Error(result.error || "Failed to start service");
    } catch (error) {
      console.error("❌ Failed to start native fall detection service:", error);
      throw error;
    }
  }
  /**
   * Stop the foreground service
   */
  async stop() {
    try {
      if (window.AndroidFallDetection) {
        const resultJson = window.AndroidFallDetection.stopService();
        const result = JSON.parse(resultJson);
        this.isRunning = false;
        this.stopPolling();
        console.log("Fall detection service stopped");
        return result.stopped;
      }
      return false;
    } catch (error) {
      console.error("Error stopping fall detection service:", error);
      return false;
    }
  }
  /**
   * Get current fall status from the service
   */
  async getFallStatus() {
    try {
      if (window.AndroidFallDetection) {
        const resultJson = window.AndroidFallDetection.getFallStatus();
        const result = JSON.parse(resultJson);
        return result;
      }
      return { fallDetected: false };
    } catch (error) {
      console.error("Error getting fall status:", error);
      return { fallDetected: false };
    }
  }
  /**
   * Reset fall detection flag
   */
  async resetFallFlag() {
    try {
      if (window.AndroidFallDetection) {
        const resultJson = window.AndroidFallDetection.resetFallFlag();
        const result = JSON.parse(resultJson);
        return result.reset;
      }
      return false;
    } catch (error) {
      console.error("Error resetting fall flag:", error);
      return false;
    }
  }
  /**
   * Poll for fall events every second
   */
  startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(async () => {
      const status = await this.getFallStatus();
      if (status.fallDetected) {
        console.warn("⚠️ FALL DETECTED by native service!", status);
        this.notifyListeners(status);
        await this.resetFallFlag();
      }
    }, 1e3);
  }
  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  /**
   * Add listener for fall events
   */
  addListener(callback) {
    this.listeners.push(callback);
  }
  /**
   * Notify all listeners of fall detection
   */
  notifyListeners(fallData) {
    this.listeners.forEach((cb) => {
      try {
        cb(fallData);
      } catch (error) {
        console.error("Error in fall listener:", error);
      }
    });
  }
  /**
   * Check if service is running
   */
  isActive() {
    return this.isRunning;
  }
}
const nativeFallDetectionService = new NativeFallDetectionService();
export {
  nativeFallDetectionService as default,
  nativeFallDetectionService
};
