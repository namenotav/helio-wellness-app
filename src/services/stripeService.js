// Stripe Payment Service - Server-side checkout with subscription verification

import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'https://helio-wellness-app-production.up.railway.app';

// Helper function to create checkout session
async function createCheckoutSession(priceId, plan) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    const response = await fetch(`${API_URL}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        priceId: priceId,
        plan: plan
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating checkout:', error);
    alert('Failed to start checkout. Please try again.');
  }
}

// Essential Plan - £4.99/month
export const checkoutEssential = () => {
  const priceId = import.meta.env.VITE_STRIPE_PRICE_ESSENTIAL || 'prod_TZhdMJIuUuIxOP';
  createCheckoutSession(priceId, 'essential');
};

// Premium Plan - £14.99/month  
export const checkoutPremium = () => {
  const priceId = import.meta.env.VITE_STRIPE_PRICE_PREMIUM || 'prod_TZhulmjk69SvVX';
  createCheckoutSession(priceId, 'premium');
};

// VIP Plan - £29.99/month
export const checkoutVIP = () => {
  const priceId = import.meta.env.VITE_STRIPE_PRICE_VIP || 'prod_TZhmpYUG5KqUaK';
  createCheckoutSession(priceId, 'vip');
};

// LEGACY - Monthly subscription checkout - £9.99/month (kept for backwards compatibility)
export const checkoutMonthly = () => {
  const monthlyLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK_MONTHLY || 'https://buy.stripe.com/7sY3cu3b1cEK5QI1zW6kg00';
  window.location.href = monthlyLink;
};

// LEGACY - Yearly subscription checkout - £99/year (kept for backwards compatibility)
export const checkoutYearly = () => {
  const yearlyLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK_YEARLY || 'https://buy.stripe.com/4gMeVc4f52060wo7Yk6kg01';
  window.location.href = yearlyLink;
};



