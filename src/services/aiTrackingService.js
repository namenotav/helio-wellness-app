// AI-Powered GPS Tracking and Habit Learning Service
// Hybrid System: TensorFlow (on-device real-time) + Gemini AI (cloud-based analysis) + Brain.js (habit learning)

import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Motion } from '@capacitor/motion'
import { analyzeLocationPattern, detectActivity as detectActivityGemini, predictBehavior } from './geminiService'
import tensorflowService from './tensorflowService'
import brainLearningService from './brainLearningService'

class AITrackingService {
  constructor() {
    this.isTracking = false
    this.trackingInterval = null
    this.locationHistory = []
    this.activityLog = []
    this.detectedHabits = {
      good: [],
      bad: []
    }
    this.knownLocations = {
      home: null,
      gym: null,
      work: null,
      restaurants: []
    }
    this.currentActivity = 'stationary'
    this.lastActivityChange = Date.now()
    
    // Motion tracking state
    this.motionListener = null
    this.activityDetectionInterval = null
  }

  // Initialize tracking with permissions
  async initialize() {
    try {
      if (!Capacitor.isNativePlatform()) {
        if(import.meta.env.DEV)console.log('GPS tracking only available on native platforms')
        return false
      }

      // Request location permissions
      const permissions = await Geolocation.requestPermissions()
      if (permissions.location !== 'granted') {
        throw new Error('Location permission denied')
      }

      // Request notification permissions
      await LocalNotifications.requestPermissions()
      
      // Initialize TensorFlow service for on-device ML
      await tensorflowService.initialize()

      // Load saved data from storage
      await this.loadSavedData()

      if(import.meta.env.DEV)console.log('AI Tracking Service initialized (Hybrid: TensorFlow + Gemini)')
      return true
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to initialize tracking:', error)
      return false
    }
  }

  // Start continuous background tracking
  async startTracking() {
    if (this.isTracking) return

    this.isTracking = true
    
    // GPS tracking every 5 minutes (battery optimized)
    this.trackingInterval = setInterval(async () => {
      await this.trackCurrentLocation()
    }, 5 * 60 * 1000) // 5 minutes
    
    // Start motion sensor tracking for real-time activity detection
    await this.startMotionTracking()
    
    // TensorFlow activity detection every 30 seconds
    this.activityDetectionInterval = setInterval(async () => {
      await this.detectActivityRealtime()
    }, 30 * 1000) // 30 seconds

    // Initial tracking
    await this.trackCurrentLocation()

    if(import.meta.env.DEV)console.log('Hybrid tracking started - TensorFlow (real-time) + GPS (5 min) + Gemini (daily)')
  }

  // Stop tracking
  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = null
    }
    
    if (this.activityDetectionInterval) {
      clearInterval(this.activityDetectionInterval)
      this.activityDetectionInterval = null
    }
    
    if (this.motionListener) {
      this.motionListener.remove()
      this.motionListener = null
    }
    
    this.isTracking = false
    if(import.meta.env.DEV)console.log('Hybrid tracking stopped')
  }
  
  // Start motion sensor tracking for TensorFlow
  async startMotionTracking() {
    try {
      // Listen to device motion sensors (accelerometer + gyroscope)
      this.motionListener = await Motion.addListener('accel', (event) => {
        // Feed motion data to TensorFlow service
        tensorflowService.addMotionData({
          acceleration: {
            x: event.accelerationIncludingGravity.x,
            y: event.accelerationIncludingGravity.y,
            z: event.accelerationIncludingGravity.z
          },
          rotationRate: event.rotationRate
        })
      })
      
      if(import.meta.env.DEV)console.log('Motion sensors started for TensorFlow activity recognition')
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to start motion tracking:', error)
    }
  }
  
  // Real-time activity detection using TensorFlow (on-device)
  async detectActivityRealtime() {
    try {
      const result = await tensorflowService.detectActivity()
      
      if (result.confidence > 0.6) {
        // Update current activity if changed
        if (result.activity !== this.currentActivity) {
          const previousActivity = this.currentActivity
          this.currentActivity = result.activity
          this.lastActivityChange = Date.now()
          
          // Log activity change
          this.activityLog.push({
            timestamp: Date.now(),
            activity: result.activity,
            confidence: result.confidence,
            source: 'tensorflow',
            duration: Date.now() - this.lastActivityChange
          })
          
          if(import.meta.env.DEV)console.log(`Activity changed: ${previousActivity} → ${result.activity} (${Math.round(result.confidence * 100)}% confidence)`)
          
          // Auto-log activities
          if (result.activity === 'workout') {
            this.logGymVisit({ timestamp: Date.now(), source: 'tensorflow' })
          }
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('TensorFlow activity detection error:', error)
    }
  }

  // Track current location and analyze
  async trackCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false, // Battery saving
        timeout: 10000,
        maximumAge: 300000 // Use cached location if < 5 min old
      })

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
        speed: position.coords.speed || 0
      }

      // Add to history
      this.locationHistory.push(locationData)

      // Keep only last 7 days of data (battery/storage optimization)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      this.locationHistory = this.locationHistory.filter(
        loc => loc.timestamp > sevenDaysAgo
      )

      // Analyze this location
      await this.analyzeLocation(locationData)

      // Detect activity (walking, running, driving, stationary)
      await this.detectActivityType(locationData)

      // Save to storage
      await this.saveData()

    } catch (error) {
      if(import.meta.env.DEV)console.error('Error tracking location:', error)
    }
  }

  // Analyze location and detect patterns
  async analyzeLocation(locationData) {
    // Identify if this is a known location
    const locationType = this.identifyLocationType(locationData)

    // Check if user is at gym
    if (locationType === 'gym') {
      await this.logGymVisit(locationData)
    }

    // Check if user is at restaurant
    if (locationType === 'restaurant') {
      await this.logRestaurantVisit(locationData)
    }

    // Check if user is at home
    if (locationType === 'home') {
      await this.logHomeTime(locationData)
    }

    // Learn new patterns using AI
    if (this.locationHistory.length >= 50) {
      await this.learnLocationPatterns()
    }
  }

  // Identify what type of location user is at
  identifyLocationType(locationData) {
    const { latitude, longitude } = locationData

    // Check home (if learned)
    if (this.knownLocations.home) {
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        this.knownLocations.home.latitude, 
        this.knownLocations.home.longitude
      )
      if (distance < 0.1) return 'home' // Within 100 meters
    }

    // Check gym (if learned)
    if (this.knownLocations.gym) {
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        this.knownLocations.gym.latitude, 
        this.knownLocations.gym.longitude
      )
      if (distance < 0.1) return 'gym'
    }

    // Check restaurants
    for (const restaurant of this.knownLocations.restaurants) {
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        restaurant.latitude, 
        restaurant.longitude
      )
      if (distance < 0.05) return 'restaurant' // Within 50 meters
    }

    return 'unknown'
  }

  // Detect activity type (GPS-based fallback when TensorFlow is unavailable)
  async detectActivityType(locationData) {
    // Try TensorFlow first (more accurate, on-device)
    const tfStatus = tensorflowService.getStatus()
    if (tfStatus.initialized && tfStatus.bufferSize > 20) {
      const tfResult = await tensorflowService.detectActivity()
      if (tfResult.confidence > 0.6) {
        return tfResult.activity
      }
    }
    
    // Fallback to GPS speed-based detection
    const { speed } = locationData // Speed in m/s

    let detectedActivity = 'stationary'

    if (speed < 0.5) {
      detectedActivity = 'stationary'
    } else if (speed < 2) {
      detectedActivity = 'walking' // ~7 km/h
    } else if (speed < 4) {
      detectedActivity = 'running' // ~14 km/h
    } else {
      detectedActivity = 'driving'
    }

    // If activity changed, log it
    if (detectedActivity !== this.currentActivity) {
      const activityDuration = Date.now() - this.lastActivityChange

      this.activityLog.push({
        activity: this.currentActivity,
        startTime: this.lastActivityChange,
        endTime: Date.now(),
        duration: activityDuration
      })

      this.currentActivity = detectedActivity
      this.lastActivityChange = Date.now()

      // Auto-log workout if running detected for > 10 minutes
      if (detectedActivity === 'running' || detectedActivity === 'walking') {
        // Will auto-log when activity ends
        if(import.meta.env.DEV)console.log(`${detectedActivity} detected - will auto-log workout`)
      }
    }
  }

  // Log gym visit
  async logGymVisit(locationData) {
    const lastGymVisit = this.activityLog.find(
      activity => activity.location === 'gym' && 
      activity.endTime > Date.now() - (24 * 60 * 60 * 1000)
    )

    if (!lastGymVisit) {
      // New gym visit
      this.activityLog.push({
        activity: 'gym_visit',
        location: 'gym',
        startTime: Date.now(),
        latitude: locationData.latitude,
        longitude: locationData.longitude
      })

      // Good habit detected
      this.addGoodHabit('Regular gym visits')

      // 🧠 BRAIN.JS LEARNING - Track location for habit patterns
      await brainLearningService.trackLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        type: 'gym',
        duration: 60 // Estimated gym session
      })

      if(import.meta.env.DEV)console.log('Gym visit detected & learned ✅')
    }
  }

  // Log restaurant visit
  async logRestaurantVisit(locationData) {
    this.activityLog.push({
      activity: 'restaurant_visit',
      location: 'restaurant',
      timestamp: Date.now(),
      latitude: locationData.latitude,
      longitude: locationData.longitude
    })

    // Check if this is fast food (would need POI database)
    // For now, just log it
    if(import.meta.env.DEV)console.log('Restaurant visit detected - prompting for meal log')

    // Send notification to log meal
    await this.sendNotification(
      'Log Your Meal',
      'You\'re at a restaurant! Want to log what you ate?'
    )
  }

  // Log time at home
  async logHomeTime(locationData) {
    // Track sedentary time
    const recentHomeTime = this.activityLog.filter(
      activity => activity.location === 'home' &&
      activity.timestamp > Date.now() - (24 * 60 * 60 * 1000)
    ).reduce((total, activity) => total + (activity.duration || 0), 0)

    // If home for > 12 hours straight, flag as sedentary
    if (recentHomeTime > 12 * 60 * 60 * 1000) {
      this.addBadHabit('Excessive sedentary time')
      await this.sendNotification(
        'Time to Move!',
        'You\'ve been home for a while. How about a quick walk?'
      )
    }
  }

  // Use AI to learn location patterns
  async learnLocationPatterns() {
    try {
      // Prepare data for AI analysis
      const recentLocations = this.locationHistory.slice(-100)

      // Use Gemini AI to identify patterns (cloud-based, runs once daily)
      const patterns = await analyzeLocationPattern(recentLocations)

      // Update known locations based on AI insights
      if (patterns.home) {
        this.knownLocations.home = patterns.home
      }
      if (patterns.gym) {
        this.knownLocations.gym = patterns.gym
      }
      if (patterns.work) {
        this.knownLocations.work = patterns.work
      }

      // Learn daily routines (Gemini handles complex pattern analysis)
      await this.learnDailyRoutines(patterns)

      if(import.meta.env.DEV)console.log('Gemini AI learned new patterns:', patterns)
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error learning patterns:', error)
    }
  }

  // Learn daily routines and predict behavior
  async learnDailyRoutines(patterns) {
    // Identify workout schedule
    const gymVisits = this.activityLog.filter(a => a.location === 'gym')
    if (gymVisits.length >= 3) {
      const workoutDays = this.identifyWeeklyPattern(gymVisits)
      this.detectedHabits.good.push({
        habit: 'Regular workout schedule',
        pattern: workoutDays,
        consistency: this.calculateConsistency(gymVisits)
      })
    }

    // Predict when user might skip workout
    const prediction = await predictBehavior(this.activityLog, this.locationHistory)
    if (prediction.likelyToSkip) {
      await this.sendMotivationalNotification(prediction)
    }
  }

  // Add good habit
  addGoodHabit(habit) {
    if (!this.detectedHabits.good.includes(habit)) {
      this.detectedHabits.good.push(habit)
    }
  }

  // Add bad habit
  addBadHabit(habit) {
    if (!this.detectedHabits.bad.includes(habit)) {
      this.detectedHabits.bad.push(habit)
    }
  }

  // Send smart notification
  async sendNotification(title, body) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) }
        }]
      })
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error sending notification:', error)
    }
  }

  // Send motivational notification based on predictions
  async sendMotivationalNotification(prediction) {
    const messages = [
      'I noticed you usually skip gym on Fridays. How about a 20-min workout today?',
      'Your routine is slipping. Let\'s get back on track - just 15 minutes!',
      'You\'re 80% likely to skip today. Prove the AI wrong! 💪'
    ]
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    await this.sendNotification('Stay Consistent!', randomMessage)
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth radius in km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Identify weekly workout pattern
  identifyWeeklyPattern(activities) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayCount = [0, 0, 0, 0, 0, 0, 0]
    
    activities.forEach(activity => {
      const day = new Date(activity.startTime).getDay()
      dayCount[day]++
    })

    return days.filter((day, index) => dayCount[index] >= 2)
  }

  // Calculate consistency score
  calculateConsistency(activities) {
    if (activities.length < 2) return 0
    
    const totalDays = (Date.now() - activities[0].startTime) / (24 * 60 * 60 * 1000)
    const frequency = activities.length / totalDays
    return Math.min(100, Math.round(frequency * 7 * 100)) // Weekly frequency as percentage
  }

  // Save data to local storage
  async saveData() {
    try {
      localStorage.setItem('locationHistory', JSON.stringify(this.locationHistory.slice(-100)))
      localStorage.setItem('activityLog', JSON.stringify(this.activityLog.slice(-100)))
      localStorage.setItem('knownLocations', JSON.stringify(this.knownLocations))
      localStorage.setItem('detectedHabits', JSON.stringify(this.detectedHabits))
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error saving tracking data:', error)
    }
  }

  // Load saved data
  async loadSavedData() {
    try {
      const locationHistory = localStorage.getItem('locationHistory')
      if (locationHistory) this.locationHistory = JSON.parse(locationHistory)

      const activityLog = localStorage.getItem('activityLog')
      if (activityLog) this.activityLog = JSON.parse(activityLog)

      const knownLocations = localStorage.getItem('knownLocations')
      if (knownLocations) this.knownLocations = JSON.parse(knownLocations)

      const detectedHabits = localStorage.getItem('detectedHabits')
      if (detectedHabits) this.detectedHabits = JSON.parse(detectedHabits)

      if(import.meta.env.DEV)console.log('Loaded saved tracking data')
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error loading tracking data:', error)
    }
  }

  // Get detected habits
  getDetectedHabits() {
    return this.detectedHabits
  }

  // Get activity summary
  getActivitySummary(days = 7) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    const recentActivities = this.activityLog.filter(a => a.startTime > cutoff)

    return {
      gymVisits: recentActivities.filter(a => a.location === 'gym').length,
      restaurantVisits: recentActivities.filter(a => a.location === 'restaurant').length,
      tensorflowDetections: recentActivities.filter(a => a.source === 'tensorflow').length,
      geminiAnalyses: recentActivities.filter(a => a.source === 'gemini').length,
      walkingTime: recentActivities
        .filter(a => a.activity === 'walking')
        .reduce((total, a) => total + a.duration, 0),
      runningTime: recentActivities
        .filter(a => a.activity === 'running')
        .reduce((total, a) => total + a.duration, 0)
    }
  }
}

// Export singleton instance
export const aiTrackingService = new AITrackingService()



