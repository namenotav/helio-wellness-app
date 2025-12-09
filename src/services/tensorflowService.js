// TensorFlow.js Service for On-Device Machine Learning
// Handles real-time activity recognition, rep counting, and exercise form analysis

import * as tf from '@tensorflow/tfjs';

class TensorFlowService {
  constructor() {
    this.activityModel = null;
    this.repCounterModel = null;
    this.formAnalysisModel = null;
    this.isInitialized = false;
    
    // Activity labels
    this.activityLabels = [
      'stationary',
      'walking',
      'running',
      'cycling',
      'stairs_up',
      'stairs_down',
      'workout'
    ];
    
    // Exercise rep counter state
    this.repCounterState = {
      exercise: null,
      count: 0,
      inProgress: false,
      lastPeakTime: 0
    };
    
    // Motion data buffer for activity recognition
    this.motionBuffer = [];
    this.bufferSize = 100; // 100 samples (~3 seconds at 30Hz)
  }

  /**
   * Initialize TensorFlow.js and load models
   */
  async initialize() {
    try {
      if(import.meta.env.DEV)console.log('Initializing TensorFlow.js...');
      
      // Wait for TensorFlow backend to be ready
      await tf.ready();
      if(import.meta.env.DEV)console.log('TensorFlow.js backend:', tf.getBackend());
      
      // Load pre-trained models
      // Note: These are placeholder URLs - replace with actual model URLs
      await this.loadActivityRecognitionModel();
      
      this.isInitialized = true;
      if(import.meta.env.DEV)console.log('TensorFlow service initialized successfully');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to initialize TensorFlow:', error);
      return false;
    }
  }

  /**
   * Load activity recognition model
   */
  async loadActivityRecognitionModel() {
    try {
      // For now, we'll use a simple rule-based system until we have actual models
      // In production, you would load a pre-trained model:
      // this.activityModel = await tf.loadLayersModel('https://your-server.com/models/activity-recognition/model.json');
      
      if(import.meta.env.DEV)console.log('Activity recognition model ready (using rule-based system)');
      this.activityModel = 'rule-based'; // Placeholder
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load activity model:', error);
      throw error;
    }
  }

  /**
   * Add motion data to buffer for analysis
   * @param {Object} motionData - Accelerometer/gyroscope data
   */
  addMotionData(motionData) {
    const dataPoint = {
      timestamp: Date.now(),
      accel: {
        x: motionData.acceleration?.x || 0,
        y: motionData.acceleration?.y || 0,
        z: motionData.acceleration?.z || 0
      },
      gyro: {
        x: motionData.rotationRate?.alpha || 0,
        y: motionData.rotationRate?.beta || 0,
        z: motionData.rotationRate?.gamma || 0
      }
    };
    
    this.motionBuffer.push(dataPoint);
    
    // Keep buffer at fixed size
    if (this.motionBuffer.length > this.bufferSize) {
      this.motionBuffer.shift();
    }
  }

  /**
   * Detect current activity using motion sensor data
   * @returns {Object} Activity prediction with confidence
   */
  async detectActivity() {
    if (!this.isInitialized || this.motionBuffer.length < 30) {
      return {
        activity: 'unknown',
        confidence: 0
      };
    }

    try {
      // Calculate motion statistics from buffer
      const stats = this.calculateMotionStatistics();
      
      // Rule-based activity classification (until we load actual models)
      const activity = this.classifyActivityFromMotion(stats);
      
      return activity;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Activity detection error:', error);
      return {
        activity: 'unknown',
        confidence: 0
      };
    }
  }

  /**
   * Calculate motion statistics from buffer
   */
  calculateMotionStatistics() {
    const accelMagnitudes = this.motionBuffer.map(d => 
      Math.sqrt(d.accel.x ** 2 + d.accel.y ** 2 + d.accel.z ** 2)
    );
    
    const gyroMagnitudes = this.motionBuffer.map(d =>
      Math.sqrt(d.gyro.x ** 2 + d.gyro.y ** 2 + d.gyro.z ** 2)
    );
    
    return {
      accelMean: this.mean(accelMagnitudes),
      accelStd: this.standardDeviation(accelMagnitudes),
      accelMax: Math.max(...accelMagnitudes),
      gyroMean: this.mean(gyroMagnitudes),
      gyroStd: this.standardDeviation(gyroMagnitudes),
      gyroMax: Math.max(...gyroMagnitudes)
    };
  }

  /**
   * Classify activity based on motion statistics
   */
  classifyActivityFromMotion(stats) {
    // Simple rule-based classification
    // In production, this would use the TensorFlow model
    
    const { accelMean, accelStd, gyroMean } = stats;
    
    // Stationary: low acceleration variance
    if (accelStd < 0.5) {
      return {
        activity: 'stationary',
        confidence: 0.9
      };
    }
    
    // Running: high acceleration variance, high frequency
    if (accelStd > 3.0 && accelMean > 10) {
      return {
        activity: 'running',
        confidence: 0.85
      };
    }
    
    // Walking: moderate acceleration variance
    if (accelStd > 0.5 && accelStd < 3.0 && accelMean > 9.5) {
      return {
        activity: 'walking',
        confidence: 0.8
      };
    }
    
    // Cycling: low vertical acceleration, high gyro
    if (gyroMean > 1.5 && accelStd < 2.0) {
      return {
        activity: 'cycling',
        confidence: 0.75
      };
    }
    
    // Workout: high variance in all directions
    if (accelStd > 2.5 || gyroMean > 2.0) {
      return {
        activity: 'workout',
        confidence: 0.7
      };
    }
    
    return {
      activity: 'unknown',
      confidence: 0.5
    };
  }

  /**
   * Count exercise reps using motion patterns
   * @param {string} exerciseType - Type of exercise (pushup, squat, etc.)
   * @returns {Object} Rep count and timing
   */
  countReps(exerciseType) {
    if (this.motionBuffer.length < 20) {
      return {
        count: this.repCounterState.count,
        lastRep: null
      };
    }
    
    // Get recent acceleration magnitudes
    const recentData = this.motionBuffer.slice(-20);
    const magnitudes = recentData.map(d => 
      Math.sqrt(d.accel.x ** 2 + d.accel.y ** 2 + d.accel.z ** 2)
    );
    
    // Detect peaks (rep completion)
    const peaks = this.detectPeaks(magnitudes);
    const now = Date.now();
    
    // Count new reps (debounce: min 500ms between reps)
    if (peaks.length > 0 && (now - this.repCounterState.lastPeakTime) > 500) {
      this.repCounterState.count++;
      this.repCounterState.lastPeakTime = now;
      
      return {
        count: this.repCounterState.count,
        lastRep: now
      };
    }
    
    return {
      count: this.repCounterState.count,
      lastRep: null
    };
  }

  /**
   * Start rep counting for an exercise
   */
  startRepCounting(exerciseType) {
    this.repCounterState = {
      exercise: exerciseType,
      count: 0,
      inProgress: true,
      lastPeakTime: 0
    };
    this.motionBuffer = [];
  }

  /**
   * Stop rep counting and return final count
   */
  stopRepCounting() {
    const finalCount = this.repCounterState.count;
    this.repCounterState.inProgress = false;
    return finalCount;
  }

  /**
   * Analyze exercise form using camera + motion data
   * @param {Object} poseData - Pose estimation data from camera
   * @returns {Object} Form analysis with corrections
   */
  async analyzeExerciseForm(poseData) {
    // This would use a pose estimation model (like PoseNet or MoveNet)
    // For now, return placeholder analysis
    
    return {
      quality: 'good',
      score: 85,
      feedback: [
        'Keep your back straight',
        'Good depth on squats'
      ],
      corrections: []
    };
  }

  /**
   * Detect peaks in signal (for rep counting)
   */
  detectPeaks(data, threshold = 11.5) {
    const peaks = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && 
          data[i] > data[i - 1] && 
          data[i] > data[i + 1]) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  /**
   * Calculate mean of array
   */
  mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Calculate standard deviation
   */
  standardDeviation(arr) {
    const avg = this.mean(arr);
    const squareDiffs = arr.map(val => (val - avg) ** 2);
    return Math.sqrt(this.mean(squareDiffs));
  }

  /**
   * Get current activity recognition status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      backend: this.isInitialized ? tf.getBackend() : null,
      bufferSize: this.motionBuffer.length,
      repCounterActive: this.repCounterState.inProgress,
      repCount: this.repCounterState.count
    };
  }

  /**
   * Clear motion buffer
   */
  clearBuffer() {
    this.motionBuffer = [];
  }

  /**
   * Dispose models and free memory
   */
  dispose() {
    if (this.activityModel && typeof this.activityModel.dispose === 'function') {
      this.activityModel.dispose();
    }
    if (this.repCounterModel && typeof this.repCounterModel.dispose === 'function') {
      this.repCounterModel.dispose();
    }
    if (this.formAnalysisModel && typeof this.formAnalysisModel.dispose === 'function') {
      this.formAnalysisModel.dispose();
    }
    
    this.motionBuffer = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
export const tensorflowService = new TensorFlowService();
export default tensorflowService;



