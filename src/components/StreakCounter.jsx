import { useState, useEffect } from 'react'
import './StreakCounter.css'

export default function StreakCounter() {
  const [streak, setStreak] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    checkAndUpdateStreak()
  }, [])

  const checkAndUpdateStreak = () => {
    const today = new Date().toDateString()
    const lastLogin = localStorage.getItem('last_login_date')
    const currentStreak = parseInt(localStorage.getItem('login_streak') || '0')

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
        localStorage.setItem('login_streak', newStreak.toString())
        localStorage.setItem('last_login_date', today)
        setStreak(newStreak)
        setShowAnimation(true)
        setTimeout(() => setShowAnimation(false), 2000)
      } else {
        // Streak broken
        localStorage.setItem('login_streak', '1')
        localStorage.setItem('last_login_date', today)
        setStreak(1)
      }
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
