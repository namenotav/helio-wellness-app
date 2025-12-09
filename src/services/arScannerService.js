// AR Food Scanner Service - Augmented Reality overlay for food
import { Camera } from '@capacitor/camera';
import aiVisionService from './aiVisionService';

class ARScannerService {
  constructor() {
    this.isScanning = false;
    this.overlayData = null;
  }

  // Start AR scanning mode
  async startARMode() {
    try {
      this.isScanning = true;
      if(import.meta.env.DEV)console.log('📷 Capturing photo for AR scan...');
      
      // Capture photo with compression for faster processing
      const photo = await Camera.getPhoto({
        quality: 50,  // Compressed for faster upload
        allowEditing: false,
        resultType: 'base64',
        source: 'CAMERA',
        width: 1024,  // Limit size
        height: 1024
      });

      if(import.meta.env.DEV)console.log('🤖 Analyzing food with AI...');
      // Analyze food with AI
      const analysis = await aiVisionService.analyzeFoodImage(photo.base64String);
      if(import.meta.env.DEV)console.log('📊 Analysis result:', analysis);
      
      if (analysis.success) {
        if(import.meta.env.DEV)console.log('✅ Creating AR overlay...');
        
        // Search ALL databases for accurate nutrition data
        const foodName = analysis.analysis.foodName || analysis.analysis.food;
        const smartFoodSearch = (await import('./smartFoodSearch')).default;
        const databaseMatches = await smartFoodSearch.searchAllDatabases(foodName);
        if(import.meta.env.DEV)console.log(`🔍 Found ${databaseMatches.length} database matches for: ${foodName}`);
        
        // Create AR overlay data with database nutrition
        this.overlayData = this.createAROverlay(analysis.analysis, databaseMatches);
        if(import.meta.env.DEV)console.log('🎨 AR overlay created:', this.overlayData);
        return {
          success: true,
          imageData: photo.base64String,
          overlayData: this.overlayData,
          databaseMatches: databaseMatches
        };
      }

      if(import.meta.env.DEV)console.error('❌ Analysis failed');
      return { success: false, error: analysis.error || 'Analysis failed' };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ AR Mode error:', error);
      return { success: false, error: error.message };
    } finally {
      this.isScanning = false;
    }
  }

  // Create AR overlay data structure
  createAROverlay(analysis, databaseMatches = []) {
    const { foodName, ingredients, detectedAllergens, safetyLevel } = analysis;
    
    // Use database nutrition if available, otherwise estimate
    let calories, protein, carbs, fats, source;
    if (databaseMatches && databaseMatches.length > 0) {
      const bestMatch = databaseMatches[0];
      calories = bestMatch.calories || 0;
      protein = bestMatch.protein || 0;
      carbs = bestMatch.carbs || bestMatch.carbohydrates || 0;
      fats = bestMatch.fat || bestMatch.fats || 0;
      source = bestMatch.source;
      if(import.meta.env.DEV)console.log(`✅ Using ${source} nutrition data: ${calories} cal`);
    } else {
      calories = this.estimateCalories(foodName, ingredients);
      protein = carbs = fats = 0;
      source = 'Estimated';
    }
    
    // Calculate portion recommendation
    const portionGuide = this.calculatePortionSize(foodName, calories);
    
    return {
      // Main info box (top of food)
      mainInfo: {
        foodName,
        calories,
        protein,
        carbs,
        fats,
        source,
        databaseMatch: databaseMatches.length > 0,
        position: 'top-center',
        color: this.getARColor(safetyLevel)
      },
      
      // Allergen warning zones (red overlay on dangerous parts)
      allergenZones: detectedAllergens.map((allergen, idx) => ({
        allergen: allergen.name,
        position: this.calculateZonePosition(idx, detectedAllergens.length),
        intensity: allergen.confidence === 'high' ? 0.8 : 0.5,
        color: '#FF4444'
      })),
      
      // Portion guide (circle overlay)
      portionGuide: {
        diameter: portionGuide.size,
        position: 'center',
        label: portionGuide.label,
        color: '#44FF44',
        opacity: 0.3
      },
      
      // Nutrition breakdown (side panel)
      nutritionPanel: {
        protein: this.estimateNutrient(ingredients, 'protein'),
        carbs: this.estimateNutrient(ingredients, 'carbs'),
        fat: this.estimateNutrient(ingredients, 'fat'),
        fiber: this.estimateNutrient(ingredients, 'fiber')
      },
      
      // Safety verdict (bottom banner)
      safetyBanner: {
        level: safetyLevel,
        message: analysis.safetyMessage,
        position: 'bottom',
        animated: safetyLevel === 'danger'
      }
    };
  }

  // Estimate calories from food name and ingredients
  estimateCalories(foodName, ingredients) {
    // Basic calorie database
    const calorieDB = {
      'pizza': 285,
      'burger': 350,
      'salad': 150,
      'pasta': 220,
      'chicken': 165,
      'fish': 140,
      'rice': 130,
      'bread': 265,
      'apple': 52,
      'banana': 89
    };
    
    // Check if food name matches database
    const food = foodName.toLowerCase();
    for (const [key, cals] of Object.entries(calorieDB)) {
      if (food.includes(key)) {
        return cals;
      }
    }
    
    // Estimate from ingredients count
    return ingredients.length * 50 + 100;
  }

  // Estimate specific nutrient
  estimateNutrient(ingredients, nutrientType) {
    const nutrientMap = {
      protein: ['chicken', 'fish', 'beef', 'egg', 'tofu', 'beans'],
      carbs: ['bread', 'rice', 'pasta', 'potato', 'wheat', 'corn'],
      fat: ['oil', 'butter', 'cheese', 'avocado', 'nuts'],
      fiber: ['vegetables', 'fruit', 'beans', 'oats', 'whole grain']
    };
    
    const sources = nutrientMap[nutrientType] || [];
    const count = ingredients.filter(ing => 
      sources.some(source => ing.toLowerCase().includes(source))
    ).length;
    
    return count > 0 ? 'High' : count > 2 ? 'Medium' : 'Low';
  }

  // Calculate recommended portion size
  calculatePortionSize(foodName, calories) {
    // Portion sizes based on calories
    if (calories < 150) {
      return { size: '200px', label: 'Recommended serving' };
    } else if (calories < 300) {
      return { size: '150px', label: 'Moderate portion' };
    } else {
      return { size: '100px', label: 'Small portion advised' };
    }
  }

  // Calculate position for allergen zone markers
  calculateZonePosition(index, total) {
    // Distribute markers around the food image
    const angle = (index / total) * 2 * Math.PI;
    const radius = 30; // percentage from center
    
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  }

  // Get color for AR overlays based on safety
  getARColor(safetyLevel) {
    return {
      'safe': '#44FF44',
      'caution': '#FFA500',
      'danger': '#FF4444',
      'unknown': '#888888'
    }[safetyLevel] || '#888888';
  }

  // AR Restaurant Mode - scan menu items
  async scanRestaurantMenu() {
    const result = await this.startARMode();
    
    if (result.success) {
      // Add restaurant-specific recommendations
      result.overlayData.restaurantTips = [
        '📝 Ask server about preparation methods',
        '🔄 Request modifications for allergens',
        '👨‍🍳 Speak directly with chef if needed'
      ];
    }
    
    return result;
  }

  // Live AR stream mode (future: continuous scanning)
  async enableLiveARStream() {
    // This would require WebRTC or similar for real-time processing
    // For now, return placeholder
    return {
      success: false,
      message: 'Live AR streaming coming in v2.0'
    };
  }
}

export const arScannerService = new ARScannerService();
export default arScannerService;



