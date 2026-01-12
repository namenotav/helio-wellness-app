import { useState, useEffect } from 'react';
import './ExerciseDetailModal.css';
import '../styles/exerciseAnimations.css';

export default function ExerciseDetailModal({ exercise, onClose }) {
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [weight, setWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [gifError, setGifError] = useState(false);

  // Auto-fill weight from user profile
  useEffect(() => {
    const loadUserWeight = async () => {
      try {
        const { default: authService } = await import('../services/authService');
        const user = authService.getCurrentUser();
        if (user?.profile?.weight) {
          setWeight(user.profile.weight.toString());
        }
      } catch (error) {
        console.log('Could not load user weight:', error);
      }
    };
    
    if (exercise?.equipment !== 'Bodyweight') {
      loadUserWeight();
    }
  }, [exercise]);

  if (!exercise) return null;

  // Clean exercise name (remove symbols like ♬Ⓐ)
  const cleanName = exercise.name.replace(/[^a-zA-Z0-9\s-]/g, '').trim();

  const handleLogWorkout = async () => {
    setIsLogging(true);
    try {
      const { default: workoutService } = await import('../services/workoutService');
      await workoutService.logWorkout({
        type: exercise.category,
        activity: cleanName,
        duration: parseInt(sets) * 2, // Estimate 2 min per set
        calories: exercise.calories * parseInt(sets),
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        equipment: exercise.equipment,
        musclesTargeted: exercise.musclesTargeted
      });
      
      // Show success
      alert(`✅ Logged ${cleanName}! +${exercise.calories * parseInt(sets)} calories`);
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
          <h2>{cleanName}</h2>
          <button className="close-btn-detail" onClick={onClose}>✕</button>
        </div>

        {/* Exercise Demonstration - YouTube Video, GIF, or CSS Animation */}
        <div className="exercise-animation-container">
          {exercise.videoUrl ? (
            <div className="exercise-video-wrapper">
              <iframe
                src={exercise.videoUrl}
                title={`${cleanName} demonstration`}
                className="exercise-video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="animation-label">📹 Video Demonstration</div>
            </div>
          ) : exercise.gifUrl && !gifError ? (
            <div className="exercise-gif-wrapper">
              <img 
                src={exercise.gifUrl}
                alt={`${cleanName} demonstration`}
                className="exercise-gif"
                loading="lazy"
                onError={() => {
                  console.log(`GIF not found for ${cleanName}, using CSS animation fallback`);
                  setGifError(true);
                }}
              />
              <div className="animation-label">📹 Video Demonstration</div>
            </div>
          ) : (
            <div className="exercise-animation-fallback">
              <div className={`exercise-animation large active ${exercise.animationClass || ''}`}>
                <div className="exercise-stick-figure">
                  <div className="stick-arms"></div>
                  <div className="stick-leg-left"></div>
                  <div className="stick-leg-right"></div>
                </div>
              </div>
              <div className="animation-label">🎨 Animated Form Guide</div>
            </div>
          )}
        </div>

        {/* Exercise Info */}
        <div className="detail-content">
          <div className="detail-header">
            <h2>{cleanName}</h2>
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
