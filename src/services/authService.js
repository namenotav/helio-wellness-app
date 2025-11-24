// Authentication Service - Sign Up/Sign In System
import { Device } from '@capacitor/device';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
  }

  async initialize() {
    // Load saved user session
    const savedUser = localStorage.getItem('wellnessai_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.notifyAuthStateChanged();
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('wellnessai_user');
      }
    }
  }

  // Sign Up - Create new account
  async signUp(email, password, name) {
    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Check if user already exists
      const existingUsers = this.getAllUsers();
      if (existingUsers.find(u => u.email === email)) {
        throw new Error('Email already registered');
      }

      // Get device info
      const deviceInfo = await Device.getId();

      // Create user object
      const user = {
        id: this.generateUserId(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: this.hashPassword(password), // In production, use proper encryption
        createdAt: new Date().toISOString(),
        deviceId: deviceInfo.identifier,
        profile: {
          avatar: this.getDefaultAvatar(),
          photo: null, // Profile photo from camera
          age: null,
          gender: null,
          height: null,
          weight: null,
          goalSteps: 10000,
          notifications: true,
          // Allergen & Dietary Profile
          allergens: [], // e.g., ['gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy', 'fish', 'sesame']
          intolerances: [], // e.g., ['lactose', 'fructose', 'histamine', 'sulfites', 'fodmap']
          dietaryPreferences: [], // e.g., ['vegetarian', 'vegan', 'halal', 'kosher', 'keto', 'paleo']
          customRestrictions: [], // User-defined restrictions
          allergenSeverity: {}, // Maps allergen to severity: { 'nuts': 'severe', 'dairy': 'moderate', 'eggs': 'mild' }
          // AI Learning Data
          foodLog: [], // Array of eaten foods with timestamps and reactions
          symptomLog: [], // Array of symptoms logged after meals
          safetyPreferences: {}, // AI-learned safe/unsafe foods
          hiddenAllergenKnowledge: [] // AI-discovered hidden allergen names (e.g., 'whey' = dairy)
        },
        stats: {
          totalSteps: 0,
          totalDays: 0,
          longestStreak: 0,
          currentStreak: 0
        }
      };

      // Save to users database
      existingUsers.push(user);
      localStorage.setItem('wellnessai_users', JSON.stringify(existingUsers));

      // Set as current user (auto login after signup)
      this.currentUser = { ...user };
      delete this.currentUser.password; // Don't store password in session
      localStorage.setItem('wellnessai_user', JSON.stringify(this.currentUser));

      this.notifyAuthStateChanged();

      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sign In - Login existing user
  async signIn(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const users = this.getAllUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());

      if (!user) {
        throw new Error('No account found with this email');
      }

      const hashedPassword = this.hashPassword(password);
      if (user.password !== hashedPassword) {
        throw new Error('Incorrect password');
      }

      // Create session
      this.currentUser = { ...user };
      delete this.currentUser.password; // Don't store password in session
      localStorage.setItem('wellnessai_user', JSON.stringify(this.currentUser));

      this.notifyAuthStateChanged();

      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sign Out
  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('wellnessai_user');
    this.notifyAuthStateChanged();

    return { success: true };
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Update user profile
  async updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === this.currentUser.id);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        profile: {
          ...users[userIndex].profile,
          ...updates
        }
      };

      // Save to database
      localStorage.setItem('wellnessai_users', JSON.stringify(users));

      // Update current user session
      this.currentUser = { ...users[userIndex] };
      delete this.currentUser.password;
      localStorage.setItem('wellnessai_user', JSON.stringify(this.currentUser));

      this.notifyAuthStateChanged();

      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email.toLowerCase().trim());

    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If this email is registered, you will receive reset instructions' };
    }

    // In production, send email with reset link
    console.log('Password reset requested for:', email);
    
    return { 
      success: true, 
      message: 'Password reset instructions sent to your email' 
    };
  }

  // Watch auth state changes
  onAuthStateChanged(callback) {
    this.authListeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners
  notifyAuthStateChanged() {
    this.authListeners.forEach(callback => callback(this.currentUser));
  }

  // Helper: Get all users
  getAllUsers() {
    const users = localStorage.getItem('wellnessai_users');
    return users ? JSON.parse(users) : [];
  }

  // Helper: Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper: Generate user ID
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Helper: Simple password hashing (use bcrypt in production)
  hashPassword(password) {
    // This is NOT secure - use proper hashing in production
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // Helper: Get default avatar
  getDefaultAvatar() {
    const avatars = ['🧘', '🏃', '💪', '🧗', '🚴', '🏊', '⛹️', '🤸'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  // Allergen Profile Methods
  async updateAllergens(allergens) {
    return this.updateProfile({ allergens });
  }

  async addAllergen(allergen, severity = 'moderate') {
    if (!this.currentUser) return { success: false, error: 'Not logged in' };
    
    const allergens = this.currentUser.profile.allergens || [];
    const severityMap = this.currentUser.profile.allergenSeverity || {};
    
    if (!allergens.includes(allergen)) {
      allergens.push(allergen);
      severityMap[allergen] = severity;
      
      return this.updateProfile({ 
        allergens,
        allergenSeverity: severityMap
      });
    }
    
    return { success: true, message: 'Allergen already exists' };
  }

  async removeAllergen(allergen) {
    if (!this.currentUser) return { success: false, error: 'Not logged in' };
    
    const allergens = (this.currentUser.profile.allergens || []).filter(a => a !== allergen);
    const severityMap = { ...this.currentUser.profile.allergenSeverity };
    delete severityMap[allergen];
    
    return this.updateProfile({ 
      allergens,
      allergenSeverity: severityMap
    });
  }

  async logFood(foodItem) {
    if (!this.currentUser) return { success: false, error: 'Not logged in' };
    
    const foodLog = this.currentUser.profile.foodLog || [];
    foodLog.push({
      ...foodItem,
      timestamp: new Date().toISOString(),
      id: 'food_' + Date.now()
    });
    
    return this.updateProfile({ foodLog });
  }

  async logSymptom(symptom) {
    if (!this.currentUser) return { success: false, error: 'Not logged in' };
    
    const symptomLog = this.currentUser.profile.symptomLog || [];
    symptomLog.push({
      ...symptom,
      timestamp: new Date().toISOString(),
      id: 'symptom_' + Date.now()
    });
    
    return this.updateProfile({ symptomLog });
  }

  async updateSafetyPreferences(food, isSafe) {
    if (!this.currentUser) return { success: false, error: 'Not logged in' };
    
    const safetyPreferences = this.currentUser.profile.safetyPreferences || {};
    safetyPreferences[food] = isSafe;
    
    return this.updateProfile({ safetyPreferences });
  }

  getUserAllergenProfile() {
    if (!this.currentUser) return null;
    
    return {
      allergens: this.currentUser.profile.allergens || [],
      intolerances: this.currentUser.profile.intolerances || [],
      dietaryPreferences: this.currentUser.profile.dietaryPreferences || [],
      customRestrictions: this.currentUser.profile.customRestrictions || [],
      allergenSeverity: this.currentUser.profile.allergenSeverity || {},
      safetyPreferences: this.currentUser.profile.safetyPreferences || {}
    };
  }
}

export const authService = new AuthService();
export default authService;
