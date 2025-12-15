import './SocialFeaturesModal.css'

const SocialFeaturesModal = ({ onClose, onOpenBattles, onOpenMeals, checkFeatureAccess }) => {
  const subscriptionService = window.subscriptionService;
  
  return (
    <div className="social-features-modal-overlay" onClick={onClose}>
      <div className="social-features-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="social-features-modal-close" onClick={onClose}>×</button>
        
        <div className="social-features-header">
          <h2>🎮 Social & Automation</h2>
          <p>Connect, compete & automate</p>
        </div>

        <div className="social-features-grid">
          <button className="social-feature-card premium" onClick={() => {
            onClose();
            checkFeatureAccess('socialBattles', onOpenBattles);
          }}>
            <div className="social-icon">⚔️</div>
            <h3>Social Battles</h3>
            <p>Challenge your friends</p>
            {!subscriptionService?.hasAccess('socialBattles') && <span className="lock-badge">🔒</span>}
          </button>

          <button className="social-feature-card premium" onClick={() => {
            onClose();
            checkFeatureAccess('mealAutomation', onOpenMeals);
          }}>
            <div className="social-icon">🍽️</div>
            <h3>Meal Automation</h3>
            <p>Auto-log your meals</p>
            {!subscriptionService?.hasAccess('mealAutomation') && <span className="lock-badge">🔒</span>}
          </button>
        </div>

        <div className="social-features-info">
          <p>✨ Upgrade to unlock social battles & meal automation</p>
        </div>
      </div>
    </div>
  );
};

export default SocialFeaturesModal;
