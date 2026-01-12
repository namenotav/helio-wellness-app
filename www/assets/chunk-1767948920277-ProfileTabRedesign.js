const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, z as subscriptionService, g as gamificationService, _ as __vitePreload, a as authService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function ProfileTabRedesign({
  user,
  onOpenSettings,
  onOpenPremium,
  onOpenHealthTools,
  onOpenDataManagement,
  onOpenSocialFeatures,
  onOpenSettingsHub,
  onEditProfile,
  onOpenFullStats,
  onOpenMonthlyStats,
  onOpenWeeklyComparison
}) {
  const [level, setLevel] = reactExports.useState(1);
  const [xp, setXP] = reactExports.useState(0);
  const [achievements, setAchievements] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(true);
  const [hasVIPBadge, setHasVIPBadge] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadUserData();
  }, []);
  const loadUserData = async () => {
    try {
      setLoading(true);
      setHasVIPBadge(subscriptionService.hasAccess("vipBadge"));
      await gamificationService.loadData();
      const levelInfo = gamificationService.getLevelInfo();
      setLevel(levelInfo?.level || 1);
      setXP(levelInfo?.totalXP || 0);
      const allAchievements = gamificationService.getAllAchievements();
      const mappedAchievements = allAchievements.map((a) => ({
        id: a.id,
        icon: a.icon,
        name: a.name,
        locked: !a.unlocked
      }));
      setAchievements(mappedAchievements);
      const streakInfo = gamificationService.getStreakInfo();
      let workoutHistory = [];
      try {
        const { Preferences } = await __vitePreload(async () => {
          const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
          return { Preferences: Preferences2 };
        }, true ? __vite__mapDeps([0,1]) : void 0);
        const { value: workoutPrefs } = await Preferences.get({ key: "wellnessai_workoutHistory" });
        if (workoutPrefs) {
          workoutHistory = JSON.parse(workoutPrefs);
        } else {
          workoutHistory = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
        }
      } catch (e) {
        workoutHistory = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
      }
      const currentUser = authService.getCurrentUser();
      const foodLog = currentUser?.profile?.foodLog || [];
      setStats({
        streak: streakInfo?.streak || 0,
        totalXP: levelInfo?.totalXP || 0,
        workouts: Array.isArray(workoutHistory) ? workoutHistory.length : 0,
        meals: Array.isArray(foodLog) ? foodLog.length : 0
      });
      try {
        await gamificationService.checkActivityAchievements();
        if (false) ;
      } catch (error) {
        console.error("❌ Failed to check achievements:", error);
      }
      if (false) ;
    } catch (error) {
      console.error("❌ [ProfileTabRedesign] Error loading gamification data:", error);
      setLevel(1);
      setXP(0);
      setAchievements([]);
      setStats({ streak: 0, totalXP: 0, workouts: 0, meals: 0 });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-tab-redesign", children: [
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "40px", textAlign: "center", color: "#888" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "32px", marginBottom: "10px" }, children: "⏳" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading your progress..." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-avatar", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "avatar-emoji", children: user?.avatar || "👤" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "level-badge", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "level-text", children: [
            "LVL ",
            level
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "profile-name", children: user?.name || user?.profile?.name || "Wellness Warrior" }),
          hasVIPBadge && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "vip-badge",
              title: "Ultimate Plan VIP Member",
              style: {
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "#000",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                animation: "vipPulse 2s ease-in-out infinite"
              },
              children: "👑 VIP"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "profile-subtitle", children: [
          xp,
          " XP • ",
          achievements.filter((a) => !a.locked).length,
          " Achievements"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "achievements-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "🏆 Achievements" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "achievements-grid", children: achievements.length > 0 ? achievements.map((achievement, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `achievement-badge ${achievement.locked ? "locked" : ""}`,
            title: achievement.name,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "achievement-icon", children: achievement.icon }),
              achievement.locked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lock-overlay", children: "🔒" })
            ]
          },
          achievement.id || idx
        )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { gridColumn: "1 / -1", textAlign: "center", padding: "20px", color: "#888" }, children: "Complete activities to unlock achievements!" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "📊 Your Stats" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-cards", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "🔥" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.streak || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Day Streak" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "⭐" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.totalXP || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Total XP" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "💪" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.workouts || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Workouts" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "🍽️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.meals || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Meals Logged" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "⚙️ Quick Access" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-access-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onOpenHealthTools, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "🏥" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Health Tools" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onOpenDataManagement, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "📊" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Data & Reports" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onOpenSocialFeatures, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "🎮" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Social & Auto" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onEditProfile, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "👤" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Edit Profile" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onOpenFullStats, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "📈" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Full Stats" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onOpenMonthlyStats, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "📅" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Monthly Stats" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onOpenWeeklyComparison, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "📊" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Weekly Compare" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "access-card", onClick: onOpenSettingsHub, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-icon", children: "⚙️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "access-label", children: "Settings" })
        ] })
      ] })
    ] }),
    !user?.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "premium-banner", onClick: () => onOpenPremium && onOpenPremium(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "premium-icon", children: "💎" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-text", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "premium-title", children: "Upgrade to Premium" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "premium-subtitle", children: "Unlock all features & unlimited access" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "premium-arrow", children: "→" })
    ] }) })
  ] });
}
export {
  ProfileTabRedesign as default
};
