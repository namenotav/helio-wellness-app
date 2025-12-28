// Real-time Monitoring Service
// Tracks app health, API performance, errors, and user metrics

class MonitoringService {
  constructor() {
    this.metrics = {
      apiCalls: [],
      errors: [],
      performance: [],
      userActions: []
    };
    this.maxStoredMetrics = 1000; // Keep last 1000 of each type
    this.startTime = Date.now();
    
    // Load persisted metrics
    this.loadMetrics();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  // API Call Monitoring
  trackAPICall(endpoint, method, duration, success, statusCode) {
    const metric = {
      endpoint,
      method,
      duration,
      success,
      statusCode,
      timestamp: Date.now()
    };
    
    this.metrics.apiCalls.push(metric);
    this.trimMetrics('apiCalls');
    this.saveMetrics();
    
    // Log slow API calls
    if (duration > 3000) {
      console.warn(`⚠️ Slow API call: ${endpoint} took ${duration}ms`);
    }
    
    // Log failed calls
    if (!success) {
      console.error(`❌ API call failed: ${endpoint} - Status ${statusCode}`);
    }
    
    return metric;
  }

  // Error Monitoring
  trackError(error, context = {}) {
    const errorMetric = {
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.metrics.errors.push(errorMetric);
    this.trimMetrics('errors');
    this.saveMetrics();
    
    // Log to console in dev
    if(import.meta.env.DEV) {
      console.error('🔴 Error tracked:', errorMetric);
    }
    
    return errorMetric;
  }

  // Performance Monitoring
  trackPerformance(label, duration, metadata = {}) {
    const metric = {
      label,
      duration,
      metadata,
      timestamp: Date.now()
    };
    
    this.metrics.performance.push(metric);
    this.trimMetrics('performance');
    this.saveMetrics();
    
    return metric;
  }

  // User Action Monitoring
  trackUserAction(action, metadata = {}) {
    const metric = {
      action,
      metadata,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime
    };
    
    this.metrics.userActions.push(metric);
    this.trimMetrics('userActions');
    this.saveMetrics();
    
    return metric;
  }

  // Get API Health Stats
  getAPIHealth(minutes = 5) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentCalls = this.metrics.apiCalls.filter(m => m.timestamp > cutoff);
    
    if (recentCalls.length === 0) {
      return { status: 'no_data', totalCalls: 0 };
    }
    
    const successful = recentCalls.filter(m => m.success).length;
    const failed = recentCalls.length - successful;
    const avgDuration = recentCalls.reduce((sum, m) => sum + m.duration, 0) / recentCalls.length;
    const successRate = (successful / recentCalls.length) * 100;
    
    return {
      status: successRate > 95 ? 'healthy' : successRate > 80 ? 'degraded' : 'critical',
      totalCalls: recentCalls.length,
      successful,
      failed,
      successRate: successRate.toFixed(2),
      avgDuration: Math.round(avgDuration),
      timeWindow: `${minutes}min`
    };
  }

  // Get Error Rate
  getErrorRate(minutes = 5) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentErrors = this.metrics.errors.filter(m => m.timestamp > cutoff);
    
    return {
      totalErrors: recentErrors.length,
      errorsPerMinute: (recentErrors.length / minutes).toFixed(2),
      recentErrors: recentErrors.slice(-10), // Last 10 errors
      timeWindow: `${minutes}min`
    };
  }

  // Get Performance Stats
  getPerformanceStats(minutes = 5) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metrics.performance.filter(m => m.timestamp > cutoff);
    
    if (recentMetrics.length === 0) {
      return { avgDuration: 0, count: 0 };
    }
    
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    
    return {
      avgDuration: Math.round(avgDuration),
      count: recentMetrics.length,
      timeWindow: `${minutes}min`
    };
  }

  // Get User Activity
  getUserActivity(minutes = 5) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentActions = this.metrics.userActions.filter(m => m.timestamp > cutoff);
    
    // Count action types
    const actionCounts = {};
    recentActions.forEach(m => {
      actionCounts[m.action] = (actionCounts[m.action] || 0) + 1;
    });
    
    return {
      totalActions: recentActions.length,
      actionsPerMinute: (recentActions.length / minutes).toFixed(2),
      topActions: Object.entries(actionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([action, count]) => ({ action, count })),
      timeWindow: `${minutes}min`
    };
  }

  // Get Complete Dashboard Stats
  getDashboard(minutes = 5) {
    return {
      apiHealth: this.getAPIHealth(minutes),
      errorRate: this.getErrorRate(minutes),
      performance: this.getPerformanceStats(minutes),
      userActivity: this.getUserActivity(minutes),
      uptime: this.getUptime(),
      timestamp: new Date().toISOString()
    };
  }

  // Get Session Uptime
  getUptime() {
    const uptimeMs = Date.now() - this.startTime;
    const minutes = Math.floor(uptimeMs / 60000);
    const seconds = Math.floor((uptimeMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  // Setup Performance Observer
  setupPerformanceMonitoring() {
    // Monitor page load time
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            this.trackPerformance('page_load', perfData.loadEventEnd - perfData.fetchStart, {
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
              domInteractive: perfData.domInteractive - perfData.fetchStart
            });
          }
        }, 0);
      });
    }
  }

  // Trim metrics to prevent memory bloat
  trimMetrics(type) {
    if (this.metrics[type].length > this.maxStoredMetrics) {
      this.metrics[type] = this.metrics[type].slice(-this.maxStoredMetrics);
    }
  }

  // Save metrics to localStorage
  saveMetrics() {
    try {
      // Only save summary, not full metrics (to avoid localStorage limits)
      const summary = {
        apiCallsCount: this.metrics.apiCalls.length,
        errorsCount: this.metrics.errors.length,
        performanceCount: this.metrics.performance.length,
        userActionsCount: this.metrics.userActions.length,
        lastUpdate: Date.now()
      };
      localStorage.setItem('monitoring_summary', JSON.stringify(summary));
    } catch (error) {
      console.warn('Failed to save monitoring metrics:', error);
    }
  }

  // Load metrics from localStorage
  loadMetrics() {
    try {
      const summary = localStorage.getItem('monitoring_summary');
      if (summary) {
        const data = JSON.parse(summary);
        if(import.meta.env.DEV) {
          console.log('📊 Monitoring loaded:', data);
        }
      }
    } catch (error) {
      console.warn('Failed to load monitoring metrics:', error);
    }
  }

  // Export metrics for debugging
  exportMetrics() {
    return {
      ...this.metrics,
      dashboard: this.getDashboard(60) // Last hour
    };
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = {
      apiCalls: [],
      errors: [],
      performance: [],
      userActions: []
    };
    localStorage.removeItem('monitoring_summary');
    console.log('✅ Monitoring metrics cleared');
  }
}

// Singleton instance
const monitoringService = new MonitoringService();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitoringService.trackError(event.error || new Error(event.message), {
      type: 'uncaught_error',
      filename: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoringService.trackError(event.reason || new Error('Unhandled Promise Rejection'), {
      type: 'unhandled_promise'
    });
  });
}

export default monitoringService;
