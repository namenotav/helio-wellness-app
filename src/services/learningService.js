// Learning Service - AI Pattern Recognition & Prediction
import authService from './authService';
import geminiService from './geminiService';

class LearningService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.API_URL = import.meta.env.VITE_API_URL || 'https://helio-wellness-app-production.up.railway.app';
    this.rateLimits = { lastCall: {}, callCount: {}, resetTime: {} };
  }

  // Analyze eating patterns and symptoms
  async analyzePatterns() {
    const user = authService.getCurrentUser();
    if (!user) return null;

    const { foodLog, symptomLog } = user.profile;
    
    if (!foodLog || foodLog.length === 0) {
      return {
        insights: [],
        predictions: [],
        newSensitivities: [],
        safeFoods: [],
        riskyFoods: []
      };
    }

    // Find correlations between foods and symptoms
    const correlations = this.findSymptomCorrelations(foodLog, symptomLog);
    
    // Identify safe foods (eaten without symptoms)
    const safeFoods = this.identifySafeFoods(foodLog, symptomLog);
    
    // Identify risky foods (often followed by symptoms)
    const riskyFoods = this.identifyRiskyFoods(correlations);
    
    // Detect new potential sensitivities
    const newSensitivities = this.detectNewSensitivities(correlations);
    
    // Generate AI insights
    const insights = await this.generateAIInsights(foodLog, symptomLog, correlations);

    return {
      insights,
      correlations,
      newSensitivities,
      safeFoods,
      riskyFoods,
      patterns: this.detectEatingPatterns(foodLog)
    };
  }

  // Find correlations between food and symptoms
  findSymptomCorrelations(foodLog, symptomLog) {
    if (!symptomLog || symptomLog.length === 0) return [];

    const correlations = [];
    const timeWindow = 4 * 60 * 60 * 1000; // 4 hours

    symptomLog.forEach(symptom => {
      const symptomTime = new Date(symptom.timestamp).getTime();
      
      // Find foods eaten within 4 hours before symptom
      const recentFoods = foodLog.filter(food => {
        const foodTime = new Date(food.timestamp).getTime();
        return foodTime < symptomTime && (symptomTime - foodTime) < timeWindow;
      });

      if (recentFoods.length > 0) {
        correlations.push({
          symptom,
          foods: recentFoods,
          timeDiff: timeWindow
        });
      }
    });

    return correlations;
  }

  // Identify consistently safe foods
  identifySafeFoods(foodLog, symptomLog) {
    const foodCounts = {};
    const foodWithSymptoms = new Set();

    // Count each food
    foodLog.forEach(food => {
      const name = food.name.toLowerCase();
      foodCounts[name] = (foodCounts[name] || 0) + 1;
    });

    // Mark foods associated with symptoms
    const correlations = this.findSymptomCorrelations(foodLog, symptomLog);
    correlations.forEach(corr => {
      corr.foods.forEach(food => {
        foodWithSymptoms.add(food.name.toLowerCase());
      });
    });

    // Safe foods: eaten multiple times without symptoms
    const safeFoods = Object.entries(foodCounts)
      .filter(([name, count]) => count >= 2 && !foodWithSymptoms.has(name))
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return safeFoods.slice(0, 10);
  }

  // Identify foods frequently associated with symptoms
  identifyRiskyFoods(correlations) {
    const riskScores = {};

    correlations.forEach(corr => {
      corr.foods.forEach(food => {
        const name = food.name.toLowerCase();
        riskScores[name] = (riskScores[name] || 0) + 1;
      });
    });

    return Object.entries(riskScores)
      .map(([name, score]) => ({ name, riskScore: score }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }

  // Detect potential new sensitivities
  detectNewSensitivities(correlations) {
    const allergenProfile = authService.getUserAllergenProfile();
    const knownAllergens = new Set(allergenProfile.allergens.map(a => a.toLowerCase()));
    
    const suspectedIngredients = {};

    correlations.forEach(corr => {
      corr.foods.forEach(food => {
        if (food.ingredients) {
          food.ingredients.forEach(ingredient => {
            const ing = ingredient.toLowerCase();
            if (!knownAllergens.has(ing)) {
              suspectedIngredients[ing] = (suspectedIngredients[ing] || 0) + 1;
            }
          });
        }
      });
    });

    // Ingredients appearing in 3+ symptom-related foods
    return Object.entries(suspectedIngredients)
      .filter(([_, count]) => count >= 3)
      .map(([ingredient, count]) => ({
        ingredient,
        occurrences: count,
        confidence: Math.min(count * 25, 90)
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  // Detect eating patterns
  detectEatingPatterns(foodLog) {
    if (foodLog.length < 5) return [];

    const patterns = [];

    // Time of day patterns
    const hourCounts = {};
    foodLog.forEach(food => {
      const hour = new Date(food.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (mostActiveHour) {
      patterns.push({
        type: 'time',
        description: `You typically eat most around ${mostActiveHour[0]}:00`,
        data: hourCounts
      });
    }

    // Day of week patterns
    const dayCounts = {};
    foodLog.forEach(food => {
      const day = new Date(food.timestamp).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostActiveDay = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (mostActiveDay) {
      patterns.push({
        type: 'day',
        description: `You log more meals on ${days[mostActiveDay[0]]}`,
        data: dayCounts
      });
    }

    return patterns;
  }

  // Generate AI insights using Gemini
  async generateAIInsights(foodLog, symptomLog, correlations) {
    try {
      const allergenProfile = authService.getUserAllergenProfile();
      
      const prompt = `Analyze this user's food and symptom data to provide health insights:

**User's Known Allergens:** ${allergenProfile.allergens.join(', ') || 'None'}

**Recent Foods Eaten (${foodLog.length} items):**
${foodLog.slice(-10).map(f => `- ${f.name} (${new Date(f.timestamp).toLocaleDateString()})`).join('\n')}

**Symptoms Logged (${symptomLog?.length || 0} items):**
${symptomLog?.slice(-5).map(s => `- ${s.description || 'Discomfort'} (${new Date(s.timestamp).toLocaleDateString()})`).join('\n') || 'None'}

**Correlations Found:** ${correlations.length}

Provide 3-5 actionable insights:
1. Pattern observations (time, frequency, food types)
2. Potential trigger foods
3. Recommendations for safer eating
4. Predictions for future issues
5. Suggestions for testing new sensitivities

Return as JSON array:
[
  {"type": "pattern", "title": "Title", "description": "Details", "confidence": 85},
  ...
]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';

      // Parse JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];

    } catch (error) {
      if(import.meta.env.DEV)console.error('AI insights error:', error);
      return [];
    }
  }

  // Predict food safety
  async predictFoodSafety(foodName, ingredients = []) {
    const allergenProfile = authService.getUserAllergenProfile();
    const { safetyPreferences, allergens, intolerances } = allergenProfile;

    // Check if user has eaten this before
    if (safetyPreferences[foodName.toLowerCase()]) {
      return {
        safe: safetyPreferences[foodName.toLowerCase()],
        reason: 'Based on your eating history',
        confidence: 90
      };
    }

    // Check ingredients against allergens
    const detectedAllergens = [];
    ingredients.forEach(ingredient => {
      const ing = ingredient.toLowerCase();
      allergens.forEach(allergen => {
        if (ing.includes(allergen.toLowerCase())) {
          detectedAllergens.push(allergen);
        }
      });
    });

    if (detectedAllergens.length > 0) {
      return {
        safe: false,
        reason: `Contains your allergens: ${detectedAllergens.join(', ')}`,
        confidence: 95,
        allergens: detectedAllergens
      };
    }

    // AI prediction based on similar foods
    try {
      const prompt = `User has these allergens: ${allergens.join(', ')}
      
Is "${foodName}" with ingredients [${ingredients.join(', ')}] safe for them?

Consider:
1. Hidden allergens in ingredients
2. Cross-contamination risks
3. Alternative names for allergens

Return JSON: {"safe": true/false, "reason": "explanation", "confidence": 0-100, "warnings": []}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

    } catch (error) {
      if(import.meta.env.DEV)console.error('Prediction error:', error);
    }

    return {
      safe: true,
      reason: 'No known allergens detected',
      confidence: 60
    };
  }

  // Update learning based on user feedback
  async updateLearning(food, wasGood) {
    return authService.updateSafetyPreferences(food.toLowerCase(), wasGood);
  }

  // Get personalized recommendations
  getRecommendations() {
    const user = authService.getCurrentUser();
    if (!user) return [];

    const recommendations = [];
    const { foodLog, symptomLog, allergens } = user.profile;

    // Recommend logging if inactive
    const lastLog = foodLog?.[foodLog.length - 1];
    if (!lastLog || this.daysSince(lastLog.timestamp) > 3) {
      recommendations.push({
        type: 'action',
        title: 'Log Your Meals',
        description: 'Track meals regularly for better AI insights',
        priority: 'high'
      });
    }

    // Recommend symptom tracking
    if (symptomLog?.length === 0 || !symptomLog) {
      recommendations.push({
        type: 'info',
        title: 'Track Reactions',
        description: 'Log any discomfort after meals to detect patterns',
        priority: 'medium'
      });
    }

    // Recommend allergen testing if suspicions
    const analysis = this.analyzePatterns();
    if (analysis?.newSensitivities?.length > 0) {
      recommendations.push({
        type: 'alert',
        title: 'Potential New Sensitivity Detected',
        description: `Consider testing for: ${analysis.newSensitivities[0].ingredient}`,
        priority: 'high'
      });
    }

    return recommendations;
  }

  // Helper: Days since date
  daysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

export const learningService = new LearningService();
export default learningService;



