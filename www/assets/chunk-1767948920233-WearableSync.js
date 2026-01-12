import { j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const WearableSync = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wearable-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wearable-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "wearable-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wearable-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wearable-icon", children: "⌚" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Wearable Devices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "48px", margin: "40px 0 20px" }, children: "🚧" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { color: "#FFB84D", marginBottom: "10px" }, children: "Coming Soon!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#b8b5d1", maxWidth: "400px", margin: "0 auto 30px" }, children: "Direct Bluetooth wearable sync is currently under development. For now, use Apple Health or Google Fit sync instead!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          style: {
            background: "var(--theme-accent-color, #8B5FE8)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "20px"
          },
          children: "Got It"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "30px", textAlign: "left" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { color: "#FFB84D", marginBottom: "15px" }, children: "📋 Planned Integrations:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { style: { color: "#b8b5d1", lineHeight: "1.8" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Fitbit (Charge, Versa, Sense series)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Garmin (Forerunner, Fenix series)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Apple Watch (Series 4+)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Samsung Galaxy Watch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Xiaomi Mi Band" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Generic Bluetooth heart rate monitors" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: "20px", padding: "15px", background: "rgba(0, 200, 255, 0.1)", borderRadius: "8px", border: "1px solid rgba(0, 200, 255, 0.3)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#00C8FF", margin: "0", fontSize: "14px" }, children: [
        "💡 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Alternative:" }),
        " You can currently sync fitness data via Apple Health (iOS) or Google Fit (Android) from Settings!"
      ] }) })
    ] })
  ] }) });
};
export {
  WearableSync as default
};
