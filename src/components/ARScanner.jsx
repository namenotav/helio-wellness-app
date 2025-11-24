// AR Scanner Component - Augmented Reality Food Overlay
import { useState } from 'react';
import './ARScanner.css';
import arScannerService from '../services/arScannerService';

export default function ARScanner({ onClose }) {
  const [scanning, setScanning] = useState(false);
  const [arOverlay, setArOverlay] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleStartScan = async () => {
    setScanning(true);
    try {
      const result = await arScannerService.startARMode();
      setCapturedImage(result.imageData);
      setArOverlay(result.arOverlay);
    } catch (error) {
      console.error('AR scan error:', error);
      alert('Failed to start AR scan: ' + error.message);
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

        <h2 className="ar-title">📸 AR Food Scanner</h2>

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
            {/* Camera Feed with AR Overlay */}
            <div className="ar-camera-feed">
              <img src={capturedImage} alt="Scanned food" className="ar-image" />
              
              {arOverlay && (
                <>
                  {/* Main Info (Top Center) */}
                  {arOverlay.mainInfo && (
                    <div 
                      className="ar-main-info"
                      style={{ color: arOverlay.mainInfo.color }}
                    >
                      <div className="ar-food-name">{arOverlay.mainInfo.foodName}</div>
                      <div className="ar-calories">{arOverlay.mainInfo.calories} cal</div>
                    </div>
                  )}

                  {/* Allergen Zones (Red Overlays) */}
                  {arOverlay.allergenZones && arOverlay.allergenZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="ar-allergen-zone"
                      style={{
                        top: zone.position.y,
                        left: zone.position.x,
                        borderColor: zone.color,
                        opacity: zone.intensity,
                        animationDelay: `${idx * 0.2}s`
                      }}
                    >
                      <span className="allergen-label">⚠️ {zone.allergen}</span>
                    </div>
                  ))}

                  {/* Portion Guide (Circle) */}
                  {arOverlay.portionGuide && (
                    <div 
                      className="ar-portion-guide"
                      style={{
                        width: arOverlay.portionGuide.diameter,
                        height: arOverlay.portionGuide.diameter,
                        borderColor: arOverlay.portionGuide.color,
                        opacity: arOverlay.portionGuide.opacity
                      }}
                    >
                      <span className="portion-label">{arOverlay.portionGuide.label}</span>
                    </div>
                  )}

                  {/* Nutrition Panel (Right Side) */}
                  {arOverlay.nutritionPanel && (
                    <div className="ar-nutrition-panel">
                      <div className="nutrition-item">
                        <span className="nutrition-icon">💪</span>
                        <span className="nutrition-value">{arOverlay.nutritionPanel.protein}</span>
                        <span className="nutrition-label">Protein</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-icon">🍞</span>
                        <span className="nutrition-value">{arOverlay.nutritionPanel.carbs}</span>
                        <span className="nutrition-label">Carbs</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-icon">🥑</span>
                        <span className="nutrition-value">{arOverlay.nutritionPanel.fat}</span>
                        <span className="nutrition-label">Fat</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-icon">🌾</span>
                        <span className="nutrition-value">{arOverlay.nutritionPanel.fiber}</span>
                        <span className="nutrition-label">Fiber</span>
                      </div>
                    </div>
                  )}

                  {/* Safety Banner (Bottom) */}
                  {arOverlay.safetyBanner && (
                    <div 
                      className={`ar-safety-banner ${arOverlay.safetyBanner.level} ${arOverlay.safetyBanner.animated ? 'animated' : ''}`}
                    >
                      {arOverlay.safetyBanner.message}
                    </div>
                  )}
                </>
              )}
            </div>

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
    </div>
  );
}
