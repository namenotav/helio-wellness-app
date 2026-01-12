import { a as authService, r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import { healthAvatarService } from "./chunk-1767948920148-healthAvatarService.js";
class InsuranceService {
  constructor() {
    this.partnersDB = [
      {
        id: "bupa",
        name: "Bupa Health Insurance",
        maxDiscount: 40,
        currency: "£",
        basePremium: 150,
        // £150/month
        requirements: {
          minHealthScore: 70,
          minMonthlySteps: 2e5,
          minWorkouts: 12,
          regularCheckIns: true
        }
      },
      {
        id: "vitality",
        name: "Vitality Health",
        maxDiscount: 35,
        currency: "£",
        basePremium: 180,
        // £180/month
        requirements: {
          minHealthScore: 65,
          minMonthlySteps: 15e4,
          minWorkouts: 10,
          foodLogging: true
        }
      },
      {
        id: "axa",
        name: "AXA Health",
        maxDiscount: 30,
        currency: "£",
        basePremium: 140,
        // £140/month
        requirements: {
          minHealthScore: 60,
          minMonthlySteps: 12e4,
          minWorkouts: 8
        }
      },
      {
        id: "aviva",
        name: "Aviva Health",
        maxDiscount: 25,
        currency: "£",
        basePremium: 130,
        // £130/month
        requirements: {
          minHealthScore: 55,
          minMonthlySteps: 1e5,
          minWorkouts: 6
        }
      }
    ];
  }
  // Calculate current discount eligibility
  async calculateDiscount(partnerId) {
    const user = authService.getCurrentUser();
    if (!user) return { eligible: false };
    const partner = this.partnersDB.find((p) => p.id === partnerId);
    if (!partner) return { eligible: false };
    const avatarState = await healthAvatarService.getAvatarState();
    const healthScore = avatarState.current.score;
    const monthlySteps = this.calculateMonthlySteps(user.stats);
    const meetsHealthScore = healthScore >= partner.requirements.minHealthScore;
    const meetsStepGoal = monthlySteps >= partner.requirements.minMonthlySteps;
    const meetsCheckIns = partner.requirements.regularCheckIns ? this.hasRegularCheckIns(user) : true;
    const meetsFoodLogging = partner.requirements.foodLogging ? this.hasFoodLogging(user) : true;
    const eligible = meetsHealthScore && meetsStepGoal && meetsCheckIns && meetsFoodLogging;
    let discountPercent = 0;
    if (eligible) {
      discountPercent = this.calculateDiscountPercent(
        healthScore,
        monthlySteps,
        partner
      );
    }
    return {
      eligible,
      discountPercent,
      partner: partner.name,
      monthlySavings: this.estimateSavings(discountPercent),
      yearlySavings: this.estimateSavings(discountPercent) * 12,
      requirements: {
        healthScore: {
          current: healthScore,
          required: partner.requirements.minHealthScore,
          met: meetsHealthScore
        },
        monthlySteps: {
          current: monthlySteps,
          required: partner.requirements.minMonthlySteps,
          met: meetsStepGoal
        },
        checkIns: meetsCheckIns,
        foodLogging: meetsFoodLogging
      }
    };
  }
  // Calculate monthly steps from REAL step counter data
  calculateMonthlySteps(stats) {
    const stepData = JSON.parse(localStorage.getItem("stepHistory") || "{}");
    const dates = Object.keys(stepData);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    const recentSteps = dates.filter((date) => new Date(date).getTime() >= thirtyDaysAgo);
    const monthlyTotal = recentSteps.reduce((sum, date) => sum + (stepData[date] || 0), 0);
    return monthlyTotal;
  }
  // Check for regular check-ins (daily app usage)
  hasRegularCheckIns(user) {
    new Date(user.profile?.lastActive || Date.now());
    const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]");
    const last30Days = loginHistory.filter((login) => {
      const loginDate = new Date(login);
      return Date.now() - loginDate.getTime() <= 30 * 24 * 60 * 60 * 1e3;
    });
    return last30Days.length >= 20;
  }
  // Check for food logging from REAL data
  hasFoodLogging(user) {
    const foodLogs = JSON.parse(localStorage.getItem("foodLog") || "[]");
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    const recentLogs = foodLogs.filter((log) => {
      const logTime = new Date(log.timestamp || log.date).getTime();
      return logTime >= thirtyDaysAgo;
    });
    return recentLogs.length >= 60;
  }
  // Calculate discount percentage
  calculateDiscountPercent(healthScore, monthlySteps, partner) {
    const { maxDiscount, requirements } = partner;
    let discount = maxDiscount * 0.5;
    const scoreBonus = Math.min(
      (healthScore - requirements.minHealthScore) / 100 * maxDiscount * 0.3,
      maxDiscount * 0.3
    );
    const stepBonus = Math.min(
      (monthlySteps - requirements.minMonthlySteps) / requirements.minMonthlySteps * maxDiscount * 0.2,
      maxDiscount * 0.2
    );
    discount = Math.min(discount + scoreBonus + stepBonus, maxDiscount);
    return Math.round(discount);
  }
  // Estimate monthly savings
  estimateSavings(discountPercent) {
    const avgPremium = 500;
    return Math.round(avgPremium * discountPercent / 100);
  }
  // Get all available partners
  getAvailablePartners() {
    return this.partnersDB;
  }
  // Generate verification report for insurer
  async generateVerificationReport() {
    const user = authService.getCurrentUser();
    if (!user) return null;
    const avatarState = await healthAvatarService.getAvatarState();
    return {
      userId: user.id,
      userName: user.name,
      reportDate: (/* @__PURE__ */ new Date()).toISOString(),
      healthMetrics: {
        currentHealthScore: avatarState.current.score,
        totalDays: user.stats.totalDays,
        totalSteps: user.stats.totalSteps,
        avgDailySteps: user.stats.totalDays > 0 ? Math.round(user.stats.totalSteps / user.stats.totalDays) : 0
      },
      activityLog: {
        last30DaysSteps: this.calculateMonthlySteps(user.stats),
        foodLogsCount: (user.profile.foodLog || []).length,
        meditationSessions: user.stats.totalSessions || 0,
        lastActive: user.profile.lastActive
      },
      verified: true,
      signature: this.generateVerificationSignature(user)
    };
  }
  // Generate cryptographic signature for report
  generateVerificationSignature(user) {
    const data = `${user.id}-${Date.now()}`;
    return btoa(data);
  }
  // Apply for insurance discount
  async applyForDiscount(partnerId) {
    const discount = await this.calculateDiscount(partnerId);
    if (!discount.eligible) {
      return {
        success: false,
        message: "Not eligible yet. Keep improving your health!",
        requirements: discount.requirements
      };
    }
    const report = await this.generateVerificationReport();
    return {
      success: true,
      applicationId: "APP-" + Date.now(),
      discountPercent: discount.discountPercent,
      monthlySavings: discount.monthlySavings,
      yearlySavings: discount.yearlySavings,
      report,
      message: `Application submitted! Estimated savings: $${discount.monthlySavings}/month`
    };
  }
}
const insuranceService = new InsuranceService();
function InsuranceRewards({ onClose }) {
  const [selectedPartner, setSelectedPartner] = reactExports.useState(null);
  const [discountData, setDiscountData] = reactExports.useState(null);
  const [applying, setApplying] = reactExports.useState(false);
  const partners = [
    { id: "bupa", name: "Bupa Health Insurance", maxDiscount: 40, color: "#44FF44", logo: "🏥" },
    { id: "vitality", name: "Vitality Health", maxDiscount: 35, color: "#00FFFF", logo: "💚" },
    { id: "axa", name: "AXA Health", maxDiscount: 30, color: "#FF00FF", logo: "🛡️" },
    { id: "aviva", name: "Aviva Health", maxDiscount: 25, color: "#FFD700", logo: "⭐" }
  ];
  reactExports.useEffect(() => {
    if (selectedPartner) {
      calculateDiscount(selectedPartner);
    }
  }, [selectedPartner]);
  const calculateDiscount = async (partnerId) => {
    const data = await insuranceService.calculateDiscount(partnerId);
    setDiscountData(data);
  };
  const handleApply = async () => {
    if (!selectedPartner) return;
    setApplying(true);
    try {
      const result = await insuranceService.applyForDiscount(selectedPartner);
      alert(`✅ Application Submitted!

Application ID: ${result.applicationId}

Estimated Savings:
$${result.estimatedSavings.monthly}/month
$${result.estimatedSavings.yearly}/year

You'll receive an email with next steps within 2-3 business days.`);
    } catch (error) {
      alert("Failed to apply: " + error.message);
    }
    setApplying(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "insurance-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "insurance-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "insurance-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      background: "linear-gradient(135deg, rgba(255, 193, 7, 0.25) 0%, rgba(255, 152, 0, 0.25) 100%)",
      padding: "16px",
      borderRadius: "12px",
      marginBottom: "20px",
      border: "2px solid rgba(255, 193, 7, 0.6)",
      boxShadow: "0 4px 12px rgba(255, 193, 7, 0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "16px", color: "#FFC107", fontWeight: "700", marginBottom: "6px", textAlign: "center" }, children: "⚠️ DEMO FEATURE - COMING SOON ⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "13px", color: "rgba(255, 255, 255, 0.9)", lineHeight: "1.5", textAlign: "center" }, children: "Insurance partnerships are pending regulatory approval. All calculations shown are estimates for demonstration purposes only." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "insurance-title", children: "💰 Insurance Rewards (Preview)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "insurance-subtitle", children: "Potential discounts up to 40% with partner approval" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "partner-grid", children: partners.map((partner) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `partner-card ${selectedPartner === partner.id ? "selected" : ""}`,
        onClick: () => setSelectedPartner(partner.id),
        style: { borderColor: selectedPartner === partner.id ? partner.color : "transparent" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "partner-name", children: partner.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "partner-discount", children: [
            "Up to ",
            partner.maxDiscount,
            "% OFF"
          ] })
        ]
      },
      partner.id
    )) }),
    discountData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "discount-results", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `eligibility-status ${discountData.eligible ? "eligible" : "not-eligible"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-icon", children: discountData.eligible ? "✓" : "✗" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-text", children: discountData.eligible ? "You Qualify!" : "Not Eligible Yet" })
      ] }),
      discountData.eligible ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "savings-display", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "savings-main", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "savings-percent", children: [
              discountData.discountPercent,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "savings-label", children: "Discount" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "savings-breakdown", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "savings-item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "savings-amount", children: [
                "$",
                discountData.monthlySavings
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "savings-period", children: "per month" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "savings-item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "savings-amount", children: [
                "$",
                discountData.yearlySavings
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "savings-period", children: "per year" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "apply-button",
            onClick: handleApply,
            disabled: applying,
            children: applying ? "⏳ Applying..." : "✓ Apply for Discount"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "requirements-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Requirements to Qualify:" }),
        Object.entries(discountData.requirements).map(([key, req]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `requirement-item ${req.met ? "met" : "not-met"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "req-icon", children: req.met ? "✓" : "✗" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "req-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "req-name", children: key.replace(/([A-Z])/g, " $1").trim() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "req-progress", children: [
              req.current,
              " / ",
              req.required,
              " ",
              key.includes("Score") ? "points" : "steps"
            ] })
          ] })
        ] }, key))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "how-it-works", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "💡 How It Works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "steps-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-number", children: "1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We track your health metrics securely" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-number", children: "2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Insurance partners verify your data" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-number", children: "3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Get instant premium discounts" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-number", children: "4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Save $2,400-$4,800 per year" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-badge", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trust-icon", children: "🔒" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trust-text", children: "HIPAA Compliant" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-badge", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trust-icon", children: "✓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trust-text", children: "Verified Partners" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-badge", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trust-icon", children: "🛡️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "trust-text", children: "Data Encrypted" })
      ] })
    ] })
  ] }) });
}
export {
  InsuranceRewards as default
};
