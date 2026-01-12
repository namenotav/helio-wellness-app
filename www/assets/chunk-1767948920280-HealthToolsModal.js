import { j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const HealthToolsModal = ({ onClose, onOpenHealthAvatar, onOpenARScanner, onOpenEmergency, onOpenInsurance }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "health-tools-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-tools-modal-content", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "health-tools-modal-close", onClick: onClose, children: "×" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-tools-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🏥 Health Tools" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your complete health toolkit" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-tools-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "health-tool-card", onClick: () => {
        onClose();
        onOpenHealthAvatar();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tool-icon", children: "👤" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Health Avatar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Customize your character" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "health-tool-card premium", onClick: () => {
        alert("🚧 Coming Soon!\n\nBody Scanner feature is currently under development. Stay tuned!");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tool-icon", children: "📱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Body Scanner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "3D body scanning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "premium-badge", children: "✨" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "health-tool-card", onClick: () => {
        onClose();
        onOpenEmergency();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tool-icon", children: "🚨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Emergency Panel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "SOS contacts & info" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "health-tool-card premium", onClick: () => {
        onClose();
        onOpenInsurance();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tool-icon", children: "🏥" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Insurance Rewards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Track your benefits" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "premium-badge", children: "✨" })
      ] })
    ] })
  ] }) });
};
export {
  HealthToolsModal as default
};
