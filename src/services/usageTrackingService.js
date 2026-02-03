// Usage Tracking Service
// Tracks daily feature usage for "Taste of Everything" free tier
// Limits reset at midnight, syncs to Firebase to prevent cheating

import { Preferences } from '@capacitor/preferences'

class UsageTrackingService {
  constructor() {
    this.STORAGE_PREFIX = 'wellness_usage_'
    this.initialized = false
    this.usageCache = {}
    
    // Daily limits for FREE users only
    // Paid users have unlimited (or plan-specific limits handled by subscriptionService)
    this.freeLimits = {
      // Fitness - "Taste" 1 per day
      workoutVideos: 1,
      
      // Mental Wellness - "Taste" 1 per day each
      breathing: 1,
      meditation: 1,
      
      // AI Features - Limited daily use
      aiChat: 10,
      aiCoach: 10, // Shares limit with aiChat
      foodScanner: 5,
      barcodeScanner: 5,
      arScanner: 3,
      
      // Habits - Max count (not daily)
      habits: 2, // Max 2 active habits
      
      // Social - View only (special handling)
      challenges: 0, // 0 = view only
      leaderboard: 0, // 0 = view only, can't compete
      
      // Data - Weekly limit
      dataExport: 1, // Per week, not per day
    }
    
    // Messages shown when limit reached
    this.limitMessages = {
      workoutVideos: {
        title: '💪 Workout Limit Reached',
        message: "You've used your 1 free workout today! Upgrade to Starter for unlimited workouts.",
        upgradeText: 'Unlock Unlimited Workouts - £6.99/mo',
        requiredPlan: 'starter'
      },
      breathing: {
        title: '🌬️ Breathing Session Limit',
        message: "You've completed your 1 free breathing session today! Upgrade to Premium for unlimited calming exercises.",
        upgradeText: 'Unlock Unlimited Breathing - £16.99/mo',
        requiredPlan: 'premium'
      },
      meditation: {
        title: '🧘 Meditation Limit Reached',
        message: "You've completed your 1 free meditation today! Upgrade to Premium for unlimited guided meditations.",
        upgradeText: 'Unlock Unlimited Meditation - £16.99/mo',
        requiredPlan: 'premium'
      },
      aiChat: {
        title: '🤖 AI Chat Limit',
        message: "You've used all 10 AI messages today! Your coach resets at midnight, or upgrade for unlimited conversations.",
        upgradeText: 'Unlock Unlimited AI - £6.99/mo',
        requiredPlan: 'starter'
      },
      aiCoach: {
        title: '🤖 AI Coach Limit',
        message: "You've used all 10 AI messages today! Your coach resets at midnight, or upgrade for unlimited conversations.",
        upgradeText: 'Unlock Unlimited AI - £6.99/mo',
        requiredPlan: 'starter'
      },
      foodScanner: {
        title: '📸 Food Scanner Limit',
        message: "You've used all 5 food scans today! Scans reset at midnight, or upgrade for unlimited scanning.",
        upgradeText: 'Unlock Unlimited Scans - £6.99/mo',
        requiredPlan: 'starter'
      },
      barcodeScanner: {
        title: '📦 Barcode Scanner Limit',
        message: "You've used all 5 barcode scans today! Resets at midnight, or upgrade for unlimited.",
        upgradeText: 'Unlock Unlimited Scans - £6.99/mo',
        requiredPlan: 'starter'
      },
      arScanner: {
        title: '📱 AR Scanner Limit',
        message: "You've used all 3 AR scans today! This premium feature resets at midnight.",
        upgradeText: 'Unlock Unlimited AR - £16.99/mo',
        requiredPlan: 'premium'
      },
      habits: {
        title: '🎯 Habit Limit Reached',
        message: "Free users can track up to 2 habits. Upgrade to track unlimited habits and build better routines!",
        upgradeText: 'Unlock Unlimited Habits - £6.99/mo',
        requiredPlan: 'starter'
      },
      challenges: {
        title: '🏆 Join Challenges',
        message: "Free users can view challenges but can't participate. Upgrade to compete and win rewards!",
        upgradeText: 'Join Challenges - £6.99/mo',
        requiredPlan: 'starter'
      },
      leaderboard: {
        title: '🏅 Compete on Leaderboards',
        message: "Free users can view leaderboards but can't compete. Upgrade to climb the ranks!",
        upgradeText: 'Compete Now - £6.99/mo',
        requiredPlan: 'starter'
      },
      dataExport: {
        title: '📊 Export Limit',
        message: "Free users can export data once per week. Upgrade for unlimited exports!",
        upgradeText: 'Unlock Unlimited Exports - £16.99/mo',
        requiredPlan: 'premium'
      }
    }
  }

  // Initialize service - call once on app start
  async initialize() {
    if (this.initialized) return
    
    try {
      // Load cached usage from storage
      await this.loadUsageFromStorage()
      
      // Check if we need to reset (new day)
      await this.checkAndResetIfNewDay()
      
      this.initialized = true
      if (import.meta.env.DEV) console.log('✅ UsageTrackingService initialized')
    } catch (error) {
      console.error('❌ UsageTrackingService init error:', error)
      this.initialized = true // Continue anyway
    }
  }

  // Get today's date string (for storage keys)
  getTodayKey() {
    return new Date().toISOString().split('T')[0] // YYYY-MM-DD
  }

  // Get this week's key (for weekly limits)
  getWeekKey() {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)
    return `${now.getFullYear()}-W${weekNumber}`
  }

  // Load usage data from Capacitor Preferences
  async loadUsageFromStorage() {
    try {
      const todayKey = this.getTodayKey()
      const storageKey = `${this.STORAGE_PREFIX}${todayKey}`
      
      const { value } = await Preferences.get({ key: storageKey })
      
      if (value) {
        this.usageCache = JSON.parse(value)
        if (import.meta.env.DEV) console.log('📊 Loaded usage data:', this.usageCache)
      } else {
        this.usageCache = {}
      }
    } catch (error) {
      console.error('Error loading usage data:', error)
      this.usageCache = {}
    }
  }

  // Save usage data to Capacitor Preferences
  async saveUsageToStorage() {
    try {
      const todayKey = this.getTodayKey()
      const storageKey = `${this.STORAGE_PREFIX}${todayKey}`
      
      await Preferences.set({
        key: storageKey,
        value: JSON.stringify(this.usageCache)
      })
      
      // Also save last update timestamp
      await Preferences.set({
        key: `${this.STORAGE_PREFIX}lastUpdate`,
        value: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving usage data:', error)
    }
  }

  // Check if it's a new day and reset counters
  async checkAndResetIfNewDay() {
    try {
      const { value: lastDate } = await Preferences.get({ 
        key: `${this.STORAGE_PREFIX}lastDate` 
      })
      
      const todayKey = this.getTodayKey()
      
      if (lastDate !== todayKey) {
        if (import.meta.env.DEV) console.log('🔄 New day detected, resetting usage counters')
        this.usageCache = {}
        
        await Preferences.set({
          key: `${this.STORAGE_PREFIX}lastDate`,
          value: todayKey
        })
        
        await this.saveUsageToStorage()
      }
    } catch (error) {
      console.error('Error checking day reset:', error)
    }
  }

  // Check if user has remaining usage for a feature
  // Returns: { allowed: boolean, used: number, limit: number, remaining: number }
  checkUsage(featureName, userPlan = 'free') {
    // Paid users have no limits (handled by subscriptionService)
    if (userPlan !== 'free') {
      return {
        allowed: true,
        used: 0,
        limit: 999999,
        remaining: 999999,
        isUnlimited: true
      }
    }

    // Check developer mode
    try {
      const devMode = localStorage.getItem('helio_dev_mode') === 'true'
      if (devMode) {
        return {
          allowed: true,
          used: 0,
          limit: 999999,
          remaining: 999999,
          isUnlimited: true,
          devMode: true
        }
      }
    } catch (e) { /* ignore */ }

    const limit = this.freeLimits[featureName]
    
    // If no limit defined, allow
    if (limit === undefined) {
      return {
        allowed: true,
        used: 0,
        limit: 999999,
        remaining: 999999,
        isUnlimited: true
      }
    }

    // Special case: 0 means view-only
    if (limit === 0) {
      return {
        allowed: false,
        used: 0,
        limit: 0,
        remaining: 0,
        viewOnly: true
      }
    }

    const used = this.usageCache[featureName] || 0
    const remaining = Math.max(0, limit - used)

    return {
      allowed: remaining > 0,
      used,
      limit,
      remaining,
      isUnlimited: false
    }
  }

  // Record usage of a feature
  async trackUsage(featureName, userPlan = 'free') {
    // Only track for free users
    if (userPlan !== 'free') return true

    // Check if allowed first
    const usage = this.checkUsage(featureName, userPlan)
    if (!usage.allowed) {
      if (import.meta.env.DEV) console.log(`❌ ${featureName} limit reached`)
      return false
    }

    // Increment usage
    this.usageCache[featureName] = (this.usageCache[featureName] || 0) + 1
    
    if (import.meta.env.DEV) {
      const newUsage = this.checkUsage(featureName, userPlan)
      console.log(`📊 ${featureName}: ${newUsage.used}/${newUsage.limit} used`)
    }

    // Save to storage
    await this.saveUsageToStorage()

    // Sync to Firebase (fire and forget)
    this.syncToFirebase(featureName)

    return true
  }

  // Get limit info for showing in UI
  getLimitInfo(featureName, userPlan = 'free') {
    const usage = this.checkUsage(featureName, userPlan)
    const message = this.limitMessages[featureName]

    return {
      ...usage,
      ...(message || {}),
      featureName
    }
  }

  // Get paywall data when limit is reached
  getLimitPaywall(featureName) {
    const message = this.limitMessages[featureName]
    
    if (!message) {
      return {
        show: true,
        title: '⏰ Daily Limit Reached',
        message: `You've reached your daily limit for this feature. Upgrade for unlimited access!`,
        upgradeText: 'Upgrade Now',
        requiredPlan: 'starter',
        featureName
      }
    }

    return {
      show: true,
      ...message,
      featureName
    }
  }

  // Sync usage to Firebase (prevents reinstall cheating)
  async syncToFirebase(featureName) {
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user_id')
      if (!userId) return

      // Import Firebase dynamically to avoid circular deps
      const { doc, setDoc, getFirestore } = await import('firebase/firestore')
      const { getApp } = await import('firebase/app')
      
      const db = getFirestore(getApp())
      const todayKey = this.getTodayKey()
      
      await setDoc(
        doc(db, 'users', userId, 'dailyUsage', todayKey),
        {
          [featureName]: this.usageCache[featureName] || 0,
          lastUpdated: new Date().toISOString()
        },
        { merge: true }
      )

      if (import.meta.env.DEV) console.log(`☁️ Synced ${featureName} usage to Firebase`)
    } catch (error) {
      // Non-blocking - just log
      if (import.meta.env.DEV) console.warn('Firebase usage sync failed:', error.message)
    }
  }

  // Load usage from Firebase (call on app start to prevent cheating)
  async loadFromFirebase() {
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user_id')
      if (!userId) return

      const { doc, getDoc, getFirestore } = await import('firebase/firestore')
      const { getApp } = await import('firebase/app')
      
      const db = getFirestore(getApp())
      const todayKey = this.getTodayKey()
      
      const docSnap = await getDoc(doc(db, 'users', userId, 'dailyUsage', todayKey))
      
      if (docSnap.exists()) {
        const cloudUsage = docSnap.data()
        
        // Merge with local (take higher value to prevent cheating)
        for (const feature in cloudUsage) {
          if (feature !== 'lastUpdated') {
            const cloudCount = cloudUsage[feature] || 0
            const localCount = this.usageCache[feature] || 0
            this.usageCache[feature] = Math.max(cloudCount, localCount)
          }
        }
        
        await this.saveUsageToStorage()
        if (import.meta.env.DEV) console.log('☁️ Loaded usage from Firebase')
      }
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Firebase usage load failed:', error.message)
    }
  }

  // Get remaining uses text for UI badge
  getRemainingText(featureName, userPlan = 'free') {
    const usage = this.checkUsage(featureName, userPlan)
    
    if (usage.isUnlimited) return null
    if (usage.viewOnly) return 'View Only'
    if (usage.remaining === 0) return 'Limit Reached'
    
    return `${usage.remaining}/${usage.limit} left today`
  }

  // Check habit count (special - not daily, but total)
  checkHabitLimit(currentHabitCount, userPlan = 'free') {
    if (userPlan !== 'free') {
      return { allowed: true, canAdd: true, limit: 999999 }
    }

    const limit = this.freeLimits.habits
    return {
      allowed: true, // Can view habits
      canAdd: currentHabitCount < limit,
      limit,
      current: currentHabitCount
    }
  }

  // Check if feature is view-only for free users
  isViewOnly(featureName, userPlan = 'free') {
    if (userPlan !== 'free') return false
    return this.freeLimits[featureName] === 0
  }
}

// Export singleton
const usageTrackingService = new UsageTrackingService()
export default usageTrackingService
