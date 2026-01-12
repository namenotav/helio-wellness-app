// Pattern Learning Service
// Learns user's daily walking patterns and predicts expected activity
// Zero-cost breakthrough feature for Samsung/iPhone-level accuracy

class PatternLearningService {
  constructor() {
    this.patterns = this.loadPatterns();
    this.currentSession = {
      startTime: null,
      steps: 0,
      context: 'unknown'
    };
    
    // Time-based pattern buckets (hourly)
    this.hourlyPatterns = Array(24).fill(null).map(() => ({
      expectedSteps: 0,
      avgSteps: 0,
      sessions: 0,
      confidence: 0
    }));

    // Day-of-week patterns
    this.dailyPatterns = Array(7).fill(null).map(() => ({
      expectedSteps: 0,
      avgSteps: 0,
      peakHours: [],
      confidence: 0
    }));

    // Location-based patterns
    this.locationPatterns = {};
    
    // Anomaly detection
    this.recentAnomalies = [];
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Pattern Learning AI...');
      
      // Load historical patterns
      this.patterns = this.loadPatterns();
      this.analyzeHistoricalData();
      
      console.log('📊 Pattern statistics:');
      console.log('   - Training sessions:', this.patterns.totalSessions || 0);
      console.log('   - Days of data:', this.patterns.daysOfData || 0);
      console.log('   - Peak hours:', this.getPeakHours().join(', '));
      
      console.log('✅ Pattern Learning AI initialized');
      return true;
    } catch (error) {
      console.error('❌ Pattern Learning initialization failed:', error);
      return false;
    }
  }

  analyzeHistoricalData() {
    if (!this.patterns.sessions || this.patterns.sessions.length === 0) {
      console.log('📚 No historical data yet - learning mode active');
      return;
    }

    // Analyze hourly patterns
    for (let hour = 0; hour < 24; hour++) {
      const hourSessions = this.patterns.sessions.filter(s => {
        const sessionHour = new Date(s.timestamp).getHours();
        return sessionHour === hour;
      });

      if (hourSessions.length > 0) {
        const totalSteps = hourSessions.reduce((sum, s) => sum + s.steps, 0);
        this.hourlyPatterns[hour].avgSteps = totalSteps / hourSessions.length;
        this.hourlyPatterns[hour].sessions = hourSessions.length;
        this.hourlyPatterns[hour].confidence = Math.min(hourSessions.length / 10, 1); // Max confidence after 10 sessions
      }
    }

    // Analyze daily patterns
    for (let day = 0; day < 7; day++) {
      const daySessions = this.patterns.sessions.filter(s => {
        const sessionDay = new Date(s.timestamp).getDay();
        return sessionDay === day;
      });

      if (daySessions.length > 0) {
        const totalSteps = daySessions.reduce((sum, s) => sum + s.steps, 0);
        this.dailyPatterns[day].avgSteps = totalSteps / daySessions.length;
        this.dailyPatterns[day].confidence = Math.min(daySessions.length / 5, 1);
      }
    }

    console.log('📈 Pattern analysis complete');
  }

  recordSession(steps, context, duration) {
    const now = Date.now();
    const hour = new Date().getHours();
    const day = new Date().getDay();

    const session = {
      timestamp: now,
      hour,
      day,
      steps,
      context,
      duration
    };

    // Initialize sessions array if needed
    if (!this.patterns.sessions) {
      this.patterns.sessions = [];
    }

    this.patterns.sessions.push(session);

    // Keep only last 100 sessions to avoid storage bloat
    if (this.patterns.sessions.length > 100) {
      this.patterns.sessions.shift();
    }

    // Update stats
    this.patterns.totalSessions = (this.patterns.totalSessions || 0) + 1;
    this.patterns.totalSteps = (this.patterns.totalSteps || 0) + steps;
    this.patterns.lastUpdate = now;

    // Calculate days of data
    const oldestSession = this.patterns.sessions[0];
    const daysDiff = Math.floor((now - oldestSession.timestamp) / (1000 * 60 * 60 * 24));
    this.patterns.daysOfData = daysDiff + 1;

    // Re-analyze patterns
    this.analyzeHistoricalData();

    // Save to storage
    this.savePatterns();

    console.log('💾 Session recorded:', steps, 'steps at', hour + ':00');
  }

  getExpectedStepsForCurrentTime() {
    const hour = new Date().getHours();
    const pattern = this.hourlyPatterns[hour];

    if (pattern.confidence > 0.5) {
      return {
        expected: pattern.avgSteps,
        confidence: pattern.confidence,
        hasPattern: true
      };
    }

    return {
      expected: 0,
      confidence: 0,
      hasPattern: false
    };
  }

  isCurrentTimeTypicalForWalking() {
    const hour = new Date().getHours();
    const pattern = this.hourlyPatterns[hour];

    // Consider typical if this hour usually has steps
    return pattern.avgSteps > 50 && pattern.confidence > 0.4;
  }

  isPeakWalkingTime() {
    const hour = new Date().getHours();
    const peakHours = this.getPeakHours();
    return peakHours.includes(hour);
  }

  getPeakHours() {
    // Find hours with highest average steps
    const sortedHours = this.hourlyPatterns
      .map((pattern, hour) => ({ hour, avgSteps: pattern.avgSteps, confidence: pattern.confidence }))
      .filter(h => h.confidence > 0.3)
      .sort((a, b) => b.avgSteps - a.avgSteps)
      .slice(0, 3)
      .map(h => h.hour);

    return sortedHours;
  }

  detectAnomaly(currentSteps, timeWindow) {
    const expected = this.getExpectedStepsForCurrentTime();
    
    if (!expected.hasPattern) {
      return { isAnomaly: false, confidence: 0 };
    }

    // Calculate deviation
    const deviation = Math.abs(currentSteps - expected.expected) / (expected.expected + 1);

    // Anomaly if deviation > 200% and high confidence in pattern
    const isAnomaly = deviation > 2.0 && expected.confidence > 0.7;

    if (isAnomaly) {
      const anomaly = {
        timestamp: Date.now(),
        currentSteps,
        expectedSteps: expected.expected,
        deviation: deviation * 100,
        hour: new Date().getHours()
      };

      this.recentAnomalies.push(anomaly);
      if (this.recentAnomalies.length > 10) {
        this.recentAnomalies.shift();
      }

      console.log('⚠️ ANOMALY DETECTED:', currentSteps, 'steps (expected ~' + expected.expected.toFixed(0) + ')');
    }

    return {
      isAnomaly,
      confidence: expected.confidence,
      deviation: deviation * 100,
      expected: expected.expected
    };
  }

  shouldLowerThreshold() {
    // Lower threshold during peak walking hours (more lenient detection)
    if (this.isPeakWalkingTime()) {
      return { lower: true, reason: 'Peak walking hour', adjustment: 0.9 };
    }

    // User typically walks at this time
    if (this.isCurrentTimeTypicalForWalking()) {
      return { lower: true, reason: 'Typical walking time', adjustment: 0.95 };
    }

    return { lower: false, reason: 'Not typical walking time', adjustment: 1.0 };
  }

  shouldBlockSteps() {
    const hour = new Date().getHours();
    const pattern = this.hourlyPatterns[hour];

    // Block if this is a highly unusual time and we have high confidence
    const isSleepTime = (hour >= 0 && hour < 6) || hour > 23;
    const hasData = pattern.confidence > 0.6;
    const usuallySleeping = pattern.avgSteps < 10;

    if (isSleepTime && hasData && usuallySleeping) {
      return { block: true, reason: 'Sleep time (no typical activity)', confidence: 0.8 };
    }

    return { block: false, reason: 'Normal activity time', confidence: 0 };
  }

  getRecommendedThresholdAdjustment() {
    // Adjust threshold based on learned patterns
    const lowerThreshold = this.shouldLowerThreshold();
    const blockSteps = this.shouldBlockSteps();

    if (blockSteps.block) {
      return { adjustment: 1.5, reason: blockSteps.reason }; // Much stricter
    }

    if (lowerThreshold.lower) {
      return { adjustment: lowerThreshold.adjustment, reason: lowerThreshold.reason };
    }

    return { adjustment: 1.0, reason: 'No pattern adjustment' };
  }

  async loadPatterns() {
    try {
      // 🔥 FIX: Try Firebase first, then localStorage
      try {
        const firestoreService = (await import('./firestoreService.js')).default;
        const authService = (await import('./authService.js')).default;
        const cloudPatterns = await firestoreService.get('helio_pattern_learning', authService.getCurrentUser()?.uid);
        if (cloudPatterns && cloudPatterns.totalSessions > 0) {
          localStorage.setItem('helio_pattern_learning', JSON.stringify(cloudPatterns));
          console.log('📚 Loaded pattern data from cloud:', cloudPatterns.totalSessions, 'sessions');
          return cloudPatterns;
        }
      } catch (e) { /* fallback to localStorage */ }
      
      const saved = localStorage.getItem('helio_pattern_learning');
      if (saved) {
        const patterns = JSON.parse(saved);
        console.log('📚 Loaded pattern data:', patterns.totalSessions || 0, 'sessions');
        return patterns;
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
    }

    return {
      sessions: [],
      totalSessions: 0,
      totalSteps: 0,
      daysOfData: 0,
      lastUpdate: null
    };
  }

  async savePatterns() {
    try {
      localStorage.setItem('helio_pattern_learning', JSON.stringify(this.patterns));
      
      // 🔥 FIX: Sync to Firebase
      try {
        const firestoreService = (await import('./firestoreService.js')).default;
        const authService = (await import('./authService.js')).default;
        await firestoreService.save('helio_pattern_learning', this.patterns, authService.getCurrentUser()?.uid);
      } catch (e) { /* offline mode */ }
    } catch (error) {
      console.error('Error saving patterns:', error);
    }
  }

  getPatternSummary() {
    return {
      daysOfData: this.patterns.daysOfData || 0,
      totalSessions: this.patterns.totalSessions || 0,
      peakHours: this.getPeakHours(),
      currentHourPattern: this.hourlyPatterns[new Date().getHours()],
      isLearning: (this.patterns.daysOfData || 0) < 7
    };
  }

  reset() {
    this.patterns = {
      sessions: [],
      totalSessions: 0,
      totalSteps: 0,
      daysOfData: 0,
      lastUpdate: null
    };
    this.savePatterns();
    console.log('🔄 Pattern data reset');
  }
}

export default new PatternLearningService();
