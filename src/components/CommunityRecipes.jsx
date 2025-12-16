// Community Recipes Browser - View User-Submitted Recipes
import { useState, useEffect } from 'react';
import './CommunityRecipes.css';
import firestoreService from '../services/firestoreService';
import { showToast } from './Toast';

export default function CommunityRecipes({ isOpen, onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDietary, setFilterDietary] = useState('all');
  const [filterCuisine, setFilterCuisine] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await firestoreService.queryCollection('communityRecipes');
      
      // Sort by newest first
      const sorted = allRecipes.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setRecipes(sorted);
      console.log(`✅ Loaded ${sorted.length} community recipes`);
    } catch (error) {
      console.error('Error loading recipes:', error);
      showToast('❌ Failed to load recipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      recipe.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category?.toLowerCase().includes(searchQuery.toLowerCase());

    // Dietary filter
    const matchesDietary = filterDietary === 'all' || 
      (filterDietary === 'halal' && recipe.dietary?.halal) ||
      (filterDietary === 'vegetarian' && recipe.dietary?.vegetarian) ||
      (filterDietary === 'vegan' && recipe.dietary?.vegan) ||
      (filterDietary === 'glutenFree' && recipe.dietary?.glutenFree);

    // Cuisine filter
    const matchesCuisine = filterCuisine === 'all' || recipe.cuisine === filterCuisine;

    return matchesSearch && matchesDietary && matchesCuisine;
  });

  const cuisines = ['All', ...new Set(recipes.map(r => r.cuisine).filter(Boolean))];

  if (!isOpen) return null;

  if (selectedRecipe) {
    return (
      <RecipeDetailView 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  return (
    <div className="recipes-overlay" onClick={onClose}>
      <div className="recipes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="recipes-header">
          <h2>👨‍🍳 Community Recipes</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Search & Filters */}
        <div className="recipes-controls">
          <input
            type="text"
            placeholder="🔍 Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="recipe-search"
          />

          <div className="filter-row">
            <select 
              value={filterDietary} 
              onChange={(e) => setFilterDietary(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Dietary</option>
              <option value="halal">🕌 Halal</option>
              <option value="vegetarian">🥗 Vegetarian</option>
              <option value="vegan">🌱 Vegan</option>
              <option value="glutenFree">🌾 Gluten-Free</option>
            </select>

            <select 
              value={filterCuisine} 
              onChange={(e) => setFilterCuisine(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Cuisines</option>
              {cuisines.filter(c => c !== 'All').map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="recipes-grid">
          {loading ? (
            <div className="loading-state">⏳ Loading recipes...</div>
          ) : filteredRecipes.length === 0 ? (
            <div className="empty-state">
              <p>📝 No recipes found</p>
              <p>Be the first to share a recipe!</p>
            </div>
          ) : (
            filteredRecipes.map(recipe => (
              <div 
                key={recipe.id} 
                className="recipe-card"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="recipe-card-header">
                  <h3>{recipe.name}</h3>
                  <span className="recipe-category">{recipe.category}</span>
                </div>

                <div className="recipe-card-meta">
                  <span>🍴 {recipe.cuisine}</span>
                  <span>👤 {recipe.servings} servings</span>
                </div>

                {recipe.prepTime && (
                  <div className="recipe-time">
                    ⏱️ {recipe.prepTime} {recipe.cookTime && `+ ${recipe.cookTime}`}
                  </div>
                )}

                <div className="recipe-dietary-tags">
                  {recipe.dietary?.halal && <span className="tag">🕌 Halal</span>}
                  {recipe.dietary?.vegetarian && <span className="tag">🥗 Vegetarian</span>}
                  {recipe.dietary?.vegan && <span className="tag">🌱 Vegan</span>}
                  {recipe.dietary?.glutenFree && <span className="tag">🌾 GF</span>}
                </div>

                <div className="recipe-card-footer">
                  <span>by {recipe.author?.name || 'Anonymous'}</span>
                  <button className="view-btn">View Recipe →</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Recipe Detail View Component
function RecipeDetailView({ recipe, onClose, onBack }) {
  return (
    <div className="recipe-detail-overlay" onClick={onClose}>
      <div className="recipe-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="detail-content">
          <h1>{recipe.name}</h1>
          
          <div className="detail-meta">
            <span>🍴 {recipe.cuisine}</span>
            <span>📂 {recipe.category}</span>
            <span>👤 {recipe.servings} servings</span>
          </div>

          {(recipe.prepTime || recipe.cookTime) && (
            <div className="detail-time">
              {recipe.prepTime && <span>⏱️ Prep: {recipe.prepTime}</span>}
              {recipe.cookTime && <span>🔥 Cook: {recipe.cookTime}</span>}
            </div>
          )}

          <div className="detail-dietary-tags">
            {recipe.dietary?.halal && <span className="tag">🕌 Halal</span>}
            {recipe.dietary?.vegetarian && <span className="tag">🥗 Vegetarian</span>}
            {recipe.dietary?.vegan && <span className="tag">🌱 Vegan</span>}
            {recipe.dietary?.glutenFree && <span className="tag">🌾 Gluten-Free</span>}
          </div>

          {/* Nutrition Info */}
          {recipe.nutrition && (recipe.nutrition.calories > 0 || recipe.nutrition.protein > 0) && (
            <div className="nutrition-info">
              <h3>📊 Nutrition (per serving)</h3>
              <div className="nutrition-grid">
                {recipe.nutrition.calories > 0 && <div><strong>Calories:</strong> {recipe.nutrition.calories}</div>}
                {recipe.nutrition.protein > 0 && <div><strong>Protein:</strong> {recipe.nutrition.protein}g</div>}
                {recipe.nutrition.carbs > 0 && <div><strong>Carbs:</strong> {recipe.nutrition.carbs}g</div>}
                {recipe.nutrition.fat > 0 && <div><strong>Fat:</strong> {recipe.nutrition.fat}g</div>}
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div className="ingredients-section">
            <h3>🥘 Ingredients</h3>
            <ul>
              {recipe.ingredients?.map((ing, idx) => (
                <li key={idx}>
                  {ing.quantity && `${ing.quantity} `}
                  {ing.unit && `${ing.unit} `}
                  {ing.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <h3>👨‍🍳 Instructions</h3>
            <div className="instructions-text">
              {recipe.instructions?.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>

          {/* Author */}
          <div className="recipe-author">
            <p>Recipe by <strong>{recipe.author?.name || 'Anonymous'}</strong></p>
            <p className="recipe-date">
              Shared {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
