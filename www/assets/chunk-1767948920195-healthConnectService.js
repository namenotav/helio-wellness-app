import { d as registerPlugin } from "./entry-1767948920134-index.js";
const HealthConnect = registerPlugin("HealthConnect");
const sdkStatusLabels = {
  0: "SDK_AVAILABLE",
  1: "SDK_UNAVAILABLE",
  2: "SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED",
  3: "SDK_UNAVAILABLE_PROVIDER_INSTALLATION_REQUIRED",
  4: "SDK_UNAVAILABLE_PROVIDER_UPDATING",
  5: "SDK_UNAVAILABLE_DEVICE_NOT_SUPPORTED"
};
class HealthConnectService {
  constructor() {
    this.isInitialized = false;
    this.isAvailable = false;
    this.hasPermissions = false;
    this.sdkStatus = null;
  }
  /**
   * Initialize Health Connect and check availability
   */
  async initialize() {
    if (this.isInitialized) return true;
    try {
      const availability = await this.checkAvailability();
      this.isAvailable = availability.available;
      this.sdkStatus = availability.sdkStatus;
      if (this.isAvailable) {
        const perms = await HealthConnect.hasPermissions();
        this.hasPermissions = perms.hasAllPermissions;
      }
      this.isInitialized = true;
      console.log("✅ Health Connect initialized:", {
        available: this.isAvailable,
        hasPermissions: this.hasPermissions
      });
      return this.isAvailable;
    } catch (error) {
      console.error("❌ Health Connect initialization failed:", error);
      this.isAvailable = false;
      this.isInitialized = true;
      return false;
    }
  }
  /**
   * Check if Health Connect is available on this device
   */
  async checkAvailability() {
    try {
      const result = await HealthConnect.isAvailable();
      const availability = {
        available: !!result?.available,
        sdkStatus: typeof result?.sdkStatus === "number" ? result.sdkStatus : null,
        statusLabel: typeof result?.sdkStatus === "number" ? sdkStatusLabels[result.sdkStatus] || "SDK_STATUS_UNKNOWN" : null,
        error: null,
        raw: result ?? null
      };
      if (false) ;
      return availability;
    } catch (error) {
      console.error("❌ Failed to check Health Connect availability:", error);
      return {
        available: false,
        sdkStatus: null,
        statusLabel: "SDK_STATUS_ERROR",
        error: error?.message || String(error),
        raw: null
      };
    }
  }
  /**
   * Request permissions to read/write step data
   * Opens Health Connect settings
   */
  async requestPermissions() {
    try {
      await HealthConnect.openHealthConnectSettings();
      setTimeout(async () => {
        const perms = await HealthConnect.hasPermissions();
        this.hasPermissions = perms.hasAllPermissions;
        console.log("✅ Permissions updated:", perms);
      }, 1e3);
      return true;
    } catch (error) {
      console.error("❌ Failed to request permissions:", error);
      return false;
    }
  }
  /**
   * Get step count for a specific time range
   * @param {number} startTime - Start time in milliseconds (optional, defaults to today midnight)
   * @param {number} endTime - End time in milliseconds (optional, defaults to now)
   * @returns {Promise<number>} Total steps in the time range
   */
  async getSteps(startTime = null, endTime = null) {
    if (!this.isAvailable) {
      throw new Error("Health Connect not available");
    }
    if (!this.hasPermissions) {
      throw new Error("Health Connect permissions not granted");
    }
    try {
      const params = {};
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      const result = await HealthConnect.getSteps(params);
      return result.steps || 0;
    } catch (error) {
      console.error("❌ Failed to read steps from Health Connect:", error);
      throw error;
    }
  }
  /**
   * Get today's step count (from midnight to now)
   */
  async getTodaySteps() {
    const now = /* @__PURE__ */ new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return await this.getSteps(startOfDay.getTime(), now.getTime());
  }
  /**
   * Get steps for the last 7 days
   */
  async getWeeklySteps() {
    const now = /* @__PURE__ */ new Date();
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      try {
        const steps = await this.getSteps(startOfDay.getTime(), endOfDay.getTime());
        weeklyData.push({
          date: startOfDay.toISOString().split("T")[0],
          steps
        });
      } catch (error) {
        console.error(`❌ Failed to get steps for ${startOfDay}:`, error);
        weeklyData.push({
          date: startOfDay.toISOString().split("T")[0],
          steps: 0
        });
      }
    }
    return weeklyData;
  }
  /**
   * Check if user has granted all required permissions
   */
  async checkPermissions() {
    try {
      const perms = await HealthConnect.hasPermissions();
      this.hasPermissions = perms.hasAllPermissions;
      return perms;
    } catch (error) {
      console.error("❌ Failed to check permissions:", error);
      return { hasAllPermissions: false };
    }
  }
}
const healthConnectService = new HealthConnectService();
export {
  healthConnectService as default
};
