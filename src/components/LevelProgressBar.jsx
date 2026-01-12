import { useState, useEffect } from 'react'
import './LevelProgressBar.css'
import gamificationService from '../services/gamificationService'

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
    // 🔥 FIX: Use gamificationService (single source of truth) instead of localStorage
    const levelInfo = gamificationService.getLevelInfo()
    const currentXP = levelInfo.xpInLevel || 0
    const currentLevel = levelInfo.level || 1
    const needed = levelInfo.xpToNext + currentXP || currentLevel * 1000
    const prog = levelInfo.progress || ((currentXP / needed) * 100)

    setXP(currentXP)
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
