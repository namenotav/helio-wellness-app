import React, { useState, useEffect } from 'react';
import './RecipeBuilder.css';
import { recipeService } from '../services/recipeService';
import { barcodeScannerService } from '../services/barcodeScannerService';

export default function RecipeBuilder({ onClose, editingRecipe = null }) {
  const [recipeName, setRecipeName] = useState('');
  const [category, setCategory] = useState('Custom');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState(1);
  const [difficulty, setDifficulty] = useState('Easy');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState(['']);
  const [tags, setTags] = useState([]);
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientResults, setIngredientResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load recipe if editing
  useEffect(() => {
    if (editingRecipe) {
      setRecipeName(editingRecipe.name);
      setCategory(editingRecipe.category);
      setPrepTime(editingRecipe.prepTime);
      setCookTime(editingRecipe.cookTime);
      setServings(editingRecipe.servings);
      setDifficulty(editingRecipe.difficulty);
      setIngredients(editingRecipe.ingredients || []);
      setInstructions(editingRecipe.instructions || ['']);
      setTags(editingRecipe.tags || []);
      setNutrition({
        calories: editingRecipe.calories,
        protein: editingRecipe.protein,
        carbs: editingRecipe.carbs,
        fats: editingRecipe.fats
      });
    }
  }, [editingRecipe]);

  // Auto-calculate nutrition when ingredients or servings change
  useEffect(() => {
    if (ingredients.length > 0) {
      calculateNutrition();
    }
  }, [ingredients, servings]);

  const calculateNutrition = async () => {
    const result = await recipeService.calculateNutrition(ingredients, servings);
    setNutrition(result);
  };

  const searchIngredient = async (query) => {
    if (!query || query.length < 2) {
      setIngredientResults([]);
      return;
    }

    setSearchLoading(true);
    const result = await barcodeScannerService.searchOpenFoodFactsByText(query, 1);
    
    if (result.success) {
      setIngredientResults(result.foods.slice(0, 10)); // Top 10 results
    } else {
      setIngredientResults([]);
    }
    
    setSearchLoading(false);
  };

  const addIngredient = (food = null) => {
    if (food) {
      // Add from search results
      const ingredientStr = `100g ${food.name}${food.brand ? ' (' + food.brand + ')' : ''}`;
      setIngredients([...ingredients, ingredientStr]);
      setIngredientSearch('');
      setIngredientResults([]);
    } else if (ingredientSearch.trim()) {
      // Add manual entry
      setIngredients([...ingredients, ingredientSearch.trim()]);
      setIngredientSearch('');
      setIngredientResults([]);
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!recipeName.trim()) {
      alert('Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    setSaving(true);

    const recipeData = {
      name: recipeName,
      category,
      prepTime: prepTime || '0 minutes',
      cookTime: cookTime || '0 minutes',
      servings,
      difficulty,
      ingredients,
      instructions: instructions.filter(i => i.trim()),
      tags: tags.length > 0 ? tags : ['Custom']
    };

    let result;
    if (editingRecipe) {
      result = await recipeService.updateRecipe(editingRecipe.id, recipeData);
    } else {
      result = await recipeService.createRecipe(recipeData);
    }

    setSaving(false);

    if (result.success) {
      alert(editingRecipe ? 'Recipe updated!' : 'Recipe created!');
      onClose();
    } else {
      alert('Failed to save recipe: ' + result.error);
    }
  };

  return (
    <div className="recipe-builder-overlay" onClick={onClose}>
      <div className="recipe-builder-modal" onClick={e => e.stopPropagation()}>
        <div className="recipe-builder-header">
          <h2>{editingRecipe ? '✏️ Edit Recipe' : '➕ Create New Recipe'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="recipe-builder-content">
          
          {/* Basic Info */}
          <section className="recipe-section">
            <h3>📋 Basic Information</h3>
            
            <div className="form-group">
              <label>Recipe Name *</label>
              <input 
                type="text" 
                value={recipeName}
                onChange={e => setRecipeName(e.target.value)}
                placeholder="e.g., Grilled Chicken Salad"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                  <option>Dessert</option>
                  <option>Custom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prep Time</label>
                <input 
                  type="text" 
                  value={prepTime}
                  onChange={e => setPrepTime(e.target.value)}
                  placeholder="e.g., 10 minutes"
                />
              </div>

              <div className="form-group">
                <label>Cook Time</label>
                <input 
                  type="text" 
                  value={cookTime}
                  onChange={e => setCookTime(e.target.value)}
                  placeholder="e.g., 20 minutes"
                />
              </div>

              <div className="form-group">
                <label>Servings</label>
                <input 
                  type="number" 
                  value={servings}
                  onChange={e => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="recipe-section">
            <h3>🥗 Ingredients *</h3>
            
            <div className="ingredient-search">
              <input 
                type="text" 
                value={ingredientSearch}
                onChange={e => {
                  setIngredientSearch(e.target.value);
                  searchIngredient(e.target.value);
                }}
                onKeyPress={e => e.key === 'Enter' && addIngredient()}
                placeholder="Search or type ingredient (e.g., 100g chicken breast)"
              />
              <button onClick={() => addIngredient()} disabled={!ingredientSearch.trim()}>
                Add
              </button>
            </div>

            {/* Search Results */}
            {ingredientResults.length > 0 && (
              <div className="ingredient-results">
                {ingredientResults.map((food, idx) => (
                  <div key={idx} className="ingredient-result" onClick={() => addIngredient(food)}>
                    <span>{food.name} {food.brand && `(${food.brand})`}</span>
                    <small>{food.calories} cal • {food.protein}g protein per 100g</small>
                  </div>
                ))}
              </div>
            )}

            {/* Ingredient List */}
            <div className="ingredient-list">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-item">
                  <span>{ing}</span>
                  <button onClick={() => removeIngredient(idx)}>✕</button>
                </div>
              ))}
              {ingredients.length === 0 && (
                <p className="empty-state">No ingredients added yet</p>
              )}
            </div>
          </section>

          {/* Instructions */}
          <section className="recipe-section">
            <h3>👨‍🍳 Instructions</h3>
            
            {instructions.map((instruction, idx) => (
              <div key={idx} className="instruction-item">
                <span className="step-number">{idx + 1}</span>
                <input 
                  type="text" 
                  value={instruction}
                  onChange={e => updateInstruction(idx, e.target.value)}
                  placeholder={`Step ${idx + 1}`}
                />
                <button onClick={() => removeInstruction(idx)}>✕</button>
              </div>
            ))}
            
            <button className="add-step-btn" onClick={addInstruction}>
              + Add Step
            </button>
          </section>

          {/* Tags */}
          <section className="recipe-section">
            <h3>🏷️ Tags</h3>
            
            <div className="tag-suggestions">
              {['High-Protein', 'Low-Carb', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Quick', 'Meal-Prep'].map(tag => (
                <button 
                  key={tag}
                  className={tags.includes(tag) ? 'tag-btn active' : 'tag-btn'}
                  onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="tag-list">
              {tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button onClick={() => removeTag(tag)}>✕</button>
                </span>
              ))}
            </div>
          </section>

          {/* Nutrition Preview */}
          <section className="recipe-section">
            <h3>📊 Nutrition (Per Serving)</h3>
            
            <div className="nutrition-preview">
              <div className="nutrition-item">
                <span className="nutrition-value">{nutrition.calories}</span>
                <span className="nutrition-label">Calories</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{nutrition.protein}g</span>
                <span className="nutrition-label">Protein</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{nutrition.carbs}g</span>
                <span className="nutrition-label">Carbs</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{nutrition.fats}g</span>
                <span className="nutrition-label">Fats</span>
              </div>
            </div>
            
            <p className="nutrition-note">
              💡 Nutrition is auto-calculated from ingredients
            </p>
          </section>

        </div>

        <div className="recipe-builder-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (editingRecipe ? 'Update Recipe' : 'Create Recipe')}
          </button>
        </div>
      </div>
    </div>
  );
}
