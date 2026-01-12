import React from 'react';
import './AppleHealthSync.css';

const AppleHealthSync = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="apple-health-overlay" onClick={onClose}>
      <div className="apple-health-modal" onClick={(e) => e.stopPropagation()}>
        <button className="apple-health-close" onClick={onClose}>✕</button>

        <div className="apple-health-header">
          <div className="health-icon">❤️</div>
          <h2>Apple Health Sync</h2>
          <p style={{ fontSize: '48px', margin: '40px 0 20px' }}>🚧</p>
          <h3 style={{ color: '#FFB84D', marginBottom: '10px' }}>Coming Soon!</h3>
          <p style={{ color: '#b8b5d1', maxWidth: '400px', margin: '0 auto 30px' }}>
            Native Apple Health integration is currently under development. 
            Stay tuned for seamless health data sync!
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
          <h4 style={{ color: '#FFB84D', marginBottom: '15px' }}>📋 Planned Features:</h4>
          <ul style={{ color: '#b8b5d1', lineHeight: '1.8' }}>
            <li>✨ Automatic step sync from Apple Health</li>
            <li>✨ Heart rate monitoring integration</li>
            <li>✨ Sleep analysis tracking</li>
            <li>✨ Calories & distance sync</li>
            <li>✨ Workout session import</li>
            <li>✨ Body measurements sync</li>
          </ul>
          <p style={{ color: '#888', marginTop: '20px', fontSize: '14px' }}>
            🔒 Your health data will be private and encrypted when this feature launches.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppleHealthSync;



