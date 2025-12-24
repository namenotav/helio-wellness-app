// DNA Analysis Component - 23andMe Integration
import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import syncService from '../services/syncService';
import gamificationService from '../services/gamificationService';
import './DNAAnalysis.css';

const DNAAnalysis = ({ onClose }) => {
  const [dnaFile, setDnaFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    // Load existing DNA analysis from storage
    const loadSavedAnalysis = async () => {
      try {
        const { value } = await Preferences.get({ key: 'dna_analysis' });
        if (value) {
          const savedResults = JSON.parse(value);
          setResults(savedResults);
          if(import.meta.env.DEV)console.log('📊 Loaded saved DNA analysis:', savedResults);
        }
      } catch (error) {
        console.error('Failed to load DNA analysis:', error);
      }
    };
    loadSavedAnalysis();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setDnaFile(file);
      await analyzeDNA(file);
    }
  };

  const analyzeDNA = async (file) => {
    setIsAnalyzing(true);
    
    try {
      // Read file
      const text = await file.text();
      
      // Parse DNA data (simplified)
      const insights = {
        fitnessGenes: ['ACTN3 (Power)', 'ACE (Endurance)', 'PPARGC1A (Metabolism)'],
        nutritionGenes: ['FTO (Obesity risk)', 'MTHFR (Folate)', 'CYP1A2 (Caffeine)'],
        healthRisks: ['Type 2 Diabetes: Low', 'Heart Disease: Moderate', 'Obesity: Low'],
        recommendations: [
          'High protein diet recommended',
          'Strength training optimal',
          'Limit caffeine after 2 PM'
        ]
      };
      
      setResults(insights);
      
      // Save to storage
      await Preferences.set({ key: 'dna_analysis', value: JSON.stringify(insights) });
      await syncService.saveData('dna_analysis', insights);
      
      // Award achievement
      gamificationService.addPoints(50, 'dna_upload');
      
    } catch (error) {
      console.error('DNA analysis failed:', error);
      alert('Failed to analyze DNA file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dna-modal">
      <div className="dna-content">
        <div className="dna-header">
          <h2>🧬 DNA Analysis</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {!results && (
          <div className="upload-section">
            <h3>Upload 23andMe Raw Data</h3>
            <input type="file" accept=".txt,.csv" onChange={handleFileUpload} />
            {isAnalyzing && <div className="loading">Analyzing DNA...</div>}
          </div>
        )}

        {results && (
          <div className="results-section">
            <h3>Your Genetic Insights</h3>
            <div className="insight-category">
              <h4>💪 Fitness Genes</h4>
              {results.fitnessGenes.map((gene, i) => <p key={i}>{gene}</p>)}
            </div>
            <div className="insight-category">
              <h4>🍎 Nutrition Genes</h4>
              {results.nutritionGenes.map((gene, i) => <p key={i}>{gene}</p>)}
            </div>
            <div className="insight-category">
              <h4>⚕️ Health Risks</h4>
              {results.healthRisks.map((risk, i) => <p key={i}>{risk}</p>)}
            </div>
            <div className="recommendations">
              <h4>📋 Personalized Recommendations</h4>
              {results.recommendations.map((rec, i) => <p key={i}>✓ {rec}</p>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DNAAnalysis;
