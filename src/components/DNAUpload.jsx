// DNA Upload Component - Genetic Personalization
import { useState } from 'react';
import './DNAUpload.css';
import dnaService from '../services/dnaService';

export default function DNAUpload({ onClose }) {
  const [uploading, setUploading] = useState(false);
  const [dnaData, setDnaData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('traits'); // traits, meals, exercise, risks

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target.result;
        const result = await dnaService.uploadDNAData(fileData, 'generic');
        setDnaData(result);
        
        const analysisResult = await dnaService.analyzeGenetics();
        setAnalysis(analysisResult);
        setUploading(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('DNA upload error:', error);
      alert('Failed to upload DNA data: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div className="dna-overlay">
      <div className="dna-modal">
        <button className="dna-close" onClick={onClose}>✕</button>

        <h2 className="dna-title">🧬 DNA Personalization</h2>

        {!dnaData ? (
          <div className="dna-upload-section">
            <div className="dna-icon">🧬</div>
            <h3>Upload Your DNA Data</h3>
            <p>Support for 23andMe, AncestryDNA, and more</p>
            
            <label className="upload-button">
              {uploading ? '⏳ Analyzing DNA...' : '📁 Choose File'}
              <input
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>

            <div className="supported-formats">
              <h4>Supported Formats:</h4>
              <div className="format-badges">
                <span className="format-badge">23andMe (.txt)</span>
                <span className="format-badge">AncestryDNA (.txt)</span>
                <span className="format-badge">MyHeritage (.csv)</span>
              </div>
            </div>

            <div className="privacy-notice">
              <span className="privacy-icon">🔒</span>
              <p>Your DNA data is encrypted and never shared. We only analyze relevant health markers.</p>
            </div>
          </div>
        ) : (
          <div className="dna-results">
            {/* Tab Navigation */}
            <div className="dna-tabs">
              <button 
                className={`tab-btn ${activeTab === 'traits' ? 'active' : ''}`}
                onClick={() => setActiveTab('traits')}
              >
                🧬 Traits
              </button>
              <button 
                className={`tab-btn ${activeTab === 'meals' ? 'active' : ''}`}
                onClick={() => setActiveTab('meals')}
              >
                🍽️ Meals
              </button>
              <button 
                className={`tab-btn ${activeTab === 'exercise' ? 'active' : ''}`}
                onClick={() => setActiveTab('exercise')}
              >
                💪 Exercise
              </button>
              <button 
                className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
                onClick={() => setActiveTab('risks')}
              >
                ⚠️ Risks
              </button>
            </div>

            {/* Traits Tab */}
            {activeTab === 'traits' && dnaData && (
              <div className="traits-view">
                <h3>Your Genetic Traits</h3>
                <div className="traits-grid">
                  {Object.entries(dnaData.geneticTraits).map(([trait, value]) => (
                    <div key={trait} className="trait-card">
                      <div className="trait-name">
                        {trait.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="trait-value">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meals Tab */}
            {activeTab === 'meals' && analysis && (
              <div className="meals-view">
                <h3>DNA-Optimized Meal Plan</h3>
                {dnaService.geneticMealPlan && dnaService.geneticMealPlan.meals ? (
                  <div className="meal-list">
                    {dnaService.geneticMealPlan.meals.slice(0, 3).map((meal, idx) => (
                      <div key={idx} className="meal-card">
                        <div className="meal-header">
                          <span className="meal-name">{meal.name}</span>
                          <span className="meal-time">{meal.type}</span>
                        </div>
                        <div className="meal-genetic-reason">
                          🧬 {meal.geneticReason}
                        </div>
                        <div className="meal-nutrients">
                          <span>Calories: {meal.calories}</span>
                          <span>Protein: {meal.protein}g</span>
                          <span>Carbs: {meal.carbs}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="recommendations-list">
                    <h4>Foods to Emphasize:</h4>
                    <ul>
                      {analysis.foodsToEmphasize?.map((food, idx) => (
                        <li key={idx} className="rec-item good">✓ {food}</li>
                      ))}
                    </ul>
                    <h4>Foods to Avoid:</h4>
                    <ul>
                      {analysis.foodsToAvoid?.map((food, idx) => (
                        <li key={idx} className="rec-item avoid">✗ {food}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Exercise Tab */}
            {activeTab === 'exercise' && analysis && (
              <div className="exercise-view">
                <h3>Genetic Exercise Plan</h3>
                {dnaService.geneticExercisePlan && (
                  <div className="exercise-plan">
                    <div className="muscle-type">
                      <span className="type-label">Your Muscle Type:</span>
                      <span className="type-value">{dnaService.geneticTraits.muscleType}</span>
                    </div>
                    {dnaService.geneticExercisePlan.map((workout, idx) => (
                      <div key={idx} className="workout-card">
                        <div className="workout-name">{workout.type}</div>
                        <div className="workout-details">
                          <div className="workout-detail">
                            <span className="detail-label">Frequency:</span>
                            <span className="detail-value">{workout.frequency}</span>
                          </div>
                          {workout.duration && (
                            <div className="workout-detail">
                              <span className="detail-label">Duration:</span>
                              <span className="detail-value">{workout.duration}</span>
                            </div>
                          )}
                          {workout.intensity && (
                            <div className="workout-detail">
                              <span className="detail-label">Intensity:</span>
                              <span className="detail-value">{workout.intensity}</span>
                            </div>
                          )}
                        </div>
                        <div className="workout-reason">🧬 {workout.geneticReason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Risks Tab */}
            {activeTab === 'risks' && analysis && (
              <div className="risks-view">
                <h3>Health Risk Predictions</h3>
                {analysis.healthRisks && analysis.healthRisks.length > 0 ? (
                  <div className="risks-list">
                    {analysis.healthRisks.map((risk, idx) => (
                      <div key={idx} className="risk-card">
                        <div className="risk-name">⚠️ {risk}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-risks">✓ No significant genetic health risks detected</p>
                )}
                
                {analysis.preventionStrategies && analysis.preventionStrategies.length > 0 && (
                  <>
                    <h4>Prevention Strategies:</h4>
                    <div className="prevention-list">
                      {analysis.preventionStrategies.map((strategy, idx) => (
                        <div key={idx} className="prevention-item">
                          ✓ {strategy}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
