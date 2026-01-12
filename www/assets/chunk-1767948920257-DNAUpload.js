import { r as reactExports, z as subscriptionService, j as jsxRuntimeExports, A as dnaService } from "./entry-1767948920134-index.js";
import PaywallModal from "./chunk-1767948920155-PaywallModal.js";
import "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
function DNAUpload({ onClose }) {
  const [uploading, setUploading] = reactExports.useState(false);
  const [dnaData, setDnaData] = reactExports.useState(null);
  const [analysis, setAnalysis] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("traits");
  const [loading, setLoading] = reactExports.useState(true);
  const [showPaywall, setShowPaywall] = reactExports.useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = reactExports.useState(false);
  const [showReplaceWarning, setShowReplaceWarning] = reactExports.useState(false);
  const [replaceConsent1, setReplaceConsent1] = reactExports.useState(false);
  const [replaceConsent2, setReplaceConsent2] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!subscriptionService.hasAccess("dnaAnalysis")) {
      setShowPaywall(true);
      setLoading(false);
      return;
    }
    const loadSavedData = async () => {
      const hasSavedData = await dnaService.loadSavedData();
      if (hasSavedData) {
        const report = dnaService.getFullDNAReport();
        if (report) {
          setDnaData(report);
          setAnalysis(dnaService.analysis);
        }
      }
      setLoading(false);
    };
    loadSavedData();
  }, []);
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onerror = (error) => {
        if (false) ;
        alert("Failed to read file: " + error);
        setUploading(false);
      };
      reader.onload = async (e) => {
        try {
          if (false) ;
          const fileData = e.target.result;
          const result = await dnaService.uploadDNAData(fileData, file.name);
          if (false) ;
          if (result.success) {
            if (false) ;
            const report = dnaService.getFullDNAReport();
            if (false) ;
            setDnaData(report);
            await dnaService.analyzeGenetics();
            const analysisData = dnaService.analysis;
            if (false) ;
            setAnalysis(analysisData);
            alert(`✅ DNA Analysis Complete!
${result.traitsFound || 0} genetic markers analyzed`);
          } else {
            alert("❌ Failed to parse DNA file: " + (result.error || "Unknown error"));
          }
          setUploading(false);
        } catch (error) {
          if (false) ;
          alert("Failed to process DNA data: " + error.message);
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      alert("Failed to upload DNA data: " + error.message);
      setUploading(false);
    }
  };
  const handleRequestReplace = () => {
    setReplaceConsent1(false);
    setReplaceConsent2(false);
    setShowReplaceWarning(true);
  };
  const handleConfirmReplace = async () => {
    if (!replaceConsent1 || !replaceConsent2) {
      alert("❌ You must accept both statements to proceed");
      return;
    }
    try {
      const result = await dnaService.clearDNAData();
      if (!result.success) {
        alert("⚠️ Error clearing previous DNA data: " + result.error);
        return;
      }
      setDnaData(null);
      setAnalysis(null);
      setShowReplaceWarning(false);
      setReplaceConsent1(false);
      setReplaceConsent2(false);
      document.getElementById("dna-file-input")?.click();
    } catch (error) {
      alert("❌ Error preparing for new upload: " + error.message);
    }
  };
  const handleExportResults = () => {
    const report = dnaService.getFullDNAReport();
    if (!report) {
      alert("No DNA data to export");
      return;
    }
    const exportData = {
      uploadDate: report.uploadDate,
      source: report.source,
      snpsAnalyzed: report.geneticTraits.length,
      traits: report.geneticTraits,
      analysis: report.analysis
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dna-analysis-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ DNA results saved to Downloads!");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-overlay", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-modal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "dna-close", onClick: onClose, children: "✕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "rgba(255, 68, 68, 0.15)", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "2px solid rgba(255, 68, 68, 0.4)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "14px", color: "rgba(255, 68, 68, 0.95)", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }, children: "⚠️ For Educational & Entertainment Purposes Only" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", color: "rgba(255, 255, 255, 0.85)", lineHeight: "1.6", marginBottom: "12px" }, children: "This DNA analysis is NOT a medical diagnostic tool and should not be used for medical decisions. Results are educational and based on publicly available genetic research. Always consult qualified healthcare professionals for medical advice." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "white" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: disclaimerAccepted,
              onChange: (e) => setDisclaimerAccepted(e.target.checked),
              style: { width: "18px", height: "18px", cursor: "pointer" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "I understand this is for educational purposes only and not medical advice" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "dna-title", children: "🧬 DNA Personalization" }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-upload-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dna-icon", children: "⏳" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Loading DNA Data..." })
      ] }) : !dnaData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-upload-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dna-icon", children: "🧬" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Upload Your DNA Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Support for 23andMe, AncestryDNA, and more" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `upload-button ${!disclaimerAccepted ? "disabled" : ""}`, children: [
          uploading ? "⏳ Analyzing DNA..." : disclaimerAccepted ? "📁 Choose File" : "🔒 Accept Disclaimer First",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "dna-file-input",
              type: "file",
              accept: ".txt,.csv,.json",
              onChange: handleFileUpload,
              disabled: uploading || !disclaimerAccepted,
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "supported-formats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Supported Formats:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "format-badges", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "format-badge", children: "23andMe (.txt)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "format-badge", children: "AncestryDNA (.txt)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "format-badge", children: "MyHeritage (.csv)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "privacy-notice", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "privacy-icon", children: "🔒" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your DNA data is encrypted and never shared. We only analyze relevant health markers." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-results", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-tabs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-btn ${activeTab === "traits" ? "active" : ""}`,
              onClick: () => setActiveTab("traits"),
              children: "🧬 Traits"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-btn ${activeTab === "ancestry" ? "active" : ""}`,
              onClick: () => setActiveTab("ancestry"),
              children: "🌍 Ancestry"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-btn ${activeTab === "athletic" ? "active" : ""}`,
              onClick: () => setActiveTab("athletic"),
              children: "🏃 Athletic"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-btn ${activeTab === "meals" ? "active" : ""}`,
              onClick: () => setActiveTab("meals"),
              children: "🍽️ Nutrition"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-btn ${activeTab === "meds" ? "active" : ""}`,
              onClick: () => setActiveTab("meds"),
              children: "💊 Meds"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-btn ${activeTab === "risks" ? "active" : ""}`,
              onClick: () => setActiveTab("risks"),
              children: "⚠️ Risks"
            }
          )
        ] }),
        activeTab === "traits" && dnaData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "traits-view", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-summary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "DNA Analysis Complete" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "snp-count", children: [
              "📊 Analyzed ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dnaData.geneticTraits?.length || 0 }),
              " genetic markers"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "source-info", children: [
              "🧬 Source: ",
              dnaData.source || "Unknown"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "export-btn", onClick: handleExportResults, children: "💾 Save Results" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "replace-btn", onClick: handleRequestReplace, children: "🔄 Upload New DNA" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Your Genetic Traits" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "traits-list", children: dnaData.geneticTraits?.map((trait, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `trait-card risk-${trait.risk}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trait-header", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trait-gene", children: trait.gene }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trait-genotype", children: trait.genotype })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "trait-name", children: trait.trait.replace(/([A-Z])/g, " $1").trim() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "trait-value", children: trait.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "trait-description", children: trait.description }),
            trait.rsid !== "demo" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trait-rsid", children: [
              "SNP: ",
              trait.rsid
            ] })
          ] }, idx)) })
        ] }),
        activeTab === "meals" && dnaData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meals-view", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "DNA-Optimized Nutrition" }),
          analysis && analysis.foodsToEmphasize ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recommendations-list", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "diet-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "✅ Foods to Emphasize:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "food-tags", children: analysis.foodsToEmphasize?.map((food, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "food-tag good", children: food }, idx)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "diet-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "⚠️ Foods to Limit/Avoid:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "food-tags", children: analysis.foodsToAvoid?.map((food, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "food-tag avoid", children: food }, idx)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "diet-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "💊 Supplement Recommendations:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "food-tags", children: analysis.supplementAdvice?.map((sup, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "food-tag supplement", children: sup }, idx)) })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-msg", children: "⏳ Analyzing your genetics for personalized nutrition..." })
        ] }),
        activeTab === "exercise" && dnaData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "exercise-view", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Genetic Exercise Plan" }),
          analysis && analysis.exerciseRecommendations ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "exercise-plan", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "exercise-list", children: analysis.exerciseRecommendations.map((rec, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "exercise-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "exercise-icon", children: "💪" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "exercise-content", children: rec })
          ] }, idx)) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-msg", children: "⏳ Generating personalized workout plan..." })
        ] }),
        activeTab === "ancestry" && dnaData?.ancestryBreakdown && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ancestry-view", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🌍 Your Ancestry Breakdown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "diversity-score", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Genetic Diversity Score: ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                dnaData.ancestryBreakdown.diversityScore,
                "/100"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "diversity-bar", style: { width: `${dnaData.ancestryBreakdown.diversityScore}%` } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ancestry-list", children: dnaData.ancestryBreakdown.breakdown.map((ancestry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ancestry-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ancestry-header", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ancestry-region", children: ancestry.region }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ancestry-percentage", children: [
                ancestry.percentage,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ancestry-bar-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ancestry-bar", style: { width: `${ancestry.percentage}%` } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ancestry-countries", children: ancestry.countries.join(", ") })
          ] }, idx)) })
        ] }),
        activeTab === "athletic" && dnaData?.athleticProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "athletic-view", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🏃 Your Athletic Genetic Profile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "athletic-scores", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "score-label", children: "Power" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-value", children: [
                dnaData.athleticProfile.powerScore,
                "/100"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "score-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${dnaData.athleticProfile.powerScore}%` } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "score-label", children: "Endurance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "score-value", children: [
                dnaData.athleticProfile.enduranceScore,
                "/100"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "score-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${dnaData.athleticProfile.enduranceScore}%` } }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "athletic-traits", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trait-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Recovery Speed:" }),
              " ",
              dnaData.athleticProfile.recoverySpeed
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trait-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Injury Risk:" }),
              " ",
              dnaData.athleticProfile.injuryRisk
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trait-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Optimal Training:" }),
              " ",
              dnaData.athleticProfile.optimalTrainingType
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Genetic Markers:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "genes-list", children: dnaData.athleticProfile.genes.map((gene, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gene-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gene-name", children: [
              gene.gene,
              " (",
              gene.result,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gene-trait", children: gene.trait }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gene-score", children: [
              "Score: ",
              gene.score,
              "/100"
            ] })
          ] }, idx)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Recommendations:" }),
          dnaData.athleticProfile.recommendations.map((rec, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recommendation", children: [
            "✓ ",
            rec
          ] }, idx))
        ] }),
        activeTab === "meds" && dnaData?.pharmacogenomics && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meds-view", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "💊 Medication Response Profile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "warning-text", children: "⚠️ Informational only - always consult your doctor before changing medications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "meds-list", children: dnaData.pharmacogenomics.map((med, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `med-card risk-${med.riskLevel}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "med-header", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "med-name", children: med.drug }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `risk-badge ${med.riskLevel}`, children: med.riskLevel.toUpperCase() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "med-gene", children: [
              "Gene: ",
              med.gene
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "med-recommendation", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: med.recommendation }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "med-description", children: med.description })
          ] }, idx)) })
        ] }),
        activeTab === "risks" && dnaData?.healthRiskScores && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "risks-view", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "⚠️ Health Risk Assessment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "info-text", children: "Lifetime risk percentages compared to population average" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "risks-detailed-list", children: dnaData.healthRiskScores.map((risk, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `risk-detailed-card ${risk.riskLevel.replace(/ /g, "-").toLowerCase()}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "risk-detailed-header", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "condition-name", children: risk.condition }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `risk-level-badge ${risk.riskLevel.replace(/ /g, "-").toLowerCase()}`, children: risk.riskLevel })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "risk-comparison", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "risk-bar-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Your Risk:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "risk-bar-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "risk-bar your-risk", style: { width: `${risk.yourRisk}%` } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  risk.yourRisk,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "risk-bar-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Average:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "risk-bar-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "risk-bar avg-risk", style: { width: `${risk.populationAverage}%` } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  risk.populationAverage,
                  "%"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "risk-genes", children: [
              "Genes analyzed: ",
              risk.genes.join(", ")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prevention-tips", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Prevention:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: risk.preventionTips.map((tip, tipIdx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: tip }, tipIdx)) })
            ] })
          ] }, idx)) })
        ] }),
        activeTab === "meals" && dnaData?.nutritionGenetics && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-view-pro", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🍽️ Personalized Nutrition Genetics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Macronutrient Recommendations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-cards", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-card", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "macro-name", children: "Carbohydrates" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "macro-value", children: dnaData.nutritionGenetics.macronutrients.carbs.recommendation }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-tolerance", children: [
                  "Tolerance: ",
                  dnaData.nutritionGenetics.macronutrients.carbs.tolerance
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-card", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "macro-name", children: "Fats" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "macro-value", children: dnaData.nutritionGenetics.macronutrients.fats.recommendation }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-tolerance", children: [
                  "Tolerance: ",
                  dnaData.nutritionGenetics.macronutrients.fats.tolerance
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-card", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "macro-name", children: "Protein" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "macro-value", children: dnaData.nutritionGenetics.macronutrients.protein.recommendation }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-tolerance", children: [
                  "Needs: ",
                  dnaData.nutritionGenetics.macronutrients.protein.needs
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "intolerance-section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Food Intolerances & Metabolism" }),
            dnaData.nutritionGenetics.intolerances.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "intolerance-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "food-name", children: item.food }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gene-info", children: [
                "Gene: ",
                item.gene
              ] }),
              item.metabolism && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metabolism", children: [
                "Metabolism: ",
                item.metabolism
              ] }),
              item.likelihood && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "likelihood", children: [
                "Intolerance Likelihood: ",
                item.likelihood
              ] }),
              item.safeAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "safe-amount", children: [
                "Safe Amount: ",
                item.safeAmount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `can-consume ${item.canConsume ? "yes" : "no"}`, children: item.canConsume ? "✓ Can Consume" : "✗ Avoid" })
            ] }, idx))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "vitamin-section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Vitamin Absorption Profile" }),
            dnaData.nutritionGenetics.vitamins.map((vit, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "vitamin-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "vitamin-name", children: vit.vitamin }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "vitamin-gene", children: [
                "Gene: ",
                vit.gene
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "vitamin-absorption", children: [
                "Absorption: ",
                vit.absorption || vit.conversion
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "vitamin-recommendation", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: vit.recommendation }) }),
              vit.recommendedIU && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dosage", children: [
                "Recommended: ",
                vit.recommendedIU,
                " IU/day"
              ] }),
              vit.recommendedMCG && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dosage", children: [
                "Recommended: ",
                vit.recommendedMCG,
                " mcg/day"
              ] })
            ] }, idx))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "diet-recommendation", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Optimal Diet Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "diet-type", children: dnaData.nutritionGenetics.dietType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "diet-reason", children: dnaData.nutritionGenetics.reason })
          ] })
        ] })
      ] })
    ] }),
    showPaywall && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PaywallModal,
      {
        isOpen: showPaywall,
        onClose,
        featureName: "DNA Analysis",
        message: subscriptionService.getUpgradeMessage("dnaAnalysis"),
        currentPlan: subscriptionService.getCurrentPlan()
      }
    ),
    showReplaceWarning && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dna-replace-modal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header orange-alert", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "⚠️ Replace DNA Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This will delete your current DNA analysis and replace it with a new one" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "warning-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Important:" }),
          " This action cannot be undone. Your previous DNA analysis will be permanently removed."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "consent-section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "consent-checkbox", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: replaceConsent1,
                onChange: (e) => setReplaceConsent1(e.target.checked)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "I understand this will delete my current DNA profile" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "consent-checkbox", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: replaceConsent2,
                onChange: (e) => setReplaceConsent2(e.target.checked)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "I confirm this is my DNA and I want to replace the previous profile" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "cancel-btn",
            onClick: () => setShowReplaceWarning(false),
            children: "❌ Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `proceed-btn ${replaceConsent1 && replaceConsent2 ? "enabled" : "disabled"}`,
            onClick: handleConfirmReplace,
            disabled: !replaceConsent1 || !replaceConsent2,
            children: "✓ Proceed with Upload"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  DNAUpload as default
};
