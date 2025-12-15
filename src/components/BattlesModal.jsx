// Social Battles Quick View Modal
import { useState, useEffect } from 'react';
import './BattlesModal.css';
import SocialBattles from './SocialBattles';

export default function BattlesModal({ isOpen, onClose }) {
  const [showFullBattles, setShowFullBattles] = useState(false);
  const [battleStats, setBattleStats] = useState({
    activeBattles: 0,
    wins: 0,
    rank: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadBattleStats();
    }
  }, [isOpen]);

  const loadBattleStats = () => {
    try {
      const battles = JSON.parse(localStorage.getItem('active_battles') || '[]');
      const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      
      setBattleStats({
        activeBattles: battles.length,
        wins: profile.battleWins || 0,
        rank: profile.globalRank || 0
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load battle stats:', error);
    }
  };

  if (!isOpen) return null;

  if (showFullBattles) {
    return <SocialBattles isOpen={true} onClose={() => { setShowFullBattles(false); onClose(); }} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="battles-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏆 Battles</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="battles-hero">
          <div className="hero-icon">⚔️</div>
          <h3>Compete & Win</h3>
          <p>Challenge friends in fitness battles</p>
        </div>

        <div className="battles-quick-stats">
          <div className="quick-stat-card">
            <span className="stat-icon">🎯</span>
            <div className="stat-content">
              <span className="stat-number">{battleStats.activeBattles}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>

          <div className="quick-stat-card">
            <span className="stat-icon">🏆</span>
            <div className="stat-content">
              <span className="stat-number">{battleStats.wins}</span>
              <span className="stat-label">Wins</span>
            </div>
          </div>

          <div className="quick-stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-content">
              <span className="stat-number">#{battleStats.rank || '---'}</span>
              <span className="stat-label">Rank</span>
            </div>
          </div>
        </div>

        <div className="battles-actions">
          <button className="primary-action-btn" onClick={() => setShowFullBattles(true)}>
            ⚔️ Start Battle
          </button>
          <button className="secondary-action-btn" onClick={() => setShowFullBattles(true)}>
            👥 View All Battles
          </button>
        </div>

        <div className="battles-info">
          <p>💡 Challenge friends to step, workout, or calorie burn battles!</p>
        </div>
      </div>
    </div>
  );
}
