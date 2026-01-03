// Health Recommendation Service - AI-powered personalized health improvement plans
import geminiService from './geminiService';
import authService from './authService';
import dnaService from './dnaService';

class HealthRecommendationService {
  constructor() {
    this.cachedRecommendations = null;
    this.cacheTimestamp = 0;
    this.cacheDuration = 3600000; // 1 hour cache
  }

  /**
   * Generate AI personalized recommendations based on health avatar data
   */
  async generateRecommendations(avatarState, forceRefresh = false) {
    try {
      // Return cached if available and not forcing refresh
      const now = Date.now();
      if (!forceRefresh && this.cachedRecommendations && (now - this.cacheTimestamp) < this.cacheDuration) {
        if(import.meta.env.DEV)console.log('💡 Using cached recommendations');
        return this.cachedRecommendations;
      }

      if (!avatarState || !avatarState.current) {
        if(import.meta.env.DEV)console.error('No avatar state provided for recommendations');
        return this._getDefaultRecommendations();
      }

      // Extract weak areas from score breakdown
      const weakAreas = this._extractWeakAreas(avatarState.current);
      
      // If no weak areas found, provide default recommendations
      if (!weakAreas || weakAreas.length === 0) {
        if(import.meta.env.DEV)console.log('ℹ️ No weak areas found, providing default recommendations');
        return this._getDefaultRecommendations();
      }
      const userProfile = authService.getCurrentUser()?.profile || {};
      
      if(import.meta.env.DEV)console.log('🤖 Generating AI recommendations for weak areas:', weakAreas);

      // Build the Gemini prompt with specific, actionable context
      const prompt = this._buildRecommendationPrompt(
        avatarState.current,
        weakAreas,
        userProfile
      );

      // Get AI recommendations from Gemini
      const aiResponse = await geminiService.generateText(prompt);
      
      if (!aiResponse) {
        if(import.meta.env.DEV)console.warn('⚠️ No AI response received, using fallback');
        const fallback = this._getFallbackRecommendations(weakAreas);
        this.cachedRecommendations = fallback;
        this.cacheTimestamp = now;
        return fallback;
      }

      // Parse the AI response into structured recommendations
      const recommendations = this._parseAIResponse(aiResponse, weakAreas);

      // Cache the recommendations
      this.cachedRecommendations = recommendations;
      this.cacheTimestamp = now;

      if(import.meta.env.DEV)console.log('✅ AI Recommendations generated:', recommendations.length, 'items');
      
      return recommendations;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error generating recommendations:', error);
      return this._getDefaultRecommendations();
    }
  }

  /**
   * Extract weak areas from score breakdown
   */
  _extractWeakAreas(currentState) {
    const weakAreas = [];

    if (!currentState.scoreBreakdown) {
      return weakAreas;
    }

    // Get factors with negative points, sorted by impact
    const negativeFactors = currentState.scoreBreakdown
      .filter(item => item.points < 0)
      .sort((a, b) => a.points - b.points); // Most negative first

    negativeFactors.forEach(factor => {
      weakAreas.push({
        factor: factor.factor,
        points: factor.points,
        icon: factor.icon,
        severity: factor.points <= -15 ? 'critical' : factor.points <= -10 ? 'high' : 'moderate'
      });
    });

    return weakAreas;
  }

  /**
   * Build the Gemini prompt for personalized recommendations
   */
  _buildRecommendationPrompt(currentState, weakAreas, userProfile) {
    const weakFactorsText = weakAreas
      .map(w => `- ${w.factor} (${w.points} points, ${w.severity} severity)`)
      .join('\n');

    const dnaRisks = currentState.scoreBreakdown
      .find(item => item.factor.includes('DNA'))
      ?.factor || 'Not provided';

    const age = userProfile.age || 'unknown';
    const fitness = userProfile.fitnessLevel || 'unknown';
    const medicalConditions = userProfile.medicalConditions?.join(', ') || 'none';

    return `You are a certified health and wellness expert. A user has a health score of ${currentState.score}/100.

WEAK AREAS TO IMPROVE (in priority order):
${weakFactorsText}

USER PROFILE:
- Age: ${age}
- Fitness Level: ${fitness}
- Medical Conditions: ${medicalConditions}
- DNA Risks: ${dnaRisks}

TASK: Generate 5 SPECIFIC, ACTIONABLE health recommendations that:
1. Address their biggest weak areas first
2. Include exact numbers/times/amounts (e.g., "Add 3,000 steps daily" not "exercise more")
3. Are realistic for their fitness level
4. Consider their medical profile
5. Can be tracked daily

Format your response as JSON array with this structure:
[
  {
    "title": "Specific action title",
    "description": "2-3 sentence explanation",
    "action": "Exact step they should take",
    "target": "Measurable target (e.g., '10,000 steps/day')",
    "timeframe": "When to do it (e.g., 'Daily' or 'Twice weekly')",
    "impact": "Which factors this improves",
    "difficulty": "easy|moderate|hard",
    "tip": "Pro tip for success"
  }
]

Be specific, actionable, and motivational. Focus on their weak areas first.`;
  }

  /**
   * Parse AI response into structured recommendations
   */
  _parseAIResponse(aiResponse, weakAreas) {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        if(import.meta.env.DEV)console.warn('No JSON found in AI response, using fallback');
        return this._getFallbackRecommendations(weakAreas);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and enhance each recommendation
      return parsed.map((rec, idx) => ({
        id: idx + 1,
        title: rec.title || 'Health Improvement',
        description: rec.description || '',
        action: rec.action || '',
        target: rec.target || '',
        timeframe: rec.timeframe || 'Daily',
        impact: rec.impact || 'Overall health',
        difficulty: rec.difficulty || 'moderate',
        tip: rec.tip || '',
        priority: idx === 0 ? 'critical' : idx === 1 ? 'high' : 'medium'
      }));
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error parsing AI response:', error);
      return this._getFallbackRecommendations(weakAreas);
    }
  }

  /**
   * Fallback recommendations based on weak areas
   */
  _getFallbackRecommendations(weakAreas) {
    const recommendations = [];

    weakAreas.forEach((area, idx) => {
      let rec = null;

      if (area.factor.includes('Steps')) {
        rec = {
          id: idx + 1,
          title: '🚶 Increase Daily Steps',
          description: 'Walking is the foundation of health. Even 3,000 extra steps daily improves cardiovascular health and mood.',
          action: 'Add a 20-minute walk after each meal',
          target: '10,000 steps/day',
          timeframe: 'Daily',
          impact: 'Daily Steps, BMI, Energy',
          difficulty: 'easy',
          tip: 'Use stairs, park farther away, or use a treadmill while watching TV',
          priority: area.severity === 'critical' ? 'critical' : 'high'
        };
      } else if (area.factor.includes('Food')) {
        rec = {
          id: idx + 1,
          title: '🥗 Improve Food Choices',
          description: 'Replace processed foods with whole foods. This dramatically improves energy, digestion, and health score.',
          action: 'Scan meals daily. Choose green/yellow foods over red foods.',
          target: '80% of meals from healthy sources',
          timeframe: 'Daily',
          impact: 'Food Quality, Energy, BMI',
          difficulty: 'moderate',
          tip: 'Meal prep on Sundays. Keep healthy snacks visible.',
          priority: area.severity === 'critical' ? 'critical' : 'high'
        };
      } else if (area.factor.includes('Sleep')) {
        rec = {
          id: idx + 1,
          title: '😴 Get Better Sleep',
          description: '7-9 hours of quality sleep is essential. Sleep improves every health metric.',
          action: 'Set consistent bedtime. Avoid screens 1 hour before bed.',
          target: '8 hours/night',
          timeframe: 'Every night',
          impact: 'Sleep Quality, Health Score',
          difficulty: 'moderate',
          tip: 'Use blue light glasses after sunset. Keep bedroom cool and dark.',
          priority: area.severity === 'critical' ? 'critical' : 'high'
        };
      } else if (area.factor.includes('Workout')) {
        rec = {
          id: idx + 1,
          title: '💪 Start a Workout Routine',
          description: 'Just 3 workouts per week dramatically improves health. Pick activities you enjoy.',
          action: 'Log 3 workouts: 2 cardio (20 min) + 1 strength (30 min)',
          target: '150 minutes exercise/week',
          timeframe: '3-4x per week',
          impact: 'Workouts, Energy, Fitness',
          difficulty: 'moderate',
          tip: 'Start with walking, yoga, or dancing. Consistency beats intensity.',
          priority: area.severity === 'critical' ? 'critical' : 'high'
        };
      } else if (area.factor.includes('DNA')) {
        rec = {
          id: idx + 1,
          title: '🧬 Manage Genetic Risks',
          description: 'Your DNA shows certain predispositions. With lifestyle changes, you can reduce risk.',
          action: 'Use your DNA insights to customize nutrition and exercise.',
          target: 'Reduce high-risk exposure',
          timeframe: 'Ongoing',
          impact: 'DNA Risks, Health Score',
          difficulty: 'hard',
          tip: 'Consult a nutritionist familiar with genetic testing results.',
          priority: 'high'
        };
      } else {
        rec = {
          id: idx + 1,
          title: `📈 Improve ${area.factor}`,
          description: `Focus on this area to boost your health score. Every improvement compounds.`,
          action: `Start tracking ${area.factor.toLowerCase()} daily.`,
          target: 'Track consistently',
          timeframe: 'Daily',
          impact: area.factor,
          difficulty: 'moderate',
          tip: 'Consistency matters more than perfection.',
          priority: area.severity === 'critical' ? 'critical' : 'high'
        };
      }

      if (rec) {
        recommendations.push(rec);
      }
    });

    return recommendations.length > 0 ? recommendations : this._getDefaultRecommendations();
  }

  /**
   * Default recommendations if no weak areas found
   */
  _getDefaultRecommendations() {
    return [
      {
        id: 1,
        title: '🎯 Maintain Your Health',
        description: 'You\'re doing great! Maintain your current habits and optimize further.',
        action: 'Keep tracking your data consistently.',
        target: 'Score of 80+',
        timeframe: 'Daily',
        impact: 'Overall health',
        difficulty: 'easy',
        tip: 'Your consistency is your superpower. Keep it up!',
        priority: 'high'
      },
      {
        id: 2,
        title: '🔍 Deep Health Dive',
        description: 'Once you master the basics, go deeper. Optimize sleep cycles, macros, and training.',
        action: 'Explore advanced health tracking features.',
        target: 'Score of 90+',
        timeframe: 'Weekly optimization',
        impact: 'All factors',
        difficulty: 'hard',
        tip: 'Join health communities for advanced tips and support.',
        priority: 'medium'
      },
      {
        id: 3,
        title: '👥 Share Your Progress',
        description: 'Help others by sharing your journey. Community support accelerates progress.',
        action: 'Challenge friends or join wellness groups.',
        target: 'Build accountability',
        timeframe: 'Ongoing',
        impact: 'Engagement, Motivation',
        difficulty: 'easy',
        tip: 'Social commitment increases success rate by 65%.',
        priority: 'medium'
      }
    ];
  }

  /**
   * Clear cached recommendations
   */
  clearCache() {
    this.cachedRecommendations = null;
    this.cacheTimestamp = 0;
  }
}

export const healthRecommendationService = new HealthRecommendationService();
export default healthRecommendationService;
