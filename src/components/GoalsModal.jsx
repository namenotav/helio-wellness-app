// Daily Goals Modal
import { useState, useEffect } from 'react';
import dataService from '../services/dataService'; // 🎯 SINGLE SOURCE OF TRUTH
import './GoalsModal.css';

export default function GoalsModal({ isOpen, onClose, todaySteps = 0 }) {
  const [goals, setGoals] = useState({
    steps: { current: 0, target: 10000, unit: 'steps' },
    water: { current: 0, target: 8, unit: 'cups' },
    meals: { current: 0, target: 3, unit: 'meals' },
    sleep: { current: 0, target: 8, unit: 'hours' },
    workouts: { current: 0, target: 1, unit: 'workout' }
  });
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Real-time updates + midnight reset detection
  useEffect(() => {
    if (isOpen) {
      loadGoals();
      
      // Poll for updates every 2 seconds while modal is open
      const pollInterval = setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        
        // Detect midnight - date changed
        if (today !== currentDate) {
          if(import.meta.env.DEV)console.log('🌙 [GoalsModal] Date changed! Resetting for new day:', today);
          setCurrentDate(today);
        }
        
        loadGoals();
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [isOpen, todaySteps, currentDate]);

  const loadGoals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 🔥 READ STEPS DIRECTLY FROM NOTIFICATION SERVICE (bypass Dashboard prop)
      let stepCount = todaySteps; // Fallback to prop
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const storedSteps = await Preferences.get({ key: 'wellnessai_todaySteps' });
        const rawValue = storedSteps.value || '0';
        try {
          stepCount = parseInt(JSON.parse(rawValue));
        } catch {
          stepCount = parseInt(rawValue);
        }
        if(import.meta.env.DEV)console.log('📊 [GoalsModal] Direct steps from notification:', stepCount);
      } catch (err) {
        if(import.meta.env.DEV)console.warn('[GoalsModal] Could not read steps, using prop:', todaySteps);
      }
      
      // 🔥 READ FROM FIRESTORE (same sources as Dashboard)
      const { default: firestoreService } = await import('../services/firestoreService');
      const { default: authService } = await import('../services/authService');
      
      const userId = authService.getCurrentUser()?.uid;
      
      // 🎯 Water from dataService (4-system architecture)
      const waterLog = await dataService.get('waterLog', userId) || [];
      const waterToday = waterLog.filter(w => w.date === today);
      const waterCups = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0);
      
      // Meals from user profile
      const currentUser = authService.getCurrentUser();
      const foodLog = currentUser?.profile?.foodLog || [];
      const todayMeals = foodLog.filter(f => 
        f.date === today || (f.timestamp && new Date(f.timestamp).toISOString().split('T')[0] === today)
      ).length;
      
      // 🎯 Workouts from localStorage FIRST (instant updates)
      const workoutLog = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const todayWorkouts = workoutLog.filter(w => w.date === today).length;
      
      // 🎯 Sleep from localStorage FIRST (instant updates)
      const sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]');
      const sleepToday = sleepLog.find(s => s.date === today);
      const sleepHours = sleepToday ? (sleepToday.duration || sleepToday.hours || 0) : 0;

      if(import.meta.env.DEV)console.log('🎯 [GoalsModal] Loaded:', { stepCount, waterCups, todayMeals, todayWorkouts, sleepHours });

      setGoals({
        steps: { current: stepCount, target: 10000, unit: 'steps' },
        water: { current: waterCups, target: 8, unit: 'cups' },
        meals: { current: todayMeals, target: 3, unit: 'meals' },
        sleep: { current: sleepHours, target: 8, unit: 'hours' },
        workouts: { current: todayWorkouts, target: 1, unit: 'workout' }
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load goals:', error);
    }
  };

  const getPercentage = (current, target) => Math.min((current / target) * 100, 100);

  if (!isOpen) return null;

  const goalsList = [
    { key: 'steps', icon: '👟', label: 'Steps', color: '#4cc9f0' },
    { key: 'water', icon: '💧', label: 'Water', color: '#4361ee' },
    { key: 'meals', icon: '🍽️', label: 'Meals', color: '#43e97b' },
    { key: 'sleep', icon: '😴', label: 'Sleep', color: '#f093fb' },
    { key: 'workouts', icon: '💪', label: 'Workouts', color: '#ff6b6b' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="goals-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Goals</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="goals-hero">
          <div className="hero-icon">🎯</div>
          <h3>Today's Goals</h3>
          <p>Track your daily wellness targets</p>
        </div>

        <div className="goals-list">
          {goalsList.map(goal => {
            const data = goals[goal.key];
            const percentage = getPercentage(data.current, data.target);
            const isComplete = percentage >= 100;

            return (
              <div key={goal.key} className="goal-item">
                <div className="goal-header">
                  <span className="goal-icon">{goal.icon}</span>
                  <span className="goal-label">{goal.label}</span>
                  {isComplete && <span className="goal-check">✅</span>}
                </div>
                <div className="goal-progress">
                  <div 
                    className="goal-progress-fill" 
                    style={{ 
                      width: `${percentage}%`,
                      background: goal.color 
                    }}
                  ></div>
                </div>
                <div className="goal-stats">
                  <span className="goal-current">{data.current.toLocaleString()}</span>
                  <span className="goal-separator">/</span>
                  <span className="goal-target">{data.target.toLocaleString()} {data.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="goals-info">
          <p>💡 Complete all goals to earn bonus XP!</p>
        </div>
      </div>
    </div>
  );
}
