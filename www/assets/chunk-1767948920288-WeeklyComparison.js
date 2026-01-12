import { r as reactExports, a as authService, f as firestoreService, P as Preferences, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function WeeklyComparison({ onClose }) {
  const [weeklyData, setWeeklyData] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    loadWeeklyData();
  }, []);
  const loadWeeklyData = async () => {
    try {
      const userId = authService.getCurrentUser()?.uid;
      console.log("📊 [WEEKLY] Loading data for user:", userId);
      const firestoreSteps = await firestoreService.get("stepHistory", userId) || [];
      let todaySteps = 0;
      try {
        const { value } = await Preferences.get({ key: "wellnessai_todaySteps" });
        todaySteps = value ? parseInt(JSON.parse(value)) : 0;
      } catch (e) {
        console.warn("Could not read today steps:", e);
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const hasTodayEntry = firestoreSteps.some((s) => s.date === today);
      if (!hasTodayEntry && todaySteps > 0) {
        firestoreSteps.push({ date: today, steps: todaySteps, timestamp: Date.now() });
      } else if (hasTodayEntry) {
        const todayIndex = firestoreSteps.findIndex((s) => s.date === today);
        if (todayIndex >= 0 && todaySteps > firestoreSteps[todayIndex].steps) {
          firestoreSteps[todayIndex].steps = todaySteps;
        }
      }
      console.log("📊 [WEEKLY] Total step entries:", firestoreSteps.length);
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const monthSteps = firestoreSteps.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      });
      console.log("📊 [WEEKLY] Month steps:", monthSteps.length, "entries");
      const weeks = [[], [], [], []];
      monthSteps.forEach((entry) => {
        const entryDate = new Date(entry.date);
        const dayOfMonth = entryDate.getDate();
        const weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex < 4) {
          weeks[weekIndex].push(entry);
        }
      });
      const firestoreWorkouts = await firestoreService.get("workoutHistory", userId) || [];
      console.log("📊 [WEEKLY] Total workouts:", firestoreWorkouts.length);
      const monthWorkouts = firestoreWorkouts.filter((w) => {
        const workoutDate = new Date(w.date || w.timestamp);
        return workoutDate.getFullYear() === year && workoutDate.getMonth() === month;
      });
      const weekData = weeks.map((weekSteps, weekIndex) => {
        const weekStart = weekIndex * 7 + 1;
        const weekEnd = Math.min(weekStart + 6, new Date(year, month + 1, 0).getDate());
        const weekWorkouts = monthWorkouts.filter((w) => {
          const workoutDate = new Date(w.date);
          const day = workoutDate.getDate();
          return day >= weekStart && day <= weekEnd;
        });
        const totalSteps = weekSteps.reduce((sum, s) => sum + (s.steps || 0), 0);
        const avgSteps = weekSteps.length > 0 ? Math.round(totalSteps / weekSteps.length) : 0;
        const totalWorkouts = weekWorkouts.length;
        const totalWorkoutMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        return {
          weekNumber: weekIndex + 1,
          label: `Week ${weekIndex + 1} (${month + 1}/${weekStart}-${month + 1}/${weekEnd})`,
          totalSteps,
          avgSteps,
          totalWorkouts,
          totalWorkoutMinutes,
          activeDays: weekSteps.length
        };
      });
      setWeeklyData(weekData);
    } catch (error) {
      console.error("Failed to load weekly data:", error);
    } finally {
      setLoading(false);
    }
  };
  const getTrendIcon = (currentWeek, previousWeek, metric) => {
    if (!previousWeek || previousWeek[metric] === 0) return { icon: "➡️", text: "" };
    const current = currentWeek[metric];
    const previous = previousWeek[metric];
    const percentChange = ((current - previous) / previous * 100).toFixed(0);
    if (current > previous) return { icon: "📈", text: `+${percentChange}%` };
    if (current < previous) return { icon: "📉", text: `${percentChange}%` };
    return { icon: "➡️", text: "0%" };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "weekly-comparison-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "📊 Weekly Comparison" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Loading weekly data..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "weekly-comparison-grid", children: weeklyData.map((week, index) => {
      const previousWeek = index > 0 ? weeklyData[index - 1] : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "week-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "week-label", children: week.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "week-stat", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "👟" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: week.totalSteps.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Steps" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
              week.avgSteps.toLocaleString(),
              " avg/day"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trend-icon", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "20px" }, children: getTrendIcon(week, previousWeek, "totalSteps").icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "11px", color: "#8B5FE8", fontWeight: "bold", display: "block" }, children: getTrendIcon(week, previousWeek, "totalSteps").text })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "week-stat", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "💪" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: week.totalWorkouts }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Workouts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
              week.totalWorkoutMinutes,
              " minutes"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trend-icon", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "20px" }, children: getTrendIcon(week, previousWeek, "totalWorkouts").icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "11px", color: "#8B5FE8", fontWeight: "bold", display: "block" }, children: getTrendIcon(week, previousWeek, "totalWorkouts").text })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "week-stat", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "📅" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              week.activeDays,
              "/7"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Active Days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
              Math.round(week.activeDays / 7 * 100),
              "% consistent"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trend-icon", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "20px" }, children: getTrendIcon(week, previousWeek, "activeDays").icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "11px", color: "#8B5FE8", fontWeight: "bold", display: "block" }, children: getTrendIcon(week, previousWeek, "activeDays").text })
          ] })
        ] })
      ] }, week.weekNumber);
    }) })
  ] }) });
}
export {
  WeeklyComparison as default
};
