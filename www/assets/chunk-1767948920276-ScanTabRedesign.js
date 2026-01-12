const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, _ as __vitePreload, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import { u as usePointsPopup } from "./chunk-1767948920275-PointsPopup.js";
function ScanTabRedesign({ onOpenFoodScanner, onOpenARScanner, onOpenBarcodeScanner }) {
  const { PopupsRenderer } = usePointsPopup();
  const [stats, setStats] = reactExports.useState({ scannedToday: 0, totalScans: 0, caloriesTracked: 0 });
  const [recentScans, setRecentScans] = reactExports.useState([]);
  reactExports.useEffect(() => {
    loadStats();
    loadRecentScans();
  }, []);
  const loadStats = async () => {
    const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let savedDate = null;
    let today = 0;
    let total = 0;
    let calories = 0;
    try {
      const { Preferences } = await __vitePreload(async () => {
        const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
        return { Preferences: Preferences2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const { value: prefsDate } = await Preferences.get({ key: "wellnessai_scans_today_date" });
      const { value: prefsToday } = await Preferences.get({ key: "wellnessai_scans_today" });
      const { value: prefsTotal } = await Preferences.get({ key: "wellnessai_total_scans" });
      const { value: prefsCalories } = await Preferences.get({ key: "wellnessai_calories_tracked" });
      savedDate = prefsDate || localStorage.getItem("scans_today_date");
      today = parseInt(prefsToday || localStorage.getItem("scans_today") || "0");
      total = parseInt(prefsTotal || localStorage.getItem("total_scans") || "0");
      calories = parseInt(prefsCalories || localStorage.getItem("calories_tracked") || "0");
      if (savedDate !== currentDate) {
        today = 0;
        localStorage.setItem("scans_today", "0");
        localStorage.setItem("scans_today_date", currentDate);
        await Preferences.set({ key: "wellnessai_scans_today", value: "0" });
        await Preferences.set({ key: "wellnessai_scans_today_date", value: currentDate });
        if (false) ;
      }
    } catch (e) {
      console.warn("Could not read from Preferences, using localStorage:", e);
      savedDate = localStorage.getItem("scans_today_date");
      today = parseInt(localStorage.getItem("scans_today") || "0");
      total = parseInt(localStorage.getItem("total_scans") || "0");
      calories = parseInt(localStorage.getItem("calories_tracked") || "0");
      if (savedDate !== currentDate) {
        today = 0;
        localStorage.setItem("scans_today", "0");
        localStorage.setItem("scans_today_date", currentDate);
      }
    }
    setStats({ scannedToday: today, totalScans: total, caloriesTracked: calories });
  };
  const loadRecentScans = async () => {
    try {
      const { Preferences } = await __vitePreload(async () => {
        const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
        return { Preferences: Preferences2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const { value: prefsScans } = await Preferences.get({ key: "wellnessai_recent_scans" });
      const saved = prefsScans || localStorage.getItem("recent_scans");
      if (saved) {
        const scans = JSON.parse(saved).slice(0, 5);
        setRecentScans(scans);
        localStorage.setItem("recent_scans", JSON.stringify(scans));
      }
    } catch (e) {
      console.warn("Preferences read failed, using localStorage:", e);
      const saved = localStorage.getItem("recent_scans");
      if (saved) {
        setRecentScans(JSON.parse(saved).slice(0, 5));
      }
    }
  };
  const handleScanOption = (option) => {
    switch (option.id) {
      case "food":
        if (onOpenFoodScanner) onOpenFoodScanner();
        break;
      case "barcode":
        if (onOpenBarcodeScanner) onOpenBarcodeScanner();
        break;
      default:
        alert(`${option.label} coming soon!`);
    }
  };
  const scanOptions = [
    { id: "food", icon: "🍽️", label: "Food Scanner", description: "Identify meals", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { id: "barcode", icon: "📊", label: "Barcode", description: "Scan labels", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { id: "ar_body", icon: "📸", label: "Body Scanner", description: "Track progress", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { id: "posture", icon: "🧍", label: "Posture Check", description: "AI analysis", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-tab-redesign", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopupsRenderer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-stats-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "📸 Scan Stats" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-stats-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-stat-value", children: stats.scannedToday }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-stat-label", children: "Scanned Today" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-stat-value", children: stats.totalScans }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-stat-label", children: "Total Scans" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-stat-value", children: stats.caloriesTracked }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-stat-label", children: "Calories Tracked" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "Scan Options" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scan-options-grid", children: scanOptions.map((option, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "scan-option-button",
          style: { background: option.gradient },
          onClick: () => handleScanOption(option),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-option-icon", children: option.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "scan-option-label", children: option.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "scan-option-description", children: option.description })
          ]
        },
        idx
      )) })
    ] }),
    recentScans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recent-scans-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "Recent Scans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recent-scans-list", children: recentScans.map((scan, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scan-item-icon", children: scan.icon || "📷" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-item-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-item-name", children: scan.name || "Unknown Item" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "scan-item-time", children: scan.time || "Just now" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "scan-item-calories", children: [
          scan.calories || "0",
          " cal"
        ] })
      ] }, idx)) })
    ] })
  ] });
}
export {
  ScanTabRedesign as default
};
