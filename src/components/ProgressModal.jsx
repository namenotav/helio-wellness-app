// Progress History Quick View Modal
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import './ProgressModal.css';

export default function ProgressModal({ isOpen, onClose, todaySteps = 0 }) {
  const [progressData, setProgressData] = useState({
    weeklySteps: [],
    weeklyWorkouts: 0,
    weeklyCalories: 0,
    totalActiveDays: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadProgressData();
    }
  }, [isOpen]);

  const loadProgressData = async () => {
    try {
      // 🎯 SINGLE SOURCE OF TRUTH: Use Firestore only
      const { default: firestoreService } = await import('../services/firestoreService.js');
      const { default: authService } = await import('../services/authService.js');
      const userId = authService.getCurrentUser()?.uid;
      
      // 🔥 WORKOUTS: Read from Firestore
      const workoutLog = await firestoreService.get('workoutHistory', userId) || [];
      
      // 🔥 STEP HISTORY: Read from Firestore (single source)
      const stepHistoryRaw = await firestoreService.get('stepHistory', userId) || [];
      console.log('📈 Progress Modal loaded from Firestore:', stepHistoryRaw?.length, 'entries');
      
      // Parse step history array
      const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : [];
      
      // 🔄 WEEKLY RESET: Get current week only (Monday - Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, 6=Saturday
      
      // Calculate Monday of current week
      // If today is Sunday (0), go back 6 days. Otherwise go back (dayOfWeek - 1) days
      const monday = new Date(today);
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      monday.setDate(today.getDate() - daysToMonday);
      monday.setHours(0, 0, 0, 0);
      
      // Generate 7 days from Monday to Sunday
      const currentWeek = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday); // Clone monday date
        date.setDate(monday.getDate() + i); // Add i days to Monday's day-of-month
        const dateStr = date.toISOString().split('T')[0];
        
        // Find matching date in step history array
        const dayData = stepHistory.find(entry => entry.date === dateStr);
        currentWeek.push({
          date: dateStr,
          steps: dayData ? dayData.steps : 0
        });
      }
      
      console.log('📊 Progress Modal: Current week data (Sun-Sat):', currentWeek);

      // Count workouts in last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentWorkouts = workoutLog.filter(w => new Date(w.date) >= weekAgo).length;

      // 🔥 Calculate calories from steps + workouts
      const calorieRateMap = {
        'Running': 11, 'Cycling': 10, 'Swimming': 12, 'Weights': 7,
        'Yoga': 3, 'HIIT': 13, 'Walking': 5, 'Sports': 9, 'Other': 7
      };
      
      let weeklyStepCalories = 0;
      currentWeek.forEach(day => {
        weeklyStepCalories += Math.round(day.steps * 0.04);
      });
      
      let weeklyWorkoutCalories = 0;
      workoutLog.filter(w => new Date(w.date) >= weekAgo).forEach(workout => {
        const type = workout.type || workout.activity || 'Other';
        const rate = calorieRateMap[type] || 7;
        weeklyWorkoutCalories += (workout.duration || 0) * rate;
      });
      
      const recentCalories = weeklyStepCalories + weeklyWorkoutCalories;
      console.log('📊 [ProgressModal] Weekly Calories - Steps:', weeklyStepCalories, 'Workouts:', weeklyWorkoutCalories, 'Total:', recentCalories);

      // Count active days (days with any activity from step history array)
      const activeDays = stepHistory.filter(entry => entry.steps > 1000).length;

      setProgressData({
        weeklySteps: currentWeek,
        weeklyWorkouts: recentWorkouts,
        weeklyCalories: recentCalories,
        totalActiveDays: activeDays
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load progress:', error);
    }
  };

  if (!isOpen) return null;

  const maxSteps = Math.max(...progressData.weeklySteps.map(d => d.steps), 10000);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="progress-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📈 Progress</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="progress-hero">
          <div className="hero-icon">📊</div>
          <h3>Your Weekly Journey</h3>
          <p>Track your improvements over time</p>
        </div>

        {/* Weekly Summary Cards */}
        <div className="progress-summary">
          <div className="summary-card">
            <span className="summary-icon">👟</span>
            <div className="summary-content">
              <span className="summary-value">
                {(progressData.weeklySteps.reduce((sum, d) => sum + d.steps, 0) / 1000).toFixed(1)}K
              </span>
              <span className="summary-label">Steps This Week</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">💪</span>
            <div className="summary-content">
              <span className="summary-value">{progressData.weeklyWorkouts}</span>
              <span className="summary-label">Weekly Workouts</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🔥</span>
            <div className="summary-content">
              <span className="summary-value">{progressData.weeklyCalories.toLocaleString()}</span>
              <span className="summary-label">Weekly Calories</span>
            </div>
          </div>
        </div>

        {/* Steps Chart */}
        <div className="progress-chart">
          <h4>Steps This Week</h4>
          <div className="chart-bars">
            {progressData.weeklySteps.map((day, index) => {
              const height = (day.steps / maxSteps) * 100;
              const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const dayName = dayLabels[index];
              
              return (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${height}%` }}
                      title={`${day.steps.toLocaleString()} steps`}
                    ></div>
                  </div>
                  <span className="chart-label">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Active Days Badge */}
        <div className="progress-badge">
          <span className="badge-icon">🏆</span>
          <div className="badge-content">
            <span className="badge-number">{progressData.totalActiveDays}</span>
            <span className="badge-text">Total Active Days</span>
          </div>
        </div>

        <div className="progress-info">
          <p>💡 Keep your streak going to unlock achievements!</p>
        </div>
      </div>
    </div>
  );
}
