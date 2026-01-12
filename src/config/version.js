// Version Management and Data Migration System

export const VERSION = {
  // App version (increment with each release)
  app: '1.0.5',
  
  // Data structure version (increment when changing data format)
  data: '2',
  
  // Minimum supported version (users below this must update)
  minSupported: '1.0.0',
  
  // Build number (auto-increment)
  build: 105
}

// Data migration functions
const MIGRATIONS = {
  // Migration from v1 to v2
  '1_to_2': () => {
    console.log('🔄 Migrating data from v1 to v2...')
    
    try {
      // Example: Add new goalType field to user profile
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      if (profile && !profile.goalType) {
        profile.goalType = 'general' // Default value
        localStorage.setItem('userProfile', JSON.stringify(profile))
        console.log('✅ Added goalType to profile')
      }
      
      // Example: Update stats structure
      const stats = JSON.parse(localStorage.getItem('stats') || '{}')
      if (stats && !stats.version) {
        stats.version = 2
        localStorage.setItem('stats', JSON.stringify(stats))
        console.log('✅ Updated stats version')
      }
      
      return true
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return false
    }
  }
  
  // Add more migrations as needed:
  // '2_to_3': () => { ... },
  // '3_to_4': () => { ... },
}

export class VersionManager {
  static checkVersion() {
    const savedVersion = localStorage.getItem('appVersion')
    const savedDataVersion = localStorage.getItem('dataVersion')
    
    console.log('📱 Current app version:', VERSION.app)
    console.log('💾 Saved app version:', savedVersion || 'none')
    console.log('📊 Current data version:', VERSION.data)
    console.log('💾 Saved data version:', savedDataVersion || 'none')
    
    // First time user
    if (!savedVersion) {
      console.log('🆕 First time user - initializing...')
      localStorage.setItem('appVersion', VERSION.app)
      localStorage.setItem('dataVersion', VERSION.data)
      return { isFirstTime: true, needsMigration: false }
    }
    
    // Check if data migration needed
    if (savedDataVersion !== VERSION.data) {
      console.log('🔄 Data migration needed')
      return { isFirstTime: false, needsMigration: true }
    }
    
    // Update app version if changed
    if (savedVersion !== VERSION.app) {
      console.log('📦 App updated from', savedVersion, 'to', VERSION.app)
      localStorage.setItem('appVersion', VERSION.app)
    }
    
    return { isFirstTime: false, needsMigration: false }
  }
  
  static async migrateData() {
    const savedDataVersion = localStorage.getItem('dataVersion') || '1'
    const targetVersion = VERSION.data
    
    console.log(`🔄 Migrating data from v${savedDataVersion} to v${targetVersion}`)
    
    try {
      // Run all necessary migrations in order
      const currentVersion = parseInt(savedDataVersion)
      const target = parseInt(targetVersion)
      
      for (let v = currentVersion; v < target; v++) {
        const migrationKey = `${v}_to_${v + 1}`
        const migration = MIGRATIONS[migrationKey]
        
        if (migration) {
          console.log(`🔄 Running migration: ${migrationKey}`)
          const success = await migration()
          
          if (!success) {
            throw new Error(`Migration ${migrationKey} failed`)
          }
        }
      }
      
      // Update data version
      localStorage.setItem('dataVersion', targetVersion)
      console.log('✅ Migration complete!')
      
      return true
    } catch (error) {
      console.error('❌ Migration error:', error)
      return false
    }
  }
  
  static isUpdateRequired() {
    const savedVersion = localStorage.getItem('appVersion') || '0.0.0'
    return this.compareVersions(savedVersion, VERSION.minSupported) < 0
  }
  
  static compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1
      if (parts1[i] < parts2[i]) return -1
    }
    return 0
  }
}

export default VersionManager
