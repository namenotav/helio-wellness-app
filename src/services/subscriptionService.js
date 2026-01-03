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
          aiVoiceCoach: false,
          waterTracking: true,
          breathing: true,
          emergencyPanel: true,
          // LOCKED
          dnaAnalysis: false,
          socialBattles: false,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: false,
          heartRate: false,
          sleepTracking: false,
          workouts: 'limited',
          pdfExport: false,
          prioritySupport: false,
          betaAccess: false,
          vipBadge: false
        },
        limits: {
          aiMessages: 5,
          foodScans: 3,
          barcodeScans: 0,
          arScans: 0,
          workouts: 1
        }
      },
      starter: {
        id: 'starter',
        name: 'Starter',
        price: 6.99,
        billing: 'monthly',
        features: {
          basicTracking: true,
          stepCounter: true,
          foodScanner: true,
          meditation: true,
          waterTracking: true,
          aiVoiceCoach: 'limited',
          breathing: true,
          socialBattles: true,
          workouts: true,
          // LOCKED
          dnaAnalysis: false,
          insuranceRewards: false,
          mealAutomation: false,
          healthAvatar: false,
          arScanner: false,
          emergencyPanel: true,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: false,
          heartRate: true,
          sleepTracking: true,
          pdfExport: false,
          prioritySupport: false,
          betaAccess: false,
          vipBadge: false
        },
        limits: {
          aiMessages: 999999,
          foodScans: 999999,
          barcodeScans: 999999,
          arScans: 0,
          workouts: 999999
        }
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        price: 16.99,
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
          healthAvatar: true,
          arScanner: true,
          emergencyPanel: true,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: true,
          heartRate: true,
          sleepTracking: true,
          workouts: true,
          breathing: true,
          pdfExport: true,
          prioritySupport: false,
          betaAccess: false,
          vipBadge: false
        },
        limits: {
          aiMessages: 50,
          foodScans: 999999,
          barcodeScans: 999999,
          arScans: 999999,
          workouts: 999999
        }
      },
      ultimate: {
        id: 'ultimate',
        name: 'Ultimate',
        price: 34.99,
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
          healthAvatar: true,
          arScanner: 'unlimited',
          emergencyPanel: true,
          appleHealthSync: false,
          wearableSync: false,
          exportReports: true,
          heartRate: true,
          sleepTracking: true,
          workouts: true,
          breathing: true,
          pdfExport: true,
          prioritySupport: true,
          betaAccess: true,
          vipBadge: true
        },
        limits: {
          aiMessages: 999999,
          foodScans: 999999,
          barcodeScans: 999999,
          arScans: 999999,
          workouts: 999999
        }
      }
    };
  }

  // Get current user's subscription plan
  getCurrentPlan() {
    const planId = localStorage.getItem('subscription_plan') || 'free';
    const verified = localStorage.getItem('subscription_verified') === 'true';
    
    // If plan is not free and not verified by server, downgrade to free
    if (planId !== 'free' && !verified) {
      if(import.meta.env.DEV)console.warn('⚠️ Unverified subscription plan, using free tier');
      return this.plans.free;
    }
    
    // Check if subscription has expired
    const periodEnd = localStorage.getItem('subscription_period_end');
    if (periodEnd && Date.now() > new Date(periodEnd).getTime()) {
      if(import.meta.env.DEV)console.warn('⚠️ Subscription expired, reverting to free');
      localStorage.setItem('subscription_plan', 'free');
      localStorage.removeItem('subscription_verified');
      return this.plans.free;
    }
    
    return this.plans[planId] || this.plans.free;
  }

  // Verify subscription with server (call on app launch)
  // WRAPPED IN SAFE ERROR HANDLING TO PREVENT INFINITE LOOPS
  async verifySubscriptionWithServer(userId) {
    try {
      if (!userId) {
        console.warn('⚠️ Cannot verify subscription without userId');
        return;
      }

      // Check if we verified recently (cache for 6 hours)
      const lastVerified = localStorage.getItem('subscription_last_verified');
      const cacheTime = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      
      if (lastVerified && Date.now() - parseInt(lastVerified) < cacheTime) {
        if(import.meta.env.DEV) console.log('✅ Using cached subscription status');
        return;
      }

      // Verify with server
      const API_URL = import.meta.env.VITE_API_URL || 'https://helio-wellness-app-production.up.railway.app';
      try {
        const response = await fetch(`${API_URL}/api/subscription/status/${userId}`, {
          timeout: 5000 // 5 second timeout to prevent hanging
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        
        // Update localStorage with server response
        if (data.isActive && data.plan !== 'free') {
          localStorage.setItem('subscription_plan', data.plan);
          localStorage.setItem('subscription_status', data.status);
          localStorage.setItem('subscription_period_end', data.currentPeriodEnd);
          localStorage.setItem('subscription_verified', 'true');
          if(import.meta.env.DEV) console.log(`✅ Subscription verified: ${data.plan} (${data.status})`);
        } else {
          // Subscription expired or inactive - downgrade to free
          localStorage.setItem('subscription_plan', 'free');
          localStorage.setItem('subscription_status', 'none');
          localStorage.removeItem('subscription_verified');
          if(import.meta.env.DEV) console.log('⚠️ Subscription expired or inactive, downgraded to free');
        }

        // Update cache timestamp
        localStorage.setItem('subscription_last_verified', Date.now().toString());

      } catch (fetchError) {
        // If network request fails, don't throw - just log and continue
        // This prevents subscription verification from blocking the app
        console.warn('⚠️ Could not verify subscription with server:', fetchError.message);
        console.log('ℹ️ Using cached/local subscription status - app will continue working');
        // Do NOT downgrade user if server is unavailable - keep their existing plan
      }

    } catch (error) {
      // Final catch-all to prevent any errors from propagating
      console.error('⚠️ Subscription verification error (non-blocking):', error.message);
      // Do not rethrow - let app continue
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
    if (!plan || !plan.features) {
      console.warn('⚠️ Invalid plan data, defaulting to free');
      return this.plans.free.features[featureName] === true;
    }
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
      // Starter Plan - £6.99/mo
      workouts: '💪 Unlimited workouts require Starter plan (£6.99/mo)',
      barcodeScans: '📦 Barcode scanning (3/day) requires Starter plan (£6.99/mo)',
      
      // Premium Plan - £16.99/mo
      dnaAnalysis: '🧬 DNA Analysis requires Premium plan (£16.99/mo)',
      socialBattles: '⚔️ Social Battles requires Premium plan (£16.99/mo)',
      mealAutomation: '🍽️ Meal Automation requires Premium plan (£16.99/mo)',
      healthAvatar: '🧬 Health Avatar requires Premium plan (£16.99/mo)',
      arScanner: '📸 AR Scanner requires Premium plan (£16.99/mo)',
      emergencyPanel: '🚨 Emergency Panel requires Premium plan (£16.99/mo)',
      exportReports: '📄 Export Reports requires Premium plan (£16.99/mo)',
      meditation: '🧘 Meditation Library requires Premium plan (£16.99/mo)',
      heartRate: '❤️ Heart Rate Tracking requires Premium plan (£16.99/mo)',
      sleepTracking: '😴 Sleep Tracking requires Premium plan (£16.99/mo)',
      breathing: '🌬️ Breathing Exercises requires Premium plan (£16.99/mo)',
      pdfExport: '📄 PDF Export requires Premium plan (£16.99/mo)',
      
      // Ultimate Plan - £34.99/mo
      prioritySupport: '🎧 Priority Support (2hr response) requires Ultimate plan (£34.99/mo)',
      betaAccess: '🔬 Early access to beta features requires Ultimate plan (£34.99/mo)',
      vipBadge: '👑 VIP Badge in leaderboards requires Ultimate plan (£34.99/mo)',
      unlimitedAI: '🤖 Unlimited AI messages require Ultimate plan (£34.99/mo)',
      
      // Coming Soon
      insuranceRewards: '💰 Insurance Rewards - Coming Soon',
      appleHealthSync: '❤️ Apple Health Sync - Coming Soon',
      wearableSync: '⌚ Wearable Integration - Coming Soon'
    };
    return messages[featureName] || 'This feature requires a paid plan';
  }

  // Get user's plan badge
  getPlanBadge() {
    const plan = this.getCurrentPlan();
    const badges = {
      free: '🆓 Free',
      starter: '💪 Starter',
      premium: '⭐ Premium',
      ultimate: '👑 Ultimate',
      essential: '💪 Essential (Legacy)',
      vip: '👑 VIP (Legacy)'
    };
    return badges[plan.id] || badges.free;
  }

  // Check if user can upgrade
  canUpgradeTo(targetPlan) {
    const currentPlan = this.getCurrentPlan();
    const planHierarchy = { free: 0, starter: 1, essential: 1, premium: 2, vip: 3, ultimate: 3 };
    return planHierarchy[targetPlan] > planHierarchy[currentPlan.id];
  }

  // Check if user has VIP badge (Ultimate or VIP legacy plans)
  hasVIPBadge() {
    const plan = this.getCurrentPlan();
    return plan.features?.vipBadge === true;
  }

  // Check if user has priority support access
  hasPrioritySupport() {
    const plan = this.getCurrentPlan();
    return plan.features?.prioritySupport === true;
  }

  // Check if user has beta feature access
  hasBetaAccess() {
    const plan = this.getCurrentPlan();
    return plan.features?.betaAccess === true;
  }

  // Get support priority level
  getSupportPriority() {
    const plan = this.getCurrentPlan();
    if (plan.features?.prioritySupport) {
      return plan.id === 'ultimate' || plan.id === 'vip' ? 'urgent' : 'high';
    }
    return 'normal';
  }

  // Get support SLA hours
  getSupportSLA() {
    const plan = this.getCurrentPlan();
    if (plan.id === 'ultimate' || plan.id === 'vip') return 2; // 2 hours
    if (plan.id === 'premium') return 24; // 24 hours
    return 72; // 3 days for free/starter
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



