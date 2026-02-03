/**
 * Firebase Cloud Functions for Helio App
 * Secure backend proxy for sensitive API calls
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// Define secrets (set via: firebase functions:secrets:set ELEVENLABS_API_KEY)
const ELEVENLABS_API_KEY = defineSecret('ELEVENLABS_API_KEY');

/**
 * Generate speech using ElevenLabs API
 * Security: API key never exposed to client
 * 
 * @param {string} text - Text to convert to speech
 * @returns {object} { audioData: base64EncodedMP3 }
 */
export const generateSpeech = onCall(
  { 
    secrets: [ELEVENLABS_API_KEY],
    cors: true,
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 30
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL' } = request.data;

    // Validate input
    if (!text || typeof text !== 'string') {
      throw new HttpsError('invalid-argument', 'Text parameter is required');
    }

    if (text.length > 500) {
      throw new HttpsError('invalid-argument', 'Text must be less than 500 characters');
    }

    try {
      console.log(`🎤 Generating speech for user ${request.auth.uid}: "${text}"`);

      // Call ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY.value()
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.50,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs API error:', response.status, errorText);
        throw new HttpsError('internal', `ElevenLabs API error: ${response.status}`);
      }

      // Convert audio to base64
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Audio = buffer.toString('base64');

      console.log(`✅ Generated ${base64Audio.length} bytes of audio`);

      return {
        audioData: base64Audio,
        mimeType: 'audio/mpeg'
      };

    } catch (error) {
      console.error('❌ Speech generation error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to generate speech');
    }
  }
);

/**
 * Health check endpoint
 */
export const healthCheck = onCall(async (request) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    authenticated: !!request.auth
  };
});
