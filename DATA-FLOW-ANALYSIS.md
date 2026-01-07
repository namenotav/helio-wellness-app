// COMPREHENSIVE DATA FLOW ANALYSIS
// This traces the COMPLETE path from step counting to Monthly Stats

## STEP 1: Where Steps Are Initially Captured
- **Native Step Counter Service** (Android foreground service)
  - Location: `android/app/src/main/java/.../AndroidStepCounterPlugin.java`
  - Saves to: `Preferences.set({ key: 'wellnessai_todaySteps' })`
  - Format: `{ "steps": 4493, "date": "2026-01-06", "timestamp": 1736182764000 }`

## STEP 2: How NewDashboard Reads Steps
- **loadRealData()** function (line 880-1090)
  - Reads from: `Preferences.get({ key: 'wellnessai_todaySteps' })`
  - Parses step count: `4493`
  - Stores in state: `setStats({ todaySteps: 4493 })`

## STEP 3: How Steps Are Saved to stepHistory
**THREE DIFFERENT PLACES TRY TO SAVE stepHistory:**

### A. NewDashboard.jsx (line 1055-1072)
```javascript
const stepHistoryRaw = JSON.parse(localStorage.getItem('stepHistory') || '[]')
const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : []

// Update or add today's entry
const existingTodayIndex = stepHistory.findIndex(s => s.date === todayDate)
if (existingTodayIndex >= 0) {
  stepHistory[existingTodayIndex] = { steps: todaySteps, date: todayDate, timestamp: Date.now() }
} else {
  stepHistory.push({ steps: todaySteps, date: todayDate, timestamp: Date.now() })
}
localStorage.setItem('stepHistory', JSON.stringify(stepHistory))
```
✅ **CORRECT FORMAT**: Array of objects `[{date, steps, timestamp}]`
❌ **PROBLEM**: Only saves to localStorage, NOT Firestore!

### B. nativeHealthService.js (line 998-1041)
```javascript
let stepHistory = []
const parsed = stepHistoryRaw ? JSON.parse(stepHistoryRaw) : []
if (Array.isArray(parsed)) {
  stepHistory = parsed
} else if (parsed && typeof parsed === 'object') {
  stepHistory = Object.values(parsed).filter(item => item && item.date)
}

// Update or add
const todayIndex = stepHistory.findIndex(entry => entry.date === today)
if (todayIndex >= 0) {
  stepHistory[todayIndex].steps = realStepCount
} else {
  stepHistory.push({ date: today, steps: realStepCount })
}

localStorage.setItem('stepHistory', JSON.stringify(stepHistory))
await firestoreService.save('stepHistory', stepHistory, authService.getCurrentUser()?.uid)
```
✅ **CORRECT FORMAT**: Array
✅ **Saves to Firestore**: YES!
❌ **PROBLEM**: This function is NEVER CALLED!

### C. stepCounterService.js (line 136-139)
```javascript
localStorage.setItem('stepHistory', JSON.stringify({
  steps,
  date: new Date().toISOString().split('T')[0],
  timestamp: Date.now()
}))
```
❌ **WRONG FORMAT**: Single object `{date, steps, timestamp}` not array!
❌ **Overwrites existing data**: Every save destroys previous entries!
❌ **Problem**: This MIGHT be called, corrupting the array

## STEP 4: How MonthlyStatsModal Reads Data
```javascript
// Line 50-51
const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]')
const firestoreStepHistory = await firestoreService.get('stepHistory', userId) || []
```

**Expected**: `[{date: "2026-01-06", steps: 4493}, {date: "2026-01-05", steps: 3200}]`
**Actually Getting**:
- localStorage: Either `[]` empty, OR `{date: "2026-01-06", steps: 4493}` single object
- Firestore: `null` (nothing saved)

## CRITICAL FINDINGS:

### Issue #1: nativeHealthService.saveStepData() is NEVER called
- This is the ONLY function that saves stepHistory to Firestore
- But no code actually invokes it
- Result: Firestore stays empty forever

### Issue #2: Multiple competing save mechanisms
- NewDashboard saves to localStorage (array format) ✅
- stepCounterService might overwrite with object format ❌
- nativeHealthService would save correctly but is never called ❌

### Issue #3: stepHistory format inconsistency
- Should be: `[{date, steps}, {date, steps}]` array
- Sometimes is: `{date, steps}` single object
- MonthlyStatsModal expects array
- When it gets object, `.filter()` fails silently

### Issue #4: Firestore writes show "success" but nothing saves
- firestoreService.save() catches errors and falls back to localStorage
- Console shows "✅ Firestore saved" even when Firebase rejected it
- No actual validation that data was written

## ROOT CAUSES (Priority Order):

1. **HIGHEST**: nativeHealthService.saveStepData() is never invoked
   - This is the only place that saves stepHistory to Firestore
   - No other code calls this function
   - Result: Firestore is permanently empty

2. **HIGH**: stepCounterService might corrupt localStorage format
   - Line 136 saves single object instead of array
   - This overwrites properly formatted array from NewDashboard
   - Breaks Monthly Stats filtering

3. **MEDIUM**: No validation of Firestore writes
   - Saves show "success" but data might not persist
   - UID mismatch between auth and document path
   - Security rules might be rejecting writes

4. **LOW**: MonthlyStatsModal doesn't handle corrupted data
   - Should validate array format
   - Should show error if data is wrong type
   - Currently fails silently

## RECOMMENDED FIXES:

### Fix #1: Call nativeHealthService.saveStepData()
Add to NewDashboard.jsx after line 1072:
```javascript
localStorage.setItem('stepHistory', JSON.stringify(stepHistory))
// NEW: Also save to Firestore via nativeHealthService
try {
  const nativeHealthService = (await import('../services/nativeHealthService')).default
  await nativeHealthService.saveStepData(todaySteps, { /* health data */ })
} catch (err) {
  console.warn('Could not save to Firestore:', err)
}
```

### Fix #2: Remove stepCounterService localStorage writes
Delete lines 136-139 in stepCounterService.js - it's corrupting data

### Fix #3: Add Firestore write validation
After firestoreService.save(), read it back to confirm:
```javascript
await firestoreService.save('stepHistory', stepHistory, userId)
const verification = await firestoreService.get('stepHistory', userId)
if (!verification || verification.length === 0) {
  console.error('❌ Firestore write FAILED - data not persisted!')
}
```

### Fix #4: Add data validation to MonthlyStatsModal
```javascript
const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]')
if (!Array.isArray(stepHistory)) {
  console.error('❌ stepHistory is not an array!', typeof stepHistory)
  stepHistory = [] // Reset to empty array
}
```

## NEXT STEPS:

1. Verify nativeHealthService.saveStepData() is never called (search codebase)
2. Check if stepCounterService is actively running and corrupting data
3. Add logging to see which save mechanism wins
4. Implement fixes in priority order
5. Test with actual data on phone
