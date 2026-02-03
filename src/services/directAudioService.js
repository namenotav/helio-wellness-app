// Direct Audio Files Service - Uses ElevenLabs API for custom voice generation
import { Howl } from 'howler';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import elevenLabsVoiceService from './elevenLabsVoiceService.js';

class DirectAudioService {
  constructor() {
    this.currentVoice = 'female';
    this.currentSpeed = 1.0; // Speed multiplier (0.5x to 2x)
    this.currentAudio = null;
    this.audioCache = new Map();
    this.useTikTokTTS = true; // 🎤 ENABLE TikTok TTS by default (FREE, sounds like ElevenLabs!)
    
    // Load voice preferences from localStorage
    this.loadVoicePreferences();
    
    // 🔒 SECURITY: ElevenLabs uses secure backend proxy (no client-side API key)
    this.useElevenLabs = false; // Will be enabled if backend is available
    this.checkElevenLabsAvailability();

    // Voice configurations - IMPOSSIBLY SLOW (5% speed), audible whisper
    this.voiceConfig = {
      female: {
        // en_us_002 - Sounds like ElevenLabs "Aimee" - soft, warm, ultra-realistic
        voiceId: 'en_us_002',
        name: 'Aimee-like (Ultra Realistic)',
        rate: 0.05, // IMPOSSIBLY SLOW - 5% of normal (minimum possible)
        volume: 0.4 // Soft but audible at extreme slowness
      },
      male: {
        // en_male_narration - Deep, calm, meditation quality
        voiceId: 'en_male_narration',
        name: 'Deep Male (Meditation)',
        rate: 0.05, // IMPOSSIBLY SLOW - 5% of normal (minimum possible)
        volume: 0.4 // Soft but audible at extreme slowness
      }
    };
  }

  /**
   * Check if ElevenLabs backend is available
   */
  async checkElevenLabsAvailability() {
    try {
      // Test if service can initialize
      await elevenLabsVoiceService.initializeFunctions();
      this.useElevenLabs = elevenLabsVoiceService.isEnabled;
      
      if (this.useElevenLabs) {
        if(import.meta.env.DEV)console.log('✅ ElevenLabs backend proxy available');
      } else {
        if(import.meta.env.DEV)console.log('✅ Using TikTok TTS (FREE, ultra-realistic)');
      }
    } catch (e) {
      this.useElevenLabs = false;
      if(import.meta.env.DEV)console.log('✅ TikTok TTS enabled (backend unavailable)');
    }
  }

  /**
   * Load voice preferences from cloud/localStorage
   */
  async loadVoicePreferences() {
    try {
      // 🔥 FIX: Try to load from Firebase first
      const firestoreService = (await import('./firestoreService.js')).default;
      const authService = (await import('./authService.js')).default;
      const userId = authService.getCurrentUser()?.uid;
      
      if (userId) {
        const cloudGender = await firestoreService.get('voice_gender', userId);
        const cloudSpeed = await firestoreService.get('voice_speed', userId);
        
        if (cloudGender) {
          this.currentVoice = cloudGender;
          localStorage.setItem('voice_gender', cloudGender);
        }
        if (cloudSpeed) {
          this.currentSpeed = parseFloat(cloudSpeed);
          localStorage.setItem('voice_speed', cloudSpeed.toString());
        }
        if(import.meta.env.DEV)console.log(`🎤 Loaded voice preferences from cloud: ${this.currentVoice}, ${this.currentSpeed}x`);
        return;
      }
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Could not load voice from cloud, using localStorage');
    }
    
    // Fallback to localStorage
    const savedGender = localStorage.getItem('voice_gender') || 'female';
    const savedSpeed = parseFloat(localStorage.getItem('voice_speed')) || 1.0;
    this.currentVoice = savedGender;
    this.currentSpeed = savedSpeed;
    if(import.meta.env.DEV)console.log(`🎤 Loaded voice preferences: ${savedGender}, ${savedSpeed}x speed`);
  }

  async setVoice(voiceType) {
    this.currentVoice = voiceType;
    localStorage.setItem('voice_gender', voiceType);
    
    // 🔥 FIX: Sync to Firebase
    try {
      const firestoreService = (await import('./firestoreService.js')).default;
      const authService = (await import('./authService.js')).default;
      await firestoreService.save('voice_gender', voiceType, authService.getCurrentUser()?.uid);
    } catch (e) { /* offline mode */ }
    
    if(import.meta.env.DEV)console.log(`🎤 Voice set to: ${voiceType}`);
  }

  /**
   * Set voice speed (0.5x to 2x)
   */
  async setSpeed(speed) {
    this.currentSpeed = Math.max(0.5, Math.min(2.0, speed));
    localStorage.setItem('voice_speed', this.currentSpeed.toString());
    
    // 🔥 FIX: Sync to Firebase
    try {
      const firestoreService = (await import('./firestoreService.js')).default;
      const authService = (await import('./authService.js')).default;
      await firestoreService.save('voice_speed', this.currentSpeed.toString(), authService.getCurrentUser()?.uid);
    } catch (e) { /* offline mode */ }
    
    if(import.meta.env.DEV)console.log(`🎤 Voice speed set to: ${this.currentSpeed}x`);
  }

  /**
   * Get current voice speed
   */
  getSpeed() {
    return this.currentSpeed;
  }

  /**
   * Generate ultra-realistic voice URL using TikTok TTS (FREE, sounds like ElevenLabs)
   * Voice "en_us_002" sounds EXACTLY like Aimee from ElevenLabs
   */
  generateVoiceURL(text) {
    // TikTok TTS voices (completely free, ultra-realistic)
    // en_us_002 = Soft female (sounds like ElevenLabs Aimee - warm, gentle, healing)
    // en_male_narration = Deep male (calm, meditation quality)
    const voiceName = this.currentVoice === 'female' ? 'en_us_002' : 'en_male_narration';
    
    // Dynamic spacing based on speed setting
    // Slower = more spaces (inverse relationship)
    const baseSpacing = 50;
    const spacingMultiplier = 2.0 / this.currentSpeed; // Speed 0.5x = 4x spacing, Speed 2x = 1x spacing
    const spacing = Math.max(5, Math.round(baseSpacing * spacingMultiplier));
    const spacesString = ' '.repeat(spacing);
    
    const softText = text
      .split(' ') // Split by words
      .map(word => {
        // Add spaces between each letter of each word
        return word.split('').join(' ') + spacesString;
      })
      .join('')
    
    // TikTok TTS API endpoint (free, no authentication needed)
    // This voice is ULTRA realistic - people mistake it for real humans
    const url = `https://api16-normal-c-useast1a.tiktokv.com/media/api/text/speech/invoke/?text_speaker=${voiceName}&req_text=${encodeURIComponent(softText)}&speaker_map_type=0&aid=1233`;
    
    return url;
  }

  /**
   * Enable ElevenLabs voice generation
   * @deprecated Backend proxy is used automatically
   */
  enableElevenLabs(apiKey) {
    console.warn('⚠️ enableElevenLabs() is deprecated - backend proxy used automatically');
    this.useElevenLabs = elevenLabsVoiceService.isEnabled;
  }

  /**
   * Pre-generate all breathing phrases with ElevenLabs
   */
  async preGeneratePhrases() {
    if (!this.useElevenLabs) {
      if(import.meta.env.DEV)console.log('⚠️ ElevenLabs not enabled, skipping pre-generation');
      return false;
    }
    return await elevenLabsVoiceService.preGenerateBreathingPhrases();
  }

  /**
   * Speak using TikTok TTS (FREE, sounds like ElevenLabs) with fallback
   */
  async speak(text) {
    if(import.meta.env.DEV)console.log(`🎤 Speaking: "${text}"`);
    
    // Stop any current audio
    this.stop();
    
    // Try TikTok TTS first (FREE, ultra-realistic)
    if (this.useTikTokTTS) {
      try {
        if(import.meta.env.DEV)console.log('🎵 Using TikTok TTS (sounds like ElevenLabs)');
        await this.speakWithTikTok(text);
        return;
      } catch (error) {
        if(import.meta.env.DEV)console.warn('⚠️ TikTok TTS failed, trying local files:', error);
      }
    }
    
    // Try local ElevenLabs MP3 files
    const audioMap = {
      'ready': '/ready.mp3',
      'breathe in': '/breathe-in.mp3',
      'hold': '/hold.mp3',
      'breathe out': '/breathe-out.mp3',
      'rest': '/rest.mp3',
      'complete': '/complete.mp3'
    };
    
    const audioFile = audioMap[text.toLowerCase()];
    
    if (audioFile) {
      try {
        if(import.meta.env.DEV)console.log(`🎵 Playing local voice: ${audioFile}`);
        await this.playAudioFile(audioFile);
        return;
      } catch (error) {
        if(import.meta.env.DEV)console.warn('⚠️ Local audio failed:', error);
      }
    }
    
    // Final fallback: Enhanced native TTS
    if(import.meta.env.DEV)console.log('⚠️ Using enhanced native TTS fallback');
    await this.speakWithTTS(text);
  }

  /**
   * Play ElevenLabs audio file
   */
  async playAudioFile(filePath) {
    return new Promise((resolve, reject) => {
      if(import.meta.env.DEV)console.log(`🎵 Playing ElevenLabs audio: ${filePath}`);
      
      this.currentAudio = new Howl({
        src: [filePath],
        html5: true,
        volume: 0.8,
        onend: () => {
          if(import.meta.env.DEV)console.log('✅ Audio playback complete');
          resolve();
        },
        onloaderror: (id, error) => {
          if(import.meta.env.DEV)console.error('❌ Audio load error:', error);
          reject(error);
        },
        onplayerror: (id, error) => {
          if(import.meta.env.DEV)console.error('❌ Audio play error:', error);
          reject(error);
        }
      });
      
      this.currentAudio.play();
    });
  }

  /**
   * TikTok TTS - FREE, sounds like ElevenLabs "Aimee"
   */
  async speakWithTikTok(text) {
    const voiceUrl = this.generateVoiceURL(text);
    
    return new Promise((resolve, reject) => {
      this.currentAudio = new Howl({
        src: [voiceUrl],
        html5: true,
        format: ['mp3'],
        volume: 0.8,
        onend: () => {
          if(import.meta.env.DEV)console.log('✅ TikTok TTS playback complete');
          resolve();
        },
        onloaderror: (id, error) => {
          if(import.meta.env.DEV)console.error('❌ TikTok TTS load error:', error);
          reject(error);
        },
        onplayerror: (id, error) => {
          if(import.meta.env.DEV)console.error('❌ TikTok TTS play error:', error);
          reject(error);
        }
      });
      
      this.currentAudio.play();
    });
  }

  /**
   * Enhanced native TTS - Better quality fallback
   */
  async speakWithTTS(text) {
    if(import.meta.env.DEV)console.log(`🎤 Using enhanced native TTS at ${this.currentSpeed}x speed`);
    
    try {
      await TextToSpeech.speak({
        text: text,
        lang: 'en-US', // English (US)
        rate: 0.75 * this.currentSpeed, // Apply speed multiplier
        pitch: 1.1, // Slightly higher for warmth
        volume: 0.8, // Clear volume
        category: 'ambient'
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Native TTS error:', error);
    }
  }

  /**
   * Stop current audio
   */
  async stop() {
    // Stop Howl audio
    if (this.currentAudio) {
      this.currentAudio.stop();
      this.currentAudio.unload();
      this.currentAudio = null;
    }
    
    // Stop native TTS
    try {
      await TextToSpeech.stop();
    } catch (error) {
      // Ignore error if TTS wasn't playing
    }
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
    if(import.meta.env.DEV)console.log('🗑️ Audio cache cleared');
  }
}

export default new DirectAudioService();



