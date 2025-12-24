// Meal Automation Component - Smart Meal Planning & Delivery (PRO)
import { useState, useEffect } from 'react';
import './MealAutomation.css';
import mealAutomationService from '../services/mealAutomationService';
import subscriptionService from '../services/subscriptionService';
import PaywallModal from './PaywallModal';
import { showToast } from './Toast';

export default function MealAutomation({ onClose }) {
  const [view, setView] = useState('today'); // today, plan, appliances, recipes, grocery, mealprep
  const [mealPlan, setMealPlan] = useState(null);
  const [todaysMeals, setTodaysMeals] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [ordering, setOrdering] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showIngredientsInput, setShowIngredientsInput] = useState(false);
  const [userIngredients, setUserIngredients] = useState('');
  const [recipeLibrary, setRecipeLibrary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [groceryList, setGroceryList] = useState({});
  const [mealPrepGuide, setMealPrepGuide] = useState(null);
  const [macroTargets, setMacroTargets] = useState({ protein: 150, carbs: 200, fat: 60 });
  const [macroMeals, setMacroMeals] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [planExpiration, setPlanExpiration] = useState(null);
  const [todayOverride, setTodayOverride] = useState(null);
  const [generatingOverride, setGeneratingOverride] = useState(false);
  const [showOverrideIngredients, setShowOverrideIngredients] = useState(false);
  const [overrideIngredients, setOverrideIngredients] = useState('');

  useEffect(() => {
    // Check Premium+ access before loading
    if (!subscriptionService.hasAccess('mealAutomation')) {
      setShowPaywall(true);
      return;
    }

    // Load meal data from storage on mount
    const loadMealData = async () => {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value: plansValue } = await Preferences.get({ key: 'meal_plans' });
        const { value: prefsValue } = await Preferences.get({ key: 'meal_preferences' });
        const localPlans = localStorage.getItem('meal_plans');
        const localPrefs = localStorage.getItem('meal_preferences');
        
        if (plansValue) {
          if(import.meta.env.DEV)console.log('📊 Loaded meal plans from Preferences');
        } else if (localPlans) {
          if(import.meta.env.DEV)console.log('📊 Loaded meal plans from localStorage');
        }
        
        if (prefsValue) {
          if(import.meta.env.DEV)console.log('📊 Loaded meal preferences from Preferences');
        } else if (localPrefs) {
          if(import.meta.env.DEV)console.log('📊 Loaded meal preferences from localStorage');
        }
      } catch (error) {
        console.error('Failed to load meal data:', error);
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
      const now = new Date();
      const daysDiff = Math.floor((now - generatedDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = 7 - daysDiff;
      
      setPlanExpiration({
        generatedDate: saved.generatedDate,
        daysOld: daysDiff,
        daysRemaining: daysRemaining,
        isExpiringSoon: daysRemaining <= 2
      });
      
      if(import.meta.env.DEV)console.log(`📋 Loaded saved meal plan - Day ${daysDiff + 1}/7 (${daysRemaining} days remaining)`);
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
    const recipes = mealAutomationService.getRecipeLibrary('all');
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

  const loadMacroMeals = () => {
    const meals = mealAutomationService.getMacroOptimizedMeals(macroTargets);
    setMacroMeals(meals);
  };

  const handleGeneratePlan = async (useIngredients = false) => {
    setGenerating(true);
    try {
      const plan = await mealAutomationService.generateSmartMealPlan(7, {
        maxTime: 30,
        budget: 'moderate',
        skill: 'beginner',
        useOwnIngredients: useIngredients,
        availableIngredients: useIngredients ? userIngredients : null
      });
      
      if(import.meta.env.DEV)console.log('✅ Meal plan received:', plan);
      setMealPlan(plan);
      loadTodaysMeals();
      setShowIngredientsInput(false);
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Generate error:', error);
      showToast('Failed to generate meal plan: ' + error.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefreshPlan = async () => {
    if (confirm('🔄 Generate a fresh meal plan?\n\nThis will replace your current plan with new meal suggestions.')) {
      await handleGeneratePlan();
    }
  };

  const handleCancelPlan = async () => {
    if (confirm('🗑️ Cancel 7-Day Plan?\n\nThis will delete your entire weekly meal plan. You can generate a new one anytime.')) {
      setGenerating(true);
      try {
        await mealAutomationService.clearMealPlan();
        setMealPlan(null);
        setTodaysMeals(null);
        setPlanExpiration(null);
        showToast('Meal plan cancelled', 'success');
      } catch (error) {
        showToast('Failed to cancel plan', 'error');
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
      setOverrideIngredients('');
      showToast('✨ Today\'s meals changed!', 'success');
    } catch (error) {
      showToast('Failed to change meals: ' + error.message, 'error');
    } finally {
      setGeneratingOverride(false);
    }
  };

  const handleClearTodayOverride = async () => {
    await mealAutomationService.clearTodayOverride();
    setTodayOverride(null);
    loadTodaysMeals();
    showToast('Restored to weekly plan', 'success');
  };

  const handleGenerateFromIngredients = () => {
    setShowIngredientsInput(true);
  };

  const handleSubmitIngredients = () => {
    if (!userIngredients.trim()) {
      showToast('Please enter the ingredients you have available!', 'warning');
      return;
    }
    handleGeneratePlan(true);
  };

  const handleOrderGroceries = async () => {
    if (!mealPlan) {
      showToast('Please generate a meal plan first!', 'warning');
      return;
    }

    // Coming Soon Alert
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
    // Coming Soon Alert
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
    // Coming Soon Alert
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

  return (
    <div className="meals-overlay">
      <div className="meals-modal">
        <button className="meals-close" onClick={onClose}>✕</button>

        <h2 className="meals-title">🍽️ Meal Automation</h2>

        {/* View Navigation */}
        <div className="meals-nav">
          <button 
            className={`nav-btn ${view === 'today' ? 'active' : ''}`}
            onClick={() => setView('today')}
          >
            📅 Today
          </button>
          <button 
            className={`nav-btn ${view === 'plan' ? 'active' : ''}`}
            onClick={() => setView('plan')}
          >
            📋 Plan
          </button>
          <button 
            className={`nav-btn ${view === 'recipes' ? 'active' : ''}`}
            onClick={() => { setView('recipes'); loadRecipeLibrary(); }}
          >
            📖 Recipes
          </button>
          <button 
            className={`nav-btn ${view === 'grocery' ? 'active' : ''}`}
            onClick={() => { setView('grocery'); loadGroceryList(); }}
          >
            🛒 Grocery
          </button>
          <button 
            className={`nav-btn ${view === 'mealprep' ? 'active' : ''}`}
            onClick={() => setView('mealprep')}
          >
            🔪 Prep
          </button>
          <button 
            className={`nav-btn ${view === 'appliances' ? 'active' : ''}`}
            onClick={() => setView('appliances')}
          >
            🔌 Appliances
          </button>
        </div>

        {/* Today's Meals View */}
        {view === 'today' && todaysMeals && (
          <div className="today-view">
            {todaysMeals.dayNumber && (
              <div className="today-day-badge">
                📅 Day {todaysMeals.dayNumber}/7 {todaysMeals.dayName && `• ${todaysMeals.dayName}`}
                {todaysMeals.daysRemaining !== undefined && (
                  <span className="remaining"> • {todaysMeals.daysRemaining} day{todaysMeals.daysRemaining !== 1 ? 's' : ''} left</span>
                )}
              </div>
            )}

            {/* Override Active Badge */}
            {todayOverride && (
              <div className="override-active-badge">
                ⚡ Using custom meals for today
                <button className="restore-btn" onClick={handleClearTodayOverride}>
                  ↩️ Back to Plan
                </button>
              </div>
            )}

            {/* Display override meals if active, otherwise weekly plan meals */}
            {Object.entries(todayOverride || todaysMeals)
              .filter(([type]) => !['date', 'dayNumber', 'daysRemaining', 'dayName'].includes(type))
              .map(([type, meal]) => (
              meal && (
                <div key={type} className="meal-card">
                  <div className="meal-type">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                  <div className="meal-name">{meal.name}</div>
                  <div className="meal-time">
                    ⏱️ {meal.prepTime} • 🔥 {meal.calories} cal
                  </div>
                  {meal.smartAppliance && (
                    <button 
                      className="cook-btn"
                      onClick={() => handleSendToAppliance(meal.name, meal.smartAppliance)}
                    >
                      👨‍🍳 Send to {meal.smartAppliance.replace(/-/g, ' ')}
                    </button>
                  )}
                </div>
              )
            ))}

            {(!todaysMeals || Object.values(todaysMeals).every(m => !m)) && (
              <div className="no-meals">
                <p>📋 No meal plan for today</p>
                <p className="help-text">Generate a 7-day plan to get started</p>
              </div>
            )}

            {/* Quick Override Actions */}
            {todaysMeals && mealPlan && !todayOverride && (
              <div className="today-override-actions">
                {!showOverrideIngredients ? (
                  <>
                    <button 
                      className="override-btn"
                      onClick={() => handleChangeTodaysMeals(false)}
                      disabled={generatingOverride}
                    >
                      {generatingOverride ? '⏳ Generating...' : '🔄 Change Today\'s Meals'}
                    </button>
                    <button 
                      className="override-ingredients-btn"
                      onClick={() => setShowOverrideIngredients(true)}
                      disabled={generatingOverride}
                    >
                      🥕 Cook From My Ingredients
                    </button>
                  </>
                ) : (
                  <div className="override-ingredients-input">
                    <label>What's in your kitchen today?</label>
                    <textarea
                      placeholder="Example: chicken, eggs, rice, tomatoes, onions..."
                      value={overrideIngredients}
                      onChange={(e) => setOverrideIngredients(e.target.value)}
                      rows={4}
                    />
                    <div className="override-buttons">
                      <button 
                        className="submit-override-btn"
                        onClick={() => handleChangeTodaysMeals(true)}
                        disabled={generatingOverride || !overrideIngredients.trim()}
                      >
                        {generatingOverride ? '⏳ Creating...' : '🍳 Cook Today'}
                      </button>
                      <button 
                        className="cancel-override-btn"
                        onClick={() => {
                          setShowOverrideIngredients(false);
                          setOverrideIngredients('');
                        }}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Meal Plan View */}
        {view === 'plan' && (
          <div className="plan-view">
            {!mealPlan ? (
              <div className="generate-section">
                <div className="plan-icon">✨🍽️✨</div>
                <h3>AI Meal Planning</h3>
                <p>Generate a personalized 7-day meal plan tailored to your allergens and preferences</p>
                
                {!showIngredientsInput ? (
                  <>
                    <button 
                      className="generate-btn"
                      onClick={() => handleGeneratePlan(false)}
                      disabled={generating}
                    >
                      {generating ? '⏳ Generating...' : '✨ Generate 7-Day Plan'}
                    </button>
                    
                    <button 
                      className="ingredients-btn"
                      onClick={handleGenerateFromIngredients}
                      disabled={generating}
                    >
                      🥕 Use My Ingredients
                    </button>
                    
                    <p className="help-text-small">Or generate meals from what you already have!</p>
                  </>
                ) : (
                  <div className="ingredients-input-section">
                    <label>What's in your kitchen?</label>
                    <textarea
                      className="ingredients-textarea"
                      placeholder="Example: chicken breasts, eggs, milk, rice, tomatoes, onions, garlic, pasta, cheese, broccoli..."
                      value={userIngredients}
                      onChange={(e) => setUserIngredients(e.target.value)}
                      rows={6}
                    />
                    <div className="ingredients-buttons">
                      <button 
                        className="submit-ingredients-btn"
                        onClick={handleSubmitIngredients}
                        disabled={generating}
                      >
                        {generating ? '⏳ Creating...' : '🍳 Create'}
                      </button>
                      <button 
                        className="cancel-ingredients-btn"
                        onClick={() => setShowIngredientsInput(false)}
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Plan Expiration Badge */}
                {planExpiration && (
                  <div className="plan-header-row">
                    <div className={`plan-expiration-badge ${planExpiration.isExpiringSoon ? 'warning' : ''}`}>
                      📅 Day {planExpiration.daysOld + 1}/7
                      {planExpiration.daysRemaining > 0 && (
                        <span className="expiry-info">
                          {planExpiration.isExpiringSoon 
                            ? ` • ⚠️ Expires in ${planExpiration.daysRemaining} day${planExpiration.daysRemaining > 1 ? 's' : ''}`
                            : ` • ${planExpiration.daysRemaining} day${planExpiration.daysRemaining > 1 ? 's' : ''} remaining`
                          }
                        </span>
                      )}
                    </div>
                    <button 
                      className="cancel-plan-btn"
                      onClick={handleCancelPlan}
                      disabled={generating}
                    >
                      🗑️ Cancel Plan
                    </button>
                  </div>
                )}
                
                <div className="plan-summary">
                  <h3>Weekly Meal Plan</h3>
                  <div className="summary-stats">
                    <div className="summary-item">
                      <span className="summary-icon">🍽️</span>
                      <span>{mealPlan.days.length * 3} Meals</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-icon">🛒</span>
                      <span>{mealPlan.weeklyShoppingList.length} Items</span>
                    </div>
                  </div>
                  
                  <div className="plan-actions">
                    <button 
                      className="order-btn"
                      onClick={handleOrderGroceries}
                      disabled={ordering}
                    >
                      {ordering ? '⏳ Ordering...' : '🛒 Order All Groceries'}
                    </button>
                    
                    <button 
                      className="refresh-btn"
                      onClick={handleRefreshPlan}
                      disabled={generating}
                    >
                      {generating ? '⏳ Refreshing...' : '🔄 Refresh Plan'}
                    </button>
                  </div>
                </div>

                <div className="days-list">
                  {mealPlan.days.map((day, idx) => (
                    <div key={idx} className="day-card">
                      <div className="day-header">{day.dayName || `Day ${idx + 1}`}</div>
                      <div className="day-meals">
                        <div className="mini-meal">
                          <span className="mini-type">🌅 Breakfast</span>
                          <span className="mini-name">{day.breakfast.name}</span>
                          <span className="mini-calories">🔥 {day.breakfast.calories} cal</span>
                        </div>
                        <div className="mini-meal">
                          <span className="mini-type">☀️ Lunch</span>
                          <span className="mini-name">{day.lunch.name}</span>
                          <span className="mini-calories">🔥 {day.lunch.calories} cal</span>
                        </div>
                        <div className="mini-meal">
                          <span className="mini-type">🌙 Dinner</span>
                          <span className="mini-name">{day.dinner.name}</span>
                          <span className="mini-calories">🔥 {day.dinner.calories} cal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Appliances View */}
        {view === 'appliances' && (
          <div className="appliances-view">
            <h3>Connected Appliances</h3>
            
            {appliances.length === 0 ? (
              <div className="no-appliances">
                <p>🔌 No appliances connected</p>
                <button className="connect-btn" onClick={handleConnectAppliance}>
                  ➕ Connect Appliance
                </button>
              </div>
            ) : (
              <div className="appliances-list">
                {appliances.map((appliance, idx) => (
                  <div key={idx} className="appliance-card">
                    <div className="appliance-icon">
                      {appliance.type === 'air-fryer' && '🍟'}
                      {appliance.type === 'instant-pot' && '🍲'}
                      {appliance.type === 'smart-oven' && '🔥'}
                      {appliance.type === 'slow-cooker' && '🥘'}
                    </div>
                    <div className="appliance-info">
                      <div className="appliance-name">{appliance.type.replace(/-/g, ' ')}</div>
                      <div className="appliance-model">{appliance.brand} {appliance.model}</div>
                    </div>
                    <div className="appliance-status">
                      <span className="status-dot connected"></span>
                      Connected
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="supported-appliances">
              <h4>Supported Appliances:</h4>
              <div className="supported-grid">
                <div className="supported-item">🍟 Air Fryers</div>
                <div className="supported-item">🍲 Instant Pots</div>
                <div className="supported-item">🔥 Smart Ovens</div>
                <div className="supported-item">🥘 Slow Cookers</div>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Library View (PRO) */}
        {view === 'recipes' && (
          <div className="recipes-view">
            <div className="category-filter">
              <button className={selectedCategory === 'all' ? 'active' : ''} onClick={() => handleCategoryChange('all')}>All</button>
              <button className={selectedCategory === 'breakfast' ? 'active' : ''} onClick={() => handleCategoryChange('breakfast')}>Breakfast</button>
              <button className={selectedCategory === 'lunch' ? 'active' : ''} onClick={() => handleCategoryChange('lunch')}>Lunch</button>
              <button className={selectedCategory === 'dinner' ? 'active' : ''} onClick={() => handleCategoryChange('dinner')}>Dinner</button>
            </div>

            <div className="recipes-grid">
              {recipeLibrary.map((recipe) => (
                <div key={recipe.id} className="recipe-card-pro">
                  <div className="recipe-header-pro">
                    <div className="recipe-name-pro">{recipe.name}</div>
                    <div className="recipe-rating">⭐ {recipe.rating}</div>
                  </div>
                  <div className="recipe-stats">
                    <div className="recipe-stat">
                      <span className="stat-icon">⏱️</span>
                      <span>{recipe.time}</span>
                    </div>
                    <div className="recipe-stat">
                      <span className="stat-icon">🔥</span>
                      <span>{recipe.calories} cal</span>
                    </div>
                    <div className="recipe-stat">
                      <span className="stat-icon">👥</span>
                      <span>{recipe.servings}</span>
                    </div>
                  </div>
                  <div className="recipe-macros">
                    <div className="macro-mini">P: {recipe.protein}g</div>
                    <div className="macro-mini">C: {recipe.carbs}g</div>
                    <div className="macro-mini">F: {recipe.fat}g</div>
                  </div>
                  <div className="recipe-difficulty">{recipe.difficulty}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grocery List View (PRO) */}
        {view === 'grocery' && (
          <div className="grocery-view">
            <div className="grocery-header">
              <h3>📋 Shopping List</h3>
              <button className="export-grocery-btn" onClick={() => alert('Grocery list exported!')}>
                📤 Export
              </button>
            </div>

            {Object.keys(groceryList).length === 0 ? (
              <div className="empty-grocery">
                <p>Generate a meal plan first to see your grocery list!</p>
              </div>
            ) : (
              <div className="grocery-categories">
                {Object.entries(groceryList).map(([category, items]) => (
                  items.length > 0 && (
                    <div key={category} className="grocery-category">
                      <div className="category-header">{category}</div>
                      <div className="grocery-items-list">
                        {items.map((item, idx) => (
                          <div key={idx} className="grocery-item-pro">
                            <input type="checkbox" className="grocery-checkbox" />
                            <div className="item-details">
                              <span className="item-name">{item.name}</span>
                              <span className="item-amount">{item.amount} {item.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meal Prep View (PRO) */}
        {view === 'mealprep' && mealPrepGuide && (
          <div className="mealprep-view">
            <h3>🔪 Meal Prep Guide</h3>
            <div className="prep-time-estimate">
              Total Time: <strong>{mealPrepGuide.totalPrepTime}</strong>
            </div>

            <div className="prep-instructions">
              <h4>📝 Batch Cooking Steps</h4>
              {mealPrepGuide.instructions.map((instruction) => (
                <div key={instruction.step} className="prep-step">
                  <div className="step-number">Step {instruction.step}</div>
                  <div className="step-content">
                    <div className="step-task">{instruction.task}</div>
                    <div className="step-time">⏱️ {instruction.time}</div>
                    <div className="step-tip">💡 {instruction.tip}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="storage-tips">
              <h4>📦 Storage Tips</h4>
              <ul>
                {mealPrepGuide.storageTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="equipment-list">
              <h4>🔧 Equipment Needed</h4>
              <div className="equipment-grid">
                {mealPrepGuide.equipment.map((item, idx) => (
                  <div key={idx} className="equipment-item">{item}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="meals-features">
          <div className="feature-badge">
            <span className="feature-icon">🍽️</span>
            <span className="feature-text">AI-Generated Plans</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">🛒</span>
            <span className="feature-text">Auto Grocery Delivery</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">👨‍🍳</span>
            <span className="feature-text">Smart Appliance Control</span>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={onClose}
          featureName="Meal Automation"
          message={subscriptionService.getUpgradeMessage('mealAutomation')}
          currentPlan={subscriptionService.getCurrentPlan()}
        />
      )}
    </div>
  );
}



