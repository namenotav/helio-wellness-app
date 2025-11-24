import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import StepCounter from '../components/StepCounter'
import FoodScanner from '../components/FoodScanner'
import ProfileSetup from '../components/ProfileSetup'
import HealthAvatar from '../components/HealthAvatar'
import ARScanner from '../components/ARScanner'
import EmergencyPanel from '../components/EmergencyPanel'
import InsuranceRewards from '../components/InsuranceRewards'
import DNAUpload from '../components/DNAUpload'
import SocialBattles from '../components/SocialBattles'
import MealAutomation from '../components/MealAutomation'
import '../styles/NewDashboard.css'

export default function NewDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Killer Features Modals
  const [showHealthAvatar, setShowHealthAvatar] = useState(false)
  const [showARScanner, setShowARScanner] = useState(false)
  const [showFoodScanner, setShowFoodScanner] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showInsurance, setShowInsurance] = useState(false)
  const [showDNA, setShowDNA] = useState(false)
  const [showBattles, setShowBattles] = useState(false)
  const [showMeals, setShowMeals] = useState(false)

  const [stats, setStats] = useState({
    streak: 7,
    todaySteps: 8543,
    goalSteps: 10000,
    waterCups: 6,
    waterGoal: 8,
    mealsLogged: 2,
    mealsGoal: 3,
    wellnessScore: 78,
    level: 5,
    xp: 450,
    xpToNext: 600
  })

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      if (!currentUser.profile?.allergens && !currentUser.profile?.age) {
        setShowProfileSetup(true)
      }
    }
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.profile?.name || 'Champion'
    
    if (hour < 12) return `Good morning, ${name}! ☀️`
    if (hour < 18) return `Good afternoon, ${name}! 🌤️`
    return `Good evening, ${name}! 🌙`
  }

  const getMotivation = () => {
    const messages = [
      "You're absolutely crushing it today! 💪",
      "Keep going, you're unstoppable! 🚀",
      "Your future self will thank you! ⭐",
      "Every step counts. You got this! 🔥",
      "Small wins lead to big victories! 🏆"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const handleGoalComplete = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  return (
    <div className="new-dashboard">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              background: ['#FF6B35', '#FFB84D', '#44FF44', '#00C8FF', '#FF00FF'][Math.floor(Math.random() * 5)]
            }}></div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="dashboard-content">
        {activeTab === 'home' && (
          <HomeTab 
            stats={stats} 
            greeting={getGreeting()}
            motivation={getMotivation()}
            onGoalComplete={handleGoalComplete}
          />
        )}
        
        {activeTab === 'voice' && (
          <VoiceTab userName={user?.profile?.name || 'Friend'} />
        )}
        
        {activeTab === 'scan' && (
          <ScanTab 
            onOpenFoodScanner={() => setShowFoodScanner(true)}
            onOpenARScanner={() => setShowARScanner(true)}
          />
        )}
        
        {activeTab === 'zen' && (
          <ZenTab />
        )}
        
        {activeTab === 'me' && (
          <MeTab 
            user={user}
            stats={stats}
            onOpenHealthAvatar={() => setShowHealthAvatar(true)}
            onOpenARScanner={() => setShowARScanner(true)}
            onOpenEmergency={() => setShowEmergency(true)}
            onOpenInsurance={() => setShowInsurance(true)}
            onOpenDNA={() => setShowDNA(true)}
            onOpenBattles={() => setShowBattles(true)}
            onOpenMeals={() => setShowMeals(true)}
            onLogout={() => {
              authService.signOut()
              navigate('/')
            }}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          <span className="nav-icon">🎤</span>
          <span className="nav-label">Voice</span>
        </button>
        
        <button 
          className={`nav-item center ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <span className="nav-icon-center">📸</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'zen' ? 'active' : ''}`}
          onClick={() => setActiveTab('zen')}
        >
          <span className="nav-icon">🧘</span>
          <span className="nav-label">Zen</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'me' ? 'active' : ''}`}
          onClick={() => setActiveTab('me')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Me</span>
        </button>
      </nav>

      {/* Modals */}
      {showProfileSetup && <ProfileSetup onComplete={() => setShowProfileSetup(false)} />}
      {showHealthAvatar && <HealthAvatar onClose={() => setShowHealthAvatar(false)} />}
      {showARScanner && <ARScanner onClose={() => setShowARScanner(false)} />}
      {showFoodScanner && <FoodScanner onClose={() => setShowFoodScanner(false)} />}
      {showEmergency && <EmergencyPanel onClose={() => setShowEmergency(false)} />}
      {showInsurance && <InsuranceRewards onClose={() => setShowInsurance(false)} />}
      {showDNA && <DNAUpload onClose={() => setShowDNA(false)} />}
      {showBattles && <SocialBattles onClose={() => setShowBattles(false)} />}
      {showMeals && <MealAutomation onClose={() => setShowMeals(false)} />}
    </div>
  )
}

// Home Tab Component
function HomeTab({ stats, greeting, motivation, onGoalComplete }) {
  const stepsProgress = (stats.todaySteps / stats.goalSteps) * 100
  const waterProgress = (stats.waterCups / stats.waterGoal) * 100
  const mealsProgress = (stats.mealsLogged / stats.mealsGoal) * 100
  const xpProgress = (stats.xp / stats.xpToNext) * 100

  return (
    <div className="home-tab">
      <div className="greeting-card">
        <h1 className="greeting">{greeting}</h1>
        <p className="motivation">{motivation}</p>
      </div>

      {/* Streak Card */}
      <div className="streak-card">
        <div className="streak-flame">🔥</div>
        <div className="streak-info">
          <h2 className="streak-number">{stats.streak} Day Streak</h2>
          <p className="streak-message">You're on fire! Don't break it!</p>
        </div>
      </div>

      {/* Level & XP */}
      <div className="level-card">
        <div className="level-header">
          <span className="level-badge">⭐ Level {stats.level}</span>
          <span className="xp-text">{stats.xp} / {stats.xpToNext} XP</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpProgress}%` }}></div>
        </div>
        <p className="level-message">Only {stats.xpToNext - stats.xp} XP to level up!</p>
      </div>

      {/* Today's Goals */}
      <div className="goals-section">
        <h2 className="section-title">Today's Goals 🎯</h2>
        
        <div className="goal-card">
          <div className="goal-header">
            <span className="goal-icon">👟</span>
            <span className="goal-name">Steps</span>
            <span className="goal-count">{stats.todaySteps.toLocaleString()} / {stats.goalSteps.toLocaleString()}</span>
          </div>
          <div className="goal-bar">
            <div className="goal-fill steps" style={{ width: `${Math.min(stepsProgress, 100)}%` }}></div>
          </div>
          {stepsProgress >= 100 && <span className="goal-complete">✅ Crushed it!</span>}
        </div>

        <div className="goal-card">
          <div className="goal-header">
            <span className="goal-icon">💧</span>
            <span className="goal-name">Water</span>
            <span className="goal-count">{stats.waterCups} / {stats.waterGoal} cups</span>
          </div>
          <div className="goal-bar">
            <div className="goal-fill water" style={{ width: `${Math.min(waterProgress, 100)}%` }}></div>
          </div>
          {waterProgress >= 100 && <span className="goal-complete">✅ Hydrated!</span>}
        </div>

        <div className="goal-card">
          <div className="goal-header">
            <span className="goal-icon">🍽️</span>
            <span className="goal-name">Meals</span>
            <span className="goal-count">{stats.mealsLogged} / {stats.mealsGoal} logged</span>
          </div>
          <div className="goal-bar">
            <div className="goal-fill meals" style={{ width: `${Math.min(mealsProgress, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions ⚡</h2>
        <div className="action-grid">
          <button className="action-btn">📸 Log Meal</button>
          <button className="action-btn">💧 Add Water</button>
          <button className="action-btn">🏃 Log Workout</button>
          <button className="action-btn">😊 Log Mood</button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-feed">
        <h2 className="section-title">Today's Journey 📖</h2>
        <div className="activity-item">
          <span className="activity-time">2 hours ago</span>
          <span className="activity-text">🥗 Logged healthy lunch</span>
          <span className="activity-xp">+15 XP</span>
        </div>
        <div className="activity-item">
          <span className="activity-time">4 hours ago</span>
          <span className="activity-text">🚶 Hit 5,000 steps</span>
          <span className="activity-xp">+10 XP</span>
        </div>
        <div className="activity-item">
          <span className="activity-time">6 hours ago</span>
          <span className="activity-text">💧 Drank 4 cups of water</span>
          <span className="activity-xp">+5 XP</span>
        </div>
      </div>
    </div>
  )
}

// Voice Tab Component
function VoiceTab({ userName }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [messages, setMessages] = useState([
    { type: 'ai', text: `Hey ${userName}! I'm here to help. What's on your mind?` }
  ])

  const startListening = async () => {
    setIsListening(true)
    
    try {
      // Import speech recognition service
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
      
      // Check if available first
      try {
        const availCheck = await SpeechRecognition.available()
        console.log('Speech recognition available:', availCheck)
        
        if (!availCheck.available) {
          throw new Error('Speech recognition not available')
        }
      } catch (availError) {
        console.error('Availability check failed:', availError)
        throw new Error('Speech not supported')
      }

      // Request permissions
      try {
        const permResult = await SpeechRecognition.requestPermissions()
        console.log('Permission result:', permResult)
        
        if (permResult.speechRecognition !== 'granted') {
          alert('Please allow microphone access in your phone settings')
          setIsListening(false)
          return
        }
      } catch (permError) {
        console.error('Permission request failed:', permError)
        alert('Microphone permission required. Please enable it in Settings.')
        setIsListening(false)
        return
      }

      // Clean up any previous listeners
      try {
        await SpeechRecognition.removeAllListeners()
      } catch (e) {
        console.log('No listeners to remove')
      }

      let hasReceivedResult = false

      // Add error listener
      SpeechRecognition.addListener('error', (error) => {
        console.error('Speech recognition error event:', error)
        if (!hasReceivedResult) {
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: "I couldn't hear you clearly. Please try again or use the suggestion buttons below!" 
          }])
          setIsListening(false)
        }
      })

      // Add result listener
      SpeechRecognition.addListener('result', async (data) => {
        console.log('Speech result received:', data)
        hasReceivedResult = true
        
        if (data.matches && data.matches.length > 0) {
          const userText = data.matches[0]
          
          // Add user message
          setMessages(prev => [...prev, { type: 'user', text: userText }])
          
          // Stop listening
          setIsListening(false)
          setIsProcessing(true)
          
          try {
            await SpeechRecognition.stop()
          } catch (e) {
            console.log('Stop error:', e)
          }
          
          // Process with AI
          try {
            const geminiService = (await import('../services/geminiService')).default
            const user = JSON.parse(localStorage.getItem('wellnessai_user') || '{}')
            
            const response = await geminiService.chat(userText, {
              allergens: user.profile?.allergens || [],
              dietaryPreferences: user.profile?.dietaryPreferences || [],
              healthGoals: user.profile?.healthGoals || []
            })
            
            // Add AI response
            setMessages(prev => [...prev, { type: 'ai', text: response }])
          } catch (error) {
            console.error('AI error:', error)
            setMessages(prev => [...prev, { 
              type: 'ai', 
              text: "Oops! I had trouble with that. Can you try asking in a different way?" 
            }])
          }
          
          setIsProcessing(false)
        } else {
          setIsListening(false)
        }
      })

      // Start listening - try with popup first
      console.log('Starting speech recognition...')
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 5,
        prompt: 'Speak now',
        partialResults: false,
        popup: true
      })
      
      console.log('Speech recognition started successfully')

      // Auto-stop after 10 seconds
      setTimeout(async () => {
        if (!hasReceivedResult) {
          try {
            await SpeechRecognition.stop()
            setMessages(prev => [...prev, { 
              type: 'ai', 
              text: "I didn't catch that. Try speaking again or use the suggestion buttons!" 
            }])
          } catch (e) {
            console.log('Auto-stop error:', e)
          }
          setIsListening(false)
        }
      }, 10000)

    } catch (error) {
      console.error('Speech recognition setup error:', error)
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: `Voice input not available right now 😔 But I can still help! Try clicking the suggestion buttons below or typing your question.` 
      }])
      setIsListening(false)
    }
  }

  const stopListening = async () => {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
      await SpeechRecognition.stop()
      await SpeechRecognition.removeAllListeners()
    } catch (error) {
      console.error('Error stopping speech:', error)
    }
    setIsListening(false)
  }

  const speakText = async (text) => {
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
      setIsSpeaking(true)
      
      await TextToSpeech.speak({
        text: text,
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      })
      
      setIsSpeaking(false)
    } catch (error) {
      console.error('Text-to-speech error:', error)
      setIsSpeaking(false)
    }
  }

  const processUserMessage = async (userText) => {
    setMessages(prev => [...prev, { type: 'user', text: userText }])
    setIsProcessing(true)
    
    try {
      console.log('Processing user message:', userText)
      const geminiService = (await import('../services/geminiService')).default
      console.log('Gemini service loaded')
      
      const user = JSON.parse(localStorage.getItem('wellnessai_user') || '{}')
      console.log('User context loaded')
      
      const response = await geminiService.chat(userText, {
        allergens: user.profile?.allergens || [],
        dietaryPreferences: user.profile?.dietaryPreferences || [],
        healthGoals: user.profile?.healthGoals || []
      })
      
      console.log('Got AI response:', response)
      setMessages(prev => [...prev, { type: 'ai', text: response }])
      
      // Speak the response
      await speakText(response)
      
    } catch (error) {
      console.error('=== PROCESSING ERROR ===')
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Full error:', error)
      
      // Show the actual error to help debug
      const errorMsg = `Error: ${error.message}. Check console for details.`
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: errorMsg
      }])
      await speakText("There was an error. Please check your internet connection and try again.")
    }
    
    setIsProcessing(false)
  }

  const handleSuggestionClick = (text) => {
    processUserMessage(text)
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      processUserMessage(textInput)
      setTextInput('')
    }
  }

  return (
    <div className="voice-tab">
      <div className="voice-header">
        <h1>AI Voice Coach 🎤</h1>
        <p>Just talk to me like a friend</p>
      </div>

      <div className="voice-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`voice-message ${msg.type}`}>
            <span className="message-icon">{msg.type === 'ai' ? '🤖' : '👤'}</span>
            <p>{msg.text}</p>
          </div>
        ))}
        {isProcessing && (
          <div className="voice-message ai">
            <span className="message-icon">🤖</span>
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <button 
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
      >
        {isListening ? (
          <>
            <span className="pulse-ring"></span>
            <span className="voice-icon">🎙️</span>
            <p>I'm listening...</p>
          </>
        ) : isProcessing ? (
          <>
            <span className="voice-icon">⏳</span>
            <p>Processing...</p>
          </>
        ) : (
          <>
            <span className="voice-icon">🎤</span>
            <p>Tap to talk</p>
          </>
        )}
      </button>

      {/* Text Input Alternative */}
      <form className="voice-text-input" onSubmit={handleTextSubmit}>
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or type your message here..."
          disabled={isProcessing || isListening}
          className="text-input-field"
        />
        <button 
          type="submit" 
          className="text-send-btn"
          disabled={!textInput.trim() || isProcessing || isListening}
        >
          Send 📤
        </button>
      </form>

      <div className="voice-suggestions">
        <p className="suggestions-label">Or try these quick questions:</p>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("What should I eat for lunch?")}
          disabled={isListening || isProcessing}
        >
          "What should I eat for lunch?"
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("How am I doing today?")}
          disabled={isListening || isProcessing}
        >
          "How am I doing today?"
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("Show me my progress")}
          disabled={isListening || isProcessing}
        >
          "Show me my progress"
        </button>
      </div>

      {isSpeaking && (
        <div className="speaking-indicator">
          <span className="speaker-icon">🔊</span>
          <p>AI is speaking...</p>
        </div>
      )}
    </div>
  )
}

// Scan Tab Component
function ScanTab({ onOpenFoodScanner, onOpenARScanner }) {
  return (
    <div className="scan-tab">
      <div className="scan-header">
        <h1>Scan Anything 📸</h1>
        <p>I'll tell you everything about it</p>
      </div>

      <div className="scan-options">
        <button className="scan-option-card" onClick={onOpenFoodScanner}>
          <span className="scan-option-icon">🍔</span>
          <h3>Food Scanner</h3>
          <p>See if it's safe for you</p>
          <span className="scan-badge">AI Powered</span>
        </button>

        <button className="scan-option-card" onClick={onOpenARScanner}>
          <span className="scan-option-icon">✨</span>
          <h3>AR Scanner</h3>
          <p>See calories & nutrition in real-time</p>
          <span className="scan-badge">Augmented Reality</span>
        </button>
      </div>

      <div className="scan-features">
        <h3>What I can detect:</h3>
        <div className="feature-list">
          <div className="feature-item">✅ Hidden allergens</div>
          <div className="feature-item">✅ Calories & macros</div>
          <div className="feature-item">✅ Ingredient analysis</div>
          <div className="feature-item">✅ Healthy alternatives</div>
        </div>
      </div>
    </div>
  )
}

// Zen Tab Component
function ZenTab() {
  const [isBreathing, setIsBreathing] = useState(false)

  return (
    <div className="zen-tab">
      <div className="zen-header">
        <h1>Zen Mode 🧘</h1>
        <p>Take a moment for yourself</p>
      </div>

      <div className="breathing-exercise">
        <div className={`breath-circle ${isBreathing ? 'breathing' : ''}`}>
          <p className="breath-text">{isBreathing ? 'Breathe...' : 'Tap to start'}</p>
        </div>
        <button 
          className="breath-button"
          onClick={() => setIsBreathing(!isBreathing)}
        >
          {isBreathing ? 'Stop' : 'Start Breathing Exercise'}
        </button>
      </div>

      <div className="zen-activities">
        <h3>Mental Wellness Activities</h3>
        <button className="zen-card">
          <span className="zen-icon">🎵</span>
          <div>
            <h4>Guided Meditation</h4>
            <p>5 minute calm session</p>
          </div>
        </button>
        <button className="zen-card">
          <span className="zen-icon">📝</span>
          <div>
            <h4>Gratitude Journal</h4>
            <p>Write what you're thankful for</p>
          </div>
        </button>
        <button className="zen-card">
          <span className="zen-icon">😌</span>
          <div>
            <h4>Stress Relief</h4>
            <p>Quick relaxation techniques</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// Me Tab Component
function MeTab({ user, stats, onOpenHealthAvatar, onOpenARScanner, onOpenEmergency, onOpenInsurance, onOpenDNA, onOpenBattles, onOpenMeals, onLogout }) {
  return (
    <div className="me-tab">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.profile?.avatar || '👤'}
        </div>
        <h2>{user?.profile?.name || 'Wellness Warrior'}</h2>
        <p className="profile-level">⭐ Level {stats.level} • 🔥 {stats.streak} Day Streak</p>
      </div>

      <div className="achievements-section">
        <h3>Your Achievements 🏆</h3>
        <div className="achievement-badges">
          <div className="badge">🔥 Fire Starter</div>
          <div className="badge">💪 Strength Pro</div>
          <div className="badge">🥗 Nutrition Ninja</div>
          <div className="badge locked">🏃 Marathon Master</div>
        </div>
      </div>

      <div className="killer-features-section">
        <h3>Killer Features ⚡</h3>
        <div className="features-grid">
          <button className="feature-card" onClick={onOpenHealthAvatar}>
            <span className="feature-icon">🧬</span>
            <span className="feature-name">Health Avatar</span>
            <span className="feature-tag">See Your Future</span>
          </button>
          
          <button className="feature-card" onClick={onOpenARScanner}>
            <span className="feature-icon">📸</span>
            <span className="feature-name">AR Scanner</span>
            <span className="feature-tag">AR Overlay</span>
          </button>
          
          <button className="feature-card" onClick={onOpenEmergency}>
            <span className="feature-icon">🚨</span>
            <span className="feature-name">Emergency</span>
            <span className="feature-tag">24/7 Monitor</span>
          </button>
          
          <button className="feature-card" onClick={onOpenInsurance}>
            <span className="feature-icon">💰</span>
            <span className="feature-name">Insurance</span>
            <span className="feature-tag">Save $2.4k/yr</span>
          </button>
          
          <button className="feature-card" onClick={onOpenDNA}>
            <span className="feature-icon">🧬</span>
            <span className="feature-name">DNA Analysis</span>
            <span className="feature-tag">Personalized</span>
          </button>
          
          <button className="feature-card" onClick={onOpenBattles}>
            <span className="feature-icon">⚔️</span>
            <span className="feature-name">Battles</span>
            <span className="feature-tag">Compete</span>
          </button>
          
          <button className="feature-card" onClick={onOpenMeals}>
            <span className="feature-icon">🍽️</span>
            <span className="feature-name">Meal Auto</span>
            <span className="feature-tag">AI Chef</span>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Settings ⚙️</h3>
        <button className="settings-item">
          <span>📊 View Full Stats</span>
          <span>→</span>
        </button>
        <button className="settings-item">
          <span>🔔 Notifications</span>
          <span>→</span>
        </button>
        <button className="settings-item">
          <span>🎨 Customize Theme</span>
          <span>→</span>
        </button>
        <button className="settings-item" onClick={onLogout}>
          <span>🚪 Sign Out</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}
