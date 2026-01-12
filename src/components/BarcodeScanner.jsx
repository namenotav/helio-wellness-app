// Barcode Scanner Component - Scan Food Barcodes
import React, { useState, useEffect } from 'react';
import barcodeScannerService from '../services/barcodeScannerService';
import authService from '../services/authService';
import { showToast } from './Toast';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onClose, onFoodScanned }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(30);

  const handleScan = async () => {
    try {
      // Check barcode scan limit (starter users: 3/day)
      const { default: subscriptionService } = await import('../services/subscriptionService');
      const limitCheck = await subscriptionService.checkLimit('barcodeScans');
      if (!limitCheck.allowed) {
        setError(limitCheck.message);
        return;
      }

      setError(null);
      setScanning(true);
      setLoading(false);
      setCountdown(30);

      if(import.meta.env.DEV)console.log('🔵 Starting barcode scan from component...');

      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start barcode scan with 30 second timeout
      const scanResult = await barcodeScannerService.startScan(30000);
      clearInterval(countdownInterval);

      if (scanResult.success) {
        setLoading(true);
        if(import.meta.env.DEV)console.log('📦 Barcode found:', scanResult.barcode);
        
        // Search ALL databases (USDA + Restaurants + OpenFoodFacts)
        const smartFoodSearch = (await import('../services/smartFoodSearch')).default;
        const allResults = await smartFoodSearch.searchByBarcode(scanResult.barcode);

        if (allResults && allResults.length > 0) {
          // Use best match as primary result
          setResult({
            ...allResults[0],
            allMatches: allResults, // Store all results for user to browse
            totalResults: allResults.length
          });
          if(import.meta.env.DEV)console.log(`✅ Found ${allResults.length} matches across databases. Best: ${allResults[0].name}`);
          
          // Increment barcode scan usage (for starter user limits)
          const { default: subscriptionService } = await import('../services/subscriptionService');
          await subscriptionService.incrementUsage('barcodeScans');
        } else {
          setError('Product not found in any database (USDA, Restaurants, OpenFoodFacts)');
        }
      } else {
        setError(scanResult.message || 'Failed to scan barcode');
      }
    } catch (err) {
      if(import.meta.env.DEV)console.error('❌ Scan error:', err);
      setError(err.message || 'Failed to scan barcode. Try holding camera steady and ensuring good lighting.');
    } finally {
      setScanning(false);
      setLoading(false);
      setCountdown(30);
    }
  };

  const handleStopScan = () => {
    barcodeScannerService.stopScan();
    setScanning(false);
    setError('Scan cancelled');
  };

  const handleClose = () => {
    if (scanning) {
      barcodeScannerService.stopScan();
    }
    // Force cleanup of any remaining classes
    document.body.classList.remove('barcode-scanning-active');
    document.querySelector('html')?.classList.remove('barcode-scanning-active');
    
    // Force browser reflow to recalculate CSS and restore banners immediately
    void document.body.offsetHeight;
    
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanning) {
        barcodeScannerService.stopScan();
      }
      // Ensure classes are removed when component unmounts
      document.body.classList.remove('barcode-scanning-active');
      document.querySelector('html')?.classList.remove('barcode-scanning-active');
      
      // Force browser reflow to recalculate CSS and restore banners immediately
      void document.body.offsetHeight;
    };
  }, [scanning]);

  const handleAddToMeal = async () => {
    if (!result) return;

    try {
      if(import.meta.env.DEV)console.log('🍽️ Logging meal:', result.name);
      
      // Log food using existing authService
      const logResult = await authService.logFood({
        name: result.name,
        brand: result.brand,
        barcode: result.barcode,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        fiber: result.fiber,
        sugar: result.sugar,
        sodium: result.sodium,
        servingSize: result.servingSize,
        image: result.image,
        ingredients: result.ingredients,
        source: result.source
      });

      if (logResult.success !== false) {
        if(import.meta.env.DEV)console.log('✅ Meal logged successfully!');
        showToast(`✅ ${result.name} logged! +${result.calories} cal`, 'success');
        
        // UPDATE SCAN STATS - Track successful scan with dual storage
        // 🔥 FIX: Read from Preferences first (survives app updates), fallback to localStorage
        const { Preferences } = await import('@capacitor/preferences');
        
        let totalScans = 0;
        let todayScans = 0;
        let totalCalories = 0;
        let recentScans = [];
        
        try {
          const { value: prefsTotalScans } = await Preferences.get({ key: 'wellnessai_total_scans' });
          const { value: prefsTodayScans } = await Preferences.get({ key: 'wellnessai_scans_today' });
          const { value: prefsCalories } = await Preferences.get({ key: 'wellnessai_calories_tracked' });
          const { value: prefsRecent } = await Preferences.get({ key: 'wellnessai_recent_scans' });
          const { value: prefsTodayDate } = await Preferences.get({ key: 'wellnessai_scans_today_date' });
          
          // Check if today's date matches stored date, reset if not
          const today = new Date().toISOString().split('T')[0];
          const storedTodayDate = prefsTodayDate || localStorage.getItem('scans_today_date');
          
          totalScans = parseInt(prefsTotalScans || localStorage.getItem('total_scans') || '0');
          todayScans = (storedTodayDate === today) ? parseInt(prefsTodayScans || localStorage.getItem('scans_today') || '0') : 0;
          totalCalories = parseInt(prefsCalories || localStorage.getItem('calories_tracked') || '0');
          recentScans = JSON.parse(prefsRecent || localStorage.getItem('recent_scans') || '[]');
        } catch (e) {
          // Fallback to localStorage if Preferences fails
          totalScans = parseInt(localStorage.getItem('total_scans') || '0');
          todayScans = parseInt(localStorage.getItem('scans_today') || '0');
          totalCalories = parseInt(localStorage.getItem('calories_tracked') || '0');
          recentScans = JSON.parse(localStorage.getItem('recent_scans') || '[]');
        }
        
        const scanCalories = result.calories || 0;
        
        // Update localStorage
        localStorage.setItem('total_scans', (totalScans + 1).toString());
        localStorage.setItem('scans_today', (todayScans + 1).toString());
        localStorage.setItem('scans_today_date', new Date().toISOString().split('T')[0]);
        localStorage.setItem('calories_tracked', (totalCalories + scanCalories).toString());
        
        // Update recent scans (using already-loaded recentScans from Preferences/localStorage)
        recentScans.unshift({
          name: result.name,
          calories: scanCalories,
          time: 'Just now',
          icon: '📊'
        });
        const updatedRecentScans = recentScans.slice(0, 10);
        localStorage.setItem('recent_scans', JSON.stringify(updatedRecentScans));
        
        // 💾 DUAL STORAGE: Save to Preferences (survives app updates)
        try {
          const { Preferences } = await import('@capacitor/preferences');
          await Preferences.set({ key: 'wellnessai_total_scans', value: (totalScans + 1).toString() });
          await Preferences.set({ key: 'wellnessai_scans_today', value: (todayScans + 1).toString() });
          await Preferences.set({ key: 'wellnessai_scans_today_date', value: new Date().toISOString().split('T')[0] });
          await Preferences.set({ key: 'wellnessai_calories_tracked', value: (totalCalories + scanCalories).toString() });
          await Preferences.set({ key: 'wellnessai_recent_scans', value: JSON.stringify(updatedRecentScans) });
          if(import.meta.env.DEV)console.log('💾 Scan stats saved to Preferences');
        } catch (e) {
          console.warn('Could not save scan stats to Preferences:', e);
        }
        
        // ☁️ FIREBASE SYNC: Save to cloud
        try {
          const firestoreService = (await import('../services/firestoreService')).default;
          const authService = (await import('../services/authService')).default;
          const user = authService.getCurrentUser();
          if (user?.uid) {
            firestoreService.save('total_scans', totalScans + 1, user.uid)
              .then(() => console.log('☁️ total_scans synced'))
              .catch(err => console.warn('⚠️ total_scans sync failed:', err));
            firestoreService.save('scans_today', todayScans + 1, user.uid)
              .then(() => console.log('☁️ scans_today synced'))
              .catch(err => console.warn('⚠️ scans_today sync failed:', err));
            firestoreService.save('scans_today_date', new Date().toISOString().split('T')[0], user.uid)
              .catch(err => console.warn('⚠️ scans_today_date sync failed:', err));
            firestoreService.save('calories_tracked', totalCalories + scanCalories, user.uid)
              .catch(err => console.warn('⚠️ calories_tracked sync failed:', err));
            firestoreService.save('recent_scans', updatedRecentScans, user.uid)
              .catch(err => console.warn('⚠️ recent_scans sync failed:', err));
          }
        } catch (e) {
          console.warn('Could not sync scan stats to Firebase (will retry):', e);
        }
        
        // Award XP for successful scan
        if (window.addPoints) {
          window.addPoints(5, { x: window.innerWidth / 2, y: 100 });
        }
        
        // Update daily challenge
        if (window.updateDailyChallenge) {
          window.updateDailyChallenge('scan_food', 1);
        }
        
        if(import.meta.env.DEV)console.log('📊 Scan stats updated:', { totalScans: totalScans + 1, calories: scanCalories });
        
        // ⭐ GAMIFICATION: Log scan activity (scan-specific XP)
        try {
          const { default: gamificationService } = await import('../services/gamificationService');
          await gamificationService.logActivity('scan');
          if(import.meta.env.DEV)console.log('⭐ [GAMIFICATION] Scan activity logged');
        } catch (error) {
          console.error('❌ [GAMIFICATION] Failed to log scan activity:', error);
        }
        
        // ⭐ Note: Meal activity is logged automatically by authService.logFood()
        
        // Notify parent if callback exists
        if (onFoodScanned) {
          onFoodScanned(result);
        }
      } else {
        if(import.meta.env.DEV)console.error('❌ Failed to log meal:', logResult.error);
        showToast('Failed to log meal. Please try again.', 'error');
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Error logging meal:', error);
      showToast('Error logging meal. Please try again.', 'error');
    }
    
    // Keep modal open so user can scan another item
  };

  return (
    <div className={`barcode-scanner-modal ${scanning ? 'scanning-active' : ''}`}>
      <div className={`scanner-content ${scanning ? 'scanning-active' : ''}`}>
        <div className="scanner-header">
          <h2>📷 Scan Barcode</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {!scanning && !result && (
          <div className="scanner-instructions">
            <div className="barcode-icon">📦</div>
            <h3>Scan Food Barcode</h3>
            <p>Point your camera at the barcode</p>
            <p className="hint">📸 Live scanning - auto-detects when found!</p>
            
            <button className="scan-btn" onClick={handleScan}>
              📸 Start Scanning
            </button>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {(scanning || loading) && (
          <div className="scanning-state">
            <div className="loading-spinner"></div>
            <p>{scanning ? '📸 Point camera at barcode...' : '🔍 Looking up product...'}</p>
            {scanning && countdown > 0 && (
              <p className="countdown">⏱️ {countdown}s remaining</p>
            )}
          </div>
        )}

        {result && (
          <div className="scan-result">
            {result.image && (
              <img src={result.image} alt={result.name} className="food-image" />
            )}
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}}>
              <span style={{fontSize: '20px'}}>{result.sourceBadge}</span>
              <h3 style={{margin: 0}}>{result.name}</h3>
            </div>
            {result.brand && <p className="brand">{result.brand}</p>}
            {result.totalResults > 1 && (
              <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                🔍 Found {result.totalResults} matches across databases (showing best match)
              </p>
            )}

            <div className="nutrition-info">
              <h4>Nutrition (per {result.servingSize})</h4>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="label">Calories</span>
                  <span className="value">{result.calories}</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Protein</span>
                  <span className="value">{result.protein}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Carbs</span>
                  <span className="value">{result.carbs || result.carbohydrates}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Fat</span>
                  <span className="value">{result.fat || result.fats}g</span>
                </div>
              </div>
            </div>

            {result.allMatches && result.allMatches.length > 1 && (
              <details style={{marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px'}}>
                <summary style={{cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px'}}>
                  📊 View all {result.allMatches.length} matches
                </summary>
                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {result.allMatches.slice(1).map((match, idx) => (
                    <div key={idx} style={{padding: '8px', marginBottom: '8px', background: 'white', borderRadius: '6px', cursor: 'pointer'}} onClick={() => setResult({...match, allMatches: result.allMatches, totalResults: result.totalResults})}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span>{match.sourceBadge}</span>
                        <strong>{match.name}</strong>
                      </div>
                      <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                        {match.calories} cal | P: {match.protein}g | C: {match.carbs || match.carbohydrates}g | F: {match.fat || match.fats}g
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {result.ingredients && (
              <div className="ingredients">
                <h4>Ingredients</h4>
                <p>{result.ingredients}</p>
              </div>
            )}

            <div className="result-actions">
              <button className="add-btn" onClick={handleAddToMeal}>
                ✅ Add to Meal
              </button>
              <button className="rescan-btn" onClick={handleScan}>
                🔄 Scan Another
              </button>
            </div>

            <p className="source">Source: {result.source}</p>
          </div>
        )}

        {/* Scanner UI Overlay (invisible, used by native scanner) */}
        <div className="scanner-ui">
          <div className="scanner-overlay"></div>
          <div className="scanner-frame"></div>
          <div className="scanner-instructions">
            Position barcode within frame
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;



