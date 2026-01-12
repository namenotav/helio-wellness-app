import { r as reactExports, g as gamificationService, P as Preferences, a as authService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function TodayOverview({ todaySteps = 0 }) {
  console.log("🎨 [TodayOverview] Component mounted/updated - todaySteps prop:", todaySteps);
  const [stats, setStats] = reactExports.useState({
    streak: 0,
    level: 1,
    xp: 0,
    xpToNext: 1e3,
    steps: 0,
    stepsGoal: 1e4,
    calories: 0,
    caloriesGoal: 2e3,
    activeMinutes: 0,
    activeMinutesGoal: 60,
    waterCups: 0,
    waterGoal: 8,
    sleepHours: 0,
    sleepGoal: 8,
    workoutMinutes: 0,
    workoutGoal: 30
  });
  reactExports.useEffect(() => {
    console.log("🔄 [TodayOverview] useEffect triggered - todaySteps changed to:", todaySteps);
    loadStats();
    const interval = setInterval(loadStats, 1e4);
    return () => clearInterval(interval);
  }, [todaySteps]);
  const loadStats = async () => {
    console.log("🚀 [TodayOverview] loadStats() EXECUTING - todaySteps:", todaySteps);
    try {
      console.log("📊 [TodayOverview] Getting gamification data...");
      const levelInfo = gamificationService.getLevelInfo();
      const streakInfo = gamificationService.getStreakInfo();
      console.log("📊 [TodayOverview] Level info:", levelInfo);
      console.log("📊 [TodayOverview] Streak info:", streakInfo);
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      let liveSteps = todaySteps;
      console.log("👟 [TodayOverview] Received todaySteps prop:", todaySteps, "→ Setting steps to:", liveSteps);
      let waterLog = [];
      try {
        const { value: prefsWater } = await Preferences.get({ key: "wellnessai_waterLog" });
        waterLog = JSON.parse(prefsWater || localStorage.getItem("waterLog") || "[]");
      } catch (e) {
        waterLog = JSON.parse(localStorage.getItem("waterLog") || "[]");
      }
      const waterToday = waterLog.filter((w) => w.date === today);
      const waterCups = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0);
      console.log("💧 [TodayOverview] Water today:", waterCups, "cups");
      let sleepLog = [];
      try {
        const { value: prefsSleep } = await Preferences.get({ key: "wellnessai_sleepLog" });
        sleepLog = JSON.parse(prefsSleep || localStorage.getItem("sleepLog") || "[]");
      } catch (e) {
        sleepLog = JSON.parse(localStorage.getItem("sleepLog") || "[]");
      }
      const sleepToday = sleepLog.find((s) => s.date === today);
      const sleepHours = sleepToday ? sleepToday.duration || sleepToday.hours || 0 : 0;
      console.log("😴 [TodayOverview] Sleep today:", sleepHours, "hours");
      let workoutHistory = [];
      try {
        const { value: prefsWorkouts } = await Preferences.get({ key: "wellnessai_workoutHistory" });
        workoutHistory = JSON.parse(prefsWorkouts || localStorage.getItem("workoutHistory") || "[]");
      } catch (e) {
        workoutHistory = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
      }
      const workoutsToday = workoutHistory.filter((w) => w.date === today);
      const workoutMinutes = workoutsToday.reduce((sum, w) => sum + (w.duration || 0), 0);
      console.log("💪 [TodayOverview] Workouts today:", workoutMinutes, "minutes");
      const stepCalories = Math.round(liveSteps * 0.04);
      const userProfile = authService.getCurrentUser()?.profile || {};
      const userWeight = userProfile.weight || 150;
      const weightFactor = userWeight / 150;
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
      let workoutCalories = 0;
      workoutsToday.forEach((workout) => {
        const type = workout.type || workout.activity || "Other";
        const rate = calorieRateMap[type] || 7;
        workoutCalories += Math.round((workout.duration || 0) * rate * weightFactor);
      });
      console.log("⚖️ [TodayOverview] User weight:", userWeight, "lbs, Weight factor:", weightFactor.toFixed(2));
      const totalCaloriesBurned = stepCalories + workoutCalories;
      console.log("🔥 [TodayOverview] Calories - Steps:", stepCalories, "Workouts:", workoutCalories, "Total Burned:", totalCaloriesBurned);
      const foodLog = authService.getCurrentUser()?.profile?.foodLog || [];
      const foodToday = foodLog.filter((f) => {
        const foodDate = new Date(f.timestamp);
        return foodDate.toISOString().split("T")[0] === today;
      });
      const caloriesConsumed = foodToday.reduce((sum, f) => sum + (f.calories || 0), 0);
      const netCalories = caloriesConsumed - totalCaloriesBurned;
      console.log("🍽️ [TodayOverview] Net Calories: Consumed", caloriesConsumed, "- Burned", totalCaloriesBurned, "= Net", netCalories);
      setStats({
        streak: streakInfo.streak || 0,
        level: levelInfo.level || 1,
        xp: levelInfo.xp || 0,
        xpToNext: levelInfo.xpToNext || 1e3,
        steps: liveSteps,
        stepsGoal: 1e4,
        calories: totalCaloriesBurned,
        caloriesGoal: 2e3,
        caloriesConsumed,
        netCalories,
        activeMinutes: workoutMinutes,
        activeMinutesGoal: 60,
        waterCups,
        waterGoal: 8,
        sleepHours,
        sleepGoal: 8,
        workoutMinutes,
        workoutGoal: 30
      });
      console.log("✅ [TodayOverview] Stats updated - steps:", liveSteps, "water:", waterCups, "sleep:", sleepHours, "workout:", workoutMinutes);
    } catch (error) {
      console.error("❌ [TodayOverview] loadStats() FAILED:", error);
      console.error("❌ [TodayOverview] Error stack:", error.stack);
    }
  };
  const getPercentage = (current, goal) => {
    return Math.min(Math.round(current / goal * 100), 100);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "today-overview", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overview-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "streak-badge", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "streak-icon", children: "🔥" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "streak-text", children: [
          stats.streak,
          " DAY STREAK"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "level-badge", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "level-text", children: [
          "Level ",
          stats.level
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "level-icon", children: "⭐" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "xp-progress", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "xp-text", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          stats.xp.toLocaleString(),
          " XP"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "xp-goal", children: [
          "/ ",
          stats.xpToNext.toLocaleString(),
          " to Level ",
          stats.level + 1
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "xp-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "xp-fill",
          style: { width: `${getPercentage(stats.xp, stats.xpToNext)}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-rings", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 200 200", className: "rings-svg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "100",
            cy: "100",
            r: "80",
            fill: "none",
            stroke: "#333",
            strokeWidth: "12",
            opacity: "0.2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "100",
            cy: "100",
            r: "80",
            fill: "none",
            stroke: "url(#moveGradient)",
            strokeWidth: "12",
            strokeLinecap: "round",
            strokeDasharray: `${2 * Math.PI * 80 * (getPercentage(stats.steps, stats.stepsGoal) / 100)} ${2 * Math.PI * 80}`,
            transform: "rotate(-90 100 100)",
            className: "ring-animated"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "100",
            cy: "100",
            r: "60",
            fill: "none",
            stroke: "#333",
            strokeWidth: "12",
            opacity: "0.2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "100",
            cy: "100",
            r: "60",
            fill: "none",
            stroke: "url(#exerciseGradient)",
            strokeWidth: "12",
            strokeLinecap: "round",
            strokeDasharray: `${2 * Math.PI * 60 * (getPercentage(stats.activeMinutes, stats.activeMinutesGoal) / 100)} ${2 * Math.PI * 60}`,
            transform: "rotate(-90 100 100)",
            className: "ring-animated"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "100",
            cy: "100",
            r: "40",
            fill: "none",
            stroke: "#333",
            strokeWidth: "12",
            opacity: "0.2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "100",
            cy: "100",
            r: "40",
            fill: "none",
            stroke: "url(#caloriesGradient)",
            strokeWidth: "12",
            strokeLinecap: "round",
            strokeDasharray: `${2 * Math.PI * 40 * (getPercentage(stats.calories, stats.caloriesGoal) / 100)} ${2 * Math.PI * 40}`,
            transform: "rotate(-90 100 100)",
            className: "ring-animated"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "moveGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#ff006e" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#ff4d94" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "exerciseGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#00f5a0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#00d9f5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "caloriesGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#4cc9f0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#4361ee" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ring-labels", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ring-label move", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "label-icon", children: "👟" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "label-text", children: [
            stats.steps.toLocaleString(),
            "/",
            (stats.stepsGoal / 1e3).toFixed(0),
            "K"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ring-label exercise", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "label-icon", children: "💪" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "label-text", children: [
            stats.activeMinutes,
            "/",
            stats.activeMinutesGoal,
            "min"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ring-label calories", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "label-icon", children: "🔥" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "label-text", children: [
            stats.calories,
            "/",
            stats.caloriesGoal,
            "cal"
          ] })
        ] })
      ] })
    ] }),
    stats.netCalories !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      margin: "16px 4px 8px 4px",
      background: stats.netCalories < 0 ? "linear-gradient(135deg, #4CAF50 0%, #45B049 100%)" : "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
      borderRadius: "15px",
      padding: "16px",
      textAlign: "center",
      boxShadow: stats.netCalories < 0 ? "0 4px 15px rgba(76, 175, 80, 0.4)" : "0 4px 15px rgba(255, 152, 0, 0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "14px", color: "rgba(255,255,255,0.9)", marginBottom: "8px" }, children: stats.netCalories < 0 ? "📉 Calorie Deficit" : "📈 Calorie Surplus" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "32px", fontWeight: "700", color: "white", marginBottom: "4px" }, children: [
        stats.netCalories > 0 ? "+" : "",
        stats.netCalories.toLocaleString(),
        " cal"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "12px", color: "rgba(255,255,255,0.8)" }, children: [
        "Consumed: ",
        stats.caloriesConsumed,
        " | Burned: ",
        stats.calories
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "6px", fontStyle: "italic" }, children: stats.netCalories < 0 ? "✅ Great for weight loss!" : "⚠️ Eating more than burning" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-log-stats", style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      marginTop: "16px",
      padding: "0 4px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        borderRadius: "12px",
        padding: "12px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(79, 172, 254, 0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "24px", marginBottom: "4px" }, children: "💧" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "white", fontSize: "18px", fontWeight: "bold" }, children: stats.waterCups }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "rgba(255,255,255,0.8)", fontSize: "11px", marginTop: "2px" }, children: [
          "/",
          stats.waterGoal,
          " cups"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "12px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "24px", marginBottom: "4px" }, children: "😴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "white", fontSize: "18px", fontWeight: "bold" }, children: stats.sleepHours.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "rgba(255,255,255,0.8)", fontSize: "11px", marginTop: "2px" }, children: [
          "/",
          stats.sleepGoal,
          "h"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        borderRadius: "12px",
        padding: "12px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(250, 112, 154, 0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "24px", marginBottom: "4px" }, children: "🏋️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "white", fontSize: "18px", fontWeight: "bold" }, children: stats.workoutMinutes }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "rgba(255,255,255,0.8)", fontSize: "11px", marginTop: "2px" }, children: [
          "/",
          stats.workoutGoal,
          "min"
        ] })
      ] })
    ] })
  ] });
}
export {
  TodayOverview as default
};
