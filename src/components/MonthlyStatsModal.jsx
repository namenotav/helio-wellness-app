// Monthly Stats Modal - Show 30-day totals and trends
import { useState, useEffect } from 'react';
import './MonthlyStatsModal.css';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';

export default function MonthlyStatsModal({ onClose }) {
  console.log('🎬 [MONTHLY STATS] MODAL COMPONENT MOUNTED!');
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState({
    totalSteps: 0,
    avgStepsPerDay: 0,
    totalWorkouts: 0,
    totalWorkoutMinutes: 0,
    totalCaloriesConsumed: 0,
    totalCaloriesBurned: 0,
    netCalories: 0,
    totalWaterCups: 0,
    totalMeditationMinutes: 0,
    longestStreak: 0,
    activeDays: 0,
    weightChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    console.log('⚡ [MONTHLY STATS] useEffect triggered! selectedMonth:', selectedMonth);
    loadMonthlyData();
  }, [selectedMonth]);

  const loadMonthlyData = async () => {
    console.log('🚀 [MONTHLY STATS] loadMonthlyData() called');
    setLoading(true);
    try {
      // Get user ID from localStorage or use device ID (same as firestoreService)
      const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = userProfile.uid || userProfile.id || 'local_user';
      console.log('👤 [MONTHLY STATS] User ID:', userId);
      if (!userId || userId === 'local_user') {
        console.log('⚠️ [MONTHLY STATS] No Firebase user, using localStorage data only');
      }

      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      
      console.log(`📅 Loading Monthly Stats for ${year}-${month + 1} (month index=${month})...`);
      
      // Get all step history from localStorage and Firestore
      const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      const firestoreStepHistory = await firestoreService.get('stepHistory', userId) || [];
      
      console.log(`📊 Step data sources: localStorage=${stepHistory.length}, Firestore=${firestoreStepHistory.length}`);
      if (stepHistory.length > 0) {
        console.log(`   Sample localStorage step entry:`, stepHistory[0]);
      }
      if (firestoreStepHistory.length > 0) {
        console.log(`   Sample Firestore step entry:`, firestoreStepHistory[0]);
      }
      
      // Merge both sources (dedup by date)
      const allSteps = [...stepHistory, ...firestoreStepHistory];
      const uniqueSteps = Array.from(
        new Map(allSteps.map(item => [item.date, item])).values()
      );
      
      // Filter by selected month
      const monthSteps = uniqueSteps.filter(entry => {
        const entryDate = new Date(entry.date);
        const matches = entryDate.getFullYear() === year && entryDate.getMonth() === month;
        return matches;
      });
      
      console.log(`🔍 Filtered ${uniqueSteps.length} step entries to ${monthSteps.length} for ${year}-${month + 1}`);
      if (uniqueSteps.length > 0 && monthSteps.length === 0) {
        console.warn(`⚠️ NO STEPS MATCHED! Checking dates...`);
        uniqueSteps.slice(0, 5).forEach(entry => {
          const d = new Date(entry.date);
          console.log(`   Entry date: ${entry.date} → Year: ${d.getFullYear()}, Month: ${d.getMonth()} (looking for Year: ${year}, Month: ${month})`);
        });
      }
      
      const totalSteps = monthSteps.reduce((sum, entry) => sum + (entry.steps || 0), 0);
      const avgSteps = monthSteps.length > 0 ? Math.round(totalSteps / monthSteps.length) : 0;
      
      console.log(`🚶 Monthly Steps: ${totalSteps} total, ${monthSteps.length} days, ${avgSteps} avg/day`);
      
      // Get workout history from both localStorage and Firestore
      const localWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const firestoreWorkouts = await firestoreService.get('workoutHistory', userId) || [];
      const allWorkouts = [...localWorkouts, ...firestoreWorkouts];
      const uniqueWorkouts = Array.from(
        new Map(allWorkouts.map(item => [item.timestamp || item.date, item])).values()
      );
      
      const monthWorkouts = uniqueWorkouts.filter(w => {
        const workoutDate = new Date(w.date || w.timestamp);
        return workoutDate.getFullYear() === year && workoutDate.getMonth() === month;
      });
      
      const totalWorkouts = monthWorkouts.length;
      const totalWorkoutMinutes = monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      
      console.log(`💪 Monthly Workouts: ${totalWorkouts} total, ${totalWorkoutMinutes} minutes`);
      console.log(`📊 Data sources: localStorage=${localWorkouts.length}, Firestore=${firestoreWorkouts.length}, Merged=${uniqueWorkouts.length}`);
      
      // Get food log from user profile (same as home screen) + Preferences backup
      const userFoodLog = authService.getCurrentUser()?.profile?.foodLog || [];
      // ALSO check Preferences as backup (where food is actually saved)
      let preferencesFoodLog = [];
      try {
        const { value: foodLogJson } = await import('@capacitor/preferences').then(m => m.Preferences.get({ key: 'foodLog' }));
        preferencesFoodLog = foodLogJson ? JSON.parse(foodLogJson) : [];
      } catch (err) {
        console.warn('Could not read foodLog from Preferences:', err);
      }
      
      // Get food log from Firestore
      let firestoreFoodLog = [];
      try {
        firestoreFoodLog = await firestoreService.get('foodLog') || [];
        console.log(`🔥 Firestore food log: ${firestoreFoodLog.length} items`);
      } catch (err) {
        console.warn('Could not read foodLog from Firestore:', err);
      }
      
      const localFoodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
      const allFood = [...userFoodLog, ...preferencesFoodLog, ...firestoreFoodLog, ...localFoodLog];
      const uniqueFood = Array.from(
        new Map(allFood.map(item => [item.timestamp || item.id, item])).values()
      );
      
      console.log(`🍽️ Food data sources: userProfile=${userFoodLog.length}, Preferences=${preferencesFoodLog.length}, localStorage=${localFoodLog.length}, Merged=${uniqueFood.length}`);
      
      const monthFood = uniqueFood.filter(f => {
        const foodDate = new Date(f.timestamp || f.date);
        return foodDate.getFullYear() === year && foodDate.getMonth() === month;
      });
      
      const totalCaloriesConsumed = monthFood.reduce((sum, f) => sum + (f.calories || 0), 0);
      
      console.log(`🍽️ Monthly Food: ${totalCaloriesConsumed} calories from ${monthFood.length} meals`);
      console.log(`📊 Data sources: localStorage=${localFoodLog.length}, Firestore=${firestoreFoodLog.length}, Merged=${uniqueFood.length}`);
      
      // Calculate calories burned (steps + workouts)
      const stepCalories = totalSteps * 0.04;
      const calorieRateMap = {
        'Running': 11, 'Cycling': 10, 'Swimming': 12, 'Weights': 7,
        'Yoga': 3, 'HIIT': 13, 'Walking': 5, 'Sports': 9, 'Other': 7
      };
      
      let workoutCalories = 0;
      monthWorkouts.forEach(workout => {
        const type = workout.type || workout.activity || 'Other';
        const rate = calorieRateMap[type] || 7;
        workoutCalories += (workout.duration || 0) * rate;
      });
      
      const totalCaloriesBurned = Math.round(stepCalories + workoutCalories);
      const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
      
      // Get water log from both localStorage and Firestore
      const localWaterLog = JSON.parse(localStorage.getItem('waterLog') || '[]');
      const firestoreWaterLog = await firestoreService.get('waterLog', userId) || [];
      const allWater = [...localWaterLog, ...firestoreWaterLog];
      const uniqueWater = Array.from(
        new Map(allWater.map(item => [`${item.date}-${item.timestamp}`, item])).values()
      );
      
      const monthWater = uniqueWater.filter(w => {
        const waterDate = new Date(w.date || w.timestamp);
        return waterDate.getFullYear() === year && waterDate.getMonth() === month;
      });
      
      const totalWaterCups = monthWater.reduce((sum, w) => sum + (w.cups || 1), 0);
      
      console.log(`💧 Monthly Water: ${totalWaterCups} cups from ${monthWater.length} entries`);
      console.log(`📊 Data sources: localStorage=${localWaterLog.length}, Firestore=${firestoreWaterLog.length}, Merged=${uniqueWater.length}`);
      
      // Get meditation data
      const meditationMinutes = parseInt(localStorage.getItem('meditation_sessions_total') || '0');
      
      // Calculate active days
      const activeDays = monthSteps.length;
      
      // Get available months (from step history)
      const months = uniqueSteps.map(s => {
        const d = new Date(s.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      });
      const uniqueMonths = [...new Set(months)].sort().reverse();
      setAvailableMonths(uniqueMonths);
      
      setMonthlyStats({
        totalSteps,
        avgStepsPerDay: avgSteps,
        totalWorkouts,
        totalWorkoutMinutes,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        netCalories,
        totalWaterCups,
        totalMeditationMinutes: meditationMinutes,
        longestStreak: 0, // TODO: Calculate from streak history
        activeDays,
        weightChange: 0 // TODO: Calculate from weight log
      });
      
    } catch (error) {
      console.error('❌ [MONTHLY STATS] Failed to load monthly stats:', error);
      console.error('Stack:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="monthly-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Monthly Summary</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="month-selector">
          <button onClick={() => changeMonth(-1)} className="month-nav-btn">◀</button>
          <h3>{formatMonthYear(selectedMonth)}</h3>
          <button 
            onClick={() => changeMonth(1)} 
            className="month-nav-btn"
            disabled={selectedMonth.getMonth() === new Date().getMonth()}
          >▶</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading monthly data...</div>
        ) : (
          <div className="monthly-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👟</div>
              <div className="stat-value">{monthlyStats.totalSteps.toLocaleString()}</div>
              <div className="stat-label">Total Steps</div>
              <div className="stat-sublabel">{monthlyStats.avgStepsPerDay.toLocaleString()} avg/day</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-value">{monthlyStats.totalWorkouts}</div>
              <div className="stat-label">Workouts</div>
              <div className="stat-sublabel">{monthlyStats.totalWorkoutMinutes} minutes</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🍽️</div>
              <div className="stat-value">{monthlyStats.totalCaloriesConsumed.toLocaleString()}</div>
              <div className="stat-label">Calories Consumed</div>
              <div className="stat-sublabel">{Math.round(monthlyStats.totalCaloriesConsumed / 30)} avg/day</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{monthlyStats.totalCaloriesBurned.toLocaleString()}</div>
              <div className="stat-label">Calories Burned</div>
              <div className="stat-sublabel">{Math.round(monthlyStats.totalCaloriesBurned / 30)} avg/day</div>
            </div>
            
            <div className={`stat-card ${monthlyStats.netCalories < 0 ? 'deficit' : 'surplus'}`}>
              <div className="stat-icon">{monthlyStats.netCalories < 0 ? '📉' : '📈'}</div>
              <div className="stat-value">{monthlyStats.netCalories > 0 ? '+' : ''}{monthlyStats.netCalories.toLocaleString()}</div>
              <div className="stat-label">Net Calories</div>
              <div className="stat-sublabel">
                {monthlyStats.netCalories < 0 ? 'Deficit (Great!)' : 'Surplus'}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💧</div>
              <div className="stat-value">{monthlyStats.totalWaterCups}</div>
              <div className="stat-label">Cups of Water</div>
              <div className="stat-sublabel">{(monthlyStats.totalWaterCups / 30).toFixed(1)} avg/day</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🧘</div>
              <div className="stat-value">{monthlyStats.totalMeditationMinutes}</div>
              <div className="stat-label">Meditation Minutes</div>
              <div className="stat-sublabel">{monthlyStats.activeDays} active days</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{monthlyStats.activeDays}</div>
              <div className="stat-label">Active Days</div>
              <div className="stat-sublabel">{Math.round((monthlyStats.activeDays / 30) * 100)}% consistency</div>
            </div>
          </div>
        )}
        
        <div className="month-selector-dropdown">
          <select 
            value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-');
              setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1));
            }}
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
