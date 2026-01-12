import { r as reactExports, i as collection, k as db, q as query, o as orderBy, l as onSnapshot, j as jsxRuntimeExports, b as auth, s as signInWithEmailAndPassword, m as doc, u as updateDoc, n as serverTimestamp, p as getDoc, t as getDocs, v as arrayUnion } from "./entry-1767948920134-index.js";
const AdminSupportDashboard = () => {
  const [tickets, setTickets] = reactExports.useState([]);
  const [selectedTicket, setSelectedTicket] = reactExports.useState(null);
  const [replyMessage, setReplyMessage] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [filterPriority, setFilterPriority] = reactExports.useState("all");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [adminName, setAdminName] = reactExports.useState("Support Team");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [isAuthenticated, setIsAuthenticated] = reactExports.useState(false);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loginError, setLoginError] = reactExports.useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    console.log("🔐 [ADMIN LOGIN] Attempting login with:", email);
    try {
      if (!auth) {
        console.error("❌ [ADMIN LOGIN] Firebase Auth not initialized!");
        setLoginError("Authentication service not available");
        return;
      }
      console.log("🔐 [ADMIN LOGIN] Calling signInWithEmailAndPassword...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ [ADMIN LOGIN] Success!", userCredential.user.email);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("❌ [ADMIN LOGIN] Error:", error.code, error.message);
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        setLoginError("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        setLoginError("No admin account found with this email");
      } else if (error.code === "auth/too-many-requests") {
        setLoginError("Too many failed attempts. Try again later.");
      } else {
        setLoginError(`Login failed: ${error.message}`);
      }
    }
  };
  reactExports.useEffect(() => {
    if (!isAuthenticated) return;
    const ticketsRef = collection(db, "support_tickets");
    const q = query(ticketsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsList = [];
      snapshot.forEach((doc2) => {
        ticketsList.push({
          id: doc2.id,
          ...doc2.data()
        });
      });
      setTickets(ticketsList);
    }, (error) => {
      console.error("Error fetching tickets:", error);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "admin-login-container", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-login-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "🔒 Admin Login" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Please sign in to access the support dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "admin-login-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            placeholder: "Admin Email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true
          }
        ),
        loginError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "login-error", children: loginError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", children: "Sign In" })
      ] })
    ] }) });
  }
  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = filterStatus === "all" || ticket.status === filterStatus;
    const priorityMatch = filterPriority === "all" || ticket.priority === filterPriority;
    const searchMatch = searchQuery === "" || ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && priorityMatch && searchMatch;
  });
  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setIsSubmitting(true);
    console.log("🔥 [ADMIN REPLY] Starting reply process...");
    console.log("🔥 [ADMIN REPLY] auth.currentUser:", auth.currentUser);
    console.log("🔥 [ADMIN REPLY] auth.currentUser.uid:", auth.currentUser?.uid);
    console.log("🔥 [ADMIN REPLY] auth.currentUser.email:", auth.currentUser?.email);
    if (!auth.currentUser) {
      console.error("❌ [ADMIN REPLY] No authenticated user! Auth state lost.");
      alert("Authentication expired. Please refresh and login again.");
      setIsSubmitting(false);
      setIsAuthenticated(false);
      return;
    }
    try {
      const ticketRef = doc(db, "support_tickets", selectedTicket.id);
      const ticketSnap = await getDoc(ticketRef);
      if (!ticketSnap.exists()) {
        alert("This ticket no longer exists. It may have been deleted. Refreshing ticket list...");
        const ticketsRef = collection(db, "support_tickets");
        const q = query(ticketsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const ticketsList = [];
        snapshot.forEach((doc2) => {
          ticketsList.push({ id: doc2.id, ...doc2.data() });
        });
        setTickets(ticketsList);
        setSelectedTicket(null);
        setIsSubmitting(false);
        return;
      }
      console.log("🔥 [ADMIN REPLY] Ticket exists, preparing update...");
      const response = {
        message: replyMessage.trim(),
        adminName,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        // Use ISO string instead of serverTimestamp inside arrayUnion
        isAdmin: true
      };
      console.log("🔥 [ADMIN REPLY] Calling updateDoc...");
      await updateDoc(ticketRef, {
        responses: arrayUnion(response),
        status: "in_progress",
        updatedAt: serverTimestamp()
      });
      console.log("✅ [ADMIN REPLY] Update successful!");
      fetch(`${"http://localhost:3001"}/api/support/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          userEmail: selectedTicket.userEmail,
          userName: selectedTicket.userName,
          subject: selectedTicket.subject,
          replyMessage: replyMessage.trim(),
          adminName
        })
      }).catch((err) => console.warn("Email notification failed (non-critical):", err));
      setReplyMessage("");
      alert("Reply sent successfully!");
    } catch (error) {
      console.error("❌ [ADMIN REPLY] Error sending reply:", error);
      console.error("❌ [ADMIN REPLY] Error code:", error.code);
      console.error("❌ [ADMIN REPLY] Error message:", error.message);
      alert(`Failed to send reply: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, "support_tickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...newStatus === "resolved" && { resolvedAt: serverTimestamp() }
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const assignTicket = async (ticketId, assignTo) => {
    try {
      const ticketRef = doc(db, "support_tickets", ticketId);
      await updateDoc(ticketRef, {
        assignedTo: assignTo,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error assigning ticket:", error);
    }
  };
  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { color: "#ef4444", icon: "🔴", text: "URGENT" },
      high: { color: "#f59e0b", icon: "🟡", text: "HIGH" },
      standard: { color: "#3b82f6", icon: "🔵", text: "STANDARD" }
    };
    const badge = badges[priority] || badges.standard;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "priority-badge", style: { backgroundColor: badge.color }, children: [
      badge.icon,
      " ",
      badge.text
    ] });
  };
  const getStatusBadge = (status) => {
    const badges = {
      open: { color: "#3b82f6", icon: "🔵", text: "Open" },
      in_progress: { color: "#f59e0b", icon: "🟡", text: "In Progress" },
      resolved: { color: "#10b981", icon: "✅", text: "Resolved" },
      closed: { color: "#6b7280", icon: "⚫", text: "Closed" }
    };
    const badge = badges[status] || badges.open;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-badge", style: { backgroundColor: badge.color }, children: [
      badge.icon,
      " ",
      badge.text
    ] });
  };
  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };
  const getTicketStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      urgent: tickets.filter((t) => t.priority === "urgent").length
    };
  };
  const stats = getTicketStats();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-support-dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "🎫 Support Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Manage customer support tickets and responses" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-name-input", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Your Name:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: adminName,
            onChange: (e) => setAdminName(e.target.value),
            placeholder: "Support Agent Name"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "📊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Tickets" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card urgent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🔴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.urgent }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Urgent" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card open", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🔵" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.open }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Open" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card progress", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🟡" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: stats.inProgress }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "In Progress" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filters-bar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          className: "search-input",
          placeholder: "🔍 Search tickets...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "open", children: "Open" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_progress", children: "In Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "resolved", children: "Resolved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "closed", children: "Closed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterPriority, onChange: (e) => setFilterPriority(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Priority" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "urgent", children: "Urgent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "High" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "standard", children: "Standard" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tickets-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
          "Tickets (",
          filteredTickets.length,
          ")"
        ] }),
        filteredTickets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "empty-icon", children: "📭" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No tickets found" })
        ] }) : filteredTickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `ticket-card ${selectedTicket?.id === ticket.id ? "selected" : ""}`,
            onClick: () => setSelectedTicket(ticket),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-header", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-badges", children: [
                  getPriorityBadge(ticket.priority),
                  getStatusBadge(ticket.status)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ticket-plan", children: ticket.planTier })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "ticket-subject", children: ticket.subject }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "ticket-meta", children: [
                "👤 ",
                ticket.userName,
                " • ",
                ticket.userEmail
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "ticket-preview", children: [
                ticket.message.substring(0, 100),
                "..."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-footer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "📅 ",
                  formatDate(ticket.createdAt)
                ] }),
                ticket.responses && ticket.responses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "💬 ",
                  ticket.responses.length,
                  " replies"
                ] })
              ] })
            ]
          },
          ticket.id
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ticket-detail", children: selectedTicket ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-badges", children: [
              getPriorityBadge(selectedTicket.priority),
              getStatusBadge(selectedTicket.status)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: selectedTicket.subject }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "detail-meta", children: [
              "Ticket #",
              selectedTicket.id.substring(0, 8),
              " • Category: ",
              selectedTicket.category
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedTicket.status,
                onChange: (e) => updateTicketStatus(selectedTicket.id, e.target.value),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_progress", children: "In Progress" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "resolved", children: "Resolved" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "closed", children: "Closed" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Assign to...",
                defaultValue: selectedTicket.assignedTo || "",
                onBlur: (e) => assignTicket(selectedTicket.id, e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-info-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "👤 Customer Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Name:" }),
            " ",
            selectedTicket.userName
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email:" }),
            " ",
            selectedTicket.userEmail
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Plan:" }),
            " ",
            selectedTicket.planTier
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SLA:" }),
            " ",
            selectedTicket.slaHours,
            " hours"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Created:" }),
            " ",
            formatDate(selectedTicket.createdAt)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "message-card user-message", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "message-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              "👤 ",
              selectedTicket.userName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(selectedTicket.createdAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: selectedTicket.message })
        ] }),
        selectedTicket.responses && selectedTicket.responses.map((response, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `message-card ${response.isAdmin ? "admin-message" : "user-message"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "message-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              response.isAdmin ? "👨‍💼" : "👤",
              " ",
              response.isAdmin ? response.adminName : selectedTicket.userName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(response.timestamp) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: response.message })
        ] }, index)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reply-form", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "💬 Send Reply" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: replyMessage,
              onChange: (e) => setReplyMessage(e.target.value),
              placeholder: "Type your response here... User will be notified via email.",
              rows: 5
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reply-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "reply-btn",
              onClick: handleReply,
              disabled: isSubmitting || !replyMessage.trim(),
              children: isSubmitting ? "Sending..." : "📤 Send Reply & Notify User"
            }
          ) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-detail", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "empty-icon", children: "📋" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Select a ticket" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Choose a ticket from the list to view details and respond" })
      ] }) })
    ] })
  ] });
};
export {
  AdminSupportDashboard as default
};
