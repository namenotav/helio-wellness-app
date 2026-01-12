import { useState, useEffect } from 'react'
import './DailyChallenges.css'
import firestoreService from '../services/firestoreService'
import authService from '../services/authService'
import gamificationService from '../services/gamificationService'
import dataService from '../services/dataService' // 🎯 SINGLE SOURCE OF TRUTH
import { Preferences } from '@capacitor/preferences'

export default function DailyChallenges({ onChallengeComplete, todaySteps = 0 }) {
  const [challenges, setChallenges] = useState([])

  useEffect(() => {
    loadChallenges()
    
    // 🔥 AUTO-UPDATE: Poll for changes every 3 seconds
    const pollInterval = setInterval(() => {
      autoUpdateChallenges()
    }, 3000)
    
    return () => clearInterval(pollInterval)
  }, [])

  const loadChallenges = async () => {
    const today = new Date().toDateString()
    const userId = authService.getCurrentUser()?.uid
    
    // 🔥 NEW: Try Firebase first (survives uninstall)
    let challengesList
    if (userId) {
      const cloudData = await firestoreService.get('daily_challenges', userId)
      if (cloudData && cloudData.date === today) {
        challengesList = cloudData.challenges
        console.log('✅ Loaded challenges from Firebase')
      }
    }
    
    // Fallback to Preferences then localStorage (migration path)
    if (!challengesList) {
      try {
        const { value: savedDatePrefs } = await Preferences.get({ key: 'wellnessai_challenges_date' })
        const savedDate = savedDatePrefs || localStorage.getItem('challenges_date')
        if (savedDate === today) {
          const { value: challengesPrefs } = await Preferences.get({ key: 'wellnessai_daily_challenges' })
          challengesList = challengesPrefs ? JSON.parse(challengesPrefs) : JSON.parse(localStorage.getItem('daily_challenges') || '[]')
        }
      } catch (e) {
        // Last resort - localStorage
        const savedDate = localStorage.getItem('challenges_date')
        if (savedDate === today) {
          challengesList = JSON.parse(localStorage.getItem('daily_challenges') || '[]')
        }
      }
    }
    
    // Generate new if nothing found or new day
    if (!challengesList) {
      challengesList = generateChallenges()
      
      // Save to ALL storages (Preferences + localStorage + Firebase)
      localStorage.setItem('daily_challenges', JSON.stringify(challengesList))
      localStorage.setItem('challenges_date', today)
      await Preferences.set({ key: 'wellnessai_daily_challenges', value: JSON.stringify(challengesList) })
      await Preferences.set({ key: 'wellnessai_challenges_date', value: today })
      if (userId) {
        await firestoreService.save('daily_challenges', { challenges: challengesList, date: today }, userId)
      }
    }
    
    setChallenges(challengesList)
  }

  const generateChallenges = () => {
    const allChallenges = [
      { id: 'steps_5k', icon: '👟', title: 'Walk 5,000 Steps', progress: 0, goal: 5000, xp: 25, type: 'steps' },
      { id: 'log_meal', icon: '🍽️', title: 'Log 3 Meals', progress: 0, goal: 3, xp: 20, type: 'meals' },
      { id: 'water_8', icon: '💧', title: 'Drink 8 Cups Water', progress: 0, goal: 8, xp: 15, type: 'water' },
      { id: 'workout_15', icon: '💪', title: '15 Min Workout', progress: 0, goal: 15, xp: 30, type: 'workout' },
      { id: 'meditate', icon: '🧘', title: 'Meditate 10 Min', progress: 0, goal: 10, xp: 25, type: 'meditation' },
      { id: 'scan_food', icon: '📸', title: 'Scan 5 Food Items', progress: 0, goal: 5, xp: 20, type: 'scans' },
      { id: 'voice_chat', icon: '🎤', title: 'Chat with AI Coach', progress: 0, goal: 1, xp: 15, type: 'voice' },
      { id: 'social_battle', icon: '⚔️', title: 'Start 1 Battle', progress: 0, goal: 1, xp: 25, type: 'battle' }
    ]

    // Select 3 random challenges
    const shuffled = allChallenges.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3).map(c => ({ ...c, completed: false }))
  }

  const updateProgress = async (challengeId, increment = 1) => {
    const updated = challenges.map(c => {
      if (c.id === challengeId) {
        const newProgress = Math.min(c.progress + increment, c.goal)
        const completed = newProgress >= c.goal
        
        if (completed && !c.completed) {
          // 🔥 FIX: Use gamificationService instead of direct localStorage
          gamificationService.addXP(c.xp, `Completed challenge: ${c.title}`)
          if (onChallengeComplete) onChallengeComplete(c.xp)
        }
        
        return { ...c, progress: newProgress, completed }
      }
      return c
    })
    
    setChallenges(updated)
    
    // Save to ALL storages (Preferences + localStorage + Firebase)
    localStorage.setItem('daily_challenges', JSON.stringify(updated))
    await Preferences.set({ key: 'wellnessai_daily_challenges', value: JSON.stringify(updated) })
    const userId = authService.getCurrentUser()?.uid
    if (userId) {
      const today = new Date().toDateString()
      await firestoreService.save('daily_challenges', { challenges: updated, date: today }, userId)
    }
  }
  
  // 🔥 AUTO-UPDATE: Check real data and update challenges automatically
  const autoUpdateChallenges = async () => {
    const today = new Date().toISOString().split('T')[0]
    const userId = authService.getCurrentUser()?.uid // 🔥 FIX: Declare userId at start of function
    
    // 🔥 FIX: Load from Preferences first (survives reinstall), localStorage as fallback
    let workoutHistory = []
    let foodLog = []
    let waterLog = []
    let sleepLog = []
    
    try {
      // 🔥 FIX: Read localStorage FIRST for instant data (Firestore is stale)
      workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
      
      // Food log from user profile (authService is source of truth)
      const currentUser = authService.getCurrentUser()
      foodLog = currentUser?.profile?.foodLog || []
      if (!Array.isArray(foodLog)) foodLog = []
      
      // 🔥 FIX: Read localStorage FIRST for instant data
      waterLog = JSON.parse(localStorage.getItem('waterLog') || '[]')
      
      // 🔥 FIX: Read localStorage FIRST for instant data
      sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]')
    } catch (e) {
      console.error('❌ Failed to load challenge data:', e)
      // 🔥 FALLBACK: Read localStorage directly (always instant)
      try {
        workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
        waterLog = JSON.parse(localStorage.getItem('waterLog') || '[]')
        sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]')
      } catch (fallbackError) {
        // Last resort - empty arrays
        workoutHistory = []
        waterLog = []
        sleepLog = []
      }
    }
    
    // Count today's data
    const todayWorkouts = Array.isArray(workoutHistory) ? workoutHistory.filter(w => w.date === today) : []
    const todayMeals = Array.isArray(foodLog) ? foodLog.filter(f => 
      f.date === today || (f.timestamp && new Date(f.timestamp).toISOString().split('T')[0] === today)
    ) : []
    
    // 🎯 Count real meditation sessions via dataService (4-system architecture)
    let meditationLog = []
    try {
      meditationLog = await dataService.get('meditationLog', userId) || []
    } catch (e) {
      console.error('Error loading meditation log:', e)
      meditationLog = []
    }
    const todayMeditation = Array.isArray(meditationLog) ? meditationLog.filter(m => m.date === today) : []
    const totalMeditationMinutes = todayMeditation.reduce((sum, m) => sum + (m.duration || 0), 0)
    
    // 🔥 NEW: Count real food scans
    const totalScans = todayMeals.filter(f => f.scanned === true || f.barcode).length
    
    // 🔥 NEW: Check real battles (via dataService 4-system architecture)
    let battleData = {}
    try {
      battleData = await dataService.get('socialBattlesData', userId) || {}
    } catch (e) {
      battleData = JSON.parse(localStorage.getItem('socialBattlesData') || '{}')
    }
    const activeBattles = battleData.activeBattles || []
    const todayBattles = activeBattles.filter(b => 
      b.createdAt && new Date(b.createdAt).toISOString().split('T')[0] === today
    )
    
    // 🔥 NEW: Check real AI assistant usage (via dataService 4-system architecture)
    let aiChatLog = []
    try {
      aiChatLog = await dataService.get('aiChatHistory', userId) || []
    } catch (e) {
      aiChatLog = JSON.parse(localStorage.getItem('aiChatHistory') || '[]')
    }
    const todayChats = aiChatLog.filter(chat => 
      chat.timestamp && new Date(chat.timestamp).toISOString().split('T')[0] === today
    )
    
    const todayWater = Array.isArray(waterLog) ? waterLog.filter(w => w.date === today) : []
    const todaySleep = Array.isArray(sleepLog) ? sleepLog.find(s => s.date === today) : null
    
    const waterCups = todayWater.reduce((sum, w) => sum + (w.cups || 1), 0)
    const totalWorkoutMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
    const sleepMinutes = todaySleep ? (todaySleep.hours * 60) : 0
    const foodScansCount = todayMeals.length
    
    // Update challenges with real data (only if NOT completed to prevent re-triggering XP)
    const updated = challenges.map(c => {
      if (c.completed) return c // Don't update completed challenges
      
      let newProgress = c.progress
      
      // Map challenge types to real data
      switch (c.type) {
        case 'steps':
          newProgress = todaySteps
          break
        case 'meals':
          newProgress = todayMeals.length
          break
        case 'water':
          newProgress = waterCups
          break
        case 'workout':
          newProgress = totalWorkoutMinutes
          break
        case 'meditation':
          newProgress = totalMeditationMinutes // 🔥 FIX: Use real meditation data
          break
        case 'scans':
          newProgress = totalScans // 🔥 FIX: Use real scans count (barcode + camera)
          break
        case 'voice':
          // 🔥 FIX: Use real AI assistant usage (already fetched above)
          newProgress = todayChats.length > 0 ? 1 : 0
          break
        case 'battle':
          // 🔥 FIX: Use real battle data from earlier calculation
          newProgress = todayBattles.length > 0 ? 1 : 0
          break
      }
      
      // Check if newly completed
      const completed = newProgress >= c.goal
      if (completed && !c.completed) {
        // 🔥 FIX: Use gamificationService instead of direct localStorage
        gamificationService.addXP(c.xp, `Completed challenge: ${c.title}`)
        if (onChallengeComplete) onChallengeComplete(c.xp)
      }
      
      return { ...c, progress: newProgress, completed }
    })
    
    // Only update state if something changed
    if (JSON.stringify(updated) !== JSON.stringify(challenges)) {
      setChallenges(updated)
      localStorage.setItem('daily_challenges', JSON.stringify(updated))
      // Also save to Preferences for persistence
      try {
        await Preferences.set({ key: 'wellnessai_daily_challenges', value: JSON.stringify(updated) })
      } catch (e) {
        console.warn('Could not save challenges to Preferences:', e)
      }
    }
  }

  // Expose update function globally AND track todaySteps changes
  useEffect(() => {
    window.updateDailyChallenge = updateProgress
    // Also trigger auto-update when todaySteps prop changes
    if (todaySteps > 0) {
      autoUpdateChallenges()
    }
  }, [challenges, todaySteps])

  const progressPercent = (challenge) => {
    return (challenge.progress / challenge.goal) * 100
  }

  return (
    <div className="daily-challenges">
      <div className="challenges-header">
        <span className="challenges-icon">🎯</span>
        <h3 className="challenges-title">Daily Challenges</h3>
      </div>
      
      <div className="challenges-list">
        {challenges.map(challenge => (
          <div key={challenge.id} className={`challenge-item ${challenge.completed ? 'completed' : ''}`}>
            <span className="challenge-icon">{challenge.icon}</span>
            <div className="challenge-content">
              <div className="challenge-info">
                <span className="challenge-title">{challenge.title}</span>
                <span className="challenge-xp">+{challenge.xp} XP</span>
              </div>
              <div className="challenge-progress-bar">
                <div 
                  className="challenge-progress-fill" 
                  style={{ width: `${progressPercent(challenge)}%` }}
                />
              </div>
              <span className="challenge-counter">{challenge.progress} / {challenge.goal}</span>
            </div>
            {challenge.completed && <span className="challenge-check">✓</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
