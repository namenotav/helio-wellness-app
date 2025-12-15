import { useState, useEffect } from 'react'
import './ProfileTabRedesign.css'

export default function ProfileTabRedesign({ 
  user, 
  onOpenSettings, 
  onOpenPremium,
  onOpenHealthTools,
  onOpenDataManagement,
  onOpenSocialFeatures,
  onOpenSettingsHub,
  onEditProfile,
  onOpenFullStats
}) {
  const [level, setLevel] = useState(1)
  const [xp, setXP] = useState(0)
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    loadUserData()
    loadAchievements()
    loadStats()
  }, [])

  const loadUserData = () => {
    const userLevel = parseInt(localStorage.getItem('user_level') || '1')
    const userXP = parseInt(localStorage.getItem('user_xp') || '0')
    setLevel(userLevel)
    setXP(userXP)
  }

  const loadAchievements = () => {
    const unlocked = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]')
    const allAchievements = [
      { id: 'first_steps', icon: '👣', name: 'First Steps', locked: !unlocked.includes('first_steps') },
      { id: 'meal_master', icon: '🍽️', name: 'Meal Master', locked: !unlocked.includes('meal_master') },
      { id: 'zen_warrior', icon: '🧘', name: 'Zen Warrior', locked: !unlocked.includes('zen_warrior') },
      { id: 'social_champion', icon: '🏆', name: 'Social Champion', locked: !unlocked.includes('social_champion') },
      { id: 'dna_explorer', icon: '🧬', name: 'DNA Explorer', locked: !unlocked.includes('dna_explorer') },
      { id: 'week_warrior', icon: '🔥', name: 'Week Warrior', locked: !unlocked.includes('week_warrior') },
      { id: 'workout_beast', icon: '💪', name: 'Workout Beast', locked: !unlocked.includes('workout_beast') },
      { id: 'scan_master', icon: '📸', name: 'Scan Master', locked: !unlocked.includes('scan_master') }
    ]
    setAchievements(allAchievements)
  }

  const loadStats = () => {
    const streak = parseInt(localStorage.getItem('login_streak') || '0')
    const totalXP = parseInt(localStorage.getItem('user_xp') || '0')
    const workouts = parseInt(localStorage.getItem('workout_count') || '0')
    const meals = parseInt(localStorage.getItem('meals_logged') || '0')
    setStats({ streak, totalXP, workouts, meals })
  }

  const settingsOptions = [
    { icon: '👤', label: 'Account Settings', action: () => onOpenSettings && onOpenSettings('account') },
    { icon: '💎', label: 'Premium Benefits', action: () => onOpenPremium && onOpenPremium() },
    { icon: '🔒', label: 'Privacy & Data', action: () => onOpenSettings && onOpenSettings('privacy') },
    { icon: '❓', label: 'Help & Support', action: () => onOpenSettings && onOpenSettings('support') }
  ]

  return (
    <div className="profile-tab-redesign">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-emoji">{user?.avatar || '👤'}</span>
          <div className="level-badge">
            <span className="level-text">LVL {level}</span>
          </div>
        </div>
        <h2 className="profile-name">{user?.name || user?.profile?.name || 'Wellness Warrior'}</h2>
        <p className="profile-subtitle">{xp} XP • {achievements.filter(a => !a.locked).length} Achievements</p>
      </div>

      {/* Achievement Badges */}
      <div className="achievements-section">
        <h3 className="section-title">🏆 Achievements</h3>
        <div className="achievements-grid">
          {achievements.map((achievement, idx) => (
            <div 
              key={idx} 
              className={`achievement-badge ${achievement.locked ? 'locked' : ''}`}
              title={achievement.name}
            >
              <span className="achievement-icon">{achievement.icon}</span>
              {achievement.locked && <div className="lock-overlay">🔒</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-section">
        <h3 className="section-title">📊 Your Stats</h3>
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{stats.streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{stats.totalXP}</span>
            <span className="stat-label">Total XP</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💪</span>
            <span className="stat-value">{stats.workouts}</span>
            <span className="stat-label">Workouts</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🍽️</span>
            <span className="stat-value">{stats.meals}</span>
            <span className="stat-label">Meals Logged</span>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="settings-section">
        <h3 className="section-title">⚙️ Quick Access</h3>
        <div className="quick-access-grid">
          <button className="access-card" onClick={onOpenHealthTools}>
            <span className="access-icon">🏥</span>
            <span className="access-label">Health Tools</span>
          </button>
          
          <button className="access-card" onClick={onOpenDataManagement}>
            <span className="access-icon">📊</span>
            <span className="access-label">Data & Reports</span>
          </button>
          
          <button className="access-card" onClick={onOpenSocialFeatures}>
            <span className="access-icon">🎮</span>
            <span className="access-label">Social & Auto</span>
          </button>
          
          <button className="access-card" onClick={onEditProfile}>
            <span className="access-icon">👤</span>
            <span className="access-label">Edit Profile</span>
          </button>
          
          <button className="access-card" onClick={onOpenFullStats}>
            <span className="access-icon">📈</span>
            <span className="access-label">Full Stats</span>
          </button>
          
          <button className="access-card" onClick={onOpenSettingsHub}>
            <span className="access-icon">⚙️</span>
            <span className="access-label">Settings</span>
          </button>
        </div>
      </div>

      {/* Premium Upsell */}
      {!user?.isPremium && (
        <div className="premium-banner" onClick={() => onOpenPremium && onOpenPremium()}>
          <div className="premium-content">
            <span className="premium-icon">💎</span>
            <div className="premium-text">
              <h4 className="premium-title">Upgrade to Premium</h4>
              <p className="premium-subtitle">Unlock all features & unlimited access</p>
            </div>
            <span className="premium-arrow">→</span>
          </div>
        </div>
      )}
    </div>
  )
}
