// Social Battles Component - Competitive Health Challenges (PRO)
import { useState, useEffect } from 'react';
import './SocialBattles.css';
import socialBattlesService from '../services/socialBattlesService';
import gamificationService from '../services/gamificationService';
import subscriptionService from '../services/subscriptionService';
import authService from '../services/authService';

export default function SocialBattles({ onClose }) {
  const [view, setView] = useState('list'); // list, create, leaderboard, global, teams, history, rewards
  const [battles, setBattles] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [leaderboardMetric, setLeaderboardMetric] = useState('totalXP');
  const [battleHistory, setBattleHistory] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [battleStreak, setBattleStreak] = useState({ current: 0, multiplier: 1.0 });
  const [activePowerUps, setActivePowerUps] = useState([]);
  
  const [newBattle, setNewBattle] = useState({
    duration: 30,
    goal: 'steps',
    target: 300000,
    stakes: 'bragging-rights',
    stakeAmount: 0,
    battleType: 'solo' // solo, team, tournament
  });

  useEffect(() => {
    // Check if user has access to social battles (Premium+ required)
    if (!subscriptionService.hasAccess('socialBattles')) {
      // Don't load battles, show upgrade prompt instead
      return;
    }

    try {
      loadBattles();
      loadStats();
      loadGlobalLeaderboard();
      loadBattleHistory();
      loadRewards();
      loadDailyChallenges();
      loadBattleStreak();

      // Auto-sync battle progress every 60 seconds
      const autoSyncInterval = setInterval(async () => {
        try {
          await socialBattlesService.autoSyncAllBattles();
          loadBattles(); // Refresh UI
        } catch (error) {
          if(import.meta.env.DEV)console.error('Auto-sync failed:', error);
        }
      }, 60000); // 60 seconds

      // Cleanup interval on unmount
      return () => clearInterval(autoSyncInterval);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load battles:', error);
    }
  }, []);

  const loadBattles = async () => {
    try {
      const activeBattles = await socialBattlesService.getActiveBattles();
      setBattles(activeBattles || []);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load battles:', error);
      setBattles([]);
    }
  };

  const loadStats = async () => {
    try {
      const userStats = await socialBattlesService.getBattleStats();
      setStats(userStats || { wins: 0, losses: 0, winRate: 0 });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load stats:', error);
      setStats({ wins: 0, losses: 0, winRate: 0 });
    }
  };

  const loadGlobalLeaderboard = () => {
    try {
      const data = gamificationService.getGlobalLeaderboard(leaderboardMetric, 50);
      setGlobalLeaderboard(data);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load global leaderboard:', error);
      setGlobalLeaderboard([]);
    }
  };

  const loadBattleHistory = async () => {
    try {
      // Get real completed battles from service
      const completed = await socialBattlesService.getBattleHistory();
      
      // Transform to display format - filter out invalid battles
      const history = (completed || [])
        .filter(battle => battle && battle.config) // Skip null/undefined battles
        .map(battle => {
          const user = authService.getCurrentUser() || { id: 'current-user' };
          const isWinner = battle.results?.winner?.userId === user.id;
          const opponent = isWinner 
            ? battle.results?.loser?.userName || 'Opponent'
            : battle.results?.winner?.userName || 'Opponent';
          
          return {
            id: battle.id || 'unknown',
            type: `${(battle.config?.goal || 'Unknown').replace(/-/g, ' ')} Challenge`,
            opponent: opponent,
            result: isWinner ? 'won' : 'lost',
            date: battle.results?.completedAt ? new Date(battle.results.completedAt).toLocaleDateString() : 'Unknown',
            xpEarned: isWinner ? 75 : 25 // Base XP, could be from gamification service
          };
        }).reverse(); // Most recent first
      
      setBattleHistory(history);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load battle history:', error);
      setBattleHistory([]);
    }
  };

  const loadRewards = () => {
    try {
      const rewardsData = gamificationService.getBattleRewards();
      setRewards(rewardsData);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load rewards:', error);
      setRewards(null);
    }
  };

  const loadDailyChallenges = () => {
    try {
      const stored = localStorage.getItem('daily_battle_challenges');
      const today = new Date().toDateString();
      
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
          setDailyChallenges(data.challenges);
          return;
        }
      }
      
      // Generate new daily challenges
      const challenges = [
        { 
          id: 'daily_steps', 
          name: 'Daily Step Sprint', 
          description: '10,000 steps in 24 hours',
          target: 10000, 
          xpReward: 100, 
          icon: '🏃',
          progress: 0,
          completed: false
        },
        { 
          id: 'quick_battle', 
          name: 'Quick Battle Victory', 
          description: 'Win any battle today',
          xpReward: 75, 
          icon: '⚔️',
          progress: 0,
          completed: false
        }
      ];
      
      localStorage.setItem('daily_battle_challenges', JSON.stringify({ date: today, challenges }));
      setDailyChallenges(challenges);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load daily challenges:', error);
      setDailyChallenges([]);
    }
  };

  const loadBattleStreak = () => {
    try {
      const stored = localStorage.getItem('battle_streak');
      if (stored) {
        const data = JSON.parse(stored);
        const multiplier = 1.0 + (data.current * 0.1); // +10% per win streak
        setBattleStreak({ current: data.current || 0, multiplier });
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load battle streak:', error);
    }
  };

  const updateBattleStreak = (won) => {
    try {
      const stored = localStorage.getItem('battle_streak') || '{"current": 0}';
      const data = JSON.parse(stored);
      
      if (won) {
        data.current = (data.current || 0) + 1;
      } else {
        data.current = 0;
      }
      
      localStorage.setItem('battle_streak', JSON.stringify(data));
      const multiplier = 1.0 + (data.current * 0.1);
      setBattleStreak({ current: data.current, multiplier });
      
      // Send notification for streak milestones
      if (data.current === 3 || data.current === 7 || data.current === 30) {
        import('../services/battleNotificationsService').then(({ default: notificationService }) => {
          notificationService.sendStreakRisk({ streak: data.current });
        });
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to update streak:', error);
    }
  };

  const handleCreateBattle = async () => {
    try {
      const result = await socialBattlesService.createBattle(newBattle);
      
      if (result.success) {
        // Store the battle info for sharing
        const battleInfo = {
          battleId: result.battleId,
          shareCode: result.shareCode
        };
        
        // Show success message with share option
        const shareNow = confirm(`✅ Battle Created!\n\nBattle ID: ${battleInfo.battleId}\nShare Code: ${battleInfo.shareCode}\n\nPress OK to share with friends, or Cancel to continue.`);
        
        // Reload battles first
        await loadBattles();
        
        // Try to share if user confirmed
        if (shareNow) {
          await handleShareBattle(battleInfo);
        }
        
        // Switch to list view
        setView('list');
      } else {
        throw new Error(result.error || 'Failed to create battle');
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Create battle error:', error);
      alert('Failed to create battle: ' + error.message);
    }
  };

  const handleShareBattle = async (battleInfo) => {
    try {
      // Try native share API
      const { Share } = await import('@capacitor/share');
      
      await Share.share({
        title: '⚔️ Join My Health Battle!',
        text: `I challenge you to a health battle in WellnessAI!\n\nShare Code: ${battleInfo.shareCode}\n\nDownload the app and enter this code to join!`,
        dialogTitle: 'Share Battle Code'
      });
    } catch (error) {
      if(import.meta.env.DEV)console.log('Share not available, using clipboard:', error);
      
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(battleInfo.shareCode);
        alert(`📋 Share Code Copied!\n\n${battleInfo.shareCode}\n\nPaste this code to your friends via WhatsApp, SMS, or any messaging app!`);
      } catch (clipError) {
        if(import.meta.env.DEV)console.log('Clipboard not available:', clipError);
        // Just show the code again
        alert(`Share Code: ${battleInfo.shareCode}\n\nSend this to your friends manually!`);
      }
    }
  };

  const handleJoinBattle = async () => {
    const code = prompt('Enter Battle Share Code:');
    if (!code) return;

    try {
      const result = await socialBattlesService.joinByShareCode(code.toUpperCase());
      
      if (result.success) {
        alert(`✅ Joined Battle!\n\nThe battle will start when all participants are ready.\n\nGood luck! 🔥`);
        loadBattles();
      } else {
        throw new Error(result.error || 'Failed to join battle');
      }
    } catch (error) {
      alert('Failed to join battle: ' + error.message);
    }
  };

  const handleSyncProgress = async (battleId) => {
    try {
      const result = await socialBattlesService.syncBattleProgress(battleId);
      
      if (result.success) {
        alert(`📊 Progress Updated!\n\nCurrent Steps: ${(result.currentSteps || 0).toLocaleString()}\nProgress: +${(result.progress || 0).toLocaleString()}\nRank: #${result.rank || '-'}\n\nKeep moving! 💪`);
        loadBattles();
      }
    } catch (error) {
      alert('Failed to sync: ' + error.message);
    }
  };

  const handleViewLeaderboard = async (battleId) => {
    const board = await socialBattlesService.getLiveLeaderboard(battleId);
    setLeaderboard(board);
    setSelectedBattle(battles.find(b => b.id === battleId));
    setView('leaderboard');
  };

  const handleQuickMatch = async () => {
    try {
      // Create instant battle with default settings
      const quickBattle = {
        duration: 1, // 1 day sprint
        goal: 'steps',
        target: 10000,
        stakes: 'bragging-rights',
        stakeAmount: 0,
        battleType: 'quick'
      };
      
      const result = await socialBattlesService.createBattle(quickBattle);
      
      if (result.success) {
        alert('⚡ Quick Match Created!\n\nFinding opponents...\n\nBattle starts when 2+ players join!');
        
        // Send notification
        import('../services/battleNotificationsService').then(({ default: notificationService }) => {
          notificationService.sendBattleInvite({
            creatorName: 'You',
            goal: 'Quick Step Battle',
            battleId: result.battleId
          });
        });
        
        await loadBattles();
      }
    } catch (error) {
      alert('Quick Match failed: ' + error.message);
    }
  };

  const handleClaimReward = async (reward) => {
    try {
      if (rewards.userCoins < reward.cost) {
        alert(`❌ Not enough coins!\n\nYou need ${reward.cost - rewards.userCoins} more coins.`);
        return;
      }
      
      // Deduct coins
      const newCoins = rewards.userCoins - reward.cost;
      
      // Activate power-up
      const powerUp = {
        id: reward.id,
        name: reward.name,
        activatedAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      const stored = localStorage.getItem('active_powerups') || '[]';
      const powerUps = JSON.parse(stored);
      powerUps.push(powerUp);
      localStorage.setItem('active_powerups', JSON.stringify(powerUps));
      
      setActivePowerUps(powerUps);
      
      // Update rewards display
      setRewards({ ...rewards, userCoins: newCoins });
      
      alert(`✅ ${reward.name} activated!\n\n${reward.description}\n\nExpires in 24 hours.`);
    } catch (error) {
      alert('Failed to claim reward: ' + error.message);
    }
  };

  return (
    <div className="battles-overlay">
      <div className="battles-modal">
        <button className="battles-close" onClick={onClose}>✕</button>

        <h2 className="battles-title">⚔️ Social Health Battles</h2>

        {/* Show paywall if no access */}
        {!subscriptionService.hasAccess('socialBattles') ? (
          <div className="paywall-notice" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔒</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Unlock Social Battles</h3>
            <p style={{ color: '#888', marginBottom: '30px' }}>Compete with friends and climb the leaderboards!</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', textAlign: 'left', maxWidth: '400px', margin: '0 auto 30px' }}>
              <li style={{ padding: '8px 0' }}>✅ Challenge friends to health battles</li>
              <li style={{ padding: '8px 0' }}>✅ Join global leaderboards</li>
              <li style={{ padding: '8px 0' }}>✅ Earn rewards and badges</li>
              <li style={{ padding: '8px 0' }}>✅ Track your battle history</li>
            </ul>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>Starting at <strong>£16.99/month</strong></p>
            <p style={{ fontSize: '20px', color: '#10b981', fontWeight: 'bold', marginBottom: '20px' }}>🎉 30 DAYS FREE - Cancel anytime</p>
            <button 
              style={{ 
                padding: '15px 40px',
                fontSize: '18px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => {
                import('../services/stripeService').then(({ checkoutPremium }) => {
                  checkoutPremium();
                });
              }}
            >
              ⭐ Start Free Trial
            </button>
          </div>
        ) : (
          <>
        {/* View Navigation */}
        <div className="battles-nav">
          <button 
            className={`nav-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            📋 Battles
          </button>
          <button 
            className={`nav-btn ${view === 'create' ? 'active' : ''}`}
            onClick={() => setView('create')}
          >
            ➕ Create
          </button>
          <button 
            className={`nav-btn ${view === 'global' ? 'active' : ''}`}
            onClick={() => setView('global')}
          >
            🌍 Leaderboard
          </button>
          <button 
            className={`nav-btn ${view === 'history' ? 'active' : ''}`}
            onClick={() => setView('history')}
          >
            📜 History
          </button>
          <button 
            className={`nav-btn ${view === 'rewards' ? 'active' : ''}`}
            onClick={() => setView('rewards')}
          >
            🏆 Rewards
          </button>
          <button 
            className="nav-btn join-btn"
            onClick={handleJoinBattle}
          >
            🔗 Join
          </button>
          <button 
            className="nav-btn quick-match-btn"
            onClick={handleQuickMatch}
            style={{ background: 'linear-gradient(135deg, #FF4500, #FFD700)', fontWeight: 'bold' }}
          >
            ⚡ Quick Match
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
            <div className="stat-box" style={{ borderColor: '#FFD700' }}>
              <span className="stat-value" style={{ color: '#FFD700' }}>🔥 {battleStreak.current}</span>
              <span className="stat-label">Win Streak</span>
              {battleStreak.current > 0 && (
                <span style={{ fontSize: '11px', color: '#FFD700' }}>{battleStreak.multiplier}x XP</span>
              )}
            </div>
          </div>
        )}

        {/* Daily Challenges */}
        {dailyChallenges.length > 0 && view === 'list' && (
          <div className="daily-challenges" style={{ margin: '15px 0', padding: '15px', background: 'rgba(255, 215, 0, 0.1)', border: '2px solid rgba(255, 215, 0, 0.3)', borderRadius: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#FFD700' }}>⏰ Daily Challenges (Expires Midnight)</h3>
            {dailyChallenges.map(challenge => (
              <div key={challenge.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{challenge.icon} {challenge.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>{challenge.description}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFD700' }}>+{challenge.xpReward} XP</div>
                  {challenge.completed ? (
                    <div style={{ fontSize: '12px', color: '#4CAF50' }}>✅ Done</div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#FF4500' }}>⏰ {new Date().getHours() < 12 ? 24 - new Date().getHours() : 24 - new Date().getHours()} hrs left</div>
                  )}
                </div>
              </div>
            ))}
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
                <div key={battle.id || Math.random()} className="battle-card">
                  <div className="battle-header">
                    <span className="battle-goal">{battle.goal || 'Unknown'}</span>
                    <span className={`battle-status ${battle.status || 'unknown'}`}>{battle.status || 'unknown'}</span>
                  </div>
                  <div className="battle-target">
                    Target: {(battle.target || 0).toLocaleString()}
                  </div>
                  <div className="battle-stakes">
                    💰 Stakes: {(battle.stakes || 'none').replace(/-/g, ' ')}
                    {(battle.stakeAmount || 0) > 0 && ` ($${battle.stakeAmount})`}
                  </div>
                  <div className="battle-participants">
                    👥 {battle.participants?.length || 0} participants
                  </div>
                  <div className="battle-actions">
                    <button 
                      className="view-leaderboard-btn"
                      onClick={() => handleViewLeaderboard(battle.id)}
                    >
                      📊 Leaderboard
                    </button>
                    {battle.status === 'active' && (
                      <button 
                        className="sync-btn"
                        onClick={() => handleSyncProgress(battle.id)}
                      >
                        🔄 Sync Progress
                      </button>
                    )}
                  </div>
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
            
            <h3>{(selectedBattle.goal || 'Unknown').replace(/-/g, ' ').toUpperCase()} Challenge</h3>
            <div className="days-remaining">
              ⏱️ {leaderboard.daysRemaining} days remaining
            </div>

            <div className="leaderboard-list">
              {leaderboard.leaderboard.map((participant, idx) => (
                <div key={idx} className={`leaderboard-item rank-${participant.rank}`}>
                  <div className="rank-badge">
                    {participant.rank === 1 && '🥇'}
                    {participant.rank === 2 && '🥈'}
                    {participant.rank === 3 && '🥉'}
                    {participant.rank > 3 && `#${participant.rank}`}
                  </div>
                  <div className="participant-info">
                    <div className="participant-name">
                      {participant.userId}
                      {participant.isVIP && ' 👑'}
                    </div>
                    <div className="participant-progress">
                      Progress: {participant.progress}%
                    </div>
                  </div>
                  <div className="participant-score">
                    {(participant.currentScore || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Leaderboard View (PRO) */}
        {view === 'global' && (
          <div className="global-leaderboard-view">
            <div className="metric-selector">
              <button 
                className={leaderboardMetric === 'totalXP' ? 'active' : ''}
                onClick={() => { setLeaderboardMetric('totalXP'); loadGlobalLeaderboard(); }}
              >
                ⚡ XP
              </button>
              <button 
                className={leaderboardMetric === 'level' ? 'active' : ''}
                onClick={() => { setLeaderboardMetric('level'); loadGlobalLeaderboard(); }}
              >
                🏅 Level
              </button>
              <button 
                className={leaderboardMetric === 'streak' ? 'active' : ''}
                onClick={() => { setLeaderboardMetric('streak'); loadGlobalLeaderboard(); }}
              >
                🔥 Streak
              </button>
              <button 
                className={leaderboardMetric === 'totalSteps' ? 'active' : ''}
                onClick={() => { setLeaderboardMetric('totalSteps'); loadGlobalLeaderboard(); }}
              >
                👟 Steps
              </button>
            </div>

            <div className="global-leaderboard-list">
              {globalLeaderboard.map((user) => (
                <div 
                  key={user.userId} 
                  className={`global-leaderboard-item ${user.isCurrentUser ? 'current-user' : ''} ${user.rank <= 3 ? 'top-three' : ''}`}
                >
                  <div className="rank-badge-global">
                    {user.rank === 1 && '🥇'}
                    {user.rank === 2 && '🥈'}
                    {user.rank === 3 && '🥉'}
                    {user.rank > 3 && `#${user.rank}`}
                  </div>
                  <div className="user-avatar">{user.profilePic}</div>
                  <div className="user-details">
                    <div className="user-name">
                      {user.username}
                      {user.isVIP && ' 👑'}
                    </div>
                    <div className="user-level">Level {user.level}</div>
                  </div>
                  <div className="user-stat">
                    {leaderboardMetric === 'totalXP' && `${(user.totalXP || 0).toLocaleString()} XP`}
                    {leaderboardMetric === 'level' && `Level ${user.level || 1}`}
                    {leaderboardMetric === 'streak' && `${user.streak || 0} days 🔥`}
                    {leaderboardMetric === 'totalSteps' && `${(user.totalSteps || 0).toLocaleString()} steps`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Battle History View (PRO) */}
        {view === 'history' && (
          <div className="history-view">
            <h3>⚔️ Battle History</h3>
            <div className="history-stats">
              <div className="history-stat">
                <div className="stat-value">{stats?.wins || 0}</div>
                <div className="stat-label">Wins</div>
              </div>
              <div className="history-stat">
                <div className="stat-value">{stats?.losses || 0}</div>
                <div className="stat-label">Losses</div>
              </div>
              <div className="history-stat">
                <div className="stat-value">{stats?.winRate || 0}%</div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>

            <div className="history-list">
              {battleHistory.map((battle) => (
                <div key={battle.id} className={`history-item ${battle.result}`}>
                  <div className="history-icon">
                    {battle.result === 'won' ? '🏆' : '💀'}
                  </div>
                  <div className="history-details">
                    <div className="history-type">{battle.type}</div>
                    <div className="history-opponent">vs {battle.opponent}</div>
                    <div className="history-date">{battle.date}</div>
                  </div>
                  <div className="history-reward">
                    <div className="xp-earned">+{battle.xpEarned} XP</div>
                    <div className={`result-badge ${battle.result}`}>
                      {battle.result === 'won' ? 'VICTORY' : 'DEFEAT'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards View (PRO) */}
        {view === 'rewards' && rewards && (
          <div className="rewards-view">
            <h3>🏆 Battle Rewards</h3>
            <div className="user-coins">
              💰 Your Coins: <strong>{rewards.userCoins}</strong>
            </div>

            <div className="rewards-list">
              {rewards.availableRewards.map((reward) => (
                <div key={reward.id} className="reward-card">
                  <div className="reward-icon">{reward.icon}</div>
                  <div className="reward-info">
                    <div className="reward-name">{reward.name}</div>
                    <div className="reward-description">{reward.description}</div>
                  </div>
                  <div className="reward-action">
                    <div className="reward-cost">{reward.cost} coins</div>
                    <button 
                      className="claim-btn"
                      onClick={() => handleClaimReward(reward)}
                      disabled={rewards.userCoins < reward.cost}
                    >
                      Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}



