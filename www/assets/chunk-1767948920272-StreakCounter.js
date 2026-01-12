import { r as reactExports, P as Preferences, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function StreakCounter() {
  const [streak, setStreak] = reactExports.useState(0);
  const [showAnimation, setShowAnimation] = reactExports.useState(false);
  reactExports.useEffect(() => {
    checkAndUpdateStreak();
  }, []);
  const checkAndUpdateStreak = async () => {
    try {
      const today = (/* @__PURE__ */ new Date()).toDateString();
      let lastLogin = null;
      let currentStreak = 0;
      try {
        const { value: prefsLastLogin } = await Preferences.get({ key: "wellnessai_last_login_date" });
        const { value: prefsStreak } = await Preferences.get({ key: "wellnessai_login_streak" });
        if (prefsLastLogin) lastLogin = prefsLastLogin;
        if (prefsStreak) currentStreak = parseInt(prefsStreak);
      } catch (e) {
        lastLogin = localStorage.getItem("last_login_date");
        currentStreak = parseInt(localStorage.getItem("login_streak") || "0");
      }
      if (lastLogin === today) {
        setStreak(currentStreak);
      } else {
        const lastDate = lastLogin ? new Date(lastLogin) : null;
        const yesterday = /* @__PURE__ */ new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
          const newStreak = currentStreak + 1;
          await Preferences.set({ key: "wellnessai_login_streak", value: newStreak.toString() });
          await Preferences.set({ key: "wellnessai_last_login_date", value: today });
          localStorage.setItem("login_streak", newStreak.toString());
          localStorage.setItem("last_login_date", today);
          setStreak(newStreak);
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 2e3);
        } else {
          await Preferences.set({ key: "wellnessai_login_streak", value: "1" });
          await Preferences.set({ key: "wellnessai_last_login_date", value: today });
          localStorage.setItem("login_streak", "1");
          localStorage.setItem("last_login_date", today);
          setStreak(1);
        }
      }
    } catch (error) {
      console.error("❌ [StreakCounter] Error:", error);
      setStreak(1);
    }
  };
  if (streak === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `streak-counter ${showAnimation ? "animate" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "streak-flame", children: "🔥" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "streak-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "streak-number", children: streak }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "streak-label", children: "Day Streak" })
    ] }),
    showAnimation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "streak-particles", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🎉" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⭐" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "✨" })
    ] })
  ] });
}
export {
  StreakCounter as default
};
