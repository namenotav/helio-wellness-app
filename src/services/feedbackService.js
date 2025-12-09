// User Feedback Service
// Allows users to submit feedback, report bugs, and suggest features

class FeedbackService {
  constructor() {
    this.feedbackItems = [];
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(type, message, metadata = {}) {
    try {
      const feedback = {
        id: `feedback_${Date.now()}`,
        type: type, // 'bug', 'feature', 'general', 'praise'
        message: message,
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
          url: window.location.href
        },
        status: 'pending'
      };

      // Save locally
      this.feedbackItems.push(feedback);
      this.saveFeedback();

      // In production, would send to server
      if(import.meta.env.DEV)console.log('📝 Feedback submitted:', feedback);

      return { success: true, id: feedback.id };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Feedback submission error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Report a bug
   */
  async reportBug(description, steps = [], screenshot = null) {
    return this.submitFeedback('bug', description, {
      steps: steps,
      screenshot: screenshot,
      errorLogs: this.getRecentErrors()
    });
  }

  /**
   * Suggest a feature
   */
  async suggestFeature(title, description) {
    return this.submitFeedback('feature', `${title}: ${description}`);
  }

  /**
   * Get recent errors for bug reports
   */
  getRecentErrors() {
    try {
      const errorLogs = localStorage.getItem('error_logs');
      if (errorLogs) {
        const errors = JSON.parse(errorLogs);
        return errors.slice(-5); // Last 5 errors
      }
    } catch (e) {
      return [];
    }
    return [];
  }

  /**
   * Save feedback to localStorage
   */
  saveFeedback() {
    try {
      localStorage.setItem('user_feedback', JSON.stringify(this.feedbackItems));
    } catch (e) {
      if(import.meta.env.DEV)console.error('Failed to save feedback:', e);
    }
  }

  /**
   * Load feedback from localStorage
   */
  loadFeedback() {
    try {
      const saved = localStorage.getItem('user_feedback');
      if (saved) {
        this.feedbackItems = JSON.parse(saved);
      }
    } catch (e) {
      if(import.meta.env.DEV)console.error('Failed to load feedback:', e);
    }
  }

  /**
   * Get all feedback
   */
  getAllFeedback() {
    return [...this.feedbackItems];
  }
}

const feedbackService = new FeedbackService();
feedbackService.loadFeedback();

export default feedbackService;



