// DNA Status Quick View Modal
import { useState, useEffect } from 'react';
import './DNAModal.css';
import DNAUpload from './DNAUpload';

export default function DNAModal({ isOpen, onClose }) {
  const [showDNAUpload, setShowDNAUpload] = useState(false);
  const [dnaStatus, setDnaStatus] = useState({
    uploaded: false,
    traits: 0,
    recommendations: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadDNAStatus();
    }
  }, [isOpen]);

  const loadDNAStatus = () => {
    try {
      const dnaData = JSON.parse(localStorage.getItem('dnaAnalysis') || 'null');
      
      if (dnaData && dnaData.traits) {
        setDnaStatus({
          uploaded: true,
          traits: Object.keys(dnaData.traits).length,
          recommendations: dnaData.recommendations?.length || 0
        });
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to load DNA status:', error);
    }
  };

  if (!isOpen) return null;

  if (showDNAUpload) {
    return <DNAUpload isOpen={true} onClose={() => { setShowDNAUpload(false); onClose(); }} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dna-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧬 DNA Analysis</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dna-hero">
          <div className="hero-icon">🧬</div>
          <h3>Personalized Health Insights</h3>
          <p>Upload your DNA data for custom recommendations</p>
        </div>

        {dnaStatus.uploaded ? (
          <>
            <div className="dna-status-cards">
              <div className="status-card">
                <span className="card-icon">✅</span>
                <div className="card-content">
                  <span className="card-number">{dnaStatus.traits}</span>
                  <span className="card-label">Traits Analyzed</span>
                </div>
              </div>

              <div className="status-card">
                <span className="card-icon">💡</span>
                <div className="card-content">
                  <span className="card-number">{dnaStatus.recommendations}</span>
                  <span className="card-label">Recommendations</span>
                </div>
              </div>
            </div>

            <button className="primary-action-btn" onClick={() => setShowDNAUpload(true)}>
              📊 View Full Report
            </button>
          </>
        ) : (
          <>
            <div className="dna-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <span className="benefit-text">Personalized nutrition plans</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💪</span>
                <span className="benefit-text">Optimized workout routines</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🧘</span>
                <span className="benefit-text">Stress management insights</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">😴</span>
                <span className="benefit-text">Sleep quality optimization</span>
              </div>
            </div>

            <button className="primary-action-btn" onClick={() => setShowDNAUpload(true)}>
              📤 Upload DNA File
            </button>
          </>
        )}

        <div className="dna-info">
          <p>🔒 Your DNA data is encrypted and never shared</p>
        </div>
      </div>
    </div>
  );
}
