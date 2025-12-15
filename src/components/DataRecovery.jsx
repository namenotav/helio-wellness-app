// Data Recovery Component - Manual Backup & Restore
import React, { useState, useEffect } from 'react';
import syncService from '../services/syncService';
import './DataRecovery.css';

const DataRecovery = ({ onClose }) => {
  const [lastBackup, setLastBackup] = useState(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadLastBackupTime();
  }, []);

  const loadLastBackupTime = async () => {
    const timestamp = await syncService.getLastBackupTime();
    if (timestamp) {
      setLastBackup(new Date(timestamp).toLocaleString());
    } else {
      setLastBackup('Never');
    }
  };

  const handleBackupNow = async () => {
    try {
      setIsBackingUp(true);
      setStatusMessage('🔄 Backing up all data to cloud...');
      
      const result = await syncService.manualBackupToCloud();
      
      if (result.success) {
        setStatusMessage(`✅ Backup complete! ${result.backedUpCount} items saved to cloud.`);
        await loadLastBackupTime();
      } else {
        setStatusMessage(`❌ Backup failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Backup error: ${error.message}`);
    } finally {
      setIsBackingUp(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handleRestoreNow = async () => {
    const confirmed = window.confirm(
      '⚠️ This will restore ALL data from your last cloud backup. Your current local data will be replaced. Continue?'
    );
    
    if (!confirmed) return;

    try {
      setIsRestoring(true);
      setStatusMessage('🔄 Restoring all data from cloud...');
      
      const result = await syncService.manualRestoreFromCloud();
      
      if (result.success) {
        setStatusMessage(`✅ Restore complete! ${result.restoredCount} items restored from cloud.`);
        setTimeout(() => {
          window.location.reload(); // Reload to apply restored data
        }, 2000);
      } else {
        setStatusMessage(`❌ Restore failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Restore error: ${error.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="data-recovery-overlay">
      <div className="data-recovery-modal">
        <div className="data-recovery-header">
          <h2>💾 Data Backup & Recovery</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="data-recovery-content">
          <div className="backup-status">
            <div className="status-item">
              <span className="status-label">Last Backup:</span>
              <span className="status-value">{lastBackup || 'Loading...'}</span>
            </div>
            <p className="status-info">
              ℹ️ Your data is automatically backed up to the cloud when you're online. 
              Use manual backup for immediate protection.
            </p>
          </div>

          <div className="recovery-actions">
            <button 
              className="backup-btn"
              onClick={handleBackupNow}
              disabled={isBackingUp || isRestoring}
            >
              {isBackingUp ? '⏳ Backing up...' : '☁️ Backup Now'}
            </button>

            <button 
              className="restore-btn"
              onClick={handleRestoreNow}
              disabled={isBackingUp || isRestoring}
            >
              {isRestoring ? '⏳ Restoring...' : '🔄 Restore from Cloud'}
            </button>
          </div>

          {statusMessage && (
            <div className="status-message">
              {statusMessage}
            </div>
          )}

          <div className="data-info">
            <h3>📦 What's Backed Up:</h3>
            <ul>
              <li>✅ Step history & activity data</li>
              <li>✅ Food logs & meal plans</li>
              <li>✅ Workout history & rep counter</li>
              <li>✅ Sleep tracking data</li>
              <li>✅ Heart rate measurements</li>
              <li>✅ Meditation & breathing sessions</li>
              <li>✅ Emergency contacts & medical info</li>
              <li>✅ DNA analysis results</li>
              <li>✅ Profile & preferences</li>
              <li>✅ Health avatar data</li>
            </ul>
          </div>

          <div className="data-security">
            <p>🔒 <strong>Your data is secure:</strong></p>
            <ul>
              <li>Stored in your private Firebase account</li>
              <li>End-to-end encrypted transmission</li>
              <li>Only you can access your data</li>
              <li>Backed up to 3 locations: Device, Preferences, Cloud</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRecovery;
