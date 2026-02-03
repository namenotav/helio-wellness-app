// ElevenLabs Voice Generation Service - Secure Backend Proxy
import { Filesystem, Directory } from '@capacitor/filesystem';
import { getFunctions, httpsCallable } from 'firebase/functions';

class ElevenLabsVoiceService {
  constructor() {
    // 🔒 SECURITY: No API key stored client-side
    this.voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Nicole voice ID
    this.audioCache = new Map();
    this.functions = null;
    this.isEnabled = false;
    
    // Initialize Firebase Functions
    this.initializeFunctions();
  }

  /**
   * Initialize Firebase Functions connection
   */
  async initializeFunctions() {
    try {
      const { app } = await import('./firebase.js');
      this.functions = getFunctions(app);
      this.isEnabled = true;
      console.log('✅ ElevenLabs backend proxy initialized');
    } catch (error) {
      console.warn('⚠️ ElevenLabs backend unavailable, TikTok TTS will be used');
      this.isEnabled = false;
    }
  }

  /**
   * @deprecated Legacy method for compatibility
   */
  setApiKey(apiKey) {
    console.warn('⚠️ setApiKey() is deprecated - using secure backend proxy');
  }

  /**
   * Generate speech from text using secure backend proxy
   */
  async generateSpeech(text) {
    if (!this.isEnabled) {
      console.log('⚠️ ElevenLabs unavailable, use TikTok TTS fallback');
      return null;
    }

    // Check cache first
    if (this.audioCache.has(text)) {
      console.log(`📦 Using cached audio for: "${text}"`);
      return this.audioCache.get(text);
    }

    try {
      console.log(`🎤 Requesting speech generation via secure proxy: "${text}"`);

      // Call Firebase Cloud Function (API key is server-side only)
      const generateSpeechFunc = httpsCallable(this.functions, 'generateSpeech');
      const result = await generateSpeechFunc({ 
        text: text, 
        voiceId: this.voiceId 
      });

      // Convert base64 back to blob URL
      const base64Audio = result.data.audioData;
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the audio URL
      this.audioCache.set(text, audioUrl);

      console.log(`✅ Generated voice via secure proxy: "${text}"`);
      return audioUrl;

    } catch (error) {
      console.error('❌ ElevenLabs proxy error:', error);
      return null;
    }
  }

  /**
   * Pre-generate all breathing exercise phrases
   */
  async preGenerateBreathingPhrases() {
    const phrases = [
      'ready',
      'breathe in',
      'hold',
      'breathe out',
      'rest',
      'complete'
    ];

    console.log('🎤 Pre-generating all breathing phrases...');

    const promises = phrases.map(phrase => this.generateSpeech(phrase));
    const results = await Promise.all(promises);

    const successCount = results.filter(url => url !== null).length;
    console.log(`✅ Generated ${successCount}/${phrases.length} phrases`);

    return successCount === phrases.length;
  }

  /**
   * Download and save audio file locally
   */
  async downloadAndSaveAudio(text, filename) {
    const audioUrl = await this.generateSpeech(text);
    if (!audioUrl) return null;

    try {
      // Fetch the audio blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64Data = reader.result.split(',')[1];
          
          try {
            const result = await Filesystem.writeFile({
              path: `audio/${filename}`,
              data: base64Data,
              directory: Directory.Data
            });

            console.log(`✅ Saved audio file: ${filename}`);
            resolve(result.uri);
          } catch (error) {
            console.error('❌ Error saving audio file:', error);
            reject(error);
          }
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error('❌ Error downloading audio:', error);
      return null;
    }
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    // Revoke all object URLs to free memory
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
    console.log('🗑️ ElevenLabs audio cache cleared');
  }
}

export default new ElevenLabsVoiceService();
