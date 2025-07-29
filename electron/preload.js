const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // File operations
    openFile: () => ipcRenderer.invoke('open-file'),
    saveFile: (data) => ipcRenderer.invoke('save-file', data),

    // Environment variables
    getEnvVars: () => ipcRenderer.invoke('get-env-vars'),
    saveEnvVars: (vars) => ipcRenderer.invoke('save-env-vars', vars),

    // Window operations
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),

    // SVG operations
    reloadSVG: () => ipcRenderer.send('reload-svg'),
    openSVGDirectory: () => ipcRenderer.send('open-svg-directory'),

    // System info
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    getPHPInfo: () => ipcRenderer.invoke('get-php-info'),

    // Application events
    onSVGLoaded: (callback) => ipcRenderer.on('svg-loaded', callback),
    onError: (callback) => ipcRenderer.on('error', callback),

    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Add some console enhancements for debugging
console.log('%c SVG+PHP Launcher ', 'background: #667eea; color: white; padding: 5px 10px; border-radius: 3px;');
console.log('Preload script loaded successfully');

// Intercept file drops on the window
window.addEventListener('DOMContentLoaded', () => {
    // Prevent default file drop behavior
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        const svgFile = files.find(file => file.name.endsWith('.svg'));

        if (svgFile) {
            ipcRenderer.send('load-svg', svgFile.path);
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});