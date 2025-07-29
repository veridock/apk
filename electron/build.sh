#!/bin/bash
# Build script for SVG+PHP Launcher
# Builds for multiple platforms

set -e

echo "🚀 SVG+PHP Launcher Build Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check dependencies
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        echo "Please install $1 first"
        exit 1
    fi
}

echo "Checking dependencies..."
check_dependency "node"
check_dependency "npm"

# Install npm dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Create assets directory
mkdir -p assets

# Generate icons if not exist
if [ ! -f "assets/icon.png" ]; then
    echo -e "${YELLOW}🎨 Generating icons...${NC}"

    # Create a simple SVG icon
    cat > assets/icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#667eea" rx="100"/>
  <text x="256" y="300" text-anchor="middle" fill="white" font-size="200" font-family="Arial" font-weight="bold">SVG</text>
  <text x="256" y="400" text-anchor="middle" fill="white" font-size="60" font-family="Arial">+PHP</text>
</svg>
EOF

    # Convert to PNG (requires imagemagick)
    if command -v convert &> /dev/null; then
        convert -background none assets/icon.svg -resize 512x512 assets/icon.png
        convert -background none assets/icon.svg -resize 256x256 assets/icon@256.png
        convert -background none assets/icon.svg -resize 128x128 assets/icon@128.png
        convert -background none assets/icon.svg -resize 64x64 assets/icon@64.png
        convert -background none assets/icon.svg -resize 32x32 assets/icon@32.png

        # Create ICO for Windows
        convert assets/icon.png assets/icon@256.png assets/icon@128.png assets/icon@64.png assets/icon@32.png assets/icon.ico

        # Create ICNS for macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            mkdir -p assets/icon.iconset
            cp assets/icon@32.png assets/icon.iconset/icon_32x32.png
            cp assets/icon@64.png assets/icon.iconset/icon_64x64.png
            cp assets/icon@128.png assets/icon.iconset/icon_128x128.png
            cp assets/icon@256.png assets/icon.iconset/icon_256x256.png
            cp assets/icon.png assets/icon.iconset/icon_512x512.png
            iconutil -c icns assets/icon.iconset -o assets/icon.icns
            rm -rf assets/icon.iconset
        fi
    else
        echo -e "${YELLOW}⚠️  ImageMagick not found, using default icons${NC}"
    fi
fi

# Download PHP binaries for embedding (optional)
download_php() {
    local platform=$1
    local php_version="8.2.0"

    echo -e "${YELLOW}📥 Downloading PHP for $platform...${NC}"

    case $platform in
        "win")
            mkdir -p php/win
            curl -L "https://windows.php.net/downloads/releases/php-${php_version}-Win32-vs16-x64.zip" -o php/win/php.zip
            unzip -q php/win/php.zip -d php/win/
            rm php/win/php.zip
            ;;
        "mac")
            mkdir -p php/mac
            # Download PHP for macOS (homebrew formula or compile)
            echo "Please install PHP using Homebrew: brew install php"
            ;;
        "linux")
            mkdir -p php/linux
            # Download PHP for Linux
            echo "PHP will use system installation on Linux"
            ;;
    esac
}

# Build function
build_platform() {
    local platform=$1

    echo -e "${GREEN}🔨 Building for $platform...${NC}"

    case $platform in
        "windows")
            npm run build-win
            ;;
        "mac")
            npm run build-mac
            ;;
        "linux")
            npm run build-linux
            ;;
        "all")
            npm run build-all
            ;;
        *)
            echo -e "${RED}❌ Unknown platform: $platform${NC}"
            exit 1
            ;;
    esac

    echo -e "${GREEN}✅ Build completed for $platform${NC}"
}

# Main menu
if [ $# -eq 0 ]; then
    echo
    echo "Select build target:"
    echo "1) Windows"
    echo "2) macOS"
    echo "3) Linux"
    echo "4) All platforms"
    echo "5) Download PHP binaries"
    echo "6) Exit"
    echo
    read -p "Enter choice [1-6]: " choice

    case $choice in
        1) build_platform "windows" ;;
        2) build_platform "mac" ;;
        3) build_platform "linux" ;;
        4) build_platform "all" ;;
        5)
            download_php "win"
            download_php "mac"
            download_php "linux"
            ;;
        6) exit 0 ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
else
    # Command line argument
    build_platform $1
fi

echo
echo -e "${GREEN}🎉 Build process completed!${NC}"
echo "Output files are in the 'dist' directory"

# List output files
if [ -d "dist" ]; then
    echo
    echo "Generated files:"
    ls -la dist/
fi