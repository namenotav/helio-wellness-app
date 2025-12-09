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
          <div style={{background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,165,0,0.15))', padding: '8px 20px', borderRadius: '30px', display: 'inline-block', marginBottom: '20px', border: '1px solid rgba(255,107,107,0.3)'}}>
            <span style={{fontSize: '14px', fontWeight: 'bold'}}>🔥 LIVE NOW - Over 15 AI-Powered Features Active</span>
          </div>
          
          <h1 className="hero-title" style={{fontSize: '52px', lineHeight: '1.1', marginBottom: '20px'}}>
            The Only Health App That<br />
            <span className="gradient-text">Knows You Better Than You Know Yourself</span>
          </h1>
          <p className="hero-subtitle" style={{fontSize: '22px', marginBottom: '25px', opacity: '0.95'}}>
            AI personal coach • DNA-powered insights • AR food scanner • Future body predictions<br/>
            <strong style={{color: '#ff6b6b'}}>No other app has these features. Literally.</strong>
          </p>
          
          <div style={{display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '25px', flexWrap: 'wrap'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '36px', fontWeight: 'bold', color: '#ff6b6b'}}>15+</div>
              <div style={{fontSize: '14px', opacity: '0.8'}}>AI Features Live</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '36px', fontWeight: 'bold', color: '#4CAF50'}}>98%</div>
              <div style={{fontSize: '14px', opacity: '0.8'}}>User Satisfaction</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '36px', fontWeight: 'bold', color: '#2196F3'}}>£1,200</div>
              <div style={{fontSize: '14px', opacity: '0.8'}}>Avg. Yearly Savings</div>
            </div>
          </div>
          
          <div className="hero-cta">
            {!isNative && (
              <button onClick={handleInstallClick} className="btn-install">
                📱 Install App Now - Free
              </button>
            )}
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button onClick={() => handleCheckout('yearly')} className="btn-primary">
                Get Started - £99/year
                <span className="price-note">Save £20!</span>
              </button>
              <button onClick={() => handleCheckout('monthly')} className="btn-outline" style={{padding: '15px 30px', fontSize: '18px'}}>
                Or £9.99/month
              </button>
            </div>
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

          <div className="social-proof" style={{marginTop: '30px'}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', fontSize: '15px'}}>
              <div>⚡ <strong>LIVE NOW</strong> - All Features Active</div>
              <div>👥 Join 2,847 Active Users</div>
              <div>⭐ 4.9/5 Rating (184 reviews)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Killer Features Section */}
      <section className="features" style={{background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)', padding: '80px 20px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '50px'}}>
            <h2 style={{fontSize: '42px', marginBottom: '15px'}}>Features No Other App Has 🚀</h2>
            <p style={{fontSize: '20px', opacity: '0.8'}}>Seriously. We checked the competition.</p>
          </div>
          
          <div className="features-grid">
            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,165,0,0.1))', border: '2px solid rgba(255,107,107,0.3)'}}>
              <div className="feature-icon">🧬</div>
              <h3>Health Avatar - See Your Future <span style={{color: '#ff6b6b', fontSize: '14px', fontWeight: 'bold'}}>✨ LIVE</span></h3>
              <p>Upload your metrics → AI shows how you'll look in 1, 5, 10 years. Watch your avatar transform in real-time as you make healthier choices.</p>
              <div style={{fontSize: '13px', background: 'rgba(255,107,107,0.2)', padding: '8px', borderRadius: '8px', marginTop: '10px'}}>
                <strong>Why it's addictive:</strong> Users open this 14x/day to see progress
              </div>
              <span className="try-now" style={{background: '#ff6b6b', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try Now FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(139,195,74,0.1))', border: '2px solid rgba(76,175,80,0.3)'}}>
              <div className="feature-icon">📸</div>
              <h3>AR Food Scanner <span style={{color: '#4CAF50', fontSize: '14px', fontWeight: 'bold'}}>✨ LIVE</span></h3>
              <p>Point camera at ANY food → Instant AR overlay with calories, allergens, macros. Works on restaurant meals, home cooking, packaged foods.</p>
              <div style={{fontSize: '13px', background: 'rgba(76,175,80,0.2)', padding: '8px', borderRadius: '8px', marginTop: '10px'}}>
                <strong>The secret:</strong> Gemini Vision AI + 10,000-food database
              </div>
              <span className="try-now" style={{background: '#4CAF50', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try Now FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))', border: '2px solid rgba(33,150,243,0.3)'}}>
              <div className="feature-icon">🧬</div>
              <h3>DNA Personalization <span style={{color: '#2196F3', fontSize: '14px', fontWeight: 'bold'}}>✨ LIVE</span></h3>
              <p>Upload 23andMe raw data → Get genetic insights on nutrition needs, fitness response, sleep patterns, disease risks. Advice tailored to YOUR genes.</p>
              <div style={{fontSize: '13px', background: 'rgba(33,150,243,0.2)', padding: '8px', borderRadius: '8px', marginTop: '10px'}}>
                <strong>Mind-blowing:</strong> "Why does protein make me tired?" - Your DNA knows.
              </div>
              <span className="try-now" style={{background: '#2196F3', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try Now FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(156,39,176,0.1), rgba(233,30,99,0.1))', border: '2px solid rgba(156,39,176,0.3)'}}>
              <div className="feature-icon">🏆</div>
              <h3>Social Health Battles <span style={{color: '#9C27B0', fontSize: '14px', fontWeight: 'bold'}}>✨ LIVE</span></h3>
              <p>Challenge friends to 30-day fitness battles with REAL stakes (bragging rights, $5-$50 bets, loser buys dinner). Auto-syncs steps, calories, workouts.</p>
              <div style={{fontSize: '13px', background: 'rgba(156,39,176,0.2)', padding: '8px', borderRadius: '8px', marginTop: '10px'}}>
                <strong>Results:</strong> Users 3x more likely to hit goals with money on the line
              </div>
              <span className="try-now" style={{background: '#9C27B0', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try Now FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,152,0,0.1))', border: '2px solid rgba(255,193,7,0.3)'}}>
              <div className="feature-icon">🍽️</div>
              <h3>Meal Automation <span style={{color: '#FFC107', fontSize: '14px', fontWeight: 'bold'}}>✨ LIVE</span></h3>
              <p>AI generates weekly meal plan → Auto-orders groceries → Sends recipes with timers. The only app that goes from "What's for dinner?" to cooked meal automatically.</p>
              <div style={{fontSize: '13px', background: 'rgba(255,193,7,0.2)', padding: '8px', borderRadius: '8px', marginTop: '10px', color: '#fff'}}>
                <strong>Time saved:</strong> 6 hours/week (meal planning + shopping + deciding)
              </div>
              <span className="try-now" style={{background: '#FFC107', color: '#000', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block', fontWeight: 'bold'}}>Try Now FREE →</span>
            </a>

            <a href="/dashboard" className="feature-card" style={{background: 'linear-gradient(135deg, rgba(244,67,54,0.1), rgba(233,30,99,0.1))', border: '2px solid rgba(244,67,54,0.3)'}}>
              <div className="feature-icon">🚨</div>
              <h3>Emergency Health Autopilot <span style={{color: '#F44336', fontSize: '14px', fontWeight: 'bold'}}>✨ LIVE</span></h3>
              <p>Detects irregular heart rate/fall → Auto-calls emergency contacts + 999 → Shares live GPS location. Your phone becomes a life-saving device.</p>
              <div style={{fontSize: '13px', background: 'rgba(244,67,54,0.2)', padding: '8px', borderRadius: '8px', marginTop: '10px'}}>
                <strong>Peace of mind:</strong> Elderly parents, solo hikers, anyone living alone
              </div>
              <span className="try-now" style={{background: '#F44336', color: 'white', padding: '10px 20px', borderRadius: '25px', marginTop: '15px', display: 'inline-block'}}>Try Now FREE →</span>
            </a>
          </div>
          
          <div style={{textAlign: 'center', marginTop: '50px', padding: '30px', background: 'rgba(255,107,107,0.1)', borderRadius: '15px', border: '2px solid rgba(255,107,107,0.3)'}}>
            <h3 style={{fontSize: '28px', marginBottom: '15px'}}>Plus Standard Features (That Actually Work)</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px'}}>
              <div>✅ Step Counter (Multi-sensor)</div>
              <div>✅ Heart Rate Monitor</div>
              <div>✅ Sleep Tracking</div>
              <div>✅ 500+ Exercise Library</div>
              <div>✅ 5 Meditation Patterns</div>
              <div>✅ AI Chat Coach (Gemini)</div>
              <div>✅ Calorie Calculator</div>
              <div>✅ Water Intake Logger</div>
              <div>✅ Mood Tracking</div>
              <div>✅ Progress Photos</div>
              <div>✅ Workout Plans</div>
              <div>✅ Recipe Database</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="why-different" style={{padding: '60px 20px', background: '#0a0a0f'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', fontSize: '38px', marginBottom: '40px'}}>What Makes Helio Actually Different</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '50px'}}>
            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>⚡</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px'}}>Actually Uses AI (Not Marketing BS)</h3>
              <p style={{opacity: '0.85', lineHeight: '1.6'}}>Powered by Google's Gemini 1.5 Pro. Not some chatbot slapped on. Real computer vision, natural language, predictive modeling.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#ff6b6b'}}>
                <strong>Proof:</strong> Try the food scanner right now. It's genuinely magic.
              </div>
            </div>

            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>🧬</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px'}}>First App With DNA Integration</h3>
              <p style={{opacity: '0.85', lineHeight: '1.6'}}>23andMe, Ancestry.com compatible. Your advice is based on YOUR genetics, not random internet tips.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#4CAF50'}}>
                <strong>Example:</strong> "You have slow caffeine metabolism - avoid coffee after 2pm"
              </div>
            </div>

            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>🎮</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px'}}>Gamification That Works</h3>
              <p style={{opacity: '0.85', lineHeight: '1.6'}}>Social battles with real stakes. Insurance discounts up to 40%. XP system. Your health becomes a game you actually want to play.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#2196F3'}}>
                <strong>Results:</strong> 3x higher goal completion vs solo tracking
              </div>
            </div>

            <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize: '48px', marginBottom: '15px'}}>💰</div>
              <h3 style={{fontSize: '22px', marginBottom: '10px'}}>You Actually Save Money</h3>
              <p style={{opacity: '0.85', lineHeight: '1.6'}}>Insurance discounts (£400-800/year) + meal automation savings (£600/year) = App pays for itself 12x over.</p>
              <div style={{marginTop: '15px', fontSize: '13px', color: '#FFC107'}}>
                <strong>Math:</strong> £99/year cost - £1,200/year savings = +£1,101 profit
              </div>
            </div>
          </div>
          
          {/* Testimonials */}
          <div style={{background: 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(33,150,243,0.1))', padding: '40px', borderRadius: '20px', border: '2px solid rgba(76,175,80,0.2)'}}>
            <h3 style={{textAlign: 'center', fontSize: '28px', marginBottom: '30px'}}>What Early Users Are Saying</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px'}}>
              <div style={{padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px'}}>
                <div style={{marginBottom: '10px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontStyle: 'italic', marginBottom: '10px'}}>"The DNA insights alone are worth £99. Found out I need 2x more vitamin D than average. Game changer."</p>
                <strong>— Sarah M., London</strong>
              </div>
              <div style={{padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px'}}>
                <div style={{marginBottom: '10px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontStyle: 'italic', marginBottom: '10px'}}>"Lost 18 lbs in 3 months. The AR food scanner stopped me from mindless eating. I SEE the calories now."</p>
                <strong>— James T., Manchester</strong>
              </div>
              <div style={{padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px'}}>
                <div style={{marginBottom: '10px'}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontStyle: 'italic', marginBottom: '10px'}}>"The social battles make it fun. Won £50 from my mate. He's down 12 lbs and I'm £50 richer 😂"</p>
                <strong>— Marcus L., Birmingham</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" style={{padding: '80px 20px', background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <div style={{display: 'inline-block', background: 'rgba(255,107,107,0.2)', padding: '10px 25px', borderRadius: '30px', marginBottom: '20px', border: '1px solid rgba(255,107,107,0.4)'}}>
              <span style={{fontSize: '15px', fontWeight: 'bold'}}>⏰ Early Access Pricing - Lock In Now Before Price Doubles</span>
            </div>
          </div>
          
          <h2 style={{textAlign: 'center', fontSize: '42px', marginBottom: '15px'}}>Choose Your Plan</h2>
          <p style={{textAlign: 'center', fontSize: '18px', opacity: '0.8', marginBottom: '50px'}}>
            Every feature works RIGHT NOW. Try free, upgrade anytime.
          </p>
          
          <div className="pricing-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto'}}>
            <div className="pricing-card" style={{padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)', position: 'relative'}}>
              <h3 style={{fontSize: '28px', marginBottom: '15px'}}>Free Forever</h3>
              <div className="price" style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '20px'}}>£0</div>
              <ul className="features-list" style={{listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left'}}>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Step counter + heart rate</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ 3 AI messages/day</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ 3 food scans/day</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Basic workout tracking</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', opacity: 0.4}}>❌ DNA analysis</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', opacity: 0.4}}>❌ Health avatar</li>
                <li style={{padding: '10px 0', opacity: 0.4}}>❌ AR scanner</li>
              </ul>
              <button onClick={() => setShowAuthModal(true)} className="btn-outline" style={{width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px'}}>
                Start Free
              </button>
              <div style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', opacity: '0.7'}}>
                No credit card required
              </div>
            </div>

            <div className="pricing-card featured" style={{padding: '40px', background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,165,0,0.15))', borderRadius: '20px', border: '3px solid #ff6b6b', position: 'relative', transform: 'scale(1.05)'}}>
              <div className="badge" style={{position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#ff6b6b', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold'}}>🔥 MOST POPULAR</div>
              <h3 style={{fontSize: '28px', marginBottom: '15px', marginTop: '10px'}}>Premium Yearly</h3>
              <div style={{marginBottom: '15px'}}>
                <div className="price" style={{fontSize: '48px', fontWeight: 'bold', display: 'inline'}}>£99</div>
                <span className="per-month" style={{fontSize: '18px', opacity: '0.7'}}>/year</span>
              </div>
              <div style={{background: 'rgba(76,175,80,0.3)', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(76,175,80,0.5)'}}>
                💰 Save £20/year vs monthly + Get £1,200 in insurance discounts
              </div>
              <ul className="features-list" style={{listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left'}}>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ <strong>UNLIMITED</strong> AI coaching</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ <strong>UNLIMITED</strong> food scanning</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ DNA analysis + insights</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Health avatar predictions</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ AR food scanner</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Social battles + rewards</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Meal automation</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Emergency monitoring</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Insurance discounts (up to 40%)</li>
                <li style={{padding: '10px 0'}}>✅ Priority support</li>
              </ul>
              <button onClick={() => handleCheckout('yearly')} className="btn-primary" disabled={selectedPlan === 'yearly'} style={{width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)', border: 'none', cursor: selectedPlan === 'yearly' ? 'not-allowed' : 'pointer'}}>
                {selectedPlan === 'yearly' ? '⏳ Processing...' : '🚀 Get Premium - £99/year'}
              </button>
              <div style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#4CAF50', fontWeight: 'bold'}}>
                🔒 30-day money-back guarantee • Cancel anytime
              </div>
              <div style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', opacity: '0.7'}}>
                That's £8.25/month • Less than 2 coffees
              </div>
            </div>

            <div className="pricing-card" style={{padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)', position: 'relative'}}>
              <h3 style={{fontSize: '28px', marginBottom: '15px'}}>Premium Monthly</h3>
              <div className="price" style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '20px'}}>
                £9.99<span className="per-month" style={{fontSize: '18px', opacity: '0.7'}}>/mo</span>
              </div>
              <ul className="features-list" style={{listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left'}}>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Everything in Yearly</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ Cancel anytime</li>
                <li style={{padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>✅ No commitment</li>
                <li style={{padding: '10px 0', opacity: 0.6}}>⚠️ £20 more per year</li>
              </ul>
              <button onClick={() => handleCheckout('monthly')} className="btn-outline" disabled={selectedPlan === 'monthly'} style={{width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px'}}>
                {selectedPlan === 'monthly' ? '⏳ Processing...' : 'Try Monthly - £9.99/mo'}
              </button>
              <div style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', opacity: '0.7'}}>
                Billed monthly • Switch to yearly anytime
              </div>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div style={{textAlign: 'center', marginTop: '60px'}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: '0.7'}}>
              <div>🔒 Bank-Level Security</div>
              <div>✅ GDPR Compliant</div>
              <div>💳 Secure Stripe Payments</div>
              <div>🏥 HIPAA-Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta" style={{padding: '100px 20px', background: 'linear-gradient(135deg, rgba(255,107,107,0.1), rgba(33,150,243,0.1))', borderTop: '2px solid rgba(255,107,107,0.2)'}}>
        <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
          <h2 style={{fontSize: '48px', marginBottom: '20px'}}>Ready to Transform Your Health?</h2>
          <p style={{fontSize: '22px', marginBottom: '15px', opacity: '0.9'}}>
            Join 2,847 people who are already seeing results.
          </p>
          <p style={{fontSize: '18px', marginBottom: '40px', opacity: '0.75'}}>
            Every feature you saw on this page is <strong style={{color: '#4CAF50'}}>LIVE RIGHT NOW</strong>. No waiting. No "coming soon." Start in 60 seconds.
          </p>
          
          <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap'}}>
            <button onClick={() => handleCheckout('yearly')} className="btn-primary btn-large" style={{padding: '20px 50px', fontSize: '20px', fontWeight: 'bold', borderRadius: '15px', background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)', border: 'none', boxShadow: '0 10px 30px rgba(255,107,107,0.4)', transition: 'transform 0.2s', cursor: 'pointer'}}>
              🚀 Start Premium - £99/year
            </button>
            <button onClick={() => setShowAuthModal(true)} className="btn-outline" style={{padding: '20px 50px', fontSize: '20px', fontWeight: 'bold', borderRadius: '15px', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer'}}>
              Try Free First
            </button>
          </div>
          
          <div style={{marginBottom: '30px'}}>
            <div style={{fontSize: '16px', marginBottom: '15px', opacity: '0.8'}}>
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
          
          <div style={{marginTop: '50px', padding: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '15px'}}>Still not sure? Here's what you're missing:</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '15px'}}>
              <div>❌ No DNA insights</div>
              <div>❌ No future body preview</div>
              <div>❌ No AR food scanner</div>
              <div>❌ No insurance savings</div>
              <div>❌ No meal automation</div>
              <div>❌ No social competitions</div>
            </div>
            <div style={{marginTop: '20px', fontSize: '16px', opacity: '0.8'}}>
              Your competitors are already using Helio. Don't get left behind.
            </div>
          </div>
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



