import { useState, useEffect } from 'react'
import './DailyChallenges.css'

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

  const loadChallenges = () => {
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('challenges_date')
    
    let challengesList
    if (savedDate === today) {
      // Load existing challenges
      challengesList = JSON.parse(localStorage.getItem('daily_challenges') || '[]')
    } else {
      // Generate new challenges
      challengesList = generateChallenges()
      localStorage.setItem('daily_challenges', JSON.stringify(challengesList))
      localStorage.setItem('challenges_date', today)
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

  const updateProgress = (challengeId, increment = 1) => {
    const updated = challenges.map(c => {
      if (c.id === challengeId) {
        const newProgress = Math.min(c.progress + increment, c.goal)
        const completed = newProgress >= c.goal
        
        if (completed && !c.completed) {
          // Award XP
          const currentXP = parseInt(localStorage.getItem('user_xp') || '0')
          localStorage.setItem('user_xp', (currentXP + c.xp).toString())
          if (onChallengeComplete) onChallengeComplete(c.xp)
        }
        
        return { ...c, progress: newProgress, completed }
      }
      return c
    })
    
    setChallenges(updated)
    localStorage.setItem('daily_challenges', JSON.stringify(updated))
  }
  
  // 🔥 AUTO-UPDATE: Check real data and update challenges automatically
  const autoUpdateChallenges = () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Load real data from localStorage
    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
    const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]')
    const waterLog = JSON.parse(localStorage.getItem('waterLog') || '[]')
    const sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]')
    
    // Count today's data
    const todayWorkouts = workoutHistory.filter(w => w.date === today)
    const todayMeals = foodLog.filter(f => 
      f.date === today || (f.timestamp && new Date(f.timestamp).toISOString().split('T')[0] === today)
    )
    const todayWater = waterLog.filter(w => w.date === today)
    const todaySleep = sleepLog.find(s => s.date === today)
    
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
          newProgress = sleepMinutes >= 600 ? 10 : 0 // Placeholder
          break
        case 'scans':
          newProgress = foodScansCount
          break
        case 'voice':
          // Check if AI assistant was used today
          const aiUsage = localStorage.getItem('ai_last_used')
          if (aiUsage && aiUsage === today) newProgress = 1
          break
        case 'battle':
          // Check if battle was started today
          const battles = JSON.parse(localStorage.getItem('activeBattles') || '[]')
          const todayBattles = battles.filter(b => b.createdAt && b.createdAt.startsWith(today))
          newProgress = todayBattles.length > 0 ? 1 : 0
          break
      }
      
      // Check if newly completed
      const completed = newProgress >= c.goal
      if (completed && !c.completed) {
        // Award XP
        const currentXP = parseInt(localStorage.getItem('user_xp') || '0')
        localStorage.setItem('user_xp', (currentXP + c.xp).toString())
        if (onChallengeComplete) onChallengeComplete(c.xp)
      }
      
      return { ...c, progress: newProgress, completed }
    })
    
    // Only update state if something changed
    if (JSON.stringify(updated) !== JSON.stringify(challenges)) {
      setChallenges(updated)
      localStorage.setItem('daily_challenges', JSON.stringify(updated))
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
