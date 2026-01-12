import { j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import { emergencyService } from "./chunk-1767948920147-emergencyService.js";
function GlobalFallAlert({ fallData, onDismiss }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    padding: "20px"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
    borderRadius: "25px",
    padding: "30px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(255, 0, 0, 0.5)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    animation: "pulse 1s infinite"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "white",
      textAlign: "center",
      marginBottom: "15px",
      textShadow: "0 2px 10px rgba(0,0,0,0.3)"
    }, children: "🤕 Hard Fall Detected!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
      fontSize: "18px",
      color: "white",
      textAlign: "center",
      marginBottom: "25px",
      opacity: 0.95
    }, children: "Are you OK? Choose an action:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            emergencyService.stopEmergencyAlarm();
            onDismiss();
          },
          style: {
            padding: "18px",
            background: "#00CC00",
            border: "none",
            borderRadius: "15px",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0, 204, 0, 0.4)"
          },
          children: "✓ I'm OK"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: async () => {
            emergencyService.stopEmergencyAlarm();
            await emergencyService.callPrimaryContact();
            onDismiss();
          },
          style: {
            padding: "18px",
            background: "#FF9900",
            border: "none",
            borderRadius: "15px",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(255, 153, 0, 0.4)"
          },
          children: "📞 Call My Contact"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: async () => {
            emergencyService.stopEmergencyAlarm();
            await emergencyService.call999();
            onDismiss();
          },
          style: {
            padding: "18px",
            background: "#FFFFFF",
            border: "none",
            borderRadius: "15px",
            color: "#CC0000",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(255, 255, 255, 0.3)"
          },
          children: "🚨 Call 999"
        }
      )
    ] })
  ] }) });
}
export {
  GlobalFallAlert as default
};
