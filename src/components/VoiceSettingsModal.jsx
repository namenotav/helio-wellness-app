import { useState, useEffect } from 'react';
import voicePreferencesService from '../services/voicePreferencesService';
import directAudioService from '../services/directAudioService';
import './VoiceSettingsModal.css';

export default function VoiceSettingsModal({ onClose }) {
  const [gender, setGender] = useState('female');
  const [speed, setSpeed] = useState(1.0);
  const [profile, setProfile] = useState('auto');

  useEffect(() => {
    const prefs = voicePreferencesService.getPreferences();
    setGender(prefs.gender);
    setSpeed(prefs.speed);
    setProfile(prefs.profile);
  }, []);

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    voicePreferencesService.setGender(newGender);
    directAudioService.setVoice(newGender);
    
    // Preview voice
    directAudioService.speak(
      newGender === 'female' 
        ? 'Hi, I\'m your female AI coach' 
        : 'Hi, I\'m your male AI coach'
    );
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    voicePreferencesService.setSpeed(newSpeed);
    directAudioService.setSpeed(newSpeed);
  };

  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
    voicePreferencesService.setProfile(newProfile);
  };

  const testVoice = () => {
    directAudioService.speak('This is a voice preview at your current settings');
  };

  const resetSettings = () => {
    voicePreferencesService.reset();
    const defaults = voicePreferencesService.getPreferences();
    setGender(defaults.gender);
    setSpeed(defaults.speed);
    setProfile(defaults.profile);
    directAudioService.setVoice(defaults.gender);
    directAudioService.setSpeed(defaults.speed);
    
    // Notify user
    directAudioService.speak('Voice settings have been reset to defaults');
  };

  return (
    <div className="voice-settings-modal-overlay" onClick={onClose}>
      <div className="voice-settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="voice-settings-close" onClick={onClose}>×</button>
        
        <h2>🎤 Voice Settings</h2>
        <p className="voice-settings-subtitle">Customize your AI coach's voice</p>

        {/* Gender Control */}
        <div className="voice-setting-section">
          <h3>Voice Gender</h3>
          <div className="gender-toggle">
            <button 
              className={gender === 'female' ? 'gender-btn active' : 'gender-btn'}
              onClick={() => handleGenderChange('female')}
            >
              👩 Female
            </button>
            <button 
              className={gender === 'male' ? 'gender-btn active' : 'gender-btn'}
              onClick={() => handleGenderChange('male')}
            >
              👨 Male
            </button>
          </div>
        </div>

        {/* Speed Control */}
        <div className="voice-setting-section">
          <h3>Voice Speed: {speed.toFixed(1)}x</h3>
          <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="speed-slider"
          />
          <div className="speed-labels">
            <span>0.5x Slower</span>
            <span>1.0x Normal</span>
            <span>2.0x Faster</span>
          </div>
        </div>

        {/* Voice Profile */}
        <div className="voice-setting-section">
          <h3>Voice Profile</h3>
          <select 
            value={profile} 
            onChange={(e) => handleProfileChange(e.target.value)}
            className="profile-select"
          >
            <option value="auto">🤖 Auto (Context-Based)</option>
            <option value="manual">✋ Manual (Use My Settings)</option>
            <option value="calm">😌 Always Calm (Female, Slow)</option>
            <option value="energetic">⚡ Always Energetic (Male, Fast)</option>
          </select>
          
          {profile === 'auto' && (
            <div className="profile-info">
              <p>✨ AI automatically selects voice based on activity:</p>
              <ul>
                <li>🧘 Breathing/Meditation → Calm female</li>
                <li>💪 Workouts → Energetic male</li>
                <li>💬 AI Chat → Natural female</li>
                <li>😌 Stress Relief → Calm female</li>
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="voice-settings-actions">
          <button className="test-voice-btn" onClick={testVoice}>
            🔊 Test Voice
          </button>
          
          <button className="reset-voice-btn" onClick={resetSettings}>
            🔄 Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
