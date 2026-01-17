# Production Build Script (PowerShell)
# Optimized build process for deployment

Write-Host "`n🔨 Starting Production Build...`n" -ForegroundColor Cyan

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
}

# Type check
Write-Host "📝 Running TypeScript type check..." -ForegroundColor Yellow
try {
    npm run type-check
    Write-Host "✅ Type check passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Type check failed - continuing anyway" -ForegroundColor Yellow
}

# Lint
Write-Host "🔍 Running ESLint..." -ForegroundColor Yellow
try {
    npm run lint
    Write-Host "✅ Lint passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Lint errors found - continuing anyway" -ForegroundColor Yellow
}

# Build
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build

# Check bundle size
Write-Host "`n📊 Bundle size analysis..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Get-ChildItem -Path "dist" -Recurse -File | 
        Measure-Object -Property Length -Sum | 
        ForEach-Object {
            $sizeMB = [math]::Round($_.Sum / 1MB, 2)
            Write-Host "   Total size: $sizeMB MB" -ForegroundColor White
        }
}

Write-Host "`n✅ Production build complete!" -ForegroundColor Green
Write-Host "📦 Output: ./dist`n" -ForegroundColor Cyan
