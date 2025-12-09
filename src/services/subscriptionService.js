// Subscription Management Service
// Handles user plan, feature access, and paywalls

class SubscriptionService {
  constructor() {
    this.plans = {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        features: {
          basicTracking: 'very_basic', // Only steps and water
          stepCounter: true,
          foodScanner: 'limited',
          meditation: false,
          aiVoiceCoach: 'limited', // 5 messages per day
          waterTracking: true,
          // LOCKED
          dnaAnalysis: false,
          socialBattles: 'basic', // FREE: Friend connections, basic challenges | PREMIUM: Battles with stakes
          insuranceRewards: false,
          mealAutomation: false,
          healthAvatar: false,
          arScanner: false,
          emergencyPanel: false,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: false,
          heartRate: false,
          sleepTracking: false,
          workouts: false,
          breathing: false,
          pdfExport: false
        },
        limits: {
          aiMessages: 5,
          foodScans: 3,
          workouts: 0
        }
      },
      premium_monthly: {
        id: 'premium_monthly',
        name: 'Premium',
        price: 9.99,
        billing: 'monthly',
        features: {
          // EVERYTHING UNLOCKED
          basicTracking: true,
          stepCounter: true,
          foodScanner: true,
          meditation: true,
          waterTracking: true,
          aiVoiceCoach: 'unlimited',
          dnaAnalysis: true,
          socialBattles: true,
          insuranceRewards: false, // Coming soon
          mealAutomation: true,
          healthAvatar: true,
          arScanner: true,
          emergencyPanel: true,
          appleHealthSync: false, // Coming soon
          wearableSync: false, // Coming soon
          exportReports: false, // Coming soon
          heartRate: true,
          sleepTracking: true,
          workouts: true,
          breathing: true,
          pdfExport: false
        },
        limits: {
          aiMessages: 999999,
          foodScans: 999999,
          workouts: 999999
        }
      },
      premium_yearly: {
        id: 'premium_yearly',
        name: 'Premium',
        price: 99.00,
        billing: 'yearly',
        features: {
          // EVERYTHING UNLOCKED (Same as monthly, better price)
          basicTracking: true,
          stepCounter: true,
          foodScanner: true,
          meditation: true,
          waterTracking: true,
          aiVoiceCoach: 'unlimited',
          dnaAnalysis: true,
          socialBattles: true,
          insuranceRewards: false, // Coming soon
          mealAutomation: true,
          healthAvatar: true,
          arScanner: true,
          emergencyPanel: true,
          appleHealthSync: false, // Coming soon
          wearableSync: false, // Coming soon
          exportReports: false, // Coming soon
          heartRate: true,
          sleepTracking: true,
          workouts: true,
          breathing: true,
          pdfExport: false
        },
        limits: {
          aiMessages: 999999,
          foodScans: 999999,
          workouts: 999999
        }
      }
    };
  }

  // Get current user's subscription plan
  getCurrentPlan() {
    const planId = localStorage.getItem('subscription_plan') || 'free';
    return this.plans[planId] || this.plans.free;
  }

  // Check if user has access to a feature
  hasAccess(featureName) {
    // Check if developer mode is active
    try {
      const devMode = localStorage.getItem('helio_dev_mode') === 'true';
      if (devMode) {
        if(import.meta.env.DEV)console.log(`✅ Dev mode: Granting access to ${featureName}`);
        return true; // Developer mode grants all access
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Dev mode check error:', error);
    }

    const plan = this.getCurrentPlan();
    return plan.features[featureName] === true || plan.features[featureName] === 'unlimited';
  }

  // Check if user has reached their limit for a feature
  checkLimit(featureName) {
    // Check if developer mode is active
    try {
      const devMode = localStorage.getItem('helio_dev_mode') === 'true';
      if (devMode) {
        if(import.meta.env.DEV)console.log(`✅ Dev mode: Unlimited ${featureName}`);
        return { allowed: true, remaining: 999999, limit: 999999 }; // Developer mode = unlimited
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Dev mode check error:', error);
    }

    const plan = this.getCurrentPlan();
    const today = new Date().toISOString().split('T')[0];

    // Get usage count for today
    const usageKey = `${featureName}_usage_${today}`;
    const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');

    const limit = plan.limits[featureName];
    if (!limit) return { allowed: true, remaining: 999999 };

    return {
      allowed: currentUsage < limit,
      remaining: Math.max(0, limit - currentUsage),
      limit: limit
    };
  }

  // Increment usage count for a feature
  incrementUsage(featureName) {
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `${featureName}_usage_${today}`;
    const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');
    localStorage.setItem(usageKey, (currentUsage + 1).toString());
  }

  // Get upgrade message for locked features
  getUpgradeMessage(featureName) {
    const messages = {
      dnaAnalysis: '🧬 DNA Analysis requires Premium (£9.99/mo or £99/year)',
      socialBattles: '⚔️ Social Battles requires Premium (£9.99/mo or £99/year)',
      insuranceRewards: '💰 Insurance Rewards - Coming Soon',
      mealAutomation: '🍽️ Meal Automation requires Premium (£9.99/mo or £99/year)',
      healthAvatar: '🧬 Health Avatar requires Premium (£9.99/mo or £99/year)',
      arScanner: '📸 AR Scanner requires Premium (£9.99/mo or £99/year)',
      emergencyPanel: '🚨 Emergency Panel requires Premium (£9.99/mo or £99/year)',
      appleHealthSync: '❤️ Apple Health Sync - Coming Soon',
      wearableSync: '⌚ Wearable Integration - Coming Soon',
      exportReports: '📄 Export Reports - Coming Soon',
      meditation: '🧘 Meditation Library requires Premium (£9.99/mo or £99/year)',
      heartRate: '❤️ Heart Rate Tracking requires Premium (£9.99/mo or £99/year)',
      sleepTracking: '😴 Sleep Tracking requires Premium (£9.99/mo or £99/year)',
      workouts: '💪 Workout Library requires Premium (£9.99/mo or £99/year)',
      breathing: '🌬️ Breathing Exercises requires Premium (£9.99/mo or £99/year)',
      pdfExport: '📄 PDF Export - Coming Soon'
    };
    return messages[featureName] || 'This feature requires Premium (£9.99/mo or £99/year)';
  }

  // Get user's plan badge
  getPlanBadge() {
    const plan = this.getCurrentPlan();
    const badges = {
      free: '🆓 Free',
      premium_monthly: '⭐ Premium (Monthly)',
      premium_yearly: '💎 Premium (Yearly)'
    };
    return badges[plan.id] || badges.free;
  }

  // Check if user can upgrade
  canUpgradeTo(targetPlan) {
    const currentPlan = this.getCurrentPlan();
    const planHierarchy = { free: 0, premium_monthly: 1, premium_yearly: 1 };
    return planHierarchy[targetPlan] > planHierarchy[currentPlan.id];
  }

  // Show paywall modal
  showPaywall(featureName, onUpgradeClick) {
    const message = this.getUpgradeMessage(featureName);
    const plan = this.getCurrentPlan();

    // Check if feature is "coming soon"
    const comingSoonFeatures = ['insuranceRewards', 'appleHealthSync', 'wearableSync', 'exportReports'];
    
    return {
      show: true,
      message: message,
      currentPlan: plan.id,
      requiredPlan: 'premium',
      isComingSoon: comingSoonFeatures.includes(featureName),
      onUpgrade: onUpgradeClick
    };
  }
}

// Export singleton instance
const subscriptionService = new SubscriptionService();
export default subscriptionService;



