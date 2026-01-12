const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css","assets/chunk-1767948920209-smartFoodSearch.js","assets/chunk-1767948920209-usdaService.js","assets/chunk-1767948920209-restaurantService.js","assets/chunk-1767948920161-barcodeScannerService.js","assets/chunk-1767948920163-index.js"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, _ as __vitePreload, a as authService, y as showToast } from "./entry-1767948920134-index.js";
import { barcodeScannerService } from "./chunk-1767948920161-barcodeScannerService.js";
import "./chunk-1767948920163-index.js";
const BarcodeScanner = ({ onClose, onFoodScanned }) => {
  const [scanning, setScanning] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [countdown, setCountdown] = reactExports.useState(30);
  const handleScan = async () => {
    try {
      const { default: subscriptionService } = await __vitePreload(async () => {
        const { default: subscriptionService2 } = await import("./entry-1767948920134-index.js").then((n) => n.ac);
        return { default: subscriptionService2 };
      }, true ? __vite__mapDeps([0,1]) : void 0);
      const limitCheck = await subscriptionService.checkLimit("barcodeScans");
      if (!limitCheck.allowed) {
        setError(limitCheck.message);
        return;
      }
      setError(null);
      setScanning(true);
      setLoading(false);
      setCountdown(30);
      if (false) ;
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      const scanResult = await barcodeScannerService.startScan(3e4);
      clearInterval(countdownInterval);
      if (scanResult.success) {
        setLoading(true);
        if (false) ;
        const smartFoodSearch = (await __vitePreload(async () => {
          const { default: __vite_default__ } = await import("./chunk-1767948920209-smartFoodSearch.js");
          return { default: __vite_default__ };
        }, true ? __vite__mapDeps([2,3,4,5,0,1,6]) : void 0)).default;
        const allResults = await smartFoodSearch.searchByBarcode(scanResult.barcode);
        if (allResults && allResults.length > 0) {
          setResult({
            ...allResults[0],
            allMatches: allResults,
            // Store all results for user to browse
            totalResults: allResults.length
          });
          if (false) ;
          const { default: subscriptionService2 } = await __vitePreload(async () => {
            const { default: subscriptionService22 } = await import("./entry-1767948920134-index.js").then((n) => n.ac);
            return { default: subscriptionService22 };
          }, true ? __vite__mapDeps([0,1]) : void 0);
          await subscriptionService2.incrementUsage("barcodeScans");
        } else {
          setError("Product not found in any database (USDA, Restaurants, OpenFoodFacts)");
        }
      } else {
        setError(scanResult.message || "Failed to scan barcode");
      }
    } catch (err) {
      setError(err.message || "Failed to scan barcode. Try holding camera steady and ensuring good lighting.");
    } finally {
      setScanning(false);
      setLoading(false);
      setCountdown(30);
    }
  };
  const handleClose = () => {
    if (scanning) {
      barcodeScannerService.stopScan();
    }
    document.body.classList.remove("barcode-scanning-active");
    document.querySelector("html")?.classList.remove("barcode-scanning-active");
    void document.body.offsetHeight;
    onClose();
  };
  reactExports.useEffect(() => {
    return () => {
      if (scanning) {
        barcodeScannerService.stopScan();
      }
      document.body.classList.remove("barcode-scanning-active");
      document.querySelector("html")?.classList.remove("barcode-scanning-active");
      void document.body.offsetHeight;
    };
  }, [scanning]);
  const handleAddToMeal = async () => {
    if (!result) return;
    try {
      if (false) ;
      const logResult = await authService.logFood({
        name: result.name,
        brand: result.brand,
        barcode: result.barcode,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        fiber: result.fiber,
        sugar: result.sugar,
        sodium: result.sodium,
        servingSize: result.servingSize,
        image: result.image,
        ingredients: result.ingredients,
        source: result.source
      });
      if (logResult.success !== false) {
        if (false) ;
        showToast(`✅ ${result.name} logged! +${result.calories} cal`, "success");
        const totalScans = parseInt(localStorage.getItem("total_scans") || "0");
        const todayScans = parseInt(localStorage.getItem("scans_today") || "0");
        const scanCalories = result.calories || 0;
        const totalCalories = parseInt(localStorage.getItem("calories_tracked") || "0");
        localStorage.setItem("total_scans", (totalScans + 1).toString());
        localStorage.setItem("scans_today", (todayScans + 1).toString());
        localStorage.setItem("scans_today_date", (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
        localStorage.setItem("calories_tracked", (totalCalories + scanCalories).toString());
        const recentScans = JSON.parse(localStorage.getItem("recent_scans") || "[]");
        recentScans.unshift({
          name: result.name,
          calories: scanCalories,
          time: "Just now",
          icon: "📊"
        });
        const updatedRecentScans = recentScans.slice(0, 10);
        localStorage.setItem("recent_scans", JSON.stringify(updatedRecentScans));
        try {
          const { Preferences } = await __vitePreload(async () => {
            const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
            return { Preferences: Preferences2 };
          }, true ? __vite__mapDeps([0,1]) : void 0);
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
          }, true ? __vite__mapDeps([0,1]) : void 0)).default;
          const authService2 = (await __vitePreload(async () => {
            const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a7);
            return { default: __vite_default__ };
          }, true ? __vite__mapDeps([0,1]) : void 0)).default;
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
        try {
          const { default: gamificationService } = await __vitePreload(async () => {
            const { default: gamificationService2 } = await import("./entry-1767948920134-index.js").then((n) => n.ab);
            return { default: gamificationService2 };
          }, true ? __vite__mapDeps([0,1]) : void 0);
          await gamificationService.logActivity("scan");
          if (false) ;
        } catch (error2) {
          console.error("❌ [GAMIFICATION] Failed to log scan activity:", error2);
        }
        if (onFoodScanned) {
          onFoodScanned(result);
        }
      } else {
        if (false) ;
        showToast("Failed to log meal. Please try again.", "error");
      }
    } catch (error2) {
      showToast("Error logging meal. Please try again.", "error");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `barcode-scanner-modal ${scanning ? "scanning-active" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `scanner-content ${scanning ? "scanning-active" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scanner-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "📷 Scan Barcode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: handleClose, children: "✕" })
    ] }),
    !scanning && !result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scanner-instructions", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "barcode-icon", children: "📦" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Scan Food Barcode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Point your camera at the barcode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hint", children: "📸 Live scanning - auto-detects when found!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "scan-btn", onClick: handleScan, children: "📸 Start Scanning" }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-message", children: [
        "⚠️ ",
        error
      ] })
    ] }),
    (scanning || loading) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scanning-state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-spinner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: scanning ? "📸 Point camera at barcode..." : "🔍 Looking up product..." }),
      scanning && countdown > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "countdown", children: [
        "⏱️ ",
        countdown,
        "s remaining"
      ] })
    ] }),
    result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scan-result", children: [
      result.image && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: result.image, alt: result.name, className: "food-image" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "20px" }, children: result.sourceBadge }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: 0 }, children: result.name })
      ] }),
      result.brand && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "brand", children: result.brand }),
      result.totalResults > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "12px", color: "#666", marginTop: "5px" }, children: [
        "🔍 Found ",
        result.totalResults,
        " matches across databases (showing best match)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { children: [
          "Nutrition (per ",
          result.servingSize,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "label", children: "Calories" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "value", children: result.calories })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "label", children: "Protein" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "value", children: [
              result.protein,
              "g"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "label", children: "Carbs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "value", children: [
              result.carbs || result.carbohydrates,
              "g"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "label", children: "Fat" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "value", children: [
              result.fat || result.fats,
              "g"
            ] })
          ] })
        ] })
      ] }),
      result.allMatches && result.allMatches.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { style: { marginTop: "15px", padding: "10px", background: "#f5f5f5", borderRadius: "8px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { style: { cursor: "pointer", fontWeight: "bold", marginBottom: "10px" }, children: [
          "📊 View all ",
          result.allMatches.length,
          " matches"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxHeight: "200px", overflowY: "auto" }, children: result.allMatches.slice(1).map((match, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "8px", marginBottom: "8px", background: "white", borderRadius: "6px", cursor: "pointer" }, onClick: () => setResult({ ...match, allMatches: result.allMatches, totalResults: result.totalResults }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: match.sourceBadge }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: match.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "12px", color: "#666", marginTop: "4px" }, children: [
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
      ] }),
      result.ingredients && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ingredients", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Ingredients" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: result.ingredients })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "add-btn", onClick: handleAddToMeal, children: "✅ Add to Meal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rescan-btn", onClick: handleScan, children: "🔄 Scan Another" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "source", children: [
        "Source: ",
        result.source
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scanner-ui", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scanner-overlay" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scanner-frame" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scanner-instructions", children: "Position barcode within frame" })
    ] })
  ] }) });
};
export {
  BarcodeScanner as default
};
