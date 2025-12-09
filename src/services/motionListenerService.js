// Motion Listener Service - Centralized motion sensor manager
// Prevents conflicts between step counter, fall detection, and other motion features
import { Capacitor } from '@capacitor/core';

class MotionListenerService {
  constructor() {
    this.isListening = false;
    this.subscribers = new Map();
    this.nextSubscriberId = 1;
    this.motionListener = null;
    this.Motion = null;
    this.totalEventsReceived = 0;
  }

  // Initialize Motion plugin
  async initialize() {
    if (!this.Motion) {
      try {
        const motionModule = await import('@capacitor/motion');
        this.Motion = motionModule.Motion;
        console.log('✅ Motion plugin loaded');
      } catch (error) {
        console.error('❌ Failed to load Motion plugin:', error);
        throw error;
      }
    }
  }

  // Subscribe to motion events
  async subscribe(callback, subscriberName = 'unknown') {
    await this.initialize();

    // Generate unique ID for this subscriber
    const subscriberId = this.nextSubscriberId++;
    this.subscribers.set(subscriberId, { callback, name: subscriberName });
    
    console.log(`📡 Subscriber added: ${subscriberName} (ID: ${subscriberId})`);
    console.log(`📊 Total subscribers: ${this.subscribers.size}`);

    // Start listening if this is the first subscriber
    if (!this.isListening) {
      await this.startListening();
    }

    // Return unsubscribe function
    return {
      id: subscriberId,
      unsubscribe: () => this.unsubscribe(subscriberId)
    };
  }

  // Unsubscribe from motion events
  async unsubscribe(subscriberId) {
    const subscriber = this.subscribers.get(subscriberId);
    if (subscriber) {
      console.log(`📡 Subscriber removed: ${subscriber.name} (ID: ${subscriberId})`);
      this.subscribers.delete(subscriberId);
      console.log(`📊 Remaining subscribers: ${this.subscribers.size}`);
    }

    // Stop listening if no more subscribers
    if (this.subscribers.size === 0 && this.isListening) {
      await this.stopListening();
    }
  }

  // Start the single motion listener
  async startListening() {
    if (this.isListening) {
      console.log('⚠️ Motion listener already active');
      return;
    }

    try {
      console.log('🎧 Starting centralized motion listener...');
      
      this.motionListener = await this.Motion.addListener('accel', (event) => {
        this.totalEventsReceived++;
        
        // Broadcast to all subscribers
        this.subscribers.forEach((subscriber, id) => {
          try {
            subscriber.callback(event);
          } catch (error) {
            console.error(`❌ Error in subscriber ${subscriber.name}:`, error);
          }
        });

        // Log every 100 events
        if (this.totalEventsReceived % 100 === 0) {
          console.log(`📊 Motion events: ${this.totalEventsReceived}, Broadcasting to ${this.subscribers.size} subscribers`);
        }
      });

      this.isListening = true;
      console.log('✅ Centralized motion listener started');
    } catch (error) {
      console.error('❌ Failed to start motion listener:', error);
      throw error;
    }
  }

  // Stop the motion listener
  async stopListening() {
    if (!this.isListening) {
      return;
    }

    try {
      console.log('🛑 Stopping centralized motion listener...');
      
      if (this.motionListener) {
        await this.motionListener.remove();
        this.motionListener = null;
      }

      this.isListening = false;
      console.log('✅ Centralized motion listener stopped');
    } catch (error) {
      console.error('❌ Failed to stop motion listener:', error);
    }
  }

  // Get status
  getStatus() {
    return {
      isListening: this.isListening,
      subscriberCount: this.subscribers.size,
      subscribers: Array.from(this.subscribers.values()).map(s => s.name),
      totalEventsReceived: this.totalEventsReceived
    };
  }
}

// Export singleton instance
export default new MotionListenerService();
