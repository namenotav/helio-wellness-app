import React, { useState, useEffect } from 'react';
import './ReferralSystem.css';

const ReferralSystem = ({ userId, userName }) => {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [rewardsClaimed, setRewardsClaimed] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate unique referral code
    const code = `HELIO${userId?.slice(0, 6)?.toUpperCase() || 'DEMO'}`;
    setReferralCode(code);
    
    // Load referral stats - Preferences first, localStorage fallback
    const loadStats = async () => {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value: prefsValue } = await Preferences.get({ key: `wellnessai_referral_${userId}` });
        const stats = JSON.parse(prefsValue || localStorage.getItem(`referral_${userId}`) || '{"count": 0, "rewards": 0}');
        setReferralCount(stats.count);
        setRewardsClaimed(stats.rewards);
      } catch (e) {
        const stats = JSON.parse(localStorage.getItem(`referral_${userId}`) || '{"count": 0, "rewards": 0}');
        setReferralCount(stats.count);
        setRewardsClaimed(stats.rewards);
      }
    };
    loadStats();
  }, [userId]);

  const copyReferralLink = () => {
    const link = `https://helio-wellness.com?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const link = `https://helio-wellness.com?ref=${referralCode}`;
    const text = `Join me on Helio - AI-powered wellness app! Use my code ${referralCode} and we both get 10 free AI messages! 🎁`;
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      email: `mailto:?subject=Join Helio Wellness!&body=${encodeURIComponent(text + '\n\n' + link)}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="referral-system" style={{
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
      border: '2px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '20px',
      padding: '30px',
      maxWidth: '600px',
      margin: '20px auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎁</div>
        <h2 style={{ fontSize: '28px', marginBottom: '10px', color: 'white' }}>
          Invite Friends, Earn Rewards
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.8, color: 'rgba(255,255,255,0.9)' }}>
          You both get 10 free AI messages when they sign up!
        </p>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px', 
        marginBottom: '25px' 
      }}>
        <div style={{
          background: 'rgba(59, 130, 246, 0.2)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
            {referralCount}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, color: 'white' }}>
            Friends Joined
          </div>
        </div>
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {rewardsClaimed * 10}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, color: 'white' }}>
            Free Messages Earned
          </div>
        </div>
      </div>

      {/* Referral Code */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          marginBottom: '8px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 'bold'
        }}>
          Your Referral Code
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={referralCode}
            readOnly
            style={{
              flex: 1,
              padding: '15px',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
              letterSpacing: '2px'
            }}
          />
          <button
            onClick={copyReferralLink}
            style={{
              padding: '15px 25px',
              background: copied ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minWidth: '100px'
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          marginBottom: '12px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 'bold'
        }}>
          Share via
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '10px' 
        }}>
          <button
            onClick={() => shareVia('whatsapp')}
            style={{
              padding: '12px',
              background: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            📱
          </button>
          <button
            onClick={() => shareVia('facebook')}
            style={{
              padding: '12px',
              background: '#1877F2',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            📘
          </button>
          <button
            onClick={() => shareVia('twitter')}
            style={{
              padding: '12px',
              background: '#1DA1F2',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            🐦
          </button>
          <button
            onClick={() => shareVia('email')}
            style={{
              padding: '12px',
              background: '#EA4335',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ✉️
          </button>
        </div>
      </div>

      {/* Rewards Info */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.2)',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center'
      }}>
        💡 <strong>How it works:</strong> Share your code → Friend signs up → You BOTH get 10 free AI messages instantly!
      </div>
    </div>
  );
};

export default ReferralSystem;
