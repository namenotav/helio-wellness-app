import { useState, useEffect } from 'react'
import { Preferences } from '@capacitor/preferences'
import './StreakCounter.css'

export default function StreakCounter() {
  const [streak, setStreak] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    checkAndUpdateStreak()
  }, [])

  const checkAndUpdateStreak = async () => {
    try {
      const today = new Date().toDateString()
      
      // 🔥 FIX: Read from Preferences (persistent) with localStorage fallback
      let lastLogin = null
      let currentStreak = 0
      
      try {
        const { value: prefsLastLogin } = await Preferences.get({ key: 'wellnessai_last_login_date' })
        const { value: prefsStreak } = await Preferences.get({ key: 'wellnessai_login_streak' })
        if (prefsLastLogin) lastLogin = prefsLastLogin
        if (prefsStreak) currentStreak = parseInt(prefsStreak)
      } catch (e) {
        // Fallback to localStorage
        lastLogin = localStorage.getItem('last_login_date')
        currentStreak = parseInt(localStorage.getItem('login_streak') || '0')
      }

      if (lastLogin === today) {
        // Already logged in today
        setStreak(currentStreak)
      } else {
        const lastDate = lastLogin ? new Date(lastLogin) : null
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
          // Consecutive day
          const newStreak = currentStreak + 1
          // Save to BOTH Preferences (permanent) and localStorage (cache)
          await Preferences.set({ key: 'wellnessai_login_streak', value: newStreak.toString() })
          await Preferences.set({ key: 'wellnessai_last_login_date', value: today })
          localStorage.setItem('login_streak', newStreak.toString())
          localStorage.setItem('last_login_date', today)
          setStreak(newStreak)
          setShowAnimation(true)
          setTimeout(() => setShowAnimation(false), 2000)
        } else {
          // Streak broken
          await Preferences.set({ key: 'wellnessai_login_streak', value: '1' })
          await Preferences.set({ key: 'wellnessai_last_login_date', value: today })
          localStorage.setItem('login_streak', '1')
          localStorage.setItem('last_login_date', today)
          setStreak(1)
        }
      }
    } catch (error) {
      console.error('❌ [StreakCounter] Error:', error)
      setStreak(1) // Default to 1 on error
    }
  }

  if (streak === 0) return null

  return (
    <div className={`streak-counter ${showAnimation ? 'animate' : ''}`}>
      <span className="streak-flame">🔥</span>
      <div className="streak-content">
        <span className="streak-number">{streak}</span>
        <span className="streak-label">Day Streak</span>
      </div>
      {showAnimation && (
        <div className="streak-particles">
          <span>🎉</span>
          <span>⭐</span>
          <span>✨</span>
        </div>
      )}
    </div>
  )
}
