const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, g as gamificationService, _ as __vitePreload } from "./entry-1767948920134-index.js";
function GratitudeJournalModal({ onClose }) {
  const [view, setView] = reactExports.useState("list");
  const [entries, setEntries] = reactExports.useState([]);
  const [currentEntry, setCurrentEntry] = reactExports.useState("");
  const [selectedEntry, setSelectedEntry] = reactExports.useState(null);
  const [prompts] = reactExports.useState([
    "🌟 What made you smile today?",
    "💝 Who are you thankful for right now?",
    "🎯 What achievement are you proud of?",
    "🌈 What brought you joy recently?",
    "💪 What strength did you discover in yourself?",
    "🙏 What simple pleasure are you grateful for?",
    "✨ What opportunity came your way?",
    "❤️ What act of kindness touched you?"
  ]);
  const [currentPrompt, setCurrentPrompt] = reactExports.useState(prompts[Math.floor(Math.random() * prompts.length)]);
  reactExports.useEffect(() => {
    loadEntries();
  }, []);
  const loadEntries = () => {
    const saved = localStorage.getItem("wellnessai_gratitude");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  };
  const saveEntry = async () => {
    if (!currentEntry.trim()) return;
    const newEntry = {
      id: Date.now(),
      text: currentEntry,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      prompt: currentPrompt
    };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem("wellnessai_gratitude", JSON.stringify(updatedEntries));
    gamificationService.addXP(10, "Gratitude Entry");
    try {
      const brainLearningService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a6);
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([0,1]) : void 0)).default;
      await brainLearningService.trackMood(8, {
        triggers: ["gratitude_journal", currentPrompt],
        activities: ["journaling", "reflection", "gratitude"],
        socialInteraction: false,
        sleepQuality: 7,
        exerciseToday: false,
        weather: "indoor"
      });
      await brainLearningService.trackStress(3, {
        workRelated: false,
        personalRelated: false,
        copingMechanism: "gratitude_journaling",
        duration: 5,
        resolved: true
      });
      if (false) ;
    } catch (error) {
      console.error("❌ [BRAIN.JS] Failed to track gratitude journal:", error);
    }
    setCurrentEntry("");
    setView("list");
    alert("✨ Gratitude entry saved! +10 XP");
  };
  const deleteEntry = (id) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem("wellnessai_gratitude", JSON.stringify(updatedEntries));
    setSelectedEntry(null);
  };
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const today = /* @__PURE__ */ new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    }
  };
  if (view === "list") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999999,
      padding: "20px"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      borderRadius: "25px",
      padding: "30px",
      maxWidth: "500px",
      width: "100%",
      maxHeight: "85vh",
      overflowY: "auto",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      border: "2px solid rgba(255, 184, 77, 0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { color: "white", fontSize: "28px", margin: 0 }, children: "📝 Gratitude Journal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, style: {
          background: "rgba(255, 255, 255, 0.1)",
          border: "none",
          color: "white",
          fontSize: "28px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer"
        }, children: "×" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#888", marginBottom: "20px", fontSize: "14px" }, children: "Daily gratitude practice improves mental health and happiness. Write what you're thankful for and earn XP!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("write"), style: {
        width: "100%",
        padding: "18px",
        background: "linear-gradient(135deg, #FFB84D, #FF9500)",
        border: "none",
        borderRadius: "15px",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold",
        cursor: "pointer",
        marginBottom: "25px",
        boxShadow: "0 5px 20px rgba(255, 184, 77, 0.4)"
      }, children: "✍️ Write New Entry (+10 XP)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
        marginBottom: "25px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          background: "rgba(255, 184, 77, 0.1)",
          border: "1px solid rgba(255, 184, 77, 0.3)",
          borderRadius: "15px",
          padding: "15px",
          textAlign: "center"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "32px", fontWeight: "bold", color: "#FFD700" }, children: entries.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", color: "#888" }, children: "Total Entries" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          background: "rgba(255, 184, 77, 0.1)",
          border: "1px solid rgba(255, 184, 77, 0.3)",
          borderRadius: "15px",
          padding: "15px",
          textAlign: "center"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "32px", fontWeight: "bold", color: "#FFD700" }, children: entries.length * 10 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", color: "#888" }, children: "XP Earned" })
        ] })
      ] }),
      entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        textAlign: "center",
        padding: "40px 20px",
        color: "#888"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "64px", marginBottom: "15px" }, children: "🌟" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "16px" }, children: "No entries yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px" }, children: "Start your gratitude journey today!" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { color: "white", fontSize: "18px", marginBottom: "10px" }, children: "Your Gratitude Entries" }),
        entries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setSelectedEntry(entry);
              setView("view");
            },
            style: {
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "15px",
              padding: "15px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.3s ease"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
              e.currentTarget.style.borderColor = "#FFB84D";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#FFB84D", fontSize: "11px", marginBottom: "8px" }, children: formatDate(entry.date) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                color: "white",
                fontSize: "14px",
                lineHeight: "1.5",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical"
              }, children: entry.text })
            ]
          },
          entry.id
        ))
      ] })
    ] }) });
  }
  if (view === "write") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999999,
      padding: "20px"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      borderRadius: "25px",
      padding: "30px",
      maxWidth: "500px",
      width: "100%",
      maxHeight: "85vh",
      overflowY: "auto",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      border: "2px solid rgba(255, 184, 77, 0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("list"), style: {
        background: "rgba(255, 255, 255, 0.1)",
        border: "none",
        color: "white",
        fontSize: "14px",
        padding: "8px 16px",
        borderRadius: "20px",
        cursor: "pointer",
        marginBottom: "20px"
      }, children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: "25px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "60px" }, children: "🙏" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { color: "white", fontSize: "24px", margin: "10px 0" }, children: "What are you grateful for?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: "rgba(255, 184, 77, 0.1)",
        border: "1px solid rgba(255, 184, 77, 0.3)",
        borderRadius: "15px",
        padding: "15px",
        marginBottom: "20px",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#FFD700", fontSize: "16px", fontWeight: "bold" }, children: currentPrompt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]), style: {
          background: "none",
          border: "none",
          color: "#888",
          fontSize: "12px",
          cursor: "pointer",
          marginTop: "8px"
        }, children: "🔄 Different prompt" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: currentEntry,
          onChange: (e) => setCurrentEntry(e.target.value),
          placeholder: "Write what you're grateful for... Be specific and heartfelt. How does this make you feel?",
          style: {
            width: "100%",
            minHeight: "200px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "15px",
            padding: "15px",
            color: "white",
            fontSize: "16px",
            fontFamily: "inherit",
            resize: "vertical",
            marginBottom: "20px"
          },
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", color: "#888", fontSize: "12px", marginBottom: "20px" }, children: [
        currentEntry.length,
        " characters"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: saveEntry, disabled: !currentEntry.trim(), style: {
        width: "100%",
        padding: "18px",
        background: currentEntry.trim() ? "linear-gradient(135deg, #FFB84D, #FF9500)" : "rgba(255, 255, 255, 0.1)",
        border: "none",
        borderRadius: "15px",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold",
        cursor: currentEntry.trim() ? "pointer" : "not-allowed",
        opacity: currentEntry.trim() ? 1 : 0.5,
        boxShadow: currentEntry.trim() ? "0 5px 20px rgba(255, 184, 77, 0.4)" : "none"
      }, children: "💾 Save Entry & Earn +10 XP" })
    ] }) });
  }
  if (view === "view" && selectedEntry) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999999,
      padding: "20px"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      borderRadius: "25px",
      padding: "30px",
      maxWidth: "500px",
      width: "100%",
      maxHeight: "85vh",
      overflowY: "auto",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      border: "2px solid rgba(255, 184, 77, 0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("list"), style: {
        background: "rgba(255, 255, 255, 0.1)",
        border: "none",
        color: "white",
        fontSize: "14px",
        padding: "8px 16px",
        borderRadius: "20px",
        cursor: "pointer",
        marginBottom: "20px"
      }, children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", marginBottom: "20px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "60px" }, children: "✨" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        color: "#FFB84D",
        fontSize: "13px",
        textAlign: "center",
        marginBottom: "20px"
      }, children: formatDate(selectedEntry.date) }),
      selectedEntry.prompt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        background: "rgba(255, 184, 77, 0.1)",
        border: "1px solid rgba(255, 184, 77, 0.3)",
        borderRadius: "15px",
        padding: "12px",
        marginBottom: "20px",
        textAlign: "center",
        color: "#FFD700",
        fontSize: "14px"
      }, children: selectedEntry.prompt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "15px",
        padding: "20px",
        marginBottom: "20px"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
        color: "white",
        fontSize: "16px",
        lineHeight: "1.7",
        margin: 0,
        whiteSpace: "pre-wrap"
      }, children: selectedEntry.text }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        if (confirm("Are you sure you want to delete this entry?")) {
          deleteEntry(selectedEntry.id);
          setView("list");
        }
      }, style: {
        width: "100%",
        padding: "15px",
        background: "rgba(255, 68, 68, 0.2)",
        border: "1px solid rgba(255, 68, 68, 0.5)",
        borderRadius: "12px",
        color: "#FF6B6B",
        fontSize: "14px",
        cursor: "pointer"
      }, children: "🗑️ Delete Entry" })
    ] }) });
  }
}
export {
  GratitudeJournalModal as default
};
