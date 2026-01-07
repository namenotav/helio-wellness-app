// Weekly Comparison Component - Compare Week 1 vs Week 2 vs Week 3 vs Week 4
import { useState, useEffect } from 'react';
import './WeeklyComparison.css';

export default function WeeklyComparison({ onClose }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      // Get step history from localStorage
      const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      
      // Get current month's data
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      const monthSteps = stepHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      });
      
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
      
      // Get workout history
      const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const monthWorkouts = workoutHistory.filter(w => {
        const workoutDate = new Date(w.date);
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
    if (!previousWeek || previousWeek[metric] === 0) return '➡️';
    const current = currentWeek[metric];
    const previous = previousWeek[metric];
    if (current > previous) return '📈';
    if (current < previous) return '📉';
    return '➡️';
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
                    <span className="trend-icon">{getTrendIcon(week, previousWeek, 'totalSteps')}</span>
                  </div>
                  
                  <div className="week-stat">
                    <span className="stat-icon">💪</span>
                    <div className="stat-info">
                      <div className="stat-value">{week.totalWorkouts}</div>
                      <div className="stat-label">Workouts</div>
                      <div className="stat-sublabel">{week.totalWorkoutMinutes} minutes</div>
                    </div>
                    <span className="trend-icon">{getTrendIcon(week, previousWeek, 'totalWorkouts')}</span>
                  </div>
                  
                  <div className="week-stat">
                    <span className="stat-icon">📅</span>
                    <div className="stat-info">
                      <div className="stat-value">{week.activeDays}/7</div>
                      <div className="stat-label">Active Days</div>
                      <div className="stat-sublabel">{Math.round((week.activeDays / 7) * 100)}% consistent</div>
                    </div>
                    <span className="trend-icon">{getTrendIcon(week, previousWeek, 'activeDays')}</span>
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
