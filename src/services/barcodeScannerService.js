// Barcode Scanner Service - Food Lookup via UPC/EAN Codes
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

class BarcodeScannerService {
  constructor() {
    this.isScanning = false;
    this.apiKey = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
    this.scanMode = 'live'; // 'camera' or 'live' - use live scanning for better accuracy
  }

  /**
   * Check if barcode scanner is available
   */
  async checkPermission() {
    try {
      if (!Capacitor.isNativePlatform()) {
        return { granted: false, message: 'Barcode scanning only available on mobile devices' };
      }

      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (status.granted) {
        return { granted: true };
      }

      if (status.denied) {
        return { granted: false, message: 'Camera permission denied. Enable in Settings.' };
      }

      // Request permission
      const permission = await BarcodeScanner.requestPermission();
      return { granted: permission.granted };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Permission check error:', error);
      return { granted: false, message: error.message };
    }
  }

  /**
   * Capture barcode photo using native camera (works like Food Scanner)
   */
  async captureBarcode() {
    try {
      if(import.meta.env.DEV)console.log('📸 Opening camera for barcode photo...');
      
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'base64',
        source: 'CAMERA',
        width: 1920,
        height: 1920,
        promptLabelHeader: 'Scan Barcode',
        promptLabelPhoto: 'Take Photo',
        promptLabelPicture: 'From Gallery'
      });

      if(import.meta.env.DEV)console.log('✅ Photo captured, analyzing barcode...');
      return {
        success: true,
        imageData: photo.base64String,
        format: photo.format
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Camera capture error:', error);
      if (error.message.includes('cancel')) {
        return { success: false, cancelled: true, message: 'Scan cancelled' };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract barcode from image using Gemini Vision AI
   */
  async scanBarcodeFromImage(imageBase64) {
    try {
      if(import.meta.env.DEV)console.log('🔍 Scanning barcode from image with Gemini AI...');

      const prompt = `You are a barcode scanner. Analyze this image and extract the barcode number.

CRITICAL INSTRUCTIONS:
1. Look for UPC, EAN, or any numeric barcode
2. Return ONLY the barcode number, nothing else
3. If multiple barcodes, return the largest/most prominent one
4. If no barcode found, return "NO_BARCODE"

Return format: Just the barcode number (e.g., "012345678901")`;

      const response = await fetch(
        'https://helio-wellness-app-production.up.railway.app/api/vision',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            imageData: imageBase64
          }),
          mode: 'cors'
        }
      );

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      const barcode = data.analysis?.trim();

      if (!barcode || barcode === 'NO_BARCODE') {
        return { success: false, message: 'No barcode detected in image' };
      }

      // Remove any non-numeric characters
      const cleanBarcode = barcode.replace(/[^0-9]/g, '');

      if (cleanBarcode.length < 8) {
        return { success: false, message: 'Invalid barcode detected' };
      }

      if(import.meta.env.DEV)console.log('✅ Barcode extracted:', cleanBarcode);
      return {
        success: true,
        barcode: cleanBarcode
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Barcode scan error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start barcode scanning - uses live scanning for best accuracy
   */
  async startScan(timeoutMs = 30000) {
    try {
      // Use live scanning mode (native barcode detection - much more accurate)
      return await this.startLiveScan(timeoutMs);
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Scan error:', error);
      throw error;
    }
  }

  /**
   * LEGACY: Live barcode scanning (kept for fallback, not used by default)
   */
  async startLiveScan(timeoutMs = 30000) {
    try {
      const permission = await this.checkPermission();
      
      if (!permission.granted) {
        throw new Error(permission.message || 'Camera permission required');
      }

      if(import.meta.env.DEV)console.log('🔵 Starting LIVE barcode scan...');

      // Prepare camera and hide background for camera feed to show
      await BarcodeScanner.prepare();
      await BarcodeScanner.hideBackground();
      
      // Add transparency class - our CSS will handle making top bar visible
      document.body.classList.add('barcode-scanning-active');
      document.querySelector('html')?.classList.add('barcode-scanning-active');
      
      this.isScanning = true;

      // Start scanning with timeout
      const scanPromise = BarcodeScanner.startScan();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Scan timeout - please try again')), timeoutMs)
      );

      const result = await Promise.race([scanPromise, timeoutPromise]);

      // Stop and cleanup
      this.stopScan();

      if (result.hasContent) {
        if(import.meta.env.DEV)console.log('✅ Barcode scanned:', result.content);
        return {
          success: true,
          barcode: result.content,
          format: result.format
        };
      }

      return { success: false, message: 'No barcode detected' };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Scan error:', error);
      this.stopScan();
      throw error;
    }
  }

  /**
   * Stop scanning and cleanup
   */
  stopScan() {
    if(import.meta.env.DEV)console.log('🛑 Stopping barcode scan...');
    this.isScanning = false;
    
    try {
      BarcodeScanner.stopScan();
      BarcodeScanner.showBackground();
      
      // Remove transparency classes
      document.body.classList.remove('barcode-scanning-active');
      document.querySelector('html')?.classList.remove('barcode-scanning-active');
      
      // Force browser reflow to recalculate CSS and restore banners immediately
      void document.body.offsetHeight;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Stop scan error:', error);
    }
  }

  /**
   * Lookup food by barcode using OpenFoodFacts API
   */
  async lookupFoodByBarcode(barcode) {
    try {
      if(import.meta.env.DEV)console.log('Looking up barcode:', barcode);

      // Try OpenFoodFacts first (free, extensive database)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        
        return {
          success: true,
          food: {
            name: product.product_name || 'Unknown Product',
            brand: product.brands || '',
            barcode: barcode,
            calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
            protein: Math.round(product.nutriments?.proteins_100g || 0),
            carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
            fat: Math.round(product.nutriments?.fat_100g || 0),
            fiber: Math.round(product.nutriments?.fiber_100g || 0),
            sugar: Math.round(product.nutriments?.sugars_100g || 0),
            sodium: Math.round(product.nutriments?.sodium_100g || 0),
            servingSize: product.serving_size || '100g',
            image: product.image_url || product.image_front_url || '',
            ingredients: product.ingredients_text || '',
            source: 'OpenFoodFacts'
          }
        };
      }

      // 🔴 FIX #8: FALLBACK TO USDA IF OPENFOODFACTS FAILS
      if(import.meta.env.DEV)console.log('⚠️ OpenFoodFacts returned empty, trying USDA...');
      return await this.lookupUSDAByBarcode(barcode);

    } catch (error) {
      if(import.meta.env.DEV)console.error('Barcode lookup error:', error);
      
      // 🔴 FIX #8: FALLBACK TO USDA ON ERROR
      if(import.meta.env.DEV)console.log('⚠️ OpenFoodFacts failed, trying USDA fallback...');
      try {
        return await this.lookupUSDAByBarcode(barcode);
      } catch (usdaError) {
        return {
          success: false,
          message: 'Product not found in any database'
        };
      }
    }
  }

  /**
   * Lookup via USDA FoodData Central (backup method)
   */
  async lookupUSDAByBarcode(barcode) {
    try {
      if (!this.apiKey || this.apiKey === 'DEMO_KEY') {
        if(import.meta.env.DEV)console.log('⚠️ USDA API key not configured');
        return {
          success: false,
          message: 'USDA lookup unavailable (no API key)'
        };
      }

      // Search USDA for barcode
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&pageSize=1&api_key=${this.apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        const nutrients = food.foodNutrients || [];
        
        const getNutrient = (name) => {
          const nutrient = nutrients.find(n => n.nutrientName?.includes(name));
          return nutrient ? Math.round(nutrient.value || 0) : 0;
        };

        return {
          success: true,
          food: {
            name: food.description || 'Unknown Product',
            brand: food.brandOwner || '',
            barcode: barcode,
            calories: getNutrient('Energy'),
            protein: getNutrient('Protein'),
            carbs: getNutrient('Carbohydrate'),
            fat: getNutrient('Total lipid'),
            fiber: getNutrient('Fiber'),
            sugar: getNutrient('Sugars'),
            sodium: getNutrient('Sodium'),
            servingSize: food.servingSize ? `${food.servingSize} ${food.servingSizeUnit}` : '100g',
            image: '',
            ingredients: food.ingredients || '',
            source: 'USDA FoodData Central'
          }
        };
      }

      return {
        success: false,
        message: 'Product not found in USDA database'
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('USDA lookup error:', error);
      return {
        success: false,
        message: 'Failed to lookup in USDA database'
      };
    }
  }

  /**
   * Search OpenFoodFacts by text query (6M+ foods, free API)
   */
  async searchOpenFoodFactsByText(query, page = 1) {
    try {
      if(import.meta.env.DEV)console.log('🔍 Searching OpenFoodFacts for:', query);
      
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=25&json=1&fields=product_name,nutriments,serving_size,brands,image_url,code`
      );

      if (!response.ok) {
        throw new Error('OpenFoodFacts API request failed');
      }

      const data = await response.json();
      
      if (!data.products || data.products.length === 0) {
        return {
          success: false,
          message: 'No foods found',
          foods: []
        };
      }

      // Transform OpenFoodFacts format to our format
      const foods = data.products.map(product => ({
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        barcode: product.code || '',
        calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
        protein: Math.round((product.nutriments?.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((product.nutriments?.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((product.nutriments?.fat_100g || 0) * 10) / 10,
        serving_size: product.serving_size || '100g',
        image_url: product.image_url || '',
        source: 'OpenFoodFacts',
        per: '100g'
      }));

      return {
        success: true,
        foods: foods,
        total: data.count || foods.length,
        page: data.page || page
      };

    } catch (error) {
      if(import.meta.env.DEV)console.error('OpenFoodFacts text search error:', error);
      return {
        success: false,
        message: 'Failed to search OpenFoodFacts',
        foods: []
      };
    }
  }

  /**
   * Search foods by text query (for USDA database integration)
   */
  async searchFoodsByText(query) {
    try {
      if (!this.apiKey || this.apiKey === 'DEMO_KEY') {
        // Return demo results if no API key
        return {
          success: true,
          foods: [
            { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
            { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 }
          ]
        };
      }

      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=20&api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('USDA API request failed');
      }

      const data = await response.json();
      
      const foods = data.foods?.map(food => ({
        name: food.description,
        fdcId: food.fdcId,
        calories: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1008)?.value || 0),
        protein: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1003)?.value || 0),
        carbs: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1005)?.value || 0),
        fat: Math.round(food.foodNutrients?.find(n => n.nutrientId === 1004)?.value || 0),
        source: 'USDA'
      })) || [];

      return {
        success: true,
        foods,
        totalResults: data.totalHits
      };

    } catch (error) {
      if(import.meta.env.DEV)console.error('USDA search error:', error);
      return {
        success: false,
        message: 'Failed to search USDA database',
        foods: []
      };
    }
  }

  /**
   * Prepare scanner UI
   */
  prepareScannerUI() {
    return `
      <style>
        .scanner-active {
          --background: transparent;
          --ion-background-color: transparent;
        }
        
        .scanner-ui {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          pointer-events: none;
        }
        
        .scanner-ui.active {
          display: block;
        }
        
        .scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .scanner-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 250px;
          height: 250px;
          border: 2px solid #00ff00;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        }
        
        .scanner-instructions {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        }
      </style>
    `;
  }
}

// Export singleton instance
export const barcodeScannerService = new BarcodeScannerService();
export default barcodeScannerService;



