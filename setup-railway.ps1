# Railway Environment Variables Setup Script
Write-Host ""
Write-Host "RAILWAY STRIPE VARIABLES SETUP" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

railway link

Write-Host ""
Write-Host "Adding variables..." -ForegroundColor Cyan

railway variables --set VITE_STRIPE_PRICE_ESSENTIAL=prod_TZhdMJIuUuIxOP
railway variables --set VITE_STRIPE_PRICE_PREMIUM=prod_TZhulmjk69SvVX
railway variables --set VITE_STRIPE_PRICE_VIP=prod_TZhmpYUG5KqUaK
railway variables --set VITE_STRIPE_PAYMENT_LINK_ESSENTIAL=https://buy.stripe.com/fZu14m12T9sycf67Yk6kg09
railway variables --set VITE_STRIPE_PAYMENT_LINK_PREMIUM=https://buy.stripe.com/7sY8wOcLBfQW3IA92o6kg07
railway variables --set VITE_STRIPE_PAYMENT_LINK_VIP=https://buy.stripe.com/5kQ9ASeTJfQW7YQ6Ug6kg08

Write-Host ""
Write-Host "DONE! Railway will now redeploy." -ForegroundColor Green
Write-Host ""
