import { r as reactExports, j as jsxRuntimeExports, g as gamificationService } from "./entry-1767948920134-index.js";
let popupCounter = 0;
function PointsPopup({ points, x = 50, y = 50, onComplete }) {
  const [visible, setVisible] = reactExports.useState(true);
  const [id] = reactExports.useState(() => popupCounter++);
  reactExports.useEffect(() => {
    gamificationService.addXP(points);
    const levelInfo = gamificationService.getLevelInfo();
    if (levelInfo.progress >= 100) {
      window.dispatchEvent(new CustomEvent("levelUp", { detail: { level: levelInfo.level + 1 } }));
    }
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2e3);
    return () => clearTimeout(timer);
  }, [points, onComplete]);
  if (!visible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "points-popup",
      style: {
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${id * 0.1}s`
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "points-value", children: [
        "+",
        points,
        " XP"
      ] })
    }
  );
}
function usePointsPopup() {
  const [popups, setPopups] = reactExports.useState([]);
  const addPoints = (points, position = {}) => {
    const id = Date.now() + Math.random();
    const x = position.x || 40 + Math.random() * 20;
    const y = position.y || 40 + Math.random() * 20;
    setPopups((prev) => [...prev, { id, points, x, y }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 2500);
  };
  const PopupsRenderer = () => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: popups.map((popup) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    PointsPopup,
    {
      points: popup.points,
      x: popup.x,
      y: popup.y
    },
    popup.id
  )) });
  return { addPoints, PopupsRenderer };
}
export {
  usePointsPopup as u
};
