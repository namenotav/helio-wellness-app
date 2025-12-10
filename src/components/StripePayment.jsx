import React, { useState } from 'react';
import './StripePayment.css';

const StripePayment = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billing: '',
      features: [
        '✅ All basic tracking',
        '✅ 10 AI messages/day',
        '✅ 3 food scans/day',
        '✅ 1 AR scan/week',
        '✅ Community access',
        '✅ 1 social battle',
        '❌ No ads removal',
        '❌ Limited features'
      ]
    },
    {
      id: 'essential',
      name: 'Essential',
      price: 4.99,
      billing: 'per month',
      stripeLink: import.meta.env.VITE_STRIPE_PAYMENT_LINK_ESSENTIAL || 'https://buy.stripe.com/fZu14m12T9sycf67Yk6kg09',
      features: [
        '✅ NO ADS',
        '✅ 30 AI messages/day',
        '✅ 1 AR scan/day',
        '✅ Weekly avatar update',
        '✅ Basic DNA insights',
        '✅ Social battles',
        '✅ Emergency contact',
        '✅ Offline tracking',
        '✅ Email support (24hr)',
        '✅ Heart rate tracking',
        '✅ Sleep analysis',
        '✅ Workout library',
        '✅ Meditation & breathing',
        '❌ No meal automation'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 14.99,
      billing: 'per month',
      stripeLink: import.meta.env.VITE_STRIPE_PAYMENT_LINK_PREMIUM || 'https://buy.stripe.com/7sY8wOcLBfQW3IA92o6kg07',
      features: [
        '✅ Everything in Essential',
        '✅ 50 AI messages/day',
        '✅ 100 AR credits/month',
        '✅ Full DNA analysis',
        '✅ Unlimited avatar',
        '✅ Meal automation',
        '✅ Family 3 members',
        '✅ Priority chat (2hr response)',
        '✅ Health data export (PDF)',
        '❌ No API access'
      ]
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 29.99,
      billing: 'per month',
      stripeLink: import.meta.env.VITE_STRIPE_PAYMENT_LINK_VIP || 'https://buy.stripe.com/5kQ9ASeTJfQW7YQ6Ug6kg08',
      features: [
        '✅ UNLIMITED AI messages',
        '✅ UNLIMITED AR scans',
        '✅ Everything in Premium',
        '✅ 1-on-1 coaching (30 min/mo)',
        '✅ White-label reports (PDF)',
        '✅ API access (1K calls/mo)',
        '✅ Phone support (9am-6pm)',
        '✅ Family 5 members',
        '✅ Priority onboarding'
      ]
    }
  ];

  const handleSubscribe = async (planId) => {
    if(import.meta.env.DEV)console.log('🔥 SUBSCRIBE BUTTON CLICKED - Plan:', planId);
    
    if (planId === 'free') {
      localStorage.setItem('subscription_plan', 'free');
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
      return;
    }
    
    // Map plan IDs to subscription tier names for storage
    const planMapping = {
      'essential': 'essential',
      'premium': 'premium',
      'ultimate': 'vip'
    };

    // Get the plan
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      setError('Plan not found. Please try again.');
      return;
    }

    if(import.meta.env.DEV)console.log('💳 Plan details:', plan);
    if(import.meta.env.DEV)console.log('Stripe Link:', plan.stripeLink);
    
    // Check if we have payment link
    if (!plan.stripeLink || plan.stripeLink.includes('undefined')) {
      setError('Payment link not configured. Contact support.');
      if(import.meta.env.DEV)console.error('❌ No valid Stripe payment link');
      return;
    }

    // Save pending subscription info (use mapped tier name)
    const tierName = planMapping[planId] || planId;
    localStorage.setItem('pending_subscription_plan', tierName);
    localStorage.setItem('pending_subscription_time', new Date().toISOString());
    
    if(import.meta.env.DEV)console.log('💳 Opening Stripe payment link:', plan.stripeLink);
    
    // Try to use Capacitor Browser for better mobile experience
    try {
      const { Browser } = await import('@capacitor/browser');
      if(import.meta.env.DEV)console.log('📱 Using Capacitor Browser');
      await Browser.open({ 
        url: plan.stripeLink,
        presentationStyle: 'popover'
      });
    } catch (err) {
      // Fallback to window.open or window.location
      if(import.meta.env.DEV)console.log('🌐 Capacitor Browser not available, using fallback');
      
      // Try window.open first (better for mobile)
      const opened = window.open(plan.stripeLink, '_blank');
      
      // If popup blocked, use window.location
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        if(import.meta.env.DEV)console.log('🔗 Popup blocked, using direct navigation');
        window.location.href = plan.stripeLink;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="stripe-overlay" onClick={onClose}>
      <div className="stripe-modal" onClick={(e) => e.stopPropagation()}>
        <button className="stripe-close" onClick={onClose}>✕</button>
        
        <div className="stripe-header">
          <h2>💎 Upgrade Your Wellness</h2>
          <p>Choose the plan that fits your health goals</p>
        </div>

        {success && (
          <div className="stripe-success">
            <div className="success-icon">✅</div>
            <h3>Payment Successful!</h3>
            <p>Your subscription is now active. Reloading app...</p>
          </div>
        )}

        {!success && (
          <>
            {error && (
              <div className="stripe-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="stripe-plans">
              {plans.map(plan => (
                <div 
                  key={plan.id}
                  className={`stripe-plan ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && <div className="popular-badge">🔥 MOST POPULAR</div>}
                  
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    {plan.price === 0 ? (
                      <span className="price-free">FREE</span>
                    ) : (
                      <>
                        <span className="price-currency">£</span>
                        <span className="price-amount">{plan.price.toFixed(2)}</span>
                        {plan.billing && <span className="price-period">/{plan.billing.replace('per ', '')}</span>}
                        {plan.savings && <span className="price-savings">{plan.savings}</span>}
                      </>
                    )}
                  </div>

                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>

                  <button
                    className={`plan-button ${loading && selectedPlan === plan.id ? 'loading' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                      handleSubscribe(plan.id);
                    }}
                    disabled={loading}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <span className="button-loader">⏳ Processing...</span>
                    ) : plan.price === 0 ? (
                      '✓ Current Plan'
                    ) : (
                      '💳 Subscribe Now'
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="stripe-footer">
              <p>🔒 Secure payment powered by Stripe</p>
              <p className="footer-note">Cancel anytime • No hidden fees • 7-day money-back guarantee</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StripePayment;



