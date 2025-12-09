// Direct Audio Files Service - Uses ElevenLabs API for custom voice generation
import { Howl } from 'howler';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import elevenLabsVoiceService from './elevenLabsVoiceService.js';

class DirectAudioService {
  constructor() {
    this.currentVoice = 'female';
    this.currentAudio = null;
    this.audioCache = new Map();
    
    // Auto-enable ElevenLabs if API key is available
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if(import.meta.env.DEV)console.log('🔑 Checking for ElevenLabs API key...', apiKey ? 'FOUND' : 'NOT FOUND');
    if (apiKey) {
      this.useElevenLabs = true;
      elevenLabsVoiceService.setApiKey(apiKey);
      if(import.meta.env.DEV)console.log('✅ ElevenLabs voice automatically enabled with key:', apiKey.substring(0, 10) + '...');
    } else {
      this.useElevenLabs = false;
      if(import.meta.env.DEV)console.warn('⚠️ No ElevenLabs API key found in environment');
    }
    
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

  setVoice(voiceType) {
    this.currentVoice = voiceType;
    if(import.meta.env.DEV)console.log(`🎤 Voice set to: ${voiceType} (real human recording)`);
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
    
    // Make text IMPOSSIBLY slow - maximum spacing possible
    const softText = text
      .split(' ') // Split by words
      .map(word => {
        // Add spaces between each letter of each word
        return word.split('').join(' ') + '                                                  '; // 50 spaces between words!
      })
      .join('')
    
    // TikTok TTS API endpoint (free, no authentication needed)
    // This voice is ULTRA realistic - people mistake it for real humans
    const url = `https://api16-normal-c-useast1a.tiktokv.com/media/api/text/speech/invoke/?text_speaker=${voiceName}&req_text=${encodeURIComponent(softText)}&speaker_map_type=0&aid=1233`;
    
    return url;
  }

  /**
   * Enable ElevenLabs voice generation
   */
  enableElevenLabs(apiKey) {
    this.useElevenLabs = true;
    elevenLabsVoiceService.setApiKey(apiKey);
    if(import.meta.env.DEV)console.log('✅ ElevenLabs voice generation enabled');
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
   * Speak using local MP3 files (Nicole voice from ElevenLabs)
   */
  async speak(text) {
    if(import.meta.env.DEV)console.log(`🎤 Speaking: "${text}"`);
    
    // Stop any current audio
    this.stop();
    
    // Map phrases to audio files
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
        if(import.meta.env.DEV)console.log(`🎵 Playing Nicole voice: ${audioFile}`);
        await this.playAudioFile(audioFile);
        if(import.meta.env.DEV)console.log('✅ Playback complete');
        return;
      } catch (error) {
        if(import.meta.env.DEV)console.error('❌ Audio playback error:', error);
      }
    }
    
    // Fallback to native TTS only if audio file not found
    if(import.meta.env.DEV)console.log('⚠️ Using fallback TTS');
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
   * Natural female voice - Normal calming tone
   */
  async speakWithTTS(text) {
    if(import.meta.env.DEV)console.log('⚠️ Using natural female voice');
    
    try {
      await TextToSpeech.speak({
        text: text,
        lang: 'en-US', // English (US) - Natural voice
        rate: 0.85, // Slightly slower than normal
        pitch: 1.0, // Normal pitch - natural female voice
        volume: 0.7, // Clear volume
        category: 'ambient'
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Native TTS error:', error);
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
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
    if(import.meta.env.DEV)console.log('🗑️ Audio cache cleared');
  }
}

export default new DirectAudioService();



