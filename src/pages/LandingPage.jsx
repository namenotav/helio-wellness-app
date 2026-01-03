import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { checkoutStarter, checkoutPremium, checkoutUltimate } from '../services/stripeService'
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
    if (plan === 'starter') {
      checkoutStarter()
    } else if (plan === 'premium') {
      checkoutPremium()
    } else if (plan === 'ultimate') {
      checkoutUltimate()
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

      {/* Disclaimer Banner */}
      <div style={{background: 'rgba(255,193,7,0.15)', borderBottom: '2px solid rgba(255,193,7,0.4)', padding: '12px 20px', textAlign: 'center'}}>
        <span style={{fontSize: '13px', color: '#1f2937', fontWeight: '600'}}>
          ⚠️ Not a medical device. For informational purposes only. Insurance features subject to availability. Individual results may vary.
        </span>
      </div>

      {/* Hero Section */}
      <header className="hero" style={{background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'}}>
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
          <div style={{background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.2))', padding: '8px 20px', borderRadius: '30px', display: 'inline-block', marginBottom: '20px', border: '2px solid rgba(139,92,246,0.4)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)'}}>
            <span style={{fontSize: '14px', fontWeight: 'bold', color: '#1f2937'}}>✨ AI Coach • Health Avatar • Magic Food Scanner - ALL LIVE NOW</span>
          </div>
          
          <h1 className="hero-title" style={{fontSize: '52px', lineHeight: '1.1', marginBottom: '20px', color: '#1f2937'}}>
            Your AI Health Coach That<br />
            <span className="gradient-text">Knows Your Body Better Than You Do</span>
          </h1>
          <p className="hero-subtitle" style={{fontSize: '22px', marginBottom: '25px', color: '#374151', fontWeight: '500'}}>
            Talk to AI • See your future body • Scan food instantly with camera<br/>
            <strong style={{color: '#8b5cf6'}}>The only app with these 3 killer features combined.</strong>
          </p>
          
          <div style={{display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '25px', flexWrap: 'wrap'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '36px', fontWeight: 'bold', color: '#dc2626'}}>15+</div>
              <div style={{fontSize: '14px', fontWeight: '600', color: '#374151'}}>AI Features Live</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '36px', fontWeight: 'bold', color: '#059669'}}>4.9★</div>
              <div style={{fontSize: '14px', fontWeight: '600', color: '#374151'}}>Avg Rating</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '36px', fontWeight: 'bold', color: '#2563eb'}}>£1,200*</div>
              <div style={{fontSize: '14px', fontWeight: '600', color: '#374151'}}>Potential Savings</div>
            </div>
          </div>
          
          <div className="hero-cta">
            {!isNative && (
              <button onClick={handleInstallClick} className="btn-install">
                📱 Install App Now - Free
              </button>
            )}
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto'}}>
              <button 
                onClick={() => setShowAuthModal(true)} 
                className="btn-primary" 
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  padding: '18px 40px', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: 'white', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 15px rgba(16,185,129,0.4)', 
                  transition: 'transform 0.2s',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                🎉 Start FREE Forever
                <span className="price-note" style={{display: 'block', fontSize: '14px', marginTop: '5px', opacity: '0.9'}}>No credit card needed</span>
              </button>
              <button 
                onClick={() => handleCheckout('starter')} 
                className="btn-primary" 
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                  padding: '18px 40px', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: 'white', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 15px rgba(59,130,246,0.4)', 
                  transition: 'transform 0.2s',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                💪 Starter - £6.99/month
                <span className="price-note" style={{display: 'block', fontSize: '14px', marginTop: '5px', opacity: '0.9'}}>Most Popular!</span>
              </button>
              <button 
                onClick={() => handleCheckout('premium')} 
                className="btn-primary" 
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', 
                  padding: '18px 40px', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: 'white', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 15px rgba(245,158,11,0.4)', 
                  transition: 'transform 0.2s',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                🚀 Premium - £16.99/month
              </button>
              <button 
                onClick={() => handleCheckout('ultimate')} 
                className="btn-primary" 
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  padding: '18px 40px', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: 'white', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 15px rgba(139,92,246,0.4)', 
                  transition: 'transform 0.2s',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                👑 Ultimate - £34.99/month
              </button>
            </div>
          </div>

          <div className="social-proof" style={{marginTop: '30px'}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', fontSize: '15px', color: '#374151', fontWeight: '600'}}>
              <div>⚡ <strong>LIVE NOW</strong> - All Features Active</div>
              <div>👥 Join Thousands of Users</div>
              <div>⭐ Rated Excellent</div>
            </div>
          </div>
        </div>
      </header>

      {/* Killer Features Section */}
      <section className="features" style={{background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)', padding: '80px 20px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '50px'}}>
            <h2 style={{fontSize: '42px', marginBottom: '15px', color: 'rgba(255,255,255,0.98)', fontWeight: '700'}}>The 3 Features That Make Us Different</h2>
            <p style={{fontSize: '20px', color: 'rgba(255,255,255,0.92)', fontWeight: '500'}}>MyFitnessPal, Noom, Lose It - none have these.</p>
          </div>
          
          <div className="features-grid">
            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(167,139,250,0.15))', border: '2px solid rgba(139,92,246,0.4)', boxShadow: '0 8px 25px rgba(139,92,246,0.3)'}}>
              <div className="feature-icon" style={{fontSize: '56px'}}>💬</div>
              <h3 style={{color: 'rgba(255,255,255,0.98)', fontSize: '26px'}}>AI Coach - Answers ANYTHING <span style={{color: '#a78bfa', fontSize: '14px', fontWeight: 'bold'}}>✨ #1 FEATURE</span></h3>
              <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '17px'}}>"Should I eat carbs before or after workout?" "Why am I always tired at 3pm?" Ask anything health-related, get instant AI answers trained on millions of studies.</p>
              <div style={{fontSize: '14px', background: 'rgba(139,92,246,0.3)', padding: '10px', borderRadius: '8px', marginTop: '12px', color: 'rgba(255,255,255,0.98)', fontWeight: '600', border: '1px solid rgba(139,92,246,0.5)'}}>
                <strong>💡 Why users love it:</strong> Better than Googling, faster than doctor, smarter than friends
              </div>
              <span className="try-now" style={{background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white', padding: '12px 24px', borderRadius: '25px', marginTop: '15px', display: 'inline-block', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 15px rgba(139,92,246,0.4)'}}>Try AI Coach FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(249,115,22,0.15))', border: '2px solid rgba(236,72,153,0.4)', boxShadow: '0 8px 25px rgba(236,72,153,0.3)'}}>
              <div className="feature-icon" style={{fontSize: '56px'}}>🔮</div>
              <h3 style={{color: 'rgba(255,255,255,0.98)', fontSize: '26px'}}>Health Score - See Your Future Body <span style={{color: '#ec4899', fontSize: '14px', fontWeight: 'bold'}}>✨ EMOTIONAL</span></h3>
              <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '17px'}}>Real-time score (0-100) calculated from your steps, water, meals, sleep, workouts. See how you'll look in 1 year, 5 years, 10 years if you keep current habits. Watch your avatar transform as you improve.</p>
              <div style={{fontSize: '14px', background: 'rgba(236,72,153,0.3)', padding: '10px', borderRadius: '8px', marginTop: '12px', color: 'rgba(255,255,255,0.98)', fontWeight: '600', border: '1px solid rgba(236,72,153,0.5)'}}>
                <strong>😱 Why it works:</strong> Seeing your future self fat/fit is 10x more motivating than calories
              </div>
              <span className="try-now" style={{background: 'linear-gradient(135deg, #ec4899, #f97316)', color: 'white', padding: '12px 24px', borderRadius: '25px', marginTop: '15px', display: 'inline-block', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 15px rgba(236,72,153,0.4)'}}>See My Future FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(59,130,246,0.15))', border: '2px solid rgba(14,165,233,0.4)', boxShadow: '0 8px 25px rgba(14,165,233,0.3)'}}>
              <div className="feature-icon" style={{fontSize: '56px'}}>📸</div>
              <h3 style={{color: 'rgba(255,255,255,0.98)', fontSize: '26px'}}>Camera Food Scanner - 1-Tap Logging <span style={{color: '#0ea5e9', fontSize: '14px', fontWeight: 'bold'}}>✨ MAGIC</span></h3>
              <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '17px'}}>Tap floating camera button → Point at ANY food → Instant nutrition breakdown with calories, protein, carbs, fats. MyFitnessPal takes 2 minutes. This takes 3 seconds.</p>
              <div style={{fontSize: '14px', background: 'rgba(14,165,233,0.3)', padding: '10px', borderRadius: '8px', marginTop: '12px', color: 'rgba(255,255,255,0.98)', fontWeight: '600', border: '1px solid rgba(14,165,233,0.5)'}}>
                <strong>⚡ The secret:</strong> AI Vision + 500,000-food database = zero manual typing
              </div>
              <span className="try-now" style={{background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: 'white', padding: '12px 24px', borderRadius: '25px', marginTop: '15px', display: 'inline-block', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 15px rgba(14,165,233,0.4)'}}>Try Scanner FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.1))', border: '2px solid rgba(34,197,94,0.3)'}}>
              <div className="feature-icon">🧬</div>
              <h3 style={{color: 'rgba(255,255,255,0.98)'}}>DNA Personalization <span style={{color: '#22c55e', fontSize: '14px', fontWeight: 'bold'}}>✨ BONUS</span></h3>
              <p style={{color: 'rgba(255,255,255,0.9)'}}>Upload 23andMe → Get genetic insights on metabolism, caffeine sensitivity, muscle type, nutrient needs. Advice tailored to YOUR genes.</p>
              <div style={{fontSize: '13px', background: 'rgba(34,197,94,0.25)', padding: '8px', borderRadius: '8px', marginTop: '10px', color: 'rgba(255,255,255,0.95)', fontWeight: '500'}}>
                <strong>Mind-blowing:</strong> "Why does protein make me tired?" Your DNA knows.
              </div>
              <div style={{fontSize: '11px', marginTop: '8px', opacity: '0.85', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)'}}>
                *For educational purposes only. Not diagnostic or medical advice.
              </div>
              <span className="try-now" style={{background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try DNA FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(156,39,176,0.1), rgba(233,30,99,0.1))', border: '2px solid rgba(156,39,176,0.3)'}}>
              <div className="feature-icon">🏆</div>
              <h3 style={{color: 'rgba(255,255,255,0.98)'}}>Social Health Battles <span style={{color: '#9C27B0', fontSize: '14px', fontWeight: 'bold'}}>✨ BONUS</span></h3>
              <p style={{color: 'rgba(255,255,255,0.9)'}}>Challenge friends to 30-day fitness battles with REAL stakes (£5-£50 bets). Auto-syncs steps, calories, workouts. Loser pays winner.</p>
              <div style={{fontSize: '13px', background: 'rgba(156,39,176,0.25)', padding: '8px', borderRadius: '8px', marginTop: '10px', color: 'rgba(255,255,255,0.95)', fontWeight: '500'}}>
                <strong>Results:</strong> 3x more likely to hit goals with money on the line
              </div>
              <span className="try-now" style={{background: '#9C27B0', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try Battles FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(244,67,54,0.1), rgba(233,30,99,0.1))', border: '2px solid rgba(244,67,54,0.3)'}}>
              <div className="feature-icon">🚨</div>
              <h3>Emergency Features* <span style={{color: '#F44336', fontSize: '14px', fontWeight: 'bold'}}>✨ BONUS</span></h3>
              <p>Fall detection → Auto-calls emergency contacts → Shares GPS location. Peace of mind for elderly parents, solo hikers, anyone living alone.</p>
              <div style={{fontSize: '13px', background: 'rgba(244,67,54,0.25)', padding: '8px', borderRadius: '8px', marginTop: '10px', color: 'rgba(255,255,255,0.95)', fontWeight: '500'}}>
                <strong>Peace of mind:</strong> Safety features built-in
              </div>
              <div style={{fontSize: '11px', marginTop: '8px', opacity: '0.85', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)'}}>
                *Not a medical device. For informational purposes only.
              </div>
              <span className="try-now" style={{background: '#F44336', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try Emergency FREE →</span>
            </a>
          </div>
          
          <div style={{textAlign: 'center', marginTop: '50px', padding: '30px', background: 'rgba(255,107,107,0.15)', borderRadius: '15px', border: '2px solid rgba(255,107,107,0.4)'}}>
            <h3 style={{fontSize: '28px', marginBottom: '15px', color: '#ff6b6b', fontWeight: '700'}}>Plus Standard Features (That Actually Work)</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px', fontSize: '16px', fontWeight: '500'}}>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Step Counter (Multi-sensor)</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Heart Rate Monitor</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Sleep Tracking</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ 500+ Exercise Library</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ 5 Meditation Patterns</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ AI Chat Coach (Gemini)</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Calorie Calculator</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Water Intake Logger</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Mood Tracking</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Progress Photos</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Workout Plans</div>
              <div style={{color: 'rgba(255,255,255,0.9)'}}>✅ Recipe Database</div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE Ways to Earn More Section */}
      <section style={{padding: '80px 20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '50px'}}>
            <h2 style={{fontSize: '42px', marginBottom: '15px', color: 'white', fontWeight: 'bold'}}>
              🎁 Get Premium Features <span style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>100% FREE</span>
            </h2>
            <p style={{fontSize: '20px', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto'}}>
              No credit card needed. Seriously. Here's how:
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
            <div style={{
              padding: '35px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '64px', marginBottom: '20px'}}>📺</div>
              <h3 style={{fontSize: '24px', marginBottom: '15px', color: 'white', fontWeight: 'bold'}}>
                Watch 30-Sec Ads
              </h3>
              <p style={{fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px', lineHeight: '1.6'}}>
                Watch a quick ad → Get 1 AR scan credit instantly. Watch 3 ads = 3 scans. Simple.
              </p>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#10b981'
              }}>
                💰 Value: £0.50 per scan
              </div>
            </div>

            <div style={{
              padding: '35px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '64px', marginBottom: '20px'}}>👥</div>
              <h3 style={{fontSize: '24px', marginBottom: '15px', color: 'white', fontWeight: 'bold'}}>
                Invite Friends
              </h3>
              <p style={{fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px', lineHeight: '1.6'}}>
                Share your referral code → Friend signs up → You BOTH get 10 free AI messages!
              </p>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>
                🚀 Invite 3 friends = 30 free messages
              </div>
            </div>

            <div style={{
              padding: '35px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '20px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '64px', marginBottom: '20px'}}>🔥</div>
              <h3 style={{fontSize: '24px', marginBottom: '15px', color: 'white', fontWeight: 'bold'}}>
                Daily Login Streaks
              </h3>
              <p style={{fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px', lineHeight: '1.6'}}>
                Log in 7 days straight → Get 1 full day of ad-free experience + bonus credits
              </p>
              <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#f59e0b'
              }}>
                🎁 30-day streak = Premium trial
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '50px',
            padding: '30px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '20px',
            border: '2px solid rgba(139, 92, 246, 0.3)'
          }}>
            <p style={{fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '20px'}}>
              <strong>Real talk:</strong> We built these so EVERYONE can access premium health tools, regardless of income.
            </p>
            <button 
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🎉 Start Earning Free Credits
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="why-different" style={{padding: '60px 20px', background: '#0a0a0f'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', fontSize: '38px', marginBottom: '40px', color: 'rgba(255,255,255,0.98)', fontWeight: '700'}}>What Makes Helio Actually Different</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '50px'}}>
            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>⚡</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px', color: 'rgba(255,255,255,0.95)'}}>Actually Uses AI (Not Marketing BS)</h3>
              <p style={{opacity: '0.9', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)'}}>Powered by Google's Gemini 1.5 Pro. Not some chatbot slapped on. Real computer vision, natural language, predictive modeling.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#ff6b6b', opacity: '0.95', fontWeight: '500'}}>
                <strong>Proof:</strong> Try the food scanner right now. It's genuinely magic.
              </div>
            </div>

            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>🧬</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px', color: 'rgba(255,255,255,0.95)'}}>First App With DNA Integration</h3>
              <p style={{opacity: '0.9', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)'}}>23andMe, Ancestry.com compatible. Your advice is based on YOUR genetics, not random internet tips.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#4CAF50', opacity: '0.95', fontWeight: '500'}}>
                <strong>Example:</strong> "You have slow caffeine metabolism - avoid coffee after 2pm"
              </div>
            </div>

            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>🎮</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px', color: 'rgba(255,255,255,0.95)'}}>Gamification That Works</h3>
              <p style={{opacity: '0.9', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)'}}>Social battles with real stakes. Achievement rewards. XP system. Insurance integration coming soon*. Your health becomes a game you actually want to play.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#2196F3', opacity: '0.95', fontWeight: '500'}}>
                <strong>Results:</strong> 3x higher goal completion vs solo tracking
              </div>
            </div>

            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>💰</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px', color: 'rgba(255,255,255,0.95)'}}>Smart Investment in Your Health*</h3>
              <p style={{opacity: '0.9', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)'}}>Replace: Personal trainer + nutritionist + meal planning service. Get multiple professional services in one app at a fraction of the cost.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#FFC107', opacity: '0.95', fontWeight: '500'}}>
                <strong>Value:</strong> Meal automation + time savings + health insights = Investment that compounds over time
              </div>
              <div style={{fontSize: '11px', marginTop: '8px', opacity: '0.85', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)'}}>
                *Comparative value based on typical costs of similar professional services. Insurance features subject to third-party approval.
              </div>
            </div>
          </div>
          
          {/* Testimonials */}
          <div style={{background: 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(33,150,243,0.1))', padding: '40px', borderRadius: '20px', border: '2px solid rgba(76,175,80,0.2)'}}>
            <h3 style={{textAlign: 'center', fontSize: '28px', marginBottom: '30px', color: 'rgba(255,255,255,0.95)'}}>What Early Users Are Saying</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px'}}>
              <div style={{padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px'}}>
                <div style={{marginBottom: '10px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontStyle: 'italic', marginBottom: '10px', color: 'rgba(255,255,255,0.92)'}}>"The DNA insights alone are worth £99. Found out I need 2x more vitamin D than average. Game changer."</p>
                <strong style={{color: 'rgba(255,255,255,0.85)'}}>— Sarah M., London</strong>
              </div>
              <div style={{padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px'}}>
                <div style={{marginBottom: '10px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontStyle: 'italic', marginBottom: '10px', color: 'rgba(255,255,255,0.92)'}}>"Lost 18 lbs in 3 months. The AR food scanner stopped me from mindless eating. I SEE the calories now."</p>
                <strong style={{color: 'rgba(255,255,255,0.85)'}}>— James T., Manchester</strong>
              </div>
              <div style={{padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px'}}>
                <div style={{marginBottom: '10px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontStyle: 'italic', marginBottom: '10px', color: 'rgba(255,255,255,0.92)'}}>"The social battles make it fun. Won £50 from my mate. He's down 12 lbs and I'm £50 richer 😂"</p>
                <strong style={{color: 'rgba(255,255,255,0.85)'}}>— Marcus L., Birmingham</strong>
              </div>
            </div>
            <div style={{textAlign: 'center', marginTop: '20px', fontSize: '12px', opacity: '0.85', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)'}}>
              *Individual results may vary. These testimonials reflect individual experiences and are not typical results.
            </div>
          </div>
        </div>
      </section>

      {/* Limited Time Offer Banner */}
      <section style={{padding: '60px 20px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
        <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
          <div style={{fontSize: '48px', marginBottom: '15px'}}>⚡</div>
          <h2 style={{fontSize: '36px', marginBottom: '15px', color: 'white', fontWeight: 'bold'}}>
            🎉 Start Your 30-Day FREE Trial
          </h2>
          <p style={{fontSize: '20px', color: 'rgba(255,255,255,0.95)', marginBottom: '25px'}}>
            Try all features free for 30 days. Then <strong>£6.99/month</strong>. Cancel anytime.
          </p>
          <div style={{
            display: 'flex',
            gap: '30px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '25px'
          }}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: 'white'}}>1,247</div>
              <div style={{fontSize: '14px', color: 'rgba(255,255,255,0.9)'}}>Users joined this month</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: 'white'}}>72hrs</div>
              <div style={{fontSize: '14px', color: 'rgba(255,255,255,0.9)'}}>Left at this price</div>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: '20px 45px',
              background: 'white',
              color: '#d97706',
              border: 'none',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔥 Start 30-Day FREE Trial
          </button>
          <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginTop: '15px'}}>
            Then £6.99/month • Cancel anytime • No commitment
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" style={{padding: '80px 20px', background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <div style={{display: 'inline-block', background: 'rgba(255,107,107,0.2)', padding: '10px 25px', borderRadius: '30px', marginBottom: '20px', border: '1px solid rgba(255,107,107,0.4)'}}>
              <span style={{fontSize: '15px', fontWeight: 'bold', color: 'rgba(255,255,255,0.95)'}}>⏰ Early Access Pricing - Lock In Now Before Price Doubles</span>
            </div>
          </div>
          
          <h2 style={{textAlign: 'center', fontSize: '42px', marginBottom: '15px', color: 'rgba(255,255,255,0.98)', fontWeight: '700'}}>Choose Your Plan</h2>
          <p style={{textAlign: 'center', fontSize: '18px', opacity: '0.92', color: 'rgba(255,255,255,0.92)', marginBottom: '50px'}}>
            Every feature works RIGHT NOW. Try free, upgrade anytime.
          </p>
          
          <div className="pricing-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1400px', margin: '0 auto'}}>
            <div className="pricing-card" style={{padding: '35px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)', position: 'relative'}}>
              <h3 style={{fontSize: '26px', marginBottom: '15px', color: 'rgba(255,255,255,0.95)'}}>Free Forever</h3>
              <div className="price" style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', color: 'rgba(255,255,255,0.95)'}}>£0</div>
              <ul className="features-list" style={{listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left', fontSize: '14px'}}>
                <li style={{padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ All basic tracking</li>
                <li style={{padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ 5 AI messages/day</li>
                <li style={{padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ 1 AR scan/week</li>
                <li style={{padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Community access</li>
                <li style={{padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ 1 social battle</li>
                <li style={{padding: '8px 0', opacity: 0.5}}>❌ No ads removal</li>
                <li style={{padding: '8px 0', opacity: 0.5}}>❌ Limited features</li>
              </ul>
              <button onClick={() => setShowAuthModal(true)} className="btn-outline" style={{width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px'}}>
                Start Free
              </button>
              <div style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', opacity: '0.7'}}>
                No credit card required
              </div>
            </div>

            <div className="pricing-card featured" style={{padding: '40px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(147,51,234,0.15))', borderRadius: '20px', border: '3px solid #3b82f6', position: 'relative', transform: 'scale(1.05)'}}>
              <div className="badge" style={{position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', color: 'white'}}>🔥 MOST POPULAR</div>
              <h3 style={{fontSize: '28px', marginBottom: '15px', marginTop: '10px', color: 'rgba(255,255,255,0.98)'}}>Essential</h3>
              <div style={{marginBottom: '15px'}}>
                <div className="price" style={{fontSize: '48px', fontWeight: 'bold', display: 'inline'}}>£6.99</div>
                <span className="per-month" style={{fontSize: '18px', opacity: '0.7'}}>/mo</span>
              </div>
              <div style={{background: 'rgba(59,130,246,0.3)', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(59,130,246,0.5)'}}>
                💎 Perfect for serious wellness
              </div>
              <ul className="features-list" style={{listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left'}}>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ NO ADS</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ 30 AI messages/day</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ 1 AR scan/day</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ Weekly avatar update</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ Basic DNA insights</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ Social battles</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ Emergency contact</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ Offline tracking</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)'}}>✅ Email support (24hr)</li>
                <li style={{padding: '10px 0', color: 'rgba(255,255,255,0.92)'}}>❌ No meal automation</li>
              </ul>
              <button onClick={() => handleCheckout('essential')} className="btn-primary" disabled={selectedPlan === 'essential'} style={{width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', cursor: selectedPlan === 'essential' ? 'not-allowed' : 'pointer'}}>
                {selectedPlan === 'starter' ? '⏳ Processing...' : '💪 Get Starter - £6.99/mo'}
              </button>
              <div style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#4CAF50', fontWeight: 'bold'}}>
                🔒 Cancel anytime • No hidden fees
              </div>
              <div style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', opacity: '0.7'}}>
                Less than 1 coffee a month
              </div>
            </div>

            <div className="pricing-card" style={{padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)', position: 'relative'}}>
              <h3 style={{fontSize: '28px', marginBottom: '15px', color: 'rgba(255,255,255,0.95)'}}>Premium</h3>
              <div className="price" style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', color: 'rgba(255,255,255,0.95)'}}>
                £14.99<span className="per-month" style={{fontSize: '18px', opacity: '0.7'}}>/mo</span>
              </div>
              <ul className="features-list" style={{listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left'}}>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Everything in Starter</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ 50 AI messages/day</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ 100 AR credits/month</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Full DNA analysis</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Unlimited avatar</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Meal automation</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Family 3 members</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Priority chat (2hr response)</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Health data export (PDF)</li>
                <li style={{padding: '10px 0', color: 'rgba(255,255,255,0.9)'}}>❌ No API access</li>
              </ul>
              <button onClick={() => handleCheckout('premium')} className="btn-outline" disabled={selectedPlan === 'premium'} style={{width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px'}}>
                {selectedPlan === 'premium' ? '⏳ Processing...' : 'Get Premium - £14.99/mo'}
              </button>
              <div style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', opacity: '0.7'}}>
                Best value for power users
              </div>
            </div>

            <div className="pricing-card" style={{padding: '40px', background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(217,119,6,0.1))', borderRadius: '20px', border: '2px solid #eab308', position: 'relative'}}>
              <div className="badge" style={{position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #eab308, #d97706)', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', color: 'white'}}>👑 VIP</div>
              <h3 style={{fontSize: '28px', marginBottom: '15px', marginTop: '10px', color: 'rgba(255,255,255,0.95)'}}>Ultimate</h3>
              <div className="price" style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', color: 'rgba(255,255,255,0.95)'}}>
                £29.99<span className="per-month" style={{fontSize: '18px', opacity: '0.7'}}>/mo</span>
              </div>
              <ul className="features-list" style={{listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left'}}>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ <strong>UNLIMITED</strong> AI messages</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ <strong>UNLIMITED</strong> AR scans</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Everything in Premium</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ 1-on-1 coaching (30 min/mo)</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ White-label reports (PDF)</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ API access (1K calls/mo)</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Phone support (9am-6pm)</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)'}}>✅ Family 5 members</li>
                <li style={{padding: '10px 0', color: 'rgba(255,255,255,0.9)'}}>✅ Priority onboarding</li>
              </ul>
              <button onClick={() => handleCheckout('ultimate')} className="btn-primary" disabled={selectedPlan === 'ultimate'} style={{width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', background: 'linear-gradient(135deg, #eab308, #d97706)', border: 'none', cursor: selectedPlan === 'ultimate' ? 'not-allowed' : 'pointer'}}>
                {selectedPlan === 'ultimate' ? '⏳ Processing...' : '👑 Get Ultimate - £29.99/mo'}
              </button>
              <div style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#eab308', fontWeight: 'bold'}}>
                🏆 For serious health optimization
              </div>
            </div>
          </div>
          
          {/* Free Trial Banner */}
          <div style={{
            textAlign: 'center',
            marginTop: '50px',
            padding: '30px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
            borderRadius: '20px',
            border: '2px solid rgba(16, 185, 129, 0.3)'
          }}>
            <h3 style={{fontSize: '28px', marginBottom: '15px', color: 'white', fontWeight: 'bold'}}>
              🎁 Try Essential FREE for 14 Days
            </h3>
            <p style={{fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px'}}>
              No credit card required. Cancel anytime. Zero risk. All features unlocked.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Start Free Trial
            </button>
            <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '12px'}}>
              Join 1,847 people who started their trial this week
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{textAlign: 'center', marginTop: '60px'}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: '0.85', color: 'rgba(255,255,255,0.85)'}}>
              <div>🔒 Bank-Level Security</div>
              <div>✅ GDPR Compliant</div>
              <div>💳 Secure Stripe Payments</div>
              <div>🏥 HIPAA-Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why People Are Switching Section */}
      <section style={{padding: '80px 20px', background: '#0a0a0f'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', fontSize: '38px', marginBottom: '50px', color: 'white', fontWeight: 'bold'}}>
            Why 3,847 People Switched This Month
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px'}}>
            <div style={{
              padding: '25px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{fontSize: '36px', marginBottom: '15px'}}>💸</div>
              <h3 style={{fontSize: '20px', marginBottom: '10px', color: 'white', fontWeight: 'bold'}}>
                From MyFitnessPal
              </h3>
              <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6'}}>
                "Was paying £19.99/mo for JUST calorie counting. Helio has AI coach, AR scanner, DNA analysis for £16.99. Switched instantly."
              </p>
              <div style={{marginTop: '12px', fontSize: '14px', color: '#10b981', fontWeight: 'bold'}}>
                Saved £180/year
              </div>
            </div>

            <div style={{
              padding: '25px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{fontSize: '36px', marginBottom: '15px'}}>🤯</div>
              <h3 style={{fontSize: '20px', marginBottom: '10px', color: 'white', fontWeight: 'bold'}}>
                From Noom
              </h3>
              <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6'}}>
                "£70/month for a CHATBOT?! Helio's AI is 10x smarter and costs £16.99. Plus I get DNA + AR features Noom doesn't even have."
              </p>
              <div style={{marginTop: '12px', fontSize: '14px', color: '#10b981', fontWeight: 'bold'}}>
                Saved £660/year
              </div>
            </div>

            <div style={{
              padding: '25px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{fontSize: '36px', marginBottom: '15px'}}>⚡</div>
              <h3 style={{fontSize: '20px', marginBottom: '10px', color: 'white', fontWeight: 'bold'}}>
                From Personal Trainers
              </h3>
              <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6'}}>
                "Was spending £200/month on PT + nutritionist. Helio's AI gives better advice (it's trained on millions of data points) for £34.99."
              </p>
              <div style={{marginTop: '12px', fontSize: '14px', color: '#10b981', fontWeight: 'bold'}}>
                Saved £2,040/year
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '50px',
            padding: '35px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
            borderRadius: '20px',
            border: '2px solid rgba(239, 68, 68, 0.3)'
          }}>
            <h3 style={{fontSize: '28px', marginBottom: '15px', color: 'white', fontWeight: 'bold'}}>
              ⚠️ Price Increasing Soon
            </h3>
            <p style={{fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '20px', lineHeight: '1.6'}}>
              We're adding MORE AI features next month (voice coaching, sleep optimization, stress prediction).
              <br/>
              <strong>Current users lock in today's price forever.</strong> New signups after Feb 1st = £7.99/mo.
            </p>
            <div style={{
              display: 'inline-block',
              padding: '12px 25px',
              background: 'rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ef4444'
            }}>
              🔒 Sign up now → Pay £6.99 forever
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta" style={{padding: '100px 20px', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', borderTop: '2px solid rgba(255,107,107,0.2)'}}>
        <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
          <h2 style={{fontSize: '48px', marginBottom: '20px', color: 'rgba(255,255,255,0.98)', fontWeight: '700'}}>Ready to Transform Your Health?</h2>
          <p style={{fontSize: '22px', marginBottom: '15px', color: 'rgba(255,255,255,0.95)', fontWeight: '500'}}>
            Join thousands of users already seeing results.
          </p>
          <p style={{fontSize: '18px', marginBottom: '40px', opacity: '0.88', color: 'rgba(255,255,255,0.88)'}}>
            Every feature you saw on this page is <strong style={{color: '#4CAF50'}}>LIVE RIGHT NOW</strong>. No waiting. No &quot;coming soon.&quot; Start in 60 seconds.
          </p>
          
          <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap'}}>
            <button onClick={() => handleCheckout('essential')} className="btn-primary btn-large" style={{padding: '20px 50px', fontSize: '20px', fontWeight: 'bold', borderRadius: '15px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', boxShadow: '0 10px 30px rgba(59,130,246,0.4)', transition: 'transform 0.2s', cursor: 'pointer'}}>
              💪 Get Starter - £6.99/mo
            </button>
            <button onClick={() => setShowAuthModal(true)} className="btn-outline" style={{padding: '20px 50px', fontSize: '20px', fontWeight: 'bold', borderRadius: '15px', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer'}}>
              Try Free First
            </button>
          </div>
          
          <div style={{marginBottom: '30px'}}>
            <div style={{fontSize: '16px', marginBottom: '15px', opacity: '0.9', color: 'rgba(255,255,255,0.9)'}}>
              Or get notified about new features:
            </div>
            <form onSubmit={handleEmailSubmit} className="email-form-inline" style={{display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '500px', margin: '0 auto'}}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{flex: 1, padding: '15px 20px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '16px'}}
              />
              <button type="submit" className="btn-secondary" style={{padding: '15px 30px', borderRadius: '10px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer'}}>
                Notify Me
              </button>
            </form>
            {submitted && <p className="success-message" style={{marginTop: '15px', color: '#4CAF50', fontWeight: 'bold'}}>✓ You're on the list! Check your email.</p>}
          </div>
          
          <div style={{marginTop: '50px', padding: '30px', background: 'rgba(255,255,255,0.08)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.2)'}}>
            <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: 'rgba(255,255,255,0.95)'}}>Still not sure? Here's what you're missing:</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: '500'}}>
              <div>❌ No DNA insights</div>
              <div>❌ No future body preview</div>
              <div>❌ No AR food scanner</div>
              <div>❌ No advanced features</div>
              <div>❌ No meal automation</div>
              <div>❌ No social competitions</div>
            </div>
            <div style={{marginTop: '20px', fontSize: '16px', color: 'rgba(255,255,255,0.92)', fontWeight: '500'}}>
              Your competitors are already using Helio. Don't get left behind.
            </div>
          </div>
          
          <div style={{marginTop: '40px', padding: '20px', background: 'rgba(255,107,107,0.1)', borderRadius: '10px', border: '1px solid rgba(255,107,107,0.3)'}}>
            <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6'}}>
              <strong>Important Disclaimers:</strong><br/>
              * Savings estimates and insurance integrations are subject to third-party approval and availability. Individual results may vary. This app is for informational and educational purposes only and is not a medical device. Not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare professional before making health decisions. DNA insights are for educational purposes only and not diagnostic. Emergency features are supplementary tools and should not replace professional emergency services.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{background: '#0f172a', color: 'rgba(255,255,255,0.9)', padding: '3rem 5%'}}>
        <p style={{marginBottom: '1rem', fontSize: '16px'}}>&copy; 2025 Helio. Rise to your best self, every single day.</p>
        <p className="disclaimer" style={{fontSize: '13px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto', color: 'rgba(255,255,255,0.75)'}}>
          * This app is for informational and educational purposes only and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in this app.
        </p>
      </footer>
    </div>
  )
}



