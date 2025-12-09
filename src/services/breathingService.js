// Breathing Exercise Service
// Provides guided breathing exercises with voice guidance and animations
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import ambientSoundService from './ambientSoundService';
import directAudioService from './directAudioService';

class BreathingService {
  constructor() {
    this.isActive = false;
    this.currentPattern = null;
    this.currentCycle = 0;
    this.totalCycles = 0;
    this.voice = 'female'; // 'male' or 'female'
    this.ambientSound = ambientSoundService;
    this.tts = TextToSpeech;
    this.audioService = directAudioService; // ✨ REAL HUMAN VOICE RECORDINGS
    this.useRealVoice = true; // Use actual human voice files
  }

  /**
   * Breathing patterns - scientifically proven techniques
   */
  patterns = {
    box: {
      name: 'Box Breathing',
      description: 'Navy SEAL technique - Perfect for stress relief and focus',
      phases: [
        { type: 'inhale', duration: 4, text: 'breathe in', audio: '/box-inhale.mp3' },
        { type: 'hold', duration: 4, text: 'hold', audio: '/box-hold.mp3' },
        { type: 'exhale', duration: 4, text: 'breathe out', audio: '/box-exhale.mp3' },
        { type: 'hold', duration: 4, text: 'rest', audio: '/box-hold2.mp3' }
      ],
      icon: '📦',
      benefits: ['Reduces stress', 'Improves focus', 'Calms nervous system'],
      welcomeAudio: '/box-welcome.mp3',
      completeAudio: '/box-complete.mp3'
    },
    relaxing: {
      name: '4-7-8 Breathing',
      description: 'Dr. Andrew Weil method - Induces natural sleep',
      phases: [
        { type: 'inhale', duration: 4, text: 'breathe in', audio: '/box-inhale.mp3' },
        { type: 'hold', duration: 7, text: 'hold', audio: '/box-hold.mp3' },
        { type: 'exhale', duration: 8, text: 'breathe out slowly', audio: '/breathe-out-slowly.mp3' }
      ],
      icon: '😴',
      benefits: ['Promotes sleep', 'Reduces anxiety', 'Deep relaxation'],
      welcomeAudio: '/478-welcome.mp3',
      completeAudio: '/478-complete.mp3'
    },
    coherent: {
      name: 'Coherent Breathing',
      description: 'Heart Rate Variability optimization',
      phases: [
        { type: 'inhale', duration: 5, text: 'breathe in', audio: '/box-inhale.mp3' },
        { type: 'exhale', duration: 5, text: 'breathe out', audio: '/box-exhale.mp3' }
      ],
      icon: '❤️',
      benefits: ['Heart health', 'Mental clarity', 'Emotional balance'],
      welcomeAudio: '/coherent-welcome.mp3',
      completeAudio: '/coherent-complete.mp3'
    },
    energizing: {
      name: 'Energizing Breath',
      description: 'Morning boost - Increases alertness',
      phases: [
        { type: 'inhale', duration: 4, text: 'breathe in', audio: '/box-inhale.mp3' },
        { type: 'hold', duration: 2, text: 'hold', audio: '/box-hold.mp3' },
        { type: 'exhale', duration: 4, text: 'breathe out', audio: '/box-exhale.mp3' },
        { type: 'hold', duration: 2, text: 'rest', audio: '/rest.mp3' }
      ],
      icon: '⚡',
      benefits: ['Boosts energy', 'Improves alertness', 'Morning wake-up'],
      welcomeAudio: '/energizing-welcome.mp3',
      completeAudio: '/energizing-complete.mp3'
    },
    deepRelax: {
      name: 'Deep Relaxation',
      description: 'Extended exhale for maximum calm',
      phases: [
        { type: 'inhale', duration: 4, text: 'breathe in', audio: '/box-inhale.mp3' },
        { type: 'hold', duration: 4, text: 'hold', audio: '/box-hold.mp3' },
        { type: 'exhale', duration: 6, text: 'breathe out slowly', audio: '/breathe-out-slowly.mp3' },
        { type: 'hold', duration: 2, text: 'rest', audio: '/rest.mp3' }
      ],
      icon: '🧘',
      benefits: ['Deep relaxation', 'Meditation support', 'Stress relief'],
      welcomeAudio: '/relaxation-welcome.mp3',
      completeAudio: '/relaxation-complete.mp3'
    }
  };

  /**
   * Get all available patterns
   */
  getPatterns() {
    return Object.entries(this.patterns).map(([key, pattern]) => ({
      id: key,
      ...pattern
    }));
  }

  /**
   * Set voice preference
   */
  setVoice(voiceType) {
    this.voice = voiceType; // 'male' or 'female'
    this.audioService.setVoice(voiceType); // Set audio service voice
    localStorage.setItem('breathing_voice_preference', voiceType);
  }

  /**
   * Get voice preference
   */
  getVoicePreference() {
    return localStorage.getItem('breathing_voice_preference') || 'female';
  }

  /**
   * Speak instruction using Nicole's voice audio files
   */
  async speak(text, rate = 0.65, audioFile = null) {
    try {
      if(import.meta.env.DEV)console.log(`🎤 Speaking: "${text}"` + (audioFile ? ` (audio: ${audioFile})` : ''));
      
      // Use Nicole's custom audio file if provided
      if (audioFile) {
        await this.audioService.playAudioFile(audioFile);
      } else if (this.useRealVoice) {
        // ✨ Use REAL human meditation guide voice recordings
        await this.audioService.speak(text);
      } else {
        // Fallback to native TTS
        const isFemale = this.voice === 'female';
        
        await this.tts.speak({
          text: text,
          lang: 'en-US',
          rate: isFemale ? 0.65 : 0.6,
          pitch: isFemale ? 1.3 : 0.7,
          volume: 1.0,
          category: 'ambient'
        });
      }
      
      if(import.meta.env.DEV)console.log('✅ Speech completed');
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Speech error:', error);
    }
  }

  /**
   * Start breathing exercise
   */
  async startExercise(patternId, durationMinutes = 5, onPhaseChange, onCycleComplete, onComplete) {
    const pattern = this.patterns[patternId];
    if (!pattern) {
      throw new Error('Invalid pattern');
    }

    this.isActive = true;
    this.currentPattern = pattern;
    this.currentCycle = 0;
    
    // Calculate total cycles based on duration
    const cycleDuration = pattern.phases.reduce((sum, phase) => sum + phase.duration, 0);
    this.totalCycles = Math.floor((durationMinutes * 60) / cycleDuration);

    if(import.meta.env.DEV)console.log(`🧘 Starting ${pattern.name} - ${this.totalCycles} cycles`);
    
    // Start subtle ambient healing sounds
    await this.ambientSound.start();
    await this.sleep(1000); // Let sounds settle in
    
    // Initial greeting with Nicole's voice
    const welcomeAudio = pattern.welcomeAudio || null;
    await this.speak('ready', 0.5, welcomeAudio);
    await this.sleep(2000);

    // Run cycles
    for (let cycle = 0; cycle < this.totalCycles && this.isActive; cycle++) {
      this.currentCycle = cycle + 1;
      
      for (const phase of pattern.phases) {
        if (!this.isActive) break;

        // Notify phase change
        if (onPhaseChange) {
          onPhaseChange({
            phase: phase.type,
            text: phase.text,
            duration: phase.duration,
            cycle: this.currentCycle,
            totalCycles: this.totalCycles
          });
        }

        // Speak instruction with Nicole's voice if available
        const phaseAudio = phase.audio || null;
        this.speak(phase.text, 0, phaseAudio);

        // Count down the phase
        for (let i = 0; i < phase.duration && this.isActive; i++) {
          await this.sleep(1000);
        }
      }

      // Cycle complete
      if (onCycleComplete && this.isActive) {
        onCycleComplete(this.currentCycle, this.totalCycles);
      }
    }

    // Exercise complete
    if (this.isActive && onComplete) {
      const completeAudio = pattern.completeAudio || null;
      await this.speak('complete', 0.5, completeAudio);
      await this.sleep(2000);
      
      // Gently fade out ambient sounds
      this.ambientSound.stop();
      
      // Log to history
      this.logSession(patternId, durationMinutes);
      
      onComplete({
        pattern: pattern.name,
        cycles: this.currentCycle,
        duration: durationMinutes
      });
    }

    this.isActive = false;
  }

  /**
   * Stop exercise
   */
  async stopExercise() {
    this.isActive = false;
    
    // Stop ambient sounds
    this.ambientSound.stop();
    
    // Stop real voice audio
    this.audioService.stop();
    
    // Stop TTS (fallback)
    try {
      await this.tts.stop();
    } catch (error) {
      if(import.meta.env.DEV)console.warn('Error stopping TTS:', error);
    }
    
    if(import.meta.env.DEV)console.log('🛑 Breathing exercise stopped');
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log session to history
   */
  async logSession(patternId, durationMinutes) {
    const history = JSON.parse(localStorage.getItem('breathing_history') || '[]');
    const session = {
      pattern: this.patterns[patternId].name,
      patternId,
      duration: durationMinutes,
      cycles: this.currentCycle,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    history.push(session);
    localStorage.setItem('breathing_history', JSON.stringify(history));

    // Also log to meditation log for activity feed
    let meditationLog = [];
    try {
      const syncService = (await import('./syncService.js')).default;
      meditationLog = await syncService.getData('meditationLog') || [];
    } catch (err) {
      // Fallback to localStorage
      meditationLog = JSON.parse(localStorage.getItem('meditationLog') || '[]');
    }
    
    meditationLog.push({
      type: 'breathing',
      duration: durationMinutes,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    });
    
    // Save to triple storage (localStorage + Preferences + Firebase)
    localStorage.setItem('meditationLog', JSON.stringify(meditationLog));
    try {
      const syncService = (await import('./syncService.js')).default;
      await syncService.saveData('meditationLog', meditationLog);
    } catch (syncError) {
      if(import.meta.env.DEV)console.warn('Meditation log Firebase sync failed (offline?):', syncError);
    }
  }

  /**
   * Get session history
   */
  getHistory(days = 30) {
    const history = JSON.parse(localStorage.getItem('breathing_history') || '[]');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return history.filter(session => new Date(session.timestamp) > cutoffDate);
  }

  /**
   * Get statistics
   */
  getStats() {
    const history = this.getHistory(30);
    
    const totalSessions = history.length;
    const totalMinutes = history.reduce((sum, session) => sum + session.duration, 0);
    const totalCycles = history.reduce((sum, session) => sum + session.cycles, 0);
    
    const patternCounts = {};
    history.forEach(session => {
      patternCounts[session.pattern] = (patternCounts[session.pattern] || 0) + 1;
    });
    
    const favoritePattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalSessions,
      totalMinutes,
      totalCycles,
      averageMinutesPerSession: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      favoritePattern: favoritePattern ? favoritePattern[0] : null,
      streak: this.calculateStreak(history)
    };
  }

  /**
   * Calculate streak of consecutive days
   */
  calculateStreak(history) {
    if (history.length === 0) return 0;
    
    const dates = [...new Set(history.map(s => s.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    
    for (const date of dates) {
      const sessionDate = new Date(date);
      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  }
}

// Export singleton instance
const breathingService = new BreathingService();
export default breathingService;



