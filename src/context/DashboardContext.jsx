// DashboardContext.jsx - SINGLE SOURCE OF TRUTH for all wellness data
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';
import authService from '../services/authService';
import syncService from '../services/syncService';
import firestoreService from '../services/firestoreService';
import dataService from '../services/dataService'; // 🎯 SINGLE SOURCE OF TRUTH

const DashboardContext = createContext(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  // ========================================
  // INITIALIZATION STATE
  // ========================================
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [isNative, setIsNative] = useState(false);
  const initRef = useRef(false);

  // ========================================
  // WELLNESS DATA STATE (Single Source of Truth)
  // ========================================
  const [todaySteps, setTodaySteps] = useState(0);
  const [waterCups, setWaterCups] = useState(0);
  const [workoutsToday, setWorkoutsToday] = useState([]);
  const [sleepHours, setSleepHours] = useState(0);
  const [mealsToday, setMealsToday] = useState([]);
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // ========================================
  // LOAD ALL DATA FROM FIRESTORE + PREFERENCES
  // ========================================
  const loadAllData = async () => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      const today = new Date().toISOString().split('T')[0];

      // STEPS: Read from Preferences (Android native service)
      const { value: storedSteps } = await Preferences.get({ key: 'wellnessai_todaySteps' });
      if (storedSteps) {
        const rawValue = storedSteps;
        let steps = 0;
        try {
          steps = parseInt(JSON.parse(rawValue));
        } catch {
          steps = parseInt(rawValue);
        }
        setTodaySteps(steps);
        console.log('📊 [CONTEXT] Steps loaded:', steps);
      } else {
        console.log('⚠️ [CONTEXT] wellnessai_todaySteps NOT FOUND in Preferences - returning 0');
        console.log('🔍 [CONTEXT] Is native step service running? Check notification bar.');
        setTodaySteps(0);
      }

      // 🔥 WATER: Read from dataService (unified storage - Firestore + Preferences + localStorage)
      const { default: dataService } = await import('../services/dataService');
      let waterLog = await dataService.get('waterLog', userId) || [];
      console.log('💧 [CONTEXT] Water loaded via dataService:', waterLog.length, 'entries');
      
      let waterToday = waterLog.filter(w => w.date === today);
      let cups = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0);
      setWaterCups(cups);
      console.log('💧 [CONTEXT] Water cups today:', cups);

      // 🔥 WORKOUTS: Read from localStorage FIRST (instant), then sync with Firestore
      let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      let workoutsTodayData = workoutHistory.filter(w => w.date === today);
      setWorkoutsToday(workoutsTodayData);
      console.log('💪 [CONTEXT] Workouts loaded from localStorage:', workoutsTodayData.length);
      
      // Background Firestore sync (non-blocking)
      firestoreService.get('workoutHistory', userId).then(cloudWorkouts => {
        if (cloudWorkouts && cloudWorkouts.length > workoutHistory.length) {
          localStorage.setItem('workoutHistory', JSON.stringify(cloudWorkouts));
          const cloudWorkoutsToday = cloudWorkouts.filter(w => w.date === today);
          if (cloudWorkoutsToday.length !== workoutsTodayData.length) {
            setWorkoutsToday(cloudWorkoutsToday);
            console.log('☁️ [CONTEXT] Workouts updated from cloud:', cloudWorkoutsToday.length);
          }
        }
      }).catch(err => console.warn('⚠️ Firestore workout sync failed:', err));

      // 🔥 SLEEP: Read from localStorage FIRST (instant), then sync with Firestore
      let sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]');
      let sleepToday = sleepLog.find(s => s.date === today);
      setSleepHours(sleepToday?.hours || 0);
      console.log('😴 [CONTEXT] Sleep loaded from localStorage:', sleepToday?.hours || 0);
      
      // Background Firestore sync (non-blocking)
      firestoreService.get('sleepLog', userId).then(cloudSleep => {
        if (cloudSleep && cloudSleep.length > sleepLog.length) {
          localStorage.setItem('sleepLog', JSON.stringify(cloudSleep));
          const cloudSleepToday = cloudSleep.find(s => s.date === today);
          if (cloudSleepToday && cloudSleepToday.hours !== (sleepToday?.hours || 0)) {
            setSleepHours(cloudSleepToday.hours);
            console.log('☁️ [CONTEXT] Sleep updated from cloud:', cloudSleepToday.hours);
          }
        }
      }).catch(err => console.warn('⚠️ Firestore sleep sync failed:', err));

      // 🔥 MEALS: Read from localStorage FIRST (instant), then sync with Firestore
      let foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
      let mealsTodayData = foodLog.filter(f =>
        f.date === today || (f.timestamp && new Date(f.timestamp).toISOString().split('T')[0] === today)
      );
      setMealsToday(mealsTodayData);
      console.log('🍽️ [CONTEXT] Meals loaded from localStorage:', mealsTodayData.length);
      
      // Background Firestore sync (non-blocking)
      const currentUser = authService.getCurrentUser();
      firestoreService.get('foodLog', userId).then(cloudFood => {
        if (cloudFood && cloudFood.length > foodLog.length) {
          localStorage.setItem('foodLog', JSON.stringify(cloudFood));
          const cloudMealsToday = cloudFood.filter(f =>
            f.date === today || (f.timestamp && new Date(f.timestamp).toISOString().split('T')[0] === today)
          );
          if (cloudMealsToday.length !== mealsTodayData.length) {
            setMealsToday(cloudMealsToday);
            console.log('☁️ [CONTEXT] Meals updated from cloud:', cloudMealsToday.length);
          }
        }
      }).catch(err => console.warn('⚠️ Firestore food sync failed:', err));

      // 🔥 MEDITATION: Read from localStorage FIRST (instant), then sync with Firestore
      let meditationLog = JSON.parse(localStorage.getItem('meditationLog') || '[]');
      let meditationToday = meditationLog.filter(m => m.date === today);
      let minutes = meditationToday.reduce((sum, m) => sum + (m.duration || 0), 0);
      setMeditationMinutes(minutes);
      console.log('🧘 [CONTEXT] Meditation loaded from localStorage:', minutes);
      
      // Background Firestore sync (non-blocking)
      firestoreService.get('meditationLog', userId).then(cloudMeditation => {
        if (cloudMeditation && cloudMeditation.length > meditationLog.length) {
          localStorage.setItem('meditationLog', JSON.stringify(cloudMeditation));
          const cloudMeditationToday = cloudMeditation.filter(m => m.date === today);
          const cloudMinutes = cloudMeditationToday.reduce((sum, m) => sum + (m.duration || 0), 0);
          if (cloudMinutes !== minutes) {
            setMeditationMinutes(cloudMinutes);
            console.log('☁️ [CONTEXT] Meditation updated from cloud:', cloudMinutes);
          }
        }
      }).catch(err => console.warn('⚠️ Firestore meditation sync failed:', err));

      // STREAK: Calculate from login history
      const loginHistory = await syncService.getData('loginHistory', userId) || [];
      let streakCount = 0;
      if (loginHistory.length > 0) {
        const sortedLogins = loginHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        let currentDate = new Date();
        streakCount = 1;

        for (let i = 1; i < sortedLogins.length; i++) {
          const loginDate = new Date(sortedLogins[i].date);
          const daysDiff = Math.floor((currentDate - loginDate) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            streakCount++;
            currentDate = loginDate;
          } else if (daysDiff > 1) {
            break;
          }
        }
      }
      setStreak(streakCount);
      console.log('🔥 [CONTEXT] Streak loaded:', streakCount);

      // WELLNESS SCORE: Calculate (use local variables, not state - state updates async!)
      const stepsForCalc = storedSteps ? (parseInt(JSON.parse(storedSteps)) || 0) : 0;
      const sleepForCalc = sleepToday?.hours || 0;
      const score = Math.min(100, Math.max(0,
        ((stepsForCalc / 10000) * 30) +
        (cups >= 8 ? 20 : (cups / 8) * 20) +
        (mealsTodayData.length >= 3 ? 20 : (mealsTodayData.length / 3) * 20) +
        (workoutsTodayData.length > 0 ? 20 : 0) +
        (sleepForCalc >= 7 ? 10 : (sleepForCalc / 7) * 10)
      ));
      setWellnessScore(Math.round(score));
      console.log('⭐ [CONTEXT] Wellness score calculated:', Math.round(score));

    } catch (error) {
      console.error('❌ [CONTEXT] Load data error:', error);
    }
  };

  // ========================================
  // UPDATE FUNCTIONS (Instant UI + Background Sync)
  // ========================================

  // LOG WATER
  const logWater = async (cups) => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      const today = new Date().toISOString().split('T')[0];

      // INSTANT UI UPDATE
      setWaterCups(prev => prev + cups);
      console.log('💧 [CONTEXT] Water logged:', cups, '(UI updated instantly)');

      // ⚡ USE UNIFIED DATASOURCE: Save via dataService (handles all 4 storage systems)
      const { default: dataService } = await import('../services/dataService');
      const waterLog = await dataService.get('waterLog', userId) || [];
      waterLog.push({ cups, date: today, timestamp: Date.now() });
      await dataService.save('waterLog', waterLog, userId);
      console.log('💾 [CONTEXT] Water saved via dataService (all 4 systems)');

      // Recalculate wellness score
      loadAllData();
    } catch (error) {
      console.error('❌ [CONTEXT] Log water error:', error);
    }
  };

  // LOG WORKOUT
  const logWorkout = async (workout) => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      const today = new Date().toISOString().split('T')[0];

      // INSTANT UI UPDATE
      setWorkoutsToday(prev => [...prev, workout]);
      console.log('💪 [CONTEXT] Workout logged:', workout.type, '(UI updated instantly)');

      // ⚡ OPTIMISTIC UI: Save to localStorage FIRST (instant persistence)
      const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      workoutHistory.push({ ...workout, date: today, timestamp: Date.now() });
      localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
      console.log('💾 [CONTEXT] Workout saved to localStorage (INSTANT)');

      // 💾 SAVE TO CAPACITOR PREFERENCES (persistent storage) - non-blocking
      import('@capacitor/preferences').then(({ Preferences }) => {
        Preferences.set({ key: 'workoutHistory', value: JSON.stringify(workoutHistory) })
          .catch(err => console.warn('⚠️ Preferences save failed:', err));
      });

      // 🔥 BACKGROUND FIRESTORE SYNC (non-blocking - happens in background)
      if (userId) {
        firestoreService.save('workoutHistory', workoutHistory, userId)
          .then(() => console.log('☁️ [CONTEXT] Workout synced to Firestore (background)'))
          .catch(error => console.warn('⚠️ Workout Firestore sync failed:', error));
      }

      // Recalculate wellness score
      loadAllData();
    } catch (error) {
      console.error('❌ [CONTEXT] Log workout error:', error);
    }
  };

  // LOG SLEEP
  const logSleep = async (hours) => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      const today = new Date().toISOString().split('T')[0];

      // INSTANT UI UPDATE
      setSleepHours(hours);
      console.log('😴 [CONTEXT] Sleep logged:', hours, 'hours (UI updated instantly)');

      // ⚡ OPTIMISTIC UI: Save to localStorage FIRST (instant persistence)
      const sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]');
      const existingIndex = sleepLog.findIndex(s => s.date === today);
      if (existingIndex >= 0) {
        sleepLog[existingIndex] = { hours, date: today, timestamp: Date.now() };
      } else {
        sleepLog.push({ hours, date: today, timestamp: Date.now() });
      }
      localStorage.setItem('sleepLog', JSON.stringify(sleepLog));
      console.log('💾 [CONTEXT] Sleep saved to localStorage (INSTANT)');

      // 💾 SAVE TO CAPACITOR PREFERENCES (persistent storage) - non-blocking
      import('@capacitor/preferences').then(({ Preferences }) => {
        Preferences.set({ key: 'sleepLog', value: JSON.stringify(sleepLog) })
          .catch(err => console.warn('⚠️ Preferences save failed:', err));
      });

      // 🔥 BACKGROUND FIRESTORE SYNC (non-blocking - happens in background)
      if (userId) {
        firestoreService.save('sleepLog', sleepLog, userId)
          .then(() => console.log('☁️ [CONTEXT] Sleep synced to Firestore (background)'))
          .catch(error => console.warn('⚠️ Sleep Firestore sync failed:', error));
      }

      // Recalculate wellness score
      loadAllData();
    } catch (error) {
      console.error('❌ [CONTEXT] Log sleep error:', error);
    }
  };

  // LOG MEAL
  const logMeal = async (meal) => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      const today = new Date().toISOString().split('T')[0];

      // INSTANT UI UPDATE
      setMealsToday(prev => [...prev, meal]);
      console.log('🍽️ [CONTEXT] Meal logged:', meal.name, '(UI updated instantly)');

      // BACKGROUND FIRESTORE SYNC
      const currentUser = authService.getCurrentUser();
      const foodLog = currentUser?.profile?.foodLog || [];
      foodLog.push({
        ...meal,
        date: today,
        timestamp: Date.now()
      });
      await authService.updateProfile({ foodLog });
      console.log('☁️ [CONTEXT] Meal synced to Firestore');

      // Recalculate wellness score
      await loadAllData();
    } catch (error) {
      console.error('❌ [CONTEXT] Log meal error:', error);
    }
  };

  // LOG MEDITATION
  const logMeditation = async (duration) => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      const today = new Date().toISOString().split('T')[0];

      // INSTANT UI UPDATE
      setMeditationMinutes(prev => prev + duration);
      console.log('🧘 [CONTEXT] Meditation logged:', duration, 'min (UI updated instantly)');

      // ⚡ OPTIMISTIC UI: Save to localStorage FIRST (instant persistence)
      const meditationLog = JSON.parse(localStorage.getItem('meditationLog') || '[]');
      meditationLog.push({ duration, date: today, timestamp: Date.now() });
      localStorage.setItem('meditationLog', JSON.stringify(meditationLog));
      console.log('💾 [CONTEXT] Meditation saved to localStorage (INSTANT)');

      // 💾 SAVE TO CAPACITOR PREFERENCES (persistent storage) - non-blocking
      import('@capacitor/preferences').then(({ Preferences }) => {
        Preferences.set({ key: 'meditationLog', value: JSON.stringify(meditationLog) })
          .catch(err => console.warn('⚠️ Preferences save failed:', err));
      });

      // 🔥 BACKGROUND FIRESTORE SYNC (non-blocking - happens in background)
      if (userId) {
        firestoreService.save('meditationLog', meditationLog, userId)
          .then(() => console.log('☁️ [CONTEXT] Meditation synced to Firestore (background)'))
          .catch(error => console.warn('⚠️ Meditation Firestore sync failed:', error));
      }

      // Recalculate wellness score
      loadAllData();
    } catch (error) {
      console.error('❌ [CONTEXT] Log meditation error:', error);
    }
  };

  // ========================================
  // STEP POLLING (30-second intervals)
  // ========================================
  useEffect(() => {
    if (!initialized) return;

    const pollSteps = async () => {
      try {
        const { value: storedSteps } = await Preferences.get({ key: 'wellnessai_todaySteps' });
        if (storedSteps) {
          const rawValue = storedSteps;
          let steps = 0;
          try {
            steps = parseInt(JSON.parse(rawValue));
          } catch {
            steps = parseInt(rawValue);
          }

          if (steps !== todaySteps) {
            setTodaySteps(steps);
            console.log('📊 [CONTEXT] Steps updated via polling:', steps);
            // Recalculate wellness score
            await loadAllData();
          }
        }
      } catch (error) {
        console.error('❌ [CONTEXT] Step polling error:', error);
      }
    };

    const interval = setInterval(pollSteps, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [initialized, todaySteps]);

  // ========================================
  // AUTH LISTENER - CRITICAL FIX FOR LOGIN DATA REFRESH
  // ========================================
  useEffect(() => {
    // This ensures data reloads INSTANTLY when user logs in/out
    // without needing to restart the app
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      if (!initialized) return; // Ignore updates during initial boot (handled by init)
      
      console.log('👤 [CONTEXT] Auth state change detected:', currentUser?.uid || 'Logged out');
      
      if (currentUser?.uid !== user?.uid) {
        console.log('🔄 [CONTEXT] User changed! Reloading all dashboard data...');
        setUser(currentUser);
        
        if (currentUser) {
          await loadAllData();
          console.log('✅ [CONTEXT] Data reload complete for new user');
        } else {
          // Clear data on logout
          setTodaySteps(0);
          setWaterCups(0);
          setWorkoutsToday([]);
          setSleepHours(0);
          setMealsToday([]);
          setMeditationMinutes(0);
          setWellnessScore(0);
          setStreak(0);
          console.log('🧹 [CONTEXT] Cleaned up dashboard for logout');
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initialized, user]);

  // ========================================
  // INITIALIZATION (ONE-TIME)
  // ========================================
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeDashboard = async () => {
      try {
        console.log('🚀 [CONTEXT] Starting initialization...');

        // 1. Check platform
        const deviceInfo = await Device.getInfo();
        const native = deviceInfo.platform !== 'web';
        setIsNative(native);
        console.log(`📱 [CONTEXT] Platform: ${native ? 'Native' : 'Web'}`);

        // 2. Initialize services
        await authService.initialize();
        await syncService.initialize();
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          console.log('✅ [CONTEXT] User:', currentUser.email || currentUser.uid);
        }

        // 3. Load ALL data
        await loadAllData();

        // 4. Start sync service
        syncService.startAuthCheck();
        console.log('✅ [CONTEXT] Sync service started');

        setInitialized(true);
        console.log('✅ [CONTEXT] Initialization complete');
      } catch (error) {
        console.error('❌ [CONTEXT] Initialization error:', error);
        setInitialized(true); // Still mark as initialized so UI can render
      }
    };

    initializeDashboard();
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================
  const value = {
    // Initialization
    initialized,
    user,
    setUser,
    isNative,

    // Wellness Data (Read-Only)
    todaySteps,
    waterCups,
    workoutsToday,
    sleepHours,
    mealsToday,
    meditationMinutes,
    wellnessScore,
    streak,

    // Update Functions
    logWater,
    logWorkout,
    logSleep,
    logMeal,
    logMeditation,

    // Utility
    loadAllData, // Manual refresh if needed
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
