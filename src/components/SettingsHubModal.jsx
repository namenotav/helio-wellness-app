import './SettingsHubModal.css'

const SettingsHubModal = ({ onClose, onOpenNotifications, onOpenTheme, onOpenDevUnlock, onLogout, showDevButton, isDevMode, onDisableDevMode, onResetStepCounter, user }) => {
  return (
    <div className="settings-hub-modal-overlay" onClick={onClose}>
      <div className="settings-hub-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="settings-hub-modal-close" onClick={onClose}>×</button>
        
        <div className="settings-hub-header">
          <h2>⚙️ Settings & More</h2>
          <p>Customize your experience</p>
        </div>

        {isDevMode && (
          <div className="dev-mode-section">
            <div className="dev-mode-badge">✅ DEVELOPER MODE ACTIVE</div>
            <p className="dev-mode-subtitle">All Premium Features Unlocked 🚀</p>
            <div className="dev-mode-actions">
              <button onClick={() => {
                onResetStepCounter();
              }} className="dev-action-btn reset">
                🔄 Reset Step Counter
              </button>
              <button onClick={() => {
                onDisableDevMode();
              }} className="dev-action-btn disable">
                🔒 Disable Developer Mode
              </button>
              {user?.email === 'miphoma@gmail.com' && (
                <>
                  <button onClick={() => {
                    onClose();
                    setTimeout(() => {
                      window.location.href = '/admin-support';
                    }, 100);
                  }} className="dev-action-btn admin">
                    🎫 Support Tickets
                  </button>
                  <button onClick={() => {
                    onClose();
                    setTimeout(() => {
                      window.location.href = '/admin';
                    }, 100);
                  }} className="dev-action-btn admin">
                    ⚡ Monitoring Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="settings-hub-grid">
          <button className="settings-card" onClick={() => {
            onClose();
            onOpenNotifications();
          }}>
            <div className="settings-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Manage push alerts</p>
          </button>

          <button className="settings-card" onClick={() => {
            onClose();
            onOpenTheme();
          }}>
            <div className="settings-icon">🎨</div>
            <h3>Theme</h3>
            <p>Dark/Light mode</p>
          </button>

          <button className="settings-card" onClick={() => {
            onClose();
            user?.onOpenDataRecovery();
          }}>
            <div className="settings-icon">💾</div>
            <h3>Backup/Restore</h3>
            <p>Save your data</p>
          </button>

          <button className="settings-card" onClick={() => {
            onClose();
            user?.onOpenAppleHealth();
          }}>
            <div className="settings-icon">❤️</div>
            <h3>Apple Health</h3>
            <p>Sync health data</p>
          </button>

          <button className="settings-card" onClick={() => {
            onClose();
            user?.onOpenWearables();
          }}>
            <div className="settings-icon">⌚</div>
            <h3>Wearables</h3>
            <p>Connect devices</p>
          </button>

          <button className="settings-card" onClick={() => {
            onClose();
            user?.onOpenSupport();
          }}>
            <div className="settings-icon">❓</div>
            <h3>Help & Support</h3>
            <p>Get assistance</p>
          </button>

          {showDevButton && !isDevMode && (
            <button className="settings-card premium" onClick={() => {
              onClose();
              onOpenDevUnlock();
            }}>
              <div className="settings-icon">🔒</div>
              <h3>Dev Mode</h3>
              <p>Unlock features</p>
            </button>
          )}

          <button className="settings-card logout-card" onClick={() => {
            onClose();
            onLogout();
          }}>
            <div className="settings-icon">🚪</div>
            <h3>Sign Out</h3>
            <p>Logout from app</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsHubModal;
