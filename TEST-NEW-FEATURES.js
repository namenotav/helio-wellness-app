/**
 * TEST FILE - How to Use All 4 New Features
 * Copy these examples into your components to use the new features
 */

// ===== TEST 1: OpenFoodFacts Food Search =====
import { barcodeScannerService } from './services/barcodeScannerService';

async function testFoodSearch() {
  console.log('🔍 Testing OpenFoodFacts search...');
  
  // Search for chicken breast
  const result = await barcodeScannerService.searchOpenFoodFactsByText('chicken breast', 1);
  
  if (result.success) {
    console.log(`✅ Found ${result.foods.length} foods`);
    console.log('First result:', result.foods[0]);
    // Expected output: { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, ... }
  } else {
    console.log('❌ Search failed:', result.message);
  }
}

// ===== TEST 2: Recipe Creator =====
import { recipeService } from './services/recipeService';

async function testRecipeCreator() {
  console.log('👨‍🍳 Testing recipe creator...');
  
  // Create a new recipe
  const result = await recipeService.createRecipe({
    name: 'Test Grilled Chicken',
    category: 'Lunch',
    prepTime: '10 minutes',
    cookTime: '15 minutes',
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      '200g chicken breast',
      '100g brown rice',
      '50g broccoli'
    ],
    instructions: [
      'Season chicken with salt and pepper',
      'Grill chicken for 15 minutes',
      'Cook rice according to package',
      'Steam broccoli for 5 minutes',
      'Serve together'
    ],
    tags: ['High-Protein', 'Meal-Prep']
  });
  
  if (result.success) {
    console.log('✅ Recipe created:', result.recipe.name);
    console.log('Nutrition (per serving):', {
      calories: result.recipe.calories,
      protein: result.recipe.protein,
      carbs: result.recipe.carbs,
      fats: result.recipe.fats
    });
  } else {
    console.log('❌ Recipe creation failed:', result.error);
  }
  
  // Get all recipes
  const allRecipes = await recipeService.getUserRecipes();
  console.log(`📚 Total recipes available: ${allRecipes.length}`);
  
  // Search recipes
  const chickenRecipes = await recipeService.searchRecipes('chicken');
  console.log(`🔍 Found ${chickenRecipes.length} chicken recipes`);
}

// ===== TEST 3: Restaurant Database =====
import { restaurantService } from './services/restaurantService';

function testRestaurantDatabase() {
  console.log('🍔 Testing restaurant database...');
  
  // Get all restaurants
  const allRestaurants = restaurantService.getAllRestaurants();
  console.log(`✅ ${allRestaurants.length} restaurants loaded:`, 
    allRestaurants.map(r => r.name).join(', ')
  );
  
  // Search for McDonald's
  const mcdonalds = restaurantService.searchRestaurants('mcdonalds');
  console.log(`🍔 Found ${mcdonalds.length} McDonald's`);
  
  // Search for burgers across all restaurants
  const burgers = restaurantService.searchMenuItems('burger');
  console.log(`🍔 Found ${burgers.length} burger items`);
  console.log('First burger:', burgers[0]);
  
  // Get low calorie options (under 400 cal)
  const lowCal = restaurantService.getLowCalorieOptions(400);
  console.log(`🥗 Found ${lowCal.length} items under 400 calories`);
  
  // Get high protein options (over 20g)
  const highProtein = restaurantService.getHighProteinOptions(20);
  console.log(`💪 Found ${highProtein.length} items with 20g+ protein`);
  
  // Get specific menu item
  const bigMac = restaurantService.getMenuItem('mcdonalds-uk', 'bigmac');
  console.log('🍔 Big Mac nutrition:', {
    name: bigMac.name,
    calories: bigMac.calories,
    protein: bigMac.protein,
    carbs: bigMac.carbs,
    fats: bigMac.fats
  });
}

// ===== TEST 4: Free Social Features =====
import { subscriptionService } from './services/subscriptionService';

function testFreeSocialFeatures() {
  console.log('👥 Testing free social features...');
  
  // Get current plan
  const currentPlan = subscriptionService.currentPlan;
  console.log('Current plan:', currentPlan);
  
  // Get plan features
  const plan = subscriptionService.getUserPlan();
  console.log('Social battles access:', plan.features.socialBattles);
  // Expected: 'basic' for free users, true for premium users
  
  // Check if user has social access
  const hasSocial = plan.features.socialBattles !== false;
  console.log('✅ Has social access:', hasSocial);
  
  // Check if user has premium social
  const hasPremiumSocial = plan.features.socialBattles === true;
  console.log('💎 Has premium social:', hasPremiumSocial);
  
  if (hasSocial && !hasPremiumSocial) {
    console.log('🆓 FREE TIER: Can add friends, see activity feed, create basic challenges');
    console.log('🔒 LOCKED: Battles with stakes, competitions, leaderboard prizes');
  }
}

// ===== RUN ALL TESTS =====
export async function runAllTests() {
  console.log('\n========================================');
  console.log('🚀 TESTING ALL 4 NEW FEATURES');
  console.log('========================================\n');
  
  try {
    // Test 1: Food Search
    await testFoodSearch();
    console.log('\n');
    
    // Test 2: Recipe Creator
    await testRecipeCreator();
    console.log('\n');
    
    // Test 3: Restaurant Database
    testRestaurantDatabase();
    console.log('\n');
    
    // Test 4: Free Social Features
    testFreeSocialFeatures();
    console.log('\n');
    
    console.log('========================================');
    console.log('✅ ALL TESTS COMPLETE');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// ===== INTEGRATION EXAMPLES =====

/**
 * EXAMPLE 1: Add food search to FoodScanner component
 */
export function FoodScannerIntegration() {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  
  const handleSearch = async () => {
    const result = await barcodeScannerService.searchOpenFoodFactsByText(searchQuery);
    if (result.success) {
      setFoods(result.foods);
    }
  };
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search foods..."
      />
      <button onClick={handleSearch}>Search</button>
      
      {foods.map(food => (
        <div key={food.barcode}>
          <h3>{food.name}</h3>
          <p>{food.calories} cal | {food.protein}g protein</p>
        </div>
      ))}
    </div>
  );
}

/**
 * EXAMPLE 2: Add recipe creator to Dashboard
 */
export function RecipeCreatorIntegration() {
  const [showBuilder, setShowBuilder] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowBuilder(true)}>
        ➕ Create Recipe
      </button>
      
      {showBuilder && (
        <RecipeBuilder 
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}

/**
 * EXAMPLE 3: Add restaurant search to food logging
 */
export function RestaurantIntegration() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  
  const handleSearch = () => {
    const results = restaurantService.searchMenuItems(query);
    setItems(results);
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search restaurant food..."
      />
      <button onClick={handleSearch}>Search</button>
      
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.restaurantLogo} {item.name}</h3>
          <p>{item.restaurantName}</p>
          <p>{item.calories} cal | {item.protein}g protein</p>
        </div>
      ))}
    </div>
  );
}

/**
 * EXAMPLE 4: Show social features based on plan
 */
export function SocialIntegration() {
  const plan = subscriptionService.getUserPlan();
  const hasSocial = plan.features.socialBattles !== false;
  const isPremium = plan.features.socialBattles === true;
  
  return (
    <div>
      {hasSocial && (
        <div>
          <h2>👥 Social Features</h2>
          <button>Add Friend</button>
          <button>View Activity Feed</button>
          
          {isPremium ? (
            <button>🎯 Create Battle (Premium)</button>
          ) : (
            <button disabled>
              🔒 Create Battle (Premium Only)
            </button>
          )}
        </div>
      )}
      
      {!hasSocial && (
        <div>
          <p>🔒 Upgrade to access social features</p>
        </div>
      )}
    </div>
  );
}

// Export for testing in browser console
if (typeof window !== 'undefined') {
  window.testNewFeatures = runAllTests;
  console.log('💡 Run tests in console: window.testNewFeatures()');
}
