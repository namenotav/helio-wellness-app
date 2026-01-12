import { C as Capacitor, B as BarcodeScanner } from "./entry-1767948920134-index.js";
import { C as Camera } from "./chunk-1767948920163-index.js";
class BarcodeScannerService {
  constructor() {
    this.isScanning = false;
    this.apiKey = "DEMO_KEY";
    this.scanMode = "live";
  }
  /**
   * Check if barcode scanner is available
   */
  async checkPermission() {
    try {
      if (!Capacitor.isNativePlatform()) {
        return { granted: false, message: "Barcode scanning only available on mobile devices" };
      }
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        return { granted: true };
      }
      if (status.denied) {
        return { granted: false, message: "Camera permission denied. Enable in Settings." };
      }
      const permission = await BarcodeScanner.requestPermission();
      return { granted: permission.granted };
    } catch (error) {
      return { granted: false, message: error.message };
    }
  }
  /**
   * Capture barcode photo using native camera (works like Food Scanner)
   */
  async captureBarcode() {
    try {
      if (false) ;
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: "base64",
        source: "CAMERA",
        width: 1920,
        height: 1920,
        promptLabelHeader: "Scan Barcode",
        promptLabelPhoto: "Take Photo",
        promptLabelPicture: "From Gallery"
      });
      if (false) ;
      return {
        success: true,
        imageData: photo.base64String,
        format: photo.format
      };
    } catch (error) {
      if (error.message.includes("cancel")) {
        return { success: false, cancelled: true, message: "Scan cancelled" };
      }
      return { success: false, error: error.message };
    }
  }
  /**
   * Extract barcode from image using Gemini Vision AI
   */
  async scanBarcodeFromImage(imageBase64) {
    try {
      if (false) ;
      const prompt = `You are a barcode scanner. Analyze this image and extract the barcode number.

CRITICAL INSTRUCTIONS:
1. Look for UPC, EAN, or any numeric barcode
2. Return ONLY the barcode number, nothing else
3. If multiple barcodes, return the largest/most prominent one
4. If no barcode found, return "NO_BARCODE"

Return format: Just the barcode number (e.g., "012345678901")`;
      const response = await fetch(
        "https://helio-wellness-app-production.up.railway.app/api/vision",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            prompt,
            imageData: imageBase64
          }),
          mode: "cors"
        }
      );
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }
      const data = await response.json();
      const barcode = data.analysis?.trim();
      if (!barcode || barcode === "NO_BARCODE") {
        return { success: false, message: "No barcode detected in image" };
      }
      const cleanBarcode = barcode.replace(/[^0-9]/g, "");
      if (cleanBarcode.length < 8) {
        return { success: false, message: "Invalid barcode detected" };
      }
      if (false) ;
      return {
        success: true,
        barcode: cleanBarcode
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  /**
   * Start barcode scanning - uses live scanning for best accuracy
   */
  async startScan(timeoutMs = 3e4) {
    try {
      return await this.startLiveScan(timeoutMs);
    } catch (error) {
      throw error;
    }
  }
  /**
   * LEGACY: Live barcode scanning (kept for fallback, not used by default)
   */
  async startLiveScan(timeoutMs = 3e4) {
    try {
      const permission = await this.checkPermission();
      if (!permission.granted) {
        throw new Error(permission.message || "Camera permission required");
      }
      if (false) ;
      await BarcodeScanner.prepare();
      await BarcodeScanner.hideBackground();
      document.body.classList.add("barcode-scanning-active");
      document.querySelector("html")?.classList.add("barcode-scanning-active");
      this.isScanning = true;
      const scanPromise = BarcodeScanner.startScan();
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Scan timeout - please try again")), timeoutMs)
      );
      const result = await Promise.race([scanPromise, timeoutPromise]);
      this.stopScan();
      if (result.hasContent) {
        if (false) ;
        return {
          success: true,
          barcode: result.content,
          format: result.format
        };
      }
      return { success: false, message: "No barcode detected" };
    } catch (error) {
      this.stopScan();
      throw error;
    }
  }
  /**
   * Stop scanning and cleanup
   */
  stopScan() {
    this.isScanning = false;
    try {
      BarcodeScanner.stopScan();
      BarcodeScanner.showBackground();
      document.body.classList.remove("barcode-scanning-active");
      document.querySelector("html")?.classList.remove("barcode-scanning-active");
      void document.body.offsetHeight;
    } catch (error) {
    }
  }
  /**
   * Lookup food by barcode using OpenFoodFacts API
   */
  async lookupFoodByBarcode(barcode) {
    try {
      if (false) ;
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          success: true,
          food: {
            name: product.product_name || "Unknown Product",
            brand: product.brands || "",
            barcode,
            calories: Math.round(product.nutriments?.["energy-kcal_100g"] || 0),
            protein: Math.round(product.nutriments?.proteins_100g || 0),
            carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
            fat: Math.round(product.nutriments?.fat_100g || 0),
            fiber: Math.round(product.nutriments?.fiber_100g || 0),
            sugar: Math.round(product.nutriments?.sugars_100g || 0),
            sodium: Math.round(product.nutriments?.sodium_100g || 0),
            servingSize: product.serving_size || "100g",
            image: product.image_url || product.image_front_url || "",
            ingredients: product.ingredients_text || "",
            source: "OpenFoodFacts"
          }
        };
      }
      if (this.apiKey && this.apiKey !== "DEMO_KEY") {
        return await this.lookupUSDAByBarcode(barcode);
      }
      return {
        success: false,
        message: "Product not found in database"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to lookup product"
      };
    }
  }
  /**
   * Lookup via USDA FoodData Central (backup method)
   */
  async lookupUSDAByBarcode(barcode) {
    try {
      return {
        success: false,
        message: "Product not found in USDA database"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to lookup in USDA database"
      };
    }
  }
  /**
   * Search OpenFoodFacts by text query (6M+ foods, free API)
   */
  async searchOpenFoodFactsByText(query, page = 1) {
    try {
      if (false) ;
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=25&json=1&fields=product_name,nutriments,serving_size,brands,image_url,code`
      );
      if (!response.ok) {
        throw new Error("OpenFoodFacts API request failed");
      }
      const data = await response.json();
      if (!data.products || data.products.length === 0) {
        return {
          success: false,
          message: "No foods found",
          foods: []
        };
      }
      const foods = data.products.map((product) => ({
        name: product.product_name || "Unknown Product",
        brand: product.brands || "",
        barcode: product.code || "",
        calories: Math.round(product.nutriments?.["energy-kcal_100g"] || 0),
        protein: Math.round((product.nutriments?.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((product.nutriments?.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((product.nutriments?.fat_100g || 0) * 10) / 10,
        serving_size: product.serving_size || "100g",
        image_url: product.image_url || "",
        source: "OpenFoodFacts",
        per: "100g"
      }));
      return {
        success: true,
        foods,
        total: data.count || foods.length,
        page: data.page || page
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to search OpenFoodFacts",
        foods: []
      };
    }
  }
  /**
   * Search foods by text query (for USDA database integration)
   */
  async searchFoodsByText(query) {
    try {
      if (!this.apiKey || this.apiKey === "DEMO_KEY") {
        return {
          success: true,
          foods: [
            { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
            { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 }
          ]
        };
      }
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=20&api_key=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error("USDA API request failed");
      }
      const data = await response.json();
      const foods = data.foods?.map((food) => ({
        name: food.description,
        fdcId: food.fdcId,
        calories: Math.round(food.foodNutrients?.find((n) => n.nutrientId === 1008)?.value || 0),
        protein: Math.round(food.foodNutrients?.find((n) => n.nutrientId === 1003)?.value || 0),
        carbs: Math.round(food.foodNutrients?.find((n) => n.nutrientId === 1005)?.value || 0),
        fat: Math.round(food.foodNutrients?.find((n) => n.nutrientId === 1004)?.value || 0),
        source: "USDA"
      })) || [];
      return {
        success: true,
        foods,
        totalResults: data.totalHits
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to search USDA database",
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
const barcodeScannerService = new BarcodeScannerService();
export {
  barcodeScannerService,
  barcodeScannerService as default
};
