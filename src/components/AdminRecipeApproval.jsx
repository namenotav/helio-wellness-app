// Admin Recipe Approval Component
import { useState, useEffect } from 'react';
import './AdminRecipeApproval.css';
import firestoreService from '../services/firestoreService';
import { default as recipeService } from '../services/recipeService';
import { showToast } from './Toast';

export default function AdminRecipeApproval({ isOpen, onClose }) {
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPendingRecipes();
    }
  }, [isOpen]);

  const loadPendingRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await firestoreService.queryCollection('communityRecipes');
      
      // Filter pending recipes
      const pending = allRecipes.filter(recipe => !recipe.approved);
      
      // Sort by newest first
      const sorted = pending.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setPendingRecipes(sorted);
      console.log(`📋 Loaded ${sorted.length} pending recipes`);
    } catch (error) {
      console.error('Error loading pending recipes:', error);
      showToast('❌ Failed to load pending recipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recipeId) => {
    try {
      await recipeService.moderateRecipe(recipeId, true);
      showToast('✅ Recipe approved!', 'success');
      loadPendingRecipes(); // Reload list
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Error approving recipe:', error);
      showToast('❌ Failed to approve recipe', 'error');
    }
  };

  const handleReject = async (recipeId) => {
    try {
      await recipeService.moderateRecipe(recipeId, false);
      showToast('🚫 Recipe rejected', 'success');
      loadPendingRecipes(); // Reload list
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Error rejecting recipe:', error);
      showToast('❌ Failed to reject recipe', 'error');
    }
  };

  if (!isOpen) return null;

  if (selectedRecipe) {
    return (
      <div className="admin-approval-overlay" onClick={onClose}>
        <div className="admin-approval-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-header">
            <button className="back-btn" onClick={() => setSelectedRecipe(null)}>← Back</button>
            <h2>Review Recipe</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="recipe-review-content">
            <h1>{selectedRecipe.name}</h1>
            
            <div className="recipe-meta">
              <span>📂 {selectedRecipe.category}</span>
              <span>🍴 {selectedRecipe.cuisine}</span>
              <span>👤 {selectedRecipe.servings} servings</span>
            </div>

            {(selectedRecipe.prepTime || selectedRecipe.cookTime) && (
              <div className="recipe-time">
                {selectedRecipe.prepTime && <span>⏱️ Prep: {selectedRecipe.prepTime}</span>}
                {selectedRecipe.cookTime && <span>🔥 Cook: {selectedRecipe.cookTime}</span>}
              </div>
            )}

            <div className="dietary-tags">
              {selectedRecipe.dietary?.halal && <span className="tag">🕌 Halal</span>}
              {selectedRecipe.dietary?.vegetarian && <span className="tag">🥗 Vegetarian</span>}
              {selectedRecipe.dietary?.vegan && <span className="tag">🌱 Vegan</span>}
              {selectedRecipe.dietary?.glutenFree && <span className="tag">🌾 Gluten-Free</span>}
            </div>

            {/* Nutrition */}
            {selectedRecipe.nutrition && (
              <div className="nutrition-info">
                <h3>📊 Nutrition (per serving)</h3>
                <div className="nutrition-grid">
                  <div><strong>Calories:</strong> {selectedRecipe.nutrition.calories}</div>
                  <div><strong>Protein:</strong> {selectedRecipe.nutrition.protein}g</div>
                  <div><strong>Carbs:</strong> {selectedRecipe.nutrition.carbs}g</div>
                  <div><strong>Fat:</strong> {selectedRecipe.nutrition.fat}g</div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="ingredients-section">
              <h3>🥘 Ingredients</h3>
              <ul>
                {selectedRecipe.ingredients?.map((ing, idx) => (
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
                {selectedRecipe.instructions?.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="recipe-author">
              <p>Submitted by <strong>{selectedRecipe.author?.name || 'Anonymous'}</strong></p>
              <p>Email: {selectedRecipe.author?.email || 'N/A'}</p>
              <p className="recipe-date">
                {new Date(selectedRecipe.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Approval Buttons */}
            <div className="approval-actions">
              <button 
                onClick={() => handleApprove(selectedRecipe.id)}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✅ Approve Recipe
              </button>
              <button 
                onClick={() => handleReject(selectedRecipe.id)}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🚫 Reject Recipe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-approval-overlay" onClick={onClose}>
      <div className="admin-approval-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>🛡️ Recipe Moderation</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="pending-count">
          <p>{pendingRecipes.length} recipes awaiting approval</p>
        </div>

        <div className="recipes-grid">
          {loading ? (
            <div className="loading-state">⏳ Loading recipes...</div>
          ) : pendingRecipes.length === 0 ? (
            <div className="empty-state">
              <p>✅ No pending recipes</p>
              <p>All recipes have been reviewed!</p>
            </div>
          ) : (
            pendingRecipes.map(recipe => (
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

                <div className="recipe-card-footer">
                  <span>by {recipe.author?.name || 'Anonymous'}</span>
                  <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
