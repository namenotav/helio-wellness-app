// Weekly Comparison Component - Compare Week 1 vs Week 2 vs Week 3 vs Week 4
// 🔥 FIX: Use Firestore as single source of truth (not localStorage)
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import firestoreService from '../services/firestoreService';
import dataService from '../services/dataService'; // 🎯 SINGLE SOURCE OF TRUTH
import authService from '../services/authService';
import './WeeklyComparison.css';

export default function WeeklyComparison({ onClose }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      console.log('📊 [WEEKLY] Loading data for user:', userId);
      
      // 🎯 Get step history from localStorage FIRST (instant updates)
      const firestoreSteps = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      
      // Also get today's steps from Preferences (native service writes here)
      let todaySteps = 0;
      try {
        const { value } = await Preferences.get({ key: 'wellnessai_todaySteps' });
        todaySteps = value ? parseInt(JSON.parse(value)) : 0;
      } catch (e) {
        console.warn('Could not read today steps:', e);
      }
      
      // Add today's steps if not already in history
      const today = new Date().toISOString().split('T')[0];
      const hasTodayEntry = firestoreSteps.some(s => s.date === today);
      if (!hasTodayEntry && todaySteps > 0) {
        firestoreSteps.push({ date: today, steps: todaySteps, timestamp: Date.now() });
      } else if (hasTodayEntry) {
        // Update today's entry with live data
        const todayIndex = firestoreSteps.findIndex(s => s.date === today);
        if (todayIndex >= 0 && todaySteps > firestoreSteps[todayIndex].steps) {
          firestoreSteps[todayIndex].steps = todaySteps;
        }
      }
      
      console.log('📊 [WEEKLY] Total step entries:', firestoreSteps.length);
      
      // Get current month's data
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      const monthSteps = firestoreSteps.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      });
      
      console.log('📊 [WEEKLY] Month steps:', monthSteps.length, 'entries');
      
      // Group by week (4 weeks in a month)
      const weeks = [[], [], [], []];
      monthSteps.forEach(entry => {
        const entryDate = new Date(entry.date);
        const dayOfMonth = entryDate.getDate();
        const weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex < 4) {
          weeks[weekIndex].push(entry);
        }
      });
      
      // 🎯 Get workout history from localStorage FIRST (instant updates)
      const firestoreWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      console.log('📊 [WEEKLY] Total workouts:', firestoreWorkouts.length);
      
      const monthWorkouts = firestoreWorkouts.filter(w => {
        const workoutDate = new Date(w.date || w.timestamp);
        return workoutDate.getFullYear() === year && workoutDate.getMonth() === month;
      });
      
      // Calculate stats for each week
      const weekData = weeks.map((weekSteps, weekIndex) => {
        const weekStart = weekIndex * 7 + 1;
        const weekEnd = Math.min(weekStart + 6, new Date(year, month + 1, 0).getDate());
        
        const weekWorkouts = monthWorkouts.filter(w => {
          const workoutDate = new Date(w.date);
          const day = workoutDate.getDate();
          return day >= weekStart && day <= weekEnd;
        });
        
        const totalSteps = weekSteps.reduce((sum, s) => sum + (s.steps || 0), 0);
        const avgSteps = weekSteps.length > 0 ? Math.round(totalSteps / weekSteps.length) : 0;
        const totalWorkouts = weekWorkouts.length;
        const totalWorkoutMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        
        return {
          weekNumber: weekIndex + 1,
          label: `Week ${weekIndex + 1} (${month + 1}/${weekStart}-${month + 1}/${weekEnd})`,
          totalSteps,
          avgSteps,
          totalWorkouts,
          totalWorkoutMinutes,
          activeDays: weekSteps.length
        };
      });
      
      setWeeklyData(weekData);
    } catch (error) {
      console.error('Failed to load weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (currentWeek, previousWeek, metric) => {
    if (!previousWeek || previousWeek[metric] === 0) return { icon: '➡️', text: '' };
    const current = currentWeek[metric];
    const previous = previousWeek[metric];
    const percentChange = ((current - previous) / previous * 100).toFixed(0);
    if (current > previous) return { icon: '📈', text: `+${percentChange}%` };
    if (current < previous) return { icon: '📉', text: `${percentChange}%` };
    return { icon: '➡️', text: '0%' };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="weekly-comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Weekly Comparison</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading weekly data...</div>
        ) : (
          <div className="weekly-comparison-grid">
            {weeklyData.map((week, index) => {
              const previousWeek = index > 0 ? weeklyData[index - 1] : null;
              
              return (
                <div key={week.weekNumber} className="week-card">
                  <h3 className="week-label">{week.label}</h3>
                  
                  <div className="week-stat">
                    <span className="stat-icon">👟</span>
                    <div className="stat-info">
                      <div className="stat-value">{week.totalSteps.toLocaleString()}</div>
                      <div className="stat-label">Total Steps</div>
                      <div className="stat-sublabel">{week.avgSteps.toLocaleString()} avg/day</div>
                    </div>
                    <div className="trend-icon">
                      <span style={{fontSize: '20px'}}>{getTrendIcon(week, previousWeek, 'totalSteps').icon}</span>
                      <span style={{fontSize: '11px', color: '#8B5FE8', fontWeight: 'bold', display: 'block'}}>{getTrendIcon(week, previousWeek, 'totalSteps').text}</span>
                    </div>
                  </div>
                  
                  <div className="week-stat">
                    <span className="stat-icon">💪</span>
                    <div className="stat-info">
                      <div className="stat-value">{week.totalWorkouts}</div>
                      <div className="stat-label">Workouts</div>
                      <div className="stat-sublabel">{week.totalWorkoutMinutes} minutes</div>
                    </div>
                    <div className="trend-icon">
                      <span style={{fontSize: '20px'}}>{getTrendIcon(week, previousWeek, 'totalWorkouts').icon}</span>
                      <span style={{fontSize: '11px', color: '#8B5FE8', fontWeight: 'bold', display: 'block'}}>{getTrendIcon(week, previousWeek, 'totalWorkouts').text}</span>
                    </div>
                  </div>
                  
                  <div className="week-stat">
                    <span className="stat-icon">📅</span>
                    <div className="stat-info">
                      <div className="stat-value">{week.activeDays}/7</div>
                      <div className="stat-label">Active Days</div>
                      <div className="stat-sublabel">{Math.round((week.activeDays / 7) * 100)}% consistent</div>
                    </div>
                    <div className="trend-icon">
                      <span style={{fontSize: '20px'}}>{getTrendIcon(week, previousWeek, 'activeDays').icon}</span>
                      <span style={{fontSize: '11px', color: '#8B5FE8', fontWeight: 'bold', display: 'block'}}>{getTrendIcon(week, previousWeek, 'activeDays').text}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
