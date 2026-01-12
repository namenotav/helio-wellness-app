# 🔍 COMPREHENSIVE APP ANALYSIS REPORT
## Helio Wellness App - Full QA & Security Audit
**Generated:** 2024
**Package:** com.helio.wellness
**Stack:** React 19 + Capacitor 7 + Firebase

---

## 📊 FEATURE INVENTORY TABLE

### 🏠 MAIN SCREENS (5 Primary + 2 Admin)

| Screen | File | Entry Point | Tab/Route |
|--------|------|-------------|-----------|
| Landing Page | `LandingPage.jsx` | `/` | Root |
| Dashboard | `NewDashboard.jsx` | `/dashboard` | Main App |
| Admin Dashboard | `AdminDashboard.jsx` | `/admin` | Admin |
| Admin Support | `AdminSupportDashboard.jsx` | `/admin-support` | Admin |
| Payment Success | `PaymentSuccess.jsx` | `/payment-success` | Stripe callback |
| Payment Canceled | `PaymentCanceled.jsx` | `/payment-canceled` | Stripe callback |

### 📱 DASHBOARD TABS (5 Bottom Nav Tabs)

| Tab | Component | Icon | Purpose |
|-----|-----------|------|---------|
| Home | `HomeTab` (inline) | 🏠 | Main stats, quick actions |
| Voice | `VoiceTabRedesign.jsx` | 🎤 | AI voice coach |
| Scan | `ScanTabRedesign.jsx` | 📸 | Food/barcode scanning |
| Zen | `ZenTabRedesign.jsx` | 🧘 | Mental wellness |
| Me | `ProfileTabRedesign.jsx` | 👤 | Profile, settings |

---

## 🎯 COMPLETE MODAL/FEATURE LIST (75 Components)

### 🥇 KILLER FEATURES (7 Core)

| Feature | Component | Entry | Data Stored | Network |
|---------|-----------|-------|-------------|---------|
| Health Avatar | `HealthAvatar.jsx` | Me Tab → Health Avatar | health_avatar_data (Preferences) | None |
| AR Scanner | `ARScanner.jsx` | Scan Tab → AR | None | None |
| Food Scanner | `FoodScanner.jsx` | Scan Tab / FAB | foodLog (Firestore) | Railway AI |
| Emergency Panel | `EmergencyPanel.jsx` | Me Tab → Emergency | emergency_data, emergency_contacts | GPS API |
| DNA Upload | `DNAUpload.jsx` | Me Tab → DNA | dnaAnalysis, dnaRawData | None |
| Social Battles | `SocialBattles.jsx` | Me Tab → Battles | battles_data | Firestore |
| Meal Automation | `MealAutomation.jsx` | Me Tab → Meals | meal_automation_settings | Railway AI |

### 🏋️ HEALTH TRACKING (15 Components)

| Feature | Component | Data Key | Storage |
|---------|-----------|----------|---------|
| Step Counter | `StepCounter.jsx` | wellnessai_todaySteps, stepHistory | Preferences + Firestore |
| Rep Counter | `RepCounter.jsx` | workoutHistory | localStorage |
| Workouts Modal | `WorkoutsModalNew.jsx` | workoutHistory | Firestore |
| Heart Rate | (inline modal) | heartRateData | localStorage |
| Sleep Tracking | (inline modal) | sleepLog | Firestore |
| Water Intake | (inline modal) | waterLog | Firestore |
| Quick Log | `QuickLogModal.jsx` | Multiple | Firestore |
| Today Overview | `TodayOverview.jsx` | READ ONLY | - |
| Stats Modal | `StatsModal.jsx` | READ ONLY | - |
| Full Stats | (inline modal) | READ ONLY | - |
| Monthly Stats | `MonthlyStatsModal.jsx` | READ ONLY | - |
| Weekly Comparison | `WeeklyComparison.jsx` | READ ONLY | - |
| Progress Modal | `ProgressModal.jsx` | READ ONLY | - |
| Goals Modal | `GoalsModal.jsx` | gamification_data | Preferences |
| Daily Challenges | `DailyChallenges.jsx` | gamification_data | Preferences |

### 🧘 MENTAL WELLNESS (6 Components)

| Feature | Component | Data Key |
|---------|-----------|----------|
| Breathing Exercise | (inline modal) | meditation_stats |
| Guided Meditation | (inline modal) | meditationLog |
| Stress Relief | (inline modal) | stressLog |
| Gratitude Journal | `GratitudeJournal.jsx` | gratitudeLog |
| Zen Tab | `ZenTabRedesign.jsx` | mood_data |
| Podcasts | `PodcastsModal.jsx` | None |

### 🍽️ NUTRITION (8 Components)

| Feature | Component | Network Endpoint |
|---------|-----------|-----------------|
| Food Scanner | `FoodScanner.jsx` | Railway /api/v1/vision |
| Barcode Scanner | `BarcodeScanner.jsx` | OpenFoodFacts API, USDA API |
| Food Modal | `FoodModal.jsx` | None |
| DNA Modal | `DNAModal.jsx` | None |
| Recipe Builder | `RecipeBuilder.jsx` | None |
| Recipe Creator | `RecipeCreator.jsx` | Railway /api/chat |
| Community Recipes | `CommunityRecipes.jsx` | Firestore |
| Meal Automation | `MealAutomation.jsx` | Railway /api/chat |

### 🎮 GAMIFICATION (6 Components)

| Feature | Component | Data Key |
|---------|-----------|----------|
| Level Progress | `LevelProgressBar.jsx` | gamification_data |
| Streak Counter | `StreakCounter.jsx` | gamification_data |
| Achievement Unlock | `AchievementUnlock.jsx` | achievements |
| Points Popup | `PointsPopup.jsx` | gamification_data |
| Daily Challenges | `DailyChallenges.jsx` | gamification_data |
| Battles Modal | `BattlesModal.jsx` | battles_data |

### 🤖 AI FEATURES (7 Components)

| Feature | Component | Network Endpoint |
|---------|-----------|-----------------|
| AI Assistant | `AIAssistantModal.jsx` | Railway /api/v1/chat |
| AI Workout Gen | `AIWorkoutGenerator.jsx` | Railway /api/chat |
| Brain Insights | `BrainInsightsDashboard.jsx` | Local TensorFlow.js |
| Voice Tab | `VoiceTabRedesign.jsx` | Railway /api/v1/chat |
| Food Analysis | `FoodScanner.jsx` | Railway /api/v1/vision |
| Learning Service | `learningService.js` | Gemini API (direct) |
| Recommendation | `recommendationService.js` | Railway |

### 💰 MONETIZATION (7 Components)

| Feature | Component | Network |
|---------|-----------|---------|
| Stripe Payment | `StripePayment.jsx` | Stripe Checkout |
| Paywall Modal | `PaywallModal.jsx` | None |
| Premium Modal | `PremiumModal.jsx` | None |
| Ad Rewards | `AdRewardSystem.jsx` | AdMob |
| Referral System | `ReferralSystem.jsx` | Firestore |
| Limited Offer | `LimitedTimeOffer.jsx` | None |
| Usage Warning | `UsageLimitWarning.jsx` | None |

### ⚙️ SETTINGS & PROFILE (12 Components)

| Feature | Component | Data Key |
|---------|-----------|----------|
| Profile Setup | `ProfileSetup.jsx` | user_profile |
| Settings Hub | `SettingsHubModal.jsx` | Multiple |
| Theme Modal | (inline) | themeSettings |
| Notifications | (inline) | notificationSettings |
| Data Management | `DataManagementModal.jsx` | Multiple |
| Data Recovery | `DataRecovery.jsx` | ALL DATA |
| Health Tools | `HealthToolsModal.jsx` | None |
| Social Features | `SocialFeaturesModal.jsx` | None |
| Apple Health | `AppleHealthSync.jsx` | None |
| Wearable Sync | `WearableSync.jsx` | None |
| Dev Unlock | `DevUnlock.jsx` | helio_dev_mode |
| Cookie Consent | `CookieConsent.jsx` | cookieConsent |

### 📞 SUPPORT & LEGAL (4 Components)

| Feature | Component | Network |
|---------|-----------|---------|
| Support Modal | `SupportModal.jsx` | Firestore |
| Legal Modal | `LegalModal.jsx` | None |
| Consent Modal | `ConsentModal.jsx` | None |
| Error Boundary | `ErrorBoundary.jsx` | None |

---

## 🌐 API ENDPOINTS INVENTORY

### Railway Backend (Primary)
```
Base: https://helio-wellness-app-production.up.railway.app

/api/v1/chat          - AI Chat (Gemini proxy)
/api/v1/vision        - Food image analysis
/api/chat             - Legacy chat endpoint
/api/vision           - Legacy vision endpoint
/api/user/delete      - GDPR data deletion
/api/escrow/*         - Battle money escrow
/api/subscription/*   - Stripe webhook handlers
```

### Third-Party APIs
```
Firebase Firestore    - User data, recipes, battles
Firebase Auth         - Authentication
OpenFoodFacts         - https://world.openfoodfacts.org/api/v0/product/{barcode}.json
USDA FoodData         - https://api.nal.usda.gov/fdc/v1/foods/search
OpenStreetMap         - https://nominatim.openstreetmap.org/reverse (geocoding)
Google Analytics      - https://www.googletagmanager.com/gtag/js
ElevenLabs TTS        - https://api.elevenlabs.io/v1/text-to-speech
TikTok TTS            - https://api16-normal-c-useast1a.tiktokv.com (unofficial)
Google Translate TTS  - https://translate.google.com/translate_tts
ResponsiveVoice       - https://code.responsivevoice.org/responsivevoice.js
Stripe                - Checkout links (buy.stripe.com)
Google Fit            - OAuth scopes (fitness.activity.read, etc.)
```

---

## 📦 DATA STORAGE MAPPING

### Capacitor Preferences (Permanent - survives uninstall)
```javascript
// Critical keys with wellnessai_ prefix
wellnessai_user                  // User object
wellnessai_stepHistory           // Step data array
wellnessai_todaySteps            // Today's step count
wellnessai_stepBaseline          // Step counter baseline
wellnessai_stepBaselineDate      // Baseline date
wellnessai_weeklySteps           // 7-day array
wellnessai_gamification_data     // XP, level, streak
wellnessai_user_profile          // Profile data
wellnessai_foodLog               // Meals logged
wellnessai_waterLog              // Water intake
wellnessai_sleepLog              // Sleep sessions
wellnessai_workoutHistory        // Workout sessions
wellnessai_meditation_stats      // Meditation data
wellnessai_migration_v1          // Migration flag
```

### localStorage (Cache - cleared on reinstall)
```javascript
// Legacy/cache keys
stepHistory, foodLog, waterLog, sleepLog, workoutHistory
loginHistory, themeSettings, notificationSettings
onboardingCompleted, cookieConsent, helio_dev_mode
```

### Firebase Firestore (Cloud)
```
/users/{userId}/
  - profile
  - stepHistory
  - weeklySteps
  - foodLog
  - waterLog
  - sleepLog
  - workoutHistory
  - gamification_data
  - subscription

/recipes/{recipeId}/         - Community recipes
/battles/{battleId}/         - Social battles
/supportTickets/{ticketId}/  - Support tickets
```

---

## 🚨 SECURITY FINDINGS

### 🔴 CRITICAL ISSUES (FIXED ✅)

| Issue | Location | Risk | Status |
|-------|----------|------|--------|
| Hardcoded API Key | `humanVoiceService.js:195` | ~~HIGH~~ | ✅ **FIXED** - Moved to `VITE_RESPONSIVEVOICE_KEY` env var |
| Fallback Dev Password | `devAuthService.js:21` | ~~MEDIUM~~ | ✅ **FIXED** - Removed hardcoded fallback, requires env var in production |

### 🟠 REMAINING ISSUES

| Issue | Location | Risk | Recommendation |
|-------|----------|------|----------------|
| Google Fit OAuth ID | `AndroidManifest.xml` | MEDIUM | OAuth client ID in manifest (required by Google) |
| TikTok Unofficial API | `directAudioService.js:69` | MEDIUM | Using unofficial TTS endpoint |
| CALL_PHONE Permission | Manifest | HIGH | Can make calls - needs justification |
| SYSTEM_ALERT_WINDOW | Manifest | HIGH | Can draw over other apps |
| Stripe Links Exposed | `stripeService.js:83-89` | LOW | Payment links visible (but public anyway) |

### 🟡 MEDIUM ISSUES

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Dev Mode in Production | `DevUnlock.jsx` | Add release build check |
| Console Logging | Multiple files | Use `if(import.meta.env.DEV)` consistently |
| Social Login Hardcoded | `socialLoginService.js:174` | Apple redirect URI placeholder |
| No Rate Limiting UI | All API calls | Add rate limit feedback |

### 🟢 GOOD PRACTICES FOUND

- ✅ Firebase API keys via environment variables
- ✅ PBKDF2 password hashing (100k iterations)
- ✅ Dual storage (Preferences + Firestore)
- ✅ ErrorBoundary for crash handling
- ✅ Firestore security rules exist
- ✅ **ResponsiveVoice key now uses env var**
- ✅ **Dev password requires env var in production**
- ✅ GDPR consent modal
- ✅ Data export functionality

---

## 🔧 NATIVE JAVA SERVICES (14 Files)

| Service | Purpose | Foreground Type |
|---------|---------|-----------------|
| `StepCounterForegroundService.java` | 24/7 step counting | health |
| `StepCounterBridge.java` | JS ↔ Native bridge | - |
| `StepCounterPlugin.java` | Capacitor plugin | - |
| `FallDetectionService.java` | Fall detection | health |
| `FallDetectionBridge.java` | JS ↔ Native bridge | - |
| `FallAlertActivity.java` | Lock screen alert | - |
| `HealthMonitoringService.java` | Background health | health, location |
| `HealthMonitoringBridge.java` | JS ↔ Native bridge | - |
| `HealthConnectBridge.java` | Health Connect API | - |
| `HealthConnectPluginWrapper.java` | Plugin wrapper | - |
| `PermissionBridge.java` | Permission requests | - |
| `PermissionHelper.java` | Permission utilities | - |
| `MainActivity.java` | Main activity | - |

---

## 🐛 BUG CANDIDATES & EDGE CASES

### Data Consistency Issues (Previously Fixed)
- [x] DailyChallenges reading from wrong storage
- [x] ProfileTabRedesign workout/food count
- [x] MonthlyStatsModal meditation data
- [x] PointsPopup localStorage vs service
- [x] LevelProgressBar syntax error
- [x] StreakCounter duplicate calls

### Potential Issues to Test

| Scenario | Component | Risk |
|----------|-----------|------|
| Offline food scan | FoodScanner.jsx | May fail silently |
| Step counter baseline reset | StepCounterForegroundService | Data loss on new day |
| Battle with offline opponent | SocialBattles.jsx | Sync issues |
| Stripe webhook timeout | stripeService.js | Subscription not activated |
| Fall detection false positive | FallDetectionService | Annoyance |
| Memory pressure | Brain.js models | Crash potential |
| Deep link handling | MainActivity.java | Not implemented |
| Background location | HealthMonitoringService | Battery drain |

### Missing Error Handling

| Component | Missing |
|-----------|---------|
| `aiVisionService.js` | Network timeout handling |
| `geminiService.js` | Rate limit feedback |
| `stripeService.js` | Payment failure UI |
| `healthConnectBridge.java` | Permission denied handling |

---

## 📱 PERMISSION AUDIT (23 Permissions)

### Justified Permissions
| Permission | Used By | Justified |
|------------|---------|-----------|
| INTERNET | All API calls | ✅ Yes |
| CAMERA | Food/barcode scanner | ✅ Yes |
| ACTIVITY_RECOGNITION | Step counter | ✅ Yes |
| ACCESS_FINE_LOCATION | Emergency, GPS | ✅ Yes |
| FOREGROUND_SERVICE_HEALTH | Step counter | ✅ Yes |
| POST_NOTIFICATIONS | Reminders | ✅ Yes |

### Questionable Permissions
| Permission | Concern |
|------------|---------|
| CALL_PHONE | Only used in emergency - needs in-app disclosure |
| SYSTEM_ALERT_WINDOW | Fall alert - may conflict with Android 14+ |
| ACCESS_BACKGROUND_LOCATION | Battery concern - should be optional |
| RECORD_AUDIO | Voice input - but may not be needed |

---

## 🧪 TESTING CHECKLIST

### Critical Flows
- [ ] Sign up → Profile setup → Dashboard
- [ ] Food scan → Log meal → See in stats
- [ ] Start step tracking → Walk → See count update
- [ ] Start battle → Complete challenge → Settlement
- [ ] Subscribe → Stripe checkout → Return → Premium active
- [ ] Emergency contact → Fall detection → Alert sent

### Edge Cases
- [ ] No internet: All features with graceful degradation
- [ ] First launch: Onboarding flow
- [ ] Low storage: Data not lost
- [ ] App killed: Background services resume
- [ ] New day: Step counter resets correctly
- [ ] Timezone change: Dates handled correctly

### Performance
- [ ] Dashboard load time < 2s
- [ ] AI response time < 5s
- [ ] Step counter accuracy ±5%
- [ ] Memory usage < 300MB
- [ ] Battery drain < 5%/hour active

---

## 📋 RECOMMENDED FIXES

### Priority 1 (Security)
1. Remove hardcoded ResponsiveVoice API key
2. Add release build check to DevUnlock
3. Document CALL_PHONE permission usage
4. Review SYSTEM_ALERT_WINDOW on Android 14+

### Priority 2 (Stability)
1. Add network timeout to all API calls
2. Implement retry logic for Stripe webhooks
3. Add offline mode indicator
4. Fix potential memory leaks in Brain.js

### Priority 3 (UX)
1. Add loading states to all async operations
2. Show rate limit warnings
3. Add haptic feedback consistency
4. Improve error messages

---

**Analysis Complete** ✅
