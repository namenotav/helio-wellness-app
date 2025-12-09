// Authentication Modal - Sign Up & Sign In
import { useState } from 'react';
import authService from '../services/authService';
import SocialLogin from './SocialLogin';
import './AuthModal.css';

export default function AuthModal({ onClose, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const result = await authService.signUp(
          formData.email,
          formData.password,
          formData.name
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        onSuccess(result.user);
      } else {
        // Sign In
        const result = await authService.signIn(
          formData.email,
          formData.password
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        onSuccess(result.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        
        <div className="auth-modal-content">
          <div className="auth-header">
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Start your wellness journey' : 'Sign in to continue'}</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength="6"
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength="6"
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Please wait...' : (isSignUp ? '🚀 Create Account' : '🔐 Sign In')}
            </button>
          </form>

          {/* Social Login Integration */}
          <SocialLogin 
            onSuccess={onSuccess}
            onError={(err) => setError(err)}
          />

          <div className="auth-toggle">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button onClick={toggleMode} className="auth-toggle-btn">
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button onClick={toggleMode} className="auth-toggle-btn">
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



