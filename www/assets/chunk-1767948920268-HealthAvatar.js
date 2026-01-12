import { a as authService, Y as geminiService, r as reactExports, z as subscriptionService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import { healthAvatarService } from "./chunk-1767948920148-healthAvatarService.js";
import PaywallModal from "./chunk-1767948920155-PaywallModal.js";
import "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
class HealthRecommendationService {
  constructor() {
    this.cachedRecommendations = null;
    this.cacheTimestamp = 0;
    this.cacheDuration = 36e5;
  }
  /**
   * Generate AI personalized recommendations based on health avatar data
   */
  async generateRecommendations(avatarState, forceRefresh = false) {
    try {
      const now = Date.now();
      if (!forceRefresh && this.cachedRecommendations && now - this.cacheTimestamp < this.cacheDuration) {
        if (false) ;
        return this.cachedRecommendations;
      }
      if (!avatarState || !avatarState.current) {
        if (false) ;
        return this._getDefaultRecommendations();
      }
      const weakAreas = this._extractWeakAreas(avatarState.current);
      if (!weakAreas || weakAreas.length === 0) {
        if (false) ;
        return this._getDefaultRecommendations();
      }
      const userProfile = authService.getCurrentUser()?.profile || {};
      if (false) ;
      const prompt = this._buildRecommendationPrompt(
        avatarState.current,
        weakAreas,
        userProfile
      );
      const aiResponse = await geminiService.generateText(prompt);
      if (!aiResponse) {
        if (false) ;
        const fallback = this._getFallbackRecommendations(weakAreas);
        this.cachedRecommendations = fallback;
        this.cacheTimestamp = now;
        return fallback;
      }
      const recommendations = this._parseAIResponse(aiResponse, weakAreas);
      this.cachedRecommendations = recommendations;
      this.cacheTimestamp = now;
      if (false) ;
      return recommendations;
    } catch (error) {
      return this._getDefaultRecommendations();
    }
  }
  /**
   * Extract weak areas from score breakdown
   */
  _extractWeakAreas(currentState) {
    const weakAreas = [];
    if (!currentState.scoreBreakdown) {
      return weakAreas;
    }
    const negativeFactors = currentState.scoreBreakdown.filter((item) => item.points < 0).sort((a, b) => a.points - b.points);
    negativeFactors.forEach((factor) => {
      weakAreas.push({
        factor: factor.factor,
        points: factor.points,
        icon: factor.icon,
        severity: factor.points <= -15 ? "critical" : factor.points <= -10 ? "high" : "moderate"
      });
    });
    return weakAreas;
  }
  /**
   * Build the Gemini prompt for personalized recommendations
   */
  _buildRecommendationPrompt(currentState, weakAreas, userProfile) {
    const weakFactorsText = weakAreas.map((w) => `- ${w.factor} (${w.points} points, ${w.severity} severity)`).join("\n");
    const dnaRisks = currentState.scoreBreakdown.find((item) => item.factor.includes("DNA"))?.factor || "Not provided";
    const age = userProfile.age || "unknown";
    const fitness = userProfile.fitnessLevel || "unknown";
    const medicalConditions = userProfile.medicalConditions?.join(", ") || "none";
    return `You are a certified health and wellness expert. A user has a health score of ${currentState.score}/100.

WEAK AREAS TO IMPROVE (in priority order):
${weakFactorsText}

USER PROFILE:
- Age: ${age}
- Fitness Level: ${fitness}
- Medical Conditions: ${medicalConditions}
- DNA Risks: ${dnaRisks}

TASK: Generate 5 SPECIFIC, ACTIONABLE health recommendations that:
1. Address their biggest weak areas first
2. Include exact numbers/times/amounts (e.g., "Add 3,000 steps daily" not "exercise more")
3. Are realistic for their fitness level
4. Consider their medical profile
5. Can be tracked daily

Format your response as JSON array with this structure:
[
  {
    "title": "Specific action title",
    "description": "2-3 sentence explanation",
    "action": "Exact step they should take",
    "target": "Measurable target (e.g., '10,000 steps/day')",
    "timeframe": "When to do it (e.g., 'Daily' or 'Twice weekly')",
    "impact": "Which factors this improves",
    "difficulty": "easy|moderate|hard",
    "tip": "Pro tip for success"
  }
]

Be specific, actionable, and motivational. Focus on their weak areas first.`;
  }
  /**
   * Parse AI response into structured recommendations
   */
  _parseAIResponse(aiResponse, weakAreas) {
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        if (false) ;
        return this._getFallbackRecommendations(weakAreas);
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((rec, idx) => ({
        id: idx + 1,
        title: rec.title || "Health Improvement",
        description: rec.description || "",
        action: rec.action || "",
        target: rec.target || "",
        timeframe: rec.timeframe || "Daily",
        impact: rec.impact || "Overall health",
        difficulty: rec.difficulty || "moderate",
        tip: rec.tip || "",
        priority: idx === 0 ? "critical" : idx === 1 ? "high" : "medium"
      }));
    } catch (error) {
      return this._getFallbackRecommendations(weakAreas);
    }
  }
  /**
   * Fallback recommendations based on weak areas
   */
  _getFallbackRecommendations(weakAreas) {
    const recommendations = [];
    weakAreas.forEach((area, idx) => {
      let rec = null;
      if (area.factor.includes("Steps")) {
        rec = {
          id: idx + 1,
          title: "🚶 Increase Daily Steps",
          description: "Walking is the foundation of health. Even 3,000 extra steps daily improves cardiovascular health and mood.",
          action: "Add a 20-minute walk after each meal",
          target: "10,000 steps/day",
          timeframe: "Daily",
          impact: "Daily Steps, BMI, Energy",
          difficulty: "easy",
          tip: "Use stairs, park farther away, or use a treadmill while watching TV",
          priority: area.severity === "critical" ? "critical" : "high"
        };
      } else if (area.factor.includes("Food")) {
        rec = {
          id: idx + 1,
          title: "🥗 Improve Food Choices",
          description: "Replace processed foods with whole foods. This dramatically improves energy, digestion, and health score.",
          action: "Scan meals daily. Choose green/yellow foods over red foods.",
          target: "80% of meals from healthy sources",
          timeframe: "Daily",
          impact: "Food Quality, Energy, BMI",
          difficulty: "moderate",
          tip: "Meal prep on Sundays. Keep healthy snacks visible.",
          priority: area.severity === "critical" ? "critical" : "high"
        };
      } else if (area.factor.includes("Sleep")) {
        rec = {
          id: idx + 1,
          title: "😴 Get Better Sleep",
          description: "7-9 hours of quality sleep is essential. Sleep improves every health metric.",
          action: "Set consistent bedtime. Avoid screens 1 hour before bed.",
          target: "8 hours/night",
          timeframe: "Every night",
          impact: "Sleep Quality, Health Score",
          difficulty: "moderate",
          tip: "Use blue light glasses after sunset. Keep bedroom cool and dark.",
          priority: area.severity === "critical" ? "critical" : "high"
        };
      } else if (area.factor.includes("Workout")) {
        rec = {
          id: idx + 1,
          title: "💪 Start a Workout Routine",
          description: "Just 3 workouts per week dramatically improves health. Pick activities you enjoy.",
          action: "Log 3 workouts: 2 cardio (20 min) + 1 strength (30 min)",
          target: "150 minutes exercise/week",
          timeframe: "3-4x per week",
          impact: "Workouts, Energy, Fitness",
          difficulty: "moderate",
          tip: "Start with walking, yoga, or dancing. Consistency beats intensity.",
          priority: area.severity === "critical" ? "critical" : "high"
        };
      } else if (area.factor.includes("DNA")) {
        rec = {
          id: idx + 1,
          title: "🧬 Manage Genetic Risks",
          description: "Your DNA shows certain predispositions. With lifestyle changes, you can reduce risk.",
          action: "Use your DNA insights to customize nutrition and exercise.",
          target: "Reduce high-risk exposure",
          timeframe: "Ongoing",
          impact: "DNA Risks, Health Score",
          difficulty: "hard",
          tip: "Consult a nutritionist familiar with genetic testing results.",
          priority: "high"
        };
      } else {
        rec = {
          id: idx + 1,
          title: `📈 Improve ${area.factor}`,
          description: `Focus on this area to boost your health score. Every improvement compounds.`,
          action: `Start tracking ${area.factor.toLowerCase()} daily.`,
          target: "Track consistently",
          timeframe: "Daily",
          impact: area.factor,
          difficulty: "moderate",
          tip: "Consistency matters more than perfection.",
          priority: area.severity === "critical" ? "critical" : "high"
        };
      }
      if (rec) {
        recommendations.push(rec);
      }
    });
    return recommendations.length > 0 ? recommendations : this._getDefaultRecommendations();
  }
  /**
   * Default recommendations if no weak areas found
   */
  _getDefaultRecommendations() {
    return [
      {
        id: 1,
        title: "🎯 Maintain Your Health",
        description: "You're doing great! Maintain your current habits and optimize further.",
        action: "Keep tracking your data consistently.",
        target: "Score of 80+",
        timeframe: "Daily",
        impact: "Overall health",
        difficulty: "easy",
        tip: "Your consistency is your superpower. Keep it up!",
        priority: "high"
      },
      {
        id: 2,
        title: "🔍 Deep Health Dive",
        description: "Once you master the basics, go deeper. Optimize sleep cycles, macros, and training.",
        action: "Explore advanced health tracking features.",
        target: "Score of 90+",
        timeframe: "Weekly optimization",
        impact: "All factors",
        difficulty: "hard",
        tip: "Join health communities for advanced tips and support.",
        priority: "medium"
      },
      {
        id: 3,
        title: "👥 Share Your Progress",
        description: "Help others by sharing your journey. Community support accelerates progress.",
        action: "Challenge friends or join wellness groups.",
        target: "Build accountability",
        timeframe: "Ongoing",
        impact: "Engagement, Motivation",
        difficulty: "easy",
        tip: "Social commitment increases success rate by 65%.",
        priority: "medium"
      }
    ];
  }
  /**
   * Clear cached recommendations
   */
  clearCache() {
    this.cachedRecommendations = null;
    this.cacheTimestamp = 0;
  }
}
const healthRecommendationService = new HealthRecommendationService();
function HealthAvatar({ onClose }) {
  const [showPaywall, setShowPaywall] = reactExports.useState(false);
  const [userPlan, setUserPlan] = reactExports.useState("free");
  const [avatarState, setAvatarState] = reactExports.useState(null);
  const [activeView, setActiveView] = reactExports.useState("current");
  const [loading, setLoading] = reactExports.useState(true);
  const [aiRecommendations, setAiRecommendations] = reactExports.useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const plan = subscriptionService.getCurrentPlan();
    setUserPlan(plan.id);
    if (!subscriptionService.hasAccess("healthAvatar")) {
      setShowPaywall(true);
      setLoading(false);
      return;
    }
  }, []);
  reactExports.useEffect(() => {
    loadAvatarData();
    const interval = setInterval(loadAvatarData, 1e4);
    return () => clearInterval(interval);
  }, []);
  const loadAvatarData = async () => {
    const state = await healthAvatarService.getAvatarState(true);
    setAvatarState(state);
    setLoading(false);
    if (activeView === "recommendations" && state) {
      loadAIRecommendations(state);
    }
  };
  const loadAIRecommendations = async (state) => {
    setLoadingRecommendations(true);
    try {
      const recommendations = await healthRecommendationService.generateRecommendations(state, false);
      setAiRecommendations(recommendations);
    } catch (error) {
    }
    setLoadingRecommendations(false);
  };
  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === "recommendations" && avatarState && !aiRecommendations) {
      loadAIRecommendations(avatarState);
    }
  };
  const getActiveData = () => {
    if (!avatarState) return null;
    switch (activeView) {
      case "current":
        return avatarState.current;
      case "1year":
        return { ...avatarState.future1Year, visuals: healthAvatarService.getAvatarVisuals(avatarState.future1Year.score) };
      case "5years":
        return { ...avatarState.future5Years, visuals: healthAvatarService.getAvatarVisuals(avatarState.future5Years.score) };
      case "10years":
        return { ...avatarState.future10Years, visuals: healthAvatarService.getAvatarVisuals(avatarState.future10Years.score) };
      default:
        return avatarState.current;
    }
  };
  const activeData = getActiveData();
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-modal", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "⏳ Loading your health avatar..." }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-overlay", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-modal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "avatar-close", onClick: onClose, children: "✕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "avatar-title", children: "🧬 Your Health Avatar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-disclaimer", style: {
        background: "rgba(255, 152, 0, 0.1)",
        border: "1px solid rgba(255, 152, 0, 0.3)",
        borderRadius: "8px",
        padding: "10px",
        margin: "10px 0",
        fontSize: "12px",
        color: "#FFA500"
      }, children: [
        "⚠️ ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Not Medical Advice:" }),
        " This is an educational estimate based on your activity data. Always consult healthcare professionals for medical decisions."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-timeline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `timeline-btn ${activeView === "current" ? "active" : ""}`,
            onClick: () => handleViewChange("current"),
            children: "NOW"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `timeline-btn ${activeView === "1year" ? "active" : ""}`,
            onClick: () => handleViewChange("1year"),
            children: "+1 YEAR"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `timeline-btn ${activeView === "5years" ? "active" : ""}`,
            onClick: () => handleViewChange("5years"),
            children: "+5 YEARS"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `timeline-btn ${activeView === "10years" ? "active" : ""}`,
            onClick: () => handleViewChange("10years"),
            children: "+10 YEARS"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `timeline-btn recommendations-btn ${activeView === "recommendations" ? "active" : ""}`,
            onClick: () => handleViewChange("recommendations"),
            children: "🤖 AI PLAN"
          }
        )
      ] }),
      activeData && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-display", "data-glow": activeData.visuals?.glowEffect || "none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-character", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-emoji", style: {
            filter: activeData.visuals?.eyeBrightness === "dull" ? "grayscale(0.5)" : "none",
            opacity: activeData.visuals?.energyLevel === "low" ? 0.7 : 1
          }, children: activeData.visuals?.overallMood || "😊" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-score-circle", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 100 100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "45", fill: "none", stroke: "#333", strokeWidth: "8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "circle",
                {
                  cx: "50",
                  cy: "50",
                  r: "45",
                  fill: "none",
                  stroke: activeData.score >= 70 ? "#44FF44" : activeData.score >= 50 ? "#FFA500" : "#FF4444",
                  strokeWidth: "8",
                  strokeDasharray: `${2 * Math.PI * 45 * (activeData.score / 100)} ${2 * Math.PI * 45}`,
                  transform: "rotate(-90 50 50)"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-text", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "score-number", children: activeData.score }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "score-label", children: "Health Score" }),
              activeView === "current" && activeData.dataCompleteness !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "data-quality", style: {
                fontSize: "11px",
                color: activeData.dataCompleteness >= 70 ? "#44FF44" : "#FFA500",
                marginTop: "5px",
                display: "block"
              }, children: [
                "Based on ",
                activeData.dataCompleteness,
                "% complete data",
                activeData.dataCompleteness < 70 && " ⚠️"
              ] })
            ] })
          ] })
        ] }),
        activeView !== "current" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "age-warning", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
            "⚠️ You'll look ",
            activeData.ageAppearance,
            " years old"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Actual age: ",
            avatarState.current.age + parseInt(activeView.replace(/\D/g, ""))
          ] })
        ] }),
        activeView === "current" && activeData.emergencyWarnings && activeData.emergencyWarnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "emergency-warnings", style: {
          background: "rgba(255, 68, 68, 0.1)",
          border: "2px solid #FF4444",
          borderRadius: "12px",
          padding: "15px",
          margin: "15px 0"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { color: "#FF4444", margin: "0 0 10px 0" }, children: "🚨 Health Alerts" }),
          activeData.emergencyWarnings.map((warning, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            background: warning.severity === "critical" ? "rgba(255, 0, 0, 0.15)" : "rgba(255, 152, 0, 0.15)",
            border: `1px solid ${warning.severity === "critical" ? "#FF0000" : "#FFA500"}`,
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "10px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "16px", fontWeight: "bold", marginBottom: "5px" }, children: [
              warning.icon,
              " ",
              warning.title
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "14px", marginBottom: "5px" }, children: warning.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "12px", fontStyle: "italic", color: "#FFA500" }, children: [
              "👉 ",
              warning.action
            ] })
          ] }, idx))
        ] }),
        activeView === "current" && activeData.scoreBreakdown && activeData.scoreBreakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-breakdown", style: {
          background: "rgba(68, 255, 68, 0.05)",
          border: "1px solid rgba(68, 255, 68, 0.3)",
          borderRadius: "12px",
          padding: "15px",
          margin: "15px 0"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: "0 0 12px 0", fontSize: "16px" }, children: "📊 Score Breakdown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px"
          }, children: activeData.scoreBreakdown.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            background: item.points > 0 ? "rgba(68, 255, 68, 0.1)" : item.points < 0 ? "rgba(255, 68, 68, 0.1)" : "rgba(128, 128, 128, 0.1)",
            borderRadius: "6px",
            border: `1px solid ${item.points > 0 ? "#44FF44" : item.points < 0 ? "#FF4444" : "#888"}`,
            fontSize: "12px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "12px" }, children: [
              item.icon,
              " ",
              item.factor
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
              fontSize: "13px",
              fontWeight: "bold",
              color: item.points > 0 ? "#44FF44" : item.points < 0 ? "#FF4444" : "#888"
            }, children: [
              item.points > 0 ? "+" : "",
              item.points
            ] })
          ] }, idx)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            marginTop: "12px",
            padding: "8px",
            background: "rgba(68, 255, 68, 0.15)",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "12px"
          }, children: [
            "💡 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Your Score:" }),
            " ",
            activeData.score,
            "/100"
          ] })
        ] }),
        activeView === "current" && activeData.suggestions && activeData.suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "improvement-suggestions", style: {
          background: "rgba(255, 152, 0, 0.05)",
          border: "1px solid rgba(255, 152, 0, 0.3)",
          borderRadius: "12px",
          padding: "15px",
          margin: "15px 0"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: "0 0 15px 0", color: "#FFA500" }, children: "💡 Top Improvements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: activeData.suggestions.map((suggestion, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            background: "rgba(255, 152, 0, 0.1)",
            border: "1px solid rgba(255, 152, 0, 0.4)",
            borderRadius: "8px",
            padding: "12px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "16px", fontWeight: "bold", marginBottom: "5px" }, children: [
              suggestion.icon,
              " ",
              suggestion.action
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "13px", color: "#44FF44", marginBottom: "3px" }, children: [
              "Impact: ",
              suggestion.impact
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", fontStyle: "italic", opacity: 0.8 }, children: suggestion.reason })
          ] }, idx)) })
        ] }),
        activeView === "current" && activeData.dataBreakdown && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-sources", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📊 Your Real Health Data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-source", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-icon", children: "👟" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "data-label", children: [
                "Monthly Steps (",
                activeData.dataBreakdown.monthName,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-value", children: (activeData.dataBreakdown.totalMonthlySteps || 0).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "data-subtext", children: [
                activeData.dataBreakdown.stepsDays,
                " days this month"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-source", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-icon", children: "🍽️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "data-label", children: [
                "Food Scans (",
                activeData.dataBreakdown.monthName,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-value", children: activeData.dataBreakdown.foodLogsCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-subtext", children: "This month" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-source", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-icon", children: "💪" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "data-label", children: [
                "Workouts (",
                activeData.dataBreakdown.monthName,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-value", children: activeData.dataBreakdown.workoutsCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-subtext", children: "This month" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-source", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-icon", children: "🧬" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-label", children: "DNA Analysis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-value", children: activeData.dataBreakdown.hasDNAAnalysis ? "✅" : "❌" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-subtext", children: activeData.dataBreakdown.hasDNAAnalysis ? "Uploaded" : "Not uploaded" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-source", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-icon", children: "😴" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "data-label", children: [
                "Sleep Logs (",
                activeData.dataBreakdown.monthName,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-value", children: activeData.dataBreakdown.sleepLogsCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "data-subtext", children: "This month" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "data-note", children: [
            "💡 Your health score is calculated from ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "real activity data" }),
            " - not estimates!"
          ] })
        ] }),
        activeView === "current" && activeData.dataBreakdown.stepHistory && activeData.dataBreakdown.stepHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-history-section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
            "📅 ",
            activeData.dataBreakdown.monthName,
            " ",
            activeData.dataBreakdown.currentYear,
            " Step History"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-history-list", children: activeData.dataBreakdown.stepHistory.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((entry, idx) => {
            const steps = entry?.steps || 0;
            const date = entry?.date || "Unknown";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-history-item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "history-date", children: date }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "history-steps", children: [
                steps.toLocaleString(),
                " steps"
              ] })
            ] }, date + idx);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-summary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "📊 Total: ",
              activeData.dataBreakdown.totalMonthlySteps.toLocaleString(),
              " steps"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "📈 Average: ",
              activeData.dataBreakdown.avgDailySteps.toLocaleString(),
              " steps/day"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "💪" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Muscle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: activeData.visuals?.muscleTone })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "⚡" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Energy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: activeData.visuals?.energyLevel })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "✨" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Glow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: activeData.visuals?.glowEffect })
          ] })
        ] }),
        activeView !== "current" && activeData.warnings && activeData.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-warnings", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "⚠️ Health Warnings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: activeData.warnings.map((warning, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: warning }, idx)) })
        ] }),
        activeView !== "current" && activeData.improvements && activeData.improvements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-improvements", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "💡 How to Improve" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: activeData.improvements.map((improvement, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: improvement }, idx)) })
        ] }),
        activeView !== "current" && activeData.score < avatarState.current.score && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-cta", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🚀 Change Your Future NOW!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Small changes today = huge impact on your future health" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cta-button", onClick: onClose, children: "Start Improving Today" })
        ] }),
        activeView === "recommendations" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-recommendations-section", children: loadingRecommendations ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          textAlign: "center",
          padding: "40px 20px",
          color: "#FFA500"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🤖 Generating your personalized health plan..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "AI is analyzing your data..." })
        ] }) : aiRecommendations ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            background: "linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(76, 175, 80, 0.1))",
            border: "2px solid rgba(255, 152, 0, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: "0 0 10px 0", color: "#FFA500" }, children: "🤖 Your AI-Powered Health Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0", color: "#ddd", fontSize: "14px" }, children: [
              "Based on your current health score of ",
              avatarState.current.score,
              "/100, here are 5 personalized recommendations:"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "15px" }, children: aiRecommendations.map((rec, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            background: rec.priority === "critical" ? "rgba(255, 68, 68, 0.1)" : rec.priority === "high" ? "rgba(255, 152, 0, 0.1)" : "rgba(68, 255, 68, 0.1)",
            border: `2px solid ${rec.priority === "critical" ? "#FF4444" : rec.priority === "high" ? "#FFA500" : "#44FF44"}`,
            borderRadius: "12px",
            padding: "15px",
            position: "relative"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              position: "absolute",
              top: "10px",
              right: "10px",
              background: rec.priority === "critical" ? "#FF4444" : rec.priority === "high" ? "#FFA500" : "#44FF44",
              color: "#000",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "bold"
            }, children: [
              "#",
              idx + 1,
              " ",
              rec.difficulty.toUpperCase()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: "0 0 8px 0", color: "#FFF", fontSize: "16px" }, children: rec.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px 0", color: "#ddd", fontSize: "13px", lineHeight: "1.5" }, children: rec.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              background: "rgba(0, 0, 0, 0.3)",
              borderLeft: `4px solid ${rec.priority === "critical" ? "#FF4444" : rec.priority === "high" ? "#FFA500" : "#44FF44"}`,
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "4px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "13px", marginBottom: "5px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#FFA500" }, children: "Action:" }),
                " ",
                rec.action
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "13px", marginBottom: "5px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#44FF44" }, children: "Target:" }),
                " ",
                rec.target
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "13px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#88FF88" }, children: "When:" }),
                " ",
                rec.timeframe
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              background: "rgba(100, 200, 255, 0.1)",
              border: "1px solid rgba(100, 200, 255, 0.3)",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "8px",
              fontSize: "12px",
              color: "#AAD4FF"
            }, children: [
              "💡 ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pro Tip:" }),
              " ",
              rec.tip
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              fontSize: "12px",
              color: "#999",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "8px"
            }, children: [
              "📊 Improves: ",
              rec.impact
            ] })
          ] }, rec.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            background: "rgba(68, 255, 68, 0.1)",
            border: "1px solid rgba(68, 255, 68, 0.3)",
            borderRadius: "8px",
            padding: "15px",
            marginTop: "20px",
            textAlign: "center"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: "0 0 10px 0", color: "#44FF44" }, children: "🎯 Focus on #1 First" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0", fontSize: "13px", color: "#ddd" }, children: "These recommendations are prioritized. Tackle the top priority first for maximum impact. Small consistent steps lead to big results!" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          textAlign: "center",
          padding: "20px",
          color: "#FFA500"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No recommendations available. Ensure you have health data tracked." }) }) })
      ] })
    ] }),
    showPaywall && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PaywallModal,
      {
        isOpen: showPaywall,
        onClose,
        featureName: "Health Avatar",
        message: "🧬 Health Avatar requires Premium plan for AI-powered health predictions",
        currentPlan: userPlan
      }
    )
  ] });
}
export {
  HealthAvatar as default
};
