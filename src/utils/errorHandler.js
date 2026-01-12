// Global Error Handler
// Catch and log all errors before users see them

import ENV from '../config/environment'

class ErrorHandler {
  constructor() {
    this.errors = []
    this.maxErrors = 100
    this.setupGlobalHandlers()
  }
  
  setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason)
      this.logError({
        type: 'unhandledRejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      })
      event.preventDefault()
    })
    
    // Catch global errors
    window.addEventListener('error', (event) => {
      console.error('🚨 Global Error:', event.error)
      this.logError({
        type: 'globalError',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      })
      event.preventDefault()
    })
    
    console.log('✅ Global error handlers initialized')
  }
  
  logError(error) {
    // Add to error log
    this.errors.push(error)
    
    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }
    
    // Save to localStorage for debugging
    try {
      localStorage.setItem('errorLog', JSON.stringify(this.errors.slice(-20)))
    } catch (e) {
      console.warn('Could not save error log:', e)
    }
    
    // In production, send to error tracking service
    if (ENV.isProduction()) {
      this.sendToErrorService(error)
    }
    
    // Show user-friendly message
    this.showUserMessage(error)
  }
  
  sendToErrorService(error) {
    // TODO: Send to Firebase, Sentry, or other error tracking
    // For now, just log
    console.log('📤 Would send to error service:', error.type)
  }
  
  showUserMessage(error) {
    // Don't spam users with error messages
    const lastShown = localStorage.getItem('lastErrorShown')
    const now = Date.now()
    
    if (lastShown && (now - parseInt(lastShown)) < 5000) {
      return // Don't show if we showed one in last 5 seconds
    }
    
    // Only show in development or for critical errors
    if (ENV.isDevelopment() || error.type === 'critical') {
      localStorage.setItem('lastErrorShown', String(now))
      
      if (!ENV.isProduction()) {
        // Development: Show detailed error
        alert(`🐛 Error: ${error.message}\n\nCheck console for details`)
      } else {
        // Production: Show friendly message
        alert('Something went wrong. Please try again.')
      }
    }
  }
  
  getErrors() {
    return [...this.errors]
  }
  
  clearErrors() {
    this.errors = []
    localStorage.removeItem('errorLog')
    console.log('🧹 Error log cleared')
  }
  
  // Helper to safely execute code
  static async safeExecute(fn, fallback = null, errorContext = '') {
    try {
      return await fn()
    } catch (error) {
      console.error(`❌ Error in ${errorContext}:`, error)
      errorHandler.logError({
        type: 'safeExecute',
        context: errorContext,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
      return fallback
    }
  }
  
  // Helper to safely parse JSON
  static safeParse(json, fallback = null) {
    try {
      return JSON.parse(json)
    } catch (error) {
      console.warn('⚠️ Invalid JSON:', json?.substring(0, 100))
      return fallback
    }
  }
  
  // Helper to safely get localStorage
  static safeGetStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch (error) {
      console.warn(`⚠️ Could not get ${key} from storage:`, error)
      return fallback
    }
  }
  
  // Helper to safely set localStorage
  static safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`⚠️ Could not save ${key} to storage:`, error)
      return false
    }
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler()

// Export helpers
export const {
  safeExecute,
  safeParse,
  safeGetStorage,
  safeSetStorage
} = ErrorHandler

export default errorHandler
