import { r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import { u as usePointsPopup } from "./chunk-1767948920275-PointsPopup.js";
function VoiceTabRedesign({ userName, onOpenVoiceChat, onOpenAIAssistant }) {
  const { PopupsRenderer } = usePointsPopup();
  const [stats, setStats] = reactExports.useState({ conversations: 0, minutesTalked: 0, topicsDiscussed: 0 });
  const [recentChats, setRecentChats] = reactExports.useState([]);
  reactExports.useEffect(() => {
    loadStats();
    loadRecentChats();
  }, []);
  const loadStats = () => {
    const conversations = parseInt(localStorage.getItem("voice_conversations") || "0");
    const minutes = parseInt(localStorage.getItem("voice_minutes") || "0");
    const topics = parseInt(localStorage.getItem("voice_topics") || "0");
    setStats({ conversations, minutesTalked: minutes, topicsDiscussed: topics });
  };
  const loadRecentChats = () => {
    const saved = localStorage.getItem("recent_voice_chats");
    if (saved) {
      setRecentChats(JSON.parse(saved));
    }
  };
  const handleQuickAction = (action) => {
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge("voice_chat", 1);
    }
    const conversations = parseInt(localStorage.getItem("voice_conversations") || "0");
    localStorage.setItem("voice_conversations", (conversations + 1).toString());
    if (onOpenVoiceChat) {
      onOpenVoiceChat(action.prompt);
    }
  };
  const quickActions = [
    { icon: "💪", label: "Workout Coach", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", prompt: "Help me with a workout plan" },
    { icon: "🍽️", label: "Meal Guide", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", prompt: "Give me healthy meal suggestions" },
    { icon: "🧠", label: "Mental Health", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", prompt: "I need mental health support" },
    { icon: "😴", label: "Sleep Tips", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", prompt: "Help me sleep better" },
    { icon: "🩺", label: "Check Symptoms", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", prompt: "I want to check my symptoms" },
    { icon: "❤️", label: "Ask Health", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", prompt: "I have a health question" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "voice-tab-redesign", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopupsRenderer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "full-ai-chat-button", onClick: onOpenAIAssistant, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-button-icon", children: "💬" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-button-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-button-title", children: "Full AI Chat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-button-subtitle", children: "Voice & text with AI assistant" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-button-arrow", children: "→" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "voice-stats-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "🎤 Voice Assistant Stats" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-grid-top", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.conversations }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Conversations" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.minutesTalked }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Minutes Talked" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: stats.topicsDiscussed }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Topics Discussed" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-actions-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "Quick Actions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "quick-actions-grid", children: quickActions.map((action, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "voice-action-button",
          style: { background: action.gradient },
          onClick: () => handleQuickAction(action),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "action-icon", children: action.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "action-label", children: action.label })
          ]
        },
        idx
      )) })
    ] }),
    recentChats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recent-chats-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "section-title", children: "Recent Conversations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recent-chats-list", children: recentChats.slice(0, 5).map((chat, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-icon", children: "💬" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-topic", children: chat.topic }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-time", children: chat.time })
        ] })
      ] }, idx)) })
    ] })
  ] });
}
export {
  VoiceTabRedesign as default
};
