# ============================================
# SAFE DEPLOYMENT SCRIPT - PRESERVES ALL DATA
# ============================================
# This script NEVER uninstalls the app, preventing data loss
# Always uses 'adb install -r' to replace/upgrade while keeping data

Write-Host ""
Write-Host "🔒 SAFE DEPLOYMENT - Data Preservation Mode" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build React app
Write-Host "📦 Step 1/5: Building React app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

# Step 2: Copy to Android
Write-Host "📋 Step 2/5: Copying to Android project..." -ForegroundColor Yellow
npx cap copy android --inline
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Copy failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Copy complete" -ForegroundColor Green
Write-Host ""

# Step 3: Build APK
Write-Host "🔨 Step 3/5: Building APK..." -ForegroundColor Yellow
cd android
.\gradlew assembleDebug
$buildResult = $LASTEXITCODE
cd ..
if ($buildResult -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ APK built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Install with -r flag (PRESERVES DATA)
Write-Host "📲 Step 4/5: Installing APK (preserving all data)..." -ForegroundColor Yellow
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ App upgraded (data preserved)" -ForegroundColor Green
Write-Host ""

# Step 5: Restart app
Write-Host "🚀 Step 5/5: Restarting app..." -ForegroundColor Yellow
adb shell am force-stop com.helio.wellness
Start-Sleep -Seconds 1
adb shell am start -n com.helio.wellness/.MainActivity
Write-Host "✅ App launched" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE - ALL DATA SAFE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now running with the latest updates" -ForegroundColor Cyan
Write-Host "All your steps, workouts, and data are intact" -ForegroundColor Cyan
Write-Host "New data will auto-backup to Firebase" -ForegroundColor Cyan
Write-Host ""
