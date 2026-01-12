import { r as reactExports, j as jsxRuntimeExports, x as syncService } from "./entry-1767948920134-index.js";
function AchievementUnlock({ achievement, onClose }) {
  const [show, setShow] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setShow(true);
    const saveAchievement = async () => {
      const localUnlocked = JSON.parse(localStorage.getItem("unlocked_achievements") || "[]");
      let cloudUnlocked = [];
      try {
        cloudUnlocked = await syncService.getData("unlocked_achievements") || [];
      } catch (e) {
      }
      const merged = [.../* @__PURE__ */ new Set([...localUnlocked, ...cloudUnlocked])];
      if (!merged.includes(achievement.id)) {
        merged.push(achievement.id);
        await syncService.saveData("unlocked_achievements", merged);
      }
    };
    saveAchievement();
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500);
    }, 4e3);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `achievement-unlock-overlay ${show ? "show" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "confetti-container", children: [...Array(50)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "confetti",
        style: {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
          backgroundColor: ["#ffd93d", "#ff6b6b", "#8a74f9", "#00f2fe", "#43e97b"][Math.floor(Math.random() * 5)]
        }
      },
      i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `achievement-card ${show ? "show" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "achievement-shine" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "achievement-icon", children: achievement.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "achievement-title", children: "🎉 Achievement Unlocked!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "achievement-name", children: achievement.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "achievement-description", children: achievement.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "achievement-reward", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "reward-badge", children: [
        "+",
        achievement.xp,
        " XP"
      ] }) })
    ] })
  ] });
}
function checkAchievement(achievementId) {
  const achievements = {
    first_steps: { id: "first_steps", icon: "👣", name: "First Steps", description: "Walked 1,000 steps!", xp: 50 },
    meal_master: { id: "meal_master", icon: "🍽️", name: "Meal Master", description: "Logged 7 days of meals!", xp: 100 },
    zen_warrior: { id: "zen_warrior", icon: "🧘", name: "Zen Warrior", description: "Completed 10 meditation sessions!", xp: 150 },
    social_champion: { id: "social_champion", icon: "🏆", name: "Social Champion", description: "Won 5 battles!", xp: 200 },
    dna_explorer: { id: "dna_explorer", icon: "🧬", name: "DNA Explorer", description: "Uploaded DNA data!", xp: 250 },
    week_warrior: { id: "week_warrior", icon: "🔥", name: "Week Warrior", description: "7 day login streak!", xp: 300 },
    workout_beast: { id: "workout_beast", icon: "💪", name: "Workout Beast", description: "Completed 20 workouts!", xp: 200 },
    scan_master: { id: "scan_master", icon: "📸", name: "Scan Master", description: "Scanned 50 items!", xp: 100 }
  };
  const achievement = achievements[achievementId];
  if (!achievement) return null;
  const unlocked = JSON.parse(localStorage.getItem("unlocked_achievements") || "[]");
  if (unlocked.includes(achievementId)) return null;
  return achievement;
}
export {
  checkAchievement,
  AchievementUnlock as default
};
