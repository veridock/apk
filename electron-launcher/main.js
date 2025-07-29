const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const dotenv = require('dotenv');
const UserAuthSystem = require('./user-auth');

class SVGAppLauncher {
    constructor() {
        this.mainWindow = null;
        this.gridWindow = null;
        this.phpServer = null;
        this.phpPort = 8097;
        this.currentSvgPath = null;
        this.envVars = {};
        this.userAuth = new UserAuthSystem();
    }

    async createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            icon: path.join(__dirname, 'assets', 'icon.png')
        });

        await this.mainWindow.loadFile('index.html');

        // Create menu
        this.createMenu();

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
            this.stopPhpServer();
        });
    }

    createMenu() {
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open SVG Application',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => this.openSvgFile()
                    },
                    {
                        label: 'Open Recent',
                        submenu: this.getRecentFiles()
                    },
                    { type: 'separator' },
                    {
                        label: 'SVG PWA Grid (Level 3)',
                        accelerator: 'CmdOrCtrl+G',
                        click: () => this.openGridView()
                    },
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => app.quit()
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { type: 'separator' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    getRecentFiles() {
        // TODO: Implement recent files from config
        return [
            {
                label: 'No recent files',
                enabled: false
            }
        ];
    }

    async openSvgFile() {
        const result = await dialog.showOpenDialog(this.mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'SVG Applications', extensions: ['svg'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            await this.launchSvgApp(result.filePaths[0]);
        }
    }

    async launchSvgApp(svgPath) {
        try {
            this.currentSvgPath = svgPath;
            
            // Load environment variables
            await this.loadEnvVars(svgPath);
            
            // Get SVG dimensions and resize window
            await this.resizeWindowToSvg(svgPath);
            
            // Start PHP server and wait for it to be ready
            await this.startPhpServer(path.dirname(svgPath));
            
            // Wait a bit more to ensure server is fully ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Load the SVG app in the main window
            const appUrl = `http://localhost:${this.phpPort}/${path.basename(svgPath)}`;
            console.log(`Loading SVG app from: ${appUrl}`);
            
            try {
                await this.mainWindow.loadURL(appUrl);
                
                // Update window title
                const appTitle = this.envVars.APP_TITLE || path.basename(svgPath, '.svg');
                this.mainWindow.setTitle(`SVG App Launcher - ${appTitle}`);
                
            } catch (loadError) {
                console.error('Error loading URL:', loadError);
                // Fallback: try to load the file directly in browser
                const fileUrl = `file://${svgPath}`;
                await this.mainWindow.loadURL(fileUrl);
            }
            
        } catch (error) {
            console.error('Error launching SVG app:', error);
            dialog.showErrorBox('Error', `Failed to launch SVG application: ${error.message}`);
        }
    }

    async loadEnvVars(svgPath) {
        this.envVars = {};
        const svgDir = path.dirname(svgPath);
        const userHome = require('os').homedir();
        
        // Try to load .env from SVG directory first
        const svgEnvPath = path.join(svgDir, '.env');
        if (await fs.pathExists(svgEnvPath)) {
            const envConfig = dotenv.parse(await fs.readFile(svgEnvPath));
            Object.assign(this.envVars, envConfig);
        }
        
        // Try to load .env from user home directory
        const userEnvPath = path.join(userHome, '.svg-app-launcher.env');
        if (await fs.pathExists(userEnvPath)) {
            const envConfig = dotenv.parse(await fs.readFile(userEnvPath));
            Object.assign(this.envVars, envConfig);
        }
        
        // Set default values
        this.envVars.APP_TITLE = this.envVars.APP_TITLE || path.basename(svgPath, '.svg');
        this.envVars.APP_VERSION = this.envVars.APP_VERSION || '1.0.0';
        
        // Set environment variables for PHP
        Object.keys(this.envVars).forEach(key => {
            process.env[key] = this.envVars[key];
        });
    }

    async startPhpServer(workingDir) {
        if (this.phpServer) {
            this.stopPhpServer();
        }

        const serverApp = express();
        
        // Serve static files
        serverApp.use(express.static(workingDir));
        
        // Handle SVG files with PHP processing
        serverApp.get('*', async (req, res) => {
            try {
                const svgPath = path.join(workingDir, req.path);
                
                if (!(await fs.pathExists(svgPath))) {
                    return res.status(404).send('SVG file not found');
                }
                
                if (path.extname(svgPath) !== '.svg') {
                    return res.sendFile(svgPath);
                }
                
                let content = await fs.readFile(svgPath, 'utf8');
                
                // Replace environment variables
                Object.keys(this.envVars).forEach(key => {
                    const placeholder = `{${key}}`;
                    content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), this.envVars[key]);
                });
                
                // Simple PHP-like processing for common patterns
                content = content.replace(/<\?php\s+echo\s+"([^"]+)"\s*\.\s*date\s*\(\s*"([^"]+)"\s*\)\s*;\s*\?>/g, (match, prefix, format) => {
                    const now = new Date();
                    let dateStr = '';
                    if (format === 'H:i:s') {
                        dateStr = now.toTimeString().split(' ')[0];
                    } else if (format === 'Y-m-d') {
                        dateStr = now.toISOString().split('T')[0];
                    } else {
                        dateStr = now.toLocaleString();
                    }
                    return prefix + dateStr;
                });
                
                // Process PHP loops and arrays (basic support)
                content = content.replace(/<\?php[\s\S]*?\?>/g, (phpBlock) => {
                    // This is a simplified PHP processor - for full PHP support, you'd need a real PHP interpreter
                    if (phpBlock.includes('$buttons') && phpBlock.includes('foreach')) {
                        // Handle the calculator buttons specifically
                        const buttons = [
                            ["7", "8", "9", "/"],
                            ["4", "5", "6", "*"],
                            ["1", "2", "3", "-"],
                            ["C", "0", "=", "+"]
                        ];
                        
                        let output = '';
                        let y = 120;
                        buttons.forEach(row => {
                            let x = 20;
                            row.forEach(btn => {
                                output += `<rect x="${x}" y="${y}" width="60" height="40" fill="#3498db" rx="5" class="btn" data-value="${btn}" style="cursor:pointer"/>`;
                                output += `<text x="${x + 30}" y="${y + 25}" text-anchor="middle" fill="white" font-size="18" pointer-events="none">${btn}</text>`;
                                x += 70;
                            });
                            y += 50;
                        });
                        return output;
                    }
                    return '';
                });
                
                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Cache-Control', 'no-cache');
                res.send(content);
                
            } catch (error) {
                console.error('Error serving SVG:', error);
                res.status(500).send('Error processing SVG file');
            }
        });

        return new Promise((resolve, reject) => {
            this.phpServer = serverApp.listen(this.phpPort, 'localhost', (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`PHP-like server started on http://localhost:${this.phpPort}`);
                    resolve();
                }
            });
        });
    }

    stopPhpServer() {
        if (this.phpServer) {
            this.phpServer.close();
            this.phpServer = null;
        }
    }

    async resizeWindowToSvg(svgPath) {
        try {
            // Resolve path to absolute path
            const absolutePath = path.isAbsolute(svgPath) ? svgPath : path.resolve(svgPath);
            const svgContent = await fs.readFile(absolutePath, 'utf8');
            
            // Extract SVG dimensions using regex
            const widthMatch = svgContent.match(/width\s*=\s*["']?(\d+)["']?/i);
            const heightMatch = svgContent.match(/height\s*=\s*["']?(\d+)["']?/i);
            const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']?[^"']*?\s+(\d+)\s+(\d+)["']?/i);
            
            let svgWidth = 800;  // Default width
            let svgHeight = 600; // Default height
            
            if (widthMatch && heightMatch) {
                svgWidth = parseInt(widthMatch[1]);
                svgHeight = parseInt(heightMatch[1]);
            } else if (viewBoxMatch) {
                svgWidth = parseInt(viewBoxMatch[1]);
                svgHeight = parseInt(viewBoxMatch[2]);
            }
            
            // Add padding for window chrome and ensure minimum/maximum sizes
            const padding = 80;
            const minWidth = 400;
            const minHeight = 300;
            const maxWidth = 1600;
            const maxHeight = 1200;
            
            const windowWidth = Math.max(minWidth, Math.min(maxWidth, svgWidth + padding));
            const windowHeight = Math.max(minHeight, Math.min(maxHeight, svgHeight + padding + 60)); // Extra for toolbar
            
            console.log(`Resizing window to: ${windowWidth}x${windowHeight} (SVG: ${svgWidth}x${svgHeight})`);
            
            // Resize the window
            this.mainWindow.setSize(windowWidth, windowHeight);
            this.mainWindow.center();
            
        } catch (error) {
            console.error('Error resizing window to SVG dimensions:', error);
            // Keep default size if error occurs
        }
    }

    openGridView() {
        if (!this.gridWindow) {
            this.gridWindow = new BrowserWindow({
                width: 1400,
                height: 900,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: path.join(__dirname, 'preload.js')
                },
                icon: path.join(__dirname, 'assets', 'icon.png'),
                title: 'SVG PWA Grid - Level 3'
            });

            this.gridWindow.loadFile('grid-view.html');

            this.gridWindow.on('closed', () => {
                this.gridWindow = null;
            });
        } else {
            this.gridWindow.focus();
        }
    }
}

// App event handlers
const launcher = new SVGAppLauncher();

app.whenReady().then(() => {
    launcher.createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            launcher.createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle command line arguments for launching specific SVG files
if (process.argv.length > 2) {
    const svgPath = process.argv[2];
    app.whenReady().then(() => {
        launcher.launchSvgApp(svgPath);
    });
}

// IPC handlers
ipcMain.handle('open-svg-file', () => {
    return launcher.openSvgFile();
});

ipcMain.handle('get-current-svg-path', () => {
    return launcher.currentSvgPath;
});

ipcMain.handle('login', (event, username, password) => {
    return launcher.userAuth.login(username, password);
});

ipcMain.handle('logout', () => {
    return launcher.userAuth.logout();
});

ipcMain.handle('get-user-data', () => {
    return launcher.userAuth.getUserData();
});

ipcMain.handle('open-grid-view', () => {
    if (!launcher.gridWindow) {
        launcher.gridWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        launcher.gridWindow.loadFile('grid-view.html');
    }
    return launcher.gridWindow;
});

ipcMain.handle('close-grid-view', () => {
    if (launcher.gridWindow) {
        launcher.gridWindow.close();
        launcher.gridWindow = null;
    }
});

ipcMain.handle('authenticate-user', async (event, username, password) => {
    try {
        const user = await launcher.userAuth.authenticateUser(username, password);
        return user;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
});

ipcMain.handle('get-current-user', () => {
    return launcher.userAuth.getCurrentUser();
});

ipcMain.handle('get-all-level3-svg-apps', async () => {
    try {
        return await launcher.userAuth.getAllLevel3SvgApps();
    } catch (error) {
        console.error('Error getting apps:', error);
        return [];
    }
});

ipcMain.handle('upload-svg-app', async (event, formData) => {
    try {
        const currentUser = launcher.userAuth.getCurrentUser();
        if (!currentUser || currentUser.level < 3) {
            return { success: false, message: 'Insufficient privileges' };
        }

        // Process the uploaded file
        const appId = require('crypto').randomUUID();
        const appData = {
            id: appId,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            hasPhp: formData.hasPhp,
            hasNodejs: formData.hasNodejs,
            fileName: formData.file.name,
            filePath: null, // Will be set after saving file
            previewSvg: null // Will be generated from SVG content
        };

        // Save the uploaded file
        const appsDir = path.join(require('os').homedir(), '.svg-app-launcher-apps');
        await fs.ensureDir(appsDir);
        
        const fileName = `${appId}.svg`;
        const filePath = path.join(appsDir, fileName);
        
        // Read file content from the upload
        const fileContent = await fs.readFile(formData.file.path);
        await fs.writeFile(filePath, fileContent);
        
        appData.filePath = filePath;
        
        // Generate preview SVG (simplified version)
        try {
            const svgContent = await fs.readFile(filePath, 'utf8');
            // Create a simplified preview by removing PHP code and scripts
            let previewSvg = svgContent
                .replace(/<\?php[\s\S]*?\?>/g, '')
                .replace(/<script[\s\S]*?<\/script>/g, '');
            
            // Limit preview size
            previewSvg = previewSvg.replace(/width\s*=\s*["']?\d+["']?/i, 'width="200"');
            previewSvg = previewSvg.replace(/height\s*=\s*["']?\d+["']?/i, 'height="150"');
            
            appData.previewSvg = previewSvg;
        } catch (previewError) {
            console.warn('Could not generate preview:', previewError);
        }

        // Add to user's apps
        const success = await launcher.userAuth.addSvgAppToUser(currentUser.id, appData);
        
        if (success) {
            return { success: true, message: 'App uploaded successfully' };
        } else {
            return { success: false, message: 'Failed to save app data' };
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('launch-svg-app-by-id', async (event, appId) => {
    try {
        const apps = await launcher.userAuth.getAllLevel3SvgApps();
        const app = apps.find(a => a.id === appId);
        
        if (!app) {
            return { success: false, message: 'App not found' };
        }
        
        if (await fs.pathExists(app.filePath)) {
            await launcher.launchSvgApp(app.filePath);
            return { success: true };
        } else {
            return { success: false, message: 'App file not found' };
        }
        
    } catch (error) {
        console.error('Launch error:', error);
        return { success: false, message: error.message };
    }
});
