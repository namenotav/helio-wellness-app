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
   * Search user's own recipes for food logging
   */
  async searchUserRecipes(userId, query) {
    try {
      const { db } = await import('../config/firebase');
      const { collection, query: fsQuery, where, getDocs } = await import('firebase/firestore');
      
      const recipesRef = collection(db, 'recipes', userId, 'userRecipes');
      const snapshot = await getDocs(recipesRef);
      
      const recipes = [];
      snapshot.forEach(doc => {
        recipes.push({ id: doc.id, ...doc.data() });
      });

      if (!query) return recipes;

      const lowerQuery = query.toLowerCase();
      return recipes.filter(recipe => 
        recipe.name?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to search user recipes:', error);
      return [];
    }
  }

  /**
   * Search community recipes (approved only)
   */
  async searchCommunityRecipes(query, userId = null) {
    try {
      const { db } = await import('../config/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      
      const recipesRef = collection(db, 'communityRecipes');
      const snapshot = await getDocs(recipesRef);
      
      const recipes = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Show approved recipes OR own pending recipes
        if (data.approved || data.author?.uid === userId) {
          recipes.push({ id: doc.id, ...data });
        }
      });

      if (!query) return recipes;

      const lowerQuery = query.toLowerCase();
      return recipes.filter(recipe => 
        recipe.name?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to search community recipes:', error);
      return [];
    }
  }

  /**
   * Convert recipe to food entry for logging
   */
  convertRecipeToFood(recipe) {
    return {
      name: recipe.name,
      calories: recipe.nutrition?.calories || recipe.calories || 0,
      protein: recipe.nutrition?.protein || recipe.protein || 0,
      carbs: recipe.nutrition?.carbs || recipe.carbs || 0,
      fat: recipe.nutrition?.fat || recipe.fats || 0,
      fiber: recipe.nutrition?.fiber || 0,
      sugar: recipe.nutrition?.sugar || 0,
      sodium: recipe.nutrition?.sodium || 0,
      serving_size: `1 of ${recipe.servings} servings`,
      servingSize: `1 of ${recipe.servings} servings`,
      source: 'Recipe',
      recipeId: recipe.id,
      isRecipe: true
    };
  }

  /**
   * Like/unlike a recipe
   */
  async toggleLike(recipeId, userId) {
    try {
      const { db } = await import('../config/firebase');
      const { doc, getDoc, updateDoc, increment } = await import('firebase/firestore');
      
      const recipeRef = doc(db, 'communityRecipes', recipeId);
      const recipeSnap = await getDoc(recipeRef);
      
      if (!recipeSnap.exists()) {
        throw new Error('Recipe not found');
      }

      const data = recipeSnap.data();
      const likedBy = data.likedBy || [];
      const isLiked = likedBy.includes(userId);

      if (isLiked) {
        // Unlike
        await updateDoc(recipeRef, {
          likes: increment(-1),
          likedBy: likedBy.filter(id => id !== userId)
        });
        return { liked: false, likes: (data.likes || 1) - 1 };
      } else {
        // Like
        await updateDoc(recipeRef, {
          likes: increment(1),
          likedBy: [...likedBy, userId]
        });
        return { liked: true, likes: (data.likes || 0) + 1 };
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to toggle like:', error);
      return { error: error.message };
    }
  }

  /**
   * Approve/reject recipe (admin only)
   */
  async moderateRecipe(recipeId, approved) {
    try {
      const { db } = await import('../config/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const recipeRef = doc(db, 'communityRecipes', recipeId);
      await updateDoc(recipeRef, {
        approved,
        moderatedAt: new Date().toISOString()
      });

      if(import.meta.env.DEV)console.log(`✅ Recipe ${approved ? 'approved' : 'rejected'}:`, recipeId);
      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to moderate recipe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save recipes to storage (Preferences + Firebase)
   */
  async saveRecipes(recipes) {
    try {
      // Save to Preferences (survives reinstall)
      await Preferences.set({
        key: this.storageKey,
        value: JSON.stringify(recipes)
      });
      
      // 🔥 FIX: Also sync to Firebase
      try {
        const firestoreService = (await import('./firestoreService.js')).default;
        const authService = (await import('./authService.js')).default;
        await firestoreService.save('saved_recipes', recipes, authService.getCurrentUser()?.uid);
        if(import.meta.env.DEV)console.log('☁️ Recipes synced to Firebase');
      } catch (e) {
        if(import.meta.env.DEV)console.warn('Could not sync recipes to Firebase (offline?)');
      }
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save recipes:', error);
      return false;
    }
  }
  
  /**
   * Load recipes from cloud on startup
   */
  async loadFromCloud() {
    try {
      const firestoreService = (await import('./firestoreService.js')).default;
      const authService = (await import('./authService.js')).default;
      const cloudRecipes = await firestoreService.get('saved_recipes', authService.getCurrentUser()?.uid);
      
      if (cloudRecipes && cloudRecipes.length > 0) {
        // Merge with local recipes (cloud takes priority)
        const { value } = await Preferences.get({ key: this.storageKey });
        const localRecipes = value ? JSON.parse(value) : [];
        
        // Create map of cloud recipes by ID
        const cloudMap = new Map(cloudRecipes.map(r => [r.id, r]));
        
        // Add local recipes that aren't in cloud
        for (const localRecipe of localRecipes) {
          if (!cloudMap.has(localRecipe.id)) {
            cloudRecipes.push(localRecipe);
          }
        }
        
        // Save merged recipes
        await Preferences.set({
          key: this.storageKey,
          value: JSON.stringify(cloudRecipes)
        });
        
        if(import.meta.env.DEV)console.log(`☁️ Loaded ${cloudRecipes.length} recipes from cloud`);
        return cloudRecipes;
      }
    } catch (e) {
      if(import.meta.env.DEV)console.warn('Could not load recipes from cloud:', e);
    }
    return null;
  }
}

// Export singleton instance
export const recipeService = new RecipeService();
export default recipeService;
