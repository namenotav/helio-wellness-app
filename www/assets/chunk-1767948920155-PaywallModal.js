import { r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import { checkoutStarter, checkoutPremium, checkoutUltimate } from "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
const PaywallModal = ({ isOpen, onClose, featureName, message, currentPlan }) => {
  const [detailedPlan, setDetailedPlan] = reactExports.useState(null);
  if (!isOpen) return null;
  const handleUpgrade = (plan) => {
    onClose();
    if (plan === "starter") {
      checkoutStarter();
    } else if (plan === "premium") {
      checkoutPremium();
    } else if (plan === "ultimate") {
      checkoutUltimate();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "paywall-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "paywall-modal-new", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "paywall-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "paywall-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "paywall-icon", children: "🔒" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Unlock Premium Features" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "paywall-subtitle", children: message || "Choose a plan to continue" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pricing-tiers", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pricing-tier ${currentPlan === "free" ? "current-plan" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tier-badge", children: "Current Plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tier-icon", children: "🆓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "tier-name", children: "Free" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tier-price", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price", children: "£0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "period", children: "/forever" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "tier-features", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ 3 food scans/day" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ 1 workout/day" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No barcode scanner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No DNA analysis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No Health Avatar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No AR scanner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No social battles" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No meal automation" })
        ] }),
        currentPlan === "free" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "current-badge", children: "You are here" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pricing-tier compact ${currentPlan === "starter" ? "current-plan" : "featured"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tier-badge popular", children: "⭐ Most Popular" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tier-icon", children: "💪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "tier-name", children: "Starter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tier-price", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price", children: "£6.99" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "period", children: "/month" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tier-features-compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ Unlimited scans" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ Unlimited workouts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ Social battles" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "view-details-btn",
            onClick: () => setDetailedPlan("starter"),
            children: "View All Features"
          }
        ),
        currentPlan === "starter" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "current-badge", children: "You are here" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "upgrade-btn starter",
            onClick: () => handleUpgrade("starter"),
            children: "💪 Start 30 Days FREE"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pricing-tier compact ${currentPlan === "premium" ? "current-plan" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tier-icon", children: "⭐" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "tier-name", children: "Premium" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tier-price", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price", children: "£16.99" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "period", children: "/month" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tier-features-compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ Everything in Starter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ 50 AI messages/day" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ DNA analysis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ Health Avatar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "view-details-btn",
            onClick: () => setDetailedPlan("premium"),
            children: "View All Features"
          }
        ),
        currentPlan === "premium" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "current-badge", children: "You are here" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "upgrade-btn premium",
            onClick: () => handleUpgrade("premium"),
            children: "⭐ Start 30 Days FREE"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pricing-tier compact ${currentPlan === "ultimate" ? "current-plan" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tier-badge vip", children: "👑 VIP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tier-icon", children: "👑" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "tier-name", children: "Ultimate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tier-price", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price", children: "£34.99" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "period", children: "/month" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tier-features-compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "✅ ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UNLIMITED" }),
            " AI"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ Everything in Premium" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ Priority Support" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✅ VIP badge & perks" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "view-details-btn",
            onClick: () => setDetailedPlan("ultimate"),
            children: "View All Features"
          }
        ),
        currentPlan === "ultimate" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "current-badge", children: "You are here" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "upgrade-btn ultimate",
            onClick: () => handleUpgrade("ultimate"),
            children: "👑 Start 30 Days FREE"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "paywall-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "🔒 Cancel anytime • 30-day free trial" }) }),
    detailedPlan && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detailed-plan-overlay", onClick: () => setDetailedPlan(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-plan-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "detailed-close", onClick: () => setDetailedPlan(null), children: "✕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-content", children: [
        detailedPlan === "starter" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detailed-icon", children: "💪" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Starter Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-price", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price", children: "£6.99" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "period", children: "/month" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-features", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "All Features:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Unlimited food scans" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Unlimited barcode scans" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Unlimited workouts" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Social battles" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No DNA analysis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No Health Avatar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No AR scanner" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ No meal automation" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "detailed-upgrade-btn starter", onClick: () => {
            setDetailedPlan(null);
            handleUpgrade("starter");
          }, children: "💪 Start 30 Days FREE" })
        ] }),
        detailedPlan === "premium" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detailed-icon", children: "⭐" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Premium Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-price", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price", children: "£16.99" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "period", children: "/month" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-features", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "All Features:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Everything in Starter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ 50 AI messages/day" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Full DNA analysis (23andMe)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Health Avatar + predictions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ AR food scanner" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Social battles" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Meal automation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Health data export (PDF)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "detailed-upgrade-btn premium", onClick: () => {
            setDetailedPlan(null);
            handleUpgrade("premium");
          }, children: "⭐ Start 30 Days FREE" })
        ] }),
        detailedPlan === "ultimate" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detailed-icon", children: "👑" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Ultimate Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-price", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price", children: "£34.99" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "period", children: "/month" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detailed-features", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "All Features:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "✅ ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UNLIMITED" }),
                " AI messages"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Everything in Premium" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ 📞 Priority Support (2hr SLA)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ 🔬 Beta: AI Workout Generator" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ 👑 VIP badge & exclusive perks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ White-label reports (PDF)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Advanced analytics dashboard" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Custom health insights" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "detailed-upgrade-btn ultimate", onClick: () => {
            setDetailedPlan(null);
            handleUpgrade("ultimate");
          }, children: "👑 Start 30 Days FREE" })
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  PaywallModal as default
};
