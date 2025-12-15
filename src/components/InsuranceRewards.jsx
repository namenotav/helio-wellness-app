// Insurance Rewards Component - Premium Discounts
import { useState, useEffect } from 'react';
import './InsuranceRewards.css';
import insuranceService from '../services/insuranceService';

export default function InsuranceRewards({ onClose }) {
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [discountData, setDiscountData] = useState(null);
  const [applying, setApplying] = useState(false);

  const partners = [
    { id: 'bupa', name: 'Bupa Health Insurance', maxDiscount: 40, color: '#44FF44', logo: '🏥' },
    { id: 'vitality', name: 'Vitality Health', maxDiscount: 35, color: '#00FFFF', logo: '💚' },
    { id: 'axa', name: 'AXA Health', maxDiscount: 30, color: '#FF00FF', logo: '🛡️' },
    { id: 'aviva', name: 'Aviva Health', maxDiscount: 25, color: '#FFD700', logo: '⭐' }
  ];

  useEffect(() => {
    if (selectedPartner) {
      calculateDiscount(selectedPartner);
    }
  }, [selectedPartner]);

  const calculateDiscount = async (partnerId) => {
    const data = await insuranceService.calculateDiscount(partnerId);
    setDiscountData(data);
  };

  const handleApply = async () => {
    if (!selectedPartner) return;
    
    setApplying(true);
    try {
      const result = await insuranceService.applyForDiscount(selectedPartner);
      alert(`✅ Application Submitted!\n\nApplication ID: ${result.applicationId}\n\nEstimated Savings:\n$${result.estimatedSavings.monthly}/month\n$${result.estimatedSavings.yearly}/year\n\nYou'll receive an email with next steps within 2-3 business days.`);
    } catch (error) {
      alert('Failed to apply: ' + error.message);
    }
    setApplying(false);
  };

  return (
    <div className="insurance-overlay">
      <div className="insurance-modal">
        <button className="insurance-close" onClick={onClose}>✕</button>

        <div style={{background: 'rgba(255, 193, 7, 0.15)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255, 193, 7, 0.3)'}}>
          <div style={{fontSize: '13px', color: 'rgba(255, 193, 7, 0.95)', fontWeight: '600', marginBottom: '4px'}}>⚠️ Demo Feature - Coming Soon</div>
          <div style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4'}}>Insurance partnerships pending approval. Calculations shown are estimates for demonstration purposes only.</div>
        </div>

        <h2 className="insurance-title">💰 Insurance Rewards (Preview)</h2>
        <p className="insurance-subtitle">Potential discounts up to 40% with partner approval</p>

        {/* Partner Selection */}
        <div className="partner-grid">
          {partners.map(partner => (
            <div
              key={partner.id}
              className={`partner-card ${selectedPartner === partner.id ? 'selected' : ''}`}
              onClick={() => setSelectedPartner(partner.id)}
              style={{ borderColor: selectedPartner === partner.id ? partner.color : 'transparent' }}
            >
              <div className="partner-name">{partner.name}</div>
              <div className="partner-discount">Up to {partner.maxDiscount}% OFF</div>
            </div>
          ))}
        </div>

        {/* Discount Calculation */}
        {discountData && (
          <div className="discount-results">
            <div className={`eligibility-status ${discountData.eligible ? 'eligible' : 'not-eligible'}`}>
              <span className="status-icon">
                {discountData.eligible ? '✓' : '✗'}
              </span>
              <span className="status-text">
                {discountData.eligible ? 'You Qualify!' : 'Not Eligible Yet'}
              </span>
            </div>

            {discountData.eligible ? (
              <>
                <div className="savings-display">
                  <div className="savings-main">
                    <span className="savings-percent">{discountData.discountPercent}%</span>
                    <span className="savings-label">Discount</span>
                  </div>
                  <div className="savings-breakdown">
                    <div className="savings-item">
                      <span className="savings-amount">${discountData.monthlySavings}</span>
                      <span className="savings-period">per month</span>
                    </div>
                    <div className="savings-item">
                      <span className="savings-amount">${discountData.yearlySavings}</span>
                      <span className="savings-period">per year</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="apply-button"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? '⏳ Applying...' : '✓ Apply for Discount'}
                </button>
              </>
            ) : (
              <div className="requirements-list">
                <h3>Requirements to Qualify:</h3>
                {Object.entries(discountData.requirements).map(([key, req]) => (
                  <div key={key} className={`requirement-item ${req.met ? 'met' : 'not-met'}`}>
                    <span className="req-icon">{req.met ? '✓' : '✗'}</span>
                    <div className="req-info">
                      <div className="req-name">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="req-progress">
                        {req.current} / {req.required} {key.includes('Score') ? 'points' : 'steps'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="how-it-works">
          <h3>💡 How It Works</h3>
          <div className="steps-grid">
            <div className="step-item">
              <span className="step-number">1</span>
              <p>We track your health metrics securely</p>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <p>Insurance partners verify your data</p>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <p>Get instant premium discounts</p>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <p>Save $2,400-$4,800 per year</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="trust-section">
          <div className="trust-badge">
            <span className="trust-icon">🔒</span>
            <span className="trust-text">HIPAA Compliant</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">✓</span>
            <span className="trust-text">Verified Partners</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">🛡️</span>
            <span className="trust-text">Data Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}



