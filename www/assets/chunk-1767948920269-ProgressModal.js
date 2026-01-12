const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, _ as __vitePreload, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function ProgressModal({ isOpen, onClose, todaySteps = 0 }) {
  const [progressData, setProgressData] = reactExports.useState({
    weeklySteps: [],
    weeklyWorkouts: 0,
    weeklyCalories: 0,
    totalActiveDays: 0
  });
  reactExports.useEffect(() => {
    if (isOpen) {
      loadProgressData();
      const interval = setInterval(loadProgressData, 5e3);
      return () => clearInterval(interval);
    }
  }, [isOpen]);
  const loadProgressData = async () => {
    try {
      const { default: firestoreService } = await __vitePreload(async () => {
        const { default: firestoreService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a5);
        return { default: firestoreService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const { default: authService } = await __vitePreload(async () => {
        const { default: authService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a7);
        return { default: authService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const userId = authService.getCurrentUser()?.uid;
      const workoutLog = await firestoreService.get("workoutHistory", userId) || [];
      const stepHistoryRaw = await firestoreService.get("stepHistory", userId) || [];
      console.log("📈 Progress Modal loaded from Firestore:", stepHistoryRaw?.length, "entries");
      const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : [];
      const today = /* @__PURE__ */ new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      monday.setDate(today.getDate() - daysToMonday);
      monday.setHours(0, 0, 0, 0);
      const currentWeek = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const dayData = stepHistory.find((entry) => entry.date === dateStr);
        currentWeek.push({
          date: dateStr,
          steps: dayData ? dayData.steps : 0
        });
      }
      console.log("📊 Progress Modal: Current week data (Sun-Sat):", currentWeek);
      const weekAgo = /* @__PURE__ */ new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentWorkouts = workoutLog.filter((w) => new Date(w.date) >= weekAgo).length;
      const calorieRateMap = {
        "Running": 11,
        "Cycling": 10,
        "Swimming": 12,
        "Weights": 7,
        "Yoga": 3,
        "HIIT": 13,
        "Walking": 5,
        "Sports": 9,
        "Other": 7
      };
      let weeklyStepCalories = 0;
      currentWeek.forEach((day) => {
        weeklyStepCalories += Math.round(day.steps * 0.04);
      });
      let weeklyWorkoutCalories = 0;
      workoutLog.filter((w) => new Date(w.date) >= weekAgo).forEach((workout) => {
        const type = workout.type || workout.activity || "Other";
        const rate = calorieRateMap[type] || 7;
        weeklyWorkoutCalories += (workout.duration || 0) * rate;
      });
      const recentCalories = weeklyStepCalories + weeklyWorkoutCalories;
      console.log("📊 [ProgressModal] Weekly Calories - Steps:", weeklyStepCalories, "Workouts:", weeklyWorkoutCalories, "Total:", recentCalories);
      const activeDays = stepHistory.filter((entry) => entry.steps > 1e3).length;
      setProgressData({
        weeklySteps: currentWeek,
        weeklyWorkouts: recentWorkouts,
        weeklyCalories: recentCalories,
        totalActiveDays: activeDays
      });
    } catch (error) {
    }
  };
  if (!isOpen) return null;
  const maxSteps = Math.max(...progressData.weeklySteps.map((d) => d.steps), 1e4);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "📈 Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-hero", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-icon", children: "📊" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Your Weekly Journey" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Track your improvements over time" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-summary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-icon", children: "👟" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "summary-value", children: [
            (progressData.weeklySteps.reduce((sum, d) => sum + d.steps, 0) / 1e3).toFixed(1),
            "K"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-label", children: "Steps This Week" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-icon", children: "💪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-value", children: progressData.weeklyWorkouts }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-label", children: "Weekly Workouts" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-icon", children: "🔥" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-value", children: progressData.weeklyCalories.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-label", children: "Weekly Calories" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-chart", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Steps This Week" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chart-bars", children: progressData.weeklySteps.map((day, index) => {
        const height = day.steps / maxSteps * 100;
        const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayName = dayLabels[index];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chart-bar-container", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chart-bar-wrapper", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "chart-bar",
              style: { height: `${height}%` },
              title: `${day.steps.toLocaleString()} steps`
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chart-label", children: dayName })
        ] }, index);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-badge", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-icon", children: "🏆" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "badge-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-number", children: progressData.totalActiveDays }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-text", children: "Total Active Days" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "💡 Keep your streak going to unlock achievements!" }) })
  ] }) });
}
export {
  ProgressModal as default
};
