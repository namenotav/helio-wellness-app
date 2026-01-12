const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920209-smartFoodSearch.js","assets/chunk-1767948920209-usdaService.js","assets/chunk-1767948920209-restaurantService.js","assets/chunk-1767948920161-barcodeScannerService.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css","assets/chunk-1767948920163-index.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload, r as reactExports, j as jsxRuntimeExports, z as subscriptionService } from "./entry-1767948920134-index.js";
import { C as Camera } from "./chunk-1767948920163-index.js";
import { a as aiVisionService } from "./chunk-1767948920252-aiVisionService.js";
import PaywallModal from "./chunk-1767948920155-PaywallModal.js";
import "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
class ARScannerService {
  constructor() {
    this.isScanning = false;
    this.overlayData = null;
  }
  // Start AR scanning mode
  async startARMode() {
    try {
      this.isScanning = true;
      if (false) ;
      const photo = await Camera.getPhoto({
        quality: 50,
        // Compressed for faster upload
        allowEditing: false,
        resultType: "base64",
        source: "CAMERA",
        width: 1024,
        // Limit size
        height: 1024
      });
      if (false) ;
      const analysis = await aiVisionService.analyzeFoodImage(photo.base64String);
      if (false) ;
      if (analysis.success) {
        if (false) ;
        const foodName = analysis.analysis.foodName || analysis.analysis.food;
        const smartFoodSearch = (await __vitePreload(async () => {
          const { default: __vite_default__ } = await import("./chunk-1767948920209-smartFoodSearch.js");
          return { default: __vite_default__ };
        }, true ? __vite__mapDeps([0,1,2,3,4,5,6]) : void 0)).default;
        const databaseMatches = await smartFoodSearch.searchAllDatabases(foodName);
        if (false) ;
        this.overlayData = this.createAROverlay(analysis.analysis, databaseMatches);
        if (false) ;
        return {
          success: true,
          imageData: photo.base64String,
          overlayData: this.overlayData,
          databaseMatches
        };
      }
      if (false) ;
      return { success: false, error: analysis.error || "Analysis failed" };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      this.isScanning = false;
    }
  }
  // Create AR overlay data structure
  createAROverlay(analysis, databaseMatches = []) {
    const { foodName, ingredients, detectedAllergens, safetyLevel } = analysis;
    let calories, protein, carbs, fats, source;
    if (databaseMatches && databaseMatches.length > 0) {
      const bestMatch = databaseMatches[0];
      calories = bestMatch.calories || 0;
      protein = bestMatch.protein || 0;
      carbs = bestMatch.carbs || bestMatch.carbohydrates || 0;
      fats = bestMatch.fat || bestMatch.fats || 0;
      source = bestMatch.source;
    } else {
      calories = this.estimateCalories(foodName, ingredients);
      protein = carbs = fats = 0;
      source = "Estimated";
    }
    const portionGuide = this.calculatePortionSize(foodName, calories);
    return {
      // Main info box (top of food)
      mainInfo: {
        foodName,
        calories,
        protein,
        carbs,
        fats,
        source,
        databaseMatch: databaseMatches.length > 0,
        position: "top-center",
        color: this.getARColor(safetyLevel)
      },
      // Allergen warning zones (red overlay on dangerous parts)
      allergenZones: detectedAllergens.map((allergen, idx) => ({
        allergen: allergen.name,
        position: this.calculateZonePosition(idx, detectedAllergens.length),
        intensity: allergen.confidence === "high" ? 0.8 : 0.5,
        color: "#FF4444"
      })),
      // Portion guide (circle overlay)
      portionGuide: {
        diameter: portionGuide.size,
        position: "center",
        label: portionGuide.label,
        color: "#44FF44",
        opacity: 0.3
      },
      // Nutrition breakdown (side panel)
      nutritionPanel: {
        protein: this.estimateNutrient(ingredients, "protein"),
        carbs: this.estimateNutrient(ingredients, "carbs"),
        fat: this.estimateNutrient(ingredients, "fat"),
        fiber: this.estimateNutrient(ingredients, "fiber")
      },
      // Safety verdict (bottom banner)
      safetyBanner: {
        level: safetyLevel,
        message: analysis.safetyMessage,
        position: "bottom",
        animated: safetyLevel === "danger"
      }
    };
  }
  // Estimate calories from food name and ingredients
  estimateCalories(foodName, ingredients) {
    const calorieDB = {
      "pizza": 285,
      "burger": 350,
      "salad": 150,
      "pasta": 220,
      "chicken": 165,
      "fish": 140,
      "rice": 130,
      "bread": 265,
      "apple": 52,
      "banana": 89
    };
    const food = foodName.toLowerCase();
    for (const [key, cals] of Object.entries(calorieDB)) {
      if (food.includes(key)) {
        return cals;
      }
    }
    return ingredients.length * 50 + 100;
  }
  // Estimate specific nutrient
  estimateNutrient(ingredients, nutrientType) {
    const nutrientMap = {
      protein: ["chicken", "fish", "beef", "egg", "tofu", "beans"],
      carbs: ["bread", "rice", "pasta", "potato", "wheat", "corn"],
      fat: ["oil", "butter", "cheese", "avocado", "nuts"],
      fiber: ["vegetables", "fruit", "beans", "oats", "whole grain"]
    };
    const sources = nutrientMap[nutrientType] || [];
    const count = ingredients.filter(
      (ing) => sources.some((source) => ing.toLowerCase().includes(source))
    ).length;
    return count > 0 ? "High" : count > 2 ? "Medium" : "Low";
  }
  // Calculate recommended portion size
  calculatePortionSize(foodName, calories) {
    if (calories < 150) {
      return { size: "200px", label: "Recommended serving" };
    } else if (calories < 300) {
      return { size: "150px", label: "Moderate portion" };
    } else {
      return { size: "100px", label: "Small portion advised" };
    }
  }
  // Calculate position for allergen zone markers
  calculateZonePosition(index, total) {
    const angle = index / total * 2 * Math.PI;
    const radius = 30;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  }
  // Get color for AR overlays based on safety
  getARColor(safetyLevel) {
    return {
      "safe": "#44FF44",
      "caution": "#FFA500",
      "danger": "#FF4444",
      "unknown": "#888888"
    }[safetyLevel] || "#888888";
  }
  // AR Restaurant Mode - scan menu items
  async scanRestaurantMenu() {
    const result = await this.startARMode();
    if (result.success) {
      result.overlayData.restaurantTips = [
        "📝 Ask server about preparation methods",
        "🔄 Request modifications for allergens",
        "👨‍🍳 Speak directly with chef if needed"
      ];
    }
    return result;
  }
  // Live AR stream mode (future: continuous scanning)
  async enableLiveARStream() {
    return {
      success: false,
      message: "Live AR streaming coming in v2.0"
    };
  }
}
const arScannerService = new ARScannerService();
function ARScanner({ onClose }) {
  const [scanning, setScanning] = reactExports.useState(false);
  const [arOverlay, setArOverlay] = reactExports.useState(null);
  const [capturedImage, setCapturedImage] = reactExports.useState(null);
  const [showPaywall, setShowPaywall] = reactExports.useState(false);
  const handleStartScan = async () => {
    if (!subscriptionService.hasAccess("arScanner")) {
      setShowPaywall(true);
      return;
    }
    const limitCheck = subscriptionService.checkLimit("arScans");
    if (!limitCheck.allowed) {
      alert(limitCheck.message);
      setShowPaywall(true);
      return;
    }
    setScanning(true);
    try {
      if (false) ;
      const result = await arScannerService.startARMode();
      if (false) ;
      if (!result.success) {
        throw new Error(result.error || "AR scan failed");
      }
      setCapturedImage(`data:image/jpeg;base64,${result.imageData}`);
      setArOverlay({
        ...result.overlayData,
        databaseMatches: result.databaseMatches || []
        // Store database results
      });
      const scanResult = {
        imageData: result.imageData,
        overlayData: result.overlayData,
        timestamp: Date.now(),
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
      const existingScans = JSON.parse(localStorage.getItem("ar_scans") || "[]");
      existingScans.push(scanResult);
      localStorage.setItem("ar_scans", JSON.stringify(existingScans));
      const syncService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a4);
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([4,5]) : void 0)).default;
      await syncService.saveData("ar_scans", scanResult);
      if (false) ;
      if (false) ;
    } catch (error) {
      alert("Failed to start AR scan: " + error.message);
    }
    setScanning(false);
  };
  const handleReset = () => {
    setCapturedImage(null);
    setArOverlay(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-overlay", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-modal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ar-close", onClick: onClose, children: "✕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "ar-title", children: "📸 Body Scanner" }),
      !capturedImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ar-icon", children: "🥗" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Scan Any Food" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Point your camera at food to see instant AR nutrition overlay" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "ar-scan-btn",
            onClick: handleStartScan,
            disabled: scanning,
            children: scanning ? "⏳ Scanning..." : "📷 Start AR Scan"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-camera-feed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Scanned food", className: "ar-image" }),
          arOverlay && arOverlay.mainInfo && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ar-food-label", children: arOverlay.mainInfo.foodName })
        ] }),
        arOverlay && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-info-panel", children: [
          arOverlay.mainInfo && arOverlay.mainInfo.databaseMatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "12px", color: "#0284c7", fontWeight: "bold", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }, children: [
            "✓ Verified from ",
            arOverlay.mainInfo.source
          ] }),
          arOverlay.mainInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-calories", children: [
            "🔥 ",
            arOverlay.mainInfo.calories,
            " Calories",
            arOverlay.mainInfo.protein > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "13px", marginLeft: "10px", color: "#666" }, children: [
              "💪 ",
              arOverlay.mainInfo.protein,
              "g | 🍞 ",
              arOverlay.mainInfo.carbs,
              "g | 🥑 ",
              arOverlay.mainInfo.fats,
              "g"
            ] })
          ] }),
          arOverlay.nutritionPanel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-nutrition-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-icon", children: "💪" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-value", children: arOverlay.nutritionPanel.protein }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-label", children: "Protein" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-icon", children: "🍞" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-value", children: arOverlay.nutritionPanel.carbs }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-label", children: "Carbs" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-icon", children: "🥑" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-value", children: arOverlay.nutritionPanel.fat }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nutrition-label", children: "Fat" })
            ] })
          ] }),
          arOverlay.databaseMatches && arOverlay.databaseMatches.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { style: { marginTop: "10px", fontSize: "13px", background: "#f0f9ff", padding: "10px", borderRadius: "8px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { style: { cursor: "pointer", fontWeight: "bold", color: "#0284c7" }, children: [
              "🔍 ",
              arOverlay.databaseMatches.length,
              " database matches available"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxHeight: "120px", overflowY: "auto", marginTop: "8px" }, children: arOverlay.databaseMatches.slice(0, 5).map((match, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "white", padding: "6px", marginBottom: "4px", borderRadius: "6px", fontSize: "11px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: match.sourceBadge }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: match.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#666", fontSize: "10px" }, children: [
                match.calories,
                " cal | P: ",
                match.protein,
                "g | C: ",
                match.carbs || match.carbohydrates,
                "g"
              ] })
            ] }, idx)) })
          ] }),
          arOverlay.safetyBanner && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `info-safety-alert ${arOverlay.safetyBanner.level}`, children: arOverlay.safetyBanner.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ar-action-btn reset", onClick: handleReset, children: "🔄 Scan Again" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ar-action-btn close", onClick: onClose, children: "✓ Done" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ar-features", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-badge", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "🎯" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Instant Calorie Detection" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-badge", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "⚠️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Allergen Zones Highlighted" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-badge", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "🍽️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Smart Portion Guide" })
        ] })
      ] })
    ] }),
    showPaywall && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PaywallModal,
      {
        isOpen: showPaywall,
        onClose: () => setShowPaywall(false),
        featureName: "AR Scanner",
        message: subscriptionService.getUpgradeMessage("arScanner"),
        currentPlan: subscriptionService.getCurrentPlan()
      }
    )
  ] });
}
export {
  ARScanner as default
};
