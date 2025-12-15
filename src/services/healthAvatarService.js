// Health Avatar Service - 3D Avatar that shows future health state
import authService from './authService';
import firestoreService from './firestoreService';

class HealthAvatarService {
  constructor() {
    this.avatarState = null;
    this.cachedState = null;
    this.cacheTimestamp = 0;
    this.cacheValidDuration = 0; // No cache - always refresh for real-time data
  }

  // Calculate avatar's health score (0-100) using REAL DATA
  async calculateHealthScore(userProfile, stats = {}) {
    const { age, weight, height, goalSteps } = userProfile || {};
    const { totalSteps = 0, totalDays = 0 } = stats;

    let score = 100;
    const factors = [];

    // 1. BMI factor (REAL body measurements)
    if (height && weight) {
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);
      if (bmi < 18.5) {
        score -= 15;
        factors.push('⚠️ BMI too low');
      } else if (bmi > 25 && bmi < 30) {
        score -= 10;
        factors.push('⚠️ Overweight BMI');
      } else if (bmi >= 30) {
        score -= 25;
        factors.push('🚨 Obese BMI');
      } else {
        factors.push('✅ Healthy BMI');
      }
    }

    // 2. Activity factor (REAL step data from Android storage)
    const syncService = (await import('./syncService.js')).default;
    
    // Get today's steps from Android CapacitorStorage (merged data from migration)
    let todaySteps = 0;
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value: androidData } = await Preferences.get({ key: 'wellnessai_stepHistory' });
      if (androidData) {
        const stepHistory = JSON.parse(androidData);
        const todayDate = new Date().toISOString().split('T')[0];
        const todayEntry = stepHistory.find(entry => entry.date === todayDate);
        todaySteps = todayEntry?.steps || 0;
        console.log('🧬 Health Avatar: Today steps from Android storage:', todaySteps);
      }
    } catch (e) {
      console.warn('⚠️ Could not read today steps from Android storage:', e);
    }
    
    // Safely load stepHistory with validation
    let stepHistoryRaw = await firestoreService.get('stepHistory', authService.getCurrentUser()?.uid);
    if (!stepHistoryRaw || typeof stepHistoryRaw === 'string') {
      // Corrupted or missing from Firestore, try localStorage
      try {
        stepHistoryRaw = JSON.parse(localStorage.getItem('stepHistory') || '[]');
      } catch (e) {
        console.warn('⚠️ Could not parse stepHistory from localStorage:', e);
        stepHistoryRaw = [];
      }
    }
    const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : [];
    
    // Add today's live steps to history for averaging
    const stepHistoryWithToday = [...stepHistory];
    if (todaySteps > 0) {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayIndex = stepHistoryWithToday.findIndex(s => s.date === todayDate);
      if (todayIndex >= 0) {
        stepHistoryWithToday[todayIndex] = { date: todayDate, steps: todaySteps };
      } else {
        stepHistoryWithToday.push({ date: todayDate, steps: todaySteps });
      }
    }
    
    const last30Days = stepHistoryWithToday.slice(-30);
    const totalRecentSteps = last30Days.reduce((sum, entry) => sum + ((entry?.steps || entry) || 0), 0);
    const avgSteps = last30Days.length > 0 ? totalRecentSteps / last30Days.length : 0;
    const stepGoal = goalSteps || 10000;
    
    if(import.meta.env.DEV)console.log('📊 REAL Step Data:', { avgSteps, stepGoal, daysTracked: last30Days.length, totalSteps: totalRecentSteps });
    
    if (avgSteps < stepGoal * 0.5) {
      score -= 20;
      factors.push('🚨 Very low activity');
    } else if (avgSteps < stepGoal * 0.8) {
      score -= 10;
      factors.push('⚠️ Below step goal');
    } else if (avgSteps >= stepGoal) {
      score += 5;
      factors.push('✅ Meeting step goal');
    }

    // 3. Food quality factor (REAL food logs from scanner)
    let foodLog = [];
    try {
      // Check Firestore first, then localStorage
      let foodLogRaw = await firestoreService.get('foodLog', authService.getCurrentUser()?.uid);
      if (!foodLogRaw || typeof foodLogRaw === 'string') {
        // Try localStorage fallback
        const localData = localStorage.getItem('foodLog');
        foodLogRaw = localData ? JSON.parse(localData) : [];
      }
      foodLog = Array.isArray(foodLogRaw) ? foodLogRaw : [];
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Failed to parse foodLog:', e);
      foodLog = [];
    }
    
    const last30DaysMs = 30 * 24 * 60 * 60 * 1000;
    const recentFoods = foodLog.filter(f => {
      try {
        const logTime = new Date(f.timestamp || f.date).getTime();
        return logTime >= Date.now() - last30DaysMs;
      } catch (e) {
        return false;
      }
    });
    
    const dangerFoods = recentFoods.filter(f => f && f.safety === 'danger').length;
    const warningFoods = recentFoods.filter(f => f && f.safety === 'warning').length;
    const safeFoods = recentFoods.filter(f => f && f.safety === 'safe').length;
    
    if(import.meta.env.DEV)console.log('🍽️ REAL Food Data:', { total: recentFoods.length, danger: dangerFoods, warning: warningFoods, safe: safeFoods });
    
    score -= (dangerFoods * 5);
    score -= (warningFoods * 2);
    if (safeFoods > 30) {
      score += 5;
      factors.push('✅ Good diet choices');
    }
    if (dangerFoods > 5) {
      factors.push('🚨 Too many allergen exposures');
    }

    // 4. Workout consistency (REAL workout tracking)
    let workoutHistory = [];
    try {
      // Check Firestore first, then localStorage
      let workoutHistoryRaw = await firestoreService.get('workoutHistory', authService.getCurrentUser()?.uid);
      if (!workoutHistoryRaw || typeof workoutHistoryRaw === 'string') {
        // Try localStorage fallback
        const localData = localStorage.getItem('workoutHistory');
        workoutHistoryRaw = localData ? JSON.parse(localData) : [];
      }
      workoutHistory = Array.isArray(workoutHistoryRaw) ? workoutHistoryRaw : [];
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Failed to parse workoutHistory:', e);
      workoutHistory = [];
    }
    const recentWorkouts = workoutHistory.filter(w => {
      const workoutTime = new Date(w.timestamp || w.date).getTime();
      return workoutTime >= Date.now() - last30DaysMs;
    });
    
    if(import.meta.env.DEV)console.log('💪 REAL Workout Data:', { workouts: recentWorkouts.length });
    
    if (recentWorkouts.length >= 12) {
      score += 10;
      factors.push('✅ Excellent workout routine');
    } else if (recentWorkouts.length >= 8) {
      score += 5;
      factors.push('✅ Good workout consistency');
    } else if (recentWorkouts.length < 4) {
      score -= 10;
      factors.push('⚠️ Low workout frequency');
    }

    // 5. Login consistency (REAL app usage)
    let loginHistory = [];
    try {
      // Check Firestore first, then localStorage
      let loginHistoryRaw = await firestoreService.get('loginHistory', authService.getCurrentUser()?.uid);
      if (!loginHistoryRaw || typeof loginHistoryRaw === 'string') {
        // Try localStorage fallback
        const localData = localStorage.getItem('loginHistory');
        loginHistoryRaw = localData ? JSON.parse(localData) : [];
      }
      loginHistory = Array.isArray(loginHistoryRaw) ? loginHistoryRaw : [];
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Failed to parse loginHistory:', e);
      loginHistory = [];
    }
    const recentLogins = loginHistory.filter(l => {
      const loginTime = new Date(l.timestamp || l.date).getTime();
      return loginTime >= Date.now() - last30DaysMs;
    });
    const activeDays = new Set(recentLogins.map(l => new Date(l.timestamp || l.date).toDateString())).size;
    
    if(import.meta.env.DEV)console.log('📱 REAL Usage Data:', { activeDays });
    
    if (activeDays >= 20) {
      score += 5;
      factors.push('✅ Very engaged with health tracking');
    } else if (activeDays < 10) {
      score -= 5;
      factors.push('⚠️ Low engagement');
    }

    // 6. DNA risk factors (REAL genetic analysis)
    let dnaAnalysis = null;
    try {
      // Check Firestore first, then Preferences, then localStorage (with decryption)
      let dnaAnalysisRaw = await firestoreService.get('dnaAnalysis', authService.getCurrentUser()?.uid);
      
      // Validate Firestore data - reject if it's a corrupted string (like user ID)
      if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === 'string' || !dnaAnalysisRaw.traits) {
        // Try Preferences fallback (unencrypted)
        try {
          const { value: prefsData } = await (await import('@capacitor/preferences')).Preferences.get({ key: 'dna_genetic_data' });
          if (prefsData) {
            dnaAnalysisRaw = JSON.parse(prefsData);
            if(import.meta.env.DEV)console.log('🧬 Loaded DNA from Preferences');
          }
        } catch (prefsError) {
          if(import.meta.env.DEV)console.warn('Could not load from Preferences:', prefsError);
        }
        
        // Still nothing? Try localStorage (may be encrypted)
        if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === 'string') {
          const localData = localStorage.getItem('dnaAnalysis');
          if (localData) {
            try {
              // Try parsing as JSON first (unencrypted)
              dnaAnalysisRaw = JSON.parse(localData);
            } catch (jsonError) {
              // Might be encrypted - try decrypting
              try {
                const { default: encryptionService } = await import('./encryptionService');
                const decrypted = await encryptionService.decrypt(localData);
                dnaAnalysisRaw = JSON.parse(decrypted);
                if(import.meta.env.DEV)console.log('🧬 Decrypted DNA from localStorage');
              } catch (decryptError) {
                if(import.meta.env.DEV)console.warn('Could not decrypt DNA data:', decryptError);
                dnaAnalysisRaw = null;
              }
            }
          }
        }
      }
      
      dnaAnalysis = dnaAnalysisRaw;
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Failed to load dnaAnalysis:', e);
      dnaAnalysis = null;
    }
    if (dnaAnalysis) {
      // Support both old format (traits at root) and new format (merged with analysis)
      const traits = dnaAnalysis.traits || [];
      
      if (traits.length > 0) {
        const highRisks = traits.filter(t => t.risk === 'high').length;
        const mediumRisks = traits.filter(t => t.risk === 'medium').length;
        
        if(import.meta.env.DEV)console.log('🧬 REAL DNA Data:', { highRisks, mediumRisks });
        
        score -= (highRisks * 3);
        score -= (mediumRisks * 1);
        
        if (highRisks > 0) {
          factors.push(`🧬 ${highRisks} high genetic risks`);
        }
      }
    }

    // 7. Sleep quality (REAL sleep tracking + profile data)
    let sleepLog = [];
    try {
      // Check Firestore first, then localStorage
      let sleepLogRaw = await firestoreService.get('sleepLog', authService.getCurrentUser()?.uid);
      if (!sleepLogRaw || typeof sleepLogRaw === 'string') {
        // Try localStorage fallback
        const localData = localStorage.getItem('sleepLog');
        sleepLogRaw = localData ? JSON.parse(localData) : [];
      }
      sleepLog = Array.isArray(sleepLogRaw) ? sleepLogRaw : [];
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Failed to parse sleepLog:', e);
      sleepLog = [];
    }
    const recentSleep = sleepLog.filter(s => {
      const sleepTime = new Date(s.date).getTime();
      return sleepTime >= Date.now() - last30DaysMs;
    });
    
    let avgSleepHours = userProfile.sleepHours || 7; // Default from profile
    if (recentSleep.length > 0) {
      avgSleepHours = recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length;
    }
    
    if(import.meta.env.DEV)console.log('😴 REAL Sleep Data:', { avgHours: avgSleepHours });
    
    if (avgSleepHours < 6) {
      score -= 15;
      factors.push('🚨 Severe sleep deprivation');
    } else if (avgSleepHours < 7) {
      score -= 8;
      factors.push('⚠️ Insufficient sleep');
    } else if (avgSleepHours >= 7 && avgSleepHours <= 9) {
      score += 5;
      factors.push('✅ Good sleep duration');
    }

    // 8. Medical conditions (REAL profile data)
    if (userProfile.medicalConditions && userProfile.medicalConditions.length > 0) {
      const severeConditions = ['diabetes', 'heart-disease', 'hypertension'];
      const hasSevere = userProfile.medicalConditions.some(c => severeConditions.includes(c));
      
      if (hasSevere) {
        score -= 15;
        factors.push('🚨 Severe medical condition');
      } else {
        score -= (userProfile.medicalConditions.length * 3);
        factors.push(`⚠️ ${userProfile.medicalConditions.length} medical conditions`);
      }
      
      if(import.meta.env.DEV)console.log('🏥 Medical Conditions:', userProfile.medicalConditions);
    }

    // 9. Lifestyle factors (REAL profile data)
    if (userProfile.smoker) {
      score -= 20;
      factors.push('🚨 Smoker');
    }
    
    if (userProfile.alcoholFrequency === 'daily' || userProfile.alcoholFrequency === 'regular') {
      score -= 10;
      factors.push('⚠️ Regular alcohol consumption');
    }
    
    if (userProfile.stressLevel === 'very-high') {
      score -= 12;
      factors.push('🚨 Very high stress');
    } else if (userProfile.stressLevel === 'high') {
      score -= 6;
      factors.push('⚠️ High stress');
    }
    
    if (userProfile.waterIntake === 'low') {
      score -= 5;
      factors.push('⚠️ Low water intake');
    } else if (userProfile.waterIntake === 'excellent') {
      score += 3;
      factors.push('✅ Excellent hydration');
    }
    
    if(import.meta.env.DEV)console.log('🏃 Lifestyle Factors:', {
      smoker: userProfile.smoker,
      alcohol: userProfile.alcoholFrequency,
      stress: userProfile.stressLevel,
      water: userProfile.waterIntake
    });

    // 10. Family history risk (REAL profile data)
    if (userProfile.familyHistory && userProfile.familyHistory.length > 0) {
      score -= (userProfile.familyHistory.length * 2);
      factors.push(`👨‍👩‍👧‍👦 ${userProfile.familyHistory.length} family history risks`);
      if(import.meta.env.DEV)console.log('👨‍👩‍👧‍👦 Family History:', userProfile.familyHistory);
    }

    // 11. Fitness level adjustment (REAL profile data)
    if (userProfile.fitnessLevel === 'athlete' || userProfile.fitnessLevel === 'very-active') {
      score += 10;
      factors.push('✅ Excellent fitness level');
    } else if (userProfile.fitnessLevel === 'sedentary') {
      score -= 8;
      factors.push('⚠️ Sedentary lifestyle');
    }

    const finalScore = Math.max(0, Math.min(100, score));
    if(import.meta.env.DEV)console.log('🎯 FINAL HEALTH SCORE:', finalScore, 'Factors:', factors);
    
    return finalScore;
  }

  // Project future health score based on current habits
  projectFutureHealth(currentScore, years) {
    // Decline rate based on current habits
    let declineRate = 0;
    
    if (currentScore >= 80) {
      declineRate = 2; // Slow decline for healthy habits
    } else if (currentScore >= 60) {
      declineRate = 5; // Moderate decline
    } else {
      declineRate = 10; // Rapid decline for poor habits
    }

    const futureScore = Math.max(0, currentScore - (declineRate * years));
    
    return {
      score: futureScore,
      ageAppearance: this.calculateAgeAppearance(futureScore, years),
      warnings: this.generateWarnings(futureScore),
      improvements: this.generateImprovements(currentScore, futureScore)
    };
  }

  // Calculate how old avatar appears vs actual age
  calculateAgeAppearance(healthScore, yearsFromNow) {
    const user = authService.getCurrentUser();
    const actualAge = (user?.profile?.age || 30) + yearsFromNow;
    
    // Poor health makes you look older
    let ageModifier = 0;
    if (healthScore < 40) ageModifier = 15;
    else if (healthScore < 60) ageModifier = 8;
    else if (healthScore > 85) ageModifier = -5; // Look younger!
    
    return actualAge + ageModifier;
  }

  // Generate health warnings
  generateWarnings(futureScore) {
    const warnings = [];
    
    if (futureScore < 30) {
      warnings.push('🚨 Critical: High risk of chronic disease');
      warnings.push('⚠️ Energy levels will be severely impacted');
      warnings.push('💔 Heart health at serious risk');
    } else if (futureScore < 50) {
      warnings.push('⚠️ Moderate health decline expected');
      warnings.push('😓 Energy and mood will decrease');
      warnings.push('📉 Fitness levels declining');
    } else if (futureScore < 70) {
      warnings.push('⚡ Room for improvement');
      warnings.push('🎯 Could optimize health further');
    }
    
    return warnings;
  }

  // Generate improvement suggestions
  generateImprovements(currentScore, futureScore) {
    const improvements = [];
    
    if (futureScore < currentScore) {
      improvements.push('💪 Increase daily activity by 3000 steps');
      improvements.push('🥗 Add 2 more servings of vegetables daily');
      improvements.push('💤 Get 30 minutes more sleep each night');
      improvements.push('🧘 Practice 10 minutes of meditation');
    }
    
    return improvements;
  }

  // Get avatar visual properties
  getAvatarVisuals(healthScore) {
    // Determine avatar appearance based on health score
    return {
      skinTone: healthScore > 70 ? '#FFD4A3' : healthScore > 50 ? '#E8C4A0' : '#D4B898',
      energyLevel: healthScore > 70 ? 'high' : healthScore > 50 ? 'medium' : 'low',
      muscleTone: healthScore > 75 ? 'toned' : healthScore > 50 ? 'average' : 'low',
      posture: healthScore > 70 ? 'upright' : healthScore > 50 ? 'slight-slouch' : 'slouched',
      eyeBrightness: healthScore > 75 ? 'bright' : healthScore > 50 ? 'average' : 'dull',
      hairQuality: healthScore > 70 ? 'shiny' : healthScore > 50 ? 'average' : 'dull',
      glowEffect: healthScore > 80 ? 'strong' : healthScore > 60 ? 'subtle' : 'none',
      overallMood: healthScore > 75 ? '😊' : healthScore > 50 ? '😐' : '😔'
    };
  }

  // Generate full avatar state with REAL DATA breakdown
  async getAvatarState(forceRefresh = false) {
    // Skip cache if force refresh requested (always fresh data)
    const nowTimestamp = Date.now();
    if (!forceRefresh && this.cachedState && (nowTimestamp - this.cacheTimestamp) < this.cacheValidDuration) {
      if(import.meta.env.DEV)console.log('⚡ Using cached avatar state (fast load)');
      return this.cachedState;
    }

    if(import.meta.env.DEV)console.log('🔄 Calculating fresh avatar state with latest data...');
    const user = authService.getCurrentUser();
    if (!user) return null;

    // 🔥 MONTHLY TRACKING: Declare date variables at top to avoid temporal dead zone
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthName = now.toLocaleString('en-US', { month: 'long' });

    if(import.meta.env.DEV)console.log('👤 User profile data:', {
      age: user.profile?.age,
      weight: user.profile?.weight,
      height: user.profile?.height,
      goalSteps: user.profile?.goalSteps,
      fitnessLevel: user.profile?.fitnessLevel,
      medicalConditions: user.profile?.medicalConditions?.length,
      smoker: user.profile?.smoker
    });

    const currentScore = await this.calculateHealthScore(user.profile, user.stats);
    
    // Get REAL data sources for display (from native service first, then Firebase, then localStorage fallback)
    const syncService = (await import('./syncService.js')).default;
    
    // CRITICAL: Read today's step count from Android storage (merged data)
    let todaySteps = 0;
    const todayDate = new Date().toISOString().split('T')[0];
    
    // Safely load stepHistory with validation - READ FROM ANDROID'S KEY FIRST!
    let stepHistoryRaw = null;
    
    // PRIORITY 1: Try Android's CapacitorStorage (wellnessai_ prefix) - REAL-TIME DATA
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value: androidData } = await Preferences.get({ key: 'wellnessai_stepHistory' });
      if (androidData) {
        stepHistoryRaw = JSON.parse(androidData);
        console.log('🧬 Health Avatar loaded from Android CapacitorStorage:', stepHistoryRaw?.length, 'entries');
      }
    } catch (e) {
      console.warn('⚠️ Could not read from Android CapacitorStorage:', e);
    }
    
    // PRIORITY 2: Fallback to Firestore (cloud backup)
    if (!stepHistoryRaw) {
      stepHistoryRaw = await firestoreService.get('stepHistory', authService.getCurrentUser()?.uid);
      if (stepHistoryRaw) {
        console.log('🧬 Fallback to Firestore stepHistory:', stepHistoryRaw?.length, 'entries');
      }
    }
    
    // PRIORITY 3: Fallback to localStorage (cache)
    if (!stepHistoryRaw || typeof stepHistoryRaw === 'string') {
      try {
        stepHistoryRaw = JSON.parse(localStorage.getItem('stepHistory') || '[]');
        console.log('🧬 Fallback to localStorage stepHistory:', stepHistoryRaw?.length, 'entries');
      } catch (e) {
        console.warn('⚠️ Could not parse stepHistory from localStorage:', e);
        stepHistoryRaw = [];
      }
    }
    
    const stepHistoryArray = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : [];
    
    // Extract today's steps from the loaded history
    const todayEntry = stepHistoryArray.find(s => s.date === todayDate);
    todaySteps = todayEntry?.steps || 0;
    console.log('🧬 Health Avatar: Today steps from history:', todaySteps);
    
    // Safely load all data sources with validation
    let foodLog = [];
    try {
      let foodLogRaw = user.profile?.foodLog || await firestoreService.get('foodLog', authService.getCurrentUser()?.uid);
      if (!foodLogRaw || typeof foodLogRaw === 'string') {
        const localData = localStorage.getItem('foodLog');
        foodLogRaw = localData ? JSON.parse(localData) : [];
      }
      foodLog = Array.isArray(foodLogRaw) ? foodLogRaw : [];
    } catch (e) {
      console.warn('⚠️ Could not load foodLog:', e);
      foodLog = [];
    }
    
    let workoutHistory = [];
    try {
      let workoutHistoryRaw = await firestoreService.get('workoutHistory', authService.getCurrentUser()?.uid);
      if (!workoutHistoryRaw || typeof workoutHistoryRaw === 'string') {
        const localData = localStorage.getItem('workoutHistory');
        workoutHistoryRaw = localData ? JSON.parse(localData) : [];
      }
      workoutHistory = Array.isArray(workoutHistoryRaw) ? workoutHistoryRaw : [];
    } catch (e) {
      console.warn('⚠️ Could not load workoutHistory:', e);
      workoutHistory = [];
    }
    
    let dnaAnalysis = null;
    try {
      // Check Firestore first, then Preferences, then localStorage (with decryption)
      let dnaAnalysisRaw = await firestoreService.get('dnaAnalysis', authService.getCurrentUser()?.uid);
      
      // Validate Firestore data - reject if it's a corrupted string (like user ID)
      if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === 'string' || !dnaAnalysisRaw.traits) {
        // Try Preferences fallback (unencrypted)
        try {
          const { value: prefsData } = await (await import('@capacitor/preferences')).Preferences.get({ key: 'dna_genetic_data' });
          if (prefsData) {
            dnaAnalysisRaw = JSON.parse(prefsData);
            if(import.meta.env.DEV)console.log('🧬 Loaded DNA from Preferences (getAvatarState)');
          }
        } catch (prefsError) {
          if(import.meta.env.DEV)console.warn('Could not load from Preferences:', prefsError);
        }
        
        // Still nothing? Try localStorage (may be encrypted)
        if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === 'string') {
          const localData = localStorage.getItem('dnaAnalysis');
          if (localData) {
            try {
              // Try parsing as JSON first (unencrypted)
              dnaAnalysisRaw = JSON.parse(localData);
            } catch (jsonError) {
              // Might be encrypted - try decrypting
              try {
                const { default: encryptionService } = await import('./encryptionService');
                const decrypted = await encryptionService.decrypt(localData);
                dnaAnalysisRaw = JSON.parse(decrypted);
                if(import.meta.env.DEV)console.log('🧬 Decrypted DNA from localStorage (getAvatarState)');
              } catch (decryptError) {
                if(import.meta.env.DEV)console.warn('Could not decrypt DNA data:', decryptError);
                dnaAnalysisRaw = null;
              }
            }
          }
        }
      }
      
      dnaAnalysis = dnaAnalysisRaw;
    } catch (e) {
      console.warn('⚠️ Could not load dnaAnalysis:', e);
      dnaAnalysis = null;
    }
    
    let sleepLog = [];
    try {
      let sleepLogRaw = await firestoreService.get('sleepLog', authService.getCurrentUser()?.uid);
      if (!sleepLogRaw || typeof sleepLogRaw === 'string') {
        const localData = localStorage.getItem('sleepLog');
        sleepLogRaw = localData ? JSON.parse(localData) : [];
      }
      sleepLog = Array.isArray(sleepLogRaw) ? sleepLogRaw : [];
    } catch (e) {
      console.warn('⚠️ Could not load sleepLog:', e);
      sleepLog = [];
    }
    
    // Filter sleep logs for current month only
    const thisMonthSleep = sleepLog.filter(s => {
      const sleepDate = new Date(s.timestamp || s.date);
      return sleepDate.getMonth() === currentMonth && sleepDate.getFullYear() === currentYear;
    });
    
    // Filter steps for current month only
    const thisMonthSteps = stepHistoryArray.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    console.log('🧬 Current month steps (' + monthName + '):', thisMonthSteps);
    
    const totalMonthlySteps = thisMonthSteps.reduce((sum, entry) => {
      const steps = typeof entry === 'object' ? entry?.steps : entry;
      const validSteps = typeof steps === 'number' && !isNaN(steps) ? steps : 0;
      return sum + validSteps;
    }, 0);
    const avgSteps = thisMonthSteps.length > 0 ? totalMonthlySteps / thisMonthSteps.length : 0;
    
    // Filter food scans for current month only
    const thisMonthFoods = foodLog.filter(f => {
      const logDate = new Date(f.timestamp || f.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });
    
    // Filter workouts for current month only
    const thisMonthWorkouts = workoutHistory.filter(w => {
      const workoutDate = new Date(w.timestamp || w.date);
      return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
    });
    
    if(import.meta.env.DEV)console.log('📊 Avatar Data Sources (' + monthName + '):', {
      stepDays: thisMonthSteps.length,
      totalMonthlySteps,
      avgSteps,
      foodLogs: thisMonthFoods.length,
      workouts: thisMonthWorkouts.length,
      hasDNA: !!dnaAnalysis,
      sleepLogs: thisMonthSleep.length
    });
    
    const avatarData = {
      current: {
        score: currentScore,
        visuals: this.getAvatarVisuals(currentScore),
        age: user.profile.age || 30,
        dataBreakdown: {
          monthName: monthName, // Current month name for display
          currentYear: currentYear, // Current year for display
          stepsDays: thisMonthSteps.length,
          todaySteps: todaySteps, // Live step count from native service (same as dashboard)
          avgDailySteps: Math.round(avgSteps),
          totalMonthlySteps: Math.round(totalMonthlySteps), // Total steps this month
          stepHistory: thisMonthSteps, // Current month history only
          foodLogsCount: thisMonthFoods.length,
          workoutsCount: thisMonthWorkouts.length,
          hasDNAAnalysis: !!(dnaAnalysis && (dnaAnalysis.traits || dnaAnalysis.analysis)),
          sleepLogsCount: thisMonthSleep.length
        }
      },
      future1Year: this.projectFutureHealth(currentScore, 1),
      future5Years: this.projectFutureHealth(currentScore, 5),
      future10Years: this.projectFutureHealth(currentScore, 10)
    };

    // Cache the result for 5 minutes
    this.cachedState = avatarData;
    this.cacheTimestamp = now;
    if(import.meta.env.DEV)console.log('✅ Avatar state cached for fast future loads');

    return avatarData;
  }

  // Get cached state synchronously (no await) for instant loading
  getCachedState() {
    const now = Date.now();
    if (this.cachedState && (now - this.cacheTimestamp) < this.cacheValidDuration) {
      if(import.meta.env.DEV)console.log('⚡ Instant cached avatar state (no loading screen)');
      return this.cachedState;
    }
    return null;
  }

  // Clear cache when user data changes (call after profile updates, food logs, etc.)
  clearCache() {
    this.cachedState = null;
    this.cacheTimestamp = 0;
    if(import.meta.env.DEV)console.log('🔄 Avatar cache cleared - will recalculate on next load');
  }

  // Simulate impact of a choice on avatar
  simulateChoice(choiceType, choiceData) {
    // Show immediate visual feedback for food/activity choices
    const impacts = {
      'fast-food': { score: -5, message: 'Avatar looks tired, skin duller' },
      'healthy-meal': { score: +3, message: 'Avatar glows, more energetic' },
      'exercise': { score: +5, message: 'Avatar becomes more toned' },
      'skipped-workout': { score: -3, message: 'Avatar loses muscle tone' },
      'good-sleep': { score: +4, message: 'Avatar looks refreshed' },
      'poor-sleep': { score: -4, message: 'Avatar has dark circles' }
    };
    
    return impacts[choiceType] || { score: 0, message: 'No change' };
  }
}

export const healthAvatarService = new HealthAvatarService();
export default healthAvatarService;



