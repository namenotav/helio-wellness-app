import './DataManagementModal.css'
import { useState, useEffect } from 'react';
import brainLearningService from '../services/brainLearningService';

const DataManagementModal = ({ onClose, onOpenDNA, onExportDailyStats, onExportWorkoutHistory, onExportWorkoutHistoryCSV, onExportFoodLog, onExportFoodLogCSV, onExportFullReport, checkFeatureAccess }) => {
  const subscriptionService = window.subscriptionService;
  const [backupStatus, setBackupStatus] = useState('');
  const [lastBackup, setLastBackup] = useState(null);
  
  useEffect(() => {
    const loadLastBackup = async () => {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value: prefsTimestamp } = await Preferences.get({ key: 'wellnessai_last_backup_timestamp' });
        const timestamp = prefsTimestamp || localStorage.getItem('last_backup_timestamp');
        if (timestamp) {
          const date = new Date(timestamp);
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);
          
          if (diffDays > 0) {
            setLastBackup(`${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
          } else if (diffHours > 0) {
            setLastBackup(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
          } else if (diffMins > 0) {
            setLastBackup(`${diffMins} minute${diffMins > 1 ? 's' : ''} ago`);
          } else {
            setLastBackup('Just now');
          }
        }
      } catch (e) {
        const timestamp = localStorage.getItem('last_backup_timestamp');
        if (timestamp) {
          setLastBackup('Previously backed up');
        }
      }
    };
    loadLastBackup();
  }, []);

  const handleManualBackup = async () => {
    setBackupStatus('⏳ Backing up...');
    try {
      const success = await brainLearningService.syncToFirebase();
      if (success) {
        const timestamp = new Date().toISOString();
        localStorage.setItem('last_backup_timestamp', timestamp);
        try {
          const { Preferences } = await import('@capacitor/preferences');
          await Preferences.set({ key: 'wellnessai_last_backup_timestamp', value: timestamp });
        } catch (e) { /* localStorage fallback already done */ }
        setBackupStatus('✅ Backup complete!');
        setLastBackup('Just now');
        setTimeout(() => setBackupStatus(''), 3000);
      } else {
        setBackupStatus('⚠️ Login required');
        setTimeout(() => setBackupStatus(''), 3000);
      }
    } catch (error) {
      setBackupStatus('❌ Backup failed');
      setTimeout(() => setBackupStatus(''), 3000);
    }
  };
  
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

          <button className="data-mgmt-card backup-card" onClick={handleManualBackup}>
            <div className="data-icon">☁️</div>
            <h3>Backup to Cloud</h3>
            <p>Sync AI data to Firebase now</p>
            {lastBackup && !backupStatus && <span className="backup-status" style={{color: '#888'}}>Last: {lastBackup}</span>}
            {backupStatus && <span className="backup-status">{backupStatus}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagementModal;
