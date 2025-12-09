// Analytics Service - Google Analytics Integration
// Tracks user behavior and engagement with privacy compliance

const MEASUREMENT_ID = 'G-N7GR8ES3GW';

class AnalyticsService {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
    this.sessionId = this.generateSessionId();
    this.maxEvents = 1000; // Keep last 1000 events
    this.analyticsInitialized = false;
  }

  /**
   * Initialize Google Analytics
   */
  initGoogleAnalytics() {
    if (this.analyticsInitialized) return;

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, {
      send_page_view: false, // Manual page view tracking
      app_name: 'Helio WellnessAI',
      app_version: '1.0.0'
    });

    this.analyticsInitialized = true;
    if(import.meta.env.DEV)console.log('✅ Google Analytics initialized:', MEASUREMENT_ID);
  }

  generateSessionId() {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track page view
   */
  trackPageView(pageName) {
    // Local tracking
    this.trackEvent('page_view', {
      page: pageName,
      url: window.location.href
    });

    // Google Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'screen_view', {
        screen_name: pageName,
        app_name: 'Helio WellnessAI'
      });
    }
  }

  /**
   * Track feature usage
   */
  trackFeatureUse(featureName, metadata = {}) {
    // Local tracking
    this.trackEvent('feature_use', {
      feature: featureName,
      ...metadata
    });

    // Google Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'feature_use', {
        feature_name: featureName,
        ...metadata
      });
    }
  }

  /**
   * Track user action
   */
  trackAction(actionName, metadata = {}) {
    // Local tracking
    this.trackEvent('user_action', {
      action: actionName,
      ...metadata
    });

    // Google Analytics tracking
    if (window.gtag) {
      window.gtag('event', actionName, {
        event_category: 'engagement',
        ...metadata
      });
    }
  }

  /**
   * Track conversion events (sign up, premium upgrade, etc.)
   */
  trackConversion(conversionType, value = 0) {
    // Local tracking
    this.trackEvent('conversion', {
      type: conversionType,
      value: value
    });

    // Google Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        conversion_type: conversionType,
        value: value,
        currency: 'GBP'
      });
    }
  }

  /**
   * Track app performance metrics
   */
  trackPerformance(metricName, duration) {
    this.trackEvent('performance', {
      metric: metricName,
      duration: duration
    });
  }

  /**
   * Core event tracking function
   */
  trackEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      data: data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStart
    };

    this.events.push(event);

    // Keep only last 1000 events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Save to localStorage
    this.saveEvents();

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      if(import.meta.env.DEV)console.log('📊 Analytics:', eventType, data);
    }
  }

  /**
   * Save events to localStorage
   */
  saveEvents() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events));
    } catch (e) {
      // If localStorage is full, remove oldest events
      this.events = this.events.slice(-500);
      localStorage.setItem('analytics_events', JSON.stringify(this.events));
    }
  }

  /**
   * Load events from localStorage
   */
  loadEvents() {
    try {
      const saved = localStorage.getItem('analytics_events');
      if (saved) {
        this.events = JSON.parse(saved);
      }
    } catch (e) {
      if(import.meta.env.DEV)console.error('Failed to load analytics events:', e);
    }
  }

  /**
   * Get usage statistics
   */
  getStats() {
    const stats = {
      totalEvents: this.events.length,
      sessionDuration: Date.now() - this.sessionStart,
      eventsByType: {},
      mostUsedFeatures: [],
      pageViews: []
    };

    // Count events by type
    this.events.forEach(event => {
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
    });

    // Get most used features
    const features = {};
    this.events
      .filter(e => e.type === 'feature_use')
      .forEach(e => {
        const feature = e.data.feature;
        features[feature] = (features[feature] || 0) + 1;
      });
    
    stats.mostUsedFeatures = Object.entries(features)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Get page views
    stats.pageViews = this.events
      .filter(e => e.type === 'page_view')
      .map(e => ({ page: e.data.page, timestamp: e.timestamp }));

    return stats;
  }

  /**
   * Get user engagement metrics
   */
  getEngagementMetrics() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => 
      new Date(e.timestamp).getTime() > last24h
    );

    const weekEvents = this.events.filter(e => 
      new Date(e.timestamp).getTime() > last7d
    );

    return {
      dailyActiveUse: recentEvents.length > 0,
      eventsLast24h: recentEvents.length,
      eventsLast7days: weekEvents.length,
      averageSessionLength: (Date.now() - this.sessionStart) / 1000, // seconds
      totalSessions: 1 // Current session
    };
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }

  /**
   * Export analytics data
   */
  exportAnalytics() {
    const data = {
      sessionId: this.sessionId,
      events: this.events,
      stats: this.getStats(),
      engagement: this.getEngagementMetrics(),
      exportDate: new Date().toISOString()
    };

    return data;
  }
}

// Singleton instance
const analyticsService = new AnalyticsService();
analyticsService.loadEvents();

export const analytics = analyticsService;
export default analyticsService;



