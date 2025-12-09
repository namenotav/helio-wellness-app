// Stripe Payment Service - Using Payment Links (no server needed)

// Monthly subscription checkout - £9.99/month
export const checkoutMonthly = () => {
  window.location.href = 'https://buy.stripe.com/7sY3cu3b1cEK5QI1zW6kg00';
};

// Yearly subscription checkout - £99/year
export const checkoutYearly = () => {
  window.location.href = 'https://buy.stripe.com/4gMeVc4f52060wo7Yk6kg01';
};



