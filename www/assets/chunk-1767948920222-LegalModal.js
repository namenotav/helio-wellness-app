import { r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const LegalModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = reactExports.useState("manual");
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legal-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-modal-content", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "legal-close-btn", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "legal-title", children: "Legal Information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-tabs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `legal-tab ${activeTab === "manual" ? "active" : ""}`,
          onClick: () => setActiveTab("manual"),
          children: "📖 User Manual"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `legal-tab ${activeTab === "terms" ? "active" : ""}`,
          onClick: () => setActiveTab("terms"),
          children: "Terms of Service"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `legal-tab ${activeTab === "privacy" ? "active" : ""}`,
          onClick: () => setActiveTab("privacy"),
          children: "Privacy Policy"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `legal-tab ${activeTab === "gdpr" ? "active" : ""}`,
          onClick: () => setActiveTab("gdpr"),
          children: "GDPR Rights"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `legal-tab ${activeTab === "disclaimer" ? "active" : ""}`,
          onClick: () => setActiveTab("disclaimer"),
          children: "Medical Disclaimer"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `legal-tab ${activeTab === "cookies" ? "active" : ""}`,
          onClick: () => setActiveTab("cookies"),
          children: "Cookie Policy"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-content", children: [
      activeTab === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsx(UserManual, {}),
      activeTab === "terms" && /* @__PURE__ */ jsxRuntimeExports.jsx(TermsOfService, {}),
      activeTab === "privacy" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyPolicy, {}),
      activeTab === "gdpr" && /* @__PURE__ */ jsxRuntimeExports.jsx(GDPRRights, {}),
      activeTab === "disclaimer" && /* @__PURE__ */ jsxRuntimeExports.jsx(MedicalDisclaimer, {}),
      activeTab === "cookies" && /* @__PURE__ */ jsxRuntimeExports.jsx(CookiePolicy, {})
    ] })
  ] }) });
};
const UserManual = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-section", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📖 Helio/WellnessAI User Manual" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-update", children: "Complete Guide to All Features" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Welcome to Helio/WellnessAI! This comprehensive guide will help you understand and use all the powerful features of your health and wellness companion." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🏠 1. Home Tab - Your Wellness Dashboard" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "The Home tab is your command center for daily health tracking and insights." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Greeting & Wellness Score" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Personalized Greeting:" }),
      " See your name and current time of day (morning/afternoon/evening)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Wellness Score:" }),
      " Overall health metric calculated from your activity, sleep, nutrition, and engagement"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Level & XP:" }),
      " Gamification system with 20 levels - earn XP by completing activities"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Quick Stats Cards" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Steps Counter:" }),
      " Real-time step tracking from your device's motion sensors"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Water Intake:" }),
      " Log water cups throughout the day (goal: 8 cups)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Meals Logged:" }),
      " Track breakfast, lunch, dinner for complete nutrition"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Streak Counter:" }),
      " Days in a row you've hit your goals - stay motivated!"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Weekly Step History" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Visual bar chart showing last 7 days of step counts" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Today highlighted with special styling" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Tap any day to see detailed breakdown" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Activity Pulse 💓" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What it is:" }),
    " Real-time feed of all your recent activities with XP rewards"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to use:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Click "Activity Pulse" card to see full modal' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "View all activities: steps, workouts, food, water, sleep, meditation, gratitude" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Each activity shows: emoji icon, description, time, and XP earned" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "See your total XP and progress to next level" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Activities update in real-time as you log them" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Today's Journey 📖" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What it is:" }),
    " Chronological summary of everything you've done today"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Features:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Automatic activity logging with timestamps" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "XP totals for each activity type" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Motivational messages based on your progress" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Empty state if no activities yet - encourages you to start!" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Killer Features Section ⚡" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Quick access buttons to premium features:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🧬 DNA Analysis:" }),
      " Upload 23andMe files for personalized genetic insights"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "📸 AR Food Scanner:" }),
      " Point camera at food to identify and log nutrition"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🏃 Social Battles:" }),
      " Compete with friends in fitness challenges"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🤖 Health Avatar:" }),
      " Visual representation of your wellness journey"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🚨 Emergency Panel:" }),
      " Quick access to emergency contacts and SOS features"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🍽️ Meal Automation:" }),
      " AI-powered meal planning and prep suggestions"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "💰 Insurance Rewards:" }),
      " Coming Soon - Save money on health insurance"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🎤 2. Voice Tab - AI Coach" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your personal AI-powered health coach with voice interaction." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "AI Voice Coach Features" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tap to Talk:" }),
      " Hold the microphone button and speak your question"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Text Input:" }),
      " Type your message in the input field if you prefer typing"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Quick Questions:" }),
      ' Tap pre-written suggestions like "What should I eat for lunch?" or "How am I doing today?"'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Conversation History:" }),
      " Scroll through your chat history with timestamps"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Nicole Voice:" }),
      " Responses are spoken aloud using ElevenLabs Nicole voice"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Click to Replay:" }),
      " Tap any AI message (sparkle ✨ icon) to hear it again"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "What You Can Ask" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: '"What should I eat for lunch?" - Get meal suggestions based on your nutrition goals' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: '"How am I doing today?" - Get summary of your daily progress and wellness' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: '"Show me my progress" - See detailed stats and achievements' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: '"Give me a workout routine" - Get personalized exercise recommendations' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: '"I feel tired, what should I do?" - Get energy-boosting tips' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: '"Analyze my DNA results" - If you uploaded DNA, get genetic insights' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Any health, fitness, or nutrition question!" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "AI Limitations" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "⚠️ AI is NOT a doctor - always consult healthcare professionals" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Responses are general information, not personalized medical advice" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI can make mistakes - verify important information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Internet connection required for AI features" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "📸 3. Scan Tab - AI Vision Features" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Advanced computer vision for food tracking and health monitoring." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Food Scanner 🍕" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to use:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Tap the Scan tab at bottom" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Point your camera at any food item" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "App automatically identifies the food using AI" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "See nutritional breakdown: calories, protein, carbs, fats" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Adjust portion size (small/medium/large)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Tap "Log Food" to add to your daily nutrition tracking' })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What it recognizes:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fruits, vegetables, meats, grains" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Packaged foods with visible labels" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Restaurant meals and dishes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Snacks, desserts, beverages" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Over 10,000 food items in database" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "AR Scanner Features (Advanced)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Augmented Reality overlay on camera view" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Real-time nutritional information display" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Barcode scanning for packaged foods" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Ingredient analysis and allergen warnings" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🧘 4. Zen Tab - Mindfulness & Meditation" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your mental wellness sanctuary with multiple relaxation techniques." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Breathing Exercises 🫁" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5 Scientifically-Proven Patterns:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Box Breathing (4-4-4-4):" }),
      " Military technique for focus and stress relief - 4 sec inhale, 4 hold, 4 exhale, 4 hold"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "4-7-8 Relaxation:" }),
      " Fall asleep faster - 4 sec inhale, 7 hold, 8 exhale"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Coherent Breathing (5-5):" }),
      " Balance nervous system - 5 sec inhale, 5 exhale"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Energizing Breath (4-4-6-2):" }),
      " Boost energy naturally - quick pattern for morning"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Deep Relaxation (4-4-8-4):" }),
      " Maximum calm - longer exhales activate parasympathetic system"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to use:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Tap "Breathing Exercises" button' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Choose a pattern based on your goal" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Follow the visual circle animation (expand = inhale, contract = exhale)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Listen to Nicole's voice guidance for perfect timing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Complete 5-10 cycles for best results" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Earn XP for each session!" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Stress Relief Techniques 😌" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "7 Professional Relaxation Methods:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Progressive Muscle Relaxation (PMR):" }),
      " Tense and release muscle groups systematically"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "4-7-8 Breathing:" }),
      " Quick stress reset in 2 minutes"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Body Scan Meditation:" }),
      " Mental journey through your body to release tension"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Autogenic Training:" }),
      " Self-hypnosis for deep relaxation"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5-4-3-2-1 Grounding:" }),
      " Anxiety relief using your 5 senses"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Mindful Breathing:" }),
      " Focus on breath to calm racing thoughts"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Safe Place Visualization:" }),
      " Imagine your perfect peaceful sanctuary"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Each technique includes:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Audio guidance with Nicole's soothing voice" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Written step-by-step instructions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Highlighted current step during practice" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "3-10 minute duration options" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Guided Meditation 🧘‍♀️" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "8 Empowering Meditations:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Morning Energy Boost:" }),
      " Start your day with power and positivity"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Inner Power Activation:" }),
      " Connect with your core strength"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Confidence Builder:" }),
      " Overcome self-doubt and fears"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Quick Energy Reset:" }),
      " 5-minute recharge for busy days"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Warrior Mindset:" }),
      " Mental toughness and resilience"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Chakra Activation:" }),
      " Balance your energy centers"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Positive Affirmation Practice:" }),
      " Rewire your mindset"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Mountain Strength:" }),
      " Embody stability and unshakeable peace"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Features:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "5-15 minute guided sessions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Background music and nature sounds" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Audio + text instructions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Progress tracking with current step highlighting" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Earn meditation XP and achievements" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Gratitude Journal 📓" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Daily Gratitude Practice:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Write Entry:" }),
      " Express what you're thankful for (earn +10 XP per entry)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Random Prompts:" }),
      ' 8 inspiring prompts like "What made you smile today?" or "Who are you thankful for?"'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "View Entries:" }),
      " See all past gratitude entries with timestamps"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Edit & Delete:" }),
      " Manage your journal entries"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Character Counter:" }),
      " Track entry length (recommended 50-500 chars)"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Benefits:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Proven to increase happiness and reduce depression" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Improves sleep quality and relationships" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Builds resilience and positive mindset" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Creates lasting record of positive moments" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "👤 5. Me Tab - Profile & Settings" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Customize your experience and track your journey." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Profile Information" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Name & Photo:" }),
      " Personalize your profile"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Age, Height, Weight:" }),
      " Used for accurate calorie and fitness calculations"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fitness Goals:" }),
      " Weight loss, muscle gain, maintenance, or general health"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Activity Level:" }),
      " Sedentary, lightly active, moderately active, very active, athlete"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Full Statistics Modal 📊" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Comprehensive breakdown of all your health metrics:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Activity:" }),
      " Steps, workouts, active minutes, calories burned"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Nutrition:" }),
      " Calories consumed, macros (protein/carbs/fats), water intake"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sleep:" }),
      " Hours slept, sleep quality score, sleep patterns"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Mental Wellness:" }),
      " Meditation minutes, stress levels, mood tracking"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Gamification:" }),
      " Current level, total XP, achievements unlocked, streak days"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Weekly Trends:" }),
      " Charts showing your progress over time"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Settings ⚙️" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Notifications:" }),
      " Customize reminders for water, meals, exercise, meditation"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Theme:" }),
      " Choose color schemes (coming soon: dark mode)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Units:" }),
      " Metric (kg, cm) or Imperial (lbs, inches)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Privacy:" }),
      " Manage data sharing and permissions"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sync Settings:" }),
      " Connect to Apple Health or Google Fit"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Account Actions" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Export Data:" }),
      " Download all your data in JSON format"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Clear Cache:" }),
      " Free up storage space"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Delete Account:" }),
      " Permanently remove all data (cannot be undone)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Logout:" }),
      " Sign out of your account"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🎮 6. Gamification System" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Earn XP and level up by completing activities!" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "XP Earning Activities" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Steps:" }),
      " +1 XP per 1,000 steps"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Workouts:" }),
      " +50 XP per session"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Food Logging:" }),
      " +10 XP per meal"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Water Intake:" }),
      " +5 XP per cup"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sleep Tracking:" }),
      " +30 XP for 7+ hours"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Meditation:" }),
      " +25 XP per session"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Breathing Exercises:" }),
      " +15 XP per session"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Gratitude Journal:" }),
      " +10 XP per entry"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DNA Upload:" }),
      " +100 XP (one-time)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Streak Bonuses:" }),
      " +50 XP for 7-day streak, +100 XP for 30 days"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Levels & Milestones" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "20 Levels Total:" }),
      " From Beginner (Level 1) to Wellness Master (Level 20)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "XP Requirements:" }),
      " Level 1 = 0 XP, Level 2 = 100 XP, increasing progressively"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Level Up Rewards:" }),
      " Unlock new features, badges, and achievements"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Confetti Animation:" }),
      " Celebrate every level up with visual effects"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Achievements & Badges" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🏃 First Steps - Log your first 1,000 steps" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🍎 Nutrition Rookie - Log your first meal" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "💧 Hydration Hero - Drink 8 cups in one day" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "😴 Sleep Champion - Get 8+ hours of sleep" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🧘 Zen Master - Complete 10 meditation sessions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🔥 7-Day Streak - Stay consistent for a week" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "⚡ 30-Day Warrior - Complete 30-day streak" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🧬 DNA Explorer - Upload genetic data" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🧬 7. DNA Analysis Features" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Upload genetic data from 23andMe or similar services for personalized insights." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "How to Upload DNA Data" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Download your raw DNA file from 23andMe, Ancestry.com, or similar service" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Tap "DNA Analysis" button on Home tab' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Click "Upload DNA File"' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Select your .txt or .csv file" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Wait for analysis (takes 30-60 seconds)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "View your personalized genetic insights" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "DNA Insights Provided" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fitness Genetics:" }),
      " Muscle fiber type, endurance capacity, injury risk"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Nutrition Genetics:" }),
      " Lactose tolerance, caffeine metabolism, vitamin needs"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Health Risks:" }),
      " Predisposition to conditions (NOT diagnostic - informational only)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Ancestry & Traits:" }),
      " Eye color, hair type, taste preferences"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Personalized Recommendations:" }),
      " Diet and exercise plans based on your genes"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "⚠️ IMPORTANT DNA Disclaimers" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Results are for INFORMATIONAL PURPOSES ONLY - not medical diagnosis" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Genetic predisposition ≠ destiny - lifestyle matters more" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Always discuss results with genetic counselor or doctor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your DNA is NEVER sold to third parties" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data is encrypted and stored securely" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You can delete your DNA data anytime from settings" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🤝 8. Social Features" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Social Battles ⚔️" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Challenge Friends:" }),
      " Compete in step contests, workout challenges, and wellness battles"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Leaderboards:" }),
      " See who's leading in daily steps, weekly workouts, or monthly streaks"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Team Challenges:" }),
      " Join or create team challenges with multiple participants"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Friendly Trash Talk:" }),
      " Send motivational (or competitive) messages to friends"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Achievement Sharing:" }),
      " Share your wins on social media"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🚨 9. Emergency Features" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Emergency Panel" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Emergency Contacts:" }),
      " Quick dial your pre-configured emergency contacts"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SOS Button:" }),
      " Sends location and health data to emergency contacts"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Medical ID:" }),
      " Display critical medical information for first responders"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Allergy Alerts:" }),
      " Lists your allergies, medications, and conditions"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "💡 10. Tips for Getting the Most from Helio/WellnessAI" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Daily Routine Suggestions" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Morning (7-9 AM):" }),
      " Log breakfast, do 5-min energizing meditation, check your wellness score"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Midday (12-2 PM):" }),
      " Log lunch, take a walk (get those steps!), drink water"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Afternoon (3-4 PM):" }),
      " Quick breathing exercise for energy boost, scan and log snacks"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Evening (6-8 PM):" }),
      " Log dinner, do a workout, earn XP"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Night (9-10 PM):" }),
      " Gratitude journal entry, relaxation meditation, sleep tracking"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Maximize XP Gains" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Log EVERYTHING - food, water, activities all earn XP" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Complete daily challenges for bonus XP" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain your streak - consistency = big XP multipliers" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Try new features - first-time bonuses available" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Compete in social battles for competitive XP rewards" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Data Accuracy Tips" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Keep your phone with you during the day for accurate step counting" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Manually log workouts that don't involve phone (swimming, cycling)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Scan food immediately after meals for timely nutrition tracking" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Update your weight weekly for accurate calorie calculations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Enable location services for GPS-tracked outdoor activities" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🆘 11. Troubleshooting & FAQs" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Common Issues" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Steps not counting?" }),
      " Check phone permissions for motion sensors, keep phone with you, restart app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AI not responding?" }),
      " Check internet connection, verify you're not rate-limited, try again in few minutes"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Food scanner not working?" }),
      " Ensure good lighting, clean camera lens, hold phone steady"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Voice not playing?" }),
      " Check volume settings, verify Nicole voice files downloaded, restart app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Data not syncing?" }),
      " Check internet connection, log out and log back in, clear cache"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Performance Optimization" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Clear cache weekly: Settings → Clear Cache" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Export data monthly for backups" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Keep app updated to latest version" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Free up phone storage if app is slow" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Close and restart app if experiencing bugs" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "📞 12. Support & Contact" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Get Help" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email Support:" }),
      " support@wellnessai.app or support@helio.app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal Questions:" }),
      " legal@wellnessai.app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Privacy Concerns:" }),
      " privacy@wellnessai.app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Technical Issues:" }),
      " tech@wellnessai.app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Response Time:" }),
      " Within 24-48 hours for support requests"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Additional Resources" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Website: www.wellnessai.app" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Video Tutorials: YouTube channel (search "Helio WellnessAI")' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Community Forum: community.wellnessai.app" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Social Media: @HelioWellnessAI on Instagram, Twitter, Facebook" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🎉 Congratulations! You now know how to use every feature of Helio/WellnessAI. Start your wellness journey today and level up your health! Remember: consistency is key - small daily actions lead to big transformations. You've got this, Champion! 💪" }) })
] });
const TermsOfService = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-section", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Terms of Service" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-update", children: "Last Updated: November 30, 2025" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IMPORTANT LEGAL NOTICE: By using this application, you acknowledge that Helio/WellnessAI and all associated entities, developers, contractors, employees, and affiliates SHALL NOT BE HELD LIABLE for any damages, injuries, losses, or consequences of any kind resulting from your use of this application." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "1. Acceptance of Terms" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'By downloading, accessing, installing, or using Helio/WellnessAI (collectively referred to as "the App," "the Application," "the Service," or "the Platform"), you ("User," "you," or "your") explicitly accept, acknowledge, and agree to be legally bound by these Terms of Service ("Terms," "Agreement," or "TOS") in their entirety, without modification, reservation, or exception.' }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'These Terms constitute a legally binding contract between you and Helio/WellnessAI, its parent company, subsidiaries, affiliates, partners, licensors, service providers, contractors, employees, officers, directors, agents, and any related entities (collectively "Company," "we," "us," or "our").' }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IF YOU DO NOT AGREE TO ALL TERMS AND CONDITIONS SET FORTH IN THIS AGREEMENT, YOU MUST IMMEDIATELY CEASE ALL USE OF THE APPLICATION AND UNINSTALL IT FROM YOUR DEVICE. CONTINUED USE CONSTITUTES ACCEPTANCE OF ALL TERMS." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "2. Description of Service" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI is a wellness, fitness, and health information tracking application that provides various features including, but not strictly limited to:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Physical activity tracking, step counting, and movement monitoring" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Artificial Intelligence-powered health information, suggestions, and coaching (NOT medical advice)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Food recognition technology and nutritional information estimates" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA data file upload and algorithmic analysis for informational purposes only" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Guided meditation, breathing exercises, and relaxation techniques" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Gamification elements including points, levels, achievements, and social features" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sleep tracking estimates and wellness scoring" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Heart rate monitoring (estimates only, not medical-grade)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Water intake logging and reminders" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Emergency contact features and safety tools" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: 'DISCLAIMER: All services are provided "AS IS" and "AS AVAILABLE" without any warranties, representations, or guarantees of accuracy, reliability, completeness, or fitness for any particular purpose. Helio/WellnessAI makes NO WARRANTIES, express or implied, regarding service quality, uptime, data accuracy, or results.' }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "3. User Accounts and Registration" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "4. User Responsibilities" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You agree to:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide accurate, current, and complete information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain and promptly update your account information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Not impersonate any person or entity" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Not use the App for any illegal or unauthorized purpose" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Not interfere with or disrupt the App's functionality" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Not attempt to gain unauthorized access to any portion of the App" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "5. Health Data, DNA Information, and Critical Disclaimers" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You acknowledge and understand that you retain ownership rights to your health data and DNA information. However, by uploading, inputting, or allowing collection of such data through the App, you grant Helio/WellnessAI a worldwide, perpetual, irrevocable, royalty-free, non-exclusive license to use, process, analyze, store, and display this data solely for the purposes of:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Providing the core App functionality and features" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Generating personalized insights and recommendations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Improving AI algorithms and service quality (in anonymized, aggregated form)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Complying with legal obligations" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DNA DATA CRITICAL WARNINGS:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA analysis provided by Helio/WellnessAI is for INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Results are NOT clinical-grade, NOT FDA-approved, NOT diagnostically validated, and NOT intended for medical decision-making" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Helio/WellnessAI is NOT a clinical laboratory, NOT CLIA-certified, NOT accredited for diagnostic testing, and NOT staffed by medical geneticists" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA interpretations may be INCORRECT, INCOMPLETE, OUTDATED, or BASED ON LIMITED SCIENTIFIC EVIDENCE" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Genetic science is constantly evolving; today's interpretations may be contradicted by future research" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We NEVER sell your raw DNA data to third parties for commercial purposes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "However, we may share ANONYMIZED, AGGREGATED genetic data for research purposes without personal identifiers" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU ASSUME ALL RISKS associated with uploading DNA data. Helio/WellnessAI is NOT responsible for:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Psychological distress from genetic findings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Family relationship discoveries or disputes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Insurance or employment discrimination based on genetic information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data breaches involving your DNA data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Misuse of DNA data by third parties" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Legal or ethical implications of genetic testing in your jurisdiction" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "HEALTH DATA COLLECTION DISCLAIMER:" }),
    " All health metrics (steps, heart rate, sleep, calories, etc.) are ESTIMATES based on algorithms and sensors. Accuracy is NOT guaranteed. Helio/WellnessAI is not responsible for inaccuracies in tracking or resulting decisions based on this data."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "6. AI-Generated Content and Technology Limitations" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI utilizes third-party artificial intelligence services, including but not limited to Google's Gemini AI, for generating responses, recommendations, and insights. You acknowledge and agree to the following:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AI LIMITATIONS AND DISCLAIMERS:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No Medical Advice:" }),
      " AI-generated content is NOT medical advice, NOT clinical guidance, and NOT a substitute for consultation with licensed healthcare professionals"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Accuracy Not Guaranteed:" }),
      " AI can and does make mistakes, hallucinate information, provide outdated data, misinterpret context, or generate completely incorrect responses"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "General Information Only:" }),
      " AI responses are general in nature and cannot account for your unique medical history, current health status, medications, allergies, genetic factors, or individual circumstances"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Not Personalized Medical Care:" }),
      ' Despite claims of "personalization," AI cannot replicate the expertise, judgment, intuition, or ethical obligations of a licensed medical professional'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Training Data Limitations:" }),
      " AI is trained on historical data that may be biased, incomplete, culturally insensitive, or not representative of your demographic"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No Liability for AI Errors:" }),
      " Helio/WellnessAI is NOT responsible for any consequences resulting from following, relying upon, or acting on AI-generated recommendations"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Third-Party AI Services:" }),
      " We use Google Gemini AI, which is governed by Google's own terms. We have no control over Google's AI model, training data, algorithms, or accuracy"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AI May Malfunction:" }),
      " AI services may experience outages, errors, bugs, corrupted outputs, inappropriate responses, or complete failures"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOUR RESPONSIBILITIES WHEN USING AI FEATURES:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "ALWAYS verify AI-generated information with qualified healthcare providers before taking any action" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "NEVER rely solely on AI for urgent medical decisions or emergencies" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "NEVER use AI recommendations as a replacement for professional medical diagnosis or treatment" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "NEVER follow AI advice that contradicts your doctor's instructions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "ALWAYS exercise critical thinking and common sense when evaluating AI responses" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Understand that AI cannot see you, examine you, or truly understand your individual health situation" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BY USING AI FEATURES, YOU RELEASE Helio/WellnessAI AND GOOGLE LLC FROM ALL LIABILITY ARISING FROM AI-GENERATED CONTENT, INCLUDING INCORRECT, HARMFUL, MISLEADING, OR DANGEROUS INFORMATION." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "7. Subscription and Payments" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Some features may require a paid subscription. Subscription fees are charged in advance on a recurring basis. You can cancel your subscription at any time, but refunds are not provided for partial subscription periods." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "8. Intellectual Property" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "All content, features, and functionality of the App are owned by WellnessAI and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the App." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "9. Third-Party Services" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "The App may integrate with third-party services (e.g., Google Gemini AI, ElevenLabs voice). Your use of these services is subject to their respective terms and conditions." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "10. Limitation of Liability and Release of Claims" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Helio/WellnessAI, including all owners, shareholders, investors, parent companies, subsidiaries, affiliates, partners, licensors, service providers (including Google LLC for Gemini AI services, ElevenLabs for voice services, and any other third-party providers), officers, directors, employees, contractors, agents, attorneys, accountants, consultants, successors, and assigns (collectively "Released Parties") SHALL NOT BE LIABLE FOR ANY DAMAGES OR LOSSES OF ANY KIND, including but not limited to:' }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Direct damages:" }),
      " Including monetary losses, data loss, property damage, device damage, or any tangible losses"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Indirect damages:" }),
      " Including lost profits, lost opportunities, business interruption, loss of goodwill, or reputational harm"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Incidental damages:" }),
      " Including costs of procurement of substitute goods or services"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Consequential damages:" }),
      " Including any damages resulting from reliance on the App's information, recommendations, or features"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Punitive or exemplary damages:" }),
      " Under any legal theory"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Personal injury or death:" }),
      " Including injuries sustained during exercise, physical activity, or following App recommendations"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Health complications:" }),
      " Including adverse health outcomes, worsening of existing conditions, delayed diagnosis, misdiagnosis, medication interactions, allergic reactions, or any health deterioration"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Mental or emotional distress:" }),
      " Including anxiety, depression, stress, or psychological harm"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Data breaches or security incidents:" }),
      " Including unauthorized access, data theft, identity theft, or privacy violations"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Third-party actions:" }),
      " Including actions by other users, hackers, or external parties"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Force majeure events:" }),
      " Including natural disasters, pandemics, wars, terrorism, governmental actions, or other events beyond our control"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Service interruptions:" }),
      " Including downtime, data loss, corrupted files, or service unavailability"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Inaccurate information:" }),
      " Including AI errors, miscalculations, wrong nutritional data, incorrect DNA interpretations, or false health insights"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Reliance on App features:" }),
      " Including medical decisions made based on App data or recommendations"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "THIS LIMITATION OF LIABILITY APPLIES REGARDLESS OF THE LEGAL THEORY UPON WHICH LIABILITY IS BASED, INCLUDING BUT NOT LIMITED TO:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Breach of contract or warranty" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Negligence (including gross negligence)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Strict liability" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Product liability" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Tort (including misrepresentation)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Statutory liability" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Any other legal or equitable theory" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "EVEN IF Helio/WellnessAI HAS BEEN ADVISED OF, KNEW OF, OR SHOULD HAVE KNOWN OF THE POSSIBILITY OF SUCH DAMAGES." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "To the extent permitted by law, our total aggregate liability to you for all claims arising from or related to the App, under any cause of action or theory of liability, shall not exceed the LESSER of: (a) the total amount you paid to Helio/WellnessAI in subscription fees during the 12 months immediately preceding the claim, OR (b) $100 USD." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you paid no subscription fees, our total liability shall be ZERO DOLLARS ($0.00)." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "11. Indemnification and Hold Harmless Agreement" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS" }),
    " Helio/WellnessAI and all Released Parties (as defined above) from and against ANY AND ALL claims, demands, liabilities, costs, expenses, losses, damages, and attorney fees arising from or related to:"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your use or misuse of the App" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your violation of these Terms of Service" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your violation of any applicable laws, regulations, or third-party rights" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your health decisions made based on App data or recommendations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Injuries, illnesses, or health complications you experience" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your uploaded content, including DNA data, health information, or user-generated content" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your interactions with other users or third parties through the App" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Claims by third parties arising from your use of the App" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Any breach of your representations, warranties, or obligations under these Terms" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This indemnification obligation shall survive termination of these Terms and your use of the App." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "12. Assumption of Risk and Waiver" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU EXPRESSLY ACKNOWLEDGE, UNDERSTAND, AND AGREE THAT:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Use of Helio/WellnessAI involves inherent and unavoidable risks" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Physical activity and exercise recommended or tracked by the App carry risks of injury, including serious injury or death" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Reliance on health information, AI recommendations, or tracking data may lead to adverse health outcomes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA analysis may reveal disturbing or unwanted information about your health, ancestry, or family relationships" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data security cannot be guaranteed; your information may be compromised despite our security measures" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU VOLUNTARILY ASSUME ALL RISKS" }),
    " associated with using the App, including risks that are known and unknown, foreseen and unforeseen, and you agree that Helio/WellnessAI shall NOT be responsible for any injuries, damages, or losses you may sustain."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU HEREBY WAIVE, RELEASE, AND FOREVER DISCHARGE" }),
    " all Released Parties from any and all claims, demands, or causes of action arising from your use of the App, to the fullest extent permitted by law."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "13. Termination Rights" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI reserves the absolute right to terminate, suspend, restrict, or deny access to your account and the App, at any time, for any reason or no reason, with or without notice, and with or without cause. Grounds for termination include, but are not limited to:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Violation of these Terms of Service" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fraudulent, abusive, or illegal activity" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Harm to other users, the Company, or third parties" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Suspected security risks or account compromise" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Discontinuation of the Service or specific features" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Business or operational reasons" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Upon termination, you must immediately cease all use of the App and destroy all copies in your possession. Sections of these Terms that by their nature should survive termination shall survive, including but not limited to: disclaimers, limitations of liability, indemnification, and dispute resolution provisions." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NO REFUNDS:" }),
    " Subscription fees are non-refundable, even if your account is terminated before the subscription period ends, except where prohibited by law."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "14. Changes to Terms and Acceptance" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI reserves the right to modify, amend, update, or replace these Terms of Service at any time, at its sole discretion, without prior notice. Changes become effective immediately upon posting to the App or website. We may (but are not obligated to) notify users of material changes via:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "In-app notifications or alerts" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Email to your registered email address" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Posting to our website or social media" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOUR CONTINUED USE OF THE APP AFTER ANY CHANGES CONSTITUTES YOUR BINDING ACCEPTANCE OF THE REVISED TERMS." }),
    " If you do not agree to the revised Terms, you must immediately stop using the App and uninstall it from your device."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "It is YOUR responsibility to review these Terms periodically. We are not responsible for your failure to review updated Terms." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "15. Dispute Resolution, Arbitration, and Class Action Waiver" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BINDING ARBITRATION:" }),
    " Any dispute, controversy, or claim arising out of or relating to these Terms, the App, or your use thereof (including any claimed breach, termination, or interpretation) shall be resolved exclusively through binding arbitration, rather than in court, except where prohibited by law."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Arbitration shall be conducted by a single arbitrator under the rules of a recognized arbitration organization. The arbitrator's decision shall be final and binding, and judgment may be entered in any court of competent jurisdiction." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CLASS ACTION WAIVER:" }),
    " YOU AGREE THAT DISPUTES MUST BE BROUGHT SOLELY ON AN INDIVIDUAL BASIS AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "JURY TRIAL WAIVER:" }),
    " To the fullest extent permitted by law, you and Helio/WellnessAI waive any right to a trial by jury for any disputes."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "TIME LIMITATION ON CLAIMS:" }),
    " Any claim arising from use of the App must be filed within ONE (1) YEAR of the event giving rise to the claim, or the claim is permanently barred."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "16. Governing Law and Jurisdiction" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "These Terms shall be governed by and construed in accordance with the laws of [INSERT JURISDICTION], without regard to its conflict of law provisions. To the extent arbitration does not apply, you consent to the exclusive jurisdiction and venue of courts located in [INSERT JURISDICTION] for any legal proceedings." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you are located outside [INSERT JURISDICTION], you acknowledge that data may be transferred to and processed in countries with different data protection laws than your own. By using the App, you consent to such transfers." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "17. Severability and Entire Agreement" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court or arbitrator, such provision shall be modified to the minimum extent necessary to make it valid and enforceable. If modification is not possible, such provision shall be severed, and the remaining provisions shall continue in full force and effect." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'These Terms, together with our Privacy Policy, GDPR Rights, Medical Disclaimer, and Cookie Policy (collectively, the "Agreement"), constitute the entire agreement between you and Helio/WellnessAI regarding use of the App, and supersede all prior agreements, understandings, representations, and warranties, whether written or oral.' }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No waiver of any provision of these Terms shall constitute a waiver of any other provision or any subsequent waiver of the same provision." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "18. Force Majeure" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including but not limited to: acts of God, natural disasters, pandemics, epidemics, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, strikes, labor disputes, shortages of materials or equipment, cyberattacks, government regulations, or any other event beyond our control." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "19. No Professional Relationship" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your use of Helio/WellnessAI does NOT create any doctor-patient relationship, therapist-client relationship, genetic counselor-client relationship, nutritionist-client relationship, or any other professional relationship between you and the Company or any third parties. We are NOT your healthcare provider and do not assume any duties owed by healthcare providers to patients." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "20. Export Control and Compliance" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You agree to comply with all applicable export and import laws and regulations. You represent that you are not located in, or a national of, any country subject to economic sanctions or embargoes. You agree not to use the App in violation of any export restrictions." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "21. Contact Information and Legal Notices" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "For questions, concerns, or legal notices regarding these Terms, please contact us at:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal Department - Helio/WellnessAI" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "Email: ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "legal@wellnessai.app" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "Email: ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "legal@helio.app" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "Response Time: We will respond to legal inquiries within 30 business days."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: 'FINAL ACKNOWLEDGMENT: BY CLICKING "I ACCEPT," CREATING AN ACCOUNT, OR USING THE APP, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE IN THEIR ENTIRETY. YOU ACKNOWLEDGE THAT Helio/WellnessAI SHALL NOT BE LIABLE FOR ANY DAMAGES, LOSSES, OR INJURIES OF ANY KIND ARISING FROM YOUR USE OF THE APP.' }) })
] });
const PrivacyPolicy = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-section", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Privacy Policy" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-update", children: "Last Updated: November 30, 2025" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IMPORTANT: This Privacy Policy describes how Helio/WellnessAI collects, uses, stores, and shares your personal information and health data. While we implement security measures, NO SYSTEM IS 100% SECURE. Helio/WellnessAI CANNOT AND DOES NOT GUARANTEE absolute security of your data and is NOT LIABLE for data breaches, unauthorized access, or any consequences of data compromise." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "1. Information We Collect" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "1.1 Personal Information" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Name, email address, date of birth, gender" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Profile photo (optional)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Account credentials (encrypted)" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "1.2 Health Data" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Activity data (steps, workouts, exercise routines)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Biometric data (heart rate, sleep patterns, weight, height)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Nutritional information (food logs, water intake)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA data (if voluntarily uploaded by user)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Mental wellness data (meditation logs, mood tracking)" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "1.3 Device Information" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Device type, operating system, unique device identifiers" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Mobile network information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "IP address and location data (with permission)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sensor data (accelerometer, GPS, camera - with permission)" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "1.4 Usage Data" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "App interactions, features used, time spent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI chat conversations (stored locally, encrypted)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Gamification achievements and XP progress" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "2. How We Use Your Information" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We use collected information to:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide personalized health recommendations and insights" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Analyze DNA data to generate health risk assessments" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Power AI coaching features using Google Gemini AI" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Track your progress and achievements" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Improve app functionality and user experience" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Send important notifications (with your permission)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Comply with legal obligations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Detect and prevent fraud or security issues" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "3. Data Storage and Security" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "3.1 Local Storage" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Most data is stored locally on your device using encrypted localStorage. This includes:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Activity logs and health metrics" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI chat history" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Personal preferences" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "3.2 Cloud Storage" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Certain data is stored on secure servers with AES-256-GCM encryption:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Account information (encrypted)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA analysis results (anonymized)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Backup data (if enabled)" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "3.3 Security Measures" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "End-to-end encryption for sensitive data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Secure HTTPS connections for all API calls" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Regular security audits and penetration testing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "No API keys or credentials stored in client code" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "4. Data Sharing and Third Parties" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "4.1 We DO NOT Share" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your DNA data with any third party - NEVER" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your health data for advertising purposes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Personal information to data brokers" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "4.2 Limited Sharing" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We only share data with:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Google Gemini AI:" }),
      " Anonymous health queries for AI responses (no personal identifiers)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ElevenLabs:" }),
      " Text for voice synthesis (no health data included)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Analytics Services:" }),
      " Anonymized usage statistics only"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal Requirements:" }),
      " When required by law or to protect rights and safety"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "5. Your Data Rights" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You have the right to:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Access:" }),
      " Request a copy of all your data"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Rectification:" }),
      " Correct inaccurate data"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Erasure:" }),
      " Delete your account and all associated data"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Portability:" }),
      " Export your data in JSON format"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Restriction:" }),
      " Limit how we process your data"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Objection:" }),
      " Opt-out of certain data processing"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Withdrawal:" }),
      " Revoke consent at any time"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "6. Children's Privacy" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "WellnessAI is not intended for children under 16. We do not knowingly collect data from children. If we learn we have collected data from a child under 16, we will delete it immediately." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "7. International Data Transfers" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in compliance with GDPR and international standards." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "8. Data Retention" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Active accounts:" }),
      " Data retained as long as account is active"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Inactive accounts:" }),
      " Data deleted after 24 months of inactivity"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Deleted accounts:" }),
      " All data permanently deleted within 30 days"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal requirements:" }),
      " Some data may be retained longer if required by law"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "9. Cookies and Tracking" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We use minimal cookies and local storage for essential functionality. See our Cookie Policy for details." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "10. Device Permissions and Emergency Calling Disclosure" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI requires certain device permissions to provide its features. We are committed to transparency about how these permissions are used." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "10.1 Phone Call Permission (CALL_PHONE) - Emergency Calling Disclosure" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IMPORTANT DISCLOSURE:" }),
    " This app requests the CALL_PHONE permission to enable emergency calling features."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Purpose:" }),
    " The CALL_PHONE permission is used EXCLUSIVELY for:"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Emergency SOS Feature:" }),
      " Allows you to quickly dial emergency services (999/112/911) directly from the Emergency Panel with one tap"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fall Detection Response:" }),
      " If fall detection is enabled and a potential fall is detected, the app may offer to call emergency services on your behalf"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Emergency Contact Calling:" }),
      " Allows one-tap calling to your designated emergency contacts during health emergencies"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "User Control:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "This permission is OPTIONAL - you can deny it and still use other app features" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "The app will NEVER make calls without your explicit action or confirmation" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You can revoke this permission at any time in your device Settings → Apps → Helio → Permissions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Without this permission, you can still manually dial emergency numbers using your phone's dialer" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NO AUTOMATIC CALLS:" }),
    " Helio/WellnessAI will NEVER initiate phone calls automatically without user interaction. All calls require explicit user confirmation via button tap or dialog acknowledgment."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "10.2 Other Device Permissions" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", marginTop: "10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { backgroundColor: "rgba(139, 95, 232, 0.2)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.2)" }, children: "Permission" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.2)" }, children: "Purpose" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.2)" }, children: "Required" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Camera" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Food scanning, barcode scanning, profile photos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Motion/Activity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Step counting, fall detection, rep counting" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Reminders, alerts, step tracking display" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Microphone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Voice commands, AI voice chat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Storage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "DNA file upload, data export" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Bluetooth" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Heart rate monitor, wearable device sync" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Phone (CALL_PHONE)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Emergency SOS, fall detection response, emergency contact calling" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Foreground Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "24/7 step tracking, persistent notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: "Optional" })
      ] })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: "15px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Privacy Commitment:" }),
    " All permissions are used solely for the stated purposes. We do not access device capabilities for advertising, tracking, or any purpose other than app functionality. You maintain full control and can revoke any permission at any time."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "11. Security Limitations and Disclaimers" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CRITICAL SECURITY DISCLAIMER:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "While Helio/WellnessAI implements industry-standard security measures (encryption, secure connections, access controls), we make NO GUARANTEES regarding data security. You acknowledge and agree that:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No system is 100% secure:" }),
      " Despite our best efforts, data breaches, hacking, unauthorized access, or security incidents may occur"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "We are NOT liable for breaches:" }),
      " Helio/WellnessAI is NOT responsible for unauthorized access to your data by third parties, hackers, malicious actors, or anyone else"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "You assume all risks:" }),
      " By storing sensitive health data and DNA information in the App, you voluntarily assume all risks of data compromise"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Third-party risks:" }),
      " We cannot control security practices of third-party services (Google, ElevenLabs, device manufacturers, internet service providers)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Device security:" }),
      " If your device is lost, stolen, or compromised, your App data may be accessible to others"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Network security:" }),
      " Data transmitted over public WiFi or unsecured networks may be intercepted"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal compulsion:" }),
      " We may be legally compelled to disclose your data to law enforcement, courts, or government agencies"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Business transfers:" }),
      " If Helio/WellnessAI is acquired, merged, or goes bankrupt, your data may be transferred to new owners"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU RELEASE Helio/WellnessAI FROM ALL LIABILITY arising from data breaches, security incidents, unauthorized access, identity theft, privacy violations, or any other security-related damages." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "12. DNA Data Special Provisions and Enhanced Warnings" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DNA DATA CARRIES UNIQUE AND SERIOUS RISKS. BY UPLOADING DNA DATA, YOU ACKNOWLEDGE:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Permanent identification risk:" }),
      " DNA is permanent and uniquely identifies you. If compromised, you cannot change your DNA"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Family implications:" }),
      " Your DNA reveals information about your biological relatives who did not consent to testing"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Future implications:" }),
      " Genetic information may be used in ways not currently known or anticipated"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Insurance and employment:" }),
      " While illegal in many jurisdictions, genetic discrimination may occur"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Law enforcement:" }),
      " DNA data could be subpoenaed or used by law enforcement to identify you or relatives"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Research use:" }),
      " Anonymized DNA data may be used for research purposes"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No deletion guarantee:" }),
      " While we will delete your account data upon request, backups and anonymized research data may persist"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Third-party terms:" }),
      " If you uploaded DNA from 23andMe or other services, their terms still apply to that data"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "WE NEVER SELL IDENTIFIABLE DNA DATA, BUT:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We may share anonymized, aggregated genetic data with researchers" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We cannot guarantee anonymization cannot be reversed with future technology" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "In legal proceedings or business transfers, DNA data may be disclosed" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Helio/WellnessAI is NOT responsible for any consequences arising from your DNA data upload, including psychological distress, family disputes, discrimination, legal issues, or future uses of genetic information." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "13. Children's Data - Strict Prohibition" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI is STRICTLY PROHIBITED for children under 16 years of age. We do NOT knowingly collect, store, or process data from children under 16." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If we discover that a child under 16 has provided personal information, we will delete it immediately. However, we are NOT responsible for verifying user ages or any consequences if a child uses the App without our knowledge." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Parents/Guardians:" }),
    " You are responsible for monitoring your children's device usage. Helio/WellnessAI is NOT liable if a minor uses the App in violation of this policy."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "14. Changes to Privacy Policy" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI reserves the right to modify this Privacy Policy at any time, at our sole discretion. We will make reasonable efforts to notify you of material changes via:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "In-app notifications" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Email to your registered email address" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Posting updates to our website" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "However, we are NOT obligated to provide notice, and it is YOUR responsibility to review this Policy periodically. Continued use of the App after changes constitutes acceptance of the revised Policy." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Changes become effective IMMEDIATELY upon posting, unless otherwise stated." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "15. No Guarantees or Warranties" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This Privacy Policy describes our intended practices, but we make NO GUARANTEES OR WARRANTIES that:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We will always follow these practices exactly" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data will be secure or private" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Unauthorized access will not occur" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Third parties will comply with privacy obligations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data will not be lost, corrupted, or compromised" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Privacy laws will protect you in all jurisdictions" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "All privacy commitments are subject to applicable law, legal processes, business necessities, and technical limitations." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "16. Limitation of Liability for Privacy Issues" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, Helio/WellnessAI AND ALL RELATED PARTIES ARE NOT LIABLE FOR:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data breaches, hacking, or unauthorized access" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Identity theft or fraud arising from data compromise" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Consequences of data disclosure (employment loss, insurance denial, family disputes, psychological harm)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Privacy law violations by third parties" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Misuse of data by employees, contractors, or partners" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Government surveillance or data requests" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Any damages arising from privacy violations or data security incidents" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "17. International Users and Data Transfers" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Helio/WellnessAI operates globally. Your data may be transferred to, stored in, and processed in countries with DIFFERENT and POTENTIALLY WEAKER data protection laws than your own country." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "By using the App, you CONSENT to international data transfers and acknowledge that foreign governments may have access to your data through legal processes in their jurisdictions." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We make NO GUARANTEES about compliance with all international privacy laws, and you assume all risks of international data storage." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "18. Contact Information for Privacy Concerns" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "For privacy concerns, data requests, or to exercise your rights, contact our Data Protection Officer at:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Data Protection Officer - Helio/WellnessAI" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "Email: ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "privacy@wellnessai.app" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "Email: ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "dpo@helio.app" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "Response Time: We will respond to legitimate requests within 30 business days, subject to verification of your identity and legal requirements."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "FINAL ACKNOWLEDGMENT: BY USING Helio/WellnessAI, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY, INCLUDING ALL SECURITY DISCLAIMERS AND LIMITATIONS OF LIABILITY. YOU ACCEPT ALL RISKS ASSOCIATED WITH DATA STORAGE AND PRIVACY, AND YOU RELEASE Helio/WellnessAI FROM ALL LIABILITY FOR PRIVACY-RELATED DAMAGES." }) })
] });
const GDPRRights = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-section", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "GDPR Rights & Compliance" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-update", children: "Last Updated: November 30, 2025" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "GDPR COMPLIANCE DISCLAIMER: While Helio/WellnessAI strives to comply with the General Data Protection Regulation (GDPR) and provides tools to exercise your data rights, we make NO GUARANTEES of perfect compliance with all GDPR requirements at all times. Helio/WellnessAI is NOT LIABLE for GDPR violations, penalties, or consequences arising from our data practices, third-party actions, or technical limitations." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Your Rights Under GDPR (Subject to Limitations)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "The General Data Protection Regulation (GDPR) provides European Union residents with specific rights regarding their personal data. Helio/WellnessAI provides mechanisms to exercise these rights, but:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Rights are subject to legal limitations and exceptions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Technical limitations may affect our ability to fully comply" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Third-party service providers (Google, ElevenLabs) have their own GDPR obligations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We may refuse requests that are excessive, repetitive, or unfounded" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We require identity verification before fulfilling requests" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Some data may be retained for legal, security, or backup purposes even after deletion requests" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "1. Right to Access (Article 15)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You have the right to obtain:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Confirmation that your data is being processed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "A copy of all your personal data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Information about how your data is used" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to exercise:" }),
    " Go to Settings → Privacy → Download My Data, or email privacy@wellnessai.app"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "2. Right to Rectification (Article 16)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You can correct any inaccurate or incomplete personal data." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to exercise:" }),
    " Edit your profile in-app, or contact privacy@wellnessai.app"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: '3. Right to Erasure / "Right to be Forgotten" (Article 17)' }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You can request deletion of your personal data when:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data is no longer necessary for its original purpose" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You withdraw consent and no other legal basis exists" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You object to processing and there are no overriding grounds" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data has been unlawfully processed" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to exercise:" }),
    " Settings → Account → Delete Account, or email privacy@wellnessai.app"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Timeline:" }),
    " Complete deletion within 30 days"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "4. Right to Restriction of Processing (Article 18)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You can request we limit how we use your data when:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You contest the accuracy of the data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Processing is unlawful but you don't want data deleted" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We no longer need the data but you need it for legal claims" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You've objected to processing pending verification" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to exercise:" }),
    " Email privacy@wellnessai.app with specific restrictions requested"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "5. Right to Data Portability (Article 20)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You can receive your data in a structured, commonly used, machine-readable format (JSON) and transfer it to another service." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to exercise:" }),
    " Settings → Privacy → Export Data (JSON format)"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What's included:" }),
    " Profile info, health metrics, activity logs, DNA results, preferences"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "6. Right to Object (Article 21)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You can object to processing based on legitimate interests or for direct marketing purposes." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to exercise:" }),
    " Settings → Privacy → Data Processing Preferences, or email privacy@wellnessai.app"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "7. Rights Related to Automated Decision-Making (Article 22)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You have the right not to be subject to decisions based solely on automated processing that produces legal or significant effects. WellnessAI's AI recommendations are advisory only and do not make automated legal decisions about you." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "8. Right to Withdraw Consent (Article 7)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of processing before withdrawal." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How to exercise:" }),
    " Settings → Privacy → Permissions & Consent"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Legal Basis for Processing" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We process your data under the following legal bases:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Consent (Article 6(1)(a)):" }),
      " For optional features like DNA analysis, location tracking"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Contract Performance (Article 6(1)(b)):" }),
      " To provide the core app services"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal Obligation (Article 6(1)(c)):" }),
      " To comply with legal requirements"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legitimate Interests (Article 6(1)(f)):" }),
      " For fraud prevention, security, app improvement"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Special Categories of Data (Article 9)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We process special categories of personal data (health data, genetic data). Legal basis:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Explicit consent:" }),
      " You provide explicit opt-in consent"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Health/social care:" }),
      " Processing necessary for health monitoring purposes"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Data Protection Officer (DPO)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Our designated DPO can be reached at:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email:" }),
    " dpo@wellnessai.app"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Response time:" }),
    " Within 72 hours for urgent matters, 30 days for formal requests"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Right to Lodge a Complaint" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you believe your GDPR rights have been violated, you have the right to lodge a complaint with a supervisory authority in your EU member state." }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "EU Supervisory Authorities:" }),
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://edpb.europa.eu/about-edpb/board/members_en", target: "_blank", rel: "noopener noreferrer", children: "Find your local authority" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Data Breach Notification" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "In the event of a data breach affecting your rights and freedoms, we will notify you within 72 hours as required by Article 33." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "International Transfers" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "When transferring data outside the EU, we ensure adequate protection through:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Standard Contractual Clauses (SCCs)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Adequacy decisions by the European Commission" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Binding Corporate Rules where applicable" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Data Minimization" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We only collect and process data that is necessary for the specified purposes. You can use basic features without providing sensitive health data." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Privacy by Design & Default" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Our app is built with privacy-first principles:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Local-first data storage" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "End-to-end encryption for sensitive data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Minimal data collection by default" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Opt-in for sensitive features" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "GDPR Limitations and Disclaimers" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IMPORTANT: Your GDPR rights are NOT absolute and are subject to limitations:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal obligations:" }),
      " We may retain data required by law despite deletion requests"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legitimate interests:" }),
      " We may refuse requests that interfere with fraud prevention, security, or legal defense"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Technical limitations:" }),
      " Complete data deletion may be technically impossible due to backups, caches, or system architecture"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Third-party control:" }),
      " Data processed by Google, ElevenLabs, or other providers is subject to their GDPR compliance, not ours"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Anonymized data:" }),
      " Once data is truly anonymized, it is no longer personal data under GDPR and cannot be deleted"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Time limits:" }),
      " We have 30 days (extendable to 60 days) to respond to requests; we are not liable for delays"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Identity verification:" }),
      " We may require extensive proof of identity, which may delay or prevent request fulfillment"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Excessive requests:" }),
      " We may charge fees or refuse manifestly unfounded or excessive requests"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "GDPR Liability Disclaimer" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Helio/WellnessAI IS NOT LIABLE FOR:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "GDPR violations by third-party service providers" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Penalties, fines, or consequences from supervisory authorities" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Inability to fully delete data due to technical constraints" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data breaches affecting EU residents" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Consequences of exercising your GDPR rights (e.g., service interruption after deletion)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Conflicts between GDPR and other jurisdictions' laws" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Changes to GDPR or regulatory interpretations" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Contact and Complaints" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "For GDPR-related inquiries, contact our Data Protection Officer:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email:" }),
    " dpo@wellnessai.app | dpo@helio.app",
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Response Time:" }),
    " 30 business days (extendable)"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you believe your GDPR rights have been violated, you have the right to lodge a complaint with your local supervisory authority. However, Helio/WellnessAI is NOT responsible for the outcome of such complaints or any resulting penalties." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BY USING Helio/WellnessAI AS AN EU RESIDENT, YOU ACKNOWLEDGE THAT GDPR RIGHTS ARE SUBJECT TO LIMITATIONS, TECHNICAL CONSTRAINTS, AND LEGAL EXCEPTIONS. YOU AGREE THAT Helio/WellnessAI SHALL NOT BE LIABLE FOR IMPERFECT GDPR COMPLIANCE OR CONSEQUENCES ARISING FROM GDPR-RELATED MATTERS." }) })
] });
const MedicalDisclaimer = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-section", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Medical Disclaimer and Health Warning" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-update", children: "Last Updated: November 30, 2025" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "legal-emphasis", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠️ CRITICAL WARNING ⚠️" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Helio/WellnessAI IS NOT A MEDICAL DEVICE, NOT A DIAGNOSTIC TOOL, NOT A TREATMENT PLATFORM, AND DOES NOT PROVIDE MEDICAL ADVICE, DIAGNOSIS, TREATMENT, OR PROFESSIONAL HEALTHCARE SERVICES OF ANY KIND." })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BY USING THIS APP, YOU ACKNOWLEDGE AND AGREE THAT Helio/WellnessAI, ITS DEVELOPERS, EMPLOYEES, AFFILIATES, PARTNERS, AND ALL RELATED PARTIES ARE NOT RESPONSIBLE FOR ANY HEALTH COMPLICATIONS, INJURIES, ILLNESSES, ADVERSE OUTCOMES, MEDICAL EMERGENCIES, WRONGFUL DEATHS, OR ANY OTHER HEALTH-RELATED DAMAGES ARISING FROM USE OF THIS APPLICATION." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "1. Not a Medical Device - Regulatory Status" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Helio/WellnessAI is explicitly NOT:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "A medical device as defined by the FDA (Food and Drug Administration) or any other regulatory body" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Cleared, approved, authorized, or endorsed by the FDA, EMA (European Medicines Agency), or any regulatory health authority" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Intended for use in the diagnosis, cure, mitigation, treatment, or prevention of any disease or medical condition" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "A clinical-grade monitoring system or medical-grade tracking device" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Suitable for use in clinical decision-making or medical diagnosis" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "A substitute for professional medical equipment, examinations, or testing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Validated, verified, or certified for accuracy by any medical or scientific authority" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "2. Not Medical Advice - Information Only" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ALL INFORMATION PROVIDED BY Helio/WellnessAI, INCLUDING BUT NOT LIMITED TO:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI-generated health recommendations, suggestions, or coaching" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA analysis results and genetic interpretations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Nutritional information, calorie estimates, and dietary suggestions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Exercise recommendations and fitness guidance" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sleep analysis and sleep quality scores" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Heart rate estimates and cardiovascular insights" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Wellness scores, health ratings, or risk assessments" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Meditation guidance and stress relief techniques" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Food scanning results and ingredient analysis" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Activity tracking data and step counts" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IS PROVIDED FOR INFORMATIONAL, EDUCATIONAL, AND ENTERTAINMENT PURPOSES ONLY." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This information is NOT intended to be, and shall NOT be construed as, professional medical advice, diagnosis, prognosis, treatment recommendations, cure, prevention, or healthcare services. It is NOT a substitute for consultation with qualified, licensed healthcare professionals." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "3. Mandatory Healthcare Professional Consultation" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU MUST ALWAYS CONSULT WITH QUALIFIED, LICENSED HEALTHCARE PROFESSIONALS BEFORE:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Starting, modifying, or stopping ANY exercise, fitness, or physical activity program" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Making ANY dietary, nutritional, or eating habit changes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Taking ANY action based on DNA analysis, genetic testing, or health risk assessments" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stopping, changing, reducing, or starting ANY prescribed medications or medical treatments" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Making ANY decisions that could affect your health, safety, or wellbeing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Interpreting ANY health data, metrics, or measurements from the App" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Following ANY recommendations, suggestions, or guidance from the App or its AI features" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Using App data to self-diagnose or self-treat any condition" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Ignoring or delaying professional medical care based on App information" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CONSULT YOUR DOCTOR if you:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Have any pre-existing medical conditions (heart disease, diabetes, asthma, high blood pressure, etc.)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Are pregnant, nursing, or planning to become pregnant" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Are taking any medications (prescription or over-the-counter)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Have any injuries, disabilities, or physical limitations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Experience any pain, discomfort, dizziness, shortness of breath, or unusual symptoms" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Are over age 40 and have been sedentary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Have a family history of heart disease, sudden cardiac death, or genetic disorders" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Have allergies, food sensitivities, or dietary restrictions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Are concerned about any health information displayed in the App" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Helio/WellnessAI is NOT responsible for consequences arising from your failure to consult healthcare professionals." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "3. AI-Generated Content Limitations" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Our AI coaching features use Google Gemini AI. While we strive for accuracy:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI can make mistakes or provide incorrect information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI responses are general and not personalized medical advice" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI cannot replace human medical expertise" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI may not have access to your complete medical history" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI recommendations may not be suitable for your specific condition" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "4. DNA Analysis Disclaimer" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you upload DNA data from services like 23andMe:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Results are for informational purposes only" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Genetic predisposition does NOT mean you will develop a condition" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Results should be discussed with a genetic counselor or physician" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We are not a clinical diagnostic laboratory" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Results are not FDA-approved or clinically validated" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Genetic data interpretation is complex and evolving" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "5. Activity and Fitness Tracking" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Step counts and activity metrics are estimates and may not be 100% accurate" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Calorie burn calculations are approximations based on general formulas" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Heart rate and biometric readings are not medical-grade" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Do not rely on app data for medical monitoring" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "6. Food Scanning and Nutritional Information" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI-powered food recognition may misidentify foods" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Nutritional estimates may be inaccurate" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Always verify food information, especially for allergies or dietary restrictions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Not suitable for managing medical dietary requirements" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "7. Mental Health Features" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Meditation, breathing exercises, and stress relief features are wellness tools, not therapy:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Not a substitute for professional mental health treatment" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "If experiencing mental health crisis, contact emergency services" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "For severe anxiety or depression, seek professional help" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "8. Emergency Situations" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DO NOT use this app in medical emergencies." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you are experiencing a medical emergency, immediately:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Call emergency services (911, 112, or your local emergency number)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Contact your doctor or go to the nearest emergency room" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Do not rely on AI chat or app features for urgent medical issues" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "9. No Warranties" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'The app and all content are provided "as is" without warranties of any kind. We do not warrant that:' }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "The app will be error-free or uninterrupted" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Information will be accurate, complete, or current" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Results will meet your expectations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Use of the app will improve your health" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "10. Assumption of Risk" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "By using WellnessAI, you acknowledge that:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Physical activity carries inherent risks" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You are solely responsible for your health and safety" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You assume all risks associated with using the app" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You will use the app at your own discretion and risk" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "11. Complete Limitation of Liability and Release" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, Helio/WellnessAI AND ALL RELEASED PARTIES (INCLUDING OWNERS, DEVELOPERS, EMPLOYEES, CONTRACTORS, AFFILIATES, PARTNERS, INVESTORS, OFFICERS, DIRECTORS, AGENTS, LICENSORS, SERVICE PROVIDERS INCLUDING GOOGLE LLC AND ELEVENLABS, AND ANY OTHER RELATED ENTITIES) SHALL NOT BE LIABLE, RESPONSIBLE, OR HELD ACCOUNTABLE FOR ANY AND ALL:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Health-Related Damages:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Death, wrongful death, or fatal injuries of any kind" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Permanent disability, paralysis, or loss of bodily function" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Heart attacks, cardiac arrest, strokes, or cardiovascular events" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Injuries from exercise, physical activity, or following fitness recommendations (sprains, fractures, torn ligaments, muscle damage, etc.)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Worsening of pre-existing medical conditions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Development of new medical conditions, illnesses, or diseases" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Adverse reactions to dietary changes, food consumption, or nutritional recommendations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Allergic reactions, food poisoning, or nutritional deficiencies" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Weight gain, weight loss, or eating disorders" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Dehydration, overhydration, or electrolyte imbalances" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sleep disorders or sleep deprivation" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Mental health deterioration (anxiety, depression, stress, panic attacks)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Psychological distress from DNA results or health information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Delayed diagnosis of serious medical conditions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Missed diagnosis or misdiagnosis based on App data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Complications from delayed or avoided medical treatment" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Medication interactions or adverse drug reactions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Surgical complications if decisions were influenced by App information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Reproductive health issues or pregnancy complications" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Infections, diseases contracted, or health deterioration of any kind" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Data and Technology-Related Damages:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Inaccurate, incorrect, misleading, or dangerous information provided by the App" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI errors, hallucinations, or completely wrong recommendations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "DNA analysis errors or misinterpretation of genetic data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Nutritional data errors or incorrect calorie/macro calculations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Incorrect step counts, heart rate readings, or activity tracking" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Food scanner misidentification or allergen detection failures" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data breaches, hacking, or unauthorized access to your health data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Loss, corruption, or deletion of your health data or DNA information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Privacy violations or disclosure of your personal health information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Identity theft or fraud resulting from App use" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Third-party misuse of your data" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Third-Party and External Factors:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Actions or omissions by third-party service providers (Google, ElevenLabs, etc.)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Healthcare providers' actions influenced by App data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Insurance denials or premium increases based on App data or DNA results" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Employment discrimination based on genetic information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Family relationship disputes arising from DNA discoveries" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Legal consequences in jurisdictions where genetic testing is restricted" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Social, psychological, or emotional impacts of health information" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Service and Operational Issues:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "App malfunctions, crashes, bugs, or technical failures" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Service interruptions, downtime, or unavailability during critical moments" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Incompatibility with your device or operating system" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Battery drain, device damage, or performance issues" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Network connectivity issues affecting App functionality" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "THIS LIMITATION OF LIABILITY APPLIES EVEN IF:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Helio/WellnessAI was negligent or grossly negligent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "The App malfunctioned at a critical moment" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "We were aware or should have been aware of the possibility of such damages" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You suffered severe, permanent, or life-threatening harm" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "The damages were foreseeable" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Other remedies fail of their essential purpose" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "YOU EXPRESSLY WAIVE, RELEASE, AND FOREVER DISCHARGE Helio/WellnessAI and all Released Parties from ANY AND ALL claims, demands, causes of action, liabilities, costs, or damages of any kind arising from or related to your health, wellbeing, or use of the App." }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "12. User Responsibility" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You are responsible for:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Verifying all information with healthcare professionals" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Knowing your own health status and limitations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stopping any activity that causes pain or discomfort" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Seeking immediate medical attention when needed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Not sharing medical advice from the app with others" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "13. Regulatory Status" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "WellnessAI is not:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "FDA-cleared or approved as a medical device" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "CE-marked for medical purposes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Intended to diagnose, treat, cure, or prevent any disease" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "A replacement for medical equipment or monitoring" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "14. Pregnant Women and Special Populations" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you are pregnant, nursing, have a medical condition, or are taking medications, consult your healthcare provider before using fitness or nutritional features of this app." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "15. Children" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This app is not intended for use by children under 16. Parents or guardians should supervise any use by minors and consult pediatric healthcare providers." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "16. Third-Party Content" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Links to third-party websites or content are provided for convenience only. We do not endorse or take responsibility for third-party information." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "17. Updates and Changes" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Health information and scientific understanding evolve. App content may become outdated. We strive to update information regularly but make no guarantees." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "18. Geographic Limitations" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Health recommendations may not be suitable for all geographic regions or populations. Consult local healthcare providers familiar with regional health factors." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "19. Your Legal Acknowledgment and Binding Agreement" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BY DOWNLOADING, INSTALLING, ACCESSING, OR USING Helio/WellnessAI IN ANY WAY, YOU HEREBY:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ACKNOWLEDGE" }),
      " that you have read, understood, and comprehend this entire Medical Disclaimer and Health Warning"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AGREE" }),
      " to be legally bound by all terms, conditions, disclaimers, and limitations contained herein"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UNDERSTAND" }),
      " that Helio/WellnessAI is NOT a medical device and does NOT provide medical advice"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ACCEPT" }),
      " that all information is for informational purposes only and may be inaccurate or harmful"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ASSUME" }),
      " all risks associated with using the App and making health decisions"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "WAIVE" }),
      " any and all claims against Helio/WellnessAI for health-related damages"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "RELEASE" }),
      " Helio/WellnessAI from all liability for injuries, illnesses, or deaths arising from App use"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AGREE" }),
      " to consult qualified healthcare professionals before making any health decisions"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CERTIFY" }),
      " that you are using the App voluntarily, at your own risk, and with full knowledge of the dangers"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CONFIRM" }),
      " that no one at Helio/WellnessAI has made any representations or warranties contradicting this Disclaimer"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "legal-emphasis", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠️ FINAL WARNING ⚠️" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS APP. YOUR USE CONSTITUTES ACCEPTANCE. Helio/WellnessAI AND ALL RELATED PARTIES BEAR ZERO RESPONSIBILITY FOR ANY HEALTH CONSEQUENCES, INJURIES, OR DAMAGES RESULTING FROM YOUR USE OF THIS APPLICATION." })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-emphasis", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "IF YOU EXPERIENCE A MEDICAL EMERGENCY, IMMEDIATELY CALL 911 (US), 112 (EU), OR YOUR LOCAL EMERGENCY NUMBER. DO NOT RELY ON THIS APP FOR EMERGENCY MEDICAL ASSISTANCE." }) })
] });
const CookiePolicy = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-section", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Cookie Policy" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "legal-update", children: "Last Updated: November 30, 2025" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "1. What Are Cookies?" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Cookies are small text files stored on your device when you use websites or apps. WellnessAI uses minimal cookies and local storage to provide essential functionality." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "2. Types of Data Storage We Use" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "2.1 Essential Local Storage (Cannot be disabled)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We use browser localStorage to store essential data locally on your device:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Authentication tokens:" }),
      " To keep you logged in"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "User preferences:" }),
      " Language, theme, notification settings"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Health data:" }),
      " Activity logs, workouts, food logs, sleep data"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Gamification data:" }),
      " XP, levels, achievements"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AI chat history:" }),
      " Your conversation with the AI coach"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Why essential:" }),
    " Without this storage, the app cannot function. Data is encrypted and stored locally on your device."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "2.2 Functional Cookies" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Session cookies:" }),
      " Temporary cookies that expire when you close the app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Remember me:" }),
      ' If you choose "Keep me logged in"'
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Duration:" }),
    " Session cookies expire on app close; persistent cookies last up to 30 days"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "2.3 Analytics (Optional - Can be disabled)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We may use anonymized analytics to improve the app:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Which features are most used" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "App performance metrics" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Crash reports (no personal data)" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Control:" }),
    " Settings → Privacy → Analytics - Toggle ON/OFF"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "3. What We DON'T Use" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ Advertising cookies" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ Third-party tracking cookies" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ Social media tracking pixels" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ Cross-site tracking" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "❌ Behavioral profiling cookies" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "4. Third-Party Services" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "4.1 Google Gemini AI" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "When you use the AI coach, your queries are sent to Google's Gemini API through our secure server. Google may use cookies according to their privacy policy. We anonymize queries and do not share personal identifiers." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "4.2 ElevenLabs Voice" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Text-to-speech requests are sent to ElevenLabs API. No health data or personal information is included in voice requests." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "4.3 Capacitor Plugins" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Native device features (camera, motion sensors, GPS) access device APIs but do not set cookies." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "5. Mobile App Specific Storage" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "As a mobile app, we primarily use:" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Secure Storage:" }),
      " Encrypted keychain/keystore for sensitive data"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "App Sandbox:" }),
      " Private file storage on your device"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cache:" }),
      " Temporary storage for images and assets"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "6. How to Manage Storage" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "6.1 In-App Controls" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Settings → Privacy → Clear Cache" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Settings → Privacy → Clear Chat History" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Settings → Account → Delete All Data" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "6.2 Device-Level Controls" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Android:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Settings → Apps → WellnessAI → Storage → Clear Data/Cache" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "iOS:" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Settings → General → iPhone Storage → WellnessAI → Delete App" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "7. Data Retention" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Active use:" }),
      " Data stored indefinitely while you use the app"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cache:" }),
      " Cleared periodically or when storage is low"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "After deletion:" }),
      " All local data permanently deleted"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "8. Children's Privacy" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We do not knowingly collect data from children under 16. If you are under 16, please do not use this app." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "9. Updates to This Policy" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We may update this Cookie Policy. We will notify you of changes via in-app notification. Last updated: November 30, 2025." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "10. Your Consent" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "By using WellnessAI, you consent to our use of essential local storage. Optional features requiring additional data storage will ask for your explicit consent." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "11. Contact Us" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    "Questions about cookies or data storage? Contact: ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "privacy@wellnessai.app" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "12. Do Not Track (DNT)" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We respect Do Not Track signals. When DNT is enabled, we minimize data collection to essential functionality only." })
] });
export {
  LegalModal as default
};
