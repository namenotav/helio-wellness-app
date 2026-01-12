const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920196-index.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { C as Capacitor, _ as __vitePreload } from "./entry-1767948920134-index.js";
class GoogleFitService {
  constructor() {
    this.isAvailable = false;
    this.isInitialized = false;
    this.googleFit = null;
  }
  /**
   * Check if Google Fit is available on this device
   */
  async checkAvailability() {
    try {
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
        console.log("Google Fit only available on Android");
        return false;
      }
      const { GoogleFit } = await __vitePreload(async () => {
        const { GoogleFit: GoogleFit2 } = await import("./chunk-1767948920196-index.js");
        return { GoogleFit: GoogleFit2 };
      }, true ? __vite__mapDeps([0,1,2]) : void 0);
      this.googleFit = GoogleFit;
      this.isAvailable = true;
      console.log("✅ Google Fit available");
      return true;
    } catch (error) {
      console.log("Google Fit plugin not available:", error.message);
      return false;
    }
  }
  /**
   * Initialize Google Fit and request permissions
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log("Google Fit already initialized");
        return true;
      }
      const available = await this.checkAvailability();
      if (!available) {
        return false;
      }
      console.log("Requesting Google Fit permissions...");
      const result = await this.googleFit.requestPermissions({
        scopes: [
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.location.read",
          "https://www.googleapis.com/auth/fitness.body.read",
          "https://www.googleapis.com/auth/fitness.sleep.read"
        ]
      });
      if (result && result.granted) {
        this.isInitialized = true;
        console.log("✅ Google Fit permissions granted");
        return true;
      } else {
        console.log("❌ Google Fit permissions denied");
        return false;
      }
    } catch (error) {
      console.error("Error initializing Google Fit:", error);
      return false;
    }
  }
  /**
   * Get step count for today
   */
  async getTodaySteps() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error("Google Fit not initialized");
        }
      }
      const now = /* @__PURE__ */ new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const result = await this.googleFit.query({
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: "com.google.step_count.delta",
        limit: 1e3
      });
      let totalSteps = 0;
      if (result && result.buckets) {
        result.buckets.forEach((bucket) => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach((point) => {
              if (point.value && point.value.length > 0) {
                totalSteps += point.value[0].intVal || 0;
              }
            });
          }
        });
      }
      console.log(`📊 Google Fit: ${totalSteps} steps today`);
      return totalSteps;
    } catch (error) {
      console.error("Error getting steps from Google Fit:", error);
      return 0;
    }
  }
  /**
   * Get steps for a specific date range
   */
  async getStepsInRange(startDate, endDate) {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error("Google Fit not initialized");
        }
      }
      const result = await this.googleFit.query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataTypeName: "com.google.step_count.delta",
        limit: 1e3
      });
      let totalSteps = 0;
      if (result && result.buckets) {
        result.buckets.forEach((bucket) => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach((point) => {
              if (point.value && point.value.length > 0) {
                totalSteps += point.value[0].intVal || 0;
              }
            });
          }
        });
      }
      return totalSteps;
    } catch (error) {
      console.error("Error getting steps from Google Fit:", error);
      return 0;
    }
  }
  /**
   * Get distance traveled today (in meters)
   */
  async getTodayDistance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      const now = /* @__PURE__ */ new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const result = await this.googleFit.query({
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: "com.google.distance.delta",
        limit: 1e3
      });
      let totalDistance = 0;
      if (result && result.buckets) {
        result.buckets.forEach((bucket) => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach((point) => {
              if (point.value && point.value.length > 0) {
                totalDistance += point.value[0].fpVal || 0;
              }
            });
          }
        });
      }
      return totalDistance;
    } catch (error) {
      console.error("Error getting distance from Google Fit:", error);
      return 0;
    }
  }
  /**
   * Get calories burned today
   */
  async getTodayCalories() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      const now = /* @__PURE__ */ new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const result = await this.googleFit.query({
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: "com.google.calories.expended",
        limit: 1e3
      });
      let totalCalories = 0;
      if (result && result.buckets) {
        result.buckets.forEach((bucket) => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach((point) => {
              if (point.value && point.value.length > 0) {
                totalCalories += point.value[0].fpVal || 0;
              }
            });
          }
        });
      }
      return Math.round(totalCalories);
    } catch (error) {
      console.error("Error getting calories from Google Fit:", error);
      return 0;
    }
  }
  /**
   * Get heart rate data
   */
  async getHeartRate() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      const now = /* @__PURE__ */ new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1e3);
      const result = await this.googleFit.query({
        startDate: oneHourAgo.toISOString(),
        endDate: now.toISOString(),
        dataTypeName: "com.google.heart_rate.bpm",
        limit: 100
      });
      let latestHeartRate = 0;
      if (result && result.buckets) {
        result.buckets.forEach((bucket) => {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset[0].point.forEach((point) => {
              if (point.value && point.value.length > 0) {
                latestHeartRate = point.value[0].fpVal || 0;
              }
            });
          }
        });
      }
      return Math.round(latestHeartRate);
    } catch (error) {
      console.error("Error getting heart rate from Google Fit:", error);
      return 0;
    }
  }
  /**
   * Disconnect from Google Fit
   */
  async disconnect() {
    try {
      if (this.googleFit) {
        this.isInitialized = false;
        console.log("Google Fit disconnected");
      }
    } catch (error) {
      console.error("Error disconnecting Google Fit:", error);
    }
  }
}
const googleFitService = new GoogleFitService();
export {
  googleFitService as default
};
