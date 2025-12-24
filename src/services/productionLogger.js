// Production Logger Service
// Tracks errors, user actions, performance metrics

class ProductionLogger {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.logs = [];
    this.maxLogsInMemory = 100;
    this.flushInterval = 30000; // 30 seconds
    
    // Auto-flush logs periodically
    if (import.meta.env.PROD) {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log an error
   */
  error(message, error, context = {}) {
    const logEntry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('user_id') || 'anonymous'
    };

    console.error('🚨', message, error, context);
    this.addLog(logEntry);
  }

  /**
   * Log a warning
   */
  warn(message, context = {}) {
    const logEntry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      message,
      context,
      url: window.location.href,
      userId: localStorage.getItem('user_id') || 'anonymous'
    };

    console.warn('⚠️', message, context);
    this.addLog(logEntry);
  }

  /**
   * Log user action (analytics)
   */
  action(actionName, metadata = {}) {
    const logEntry = {
      level: 'ACTION',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      action: actionName,
      metadata,
      userId: localStorage.getItem('user_id') || 'anonymous'
    };

    if (import.meta.env.DEV) {
      console.log('📊', actionName, metadata);
    }
    
    this.addLog(logEntry);
  }

  /**
   * Log performance metric
   */
  performance(metricName, duration, metadata = {}) {
    const logEntry = {
      level: 'PERF',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metric: metricName,
      duration,
      metadata,
      userId: localStorage.getItem('user_id') || 'anonymous'
    };

    if (import.meta.env.DEV) {
      console.log(`⏱️ ${metricName}: ${duration}ms`, metadata);
    }
    
    this.addLog(logEntry);
  }

  /**
   * Track API call
   */
  apiCall(endpoint, method, duration, success, statusCode = null) {
    this.addLog({
      level: 'API',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      endpoint,
      method,
      duration,
      success,
      statusCode,
      userId: localStorage.getItem('user_id') || 'anonymous'
    });
  }

  addLog(logEntry) {
    this.logs.push(logEntry);
    
    // Keep only last N logs in memory
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }

    // Auto-flush if too many errors
    const errorCount = this.logs.filter(l => l.level === 'ERROR').length;
    if (errorCount > 5) {
      this.flush();
    }
  }

  /**
   * Send logs to server
   */
  async flush() {
    if (this.logs.length === 0) return;

    const logsToSend = [...this.logs];
    this.logs = [];

    try {
      const response = await fetch(`${import.meta.env.VITE_RAILWAY_API_URL}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          logs: logsToSend,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.warn('Failed to send logs to server');
        // Put logs back if failed
        this.logs = [...logsToSend, ...this.logs];
      }
    } catch (error) {
      console.warn('Error sending logs:', error);
      // Put logs back if failed
      this.logs = [...logsToSend, ...this.logs];
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      startTime: this.logs[0]?.timestamp,
      totalLogs: this.logs.length,
      errors: this.logs.filter(l => l.level === 'ERROR').length,
      warnings: this.logs.filter(l => l.level === 'WARN').length,
      actions: this.logs.filter(l => l.level === 'ACTION').length,
      apiCalls: this.logs.filter(l => l.level === 'API').length
    };
  }

  /**
   * Download logs as JSON (for debugging)
   */
  downloadLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${this.sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export default new ProductionLogger();
