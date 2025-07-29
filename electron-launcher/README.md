# SVG App Launcher

A cross-platform Electron application that allows SVG files with embedded PHP and JavaScript to be launched as desktop applications.

## Features

- 🖥️ **Desktop Application**: Launch SVG files as native desktop apps
- 📏 **Dynamic Window Sizing**: Automatically resizes window to match SVG dimensions
- 🐘 **PHP Support**: Process embedded PHP code in SVG files
- 🌍 **Cross-Platform**: Works on Windows, macOS, and Linux
- ⚙️ **Environment Variables**: Support for .env configuration files
- 🎨 **Modern UI**: Beautiful, responsive launcher interface
- 📋 **Recent Files**: Quick access to recently opened applications
- 🔄 **Drag & Drop**: Simple file opening via drag and drop
- 👥 **User Authentication**: Multi-level user system with secure login
- 📱 **SVG PWA Grid**: Level 3 users can access a grid view of all SVG applications
- 🔍 **Search & Filter**: Find applications by title, description, category, or author
- 📤 **Upload System**: Upload and share SVG PWA applications with metadata
- 🚀 **Direct Launch**: Click any app in the grid to launch instantly

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone or download this directory
2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Or install manually:
   ```bash
   npm install
   ```

## Usage

### Starting the Launcher

```bash
npm start
```

### Opening SVG Applications

1. **Via Launcher UI**: Click "Choose SVG File" or drag and drop an SVG file
2. **Command Line**: 
   ```bash
   npm start calculator.svg
   ```
3. **File Association** (Linux): Right-click SVG file → "Open with SVG App Launcher"

### Creating SVG Applications

SVG applications are standard SVG files with embedded PHP and JavaScript:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="400" height="300" fill="#f0f0f0"/>
  <text x="200" y="50" text-anchor="middle" font-size="24">{APP_TITLE}</text>
  
  <!-- PHP Code -->
  <text x="200" y="100" text-anchor="middle">
    <?php echo "Current time: " . date("H:i:s"); ?>
  </text>
  
  <!-- JavaScript -->
  <script><![CDATA[
    document.addEventListener('click', function() {
      alert('Hello from SVG App!');
    });
  ]]></script>
</svg>
```

### Environment Variables

Create a `.env` file in the same directory as your SVG file:

```env
APP_TITLE=My Amazing App
APP_VERSION=1.0.0
THEME_COLOR=#667eea
```

Variables can be used in SVG files with `{VARIABLE_NAME}` syntax.

You can also create a global config at `~/.svg-app-launcher.env` for user-wide settings.

## Building Distributables

Build for all platforms:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build-win    # Windows
npm run build-mac    # macOS  
npm run build-linux  # Linux
```

## Architecture

- **Main Process** (`main.js`): Manages windows, file operations, and PHP server
- **Renderer Process** (`renderer.js`): Handles UI interactions and file management  
- **PHP-like Server**: Express.js server that processes SVG files with PHP-like syntax
- **Environment Loading**: Supports .env files from SVG directory and user home

## Supported Features

### SVG + PHP Integration
- Embedded PHP code execution
- Environment variable substitution
- Dynamic content generation
- Server-side processing

### Desktop App Features
- Native window management
- File associations (Linux)
- Menu bar integration
- Recent files tracking
- Drag & drop support

### Cross-Platform Support
- Windows (NSIS installer)
- macOS (DMG package)
- Linux (AppImage)

## File Structure

```
electron-launcher/
├── main.js           # Main Electron process
├── preload.js        # Security preload script
├── renderer.js       # Frontend logic
├── index.html        # Launcher UI
├── styles.css        # UI styling
├── package.json      # Project configuration
├── setup.sh          # Installation script
└── assets/           # Icons and resources
```

## Examples

See the parent directory for `sample-calculator.svg` - a working example of an SVG+PHP application.

## Development

### Debug Mode

Start with debug console:
```bash
npm start -- --debug
```

### Hot Reload

The launcher includes a reload button for development. You can also press `Ctrl+R` or `Cmd+R` to reload the current SVG application.

## Troubleshooting

### Common Issues

1. **SVG file not loading**: Ensure the file has proper XML structure
2. **PHP code not executing**: Check that PHP syntax is correct and enclosed in `<?php ?>` tags
3. **Environment variables not working**: Verify .env file format and location
4. **Port conflicts**: Change the port in main.js if 8097 is already in use

### Logs

Check the Electron console (F12) for debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Built with Electron
- Icons from Feather Icons
- Styling inspired by modern desktop applications
