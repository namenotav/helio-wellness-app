// GDPR/CCPA Data Control Service
// Handles data access, export, and deletion requests

class DataControlService {
  constructor() {
    this.SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://helio-wellness-app-production.up.railway.app';
  }

  /**
   * Export all user data in JSON format (GDPR Article 20 - Data Portability)
   */
  async exportUserData() {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        userData: this.collectUserData()
      };

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wellnessai-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if(import.meta.env.DEV)console.log('✅ User data exported successfully');
      return data;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Export failed:', error);
      throw error;
    }
  }

  /**
   * Collect all user data from localStorage and services
   */
  collectUserData() {
    const data = {
      profile: this.getProfileData(),
      health: this.getHealthData(),
      activity: this.getActivityData(),
      nutrition: this.getNutritionData(),
      settings: this.getSettingsData(),
      consent: this.getConsentData(),
      gamification: this.getGamificationData(),
      aiChatHistory: JSON.parse(localStorage.getItem('ai_conversation_history') || '[]'),
      battleHistory: JSON.parse(localStorage.getItem('battle_history') || '[]'),
      socialBattles: JSON.parse(localStorage.getItem('social_battles') || '[]'),
      subscriptionPlan: localStorage.getItem('subscription_plan') || 'free',
      locationHistory: JSON.parse(localStorage.getItem('locationHistory') || '[]'),
      dnaAnalysisResults: localStorage.getItem('dna_analysis_results') || null
    };

    return data;
  }

  getProfileData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    
    return {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      profile: {
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        sex: profile.sex,
        activityLevel: profile.activityLevel,
        goals: profile.goals
      }
    };
  }

  getHealthData() {
    const healthData = JSON.parse(localStorage.getItem('health_data') || '{}');
    return {
      steps: healthData.steps || {},
      heartRate: healthData.heartRate || [],
      sleep: healthData.sleep || [],
      bloodPressure: healthData.bloodPressure || [],
      weight: healthData.weight || [],
      bodyComposition: healthData.bodyComposition || []
    };
  }

  getActivityData() {
    return {
      stepHistory: JSON.parse(localStorage.getItem('step_history') || '[]'),
      workouts: JSON.parse(localStorage.getItem('workouts') || '[]'),
      walks: JSON.parse(localStorage.getItem('walks') || '[]'),
      caloriesBurned: JSON.parse(localStorage.getItem('calories_burned') || '[]')
    };
  }

  getNutritionData() {
    return {
      meals: JSON.parse(localStorage.getItem('meals') || '[]'),
      foodLog: JSON.parse(localStorage.getItem('foodLog') || '[]'),
      waterIntake: JSON.parse(localStorage.getItem('water_intake') || '[]'),
      calorieGoal: localStorage.getItem('calorie_goal'),
      nutritionPreferences: JSON.parse(localStorage.getItem('nutrition_preferences') || '{}')
    };
  }

  getSettingsData() {
    return {
      notifications: JSON.parse(localStorage.getItem('notification_settings') || '{}'),
      privacy: JSON.parse(localStorage.getItem('privacy_settings') || '{}'),
      units: localStorage.getItem('preferred_units') || 'metric'
    };
  }

  getConsentData() {
    return JSON.parse(localStorage.getItem('user_consent') || '{}');
  }

  getGamificationData() {
    return {
      achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
      badges: JSON.parse(localStorage.getItem('badges') || '[]'),
      level: localStorage.getItem('user_level'),
      points: localStorage.getItem('user_points')
    };
  }

  /**
   * Delete all user data (GDPR Article 17 - Right to Erasure)
   */
  async deleteAllUserData() {
    try {
      const confirmation = confirm(
        '⚠️ WARNING: This will permanently delete ALL your data.\n\n' +
        'This includes:\n' +
        '- Your account and profile\n' +
        '- All health and activity data\n' +
        '- Achievements and progress\n' +
        '- Saved preferences\n\n' +
        'This action CANNOT be undone.\n\n' +
        'Are you absolutely sure?'
      );

      if (!confirmation) {
        return false;
      }

      // Second confirmation
      const finalConfirmation = confirm(
        'Final confirmation: Delete ALL data permanently?'
      );

      if (!finalConfirmation) {
        return false;
      }

      // Export data before deletion (required by GDPR)
      await this.exportUserData();
      
      // Clear all localStorage
      const keysToDelete = [
        'user',
        'user_profile',
        'health_data',
        'step_history',
        'workouts',
        'walks',
        'meals',
        'water_intake',
        'achievements',
        'badges',
        'user_level',
        'user_points',
        'notification_settings',
        'privacy_settings',
        'user_consent',
        'has_seen_onboarding',
        'calories_burned',
        'calorie_goal',
        'nutrition_preferences',
        'preferred_units',
        'auth_token',
        'refresh_token'
      ];

      keysToDelete.forEach(key => localStorage.removeItem(key));

      // Notify server to delete from database
      try {
        await fetch(`${this.SERVER_URL}/api/user/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
      } catch (error) {
        if(import.meta.env.DEV)console.warn('Could not delete server data:', error);
      }

      if(import.meta.env.DEV)console.log('✅ All user data deleted');
      
      // Redirect to goodbye page
      alert('Your data has been deleted. Thank you for using WellnessAI.');
      window.location.href = '/';
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Deletion failed:', error);
      throw error;
    }
  }

  /**
   * View all data stored about the user (GDPR Article 15 - Right of Access)
   */
  async viewAllData() {
    try {
      const data = this.collectUserData();
      if(import.meta.env.DEV)console.log('📊 User Data:', data);
      return data;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to retrieve data:', error);
      throw error;
    }
  }

  /**
   * Revoke consent for data processing
   */
  async revokeConsent() {
    try {
      const consent = JSON.parse(localStorage.getItem('user_consent') || '{}');
      consent.revoked = true;
      consent.revokedAt = new Date().toISOString();
      
      localStorage.setItem('user_consent', JSON.stringify(consent));
      
      alert('Consent revoked. You will need to accept terms again to use the app.');
      window.location.reload();
      
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to revoke consent:', error);
      throw error;
    }
  }

  /**
   * Update privacy preferences
   */
  updatePrivacySettings(settings) {
    const currentSettings = JSON.parse(localStorage.getItem('privacy_settings') || '{}');
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem('privacy_settings', JSON.stringify(newSettings));
    if(import.meta.env.DEV)console.log('✅ Privacy settings updated');
  }

  /**
   * Check if user has given consent
   */
  hasValidConsent() {
    const consent = JSON.parse(localStorage.getItem('user_consent') || '{}');
    return consent.terms && consent.privacy && consent.healthData && !consent.revoked;
  }
}

// Singleton instance
const dataControlService = new DataControlService();
export default dataControlService;



