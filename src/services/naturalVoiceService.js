// Natural Voice Service - Uses free TTS API for ultra-realistic voices
// No local MP3 files needed

import { Howl } from 'howler';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

class NaturalVoiceService {
  constructor() {
    this.currentVoice = 'female';
    this.currentAudio = null;
    this.audioCache = new Map(); // Cache generated audio URLs
    
    // Configuration for ultra-natural SOFT voices
    this.config = {
      female: {
        // Using Google Translate TTS (free, no API key needed)
        voice: 'en-IN', // Indian English Female (softest, most gentle)
        speed: 0.5, // VERY slow for maximum calming effect
        pitch: 'low', // Lower pitch is more calming
      },
      male: {
        voice: 'en-GB', // British English Male (calm, warm tone)
        speed: 0.5, // VERY slow for soothing delivery
        pitch: 'low',
      }
    };
  }

  setVoice(voiceType) {
    this.currentVoice = voiceType;
    console.log(`🎤 Voice set to: ${voiceType}`);
  }

  /**
   * Generate audio URL from text using free Google Translate TTS
   * This is completely free with no API key or rate limits
   */
  getAudioURL(text) {
    // Make text softer and more gentle
    const softText = this.makeSofter(text);
    
    const lang = this.config[this.currentVoice].voice;
    
    // Google Translate TTS endpoint (free, public)
    // Using slower speed parameter for calming effect
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&ttsspeed=0.5&q=${encodeURIComponent(softText)}`;
    
    return url;
  }
  
  /**
   * Transform text to be softer and more soothing
   */
  makeSofter(text) {
    let soft = text.toLowerCase();
    
    // Add gentle pauses and softer language
    soft = soft
      .replace(/breathing in/gi, 'softly... breathing in... gently')
      .replace(/breathing out/gi, 'breathing out... releasing... letting go')
      .replace(/holding/gi, 'holding... peacefully... calmly')
      .replace(/resting/gi, 'resting... in stillness... in peace')
      .replace(/welcome/gi, 'welcome... take your time... no rush... just relax')
      .replace(/complete/gi, 'wonderful... you did beautifully... feel the peace within');
    
    // Add ellipses for natural pauses
    soft = soft.replace(/\./g, '...');
    
    return soft;
  }

  /**
   * Speak with ultra-natural voice
   */
  async speak(text) {
    console.log(`🎤 Speaking: "${text}" (${this.currentVoice})`);
    
    // Stop any current audio
    this.stop();
    
    try {
      // Check cache first
      const cacheKey = `${this.currentVoice}-${text}`;
      
      if (!this.audioCache.has(cacheKey)) {
        const audioURL = this.getAudioURL(text);
        this.audioCache.set(cacheKey, audioURL);
      }
      
      const url = this.audioCache.get(cacheKey);
      
      // Create and play audio with Howler
      this.currentAudio = new Howl({
        src: [url],
        html5: true, // Use HTML5 Audio for streaming
        volume: 0.7, // Lower volume for softer, less commanding tone
        rate: 0.85, // Slightly slower playback for gentler delivery
        onload: () => {
          console.log(`✅ Audio loaded: ${text}`);
        },
        onloaderror: (id, error) => {
          console.error('❌ Audio load error:', error);
          // Fallback to native TTS
          this.speakWithNativeTTS(text);
        },
        onplayerror: (id, error) => {
          console.error('❌ Audio play error:', error);
          // Fallback to native TTS
          this.speakWithNativeTTS(text);
        },
        onend: () => {
          console.log('✅ Audio finished');
        }
      });
      
      this.currentAudio.play();
      
    } catch (error) {
      console.error('❌ Error speaking:', error);
      // Fallback to native TTS
      await this.speakWithNativeTTS(text);
    }
  }

  /**
   * Fallback to native TTS if audio fails
   */
  async speakWithNativeTTS(text) {
    console.log('⚠️ Falling back to native TTS');
    
    try {
      const config = {
        text,
        lang: 'en-US',
        rate: 0.65,
        pitch: this.currentVoice === 'female' ? 1.3 : 0.7,
        volume: 0.9,
        category: 'ambient'
      };
      
      await TextToSpeech.speak(config);
    } catch (error) {
      console.error('❌ Native TTS error:', error);
    }
  }

  /**
   * Stop current audio
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.stop();
      this.currentAudio.unload();
      this.currentAudio = null;
    }
  }

  /**
   * Preload audio for smoother playback
   */
  async preload(texts) {
    console.log('📦 Preloading audio...');
    
    for (const text of texts) {
      const cacheKey = `${this.currentVoice}-${text}`;
      if (!this.audioCache.has(cacheKey)) {
        const audioURL = this.getAudioURL(text);
        this.audioCache.set(cacheKey, audioURL);
      }
    }
    
    console.log('✅ Audio preloaded');
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
    console.log('🗑️ Audio cache cleared');
  }
}

export default new NaturalVoiceService();
