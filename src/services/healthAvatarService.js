// Health Avatar Service - 3D Avatar that shows future health state
import authService from './authService';

class HealthAvatarService {
  constructor() {
    this.avatarState = null;
  }

  // Calculate avatar's health score (0-100)
  calculateHealthScore(userProfile, stats) {
    const { age, weight, height, goalSteps } = userProfile;
    const { totalSteps, totalDays } = stats;

    let score = 100;

    // BMI factor
    if (height && weight) {
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);
      if (bmi < 18.5) score -= 15;
      else if (bmi > 25 && bmi < 30) score -= 10;
      else if (bmi >= 30) score -= 25;
    }

    // Activity factor
    const avgSteps = totalDays > 0 ? totalSteps / totalDays : 0;
    const stepGoal = goalSteps || 10000;
    if (avgSteps < stepGoal * 0.5) score -= 20;
    else if (avgSteps < stepGoal * 0.8) score -= 10;

    // Food quality factor (from food log)
    const foodLog = userProfile.foodLog || [];
    const recentDangerFoods = foodLog.slice(-10).filter(f => f.safety === 'danger').length;
    score -= (recentDangerFoods * 5);

    return Math.max(0, Math.min(100, score));
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

  // Generate full avatar state
  async getAvatarState() {
    const user = authService.getCurrentUser();
    if (!user) return null;

    const currentScore = this.calculateHealthScore(user.profile, user.stats);
    
    return {
      current: {
        score: currentScore,
        visuals: this.getAvatarVisuals(currentScore),
        age: user.profile.age || 30
      },
      future1Year: this.projectFutureHealth(currentScore, 1),
      future5Years: this.projectFutureHealth(currentScore, 5),
      future10Years: this.projectFutureHealth(currentScore, 10)
    };
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
