// GDPR/HIPAA Consent Modal
import { useState, useEffect } from 'react';
import './ConsentModal.css';

export default function ConsentModal({ onAccept }) {
  const [showModal, setShowModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedHealth, setAcceptedHealth] = useState(false);

  useEffect(() => {
    // Check if user has given consent
    const hasConsented = localStorage.getItem('user_consent');
    if (!hasConsented) {
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    if (!acceptedTerms || !acceptedPrivacy || !acceptedHealth) {
      alert('Please accept all required consents to continue');
      return;
    }

    const consent = {
      terms: true,
      privacy: true,
      healthData: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    localStorage.setItem('user_consent', JSON.stringify(consent));
    setShowModal(false);
    
    if (onAccept) {
      onAccept(consent);
    }
  };

  const handleDecline = () => {
    alert('You must accept the terms to use WellnessAI. The app will close.');
    // In production, this would close the app or redirect to exit page
    window.location.href = 'about:blank';
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="consent-overlay">
      <div className="consent-modal">
        <h2>Welcome to WellnessAI</h2>
        <p className="consent-intro">
          Before you begin, please review and accept our terms and policies.
        </p>

        <div className="consent-section">
          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span>
              I accept the{' '}
              <a href="/legal/terms.html" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
            </span>
          </label>

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            />
            <span>
              I accept the{' '}
              <a href="/legal/privacy.html" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={acceptedHealth}
              onChange={(e) => setAcceptedHealth(e.target.checked)}
            />
            <span>
              I consent to the collection and processing of my health data as described in the Privacy Policy
            </span>
          </label>
        </div>

        <div className="consent-info">
          <h3>📊 What Data We Collect:</h3>
          <ul>
            <li>Step counts and activity data</li>
            <li>GPS location (for distance tracking)</li>
            <li>Health metrics (heart rate, sleep, etc.)</li>
            <li>Food intake and nutrition data</li>
          </ul>

          <h3>🔒 Your Data Rights:</h3>
          <ul>
            <li>Access your data anytime</li>
            <li>Export your data in JSON format</li>
            <li>Delete your account and all data</li>
            <li>Encrypted storage (AES-256)</li>
          </ul>

          <h3>🛡️ HIPAA Compliance:</h3>
          <p>
            All health data is encrypted at rest and in transit. We comply with HIPAA, GDPR, and CCPA regulations.
          </p>
        </div>

        <div className="consent-buttons">
          <button onClick={handleDecline} className="decline-btn">
            Decline
          </button>
          <button 
            onClick={handleAccept} 
            className="accept-btn"
            disabled={!acceptedTerms || !acceptedPrivacy || !acceptedHealth}
          >
            Accept & Continue
          </button>
        </div>

        <p className="consent-footer">
          By clicking "Accept & Continue", you agree to our terms and confirm you are 18+ years old.
        </p>
      </div>
    </div>
  );
}



