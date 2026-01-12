// Dark Mode Service
// System-wide theme management

class DarkModeService {
  constructor() {
    this.isDarkMode = false;
    this.isAutoMode = true;
    this.listeners = [];
  }

  /**
   * Initialize dark mode
   */
  initialize() {
    // Load saved preference
    const saved = localStorage.getItem('dark_mode');
    const autoMode = localStorage.getItem('dark_mode_auto');

    if (autoMode !== null) {
      this.isAutoMode = autoMode === 'true';
    }

    if (this.isAutoMode) {
      // Follow system preference
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Listen for system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.isAutoMode) {
          this.setDarkMode(e.matches);
        }
      });
    } else if (saved !== null) {
      this.isDarkMode = saved === 'true';
    }

    this.applyTheme();
    console.log(`🌓 Dark mode initialized: ${this.isDarkMode ? 'dark' : 'light'}`);
  }

  /**
   * Toggle dark mode
   */
  toggle() {
    this.isAutoMode = false;
    this.setDarkMode(!this.isDarkMode);
    localStorage.setItem('dark_mode_auto', 'false');
  }

  /**
   * Set dark mode
   */
  setDarkMode(enabled) {
    this.isDarkMode = enabled;
    this.applyTheme();
    this.notifyListeners();
    
    localStorage.setItem('dark_mode', enabled.toString());
    console.log(`🌓 Dark mode: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable auto mode (follow system)
   */
  setAutoMode(enabled) {
    this.isAutoMode = enabled;
    localStorage.setItem('dark_mode_auto', enabled.toString());

    if (enabled) {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(systemDark);
    }
  }

  /**
   * Apply theme to document
   */
  applyTheme() {
    const root = document.documentElement;

    if (this.isDarkMode) {
      root.classList.add('dark-mode');
      root.style.setProperty('--bg-primary', '#121212');
      root.style.setProperty('--bg-secondary', '#1E1E1E');
      root.style.setProperty('--bg-tertiary', '#2D2D2D');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#B0B0B0');
      root.style.setProperty('--text-tertiary', '#808080');
      root.style.setProperty('--border-color', '#3D3D3D');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.5)');
    } else {
      root.classList.remove('dark-mode');
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F5F7FA');
      root.style.setProperty('--bg-tertiary', '#E0E4E8');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--text-tertiary', '#999999');
      root.style.setProperty('--border-color', '#E0E0E0');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
    }
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.isDarkMode);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * Get current theme
   */
  getTheme() {
    return {
      isDark: this.isDarkMode,
      isAuto: this.isAutoMode,
      mode: this.isDarkMode ? 'dark' : 'light'
    };
  }
}

const darkModeService = new DarkModeService();
export default darkModeService;
