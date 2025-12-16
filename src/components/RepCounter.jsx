// Rep Counter Component - AI-Powered Exercise Rep Counting
import React, { useState, useEffect, useRef } from 'react';
import tensorflowService from '../services/tensorflowService';
import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import syncService from '../services/syncService';
import './RepCounter.css';

const RepCounter = ({ onClose, onWorkoutComplete }) => {
  const [exercise, setExercise] = useState('pushups');
  const [isTracking, setIsTracking] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [calories, setCalories] = useState(0);
  const [motionListener, setMotionListener] = useState(null);
  const [activityStatus, setActivityStatus] = useState('Ready');
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

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

  useEffect(() => {
    // Initialize TensorFlow on mount
    tensorflowService.initialize();

    return () => {
      // Cleanup on unmount
      if (isTracking) {
        stopTracking();
      }
    };
  }, []);

  const startTracking = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        alert('Rep counting requires native mobile device with motion sensors');
        return;
      }

      // Start rep counting in TensorFlow service
      tensorflowService.startRepCounting(exercise);

      // Start motion sensor listening
      const listener = await Motion.addListener('accel', (event) => {
        // Feed motion data to TensorFlow
        tensorflowService.addMotionData({
          acceleration: {
            x: event.accelerationIncludingGravity.x,
            y: event.accelerationIncludingGravity.y,
            z: event.accelerationIncludingGravity.z
          },
          rotationRate: event.rotationRate
        });

        // Count reps
        const repResult = tensorflowService.countReps(exercise);
        if (repResult.count > repCount) {
          setRepCount(repResult.count);
          
          // Calculate calories
          const newCalories = repResult.count * selectedExercise.caloriesPerRep;
          setCalories(Math.round(newCalories));

          // Haptic feedback (vibration)
          if (navigator.vibrate) {
            navigator.vibrate(50);
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

    // Stop TensorFlow rep counting
    const finalCount = tensorflowService.stopRepCounting();

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



