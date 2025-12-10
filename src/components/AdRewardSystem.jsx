import React, { useState } from 'react';
import './AdRewardSystem.css';

const AdRewardSystem = ({ onAdWatched, rewardType = 'AR scan' }) => {
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [adCompleted, setAdCompleted] = useState(false);

  const startAd = () => {
    setIsWatching(true);
    setAdCompleted(false);
    setCountdown(30);

    // Simulate ad playback with countdown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdCompleted(true);
          setTimeout(() => {
            setIsWatching(false);
            setAdCompleted(false);
            onAdWatched();
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (isWatching) {
    return (
      <div className="ad-reward-watching" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        flexDirection: 'column',
        gap: '30px'
      }}>
        {!adCompleted ? (
          <>
            <div style={{
              width: '80%',
              maxWidth: '600px',
              aspectRatio: '16/9',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              border: '3px solid rgba(255,255,255,0.2)'
            }}>
              📺
            </div>
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
                {countdown}
              </div>
              <div style={{ fontSize: '18px', opacity: 0.8 }}>
                Watch ad to earn 1 {rewardType} credit
              </div>
              <div style={{
                marginTop: '20px',
                width: '300px',
                height: '6px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '3px',
                overflow: 'hidden',
                margin: '20px auto 0'
              }}>
                <div style={{
                  width: `${((30 - countdown) / 30) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  transition: 'width 1s linear'
                }} />
              </div>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            color: 'white',
            animation: 'celebration 0.5s ease-out'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
              Reward Earned!
            </div>
            <div style={{ fontSize: '18px', opacity: 0.8 }}>
              +1 {rewardType} credit added to your account
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ad-reward-offer" style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
      border: '2px solid #10b981',
      borderRadius: '16px',
      padding: '20px',
      margin: '20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{ fontSize: '48px' }}>📺</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          fontSize: '20px', 
          marginBottom: '8px', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Watch 30-Second Ad
        </h3>
        <p style={{ 
          fontSize: '14px', 
          opacity: 0.8,
          color: 'rgba(255,255,255,0.9)',
          marginBottom: 0
        }}>
          Earn 1 free {rewardType} credit instantly
        </p>
      </div>
      <button
        onClick={startAd}
        style={{
          padding: '15px 30px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        🎁 Watch & Earn
      </button>
    </div>
  );
};

export default AdRewardSystem;
