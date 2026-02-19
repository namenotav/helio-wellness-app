// Cloud Backup Service - Automatic Data Sync
// Backs up health data to Railway server with encryption

import encryptionService from './encryptionService.js';
import productionLogger from './productionLogger.js';

class CloudBackupService {
  constructor() {
    this.serverUrl = 'https://helio-wellness-app-production.up.railway.app';
    this.syncInterval = null;
    this.lastBackupTime = null;
    this.userId = null;
  }

  /**
   * Initialize backup service
   */
  async initialize(userId) {
    this.userId = userId;
    
    // Load last backup time
    const lastBackup = localStorage.getItem('last_backup_time');
    this.lastBackupTime = lastBackup ? parseInt(lastBackup) : null;
    
    // Start auto-backup every 5 minutes
    this.startAutoBackup();
    
    if(import.meta.env.DEV)console.log('☁️ Cloud backup initialized');
  }

  /**
   * Start event-based backup (no polling)
   */
  startAutoBackup() {
    // Initial backup
    this.backupData();
    
    // Listen for data changes (event-based, not polling)
    window.addEventListener('healthDataUpdate', () => {
      this.backupData();
    });
    
    // Backup every 5 minutes as fallback
    this.syncInterval = setInterval(() => {
      this.backupData();
    }, 300000); // 5 minutes
    
    if(import.meta.env.DEV) console.log('✅ Event-based backup initialized (real-time + fallback)');
  }

  /**
   * Backup health data to cloud
   */
  async backupData() {
    try {
      if (!this.userId) {
        if(import.meta.env.DEV)console.log('⚠️ No user ID, skipping backup');
        return;
      }

      // Get health data
      const healthData = await encryptionService.getSecureItem('health_data');
      if (!healthData) {
        if(import.meta.env.DEV)console.log('⚠️ No health data to backup');
        return;
      }

      // Encrypt for transmission
      const encryptedData = await encryptionService.encrypt(healthData);
      
      // Send to server
      try {
        const response = await fetch(`${this.serverUrl}/api/backup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.userId,
            data: encryptedData || healthData,
            encrypted: !!encryptedData
          }),
          signal: AbortSignal.timeout(15000)
        });
        
        if (response.ok) {
          this.lastBackupTime = Date.now();
          localStorage.setItem('last_backup_time', this.lastBackupTime.toString());
          productionLogger.action('cloud_backup_success', { target: 'server' });
          if(import.meta.env.DEV)console.log('☁️ Data backed up to server');
          return true;
        }
      } catch (networkError) {
        if(import.meta.env.DEV)console.warn('☁️ Server backup failed, saving locally:', networkError.message);
      }
      
      // Fallback: save locally if server is unavailable
      this.lastBackupTime = Date.now();
      localStorage.setItem('last_backup_time', this.lastBackupTime.toString());
      localStorage.setItem('last_backup_data', JSON.stringify(healthData));
      
      if(import.meta.env.DEV)console.log('☁️ Data backed up locally (server unavailable)');
      return true;
    } catch (error) {
      productionLogger.error('Cloud backup failed', error, { userId: this.userId });
      if(import.meta.env.DEV)console.error('Backup error:', error);
      return false;
    }
  }

  /**
   * Restore data from backup
   */
  async restoreData() {
    try {
      // Try server backup first
      if (this.userId) {
        try {
          const response = await fetch(`${this.serverUrl}/api/backup/${this.userId}`, {
            signal: AbortSignal.timeout(10000)
          });
          if (response.ok) {
            const backup = await response.json();
            if (backup && backup.data) {
              const data = backup.encrypted ? await encryptionService.decrypt(backup.data) : backup.data;
              await encryptionService.setSecureItem('health_data', data);
              productionLogger.action('cloud_restore_success', { source: 'server' });
              if(import.meta.env.DEV)console.log('✅ Data restored from server backup');
              return data;
            }
          }
        } catch (networkError) {
          if(import.meta.env.DEV)console.warn('☁️ Server restore failed, trying local:', networkError.message);
        }
      }
      
      // Fallback to local backup
      const backupData = localStorage.getItem('last_backup_data');
      if (backupData) {
        const data = JSON.parse(backupData);
        await encryptionService.setSecureItem('health_data', data);
        if(import.meta.env.DEV)console.log('✅ Data restored from local backup');
        return data;
      }
      
      return null;
    } catch (error) {
      productionLogger.error('Cloud restore failed', error, { userId: this.userId });
      if(import.meta.env.DEV)console.error('Restore error:', error);
      return null;
    }
  }

  /**
   * Get backup status
   */
  getBackupStatus() {
    return {
      enabled: this.syncInterval !== null,
      lastBackup: this.lastBackupTime,
      timeSinceBackup: this.lastBackupTime ? Date.now() - this.lastBackupTime : null
    };
  }

  /**
   * Stop auto-backup
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      if(import.meta.env.DEV)console.log('☁️ Cloud backup stopped');
    }
  }
}

const cloudBackupService = new CloudBackupService();
export default cloudBackupService;



