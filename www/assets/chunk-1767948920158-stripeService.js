import { b as auth } from "./entry-1767948920134-index.js";
const API_URL = "https://helio-wellness-app-production.up.railway.app";
async function createCheckoutSession(priceId, plan) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be logged in to subscribe");
    }
    console.log("🔒 Fetching CSRF token...");
    const csrfResponse = await fetch(`${API_URL}/api/csrf-token`);
    if (!csrfResponse.ok) {
      throw new Error("Failed to get security token. Please check your connection.");
    }
    const { csrfToken } = await csrfResponse.json();
    console.log("✅ CSRF token received");
    const response = await fetch(`${API_URL}/api/stripe/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken
      },
      body: JSON.stringify({
        userId: user.uid,
        priceId,
        plan
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create checkout session");
    }
    const data = await response.json();
    window.location.href = data.url;
  } catch (error) {
    console.error("❌ Error creating checkout:", error);
    alert("Failed to start checkout. Please try again.\n\n" + error.message);
  }
}
const checkoutStarter = () => {
  const priceId = "price_1SffiWD2EDcoPFLNrGfZU1c6";
  createCheckoutSession(priceId, "starter");
};
const checkoutPremium = () => {
  const priceId = "price_1Sffj1D2EDcoPFLNkqdUxY9L";
  createCheckoutSession(priceId, "premium");
};
const checkoutUltimate = () => {
  const priceId = "price_1Sffk1D2EDcoPFLN4yxdNXSq";
  createCheckoutSession(priceId, "ultimate");
};
export {
  checkoutPremium,
  checkoutStarter,
  checkoutUltimate
};
