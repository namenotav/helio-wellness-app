import { useState, useEffect } from 'react'
import './PointsPopup.css'

let popupCounter = 0

export default function PointsPopup({ points, x = 50, y = 50, onComplete }) {
  const [visible, setVisible] = useState(true)
  const [id] = useState(() => popupCounter++)

  useEffect(() => {
    // Add points to gamification service
    const currentXP = parseInt(localStorage.getItem('user_xp') || '0')
    const newXP = currentXP + points
    localStorage.setItem('user_xp', newXP.toString())

    // Check for level up
    const currentLevel = parseInt(localStorage.getItem('user_level') || '1')
    const xpNeeded = currentLevel * 1000
    if (newXP >= xpNeeded) {
      localStorage.setItem('user_level', (currentLevel + 1).toString())
      window.dispatchEvent(new CustomEvent('levelUp', { detail: { level: currentLevel + 1 } }))
    }

    const timer = setTimeout(() => {
      setVisible(false)
      if (onComplete) onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [points, onComplete])

  if (!visible) return null

  return (
    <div 
      className="points-popup"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${id * 0.1}s`
      }}
    >
      <span className="points-value">+{points} XP</span>
    </div>
  )
}

// Global state for managing multiple popups
export function usePointsPopup() {
  const [popups, setPopups] = useState([])

  const addPoints = (points, position = {}) => {
    const id = Date.now() + Math.random()
    const x = position.x || (40 + Math.random() * 20)
    const y = position.y || (40 + Math.random() * 20)

    setPopups(prev => [...prev, { id, points, x, y }])

    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id))
    }, 2500)
  }

  const PopupsRenderer = () => (
    <>
      {popups.map(popup => (
        <PointsPopup
          key={popup.id}
          points={popup.points}
          x={popup.x}
          y={popup.y}
        />
      ))}
    </>
  )

  return { addPoints, PopupsRenderer }
}
