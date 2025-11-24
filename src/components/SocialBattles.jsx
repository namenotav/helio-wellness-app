// Social Battles Component - Competitive Health Challenges
import { useState, useEffect } from 'react';
import './SocialBattles.css';
import socialBattlesService from '../services/socialBattlesService';

export default function SocialBattles({ onClose }) {
  const [view, setView] = useState('list'); // list, create, leaderboard
  const [battles, setBattles] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  
  const [newBattle, setNewBattle] = useState({
    duration: 30,
    goal: 'steps',
    target: 300000,
    stakes: 'bragging-rights',
    stakeAmount: 0
  });

  useEffect(() => {
    loadBattles();
    loadStats();
  }, []);

  const loadBattles = async () => {
    const activeBattles = await socialBattlesService.getActiveBattles();
    setBattles(activeBattles);
  };

  const loadStats = async () => {
    const userStats = await socialBattlesService.getBattleStats();
    setStats(userStats);
  };

  const handleCreateBattle = async () => {
    try {
      const result = await socialBattlesService.createBattle(newBattle);
      alert(`✅ Battle Created!\n\nBattle ID: ${result.battleId}\nShare Code: ${result.shareCode}\n\nShare this code with friends to join!`);
      loadBattles();
      setView('list');
    } catch (error) {
      alert('Failed to create battle: ' + error.message);
    }
  };

  const handleViewLeaderboard = async (battleId) => {
    const board = await socialBattlesService.getLiveLeaderboard(battleId);
    setLeaderboard(board);
    setSelectedBattle(battles.find(b => b.id === battleId));
    setView('leaderboard');
  };

  return (
    <div className="battles-overlay">
      <div className="battles-modal">
        <button className="battles-close" onClick={onClose}>✕</button>

        <h2 className="battles-title">⚔️ Social Health Battles</h2>

        {/* View Navigation */}
        <div className="battles-nav">
          <button 
            className={`nav-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            📋 My Battles
          </button>
          <button 
            className={`nav-btn ${view === 'create' ? 'active' : ''}`}
            onClick={() => setView('create')}
          >
            ➕ Create
          </button>
        </div>

        {/* Stats Banner */}
        {stats && (
          <div className="stats-banner">
            <div className="stat-box">
              <span className="stat-value">{stats.wins}</span>
              <span className="stat-label">Wins</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{stats.losses}</span>
              <span className="stat-label">Losses</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{stats.winRate}%</span>
              <span className="stat-label">Win Rate</span>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="battles-list">
            {battles.length === 0 ? (
              <div className="no-battles">
                <p>🏆 No active battles</p>
                <p className="help-text">Create a battle to challenge your friends!</p>
              </div>
            ) : (
              battles.map(battle => (
                <div key={battle.id} className="battle-card">
                  <div className="battle-header">
                    <span className="battle-goal">{battle.goal}</span>
                    <span className={`battle-status ${battle.status}`}>{battle.status}</span>
                  </div>
                  <div className="battle-target">
                    Target: {battle.target.toLocaleString()}
                  </div>
                  <div className="battle-stakes">
                    💰 Stakes: {battle.stakes.replace(/-/g, ' ')}
                    {battle.stakeAmount > 0 && ` ($${battle.stakeAmount})`}
                  </div>
                  <div className="battle-participants">
                    👥 {battle.participants?.length || 0} participants
                  </div>
                  <button 
                    className="view-leaderboard-btn"
                    onClick={() => handleViewLeaderboard(battle.id)}
                  >
                    📊 View Leaderboard
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create View */}
        {view === 'create' && (
          <div className="create-battle">
            <h3>Create New Battle</h3>
            
            <div className="form-group">
              <label>Goal Type:</label>
              <select 
                value={newBattle.goal}
                onChange={(e) => setNewBattle({...newBattle, goal: e.target.value})}
                className="form-select"
              >
                <option value="steps">Steps Challenge</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="health-score">Health Score</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target:</label>
              <input
                type="number"
                value={newBattle.target}
                onChange={(e) => setNewBattle({...newBattle, target: parseInt(e.target.value)})}
                className="form-input"
              />
              <span className="input-hint">
                {newBattle.goal === 'steps' && 'Total steps in 30 days'}
                {newBattle.goal === 'weight-loss' && 'Pounds to lose'}
                {newBattle.goal === 'health-score' && 'Target health score'}
              </span>
            </div>

            <div className="form-group">
              <label>Duration (days):</label>
              <input
                type="number"
                value={newBattle.duration}
                onChange={(e) => setNewBattle({...newBattle, duration: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Stakes:</label>
              <select 
                value={newBattle.stakes}
                onChange={(e) => setNewBattle({...newBattle, stakes: e.target.value})}
                className="form-select"
              >
                <option value="bragging-rights">Bragging Rights</option>
                <option value="money">Money</option>
                <option value="subscription">Subscription Payment</option>
              </select>
            </div>

            {(newBattle.stakes === 'money' || newBattle.stakes === 'subscription') && (
              <div className="form-group">
                <label>Amount ($):</label>
                <input
                  type="number"
                  value={newBattle.stakeAmount}
                  onChange={(e) => setNewBattle({...newBattle, stakeAmount: parseInt(e.target.value)})}
                  className="form-input"
                />
              </div>
            )}

            <button className="create-battle-btn" onClick={handleCreateBattle}>
              ⚔️ Create Battle
            </button>
          </div>
        )}

        {/* Leaderboard View */}
        {view === 'leaderboard' && leaderboard && selectedBattle && (
          <div className="leaderboard-view">
            <button className="back-btn" onClick={() => setView('list')}>← Back</button>
            
            <h3>{selectedBattle.goal.replace(/-/g, ' ').toUpperCase()} Challenge</h3>
            <div className="days-remaining">
              ⏱️ {leaderboard.daysRemaining} days remaining
            </div>

            <div className="leaderboard-list">
              {leaderboard.rankings.map((participant, idx) => (
                <div key={idx} className={`leaderboard-item rank-${participant.rank}`}>
                  <div className="rank-badge">
                    {participant.rank === 1 && '🥇'}
                    {participant.rank === 2 && '🥈'}
                    {participant.rank === 3 && '🥉'}
                    {participant.rank > 3 && `#${participant.rank}`}
                  </div>
                  <div className="participant-info">
                    <div className="participant-name">{participant.userId}</div>
                    <div className="participant-progress">
                      Progress: {participant.progress}%
                    </div>
                  </div>
                  <div className="participant-score">
                    {participant.currentScore.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
