// Health Avatar Quick View Modal
import { useState } from 'react';
import './HealthModal.css';
import HealthAvatar from './HealthAvatar';

export default function HealthModal({ isOpen, onClose }) {
  const [showHealthAvatar, setShowHealthAvatar] = useState(false);

  const healthFeatures = [
    { icon: '🔮', title: 'Future Prediction', desc: 'See your health in 10 years' },
    { icon: '📊', title: 'Health Score', desc: 'Current wellness rating' },
    { icon: '⚠️', title: 'Risk Analysis', desc: 'Identify potential issues' },
    { icon: '💊', title: 'Recommendations', desc: 'Personalized health tips' }
  ];

  if (!isOpen) return null;

  if (showHealthAvatar) {
    return <HealthAvatar isOpen={true} onClose={() => { setShowHealthAvatar(false); onClose(); }} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="health-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏥 Health Avatar</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="health-hero">
          <div className="hero-icon">🔮</div>
          <h3>Predict Your Future Health</h3>
          <p>AI-powered health forecasting</p>
        </div>

        <div className="health-features-list">
          {healthFeatures.map((feature, index) => (
            <div key={index} className="health-feature-item">
              <span className="feature-icon">{feature.icon}</span>
              <div className="feature-info">
                <span className="feature-title">{feature.title}</span>
                <span className="feature-desc">{feature.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="primary-action-btn" onClick={() => setShowHealthAvatar(true)}>
          🔮 View Health Avatar
        </button>

        <div className="health-info">
          <p>⚡ Based on your DNA, lifestyle, and activity data</p>
        </div>
      </div>
    </div>
  );
}
