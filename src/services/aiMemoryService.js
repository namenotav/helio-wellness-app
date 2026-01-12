// AI Memory Service - Remembers User Conversations & Preferences
import { Preferences } from '@capacitor/preferences';

class AIMemoryService {
  constructor() {
    this.conversationHistory = [];
    this.userPreferences = {};
    this.userContext = {};
    this.maxHistoryLength = 50; // Keep last 50 interactions
  }

  /**
   * Initialize AI memory from storage
   */
  async initialize() {
    try {
      // Load conversation history
      const { value: historyJson } = await Preferences.get({ key: 'ai_conversation_history' });
      if (historyJson) {
        this.conversationHistory = JSON.parse(historyJson);
      }

      // Load user preferences
      const { value: prefsJson } = await Preferences.get({ key: 'ai_user_preferences' });
      if (prefsJson) {
        this.userPreferences = JSON.parse(prefsJson);
      }

      // Load user context
      const { value: contextJson } = await Preferences.get({ key: 'ai_user_context' });
      if (contextJson) {
        this.userContext = JSON.parse(contextJson);
      }

      console.log('AI Memory initialized:', {
        conversations: this.conversationHistory.length,
        preferences: Object.keys(this.userPreferences).length
      });

      return true;
    } catch (error) {
      console.error('AI Memory initialization error:', error);
      return false;
    }
  }

  /**
   * Add conversation to memory
   */
  async addConversation(userMessage, aiResponse, topic = 'general') {
    const conversation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userMessage,
      aiResponse,
      topic,
      date: new Date().toLocaleDateString()
    };

    this.conversationHistory.push(conversation);

    // Keep only recent conversations
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }

    // Extract preferences from conversation
    await this.extractPreferences(userMessage, aiResponse);

    // Save to storage
    await this.saveConversationHistory();

    return conversation;
  }

  /**
   * Extract user preferences from conversation
   */
  async extractPreferences(userMessage, aiResponse) {
    const message = userMessage.toLowerCase();

    // Detect food preferences
    if (message.includes('like') || message.includes('love') || message.includes('favorite')) {
      if (message.includes('chicken')) this.userPreferences.likesChicken = true;
      if (message.includes('fish')) this.userPreferences.likesFish = true;
      if (message.includes('vegetable')) this.userPreferences.likesVegetables = true;
      if (message.includes('fruit')) this.userPreferences.likesFruits = true;
      if (message.includes('salad')) this.userPreferences.likesSalads = true;
    }

    // Detect dislikes
    if (message.includes('hate') || message.includes('dislike') || message.includes("don't like")) {
      if (message.includes('broccoli')) this.userPreferences.dislikesBroccoli = true;
      if (message.includes('spinach')) this.userPreferences.dislikesSpinach = true;
    }

    // Detect dietary restrictions
    if (message.includes('vegetarian')) this.userPreferences.vegetarian = true;
    if (message.includes('vegan')) this.userPreferences.vegan = true;
    if (message.includes('keto')) this.userPreferences.keto = true;
    if (message.includes('paleo')) this.userPreferences.paleo = true;
    if (message.includes('gluten free') || message.includes('gluten-free')) {
      this.userPreferences.glutenFree = true;
    }

    // Detect workout preferences
    if (message.includes('gym')) this.userPreferences.likesGym = true;
    if (message.includes('running') || message.includes('run')) this.userPreferences.likesRunning = true;
    if (message.includes('yoga')) this.userPreferences.likesYoga = true;
    if (message.includes('cardio')) this.userPreferences.likesCardio = true;
    if (message.includes('weights') || message.includes('lifting')) {
      this.userPreferences.likesWeightlifting = true;
    }

    // Detect health goals
    if (message.includes('lose weight') || message.includes('weight loss')) {
      this.userPreferences.goalWeightLoss = true;
    }
    if (message.includes('build muscle') || message.includes('gain muscle')) {
      this.userPreferences.goalMuscleGain = true;
    }
    if (message.includes('get fit') || message.includes('fitness')) {
      this.userPreferences.goalFitness = true;
    }

    // Save preferences
    await this.savePreferences();
  }

  /**
   * Get conversation history for AI context
   */
  getConversationContext(limit = 10) {
    const recent = this.conversationHistory.slice(-limit);
    return recent.map(conv => ({
      user: conv.userMessage,
      ai: conv.aiResponse,
      topic: conv.topic
    }));
  }

  /**
   * Get user preferences summary
   */
  getPreferencesSummary() {
    const summary = [];

    // Food preferences
    if (this.userPreferences.likesChicken) summary.push('likes chicken');
    if (this.userPreferences.likesFish) summary.push('likes fish');
    if (this.userPreferences.likesVegetables) summary.push('likes vegetables');
    if (this.userPreferences.dislikesBroccoli) summary.push('dislikes broccoli');

    // Dietary restrictions
    if (this.userPreferences.vegetarian) summary.push('vegetarian');
    if (this.userPreferences.vegan) summary.push('vegan');
    if (this.userPreferences.keto) summary.push('follows keto diet');
    if (this.userPreferences.glutenFree) summary.push('gluten-free');

    // Workout preferences
    if (this.userPreferences.likesGym) summary.push('enjoys gym workouts');
    if (this.userPreferences.likesRunning) summary.push('enjoys running');
    if (this.userPreferences.likesYoga) summary.push('practices yoga');

    // Goals
    if (this.userPreferences.goalWeightLoss) summary.push('goal: lose weight');
    if (this.userPreferences.goalMuscleGain) summary.push('goal: build muscle');
    if (this.userPreferences.goalFitness) summary.push('goal: improve fitness');

    return summary.join(', ');
  }

  /**
   * Build enhanced AI prompt with memory context
   */
  buildContextualPrompt(userMessage) {
    const context = [];

    // Add preference context
    const prefs = this.getPreferencesSummary();
    if (prefs) {
      context.push(`User preferences: ${prefs}`);
    }

    // Add recent conversation context
    const recentConvs = this.getConversationContext(5);
    if (recentConvs.length > 0) {
      context.push(`Previous conversations:`);
      recentConvs.forEach((conv, i) => {
        context.push(`${i + 1}. User: "${conv.user}" AI: "${conv.ai.substring(0, 100)}..."`);
      });
    }

    // Add user context
    if (Object.keys(this.userContext).length > 0) {
      context.push(`User context: ${JSON.stringify(this.userContext)}`);
    }

    const contextPrompt = context.length > 0 
      ? `CONTEXT (remember this about the user):\n${context.join('\n')}\n\nUSER MESSAGE: ${userMessage}` 
      : userMessage;

    return contextPrompt;
  }

  /**
   * Update user context (health stats, achievements, etc.)
   */
  async updateUserContext(updates) {
    this.userContext = {
      ...this.userContext,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    await Preferences.set({
      key: 'ai_user_context',
      value: JSON.stringify(this.userContext)
    });
  }

  /**
   * Get conversation by topic
   */
  getConversationsByTopic(topic) {
    return this.conversationHistory.filter(conv => conv.topic === topic);
  }

  /**
   * Search conversations
   */
  searchConversations(query) {
    const lowerQuery = query.toLowerCase();
    return this.conversationHistory.filter(conv => 
      conv.userMessage.toLowerCase().includes(lowerQuery) ||
      conv.aiResponse.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear old conversations (keep last 30 days)
   */
  async clearOldConversations() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.conversationHistory = this.conversationHistory.filter(
      conv => new Date(conv.timestamp).getTime() > thirtyDaysAgo
    );
    await this.saveConversationHistory();
  }

  /**
   * Save conversation history
   */
  async saveConversationHistory() {
    try {
      await Preferences.set({
        key: 'ai_conversation_history',
        value: JSON.stringify(this.conversationHistory)
      });
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  /**
   * Save preferences
   */
  async savePreferences() {
    try {
      await Preferences.set({
        key: 'ai_user_preferences',
        value: JSON.stringify(this.userPreferences)
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Get memory stats
   */
  getMemoryStats() {
    return {
      totalConversations: this.conversationHistory.length,
      preferencesLearned: Object.keys(this.userPreferences).length,
      contextData: Object.keys(this.userContext).length,
      oldestConversation: this.conversationHistory[0]?.date || 'None',
      newestConversation: this.conversationHistory[this.conversationHistory.length - 1]?.date || 'None'
    };
  }

  /**
   * Reset all memory (for testing or user request)
   */
  async resetMemory() {
    this.conversationHistory = [];
    this.userPreferences = {};
    this.userContext = {};

    await Preferences.remove({ key: 'ai_conversation_history' });
    await Preferences.remove({ key: 'ai_user_preferences' });
    await Preferences.remove({ key: 'ai_user_context' });

    console.log('AI Memory reset');
  }
}

// Export singleton instance
export const aiMemoryService = new AIMemoryService();
export default aiMemoryService;
