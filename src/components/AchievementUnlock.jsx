import { useEffect, useState } from 'react'
import './AchievementUnlock.css'
import syncService from '../services/syncService'

export default function AchievementUnlock({ achievement, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    
    // Save achievement - uses syncService for cloud sync (localStorage + Firebase)
    const saveAchievement = async () => {
      // Read from Preferences first, localStorage fallback (dual-storage pattern)
      const { Preferences } = await import('@capacitor/preferences');
      const { value: prefsData } = await Preferences.get({ key: 'wellnessai_unlocked_achievements' });
      const localUnlocked = prefsData ? JSON.parse(prefsData) : JSON.parse(localStorage.getItem('unlocked_achievements') || '[]')
      
      // Also try to get from cloud (may have more from other devices)
      let cloudUnlocked = []
      try {
        cloudUnlocked = await syncService.getData('unlocked_achievements') || []
      } catch (e) {
        // Ignore cloud errors - localStorage is primary
      }
      
      // Merge both sources (dedupe)
      const merged = [...new Set([...localUnlocked, ...cloudUnlocked])]
      
      if (!merged.includes(achievement.id)) {
        merged.push(achievement.id)
        // Save to all storage locations (localStorage + Preferences + Firebase)
        await syncService.saveData('unlocked_achievements', merged)
        if(import.meta.env.DEV)console.log('🏆 Achievement saved to cloud:', achievement.id)
      }
    }
    saveAchievement()

    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 500)
    }, 4000)

    return () => clearTimeout(timer)
  }, [achievement, onClose])

  return (
    <div className={`achievement-unlock-overlay ${show ? 'show' : ''}`}>
      <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              backgroundColor: ['#ffd93d', '#ff6b6b', '#8a74f9', '#00f2fe', '#43e97b'][Math.floor(Math.random() * 5)]
            }}
          />
        ))}
      </div>
      
      <div className={`achievement-card ${show ? 'show' : ''}`}>
        <div className="achievement-shine"></div>
        <div className="achievement-icon">{achievement.icon}</div>
        <h2 className="achievement-title">🎉 Achievement Unlocked!</h2>
        <h3 className="achievement-name">{achievement.name}</h3>
        <p className="achievement-description">{achievement.description}</p>
        <div className="achievement-reward">
          <span className="reward-badge">+{achievement.xp} XP</span>
        </div>
      </div>
    </div>
  )
}

// Helper to check and unlock achievements
export function checkAchievement(achievementId) {
  const achievements = {
    first_steps: { id: 'first_steps', icon: '👣', name: 'First Steps', description: 'Walked 1,000 steps!', xp: 50 },
    meal_master: { id: 'meal_master', icon: '🍽️', name: 'Meal Master', description: 'Logged 7 days of meals!', xp: 100 },
    zen_warrior: { id: 'zen_warrior', icon: '🧘', name: 'Zen Warrior', description: 'Completed 10 meditation sessions!', xp: 150 },
    social_champion: { id: 'social_champion', icon: '🏆', name: 'Social Champion', description: 'Won 5 battles!', xp: 200 },
    dna_explorer: { id: 'dna_explorer', icon: '🧬', name: 'DNA Explorer', description: 'Uploaded DNA data!', xp: 250 },
    week_warrior: { id: 'week_warrior', icon: '🔥', name: 'Week Warrior', description: '7 day login streak!', xp: 300 },
    workout_beast: { id: 'workout_beast', icon: '💪', name: 'Workout Beast', description: 'Completed 20 workouts!', xp: 200 },
    scan_master: { id: 'scan_master', icon: '📸', name: 'Scan Master', description: 'Scanned 50 items!', xp: 100 }
  }

  const achievement = achievements[achievementId]
  if (!achievement) return null

  // Read from localStorage (sync context - Preferences checked during save)
  const unlocked = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]')
  if (unlocked.includes(achievementId)) return null

  return achievement
}
