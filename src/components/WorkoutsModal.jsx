// Workouts Quick Access Modal
import { useState } from 'react';
import './WorkoutsModal.css';

export default function WorkoutsModal({ isOpen, onClose, onOpenRepCounter, onOpenWorkouts }) {
  const workoutOptions = [
    { icon: '💪', title: 'Rep Counter', desc: 'AI-powered form tracking', action: onOpenRepCounter },
    { icon: '🏃', title: 'Cardio', desc: 'Running, cycling, swimming' },
    { icon: '🏋️', title: 'Strength', desc: 'Weights and resistance' },
    { icon: '🧘', title: 'Yoga', desc: 'Flexibility and balance' },
    { icon: '🥊', title: 'HIIT', desc: 'High intensity training' }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="workouts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💪 Workouts</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="workouts-hero">
          <div className="hero-icon">🏋️</div>
          <h3>Train Smarter</h3>
          <p>AI-powered workout tracking</p>
        </div>

        <div className="workouts-options-list">
          {workoutOptions.map((option, index) => (
            <button
              key={index}
              className="workout-option-item"
              onClick={() => {
                if (option.action) {
                  option.action();
                  onClose();
                } else {
                  alert(`${option.title} coming soon!`);
                }
              }}
            >
              <span className="option-icon">{option.icon}</span>
              <div className="option-info">
                <span className="option-title">{option.title}</span>
                <span className="option-desc">{option.desc}</span>
              </div>
              <span className="option-arrow">→</span>
            </button>
          ))}
        </div>

        <div className="workouts-info">
          <p>🔥 Rep Counter uses AI to track your form in real-time!</p>
        </div>
      </div>
    </div>
  );
}
