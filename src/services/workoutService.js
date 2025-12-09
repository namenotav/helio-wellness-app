// Workout Tracking Service - Triple Storage (localStorage + Preferences + Firebase)
import syncService from './syncService.js';

class WorkoutService {
  constructor() {
    this.workoutHistory = [];
  }

  /**
   * Initialize service and load data
   */
  async initialize() {
    await this.loadWorkoutHistory();
    if(import.meta.env.DEV)console.log('💪 Workout service initialized');
  }

  /**
   * Log a workout
   */
  async logWorkout(workoutData) {
    try {
      const workout = {
        ...workoutData,
        id: 'workout_' + Date.now(),
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      };

      this.workoutHistory.push(workout);

      // Save to triple storage (localStorage + Preferences + Firebase)
      await this.saveWorkoutHistory();

      if(import.meta.env.DEV)console.log('✅ Workout logged:', workout.type || workout.activity);

      return {
        success: true,
        workout: workout
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to log workout:', error);
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
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.workoutHistory.filter(w => w.timestamp > cutoffDate);
  }

  /**
   * Get today's workouts
   */
  getTodayWorkouts() {
    const today = new Date().toISOString().split('T')[0];
    return this.workoutHistory.filter(w => w.date === today);
  }

  /**
   * Delete a workout
   */
  async deleteWorkout(workoutId) {
    try {
      this.workoutHistory = this.workoutHistory.filter(w => w.id !== workoutId);
      await this.saveWorkoutHistory();
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to delete workout:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save workout history to triple storage
   */
  async saveWorkoutHistory() {
    try {
      // Keep last 90 days
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      const recentWorkouts = this.workoutHistory.filter(w => w.timestamp > ninetyDaysAgo);
      this.workoutHistory = recentWorkouts;

      // Save to localStorage (backward compatibility)
      localStorage.setItem('workoutHistory', JSON.stringify(recentWorkouts));

      // Save to syncService (Preferences + Firebase)
      await syncService.saveData('workoutHistory', recentWorkouts);

      if(import.meta.env.DEV)console.log('💾 Workout history saved (localStorage + Preferences + Firebase)');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save workout history:', error);
    }
  }

  /**
   * Load workout history from storage
   */
  async loadWorkoutHistory() {
    try {
      // Try syncService first (Preferences + Firebase)
      const history = await syncService.getData('workoutHistory');
      if (history && Array.isArray(history)) {
        this.workoutHistory = history;
        if(import.meta.env.DEV)console.log('✅ Loaded workout history from syncService:', history.length, 'workouts');
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('workoutHistory');
        if (saved) {
          this.workoutHistory = JSON.parse(saved);
          if(import.meta.env.DEV)console.log('✅ Loaded workout history from localStorage:', this.workoutHistory.length, 'workouts');
        } else {
          this.workoutHistory = [];
          if(import.meta.env.DEV)console.log('ℹ️ No workout history found - starting fresh');
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load workout history:', error);
      this.workoutHistory = [];
    }
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
export default workoutService;
