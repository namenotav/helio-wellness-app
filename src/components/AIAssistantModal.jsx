import { useState, useEffect, useRef } from 'react'
import { Preferences } from '@capacitor/preferences'
import './AIAssistantModal.css'

// Main AI Assistant Modal - Full Voice Chat Functionality
function AIAssistantModal({ userName, initialPrompt, onClose }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isTextMode, setIsTextMode] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'ai', text: `Hey ${userName}! I'm here to help. What's on your mind?` }
  ])
  
  // Voice stats tracking
  const [conversationStartTime] = useState(Date.now())
  const [conversationTopic, setConversationTopic] = useState(null)
  const [hasTrackedConversation, setHasTrackedConversation] = useState(false)
  
  // Refs to access latest state in cleanup function
  const conversationTopicRef = useRef(null)
  const hasTrackedConversationRef = useRef(false)
  const messagesRef = useRef([])
  
  // Keep refs in sync with state
  useEffect(() => {
    conversationTopicRef.current = conversationTopic
  }, [conversationTopic])
  
  useEffect(() => {
    hasTrackedConversationRef.current = hasTrackedConversation
  }, [hasTrackedConversation])
  
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Auto-process initial prompt if provided (from Quick Actions)
  useEffect(() => {
    if (initialPrompt) {
      // Small delay to let modal render
      setTimeout(() => {
        processUserMessage(initialPrompt, true)
      }, 300)
    }
  }, [initialPrompt])
  
  // Save conversation stats on unmount (when modal closes)
  // 🔥 FIX: Use Preferences (Capacitor native storage) instead of localStorage
  useEffect(() => {
    return () => {
      // Only save if conversation actually happened
      if (hasTrackedConversationRef.current && conversationTopicRef.current) {
        // Calculate duration in minutes
        const durationMs = Date.now() - conversationStartTime
        const durationMinutes = Math.ceil(durationMs / 60000) // Round up to nearest minute
        
        const chatEntry = {
          topic: conversationTopicRef.current,
          duration: durationMinutes,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
          messages: messagesRef.current.length
        }
        
        // Run async save without blocking unmount
        ;(async () => {
          try {
            // Update total minutes - Preferences (persists across reinstalls)
            const { value: minutesStr } = await Preferences.get({ key: 'voice_minutes' })
            const totalMinutes = parseInt(minutesStr || '0')
            await Preferences.set({ key: 'voice_minutes', value: (totalMinutes + durationMinutes).toString() })
            
            // Update topics count - Preferences
            const { value: topicsStr } = await Preferences.get({ key: 'voice_topics' })
            const topicsCount = parseInt(topicsStr || '0')
            await Preferences.set({ key: 'voice_topics', value: (topicsCount + 1).toString() })
            
            // Save to recent chats history - Preferences
            const { value: recentChatsStr } = await Preferences.get({ key: 'recent_voice_chats' })
            const recentChats = recentChatsStr ? JSON.parse(recentChatsStr) : []
            
            // Keep last 50 chats
            recentChats.unshift(chatEntry)
            if (recentChats.length > 50) recentChats.pop()
            await Preferences.set({ key: 'recent_voice_chats', value: JSON.stringify(recentChats) })
            
            if(import.meta.env.DEV)console.log('📊 Voice stats saved to Preferences:', {
              duration: durationMinutes,
              topic: conversationTopicRef.current,
              totalMinutes: totalMinutes + durationMinutes,
              totalTopics: topicsCount + 1
            })
            
            // ✅ Sync conversation history to Firebase (survives uninstall)
            const { default: firestoreService } = await import('../services/firestoreService')
            const { default: authService } = await import('../services/authService')
            const userId = authService.getCurrentUser()?.uid
            
            if (userId) {
              // Load existing chat history from Firestore
              const existingChats = await firestoreService.get('aiChatHistory', userId) || []
              
              // Add new chat entry
              existingChats.unshift(chatEntry)
              
              // Keep last 100 chats in cloud (more than local for data analysis)
              if (existingChats.length > 100) existingChats.pop()
              
              // Save to Firestore (non-blocking)
              firestoreService.save('aiChatHistory', existingChats, userId)
                .then(() => console.log('☁️ aiChatHistory synced to Firestore (background)'))
                .catch(err => console.warn('⚠️ aiChatHistory sync failed:', err));
              
              // Also sync voice stats to Firestore for cross-device (non-blocking)
              firestoreService.save('voiceStats', {
                totalMinutes: totalMinutes + durationMinutes,
                totalTopics: topicsCount + 1,
                lastUpdated: Date.now()
              }, userId)
                .then(() => console.log('☁️ voiceStats synced to Firestore (background)'))
                .catch(err => console.warn('⚠️ voiceStats sync failed:', err));
            }
          } catch (error) {
            if(import.meta.env.DEV)console.warn('Failed to save voice stats:', error)
          }
        })()
      }
    }
  }, [hasTrackedConversation, conversationTopic, conversationStartTime, messages])

  const startListening = async () => {
    setIsListening(true)
    
    try {
      // Try Web Speech API first (works better on some devices)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        if(import.meta.env.DEV)console.log('Using Web Speech API')
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          if(import.meta.env.DEV)console.log('Web Speech result:', transcript)
          setIsListening(false)
          processUserMessage(transcript)
        }
        
        recognition.onerror = (event) => {
          if(import.meta.env.DEV)console.error('Web Speech error:', event.error)
          setIsListening(false)
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: "I couldn't hear you. Try typing instead!" 
          }])
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognition.start()
        return
      }
      
      // Fallback to Capacitor plugin
      if(import.meta.env.DEV)console.log('Trying Capacitor Speech Recognition plugin')
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
      
      // Check if available first
      try {
        const availCheck = await SpeechRecognition.available()
        if(import.meta.env.DEV)console.log('Speech recognition available:', availCheck)
        
        if (!availCheck.available) {
          throw new Error('Speech recognition not available')
        }
      } catch (availError) {
        if(import.meta.env.DEV)console.error('Availability check failed:', availError)
        throw new Error('Speech not supported')
      }

      // Request permissions
      try {
        const permResult = await SpeechRecognition.requestPermissions()
        if(import.meta.env.DEV)console.log('Permission result:', permResult)
        
        if (permResult.speechRecognition !== 'granted') {
          alert('Please allow microphone access in your phone settings')
          setIsListening(false)
          return
        }
      } catch (permError) {
        if(import.meta.env.DEV)console.error('Permission request failed:', permError)
        alert('Microphone permission required. Please enable it in Settings.')
        setIsListening(false)
        return
      }

      // Clean up any previous listeners
      try {
        await SpeechRecognition.removeAllListeners()
      } catch (e) {
        if(import.meta.env.DEV)console.log('No listeners to remove')
      }

      let hasReceivedResult = false

      // Add error listener
      SpeechRecognition.addListener('error', (error) => {
        if(import.meta.env.DEV)console.error('Speech recognition error event:', error)
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
        if(import.meta.env.DEV)console.log('Speech result received:', data)
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
            if(import.meta.env.DEV)console.log('Stop error:', e)
          }
          
          // Process with AI in voice mode
          setIsTextMode(false)
          try {
            const geminiService = (await import('../services/geminiService')).default
            // 🔥 FIX: Read from Preferences first
            let user = {};
            try {
              const { Preferences } = await import('@capacitor/preferences');
              const { value: prefsUser } = await Preferences.get({ key: 'wellnessai_user' });
              user = prefsUser ? JSON.parse(prefsUser) : JSON.parse(localStorage.getItem('wellnessai_user') || '{}');
            } catch (e) {
              user = JSON.parse(localStorage.getItem('wellnessai_user') || '{}');
            }
            
            const response = await geminiService.chat(userText, {
              allergens: user.profile?.allergens || [],
              dietaryPreferences: user.profile?.dietaryPreferences || [],
              healthGoals: user.profile?.healthGoals || []
            })
            
            // Add AI response
            setMessages(prev => [...prev, { type: 'ai', text: response }])
            
            // Speak the response (voice mode)
            await speakText(response)
          } catch (error) {
            if(import.meta.env.DEV)console.error('AI error:', error)
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

      // Start listening
      if(import.meta.env.DEV)console.log('Starting speech recognition...')
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 5,
        prompt: 'Speak now',
        partialResults: false,
        popup: true
      })
      
      if(import.meta.env.DEV)console.log('Speech recognition started successfully')

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
            if(import.meta.env.DEV)console.log('Auto-stop error:', e)
          }
          setIsListening(false)
        }
      }, 10000)

    } catch (error) {
      if(import.meta.env.DEV)console.error('Speech recognition setup error:', error)
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
      if(import.meta.env.DEV)console.error('Error stopping speech:', error)
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
      if(import.meta.env.DEV)console.error('Text-to-speech error:', error)
      setIsSpeaking(false)
    }
  }

  const processUserMessage = async (userText, skipVoice = false) => {
    // Check if developer mode is active - bypass all limits
    // 🔥 FIX: Read from Preferences first for dev mode check
    let isDevMode = localStorage.getItem('helio_dev_mode') === 'true';
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value: prefsDevMode } = await Preferences.get({ key: 'wellnessai_helio_dev_mode' });
      if (prefsDevMode === 'true') isDevMode = true;
    } catch (e) { /* localStorage fallback already done */ }
    
    // CHECK AI MESSAGE LIMIT (skip if dev mode)
    if (!isDevMode) {
      const limit = window.subscriptionService?.checkLimit('aiMessages')
      if (limit && !limit.allowed) {
        // BLOCK user from sending message
        setMessages(prev => [...prev, 
          { type: 'user', text: userText },
          { 
            type: 'ai', 
            text: `🔒 Daily AI Message Limit Reached!\n\nYou've used all ${limit.limit} free messages today.\n\nUpgrade to continue chatting:\n💪 Starter £6.99/mo - Unlimited AI chat\n⭐ Premium £16.99/mo - 50 messages/day + DNA + Avatar\n\nYour limit resets at midnight! 🌙` 
          }
        ])
        setIsProcessing(false)
        // Stop processing immediately - do not call AI
        return
      }
    } else {
      if(import.meta.env.DEV)console.log('🔓 Developer mode active - unlimited AI messages')
    }

    setMessages(prev => [...prev, { type: 'user', text: userText }])
    setIsProcessing(true)
    
    try {
      if(import.meta.env.DEV)console.log('Processing user message:', userText)
      const geminiService = (await import('../services/geminiService')).default
      if(import.meta.env.DEV)console.log('Gemini service loaded')
      
      // 🔥 FIX: Read from Preferences first
      let user = {};
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value: prefsUser } = await Preferences.get({ key: 'wellnessai_user' });
        user = prefsUser ? JSON.parse(prefsUser) : JSON.parse(localStorage.getItem('wellnessai_user') || '{}');
      } catch (e) {
        user = JSON.parse(localStorage.getItem('wellnessai_user') || '{}');
      }
      if(import.meta.env.DEV)console.log('User context loaded')
      
      const response = await geminiService.chat(userText, {
        allergens: user.profile?.allergens || [],
        dietaryPreferences: user.profile?.dietaryPreferences || [],
        healthGoals: user.profile?.healthGoals || []
      })
      
      if(import.meta.env.DEV)console.log('Got AI response:', response)
      setMessages(prev => [...prev, { type: 'ai', text: response }])
      
      // TRACK VOICE STATS - Increment conversation count (only once per session)
      // 🔥 FIX: Use Preferences instead of localStorage for Capacitor persistence
      if (!hasTrackedConversation) {
        ;(async () => {
          try {
            const { value: conversationsStr } = await Preferences.get({ key: 'voice_conversations' })
            const conversations = parseInt(conversationsStr || '0')
            await Preferences.set({ key: 'voice_conversations', value: (conversations + 1).toString() })
            if(import.meta.env.DEV)console.log('📊 Voice stats: Conversation count updated to', conversations + 1)
          } catch (error) {
            if(import.meta.env.DEV)console.warn('Failed to save conversation count:', error)
          }
        })()
        setHasTrackedConversation(true)
        
        // AWARD XP - Only after actual AI conversation (prevents button spam farming)
        if (window.addPoints) {
          window.addPoints(15, { x: window.innerWidth / 2, y: 100 })
          if(import.meta.env.DEV)console.log('✨ +15 XP awarded for AI conversation')
        }
        
        if(import.meta.env.DEV)console.log('📊 Voice stats: Conversation tracked')
      }
      
      // TRACK TOPIC - Save first user message as conversation topic
      if (!conversationTopic) {
        const topic = userText.length > 50 ? userText.substring(0, 50) + '...' : userText
        setConversationTopic(topic)
        if(import.meta.env.DEV)console.log('📊 Voice stats: Topic saved:', topic)
      }
      
      // INCREMENT USAGE COUNT (only if not dev mode)
      if (!isDevMode && window.subscriptionService) {
        window.subscriptionService.incrementUsage('aiMessages')
        const newLimit = window.subscriptionService.checkLimit('aiMessages')
        if(import.meta.env.DEV)console.log(`✅ AI message used. Remaining: ${newLimit.remaining}/${newLimit.limit}`)
      }
      
      // Speak the response ONLY if not in text-only mode
      if (!skipVoice) {
        await speakText(response)
      } else {
        if(import.meta.env.DEV)console.log('📝 Text-only mode - skipping voice output')
      }
      
    } catch (error) {
      if(import.meta.env.DEV)console.error('Processing error:', error)
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: "There was an error. Please check your internet connection and try again." 
      }])
      await speakText("There was an error. Please check your internet connection and try again.")
    }
    
    setIsProcessing(false)
  }

  const handleSuggestionClick = (text) => {
    setIsTextMode(false)
    processUserMessage(text, false)
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      setIsTextMode(true)
      processUserMessage(textInput, true)
      setTextInput('')
    }
  }

  return (
    <div className="ai-assistant-modal-overlay" onClick={onClose}>
      <div className="ai-assistant-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="ai-assistant-modal-close" onClick={onClose}>×</button>
        
        <div className="ai-assistant-header">
          <h2>💬 AI Voice Coach</h2>
          <p>Just talk to me like a friend</p>
          {(() => {
            // 🔥 FIX: Check dev mode from Preferences too (sync read for UI)
            const isDevMode = localStorage.getItem('helio_dev_mode') === 'true';
            if (isDevMode) return null;
            
            const limit = window.subscriptionService?.checkLimit('aiMessages');
            if (limit && !window.subscriptionService?.hasAccess('aiVoiceCoach')) {
              return (
                <div className="ai-assistant-limit-badge" style={{
                  background: limit.remaining <= 1 ? 'rgba(255, 68, 68, 0.2)' : 'rgba(139, 95, 232, 0.2)',
                  color: limit.remaining <= 1 ? '#FF4444' : '#C084FC',
                  border: `2px solid ${limit.remaining <= 1 ? '#FF4444' : 'rgba(139, 95, 232, 0.4)'}`
                }}>
                  {limit.remaining > 0 ? (
                    <>💬 {limit.remaining}/{limit.limit} messages left today</>
                  ) : (
                    <>🔒 Daily limit reached - Upgrade for unlimited!</>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>

        <div className="ai-assistant-messages">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`ai-assistant-message ${msg.type}`}
              onClick={() => msg.type === 'ai' && speakText(msg.text)}
              title={msg.type === 'ai' ? 'Click to hear again' : ''}
            >
              <span className="message-icon">{msg.type === 'ai' ? '✨' : '👤'}</span>
              <p>{msg.text}</p>
            </div>
          ))}
          {isProcessing && (
            <div className="ai-assistant-message ai loading-message">
              <span className="message-icon">✨</span>
              <p>
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                Thinking...
              </p>
            </div>
          )}
        </div>

        <button 
          className={`ai-assistant-voice-button ${isListening ? 'listening' : ''}`}
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

        <form className="ai-assistant-text-input" onSubmit={handleTextSubmit}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your message..."
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

        <div className="ai-assistant-suggestions">
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
    </div>
  )
}

export default AIAssistantModal
