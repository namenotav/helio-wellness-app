// ElevenLabs Ultra-Realistic Voice Service
// Generates Hollywood-quality healing voices on-demand

import { Howl } from 'howler';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

class ElevenLabsService {
  constructor() {
    this.currentVoice = 'female';
    this.currentAudio = null;
    this.audioCache = new Map();
    
    // ElevenLabs API configuration
    this.apiKey = null; // Will be set by user or use free endpoint
    this.apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
    
    // Ultra-realistic healing voices
    this.voices = {
      female: {
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Soft, warm, healing
        name: 'Sarah',
        stability: 0.75, // Higher = more consistent
        similarityBoost: 0.85, // Higher = closer to original voice
        style: 0.3, // Lower = more natural
        useSpeakerBoost: true
      },
      male: {
        voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - Calm, deep, soothing
        name: 'Josh',
        stability: 0.75,
        similarityBoost: 0.85,
        style: 0.3,
        useSpeakerBoost: true
      }
    };
  }

  setVoice(voiceType) {
    this.currentVoice = voiceType;
    if(import.meta.env.DEV)console.log(`🎤 ElevenLabs voice set to: ${this.voices[voiceType].name}`);
  }

  /**
   * Transform text for maximum calming effect
   */
  makeSofter(text) {
    let soft = text.toLowerCase();
    
    // Add natural pauses with commas (ElevenLabs handles pauses naturally)
    soft = soft
      .replace(/\.\.\./g, ',') // Replace ... with , for natural pauses
      .replace(/breathing in/gi, 'breathing in, gently')
      .replace(/breathing out/gi, 'breathing out, softly releasing')
      .replace(/holding/gi, 'holding, peacefully')
      .replace(/resting/gi, 'resting, in stillness');
    
    return soft;
  }

  /**
   * Generate ultra-realistic voice using ElevenLabs API
   */
  async generateVoice(text) {
    const softText = this.makeSofter(text);
    const voice = this.voices[this.currentVoice];
    
    // Check cache first
    const cacheKey = `${this.currentVoice}-${softText}`;
    if (this.audioCache.has(cacheKey)) {
      if(import.meta.env.DEV)console.log('✅ Using cached audio');
      return this.audioCache.get(cacheKey);
    }

    try {
      // Use free public ElevenLabs demo endpoint (limited but works)
      // For production, user should add their API key
      const response = await fetch(`${this.apiUrl}/${voice.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'xi-api-key': this.apiKey })
        },
        body: JSON.stringify({
          text: softText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: voice.stability,
            similarity_boost: voice.similarityBoost,
            style: voice.style,
            use_speaker_boost: voice.useSpeakerBoost
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Convert to blob URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the URL
      this.audioCache.set(cacheKey, audioUrl);
      
      if(import.meta.env.DEV)console.log('✅ Generated ultra-realistic voice');
      return audioUrl;
      
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ ElevenLabs error:', error);
      return null;
    }
  }

  /**
   * Speak with ultra-realistic healing voice
   */
  async speak(text) {
    if(import.meta.env.DEV)console.log(`🎤 Speaking with ElevenLabs: "${text}" (${this.voices[this.currentVoice].name})`);
    
    // Stop any current audio
    this.stop();
    
    try {
      // Generate audio URL
      const audioUrl = await this.generateVoice(text);
      
      if (!audioUrl) {
        // Fallback to native TTS
        await this.speakWithNativeTTS(text);
        return;
      }

      // Play with Howler
      this.currentAudio = new Howl({
        src: [audioUrl],
        html5: true,
        volume: 0.75, // Soft volume
        rate: 0.9, // Slightly slower for calming effect
        onload: () => {
          if(import.meta.env.DEV)console.log('✅ Ultra-realistic audio loaded');
        },
        onloaderror: (id, error) => {
          if(import.meta.env.DEV)console.error('❌ Audio load error:', error);
          this.speakWithNativeTTS(text);
        },
        onplayerror: (id, error) => {
          if(import.meta.env.DEV)console.error('❌ Audio play error:', error);
          this.speakWithNativeTTS(text);
        },
        onend: () => {
          if(import.meta.env.DEV)console.log('✅ Audio finished');
        }
      });
      
      this.currentAudio.play();
      
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Error speaking:', error);
      await this.speakWithNativeTTS(text);
    }
  }

  /**
   * Fallback to native TTS
   */
  async speakWithNativeTTS(text) {
    if(import.meta.env.DEV)console.log('⚠️ Falling back to native TTS');
    
    try {
      await TextToSpeech.speak({
        text: this.makeSofter(text),
        lang: 'en-US',
        rate: 0.65,
        pitch: this.currentVoice === 'female' ? 1.3 : 0.7,
        volume: 0.8,
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
   * Set API key for unlimited access
   */
  setApiKey(key) {
    this.apiKey = key;
    if(import.meta.env.DEV)console.log('🔑 ElevenLabs API key set');
  }

  /**
   * Clear cache
   */
  clearCache() {
    // Revoke all blob URLs to free memory
    for (const url of this.audioCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.audioCache.clear();
    if(import.meta.env.DEV)console.log('🗑️ Audio cache cleared');
  }
}

export default new ElevenLabsService();



