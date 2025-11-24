// Gamification Service - Streaks, XP, Levels, Achievements

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
    this.data = this.loadData()
  }

  // Load gamification data from localStorage
  loadData() {
    const stored = localStorage.getItem(GAMIFICATION_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Default data structure
    return {
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
  }

  // Save gamification data to localStorage
  saveData() {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(this.data))
  }

  // Add XP and check for level up
  addXP(amount, reason = '') {
    this.data.xp += amount
    this.data.totalXP += amount
    
    const leveledUp = this.checkLevelUp()
    this.saveData()
    
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
  checkIn() {
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
    const xpResult = this.addXP(10, 'Daily check-in')
    
    // Check for streak achievements
    this.checkStreakAchievements()
    
    this.saveData()
    
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
  unlockAchievement(achievement) {
    if (this.hasAchievement(achievement.id)) {
      return { alreadyUnlocked: true }
    }
    
    this.data.achievements.push({
      id: achievement.id,
      unlockedAt: new Date().toISOString()
    })
    
    const xpResult = this.addXP(achievement.xp, `Achievement: ${achievement.name}`)
    this.saveData()
    
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
  reset() {
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
    this.saveData()
  }
}

// Export singleton instance
export default new GamificationService()
