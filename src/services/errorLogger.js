// Error Logging & Crash Reporting Service
// Captures errors for debugging without external dependencies

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'unhandled_error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    if(import.meta.env.DEV)console.log('🛡️ Error logging initialized');
  }

  /**
   * Log an error
   */
  logError(errorData) {
    const enrichedError = {
      ...errorData,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: errorData.timestamp || new Date().toISOString()
    };

    this.errors.push(enrichedError);

    // Keep only last 100 errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Save to localStorage for persistence
    this.saveErrors();

    // Log to console in development
    if(import.meta.env.DEV)console.error('📛 Error logged:', enrichedError);
  }

  /**
   * Log API errors specifically
   */
  logAPIError(endpoint, status, message) {
    this.logError({
      type: 'api_error',
      endpoint: endpoint,
      status: status,
      message: message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log user action errors
   */
  logUserActionError(action, error) {
    this.logError({
      type: 'user_action_error',
      action: action,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Save errors to localStorage
   */
  saveErrors() {
    try {
      localStorage.setItem('error_logs', JSON.stringify(this.errors));
    } catch (e) {
      // If localStorage is full, remove oldest errors
      this.errors = this.errors.slice(-50);
      localStorage.setItem('error_logs', JSON.stringify(this.errors));
    }
  }

  /**
   * Load errors from localStorage
   */
  loadErrors() {
    try {
      const saved = localStorage.getItem('error_logs');
      if (saved) {
        this.errors = JSON.parse(saved);
      }
    } catch (e) {
      if(import.meta.env.DEV)console.error('Failed to load error logs:', e);
    }
  }

  /**
   * Get all errors
   */
  getAllErrors() {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type) {
    return this.errors.filter(e => e.type === type);
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    localStorage.removeItem('error_logs');
  }

  /**
   * Get error report for support
   */
  getErrorReport() {
    return {
      sessionId: this.sessionId,
      totalErrors: this.errors.length,
      errors: this.errors,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export errors as JSON for debugging
   */
  exportErrors() {
    const report = this.getErrorReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();
errorLogger.loadErrors();

export default errorLogger;



