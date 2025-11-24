// Meal Automation Component - Smart Meal Planning & Delivery
import { useState, useEffect } from 'react';
import './MealAutomation.css';
import mealAutomationService from '../services/mealAutomationService';

export default function MealAutomation({ onClose }) {
  const [view, setView] = useState('today'); // today, plan, appliances
  const [mealPlan, setMealPlan] = useState(null);
  const [todaysMeals, setTodaysMeals] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [ordering, setOrdering] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTodaysMeals();
    loadAppliances();
  }, []);

  const loadTodaysMeals = async () => {
    const meals = await mealAutomationService.getTodaysMeals();
    setTodaysMeals(meals);
  };

  const loadAppliances = () => {
    setAppliances(mealAutomationService.connectedAppliances || []);
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const plan = await mealAutomationService.generateSmartMealPlan(7, {
        maxPrepTime: 30,
        avoidRepeats: true
      });
      setMealPlan(plan);
      loadTodaysMeals();
    } catch (error) {
      alert('Failed to generate meal plan: ' + error.message);
    }
    setGenerating(false);
  };

  const handleOrderGroceries = async () => {
    if (!mealPlan) {
      alert('Please generate a meal plan first!');
      return;
    }

    setOrdering(true);
    try {
      const result = await mealAutomationService.orderGroceries('instacart');
      alert(`✅ Groceries Ordered!\n\nOrder ID: ${result.orderId}\nTotal: $${result.estimatedTotal}\nDelivery: ${result.deliveryTime}\n\nYou'll receive a confirmation email shortly.`);
    } catch (error) {
      alert('Failed to order groceries: ' + error.message);
    }
    setOrdering(false);
  };

  const handleSendToAppliance = async (mealName, applianceType) => {
    try {
      const result = await mealAutomationService.sendToAppliance(mealName, applianceType);
      alert(`✅ Recipe Sent to ${applianceType}!\n\nSettings:\nTemp: ${result.temp}\nTime: ${result.time}\n\nYour ${applianceType} is ready to cook.`);
    } catch (error) {
      alert('Failed to send to appliance: ' + error.message);
    }
  };

  const handleConnectAppliance = async () => {
    const appliance = {
      type: 'air-fryer',
      brand: 'Generic',
      model: 'Smart AF-2000'
    };
    await mealAutomationService.connectAppliance(appliance);
    loadAppliances();
    alert('✅ Appliance Connected!');
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
            📋 7-Day Plan
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
            {Object.entries(todaysMeals).map(([type, meal]) => (
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
          </div>
        )}

        {/* Meal Plan View */}
        {view === 'plan' && (
          <div className="plan-view">
            {!mealPlan ? (
              <div className="generate-section">
                <div className="plan-icon">🤖</div>
                <h3>AI Meal Planning</h3>
                <p>Generate a personalized 7-day meal plan tailored to your allergens and preferences</p>
                <button 
                  className="generate-btn"
                  onClick={handleGeneratePlan}
                  disabled={generating}
                >
                  {generating ? '⏳ Generating...' : '✨ Generate 7-Day Plan'}
                </button>
              </div>
            ) : (
              <>
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
                  <button 
                    className="order-btn"
                    onClick={handleOrderGroceries}
                    disabled={ordering}
                  >
                    {ordering ? '⏳ Ordering...' : '🛒 Order All Groceries'}
                  </button>
                </div>

                <div className="days-list">
                  {mealPlan.days.slice(0, 3).map((day, idx) => (
                    <div key={idx} className="day-card">
                      <div className="day-header">Day {idx + 1}</div>
                      <div className="day-meals">
                        <div className="mini-meal">
                          <span className="mini-type">🌅 Breakfast</span>
                          <span className="mini-name">{day.breakfast.name}</span>
                        </div>
                        <div className="mini-meal">
                          <span className="mini-type">☀️ Lunch</span>
                          <span className="mini-name">{day.lunch.name}</span>
                        </div>
                        <div className="mini-meal">
                          <span className="mini-type">🌙 Dinner</span>
                          <span className="mini-name">{day.dinner.name}</span>
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

        {/* Features */}
        <div className="meals-features">
          <div className="feature-badge">
            <span className="feature-icon">🤖</span>
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
    </div>
  );
}
