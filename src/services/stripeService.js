// Stripe Payment Service - Using Payment Links (no server needed)

// Monthly subscription checkout - £9.99/month
export const checkoutMonthly = () => {
  const monthlyLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK_MONTHLY || 'https://buy.stripe.com/7sY3cu3b1cEK5QI1zW6kg00';
  window.location.href = monthlyLink;
};

// Yearly subscription checkout - £99/year
export const checkoutYearly = () => {
  const yearlyLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK_YEARLY || 'https://buy.stripe.com/4gMeVc4f52060wo7Yk6kg01';
  window.location.href = yearlyLink;
};



