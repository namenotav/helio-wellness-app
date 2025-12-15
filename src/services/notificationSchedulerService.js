// Notification Scheduler Service - Makes notification toggles functional
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationSchedulerService {
  constructor() {
    this.settings = this.getDefaultSettings();
    this.scheduledIds = {
      dailyReminders: [1001, 1002, 1003], // 9 AM, 12 PM, 6 PM
      streakReminders: [2001], // 8 PM
      healthTips: [3001, 3002, 3003], // 10 AM, 3 PM, 7 PM
      goalAlerts: [4001, 4002, 4003, 4004] // Dynamic goal notifications
    };
    this.initialized = false;
    this.goalCheckInterval = null;
  }

  getDefaultSettings() {
    return {
      dailyReminders: false,
      goalAlerts: false,
      streakReminders: false,
      healthTips: false,
      emergencyAlerts: true // Always on
    };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if LocalNotifications available
      if (!LocalNotifications) {
        console.warn('LocalNotifications not available');
        return;
      }

      // Request permissions
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      // Load saved settings
      this.loadSettings();

      // Schedule notifications based on settings
      await this.scheduleAllNotifications();

      // Start goal monitoring if enabled
      if (this.settings.goalAlerts) {
        this.startGoalMonitoring();
      }

      this.initialized = true;
      if(import.meta.env.DEV)console.log('✅ NotificationSchedulerService initialized');
    } catch (error) {
      console.warn('Failed to initialize notifications:', error);
      // Silently fail - app continues working
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        this.settings = { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load notification settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    try {
      // Cancel all existing notifications
      await this.cancelAllNotifications();

      // Reschedule based on new settings
      await this.scheduleAllNotifications();

      // Update goal monitoring
      if (this.settings.goalAlerts && !this.goalCheckInterval) {
        this.startGoalMonitoring();
      } else if (!this.settings.goalAlerts && this.goalCheckInterval) {
        this.stopGoalMonitoring();
      }

      if(import.meta.env.DEV)console.log('✅ Notification settings updated');
    } catch (error) {
      console.warn('Failed to update notifications:', error);
    }
  }

  async scheduleAllNotifications() {
    try {
      if (this.settings.dailyReminders) {
        await this.scheduleDailyReminders();
      }
      if (this.settings.streakReminders) {
        await this.scheduleStreakReminders();
      }
      if (this.settings.healthTips) {
        await this.scheduleHealthTips();
      }
    } catch (error) {
      console.warn('Failed to schedule notifications:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      const allIds = [
        ...this.scheduledIds.dailyReminders,
        ...this.scheduledIds.streakReminders,
        ...this.scheduledIds.healthTips,
        ...this.scheduledIds.goalAlerts
      ];

      await LocalNotifications.cancel({ notifications: allIds.map(id => ({ id })) });
      if(import.meta.env.DEV)console.log('🗑️ Cancelled all scheduled notifications');
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }

  // ==================== DAILY REMINDERS ====================
  async scheduleDailyReminders() {
    try {
      const notifications = [];
      const now = new Date();

      // Morning reminder - 9 AM
      const morning = new Date();
      morning.setHours(9, 0, 0, 0);
      if (morning <= now) morning.setDate(morning.getDate() + 1);

      notifications.push({
        id: this.scheduledIds.dailyReminders[0],
        title: '🌅 Good Morning!',
        body: 'Start your day right! Log your breakfast and water intake.',
        schedule: {
          at: morning,
          repeats: true,
          every: 'day'
        }
      });

      // Lunch reminder - 12 PM
      const lunch = new Date();
      lunch.setHours(12, 0, 0, 0);
      if (lunch <= now) lunch.setDate(lunch.getDate() + 1);

      notifications.push({
        id: this.scheduledIds.dailyReminders[1],
        title: '🍽️ Lunch Time!',
        body: 'Don\'t forget to log your lunch and stay hydrated.',
        schedule: {
          at: lunch,
          repeats: true,
          every: 'day'
        }
      });

      // Evening reminder - 6 PM
      const evening = new Date();
      evening.setHours(18, 0, 0, 0);
      if (evening <= now) evening.setDate(evening.getDate() + 1);

      notifications.push({
        id: this.scheduledIds.dailyReminders[2],
        title: '🌙 Evening Check-in',
        body: 'Log your dinner and check your daily progress!',
        schedule: {
          at: evening,
          repeats: true,
          every: 'day'
        }
      });

      await LocalNotifications.schedule({ notifications });
      if(import.meta.env.DEV)console.log('✅ Daily reminders scheduled');
    } catch (error) {
      console.warn('Failed to schedule daily reminders:', error);
    }
  }

  // ==================== GOAL ALERTS ====================
  startGoalMonitoring() {
    // Check goals every 5 minutes
    this.goalCheckInterval = setInterval(() => {
      this.checkGoalCompletion();
    }, 5 * 60 * 1000);

    // Check immediately
    this.checkGoalCompletion();
  }

  stopGoalMonitoring() {
    if (this.goalCheckInterval) {
      clearInterval(this.goalCheckInterval);
      this.goalCheckInterval = null;
    }
  }

  async checkGoalCompletion() {
    try {
      // Check step goal
      await this.checkStepGoal();

      // Check water goal
      await this.checkWaterGoal();

      // Check calorie goal
      await this.checkCalorieGoal();
    } catch (error) {
      console.warn('Failed to check goals:', error);
    }
  }

  async checkStepGoal() {
    try {
      // Try native step service first
      if (window.AndroidStepCounter) {
        const steps = await new Promise((resolve) => {
          try {
            const dailySteps = parseInt(window.AndroidStepCounter.getTodaySteps() || '0');
            resolve(dailySteps);
          } catch (error) {
            resolve(0);
          }
        });

        const goal = 10000; // Default goal
        const notifiedKey = `stepGoalNotified_${new Date().toDateString()}`;

        if (steps >= goal && !localStorage.getItem(notifiedKey)) {
          await LocalNotifications.schedule({
            notifications: [{
              id: this.scheduledIds.goalAlerts[0],
              title: '🎯 Step Goal Achieved!',
              body: `Awesome! You've reached ${steps.toLocaleString()} steps today!`,
              schedule: { at: new Date(Date.now() + 1000) }
            }]
          });
          localStorage.setItem(notifiedKey, 'true');
        }
      }
    } catch (error) {
      console.warn('Failed to check step goal:', error);
    }
  }

  async checkWaterGoal() {
    try {
      const waterData = localStorage.getItem('waterIntake');
      if (waterData) {
        const data = JSON.parse(waterData);
        const today = new Date().toDateString();
        const todayIntake = data[today] || 0;
        const goal = 2000; // 2L default goal
        const notifiedKey = `waterGoalNotified_${today}`;

        if (todayIntake >= goal && !localStorage.getItem(notifiedKey)) {
          await LocalNotifications.schedule({
            notifications: [{
              id: this.scheduledIds.goalAlerts[1],
              title: '💧 Hydration Goal Achieved!',
              body: `Great job! You've reached your water intake goal of ${goal}ml!`,
              schedule: { at: new Date(Date.now() + 1000) }
            }]
          });
          localStorage.setItem(notifiedKey, 'true');
        }
      }
    } catch (error) {
      console.warn('Failed to check water goal:', error);
    }
  }

  async checkCalorieGoal() {
    try {
      const mealsData = localStorage.getItem('meals');
      if (mealsData) {
        const meals = JSON.parse(mealsData);
        const today = new Date().toDateString();
        const todayMeals = meals.filter(m => new Date(m.date).toDateString() === today);
        const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const goal = 2000; // Default goal
        const notifiedKey = `calorieGoalNotified_${today}`;

        if (totalCalories >= goal && !localStorage.getItem(notifiedKey)) {
          await LocalNotifications.schedule({
            notifications: [{
              id: this.scheduledIds.goalAlerts[2],
              title: '🍎 Calorie Goal Reached!',
              body: `You've logged ${totalCalories} calories today. Great tracking!`,
              schedule: { at: new Date(Date.now() + 1000) }
            }]
          });
          localStorage.setItem(notifiedKey, 'true');
        }
      }
    } catch (error) {
      console.warn('Failed to check calorie goal:', error);
    }
  }

  // ==================== STREAK REMINDERS ====================
  async scheduleStreakReminders() {
    try {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(20, 0, 0, 0); // 8 PM
      if (reminderTime <= now) reminderTime.setDate(reminderTime.getDate() + 1);

      await LocalNotifications.schedule({
        notifications: [{
          id: this.scheduledIds.streakReminders[0],
          title: '🔥 Keep Your Streak Alive!',
          body: 'Complete your daily goal to maintain your winning streak!',
          schedule: {
            at: reminderTime,
            repeats: true,
            every: 'day'
          }
        }]
      });

      if(import.meta.env.DEV)console.log('✅ Streak reminders scheduled');
    } catch (error) {
      console.warn('Failed to schedule streak reminders:', error);
    }
  }

  // ==================== HEALTH TIPS ====================
  async scheduleHealthTips() {
    try {
      const tips = this.getHealthTips();
      const notifications = [];
      const now = new Date();

      // Morning tip - 10 AM
      const morning = new Date();
      morning.setHours(10, 0, 0, 0);
      if (morning <= now) morning.setDate(morning.getDate() + 1);

      notifications.push({
        id: this.scheduledIds.healthTips[0],
        title: '💡 Health Tip',
        body: tips[Math.floor(Math.random() * tips.length)],
        schedule: {
          at: morning,
          repeats: true,
          every: 'day'
        }
      });

      // Afternoon tip - 3 PM
      const afternoon = new Date();
      afternoon.setHours(15, 0, 0, 0);
      if (afternoon <= now) afternoon.setDate(afternoon.getDate() + 1);

      notifications.push({
        id: this.scheduledIds.healthTips[1],
        title: '💡 Wellness Advice',
        body: tips[Math.floor(Math.random() * tips.length)],
        schedule: {
          at: afternoon,
          repeats: true,
          every: 'day'
        }
      });

      // Evening tip - 7 PM
      const evening = new Date();
      evening.setHours(19, 0, 0, 0);
      if (evening <= now) evening.setDate(evening.getDate() + 1);

      notifications.push({
        id: this.scheduledIds.healthTips[2],
        title: '💡 Health Reminder',
        body: tips[Math.floor(Math.random() * tips.length)],
        schedule: {
          at: evening,
          repeats: true,
          every: 'day'
        }
      });

      await LocalNotifications.schedule({ notifications });
      if(import.meta.env.DEV)console.log('✅ Health tips scheduled');
    } catch (error) {
      console.warn('Failed to schedule health tips:', error);
    }
  }

  getHealthTips() {
    return [
      '💧 Drink water regularly throughout the day to stay hydrated!',
      '🚶 Take a 5-minute walk every hour to boost circulation.',
      '🧘 Practice deep breathing for 2 minutes to reduce stress.',
      '🥗 Include more vegetables in your meals for better nutrition.',
      '😴 Aim for 7-8 hours of quality sleep each night.',
      '🏃 Regular exercise strengthens your immune system.',
      '🍎 Choose whole fruits over fruit juice for more fiber.',
      '📱 Take breaks from screens to reduce eye strain.',
      '🧘‍♀️ Stretch your muscles daily to improve flexibility.',
      '☀️ Get some sunlight daily for vitamin D.',
      '🥤 Limit sugary drinks and opt for water or tea.',
      '🍽️ Eat slowly and mindfully to improve digestion.',
      '🏋️ Strength training helps maintain bone density.',
      '🧠 Challenge your brain with puzzles or learning new skills.',
      '❤️ Practice gratitude daily for better mental health.',
      '🚭 Avoid smoking and limit alcohol for better health.',
      '🥜 Include healthy fats like nuts and avocados in your diet.',
      '🏃‍♀️ Find physical activities you enjoy for sustainable fitness.',
      '😊 Stay connected with friends and family for emotional wellbeing.',
      '🍵 Green tea is rich in antioxidants and supports metabolism.'
    ];
  }

  // ==================== UTILITY METHODS ====================
  async testNotification(type) {
    try {
      const testNotifications = {
        dailyReminders: {
          title: '🍎 Test: Daily Reminder',
          body: 'This is what your daily reminders will look like!'
        },
        goalAlerts: {
          title: '🎯 Test: Goal Alert',
          body: 'This is what goal completion alerts will look like!'
        },
        streakReminders: {
          title: '🔥 Test: Streak Reminder',
          body: 'This is what streak reminders will look like!'
        },
        healthTips: {
          title: '💡 Test: Health Tip',
          body: 'This is what health tips will look like!'
        }
      };

      const notification = testNotifications[type] || testNotifications.dailyReminders;

      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title: notification.title,
          body: notification.body,
          schedule: { at: new Date(Date.now() + 2000) }
        }]
      });

      if(import.meta.env.DEV)console.log('✅ Test notification sent');
    } catch (error) {
      console.warn('Failed to send test notification:', error);
    }
  }

  getStatus() {
    return {
      initialized: this.initialized,
      settings: this.settings,
      goalMonitoring: !!this.goalCheckInterval
    };
  }
}

// Export singleton instance
const notificationSchedulerService = new NotificationSchedulerService();
export default notificationSchedulerService;
