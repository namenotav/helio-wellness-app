/**
 * EMERGENCY FALLBACK: Direct Android WebView Interface
 * Use this if Capacitor plugin keeps failing
 */

class HealthConnectDirectBridge {
  async checkAvailability() {
    try {
      if (window.AndroidHealthConnect) {
        const resultStr = window.AndroidHealthConnect.checkAvailability();
        const result = JSON.parse(resultStr);
        console.log('🔧 DIRECT BRIDGE: Health Connect availability:', result);
        return result;
      } else {
        console.error('❌ AndroidHealthConnect bridge not found');
        return { available: false, error: 'Bridge not initialized' };
      }
    } catch (error) {
      console.error('❌ Direct bridge error:', error);
      return { available: false, error: error.message };
    }
  }

  async requestPermissions() {
    try {
      if (window.AndroidHealthConnect) {
        window.AndroidHealthConnect.requestPermissions();
        console.log('🔧 DIRECT BRIDGE: Requested HC permissions');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to request permissions via bridge:', error);
      return false;
    }
  }

  async openSettings() {
    try {
      if (window.AndroidHealthConnect) {
        window.AndroidHealthConnect.openHealthConnectSettings();
        console.log('🔧 DIRECT BRIDGE: Opened HC settings');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to open settings via bridge:', error);
      return false;
    }
  }

  async checkPermissions() {
    try {
      if (window.AndroidHealthConnect) {
        const resultStr = window.AndroidHealthConnect.checkPermissions();
        const result = JSON.parse(resultStr);
        console.log('🔧 DIRECT BRIDGE: Permissions:', result);
        return result;
      }
      return { hasAllPermissions: false };
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      return { hasAllPermissions: false };
    }
  }
}

export default new HealthConnectDirectBridge();
