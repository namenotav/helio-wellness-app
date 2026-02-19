// AR Scanner Component - Augmented Reality Food Overlay
import { useState } from 'react';
import { showToast } from './Toast';
import './ARScanner.css';
import arScannerService from '../services/arScannerService';
import subscriptionService from '../services/subscriptionService';
import PaywallModal from './PaywallModal';

export default function ARScanner({ onClose }) {
  const [scanning, setScanning] = useState(false);
  const [arOverlay, setArOverlay] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleStartScan = async () => {
    // Check access before scanning
    if (!subscriptionService.hasAccess('arScanner')) {
      setShowPaywall(true);
      return;
    }

    // Check usage limit
    const limitCheck = subscriptionService.checkLimit('arScans');
    if (!limitCheck.allowed) {
      showToast(limitCheck.message, 'warning');
      setShowPaywall(true);
      return;
    }

    setScanning(true);
    try {
      if(import.meta.env.DEV)console.log('🚀 Starting AR scan...');
      const result = await arScannerService.startARMode();
      if(import.meta.env.DEV)console.log('📥 AR scan result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'AR scan failed');
      }
      
      setCapturedImage(`data:image/jpeg;base64,${result.imageData}`);
      setArOverlay({
        ...result.overlayData,
        databaseMatches: result.databaseMatches || [] // Store database results
      });
      
      // Save scan result to storage
      const scanResult = {
        imageData: result.imageData,
        overlayData: result.overlayData,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      };
      
      // Read from Preferences first, fallback to localStorage
      const { Preferences } = await import('@capacitor/preferences');
      const { value: prefsScans } = await Preferences.get({ key: 'wellnessai_ar_scans' });
      let existingScans = [];
      try {
        const stored = JSON.parse(prefsScans || localStorage.getItem('ar_scans') || '[]');
        existingScans = Array.isArray(stored) ? stored : [];
      } catch (e) {
        existingScans = [];
      }
      existingScans.push(scanResult);
      
      // Write to both storages
      const arScansJson = JSON.stringify(existingScans);
      localStorage.setItem('ar_scans', arScansJson);
      await Preferences.set({ key: 'wellnessai_ar_scans', value: arScansJson });
      
      const syncService = (await import('../services/syncService')).default;
      await syncService.saveData('ar_scans', scanResult);
      
      if(import.meta.env.DEV)console.log('✅ AR overlay set with database matches:', result.overlayData);
      if(import.meta.env.DEV)console.log('📊 AR scan saved to storage');
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ AR scan error:', error);
      showToast('Failed to start AR scan: ' + error.message, 'error');
    }
    setScanning(false);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setArOverlay(null);
  };

  return (
    <div className="ar-overlay">
      <div className="ar-modal">
        <button className="ar-close" onClick={onClose}>✕</button>

        <h2 className="ar-title">📸 Body Scanner</h2>

        {!capturedImage ? (
          <div className="ar-start">
            <div className="ar-icon">🥗</div>
            <h3>Scan Any Food</h3>
            <p>Point your camera at food to see instant AR nutrition overlay</p>
            <button 
              className="ar-scan-btn"
              onClick={handleStartScan}
              disabled={scanning}
            >
              {scanning ? '⏳ Scanning...' : '📷 Start AR Scan'}
            </button>
          </div>
        ) : (
          <div className="ar-view">
            {/* Camera Feed - ONLY food name overlay */}
            <div className="ar-camera-feed">
              <img src={capturedImage} alt="Scanned food" className="ar-image" />
              
              {arOverlay && arOverlay.mainInfo && (
                <div className="ar-food-label">
                  {arOverlay.mainInfo.foodName}
                </div>
              )}
            </div>

            {/* ALL INFO BELOW IMAGE */}
            {arOverlay && (
              <div className="ar-info-panel">
                {/* Database Match Badge */}
                {arOverlay.mainInfo && arOverlay.mainInfo.databaseMatch && (
                  <div style={{fontSize: '12px', color: '#0284c7', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    ✓ Verified from {arOverlay.mainInfo.source}
                  </div>
                )}
                
                {/* Calories */}
                {arOverlay.mainInfo && (
                  <div className="info-calories">
                    🔥 {arOverlay.mainInfo.calories} Calories
                    {arOverlay.mainInfo.protein > 0 && (
                      <span style={{fontSize: '13px', marginLeft: '10px', color: '#666'}}>
                        💪 {arOverlay.mainInfo.protein}g | 🍞 {arOverlay.mainInfo.carbs}g | 🥑 {arOverlay.mainInfo.fats}g
                      </span>
                    )}
                  </div>
                )}

                {/* Nutrition Grid */}
                {arOverlay.nutritionPanel && (
                  <div className="info-nutrition-grid">
                    <div className="nutrition-card">
                      <div className="nutrition-icon">💪</div>
                      <div className="nutrition-value">{arOverlay.nutritionPanel.protein}</div>
                      <div className="nutrition-label">Protein</div>
                    </div>
                    <div className="nutrition-card">
                      <div className="nutrition-icon">🍞</div>
                      <div className="nutrition-value">{arOverlay.nutritionPanel.carbs}</div>
                      <div className="nutrition-label">Carbs</div>
                    </div>
                    <div className="nutrition-card">
                      <div className="nutrition-icon">🥑</div>
                      <div className="nutrition-value">{arOverlay.nutritionPanel.fat}</div>
                      <div className="nutrition-label">Fat</div>
                    </div>
                  </div>
                )}

                {/* Database Matches */}
                {arOverlay.databaseMatches && arOverlay.databaseMatches.length > 1 && (
                  <details style={{marginTop: '10px', fontSize: '13px', background: '#f0f9ff', padding: '10px', borderRadius: '8px'}}>
                    <summary style={{cursor: 'pointer', fontWeight: 'bold', color: '#0284c7'}}>
                      🔍 {arOverlay.databaseMatches.length} database matches available
                    </summary>
                    <div style={{maxHeight: '120px', overflowY: 'auto', marginTop: '8px'}}>
                      {arOverlay.databaseMatches.slice(0, 5).map((match, idx) => (
                        <div key={idx} style={{background: 'white', padding: '6px', marginBottom: '4px', borderRadius: '6px', fontSize: '11px'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <span>{match.sourceBadge}</span>
                            <strong>{match.name}</strong>
                          </div>
                          <div style={{color: '#666', fontSize: '10px'}}>
                            {match.calories} cal | P: {match.protein}g | C: {match.carbs || match.carbohydrates}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Safety Alert */}
                {arOverlay.safetyBanner && (
                  <div className={`info-safety-alert ${arOverlay.safetyBanner.level}`}>
                    {arOverlay.safetyBanner.message}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="ar-actions">
              <button className="ar-action-btn reset" onClick={handleReset}>
                🔄 Scan Again
              </button>
              <button className="ar-action-btn close" onClick={onClose}>
                ✓ Done
              </button>
            </div>
          </div>
        )}

        {/* Feature Info */}
        <div className="ar-features">
          <div className="feature-badge">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Instant Calorie Detection</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">⚠️</span>
            <span className="feature-text">Allergen Zones Highlighted</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">🍽️</span>
            <span className="feature-text">Smart Portion Guide</span>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName="AR Scanner"
          message={subscriptionService.getUpgradeMessage('arScanner')}
          currentPlan={subscriptionService.getCurrentPlan()}
        />
      )}
    </div>
  );
}



