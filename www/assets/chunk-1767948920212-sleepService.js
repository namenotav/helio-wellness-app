import { h as brainLearningService, f as firestoreService, a as authService } from "./entry-1767948920134-index.js";
class SleepService {
  constructor() {
    this.sleepLog = [];
  }
  /**
   * Initialize service and load data
   */
  async initialize() {
    await this.loadSleepLog();
  }
  /**
   * Log sleep data
   */
  async logSleep(sleepData) {
    try {
      if (this.sleepLog.length === 0) {
        await this.loadSleepLog();
      }
      const sleep = {
        ...sleepData,
        id: "sleep_" + Date.now(),
        timestamp: Date.now(),
        date: sleepData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
      this.sleepLog.push(sleep);
      await this.saveSleepLog();
      const bedtimeHour = sleepData.bedtime ? parseInt(sleepData.bedtime.split(":")[0]) : 22;
      const wakeTimeHour = sleepData.wakeTime ? parseInt(sleepData.wakeTime.split(":")[0]) : 6;
      await brainLearningService.trackSleep({
        bedtime: bedtimeHour,
        wakeTime: wakeTimeHour,
        duration: sleepData.duration || sleepData.hours || 8,
        quality: sleepData.quality || 7,
        energyNextDay: 7,
        // Can be updated from morning check-in
        mood: "rested",
        dreams: sleepData.dreams || false,
        interruptions: sleepData.interruptions || 0
      });
      const sleepQuality = sleepData.quality || 7;
      const sleepDuration = sleepData.duration || sleepData.hours || 8;
      const morningEnergy = Math.min(10, Math.max(1, Math.round((sleepQuality + sleepDuration) / 2)));
      await brainLearningService.trackEnergy(morningEnergy, {
        hoursSlept: sleepDuration,
        recentWorkout: false,
        stressLevel: sleepQuality > 6 ? 2 : 5
        // Good sleep = lower stress
      });
      if (false) ;
      return {
        success: true,
        sleep
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  /**
   * Get sleep log
   */
  getSleepLog(days = 30) {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1e3;
    return this.sleepLog.filter((s) => s.timestamp > cutoffDate);
  }
  /**
   * Get last night's sleep
   */
  getLastNightSleep() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
    return this.sleepLog.find((s) => s.date === today || s.date === yesterday);
  }
  /**
   * Delete a sleep entry
   */
  async deleteSleep(sleepId) {
    try {
      this.sleepLog = this.sleepLog.filter((s) => s.id !== sleepId);
      await this.saveSleepLog();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  /**
   * Save sleep log to triple storage
   */
  async saveSleepLog() {
    try {
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1e3;
      const recentSleep = this.sleepLog.filter((s) => s.timestamp > ninetyDaysAgo);
      this.sleepLog = recentSleep;
      localStorage.setItem("sleepLog", JSON.stringify(recentSleep));
      await firestoreService.save("sleepLog", recentSleep, authService.getCurrentUser()?.uid);
      if (false) ;
    } catch (error) {
    }
  }
  /**
   * Load sleep log from storage
   */
  async loadSleepLog() {
    try {
      const log = await firestoreService.get("sleepLog", authService.getCurrentUser()?.uid);
      if (log && Array.isArray(log)) {
        this.sleepLog = log;
        if (false) ;
      } else {
        const saved = localStorage.getItem("sleepLog");
        if (saved) {
          this.sleepLog = JSON.parse(saved);
          if (false) ;
        } else {
          this.sleepLog = [];
          if (false) ;
        }
      }
    } catch (error) {
      this.sleepLog = [];
    }
  }
  /**
   * Get sleep statistics
   */
  getSleepStats() {
    const thirtyDays = this.getSleepLog(30);
    const sevenDays = this.getSleepLog(7);
    const avgSleep30 = thirtyDays.length > 0 ? thirtyDays.reduce((sum, s) => sum + (s.duration || s.hours || 0), 0) / thirtyDays.length : 0;
    const avgSleep7 = sevenDays.length > 0 ? sevenDays.reduce((sum, s) => sum + (s.duration || s.hours || 0), 0) / sevenDays.length : 0;
    return {
      total: this.sleepLog.length,
      last30Days: thirtyDays.length,
      last7Days: sevenDays.length,
      averageDuration30Days: avgSleep30.toFixed(1),
      averageDuration7Days: avgSleep7.toFixed(1),
      lastNight: this.getLastNightSleep()
    };
  }
}
const sleepService = new SleepService();
export {
  sleepService as default
};
