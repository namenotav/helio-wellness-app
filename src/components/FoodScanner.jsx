// Food Scanner Component - AI-Powered Food & Halal Analysis
import { useState, useEffect } from 'react';
import './FoodScanner.css';
import aiVisionService from '../services/aiVisionService';
import authService from '../services/authService';
import subscriptionService from '../services/subscriptionService';
import PaywallModal from './PaywallModal';
import { showToast } from './Toast';

export default function FoodScanner({ onClose, initialMode = null, lockMode = false, initialTab = 'usda' }) {
  const [scanMode, setScanMode] = useState(initialMode || 'food'); // 'food' or 'label' or 'halal' or 'search'
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [allergenProfile, setAllergenProfile] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const profile = authService.getUserAllergenProfile();
    if(import.meta.env.DEV)console.log('📋 Loaded Allergen Profile:', profile);
    // Ensure profile has default values even if null
    setAllergenProfile(profile || { allergens: [], intolerances: [], dietaryPreferences: [], allergenSeverity: {} });
    
    // Read scan history from localStorage for consistency
    const scanHistory = localStorage.getItem('foodScans');
    if (scanHistory) {
      const scans = JSON.parse(scanHistory);
      if(import.meta.env.DEV)console.log('📊 Loaded food scan history:', scans.length, 'scans');
    }
  }, []);

  const handleScanFood = async () => {
    // Check food scan limit
    const limit = subscriptionService.checkLimit('foodScans');
    if (!limit.allowed) {
      setShowPaywall(true);
      return;
    }

    setError('');
    setResult(null);
    setAnalyzing(true);

    try {
      if(import.meta.env.DEV)console.log('📷 Starting food scan...');
      if(import.meta.env.DEV)console.log('🔧 Scan Mode:', scanMode);
      
      // Capture photo
      const photoResult = await aiVisionService.captureFoodPhoto();
      if(import.meta.env.DEV)console.log('📸 Photo Capture Result:', photoResult.success ? 'Success' : 'Failed');
      
      if (!photoResult.success) {
        throw new Error(photoResult.error || 'Failed to capture photo');
      }

      // HALAL MODE - Complete isolation
      if (scanMode === 'halal') {
        if(import.meta.env.DEV)console.log('🕌 HALAL MODE ACTIVE - Running Halal-only analysis');
        
        const analysisResult = await aiVisionService.analyzeHalalStatus(photoResult.imageData);
        
        if (!analysisResult.success) {
          throw new Error(analysisResult.error || 'Halal analysis failed');
        }
        
        if(import.meta.env.DEV)console.log('✅ Halal analysis complete:', analysisResult.analysis);
        
        setResult({
          ...analysisResult.analysis,
          imageData: photoResult.imageData,
          scanMode: 'halal'
        });
        
        // INCREMENT USAGE COUNT
        subscriptionService.incrementUsage('foodScans');
        const newLimit = subscriptionService.checkLimit('foodScans');
        if(import.meta.env.DEV)console.log(`✅ Halal scan used. Remaining: ${newLimit.remaining}/${newLimit.limit}`);
        
        setAnalyzing(false);
        return; // EXIT - No food database search
      }

      // FOOD/LABEL MODE - Standard analysis
      if(import.meta.env.DEV)console.log(`📊 ${scanMode.toUpperCase()} MODE - Running food/label analysis`);
      
      const analysisResult = scanMode === 'food'
        ? await aiVisionService.analyzeFoodImage(photoResult.imageData)
        : await aiVisionService.analyzeIngredientLabel(photoResult.imageData);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      // Search ALL databases for better nutrition data (food/label mode only)
      const foodName = analysisResult.analysis.foodName || analysisResult.analysis.food;
      const smartFoodSearch = (await import('../services/smartFoodSearch')).default;
      const databaseMatches = await smartFoodSearch.searchAllDatabases(foodName);

      setResult({
        ...analysisResult.analysis,
        imageData: photoResult.imageData,
        databaseMatches: databaseMatches, // All database results
        bestMatch: databaseMatches.length > 0 ? databaseMatches[0] : null // Best nutrition data
      });

      // Trigger sync after successful scan
      const syncService = (await import('../services/syncService')).default;
      await syncService.syncNutrition({
        foodName: analysisResult.analysis.foodName,
        calories: analysisResult.analysis.nutrition?.calories || 0,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      });

      if(import.meta.env.DEV)console.log(`✅ AI detected: ${foodName}. Found ${databaseMatches.length} database matches.`);

      // INCREMENT USAGE COUNT
      subscriptionService.incrementUsage('foodScans');
      const newLimit = subscriptionService.checkLimit('foodScans');
      if(import.meta.env.DEV)console.log(`✅ Food scan used. Remaining: ${newLimit.remaining}/${newLimit.limit}`);

      // Log food if safe or caution
      if (analysisResult.analysis.safetyLevel !== 'danger') {
        await authService.logFood({
          name: analysisResult.analysis.foodName,
          ingredients: analysisResult.analysis.ingredients,
          allergens: analysisResult.analysis.detectedAllergens,
          safety: analysisResult.analysis.safetyLevel
        });
        
        // UPDATE SCAN STATS - Track successful scan
        const totalScans = parseInt(localStorage.getItem('total_scans') || '0');
        localStorage.setItem('total_scans', (totalScans + 1).toString());
        
        const todayScans = parseInt(localStorage.getItem('scans_today') || '0');
        localStorage.setItem('scans_today', (todayScans + 1).toString());
        
        // Track calories from best match or estimate
        const scanCalories = databaseMatches.length > 0 ? (databaseMatches[0].calories || 0) : 0;
        const totalCalories = parseInt(localStorage.getItem('calories_tracked') || '0');
        localStorage.setItem('calories_tracked', (totalCalories + scanCalories).toString());
        
        // Save to recent scans history
        const recentScans = JSON.parse(localStorage.getItem('recent_scans') || '[]');
        recentScans.unshift({
          name: analysisResult.analysis.foodName,
          calories: scanCalories,
          time: 'Just now',
          icon: '📸'
        });
        localStorage.setItem('recent_scans', JSON.stringify(recentScans.slice(0, 10)));
        
        // Award XP for successful scan
        if (window.addPoints) {
          window.addPoints(5, { x: window.innerWidth / 2, y: 100 });
        }
        
        // Update daily challenge
        if (window.updateDailyChallenge) {
          window.updateDailyChallenge('scan_food', 1);
        }
        
        if(import.meta.env.DEV)console.log('📊 Scan stats updated:', { totalScans: totalScans + 1, calories: scanCalories });
      }

    } catch (err) {
      if(import.meta.env.DEV)console.error('❌ Scanner error:', err);
      if(import.meta.env.DEV)console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      let errorMsg = err.message || 'Scanner error';
      
      // Provide more helpful error messages
      if (errorMsg.includes('Server Error: 413')) {
        errorMsg = '❌ Image too large. Try again with better lighting.';
      } else if (errorMsg.includes('API Error: 400') || errorMsg.includes('Server Error: 400')) {
        errorMsg = '❌ Image format error. Please try again.';
      } else if (errorMsg.includes('API Error: 401') || errorMsg.includes('Server Error: 401')) {
        errorMsg = '❌ Your API key was reported as leaked. Please use another API key.';
      } else if (errorMsg.includes('API Error: 429') || errorMsg.includes('Server Error: 429')) {
        errorMsg = '❌ Too many requests. Please wait a moment.';
      } else if (errorMsg.includes('Invalid API response')) {
        errorMsg = '❌ AI service error. Please try again.';
      } else if (errorMsg.includes('Empty response')) {
        errorMsg = '❌ No analysis returned. Try a clearer photo.';
      } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network')) {
        errorMsg = '❌ Network error. Check your internet connection.';
      } else {
        errorMsg = `❌ ${errorMsg}`;
      }
      
      if(import.meta.env.DEV)console.log('📢 Setting error message:', errorMsg);
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
    showToast('Symptom logged for AI learning', 'success');
  };

  return (
    <div className="food-scanner-overlay">
      <div className="food-scanner">
        <button className="scanner-close" onClick={onClose}>✕</button>

        <h2 className="scanner-title">
          🔍 AI Food Scanner
        </h2>

        {/* Scan Usage Counter for Free Users */}
        {(() => {
          const subscriptionService = window.subscriptionService;
          if (subscriptionService) {
            const limit = subscriptionService.checkLimit('foodScans');
            const isPremium = subscriptionService.hasAccess('foodScanner');
            if (!isPremium) {
              return (
                <div style={{
                  marginBottom: '15px',
                  padding: '10px 16px',
                  background: limit.remaining <= 0 ? 'rgba(255, 68, 68, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: limit.remaining <= 0 ? '#FF4444' : '#4CAF50',
                  fontWeight: 'bold',
                  border: `2px solid ${limit.remaining <= 0 ? '#FF4444' : 'rgba(76, 175, 80, 0.4)'}`,
                  textAlign: 'center'
                }}>
                  {limit.remaining > 0 ? (
                    <>📸 {limit.remaining}/{limit.limit} scans left today</>
                  ) : (
                    <>🔒 Daily scans used - Upgrade for unlimited!</>
                  )}
                </div>
              );
            }
          }
          return null;
        })()}

        {/* Mode Toggle - Hidden when lockMode is true */}
        {!lockMode && (
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
            <button
              className={`mode-btn ${scanMode === 'halal' ? 'active' : ''}`}
              onClick={() => setScanMode('halal')}
            >
              🕌 Halal Check
            </button>
            <button
              className={`mode-btn ${scanMode === 'search' ? 'active' : ''}`}
              onClick={() => setScanMode('search')}
            >
              🔍 Search 6M Foods
            </button>
          </div>
        )}

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

        {/* Search Mode */}
        {scanMode === 'search' && !result && (
          <SearchFoods onClose={onClose} initialTab={initialTab} />
        )}

        {/* Scan Button */}
        {!result && scanMode !== 'search' && (
          <button 
            className="scan-button" 
            onClick={handleScanFood}
            disabled={analyzing}
            aria-label="Start camera to scan food"
          >
            {analyzing ? (
              <>
                <span className="spinner">⏳</span>
                Analyzing...
              </>
            ) : (
              <>
                📷 {scanMode === 'food' ? 'Scan Food' : scanMode === 'halal' ? 'Check Halal Status' : 'Scan Ingredient Label'}
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

        {/* Halal Results Display */}
        {result && scanMode === 'halal' && result.halalStatus && (
          <div className="halal-results">
            {/* Image Preview */}
            <div className="result-image">
              <img
                src={`data:image/jpeg;base64,${result.imageData}`}
                alt="Scanned product"
              />
            </div>

            <div className={`halal-verdict ${result.halalStatus}`}>
              {result.halalStatus === 'halal' && '✅ HALAL'}
              {result.halalStatus === 'haram' && '❌ HARAM'}
              {result.halalStatus === 'doubtful' && '⚠️ DOUBTFUL (MUSHBOOH)'}
              {result.halalStatus === 'uncertain' && '❓ UNCERTAIN'}
            </div>

            <div className="halal-confidence">
              Confidence: {result.confidence}%
            </div>

            {result.certifications && result.certifications.length > 0 && (
              <div className="halal-section">
                <h4>🏅 Certifications Found:</h4>
                <ul>
                  {result.certifications.map((cert, idx) => (
                    <li key={idx} className="cert-item">{cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.haramIngredients && result.haramIngredients.length > 0 && (
              <div className="halal-section danger">
                <h4>🚫 Haram Ingredients:</h4>
                <ul>
                  {result.haramIngredients.map((ing, idx) => (
                    <li key={idx} className="haram-item">{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.doubtfulIngredients && result.doubtfulIngredients.length > 0 && (
              <div className="halal-section warning">
                <h4>⚠️ Doubtful Ingredients:</h4>
                <ul>
                  {result.doubtfulIngredients.map((ing, idx) => (
                    <li key={idx} className="doubtful-item">{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.eCodes && result.eCodes.length > 0 && (
              <div className="halal-section">
                <h4>🔢 E-Codes Found:</h4>
                <ul>
                  {result.eCodes.map((code, idx) => (
                    <li key={idx} className="ecode-item">{code}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.crossContamination && (
              <div className="halal-section">
                <h4>⚗️ Cross-Contamination:</h4>
                <p>{result.crossContamination}</p>
              </div>
            )}

            {result.recommendation && (
              <div className="halal-section recommendation">
                <h4>💡 Recommendation:</h4>
                <p>{result.recommendation}</p>
              </div>
            )}

            {result.details && (
              <div className="halal-section details">
                <h4>📋 Detailed Analysis:</h4>
                <p>{result.details}</p>
              </div>
            )}

            <div className="result-actions">
              <button className="action-btn" onClick={handleScanFood}>
                📷 Scan Another Product
              </button>
              <button className="action-btn secondary" onClick={() => setResult(null)}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Regular Food/Label Results Display */}
        {result && scanMode !== 'halal' && (
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

            {/* Database Matches */}
            {result.databaseMatches && result.databaseMatches.length > 0 && (
              <div style={{background: '#f0f9ff', padding: '15px', borderRadius: '12px', marginBottom: '15px'}}>
                <h4 style={{margin: '0 0 10px 0', fontSize: '14px', color: '#0284c7'}}>
                  🔍 Found {result.databaseMatches.length} matches in databases
                </h4>
                {result.bestMatch && (
                  <div style={{background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '2px solid #0284c7'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                      <span style={{fontSize: '18px'}}>{result.bestMatch.sourceBadge}</span>
                      <strong style={{fontSize: '15px'}}>{result.bestMatch.name}</strong>
                      <span style={{marginLeft: 'auto', fontSize: '11px', padding: '3px 8px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: 'bold'}}>BEST MATCH</span>
                    </div>
                    <div style={{fontSize: '13px', color: '#666'}}>
                      <strong>{result.bestMatch.calories}</strong> cal | 
                      <strong> P:</strong> {result.bestMatch.protein}g | 
                      <strong> C:</strong> {result.bestMatch.carbs || result.bestMatch.carbohydrates}g | 
                      <strong> F:</strong> {result.bestMatch.fat || result.bestMatch.fats}g
                    </div>
                    <div style={{fontSize: '11px', color: '#999', marginTop: '4px'}}>
                      {result.bestMatch.brand || result.bestMatch.restaurantName || result.bestMatch.source}
                    </div>
                  </div>
                )}
                {result.databaseMatches.length > 1 && (
                  <details style={{fontSize: '13px'}}>
                    <summary style={{cursor: 'pointer', color: '#0284c7', fontWeight: 'bold'}}>
                      View all {result.databaseMatches.length} options →
                    </summary>
                    <div style={{maxHeight: '150px', overflowY: 'auto', marginTop: '10px'}}>
                      {result.databaseMatches.slice(1, 6).map((match, idx) => (
                        <div key={idx} style={{background: 'white', padding: '8px', marginBottom: '6px', borderRadius: '6px', fontSize: '12px'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <span>{match.sourceBadge}</span>
                            <strong>{match.name}</strong>
                          </div>
                          <div style={{color: '#666', fontSize: '11px', marginTop: '2px'}}>
                            {match.calories} cal | P: {match.protein}g | C: {match.carbs || match.carbohydrates}g | F: {match.fat || match.fats}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

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
        {scanMode !== 'search' && (
          <div className="scanner-info">
            <p>
              {scanMode === 'food'
                ? '📸 Point camera at any food to identify ingredients and check allergens'
                : scanMode === 'halal'
                ? '🕌 Scan product labels for comprehensive Islamic dietary compliance verification'
                : '🏷️ Scan ingredient labels to extract and analyze all contents'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Search Foods Component - OpenFoodFacts + Restaurants
function SearchFoods({ onClose, initialTab = 'usda' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTab, setSearchTab] = useState(initialTab); // 'usda', 'foods', or 'restaurants'
  const [loading, setLoading] = useState(false);
  const [halalOnly, setHalalOnly] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [availableCuisines, setAvailableCuisines] = useState([]);
  
  // Load available cuisines on mount
  useEffect(() => {
    const loadCuisines = async () => {
      const { restaurantService } = await import('../services/restaurantService');
      const cuisines = restaurantService.getAllCuisines();
      setAvailableCuisines(cuisines);
    };
    loadCuisines();
  }, []);
  
  const handleSearch = async () => {
    if (!searchQuery.trim() && !halalOnly && !selectedCuisine) return;
    
    setLoading(true);
    setSearchResults([]);
    
    try {
      if (searchTab === 'usda') {
        // Search USDA FoodData Central (400K+ official foods)
        const usdaService = (await import('../services/usdaService')).default;
        const result = await usdaService.searchFoods(searchQuery, 30);
        
        if (result.success) {
          setSearchResults(result.foods);
        }
      } else if (searchTab === 'foods') {
        // Search OpenFoodFacts (6M+ foods)
        const { barcodeScannerService } = await import('../services/barcodeScannerService');
        const result = await barcodeScannerService.searchOpenFoodFactsByText(searchQuery, 1);
        
        if (result.success) {
          setSearchResults(result.foods);
        }
      } else {
        // Search Restaurants with filters
        const { restaurantService } = await import('../services/restaurantService');
        const filters = {};
        if (halalOnly) filters.halalOnly = true;
        if (selectedCuisine) filters.cuisine = selectedCuisine;
        
        const results = restaurantService.searchMenuItems(searchQuery, null, filters);
        setSearchResults(results);
      }
      
    } catch (error) {
      if(import.meta.env.DEV)console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const clearFilters = () => {
    setHalalOnly(false);
    setSelectedCuisine('');
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handleLogFood = async (food) => {
    const auth = await import('../services/authService');
    await auth.default.logFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs || food.carbohydrates,
      fat: food.fats || food.fat
    });
    showToast('✅ Food logged!', 'success');
  };
  
  return (
    <div style={{marginTop: '20px'}}>
      {/* Tab Selector */}
      <div style={{display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap'}}>
        <button 
          onClick={() => setSearchTab('usda')}
          style={{
            flex: '1 1 140px',
            padding: '12px',
            background: searchTab === 'usda' ? 'linear-gradient(135deg, #00c853 0%, #00e676 100%)' : '#f0f0f0',
            color: searchTab === 'usda' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          🇺🇸 USDA Official
        </button>
        <button 
          onClick={() => setSearchTab('foods')}
          style={{
            flex: '1 1 140px',
            padding: '12px',
            background: searchTab === 'foods' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
            color: searchTab === 'foods' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          🌍 6M Foods
        </button>
        <button 
          onClick={() => setSearchTab('restaurants')}
          style={{
            flex: '1 1 140px',
            padding: '12px',
            background: searchTab === 'restaurants' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#f0f0f0',
            color: searchTab === 'restaurants' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          🍔 Restaurants
        </button>
      </div>
      
      {/* Halal & Cuisine Filters (only for restaurants) */}
      {searchTab === 'restaurants' && (
        <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
          <button 
            onClick={() => setHalalOnly(!halalOnly)}
            style={{
              padding: '8px 16px',
              background: halalOnly ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : '#f0f0f0',
              color: halalOnly ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🕌 Halal {halalOnly ? '✓' : ''}
          </button>
          
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            style={{
              padding: '8px 12px',
              border: selectedCuisine ? '2px solid #667eea' : '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: selectedCuisine ? 'bold' : 'normal',
              background: selectedCuisine ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'white',
              color: selectedCuisine ? 'white' : '#333',
              cursor: 'pointer'
            }}
          >
            <option value="">🌍 All Cuisines</option>
            {availableCuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
          
          {(halalOnly || selectedCuisine) && (
            <button 
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}
      
      {/* Search Input */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={
            searchTab === 'usda' ? 'Search USDA database...' : 
            searchTab === 'foods' ? 'Search 6M+ foods...' : 
            'Search restaurants...'
          }
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳' : '🔍'}
        </button>
      </div>
      
      {/* Results */}
      <div style={{maxHeight: '400px', overflowY: 'auto'}}>
        {searchResults.length > 0 ? (
          <div>
            <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
              Found {searchResults.length} results
            </p>
            {searchResults.map((food, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'white',
                  padding: '12px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{flex: 1}}>
                  <h4 style={{margin: '0 0 5px 0', color: '#333'}}>
                    {searchTab === 'restaurants' && `${food.restaurantLogo} `}
                    {food.name}
                  </h4>
                  {searchTab === 'restaurants' && (
                    <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#888'}}>
                      {food.restaurantName}
                    </p>
                  )}
                  {food.brand && (
                    <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#888'}}>
                      {food.brand}
                    </p>
                  )}
                  <p style={{margin: 0, fontSize: '14px', color: '#666'}}>
                    {food.calories} cal • {food.protein}g protein • {food.carbs || food.carbohydrates || 0}g carbs • {food.fats || food.fat || 0}g fat
                  </p>
                </div>
                <button 
                  onClick={() => handleLogFood(food)}
                  style={{
                    padding: '8px 16px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  + Log
                </button>
              </div>
            ))}
          </div>
        ) : searchQuery && !loading ? (
          <p style={{textAlign: 'center', color: '#888', padding: '20px'}}>
            No results found. Try a different search.
          </p>
        ) : !searchQuery ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#888'}}>
            <div style={{fontSize: '48px', marginBottom: '10px'}}>
              {searchTab === 'usda' ? '🇺🇸' : searchTab === 'foods' ? '🔍' : '🍔'}
            </div>
            <p>
              {searchTab === 'usda' 
                ? 'Search 400K+ USDA verified foods' 
                : searchTab === 'foods' 
                ? 'Search 6 million foods from OpenFoodFacts' 
                : 'Search 50+ restaurants with 2,700+ items'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { SearchFoods };



