import { Geolocation } from '@capacitor/geolocation';

class LocationAccessManager {
  constructor() {
    this.COOLDOWN_MS = 120000; // 2 minutes to avoid log spam when OS blocks location
    this.lastDecision = 'unknown';
    this.lastDeniedAt = 0;
  }

  buildError(code, message, extra = {}) {
    const error = new Error(message);
    error.code = code;
    return Object.assign(error, extra);
  }

  isTemporarilyBlocked() {
    if (this.lastDecision !== 'denied') {
      return false;
    }
    return Date.now() - this.lastDeniedAt < this.COOLDOWN_MS;
  }

  getCooldownRemaining() {
    if (!this.isTemporarilyBlocked()) {
      return 0;
    }
    return Math.max(0, this.COOLDOWN_MS - (Date.now() - this.lastDeniedAt));
  }

  getCooldownDuration() {
    return this.COOLDOWN_MS;
  }

  markDenied() {
    this.lastDecision = 'denied';
    this.lastDeniedAt = Date.now();
  }

  markGranted() {
    this.lastDecision = 'granted';
  }

  noteSuccessfulRead() {
    this.markGranted();
  }

  async ensurePermission(options = {}) {
    const { forceRequest = false } = options;

    if (!forceRequest && this.isTemporarilyBlocked()) {
      throw this.buildError(
        'LOCATION_TEMP_BLOCKED',
        'Location permission is temporarily blocked by the system',
        { retryIn: this.getCooldownRemaining() }
      );
    }

    const status = await Geolocation.checkPermissions();
    if (status.location === 'granted') {
      this.markGranted();
      return true;
    }

    if (!forceRequest) {
      this.markDenied();
      throw this.buildError(
        'LOCATION_PERMISSION_DENIED',
        'Location permission not granted for background request',
        { retryIn: this.COOLDOWN_MS }
      );
    }

    const requested = await Geolocation.requestPermissions();
    if (requested.location === 'granted') {
      this.markGranted();
      return true;
    }

    this.markDenied();
    throw this.buildError(
      'LOCATION_PERMISSION_DENIED',
      'Location permission denied by user or OS',
      { retryIn: this.COOLDOWN_MS }
    );
  }

  handleLocationError(error) {
    const code = error?.code ?? error?.error;
    const message = (error?.message || '').toLowerCase();
    if (
      code === 1 ||
      code === 'PERMISSION_DENIED' ||
      message.includes('permission') ||
      message.includes('denied') ||
      message.includes('oplus')
    ) {
      this.markDenied();
    }
  }
}

const locationAccessManager = new LocationAccessManager();
export default locationAccessManager;
