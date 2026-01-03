import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './AvatarGenerator.css';

// SECURITY NOTE: Uses direct Gemini API for instant avatar generation
// Protected by monthly key rotation strategy

const AvatarGenerator = ({ user, userData, planType }) => {
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [futureAvatars, setFutureAvatars] = useState({
    day30: '',
    day60: '',
    day90: ''
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [daysUntilUpdate, setDaysUntilUpdate] = useState(0);

  const canUpdateUnlimited = planType === 'premium' || planType === 'ultimate';

  useEffect(() => {
    loadLastUpdate();
  }, []);

  const loadLastUpdate = () => {
    const stored = localStorage.getItem(`avatar_${user?.uid}_lastUpdate`);
    if (stored) {
      const updateTime = new Date(stored);
      setLastUpdate(updateTime);
      
      if (!canUpdateUnlimited) {
        const daysSince = (Date.now() - updateTime.getTime()) / (1000 * 60 * 60 * 24);
        const daysLeft = Math.max(0, 7 - Math.floor(daysSince));
        setDaysUntilUpdate(daysLeft);
      }
    }

    // Load cached avatars
    const cached = localStorage.getItem(`avatar_${user?.uid}_data`);
    if (cached) {
      const avatarData = JSON.parse(cached);
      setCurrentAvatar(avatarData.current);
      setFutureAvatars(avatarData.future);
    }
  };

  const canUpdate = () => {
    if (canUpdateUnlimited) return true;
    
    if (!lastUpdate) return true;
    
    const daysSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
  };

  const generateAvatar = async () => {
    if (!canUpdate()) {
      alert(`You can update avatar once per week on Starter plan. Next update in ${daysUntilUpdate} days. Upgrade to Premium for unlimited updates!`);
      return;
    }

    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Generate current avatar
      const currentPrompt = `
        Generate a brief, realistic physical description (2-3 sentences) for a person with these stats:
        - Age: ${userData.age || 30}
        - Gender: ${userData.gender || 'unspecified'}
        - Height: ${userData.height || 170}cm
        - Weight: ${userData.weight || 70}kg
        - Body fat: ${userData.bodyFat || 20}%
        - Activity level: ${userData.activityLevel || 'moderate'}
        
        Focus on overall appearance, body composition, and fitness level. Be encouraging and objective.
      `;

      const currentResult = await model.generateContent(currentPrompt);
      const currentText = currentResult.response.text();
      setCurrentAvatar(currentText);

      // Generate future predictions
      const targetWeight = userData.goalWeight || userData.weight - 5;
      const weeklyChange = Math.abs(targetWeight - userData.weight) / 12; // 12 weeks = 3 months

      const future30Prompt = `
        Current: ${userData.weight}kg, ${userData.bodyFat}% body fat
        Goal: ${targetWeight}kg
        Progress in 30 days: Lost/gained ${weeklyChange * 4}kg
        Exercise: ${userData.weeklyWorkouts || 3} times/week
        
        Describe their predicted appearance in 30 days in 2 sentences. Be realistic and motivating.
      `;

      const future60Prompt = `
        Current: ${userData.weight}kg
        Goal: ${targetWeight}kg
        Progress in 60 days: Lost/gained ${weeklyChange * 8}kg
        
        Describe appearance in 60 days in 2 sentences. Show clear progress.
      `;

      const future90Prompt = `
        Starting: ${userData.weight}kg
        Goal achieved: ${targetWeight}kg
        After 90 days of consistent effort
        
        Describe final transformation in 2 sentences. Celebrate the achievement!
      `;

      const [future30Result, future60Result, future90Result] = await Promise.all([
        model.generateContent(future30Prompt),
        model.generateContent(future60Prompt),
        model.generateContent(future90Prompt)
      ]);

      const futureData = {
        day30: future30Result.response.text(),
        day60: future60Result.response.text(),
        day90: future90Result.response.text()
      };

      setFutureAvatars(futureData);

      // Cache the results
      const avatarData = {
        current: currentText,
        future: futureData,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`avatar_${user?.uid}_data`, JSON.stringify(avatarData));
      localStorage.setItem(`avatar_${user?.uid}_lastUpdate`, new Date().toISOString());
      
      setLastUpdate(new Date());
      setDaysUntilUpdate(7);

    } catch (error) {
      console.error('Error generating avatar:', error);
      alert('Failed to generate avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData.weight || !userData.height) {
    return (
      <div style={{
        padding: '30px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🧑‍🦲</div>
        <h3 style={{ fontSize: '24px', marginBottom: '10px', color: 'white' }}>Health Avatar</h3>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
          Complete your profile (weight, height, age) to generate your health avatar and future predictions!
        </p>
      </div>
    );
  }

  return (
    <div className="avatar-generator" style={{
      padding: '30px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', color: 'white', margin: 0 }}>
          🧑‍🦲 Health Avatar & Predictions
        </h3>
        <button
          onClick={generateAvatar}
          disabled={loading || (!canUpdateUnlimited && !canUpdate())}
          style={{
            padding: '12px 24px',
            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: loading || (!canUpdateUnlimited && !canUpdate()) ? 'not-allowed' : 'pointer',
            opacity: loading || (!canUpdateUnlimited && !canUpdate()) ? 0.5 : 1
          }}
        >
          {loading ? '⏳ Generating...' : canUpdateUnlimited ? '🔄 Update Avatar' : `🔄 Update (${daysUntilUpdate}d)`}
        </button>
      </div>

      {!canUpdateUnlimited && (
        <div style={{
          padding: '15px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.9)'
        }}>
          💡 <strong>Starter Plan:</strong> Avatar updates once per week. 
          {canUpdateUnlimited ? '' : ` Next update in ${daysUntilUpdate} days.`}
          <a href="/#pricing" style={{ color: '#f59e0b', marginLeft: '10px', fontWeight: 'bold' }}>
            Upgrade for unlimited updates →
          </a>
        </div>
      )}

      {/* Current Avatar */}
      {currentAvatar && (
        <div style={{
          padding: '25px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ fontSize: '20px', marginBottom: '15px', color: '#8b5cf6', fontWeight: 'bold' }}>
            📸 Your Current Body
          </h4>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            {currentAvatar}
          </p>
          {lastUpdate && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>
              Last updated: {lastUpdate.toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Future Predictions */}
      {futureAvatars.day30 && (
        <div>
          <h4 style={{ fontSize: '20px', marginBottom: '15px', color: 'white', fontWeight: 'bold' }}>
            🔮 Future Predictions
          </h4>

          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{
              padding: '20px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
                📅 30 Days
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                {futureAvatars.day30}
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
                📅 60 Days
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                {futureAvatars.day60}
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '10px' }}>
                📅 90 Days
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                {futureAvatars.day90}
              </p>
            </div>
          </div>
        </div>
      )}

      {!currentAvatar && !loading && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.6)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            Click "Update Avatar" to see your current body analysis and future predictions!
          </p>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>
            Uses AI to analyze your stats and predict your transformation over 30, 60, and 90 days.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvatarGenerator;
