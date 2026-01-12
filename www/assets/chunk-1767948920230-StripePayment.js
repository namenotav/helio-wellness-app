const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920211-index.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, _ as __vitePreload } from "./entry-1767948920134-index.js";
const StripePayment = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = reactExports.useState("free");
  const [detailedPlan, setDetailedPlan] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState(false);
  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      billing: "",
      features: [
        "✅ All basic tracking",
        "✅ 5 AI messages/day",
        "✅ 3 food scans/day",
        "✅ 1 workout/day",
        "✅ Step counter",
        "✅ Water tracking",
        "❌ No barcode scanner",
        "❌ No AR scanner",
        "❌ No social battles",
        "❌ Limited features"
      ]
    },
    {
      id: "starter",
      name: "Starter",
      price: 6.99,
      billing: "per month",
      stripeLink: "https://buy.stripe.com/9B6bJ03b1awCbb2emI6kg0a",
      features: [
        "✅ NO ADS",
        "✅ Unlimited AI messages",
        "✅ Unlimited food scans",
        "✅ Unlimited barcode scans",
        "✅ Unlimited workouts",
        "✅ Step counter",
        "✅ Social Battles",
        "✅ Heart rate tracking",
        "✅ Sleep tracking",
        "✅ Email support (24hr)",
        "❌ No DNA Analysis",
        "❌ No AR Scanner",
        "❌ No Health Avatar",
        "❌ No Meal Automation"
      ],
      popular: true
    },
    {
      id: "premium",
      name: "Premium",
      price: 16.99,
      billing: "per month",
      stripeLink: "https://buy.stripe.com/7sYfZg4f5fQWdja1zW6kg0d",
      features: [
        "✅ Everything in Starter",
        "✅ DNA Analysis",
        "✅ Social Battles",
        "✅ Meal Automation",
        "✅ Health Avatar",
        "✅ AR Scanner",
        "✅ Emergency Panel",
        "✅ Meditation Library",
        "✅ Heart Rate Tracking",
        "✅ Sleep Tracking",
        "✅ Breathing Exercises",
        "✅ PDF Export"
      ]
    },
    {
      id: "ultimate",
      name: "Ultimate",
      price: 34.99,
      billing: "per month",
      stripeLink: "https://buy.stripe.com/6oUbJ026X48egvmfqM6kg0e",
      features: [
        "✅ Everything in Premium",
        "✅ UNLIMITED AI messages",
        "✅ UNLIMITED AR scans",
        "✅ Priority Support (2hr response)",
        "✅ Beta access (early features)",
        "✅ VIP Badge in leaderboards",
        "✅ White-label reports (PDF)",
        "✅ Advanced analytics"
      ]
    }
  ];
  const compactFeaturesByPlan = {
    free: ["✅ All basic tracking", "✅ 5 AI messages/day", "✅ Step counter"],
    starter: ["✅ NO ADS", "✅ Unlimited AI messages", "✅ Unlimited food scans", "✅ Social Battles"],
    premium: ["✅ Everything in Starter", "✅ DNA Analysis", "✅ Health Avatar", "✅ AR Scanner"],
    ultimate: ["✅ Everything in Premium", "✅ UNLIMITED AI messages", "✅ Priority Support", "✅ Advanced analytics"]
  };
  const detailedPlanData = detailedPlan ? plans.find((p) => p.id === detailedPlan) : null;
  const handleSubscribe = async (planId) => {
    if (planId === "free") {
      localStorage.setItem("subscription_plan", "free");
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
      return;
    }
    const planMapping = {
      "starter": "starter",
      "premium": "premium",
      "ultimate": "ultimate"
    };
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      setError("Plan not found. Please try again.");
      return;
    }
    if (!plan.stripeLink || plan.stripeLink.includes("undefined")) {
      setError("Payment link not configured. Contact support.");
      return;
    }
    const tierName = planMapping[planId] || planId;
    localStorage.setItem("pending_subscription_plan", tierName);
    localStorage.setItem("pending_subscription_time", (/* @__PURE__ */ new Date()).toISOString());
    try {
      const { Browser } = await __vitePreload(async () => {
        const { Browser: Browser2 } = await import("./chunk-1767948920211-index.js");
        return { Browser: Browser2 };
      }, true ? __vite__mapDeps([0,1,2]) : void 0);
      if (false) ;
      await Browser.open({
        url: plan.stripeLink,
        presentationStyle: "popover"
      });
    } catch (err) {
      const opened = window.open(plan.stripeLink, "_blank");
      if (!opened || opened.closed || typeof opened.closed === "undefined") {
        window.location.href = plan.stripeLink;
      }
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-overlay", onClick: onClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "stripe-close", onClick: onClose, children: "✕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "💎 Upgrade Your Wellness" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Choose the plan that fits your health goals" })
      ] }),
      success && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-success", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "success-icon", children: "✅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Payment Successful!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your subscription is now active. Reloading app..." })
      ] }),
      !success && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-error", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⚠️" }),
          " ",
          error
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stripe-plans", children: plans.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `stripe-plan compact ${selectedPlan === plan.id ? "selected" : ""} ${plan.popular ? "popular" : ""}`,
            onClick: () => setSelectedPlan(plan.id),
            children: [
              plan.popular && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "popular-badge", children: "🔥 MOST POPULAR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: plan.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plan-price", children: plan.price === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-free", children: "FREE" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-currency", children: "£" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-amount", children: plan.price.toFixed(2) }),
                plan.billing && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "price-period", children: [
                  "/",
                  plan.billing.replace("per ", "")
                ] }),
                plan.savings && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-savings", children: plan.savings })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plan-features-compact", children: (compactFeaturesByPlan[plan.id] || plan.features.slice(0, 4)).map((feature, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: feature }, idx)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "view-details-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                    setDetailedPlan(plan.id);
                  },
                  children: "View All Features"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: `plan-button ${loading && selectedPlan === plan.id ? "loading" : ""}`,
                  onClick: (e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                    handleSubscribe(plan.id);
                  },
                  disabled: loading,
                  children: loading && selectedPlan === plan.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "button-loader", children: "⏳ Processing..." }) : plan.price === 0 ? "✓ Current Plan" : "💳 Subscribe Now"
                }
              )
            ]
          },
          plan.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-footer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "🔒 Secure payment powered by Stripe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "footer-note", children: "Cancel anytime • No hidden fees • 30-day free trial" })
        ] })
      ] })
    ] }),
    detailedPlanData && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stripe-detailed-overlay", onClick: () => setDetailedPlan(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-detailed-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "stripe-detailed-close", onClick: () => setDetailedPlan(null), children: "✕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-detailed-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-detailed-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
            detailedPlanData.name,
            " Plan"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stripe-detailed-price", children: detailedPlanData.price === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-free", children: "FREE" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-currency", children: "£" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-amount", children: detailedPlanData.price.toFixed(2) }),
            detailedPlanData.billing && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "price-period", children: [
              "/",
              detailedPlanData.billing.replace("per ", "")
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stripe-detailed-features", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "All Features:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: detailedPlanData.features.map((feature, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: feature }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "stripe-detailed-action",
            onClick: () => {
              setSelectedPlan(detailedPlanData.id);
              setDetailedPlan(null);
              handleSubscribe(detailedPlanData.id);
            },
            disabled: loading,
            children: detailedPlanData.price === 0 ? "✓ Current Plan" : "💳 Subscribe Now"
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  StripePayment as default
};
