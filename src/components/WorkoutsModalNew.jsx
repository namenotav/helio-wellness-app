import { useState } from 'react';
import './WorkoutsModalNew.css';
import '../styles/exerciseAnimations.css';
import { exerciseLibrary, getExercisesByCategory, getCategories } from '../data/exerciseLibraryExpanded';
import ExerciseDetailModal from './ExerciseDetailModal';

export default function WorkoutsModal({ isOpen, onClose, onOpenRepCounter }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = [
    { name: 'Chest', icon: '💪', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', count: 12 },
    { name: 'Back', icon: '🦾', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', count: 12 },
    { name: 'Legs', icon: '🦵', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', count: 15 },
    { name: 'Shoulders', icon: '💪', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', count: 10 },
    { name: 'Arms', icon: '💪', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', count: 10 },
    { name: 'Core', icon: '🔥', gradient: 'linear-gradient(135deg, #30cfd0, #330867)', count: 15 },
    { name: 'Cardio', icon: '🏃', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)', count: 20 },
    { name: 'Yoga', icon: '🧘', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', count: 10 },
    { name: 'HIIT', icon: '🥊', gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)', count: 15 },
    { name: 'Stretching', icon: '🤸', gradient: 'linear-gradient(135deg, #ff6b6b, #feca57)', count: 10 }
  ];

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleBack = () => {
    if (selectedExercise) {
      setSelectedExercise(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const filteredExercises = selectedCategory 
    ? getExercisesByCategory(selectedCategory).filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="workouts-modal-new" onClick={(e) => e.stopPropagation()}>
          <div className="workouts-header">
            {(selectedCategory || selectedExercise) && (
              <button className="back-btn" onClick={handleBack}>← Back</button>
            )}
            <h2>💪 Workout Library</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {!selectedCategory && !selectedExercise && (
            <>
              {/* Special Features */}
              <div className="special-features">
                <button 
                  className="feature-card rep-counter"
                  onClick={() => { onOpenRepCounter(); onClose(); }}
                >
                  <span className="feature-icon">📱</span>
                  <div className="feature-info">
                    <h3>AI Rep Counter</h3>
                    <p>Real-time form tracking</p>
                  </div>
                  <span className="feature-badge">AI</span>
                </button>
              </div>

              {/* Category Grid */}
              <div className="categories-grid">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    className="category-card"
                    style={{ background: cat.gradient }}
                    onClick={() => handleCategorySelect(cat.name)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <h3 className="cat-name">{cat.name}</h3>
                    <span className="cat-count">{cat.count} exercises</span>
                  </button>
                ))}
              </div>

              <div className="workouts-footer">
                <p>🔥 {exerciseLibrary.length}+ exercises with animations</p>
              </div>
            </>
          )}

          {selectedCategory && !selectedExercise && (
            <>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${selectedCategory} exercises...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="exercises-list">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    className="exercise-card"
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <div className="exercise-animation-preview">
                      <div className={`exercise-animation small ${exercise.animationClass || ''}`}>
                        <div className="exercise-stick-figure">
                          <div className="stick-arms"></div>
                          <div className="stick-leg-left"></div>
                          <div className="stick-leg-right"></div>
                        </div>
                      </div>
                    </div>
                    <div className="exercise-info">
                      <h4>{exercise.icon} {exercise.name}</h4>
                      <div className="exercise-meta">
                        <span className={`difficulty ${exercise.difficulty.toLowerCase()}`}>
                          {exercise.difficulty}
                        </span>
                        <span className="equipment">{exercise.equipment}</span>
                        <span className="calories">🔥 {exercise.calories} cal</span>
                      </div>
                      <p className="muscles">{exercise.musclesTargeted.join(', ')}</p>
                    </div>
                    <span className="exercise-arrow">→</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}
