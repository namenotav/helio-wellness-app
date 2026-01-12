const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css","assets/chunk-1767948920212-sleepService.js","assets/chunk-1767948920211-workoutService.js"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, _ as __vitePreload } from "./entry-1767948920134-index.js";
function QuickLogModal({ isOpen, onClose }) {
  const [activeLog, setActiveLog] = reactExports.useState(null);
  const [waterAmount, setWaterAmount] = reactExports.useState(0);
  const [sleepHours, setSleepHours] = reactExports.useState("");
  const [sleepQuality, setSleepQuality] = reactExports.useState(3);
  const [workoutType, setWorkoutType] = reactExports.useState("");
  const [workoutDuration, setWorkoutDuration] = reactExports.useState("");
  const [workoutCalories, setWorkoutCalories] = reactExports.useState("");
  const calculateWorkoutCalories = async (type, duration) => {
    if (!type || !duration) return 0;
    const { default: authService } = await __vitePreload(async () => {
      const { default: authService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a7);
      return { default: authService2 };
    }, true ? __vite__mapDeps([0,1]) : void 0);
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
    const rate = calorieRateMap[type] || 7;
    return Math.round(duration * rate * weightFactor);
  };
  if (!isOpen) return null;
  const handleLogWater = async (amount) => {
    console.log("💧 [QuickLog] Logging water:", amount, "ml");
    const { default: waterIntakeService } = await __vitePreload(async () => {
      const { default: waterIntakeService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a9);
      return { default: waterIntakeService2 };
    }, true ? __vite__mapDeps([0,1]) : void 0);
    const result = await waterIntakeService.addIntake(amount);
    console.log("✅ [QuickLog] Water logged successfully:", result);
    setWaterAmount((prev) => prev + amount);
    try {
      const { default: gamificationService } = await __vitePreload(async () => {
        const { default: gamificationService2 } = await import("./entry-1767948920134-index.js").then((n) => n.ab);
        return { default: gamificationService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
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
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const waterToday = waterLog.filter((w) => w.date === today);
      const dailyTotal = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0);
      await gamificationService.logActivity("water", { cups: 1, dailyTotal });
      if (false) ;
    } catch (error) {
      console.error("❌ [GAMIFICATION] Failed to log water activity:", error);
    }
    try {
      const brainLearningService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a6);
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([0,1]) : void 0)).default;
      await brainLearningService.trackEnergy(6, {
        recentWorkout: false,
        recentMeal: false,
        stressLevel: 4,
        caffeineConsumed: false,
        hydrationLevel: amount >= 500 ? "high" : "medium"
      });
      if (false) ;
    } catch (error) {
      console.error("❌ [BRAIN.JS] Failed to track water intake:", error);
    }
    window.dispatchEvent(new Event("quickLogUpdated"));
    setTimeout(() => {
      setActiveLog(null);
      onClose();
    }, 500);
  };
  const handleLogSleep = async () => {
    if (!sleepHours) return;
    console.log("😴 [QuickLog] Logging sleep:", sleepHours, "hours, quality:", sleepQuality);
    const { default: sleepService } = await __vitePreload(async () => {
      const { default: sleepService2 } = await import("./chunk-1767948920212-sleepService.js");
      return { default: sleepService2 };
    }, true ? __vite__mapDeps([2,0,1]) : void 0);
    const result = await sleepService.logSleep({
      hours: parseFloat(sleepHours),
      duration: parseFloat(sleepHours),
      quality: sleepQuality,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    console.log("✅ [QuickLog] Sleep logged successfully:", result);
    window.dispatchEvent(new Event("quickLogUpdated"));
    setSleepHours("");
    setSleepQuality(3);
    setActiveLog(null);
    onClose();
  };
  const handleLogWorkout = async () => {
    if (!workoutType || !workoutDuration) return;
    const autoCalories = calculateWorkoutCalories(workoutType, parseInt(workoutDuration));
    console.log("💪 [QuickLog] Logging workout:", workoutType, workoutDuration, "min", autoCalories, "cal");
    const { default: workoutService } = await __vitePreload(async () => {
      const { default: workoutService2 } = await import("./chunk-1767948920211-workoutService.js");
      return { default: workoutService2 };
    }, true ? __vite__mapDeps([3,0,1]) : void 0);
    const result = await workoutService.logWorkout({
      type: workoutType,
      activity: workoutType,
      duration: parseInt(workoutDuration),
      calories: autoCalories,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    console.log("✅ [QuickLog] Workout logged successfully:", result);
    try {
      const { default: gamificationService } = await __vitePreload(async () => {
        const { default: gamificationService2 } = await import("./entry-1767948920134-index.js").then((n) => n.ab);
        return { default: gamificationService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      await gamificationService.logActivity("workout");
      if (false) ;
    } catch (error) {
      console.error("❌ [GAMIFICATION] Failed to log workout activity:", error);
    }
    try {
      const brainLearningService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a6);
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([0,1]) : void 0)).default;
      const duration = parseInt(workoutDuration);
      const energyBoost = duration >= 30 ? 8 : 7;
      await brainLearningService.trackEnergy(energyBoost, {
        recentWorkout: true,
        recentMeal: false,
        stressLevel: 3,
        caffeineConsumed: false,
        workoutType,
        workoutDuration: duration
      });
      await brainLearningService.trackMood(7, {
        triggers: ["workout", workoutType],
        activities: ["exercise", workoutType],
        socialInteraction: false,
        sleepQuality: 7,
        exerciseToday: true,
        weather: "indoor"
      });
      if (false) ;
    } catch (error) {
      console.error("❌ [BRAIN.JS] Failed to track workout:", error);
    }
    window.dispatchEvent(new Event("quickLogUpdated"));
    setWorkoutType("");
    setWorkoutDuration("");
    setWorkoutCalories("");
    setActiveLog(null);
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "quick-log-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-log-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-log-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "⚡ Quick Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "×" })
    ] }),
    !activeLog ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-log-options", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "log-option water", onClick: () => setActiveLog("water"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "log-icon", children: "💧" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "log-label", children: "Log Water" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "log-option sleep", onClick: () => setActiveLog("sleep"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "log-icon", children: "😴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "log-label", children: "Log Sleep" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "log-option workout", onClick: () => setActiveLog("workout"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "log-icon", children: "💪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "log-label", children: "Log Workout" })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      activeLog === "water" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "log-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "💧 Log Water Intake" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "log-description", children: "How much water did you drink?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "water-buttons", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "water-btn", onClick: () => handleLogWater(200), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-amount", children: "200ml" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-label", children: "Cup" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "water-btn", onClick: () => handleLogWater(250), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-amount", children: "250ml" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-label", children: "Glass" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "water-btn", onClick: () => handleLogWater(500), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-amount", children: "500ml" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-label", children: "Bottle" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "water-btn", onClick: () => handleLogWater(1e3), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-amount", children: "1L" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "water-label", children: "Large" })
          ] })
        ] }),
        waterAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "success-message", children: [
          "✅ Logged ",
          waterAmount,
          "ml today!"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setActiveLog(null), children: "← Back" })
      ] }),
      activeLog === "sleep" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "log-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "😴 Log Sleep" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "log-description", children: "How was your sleep last night?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Hours Slept" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              step: "0.5",
              min: "0",
              max: "24",
              value: sleepHours,
              onChange: (e) => setSleepHours(e.target.value),
              placeholder: "e.g. 7.5",
              className: "sleep-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Sleep Quality" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "quality-stars", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `star-btn ${sleepQuality >= star ? "active" : ""}`,
              onClick: () => setSleepQuality(star),
              children: "⭐"
            },
            star
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setActiveLog(null), children: "← Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "submit-btn",
              onClick: handleLogSleep,
              disabled: !sleepHours,
              children: "Save Sleep"
            }
          )
        ] })
      ] }),
      activeLog === "workout" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "log-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "💪 Log Workout" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "log-description", children: "What did you do today?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Workout Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: workoutType,
              onChange: (e) => setWorkoutType(e.target.value),
              className: "workout-select",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select type..." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Running", children: "🏃 Running" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Cycling", children: "🚴 Cycling" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Swimming", children: "🏊 Swimming" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Weights", children: "🏋️ Weights" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Yoga", children: "🧘 Yoga" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HIIT", children: "🥊 HIIT" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Walking", children: "🚶 Walking" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Sports", children: "⚽ Sports" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "💪 Other" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Duration (minutes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              min: "1",
              value: workoutDuration,
              onChange: (e) => setWorkoutDuration(e.target.value),
              placeholder: "e.g. 30",
              className: "workout-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Calories (auto-calculated)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              min: "0",
              value: calculateWorkoutCalories(workoutType, parseInt(workoutDuration) || 0),
              readOnly: true,
              placeholder: "Select type and duration",
              className: "workout-input",
              style: { background: "rgba(255, 255, 255, 0.05)", cursor: "not-allowed" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setActiveLog(null), children: "← Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "submit-btn",
              onClick: handleLogWorkout,
              disabled: !workoutType || !workoutDuration,
              children: "Save Workout"
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
export {
  QuickLogModal as default
};
