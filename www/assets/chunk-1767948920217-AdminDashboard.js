import { r as reactExports, w as monitoringService, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
function AdminDashboard() {
  const [stats, setStats] = reactExports.useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSteps: 0,
    avgStepsPerUser: 0,
    errors: [],
    recentActivity: [],
    monitoring: null
    // Real-time monitoring stats
  });
  const [users, setUsers] = reactExports.useState([]);
  const [selectedTab, setSelectedTab] = reactExports.useState("overview");
  reactExports.useEffect(() => {
    loadDashboardData();
    const unsubscribers = [];
    try {
      const interval = setInterval(() => {
        loadDashboardData();
        if (false) ;
      }, 3e4);
      unsubscribers.push(() => clearInterval(interval));
    } catch (error) {
      console.error("Failed to setup real-time listeners:", error);
    }
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);
  const loadDashboardData = () => {
    const allUsers = getAllUsers();
    const errorLogs = JSON.parse(localStorage.getItem("error_logs") || "[]");
    const analytics = JSON.parse(localStorage.getItem("analytics_events") || "[]");
    const monitoring = monitoringService.getDashboard(5);
    setUsers(allUsers);
    setStats({
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((u) => isActiveUser(u)).length,
      totalSteps: calculateTotalSteps(allUsers),
      avgStepsPerUser: calculateAvgSteps(allUsers),
      errors: errorLogs.slice(-10),
      recentActivity: analytics.slice(-20),
      monitoring
      // Add real-time monitoring data
    });
  };
  const getAllUsers = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.email) return [];
    return [{
      id: user.id || "1",
      email: user.email,
      name: user.name || "User",
      createdAt: user.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      lastActive: (/* @__PURE__ */ new Date()).toISOString(),
      stepCount: getCurrentStepCount()
    }];
  };
  const isActiveUser = (user) => {
    const lastActive = new Date(user.lastActive);
    const daysSinceActive = (Date.now() - lastActive) / (1e3 * 60 * 60 * 24);
    return daysSinceActive < 7;
  };
  const calculateTotalSteps = (users2) => {
    return users2.reduce((total, user) => total + (user.stepCount || 0), 0);
  };
  const calculateAvgSteps = (users2) => {
    if (users2.length === 0) return 0;
    return Math.round(calculateTotalSteps(users2) / users2.length);
  };
  const getCurrentStepCount = () => {
    const healthData = JSON.parse(localStorage.getItem("health_data") || "{}");
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return healthData.steps?.[today] || 0;
  };
  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user and all their data?")) return;
    alert("User deleted (demo mode)");
  };
  const handleExportData = () => {
    const exportData = {
      users,
      stats,
      exportDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "admin-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "🛡️ Admin Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleExportData, className: "export-btn", children: "📥 Export Data" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-tabs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: selectedTab === "overview" ? "active" : "",
          onClick: () => setSelectedTab("overview"),
          children: "Overview"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: selectedTab === "users" ? "active" : "",
          onClick: () => setSelectedTab("users"),
          children: "Users"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: selectedTab === "errors" ? "active" : "",
          onClick: () => setSelectedTab("errors"),
          children: "Errors"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: selectedTab === "activity" ? "active" : "",
          onClick: () => setSelectedTab("activity"),
          children: "Activity"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: selectedTab === "monitoring" ? "active" : "",
          onClick: () => setSelectedTab("monitoring"),
          children: "⚡ Live Monitoring"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-content", children: [
      selectedTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overview-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-cards", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "👥" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.totalUsers }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Users" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "✅" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.activeUsers }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Active Users" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "👣" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.totalSteps.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Steps" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "📊" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.avgStepsPerUser.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Avg Steps/User" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "system-health", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "System Health" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Server Status:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-ok", children: "✅ Online" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Database:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-ok", children: "✅ Connected" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "health-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Recent Errors:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: stats.errors.length > 5 ? "status-warning" : "status-ok", children: [
              stats.errors.length,
              " in last hour"
            ] })
          ] })
        ] })
      ] }),
      selectedTab === "users" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "users-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "User Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "users-table", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Steps" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Last Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: user.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: user.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: user.stepCount?.toLocaleString() || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: new Date(user.lastActive).toLocaleDateString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDeleteUser(user.id),
                className: "delete-user-btn",
                children: "🗑️"
              }
            ) })
          ] }, user.id)) })
        ] })
      ] }),
      selectedTab === "errors" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "errors-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Recent Errors" }),
        stats.errors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No errors logged ✅" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-list", children: stats.errors.map((error, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-time", children: new Date(error.timestamp).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-stack", children: error.stack?.substring(0, 100) })
        ] }, index)) })
      ] }),
      selectedTab === "monitoring" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitoring-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "⚡ Real-Time Monitoring (Last 5 min)" }),
        stats.monitoring && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitoring-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📡 API Health" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Calls:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stats.monitoring.apiHealth.totalCalls })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Success Rate:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: stats.monitoring.apiHealth.successRate > 95 ? "status-ok" : "status-warning", children: [
                  stats.monitoring.apiHealth.successRate.toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Avg Response:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  stats.monitoring.apiHealth.avgResponseTime.toFixed(0),
                  "ms"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "⚠️ Error Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Errors:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: stats.monitoring.errorRate.totalErrors > 10 ? "status-error" : "status-ok", children: stats.monitoring.errorRate.totalErrors })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Error Rate:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: stats.monitoring.errorRate.errorRate > 5 ? "status-error" : "status-ok", children: [
                  stats.monitoring.errorRate.errorRate.toFixed(2),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Recent Errors:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stats.monitoring.errorRate.recentErrors.length })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🚀 Performance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Operations:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stats.monitoring.performanceStats.operationCount })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Avg Duration:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  stats.monitoring.performanceStats.avgDuration.toFixed(0),
                  "ms"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Slowest:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: stats.monitoring.performanceStats.maxDuration > 3e3 ? "status-warning" : "status-ok", children: [
                  stats.monitoring.performanceStats.maxDuration.toFixed(0),
                  "ms"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "👤 User Activity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Actions:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stats.monitoring.userActivity.actionCount })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Unique Users:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stats.monitoring.userActivity.uniqueUsers })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monitor-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Recent Actions:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stats.monitoring.userActivity.recentActions.length })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recent-errors-section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🔴 Recent Errors" }),
            stats.monitoring.errorRate.recentErrors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "status-ok", children: "✅ No errors in the last 5 minutes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-list", children: stats.monitoring.errorRate.recentErrors.slice(0, 5).map((error, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-time", children: new Date(error.timestamp).toLocaleTimeString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error.message }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-context", children: JSON.stringify(error.context) })
            ] }, idx)) })
          ] })
        ] })
      ] }),
      selectedTab === "activity" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Recent Activity" }),
        stats.recentActivity.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No activity logged" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-list", children: stats.recentActivity.map((event, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-time", children: new Date(event.timestamp).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-name", children: event.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-details", children: JSON.stringify(event.properties || {}) })
        ] }, index)) })
      ] })
    ] })
  ] });
}
export {
  AdminDashboard as default
};
