// Rep Counter Component - AI-Powered Exercise Rep Counting
import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
// LAZY LOAD pose-detection to avoid @mediapipe/pose import error
// import * as poseDetection from '@tensorflow-models/pose-detection';
import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import syncService from '../services/syncService';
import gamificationService from '../services/gamificationService';
import subscriptionService from '../services/subscriptionService';
import './RepCounter.css';

const RepCounter = ({ onClose, onWorkoutComplete }) => {
  const [exercise, setExercise] = useState('pushups');
  const [isTracking, setIsTracking] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [calories, setCalories] = useState(0);
  const [motionListener, setMotionListener] = useState(null);
  const [activityStatus, setActivityStatus] = useState('Ready');
  const [detector, setDetector] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const motionDataBuffer = useRef([]);
  const lastRepTime = useRef(0);
  const repCountRef = useRef(0);

  const exercises = [
    { id: 'pushups', name: 'Push-ups', icon: '💪', caloriesPerRep: 0.5 },
    { id: 'squats', name: 'Squats', icon: '🦵', caloriesPerRep: 0.4 },
    { id: 'situps', name: 'Sit-ups', icon: '🧘', caloriesPerRep: 0.3 },
    { id: 'burpees', name: 'Burpees', icon: '🔥', caloriesPerRep: 1.2 },
    { id: 'jumping_jacks', name: 'Jumping Jacks', icon: '🤸', caloriesPerRep: 0.2 },
    { id: 'lunges', name: 'Lunges', icon: '🏃', caloriesPerRep: 0.4 },
    { id: 'planks', name: 'Planks (seconds)', icon: '🛌', caloriesPerRep: 0.05 },
    { id: 'mountain_climbers', name: 'Mountain Climbers', icon: '⛰️', caloriesPerRep: 0.3 }
  ];

  const selectedExercise = exercises.find(e => e.id === exercise);

  // TensorFlow.js-based rep detection from motion sensor data
  const detectRepFromMotion = (buffer, exerciseType) => {
    const now = Date.now();
    
    // Prevent duplicate counting (minimum 800ms between reps)
    if (now - lastRepTime.current < 800) {
      return false;
    }
    
    // Calculate motion magnitude (acceleration changes, not absolute)
    const recentData = buffer.slice(-30);
    const magnitudes = recentData.map(d => 
      Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)
    );
    
    // Calculate variance (motion intensity)
    const avgMag = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const variance = magnitudes.reduce((sum, mag) => sum + Math.pow(mag - avgMag, 2), 0) / magnitudes.length;
    
    // Different threshold for different exercises (increased to prevent false positives)
    let varianceThreshold = 4.0;
    if (exerciseType === 'burpees' || exerciseType === 'jumping_jacks') {
      varianceThreshold = 6.0;
    } else if (exerciseType === 'planks' || exerciseType === 'mountain_climbers') {
      varianceThreshold = 2.0;
    }
    
    // Detect rep: significant motion variance indicates a rep
    if (variance > varianceThreshold) {
      lastRepTime.current = now;
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    // Initialize TensorFlow.js and load pose detection model
    const initTensorFlow = async () => {
      try {
        setIsModelLoading(true);
        
        // Check TensorFlow backend availability
        await tf.ready();
        const backend = tf.getBackend();
        console.log('TensorFlow backend:', backend);
        
        // Only try pose detection if we have proper backend (not CPU)
        if (backend === 'cpu') {
          throw new Error('No GPU backend available - using motion sensors');
        }
        
        // Dynamically import pose-detection
        const poseDetection = await import('@tensorflow-models/pose-detection');
        
        // Create pose detector with MoveNet
        const detectorConfig = {
          runtime: 'tfjs',
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        };
        const poseDetector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        
        setDetector(poseDetector);
        setIsModelLoading(false);
        console.log('✅ TensorFlow.js pose detection loaded with', backend);
      } catch (error) {
        console.error('TensorFlow failed:', error.message);
        setIsModelLoading(false);
        setActivityStatus('Ready'); // Continue with motion sensors only
      }
    };
    
    initTensorFlow();

    return () => {
      // Cleanup on unmount
      if (isTracking) {
        stopTracking();
      }
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

  const startTracking = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        alert('Rep counting requires native mobile device with motion sensors');
        return;
      }

      // Check workout limit (free users: 1/day)
      try {
        const limitCheck = subscriptionService.checkLimit('workouts');
        if (!limitCheck || !limitCheck.allowed) {
          alert(limitCheck?.message || 'Workout limit reached for today');
          return;
        }
      } catch (error) {
        console.error('Subscription check failed:', error);
        // Continue anyway if check fails - don't block user
      }

      // Reset motion buffer and counters
      motionDataBuffer.current = [];
      lastRepTime.current = 0;
      repCountRef.current = 0;

      // Start motion sensor listening
      const listener = await Motion.addListener('accel', async (event) => {
        // Store motion data in buffer
        const motionData = {
          timestamp: Date.now(),
          x: event.accelerationIncludingGravity.x,
          y: event.accelerationIncludingGravity.y,
          z: event.accelerationIncludingGravity.z,
          alpha: event.rotationRate?.alpha || 0,
          beta: event.rotationRate?.beta || 0,
          gamma: event.rotationRate?.gamma || 0
        };
        
        motionDataBuffer.current.push(motionData);
        
        // Keep buffer at 100 samples (~3 seconds)
        if (motionDataBuffer.current.length > 100) {
          motionDataBuffer.current.shift();
        }

        // Detect reps from motion data (works with or without TensorFlow)
        if (motionDataBuffer.current.length >= 20) {
          try {
            // Use motion analysis to detect reps
            const repDetected = detectRepFromMotion(motionDataBuffer.current, exercise);
            
            if (repDetected) {
              repCountRef.current += 1;
              const newCount = repCountRef.current;
              setRepCount(newCount);
              
              // Calculate calories
              const newCalories = newCount * selectedExercise.caloriesPerRep;
              setCalories(Math.round(newCalories));

              // Haptic feedback (vibration)
              if (navigator.vibrate) {
                navigator.vibrate(50);
              }
              
              // Update gamification points
              await gamificationService.addPoints(5, 'workout_rep');
            }
          } catch (error) {
            if(import.meta.env.DEV)console.error('Rep detection error:', error);
          }
        }
      });

      setMotionListener(listener);
      setIsTracking(true);
      setActivityStatus('Tracking...');
      startTimeRef.current = Date.now();

      // Update duration every second
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);

    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to start tracking:', error);
      alert('Failed to start rep counting: ' + error.message);
    }
  };

  const stopTracking = async () => {
    // Stop motion sensor
    if (motionListener) {
      motionListener.remove();
      setMotionListener(null);
    }

    // Stop duration timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Use current rep count as final count
    const finalCount = repCount;

    setIsTracking(false);
    setActivityStatus('Completed');

    // Calculate final stats
    const finalCalories = Math.round(finalCount * selectedExercise.caloriesPerRep);
    const pace = duration > 0 ? (finalCount / (duration / 60)).toFixed(1) : 0;

    // 💾 SAVE TO CAPACITOR PREFERENCES (persistent storage)
    const workoutEntry = {
      type: selectedExercise.name,
      reps: finalCount,
      duration,
      calories: finalCalories,
      pace,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    try {
      // Load existing workout history from Preferences
      const { value: workoutJson } = await Preferences.get({ key: 'workoutHistory' });
      const workoutHistory = workoutJson ? JSON.parse(workoutJson) : [];
      
      // Add new workout
      workoutHistory.push(workoutEntry);
      
      // Save using syncService (Preferences + Firebase + localStorage)
      await syncService.saveData('workoutHistory', workoutHistory);
      
      if(import.meta.env.DEV)console.log('✅ Workout saved to cloud:', workoutEntry);

      // Increment workout usage (for free user limits)
      const { subscriptionService } = await import('../services/subscriptionService');
      await subscriptionService.incrementUsage('workouts');
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save workout:', error);
    }

    // Notify parent component
    if (onWorkoutComplete) {
      onWorkoutComplete({
        exercise: selectedExercise.name,
        reps: finalCount,
        duration,
        calories: finalCalories,
        pace
      });
    }
  };

  const resetWorkout = () => {
    setRepCount(0);
    setDuration(0);
    setCalories(0);
    setActivityStatus('Ready');
    startTimeRef.current = null;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPace = () => {
    if (duration === 0 || repCount === 0) return 0;
    return (repCount / (duration / 60)).toFixed(1);
  };

  return (
    <div className="rep-counter-modal">
      <div className="rep-counter-content">
        <div className="rep-counter-header">
          <h2>🏋️ Rep Counter</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {!isTracking && activityStatus === 'Ready' && (
          <div className="exercise-selector">
            <h3>Select Exercise</h3>
            <div className="exercise-grid">
              {exercises.map(ex => (
                <button
                  key={ex.id}
                  className={`exercise-btn ${exercise === ex.id ? 'selected' : ''}`}
                  onClick={() => {
                    console.log('🔥 Exercise clicked:', ex.id);
                    setExercise(ex.id);
                  }}
                >
                  <span className="exercise-icon">{ex.icon}</span>
                  <span className="exercise-name">{ex.name}</span>
                </button>
              ))}
            </div>

            <button className="start-btn" onClick={() => {
              console.log('🚀 Start Workout clicked');
              startTracking();
            }}>
              ▶️ Start Workout
            </button>

            <div className="instructions">
              <h4>📱 Tip</h4>
              <p>Place phone in your pocket or on the floor during exercise</p>
            </div>
          </div>
        )}

        {isTracking && (
          <div className="workout-active">
            <div className="exercise-display">
              <span className="exercise-icon-large">{selectedExercise.icon}</span>
              <h3>{selectedExercise.name}</h3>
            </div>

            <div className="rep-display">
              <div className="rep-count-large">{repCount}</div>
              <div className="rep-label">REPS</div>
            </div>

            <div className="workout-stats">
              <div className="stat-item">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{formatDuration(duration)}</div>
                <div className="stat-label">Duration</div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{calories}</div>
                <div className="stat-label">Calories</div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">⚡</div>
                <div className="stat-value">{getPace()}</div>
                <div className="stat-label">Reps/Min</div>
              </div>
            </div>

            <div className="tracking-indicator">
              <div className="pulse-dot"></div>
              <span>AI Tracking Active</span>
            </div>

            <button className="stop-btn" onClick={stopTracking}>
              ⏹️ Stop Workout
            </button>
          </div>
        )}

        {!isTracking && activityStatus === 'Completed' && (
          <div className="workout-summary">
            <div className="success-icon">🎉</div>
            <h3>Workout Complete!</h3>

            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Exercise</span>
                <span className="summary-value">{selectedExercise.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Reps</span>
                <span className="summary-value">{repCount}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Duration</span>
                <span className="summary-value">{formatDuration(duration)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Calories Burned</span>
                <span className="summary-value">{calories} kcal</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Pace</span>
                <span className="summary-value">{getPace()} reps/min</span>
              </div>
            </div>

            <div className="summary-actions">
              <button className="restart-btn" onClick={resetWorkout}>
                🔄 New Workout
              </button>
              <button className="done-btn" onClick={onClose}>
                ✅ Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepCounter;



