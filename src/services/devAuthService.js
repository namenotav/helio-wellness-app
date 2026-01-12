// Developer Authentication Service
// Two-layer security: Device ID + Password

import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

class DevAuthService {
  constructor() {
    // SECURITY: Only specific device IDs allowed (removed generic model names)
    // Generic model names like 'CPH2551' match thousands of devices worldwide
    this.authorizedDeviceIds = [
      '85e89dbedd0cda70',  // ACTUAL OPPO CPH2551 device ID (primary dev device)
      'a8f5d227622e766f',  // Backup device ID
      // REMOVED: Generic model patterns for security
      // If dev mode stops working, add your actual device ID here (not model name)
    ];
    
    // Developer password - MUST be set via environment variable
    // 🔒 SECURITY: No hardcoded fallback in production
    this.devPassword = import.meta.env.VITE_DEV_PASSWORD;
    if (!this.devPassword && import.meta.env.PROD) {
      console.error('🔒 SECURITY: VITE_DEV_PASSWORD not set - dev mode disabled in production');
    }
    
    // Developer mode state - starts disabled
    this.isDevMode = false;
    
    // Storage key
    this.storageKey = 'helio_dev_mode';
  }

  /**
   * Initialize and check if developer mode should be enabled
   */
  async initialize() {
    try {
      if(import.meta.env.DEV)console.log('🚀 DevAuth: Starting initialization...');
      if(import.meta.env.DEV)console.log('🌐 Platform:', Capacitor.getPlatform());
      if(import.meta.env.DEV)console.log('📱 Is Native?', Capacitor.isNativePlatform());
      
      if (!Capacitor.isNativePlatform()) {
        // On web, BLOCK dev mode for security (production safety)
        this.isDevMode = false;
        if(import.meta.env.DEV)console.log('❌ Web platform - Developer mode BLOCKED for security');
        if(import.meta.env.DEV)console.warn('🔒 WEB BLOCKED: Only native devices can access dev mode');
        return false; // CHANGED: Block web access
      }

      // Get device info
      const deviceInfo = await Device.getId();
      const deviceId = deviceInfo.identifier;

      if(import.meta.env.DEV)console.log('🔐 Device ID:', deviceId);
      if(import.meta.env.DEV)console.log('🔑 Authorized Device IDs:', this.authorizedDeviceIds);

      // SECURITY: Check if device is in authorized list
      const isAuthorized = this.authorizedDeviceIds.some(authId => {
        const match = deviceId.includes(authId) || authId.includes(deviceId);
        if(import.meta.env.DEV)console.log(`   Checking ${authId}: ${match ? '✅ MATCH' : '❌ no match'}`);
        return match;
      });

      if(import.meta.env.DEV)console.log('🎯 Authorization result:', isAuthorized ? '✅ AUTHORIZED' : '❌ BLOCKED');

      if (!isAuthorized) {
        this.isDevMode = false;
        if(import.meta.env.DEV)console.log('❌ Unauthorized device - Developer mode BLOCKED');
        if(import.meta.env.DEV)console.log('💡 Add this device ID to authorizedDeviceIds:', deviceId);
        return false;
      }

      // Check if dev mode was previously unlocked with password
      // 🔥 FIX: Check BOTH localStorage AND Capacitor Preferences (Preferences survives reinstalls)
      let savedDevMode = localStorage.getItem(this.storageKey);
      if(import.meta.env.DEV)console.log('💾 localStorage dev mode:', savedDevMode);
      
      // Also check Capacitor Preferences (persists across reinstalls)
      try {
        const { value: prefsDevMode } = await Preferences.get({ key: 'wellnessai_helio_dev_mode' });
        if(import.meta.env.DEV)console.log('💾 Preferences dev mode:', prefsDevMode);
        if (prefsDevMode === 'true') {
          savedDevMode = 'true';
          // Sync back to localStorage if it was lost
          localStorage.setItem(this.storageKey, 'true');
          if(import.meta.env.DEV)console.log('🔄 Synced dev mode from Preferences to localStorage');
        }
      } catch (e) {
        if(import.meta.env.DEV)console.log('⚠️ Could not read Preferences:', e);
      }
      
      if (savedDevMode === 'true') {
        this.isDevMode = true;
        if(import.meta.env.DEV)console.log('✅ Developer mode restored (authorized device)');
        return true;
      }

      // Device is authorized but needs password unlock
      if(import.meta.env.DEV)console.log('🔒 Authorized device detected - password required for dev mode');
      return true; // Device is authorized, but dev mode needs password
    } catch (error) {
      if(import.meta.env.DEV)console.error('DevAuth initialization error:', error);
      return false;
    }
  }

  /**
   * Check if current device is authorized
   */
  async isAuthorizedDevice() {
    try {
      if (!Capacitor.isNativePlatform()) {
        if(import.meta.env.DEV)console.log('🌐 Web platform - BLOCKED for security');
        return false; // Block web access for security
      }

      const deviceInfo = await Device.getId();
      const deviceId = deviceInfo.identifier || deviceInfo.uuid;
      const deviceIdLower = (deviceId || '').toLowerCase();

      if(import.meta.env.DEV)console.log('🔍 Full device info:', deviceInfo);
      if(import.meta.env.DEV)console.log('🔍 Checking authorization for device:', deviceId);
      if(import.meta.env.DEV)console.log('🔍 Device ID (lowercase):', deviceIdLower);
      if(import.meta.env.DEV)console.log('🔑 Authorized IDs:', this.authorizedDeviceIds);

      const isAuthorized = this.authorizedDeviceIds.some(authId => {
        const authIdLower = authId.toLowerCase();
        const matches = deviceIdLower.includes(authIdLower) || authIdLower.includes(deviceIdLower);
        if(import.meta.env.DEV)console.log(`🔍 Comparing "${deviceIdLower}" with "${authIdLower}": ${matches}`);
        if (matches) {
          if(import.meta.env.DEV)console.log('✅ MATCH FOUND:', authId);
        }
        return matches;
      });

      if(import.meta.env.DEV)console.log('🔐 Authorization result:', isAuthorized);
      
      // TEMPORARY: If no match, show what to add
      if (!isAuthorized) {
        if(import.meta.env.DEV)console.error('❌ NO MATCH - Add this to authorized IDs:', deviceId);
      }
      
      return isAuthorized;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Device check error:', error);
      return false;
    }
  }

  /**
   * Verify password and unlock developer mode
   */
  async unlockDevMode(password) {
    try {
      if(import.meta.env.DEV)console.log('🔓 Attempting to unlock dev mode...');
      
      // Get device info for logging
      if (Capacitor.isNativePlatform()) {
        const deviceInfo = await Device.getId();
        if(import.meta.env.DEV)console.log('📱 Current device ID:', deviceInfo.identifier);
      }
      
      // Check if this is authorized device first
      const isAuthorized = await this.isAuthorizedDevice();
      
      if (!isAuthorized) {
        if(import.meta.env.DEV)console.log('❌ Device not authorized');
        return {
          success: false,
          message: 'Unauthorized device - Check console for device ID'
        };
      }

      if(import.meta.env.DEV)console.log('✅ Device authorized, checking password...');

      // Verify password
      if (password === this.devPassword) {
        this.isDevMode = true;
        localStorage.setItem(this.storageKey, 'true');
        
        // 🔥 FIX: Also save to Capacitor Preferences (survives app reinstall)
        try {
          await Preferences.set({ key: 'wellnessai_helio_dev_mode', value: 'true' });
          if(import.meta.env.DEV)console.log('💾 Saved dev mode to Preferences (persistent)');
        } catch (e) {
          if(import.meta.env.DEV)console.log('⚠️ Could not save to Preferences:', e);
        }
        
        if(import.meta.env.DEV)console.log('✅ Password correct - Developer mode unlocked!');
        
        return {
          success: true,
          message: 'Developer mode enabled'
        };
      } else {
        if(import.meta.env.DEV)console.log('❌ Password incorrect');
        return {
          success: false,
          message: 'Incorrect password'
        };
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Unlock error:', error);
      return {
        success: false,
        message: 'Authentication failed'
      };
    }
  }

  /**
   * Lock developer mode
   */
  async lockDevMode() {
    this.isDevMode = false;
    localStorage.removeItem(this.storageKey);
    // 🔥 FIX: Also remove from Capacitor Preferences
    try {
      await Preferences.remove({ key: 'wellnessai_helio_dev_mode' });
    } catch (e) {
      if(import.meta.env.DEV)console.log('⚠️ Could not remove from Preferences:', e);
    }
    if(import.meta.env.DEV)console.log('Developer mode locked');
  }

  /**
   * Check if developer mode is active
   */
  isDevModeActive() {
    return this.isDevMode;
  }

  /**
   * Get device information for debugging
   */
  async getDeviceInfo() {
    try {
      const info = await Device.getInfo();
      const id = await Device.getId();
      
      return {
        ...info,
        identifier: id.identifier,
        isAuthorized: await this.isAuthorizedDevice()
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Device info error:', error);
      return null;
    }
  }

  /**
   * Change developer password
   */
  changePassword(oldPassword, newPassword) {
    if (oldPassword === this.devPassword) {
      this.devPassword = newPassword;
      if(import.meta.env.DEV)console.log('Developer password changed');
      return true;
    }
    return false;
  }

  /**
   * Reset authorization (for testing only)
   */
  async resetAuthorization() {
    localStorage.removeItem('authorized_device_id');
    localStorage.removeItem(this.storageKey);
    // 🔥 FIX: Also remove from Capacitor Preferences
    try {
      await Preferences.remove({ key: 'wellnessai_helio_dev_mode' });
    } catch (e) {
      if(import.meta.env.DEV)console.log('⚠️ Could not remove from Preferences:', e);
    }
    this.authorizedDeviceId = null;
    this.isDevMode = false;
    if(import.meta.env.DEV)console.log('Authorization reset');
  }
}

// Export singleton instance
export const devAuthService = new DevAuthService();
export default devAuthService;



