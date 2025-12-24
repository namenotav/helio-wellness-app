// Production Environment Validator
// Checks all critical config before app starts

class ProductionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validate() {
    console.log('🔍 Validating production environment...');
    
    this.checkFirebaseConfig();
    this.checkGeminiAPI();
    this.checkStripeKeys();
    this.checkRailwayAPI();
    this.checkCapacitorConfig();
    
    if (this.errors.length > 0) {
      console.error('❌ CRITICAL ERRORS - App cannot start:');
      this.errors.forEach(err => console.error(`  - ${err}`));
      
      // Show user-friendly error
      const errorHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex; align-items: center; justify-content: center; 
                    font-family: -apple-system, sans-serif; z-index: 9999;">
          <div style="background: white; padding: 40px; border-radius: 20px; 
                      max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <h1 style="color: #ef4444; margin: 0 0 20px 0;">⚠️ Configuration Error</h1>
            <p style="color: #666; margin-bottom: 20px;">
              The app is missing critical configuration. Please contact support.
            </p>
            <ul style="color: #666; text-align: left; line-height: 1.8;">
              ${this.errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
            <p style="color: #999; font-size: 0.9em; margin-top: 20px;">
              Error Code: ENV_CONFIG_MISSING
            </p>
          </div>
        </div>
      `;
      
      if (typeof document !== 'undefined') {
        document.body.innerHTML = errorHTML;
      }
      
      return false;
    }
    
    if (this.warnings.length > 0) {
      console.warn('⚠️ WARNINGS - Some features may be limited:');
      this.warnings.forEach(warn => console.warn(`  - ${warn}`));
    }
    
    console.log('✅ Environment validation passed');
    return true;
  }

  checkFirebaseConfig() {
    const requiredKeys = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_APP_ID'
    ];

    requiredKeys.forEach(key => {
      const value = import.meta.env[key];
      if (!value || value === 'YOUR_API_KEY_HERE' || value === 'undefined') {
        this.errors.push(`Firebase: ${key} not configured`);
      }
    });

    if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) {
      this.warnings.push('Firebase Realtime Database URL not set (optional)');
    }
  }

  checkGeminiAPI() {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'YOUR_GEMINI_API_KEY' || geminiKey === 'undefined') {
      this.errors.push('Gemini API: VITE_GEMINI_API_KEY not configured - AI features will fail');
    } else if (geminiKey.length < 30) {
      this.errors.push('Gemini API: Key appears invalid (too short)');
    }
  }

  checkStripeKeys() {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey || publishableKey === 'YOUR_STRIPE_KEY' || publishableKey === 'undefined') {
      this.errors.push('Stripe: VITE_STRIPE_PUBLISHABLE_KEY not configured - Payments will fail');
    } else if (!publishableKey.startsWith('pk_')) {
      this.errors.push('Stripe: Publishable key format invalid (should start with pk_)');
    } else if (publishableKey.startsWith('pk_test_')) {
      this.warnings.push('Stripe: Using TEST mode - switch to LIVE keys for production');
    }

    // Check server-side Stripe secret (should NOT be in frontend .env)
    if (import.meta.env.VITE_STRIPE_SECRET_KEY) {
      this.errors.push('SECURITY RISK: STRIPE_SECRET_KEY found in frontend .env - REMOVE IMMEDIATELY');
    }
  }

  checkRailwayAPI() {
    const railwayURL = import.meta.env.VITE_RAILWAY_API_URL;
    
    if (!railwayURL || railwayURL === 'http://localhost:3000') {
      this.warnings.push('Railway: Using localhost API - deploy to Railway for production');
    } else if (!railwayURL.startsWith('https://')) {
      this.errors.push('Railway: API URL must use HTTPS in production');
    }
  }

  checkCapacitorConfig() {
    // This runs in browser, can't check capacitor.config.json directly
    // But we can check if running in native context
    if (typeof window.Capacitor !== 'undefined') {
      console.log('✅ Running in Capacitor native app');
    } else {
      this.warnings.push('Running in web browser - native features unavailable');
    }
  }

  getReport() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      valid: this.errors.length === 0
    };
  }
}

export default new ProductionValidator();
