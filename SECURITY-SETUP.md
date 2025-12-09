# 🔐 Security Setup Guide - WellnessAI

## ⚠️ CRITICAL: Never Commit API Keys to Git

This guide shows how to secure your API keys properly.

---

## 1️⃣ GitHub Actions Secrets Setup

### Add Secrets to Repository

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets one by one:

```
Name: VITE_GEMINI_API_KEY
Value: [Your Gemini API key]

Name: VITE_ELEVENLABS_API_KEY
Value: [Your ElevenLabs API key]

Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: [Your Stripe publishable key]

Name: VITE_STRIPE_MONTHLY_PRICE_ID
Value: [Your Stripe monthly price ID]

Name: VITE_STRIPE_YEARLY_PRICE_ID
Value: [Your Stripe yearly price ID]

Name: VITE_FIREBASE_API_KEY
Value: [Your Firebase API key]

Name: VITE_FIREBASE_AUTH_DOMAIN
Value: [Your Firebase auth domain]

Name: VITE_FIREBASE_DATABASE_URL
Value: [Your Firebase database URL]

Name: VITE_FIREBASE_PROJECT_ID
Value: [Your Firebase project ID]

Name: VITE_FIREBASE_STORAGE_BUCKET
Value: [Your Firebase storage bucket]

Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: [Your Firebase messaging sender ID]

Name: VITE_FIREBASE_APP_ID
Value: [Your Firebase app ID]

Name: VITE_FIREBASE_MEASUREMENT_ID
Value: [Your Firebase measurement ID]

Name: VITE_USDA_API_KEY
Value: [Your USDA API key or DEMO_KEY]
```

---

## 2️⃣ Vercel/Railway Deployment Secrets

### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add all the variables above

### For Railway:
1. Go to your Railway dashboard
2. Select your project
3. Click **Variables**
4. Add all the variables above

---

## 3️⃣ Firebase Security Rules

### Update Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `wellnessai-app-e01be`
3. Click **Realtime Database** → **Rules**
4. Copy the rules from `database.rules.json`
5. Click **Publish**

### Test Security:

```bash
# This should FAIL (no authentication)
curl https://wellnessai-app-e01be-default-rtdb.europe-west1.firebasedatabase.app/users.json

# This should return "Permission denied"
```

---

## 4️⃣ Local Development Setup

### Create `.env.local` (NEVER commit this file!)

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local with your real keys
# This file is in .gitignore and won't be committed
```

---

## 5️⃣ SSL Certificate Pinning Setup

### Install Package:

```bash
npm install capacitor-ssl-pinning
npx cap sync
```

### Add to `capacitor.config.json`:

```json
{
  "plugins": {
    "SSLPinning": {
      "domains": [
        {
          "hostname": "firebasedatabase.app",
          "fingerprints": ["your_certificate_sha256_fingerprint"]
        },
        {
          "hostname": "googleapis.com",
          "fingerprints": ["your_certificate_sha256_fingerprint"]
        }
      ]
    }
  }
}
```

### Get Certificate Fingerprints:

```bash
# For firebasedatabase.app
echo | openssl s_client -connect firebasedatabase.app:443 2>/dev/null | openssl x509 -noout -fingerprint -sha256

# For googleapis.com
echo | openssl s_client -connect googleapis.com:443 2>/dev/null | openssl x509 -noout -fingerprint -sha256
```

---

## 6️⃣ Remove API Keys from Git History

### ⚠️ WARNING: This rewrites Git history!

```bash
# Backup your repo first
git clone <your-repo-url> backup

# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Remove BUILD-INSTRUCTIONS.md with exposed keys
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch BUILD-INSTRUCTIONS.md" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ This cannot be undone!)
git push origin --force --all
git push origin --force --tags
```

---

## 7️⃣ API Key Rotation Schedule

### Rotate keys immediately if:
- Keys were exposed in public repo
- Keys were committed to Git
- Employee leaves company
- Security breach suspected

### Regular rotation:
- **Production keys:** Every 90 days
- **Development keys:** Every 180 days
- **Service accounts:** Every 365 days

---

## 8️⃣ Security Checklist

- [ ] All API keys moved to GitHub Secrets
- [ ] `.env` file added to `.gitignore`
- [ ] Firebase security rules published
- [ ] ProGuard enabled for Android
- [ ] SSL pinning configured
- [ ] Old API keys rotated
- [ ] Git history cleaned
- [ ] Team trained on security practices

---

## 🚨 Emergency Response

### If API Keys Are Exposed:

1. **IMMEDIATELY** rotate all keys
2. Revoke old keys in respective dashboards
3. Check for unauthorized usage
4. Clean Git history
5. Update all deployment environments
6. Monitor for 48 hours

### Key Rotation Links:
- **Gemini:** https://aistudio.google.com/app/apikey
- **Firebase:** https://console.firebase.google.com/project/wellnessai-app-e01be/settings/serviceaccounts/adminsdk
- **Stripe:** https://dashboard.stripe.com/apikeys
- **ElevenLabs:** https://elevenlabs.io/app/settings/api

---

## 📞 Security Contacts

- **Security Issues:** security@wellnessai.app
- **Emergency:** +44 (emergency hotline)
- **Bug Bounty:** https://wellnessai.app/security

---

**Last Updated:** December 9, 2025
**Review Frequency:** Monthly
**Next Review:** January 9, 2026
