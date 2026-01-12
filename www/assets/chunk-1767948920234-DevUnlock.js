import { r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function DevUnlock({ onUnlock, onCancel }) {
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await onUnlock(password);
      if (!result.success) {
        setError(result.message);
        setPassword("");
      }
    } catch (err) {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dev-unlock-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dev-unlock-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dev-unlock-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🔒 Developer Mode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Enter password to unlock all features" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "dev-unlock-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: "Enter developer password",
          className: "dev-unlock-input",
          autoFocus: true,
          disabled: loading
        }
      ),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dev-unlock-error", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dev-unlock-buttons", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onCancel,
            className: "dev-unlock-btn dev-unlock-btn-cancel",
            disabled: loading,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            className: "dev-unlock-btn dev-unlock-btn-submit",
            disabled: loading || !password,
            children: loading ? "Verifying..." : "Unlock"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dev-unlock-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: "Authorized device detected" }) })
  ] }) });
}
export {
  DevUnlock as default
};
