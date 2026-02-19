# HELIO WELLNESS AI — LAUNCH READINESS SPEC
**Date:** February 19, 2026  
**Auditor Role:** Senior Product Engineer + QA Lead + Security Reviewer  
**App:** Helio WellnessAI  
**Platform:** Android (Capacitor 7) + Web (PWA)  
**Stack:** React 19 + Vite 7 + Capacitor 7 + Firebase (Auth/Firestore/RTDB) + Express 5 on Railway + Stripe + Gemini AI  
**Users:** Health-conscious consumers (free, starter £6.99, premium £16.99, ultimate £34.99)  

---

## TABLE OF CONTENTS
- A) [Launch Readiness Spec — Feature Acceptance Criteria](#a-launch-readiness-spec)
- B) [Test Plan + Implementation](#b-test-plan)
- C) [Security Review Findings + Fixes](#c-security-review)
- D) [Production Readiness Setup](#d-production-readiness)
- E) [Pre-Launch Checklist](#e-pre-launch-checklist)
- F) [Risk Register](#f-risk-register)

---

# A) LAUNCH READINESS SPEC

## Core User Journeys

### Journey 1: Sign Up → Onboarding → Dashboard
| Step | Acceptance Criteria | Edge Cases |
|------|-------------------|------------|
| Open app (first time) | ConsentModal shown. Blocks usage until all 3 checkboxes accepted | Decline → app should show explanation, NOT `about:blank` (current bug) |
| Sign up | Email + Password + Name → Firebase account created | Duplicate email, weak password, network timeout, back button during sign-up |
| Onboarding | 8-step carousel → saves `onboardingCompleted` to Preferences | Skip button works. Back button on step 1. Crash mid-onboarding |
| ProfileSetup | 5-step wizard (avatar → allergens → basics → medical → lifestyle) | Camera fails on avatar, empty name, zero height/weight, back button |
| Dashboard loads | Steps, water, workouts, sleep, meals, score visible. Step counter notification running | First load with zero data. Slow Firestore. Missing Preferences |

**Definition of Done:** New user goes from install → onboarding → dashboard with step counter active in under 60 seconds on 4G.

### Journey 2: Food Scan → Log → View History
| Step | Acceptance Criteria | Edge Cases |
|------|-------------------|------------|
| Open Food Scanner | Camera permission requested. Preview shown | Permission denied, no camera, camera in use by other app |
| Take photo | Photo captured, "Analyzing…" spinner | Blurry photo, too dark, not food, camera crash |
| AI analysis | Calories, macros, allergen alerts returned in <8s | Gemini timeout, rate limit, server 500, invalid JSON response |
| Log food | Entry saved to localStorage + Preferences + Firestore | Offline save, duplicate submit, empty calories |
| View history | FoodModal shows past scans with dates | Zero scans, 1000+ scans, corrupted JSON |

**Definition of Done:** User scans food, sees nutrition + allergen info, saves to log. Viewable next session.

### Journey 3: Subscribe → Pay → Access Premium Features
| Step | Acceptance Criteria | Edge Cases |
|------|-------------------|------------|
| Hit feature limit | PaywallModal shown with plan comparison | Multiple rapid taps on limited feature |
| Select plan | Redirects to Stripe Checkout | Network failure before redirect, back button |
| Payment | Stripe handles. Webhook updates subscription in Firestore | Card declined, 3D Secure, webhook failure, duplicate webhook |
| Return | PaymentSuccess page verifies, redirects to dashboard in 3s | Timeout on verification, close browser before return |
| Access premium | `subscriptionService.hasAccess()` returns true for unlocked features | Cache stale, server down, subscription expired mid-session |

**Definition of Done:** User pays, returns, all premium features unlocked within 30 seconds. Survives app restart.

### Journey 4: Daily Step Tracking → Progress Chart
| Step | Acceptance Criteria | Edge Cases |
|------|-------------------|------------|
| Foreground service starts | Notification shows "0 steps today" | Permission denied, battery optimization kills service |
| Walk | Step count increments in real-time in notification + dashboard | Sensor reset (reboot), negative steps, >40k steps |
| Midnight | Previous day saved to `wellnessai_stepHistory`, counters reset to 0 | App not opened all day, app open at midnight, timezone change |
| Progress Modal | Weekly chart (Mon-Sun) shows each day's steps | Missing days show 0, first week of use, data corruption |

**Definition of Done:** Steps counted 24/7, every day's final count persisted, chart shows accurate 7-day history.

### Journey 5: AI Chat Coach → Personalized Advice
| Step | Acceptance Criteria | Edge Cases |
|------|-------------------|------------|
| Open AI Assistant | Chat UI loads with greeting | No internet, user not logged in |
| Send message | Message appears, "typing" indicator, response in <5s | Empty message, 10000-char message, rapid fire 20 messages |
| AI responds | Contextual response using user health data + memory | API timeout, rate limit (100/hr), malformed response |
| History | Previous conversations persist across sessions | 1000+ messages, storage full |

**Definition of Done:** User sends message, AI replies with health-context-aware answer. History survives restart.

---

## Feature Acceptance Matrix

| Feature | Free | Starter | Premium | Ultimate | Pass Criteria |
|---------|------|---------|---------|----------|--------------|
| Step Counter | ✅ Unlimited | ✅ | ✅ | ✅ | 24/7 native tracking, real-time dashboard |
| Water Tracking | ✅ Unlimited | ✅ | ✅ | ✅ | Add/remove cups, daily goal, persists |
| Food Scanner | 5/day | ✅ Unlimited | ✅ | ✅ | Camera → AI → nutrition data → logged |
| AI Chat | 10/day | 25/day | ✅ Unlimited | ✅ | Message → server → Gemini → response |
| Barcode Scanner | 5/day | ✅ | ✅ | ✅ | Scan → USDA/OpenFoodFacts lookup |
| Workouts | 1/day | ✅ | ✅ | ✅ | Log type, duration, calories burned |
| Breathing Exercises | 1/day | ✅ | ✅ | ✅ | Timer, patterns, persists session |
| Meditation | 1/day | ✅ | ✅ | ✅ | Guided sessions, ambient sounds |
| Heart Rate | ❌ | ✅ | ✅ | ✅ | PPG via camera flash measurement |
| Sleep Tracking | ❌ | ✅ | ✅ | ✅ | Bedtime/wake logging |
| Social Battles | View only | ✅ | ✅ | ✅ | Challenge friends, leaderboard |
| DNA Analysis | ❌ | ❌ | ✅ | ✅ | Upload 23andMe → genetic insights |
| Health Avatar | ❌ | ❌ | ✅ | ✅ | 3D character reflecting health stats |
| AR Scanner | 3/day | ❌ | ✅ | ✅ | AR overlay on food |
| Meal Automation | ❌ | ❌ | ❌ | ✅ | AI meal plans → grocery lists |
| Emergency Panel | ❌ | ❌ | ✅ | ✅ | SOS contacts, fall detection |
| PDF Export | ❌ | ❌ | ✅ | ✅ | Download health report as PDF |

---

## Error Handling Rules

1. **Every network request** MUST: have a timeout (≤15s), catch errors, show user-facing message via `showToast()`, never use `alert()`
2. **Every data parse** MUST: wrap `JSON.parse()` in try/catch, validate `Array.isArray()` where arrays expected, fall back to empty default
3. **Every modal/form** MUST: disable submit button while processing, show loading indicator, show error inline (not alert)
4. **No silent failures**: Every `catch` block must either log with `productionLogger.error()` OR show Toast OR both. Zero empty catch blocks.
5. **Offline behavior**: Queue writes for sync, show offline indicator, read from local cache, never crash

---

# B) TEST PLAN

## Current State: ZERO tests exist
No `.test.js`, `.spec.js`, or test framework installed. No CI test step.

## Proposed Test Architecture

### Framework: Vitest (fastest for Vite projects)
```
Dependencies to install:
  vitest, @testing-library/react, @testing-library/jest-dom,
  @testing-library/user-event, jsdom, msw (Mock Service Worker)
```

### Test Structure
```
src/
  __tests__/
    unit/
      authService.test.js
      subscriptionService.test.js
      rateLimiterService.test.js
      encryptionService.test.js
      gamificationService.test.js
      dataService.test.js
      stepHistory.test.js
    integration/
      auth-flow.test.js
      payment-flow.test.js
      food-scanner.test.js
      sync-service.test.js
    e2e/
      signup-to-dashboard.test.js
      scan-food-log.test.js
      subscribe-premium.test.js
    security/
      xss-prevention.test.js
      api-auth.test.js
      input-validation.test.js
```

### Unit Tests (Priority Order)

| # | Test File | What It Tests | Key Cases |
|---|-----------|--------------|-----------|
| 1 | `authService.test.js` | Sign-up, sign-in, sign-out, session persistence | Valid creds, invalid email, weak password, duplicate account, expired session, corrupted Preferences |
| 2 | `subscriptionService.test.js` | Plan detection, feature access, limit checking | Free user blocked from premium, paid user allowed, expired sub downgraded, dev mode bypass |
| 3 | `rateLimiterService.test.js` | Rate limit enforcement per action | Under limit → allowed, at limit → blocked, window expiry → reset, unknown action |
| 4 | `encryptionService.test.js` | AES-256 encrypt/decrypt round-trip | Valid data, empty string, large payload, corrupted key, key rotation |
| 5 | `gamificationService.test.js` | XP award, level calculation, streak tracking | XP for each action, level-up threshold, streak break on missed day |
| 6 | `dataService.test.js` | 4-layer save/get (localStorage → Preferences → RTDB → Firestore) | One layer fails, all layers fail, data consistency |
| 7 | `stepHistory.test.js` | Step history array management, day rollover | New day adds entry, same day updates, 30-day trim, corrupted data recovery |

### Integration Tests

| # | Test File | What It Tests | Key Cases |
|---|-----------|--------------|-----------|
| 1 | `auth-flow.test.js` | Sign-up → profile save → sign-out → sign-in | Profile persists, Firestore sync works or fails gracefully |
| 2 | `payment-flow.test.js` | Checkout → webhook → subscription status | Stripe mock, webhook signature, plan mapping, cancel flow |
| 3 | `food-scanner.test.js` | Photo → server → Gemini → parse → save | Mock server, valid/invalid AI responses, offline mode |
| 4 | `sync-service.test.js` | Offline queue → reconnect → sync | Queue 10 items, come online, verify all synced |

### End-to-End Tests (Playwright recommended for web; Detox for native)

| # | Journey | Steps | Pass Criteria |
|---|---------|-------|--------------|
| 1 | Signup→Dashboard | Open → consent → signup → onboarding → dashboard | Dashboard visible with 0 steps, 0 water |
| 2 | Food Scan | Dashboard → scan tab → camera → analyze → log | Food entry in history |
| 3 | Subscribe | Dashboard → feature limit → paywall → Stripe → success | Premium features unlocked |

### Negative Tests

| # | Test | Expected Result |
|---|------|----------------|
| 1 | Sign up with `'; DROP TABLE users;--` as name | Name sanitized, no injection |
| 2 | Send 101 AI messages in 1 hour | Rate limit error after 100 |
| 3 | Set `localStorage.helio_dev_mode = true` as non-dev device | Premium features still locked (after server-side fix) |
| 4 | Call `/api/subscription/cancel` without auth header | 401 Unauthorized (after server-side fix) |
| 5 | Submit food scan with 50MB image | Size limit error, not crash |
| 6 | Open app with corrupted `wellnessai_stepHistory` | Graceful reset to empty array |
| 7 | Reboot phone mid-step-count | Steps preserved via `stepsBeforeReset` |

### Regression Suite (must never break)
1. Auth sign-up/sign-in flows
2. Step counter accuracy (live count + history persistence)
3. Food scanner returns valid nutrition data
4. Subscription paywall blocks free users from premium features
5. Stripe checkout creates valid session
6. Data survives app restart (steps, water, workouts, sleep)
7. ErrorBoundary catches crashes and shows recovery UI

### Commands
```bash
# Install test framework
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom msw

# Run all tests
npx vitest run

# Run with coverage
npx vitest run --coverage

# Run specific suite
npx vitest run src/__tests__/unit/authService.test.js

# Watch mode during development
npx vitest watch
```

### Coverage Target: 60% lines (business logic services), 40% overall
**Rationale:** This is a mobile app with heavy native plugins (Camera, Sensors, Foreground Service) that can't be unit-tested without device mocking. Focus coverage on pure business logic services (auth, subscription, gamification, data, rate-limiting) where bugs cause the most damage.

---

# C) SECURITY REVIEW

## CRITICAL — Must Fix Before Launch

### C1. Stripe Webhook Secret Committed to Git
- **File:** `SUBSCRIPTION-VERIFICATION-COMPLETE.md` line 253
- **Exposed:** `whsec_REDACTED` (full webhook secret — ROTATED)
- **Also Exposed:** `sk_live_51SNC8tD2EDcoPFLN...` (partial live secret key)
- **Impact:** Anyone with repo access can forge webhook events → grant themselves free subscriptions
- **Fix:** 
  1. Rotate webhook secret in Stripe Dashboard immediately
  2. Rotate API secret key in Stripe Dashboard
  3. Update Railway env vars with new secrets
  4. Delete or redact the markdown file
  5. Add `*.md` secret scanning to CI

### C2. ALL Server Endpoints Have Zero Authentication
- **Affected Endpoints (11 total):**

| Endpoint | Method | Risk |
|----------|--------|------|
| `/api/subscription/cancel` | POST | **Anyone can cancel anyone's subscription** |
| `/api/user/delete` | DELETE | **Anyone can delete any user's data (GDPR abuse)** |
| `/api/backup` | POST/GET | Anyone can read/write anyone's backup data |
| `/api/battles` | GET/POST/PUT | Anyone can create/modify battles |
| `/api/notifications/send` | POST | Anyone can send push notifications to any device |
| `/api/subscription/status/:userId` | GET | Anyone can check subscription status (info disclosure) |
| `/api/stripe/create-checkout` | POST | Anyone can create checkout sessions for any userId |
| `/api/chat` | POST | Open proxy to Gemini API (cost abuse) |
| `/api/vision` | POST | Open proxy to Gemini Vision API (cost abuse) |
| `/api/feedback` | POST | Spam vector |
| `/api/create-payment-intent` | POST | **Returns mock "succeeded" payment — dev stub** |

- **Fix:** Add Firebase Auth token verification middleware to ALL endpoints that take userId or modify data:
  ```javascript
  async function verifyAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const token = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(token);
      req.userId = decoded.uid;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  ```

### C3. Gemini API Key Exposed Client-Side (4 locations)
- **Files calling Gemini directly from client:**
  - `src/services/recommendationService.js` line 6 — stores `VITE_GEMINI_API_KEY`
  - `src/services/learningService.js` line 7 — stores `VITE_GEMINI_API_KEY`
  - `src/services/learningService.js` lines 235, 310 — calls `generativelanguage.googleapis.com` directly with API key in URL
  - `src/components/AIWorkoutGenerator.jsx` line 26, 61 — calls Gemini directly
  - `src/components/AvatarGenerator.jsx` line 70 — uses `GoogleGenerativeAI(key)` directly
- **Impact:** API key is visible in bundled JavaScript AND in network requests. Anyone can extract it and abuse it (running up your Gemini billing).
- **Fix:** Route ALL Gemini calls through the Railway server (like `geminiService.js` already does correctly). Remove `VITE_GEMINI_API_KEY` from frontend entirely.

### C4. Mock Payment Intent Endpoint Active in Production
- **File:** `server.js` 
- **Endpoint:** `POST /api/create-payment-intent`
- **Issue:** Returns hardcoded `{ clientSecret: 'mock_...', status: 'succeeded' }` — real Stripe code is commented out
- **Impact:** Could be exploited to bypass payment verification
- **Fix:** Either implement real Stripe PaymentIntent or remove this endpoint entirely (the Checkout Session flow in `/api/stripe/create-checkout` is the real flow).

## HIGH — Fix Before or Shortly After Launch

### C5. Admin Dashboard Has No Auth Gate
- **File:** `src/components/AdminDashboard.jsx`
- **Issue:** Route `/admin` renders admin dashboard for anyone. No login, no role check.
- **Fix:** Either remove the route, add Firebase Auth check + admin UID allowlist, or use Firebase custom claims.

### C6. AdminSupportDashboard Has No Role Check
- **File:** `src/pages/AdminSupportDashboard.jsx`
- **Issue:** Requires Firebase login but ANY Firebase user gets admin access
- **Fix:** Add admin UID allowlist or Firebase custom claims check after authentication.

### C7. Dev Mode Bypasses All Paywalls (Client-Side)
- **File:** `src/services/subscriptionService.js`
- **Issue:** `hasAccess()` returns `true` for everything if `localStorage.helio_dev_mode === 'true'`. Any user with browser DevTools can set this.
- **Fix:** Remove client-side dev mode bypass, or gate it behind `import.meta.env.DEV` so it's stripped from production builds.

### C8. OAuth Token in Plaintext localStorage
- **File:** `src/services/socialLoginService.js` line 281
- **Issue:** `localStorage.setItem('social_login_token', userData.token)` — accessible to any JS
- **Fix:** Use `secureStorageService` (already exists) or `@capacitor/preferences`

### C9. Encryption Key Stored in localStorage
- **File:** `src/services/encryptionService.js`
- **Issue:** AES-256 encryption key stored in `localStorage.__encryption_key__`. This means encrypted data and its decryption key live in the same store.
- **Impact:** Encryption provides zero protection against anyone who can read localStorage (XSS, device access)
- **Fix:** On native, store key in Android Keystore via a Capacitor plugin. On web, this is a fundamental limitation.

## MEDIUM — Fix in Next Sprint

### C10. Firestore Rules Allow `device_*` Write-All
- **File:** `firestore.rules`
- **Issue:** `allow read, write: if userId.matches('device_.*')` — any unauthenticated user with a `device_` prefix UID can read/write ANY data under their path
- **Fix:** Require `request.auth != null` for all paths. Use anonymous auth for device users.

### C11. Firebase RTDB Rules Missing Validation
- **File:** `database.rules.json`
- **Issue:** While read/write are properly scoped to `auth.uid`, there's no schema validation on `healthData` beyond `"auth != null"`. Any authenticated user can write arbitrary data to their healthData node.
- **Fix:** Add `.validate` rules for expected data shapes.

### C12. No CSRF Protection on Most Server Endpoints
- **Issue:** Only `/api/stripe/create-checkout` uses CSRF tokens. All other endpoints are unprotected.
- **Fix:** Add CSRF middleware to all mutation endpoints, or use Bearer token auth (which is inherently CSRF-proof).

### C13. Rate Limiter is IP-Based (Shared IPs)
- **Issue:** Server rate limiter uses `req.ip`. Mobile carriers share IPs across users → one abuser can rate-limit legitimate users.
- **Fix:** Use Firebase Auth UID for authenticated endpoints; keep IP for unauthenticated.

## LOW — Backlog

| # | Issue | Location |
|---|-------|----------|
| C14 | Password reset is a stub (no email sent) | `authService.js resetPassword()` |
| C15 | Deprecated `enableIndexedDbPersistence` API | `firestoreService.js` |
| C16 | Unguarded `console.log` in production server | `server.js` lines 145, 187, 206, 221, 244 |
| C17 | `devAuthService.changePassword()` references undeclared variable | Dead code, should remove |
| C18 | No Content Security Policy headers | `server.js` — add CSP headers |

---

# D) PRODUCTION READINESS

## Environment Variables Checklist

### Railway Server (`server.js`)
| Variable | Status | Required |
|----------|--------|----------|
| `STRIPE_SECRET_KEY` | ✅ Set | Yes — payments |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ **ROTATE** (leaked) | Yes — webhook verification |
| `MONGODB_URI` | ✅ Set | Yes — data storage |
| `GEMINI_API_KEY` | ✅ Set | Yes — AI features |
| `VITE_GEMINI_API_KEY` | ✅ Set (alias) | Redundant — use `GEMINI_API_KEY` only |
| `GEMINI_MODEL` | Optional | Default: `gemini-2.0-flash` |
| `NODE_ENV` | ✅ `production` | Yes — guards debug logs |
| `PORT` | Auto (Railway) | Default: 3001 |
| `STRIPE_ESSENTIAL_PRICE_ID` | ✅ Set | Yes — plan mapping |
| `STRIPE_PREMIUM_PRICE_ID` | ✅ Set | Yes — plan mapping |
| `STRIPE_ULTIMATE_PRICE_ID` | ✅ Set | Yes — plan mapping |

### Frontend (Vite `VITE_*`)
| Variable | Status | Required |
|----------|--------|----------|
| `VITE_FIREBASE_API_KEY` | ✅ Set | Yes — Firebase Auth |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ Set | Yes |
| `VITE_FIREBASE_DATABASE_URL` | ✅ Set | Yes |
| `VITE_FIREBASE_PROJECT_ID` | ✅ Set | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ Set | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ Set | Yes |
| `VITE_FIREBASE_APP_ID` | ✅ Set | Yes |
| `VITE_FIREBASE_MEASUREMENT_ID` | ✅ Set | Yes — analytics |
| `VITE_API_URL` | ✅ Set | Yes — Railway server URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ Set | Yes — Stripe frontend |
| `VITE_STRIPE_PRICE_STARTER` | ✅ Set | Yes |
| `VITE_STRIPE_PRICE_PREMIUM` | ✅ Set | Yes |
| `VITE_STRIPE_PRICE_ULTIMATE` | ✅ Set | Yes |
| `VITE_GEMINI_API_KEY` | ⚠️ **REMOVE** | **Should NOT be in frontend** |
| `VITE_USDA_API_KEY` | ✅ Set | Low-risk public key |

## Observability

### Current State
| Capability | Status | Notes |
|-----------|--------|-------|
| Error logging | ✅ `errorLogger.js` + `productionLogger.js` | Saves to localStorage, no remote ingestion |
| Analytics | ✅ Google Analytics (GA4 `G-N7GR8ES3GW`) | Behind cookie consent |
| Performance monitoring | ✅ `monitoringService.js` | Client-side only, no backend telemetry |
| Crash reporting | ✅ `ErrorBoundary.jsx` | Catches React crashes, does NOT report to external service |
| Server monitoring | ❌ None | Railway provides basic metrics only |

### What's Needed
1. **Remote error reporting**: Connect `productionLogger.flush()` to a real endpoint (Sentry, Bugsnag, or Railway log drain)
2. **Server APM**: Add `express-prom-bundle` or Railway Observability add-on
3. **Uptime monitoring**: Add health check endpoint monitoring (UptimeRobot, Better Uptime)
4. **Alerting**: Slack/email alerts on: server 500 rate >1%, Stripe webhook failures, Gemini API 4xx

## Backup & Data Strategy

### Current State
- **Firebase Firestore**: Auto-backed up by Google (if on Blaze plan with scheduled exports)
- **Firebase RTDB**: Auto-backed up by Google
- **MongoDB on Railway**: ⚠️ No automated backups configured
- **Client localStorage/Preferences**: Backed up to Firestore via syncService (60+ keys)
- **`cloudBackupService.js`**: ⚠️ Saves "backups" to localStorage only — NOT actually cloud

### What's Needed
1. Enable Firestore daily export to Cloud Storage
2. Configure MongoDB automated backups (Railway add-on or `mongodump` cron)
3. Either implement real cloud backup endpoint or remove the misleading service

## Feature Flags
✅ `featureFlagService.js` already exists with Firestore-backed flags, 5-min cache, per-plan + per-beta gating. This is sufficient.

## Graceful Degradation

| Integration | Current Failure Behavior | Needed |
|-------------|-------------------------|--------|
| Gemini AI | Error thrown → catch → generic error message | ✅ OK (could improve with retry) |
| Firebase Auth | Falls back to Preferences-based local auth | ✅ OK |
| Firestore | Falls back to localStorage | ✅ OK |
| Stripe | Error shown to user | ✅ OK |
| MongoDB | Falls back to in-memory storage | ⚠️ Data lost on restart |
| Step Counter sensor | Falls back to 0 steps | ✅ OK |
| Network (offline) | offlineService queues writes | ✅ OK |

---

# E) PRE-LAUNCH CHECKLIST

## Phase 1: Secrets & Security (Do First – 1 day)
- [ ] **ROTATE Stripe webhook secret** (leaked in `SUBSCRIPTION-VERIFICATION-COMPLETE.md`)
- [ ] **ROTATE Stripe secret key** (partially leaked in same file)
- [ ] Delete or heavily redact `SUBSCRIPTION-VERIFICATION-COMPLETE.md`
- [ ] Remove `VITE_GEMINI_API_KEY` from frontend — route all calls through server
- [ ] Add Firebase Auth middleware to ALL server endpoints
- [ ] Remove or secure `/api/create-payment-intent` mock endpoint
- [ ] Add admin UID allowlist to AdminDashboard and AdminSupportDashboard
- [ ] Fix dev mode bypass: gate behind `import.meta.env.DEV`

## Phase 2: Stability Fixes (2-3 days)
- [ ] Replace all 31 `alert()` calls in NewDashboard.jsx with `showToast()`
- [ ] Replace all other `alert()` calls across remaining components (~70 more)
- [ ] Add AbortController + 15s timeout to all `fetch()` calls (36+ locations)
- [ ] Fix ConsentModal decline → use `App.close()` via Capacitor instead of `about:blank`
- [ ] Fix 12 empty catch blocks — add `productionLogger.error()` or at minimum `console.warn()`
- [ ] Add empty-state UI to data-fetching components (ProgressModal, StatsModal, GoalsModal, etc.)
- [ ] Route `learningService.js`, `recommendationService.js`, `AIWorkoutGenerator.jsx`, `AvatarGenerator.jsx` Gemini calls through server

## Phase 3: Testing Infrastructure (2-3 days)
- [ ] Install Vitest + Testing Library + MSW
- [ ] Write unit tests for authService (sign-up, sign-in, sign-out)
- [ ] Write unit tests for subscriptionService (access checks, plan verification)
- [ ] Write unit tests for rateLimiterService (limit enforcement)
- [ ] Write unit tests for step history persistence logic
- [ ] Write integration test for food scanner flow (mock Gemini)
- [ ] Add Vitest to CI pipeline (`.github/workflows/deploy.yml`)

## Phase 4: Quality Gates (1 day)
- [ ] Add ESLint rule for no `alert()` usage
- [ ] Add ESLint rule for no empty catch blocks
- [ ] Add `eslint-plugin-jsx-a11y` for accessibility basics
- [ ] Update CI: `npm run lint` must pass before deploy
- [ ] Update CI: `npx vitest run` must pass before deploy
- [ ] Add `npm run typecheck` step (or consider migrating critical services to TypeScript)

## Phase 5: Pre-Launch Verification (1 day)
- [ ] **Smoke test all 5 journeys** on physical Android device
- [ ] Verify Stripe test mode → live mode transition
- [ ] Verify webhook endpoint receives events
- [ ] Create test accounts: free user, starter, premium, ultimate, admin
- [ ] Verify PaywallModal shows for free user attempting premium feature
- [ ] Verify step counter runs 24/7 with app closed
- [ ] Verify data survives app force-stop and restart
- [ ] Verify offline mode: turn off WiFi + data, use app, turn back on, verify sync
- [ ] Check Railway server health: `curl https://helio-wellness-app-production.up.railway.app/`
- [ ] Ensure Firebase Security Rules are deployed (not just in repo files)

## Rollback Plan
1. **Android APK:** Keep previous APK on device (`app-debug-v1.0.5.apk`). Install with `adb install -r <old-apk>`
2. **Railway server:** Railway auto-deploys from git. Revert commit + push to redeploy. Or use Railway dashboard to rollback to previous deployment.
3. **Firebase rules:** Revert via Firebase Console > Firestore > Rules > Version History
4. **Database:** If MongoDB backup exists, restore with `mongorestore`. For Firestore, use export from Cloud Storage.

## Legal Basics
- [x] Privacy Policy — exists in LegalModal (6 tabs: User Manual, Terms, Privacy, GDPR, Medical Disclaimer, Cookies)
- [x] Cookie Consent — CookieConsent component with accept/decline
- [x] GDPR consent — ConsentModal with 3 required checkboxes
- [x] Medical Disclaimer — exists in LegalModal
- [ ] **TODO:** Ensure Privacy Policy URL is accessible outside app (for Play Store listing)
- [ ] **TODO:** Add data deletion request mechanism accessible outside app (GDPR Art. 17)

---

# F) RISK REGISTER

| # | Risk | Severity | Likelihood | Impact | Mitigation | Status |
|---|------|----------|-----------|--------|------------|--------|
| R1 | **Stripe secrets in git history** | 🔴 CRITICAL | Confirmed | Account compromise, financial fraud | Rotate keys NOW, scan git history | **OPEN** |
| R2 | **Unauthenticated server endpoints** | 🔴 CRITICAL | Confirmed | Data deletion, subscription fraud, push spam | Add Firebase Auth middleware | **OPEN** |
| R3 | **Gemini API key in client bundle** | 🟠 HIGH | Confirmed | API cost abuse ($$$) | Route through server, remove VITE_ key | **OPEN** |
| R4 | **No admin access control** | 🟠 HIGH | Confirmed | Any user sees admin tools | Add admin UID allowlist | **OPEN** |
| R5 | **100+ alert() calls** | 🟡 MEDIUM | Confirmed | Bad UX, app feels broken | Replace with Toast | **OPEN** |
| R6 | **Zero automated tests** | 🟡 MEDIUM | Confirmed | Regressions on every change | Implement test suite | **OPEN** |
| R7 | **No fetch timeouts (36+ locations)** | 🟡 MEDIUM | Likely on mobile | App hangs on bad network | Add AbortController | **OPEN** |
| R8 | **Mock payment endpoint in prod** | 🟠 HIGH | Confirmed | Payment bypass | Remove or implement | **OPEN** |
| R9 | **No remote error reporting** | 🟡 MEDIUM | Certain | Blind to production crashes | Add Sentry/Bugsnag | **OPEN** |
| R10 | **MongoDB no backup** | 🟡 MEDIUM | Possible | Data loss | Configure automated backups | **OPEN** |
| R11 | **ConsentModal about:blank** | 🟡 MEDIUM | Every decline | White screen, forced reinstall | Fix to use Capacitor App.exitApp() | **OPEN** |
| R12 | **DevMode paywall bypass** | 🟠 HIGH | Confirmed | Revenue loss | Gate behind DEV env | **OPEN** |
| R13 | **Step history not saving some days** | ✅ FIXED | Was confirmed | Missing chart data | Java service now saves at midnight | **CLOSED** |
| R14 | **Cloud backup doesn't back up to cloud** | 🟡 MEDIUM | Confirmed | False sense of safety | Implement or remove service | **OPEN** |
| R15 | **No accessibility** | 🟡 MEDIUM | Confirmed | App store rejection, legal risk | Add aria-labels, keyboard nav | **OPEN** |
| R16 | **deprecated gemini-2.0-flash-exp model** in AIWorkoutGenerator | 🟡 MEDIUM | Will break | Workout generation fails | Update to `gemini-2.0-flash` | **OPEN** |

---

## PRIORITY ORDER FOR IMPLEMENTATION

**Sprint 1 (Ship-Blocking — this week):**
1. R1 — Rotate Stripe secrets
2. R2 — Add auth middleware to server
3. R3 — Remove client-side Gemini key
4. R8 — Remove mock payment endpoint
5. R4 — Add admin access control
6. R12 — Fix dev mode bypass

**Sprint 2 (Quality — next week):**
7. R5 — Replace alert() with Toast
8. R7 — Add fetch timeouts
9. R11 — Fix ConsentModal decline
10. R6 — Implement core test suite
11. R16 — Fix deprecated model name

**Sprint 3 (Hardening — week 3):**
12. R9 — Add Sentry/remote error reporting
13. R10 — Configure MongoDB backups
14. R14 — Fix or remove cloudBackupService
15. R15 — Basic accessibility pass
16. CI quality gates (lint + test in pipeline)

---

*This spec was produced from a full codebase audit of 100+ services, 83+ components, server.js (744 lines), Firestore rules, RTDB rules, CI config, and all data flow paths. Every finding is linked to exact files and lines. No code changes have been made — this is the plan.*
