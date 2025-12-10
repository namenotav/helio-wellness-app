import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatWithAI, analyzeProgressPhoto, analyzeFoodPhoto, generateWorkoutPlan, generateMealPlan, getHabitInsights, getMotivationalMessage } from '../services/geminiService'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { Capacitor } from '@capacitor/core'
import devAuthService from '../services/devAuthService'
import authService from '../services/authService'
import subscriptionService from '../services/subscriptionService'
import DevUnlock from '../components/DevUnlock'
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
import PaywallModal from '../components/PaywallModal'
import '../styles/Dashboard.css'
import '../styles/AdventureMap.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('map') // 'map' or feature name
  const [currentTheme, setCurrentTheme] = useState('sunset') // default theme
  const [userData, setUserData] = useState({
    streak: 5,
    workouts: 12,
    meals: 45,
    goals: 'General wellness',
    wellnessScore: 78,
    level: 3,
    xp: 450,
    xpToNext: 600
  })
  
  // Developer mode state
  const [isDevMode, setIsDevMode] = useState(false)
  const [showDevUnlock, setShowDevUnlock] = useState(false)
  const [isAuthorizedDevice, setIsAuthorizedDevice] = useState(false)
  
  // Food Scanner state
  const [showFoodScanner, setShowFoodScanner] = useState(false)
  
  // Profile Setup state
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  
  // Killer Features state
  const [showHealthAvatar, setShowHealthAvatar] = useState(false)
  const [showARScanner, setShowARScanner] = useState(false)
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false)
  const [showInsuranceRewards, setShowInsuranceRewards] = useState(false)
  const [showDNAUpload, setShowDNAUpload] = useState(false)
  const [showSocialBattles, setShowSocialBattles] = useState(false)
  const [showMealAutomation, setShowMealAutomation] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallFeature, setPaywallFeature] = useState('')
  
  // Check if user needs to complete profile
  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user && !user.profile?.allergens && !user.profile?.age) {
      // New user - show profile setup
      setShowProfileSetup(true)
    }
  }, [])

  // Theme configurations
  const themes = {
    sunset: {
      name: '🌅 Sunset',
      primary: '#FF6B35',
      secondary: '#FFB84D',
      background: 'linear-gradient(180deg, #FFE5B4 0%, #FFB84D 50%, #FF6B35 100%)',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      textColor: '#2C3E50'
    },
    ocean: {
      name: '🌊 Ocean',
      primary: '#0077BE',
      secondary: '#4EC5E0',
      background: 'linear-gradient(180deg, #E0F7FA 0%, #80DEEA 50%, #0077BE 100%)',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      textColor: '#1A237E'
    },
    forest: {
      name: '🌲 Forest',
      primary: '#2E7D32',
      secondary: '#66BB6A',
      background: 'linear-gradient(180deg, #C8E6C9 0%, #66BB6A 50%, #2E7D32 100%)',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      textColor: '#1B5E20'
    },
    lavender: {
      name: '💜 Lavender',
      primary: '#9C27B0',
      secondary: '#CE93D8',
      background: 'linear-gradient(180deg, #F3E5F5 0%, #CE93D8 50%, #9C27B0 100%)',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      textColor: '#4A148C'
    },
    rose: {
      name: '🌹 Rose',
      primary: '#E91E63',
      secondary: '#F48FB1',
      background: 'linear-gradient(180deg, #FCE4EC 0%, #F48FB1 50%, #E91E63 100%)',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      textColor: '#880E4F'
    },
    midnight: {
      name: '🌙 Midnight',
      primary: '#1A237E',
      secondary: '#5C6BC0',
      background: 'linear-gradient(180deg, #3949AB 0%, #283593 50%, #1A237E 100%)',
      cardBg: 'rgba(255, 255, 255, 0.90)',
      textColor: '#0D47A1'
    }
  }

  const theme = themes[currentTheme]

  // Initialize developer authentication
  useEffect(() => {
    const initDevAuth = async () => {
      const isAuthorized = await devAuthService.initialize()
      setIsAuthorizedDevice(isAuthorized)
      setIsDevMode(devAuthService.isDevModeActive())
    }
    
    initDevAuth()
  }, [])
  
  // Handle developer unlock
  const handleDevUnlock = async (password) => {
    const result = await devAuthService.unlockDevMode(password)
    
    if (result.success) {
      setIsDevMode(true)
      setShowDevUnlock(false)
    }
    
    return result
  }
  
  // Logo tap counter for dev unlock
  const [tapCount, setTapCount] = useState(0)
  const handleLogoTap = () => {
    setTapCount(prev => prev + 1)
    
    if (tapCount === 6 && isAuthorizedDevice && !isDevMode) {
      // 7 taps total - show unlock prompt
      setShowDevUnlock(true)
      setTapCount(0)
    }
    
    // Reset counter after 2 seconds of no taps
    setTimeout(() => setTapCount(0), 2000)
  }

  return (
    <div className="dashboard" style={{ background: theme.background, color: theme.textColor }}>
      {activeView === 'map' ? (
        <>
          <StepCounter />
          <AdventureMap 
            userData={userData}
            theme={theme}
            currentTheme={currentTheme}
            themes={themes}
            onThemeChange={setCurrentTheme}
            onFeatureSelect={setActiveView}
            onNavigate={navigate}
            isDevMode={isDevMode}
            onLogoTap={handleLogoTap}
            onOpenFoodScanner={() => setShowFoodScanner(true)}
            onOpenHealthAvatar={() => setShowHealthAvatar(true)}
            onOpenARScanner={() => setShowARScanner(true)}
            onOpenEmergency={() => setShowEmergencyPanel(true)}
            onOpenInsurance={() => setShowInsuranceRewards(true)}
            onOpenDNA={() => setShowDNAUpload(true)}
            onOpenBattles={() => setShowSocialBattles(true)}
            onOpenMeals={() => setShowMealAutomation(true)}
          />
        </>
      ) : (
        <FeatureView 
          feature={activeView}
          theme={theme}
          onBack={() => setActiveView('map')}
          isDevMode={isDevMode}
        />
      )}
      
      {showDevUnlock && (
        <DevUnlock 
          onUnlock={handleDevUnlock}
          onCancel={() => setShowDevUnlock(false)}
        />
      )}
      
      {showFoodScanner && (
        <FoodScanner onClose={() => setShowFoodScanner(false)} />
      )}
      
      {showProfileSetup && (
        <ProfileSetup onComplete={() => setShowProfileSetup(false)} />
      )}
      
      {/* Killer Features Modals */}
      {showHealthAvatar && (
        <HealthAvatar onClose={() => setShowHealthAvatar(false)} />
      )}
      
      {showARScanner && (
        <ARScanner onClose={() => setShowARScanner(false)} />
      )}
      
      {showEmergencyPanel && (
        <EmergencyPanel onClose={() => setShowEmergencyPanel(false)} />
      )}
      
      {showInsuranceRewards && (
        <InsuranceRewards onClose={() => setShowInsuranceRewards(false)} />
      )}
      
      {showDNAUpload && (
        <DNAUpload onClose={() => setShowDNAUpload(false)} />
      )}
      
      {showSocialBattles && (
        <SocialBattles onClose={() => setShowSocialBattles(false)} />
      )}
      
      {showMealAutomation && (
        <MealAutomation onClose={() => setShowMealAutomation(false)} />
      )}

      {/* Paywall Modal */}
      {showPaywall && renderPaywall()}
    </div>
  )
}

// Adventure Map Component
function AdventureMap({ userData, theme, currentTheme, themes, onThemeChange, onFeatureSelect, onNavigate, isDevMode, onLogoTap, onOpenFoodScanner, onOpenHealthAvatar, onOpenARScanner, onOpenEmergency, onOpenInsurance, onOpenDNA, onOpenBattles, onOpenMeals }) {
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showKillerFeatures, setShowKillerFeatures] = useState(false)

  const features = [
    { id: 'habits', icon: '🤖', name: 'AI Coach', level: 1, unlocked: true },
    { id: 'tracking', icon: '📊', name: 'Tracking', level: 1, unlocked: true },
    { id: 'photos', icon: '📸', name: 'Progress', level: 2, unlocked: isDevMode || true },
    { id: 'nutrition', icon: '🍎', name: 'Nutrition', level: 2, unlocked: isDevMode || true },
    { id: 'workout', icon: '💪', name: 'Workouts', level: 3, unlocked: isDevMode || true },
    { id: 'mental', icon: '🧘', name: 'Mental', level: 3, unlocked: isDevMode || userData.level >= 3 },
    { id: 'analytics', icon: '📈', name: 'Analytics', level: 4, unlocked: isDevMode || userData.level >= 4 },
    { id: 'reminders', icon: '🔔', name: 'Reminders', level: 4, unlocked: isDevMode || userData.level >= 4 }
  ]

  return (
    <div className="adventure-map">
      {/* Header with Score */}
      <header className="map-header" style={{ background: theme.cardBg }}>
        <div className="map-header-content">
          <h1 
            style={{ color: theme.primary, cursor: 'pointer' }} 
            onClick={onLogoTap}
            title={isDevMode ? '🔓 Developer Mode Active' : ''}
          >
            ☀️ Helio Adventure Map {isDevMode && '🔓'}
          </h1>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-label">Wellness Score</span>
              <div className="score-bar">
                <div className="score-fill" style={{ 
                  width: `${userData.wellnessScore}%`,
                  background: theme.secondary 
                }}></div>
                <span className="score-text">{userData.wellnessScore}/100</span>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-badge" style={{ background: theme.primary }}>
                🔥 {userData.streak} Day Streak
              </div>
              <div className="stat-badge" style={{ background: theme.secondary }}>
                ⭐ Level {userData.level}
              </div>
              <div className="stat-badge" style={{ background: theme.primary }}>
                XP {userData.xp}/{userData.xpToNext}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Action Buttons at Bottom */}
      <div className="floating-action-buttons">
        <button 
          onClick={() => onNavigate('/')} 
          className="fab-button fab-home" 
          style={{ background: theme.primary }}
          title="Back to Home"
        >
          ← Home
        </button>
        <button 
          className="fab-button fab-scanner" 
          onClick={onOpenFoodScanner}
          style={{ background: '#FF6B35' }}
          title="AI Food Scanner"
        >
          📸
        </button>
        <button 
          className="fab-button fab-killer" 
          onClick={() => setShowKillerFeatures(!showKillerFeatures)}
          style={{ background: '#FF00FF', animation: 'pulse 2s ease-in-out infinite' }}
          title="Killer Features ⚡"
        >
          ⚡
        </button>
        <button 
          className="fab-button fab-theme" 
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          style={{ background: theme.secondary }}
          title="Change Theme"
        >
          🎨
        </button>
      </div>

      {/* Theme Selector */}
      {showThemeMenu && (
        <div className="theme-menu theme-menu-bottom" style={{ background: theme.cardBg }}>
          <h3 style={{ color: theme.primary }}>Choose Your Theme</h3>
          <div className="theme-grid">
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                onClick={() => {
                  onThemeChange(key)
                  setShowThemeMenu(false)
                }}
                style={{ 
                  background: t.background,
                  border: currentTheme === key ? `3px solid ${t.primary}` : 'none'
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Killer Features Menu */}
      {showKillerFeatures && (
        <div className="killer-features-menu" style={{ background: theme.cardBg }}>
          <h3 style={{ color: theme.primary, textAlign: 'center', marginBottom: '15px' }}>⚡ Killer Features</h3>
          <div className="killer-features-grid">
            <button className="killer-feature-btn" onClick={() => { onOpenHealthAvatar(); setShowKillerFeatures(false); }} style={{ background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 40, 80, 0.95))' }}>
              <span className="killer-icon">🧬</span>
              <span className="killer-name">Health Avatar</span>
            </button>
            <button className="killer-feature-btn" onClick={() => { onOpenARScanner(); setShowKillerFeatures(false); }} style={{ background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(30, 10, 50, 0.95))' }}>
              <span className="killer-icon">📸</span>
              <span className="killer-name">AR Scanner</span>
            </button>
            <button className="killer-feature-btn" onClick={() => { onOpenEmergency(); setShowKillerFeatures(false); }} style={{ background: 'linear-gradient(135deg, rgba(40, 0, 0, 0.95), rgba(60, 0, 20, 0.95))' }}>
              <span className="killer-icon">🚨</span>
              <span className="killer-name">Emergency</span>
            </button>
            <button className="killer-feature-btn" onClick={() => { onOpenInsurance(); setShowKillerFeatures(false); }} style={{ background: 'linear-gradient(135deg, rgba(0, 40, 20, 0.95), rgba(0, 60, 40, 0.95))' }}>
              <span className="killer-icon">💰</span>
              <span className="killer-name">Insurance</span>
            </button>
            <button className="killer-feature-btn" onClick={() => { onOpenDNA(); setShowKillerFeatures(false); }} style={{ background: 'linear-gradient(135deg, rgba(20, 0, 40, 0.95), rgba(40, 0, 80, 0.95))' }}>
              <span className="killer-icon">🧬</span>
              <span className="killer-name">DNA Analysis</span>
            </button>
            <button className="killer-feature-btn" onClick={() => { onOpenBattles(); setShowKillerFeatures(false); }} style={{ background: 'linear-gradient(135deg, rgba(40, 20, 0, 0.95), rgba(80, 40, 0, 0.95))' }}>
              <span className="killer-icon">⚔️</span>
              <span className="killer-name">Battles</span>
            </button>
            <button className="killer-feature-btn" onClick={() => { onOpenMeals(); setShowKillerFeatures(false); }} style={{ background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 60, 0.95))' }}>
              <span className="killer-icon">🍽️</span>
              <span className="killer-name">Meal Auto</span>
            </button>
          </div>
        </div>
      )}

      {/* Adventure Map Path */}
      <div className="map-container">
        <div className="map-path">
          {/* Goal at top */}
          <div className="map-destination">
            <div className="destination-card" style={{ background: theme.cardBg, borderColor: theme.primary }}>
              <div className="destination-icon">🏆</div>
              <h2 style={{ color: theme.primary }}>Wellness Master</h2>
              <p>Your Ultimate Goal</p>
            </div>
          </div>

          {/* Feature stations */}
          <div className="feature-stations">
            {features.reverse().map((feature, index) => (
              <div key={feature.id} className="station-row">
                {index % 2 === 0 ? (
                  <>
                    <MapStation 
                      feature={feature}
                      theme={theme}
                      onSelect={onFeatureSelect}
                    />
                    <div className="path-line" style={{ background: theme.secondary }}></div>
                    <div className="station-spacer"></div>
                  </>
                ) : (
                  <>
                    <div className="station-spacer"></div>
                    <div className="path-line" style={{ background: theme.secondary }}></div>
                    <MapStation 
                      feature={feature}
                      theme={theme}
                      onSelect={onFeatureSelect}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Start point with avatar */}
          <div className="map-start">
            <div className="start-card" style={{ background: theme.cardBg, borderColor: theme.primary }}>
              <div className="avatar-container">
                <div className="user-avatar" style={{ background: theme.primary }}>
                  👤
                </div>
                <div className="avatar-level" style={{ background: theme.secondary }}>
                  Lv {userData.level}
                </div>
              </div>
              <h3 style={{ color: theme.primary }}>Start Your Journey!</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Map Station Component
function MapStation({ feature, theme, onSelect }) {
  return (
    <div 
      className={`map-station ${!feature.unlocked ? 'locked' : ''}`}
      onClick={() => feature.unlocked && onSelect(feature.id)}
      style={{ 
        background: theme.cardBg,
        borderColor: feature.unlocked ? theme.primary : '#ccc',
        opacity: feature.unlocked ? 1 : 0.6
      }}
    >
      <div className="station-icon" style={{ 
        fontSize: '3rem',
        filter: !feature.unlocked ? 'grayscale(100%)' : 'none'
      }}>
        {feature.icon}
      </div>
      <h3 style={{ color: theme.primary }}>{feature.name}</h3>
      <p className="station-level">Level {feature.level}</p>
      {!feature.unlocked && (
        <div className="locked-badge" style={{ background: theme.secondary }}>
          🔒 Locked
        </div>
      )}
      {feature.unlocked && (
        <button className="enter-btn" style={{ background: theme.primary }}>
          Enter →
        </button>
      )}
    </div>
  )
}

// Feature View Component
function FeatureView({ feature, theme, onBack, isDevMode }) {
  return (
    <div className="feature-view" style={{ background: theme.background }}>
      <header className="feature-header" style={{ background: theme.cardBg }}>
        <button onClick={onBack} className="btn-back-feature" style={{ color: theme.primary }}>
          ← Back to Map
        </button>
        <h2 style={{ color: theme.primary }}>Feature Content</h2>
      </header>
      <main className="feature-content">
        {feature === 'habits' && <AICoachTab />}
        {feature === 'tracking' && <TrackingTab />}
        {feature === 'photos' && <PhotosTab />}
        {feature === 'nutrition' && <NutritionTab />}
        {feature === 'workout' && <WorkoutTab />}
        {feature === 'mental' && <MentalTab />}
        {feature === 'analytics' && <AnalyticsTab />}
        {feature === 'reminders' && <RemindersTab />}
      </main>
    </div>
  )
}

// AI Coach Tab
function AICoachTab() {
  const [userInput, setUserInput] = useState('')
  const [messages, setMessages] = useState([
    { type: 'ai', text: '👋 Hello! I\'m your AI wellness coach powered by Gemini. How can I help you today?' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showImages, setShowImages] = useState(true)

  // Voice recognition with auto-send using Capacitor native plugin
  const startVoiceInput = async () => {
    const isNative = Capacitor.isNativePlatform()
    
    if (isNative) {
      // Use Capacitor native speech recognition on mobile
      try {
        if(import.meta.env.DEV)console.log('🎤 Starting native speech recognition...')
        
        // Check if speech recognition is available
        const available = await SpeechRecognition.available()
        if(import.meta.env.DEV)console.log('Speech recognition available:', available)
        
        if (!available.available) {
          alert('Speech recognition is not available on this device.')
          return
        }
        
        // Check and request permissions
        const permStatus = await SpeechRecognition.requestPermissions()
        if(import.meta.env.DEV)console.log('Permission status:', permStatus)
        
        if (permStatus.speechRecognition !== 'granted') {
          alert('Microphone permission is required for voice input.')
          return
        }
        
        setIsListening(true)
        setMessages(prev => [...prev, { 
          type: 'system', 
          text: '🎤 Listening... Speak now!' 
        }])
        
        // Start listening and wait for result
        const result = await SpeechRecognition.start({
          language: 'en-US',
          maxResults: 1,
          prompt: 'Speak now...',
          partialResults: false,  // Disable partial results for simpler handling
          popup: false  // Use app's UI instead of Google's dialog
        })
        
        if(import.meta.env.DEV)console.log('✅ Speech recognition result:', result)
        
        setIsListening(false)
        setMessages(prev => prev.filter(m => m.type !== 'system'))
        
        if (result && result.matches && result.matches.length > 0) {
          const transcript = result.matches[0]
          if(import.meta.env.DEV)console.log('✅ Transcribed text:', transcript)
          
          // Auto-send the transcribed message
          setMessages(prev => [...prev, { type: 'user', text: transcript }])
          setIsLoading(true)
          setUserInput('')
          
          try {
            const aiResponse = await chatWithAI(transcript, {
              goals: 'General wellness',
              streak: 0,
              recentActivity: 'Just started'
            })
            
            const images = showImages ? getRelevantImages(transcript) : []
            
            setMessages(prev => [...prev, { 
              type: 'ai', 
              text: aiResponse,
              images: images
            }])
            speakResponse(aiResponse)
          } catch (error) {
            if(import.meta.env.DEV)console.error('❌ AI Error:', error)
            const errorMsg = 'I\'m having trouble connecting. Please check your API key and try again!'
            setMessages(prev => [...prev, { type: 'ai', text: errorMsg }])
          } finally {
            setIsLoading(false)
          }
        } else {
          if(import.meta.env.DEV)console.log('⚠️ No speech detected')
        }
        
      } catch (error) {
        if(import.meta.env.DEV)console.error('❌ Native speech recognition error:', error)
        setIsListening(false)
        setMessages(prev => prev.filter(m => m.type !== 'system'))
        
        if (error.message && error.message.includes('Missing permissions')) {
          alert('Microphone permission is required. Please enable it in your device settings.')
        } else {
          alert('Speech recognition failed. Please try again.')
        }
      }
      
    } else {
      // Use Web Speech API for web/desktop
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Voice recognition not supported in this browser.')
        return
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        if(import.meta.env.DEV)console.log('✅ Microphone permission granted')
      } catch (error) {
        if(import.meta.env.DEV)console.error('❌ Microphone permission denied:', error)
        alert('Microphone access is required for voice input.')
        return
      }

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognitionAPI()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      let finalTranscript = ''

      recognition.onstart = () => {
        if(import.meta.env.DEV)console.log('🎤 Web speech recognition started')
        setIsListening(true)
        setMessages(prev => [...prev, { 
          type: 'system', 
          text: '🎤 Listening... Speak now!' 
        }])
      }
      
      recognition.onend = () => {
        if(import.meta.env.DEV)console.log('🛑 Speech recognition ended')
        setIsListening(false)
        setMessages(prev => prev.filter(m => m.type !== 'system'))
        
        if (finalTranscript.trim()) {
          processWebTranscript(finalTranscript)
        }
      }
      
      recognition.onresult = (event) => {
        if(import.meta.env.DEV)console.log('📥 Results received')
        let interimTranscript = ''
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          
          if (result.isFinal) {
            finalTranscript += transcript
            if(import.meta.env.DEV)console.log('✅ Final transcript:', transcript)
          } else {
            interimTranscript += transcript
            if(import.meta.env.DEV)console.log('⏳ Interim transcript:', transcript)
          }
        }
        
        setUserInput(finalTranscript + interimTranscript)
      }

      const processWebTranscript = async (transcript) => {
        if (!transcript.trim()) return
        
        if(import.meta.env.DEV)console.log('✅ Processing transcript:', transcript)
        setMessages(prev => [...prev, { type: 'user', text: transcript }])
        setIsLoading(true)
        setUserInput('')
        
        try {
          const aiResponse = await chatWithAI(transcript, {
            goals: 'General wellness',
            streak: 0,
            recentActivity: 'Just started'
          })
          
          const images = showImages ? getRelevantImages(transcript) : []
          
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: aiResponse,
            images: images
          }])
          speakResponse(aiResponse)
        } catch (error) {
          if(import.meta.env.DEV)console.error('❌ AI Error:', error)
          const errorMsg = 'I\'m having trouble connecting. Please check your API key and try again!'
          setMessages(prev => [...prev, { type: 'ai', text: errorMsg }])
        } finally {
          setIsLoading(false)
        }
      }

      recognition.onerror = (event) => {
        if(import.meta.env.DEV)console.error('❌ Speech recognition error:', event.error)
        setIsListening(false)
        setMessages(prev => prev.filter(m => m.type !== 'system'))
        
        if (event.error === 'not-allowed') {
          alert('Microphone permission denied.')
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.')
        } else {
          alert(`Voice input error: ${event.error}`)
        }
      }

      try {
        recognition.start()
      } catch (error) {
        if(import.meta.env.DEV)console.error('Failed to start recognition:', error)
        alert('Failed to start voice input. Please try again.')
        setIsListening(false)
      }
    }
  }

  // Text to speech for AI responses
  const speakResponse = async (text) => {
    const isNative = Capacitor.isNativePlatform()
    
    if (isNative) {
      // Use Capacitor native TTS on mobile
      try {
        await TextToSpeech.speak({
          text: text,
          lang: 'en-US',
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient'
        })
      } catch (error) {
        if(import.meta.env.DEV)console.error('TTS error:', error)
      }
    } else {
      // Use Web Speech API on desktop/web
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 1
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  // Generate relevant images based on query
  const getRelevantImages = (query) => {
    const lowerQuery = query.toLowerCase()
    const images = []
    
    if (lowerQuery.includes('workout') || lowerQuery.includes('exercise') || lowerQuery.includes('fitness')) {
      images.push('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop')
      images.push('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop')
    }
    if (lowerQuery.includes('yoga') || lowerQuery.includes('stretch') || lowerQuery.includes('meditation')) {
      images.push('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop')
    }
    if (lowerQuery.includes('food') || lowerQuery.includes('meal') || lowerQuery.includes('nutrition') || lowerQuery.includes('eat')) {
      images.push('https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop')
      images.push('https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop')
    }
    if (lowerQuery.includes('sleep') || lowerQuery.includes('rest') || lowerQuery.includes('recovery')) {
      images.push('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop')
    }
    if (lowerQuery.includes('water') || lowerQuery.includes('hydrat')) {
      images.push('https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop')
    }
    if (lowerQuery.includes('run') || lowerQuery.includes('cardio')) {
      images.push('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop')
    }
    
    return images
  }

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return

    // Check AI message limit
    const limit = subscriptionService.checkLimit('aiMessages');
    if (!limit.allowed) {
      setPaywallFeature('AI Chat');
      setShowPaywall(true);
      return;
    }
    
    const userMessage = userInput
    setUserInput('')
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setIsLoading(true)
    
    try {
      // Get AI response from Gemini
      const aiResponse = await chatWithAI(userMessage, {
        goals: 'General wellness',
        streak: 0,
        recentActivity: 'Just started'
      })
      
      // Get relevant images
      const images = showImages ? getRelevantImages(userMessage) : []
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: aiResponse,
        images: images
      }])
      
      // Auto-speak AI response
      speakResponse(aiResponse)
    } catch (error) {
      const errorMsg = 'I\'m having trouble connecting. Please check your API key and try again!'
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: errorMsg
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2>🤖 AI Personal Coach</h2>
          <p className="subtitle">Get personalized recommendations that adapt to your progress</p>
        </div>
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#f59e0b', 
            color: 'white', 
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {showInstructions ? '✕ Close' : '💡 How to Use'}
        </button>
      </div>

      {showInstructions && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '2px solid #fed7aa'
        }}>
          <h3 style={{ color: '#d97706', marginBottom: '1rem' }}>🎯 AI Coach Features</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>🎤 Voice Input</h4>
            <p style={{ margin: 0, color: '#78350f', lineHeight: '1.6' }}>
              <strong>Click the microphone button</strong> to speak your question instead of typing. 
              Your browser will ask for microphone permission - click "Allow". 
              Speak clearly and the AI will transcribe your voice to text automatically.
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>🔊 Voice Responses</h4>
            <p style={{ margin: 0, color: '#78350f', lineHeight: '1.6' }}>
              AI responses are <strong>automatically read aloud</strong> to you. 
              Perfect for hands-free coaching during workouts! Make sure your device volume is on.
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>📸 Image Analysis</h4>
            <p style={{ margin: 0, color: '#78350f', lineHeight: '1.6' }}>
              Go to the <strong>Progress tab</strong> to upload body photos for AI analysis, 
              or the <strong>Nutrition tab</strong> to scan food photos for instant calorie counting.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>💬 What to Ask</h4>
            <ul style={{ margin: 0, color: '#78350f', lineHeight: '1.8' }}>
              <li>"Create a 30-day workout plan for beginners"</li>
              <li>"What should I eat to gain muscle?"</li>
              <li>"How do I fix my sleep schedule?"</li>
              <li>"Give me a 5-minute meditation guide"</li>
              <li>"What exercises help with back pain?"</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              {msg.text}
              {msg.images && msg.images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1rem'
                }}>
                  {msg.images.map((img, imgIdx) => (
                    <img 
                      key={imgIdx}
                      src={img} 
                      alt={`Reference ${imgIdx + 1}`}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #fed7aa'
                      }}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <span className="typing-indicator">●●●</span>
            </div>
          )}
        </div>
        <div className="chat-input">
          <button 
            onClick={startVoiceInput}
            disabled={isLoading || isListening}
            style={{
              background: isListening ? '#ef4444' : '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem',
              marginRight: '0.5rem',
              minWidth: '50px',
              opacity: isLoading ? 0.5 : 1
            }}
            title="Click to speak"
          >
            {isListening ? '🔴' : '🎤'}
          </button>
          <input
            type="text"
            placeholder="Ask your AI coach anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading}>
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Smart Tracking Tab
function TrackingTab() {
  const [habits, setHabits] = useState([
    { name: 'Morning Exercise', completed: false },
    { name: 'Drink 8 glasses of water', completed: false },
    { name: '8 hours sleep', completed: false },
    { name: 'Healthy meals', completed: false }
  ])

  const toggleHabit = (index) => {
    const newHabits = [...habits]
    newHabits[index].completed = !newHabits[index].completed
    setHabits(newHabits)
  }

  return (
    <div className="tab-content">
      <h2>📊 Smart Tracking</h2>
      <p className="subtitle">Track workouts, meals, sleep, and habits with minimal effort</p>
      
      <div className="tracking-grid">
        <div className="tracking-card">
          <h3>Today's Habits</h3>
          <div className="habit-list">
            {habits.map((habit, idx) => (
              <div key={idx} className="habit-item">
                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={() => toggleHabit(idx)}
                />
                <span className={habit.completed ? 'completed' : ''}>{habit.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="tracking-card">
          <h3>Quick Stats</h3>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">0</span>
              <span className="stat-label">Workouts this week</span>
            </div>
            <div className="stat">
              <span className="stat-value">0</span>
              <span className="stat-label">Meals logged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Progress Photos Tab
function PhotosTab() {
  const [photos, setPhotos] = useState([])
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsAnalyzing(true)
    
    // Create preview URL
    const photoUrl = URL.createObjectURL(file)
    
    try {
      // Get AI analysis from Gemini Vision
      const analysis = await analyzeProgressPhoto(file)
      
      setPhotos(prev => [...prev, {
        url: photoUrl,
        date: new Date().toLocaleDateString(),
        analysis
      }])
      
      setAiAnalysis(analysis)
    } catch (error) {
      setAiAnalysis('Photo uploaded! Keep taking regular photos to track your progress.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="tab-content">
      <h2>📸 Progress Photos</h2>
      <p className="subtitle">Visual tracking with AI-powered body composition analysis</p>
      
      <div className="upload-zone">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="upload-placeholder">
          <span className="upload-icon">📷</span>
          <p>{isAnalyzing ? 'Analyzing with AI...' : 'Click to upload your progress photo'}</p>
          <div className="btn-upload">{isAnalyzing ? 'Processing...' : 'Choose Photo'}</div>
        </label>
      </div>
      
      {aiAnalysis && (
        <div className="ai-analysis-box">
          <h3>🤖 AI Analysis</h3>
          <p>{aiAnalysis}</p>
        </div>
      )}
      
      <div className="photos-grid">
        {photos.length === 0 ? (
          <p className="empty-state">No photos yet. Start tracking your progress today!</p>
        ) : (
          photos.map((photo, idx) => (
            <div key={idx} className="photo-item">
              <img src={photo.url} alt={`Progress ${idx + 1}`} />
              <p className="photo-date">{photo.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Nutrition Tab
function NutritionTab() {
  const [meals, setMeals] = useState([])
  const [foodAnalysis, setFoodAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [totalCalories, setTotalCalories] = useState(0)

  const handleFoodPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsAnalyzing(true)
    
    try {
      // Get AI food analysis from Gemini Vision
      const analysis = await analyzeFoodPhoto(file)
      setFoodAnalysis(analysis)
      
      // Extract calories from analysis (simple regex)
      const caloriesMatch = analysis.match(/(\d+)\s*kcal/i)
      const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 0
      
      setMeals(prev => [...prev, {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis,
        calories
      }])
      
      setTotalCalories(prev => prev + calories)
    } catch (error) {
      setFoodAnalysis('Meal logged! For accurate tracking, try to include variety.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="tab-content">
      <h2>🍎 Nutrition Plans</h2>
      <p className="subtitle">Custom meal plans and recipes tailored to your goals</p>
      
      <div className="nutrition-grid">
        <div className="meal-card">
          <h3>📸 Snap & Log Meals</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFoodPhoto}
            style={{ display: 'none' }}
            id="food-photo"
          />
          <label htmlFor="food-photo" className="food-upload-btn">
            {isAnalyzing ? '🔄 Analyzing...' : '📷 Take Food Photo'}
          </label>
          
          {foodAnalysis && (
            <div className="food-analysis">
              <h4>Latest Meal</h4>
              <pre>{foodAnalysis}</pre>
            </div>
          )}
          
          <div className="meal-list">
            <h4>Today's Meals</h4>
            {meals.length === 0 ? (
              <p className="empty-text">No meals logged yet</p>
            ) : (
              meals.map((meal, idx) => (
                <div key={idx} className="meal-item-logged">
                  <span>{meal.time}</span>
                  <span>{meal.calories} kcal</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="meal-card">
          <h3>Daily Targets</h3>
          <div className="nutrient-bar">
            <label>Calories: {totalCalories} / 2000</label>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${Math.min((totalCalories/2000)*100, 100)}%`}}></div>
            </div>
          </div>
          <div className="nutrient-bar">
            <label>Protein: 0g / 150g</label>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '0%'}}></div>
            </div>
          </div>
          <div className="nutrient-bar">
            <label>Water: 0 / 8 glasses</label>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '0%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Workout Tab
function WorkoutTab() {
  const [aiWorkoutPlan, setAiWorkoutPlan] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePlan = async (type) => {
    setIsGenerating(true)
    try {
      const plan = await generateWorkoutPlan({
        fitnessLevel: 'Beginner',
        goal: type,
        timeAvailable: '30 minutes',
        equipment: 'Bodyweight only'
      })
      setAiWorkoutPlan(plan)
    } catch (error) {
      setAiWorkoutPlan('Workout plan coming right up! Focus on form and consistency.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="tab-content">
      <h2>💪 Workout Programs</h2>
      <p className="subtitle">Personalized exercise routines that evolve with your fitness level</p>
      
      {aiWorkoutPlan && (
        <div className="ai-workout-plan">
          <h3>🤖 Your AI-Generated Workout</h3>
          <pre>{aiWorkoutPlan}</pre>
        </div>
      )}
      
      <div className="workout-grid">
        <div className="workout-card">
          <h3>🏃 Cardio</h3>
          <p>30 min running</p>
          <button className="btn-start" onClick={() => generatePlan('Cardio')} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Get AI Plan'}
          </button>
        </div>
        <div className="workout-card">
          <h3>🏋️ Strength</h3>
          <p>Full body workout</p>
          <button className="btn-start" onClick={() => generatePlan('Strength')} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Get AI Plan'}
          </button>
        </div>
        <div className="workout-card">
          <h3>🧘 Flexibility</h3>
          <p>Yoga & stretching</p>
          <button className="btn-start" onClick={() => generatePlan('Flexibility')} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Get AI Plan'}
          </button>
        </div>
        <div className="workout-card">
          <h3>⚡ HIIT</h3>
          <p>High intensity interval</p>
          <button className="btn-start" onClick={() => generatePlan('HIIT')} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Get AI Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Mental Wellness Tab
function MentalTab() {
  const [mood, setMood] = useState(null)
  const [journal, setJournal] = useState('')

  return (
    <div className="tab-content">
      <h2>🧘 Mental Wellness</h2>
      <p className="subtitle">Mindfulness, stress management, and mood tracking</p>
      
      <div className="mental-grid">
        <div className="mood-card">
          <h3>How are you feeling today?</h3>
          <div className="mood-selector">
            {['😊', '😌', '😐', '😔', '😢'].map((emoji, idx) => (
              <button
                key={idx}
                className={`mood-btn ${mood === emoji ? 'selected' : ''}`}
                onClick={() => setMood(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        
        <div className="journal-card">
          <h3>Gratitude Journal</h3>
          <textarea
            placeholder="What are you grateful for today?"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            rows={5}
          />
          <button className="btn-save">Save Entry</button>
        </div>
        
        <div className="meditation-card">
          <h3>Guided Meditation</h3>
          <div className="meditation-list">
            <button className="meditation-btn">🌅 Morning Meditation (5 min)</button>
            <button className="meditation-btn">😌 Stress Relief (10 min)</button>
            <button className="meditation-btn">😴 Sleep Better (15 min)</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Analytics Tab
function AnalyticsTab() {
  return (
    <div className="tab-content">
      <h2>📈 Analytics Dashboard</h2>
      <p className="subtitle">Visualize your progress with beautiful charts and insights</p>
      
      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Weekly Progress</h3>
          <div className="chart-placeholder">
            <p>📊 Chart coming soon</p>
            <p className="chart-desc">Track your habits, workouts, and wellness metrics over time</p>
          </div>
        </div>
        
        <div className="stats-card">
          <h3>Your Stats</h3>
          <div className="stat-grid">
            <div className="stat-box">
              <span className="stat-number">0</span>
              <span className="stat-text">Day Streak</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">0</span>
              <span className="stat-text">Total Workouts</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">0</span>
              <span className="stat-text">Meals Logged</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">0</span>
              <span className="stat-text">Hours Meditated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reminders Tab
function RemindersTab() {
  const [reminders, setReminders] = useState([
    { time: '07:00 AM', task: 'Morning workout', enabled: true },
    { time: '12:00 PM', task: 'Log lunch', enabled: true },
    { time: '09:00 PM', task: 'Evening meditation', enabled: false }
  ])

  const toggleReminder = (index) => {
    const newReminders = [...reminders]
    newReminders[index].enabled = !newReminders[index].enabled
    setReminders(newReminders)
  }

  return (
    <div className="tab-content">
      <h2>🔔 Smart Reminders</h2>
      <p className="subtitle">Gentle nudges at the right time to keep you on track</p>
      
      <div className="reminders-list">
        {reminders.map((reminder, idx) => (
          <div key={idx} className="reminder-item">
            <div className="reminder-info">
              <span className="reminder-time">{reminder.time}</span>
              <span className="reminder-task">{reminder.task}</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={reminder.enabled}
                onChange={() => toggleReminder(idx)}
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>
      
      <button className="btn-add-reminder">+ Add New Reminder</button>
    </div>
  )

  // Paywall Modal
  const renderPaywall = () => (
    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      featureName={paywallFeature}
      message={subscriptionService.getUpgradeMessage(paywallFeature === 'AI Chat' ? 'aiMessages' : paywallFeature)}
      currentPlan={subscriptionService.getCurrentPlan()}
    />
  )
}



