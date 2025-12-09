// Environmental Context AI Service
// Detects location type and adjusts step detection accordingly
// Zero-cost breakthrough feature for Samsung/iPhone-level accuracy

import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

class EnvironmentalContextService {
  constructor() {
    this.currentContext = {
      type: 'unknown', // 'gym', 'vehicle', 'outdoor', 'indoor_mall', 'office', 'home'
      confidence: 0,
      lastUpdate: null,
      recommendedThreshold: 1.1, // Default
      trustGPS: true,
      blockSteps: false
    };

    this.locationHistory = [];
    this.speedHistory = [];
    this.knownLocations = this.loadKnownLocations();
    
    // Context detection thresholds
    this.VEHICLE_SPEED_THRESHOLD = 8.0; // 8 m/s = 28.8 km/h
    this.WALKING_MAX_SPEED = 3.0; // 3 m/s = 10.8 km/h
    this.STATIONARY_SPEED = 0.5; // 0.5 m/s = 1.8 km/h
    
    // Update interval
    this.updateInterval = null;
    this.UPDATE_FREQUENCY = 5000; // Check context every 5 seconds
  }

  async initialize() {
    try {
      if(import.meta.env.DEV)console.log('🌍 Initializing Environmental Context AI...');
      
      if (!Capacitor.isNativePlatform()) {
        if(import.meta.env.DEV)console.warn('⚠️ Not on native platform, context detection limited');
        return false;
      }

      // Load historical pattern data
      this.knownLocations = this.loadKnownLocations();
      if(import.meta.env.DEV)console.log('📍 Loaded', Object.keys(this.knownLocations).length, 'known locations');

      // Start periodic context detection
      this.updateInterval = setInterval(() => {
        this.updateContext();
      }, this.UPDATE_FREQUENCY);

      // Initial context check
      await this.updateContext();

      if(import.meta.env.DEV)console.log('✅ Environmental Context AI initialized');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Context AI initialization failed:', error);
      return false;
    }
  }

  async updateContext() {
    try {
      // Get current GPS data
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false, // Low power mode
        timeout: 5000
      });

      const speed = position.coords.speed || 0;
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      // Add to history
      this.speedHistory.push(speed);
      if (this.speedHistory.length > 20) this.speedHistory.shift();

      this.locationHistory.push({ lat, lon, timestamp: Date.now() });
      if (this.locationHistory.length > 10) this.locationHistory.shift();

      // Detect context
      const context = this.detectContextFromData(speed, lat, lon, accuracy);
      
      // Update current context
      if (context.confidence > 0.7 || this.currentContext.type === 'unknown') {
        this.currentContext = context;
        this.currentContext.lastUpdate = Date.now();
        
        if(import.meta.env.DEV)console.log('🌍 Context:', context.type, '| Confidence:', (context.confidence * 100).toFixed(0) + '%', '| Threshold:', context.recommendedThreshold);
      }

      // Learn location if stationary
      if (context.type === 'office' || context.type === 'home' || context.type === 'gym') {
        this.learnLocation(lat, lon, context.type);
      }

    } catch (error) {
      // GPS error - assume indoor
      this.currentContext = {
        type: 'indoor_unknown',
        confidence: 0.6,
        lastUpdate: Date.now(),
        recommendedThreshold: 1.1,
        trustGPS: false,
        blockSteps: false
      };
    }
  }

  detectContextFromData(speed, lat, lon, accuracy) {
    const avgSpeed = this.speedHistory.length > 0 
      ? this.speedHistory.reduce((a, b) => a + b) / this.speedHistory.length 
      : speed;

    const hour = new Date().getHours();
    const isNightTime = hour < 6 || hour > 22;

    // VEHICLE DETECTION (highest priority - blocks false steps)
    if (avgSpeed > this.VEHICLE_SPEED_THRESHOLD && speed > this.VEHICLE_SPEED_THRESHOLD * 0.8) {
      return {
        type: 'vehicle',
        confidence: 0.95,
        recommendedThreshold: 2.0, // Very strict - block most movement
        trustGPS: true,
        blockSteps: true, // Strong recommendation to block
        reason: 'High speed detected (' + speed.toFixed(1) + ' m/s)'
      };
    }

    // STATIONARY DETECTION
    if (avgSpeed < this.STATIONARY_SPEED) {
      // Check if this is a known location
      const knownLocation = this.findNearbyKnownLocation(lat, lon);
      
      if (knownLocation) {
        return {
          type: knownLocation.type,
          confidence: 0.85,
          recommendedThreshold: 1.15,
          trustGPS: false,
          blockSteps: false,
          reason: 'Known location: ' + knownLocation.name
        };
      }

      // Unknown stationary location
      if (isNightTime) {
        return {
          type: 'home',
          confidence: 0.7,
          recommendedThreshold: 1.3, // Stricter at night
          trustGPS: false,
          blockSteps: false,
          reason: 'Stationary at night'
        };
      } else {
        return {
          type: 'office',
          confidence: 0.6,
          recommendedThreshold: 1.2,
          trustGPS: false,
          blockSteps: false,
          reason: 'Stationary during day'
        };
      }
    }

    // OUTDOOR WALKING (GPS reliable)
    if (speed > this.STATIONARY_SPEED && speed < this.WALKING_MAX_SPEED && accuracy < 20) {
      return {
        type: 'outdoor',
        confidence: 0.9,
        recommendedThreshold: 1.0, // More lenient - GPS validates
        trustGPS: true,
        blockSteps: false,
        reason: 'Walking speed with good GPS'
      };
    }

    // INDOOR (poor GPS accuracy)
    if (accuracy > 50) {
      return {
        type: 'indoor_mall',
        confidence: 0.75,
        recommendedThreshold: 1.15,
        trustGPS: false, // GPS unreliable indoors
        blockSteps: false,
        reason: 'Poor GPS accuracy (indoor)'
      };
    }

    // DEFAULT - UNKNOWN
    return {
      type: 'unknown',
      confidence: 0.5,
      recommendedThreshold: 1.1,
      trustGPS: true,
      blockSteps: false,
      reason: 'Uncertain context'
    };
  }

  findNearbyKnownLocation(lat, lon) {
    const RADIUS = 100; // 100 meters

    for (const locationId in this.knownLocations) {
      const location = this.knownLocations[locationId];
      const distance = this.calculateDistance(lat, lon, location.lat, location.lon);
      
      if (distance < RADIUS) {
        return location;
      }
    }

    return null;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula for distance in meters
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  learnLocation(lat, lon, type) {
    const locationId = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
    
    if (!this.knownLocations[locationId]) {
      this.knownLocations[locationId] = {
        lat,
        lon,
        type,
        name: type.replace('_', ' '),
        visits: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now()
      };
    } else {
      this.knownLocations[locationId].visits++;
      this.knownLocations[locationId].lastSeen = Date.now();
    }

    // Save every 10th learning event
    if (Object.keys(this.knownLocations).length % 10 === 0) {
      this.saveKnownLocations();
    }
  }

  loadKnownLocations() {
    try {
      const saved = localStorage.getItem('helio_known_locations');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error loading known locations:', error);
      return {};
    }
  }

  saveKnownLocations() {
    try {
      localStorage.setItem('helio_known_locations', JSON.stringify(this.knownLocations));
      if(import.meta.env.DEV)console.log('💾 Saved', Object.keys(this.knownLocations).length, 'known locations');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error saving known locations:', error);
    }
  }

  getCurrentContext() {
    return this.currentContext;
  }

  getRecommendedThreshold() {
    return this.currentContext.recommendedThreshold;
  }

  shouldBlockSteps() {
    // Only block if in vehicle with high confidence
    return this.currentContext.blockSteps && this.currentContext.confidence > 0.85;
  }

  shouldTrustGPS() {
    return this.currentContext.trustGPS;
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.saveKnownLocations();
    if(import.meta.env.DEV)console.log('✅ Environmental Context AI stopped');
  }
}

export default new EnvironmentalContextService();



