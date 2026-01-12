// Feature Flag Service
// Manages beta feature access and feature rollout control
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import authService from './authService';
import subscriptionService from './subscriptionService';

class FeatureFlagService {
  constructor() {
    this.cachedFlags = null;
    this.cacheTime = 0;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Feature flag definitions
   * Controls which features are available globally and per-plan
   */
  FEATURES = {
    // Beta features (require betaAccess flag)
    'social_battles_money': {
      name: 'Money Stakes in Social Battles',
      description: 'Bet real money on social battles',
      requiresBeta: true,
      requiresPlan: 'premium',
      status: 'beta' // 'beta', 'stable', 'deprecated'
    },
    'ai_voice_chat': {
      name: 'Voice Chat with AI',
      description: 'Talk to AI using voice instead of text',
      requiresBeta: true,
      requiresPlan: 'premium',
      status: 'beta'
    },
    'advanced_dna_insights': {
      name: 'Advanced DNA Insights',
      description: 'Extended genetic analysis with ancestry',
      requiresBeta: true,
      requiresPlan: 'premium',
      status: 'beta'
    },
    'meal_automation_v2': {
      name: 'Meal Automation 2.0',
      description: 'AI-powered grocery delivery integration',
      requiresBeta: true,
      requiresPlan: 'ultimate',
      status: 'beta'
    },
    
    // Stable features (available to all)
    'step_counter': {
      name: 'Step Counter',
      description: 'Track daily steps',
      requiresBeta: false,
      requiresPlan: 'free',
      status: 'stable'
    },
    'food_scanner': {
      name: 'AI Food Scanner',
      description: 'Scan food with camera',
      requiresBeta: false,
      requiresPlan: 'free',
      status: 'stable'
    },
    'barcode_scanner': {
      name: 'Barcode Scanner',
      description: 'Scan product barcodes',
      requiresBeta: false,
      requiresPlan: 'starter',
      status: 'stable'
    },
    'dna_analysis': {
      name: 'DNA Analysis',
      description: '23andMe integration',
      requiresBeta: false,
      requiresPlan: 'premium',
      status: 'stable'
    },
    'health_avatar': {
      name: 'Health Avatar',
      description: 'Real-time health scoring',
      requiresBeta: false,
      requiresPlan: 'premium',
      status: 'stable'
    },
    'ar_scanner': {
      name: 'AR Food Scanner',
      description: 'Augmented reality food detection',
      requiresBeta: false,
      requiresPlan: 'premium',
      status: 'stable'
    },
    'social_battles': {
      name: 'Social Battles',
      description: 'Compete with friends',
      requiresBeta: false,
      requiresPlan: 'premium',
      status: 'stable'
    },
    'meal_automation': {
      name: 'Meal Automation',
      description: 'AI meal planning',
      requiresBeta: false,
      requiresPlan: 'premium',
      status: 'stable'
    }
  };

  /**
   * Check if user has access to a specific feature
   * @param {string} featureKey - Feature identifier
   * @returns {Object} { allowed: boolean, reason: string }
   */
  async hasFeatureAccess(featureKey) {
    try {
      const feature = this.FEATURES[featureKey];
      
      if (!feature) {
        return { allowed: false, reason: 'Feature not found' };
      }

      // Check if feature is deprecated
      if (feature.status === 'deprecated') {
        return { allowed: false, reason: 'This feature is no longer available' };
      }

      // Check subscription plan requirement
      const hasSubscription = await subscriptionService.hasAccess(feature.requiresPlan);
      if (!hasSubscription) {
        return { 
          allowed: false, 
          reason: `Requires ${feature.requiresPlan} plan or higher` 
        };
      }

      // Check beta access requirement
      if (feature.requiresBeta) {
        const hasBetaAccess = await this.hasBetaAccess();
        if (!hasBetaAccess) {
          return { 
            allowed: false, 
            reason: 'This feature is in beta. Upgrade to Ultimate for early access.' 
          };
        }
      }

      return { allowed: true, reason: 'Access granted' };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error checking feature access:', error);
      return { allowed: false, reason: 'Error checking access' };
    }
  }

  /**
   * Check if user has beta access (Ultimate plan + betaAccess flag)
   */
  async hasBetaAccess() {
    const plan = subscriptionService.getCurrentPlan();
    return plan.features?.betaAccess === true;
  }

  /**
   * Get all features available to current user
   */
  async getUserFeatures() {
    const features = {
      stable: [],
      beta: [],
      locked: []
    };

    for (const [key, feature] of Object.entries(this.FEATURES)) {
      const access = await this.hasFeatureAccess(key);
      
      if (access.allowed) {
        if (feature.status === 'beta') {
          features.beta.push({ ...feature, key });
        } else {
          features.stable.push({ ...feature, key });
        }
      } else {
        features.locked.push({ ...feature, key, lockReason: access.reason });
      }
    }

    return features;
  }

  /**
   * Enable beta feature for specific user (admin function)
   * @param {string} userId - User ID to grant beta access
   */
  async enableBetaAccess(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        betaFeatures: true,
        betaEnabledAt: new Date().toISOString()
      });
      
      if(import.meta.env.DEV)console.log('✅ Beta access enabled for user:', userId);
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to enable beta access:', error);
      return false;
    }
  }

  /**
   * Disable beta feature for specific user (admin function)
   */
  async disableBetaAccess(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        betaFeatures: false,
        betaDisabledAt: new Date().toISOString()
      });
      
      if(import.meta.env.DEV)console.log('✅ Beta access disabled for user:', userId);
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to disable beta access:', error);
      return false;
    }
  }

  /**
   * Get feature status (for admin dashboard)
   */
  getFeatureStatus(featureKey) {
    return this.FEATURES[featureKey] || null;
  }

  /**
   * List all available features
   */
  getAllFeatures() {
    return Object.entries(this.FEATURES).map(([key, feature]) => ({
      key,
      ...feature
    }));
  }

  /**
   * Check if a feature is in beta
   */
  isFeatureBeta(featureKey) {
    const feature = this.FEATURES[featureKey];
    return feature?.status === 'beta';
  }

  /**
   * Get required plan for a feature
   */
  getRequiredPlan(featureKey) {
    const feature = this.FEATURES[featureKey];
    return feature?.requiresPlan || 'free';
  }
}

const featureFlagService = new FeatureFlagService();
export default featureFlagService;
