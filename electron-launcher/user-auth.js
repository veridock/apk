// User Authentication and Level Management System
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class UserAuthSystem {
    constructor() {
        this.usersFile = path.join(require('os').homedir(), '.svg-app-launcher-users.json');
        this.currentUser = null;
        this.initializeUserSystem();
    }

    async initializeUserSystem() {
        // Create users file if it doesn't exist
        if (!(await fs.pathExists(this.usersFile))) {
            const defaultUsers = {
                users: [
                    {
                        id: 'admin',
                        username: 'admin',
                        password: this.hashPassword('admin123'),
                        level: 3,
                        createdAt: new Date().toISOString(),
                        svgApps: []
                    }
                ]
            };
            await fs.writeJson(this.usersFile, defaultUsers, { spaces: 2 });
        }
    }

    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    async loadUsers() {
        try {
            return await fs.readJson(this.usersFile);
        } catch (error) {
            console.error('Error loading users:', error);
            return { users: [] };
        }
    }

    async saveUsers(usersData) {
        try {
            await fs.writeJson(this.usersFile, usersData, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }

    async authenticateUser(username, password) {
        const usersData = await this.loadUsers();
        const user = usersData.users.find(u => u.username === username);
        
        if (user && user.password === this.hashPassword(password)) {
            this.currentUser = { ...user };
            delete this.currentUser.password; // Remove password from memory
            return this.currentUser;
        }
        
        return null;
    }

    async registerUser(username, password, level = 1) {
        const usersData = await this.loadUsers();
        
        // Check if user already exists
        if (usersData.users.find(u => u.username === username)) {
            return { success: false, message: 'User already exists' };
        }

        const newUser = {
            id: crypto.randomUUID(),
            username,
            password: this.hashPassword(password),
            level,
            createdAt: new Date().toISOString(),
            svgApps: []
        };

        usersData.users.push(newUser);
        
        if (await this.saveUsers(usersData)) {
            return { success: true, message: 'User registered successfully' };
        } else {
            return { success: false, message: 'Error saving user data' };
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLevel3User() {
        return this.currentUser && this.currentUser.level >= 3;
    }

    logout() {
        this.currentUser = null;
    }

    async addSvgAppToUser(userId, svgAppData) {
        const usersData = await this.loadUsers();
        const user = usersData.users.find(u => u.id === userId);
        
        if (user) {
            if (!user.svgApps) user.svgApps = [];
            user.svgApps.push({
                ...svgAppData,
                addedAt: new Date().toISOString()
            });
            await this.saveUsers(usersData);
            return true;
        }
        
        return false;
    }

    async getUserSvgApps(userId) {
        const usersData = await this.loadUsers();
        const user = usersData.users.find(u => u.id === userId);
        return user ? (user.svgApps || []) : [];
    }

    async getAllLevel3SvgApps() {
        const usersData = await this.loadUsers();
        const level3Users = usersData.users.filter(u => u.level >= 3);
        
        const allApps = [];
        level3Users.forEach(user => {
            if (user.svgApps) {
                user.svgApps.forEach(app => {
                    allApps.push({
                        ...app,
                        username: user.username,
                        userId: user.id
                    });
                });
            }
        });
        
        return allApps;
    }
}

module.exports = UserAuthSystem;
