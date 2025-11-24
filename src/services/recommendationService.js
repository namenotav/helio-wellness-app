// AI Recommendations Service - Personalized Food & Recipe Suggestions
import authService from './authService';

class RecommendationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  // Generate personalized recipes
  async generateRecipes(mealType = 'dinner', count = 5) {
    const allergenProfile = authService.getUserAllergenProfile();
    
    const prompt = `Generate ${count} ${mealType} recipes that are safe for someone with:

**Allergens to AVOID:** ${allergenProfile.allergens?.join(', ') || 'None'}
**Intolerances:** ${allergenProfile.intolerances?.join(', ') || 'None'}
**Diet Preferences:** ${allergenProfile.dietaryPreferences?.join(', ') || 'None'}

For each recipe provide:
- Name
- Brief description
- Ingredients list
- Prep time
- Difficulty (easy/medium/hard)
- Calories (estimate)
- Key nutrients

Return as JSON array:
[
  {
    "name": "Recipe Name",
    "description": "Brief description",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": ["step1", "step2"],
    "prepTime": "30 minutes",
    "difficulty": "easy",
    "calories": 450,
    "nutrients": {"protein": "25g", "carbs": "40g", "fat": "15g"},
    "tags": ["gluten-free", "high-protein"]
  }
]`;

    try {
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
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return { success: true, recipes: JSON.parse(jsonMatch[0]) };
      }

      return { success: false, error: 'Failed to parse recipes' };

    } catch (error) {
      console.error('Recipe generation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Find safe restaurants nearby
  async findSafeRestaurants(cuisine = 'any') {
    const allergenProfile = authService.getUserAllergenProfile();

    const prompt = `Suggest 5 restaurant types or chains that typically offer safe options for someone with:

**Allergens:** ${allergenProfile.allergens?.join(', ') || 'None'}
**Diet:** ${allergenProfile.dietaryPreferences?.join(', ') || 'None'}
**Preferred Cuisine:** ${cuisine}

For each restaurant type/chain:
- Name
- Why it's safe for this profile
- Recommended menu items
- Things to avoid
- Ordering tips

Return as JSON array.`;

    try {
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
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return { success: true, restaurants: JSON.parse(jsonMatch[0]) };
      }

      return { success: false, error: 'Failed to parse restaurants' };

    } catch (error) {
      console.error('Restaurant search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get product alternatives
  async findAlternatives(productName) {
    const allergenProfile = authService.getUserAllergenProfile();

    const prompt = `The user cannot eat "${productName}" due to these allergens: ${allergenProfile.allergens?.join(', ')}

Suggest 5 alternative products that are:
1. Similar in taste/purpose
2. Free from their allergens
3. Widely available

For each alternative:
- Product name
- Brand (if specific)
- Why it's a good substitute
- Where to buy
- Price range (estimate)

Return as JSON array.`;

    try {
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
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return { success: true, alternatives: JSON.parse(jsonMatch[0]) };
      }

      return { success: false, error: 'Failed to parse alternatives' };

    } catch (error) {
      console.error('Alternatives search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate weekly meal plan
  async generateMealPlan(days = 7) {
    const allergenProfile = authService.getUserAllergenProfile();

    const prompt = `Create a ${days}-day meal plan for someone with:

**Allergens to AVOID:** ${allergenProfile.allergens?.join(', ') || 'None'}
**Diet:** ${allergenProfile.dietaryPreferences?.join(', ') || 'Standard'}

For each day provide:
- Breakfast, Lunch, Dinner, Snacks
- Brief recipe name and description
- Estimated calories per meal
- Shopping list ingredients

Ensure:
- Variety (no repeated meals)
- Balanced nutrition
- All meals are allergen-free
- Realistic prep times

Return as JSON:
{
  "days": [
    {
      "day": 1,
      "breakfast": {"name": "...", "calories": 400},
      "lunch": {"name": "...", "calories": 550},
      "dinner": {"name": "...", "calories": 650},
      "snacks": [{"name": "...", "calories": 150}]
    }
  ],
  "shoppingList": ["ingredient1", "ingredient2", ...]
}`;

    try {
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
        return { success: true, mealPlan: JSON.parse(jsonMatch[0]) };
      }

      return { success: false, error: 'Failed to parse meal plan' };

    } catch (error) {
      console.error('Meal plan error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get nutrition recommendations
  async getNutritionGuidance() {
    const allergenProfile = authService.getUserAllergenProfile();

    const prompt = `Provide nutrition guidance for someone avoiding:

**Allergens:** ${allergenProfile.allergens?.join(', ') || 'None'}

Address:
1. Nutrients they might be missing (e.g., calcium if avoiding dairy)
2. Alternative food sources for those nutrients
3. Supplement recommendations (if needed)
4. Daily intake targets

Return as JSON:
{
  "atRiskNutrients": [
    {"nutrient": "Calcium", "reason": "Avoiding dairy", "dailyTarget": "1000mg"}
  ],
  "alternativeSources": [
    {"nutrient": "Calcium", "foods": ["fortified almond milk", "leafy greens", "tofu"]}
  ],
  "supplements": [
    {"name": "Calcium + Vitamin D", "dosage": "500mg twice daily", "reason": "..."}
  ]
}`;

    try {
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
        return { success: true, guidance: JSON.parse(jsonMatch[0]) };
      }

      return { success: false, error: 'Failed to parse guidance' };

    } catch (error) {
      console.error('Nutrition guidance error:', error);
      return { success: false, error: error.message };
    }
  }

  // Quick snack suggestions
  async getSafeSnacks() {
    const allergenProfile = authService.getUserAllergenProfile();

    const prompt = `List 10 quick, safe snacks for someone avoiding: ${allergenProfile.allergens?.join(', ') || 'None'}

Requirements:
- Ready in under 5 minutes
- Portable
- No cooking needed
- Healthy

Return as JSON array of strings: ["snack1", "snack2", ...]`;

    try {
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
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return { success: true, snacks: JSON.parse(jsonMatch[0]) };
      }

      return { success: false, error: 'Failed to parse snacks' };

    } catch (error) {
      console.error('Snacks error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
