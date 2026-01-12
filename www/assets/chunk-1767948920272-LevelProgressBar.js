import { r as reactExports, g as gamificationService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function LevelProgressBar() {
  const [xp, setXP] = reactExports.useState(0);
  const [level, setLevel] = reactExports.useState(1);
  const [progress, setProgress] = reactExports.useState(0);
  const [xpNeeded, setXPNeeded] = reactExports.useState(1e3);
  reactExports.useEffect(() => {
    updateProgress();
    const interval = setInterval(updateProgress, 1e3);
    return () => clearInterval(interval);
  }, []);
  const updateProgress = () => {
    const levelInfo = gamificationService.getLevelInfo();
    const currentXP = levelInfo.xpInLevel || 0;
    const currentLevel = levelInfo.level || 1;
    const needed = levelInfo.xpToNext + currentXP || currentLevel * 1e3;
    const prog = levelInfo.progress || currentXP / needed * 100;
    setXP(currentXP);
    setLevel(currentLevel);
    setProgress(prog);
    setXPNeeded(needed);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "level-progress-bar", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "level-info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "level-badge", children: [
        "Level ",
        level
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "xp-text", children: [
        xp,
        " / ",
        xpNeeded,
        " XP"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-track", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "progress-fill",
        style: { width: `${progress}%` },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-shine" })
      }
    ) })
  ] });
}
export {
  LevelProgressBar as default
};
