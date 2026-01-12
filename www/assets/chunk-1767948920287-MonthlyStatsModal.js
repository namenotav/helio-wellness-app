const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { r as reactExports, a as authService, f as firestoreService, P as Preferences, _ as __vitePreload, j as jsxRuntimeExports, T as E, C as Capacitor, U as Filesystem, V as Directory, S as Share } from "./entry-1767948920134-index.js";
const monthDataCache = {};
function MonthlyStatsModal({ onClose }) {
  console.log("🎬 [MONTHLY STATS] MODAL COMPONENT MOUNTED!");
  const [selectedMonth, setSelectedMonth] = reactExports.useState(/* @__PURE__ */ new Date());
  const [monthlyStats, setMonthlyStats] = reactExports.useState({
    totalSteps: 0,
    avgStepsPerDay: 0,
    totalWorkouts: 0,
    totalWorkoutMinutes: 0,
    totalCaloriesConsumed: 0,
    totalCaloriesBurned: 0,
    netCalories: 0,
    totalWaterCups: 0,
    totalMeditationMinutes: 0,
    longestStreak: 0,
    activeDays: 0,
    weightChange: 0
  });
  const [loading, setLoading] = reactExports.useState(true);
  const [availableMonths, setAvailableMonths] = reactExports.useState([]);
  reactExports.useEffect(() => {
    console.log("⚡ [MONTHLY STATS] useEffect triggered! selectedMonth:", selectedMonth);
    loadMonthlyData();
  }, [selectedMonth]);
  const loadMonthlyData = async () => {
    console.log("🚀 [MONTHLY STATS] loadMonthlyData() called");
    setLoading(true);
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const cacheKey = `${year}-${month}`;
      if (monthDataCache[cacheKey]) {
        console.log("📦 [CACHE] Loading from cache:", cacheKey);
        setMonthlyStats(monthDataCache[cacheKey]);
        setLoading(false);
        return;
      }
      const userId = authService.getCurrentUser()?.uid || "local_user";
      console.log("👤 [MONTHLY STATS] User ID:", userId);
      if (!userId || userId === "local_user") {
        console.log("⚠️ [MONTHLY STATS] No Firebase user, using localStorage data only");
      }
      console.log(`📅 Loading Monthly Stats for ${year}-${month + 1} (month index=${month})...`);
      const firestoreStepHistory = await firestoreService.get("stepHistory", userId) || [];
      let todayLiveSteps = 0;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      try {
        const { value } = await Preferences.get({ key: "wellnessai_todaySteps" });
        if (value) {
          todayLiveSteps = parseInt(JSON.parse(value)) || 0;
          console.log(`📱 [MONTHLY STATS] Live today steps from Preferences: ${todayLiveSteps}`);
        }
      } catch (e) {
        console.warn("⚠️ Could not read live today steps:", e);
      }
      console.log(`📊 Step data sources: localStorage=${stepHistory.length}, Firestore=${firestoreStepHistory.length}, Live today=${todayLiveSteps}`);
      if (stepHistory.length > 0) {
        console.log(`   Sample localStorage step entry:`, stepHistory[0]);
      }
      if (firestoreStepHistory.length > 0) {
        console.log(`   Sample Firestore step entry:`, firestoreStepHistory[0]);
      }
      const todayEntry = todayLiveSteps > 0 ? [{
        date: today,
        steps: todayLiveSteps,
        timestamp: Date.now(),
        source: "preferences_live"
      }] : [];
      const allSteps = [...firestoreStepHistory, ...todayEntry];
      const stepMap = /* @__PURE__ */ new Map();
      allSteps.forEach((item) => {
        const existing = stepMap.get(item.date);
        if (!existing || (item.steps || 0) > (existing.steps || 0)) {
          stepMap.set(item.date, item);
        }
      });
      const uniqueSteps = Array.from(stepMap.values());
      const monthSteps = uniqueSteps.filter((entry) => {
        const entryDate = new Date(entry.date);
        const matches = entryDate.getFullYear() === year && entryDate.getMonth() === month;
        return matches;
      });
      console.log(`🔍 Filtered ${uniqueSteps.length} step entries to ${monthSteps.length} for ${year}-${month + 1}`);
      if (uniqueSteps.length > 0 && monthSteps.length === 0) {
        console.warn(`⚠️ NO STEPS MATCHED! Checking dates...`);
        uniqueSteps.slice(0, 5).forEach((entry) => {
          const d = new Date(entry.date);
          console.log(`   Entry date: ${entry.date} → Year: ${d.getFullYear()}, Month: ${d.getMonth()} (looking for Year: ${year}, Month: ${month})`);
        });
      }
      const totalSteps = monthSteps.reduce((sum, entry) => sum + (entry.steps || 0), 0);
      const avgSteps = monthSteps.length > 0 ? Math.round(totalSteps / monthSteps.length) : 0;
      console.log(`🚶 Monthly Steps: ${totalSteps} total, ${monthSteps.length} days, ${avgSteps} avg/day`);
      const firestoreWorkouts = await firestoreService.get("workoutHistory", userId) || [];
      const allWorkouts = [...firestoreWorkouts];
      const uniqueWorkouts = Array.from(
        new Map(allWorkouts.map((item) => [item.timestamp || item.date, item])).values()
      );
      const monthWorkouts = uniqueWorkouts.filter((w) => {
        const workoutDate = new Date(w.date || w.timestamp);
        return workoutDate.getFullYear() === year && workoutDate.getMonth() === month;
      });
      const totalWorkouts = monthWorkouts.length;
      const totalWorkoutMinutes = monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      console.log(`💪 Monthly Workouts: ${totalWorkouts} total, ${totalWorkoutMinutes} minutes`);
      console.log(`📊 Data sources: localStorage=${localWorkouts.length}, Firestore=${firestoreWorkouts.length}, Merged=${uniqueWorkouts.length}`);
      const userFoodLog = authService.getCurrentUser()?.profile?.foodLog || [];
      let preferencesFoodLog = [];
      try {
        const { value: foodLogJson } = await __vitePreload(() => import("./entry-1767948920134-index.js").then((n) => n.a3), true ? __vite__mapDeps([0,1]) : void 0).then((m) => m.Preferences.get({ key: "foodLog" }));
        preferencesFoodLog = foodLogJson ? JSON.parse(foodLogJson) : [];
      } catch (err) {
        console.warn("Could not read foodLog from Preferences:", err);
      }
      let firestoreFoodLog = [];
      try {
        firestoreFoodLog = await firestoreService.get("foodLog") || [];
        console.log(`🔥 Firestore food log: ${firestoreFoodLog.length} items`);
      } catch (err) {
        console.warn("Could not read foodLog from Firestore:", err);
      }
      const allFood = [...userFoodLog, ...preferencesFoodLog, ...firestoreFoodLog];
      const uniqueFood = Array.from(
        new Map(allFood.map((item) => [item.timestamp || item.id, item])).values()
      );
      console.log(`🍽️ Food data sources: userProfile=${userFoodLog.length}, Preferences=${preferencesFoodLog.length}, localStorage=${localFoodLog.length}, Merged=${uniqueFood.length}`);
      const monthFood = uniqueFood.filter((f) => {
        const foodDate = new Date(f.timestamp || f.date);
        return foodDate.getFullYear() === year && foodDate.getMonth() === month;
      });
      const totalCaloriesConsumed = monthFood.reduce((sum, f) => sum + (f.calories || 0), 0);
      console.log(`🍽️ Monthly Food: ${totalCaloriesConsumed} calories from ${monthFood.length} meals`);
      console.log(`📊 Data sources: localStorage=${localFoodLog.length}, Firestore=${firestoreFoodLog.length}, Merged=${uniqueFood.length}`);
      const stepCalories = totalSteps * 0.04;
      const calorieRateMap = {
        "Running": 11,
        "Cycling": 10,
        "Swimming": 12,
        "Weights": 7,
        "Yoga": 3,
        "HIIT": 13,
        "Walking": 5,
        "Sports": 9,
        "Other": 7
      };
      let workoutCalories = 0;
      monthWorkouts.forEach((workout) => {
        const type = workout.type || workout.activity || "Other";
        const rate = calorieRateMap[type] || 7;
        workoutCalories += (workout.duration || 0) * rate;
      });
      const totalCaloriesBurned = Math.round(stepCalories + workoutCalories);
      const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
      const firestoreWaterLog = await firestoreService.get("waterLog", userId) || [];
      const allWater = [...firestoreWaterLog];
      const uniqueWater = Array.from(
        new Map(allWater.map((item) => [`${item.date}-${item.timestamp}`, item])).values()
      );
      const monthWater = uniqueWater.filter((w) => {
        const waterDate = new Date(w.date || w.timestamp);
        return waterDate.getFullYear() === year && waterDate.getMonth() === month;
      });
      const totalWaterCups = monthWater.reduce((sum, w) => sum + (w.cups || 1), 0);
      console.log(`💧 Monthly Water: ${totalWaterCups} cups from ${monthWater.length} entries`);
      console.log(`📊 Data sources: localStorage=${localWaterLog.length}, Firestore=${firestoreWaterLog.length}, Merged=${uniqueWater.length}`);
      let meditationMinutes = 0;
      try {
        const { value: medPrefs } = await Preferences.get({ key: "wellnessai_meditation_stats" });
        if (medPrefs) {
          const medStats = JSON.parse(medPrefs);
          meditationMinutes = medStats.totalMinutes || medStats.minutesToday || 0;
        } else {
          meditationMinutes = parseInt(localStorage.getItem("meditation_sessions_total") || "0");
        }
      } catch (e) {
        meditationMinutes = parseInt(localStorage.getItem("meditation_sessions_total") || "0");
      }
      const activeDays = monthSteps.length;
      const months = uniqueSteps.map((s) => {
        const d = new Date(s.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      });
      const uniqueMonths = [...new Set(months)].sort().reverse();
      setAvailableMonths(uniqueMonths);
      const statsData = {
        totalSteps,
        avgStepsPerDay: avgSteps,
        totalWorkouts,
        totalWorkoutMinutes,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        netCalories,
        totalWaterCups,
        totalMeditationMinutes: meditationMinutes,
        longestStreak: 0,
        // TODO: Calculate from streak history
        activeDays,
        weightChange: 0
        // TODO: Calculate from weight log
      };
      monthDataCache[cacheKey] = statsData;
      setMonthlyStats(statsData);
    } catch (error) {
      console.error("❌ [MONTHLY STATS] Failed to load monthly stats:", error);
      console.error("Stack:", error.stack);
    } finally {
      setLoading(false);
    }
  };
  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };
  const exportMonthlyReport = async () => {
    try {
      const doc = new E();
      const monthYear = formatMonthYear(selectedMonth);
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      doc.setFontSize(20);
      doc.text("Helio Monthly Health Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Period: ${monthYear}`, 20, 30);
      doc.setFontSize(14);
      doc.text("Activity Summary", 20, 45);
      doc.setFontSize(11);
      let y = 55;
      doc.text(`Total Steps: ${monthlyStats.totalSteps.toLocaleString()}`, 25, y);
      y += 7;
      doc.text(`Average Steps/Day: ${monthlyStats.avgStepsPerDay.toLocaleString()}`, 25, y);
      y += 7;
      doc.text(`Active Days: ${monthlyStats.activeDays}`, 25, y);
      y += 7;
      doc.text(`Consistency: ${Math.round(monthlyStats.activeDays / 30 * 100)}%`, 25, y);
      y += 15;
      doc.setFontSize(14);
      doc.text("Workout Summary", 20, y);
      y += 10;
      doc.setFontSize(11);
      doc.text(`Total Workouts: ${monthlyStats.totalWorkouts}`, 25, y);
      y += 7;
      doc.text(`Total Minutes: ${monthlyStats.totalWorkoutMinutes}`, 25, y);
      y += 7;
      doc.text(`Average Duration: ${monthlyStats.totalWorkouts > 0 ? Math.round(monthlyStats.totalWorkoutMinutes / monthlyStats.totalWorkouts) : 0} min/workout`, 25, y);
      y += 15;
      doc.setFontSize(14);
      doc.text("Nutrition Summary", 20, y);
      y += 10;
      doc.setFontSize(11);
      doc.text(`Calories Consumed: ${monthlyStats.totalCaloriesConsumed.toLocaleString()}`, 25, y);
      y += 7;
      doc.text(`Calories Burned: ${monthlyStats.totalCaloriesBurned.toLocaleString()}`, 25, y);
      y += 7;
      doc.text(`Net Calories: ${monthlyStats.netCalories > 0 ? "+" : ""}${monthlyStats.netCalories.toLocaleString()}`, 25, y);
      y += 7;
      doc.text(`Water Intake: ${monthlyStats.totalWaterCups} cups (${(monthlyStats.totalWaterCups / 30).toFixed(1)}/day)`, 25, y);
      y += 15;
      if (monthlyStats.totalMeditationMinutes > 0) {
        doc.setFontSize(14);
        doc.text("Mental Wellness", 20, y);
        y += 10;
        doc.setFontSize(11);
        doc.text(`Meditation Minutes: ${monthlyStats.totalMeditationMinutes}`, 25, y);
        y += 7;
      }
      doc.setFontSize(8);
      doc.text("Generated by Helio/WellnessAI", 20, 280);
      doc.text("Keep crushing your goals!", 20, 285);
      if (Capacitor.isNativePlatform()) {
        const pdfBase64 = doc.output("datauristring").split(",")[1];
        const result = await Filesystem.writeFile({
          path: `helio-monthly-${timestamp}.pdf`,
          data: pdfBase64,
          directory: Directory.Cache
        });
        await Share.share({
          title: "Monthly Health Report",
          text: `Your ${monthYear} health summary`,
          url: result.uri,
          dialogTitle: "Share monthly report"
        });
        alert("✅ Monthly report ready to share!");
      } else {
        doc.save(`helio-monthly-${timestamp}.pdf`);
      }
    } catch (error) {
      console.error("Failed to export monthly report:", error);
      alert("Export failed: " + error.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monthly-stats-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "📊 Monthly Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: exportMonthlyReport, style: {
          background: "linear-gradient(135deg, #8B5FE8, #B794F6)",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          color: "white",
          fontSize: "14px",
          cursor: "pointer",
          fontWeight: "bold"
        }, children: "📄 Export PDF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "month-selector", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => changeMonth(-1), className: "month-nav-btn", children: "◀" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: formatMonthYear(selectedMonth) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => changeMonth(1),
          className: "month-nav-btn",
          disabled: selectedMonth.getMonth() === (/* @__PURE__ */ new Date()).getMonth(),
          children: "▶"
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Loading monthly data..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monthly-stats-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "👟" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: monthlyStats.totalSteps.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Steps" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
          monthlyStats.avgStepsPerDay.toLocaleString(),
          " avg/day"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "💪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: monthlyStats.totalWorkouts }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Workouts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
          monthlyStats.totalWorkoutMinutes,
          " minutes"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🍽️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: monthlyStats.totalCaloriesConsumed.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Calories Consumed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
          Math.round(monthlyStats.totalCaloriesConsumed / 30),
          " avg/day"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🔥" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: monthlyStats.totalCaloriesBurned.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Calories Burned" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
          Math.round(monthlyStats.totalCaloriesBurned / 30),
          " avg/day"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `stat-card ${monthlyStats.netCalories < 0 ? "deficit" : "surplus"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: monthlyStats.netCalories < 0 ? "📉" : "📈" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
          monthlyStats.netCalories > 0 ? "+" : "",
          monthlyStats.netCalories.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Net Calories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-sublabel", children: monthlyStats.netCalories < 0 ? "Deficit (Great!)" : "Surplus" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "💧" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: monthlyStats.totalWaterCups }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Cups of Water" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
          (monthlyStats.totalWaterCups / 30).toFixed(1),
          " avg/day"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🧘" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: monthlyStats.totalMeditationMinutes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Meditation Minutes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
          monthlyStats.activeDays,
          " active days"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "📅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: monthlyStats.activeDays }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Active Days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sublabel", children: [
          Math.round(monthlyStats.activeDays / 30 * 100),
          "% consistency"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "month-selector-dropdown", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "select",
      {
        value: `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`,
        onChange: (e) => {
          const [year, month] = e.target.value.split("-");
          setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1));
        },
        children: availableMonths.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-US", { month: "long", year: "numeric" }) }, m))
      }
    ) })
  ] }) });
}
export {
  MonthlyStatsModal as default
};
