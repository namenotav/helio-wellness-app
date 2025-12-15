import { useState } from 'react'
import './HealthToolsModal.css'

// Import sub-modals (will be lazy loaded in NewDashboard)
const HealthToolsModal = ({ onClose, onOpenHealthAvatar, onOpenARScanner, onOpenEmergency, onOpenInsurance }) => {
  return (
    <div className="health-tools-modal-overlay" onClick={onClose}>
      <div className="health-tools-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="health-tools-modal-close" onClick={onClose}>×</button>
        
        <div className="health-tools-header">
          <h2>🏥 Health Tools</h2>
          <p>Your complete health toolkit</p>
        </div>

        <div className="health-tools-grid">
          <button className="health-tool-card" onClick={() => {
            onClose();
            onOpenHealthAvatar();
          }}>
            <div className="tool-icon">👤</div>
            <h3>Health Avatar</h3>
            <p>Customize your character</p>
          </button>

          <button className="health-tool-card premium" onClick={() => {
            alert('🚧 Coming Soon!\n\nBody Scanner feature is currently under development. Stay tuned!');
          }}>
            <div className="tool-icon">📱</div>
            <h3>Body Scanner</h3>
            <p>3D body scanning</p>
            <span className="premium-badge">✨</span>
          </button>

          <button className="health-tool-card" onClick={() => {
            onClose();
            onOpenEmergency();
          }}>
            <div className="tool-icon">🚨</div>
            <h3>Emergency Panel</h3>
            <p>SOS contacts & info</p>
          </button>

          <button className="health-tool-card premium" onClick={() => {
            alert('🚧 Coming Soon!\n\nInsurance Rewards feature is currently in development. Stay tuned!');
          }}>
            <div className="tool-icon">🏥</div>
            <h3>Insurance Rewards</h3>
            <p>Track your benefits</p>
            <span className="premium-badge">✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthToolsModal;
