import { r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import HealthAvatar from "./chunk-1767948920268-HealthAvatar.js";
import "./chunk-1767948920148-healthAvatarService.js";
import "./chunk-1767948920155-PaywallModal.js";
import "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
function HealthModal({ isOpen, onClose }) {
  const [showHealthAvatar, setShowHealthAvatar] = reactExports.useState(false);
  const healthFeatures = [
    { icon: "🔮", title: "Future Prediction", desc: "See your health in 10 years" },
    { icon: "📊", title: "Health Score", desc: "Current wellness rating" },
    { icon: "⚠️", title: "Risk Analysis", desc: "Identify potential issues" },
    { icon: "💊", title: "Recommendations", desc: "Personalized health tips" }
  ];
  if (!isOpen) return null;
  if (showHealthAvatar) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HealthAvatar, { isOpen: true, onClose: () => {
      setShowHealthAvatar(false);
      onClose();
    } });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🏥 Health Avatar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-hero", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-icon", children: "🔮" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Predict Your Future Health" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "AI-powered health forecasting" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "health-features-list", children: healthFeatures.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-feature-item", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: feature.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-title", children: feature.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-desc", children: feature.desc })
      ] })
    ] }, index)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-action-btn", onClick: () => setShowHealthAvatar(true), children: "🔮 View Health Avatar" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "health-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "⚡ Based on your DNA, lifestyle, and activity data" }) })
  ] }) });
}
export {
  HealthModal as default
};
