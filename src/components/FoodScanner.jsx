// Food Scanner Component - AI-Powered Food & Label Analysis
import { useState, useEffect } from 'react';
import './FoodScanner.css';
import aiVisionService from '../services/aiVisionService';
import authService from '../services/authService';

export default function FoodScanner({ onClose }) {
  const [scanMode, setScanMode] = useState('food'); // 'food' or 'label'
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [allergenProfile, setAllergenProfile] = useState(null);

  useEffect(() => {
    const profile = authService.getUserAllergenProfile();
    console.log('📋 Loaded Allergen Profile:', profile);
    // Ensure profile has default values even if null
    setAllergenProfile(profile || { allergens: [], intolerances: [], dietaryPreferences: [], allergenSeverity: {} });
  }, []);

  const handleScanFood = async () => {
    setError('');
    setResult(null);
    setAnalyzing(true);

    try {
      console.log('📷 Starting food scan...');
      console.log('🔧 Scan Mode:', scanMode);
      
      // Capture photo
      const photoResult = await aiVisionService.captureFoodPhoto();
      console.log('📸 Photo Capture Result:', photoResult.success ? 'Success' : 'Failed');
      
      if (!photoResult.success) {
        throw new Error(photoResult.error || 'Failed to capture photo');
      }

      // Analyze with AI
      const analysisResult = scanMode === 'food'
        ? await aiVisionService.analyzeFoodImage(photoResult.imageData)
        : await aiVisionService.analyzeIngredientLabel(photoResult.imageData);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      setResult({
        ...analysisResult.analysis,
        imageData: photoResult.imageData
      });

      // Log food if safe or caution
      if (analysisResult.analysis.safetyLevel !== 'danger') {
        await authService.logFood({
          name: analysisResult.analysis.foodName,
          ingredients: analysisResult.analysis.ingredients,
          allergens: analysisResult.analysis.detectedAllergens,
          safety: analysisResult.analysis.safetyLevel
        });
      }

    } catch (err) {
      console.error('Scanner error:', err);
      let errorMsg = err.message || 'Scanner error';
      
      // Provide more helpful error messages
      if (errorMsg.includes('API Error: 400')) {
        errorMsg = 'Image format error. Please try again.';
      } else if (errorMsg.includes('API Error: 401')) {
        errorMsg = 'API key error. Please check configuration.';
      } else if (errorMsg.includes('API Error: 429')) {
        errorMsg = 'Too many requests. Please wait a moment.';
      } else if (errorMsg.includes('Invalid API response')) {
        errorMsg = 'AI service error. Please try again.';
      } else if (errorMsg.includes('Empty response')) {
        errorMsg = 'No analysis returned. Try a clearer photo.';
      }
      
      setError(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogSymptom = async () => {
    if (!result) return;

    const symptomData = {
      relatedFood: result.foodName,
      timestamp: new Date().toISOString(),
      severity: 'mild' // Default
    };

    await authService.logSymptom(symptomData);
    alert('Symptom logged for AI learning');
  };

  return (
    <div className="food-scanner-overlay">
      <div className="food-scanner">
        <button className="scanner-close" onClick={onClose}>✕</button>

        <h2 className="scanner-title">
          🔍 AI Food Scanner
        </h2>

        {/* Mode Toggle */}
        <div className="scan-mode-toggle">
          <button
            className={`mode-btn ${scanMode === 'food' ? 'active' : ''}`}
            onClick={() => setScanMode('food')}
          >
            📸 Scan Food
          </button>
          <button
            className={`mode-btn ${scanMode === 'label' ? 'active' : ''}`}
            onClick={() => setScanMode('label')}
          >
            🏷️ Scan Label
          </button>
        </div>

        {/* Allergen Profile Summary */}
        {allergenProfile && allergenProfile.allergens?.length > 0 && (
          <div className="allergen-summary">
            <h3>Your Allergens:</h3>
            <div className="allergen-badges">
              {allergenProfile.allergens.map((allergen, idx) => {
                const severity = allergenProfile.allergenSeverity?.[allergen] || 'moderate';
                return (
                  <span key={idx} className={`allergen-badge ${severity}`}>
                    {allergen}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Scan Button */}
        {!result && (
          <button
            className="scan-button"
            onClick={handleScanFood}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <span className="spinner">⏳</span>
                Analyzing...
              </>
            ) : (
              <>
                📷 {scanMode === 'food' ? 'Scan Food' : 'Scan Ingredient Label'}
              </>
            )}
          </button>
        )}

        {/* Error Display */}
        {error && (
          <div className="scanner-error">
            ❌ {error}
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="scan-results">
            {/* Image Preview */}
            <div className="result-image">
              <img
                src={`data:image/jpeg;base64,${result.imageData}`}
                alt="Scanned food"
              />
            </div>

            {/* Safety Banner */}
            <div
              className={`safety-banner ${result.safetyLevel}`}
              style={{ backgroundColor: result.safetyColor }}
            >
              <span className="safety-icon">{result.safetyIcon}</span>
              <span className="safety-text">{result.safetyMessage}</span>
            </div>

            {/* Food Name */}
            <h3 className="food-name">{result.foodName}</h3>

            {/* Detected Allergens */}
            {result.detectedAllergens && result.detectedAllergens.length > 0 && (
              <div className="detected-allergens">
                <h4>⚠️ Detected Allergens:</h4>
                <ul>
                  {result.detectedAllergens.map((allergen, idx) => (
                    <li key={idx} className="allergen-item">
                      <strong>{allergen.name}</strong>
                      {allergen.location && ` - Found in: ${allergen.location}`}
                      <span className={`confidence ${allergen.confidence}`}>
                        {allergen.confidence} confidence
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ingredients List */}
            {result.ingredients && result.ingredients.length > 0 && (
              <div className="ingredients-list">
                <h4>📋 Ingredients:</h4>
                <div className="ingredient-chips">
                  {result.ingredients.map((ing, idx) => (
                    <span key={idx} className="ingredient-chip">{ing}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden Ingredients */}
            {result.hiddenIngredients && result.hiddenIngredients.length > 0 && (
              <div className="hidden-ingredients">
                <h4>🔍 Likely Hidden Ingredients:</h4>
                <ul>
                  {result.hiddenIngredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternatives */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="alternatives">
                <h4>💡 Make It Safe:</h4>
                <ul>
                  {result.alternatives.map((alt, idx) => (
                    <li key={idx}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence Score */}
            <div className="confidence-bar">
              <span>AI Confidence:</span>
              <div className="bar">
                <div
                  className="fill"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <span>{result.confidence}%</span>
            </div>

            {/* Action Buttons */}
            <div className="result-actions">
              <button className="action-btn" onClick={handleScanFood}>
                📷 Scan Again
              </button>
              <button className="action-btn secondary" onClick={handleLogSymptom}>
                📝 Log Reaction
              </button>
              <button className="action-btn secondary" onClick={() => setResult(null)}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="scanner-info">
          <p>
            {scanMode === 'food'
              ? '📸 Point camera at any food to identify ingredients and check allergens'
              : '🏷️ Scan ingredient labels to extract and analyze all contents'}
          </p>
        </div>
      </div>
    </div>
  );
}
