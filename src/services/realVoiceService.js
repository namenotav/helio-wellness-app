// Real Human Voice Service - Uses actual audio recordings
import { Howl } from 'howler';

class RealVoiceService {
  constructor() {
    this.currentAudio = null;
    this.voice = 'female';
    
    // Pre-recorded phrases with real human voices
    // These will be actual MP3 files with calming, healing voices
    this.voiceLibrary = {
      female: {
        welcome: '/voices/female/welcome.mp3',
        breathingIn: '/voices/female/breathing-in.mp3',
        holding: '/voices/female/holding.mp3',
        breathingOut: '/voices/female/breathing-out.mp3',
        resting: '/voices/female/resting.mp3',
        complete: '/voices/female/complete.mp3'
      },
      male: {
        welcome: '/voices/male/welcome.mp3',
        breathingIn: '/voices/male/breathing-in.mp3',
        holding: '/voices/male/holding.mp3',
        breathingOut: '/voices/male/breathing-out.mp3',
        resting: '/voices/male/resting.mp3',
        complete: '/voices/male/complete.mp3'
      }
    };
  }

  setVoice(voiceType) {
    this.voice = voiceType;
  }

  /**
   * Map text to audio file
   */
  getAudioFile(text) {
    const lowerText = text.toLowerCase();
    const voicePack = this.voiceLibrary[this.voice];
    
    // Map phrases to audio files
    if (lowerText.includes('welcome') || lowerText.includes('settle')) {
      return voicePack.welcome;
    } else if (lowerText.includes('breath') && lowerText.includes('in')) {
      return voicePack.breathingIn;
    } else if (lowerText.includes('hold')) {
      return voicePack.holding;
    } else if (lowerText.includes('breath') && lowerText.includes('out')) {
      return voicePack.breathingOut;
    } else if (lowerText.includes('rest')) {
      return voicePack.resting;
    } else if (lowerText.includes('beautiful') || lowerText.includes('complete')) {
      return voicePack.complete;
    }
    
    // Default to breathing in
    return voicePack.breathingIn;
  }

  /**
   * Speak using real human voice recording
   */
  async speak(text) {
    return new Promise((resolve) => {
      if(import.meta.env.DEV)console.log(`🎤 Playing real human voice: "${text}"`);
      
      // Stop current audio
      if (this.currentAudio) {
        this.currentAudio.stop();
      }

      // Get the appropriate audio file
      const audioFile = this.getAudioFile(text);
      
      // Check if file exists, if not use TTS fallback
      this.currentAudio = new Howl({
        src: [audioFile],
        volume: 1.0,
        onend: () => {
          if(import.meta.env.DEV)console.log('✅ Real voice completed');
          resolve();
        },
        onloaderror: (id, error) => {
          if(import.meta.env.DEV)console.warn('⚠️ Voice file not found, using TTS:', error);
          // Fallback to TTS
          this.speakWithTTS(text).then(resolve);
        },
        onplayerror: () => {
          if(import.meta.env.DEV)console.warn('⚠️ Playback error, using TTS');
          this.speakWithTTS(text).then(resolve);
        }
      });

      this.currentAudio.play();
    });
  }

  /**
   * Fallback TTS
   */
  async speakWithTTS(text) {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    
    try {
      await TextToSpeech.speak({
        text: text,
        lang: 'en-US',
        rate: 0.65,
        pitch: this.voice === 'female' ? 1.3 : 0.7,
        volume: 1.0
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('TTS fallback error:', error);
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.stop();
    }
  }
}

const realVoiceService = new RealVoiceService();
export default realVoiceService;



