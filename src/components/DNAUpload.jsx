// DNA Upload Component - Genetic Personalization
import { useState, useEffect } from 'react';
import './DNAUpload.css';
import dnaService from '../services/dnaService';
import subscriptionService from '../services/subscriptionService';
import PaywallModal from './PaywallModal';

export default function DNAUpload({ onClose }) {
  const [uploading, setUploading] = useState(false);
  const [dnaData, setDnaData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('traits'); // traits, meals, exercise, risks
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);
  const [replaceConsent1, setReplaceConsent1] = useState(false);
  const [replaceConsent2, setReplaceConsent2] = useState(false);

  // 🔥 Load saved DNA data when component opens
  useEffect(() => {
    // Check access on mount
    if (!subscriptionService.hasAccess('dnaAnalysis')) {
      setShowPaywall(true);
      setLoading(false);
      return;
    }

    const loadSavedData = async () => {
      const hasSavedData = await dnaService.loadSavedData();
      if (hasSavedData) {
        const report = dnaService.getFullDNAReport();
        if (report) {
          setDnaData(report);
          setAnalysis(dnaService.analysis);
          if(import.meta.env.DEV)console.log('✅ Loaded saved DNA data from storage');
        }
      }
      setLoading(false);
    };
    loadSavedData();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if(import.meta.env.DEV)console.log('File selected:', file.name, file.size, 'bytes');
    setUploading(true);
    
    try {
      const reader = new FileReader();
      
      reader.onerror = (error) => {
        if(import.meta.env.DEV)console.error('FileReader error:', error);
        alert('Failed to read file: ' + error);
        setUploading(false);
      };
      
      reader.onload = async (e) => {
        try {
          if(import.meta.env.DEV)console.log('File loaded, parsing DNA data...');
          const fileData = e.target.result;
          
          const result = await dnaService.uploadDNAData(fileData, file.name);
          if(import.meta.env.DEV)console.log('Upload result:', result);
          
          if (result.success) {
            if(import.meta.env.DEV)console.log('DNA upload successful, analyzing...');
            
            // Get the full report
            const report = dnaService.getFullDNAReport();
            if(import.meta.env.DEV)console.log('DNA report:', report);
            setDnaData(report);
            
            // Analyze genetics with AI
            await dnaService.analyzeGenetics();
            const analysisData = dnaService.analysis;
            if(import.meta.env.DEV)console.log('Analysis complete:', analysisData);
            setAnalysis(analysisData);
            
            alert(`✅ DNA Analysis Complete!\n${result.traitsFound || 0} genetic markers analyzed`);
          } else {
            alert('❌ Failed to parse DNA file: ' + (result.error || 'Unknown error'));
          }
          
          setUploading(false);
        } catch (error) {
          if(import.meta.env.DEV)console.error('DNA processing error:', error);
          alert('Failed to process DNA data: ' + error.message);
          setUploading(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      if(import.meta.env.DEV)console.error('DNA upload error:', error);
      alert('Failed to upload DNA data: ' + error.message);
      setUploading(false);
    }
  };

  const handleRequestReplace = () => {
    // Reset consent checkboxes
    setReplaceConsent1(false);
    setReplaceConsent2(false);
    setShowReplaceWarning(true);
  };

  const handleConfirmReplace = async () => {
    // Verify both consents are checked
    if (!replaceConsent1 || !replaceConsent2) {
      alert('❌ You must accept both statements to proceed');
      return;
    }

    try {
      // Clear existing DNA data
      const result = await dnaService.clearDNAData();
      if (!result.success) {
        alert('⚠️ Error clearing previous DNA data: ' + result.error);
        return;
      }

      // Reset UI state
      setDnaData(null);
      setAnalysis(null);
      setShowReplaceWarning(false);
      setReplaceConsent1(false);
      setReplaceConsent2(false);
      
      // Trigger file input
      document.getElementById('dna-file-input')?.click();
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error during replacement:', error);
      alert('❌ Error preparing for new upload: ' + error.message);
    }
  };

  const handleExportResults = () => {
    const report = dnaService.getFullDNAReport();
    if (!report) {
      alert('No DNA data to export');
      return;
    }

    const exportData = {
      uploadDate: report.uploadDate,
      source: report.source,
      snpsAnalyzed: report.geneticTraits.length,
      traits: report.geneticTraits,
      analysis: report.analysis
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dna-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ DNA results saved to Downloads!');
  };

  return (
    <div className="dna-overlay">
      <div className="dna-modal">
        <button className="dna-close" onClick={onClose}>✕</button>

        {/* Educational Disclaimer Banner */}
        <div style={{background: 'rgba(255, 68, 68, 0.15)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '2px solid rgba(255, 68, 68, 0.4)'}}>
          <div style={{fontSize: '14px', color: 'rgba(255, 68, 68, 0.95)', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            ⚠️ For Educational & Entertainment Purposes Only
          </div>
          <div style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', marginBottom: '12px'}}>
            This DNA analysis is NOT a medical diagnostic tool and should not be used for medical decisions. Results are educational and based on publicly available genetic research. Always consult qualified healthcare professionals for medical advice.
          </div>
          <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'white'}}>
            <input 
              type="checkbox" 
              checked={disclaimerAccepted} 
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              style={{width: '18px', height: '18px', cursor: 'pointer'}}
            />
            <span>I understand this is for educational purposes only and not medical advice</span>
          </label>
        </div>

        <h2 className="dna-title">🧬 DNA Personalization</h2>

        {loading ? (
          <div className="dna-upload-section">
            <div className="dna-icon">⏳</div>
            <h3>Loading DNA Data...</h3>
          </div>
        ) : !dnaData ? (
          <div className="dna-upload-section">
            <div className="dna-icon">🧬</div>
            <h3>Upload Your DNA Data</h3>
            <p>Support for 23andMe, AncestryDNA, and more</p>
            
            <label className={`upload-button ${!disclaimerAccepted ? 'disabled' : ''}`}>
              {uploading ? '⏳ Analyzing DNA...' : disclaimerAccepted ? '📁 Choose File' : '🔒 Accept Disclaimer First'}
              <input
                id="dna-file-input"
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileUpload}
                disabled={uploading || !disclaimerAccepted}
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
            {/* Tab Navigation - PRO EXPANDED */}
            <div className="dna-tabs">
              <button 
                className={`tab-btn ${activeTab === 'traits' ? 'active' : ''}`}
                onClick={() => setActiveTab('traits')}
              >
                🧬 Traits
              </button>
              <button 
                className={`tab-btn ${activeTab === 'ancestry' ? 'active' : ''}`}
                onClick={() => setActiveTab('ancestry')}
              >
                🌍 Ancestry
              </button>
              <button 
                className={`tab-btn ${activeTab === 'athletic' ? 'active' : ''}`}
                onClick={() => setActiveTab('athletic')}
              >
                🏃 Athletic
              </button>
              <button 
                className={`tab-btn ${activeTab === 'meals' ? 'active' : ''}`}
                onClick={() => setActiveTab('meals')}
              >
                🍽️ Nutrition
              </button>
              <button 
                className={`tab-btn ${activeTab === 'meds' ? 'active' : ''}`}
                onClick={() => setActiveTab('meds')}
              >
                💊 Meds
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
                <div className="dna-summary">
                  <h3>DNA Analysis Complete</h3>
                  <div className="snp-count">
                    📊 Analyzed <strong>{dnaData.geneticTraits?.length || 0}</strong> genetic markers
                  </div>
                  <div className="source-info">
                    🧬 Source: {dnaData.source || 'Unknown'}
                  </div>
                  <div className="dna-actions">
                    <button className="export-btn" onClick={handleExportResults}>
                      💾 Save Results
                    </button>
                    <button className="replace-btn" onClick={handleRequestReplace}>
                      🔄 Upload New DNA
                    </button>
                  </div>
                </div>

                <h3>Your Genetic Traits</h3>
                <div className="traits-list">
                  {dnaData.geneticTraits?.map((trait, idx) => (
                    <div key={idx} className={`trait-card risk-${trait.risk}`}>
                      <div className="trait-header">
                        <span className="trait-gene">{trait.gene}</span>
                        <span className="trait-genotype">{trait.genotype}</span>
                      </div>
                      <div className="trait-name">{trait.trait.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="trait-value">{trait.value}</div>
                      <div className="trait-description">{trait.description}</div>
                      {trait.rsid !== 'demo' && (
                        <div className="trait-rsid">SNP: {trait.rsid}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meals Tab */}
            {activeTab === 'meals' && dnaData && (
              <div className="meals-view">
                <h3>DNA-Optimized Nutrition</h3>
                {analysis && analysis.foodsToEmphasize ? (
                  <div className="recommendations-list">
                    <div className="diet-section">
                      <h4>✅ Foods to Emphasize:</h4>
                      <div className="food-tags">
                        {analysis.foodsToEmphasize?.map((food, idx) => (
                          <span key={idx} className="food-tag good">{food}</span>
                        ))}
                      </div>
                    </div>
                    <div className="diet-section">
                      <h4>⚠️ Foods to Limit/Avoid:</h4>
                      <div className="food-tags">
                        {analysis.foodsToAvoid?.map((food, idx) => (
                          <span key={idx} className="food-tag avoid">{food}</span>
                        ))}
                      </div>
                    </div>
                    <div className="diet-section">
                      <h4>💊 Supplement Recommendations:</h4>
                      <div className="food-tags">
                        {analysis.supplementAdvice?.map((sup, idx) => (
                          <span key={idx} className="food-tag supplement">{sup}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="loading-msg">⏳ Analyzing your genetics for personalized nutrition...</div>
                )}
              </div>
            )}

            {/* Exercise Tab */}
            {activeTab === 'exercise' && dnaData && (
              <div className="exercise-view">
                <h3>Genetic Exercise Plan</h3>
                {analysis && analysis.exerciseRecommendations ? (
                  <div className="exercise-plan">
                    <div className="exercise-list">
                      {analysis.exerciseRecommendations.map((rec, idx) => (
                        <div key={idx} className="exercise-card">
                          <div className="exercise-icon">💪</div>
                          <div className="exercise-content">{rec}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="loading-msg">⏳ Generating personalized workout plan...</div>
                )}
              </div>
            )}

            {/* Ancestry Tab - PRO */}
            {activeTab === 'ancestry' && dnaData?.ancestryBreakdown && (
              <div className="ancestry-view">
                <h3>🌍 Your Ancestry Breakdown</h3>
                <div className="diversity-score">
                  <div>Genetic Diversity Score: <strong>{dnaData.ancestryBreakdown.diversityScore}/100</strong></div>
                  <div className="diversity-bar" style={{width: `${dnaData.ancestryBreakdown.diversityScore}%`}}></div>
                </div>
                <div className="ancestry-list">
                  {dnaData.ancestryBreakdown.breakdown.map((ancestry, idx) => (
                    <div key={idx} className="ancestry-card">
                      <div className="ancestry-header">
                        <span className="ancestry-region">{ancestry.region}</span>
                        <span className="ancestry-percentage">{ancestry.percentage}%</span>
                      </div>
                      <div className="ancestry-bar-container">
                        <div className="ancestry-bar" style={{width: `${ancestry.percentage}%`}}></div>
                      </div>
                      <div className="ancestry-countries">{ancestry.countries.join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Athletic Profile Tab - PRO */}
            {activeTab === 'athletic' && dnaData?.athleticProfile && (
              <div className="athletic-view">
                <h3>🏃 Your Athletic Genetic Profile</h3>
                <div className="athletic-scores">
                  <div className="score-card">
                    <div className="score-label">Power</div>
                    <div className="score-value">{dnaData.athleticProfile.powerScore}/100</div>
                    <div className="score-bar">
                      <div style={{width: `${dnaData.athleticProfile.powerScore}%`}}></div>
                    </div>
                  </div>
                  <div className="score-card">
                    <div className="score-label">Endurance</div>
                    <div className="score-value">{dnaData.athleticProfile.enduranceScore}/100</div>
                    <div className="score-bar">
                      <div style={{width: `${dnaData.athleticProfile.enduranceScore}%`}}></div>
                    </div>
                  </div>
                </div>
                <div className="athletic-traits">
                  <div className="trait-row"><strong>Recovery Speed:</strong> {dnaData.athleticProfile.recoverySpeed}</div>
                  <div className="trait-row"><strong>Injury Risk:</strong> {dnaData.athleticProfile.injuryRisk}</div>
                  <div className="trait-row"><strong>Optimal Training:</strong> {dnaData.athleticProfile.optimalTrainingType}</div>
                </div>
                <h4>Genetic Markers:</h4>
                <div className="genes-list">
                  {dnaData.athleticProfile.genes.map((gene, idx) => (
                    <div key={idx} className="gene-card">
                      <div className="gene-name">{gene.gene} ({gene.result})</div>
                      <div className="gene-trait">{gene.trait}</div>
                      <div className="gene-score">Score: {gene.score}/100</div>
                    </div>
                  ))}
                </div>
                <h4>Recommendations:</h4>
                {dnaData.athleticProfile.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation">✓ {rec}</div>
                ))}
              </div>
            )}

            {/* Pharmacogenomics Tab - PRO */}
            {activeTab === 'meds' && dnaData?.pharmacogenomics && (
              <div className="meds-view">
                <h3>💊 Medication Response Profile</h3>
                <p className="warning-text">⚠️ Informational only - always consult your doctor before changing medications</p>
                <div className="meds-list">
                  {dnaData.pharmacogenomics.map((med, idx) => (
                    <div key={idx} className={`med-card risk-${med.riskLevel}`}>
                      <div className="med-header">
                        <span className="med-name">{med.drug}</span>
                        <span className={`risk-badge ${med.riskLevel}`}>{med.riskLevel.toUpperCase()}</span>
                      </div>
                      <div className="med-gene">Gene: {med.gene}</div>
                      <div className="med-recommendation"><strong>{med.recommendation}</strong></div>
                      <div className="med-description">{med.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks Tab - PRO ENHANCED */}
            {activeTab === 'risks' && dnaData?.healthRiskScores && (
              <div className="risks-view">
                <h3>⚠️ Health Risk Assessment</h3>
                <p className="info-text">Lifetime risk percentages compared to population average</p>
                <div className="risks-detailed-list">
                  {dnaData.healthRiskScores.map((risk, idx) => (
                    <div key={idx} className={`risk-detailed-card ${risk.riskLevel.replace(/ /g, '-').toLowerCase()}`}>
                      <div className="risk-detailed-header">
                        <span className="condition-name">{risk.condition}</span>
                        <span className={`risk-level-badge ${risk.riskLevel.replace(/ /g, '-').toLowerCase()}`}>
                          {risk.riskLevel}
                        </span>
                      </div>
                      <div className="risk-comparison">
                        <div className="risk-bar-row">
                          <span>Your Risk:</span>
                          <div className="risk-bar-container">
                            <div className="risk-bar your-risk" style={{width: `${risk.yourRisk}%`}}></div>
                          </div>
                          <span>{risk.yourRisk}%</span>
                        </div>
                        <div className="risk-bar-row">
                          <span>Average:</span>
                          <div className="risk-bar-container">
                            <div className="risk-bar avg-risk" style={{width: `${risk.populationAverage}%`}}></div>
                          </div>
                          <span>{risk.populationAverage}%</span>
                        </div>
                      </div>
                      <div className="risk-genes">Genes analyzed: {risk.genes.join(', ')}</div>
                      <div className="prevention-tips">
                        <strong>Prevention:</strong>
                        <ul>
                          {risk.preventionTips.map((tip, tipIdx) => (
                            <li key={tipIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Tab - PRO ENHANCED */}
            {activeTab === 'meals' && dnaData?.nutritionGenetics && (
              <div className="nutrition-view-pro">
                <h3>🍽️ Personalized Nutrition Genetics</h3>
                
                <div className="macro-section">
                  <h4>Macronutrient Recommendations</h4>
                  <div className="macro-cards">
                    <div className="macro-card">
                      <div className="macro-name">Carbohydrates</div>
                      <div className="macro-value">{dnaData.nutritionGenetics.macronutrients.carbs.recommendation}</div>
                      <div className="macro-tolerance">Tolerance: {dnaData.nutritionGenetics.macronutrients.carbs.tolerance}</div>
                    </div>
                    <div className="macro-card">
                      <div className="macro-name">Fats</div>
                      <div className="macro-value">{dnaData.nutritionGenetics.macronutrients.fats.recommendation}</div>
                      <div className="macro-tolerance">Tolerance: {dnaData.nutritionGenetics.macronutrients.fats.tolerance}</div>
                    </div>
                    <div className="macro-card">
                      <div className="macro-name">Protein</div>
                      <div className="macro-value">{dnaData.nutritionGenetics.macronutrients.protein.recommendation}</div>
                      <div className="macro-tolerance">Needs: {dnaData.nutritionGenetics.macronutrients.protein.needs}</div>
                    </div>
                  </div>
                </div>

                <div className="intolerance-section">
                  <h4>Food Intolerances & Metabolism</h4>
                  {dnaData.nutritionGenetics.intolerances.map((item, idx) => (
                    <div key={idx} className="intolerance-card">
                      <div className="food-name">{item.food}</div>
                      <div className="gene-info">Gene: {item.gene}</div>
                      {item.metabolism && <div className="metabolism">Metabolism: {item.metabolism}</div>}
                      {item.likelihood && <div className="likelihood">Intolerance Likelihood: {item.likelihood}</div>}
                      {item.safeAmount && <div className="safe-amount">Safe Amount: {item.safeAmount}</div>}
                      <div className={`can-consume ${item.canConsume ? 'yes' : 'no'}`}>
                        {item.canConsume ? '✓ Can Consume' : '✗ Avoid'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="vitamin-section">
                  <h4>Vitamin Absorption Profile</h4>
                  {dnaData.nutritionGenetics.vitamins.map((vit, idx) => (
                    <div key={idx} className="vitamin-card">
                      <div className="vitamin-name">{vit.vitamin}</div>
                      <div className="vitamin-gene">Gene: {vit.gene}</div>
                      <div className="vitamin-absorption">Absorption: {vit.absorption || vit.conversion}</div>
                      <div className="vitamin-recommendation"><strong>{vit.recommendation}</strong></div>
                      {vit.recommendedIU && <div className="dosage">Recommended: {vit.recommendedIU} IU/day</div>}
                      {vit.recommendedMCG && <div className="dosage">Recommended: {vit.recommendedMCG} mcg/day</div>}
                    </div>
                  ))}
                </div>

                <div className="diet-recommendation">
                  <h4>Optimal Diet Type</h4>
                  <div className="diet-type">{dnaData.nutritionGenetics.dietType}</div>
                  <div className="diet-reason">{dnaData.nutritionGenetics.reason}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={onClose}
          featureName="DNA Analysis"
          message={subscriptionService.getUpgradeMessage('dnaAnalysis')}
          currentPlan={subscriptionService.getCurrentPlan()}
        />
      )}

      {/* DNA Replacement Warning Modal */}
      {showReplaceWarning && (
        <div className="modal-overlay">
          <div className="dna-replace-modal">
            <div className="modal-header orange-alert">
              <h3>⚠️ Replace DNA Profile</h3>
              <p>This will delete your current DNA analysis and replace it with a new one</p>
            </div>
            
            <div className="modal-content">
              <div className="warning-box">
                <strong>Important:</strong> This action cannot be undone. Your previous DNA analysis will be permanently removed.
              </div>

              <div className="consent-section">
                <label className="consent-checkbox">
                  <input
                    type="checkbox"
                    checked={replaceConsent1}
                    onChange={(e) => setReplaceConsent1(e.target.checked)}
                  />
                  <span>I understand this will delete my current DNA profile</span>
                </label>

                <label className="consent-checkbox">
                  <input
                    type="checkbox"
                    checked={replaceConsent2}
                    onChange={(e) => setReplaceConsent2(e.target.checked)}
                  />
                  <span>I confirm this is my DNA and I want to replace the previous profile</span>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowReplaceWarning(false)}
              >
                ❌ Cancel
              </button>
              <button
                className={`proceed-btn ${(replaceConsent1 && replaceConsent2) ? 'enabled' : 'disabled'}`}
                onClick={handleConfirmReplace}
                disabled={!replaceConsent1 || !replaceConsent2}
              >
                ✓ Proceed with Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



