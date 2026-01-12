// Event Bus - Real-time UI update system
// Allows services to notify UI components when data changes

class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name (e.g., 'workout-logged', 'meal-logged')
   * @param {Function} callback - Function to call when event fires
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback to remove
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    
    // Clean up empty arrays
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }

  /**
   * Emit an event to all subscribers
   * @param {string} event - Event name
   * @param {*} data - Data to pass to callbacks
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    
    if(import.meta.env.DEV)console.log(`📡 EventBus: ${event}`, data ? `(${Object.keys(data).length} keys)` : '');
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`EventBus error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} [event] - Optional event name. If not provided, clears all.
   */
  clear(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Get count of listeners for debugging
   */
  getListenerCount(event) {
    return event ? (this.listeners[event]?.length || 0) : 
           Object.values(this.listeners).reduce((sum, arr) => sum + arr.length, 0);
  }
}

// Export singleton instance
export default new EventBus();

/**
 * USAGE EXAMPLES:
 * 
 * In a service (e.g., workoutService.js):
 * ```javascript
 * import eventBus from './eventBus';
 * 
 * async logWorkout(data) {
 *   // ... save logic ...
 *   eventBus.emit('workout-logged', { workout: data });
 * }
 * ```
 * 
 * In a component (e.g., StatsModal.jsx):
 * ```javascript
 * import eventBus from '../services/eventBus';
 * 
 * useEffect(() => {
 *   const unsubscribe = eventBus.on('workout-logged', (data) => {
 *     loadStats(); // Refresh stats
 *   });
 *   
 *   return () => unsubscribe(); // Cleanup on unmount
 * }, []);
 * ```
 * 
 * STANDARD EVENTS:
 * - 'workout-logged' - New workout saved
 * - 'meal-logged' - New meal saved
 * - 'sleep-logged' - New sleep session saved
 * - 'water-logged' - Water intake logged
 * - 'steps-updated' - Step count updated
 * - 'data-synced' - Data synced to cloud
 * - 'profile-updated' - User profile changed
 */
