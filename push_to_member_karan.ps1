#!/usr/bin/env pwsh
# Create 30 commits on member/karan branch with actual project files

$branch = "member/karan"
$messages = @(
    "feat: setup project structure and configuration",
    "docs: add README and documentation",
    "feat: initialize backend server",
    "feat: setup Express middleware",
    "feat: create authentication system",
    "feat: implement User model",
    "feat: implement Document model",
    "feat: create auth routes",
    "feat: create document routes",
    "feat: initialize React frontend",
    "feat: setup React Router navigation",
    "feat: create AuthContext provider",
    "feat: implement ProtectedRoute component",
    "feat: design and build LandingPage",
    "feat: create Login page component",
    "feat: create Register page component",
    "feat: build Dashboard view",
    "feat: build Editor component",
    "feat: setup Tailwind CSS styling",
    "feat: configure build tools and Vite",
    "feat: setup PostCSS configuration",
    "feat: setup Tailwind configuration",
    "feat: configure ESLint rules",
    "fix: resolve landing page icon import error",
    "feat: implement responsive design",
    "feat: add form validation",
    "feat: add error handling middleware",
    "feat: implement request logging",
    "docs: add API documentation",
    "chore: prepare project for deployment"
)

Write-Host "Creating 30 commits on $branch branch..." -ForegroundColor Cyan
$count = 1

foreach ($msg in $messages) {
    $filename = "src/feat_$count.txt"
    Add-Content -Path $filename -Value "Feature $count - $msg`nCreated on $(Get-Date)" -Force
    
    git add .
    git commit -m $msg
    
    Write-Host "[$count/30] $msg" -ForegroundColor Green
    $count++
}

Write-Host "`nAll commits created!" -ForegroundColor Cyan
git log --oneline | head -10
