import { r as reactExports, f as firestoreService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import SocialBattles from "./chunk-1767948920241-SocialBattles.js";
import "./chunk-1767948920159-socialBattlesService.js";
import "./chunk-1767948920148-healthAvatarService.js";
function BattlesModal({ isOpen, onClose }) {
  const [showFullBattles, setShowFullBattles] = reactExports.useState(false);
  const [battleStats, setBattleStats] = reactExports.useState({
    activeBattles: 0,
    wins: 0,
    rank: 0
  });
  reactExports.useEffect(() => {
    if (isOpen) {
      loadBattleStats();
    }
  }, [isOpen]);
  const loadBattleStats = async () => {
    try {
      console.log("⚔️ [BattlesModal] Loading battle stats from Firestore...");
      let battles = await firestoreService.get("active_battles");
      let profile = await firestoreService.get("user_profile");
      console.log("⚔️ [BattlesModal] Firestore battles:", battles ? "FOUND" : "EMPTY");
      console.log("⚔️ [BattlesModal] Firestore profile:", profile ? "FOUND" : "EMPTY");
      if (!battles) {
        console.log("⚔️ [BattlesModal] Syncing localStorage battles to Firestore...");
        battles = JSON.parse(localStorage.getItem("active_battles") || "[]");
        if (battles.length > 0) {
          await firestoreService.save("active_battles", battles);
          console.log("⚔️ [BattlesModal] ✅ Battles synced to Firestore");
        }
      }
      if (!profile) {
        profile = JSON.parse(localStorage.getItem("user_profile") || "{}");
        if (Object.keys(profile).length > 0) {
          await firestoreService.save("user_profile", profile);
        }
      }
      setBattleStats({
        activeBattles: Array.isArray(battles) ? battles.length : 0,
        wins: profile?.battleWins || 0,
        rank: profile?.globalRank || 0
      });
    } catch (error) {
    }
  };
  if (!isOpen) return null;
  if (showFullBattles) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SocialBattles, { isOpen: true, onClose: () => {
      setShowFullBattles(false);
      onClose();
    } });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battles-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🏆 Battles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battles-hero", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-icon", children: "⚔️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Compete & Win" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Challenge friends in fitness battles" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battles-quick-stats", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "🎯" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-number", children: battleStats.activeBattles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Active" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "🏆" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-number", children: battleStats.wins }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Wins" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "📊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-number", children: [
            "#",
            battleStats.rank || "---"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Rank" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "battles-actions", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-action-btn", onClick: () => setShowFullBattles(true), children: "⚔️ Start Battle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "secondary-action-btn", onClick: () => setShowFullBattles(true), children: "👥 View All Battles" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "battles-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "💡 Challenge friends to step, workout, or calorie burn battles!" }) })
  ] }) });
}
export {
  BattlesModal as default
};
