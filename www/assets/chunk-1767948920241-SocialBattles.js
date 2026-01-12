const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css","assets/chunk-1767948920159-battleNotificationsService.js","assets/chunk-1767948920158-stripeService.js"])))=>i.map(i=>d[i]);
import { r as reactExports, z as subscriptionService, g as gamificationService, a as authService, j as jsxRuntimeExports, _ as __vitePreload } from "./entry-1767948920134-index.js";
import { socialBattlesService } from "./chunk-1767948920159-socialBattlesService.js";
import "./chunk-1767948920148-healthAvatarService.js";
function SocialBattles({ onClose }) {
  const [view, setView] = reactExports.useState("list");
  const [battles, setBattles] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState(null);
  const [selectedBattle, setSelectedBattle] = reactExports.useState(null);
  const [leaderboard, setLeaderboard] = reactExports.useState(null);
  const [globalLeaderboard, setGlobalLeaderboard] = reactExports.useState([]);
  const [leaderboardMetric, setLeaderboardMetric] = reactExports.useState("totalXP");
  const [battleHistory, setBattleHistory] = reactExports.useState([]);
  const [rewards, setRewards] = reactExports.useState(null);
  const [dailyChallenges, setDailyChallenges] = reactExports.useState([]);
  const [battleStreak, setBattleStreak] = reactExports.useState({ current: 0, multiplier: 1 });
  const [activePowerUps, setActivePowerUps] = reactExports.useState([]);
  const [newBattle, setNewBattle] = reactExports.useState({
    duration: 30,
    goal: "steps",
    target: 3e5,
    stakes: "bragging-rights",
    stakeAmount: 0,
    battleType: "solo"
    // solo, team, tournament
  });
  reactExports.useEffect(() => {
    if (!subscriptionService.hasAccess("socialBattles")) {
      return;
    }
    try {
      loadBattles();
      loadStats();
      loadGlobalLeaderboard();
      loadBattleHistory();
      loadRewards();
      loadDailyChallenges();
      loadBattleStreak();
      const autoSyncInterval = setInterval(async () => {
        try {
          await socialBattlesService.autoSyncAllBattles();
          loadBattles();
        } catch (error) {
          if (false) ;
        }
      }, 6e4);
      return () => clearInterval(autoSyncInterval);
    } catch (error) {
    }
  }, []);
  const loadBattles = async () => {
    try {
      const activeBattles = await socialBattlesService.getActiveBattles();
      setBattles(activeBattles || []);
    } catch (error) {
      setBattles([]);
    }
  };
  const loadStats = async () => {
    try {
      const userStats = await socialBattlesService.getBattleStats();
      setStats(userStats || { wins: 0, losses: 0, winRate: 0 });
    } catch (error) {
      setStats({ wins: 0, losses: 0, winRate: 0 });
    }
  };
  const loadGlobalLeaderboard = () => {
    try {
      const data = gamificationService.getGlobalLeaderboard(leaderboardMetric, 50);
      setGlobalLeaderboard(data);
    } catch (error) {
      setGlobalLeaderboard([]);
    }
  };
  const loadBattleHistory = async () => {
    try {
      const completed = await socialBattlesService.getBattleHistory();
      const history = (completed || []).filter((battle) => battle && battle.config).map((battle) => {
        const user = authService.getCurrentUser() || { id: "current-user" };
        const isWinner = battle.results?.winner?.userId === user.id;
        const opponent = isWinner ? battle.results?.loser?.userName || "Opponent" : battle.results?.winner?.userName || "Opponent";
        return {
          id: battle.id || "unknown",
          type: `${(battle.config?.goal || "Unknown").replace(/-/g, " ")} Challenge`,
          opponent,
          result: isWinner ? "won" : "lost",
          date: battle.results?.completedAt ? new Date(battle.results.completedAt).toLocaleDateString() : "Unknown",
          xpEarned: isWinner ? 75 : 25
          // Base XP, could be from gamification service
        };
      }).reverse();
      setBattleHistory(history);
    } catch (error) {
      setBattleHistory([]);
    }
  };
  const loadRewards = () => {
    try {
      const rewardsData = gamificationService.getBattleRewards();
      setRewards(rewardsData);
    } catch (error) {
      setRewards(null);
    }
  };
  const loadDailyChallenges = () => {
    try {
      const stored = localStorage.getItem("daily_battle_challenges");
      const today = (/* @__PURE__ */ new Date()).toDateString();
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
          setDailyChallenges(data.challenges);
          return;
        }
      }
      const challenges = [
        {
          id: "daily_steps",
          name: "Daily Step Sprint",
          description: "10,000 steps in 24 hours",
          target: 1e4,
          xpReward: 100,
          icon: "🏃",
          progress: 0,
          completed: false
        },
        {
          id: "quick_battle",
          name: "Quick Battle Victory",
          description: "Win any battle today",
          xpReward: 75,
          icon: "⚔️",
          progress: 0,
          completed: false
        }
      ];
      localStorage.setItem("daily_battle_challenges", JSON.stringify({ date: today, challenges }));
      setDailyChallenges(challenges);
    } catch (error) {
      setDailyChallenges([]);
    }
  };
  const loadBattleStreak = () => {
    try {
      const stored = localStorage.getItem("battle_streak");
      if (stored) {
        const data = JSON.parse(stored);
        const multiplier = 1 + data.current * 0.1;
        setBattleStreak({ current: data.current || 0, multiplier });
      }
    } catch (error) {
    }
  };
  const handleCreateBattle = async () => {
    try {
      const result = await socialBattlesService.createBattle(newBattle);
      if (result.success) {
        const battleInfo = {
          battleId: result.battleId,
          shareCode: result.shareCode
        };
        const shareNow = confirm(`✅ Battle Created!

Battle ID: ${battleInfo.battleId}
Share Code: ${battleInfo.shareCode}

Press OK to share with friends, or Cancel to continue.`);
        await loadBattles();
        if (shareNow) {
          await handleShareBattle(battleInfo);
        }
        setView("list");
      } else {
        throw new Error(result.error || "Failed to create battle");
      }
    } catch (error) {
      alert("Failed to create battle: " + error.message);
    }
  };
  const handleShareBattle = async (battleInfo) => {
    try {
      const { Share } = await __vitePreload(async () => {
        const { Share: Share2 } = await import("./entry-1767948920134-index.js").then((n) => n.ad);
        return { Share: Share2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      await Share.share({
        title: "⚔️ Join My Health Battle!",
        text: `I challenge you to a health battle in WellnessAI!

Share Code: ${battleInfo.shareCode}

Download the app and enter this code to join!`,
        dialogTitle: "Share Battle Code"
      });
    } catch (error) {
      try {
        await navigator.clipboard.writeText(battleInfo.shareCode);
        alert(`📋 Share Code Copied!

${battleInfo.shareCode}

Paste this code to your friends via WhatsApp, SMS, or any messaging app!`);
      } catch (clipError) {
        alert(`Share Code: ${battleInfo.shareCode}

Send this to your friends manually!`);
      }
    }
  };
  const handleJoinBattle = async () => {
    const code = prompt("Enter Battle Share Code:");
    if (!code) return;
    try {
      const result = await socialBattlesService.joinByShareCode(code.toUpperCase());
      if (result.success) {
        alert(`✅ Joined Battle!

The battle will start when all participants are ready.

Good luck! 🔥`);
        loadBattles();
      } else {
        throw new Error(result.error || "Failed to join battle");
      }
    } catch (error) {
      alert("Failed to join battle: " + error.message);
    }
  };
  const handleSyncProgress = async (battleId) => {
    try {
      const result = await socialBattlesService.syncBattleProgress(battleId);
      if (result.success) {
        alert(`📊 Progress Updated!

Current Steps: ${(result.currentSteps || 0).toLocaleString()}
Progress: +${(result.progress || 0).toLocaleString()}
Rank: #${result.rank || "-"}

Keep moving! 💪`);
        loadBattles();
      }
    } catch (error) {
      alert("Failed to sync: " + error.message);
    }
  };
  const handleViewLeaderboard = async (battleId) => {
    const board = await socialBattlesService.getLiveLeaderboard(battleId);
    setLeaderboard(board);
    setSelectedBattle(battles.find((b) => b.id === battleId));
    setView("leaderboard");
  };
  const handleQuickMatch = async () => {
    try {
      const quickBattle = {
        duration: 1,
        // 1 day sprint
        goal: "steps",
        target: 1e4,
        stakes: "bragging-rights",
        stakeAmount: 0,
        battleType: "quick"
      };
      const result = await socialBattlesService.createBattle(quickBattle);
      if (result.success) {
        alert("⚡ Quick Match Created!\n\nFinding opponents...\n\nBattle starts when 2+ players join!");
        __vitePreload(async () => {
          const { default: notificationService } = await import("./chunk-1767948920159-battleNotificationsService.js");
          return { default: notificationService };
        }, true ? __vite__mapDeps([2,0,1]) : void 0).then(({ default: notificationService }) => {
          notificationService.sendBattleInvite({
            creatorName: "You",
            goal: "Quick Step Battle",
            battleId: result.battleId
          });
        });
        await loadBattles();
      }
    } catch (error) {
      alert("Quick Match failed: " + error.message);
    }
  };
  const handleClaimReward = async (reward) => {
    try {
      if (rewards.userCoins < reward.cost) {
        alert(`❌ Not enough coins!

You need ${reward.cost - rewards.userCoins} more coins.`);
        return;
      }
      const newCoins = rewards.userCoins - reward.cost;
      const powerUp = {
        id: reward.id,
        name: reward.name,
        activatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1e3
        // 24 hours
      };
      const stored = localStorage.getItem("active_powerups") || "[]";
      const powerUps = JSON.parse(stored);
      powerUps.push(powerUp);
      localStorage.setItem("active_powerups", JSON.stringify(powerUps));
      setActivePowerUps(powerUps);
      setRewards({ ...rewards, userCoins: newCoins });
      alert(`✅ ${reward.name} activated!

${reward.description}

Expires in 24 hours.`);
    } catch (error) {
      alert("Failed to claim reward: " + error.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "battles-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battles-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "battles-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "battles-title", children: "⚔️ Social Health Battles" }),
    !subscriptionService.hasAccess("socialBattles") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "paywall-notice", style: { textAlign: "center", padding: "40px 20px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "80px", marginBottom: "20px" }, children: "🔒" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "24px", marginBottom: "10px" }, children: "Unlock Social Battles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#888", marginBottom: "30px" }, children: "Compete with friends and climb the leaderboards!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { style: { listStyle: "none", padding: 0, marginBottom: "30px", textAlign: "left", maxWidth: "400px", margin: "0 auto 30px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { style: { padding: "8px 0" }, children: "✅ Challenge friends to health battles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { style: { padding: "8px 0" }, children: "✅ Join global leaderboards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { style: { padding: "8px 0" }, children: "✅ Earn rewards and badges" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { style: { padding: "8px 0" }, children: "✅ Track your battle history" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "18px", marginBottom: "10px" }, children: [
        "Starting at ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "£16.99/month" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "20px", color: "#10b981", fontWeight: "bold", marginBottom: "20px" }, children: "🎉 30 DAYS FREE - Cancel anytime" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          style: {
            padding: "15px 40px",
            fontSize: "18px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold"
          },
          onClick: () => {
            __vitePreload(async () => {
              const { checkoutPremium } = await import("./chunk-1767948920158-stripeService.js");
              return { checkoutPremium };
            }, true ? __vite__mapDeps([3,0,1]) : void 0).then(({ checkoutPremium }) => {
              checkoutPremium();
            });
          },
          children: "⭐ Start Free Trial"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battles-nav", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "list" ? "active" : ""}`,
            onClick: () => setView("list"),
            children: "📋 Battles"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "create" ? "active" : ""}`,
            onClick: () => setView("create"),
            children: "➕ Create"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "global" ? "active" : ""}`,
            onClick: () => setView("global"),
            children: "🌍 Leaderboard"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "history" ? "active" : ""}`,
            onClick: () => setView("history"),
            children: "📜 History"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "rewards" ? "active" : ""}`,
            onClick: () => setView("rewards"),
            children: "🏆 Rewards"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "nav-btn join-btn",
            onClick: handleJoinBattle,
            children: "🔗 Join"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "nav-btn quick-match-btn",
            onClick: handleQuickMatch,
            style: { background: "linear-gradient(135deg, #FF4500, #FFD700)", fontWeight: "bold" },
            children: "⚡ Quick Match"
          }
        )
      ] }),
      stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-banner", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.wins }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Wins" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.losses }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Losses" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
            stats.winRate,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Win Rate" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-box", style: { borderColor: "#FFD700" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", style: { color: "#FFD700" }, children: [
            "🔥 ",
            battleStreak.current
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Win Streak" }),
          battleStreak.current > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "11px", color: "#FFD700" }, children: [
            battleStreak.multiplier,
            "x XP"
          ] })
        ] })
      ] }),
      dailyChallenges.length > 0 && view === "list" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "daily-challenges", style: { margin: "15px 0", padding: "15px", background: "rgba(255, 215, 0, 0.1)", border: "2px solid rgba(255, 215, 0, 0.3)", borderRadius: "15px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: "0 0 10px 0", fontSize: "16px", color: "#FFD700" }, children: "⏰ Daily Challenges (Expires Midnight)" }),
        dailyChallenges.map((challenge) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "10px", marginBottom: "10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "14px", fontWeight: "bold", color: "white" }, children: [
              challenge.icon,
              " ",
              challenge.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }, children: challenge.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "16px", fontWeight: "bold", color: "#FFD700" }, children: [
              "+",
              challenge.xpReward,
              " XP"
            ] }),
            challenge.completed ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", color: "#4CAF50" }, children: "✅ Done" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "12px", color: "#FF4500" }, children: [
              "⏰ ",
              (/* @__PURE__ */ new Date()).getHours() < 12 ? 24 - (/* @__PURE__ */ new Date()).getHours() : 24 - (/* @__PURE__ */ new Date()).getHours(),
              " hrs left"
            ] })
          ] })
        ] }, challenge.id))
      ] }),
      view === "list" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "battles-list", children: battles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-battles", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "🏆 No active battles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "help-text", children: "Create a battle to challenge your friends!" })
      ] }) : battles.map((battle) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battle-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battle-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "battle-goal", children: battle.goal || "Unknown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `battle-status ${battle.status || "unknown"}`, children: battle.status || "unknown" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battle-target", children: [
          "Target: ",
          (battle.target || 0).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battle-stakes", children: [
          "💰 Stakes: ",
          (battle.stakes || "none").replace(/-/g, " "),
          (battle.stakeAmount || 0) > 0 && ` ($${battle.stakeAmount})`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battle-participants", children: [
          "👥 ",
          battle.participants?.length || 0,
          " participants"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battle-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "view-leaderboard-btn",
              onClick: () => handleViewLeaderboard(battle.id),
              children: "📊 Leaderboard"
            }
          ),
          battle.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "sync-btn",
              onClick: () => handleSyncProgress(battle.id),
              children: "🔄 Sync Progress"
            }
          )
        ] })
      ] }, battle.id || Math.random())) }),
      view === "create" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "create-battle", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Create New Battle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Goal Type:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: newBattle.goal,
              onChange: (e) => setNewBattle({ ...newBattle, goal: e.target.value }),
              className: "form-select",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "steps", children: "Steps Challenge" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "weight-loss", children: "Weight Loss" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "health-score", children: "Health Score" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Target:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: newBattle.target,
              onChange: (e) => setNewBattle({ ...newBattle, target: parseInt(e.target.value) }),
              className: "form-input"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "input-hint", children: [
            newBattle.goal === "steps" && "Total steps in 30 days",
            newBattle.goal === "weight-loss" && "Pounds to lose",
            newBattle.goal === "health-score" && "Target health score"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Duration (days):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: newBattle.duration,
              onChange: (e) => setNewBattle({ ...newBattle, duration: parseInt(e.target.value) }),
              className: "form-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Stakes:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: newBattle.stakes,
              onChange: (e) => setNewBattle({ ...newBattle, stakes: e.target.value }),
              className: "form-select",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bragging-rights", children: "Bragging Rights" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "money", children: "Money" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "subscription", children: "Subscription Payment" })
              ]
            }
          )
        ] }),
        (newBattle.stakes === "money" || newBattle.stakes === "subscription") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Amount ($):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: newBattle.stakeAmount,
              onChange: (e) => setNewBattle({ ...newBattle, stakeAmount: parseInt(e.target.value) }),
              className: "form-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "create-battle-btn", onClick: handleCreateBattle, children: "⚔️ Create Battle" })
      ] }),
      view === "leaderboard" && leaderboard && selectedBattle && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leaderboard-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setView("list"), children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
          (selectedBattle.goal || "Unknown").replace(/-/g, " ").toUpperCase(),
          " Challenge"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "days-remaining", children: [
          "⏱️ ",
          leaderboard.daysRemaining,
          " days remaining"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "leaderboard-list", children: leaderboard.leaderboard.map((participant, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `leaderboard-item rank-${participant.rank}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rank-badge", children: [
            participant.rank === 1 && "🥇",
            participant.rank === 2 && "🥈",
            participant.rank === 3 && "🥉",
            participant.rank > 3 && `#${participant.rank}`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "participant-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "participant-name", children: [
              participant.userId,
              participant.isVIP && " 👑"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "participant-progress", children: [
              "Progress: ",
              participant.progress,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "participant-score", children: (participant.currentScore || 0).toLocaleString() })
        ] }, idx)) })
      ] }),
      view === "global" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "global-leaderboard-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-selector", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: leaderboardMetric === "totalXP" ? "active" : "",
              onClick: () => {
                setLeaderboardMetric("totalXP");
                loadGlobalLeaderboard();
              },
              children: "⚡ XP"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: leaderboardMetric === "level" ? "active" : "",
              onClick: () => {
                setLeaderboardMetric("level");
                loadGlobalLeaderboard();
              },
              children: "🏅 Level"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: leaderboardMetric === "streak" ? "active" : "",
              onClick: () => {
                setLeaderboardMetric("streak");
                loadGlobalLeaderboard();
              },
              children: "🔥 Streak"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: leaderboardMetric === "totalSteps" ? "active" : "",
              onClick: () => {
                setLeaderboardMetric("totalSteps");
                loadGlobalLeaderboard();
              },
              children: "👟 Steps"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "global-leaderboard-list", children: globalLeaderboard.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `global-leaderboard-item ${user.isCurrentUser ? "current-user" : ""} ${user.rank <= 3 ? "top-three" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rank-badge-global", children: [
                user.rank === 1 && "🥇",
                user.rank === 2 && "🥈",
                user.rank === 3 && "🥉",
                user.rank > 3 && `#${user.rank}`
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "user-avatar", children: user.profilePic }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-details", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-name", children: [
                  user.username,
                  user.isVIP && " 👑"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-level", children: [
                  "Level ",
                  user.level
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-stat", children: [
                leaderboardMetric === "totalXP" && `${(user.totalXP || 0).toLocaleString()} XP`,
                leaderboardMetric === "level" && `Level ${user.level || 1}`,
                leaderboardMetric === "streak" && `${user.streak || 0} days 🔥`,
                leaderboardMetric === "totalSteps" && `${(user.totalSteps || 0).toLocaleString()} steps`
              ] })
            ]
          },
          user.userId
        )) })
      ] }),
      view === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "⚔️ Battle History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats?.wins || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Wins" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats?.losses || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Losses" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              stats?.winRate || 0,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Win Rate" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-list", children: battleHistory.map((battle) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `history-item ${battle.result}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-icon", children: battle.result === "won" ? "🏆" : "💀" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-details", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-type", children: battle.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-opponent", children: [
              "vs ",
              battle.opponent
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-date", children: battle.date })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-reward", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "xp-earned", children: [
              "+",
              battle.xpEarned,
              " XP"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `result-badge ${battle.result}`, children: battle.result === "won" ? "VICTORY" : "DEFEAT" })
          ] })
        ] }, battle.id)) })
      ] }),
      view === "rewards" && rewards && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rewards-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🏆 Battle Rewards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-coins", children: [
          "💰 Your Coins: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: rewards.userCoins })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rewards-list", children: rewards.availableRewards.map((reward) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reward-icon", children: reward.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reward-name", children: reward.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reward-description", children: reward.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-action", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-cost", children: [
              reward.cost,
              " coins"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "claim-btn",
                onClick: () => handleClaimReward(reward),
                disabled: rewards.userCoins < reward.cost,
                children: "Claim"
              }
            )
          ] })
        ] }, reward.id)) })
      ] })
    ] })
  ] }) });
}
export {
  SocialBattles as default
};
