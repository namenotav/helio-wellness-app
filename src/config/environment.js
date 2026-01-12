// Environment Configuration
// Automatically detects which environment the app is running in

export const ENV = {
  // Current environment
  current: import.meta.env.VITE_APP_ENV || 'production',
  
  // App details
  appName: import.meta.env.VITE_APP_NAME || 'Helio',
  
  // Firebase projects
  firebaseProject: import.meta.env.VITE_FIREBASE_PROJECT || 'helio-production',
  
  // API endpoints
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.helio.com',
  
  // Feature flags
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableAllFeatures: import.meta.env.VITE_ENABLE_ALL_FEATURES === 'true',
  
  // Environment checks
  isDevelopment: () => ENV.current === 'development',
  isStaging: () => ENV.current === 'staging',
  isProduction: () => ENV.current === 'production',
  
  // Package name based on environment
  getPackageName: () => {
    switch (ENV.current) {
      case 'development':
        return 'com.helio.wellness.dev'
      case 'staging':
        return 'com.helio.wellness.staging'
      default:
        return 'com.helio.wellness'
    }
  },
  
  // App display name
  getDisplayName: () => {
    switch (ENV.current) {
      case 'development':
        return 'Helio DEV'
      case 'staging':
        return 'Helio BETA'
      default:
        return 'Helio'
    }
  }
}

// Log environment info in development
if (ENV.isDevelopment()) {
  console.log('🔧 Environment:', ENV.current)
  console.log('📦 Package:', ENV.getPackageName())
  console.log('🔥 Firebase:', ENV.firebaseProject)
  console.log('🌐 API:', ENV.apiUrl)
}

export default ENV
