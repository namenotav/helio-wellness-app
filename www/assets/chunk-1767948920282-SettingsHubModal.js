import { j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const SettingsHubModal = ({ onClose, onOpenNotifications, onOpenTheme, onOpenDevUnlock, onLogout, showDevButton, isDevMode, onDisableDevMode, onResetStepCounter, user }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-hub-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-hub-modal-content", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "settings-hub-modal-close", onClick: onClose, children: "×" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-hub-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "⚙️ Settings & More" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Customize your experience" })
    ] }),
    isDevMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dev-mode-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dev-mode-badge", children: "✅ DEVELOPER MODE ACTIVE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "dev-mode-subtitle", children: "All Premium Features Unlocked 🚀" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dev-mode-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          onResetStepCounter();
        }, className: "dev-action-btn reset", children: "🔄 Reset Step Counter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          onDisableDevMode();
        }, className: "dev-action-btn disable", children: "🔒 Disable Developer Mode" }),
        user?.email === "miphoma@gmail.com" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            onClose();
            setTimeout(() => {
              window.location.href = "/admin-support";
            }, 100);
          }, className: "dev-action-btn admin", children: "🎫 Support Tickets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            onClose();
            setTimeout(() => {
              window.location.href = "/admin";
            }, 100);
          }, className: "dev-action-btn admin", children: "⚡ Monitoring Dashboard" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-hub-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card", onClick: () => {
        onClose();
        onOpenNotifications();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "🔔" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Manage push alerts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card", onClick: () => {
        onClose();
        onOpenTheme();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "🎨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Theme" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Dark/Light mode" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card", onClick: () => {
        onClose();
        user?.onOpenDataRecovery();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "💾" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Backup/Restore" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Save your data" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card", onClick: () => {
        onClose();
        user?.onOpenAppleHealth();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "❤️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Apple Health" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Sync health data" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card", onClick: () => {
        onClose();
        user?.onOpenWearables();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "⌚" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Wearables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Connect devices" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card", onClick: () => {
        onClose();
        user?.onOpenSupport();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "❓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Help & Support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Get assistance" })
      ] }),
      showDevButton && !isDevMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card premium", onClick: () => {
        onClose();
        onOpenDevUnlock();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "🔒" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Dev Mode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Unlock features" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "settings-card logout-card", onClick: () => {
        onClose();
        onLogout();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-icon", children: "🚪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Sign Out" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Logout from app" })
      ] })
    ] })
  ] }) });
};
export {
  SettingsHubModal as default
};
