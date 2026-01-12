// Workout Tracking Service - Triple Storage (localStorage + Preferences + Firebase)
import syncService from './syncService.js';
import firestoreService from './firestoreService';
import authService from './authService';
import brainLearningService from './brainLearningService';

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
      // 🔥 FIX: Load existing workouts BEFORE adding new one
      if (this.workoutHistory.length === 0) {
        await this.loadWorkoutHistory();
      }

      const workout = {
        ...workoutData,
        id: 'workout_' + Date.now(),
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      };

      this.workoutHistory.push(workout);

      // Save to triple storage (localStorage + Preferences + Firebase)
      await this.saveWorkoutHistory();

      // 🧠 BRAIN.JS LEARNING - Track workout for AI optimization
      await brainLearningService.trackWorkout({
        duration: workoutData.duration || 30,
        type: workoutData.type || workoutData.activity,
        intensity: this.calculateIntensity(workoutData),
        completed: true,
        energyBefore: 5, // Default, can be updated from user input
        energyAfter: 7,
        mood: 'energetic',
        location: workoutData.location || 'gym'
      });

      // 🧠 BRAIN.JS LEARNING - Track energy after workout for pattern recognition
      await brainLearningService.trackEnergy(7, {
        recentWorkout: true,
        workoutType: workoutData.type || workoutData.activity,
        workoutDuration: workoutData.duration || 30,
        stressLevel: 3 // Workouts reduce stress
      });

      // 🎯 Update daily challenge (15 Min Workout)
      if (window.updateDailyChallenge) {
        window.updateDailyChallenge('workout_15', workoutData.duration || 0);
      }

      if(import.meta.env.DEV)console.log('✅ Workout logged & learned:', workout.type || workout.activity);

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

      // Save to syncService (Preferences + Firebase) - background
      firestoreService.save('workoutHistory', recentWorkouts, authService.getCurrentUser()?.uid)
        .then(() => console.log('☁️ workoutHistory synced to Firestore (background)'))
        .catch(err => console.warn('⚠️ workoutHistory sync failed:', err));

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
      const history = await firestoreService.get('workoutHistory', authService.getCurrentUser()?.uid);
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
   * Calculate workout intensity for Brain.js learning
   */
  calculateIntensity(workoutData) {
    // Determine intensity based on activity type and duration
    const highIntensityTypes = ['hiit', 'running', 'sprinting', 'crossfit', 'boxing'];
    const moderateIntensityTypes = ['cycling', 'swimming', 'weights', 'strength'];
    const lowIntensityTypes = ['yoga', 'stretching', 'walking', 'pilates'];
    
    const type = (workoutData.type || workoutData.activity || '').toLowerCase();
    
    if (highIntensityTypes.some(t => type.includes(t))) return 'high';
    if (moderateIntensityTypes.some(t => type.includes(t))) return 'moderate';
    if (lowIntensityTypes.some(t => type.includes(t))) return 'low';
    
    return 'moderate'; // default
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
