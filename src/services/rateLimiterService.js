// Rate Limiter Service - Prevents API abuse and cost overruns
// Limits AI API calls per user per time window

class RateLimiterService {
  constructor() {
    this.limits = {
      gemini_chat: { max: 100, window: 3600000 }, // 100 per hour
      gemini_vision: { max: 50, window: 3600000 }, // 50 per hour
      gemini_meal_plan: { max: 10, window: 86400000 }, // 10 per day
      stripe_checkout: { max: 5, window: 300000 }, // 5 per 5 mins
      support_ticket: { max: 10, window: 86400000 } // 10 per day
    };
    
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('rate_limit_history');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('rate_limit_history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save rate limit history:', error);
    }
  }

  /**
   * Check if action is allowed
   * @param {string} action - Action type (e.g., 'gemini_chat')
   * @param {string} userId - User ID
   * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date }
   */
  checkLimit(action, userId = 'anonymous') {
    const limit = this.limits[action];
    if (!limit) {
      console.warn(`No rate limit defined for action: ${action}`);
      return { allowed: true, remaining: 999, resetAt: null };
    }

    const key = `${userId}_${action}`;
    const now = Date.now();
    
    // Initialize or clean old entries
    if (!this.history[key]) {
      this.history[key] = [];
    }
    
    // Remove timestamps outside the window
    this.history[key] = this.history[key].filter(
      timestamp => now - timestamp < limit.window
    );

    const count = this.history[key].length;
    const remaining = Math.max(0, limit.max - count);
    const resetAt = this.history[key][0] 
      ? new Date(this.history[key][0] + limit.window)
      : new Date(now + limit.window);

    if (count >= limit.max) {
      console.warn(`⛔ Rate limit exceeded for ${action}: ${count}/${limit.max}`);
      return { 
        allowed: false, 
        remaining: 0, 
        resetAt,
        message: `Too many requests. Try again at ${resetAt.toLocaleTimeString()}`
      };
    }

    return { allowed: true, remaining, resetAt };
  }

  /**
   * Record an action (call after API success)
   */
  recordAction(action, userId = 'anonymous') {
    const key = `${userId}_${action}`;
    if (!this.history[key]) {
      this.history[key] = [];
    }
    
    this.history[key].push(Date.now());
    this.saveHistory();
    
    if (import.meta.env.DEV) {
      console.log(`📊 Rate limit: ${action} - ${this.history[key].length}/${this.limits[action].max}`);
    }
  }

  /**
   * Get current usage stats for a user
   */
  getUsageStats(userId = 'anonymous') {
    const stats = {};
    
    Object.keys(this.limits).forEach(action => {
      const check = this.checkLimit(action, userId);
      stats[action] = {
        used: this.limits[action].max - check.remaining,
        limit: this.limits[action].max,
        remaining: check.remaining,
        resetAt: check.resetAt
      };
    });
    
    return stats;
  }

  /**
   * Reset limits for a user (admin only)
   */
  resetUser(userId) {
    Object.keys(this.history).forEach(key => {
      if (key.startsWith(`${userId}_`)) {
        delete this.history[key];
      }
    });
    this.saveHistory();
    console.log(`🔄 Reset rate limits for user: ${userId}`);
  }

  /**
   * Clean old history entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    Object.keys(this.history).forEach(key => {
      const action = key.split('_').slice(1).join('_');
      const limit = this.limits[action];
      
      if (limit) {
        const before = this.history[key].length;
        this.history[key] = this.history[key].filter(
          timestamp => now - timestamp < limit.window
        );
        cleaned += before - this.history[key].length;
        
        if (this.history[key].length === 0) {
          delete this.history[key];
        }
      }
    });
    
    if (cleaned > 0) {
      this.saveHistory();
      console.log(`🧹 Cleaned ${cleaned} old rate limit entries`);
    }
  }
}

export default new RateLimiterService();
