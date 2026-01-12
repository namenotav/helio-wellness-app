// Support Modal Component - Priority Support Ticket System
import React, { useState, useEffect } from 'react';
import supportTicketService from '../services/supportTicketService';
import subscriptionService from '../services/subscriptionService';
import './SupportModal.css';

const SupportModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [hasPrioritySupport, setHasPrioritySupport] = useState(false);
  const [estimatedResponse, setEstimatedResponse] = useState('3 days');

  useEffect(() => {
    if (isOpen) {
      // Check priority support access
      const hasAccess = supportTicketService.hasPrioritySupport();
      setHasPrioritySupport(hasAccess);
      
      // Get estimated response time
      const responseTime = supportTicketService.getEstimatedResponseTime();
      setEstimatedResponse(responseTime);
      
      // Load ticket history
      loadTickets();
    }
  }, [isOpen]);

  const loadTickets = async () => {
    try {
      console.log('📋 SupportModal: Loading tickets...');
      const userTickets = await supportTicketService.getUserTickets();
      console.log('✅ SupportModal: Loaded tickets:', userTickets);
      setTickets(userTickets);
    } catch (err) {
      console.error('❌ SupportModal: Failed to load tickets:', err);
      setError('Failed to load tickets: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('📝 SupportModal: Submitting ticket...');
      const result = await supportTicketService.createTicket({
        subject: subject.trim(),
        message: message.trim(),
        category
      });
      console.log('📝 SupportModal: Ticket result:', result);

      if (result && result.success) {
        console.log('✅ SupportModal: Ticket created successfully');
        setSubmitSuccess(true);
        setSubject('');
        setMessage('');
        setCategory('general');
        
        // Reload tickets
        await loadTickets();
        
        // Show success message for 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        console.error('❌ SupportModal: No success flag in result:', result);
        setError('Failed to submit ticket. Please try again.');
      }
    } catch (err) {
      console.error('❌ SupportModal: Exception:', err);
      setError(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { text: 'Open', color: '#3b82f6', icon: '🔵' },
      in_progress: { text: 'In Progress', color: '#f59e0b', icon: '🟡' },
      resolved: { text: 'Resolved', color: '#10b981', icon: '✅' },
      closed: { text: 'Closed', color: '#6b7280', icon: '⚫' }
    };
    const badge = badges[status] || badges.open;
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: '12px', 
        backgroundColor: badge.color + '20',
        color: badge.color,
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { text: '🚨 URGENT', color: '#ef4444' },
      high: { text: '⚡ High Priority', color: '#f59e0b' },
      standard: { text: 'Standard', color: '#6b7280' }
    };
    const badge = badges[priority] || badges.standard;
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: '12px', 
        backgroundColor: badge.color + '20',
        color: badge.color,
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {badge.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="support-modal-overlay" onClick={onClose}>
      <div className="support-modal" onClick={(e) => e.stopPropagation()}>
        <button className="support-modal-close" onClick={onClose}>✕</button>

        <div className="support-modal-header">
          <h2>🎧 Support Center</h2>
          <div className="support-response-time">
            {hasPrioritySupport ? (
              <span className="priority-badge">👑 Priority Support - {estimatedResponse} response</span>
            ) : (
              <span className="standard-badge">⏱️ Standard Support - {estimatedResponse} response</span>
            )}
          </div>
        </div>

        <div className="support-tabs">
          <button 
            className={`support-tab ${!showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(false)}
          >
            📝 New Ticket
          </button>
          <button 
            className={`support-tab ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(true)}
          >
            📋 My Tickets ({tickets.length})
          </button>
        </div>

        {!showHistory ? (
          <form onSubmit={handleSubmit} className="support-form">
            {submitSuccess && (
              <div className="support-success">
                ✅ Ticket submitted successfully! We'll respond within {estimatedResponse}.
              </div>
            )}

            {error && (
              <div className="support-error">
                ❌ {error}
              </div>
            )}

            <div className="form-group">
              <label>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="support-select"
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing & Payments</option>
                <option value="feature_request">Feature Request</option>
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="support-input"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide detailed information about your issue..."
                className="support-textarea"
                rows={6}
                maxLength={1000}
              />
              <div className="char-count">{message.length}/1000</div>
            </div>

            <button 
              type="submit" 
              className="support-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Submitting...' : '📤 Submit Ticket'}
            </button>

            {!hasPrioritySupport && (
              <div className="support-upgrade-notice">
                💡 <strong>Want faster support?</strong> Upgrade to Premium for priority support!
              </div>
            )}
          </form>
        ) : (
          <div className="support-ticket-list">
            {tickets.length === 0 ? (
              <div className="no-tickets">
                📭 No support tickets yet
              </div>
            ) : selectedTicketDetail ? (
              <div className="ticket-detail-view">
                <button 
                  className="back-button"
                  onClick={() => setSelectedTicketDetail(null)}
                >
                  ← Back to Tickets
                </button>
                
                <div className="ticket-detail-header">
                  <h3>{selectedTicketDetail.subject}</h3>
                  <div className="ticket-badges">
                    {getPriorityBadge(selectedTicketDetail.priority)}
                    {getStatusBadge(selectedTicketDetail.status)}
                  </div>
                </div>

                <div className="ticket-detail-meta">
                  <span>📁 {selectedTicketDetail.category}</span>
                  <span>🕒 {new Date(selectedTicketDetail.createdAt?.seconds * 1000 || selectedTicketDetail.createdAt).toLocaleString()}</span>
                  <span>Ticket #{selectedTicketDetail.id.substring(0, 8)}</span>
                </div>

                <div className="ticket-conversation">
                  <div className="message-item user-message">
                    <div className="message-header">
                      <strong>👤 You</strong>
                      <span>{new Date(selectedTicketDetail.createdAt?.seconds * 1000 || selectedTicketDetail.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{selectedTicketDetail.message}</p>
                  </div>

                  {selectedTicketDetail.responses && selectedTicketDetail.responses.map((response, index) => (
                    <div key={index} className={`message-item ${response.isAdmin ? 'admin-message' : 'user-message'}`}>
                      <div className="message-header">
                        <strong>
                          {response.isAdmin ? '👨‍💼' : '👤'} {response.isAdmin ? response.adminName : 'You'}
                        </strong>
                        <span>{new Date(response.timestamp?.seconds * 1000 || response.timestamp).toLocaleString()}</span>
                      </div>
                      <p>{response.message}</p>
                    </div>
                  ))}

                  {selectedTicketDetail.status === 'resolved' && (
                    <div className="ticket-resolved-notice">
                      ✅ <strong>This ticket has been resolved!</strong> If you need further assistance, please create a new ticket.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="ticket-item"
                  onClick={() => setSelectedTicketDetail(ticket)}
                >
                  <div className="ticket-header">
                    <h3>{ticket.subject}</h3>
                    <div className="ticket-badges">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                  <p className="ticket-message">{ticket.message}</p>
                  <div className="ticket-meta">
                    <span>📁 {ticket.category}</span>
                    <span>🕒 {new Date(ticket.createdAt?.seconds * 1000 || ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.responses?.length > 0 && (
                      <span>💬 {ticket.responses.length} {ticket.responses.length === 1 ? 'response' : 'responses'}</span>
                    )}
                  </div>
                  {ticket.responses?.length > 0 && ticket.responses.some(r => r.isAdmin) && (
                    <div className="new-response-indicator">✨ New response from support!</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportModal;
