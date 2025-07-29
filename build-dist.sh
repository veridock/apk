#!/bin/bash
# Distribution Builder for SVG+PHP Universal Launcher
# ==================================================
# Generates platform-specific packages

set -e

VERSION=${VERSION:-"1.0.0"}
BUILD_DIR="dist"
PROJECT_NAME="svg-php-launcher"

echo "Building distributions for $PROJECT_NAME v$VERSION"
echo "================================================="

# Clean previous builds
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Create base package
create_base_package() {
    local target_dir="$1"
    
    mkdir -p "$target_dir"
    
    # Core files
    cp index.html "$target_dir/"
    cp portable.php "$target_dir/"
    cp router.php "$target_dir/"
    cp router-temp.php "$target_dir/"
    cp .env "$target_dir/"
    cp LICENSE "$target_dir/"
    cp README.md "$target_dir/"
    
    # Sample SVG files
    cp *.svg "$target_dir/"
    
    # Create directories
    mkdir -p "$target_dir/uploads"
    mkdir -p "$target_dir/output"
    
    # Add .gitkeep files
    touch "$target_dir/uploads/.gitkeep"
    touch "$target_dir/output/.gitkeep"
}

# Windows Package
echo "Creating Windows package..."
WIN_DIR="$BUILD_DIR/windows"
create_base_package "$WIN_DIR"

# Windows-specific files
cp run.bat "$WIN_DIR/"
cat > "$WIN_DIR/install.bat" << 'EOF'
@echo off
echo Installing SVG+PHP Launcher for Windows
echo =======================================
echo.

REM Check for PHP
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo PHP not found. Please install PHP first:
    echo https://windows.php.net/download/
    pause
    exit /b 1
)

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\SVG+PHP Launcher.lnk'); $Shortcut.TargetPath = '%CD%\run.bat'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.Save()}"

echo Installation completed!
echo Double-click the desktop shortcut to start the application.
pause
EOF

# Linux/macOS Package  
echo "Creating Linux/macOS package..."
UNIX_DIR="$BUILD_DIR/unix"
create_base_package "$UNIX_DIR"

# Unix-specific files
cp run.sh "$UNIX_DIR/"
chmod +x "$UNIX_DIR/run.sh"

cat > "$UNIX_DIR/install.sh" << 'EOF'
#!/bin/bash
echo "Installing SVG+PHP Launcher for Linux/macOS"
echo "==========================================="
echo

# Check for PHP
if ! command -v php &> /dev/null; then
    echo "PHP not found. Please install PHP first:"
    echo "Ubuntu/Debian: sudo apt install php php-cli"
    echo "macOS: brew install php"
    exit 1
fi

# Make executable
chmod +x run.sh

# Create desktop entry (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    DESKTOP_FILE="$HOME/.local/share/applications/svg-php-launcher.desktop"
    mkdir -p "$(dirname "$DESKTOP_FILE")"
    
    cat > "$DESKTOP_FILE" << DESKTOP_EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=SVG+PHP Launcher
Comment=Universal launcher for SVG+PHP applications
Exec=$PWD/run.sh
Icon=applications-development
Terminal=false
Categories=Development;
DESKTOP_EOF
    
    echo "Desktop entry created: $DESKTOP_FILE"
fi

echo "Installation completed!"
echo "Run './run.sh' to start the application."
EOF

chmod +x "$UNIX_DIR/install.sh"

# Docker Package
echo "Creating Docker package..."
DOCKER_DIR="$BUILD_DIR/docker"
create_base_package "$DOCKER_DIR"

# Docker-specific files
cp Dockerfile "$DOCKER_DIR/"
cp docker-compose.yml "$DOCKER_DIR/"
cp nginx.conf "$DOCKER_DIR/"

cat > "$DOCKER_DIR/docker-install.sh" << 'EOF'
#!/bin/bash
echo "Installing SVG+PHP Launcher with Docker"
echo "======================================"
echo

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker first:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Please install Docker Compose:"
    echo "https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Building and starting containers..."
docker-compose up -d --build

echo "Installation completed!"
echo "Application available at: http://localhost:8097"
echo "Stop with: docker-compose down"
EOF

chmod +x "$DOCKER_DIR/docker-install.sh"

# Portable Package (Single File)
echo "Creating Portable package..."
PORTABLE_DIR="$BUILD_DIR/portable"
mkdir -p "$PORTABLE_DIR"
cp portable.php "$PORTABLE_DIR/"
cp README.md "$PORTABLE_DIR/"

cat > "$PORTABLE_DIR/README-PORTABLE.md" << 'EOF'
# SVG+PHP Portable Launcher

This is a single-file portable version of the SVG+PHP Launcher.

## Quick Start

```bash
php portable.php [port]
```

## Features
- No installation required
- Works with just PHP
- Self-contained launcher
- Auto-detects available ports

## Requirements
- PHP 8.0+
- Web browser

For full features, download the complete package.
EOF

# Electron Package
if [ -d "electron-launcher" ]; then
    echo "Creating Electron package..."
    ELECTRON_DIR="$BUILD_DIR/electron"
    mkdir -p "$ELECTRON_DIR"
    cp -r electron-launcher/* "$ELECTRON_DIR/"
    
    cat > "$ELECTRON_DIR/build-electron.sh" << 'EOF'
#!/bin/bash
echo "Building Electron app..."

# Install dependencies
npm install

# Build for all platforms
npm run build-all

echo "Electron builds created in dist/ directory"
EOF
    chmod +x "$ELECTRON_DIR/build-electron.sh"
fi

# Create archives
echo "Creating distribution archives..."
cd $BUILD_DIR

# ZIP files for Windows
if command -v zip &> /dev/null; then
    zip -r "${PROJECT_NAME}-v${VERSION}-windows.zip" windows/
    zip -r "${PROJECT_NAME}-v${VERSION}-portable.zip" portable/
fi

# TAR.GZ files for Unix
if command -v tar &> /dev/null; then
    tar -czf "${PROJECT_NAME}-v${VERSION}-unix.tar.gz" unix/
    tar -czf "${PROJECT_NAME}-v${VERSION}-docker.tar.gz" docker/
    if [ -d "electron" ]; then
        tar -czf "${PROJECT_NAME}-v${VERSION}-electron.tar.gz" electron/
    fi
fi

cd ..

echo
echo "Distribution packages created in $BUILD_DIR/"
echo "============================================="
ls -la $BUILD_DIR/

echo
echo "Done! 🎉"
