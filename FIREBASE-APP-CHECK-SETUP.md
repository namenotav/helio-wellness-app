# Firebase App Check Setup Guide
## Protect Your Firebase Backend from Bots and Abuse

### 🎯 What is Firebase App Check?

Firebase App Check helps protect your Firebase resources (Firestore, Realtime Database, Cloud Storage, Cloud Functions) from abuse by ensuring requests come from your authentic app, not bots or unauthorized clients.

**Benefits:**
- ✅ Blocks bots from scraping Firestore data
- ✅ Prevents quota exhaustion attacks
- ✅ Reduces unauthorized API usage
- ✅ Protects against credential stuffing
- ✅ Enterprise-grade security without code changes

---

### 📋 Prerequisites

- ✅ Google Play Store account (for Play Integrity API)
- ✅ App published to Play Store OR enrolled in internal testing
- ✅ Android package name registered in Firebase console

---

### 🔧 Step 1: Enable App Check in Firebase Console

1. **Navigate to Firebase Console:**
   ```
   https://console.firebase.google.com/project/wellnessai-app-e01be/appcheck
   ```

2. **Register Your App:**
   - Click "Register app" for Android
   - Select your Android app (`com.helio.wellness`)

3. **Choose Attestation Provider:**
   - For **Production**: Select "Play Integrity"
   - For **Development**: Select "Debug token"

4. **Enable Enforcement:**
   - Firestore: ✅ Enable
   - Cloud Storage: ✅ Enable
   - Cloud Functions: ✅ Enable (if you add Cloud Functions later)

---

### 🔐 Step 2: Configure Play Integrity API

1. **Link to Google Play:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Navigate to your app → Release → App Integrity
   - **Enable Play Integrity API**

2. **Get SHA-256 Fingerprint:**
   ```powershell
   cd android
   .\gradlew signingReport
   ```
   
   Copy the **SHA-256** fingerprint (looks like: `A1:B2:C3:...`)

3. **Add Fingerprint to Firebase:**
   - Firebase Console → Project Settings → Your Apps → Android app
   - Click "Add fingerprint"
   - Paste SHA-256 value
   - Click "Save"

---

### 💻 Step 3: Add App Check to Your Code

#### **Install App Check SDK:**

```powershell
npm install firebase/app-check --legacy-peer-deps
```

#### **Update `src/config/firebase.js`:**

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

// 🔐 SECURITY: Initialize App Check (bot protection)
if (typeof window !== 'undefined') {
  // For web (development only - use debug token)
  if (import.meta.env.DEV) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }
  
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true // Auto-refresh tokens
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

#### **For Android (Native App Check):**

Update `android/app/build.gradle`:

```gradle
dependencies {
    implementation 'com.google.firebase:firebase-appcheck-playintegrity:18.0.0'
}
```

Update `MainActivity.java`:

```java
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;

@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Initialize App Check with Play Integrity
    FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
    firebaseAppCheck.installAppCheckProviderFactory(
        PlayIntegrityAppCheckProviderFactory.getInstance()
    );
}
```

---

### 🧪 Step 4: Setup Debug Token (Development)

1. **Generate Debug Token:**
   ```javascript
   // Add to src/config/firebase.js temporarily
   if (import.meta.env.DEV) {
     const { getToken } = await import('firebase/app-check');
     const appCheckTokenResponse = await getToken(app, true);
     console.log('🔑 Debug Token:', appCheckTokenResponse.token);
   }
   ```

2. **Register Debug Token:**
   - Copy token from console
   - Firebase Console → App Check → Apps → Android app
   - Click "Manage debug tokens"
   - Paste token and save

3. **Add to `.env`:**
   ```
   VITE_APPCHECK_DEBUG_TOKEN=<your-debug-token>
   ```

---

### ✅ Step 5: Test App Check

1. **Deploy App:**
   ```powershell
   npm run build
   npx cap sync android
   cd android
   .\gradlew assembleDebug
   adb install -r app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Verify in Firebase Console:**
   - Firebase Console → App Check → Metrics
   - Should show "Verified requests" increasing
   - "Rejected requests" should be 0 (unless bots are blocked)

3. **Test Without App Check:**
   - Try accessing Firestore from browser DevTools (should fail)
   - Try using curl/Postman (should get 403 Forbidden)

---

### 🚨 Troubleshooting

#### **Error: "App Check token validation failed"**
- ✅ Ensure SHA-256 fingerprint matches your signing key
- ✅ Check that Play Integrity API is enabled
- ✅ Verify app is enrolled in Play Store testing (alpha/beta/internal)

#### **Error: "Play Integrity API not found"**
- ✅ Update Google Play Services on test device
- ✅ Ensure device is signed into Google account
- ✅ Use physical device (emulators may not support Play Integrity)

#### **Works in Dev but Fails in Production:**
- ✅ Remove `FIREBASE_APPCHECK_DEBUG_TOKEN` from production builds
- ✅ Ensure production SHA-256 fingerprint is registered
- ✅ Wait 10-15 minutes for Firebase to propagate changes

---

### 📊 Expected Results

**Before App Check:**
- Bots can freely read Firestore data
- Unlimited API quota abuse possible
- Anonymous attackers can spam endpoints

**After App Check:**
- Only verified app instances can access Firebase
- Bots receive 403 Forbidden errors
- API quota protected from abuse
- **Security Score: A+ (100/100)** 🎉

---

### 🔗 Resources

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [Play Integrity API Setup](https://developer.android.com/google/play/integrity/setup)
- [App Check with Capacitor](https://capacitorjs.com/docs/guides/firebase-app-check)

---

### 🎯 Estimated Time

- ⏱️ **Setup:** 30-45 minutes
- ⏱️ **Testing:** 15 minutes
- ⏱️ **Total:** 1 hour

**Priority:** ⚠️ **LOW** (nice-to-have, not critical for launch)  
**Impact:** 🛡️ **MEDIUM** (blocks bots, reduces costs)  
**Difficulty:** ⚡ **MEDIUM** (requires Google Play Store setup)

---

### ✅ Completion Checklist

- [ ] Firebase App Check enabled in console
- [ ] Play Integrity API configured
- [ ] SHA-256 fingerprint registered
- [ ] App Check SDK added to code
- [ ] Debug token registered for development
- [ ] Tested in production build
- [ ] Verified metrics in Firebase Console
- [ ] Documented in deployment guide
