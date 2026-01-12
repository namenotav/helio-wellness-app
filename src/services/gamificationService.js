// Gamification Service - Streaks, XP, Levels, Achievements
import firestoreService from './firestoreService';
import authService from './authService';
import * as brain from 'brain.js';

const GAMIFICATION_STORAGE_KEY = 'wellnessai_gamification'

// XP thresholds for each level
const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 600,
  6: 1000,
  7: 1500,
  8: 2100,
  9: 2800,
  10: 3600,
  11: 4500,
  12: 5500,
  13: 6600,
  14: 7800,
  15: 9100,
  16: 10500,
  17: 12000,
  18: 13600,
  19: 15300,
  20: 17100
}

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_STEP: {
    id: 'first_step',
    name: 'First Step',
    description: 'Log your first activity',
    icon: '👟',
    xp: 10
  },
  FIRE_STARTER: {
    id: 'fire_starter',
    name: 'Fire Starter',
    description: 'Reach a 3-day streak',
    icon: '🔥',
    xp: 25
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
    xp: 50
  },
  HYDRATION_HERO: {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Drink 8 glasses of water in one day',
    icon: '💧',
    xp: 20
  },
  NUTRITION_NINJA: {
    id: 'nutrition_ninja',
    name: 'Nutrition Ninja',
    description: 'Log 7 days of healthy meals',
    icon: '🥗',
    xp: 40
  },
  STRENGTH_PRO: {
    id: 'strength_pro',
    name: 'Strength Pro',
    description: 'Complete 10 workouts',
    icon: '💪',
    xp: 50
  },
  MARATHON_MASTER: {
    id: 'marathon_master',
    name: 'Marathon Master',
    description: 'Walk 100,000 steps total',
    icon: '🏃',
    xp: 100
  },
  SCANNER_SAVVY: {
    id: 'scanner_savvy',
    name: 'Scanner Savvy',
    description: 'Scan 20 food items',
    icon: '📸',
    xp: 30
  },
  ZEN_MASTER: {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Complete 10 meditation sessions',
    icon: '🧘',
    xp: 40
  },
  PERFECT_DAY: {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete all daily goals in one day',
    icon: '⭐',
    xp: 50
  }
}

class GamificationService {
  constructor() {
    this.syncService = null; // Will be injected
    this.neuralNetwork = null; // Brain.js neural network
    this.trainingData = [];
    this.loadData();
    this.initializeAI();
  }
  
  // Initialize Brain.js neural network for AI predictions
  async initializeAI() {
    try {
      this.neuralNetwork = new brain.NeuralNetwork({
        hiddenLayers: [4, 3],
        activation: 'sigmoid'
      });
      
      // Load training data from storage
      const storedData = localStorage.getItem('ai_training_data');
      if (storedData) {
        this.trainingData = JSON.parse(storedData);
        
        // Train network if we have enough data
        if (this.trainingData.length >= 10) {
          await this.trainNetwork();
        }
      }
      
      if(import.meta.env.DEV)console.log('✅ Brain.js neural network initialized');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to initialize Brain.js:', error);
    }
  }
  
  // Train neural network on user behavior
  async trainNetwork() {
    if (!this.neuralNetwork || this.trainingData.length < 10) {
      return;
    }
    
    try {
      // Normalize training data
      const normalizedData = this.trainingData.map(d => ({
        input: {
          dayOfWeek: d.dayOfWeek / 7,
          hourOfDay: d.hourOfDay / 24,
          currentStreak: d.currentStreak / 30,
          avgDailySteps: d.avgDailySteps / 10000
        },
        output: {
          willComplete: d.didComplete ? 1 : 0
        }
      }));
      
      // Train the network
      this.neuralNetwork.train(normalizedData, {
        iterations: 1000,
        errorThresh: 0.005
      });
      
      if(import.meta.env.DEV)console.log('🧠 Neural network trained on', this.trainingData.length, 'samples');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to train neural network:', error);
    }
  }
  
  // Get AI prediction for user behavior
  predictUserBehavior(context) {
    if (!this.neuralNetwork) {
      return { willComplete: 0.5, confidence: 0 };
    }
    
    try {
      const input = {
        dayOfWeek: new Date().getDay() / 7,
        hourOfDay: new Date().getHours() / 24,
        currentStreak: this.data.streak / 30,
        avgDailySteps: (this.data.stats.totalSteps / Math.max(this.data.stats.totalWorkouts, 1)) / 10000
      };
      
      const output = this.neuralNetwork.run(input);
      const prediction = output.willComplete || output;
      
      return {
        willComplete: prediction,
        confidence: Math.abs(prediction - 0.5) * 2,
        recommendation: prediction > 0.7 ? 'High motivation - perfect time for a workout!' :
                       prediction > 0.5 ? 'Good time to exercise' :
                       prediction > 0.3 ? 'Try a light activity' :
                       'Rest day recommended'
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Prediction error:', error);
      return { willComplete: 0.5, confidence: 0 };
    }
  }
  
  // Record user behavior for training
  recordBehavior(didComplete) {
    const dataPoint = {
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours(),
      currentStreak: this.data.streak,
      avgDailySteps: this.data.stats.totalSteps / Math.max(this.data.stats.totalWorkouts, 1),
      didComplete,
      timestamp: Date.now()
    };
    
    this.trainingData.push(dataPoint);
    
    // Keep only last 100 data points
    if (this.trainingData.length > 100) {
      this.trainingData.shift();
    }
    
    // Save training data
    localStorage.setItem('ai_training_data', JSON.stringify(this.trainingData));
    
    // Retrain network every 10 new data points
    if (this.trainingData.length % 10 === 0) {
      this.trainNetwork();
    }
  }

  // Set sync service dependency
  setSyncService(syncService) {
    this.syncService = syncService;
  }

  // Load gamification data from syncService (Preferences + Firebase)
  async loadData() {
    if (this.syncService) {
      const stored = await firestoreService.get('gamification_data', authService.getCurrentUser()?.uid);
      if (stored) {
        this.data = stored;
        return;
      }
    }
    
    // Fallback to localStorage for migration
    const localStored = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (localStored) {
      this.data = JSON.parse(localStored);
      // Migrate to new system
      if (this.syncService) {
        firestoreService.save('gamification_data', this.data, authService.getCurrentUser()?.uid)
          .then(() => console.log('☁️ gamification_data synced to Firestore (background)'))
          .catch(err => console.warn('⚠️ gamification_data sync failed:', err));
      }
      return;
    }
    
    // Default data structure
    this.data = {
      level: 1,
      xp: 0,
      totalXP: 0,
      streak: 0,
      longestStreak: 0,
      lastCheckIn: null,
      achievements: [],
      stats: {
        totalSteps: 0,
        totalWater: 0,
        totalMeals: 0,
        totalWorkouts: 0,
        totalScans: 0,
        totalMeditations: 0,
        perfectDays: 0
      }
    };
    
    // 🔄 MIGRATION: Import old ProfileTabRedesign localStorage keys
    await this.migrateOldData();
    
    // 🔄 SYNC COUNTERS: Always recalculate from source of truth (real data arrays)
    try {
      const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '[]');
      const meditationLog = JSON.parse(localStorage.getItem('meditationLog') || '[]');
      const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      const totalScans = parseInt(localStorage.getItem('total_scans') || '0');
      
      // Update counters to match reality
      this.data.stats.totalWorkouts = workoutHistory.length;
      this.data.stats.totalMeals = foodLog.length;
      this.data.stats.totalWater = waterLog.reduce((sum, w) => sum + (w.cups || 1), 0);
      this.data.stats.totalMeditations = meditationLog.length;
      this.data.stats.totalSteps = stepHistory.reduce((sum, s) => sum + (s.steps || 0), 0);
      this.data.stats.totalScans = totalScans;
      
      await this.saveData();
      
      if(import.meta.env.DEV)console.log('🔄 Synced gamification counters with real data:', {
        workouts: this.data.stats.totalWorkouts,
        meals: this.data.stats.totalMeals,
        water: this.data.stats.totalWater,
        meditations: this.data.stats.totalMeditations,
        steps: this.data.stats.totalSteps,
        scans: this.data.stats.totalScans
      });
    } catch (error) {
      console.error('❌ Failed to sync counters:', error);
    }
  }

  // 🔄 Migrate old localStorage keys from ProfileTabRedesign
  async migrateOldData() {
    try {
      const oldAchievements = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]');
      const oldLevel = parseInt(localStorage.getItem('user_level') || '0');
      const oldXP = parseInt(localStorage.getItem('user_xp') || '0');
      const oldStreak = parseInt(localStorage.getItem('login_streak') || '0');
      const oldWorkoutCount = parseInt(localStorage.getItem('workout_count') || '0');
      const oldMealsLogged = parseInt(localStorage.getItem('meals_logged') || '0');
      
      // 🍽️ Count ACTUAL meals from foodLog array (the real meal storage)
      const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
      const actualMealCount = foodLog.length;
      
      // Check if any old data exists
      const hasOldData = oldAchievements.length > 0 || oldLevel > 0 || oldXP > 0 || oldStreak > 0 || oldWorkoutCount > 0 || oldMealsLogged > 0 || actualMealCount > 0;
      
      if (hasOldData) {
        if(import.meta.env.DEV)console.log('🔄 [MIGRATION] Found old gamification data, migrating...');
        
        // Merge into new system (keep higher values to preserve progress)
        if (oldLevel > this.data.level) {
          this.data.level = oldLevel;
          if(import.meta.env.DEV)console.log('  ↳ Level:', oldLevel);
        }
        if (oldXP > this.data.totalXP) {
          this.data.totalXP = oldXP;
          this.data.xp = oldXP;
          if(import.meta.env.DEV)console.log('  ↳ XP:', oldXP);
        }
        if (oldStreak > this.data.streak) {
          this.data.streak = oldStreak;
          this.data.longestStreak = oldStreak;
          if(import.meta.env.DEV)console.log('  ↳ Streak:', oldStreak);
        }
        if (oldWorkoutCount > this.data.stats.totalWorkouts) {
          this.data.stats.totalWorkouts = oldWorkoutCount;
          if(import.meta.env.DEV)console.log('  ↳ Workouts:', oldWorkoutCount);
        }
        // 🍽️ Use ACTUAL meal count from foodLog (higher value wins)
        const finalMealCount = Math.max(oldMealsLogged, actualMealCount);
        if (finalMealCount > this.data.stats.totalMeals) {
          this.data.stats.totalMeals = finalMealCount;
          if(import.meta.env.DEV)console.log('  ↳ Meals:', finalMealCount, '(from foodLog:', actualMealCount, ', old key:', oldMealsLogged, ')');
        }
        
        // Migrate old achievements
        if (oldAchievements.length > 0) {
          oldAchievements.forEach(id => {
            if (!this.hasAchievement(id)) {
              this.data.achievements.push({
                id: id,
                unlockedAt: new Date().toISOString()
              });
            }
          });
          if(import.meta.env.DEV)console.log('  ↳ Achievements:', oldAchievements.length);
        }
        
        // Save migrated data
        await this.saveData();
        
        // Clear old localStorage keys
        localStorage.removeItem('unlocked_achievements');
        localStorage.removeItem('user_level');
        localStorage.removeItem('user_xp');
        localStorage.removeItem('login_streak');
        localStorage.removeItem('workout_count');
        localStorage.removeItem('meals_logged');
        
        if(import.meta.env.DEV)console.log('✅ [MIGRATION] Complete! Old keys cleared.');
      }
    } catch (error) {
      console.error('❌ [MIGRATION] Error migrating old data:', error);
      // Don't throw - continue with default data if migration fails
    }
  }

  // Save gamification data via syncService (Preferences + Firebase + localStorage)
  saveData() {
    if (this.syncService) {
      firestoreService.save('gamification_data', this.data, authService.getCurrentUser()?.uid)
        .then(() => console.log('☁️ gamification_data synced to Firestore (background)'))
        .catch(err => console.warn('⚠️ gamification_data sync failed:', err));
    } else {
      // Fallback to localStorage
      localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  // Add XP and check for level up
  async addXP(amount, reason = '') {
    this.data.xp += amount
    this.data.totalXP += amount
    
    const leveledUp = this.checkLevelUp()
    await this.saveData()
    
    return {
      xpGained: amount,
      currentXP: this.data.xp,
      currentLevel: this.data.level,
      leveledUp,
      reason
    }
  }

  // Check if user leveled up
  checkLevelUp() {
    const nextLevel = this.data.level + 1
    const nextThreshold = LEVEL_THRESHOLDS[nextLevel]
    
    if (nextThreshold && this.data.totalXP >= nextThreshold) {
      this.data.level = nextLevel
      this.data.xp = 0
      return true
    }
    
    return false
  }

  // Get XP needed for next level
  getXPToNextLevel() {
    const nextLevel = this.data.level + 1
    const nextThreshold = LEVEL_THRESHOLDS[nextLevel]
    
    if (!nextThreshold) {
      return 0 // Max level reached
    }
    
    return nextThreshold - this.data.totalXP
  }

  // Get current level info
  getLevelInfo() {
    const nextLevel = this.data.level + 1
    const nextThreshold = LEVEL_THRESHOLDS[nextLevel]
    const currentThreshold = LEVEL_THRESHOLDS[this.data.level]
    
    return {
      level: this.data.level,
      xp: this.data.xp,
      totalXP: this.data.totalXP,
      xpToNext: nextThreshold ? nextThreshold - this.data.totalXP : 0,
      xpForCurrentLevel: nextThreshold ? nextThreshold - currentThreshold : 0,
      progress: nextThreshold ? ((this.data.totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100
    }
  }

  // Check in for today (updates streak)
  async checkIn() {
    const today = new Date().toDateString()
    const lastCheckIn = this.data.lastCheckIn ? new Date(this.data.lastCheckIn).toDateString() : null
    
    if (lastCheckIn === today) {
      return {
        alreadyCheckedIn: true,
        streak: this.data.streak
      }
    }
    
    // Check if this is a consecutive day
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toDateString()
    
    if (lastCheckIn === yesterdayString) {
      // Continue streak
      this.data.streak += 1
    } else if (lastCheckIn === null) {
      // First check-in
      this.data.streak = 1
    } else {
      // Streak broken
      this.data.streak = 1
    }
    
    this.data.lastCheckIn = new Date().toISOString()
    
    // Update longest streak
    if (this.data.streak > this.data.longestStreak) {
      this.data.longestStreak = this.data.streak
    }
    
    // Award XP for check-in
    const xpResult = await this.addXP(10, 'Daily check-in')
    
    // Check for streak achievements
    this.checkStreakAchievements()
    
    await this.saveData()
    
    return {
      alreadyCheckedIn: false,
      streak: this.data.streak,
      longestStreak: this.data.longestStreak,
      xpGained: xpResult.xpGained,
      leveledUp: xpResult.leveledUp
    }
  }

  // Check for streak-based achievements
  checkStreakAchievements() {
    if (this.data.streak >= 3 && !this.hasAchievement('fire_starter')) {
      this.unlockAchievement(ACHIEVEMENTS.FIRE_STARTER)
    }
    if (this.data.streak >= 7 && !this.hasAchievement('week_warrior')) {
      this.unlockAchievement(ACHIEVEMENTS.WEEK_WARRIOR)
    }
  }

  // Unlock an achievement
  async unlockAchievement(achievement) {
    if (this.hasAchievement(achievement.id)) {
      return { alreadyUnlocked: true }
    }
    
    this.data.achievements.push({
      id: achievement.id,
      unlockedAt: new Date().toISOString()
    })
    
    const xpResult = await this.addXP(achievement.xp, `Achievement: ${achievement.name}`)
    await this.saveData()
    
    return {
      alreadyUnlocked: false,
      achievement,
      xpGained: xpResult.xpGained,
      leveledUp: xpResult.leveledUp
    }
  }

  // Check if user has an achievement
  hasAchievement(achievementId) {
    return this.data.achievements.some(a => a.id === achievementId)
  }

  // Get all achievements with unlock status
  getAllAchievements() {
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: this.hasAchievement(achievement.id),
      unlockedAt: this.data.achievements.find(a => a.id === achievement.id)?.unlockedAt
    }))
  }

  // Log an activity and award XP
  logActivity(type, details = {}) {
    let xpAwarded = 0
    let reason = ''
    
    switch (type) {
      case 'steps':
        this.data.stats.totalSteps += details.steps || 0
        xpAwarded = Math.floor((details.steps || 0) / 1000) * 2
        reason = `${details.steps} steps logged`
        
        // Check marathon achievement
        if (this.data.stats.totalSteps >= 100000 && !this.hasAchievement('marathon_master')) {
          this.unlockAchievement(ACHIEVEMENTS.MARATHON_MASTER)
        }
        break
      
      case 'water':
        this.data.stats.totalWater += details.cups || 0
        xpAwarded = (details.cups || 0) * 2
        reason = `${details.cups} cups of water logged`
        
        // Check hydration achievement
        if (details.dailyTotal >= 8 && !this.hasAchievement('hydration_hero')) {
          this.unlockAchievement(ACHIEVEMENTS.HYDRATION_HERO)
        }
        break
      
      case 'meal':
        this.data.stats.totalMeals += 1
        xpAwarded = 10
        reason = 'Meal logged'
        
        // Check nutrition achievement
        if (this.data.stats.totalMeals >= 21 && !this.hasAchievement('nutrition_ninja')) {
          this.unlockAchievement(ACHIEVEMENTS.NUTRITION_NINJA)
        }
        break
      
      case 'workout':
        this.data.stats.totalWorkouts += 1
        xpAwarded = 15
        reason = 'Workout completed'
        
        // Check strength achievement
        if (this.data.stats.totalWorkouts >= 10 && !this.hasAchievement('strength_pro')) {
          this.unlockAchievement(ACHIEVEMENTS.STRENGTH_PRO)
        }
        break
      
      case 'scan':
        this.data.stats.totalScans += 1
        xpAwarded = 3
        reason = 'Food scanned'
        
        // Check scanner achievement
        if (this.data.stats.totalScans >= 20 && !this.hasAchievement('scanner_savvy')) {
          this.unlockAchievement(ACHIEVEMENTS.SCANNER_SAVVY)
        }
        break
      
      case 'meditation':
        this.data.stats.totalMeditations += 1
        xpAwarded = 12
        reason = 'Meditation completed'
        
        // Check zen achievement
        if (this.data.stats.totalMeditations >= 10 && !this.hasAchievement('zen_master')) {
          this.unlockAchievement(ACHIEVEMENTS.ZEN_MASTER)
        }
        break
      
      case 'perfect_day':
        this.data.stats.perfectDays += 1
        xpAwarded = 50
        reason = 'Perfect Day!'
        
        if (!this.hasAchievement('perfect_day')) {
          this.unlockAchievement(ACHIEVEMENTS.PERFECT_DAY)
        }
        break
    }
    
    if (xpAwarded > 0) {
      return this.addXP(xpAwarded, reason)
    }
    
    return null
  }

  // Get current streak info
  getStreakInfo() {
    const today = new Date().toDateString()
    const lastCheckIn = this.data.lastCheckIn ? new Date(this.data.lastCheckIn).toDateString() : null
    
    return {
      streak: this.data.streak,
      longestStreak: this.data.longestStreak,
      checkedInToday: lastCheckIn === today,
      lastCheckIn: this.data.lastCheckIn
    }
  }

  // Get all stats
  getStats() {
    return {
      ...this.data.stats,
      level: this.data.level,
      totalXP: this.data.totalXP,
      streak: this.data.streak,
      longestStreak: this.data.longestStreak,
      achievementsUnlocked: this.data.achievements.length,
      totalAchievements: Object.keys(ACHIEVEMENTS).length
    }
  }

  // Reset all data (for testing)
  async reset() {
    this.data = {
      level: 1,
      xp: 0,
      totalXP: 0,
      streak: 0,
      longestStreak: 0,
      lastCheckIn: null,
      achievements: [],
      stats: {
        totalSteps: 0,
        totalWater: 0,
        totalMeals: 0,
        totalWorkouts: 0,
        totalScans: 0,
        totalMeditations: 0,
        perfectDays: 0
      }
    }
    await this.saveData()
  }

  // PRO: Get global leaderboard
  getGlobalLeaderboard(metric = 'totalXP', limit = 50) {
    // Simulate global leaderboard data
    const leaderboardData = []
    
    // Add current user
    leaderboardData.push({
      userId: 'You',
      username: 'You',
      level: this.data.level,
      totalXP: this.data.totalXP,
      streak: this.data.streak,
      totalSteps: this.data.stats.totalSteps,
      profilePic: '👤',
      isCurrentUser: true
    })
    
    // Generate demo users
    const demoUsers = [
      { name: 'FitnessFanatic', level: 18, xp: 12800, streak: 45, steps: 485000 },
      { name: 'HealthHero22', level: 15, xp: 9500, streak: 28, steps: 320000 },
      { name: 'WellnessWarrior', level: 20, xp: 17500, streak: 67, steps: 620000 },
      { name: 'StepMaster', level: 12, xp: 5800, streak: 15, steps: 280000 },
      { name: 'GymLegend', level: 16, xp: 11200, streak: 32, steps: 410000 },
      { name: 'ZenQueen', level: 14, xp: 8100, streak: 21, steps: 195000 },
      { name: 'CardioKing', level: 19, xp: 14900, streak: 52, steps: 550000 },
      { name: 'NutritionNerd', level: 13, xp: 6900, streak: 18, steps: 245000 },
      { name: 'MarathonMike', level: 17, xp: 12100, streak: 38, steps: 480000 },
      { name: 'YogaYoda', level: 11, xp: 4900, streak: 12, steps: 165000 }
    ]
    
    demoUsers.forEach((user, idx) => {
      leaderboardData.push({
        userId: `user_${idx}`,
        username: user.name,
        level: user.level,
        totalXP: user.xp,
        streak: user.streak,
        totalSteps: user.steps,
        profilePic: ['🏃', '💪', '🧘', '🚴', '⚡'][idx % 5],
        isCurrentUser: false
      })
    })
    
    // Sort by selected metric
    leaderboardData.sort((a, b) => {
      switch(metric) {
        case 'totalXP': return b.totalXP - a.totalXP
        case 'level': return b.level - a.level
        case 'streak': return b.streak - a.streak
        case 'totalSteps': return b.totalSteps - a.totalSteps
        default: return b.totalXP - a.totalXP
      }
    })
    
    // Add rank and VIP badge flag
    leaderboardData.forEach((user, idx) => {
      user.rank = idx + 1;
      
      // Add VIP badge for Ultimate users (randomly for demo users, real check for current user)
      if (user.isCurrentUser) {
        try {
          const { default: subscriptionService } = require('./subscriptionService');
          user.isVIP = subscriptionService.hasAccess('vipBadge');
        } catch (error) {
          user.isVIP = false;
        }
      } else {
        // Demo users - 20% chance of VIP badge for realism
        user.isVIP = Math.random() < 0.2;
      }
    })
    
    return leaderboardData.slice(0, limit)
  }

  // PRO: Get battle rewards
  getBattleRewards() {
    return {
      availableRewards: [
        { id: 'xp_boost', name: 'XP Boost (2x)', cost: 500, icon: '⚡', description: '2x XP for 24 hours' },
        { id: 'streak_freeze', name: 'Streak Freeze', cost: 300, icon: '❄️', description: 'Protect streak for 1 day' },
        { id: 'power_up', name: 'Battle Power-Up', cost: 400, icon: '💥', description: '+10% performance in battles' },
        { id: 'legendary_badge', name: 'Legendary Badge', cost: 1000, icon: '👑', description: 'Exclusive profile badge' },
        { id: 'custom_avatar', name: 'Custom Avatar', cost: 800, icon: '🎨', description: 'Unlock avatar customization' }
      ],
      userCoins: this.data.totalXP / 10, // 10 XP = 1 coin
      purchasedRewards: []
    }
  }

  // PRO: Award battle victory
  awardBattleVictory(battleType, performance) {
    const baseXP = {
      'quick': 50,
      'weekly': 100,
      'monthly': 250,
      'tournament': 500
    }[battleType] || 50
    
    // Bonus for performance
    const performanceMultiplier = performance >= 90 ? 1.5 : performance >= 75 ? 1.25 : 1.0
    const totalXP = Math.floor(baseXP * performanceMultiplier)
    
    this.addXP(totalXP)
    
    return {
      xpAwarded: totalXP,
      newLevel: this.data.level,
      totalXP: this.data.totalXP
    }
  }
}

// Export singleton instance
export default new GamificationService()



