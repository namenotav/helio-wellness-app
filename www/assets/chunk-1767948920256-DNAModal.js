import { r as reactExports, f as firestoreService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import DNAUpload from "./chunk-1767948920257-DNAUpload.js";
import "./chunk-1767948920155-PaywallModal.js";
import "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
function DNAModal({ isOpen, onClose }) {
  const [showDNAUpload, setShowDNAUpload] = reactExports.useState(false);
  const [dnaStatus, setDnaStatus] = reactExports.useState({
    uploaded: false,
    traits: 0,
    recommendations: 0
  });
  reactExports.useEffect(() => {
    if (isOpen) {
      loadDNAStatus();
    }
  }, [isOpen]);
  const loadDNAStatus = async () => {
    try {
      console.log("🧬 [DNAModal] Loading DNA status from Firestore...");
      const firestoreData = await firestoreService.get("dnaAnalysis");
      let dnaData = firestoreData;
      console.log("🧬 [DNAModal] Firestore data:", firestoreData ? "FOUND" : "EMPTY");
      if (!dnaData) {
        console.log("🧬 [DNAModal] Falling back to localStorage");
        dnaData = JSON.parse(localStorage.getItem("dnaAnalysis") || "null");
      }
      if (dnaData && dnaData.traits) {
        setDnaStatus({
          uploaded: true,
          traits: Object.keys(dnaData.traits).length,
          recommendations: dnaData.recommendations?.length || 0
        });
      }
    } catch (error) {
    }
  };
  if (!isOpen) return null;
  if (showDNAUpload) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DNAUpload, { isOpen: true, onClose: () => {
      setShowDNAUpload(false);
      onClose();
    } });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🧬 DNA Analysis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-hero", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-icon", children: "🧬" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Personalized Health Insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Upload your DNA data for custom recommendations" })
    ] }),
    dnaStatus.uploaded ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-status-cards", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "card-icon", children: "✅" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "card-number", children: dnaStatus.traits }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "card-label", children: "Traits Analyzed" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "card-icon", children: "💡" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "card-number", children: dnaStatus.recommendations }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "card-label", children: "Recommendations" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-action-btn", onClick: () => setShowDNAUpload(true), children: "📊 View Full Report" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-benefits", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benefit-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-icon", children: "🎯" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-text", children: "Personalized nutrition plans" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benefit-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-icon", children: "💪" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-text", children: "Optimized workout routines" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benefit-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-icon", children: "🧘" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-text", children: "Stress management insights" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benefit-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-icon", children: "😴" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "benefit-text", children: "Sleep quality optimization" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-action-btn", onClick: () => setShowDNAUpload(true), children: "📤 Upload DNA File" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dna-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "🔒 Your DNA data is encrypted and never shared" }) })
  ] }) });
}
export {
  DNAModal as default
};
