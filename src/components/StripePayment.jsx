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
        '✅ Very basic tracking',
        '✅ Steps & water only',
        '✅ 5 AI messages/day',
        '✅ 3 food scans/day',
        '❌ All premium features locked'
      ]
    },
    {
      id: 'premium_monthly',
      name: 'Premium',
      price: 9.99,
      billing: 'per month',
      stripeLink: import.meta.env.VITE_STRIPE_PAYMENT_LINK_MONTHLY || 
                  `https://buy.stripe.com/payment?priceId=${import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID}`,
      stripePriceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
      features: [
        '✅ Unlimited AI coaching',
        '✅ Unlimited food scanning',
        '✅ DNA analysis & insights',
        '✅ Social battles',
        '✅ Health avatar predictions',
        '✅ AR body scanner',
        '✅ Meal automation',
        '✅ Emergency monitoring',
        '✅ Heart rate tracking',
        '✅ Sleep analysis',
        '✅ Workout library',
        '✅ Meditation & breathing',
        '⏳ Insurance rewards (Soon)',
        '⏳ Apple Health sync (Soon)',
        '⏳ Wearable integration (Soon)'
      ],
      popular: true
    },
    {
      id: 'premium_yearly',
      name: 'Premium',
      price: 99.00,
      billing: 'per year',
      savings: '17% OFF',
      stripeLink: import.meta.env.VITE_STRIPE_PAYMENT_LINK_YEARLY || 
                  import.meta.env.VITE_STRIPE_PAYMENT_LINK ||
                  `https://buy.stripe.com/payment?priceId=${import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID}`,
      stripePriceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID,
      features: [
        '✅ Everything in Monthly',
        '💰 Save £20/year',
        '✅ Unlimited AI coaching',
        '✅ Unlimited food scanning',
        '✅ DNA analysis & insights',
        '✅ Social battles',
        '✅ Health avatar predictions',
        '✅ AR body scanner',
        '✅ Meal automation',
        '✅ Emergency monitoring',
        '✅ Heart rate tracking',
        '✅ Sleep analysis',
        '✅ Workout library',
        '✅ Meditation & breathing',
        '⏳ Insurance rewards (Soon)',
        '⏳ Apple Health sync (Soon)',
        '⏳ Wearable integration (Soon)'
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

    // Save pending subscription info
    localStorage.setItem('pending_subscription_plan', planId);
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



