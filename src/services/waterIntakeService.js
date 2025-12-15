// Water Intake Tracking Service
// Track daily water consumption with reminders
import syncService from './syncService.js';
import firestoreService from './firestoreService';
import authService from './authService';
import brainLearningService from './brainLearningService.js';

class WaterIntakeService {
  constructor() {
    this.dailyGoal = 2000; // ml (2 liters default)
    this.todayIntake = 0;
    this.intakeHistory = [];
    this.reminders = [];
  }

  /**
   * Initialize service and load data
   */
  async initialize() {
    await this.loadSettings();
    await this.loadTodayIntake();
    await this.loadHistory();
    await this.loadReminders();
    if(import.meta.env.DEV)console.log('💧 Water intake service initialized');
  }

  /**
   * Add water intake
   */
  async addIntake(amount) {
    const intake = {
      amount, // ml
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    this.todayIntake += amount;
    this.intakeHistory.push(intake);

    // Save to localStorage
    this.saveTodayIntake();
    this.saveHistory();

    // ALSO save to waterLog for dashboard compatibility (save to cloud)
    const waterLog = await firestoreService.get('waterLog', authService.getCurrentUser()?.uid) || [];
    waterLog.push({
      cups: Math.round(amount / 250), // Convert ml to cups (250ml = 1 cup)
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    });
    await firestoreService.save('waterLog', waterLog, authService.getCurrentUser()?.uid);

    if(import.meta.env.DEV)console.log(`💧 Added ${amount}ml water. Total today: ${this.todayIntake}ml`);

    // 🧠 BRAIN.JS LEARNING - Track hydration for AI reminders
    try {
      await brainLearningService.trackHydration(amount, {
        exercised: false,
        temperature: 20,
        thirstLevel: 3
      });
      if(import.meta.env.DEV)console.log('🧠 Hydration tracked for AI learning');
    } catch (err) {
      if(import.meta.env.DEV)console.warn('Brain.js hydration tracking failed:', err);
    }

    // Check if goal reached
    if (this.todayIntake >= this.dailyGoal) {
      if(import.meta.env.DEV)console.log('🎉 Daily water goal reached!');
    }

    return {
      amount,
      total: this.todayIntake,
      remaining: Math.max(0, this.dailyGoal - this.todayIntake),
      percentage: Math.min(100, Math.round((this.todayIntake / this.dailyGoal) * 100)),
      intake: this.todayIntake,
      goal: this.dailyGoal,
      goalReached: this.todayIntake >= this.dailyGoal
    };
  }

  /**
   * Quick add common amounts
   */
  addGlass() { return this.addIntake(250); } // 250ml glass
  addBottle() { return this.addIntake(500); } // 500ml bottle
  addLargeBottle() { return this.addIntake(1000); } // 1L bottle
  addCup() { return this.addIntake(200); } // 200ml cup

  /**
   * Remove last intake (undo)
   */
  removeLastIntake() {
    if (this.intakeHistory.length === 0) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayIntakes = this.intakeHistory.filter(i => i.date === today);
    
    if (todayIntakes.length === 0) {
      return null;
    }

    const lastIntake = todayIntakes[todayIntakes.length - 1];
    this.todayIntake -= lastIntake.amount;
    
    // Remove from history
    const index = this.intakeHistory.indexOf(lastIntake);
    this.intakeHistory.splice(index, 1);

    this.saveTodayIntake();
    this.saveHistory();

    if(import.meta.env.DEV)console.log(`↩️ Removed ${lastIntake.amount}ml water`);

    return lastIntake;
  }

  /**
   * Set daily goal
   */
  async setDailyGoal(amount) {
    this.dailyGoal = amount;
    localStorage.setItem('water_daily_goal', amount.toString());
    // Save to syncService (Preferences + Firebase)
    await firestoreService.save('water_daily_goal', amount, authService.getCurrentUser()?.uid);
    if(import.meta.env.DEV)console.log(`💧 Daily goal set to ${amount}ml`);
  }

  /**
   * Get recommended daily goal based on weight and activity
   */
  getRecommendedGoal(weight, activityLevel = 'moderate') {
    // Base: 30-35ml per kg of body weight
    let base = weight * 33;

    // Adjust for activity level
    if (activityLevel === 'low') {
      base *= 0.9;
    } else if (activityLevel === 'high') {
      base *= 1.2;
    } else if (activityLevel === 'very_high') {
      base *= 1.4;
    }

    return Math.round(base);
  }

  /**
   * Get today's progress
   */
  getTodayProgress() {
    return {
      intake: this.todayIntake,
      goal: this.dailyGoal,
      remaining: Math.max(0, this.dailyGoal - this.todayIntake),
      percentage: Math.min(100, Math.round((this.todayIntake / this.dailyGoal) * 100)),
      goalReached: this.todayIntake >= this.dailyGoal
    };
  }

  /**
   * Get intake for specific date
   */
  getIntakeForDate(date) {
    const intakes = this.intakeHistory.filter(i => i.date === date);
    const total = intakes.reduce((sum, i) => sum + i.amount, 0);

    return {
      intakes,
      total,
      percentage: Math.min(100, Math.round((total / this.dailyGoal) * 100))
    };
  }

  /**
   * Get weekly statistics
   */
  getWeeklyStats() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayIntakes = this.intakeHistory.filter(intake => intake.date === dateStr);
      const total = dayIntakes.reduce((sum, intake) => sum + intake.amount, 0);

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total,
        percentage: Math.min(100, Math.round((total / this.dailyGoal) * 100)),
        goalReached: total >= this.dailyGoal
      });
    }

    const weekTotal = days.reduce((sum, day) => sum + day.total, 0);
    const weekAverage = Math.round(weekTotal / 7);
    const daysGoalReached = days.filter(d => d.goalReached).length;

    return {
      days,
      weekTotal,
      weekAverage,
      daysGoalReached,
      consistency: Math.round((daysGoalReached / 7) * 100)
    };
  }

  /**
   * Schedule reminders
   */
  scheduleReminder(hour, minute, message = 'Time to drink water! 💧') {
    const reminder = {
      id: Date.now().toString(),
      hour,
      minute,
      message,
      enabled: true
    };

    this.reminders.push(reminder);
    this.saveReminders();

    if(import.meta.env.DEV)console.log(`⏰ Reminder scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);

    return reminder;
  }

  /**
   * Remove reminder
   */
  removeReminder(id) {
    this.reminders = this.reminders.filter(r => r.id !== id);
    this.saveReminders();
  }

  /**
   * Toggle reminder
   */
  toggleReminder(id) {
    const reminder = this.reminders.find(r => r.id === id);
    if (reminder) {
      reminder.enabled = !reminder.enabled;
      this.saveReminders();
    }
  }

  /**
   * Reset daily intake (called at midnight)
   */
  resetDailyIntake() {
    this.todayIntake = 0;
    this.saveTodayIntake();
    if(import.meta.env.DEV)console.log('💧 Daily intake reset');
  }

  /**
   * Save today's intake
   */
  saveTodayIntake() {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('water_today_intake', JSON.stringify({
      date: today,
      amount: this.todayIntake
    }));
  }

  /**
   * Load today's intake
   */
  async loadTodayIntake() {
    try {
      // Try syncService first (Preferences + Firebase)
      const data = await firestoreService.get('water_today_intake', authService.getCurrentUser()?.uid);
      const today = new Date().toISOString().split('T')[0];
      
      if (data && data.date === today) {
        this.todayIntake = data.intake;
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('water_today_intake');
        if (saved) {
          const localData = JSON.parse(saved);
          if (localData.date === today) {
            this.todayIntake = localData.intake;
          } else {
            this.todayIntake = 0;
          }
        } else {
          this.todayIntake = 0;
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load today intake:', error);
    }
  }

  /**
   * Save history
   */
  async saveHistory() {
    try {
      // Keep last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentHistory = this.intakeHistory.filter(i => i.timestamp > thirtyDaysAgo);
      
      localStorage.setItem('water_intake_history', JSON.stringify(recentHistory));
      // Save to syncService (Preferences + Firebase)
      await firestoreService.save('water_intake_history', recentHistory, authService.getCurrentUser()?.uid);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save history:', error);
    }
  }

  /**
   * Load history
   */
  async loadHistory() {
    try {
      // Try syncService first (Preferences + Firebase)
      const history = await firestoreService.get('water_intake_history', authService.getCurrentUser()?.uid);
      if (history) {
        this.intakeHistory = history;
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('water_intake_history');
        if (saved) {
          this.intakeHistory = JSON.parse(saved);
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load history:', error);
    }
  }

  /**
   * Save reminders
   */
  async saveReminders() {
    try {
      localStorage.setItem('water_reminders', JSON.stringify(this.reminders));
      // Save to syncService (Preferences + Firebase)
      await firestoreService.save('water_reminders', this.reminders, authService.getCurrentUser()?.uid);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save reminders:', error);
    }
  }

  /**
   * Load reminders
   */
  async loadReminders() {
    try {
      // Try syncService first (Preferences + Firebase)
      const reminders = await firestoreService.get('water_reminders', authService.getCurrentUser()?.uid);
      if (reminders) {
        this.reminders = reminders;
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('water_reminders');
        if (saved) {
          this.reminders = JSON.parse(saved);
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load reminders:', error);
    }
  }

  /**
   * Load settings
   */
  async loadSettings() {
    try {
      // Try syncService first (Preferences + Firebase)
      const goal = await firestoreService.get('water_daily_goal', authService.getCurrentUser()?.uid);
      if (goal) {
        this.dailyGoal = typeof goal === 'number' ? goal : parseInt(goal);
      } else {
        // Fallback to localStorage
        const localGoal = localStorage.getItem('water_daily_goal');
        if (localGoal) {
          this.dailyGoal = parseInt(localGoal);
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load settings:', error);
    }
  }
}

const waterIntakeService = new WaterIntakeService();
export default waterIntakeService;



