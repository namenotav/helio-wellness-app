import React from 'react';
import { checkoutStarter, checkoutPremium, checkoutUltimate } from '../services/stripeService';
import './PaywallModal.css';

const PaywallModal = ({ isOpen, onClose, featureName, message, currentPlan }) => {
  if (!isOpen) return null;

  const handleUpgrade = (plan) => {
    onClose();
    if (plan === 'starter') {
      checkoutStarter();
    } else if (plan === 'premium') {
      checkoutPremium();
    } else if (plan === 'ultimate') {
      checkoutUltimate();
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
              <li>✅ 3 food scans/day</li>
              <li>✅ 1 workout/day</li>
              <li>❌ No barcode scanner</li>
              <li>❌ No DNA analysis</li>
              <li>❌ No Health Avatar</li>
              <li>❌ No AR scanner</li>
              <li>❌ No social battles</li>
              <li>❌ No meal automation</li>
            </ul>
            {currentPlan === 'free' && (
              <div className="current-badge">You are here</div>
            )}
          </div>

          {/* STARTER PLAN */}
          <div className={`pricing-tier ${currentPlan === 'starter' ? 'current-plan' : 'featured'}`}>
            <div className="tier-badge popular">⭐ Most Popular</div>
            <div className="tier-icon">💪</div>
            <h3 className="tier-name">Starter</h3>
            <div className="tier-price">
              <span className="price">£6.99</span>
              <span className="period">/month</span>
            </div>
            <ul className="tier-features">
              <li>✅ 3 food scans/day</li>
              <li>✅ 3 barcode scans/day</li>
              <li>✅ Unlimited workouts</li>
              <li>✅ Social battles</li>
              <li>❌ No DNA analysis</li>
              <li>❌ No Health Avatar</li>
              <li>❌ No AR scanner</li>
              <li>❌ No meal automation</li>
            </ul>
            {currentPlan === 'starter' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn starter"
                onClick={() => handleUpgrade('starter')}
              >
                💪 Get Starter
              </button>
            )}
          </div>

          {/* PREMIUM PLAN */}
          <div className={`pricing-tier ${currentPlan === 'premium' ? 'current-plan' : ''}`}>
            <div className="tier-icon">⭐</div>
            <h3 className="tier-name">Premium</h3>
            <div className="tier-price">
              <span className="price">£16.99</span>
              <span className="period">/month</span>
            </div>
            <ul className="tier-features">
              <li>✅ Everything in Starter</li>
              <li>✅ 50 AI messages/day</li>
              <li>✅ Full DNA analysis (23andMe)</li>
              <li>✅ Health Avatar + predictions</li>
              <li>✅ AR food scanner</li>
              <li>✅ Social battles</li>
              <li>✅ Meal automation</li>
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

          {/* ULTIMATE PLAN */}
          <div className={`pricing-tier ${currentPlan === 'ultimate' ? 'current-plan' : ''}`}>
            <div className="tier-badge vip">👑 VIP</div>
            <div className="tier-icon">👑</div>
            <h3 className="tier-name">Ultimate</h3>
            <div className="tier-price">
              <span className="price">£34.99</span>
              <span className="period">/month</span>
            </div>
            <ul className="tier-features">
              <li>✅ <strong>UNLIMITED</strong> AI messages</li>
              <li>✅ Everything in Premium</li>
              <li>✅ � Priority Support (2hr SLA)</li>
              <li>✅ 🔬 Beta: AI Workout Generator</li>
              <li>✅ 👑 VIP badge & exclusive perks</li>
              <li>✅ White-label reports (PDF)</li>
              <li>✅ Advanced analytics dashboard</li>
              <li>✅ Custom health insights</li>
            </ul>
            {currentPlan === 'ultimate' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn ultimate"
                onClick={() => handleUpgrade('ultimate')}
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



