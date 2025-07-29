#!/bin/bash

# SVG App Launcher Setup Script
echo "Setting up SVG App Launcher..."

# Install Node.js dependencies
echo "Installing dependencies..."
npm install

# Create assets directory
mkdir -p assets

# Create default app icon (placeholder)
echo "Creating default icons..."
cat > assets/icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#667eea" rx="32"/>
  <path d="M128 40 L200 88 L200 168 L128 216 L56 168 L56 88 Z" fill="white" opacity="0.9"/>
  <text x="128" y="140" text-anchor="middle" fill="#667eea" font-size="48" font-weight="bold">SVG</text>
</svg>
EOF

# Convert SVG to other formats (requires ImageMagick)
if command -v convert &> /dev/null; then
    echo "Converting icons..."
    convert assets/icon.svg assets/icon.png
    convert assets/icon.svg -resize 256x256 assets/icon.ico
    convert assets/icon.svg assets/icon.icns
else
    echo "ImageMagick not found. Icons will use SVG format."
    cp assets/icon.svg assets/icon.png
fi

# Create desktop entry for Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Creating desktop entry..."
    mkdir -p ~/.local/share/applications
    
    cat > ~/.local/share/applications/svg-app-launcher.desktop << EOF
[Desktop Entry]
Name=SVG App Launcher
Comment=Launch SVG+PHP applications as desktop apps
Exec=$PWD/svg-app-launcher %F
Icon=$PWD/assets/icon.png
Terminal=false
Type=Application
Categories=Development;Utility;
MimeType=image/svg+xml;
EOF
    
    chmod +x ~/.local/share/applications/svg-app-launcher.desktop
    update-desktop-database ~/.local/share/applications/
    
    # Create launcher script
    cat > svg-app-launcher << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm start "$@"
EOF
    chmod +x svg-app-launcher
fi

# Create example .env file
echo "Creating example configuration..."
cat > .env.example << 'EOF'
# SVG App Launcher Configuration
APP_TITLE=My SVG Application
APP_VERSION=1.0.0
AUTHOR=Your Name
DESCRIPTION=Interactive SVG Application

# Server Configuration
SERVER_PORT=8097
DEBUG_MODE=false

# Custom Variables
THEME_COLOR=#667eea
BACKGROUND_COLOR=#f8f9fa
EOF

echo "Setup complete!"
echo ""
echo "To run the launcher:"
echo "  npm start"
echo ""
echo "To build distributables:"
echo "  npm run build        # All platforms"
echo "  npm run build-win    # Windows"
echo "  npm run build-mac    # macOS"
echo "  npm run build-linux  # Linux"
echo ""
echo "To associate SVG files with the launcher on Linux:"
echo "  The desktop entry has been created automatically."
echo "  You can now right-click SVG files and 'Open with SVG App Launcher'"
