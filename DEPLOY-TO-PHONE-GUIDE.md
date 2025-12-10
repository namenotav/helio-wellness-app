# 📱 Deploy to Android Phone - Complete Guide

## ✅ BUILD & SYNC COMPLETE

Your app has been successfully:
- ✅ Built for production (`npm run build`)
- ✅ Synced to Android project (`npx cap sync android`)
- ✅ Android Studio is opening

---

## 🚀 DEPLOY OPTIONS

### **OPTION A: Direct Install via Android Studio (RECOMMENDED)**

1. **Connect Your Phone:**
   - Connect Android phone via USB cable
   - Enable USB debugging: Settings → Developer Options → USB Debugging
   - Accept "Allow USB Debugging" popup on phone

2. **In Android Studio (now opening):**
   - Wait for Gradle sync to complete (bottom status bar)
   - Top toolbar: Select your phone from device dropdown
   - Click green ▶️ **Run** button
   - Wait 30-60 seconds for installation
   - App launches automatically on your phone!

---

### **OPTION B: Generate APK for Manual Install**

```powershell
# Navigate to Android project
cd android

# Build debug APK (unsigned, for testing)
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Install APK on Phone:**
1. Copy `app-debug.apk` to phone (USB, email, cloud)
2. On phone: Tap APK file → Install
3. Enable "Install from Unknown Sources" if prompted
4. Launch Helio from app drawer

---

### **OPTION C: Build Release APK (For Production)**

```powershell
cd android

# Build release APK (requires signing)
./gradlew assembleRelease
```

⚠️ **Requires signing key setup** (see below)

---

## 🔐 SIGNING SETUP (For Release Builds)

**Generate Keystore:**
```powershell
keytool -genkey -v -keystore helio-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias helio-key
```

**Add to `android/gradle.properties`:**
```properties
HELIO_RELEASE_STORE_FILE=helio-release-key.jks
HELIO_RELEASE_KEY_ALIAS=helio-key
HELIO_RELEASE_STORE_PASSWORD=your_password
HELIO_RELEASE_KEY_PASSWORD=your_password
```

**Update `android/app/build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file(HELIO_RELEASE_STORE_FILE)
            storePassword HELIO_RELEASE_STORE_PASSWORD
            keyAlias HELIO_RELEASE_KEY_ALIAS
            keyPassword HELIO_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## 🎉 NEW FEATURES IN THIS BUILD

### **1. Family Members (Premium/Ultimate)**
- **Premium:** 3 family sub-accounts
- **Ultimate:** 5 family sub-accounts
- Separate health data per member
- Profile switcher in dashboard
- Auto-upgrade prompts for Free/Essential users

### **2. Avatar Generator (All Plans)**
- AI-powered body predictions (30/60/90 days)
- **Essential:** Weekly regeneration limit
- **Premium/Ultimate:** Unlimited regenerations
- Uses your health data for accurate forecasts

### **3. API Access (Ultimate Only)**
- Auto-generate API keys
- 1,000 API calls/month limit
- Rate limiting & usage tracking
- Full REST API documentation
- Regenerate keys anytime

### **4. Conversion Features**
- Usage limit warnings with upgrade prompts
- Referral system (earn free months)
- Ad reward system (watch 30s ads for credits)
- Limited-time offers (FOMO popups)
- Social proof notifications (real-time upgrades)

### **5. Pricing Update**
- **Free:** Basic features, usage limits
- **Essential £4.99:** Email support, avatar (weekly)
- **Premium £14.99:** Priority chat, 3 family members, unlimited avatars
- **Ultimate £29.99:** Phone support, 5 family members, API access, coaching

---

## 📊 TESTING CHECKLIST

Once installed, test these features:

- [ ] **Landing Page:** Check new pricing (Free/£4.99/£14.99/£29.99)
- [ ] **Family Members:** Settings → Family Members (Premium/Ultimate)
- [ ] **Avatar Generator:** Dashboard → Health Avatar → Generate Predictions
- [ ] **API Access:** Settings → Developer → API Keys (Ultimate only)
- [ ] **Usage Limits:** Trigger free plan limits to see upgrade prompts
- [ ] **Referral System:** Settings → Invite Friends → Copy referral code
- [ ] **Ad Rewards:** Trigger ad playback for earning credits
- [ ] **Limited Offers:** Check FOMO popup (first-time offer banner)
- [ ] **Social Proof:** Watch for upgrade notification floaters

---

## 🔧 TROUBLESHOOTING

### **"Device Not Found" in Android Studio:**
- Reconnect USB cable
- Try different USB port
- Enable "Transfer Files" mode on phone (not "Charging Only")
- Run: `adb devices` in terminal to check connection

### **"Unauthorized" Error:**
- Check phone for "Allow USB Debugging" popup
- Uncheck & re-check USB Debugging in phone settings

### **Gradle Build Fails:**
- Android Studio: File → Invalidate Caches → Invalidate and Restart
- Run: `cd android && ./gradlew clean`

### **App Crashes on Launch:**
- Check Logcat in Android Studio for errors
- Ensure `.env` file has valid `VITE_GEMINI_API_KEY`
- Firebase config: `src/config/firebase.js` must be correct

### **Hot Reload Not Working:**
- Kill dev server: `Ctrl+C`
- Rebuild: `npm run build && npx cap sync android`
- Reinstall app from Android Studio

---

## 🚨 IMPORTANT NOTES

1. **Firebase Setup:** Ensure Firebase project is configured:
   - Authentication enabled (Email/Password)
   - Firestore database created
   - Collections: `users`, `familyMembers`, `apiKeys`, `healthData`

2. **Gemini API Key:** `.env` must have:
   ```
   VITE_GEMINI_API_KEY=AIzaSy...
   ```

3. **Stripe Keys:** For payments, update `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Google Fit OAuth:** For Android Health Connect:
   - Google Cloud Console → APIs → Health Connect API → Enable
   - OAuth consent screen configured

---

## 🎯 NEXT STEPS

1. **Test on phone** - Verify all features work
2. **Fix any bugs** - Check Logcat for errors
3. **App Store Submission:**
   - Build release APK with signing
   - Google Play Console → Create new release
   - Upload APK + screenshots + description
   - Submit for review (1-3 days approval)

4. **Monitor Usage:**
   - Firebase Analytics dashboard
   - Track conversions (Free → Paid)
   - Monitor API costs (Gemini usage)
   - Check referral performance

---

## 📞 SUPPORT

**If deployment fails:**
1. Check this guide's troubleshooting section
2. Run: `npx cap doctor` for diagnostics
3. Check Android Studio Logcat for error messages
4. Verify all environment variables in `.env`

**Commands to rebuild & redeploy:**
```powershell
# Full rebuild
npm run build
npx cap sync android
npx cap open android

# Quick sync (if only changing JS/CSS)
npm run build
npx cap copy android
```

---

## 🎊 CONGRATULATIONS!

You now have:
- ✅ Sustainable 4-tier pricing model
- ✅ 5 conversion optimization features
- ✅ Family Members management
- ✅ AI Avatar Generator
- ✅ API Access for developers
- ✅ Complete deployment pipeline

**Projected Revenue (Year 1):**
- Free users: 6,000 (60% of 10K)
- Essential (£4.99): 3,000 users → £179,640/year
- Premium (£14.99): 800 users → £143,904/year
- Ultimate (£29.99): 200 users → £71,976/year
- **TOTAL: £395,520/year** 🚀

**vs. Old Model: £22,000/year** (18x improvement!)

---

**Good luck with your launch! 🎉**
