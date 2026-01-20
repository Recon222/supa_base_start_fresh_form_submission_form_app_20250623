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

# Copy PWA files
Write-Host ""
Write-Host "Copying PWA files..." -ForegroundColor White

# Copy manifest.json
$ManifestSource = Join-Path $SourceDir "manifest.json"
$ManifestDest = Join-Path $DeployDir "manifest.json"
if (Test-Path $ManifestSource) {
    Copy-Item -Path $ManifestSource -Destination $ManifestDest
    Write-Host "  [OK] manifest.json copied" -ForegroundColor Green
} else {
    Write-Host "  [WARN] manifest.json not found" -ForegroundColor Yellow
}

# Copy service worker
$SwSource = Join-Path $SourceDir "sw.js"
$SwDest = Join-Path $DeployDir "sw.js"
if (Test-Path $SwSource) {
    Copy-Item -Path $SwSource -Destination $SwDest
    Write-Host "  [OK] sw.js copied" -ForegroundColor Green
} else {
    Write-Host "  [WARN] sw.js not found" -ForegroundColor Yellow
}

# Copy PWA icons folder
$IconsSource = Join-Path $SourceDir "assets\images\icons"
$IconsDest = Join-Path $DeployDir "assets\images\icons"
if (Test-Path $IconsSource) {
    if (!(Test-Path $IconsDest)) {
        New-Item -Path $IconsDest -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "$IconsSource\*" -Destination $IconsDest -Recurse -Force
    Write-Host "  [OK] PWA icons copied" -ForegroundColor Green
} else {
    Write-Host "  [WARN] PWA icons folder not found at $IconsSource" -ForegroundColor Yellow
}

# Copy PWA splash screen folder
$SplashSource = Join-Path $SourceDir "assets\images\splash"
$SplashDest = Join-Path $DeployDir "assets\images\splash"
if (Test-Path $SplashSource) {
    if (!(Test-Path $SplashDest)) {
        New-Item -Path $SplashDest -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "$SplashSource\*" -Destination $SplashDest -Recurse -Force
    Write-Host "  [OK] PWA splash screens copied" -ForegroundColor Green
} else {
    Write-Host "  [WARN] PWA splash folder not found at $SplashSource" -ForegroundColor Yellow
}

# ============================================
# Update PWA paths for production subdirectory
# ============================================
Write-Host ""
Write-Host "Updating PWA paths for production subdirectory..." -ForegroundColor White
$ProductionPath = "/ext/intake"

# Update manifest.json paths
$ManifestFile = Join-Path $DeployDir "manifest.json"
if (Test-Path $ManifestFile) {
    $content = Get-Content $ManifestFile -Raw
    # Update start_url
    $content = $content -replace '"start_url":\s*"/index\.php"', "`"start_url`": `"$ProductionPath/index.php`""
    # Update scope
    $content = $content -replace '"scope":\s*"/"', "`"scope`": `"$ProductionPath/`""
    # Update all icon src paths (matches "/assets/images/icons/...")
    $content = $content -replace '"src":\s*"/assets/', "`"src`": `"$ProductionPath/assets/"
    Set-Content $ManifestFile $content -NoNewline
    Write-Host "  [OK] manifest.json paths updated for $ProductionPath" -ForegroundColor Green
}

# Update sw.js paths and cache version
$SwFile = Join-Path $DeployDir "sw.js"
if (Test-Path $SwFile) {
    $content = Get-Content $SwFile -Raw

    # Auto-bump cache version with timestamp to ensure fresh content after deploys
    $CacheVersion = Get-Date -Format "yyyyMMddHHmm"
    $content = $content -replace "CACHE_VERSION = 'v[^']*'", "CACHE_VERSION = 'v$CacheVersion'"
    Write-Host "  [OK] Cache version updated to v$CacheVersion" -ForegroundColor Green

    # Update all paths in STATIC_ASSETS array
    # Root path
    $content = $content -replace "'/'", "'$ProductionPath/'"
    # PHP pages
    $content = $content -replace "'/index\.php'", "'$ProductionPath/index.php'"
    $content = $content -replace "'/upload\.php'", "'$ProductionPath/upload.php'"
    $content = $content -replace "'/analysis\.php'", "'$ProductionPath/analysis.php'"
    $content = $content -replace "'/recovery\.php'", "'$ProductionPath/recovery.php'"
    # Asset paths (CSS, JS, images, lib)
    $content = $content -replace "'/assets/", "'$ProductionPath/assets/"
    $content = $content -replace "'/lib/", "'$ProductionPath/lib/"
    $content = $content -replace "'/manifest\.json'", "'$ProductionPath/manifest.json'"
    Set-Content $SwFile $content -NoNewline
    Write-Host "  [OK] sw.js paths updated for $ProductionPath" -ForegroundColor Green
}

# Update pwa-register.js paths
$PwaRegisterFile = Join-Path $AssetsDest "js\pwa-register.js"
if (Test-Path $PwaRegisterFile) {
    $content = Get-Content $PwaRegisterFile -Raw
    # Update service worker registration path and scope
    $content = $content -replace "register\('/sw\.js',\s*\{\s*scope:\s*'/'\s*\}\)", "register('$ProductionPath/sw.js', { scope: '$ProductionPath/' })"
    # Update iOS install prompt icon path
    $content = $content -replace 'src="/assets/images/icons/', "src=`"$ProductionPath/assets/images/icons/"
    Set-Content $PwaRegisterFile $content -NoNewline
    Write-Host "  [OK] pwa-register.js paths updated for $ProductionPath" -ForegroundColor Green
}

# Update PHP files with PWA paths
$PhpFiles = @("index.php", "upload.php", "analysis.php", "recovery.php")
foreach ($phpFile in $PhpFiles) {
    $PhpPath = Join-Path $DeployDir $phpFile
    if (Test-Path $PhpPath) {
        $content = Get-Content $PhpPath -Raw
        # Update manifest.json link
        $content = $content -replace 'href="/manifest\.json"', "href=`"$ProductionPath/manifest.json`""
        # Update icon paths
        $content = $content -replace 'href="/assets/images/icons/', "href=`"$ProductionPath/assets/images/icons/"
        # Update splash screen paths
        $content = $content -replace 'href="/assets/images/splash/', "href=`"$ProductionPath/assets/images/splash/"
        # Update content attributes (for msapplication-TileImage)
        $content = $content -replace 'content="/assets/images/icons/', "content=`"$ProductionPath/assets/images/icons/"
        Set-Content $PhpPath $content -NoNewline
    }
}
Write-Host "  [OK] PHP files PWA paths updated for $ProductionPath" -ForegroundColor Green

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
- manifest.json (PWA)
- sw.js (Service Worker)
- assets/ (CSS, JS, images, icons)
- lib/ (pdfmake)

PWA Configuration:
- Service Worker: sw.js (cache version in file)
- Manifest: manifest.json
- Icons: assets/images/icons/
- Splash: assets/images/splash/

Deployment steps:
1. Upload all files to homicidefvu.fatsystems.ca via SFTP
2. Ensure file permissions: 644 for files, 755 for directories
3. Verify manifest.json is served with correct MIME type
4. Test each form submission
5. Test PWA installation on Chrome/Safari

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
