import React from 'react';
import { checkoutEssential, checkoutPremium, checkoutVIP } from '../services/stripeService';
import './PaywallModal.css';

const PaywallModal = ({ isOpen, onClose, featureName, message, currentPlan }) => {
  if (!isOpen) return null;

  const handleUpgrade = (plan) => {
    onClose();
    if (plan === 'essential') {
      checkoutEssential();
    } else if (plan === 'premium') {
      checkoutPremium();
    } else if (plan === 'vip') {
      checkoutVIP();
    }
  };

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div className="paywall-modal-new" onClick={(e) => e.stopPropagation()}>
        <button className="paywall-close" onClick={onClose}>✕</button>

        <div className="paywall-header">
          <div className="paywall-icon">🔒</div>
          <h2>Unlock Premium Features</h2>
          <p className="paywall-subtitle">{message || 'Choose a plan to continue'}</p>
        </div>

        <div className="pricing-tiers">
          {/* FREE PLAN */}
          <div className={`pricing-tier ${currentPlan === 'free' ? 'current-plan' : ''}`}>
            <div className="tier-badge">Current Plan</div>
            <div className="tier-icon">🆓</div>
            <h3 className="tier-name">Free</h3>
            <div className="tier-price">
              <span className="price">£0</span>
              <span className="period">/forever</span>
            </div>
            <ul className="tier-features">
              <li>✅ Basic tracking</li>
              <li>✅ 10 AI messages/day</li>
              <li>✅ 3 food scans/day</li>
              <li>❌ No AR scanner</li>
              <li>❌ No DNA analysis</li>
              <li>❌ Limited features</li>
            </ul>
            {currentPlan === 'free' && (
              <div className="current-badge">You are here</div>
            )}
          </div>

          {/* ESSENTIAL PLAN */}
          <div className={`pricing-tier ${currentPlan === 'essential' ? 'current-plan' : 'featured'}`}>
            <div className="tier-badge popular">⭐ Most Popular</div>
            <div className="tier-icon">💪</div>
            <h3 className="tier-name">Essential</h3>
            <div className="tier-price">
              <span className="price">£4.99</span>
              <span className="period">/month</span>
            </div>
            <ul className="tier-features">
              <li>✅ NO ADS</li>
              <li>✅ 30 AI messages/day</li>
              <li>✅ 1 AR scan/day</li>
              <li>✅ Weekly avatar update</li>
              <li>✅ Basic DNA insights</li>
              <li>✅ Social battles</li>
              <li>✅ Emergency contact</li>
              <li>✅ Offline tracking</li>
            </ul>
            {currentPlan === 'essential' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn essential"
                onClick={() => handleUpgrade('essential')}
              >
                💪 Get Essential
              </button>
            )}
          </div>

          {/* PREMIUM PLAN */}
          <div className={`pricing-tier ${currentPlan === 'premium' ? 'current-plan' : ''}`}>
            <div className="tier-icon">⭐</div>
            <h3 className="tier-name">Premium</h3>
            <div className="tier-price">
              <span className="price">£14.99</span>
              <span className="period">/month</span>
            </div>
            <ul className="tier-features">
              <li>✅ Everything in Essential</li>
              <li>✅ 50 AI messages/day</li>
              <li>✅ 100 AR credits/month</li>
              <li>✅ Full DNA analysis</li>
              <li>✅ Unlimited avatar</li>
              <li>✅ Meal automation</li>
              <li>✅ Family 3 members</li>
              <li>✅ Health data export (PDF)</li>
            </ul>
            {currentPlan === 'premium' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn premium"
                onClick={() => handleUpgrade('premium')}
              >
                ⭐ Get Premium
              </button>
            )}
          </div>

          {/* VIP PLAN */}
          <div className={`pricing-tier ${currentPlan === 'vip' ? 'current-plan' : ''}`}>
            <div className="tier-badge vip">👑 VIP</div>
            <div className="tier-icon">👑</div>
            <h3 className="tier-name">Ultimate</h3>
            <div className="tier-price">
              <span className="price">£29.99</span>
              <span className="period">/month</span>
            </div>
            <ul className="tier-features">
              <li>✅ <strong>UNLIMITED</strong> AI messages</li>
              <li>✅ <strong>UNLIMITED</strong> AR scans</li>
              <li>✅ Everything in Premium</li>
              <li>✅ 1-on-1 coaching (30 min/mo)</li>
              <li>✅ White-label reports (PDF)</li>
              <li>✅ API access (1K calls/mo)</li>
              <li>✅ Phone support (9am-6pm)</li>
              <li>✅ Family 5 members</li>
            </ul>
            {currentPlan === 'vip' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn vip"
                onClick={() => handleUpgrade('vip')}
              >
                👑 Get Ultimate
              </button>
            )}
          </div>
        </div>

        <div className="paywall-footer">
          <p>🔒 Cancel anytime • 7-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;



