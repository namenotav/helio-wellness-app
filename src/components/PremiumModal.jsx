// Premium Upsell Modal - Attractive upgrade offer
import { useState } from 'react';
import './PremiumModal.css';
import PaywallModal from './PaywallModal';

export default function PremiumModal({ isOpen, onClose }) {
  const [showPaywall, setShowPaywall] = useState(false);

  const features = [
    { icon: '🧬', title: 'DNA Analysis', desc: 'Unlimited genetic reports' },
    { icon: '🎯', title: 'AI Meal Plans', desc: 'Custom nutrition from DNA' },
    { icon: '👥', title: 'Unlimited Battles', desc: 'Compete with anyone' },
    { icon: '📊', title: 'Advanced Analytics', desc: 'Deep health insights' },
    { icon: '🏥', title: 'Health Avatar', desc: 'Future health prediction' },
    { icon: '✨', title: 'No Ads', desc: 'Pure focus experience' }
  ];

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>💎 Premium</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="premium-hero">
            <div className="hero-icon">👑</div>
            <h3>Unlock Your Full Potential</h3>
            <p>Get access to all premium features</p>
          </div>

          <div className="features-list">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-info">
                  <span className="feature-title">{feature.title}</span>
                  <span className="feature-desc">{feature.desc}</span>
                </div>
                <span className="feature-check">✓</span>
              </div>
            ))}
          </div>

          <div className="pricing-section">
            <div className="price-tag">
              <span className="price-value">$9.99</span>
              <span className="price-period">/month</span>
            </div>
            <p className="trial-info">7-day free trial • Cancel anytime</p>
          </div>

          <button className="upgrade-btn" onClick={handleUpgrade}>
            Start Free Trial
          </button>

          <p className="terms-text">
            By starting trial, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>

      {showPaywall && (
        <PaywallModal 
          isOpen={showPaywall} 
          onClose={() => {
            setShowPaywall(false);
            onClose();
          }} 
        />
      )}
    </>
  );
}
