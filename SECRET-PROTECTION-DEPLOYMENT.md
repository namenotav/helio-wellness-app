# 🔒 SECRET PROTECTION - DEPLOYMENT GUIDE
**CRITICAL:** Follow these steps BEFORE deploying to production.

---

## ✅ SECURITY FIXES IMPLEMENTED

### 1. ElevenLabs API Key Protected
- **BEFORE:** API key hardcoded in bundle (`VITE_ELEVENLABS_API_KEY`)
- **AFTER:** Moved to Firebase Cloud Function (server-side only)
- **Impact:** App still works, uses TikTok TTS as primary (free)

### 2. Dev Password Removed
- **BEFORE:** Password in `.env` (`VITE_DEV_PASSWORD`)
- **AFTER:** Device whitelist only (hardware-based security)
- **Impact:** Dev mode unchanged (device IDs are the real gate)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Install Firebase CLI
```powershell
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase Functions
```powershell
cd c:\Users\Admin\Desktop\wellnessai-app
firebase init functions
```

**Configuration:**
- Select: `Use an existing project`
- Choose: `wellnessai-app-e01be`
- Language: `JavaScript`
- ESLint: `No`
- Install dependencies: `Yes`

### Step 3: Set ElevenLabs Secret
```powershell
firebase functions:secrets:set ELEVENLABS_API_KEY
# When prompted, paste: sk_1d59e38548886708c7439a957aa38a7a5d5cbead7e840c4f
```

### Step 4: Deploy Cloud Functions
```powershell
cd functions
npm install
cd ..
firebase deploy --only functions
```

**Expected Output:**
```
✔  functions[generateSpeech(us-central1)] Successful create operation
✔  functions[healthCheck(us-central1)] Successful create operation
Function URL: https://us-central1-wellnessai-app-e01be.cloudfunctions.net/generateSpeech
```

### Step 5: Verify Build is Clean
```powershell
npm run build
grep -r "sk_" dist/
grep -r "helio2025dev" dist/
```

**Expected:** No matches found ✅

### Step 6: Test Locally
```powershell
npm run dev
```

**Test Cases:**
1. Open breathing exercise
2. Verify voice works (TikTok TTS primary)
3. Check console - no API key warnings
4. Test offline mode (local MP3 files)

---

## 🔍 VERIFICATION CHECKLIST

- [ ] Firebase Functions deployed successfully
- [ ] `ELEVENLABS_API_KEY` secret set in Firebase
- [ ] `.env` file does NOT contain `VITE_ELEVENLABS_API_KEY`
- [ ] `.env` file does NOT contain `VITE_DEV_PASSWORD`
- [ ] Build output (`dist/`) contains NO secrets (grep verified)
- [ ] App still works with TikTok TTS (primary voice)
- [ ] Dev mode still unlocks on authorized devices

---

## 🛠️ ROLLBACK PLAN (If Something Breaks)

### If Voice Generation Fails:
```javascript
// The app has 3 fallbacks, all still work:
1. TikTok TTS (primary, free) ← This will activate automatically
2. Local MP3 files (offline)
3. Native device TTS (always works)
```

### If Cloud Function Fails:
```powershell
# Check logs
firebase functions:log

# Redeploy
firebase deploy --only functions:generateSpeech
```

### Emergency Rollback (Last Resort):
```powershell
# Restore old .env (NOT RECOMMENDED)
git checkout HEAD -- .env

# Redeploy old version
npm run build
```

---

## 💰 COST MONITORING

### Firebase Functions Pricing (Blaze Plan)
- **Invocations:** $0.40 per million
- **Memory:** 256MB @ $0.000000463/GB-sec
- **Expected Cost:** ~$2-5/month for 10,000 users

### Free Tier Includes:
- 2M invocations/month
- 400,000 GB-seconds/month
- You're unlikely to exceed this

**Monitor Usage:**
```
https://console.firebase.google.com/project/wellnessai-app-e01be/usage
```

---

## 🔐 SECURITY BEST PRACTICES

### What's Now Secure:
✅ API keys never in client bundle  
✅ Secrets managed server-side  
✅ Device whitelist for dev mode  
✅ Firebase Auth for admin dashboard  

### What to Monitor:
⚠️ Firebase Functions logs (watch for abuse)  
⚠️ ElevenLabs quota usage (billing alerts)  
⚠️ Rate limiting (add if users abuse API)  

---

## 📞 TROUBLESHOOTING

### "ElevenLabs unavailable" in console
**Cause:** Cloud Function not deployed or Firebase auth issue  
**Fix:** Verify user is logged in (`authService.getCurrentUser()`)

### "Permission denied" on Cloud Function call
**Cause:** User not authenticated  
**Fix:** Cloud Function requires Firebase Auth token

### Voice still doesn't work after deploy
**Cause:** TikTok TTS is primary, not ElevenLabs  
**Check:** Open Network tab, verify TikTok API calls working

---

## 🎯 NEXT STEPS

1. **Deploy to Firebase:** Run deployment commands above
2. **Test on Phone:** Install APK, verify no secrets in bundle
3. **Enable Billing Alerts:** Firebase Console → Billing → Alerts
4. **Monitor Logs:** First 24 hours after deploy

**Questions?** Check logs: `firebase functions:log --only generateSpeech`
