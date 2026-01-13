# Bundle Python Runtime for Windows
# Downloads embeddable Python and copies to Tauri resources

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$PYTHON_VERSION = "3.11.7"
$PYTHON_URL = "https://www.python.org/ftp/python/$PYTHON_VERSION/python-$PYTHON_VERSION-embed-amd64.zip"
$BUNDLE_DIR = "src-tauri\resources\python"
$TEMP_DIR = "$env:TEMP\reforge-python-bundle"

Write-Host "📦 Bundling Python $PYTHON_VERSION for Windows..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path $BUNDLE_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# Download Python embeddable
$ZIP_FILE = "$TEMP_DIR\python-embed.zip"
if (-not (Test-Path $ZIP_FILE)) {
    Write-Host "Downloading Python embeddable..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $PYTHON_URL -OutFile $ZIP_FILE -UseBasicParsing
}

# Extract Python
Write-Host "Extracting Python..." -ForegroundColor Yellow
Expand-Archive -Path $ZIP_FILE -DestinationPath $TEMP_DIR -Force

# Copy Python to resources
Write-Host "Copying Python to resources..." -ForegroundColor Yellow
$PYTHON_SOURCE = "$TEMP_DIR\python-$PYTHON_VERSION-embed-amd64"
Copy-Item -Path "$PYTHON_SOURCE\*" -Destination $BUNDLE_DIR -Recurse -Force

# Install pip
Write-Host "Installing pip..." -ForegroundColor Yellow
$GET_PIP = "$TEMP_DIR\get-pip.py"
if (-not (Test-Path $GET_PIP)) {
    Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile $GET_PIP -UseBasicParsing
}

& "$BUNDLE_DIR\python.exe" $GET_PIP --no-warn-script-location

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
$REQUIREMENTS = "..\..\python\requirements.txt"
if (Test-Path $REQUIREMENTS) {
    & "$BUNDLE_DIR\python.exe" -m pip install -r $REQUIREMENTS --target "$BUNDLE_DIR\Lib\site-packages" --no-warn-script-location
}

# Copy Python app
Write-Host "Copying Python application..." -ForegroundColor Yellow
$PYTHON_APP = "..\..\python\app"
if (Test-Path $PYTHON_APP) {
    Copy-Item -Path "$PYTHON_APP\*" -Destination "$BUNDLE_DIR\app" -Recurse -Force
}

# Create python.bat launcher
@"
@echo off
cd /d "%~dp0"
python.exe app\main.py %*
"@ | Out-File -FilePath "$BUNDLE_DIR\python.bat" -Encoding ASCII

Write-Host "✅ Python bundled successfully!" -ForegroundColor Green
Write-Host "Location: $BUNDLE_DIR" -ForegroundColor Cyan
