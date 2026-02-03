import { useState, useEffect } from 'react'
import { usePointsPopup } from './PointsPopup'
import './ZenTabRedesign.css'
import syncService from '../services/syncService'
import dataService from '../services/dataService' // 🎯 SINGLE SOURCE OF TRUTH
import brainLearningService from '../services/brainLearningService'
import subscriptionService from '../services/subscriptionService'
import usageTrackingService from '../services/usageTrackingService'

export default function ZenTabRedesign({ onOpenBreathing, onOpenMeditation, onShowPaywall }) {
  const { addPoints, PopupsRenderer } = usePointsPopup()
  const [stats, setStats] = useState({ minutesToday: 0, totalSessions: 0, streak: 0 })
  const [breathingUsage, setBreathingUsage] = useState(null)
  const [meditationUsage, setMeditationUsage] = useState(null)

  useEffect(() => {
    loadStats()
    loadUsageLimits()
  }, [])

  const loadUsageLimits = async () => {
    await usageTrackingService.initialize()
    const plan = subscriptionService.getCurrentPlan()
    setBreathingUsage(usageTrackingService.checkUsage('breathing', plan.id))
    setMeditationUsage(usageTrackingService.checkUsage('meditation', plan.id))
  }

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    // 🔥 FIX: Load from dataService (4-system architecture)
    const userId = (await import('../services/authService')).default.getCurrentUser()?.uid
    const meditationData = await dataService.get('meditation_stats', userId) || {}
    const lastDate = meditationData.lastDate || ''
    
    // Daily reset for minutes
    let minutes = 0
    if (lastDate === today) {
      minutes = meditationData.minutesToday || 0
    } else {
      // Reset for new day - will be saved when meditation completes
      minutes = 0
    }
    
    // Calculate streak - 🔥 FIX: Only reset after 11:59 PM
    const now = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    let streak = meditationData.streak || 0
    if (lastDate === today) {
      // Already meditated today, keep streak
    } else if (lastDate === yesterdayStr) {
      // Meditated yesterday, will increment on next session
    } else if (lastDate && lastDate < yesterdayStr) {
      // 🔥 FIX: Only reset streak after midnight (give user full day to meditate)
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      // If it's past 11:59 PM and user hasn't meditated, break streak
      if (currentHour === 23 && currentMinute >= 59) {
        streak = 0
      }
      // Otherwise, keep streak but show warning
    }
    
    const sessions = meditationData.totalSessions || 0
    setStats({ minutesToday: minutes, totalSessions: sessions, streak })
  }

  const startBreathingExercise = async (exercise) => {
    // Check usage limits for free users
    const plan = subscriptionService.getCurrentPlan()
    const usage = usageTrackingService.checkUsage('breathing', plan.id)
    
    if (!usage.allowed) {
      if (onShowPaywall) {
        const paywallData = usageTrackingService.getLimitPaywall('breathing')
        onShowPaywall(paywallData)
      }
      return
    }
    
    // Track usage
    await usageTrackingService.trackUsage('breathing', plan.id)
    setBreathingUsage(usageTrackingService.checkUsage('breathing', plan.id))
    
    // Update challenges
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge('meditate', exercise.duration)
    }

    // Update stats - save to cloud via syncService
    const today = new Date().toISOString().split('T')[0]
    const meditationData = await syncService.getData('meditation_stats') || {}
    const lastDate = meditationData.lastDate || ''
    
    const minutes = (lastDate === today ? meditationData.minutesToday : 0) || 0
    const newMinutes = minutes + exercise.duration
    
    const sessions = meditationData.totalSessions || 0
    const newSessions = sessions + 1
    
    // Update streak
    let streak = meditationData.streak || 0
    if (lastDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (lastDate === yesterdayStr) {
        streak += 1
      } else {
        streak = 1
      }
    }
    
    // 🎯 Save to cloud via dataService (4-system architecture)
    const userId = (await import('../services/authService')).default.getCurrentUser()?.uid
    await dataService.save('meditation_stats', {
      minutesToday: newMinutes,
      totalSessions: newSessions,
      streak: streak,
      lastDate: today
    }, userId)
    
    // 🧠 BRAIN.JS LEARNING: Track stress reduction from breathing exercise
    try {
      await brainLearningService.trackStress({
        stressLevel: Math.max(1, 5 - exercise.duration / 2), // Lower stress after breathing
        trigger: 'breathing_exercise',
        copingMethod: exercise.type,
        effectiveness: 8, // Breathing exercises are effective
        duration: exercise.duration,
        timestamp: Date.now()
      })
      if(import.meta.env.DEV)console.log('🧠 Brain.js: Stress tracked after breathing -', exercise.type)
    } catch (err) {
      console.warn('Brain.js stress tracking failed:', err)
    }
    
    // XP will be awarded in BreathingModal on completion
    if (onOpenBreathing) {
      onOpenBreathing(exercise.type)
    }
  }

  const startMeditation = async (duration) => {
    // Check usage limits for free users
    const plan = subscriptionService.getCurrentPlan()
    const usage = usageTrackingService.checkUsage('meditation', plan.id)
    
    if (!usage.allowed) {
      if (onShowPaywall) {
        const paywallData = usageTrackingService.getLimitPaywall('meditation')
        onShowPaywall(paywallData)
      }
      return
    }
    
    // Track usage
    await usageTrackingService.trackUsage('meditation', plan.id)
    setMeditationUsage(usageTrackingService.checkUsage('meditation', plan.id))
    
    // Update challenges
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge('meditate', duration)
    }

    // Update stats - save to cloud via syncService
    const today = new Date().toISOString().split('T')[0]
    const meditationData = await syncService.getData('meditation_stats') || {}
    const lastDate = meditationData.lastDate || ''
    
    const minutes = (lastDate === today ? meditationData.minutesToday : 0) || 0
    const newMinutes = minutes + duration
    
    const sessions = meditationData.totalSessions || 0
    const newSessions = sessions + 1
    
    // Update streak
    let streak = meditationData.streak || 0
    if (lastDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (lastDate === yesterdayStr) {
        streak += 1
      } else {
        streak = 1
      }
    }
    
    // 🎯 Save to cloud via dataService (4-system architecture)
    const userId2 = (await import('../services/authService')).default.getCurrentUser()?.uid
    await dataService.save('meditation_stats', {
      minutesToday: newMinutes,
      totalSessions: newSessions,
      streak: streak,
      lastDate: today
    }, userId2)
    
    // 🧠 BRAIN.JS LEARNING: Track mood improvement and stress reduction from meditation
    try {
      // Track mood improvement (meditation boosts mood)
      await brainLearningService.trackMood({
        mood: Math.min(10, 6 + duration / 5), // Longer meditation = better mood
        context: 'post_meditation',
        afterActivity: 'guided_meditation',
        duration: duration,
        timestamp: Date.now()
      })
      
      // Track stress reduction (meditation reduces stress)
      await brainLearningService.trackStress({
        stressLevel: Math.max(1, 4 - duration / 5), // Longer meditation = lower stress
        trigger: 'meditation_practice',
        copingMethod: 'guided_meditation',
        effectiveness: Math.min(10, 7 + duration / 10),
        duration: duration,
        timestamp: Date.now()
      })
      if(import.meta.env.DEV)console.log('🧠 Brain.js: Mood & Stress tracked after meditation -', duration, 'min')
    } catch (err) {
      console.warn('Brain.js meditation tracking failed:', err)
    }
    
    // XP will be awarded in GuidedMeditationModal on completion
    if (onOpenMeditation) {
      onOpenMeditation(duration)
    }
  }

  const breathingExercises = [
    { icon: '🫁', name: 'Box Breathing', description: '4-4-4-4 pattern', duration: 5, type: 'box', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { icon: '😌', name: '4-7-8 Technique', description: 'Deep relaxation', duration: 5, type: '478', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { icon: '🧘', name: 'Calm Breathing', description: 'Gentle & peaceful', duration: 10, type: 'calm', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { icon: '⚡', name: 'Energy Boost', description: 'Quick refresh', duration: 3, type: 'energy', gradient: 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)' }
  ]

  const meditationSessions = [
    { duration: 5, label: '5 Min Quick Calm' },
    { duration: 10, label: '10 Min Deep Focus' },
    { duration: 20, label: '20 Min Full Session' }
  ]

  return (
    <div className="zen-tab-redesign">
      <PopupsRenderer />

      {/* Stats Card */}
      <div className="zen-stats-card">
        <h3 className="section-title">🧘 Zen Progress</h3>
        <div className="zen-stats-grid">
          <div className="zen-stat-item">
            <span className="zen-stat-value">{stats.minutesToday}</span>
            <span className="zen-stat-label">Minutes Today</span>
          </div>
          <div className="zen-stat-item">
            <span className="zen-stat-value">{stats.totalSessions}</span>
            <span className="zen-stat-label">Total Sessions</span>
          </div>
          <div className="zen-stat-item">
            <span className="zen-stat-value">{stats.streak} 🔥</span>
            <span className="zen-stat-label">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Breathing Exercises */}
      <div className="zen-section">
        <h3 className="section-title">
          Breathing Exercises
          {breathingUsage && !breathingUsage.isUnlimited && (
            <span className="usage-badge">
              {breathingUsage.remaining > 0 
                ? `${breathingUsage.remaining}/${breathingUsage.limit} free` 
                : '⏰ Limit reached'}
            </span>
          )}
        </h3>
        <div className="breathing-grid">
          {breathingExercises.map((exercise, idx) => (
            <button
              key={idx}
              className="breathing-card"
              style={{ background: exercise.gradient }}
              onClick={() => startBreathingExercise(exercise)}
            >
              <span className="breathing-icon">{exercise.icon}</span>
              <h4 className="breathing-name">{exercise.name}</h4>
              <p className="breathing-description">{exercise.description}</p>
              <span className="breathing-duration">{exercise.duration} min</span>
            </button>
          ))}
        </div>
      </div>

      {/* Guided Meditation */}
      <div className="zen-section">
        <h3 className="section-title">
          Guided Meditation
          {meditationUsage && !meditationUsage.isUnlimited && (
            <span className="usage-badge">
              {meditationUsage.remaining > 0 
                ? `${meditationUsage.remaining}/${meditationUsage.limit} free` 
                : '⏰ Limit reached'}
            </span>
          )}
        </h3>
        <div className="meditation-buttons">
          {meditationSessions.map((session, idx) => (
            <button
              key={idx}
              className="meditation-button"
              onClick={() => startMeditation(session.duration)}
            >
              <span className="meditation-icon">🎧</span>
              <span className="meditation-label">{session.label}</span>
              <span className="meditation-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="mood-tracker-card">
        <h3 className="section-title">How are you feeling?</h3>
        <div className="mood-options">
          {['😊', '😌', '😐', '😔', '😤'].map((mood, idx) => (
            <button
              key={idx}
              className="mood-button"
              onClick={async () => {
                const today = new Date().toISOString().split('T')[0]
                // Save mood to cloud via syncService
                await syncService.saveData('mood_data', { mood, date: today })
                // Write to both Preferences and localStorage
                try {
                  const { Preferences } = await import('@capacitor/preferences');
                  await Preferences.set({ key: 'wellnessai_mood_today', value: mood });
                  await Preferences.set({ key: 'wellnessai_mood_last_date', value: today });
                } catch (e) { /* localStorage fallback below */ }
                localStorage.setItem('mood_today', mood)
                localStorage.setItem('mood_last_date', today)
                addPoints(5, { x: 50, y: 60 })
                
                // 🧠 BRAIN.JS LEARNING: Track mood for AI pattern recognition
                const moodValues = { '😊': 9, '😌': 7, '😐': 5, '😔': 3, '😤': 2 }
                const moodValue = moodValues[mood] || 5
                try {
                  await brainLearningService.trackMood({
                    mood: moodValue,
                    context: 'zen_tab_check_in',
                    afterActivity: 'mood_check_in',
                    timestamp: Date.now()
                  })
                  if(import.meta.env.DEV)console.log('🧠 Brain.js: Mood tracked -', mood, '(', moodValue, '/10)')
                } catch (err) {
                  console.warn('Brain.js mood tracking failed:', err)
                }
              }}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
