const USDA_API_KEY = "DEMO_KEY";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";
class USDAService {
  /**
   * Search USDA FoodData Central database
   * @param {string} query - Search term
   * @param {number} pageSize - Number of results (default 20, max 200)
   * @returns {Promise<{success: boolean, foods: Array, error?: string}>}
   */
  async searchFoods(query, pageSize = 20) {
    if (!query || query.trim().length < 2) {
      return { success: false, error: "Query too short" };
    }
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        pageSize: Math.min(pageSize, 50),
        // Limit to 50 for performance
        dataType: "Branded,Foundation,SR Legacy",
        // Include branded, foundation, and legacy foods
        api_key: USDA_API_KEY
      });
      const response = await fetch(`${USDA_BASE_URL}/foods/search?${params}`);
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }
      const data = await response.json();
      if (!data.foods || data.foods.length === 0) {
        return { success: true, foods: [], totalResults: 0 };
      }
      const foods = data.foods.map((food) => this.transformUSDAFood(food));
      return {
        success: true,
        foods,
        totalResults: data.totalHits || data.foods.length,
        source: "USDA"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "USDA search failed",
        foods: []
      };
    }
  }
  /**
   * Get detailed food information by FDC ID
   * @param {number} fdcId - USDA Food Data Central ID
   * @returns {Promise<{success: boolean, food?: object, error?: string}>}
   */
  async getFoodDetails(fdcId) {
    try {
      const response = await fetch(`${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`);
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }
      const data = await response.json();
      const food = this.transformUSDAFood(data);
      return { success: true, food };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get food details"
      };
    }
  }
  /**
   * Transform USDA food format to our app format
   * @param {object} usdaFood - USDA food object
   * @returns {object} - Normalized food object
   */
  transformUSDAFood(usdaFood) {
    const nutrients = {};
    if (usdaFood.foodNutrients) {
      usdaFood.foodNutrients.forEach((nutrient) => {
        const name = nutrient.nutrientName?.toLowerCase() || "";
        const value = nutrient.value || 0;
        if (name.includes("energy") && name.includes("kcal")) {
          nutrients.calories = value;
        } else if (name.includes("protein")) {
          nutrients.protein = value;
        } else if (name.includes("carbohydrate")) {
          nutrients.carbohydrates = value;
          nutrients.carbs = value;
        } else if (name.includes("total lipid") || name.includes("fat, total")) {
          nutrients.fat = value;
          nutrients.fats = value;
        } else if (name.includes("fiber")) {
          nutrients.fiber = value;
        } else if (name.includes("sugars, total")) {
          nutrients.sugars = value;
        } else if (name.includes("sodium")) {
          nutrients.sodium = value;
        } else if (name.includes("cholesterol")) {
          nutrients.cholesterol = value;
        } else if (name.includes("saturated")) {
          nutrients.saturatedFat = value;
        }
      });
    }
    let servingSize = "100g";
    if (usdaFood.servingSize && usdaFood.servingSizeUnit) {
      servingSize = `${usdaFood.servingSize}${usdaFood.servingSizeUnit}`;
    } else if (usdaFood.householdServingFullText) {
      servingSize = usdaFood.householdServingFullText;
    }
    return {
      name: usdaFood.description || usdaFood.lowercaseDescription || "Unknown Food",
      brand: usdaFood.brandOwner || usdaFood.brandName || "USDA",
      calories: nutrients.calories || 0,
      protein: nutrients.protein || 0,
      carbs: nutrients.carbs || 0,
      carbohydrates: nutrients.carbohydrates || 0,
      fat: nutrients.fat || 0,
      fats: nutrients.fats || 0,
      fiber: nutrients.fiber || 0,
      sugars: nutrients.sugars || 0,
      sodium: nutrients.sodium || 0,
      saturatedFat: nutrients.saturatedFat || 0,
      cholesterol: nutrients.cholesterol || 0,
      servingSize,
      dataType: usdaFood.dataType || "USDA",
      fdcId: usdaFood.fdcId,
      source: "USDA FoodData Central",
      category: usdaFood.foodCategory || usdaFood.brandedFoodCategory || "",
      ingredients: usdaFood.ingredients || "",
      allNutrients: nutrients
    };
  }
  /**
   * Search by food category
   * @param {string} category - Food category (e.g., "Dairy", "Fruits", "Vegetables")
   * @returns {Promise<{success: boolean, foods: Array}>}
   */
  async searchByCategory(category) {
    return this.searchFoods(category, 30);
  }
  /**
   * Get nutrition facts for multiple foods (batch)
   * @param {Array<number>} fdcIds - Array of FDC IDs
   * @returns {Promise<{success: boolean, foods: Array}>}
   */
  async getBatchFoods(fdcIds) {
    if (!fdcIds || fdcIds.length === 0) {
      return { success: false, error: "No IDs provided" };
    }
    try {
      const response = await fetch(`${USDA_BASE_URL}/foods?api_key=${USDA_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fdcIds: fdcIds.slice(0, 20)
          // Limit to 20 foods per batch
        })
      });
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }
      const foods = await response.json();
      const transformed = foods.map((food) => this.transformUSDAFood(food));
      return { success: true, foods: transformed };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Batch request failed",
        foods: []
      };
    }
  }
}
const usdaService = new USDAService();
export {
  usdaService as default
};
