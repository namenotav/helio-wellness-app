// Restaurant Service - Search and manage restaurant food items

import { restaurantDatabase, searchRestaurants, searchMenuItems, getRestaurantById, getAllCategories } from '../data/restaurantDatabase';

class RestaurantService {
  constructor() {
    this.restaurants = restaurantDatabase;
  }

  /**
   * Search restaurants by name
   */
  searchRestaurants(query) {
    if(import.meta.env.DEV)console.log('🔍 Searching restaurants:', query);
    return searchRestaurants(query);
  }

  /**
   * Search menu items across all restaurants
   */
  searchMenuItems(query, restaurantId = null, filters = {}) {
    if(import.meta.env.DEV)console.log('🔍 Searching menu items:', query, filters);
    return searchMenuItems(query, restaurantId, filters);
  }

  /**
   * Get all halal items
   */
  getHalalItems(query = '') {
    return this.searchMenuItems(query, null, { halalOnly: true });
  }

  /**
   * Get items by cuisine type
   */
  getItemsByCuisine(cuisine, query = '') {
    return this.searchMenuItems(query, null, { cuisine });
  }

  /**
   * Get all available cuisines
   */
  getAllCuisines() {
    const cuisines = new Set();
    this.restaurants.forEach(restaurant => {
      if (restaurant.cuisine) {
        cuisines.add(restaurant.cuisine);
      }
      restaurant.menuItems.forEach(item => {
        if (item.cuisine) {
          cuisines.add(item.cuisine);
        }
      });
    });
    return Array.from(cuisines).sort();
  }

  /**
   * Get restaurant by ID
   */
  getRestaurant(restaurantId) {
    return getRestaurantById(restaurantId);
  }

  /**
   * Get all restaurants
   */
  getAllRestaurants() {
    return this.restaurants;
  }

  /**
   * Get all menu categories
   */
  getCategories() {
    return getAllCategories();
  }

  /**
   * Get menu items by category
   */
  getItemsByCategory(category, restaurantId = null) {
    let restaurants = restaurantId 
      ? this.restaurants.filter(r => r.id === restaurantId)
      : this.restaurants;

    const results = [];

    restaurants.forEach(restaurant => {
      const matchingItems = restaurant.menuItems.filter(item =>
        item.category === category
      );

      matchingItems.forEach(item => {
        results.push({
          ...item,
          restaurantName: restaurant.name,
          restaurantId: restaurant.id,
          restaurantLogo: restaurant.logo
        });
      });
    });

    return results;
  }

  /**
   * Get specific menu item
   */
  getMenuItem(restaurantId, itemId) {
    const restaurant = this.getRestaurant(restaurantId);
    if (!restaurant) return null;

    return restaurant.menuItems.find(item => item.id === itemId);
  }

  /**
   * Get popular items (most common across restaurants)
   */
  getPopularItems(limit = 20) {
    const allItems = [];
    
    this.restaurants.forEach(restaurant => {
      restaurant.menuItems.forEach(item => {
        allItems.push({
          ...item,
          restaurantName: restaurant.name,
          restaurantId: restaurant.id,
          restaurantLogo: restaurant.logo
        });
      });
    });

    // Sort by category popularity (burgers, chicken, etc.)
    const popularCategories = ['Burgers', 'Chicken', 'Pizza', 'Sandwiches', 'Ramen'];
    const popularItems = allItems.filter(item => 
      popularCategories.includes(item.category)
    );

    return popularItems.slice(0, limit);
  }

  /**
   * Get low calorie options
   */
  getLowCalorieOptions(maxCalories = 400) {
    const allItems = [];
    
    this.restaurants.forEach(restaurant => {
      restaurant.menuItems.forEach(item => {
        if (item.calories <= maxCalories) {
          allItems.push({
            ...item,
            restaurantName: restaurant.name,
            restaurantId: restaurant.id,
            restaurantLogo: restaurant.logo
          });
        }
      });
    });

    return allItems.sort((a, b) => a.calories - b.calories);
  }

  /**
   * Get high protein options
   */
  getHighProteinOptions(minProtein = 20) {
    const allItems = [];
    
    this.restaurants.forEach(restaurant => {
      restaurant.menuItems.forEach(item => {
        if (item.protein >= minProtein) {
          allItems.push({
            ...item,
            restaurantName: restaurant.name,
            restaurantId: restaurant.id,
            restaurantLogo: restaurant.logo
          });
        }
      });
    });

    return allItems.sort((a, b) => b.protein - a.protein);
  }

  /**
   * Format menu item for food logging
   */
  formatForLogging(restaurantId, itemId, quantity = 1) {
    const restaurant = this.getRestaurant(restaurantId);
    if (!restaurant) return null;

    const item = restaurant.menuItems.find(i => i.id === itemId);
    if (!item) return null;

    return {
      name: `${item.name} (${restaurant.name})`,
      calories: Math.round(item.calories * quantity),
      protein: Math.round(item.protein * quantity * 10) / 10,
      carbs: Math.round(item.carbs * quantity * 10) / 10,
      fats: Math.round(item.fats * quantity * 10) / 10,
      serving_size: item.serving_size,
      quantity: quantity,
      source: 'restaurant',
      restaurant: restaurant.name,
      restaurantId: restaurantId,
      itemId: itemId,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const restaurantService = new RestaurantService();
export default restaurantService;
