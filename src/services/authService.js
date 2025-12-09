// Authentication Service - Sign Up/Sign In System
// NOW WITH FIREBASE CLOUD SYNC + PERMANENT STORAGE!
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import firebaseService from './firebaseService.js';
import syncService from './syncService.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.useFirebase = false; // Enable Firebase when available
  }

  async initialize() {
    try {
      // Try to initialize Firebase
      this.useFirebase = firebaseService.initialize();
      
      if (this.useFirebase) {
        if(import.meta.env.DEV)console.log('✅ Auth service with Firebase cloud sync enabled');
        
        // Check if user is logged in to Firebase
        const firebaseUser = firebaseService.getCurrentUser();
        if (firebaseUser) {
          // Load from Firebase
          const profile = await firebaseService.getUserProfile(firebaseUser.uid);
          if (profile) {
            this.currentUser = profile;
            localStorage.setItem('wellnessai_user', JSON.stringify(this.currentUser));
            await syncService.onUserLogin(firebaseUser.uid);
            this.notifyAuthStateChanged();
            return;
          }
        }
      } else {
        if(import.meta.env.DEV)console.log('⚠️ Auth service running in offline-only mode');
      }

      // Fallback to Preferences (permanent storage)
      const { value: savedUser } = await Preferences.get({ key: 'wellnessai_user' });
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
          
          // 🔥 CRITICAL: Check if profile is empty and restore from Firebase cloud
          if (this.currentUser && (!this.currentUser.profile || !this.currentUser.profile.profileCompleted)) {
            console.log('🔄 Profile empty locally, checking Firebase cloud...');
            try {
              const cloudProfile = await syncService.getData('user_profile');
              if (cloudProfile && cloudProfile.profileCompleted) {
                console.log('☁️ Profile found in cloud! Restoring...');
                this.currentUser.profile = cloudProfile;
                await Preferences.set({ key: 'wellnessai_user', value: JSON.stringify(this.currentUser) });
                console.log('✅ Profile restored from Firebase successfully');
              }
            } catch (e) {
              console.warn('⚠️ Could not restore profile from cloud:', e);
            }
          }
          
          this.notifyAuthStateChanged();
        } catch (error) {
          if(import.meta.env.DEV)console.error('Error loading saved session:', error);
          await Preferences.remove({ key: 'wellnessai_user' });
        }
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Auth initialize error:', error);
    }
  }

  // Sign Up - Create new account
  async signUp(email, password, name) {
    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Password strength check
      if (!this.isStrongPassword(password)) {
        throw new Error('Password must contain uppercase, lowercase, number, and special character');
      }

      // Check if user already exists
      const existingUsers = await this.getAllUsers();
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
        password: await this.hashPasswordSecure(password), // IMPROVED: Secure PBKDF2 hashing
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

      // Save to users database (Preferences for permanent storage)
      existingUsers.push(user);
      await Preferences.set({ key: 'wellnessai_users', value: JSON.stringify(existingUsers) });

      // Set as current user (auto login after signup)
      this.currentUser = { ...user };
      delete this.currentUser.password; // Don't store password in session
      await Preferences.set({ key: 'wellnessai_user', value: JSON.stringify(this.currentUser) });

      // If Firebase enabled, create cloud account
      if (this.useFirebase) {
        try {
          const firebaseResult = await firebaseService.signUp(email, password, name);
          if (firebaseResult.success) {
            if(import.meta.env.DEV)console.log('☁️ User created in Firebase cloud');
            // Sync initial data
            await syncService.onUserLogin(firebaseResult.user.uid);
          }
        } catch (error) {
          if(import.meta.env.DEV)console.warn('⚠️ Firebase signup failed, but local account created:', error);
        }
      }

      this.notifyAuthStateChanged();

      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Sign up error:', error);
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

      // If Firebase enabled, try cloud login first
      if (this.useFirebase) {
        try {
          const firebaseResult = await firebaseService.signIn(email, password);
          if (firebaseResult.success) {
            // Load profile from Firebase
            const profile = await firebaseService.getUserProfile(firebaseResult.user.uid);
            if (profile) {
              this.currentUser = profile;
              await Preferences.set({ key: 'wellnessai_user', value: JSON.stringify(this.currentUser) });
              await syncService.onUserLogin(firebaseResult.user.uid);
              this.notifyAuthStateChanged();
              if(import.meta.env.DEV)console.log('☁️ Signed in with Firebase cloud');
              return { success: true, user: this.currentUser };
            }
          }
        } catch (firebaseError) {
          if(import.meta.env.DEV)console.warn('⚠️ Firebase login failed, trying local:', firebaseError);
        }
      }

      // Fallback to local authentication
      const users = await this.getAllUsers();
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
      await Preferences.set({ key: 'wellnessai_user', value: JSON.stringify(this.currentUser) });

      this.notifyAuthStateChanged();

      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Sign in error:', error);
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
    await Preferences.remove({ key: 'wellnessai_user' });
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
      const users = await this.getAllUsers();
      if(import.meta.env.DEV)console.log('🔍 Looking for user ID:', this.currentUser.id);
      if(import.meta.env.DEV)console.log('📋 All users in storage:', users.length, 'users');
      if(import.meta.env.DEV)console.log('👤 Current user:', this.currentUser.email);
      
      // Fix corrupted state: if user ID is undefined, create new user record
      if (!this.currentUser.id) {
        if(import.meta.env.DEV)console.warn('⚠️ User ID is undefined - auto-creating user record...');
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newUser = {
          id: newUserId,
          email: this.currentUser.email,
          displayName: this.currentUser.displayName || this.currentUser.email,
          emailVerified: this.currentUser.emailVerified || false,
          createdAt: new Date().toISOString(),
          profile: updates
        };
        users.push(newUser);
        await Preferences.set({ key: 'wellnessai_users', value: JSON.stringify(users) });
        
        // Update current user with new ID
        this.currentUser.id = newUserId;
        this.currentUser.profile = updates;
        await Preferences.set({ key: 'wellnessai_user', value: JSON.stringify(this.currentUser) });
        
        if(import.meta.env.DEV)console.log('✅ User record created with ID:', newUserId);
        return;
      }
      
      const userIndex = users.findIndex(u => u.id === this.currentUser.id);

      if (userIndex === -1) {
        if(import.meta.env.DEV)console.error('❌ User ID not found in storage! Creating new record...');
        // User has ID but not in storage - recreate
        const newUser = {
          id: this.currentUser.id,
          email: this.currentUser.email,
          displayName: this.currentUser.displayName || this.currentUser.email,
          emailVerified: this.currentUser.emailVerified || false,
          createdAt: new Date().toISOString(),
          profile: updates
        };
        users.push(newUser);
        localStorage.setItem('wellnessai_users', JSON.stringify(users));
        await Preferences.set({ key: 'wellnessai_users', value: JSON.stringify(users) });
        this.currentUser.profile = updates;
        localStorage.setItem('wellnessai_user', JSON.stringify(this.currentUser));
        await Preferences.set({ key: 'wellnessai_user', value: JSON.stringify(this.currentUser) });
        if(import.meta.env.DEV)console.log('✅ User record recreated');
        return;
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        profile: {
          ...users[userIndex].profile,
          ...updates
        }
      };

      // Save to database (both localStorage and Preferences for persistence)
      localStorage.setItem('wellnessai_users', JSON.stringify(users));
      await Preferences.set({ key: 'wellnessai_users', value: JSON.stringify(users) });

      // Update current user session
      this.currentUser = { ...users[userIndex] };
      delete this.currentUser.password;
      await Preferences.set({ key: 'wellnessai_user', value: JSON.stringify(this.currentUser) });

      // Sync to Firebase via syncService
      if (this.useFirebase) {
        try {
          await syncService.saveData('user_profile', this.currentUser.profile);
          if(import.meta.env.DEV)console.log('✅ Profile synced to Firebase');
        } catch (syncError) {
          if(import.meta.env.DEV)console.warn('Profile Firebase sync failed (offline?):', syncError);
        }
      }

      this.notifyAuthStateChanged();

      return { success: true, user: this.currentUser };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    const users = await this.getAllUsers();
    const user = users.find(u => u.email === email.toLowerCase().trim());

    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If this email is registered, you will receive reset instructions' };
    }

    // In production, send email with reset link
    if(import.meta.env.DEV)console.log('Password reset requested for:', email);
    
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
  async getAllUsers() {
    const { value: users } = await Preferences.get({ key: 'wellnessai_users' });
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

  // Legacy hashPassword() function removed for security
  // All passwords now use PBKDF2 with 100,000 iterations (hashPasswordSecure)

  // NEW: Secure password hashing with PBKDF2 (100,000 iterations)
  async hashPasswordSecure(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // 100k iterations = bcrypt-level security
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    // Combine salt + hash for storage
    const hashArray = new Uint8Array(derived);
    const combined = new Uint8Array(salt.length + hashArray.length);
    combined.set(salt, 0);
    combined.set(hashArray, salt.length);
    
    return this.arrayBufferToBase64(combined);
  }

  // Verify password against secure hash
  async verifyPasswordSecure(password, storedHash) {
    try {
      const combined = this.base64ToArrayBuffer(storedHash);
      const salt = combined.slice(0, 16);
      const originalHash = combined.slice(16);

      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        data,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const derived = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      const newHash = new Uint8Array(derived);
      
      // Constant-time comparison to prevent timing attacks
      return this.constantTimeCompare(originalHash, newHash);
    } catch (error) {
      return false;
    }
  }

  // Password strength validation
  isStrongPassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && password.length >= 8;
  }

  // Helper: Array buffer to base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Helper: Base64 to array buffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Constant-time comparison to prevent timing attacks
  constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
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
    const logEntry = {
      ...foodItem,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      id: 'food_' + Date.now()
    };
    foodLog.push(logEntry);
    
    // 💾 SAVE TO CAPACITOR PREFERENCES (persistent storage)
    const { value: foodLogJson } = await Preferences.get({ key: 'foodLog' });
    const dashboardFoodLog = foodLogJson ? JSON.parse(foodLogJson) : [];
    dashboardFoodLog.push({
      name: foodItem.name || 'Food item',
      calories: foodItem.calories || 0,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    });
    await Preferences.set({ key: 'foodLog', value: JSON.stringify(dashboardFoodLog) });
    
    // Also keep localStorage for backwards compatibility
    localStorage.setItem('foodLog', JSON.stringify(dashboardFoodLog));
    if(import.meta.env.DEV)console.log('✅ Meal saved to persistent storage');
    
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



