# Build Instructions for Native Apps

## 🌐 Web App (Live Now)
**Current URL**: https://wellnessai-i4hbyfqg2-jjs-projects-ef9f338d.vercel.app
**GitHub Repo**: https://github.com/namenotav/helio-wellness-app

The web app is a Progressive Web App (PWA) that works on all devices:
- ✅ Install via "Add to Home Screen" on Android/iOS
- ✅ Full offline support
- ✅ Camera, GPS, notifications all work
- ✅ No app store approval needed

## 📱 Android APK Build

### Prerequisites
1. **Java JDK 17** - [Download here](https://adoptium.net/temurin/releases/?os=windows&arch=x64&package=jdk&version=17)
2. **Android Studio** - Already installed
3. **Connected Android device** or emulator

### Build Steps
```bash
# 1. Install dependencies
npm install

# 2. Build web assets
npm run build

# 3. Sync to native project
npx cap sync

# 4. Open in Android Studio
npx cap open android

# 5. In Android Studio:
# - Wait for Gradle sync to complete
# - Select your device (OnePlus CPH2551)
# - Click Run ▶️ button
# - App will install automatically
```

### Build Release APK
```bash
# In Android Studio:
# Build > Generate Signed Bundle / APK
# Select APK
# Create keystore or use existing
# Build Release APK
# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## 🍎 iOS App Build

### Prerequisites (Requires Mac)
1. **macOS computer**
2. **Xcode 14+** - [Mac App Store](https://apps.apple.com/app/xcode/id497799835)
3. **CocoaPods** - `sudo gem install cocoapods`
4. **Apple Developer Account** ($99/year)

### Build Steps
```bash
# 1. Install dependencies
npm install

# 2. Build web assets
npm run build

# 3. Sync to native project
npx cap sync

# 4. Install iOS pods
cd ios/App
pod install
cd ../..

# 5. Open in Xcode
npx cap open ios

# 6. In Xcode:
# - Select your development team
# - Connect iPhone via USB
# - Select device from dropdown
# - Click Run ▶️ button
```

### Build for App Store
```bash
# In Xcode:
# Product > Archive
# Window > Organizer
# Distribute App > App Store Connect
# Follow upload wizard
```

## 🚀 Quick Deploy Options

### Option 1: PWA (Recommended)
- **No build required**
- Already deployed at Vercel URL
- Users install via "Add to Home Screen"
- Works on all platforms
- Updates automatically

### Option 2: Native Android
- Requires Java JDK installation
- 5-10 minute build time
- Can distribute via Google Play Store
- Or share APK file directly

### Option 3: Native iOS
- Requires Mac with Xcode
- Apple Developer Program ($99/year)
- App Store review process (1-3 days)

## 📦 Current Features

### Web/PWA Features
- ✅ AI Coach (Gemini 2.5 Flash)
- ✅ Voice input/output
- ✅ Image recognition for food
- ✅ Habit tracking
- ✅ Progress photos
- ✅ Workout plans
- ✅ Nutrition logging
- ✅ Mental health tracking
- ✅ Offline support
- ✅ Stripe payments (£9.99/mo, £99/year)

### Native-Only Features (Android/iOS builds)
- ✅ GPS tracking with route export
- ✅ Health data integration (steps, calories, sleep)
- ✅ Background notifications
- ✅ Haptic feedback
- ✅ Native sharing
- ✅ Status bar theming

## 🔑 Environment Variables

⚠️ **SECURITY WARNING:** Never commit real API keys to Git!

Create `.env` file with:
```env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY_HERE
VITE_STRIPE_MONTHLY_PRICE_ID=YOUR_MONTHLY_PRICE_ID_HERE
VITE_STRIPE_YEARLY_PRICE_ID=YOUR_YEARLY_PRICE_ID_HERE
```

Get your API keys from:
- **Gemini:** https://aistudio.google.com/app/apikey
- **Stripe:** https://dashboard.stripe.com/apikeys

📖 See `SECURITY-SETUP.md` for complete security guide

## 📱 Testing

### Test on Your Phone (Easiest)
1. Open: https://wellnessai-i4hbyfqg2-jjs-projects-ef9f338d.vercel.app
2. Chrome menu > "Add to Home Screen"
3. Tap icon on home screen
4. Test all features

### Test Android Build
1. Connect OnePlus phone via USB
2. Enable USB debugging in Developer Options
3. Run `npx cap run android`
4. App installs and launches automatically

## 🆘 Troubleshooting

### "JAVA_HOME not set"
- Install Java JDK 17 from link above
- Restart terminal/Android Studio

### "Gradle sync failed"
- Open Android Studio
- File > Invalidate Caches > Restart
- Try sync again

### "No devices found"
- Enable USB debugging on phone
- Check USB cable is data cable (not charge-only)
- Run `adb devices` to verify connection

### iOS build fails
- Must use Mac computer
- Install Xcode from App Store
- Run `pod install` in `ios/App` folder

## 📞 Support

- GitHub Issues: https://github.com/namenotav/helio-wellness-app/issues
- Documentation: See README.md
- Native Features: See NATIVE-FEATURES.md
