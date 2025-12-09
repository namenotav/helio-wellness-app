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
  const [locationStatus, setLocationStatus] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [playingAlarm, setPlayingAlarm] = useState(false);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    // Load from permanent storage
    const savedData = await emergencyService.loadEmergencyData();
    
    const service = emergencyService;
    setMonitoring(service.monitoring);
    setStatus(service.monitoringStatus);
    setContacts(service.emergencyContacts || []);
    setLocationStatus(service.getLocationStatus());
    setFallDetectionEnabled(service.fallDetectionActive || false);
    
    // Auto-resume monitoring if it was enabled
    if (savedData?.monitoring && !service.monitoring) {
      if(import.meta.env.DEV)console.log('🔄 Auto-resuming monitoring from saved state');
      await emergencyService.startMonitoring();
      setMonitoring(true);
      setTimeout(() => {
        setLocationStatus(emergencyService.getLocationStatus());
      }, 1000);
    }
    
    // Auto-resume fall detection if it was enabled
    if (savedData?.fallDetection && !service.fallDetectionActive) {
      if(import.meta.env.DEV)console.log('🔄 Auto-resuming fall detection from saved state');
      // Note: Global callback is registered in NewDashboard, will handle alerts
      emergencyService.startFallDetection(null);
      setFallDetectionEnabled(true);
    }
  };

  const handleToggleMonitoring = async () => {
    try {
      if (monitoring) {
        await emergencyService.stopMonitoring();
      } else {
        await emergencyService.startMonitoring();
      }
      setMonitoring(!monitoring);
      
      // Save monitoring state to permanent storage
      await emergencyService.saveEmergencyData();
      
      // Update location status after toggle
      setTimeout(() => {
        setLocationStatus(emergencyService.getLocationStatus());
      }, 1000);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Toggle monitoring error:', error);
      alert('⚠️ Error: ' + error.message);
    }
  };

  const handleAddContact = async () => {
    if (newContact.name && newContact.phone) {
      await emergencyService.addEmergencyContact(newContact);
      await loadEmergencyData(); // Reload from permanent storage
      setNewContact({ name: '', phone: '', relationship: '', primary: false });
      setShowAddContact(false);
    }
  };

  const handleTriggerEmergency = async () => {
    // Start countdown with alarm
    setPlayingAlarm(true);
    emergencyService.playEmergencyAlarm();
    
    let timeLeft = 5;
    setCountdown(timeLeft);
    
    const countdownInterval = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        executeEmergency();
      }
    }, 1000);
    
    // Allow cancel during countdown
    const cancelCountdown = () => {
      clearInterval(countdownInterval);
      setCountdown(null);
      setPlayingAlarm(false);
      emergencyService.stopEmergencyAlarm();
    };
    
    // Store cancel function for UI
    window.emergencyCancelCountdown = cancelCountdown;
  };
  
  const executeEmergency = async () => {
    setCountdown(null);
    setTriggeringEmergency(true);
    
    try {
      await emergencyService.triggerManualEmergency();
      setPlayingAlarm(false);
      alert('🚨 Emergency protocol activated!\n• Calling 999\n• Contacts notified\n• Location shared');
    } catch (error) {
      setPlayingAlarm(false);
      emergencyService.stopEmergencyAlarm();
      alert('Failed to trigger emergency: ' + error.message);
    }
    setTriggeringEmergency(false);
  };

  const handleShareLocation = async () => {
    setSharingLocation(true);
    try {
      if(import.meta.env.DEV)console.log('🔄 Requesting GPS location...');
      const result = await emergencyService.shareCurrentLocation();
      if (result.success) {
        if(import.meta.env.DEV)console.log('✅ Location shared successfully');
        // Update location status to show the fresh location
        setLocationStatus({
          tracking: locationStatus?.tracking || false,
          currentLocation: result.location,
          lastUpdate: new Date()
        });
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Share location error:', error);
      const errorMsg = error.message.includes('denied') 
        ? 'Location permission denied. Please enable GPS in your device settings.'
        : error.message.includes('timeout')
        ? 'GPS timeout. Make sure location services are enabled and try again.'
        : 'Failed to get location: ' + error.message;
      alert(errorMsg);
    }
    setSharingLocation(false);
  };

  return (
    <div className="emergency-overlay">
      <div className="emergency-modal">
        <button className="emergency-close" onClick={onClose}>✕</button>

        <h2 className="emergency-title">🚨 Emergency Assistant</h2>
        <p className="emergency-disclaimer">⚠️ Requires manual activation. Not a medical device. Not a substitute for emergency services.</p>

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

        {/* Fall Detection Toggle */}
        <div className="fall-detection-section">
          <div className="fall-detection-header">
            <span className="fall-icon">🤕</span>
            <div className="fall-info">
              <h3>Fall Detection</h3>
              <p className="fall-description">Automatically detect hard falls using phone sensors</p>
            </div>
            <button 
              className={`toggle-fall-detection ${fallDetectionEnabled ? 'active' : ''}`}
              onClick={async () => {
                if (fallDetectionEnabled) {
                  await emergencyService.stopFallDetection();
                  setFallDetectionEnabled(false);
                } else {
                  // Note: Global callback is registered in NewDashboard, will handle alerts globally
                  await emergencyService.startFallDetection(null);
                  setFallDetectionEnabled(true);
                }
                // Save fall detection state
                await emergencyService.saveEmergencyData();
              }}
            >
              {fallDetectionEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {/* GPS Location Status */}
        {locationStatus && (
          <div className={`location-status ${locationStatus.tracking ? 'tracking' : 'inactive'}`}>
            <div className="location-header">
              <span className="location-icon">📍</span>
              <span className="location-text">
                {locationStatus.tracking ? 'GPS Tracking Active' : 'Location Ready - Tap to Share'}
              </span>
            </div>
            {locationStatus.currentLocation && (
              <div className="location-details">
                <div className="location-coord">
                  <strong>Location:</strong> {locationStatus.currentLocation.latitude.toFixed(6)}, {locationStatus.currentLocation.longitude.toFixed(6)}
                </div>
                <div className="location-accuracy">
                  <strong>Accuracy:</strong> ±{Math.round(locationStatus.currentLocation.accuracy)}m
                </div>
                {locationStatus.lastUpdate && (
                  <div className="location-time">
                    <strong>Last Update:</strong> {new Date(locationStatus.lastUpdate).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}
            <button 
              className="share-location-btn"
              onClick={handleShareLocation}
              disabled={sharingLocation}
            >
              {sharingLocation ? '📍 Getting Location...' : '📍 Share My Location'}
            </button>
          </div>
        )}

        {/* Emergency Trigger Button */}
        <div className="emergency-trigger">
          <button 
            className="panic-button"
            onClick={handleTriggerEmergency}
            disabled={triggeringEmergency}
          >
            {countdown ? `🚨 CALLING IN ${countdown}...` : triggeringEmergency ? '🚨 CALLING 999...' : '🆘 EMERGENCY - CALL 999'}
          </button>
          <p className="panic-help">Press and hold to call 999 emergency services. Location will be shared with your contacts.</p>
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



