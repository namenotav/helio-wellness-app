const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { a as authService, H as Haptics, I as ImpactStyle, _ as __vitePreload } from "./entry-1767948920134-index.js";
import { C as Camera } from "./chunk-1767948920163-index.js";
var SchemaType;
(function(SchemaType2) {
  SchemaType2["STRING"] = "string";
  SchemaType2["NUMBER"] = "number";
  SchemaType2["INTEGER"] = "integer";
  SchemaType2["BOOLEAN"] = "boolean";
  SchemaType2["ARRAY"] = "array";
  SchemaType2["OBJECT"] = "object";
})(SchemaType || (SchemaType = {}));
var ExecutableCodeLanguage;
(function(ExecutableCodeLanguage2) {
  ExecutableCodeLanguage2["LANGUAGE_UNSPECIFIED"] = "language_unspecified";
  ExecutableCodeLanguage2["PYTHON"] = "python";
})(ExecutableCodeLanguage || (ExecutableCodeLanguage = {}));
var Outcome;
(function(Outcome2) {
  Outcome2["OUTCOME_UNSPECIFIED"] = "outcome_unspecified";
  Outcome2["OUTCOME_OK"] = "outcome_ok";
  Outcome2["OUTCOME_FAILED"] = "outcome_failed";
  Outcome2["OUTCOME_DEADLINE_EXCEEDED"] = "outcome_deadline_exceeded";
})(Outcome || (Outcome = {}));
var HarmCategory;
(function(HarmCategory2) {
  HarmCategory2["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
  HarmCategory2["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
  HarmCategory2["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
  HarmCategory2["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
  HarmCategory2["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
  HarmCategory2["HARM_CATEGORY_CIVIC_INTEGRITY"] = "HARM_CATEGORY_CIVIC_INTEGRITY";
})(HarmCategory || (HarmCategory = {}));
var HarmBlockThreshold;
(function(HarmBlockThreshold2) {
  HarmBlockThreshold2["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
  HarmBlockThreshold2["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
  HarmBlockThreshold2["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
  HarmBlockThreshold2["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
  HarmBlockThreshold2["BLOCK_NONE"] = "BLOCK_NONE";
})(HarmBlockThreshold || (HarmBlockThreshold = {}));
var HarmProbability;
(function(HarmProbability2) {
  HarmProbability2["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
  HarmProbability2["NEGLIGIBLE"] = "NEGLIGIBLE";
  HarmProbability2["LOW"] = "LOW";
  HarmProbability2["MEDIUM"] = "MEDIUM";
  HarmProbability2["HIGH"] = "HIGH";
})(HarmProbability || (HarmProbability = {}));
var BlockReason;
(function(BlockReason2) {
  BlockReason2["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
  BlockReason2["SAFETY"] = "SAFETY";
  BlockReason2["OTHER"] = "OTHER";
})(BlockReason || (BlockReason = {}));
var FinishReason;
(function(FinishReason2) {
  FinishReason2["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
  FinishReason2["STOP"] = "STOP";
  FinishReason2["MAX_TOKENS"] = "MAX_TOKENS";
  FinishReason2["SAFETY"] = "SAFETY";
  FinishReason2["RECITATION"] = "RECITATION";
  FinishReason2["LANGUAGE"] = "LANGUAGE";
  FinishReason2["BLOCKLIST"] = "BLOCKLIST";
  FinishReason2["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
  FinishReason2["SPII"] = "SPII";
  FinishReason2["MALFORMED_FUNCTION_CALL"] = "MALFORMED_FUNCTION_CALL";
  FinishReason2["OTHER"] = "OTHER";
})(FinishReason || (FinishReason = {}));
var TaskType;
(function(TaskType2) {
  TaskType2["TASK_TYPE_UNSPECIFIED"] = "TASK_TYPE_UNSPECIFIED";
  TaskType2["RETRIEVAL_QUERY"] = "RETRIEVAL_QUERY";
  TaskType2["RETRIEVAL_DOCUMENT"] = "RETRIEVAL_DOCUMENT";
  TaskType2["SEMANTIC_SIMILARITY"] = "SEMANTIC_SIMILARITY";
  TaskType2["CLASSIFICATION"] = "CLASSIFICATION";
  TaskType2["CLUSTERING"] = "CLUSTERING";
})(TaskType || (TaskType = {}));
var FunctionCallingMode;
(function(FunctionCallingMode2) {
  FunctionCallingMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
  FunctionCallingMode2["AUTO"] = "AUTO";
  FunctionCallingMode2["ANY"] = "ANY";
  FunctionCallingMode2["NONE"] = "NONE";
})(FunctionCallingMode || (FunctionCallingMode = {}));
var DynamicRetrievalMode;
(function(DynamicRetrievalMode2) {
  DynamicRetrievalMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
  DynamicRetrievalMode2["MODE_DYNAMIC"] = "MODE_DYNAMIC";
})(DynamicRetrievalMode || (DynamicRetrievalMode = {}));
var Task;
(function(Task2) {
  Task2["GENERATE_CONTENT"] = "generateContent";
  Task2["STREAM_GENERATE_CONTENT"] = "streamGenerateContent";
  Task2["COUNT_TOKENS"] = "countTokens";
  Task2["EMBED_CONTENT"] = "embedContent";
  Task2["BATCH_EMBED_CONTENTS"] = "batchEmbedContents";
})(Task || (Task = {}));
[
  FinishReason.RECITATION,
  FinishReason.SAFETY,
  FinishReason.LANGUAGE
];
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
class AIVisionService {
  constructor() {
    this.analyzing = false;
  }
  // Capture photo and analyze food
  async captureFoodPhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 50,
        // Reduced from 80 to compress image
        allowEditing: false,
        resultType: "base64",
        source: "CAMERA",
        width: 1024,
        // Limit image width
        height: 1024
        // Limit image height
      });
      return {
        success: true,
        imageData: photo.base64String,
        format: photo.format
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Analyze food image with Gemini Vision API
  async analyzeFoodImage(imageBase64) {
    if (this.analyzing) {
      return { success: false, error: "Analysis already in progress" };
    }
    try {
      this.analyzing = true;
      const allergenProfile = authService.getUserAllergenProfile();
      if (false) ;
      const prompt = this.buildAnalysisPrompt(allergenProfile);
      if (false) ;
      let aiResponse;
      try {
        if (false) ;
        const response = await fetch(
          "https://helio-wellness-app-production.up.railway.app/api/v1/vision",
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
        if (false) ;
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        const data = await response.json();
        aiResponse = data.response;
        if (false) ;
      } catch (serverError) {
        if (false) ;
        throw new Error("AI analysis service temporarily unavailable. Please check your Railway server.");
      }
      if (false) ;
      if (!aiResponse) {
        throw new Error("Empty response from AI");
      }
      if (false) ;
      const analysis = this.parseAIResponse(aiResponse, allergenProfile);
      if (false) ;
      await this.saveScanResult(analysis);
      await this.triggerSafetyHaptic(analysis.safetyLevel);
      this.analyzing = false;
      if (false) ;
      return {
        success: true,
        analysis
      };
    } catch (error) {
      this.analyzing = false;
      return { success: false, error: error.message };
    }
  }
  // Build detailed analysis prompt
  buildAnalysisPrompt(allergenProfile) {
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
      prompt += `
   USER'S ALLERGENS: ${allergens.join(", ")}`;
    }
    if (intolerances && intolerances.length > 0) {
      prompt += `
   USER'S INTOLERANCES: ${intolerances.join(", ")}`;
    }
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      prompt += `
   USER'S DIET: ${dietaryPreferences.join(", ")}`;
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
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      const safety = this.determineSafety(parsed, allergenProfile);
      return {
        foodName: parsed.foodName || "Unknown Food",
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
      return {
        foodName: "Analysis Complete",
        ingredients: [],
        detectedAllergens: [],
        safetyLevel: "unknown",
        safetyColor: "#FFA500",
        safetyIcon: "❓",
        safetyMessage: "Unable to parse full analysis. Please review manually.",
        alternatives: [],
        confidence: 0,
        rawAnalysis: aiResponse
      };
    }
  }
  // Determine safety level and presentation
  determineSafety(parsed, allergenProfile) {
    if (!allergenProfile) {
      allergenProfile = { allergens: [], allergenSeverity: {} };
    }
    const { allergens = [], allergenSeverity = {} } = allergenProfile;
    const detectedAllergens = parsed.detectedAllergens || [];
    const severeMatch = detectedAllergens.find((detected) => {
      const allergen = detected.name.toLowerCase();
      return allergens.some((userAllergen) => {
        const match = allergen.includes(userAllergen.toLowerCase());
        const severity = allergenSeverity[userAllergen];
        return match && severity === "severe";
      });
    });
    if (severeMatch) {
      return {
        level: "danger",
        color: "#FF4444",
        icon: "🚫",
        message: `DANGER: Contains ${severeMatch.name.toUpperCase()} - Your severe allergen!`
      };
    }
    const moderateMatch = detectedAllergens.find((detected) => {
      const allergen = detected.name.toLowerCase();
      return allergens.some(
        (userAllergen) => allergen.includes(userAllergen.toLowerCase())
      );
    });
    if (moderateMatch) {
      return {
        level: "caution",
        color: "#FFA500",
        icon: "⚠️",
        message: `CAUTION: Contains ${moderateMatch.name} - Your allergen`
      };
    }
    return {
      level: "safe",
      color: "#44FF44",
      icon: "✅",
      message: "SAFE: No detected allergens for your profile"
    };
  }
  // Trigger haptic feedback based on safety
  async triggerSafetyHaptic(safetyLevel) {
    try {
      switch (safetyLevel) {
        case "danger":
          await Haptics.impact({ style: ImpactStyle.Heavy });
          await new Promise((resolve) => setTimeout(resolve, 100));
          await Haptics.impact({ style: ImpactStyle.Heavy });
          await new Promise((resolve) => setTimeout(resolve, 100));
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case "caution":
          await Haptics.impact({ style: ImpactStyle.Medium });
          await new Promise((resolve) => setTimeout(resolve, 150));
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case "safe":
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
      }
    } catch (error) {
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
      if (false) ;
      let halalData;
      try {
        console.log("🕌 Halal analysis starting...");
        console.log("📏 Prompt length:", prompt.length);
        console.log("🖼️ Image data length:", imageBase64.length);
        const response = await fetch(
          "https://helio-wellness-app-production.up.railway.app/api/v1/vision",
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
        console.log("📥 Railway Response Status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Server error response:", errorText);
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        const aiResponse = data.response;
        console.log("✅ Railway Halal analysis successful");
        const cleanResponse = aiResponse.replace(/```json\n?|```\n?/g, "").trim();
        console.log("🔍 Raw AI response for Halal:", cleanResponse.substring(0, 300));
        halalData = JSON.parse(cleanResponse);
      } catch (error) {
        console.error("❌ Halal analysis failed:", error);
        console.error("Error details:", error.message);
        throw new Error("Halal analysis failed: " + error.message);
      }
      if (!halalData.halalStatus) {
        console.error("❌ AI response missing halalStatus field!");
        console.error("Response structure:", Object.keys(halalData));
        if (halalData.foodName || halalData.safetyLevel || halalData.detectedAllergens) {
          throw new Error("Error: AI returned food analysis instead of Halal status. This is a pork product and should show HARAM. Please try scanning again.");
        }
        throw new Error("Could not determine Halal status. Please ensure the product label is clearly visible and try again.");
      }
      return {
        success: true,
        analysis: {
          halalStatus: halalData.halalStatus,
          confidence: halalData.confidence || 85,
          haramIngredients: halalData.haramIngredients || [],
          doubtfulIngredients: halalData.doubtfulIngredients || [],
          eCodes: halalData.eCodes || [],
          certifications: halalData.certifications || [],
          crossContamination: halalData.crossContamination || "Unknown",
          recommendation: halalData.recommendation || "Consult with a Halal authority for confirmation",
          details: halalData.details || "Analysis completed"
        }
      };
    } catch (error) {
      console.error("Halal analysis error:", error);
      return {
        success: false,
        error: error.message || "Failed to analyze Halal status"
      };
    }
  }
  // Analyze ingredient label (OCR + analysis)
  async analyzeIngredientLabel(imageBase64) {
    try {
      const allergenProfile = authService.getUserAllergenProfile();
      const prompt = `Read and analyze this ingredient label. Extract ALL ingredients and check against user's allergen profile.

USER'S ALLERGENS: ${allergenProfile.allergens?.join(", ") || "None"}
USER'S INTOLERANCES: ${allergenProfile.intolerances?.join(", ") || "None"}

Provide:
1. ALL INGREDIENTS: Complete list extracted from label
2. ALLERGEN WARNINGS: Any "contains" or "may contain" statements
3. DETECTED RISKS: Which of user's allergens are present
4. HIDDEN ALLERGENS: Alternative names found (e.g., "whey" = dairy, "albumin" = egg)
5. SAFETY VERDICT: safe/caution/danger

Return as JSON with same format as food analysis.`;
      let aiResponse;
      try {
        if (false) ;
        const response = await fetch(
          "https://helio-wellness-app-production.up.railway.app/api/v1/vision",
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
          throw new Error(`Server returned ${response.status}`);
        }
        const data = await response.json();
        aiResponse = data.response;
        if (false) ;
      } catch (serverError) {
        if (false) ;
        throw new Error("AI analysis service temporarily unavailable. Please check your internet connection and try again.");
      }
      if (!aiResponse) {
        throw new Error("Empty AI response");
      }
      const analysis = this.parseAIResponse(aiResponse, allergenProfile);
      await this.triggerSafetyHaptic(analysis.safetyLevel);
      return { success: true, analysis };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Quick allergen check (text-based)
  async checkIngredientText(ingredientText) {
    const allergenProfile = authService.getUserAllergenProfile();
    const { allergens, intolerances } = allergenProfile;
    const allRestrictions = [...allergens || [], ...intolerances || []];
    const detected = [];
    allRestrictions.forEach((restriction) => {
      const regex = new RegExp(restriction, "i");
      if (regex.test(ingredientText)) {
        detected.push(restriction);
      }
    });
    const hiddenNames = {
      dairy: ["whey", "casein", "lactose", "milk powder", "cream", "butter", "ghee"],
      egg: ["albumin", "ovalbumin", "lysozyme", "meringue", "surimi"],
      soy: ["lecithin", "tofu", "tempeh", "miso", "shoyu", "tamari"],
      gluten: ["wheat", "barley", "rye", "malt", "seitan", "bulgur"],
      nuts: ["almond", "cashew", "pistachio", "walnut", "pecan", "hazelnut"]
    };
    Object.entries(hiddenNames).forEach(([allergen, aliases]) => {
      if (allergens?.includes(allergen)) {
        aliases.forEach((alias) => {
          const regex = new RegExp(alias, "i");
          if (regex.test(ingredientText) && !detected.includes(allergen)) {
            detected.push(`${allergen} (found as "${alias}")`);
          }
        });
      }
    });
    return {
      safe: detected.length === 0,
      detectedAllergens: detected,
      safetyLevel: detected.length === 0 ? "safe" : "caution"
    };
  }
  // Save scan result to storage and sync
  async saveScanResult(analysis) {
    try {
      const scanData = {
        foodName: analysis.foodName,
        calories: analysis.nutrition?.calories || 0,
        safetyLevel: analysis.safetyLevel,
        timestamp: Date.now(),
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
      const existing = JSON.parse(localStorage.getItem("foodScans") || "[]");
      existing.push(scanData);
      localStorage.setItem("foodScans", JSON.stringify(existing));
      const syncService = (await __vitePreload(async () => {
        const { default: __vite_default__ } = await import("./entry-1767948920134-index.js").then((n) => n.a4);
        return { default: __vite_default__ };
      }, true ? __vite__mapDeps([0,1]) : void 0)).default;
      await syncService.syncNutrition(scanData);
      if (false) ;
    } catch (error) {
    }
  }
}
const aiVisionService = new AIVisionService();
export {
  aiVisionService as a
};
