// AdMob Service - Placeholder for Future Ad Integration
// To activate: Add AdMob App ID to environment variables
import { Capacitor } from '@capacitor/core';

class AdMobService {
  constructor() {
    this.initialized = false;
    this.adsEnabled = false;
    this.adMobAppId = import.meta.env.VITE_ADMOB_APP_ID || null;
    
    // Ad configuration
    this.config = {
      bannerAdUnitId: import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111', // Test ID
      interstitialAdUnitId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712', // Test ID
      rewardedAdUnitId: import.meta.env.VITE_ADMOB_REWARDED_ID || 'ca-app-pub-3940256099942544/5224354917' // Test ID
    };

    // Track ad interactions for free users
    this.adCounts = {
      interstitialShown: 0,
      bannerImpressions: 0,
      rewardedWatched: 0
    };
  }

  /**
   * Initialize AdMob (currently placeholder)
   */
  async initialize() {
    try {
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        if(import.meta.env.DEV)console.log('⚠️ AdMob only works on native platforms');
        return false;
      }

      // Check if AdMob App ID is configured
      if (!this.adMobAppId) {
        if(import.meta.env.DEV)console.log('ℹ️ AdMob not configured. Add VITE_ADMOB_APP_ID to .env to enable ads.');
        return false;
      }

      // TODO: When ready to activate:
      // 1. Install Capacitor AdMob plugin: npm install @capacitor-community/admob
      // 2. Uncomment initialization code below
      // 3. Add AdMob App ID to .env file
      // 4. Configure ad unit IDs in Google AdMob dashboard

      /*
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        initializeForTesting: import.meta.env.DEV,
        testDeviceIds: import.meta.env.DEV ? ['YOUR_TEST_DEVICE_ID'] : []
      });

      this.initialized = true;
      this.adsEnabled = true;
      
      if(import.meta.env.DEV)console.log('✅ AdMob initialized');
      */

      if(import.meta.env.DEV)console.log('💡 AdMob placeholder active. Configure to enable ads.');
      return false;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to initialize AdMob:', error);
      return false;
    }
  }

  /**
   * Show banner ad (for free tier users)
   */
  async showBannerAd(position = 'BOTTOM_CENTER') {
    if (!this.adsEnabled) {
      if(import.meta.env.DEV)console.log('📢 [PLACEHOLDER] Banner ad would show here for free users');
      return false;
    }

    try {
      // TODO: Uncomment when AdMob is configured
      /*
      const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
      
      await AdMob.showBanner({
        adId: this.config.bannerAdUnitId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition[position],
        margin: 0
      });

      this.adCounts.bannerImpressions++;
      if(import.meta.env.DEV)console.log('✅ Banner ad shown');
      */
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to show banner ad:', error);
      return false;
    }
  }

  /**
   * Hide banner ad
   */
  async hideBannerAd() {
    if (!this.adsEnabled) return false;

    try {
      // TODO: Uncomment when AdMob is configured
      /*
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
      */
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to hide banner ad:', error);
      return false;
    }
  }

  /**
   * Show interstitial ad (after X actions for free users)
   */
  async showInterstitialAd() {
    if (!this.adsEnabled) {
      if(import.meta.env.DEV)console.log('📢 [PLACEHOLDER] Interstitial ad would show here');
      return false;
    }

    try {
      // TODO: Uncomment when AdMob is configured
      /*
      const { AdMob, AdLoadInfo } = await import('@capacitor-community/admob');
      
      // Prepare interstitial ad
      await AdMob.prepareInterstitial({
        adId: this.config.interstitialAdUnitId
      });

      // Show ad
      await AdMob.showInterstitial();
      
      this.adCounts.interstitialShown++;
      if(import.meta.env.DEV)console.log('✅ Interstitial ad shown');
      */
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to show interstitial ad:', error);
      return false;
    }
  }

  /**
   * Show rewarded ad (watch ad for bonus features)
   */
  async showRewardedAd() {
    if (!this.adsEnabled) {
      if(import.meta.env.DEV)console.log('📢 [PLACEHOLDER] Rewarded ad would show here');
      // Return mock reward for testing
      return { rewarded: true, amount: 50 };
    }

    try {
      // TODO: Uncomment when AdMob is configured
      /*
      const { AdMob } = await import('@capacitor-community/admob');
      
      // Prepare rewarded ad
      await AdMob.prepareRewardedAd({
        adId: this.config.rewardedAdUnitId
      });

      // Show ad and wait for completion
      const result = await AdMob.showRewardedAd();
      
      if (result.rewarded) {
        this.adCounts.rewardedWatched++;
        if(import.meta.env.DEV)console.log('✅ Rewarded ad completed');
        return { rewarded: true, amount: result.amount };
      }
      */
      
      return { rewarded: false };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to show rewarded ad:', error);
      return { rewarded: false };
    }
  }

  /**
   * Check if user should see ads (free tier only)
   */
  shouldShowAds() {
    try {
      const { default: subscriptionService } = require('./subscriptionService');
      const plan = subscriptionService.getCurrentPlan();
      
      // Only show ads to free users
      return plan.id === 'free';
    } catch (error) {
      return false;
    }
  }

  /**
   * Trigger interstitial ad after X actions (free users)
   */
  async maybeShowInterstitial() {
    if (!this.shouldShowAds()) return;

    // Show ad every 10 actions
    const actionCount = parseInt(localStorage.getItem('userActionCount') || '0');
    if (actionCount % 10 === 0 && actionCount > 0) {
      await this.showInterstitialAd();
    }
  }

  /**
   * Get ad statistics
   */
  getAdStats() {
    return {
      ...this.adCounts,
      adsEnabled: this.adsEnabled,
      configured: !!this.adMobAppId
    };
  }

  /**
   * Setup instructions (for developer)
   */
  getSetupInstructions() {
    return `
🔧 AdMob Setup Instructions:

1. Create AdMob Account:
   - Visit: https://admob.google.com/
   - Create app in AdMob dashboard
   - Get your AdMob App ID

2. Install Plugin:
   npm install @capacitor-community/admob
   npx cap sync

3. Configure Environment Variables (.env):
   VITE_ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
   VITE_ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
   VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAA
   VITE_ADMOB_REWARDED_ID=ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBB

4. Update Android Manifest (android/app/src/main/AndroidManifest.xml):
   <meta-data
     android:name="com.google.android.gms.ads.APPLICATION_ID"
     android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>

5. Uncomment code in adMobService.js (search for "TODO:")

6. Test with test device IDs first!

Current Status: ${this.adsEnabled ? '✅ Active' : '⚠️ Placeholder Mode'}
    `;
  }
}

const adMobService = new AdMobService();

// Auto-initialize on app start
if (Capacitor.isNativePlatform()) {
  adMobService.initialize();
}

export default adMobService;
