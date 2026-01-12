const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { f as firestoreService, a as authService, r as reactExports, z as subscriptionService, j as jsxRuntimeExports, _ as __vitePreload, y as showToast } from "./entry-1767948920134-index.js";
import PaywallModal from "./chunk-1767948920155-PaywallModal.js";
import "./chunk-1767948920158-stripeService.js";
/* empty css                                 */
class MealAutomationService {
  constructor() {
    this.activeMealPlan = null;
    this.shoppingList = [];
    this.connectedAppliances = [];
  }
  // Load saved meal plan from persistent storage
  async loadSavedMealPlan() {
    try {
      const saved = await firestoreService.get("mealPlan", authService.getCurrentUser()?.uid);
      if (saved && saved.plan) {
        const generatedDate = new Date(saved.generatedDate);
        const now = /* @__PURE__ */ new Date();
        const daysDiff = Math.floor((now - generatedDate) / (1e3 * 60 * 60 * 24));
        if (daysDiff >= 7) {
          console.log(`⚠️ Meal plan expired (${daysDiff} days old) - auto-clearing`);
          await this.clearMealPlan();
          return null;
        }
        this.activeMealPlan = saved.plan;
        this.shoppingList = saved.plan.weeklyShoppingList || [];
        console.log(`✅ Loaded saved meal plan (${daysDiff} days old, ${7 - daysDiff} days remaining)`);
        return saved;
      }
      return null;
    } catch (error) {
      console.error("Failed to load meal plan:", error);
      return null;
    }
  }
  // Save meal plan to persistent storage
  async saveMealPlan(mealPlan) {
    try {
      const dataToSave = {
        generatedDate: (/* @__PURE__ */ new Date()).toISOString(),
        plan: mealPlan
      };
      await firestoreService.save("mealPlan", dataToSave, authService.getCurrentUser()?.uid);
      console.log("✅ Meal plan saved to persistent storage");
      return { success: true };
    } catch (error) {
      console.error("Failed to save meal plan:", error);
      return { success: false, error };
    }
  }
  // Get today's override (if user changed today's meals)
  async getTodayOverride() {
    try {
      const override = await firestoreService.get("todayMealOverride", authService.getCurrentUser()?.uid);
      if (override && override.meals) {
        const overrideDate = new Date(override.date).toDateString();
        const today = (/* @__PURE__ */ new Date()).toDateString();
        if (overrideDate === today) {
          console.log("✅ Today override active:", override.meals);
          return override.meals;
        } else {
          await this.clearTodayOverride();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to load today override:", error);
      return null;
    }
  }
  // Generate meals for today only (doesn't affect 7-day plan)
  async generateTodayOverride(preferences = {}) {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error("Please sign in to generate meals");
    }
    const allergenProfile = user.profile?.allergens || [];
    let prompt = "";
    if (preferences.useOwnIngredients && preferences.availableIngredients) {
      prompt = `Create TODAY's meals (breakfast, lunch, dinner) using ONLY these ingredients:

${preferences.availableIngredients}

Requirements:
- MUST use only the ingredients listed
- Avoids these allergens: ${allergenProfile.length > 0 ? allergenProfile.join(", ") : "none"}
- Quick and easy meals`;
    } else {
      prompt = `Create TODAY's meals (breakfast, lunch, dinner):
- Avoids these allergens: ${allergenProfile.length > 0 ? allergenProfile.join(", ") : "none"}
- Quick, delicious, and balanced
- Different from typical meal plans`;
    }
    prompt += `

Return ONLY valid JSON (no markdown):
{
  "breakfast": {
    "name": "Scrambled Eggs with Toast",
    "prepTime": "15 min",
    "calories": 350,
    "ingredients": [{"item": "eggs", "amount": "2", "unit": "pieces"}],
    "steps": ["Beat eggs", "Cook in pan", "Serve with toast"]
  },
  "lunch": {
    "name": "Grilled Chicken Salad",
    "prepTime": "20 min",
    "calories": 450,
    "ingredients": [{"item": "chicken breast", "amount": "1", "unit": "piece"}],
    "steps": ["Grill chicken", "Chop vegetables", "Mix salad"]
  },
  "dinner": {
    "name": "Salmon with Vegetables",
    "prepTime": "25 min",
    "calories": 550,
    "ingredients": [{"item": "salmon", "amount": "1", "unit": "fillet"}],
    "steps": ["Season salmon", "Bake fish", "Steam vegetables"]
  }
}`;
    try {
      const response = await fetch("https://helio-wellness-app-production.up.railway.app/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ message: prompt }),
        mode: "cors"
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      const text = data.response;
      let jsonText = text;
      if (text.includes("```json")) {
        jsonText = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        jsonText = text.split("```")[1].split("```")[0].trim();
      }
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const meals = JSON.parse(jsonMatch[0]);
        const overrideData = {
          date: (/* @__PURE__ */ new Date()).toISOString(),
          meals
        };
        await firestoreService.save("todayMealOverride", overrideData, authService.getCurrentUser()?.uid);
        if (false) ;
        return meals;
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to generate meals");
    }
  }
  // Clear today's override
  async clearTodayOverride() {
    try {
      await firestoreService.save("todayMealOverride", null, authService.getCurrentUser()?.uid);
      console.log("✅ Today override cleared");
      return { success: true };
    } catch (error) {
      console.error("Failed to clear today override:", error);
      return { success: false, error };
    }
  }
  // Clear meal plan
  async clearMealPlan() {
    try {
      await firestoreService.save("mealPlan", null, authService.getCurrentUser()?.uid);
      this.activeMealPlan = null;
      this.shoppingList = [];
      console.log("✅ Meal plan cleared");
      return { success: true };
    } catch (error) {
      console.error("Failed to clear meal plan:", error);
      return { success: false, error };
    }
  }
  // Generate automated meal plan
  async generateSmartMealPlan(days = 7, preferences = {}) {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error("Please sign in to generate meal plans");
    }
    const allergenProfile = user.profile?.allergens || [];
    const dietPrefs = user.profile?.dietaryPreferences || [];
    let prompt = "";
    if (preferences.useOwnIngredients && preferences.availableIngredients) {
      prompt = `Create a ${days}-day meal plan using ONLY these ingredients the user has available:

${preferences.availableIngredients}

Requirements:
- MUST use only the ingredients listed above
- Avoids these allergens: ${allergenProfile.length > 0 ? allergenProfile.join(", ") : "none"}
- Time per meal: ${preferences.maxTime || 30} minutes
- Creative combinations to avoid waste
- Suggest what to buy if ingredients run out`;
    } else {
      prompt = `Create a ${days}-day automated meal plan that:
- Avoids these allergens: ${allergenProfile.length > 0 ? allergenProfile.join(", ") : "none"}
- Follows these dietary preferences: ${dietPrefs.length > 0 ? dietPrefs.join(", ") : "balanced diet"}
- Budget: ${preferences.budget || "moderate"}
- Cooking skill: ${preferences.skill || "beginner"}
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
    try {
      const response = await fetch("https://helio-wellness-app-production.up.railway.app/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ message: prompt }),
        mode: "cors"
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      const text = data.response;
      if (false) ;
      let jsonText = text;
      if (text.includes("```json")) {
        jsonText = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        jsonText = text.split("```")[1].split("```")[0].trim();
      }
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mealPlan = JSON.parse(jsonMatch[0]);
        if (!mealPlan.days || mealPlan.days.length === 0) {
          throw new Error("Invalid meal plan structure");
        }
        if (mealPlan.days.length < days) {
          if (false) ;
        }
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        mealPlan.days.forEach((day, index) => {
          if (!day.dayName && index < 7) {
            day.dayName = dayNames[index];
          }
        });
        this.activeMealPlan = mealPlan;
        this.shoppingList = mealPlan.weeklyShoppingList || [];
        await this.saveMealPlan(mealPlan);
        if (false) ;
        return mealPlan;
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to generate meal plan");
    }
  }
  // Backwards-compatible alias used by automated tests
  async generateMealPlan(days = 7, preferences = {}) {
    return this.generateSmartMealPlan(days, preferences);
  }
  // Auto-order groceries
  async orderGroceries(storePreference = "any") {
    if (this.shoppingList.length === 0) {
      return { success: false, error: "No shopping list available" };
    }
    const order = {
      orderId: "ORD-" + Date.now(),
      items: this.shoppingList,
      store: storePreference,
      estimatedTotal: this.calculateOrderTotal(),
      deliveryTime: "2-4 hours",
      status: "processing"
    };
    return {
      success: true,
      order,
      message: `Groceries ordered! Delivery in ${order.deliveryTime}`
    };
  }
  // Calculate order total
  calculateOrderTotal() {
    const priceDB = {
      "eggs": 4.99,
      "milk": 3.49,
      "bread": 2.99,
      "chicken": 8.99,
      "vegetables": 5.99,
      "fruit": 4.49
    };
    let total = 0;
    this.shoppingList.forEach((item) => {
      const basePrice = priceDB[item.item.toLowerCase()] || 5;
      total += basePrice * (item.amount / 10);
    });
    return Math.round(total * 100) / 100;
  }
  // Connect smart appliance
  async connectAppliance(appliance) {
    const supported = ["air-fryer", "instant-pot", "smart-oven", "slow-cooker"];
    if (!supported.includes(appliance.type)) {
      return { success: false, error: "Appliance not supported" };
    }
    this.connectedAppliances.push({
      id: "APP-" + Date.now(),
      type: appliance.type,
      brand: appliance.brand,
      model: appliance.model,
      connected: true,
      lastSync: (/* @__PURE__ */ new Date()).toISOString()
    });
    return {
      success: true,
      message: `${appliance.type} connected successfully!`
    };
  }
  // Send recipe to smart appliance
  async sendToAppliance(mealName, applianceType) {
    const appliance = this.connectedAppliances.find((a) => a.type === applianceType);
    if (!appliance) {
      return { success: false, error: "Appliance not connected" };
    }
    let mealData = null;
    if (this.activeMealPlan) {
      for (const day of this.activeMealPlan.days) {
        ["breakfast", "lunch", "dinner"].forEach((mealType) => {
          if (day[mealType]?.name === mealName) {
            mealData = day[mealType];
          }
        });
      }
    }
    if (!mealData) {
      return { success: false, error: "Meal not found" };
    }
    return {
      success: true,
      appliance: appliance.type,
      settings: mealData.applianceSettings,
      message: "Recipe sent! Follow voice instructions."
    };
  }
  // Get voice cooking instructions
  async getVoiceInstructions(mealName) {
    if (!this.activeMealPlan) {
      return { success: false, error: "No active meal plan" };
    }
    let mealData = null;
    for (const day of this.activeMealPlan.days) {
      ["breakfast", "lunch", "dinner"].forEach((mealType) => {
        if (day[mealType]?.name === mealName) {
          mealData = day[mealType];
        }
      });
    }
    if (!mealData) {
      return { success: false, error: "Meal not found" };
    }
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
      return { success: false, error: "No active meal plan to adjust" };
    }
    const prompt = `Adjust this meal plan based on user feedback: "${feedback}"

Current plan summary: ${this.activeMealPlan.days.length} days
    
Return ONLY valid JSON with modified days.`;
    try {
      const response = await fetch("https://helio-wellness-app-production.up.railway.app/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ message: prompt }),
        mode: "cors"
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      const text = data.response;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const adjustments = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          message: "Meal plan adjusted based on your feedback"
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to adjust meal plan" };
  }
  // Get today's meal instructions
  async getTodaysMeals() {
    if (!this.activeMealPlan) return null;
    try {
      const saved = await firestoreService.get("mealPlan", authService.getCurrentUser()?.uid);
      if (saved?.generatedDate) {
        const generatedDate = new Date(saved.generatedDate);
        const now = /* @__PURE__ */ new Date();
        const daysDiff = Math.floor((now - generatedDate) / (1e3 * 60 * 60 * 24));
        if (daysDiff >= 7) {
          console.log("⚠️ Meal plan expired - needs refresh");
          return null;
        }
        const dayIndex = Math.min(daysDiff, 6);
        const dayPlan2 = this.activeMealPlan.days[dayIndex];
        if (!dayPlan2) {
          console.warn(`⚠️ No meal plan for day ${dayIndex}`);
          return null;
        }
        return {
          date: (/* @__PURE__ */ new Date()).toDateString(),
          dayNumber: dayIndex + 1,
          daysRemaining: 7 - daysDiff,
          dayName: dayPlan2.dayName,
          breakfast: dayPlan2.breakfast,
          lunch: dayPlan2.lunch,
          dinner: dayPlan2.dinner,
          snacks: dayPlan2.snacks
        };
      }
      const today = (/* @__PURE__ */ new Date()).getDay();
      const dayPlan = this.activeMealPlan.days[today % this.activeMealPlan.days.length];
      return {
        date: (/* @__PURE__ */ new Date()).toDateString(),
        breakfast: dayPlan.breakfast,
        lunch: dayPlan.lunch,
        dinner: dayPlan.dinner,
        snacks: dayPlan.snacks
      };
    } catch (error) {
      console.error("Error getting today's meals:", error);
      const today = (/* @__PURE__ */ new Date()).getDay();
      const dayPlan = this.activeMealPlan.days[today % this.activeMealPlan.days.length];
      return {
        date: (/* @__PURE__ */ new Date()).toDateString(),
        breakfast: dayPlan.breakfast,
        lunch: dayPlan.lunch,
        dinner: dayPlan.dinner,
        snacks: dayPlan.snacks
      };
    }
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
  getRecipeLibrary(category = "all") {
    const recipes = [
      { id: 1, name: "Grilled Salmon with Asparagus", category: "dinner", time: "25 min", calories: 480, difficulty: "easy", rating: 4.8, servings: 2, protein: 45, carbs: 12, fat: 28 },
      { id: 2, name: "Avocado Toast with Egg", category: "breakfast", time: "10 min", calories: 350, difficulty: "easy", rating: 4.6, servings: 1, protein: 14, carbs: 32, fat: 18 },
      { id: 3, name: "Chicken Caesar Salad", category: "lunch", time: "15 min", calories: 420, difficulty: "easy", rating: 4.7, servings: 2, protein: 38, carbs: 18, fat: 22 },
      { id: 4, name: "Beef Stir-Fry with Vegetables", category: "dinner", time: "20 min", calories: 520, difficulty: "medium", rating: 4.5, servings: 3, protein: 42, carbs: 38, fat: 20 },
      { id: 5, name: "Greek Yogurt Parfait", category: "breakfast", time: "5 min", calories: 280, difficulty: "easy", rating: 4.9, servings: 1, protein: 20, carbs: 35, fat: 8 },
      { id: 6, name: "Quinoa Buddha Bowl", category: "lunch", time: "18 min", calories: 450, difficulty: "easy", rating: 4.8, servings: 2, protein: 18, carbs: 58, fat: 16 },
      { id: 7, name: "Turkey Meatballs with Zucchini Noodles", category: "dinner", time: "30 min", calories: 380, difficulty: "medium", rating: 4.6, servings: 4, protein: 36, carbs: 22, fat: 18 },
      { id: 8, name: "Protein Smoothie Bowl", category: "breakfast", time: "8 min", calories: 320, difficulty: "easy", rating: 4.7, servings: 1, protein: 25, carbs: 42, fat: 8 },
      { id: 9, name: "Mediterranean Wrap", category: "lunch", time: "12 min", calories: 400, difficulty: "easy", rating: 4.5, servings: 1, protein: 22, carbs: 48, fat: 14 },
      { id: 10, name: "Baked Cod with Sweet Potato", category: "dinner", time: "35 min", calories: 440, difficulty: "easy", rating: 4.7, servings: 2, protein: 38, carbs: 42, fat: 12 }
    ];
    if (category === "all") return recipes;
    return recipes.filter((r) => r.category === category);
  }
  // PRO: Get macro-optimized meal suggestions
  getMacroOptimizedMeals(targetMacros) {
    const { protein = 150, carbs = 200, fat = 60 } = targetMacros;
    return {
      targetMacros: { protein, carbs, fat, calories: protein * 4 + carbs * 4 + fat * 9 },
      suggestedBreakfast: {
        name: "High-Protein Oatmeal",
        protein: Math.round(protein * 0.25),
        carbs: Math.round(carbs * 0.35),
        fat: Math.round(fat * 0.2),
        calories: 420
      },
      suggestedLunch: {
        name: "Chicken & Quinoa Bowl",
        protein: Math.round(protein * 0.35),
        carbs: Math.round(carbs * 0.3),
        fat: Math.round(fat * 0.3),
        calories: 580
      },
      suggestedDinner: {
        name: "Salmon with Brown Rice",
        protein: Math.round(protein * 0.3),
        carbs: Math.round(carbs * 0.25),
        fat: Math.round(fat * 0.35),
        calories: 640
      },
      snacks: [
        { name: "Greek Yogurt", protein: Math.round(protein * 0.1), carbs: 15, fat: 5, calories: 140 },
        { name: "Almonds (28g)", protein: 6, carbs: Math.round(carbs * 0.1), fat: Math.round(fat * 0.15), calories: 160 }
      ]
    };
  }
  // PRO: Get ingredient substitutions
  getIngredientSubstitutions(ingredient) {
    const substitutions = {
      "chicken": ["turkey breast", "tofu", "tempeh", "seitan"],
      "beef": ["ground turkey", "portobello mushrooms", "lentils", "black beans"],
      "salmon": ["trout", "mackerel", "cod", "tilapia"],
      "milk": ["almond milk", "oat milk", "soy milk", "coconut milk"],
      "butter": ["olive oil", "coconut oil", "avocado oil", "ghee"],
      "eggs": ["flax eggs", "chia seeds", "applesauce", "mashed banana"],
      "rice": ["quinoa", "cauliflower rice", "couscous", "bulgur"],
      "pasta": ["zucchini noodles", "spaghetti squash", "chickpea pasta", "rice noodles"],
      "cheese": ["nutritional yeast", "cashew cheese", "almond cheese", "vegan cheese"],
      "sugar": ["honey", "maple syrup", "stevia", "monk fruit sweetener"]
    };
    const lowerIngredient = ingredient.toLowerCase();
    for (const [key, subs] of Object.entries(substitutions)) {
      if (lowerIngredient.includes(key)) {
        return {
          original: ingredient,
          substitutes: subs.map((sub) => ({
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
      "turkey breast": "Leaner protein, lower fat",
      "tofu": "Plant-based protein, lower calories",
      "ground turkey": "Lower fat than beef, same texture",
      "almond milk": "Dairy-free, lower calories",
      "oat milk": "Creamy texture, heart-healthy",
      "olive oil": "Heart-healthy fats, Mediterranean diet",
      "flax eggs": "Vegan binding, omega-3 rich",
      "quinoa": "Complete protein, more fiber",
      "zucchini noodles": "Low-carb, more vegetables",
      "nutritional yeast": "Cheesy flavor, B vitamins, dairy-free"
    };
    return reasons[substitute] || "Healthy alternative";
  }
  // PRO: Generate organized grocery list by category
  getOrganizedGroceryList(mealPlan) {
    if (!mealPlan || !mealPlan.weeklyShoppingList) {
      return this.getDemoGroceryList();
    }
    const categorized = {
      "Proteins": [],
      "Vegetables": [],
      "Fruits": [],
      "Grains & Bread": [],
      "Dairy & Eggs": [],
      "Pantry": [],
      "Frozen": [],
      "Other": []
    };
    mealPlan.weeklyShoppingList.forEach((item) => {
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
    if (["chicken", "beef", "salmon", "turkey", "pork", "fish", "tofu", "tempeh"].some((p) => itemLower.includes(p))) {
      return "Proteins";
    }
    if (["broccoli", "spinach", "tomato", "carrot", "pepper", "onion", "lettuce", "cucumber", "zucchini"].some((v) => itemLower.includes(v))) {
      return "Vegetables";
    }
    if (["apple", "banana", "orange", "berry", "lemon", "lime", "melon"].some((f) => itemLower.includes(f))) {
      return "Fruits";
    }
    if (["rice", "pasta", "bread", "quinoa", "oats", "flour", "cereal"].some((g) => itemLower.includes(g))) {
      return "Grains & Bread";
    }
    if (["milk", "cheese", "yogurt", "egg", "butter", "cream"].some((d) => itemLower.includes(d))) {
      return "Dairy & Eggs";
    }
    if (["salt", "pepper", "oil", "sugar", "spice", "sauce", "vinegar", "honey"].some((p) => itemLower.includes(p))) {
      return "Pantry";
    }
    if (itemLower.includes("frozen")) {
      return "Frozen";
    }
    return "Other";
  }
  getDemoGroceryList() {
    return {
      "Proteins": [
        { name: "Chicken breast", amount: "2", unit: "lbs", checked: false },
        { name: "Salmon fillets", amount: "4", unit: "pieces", checked: false },
        { name: "Ground turkey", amount: "1", unit: "lb", checked: false }
      ],
      "Vegetables": [
        { name: "Broccoli", amount: "2", unit: "heads", checked: false },
        { name: "Spinach", amount: "1", unit: "bag", checked: false },
        { name: "Bell peppers", amount: "3", unit: "pieces", checked: false }
      ],
      "Fruits": [
        { name: "Bananas", amount: "6", unit: "pieces", checked: false },
        { name: "Apples", amount: "5", unit: "pieces", checked: false }
      ],
      "Grains & Bread": [
        { name: "Brown rice", amount: "2", unit: "lbs", checked: false },
        { name: "Whole wheat bread", amount: "1", unit: "loaf", checked: false },
        { name: "Quinoa", amount: "1", unit: "bag", checked: false }
      ],
      "Dairy & Eggs": [
        { name: "Greek yogurt", amount: "1", unit: "tub", checked: false },
        { name: "Eggs", amount: "12", unit: "pieces", checked: false },
        { name: "Almond milk", amount: "1", unit: "carton", checked: false }
      ],
      "Pantry": [
        { name: "Olive oil", amount: "1", unit: "bottle", checked: false },
        { name: "Honey", amount: "1", unit: "jar", checked: false }
      ],
      "Frozen": [],
      "Other": [
        { name: "Coffee", amount: "1", unit: "bag", checked: false }
      ]
    };
  }
  // PRO: Get meal prep instructions for batch cooking
  getMealPrepInstructions(days = 7) {
    return {
      totalPrepTime: "2-3 hours",
      instructions: [
        { step: 1, task: "Cook all proteins", time: "45 min", tip: "Season and bake chicken, salmon, turkey together" },
        { step: 2, task: "Prep vegetables", time: "30 min", tip: "Wash, chop, and portion into containers" },
        { step: 3, task: "Cook grains", time: "40 min", tip: "Make large batch of rice, quinoa in rice cooker" },
        { step: 4, task: "Portion meals", time: "20 min", tip: "Use meal prep containers, label with dates" },
        { step: 5, task: "Store properly", time: "10 min", tip: "Refrigerate 3 days worth, freeze rest" }
      ],
      storageTips: [
        "Use airtight glass containers",
        "Label everything with dates",
        "Store proteins and carbs separately",
        "Keep sauces on the side",
        "Freeze meals beyond 3 days"
      ],
      equipment: ["Rice cooker", "Sheet pans", "Meal prep containers (10+)", "Food scale", "Labels"]
    };
  }
}
const mealAutomationService = new MealAutomationService();
function MealAutomation({ onClose }) {
  const [view, setView] = reactExports.useState("today");
  const [mealPlan, setMealPlan] = reactExports.useState(null);
  const [todaysMeals, setTodaysMeals] = reactExports.useState(null);
  const [appliances, setAppliances] = reactExports.useState([]);
  const [ordering, setOrdering] = reactExports.useState(false);
  const [generating, setGenerating] = reactExports.useState(false);
  const [showIngredientsInput, setShowIngredientsInput] = reactExports.useState(false);
  const [userIngredients, setUserIngredients] = reactExports.useState("");
  const [recipeLibrary, setRecipeLibrary] = reactExports.useState([]);
  const [selectedCategory, setSelectedCategory] = reactExports.useState("all");
  const [groceryList, setGroceryList] = reactExports.useState({});
  const [mealPrepGuide, setMealPrepGuide] = reactExports.useState(null);
  const [macroTargets, setMacroTargets] = reactExports.useState({ protein: 150, carbs: 200, fat: 60 });
  const [macroMeals, setMacroMeals] = reactExports.useState(null);
  const [showPaywall, setShowPaywall] = reactExports.useState(false);
  const [planExpiration, setPlanExpiration] = reactExports.useState(null);
  const [todayOverride, setTodayOverride] = reactExports.useState(null);
  const [generatingOverride, setGeneratingOverride] = reactExports.useState(false);
  const [showOverrideIngredients, setShowOverrideIngredients] = reactExports.useState(false);
  const [overrideIngredients, setOverrideIngredients] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!subscriptionService.hasAccess("mealAutomation")) {
      setShowPaywall(true);
      return;
    }
    const loadMealData = async () => {
      try {
        const { Preferences } = await __vitePreload(async () => {
          const { Preferences: Preferences2 } = await import("./entry-1767948920134-index.js").then((n) => n.a3);
          return { Preferences: Preferences2 };
        }, true ? __vite__mapDeps([0,1]) : void 0);
        const { value: plansValue } = await Preferences.get({ key: "meal_plans" });
        const { value: prefsValue } = await Preferences.get({ key: "meal_preferences" });
        const localPlans = localStorage.getItem("meal_plans");
        const localPrefs = localStorage.getItem("meal_preferences");
        if (plansValue) {
          if (false) ;
        } else if (localPlans) {
          if (false) ;
        }
        if (prefsValue) {
          if (false) ;
        } else if (localPrefs) {
          if (false) ;
        }
      } catch (error) {
        console.error("Failed to load meal data:", error);
      }
    };
    loadMealData();
    loadSavedMealPlan();
    loadTodayOverride();
    loadTodaysMeals();
    loadAppliances();
    loadRecipeLibrary();
    loadMealPrepGuide();
  }, []);
  const loadSavedMealPlan = async () => {
    const saved = await mealAutomationService.loadSavedMealPlan();
    if (saved && saved.plan) {
      const generatedDate = new Date(saved.generatedDate);
      const now = /* @__PURE__ */ new Date();
      const daysDiff = Math.floor((now - generatedDate) / (1e3 * 60 * 60 * 24));
      const daysRemaining = 7 - daysDiff;
      setPlanExpiration({
        generatedDate: saved.generatedDate,
        daysOld: daysDiff,
        daysRemaining,
        isExpiringSoon: daysRemaining <= 2
      });
      setMealPlan(saved.plan);
    } else {
      setPlanExpiration(null);
    }
  };
  const loadTodayOverride = async () => {
    const override = await mealAutomationService.getTodayOverride();
    setTodayOverride(override);
  };
  const loadTodaysMeals = async () => {
    const meals = await mealAutomationService.getTodaysMeals();
    setTodaysMeals(meals);
  };
  const loadAppliances = () => {
    setAppliances(mealAutomationService.connectedAppliances || []);
  };
  const loadRecipeLibrary = () => {
    const recipes = mealAutomationService.getRecipeLibrary("all");
    setRecipeLibrary(recipes);
  };
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const recipes = mealAutomationService.getRecipeLibrary(category);
    setRecipeLibrary(recipes);
  };
  const loadGroceryList = () => {
    const list = mealAutomationService.getOrganizedGroceryList(mealPlan);
    setGroceryList(list);
  };
  const loadMealPrepGuide = () => {
    const guide = mealAutomationService.getMealPrepInstructions(7);
    setMealPrepGuide(guide);
  };
  const handleGeneratePlan = async (useIngredients = false) => {
    setGenerating(true);
    try {
      const plan = await mealAutomationService.generateSmartMealPlan(7, {
        maxTime: 30,
        budget: "moderate",
        skill: "beginner",
        useOwnIngredients: useIngredients,
        availableIngredients: useIngredients ? userIngredients : null
      });
      if (false) ;
      setMealPlan(plan);
      loadTodaysMeals();
      setShowIngredientsInput(false);
    } catch (error) {
      showToast("Failed to generate meal plan: " + error.message, "error");
    } finally {
      setGenerating(false);
    }
  };
  const handleRefreshPlan = async () => {
    if (confirm("🔄 Generate a fresh meal plan?\n\nThis will replace your current plan with new meal suggestions.")) {
      await handleGeneratePlan();
    }
  };
  const handleCancelPlan = async () => {
    if (confirm("🗑️ Cancel 7-Day Plan?\n\nThis will delete your entire weekly meal plan. You can generate a new one anytime.")) {
      setGenerating(true);
      try {
        await mealAutomationService.clearMealPlan();
        setMealPlan(null);
        setTodaysMeals(null);
        setPlanExpiration(null);
        showToast("Meal plan cancelled", "success");
      } catch (error) {
        showToast("Failed to cancel plan", "error");
      } finally {
        setGenerating(false);
      }
    }
  };
  const handleChangeTodaysMeals = async (useIngredients = false) => {
    setGeneratingOverride(true);
    try {
      const override = await mealAutomationService.generateTodayOverride({
        useOwnIngredients: useIngredients,
        availableIngredients: useIngredients ? overrideIngredients : null
      });
      setTodayOverride(override);
      setShowOverrideIngredients(false);
      setOverrideIngredients("");
      showToast("✨ Today's meals changed!", "success");
    } catch (error) {
      showToast("Failed to change meals: " + error.message, "error");
    } finally {
      setGeneratingOverride(false);
    }
  };
  const handleClearTodayOverride = async () => {
    await mealAutomationService.clearTodayOverride();
    setTodayOverride(null);
    loadTodaysMeals();
    showToast("Restored to weekly plan", "success");
  };
  const handleGenerateFromIngredients = () => {
    setShowIngredientsInput(true);
  };
  const handleSubmitIngredients = () => {
    if (!userIngredients.trim()) {
      showToast("Please enter the ingredients you have available!", "warning");
      return;
    }
    handleGeneratePlan(true);
  };
  const handleOrderGroceries = async () => {
    if (!mealPlan) {
      showToast("Please generate a meal plan first!", "warning");
      return;
    }
    alert(`🚀 COMING SOON!

🛒 Auto Grocery Delivery

We're partnering with:
🇬🇧 Tesco | Sainsbury's | Ocado
🇺🇸 Instacart | Amazon Fresh

Features:
✅ One-click ordering
✅ Same-day delivery
✅ Auto-restock essentials
✅ Price comparison

📅 Launch: Q1 2026

💡 Your meal plan is ready - you'll be able to order all ingredients with one tap soon!`);
  };
  const handleSendToAppliance = async (mealName, applianceType) => {
    alert(`🔥 COMING SOON!

👨‍🍳 Smart Appliance Control

Supported devices:
🍟 Air Fryers (Ninja, Cosori)
🍲 Instant Pots (Smart WiFi)
🔥 Smart Ovens (June, Samsung)
🥘 Slow Cookers (Crock-Pot)

How it works:
✅ Connect via WiFi
✅ Send recipe wirelessly
✅ Auto-set temp & time
✅ Get cooking notifications

📅 Launch: Q2 2026

💡 For now, follow the recipe steps manually for "${mealName}"!`);
  };
  const handleConnectAppliance = async () => {
    alert(`🔌 COMING SOON!

⚡ Smart Appliance Pairing

Compatible brands:
🔥 Ninja Foodi
🍟 Cosori Smart
🍲 Instant Pot WiFi
🔥 Tefal Cook4Me

Setup process:
1️⃣ Connect appliance to WiFi
2️⃣ Scan QR code in app
3️⃣ Authorize WellnessAI
4️⃣ Start cooking!

📅 Launch: Q2 2026

💡 Stay tuned for wireless cooking control!`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meals-overlay", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meals-modal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "meals-close", onClick: onClose, children: "✕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "meals-title", children: "🍽️ Meal Automation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meals-nav", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "today" ? "active" : ""}`,
            onClick: () => setView("today"),
            children: "📅 Today"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "plan" ? "active" : ""}`,
            onClick: () => setView("plan"),
            children: "📋 Plan"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "recipes" ? "active" : ""}`,
            onClick: () => {
              setView("recipes");
              loadRecipeLibrary();
            },
            children: "📖 Recipes"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "grocery" ? "active" : ""}`,
            onClick: () => {
              setView("grocery");
              loadGroceryList();
            },
            children: "🛒 Grocery"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "mealprep" ? "active" : ""}`,
            onClick: () => setView("mealprep"),
            children: "🔪 Prep"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `nav-btn ${view === "appliances" ? "active" : ""}`,
            onClick: () => setView("appliances"),
            children: "🔌 Appliances"
          }
        )
      ] }),
      view === "today" && todaysMeals && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "today-view", children: [
        todaysMeals.dayNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "today-day-badge", children: [
          "📅 Day ",
          todaysMeals.dayNumber,
          "/7 ",
          todaysMeals.dayName && `• ${todaysMeals.dayName}`,
          todaysMeals.daysRemaining !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "remaining", children: [
            " • ",
            todaysMeals.daysRemaining,
            " day",
            todaysMeals.daysRemaining !== 1 ? "s" : "",
            " left"
          ] })
        ] }),
        todayOverride && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "override-active-badge", children: [
          "⚡ Using custom meals for today",
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "restore-btn", onClick: handleClearTodayOverride, children: "↩️ Back to Plan" })
        ] }),
        Object.entries(todayOverride || todaysMeals).filter(([type]) => !["date", "dayNumber", "daysRemaining", "dayName"].includes(type)).map(([type, meal]) => meal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meal-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "meal-type", children: type.charAt(0).toUpperCase() + type.slice(1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "meal-name", children: meal.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meal-time", children: [
            "⏱️ ",
            meal.prepTime,
            " • 🔥 ",
            meal.calories,
            " cal"
          ] }),
          meal.smartAppliance && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: "cook-btn",
              onClick: () => handleSendToAppliance(meal.name, meal.smartAppliance),
              children: [
                "👨‍🍳 Send to ",
                meal.smartAppliance.replace(/-/g, " ")
              ]
            }
          )
        ] }, type)),
        (!todaysMeals || Object.values(todaysMeals).every((m) => !m)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-meals", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "📋 No meal plan for today" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "help-text", children: "Generate a 7-day plan to get started" })
        ] }),
        todaysMeals && mealPlan && !todayOverride && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "today-override-actions", children: !showOverrideIngredients ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "override-btn",
              onClick: () => handleChangeTodaysMeals(false),
              disabled: generatingOverride,
              children: generatingOverride ? "⏳ Generating..." : "🔄 Change Today's Meals"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "override-ingredients-btn",
              onClick: () => setShowOverrideIngredients(true),
              disabled: generatingOverride,
              children: "🥕 Cook From My Ingredients"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "override-ingredients-input", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "What's in your kitchen today?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              placeholder: "Example: chicken, eggs, rice, tomatoes, onions...",
              value: overrideIngredients,
              onChange: (e) => setOverrideIngredients(e.target.value),
              rows: 4
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "override-buttons", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "submit-override-btn",
                onClick: () => handleChangeTodaysMeals(true),
                disabled: generatingOverride || !overrideIngredients.trim(),
                children: generatingOverride ? "⏳ Creating..." : "🍳 Cook Today"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "cancel-override-btn",
                onClick: () => {
                  setShowOverrideIngredients(false);
                  setOverrideIngredients("");
                },
                children: "✕ Cancel"
              }
            )
          ] })
        ] }) })
      ] }),
      view === "plan" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plan-view", children: !mealPlan ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "generate-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plan-icon", children: "✨🍽️✨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "AI Meal Planning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Generate a personalized 7-day meal plan tailored to your allergens and preferences" }),
        !showIngredientsInput ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "generate-btn",
              onClick: () => handleGeneratePlan(false),
              disabled: generating,
              children: generating ? "⏳ Generating..." : "✨ Generate 7-Day Plan"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ingredients-btn",
              onClick: handleGenerateFromIngredients,
              disabled: generating,
              children: "🥕 Use My Ingredients"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "help-text-small", children: "Or generate meals from what you already have!" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ingredients-input-section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "What's in your kitchen?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              className: "ingredients-textarea",
              placeholder: "Example: chicken breasts, eggs, milk, rice, tomatoes, onions, garlic, pasta, cheese, broccoli...",
              value: userIngredients,
              onChange: (e) => setUserIngredients(e.target.value),
              rows: 6
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ingredients-buttons", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "submit-ingredients-btn",
                onClick: handleSubmitIngredients,
                disabled: generating,
                children: generating ? "⏳ Creating..." : "🍳 Create"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "cancel-ingredients-btn",
                onClick: () => setShowIngredientsInput(false),
                children: "← Back"
              }
            )
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        planExpiration && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plan-header-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `plan-expiration-badge ${planExpiration.isExpiringSoon ? "warning" : ""}`, children: [
            "📅 Day ",
            planExpiration.daysOld + 1,
            "/7",
            planExpiration.daysRemaining > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "expiry-info", children: planExpiration.isExpiringSoon ? ` • ⚠️ Expires in ${planExpiration.daysRemaining} day${planExpiration.daysRemaining > 1 ? "s" : ""}` : ` • ${planExpiration.daysRemaining} day${planExpiration.daysRemaining > 1 ? "s" : ""} remaining` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "cancel-plan-btn",
              onClick: handleCancelPlan,
              disabled: generating,
              children: "🗑️ Cancel Plan"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plan-summary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Weekly Meal Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-stats", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-icon", children: "🍽️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                mealPlan.days.length * 3,
                " Meals"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "summary-icon", children: "🛒" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                mealPlan.weeklyShoppingList.length,
                " Items"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plan-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "order-btn",
                onClick: handleOrderGroceries,
                disabled: ordering,
                children: ordering ? "⏳ Ordering..." : "🛒 Order All Groceries"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "refresh-btn",
                onClick: handleRefreshPlan,
                disabled: generating,
                children: generating ? "⏳ Refreshing..." : "🔄 Refresh Plan"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "days-list", children: mealPlan.days.map((day, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "day-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "day-header", children: day.dayName || `Day ${idx + 1}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "day-meals", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mini-meal", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-type", children: "🌅 Breakfast" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-name", children: day.breakfast.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-calories", children: [
                "🔥 ",
                day.breakfast.calories,
                " cal"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mini-meal", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-type", children: "☀️ Lunch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-name", children: day.lunch.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-calories", children: [
                "🔥 ",
                day.lunch.calories,
                " cal"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mini-meal", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-type", children: "🌙 Dinner" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-name", children: day.dinner.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-calories", children: [
                "🔥 ",
                day.dinner.calories,
                " cal"
              ] })
            ] })
          ] })
        ] }, idx)) })
      ] }) }),
      view === "appliances" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "appliances-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Connected Appliances" }),
        appliances.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-appliances", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "🔌 No appliances connected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "connect-btn", onClick: handleConnectAppliance, children: "➕ Connect Appliance" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "appliances-list", children: appliances.map((appliance, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "appliance-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "appliance-icon", children: [
            appliance.type === "air-fryer" && "🍟",
            appliance.type === "instant-pot" && "🍲",
            appliance.type === "smart-oven" && "🔥",
            appliance.type === "slow-cooker" && "🥘"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "appliance-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "appliance-name", children: appliance.type.replace(/-/g, " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "appliance-model", children: [
              appliance.brand,
              " ",
              appliance.model
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "appliance-status", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-dot connected" }),
            "Connected"
          ] })
        ] }, idx)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "supported-appliances", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Supported Appliances:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "supported-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "supported-item", children: "🍟 Air Fryers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "supported-item", children: "🍲 Instant Pots" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "supported-item", children: "🔥 Smart Ovens" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "supported-item", children: "🥘 Slow Cookers" })
          ] })
        ] })
      ] }),
      view === "recipes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipes-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "category-filter", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: selectedCategory === "all" ? "active" : "", onClick: () => handleCategoryChange("all"), children: "All" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: selectedCategory === "breakfast" ? "active" : "", onClick: () => handleCategoryChange("breakfast"), children: "Breakfast" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: selectedCategory === "lunch" ? "active" : "", onClick: () => handleCategoryChange("lunch"), children: "Lunch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: selectedCategory === "dinner" ? "active" : "", onClick: () => handleCategoryChange("dinner"), children: "Dinner" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recipes-grid", children: recipeLibrary.map((recipe) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-card-pro", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-header-pro", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recipe-name-pro", children: recipe.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-rating", children: [
              "⭐ ",
              recipe.rating
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-stats", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-stat", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "⏱️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: recipe.time })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-stat", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "🔥" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                recipe.calories,
                " cal"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-stat", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-icon", children: "👥" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: recipe.servings })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-macros", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-mini", children: [
              "P: ",
              recipe.protein,
              "g"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-mini", children: [
              "C: ",
              recipe.carbs,
              "g"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "macro-mini", children: [
              "F: ",
              recipe.fat,
              "g"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recipe-difficulty", children: recipe.difficulty })
        ] }, recipe.id)) })
      ] }),
      view === "grocery" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grocery-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grocery-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📋 Shopping List" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "export-grocery-btn", onClick: () => alert("Grocery list exported!"), children: "📤 Export" })
        ] }),
        Object.keys(groceryList).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "empty-grocery", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Generate a meal plan first to see your grocery list!" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grocery-categories", children: Object.entries(groceryList).map(([category, items]) => items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grocery-category", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "category-header", children: category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grocery-items-list", children: items.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grocery-item-pro", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "grocery-checkbox" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "item-details", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "item-name", children: item.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "item-amount", children: [
                item.amount,
                " ",
                item.unit
              ] })
            ] })
          ] }, idx)) })
        ] }, category)) })
      ] }),
      view === "mealprep" && mealPrepGuide && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mealprep-view", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🔪 Meal Prep Guide" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prep-time-estimate", children: [
          "Total Time: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: mealPrepGuide.totalPrepTime })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prep-instructions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "📝 Batch Cooking Steps" }),
          mealPrepGuide.instructions.map((instruction) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prep-step", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-number", children: [
              "Step ",
              instruction.step
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-content", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-task", children: instruction.task }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-time", children: [
                "⏱️ ",
                instruction.time
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-tip", children: [
                "💡 ",
                instruction.tip
              ] })
            ] })
          ] }, instruction.step))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "storage-tips", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "📦 Storage Tips" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: mealPrepGuide.storageTips.map((tip, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: tip }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipment-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "🔧 Equipment Needed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "equipment-grid", children: mealPrepGuide.equipment.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "equipment-item", children: item }, idx)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "meals-features", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-badge", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "🍽️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "AI-Generated Plans" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-badge", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "🛒" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Auto Grocery Delivery" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-badge", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-icon", children: "👨‍🍳" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-text", children: "Smart Appliance Control" })
        ] })
      ] })
    ] }),
    showPaywall && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PaywallModal,
      {
        isOpen: showPaywall,
        onClose,
        featureName: "Meal Automation",
        message: subscriptionService.getUpgradeMessage("mealAutomation"),
        currentPlan: subscriptionService.getCurrentPlan()
      }
    )
  ] });
}
export {
  MealAutomation as default
};
