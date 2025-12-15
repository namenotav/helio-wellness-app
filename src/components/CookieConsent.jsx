import { useState, useEffect } from 'react';
import './CookieConsent.css';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after 2 seconds
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-content">
          <div className="cookie-icon">🍪</div>
          <div className="cookie-text">
            <h3>We Value Your Privacy</h3>
            <p>
              We use essential cookies for app functionality and anonymous analytics to improve your experience. 
              We do NOT use advertising or tracking cookies. <a href="/legal/privacy.html" target="_blank" rel="noopener noreferrer" style={{color: '#00FFFF', textDecoration: 'underline'}}>Learn more</a>
            </p>
          </div>
        </div>
        <div className="cookie-buttons">
          <button className="cookie-btn decline" onClick={handleDecline}>
            Essential Only
          </button>
          <button className="cookie-btn accept" onClick={handleAccept}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
