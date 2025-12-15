import { useState } from 'react';
import './ExerciseDetailModal.css';
import '../styles/exerciseAnimations.css';

export default function ExerciseDetailModal({ exercise, onClose }) {
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [weight, setWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  if (!exercise) return null;

  const handleLogWorkout = async () => {
    setIsLogging(true);
    try {
      const { default: workoutService } = await import('../services/workoutService');
      await workoutService.logWorkout({
        type: exercise.category,
        activity: exercise.name,
        duration: parseInt(sets) * 2, // Estimate 2 min per set
        calories: exercise.calories * parseInt(sets),
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        equipment: exercise.equipment,
        musclesTargeted: exercise.musclesTargeted
      });
      
      // Show success
      alert(`✅ Logged ${exercise.name}! +${exercise.calories * parseInt(sets)} calories`);
      onClose();
    } catch (error) {
      console.error('Failed to log workout:', error);
      alert('❌ Failed to log workout');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="exercise-detail-overlay" onClick={onClose}>
      <div className="exercise-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exercise-detail-header">
          <h2>{exercise.icon} {exercise.name}</h2>
          <button className="close-btn-detail" onClick={onClose}>✕</button>
        </div>

        {/* Animation Display */}
        <div className="exercise-animation-container">
          <div className={`exercise-animation large active ${exercise.animationClass || ''}`}>
            <div className="exercise-stick-figure">
              <div className="stick-arms"></div>
              <div className="stick-leg-left"></div>
              <div className="stick-leg-right"></div>
            </div>
          </div>
          <div className="animation-label">Animated Form Guide</div>
        </div>

        {/* Exercise Info */}
        <div className="detail-content">
          <div className="detail-header">
            <h2>{exercise.icon} {exercise.name}</h2>
            <div className="detail-badges">
              <span className={`badge difficulty ${exercise.difficulty.toLowerCase()}`}>
                {exercise.difficulty}
              </span>
              <span className="badge equipment">{exercise.equipment}</span>
              <span className="badge calories">🔥 {exercise.calories} cal/set</span>
            </div>
          </div>

          {/* Muscles Targeted */}
          <div className="detail-section">
            <h3>🎯 Target Muscles</h3>
            <div className="muscles-tags">
              {exercise.musclesTargeted.map((muscle, idx) => (
                <span key={idx} className="muscle-tag">{muscle}</span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="detail-section">
            <h3>📋 Instructions</h3>
            <ol className="instructions-list">
              {exercise.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div className="detail-section">
            <h3>💡 Form Tips</h3>
            <p className="tips-text">{exercise.tips}</p>
          </div>

          {/* Recommended */}
          <div className="detail-section">
            <h3>🎯 Recommended</h3>
            <p className="reps-text">{exercise.reps}</p>
          </div>

          {/* Log Workout Section */}
          <div className="detail-section log-section">
            <h3>📊 Log This Workout</h3>
            <div className="log-inputs">
              <div className="log-input-group">
                <label>Sets</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                />
              </div>
              <div className="log-input-group">
                <label>Reps</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
              {exercise.equipment !== 'Bodyweight' && (
                <div className="log-input-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="2.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              )}
            </div>
            <button 
              className="log-workout-btn"
              onClick={handleLogWorkout}
              disabled={isLogging || !sets || !reps}
            >
              {isLogging ? '⏳ Logging...' : '✅ Log Workout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
