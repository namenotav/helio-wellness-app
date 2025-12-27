// Admin Support Dashboard - Manage and respond to support tickets
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../services/firebase';
import './AdminSupportDashboard.css';

const AdminSupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminName, setAdminName] = useState('Support Team');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setAdminName(user.email.split('@')[0]);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle admin login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Invalid email or password');
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1>🔒 Admin Login</h1>
          <p>Please sign in to access the support dashboard</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {loginError && <p className="login-error">{loginError}</p>}
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  // Real-time ticket updates from Firestore
  useEffect(() => {
    const ticketsRef = collection(db, 'support_tickets');
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsList = [];
      snapshot.forEach((doc) => {
        ticketsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setTickets(ticketsList);
    }, (error) => {
      console.error('Error fetching tickets:', error);
    });

    return () => unsubscribe();
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
    const searchMatch = searchQuery === '' || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && priorityMatch && searchMatch;
  });

  // Send reply to ticket
  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setIsSubmitting(true);
    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      
      const response = {
        message: replyMessage.trim(),
        adminName: adminName,
        timestamp: serverTimestamp(),
        isAdmin: true
      };

      await updateDoc(ticketRef, {
        responses: arrayUnion(response),
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });

      // Send email notification to user
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/support/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          userEmail: selectedTicket.userEmail,
          userName: selectedTicket.userName,
          subject: selectedTicket.subject,
          replyMessage: replyMessage.trim(),
          adminName: adminName
        })
      });

      setReplyMessage('');
      alert('Reply sent successfully! User will be notified via email.');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'resolved' && { resolvedAt: serverTimestamp() })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Assign ticket to admin
  const assignTicket = async (ticketId, assignTo) => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        assignedTo: assignTo,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { color: '#ef4444', icon: '🔴', text: 'URGENT' },
      high: { color: '#f59e0b', icon: '🟡', text: 'HIGH' },
      standard: { color: '#3b82f6', icon: '🔵', text: 'STANDARD' }
    };
    const badge = badges[priority] || badges.standard;
    return (
      <span className="priority-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: '#3b82f6', icon: '🔵', text: 'Open' },
      in_progress: { color: '#f59e0b', icon: '🟡', text: 'In Progress' },
      resolved: { color: '#10b981', icon: '✅', text: 'Resolved' },
      closed: { color: '#6b7280', icon: '⚫', text: 'Closed' }
    };
    const badge = badges[status] || badges.open;
    return (
      <span className="status-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getTicketStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length
    };
  };

  const stats = getTicketStats();

  return (
    <div className="admin-support-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>🎫 Support Dashboard</h1>
          <p>Manage customer support tickets and responses</p>
        </div>
        <div className="admin-name-input">
          <label>Your Name:</label>
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Support Agent Name"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-icon">🔴</div>
          <div className="stat-value">{stats.urgent}</div>
          <div className="stat-label">Urgent</div>
        </div>
        <div className="stat-card open">
          <div className="stat-icon">🔵</div>
          <div className="stat-value">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">🟡</div>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="standard">Standard</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Tickets List */}
        <div className="tickets-list">
          <h3>Tickets ({filteredTickets.length})</h3>
          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No tickets found</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className={`ticket-card ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-header">
                  <div className="ticket-badges">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="ticket-plan">{ticket.planTier}</div>
                </div>
                <h4 className="ticket-subject">{ticket.subject}</h4>
                <p className="ticket-meta">
                  👤 {ticket.userName} • {ticket.userEmail}
                </p>
                <p className="ticket-preview">{ticket.message.substring(0, 100)}...</p>
                <div className="ticket-footer">
                  <span>📅 {formatDate(ticket.createdAt)}</span>
                  {ticket.responses && ticket.responses.length > 0 && (
                    <span>💬 {ticket.responses.length} replies</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Detail */}
        <div className="ticket-detail">
          {selectedTicket ? (
            <>
              <div className="detail-header">
                <div>
                  <div className="detail-badges">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h2>{selectedTicket.subject}</h2>
                  <p className="detail-meta">
                    Ticket #{selectedTicket.id.substring(0, 8)} • Category: {selectedTicket.category}
                  </p>
                </div>
                <div className="detail-actions">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Assign to..."
                    defaultValue={selectedTicket.assignedTo || ''}
                    onBlur={(e) => assignTicket(selectedTicket.id, e.target.value)}
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="user-info-card">
                <h4>👤 Customer Information</h4>
                <p><strong>Name:</strong> {selectedTicket.userName}</p>
                <p><strong>Email:</strong> {selectedTicket.userEmail}</p>
                <p><strong>Plan:</strong> {selectedTicket.planTier}</p>
                <p><strong>SLA:</strong> {selectedTicket.slaHours} hours</p>
                <p><strong>Created:</strong> {formatDate(selectedTicket.createdAt)}</p>
              </div>

              {/* Original Message */}
              <div className="message-card user-message">
                <div className="message-header">
                  <strong>👤 {selectedTicket.userName}</strong>
                  <span>{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <p>{selectedTicket.message}</p>
              </div>

              {/* Responses */}
              {selectedTicket.responses && selectedTicket.responses.map((response, index) => (
                <div key={index} className={`message-card ${response.isAdmin ? 'admin-message' : 'user-message'}`}>
                  <div className="message-header">
                    <strong>
                      {response.isAdmin ? '👨‍💼' : '👤'} {response.isAdmin ? response.adminName : selectedTicket.userName}
                    </strong>
                    <span>{formatDate(response.timestamp)}</span>
                  </div>
                  <p>{response.message}</p>
                </div>
              ))}

              {/* Reply Form */}
              <div className="reply-form">
                <h4>💬 Send Reply</h4>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here... User will be notified via email."
                  rows={5}
                />
                <div className="reply-actions">
                  <button
                    className="reply-btn"
                    onClick={handleReply}
                    disabled={isSubmitting || !replyMessage.trim()}
                  >
                    {isSubmitting ? 'Sending...' : '📤 Send Reply & Notify User'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-detail">
              <div className="empty-icon">📋</div>
              <h3>Select a ticket</h3>
              <p>Choose a ticket from the list to view details and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportDashboard;
