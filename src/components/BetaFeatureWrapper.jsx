// Beta Feature Wrapper Component
// Shows beta features only to Ultimate plan users
import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import './BetaFeatureWrapper.css';

export default function BetaFeatureWrapper({ children, featureName, fallbackUI = null }) {
  const [hasBetaAccess, setHasBetaAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = () => {
    try {
      const hasAccess = subscriptionService.hasAccess('betaAccess');
      setHasBetaAccess(hasAccess);
      
      if (import.meta.env.DEV) {
        console.log(`🔬 [BetaFeatureWrapper] Beta access for "${featureName}":`, hasAccess);
      }
    } catch (error) {
      console.error('Failed to check beta access:', error);
      setHasBetaAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="beta-loading">
        <div className="beta-spinner">⏳</div>
        <p>Checking access...</p>
      </div>
    );
  }

  if (!hasBetaAccess) {
    // Show fallback UI or upgrade message
    return fallbackUI || (
      <div className="beta-locked">
        <div className="beta-locked-content">
          <div className="beta-icon">🔬</div>
          <h3>Beta Feature</h3>
          <p className="beta-feature-name">{featureName}</p>
          <p className="beta-description">
            This feature is currently in early access testing.
          </p>
          <div className="beta-upgrade-box">
            <div className="beta-badge">👑 ULTIMATE EXCLUSIVE</div>
            <p className="beta-upgrade-text">
              Upgrade to Ultimate plan (£34.99/mo) to get early access to cutting-edge features before anyone else.
            </p>
            <button 
              className="beta-upgrade-btn"
              onClick={() => {
                // Trigger upgrade modal
                const event = new CustomEvent('openPaywallModal');
                window.dispatchEvent(event);
              }}
            >
              🚀 Unlock Beta Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has beta access - show the feature
  return (
    <div className="beta-feature-container">
      <div className="beta-header">
        <span className="beta-tag">🔬 BETA</span>
        <span className="beta-label">{featureName}</span>
      </div>
      {children}
    </div>
  );
}
