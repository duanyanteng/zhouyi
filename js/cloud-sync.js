/**
 * 乾坤易道 - 云端同步模块
 * @module cloud-sync
 * @description 实现多设备数据同步，包括用户认证、数据同步、冲突解决、离线支持
 */

import { showToast } from './utils.js?v=20260624-1';

/* ========== 云端同步配置 ========== */

const CLOUD_CONFIG = {
    // 同步配置
    syncInterval: 5 * 60 * 1000, // 自动同步间隔：5分钟
    maxRetries: 3, // 最大重试次数
    retryDelay: 5000, // 重试延迟：5秒

    // 存储键名
    keys: {
        auth: 'qky_cloud_auth',
        userData: 'qky_cloud_data',
        syncQueue: 'qky_sync_queue',
        lastSync: 'qky_last_sync',
        conflict: 'qky_sync_conflict',
    },

    // 同步模块
    modules: [
        'bazi',
        'liuyao',
        'huangli',
        'fengshui',
        'chat',
        'xingming',
        'meihua',
        'hehun',
        'ziwei',
        'hepan',
        'shuzi',
        'qimen',
        'liuren',
        'taiyi',
    ],
};

/* ========== 认证管理器 ========== */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    /**
     * 初始化认证状态
     */
    init() {
        const savedAuth = this.getSavedAuth();
        if (savedAuth && savedAuth.token) {
            this.currentUser = savedAuth.user;
            this.isAuthenticated = true;
            console.log('已恢复登录状态:', this.currentUser.username);
        }
    }

    /**
     * 获取保存的认证信息
     */
    getSavedAuth() {
        try {
            const auth = localStorage.getItem(CLOUD_CONFIG.keys.auth);
            return auth ? JSON.parse(auth) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * 保存认证信息
     */
    saveAuth(user, token) {
        const authData = {
            user: user,
            token: token,
            timestamp: Date.now(),
        };
        localStorage.setItem(CLOUD_CONFIG.keys.auth, JSON.stringify(authData));
        this.currentUser = user;
        this.isAuthenticated = true;
    }

    /**
     * 注册新用户
     * @param {string} username - 用户名
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     * @returns {Promise<Object>} 注册结果
     */
    async register(username, email, password) {
        // 模拟API调用
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 检查用户名是否已存在
                const users = this.getUsers();
                if (users.find(u => u.username === username)) {
                    reject(new Error('用户名已存在'));
                    return;
                }

                if (users.find(u => u.email === email)) {
                    reject(new Error('邮箱已被注册'));
                    return;
                }

                // 创建新用户
                const newUser = {
                    id: 'user_' + Date.now(),
                    username: username,
                    email: email,
                    createdAt: Date.now(),
                };

                // 保存用户（模拟）
                users.push({
                    ...newUser,
                    password: btoa(password), // 简单编码
                });
                this.saveUsers(users);

                // 生成token
                const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);

                // 保存认证信息
                this.saveAuth(newUser, token);

                resolve({
                    success: true,
                    user: newUser,
                    token: token,
                });
            }, 500);
        });
    }

    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} 登录结果
     */
    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = this.getUsers();
                const user = users.find(u =>
                    u.username === username && u.password === btoa(password)
                );

                if (!user) {
                    reject(new Error('用户名或密码错误'));
                    return;
                }

                const { password: _, ...userInfo } = user;
                const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);

                this.saveAuth(userInfo, token);

                resolve({
                    success: true,
                    user: userInfo,
                    token: token,
                });
            }, 500);
        });
    }

    /**
     * 用户登出
     */
    logout() {
        localStorage.removeItem(CLOUD_CONFIG.keys.auth);
        this.currentUser = null;
        this.isAuthenticated = false;
        console.log('用户已登出');
    }

    /**
     * 获取用户列表（模拟）
     */
    getUsers() {
        try {
            const users = localStorage.getItem('qky_cloud_users');
            return users ? JSON.parse(users) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 保存用户列表（模拟）
     */
    saveUsers(users) {
        localStorage.setItem('qky_cloud_users', JSON.stringify(users));
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 是否已认证
     */
    getIsAuthenticated() {
        return this.isAuthenticated;
    }
}

/* ========== 数据同步管理器 ========== */

class SyncManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.isSyncing = false;
        this.syncQueue = [];
        this.lastSyncTime = null;
        this.autoSyncTimer = null;
        this.conflictResolver = new ConflictResolver();
    }

    /**
     * 初始化同步管理器
     */
    init() {
        // 加载上次同步时间
        this.lastSyncTime = this.getLastSyncTime();

        // 加载同步队列
        this.syncQueue = this.getSyncQueue();

        // 监听网络状态
        window.addEventListener('online', () => {
            console.log('网络已连接，开始同步...');
            this.syncToCloud();
        });

        window.addEventListener('offline', () => {
            console.log('网络已断开，切换到离线模式');
            this.stopAutoSync();
        });

        // 启动自动同步（如果已登录）
        if (this.authManager.getIsAuthenticated()) {
            this.startAutoSync();
        }

        console.log('同步管理器初始化完成');
    }

    /**
     * 开始自动同步
     */
    startAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
        }

        this.autoSyncTimer = setInterval(() => {
            if (navigator.onLine && this.authManager.getIsAuthenticated()) {
                this.syncToCloud();
            }
        }, CLOUD_CONFIG.syncInterval);

        console.log('自动同步已启动，间隔:', CLOUD_CONFIG.syncInterval / 1000, '秒');
    }

    /**
     * 停止自动同步
     */
    stopAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
        }
        console.log('自动同步已停止');
    }

    /**
     * 同步数据到云端
     */
    async syncToCloud() {
        if (this.isSyncing) {
            console.log('正在同步中，跳过...');
            return;
        }

        if (!this.authManager.getIsAuthenticated()) {
            console.log('未登录，跳过同步');
            return;
        }

        this.isSyncing = true;

        try {
            const user = this.authManager.getCurrentUser();
            const localData = this.collectLocalData();

            // 获取云端数据
            const cloudData = await this.getCloudData(user.id);

            // 检测冲突
            const conflicts = this.conflictResolver.detectConflicts(localData, cloudData);

            if (conflicts.length > 0) {
                console.log('检测到冲突:', conflicts.length, '项');
                // 解决冲突
                const resolvedData = await this.conflictResolver.resolve(conflicts, localData, cloudData);
                await this.saveCloudData(user.id, resolvedData);
                this.restoreToLocal(resolvedData);
            } else {
                // 无冲突，直接同步
                await this.saveCloudData(user.id, localData);
            }

            // 更新同步时间
            this.lastSyncTime = Date.now();
            this.saveLastSyncTime(this.lastSyncTime);

            // 清空同步队列
            this.syncQueue = [];
            this.saveSyncQueue([]);

            console.log('同步完成');
            showToast('数据同步完成', 1500);

        } catch (err) {
            console.error('同步失败:', err);
            showToast('数据同步失败: ' + err.message, 2000);

            // 添加到同步队列
            this.addToSyncQueue({
                action: 'sync',
                timestamp: Date.now(),
                error: err.message,
            });

        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * 从云端恢复数据
     */
    async restoreFromCloud() {
        if (!this.authManager.getIsAuthenticated()) {
            throw new Error('请先登录');
        }

        const user = this.authManager.getCurrentUser();
        const cloudData = await this.getCloudData(user.id);

        if (cloudData) {
            this.restoreToLocal(cloudData);
            showToast('数据恢复成功', 2000);
        } else {
            showToast('云端无数据', 1500);
        }
    }

    /**
     * 收集本地数据
     */
    collectLocalData() {
        const data = {
            version: '6.0',
            timestamp: Date.now(),
            modules: {},
        };

        // 收集各模块数据
        for (const module of CLOUD_CONFIG.modules) {
            const moduleData = localStorage.getItem(`qky_${module}_data`);
            if (moduleData) {
                try {
                    data.modules[module] = JSON.parse(moduleData);
                } catch (e) {
                    console.warn(`模块 ${module} 数据解析失败`);
                }
            }
        }

        // 收集历史记录
        const history = localStorage.getItem('qky_global_history_v1');
        if (history) {
            data.history = JSON.parse(history);
        }

        // 收集设置
        const settings = localStorage.getItem('qky_settings');
        if (settings) {
            data.settings = JSON.parse(settings);
        }

        return data;
    }

    /**
     * 恢复数据到本地
     */
    restoreToLocal(data) {
        if (!data || !data.modules) return;

        // 恢复各模块数据
        for (const [module, moduleData] of Object.entries(data.modules)) {
            localStorage.setItem(`qky_${module}_data`, JSON.stringify(moduleData));
        }

        // 恢复历史记录
        if (data.history) {
            localStorage.setItem('qky_global_history_v1', JSON.stringify(data.history));
        }

        // 恢复设置
        if (data.settings) {
            localStorage.setItem('qky_settings', JSON.stringify(data.settings));
        }

        console.log('本地数据已恢复');
    }

    /**
     * 获取云端数据（模拟）
     */
    async getCloudData(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const cloudStorage = localStorage.getItem(CLOUD_CONFIG.keys.userData);
                const allData = cloudStorage ? JSON.parse(cloudStorage) : {};
                resolve(allData[userId] || null);
            }, 200);
        });
    }

    /**
     * 保存数据到云端（模拟）
     */
    async saveCloudData(userId, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const cloudStorage = localStorage.getItem(CLOUD_CONFIG.keys.userData);
                const allData = cloudStorage ? JSON.parse(cloudStorage) : {};
                allData[userId] = data;
                localStorage.setItem(CLOUD_CONFIG.keys.userData, JSON.stringify(allData));
                resolve(true);
            }, 200);
        });
    }

    /**
     * 获取上次同步时间
     */
    getLastSyncTime() {
        const time = localStorage.getItem(CLOUD_CONFIG.keys.lastSync);
        return time ? parseInt(time) : null;
    }

    /**
     * 保存同步时间
     */
    saveLastSyncTime(time) {
        localStorage.setItem(CLOUD_CONFIG.keys.lastSync, time.toString());
    }

    /**
     * 获取同步队列
     */
    getSyncQueue() {
        try {
            const queue = localStorage.getItem(CLOUD_CONFIG.keys.syncQueue);
            return queue ? JSON.parse(queue) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 保存同步队列
     */
    saveSyncQueue(queue) {
        localStorage.setItem(CLOUD_CONFIG.keys.syncQueue, JSON.stringify(queue));
    }

    /**
     * 添加到同步队列
     */
    addToSyncQueue(item) {
        this.syncQueue.push(item);
        this.saveSyncQueue(this.syncQueue);
    }

    /**
     * 获取同步状态
     */
    getSyncStatus() {
        return {
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            queueLength: this.syncQueue.length,
            isOnline: navigator.onLine,
        };
    }
}

/* ========== 冲突解决器 ========== */

class ConflictResolver {
    /**
     * 检测冲突
     * @param {Object} localData - 本地数据
     * @param {Object} cloudData - 云端数据
     * @returns {Array} 冲突列表
     */
    detectConflicts(localData, cloudData) {
        const conflicts = [];

        if (!cloudData || !localData) return conflicts;

        // 比较各模块数据
        for (const module of CLOUD_CONFIG.modules) {
            const localModule = localData.modules[module];
            const cloudModule = cloudData.modules[module];

            if (localModule && cloudModule) {
                const localTime = localModule.timestamp || 0;
                const cloudTime = cloudModule.timestamp || 0;

                // 如果两边都有更新，且时间不同，产生冲突
                if (localTime > 0 && cloudTime > 0 && localTime !== cloudTime) {
                    conflicts.push({
                        module: module,
                        localTime: localTime,
                        cloudTime: cloudTime,
                        localData: localModule,
                        cloudData: cloudModule,
                    });
                }
            }
        }

        return conflicts;
    }

    /**
     * 解决冲突
     * @param {Array} conflicts - 冲突列表
     * @param {Object} localData - 本地数据
     * @param {Object} cloudData - 云端数据
     * @returns {Object} 解决后的数据
     */
    async resolve(conflicts, localData, cloudData) {
        const resolvedData = {
            ...cloudData,
            modules: { ...cloudData.modules },
            timestamp: Date.now(),
        };

        // 策略：时间戳优先（最新的保留）
        for (const conflict of conflicts) {
            if (conflict.localTime > conflict.cloudTime) {
                resolvedData.modules[conflict.module] = conflict.localData;
                console.log(`冲突解决 [${conflict.module}]: 使用本地数据`);
            } else {
                resolvedData.modules[conflict.module] = conflict.cloudData;
                console.log(`冲突解决 [${conflict.module}]: 使用云端数据`);
            }
        }

        return resolvedData;
    }
}

/* ========== 云端同步管理器实例 ========== */

const authManager = new AuthManager();
const syncManager = new SyncManager(authManager);

/* ========== UI 管理器 ========== */

class SyncUIManager {
    constructor(authManager, syncManager) {
        this.authManager = authManager;
        this.syncManager = syncManager;
    }

    /**
     * 初始化UI
     */
    init() {
        this.updateSyncStatus();
        this.bindEvents();

        // 定时更新状态
        setInterval(() => {
            this.updateSyncStatus();
        }, 1000);
    }

    /**
     * 更新同步状态显示
     */
    updateSyncStatus() {
        const status = this.syncManager.getSyncStatus();
        const user = this.authManager.getCurrentUser();

        // 更新状态指示器
        const statusEl = document.getElementById('cloudSyncStatus');
        if (statusEl) {
            if (!this.authManager.getIsAuthenticated()) {
                statusEl.innerHTML = `
                    <span class="sync-icon">☁️</span>
                    <span class="sync-text">未登录</span>
                `;
                statusEl.className = 'cloud-sync-status offline';
            } else if (status.isSyncing) {
                statusEl.innerHTML = `
                    <span class="sync-icon animate-spin">🔄</span>
                    <span class="sync-text">同步中...</span>
                `;
                statusEl.className = 'cloud-sync-status syncing';
            } else if (!status.isOnline) {
                statusEl.innerHTML = `
                    <span class="sync-icon">📡</span>
                    <span class="sync-text">离线模式</span>
                `;
                statusEl.className = 'cloud-sync-status offline';
            } else {
                const lastSync = status.lastSyncTime
                    ? this.formatTime(status.lastSyncTime)
                    : '从未同步';
                statusEl.innerHTML = `
                    <span class="sync-icon">☁️</span>
                    <span class="sync-text">已同步</span>
                    <span class="sync-time">${lastSync}</span>
                `;
                statusEl.className = 'cloud-sync-status online';
            }
        }

        // 更新用户信息
        const userEl = document.getElementById('cloudUserName');
        if (userEl) {
            userEl.textContent = user ? user.username : '未登录';
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 登录按钮
        const btnLogin = document.getElementById('btnCloudLogin');
        if (btnLogin) {
            btnLogin.addEventListener('click', () => this.showLoginDialog());
        }

        // 注册按钮
        const btnRegister = document.getElementById('btnCloudRegister');
        if (btnRegister) {
            btnRegister.addEventListener('click', () => this.showRegisterDialog());
        }

        // 登出按钮
        const btnLogout = document.getElementById('btnCloudLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => this.logout());
        }

        // 同步按钮
        const btnSync = document.getElementById('btnCloudSync');
        if (btnSync) {
            btnSync.addEventListener('click', () => this.syncToCloud());
        }

        // 恢复按钮
        const btnRestore = document.getElementById('btnCloudRestore');
        if (btnRestore) {
            btnRestore.addEventListener('click', () => this.restoreFromCloud());
        }
    }

    /**
     * 显示登录对话框
     */
    showLoginDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'cloud-dialog-overlay';
        dialog.innerHTML = `
            <div class="cloud-dialog">
                <div class="cloud-dialog-header">
                    <h3><i class="fa-solid fa-right-to-bracket"></i> 登录</h3>
                    <button class="cloud-dialog-close"><i class="fa-solid fa-times"></i></button>
                </div>
                <div class="cloud-dialog-body">
                    <div class="cloud-form-group">
                        <label>用户名</label>
                        <input type="text" id="loginUsername" placeholder="请输入用户名">
                    </div>
                    <div class="cloud-form-group">
                        <label>密码</label>
                        <input type="password" id="loginPassword" placeholder="请输入密码">
                    </div>
                    <div class="cloud-form-error" id="loginError"></div>
                </div>
                <div class="cloud-dialog-footer">
                    <button class="btn-secondary" id="btnShowRegister">注册账号</button>
                    <button class="btn-primary" id="btnDoLogin"><i class="fa-solid fa-right-to-bracket"></i> 登录</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // 绑定事件
        const closeBtn = dialog.querySelector('.cloud-dialog-close');
        closeBtn.addEventListener('click', () => dialog.remove());

        const registerBtn = dialog.querySelector('#btnShowRegister');
        registerBtn.addEventListener('click', () => {
            dialog.remove();
            this.showRegisterDialog();
        });

        const loginBtn = dialog.querySelector('#btnDoLogin');
        loginBtn.addEventListener('click', async () => {
            const username = dialog.querySelector('#loginUsername').value.trim();
            const password = dialog.querySelector('#loginPassword').value;
            const errorEl = dialog.querySelector('#loginError');

            if (!username || !password) {
                errorEl.textContent = '请输入用户名和密码';
                return;
            }

            try {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> 登录中...';

                await this.authManager.login(username, password);
                dialog.remove();
                this.syncManager.startAutoSync();
                this.updateSyncStatus();
                showToast('登录成功', 2000);

                // 自动同步
                await this.syncManager.syncToCloud();

            } catch (err) {
                errorEl.textContent = err.message;
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> 登录';
            }
        });

        // 点击遮罩关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    /**
     * 显示注册对话框
     */
    showRegisterDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'cloud-dialog-overlay';
        dialog.innerHTML = `
            <div class="cloud-dialog">
                <div class="cloud-dialog-header">
                    <h3><i class="fa-solid fa-user-plus"></i> 注册</h3>
                    <button class="cloud-dialog-close"><i class="fa-solid fa-times"></i></button>
                </div>
                <div class="cloud-dialog-body">
                    <div class="cloud-form-group">
                        <label>用户名</label>
                        <input type="text" id="registerUsername" placeholder="请输入用户名">
                    </div>
                    <div class="cloud-form-group">
                        <label>邮箱</label>
                        <input type="email" id="registerEmail" placeholder="请输入邮箱">
                    </div>
                    <div class="cloud-form-group">
                        <label>密码</label>
                        <input type="password" id="registerPassword" placeholder="请输入密码">
                    </div>
                    <div class="cloud-form-group">
                        <label>确认密码</label>
                        <input type="password" id="registerConfirm" placeholder="请再次输入密码">
                    </div>
                    <div class="cloud-form-error" id="registerError"></div>
                </div>
                <div class="cloud-dialog-footer">
                    <button class="btn-secondary" id="btnShowLogin">返回登录</button>
                    <button class="btn-primary" id="btnDoRegister"><i class="fa-solid fa-user-plus"></i> 注册</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // 绑定事件
        const closeBtn = dialog.querySelector('.cloud-dialog-close');
        closeBtn.addEventListener('click', () => dialog.remove());

        const loginBtn = dialog.querySelector('#btnShowLogin');
        loginBtn.addEventListener('click', () => {
            dialog.remove();
            this.showLoginDialog();
        });

        const registerBtn = dialog.querySelector('#btnDoRegister');
        registerBtn.addEventListener('click', async () => {
            const username = dialog.querySelector('#registerUsername').value.trim();
            const email = dialog.querySelector('#registerEmail').value.trim();
            const password = dialog.querySelector('#registerPassword').value;
            const confirm = dialog.querySelector('#registerConfirm').value;
            const errorEl = dialog.querySelector('#registerError');

            if (!username || !email || !password) {
                errorEl.textContent = '请填写所有字段';
                return;
            }

            if (password !== confirm) {
                errorEl.textContent = '两次密码不一致';
                return;
            }

            if (password.length < 6) {
                errorEl.textContent = '密码至少6位';
                return;
            }

            try {
                registerBtn.disabled = true;
                registerBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> 注册中...';

                await this.authManager.register(username, email, password);
                dialog.remove();
                this.syncManager.startAutoSync();
                this.updateSyncStatus();
                showToast('注册成功', 2000);

            } catch (err) {
                errorEl.textContent = err.message;
            } finally {
                registerBtn.disabled = false;
                registerBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> 注册';
            }
        });

        // 点击遮罩关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    /**
     * 登出
     */
    logout() {
        if (confirm('确定要登出吗？登出后将停止自动同步。')) {
            this.authManager.logout();
            this.syncManager.stopAutoSync();
            this.updateSyncStatus();
            showToast('已登出', 1500);
        }
    }

    /**
     * 同步到云端
     */
    async syncToCloud() {
        if (!this.authManager.getIsAuthenticated()) {
            showToast('请先登录', 1500);
            return;
        }

        await this.syncManager.syncToCloud();
        this.updateSyncStatus();
    }

    /**
     * 从云端恢复
     */
    async restoreFromCloud() {
        if (!this.authManager.getIsAuthenticated()) {
            showToast('请先登录', 1500);
            return;
        }

        if (confirm('确定要从云端恢复数据吗？这将覆盖本地数据。')) {
            try {
                await this.syncManager.restoreFromCloud();
                this.updateSyncStatus();
            } catch (err) {
                showToast('恢复失败: ' + err.message, 2000);
            }
        }
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) {
            return Math.floor(diff / 3600000) + '小时前';
        } else {
            return Math.floor(diff / 86400000) + '天前';
        }
    }
}

/* ========== 初始化函数 ========== */

const syncUIManager = new SyncUIManager(authManager, syncManager);

/**
 * 初始化云端同步模块
 */
function initCloudSync() {
    authManager.init();
    syncManager.init();
    syncUIManager.init();
    console.log('云端同步模块初始化完成');
}

/* ========== 导出 ========== */
export {
    initCloudSync,
    authManager,
    syncManager,
    syncUIManager,
    AuthManager,
    SyncManager,
    ConflictResolver,
};
