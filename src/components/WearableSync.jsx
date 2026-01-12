import React from 'react';
import './WearableSync.css';

const WearableSync = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="wearable-overlay" onClick={onClose}>
      <div className="wearable-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wearable-close" onClick={onClose}>✕</button>

        <div className="wearable-header">
          <div className="wearable-icon">⌚</div>
          <h2>Wearable Devices</h2>
          <p style={{ fontSize: '48px', margin: '40px 0 20px' }}>🚧</p>
          <h3 style={{ color: '#FFB84D', marginBottom: '10px' }}>Coming Soon!</h3>
          <p style={{ color: '#b8b5d1', maxWidth: '400px', margin: '0 auto 30px' }}>
            Direct Bluetooth wearable sync is currently under development. 
            For now, use Apple Health or Google Fit sync instead!
          </p>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--theme-accent-color, #8B5FE8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Got It
          </button>
        </div>

        <div style={{ padding: '30px', textAlign: 'left' }}>
          <h4 style={{ color: '#FFB84D', marginBottom: '15px' }}>📋 Planned Integrations:</h4>
          <ul style={{ color: '#b8b5d1', lineHeight: '1.8' }}>
            <li>✨ Fitbit (Charge, Versa, Sense series)</li>
            <li>✨ Garmin (Forerunner, Fenix series)</li>
            <li>✨ Apple Watch (Series 4+)</li>
            <li>✨ Samsung Galaxy Watch</li>
            <li>✨ Xiaomi Mi Band</li>
            <li>✨ Generic Bluetooth heart rate monitors</li>
          </ul>
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 200, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 200, 255, 0.3)' }}>
            <p style={{ color: '#00C8FF', margin: '0', fontSize: '14px' }}>
              💡 <strong>Alternative:</strong> You can currently sync fitness data via Apple Health (iOS) or Google Fit (Android) from Settings!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WearableSync;



