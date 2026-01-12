import { useState, useEffect } from 'react'
import { Preferences } from '@capacitor/preferences'
import gamificationService from '../services/gamificationService'

export default function GratitudeJournalModal({ onClose }) {
  const [view, setView] = useState('list') // 'list' or 'write' or 'view'
  const [entries, setEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [prompts] = useState([
    '🌟 What made you smile today?',
    '💝 Who are you thankful for right now?',
    '🎯 What achievement are you proud of?',
    '🌈 What brought you joy recently?',
    '💪 What strength did you discover in yourself?',
    '🙏 What simple pleasure are you grateful for?',
    '✨ What opportunity came your way?',
    '❤️ What act of kindness touched you?'
  ])
  const [currentPrompt, setCurrentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)])

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    // 🔥 FIX: Read from Preferences first (survives reinstall), localStorage fallback
    let saved = null
    try {
      const { value: prefsVal } = await Preferences.get({ key: 'wellnessai_gratitude' })
      saved = prefsVal || localStorage.getItem('wellnessai_gratitude')
    } catch (e) {
      saved = localStorage.getItem('wellnessai_gratitude')
    }
    if (saved) {
      const parsed = JSON.parse(saved)
      setEntries(parsed)
      // Sync to localStorage for backwards compatibility
      localStorage.setItem('wellnessai_gratitude', saved)
    }
  }

  const saveEntry = async () => {
    if (!currentEntry.trim()) return

    const newEntry = {
      id: Date.now(),
      text: currentEntry,
      date: new Date().toISOString(),
      prompt: currentPrompt
    }

    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    // 🔥 FIX: Write to BOTH Preferences (survives reinstall) and localStorage (backwards compat)
    const entriesJson = JSON.stringify(updatedEntries)
    await Preferences.set({ key: 'wellnessai_gratitude', value: entriesJson })
    localStorage.setItem('wellnessai_gratitude', entriesJson)

    // Award XP
    gamificationService.addXP(10, 'Gratitude Entry')

    // 🧠 BRAIN.JS: Track gratitude journaling improves mood
    try {
      const brainLearningService = (await import('../services/brainLearningService')).default;
      
      // Gratitude journaling strongly improves mood (8 = very good mood)
      await brainLearningService.trackMood(8, {
        triggers: ['gratitude_journal', currentPrompt],
        activities: ['journaling', 'reflection', 'gratitude'],
        socialInteraction: false,
        sleepQuality: 7,
        exerciseToday: false,
        weather: 'indoor'
      });
      
      // Gratitude reduces stress (3 = low-moderate stress)
      await brainLearningService.trackStress(3, {
        workRelated: false,
        personalRelated: false,
        copingMechanism: 'gratitude_journaling',
        duration: 5,
        resolved: true
      });
      
      if(import.meta.env.DEV)console.log('🧠 [BRAIN.JS] Gratitude journal entry tracked for AI learning');
    } catch (error) {
      console.error('❌ [BRAIN.JS] Failed to track gratitude journal:', error);
    }

    setCurrentEntry('')
    setView('list')
    
    // Show success feedback
    alert('✨ Gratitude entry saved! +10 XP')
  }

  const deleteEntry = async (id) => {
    const updatedEntries = entries.filter(e => e.id !== id)
    setEntries(updatedEntries)
    // 🔥 FIX: Write to BOTH Preferences and localStorage
    const entriesJson = JSON.stringify(updatedEntries)
    await Preferences.set({ key: 'wellnessai_gratitude', value: entriesJson })
    localStorage.setItem('wellnessai_gratitude', entriesJson)
    setSelectedEntry(null)
  }

  const formatDate = (isoDate) => {
    const date = new Date(isoDate)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    }
  }

  // List View
  if (view === 'list') {
    return (
      <div className="modal-overlay" onClick={onClose} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '25px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 184, 77, 0.3)'
        }}>
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{color: 'white', fontSize: '28px', margin: 0}}>
              📝 Gratitude Journal
            </h2>
            <button onClick={onClose} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}>×</button>
          </div>

          <p style={{color: '#888', marginBottom: '20px', fontSize: '14px'}}>
            Daily gratitude practice improves mental health and happiness. Write what you're thankful for and earn XP!
          </p>

          {/* New Entry Button */}
          <button onClick={() => setView('write')} style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #FFB84D, #FF9500)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '25px',
            boxShadow: '0 5px 20px rgba(255, 184, 77, 0.4)'
          }}>
            ✍️ Write New Entry (+10 XP)
          </button>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{
              background: 'rgba(255, 184, 77, 0.1)',
              border: '1px solid rgba(255, 184, 77, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: '#FFD700'}}>{entries.length}</div>
              <div style={{fontSize: '12px', color: '#888'}}>Total Entries</div>
            </div>
            <div style={{
              background: 'rgba(255, 184, 77, 0.1)',
              border: '1px solid rgba(255, 184, 77, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: '#FFD700'}}>{entries.length * 10}</div>
              <div style={{fontSize: '12px', color: '#888'}}>XP Earned</div>
            </div>
          </div>

          {/* Entries List */}
          {entries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#888'
            }}>
              <div style={{fontSize: '64px', marginBottom: '15px'}}>🌟</div>
              <p style={{fontSize: '16px'}}>No entries yet</p>
              <p style={{fontSize: '13px'}}>Start your gratitude journey today!</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <h3 style={{color: 'white', fontSize: '18px', marginBottom: '10px'}}>Your Gratitude Entries</h3>
              {entries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setSelectedEntry(entry)
                    setView('view')
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '15px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 184, 77, 0.1)'
                    e.currentTarget.style.borderColor = '#FFB84D'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{color: '#FFB84D', fontSize: '11px', marginBottom: '8px'}}>
                    {formatDate(entry.date)}
                  </div>
                  <div style={{
                    color: 'white',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {entry.text}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Write View
  if (view === 'write') {
    return (
      <div className="modal-overlay" onClick={onClose} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '25px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 184, 77, 0.3)'
        }}>
          {/* Header */}
          <button onClick={() => setView('list')} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}>
            ← Back
          </button>

          <div style={{textAlign: 'center', marginBottom: '25px'}}>
            <span style={{fontSize: '60px'}}>🙏</span>
            <h2 style={{color: 'white', fontSize: '24px', margin: '10px 0'}}>What are you grateful for?</h2>
          </div>

          {/* Prompt */}
          <div style={{
            background: 'rgba(255, 184, 77, 0.1)',
            border: '1px solid rgba(255, 184, 77, 0.3)',
            borderRadius: '15px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{color: '#FFD700', fontSize: '16px', fontWeight: 'bold'}}>
              {currentPrompt}
            </div>
            <button onClick={() => setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)])} style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '8px'
            }}>
              🔄 Different prompt
            </button>
          </div>

          {/* Text Area */}
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Write what you're grateful for... Be specific and heartfelt. How does this make you feel?"
            style={{
              width: '100%',
              minHeight: '200px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '15px',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '20px'
            }}
            autoFocus
          />

          {/* Character Count */}
          <div style={{textAlign: 'right', color: '#888', fontSize: '12px', marginBottom: '20px'}}>
            {currentEntry.length} characters
          </div>

          {/* Save Button */}
          <button onClick={saveEntry} disabled={!currentEntry.trim()} style={{
            width: '100%',
            padding: '18px',
            background: currentEntry.trim() ? 'linear-gradient(135deg, #FFB84D, #FF9500)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: currentEntry.trim() ? 'pointer' : 'not-allowed',
            opacity: currentEntry.trim() ? 1 : 0.5,
            boxShadow: currentEntry.trim() ? '0 5px 20px rgba(255, 184, 77, 0.4)' : 'none'
          }}>
            💾 Save Entry & Earn +10 XP
          </button>
        </div>
      </div>
    )
  }

  // View Entry
  if (view === 'view' && selectedEntry) {
    return (
      <div className="modal-overlay" onClick={onClose} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '25px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 184, 77, 0.3)'
        }}>
          {/* Header */}
          <button onClick={() => setView('list')} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}>
            ← Back
          </button>

          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <span style={{fontSize: '60px'}}>✨</span>
          </div>

          {/* Date */}
          <div style={{
            color: '#FFB84D',
            fontSize: '13px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {formatDate(selectedEntry.date)}
          </div>

          {/* Prompt */}
          {selectedEntry.prompt && (
            <div style={{
              background: 'rgba(255, 184, 77, 0.1)',
              border: '1px solid rgba(255, 184, 77, 0.3)',
              borderRadius: '15px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              color: '#FFD700',
              fontSize: '14px'
            }}>
              {selectedEntry.prompt}
            </div>
          )}

          {/* Entry Text */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: 'white',
              fontSize: '16px',
              lineHeight: '1.7',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {selectedEntry.text}
            </p>
          </div>

          {/* Delete Button */}
          <button onClick={() => {
            if (confirm('Are you sure you want to delete this entry?')) {
              deleteEntry(selectedEntry.id)
              setView('list')
            }
          }} style={{
            width: '100%',
            padding: '15px',
            background: 'rgba(255, 68, 68, 0.2)',
            border: '1px solid rgba(255, 68, 68, 0.5)',
            borderRadius: '12px',
            color: '#FF6B6B',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            🗑️ Delete Entry
          </button>
        </div>
      </div>
    )
  }
}



