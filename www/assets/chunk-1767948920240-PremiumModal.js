import { r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import PaywallModal from "./chunk-1767948920155-PaywallModal.js";
import "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
function PremiumModal({ isOpen, onClose }) {
  const [showPaywall, setShowPaywall] = reactExports.useState(false);
  const features = [
    { icon: "🧬", title: "DNA Analysis", desc: "Unlimited genetic reports" },
    { icon: "🎯", title: "AI Meal Plans", desc: "Custom nutrition from DNA" },
    { icon: "👥", title: "Unlimited Battles", desc: "Compete with anyone" },
    { icon: "📊", title: "Advanced Analytics", desc: "Deep health insights" },
    { icon: "🏥", title: "Health Avatar", desc: "Future health prediction" },
    { icon: "✨", title: "No Ads", desc: "Pure focus experience" }
  ];
  const handleUpgrade = () => {
    setShowPaywall(true);
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "💎 Premium" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-hero", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-icon", children: "👑" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Unlock Your Full Potential" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Get access to all premium features" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "features-list", children: features.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: feature.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-title", children: feature.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-desc", children: feature.desc })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-check", children: "✓" })
      ] }, index)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pricing-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "price-tag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-value", children: "£6.99" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "price-period", children: "/month" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "trial-info", children: "30-day free trial • Cancel anytime" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "upgrade-btn", onClick: handleUpgrade, children: "Start Free Trial" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "terms-text", children: "By starting trial, you agree to our Terms & Privacy Policy" })
    ] }) }),
    showPaywall && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PaywallModal,
      {
        isOpen: showPaywall,
        onClose: () => {
          setShowPaywall(false);
          onClose();
        }
      }
    )
  ] });
}
export {
  PremiumModal as default
};
