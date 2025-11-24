// Native Notifications Service
import { LocalNotifications } from '@capacitor/local-notifications';

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

// Schedule water reminder (every 2 hours)
export const scheduleWaterReminders = async () => {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;

    const notifications = [];
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour <= endHour; hour += 2) {
      notifications.push({
        title: '💧 Stay Hydrated!',
        body: 'Time to drink a glass of water',
        id: hour,
        schedule: {
          on: { hour, minute: 0 },
          every: 'day',
          allowWhileIdle: true
        },
        sound: 'default',
        smallIcon: 'ic_stat_icon_config_sample',
        actionTypeId: 'WATER_REMINDER'
      });
    }

    await LocalNotifications.schedule({ notifications });
    return true;
  } catch (error) {
    console.error('Water reminder error:', error);
    return false;
  }
};

// Schedule workout reminders
export const scheduleWorkoutReminder = async (hour = 18, minute = 0) => {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;

    await LocalNotifications.schedule({
      notifications: [{
        title: '💪 Workout Time!',
        body: 'Ready to crush your fitness goals?',
        id: 100,
        schedule: {
          on: { hour, minute },
          every: 'day',
          allowWhileIdle: true
        },
        sound: 'default',
        actionTypeId: 'WORKOUT_REMINDER'
      }]
    });
    
    return true;
  } catch (error) {
    console.error('Workout reminder error:', error);
    return false;
  }
};

// Daily motivational quote (morning)
export const scheduleDailyMotivation = async () => {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;

    const quotes = [
      'Today is your day to shine! ☀️',
      'Small progress is still progress 💪',
      'You are stronger than you think 🌟',
      'Make today count! 🎯',
      'Your only limit is you 🚀',
      'Believe in yourself 💫',
      'Every day is a fresh start 🌅',
      'You've got this! 💪'
    ];

    await LocalNotifications.schedule({
      notifications: [{
        title: '☀️ Good Morning from Helio!',
        body: quotes[Math.floor(Math.random() * quotes.length)],
        id: 200,
        schedule: {
          on: { hour: 7, minute: 30 },
          every: 'day',
          allowWhileIdle: true
        },
        sound: 'default',
        actionTypeId: 'DAILY_MOTIVATION'
      }]
    });
    
    return true;
  } catch (error) {
    console.error('Motivation reminder error:', error);
    return false;
  }
};

// Streak congratulations
export const sendStreakNotification = async (streakDays) => {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;

    await LocalNotifications.schedule({
      notifications: [{
        title: '🔥 Amazing Streak!',
        body: `You're on a ${streakDays}-day streak! Keep it going!`,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 1000) },
        sound: 'default',
        actionTypeId: 'STREAK_CELEBRATION'
      }]
    });
    
    return true;
  } catch (error) {
    console.error('Streak notification error:', error);
    return false;
  }
};

// Cancel specific notification
export const cancelNotification = async (id) => {
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    return true;
  } catch (error) {
    console.error('Cancel notification error:', error);
    return false;
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await LocalNotifications.cancel({ notifications: [] });
    return true;
  } catch (error) {
    console.error('Cancel all notifications error:', error);
    return false;
  }
};

// Get pending notifications
export const getPendingNotifications = async () => {
  try {
    const result = await LocalNotifications.getPending();
    return result.notifications;
  } catch (error) {
    console.error('Get pending notifications error:', error);
    return [];
  }
};

// Setup notification listeners
export const setupNotificationListeners = () => {
  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    console.log('Notification action:', notification.actionId);
    
    // Handle different notification actions
    switch (notification.notification.extra?.actionTypeId) {
      case 'WATER_REMINDER':
        // Log water intake
        break;
      case 'WORKOUT_REMINDER':
        // Navigate to workout tab
        break;
      case 'DAILY_MOTIVATION':
        // Open app dashboard
        break;
      case 'STREAK_CELEBRATION':
        // Show achievement popup
        break;
    }
  });
};
