import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentCanceled.css';

function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <div className="payment-canceled-container">
      <div className="payment-canceled-card">
        <div className="canceled-icon">✗</div>
        <h2>Payment Canceled</h2>
        <p>Your payment was canceled. No charges were made.</p>
        <p>You can try again anytime you're ready.</p>
        <div className="action-buttons">
          <button onClick={() => navigate('/dashboard')} className="secondary-button">
            Return to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} className="primary-button">
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCanceled;
