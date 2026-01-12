// Data Validation and Safety
// Always check data exists before using it

import { safeGetStorage } from './errorHandler'

export class DataValidator {
  // Validate user profile
  static validateProfile(profile) {
    if (!profile) return null
    
    return {
      name: profile.name || 'User',
      email: profile.email || '',
      age: profile.age || null,
      gender: profile.gender || 'other',
      height: profile.height || null,
      weight: profile.weight || null,
      goalType: profile.goalType || 'general',
      ...profile
    }
  }
  
  // Validate stats object
  static validateStats(stats) {
    if (!stats) {
      return {
        steps: 0,
        water: 0,
        calories: 0,
        sleep: 0,
        weight: 0,
        heartRate: 0
      }
    }
    
    return {
      steps: Number(stats.steps) || 0,
      water: Number(stats.water) || 0,
      calories: Number(stats.calories) || 0,
      sleep: Number(stats.sleep) || 0,
      weight: Number(stats.weight) || 0,
      heartRate: Number(stats.heartRate) || 0,
      ...stats
    }
  }
  
  // Validate activities array
  static validateActivities(activities) {
    if (!Array.isArray(activities)) return []
    
    return activities.filter(activity => {
      return activity && 
             activity.type && 
             activity.timestamp
    })
  }
  
  // Safe get from localStorage with validation
  static getProfile() {
    const profile = safeGetStorage('userProfile', {})
    return this.validateProfile(profile)
  }
  
  static getStats() {
    const stats = safeGetStorage('stats', {})
    return this.validateStats(stats)
  }
  
  static getActivities() {
    const activities = safeGetStorage('activities', [])
    return this.validateActivities(activities)
  }
  
  // Check if value is valid number
  static isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
  }
  
  // Check if value is valid string
  static isValidString(value) {
    return typeof value === 'string' && value.trim().length > 0
  }
  
  // Check if value is valid email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return this.isValidString(email) && emailRegex.test(email)
  }
  
  // Sanitize user input
  static sanitizeInput(input) {
    if (!input) return ''
    return String(input).trim().substring(0, 1000) // Max 1000 chars
  }
}

export default DataValidator
