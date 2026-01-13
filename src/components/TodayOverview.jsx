// Today Overview Component - Top summary with streak, level, and activity rings
import { useState, useEffect } from 'react';
import './TodayOverview.css';
import gamificationService from '../services/gamificationService';
import nativeHealthService from '../services/nativeHealthService';
import authService from '../services/authService';
import { useDashboard } from '../context/DashboardContext';
import { Preferences } from '@capacitor/preferences';

export default function TodayOverview({ todaySteps = 0 }) {
  console.log('🎨 [TodayOverview] Component mounted/updated - todaySteps prop:', todaySteps);
  
  // 🔥 FIX: Get data from DashboardContext (same source as everywhere else!)
  const { waterCups, workoutsToday, sleepHours } = useDashboard();
  
  const [stats, setStats] = useState({
    streak: 0,
    level: 1,
    xp: 0,
    xpToNext: 1000,
    steps: 0,
    stepsGoal: 10000,
    calories: 0,
    caloriesGoal: 2000,
    activeMinutes: 0,
    activeMinutesGoal: 60,
    waterCups: 0,
    waterGoal: 8,
    sleepHours: 0,
    sleepGoal: 8,
    workoutMinutes: 0,
    workoutGoal: 30
  });

  useEffect(() => {
    console.log('🔄 [TodayOverview] useEffect triggered - todaySteps changed to:', todaySteps);
    loadStats();
    // 🔥 FIX: Add live polling for real-time updates (30s for battery)
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [todaySteps]); // Re-run when prop changes

  const loadStats = async () => {
    console.log('🚀 [TodayOverview] loadStats() EXECUTING - todaySteps:', todaySteps);
    try {
      // Get gamification data using correct methods
      console.log('📊 [TodayOverview] Getting gamification data...');
      const levelInfo = gamificationService.getLevelInfo();
      const streakInfo = gamificationService.getStreakInfo();
      console.log('📊 [TodayOverview] Level info:', levelInfo);
      console.log('📊 [TodayOverview] Streak info:', streakInfo);
      
      // 🔥 ALWAYS use prop from parent (NewDashboard already calculated it correctly)
      let liveSteps = todaySteps;
      console.log('👟 [TodayOverview] Received todaySteps prop:', todaySteps, '→ Setting steps to:', liveSteps);

      // 🔥 FIX: Use Context data directly (SAME SOURCE as all modals!)
      console.log('💧 [TodayOverview] Water from Context:', waterCups, 'cups');
      console.log('😴 [TodayOverview] Sleep from Context:', sleepHours, 'hours');
      console.log('💪 [TodayOverview] Workouts from Context:', workoutsToday?.length || 0, 'workouts');
      
      const workoutMinutes = workoutsToday?.reduce((sum, w) => sum + (w.duration || 0), 0) || 0;

      // 🔥 Calculate calories from steps (0.04 cal per step)
      const stepCalories = Math.round(liveSteps * 0.04);
      
      // 🔥 FIX #9: Calculate calories from workouts based on type AND user weight
      const userProfile = authService.getCurrentUser()?.profile || {};
      const userWeight = userProfile.weight || 150; // Default 150 lbs if not set
      const weightFactor = userWeight / 150; // Personalization factor
      
      const calorieRateMap = {
        'Running': 11, 'Cycling': 10, 'Swimming': 12, 'Weights': 7,
        'Yoga': 3, 'HIIT': 13, 'Walking': 5, 'Sports': 9, 'Other': 7
      };
      
      let workoutCalories = 0;
      workoutsToday.forEach(workout => {
        const type = workout.type || workout.activity || 'Other';
        const rate = calorieRateMap[type] || 7;
        // 🔥 Multiply by weight factor for personalized calorie burn
        workoutCalories += Math.round((workout.duration || 0) * rate * weightFactor);
      });
      console.log('⚖️ [TodayOverview] User weight:', userWeight, 'lbs, Weight factor:', weightFactor.toFixed(2));
      
      const totalCaloriesBurned = stepCalories + workoutCalories;
      console.log('🔥 [TodayOverview] Calories - Steps:', stepCalories, 'Workouts:', workoutCalories, 'Total Burned:', totalCaloriesBurned);
      
      // 🔥 FIX #7: Calculate net calories (consumed - burned)
      const today = new Date().toISOString().split('T')[0];
      const foodLog = authService.getCurrentUser()?.profile?.foodLog || [];
      const foodToday = foodLog.filter(f => {
        const foodDate = new Date(f.timestamp);
        return foodDate.toISOString().split('T')[0] === today;
      });
      const caloriesConsumed = foodToday.reduce((sum, f) => sum + (f.calories || 0), 0);
      const netCalories = caloriesConsumed - totalCaloriesBurned;
      console.log('🍽️ [TodayOverview] Net Calories: Consumed', caloriesConsumed, '- Burned', totalCaloriesBurned, '= Net', netCalories);
      
      setStats({
        streak: streakInfo.streak || 0,
        level: levelInfo.level || 1,
        xp: levelInfo.xp || 0,
        xpToNext: levelInfo.xpToNext || 1000,
        steps: liveSteps,
        stepsGoal: 10000,
        calories: totalCaloriesBurned,
        caloriesGoal: 2000,
        caloriesConsumed: caloriesConsumed,
        netCalories: netCalories,
        activeMinutes: workoutMinutes,
        activeMinutesGoal: 60,
        waterCups: waterCups,
        waterGoal: 8,
        sleepHours: sleepHours,
        sleepGoal: 8,
        workoutMinutes: workoutMinutes,
        workoutGoal: 30
      });
      console.log('✅ [TodayOverview] Stats updated - steps:', liveSteps, 'water:', waterCups, 'sleep:', sleepHours, 'workout:', workoutMinutes);
    } catch (error) {
      console.error('❌ [TodayOverview] loadStats() FAILED:', error);
      console.error('❌ [TodayOverview] Error stack:', error.stack);
    }
  };

  const getPercentage = (current, goal) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <div className="today-overview">
      {/* Streak and Level */}
      <div className="overview-header">
        <div className="streak-badge">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">{stats.streak} DAY STREAK</span>
        </div>
        <div className="level-badge">
          <span className="level-text">Level {stats.level}</span>
          <span className="level-icon">⭐</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="xp-progress">
        <div className="xp-text">
          <span>{stats.xp.toLocaleString()} XP</span>
          <span className="xp-goal">/ {stats.xpToNext.toLocaleString()} to Level {stats.level + 1}</span>
        </div>
        <div className="xp-bar">
          <div 
            className="xp-fill" 
            style={{ width: `${getPercentage(stats.xp, stats.xpToNext)}%` }}
          ></div>
        </div>
      </div>

      {/* Activity Rings */}
      <div className="activity-rings">
        <svg viewBox="0 0 200 200" className="rings-svg">
          {/* Move Ring (Red/Pink) */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#333"
            strokeWidth="12"
            opacity="0.2"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="url(#moveGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80 * (getPercentage(stats.steps, stats.stepsGoal) / 100)} ${2 * Math.PI * 80}`}
            transform="rotate(-90 100 100)"
            className="ring-animated"
          />

          {/* Exercise Ring (Green) */}
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="#333"
            strokeWidth="12"
            opacity="0.2"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="url(#exerciseGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 60 * (getPercentage(stats.activeMinutes, stats.activeMinutesGoal) / 100)} ${2 * Math.PI * 60}`}
            transform="rotate(-90 100 100)"
            className="ring-animated"
          />

          {/* Stand Ring (Blue) */}
          <circle
            cx="100"
            cy="100"
            r="40"
            fill="none"
            stroke="#333"
            strokeWidth="12"
            opacity="0.2"
          />
          <circle
            cx="100"
            cy="100"
            r="40"
            fill="none"
            stroke="url(#caloriesGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40 * (getPercentage(stats.calories, stats.caloriesGoal) / 100)} ${2 * Math.PI * 40}`}
            transform="rotate(-90 100 100)"
            className="ring-animated"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="moveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff006e" />
              <stop offset="100%" stopColor="#ff4d94" />
            </linearGradient>
            <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5a0" />
              <stop offset="100%" stopColor="#00d9f5" />
            </linearGradient>
            <linearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4cc9f0" />
              <stop offset="100%" stopColor="#4361ee" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ring Labels */}
        <div className="ring-labels">
          <div className="ring-label move">
            <span className="label-icon">👟</span>
            <span className="label-text">{stats.steps.toLocaleString()}/{(stats.stepsGoal/1000).toFixed(0)}K</span>
          </div>
          <div className="ring-label exercise">
            <span className="label-icon">💪</span>
            <span className="label-text">{stats.activeMinutes}/{stats.activeMinutesGoal}min</span>
          </div>
          <div className="ring-label calories">
            <span className="label-icon">🔥</span>
            <span className="label-text">{stats.calories}/{stats.caloriesGoal}cal</span>
          </div>
        </div>
      </div>

      {/* 🔥 FIX #7: Net Calories Display */}
      {stats.netCalories !== undefined && (
        <div style={{
          margin: '16px 4px 8px 4px',
          background: stats.netCalories < 0 
            ? 'linear-gradient(135deg, #4CAF50 0%, #45B049 100%)' 
            : 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          borderRadius: '15px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: stats.netCalories < 0
            ? '0 4px 15px rgba(76, 175, 80, 0.4)'
            : '0 4px 15px rgba(255, 152, 0, 0.4)'
        }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
            {stats.netCalories < 0 ? '📉 Calorie Deficit' : '📈 Calorie Surplus'}
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
            {stats.netCalories > 0 ? '+' : ''}{stats.netCalories.toLocaleString()} cal
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
            Consumed: {stats.caloriesConsumed} | Burned: {stats.calories}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', fontStyle: 'italic' }}>
            {stats.netCalories < 0 
              ? '✅ Great for weight loss!' 
              : '⚠️ Eating more than burning'}
          </div>
        </div>
      )}

      {/* Quick Log Stats - Water/Sleep/Workout */}
      <div className="quick-log-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: '16px',
        padding: '0 4px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💧</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {stats.waterCups}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', marginTop: '2px' }}>
            /{stats.waterGoal} cups
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>😴</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {stats.sleepHours.toFixed(1)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', marginTop: '2px' }}>
            /{stats.sleepGoal}h
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(250, 112, 154, 0.3)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🏋️</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {stats.workoutMinutes}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', marginTop: '2px' }}>
            /{stats.workoutGoal}min
          </div>
        </div>
      </div>
    </div>
  );
}
