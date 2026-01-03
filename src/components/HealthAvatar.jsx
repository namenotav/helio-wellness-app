// Health Avatar Component - Shows current and future health visualization
import { useState, useEffect } from 'react';
import './HealthAvatar.css';
import healthAvatarService from '../services/healthAvatarService';
import healthRecommendationService from '../services/healthRecommendationService';
import authService from '../services/authService';

export default function HealthAvatar({ onClose }) {
  // Always start fresh - no cached state to ensure real-time data
  const [avatarState, setAvatarState] = useState(null);
  const [activeView, setActiveView] = useState('current'); // current, 1year, 5years, 10years, recommendations
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    loadAvatarData();
    // 🔥 REAL-TIME UPDATES: Refresh every 10 seconds to show latest food/workout/sleep/step data
    const interval = setInterval(loadAvatarData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAvatarData = async () => {
    // Force refresh - always get latest data
    const state = await healthAvatarService.getAvatarState(true);
    setAvatarState(state);
    setLoading(false);

    // Load AI recommendations for current view
    if (activeView === 'recommendations' && state) {
      loadAIRecommendations(state);
    }
  };

  const loadAIRecommendations = async (state) => {
    setLoadingRecommendations(true);
    try {
      const recommendations = await healthRecommendationService.generateRecommendations(state, false);
      setAiRecommendations(recommendations);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error loading recommendations:', error);
    }
    setLoadingRecommendations(false);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'recommendations' && avatarState && !aiRecommendations) {
      loadAIRecommendations(avatarState);
    }
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
        
        {/* Medical Disclaimer */}
        <div className="health-disclaimer" style={{
          background: 'rgba(255, 152, 0, 0.1)',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: '8px',
          padding: '10px',
          margin: '10px 0',
          fontSize: '12px',
          color: '#FFA500'
        }}>
          ⚠️ <strong>Not Medical Advice:</strong> This is an educational estimate based on your activity data. Always consult healthcare professionals for medical decisions.
        </div>

        {/* Timeline Navigation */}
        <div className="avatar-timeline">
          <button 
            className={`timeline-btn ${activeView === 'current' ? 'active' : ''}`}
            onClick={() => handleViewChange('current')}
          >
            NOW
          </button>
          <button 
            className={`timeline-btn ${activeView === '1year' ? 'active' : ''}`}
            onClick={() => handleViewChange('1year')}
          >
            +1 YEAR
          </button>
          <button 
            className={`timeline-btn ${activeView === '5years' ? 'active' : ''}`}
            onClick={() => handleViewChange('5years')}
          >
            +5 YEARS
          </button>
          <button 
            className={`timeline-btn ${activeView === '10years' ? 'active' : ''}`}
            onClick={() => handleViewChange('10years')}
          >
            +10 YEARS
          </button>
          <button 
            className={`timeline-btn recommendations-btn ${activeView === 'recommendations' ? 'active' : ''}`}
            onClick={() => handleViewChange('recommendations')}
          >
            🤖 AI PLAN
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
                  {activeView === 'current' && activeData.dataCompleteness !== undefined && (
                    <span className="data-quality" style={{
                      fontSize: '11px',
                      color: activeData.dataCompleteness >= 70 ? '#44FF44' : '#FFA500',
                      marginTop: '5px',
                      display: 'block'
                    }}>
                      Based on {activeData.dataCompleteness}% complete data
                      {activeData.dataCompleteness < 70 && ' ⚠️'}
                    </span>
                  )}
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

            {/* Emergency Warnings */}
            {activeView === 'current' && activeData.emergencyWarnings && activeData.emergencyWarnings.length > 0 && (
              <div className="emergency-warnings" style={{
                background: 'rgba(255, 68, 68, 0.1)',
                border: '2px solid #FF4444',
                borderRadius: '12px',
                padding: '15px',
                margin: '15px 0'
              }}>
                <h3 style={{ color: '#FF4444', margin: '0 0 10px 0' }}>🚨 Health Alerts</h3>
                {activeData.emergencyWarnings.map((warning, idx) => (
                  <div key={idx} style={{
                    background: warning.severity === 'critical' ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                    border: `1px solid ${warning.severity === 'critical' ? '#FF0000' : '#FFA500'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {warning.icon} {warning.title}
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '5px' }}>{warning.message}</div>
                    <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#FFA500' }}>
                      👉 {warning.action}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Score Breakdown Visualization */}
            {activeView === 'current' && activeData.scoreBreakdown && activeData.scoreBreakdown.length > 0 && (
              <div className="score-breakdown" style={{
                background: 'rgba(68, 255, 68, 0.05)',
                border: '1px solid rgba(68, 255, 68, 0.3)',
                borderRadius: '12px',
                padding: '15px',
                margin: '15px 0'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📊 Score Breakdown</h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px'
                }}>
                  {activeData.scoreBreakdown.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: item.points > 0 ? 'rgba(68, 255, 68, 0.1)' : item.points < 0 ? 'rgba(255, 68, 68, 0.1)' : 'rgba(128, 128, 128, 0.1)',
                      borderRadius: '6px',
                      border: `1px solid ${item.points > 0 ? '#44FF44' : item.points < 0 ? '#FF4444' : '#888'}`,
                      fontSize: '12px'
                    }}>
                      <span style={{ fontSize: '12px' }}>
                        {item.icon} {item.factor}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: item.points > 0 ? '#44FF44' : item.points < 0 ? '#FF4444' : '#888'
                      }}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: 'rgba(68, 255, 68, 0.15)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  💡 <strong>Your Score:</strong> {activeData.score}/100
                </div>
              </div>
            )}

            {/* Improvement Suggestions */}
            {activeView === 'current' && activeData.suggestions && activeData.suggestions.length > 0 && (
              <div className="improvement-suggestions" style={{
                background: 'rgba(255, 152, 0, 0.05)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '12px',
                padding: '15px',
                margin: '15px 0'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#FFA500' }}>💡 Top Improvements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeData.suggestions.map((suggestion, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255, 152, 0, 0.1)',
                      border: '1px solid rgba(255, 152, 0, 0.4)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                        {suggestion.icon} {suggestion.action}
                      </div>
                      <div style={{ fontSize: '13px', color: '#44FF44', marginBottom: '3px' }}>
                        Impact: {suggestion.impact}
                      </div>
                      <div style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.8 }}>
                        {suggestion.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REAL Data Sources (Current View Only) */}
            {activeView === 'current' && activeData.dataBreakdown && (
              <div className="data-sources">
                <h3>📊 Your Real Health Data</h3>
                <div className="data-grid">
                  <div className="data-source">
                    <span className="data-icon">👟</span>
                    <span className="data-label">Monthly Steps ({activeData.dataBreakdown.monthName})</span>
                    <span className="data-value">{(activeData.dataBreakdown.totalMonthlySteps || 0).toLocaleString()}</span>
                    <span className="data-subtext">{activeData.dataBreakdown.stepsDays} days this month</span>
                  </div>
                  <div className="data-source">
                    <span className="data-icon">🍽️</span>
                    <span className="data-label">Food Scans ({activeData.dataBreakdown.monthName})</span>
                    <span className="data-value">{activeData.dataBreakdown.foodLogsCount}</span>
                    <span className="data-subtext">This month</span>
                  </div>
                  <div className="data-source">
                    <span className="data-icon">💪</span>
                    <span className="data-label">Workouts ({activeData.dataBreakdown.monthName})</span>
                    <span className="data-value">{activeData.dataBreakdown.workoutsCount}</span>
                    <span className="data-subtext">This month</span>
                  </div>
                  <div className="data-source">
                    <span className="data-icon">🧬</span>
                    <span className="data-label">DNA Analysis</span>
                    <span className="data-value">{activeData.dataBreakdown.hasDNAAnalysis ? '✅' : '❌'}</span>
                    <span className="data-subtext">{activeData.dataBreakdown.hasDNAAnalysis ? 'Uploaded' : 'Not uploaded'}</span>
                  </div>
                  <div className="data-source">
                    <span className="data-icon">😴</span>
                    <span className="data-label">Sleep Logs ({activeData.dataBreakdown.monthName})</span>
                    <span className="data-value">{activeData.dataBreakdown.sleepLogsCount}</span>
                    <span className="data-subtext">This month</span>
                  </div>
                </div>
                <p className="data-note">
                  💡 Your health score is calculated from <strong>real activity data</strong> - not estimates!
                </p>
              </div>
            )}

            {/* Step History Breakdown */}
            {activeView === 'current' && activeData.dataBreakdown.stepHistory && activeData.dataBreakdown.stepHistory.length > 0 && (
              <div className="step-history-section">
                <h3>📅 {activeData.dataBreakdown.monthName} {activeData.dataBreakdown.currentYear} Step History</h3>
                <div className="step-history-list">
                  {activeData.dataBreakdown.stepHistory
                    .slice()
                    .sort((a, b) => (b.date || '').localeCompare(a.date || '')) // Newest first
                    .map((entry, idx) => {
                      const steps = entry?.steps || 0;
                      const date = entry?.date || 'Unknown';
                      return (
                        <div key={date + idx} className="step-history-item">
                          <span className="history-date">{date}</span>
                          <span className="history-steps">{steps.toLocaleString()} steps</span>
                        </div>
                      );
                    })}
                </div>
                <div className="history-summary">
                  <span>📊 Total: {activeData.dataBreakdown.totalMonthlySteps.toLocaleString()} steps</span>
                  <span>📈 Average: {activeData.dataBreakdown.avgDailySteps.toLocaleString()} steps/day</span>
                </div>
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

            {/* AI Personalized Recommendations */}
            {activeView === 'recommendations' && (
              <div className="ai-recommendations-section">
                {loadingRecommendations ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#FFA500'
                  }}>
                    <h3>🤖 Generating your personalized health plan...</h3>
                    <p>AI is analyzing your data...</p>
                  </div>
                ) : aiRecommendations ? (
                  <>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(76, 175, 80, 0.1))',
                      border: '2px solid rgba(255, 152, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '20px'
                    }}>
                      <h2 style={{ margin: '0 0 10px 0', color: '#FFA500' }}>🤖 Your AI-Powered Health Plan</h2>
                      <p style={{ margin: '0', color: '#ddd', fontSize: '14px' }}>
                        Based on your current health score of {avatarState.current.score}/100, here are 5 personalized recommendations:
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {aiRecommendations.map((rec, idx) => (
                        <div key={rec.id} style={{
                          background: rec.priority === 'critical' ? 'rgba(255, 68, 68, 0.1)' : rec.priority === 'high' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(68, 255, 68, 0.1)',
                          border: `2px solid ${rec.priority === 'critical' ? '#FF4444' : rec.priority === 'high' ? '#FFA500' : '#44FF44'}`,
                          borderRadius: '12px',
                          padding: '15px',
                          position: 'relative'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: rec.priority === 'critical' ? '#FF4444' : rec.priority === 'high' ? '#FFA500' : '#44FF44',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            #{idx + 1} {rec.difficulty.toUpperCase()}
                          </div>

                          <h3 style={{ margin: '0 0 8px 0', color: '#FFF', fontSize: '16px' }}>
                            {rec.title}
                          </h3>

                          <p style={{ margin: '0 0 10px 0', color: '#ddd', fontSize: '13px', lineHeight: '1.5' }}>
                            {rec.description}
                          </p>

                          <div style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderLeft: `4px solid ${rec.priority === 'critical' ? '#FF4444' : rec.priority === 'high' ? '#FFA500' : '#44FF44'}`,
                            padding: '10px',
                            marginBottom: '10px',
                            borderRadius: '4px'
                          }}>
                            <div style={{ fontSize: '13px', marginBottom: '5px' }}>
                              <strong style={{ color: '#FFA500' }}>Action:</strong> {rec.action}
                            </div>
                            <div style={{ fontSize: '13px', marginBottom: '5px' }}>
                              <strong style={{ color: '#44FF44' }}>Target:</strong> {rec.target}
                            </div>
                            <div style={{ fontSize: '13px' }}>
                              <strong style={{ color: '#88FF88' }}>When:</strong> {rec.timeframe}
                            </div>
                          </div>

                          <div style={{
                            background: 'rgba(100, 200, 255, 0.1)',
                            border: '1px solid rgba(100, 200, 255, 0.3)',
                            padding: '10px',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            fontSize: '12px',
                            color: '#AAD4FF'
                          }}>
                            💡 <strong>Pro Tip:</strong> {rec.tip}
                          </div>

                          <div style={{
                            fontSize: '12px',
                            color: '#999',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingTop: '8px'
                          }}>
                            📊 Improves: {rec.impact}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      background: 'rgba(68, 255, 68, 0.1)',
                      border: '1px solid rgba(68, 255, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '15px',
                      marginTop: '20px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#44FF44' }}>🎯 Focus on #1 First</h3>
                      <p style={{ margin: '0', fontSize: '13px', color: '#ddd' }}>
                        These recommendations are prioritized. Tackle the top priority first for maximum impact. Small consistent steps lead to big results!
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#FFA500'
                  }}>
                    <p>No recommendations available. Ensure you have health data tracked.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



