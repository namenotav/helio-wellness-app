import { r as reactExports, x as syncService, j as jsxRuntimeExports, h as brainLearningService } from "./entry-1767948920134-index.js";
import { u as usePointsPopup } from "./chunk-1767948920275-PointsPopup.js";
function ZenTabRedesign({ onOpenBreathing, onOpenMeditation }) {
  const { addPoints, PopupsRenderer } = usePointsPopup();
  const [stats, setStats] = reactExports.useState({ minutesToday: 0, totalSessions: 0, streak: 0 });
  reactExports.useEffect(() => {
    loadStats();
  }, []);
  const loadStats = async () => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const meditationData = await syncService.getData("meditation_stats") || {};
    const lastDate = meditationData.lastDate || localStorage.getItem("meditation_last_date") || "";
    let minutes = 0;
    if (lastDate === today) {
      minutes = meditationData.minutesToday || parseInt(localStorage.getItem("meditation_minutes_today") || "0");
    } else {
      minutes = 0;
    }
    const now = /* @__PURE__ */ new Date();
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    let streak = meditationData.streak || parseInt(localStorage.getItem("meditation_streak") || "0");
    if (lastDate === today) ;
    else if (lastDate === yesterdayStr) ;
    else if (lastDate && lastDate < yesterdayStr) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (currentHour === 23 && currentMinute >= 59) {
        streak = 0;
      }
    }
    const sessions = meditationData.totalSessions || parseInt(localStorage.getItem("meditation_sessions") || "0");
    setStats({ minutesToday: minutes, totalSessions: sessions, streak });
  };
  const startBreathingExercise = async (exercise) => {
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge("meditate", exercise.duration);
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const meditationData = await syncService.getData("meditation_stats") || {};
    const lastDate = meditationData.lastDate || "";
    const minutes = (lastDate === today ? meditationData.minutesToday : 0) || 0;
    const newMinutes = minutes + exercise.duration;
    const sessions = meditationData.totalSessions || 0;
    const newSessions = sessions + 1;
    let streak = meditationData.streak || 0;
    if (lastDate !== today) {
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      if (lastDate === yesterdayStr) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
    await syncService.saveData("meditation_stats", {
      minutesToday: newMinutes,
      totalSessions: newSessions,
      streak,
      lastDate: today
    });
    localStorage.setItem("meditation_minutes_today", newMinutes.toString());
    localStorage.setItem("meditation_sessions", newSessions.toString());
    localStorage.setItem("meditation_streak", streak.toString());
    localStorage.setItem("meditation_last_date", today);
    try {
      await brainLearningService.trackStress({
        stressLevel: Math.max(1, 5 - exercise.duration / 2),
        // Lower stress after breathing
        trigger: "breathing_exercise",
        copingMethod: exercise.type,
        effectiveness: 8,
        // Breathing exercises are effective
        duration: exercise.duration,
        timestamp: Date.now()
      });
      if (false) ;
    } catch (err) {
      console.warn("Brain.js stress tracking failed:", err);
    }
    if (onOpenBreathing) {
      onOpenBreathing(exercise.type);
    }
  };
  const startMeditation = async (duration) => {
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge("meditate", duration);
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const meditationData = await syncService.getData("meditation_stats") || {};
    const lastDate = meditationData.lastDate || "";
    const minutes = (lastDate === today ? meditationData.minutesToday : 0) || 0;
    const newMinutes = minutes + duration;
    const sessions = meditationData.totalSessions || 0;
    const newSessions = sessions + 1;
    let streak = meditationData.streak || 0;
    if (lastDate !== today) {
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      if (lastDate === yesterdayStr) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
    await syncService.saveData("meditation_stats", {
      minutesToday: newMinutes,
      totalSessions: newSessions,
      streak,
      lastDate: today
    });
    localStorage.setItem("meditation_minutes_today", newMinutes.toString());
    localStorage.setItem("meditation_sessions", newSessions.toString());
    localStorage.setItem("meditation_streak", streak.toString());
    localStorage.setItem("meditation_last_date", today);
    try {
      await brainLearningService.trackMood({
        mood: Math.min(10, 6 + duration / 5),
        // Longer meditation = better mood
        context: "post_meditation",
        afterActivity: "guided_meditation",
        duration,
        timestamp: Date.now()
      });
      await brainLearningService.trackStress({
        stressLevel: Math.max(1, 4 - duration / 5),
        // Longer meditation = lower stress
        trigger: "meditation_practice",
        copingMethod: "guided_meditation",
        effectiveness: Math.min(10, 7 + duration / 10),
        duration,
        timestamp: Date.now()
      });
      if (false) ;
    } catch (err) {
      console.warn("Brain.js meditation tracking failed:", err);
    }
    if (onOpenMeditation) {
      onOpenMeditation(duration);
    }
  };
  const breathingExercises = [
    { icon: "🫁", name: "Box Breathing", description: "4-4-4-4 pattern", duration: 5, type: "box", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { icon: "😌", name: "4-7-8 Technique", description: "Deep relaxation", duration: 5, type: "478", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { icon: "🧘", name: "Calm Breathing", description: "Gentle & peaceful", duration: 10, type: "calm", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
    { icon: "⚡", name: "Energy Boost", description: "Quick refresh", duration: 3, type: "energy", gradient: "linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)" }
  ];
  const meditationSessions = [
    { duration: 5, label: "5 Min Quick Calm" },
    { duration: 10, label: "10 Min Deep Focus" },
    { duration: 20, label: "20 Min Full Session" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-tab-redesign", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopupsRenderer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-stats-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "🧘 Zen Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-stats-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "zen-stat-value", children: stats.minutesToday }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "zen-stat-label", children: "Minutes Today" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "zen-stat-value", children: stats.totalSessions }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "zen-stat-label", children: "Total Sessions" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "zen-stat-value", children: [
            stats.streak,
            " 🔥"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "zen-stat-label", children: "Day Streak" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "Breathing Exercises" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "breathing-grid", children: breathingExercises.map((exercise, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "breathing-card",
          style: { background: exercise.gradient },
          onClick: () => startBreathingExercise(exercise),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "breathing-icon", children: exercise.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "breathing-name", children: exercise.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "breathing-description", children: exercise.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "breathing-duration", children: [
              exercise.duration,
              " min"
            ] })
          ]
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "zen-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "Guided Meditation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "meditation-buttons", children: meditationSessions.map((session, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "meditation-button",
          onClick: () => startMeditation(session.duration),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "meditation-icon", children: "🎧" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "meditation-label", children: session.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "meditation-arrow", children: "→" })
          ]
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mood-tracker-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "How are you feeling?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mood-options", children: ["😊", "😌", "😐", "😔", "😤"].map((mood, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "mood-button",
          onClick: async () => {
            const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            await syncService.saveData("mood_data", { mood, date: today });
            localStorage.setItem("mood_today", mood);
            localStorage.setItem("mood_last_date", today);
            addPoints(5, { x: 50, y: 60 });
            const moodValues = { "😊": 9, "😌": 7, "😐": 5, "😔": 3, "😤": 2 };
            const moodValue = moodValues[mood] || 5;
            try {
              await brainLearningService.trackMood({
                mood: moodValue,
                context: "zen_tab_check_in",
                afterActivity: "mood_check_in",
                timestamp: Date.now()
              });
              if (false) ;
            } catch (err) {
              console.warn("Brain.js mood tracking failed:", err);
            }
          },
          children: mood
        },
        idx
      )) })
    ] })
  ] });
}
export {
  ZenTabRedesign as default
};
