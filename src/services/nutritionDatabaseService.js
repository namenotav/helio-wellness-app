// USDA Food Database Service
// Access to 500,000+ foods via USDA FoodData Central API

class NutritionDatabaseService {
  constructor() {
    this.apiKey = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
    this.baseUrl = 'https://api.nal.usda.gov/fdc/v1';
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Search foods in USDA database
   */
  async searchFood(query, pageSize = 25) {
    if (!query || query.length < 2) {
      return { foods: [], totalHits: 0 };
    }

    try {
      // Check cache
      const cacheKey = `search:${query}:${pageSize}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          console.log('📦 Returning cached results for:', query);
          return cached.data;
        }
      }

      console.log('🔍 Searching USDA database:', query);

      const response = await fetch(
        `${this.baseUrl}/foods/search?` + new URLSearchParams({
          api_key: this.apiKey,
          query: query,
          pageSize: pageSize,
          dataType: ['Branded', 'Survey (FNDDS)'].join(',')
        })
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();

      // Format results
      const foods = data.foods.map(food => ({
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner,
        brandName: food.brandName,
        ingredients: food.ingredients,
        servingSize: food.servingSize,
        servingSizeUnit: food.servingSizeUnit,
        calories: this.getNutrient(food, 'Energy'),
        protein: this.getNutrient(food, 'Protein'),
        carbs: this.getNutrient(food, 'Carbohydrate, by difference'),
        fat: this.getNutrient(food, 'Total lipid (fat)'),
        fiber: this.getNutrient(food, 'Fiber, total dietary'),
        sugar: this.getNutrient(food, 'Sugars, total including NLEA'),
        sodium: this.getNutrient(food, 'Sodium, Na'),
        dataType: food.dataType,
        score: food.score
      }));

      const result = {
        foods,
        totalHits: data.totalHits,
        query
      };

      // Cache results
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`✅ Found ${foods.length} foods`);
      return result;

    } catch (error) {
      console.error('❌ USDA search error:', error);
      
      // Fallback to local database
      return this.searchLocalDatabase(query);
    }
  }

  /**
   * Get food details by FDC ID
   */
  async getFoodDetails(fdcId) {
    try {
      // Check cache
      const cacheKey = `food:${fdcId}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data;
        }
      }

      console.log('📊 Fetching food details:', fdcId);

      const response = await fetch(
        `${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const food = await response.json();

      const details = {
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner,
        ingredients: food.ingredients,
        servingSize: food.servingSize,
        servingSizeUnit: food.servingSizeUnit,
        nutrients: food.foodNutrients.map(n => ({
          name: n.nutrient.name,
          amount: n.amount,
          unit: n.nutrient.unitName
        })),
        categories: food.foodCategory ? [food.foodCategory.description] : []
      };

      // Cache details
      this.cache.set(cacheKey, {
        data: details,
        timestamp: Date.now()
      });

      return details;

    } catch (error) {
      console.error('❌ Food details error:', error);
      throw error;
    }
  }

  /**
   * Get nutrient value from food
   */
  getNutrient(food, nutrientName) {
    const nutrient = food.foodNutrients?.find(
      n => n.nutrientName === nutrientName
    );
    return nutrient ? {
      value: nutrient.value,
      unit: nutrient.unitName
    } : null;
  }

  /**
   * Get nutrition facts for custom amount
   */
  calculateNutrition(food, grams) {
    const servingGrams = food.servingSize || 100;
    const multiplier = grams / servingGrams;

    return {
      calories: food.calories ? Math.round(food.calories.value * multiplier) : 0,
      protein: food.protein ? (food.protein.value * multiplier).toFixed(1) : 0,
      carbs: food.carbs ? (food.carbs.value * multiplier).toFixed(1) : 0,
      fat: food.fat ? (food.fat.value * multiplier).toFixed(1) : 0,
      fiber: food.fiber ? (food.fiber.value * multiplier).toFixed(1) : 0,
      sugar: food.sugar ? (food.sugar.value * multiplier).toFixed(1) : 0,
      sodium: food.sodium ? Math.round(food.sodium.value * multiplier) : 0
    };
  }

  /**
   * Search local database (fallback)
   */
  searchLocalDatabase(query) {
    const localFoods = this.getCommonFoods();
    const lowerQuery = query.toLowerCase();
    
    const matches = localFoods.filter(food => 
      food.description.toLowerCase().includes(lowerQuery)
    );

    return {
      foods: matches.slice(0, 25),
      totalHits: matches.length,
      query,
      source: 'local'
    };
  }

  /**
   * Get common foods (backup database)
   */
  getCommonFoods() {
    return [
      { fdcId: 'local-1', description: 'Chicken Breast, Raw', calories: { value: 165, unit: 'kcal' }, protein: { value: 31, unit: 'g' }, carbs: { value: 0, unit: 'g' }, fat: { value: 3.6, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-2', description: 'Brown Rice, Cooked', calories: { value: 112, unit: 'kcal' }, protein: { value: 2.6, unit: 'g' }, carbs: { value: 24, unit: 'g' }, fat: { value: 0.9, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-3', description: 'Broccoli, Raw', calories: { value: 34, unit: 'kcal' }, protein: { value: 2.8, unit: 'g' }, carbs: { value: 7, unit: 'g' }, fat: { value: 0.4, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-4', description: 'Salmon, Atlantic, Farmed, Raw', calories: { value: 208, unit: 'kcal' }, protein: { value: 20, unit: 'g' }, carbs: { value: 0, unit: 'g' }, fat: { value: 13, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-5', description: 'Apple, Raw, with Skin', calories: { value: 52, unit: 'kcal' }, protein: { value: 0.3, unit: 'g' }, carbs: { value: 14, unit: 'g' }, fat: { value: 0.2, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-6', description: 'Banana, Raw', calories: { value: 89, unit: 'kcal' }, protein: { value: 1.1, unit: 'g' }, carbs: { value: 23, unit: 'g' }, fat: { value: 0.3, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-7', description: 'Eggs, Whole, Raw', calories: { value: 143, unit: 'kcal' }, protein: { value: 13, unit: 'g' }, carbs: { value: 0.7, unit: 'g' }, fat: { value: 10, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-8', description: 'Almonds, Raw', calories: { value: 579, unit: 'kcal' }, protein: { value: 21, unit: 'g' }, carbs: { value: 22, unit: 'g' }, fat: { value: 50, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-9', description: 'Greek Yogurt, Plain, Nonfat', calories: { value: 59, unit: 'kcal' }, protein: { value: 10, unit: 'g' }, carbs: { value: 3.6, unit: 'g' }, fat: { value: 0.4, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-10', description: 'Sweet Potato, Raw', calories: { value: 86, unit: 'kcal' }, protein: { value: 1.6, unit: 'g' }, carbs: { value: 20, unit: 'g' }, fat: { value: 0.1, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-11', description: 'Avocado, Raw', calories: { value: 160, unit: 'kcal' }, protein: { value: 2, unit: 'g' }, carbs: { value: 9, unit: 'g' }, fat: { value: 15, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-12', description: 'Oats, Rolled, Dry', calories: { value: 389, unit: 'kcal' }, protein: { value: 17, unit: 'g' }, carbs: { value: 66, unit: 'g' }, fat: { value: 7, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-13', description: 'Quinoa, Cooked', calories: { value: 120, unit: 'kcal' }, protein: { value: 4.4, unit: 'g' }, carbs: { value: 21, unit: 'g' }, fat: { value: 1.9, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-14', description: 'Spinach, Raw', calories: { value: 23, unit: 'kcal' }, protein: { value: 2.9, unit: 'g' }, carbs: { value: 3.6, unit: 'g' }, fat: { value: 0.4, unit: 'g' }, servingSize: 100 },
      { fdcId: 'local-15', description: 'Blueberries, Raw', calories: { value: 57, unit: 'kcal' }, protein: { value: 0.7, unit: 'g' }, carbs: { value: 14, unit: 'g' }, fat: { value: 0.3, unit: 'g' }, servingSize: 100 }
    ];
  }

  /**
   * Get popular foods
   */
  getPopularFoods() {
    return [
      'Chicken Breast',
      'Brown Rice',
      'Eggs',
      'Salmon',
      'Broccoli',
      'Sweet Potato',
      'Greek Yogurt',
      'Almonds',
      'Banana',
      'Apple',
      'Avocado',
      'Oats',
      'Quinoa',
      'Spinach',
      'Blueberries'
    ];
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Nutrition database cache cleared');
  }
}

const nutritionDatabaseService = new NutritionDatabaseService();
export default nutritionDatabaseService;
