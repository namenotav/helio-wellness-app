// Monthly Stats Modal - Show 30-day totals and trends
// 🔥 FIX: Use Firestore + Preferences as single source of truth
import { useState, useEffect } from 'react';
import './MonthlyStatsModal.css';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';
import dataService from '../services/dataService'; // 🎯 SINGLE SOURCE OF TRUTH
import { Preferences } from '@capacitor/preferences';
import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const monthDataCache = {};

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
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const cacheKey = `${year}-${month}`;
      
      // Check cache first for faster loading
      if (monthDataCache[cacheKey]) {
        console.log('📦 [CACHE] Loading from cache:', cacheKey);
        setMonthlyStats(monthDataCache[cacheKey]);
        setLoading(false);
        return;
      }
      
      // 🔥 FIX: Get user ID from authService (correct single source of truth)
      const userId = authService.getCurrentUser()?.uid || 'local_user';
      console.log('👤 [MONTHLY STATS] User ID:', userId);
      if (!userId || userId === 'local_user') {
        console.log('⚠️ [MONTHLY STATS] No Firebase user, using localStorage data only');
      }

      console.log(`📅 Loading Monthly Stats for ${year}-${month + 1} (month index=${month})...`);
      
      // 🎯 Get step history from localStorage FIRST (instant updates)
      const firestoreStepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      // Note: localStorage is authoritative for recently-saved data
      
      // 🔥 FIX: Get today's LIVE steps from Preferences (native service writes here)
      let todayLiveSteps = 0;
      const today = new Date().toISOString().split('T')[0];
      try {
        const { value } = await Preferences.get({ key: 'wellnessai_todaySteps' });
        if (value) {
          todayLiveSteps = parseInt(JSON.parse(value)) || 0;
          console.log(`📱 [MONTHLY STATS] Live today steps from Preferences: ${todayLiveSteps}`);
        }
      } catch (e) {
        console.warn('⚠️ Could not read live today steps:', e);
      }
      
      console.log(`📊 Step data sources: Firestore=${firestoreStepHistory.length}, Live today=${todayLiveSteps}`);
      if (firestoreStepHistory.length > 0) {
        console.log(`   Sample Firestore step entry:`, firestoreStepHistory[0]);
      }
      
      // 🔥 FIX: Add today's live steps from native service
      const todayEntry = todayLiveSteps > 0 ? [{
        date: today,
        steps: todayLiveSteps,
        timestamp: Date.now(),
        source: 'preferences_live'
      }] : [];
      
      // Merge Firestore data with today's live steps
      const allSteps = [...firestoreStepHistory, ...todayEntry];
      
      // 🔥 FIX: Dedup by date, keeping entry with HIGHEST step count
      const stepMap = new Map();
      allSteps.forEach(item => {
        const existing = stepMap.get(item.date);
        if (!existing || (item.steps || 0) > (existing.steps || 0)) {
          stepMap.set(item.date, item);
        }
      });
      const uniqueSteps = Array.from(stepMap.values());
      
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
      
      // 🎯 Get workout history from localStorage FIRST (instant updates)
      const firestoreWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const allWorkouts = [...firestoreWorkouts];
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
      console.log(`📊 Data sources: Firestore=${firestoreWorkouts.length}, Merged=${uniqueWorkouts.length}`);
      
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
      
      // Get food log from localStorage FIRST (instant updates)
      let firestoreFoodLog = [];
      try {
        firestoreFoodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
        console.log(`🎯 localStorage food log: ${firestoreFoodLog.length} items`);
      } catch (err) {
        console.warn('Could not read foodLog from localStorage:', err);
      }
      
      // Note: localStorage removed - using Firestore + Preferences as authoritative sources
      const allFood = [...userFoodLog, ...preferencesFoodLog, ...firestoreFoodLog];
      const uniqueFood = Array.from(
        new Map(allFood.map(item => [item.timestamp || item.id, item])).values()
      );
      
      console.log(`🍽️ Food data sources: userProfile=${userFoodLog.length}, Preferences=${preferencesFoodLog.length}, Firestore=${firestoreFoodLog.length}, Merged=${uniqueFood.length}`);
      
      const monthFood = uniqueFood.filter(f => {
        const foodDate = new Date(f.timestamp || f.date);
        return foodDate.getFullYear() === year && foodDate.getMonth() === month;
      });
      
      const totalCaloriesConsumed = monthFood.reduce((sum, f) => sum + (f.calories || 0), 0);
      
      console.log(`🍽️ Monthly Food: ${totalCaloriesConsumed} calories from ${monthFood.length} meals`);
      console.log(`📊 Data sources: Firestore=${firestoreFoodLog.length}, Merged=${uniqueFood.length}`);
      
      // Calculate calories burned (steps + workouts)
      const stepCalories = totalSteps * 0.04;
      const calorieRateMap = {
        'Running': 11, 'Cycling': 10, 'Swimming': 12, 'Weights': 7,
        'Yoga': 3, 'HIIT': 13, 'Walking': 5, 'Sports': 9, 'Other': 7
      };
      
      // 🔥 FIX: Add weight factor for personalized calorie calculation (consistent with TodayOverview)
      const userProfile = authService.getCurrentUser()?.profile || {};
      const userWeight = userProfile.weight || 150; // Default 150 lbs
      const weightFactor = userWeight / 150;
      
      let workoutCalories = 0;
      monthWorkouts.forEach(workout => {
        const type = workout.type || workout.activity || 'Other';
        const rate = calorieRateMap[type] || 7;
        workoutCalories += (workout.duration || 0) * rate * weightFactor;
      });
      
      const totalCaloriesBurned = Math.round(stepCalories + workoutCalories);
      const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
      
      // Get water log from Firestore (single source of truth)
      const firestoreWaterLog = await firestoreService.get('waterLog', userId) || [];
      const allWater = [...firestoreWaterLog];
      const uniqueWater = Array.from(
        new Map(allWater.map(item => [`${item.date}-${item.timestamp}`, item])).values()
      );
      
      const monthWater = uniqueWater.filter(w => {
        const waterDate = new Date(w.date || w.timestamp);
        return waterDate.getFullYear() === year && waterDate.getMonth() === month;
      });
      
      const totalWaterCups = monthWater.reduce((sum, w) => sum + (w.cups || 1), 0);
      
      console.log(`💧 Monthly Water: ${totalWaterCups} cups from ${monthWater.length} entries`);
      console.log(`📊 Data sources: Firestore=${firestoreWaterLog.length}, Merged=${uniqueWater.length}`);
      
      // 🔥 FIX: Get meditation data from localStorage FIRST (instant updates)
      let meditationMinutes = 0;
      try {
        const medStats = JSON.parse(localStorage.getItem('meditation_stats') || '{}');
        meditationMinutes = medStats.totalMinutes || medStats.minutesToday || 0;
      } catch (e) {
        console.error('Error loading meditation stats:', e);
        meditationMinutes = 0;
      }
      
      // Calculate active days
      const activeDays = monthSteps.length;
      
      // Get available months (from step history)
      const months = uniqueSteps.map(s => {
        const d = new Date(s.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      });
      const uniqueMonths = [...new Set(months)].sort().reverse();
      setAvailableMonths(uniqueMonths);
      
      const statsData = {
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
      };
      
      // Cache the data for faster subsequent loads
      monthDataCache[cacheKey] = statsData;
      setMonthlyStats(statsData);
      
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
  
  const exportMonthlyReport = async () => {
    try {
      const doc = new jsPDF();
      const monthYear = formatMonthYear(selectedMonth);
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Title
      doc.setFontSize(20);
      doc.text('Helio Monthly Health Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Period: ${monthYear}`, 20, 30);
      
      // Activity Summary
      doc.setFontSize(14);
      doc.text('Activity Summary', 20, 45);
      doc.setFontSize(11);
      let y = 55;
      doc.text(`Total Steps: ${monthlyStats.totalSteps.toLocaleString()}`, 25, y); y += 7;
      doc.text(`Average Steps/Day: ${monthlyStats.avgStepsPerDay.toLocaleString()}`, 25, y); y += 7;
      doc.text(`Active Days: ${monthlyStats.activeDays}`, 25, y); y += 7;
      doc.text(`Consistency: ${Math.round((monthlyStats.activeDays / 30) * 100)}%`, 25, y); y += 15;
      
      // Workout Summary
      doc.setFontSize(14);
      doc.text('Workout Summary', 20, y); y += 10;
      doc.setFontSize(11);
      doc.text(`Total Workouts: ${monthlyStats.totalWorkouts}`, 25, y); y += 7;
      doc.text(`Total Minutes: ${monthlyStats.totalWorkoutMinutes}`, 25, y); y += 7;
      doc.text(`Average Duration: ${monthlyStats.totalWorkouts > 0 ? Math.round(monthlyStats.totalWorkoutMinutes / monthlyStats.totalWorkouts) : 0} min/workout`, 25, y); y += 15;
      
      // Nutrition Summary
      doc.setFontSize(14);
      doc.text('Nutrition Summary', 20, y); y += 10;
      doc.setFontSize(11);
      doc.text(`Calories Consumed: ${monthlyStats.totalCaloriesConsumed.toLocaleString()}`, 25, y); y += 7;
      doc.text(`Calories Burned: ${monthlyStats.totalCaloriesBurned.toLocaleString()}`, 25, y); y += 7;
      doc.text(`Net Calories: ${monthlyStats.netCalories > 0 ? '+' : ''}${monthlyStats.netCalories.toLocaleString()}`, 25, y); y += 7;
      doc.text(`Water Intake: ${monthlyStats.totalWaterCups} cups (${(monthlyStats.totalWaterCups / 30).toFixed(1)}/day)`, 25, y); y += 15;
      
      // Meditation
      if (monthlyStats.totalMeditationMinutes > 0) {
        doc.setFontSize(14);
        doc.text('Mental Wellness', 20, y); y += 10;
        doc.setFontSize(11);
        doc.text(`Meditation Minutes: ${monthlyStats.totalMeditationMinutes}`, 25, y); y += 7;
      }
      
      // Footer
      doc.setFontSize(8);
      doc.text('Generated by Helio/WellnessAI', 20, 280);
      doc.text('Keep crushing your goals!', 20, 285);
      
      // Save
      if (Capacitor.isNativePlatform()) {
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        const result = await Filesystem.writeFile({
          path: `helio-monthly-${timestamp}.pdf`,
          data: pdfBase64,
          directory: Directory.Cache
        });
        await Share.share({
          title: 'Monthly Health Report',
          text: `Your ${monthYear} health summary`,
          url: result.uri,
          dialogTitle: 'Share monthly report'
        });
        alert('✅ Monthly report ready to share!');
      } else {
        doc.save(`helio-monthly-${timestamp}.pdf`);
      }
    } catch (error) {
      console.error('Failed to export monthly report:', error);
      alert('Export failed: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="monthly-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Monthly Summary</h2>
          <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={exportMonthlyReport} style={{
              background: 'linear-gradient(135deg, #8B5FE8, #B794F6)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>📄 Export PDF</button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
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
