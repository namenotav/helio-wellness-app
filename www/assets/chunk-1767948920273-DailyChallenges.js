import { r as reactExports, a as authService, f as firestoreService, P as Preferences, g as gamificationService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function DailyChallenges({ onChallengeComplete, todaySteps = 0 }) {
  const [challenges, setChallenges] = reactExports.useState([]);
  reactExports.useEffect(() => {
    loadChallenges();
    const pollInterval = setInterval(() => {
      autoUpdateChallenges();
    }, 3e3);
    return () => clearInterval(pollInterval);
  }, []);
  const loadChallenges = async () => {
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const userId = authService.getCurrentUser()?.uid;
    let challengesList;
    if (userId) {
      const cloudData = await firestoreService.get("daily_challenges", userId);
      if (cloudData && cloudData.date === today) {
        challengesList = cloudData.challenges;
        console.log("✅ Loaded challenges from Firebase");
      }
    }
    if (!challengesList) {
      const savedDate = localStorage.getItem("challenges_date");
      if (savedDate === today) {
        challengesList = JSON.parse(localStorage.getItem("daily_challenges") || "[]");
      }
    }
    if (!challengesList) {
      challengesList = generateChallenges();
      localStorage.setItem("daily_challenges", JSON.stringify(challengesList));
      localStorage.setItem("challenges_date", today);
      if (userId) {
        await firestoreService.save("daily_challenges", { challenges: challengesList, date: today }, userId);
      }
    }
    setChallenges(challengesList);
  };
  const generateChallenges = () => {
    const allChallenges = [
      { id: "steps_5k", icon: "👟", title: "Walk 5,000 Steps", progress: 0, goal: 5e3, xp: 25, type: "steps" },
      { id: "log_meal", icon: "🍽️", title: "Log 3 Meals", progress: 0, goal: 3, xp: 20, type: "meals" },
      { id: "water_8", icon: "💧", title: "Drink 8 Cups Water", progress: 0, goal: 8, xp: 15, type: "water" },
      { id: "workout_15", icon: "💪", title: "15 Min Workout", progress: 0, goal: 15, xp: 30, type: "workout" },
      { id: "meditate", icon: "🧘", title: "Meditate 10 Min", progress: 0, goal: 10, xp: 25, type: "meditation" },
      { id: "scan_food", icon: "📸", title: "Scan 5 Food Items", progress: 0, goal: 5, xp: 20, type: "scans" },
      { id: "voice_chat", icon: "🎤", title: "Chat with AI Coach", progress: 0, goal: 1, xp: 15, type: "voice" },
      { id: "social_battle", icon: "⚔️", title: "Start 1 Battle", progress: 0, goal: 1, xp: 25, type: "battle" }
    ];
    const shuffled = allChallenges.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((c) => ({ ...c, completed: false }));
  };
  const updateProgress = async (challengeId, increment = 1) => {
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        const newProgress = Math.min(c.progress + increment, c.goal);
        const completed = newProgress >= c.goal;
        if (completed && !c.completed) {
          gamificationService.addXP(c.xp, `Completed challenge: ${c.title}`);
          if (onChallengeComplete) onChallengeComplete(c.xp);
        }
        return { ...c, progress: newProgress, completed };
      }
      return c;
    });
    setChallenges(updated);
    localStorage.setItem("daily_challenges", JSON.stringify(updated));
    const userId = authService.getCurrentUser()?.uid;
    if (userId) {
      const today = (/* @__PURE__ */ new Date()).toDateString();
      await firestoreService.save("daily_challenges", { challenges: updated, date: today }, userId);
    }
  };
  const autoUpdateChallenges = async () => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let workoutHistory = [];
    let foodLog = [];
    let waterLog = [];
    let sleepLog = [];
    try {
      const { value: workoutPrefs } = await Preferences.get({ key: "wellnessai_workoutHistory" });
      if (workoutPrefs) {
        workoutHistory = JSON.parse(workoutPrefs);
      } else {
        workoutHistory = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
      }
      const currentUser = authService.getCurrentUser();
      foodLog = currentUser?.profile?.foodLog || [];
      if (!Array.isArray(foodLog)) foodLog = [];
      const { value: waterPrefs } = await Preferences.get({ key: "wellnessai_waterLog" });
      if (waterPrefs) {
        waterLog = JSON.parse(waterPrefs);
      } else {
        waterLog = JSON.parse(localStorage.getItem("waterLog") || "[]");
      }
      const { value: sleepPrefs } = await Preferences.get({ key: "wellnessai_sleepLog" });
      if (sleepPrefs) {
        sleepLog = JSON.parse(sleepPrefs);
      } else {
        sleepLog = JSON.parse(localStorage.getItem("sleepLog") || "[]");
      }
    } catch (e) {
      console.error("❌ Failed to load challenge data:", e);
      workoutHistory = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
      waterLog = JSON.parse(localStorage.getItem("waterLog") || "[]");
      sleepLog = JSON.parse(localStorage.getItem("sleepLog") || "[]");
    }
    const todayWorkouts = Array.isArray(workoutHistory) ? workoutHistory.filter((w) => w.date === today) : [];
    const todayMeals = Array.isArray(foodLog) ? foodLog.filter(
      (f) => f.date === today || f.timestamp && new Date(f.timestamp).toISOString().split("T")[0] === today
    ) : [];
    let meditationLog = [];
    try {
      const { value: medPrefs } = await Preferences.get({ key: "wellnessai_meditationLog" });
      if (medPrefs) {
        meditationLog = JSON.parse(medPrefs);
      } else {
        meditationLog = JSON.parse(localStorage.getItem("meditationLog") || "[]");
      }
    } catch (e) {
      meditationLog = JSON.parse(localStorage.getItem("meditationLog") || "[]");
    }
    const todayMeditation = Array.isArray(meditationLog) ? meditationLog.filter((m) => m.date === today) : [];
    const totalMeditationMinutes = todayMeditation.reduce((sum, m) => sum + (m.duration || 0), 0);
    const totalScans = todayMeals.filter((f) => f.scanned === true || f.barcode).length;
    const battleData = JSON.parse(localStorage.getItem("socialBattlesData") || "{}");
    const activeBattles = battleData.activeBattles || [];
    const todayBattles = activeBattles.filter(
      (b) => b.createdAt && new Date(b.createdAt).toISOString().split("T")[0] === today
    );
    const todayWater = Array.isArray(waterLog) ? waterLog.filter((w) => w.date === today) : [];
    const todaySleep = Array.isArray(sleepLog) ? sleepLog.find((s) => s.date === today) : null;
    const waterCups = todayWater.reduce((sum, w) => sum + (w.cups || 1), 0);
    const totalWorkoutMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    todaySleep ? todaySleep.hours * 60 : 0;
    todayMeals.length;
    const updated = challenges.map((c) => {
      if (c.completed) return c;
      let newProgress = c.progress;
      switch (c.type) {
        case "steps":
          newProgress = todaySteps;
          break;
        case "meals":
          newProgress = todayMeals.length;
          break;
        case "water":
          newProgress = waterCups;
          break;
        case "workout":
          newProgress = totalWorkoutMinutes;
          break;
        case "meditation":
          newProgress = totalMeditationMinutes;
          break;
        case "scans":
          newProgress = totalScans;
          break;
        case "voice":
          const aiChatLog = JSON.parse(localStorage.getItem("aiChatHistory") || "[]");
          const todayChats = aiChatLog.filter(
            (chat) => chat.timestamp && new Date(chat.timestamp).toISOString().split("T")[0] === today
          );
          newProgress = todayChats.length > 0 ? 1 : 0;
          break;
        case "battle":
          newProgress = todayBattles.length > 0 ? 1 : 0;
          break;
      }
      const completed = newProgress >= c.goal;
      if (completed && !c.completed) {
        gamificationService.addXP(c.xp, `Completed challenge: ${c.title}`);
        if (onChallengeComplete) onChallengeComplete(c.xp);
      }
      return { ...c, progress: newProgress, completed };
    });
    if (JSON.stringify(updated) !== JSON.stringify(challenges)) {
      setChallenges(updated);
      localStorage.setItem("daily_challenges", JSON.stringify(updated));
    }
  };
  reactExports.useEffect(() => {
    window.updateDailyChallenge = updateProgress;
    if (todaySteps > 0) {
      autoUpdateChallenges();
    }
  }, [challenges, todaySteps]);
  const progressPercent = (challenge) => {
    return challenge.progress / challenge.goal * 100;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "daily-challenges", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "challenges-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "challenges-icon", children: "🎯" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "challenges-title", children: "Daily Challenges" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "challenges-list", children: challenges.map((challenge) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `challenge-item ${challenge.completed ? "completed" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "challenge-icon", children: challenge.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "challenge-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "challenge-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "challenge-title", children: challenge.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "challenge-xp", children: [
            "+",
            challenge.xp,
            " XP"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "challenge-progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "challenge-progress-fill",
            style: { width: `${progressPercent(challenge)}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "challenge-counter", children: [
          challenge.progress,
          " / ",
          challenge.goal
        ] })
      ] }),
      challenge.completed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "challenge-check", children: "✓" })
    ] }, challenge.id)) })
  ] });
}
export {
  DailyChallenges as default
};
