const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, _ as __vitePreload, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function GoalsModal({ isOpen, onClose, todaySteps = 0 }) {
  const [goals, setGoals] = reactExports.useState({
    steps: { current: 0, target: 1e4, unit: "steps" },
    water: { current: 0, target: 8, unit: "cups" },
    meals: { current: 0, target: 3, unit: "meals" },
    sleep: { current: 0, target: 8, unit: "hours" },
    workouts: { current: 0, target: 1, unit: "workout" }
  });
  const [currentDate, setCurrentDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  reactExports.useEffect(() => {
    if (isOpen) {
      loadGoals();
      const pollInterval = setInterval(() => {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        if (today !== currentDate) {
          setCurrentDate(today);
        }
        loadGoals();
      }, 2e3);
      return () => clearInterval(pollInterval);
    }
  }, [isOpen, todaySteps, currentDate]);
  const loadGoals = async () => {
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      let stepCount = todaySteps;
      try {
        const { Preferences } = await __vitePreload(async () => {
          const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
          return { Preferences: Preferences2 };
        }, true ? __vite__mapDeps([0,1]) : void 0);
        const storedSteps = await Preferences.get({ key: "wellnessai_todaySteps" });
        const rawValue = storedSteps.value || "0";
        try {
          stepCount = parseInt(JSON.parse(rawValue));
        } catch {
          stepCount = parseInt(rawValue);
        }
        if (false) ;
      } catch (err) {
        if (false) ;
      }
      const { default: firestoreService } = await __vitePreload(async () => {
        const { default: firestoreService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a5);
        return { default: firestoreService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const { default: authService } = await __vitePreload(async () => {
        const { default: authService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a7);
        return { default: authService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const userId = authService.getCurrentUser()?.uid;
      const waterLog = await firestoreService.get("waterLog", userId) || [];
      const waterToday = waterLog.filter((w) => w.date === today);
      const waterCups = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0);
      const currentUser = authService.getCurrentUser();
      const foodLog = currentUser?.profile?.foodLog || [];
      const todayMeals = foodLog.filter(
        (f) => f.date === today || f.timestamp && new Date(f.timestamp).toISOString().split("T")[0] === today
      ).length;
      const workoutLog = await firestoreService.get("workoutHistory", userId) || [];
      const todayWorkouts = workoutLog.filter((w) => w.date === today).length;
      const sleepLog = await firestoreService.get("sleepLog", userId) || [];
      const sleepToday = sleepLog.find((s) => s.date === today);
      const sleepHours = sleepToday ? sleepToday.duration || sleepToday.hours || 0 : 0;
      if (false) ;
      setGoals({
        steps: { current: stepCount, target: 1e4, unit: "steps" },
        water: { current: waterCups, target: 8, unit: "cups" },
        meals: { current: todayMeals, target: 3, unit: "meals" },
        sleep: { current: sleepHours, target: 8, unit: "hours" },
        workouts: { current: todayWorkouts, target: 1, unit: "workout" }
      });
    } catch (error) {
    }
  };
  const getPercentage = (current, target) => Math.min(current / target * 100, 100);
  if (!isOpen) return null;
  const goalsList = [
    { key: "steps", icon: "👟", label: "Steps", color: "#4cc9f0" },
    { key: "water", icon: "💧", label: "Water", color: "#4361ee" },
    { key: "meals", icon: "🍽️", label: "Meals", color: "#43e97b" },
    { key: "sleep", icon: "😴", label: "Sleep", color: "#f093fb" },
    { key: "workouts", icon: "💪", label: "Workouts", color: "#ff6b6b" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "goals-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🎯 Goals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "goals-hero", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-icon", children: "🎯" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Today's Goals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Track your daily wellness targets" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "goals-list", children: goalsList.map((goal) => {
      const data = goals[goal.key];
      const percentage = getPercentage(data.current, data.target);
      const isComplete = percentage >= 100;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "goal-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "goal-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "goal-icon", children: goal.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "goal-label", children: goal.label }),
          isComplete && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "goal-check", children: "✅" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "goal-progress", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "goal-progress-fill",
            style: {
              width: `${percentage}%`,
              background: goal.color
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "goal-stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "goal-current", children: data.current.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "goal-separator", children: "/" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "goal-target", children: [
            data.target.toLocaleString(),
            " ",
            data.unit
          ] })
        ] })
      ] }, goal.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "goals-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "💡 Complete all goals to earn bonus XP!" }) })
  ] }) });
}
export {
  GoalsModal as default
};
