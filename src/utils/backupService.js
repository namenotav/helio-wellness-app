// Backup Service
// Automatically backup user data to Firebase

import { getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { safeGetStorage } from './errorHandler'
import DataValidator from './dataValidation'

class BackupService {
  constructor() {
    this.lastBackup = null
    this.backupInterval = 5 * 60 * 1000 // 5 minutes
    this.isBackupInProgress = false
  }
  
  async backupToCloud() {
    if (this.isBackupInProgress) {
      console.log('⏳ Backup already in progress, skipping...')
      return
    }
    
    try {
      this.isBackupInProgress = true
      
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) {
        console.log('👤 No user logged in, skipping backup')
        return
      }
      
      console.log('☁️ Starting cloud backup...')
      
      const db = getFirestore()
      const userDocRef = doc(db, 'users', user.uid)
      
      // Collect all data to backup
      const backupData = {
        profile: DataValidator.getProfile(),
        stats: DataValidator.getStats(),
        activities: DataValidator.getActivities(),
        settings: safeGetStorage('settings', {}),
        goals: safeGetStorage('goals', []),
        lastBackup: new Date().toISOString(),
        appVersion: localStorage.getItem('appVersion'),
        dataVersion: localStorage.getItem('dataVersion')
      }
      
      // Save to Firestore
      await setDoc(userDocRef, backupData, { merge: true })
      
      this.lastBackup = Date.now()
      localStorage.setItem('lastBackup', String(this.lastBackup))
      
      console.log('✅ Cloud backup complete!')
      
    } catch (error) {
      console.error('❌ Backup failed:', error)
    } finally {
      this.isBackupInProgress = false
    }
  }
  
  async restoreFromCloud() {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) {
        console.log('👤 No user logged in, cannot restore')
        return null
      }
      
      console.log('☁️ Restoring from cloud...')
      
      const db = getFirestore()
      const userDocRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(userDocRef)
      
      if (!docSnap.exists()) {
        console.log('📭 No backup found')
        return null
      }
      
      const backupData = docSnap.data()
      
      // Restore data to localStorage
      if (backupData.profile) {
        localStorage.setItem('userProfile', JSON.stringify(backupData.profile))
      }
      if (backupData.stats) {
        localStorage.setItem('stats', JSON.stringify(backupData.stats))
      }
      if (backupData.activities) {
        localStorage.setItem('activities', JSON.stringify(backupData.activities))
      }
      if (backupData.settings) {
        localStorage.setItem('settings', JSON.stringify(backupData.settings))
      }
      if (backupData.goals) {
        localStorage.setItem('goals', JSON.stringify(backupData.goals))
      }
      
      console.log('✅ Restore complete!')
      return backupData
      
    } catch (error) {
      console.error('❌ Restore failed:', error)
      return null
    }
  }
  
  startAutoBackup() {
    // Backup every 5 minutes
    setInterval(() => {
      this.backupToCloud()
    }, this.backupInterval)
    
    console.log('🔄 Auto-backup enabled (every 5 minutes)')
  }
  
  shouldBackup() {
    const lastBackup = localStorage.getItem('lastBackup')
    if (!lastBackup) return true
    
    const timeSinceBackup = Date.now() - parseInt(lastBackup)
    return timeSinceBackup > this.backupInterval
  }
}

export const backupService = new BackupService()
export default backupService
