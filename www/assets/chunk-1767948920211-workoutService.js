import { h as brainLearningService, f as firestoreService, a as authService } from "./entry-1767948920134-index.js";
class WorkoutService {
  constructor() {
    this.workoutHistory = [];
  }
  /**
   * Initialize service and load data
   */
  async initialize() {
    await this.loadWorkoutHistory();
  }
  /**
   * Log a workout
   */
  async logWorkout(workoutData) {
    try {
      if (this.workoutHistory.length === 0) {
        await this.loadWorkoutHistory();
      }
      const workout = {
        ...workoutData,
        id: "workout_" + Date.now(),
        timestamp: Date.now(),
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
      this.workoutHistory.push(workout);
      await this.saveWorkoutHistory();
      await brainLearningService.trackWorkout({
        duration: workoutData.duration || 30,
        type: workoutData.type || workoutData.activity,
        intensity: this.calculateIntensity(workoutData),
        completed: true,
        energyBefore: 5,
        // Default, can be updated from user input
        energyAfter: 7,
        mood: "energetic",
        location: workoutData.location || "gym"
      });
      await brainLearningService.trackEnergy(7, {
        recentWorkout: true,
        workoutType: workoutData.type || workoutData.activity,
        workoutDuration: workoutData.duration || 30,
        stressLevel: 3
        // Workouts reduce stress
      });
      if (window.updateDailyChallenge) {
        window.updateDailyChallenge("workout_15", workoutData.duration || 0);
      }
      if (false) ;
      return {
        success: true,
        workout
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  /**
   * Get workout history
   */
  getWorkoutHistory(days = 30) {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1e3;
    return this.workoutHistory.filter((w) => w.timestamp > cutoffDate);
  }
  /**
   * Get today's workouts
   */
  getTodayWorkouts() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return this.workoutHistory.filter((w) => w.date === today);
  }
  /**
   * Delete a workout
   */
  async deleteWorkout(workoutId) {
    try {
      this.workoutHistory = this.workoutHistory.filter((w) => w.id !== workoutId);
      await this.saveWorkoutHistory();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  /**
   * Save workout history to triple storage
   */
  async saveWorkoutHistory() {
    try {
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1e3;
      const recentWorkouts = this.workoutHistory.filter((w) => w.timestamp > ninetyDaysAgo);
      this.workoutHistory = recentWorkouts;
      localStorage.setItem("workoutHistory", JSON.stringify(recentWorkouts));
      await firestoreService.save("workoutHistory", recentWorkouts, authService.getCurrentUser()?.uid);
      if (false) ;
    } catch (error) {
    }
  }
  /**
   * Load workout history from storage
   */
  async loadWorkoutHistory() {
    try {
      const history = await firestoreService.get("workoutHistory", authService.getCurrentUser()?.uid);
      if (history && Array.isArray(history)) {
        this.workoutHistory = history;
        if (false) ;
      } else {
        const saved = localStorage.getItem("workoutHistory");
        if (saved) {
          this.workoutHistory = JSON.parse(saved);
          if (false) ;
        } else {
          this.workoutHistory = [];
          if (false) ;
        }
      }
    } catch (error) {
      this.workoutHistory = [];
    }
  }
  /**
   * Calculate workout intensity for Brain.js learning
   */
  calculateIntensity(workoutData) {
    const highIntensityTypes = ["hiit", "running", "sprinting", "crossfit", "boxing"];
    const moderateIntensityTypes = ["cycling", "swimming", "weights", "strength"];
    const lowIntensityTypes = ["yoga", "stretching", "walking", "pilates"];
    const type = (workoutData.type || workoutData.activity || "").toLowerCase();
    if (highIntensityTypes.some((t) => type.includes(t))) return "high";
    if (moderateIntensityTypes.some((t) => type.includes(t))) return "moderate";
    if (lowIntensityTypes.some((t) => type.includes(t))) return "low";
    return "moderate";
  }
  /**
   * Get workout statistics
   */
  getWorkoutStats() {
    const thirtyDays = this.getWorkoutHistory(30);
    const sevenDays = this.getWorkoutHistory(7);
    const today = this.getTodayWorkouts();
    return {
      total: this.workoutHistory.length,
      last30Days: thirtyDays.length,
      last7Days: sevenDays.length,
      today: today.length,
      totalDuration: thirtyDays.reduce((sum, w) => sum + (w.duration || 0), 0),
      totalCalories: thirtyDays.reduce((sum, w) => sum + (w.calories || 0), 0)
    };
  }
}
const workoutService = new WorkoutService();
export {
  workoutService as default
};
