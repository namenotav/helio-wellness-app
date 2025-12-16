import { useState, useEffect } from 'react'
import { usePointsPopup } from './PointsPopup'
import './VoiceTabRedesign.css'

export default function VoiceTabRedesign({ userName, onOpenVoiceChat, onOpenAIAssistant }) {
  const { addPoints, PopupsRenderer } = usePointsPopup()
  const [stats, setStats] = useState({ conversations: 0, minutesTalked: 0, topicsDiscussed: 0 })
  const [recentChats, setRecentChats] = useState([])

  useEffect(() => {
    loadStats()
    loadRecentChats()
  }, [])

  const loadStats = () => {
    const conversations = parseInt(localStorage.getItem('voice_conversations') || '0')
    const minutes = parseInt(localStorage.getItem('voice_minutes') || '0')
    const topics = parseInt(localStorage.getItem('voice_topics') || '0')
    setStats({ conversations, minutesTalked: minutes, topicsDiscussed: topics })
  }

  const loadRecentChats = () => {
    const saved = localStorage.getItem('recent_voice_chats')
    if (saved) {
      setRecentChats(JSON.parse(saved))
    }
  }

  const handleQuickAction = (action) => {
    // Note: XP is now awarded in AIAssistantModal after actual AI conversation
    // This prevents XP farming by just clicking buttons
    
    // Update challenges
    if (window.updateDailyChallenge) {
      window.updateDailyChallenge('voice_chat', 1)
    }

    // Increment stats
    const conversations = parseInt(localStorage.getItem('voice_conversations') || '0')
    localStorage.setItem('voice_conversations', (conversations + 1).toString())
    
    // Open voice chat with context
    if (onOpenVoiceChat) {
      onOpenVoiceChat(action.prompt)
    }
  }

  const quickActions = [
    { icon: '💪', label: 'Workout Coach', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', prompt: 'Help me with a workout plan' },
    { icon: '🍽️', label: 'Meal Guide', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', prompt: 'Give me healthy meal suggestions' },
    { icon: '🧠', label: 'Mental Health', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', prompt: 'I need mental health support' },
    { icon: '😴', label: 'Sleep Tips', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', prompt: 'Help me sleep better' },
    { icon: '🩺', label: 'Check Symptoms', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', prompt: 'I want to check my symptoms' },
    { icon: '❤️', label: 'Ask Health', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', prompt: 'I have a health question' }
  ]

  return (
    <div className="voice-tab-redesign">
      <PopupsRenderer />
      
      {/* Full AI Chat Button */}
      <button className="full-ai-chat-button" onClick={onOpenAIAssistant}>
        <span className="ai-button-icon">💬</span>
        <div className="ai-button-content">
          <span className="ai-button-title">Full AI Chat</span>
          <span className="ai-button-subtitle">Voice & text with AI assistant</span>
        </div>
        <span className="ai-button-arrow">→</span>
      </button>
      
      {/* Stats Overview */}
      <div className="voice-stats-card">
        <h3 className="section-title">🎤 Voice Assistant Stats</h3>
        <div className="stats-grid-top">
          <div className="stat-item">
            <span className="stat-value">{stats.conversations}</span>
            <span className="stat-label">Conversations</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.minutesTalked}</span>
            <span className="stat-label">Minutes Talked</span>
          </div>
        </div>
        <div className="stat-item-full">
          <span className="stat-value">{stats.topicsDiscussed}</span>
          <span className="stat-label">Topics Discussed</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="voice-action-button"
              style={{ background: action.gradient }}
              onClick={() => handleQuickAction(action)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      {recentChats.length > 0 && (
        <div className="recent-chats-section">
          <h3 className="section-title">Recent Conversations</h3>
          <div className="recent-chats-list">
            {recentChats.slice(0, 5).map((chat, idx) => (
              <div key={idx} className="chat-item">
                <span className="chat-icon">💬</span>
                <div className="chat-content">
                  <span className="chat-topic">{chat.topic}</span>
                  <span className="chat-time">{chat.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
