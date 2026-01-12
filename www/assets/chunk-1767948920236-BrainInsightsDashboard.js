import { r as reactExports, h as brainLearningService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function BrainInsightsDashboard({ onClose }) {
  const [insights, setInsights] = reactExports.useState(null);
  const [recommendations, setRecommendations] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    loadInsights();
    const interval = setInterval(loadInsights, 1e4);
    return () => clearInterval(interval);
  }, []);
  const loadInsights = async () => {
    try {
      setLoading(true);
      await brainLearningService.init();
      const report = brainLearningService.getLifeOptimizationReport();
      setInsights(report);
      const recs = brainLearningService.getPersonalizedRecommendations();
      setRecommendations(recs);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load Brain.js insights:", error);
      setLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brain-insights-modal", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "brain-insights-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "insights-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🧠 AI Learning Your Habits..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "close-btn", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "loading-brain", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brain-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Analyzing your behavior patterns..." })
      ] })
    ] }) });
  }
  if (!insights || insights.dataPoints === 0) {
    const dataStatus = {
      workouts: brainLearningService.trainingData.workouts?.length || 0,
      meals: brainLearningService.trainingData.meals?.length || 0,
      sleep: brainLearningService.trainingData.sleep?.length || 0,
      energy: brainLearningService.trainingData.energy?.length || 0,
      hydration: brainLearningService.trainingData.hydration?.length || 0,
      steps: brainLearningService.trainingData.steps?.length || 0
    };
    const dataRequirements = {
      workouts: 10,
      meals: 10,
      sleep: 7,
      hydration: 5,
      steps: 5
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brain-insights-modal", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "brain-insights-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "insights-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🧠 AI Life Optimizer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "close-btn", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "need-more-data", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🎯 Keep Tracking to Unlock AI Insights!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "The AI needs more data to learn your patterns and provide personalized recommendations." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-progress", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "progress-label", children: "💪 Workouts:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-bar-wrapper", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-fill", style: { width: `${Math.min(dataStatus.workouts / dataRequirements.workouts * 100, 100)}%`, background: "linear-gradient(90deg, #fa709a 0%, #fee140 100%)" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "progress-count", children: [
                dataStatus.workouts,
                "/",
                dataRequirements.workouts
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "progress-label", children: "🍽️ Meals:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-bar-wrapper", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-fill", style: { width: `${Math.min(dataStatus.meals / dataRequirements.meals * 100, 100)}%`, background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "progress-count", children: [
                dataStatus.meals,
                "/",
                dataRequirements.meals
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "progress-label", children: "😴 Sleep:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-bar-wrapper", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-fill", style: { width: `${Math.min(dataStatus.sleep / dataRequirements.sleep * 100, 100)}%`, background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "progress-count", children: [
                dataStatus.sleep,
                "/",
                dataRequirements.sleep,
                " nights"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "progress-label", children: "💧 Hydration:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-bar-wrapper", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-fill", style: { width: `${Math.min(dataStatus.hydration / dataRequirements.hydration * 100, 100)}%`, background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "progress-count", children: [
                dataStatus.hydration,
                "/",
                dataRequirements.hydration
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "progress-label", children: "🚶 Movement:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-bar-wrapper", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-fill", style: { width: `${Math.min(dataStatus.steps / dataRequirements.steps * 100, 100)}%`, background: "linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%)" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "progress-count", children: [
                dataStatus.steps,
                "/",
                dataRequirements.steps,
                " sessions"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "next-steps", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "📋 What to Do:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
            dataStatus.workouts < dataRequirements.workouts && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "✅ Log ",
              dataRequirements.workouts - dataStatus.workouts,
              " more workouts"
            ] }),
            dataStatus.meals < dataRequirements.meals && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "✅ Scan ",
              dataRequirements.meals - dataStatus.meals,
              " more meals with Food Scanner"
            ] }),
            dataStatus.sleep < dataRequirements.sleep && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "✅ Track sleep for ",
              dataRequirements.sleep - dataStatus.sleep,
              " more nights"
            ] }),
            dataStatus.hydration < dataRequirements.hydration && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "✅ Log water intake ",
              dataRequirements.hydration - dataStatus.hydration,
              " more times"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: "20px", fontSize: "14px", color: "#666" }, children: "🔒 All AI learning happens on your device. Data never leaves your phone." })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brain-insights-modal", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "brain-insights-content", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "insights-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🧠 AI Life Optimizer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "close-btn", children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "life-score-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "score-circle", style: {
        background: `conic-gradient(#10b981 ${insights.overallScore * 3.6}deg, #e5e7eb 0deg)`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-inner", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "score-value", children: insights.overallScore }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "score-label", children: "Life Score" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: insights.modelsTrainedCount }),
          " AI models trained"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: insights.dataPoints }),
          " data points analyzed"
        ] }),
        insights.showAccuracy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            Math.round(insights.accuracy),
            "%"
          ] }),
          " prediction accuracy"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Need 50+ data points for accuracy" }) })
      ] })
    ] }),
    recommendations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recommendations-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📋 Recommended Actions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recommendations-list", children: recommendations.map((rec, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `recommendation-card priority-${rec.priority}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rec-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rec-title", children: rec.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rec-confidence", children: [
            Math.round(rec.confidence * 100),
            "% sure"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rec-message", children: rec.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rec-type", children: rec.type })
      ] }, index)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-icon", children: "🏋️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Workout Optimization" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Best Time:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
              insights.workoutOptimization.bestTime,
              ":00"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Consistency:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
              Math.round(insights.workoutOptimization.consistency),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Improvement:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value trend-up", children: [
              insights.workoutOptimization.improvement > 0 ? "+" : "",
              Math.round(insights.workoutOptimization.improvement),
              "%"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-icon", children: "🍽️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Nutrition Optimization" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Healthy Meals:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
              Math.round(insights.nutritionOptimization.healthyChoiceRate),
              "%"
            ] })
          ] }),
          insights.nutritionOptimization.bestMealTimes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "meal-times", children: insights.nutritionOptimization.bestMealTimes.map((meal, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "meal-time-badge", children: [
            meal.type,
            ": ",
            meal.hour,
            ":00"
          ] }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-icon", children: "😴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Sleep Optimization" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "optimization-stats", children: insights.sleepOptimization.optimalSchedule ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Optimal Bedtime:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
              insights.sleepOptimization.optimalSchedule.bedtime,
              ":00"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Wake Time:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
              insights.sleepOptimization.optimalSchedule.wakeTime,
              ":00"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Avg Quality:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
              insights.sleepOptimization.averageQuality.toFixed(1),
              "/10"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "need-data-text", children: "Track sleep for 7+ nights for AI insights" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-icon", children: "⚡" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Energy Optimization" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "optimization-stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Avg Energy:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-value", children: [
              insights.energyOptimization.averageLevel.toFixed(1),
              "/10"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Trend:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `stat-value trend-${insights.energyOptimization.trend}`, children: insights.energyOptimization.trend === "improving" ? "📈 Improving" : insights.energyOptimization.trend === "declining" ? "📉 Declining" : "➡️ Stable" })
          ] }),
          insights.energyOptimization.peakTimes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "peak-times", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Peak Times:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "time-badges", children: insights.energyOptimization.peakTimes.map((hour, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "time-badge", children: [
              hour,
              ":00"
            ] }, i)) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "predictions-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🔮 AI Predictions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "predictions-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prediction-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-label", children: "Best Workout Time Today:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pred-value", children: [
            brainLearningService.predictBestWorkoutTime().hour,
            ":00"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pred-confidence", children: [
            Math.round(brainLearningService.predictBestWorkoutTime().confidence * 100),
            "% confident"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prediction-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-label", children: "Current Energy Level:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pred-value", children: [
            brainLearningService.predictEnergyLevel().level,
            "/10"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-confidence", children: "Real-time prediction" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prediction-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-label", children: "Predicted Mood:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-value", children: brainLearningService.predictMood().mood }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-confidence", children: "Based on patterns" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prediction-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-label", children: "Stress Level:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pred-value", children: [
            brainLearningService.predictStressLevel().level,
            "/10"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pred-confidence", children: "Predicted risk" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "how-it-works", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🤖 How AI Learns Your Habits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "learning-steps", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-number", children: "1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Data Collection" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Tracks workouts, meals, sleep, location, energy, mood, stress, and activities" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-number", children: "2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Pattern Recognition" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Brain.js neural networks identify patterns in your behavior and health metrics" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-number", children: "3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Prediction & Optimization" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Predicts optimal times for activities and provides personalized recommendations" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-number", children: "4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "Continuous Learning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Models retrain daily, improving accuracy as you use the app more" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "insights-footer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadInsights, className: "refresh-btn", children: "🔄 Refresh Insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "privacy-note", children: "🔒 All AI learning happens on your device. Your data never leaves your phone." })
    ] })
  ] }) });
}
export {
  BrainInsightsDashboard as default
};
