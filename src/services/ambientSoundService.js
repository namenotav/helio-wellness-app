// Ambient Sound Service
// Provides ultra-subtle healing background sounds during breathing exercises

class AmbientSoundService {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.gainNodes = [];
    this.isPlaying = false;
    this.audioElement = null; // For playing real meditation music
    this.useRealAudio = true; // Use real meditation audio instead of synthetic
  }

  /**
   * Initialize Web Audio API
   */
  initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Create binaural beats for deep relaxation (theta waves 4-8 Hz)
   */
  createBinauralBeat(frequency = 6) {
    const ctx = this.initAudio();
    
    // Left ear - base frequency (pure tone barely audible)
    const leftOsc = ctx.createOscillator();
    const leftGain = ctx.createGain();
    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(200, ctx.currentTime);
    leftGain.gain.setValueAtTime(0.08, ctx.currentTime); // Subtle but audible
    
    // Right ear - slightly different frequency for binaural effect
    const rightOsc = ctx.createOscillator();
    const rightGain = ctx.createGain();
    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(200 + frequency, ctx.currentTime);
    rightGain.gain.setValueAtTime(0.08, ctx.currentTime);
    
    // Create stereo panner
    const leftPanner = ctx.createStereoPanner();
    const rightPanner = ctx.createStereoPanner();
    leftPanner.pan.setValueAtTime(-1, ctx.currentTime); // Full left
    rightPanner.pan.setValueAtTime(1, ctx.currentTime); // Full right
    
    // Connect nodes
    leftOsc.connect(leftGain);
    leftGain.connect(leftPanner);
    leftPanner.connect(ctx.destination);
    
    rightOsc.connect(rightGain);
    rightGain.connect(rightPanner);
    rightPanner.connect(ctx.destination);
    
    return { leftOsc, rightOsc, leftGain, rightGain };
  }

  /**
   * Create ambient nature sound (gentle wind/breath simulation)
   */
  createWhiteNoise() {
    const ctx = this.initAudio();
    
    // Create buffer for white noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate gentle pink noise (softer than white noise)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // Scale down
      b6 = white * 0.115926;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime); // Gentle high-cut
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime); // Gentle and noticeable
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    return { source, gain };
  }

  /**
   * Create gentle ocean wave sound (very subtle)
   */
  createOceanWave() {
    const ctx = this.initAudio();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(0.3, ctx.currentTime); // Very slow wave
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    
    // Modulate the gain for wave effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    return { osc, lfo, gainNode };
  }

  /**
   * Start ambient healing soundscape
   */
  async start() {
    if (this.isPlaying) return;
    
    try {
      console.log('🎵 Starting ambient healing sounds...');
      
      // Try to use real meditation audio first
      if (this.useRealAudio) {
        try {
          this.audioElement = new Audio('/meditation-ambient.mp3');
          this.audioElement.loop = true;
          this.audioElement.volume = 0.3; // Gentle background volume
          
          // Fade in the audio
          this.audioElement.volume = 0;
          await this.audioElement.play();
          
          // Smooth fade in over 2 seconds
          const fadeIn = setInterval(() => {
            if (this.audioElement.volume < 0.3) {
              this.audioElement.volume = Math.min(0.3, this.audioElement.volume + 0.03);
            } else {
              clearInterval(fadeIn);
            }
          }, 100);
          
          this.isPlaying = true;
          console.log('✅ Real meditation audio playing');
          return;
        } catch (audioError) {
          console.warn('⚠️ Real audio not available, using synthetic sounds:', audioError);
          // Fall back to synthetic sounds
        }
      }
      
      // Fallback: Resume audio context (required for mobile)
      const ctx = this.initAudio();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Create binaural beats (theta waves for deep relaxation)
      const binaural = this.createBinauralBeat(6);
      binaural.leftOsc.start();
      binaural.rightOsc.start();
      this.oscillators.push(binaural.leftOsc, binaural.rightOsc);
      this.gainNodes.push(binaural.leftGain, binaural.rightGain);
      
      // Add gentle white noise (breath-like)
      const noise = this.createWhiteNoise();
      noise.source.start();
      this.oscillators.push(noise.source);
      this.gainNodes.push(noise.gain);
      
      // Add ocean wave
      const ocean = this.createOceanWave();
      ocean.osc.start();
      ocean.lfo.start();
      this.oscillators.push(ocean.osc, ocean.lfo);
      this.gainNodes.push(ocean.gainNode);
      
      this.isPlaying = true;
      console.log('✅ Ambient sounds playing (synthetic)');
      
    } catch (error) {
      console.error('❌ Error starting ambient sounds:', error);
    }
  }

  /**
   * Stop all ambient sounds
   */
  stop() {
    if (!this.isPlaying) return;
    
    try {
      // Stop real audio if playing
      if (this.audioElement) {
        // Fade out real audio
        const fadeOut = setInterval(() => {
          if (this.audioElement && this.audioElement.volume > 0.05) {
            this.audioElement.volume = Math.max(0, this.audioElement.volume - 0.05);
          } else {
            clearInterval(fadeOut);
            if (this.audioElement) {
              this.audioElement.pause();
              this.audioElement.currentTime = 0;
              this.audioElement = null;
            }
          }
        }, 100);
        
        this.isPlaying = false;
        console.log('🔇 Real meditation audio stopped');
        return;
      }
      
      // Stop synthetic sounds
      const fadeTime = 2.0; // 2 second fade out
      const ctx = this.audioContext;
      
      if (ctx && this.gainNodes.length > 0) {
        const now = ctx.currentTime;
        
        this.gainNodes.forEach(gainNode => {
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + fadeTime);
        });
        
        // Stop after fade
        setTimeout(() => {
          this.oscillators.forEach(osc => {
            try {
              osc.stop();
            } catch (e) {
              // Already stopped
            }
          });
          
          this.oscillators = [];
          this.gainNodes = [];
          
          console.log('🔇 Ambient sounds stopped');
        }, fadeTime * 1000);
      }
      
      this.isPlaying = false;
      
    } catch (error) {
      console.error('❌ Error stopping ambient sounds:', error);
    }
  }

  /**
   * Check if sounds are playing
   */
  getIsPlaying() {
    return this.isPlaying;
  }
}

// Create singleton instance
const ambientSoundService = new AmbientSoundService();

export default ambientSoundService;
