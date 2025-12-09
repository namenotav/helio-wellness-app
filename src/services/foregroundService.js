/**
 * Foreground Service - Keeps app running in background
 * Shows persistent notification so steps and fall detection work 24/7
 */

import { Capacitor } from '@capacitor/core';

class ForegroundService {
  constructor() {
    this.isRunning = false;
    this.foregroundService = null;
  }

  /**
   * Start foreground service with persistent notification
   */
  async start() {
    try {
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        console.log('Foreground service only works on Android');
        return false;
      }

      if (this.isRunning) {
        console.log('Foreground service already running');
        return true;
      }

      // Dynamically import the plugin
      const { ForegroundService } = await import('@capawesome-team/capacitor-android-foreground-service');
      this.foregroundService = ForegroundService;

      // Start foreground service
      await this.foregroundService.startForegroundService({
        body: 'Tracking steps and monitoring for falls',
        id: 1,
        smallIcon: 'ic_stat_icon_config_sample',
        title: '🏃 Helio Active',
      });

      this.isRunning = true;
      console.log('✅ FOREGROUND SERVICE STARTED - App will stay alive in background!');
      return true;
    } catch (error) {
      console.error('Error starting foreground service:', error);
      return false;
    }
  }

  /**
   * Update notification with current stats
   */
  async updateNotification(steps, activity = 'Active') {
    try {
      if (!this.isRunning || !this.foregroundService) return;

      await this.foregroundService.updateForegroundService({
        body: `${steps} steps • ${activity} • Fall detection active`,
        id: 1,
        smallIcon: 'ic_stat_icon_config_sample',
        title: `🏃 ${steps} steps today`,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  }

  /**
   * Stop foreground service
   */
  async stop() {
    try {
      if (!this.foregroundService) return true;

      await this.foregroundService.stopForegroundService();
      
      this.isRunning = false;
      console.log('Foreground service stopped');
      return true;
    } catch (error) {
      console.error('Error stopping foreground service:', error);
      return false;
    }
  }

  /**
   * Check if service is running
   */
  isActive() {
    return this.isRunning;
  }
}

// Export singleton
const foregroundService = new ForegroundService();
export default foregroundService;
