// Smart Food Search - Multi-Database Search with Relevance Ranking
import usdaService from './usdaService';
import restaurantService from './restaurantService';
import barcodeScannerService from './barcodeScannerService';

class SmartFoodSearch {
  /**
   * Search all databases and return ranked results
   * @param {string} query - Food name or search term
   * @param {object} options - Search options (barcode, preferences, etc.)
   * @returns {Promise<Array>} - Sorted array of food results with scores
   */
  async searchAllDatabases(query, options = {}) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();
    const results = [];

    try {
      // Search all 3 databases in parallel
      const [usdaResults, restaurantResults, openFoodResults] = await Promise.all([
        this.searchUSDA(searchTerm),
        this.searchRestaurants(searchTerm, options),
        this.searchOpenFoodFacts(searchTerm, options)
      ]);

      // Combine all results
      results.push(...usdaResults);
      results.push(...restaurantResults);
      results.push(...openFoodResults);

      // Calculate relevance scores
      const scoredResults = results.map(food => ({
        ...food,
        relevanceScore: this.calculateRelevanceScore(food, searchTerm, options)
      }));

      // Sort by relevance score (highest first)
      scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return scoredResults;

    } catch (error) {
      if(import.meta.env.DEV) console.error('❌ Smart search error:', error);
      return results;
    }
  }

  /**
   * Search USDA database
   */
  async searchUSDA(query) {
    try {
      const result = await usdaService.searchFoods(query, 20);
      if (result.success && result.foods) {
        return result.foods.map(food => ({
          ...food,
          source: 'USDA',
          sourceBadge: '🇺🇸',
          sourceColor: '#00c853'
        }));
      }
    } catch (error) {
      if(import.meta.env.DEV) console.error('USDA search error:', error);
    }
    return [];
  }

  /**
   * Search Restaurant database
   */
  async searchRestaurants(query, options = {}) {
    try {
      const filters = {};
      if (options.halalOnly) filters.halalOnly = true;
      if (options.cuisine) filters.cuisine = options.cuisine;

      const results = restaurantService.searchMenuItems(query, null, filters);
      return results.map(food => ({
        ...food,
        source: 'Restaurant',
        sourceBadge: '🍔',
        sourceColor: '#f093fb',
        // Add restaurant metadata
        restaurantInfo: {
          name: food.restaurantName,
          logo: food.restaurantLogo,
          cuisine: food.restaurantCuisine,
          isHalal: food.restaurantIsHalal
        }
      }));
    } catch (error) {
      if(import.meta.env.DEV) console.error('Restaurant search error:', error);
    }
    return [];
  }

  /**
   * Search OpenFoodFacts database
   */
  async searchOpenFoodFacts(query, options = {}) {
    try {
      // If barcode provided, search by barcode first
      if (options.barcode) {
        const barcodeResult = await barcodeScannerService.lookupFoodByBarcode(options.barcode);
        if (barcodeResult.success && barcodeResult.food) {
          return [{
            ...barcodeResult.food,
            source: 'OpenFoodFacts',
            sourceBadge: '🌍',
            sourceColor: '#667eea',
            exactBarcodeMatch: true
          }];
        }
      }

      // Text search
      const result = await barcodeScannerService.searchOpenFoodFactsByText(query, 1);
      if (result.success && result.foods) {
        return result.foods.map(food => ({
          ...food,
          source: 'OpenFoodFacts',
          sourceBadge: '🌍',
          sourceColor: '#667eea'
        }));
      }
    } catch (error) {
      if(import.meta.env.DEV) console.error('OpenFoodFacts search error:', error);
    }
    return [];
  }

  /**
   * Calculate relevance score for ranking
   * @param {object} food - Food item
   * @param {string} searchTerm - Search query
   * @param {object} options - User preferences
   * @returns {number} - Relevance score (0-200)
   */
  calculateRelevanceScore(food, searchTerm, options = {}) {
    let score = 0;
    const foodName = (food.name || '').toLowerCase();
    const searchWords = searchTerm.split(' ').filter(w => w.length > 2);

    // Exact barcode match = highest priority
    if (food.exactBarcodeMatch) {
      return 200;
    }

    // Exact name match
    if (foodName === searchTerm) {
      score += 100;
    }

    // All search words present
    const allWordsPresent = searchWords.every(word => foodName.includes(word));
    if (allWordsPresent) {
      score += 80;
    } else {
      // Partial word matches
      const matchingWords = searchWords.filter(word => foodName.includes(word));
      score += matchingWords.length * 15;
    }

    // Brand/Restaurant match bonus
    const brand = (food.brand || food.restaurantName || '').toLowerCase();
    if (brand && searchWords.some(word => brand.includes(word))) {
      score += 20;
    }

    // Source quality bonus
    if (food.source === 'USDA') {
      score += 5; // USDA = verified government data
    }

    // Complete nutrition data bonus
    if (food.calories && food.protein && food.carbs && food.fats) {
      score += 10;
    }

    // Halal preference bonus
    if (options.halalOnly && food.isHalal) {
      score += 15;
    }

    // Cuisine preference bonus
    if (options.cuisine && food.cuisine === options.cuisine) {
      score += 12;
    }

    // Name starts with search term (higher relevance)
    if (foodName.startsWith(searchTerm)) {
      score += 25;
    }

    return score;
  }

  /**
   * Get top N results
   * @param {string} query - Search term
   * @param {number} limit - Max results
   * @param {object} options - Search options
   * @returns {Promise<Array>} - Top N results
   */
  async getTopResults(query, limit = 10, options = {}) {
    const allResults = await this.searchAllDatabases(query, options);
    return allResults.slice(0, limit);
  }

  /**
   * Search by barcode across all databases
   * @param {string} barcode - Barcode number
   * @returns {Promise<Array>} - Ranked results
   */
  async searchByBarcode(barcode) {
    // First try exact barcode match
    const barcodeResult = await barcodeScannerService.lookupFoodByBarcode(barcode);
    
    if (barcodeResult.success && barcodeResult.food) {
      const productName = barcodeResult.food.name;
      
      // Search other databases with product name
      const allResults = await this.searchAllDatabases(productName, { barcode });
      
      return allResults;
    }

    return [];
  }

  /**
   * Format results for display
   * @param {Array} results - Search results
   * @returns {object} - Formatted results with best match highlighted
   */
  formatResults(results) {
    if (!results || results.length === 0) {
      return {
        bestMatch: null,
        otherMatches: [],
        totalCount: 0
      };
    }

    return {
      bestMatch: results[0], // Highest score
      otherMatches: results.slice(1), // Rest of results
      totalCount: results.length,
      sources: {
        usda: results.filter(r => r.source === 'USDA').length,
        restaurants: results.filter(r => r.source === 'Restaurant').length,
        openFoodFacts: results.filter(r => r.source === 'OpenFoodFacts').length
      }
    };
  }
}

export default new SmartFoodSearch();
