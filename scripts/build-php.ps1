# Build PHP Deployment Script
# Converts HTML files to PHP for production deployment
# Run from project root: .\scripts\build-php.ps1

param(
    [string]$OutputDir = "deploy"
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SourceDir = $ProjectRoot
$DeployDir = Join-Path $ProjectRoot $OutputDir

Write-Host "=== FVU Forms PHP Build Script ===" -ForegroundColor Cyan
Write-Host ""

# Files to convert
$FormFiles = @("index.html", "upload.html", "analysis.html", "recovery.html")

# Clean and create deploy directory
if (Test-Path $DeployDir) {
    Write-Host "Cleaning existing deploy directory..." -ForegroundColor Yellow
    Remove-Item -Path $DeployDir -Recurse -Force
}
New-Item -Path $DeployDir -ItemType Directory | Out-Null
Write-Host "Created deploy directory: $DeployDir" -ForegroundColor Green

# PHP code to inject
$PhpHeader = "<?php session_start(); ?>`n"
$SessionField = '<input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">'

# Convert each HTML file to PHP
foreach ($file in $FormFiles) {
    $SourcePath = Join-Path $SourceDir $file
    $DestFile = $file -replace '\.html$', '.php'
    $DestPath = Join-Path $DeployDir $DestFile

    if (Test-Path $SourcePath) {
        Write-Host "Converting $file -> $DestFile..." -ForegroundColor White

        # Read the HTML content
        $content = Get-Content -Path $SourcePath -Raw

        # Add PHP session_start() at the very top
        $content = $PhpHeader + $content

        # Add session_verify hidden field after each <form> opening tag
        # Matches <form ...> and adds the hidden field on the next line
        $content = $content -replace '(<form[^>]*>)', "`$1`n        $SessionField"

        # Convert internal .html links to .php links
        $content = $content -replace '\.html"', '.php"'
        $content = $content -replace "\.html'", ".php'"

        # Write the PHP file
        Set-Content -Path $DestPath -Value $content -NoNewline

        Write-Host "  [OK] $DestFile created" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $file not found" -ForegroundColor Yellow
    }
}

# Copy assets folder
Write-Host ""
Write-Host "Copying assets folder..." -ForegroundColor White
$AssetsSource = Join-Path $SourceDir "assets"
$AssetsDest = Join-Path $DeployDir "assets"
if (Test-Path $AssetsSource) {
    Copy-Item -Path $AssetsSource -Destination $AssetsDest -Recurse
    Write-Host "  [OK] assets/ copied" -ForegroundColor Green

# Copy lib folder (pdfmake)
Write-Host ""
Write-Host "Copying lib folder..." -ForegroundColor White
$LibSource = Join-Path $SourceDir "lib"
$LibDest = Join-Path $DeployDir "lib"
if (Test-Path $LibSource) {
    Copy-Item -Path $LibSource -Destination $LibDest -Recurse
    Write-Host "  [OK] lib/ copied" -ForegroundColor Green
}

    # Remove files not needed in production
    $FilesToExclude = @(
        "js\dashboard-supabase.js",
        "js\supabase.js"
    )

    Write-Host ""
    Write-Host "Removing development-only files..." -ForegroundColor White
    foreach ($excludeFile in $FilesToExclude) {
        $excludePath = Join-Path $AssetsDest $excludeFile
        if (Test-Path $excludePath) {
            Remove-Item -Path $excludePath -Force
            Write-Host "  [OK] Removed $excludeFile" -ForegroundColor Green
        }
    }
}

# Update config.js for production
Write-Host ""
Write-Host "Updating config.js for production..." -ForegroundColor White
$ConfigPath = Join-Path $AssetsDest "js\config.js"
if (Test-Path $ConfigPath) {
    $configContent = Get-Content -Path $ConfigPath -Raw

    # Set USE_SUPABASE to false
    $configContent = $configContent -replace 'USE_SUPABASE:\s*true', 'USE_SUPABASE: false'

    Set-Content -Path $ConfigPath -Value $configContent -NoNewline
    Write-Host "  [OK] USE_SUPABASE set to false" -ForegroundColor Green
}

# Remove supabase import from api-client.js
$ApiClientPath = Join-Path $AssetsDest "js\api-client.js"
if (Test-Path $ApiClientPath) {
    $apiContent = Get-Content -Path $ApiClientPath -Raw
    $apiContent = $apiContent -replace "import \{ submitToSupabase \} from './supabase\.js';", "// import { submitToSupabase } from './supabase.js'; // Removed for production"
    Set-Content -Path $ApiClientPath -Value $apiContent -NoNewline
    Write-Host "  [OK] Removed supabase import from api-client.js" -ForegroundColor Green
}

# Convert .html links to .php in header-component.js
$HeaderPath = Join-Path $AssetsDest "js\header-component.js"
if (Test-Path $HeaderPath) {
    $headerContent = Get-Content -Path $HeaderPath -Raw
    $headerContent = $headerContent -replace '\.html"', '.php"'
    $headerContent = $headerContent -replace "\.html'", ".php'"
    Set-Content -Path $HeaderPath -Value $headerContent -NoNewline
    Write-Host "  [OK] Converted .html links to .php in header-component.js" -ForegroundColor Green
}

# Create a simple deployment info file
$DeployInfo = @"
FVU Forms - PHP Deployment Package
===================================
Built: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Source: $SourceDir

Files included:
- index.php
- upload.php
- analysis.php
- recovery.php
- assets/ (CSS, JS, images)

Deployment steps:
1. Upload all files to homicidefvu.fatsystems.ca via SFTP
2. Ensure file permissions: 644 for files, 755 for directories
3. Test each form submission

Configuration:
- USE_SUPABASE: false (configured for PHP endpoint)
- API_ENDPOINT: rfs_request_process.php
"@

$InfoPath = Join-Path $DeployDir "DEPLOY_INFO.txt"
Set-Content -Path $InfoPath -Value $DeployInfo
Write-Host "  [OK] DEPLOY_INFO.txt created" -ForegroundColor Green

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Cyan
Write-Host "Deploy folder: $DeployDir" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review files in deploy/ folder"
Write-Host "  2. SFTP upload to homicidefvu.fatsystems.ca"
Write-Host "  3. Test on production server"
Write-Host ""
