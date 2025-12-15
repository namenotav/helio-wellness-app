// Food Scanner Options Modal
import { useState } from 'react';
import './FoodModal.css';
import FoodScanner from './FoodScanner';

export default function FoodModal({ isOpen, onClose }) {
  const [showFoodScanner, setShowFoodScanner] = useState(false);

  const foodOptions = [
    { icon: '📸', title: 'Scan Label', desc: 'Take photo of nutrition label' },
    { icon: '🔍', title: 'Search Foods', desc: '6M+ foods database' },
    { icon: '🕌', title: 'Halal Scanner', desc: 'Check if food is Halal' },
    { icon: '🍔', title: 'Restaurants', desc: 'Find nutritious meals near you' },
    { icon: '👨‍🍳', title: 'Create Recipe', desc: 'Build custom meal' }
  ];

  if (!isOpen) return null;

  if (showFoodScanner) {
    return <FoodScanner isOpen={true} onClose={() => { setShowFoodScanner(false); onClose(); }} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🍽️ Food Scanner</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="food-hero">
          <div className="hero-icon">🍕</div>
          <h3>Track Your Nutrition</h3>
          <p>6+ million foods at your fingertips</p>
        </div>

        <div className="food-options-list">
          {foodOptions.map((option, index) => (
            <button
              key={index}
              className="food-option-item"
              onClick={() => setShowFoodScanner(true)}
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

        <div className="food-info">
          <p>💡 Scan, search, or browse - we support all major food databases!</p>
        </div>
      </div>
    </div>
  );
}
