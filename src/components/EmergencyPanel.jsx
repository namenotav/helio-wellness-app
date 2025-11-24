// Emergency Panel Component - 24/7 Health Monitoring
import { useState, useEffect } from 'react';
import './EmergencyPanel.css';
import emergencyService from '../services/emergencyService';

export default function EmergencyPanel({ onClose }) {
  const [monitoring, setMonitoring] = useState(false);
  const [status, setStatus] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '', primary: false });
  const [showAddContact, setShowAddContact] = useState(false);
  const [triggeringEmergency, setTriggeringEmergency] = useState(false);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = () => {
    const service = emergencyService;
    setMonitoring(service.isMonitoring);
    setStatus(service.monitoringStatus);
    setContacts(service.emergencyContacts || []);
  };

  const handleToggleMonitoring = () => {
    if (monitoring) {
      emergencyService.stopMonitoring();
    } else {
      emergencyService.startMonitoring();
    }
    setMonitoring(!monitoring);
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      emergencyService.addEmergencyContact(newContact);
      setContacts([...contacts, newContact]);
      setNewContact({ name: '', phone: '', relationship: '', primary: false });
      setShowAddContact(false);
    }
  };

  const handleTriggerEmergency = async () => {
    if (!confirm('⚠️ This will alert all emergency contacts and simulate calling an ambulance. Continue?')) {
      return;
    }

    setTriggeringEmergency(true);
    try {
      await emergencyService.triggerManualEmergency();
      alert('🚨 Emergency alert sent! Ambulance ETA: 12 minutes');
    } catch (error) {
      alert('Failed to trigger emergency: ' + error.message);
    }
    setTriggeringEmergency(false);
  };

  return (
    <div className="emergency-overlay">
      <div className="emergency-modal">
        <button className="emergency-close" onClick={onClose}>✕</button>

        <h2 className="emergency-title">🚨 Emergency Autopilot</h2>

        {/* Monitoring Status */}
        <div className={`monitoring-status ${monitoring ? 'active' : 'inactive'}`}>
          <div className="status-indicator">
            <span className="status-pulse"></span>
            <span className="status-text">
              {monitoring ? '✓ 24/7 Monitoring Active' : '⚠️ Monitoring Disabled'}
            </span>
          </div>
          <button 
            className={`toggle-monitoring ${monitoring ? 'active' : ''}`}
            onClick={handleToggleMonitoring}
          >
            {monitoring ? 'Disable' : 'Enable'}
          </button>
        </div>

        {/* Emergency Trigger Button */}
        <div className="emergency-trigger">
          <button 
            className="panic-button"
            onClick={handleTriggerEmergency}
            disabled={triggeringEmergency}
          >
            {triggeringEmergency ? '🚨 ALERTING...' : '🆘 EMERGENCY ALERT'}
          </button>
          <p className="panic-help">Press to immediately alert all emergency contacts</p>
        </div>

        {/* Monitoring Info */}
        {monitoring && status && (
          <div className="monitoring-info">
            <h3>📊 Health Monitoring</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Last Check:</span>
                <span className="info-value">{new Date(status.lastCheck).toLocaleTimeString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Check Interval:</span>
                <span className="info-value">5 minutes</span>
              </div>
              <div className="info-item">
                <span className="info-label">Anomalies:</span>
                <span className="info-value">{status.anomaliesDetected || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="emergency-contacts">
          <div className="contacts-header">
            <h3>👥 Emergency Contacts</h3>
            <button 
              className="add-contact-btn"
              onClick={() => setShowAddContact(!showAddContact)}
            >
              {showAddContact ? '✕' : '+'} {showAddContact ? 'Cancel' : 'Add'}
            </button>
          </div>

          {showAddContact && (
            <div className="add-contact-form">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                className="contact-input"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                className="contact-input"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                className="contact-input"
              />
              <label className="primary-checkbox">
                <input
                  type="checkbox"
                  checked={newContact.primary}
                  onChange={(e) => setNewContact({...newContact, primary: e.target.checked})}
                />
                Primary Contact
              </label>
              <button className="save-contact-btn" onClick={handleAddContact}>
                ✓ Save Contact
              </button>
            </div>
          )}

          <div className="contacts-list">
            {contacts.length === 0 ? (
              <div className="no-contacts">
                <p>⚠️ No emergency contacts added</p>
                <p className="help-text">Add at least one contact for emergency alerts</p>
              </div>
            ) : (
              contacts.map((contact, idx) => (
                <div key={idx} className={`contact-card ${contact.primary ? 'primary' : ''}`}>
                  <div className="contact-icon">
                    {contact.primary ? '⭐' : '👤'}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-phone">{contact.phone}</div>
                    <div className="contact-relationship">{contact.relationship}</div>
                  </div>
                  {contact.primary && (
                    <div className="primary-badge">Primary</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Features */}
        <div className="emergency-features">
          <div className="feature-item">
            <span className="feature-icon">🔍</span>
            <span className="feature-text">Detects unusual health patterns</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span className="feature-text">Auto-alerts emergency contacts</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚑</span>
            <span className="feature-text">Sends medical data to ambulance</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📍</span>
            <span className="feature-text">Shares your location instantly</span>
          </div>
        </div>
      </div>
    </div>
  );
}
