import React, { useState, useEffect } from 'react';
import './AppleHealthSync.css';

const AppleHealthSync = ({ isOpen, onClose }) => {
  const [authorized, setAuthorized] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [healthData, setHealthData] = useState({
    steps: 0,
    heartRate: 0,
    sleep: 0,
    calories: 0,
    distance: 0,
    workouts: []
  });
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Check if already authorized
    const isAuthorized = localStorage.getItem('appleHealthAuthorized') === 'true';
    setAuthorized(isAuthorized);
    
    // Load cached health data
    const cached = localStorage.getItem('appleHealthData');
    if (cached) {
      setHealthData(JSON.parse(cached));
    }

    const lastSyncTime = localStorage.getItem('appleHealthLastSync');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime));
    }
  }, []);

  const requestAuthorization = async () => {
    setSyncing(true);

    try {
      // Simulate native health authorization request
      // In production, use Capacitor Health plugin:
      // import { Health } from '@capacitor-community/health';
      // const result = await Health.requestAuthorization({
      //   read: ['steps', 'heart_rate', 'sleep', 'calories', 'distance', 'workouts']
      // });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock authorization success
      setAuthorized(true);
      localStorage.setItem('appleHealthAuthorized', 'true');

      // Auto-sync after authorization
      await syncHealthData();

    } catch (err) {
      if(import.meta.env.DEV)console.error('Health authorization error:', err);
      alert('Failed to authorize Apple Health access. Please check your settings.');
    } finally {
      setSyncing(false);
    }
  };

  const syncHealthData = async () => {
    if (!authorized && !localStorage.getItem('appleHealthAuthorized')) {
      alert('Please authorize Apple Health access first');
      return;
    }

    setSyncing(true);

    try {
      // Simulate health data sync
      // In production, fetch real data from Apple Health:
      // const steps = await Health.queryAggregated({
      //   dataType: 'steps',
      //   startDate: new Date(Date.now() - 24*60*60*1000),
      //   endDate: new Date()
      // });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate realistic mock data
      const now = new Date();
      const mockData = {
        steps: Math.floor(Math.random() * 5000) + 6000, // 6000-11000
        heartRate: Math.floor(Math.random() * 30) + 65, // 65-95 bpm
        sleep: (Math.random() * 2 + 6).toFixed(1), // 6-8 hours
        calories: Math.floor(Math.random() * 500) + 1800, // 1800-2300
        distance: (Math.random() * 3 + 4).toFixed(2), // 4-7 km
        workouts: [
          { type: 'Running', duration: 30, calories: 240, time: '08:00 AM' },
          { type: 'Cycling', duration: 45, calories: 320, time: '06:30 PM' }
        ]
      };

      setHealthData(mockData);
      setLastSync(now);

      // Cache the data
      localStorage.setItem('appleHealthData', JSON.stringify(mockData));
      localStorage.setItem('appleHealthLastSync', now.toISOString());

    } catch (err) {
      if(import.meta.env.DEV)console.error('Health sync error:', err);
      alert('Failed to sync health data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const revokeAccess = () => {
    if (confirm('Are you sure you want to revoke Apple Health access?')) {
      setAuthorized(false);
      localStorage.removeItem('appleHealthAuthorized');
      localStorage.removeItem('appleHealthData');
      localStorage.removeItem('appleHealthLastSync');
      setHealthData({
        steps: 0,
        heartRate: 0,
        sleep: 0,
        calories: 0,
        distance: 0,
        workouts: []
      });
      setLastSync(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="apple-health-overlay" onClick={onClose}>
      <div className="apple-health-modal" onClick={(e) => e.stopPropagation()}>
        <button className="apple-health-close" onClick={onClose}>✕</button>

        <div className="apple-health-header">
          <div className="health-icon">❤️</div>
          <h2>Apple Health Sync</h2>
          <p>Integrate your Apple Health data seamlessly</p>
        </div>

        {!authorized ? (
          <div className="health-auth-section">
            <div className="auth-info">
              <h3>📊 What we'll access:</h3>
              <ul className="permissions-list">
                <li>👟 Steps & Distance</li>
                <li>❤️ Heart Rate</li>
                <li>😴 Sleep Analysis</li>
                <li>🔥 Calories Burned</li>
                <li>💪 Workout Sessions</li>
                <li>⚖️ Body Measurements</li>
              </ul>

              <div className="privacy-note">
                <span>🔒</span>
                <p>Your health data is private and encrypted. We never share it with third parties.</p>
              </div>
            </div>

            <button 
              className="authorize-btn"
              onClick={requestAuthorization}
              disabled={syncing}
            >
              {syncing ? (
                <span>⏳ Authorizing...</span>
              ) : (
                <span>✓ Authorize Apple Health</span>
              )}
            </button>
          </div>
        ) : (
          <div className="health-data-section">
            <div className="sync-controls">
              <button 
                className="sync-btn"
                onClick={syncHealthData}
                disabled={syncing}
              >
                {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
              </button>
              
              {lastSync && (
                <p className="last-sync">
                  Last synced: {lastSync.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="health-stats-grid">
              <div className="health-stat">
                <div className="stat-icon">👟</div>
                <div className="stat-value">{healthData.steps.toLocaleString()}</div>
                <div className="stat-label">Steps</div>
              </div>

              <div className="health-stat">
                <div className="stat-icon">❤️</div>
                <div className="stat-value">{healthData.heartRate}</div>
                <div className="stat-label">BPM</div>
              </div>

              <div className="health-stat">
                <div className="stat-icon">😴</div>
                <div className="stat-value">{healthData.sleep}h</div>
                <div className="stat-label">Sleep</div>
              </div>

              <div className="health-stat">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{healthData.calories}</div>
                <div className="stat-label">Calories</div>
              </div>

              <div className="health-stat">
                <div className="stat-icon">📏</div>
                <div className="stat-value">{healthData.distance}</div>
                <div className="stat-label">km</div>
              </div>

              <div className="health-stat">
                <div className="stat-icon">💪</div>
                <div className="stat-value">{healthData.workouts.length}</div>
                <div className="stat-label">Workouts</div>
              </div>
            </div>

            {healthData.workouts.length > 0 && (
              <div className="workouts-section">
                <h3>🏃 Today's Workouts</h3>
                <div className="workouts-list">
                  {healthData.workouts.map((workout, idx) => (
                    <div key={idx} className="workout-item">
                      <div className="workout-info">
                        <span className="workout-type">{workout.type}</span>
                        <span className="workout-time">{workout.time}</span>
                      </div>
                      <div className="workout-stats">
                        <span>⏱️ {workout.duration} min</span>
                        <span>🔥 {workout.calories} cal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              className="revoke-btn"
              onClick={revokeAccess}
            >
              ⚠️ Revoke Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppleHealthSync;



