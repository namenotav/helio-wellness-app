const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920209-smartFoodSearch.js","assets/chunk-1767948920209-usdaService.js","assets/chunk-1767948920209-restaurantService.js","assets/chunk-1767948920161-barcodeScannerService.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css","assets/chunk-1767948920163-index.js"])))=>i.map(i=>d[i]);
import { r as reactExports, a as authService, j as jsxRuntimeExports, z as subscriptionService, _ as __vitePreload, y as showToast } from "./entry-1767948920134-index.js";
import { a as aiVisionService } from "./chunk-1767948920252-aiVisionService.js";
/* empty css                                 */
import "./chunk-1767948920163-index.js";
function FoodScanner({ onClose, initialMode = null, lockMode = false, initialTab = "usda" }) {
  const [scanMode, setScanMode] = reactExports.useState(initialMode || "food");
  const [analyzing, setAnalyzing] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [allergenProfile, setAllergenProfile] = reactExports.useState(null);
  const [showPaywall, setShowPaywall] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const profile = authService.getUserAllergenProfile();
    setAllergenProfile(profile || { allergens: [], intolerances: [], dietaryPreferences: [], allergenSeverity: {} });
    const scanHistory = localStorage.getItem("foodScans");
    if (scanHistory) {
      JSON.parse(scanHistory);
    }
  }, []);
  const handleScanFood = async () => {
    if (!subscriptionService.hasAccess("foodScanner")) {
      setShowPaywall(true);
      return;
    }
    const limit = subscriptionService.checkLimit("foodScans");
    if (!limit.allowed) {
      setShowPaywall(true);
      return;
    }
    setError("");
    setResult(null);
    setAnalyzing(true);
    try {
      if (false) ;
      if (false) ;
      const photoResult = await aiVisionService.captureFoodPhoto();
      if (false) ;
      if (!photoResult.success) {
        throw new Error(photoResult.error || "Failed to capture photo");
      }
      if (scanMode === "halal") {
        if (false) ;
        const analysisResult2 = await aiVisionService.analyzeHalalStatus(photoResult.imageData);
        if (!analysisResult2.success) {
          throw new Error(analysisResult2.error || "Halal analysis failed");
        }
        if (false) ;
        setResult({
          ...analysisResult2.analysis,
          imageData: photoResult.imageData,
          scanMode: "halal"
        });
        subscriptionService.incrementUsage("foodScans");
        const newLimit2 = subscriptionService.checkLimit("foodScans");
        if (false) ;
        setAnalyzing(false);
        return;
      }
      if (false) ;
      const analysisResult = scanMode === "food" ? await aiVisionService.analyzeFoodImage(photoResult.imageData) : await aiVisionService.analyzeIngredientLabel(photoResult.imageData);
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || "Analysis failed");
      }
      const foodName = analysisResult.analysis.foodName || analysisResult.analysis.food;
      const smartFoodSearch = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./chunk-1767948920209-smartFoodSearch.js");
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([0,1,2,3,4,5,6]) : void 0)).default;
      const databaseMatches = await smartFoodSearch.searchAllDatabases(foodName);
      setResult({
        ...analysisResult.analysis,
        imageData: photoResult.imageData,
        databaseMatches,
        // All database results
        bestMatch: databaseMatches.length > 0 ? databaseMatches[0] : null
        // Best nutrition data
      });
      const syncService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a4);
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([4,5]) : void 0)).default;
      await syncService.syncNutrition({
        foodName: analysisResult.analysis.foodName,
        calories: analysisResult.analysis.nutrition?.calories || 0,
        timestamp: Date.now(),
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      });
      if (false) ;
      subscriptionService.incrementUsage("foodScans");
      const newLimit = subscriptionService.checkLimit("foodScans");
      if (false) ;
      if (analysisResult.analysis.safetyLevel !== "danger") {
        await authService.logFood({
          name: analysisResult.analysis.foodName,
          ingredients: analysisResult.analysis.ingredients,
          allergens: analysisResult.analysis.detectedAllergens,
          safety: analysisResult.analysis.safetyLevel
        });
        const totalScans = parseInt(localStorage.getItem("total_scans") || "0");
        const todayScans = parseInt(localStorage.getItem("scans_today") || "0");
        const scanCalories = databaseMatches.length > 0 ? databaseMatches[0].calories || 0 : 0;
        const totalCalories = parseInt(localStorage.getItem("calories_tracked") || "0");
        localStorage.setItem("total_scans", (totalScans + 1).toString());
        localStorage.setItem("scans_today", (todayScans + 1).toString());
        localStorage.setItem("scans_today_date", (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
        localStorage.setItem("calories_tracked", (totalCalories + scanCalories).toString());
        const recentScans = JSON.parse(localStorage.getItem("recent_scans") || "[]");
        recentScans.unshift({
          name: analysisResult.analysis.foodName,
          calories: scanCalories,
          time: "Just now",
          icon: "📸"
        });
        const updatedRecentScans = recentScans.slice(0, 10);
        localStorage.setItem("recent_scans", JSON.stringify(updatedRecentScans));
        try {
          const { Preferences } = await __vitePreload(async () => {
            const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
            return { Preferences: Preferences2 };
          }, true ? __vite__mapDeps([4,5]) : void 0);
          await Preferences.set({ key: "wellnessai_total_scans", value: (totalScans + 1).toString() });
          await Preferences.set({ key: "wellnessai_scans_today", value: (todayScans + 1).toString() });
          await Preferences.set({ key: "wellnessai_scans_today_date", value: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
          await Preferences.set({ key: "wellnessai_calories_tracked", value: (totalCalories + scanCalories).toString() });
          await Preferences.set({ key: "wellnessai_recent_scans", value: JSON.stringify(updatedRecentScans) });
          if (false) ;
        } catch (e) {
          console.warn("Could not save scan stats to Preferences:", e);
        }
        try {
          const firestoreService = (await __vitePreload(async () => {
            const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a5);
            return { default: __vite_default__ };
          }, true ? __vite__mapDeps([4,5]) : void 0)).default;
          const authService2 = (await __vitePreload(async () => {
            const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a7);
            return { default: __vite_default__ };
          }, true ? __vite__mapDeps([4,5]) : void 0)).default;
          const user = authService2.getCurrentUser();
          if (user?.uid) {
            await firestoreService.save("total_scans", totalScans + 1, user.uid);
            await firestoreService.save("scans_today", todayScans + 1, user.uid);
            await firestoreService.save("scans_today_date", (/* @__PURE__ */ new Date()).toISOString().split("T")[0], user.uid);
            await firestoreService.save("calories_tracked", totalCalories + scanCalories, user.uid);
            await firestoreService.save("recent_scans", updatedRecentScans, user.uid);
            if (false) ;
          }
        } catch (e) {
          console.warn("Could not sync scan stats to Firebase (will retry):", e);
        }
        if (window.addPoints) {
          window.addPoints(5, { x: window.innerWidth / 2, y: 100 });
        }
        if (window.updateDailyChallenge) {
          window.updateDailyChallenge("scan_food", 1);
        }
        if (false) ;
      }
    } catch (err) {
      let errorMsg = err.message || "Scanner error";
      if (errorMsg.includes("Server Error: 413")) {
        errorMsg = "❌ Image too large. Try again with better lighting.";
      } else if (errorMsg.includes("API Error: 400") || errorMsg.includes("Server Error: 400")) {
        errorMsg = "❌ Image format error. Please try again.";
      } else if (errorMsg.includes("API Error: 401") || errorMsg.includes("Server Error: 401")) {
        errorMsg = "❌ Your API key was reported as leaked. Please use another API key.";
      } else if (errorMsg.includes("API Error: 429") || errorMsg.includes("Server Error: 429")) {
        errorMsg = "❌ Too many requests. Please wait a moment.";
      } else if (errorMsg.includes("Invalid API response")) {
        errorMsg = "❌ AI service error. Please try again.";
      } else if (errorMsg.includes("Empty response")) {
        errorMsg = "❌ No analysis returned. Try a clearer photo.";
      } else if (errorMsg.includes("Failed to fetch") || errorMsg.includes("Network")) {
        errorMsg = "❌ Network error. Check your internet connection.";
      } else {
        errorMsg = `❌ ${errorMsg}`;
      }
      setError(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };
  const handleLogSymptom = async () => {
    if (!result) return;
    const symptomData = {
      relatedFood: result.foodName,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      severity: "mild"
      // Default
    };
    await authService.logSymptom(symptomData);
    showToast("Symptom logged for AI learning", "success");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "food-scanner-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "food-scanner", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "scanner-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "scanner-title", children: "🔍 AI Food Scanner" }),
    (() => {
      const subscriptionService2 = window.subscriptionService;
      if (subscriptionService2) {
        const limit = subscriptionService2.checkLimit("foodScans");
        const isPremium = subscriptionService2.hasAccess("foodScanner");
        if (!isPremium) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            marginBottom: "15px",
            padding: "10px 16px",
            background: limit.remaining <= 0 ? "rgba(255, 68, 68, 0.2)" : "rgba(76, 175, 80, 0.2)",
            borderRadius: "20px",
            fontSize: "14px",
            color: limit.remaining <= 0 ? "#FF4444" : "#4CAF50",
            fontWeight: "bold",
            border: `2px solid ${limit.remaining <= 0 ? "#FF4444" : "rgba(76, 175, 80, 0.4)"}`,
            textAlign: "center"
          }, children: limit.remaining > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "📸 ",
            limit.remaining,
            "/",
            limit.limit,
            " scans left today"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "🔒 Daily scans used - Upgrade for unlimited!" }) });
        }
      }
      return null;
    })(),
    !lockMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-mode-toggle", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `mode-btn ${scanMode === "food" ? "active" : ""}`,
          onClick: () => setScanMode("food"),
          children: "📸 Scan Food"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `mode-btn ${scanMode === "label" ? "active" : ""}`,
          onClick: () => setScanMode("label"),
          children: "🏷️ Scan Label"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `mode-btn ${scanMode === "halal" ? "active" : ""}`,
          onClick: () => setScanMode("halal"),
          children: "🕌 Halal Check"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `mode-btn ${scanMode === "search" ? "active" : ""}`,
          onClick: () => setScanMode("search"),
          children: "🔍 Search 6M Foods"
        }
      )
    ] }),
    allergenProfile && allergenProfile.allergens?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "allergen-summary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Your Allergens:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "allergen-badges", children: allergenProfile.allergens.map((allergen, idx) => {
        const severity = allergenProfile.allergenSeverity?.[allergen] || "moderate";
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `allergen-badge ${severity}`, children: allergen }, idx);
      }) })
    ] }),
    scanMode === "search" && !result && /* @__PURE__ */ jsxRuntimeExports.jsx(SearchFoods, { onClose, initialTab }),
    !result && scanMode !== "search" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "scan-button",
        onClick: handleScanFood,
        disabled: analyzing,
        "aria-label": "Start camera to scan food",
        children: analyzing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "spinner", children: "⏳" }),
          "Analyzing..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "📷 ",
          scanMode === "food" ? "Scan Food" : scanMode === "halal" ? "Check Halal Status" : "Scan Ingredient Label"
        ] })
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scanner-error", children: [
      "❌ ",
      error
    ] }),
    result && scanMode === "halal" && result.halalStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-results", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "result-image", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: `data:image/jpeg;base64,${result.imageData}`,
          alt: "Scanned product"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `halal-verdict ${result.halalStatus}`, children: [
        result.halalStatus === "halal" && "✅ HALAL",
        result.halalStatus === "haram" && "❌ HARAM",
        result.halalStatus === "doubtful" && "⚠️ DOUBTFUL (MUSHBOOH)",
        result.halalStatus === "uncertain" && "❓ UNCERTAIN"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-confidence", children: [
        "Confidence: ",
        result.confidence,
        "%"
      ] }),
      result.certifications && result.certifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🏅 Certifications Found:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: result.certifications.map((cert, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "cert-item", children: cert }, idx)) })
      ] }),
      result.haramIngredients && result.haramIngredients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-section danger", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🚫 Haram Ingredients:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: result.haramIngredients.map((ing, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "haram-item", children: ing }, idx)) })
      ] }),
      result.doubtfulIngredients && result.doubtfulIngredients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-section warning", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "⚠️ Doubtful Ingredients:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: result.doubtfulIngredients.map((ing, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "doubtful-item", children: ing }, idx)) })
      ] }),
      result.eCodes && result.eCodes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🔢 E-Codes Found:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: result.eCodes.map((code, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "ecode-item", children: code }, idx)) })
      ] }),
      result.crossContamination && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "⚗️ Cross-Contamination:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: result.crossContamination })
      ] }),
      result.recommendation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-section recommendation", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "💡 Recommendation:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: result.recommendation })
      ] }),
      result.details && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "halal-section details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "📋 Detailed Analysis:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: result.details })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "action-btn", onClick: handleScanFood, children: "📷 Scan Another Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "action-btn secondary", onClick: () => setResult(null), children: "← Back" })
      ] })
    ] }),
    result && scanMode !== "halal" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-results", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "result-image", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: `data:image/jpeg;base64,${result.imageData}`,
          alt: "Scanned food"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `safety-banner ${result.safetyLevel}`,
          style: { backgroundColor: result.safetyColor },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "safety-icon", children: result.safetyIcon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "safety-text", children: result.safetyMessage })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "food-name", children: result.foodName }),
      result.confidence !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: result.confidence >= 80 ? "linear-gradient(135deg, #10b981, #059669)" : result.confidence >= 60 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #ef4444, #dc2626)",
        padding: "12px 16px",
        borderRadius: "10px",
        marginBottom: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "20px" }, children: result.confidence >= 80 ? "✅" : result.confidence >= 60 ? "⚠️" : "❌" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "white", fontWeight: "bold", fontSize: "14px" }, children: [
              "AI Confidence: ",
              result.confidence,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "rgba(255,255,255,0.9)", fontSize: "12px" }, children: result.confidence >= 80 ? "High confidence - nutrition data should be accurate" : result.confidence >= 60 ? "Moderate confidence - please review values below" : "Low confidence - consider manually editing nutrition values" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              const newProtein = prompt("Enter protein (grams):", result.protein || 0);
              const newCarbs = prompt("Enter carbs (grams):", result.carbs || result.carbohydrates || 0);
              const newFat = prompt("Enter fat (grams):", result.fat || result.fats || 0);
              const newCalories = prompt("Enter calories:", result.calories || 0);
              if (newProtein !== null && newCarbs !== null && newFat !== null && newCalories !== null) {
                setResult({
                  ...result,
                  protein: parseFloat(newProtein),
                  carbs: parseFloat(newCarbs),
                  carbohydrates: parseFloat(newCarbs),
                  fat: parseFloat(newFat),
                  fats: parseFloat(newFat),
                  calories: parseFloat(newCalories),
                  confidence: 100
                  // Mark as manually verified
                });
                showToast("✅ Nutrition values updated", "success");
              }
            },
            style: {
              background: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap"
            },
            children: "✏️ Edit Values"
          }
        )
      ] }),
      result.databaseMatches && result.databaseMatches.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f9ff", padding: "15px", borderRadius: "12px", marginBottom: "15px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { style: { margin: "0 0 10px 0", fontSize: "14px", color: "#0284c7" }, children: [
          "🔍 Found ",
          result.databaseMatches.length,
          " matches in databases"
        ] }),
        result.bestMatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "white", padding: "12px", borderRadius: "8px", marginBottom: "10px", border: "2px solid #0284c7" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "18px" }, children: result.bestMatch.sourceBadge }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { fontSize: "15px" }, children: result.bestMatch.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: "auto", fontSize: "11px", padding: "3px 8px", background: "#dcfce7", color: "#166534", borderRadius: "12px", fontWeight: "bold" }, children: "BEST MATCH" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "13px", color: "#666" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: result.bestMatch.calories }),
            " cal |",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: " P:" }),
            " ",
            result.bestMatch.protein,
            "g |",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: " C:" }),
            " ",
            result.bestMatch.carbs || result.bestMatch.carbohydrates,
            "g |",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: " F:" }),
            " ",
            result.bestMatch.fat || result.bestMatch.fats,
            "g"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#999", marginTop: "4px" }, children: result.bestMatch.brand || result.bestMatch.restaurantName || result.bestMatch.source })
        ] }),
        result.databaseMatches.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { style: { fontSize: "13px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { style: { cursor: "pointer", color: "#0284c7", fontWeight: "bold" }, children: [
            "View all ",
            result.databaseMatches.length,
            " options →"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxHeight: "150px", overflowY: "auto", marginTop: "10px" }, children: result.databaseMatches.slice(1, 6).map((match, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "white", padding: "8px", marginBottom: "6px", borderRadius: "6px", fontSize: "12px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: match.sourceBadge }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: match.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#666", fontSize: "11px", marginTop: "2px" }, children: [
              match.calories,
              " cal | P: ",
              match.protein,
              "g | C: ",
              match.carbs || match.carbohydrates,
              "g | F: ",
              match.fat || match.fats,
              "g"
            ] })
          ] }, idx)) })
        ] })
      ] }),
      result.detectedAllergens && result.detectedAllergens.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detected-allergens", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "⚠️ Detected Allergens:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: result.detectedAllergens.map((allergen, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "allergen-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: allergen.name }),
          allergen.location && ` - Found in: ${allergen.location}`,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `confidence ${allergen.confidence}`, children: [
            allergen.confidence,
            " confidence"
          ] })
        ] }, idx)) })
      ] }),
      result.ingredients && result.ingredients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ingredients-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "📋 Ingredients:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ingredient-chips", children: result.ingredients.map((ing, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ingredient-chip", children: ing }, idx)) })
      ] }),
      result.hiddenIngredients && result.hiddenIngredients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden-ingredients", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🔍 Likely Hidden Ingredients:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: result.hiddenIngredients.map((ing, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: ing }, idx)) })
      ] }),
      result.alternatives && result.alternatives.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "alternatives", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "💡 Make It Safe:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: result.alternatives.map((alt, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: alt }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "confidence-bar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "AI Confidence:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fill",
            style: { width: `${result.confidence}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          result.confidence,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "action-btn", onClick: handleScanFood, children: "📷 Scan Again" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "action-btn secondary", onClick: handleLogSymptom, children: "📝 Log Reaction" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "action-btn secondary", onClick: () => setResult(null), children: "← Back" })
      ] })
    ] }),
    scanMode !== "search" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scanner-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: scanMode === "food" ? "📸 Point camera at any food to identify ingredients and check allergens" : scanMode === "halal" ? "🕌 Scan product labels for comprehensive Islamic dietary compliance verification" : "🏷️ Scan ingredient labels to extract and analyze all contents" }) })
  ] }) });
}
function SearchFoods({ onClose, initialTab = "usda" }) {
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const [searchTab, setSearchTab] = reactExports.useState(initialTab);
  const [loading, setLoading] = reactExports.useState(false);
  const [halalOnly, setHalalOnly] = reactExports.useState(false);
  const [selectedCuisine, setSelectedCuisine] = reactExports.useState("");
  const [availableCuisines, setAvailableCuisines] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const loadCuisines = async () => {
      const { restaurantService } = await __vitePreload(async () => {
        const { restaurantService: restaurantService2 } = await import("./chunk-1767948920209-restaurantService.js");
        return { restaurantService: restaurantService2 };
      }, true ? [] : void 0);
      const cuisines = restaurantService.getAllCuisines();
      setAvailableCuisines(cuisines);
    };
    loadCuisines();
  }, []);
  const handleSearch = async () => {
    if (!searchQuery.trim() && !halalOnly && !selectedCuisine) return;
    setLoading(true);
    setSearchResults([]);
    try {
      if (searchTab === "usda") {
        const usdaService = (await __vitePreload(async () => {
          const { default: __vite_default__ } = await import("./chunk-1767948920209-usdaService.js");
          return { default: __vite_default__ };
        }, true ? [] : void 0)).default;
        const result = await usdaService.searchFoods(searchQuery, 30);
        if (result.success) {
          setSearchResults(result.foods);
        }
      } else if (searchTab === "foods") {
        const { barcodeScannerService } = await __vitePreload(async () => {
          const { barcodeScannerService: barcodeScannerService2 } = await import("./chunk-1767948920161-barcodeScannerService.js");
          return { barcodeScannerService: barcodeScannerService2 };
        }, true ? __vite__mapDeps([3,4,5,6]) : void 0);
        const result = await barcodeScannerService.searchOpenFoodFactsByText(searchQuery, 1);
        if (result.success) {
          setSearchResults(result.foods);
        }
      } else {
        const { restaurantService } = await __vitePreload(async () => {
          const { restaurantService: restaurantService2 } = await import("./chunk-1767948920209-restaurantService.js");
          return { restaurantService: restaurantService2 };
        }, true ? [] : void 0);
        const filters = {};
        if (halalOnly) filters.halalOnly = true;
        if (selectedCuisine) filters.cuisine = selectedCuisine;
        const results = restaurantService.searchMenuItems(searchQuery, null, filters);
        setSearchResults(results);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const clearFilters = () => {
    setHalalOnly(false);
    setSelectedCuisine("");
    setSearchQuery("");
    setSearchResults([]);
  };
  const handleLogFood = async (food) => {
    const auth = await __vitePreload(() => import("./entry-1767948920134-index.js").then((n) => n.a7), true ? __vite__mapDeps([4,5]) : void 0);
    await auth.default.logFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs || food.carbohydrates,
      fat: food.fats || food.fat
    });
    showToast("✅ Food logged!", "success");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "20px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "15px", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSearchTab("usda"),
          style: {
            flex: "1 1 140px",
            padding: "12px",
            background: searchTab === "usda" ? "linear-gradient(135deg, #00c853 0%, #00e676 100%)" : "#f0f0f0",
            color: searchTab === "usda" ? "white" : "#333",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "13px"
          },
          children: "🇺🇸 USDA Official"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSearchTab("foods"),
          style: {
            flex: "1 1 140px",
            padding: "12px",
            background: searchTab === "foods" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f0f0f0",
            color: searchTab === "foods" ? "white" : "#333",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "13px"
          },
          children: "🌍 6M Foods"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSearchTab("restaurants"),
          style: {
            flex: "1 1 140px",
            padding: "12px",
            background: searchTab === "restaurants" ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" : "#f0f0f0",
            color: searchTab === "restaurants" ? "white" : "#333",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "13px"
          },
          children: "🍔 Restaurants"
        }
      )
    ] }),
    searchTab === "restaurants" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setHalalOnly(!halalOnly),
          style: {
            padding: "8px 16px",
            background: halalOnly ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" : "#f0f0f0",
            color: halalOnly ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer"
          },
          children: [
            "🕌 Halal ",
            halalOnly ? "✓" : ""
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: selectedCuisine,
          onChange: (e) => setSelectedCuisine(e.target.value),
          style: {
            padding: "8px 12px",
            border: selectedCuisine ? "2px solid #667eea" : "2px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: selectedCuisine ? "bold" : "normal",
            background: selectedCuisine ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" : "white",
            color: selectedCuisine ? "white" : "#333",
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "🌍 All Cuisines" }),
            availableCuisines.map((cuisine) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cuisine, children: cuisine }, cuisine))
          ]
        }
      ),
      (halalOnly || selectedCuisine) && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: clearFilters,
          style: {
            padding: "8px 16px",
            background: "#ff6b6b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer"
          },
          children: "✕ Clear"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "10px", marginBottom: "20px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          onKeyPress: (e) => e.key === "Enter" && handleSearch(),
          placeholder: searchTab === "usda" ? "Search USDA database..." : searchTab === "foods" ? "Search 6M+ foods..." : "Search restaurants...",
          style: {
            flex: 1,
            padding: "12px",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            fontSize: "16px"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleSearch,
          disabled: loading,
          style: {
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          },
          children: loading ? "⏳" : "🔍"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxHeight: "400px", overflowY: "auto" }, children: searchResults.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "14px", color: "#666", marginBottom: "10px" }, children: [
        "Found ",
        searchResults.length,
        " results"
      ] }),
      searchResults.map((food, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            background: "white",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "2px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { style: { margin: "0 0 5px 0", color: "#333" }, children: [
                searchTab === "restaurants" && `${food.restaurantLogo} `,
                food.name
              ] }),
              searchTab === "restaurants" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 5px 0", fontSize: "12px", color: "#888" }, children: food.restaurantName }),
              food.brand && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 5px 0", fontSize: "12px", color: "#888" }, children: food.brand }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontSize: "14px", color: "#666" }, children: [
                food.calories,
                " cal • ",
                food.protein,
                "g protein • ",
                food.carbs || food.carbohydrates || 0,
                "g carbs • ",
                food.fats || food.fat || 0,
                "g fat"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleLogFood(food),
                style: {
                  padding: "8px 16px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                },
                children: "+ Log"
              }
            )
          ]
        },
        idx
      ))
    ] }) : searchQuery && !loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { textAlign: "center", color: "#888", padding: "20px" }, children: "No results found. Try a different search." }) : !searchQuery ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px", color: "#888" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "48px", marginBottom: "10px" }, children: searchTab === "usda" ? "🇺🇸" : searchTab === "foods" ? "🔍" : "🍔" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: searchTab === "usda" ? "Search 400K+ USDA verified foods" : searchTab === "foods" ? "Search 6 million foods from OpenFoodFacts" : "Search 50+ restaurants with 2,700+ items" })
    ] }) : null })
  ] });
}
export {
  SearchFoods,
  FoodScanner as default
};
