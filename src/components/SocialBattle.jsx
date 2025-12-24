// Social Battle Component - Compete with Friends
import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import syncService from '../services/syncService';
import gamificationService from '../services/gamificationService';
import './SocialBattle.css';

const SocialBattle = ({ onClose }) => {
  const [activeBattles, setActiveBattles] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);

  useEffect(() => {
    loadBattleData();
  }, []);

  const loadBattleData = async () => {
    try {
      // Read from both Preferences and localStorage for consistency
      const { value } = await Preferences.get({ key: 'battles' });
      const localData = localStorage.getItem('battles');
      
      if (value) {
        const data = JSON.parse(value);
        setActiveBattles(data.active || []);
        setBattleHistory(data.history || []);
        if(import.meta.env.DEV)console.log('📊 Loaded battles from Preferences:', data);
      } else if (localData) {
        const data = JSON.parse(localData);
        setActiveBattles(data.active || []);
        setBattleHistory(data.history || []);
        if(import.meta.env.DEV)console.log('📊 Loaded battles from localStorage:', data);
      }
    } catch (error) {
      console.error('Failed to load battle data:', error);
    }
  };

  const startBattle = async (opponentId) => {
    const battle = {
      id: Date.now().toString(),
      opponent: opponentId,
      startTime: Date.now(),
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      myScore: 0,
      opponentScore: Math.floor(Math.random() * 1000)
    };

    const newBattles = [...activeBattles, battle];
    setActiveBattles(newBattles);

    const battleData = { active: newBattles, history: battleHistory };
    
    // Save to all storage locations for consistency
    localStorage.setItem('battles', JSON.stringify(battleData));
    await Preferences.set({ 
      key: 'battles', 
      value: JSON.stringify(battleData) 
    });
    await syncService.saveData('battles', battleData);
  };

  return (
    <div className="battle-modal">
      <div className="battle-content">
        <div className="battle-header">
          <h2>⚔️ Social Battles</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="active-battles">
          <h3>Active Battles</h3>
          {activeBattles.length === 0 ? (
            <p>No active battles. Challenge a friend!</p>
          ) : (
            activeBattles.map(battle => (
              <div key={battle.id} className="battle-card">
                <div className="opponent">vs {battle.opponent}</div>
                <div className="scores">
                  <span>You: {battle.myScore}</span>
                  <span>Them: {battle.opponentScore}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="battle-actions">
          <button onClick={() => startBattle('FitnessFriend')}>Challenge Friend</button>
          <button onClick={() => startBattle('RandomOpponent')}>Random Battle</button>
        </div>
      </div>
    </div>
  );
};

export default SocialBattle;
