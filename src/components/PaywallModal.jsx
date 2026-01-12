import React, { useState } from 'react';
import { checkoutStarter, checkoutPremium, checkoutUltimate } from '../services/stripeService';
import './PaywallModal.css';

const PaywallModal = ({ isOpen, onClose, featureName, message, currentPlan }) => {
  const [detailedPlan, setDetailedPlan] = useState(null); // Track which plan to show in detail
  
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
          <div className={`pricing-tier compact ${currentPlan === 'starter' ? 'current-plan' : 'featured'}`}>
            <div className="tier-badge popular">⭐ Most Popular</div>
            <div className="tier-icon">💪</div>
            <h3 className="tier-name">Starter</h3>
            <div className="tier-price">
              <span className="price">£6.99</span>
              <span className="period">/month</span>
            </div>
            <div className="tier-features-compact">
              <p>✅ Unlimited scans</p>
              <p>✅ Unlimited workouts</p>
              <p>✅ Heart rate & sleep</p>
            </div>
            <button 
              className="view-details-btn"
              onClick={() => setDetailedPlan('starter')}
            >
              View All Features
            </button>
            {currentPlan === 'starter' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn starter"
                onClick={() => handleUpgrade('starter')}
              >
                💪 Start 30 Days FREE
              </button>
            )}
          </div>

          {/* PREMIUM PLAN */}
          <div className={`pricing-tier compact ${currentPlan === 'premium' ? 'current-plan' : ''}`}>
            <div className="tier-icon">⭐</div>
            <h3 className="tier-name">Premium</h3>
            <div className="tier-price">
              <span className="price">£16.99</span>
              <span className="period">/month</span>
            </div>
            <div className="tier-features-compact">
              <p>✅ Everything in Starter</p>
              <p>✅ 50 AI messages/day</p>
              <p>✅ DNA analysis</p>
              <p>✅ Health Avatar</p>
            </div>
            <button 
              className="view-details-btn"
              onClick={() => setDetailedPlan('premium')}
            >
              View All Features
            </button>
            {currentPlan === 'premium' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn premium"
                onClick={() => handleUpgrade('premium')}
              >
                ⭐ Start 30 Days FREE
              </button>
            )}
          </div>

          {/* ULTIMATE PLAN - HIDDEN UNTIL MORE FEATURES DEVELOPED
          <div className={`pricing-tier compact ${currentPlan === 'ultimate' ? 'current-plan' : ''}`}>
            <div className="tier-badge vip">👑 VIP</div>
            <div className="tier-icon">👑</div>
            <h3 className="tier-name">Ultimate</h3>
            <div className="tier-price">
              <span className="price">£34.99</span>
              <span className="period">/month</span>
            </div>
            <div className="tier-features-compact">
              <p>✅ <strong>UNLIMITED</strong> AI</p>
              <p>✅ Everything in Premium</p>
              <p>✅ Priority Support</p>
              <p>✅ VIP badge & perks</p>
            </div>
            <button 
              className="view-details-btn"
              onClick={() => setDetailedPlan('ultimate')}
            >
              View All Features
            </button>
            {currentPlan === 'ultimate' ? (
              <div className="current-badge">You are here</div>
            ) : (
              <button 
                className="upgrade-btn ultimate"
                onClick={() => handleUpgrade('ultimate')}
              >
                👑 Start 30 Days FREE
              </button>
            )}
          </div>
          */}
        </div>

        <div className="paywall-footer">
          <p>🔒 Cancel anytime • 30-day free trial</p>
        </div>

        {/* DETAILED PLAN MODAL */}
        {detailedPlan && (
          <div className="detailed-plan-overlay" onClick={() => setDetailedPlan(null)}>
            <div className="detailed-plan-modal" onClick={(e) => e.stopPropagation()}>
              <button className="detailed-close" onClick={() => setDetailedPlan(null)}>✕</button>
              
              <div className="detailed-content">
                {detailedPlan === 'starter' && (
                  <>
                    <div className="detailed-header">
                      <div className="detailed-icon">💪</div>
                      <h2>Starter Plan</h2>
                      <div className="detailed-price">
                        <span className="price">£6.99</span>
                        <span className="period">/month</span>
                      </div>
                    </div>
                    <div className="detailed-features">
                      <h3>All Features:</h3>
                      <ul>
                        <li>✅ Unlimited food scans</li>
                        <li>✅ Unlimited barcode scans</li>
                        <li>✅ Unlimited workouts</li>
                        <li>✅ Social battles</li>
                        <li>❌ No DNA analysis</li>
                        <li>❌ No Health Avatar</li>
                        <li>❌ No AR scanner</li>
                        <li>❌ No meal automation</li>
                      </ul>
                    </div>
                    <button className="detailed-upgrade-btn starter" onClick={() => { setDetailedPlan(null); handleUpgrade('starter'); }}>
                      💪 Start 30 Days FREE
                    </button>
                  </>
                )}
                
                {detailedPlan === 'premium' && (
                  <>
                    <div className="detailed-header">
                      <div className="detailed-icon">⭐</div>
                      <h2>Premium Plan</h2>
                      <div className="detailed-price">
                        <span className="price">£16.99</span>
                        <span className="period">/month</span>
                      </div>
                    </div>
                    <div className="detailed-features">
                      <h3>All Features:</h3>
                      <ul>
                        <li>✅ Everything in Starter</li>
                        <li>✅ 50 AI messages/day</li>
                        <li>✅ Full DNA analysis (23andMe)</li>
                        <li>✅ Health Avatar + predictions</li>
                        <li>✅ AR food scanner</li>
                        <li>✅ Social battles</li>
                        <li>✅ Meal automation</li>
                        <li>✅ Health data export (PDF)</li>
                      </ul>
                    </div>
                    <button className="detailed-upgrade-btn premium" onClick={() => { setDetailedPlan(null); handleUpgrade('premium'); }}>
                      ⭐ Start 30 Days FREE
                    </button>
                  </>
                )}
                
                {/* ULTIMATE DETAIL MODAL - HIDDEN UNTIL MORE FEATURES DEVELOPED
                {detailedPlan === 'ultimate' && (
                  <>
                    <div className="detailed-header">
                      <div className="detailed-icon">👑</div>
                      <h2>Ultimate Plan</h2>
                      <div className="detailed-price">
                        <span className="price">£34.99</span>
                        <span className="period">/month</span>
                      </div>
                    </div>
                    <div className="detailed-features">
                      <h3>All Features:</h3>
                      <ul>
                        <li>✅ <strong>UNLIMITED</strong> AI messages</li>
                        <li>✅ Everything in Premium</li>
                        <li>✅ 📞 Priority Support (2hr SLA)</li>
                        <li>✅ 🔬 Beta: AI Workout Generator</li>
                        <li>✅ 👑 VIP badge & exclusive perks</li>
                        <li>✅ White-label reports (PDF)</li>
                        <li>✅ Advanced analytics dashboard</li>
                        <li>✅ Custom health insights</li>
                      </ul>
                    </div>
                    <button className="detailed-upgrade-btn ultimate" onClick={() => { setDetailedPlan(null); handleUpgrade('ultimate'); }}>
                      👑 Start 30 Days FREE
                    </button>
                  </>
                )}
                */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaywallModal;



