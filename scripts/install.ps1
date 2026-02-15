Write-Host "🛡️  Installing CommandGuard..." -ForegroundColor Cyan

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Green
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit 1 }

    Write-Host "🔨 Building project..." -ForegroundColor Green
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

    Write-Host "🔗 Linking command..." -ForegroundColor Green
    npm link
    if ($LASTEXITCODE -ne 0) { Write-Error "npm link failed"; exit 1 }

    Write-Host "⚙️  Setting up CommandGuard..." -ForegroundColor Green
    commandguard setup
    
    Write-Host "✅ Done! CommandGuard is installed." -ForegroundColor Cyan
    Write-Host "🔄 Please restart your terminal to ensure the path is updated." -ForegroundColor Yellow
} else {
    Write-Error "❌ Error: npm is not installed. Please install Node.js first."
}
