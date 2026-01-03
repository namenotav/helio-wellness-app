// Voice Preferences Service - Centralized voice settings management
class VoicePreferencesService {
  constructor() {
    this.defaults = {
      gender: 'female',
      speed: 1.0,
      profile: 'auto' // 'auto', 'manual', 'calm', 'energetic'
    };
  }

  // Get all preferences
  getPreferences() {
    return {
      gender: localStorage.getItem('voice_gender') || this.defaults.gender,
      speed: parseFloat(localStorage.getItem('voice_speed')) || this.defaults.speed,
      profile: localStorage.getItem('voice_profile') || this.defaults.profile
    };
  }

  // Set gender preference
  setGender(gender) {
    if (!['male', 'female'].includes(gender)) {
      throw new Error('Invalid gender. Must be "male" or "female"');
    }
    localStorage.setItem('voice_gender', gender);
    if(import.meta.env.DEV)console.log(`🎤 Voice gender set to: ${gender}`);
  }

  // Set speed preference
  setSpeed(speed) {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
    localStorage.setItem('voice_speed', clampedSpeed.toString());
    if(import.meta.env.DEV)console.log(`🎤 Voice speed set to: ${clampedSpeed}x`);
  }

  // Set voice profile
  setProfile(profile) {
    const validProfiles = ['auto', 'manual', 'calm', 'energetic'];
    if (!validProfiles.includes(profile)) {
      throw new Error(`Invalid profile. Must be one of: ${validProfiles.join(', ')}`);
    }
    localStorage.setItem('voice_profile', profile);
    if(import.meta.env.DEV)console.log(`🎤 Voice profile set to: ${profile}`);
  }

  // Auto-select voice based on context
  getVoiceForContext(context) {
    const profile = this.getPreferences().profile;
    const manualPrefs = this.getPreferences();
    
    if (profile === 'manual') {
      // User has manual control - use their preference
      if(import.meta.env.DEV)console.log(`🎤 Manual mode: ${manualPrefs.gender}, ${manualPrefs.speed}x`);
      return manualPrefs;
    }
    
    if (profile === 'calm') {
      // Always use calm voice
      return { gender: 'female', speed: 0.7, description: 'Always Calm' };
    }
    
    if (profile === 'energetic') {
      // Always use energetic voice
      return { gender: 'male', speed: 1.3, description: 'Always Energetic' };
    }
    
    // Auto-profile selection based on context
    const contextProfiles = {
      breathing: { gender: 'female', speed: 0.8, description: 'Calm female for breathing' },
      meditation: { gender: 'female', speed: 0.7, description: 'Slow female for meditation' },
      workout: { gender: 'male', speed: 1.2, description: 'Energetic male for workouts' },
      aiChat: { gender: 'female', speed: 1.0, description: 'Natural female for AI chat' },
      stressRelief: { gender: 'female', speed: 0.8, description: 'Calm female for stress relief' },
      energizing: { gender: 'male', speed: 1.2, description: 'Energetic male for motivation' },
      default: { gender: 'female', speed: 1.0, description: 'Default voice' }
    };
    
    const selectedVoice = contextProfiles[context] || contextProfiles.default;
    if(import.meta.env.DEV)console.log(`🎤 Auto mode: ${context} → ${selectedVoice.description}`);
    return selectedVoice;
  }

  // Reset to defaults
  reset() {
    localStorage.removeItem('voice_gender');
    localStorage.removeItem('voice_speed');
    localStorage.removeItem('voice_profile');
    if(import.meta.env.DEV)console.log('🎤 Voice preferences reset to defaults');
  }
}

export default new VoicePreferencesService();
