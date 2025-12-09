# 🔄 API Key Rotation Guide - Step by Step

## ⚠️ DO THIS NOW - Your Keys Are Exposed!

---

## 🔥 Stripe Keys (URGENT - £50K Fraud Risk)

### Step 1: Open Stripe Dashboard
✅ **I just opened it for you** → Log in now

### Step 2: Switch to LIVE Mode
- Top left corner: Click **"Test mode"** toggle
- Switch to **"Live mode"**

### Step 3: Roll Publishable Key
1. Click **"Publishable key"** section
2. Click **"⋯" (three dots)** next to your key
3. Click **"Roll key"**
4. Click **"Roll key"** again to confirm
5. **Copy the NEW key** → Save it

### Step 4: Roll Secret Key (if needed)
1. Click **"Secret key"** section
2. Click **"⋯"** → **"Roll key"**
3. **Copy the NEW key** → Save it (you won't see it again!)

### Step 5: Update Price IDs (Don't Change These)
- Your Monthly Price ID: `price_1SWmLpD2EDcoPFLN71TSxHKL`
- Your Yearly Price ID: `price_1SWmMjD2EDcoPFLNjnlXLQn4`
- These don't need rotation (they're not secrets)

### Step 6: Revoke Old Keys
1. Go back to keys list
2. Find **old keys** (marked as "Rolled")
3. Click **"⋯"** → **"Delete"**

---

## 🔥 Firebase Configuration (URGENT - £250K GDPR Risk)

### Step 1: Open Firebase Console
Visit: https://console.firebase.google.com/project/wellnessai-app-e01be/settings/general

### Step 2: Get New Configuration
1. Scroll down to **"Your apps"** section
2. Find the **Web app** (🌐 icon)
3. Click **"⚙️ Config"** button
4. You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "wellnessai-app-e01be.firebaseapp.com",
  databaseURL: "https://wellnessai-app-e01be...firebasedatabase.app",
  projectId: "wellnessai-app-e01be",
  storageBucket: "wellnessai-app-e01be.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

5. **Copy ALL these values** (you'll need them)

### Step 3: Regenerate API Key (Optional but Recommended)
Firebase Web API keys can't be "rotated" like Stripe. Instead:

1. Go to: https://console.cloud.google.com/apis/credentials?project=wellnessai-app-e01be
2. Find **"Browser key (auto created by Firebase)"**
3. Click on it
4. Click **"Regenerate key"**
5. Copy the new key
6. Go back to Firebase Console → Settings → General
7. Update the config

**OR** just restrict the existing key:
1. Same page in Google Cloud Console
2. Click your API key
3. Under **"Application restrictions"** → Select **"HTTP referrers"**
4. Add: `https://yourdomain.com/*` and `https://yourapp.vercel.app/*`
5. Under **"API restrictions"** → Select **"Restrict key"**
6. Enable only: Firebase, Realtime Database, Authentication

---

## 🔥 Gemini API Key (URGENT - £5K/month Abuse Risk)

### Step 1: Open Google AI Studio
Visit: https://aistudio.google.com/app/apikey

### Step 2: Delete Old Key
1. Find key: `AIzaSyB0g31xr19v9K854POfDFYhTJT9DDmtjgI`
2. Click **"🗑️ Delete"**
3. Confirm deletion

### Step 3: Create New Key
1. Click **"Create API key"**
2. Select **"Create API key in new project"** OR use existing
3. **Copy the new key immediately** (you won't see it again!)
4. Click **"Done"**

### Step 4: Restrict the Key (Recommended)
1. Click **"⋯"** next to your new key
2. Click **"API key restrictions"**
3. Add your domains (e.g., `vercel.app`, `yourdomain.com`)

---

## 📝 Where to Put New Keys

### Option 1: Local Development
Create `c:\Users\Admin\Desktop\wellnessai-app\.env.local`:

```env
# NEW KEYS - Updated December 9, 2025
VITE_GEMINI_API_KEY=AIza_YOUR_NEW_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51_YOUR_NEW_KEY_HERE
VITE_FIREBASE_API_KEY=AIza_YOUR_NEW_FIREBASE_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=wellnessai-app-e01be.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://wellnessai-app-e01be-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=wellnessai-app-e01be
VITE_FIREBASE_STORAGE_BUCKET=wellnessai-app-e01be.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_NEW_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_NEW_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Option 2: Vercel Deployment
1. Go to: https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Click **"Edit"** on each variable
5. Paste new values
6. Click **"Save"**
7. **Redeploy** your app (Deployments → ⋯ → Redeploy)

### Option 3: GitHub Secrets (for CI/CD)
1. Go to: https://github.com/namenotav/helio-wellness-app/settings/secrets/actions
2. Click each secret → **"Update"**
3. Paste new value
4. Click **"Update secret"**

---

## ✅ Verification Checklist

After rotating keys:

- [ ] Stripe: Old keys deleted from dashboard
- [ ] Stripe: New publishable key copied
- [ ] Firebase: New config copied
- [ ] Firebase: Old key restricted (or regenerated)
- [ ] Gemini: Old key deleted
- [ ] Gemini: New key created and copied
- [ ] Local `.env.local` updated with new keys
- [ ] Vercel environment variables updated
- [ ] GitHub secrets updated
- [ ] App redeployed and tested
- [ ] Old `.env` file deleted from computer

---

## 🧪 Test New Keys

```powershell
# Go to project directory
cd C:\Users\Admin\Desktop\wellnessai-app

# Test locally with new keys
npm run dev

# Open: http://localhost:5173
# Try: Login → AI Chat → Food Scanner
```

**If anything breaks:**
1. Check browser console (F12) for errors
2. Verify all new keys are in `.env.local`
3. Restart dev server: `Ctrl+C` then `npm run dev`

---

## 🚨 Emergency Rollback

If new keys don't work:

1. **Stripe:** Create another key (you can have multiple)
2. **Firebase:** The old config still works (just restrict it)
3. **Gemini:** Create new key (you can have multiple)

**You have 7 days to rotate Stripe keys before automatic revocation.**

---

## 📞 Support

- **Stripe Issues:** https://support.stripe.com/contact
- **Firebase Issues:** https://firebase.google.com/support
- **Gemini Issues:** https://ai.google.dev/support

---

**Last Updated:** December 9, 2025
**Rotation Date:** [Write today's date after completing]
**Next Rotation:** March 9, 2026 (90 days)
