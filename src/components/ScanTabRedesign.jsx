import { useState, useEffect } from 'react'
import { usePointsPopup } from './PointsPopup'
import './ScanTabRedesign.css'

export default function ScanTabRedesign({ onOpenFoodScanner, onOpenARScanner, onOpenBarcodeScanner }) {
  const { addPoints, PopupsRenderer } = usePointsPopup()
  const [stats, setStats] = useState({ scannedToday: 0, totalScans: 0, caloriesTracked: 0 })
  const [recentScans, setRecentScans] = useState([])

  useEffect(() => {
    loadStats()
    loadRecentScans()
  }, [])

  const loadStats = async () => {
    // Check if it's a new day - reset today's count
    const currentDate = new Date().toISOString().split('T')[0]
    
    // 🔥 FIX: Read from Preferences FIRST (survives reinstall), fallback to localStorage
    let savedDate = null
    let today = 0
    let total = 0
    let calories = 0
    
    try {
      const { Preferences } = await import('@capacitor/preferences')
      
      // Read all values from Preferences first
      const { value: prefsDate } = await Preferences.get({ key: 'wellnessai_scans_today_date' })
      const { value: prefsToday } = await Preferences.get({ key: 'wellnessai_scans_today' })
      const { value: prefsTotal } = await Preferences.get({ key: 'wellnessai_total_scans' })
      const { value: prefsCalories } = await Preferences.get({ key: 'wellnessai_calories_tracked' })
      
      savedDate = prefsDate || localStorage.getItem('scans_today_date')
      today = parseInt(prefsToday || localStorage.getItem('scans_today') || '0')
      total = parseInt(prefsTotal || localStorage.getItem('total_scans') || '0')
      calories = parseInt(prefsCalories || localStorage.getItem('calories_tracked') || '0')
      
      if (savedDate !== currentDate) {
        // New day - reset today's count
        today = 0
        localStorage.setItem('scans_today', '0')
        localStorage.setItem('scans_today_date', currentDate)
        await Preferences.set({ key: 'wellnessai_scans_today', value: '0' })
        await Preferences.set({ key: 'wellnessai_scans_today_date', value: currentDate })
        if(import.meta.env.DEV)console.log('📅 New day detected - reset scans_today to 0')
      }
    } catch (e) {
      console.warn('Could not read from Preferences, using localStorage:', e)
      savedDate = localStorage.getItem('scans_today_date')
      today = parseInt(localStorage.getItem('scans_today') || '0')
      total = parseInt(localStorage.getItem('total_scans') || '0')
      calories = parseInt(localStorage.getItem('calories_tracked') || '0')
      
      if (savedDate !== currentDate) {
        today = 0
        localStorage.setItem('scans_today', '0')
        localStorage.setItem('scans_today_date', currentDate)
      }
    }
    
    setStats({ scannedToday: today, totalScans: total, caloriesTracked: calories })
  }

  const loadRecentScans = async () => {
    // 🔥 FIX: Read from Preferences FIRST, fallback to localStorage
    try {
      const { Preferences } = await import('@capacitor/preferences')
      const { value: prefsScans } = await Preferences.get({ key: 'wellnessai_recent_scans' })
      const saved = prefsScans || localStorage.getItem('recent_scans')
      if (saved) {
        const scans = JSON.parse(saved).slice(0, 5)
        setRecentScans(scans)
        // Sync to localStorage for backwards compatibility
        localStorage.setItem('recent_scans', JSON.stringify(scans))
      }
    } catch (e) {
      console.warn('Preferences read failed, using localStorage:', e)
      const saved = localStorage.getItem('recent_scans')
      if (saved) {
        setRecentScans(JSON.parse(saved).slice(0, 5))
      }
    }
  }

  const handleScanOption = (option) => {
    // Note: XP and stats are now tracked in scanner components after successful scan
    // This prevents XP farming and ensures accurate statistics

    // Open respective scanner
    switch (option.id) {
      case 'food':
        if (onOpenFoodScanner) onOpenFoodScanner()
        break
      case 'barcode':
        if (onOpenBarcodeScanner) onOpenBarcodeScanner()
        break
      default:
        alert(`${option.label} coming soon!`)
    }
  }

  const scanOptions = [
    { id: 'food', icon: '🍽️', label: 'Food Scanner', description: 'Identify meals', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'barcode', icon: '📊', label: 'Barcode', description: 'Scan labels', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'ar_body', icon: '📸', label: 'Body Scanner', description: 'Track progress', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'posture', icon: '🧍', label: 'Posture Check', description: 'AI analysis', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  ]

  return (
    <div className="scan-tab-redesign">
      <PopupsRenderer />

      {/* Stats Card */}
      <div className="scan-stats-card">
        <h3 className="section-title">📸 Scan Stats</h3>
        <div className="scan-stats-grid">
          <div className="scan-stat-item">
            <span className="scan-stat-value">{stats.scannedToday}</span>
            <span className="scan-stat-label">Scanned Today</span>
          </div>
          <div className="scan-stat-item">
            <span className="scan-stat-value">{stats.totalScans}</span>
            <span className="scan-stat-label">Total Scans</span>
          </div>
          <div className="scan-stat-item">
            <span className="scan-stat-value">{stats.caloriesTracked}</span>
            <span className="scan-stat-label">Calories Tracked</span>
          </div>
        </div>
      </div>

      {/* Scan Options Grid */}
      <div className="scan-section">
        <h3 className="section-title">Scan Options</h3>
        <div className="scan-options-grid">
          {scanOptions.map((option, idx) => (
            <button
              key={idx}
              className="scan-option-button"
              style={{ background: option.gradient }}
              onClick={() => handleScanOption(option)}
            >
              <span className="scan-option-icon">{option.icon}</span>
              <h4 className="scan-option-label">{option.label}</h4>
              <p className="scan-option-description">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="recent-scans-section">
          <h3 className="section-title">Recent Scans</h3>
          <div className="recent-scans-list">
            {recentScans.map((scan, idx) => (
              <div key={idx} className="scan-item">
                <div className="scan-item-icon">{scan.icon || '📷'}</div>
                <div className="scan-item-content">
                  <span className="scan-item-name">{scan.name || 'Unknown Item'}</span>
                  <span className="scan-item-time">{scan.time || 'Just now'}</span>
                </div>
                <span className="scan-item-calories">{scan.calories || '0'} cal</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
