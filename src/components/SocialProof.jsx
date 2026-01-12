import React, { useState, useEffect } from 'react';
import './SocialProof.css';

const SocialProof = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const proofItems = [
    { name: 'Sarah M.', location: 'London', action: 'upgraded to Essential', icon: '🇬🇧', time: '2m ago' },
    { name: 'James K.', location: 'Manchester', action: 'upgraded to Premium', icon: '🇬🇧', time: '5m ago' },
    { name: 'Emma L.', location: 'Birmingham', action: 'just signed up', icon: '🇬🇧', time: '7m ago' },
    { name: 'Oliver T.', location: 'Leeds', action: 'upgraded to Premium', icon: '🇬🇧', time: '12m ago' },
    { name: 'Amelia R.', location: 'Glasgow', action: 'referred 3 friends', icon: '🇬🇧', time: '15m ago' },
    { name: 'Sophie B.', location: 'Bristol', action: 'upgraded to Premium', icon: '🇬🇧', time: '18m ago' },
    { name: 'Harry W.', location: 'Liverpool', action: 'just signed up', icon: '🇬🇧', time: '22m ago' },
    { name: 'Isabella P.', location: 'Edinburgh', action: 'upgraded to Essential', icon: '🇬🇧', time: '25m ago' }
  ];

  useEffect(() => {
    // Show notification every 8 seconds
    const interval = setInterval(() => {
      const randomItem = proofItems[Math.floor(Math.random() * proofItems.length)];
      const newNotification = {
        ...randomItem,
        id: Date.now()
      };
      
      setNotifications(prev => [...prev, newNotification]);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="social-proof-container">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="social-proof-toast"
          style={{
            position: 'fixed',
            bottom: `${20 + (index * 90)}px`,
            left: '20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(139, 92, 246, 0.95))',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '16px 20px',
            minWidth: '320px',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'slideInLeft 0.5s ease-out, slideOutLeft 0.5s ease-in 4.5s',
            zIndex: 8000 + index,
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <div style={{
            fontSize: '32px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}>
            {notification.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '4px'
            }}>
              {notification.name} from {notification.location}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.9)'
            }}>
              {notification.action}
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap'
          }}>
            {notification.time}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SocialProof;
