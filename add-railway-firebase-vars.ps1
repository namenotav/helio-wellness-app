# Add Firebase environment variables to Railway
# These are needed for the React build process to embed Firebase config

Write-Host "🚀 Adding Firebase environment variables to Railway..." -ForegroundColor Cyan

$vars = @{
    "VITE_FIREBASE_API_KEY" = "AIzaSyC6K3mH5dKOOsgkL6rZBvx3p3n4cLJqG4g"
    "VITE_FIREBASE_AUTH_DOMAIN" = "helio-wellness-app.firebaseapp.com"
    "VITE_FIREBASE_DATABASE_URL" = "https://helio-wellness-app-default-rtdb.firebaseio.com"
    "VITE_FIREBASE_PROJECT_ID" = "helio-wellness-app"
    "VITE_FIREBASE_STORAGE_BUCKET" = "helio-wellness-app.firebasestorage.app"
    "VITE_FIREBASE_MESSAGING_SENDER_ID" = "868473639009"
    "VITE_FIREBASE_APP_ID" = "1:868473639009:web:c33ebf08e9f5d26fd12ab3"
    "VITE_FIREBASE_MEASUREMENT_ID" = "G-BQVP75V8LP"
    "VITE_GEMINI_API_KEY" = "AIzaSyDQOUnlmgeXqd6AeNnwgZ_RRk94lwfdFw4"
}

foreach ($key in $vars.Keys) {
    Write-Host "Setting $key..." -ForegroundColor Yellow
    railway variables --set "$key=$($vars[$key])"
}

Write-Host ""
Write-Host "✅ All Firebase variables added!" -ForegroundColor Green
Write-Host "Railway will now rebuild automatically with Firebase configuration." -ForegroundColor Cyan
