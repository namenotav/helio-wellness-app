const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { _ as __vitePreload, f as firestoreService, a as authService } from "./entry-1767948920134-index.js";
class HealthAvatarService {
  constructor() {
    this.avatarState = null;
    this.cachedState = null;
    this.cacheTimestamp = 0;
    this.cacheValidDuration = 0;
  }
  // Calculate avatar's health score (0-100) using REAL DATA
  async calculateHealthScore(userProfile, stats = {}) {
    const { age, weight, height, goalSteps } = userProfile || {};
    const { totalSteps = 0, totalDays = 0 } = stats;
    let score = 100;
    const factors = [];
    const scoreBreakdown = [];
    if (height && weight && height >= 100 && height <= 250 && weight >= 30 && weight <= 300) {
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);
      if (isNaN(bmi) || !isFinite(bmi)) {
        factors.push("⚠️ BMI calculation error - check profile data");
      } else if (bmi < 18.5) {
        score -= 15;
        factors.push("⚠️ BMI too low");
        scoreBreakdown.push({ factor: "BMI (Underweight)", points: -15, icon: "⚠️" });
      } else if (bmi > 25 && bmi < 30) {
        score -= 10;
        factors.push("⚠️ Overweight BMI");
        scoreBreakdown.push({ factor: "BMI (Overweight)", points: -10, icon: "⚠️" });
      } else if (bmi >= 30) {
        score -= 25;
        factors.push("🚨 Obese BMI");
        scoreBreakdown.push({ factor: "BMI (Obese)", points: -25, icon: "🚨" });
      } else {
        factors.push("✅ Healthy BMI");
        scoreBreakdown.push({ factor: "BMI (Healthy)", points: 0, icon: "✅" });
      }
    } else {
      factors.push("⚠️ BMI unavailable - complete profile");
    }
    (await __vitePreload(async () => {
      const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a4);
      return { default: __vite_default__ };
    }, true ? __vite__mapDeps([0,1]) : void 0)).default;
    let todaySteps = 0;
    try {
      const { Preferences } = await __vitePreload(async () => {
        const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
        return { Preferences: Preferences2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const { value: androidData } = await Preferences.get({ key: "wellnessai_stepHistory" });
      if (androidData) {
        const stepHistory2 = JSON.parse(androidData);
        const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const todayEntry = stepHistory2.find((entry) => entry.date === todayDate);
        todaySteps = todayEntry?.steps || 0;
        console.log("🧬 Health Avatar: Today steps from Android storage:", todaySteps);
      }
    } catch (e) {
      console.warn("⚠️ Could not read today steps from Android storage:", e);
    }
    let stepHistoryRaw = await firestoreService.get("stepHistory", authService.getCurrentUser()?.uid);
    if (!stepHistoryRaw || typeof stepHistoryRaw === "string") {
      try {
        stepHistoryRaw = JSON.parse(localStorage.getItem("stepHistory") || "[]");
      } catch (e) {
        console.warn("⚠️ Could not parse stepHistory from localStorage:", e);
        stepHistoryRaw = [];
      }
    }
    const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : [];
    const stepHistoryWithToday = [...stepHistory];
    if (todaySteps > 0) {
      const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const todayIndex = stepHistoryWithToday.findIndex((s) => s.date === todayDate);
      if (todayIndex >= 0) {
        stepHistoryWithToday[todayIndex] = { date: todayDate, steps: todaySteps };
      } else {
        stepHistoryWithToday.push({ date: todayDate, steps: todaySteps });
      }
    }
    const last30Days = stepHistoryWithToday.slice(-30);
    const totalRecentSteps = last30Days.reduce((sum, entry) => sum + (entry?.steps || entry || 0), 0);
    const avgSteps = last30Days.length > 0 ? totalRecentSteps / last30Days.length : 0;
    const stepGoal = goalSteps || 1e4;
    const suspiciousStepDays = last30Days.filter((entry) => {
      const steps = entry?.steps || entry || 0;
      return steps > 4e4;
    }).length;
    if (suspiciousStepDays > 0) {
      factors.push(`⚠️ ${suspiciousStepDays} days with suspicious step counts (>40k)`);
    }
    if (avgSteps < stepGoal * 0.5) {
      score -= 20;
      factors.push("🚨 Very low activity");
      scoreBreakdown.push({ factor: "Daily Steps", points: -20, icon: "🚨" });
    } else if (avgSteps < stepGoal * 0.8) {
      score -= 10;
      factors.push("⚠️ Below step goal");
      scoreBreakdown.push({ factor: "Daily Steps", points: -10, icon: "⚠️" });
    } else if (avgSteps >= stepGoal) {
      score += 5;
      factors.push("✅ Meeting step goal");
      scoreBreakdown.push({ factor: "Daily Steps", points: 5, icon: "✅" });
    } else {
      scoreBreakdown.push({ factor: "Daily Steps", points: 0, icon: "📊" });
    }
    let foodLog = [];
    try {
      let foodLogRaw = await firestoreService.get("foodLog", authService.getCurrentUser()?.uid);
      if (!foodLogRaw || typeof foodLogRaw === "string") {
        const localData = localStorage.getItem("foodLog");
        foodLogRaw = localData ? JSON.parse(localData) : [];
      }
      foodLog = Array.isArray(foodLogRaw) ? foodLogRaw : [];
    } catch (e) {
      foodLog = [];
    }
    const last30DaysMs = 30 * 24 * 60 * 60 * 1e3;
    const recentFoods = foodLog.filter((f) => {
      try {
        const logTime = new Date(f.timestamp || f.date).getTime();
        return logTime >= Date.now() - last30DaysMs;
      } catch (e) {
        return false;
      }
    });
    recentFoods.filter((f) => f && f.safety === "danger").length;
    const warningFoods = recentFoods.filter((f) => f && f.safety === "warning").length;
    const safeFoods = recentFoods.filter((f) => f && f.safety === "safe").length;
    const userAllergies = userProfile.allergies || [];
    const relevantDangerFoods = recentFoods.filter((f) => {
      if (!f || f.safety !== "danger") return false;
      if (userAllergies.length === 0) return false;
      return f.allergens?.some((allergen) => userAllergies.includes(allergen));
    }).length;
    const foodPenalty = relevantDangerFoods * 5 + warningFoods * 2;
    score -= foodPenalty;
    if (relevantDangerFoods > 5) {
      factors.push("🚨 Too many allergen exposures");
    }
    if (safeFoods > 30) {
      score += 5;
      factors.push("✅ Good diet choices");
      scoreBreakdown.push({ factor: "Food Quality", points: 5 - foodPenalty, icon: "🍽️" });
    } else if (foodPenalty > 0) {
      scoreBreakdown.push({ factor: "Food Quality", points: -foodPenalty, icon: "⚠️" });
    } else {
      scoreBreakdown.push({ factor: "Food Quality", points: 0, icon: "🍽️" });
    }
    let workoutHistory = [];
    try {
      let workoutHistoryRaw = await firestoreService.get("workoutHistory", authService.getCurrentUser()?.uid);
      if (!workoutHistoryRaw || typeof workoutHistoryRaw === "string") {
        const localData = localStorage.getItem("workoutHistory");
        workoutHistoryRaw = localData ? JSON.parse(localData) : [];
      }
      workoutHistory = Array.isArray(workoutHistoryRaw) ? workoutHistoryRaw : [];
    } catch (e) {
      workoutHistory = [];
    }
    const recentWorkouts = workoutHistory.filter((w) => {
      const workoutTime = new Date(w.timestamp || w.date).getTime();
      return workoutTime >= Date.now() - last30DaysMs;
    });
    if (recentWorkouts.length >= 12) {
      score += 10;
      factors.push("✅ Excellent workout routine");
      scoreBreakdown.push({ factor: "Workouts", points: 10, icon: "💪" });
    } else if (recentWorkouts.length >= 8) {
      score += 5;
      factors.push("✅ Good workout consistency");
      scoreBreakdown.push({ factor: "Workouts", points: 5, icon: "💪" });
    } else if (recentWorkouts.length < 4) {
      score -= 10;
      factors.push("⚠️ Low workout frequency");
      scoreBreakdown.push({ factor: "Workouts", points: -10, icon: "⚠️" });
    } else {
      scoreBreakdown.push({ factor: "Workouts", points: 0, icon: "💪" });
    }
    let loginHistory = [];
    try {
      let loginHistoryRaw = await firestoreService.get("loginHistory", authService.getCurrentUser()?.uid);
      if (!loginHistoryRaw || typeof loginHistoryRaw === "string") {
        const localData = localStorage.getItem("loginHistory");
        loginHistoryRaw = localData ? JSON.parse(localData) : [];
      }
      loginHistory = Array.isArray(loginHistoryRaw) ? loginHistoryRaw : [];
    } catch (e) {
      loginHistory = [];
    }
    const recentLogins = loginHistory.filter((l) => {
      const loginTime = new Date(l.timestamp || l.date).getTime();
      return loginTime >= Date.now() - last30DaysMs;
    });
    const activeDays = new Set(recentLogins.map((l) => new Date(l.timestamp || l.date).toDateString())).size;
    if (activeDays >= 20) {
      score += 5;
      factors.push("✅ Very engaged with health tracking");
      scoreBreakdown.push({ factor: "Engagement", points: 5, icon: "📱" });
    } else if (activeDays < 10) {
      score -= 5;
      factors.push("⚠️ Low engagement");
      scoreBreakdown.push({ factor: "Engagement", points: -5, icon: "⚠️" });
    } else {
      scoreBreakdown.push({ factor: "Engagement", points: 0, icon: "📱" });
    }
    let dnaAnalysis = null;
    try {
      let dnaAnalysisRaw = await firestoreService.get("dnaAnalysis", authService.getCurrentUser()?.uid);
      if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === "string" || !dnaAnalysisRaw.traits) {
        try {
          const { value: prefsData } = await (await __vitePreload(async () => {
            const { Preferences } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
            return { Preferences };
          }, true ? __vite__mapDeps([0,1]) : void 0)).Preferences.get({ key: "dna_genetic_data" });
          if (prefsData) {
            dnaAnalysisRaw = JSON.parse(prefsData);
            if (false) ;
          }
        } catch (prefsError) {
          if (false) ;
        }
        if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === "string") {
          const localData = localStorage.getItem("dnaAnalysis");
          if (localData) {
            try {
              dnaAnalysisRaw = JSON.parse(localData);
            } catch (jsonError) {
              try {
                const { default: encryptionService } = await __vitePreload(async () => {
                  const { default: encryptionService2 } = await import("./chunk-1767948920149-encryptionService.js");
                  return { default: encryptionService2 };
                }, true ? [] : void 0);
                const decrypted = await encryptionService.decrypt(localData);
                dnaAnalysisRaw = JSON.parse(decrypted);
                if (false) ;
              } catch (decryptError) {
                if (false) ;
                dnaAnalysisRaw = null;
              }
            }
          }
        }
      }
      dnaAnalysis = dnaAnalysisRaw;
    } catch (e) {
      dnaAnalysis = null;
    }
    if (dnaAnalysis) {
      const traits = dnaAnalysis.traits || [];
      if (traits.length > 0) {
        const highRisks = traits.filter((t) => t.risk === "high").length;
        const mediumRisks = traits.filter((t) => t.risk === "medium").length;
        score -= highRisks * 3;
        score -= mediumRisks * 1;
        if (highRisks > 0) {
          factors.push(`🧬 ${highRisks} high genetic risks`);
        }
      }
    }
    let sleepLog = [];
    try {
      let sleepLogRaw = await firestoreService.get("sleepLog", authService.getCurrentUser()?.uid);
      if (!sleepLogRaw || typeof sleepLogRaw === "string") {
        const localData = localStorage.getItem("sleepLog");
        sleepLogRaw = localData ? JSON.parse(localData) : [];
      }
      sleepLog = Array.isArray(sleepLogRaw) ? sleepLogRaw : [];
    } catch (e) {
      sleepLog = [];
    }
    const recentSleep = sleepLog.filter((s) => {
      const sleepTime = new Date(s.date).getTime();
      return sleepTime >= Date.now() - last30DaysMs;
    });
    let avgSleepHours = null;
    if (recentSleep.length > 0) {
      avgSleepHours = recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length;
    }
    if (avgSleepHours === null) {
      factors.push("💡 Add sleep tracking for more accuracy");
      scoreBreakdown.push({ factor: "Sleep Tracking", points: 0, icon: "💡" });
    } else if (avgSleepHours < 6) {
      score -= 15;
      factors.push("🚨 Severe sleep deprivation");
      scoreBreakdown.push({ factor: "Sleep Quality", points: -15, icon: "🚨" });
    } else if (avgSleepHours < 7) {
      score -= 8;
      factors.push("⚠️ Insufficient sleep");
      scoreBreakdown.push({ factor: "Sleep Quality", points: -8, icon: "⚠️" });
    } else if (avgSleepHours >= 7 && avgSleepHours <= 9) {
      score += 5;
      factors.push("✅ Good sleep duration");
      scoreBreakdown.push({ factor: "Sleep Quality", points: 5, icon: "✅" });
    } else {
      scoreBreakdown.push({ factor: "Sleep Quality", points: 0, icon: "😴" });
    }
    if (userProfile.medicalConditions && userProfile.medicalConditions.length > 0) {
      const severeConditions = ["diabetes", "heart-disease", "hypertension"];
      const hasSevere = userProfile.medicalConditions.some((c) => severeConditions.includes(c));
      if (hasSevere) {
        score -= 15;
        factors.push("🚨 Severe medical condition");
      } else {
        score -= userProfile.medicalConditions.length * 3;
        factors.push(`⚠️ ${userProfile.medicalConditions.length} medical conditions`);
      }
    }
    if (userProfile.smoker) {
      score -= 20;
      factors.push("🚨 Smoker");
    }
    if (userProfile.alcoholFrequency === "daily" || userProfile.alcoholFrequency === "regular") {
      score -= 10;
      factors.push("⚠️ Regular alcohol consumption");
    }
    if (userProfile.stressLevel === "very-high") {
      score -= 12;
      factors.push("🚨 Very high stress");
    } else if (userProfile.stressLevel === "high") {
      score -= 6;
      factors.push("⚠️ High stress");
    }
    if (userProfile.waterIntake === "low") {
      score -= 5;
      factors.push("⚠️ Low water intake");
    } else if (userProfile.waterIntake === "excellent") {
      score += 3;
      factors.push("✅ Excellent hydration");
    }
    if (userProfile.familyHistory && userProfile.familyHistory.length > 0) {
      score -= userProfile.familyHistory.length * 2;
      factors.push(`👨‍👩‍👧‍👦 ${userProfile.familyHistory.length} family history risks`);
    }
    if (userProfile.fitnessLevel === "athlete" || userProfile.fitnessLevel === "very-active") {
      score += 10;
      factors.push("✅ Excellent fitness level");
    } else if (userProfile.fitnessLevel === "sedentary") {
      score -= 8;
      factors.push("⚠️ Sedentary lifestyle");
    }
    const finalScore = Math.max(0, Math.min(100, score));
    return { score: finalScore, breakdown: scoreBreakdown, factors };
  }
  // Project future health score based on current habits
  projectFutureHealth(currentScore, years) {
    let declineRate = 0;
    if (currentScore >= 80) {
      declineRate = 2;
    } else if (currentScore >= 60) {
      declineRate = 5;
    } else {
      declineRate = 10;
    }
    const futureScore = Math.max(0, currentScore - declineRate * years);
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
    let ageModifier = 0;
    if (healthScore < 40) ageModifier = 15;
    else if (healthScore < 60) ageModifier = 8;
    else if (healthScore > 85) ageModifier = -5;
    return actualAge + ageModifier;
  }
  // Generate health warnings
  generateWarnings(futureScore) {
    const warnings = [];
    if (futureScore < 30) {
      warnings.push("🚨 Critical: High risk of chronic disease");
      warnings.push("⚠️ Energy levels will be severely impacted");
      warnings.push("💔 Heart health at serious risk");
    } else if (futureScore < 50) {
      warnings.push("⚠️ Moderate health decline expected");
      warnings.push("😓 Energy and mood will decrease");
      warnings.push("📉 Fitness levels declining");
    } else if (futureScore < 70) {
      warnings.push("⚡ Room for improvement");
      warnings.push("🎯 Could optimize health further");
    }
    return warnings;
  }
  // Generate improvement suggestions
  generateImprovements(currentScore, futureScore) {
    const improvements = [];
    if (futureScore < currentScore) {
      improvements.push("💪 Increase daily activity by 3000 steps");
      improvements.push("🥗 Add 2 more servings of vegetables daily");
      improvements.push("💤 Get 30 minutes more sleep each night");
      improvements.push("🧘 Practice 10 minutes of meditation");
    }
    return improvements;
  }
  // Get avatar visual properties
  getAvatarVisuals(healthScore) {
    return {
      skinTone: healthScore > 70 ? "#FFD4A3" : healthScore > 50 ? "#E8C4A0" : "#D4B898",
      energyLevel: healthScore > 70 ? "high" : healthScore > 50 ? "medium" : "low",
      muscleTone: healthScore > 75 ? "toned" : healthScore > 50 ? "average" : "low",
      posture: healthScore > 70 ? "upright" : healthScore > 50 ? "slight-slouch" : "slouched",
      eyeBrightness: healthScore > 75 ? "bright" : healthScore > 50 ? "average" : "dull",
      hairQuality: healthScore > 70 ? "shiny" : healthScore > 50 ? "average" : "dull",
      glowEffect: healthScore > 80 ? "strong" : healthScore > 60 ? "subtle" : "none",
      overallMood: healthScore > 75 ? "😊" : healthScore > 50 ? "😐" : "😔"
    };
  }
  // Generate full avatar state with REAL DATA breakdown
  async getAvatarState(forceRefresh = false) {
    const nowTimestamp = Date.now();
    if (!forceRefresh && this.cachedState && nowTimestamp - this.cacheTimestamp < this.cacheValidDuration) {
      return this.cachedState;
    }
    const user = authService.getCurrentUser();
    if (!user) return null;
    const now = /* @__PURE__ */ new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthName = now.toLocaleString("en-US", { month: "long" });
    const scoreResult = await this.calculateHealthScore(user.profile, user.stats);
    const currentScore = scoreResult.score;
    const scoreBreakdown = scoreResult.breakdown;
    scoreResult.factors;
    (await __vitePreload(async () => {
      const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a4);
      return { default: __vite_default__ };
    }, true ? __vite__mapDeps([0,1]) : void 0)).default;
    let todaySteps = 0;
    const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let stepHistoryRaw = null;
    try {
      const { Preferences } = await __vitePreload(async () => {
        const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
        return { Preferences: Preferences2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const { value: androidData } = await Preferences.get({ key: "wellnessai_stepHistory" });
      if (androidData) {
        stepHistoryRaw = JSON.parse(androidData);
        console.log("🧬 Health Avatar loaded from Android CapacitorStorage:", stepHistoryRaw?.length, "entries");
      }
    } catch (e) {
      console.warn("⚠️ Could not read from Android CapacitorStorage:", e);
    }
    if (!stepHistoryRaw) {
      stepHistoryRaw = await firestoreService.get("stepHistory", authService.getCurrentUser()?.uid);
      if (stepHistoryRaw) {
        console.log("🧬 Fallback to Firestore stepHistory:", stepHistoryRaw?.length, "entries");
      }
    }
    if (!stepHistoryRaw || typeof stepHistoryRaw === "string") {
      try {
        stepHistoryRaw = JSON.parse(localStorage.getItem("stepHistory") || "[]");
        console.log("🧬 Fallback to localStorage stepHistory:", stepHistoryRaw?.length, "entries");
      } catch (e) {
        console.warn("⚠️ Could not parse stepHistory from localStorage:", e);
        stepHistoryRaw = [];
      }
    }
    const stepHistoryArray = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : [];
    const todayEntry = stepHistoryArray.find((s) => s.date === todayDate);
    todaySteps = todayEntry?.steps || 0;
    console.log("🧬 Health Avatar: Today steps from history:", todaySteps);
    let foodLog = [];
    try {
      let foodLogRaw = user.profile?.foodLog || await firestoreService.get("foodLog", authService.getCurrentUser()?.uid);
      if (!foodLogRaw || typeof foodLogRaw === "string") {
        const localData = localStorage.getItem("foodLog");
        foodLogRaw = localData ? JSON.parse(localData) : [];
      }
      foodLog = Array.isArray(foodLogRaw) ? foodLogRaw : [];
    } catch (e) {
      console.warn("⚠️ Could not load foodLog:", e);
      foodLog = [];
    }
    let workoutHistory = [];
    try {
      let workoutHistoryRaw = await firestoreService.get("workoutHistory", authService.getCurrentUser()?.uid);
      if (!workoutHistoryRaw || typeof workoutHistoryRaw === "string") {
        const localData = localStorage.getItem("workoutHistory");
        workoutHistoryRaw = localData ? JSON.parse(localData) : [];
      }
      workoutHistory = Array.isArray(workoutHistoryRaw) ? workoutHistoryRaw : [];
    } catch (e) {
      console.warn("⚠️ Could not load workoutHistory:", e);
      workoutHistory = [];
    }
    let dnaAnalysis = null;
    try {
      let dnaAnalysisRaw = await firestoreService.get("dnaAnalysis", authService.getCurrentUser()?.uid);
      if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === "string" || !dnaAnalysisRaw.traits) {
        try {
          const { value: prefsData } = await (await __vitePreload(async () => {
            const { Preferences } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
            return { Preferences };
          }, true ? __vite__mapDeps([0,1]) : void 0)).Preferences.get({ key: "dna_genetic_data" });
          if (prefsData) {
            dnaAnalysisRaw = JSON.parse(prefsData);
            if (false) ;
          }
        } catch (prefsError) {
          if (false) ;
        }
        if (!dnaAnalysisRaw || typeof dnaAnalysisRaw === "string") {
          const localData = localStorage.getItem("dnaAnalysis");
          if (localData) {
            try {
              dnaAnalysisRaw = JSON.parse(localData);
            } catch (jsonError) {
              try {
                const { default: encryptionService } = await __vitePreload(async () => {
                  const { default: encryptionService2 } = await import("./chunk-1767948920149-encryptionService.js");
                  return { default: encryptionService2 };
                }, true ? [] : void 0);
                const decrypted = await encryptionService.decrypt(localData);
                dnaAnalysisRaw = JSON.parse(decrypted);
                if (false) ;
              } catch (decryptError) {
                if (false) ;
                dnaAnalysisRaw = null;
              }
            }
          }
        }
      }
      dnaAnalysis = dnaAnalysisRaw;
    } catch (e) {
      console.warn("⚠️ Could not load dnaAnalysis:", e);
      dnaAnalysis = null;
    }
    let sleepLog = [];
    try {
      let sleepLogRaw = await firestoreService.get("sleepLog", authService.getCurrentUser()?.uid);
      if (!sleepLogRaw || typeof sleepLogRaw === "string") {
        const localData = localStorage.getItem("sleepLog");
        sleepLogRaw = localData ? JSON.parse(localData) : [];
      }
      sleepLog = Array.isArray(sleepLogRaw) ? sleepLogRaw : [];
    } catch (e) {
      console.warn("⚠️ Could not load sleepLog:", e);
      sleepLog = [];
    }
    const thisMonthSleep = sleepLog.filter((s) => {
      const sleepDate = new Date(s.timestamp || s.date);
      return sleepDate.getMonth() === currentMonth && sleepDate.getFullYear() === currentYear;
    });
    const thisMonthSteps = stepHistoryArray.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    console.log("🧬 Current month steps (" + monthName + "):", thisMonthSteps);
    const totalMonthlySteps = thisMonthSteps.reduce((sum, entry) => {
      const steps = typeof entry === "object" ? entry?.steps : entry;
      const validSteps = typeof steps === "number" && !isNaN(steps) ? steps : 0;
      return sum + validSteps;
    }, 0);
    const avgSteps = thisMonthSteps.length > 0 ? totalMonthlySteps / thisMonthSteps.length : 0;
    const thisMonthFoods = foodLog.filter((f) => {
      const logDate = new Date(f.timestamp || f.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });
    const thisMonthWorkouts = workoutHistory.filter((w) => {
      const workoutDate = new Date(w.timestamp || w.date);
      return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
    });
    let completenessScore = 0;
    let maxCompleteness = 7;
    if (user.profile.height && user.profile.weight && user.profile.height >= 100 && user.profile.weight >= 30) completenessScore++;
    if (thisMonthSteps.length >= 5) completenessScore++;
    if (thisMonthFoods.length >= 5) completenessScore++;
    if (thisMonthWorkouts.length >= 2) completenessScore++;
    if (thisMonthSleep.length >= 5) completenessScore++;
    if (dnaAnalysis && (dnaAnalysis.traits || dnaAnalysis.analysis)) completenessScore++;
    if (user.profile.medicalConditions || user.profile.fitnessLevel) completenessScore++;
    const dataCompleteness = Math.round(completenessScore / maxCompleteness * 100);
    const emergencyWarnings = [];
    const { height, weight } = user.profile;
    if (height && weight && height >= 100 && height <= 250 && weight >= 30 && weight <= 300) {
      const bmi = weight / (height / 100) ** 2;
      if (bmi < 16) {
        emergencyWarnings.push({
          severity: "critical",
          icon: "🚨",
          title: "Severely Underweight BMI",
          message: "Your BMI is dangerously low. Consult a doctor immediately.",
          action: "See healthcare provider urgently"
        });
      } else if (bmi > 40) {
        emergencyWarnings.push({
          severity: "critical",
          icon: "🚨",
          title: "Severely Obese BMI",
          message: "Your BMI is at a dangerous level. Medical consultation recommended.",
          action: "Consult doctor for weight management"
        });
      }
    }
    const last7Days = stepHistoryArray.slice(-7);
    const totalLast7Steps = last7Days.reduce((sum, entry) => sum + (entry?.steps || entry || 0), 0);
    if (last7Days.length >= 7 && totalLast7Steps === 0) {
      emergencyWarnings.push({
        severity: "warning",
        icon: "⚠️",
        title: "No Activity Detected",
        message: "No steps recorded for 7 days. Are you okay?",
        action: "Check in with support or start light activity"
      });
    }
    const last7DaysSleep = thisMonthSleep.slice(-7);
    const severeSleepDays = last7DaysSleep.filter((s) => s.hours < 3).length;
    if (severeSleepDays >= 5) {
      emergencyWarnings.push({
        severity: "critical",
        icon: "🚨",
        title: "Severe Sleep Deprivation",
        message: "Less than 3 hours sleep for multiple nights is a health emergency.",
        action: "Seek medical help immediately"
      });
    }
    if (user.profile.lastWeightCheck && user.profile.weight) {
      const weightDiff = Math.abs(user.profile.weight - user.profile.lastWeightCheck);
      if (weightDiff > 9) {
        emergencyWarnings.push({
          severity: "warning",
          icon: "⚠️",
          title: "Suspicious Weight Change",
          message: `Weight changed by ${weightDiff.toFixed(1)} kg recently. Please verify measurement.`,
          action: "Re-check weight or consult doctor if accurate"
        });
      }
    }
    const suggestions = [];
    if (thisMonthSleep.length < 5) {
      suggestions.push({
        icon: "😴",
        action: "Track sleep for 5 nights",
        impact: "+10 points",
        reason: "Currently missing sleep data"
      });
    }
    if (thisMonthFoods.length < 30) {
      const needed = Math.min(30 - thisMonthFoods.length, 10);
      suggestions.push({
        icon: "🍽️",
        action: `Log ${needed} more healthy meals`,
        impact: `+${Math.min(needed * 2, 10)} points`,
        reason: "Good diet boosts health score"
      });
    }
    if (thisMonthWorkouts.length < 8) {
      const needed = 8 - thisMonthWorkouts.length;
      suggestions.push({
        icon: "💪",
        action: `Add ${needed} more workouts this month`,
        impact: "+5 to +10 points",
        reason: "Consistency is key to fitness"
      });
    }
    if (height && weight && height >= 100 && weight >= 30) {
      const bmi = weight / (height / 100) ** 2;
      if (bmi > 25 && bmi < 30) {
        const targetWeight = 25 * (height / 100) ** 2;
        const loseWeight = weight - targetWeight;
        suggestions.push({
          icon: "⚖️",
          action: `Lose ${loseWeight.toFixed(1)} kg to reach healthy BMI`,
          impact: "+10 points",
          reason: `Current BMI: ${bmi.toFixed(1)} (overweight)`
        });
      } else if (bmi >= 30) {
        suggestions.push({
          icon: "⚖️",
          action: "Work on weight management with doctor",
          impact: "+25 points",
          reason: `Current BMI: ${bmi.toFixed(1)} (obese)`
        });
      }
    }
    const userStepGoal = user.profile?.goalSteps || 1e4;
    if (avgSteps < userStepGoal) {
      const needed = Math.round(userStepGoal - avgSteps);
      suggestions.push({
        icon: "👟",
        action: `Increase daily steps by ${needed.toLocaleString()}`,
        impact: "+5 to +20 points",
        reason: "Currently below step goal"
      });
    }
    const topSuggestions = suggestions.slice(0, 3);
    const completenessMultiplier = 0.5 + dataCompleteness / 200;
    const adjustedScore = Math.round(currentScore * completenessMultiplier);
    const avatarData = {
      current: {
        score: adjustedScore,
        // 🔥 Use adjusted score that accounts for data completeness
        rawScore: currentScore,
        // Keep original for reference
        scoreBreakdown,
        // NEW: Detailed factor breakdown
        emergencyWarnings,
        // NEW: Critical health alerts
        suggestions: topSuggestions,
        // NEW: Personalized improvement suggestions
        visuals: this.getAvatarVisuals(adjustedScore),
        // 🔥 Use adjusted score for visuals too
        age: user.profile.age || 30,
        dataCompleteness,
        // NEW: Data quality indicator
        dataBreakdown: {
          monthName,
          // Current month name for display
          currentYear,
          // Current year for display
          stepsDays: thisMonthSteps.length,
          todaySteps,
          // Live step count from native service (same as dashboard)
          avgDailySteps: Math.round(avgSteps),
          totalMonthlySteps: Math.round(totalMonthlySteps),
          // Total steps this month
          stepHistory: thisMonthSteps,
          // Current month history only
          foodLogsCount: thisMonthFoods.length,
          workoutsCount: thisMonthWorkouts.length,
          hasDNAAnalysis: !!(dnaAnalysis && (dnaAnalysis.traits || dnaAnalysis.analysis)),
          sleepLogsCount: thisMonthSleep.length
        }
      },
      future1Year: this.projectFutureHealth(adjustedScore, 1),
      future5Years: this.projectFutureHealth(adjustedScore, 5),
      future10Years: this.projectFutureHealth(adjustedScore, 10)
    };
    this.cachedState = avatarData;
    this.cacheTimestamp = now;
    return avatarData;
  }
  // Get cached state synchronously (no await) for instant loading
  getCachedState() {
    const now = Date.now();
    if (this.cachedState && now - this.cacheTimestamp < this.cacheValidDuration) {
      return this.cachedState;
    }
    return null;
  }
  // Clear cache when user data changes (call after profile updates, food logs, etc.)
  clearCache() {
    this.cachedState = null;
    this.cacheTimestamp = 0;
  }
  // Simulate impact of a choice on avatar
  simulateChoice(choiceType, choiceData) {
    const impacts = {
      "fast-food": { score: -5, message: "Avatar looks tired, skin duller" },
      "healthy-meal": { score: 3, message: "Avatar glows, more energetic" },
      "exercise": { score: 5, message: "Avatar becomes more toned" },
      "skipped-workout": { score: -3, message: "Avatar loses muscle tone" },
      "good-sleep": { score: 4, message: "Avatar looks refreshed" },
      "poor-sleep": { score: -4, message: "Avatar has dark circles" }
    };
    return impacts[choiceType] || { score: 0, message: "No change" };
  }
}
const healthAvatarService = new HealthAvatarService();
export {
  healthAvatarService as default,
  healthAvatarService
};
