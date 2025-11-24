// DNA Personalization Service - Genetic-based health recommendations
import geminiService from './geminiService';

class DNAService {
  constructor() {
    this.geneticData = null;
    this.analysisComplete = false;
  }

  // Upload and parse DNA data file
  async uploadDNAData(fileData, source) {
    try {
      // Parse DNA data based on source
      const parsed = await this.parseDNAFile(fileData, source);
      
      if (parsed.success) {
        this.geneticData = parsed.data;
        await this.analyzeGenetics();
        
        return {
          success: true,
          message: 'DNA data uploaded successfully',
          traitsFound: this.geneticData.traits.length
        };
      }
      
      return { success: false, error: 'Failed to parse DNA data' };
    } catch (error) {
      console.error('DNA upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // Parse DNA file from different sources
  async parseDNAFile(fileData, source) {
    // Simulated parsing - real app would parse actual 23andMe/AncestryDNA files
    console.log(`Parsing DNA data from ${source}...`);
    
    // Demo genetic traits
    const demoTraits = {
      metabolism: 'fast',
      lactoseIntolerance: 'likely',
      caffeineMetabolism: 'slow',
      saturatedFatResponse: 'increased-risk',
      muscleType: 'power-oriented',
      enduranceCapacity: 'high',
      carbohydrateSensitivity: 'moderate',
      vitaminDAbsorption: 'low',
      omega3Conversion: 'inefficient',
      glutenSensitivity: 'low-risk',
      alcoholMetabolism: 'slow',
      saltSensitivity: 'high'
    };
    
    return {
      success: true,
      data: {
        source,
        uploadDate: new Date().toISOString(),
        traits: Object.entries(demoTraits).map(([trait, value]) => ({ trait, value })),
        raw: fileData
      }
    };
  }

  // Analyze genetics with AI
  async analyzeGenetics() {
    if (!this.geneticData) return;

    const traits = this.geneticData.traits;
    const traitsSummary = traits.map(t => `${t.trait}: ${t.value}`).join(', ');
    
    const prompt = `Based on these genetic traits: ${traitsSummary}

Generate personalized health recommendations in JSON format:
{
  "dietRecommendations": ["rec1", "rec2"],
  "exerciseRecommendations": ["rec1", "rec2"],
  "supplementAdvice": ["sup1", "sup2"],
  "foodsToAvoid": ["food1", "food2"],
  "foodsToEmphasize": ["food1", "food2"],
  "healthRisks": ["risk1", "risk2"],
  "preventionStrategies": ["strategy1", "strategy2"]
}`;

    const model = geminiService.getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        this.analysis = JSON.parse(jsonMatch[0]);
        this.analysisComplete = true;
      }
    } catch (error) {
      console.error('Analysis parsing error:', error);
    }
  }

  // Get personalized meal plan based on DNA
  async getGeneticMealPlan(days = 7) {
    if (!this.geneticData || !this.analysisComplete) {
      return { success: false, message: 'Upload DNA data first' };
    }

    const traits = this.geneticData.traits;
    const analysis = this.analysis;
    
    const prompt = `Create a ${days}-day meal plan optimized for someone with these genetic traits:
${traits.map(t => `- ${t.trait}: ${t.value}`).join('\n')}

Foods to emphasize: ${analysis.foodsToEmphasize?.join(', ')}
Foods to avoid: ${analysis.foodsToAvoid?.join(', ')}

Return JSON:
{
  "days": [
    {
      "day": 1,
      "breakfast": {"meal": "name", "calories": 400, "why": "genetic reason"},
      "lunch": {"meal": "name", "calories": 600, "why": "genetic reason"},
      "dinner": {"meal": "name", "calories": 600, "why": "genetic reason"},
      "snacks": [{"snack": "name", "calories": 150, "why": "genetic reason"}]
    }
  ]
}`;

    const model = geminiService.getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mealPlan = JSON.parse(jsonMatch[0]);
        return { success: true, mealPlan };
      }
    } catch (error) {
      console.error('Meal plan error:', error);
    }
    
    return { success: false, message: 'Failed to generate meal plan' };
  }

  // Get DNA-optimized exercise plan
  async getGeneticExercisePlan() {
    if (!this.geneticData) {
      return { success: false, message: 'Upload DNA data first' };
    }

    const muscleType = this.geneticData.traits.find(t => t.trait === 'muscleType')?.value;
    const endurance = this.geneticData.traits.find(t => t.trait === 'enduranceCapacity')?.value;
    
    let plan = [];
    
    if (muscleType === 'power-oriented') {
      plan.push({
        type: 'Strength Training',
        frequency: '4x/week',
        exercises: ['Squats', 'Deadlifts', 'Bench Press', 'Overhead Press'],
        sets: '3-5 sets',
        reps: '4-6 reps',
        reason: 'Your genetics favor power development'
      });
    } else {
      plan.push({
        type: 'Endurance Training',
        frequency: '5x/week',
        exercises: ['Running', 'Cycling', 'Swimming', 'Rowing'],
        duration: '45-60 min',
        reason: 'Your genetics favor endurance activities'
      });
    }
    
    if (endurance === 'high') {
      plan.push({
        type: 'HIIT',
        frequency: '2x/week',
        duration: '20-30 min',
        reason: 'Your high endurance capacity allows for intense intervals'
      });
    }
    
    return { success: true, plan };
  }

  // Predict disease risks
  getPredictedHealthRisks() {
    if (!this.analysis) return [];
    
    return this.analysis.healthRisks || [];
  }

  // Get supplement recommendations
  getSupplementAdvice() {
    if (!this.analysis) return [];
    
    return this.analysis.supplementAdvice || [];
  }

  // Get full DNA report
  getFullDNAReport() {
    if (!this.geneticData || !this.analysisComplete) {
      return null;
    }

    return {
      geneticTraits: this.geneticData.traits,
      analysis: this.analysis,
      uploadDate: this.geneticData.uploadDate,
      source: this.geneticData.source
    };
  }

  // Check if user has uploaded DNA data
  hasDNAData() {
    return this.geneticData !== null;
  }
}

export const dnaService = new DNAService();
export default dnaService;
