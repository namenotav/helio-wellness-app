import { useState, useEffect } from 'react'
import { usePointsPopup } from './PointsPopup'
import './ScanTabRedesign.css'

export default function ScanTabRedesign({ onOpenFoodScanner, onOpenARScanner, onOpenBarcodeScanner, onOpenRepCounter }) {
  const { addPoints, PopupsRenderer } = usePointsPopup()
  const [stats, setStats] = useState({ scannedToday: 0, totalScans: 0, caloriesTracked: 0 })
  const [recentScans, setRecentScans] = useState([])

  useEffect(() => {
    loadStats()
    loadRecentScans()
  }, [])

  const loadStats = () => {
    const today = parseInt(localStorage.getItem('scans_today') || '0')
    const total = parseInt(localStorage.getItem('total_scans') || '0')
    const calories = parseInt(localStorage.getItem('calories_tracked') || '0')
    setStats({ scannedToday: today, totalScans: total, caloriesTracked: calories })
  }

  const loadRecentScans = () => {
    const saved = localStorage.getItem('recent_scans')
    if (saved) {
      setRecentScans(JSON.parse(saved).slice(0, 5))
    }
  }

  const handleScanOption = (option) => {
    addPoints(5, { x: 50, y: 40 })
    
    // Update challenges
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge('scan_food', 1)
    }

    // Update stats
    const today = parseInt(localStorage.getItem('scans_today') || '0')
    localStorage.setItem('scans_today', (today + 1).toString())
    
    const total = parseInt(localStorage.getItem('total_scans') || '0')
    localStorage.setItem('total_scans', (total + 1).toString())

    // Open respective scanner
    switch (option.id) {
      case 'food':
        if (onOpenFoodScanner) onOpenFoodScanner()
        break
      case 'barcode':
        if (onOpenBarcodeScanner) onOpenBarcodeScanner()
        break
      case 'ar_body':
        if (onOpenARScanner) onOpenARScanner()
        break
      case 'rep_counter':
        if (onOpenRepCounter) onOpenRepCounter()
        break
      default:
        alert(`${option.label} coming soon!`)
    }
  }

  const scanOptions = [
    { id: 'food', icon: '🍽️', label: 'Food Scanner', description: 'Identify meals', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'barcode', icon: '📊', label: 'Barcode', description: 'Scan labels', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'ar_body', icon: '📸', label: 'Body Scanner', description: 'Track progress', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'posture', icon: '🧍', label: 'Posture Check', description: 'AI analysis', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'meal_photo', icon: '📷', label: 'Meal Photo', description: 'Log instantly', gradient: 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)' },
    { id: 'rep_counter', icon: '💪', label: 'Rep Counter', description: 'AI workout', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
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
