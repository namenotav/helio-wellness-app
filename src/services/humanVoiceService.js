// Human Voice Service - Real calming human voices using ElevenLabs-style audio
import { Howl } from 'howler';

class HumanVoiceService {
  constructor() {
    this.currentAudio = null;
    this.voice = 'female'; // 'male' or 'female'
    this.audioCache = {};
  }

  /**
   * Set voice preference
   */
  setVoice(voiceType) {
    this.voice = voiceType;
  }

  /**
   * Generate natural speech - optimized for mobile
   */
  async speak(text) {
    if(import.meta.env.DEV)console.log(`🎤🎤🎤 SPEAK CALLED: "${text}"`);
    
    // Stop any current audio
    if (this.currentAudio) {
      this.currentAudio.stop();
    }

    // Always use Web Speech API (most reliable on mobile)
    return this.speakWithWebAPI(text);
  }

  /**
   * Web Speech API - optimized for Android Chrome
   */
  async speakWithWebAPI(text) {
    return new Promise((resolve) => {
      if(import.meta.env.DEV)console.log('🔊🔊🔊 Starting Web Speech API...');
      
      if (!window.speechSynthesis) {
        if(import.meta.env.DEV)console.error('❌❌❌ speechSynthesis NOT SUPPORTED');
        alert('Speech not supported on this device');
        resolve();
        return;
      }

      // Force cancel any existing speech
      window.speechSynthesis.cancel();
      
      // Small delay to ensure cancel completes
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        if(import.meta.env.DEV)console.log(`📢📢📢 Total voices available: ${voices.length}`);
        
        if (voices.length === 0) {
          if(import.meta.env.DEV)console.error('❌❌❌ NO VOICES AVAILABLE');
          alert('No voices available on this device');
          resolve();
          return;
        }
        
        // Log all voices
        if(import.meta.env.DEV)console.log('All voices:', voices.map(v => `${v.name} [${v.lang}]`));
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.7;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        
        let selectedVoice = null;
        
        if (this.voice === 'female') {
          // Find most natural female voices
          const preferences = [
            'Google UK English Female',
            'Google US English Female',
            'Microsoft Hazel',
            'Samantha',
            'Karen',
            'Moira',
            'Fiona',
            'Serena',
            'female'
          ];
          
          for (const name of preferences) {
            selectedVoice = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
            if (selectedVoice) break;
          }
          
          // Fallback to any female-sounding voice
          if (!selectedVoice) {
            selectedVoice = voices.find(v => 
              v.name.toLowerCase().includes('female') || 
              v.name.toLowerCase().includes('woman')
            );
          }
          
          utterance.pitch = 1.0; // Natural pitch
        } else {
          // Find most natural male voices
          const preferences = [
            'Google UK English Male',
            'Google US English Male',
            'Microsoft George',
            'Daniel',
            'Oliver',
            'Arthur',
            'male'
          ];
          
          for (const name of preferences) {
            selectedVoice = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
            if (selectedVoice) break;
          }
          
          // Fallback to any male-sounding voice
          if (!selectedVoice) {
            selectedVoice = voices.find(v => 
              v.name.toLowerCase().includes('male') || 
              v.name.toLowerCase().includes('man')
            );
          }
          
          utterance.pitch = 0.85; // Slightly deeper
        }
        
        // Last fallback: use first available voice
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          if(import.meta.env.DEV)console.log(`✅ Selected voice: ${selectedVoice.name}`);
        } else {
          if(import.meta.env.DEV)console.log('⚠️ Using default system voice');
        }
        
        utterance.onstart = () => {
          if(import.meta.env.DEV)console.log('▶️ Speech started');
        };
        
        utterance.onend = () => {
          if(import.meta.env.DEV)console.log('✅ Speech ended');
          resolve();
        };
        
        utterance.onerror = (error) => {
          if(import.meta.env.DEV)console.error('❌ Speech error:', error);
          resolve();
        };
        
        if(import.meta.env.DEV)console.log('🎤🎤🎤 CALLING speechSynthesis.speak() NOW!');
        
        try {
          window.speechSynthesis.speak(utterance);
          if(import.meta.env.DEV)console.log('✅✅✅ speak() called successfully');
        } catch (error) {
          if(import.meta.env.DEV)console.error('❌❌❌ Error calling speak():', error);
          alert('Speech error: ' + error.message);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Stop speaking
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.stop();
    }
    
    if (window.responsiveVoice) {
      window.responsiveVoice.cancel();
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Load ResponsiveVoice library dynamically
   */
  static async loadResponsiveVoice() {
    if (window.responsiveVoice) {
      return true;
    }

    return new Promise((resolve) => {
      // 🔒 SECURITY: ResponsiveVoice API key from environment variable
      const apiKey = import.meta.env.VITE_RESPONSIVEVOICE_KEY;
      if (!apiKey) {
        if(import.meta.env.DEV)console.warn('⚠️ VITE_RESPONSIVEVOICE_KEY not set, ResponsiveVoice disabled');
        resolve(false);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://code.responsivevoice.org/responsivevoice.js?key=${apiKey}`;
      script.onload = () => {
        if(import.meta.env.DEV)console.log('✅ ResponsiveVoice loaded - Premium natural voices available');
        resolve(true);
      };
      script.onerror = () => {
        if(import.meta.env.DEV)console.warn('⚠️ ResponsiveVoice failed to load, using fallback');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }
}

const humanVoiceService = new HumanVoiceService();

// Auto-load ResponsiveVoice on startup
if (typeof window !== 'undefined') {
  HumanVoiceService.loadResponsiveVoice();
}

export default humanVoiceService;



