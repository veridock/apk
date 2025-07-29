const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    openSvgFile: () => ipcRenderer.invoke('open-svg-file'),
    getCurrentSvgPath: () => ipcRenderer.invoke('get-current-svg-path'),
    
    // User Authentication
    authenticateUser: (username, password) => ipcRenderer.invoke('authenticate-user', username, password),
    getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
    logout: () => ipcRenderer.invoke('logout'),
    
    // Grid View Management
    openGridView: () => ipcRenderer.invoke('open-grid-view'),
    closeGridView: () => ipcRenderer.invoke('close-grid-view'),
    
    // SVG App Management
    getAllLevel3SvgApps: () => ipcRenderer.invoke('get-all-level3-svg-apps'),
    uploadSvgApp: (formData) => ipcRenderer.invoke('upload-svg-app', formData),
    launchSvgAppById: (appId) => ipcRenderer.invoke('launch-svg-app-by-id', appId)
});

// Expose Node.js path utilities for the renderer
contextBridge.exposeInMainWorld('nodeAPI', {
    path: {
        basename: (...args) => require('path').basename(...args),
        dirname: (...args) => require('path').dirname(...args),
        join: (...args) => require('path').join(...args)
    }
});
