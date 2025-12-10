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

    // 2. Activity factor (REAL step data from native service - live count)
    const syncService = (await import('./syncService.js')).default;
    
    // Get live step count from native service
    let todaySteps = 0;
    try {
      const { default: nativeStepService } = await import('./nativeStepService.js');
      const rawSteps = await nativeStepService.getSteps();
      const todayDate = new Date().toISOString().split('T')[0];
      let stepBaseline = parseInt(await firestoreService.get('stepBaseline', authService.getCurrentUser()?.uid) || '0');
      const baselineDate = await firestoreService.get('stepBaselineDate', authService.getCurrentUser()?.uid);
      
      // 🔥 FIX: Detect sensor reset (same as dashboard)
      if (rawSteps < stepBaseline && baselineDate === todayDate) {
        console.log('🧬 Health Avatar: Sensor RESET detected! Raw:', rawSteps, '< Baseline:', stepBaseline);
        stepBaseline = rawSteps;
        await firestoreService.save('stepBaseline', rawSteps.toString(), authService.getCurrentUser()?.uid);
      }
      
      if (baselineDate === todayDate) {
        todaySteps = Math.max(0, rawSteps - stepBaseline);
      }
      console.log('🧬 Health Avatar: Native service steps today:', todaySteps);
    } catch (e) {
      console.warn('⚠️ Could not read from native service for score:', e);
    }
    
    const stepHistoryRaw = await firestoreService.get('stepHistory', authService.getCurrentUser()?.uid) || JSON.parse(localStorage.getItem('stepHistory') || '[]');
    const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : Object.values(stepHistoryRaw);
    
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
      const foodLogRaw = localStorage.getItem('foodLog');
      foodLog = foodLogRaw ? JSON.parse(foodLogRaw) : [];
      // Ensure it's an array
      if (!Array.isArray(foodLog)) foodLog = [];
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
    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
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
    const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
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
    const dnaAnalysis = JSON.parse(localStorage.getItem('dnaAnalysis') || 'null');
    if (dnaAnalysis && dnaAnalysis.traits) {
      const highRisks = dnaAnalysis.traits.filter(t => t.risk === 'high').length;
      const mediumRisks = dnaAnalysis.traits.filter(t => t.risk === 'medium').length;
      
      if(import.meta.env.DEV)console.log('🧬 REAL DNA Data:', { highRisks, mediumRisks });
      
      score -= (highRisks * 3);
      score -= (mediumRisks * 1);
      
      if (highRisks > 0) {
        factors.push(`🧬 ${highRisks} high genetic risks`);
      }
    }

    // 7. Sleep quality (REAL sleep tracking + profile data)
    const sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]');
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
    // CRITICAL: Force save current step data BEFORE loading avatar
    console.log('🧬 FORCING save of current step data before avatar load...');
    try {
      const nativeHealthService = (await import('./nativeHealthService.js')).default;
      await nativeHealthService.saveHealthData();
      console.log('✅ Step data saved successfully');
    } catch (e) {
      console.warn('⚠️ Could not force save health data:', e);
    }
    
    // Skip cache if force refresh requested (always fresh data)
    const now = Date.now();
    if (!forceRefresh && this.cachedState && (now - this.cacheTimestamp) < this.cacheValidDuration) {
      if(import.meta.env.DEV)console.log('⚡ Using cached avatar state (fast load)');
      return this.cachedState;
    }

    if(import.meta.env.DEV)console.log('🔄 Calculating fresh avatar state with latest data...');
    const user = authService.getCurrentUser();
    if (!user) return null;

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
    
    // CRITICAL: Read live step count from native service (same source as notification)
    let todaySteps = 0;
    try {
      const { default: nativeStepService } = await import('./nativeStepService.js');
      const rawSteps = await nativeStepService.getSteps();
      const todayDate = new Date().toISOString().split('T')[0];
      const stepBaseline = parseInt(await firestoreService.get('stepBaseline', authService.getCurrentUser()?.uid) || '0');
      const baselineDate = await firestoreService.get('stepBaselineDate', authService.getCurrentUser()?.uid);
      
      if (baselineDate === todayDate) {
        todaySteps = Math.max(0, rawSteps - stepBaseline);
      }
      console.log('🧬 Health Avatar: Native service steps today:', todaySteps);
    } catch (e) {
      console.warn('⚠️ Could not read from native service:', e);
    }
    
    const stepHistoryRaw = await firestoreService.get('stepHistory', authService.getCurrentUser()?.uid) || JSON.parse(localStorage.getItem('stepHistory') || '[]');
    console.log('🧬 Health Avatar loading stepHistory:', stepHistoryRaw);
    const stepHistoryArray = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : Object.values(stepHistoryRaw);
    
    // If we have today's live steps, update the array
    if (todaySteps > 0) {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayIndex = stepHistoryArray.findIndex(s => s.date === todayDate);
      if (todayIndex >= 0) {
        stepHistoryArray[todayIndex] = { date: todayDate, steps: todaySteps, timestamp: Date.now() };
      } else {
        stepHistoryArray.push({ date: todayDate, steps: todaySteps, timestamp: Date.now() });
      }
    }
    const foodLog = user.profile?.foodLog || JSON.parse(localStorage.getItem('foodLog') || '[]');
    const workoutHistory = await firestoreService.get('workoutHistory', authService.getCurrentUser()?.uid) || JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    const dnaAnalysis = await firestoreService.get('dnaAnalysis', authService.getCurrentUser()?.uid) || JSON.parse(localStorage.getItem('dnaAnalysis') || 'null');
    const sleepLog = await firestoreService.get('sleepLog', authService.getCurrentUser()?.uid) || JSON.parse(localStorage.getItem('sleepLog') || '[]');
    
    const last30DaysSteps = stepHistoryArray.slice(-30);
    console.log('🧬 Last 30 days steps:', last30DaysSteps);
    const totalSteps = last30DaysSteps.reduce((sum, entry) => sum + ((entry?.steps || entry) || 0), 0);
    const avgSteps = last30DaysSteps.length > 0 ? totalSteps / last30DaysSteps.length : 0;
    
    const last30DaysMs = 30 * 24 * 60 * 60 * 1000;
    const recentFoods = foodLog.filter(f => {
      const logTime = new Date(f.timestamp || f.date).getTime();
      return logTime >= Date.now() - last30DaysMs;
    });
    
    const recentWorkouts = workoutHistory.filter(w => {
      const workoutTime = new Date(w.timestamp || w.date).getTime();
      return workoutTime >= Date.now() - last30DaysMs;
    });
    
    if(import.meta.env.DEV)console.log('📊 Avatar Data Sources:', {
      stepDays: last30DaysSteps.length,
      totalSteps,
      avgSteps,
      foodLogs: recentFoods.length,
      workouts: recentWorkouts.length,
      hasDNA: !!dnaAnalysis,
      sleepLogs: sleepLog.length
    });
    
    const avatarData = {
      current: {
        score: currentScore,
        visuals: this.getAvatarVisuals(currentScore),
        age: user.profile.age || 30,
        dataBreakdown: {
          stepsDays: last30DaysSteps.length,
          todaySteps: todaySteps, // Live step count from native service (same as dashboard)
          avgDailySteps: Math.round(avgSteps),
          totalSteps: Math.round(totalSteps),
          foodLogsCount: recentFoods.length,
          workoutsCount: recentWorkouts.length,
          hasDNAAnalysis: !!dnaAnalysis,
          sleepLogsCount: sleepLog.length
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



