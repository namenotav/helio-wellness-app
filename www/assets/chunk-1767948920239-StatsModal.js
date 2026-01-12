const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, _ as __vitePreload, a as authService, g as gamificationService, P as Preferences, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function StatsModal({ isOpen, onClose, todaySteps = 0 }) {
  const [stats, setStats] = reactExports.useState({
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    totalSteps: 0,
    todaySteps: 0,
    avgSleepHours: 0,
    mealsLogged: 0,
    currentWeight: 0,
    totalXP: 0
  });
  reactExports.useEffect(() => {
    if (isOpen) {
      loadStats();
      const interval = setInterval(loadStats, 5e3);
      return () => clearInterval(interval);
    }
  }, [isOpen]);
  const loadStats = async () => {
    try {
      const { default: firestoreService } = await __vitePreload(async () => {
        const { default: firestoreService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a5);
        return { default: firestoreService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const userId = authService.getCurrentUser()?.uid;
      const levelInfo = gamificationService.getLevelInfo();
      const streakInfo = gamificationService.getStreakInfo();
      let liveSteps = 0;
      try {
        const storedSteps = await Preferences.get({ key: "wellnessai_todaySteps" });
        const rawValue = storedSteps.value || "0";
        try {
          liveSteps = parseInt(JSON.parse(rawValue));
        } catch {
          liveSteps = parseInt(rawValue);
        }
      } catch (err) {
        liveSteps = todaySteps;
      }
      const workoutLog = await firestoreService.get("workoutHistory", userId) || [];
      const currentUser = authService.getCurrentUser();
      const mealLog = currentUser?.profile?.foodLog || [];
      const stepHistory = await firestoreService.get("stepHistory", userId) || [];
      const totalSteps = Array.isArray(stepHistory) ? stepHistory.reduce((sum, day) => sum + (Number(day?.steps) || 0), 0) : 0;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const workoutHistory = workoutLog;
      const allTimeStepCalories = Math.round(totalSteps * 0.04);
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
      let allTimeWorkoutCalories = 0;
      workoutHistory.forEach((workout) => {
        const type = workout.type || workout.activity || "Other";
        const rate = calorieRateMap[type] || 7;
        allTimeWorkoutCalories += (workout.duration || 0) * rate;
      });
      const totalCalories = allTimeStepCalories + allTimeWorkoutCalories;
      const sleepLog = await firestoreService.get("sleepLog", userId) || [];
      const totalSleep = Array.isArray(sleepLog) ? sleepLog.reduce((sum, night) => sum + (Number(night?.hours) || Number(night?.duration) || 0), 0) : 0;
      const avgSleep = sleepLog.length > 0 ? totalSleep / sleepLog.length : 0;
      setStats({
        totalWorkouts: workoutLog.length,
        totalCaloriesBurned: totalCalories,
        totalSteps,
        todaySteps: liveSteps,
        avgSleepHours: avgSleep,
        mealsLogged: mealLog.length,
        currentWeight: authService.getCurrentUser()?.profile?.weight || 0,
        totalXP: levelInfo.totalXP || 0
      });
    } catch (error) {
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "📊 Quick Stats" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "💪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.totalWorkouts }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Workouts" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "🔥" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.totalCaloriesBurned.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Total Calories" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "👟" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.todaySteps.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Steps Today" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "📊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
            (stats.totalSteps / 1e3).toFixed(1),
            "K"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Total Steps" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "😴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
            stats.avgSleepHours.toFixed(1),
            "h"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Avg Sleep" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "🍽️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.mealsLogged }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Meals Logged" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "⚖️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.currentWeight ? `${stats.currentWeight}kg` : "Not set" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Current Weight" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item highlight", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "⭐" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.totalXP.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Total XP Earned" })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  StatsModal as default
};
