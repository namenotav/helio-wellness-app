// AI Vision Service - Food Recognition & Ingredient Analysis
import geminiService from './geminiService';
import authService from './authService';
import { Camera } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GoogleGenerativeAI } from '@google/generative-ai';

class AIVisionService {
  constructor() {
    // All API calls proxied through secure Railway server
    this.analyzing = false;
  }

  // Capture photo and analyze food
  async captureFoodPhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 50,  // Reduced from 80 to compress image
        allowEditing: false,
        resultType: 'base64',
        source: 'CAMERA',
        width: 1024,  // Limit image width
        height: 1024  // Limit image height
      });

      return {
        success: true,
        imageData: photo.base64String,
        format: photo.format
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Camera capture error:', error);
      return { success: false, error: error.message };
    }
  }

  // Analyze food image with Gemini Vision API
  async analyzeFoodImage(imageBase64) {
    if (this.analyzing) {
      return { success: false, error: 'Analysis already in progress' };
    }

    try {
      this.analyzing = true;

      // Get user's allergen profile
      const allergenProfile = authService.getUserAllergenProfile();
      if(import.meta.env.DEV)console.log('🔍 Allergen Profile:', allergenProfile);
      
      // Build detailed prompt for Gemini
      const prompt = this.buildAnalysisPrompt(allergenProfile);
      if(import.meta.env.DEV)console.log('📝 Analysis Prompt:', prompt.substring(0, 200) + '...');

      // Try Railway proxy server first, fallback to direct API call
      let aiResponse;
      
      try {
        if(import.meta.env.DEV)console.log('📡 Trying Railway server for vision analysis...');
        
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

        if(import.meta.env.DEV)console.log('📥 Railway Response Status:', response.status);

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        aiResponse = data.response;
        if(import.meta.env.DEV)console.log('✅ Railway server success');
        
      } catch (serverError) {
        // Fallback to direct Gemini API call
        if(import.meta.env.DEV)console.warn('⚠️ Railway server failed, using direct API:', serverError.message);
        
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) {
          throw new Error('API key not configured');
        }
        
        const directResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: 'image/jpeg', data: imageBase64 }}
                ]
              }]
            })
          }
        );

        if (!directResponse.ok) {
          const errorData = await directResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API Error: ${directResponse.status}`);
        }

        const directData = await directResponse.json();
        aiResponse = directData.candidates?.[0]?.content?.parts?.[0]?.text;
        if(import.meta.env.DEV)console.log('✅ Direct API success');
      }
      if(import.meta.env.DEV)console.log('🤖 AI Response Text:', aiResponse?.substring(0, 300) + '...');
      
      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }

      // Parse AI response
      if(import.meta.env.DEV)console.log('🔄 Parsing AI response...');
      const analysis = this.parseAIResponse(aiResponse, allergenProfile);
      if(import.meta.env.DEV)console.log('✅ Parsed analysis:', {
        foodName: analysis.foodName,
        safetyLevel: analysis.safetyLevel,
        detectedAllergens: analysis.detectedAllergens?.length || 0,
        confidence: analysis.confidence
      });

      // Trigger haptic feedback based on safety level
      await this.triggerSafetyHaptic(analysis.safetyLevel);

      this.analyzing = false;
      if(import.meta.env.DEV)console.log('🎉 Analysis complete! Returning success.');
      return {
        success: true,
        analysis
      };

    } catch (error) {
      if(import.meta.env.DEV)console.error('Food analysis error:', error);
      this.analyzing = false;
      return { success: false, error: error.message };
    }
  }

  // Build detailed analysis prompt
  buildAnalysisPrompt(allergenProfile) {
    // Handle null or undefined allergen profile
    if (!allergenProfile) {
      allergenProfile = { allergens: [], intolerances: [], dietaryPreferences: [] };
    }
    
    const { allergens = [], intolerances = [], dietaryPreferences = [] } = allergenProfile;

    let prompt = `Analyze this food image in detail. Provide:

1. FOOD NAME: What is this dish called?
2. MAIN INGREDIENTS: List all visible ingredients
3. LIKELY HIDDEN INGREDIENTS: Common ingredients not visible (sauces, seasonings, etc.)
4. ALLERGEN ANALYSIS: Check for these allergens:`;

    if (allergens && allergens.length > 0) {
      prompt += `\n   USER'S ALLERGENS: ${allergens.join(', ')}`;
    }

    if (intolerances && intolerances.length > 0) {
      prompt += `\n   USER'S INTOLERANCES: ${intolerances.join(', ')}`;
    }

    if (dietaryPreferences && dietaryPreferences.length > 0) {
      prompt += `\n   USER'S DIET: ${dietaryPreferences.join(', ')}`;
    }

    prompt += `

5. SAFETY ASSESSMENT: Rate as SAFE, CAUTION, or DANGER
6. DETECTED ALLERGENS: List any allergens found with severity
7. ALTERNATIVES: Suggest how to make this safe (remove/substitute ingredients)
8. CONFIDENCE: How confident are you in this analysis? (0-100%)

Format your response as JSON:
{
  "foodName": "name",
  "ingredients": ["ingredient1", "ingredient2"],
  "hiddenIngredients": ["hidden1", "hidden2"],
  "detectedAllergens": [{"name": "allergen", "confidence": "high/medium/low", "location": "where found"}],
  "safetyLevel": "safe|caution|danger",
  "safetyExplanation": "why safe or unsafe",
  "alternatives": ["suggestion1", "suggestion2"],
  "confidence": 85
}`;

    return prompt;
  }

  // Parse AI response into structured data
  parseAIResponse(aiResponse, allergenProfile) {
    try {
      // Extract JSON from response (AI might add extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Determine overall safety
      const safety = this.determineSafety(parsed, allergenProfile);

      return {
        foodName: parsed.foodName || 'Unknown Food',
        ingredients: parsed.ingredients || [],
        hiddenIngredients: parsed.hiddenIngredients || [],
        detectedAllergens: parsed.detectedAllergens || [],
        safetyLevel: safety.level,
        safetyColor: safety.color,
        safetyIcon: safety.icon,
        safetyMessage: safety.message,
        alternatives: parsed.alternatives || [],
        confidence: parsed.confidence || 50,
        rawAnalysis: aiResponse
      };

    } catch (error) {
      if(import.meta.env.DEV)console.error('Response parsing error:', error);
      
      // Fallback: Return raw text analysis
      return {
        foodName: 'Analysis Complete',
        ingredients: [],
        detectedAllergens: [],
        safetyLevel: 'unknown',
        safetyColor: '#FFA500',
        safetyIcon: '❓',
        safetyMessage: 'Unable to parse full analysis. Please review manually.',
        alternatives: [],
        confidence: 0,
        rawAnalysis: aiResponse
      };
    }
  }

  // Determine safety level and presentation
  determineSafety(parsed, allergenProfile) {
    // Handle null profile
    if (!allergenProfile) {
      allergenProfile = { allergens: [], allergenSeverity: {} };
    }
    
    const { allergens = [], allergenSeverity = {} } = allergenProfile;
    const detectedAllergens = parsed.detectedAllergens || [];

    // Check for severe allergens
    const severeMatch = detectedAllergens.find(detected => {
      const allergen = detected.name.toLowerCase();
      return allergens.some(userAllergen => {
        const match = allergen.includes(userAllergen.toLowerCase());
        const severity = allergenSeverity[userAllergen];
        return match && severity === 'severe';
      });
    });

    if (severeMatch) {
      return {
        level: 'danger',
        color: '#FF4444',
        icon: '🚫',
        message: `DANGER: Contains ${severeMatch.name.toUpperCase()} - Your severe allergen!`
      };
    }

    // Check for moderate allergens
    const moderateMatch = detectedAllergens.find(detected => {
      const allergen = detected.name.toLowerCase();
      return allergens.some(userAllergen => 
        allergen.includes(userAllergen.toLowerCase())
      );
    });

    if (moderateMatch) {
      return {
        level: 'caution',
        color: '#FFA500',
        icon: '⚠️',
        message: `CAUTION: Contains ${moderateMatch.name} - Your allergen`
      };
    }

    // Safe
    return {
      level: 'safe',
      color: '#44FF44',
      icon: '✅',
      message: 'SAFE: No detected allergens for your profile'
    };
  }

  // Trigger haptic feedback based on safety
  async triggerSafetyHaptic(safetyLevel) {
    try {
      switch (safetyLevel) {
        case 'danger':
          // Strong alert pattern
          await Haptics.impact({ style: ImpactStyle.Heavy });
          await new Promise(resolve => setTimeout(resolve, 100));
          await Haptics.impact({ style: ImpactStyle.Heavy });
          await new Promise(resolve => setTimeout(resolve, 100));
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        
        case 'caution':
          // Medium warning
          await Haptics.impact({ style: ImpactStyle.Medium });
          await new Promise(resolve => setTimeout(resolve, 150));
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        
        case 'safe':
          // Light success
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
      }
    } catch (error) {
      if(import.meta.env.DEV)console.log('Haptics not available:', error);
    }
  }

  // Analyze Halal status (comprehensive Islamic dietary verification)
  async analyzeHalalStatus(imageBase64) {
    try {
      const prompt = `🕌 HALAL STATUS ANALYSIS ONLY - DO NOT PERFORM FOOD SAFETY ANALYSIS

You are a Halal certification expert analyzing this product for Islamic dietary compliance.

⚠️ CRITICAL: You MUST return ONLY Halal status analysis. DO NOT analyze allergens, food safety, or nutritional content.

**YOUR TASK:**
Analyze this food product label ONLY for Islamic dietary compliance (Halal/Haram status).

**HARAM INGREDIENTS** (strictly forbidden):

1. **PORK/SWINE PRODUCTS:**
   - Pork, bacon, ham, salami (pork), pepperoni (pork), chorizo (pork)
   - Lard, pork fat, pancetta, prosciutto, sausage (pork), chicharrones
   - Pork gelatin, pork collagen, pork enzymes
   - Bacon bits, bacon flavoring, ham flavoring

2. **ALCOHOL & DERIVATIVES:**
   - Wine, beer, vodka, rum, whiskey, gin, tequila, liqueur
   - Cooking wine, rice wine, mirin, sake, sherry
   - Vanilla extract (alcohol-based), rum extract, brandy extract
   - Beer batter, wine vinegar (with alcohol), alcoholic beverages
   - Ethanol, ethyl alcohol (as ingredient, not trace from fermentation)

3. **BLOOD PRODUCTS:**
   - Blood sausage, black pudding, blood cake, morcilla, boudin noir
   - Any product containing animal blood

4. **MEAT FROM FORBIDDEN ANIMALS:**
   - Carnivores: dog, cat, lion, tiger, wolf, bear, hyena
   - Donkey, mule, horse (according to some schools)
   - Birds of prey: eagle, hawk, falcon, vulture, owl
   - Reptiles: snake, crocodile, alligator, turtle, lizard, frog
   - Amphibians: frog, toad, salamander

5. **INSECTS** (except locust/grasshopper):
   - Crickets, mealworms, ants, bees, wasps, beetles
   - Cochineal/Carmine (E120 - crushed beetles for red coloring)
   - Any insect-based protein or flavoring

6. **IMPROPER SLAUGHTER:**
   - Meat not slaughtered with Islamic method (no Bismillah)
   - Carrion, roadkill, dead animals, strangled animals
   - Stunned animals (not properly slaughtered after)

**DOUBTFUL/MUSHBOOH** (needs source verification):

1. **ANIMAL-DERIVED (unknown source):**
   - Gelatin (beef or pork? Check source)
   - Rennet (animal or microbial?)
   - Enzymes (animal, plant, or microbial?)
   - Lipase, pepsin, trypsin (animal source?)
   - Whey (if cheese made with animal rennet)
   - L-cysteine (may be from human/pig hair or synthetic)
   - Tallow, suet, animal fat, animal shortening

2. **E-CODES** (potentially animal-derived):
   - E120 (Carmine/Cochineal - beetle extract) ❌ HARAM
   - E441 (Gelatin - pork or beef?) ⚠️ VERIFY
   - E471, E472 (Mono/Diglycerides - animal or plant fat?) ⚠️ VERIFY
   - E322 (Lecithin - soy or egg?) ⚠️ VERIFY
   - E542 (Bone phosphate - animal bones) ⚠️ VERIFY
   - E631, E627 (Disodium inosinate/guanylate - pork or synthetic?) ⚠️ VERIFY
   - E904 (Shellac - insect secretion) ❌ HARAM (some schools)
   - E1105 (Lysozyme - from egg, usually acceptable)

3. **AMBIGUOUS ADDITIVES:**
   - Natural flavors (may contain alcohol or animal derivatives)
   - Artificial flavors (source unclear)
   - Emulsifiers (animal or plant source?)
   - Stabilizers (animal or plant?)
   - Glycerin/Glycerol (animal fat or vegetable?)
   - Stearic acid (animal or plant?)

**E-CODES TO FLAG AS HARAM:**
E120 (insect-based), E441 (gelatin), E904 (shellac from insects)

**E-CODES TO FLAG AS DOUBTFUL:**
E471, E472, E542, E322, E631, E627 (need source verification)

**HALAL CERTIFICATIONS:**
Look for Halal logos: JAKIM, MUI, HFA, IFANCA, Islamic symbols

**CROSS-CONTAMINATION:**
"May contain" warnings, shared facilities

⚠️ YOU MUST RETURN THIS EXACT JSON STRUCTURE:
{
  "halalStatus": "halal" | "haram" | "doubtful" | "uncertain",
  "confidence": 85,
  "haramIngredients": ["Pork - Pig meat is strictly forbidden in Islam"],
  "doubtfulIngredients": ["Gelatin - Source not specified"],
  "eCodes": ["E441 - Gelatin from animal source"],
  "certifications": ["No Halal certification found"],
  "crossContamination": "May contain traces of alcohol",
  "recommendation": "NOT PERMISSIBLE for Muslim consumption",
  "details": "Product contains haram ingredients"
}

⚠️ DO NOT return foodName, safetyLevel, or detectedAllergens. ONLY return halalStatus data.`;

      // BYPASS RAILWAY - Go directly to Gemini API for Halal analysis
      if(import.meta.env.DEV)console.log('🕌 Using direct Gemini API for Halal analysis (bypassing Railway)...');
      
      // Create Gemini model directly using API key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please check your .env file.');
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const imagePart = {
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: 'image/jpeg'
        }
      };
      
      const result = await model.generateContent([prompt, imagePart]);
      const aiResponse = result.response.text();
      if(import.meta.env.DEV)console.log('✅ Direct Gemini Halal analysis successful');

      // Parse AI response
      const cleanResponse = aiResponse.replace(/```json\n?|```\n?/g, '').trim();
      if(import.meta.env.DEV)console.log('🔍 Raw AI response for Halal:', cleanResponse.substring(0, 300));
      
      const halalData = JSON.parse(cleanResponse);
      
      // CRITICAL VALIDATION: Detect if AI returned wrong data format
      if (!halalData.halalStatus) {
        console.error('❌ AI response missing halalStatus field!');
        console.error('Response structure:', Object.keys(halalData));
        
        if (halalData.foodName || halalData.safetyLevel || halalData.detectedAllergens) {
          throw new Error('Error: AI returned food analysis instead of Halal status. This is a pork product and should show HARAM. Please try scanning again.');
        }
        
        throw new Error('Could not determine Halal status. Please ensure the product label is clearly visible and try again.');
      }

      // Format for display
      return {
        success: true,
        analysis: {
          halalStatus: halalData.halalStatus,
          confidence: halalData.confidence || 85,
          haramIngredients: halalData.haramIngredients || [],
          doubtfulIngredients: halalData.doubtfulIngredients || [],
          eCodes: halalData.eCodes || [],
          certifications: halalData.certifications || [],
          crossContamination: halalData.crossContamination || 'Unknown',
          recommendation: halalData.recommendation || 'Consult with a Halal authority for confirmation',
          details: halalData.details || 'Analysis completed'
        }
      };

    } catch (error) {
      console.error('Halal analysis error:', error);
      return {
        success: false,
        error: error.message || 'Failed to analyze Halal status'
      };
    }
  }

  // Analyze ingredient label (OCR + analysis)
  async analyzeIngredientLabel(imageBase64) {
    try {
      const allergenProfile = authService.getUserAllergenProfile();

      const prompt = `Read and analyze this ingredient label. Extract ALL ingredients and check against user's allergen profile.

USER'S ALLERGENS: ${allergenProfile.allergens?.join(', ') || 'None'}
USER'S INTOLERANCES: ${allergenProfile.intolerances?.join(', ') || 'None'}

Provide:
1. ALL INGREDIENTS: Complete list extracted from label
2. ALLERGEN WARNINGS: Any "contains" or "may contain" statements
3. DETECTED RISKS: Which of user's allergens are present
4. HIDDEN ALLERGENS: Alternative names found (e.g., "whey" = dairy, "albumin" = egg)
5. SAFETY VERDICT: safe/caution/danger

Return as JSON with same format as food analysis.`;

      // Try Railway server first, fallback to direct API
      let aiResponse;
      
      try {
        if(import.meta.env.DEV)console.log('📡 Trying Railway server for Halal analysis...');
        
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
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        aiResponse = data.response;
        if(import.meta.env.DEV)console.log('✅ Railway server success');
        
      } catch (serverError) {
        // Fallback to direct Gemini API call
        if(import.meta.env.DEV)console.warn('⚠️ Railway server failed, using direct API:', serverError.message);
        
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) {
          throw new Error('API key not configured');
        }
        
        const directResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: 'image/jpeg', data: imageBase64 }}
                ]
              }]
            })
          }
        );

        if (!directResponse.ok) {
          const errorData = await directResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API Error: ${directResponse.status}`);
        }

        const directData = await directResponse.json();
        aiResponse = directData.candidates?.[0]?.content?.parts?.[0]?.text;
        if(import.meta.env.DEV)console.log('✅ Direct API success');
      }
      
      if (!aiResponse) {
        throw new Error('Empty AI response');
      }
      
      const analysis = this.parseAIResponse(aiResponse, allergenProfile);

      await this.triggerSafetyHaptic(analysis.safetyLevel);

      return { success: true, analysis };

    } catch (error) {
      if(import.meta.env.DEV)console.error('Label analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  // Quick allergen check (text-based)
  async checkIngredientText(ingredientText) {
    const allergenProfile = authService.getUserAllergenProfile();
    const { allergens, intolerances } = allergenProfile;

    const allRestrictions = [...(allergens || []), ...(intolerances || [])];
    const detected = [];

    // Simple text matching
    allRestrictions.forEach(restriction => {
      const regex = new RegExp(restriction, 'i');
      if (regex.test(ingredientText)) {
        detected.push(restriction);
      }
    });

    // Check for common hidden names
    const hiddenNames = {
      dairy: ['whey', 'casein', 'lactose', 'milk powder', 'cream', 'butter', 'ghee'],
      egg: ['albumin', 'ovalbumin', 'lysozyme', 'meringue', 'surimi'],
      soy: ['lecithin', 'tofu', 'tempeh', 'miso', 'shoyu', 'tamari'],
      gluten: ['wheat', 'barley', 'rye', 'malt', 'seitan', 'bulgur'],
      nuts: ['almond', 'cashew', 'pistachio', 'walnut', 'pecan', 'hazelnut']
    };

    Object.entries(hiddenNames).forEach(([allergen, aliases]) => {
      if (allergens?.includes(allergen)) {
        aliases.forEach(alias => {
          const regex = new RegExp(alias, 'i');
          if (regex.test(ingredientText) && !detected.includes(allergen)) {
            detected.push(`${allergen} (found as "${alias}")`);
          }
        });
      }
    });

    return {
      safe: detected.length === 0,
      detectedAllergens: detected,
      safetyLevel: detected.length === 0 ? 'safe' : 'caution'
    };
  }
}

export const aiVisionService = new AIVisionService();
export default aiVisionService;



