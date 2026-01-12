import { j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const AppleHealthSync = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "apple-health-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apple-health-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "apple-health-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apple-health-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "health-icon", children: "❤️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Apple Health Sync" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "48px", margin: "40px 0 20px" }, children: "🚧" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { color: "#FFB84D", marginBottom: "10px" }, children: "Coming Soon!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#b8b5d1", maxWidth: "400px", margin: "0 auto 30px" }, children: "Native Apple Health integration is currently under development. Stay tuned for seamless health data sync!" }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { color: "#FFB84D", marginBottom: "15px" }, children: "📋 Planned Features:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { style: { color: "#b8b5d1", lineHeight: "1.8" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Automatic step sync from Apple Health" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Heart rate monitoring integration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Sleep analysis tracking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Calories & distance sync" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Workout session import" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✨ Body measurements sync" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#888", marginTop: "20px", fontSize: "14px" }, children: "🔒 Your health data will be private and encrypted when this feature launches." })
    ] })
  ] }) });
};
export {
  AppleHealthSync as default
};
