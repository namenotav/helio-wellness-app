// Voice Installer - Helps user install premium Google TTS voices
import { TextToSpeech } from '@capacitor-community/text-to-speech';

class VoiceInstaller {
  /**
   * Check if premium voices are available
   */
  async checkVoiceQuality() {
    try {
      // Get list of available voices
      const result = await TextToSpeech.getSupportedVoices();
      const voices = result.voices || [];
      
      console.log('Available voices:', voices.length);
      
      // Check for Google's premium neural voices
      const hasGoogleVoice = voices.some(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Google') || v.name.includes('Neural'))
      );
      
      return {
        hasVoices: voices.length > 0,
        hasPremiumVoices: hasGoogleVoice,
        voiceCount: voices.length,
        voices: voices
      };
    } catch (error) {
      console.error('Error checking voices:', error);
      return { hasVoices: false, hasPremiumVoices: false, voiceCount: 0 };
    }
  }

  /**
   * Guide user to install better voices
   */
  showVoiceInstallationGuide() {
    const guide = `
🎤 To get the most calming, healing voice experience:

1. Open your phone's Settings
2. Go to: System → Languages & input → Text-to-speech output
3. Tap the Settings icon next to "Google Text-to-speech Engine"
4. Tap "Install voice data"
5. Download "English (UK)" - Female voice
   (This is the most soothing, calming voice)

After installing, restart the app for the new voice to work!

The UK English female voice has a warm, gentle, healing quality that will give you goosebumps. ✨
    `;
    
    return guide;
  }

  /**
   * Open Android TTS settings
   */
  async openTTSSettings() {
    try {
      // On Android, we can prompt user to check settings
      const shouldOpen = confirm(
        'For the best calming voice experience, install Google\'s premium voices.\n\n' +
        'Would you like instructions on how to install them?'
      );
      
      if (shouldOpen) {
        alert(this.showVoiceInstallationGuide());
      }
    } catch (error) {
      console.error('Error opening TTS settings:', error);
    }
  }
}

const voiceInstaller = new VoiceInstaller();
export default voiceInstaller;
