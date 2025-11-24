// Developer Authentication Service
// Two-layer security: Device ID + Password

import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

class DevAuthService {
  constructor() {
    // Your device's unique identifier will be set on first launch
    this.authorizedDeviceId = null;
    
    // Developer password (change this to your preferred password)
    this.devPassword = 'helio2025dev';
    
    // Developer mode state
    this.isDevMode = false;
    
    // Storage key
    this.storageKey = 'helio_dev_mode';
  }

  /**
   * Initialize and check if developer mode should be enabled
   */
  async initialize() {
    try {
      if (!Capacitor.isNativePlatform()) {
        // On web, always enable dev mode for testing
        this.isDevMode = true;
        return true;
      }

      // Get device info
      const deviceInfo = await Device.getId();
      const deviceId = deviceInfo.identifier;

      console.log('Device ID:', deviceId);

      // First time setup: set this device as authorized
      if (!this.authorizedDeviceId) {
        // Store the first device ID that runs this
        const stored = localStorage.getItem('authorized_device_id');
        if (stored) {
          this.authorizedDeviceId = stored;
        } else {
          // First launch - this is YOUR device
          this.authorizedDeviceId = deviceId;
          localStorage.setItem('authorized_device_id', deviceId);
          console.log('Authorized device registered:', deviceId);
        }
      }

      // Check if this is the authorized device
      const isAuthorizedDevice = deviceId === this.authorizedDeviceId;

      // Check if dev mode was previously unlocked
      const savedDevMode = localStorage.getItem(this.storageKey);
      if (savedDevMode === 'true' && isAuthorizedDevice) {
        this.isDevMode = true;
        console.log('Developer mode restored from storage');
        return true;
      }

      return isAuthorizedDevice;
    } catch (error) {
      console.error('DevAuth initialization error:', error);
      return false;
    }
  }

  /**
   * Check if current device is authorized
   */
  async isAuthorizedDevice() {
    try {
      if (!Capacitor.isNativePlatform()) {
        return true; // Web always authorized for testing
      }

      const deviceInfo = await Device.getId();
      const deviceId = deviceInfo.identifier;

      return deviceId === this.authorizedDeviceId;
    } catch (error) {
      console.error('Device check error:', error);
      return false;
    }
  }

  /**
   * Verify password and unlock developer mode
   */
  async unlockDevMode(password) {
    try {
      // Check if this is authorized device first
      const isAuthorized = await this.isAuthorizedDevice();
      
      if (!isAuthorized) {
        return {
          success: false,
          message: 'Unauthorized device'
        };
      }

      // Verify password
      if (password === this.devPassword) {
        this.isDevMode = true;
        localStorage.setItem(this.storageKey, 'true');
        
        console.log('Developer mode unlocked!');
        
        return {
          success: true,
          message: 'Developer mode enabled'
        };
      } else {
        return {
          success: false,
          message: 'Incorrect password'
        };
      }
    } catch (error) {
      console.error('Unlock error:', error);
      return {
        success: false,
        message: 'Authentication failed'
      };
    }
  }

  /**
   * Lock developer mode
   */
  lockDevMode() {
    this.isDevMode = false;
    localStorage.removeItem(this.storageKey);
    console.log('Developer mode locked');
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
      console.error('Device info error:', error);
      return null;
    }
  }

  /**
   * Change developer password
   */
  changePassword(oldPassword, newPassword) {
    if (oldPassword === this.devPassword) {
      this.devPassword = newPassword;
      console.log('Developer password changed');
      return true;
    }
    return false;
  }

  /**
   * Reset authorization (for testing only)
   */
  resetAuthorization() {
    localStorage.removeItem('authorized_device_id');
    localStorage.removeItem(this.storageKey);
    this.authorizedDeviceId = null;
    this.isDevMode = false;
    console.log('Authorization reset');
  }
}

// Export singleton instance
export const devAuthService = new DevAuthService();
export default devAuthService;
