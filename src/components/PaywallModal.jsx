import React from 'react';
import './PaywallModal.css';

const PaywallModal = ({ isOpen, onClose, featureName, message, currentPlan, requiredPlan, onUpgrade, isComingSoon }) => {
  if (!isOpen) return null;

  // Check if this is a "coming soon" feature
  const comingSoonFeatures = ['insuranceRewards', 'appleHealthSync', 'wearableSync', 'exportReports'];
  const isFeatureComingSoon = isComingSoon || comingSoonFeatures.includes(featureName);

  const planDetails = {
    premium: {
      name: 'Premium',
      price: '£9.99/mo or £99/year',
      icon: '⭐',
      color: '#667eea'
    }
  };

  const plan = planDetails[requiredPlan] || planDetails.premium;

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={(e) => e.stopPropagation()}>
        <button className="paywall-close" onClick={onClose}>✕</button>

        <div className="paywall-icon">🔒</div>
        
        <h2>Premium Feature</h2>
        <p className="paywall-message">{message}</p>

        <div className="paywall-required-plan">
          <span className="plan-icon">{plan.icon}</span>
          <div className="plan-details">
            <div className="plan-name">{plan.name} Plan Required</div>
            <div className="plan-price">{plan.price}</div>
          </div>
        </div>

        <div className="paywall-benefits">
          {isFeatureComingSoon ? (
            <>
              <h3>🚧 Coming Soon!</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
                This feature is currently in development and will be available soon. 
                Join Premium now and get early access when it launches!
              </p>
              <h3>✨ Get Premium Today:</h3>
            </>
          ) : (
            <h3>✨ Unlock with Premium:</h3>
          )}
          <ul>
            <li>✅ Unlimited AI coaching</li>
            <li>✅ Unlimited food scanning</li>
            <li>✅ DNA analysis & insights</li>
            <li>✅ Social battles</li>
            <li>✅ Health avatar predictions</li>
            <li>✅ AR body scanner</li>
            <li>✅ Meal automation (AI Chef)</li>
            <li>✅ 24/7 emergency monitoring</li>
            <li>✅ Heart rate tracking</li>
            <li>✅ Sleep analysis</li>
            <li>✅ Workout library</li>
            <li>✅ Meditation & breathing</li>
          </ul>
        </div>

        <div className="paywall-actions">
          {!isFeatureComingSoon && (
            <button 
              className="upgrade-btn"
              style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)` }}
              onClick={() => {
                onClose();
                onUpgrade();
              }}
            >
              {plan.icon} Upgrade to {plan.name}
            </button>
          )}
          
          <button className="later-btn" onClick={onClose}>
            {isFeatureComingSoon ? 'Got It' : 'Maybe Later'}
          </button>
        </div>

        <p className="paywall-footer">
          🔒 Cancel anytime • 7-day money-back guarantee
        </p>
      </div>
    </div>
  );
};

export default PaywallModal;



