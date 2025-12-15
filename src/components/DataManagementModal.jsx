import './DataManagementModal.css'

const DataManagementModal = ({ onClose, onOpenDNA, onExportDailyStats, onExportWorkoutHistory, onExportWorkoutHistoryCSV, onExportFoodLog, onExportFoodLogCSV, onExportFullReport, checkFeatureAccess }) => {
  const subscriptionService = window.subscriptionService;
  
  return (
    <div className="data-management-modal-overlay" onClick={onClose}>
      <div className="data-management-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="data-management-modal-close" onClick={onClose}>×</button>
        
        <div className="data-management-header">
          <h2>📊 Data & Reports</h2>
          <p>Manage your health data & exports</p>
        </div>

        <div className="data-management-grid">
          <button className="data-mgmt-card premium" onClick={() => {
            onClose();
            checkFeatureAccess('dnaAnalysis', onOpenDNA);
          }}>
            <div className="data-icon">🧬</div>
            <h3>DNA Upload</h3>
            <p>23andMe & AncestryDNA</p>
            {!subscriptionService?.hasAccess('dnaAnalysis') && <span className="lock-badge">🔒</span>}
          </button>

          <button className="data-mgmt-card" onClick={() => {
            onClose();
            onExportDailyStats();
          }}>
            <div className="data-icon">📋</div>
            <h3>Daily Summary</h3>
            <p>Export today's stats (PDF)</p>
          </button>

          <button className="data-mgmt-card" onClick={() => {
            onClose();
            onExportWorkoutHistory();
          }}>
            <div className="data-icon">🏋️</div>
            <h3>Workout Data (PDF)</h3>
            <p>Export workouts as PDF</p>
          </button>

          <button className="data-mgmt-card" onClick={() => {
            onClose();
            onExportWorkoutHistoryCSV();
          }}>
            <div className="data-icon">📊</div>
            <h3>Workout Data (CSV)</h3>
            <p>Export for Excel/Sheets</p>
          </button>

          <button className="data-mgmt-card" onClick={() => {
            onClose();
            onExportFoodLog();
          }}>
            <div className="data-icon">🍽️</div>
            <h3>Food Log (PDF)</h3>
            <p>Export 30-day nutrition</p>
          </button>

          <button className="data-mgmt-card" onClick={() => {
            onClose();
            onExportFoodLogCSV();
          }}>
            <div className="data-icon">📊</div>
            <h3>Food Log (CSV)</h3>
            <p>Export for Excel/Sheets</p>
          </button>

          <button className="data-mgmt-card" onClick={() => {
            onClose();
            onExportFullReport();
          }}>
            <div className="data-icon">📊</div>
            <h3>Full Report</h3>
            <p>Complete health report (PDF)</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagementModal;
