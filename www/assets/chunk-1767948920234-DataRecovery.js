import { r as reactExports, x as syncService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const DataRecovery = ({ onClose }) => {
  const [lastBackup, setLastBackup] = reactExports.useState(null);
  const [isBackingUp, setIsBackingUp] = reactExports.useState(false);
  const [isRestoring, setIsRestoring] = reactExports.useState(false);
  const [statusMessage, setStatusMessage] = reactExports.useState("");
  reactExports.useEffect(() => {
    loadLastBackupTime();
  }, []);
  const loadLastBackupTime = async () => {
    const timestamp = await syncService.getLastBackupTime();
    if (timestamp) {
      setLastBackup(new Date(timestamp).toLocaleString());
    } else {
      setLastBackup("Never");
    }
  };
  const handleBackupNow = async () => {
    try {
      setIsBackingUp(true);
      setStatusMessage("🔄 Backing up all data to cloud...");
      const result = await syncService.manualBackupToCloud();
      if (result.success) {
        setStatusMessage(`✅ Backup complete! ${result.backedUpCount} items saved to cloud.`);
        await loadLastBackupTime();
      } else {
        setStatusMessage(`❌ Backup failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Backup error: ${error.message}`);
    } finally {
      setIsBackingUp(false);
      setTimeout(() => setStatusMessage(""), 5e3);
    }
  };
  const handleRestoreNow = async () => {
    const confirmed = window.confirm(
      "⚠️ This will restore ALL data from your last cloud backup. Your current local data will be replaced. Continue?"
    );
    if (!confirmed) return;
    try {
      setIsRestoring(true);
      setStatusMessage("🔄 Restoring all data from cloud...");
      const result = await syncService.manualRestoreFromCloud();
      if (result.success) {
        setStatusMessage(`✅ Restore complete! ${result.restoredCount} items restored from cloud.`);
        setTimeout(() => {
          window.location.reload();
        }, 2e3);
      } else {
        setStatusMessage(`❌ Restore failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Restore error: ${error.message}`);
    } finally {
      setIsRestoring(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-recovery-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-recovery-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-recovery-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "💾 Data Backup & Recovery" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-recovery-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "backup-status", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-label", children: "Last Backup:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-value", children: lastBackup || "Loading..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "status-info", children: "ℹ️ Your data is automatically backed up to the cloud when you're online. Use manual backup for immediate protection." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recovery-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "backup-btn",
            onClick: handleBackupNow,
            disabled: isBackingUp || isRestoring,
            children: isBackingUp ? "⏳ Backing up..." : "☁️ Backup Now"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "restore-btn",
            onClick: handleRestoreNow,
            disabled: isBackingUp || isRestoring,
            children: isRestoring ? "⏳ Restoring..." : "🔄 Restore from Cloud"
          }
        )
      ] }),
      statusMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-message", children: statusMessage }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📦 What's Backed Up:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Step history & activity data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Food logs & meal plans" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Workout history & rep counter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Sleep tracking data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Heart rate measurements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Meditation & breathing sessions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Emergency contacts & medical info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ DNA analysis results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Profile & preferences" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✅ Health avatar data" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-security", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "🔒 ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Your data is secure:" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stored in your private Firebase account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "End-to-end encrypted transmission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Only you can access your data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Backed up to 3 locations: Device, Preferences, Cloud" })
        ] })
      ] })
    ] })
  ] }) });
};
export {
  DataRecovery as default
};
