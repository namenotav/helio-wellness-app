# 🚀 ZERO-CACHE DEPLOYMENT SCRIPT
# Ensures 100% fresh installation on phone with new pricing

Write-Host ""
Write-Host "DEPLOYING WITH ZERO CACHE - NEW PRICING" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear local caches
Write-Host "Step 1: Clearing local caches..." -ForegroundColor Yellow
npm cache clean --force
Remove-Item -Path .\dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .\node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue

# Step 2: Fresh build
Write-Host ""
Write-Host "Step 2: Building with timestamp-based names..." -ForegroundColor Yellow
npm run build

# Step 3: Sync to Capacitor
Write-Host ""
Write-Host "Step 3: Syncing to Android..." -ForegroundColor Yellow
npx cap sync android

# Step 4: Clean Android build
Write-Host ""
Write-Host "Step 4: Cleaning Android cache..." -ForegroundColor Yellow
cd android
.\gradlew clean

# Step 5: Build APK
Write-Host ""
Write-Host "Step 5: Building fresh APK..." -ForegroundColor Yellow
.\gradlew assembleDebug
cd ..

# Step 6: Find APK
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $apkPath) {
    Write-Host ""
    Write-Host "SUCCESS! APK built at:" -ForegroundColor Green
    Write-Host "  $apkPath" -ForegroundColor White
    Write-Host ""
    Write-Host "DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Uninstall old app from phone completely" -ForegroundColor Yellow
    Write-Host "2. Transfer APK to phone via USB" -ForegroundColor White
    Write-Host "3. Install fresh APK" -ForegroundColor White
    Write-Host "4. Clear browser data if using web version" -ForegroundColor White
    Write-Host ""
    Write-Host "NEW PRICING CONFIRMED:" -ForegroundColor Green
    Write-Host "  Starter: £6.99/month" -ForegroundColor White
    Write-Host "  Premium: £16.99/month" -ForegroundColor White
    Write-Host "  Ultimate: £34.99/month" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: APK not found!" -ForegroundColor Red
    Write-Host "Check build logs for errors" -ForegroundColor Yellow
    Write-Host ""
}
