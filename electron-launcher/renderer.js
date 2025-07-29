// SVG App Launcher Renderer Process
class SVGLauncher {
    constructor() {
        this.currentSvgPath = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.loadRecentFiles();
    }

    setupEventListeners() {
        // Open file button
        const openFileBtn = document.getElementById('open-file-btn');
        const dropZone = document.getElementById('drop-zone');
        const backBtn = document.getElementById('back-btn');
        const reloadBtn = document.getElementById('reload-btn');
        const devToolsBtn = document.getElementById('devtools-btn');

        openFileBtn.addEventListener('click', () => this.openFile());
        dropZone.addEventListener('click', () => this.openFile());
        backBtn.addEventListener('click', () => this.showWelcomeScreen());
        reloadBtn.addEventListener('click', () => this.reloadApp());
        devToolsBtn.addEventListener('click', () => this.openDevTools());
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            const svgFile = files.find(file => file.name.toLowerCase().endsWith('.svg'));
            
            if (svgFile) {
                this.launchSvgApp(svgFile.path);
            } else {
                this.showError('Please drop a valid SVG file.');
            }
        });
    }

    async openFile() {
        try {
            const result = await window.electronAPI.openSvgFile();
            if (result) {
                // File selection was successful
                await this.refreshCurrentApp();
            }
        } catch (error) {
            console.error('Error opening file:', error);
            this.showError('Failed to open SVG file.');
        }
    }

    async launchSvgApp(svgPath) {
        try {
            this.currentSvgPath = svgPath;
            await this.showAppView();
            this.addToRecentFiles(svgPath);
        } catch (error) {
            console.error('Error launching SVG app:', error);
            this.showError('Failed to launch SVG application.');
        }
    }

    async refreshCurrentApp() {
        try {
            const currentPath = await window.electronAPI.getCurrentSvgPath();
            if (currentPath) {
                this.currentSvgPath = currentPath;
                await this.showAppView();
            }
        } catch (error) {
            console.error('Error refreshing app:', error);
        }
    }

    showWelcomeScreen() {
        document.getElementById('welcome-section').style.display = 'grid';
        document.getElementById('app-view').style.display = 'none';
    }

    async showAppView() {
        if (!this.currentSvgPath) return;

        const welcomeSection = document.getElementById('welcome-section');
        const appView = document.getElementById('app-view');
        const appTitle = document.getElementById('app-title');
        const appFrame = document.getElementById('app-frame');

        // Update title
        const fileName = window.nodeAPI.path.basename(this.currentSvgPath, '.svg');
        appTitle.textContent = fileName;

        // Show app view
        welcomeSection.style.display = 'none';
        appView.style.display = 'flex';

        // Load the SVG app in iframe (will be served by the Electron main process)
        const appUrl = `http://localhost:8097/${window.nodeAPI.path.basename(this.currentSvgPath)}`;
        appFrame.src = appUrl;
    }

    reloadApp() {
        const appFrame = document.getElementById('app-frame');
        if (appFrame.src) {
            appFrame.src = appFrame.src;
        }
    }

    openDevTools() {
        // This would be handled by the main process
        console.log('Opening developer tools...');
    }

    loadRecentFiles() {
        // Load recent files from localStorage
        const recentFiles = this.getRecentFiles();
        const recentList = document.getElementById('recent-list');
        
        if (recentFiles.length === 0) {
            recentList.innerHTML = '<p class="no-recent">No recent applications</p>';
            return;
        }

        recentList.innerHTML = recentFiles.map(file => `
            <div class="recent-item" onclick="launcher.launchSvgApp('${file.path}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                <div>
                    <div class="recent-name">${file.name}</div>
                    <div class="recent-path">${file.path}</div>
                </div>
            </div>
        `).join('');
    }

    getRecentFiles() {
        const recent = localStorage.getItem('recentSvgFiles');
        return recent ? JSON.parse(recent) : [];
    }

    addToRecentFiles(filePath) {
        let recentFiles = this.getRecentFiles();
        const fileName = window.nodeAPI.path.basename(filePath, '.svg');
        
        // Remove if already exists
        recentFiles = recentFiles.filter(file => file.path !== filePath);
        
        // Add to beginning
        recentFiles.unshift({
            name: fileName,
            path: filePath,
            timestamp: Date.now()
        });
        
        // Keep only last 10
        recentFiles = recentFiles.slice(0, 10);
        
        localStorage.setItem('recentSvgFiles', JSON.stringify(recentFiles));
        this.loadRecentFiles();
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper modal
        alert(message);
    }
}

// Initialize the launcher when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.launcher = new SVGLauncher();
});
