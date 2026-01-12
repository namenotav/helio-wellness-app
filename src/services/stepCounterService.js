// Hardware Step Counter Service - Samsung Health Level Accuracy
// Uses native Android TYPE_STEP_COUNTER sensor via Capacitor plugin

import { registerPlugin } from '@capacitor/core';

const StepCounter = registerPlugin('StepCounter');

class StepCounterService {
  constructor() {
    this.isAvailable = false;
    this.isRunning = false;
    this.stepCount = 0;
    this.listeners = [];
  }

  async initialize() {
    try {
      if(import.meta.env.DEV)console.log('🔧 Checking hardware step counter availability...');
      if(import.meta.env.DEV)console.log('====================================');
      
      // Request permission first (Android 10+)
      try {
        const permResult = await StepCounter.requestPermission();
        if(import.meta.env.DEV)console.log('🔑 Permission result:', permResult);
        if (permResult.granted) {
          if(import.meta.env.DEV)console.log('✅ Activity recognition permission GRANTED');
        } else {
          if(import.meta.env.DEV)console.log('❌ Activity recognition permission DENIED');
        }
      } catch (permError) {
        if(import.meta.env.DEV)console.log('ℹ️ Permission request error (may already be granted):', permError);
      }
      
      const result = await StepCounter.isAvailable();
      if(import.meta.env.DEV)console.log('🔍 isAvailable result:', result);
      this.isAvailable = result.available;
      
      if (this.isAvailable) {
        if(import.meta.env.DEV)console.log('✅✅✅ HARDWARE STEP COUNTER IS AVAILABLE! ✅✅✅');
        if(import.meta.env.DEV)console.log('🎯 Device HAS TYPE_STEP_COUNTER sensor');
        if(import.meta.env.DEV)console.log('🏆 Samsung Health level accuracy ENABLED');
        
        // Add listener for step updates
        await StepCounter.addListener('stepCountUpdate', (data) => {
          this.stepCount = data.steps;
          this.notifyListeners(data.steps);
          
          if (this.stepCount % 10 === 0) {
            if(import.meta.env.DEV)console.log(`🚶 Hardware steps: ${this.stepCount}`);
          }
        });
        
        if(import.meta.env.DEV)console.log('====================================');
        return true;
      } else {
        if(import.meta.env.DEV)console.log('❌❌❌ HARDWARE STEP COUNTER NOT AVAILABLE ❌❌❌');
        if(import.meta.env.DEV)console.log('📱 Your OnePlus device DOES NOT have TYPE_STEP_COUNTER sensor');
        if(import.meta.env.DEV)console.log('⚠️ Falling back to software accelerometer detection');
        if(import.meta.env.DEV)console.log('====================================');
        return false;
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to initialize step counter:', error);
      if(import.meta.env.DEV)console.error('Error details:', error.message, error.stack);
      if(import.meta.env.DEV)console.log('====================================');
      return false;
    }
  }

  async start() {
    if (!this.isAvailable) {
      throw new Error('Step counter not available');
    }

    try {
      await StepCounter.start();
      this.isRunning = true;
      if(import.meta.env.DEV)console.log('✅ Hardware step counter started');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to start step counter:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    try {
      await StepCounter.stop();
      this.isRunning = false;
      if(import.meta.env.DEV)console.log('🛑 Hardware step counter stopped');
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to stop step counter:', error);
    }
  }

  async getStepCount() {
    try {
      const result = await StepCounter.getStepCount();
      const currentCount = result.steps;
      
      // 🔥 FIX #10: Detect phone reboot (hardware counter reset)
      const baseline = parseInt(localStorage.getItem('stepBaseline') || '0');
      const baselineDate = localStorage.getItem('stepBaselineDate') || '';
      const today = new Date().toISOString().split('T')[0];
      
      // If current count is LESS than baseline, phone rebooted!
      if (currentCount < baseline && baselineDate === today) {
        if(import.meta.env.DEV)console.log('🔄 [REBOOT DETECTED] Hardware count:', currentCount, '< Baseline:', baseline);
        if(import.meta.env.DEV)console.log('📱 Phone rebooted - recalculating baseline...');
        
        // Set new baseline to current count
        localStorage.setItem('stepBaseline', currentCount.toString());
        if(import.meta.env.DEV)console.log('✅ New baseline set:', currentCount);
        
        // Today's steps start from 0 again
        return 0;
      }
      
      return currentCount;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to get step count:', error);
      return 0;
    }
  }
  
  async updateSteps(steps) {
    this.stepCount = steps;
    
    try {
      // Save to localStorage
      localStorage.setItem('dailySteps', JSON.stringify(steps));
      localStorage.setItem('stepHistory', JSON.stringify({
        steps,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      }));
      
      // Save to Preferences
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: 'dailySteps', value: JSON.stringify(steps) });
      
      // Save to Firestore
      await this.saveStepHistory();
      
      if(import.meta.env.DEV)console.log('✅ Steps updated:', steps);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to update steps:', error);
    }
  }
  
  async saveStepHistory() {
    try {
      // Save to Firestore
      const { Preferences } = await import('@capacitor/preferences');
      const firestoreService = (await import('./firestoreService')).default;
      const authService = (await import('./authService')).default;
      
      const stepData = {
        steps: this.stepCount,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      };
      
      // Save to Preferences
      const { value } = await Preferences.get({ key: 'stepHistory' });
      const history = value ? JSON.parse(value) : [];
      history.push(stepData);
      Preferences.set({ key: 'stepHistory', value: JSON.stringify(history) })
        .catch(err => console.warn('⚠️ stepHistory Preferences save failed:', err));
      
      // Save to Firestore (non-blocking)
      const user = authService.getCurrentUser();
      if (user) {
        firestoreService.save('steps', stepData, user.uid)
          .then(() => console.log('☁️ steps synced to Firestore (background)'))
          .catch(err => console.warn('⚠️ steps sync failed:', err));
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save step history:', error);
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  notifyListeners(steps) {
    this.listeners.forEach(listener => {
      try {
        listener(steps);
      } catch (error) {
        if(import.meta.env.DEV)console.error('Error in step listener:', error);
      }
    });
  }
}

export default new StepCounterService();



