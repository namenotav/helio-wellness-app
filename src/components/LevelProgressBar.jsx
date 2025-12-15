import { useState, useEffect } from 'react'
import './LevelProgressBar.css'

export default function LevelProgressBar() {
  const [xp, setXP] = useState(0)
  const [level, setLevel] = useState(1)
  const [progress, setProgress] = useState(0)
  const [xpNeeded, setXPNeeded] = useState(1000)

  useEffect(() => {
    updateProgress()
    
    const interval = setInterval(updateProgress, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateProgress = () => {
    const currentXP = parseInt(localStorage.getItem('user_xp') || '0')
    const currentLevel = parseInt(localStorage.getItem('user_level') || '1')
    const needed = currentLevel * 1000
    const prog = ((currentXP % needed) / needed) * 100

    setXP(currentXP % needed)
    setLevel(currentLevel)
    setProgress(prog)
    setXPNeeded(needed)
  }

  return (
    <div className="level-progress-bar">
      <div className="level-info">
        <span className="level-badge">Level {level}</span>
        <span className="xp-text">{xp} / {xpNeeded} XP</span>
      </div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        >
          <div className="progress-shine"></div>
        </div>
      </div>
    </div>
  )
}
