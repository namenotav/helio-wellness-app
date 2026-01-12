// Developer Mode Unlock Component
import { useState } from 'react';
import './DevUnlock.css';

export default function DevUnlock({ onUnlock, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onUnlock(password);
      
      if (!result.success) {
        setError(result.message);
        setPassword('');
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dev-unlock-overlay">
      <div className="dev-unlock-modal">
        <div className="dev-unlock-header">
          <h2>🔒 Developer Mode</h2>
          <p>Enter password to unlock all features</p>
        </div>

        <form onSubmit={handleSubmit} className="dev-unlock-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter developer password"
            className="dev-unlock-input"
            autoFocus
            disabled={loading}
          />

          {error && (
            <div className="dev-unlock-error">
              {error}
            </div>
          )}

          <div className="dev-unlock-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="dev-unlock-btn dev-unlock-btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dev-unlock-btn dev-unlock-btn-submit"
              disabled={loading || !password}
            >
              {loading ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </form>

        <div className="dev-unlock-footer">
          <small>Authorized device detected</small>
        </div>
      </div>
    </div>
  );
}
