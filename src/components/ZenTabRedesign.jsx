import { useState, useEffect } from 'react'
import { usePointsPopup } from './PointsPopup'
import './ZenTabRedesign.css'

export default function ZenTabRedesign({ onOpenBreathing, onOpenMeditation }) {
  const { addPoints, PopupsRenderer } = usePointsPopup()
  const [stats, setStats] = useState({ minutesToday: 0, totalSessions: 0, streak: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const lastDate = localStorage.getItem('meditation_last_date') || ''
    
    // Daily reset for minutes
    let minutes = 0
    if (lastDate === today) {
      minutes = parseInt(localStorage.getItem('meditation_minutes_today') || '0')
    } else {
      localStorage.setItem('meditation_minutes_today', '0')
    }
    
    // Calculate streak - 🔥 FIX: Only reset after 11:59 PM
    const now = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    let streak = parseInt(localStorage.getItem('meditation_streak') || '0')
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
        localStorage.setItem('meditation_streak', '0')
      }
      // Otherwise, keep streak but show warning
    }
    
    const sessions = parseInt(localStorage.getItem('meditation_sessions') || '0')
    setStats({ minutesToday: minutes, totalSessions: sessions, streak })
  }

  const startBreathingExercise = (exercise) => {
    // Update challenges
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge('meditate', exercise.duration)
    }

    // Update stats
    const today = new Date().toISOString().split('T')[0]
    const lastDate = localStorage.getItem('meditation_last_date') || ''
    
    const minutes = parseInt(localStorage.getItem('meditation_minutes_today') || '0')
    localStorage.setItem('meditation_minutes_today', (minutes + exercise.duration).toString())
    
    const sessions = parseInt(localStorage.getItem('meditation_sessions') || '0')
    localStorage.setItem('meditation_sessions', (sessions + 1).toString())
    
    // Update streak
    if (lastDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      let streak = parseInt(localStorage.getItem('meditation_streak') || '0')
      if (lastDate === yesterdayStr) {
        streak += 1
      } else {
        streak = 1
      }
      localStorage.setItem('meditation_streak', streak.toString())
    }
    
    localStorage.setItem('meditation_last_date', today)
    
    // XP will be awarded in BreathingModal on completion
    if (onOpenBreathing) {
      onOpenBreathing(exercise.type)
    }
  }

  const startMeditation = (duration) => {
    // Update challenges
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge('meditate', duration)
    }

    // Update stats
    const today = new Date().toISOString().split('T')[0]
    const lastDate = localStorage.getItem('meditation_last_date') || ''
    
    const minutes = parseInt(localStorage.getItem('meditation_minutes_today') || '0')
    localStorage.setItem('meditation_minutes_today', (minutes + duration).toString())
    
    const sessions = parseInt(localStorage.getItem('meditation_sessions') || '0')
    localStorage.setItem('meditation_sessions', (sessions + 1).toString())
    
    // Update streak
    if (lastDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      let streak = parseInt(localStorage.getItem('meditation_streak') || '0')
      if (lastDate === yesterdayStr) {
        streak += 1
      } else {
        streak = 1
      }
      localStorage.setItem('meditation_streak', streak.toString())
    }
    
    localStorage.setItem('meditation_last_date', today)
    
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
        <h3 className="section-title">Breathing Exercises</h3>
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
        <h3 className="section-title">Guided Meditation</h3>
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
              onClick={() => {
                localStorage.setItem('mood_today', mood)
                const today = new Date().toISOString().split('T')[0]
                localStorage.setItem('mood_last_date', today)
                addPoints(5, { x: 50, y: 60 })
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
