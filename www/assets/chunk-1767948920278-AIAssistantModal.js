const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css","assets/chunk-1767948920166-index.js"])))=>i.map(i=>d[i]);
import { r as reactExports, P as Preferences, _ as __vitePreload, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function AIAssistantModal({ userName, initialPrompt, onClose }) {
  const [isListening, setIsListening] = reactExports.useState(false);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [isSpeaking, setIsSpeaking] = reactExports.useState(false);
  const [textInput, setTextInput] = reactExports.useState("");
  const [isTextMode, setIsTextMode] = reactExports.useState(false);
  const [messages, setMessages] = reactExports.useState([
    { type: "ai", text: `Hey ${userName}! I'm here to help. What's on your mind?` }
  ]);
  const [conversationStartTime] = reactExports.useState(Date.now());
  const [conversationTopic, setConversationTopic] = reactExports.useState(null);
  const [hasTrackedConversation, setHasTrackedConversation] = reactExports.useState(false);
  const conversationTopicRef = reactExports.useRef(null);
  const hasTrackedConversationRef = reactExports.useRef(false);
  const messagesRef = reactExports.useRef([]);
  reactExports.useEffect(() => {
    conversationTopicRef.current = conversationTopic;
  }, [conversationTopic]);
  reactExports.useEffect(() => {
    hasTrackedConversationRef.current = hasTrackedConversation;
  }, [hasTrackedConversation]);
  reactExports.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  reactExports.useEffect(() => {
    if (initialPrompt) {
      setTimeout(() => {
        processUserMessage(initialPrompt, true);
      }, 300);
    }
  }, [initialPrompt]);
  reactExports.useEffect(() => {
    return () => {
      if (hasTrackedConversationRef.current && conversationTopicRef.current) {
        const durationMs = Date.now() - conversationStartTime;
        const durationMinutes = Math.ceil(durationMs / 6e4);
        const chatEntry = {
          topic: conversationTopicRef.current,
          duration: durationMinutes,
          timestamp: Date.now(),
          date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
          messages: messagesRef.current.length
        };
        (async () => {
          try {
            const { value: minutesStr } = await Preferences.get({ key: "voice_minutes" });
            const totalMinutes = parseInt(minutesStr || "0");
            await Preferences.set({ key: "voice_minutes", value: (totalMinutes + durationMinutes).toString() });
            const { value: topicsStr } = await Preferences.get({ key: "voice_topics" });
            const topicsCount = parseInt(topicsStr || "0");
            await Preferences.set({ key: "voice_topics", value: (topicsCount + 1).toString() });
            const { value: recentChatsStr } = await Preferences.get({ key: "recent_voice_chats" });
            const recentChats = recentChatsStr ? JSON.parse(recentChatsStr) : [];
            recentChats.unshift(chatEntry);
            if (recentChats.length > 50) recentChats.pop();
            await Preferences.set({ key: "recent_voice_chats", value: JSON.stringify(recentChats) });
            if (false) ;
            const { default: firestoreService } = await __vitePreload(async () => {
              const { default: firestoreService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a5);
              return { default: firestoreService2 };
            }, true ? __vite__mapDeps([0,1]) : void 0);
            const { default: authService } = await __vitePreload(async () => {
              const { default: authService2 } = await import("./entry-1767948920134-index.js").then((n) => n.a7);
              return { default: authService2 };
            }, true ? __vite__mapDeps([0,1]) : void 0);
            const userId = authService.getCurrentUser()?.uid;
            if (userId) {
              const existingChats = await firestoreService.get("aiChatHistory", userId) || [];
              existingChats.unshift(chatEntry);
              if (existingChats.length > 100) existingChats.pop();
              await firestoreService.save("aiChatHistory", existingChats, userId);
              await firestoreService.save("voiceStats", {
                totalMinutes: totalMinutes + durationMinutes,
                totalTopics: topicsCount + 1,
                lastUpdated: Date.now()
              }, userId);
              if (false) ;
            }
          } catch (error) {
          }
        })();
      }
    };
  }, [hasTrackedConversation, conversationTopic, conversationStartTime, messages]);
  const startListening = async () => {
    setIsListening(true);
    try {
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        if (false) ;
        const SpeechRecognition2 = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition2();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (false) ;
          setIsListening(false);
          processUserMessage(transcript);
        };
        recognition.onerror = (event) => {
          if (false) ;
          setIsListening(false);
          setMessages((prev) => [...prev, {
            type: "ai",
            text: "I couldn't hear you. Try typing instead!"
          }]);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognition.start();
        return;
      }
      if (false) ;
      const { SpeechRecognition } = await __vitePreload(async () => {
        const { SpeechRecognition: SpeechRecognition2 } = await import("./chunk-1767948920166-index.js");
        return { SpeechRecognition: SpeechRecognition2 };
      }, true ? __vite__mapDeps([2,0,1]) : void 0);
      try {
        const availCheck = await SpeechRecognition.available();
        if (false) ;
        if (!availCheck.available) {
          throw new Error("Speech recognition not available");
        }
      } catch (availError) {
        if (false) ;
        throw new Error("Speech not supported");
      }
      try {
        const permResult = await SpeechRecognition.requestPermissions();
        if (false) ;
        if (permResult.speechRecognition !== "granted") {
          alert("Please allow microphone access in your phone settings");
          setIsListening(false);
          return;
        }
      } catch (permError) {
        if (false) ;
        alert("Microphone permission required. Please enable it in Settings.");
        setIsListening(false);
        return;
      }
      try {
        await SpeechRecognition.removeAllListeners();
      } catch (e) {
        if (false) ;
      }
      let hasReceivedResult = false;
      SpeechRecognition.addListener("error", (error) => {
        if (false) ;
        if (!hasReceivedResult) {
          setMessages((prev) => [...prev, {
            type: "ai",
            text: "I couldn't hear you clearly. Please try again or use the suggestion buttons below!"
          }]);
          setIsListening(false);
        }
      });
      SpeechRecognition.addListener("result", async (data) => {
        if (false) ;
        hasReceivedResult = true;
        if (data.matches && data.matches.length > 0) {
          const userText = data.matches[0];
          setMessages((prev) => [...prev, { type: "user", text: userText }]);
          setIsListening(false);
          setIsProcessing(true);
          try {
            await SpeechRecognition.stop();
          } catch (e) {
            if (false) ;
          }
          setIsTextMode(false);
          try {
            const geminiService = (await __vitePreload(async () => {
              const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.ae);
              return { default: __vite_default__ };
            }, true ? __vite__mapDeps([0,1]) : void 0)).default;
            const user = JSON.parse(localStorage.getItem("wellnessai_user") || "{}");
            const response = await geminiService.chat(userText, {
              allergens: user.profile?.allergens || [],
              dietaryPreferences: user.profile?.dietaryPreferences || [],
              healthGoals: user.profile?.healthGoals || []
            });
            setMessages((prev) => [...prev, { type: "ai", text: response }]);
            await speakText(response);
          } catch (error) {
            if (false) ;
            setMessages((prev) => [...prev, {
              type: "ai",
              text: "Oops! I had trouble with that. Can you try asking in a different way?"
            }]);
          }
          setIsProcessing(false);
        } else {
          setIsListening(false);
        }
      });
      if (false) ;
      await SpeechRecognition.start({
        language: "en-US",
        maxResults: 5,
        prompt: "Speak now",
        partialResults: false,
        popup: true
      });
      if (false) ;
      setTimeout(async () => {
        if (!hasReceivedResult) {
          try {
            await SpeechRecognition.stop();
            setMessages((prev) => [...prev, {
              type: "ai",
              text: "I didn't catch that. Try speaking again or use the suggestion buttons!"
            }]);
          } catch (e) {
            if (false) ;
          }
          setIsListening(false);
        }
      }, 1e4);
    } catch (error) {
      setMessages((prev) => [...prev, {
        type: "ai",
        text: `Voice input not available right now 😔 But I can still help! Try clicking the suggestion buttons below or typing your question.`
      }]);
      setIsListening(false);
    }
  };
  const stopListening = async () => {
    try {
      const { SpeechRecognition } = await __vitePreload(async () => {
        const { SpeechRecognition: SpeechRecognition2 } = await import("./chunk-1767948920166-index.js");
        return { SpeechRecognition: SpeechRecognition2 };
      }, true ? __vite__mapDeps([2,0,1]) : void 0);
      await SpeechRecognition.stop();
      await SpeechRecognition.removeAllListeners();
    } catch (error) {
    }
    setIsListening(false);
  };
  const speakText = async (text) => {
    try {
      const { TextToSpeech } = await __vitePreload(async () => {
        const { TextToSpeech: TextToSpeech2 } = await import("./entry-1767948920134-index.js").then((n) => n.aa);
        return { TextToSpeech: TextToSpeech2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      setIsSpeaking(true);
      await TextToSpeech.speak({
        text,
        lang: "en-US",
        rate: 1,
        pitch: 1,
        volume: 1,
        category: "ambient"
      });
      setIsSpeaking(false);
    } catch (error) {
      setIsSpeaking(false);
    }
  };
  const processUserMessage = async (userText, skipVoice = false) => {
    const isDevMode = localStorage.getItem("helio_dev_mode") === "true";
    if (!isDevMode) {
      const limit = window.subscriptionService?.checkLimit("aiMessages");
      if (limit && !limit.allowed) {
        setMessages((prev) => [
          ...prev,
          { type: "user", text: userText },
          {
            type: "ai",
            text: `🔒 Daily AI Message Limit Reached!

You've used all ${limit.limit} free messages today.

Upgrade to continue chatting:
💪 Starter £6.99/mo - Unlimited AI chat
⭐ Premium £16.99/mo - 50 messages/day + DNA + Avatar
👑 Ultimate £34.99/mo - UNLIMITED messages + VIP Support

Your limit resets at midnight! 🌙`
          }
        ]);
        setIsProcessing(false);
        return;
      }
    }
    setMessages((prev) => [...prev, { type: "user", text: userText }]);
    setIsProcessing(true);
    try {
      if (false) ;
      const geminiService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.ae);
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([0,1]) : void 0)).default;
      if (false) ;
      const user = JSON.parse(localStorage.getItem("wellnessai_user") || "{}");
      if (false) ;
      const response = await geminiService.chat(userText, {
        allergens: user.profile?.allergens || [],
        dietaryPreferences: user.profile?.dietaryPreferences || [],
        healthGoals: user.profile?.healthGoals || []
      });
      if (false) ;
      setMessages((prev) => [...prev, { type: "ai", text: response }]);
      if (!hasTrackedConversation) {
        ;
        (async () => {
          try {
            const { value: conversationsStr } = await Preferences.get({ key: "voice_conversations" });
            const conversations = parseInt(conversationsStr || "0");
            await Preferences.set({ key: "voice_conversations", value: (conversations + 1).toString() });
            if (false) ;
          } catch (error) {
            if (false) ;
          }
        })();
        setHasTrackedConversation(true);
        if (window.addPoints) {
          window.addPoints(15, { x: window.innerWidth / 2, y: 100 });
          if (false) ;
        }
        if (false) ;
      }
      if (!conversationTopic) {
        const topic = userText.length > 50 ? userText.substring(0, 50) + "..." : userText;
        setConversationTopic(topic);
        if (false) ;
      }
      if (!isDevMode && window.subscriptionService) {
        window.subscriptionService.incrementUsage("aiMessages");
        const newLimit = window.subscriptionService.checkLimit("aiMessages");
        if (false) ;
      }
      if (!skipVoice) {
        await speakText(response);
      } else {
        if (false) ;
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        type: "ai",
        text: "There was an error. Please check your internet connection and try again."
      }]);
      await speakText("There was an error. Please check your internet connection and try again.");
    }
    setIsProcessing(false);
  };
  const handleSuggestionClick = (text) => {
    setIsTextMode(false);
    processUserMessage(text, false);
  };
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      setIsTextMode(true);
      processUserMessage(textInput, true);
      setTextInput("");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-assistant-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-assistant-modal-content", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ai-assistant-modal-close", onClick: onClose, children: "×" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-assistant-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "💬 AI Voice Coach" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Just talk to me like a friend" }),
      (() => {
        const isDevMode = localStorage.getItem("helio_dev_mode") === "true";
        if (isDevMode) return null;
        const limit = window.subscriptionService?.checkLimit("aiMessages");
        if (limit && !window.subscriptionService?.hasAccess("aiVoiceCoach")) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-assistant-limit-badge", style: {
            background: limit.remaining <= 1 ? "rgba(255, 68, 68, 0.2)" : "rgba(139, 95, 232, 0.2)",
            color: limit.remaining <= 1 ? "#FF4444" : "#C084FC",
            border: `2px solid ${limit.remaining <= 1 ? "#FF4444" : "rgba(139, 95, 232, 0.4)"}`
          }, children: limit.remaining > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "💬 ",
            limit.remaining,
            "/",
            limit.limit,
            " messages left today"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "🔒 Daily limit reached - Upgrade for unlimited!" }) });
        }
        return null;
      })()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-assistant-messages", children: [
      messages.map((msg, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `ai-assistant-message ${msg.type}`,
          onClick: () => msg.type === "ai" && speakText(msg.text),
          title: msg.type === "ai" ? "Click to hear again" : "",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "message-icon", children: msg.type === "ai" ? "✨" : "👤" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: msg.text })
          ]
        },
        idx
      )),
      isProcessing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-assistant-message ai loading-message", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "message-icon", children: "✨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "typing-indicator", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", {})
          ] }),
          "Thinking..."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: `ai-assistant-voice-button ${isListening ? "listening" : ""}`,
        onClick: isListening ? stopListening : startListening,
        disabled: isProcessing,
        children: isListening ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-ring" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "voice-icon", children: "🎙️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "I'm listening..." })
        ] }) : isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "voice-icon", children: "⏳" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Processing..." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "voice-icon", children: "🎤" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Tap to talk" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "ai-assistant-text-input", onSubmit: handleTextSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: textInput,
          onChange: (e) => setTextInput(e.target.value),
          placeholder: "Or type your message...",
          disabled: isProcessing || isListening,
          className: "text-input-field"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          className: "text-send-btn",
          disabled: !textInput.trim() || isProcessing || isListening,
          children: "Send 📤"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-assistant-suggestions", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "suggestions-label", children: "Or try these quick questions:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "suggestion-chip",
          onClick: () => handleSuggestionClick("What should I eat for lunch?"),
          disabled: isListening || isProcessing,
          children: '"What should I eat for lunch?"'
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "suggestion-chip",
          onClick: () => handleSuggestionClick("How am I doing today?"),
          disabled: isListening || isProcessing,
          children: '"How am I doing today?"'
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "suggestion-chip",
          onClick: () => handleSuggestionClick("Show me my progress"),
          disabled: isListening || isProcessing,
          children: '"Show me my progress"'
        }
      )
    ] }),
    isSpeaking && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "speaking-indicator", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "speaker-icon", children: "🔊" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "AI is speaking..." })
    ] })
  ] }) });
}
export {
  AIAssistantModal as default
};
