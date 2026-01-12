import { r as reactExports, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
import supportTicketService from "./chunk-1767948920285-supportTicketService.js";
const SupportModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("general");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [submitSuccess, setSubmitSuccess] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [tickets, setTickets] = reactExports.useState([]);
  const [showHistory, setShowHistory] = reactExports.useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = reactExports.useState(null);
  const [hasPrioritySupport, setHasPrioritySupport] = reactExports.useState(false);
  const [estimatedResponse, setEstimatedResponse] = reactExports.useState("3 days");
  reactExports.useEffect(() => {
    if (isOpen) {
      const hasAccess = supportTicketService.hasPrioritySupport();
      setHasPrioritySupport(hasAccess);
      const responseTime = supportTicketService.getEstimatedResponseTime();
      setEstimatedResponse(responseTime);
      loadTickets();
    }
  }, [isOpen]);
  const loadTickets = async () => {
    try {
      console.log("📋 SupportModal: Loading tickets...");
      const userTickets = await supportTicketService.getUserTickets();
      console.log("✅ SupportModal: Loaded tickets:", userTickets);
      setTickets(userTickets);
    } catch (err) {
      console.error("❌ SupportModal: Failed to load tickets:", err);
      setError("Failed to load tickets: " + err.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      console.log("📝 SupportModal: Submitting ticket...");
      const result = await supportTicketService.createTicket({
        subject: subject.trim(),
        message: message.trim(),
        category
      });
      console.log("📝 SupportModal: Ticket result:", result);
      if (result && result.success) {
        console.log("✅ SupportModal: Ticket created successfully");
        setSubmitSuccess(true);
        setSubject("");
        setMessage("");
        setCategory("general");
        await loadTickets();
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3e3);
      } else {
        console.error("❌ SupportModal: No success flag in result:", result);
        setError("Failed to submit ticket. Please try again.");
      }
    } catch (err) {
      console.error("❌ SupportModal: Exception:", err);
      setError(err.message || "Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const getStatusBadge = (status) => {
    const badges = {
      open: { text: "Open", color: "#3b82f6", icon: "🔵" },
      in_progress: { text: "In Progress", color: "#f59e0b", icon: "🟡" },
      resolved: { text: "Resolved", color: "#10b981", icon: "✅" },
      closed: { text: "Closed", color: "#6b7280", icon: "⚫" }
    };
    const badge = badges[status] || badges.open;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
      padding: "4px 12px",
      borderRadius: "12px",
      backgroundColor: badge.color + "20",
      color: badge.color,
      fontSize: "12px",
      fontWeight: "bold"
    }, children: [
      badge.icon,
      " ",
      badge.text
    ] });
  };
  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { text: "🚨 URGENT", color: "#ef4444" },
      high: { text: "⚡ High Priority", color: "#f59e0b" },
      standard: { text: "Standard", color: "#6b7280" }
    };
    const badge = badges[priority] || badges.standard;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
      padding: "4px 12px",
      borderRadius: "12px",
      backgroundColor: badge.color + "20",
      color: badge.color,
      fontSize: "12px",
      fontWeight: "bold"
    }, children: badge.text });
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "support-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "support-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "support-modal-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "support-modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🎧 Support Center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "support-response-time", children: hasPrioritySupport ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "priority-badge", children: [
        "👑 Priority Support - ",
        estimatedResponse,
        " response"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "standard-badge", children: [
        "⏱️ Standard Support - ",
        estimatedResponse,
        " response"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "support-tabs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `support-tab ${!showHistory ? "active" : ""}`,
          onClick: () => setShowHistory(false),
          children: "📝 New Ticket"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: `support-tab ${showHistory ? "active" : ""}`,
          onClick: () => setShowHistory(true),
          children: [
            "📋 My Tickets (",
            tickets.length,
            ")"
          ]
        }
      )
    ] }),
    !showHistory ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "support-form", children: [
      submitSuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "support-success", children: [
        "✅ Ticket submitted successfully! We'll respond within ",
        estimatedResponse,
        "."
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "support-error", children: [
        "❌ ",
        error
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: category,
            onChange: (e) => setCategory(e.target.value),
            className: "support-select",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "general", children: "General Question" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "technical", children: "Technical Issue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "billing", children: "Billing & Payments" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "feature_request", children: "Feature Request" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Subject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: subject,
            onChange: (e) => setSubject(e.target.value),
            placeholder: "Brief description of your issue",
            className: "support-input",
            maxLength: 100
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: message,
            onChange: (e) => setMessage(e.target.value),
            placeholder: "Provide detailed information about your issue...",
            className: "support-textarea",
            rows: 6,
            maxLength: 1e3
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "char-count", children: [
          message.length,
          "/1000"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          className: "support-submit-btn",
          disabled: isSubmitting,
          children: isSubmitting ? "⏳ Submitting..." : "📤 Submit Ticket"
        }
      ),
      !hasPrioritySupport && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "support-upgrade-notice", children: [
        "💡 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Want faster support?" }),
        " Upgrade to Ultimate for 2-hour priority response!"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "support-ticket-list", children: tickets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-tickets", children: "📭 No support tickets yet" }) : selectedTicketDetail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-detail-view", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "back-button",
          onClick: () => setSelectedTicketDetail(null),
          children: "← Back to Tickets"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-detail-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: selectedTicketDetail.subject }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-badges", children: [
          getPriorityBadge(selectedTicketDetail.priority),
          getStatusBadge(selectedTicketDetail.status)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-detail-meta", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "📁 ",
          selectedTicketDetail.category
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "🕒 ",
          new Date(selectedTicketDetail.createdAt?.seconds * 1e3 || selectedTicketDetail.createdAt).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Ticket #",
          selectedTicketDetail.id.substring(0, 8)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-conversation", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "message-item user-message", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "message-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "👤 You" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(selectedTicketDetail.createdAt?.seconds * 1e3 || selectedTicketDetail.createdAt).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: selectedTicketDetail.message })
        ] }),
        selectedTicketDetail.responses && selectedTicketDetail.responses.map((response, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `message-item ${response.isAdmin ? "admin-message" : "user-message"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "message-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              response.isAdmin ? "👨‍💼" : "👤",
              " ",
              response.isAdmin ? response.adminName : "You"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(response.timestamp?.seconds * 1e3 || response.timestamp).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: response.message })
        ] }, index)),
        selectedTicketDetail.status === "resolved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-resolved-notice", children: [
          "✅ ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "This ticket has been resolved!" }),
          " If you need further assistance, please create a new ticket."
        ] })
      ] })
    ] }) : tickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "ticket-item",
        onClick: () => setSelectedTicketDetail(ticket),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: ticket.subject }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-badges", children: [
              getPriorityBadge(ticket.priority),
              getStatusBadge(ticket.status)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ticket-message", children: ticket.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ticket-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "📁 ",
              ticket.category
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "🕒 ",
              new Date(ticket.createdAt?.seconds * 1e3 || ticket.createdAt).toLocaleDateString()
            ] }),
            ticket.responses?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "💬 ",
              ticket.responses.length,
              " ",
              ticket.responses.length === 1 ? "response" : "responses"
            ] })
          ] }),
          ticket.responses?.length > 0 && ticket.responses.some((r) => r.isAdmin) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "new-response-indicator", children: "✨ New response from support!" })
        ]
      },
      ticket.id
    )) })
  ] }) });
};
export {
  SupportModal as default
};
