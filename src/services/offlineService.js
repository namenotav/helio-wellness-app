// Offline Mode Detector
// Monitors network connectivity and sync status

class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    this.syncQueue = [];
    this.setupListeners();
  }

  /**
   * Setup online/offline event listeners
   */
  setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      if(import.meta.env.DEV)console.log('✅ Connection restored');
      this.notifyListeners();
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      if(import.meta.env.DEV)console.log('⚠️ Connection lost');
      this.notifyListeners();
    });

    if(import.meta.env.DEV)console.log('📡 Offline mode detector initialized');
  }

  /**
   * Get online status
   */
  getStatus() {
    return {
      online: this.isOnline,
      pendingSync: this.syncQueue.length
    };
  }

  /**
   * Add item to sync queue
   */
  queueForSync(item) {
    this.syncQueue.push({
      ...item,
      queuedAt: Date.now()
    });
    this.saveSyncQueue();
  }

  /**
   * Process sync queue when back online
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    if(import.meta.env.DEV)console.log('🔄 Processing', this.syncQueue.length, 'queued items...');

    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      
      try {
        // Process sync item
        // In production, would sync to server
        if(import.meta.env.DEV)console.log('✅ Synced:', item);
      } catch (error) {
        if(import.meta.env.DEV)console.error('Sync failed:', error);
        // Re-queue if failed
        this.syncQueue.push(item);
        break;
      }
    }

    this.saveSyncQueue();
  }

  /**
   * Save sync queue to localStorage
   */
  saveSyncQueue() {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (e) {
      if(import.meta.env.DEV)console.error('Failed to save sync queue:', e);
    }
  }

  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue() {
    try {
      const saved = localStorage.getItem('sync_queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (e) {
      if(import.meta.env.DEV)console.error('Failed to load sync queue:', e);
    }
  }

  /**
   * Subscribe to online/offline changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.getStatus());
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        if(import.meta.env.DEV)console.error('Offline listener error:', error);
      }
    });
  }
}

const offlineService = new OfflineService();
offlineService.loadSyncQueue();

export default offlineService;



