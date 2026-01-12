// ElevenLabs Voice Generation Service
import { Filesystem, Directory } from '@capacitor/filesystem';

class ElevenLabsVoiceService {
  constructor() {
    // Get API key from environment or user settings
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Nicole voice ID (the voice you downloaded)
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.audioCache = new Map();
    
    // Auto-enable if API key is present
    if (this.apiKey) {
      console.log('✅ ElevenLabs API key loaded from environment');
    }
  }

  /**
   * Set ElevenLabs API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    console.log('✅ ElevenLabs API key set');
  }

  /**
   * Generate speech from text using ElevenLabs Nicole voice
   */
  async generateSpeech(text) {
    if (!this.apiKey) {
      console.error('❌ ElevenLabs API key not set');
      return null;
    }

    // Check cache first
    if (this.audioCache.has(text)) {
      console.log(`📦 Using cached audio for: "${text}"`);
      return this.audioCache.get(text);
    }

    try {
      console.log(`🎤 Generating ElevenLabs voice for: "${text}"`);

      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', // Use newer model for better quality
          voice_settings: {
            stability: 0.50,        // Exact match from your download (s50)
            similarity_boost: 0.75, // Exact match from your download (sb75)
            style: 0.0,             // Exact match from your download (se0)
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the audio URL
      this.audioCache.set(text, audioUrl);

      console.log(`✅ Generated voice for: "${text}"`);
      return audioUrl;

    } catch (error) {
      console.error('❌ ElevenLabs voice generation error:', error);
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
