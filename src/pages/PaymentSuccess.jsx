import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import subscriptionService from '../services/subscriptionService';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  
  const verifyPayment = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setStatus('error');
        return;
      }

      // Verify subscription with server (force refresh, don't use cache)
      localStorage.removeItem('subscription_last_verified');
      await subscriptionService.verifySubscriptionWithServer(user.uid);
      
      const currentPlan = subscriptionService.getCurrentPlan();
      
      if (currentPlan.id !== 'free') {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('error');
    }
  }, [navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        {status === 'verifying' && (
          <>
            <div className="spinner"></div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your subscription.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your subscription is now active.</p>
            <p>Redirecting to dashboard...</p>
          </>
        )}
        
        {status === 'pending' && (
          <>
            <div className="pending-icon">⏳</div>
            <h2>Payment Processing</h2>
            <p>Your payment is being processed. This may take a few minutes.</p>
            <button onClick={() => navigate('/dashboard')} className="return-button">
              Return to Dashboard
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Verification Failed</h2>
            <p>We couldn't verify your payment. Please contact support.</p>
            <button onClick={() => navigate('/dashboard')} className="return-button">
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
