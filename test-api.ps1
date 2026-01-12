# Test Railway API with different message lengths
Write-Host "=== RAILWAY API LENGTH TEST ===" -ForegroundColor Cyan

# Test 1: Short message (should work)
Write-Host "`n[TEST 1] Short message (5 chars):" -ForegroundColor Yellow
try {
    $body = '{"message": "hello"}'
    $result = Invoke-WebRequest -Uri "https://helio-wellness-app-production.up.railway.app/api/v1/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
    Write-Host "Status: $($result.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test 2: 1500 chars (under limit)
Write-Host "`n[TEST 2] 1500 char message (under limit):" -ForegroundColor Yellow
try {
    $msg1500 = "A" * 1500
    $body = "{`"message`": `"$msg1500`"}"
    $result = Invoke-WebRequest -Uri "https://helio-wellness-app-production.up.railway.app/api/v1/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
    Write-Host "Status: $($result.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test 3: 2100 chars (over limit - like meal automation)
Write-Host "`n[TEST 3] 2100 char message (OVER limit):" -ForegroundColor Yellow
try {
    $msg2100 = "A" * 2100
    $body = "{`"message`": `"$msg2100`"}"
    $result = Invoke-WebRequest -Uri "https://helio-wellness-app-production.up.railway.app/api/v1/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
    Write-Host "Status: $($result.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
