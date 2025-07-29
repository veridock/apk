// Grid View Renderer for SVG PWA Applications
class SVGPWAGrid {
    constructor() {
        this.currentUser = null;
        this.allApps = [];
        this.filteredApps = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthenticationStatus();
    }

    setupEventListeners() {
        // Login/Logout
        document.getElementById('login-btn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('cancel-login').addEventListener('click', () => this.hideLoginModal());

        // Upload
        document.getElementById('upload-btn').addEventListener('click', () => this.showUploadModal());
        document.getElementById('upload-form').addEventListener('submit', (e) => this.handleUpload(e));
        document.getElementById('cancel-upload').addEventListener('click', () => this.hideUploadModal());

        // Toolbar
        document.getElementById('refresh-btn').addEventListener('click', () => this.refreshApps());
        document.getElementById('search-input').addEventListener('input', (e) => this.filterApps());
        document.getElementById('category-filter').addEventListener('change', (e) => this.filterApps());

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    async checkAuthenticationStatus() {
        try {
            const user = await window.electronAPI.getCurrentUser();
            if (user && user.level >= 3) {
                this.currentUser = user;
                this.showGridContent();
                await this.loadApps();
            } else {
                this.showAccessMessage();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showAccessMessage();
        }
    }

    showLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
        document.getElementById('username-input').focus();
    }

    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('login-form').reset();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;

        try {
            const user = await window.electronAPI.authenticateUser(username, password);
            
            if (user && user.level >= 3) {
                this.currentUser = user;
                this.hideLoginModal();
                this.showGridContent();
                await this.loadApps();
            } else if (user) {
                alert('Level 3 access required for SVG PWA Grid');
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    }

    async logout() {
        await window.electronAPI.logout();
        this.currentUser = null;
        this.showAccessMessage();
    }

    showAccessMessage() {
        document.getElementById('access-message').style.display = 'flex';
        document.getElementById('grid-content').style.display = 'none';
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('username').textContent = 'Not logged in';
    }

    showGridContent() {
        document.getElementById('access-message').style.display = 'none';
        document.getElementById('grid-content').style.display = 'block';
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('username').textContent = this.currentUser.username;
    }

    showUploadModal() {
        document.getElementById('upload-modal').style.display = 'flex';
        document.getElementById('app-title').focus();
    }

    hideUploadModal() {
        document.getElementById('upload-modal').style.display = 'none';
        document.getElementById('upload-form').reset();
    }

    async handleUpload(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('app-title').value,
            description: document.getElementById('app-description').value,
            category: document.getElementById('app-category').value,
            hasPhp: document.getElementById('has-php').checked,
            hasNodejs: document.getElementById('has-nodejs').checked,
            file: document.getElementById('app-file').files[0]
        };

        if (!formData.file) {
            alert('Please select an SVG file');
            return;
        }

        try {
            const result = await window.electronAPI.uploadSvgApp(formData);
            if (result.success) {
                this.hideUploadModal();
                await this.loadApps();
                alert('Application uploaded successfully!');
            } else {
                alert('Upload failed: ' + result.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        }
    }

    async loadApps() {
        this.showLoading();
        
        try {
            this.allApps = await window.electronAPI.getAllLevel3SvgApps();
            this.filteredApps = [...this.allApps];
            this.renderApps();
        } catch (error) {
            console.error('Error loading apps:', error);
            this.showEmpty();
        }
    }

    async refreshApps() {
        await this.loadApps();
    }

    filterApps() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;

        this.filteredApps = this.allApps.filter(app => {
            const matchesSearch = !searchTerm || 
                app.title.toLowerCase().includes(searchTerm) ||
                app.description.toLowerCase().includes(searchTerm) ||
                app.username.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || app.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });

        this.renderApps();
    }

    renderApps() {
        const appsGrid = document.getElementById('apps-grid');
        
        if (this.filteredApps.length === 0) {
            this.showEmpty();
            return;
        }

        this.hideLoading();
        this.hideEmpty();

        appsGrid.innerHTML = this.filteredApps.map((app, index) => `
            <div class="app-card" onclick="grid.launchApp('${app.id}')" style="animation-delay: ${index * 0.1}s">
                <div class="app-preview">
                    ${app.previewSvg ? app.previewSvg : `
                        <div class="preview-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                            </svg>
                            <p>SVG Preview</p>
                        </div>
                    `}
                </div>
                
                <div class="app-info">
                    <div class="app-title">${app.title}</div>
                    <div class="app-description">${app.description || 'No description available'}</div>
                    
                    <div class="app-meta">
                        <div class="app-category">${app.category || 'Other'}</div>
                        <div class="app-tech">
                            ${app.hasPhp ? '<span class="tech-badge php">PHP</span>' : ''}
                            ${app.hasNodejs ? '<span class="tech-badge nodejs">Node.js</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="app-footer">
                        <span class="app-author">by ${app.username}</span>
                        <span class="app-date">${new Date(app.addedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showLoading() {
        document.getElementById('loading-message').style.display = 'block';
        document.getElementById('apps-grid').style.display = 'none';
        document.getElementById('empty-message').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('apps-grid').style.display = 'grid';
    }

    showEmpty() {
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('apps-grid').style.display = 'none';
        document.getElementById('empty-message').style.display = 'block';
    }

    hideEmpty() {
        document.getElementById('empty-message').style.display = 'none';
    }

    async launchApp(appId) {
        try {
            const result = await window.electronAPI.launchSvgAppById(appId);
            if (!result.success) {
                alert('Failed to launch application: ' + result.message);
            }
        } catch (error) {
            console.error('Error launching app:', error);
            alert('Failed to launch application. Please try again.');
        }
    }
}

// Initialize the grid when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.grid = new SVGPWAGrid();
});
