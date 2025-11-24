import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatWithAI, analyzeProgressPhoto, analyzeFoodPhoto, generateWorkoutPlan, generateMealPlan, getHabitInsights, getMotivationalMessage } from '../services/geminiService'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('habits')
  const [userData, setUserData] = useState({
    streak: 0,
    workouts: 0,
    meals: 0,
    goals: 'General wellness'
  })

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>☀️ Helio</h1>
          <button onClick={() => navigate('/')} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'habits' ? 'active' : ''} 
          onClick={() => setActiveTab('habits')}
        >
          🤖 AI Coach
        </button>
        <button 
          className={activeTab === 'tracking' ? 'active' : ''} 
          onClick={() => setActiveTab('tracking')}
        >
          📊 Tracking
        </button>
        <button 
          className={activeTab === 'photos' ? 'active' : ''} 
          onClick={() => setActiveTab('photos')}
        >
          📸 Progress
        </button>
        <button 
          className={activeTab === 'nutrition' ? 'active' : ''} 
          onClick={() => setActiveTab('nutrition')}
        >
          🍎 Nutrition
        </button>
        <button 
          className={activeTab === 'workout' ? 'active' : ''} 
          onClick={() => setActiveTab('workout')}
        >
          💪 Workouts
        </button>
        <button 
          className={activeTab === 'mental' ? 'active' : ''} 
          onClick={() => setActiveTab('mental')}
        >
          🧘 Mental
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={activeTab === 'reminders' ? 'active' : ''} 
          onClick={() => setActiveTab('reminders')}
        >
          🔔 Reminders
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'habits' && <AICoachTab />}
        {activeTab === 'tracking' && <TrackingTab />}
        {activeTab === 'photos' && <PhotosTab />}
        {activeTab === 'nutrition' && <NutritionTab />}
        {activeTab === 'workout' && <WorkoutTab />}
        {activeTab === 'mental' && <MentalTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'reminders' && <RemindersTab />}
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

  // Voice recognition with auto-send
  const startVoiceInput = async () => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      console.error('Microphone permission denied:', error)
      alert('Microphone access is required for voice input. Please allow microphone access in your browser settings.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setMessages(prev => [...prev, { 
        type: 'system', 
        text: '🎤 Listening... Speak now!' 
      }])
    }
    
    recognition.onend = () => {
      setIsListening(false)
      setMessages(prev => prev.filter(m => m.type !== 'system'))
    }
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
      setUserInput(transcript)
      
      // Remove "listening" message
      setMessages(prev => prev.filter(m => m.type !== 'system'))
      
      // Auto-send the transcribed message
      setMessages(prev => [...prev, { type: 'user', text: transcript }])
      setIsLoading(true)
      
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
        setUserInput('')
      } catch (error) {
        const errorMsg = 'I\'m having trouble connecting. Please check your API key and try again!'
        setMessages(prev => [...prev, { type: 'ai', text: errorMsg }])
      } finally {
        setIsLoading(false)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setMessages(prev => prev.filter(m => m.type !== 'system'))
      
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        alert('Microphone permission denied. Please enable microphone access in your browser settings.')
      } else if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.')
      } else if (event.error === 'network') {
        alert('Network error. Please check your internet connection.')
      } else {
        alert(`Voice input error: ${event.error}. Please try again.`)
      }
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Failed to start recognition:', error)
      alert('Failed to start voice input. Please try again.')
      setIsListening(false)
    }
  }

  // Text to speech for AI responses
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
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
}
