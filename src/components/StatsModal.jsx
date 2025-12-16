// Quick Stats Modal - Shows 5-7 key metrics
import { useState, useEffect } from 'react';
import './StatsModal.css';
import gamificationService from '../services/gamificationService';
import nativeHealthService from '../services/nativeHealthService';
import authService from '../services/authService';
import { Preferences } from '@capacitor/preferences';

export default function StatsModal({ isOpen, onClose, todaySteps = 0 }) {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    totalSteps: 0,
    todaySteps: 0,
    avgSleepHours: 0,
    mealsLogged: 0,
    currentWeight: 0,
    totalXP: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadStats();
      // 🔥 FIX: Add live polling for real-time updates
      const interval = setInterval(loadStats, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      // Fix: Use correct gamificationService methods
      const levelInfo = gamificationService.getLevelInfo();
      const streakInfo = gamificationService.getStreakInfo();
      const healthData = JSON.parse(localStorage.getItem('health_data') || '{}');
      const workoutLog = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const mealLog = JSON.parse(localStorage.getItem('foodLog') || '[]');

      // 🔥 Use live step data from parent (already handles negative sensors)
      let liveSteps = todaySteps; // Parent (NewDashboard) already calculated correctly
      
      // Calculate TOTAL STEPS from stepHistory array (same as HealthAvatar)
      const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      const totalSteps = Array.isArray(stepHistory) 
        ? stepHistory.reduce((sum, day) => sum + (Number(day?.steps) || 0), 0) 
        : 0;

      // Calculate ALL TIME CALORIES from ALL steps + ALL workouts
      const today = new Date().toISOString().split('T')[0];
      const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      
      // ALL TIME STEP CALORIES
      const allTimeStepCalories = Math.round(totalSteps * 0.04);
      
      // ALL TIME WORKOUT CALORIES
      const calorieRateMap = {
        'Running': 11, 'Cycling': 10, 'Swimming': 12, 'Weights': 7,
        'Yoga': 3, 'HIIT': 13, 'Walking': 5, 'Sports': 9, 'Other': 7
      };
      
      let allTimeWorkoutCalories = 0;
      workoutHistory.forEach(workout => {
        const type = workout.type || workout.activity || 'Other';
        const rate = calorieRateMap[type] || 7;
        allTimeWorkoutCalories += (workout.duration || 0) * rate;
      });
      
      const totalCalories = allTimeStepCalories + allTimeWorkoutCalories;

      // Calculate AVG SLEEP from sleepLog array
      const sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]');
      const totalSleep = Array.isArray(sleepLog) 
        ? sleepLog.reduce((sum, night) => sum + (Number(night?.hours) || Number(night?.duration) || 0), 0) 
        : 0;
      const avgSleep = sleepLog.length > 0 ? totalSleep / sleepLog.length : 0;

      setStats({
        totalWorkouts: workoutLog.length,
        totalCaloriesBurned: totalCalories,
        totalSteps: totalSteps,
        todaySteps: liveSteps,
        avgSleepHours: avgSleep,
        mealsLogged: mealLog.length,
        currentWeight: authService.getCurrentUser()?.profile?.weight || 0,
        totalXP: levelInfo.totalXP || 0
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load stats:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Quick Stats</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">💪</span>
            <div className="stat-info">
              <span className="stat-value">{stats.totalWorkouts}</span>
              <span className="stat-label">Workouts</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <span className="stat-value">{stats.totalCaloriesBurned.toLocaleString()}</span>
              <span className="stat-label">Total Calories</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">👟</span>
            <div className="stat-info">
              <span className="stat-value">{stats.todaySteps.toLocaleString()}</span>
              <span className="stat-label">Steps Today</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <span className="stat-value">{(stats.totalSteps / 1000).toFixed(1)}K</span>
              <span className="stat-label">Total Steps</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">😴</span>
            <div className="stat-info">
              <span className="stat-value">{stats.avgSleepHours.toFixed(1)}h</span>
              <span className="stat-label">Avg Sleep</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🍽️</span>
            <div className="stat-info">
              <span className="stat-value">{stats.mealsLogged}</span>
              <span className="stat-label">Meals Logged</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">⚖️</span>
            <div className="stat-info">
              <span className="stat-value">{stats.currentWeight}kg</span>
              <span className="stat-label">Current Weight</span>
            </div>
          </div>

          <div className="stat-item highlight">
            <span className="stat-icon">⭐</span>
            <div className="stat-info">
              <span className="stat-value">{stats.totalXP.toLocaleString()}</span>
              <span className="stat-label">Total XP Earned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
