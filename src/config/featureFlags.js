// Feature Flags System
// Toggle features on/off without deploying new code

import ENV from './environment'

export const FEATURE_FLAGS = {
  // New features (can be toggled off if buggy)
  newDashboard: true,
  voiceCommandsV2: false,
  aiChatV2: false,
  advancedAnalytics: false,
  socialFeatures: true,
  
  // Experimental features (dev/staging only)
  experimentalUI: ENV.isDevelopment(),
  betaFeatures: !ENV.isProduction(),
  debugPanel: ENV.isDevelopment(),
  
  // Premium features
  pdfExport: true,
  dnaAnalysis: true,
  mealAutomation: true,
  
  // A/B testing
  abTest_NewOnboarding: false, // 50% of users see new onboarding
  abTest_GamificationV2: false,
  
  // Maintenance mode
  maintenanceMode: false,
  limitedMode: false // Disable heavy features during high load
}

export class FeatureFlagService {
  static isEnabled(featureName) {
    // Check if feature exists
    if (!(featureName in FEATURE_FLAGS)) {
      console.warn(`⚠️ Unknown feature flag: ${featureName}`)
      return false
    }
    
    // Check maintenance mode
    if (FEATURE_FLAGS.maintenanceMode) {
      // Only allow essential features
      const essentialFeatures = ['login', 'logout', 'basicTracking']
      if (!essentialFeatures.includes(featureName)) {
        return false
      }
    }
    
    // Check limited mode
    if (FEATURE_FLAGS.limitedMode) {
      // Disable heavy features
      const heavyFeatures = ['aiChat', 'voiceCommands', 'pdfExport']
      if (heavyFeatures.includes(featureName)) {
        return false
      }
    }
    
    return FEATURE_FLAGS[featureName]
  }
  
  static enableFeature(featureName) {
    if (ENV.isDevelopment()) {
      FEATURE_FLAGS[featureName] = true
      console.log(`✅ Feature enabled: ${featureName}`)
    } else {
      console.warn('⚠️ Cannot enable features in production')
    }
  }
  
  static disableFeature(featureName) {
    if (ENV.isDevelopment()) {
      FEATURE_FLAGS[featureName] = false
      console.log(`❌ Feature disabled: ${featureName}`)
    } else {
      console.warn('⚠️ Cannot disable features in production')
    }
  }
  
  static getAll() {
    return { ...FEATURE_FLAGS }
  }
  
  static logStatus() {
    if (ENV.isDevelopment()) {
      console.log('🎌 Feature Flags:')
      Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
        console.log(`  ${value ? '✅' : '❌'} ${key}`)
      })
    }
  }
}

// Initialize feature flags
if (ENV.isDevelopment()) {
  FeatureFlagService.logStatus()
  
  // Expose to window for testing
  window.featureFlags = FeatureFlagService
}

export default FeatureFlagService
