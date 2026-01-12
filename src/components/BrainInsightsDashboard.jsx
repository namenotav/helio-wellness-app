// Brain.js Insights Dashboard Component
// Shows AI-learned insights and personalized recommendations to maximize user's life quality

import { useState, useEffect } from 'react';
import brainLearningService from '../services/brainLearningService';
import './BrainInsightsDashboard.css';

export default function BrainInsightsDashboard({ onClose }) {
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
    
    // 🔥 FIX: Add 10s polling for real-time updates (was missing!)
    const interval = setInterval(loadInsights, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      
      // 🔧 FIX: Initialize brainLearningService to load data from storage
      await brainLearningService.init();
      
      // Get comprehensive life optimization report
      const report = brainLearningService.getLifeOptimizationReport();
      setInsights(report);

      // Get personalized recommendations
      const recs = brainLearningService.getPersonalizedRecommendations();
      setRecommendations(recs);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load Brain.js insights:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="brain-insights-modal">
        <div className="brain-insights-content">
          <div className="insights-header">
            <h2>🧠 AI Learning Your Habits...</h2>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
          <div className="loading-brain">
            <div className="brain-pulse"></div>
            <p>Analyzing your behavior patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights || insights.dataPoints === 0) {
    // Get data counts from brainLearningService
    const dataStatus = {
      workouts: brainLearningService.trainingData.workouts?.length || 0,
      meals: brainLearningService.trainingData.meals?.length || 0,
      sleep: brainLearningService.trainingData.sleep?.length || 0,
      energy: brainLearningService.trainingData.energy?.length || 0,
      hydration: brainLearningService.trainingData.hydration?.length || 0,
      steps: brainLearningService.trainingData.steps?.length || 0
    };

    const dataRequirements = {
      workouts: 10,
      meals: 10,
      sleep: 7,
      energy: 10,
      hydration: 5,
      steps: 5
    };

    return (
      <div className="brain-insights-modal">
        <div className="brain-insights-content">
          <div className="insights-header">
            <h2>🧠 AI Life Optimizer</h2>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
          <div className="need-more-data">
            <h3>🎯 Keep Tracking to Unlock AI Insights!</h3>
            <p>The AI needs more data to learn your patterns and provide personalized recommendations.</p>
            
            <div className="data-progress">
              <div className="progress-item">
                <span className="progress-label">💪 Workouts:</span>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${Math.min((dataStatus.workouts / dataRequirements.workouts) * 100, 100)}%`, background: 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)'}}></div>
                  </div>
                  <span className="progress-count">{dataStatus.workouts}/{dataRequirements.workouts}</span>
                </div>
              </div>

              <div className="progress-item">
                <span className="progress-label">🍽️ Meals:</span>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${Math.min((dataStatus.meals / dataRequirements.meals) * 100, 100)}%`, background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'}}></div>
                  </div>
                  <span className="progress-count">{dataStatus.meals}/{dataRequirements.meals}</span>
                </div>
              </div>

              <div className="progress-item">
                <span className="progress-label">😴 Sleep:</span>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${Math.min((dataStatus.sleep / dataRequirements.sleep) * 100, 100)}%`, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'}}></div>
                  </div>
                  <span className="progress-count">{dataStatus.sleep}/{dataRequirements.sleep} nights</span>
                </div>
              </div>

              <div className="progress-item">
                <span className="progress-label">💧 Hydration:</span>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${Math.min((dataStatus.hydration / dataRequirements.hydration) * 100, 100)}%`, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'}}></div>
                  </div>
                  <span className="progress-count">{dataStatus.hydration}/{dataRequirements.hydration}</span>
                </div>
              </div>

              <div className="progress-item">
                <span className="progress-label">🚶 Walking Sessions:</span>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${Math.min((dataStatus.steps / dataRequirements.steps) * 100, 100)}%`, background: 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%)'}}></div>
                  </div>
                  <span className="progress-count">{dataStatus.steps}/{dataRequirements.steps} days tracked</span>
                </div>
              </div>
            </div>

            <div className="next-steps">
              <h4>📋 What to Do:</h4>
              <ul>
                {dataStatus.workouts < dataRequirements.workouts && (
                  <li>✅ Log {dataRequirements.workouts - dataStatus.workouts} more workouts</li>
                )}
                {dataStatus.meals < dataRequirements.meals && (
                  <li>✅ Scan {dataRequirements.meals - dataStatus.meals} more meals with Food Scanner</li>
                )}
                {dataStatus.sleep < dataRequirements.sleep && (
                  <li>✅ Track sleep for {dataRequirements.sleep - dataStatus.sleep} more nights</li>
                )}
                {dataStatus.hydration < dataRequirements.hydration && (
                  <li>✅ Log water intake {dataRequirements.hydration - dataStatus.hydration} more times</li>
                )}
                {dataStatus.steps < dataRequirements.steps && (
                  <li>✅ Walk on {dataRequirements.steps - dataStatus.steps} more separate days (AI tracks different walking sessions, not total steps)</li>
                )}
              </ul>
            </div>

            <p style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
              🔒 All AI learning happens on your device. Data never leaves your phone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brain-insights-modal">
      <div className="brain-insights-content">
        <div className="insights-header">
          <h2>🧠 AI Life Optimizer</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Overall Life Score */}
        <div className="life-score-card">
          <div className="score-circle" style={{
            background: `conic-gradient(#10b981 ${insights.overallScore * 3.6}deg, #e5e7eb 0deg)`
          }}>
            <div className="score-inner">
              <span className="score-value">{insights.overallScore}</span>
              <span className="score-label">Life Score</span>
            </div>
          </div>
          <div className="score-details">
            <p><strong>{insights.modelsTrainedCount}</strong> AI models trained</p>
            <p><strong>{insights.dataPoints}</strong> data points analyzed</p>
            {insights.showAccuracy ? (
              <p><strong>{Math.round(insights.accuracy)}%</strong> prediction accuracy</p>
            ) : (
              <p><em>Need 50+ data points for accuracy</em></p>
            )}
          </div>
        </div>

        {/* Priority Recommendations */}
        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>📋 Recommended Actions</h3>
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                  <div className="rec-header">
                    <span className="rec-title">{rec.title}</span>
                    <span className="rec-confidence">{Math.round(rec.confidence * 100)}% sure</span>
                  </div>
                  <p className="rec-message">{rec.message}</p>
                  <div className="rec-type">{rec.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Insights */}
        <div className="optimization-grid">
          {/* Workout Optimization */}
          <div className="optimization-card">
            <div className="card-icon">🏋️</div>
            <h4>Workout Optimization</h4>
            <div className="optimization-stats">
              <div className="stat">
                <span className="stat-label">Best Time:</span>
                <span className="stat-value">{insights.workoutOptimization.bestTime}:00</span>
              </div>
              <div className="stat">
                <span className="stat-label">Consistency:</span>
                <span className="stat-value">{Math.round(insights.workoutOptimization.consistency)}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Improvement:</span>
                <span className="stat-value trend-up">{insights.workoutOptimization.improvement > 0 ? '+' : ''}{Math.round(insights.workoutOptimization.improvement)}%</span>
              </div>
            </div>
          </div>

          {/* Nutrition Optimization */}
          <div className="optimization-card">
            <div className="card-icon">🍽️</div>
            <h4>Nutrition Optimization</h4>
            <div className="optimization-stats">
              <div className="stat">
                <span className="stat-label">Healthy Meals:</span>
                <span className="stat-value">{Math.round(insights.nutritionOptimization.healthyChoiceRate)}%</span>
              </div>
              {insights.nutritionOptimization.bestMealTimes.length > 0 && (
                <div className="meal-times">
                  {insights.nutritionOptimization.bestMealTimes.map((meal, i) => (
                    <span key={i} className="meal-time-badge">
                      {meal.type}: {meal.hour}:00
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sleep Optimization */}
          <div className="optimization-card">
            <div className="card-icon">😴</div>
            <h4>Sleep Optimization</h4>
            <div className="optimization-stats">
              {insights.sleepOptimization.optimalSchedule ? (
                <>
                  <div className="stat">
                    <span className="stat-label">Optimal Bedtime:</span>
                    <span className="stat-value">{insights.sleepOptimization.optimalSchedule.bedtime}:00</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Wake Time:</span>
                    <span className="stat-value">{insights.sleepOptimization.optimalSchedule.wakeTime}:00</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Avg Quality:</span>
                    <span className="stat-value">{insights.sleepOptimization.averageQuality.toFixed(1)}/10</span>
                  </div>
                </>
              ) : (
                <p className="need-data-text">Track sleep for 7+ nights for AI insights</p>
              )}
            </div>
          </div>

          {/* Energy Optimization */}
          <div className="optimization-card">
            <div className="card-icon">⚡</div>
            <h4>Energy Optimization</h4>
            <div className="optimization-stats">
              <div className="stat">
                <span className="stat-label">Avg Energy:</span>
                <span className="stat-value">{insights.energyOptimization.averageLevel.toFixed(1)}/10</span>
              </div>
              <div className="stat">
                <span className="stat-label">Trend:</span>
                <span className={`stat-value trend-${insights.energyOptimization.trend}`}>
                  {insights.energyOptimization.trend === 'improving' ? '📈 Improving' : 
                   insights.energyOptimization.trend === 'declining' ? '📉 Declining' : 
                   '➡️ Stable'}
                </span>
              </div>
              {insights.energyOptimization.peakTimes.length > 0 && (
                <div className="peak-times">
                  <span className="stat-label">Peak Times:</span>
                  <div className="time-badges">
                    {insights.energyOptimization.peakTimes.map((hour, i) => (
                      <span key={i} className="time-badge">{hour}:00</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="predictions-section">
          <h3>🔮 AI Predictions</h3>
          <div className="predictions-grid">
            <div className="prediction-card">
              <span className="pred-label">Best Workout Time Today:</span>
              <span className="pred-value">{brainLearningService.predictBestWorkoutTime().hour}:00</span>
              <span className="pred-confidence">{Math.round(brainLearningService.predictBestWorkoutTime().confidence * 100)}% confident</span>
            </div>

            <div className="prediction-card">
              <span className="pred-label">Current Energy Level:</span>
              <span className="pred-value">{brainLearningService.predictEnergyLevel().level}/10</span>
              <span className="pred-confidence">Real-time prediction</span>
            </div>

            <div className="prediction-card">
              <span className="pred-label">Predicted Mood:</span>
              <span className="pred-value">{brainLearningService.predictMood().mood}</span>
              <span className="pred-confidence">Based on patterns</span>
            </div>

            <div className="prediction-card">
              <span className="pred-label">Stress Level:</span>
              <span className="pred-value">{brainLearningService.predictStressLevel().level}/10</span>
              <span className="pred-confidence">Predicted risk</span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h3>🤖 How AI Learns Your Habits</h3>
          <div className="learning-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h5>Data Collection</h5>
                <p>Tracks workouts, meals, sleep, location, energy, mood, stress, and activities</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h5>Pattern Recognition</h5>
                <p>Brain.js neural networks identify patterns in your behavior and health metrics</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h5>Prediction & Optimization</h5>
                <p>Predicts optimal times for activities and provides personalized recommendations</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h5>Continuous Learning</h5>
                <p>Models retrain daily, improving accuracy as you use the app more</p>
              </div>
            </div>
          </div>
        </div>

        <div className="insights-footer">
          <button onClick={loadInsights} className="refresh-btn">
            🔄 Refresh Insights
          </button>
          <p className="privacy-note">
            🔒 All AI learning happens on your device. Your data never leaves your phone.
          </p>
        </div>
      </div>
    </div>
  );
}
