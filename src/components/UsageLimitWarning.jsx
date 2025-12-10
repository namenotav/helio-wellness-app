import React from 'react';
import './UsageLimitWarning.css';

const UsageLimitWarning = ({ type, used, limit, onUpgrade, onEarnMore }) => {
  const percentage = (used / limit) * 100;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 100;
  
  const getColor = () => {
    if (isCritical) return '#ef4444';
    if (isWarning) return '#f59e0b';
    return '#10b981';
  };

  const getMessage = () => {
    if (isCritical) {
      return `You've used all ${limit} ${type} today`;
    }
    if (isWarning) {
      return `Only ${limit - used} ${type} left today`;
    }
    return `${used}/${limit} ${type} used today`;
  };

  return (
    <div className="usage-limit-warning" style={{
      background: `linear-gradient(135deg, ${getColor()}15, ${getColor()}25)`,
      border: `2px solid ${getColor()}`,
      borderRadius: '16px',
      padding: '20px',
      margin: '20px 0',
      animation: isWarning ? 'pulse 2s infinite' : 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
        <div style={{ fontSize: '24px' }}>
          {isCritical ? '🚫' : isWarning ? '⚠️' : '✅'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: getColor(),
            marginBottom: '8px'
          }}>
            {getMessage()}
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(percentage, 100)}%`,
              height: '100%',
              background: getColor(),
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }} />
          </div>
        </div>
      </div>

      {(isWarning || isCritical) && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onUpgrade}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Upgrade to Essential
          </button>
          <button
            onClick={onEarnMore}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🎁 Earn More Free
          </button>
        </div>
      )}

      {isCritical && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.9)'
        }}>
          💡 <strong>Upgrade to Essential</strong> for just £4.99/mo and get 30 {type}/day + NO ADS!
        </div>
      )}
    </div>
  );
};

export default UsageLimitWarning;
