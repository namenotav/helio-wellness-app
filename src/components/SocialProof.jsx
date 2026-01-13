import React, { useState, useEffect } from 'react';
import './SocialProof.css';
import firestoreService from '../services/firestoreService';

const SocialProof = () => {
  const [notifications, setNotifications] = useState([]);
  const [realActivity, setRealActivity] = useState([]);

  // 🔥 FIX: Fetch REAL community activity from Firebase instead of fake data
  useEffect(() => {
    loadRealCommunityActivity();
  }, []);

  const loadRealCommunityActivity = async () => {
    try {
      // Fetch real anonymized community stats from Firebase
      const communityStats = await firestoreService.getCommunityStats();
      if (communityStats && communityStats.recentActivity) {
        setRealActivity(communityStats.recentActivity);
        if(import.meta.env.DEV)console.log('📊 Loaded real community activity:', communityStats.recentActivity.length);
      }
    } catch (error) {
      // If no real data, don't show fake notifications
      if(import.meta.env.DEV)console.log('ℹ️ No community stats available - social proof disabled');
      setRealActivity([]);
    }
  };

  useEffect(() => {
    // 🔥 FIX: Only show notifications if we have REAL activity data
    if (realActivity.length === 0) return;
    
    // Show notification every 12 seconds (less aggressive than fake FOMO)
    const interval = setInterval(() => {
      const randomItem = realActivity[Math.floor(Math.random() * realActivity.length)];
      if (!randomItem) return;
      
      const newNotification = {
        name: randomItem.anonymizedName || 'A member', // Anonymized for privacy
        location: randomItem.region || 'UK',
        action: randomItem.action || 'achieved a goal',
        icon: randomItem.icon || '🎯',
        time: randomItem.timeAgo || 'recently',
        id: Date.now(),
        isReal: true // 🔥 Flag indicating this is real data
      };
      
      setNotifications(prev => [...prev, newNotification]);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }, 12000);

    return () => clearInterval(interval);
  }, [realActivity]);

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
