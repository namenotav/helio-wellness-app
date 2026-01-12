// Loading State Manager
// Centralized loading state management for UI

class LoadingService {
  constructor() {
    this.activeLoaders = new Map();
    this.listeners = [];
  }

  /**
   * Start a loading operation
   */
  startLoading(key, message = 'Loading...') {
    this.activeLoaders.set(key, {
      message: message,
      startTime: Date.now()
    });
    this.notifyListeners();
  }

  /**
   * Stop a loading operation
   */
  stopLoading(key) {
    this.activeLoaders.delete(key);
    this.notifyListeners();
  }

  /**
   * Check if currently loading
   */
  isLoading(key = null) {
    if (key) {
      return this.activeLoaders.has(key);
    }
    return this.activeLoaders.size > 0;
  }

  /**
   * Get loading message
   */
  getLoadingMessage(key) {
    const loader = this.activeLoaders.get(key);
    return loader ? loader.message : null;
  }

  /**
   * Get all active loaders
   */
  getActiveLoaders() {
    return Array.from(this.activeLoaders.entries()).map(([key, data]) => ({
      key: key,
      message: data.message,
      duration: Date.now() - data.startTime
    }));
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const isLoading = this.isLoading();
    const loaders = this.getActiveLoaders();
    this.listeners.forEach(callback => {
      try {
        callback({ isLoading, loaders });
      } catch (error) {
        console.error('Loading listener error:', error);
      }
    });
  }

  /**
   * Wrap async function with loading state
   */
  async withLoading(key, message, asyncFn) {
    try {
      this.startLoading(key, message);
      const result = await asyncFn();
      this.stopLoading(key);
      return result;
    } catch (error) {
      this.stopLoading(key);
      throw error;
    }
  }
}

const loadingService = new LoadingService();
export default loadingService;
