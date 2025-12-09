// AI Vision Service - Food Recognition & Ingredient Analysis
import geminiService from './geminiService';
import authService from './authService';
import { Camera } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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

      // Call Railway proxy server for Gemini Vision API
      if(import.meta.env.DEV)console.log('📡 Calling Railway server for vision analysis...');
      if(import.meta.env.DEV)console.log('🖼️ Image data length:', imageBase64?.length || 0);
      
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

      if(import.meta.env.DEV)console.log('📥 Railway Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if(import.meta.env.DEV)console.error('❌ Railway Error Response:', errorData);
        const errorMsg = errorData.error || `Server Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if(import.meta.env.DEV)console.log('✅ Railway Response:', JSON.stringify(data).substring(0, 500));
      
      const aiResponse = data.response;
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `API Error: ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]) {
        throw new Error('Invalid API response');
      }
      
      const aiResponse = data.candidates[0]?.content?.parts?.[0]?.text || '';
      
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



