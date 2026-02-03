# SECRET PROTECTION STRATEGY
**Goal:** Ensure API keys, passwords, and sensitive configs are NEVER visible in the compiled APK/Bundle.

---

## 🎯 THE PROBLEM
**Root Cause:** Vite's build process injects ANY variable starting with `VITE_` directly into the JavaScript bundle as plain text.

**Current State:**
```javascript
// .env file
VITE_ELEVENLABS_API_KEY=sk_1d59...
VITE_DEV_PASSWORD=helio2025dev

// Gets compiled into dist/assets/index-[hash].js as:
const apiKey = "sk_1d59...";  // ← VISIBLE IN APK
const devPassword = "helio2025dev";  // ← VISIBLE IN APK
```

**Why This Happens:**
Vite is designed for PUBLIC environment variables (e.g., `VITE_APP_NAME`, `VITE_API_URL`). It assumes `VITE_*` vars are safe to expose. This is correct for frontend-only data, but DEADLY for secrets.

---

## 🛡️ SOLUTION OPTIONS (Ranked Best → Worst)

### ✅ OPTION 1: Backend Proxy (RECOMMENDED)
**Strategy:** Move ALL secret-requiring API calls to Firebase Cloud Functions.

**How It Works:**
```
User clicks "Speak" 
  ↓
React App calls: fetch('/api/generate-speech', {body: {text: "breathe in"}})
  ↓
Firebase Cloud Function receives request
  ↓
Cloud Function calls ElevenLabs API (key stored server-side)
  ↓
Returns audio blob to client
```

**Pros:**
- ✅ **Zero client exposure** - Key never touches the device
- ✅ **Quota control** - You can rate-limit abusive users
- ✅ **Cost protection** - Prevents attackers from draining your ElevenLabs balance
- ✅ **Future-proof** - Works for ANY secret API (OpenAI, Stripe, etc.)

**Cons:**
- ⚠️ Requires Firebase Blaze Plan ($0.40/million invocations, dirt cheap)
- ⚠️ Adds ~200-500ms latency (negligible for voice generation)

**Implementation Scope:**
- Create `functions/generateSpeech.js` Cloud Function
- Modify `elevenLabsVoiceService.js` to call your endpoint instead of ElevenLabs directly
- Store `ELEVENLABS_API_KEY` in Firebase Functions config (never in .env)

---

### ✅ OPTION 2: Remove VITE_ Prefix + Server-Side Injection
**Strategy:** Keep secrets in `.env` but DON'T use the `VITE_` prefix. Inject them at runtime via a secure endpoint.

**How It Works:**
```javascript
// .env (NO VITE_ PREFIX)
ELEVENLABS_API_KEY=sk_1d59...

// App calls on startup:
const config = await fetch('/api/get-client-config');  // Cloud Function
// Returns: { elevenLabsEnabled: true } (NOT the key itself)
```

**Pros:**
- ✅ Keys not in bundle
- ✅ You control what gets sent to client

**Cons:**
- ⚠️ Still requires backend (Cloud Function)
- ⚠️ If you send the key to client, it's still vulnerable (just delayed)
- ❌ **NOT RECOMMENDED** because if client needs the key, you're back to square one

---

### ⚠️ OPTION 3: Native-Only Config (Capacitor)
**Strategy:** Store secrets in `capacitor.config.json` under `plugins` section (Android/iOS only).

**How It Works:**
```json
// capacitor.config.json
{
  "plugins": {
    "ElevenLabsConfig": {
      "apiKey": "sk_1d59..."  // ← Only accessible in native builds
    }
  }
}
```

**Pros:**
- ✅ Not in JavaScript bundle
- ✅ Requires native decompilation (harder than JS inspection)

**Cons:**
- ❌ **STILL EXTRACTABLE** - APK can be decompiled with `apktool`
- ❌ Doesn't work for web builds
- ❌ Only delays attackers by ~10 minutes

**Verdict:** Better than nothing, but NOT secure.

---

### ❌ OPTION 4: Code Obfuscation
**Strategy:** Use Vite plugins like `vite-plugin-string-encryption` to scramble the key.

**Example:**
```javascript
// Obfuscated output
const key = atob("c2tfMWQ1OQ==");  // Base64 encoded
```

**Cons:**
- ❌ **SECURITY THEATER** - Any attacker can reverse this in 30 seconds
- ❌ Adds bundle size
- ❌ False sense of security

**Verdict:** DO NOT USE. This is not real security.

---

## 🏆 RECOMMENDED ARCHITECTURE

### For ElevenLabs API:
**Use Backend Proxy (Option 1)**
```
Client → Firebase Function → ElevenLabs API
```

### For Dev Password:
**Remove from .env entirely**
- Store in Firestore under `admin/config/devPassword` (protected by Firestore rules)
- Fetch dynamically when Admin Dashboard loads
- Check password server-side via Cloud Function

### For Firebase Config:
**This is already safe**
- Firebase API keys in `VITE_FIREBASE_*` are PUBLIC by design
- Security comes from Firestore Rules, not hiding the API key
- No action needed

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Isolate Secrets
- [ ] Remove `VITE_` prefix from `ELEVENLABS_API_KEY`
- [ ] Remove `VITE_DEV_PASSWORD` entirely
- [ ] Verify `.env` is in `.gitignore`

### Phase 2: Backend Proxy
- [ ] Enable Firebase Functions (Blaze Plan)
- [ ] Create `functions/generateSpeech.js`
- [ ] Deploy function: `firebase deploy --only functions`
- [ ] Update `elevenLabsVoiceService.js` to call proxy

### Phase 3: Verification
- [ ] Rebuild: `npm run build`
- [ ] Search bundle: `grep -r "sk_" dist/` (should return nothing)
- [ ] Test voice generation still works

---

## 💰 COST ANALYSIS

### Firebase Functions (Blaze Plan)
- **Invocations:** $0.40/million
- **Compute:** $0.00001667/GB-second
- **Estimated Cost:** ~$2-5/month for 10,000 users

### Risk of NOT Fixing
- **Attacker drains ElevenLabs quota:** $1,000+ in hours
- **Admin access breach:** Reputation damage + data leak lawsuits

**ROI:** This fix pays for itself instantly.

---

## ❓ NEXT STEPS
Choose your preferred approach and I'll implement it. My recommendation:

1. **Backend Proxy** for ElevenLabs (bulletproof security)
2. **Remove Dev Password** from client entirely (store in Firestore)
3. **Keep Firebase Config as-is** (already secure)

Let me know when you're ready to proceed.
