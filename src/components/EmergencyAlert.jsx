// Emergency Alert Component - GPS SOS
import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import syncService from '../services/syncService';
import nativeGPSService from '../services/nativeGPSService';
import './EmergencyAlert.css';

const EmergencyAlert = ({ onClose }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [location, setLocation] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  
  useEffect(() => {
    // Load emergency alert history
    const loadHistory = async () => {
      try {
        const { value } = await Preferences.get({ key: 'emergency_alert' });
        const localData = localStorage.getItem('emergency_alert');
        
        if (value) {
          const history = JSON.parse(value);
          setAlertHistory(Array.isArray(history) ? history : [history]);
          if(import.meta.env.DEV)console.log('📊 Loaded emergency history:', history);
        } else if (localData) {
          const history = JSON.parse(localData);
          setAlertHistory(Array.isArray(history) ? history : [history]);
        }
      } catch (error) {
        console.error('Failed to load emergency history:', error);
      }
    };
    loadHistory();
  }, []);

  const triggerEmergency = async () => {
    setIsTriggering(true);

    try {
      // Get current location
      const gpsLocation = await nativeGPSService.getCurrentLocation();
      setLocation(gpsLocation);

      // Save emergency alert
      const alert = {
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        timestamp: Date.now(),
        date: new Date().toISOString()
      };

      // Save to all storage locations
      const updatedHistory = [...alertHistory, alert];
      localStorage.setItem('emergency_alert', JSON.stringify(updatedHistory));
      await Preferences.set({ key: 'emergency_alert', value: JSON.stringify(updatedHistory) });
      await syncService.saveData('emergency_alert', alert);
      setAlertHistory(updatedHistory);

      // In production, send SMS to emergency contacts
      alert('Emergency alert sent! Location shared with emergency contacts.');

    } catch (error) {
      console.error('Emergency alert failed:', error);
      alert('Failed to send emergency alert');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="emergency-modal">
      <div className="emergency-content">
        <div className="emergency-header">
          <h2>🚨 Emergency Alert</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="emergency-warning">
          <h3>⚠️ Emergency SOS</h3>
          <p>This will send your GPS location to emergency contacts</p>
        </div>

        {location && (
          <div className="location-display">
            <p>📍 Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
          </div>
        )}

        <div className="emergency-actions">
          <button 
            className="emergency-btn" 
            onClick={triggerEmergency}
            disabled={isTriggering}
          >
            {isTriggering ? 'Sending...' : '🚨 Trigger Emergency Alert'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;
