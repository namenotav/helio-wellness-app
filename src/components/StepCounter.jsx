// Premium Step Counter Widget Component
import { useState, useEffect } from 'react';
import { Haptics } from '@capacitor/haptics';
import nativeHealthService from '../services/nativeHealthService';
import stepCounterService from '../services/stepCounterService';
import syncService from '../services/syncService';
import './StepCounter.css';

export default function StepCounter() {
  const [healthData, setHealthData] = useState({
    steps: { current: 0, goal: 10000, progress: 0, remaining: 10000 },
    calories: { burned: 0, unit: 'kcal' },
    distance: { traveled: '0.00', unit: 'km' },
    activeTime: { minutes: 0, hours: '0.0' }
  });
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);

  useEffect(() => {
    // Initialize health service
    nativeHealthService.initialize();
    
    // Initialize step counter service
    stepCounterService.initialize();
    
    // Read dailySteps from Preferences first, localStorage fallback
    const loadSavedSteps = async () => {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value: prefsSteps } = await Preferences.get({ key: 'wellnessai_dailySteps' });
        const savedSteps = prefsSteps || localStorage.getItem('dailySteps');
        if (savedSteps) {
          const steps = JSON.parse(savedSteps);
          if(import.meta.env.DEV)console.log('📊 Loaded saved steps:', steps);
        }
      } catch (e) {
        const savedSteps = localStorage.getItem('dailySteps');
        if (savedSteps) {
          const steps = JSON.parse(savedSteps);
          if(import.meta.env.DEV)console.log('📊 Loaded saved steps:', steps);
        }
      }
    };
    loadSavedSteps();
    
    // Load initial data immediately
    updateHealthData();
    
    // Poll every second to update UI (force refresh)
    const pollInterval = setInterval(() => {
      updateHealthData();
    }, 1000);
    
    // Listen for step updates from both services
    const unwatch = nativeHealthService.watchStepCount(() => {
      updateHealthData();
    });
    
    stepCounterService.addListener(async (steps) => {
      updateHealthData();
      // Sync to cloud
      await syncService.syncSteps({ steps, timestamp: Date.now() });
    });
    
    // Listen for custom events
    const handleHealthUpdate = (event) => {
      updateHealthData();
      
      // Check for goal achievement
      if (event.detail && event.detail.goalReached && !showCelebration) {
        celebrateGoal();
      }
    };
    
    window.addEventListener('healthDataUpdate', handleHealthUpdate);
    
    return () => {
      clearInterval(pollInterval);
      unwatch();
      window.removeEventListener('healthDataUpdate', handleHealthUpdate);
    };
  }, []);

  const updateHealthData = () => {
    const summary = nativeHealthService.getHealthSummary();
    if(import.meta.env.DEV)console.log('🔄 Updating UI with:', summary);
    setHealthData(summary);
  };

  const celebrateGoal = async () => {
    setShowCelebration(true);
    
    // Haptic feedback
    await Haptics.vibrate({ duration: 500 });
    
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const progressPercentage = healthData.steps.progress;
  const circumference = 2 * Math.PI * 70; // radius = 70 (reduced for mobile)
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const runDiagnostics = () => {
    const info = nativeHealthService.getDiagnosticInfo();
    setDiagnosticInfo(info);
    setShowDiagnostics(true);
    if(import.meta.env.DEV)console.log('🔍 Diagnostics:', info);
  };
  
  const addTestSteps = () => {
    nativeHealthService.addTestSteps(100);
  };
  
  const closeDiagnostics = () => {
    setShowDiagnostics(false);
  };

  return (
    <div className="step-counter-widget">
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-emoji">🎉</div>
            <h2>Goal Reached!</h2>
            <p>You hit {healthData.steps.goal} steps today!</p>
          </div>
        </div>
      )}
      
      {showDiagnostics && diagnosticInfo && (
        <div className="diagnostics-overlay" onClick={closeDiagnostics}>
          <div className="diagnostics-panel" onClick={(e) => e.stopPropagation()}>
            <h3>🔍 Step Counter Diagnostics</h3>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Listener Active:</span>
              <span className={`diagnostic-value ${diagnosticInfo.listenerActive ? 'success' : 'error'}`}>
                {diagnosticInfo.listenerActive ? '✅ YES' : '❌ NO'}
              </span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Is Listening:</span>
              <span className={`diagnostic-value ${diagnosticInfo.isListening ? 'success' : 'error'}`}>
                {diagnosticInfo.isListening ? '✅ YES' : '❌ NO'}
              </span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Permission:</span>
              <span className={`diagnostic-value ${diagnosticInfo.permissionGranted ? 'success' : 'error'}`}>
                {diagnosticInfo.permissionGranted ? '✅ Granted' : '❌ Denied'}
              </span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Events Received:</span>
              <span className="diagnostic-value">{diagnosticInfo.totalEventsReceived}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Last Event:</span>
              <span className="diagnostic-value">{diagnosticInfo.lastEventTime}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Current Steps:</span>
              <span className="diagnostic-value">{diagnosticInfo.currentSteps}</span>
            </div>
            {diagnosticInfo.lastAccelData && (
              <div className="diagnostic-item">
                <span className="diagnostic-label">Last Accel:</span>
                <span className="diagnostic-value">
                  X:{diagnosticInfo.lastAccelData.x} Y:{diagnosticInfo.lastAccelData.y} Z:{diagnosticInfo.lastAccelData.z}
                </span>
              </div>
            )}
            <button onClick={closeDiagnostics} className="close-diagnostics-btn">Close</button>
          </div>
        </div>
      )}
      
      <div className="step-counter-card">
        <div className="step-counter-header">
          <h3>Today's Steps</h3>
          <span className="step-goal-badge">{healthData.steps.goal} goal</span>
        </div>
        
        <div className="step-circle-container">
          <svg className="step-progress-ring" width="160" height="160" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667EEA" />
                <stop offset="100%" stopColor="#764BA2" />
              </linearGradient>
            </defs>
            
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="10"
            />
            
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#stepGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 80 80)"
              className="step-progress-circle"
            />
          </svg>
          
          <div className="step-count-display">
            <div className="step-count-number">
              {healthData.steps.current.toLocaleString()}
            </div>
            <div className="step-count-label">steps</div>
            <div className="step-remaining">
              {healthData.steps.remaining > 0 ? (
                <span>{healthData.steps.remaining.toLocaleString()} to go</span>
              ) : (
                <span className="goal-exceeded">🔥 Goal exceeded!</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="health-stats-grid">
          <div className="health-stat">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{healthData.calories.burned}</div>
              <div className="stat-label">Calories</div>
            </div>
          </div>
          
          <div className="health-stat">
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <div className="stat-value">{healthData.distance.traveled}</div>
              <div className="stat-label">Kilometers</div>
            </div>
          </div>
          
          <div className="health-stat">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{healthData.activeTime.minutes}</div>
              <div className="stat-label">Active Min</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}



