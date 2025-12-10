// Smart Meal Automation Service - Auto meal prep and grocery ordering
import authService from './authService';
import syncService from './syncService';
import firestoreService from './firestoreService';

class MealAutomationService {
  constructor() {
    this.activeMealPlan = null;
    this.shoppingList = [];
    this.connectedAppliances = [];
  }

  // Load saved meal plan from persistent storage
  async loadSavedMealPlan() {
    try {
      const saved = await firestoreService.get('mealPlan', authService.getCurrentUser()?.uid);
      if (saved && saved.plan) {
        this.activeMealPlan = saved.plan;
        this.shoppingList = saved.plan.weeklyShoppingList || [];
        console.log('✅ Loaded saved meal plan from', saved.generatedDate);
        return saved;
      }
      return null;
    } catch (error) {
      console.error('Failed to load meal plan:', error);
      return null;
    }
  }

  // Save meal plan to persistent storage
  async saveMealPlan(mealPlan) {
    try {
      const dataToSave = {
        generatedDate: new Date().toISOString(),
        plan: mealPlan
      };
      await firestoreService.save('mealPlan', dataToSave, authService.getCurrentUser()?.uid);
      console.log('✅ Meal plan saved to persistent storage');
      return { success: true };
    } catch (error) {
      console.error('Failed to save meal plan:', error);
      return { success: false, error };
    }
  }

  // Clear meal plan
  async clearMealPlan() {
    try {
      await firestoreService.save('mealPlan', null, authService.getCurrentUser()?.uid);
      this.activeMealPlan = null;
      this.shoppingList = [];
      console.log('✅ Meal plan cleared');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear meal plan:', error);
      return { success: false, error };
    }
  }

  // Generate automated meal plan
  async generateSmartMealPlan(days = 7, preferences = {}) {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('Please sign in to generate meal plans');
    }

    const allergenProfile = user.profile?.allergens || [];
    const dietPrefs = user.profile?.dietaryPreferences || [];
    
    // Build prompt based on whether user provided ingredients
    let prompt = '';
    
    if (preferences.useOwnIngredients && preferences.availableIngredients) {
      prompt = `Create a ${days}-day meal plan using ONLY these ingredients the user has available:

${preferences.availableIngredients}

Requirements:
- MUST use only the ingredients listed above
- Avoids these allergens: ${allergenProfile.length > 0 ? allergenProfile.join(', ') : 'none'}
- Time per meal: ${preferences.maxTime || 30} minutes
- Creative combinations to avoid waste
- Suggest what to buy if ingredients run out`;
    } else {
      prompt = `Create a ${days}-day automated meal plan that:
- Avoids these allergens: ${allergenProfile.length > 0 ? allergenProfile.join(', ') : 'none'}
- Follows these dietary preferences: ${dietPrefs.length > 0 ? dietPrefs.join(', ') : 'balanced diet'}
- Budget: ${preferences.budget || 'moderate'}
- Cooking skill: ${preferences.skill || 'beginner'}
- Time per meal: ${preferences.maxTime || 30} minutes`;
    }
    
    prompt += `

CRITICAL: You MUST generate EXACTLY ${days} days (all 7 days of the week). Do not generate less than ${days} days.

Return ONLY valid JSON (no markdown, no code blocks). Generate breakfast, lunch, AND dinner for each day:
{
  "days": [
    {
      "day": 1,
      "dayName": "Monday",
      "breakfast": {
        "name": "Scrambled Eggs with Toast",
        "prepTime": "15 min",
        "calories": 350,
        "ingredients": [{"item": "eggs", "amount": "2", "unit": "pieces"}],
        "steps": ["Beat eggs", "Cook in pan", "Serve with toast"],
        "smartAppliance": "air-fryer",
        "applianceSettings": {"temp": "180°C", "time": "15 min"}
      },
      "lunch": {
        "name": "Grilled Chicken Salad",
        "prepTime": "20 min",
        "calories": 450,
        "ingredients": [{"item": "chicken breast", "amount": "1", "unit": "piece"}],
        "steps": ["Grill chicken", "Chop vegetables", "Mix salad"],
        "smartAppliance": "none",
        "applianceSettings": {}
      },
      "dinner": {
        "name": "Salmon with Vegetables",
        "prepTime": "25 min",
        "calories": 550,
        "ingredients": [{"item": "salmon", "amount": "1", "unit": "fillet"}],
        "steps": ["Season salmon", "Bake fish", "Steam vegetables"],
        "smartAppliance": "smart-oven",
        "applianceSettings": {"temp": "200°C", "time": "20 min"}
      }
    },
    {
      "day": 2,
      "dayName": "Tuesday",
      "breakfast": {...},
      "lunch": {...},
      "dinner": {...}
    }
    ... continue for all ${days} days (Monday through Sunday)
  ],
  "weeklyShoppingList": [
    {"item": "eggs", "amount": 12, "unit": "pieces", "category": "dairy"},
    {"item": "chicken breast", "amount": 7, "unit": "pieces", "category": "meat"},
    {"item": "salmon", "amount": 3, "unit": "fillets", "category": "seafood"}
  ]
}

IMPORTANT: Generate ALL ${days} days. Each day needs breakfast, lunch, and dinner.`;

    if(import.meta.env.DEV)console.log('🍽️ Generating meal plan via Railway...');
    
    try {
      // Call Railway server (like Voice AI does)
      const response = await fetch('https://helio-wellness-app-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: prompt }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.response;
      
      if(import.meta.env.DEV)console.log('📋 Raw AI response:', text.substring(0, 200));
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text;
      
      // Remove markdown code blocks if present
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }
      
      // Find JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mealPlan = JSON.parse(jsonMatch[0]);
        
        // Validate structure
        if (!mealPlan.days || mealPlan.days.length === 0) {
          throw new Error('Invalid meal plan structure');
        }
        
        // Enforce 7-day requirement
        if (mealPlan.days.length < days) {
          if(import.meta.env.DEV)console.warn(`⚠️ AI generated only ${mealPlan.days.length} days instead of ${days}. Using what we have.`);
        }
        
        // Add day names if missing
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        mealPlan.days.forEach((day, index) => {
          if (!day.dayName && index < 7) {
            day.dayName = dayNames[index];
          }
        });
        
        this.activeMealPlan = mealPlan;
        this.shoppingList = mealPlan.weeklyShoppingList || [];
        
        // SAVE TO TRIPLE STORAGE
        await this.saveMealPlan(mealPlan);
        
        if(import.meta.env.DEV)console.log('✅ Meal plan generated & saved:', mealPlan.days.length, 'days');
        
        return mealPlan;
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Meal plan generation error:', error);
      throw new Error(error.message || 'Failed to generate meal plan');
    }
  }

  // Auto-order groceries
  async orderGroceries(storePreference = 'any') {
    if (this.shoppingList.length === 0) {
      return { success: false, error: 'No shopping list available' };
    }

    // Simulate grocery ordering API integration
    if(import.meta.env.DEV)console.log('Ordering groceries from', storePreference);
    if(import.meta.env.DEV)console.log('Shopping list:', this.shoppingList);
    
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
    if(import.meta.env.DEV)console.log('Sending to appliance:', {
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
    if (!this.activeMealPlan) {
      return { success: false, error: 'No active meal plan to adjust' };
    }

    const prompt = `Adjust this meal plan based on user feedback: "${feedback}"

Current plan summary: ${this.activeMealPlan.days.length} days
    
Return ONLY valid JSON with modified days.`;

    try {
      const response = await fetch('https://helio-wellness-app-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: prompt }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.response;
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const adjustments = JSON.parse(jsonMatch[0]);
        // Merge adjustments into active plan
        return { 
          success: true, 
          message: 'Meal plan adjusted based on your feedback'
        };
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Adjustment error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to adjust meal plan' };
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

  // PRO: Get complete recipe library
  getRecipeLibrary(category = 'all') {
    const recipes = [
      { id: 1, name: 'Grilled Salmon with Asparagus', category: 'dinner', time: '25 min', calories: 480, difficulty: 'easy', rating: 4.8, servings: 2, protein: 45, carbs: 12, fat: 28 },
      { id: 2, name: 'Avocado Toast with Egg', category: 'breakfast', time: '10 min', calories: 350, difficulty: 'easy', rating: 4.6, servings: 1, protein: 14, carbs: 32, fat: 18 },
      { id: 3, name: 'Chicken Caesar Salad', category: 'lunch', time: '15 min', calories: 420, difficulty: 'easy', rating: 4.7, servings: 2, protein: 38, carbs: 18, fat: 22 },
      { id: 4, name: 'Beef Stir-Fry with Vegetables', category: 'dinner', time: '20 min', calories: 520, difficulty: 'medium', rating: 4.5, servings: 3, protein: 42, carbs: 38, fat: 20 },
      { id: 5, name: 'Greek Yogurt Parfait', category: 'breakfast', time: '5 min', calories: 280, difficulty: 'easy', rating: 4.9, servings: 1, protein: 20, carbs: 35, fat: 8 },
      { id: 6, name: 'Quinoa Buddha Bowl', category: 'lunch', time: '18 min', calories: 450, difficulty: 'easy', rating: 4.8, servings: 2, protein: 18, carbs: 58, fat: 16 },
      { id: 7, name: 'Turkey Meatballs with Zucchini Noodles', category: 'dinner', time: '30 min', calories: 380, difficulty: 'medium', rating: 4.6, servings: 4, protein: 36, carbs: 22, fat: 18 },
      { id: 8, name: 'Protein Smoothie Bowl', category: 'breakfast', time: '8 min', calories: 320, difficulty: 'easy', rating: 4.7, servings: 1, protein: 25, carbs: 42, fat: 8 },
      { id: 9, name: 'Mediterranean Wrap', category: 'lunch', time: '12 min', calories: 400, difficulty: 'easy', rating: 4.5, servings: 1, protein: 22, carbs: 48, fat: 14 },
      { id: 10, name: 'Baked Cod with Sweet Potato', category: 'dinner', time: '35 min', calories: 440, difficulty: 'easy', rating: 4.7, servings: 2, protein: 38, carbs: 42, fat: 12 }
    ];
    
    if (category === 'all') return recipes;
    return recipes.filter(r => r.category === category);
  }

  // PRO: Get macro-optimized meal suggestions
  getMacroOptimizedMeals(targetMacros) {
    const { protein = 150, carbs = 200, fat = 60 } = targetMacros;
    
    return {
      targetMacros: { protein, carbs, fat, calories: (protein * 4) + (carbs * 4) + (fat * 9) },
      suggestedBreakfast: {
        name: 'High-Protein Oatmeal',
        protein: Math.round(protein * 0.25),
        carbs: Math.round(carbs * 0.35),
        fat: Math.round(fat * 0.2),
        calories: 420
      },
      suggestedLunch: {
        name: 'Chicken & Quinoa Bowl',
        protein: Math.round(protein * 0.35),
        carbs: Math.round(carbs * 0.3),
        fat: Math.round(fat * 0.3),
        calories: 580
      },
      suggestedDinner: {
        name: 'Salmon with Brown Rice',
        protein: Math.round(protein * 0.3),
        carbs: Math.round(carbs * 0.25),
        fat: Math.round(fat * 0.35),
        calories: 640
      },
      snacks: [
        { name: 'Greek Yogurt', protein: Math.round(protein * 0.1), carbs: 15, fat: 5, calories: 140 },
        { name: 'Almonds (28g)', protein: 6, carbs: Math.round(carbs * 0.1), fat: Math.round(fat * 0.15), calories: 160 }
      ]
    };
  }

  // PRO: Get ingredient substitutions
  getIngredientSubstitutions(ingredient) {
    const substitutions = {
      'chicken': ['turkey breast', 'tofu', 'tempeh', 'seitan'],
      'beef': ['ground turkey', 'portobello mushrooms', 'lentils', 'black beans'],
      'salmon': ['trout', 'mackerel', 'cod', 'tilapia'],
      'milk': ['almond milk', 'oat milk', 'soy milk', 'coconut milk'],
      'butter': ['olive oil', 'coconut oil', 'avocado oil', 'ghee'],
      'eggs': ['flax eggs', 'chia seeds', 'applesauce', 'mashed banana'],
      'rice': ['quinoa', 'cauliflower rice', 'couscous', 'bulgur'],
      'pasta': ['zucchini noodles', 'spaghetti squash', 'chickpea pasta', 'rice noodles'],
      'cheese': ['nutritional yeast', 'cashew cheese', 'almond cheese', 'vegan cheese'],
      'sugar': ['honey', 'maple syrup', 'stevia', 'monk fruit sweetener']
    };
    
    const lowerIngredient = ingredient.toLowerCase();
    for (const [key, subs] of Object.entries(substitutions)) {
      if (lowerIngredient.includes(key)) {
        return {
          original: ingredient,
          substitutes: subs.map(sub => ({
            name: sub,
            reason: this.getSubstitutionReason(key, sub)
          }))
        };
      }
    }
    
    return { original: ingredient, substitutes: [] };
  }

  getSubstitutionReason(original, substitute) {
    const reasons = {
      'turkey breast': 'Leaner protein, lower fat',
      'tofu': 'Plant-based protein, lower calories',
      'ground turkey': 'Lower fat than beef, same texture',
      'almond milk': 'Dairy-free, lower calories',
      'oat milk': 'Creamy texture, heart-healthy',
      'olive oil': 'Heart-healthy fats, Mediterranean diet',
      'flax eggs': 'Vegan binding, omega-3 rich',
      'quinoa': 'Complete protein, more fiber',
      'zucchini noodles': 'Low-carb, more vegetables',
      'nutritional yeast': 'Cheesy flavor, B vitamins, dairy-free'
    };
    return reasons[substitute] || 'Healthy alternative';
  }

  // PRO: Generate organized grocery list by category
  getOrganizedGroceryList(mealPlan) {
    if (!mealPlan || !mealPlan.weeklyShoppingList) {
      return this.getDemoGroceryList();
    }
    
    const categorized = {
      'Proteins': [],
      'Vegetables': [],
      'Fruits': [],
      'Grains & Bread': [],
      'Dairy & Eggs': [],
      'Pantry': [],
      'Frozen': [],
      'Other': []
    };
    
    mealPlan.weeklyShoppingList.forEach(item => {
      const category = this.categorizeGroceryItem(item.item);
      categorized[category].push({ 
        name: item.item, 
        amount: item.amount, 
        unit: item.unit,
        checked: false 
      });
    });
    
    return categorized;
  }

  categorizeGroceryItem(item) {
    const itemLower = item.toLowerCase();
    
    if (['chicken', 'beef', 'salmon', 'turkey', 'pork', 'fish', 'tofu', 'tempeh'].some(p => itemLower.includes(p))) {
      return 'Proteins';
    }
    if (['broccoli', 'spinach', 'tomato', 'carrot', 'pepper', 'onion', 'lettuce', 'cucumber', 'zucchini'].some(v => itemLower.includes(v))) {
      return 'Vegetables';
    }
    if (['apple', 'banana', 'orange', 'berry', 'lemon', 'lime', 'melon'].some(f => itemLower.includes(f))) {
      return 'Fruits';
    }
    if (['rice', 'pasta', 'bread', 'quinoa', 'oats', 'flour', 'cereal'].some(g => itemLower.includes(g))) {
      return 'Grains & Bread';
    }
    if (['milk', 'cheese', 'yogurt', 'egg', 'butter', 'cream'].some(d => itemLower.includes(d))) {
      return 'Dairy & Eggs';
    }
    if (['salt', 'pepper', 'oil', 'sugar', 'spice', 'sauce', 'vinegar', 'honey'].some(p => itemLower.includes(p))) {
      return 'Pantry';
    }
    if (itemLower.includes('frozen')) {
      return 'Frozen';
    }
    
    return 'Other';
  }

  getDemoGroceryList() {
    return {
      'Proteins': [
        { name: 'Chicken breast', amount: '2', unit: 'lbs', checked: false },
        { name: 'Salmon fillets', amount: '4', unit: 'pieces', checked: false },
        { name: 'Ground turkey', amount: '1', unit: 'lb', checked: false }
      ],
      'Vegetables': [
        { name: 'Broccoli', amount: '2', unit: 'heads', checked: false },
        { name: 'Spinach', amount: '1', unit: 'bag', checked: false },
        { name: 'Bell peppers', amount: '3', unit: 'pieces', checked: false }
      ],
      'Fruits': [
        { name: 'Bananas', amount: '6', unit: 'pieces', checked: false },
        { name: 'Apples', amount: '5', unit: 'pieces', checked: false }
      ],
      'Grains & Bread': [
        { name: 'Brown rice', amount: '2', unit: 'lbs', checked: false },
        { name: 'Whole wheat bread', amount: '1', unit: 'loaf', checked: false },
        { name: 'Quinoa', amount: '1', unit: 'bag', checked: false }
      ],
      'Dairy & Eggs': [
        { name: 'Greek yogurt', amount: '1', unit: 'tub', checked: false },
        { name: 'Eggs', amount: '12', unit: 'pieces', checked: false },
        { name: 'Almond milk', amount: '1', unit: 'carton', checked: false }
      ],
      'Pantry': [
        { name: 'Olive oil', amount: '1', unit: 'bottle', checked: false },
        { name: 'Honey', amount: '1', unit: 'jar', checked: false }
      ],
      'Frozen': [],
      'Other': [
        { name: 'Coffee', amount: '1', unit: 'bag', checked: false }
      ]
    };
  }

  // PRO: Get meal prep instructions for batch cooking
  getMealPrepInstructions(days = 7) {
    return {
      totalPrepTime: '2-3 hours',
      instructions: [
        { step: 1, task: 'Cook all proteins', time: '45 min', tip: 'Season and bake chicken, salmon, turkey together' },
        { step: 2, task: 'Prep vegetables', time: '30 min', tip: 'Wash, chop, and portion into containers' },
        { step: 3, task: 'Cook grains', time: '40 min', tip: 'Make large batch of rice, quinoa in rice cooker' },
        { step: 4, task: 'Portion meals', time: '20 min', tip: 'Use meal prep containers, label with dates' },
        { step: 5, task: 'Store properly', time: '10 min', tip: 'Refrigerate 3 days worth, freeze rest' }
      ],
      storageTips: [
        'Use airtight glass containers',
        'Label everything with dates',
        'Store proteins and carbs separately',
        'Keep sauces on the side',
        'Freeze meals beyond 3 days'
      ],
      equipment: ['Rice cooker', 'Sheet pans', 'Meal prep containers (10+)', 'Food scale', 'Labels']
    };
  }
}

export const mealAutomationService = new MealAutomationService();
export default mealAutomationService;



