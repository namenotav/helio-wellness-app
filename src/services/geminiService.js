// Gemini AI Service Configuration

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
// Get API key from environment variable or use placeholder
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
const genAI = new GoogleGenerativeAI(API_KEY);

// Get Gemini Pro model (text-only)
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// Get Gemini Pro Vision model (text + images) - 2.5 Flash supports multimodal
export const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// AI Wellness Coach - Chat with personalized advice
export const chatWithAI = async (userMessage, userContext = {}) => {
  try {
    console.log('API Key exists:', !!API_KEY);
    console.log('API Key starts with:', API_KEY.substring(0, 10));
    
    const model = getGeminiModel();
    
    // Build context-aware prompt
    const systemPrompt = `You are a supportive AI wellness coach specializing in fitness, nutrition, and mental health. 
You provide personalized, encouraging advice. Keep responses concise and actionable.

User Context:
- Goals: ${userContext.goals || 'Not set'}
- Current streak: ${userContext.streak || 0} days
- Recent activity: ${userContext.recentActivity || 'None'}

User Question: ${userMessage}

Respond in a friendly, motivating tone. Give specific, practical advice.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Full Error:', error);
    console.error('Error details:', error.message, error.status);
    return `Error: ${error.message || "I'm having trouble connecting right now. Please try again in a moment!"}`;
  }
};

// Analyze Progress Photos - AI body composition analysis
export const analyzeProgressPhoto = async (imageFile) => {
  try {
    const model = getGeminiVisionModel();
    
    // Convert image to base64
    const imageData = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this progress photo for fitness tracking. Provide:
1. Observable physical changes or current state
2. Areas of visible progress (if comparing to baseline)
3. Encouraging feedback
4. One specific tip for improvement

Keep it positive and motivating!`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Photo Analysis Error:', error);
    return "Photo uploaded! I'll analyze your progress. Keep taking regular photos to track changes!";
  }
};

// Food Photo Recognition - Identify food and estimate nutrition
export const analyzeFoodPhoto = async (imageFile) => {
  try {
    const model = getGeminiVisionModel();
    
    const imageData = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this food photo. Provide:
1. Food items identified
2. Estimated portion sizes
3. Total calories (estimate)
4. Protein, carbs, and fat breakdown (in grams)
5. Brief nutritional assessment

Format response as:
🍽️ MEAL: [meal name]
📊 CALORIES: [number] kcal
🥩 PROTEIN: [number]g | CARBS: [number]g | FAT: [number]g
💡 TIP: [one healthy tip]`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Food Analysis Error:', error);
    return "Meal logged! For accurate tracking, try to include variety and watch portion sizes.";
  }
};

// Generate Personalized Workout Plan
export const generateWorkoutPlan = async (userProfile) => {
  try {
    const model = getGeminiModel();
    
    const prompt = `Create a personalized workout plan for:
- Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
- Goal: ${userProfile.goal || 'General fitness'}
- Available Time: ${userProfile.timeAvailable || '30 minutes'}
- Equipment: ${userProfile.equipment || 'Bodyweight only'}

Provide:
1. Warm-up (5 min)
2. Main workout (3-5 exercises with sets/reps)
3. Cool-down (5 min)

Make it practical and achievable!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Workout Generation Error:', error);
    return "Start with: 10 squats, 10 push-ups (or knee push-ups), 30 sec plank, 20 jumping jacks. Repeat 3 times!";
  }
};

// Generate Meal Plan
export const generateMealPlan = async (userProfile) => {
  try {
    const model = getGeminiModel();
    
    const prompt = `Create a daily meal plan for:
- Goal: ${userProfile.goal || 'Balanced nutrition'}
- Calories: ${userProfile.targetCalories || '2000'} kcal/day
- Dietary Preferences: ${userProfile.dietPreference || 'None'}
- Meals: Breakfast, Lunch, Dinner, 1 Snack

For each meal provide:
- Meal name
- Key ingredients
- Approximate calories
- Quick prep tip

Keep meals simple and realistic!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Meal Plan Error:', error);
    return "Focus on: Lean protein, whole grains, lots of vegetables, healthy fats, and stay hydrated!";
  }
};

// AI Habit Insights - Analyze patterns and give suggestions
export const getHabitInsights = async (habitData) => {
  try {
    const model = getGeminiModel();
    
    const prompt = `Analyze this user's wellness habits and provide insights:

Habit Data:
- Workouts completed: ${habitData.workouts || 0}
- Meals logged: ${habitData.meals || 0}
- Current streak: ${habitData.streak || 0} days
- Skipped days pattern: ${habitData.skippedDays || 'None'}
- Best time for activity: ${habitData.bestTime || 'Not identified'}

Provide:
1. One major pattern noticed
2. One specific recommendation to improve consistency
3. One motivational insight

Keep it brief and actionable!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Habit Insights Error:', error);
    return "You're building great habits! Consistency is key. Try setting a specific time each day for your wellness routine.";
  }
};

// Motivational Check-in
export const getMotivationalMessage = async (userContext) => {
  try {
    const model = getGeminiModel();
    
    const prompt = `Generate a motivational message for a wellness app user:
- Current streak: ${userContext.streak || 0} days
- Progress: ${userContext.progress || 'Starting journey'}
- Recent challenge: ${userContext.challenge || 'None'}

Create a short, encouraging message (2-3 sentences). Be specific to their situation and inspiring!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "You're doing amazing! Every small step counts toward your bigger goal. Keep showing up! 💪";
  }
};

// Helper function to convert file to generative part
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Export all AI functions
export default {
  chatWithAI,
  analyzeProgressPhoto,
  analyzeFoodPhoto,
  generateWorkoutPlan,
  generateMealPlan,
  getHabitInsights,
  getMotivationalMessage
};
