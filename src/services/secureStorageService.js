// Secure Storage Service - Encrypted localStorage wrapper
// Automatically encrypts sensitive health data before storing
import encryptionService from './encryptionService';

class SecureStorageService {
  constructor() {
    this.encryptionReady = false;
    this.init();
  }

  async init() {
    try {
      await encryptionService.initialize();
      this.encryptionReady = true;
      if(import.meta.env.DEV) console.log('🔐 Secure storage initialized');
    } catch (error) {
      if(import.meta.env.DEV) console.error('❌ Secure storage init failed:', error);
    }
  }

  /**
   * Store encrypted data in localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to encrypt and store
   */
  async setItem(key, data) {
    try {
      if (!this.encryptionReady) {
        await this.init();
      }

      const encrypted = await encryptionService.encrypt(data);
      localStorage.setItem(key + '_enc', encrypted);
      
      if(import.meta.env.DEV) console.log(`🔐 Encrypted and stored: ${key}`);
    } catch (error) {
      if(import.meta.env.DEV) console.error(`❌ Encryption failed for ${key}:`, error);
      // Fallback to plain storage if encryption fails
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   * @param {string} key - Storage key
   * @returns {any} Decrypted data
   */
  async getItem(key) {
    try {
      if (!this.encryptionReady) {
        await this.init();
      }

      // Try encrypted version first
      const encrypted = localStorage.getItem(key + '_enc');
      if (encrypted) {
        const decrypted = await encryptionService.decrypt(encrypted);
        if(import.meta.env.DEV) console.log(`🔓 Decrypted: ${key}`);
        return decrypted;
      }

      // Fallback to plain storage (for backward compatibility)
      const plain = localStorage.getItem(key);
      if (plain) {
        if(import.meta.env.DEV) console.warn(`⚠️ Using plain storage for ${key} (not encrypted yet)`);
        return JSON.parse(plain);
      }

      return null;
    } catch (error) {
      if(import.meta.env.DEV) console.error(`❌ Decryption failed for ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage (both encrypted and plain versions)
   * @param {string} key - Storage key
   */
  removeItem(key) {
    localStorage.removeItem(key + '_enc');
    localStorage.removeItem(key);
    if(import.meta.env.DEV) console.log(`🗑️ Removed: ${key}`);
  }

  /**
   * Migrate existing plain data to encrypted storage
   * @param {string} key - Storage key to migrate
   */
  async migrateToEncrypted(key) {
    try {
      const plain = localStorage.getItem(key);
      if (plain) {
        const data = JSON.parse(plain);
        await this.setItem(key, data);
        localStorage.removeItem(key); // Remove plain version after migration
        if(import.meta.env.DEV) console.log(`✅ Migrated ${key} to encrypted storage`);
      }
    } catch (error) {
      if(import.meta.env.DEV) console.error(`❌ Migration failed for ${key}:`, error);
    }
  }

  /**
   * Migrate all sensitive health data to encrypted storage
   */
  async migrateAllHealthData() {
    const keysToMigrate = [
      'workoutHistory',
      'sleepLog',
      'stepHistory',
      'dailySteps',
      'weeklySteps',
      'current_sleep_session',
      'healthData',
      'nutritionLog'
    ];

    for (const key of keysToMigrate) {
      await this.migrateToEncrypted(key);
    }

    if(import.meta.env.DEV) console.log('✅ All health data migrated to encrypted storage');
  }
}

// Export singleton instance
const secureStorage = new SecureStorageService();
export default secureStorage;
