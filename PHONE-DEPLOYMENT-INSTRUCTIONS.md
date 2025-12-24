# 📱 DEPLOY TO PHONE - ZERO CACHE GUARANTEE

## ✅ BUILD STATUS:
- ✅ Fresh build completed with new pricing (£6.99, £16.99, £34.99)
- ✅ Vite cache cleared
- ✅ Capacitor synced
- ⏳ Android APK building...

---

## 🔥 CRITICAL: PREVENT OLD CACHE

### Option 1: FRESH INSTALL (Recommended - 100% guaranteed)

**On Your Phone:**
1. **Uninstall old Helio app completely**
   - Settings → Apps → Helio → Uninstall
   - This removes ALL cached data

2. **Clear WebView cache** (if using Capacitor):
   - Settings → Apps → Android System WebView → Storage → Clear cache
   - Settings → Apps → Chrome → Storage → Clear cache

3. **Transfer new APK**:
   - Connect phone via USB
   - Copy: `android\app\build\outputs\apk\debug\app-debug.apk`
   - To: Phone's Download folder

4. **Install fresh APK**:
   - Open Files app on phone
   - Navigate to Downloads
   - Tap `app-debug.apk`
   - Allow "Install unknown apps" if prompted
   - Install

5. **Verify new pricing**:
   - Open app
   - Click "💳 Upgrade" button
   - Should see: Starter £6.99, Premium £16.99, Ultimate £34.99
   - If you see old prices (£4.99, £14.99, £29.99), OLD CACHE IS PRESENT!

---

### Option 2: FORCE CLEAR IN-APP (If you don't want to reinstall)

**After updating APK:**
1. Open Helio app
2. Go to Settings (⚙️ icon)
3. Scroll to bottom
4. Tap "Clear App Cache" 10 times rapidly
5. Close app completely (swipe away from recent apps)
6. Force stop: Settings → Apps → Helio → Force Stop
7. Reopen app
8. Check pricing again

---

### Option 3: ADB FORCE INSTALL (Developer method)

```bash
# Clear app data remotely
adb shell pm clear com.helio.wellnessai

# Install new APK over old one
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# Force stop and restart
adb shell am force-stop com.helio.wellnessai
adb shell am start -n com.helio.wellnessai/.MainActivity
```

---

## ✅ VERIFICATION CHECKLIST:

After installation, check these to confirm new version:

- [ ] **Pricing Modal**: Shows £6.99, £16.99, £34.99 (not £4.99, £14.99, £29.99)
- [ ] **Landing Page**: Shows "Starter £6.99" (not "Essential £4.99")
- [ ] **Plan Names**: Says "Starter", "Premium", "Ultimate" (not "Essential", "Premium", "VIP")
- [ ] **Stripe Links**: Open correct payment pages with £6.99, £16.99, £34.99
- [ ] **Build Timestamp**: Check console for new build time

---

## 🐛 TROUBLESHOOTING:

**If you still see old prices:**

1. **Clear ALL browser/WebView data**:
   ```
   Settings → Apps → Android System WebView → Storage → Clear Storage (not just cache)
   ```

2. **Factory reset app data** (nuclear option):
   ```
   Settings → Apps → Helio → Storage → Clear Storage
   ```

3. **Check Railway deployment**:
   - Go to https://railway.app/dashboard
   - Verify new environment variables are saved
   - Check deployment logs for errors

4. **Rebuild with version bump**:
   - Edit `package.json`: Change version to `1.0.22`
   - Run: `npm run build && npx cap sync android`
   - Forces Capacitor to detect new version

---

## 📊 WHAT CHANGED:

**Removed:**
- ❌ Essential plan (£4.99)
- ❌ Old Price IDs (prod_TZhdMJIuUuIxOP, etc.)
- ❌ Old payment links

**Added:**
- ✅ Starter plan (£6.99)
- ✅ New Price IDs (price_1SffiWD2EDcoPFLNrGfZU1c6, etc.)
- ✅ New payment links
- ✅ Correct plan mapping (starter/premium/ultimate)

**Files Modified:**
- `src/components/StripePayment.jsx` - Updated pricing and links
- `.env` - Updated Stripe Price IDs
- `vite.config.js` - Added external TensorFlow modules

---

## 🚀 RAILWAY DEPLOYMENT (Also needs update):

Don't forget to add these 6 variables to Railway:

```
VITE_STRIPE_PRICE_STARTER=price_1SffiWD2EDcoPFLNrGfZU1c6
VITE_STRIPE_PRICE_PREMIUM=price_1Sffj1D2EDcoPFLNkqdUxY9L
VITE_STRIPE_PRICE_ULTIMATE=price_1Sffk1D2EDcoPFLN4yxdNXSq
VITE_STRIPE_PAYMENT_LINK_STARTER=https://buy.stripe.com/9B6bJ03b1awCbb2emI6kg0a
VITE_STRIPE_PAYMENT_LINK_PREMIUM=https://buy.stripe.com/7sYfZg4f5fQWdja1zW6kg0d
VITE_STRIPE_PAYMENT_LINK_ULTIMATE=https://buy.stripe.com/6oUbJ026X48egvmfqM6kg0e
```

Then Railway will have matching pricing for web version.

---

**WAITING FOR ANDROID BUILD TO COMPLETE...**
Check terminal for "BUILD SUCCESSFUL" message.
