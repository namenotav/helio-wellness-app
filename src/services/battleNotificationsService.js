// Battle Notifications Service - Push notifications for battles
import { LocalNotifications } from '@capacitor/local-notifications';

class BattleNotificationsService {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // Request notification permissions
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        if(import.meta.env.DEV) console.log('✅ Battle notifications enabled');
      }
    } catch (error) {
      if(import.meta.env.DEV) console.error('Notification permission error:', error);
    }
  }

  // Send battle invite notification
  async sendBattleInvite(battleData) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '⚔️ Battle Invite!',
          body: `${battleData.creatorName} challenged you to a ${battleData.goal} battle!`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'battle_invite', battleId: battleData.battleId }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Battle invite notification error:', error);
    }
  }

  // Send battle ending soon notification
  async sendBattleEnding(battleData) {
    try {
      const hoursLeft = Math.ceil((new Date(battleData.endDate) - new Date()) / (1000 * 60 * 60));
      
      await LocalNotifications.schedule({
        notifications: [{
          title: '⏰ Battle Ending Soon!',
          body: `${hoursLeft} hours left in ${battleData.name}. Push harder!`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'battle_ending', battleId: battleData.battleId }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Battle ending notification error:', error);
    }
  }

  // Send falling behind notification
  async sendFallingBehind(battleData) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '🚨 Falling Behind!',
          body: `You're #${battleData.rank} in ${battleData.name}. Time to catch up!`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'falling_behind', battleId: battleData.battleId }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Falling behind notification error:', error);
    }
  }

  // Send battle victory notification
  async sendBattleVictory(battleData) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '🎉 VICTORY!',
          body: `You won ${battleData.name} and earned ${battleData.xp} XP!`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'battle_won', battleId: battleData.battleId }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Victory notification error:', error);
    }
  }

  // Send battle defeat notification
  async sendBattleDefeat(battleData) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '💪 Keep Pushing!',
          body: `You lost ${battleData.name}, but earned ${battleData.xp} XP. Join another battle!`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'battle_lost', battleId: battleData.battleId }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Defeat notification error:', error);
    }
  }

  // Send daily challenge notification
  async sendDailyChallenge(challengeData) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '🔥 Daily Battle Challenge!',
          body: `New challenge: ${challengeData.name}. Complete before midnight!`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'daily_challenge', challengeId: challengeData.id }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Daily challenge notification error:', error);
    }
  }

  // Send streak risk notification
  async sendStreakRisk(streakData) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '⚠️ Streak at Risk!',
          body: `Your ${streakData.streak}-win streak expires today! Win a battle to save it.`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'streak_risk' }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Streak risk notification error:', error);
    }
  }

  // Send rival update notification
  async sendRivalUpdate(rivalData) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '👀 Rival Update!',
          body: `${rivalData.rivalName} just beat your score in ${rivalData.battleName}!`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'rival_update', battleId: rivalData.battleId }
        }]
      });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Rival update notification error:', error);
    }
  }

  // Schedule battle ending reminder (6 hours before)
  async scheduleBattleEndingReminder(battleData) {
    try {
      const endTime = new Date(battleData.endDate);
      const reminderTime = new Date(endTime.getTime() - (6 * 60 * 60 * 1000)); // 6 hours before
      
      if (reminderTime > new Date()) {
        await LocalNotifications.schedule({
          notifications: [{
            title: '⏰ Battle Ending Soon!',
            body: `6 hours left in ${battleData.name}. Make your final push!`,
            id: parseInt(battleData.battleId.replace(/\D/g, '').substring(0, 8)),
            schedule: { at: reminderTime },
            sound: 'default',
            extra: { type: 'battle_ending', battleId: battleData.battleId }
          }]
        });
      }
    } catch (error) {
      if(import.meta.env.DEV) console.error('Schedule reminder error:', error);
    }
  }

  // Cancel battle notifications
  async cancelBattleNotifications(battleId) {
    try {
      const notificationId = parseInt(battleId.replace(/\D/g, '').substring(0, 8));
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    } catch (error) {
      if(import.meta.env.DEV) console.error('Cancel notification error:', error);
    }
  }
}

export const battleNotificationsService = new BattleNotificationsService();
export default battleNotificationsService;
