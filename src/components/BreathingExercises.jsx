// Breathing Exercises Component
import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import syncService from '../services/syncService';
import gamificationService from '../services/gamificationService';
import subscriptionService from '../services/subscriptionService';
import usageTrackingService from '../services/usageTrackingService';
import './BreathingExercises.css';

const BreathingExercises = ({ onClose, onShowPaywall }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [timer, setTimer] = useState(4);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [usageInfo, setUsageInfo] = useState(null);
  const [hasUsedToday, setHasUsedToday] = useState(false);

  // Check usage limits on mount
  useEffect(() => {
    const checkUsage = async () => {
      await usageTrackingService.initialize();
      const plan = subscriptionService.getCurrentPlan();
      const info = usageTrackingService.checkUsage('breathing', plan.id);
      setUsageInfo(info);
      setHasUsedToday(info.used > 0 && !info.isUnlimited);
    };
    checkUsage();
  }, []);
  
  useEffect(() => {
    // Load breathing session history
    const loadHistory = async () => {
      try {
        const { value } = await Preferences.get({ key: 'wellnessai_breathing_sessions' });
        const localData = localStorage.getItem('breathing_sessions');
        
        if (value) {
          const history = JSON.parse(value);
          setSessionHistory(Array.isArray(history) ? history : [history]);
          if(import.meta.env.DEV)console.log('📊 Loaded breathing history:', history);
        } else if (localData) {
          const history = JSON.parse(localData);
          setSessionHistory(Array.isArray(history) ? history : [history]);
        }
      } catch (error) {
        console.error('Failed to load breathing history:', error);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            setPhase('inhale');
            setSessionDuration(prev => prev + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const startExercise = async () => {
    // Check if user has remaining uses
    const plan = subscriptionService.getCurrentPlan();
    const usage = usageTrackingService.checkUsage('breathing', plan.id);
    
    if (!usage.allowed) {
      // Show limit paywall
      if (onShowPaywall) {
        const paywallData = usageTrackingService.getLimitPaywall('breathing');
        onShowPaywall(paywallData);
      }
      return;
    }
    
    // Track usage (only for free users)
    await usageTrackingService.trackUsage('breathing', plan.id);
    setUsageInfo(usageTrackingService.checkUsage('breathing', plan.id));
    
    setIsActive(true);
    setPhase('inhale');
    setTimer(4);
    setSessionDuration(0);
  };

  const stopExercise = async () => {
    setIsActive(false);
    
    // Save session
    const session = {
      duration: sessionDuration,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    // Save to all storage locations
    const updatedHistory = [...sessionHistory, session];
    localStorage.setItem('breathing_sessions', JSON.stringify(updatedHistory));
    await Preferences.set({ key: 'wellnessai_breathing_sessions', value: JSON.stringify(updatedHistory) });
    await syncService.saveData('breathing_sessions', session);
    setSessionHistory(updatedHistory);
    
    // Award points
    gamificationService.addPoints(sessionDuration * 2, 'breathing_exercise');
  };

  return (
    <div className="breathing-modal">
      <div className="breathing-content">
        <div className="breathing-header">
          <h2>🧘 Breathing Exercise</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="breathing-circle">
          <div className={`circle ${phase}`}>
            <h1>{timer}</h1>
            <p>{phase.toUpperCase()}</p>
          </div>
        </div>

        <div className="session-stats">
          <p>Session Duration: {sessionDuration} cycles</p>
        </div>

        <div className="breathing-controls">
          {!isActive ? (
            <>
              <button onClick={startExercise}>▶️ Start</button>
              {usageInfo && !usageInfo.isUnlimited && (
                <p className="usage-info">
                  {usageInfo.remaining > 0 
                    ? `${usageInfo.remaining}/${usageInfo.limit} free session${usageInfo.limit > 1 ? 's' : ''} left today`
                    : '⏰ Daily limit reached - resets at midnight'}
                </p>
              )}
            </>
          ) : (
            <button onClick={stopExercise}>⏹️ Stop</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingExercises;
