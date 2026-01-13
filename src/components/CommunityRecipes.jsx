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
  const [filterView, setFilterView] = useState('all'); // 'all' or 'mine'
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
      loadCurrentUser();
    }
  }, [isOpen]);

  const loadCurrentUser = async () => {
    try {
      const authService = (await import('../services/authService')).default;
      const user = authService.getCurrentUser();
      setCurrentUserId(user?.id);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

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
    // View filter (all vs mine)
    const matchesView = filterView === 'all' || 
      (filterView === 'mine' && recipe.author?.uid === currentUserId);

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

    return matchesView && matchesSearch && matchesDietary && matchesCuisine;
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
          {/* View Toggle */}
          <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            <button
              onClick={() => setFilterView('all')}
              style={{
                flex: 1,
                padding: '10px',
                background: filterView === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                color: filterView === 'all' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              👥 All Recipes
            </button>
            <button
              onClick={() => setFilterView('mine')}
              style={{
                flex: 1,
                padding: '10px',
                background: filterView === 'mine' ? 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' : '#f0f0f0',
                color: filterView === 'mine' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🏠 My Recipes
            </button>
          </div>

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
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(recipe.likes || 0);
  const [logging, setLogging] = React.useState(false);
  const [reported, setReported] = React.useState(false);

  // 🔧 FIX: Calculate estimated calories from ingredients
  const estimatedCalories = React.useMemo(() => {
    if (recipe.nutrition?.calories > 0) return recipe.nutrition.calories;
    // Basic estimation: ~100 cal per ingredient as rough baseline
    const ingredientCount = recipe.ingredients?.length || 0;
    return ingredientCount > 0 ? ingredientCount * 100 : null;
  }, [recipe]);

  React.useEffect(() => {
    checkIfLiked();
  }, [recipe.id]);

  // 🔧 FIX: Report recipe function for moderation
  const handleReport = async () => {
    try {
      const authService = (await import('../services/authService')).default;
      const user = authService.getCurrentUser();
      if (!user) {
        const { showToast } = await import('./Toast');
        showToast('❌ Please log in to report recipes', 'error');
        return;
      }

      const firestoreService = (await import('../services/firestoreService')).default;
      await firestoreService.save('reportedRecipes', {
        recipeId: recipe.id,
        recipeName: recipe.name,
        reportedBy: user.id,
        reportedAt: new Date().toISOString(),
        reason: 'User flagged for review'
      }, `${recipe.id}_${user.id}`);

      setReported(true);
      const { showToast } = await import('./Toast');
      showToast('🚩 Recipe reported for review. Thank you!', 'success');
    } catch (error) {
      console.error('Error reporting recipe:', error);
      const { showToast } = await import('./Toast');
      showToast('❌ Failed to report recipe', 'error');
    }
  };

  const checkIfLiked = async () => {
    try {
      const authService = (await import('../services/authService')).default;
      const user = authService.getCurrentUser();
      if (user && recipe.likedBy) {
        setLiked(recipe.likedBy.includes(user.id));
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    try {
      const authService = (await import('../services/authService')).default;
      const user = authService.getCurrentUser();
      if (!user) {
        const { showToast } = await import('./Toast');
        showToast('❌ Please log in to like recipes', 'error');
        return;
      }

      const recipeService = (await import('../services/recipeService')).default;
      const result = await recipeService.toggleLike(recipe.id, user.id);
      
      if (!result.error) {
        setLiked(result.liked);
        setLikeCount(result.likes);
        const { showToast } = await import('./Toast');
        showToast(result.liked ? '❤️ Recipe liked!' : '💔 Like removed', 'success');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleLogFood = async () => {
    try {
      setLogging(true);
      const authService = (await import('../services/authService')).default;
      const user = authService.getCurrentUser();
      if (!user) {
        const { showToast } = await import('./Toast');
        showToast('❌ Please log in to log food', 'error');
        setLogging(false);
        return;
      }

      const recipeService = (await import('../services/recipeService')).default;
      const foodEntry = recipeService.convertRecipeToFood(recipe);
      
      // Save to food log
      const firestoreService = (await import('../services/firestoreService')).default;
      await firestoreService.save('foodLog', {
        ...foodEntry,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      }, user.id);

      const { showToast } = await import('./Toast');
      showToast('✅ Recipe logged to food diary!', 'success');
      setLogging(false);
      onClose();
    } catch (error) {
      console.error('Error logging food:', error);
      const { showToast } = await import('./Toast');
      showToast('❌ Failed to log recipe', 'error');
      setLogging(false);
    }
  };

  return (
    <div className="recipe-detail-overlay" onClick={onClose}>
      <div className="recipe-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <button 
              onClick={handleLike}
              style={{
                padding: '8px 16px',
                background: liked ? '#ff6b6b' : '#f0f0f0',
                color: liked ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>
            <button 
              onClick={handleLogFood}
              disabled={logging}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: logging ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                opacity: logging ? 0.6 : 1
              }}
            >
              {logging ? '⏳ Logging...' : '🍽️ Log Food'}
            </button>
            <button 
              onClick={handleReport}
              disabled={reported}
              title="Report inappropriate content"
              style={{
                padding: '8px 12px',
                background: reported ? '#ccc' : '#f0f0f0',
                color: reported ? '#666' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: reported ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {reported ? '✓ Reported' : '🚩'}
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
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
          {recipe.nutrition && (recipe.nutrition.calories > 0 || recipe.nutrition.protein > 0) ? (
            <div className="nutrition-info">
              <h3>📊 Nutrition (per serving)</h3>
              <div className="nutrition-grid">
                {recipe.nutrition.calories > 0 && <div><strong>Calories:</strong> {recipe.nutrition.calories}</div>}
                {recipe.nutrition.protein > 0 && <div><strong>Protein:</strong> {recipe.nutrition.protein}g</div>}
                {recipe.nutrition.carbs > 0 && <div><strong>Carbs:</strong> {recipe.nutrition.carbs}g</div>}
                {recipe.nutrition.fat > 0 && <div><strong>Fat:</strong> {recipe.nutrition.fat}g</div>}
              </div>
            </div>
          ) : estimatedCalories ? (
            <div className="nutrition-info" style={{ background: '#fff9e6', border: '1px solid #ffd700' }}>
              <h3>📊 Estimated Nutrition</h3>
              <p style={{ color: '#666', fontSize: '12px', margin: '4px 0' }}>
                ⚠️ No exact nutrition data - estimate based on {recipe.ingredients?.length || 0} ingredients
              </p>
              <div className="nutrition-grid">
                <div><strong>Est. Calories:</strong> ~{estimatedCalories} per serving</div>
              </div>
            </div>
          ) : null}

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
