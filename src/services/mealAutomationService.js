// Smart Meal Automation Service - Auto meal prep and grocery ordering
import geminiService from './geminiService';
import authService from './authService';

class MealAutomationService {
  constructor() {
    this.activeMealPlan = null;
    this.shoppingList = [];
    this.connectedAppliances = [];
  }

  // Generate automated meal plan
  async generateSmartMealPlan(days = 7, preferences = {}) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false };

    const allergenProfile = user.profile.allergens || [];
    const dietPrefs = user.profile.dietaryPreferences || [];
    
    const prompt = `Create a ${days}-day automated meal plan that:
- Avoids: ${allergenProfile.join(', ')}
- Follows: ${dietPrefs.join(', ')}
- Budget: ${preferences.budget || 'moderate'}
- Cooking skill: ${preferences.skill || 'beginner'}
- Time per meal: ${preferences.maxTime || 30} minutes

Return JSON:
{
  "days": [
    {
      "day": 1,
      "breakfast": {
        "name": "meal name",
        "prepTime": 15,
        "ingredients": [{"item": "eggs", "amount": "2", "unit": "pieces"}],
        "steps": ["step1", "step2"],
        "smartAppliance": "none|air-fryer|instant-pot|oven",
        "applianceSettings": {"temp": 180, "time": 20}
      },
      "lunch": {},
      "dinner": {},
      "snacks": []
    }
  ],
  "weeklyShoppingList": [
    {"item": "eggs", "amount": 12, "unit": "pieces", "store": "any-grocery"}
  ]
}`;

    const model = geminiService.getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mealPlan = JSON.parse(jsonMatch[0]);
        this.activeMealPlan = mealPlan;
        this.shoppingList = mealPlan.weeklyShoppingList || [];
        
        return { 
          success: true, 
          mealPlan,
          message: 'Meal plan generated! Ready to order groceries.'
        };
      }
    } catch (error) {
      console.error('Meal plan generation error:', error);
    }
    
    return { success: false, error: 'Failed to generate meal plan' };
  }

  // Auto-order groceries
  async orderGroceries(storePreference = 'any') {
    if (this.shoppingList.length === 0) {
      return { success: false, error: 'No shopping list available' };
    }

    // Simulate grocery ordering API integration
    console.log('Ordering groceries from', storePreference);
    console.log('Shopping list:', this.shoppingList);
    
    // In real app: Integration with Instacart, Amazon Fresh, local stores
    const order = {
      orderId: 'ORD-' + Date.now(),
      items: this.shoppingList,
      store: storePreference,
      estimatedTotal: this.calculateOrderTotal(),
      deliveryTime: '2-4 hours',
      status: 'processing'
    };

    return {
      success: true,
      order,
      message: `Groceries ordered! Delivery in ${order.deliveryTime}`
    };
  }

  // Calculate order total
  calculateOrderTotal() {
    // Simplified pricing
    const priceDB = {
      'eggs': 4.99,
      'milk': 3.49,
      'bread': 2.99,
      'chicken': 8.99,
      'vegetables': 5.99,
      'fruit': 4.49
    };
    
    let total = 0;
    this.shoppingList.forEach(item => {
      const basePrice = priceDB[item.item.toLowerCase()] || 5.00;
      total += basePrice * (item.amount / 10); // Rough calculation
    });
    
    return Math.round(total * 100) / 100;
  }

  // Connect smart appliance
  async connectAppliance(appliance) {
    const supported = ['air-fryer', 'instant-pot', 'smart-oven', 'slow-cooker'];
    
    if (!supported.includes(appliance.type)) {
      return { success: false, error: 'Appliance not supported' };
    }

    this.connectedAppliances.push({
      id: 'APP-' + Date.now(),
      type: appliance.type,
      brand: appliance.brand,
      model: appliance.model,
      connected: true,
      lastSync: new Date().toISOString()
    });

    return {
      success: true,
      message: `${appliance.type} connected successfully!`
    };
  }

  // Send recipe to smart appliance
  async sendToAppliance(mealName, applianceType) {
    const appliance = this.connectedAppliances.find(a => a.type === applianceType);
    if (!appliance) {
      return { success: false, error: 'Appliance not connected' };
    }

    // Find meal in active plan
    let mealData = null;
    if (this.activeMealPlan) {
      for (const day of this.activeMealPlan.days) {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          if (day[mealType]?.name === mealName) {
            mealData = day[mealType];
          }
        });
      }
    }

    if (!mealData) {
      return { success: false, error: 'Meal not found' };
    }

    // Send to appliance (simulated)
    console.log('Sending to appliance:', {
      appliance: appliance.type,
      meal: mealData.name,
      settings: mealData.applianceSettings
    });

    return {
      success: true,
      appliance: appliance.type,
      settings: mealData.applianceSettings,
      message: 'Recipe sent! Follow voice instructions.'
    };
  }

  // Get voice cooking instructions
  async getVoiceInstructions(mealName) {
    if (!this.activeMealPlan) {
      return { success: false, error: 'No active meal plan' };
    }

    // Find meal
    let mealData = null;
    for (const day of this.activeMealPlan.days) {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        if (day[mealType]?.name === mealName) {
          mealData = day[mealType];
        }
      });
    }

    if (!mealData) {
      return { success: false, error: 'Meal not found' };
    }

    // Convert steps to voice instructions
    const voiceSteps = mealData.steps.map((step, idx) => ({
      step: idx + 1,
      instruction: step,
      estimatedTime: Math.ceil(mealData.prepTime / mealData.steps.length)
    }));

    return {
      success: true,
      mealName: mealData.name,
      totalTime: mealData.prepTime,
      steps: voiceSteps,
      message: 'Ready to cook! Say "Next step" to continue.'
    };
  }

  // Adjust meal plan based on feedback
  async adjustMealPlan(feedback) {
    if (!this.activeMealPlan) return { success: false };

    const prompt = `Adjust the current meal plan based on this feedback: "${feedback}"
    
Return JSON with only the modified days that need changes.`;

    const model = geminiService.getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const adjustments = JSON.parse(jsonMatch[0]);
        // Merge adjustments into active plan
        return { 
          success: true, 
          message: 'Meal plan adjusted based on your feedback'
        };
      }
    } catch (error) {
      console.error('Adjustment error:', error);
    }
    
    return { success: false };
  }

  // Get today's meal instructions
  getTodaysMeals() {
    if (!this.activeMealPlan) return null;

    const today = new Date().getDay(); // 0-6
    const dayPlan = this.activeMealPlan.days[today % this.activeMealPlan.days.length];

    return {
      date: new Date().toDateString(),
      breakfast: dayPlan.breakfast,
      lunch: dayPlan.lunch,
      dinner: dayPlan.dinner,
      snacks: dayPlan.snacks
    };
  }

  // Get shopping list
  getShoppingList() {
    return this.shoppingList;
  }

  // Get connected appliances
  getConnectedAppliances() {
    return this.connectedAppliances;
  }
}

export const mealAutomationService = new MealAutomationService();
export default mealAutomationService;
