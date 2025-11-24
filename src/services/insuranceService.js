// Insurance Rewards Service - Track health data for premium discounts
import authService from './authService';
import healthAvatarService from './healthAvatarService';

class InsuranceService {
  constructor() {
    this.partnersDB = [
      {
        id: 'healthfirst',
        name: 'HealthFirst Insurance',
        maxDiscount: 40,
        requirements: {
          minHealthScore: 70,
          minMonthlySteps: 200000,
          regularCheckIns: true
        }
      },
      {
        id: 'wellness-partners',
        name: 'Wellness Partners Inc',
        maxDiscount: 35,
        requirements: {
          minHealthScore: 65,
          minMonthlySteps: 150000,
          foodLogging: true
        }
      },
      {
        id: 'fit-life',
        name: 'FitLife Insurance',
        maxDiscount: 30,
        requirements: {
          minHealthScore: 60,
          minMonthlySteps: 120000
        }
      }
    ];
  }

  // Calculate current discount eligibility
  async calculateDiscount(partnerId) {
    const user = authService.getCurrentUser();
    if (!user) return { eligible: false };

    const partner = this.partnersDB.find(p => p.id === partnerId);
    if (!partner) return { eligible: false };

    const avatarState = await healthAvatarService.getAvatarState();
    const healthScore = avatarState.current.score;
    
    // Calculate monthly steps
    const monthlySteps = this.calculateMonthlySteps(user.stats);
    
    // Check requirements
    const meetsHealthScore = healthScore >= partner.requirements.minHealthScore;
    const meetsStepGoal = monthlySteps >= partner.requirements.minMonthlySteps;
    const meetsCheckIns = partner.requirements.regularCheckIns ? 
      this.hasRegularCheckIns(user) : true;
    const meetsFoodLogging = partner.requirements.foodLogging ? 
      this.hasFoodLogging(user) : true;

    const eligible = meetsHealthScore && meetsStepGoal && meetsCheckIns && meetsFoodLogging;
    
    // Calculate actual discount percentage
    let discountPercent = 0;
    if (eligible) {
      discountPercent = this.calculateDiscountPercent(
        healthScore,
        monthlySteps,
        partner
      );
    }

    return {
      eligible,
      discountPercent,
      partner: partner.name,
      monthlySavings: this.estimateSavings(discountPercent),
      yearlySavings: this.estimateSavings(discountPercent) * 12,
      requirements: {
        healthScore: {
          current: healthScore,
          required: partner.requirements.minHealthScore,
          met: meetsHealthScore
        },
        monthlySteps: {
          current: monthlySteps,
          required: partner.requirements.minMonthlySteps,
          met: meetsStepGoal
        },
        checkIns: meetsCheckIns,
        foodLogging: meetsFoodLogging
      }
    };
  }

  // Calculate monthly steps
  calculateMonthlySteps(stats) {
    const dailySteps = stats.dailySteps || {};
    const last30Days = Object.keys(dailySteps).slice(-30);
    
    return last30Days.reduce((sum, date) => sum + (dailySteps[date] || 0), 0);
  }

  // Check for regular check-ins (weekly app usage)
  hasRegularCheckIns(user) {
    const lastActive = new Date(user.profile.lastActive || Date.now());
    const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
    
    return daysSinceActive < 7; // Active within last week
  }

  // Check for food logging
  hasFoodLogging(user) {
    const foodLog = user.profile.foodLog || [];
    const last30Days = foodLog.filter(log => {
      const logDate = new Date(log.timestamp);
      const daysSince = (Date.now() - logDate) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    
    return last30Days.length >= 20; // At least 20 food logs in 30 days
  }

  // Calculate discount percentage
  calculateDiscountPercent(healthScore, monthlySteps, partner) {
    const { maxDiscount, requirements } = partner;
    
    // Base discount (50% of max)
    let discount = maxDiscount * 0.5;
    
    // Bonus for exceeding health score
    const scoreBonus = Math.min(
      (healthScore - requirements.minHealthScore) / 100 * maxDiscount * 0.3,
      maxDiscount * 0.3
    );
    
    // Bonus for exceeding step goal
    const stepBonus = Math.min(
      ((monthlySteps - requirements.minMonthlySteps) / requirements.minMonthlySteps) * maxDiscount * 0.2,
      maxDiscount * 0.2
    );
    
    discount = Math.min(discount + scoreBonus + stepBonus, maxDiscount);
    
    return Math.round(discount);
  }

  // Estimate monthly savings
  estimateSavings(discountPercent) {
    // Average monthly insurance premium: $500
    const avgPremium = 500;
    return Math.round((avgPremium * discountPercent) / 100);
  }

  // Get all available partners
  getAvailablePartners() {
    return this.partnersDB;
  }

  // Generate verification report for insurer
  async generateVerificationReport() {
    const user = authService.getCurrentUser();
    if (!user) return null;

    const avatarState = await healthAvatarService.getAvatarState();
    
    return {
      userId: user.id,
      userName: user.name,
      reportDate: new Date().toISOString(),
      healthMetrics: {
        currentHealthScore: avatarState.current.score,
        totalDays: user.stats.totalDays,
        totalSteps: user.stats.totalSteps,
        avgDailySteps: user.stats.totalDays > 0 ? 
          Math.round(user.stats.totalSteps / user.stats.totalDays) : 0
      },
      activityLog: {
        last30DaysSteps: this.calculateMonthlySteps(user.stats),
        foodLogsCount: (user.profile.foodLog || []).length,
        meditationSessions: user.stats.totalSessions || 0,
        lastActive: user.profile.lastActive
      },
      verified: true,
      signature: this.generateVerificationSignature(user)
    };
  }

  // Generate cryptographic signature for report
  generateVerificationSignature(user) {
    // In real app: use proper crypto signing
    const data = `${user.id}-${Date.now()}`;
    return btoa(data); // Simple base64 for demo
  }

  // Apply for insurance discount
  async applyForDiscount(partnerId) {
    const discount = await this.calculateDiscount(partnerId);
    
    if (!discount.eligible) {
      return {
        success: false,
        message: 'Not eligible yet. Keep improving your health!',
        requirements: discount.requirements
      };
    }

    // Generate application
    const report = await this.generateVerificationReport();
    
    return {
      success: true,
      applicationId: 'APP-' + Date.now(),
      discountPercent: discount.discountPercent,
      monthlySavings: discount.monthlySavings,
      yearlySavings: discount.yearlySavings,
      report,
      message: `Application submitted! Estimated savings: $${discount.monthlySavings}/month`
    };
  }
}

export const insuranceService = new InsuranceService();
export default insuranceService;
