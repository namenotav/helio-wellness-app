import React, { useState, useEffect } from 'react';
import './LimitedTimeOffer.css';

const LimitedTimeOffer = ({ onAccept, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen offer before - read from Preferences first
    const checkOfferStatus = async () => {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value: prefsOfferSeen } = await Preferences.get({ key: 'wellnessai_limitedOfferSeen' });
        const { value: prefsVisitCount } = await Preferences.get({ key: 'wellnessai_visitCount' });
        
        const offerSeen = prefsOfferSeen || localStorage.getItem('limitedOfferSeen');
        const visitCount = parseInt(prefsVisitCount || localStorage.getItem('visitCount') || '0');
        
        // Show after 3 visits or when they hit usage limits
        if (!offerSeen && visitCount >= 3) {
          setTimeout(() => setIsVisible(true), 5000); // Show after 5 seconds
        }
      } catch (e) {
        // Fallback to localStorage
        const offerSeen = localStorage.getItem('limitedOfferSeen');
        const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
        if (!offerSeen && visitCount >= 3) {
          setTimeout(() => setIsVisible(true), 5000);
        }
      }
    };
    checkOfferStatus();

    // Countdown timer
    if (isVisible && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isVisible, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    // Write to both storages
    localStorage.setItem('limitedOfferSeen', 'true');
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: 'wellnessai_limitedOfferSeen', value: 'true' });
    } catch (e) { /* localStorage fallback already done */ }
    onAccept();
    setIsVisible(false);
  };

  const handleDecline = async () => {
    // Write to both storages
    localStorage.setItem('limitedOfferSeen', 'true');
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: 'wellnessai_limitedOfferSeen', value: 'true' });
    } catch (e) { /* localStorage fallback already done */ }
    onDecline();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="limited-time-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '550px',
        width: '100%',
        border: '3px solid #f59e0b',
        position: 'relative',
        animation: 'slideUp 0.5s ease-out'
      }}>
        {/* Close button */}
        <button
          onClick={handleDecline}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        {/* Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'inline-block',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '20px'
        }}>
          🔥 LIMITED TIME OFFER
        </div>

        {/* Timer */}
        <div style={{
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <div style={{ fontSize: '18px', opacity: 0.8, marginBottom: '10px', color: 'white' }}>
            Offer expires in
          </div>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#f59e0b',
            fontFamily: 'monospace',
            animation: timeLeft < 60 ? 'pulse 1s infinite' : 'none'
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Offer details */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '2px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '15px', color: 'white', fontWeight: 'bold' }}>
            🎉 Start Your <strong>30-Day FREE Trial</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
            <div style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#10b981'
            }}>
              £0.00
            </div>
          </div>
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#10b981'
          }}>
            Then £6.99/month • Cancel anytime
          </div>
        </div>

        {/* Features */}
        <div style={{
          marginBottom: '25px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: 'white' }}>
            ✨ Everything in Essential:
          </div>
          <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.9)' }}>✅ NO ADS forever</div>
            <div style={{ color: 'rgba(255,255,255,0.9)' }}>✅ 30 AI messages/day</div>
            <div style={{ color: 'rgba(255,255,255,0.9)' }}>✅ 1 AR scan/day</div>
            <div style={{ color: 'rgba(255,255,255,0.9)' }}>✅ Weekly avatar updates</div>
            <div style={{ color: 'rgba(255,255,255,0.9)' }}>✅ Cancel anytime</div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={handleAccept}
            style={{
              padding: '18px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Start 30-Day FREE Trial
          </button>
          <button
            onClick={handleDecline}
            style={{
              padding: '12px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            No thanks, I'll pay full price
          </button>
        </div>

        {/* Trust badge */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '12px',
          opacity: 0.7,
          color: 'rgba(255,255,255,0.8)'
        }}>
          🔒 Cancel anytime • No hidden fees • Money back guarantee*
        </div>
      </div>
    </div>
  );
};

export default LimitedTimeOffer;
