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
      // Read from Preferences first (with wellnessai_ prefix), fallback to localStorage
      const { value } = await Preferences.get({ key: 'wellnessai_battles' });
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
    // 🤖 AI opponent starts at 0 and progresses based on difficulty level
    // Real multiplayer battles use Firebase Realtime Database for live scores
    const isAIOpponent = opponentId === 'RandomOpponent' || opponentId === 'FitnessFriend';
    const opponentName = isAIOpponent ? `🤖 AI Coach (${opponentId})` : opponentId;
    
    const battle = {
      id: Date.now().toString(),
      opponent: opponentName,
      isAI: isAIOpponent,
      startTime: Date.now(),
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      myScore: 0,
      opponentScore: 0, // 🔥 FIX: AI starts at 0, progresses realistically over time
      aiDailyTarget: isAIOpponent ? 8000 : 0 // AI aims for 8000 steps/day
    };

    const newBattles = [...activeBattles, battle];
    setActiveBattles(newBattles);

    const battleData = { active: newBattles, history: battleHistory };
    
    // Save to all storage locations for consistency
    localStorage.setItem('battles', JSON.stringify(battleData));
    await Preferences.set({ 
      key: 'wellnessai_battles', 
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
