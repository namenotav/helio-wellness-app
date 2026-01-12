import { r as reactExports, j as jsxRuntimeExports, h as brainLearningService } from "./entry-1767948920134-index.js";
const DataManagementModal = ({ onClose, onOpenDNA, onExportDailyStats, onExportWorkoutHistory, onExportWorkoutHistoryCSV, onExportFoodLog, onExportFoodLogCSV, onExportFullReport, checkFeatureAccess }) => {
  const subscriptionService = window.subscriptionService;
  const [backupStatus, setBackupStatus] = reactExports.useState("");
  const [lastBackup, setLastBackup] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const timestamp = localStorage.getItem("last_backup_timestamp");
    if (timestamp) {
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 6e4);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays > 0) {
        setLastBackup(`${diffDays} day${diffDays > 1 ? "s" : ""} ago`);
      } else if (diffHours > 0) {
        setLastBackup(`${diffHours} hour${diffHours > 1 ? "s" : ""} ago`);
      } else if (diffMins > 0) {
        setLastBackup(`${diffMins} minute${diffMins > 1 ? "s" : ""} ago`);
      } else {
        setLastBackup("Just now");
      }
    }
  }, []);
  const handleManualBackup = async () => {
    setBackupStatus("⏳ Backing up...");
    try {
      const success = await brainLearningService.syncToFirebase();
      if (success) {
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        localStorage.setItem("last_backup_timestamp", timestamp);
        setBackupStatus("✅ Backup complete!");
        setLastBackup("Just now");
        setTimeout(() => setBackupStatus(""), 3e3);
      } else {
        setBackupStatus("⚠️ Login required");
        setTimeout(() => setBackupStatus(""), 3e3);
      }
    } catch (error) {
      setBackupStatus("❌ Backup failed");
      setTimeout(() => setBackupStatus(""), 3e3);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-management-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-management-modal-content", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "data-management-modal-close", onClick: onClose, children: "×" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-management-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "📊 Data & Reports" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Manage your health data & exports" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-management-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card premium", onClick: () => {
        onClose();
        checkFeatureAccess("dnaAnalysis", onOpenDNA);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "🧬" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "DNA Upload" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "23andMe & AncestryDNA" }),
        !subscriptionService?.hasAccess("dnaAnalysis") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "lock-badge", children: "🔒" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card", onClick: () => {
        onClose();
        onExportDailyStats();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "📋" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Daily Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Export today's stats (PDF)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card", onClick: () => {
        onClose();
        onExportWorkoutHistory();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "🏋️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Workout Data (PDF)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Export workouts as PDF" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card", onClick: () => {
        onClose();
        onExportWorkoutHistoryCSV();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "📊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Workout Data (CSV)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Export for Excel/Sheets" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card", onClick: () => {
        onClose();
        onExportFoodLog();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "🍽️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Food Log (PDF)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Export 30-day nutrition" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card", onClick: () => {
        onClose();
        onExportFoodLogCSV();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "📊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Food Log (CSV)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Export for Excel/Sheets" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card", onClick: () => {
        onClose();
        onExportFullReport();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "📊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Full Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Complete health report (PDF)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "data-mgmt-card backup-card", onClick: handleManualBackup, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "data-icon", children: "☁️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Backup to Cloud" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Sync AI data to Firebase now" }),
        lastBackup && !backupStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "backup-status", style: { color: "#888" }, children: [
          "Last: ",
          lastBackup
        ] }),
        backupStatus && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "backup-status", children: backupStatus })
      ] })
    ] })
  ] }) });
};
export {
  DataManagementModal as default
};
