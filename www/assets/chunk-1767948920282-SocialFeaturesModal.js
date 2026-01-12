import { j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const SocialFeaturesModal = ({ onClose, onOpenBattles, onOpenMeals, checkFeatureAccess }) => {
  const subscriptionService = window.subscriptionService;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "social-features-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "social-features-modal-content", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "social-features-modal-close", onClick: onClose, children: "×" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "social-features-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🎮 Social & Automation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Connect, compete & automate" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "social-features-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "social-feature-card premium", onClick: () => {
        onClose();
        checkFeatureAccess("socialBattles", onOpenBattles);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "social-icon", children: "⚔️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Social Battles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Challenge your friends" }),
        !subscriptionService?.hasAccess("socialBattles") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "lock-badge", children: "🔒" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "social-feature-card premium", onClick: () => {
        onClose();
        checkFeatureAccess("mealAutomation", onOpenMeals);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "social-icon", children: "🍽️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Meal Automation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Auto-log your meals" }),
        !subscriptionService?.hasAccess("mealAutomation") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "lock-badge", children: "🔒" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "social-features-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "✨ Upgrade to unlock social battles & meal automation" }) })
  ] }) });
};
export {
  SocialFeaturesModal as default
};
