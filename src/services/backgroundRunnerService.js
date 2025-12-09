// Background Runner Service - Starts/Stops background tracking
import { BackgroundRunner } from '@capacitor/background-runner';
import { Preferences } from '@capacitor/preferences';

class BackgroundRunnerService {
  constructor() {
    this.isRunning = false;
  }

  // Check if background runner is available
  async isAvailable() {
    try {
      // Background runner is available on Capacitor apps
      return true;
    } catch {
      return false;
    }
  }

  // Start background tracking (steps + fall detection)
  async start() {
    try {
      if (this.isRunning) {
        if(import.meta.env.DEV)console.log('⚠️ Background runner already running');
        return { success: true };
      }

      // Enable background runner
      await Preferences.set({
        key: 'background_runner_enabled',
        value: 'true'
      });

      this.isRunning = true;
      if(import.meta.env.DEV)console.log('✅ Background runner started');
      
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to start background runner:', error);
      return { success: false, error: error.message };
    }
  }

  // Stop background tracking
  async stop() {
    try {
      // Disable background runner
      await Preferences.set({
        key: 'background_runner_enabled',
        value: 'false'
      });

      this.isRunning = false;
      if(import.meta.env.DEV)console.log('🛑 Background runner stopped');
      
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to stop background runner:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if background runner is enabled
  async isEnabled() {
    try {
      const { value } = await Preferences.get({ key: 'background_runner_enabled' });
      return value === 'true';
    } catch {
      return false;
    }
  }

  // Get background status
  async getStatus() {
    const enabled = await this.isEnabled();
    return {
      enabled,
      available: await this.isAvailable(),
      features: ['step_counting', 'fall_detection', 'gps_tracking']
    };
  }
}

export const backgroundRunnerService = new BackgroundRunnerService();
export default backgroundRunnerService;
