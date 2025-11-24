// Health Avatar Component - Shows current and future health visualization
import { useState, useEffect } from 'react';
import './HealthAvatar.css';
import healthAvatarService from '../services/healthAvatarService';
import authService from '../services/authService';

export default function HealthAvatar({ onClose }) {
  const [avatarState, setAvatarState] = useState(null);
  const [activeView, setActiveView] = useState('current'); // current, 1year, 5years, 10years
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvatarData();
  }, []);

  const loadAvatarData = async () => {
    const state = await healthAvatarService.getAvatarState();
    setAvatarState(state);
    setLoading(false);
  };

  const getActiveData = () => {
    if (!avatarState) return null;
    
    switch (activeView) {
      case 'current':
        return avatarState.current;
      case '1year':
        return { ...avatarState.future1Year, visuals: healthAvatarService.getAvatarVisuals(avatarState.future1Year.score) };
      case '5years':
        return { ...avatarState.future5Years, visuals: healthAvatarService.getAvatarVisuals(avatarState.future5Years.score) };
      case '10years':
        return { ...avatarState.future10Years, visuals: healthAvatarService.getAvatarVisuals(avatarState.future10Years.score) };
      default:
        return avatarState.current;
    }
  };

  const activeData = getActiveData();

  if (loading) {
    return (
      <div className="avatar-overlay">
        <div className="avatar-modal">
          <h2>⏳ Loading your health avatar...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-overlay">
      <div className="avatar-modal">
        <button className="avatar-close" onClick={onClose}>✕</button>

        <h2 className="avatar-title">🧬 Your Health Avatar</h2>

        {/* Timeline Navigation */}
        <div className="avatar-timeline">
          <button 
            className={`timeline-btn ${activeView === 'current' ? 'active' : ''}`}
            onClick={() => setActiveView('current')}
          >
            NOW
          </button>
          <button 
            className={`timeline-btn ${activeView === '1year' ? 'active' : ''}`}
            onClick={() => setActiveView('1year')}
          >
            +1 YEAR
          </button>
          <button 
            className={`timeline-btn ${activeView === '5years' ? 'active' : ''}`}
            onClick={() => setActiveView('5years')}
          >
            +5 YEARS
          </button>
          <button 
            className={`timeline-btn ${activeView === '10years' ? 'active' : ''}`}
            onClick={() => setActiveView('10years')}
          >
            +10 YEARS
          </button>
        </div>

        {activeData && (
          <>
            {/* Avatar Visualization */}
            <div className="avatar-display" data-glow={activeData.visuals?.glowEffect || 'none'}>
              <div className="avatar-character">
                <div className="avatar-emoji" style={{
                  filter: activeData.visuals?.eyeBrightness === 'dull' ? 'grayscale(0.5)' : 'none',
                  opacity: activeData.visuals?.energyLevel === 'low' ? 0.7 : 1
                }}>
                  {activeData.visuals?.overallMood || '😊'}
                </div>
              </div>
              
              {/* Health Score Circle */}
              <div className="health-score-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8"/>
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke={activeData.score >= 70 ? '#44FF44' : activeData.score >= 50 ? '#FFA500' : '#FF4444'}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 45 * (activeData.score / 100)} ${2 * Math.PI * 45}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">{activeData.score}</span>
                  <span className="score-label">Health Score</span>
                </div>
              </div>
            </div>

            {/* Age Appearance */}
            {activeView !== 'current' && (
              <div className="age-warning">
                <h3>⚠️ You'll look {activeData.ageAppearance} years old</h3>
                <p>Actual age: {avatarState.current.age + parseInt(activeView.replace(/\D/g, ''))}</p>
              </div>
            )}

            {/* Health Status */}
            <div className="avatar-stats">
              <div className="stat-item">
                <span className="stat-icon">💪</span>
                <span className="stat-label">Muscle</span>
                <span className="stat-value">{activeData.visuals?.muscleTone}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <span className="stat-label">Energy</span>
                <span className="stat-value">{activeData.visuals?.energyLevel}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">✨</span>
                <span className="stat-label">Glow</span>
                <span className="stat-value">{activeData.visuals?.glowEffect}</span>
              </div>
            </div>

            {/* Warnings */}
            {activeView !== 'current' && activeData.warnings && activeData.warnings.length > 0 && (
              <div className="avatar-warnings">
                <h3>⚠️ Health Warnings</h3>
                <ul>
                  {activeData.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {activeView !== 'current' && activeData.improvements && activeData.improvements.length > 0 && (
              <div className="avatar-improvements">
                <h3>💡 How to Improve</h3>
                <ul>
                  {activeData.improvements.map((improvement, idx) => (
                    <li key={idx}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Call to Action */}
            {activeView !== 'current' && activeData.score < avatarState.current.score && (
              <div className="avatar-cta">
                <h3>🚀 Change Your Future NOW!</h3>
                <p>Small changes today = huge impact on your future health</p>
                <button className="cta-button" onClick={onClose}>
                  Start Improving Today
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
