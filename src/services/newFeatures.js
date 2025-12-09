/**
 * NEW FEATURES INTEGRATION FILE
 * 
 * Quick access to all 4 new competitive features:
 * 1. OpenFoodFacts text search (6M+ foods)
 * 2. Recipe Creator with nutrition calculator
 * 3. Restaurant database (10 UK chains, 200+ items)
 * 4. Free social features (friend connections unlocked)
 */

// ===== FEATURE 1: OpenFoodFacts Text Search =====
import { barcodeScannerService } from './barcodeScannerService';

/**
 * Search 6M+ foods from OpenFoodFacts
 * Usage: await searchFoods('chicken breast')
 */
export async function searchFoods(query, page = 1) {
  return await barcodeScannerService.searchOpenFoodFactsByText(query, page);
}


// ===== FEATURE 2: Recipe Creator =====
import { recipeService } from './recipeService';
export { RecipeBuilder } from '../components/RecipeBuilder';

/**
 * Create custom recipe with auto-calculated nutrition
 * Usage: await createRecipe({ name: 'My Recipe', ingredients: ['100g chicken'], servings: 2 })
 */
export async function createRecipe(recipeData) {
  return await recipeService.createRecipe(recipeData);
}

/**
 * Get all recipes (built-in + custom)
 */
export async function getAllRecipes() {
  return await recipeService.getUserRecipes();
}

/**
 * Search recipes by name or ingredient
 */
export async function searchRecipes(query) {
  return await recipeService.searchRecipes(query);
}


// ===== FEATURE 3: Restaurant Database =====
import { restaurantService } from './restaurantService';

/**
 * Search 10 UK restaurant chains (McDonald's, KFC, Subway, Greggs, Nando's, Pizza Hut, Burger King, Costa, Pret, Wagamama)
 * 200+ menu items with full nutrition
 * Usage: searchRestaurants('mcdonalds')
 */
export function searchRestaurants(query) {
  return restaurantService.searchRestaurants(query);
}

/**
 * Search menu items across all restaurants
 * Usage: searchMenuItems('burger')
 */
export function searchMenuItems(query, restaurantId = null) {
  return restaurantService.searchMenuItems(query, restaurantId);
}

/**
 * Get low calorie options
 * Usage: getLowCalorieOptions(400) // Max 400 calories
 */
export function getLowCalorieOptions(maxCalories = 400) {
  return restaurantService.getLowCalorieOptions(maxCalories);
}

/**
 * Get high protein options
 * Usage: getHighProteinOptions(20) // Min 20g protein
 */
export function getHighProteinOptions(minProtein = 20) {
  return restaurantService.getHighProteinOptions(minProtein);
}


// ===== FEATURE 4: Free Social Features =====
import { subscriptionService } from './subscriptionService';

/**
 * Check if social features are available
 * Free tier now has 'basic' social access (friend connections, basic challenges)
 * Premium has full access (battles with stakes, competitions)
 */
export function hasSocialAccess() {
  const plan = subscriptionService.getUserPlan();
  return plan.features.socialBattles !== false; // 'basic' or true = has access
}

/**
 * Check if premium social features are available
 */
export function hasPremiumSocial() {
  const plan = subscriptionService.getUserPlan();
  return plan.features.socialBattles === true; // Only premium = true
}


// ===== QUICK USAGE EXAMPLES =====

/**
 * EXAMPLE 1: Search foods
 * 
 * const result = await searchFoods('chicken breast');
 * if (result.success) {
 *   result.foods.forEach(food => {
 *     console.log(food.name, food.calories, food.protein);
 *   });
 * }
 */

/**
 * EXAMPLE 2: Create recipe
 * 
 * const recipe = await createRecipe({
 *   name: 'Grilled Chicken Salad',
 *   ingredients: ['200g chicken breast', '100g lettuce', '50g tomatoes'],
 *   instructions: ['Grill chicken', 'Chop vegetables', 'Mix together'],
 *   servings: 2
 * });
 * // Nutrition is auto-calculated!
 */

/**
 * EXAMPLE 3: Search restaurants
 * 
 * const mcdonalds = searchRestaurants('mcdonalds');
 * const burgers = searchMenuItems('burger');
 * const healthyOptions = getLowCalorieOptions(400);
 */

/**
 * EXAMPLE 4: Check social access
 * 
 * if (hasSocialAccess()) {
 *   // Show social features (even on free plan!)
 * }
 * 
 * if (hasPremiumSocial()) {
 *   // Show premium battles with stakes
 * }
 */

export default {
  // Food Search
  searchFoods,
  
  // Recipes
  createRecipe,
  getAllRecipes,
  searchRecipes,
  
  // Restaurants
  searchRestaurants,
  searchMenuItems,
  getLowCalorieOptions,
  getHighProteinOptions,
  
  // Social
  hasSocialAccess,
  hasPremiumSocial
};
