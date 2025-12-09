import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { checkoutMonthly, checkoutYearly } from '../services/stripeService'
import { Capacitor } from '@capacitor/core'
import AuthModal from '../components/AuthModal'
import authService from '../services/authService'
import '../styles/LandingPage.css'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [searchParams] = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const isNative = Capacitor.isNativePlatform()

  // Check for payment success/cancelled
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      alert('🎉 Payment successful! Welcome to Helio! Your subscription is now active.')
    } else if (payment === 'cancelled') {
      alert('Payment was cancelled. You can try again anytime!')
    }
  }, [searchParams])

  // Listen for install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if(import.meta.env.DEV)console.log('Email submitted:', email)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 3000)
  }

  const handleCheckout = async (plan) => {
    setSelectedPlan(plan)
    if (plan === 'monthly') {
      await checkoutMonthly()
    } else if (plan === 'yearly') {
      await checkoutYearly()
    }
  }

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      await authService.initialize();
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        navigate('/dashboard', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install:\n\niPhone: Tap Share → Add to Home Screen\nAndroid: Tap menu → Install app\nPC: Click install icon in address bar')
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
    setDeferredPrompt(null)
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="landing-page">
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Hero Section */}
      <header className="hero">
        <nav className="nav">
          <div className="logo">☀️ Helio</div>
          <div className="nav-buttons">
            {!isNative && (
              <button onClick={handleInstallClick} className="nav-install">
                📱 Install App
              </button>
            )}
            <button onClick={() => setShowAuthModal(true)} className="nav-cta">
              Get Started
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            Rise to Your Best Self<br />
            <span className="gradient-text">With AI That Understands You</span>
          </h1>
          <p className="hero-subtitle">
            Transform your wellness journey with intelligent coaching, effortless tracking,
            and personalized insights that adapt to your lifestyle.
          </p>
          
          <div className="hero-cta">
            {!isNative && (
              <button onClick={handleInstallClick} className="btn-install">
                📱 Install App Now - Free
              </button>
            )}
            <button onClick={() => handleCheckout('yearly')} className="btn-primary">
              Get Started - £99/year
              <span className="price-note">Or £9.99/month</span>
            </button>
            <form onSubmit={handleEmailSubmit} className="email-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="email-input"
              />
              <button type="submit" className="btn-secondary">
                Join Waitlist
              </button>
            </form>
            {submitted && <p className="success-message">✓ You're on the list!</p>}
          </div>

          <div className="social-proof">
            <p>🚀 Launching in 8 weeks • Join 500+ people waiting</p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Everything You Need in One Place</h2>
        <div className="features-grid">
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Personal Coach</h3>
            <p>Get personalized recommendations that adapt to your progress and preferences</p>
            <span className="try-now">Try Now →</span>
          </a>
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Tracking</h3>
            <p>Automatically track workouts, meals, sleep, and habits with minimal effort</p>
            <span className="try-now">Try Now →</span>
          </a>
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Progress Photos</h3>
            <p>Visual tracking with AI-powered body composition analysis</p>
            <span className="try-now">Try Now →</span>
          </a>
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">🍎</div>
            <h3>Nutrition Plans</h3>
            <p>Custom meal plans and recipes tailored to your goals and dietary needs</p>
            <span className="try-now">Try Now →</span>
          </a>
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">💪</div>
            <h3>Workout Programs</h3>
            <p>Personalized exercise routines that evolve with your fitness level</p>
            <span className="try-now">Try Now →</span>
          </a>
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">🧘</div>
            <h3>Mental Wellness</h3>
            <p>Mindfulness, stress management, and mood tracking integrated seamlessly</p>
            <span className="try-now">Try Now →</span>
          </a>
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Analytics Dashboard</h3>
            <p>Visualize your progress with beautiful charts and insights</p>
            <span className="try-now">Try Now →</span>
          </a>
          <a href="/dashboard" className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Smart Reminders</h3>
            <p>Gentle nudges at the right time to keep you on track</p>
            <span className="try-now">Try Now →</span>
          </a>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="why-different">
        <h2>Why WellnessAI is Different</h2>
        <div className="difference-grid">
          <div className="difference-item">
            <h3>✨ AI That Learns YOU</h3>
            <p>Not generic advice. Our AI adapts to your body, lifestyle, and preferences.</p>
          </div>
          <div className="difference-item">
            <h3>🎯 All-in-One Platform</h3>
            <p>Stop juggling 5 different apps. Everything you need in one beautiful interface.</p>
          </div>
          <div className="difference-item">
            <h3>🔬 Science-Based</h3>
            <p>Built on proven behavioral psychology and nutrition science principles.</p>
          </div>
          <div className="difference-item">
            <h3>💎 Lifetime Access</h3>
            <p>Pay once, use forever. No recurring subscriptions or hidden fees.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <h2>Choose Your Plan</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="price">£0</div>
            <ul className="features-list">
              <li>✓ Basic habit tracking</li>
              <li>✓ Workout logger</li>
              <li>✓ Meal diary</li>
              <li>✓ Progress photos</li>
              <li>✗ AI coaching</li>
              <li>✗ Custom plans</li>
            </ul>
            <button className="btn-outline">Join Waitlist</button>
          </div>

          <div className="pricing-card featured">
            <div className="badge">⭐ Best Value</div>
            <h3>Yearly</h3>
            <div className="price">
              £99
              <span className="per-month">/year</span>
            </div>
            <ul className="features-list">
              <li>✓ Everything in Free</li>
              <li>✓ AI Personal Coach</li>
              <li>✓ Voice & Image AI</li>
              <li>✓ Custom meal plans</li>
              <li>✓ Workout programs</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Priority support</li>
              <li>✓ Save £20/year</li>
            </ul>
            <button onClick={() => handleCheckout('yearly')} className="btn-primary" disabled={selectedPlan === 'yearly'}>
              {selectedPlan === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
            </button>
            <p className="limited-note">Best value - 2 months free!</p>
          </div>

          <div className="pricing-card">
            <h3>Monthly</h3>
            <div className="price">£9.99<span className="per-month">/mo</span></div>
            <ul className="features-list">
              <li>✓ Everything in Yearly</li>
              <li>✓ Cancel anytime</li>
              <li>✓ Flexible billing</li>
            </ul>
            <button onClick={() => handleCheckout('monthly')} className="btn-outline" disabled={selectedPlan === 'monthly'}>
              {selectedPlan === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <h2>Start Your Wellness Journey Today</h2>
        <p>Choose the plan that works for you</p>
        <div className="cta-buttons">
          <button onClick={() => handleCheckout('yearly')} className="btn-primary btn-large">
            Subscribe Yearly - £99/year
          </button>
          <form onSubmit={handleEmailSubmit} className="email-form-inline">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-secondary">
              Get Updates
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Helio. Rise to your best self, every single day.</p>
        <p className="disclaimer">
          * This app is for informational purposes only and not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  )
}



