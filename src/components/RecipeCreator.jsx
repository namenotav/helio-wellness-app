// Recipe Creator Component - User-Submitted Recipes
import { useState } from 'react';
import './RecipeCreator.css';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';
import { showToast } from './Toast';

export default function RecipeCreator({ onClose }) {
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState(1);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isHalal, setIsHalal] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage',
    'Appetizer', 'Salad', 'Soup', 'Main Course', 'Side Dish', 'Other'
  ];

  const cuisines = [
    'American', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian',
    'Thai', 'Greek', 'French', 'Mediterranean', 'Korean', 'Vietnamese',
    'Middle Eastern', 'Caribbean', 'Spanish', 'German', 'British', 'Other'
  ];

  const units = [
    'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'piece', 'slice', 'clove', 'pinch', 'dash', 'to taste'
  ];

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleSave = async () => {
    // Validation
    if (!recipeName.trim()) {
      showToast('❌ Please enter a recipe name', 'error');
      return;
    }

    if (ingredients.filter(i => i.name.trim()).length === 0) {
      showToast('❌ Please add at least one ingredient', 'error');
      return;
    }

    if (!instructions.trim()) {
      showToast('❌ Please enter cooking instructions', 'error');
      return;
    }

    setSaving(true);

    try {
      const user = authService.getCurrentUser();
      
      if (!user) {
        showToast('❌ Please log in to save recipes', 'error');
        setSaving(false);
        return;
      }

      const recipeData = {
        name: recipeName.trim(),
        servings: parseInt(servings) || 1,
        prepTime: prepTime.trim(),
        cookTime: cookTime.trim(),
        ingredients: ingredients.filter(i => i.name.trim()),
        instructions: instructions.trim(),
        category: category || 'Other',
        cuisine: cuisine || 'Other',
        dietary: {
          halal: isHalal,
          vegetarian: isVegetarian,
          vegan: isVegan,
          glutenFree: isGlutenFree
        },
        nutrition: {
          calories: parseInt(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0
        },
        author: {
          uid: user.id,
          email: user.email || 'Anonymous',
          name: user.name || 'Anonymous'
        },
        createdAt: new Date().toISOString(),
        approved: false, // Recipes need moderation before appearing globally
        likes: 0,
        views: 0
      };

      // Save to user's personal collection
      await firestoreService.save('recipes', recipeData, user.id);
      
      // Also save to community recipes (pending approval)
      const recipeId = `${user.id}_${Date.now()}`;
      await firestoreService.saveToCollection('communityRecipes', recipeId, recipeData);

      showToast('✅ Recipe saved successfully!', 'success');
      
      // Reset form
      setRecipeName('');
      setServings(1);
      setPrepTime('');
      setCookTime('');
      setIngredients([{ name: '', quantity: '', unit: '' }]);
      setInstructions('');
      setCategory('');
      setCuisine('');
      setIsHalal(false);
      setIsVegetarian(false);
      setIsVegan(false);
      setIsGlutenFree(false);
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');

      // Close after short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error saving recipe:', error);
      showToast('❌ Failed to save recipe. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="recipe-creator-overlay">
      <div className="recipe-creator">
        <button className="creator-close" onClick={onClose}>✕</button>

        <h2 className="creator-title">👨‍🍳 Create Your Recipe</h2>
        <p className="creator-subtitle">Share your culinary masterpiece with the community!</p>

        <div className="creator-form">
          {/* Recipe Name */}
          <div className="form-group">
            <label>Recipe Name *</label>
            <input
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g., Grandma's Apple Pie"
              maxLength={100}
            />
          </div>

          {/* Servings, Prep & Cook Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="1"
                max="50"
              />
            </div>
            <div className="form-group">
              <label>Prep Time</label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="e.g., 15 min"
              />
            </div>
            <div className="form-group">
              <label>Cook Time</label>
              <input
                type="text"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="e.g., 30 min"
              />
            </div>
          </div>

          {/* Category & Cuisine */}
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cuisine</label>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                <option value="">Select cuisine</option>
                {cuisines.map(cui => (
                  <option key={cui} value={cui}>{cui}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="form-group">
            <label>Dietary Information</label>
            <div className="dietary-tags">
              <label className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={isHalal}
                  onChange={(e) => setIsHalal(e.target.checked)}
                />
                <span>🕌 Halal</span>
              </label>
              <label className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                />
                <span>🥗 Vegetarian</span>
              </label>
              <label className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={isVegan}
                  onChange={(e) => setIsVegan(e.target.checked)}
                />
                <span>🌱 Vegan</span>
              </label>
              <label className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={isGlutenFree}
                  onChange={(e) => setIsGlutenFree(e.target.checked)}
                />
                <span>🌾 Gluten-Free</span>
              </label>
            </div>
          </div>

          {/* Ingredients */}
          <div className="form-group">
            <label>Ingredients *</label>
            {ingredients.map((ing, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="Ingredient name"
                  className="ingredient-name"
                />
                <input
                  type="text"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  placeholder="Amount"
                  className="ingredient-quantity"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="ingredient-unit"
                >
                  <option value="">Unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="remove-ingredient"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="add-ingredient">
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div className="form-group">
            <label>Cooking Instructions *</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. Preheat oven to 350°F&#10;2. Mix dry ingredients...&#10;3. Bake for 30 minutes..."
              rows={8}
            />
          </div>

          {/* Nutrition Info (Optional) */}
          <div className="form-group">
            <label>Nutrition Information (per serving)</label>
            <div className="form-row">
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="Calories"
                min="0"
              />
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Protein (g)"
                min="0"
                step="0.1"
              />
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="Carbs (g)"
                min="0"
                step="0.1"
              />
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="Fat (g)"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              className="save-recipe-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '✅ Save Recipe'}
            </button>
            <button className="cancel-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>

        <div className="creator-info">
          <p>💡 Your recipe will be saved to your personal collection and submitted to the community database for approval.</p>
        </div>
      </div>
    </div>
  );
}
