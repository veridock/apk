const { app, BrowserWindow, Menu, dialog, shell, protocol, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const net = require('net');
const dotenv = require('dotenv');

// Configuration
let phpServer = null;
let mainWindow = null;
let currentSvgPath = null;
let serverPort = 9876;
let phpPath = null;

// Auto-detect PHP installation
function findPHP() {
    const possiblePaths = [
        'php', // System PATH
        '/usr/bin/php',
        '/usr/local/bin/php',
        'C:\\php\\php.exe',
        'C:\\xampp\\php\\php.exe',
        'C:\\Program Files\\PHP\\php.exe',
        path.join(process.resourcesPath, 'php', 'php'), // Bundled PHP
    ];

    for (const phpCmd of possiblePaths) {
        try {
            const result = require('child_process').execSync(`"${phpCmd}" -v`, { 
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore']
            });
            if (result.includes('PHP')) {
                console.log(`Found PHP at: ${phpCmd}`);
                return phpCmd;
            }
        } catch (e) {
            // Continue searching
        }
    }
    
    return null;
}

// Find available port
async function findAvailablePort(startPort = 9876) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            server.once('close', () => {
                resolve(startPort);
            });
            server.close();
        });
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// Load environment variables
function loadEnvVariables(svgPath) {
    const envVars = {};
    
    // Check for .env in same directory as SVG
    const svgDir = path.dirname(svgPath);
    const localEnvPath = path.join(svgDir, '.env');
    
    // Check for .env in user's config directory
    const userConfigDir = app.getPath('userData');
    const userEnvPath = path.join(userConfigDir, '.env');
    
    // Load from both locations (local takes precedence)
    if (fs.existsSync(userEnvPath)) {
        Object.assign(envVars, dotenv.parse(fs.readFileSync(userEnvPath)));
    }
    
    if (fs.existsSync(localEnvPath)) {
        Object.assign(envVars, dotenv.parse(fs.readFileSync(localEnvPath)));
    }
    
    // Add default variables
    envVars.APP_TITLE = envVars.APP_TITLE || path.basename(svgPath, '.svg');
    envVars.APP_VERSION = envVars.APP_VERSION || app.getVersion();
    envVars.SVG_PATH = svgPath;
    
    return envVars;
}

// Start PHP server
async function startPHPServer(svgPath) {
    if (phpServer) {
        phpServer.kill();
    }

    const port = await findAvailablePort(serverPort);
    const svgDir = path.dirname(svgPath);
    const envVars = loadEnvVariables(svgPath);
    
    // Create router dynamically
    const routerPath = path.join(app.getPath('temp'), 'svg-router.php');
    
    // Convert JavaScript object to PHP array syntax
    const phpEnvVars = Object.entries(envVars)
        .map(([key, value]) => `    '${key}' => '${value.toString().replace(/'/g, "\\'")}'`)
        .join(',\n');
    
    const routerContent = `<?php
// Dynamic router for SVG+PHP Electron app
$svgFile = '${svgPath.replace(/\\/g, '\\\\')}';
$envVars = [
${phpEnvVars}
];

// Set environment variables
foreach ($envVars as $key => $value) {
    $_ENV[$key] = $value;
    putenv("$key=$value");
}

// Handle requests
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/' || $uri === '/index.svg') {
    header('Content-Type: image/svg+xml');
    
    // Read SVG content
    $content = file_get_contents($svgFile);
    
    // Replace placeholders
    $replacements = [
        '{APP_TITLE}' => $_ENV['APP_TITLE'] ?? 'SVG App',
        '{APP_VERSION}' => $_ENV['APP_VERSION'] ?? '1.0.0',
        '{CURRENT_TIME}' => date('H:i:s'),
        '{CURRENT_DATE}' => date('Y-m-d'),
        '{PHP_VERSION}' => PHP_VERSION,
        '{USER_NAME}' => $_ENV['USER'] ?? 'User',
        '{HOST_NAME}' => gethostname()
    ];
    
    $content = str_replace(array_keys($replacements), array_values($replacements), $content);
    
    // Process PHP in SVG
    eval('?>' . $content);
    return true;
}

// Handle static files
$file = __DIR__ . $uri;
if (file_exists($file) && !is_dir($file)) {
    return false;
}

// 404
http_response_code(404);
echo "Not found: $uri";
`;

    fs.writeFileSync(routerPath, routerContent);

    // Start PHP server
    return new Promise((resolve, reject) => {
        phpServer = spawn(phpPath, [
            '-S', `localhost:${port}`,
            '-t', svgDir,
            routerPath
        ], {
            cwd: svgDir,
            env: { ...process.env, ...envVars }
        });

        phpServer.stdout.on('data', (data) => {
            console.log(`PHP: ${data}`);
            if (data.toString().includes('started')) {
                serverPort = port;
                resolve(port);
            }
        });

        phpServer.stderr.on('data', (data) => {
            console.error(`PHP Error: ${data}`);
            if (data.toString().includes('started')) {
                serverPort = port;
                resolve(port);
            }
        });

        phpServer.on('error', (err) => {
            reject(err);
        });

        // Give server time to start
        setTimeout(() => resolve(port), 1000);
    });
}

// Create main window
async function createWindow(svgPath = null) {
    // Load SVG to get dimensions
    let width = 1024;
    let height = 768;
    let title = 'SVG+PHP Application';

    if (svgPath && fs.existsSync(svgPath)) {
        try {
            const svgContent = fs.readFileSync(svgPath, 'utf8');
            
            // Extract dimensions
            const widthMatch = svgContent.match(/width=["'](\d+)/);
            const heightMatch = svgContent.match(/height=["'](\d+)/);
            
            if (widthMatch) width = Math.min(parseInt(widthMatch[1]), 1920);
            if (heightMatch) height = Math.min(parseInt(heightMatch[1]), 1080);
            
            // Extract title
            const titleMatch = svgContent.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) title = titleMatch[1];
        } catch (e) {
            console.error('Error reading SVG:', e);
        }
    }

    mainWindow = new BrowserWindow({
        width: width + 50, // Add some padding
        height: height + 100, // Account for title bar
        title: title,
        icon: svgPath, // Use SVG as icon
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: false
    });

    // Create application menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open SVG...',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                { name: 'SVG Files', extensions: ['svg'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });
                        
                        if (!result.canceled && result.filePaths[0]) {
                            loadSVG(result.filePaths[0]);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle DevTools',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                },
                {
                    label: 'Actual Size',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow.webContents.setZoomLevel(0);
                    }
                },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomLevel();
                        mainWindow.webContents.setZoomLevel(currentZoom + 1);
                    }
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomLevel();
                        mainWindow.webContents.setZoomLevel(currentZoom - 1);
                    }
                }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Open .env Editor',
                    click: () => {
                        openEnvEditor();
                    }
                },
                {
                    label: 'Show PHP Info',
                    click: () => {
                        showPHPInfo();
                    }
                },
                {
                    label: 'Open SVG Directory',
                    click: () => {
                        if (currentSvgPath) {
                            shell.showItemInFolder(currentSvgPath);
                        }
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: 'info',
                            title: 'About SVG+PHP Launcher',
                            message: 'SVG+PHP Electron Launcher',
                            detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}\nPHP: ${phpPath}`,
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Load SVG if provided
    if (svgPath) {
        await loadSVG(svgPath);
    } else {
        // Show welcome screen
        mainWindow.loadFile('welcome.html');
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Load SVG file
async function loadSVG(svgPath) {
    if (!fs.existsSync(svgPath)) {
        dialog.showErrorBox('Error', `File not found: ${svgPath}`);
        return;
    }

    currentSvgPath = svgPath;
    mainWindow.setTitle(`${path.basename(svgPath)} - SVG+PHP Launcher`);

    try {
        const port = await startPHPServer(svgPath);
        mainWindow.loadURL(`http://localhost:${port}/`);
    } catch (error) {
        dialog.showErrorBox('Error', `Failed to start PHP server: ${error.message}`);
    }
}

// Open .env editor
function openEnvEditor() {
    const envWindow = new BrowserWindow({
        width: 600,
        height: 400,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    envWindow.loadFile('env-editor.html');
}

// Show PHP info
function showPHPInfo() {
    const infoWindow = new BrowserWindow({
        width: 800,
        height: 600,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: false
        }
    });

    infoWindow.loadURL(`http://localhost:${serverPort}/phpinfo.php`);
}

// App event handlers
app.whenReady().then(async () => {
    // Check for PHP
    phpPath = findPHP();
    
    if (!phpPath) {
        const result = await dialog.showMessageBox({
            type: 'error',
            title: 'PHP Not Found',
            message: 'PHP is required to run SVG+PHP applications.',
            detail: 'Would you like to download PHP or locate it manually?',
            buttons: ['Download PHP', 'Locate Manually', 'Exit'],
            defaultId: 0
        });

        if (result.response === 0) {
            shell.openExternal('https://www.php.net/downloads');
            app.quit();
            return;
        } else if (result.response === 1) {
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: 'PHP Executable', extensions: ['exe', ''] }
                ]
            });
            
            if (!result.canceled && result.filePaths[0]) {
                phpPath = result.filePaths[0];
            } else {
                app.quit();
                return;
            }
        } else {
            app.quit();
            return;
        }
    }

    // Register SVG protocol
    protocol.registerFileProtocol('svg', (request, callback) => {
        const url = request.url.substr(6);
        callback({ path: path.normalize(url) });
    });

    // Handle file open (double-click on SVG)
    const svgFile = process.argv.find(arg => arg.endsWith('.svg'));
    
    createWindow(svgFile);
});

app.on('window-all-closed', () => {
    if (phpServer) {
        phpServer.kill();
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Handle file open on macOS
app.on('open-file', (event, path) => {
    event.preventDefault();
    
    if (mainWindow) {
        loadSVG(path);
    } else {
        app.whenReady().then(() => createWindow(path));
    }
});

// IPC handlers
ipcMain.handle('get-env-vars', () => {
    if (currentSvgPath) {
        return loadEnvVariables(currentSvgPath);
    }
    return {};
});

ipcMain.handle('save-env-vars', (event, vars) => {
    if (currentSvgPath) {
        const envPath = path.join(path.dirname(currentSvgPath), '.env');
        const content = Object.entries(vars)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        
        fs.writeFileSync(envPath, content);
        
        // Restart server with new vars
        loadSVG(currentSvgPath);
        
        return true;
    }
    return false;
});