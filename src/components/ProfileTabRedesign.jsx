import { useState, useEffect } from 'react'
import './ProfileTabRedesign.css'
import gamificationService from '../services/gamificationService'
import subscriptionService from '../services/subscriptionService'

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
  const [loading, setLoading] = useState(true)
  const [hasVIPBadge, setHasVIPBadge] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // ✅ Check VIP badge access
      setHasVIPBadge(subscriptionService.hasAccess('vipBadge'))
      
      // ✅ Ensure gamification data is loaded
      await gamificationService.loadData()
      
      // ✅ Get level info from real service
      const levelInfo = gamificationService.getLevelInfo()
      setLevel(levelInfo?.level || 1)
      setXP(levelInfo?.totalXP || 0)
      
      // ✅ Get achievements from real service
      const allAchievements = gamificationService.getAllAchievements()
      // Map to component format with proper icons
      const mappedAchievements = allAchievements.map(a => ({
        id: a.id,
        icon: a.icon,
        name: a.name,
        locked: !a.unlocked
      }))
      setAchievements(mappedAchievements)
      
      // ✅ Get stats from real service + actual data arrays (not gamification counters)
      const streakInfo = gamificationService.getStreakInfo()
      const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
      const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]')
      setStats({
        streak: streakInfo?.streak || 0,
        totalXP: levelInfo?.totalXP || 0,
        workouts: workoutHistory.length,
        meals: foodLog.length
      })
      
      if(import.meta.env.DEV)console.log('✅ [ProfileTabRedesign] Loaded gamification data:', {
        level: levelInfo?.level,
        xp: levelInfo?.totalXP,
        achievements: allAchievements.length,
        unlocked: allAchievements.filter(a => a.unlocked).length,
        streak: streakInfo?.streak,
        workouts: gameStats?.totalWorkouts,
        meals: gameStats?.totalMeals
      })
      
    } catch (error) {
      console.error('❌ [ProfileTabRedesign] Error loading gamification data:', error)
      // Set safe defaults on error
      setLevel(1)
      setXP(0)
      setAchievements([])
      setStats({ streak: 0, totalXP: 0, workouts: 0, meals: 0 })
    } finally {
      setLoading(false)
    }
  }

  const settingsOptions = [
    { icon: '👤', label: 'Account Settings', action: () => onOpenSettings && onOpenSettings('account') },
    { icon: '💎', label: 'Premium Benefits', action: () => onOpenPremium && onOpenPremium() },
    { icon: '🔒', label: 'Privacy & Data', action: () => onOpenSettings && onOpenSettings('privacy') },
    { icon: '❓', label: 'Help & Support', action: () => onOpenSettings && onOpenSettings('support') }
  ]

  return (
    <div className="profile-tab-redesign">
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
          <div>Loading your progress...</div>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="avatar-emoji">{user?.avatar || '👤'}</span>
              <div className="level-badge">
                <span className="level-text">LVL {level}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <h2 className="profile-name">{user?.name || user?.profile?.name || 'Wellness Warrior'}</h2>
              {hasVIPBadge && (
                <span 
                  className="vip-badge"
                  title="Ultimate Plan VIP Member"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#000',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
                    animation: 'vipPulse 2s ease-in-out infinite'
                  }}
                >
                  👑 VIP
                </span>
              )}
            </div>
            <p className="profile-subtitle">{xp} XP • {achievements.filter(a => !a.locked).length} Achievements</p>
          </div>

          {/* Achievement Badges */}
          <div className="achievements-section">
            <h3 className="section-title">🏆 Achievements</h3>
            <div className="achievements-grid">
              {achievements.length > 0 ? (
                achievements.map((achievement, idx) => (
                  <div 
                    key={achievement.id || idx} 
                    className={`achievement-badge ${achievement.locked ? 'locked' : ''}`}
                    title={achievement.name}
                  >
                    <span className="achievement-icon">{achievement.icon}</span>
                    {achievement.locked && <div className="lock-overlay">🔒</div>}
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#888' }}>
                  Complete activities to unlock achievements!
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-section">
            <h3 className="section-title">📊 Your Stats</h3>
            <div className="stats-cards">
              <div className="stat-card">
                <span className="stat-icon">🔥</span>
                <span className="stat-value">{stats.streak || 0}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">{stats.totalXP || 0}</span>
                <span className="stat-label">Total XP</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💪</span>
                <span className="stat-value">{stats.workouts || 0}</span>
                <span className="stat-label">Workouts</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🍽️</span>
                <span className="stat-value">{stats.meals || 0}</span>
                <span className="stat-label">Meals Logged</span>
              </div>
            </div>
          </div>
        </>
      )}

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
