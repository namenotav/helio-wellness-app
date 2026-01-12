import { j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function HomeActionButton({ icon, label, gradient, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      className: "home-action-button",
      style: { background: gradient },
      onClick,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "action-icon", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "action-label", children: label })
      ]
    }
  );
}
export {
  HomeActionButton as default
};
