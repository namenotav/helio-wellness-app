// Gemini AI Service Configuration

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with hardcoded API key (for mobile compatibility)
const API_KEY = 'AIzaSyB0g31xr19v9K854POfDFYhTJT9DDmtjgI';
const genAI = new GoogleGenerativeAI(API_KEY);

// Get Gemini Pro model (text-only)
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
};

// Get Gemini Pro Vision model (text + images)
export const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
};

// AI Wellness Coach - Chat with personalized advice (NOW WITH ALLERGEN SUPPORT)
export const chatWithAI = async (userMessage, userContext = {}) => {
  try {
    // Call backend API proxy (works on mobile!)
    const response = await fetch('https://helio-wellness-app.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI Error:', error);
    return 'I\'m having trouble connecting. Please check your internet connection and try again!';
  }
};

// AI Location Pattern Analysis
export const analyzeLocationPattern = async (locationHistory) => {
  try {
    // Prepare location data for analysis
    const locationData = locationHistory.map(loc => ({
      lat: loc.latitude.toFixed(4),
      lng: loc.longitude.toFixed(4),
      time: new Date(loc.timestamp).toISOString(),
      speed: loc.speed
    }));

    const prompt = `Analyze these GPS location points to identify patterns:

${JSON.stringify(locationData, null, 2)}

Identify:
1. Most frequent location (likely HOME)
2. Regular visited locations (GYM, WORK, etc.)
3. Daily routine patterns
4. Movement habits

Return JSON format:
{
  "home": {"latitude": X, "longitude": Y, "confidence": 0-100},
  "gym": {"latitude": X, "longitude": Y, "confidence": 0-100},
  "work": {"latitude": X, "longitude": Y, "confidence": 0-100},
  "routinePatterns": ["description of patterns"]
}`;

    const model = getGeminiModel(); const result = await model.generateContent(prompt); const response = await result.response; const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { home: null, gym: null, work: null, routinePatterns: [] };
  } catch (error) {
    console.error('Error analyzing location patterns:', error);
    return { home: null, gym: null, work: null, routinePatterns: [] };
  }
};

// AI Activity Detection
export const detectActivity = async (locationData, previousActivity) => {
  try {
    const prompt = `Based on this movement data, classify the activity:

Current location: ${locationData.latitude}, ${locationData.longitude}
Speed: ${locationData.speed} m/s
Previous activity: ${previousActivity}

Classify as one of: stationary, walking, running, cycling, driving, at_gym, at_restaurant, at_home

Return just the activity name.`;

    const model = getGeminiModel(); const result = await model.generateContent(prompt); const response = await result.response; const text = response.text();
    return text.trim().toLowerCase();
  } catch (error) {
    console.error('Error detecting activity:', error);
    return 'stationary';
  }
};

// AI Behavior Prediction
export const predictBehavior = async (activityLog, locationHistory) => {
  try {
    
    // Prepare last 2 weeks of data
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const recentActivities = activityLog.filter(a => a.startTime > twoWeeksAgo);

    const prompt = `Analyze user behavior and predict future actions:

Recent Activity Log (last 2 weeks):
${JSON.stringify(recentActivities, null, 2)}

Predict:
1. Likelihood user will skip next workout (0-100%)
2. Likely to eat unhealthy today (0-100%)
3. Stress level based on location changes (low/medium/high)
4. Recommended intervention

Return JSON:
{
  "likelyToSkip": true/false,
  "skipProbability": 0-100,
  "unhealthyEatingRisk": 0-100,
  "stressLevel": "low/medium/high",
  "recommendation": "specific action to take"
}`;

    const model = getGeminiModel(); const result = await model.generateContent(prompt); const response = await result.response; const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { likelyToSkip: false, skipProbability: 0, unhealthyEatingRisk: 0, stressLevel: 'low', recommendation: '' };
  } catch (error) {
    console.error('Error predicting behavior:', error);
    return { likelyToSkip: false, skipProbability: 0, unhealthyEatingRisk: 0, stressLevel: 'low', recommendation: '' };
  }
};

// AI Habit Classification (Good vs Bad)
export const classifyHabits = async (activityLog) => {
  try {
    
    const prompt = `Analyze these activities and classify as good or bad habits:

${JSON.stringify(activityLog, null, 2)}

Identify:
- Good habits (regular gym, consistent sleep, healthy eating)
- Bad habits (sedentary behavior, irregular schedule, fast food visits)
- Habit consistency score (0-100)

Return JSON:
{
  "goodHabits": [{"habit": "name", "frequency": "times per week", "consistency": 0-100}],
  "badHabits": [{"habit": "name", "frequency": "times per week", "impact": "description"}],
  "overallScore": 0-100
}`;

    const model = getGeminiModel(); const result = await model.generateContent(prompt); const response = await result.response; const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { goodHabits: [], badHabits: [], overallScore: 50 };
  } catch (error) {
    console.error('Error classifying habits:', error);
    return { goodHabits: [], badHabits: [], overallScore: 50 };
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
