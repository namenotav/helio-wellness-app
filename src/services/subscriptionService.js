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
          basicTracking: true,
          stepCounter: true,
          foodScanner: 'limited',
          meditation: false,
          aiVoiceCoach: 'limited',
          waterTracking: true,
          // LOCKED
          dnaAnalysis: false,
          socialBattles: 'basic',
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
          aiMessages: 10,
          foodScans: 3,
          arScans: 0,
          workouts: 0
        }
      },
      essential: {
        id: 'essential',
        name: 'Essential',
        price: 4.99,
        billing: 'monthly',
        features: {
          basicTracking: true,
          stepCounter: true,
          foodScanner: true,
          meditation: true,
          waterTracking: true,
          aiVoiceCoach: true,
          dnaAnalysis: 'basic',
          socialBattles: true,
          insuranceRewards: false,
          mealAutomation: false,
          healthAvatar: 'weekly',
          arScanner: 'limited',
          emergencyPanel: true,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: false,
          heartRate: true,
          sleepTracking: true,
          workouts: true,
          breathing: true,
          pdfExport: false
        },
        limits: {
          aiMessages: 30,
          foodScans: 999999,
          arScans: 1,
          workouts: 999999
        }
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        price: 14.99,
        billing: 'monthly',
        features: {
          basicTracking: true,
          stepCounter: true,
          foodScanner: true,
          meditation: true,
          waterTracking: true,
          aiVoiceCoach: true,
          dnaAnalysis: true,
          socialBattles: true,
          insuranceRewards: false,
          mealAutomation: true,
          healthAvatar: 'daily',
          arScanner: true,
          emergencyPanel: true,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: true,
          heartRate: true,
          sleepTracking: true,
          workouts: true,
          breathing: true,
          pdfExport: true
        },
        limits: {
          aiMessages: 50,
          foodScans: 999999,
          arScans: 100,
          workouts: 999999
        }
      },
      vip: {
        id: 'vip',
        name: 'VIP',
        price: 29.99,
        billing: 'monthly',
        features: {
          basicTracking: true,
          stepCounter: true,
          foodScanner: true,
          meditation: true,
          waterTracking: true,
          aiVoiceCoach: 'unlimited',
          dnaAnalysis: true,
          socialBattles: true,
          insuranceRewards: false,
          mealAutomation: true,
          healthAvatar: 'realtime',
          arScanner: 'unlimited',
          emergencyPanel: true,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: true,
          heartRate: true,
          sleepTracking: true,
          workouts: true,
          breathing: true,
          pdfExport: true
        },
        limits: {
          aiMessages: 999999,
          foodScans: 999999,
          arScans: 999999,
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

  // Verify subscription with server (call on app launch)
  async verifySubscriptionWithServer(userId) {
    try {
      // Check if we verified recently (cache for 6 hours)
      const lastVerified = localStorage.getItem('subscription_last_verified');
      const cacheTime = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      
      if (lastVerified && Date.now() - parseInt(lastVerified) < cacheTime) {
        if(import.meta.env.DEV) console.log('✅ Using cached subscription status');
        return;
      }

      // Verify with server
      const API_URL = import.meta.env.VITE_API_URL || 'https://helio-wellness-app-production.up.railway.app';
      const response = await fetch(`${API_URL}/api/subscription/status/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify subscription');
      }

      const data = await response.json();
      
      // Update localStorage with server response
      if (data.isActive && data.plan !== 'free') {
        localStorage.setItem('subscription_plan', data.plan);
        localStorage.setItem('subscription_status', data.status);
        localStorage.setItem('subscription_period_end', data.currentPeriodEnd);
        if(import.meta.env.DEV) console.log(`✅ Subscription verified: ${data.plan} (${data.status})`);
      } else {
        // Subscription expired or inactive - downgrade to free
        localStorage.setItem('subscription_plan', 'free');
        localStorage.setItem('subscription_status', 'none');
        if(import.meta.env.DEV) console.log('⚠️ Subscription expired or inactive, downgraded to free');
      }

      // Update cache timestamp
      localStorage.setItem('subscription_last_verified', Date.now().toString());

    } catch (error) {
      console.error('Error verifying subscription:', error);
      // On error, keep existing localStorage plan (graceful fallback)
      // Don't downgrade user if server is temporarily unavailable
    }
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
      dnaAnalysis: '🧬 DNA Analysis requires Essential plan or higher',
      socialBattles: '⚔️ Social Battles requires Essential plan or higher',
      insuranceRewards: '💰 Insurance Rewards - Coming Soon',
      mealAutomation: '🍽️ Meal Automation requires Premium plan (£14.99/mo)',
      healthAvatar: '🧬 Health Avatar requires Essential plan or higher',
      arScanner: '📸 AR Scanner requires Essential plan or higher',
      emergencyPanel: '🚨 Emergency Panel requires Essential plan (£4.99/mo)',
      appleHealthSync: '❤️ Apple Health Sync - Coming Soon',
      wearableSync: '⌚ Wearable Integration - Coming Soon',
      exportReports: '📄 Export Reports requires Premium plan (£14.99/mo)',
      meditation: '🧘 Meditation Library requires Essential plan (£4.99/mo)',
      heartRate: '❤️ Heart Rate Tracking requires Essential plan (£4.99/mo)',
      sleepTracking: '😴 Sleep Tracking requires Essential plan (£4.99/mo)',
      workouts: '💪 Workout Library requires Essential plan (£4.99/mo)',
      breathing: '🌬️ Breathing Exercises requires Essential plan (£4.99/mo)',
      pdfExport: '📄 PDF Export requires Premium plan (£14.99/mo)'
    };
    return messages[featureName] || 'This feature requires a paid plan';
  }

  // Get user's plan badge
  getPlanBadge() {
    const plan = this.getCurrentPlan();
    const badges = {
      free: '🆓 Free',
      essential: '💪 Essential',
      premium: '⭐ Premium',
      vip: '👑 VIP'
    };
    return badges[plan.id] || badges.free;
  }

  // Check if user can upgrade
  canUpgradeTo(targetPlan) {
    const currentPlan = this.getCurrentPlan();
    const planHierarchy = { free: 0, essential: 1, premium: 2, vip: 3 };
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



