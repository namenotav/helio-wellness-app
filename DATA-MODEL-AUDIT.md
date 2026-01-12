# Data Model & Storage Audit Report

**Date:** January 8, 2026  
**Auditor:** AI Data Integrity Agent

---

## 🚨 CRITICAL FINDINGS SUMMARY

| Issue | Severity | Description |
|-------|----------|-------------|
| **Duplicate Sources** | 🔴 HIGH | Most entities stored in 3+ locations (localStorage, Preferences, Firestore) |
| **No Single Source of Truth** | 🔴 HIGH | Modals/components read from different sources, causing data conflicts |
| **Key Naming Inconsistency** | 🟡 MEDIUM | Some use `wellnessai_` prefix, others don't |
| **Migration Complexity** | 🟡 MEDIUM | Old localStorage keys still read for migration |

---

## 📊 DATA ENTITIES AUDIT

### 1. STEPS DATA

| Field | Type | Description |
|-------|------|-------------|
| `steps` | number | Step count for a day |
| `date` | string | ISO date (YYYY-MM-DD) |
| `timestamp` | number | Unix timestamp |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **CapacitorStorage (Android)** | `wellnessai_todaySteps` | `StepCounterForegroundService.java` | `NewDashboard.jsx`, `GoalsModal.jsx` |
| **CapacitorStorage (Android)** | `wellnessai_stepHistory` | `StepCounterForegroundService.java` | - |
| **CapacitorStorage (Android)** | `wellnessai_stepBaseline` | `StepCounterForegroundService.java` | - |
| **CapacitorStorage (Android)** | `wellnessai_stepBaselineDate` | `StepCounterForegroundService.java` | - |
| **localStorage** | `stepHistory` | `gamificationService.js` | `MonthlyStatsModal.jsx`, `gamificationService.js` |
| **Firestore** | `stepHistory` | `nativeHealthService.js` | `MonthlyStatsModal.jsx`, `NewDashboard.jsx` |
| **Firestore** | `weeklySteps` | `NewDashboard.jsx`, `nativeHealthService.js` | `NewDashboard.jsx` |

**🎯 CANONICAL SOURCE:** `wellnessai_todaySteps` in CapacitorStorage (Android native service)

**⚠️ CONFLICTS:**
- `MonthlyStatsModal` merges localStorage + Firestore stepHistory → potential duplicates
- `gamificationService` reads from localStorage only → stale data possible

---

### 2. WATER INTAKE

| Field | Type | Description |
|-------|------|-------------|
| `cups` | number | Number of cups (250ml each) |
| `date` | string | ISO date |
| `timestamp` | number | Unix timestamp |
| `amount` | number | ml (in waterIntakeService) |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **Firestore** | `waterLog` | `waterIntakeService.js`, `NewDashboard.jsx` | `NewDashboard.jsx`, `GoalsModal.jsx`, `MonthlyStatsModal.jsx` |
| **localStorage** | `waterLog` | Legacy code | `NewDashboard.jsx` (refresh function), `gamificationService.js`, `DailyChallenges.jsx` |
| **Preferences** | `wellnessai_waterLog` | - | `DailyChallenges.jsx` (tries first) |

**🎯 CANONICAL SOURCE:** Firestore `waterLog`

**⚠️ CONFLICTS:**
- `DailyChallenges.jsx` checks Preferences first, falls back to localStorage, ignores Firestore
- `gamificationService.js` reads ONLY from localStorage
- `NewDashboard.refreshData()` reads from localStorage, not Firestore

---

### 3. FOOD LOG / MEALS

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Food name |
| `calories` | number | Calorie count |
| `protein` | number | Protein in grams |
| `carbs` | number | Carbs in grams |
| `fat` | number | Fat in grams |
| `date` | string | ISO date |
| `timestamp` | number | Unix timestamp |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **User Profile** | `profile.foodLog` | `authService.js` | `MonthlyStatsModal.jsx` |
| **Preferences** | `foodLog` | `authService.js` | `MonthlyStatsModal.jsx` |
| **localStorage** | `foodLog` | `authService.js`, `syncService.js` | `MonthlyStatsModal.jsx`, `pdfExportService.js`, `gamificationService.js` |
| **Firestore** | `foodLog` | `syncService.js` | `MonthlyStatsModal.jsx` |

**🎯 CANONICAL SOURCE:** Firestore `foodLog` (via syncService)

**⚠️ CONFLICTS:**
- `MonthlyStatsModal.jsx` merges ALL 4 sources (userProfile + Preferences + localStorage + Firestore)
- `pdfExportService.js` reads ONLY from localStorage
- `gamificationService.js` reads ONLY from localStorage

---

### 4. WORKOUT HISTORY

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique workout ID |
| `type` / `activity` | string | Workout type |
| `duration` | number | Minutes |
| `calories` | number | Burned |
| `date` | string | ISO date |
| `timestamp` | number | Unix timestamp |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **localStorage** | `workoutHistory` | `workoutService.js` | `NewDashboard.jsx`, `MonthlyStatsModal.jsx`, `DailyChallenges.jsx`, `ProfileTabRedesign.jsx` |
| **Preferences** | `wellnessai_workoutHistory` | - | `DailyChallenges.jsx`, `ProfileTabRedesign.jsx` |
| **Firestore** | `workoutHistory` | `workoutService.js` | `NewDashboard.jsx`, `MonthlyStatsModal.jsx` |

**🎯 CANONICAL SOURCE:** Firestore `workoutHistory` (via workoutService)

**⚠️ CONFLICTS:**
- `DailyChallenges.jsx` tries Preferences first, falls back to localStorage
- `NewDashboard.refreshData()` reads from localStorage only

---

### 5. SLEEP LOG

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique sleep ID |
| `hours` / `duration` | number | Hours slept |
| `quality` | number | Quality score (1-10) |
| `bedtime` | string | Time went to bed |
| `wakeTime` | string | Wake time |
| `date` | string | ISO date |
| `timestamp` | number | Unix timestamp |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **localStorage** | `sleepLog` | `sleepService.js` | `NewDashboard.jsx` (FullStatsModal, CalendarModal) |
| **Firestore** | `sleepLog` | `sleepService.js` | `NewDashboard.jsx`, `FullStatsModal` |

**🎯 CANONICAL SOURCE:** Firestore `sleepLog`

**⚠️ CONFLICTS:**
- `CalendarModal` inside NewDashboard reads ONLY from localStorage

---

### 6. MEDITATION LOG

| Field | Type | Description |
|-------|------|-------------|
| `duration` | number | Minutes |
| `type` | string | Meditation type |
| `date` | string | ISO date |
| `timestamp` | number | Unix timestamp |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **localStorage** | `meditationLog` | `breathingService.js` | `gamificationService.js` |
| **Firestore** | `meditationLog` | `breathingService.js` | `NewDashboard.jsx` |
| **Preferences** | `wellnessai_meditation_stats` | ZenTab | `MonthlyStatsModal.jsx` |

**🎯 CANONICAL SOURCE:** Firestore `meditationLog`

---

### 7. GAMIFICATION DATA

| Field | Type | Description |
|-------|------|-------------|
| `level` | number | User level |
| `xp` | number | Current XP |
| `totalXP` | number | Lifetime XP |
| `streak` | number | Current streak days |
| `longestStreak` | number | Best streak |
| `achievements` | array | Unlocked achievements |
| `stats.totalSteps` | number | Lifetime steps |
| `stats.totalWater` | number | Lifetime water cups |
| `stats.totalMeals` | number | Lifetime meals |
| `stats.totalWorkouts` | number | Lifetime workouts |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **localStorage** | `gamification_data` | `gamificationService.js` | `gamificationService.js` |
| **Firestore** | `gamification_data` | `gamificationService.js` | `gamificationService.js` |

**🎯 CANONICAL SOURCE:** Firestore `gamification_data`

**⚠️ CONFLICTS:**
- `gamificationService.loadData()` recalculates `stats.*` from localStorage arrays, NOT from Firestore
- Can overwrite cloud data with stale local counts

---

### 8. USER PROFILE

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name |
| `email` | string | Email |
| `age` | number | Age |
| `weight` | number | Weight (kg) |
| `height` | number | Height (cm) |
| `allergies` | array | Food allergies |
| `dietaryRestrictions` | array | Dietary preferences |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **localStorage** | `wellnessai_user` | `authService.js` | `authService.js` |
| **Preferences** | `wellnessai_user` | `authService.js` | `authService.js` |
| **localStorage** | `user_profile` | `syncService.js` | `dataControlService.js`, `BattlesModal.jsx` |
| **Firestore** | `user_profile` | `authService.js`, `syncService.js` | `authService.js`, `BattlesModal.jsx` |

**🎯 CANONICAL SOURCE:** Firestore `user_profile`

---

### 9. SUBSCRIPTION DATA

| Field | Type | Description |
|-------|------|-------------|
| `plan` | string | 'free', 'starter', 'ultimate' |
| `status` | string | 'active', 'cancelled', 'none' |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **localStorage** | `subscription_plan` | `subscriptionService.js`, `StripePayment.jsx` | `subscriptionService.js` |
| **localStorage** | `subscription_status` | `subscriptionService.js` | `subscriptionService.js` |

**🎯 CANONICAL SOURCE:** Firebase Auth (server-side) → synced to localStorage

**⚠️ NO CLOUD BACKUP** - Subscription data only in localStorage, can be lost!

---

### 10. DNA ANALYSIS

| Field | Type | Description |
|-------|------|-------------|
| `traits` | array | DNA traits |
| `uploadDate` | string | When uploaded |
| `provider` | string | 23andMe, AncestryDNA, etc. |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **localStorage** | `dnaAnalysis` | DNAUpload component | `DNAModal.jsx`, `pdfExportService.js` |
| **Firestore** | `dnaAnalysis` | DNAUpload component | `DNAModal.jsx` |
| **Preferences** | `dna_genetic_data` | `dnaService.js` | `dnaService.js` |
| **Preferences** | `dna_analysis` | `dnaService.js` | `dnaService.js` |

**🎯 CANONICAL SOURCE:** Firestore `dnaAnalysis`

---

### 11. EMERGENCY DATA

| Field | Type | Description |
|-------|------|-------------|
| `contacts` | array | Emergency contact list |
| `medicalInfo` | object | Medical conditions, allergies |
| `fallDetectionEnabled` | boolean | Fall detection on/off |

**Storage Locations:**

| Location | Key | Writer | Reader |
|----------|-----|--------|--------|
| **Preferences** | `emergency_data` | `emergencyService.js` | `emergencyService.js`, `FallAlertActivity.java` |

**🎯 CANONICAL SOURCE:** Preferences `emergency_data`

---

## 📋 CRITICAL KEYS BY STORAGE TYPE

### CapacitorStorage (Android SharedPreferences)
```
wellnessai_todaySteps      → Today's step count (JSON string)
wellnessai_stepBaseline    → Baseline for calculation
wellnessai_stepBaselineDate → Date of baseline
wellnessai_stepHistory     → Array of daily step records
```

### Preferences (@capacitor/preferences)
```
wellnessai_user            → User profile object
wellnessai_waterLog        → Water intake log
wellnessai_workoutHistory  → Workout history
wellnessai_meditation_stats → Meditation statistics
emergency_data             → Emergency contacts & settings
dna_genetic_data           → Raw DNA data
dna_analysis               → Analyzed DNA traits
```

### localStorage (Browser)
```
stepHistory                → Step history array
waterLog                   → Water log array
foodLog                    → Food log array
workoutHistory             → Workout history array
sleepLog                   → Sleep log array
meditationLog              → Meditation log array
gamification_data          → XP, levels, achievements
subscription_plan          → Current subscription tier
dnaAnalysis                → DNA analysis results
user_profile               → User profile backup
```

### Firestore (Cloud)
```
users/{uid}/data/stepHistory
users/{uid}/data/weeklySteps
users/{uid}/data/waterLog
users/{uid}/data/foodLog
users/{uid}/data/workoutHistory
users/{uid}/data/sleepLog
users/{uid}/data/meditationLog
users/{uid}/data/gamification_data
users/{uid}/data/user_profile
users/{uid}/data/dnaAnalysis
users/{uid}/data/emergency_data
users/{uid}/data/health_avatar_data
```

---

## 🔧 RECOMMENDED FIXES

### 1. **Establish Single Source of Truth**
For each entity, define ONE canonical source:
- **Steps:** `wellnessai_todaySteps` (Android native) + Firestore `stepHistory` (historical)
- **All other logs:** Firestore ONLY, with localStorage as cache

### 2. **Unify Read Patterns**
All components should read from the same service:
```javascript
// BAD - Direct localStorage read
const waterLog = JSON.parse(localStorage.getItem('waterLog') || '[]');

// GOOD - Service layer read
const waterLog = await syncService.getData('waterLog', userId);
```

### 3. **Remove Duplicate Writes**
Don't save to multiple locations manually. Use syncService:
```javascript
// syncService handles localStorage + Preferences + Firestore
await syncService.saveData('waterLog', waterLog, userId);
```

### 4. **Fix gamificationService Counter Sync**
Change line 283-292 to read from Firestore, not localStorage:
```javascript
const workoutHistory = await firestoreService.get('workoutHistory', uid);
const foodLog = await firestoreService.get('foodLog', uid);
```

### 5. **Add Cloud Backup for Subscription**
Save subscription data to Firestore on purchase:
```javascript
await firestoreService.save('subscription_data', {
  plan: 'ultimate',
  status: 'active',
  purchaseDate: new Date().toISOString()
}, userId);
```

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        ANDROID NATIVE                            │
│  StepCounterForegroundService.java                               │
│  ↓ writes to CapacitorStorage                                    │
│  wellnessai_todaySteps, wellnessai_stepHistory                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  syncService.js ←────────────────────────────────────────────── │
│  ↓ reads/writes                                                  │
│  Preferences (local) ←→ Firestore (cloud) ←→ localStorage (cache)│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UI COMPONENTS                               │
│  NewDashboard.jsx, GoalsModal.jsx, StatsModal.jsx, etc.         │
│  ⚠️ PROBLEM: Some read directly from localStorage!               │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ AUDIT COMPLETE

**Total Entities Audited:** 11  
**Critical Conflicts Found:** 8  
**Recommended Priority:** HIGH - Fix gamificationService and modal read patterns

