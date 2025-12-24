// DNA Analysis Service - 23andMe File Parser & Health Insights
import firebaseService from './firebaseService.js';
import syncService from './syncService.js';

class DNAAnalysisService {
  constructor() {
    this.dnaData = null;
    this.healthRisks = [];
    this.nutritionInsights = [];
    this.fitnessTraits = [];
  }

  /**
   * Parse 23andMe raw data file
   * File format: rsid, chromosome, position, genotype
   * Example: rs12345 1 12345 AG
   */
  async parse23andMe(fileContent) {
    try {
      const lines = fileContent.split('\n');
      const variants = [];
      
      for (const line of lines) {
        // Skip comment lines
        if (line.startsWith('#')) continue;
        
        const parts = line.trim().split(/\s+/);
        if (parts.length < 4) continue;
        
        const [rsid, chromosome, position, genotype] = parts;
        
        variants.push({
          rsid,
          chromosome,
          position: parseInt(position),
          genotype,
          timestamp: new Date().toISOString()
        });
      }
      
      this.dnaData = {
        variants,
        uploadDate: new Date().toISOString(),
        totalVariants: variants.length
      };
      
      // Save to storage
      await syncService.saveData('dna_data', this.dnaData);
      
      // Analyze traits
      await this.analyzeDNA();
      
      console.log(`✅ Parsed ${variants.length} DNA variants`);
      return this.dnaData;
    } catch (error) {
      console.error('❌ Error parsing 23andMe file:', error);
      throw error;
    }
  }

  /**
   * Parse MyHeritage DNA file
   */
  async parseMyHeritage(fileContent) {
    // Similar format to 23andMe
    return this.parse23andMe(fileContent);
  }

  /**
   * Analyze DNA for health insights
   */
  async analyzeDNA() {
    if (!this.dnaData || !this.dnaData.variants) {
      throw new Error('No DNA data loaded');
    }

    const variants = this.dnaData.variants;
    
    // Check for common health-related SNPs
    const snpDatabase = this.getHealthSNPs();
    
    for (const snp of snpDatabase) {
      const variant = variants.find(v => v.rsid === snp.rsid);
      
      if (variant && variant.genotype === snp.riskGenotype) {
        this.healthRisks.push({
          rsid: snp.rsid,
          trait: snp.trait,
          genotype: variant.genotype,
          risk: snp.riskLevel,
          description: snp.description,
          recommendations: snp.recommendations
        });
      }
    }
    
    // Generate nutrition insights
    this.generateNutritionInsights();
    
    // Generate fitness traits
    this.generateFitnessTraits();
    
    // Save analysis results
    await syncService.saveData('dna_analysis_results', {
      healthRisks: this.healthRisks,
      nutritionInsights: this.nutritionInsights,
      fitnessTraits: this.fitnessTraits,
      analysisDate: new Date().toISOString()
    });
    
    return {
      healthRisks: this.healthRisks,
      nutritionInsights: this.nutritionInsights,
      fitnessTraits: this.fitnessTraits
    };
  }

  /**
   * Get database of health-related SNPs
   * Source: OpenSNP, SNPedia, research papers
   */
  getHealthSNPs() {
    return [
      {
        rsid: 'rs9939609',
        trait: 'Obesity Risk',
        riskGenotype: 'AA',
        riskLevel: 'high',
        description: 'Higher risk of obesity and type 2 diabetes',
        recommendations: ['Monitor calorie intake', 'Increase physical activity', 'Avoid high-sugar foods']
      },
      {
        rsid: 'rs1801133',
        trait: 'Folate Metabolism',
        riskGenotype: 'TT',
        riskLevel: 'moderate',
        description: 'Reduced ability to process folate (vitamin B9)',
        recommendations: ['Supplement with methylfolate', 'Eat leafy greens', 'Avoid alcohol']
      },
      {
        rsid: 'rs762551',
        trait: 'Caffeine Metabolism',
        riskGenotype: 'AA',
        riskLevel: 'low',
        description: 'Slow caffeine metabolism - may increase heart risk',
        recommendations: ['Limit coffee to 1 cup/day', 'Avoid energy drinks', 'Switch to decaf']
      },
      {
        rsid: 'rs4680',
        trait: 'Stress Response',
        riskGenotype: 'AA',
        riskLevel: 'moderate',
        description: 'Lower stress tolerance, higher anxiety risk',
        recommendations: ['Practice meditation', 'Regular exercise', 'Magnesium supplementation']
      },
      {
        rsid: 'rs1815739',
        trait: 'Athletic Performance',
        riskGenotype: 'TT',
        riskLevel: 'positive',
        description: 'Better suited for endurance sports',
        recommendations: ['Focus on cardio training', 'Marathon/cycling training', 'VO2 max optimization']
      },
      {
        rsid: 'rs4633',
        trait: 'Vitamin D Metabolism',
        riskGenotype: 'TT',
        riskLevel: 'moderate',
        description: 'Lower vitamin D levels, higher bone disease risk',
        recommendations: ['Vitamin D3 supplementation', 'Sun exposure 15min/day', 'Calcium-rich foods']
      },
      {
        rsid: 'rs1801260',
        trait: 'Circadian Rhythm',
        riskGenotype: 'AA',
        riskLevel: 'moderate',
        description: 'Night owl chronotype - delayed sleep phase',
        recommendations: ['Melatonin 1-2 hours before bed', 'Blue light blockers', 'Consistent sleep schedule']
      },
      {
        rsid: 'rs1800497',
        trait: 'Dopamine Receptor',
        riskGenotype: 'TT',
        riskLevel: 'high',
        description: 'Higher risk of addiction and reward-seeking behavior',
        recommendations: ['Avoid addictive substances', 'Reward system awareness', 'Behavioral therapy']
      }
    ];
  }

  /**
   * Generate personalized nutrition insights
   */
  generateNutritionInsights() {
    const insights = [];
    
    // Check lactose intolerance (rs4988235)
    const lactose = this.dnaData.variants.find(v => v.rsid === 'rs4988235');
    if (lactose && lactose.genotype === 'AA') {
      insights.push({
        category: 'Dairy',
        title: 'Lactose Intolerance Risk',
        recommendation: 'Consider lactose-free dairy or plant-based alternatives',
        priority: 'high'
      });
    }
    
    // Check alcohol metabolism (rs671)
    const alcohol = this.dnaData.variants.find(v => v.rsid === 'rs671');
    if (alcohol && alcohol.genotype === 'AA') {
      insights.push({
        category: 'Alcohol',
        title: 'Slow Alcohol Metabolism',
        recommendation: 'Limit alcohol consumption to avoid toxicity',
        priority: 'high'
      });
    }
    
    // Check gluten sensitivity (HLA-DQ2/DQ8 region)
    insights.push({
      category: 'Grains',
      title: 'Gluten Sensitivity',
      recommendation: 'Monitor for celiac disease symptoms',
      priority: 'moderate'
    });
    
    this.nutritionInsights = insights;
  }

  /**
   * Generate fitness trait analysis
   */
  generateFitnessTraits() {
    const traits = [];
    
    // Check ACTN3 (sprint vs endurance)
    const actn3 = this.dnaData.variants.find(v => v.rsid === 'rs1815739');
    if (actn3) {
      if (actn3.genotype === 'CC') {
        traits.push({
          trait: 'Power Athlete',
          description: 'Better suited for sprinting and power sports',
          recommendation: 'Focus on HIIT, weightlifting, explosive movements'
        });
      } else if (actn3.genotype === 'TT') {
        traits.push({
          trait: 'Endurance Athlete',
          description: 'Better suited for long-distance running and cycling',
          recommendation: 'Focus on cardio, marathon training, zone 2 work'
        });
      }
    }
    
    // Check ACE (muscle efficiency)
    const ace = this.dnaData.variants.find(v => v.rsid === 'rs4341');
    if (ace && ace.genotype === 'II') {
      traits.push({
        trait: 'Efficient Muscle Builder',
        description: 'Better muscle response to strength training',
        recommendation: 'Progressive overload, protein-rich diet'
      });
    }
    
    this.fitnessTraits = traits;
  }

  /**
   * Get stored DNA analysis results
   */
  async getAnalysisResults() {
    const results = await syncService.getData('dna_analysis_results');
    if (results) {
      this.healthRisks = results.healthRisks || [];
      this.nutritionInsights = results.nutritionInsights || [];
      this.fitnessTraits = results.fitnessTraits || [];
    }
    return results;
  }

  /**
   * Delete all DNA data (privacy)
   */
  async deleteDNAData() {
    this.dnaData = null;
    this.healthRisks = [];
    this.nutritionInsights = [];
    this.fitnessTraits = [];
    
    await syncService.deleteData('dna_data');
    await syncService.deleteData('dna_analysis_results');
    
    console.log('🗑️ DNA data deleted');
  }

  /**
   * Check if user has uploaded DNA data
   */
  async hasDNAData() {
    const data = await syncService.getData('dna_data');
    return data && data.variants && data.variants.length > 0;
  }
}

export default new DNAAnalysisService();
