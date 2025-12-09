// Recipe Management Service - Create, Read, Update, Delete recipes

import { Preferences } from '@capacitor/preferences';
import { barcodeScannerService } from './barcodeScannerService';

class RecipeService {
  constructor() {
    this.storageKey = 'wellness.userRecipes';
  }

  /**
   * Create a new recipe
   */
  async createRecipe(recipeData) {
    try {
      if(import.meta.env.DEV)console.log('📝 Creating new recipe:', recipeData.name);

      // Calculate nutrition from ingredients
      const nutrition = await this.calculateNutrition(recipeData.ingredients, recipeData.servings);

      const recipe = {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: recipeData.name || 'Untitled Recipe',
        category: recipeData.category || 'Custom',
        prepTime: recipeData.prepTime || '0 minutes',
        cookTime: recipeData.cookTime || '0 minutes',
        servings: recipeData.servings || 1,
        difficulty: recipeData.difficulty || 'Easy',
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        tags: recipeData.tags || ['Custom'],
        ...nutrition,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: true
      };

      // Save to storage
      const recipes = await this.getUserRecipes();
      recipes.push(recipe);
      await this.saveRecipes(recipes);

      if(import.meta.env.DEV)console.log('✅ Recipe created:', recipe.id);
      return { success: true, recipe };

    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to create recipe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all user recipes (built-in + custom)
   */
  async getUserRecipes() {
    try {
      const { value } = await Preferences.get({ key: this.storageKey });
      const customRecipes = value ? JSON.parse(value) : [];

      // Import built-in recipes
      const { recipeDatabase } = await import('../data/recipeDatabase.js');
      
      // Combine built-in + custom recipes
      return [...recipeDatabase, ...customRecipes];

    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to get recipes:', error);
      return [];
    }
  }

  /**
   * Get custom user recipes only
   */
  async getCustomRecipes() {
    try {
      const { value } = await Preferences.get({ key: this.storageKey });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to get custom recipes:', error);
      return [];
    }
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(recipeId) {
    try {
      const recipes = await this.getUserRecipes();
      return recipes.find(r => r.id === recipeId);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to get recipe:', error);
      return null;
    }
  }

  /**
   * Update existing recipe
   */
  async updateRecipe(recipeId, updates) {
    try {
      if(import.meta.env.DEV)console.log('📝 Updating recipe:', recipeId);

      const customRecipes = await this.getCustomRecipes();
      const recipeIndex = customRecipes.findIndex(r => r.id === recipeId);

      if (recipeIndex === -1) {
        throw new Error('Recipe not found or cannot edit built-in recipes');
      }

      // Recalculate nutrition if ingredients or servings changed
      if (updates.ingredients || updates.servings) {
        const ingredients = updates.ingredients || customRecipes[recipeIndex].ingredients;
        const servings = updates.servings || customRecipes[recipeIndex].servings;
        const nutrition = await this.calculateNutrition(ingredients, servings);
        updates = { ...updates, ...nutrition };
      }

      customRecipes[recipeIndex] = {
        ...customRecipes[recipeIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveRecipes(customRecipes);

      if(import.meta.env.DEV)console.log('✅ Recipe updated');
      return { success: true, recipe: customRecipes[recipeIndex] };

    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to update recipe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete recipe
   */
  async deleteRecipe(recipeId) {
    try {
      if(import.meta.env.DEV)console.log('🗑️ Deleting recipe:', recipeId);

      const customRecipes = await this.getCustomRecipes();
      const filteredRecipes = customRecipes.filter(r => r.id !== recipeId);

      if (filteredRecipes.length === customRecipes.length) {
        throw new Error('Recipe not found or cannot delete built-in recipes');
      }

      await this.saveRecipes(filteredRecipes);

      if(import.meta.env.DEV)console.log('✅ Recipe deleted');
      return { success: true };

    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to delete recipe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate nutrition from ingredients
   */
  async calculateNutrition(ingredients, servings = 1) {
    try {
      if(import.meta.env.DEV)console.log('🧮 Calculating nutrition for', ingredients.length, 'ingredients');

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      for (const ingredient of ingredients) {
        // Parse ingredient string: "100g chicken breast" or "1 cup rice"
        const nutritionData = await this.lookupIngredientNutrition(ingredient);
        
        if (nutritionData) {
          totalCalories += nutritionData.calories || 0;
          totalProtein += nutritionData.protein || 0;
          totalCarbs += nutritionData.carbs || 0;
          totalFats += nutritionData.fats || 0;
        }
      }

      // Divide by servings to get per-serving nutrition
      return {
        calories: Math.round(totalCalories / servings),
        protein: Math.round((totalProtein / servings) * 10) / 10,
        carbs: Math.round((totalCarbs / servings) * 10) / 10,
        fats: Math.round((totalFats / servings) * 10) / 10
      };

    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to calculate nutrition:', error);
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
  }

  /**
   * Lookup ingredient nutrition from food databases
   */
  async lookupIngredientNutrition(ingredientString) {
    try {
      // Parse quantity and unit from ingredient
      // Examples: "100g chicken breast", "1 cup rice", "2 tbsp olive oil"
      const match = ingredientString.match(/^(\d+\.?\d*)\s*(g|ml|kg|cup|tbsp|tsp|oz)?\s*(.+)$/i);
      
      if (!match) {
        // If can't parse, try searching as-is
        return await this.searchIngredient(ingredientString, 100, 'g');
      }

      const quantity = parseFloat(match[1]);
      const unit = match[2] || 'g';
      const foodName = match[3].trim();

      // Search food databases
      return await this.searchIngredient(foodName, quantity, unit);

    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to lookup ingredient:', error);
      return null;
    }
  }

  /**
   * Search ingredient in food databases
   */
  async searchIngredient(foodName, quantity, unit) {
    try {
      // Try OpenFoodFacts first
      const result = await barcodeScannerService.searchOpenFoodFactsByText(foodName, 1);
      
      if (result.success && result.foods.length > 0) {
        const food = result.foods[0]; // Take first match
        
        // Convert quantity to 100g base (OpenFoodFacts uses per 100g)
        const multiplier = this.convertToGrams(quantity, unit) / 100;

        return {
          calories: Math.round((food.calories || 0) * multiplier),
          protein: Math.round((food.protein || 0) * multiplier * 10) / 10,
          carbs: Math.round((food.carbs || 0) * multiplier * 10) / 10,
          fats: Math.round((food.fat || 0) * multiplier * 10) / 10
        };
      }

      // Fallback to USDA
      const usdaResult = await barcodeScannerService.searchFoodsByText(foodName);
      if (usdaResult.success && usdaResult.foods.length > 0) {
        const food = usdaResult.foods[0];
        const multiplier = this.convertToGrams(quantity, unit) / 100;

        return {
          calories: Math.round((food.calories || 0) * multiplier),
          protein: Math.round((food.protein || 0) * multiplier * 10) / 10,
          carbs: Math.round((food.carbs || 0) * multiplier * 10) / 10,
          fats: Math.round((food.fat || 0) * multiplier * 10) / 10
        };
      }

      return null;

    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to search ingredient:', error);
      return null;
    }
  }

  /**
   * Convert various units to grams
   */
  convertToGrams(quantity, unit) {
    const conversions = {
      'g': 1,
      'kg': 1000,
      'mg': 0.001,
      'ml': 1, // Approximate for water-based liquids
      'cup': 240, // 1 cup ≈ 240ml/g
      'tbsp': 15, // 1 tablespoon ≈ 15ml/g
      'tsp': 5,   // 1 teaspoon ≈ 5ml/g
      'oz': 28.35 // 1 ounce ≈ 28.35g
    };

    return quantity * (conversions[unit.toLowerCase()] || 1);
  }

  /**
   * Search recipes by name or ingredient
   */
  async searchRecipes(query) {
    try {
      const recipes = await this.getUserRecipes();
      const lowerQuery = query.toLowerCase();

      return recipes.filter(recipe => {
        const nameMatch = recipe.name.toLowerCase().includes(lowerQuery);
        const ingredientMatch = recipe.ingredients.some(ing => 
          ing.toLowerCase().includes(lowerQuery)
        );
        const tagMatch = recipe.tags?.some(tag => 
          tag.toLowerCase().includes(lowerQuery)
        );

        return nameMatch || ingredientMatch || tagMatch;
      });

    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to search recipes:', error);
      return [];
    }
  }

  /**
   * Save recipes to storage
   */
  async saveRecipes(recipes) {
    try {
      await Preferences.set({
        key: this.storageKey,
        value: JSON.stringify(recipes)
      });
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save recipes:', error);
      return false;
    }
  }
}

// Export singleton instance
export const recipeService = new RecipeService();
export default recipeService;
