import { useState } from 'react';
import './QuickLogModal.css';

export default function QuickLogModal({ isOpen, onClose }) {
  const [activeLog, setActiveLog] = useState(null); // 'water', 'sleep', 'workout'
  const [waterAmount, setWaterAmount] = useState(0);
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutCalories, setWorkoutCalories] = useState('');
  
  // 🔥 Auto-calculate calories based on workout type and duration
  const calculateWorkoutCalories = (type, duration) => {
    if (!type || !duration) return 0;
    const calorieRateMap = {
      'Running': 11, 'Cycling': 10, 'Swimming': 12, 'Weights': 7,
      'Yoga': 3, 'HIIT': 13, 'Walking': 5, 'Sports': 9, 'Other': 7
    };
    const rate = calorieRateMap[type] || 7;
    return Math.round(duration * rate);
  };

  if (!isOpen) return null;

  const handleLogWater = async (amount) => {
    console.log('💧 [QuickLog] Logging water:', amount, 'ml');
    const { default: waterIntakeService } = await import('../services/waterIntakeService');
    const result = await waterIntakeService.addIntake(amount);
    console.log('✅ [QuickLog] Water logged successfully:', result);
    setWaterAmount(prev => prev + amount);
    
    // ⭐ GAMIFICATION: Log water activity
    try {
      const { default: gamificationService } = await import('../services/gamificationService');
      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const waterToday = waterLog.filter(w => w.date === today);
      const dailyTotal = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0);
      await gamificationService.logActivity('water', { cups: 1, dailyTotal });
      if(import.meta.env.DEV)console.log('⭐ [GAMIFICATION] Water activity logged, daily total:', dailyTotal);
    } catch (error) {
      console.error('❌ [GAMIFICATION] Failed to log water activity:', error);
    }
    
    // Trigger dashboard refresh
    window.dispatchEvent(new Event('quickLogUpdated'));
    
    // Show success
    setTimeout(() => {
      setActiveLog(null);
      onClose();
    }, 500);
  };

  const handleLogSleep = async () => {
    if (!sleepHours) return;
    
    console.log('😴 [QuickLog] Logging sleep:', sleepHours, 'hours, quality:', sleepQuality);
    const { default: sleepService } = await import('../services/sleepService');
    const result = await sleepService.logSleep({
      hours: parseFloat(sleepHours),
      duration: parseFloat(sleepHours),
      quality: sleepQuality,
      date: new Date().toISOString().split('T')[0]
    });
    console.log('✅ [QuickLog] Sleep logged successfully:', result);
    
    // Trigger dashboard refresh
    window.dispatchEvent(new Event('quickLogUpdated'));
    
    setSleepHours('');
    setSleepQuality(3);
    setActiveLog(null);
    onClose();
  };

  const handleLogWorkout = async () => {
    if (!workoutType || !workoutDuration) return;
    
    // 🔥 Calculate calories automatically
    const autoCalories = calculateWorkoutCalories(workoutType, parseInt(workoutDuration));
    
    console.log('💪 [QuickLog] Logging workout:', workoutType, workoutDuration, 'min', autoCalories, 'cal');
    const { default: workoutService } = await import('../services/workoutService');
    const result = await workoutService.logWorkout({
      type: workoutType,
      activity: workoutType,
      duration: parseInt(workoutDuration),
      calories: autoCalories,
      date: new Date().toISOString().split('T')[0]
    });
    console.log('✅ [QuickLog] Workout logged successfully:', result);
    
    // ⭐ GAMIFICATION: Log workout activity
    try {
      const { default: gamificationService } = await import('../services/gamificationService');
      await gamificationService.logActivity('workout');
      if(import.meta.env.DEV)console.log('⭐ [GAMIFICATION] Workout activity logged');
    } catch (error) {
      console.error('❌ [GAMIFICATION] Failed to log workout activity:', error);
    }
    
    // Trigger dashboard refresh
    window.dispatchEvent(new Event('quickLogUpdated'));
    
    setWorkoutType('');
    setWorkoutDuration('');
    setWorkoutCalories('');
    setActiveLog(null);
    onClose();
  };

  return (
    <div className="quick-log-overlay" onClick={onClose}>
      <div className="quick-log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-log-header">
          <h2>⚡ Quick Log</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!activeLog ? (
          <div className="quick-log-options">
            <button className="log-option water" onClick={() => setActiveLog('water')}>
              <span className="log-icon">💧</span>
              <span className="log-label">Log Water</span>
            </button>
            
            <button className="log-option sleep" onClick={() => setActiveLog('sleep')}>
              <span className="log-icon">😴</span>
              <span className="log-label">Log Sleep</span>
            </button>
            
            <button className="log-option workout" onClick={() => setActiveLog('workout')}>
              <span className="log-icon">💪</span>
              <span className="log-label">Log Workout</span>
            </button>
          </div>
        ) : (
          <>
            {activeLog === 'water' && (
              <div className="log-form">
                <h3>💧 Log Water Intake</h3>
                <p className="log-description">How much water did you drink?</p>
                
                <div className="water-buttons">
                  <button className="water-btn" onClick={() => handleLogWater(200)}>
                    <span className="water-amount">200ml</span>
                    <span className="water-label">Cup</span>
                  </button>
                  <button className="water-btn" onClick={() => handleLogWater(250)}>
                    <span className="water-amount">250ml</span>
                    <span className="water-label">Glass</span>
                  </button>
                  <button className="water-btn" onClick={() => handleLogWater(500)}>
                    <span className="water-amount">500ml</span>
                    <span className="water-label">Bottle</span>
                  </button>
                  <button className="water-btn" onClick={() => handleLogWater(1000)}>
                    <span className="water-amount">1L</span>
                    <span className="water-label">Large</span>
                  </button>
                </div>
                
                {waterAmount > 0 && (
                  <div className="success-message">
                    ✅ Logged {waterAmount}ml today!
                  </div>
                )}
                
                <button className="back-btn" onClick={() => setActiveLog(null)}>← Back</button>
              </div>
            )}

            {activeLog === 'sleep' && (
              <div className="log-form">
                <h3>😴 Log Sleep</h3>
                <p className="log-description">How was your sleep last night?</p>
                
                <div className="form-group">
                  <label>Hours Slept</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="e.g. 7.5"
                    className="sleep-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Sleep Quality</label>
                  <div className="quality-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star-btn ${sleepQuality >= star ? 'active' : ''}`}
                        onClick={() => setSleepQuality(star)}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="back-btn" onClick={() => setActiveLog(null)}>← Back</button>
                  <button 
                    className="submit-btn" 
                    onClick={handleLogSleep}
                    disabled={!sleepHours}
                  >
                    Save Sleep
                  </button>
                </div>
              </div>
            )}

            {activeLog === 'workout' && (
              <div className="log-form">
                <h3>💪 Log Workout</h3>
                <p className="log-description">What did you do today?</p>
                
                <div className="form-group">
                  <label>Workout Type</label>
                  <select 
                    value={workoutType} 
                    onChange={(e) => setWorkoutType(e.target.value)}
                    className="workout-select"
                  >
                    <option value="">Select type...</option>
                    <option value="Running">🏃 Running</option>
                    <option value="Cycling">🚴 Cycling</option>
                    <option value="Swimming">🏊 Swimming</option>
                    <option value="Weights">🏋️ Weights</option>
                    <option value="Yoga">🧘 Yoga</option>
                    <option value="HIIT">🥊 HIIT</option>
                    <option value="Walking">🚶 Walking</option>
                    <option value="Sports">⚽ Sports</option>
                    <option value="Other">💪 Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    placeholder="e.g. 30"
                    className="workout-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Calories (auto-calculated)</label>
                  <input
                    type="number"
                    min="0"
                    value={calculateWorkoutCalories(workoutType, parseInt(workoutDuration) || 0)}
                    readOnly
                    placeholder="Select type and duration"
                    className="workout-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                  />
                </div>
                
                <div className="form-actions">
                  <button className="back-btn" onClick={() => setActiveLog(null)}>← Back</button>
                  <button 
                    className="submit-btn" 
                    onClick={handleLogWorkout}
                    disabled={!workoutType || !workoutDuration}
                  >
                    Save Workout
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
