/**
 * 乾坤易道 - 用户偏好设置模块
 * @module settings
 * @description 管理用户偏好设置，包括主题、AI配置、模块管理、交互设置等
 */

import { showToast } from './utils.js?v=20260624-1';

/* ========== 默认设置 ========== */

const DEFAULT_SETTINGS = {
    // 主题设置
    theme: {
        mode: 'dark',           // 'dark' | 'light'
        primaryColor: 'gold',   // 'gold' | 'red' | 'green' | 'blue'
        fontSize: 'medium',     // 'small' | 'medium' | 'large' | 'xlarge'
    },

    // AI 配置
    ai: {
        model: 'gemini',        // 'gemini' | 'local'
        apiKey: '',
        proxyUrl: '',
        autoSaveKey: false,
    },

    // 模块管理
    modules: {
        dashboard: { visible: true, order: 0 },
        bazi: { visible: true, order: 1 },
        liuyao: { visible: true, order: 2 },
        huangli: { visible: true, order: 3 },
        fengshui: { visible: true, order: 4 },
        chat: { visible: true, order: 5 },
        xingming: { visible: true, order: 6 },
        meihua: { visible: true, order: 7 },
        hehun: { visible: true, order: 8 },
        ziwei: { visible: true, order: 9 },
        hepan: { visible: true, order: 10 },
        shuzi: { visible: true, order: 11 },
        qimen: { visible: true, order: 12 },
    },

    // 交互设置
    interaction: {
        soundEnabled: true,
        vibrationEnabled: true,
        gestureEnabled: true,
        autoSave: true,
        showAnimations: true,
    },

    // 通知设置
    notifications: {
        showTips: true,
        showHistory: true,
    },
};

/* ========== 设置管理类 ========== */

class SettingsManager {
    constructor() {
        this.settings = null;
        this.listeners = [];
        this.STORAGE_KEY = 'qky_user_settings';
    }

    /**
     * 初始化设置管理器
     */
    init() {
        this.loadSettings();
        this.applySettings();
        this.setupSettingsPanel();
        console.log('设置管理器初始化完成');
    }

    /**
     * 从 localStorage 加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // 合并默认设置（处理新增字段）
                this.settings = this.mergeSettings(DEFAULT_SETTINGS, parsed);
            } else {
                this.settings = { ...DEFAULT_SETTINGS };
            }
        } catch (err) {
            console.error('加载设置失败:', err);
            this.settings = { ...DEFAULT_SETTINGS };
        }
    }

    /**
     * 深度合并设置对象
     */
    mergeSettings(defaults, saved) {
        const result = { ...defaults };
        for (const key in saved) {
            if (typeof saved[key] === 'object' && !Array.isArray(saved[key]) && saved[key] !== null) {
                result[key] = this.mergeSettings(defaults[key] || {}, saved[key]);
            } else {
                result[key] = saved[key];
            }
        }
        return result;
    }

    /**
     * 保存设置到 localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
            this.notifyListeners();
        } catch (err) {
            console.error('保存设置失败:', err);
        }
    }

    /**
     * 获取设置值
     */
    get(path) {
        const keys = path.split('.');
        let value = this.settings;
        for (const key of keys) {
            if (value && typeof value === 'object') {
                value = value[key];
            } else {
                return undefined;
            }
        }
        return value;
    }

    /**
     * 设置值
     */
    set(path, value) {
        const keys = path.split('.');
        let obj = this.settings;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        this.saveSettings();
        this.applySettings();
    }

    /**
     * 应用设置到 UI
     */
    applySettings() {
        // 应用主题
        this.applyTheme();

        // 应用字体大小
        this.applyFontSize();

        // 应用模块可见性
        this.applyModuleVisibility();
    }

    /**
     * 应用主题设置
     */
    applyTheme() {
        const mode = this.get('theme.mode');
        const primaryColor = this.get('theme.primaryColor');

        // 设置主题模式
        document.body.setAttribute('data-theme', mode);

        // 设置主色调
        const colorMap = {
            gold: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.3)' },
            red: { primary: '#C73E3A', glow: 'rgba(199,62,58,0.3)' },
            green: { primary: '#3B9C7A', glow: 'rgba(59,156,122,0.3)' },
            blue: { primary: '#4A90D9', glow: 'rgba(74,144,217,0.3)' },
        };

        const color = colorMap[primaryColor] || colorMap.gold;
        document.documentElement.style.setProperty('--gold-primary', color.primary);
        document.documentElement.style.setProperty('--gold-glow', color.glow);
    }

    /**
     * 应用字体大小
     */
    applyFontSize() {
        const fontSize = this.get('theme.fontSize');
        const sizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '20px',
        };
        document.documentElement.style.setProperty('--base-font-size', sizeMap[fontSize] || '16px');
    }

    /**
     * 应用模块可见性
     */
    applyModuleVisibility() {
        const modules = this.get('modules');
        if (!modules) return;

        for (const [moduleId, config] of Object.entries(modules)) {
            const panel = document.getElementById(`panel-${moduleId}`);
            const navItem = document.querySelector(`[data-target="${moduleId}"]`);

            if (panel) {
                panel.style.display = config.visible ? '' : 'none';
            }
            if (navItem) {
                navItem.style.display = config.visible ? '' : 'none';
            }
        }
    }

    /**
     * 添加设置变更监听器
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * 通知监听器
     */
    notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this.settings);
            } catch (err) {
                console.error('设置监听器错误:', err);
            }
        }
    }

    /**
     * 重置为默认设置
     */
    resetToDefault() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
        this.applySettings();
        showToast('设置已重置为默认值', 2000);
    }

    /**
     * 导出设置
     */
    exportSettings() {
        const data = {
            version: '1.0',
            app: '乾坤易道',
            type: 'settings',
            exportTime: new Date().toISOString(),
            settings: this.settings,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `乾坤易道设置_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('设置导出成功', 2000);
    }

    /**
     * 导入设置
     */
    async importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.type !== 'settings' || data.app !== '乾坤易道') {
                        reject(new Error('无效的设置文件'));
                        return;
                    }
                    this.settings = this.mergeSettings(DEFAULT_SETTINGS, data.settings);
                    this.saveSettings();
                    this.applySettings();
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * 设置设置面板
     */
    setupSettingsPanel() {
        // 如果设置面板不存在，动态创建
        if (!document.getElementById('settingsPanel')) {
            this.createSettingsPanel();
        }

        // 绑定设置按钮事件
        this.bindSettingsEvents();
    }

    /**
     * 创建设置面板 HTML
     */
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'settingsPanel';
        panel.className = 'settings-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="settings-overlay"></div>
            <div class="settings-drawer">
                <div class="settings-header">
                    <h2><i class="fa-solid fa-gear"></i> 偏好设置</h2>
                    <button class="btn-close-settings" title="关闭设置">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>

                <div class="settings-body">
                    <!-- 主题设置 -->
                    <div class="settings-section">
                        <h3><i class="fa-solid fa-palette"></i> 主题设置</h3>
                        <div class="setting-item">
                            <label>主题模式</label>
                            <div class="setting-control">
                                <select id="settingThemeMode">
                                    <option value="dark">暗色主题</option>
                                    <option value="light">亮色主题</option>
                                </select>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>主色调</label>
                            <div class="setting-control color-options">
                                <button class="color-btn active" data-color="gold" style="background:#D4AF37;" title="金色"></button>
                                <button class="color-btn" data-color="red" style="background:#C73E3A;" title="朱红"></button>
                                <button class="color-btn" data-color="green" style="background:#3B9C7A;" title="翡翠绿"></button>
                                <button class="color-btn" data-color="blue" style="background:#4A90D9;" title="天蓝"></button>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>字体大小</label>
                            <div class="setting-control">
                                <select id="settingFontSize">
                                    <option value="small">小 (14px)</option>
                                    <option value="medium">中 (16px)</option>
                                    <option value="large">大 (18px)</option>
                                    <option value="xlarge">特大 (20px)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- AI 配置 -->
                    <div class="settings-section">
                        <h3><i class="fa-solid fa-robot"></i> AI 配置</h3>
                        <div class="setting-item">
                            <label>AI 模型</label>
                            <div class="setting-control">
                                <select id="settingAiModel">
                                    <option value="gemini">Gemini (云端)</option>
                                    <option value="local">本地模型</option>
                                </select>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>Gemini API Key</label>
                            <div class="setting-control">
                                <input type="password" id="settingApiKey" placeholder="输入 API Key">
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>自动保存 Key</label>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="settingAutoSaveKey">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- 模块管理 -->
                    <div class="settings-section">
                        <h3><i class="fa-solid fa-puzzle-piece"></i> 模块管理</h3>
                        <p class="setting-hint">选择要在导航中显示的功能模块</p>
                        <div class="module-list" id="moduleList">
                            <!-- 模块列表将动态生成 -->
                        </div>
                    </div>

                    <!-- 交互设置 -->
                    <div class="settings-section">
                        <h3><i class="fa-solid fa-hand-pointer"></i> 交互设置</h3>
                        <div class="setting-item">
                            <label>音效</label>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="settingSoundEnabled">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>震动反馈</label>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="settingVibrationEnabled">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>手势操作</label>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="settingGestureEnabled">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>显示动画</label>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="settingShowAnimations">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- 数据管理 -->
                    <div class="settings-section">
                        <h3><i class="fa-solid fa-database"></i> 数据管理</h3>
                        <div class="setting-actions">
                            <button class="btn-setting-action" id="btnExportSettings">
                                <i class="fa-solid fa-download"></i> 导出设置
                            </button>
                            <button class="btn-setting-action" id="btnImportSettings">
                                <i class="fa-solid fa-upload"></i> 导入设置
                            </button>
                            <input type="file" id="importSettingsFile" accept=".json" style="display:none;">
                            <button class="btn-setting-action btn-danger" id="btnResetSettings">
                                <i class="fa-solid fa-rotate-left"></i> 重置默认
                            </button>
                            <button class="btn-setting-action" id="btnResetGuide">
                                <i class="fa-solid fa-book-open"></i> 重新引导
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    /**
     * 绑定设置事件
     */
    bindSettingsEvents() {
        // 关闭按钮
        const btnClose = document.querySelector('.btn-close-settings');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeSettings());
        }

        // 点击遮罩关闭
        const overlay = document.querySelector('.settings-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeSettings());
        }

        // 主题模式
        const themeMode = document.getElementById('settingThemeMode');
        if (themeMode) {
            themeMode.value = this.get('theme.mode');
            themeMode.addEventListener('change', (e) => {
                this.set('theme.mode', e.target.value);
            });
        }

        // 主色调
        document.querySelectorAll('.color-btn').forEach(btn => {
            if (btn.dataset.color === this.get('theme.primaryColor')) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.set('theme.primaryColor', btn.dataset.color);
            });
        });

        // 字体大小
        const fontSize = document.getElementById('settingFontSize');
        if (fontSize) {
            fontSize.value = this.get('theme.fontSize');
            fontSize.addEventListener('change', (e) => {
                this.set('theme.fontSize', e.target.value);
            });
        }

        // AI 模型
        const aiModel = document.getElementById('settingAiModel');
        if (aiModel) {
            aiModel.value = this.get('ai.model');
            aiModel.addEventListener('change', (e) => {
                this.set('ai.model', e.target.value);
            });
        }

        // API Key
        const apiKey = document.getElementById('settingApiKey');
        if (apiKey) {
            apiKey.value = this.get('ai.apiKey');
            apiKey.addEventListener('change', (e) => {
                this.set('ai.apiKey', e.target.value);
            });
        }

        // 自动保存 Key
        const autoSaveKey = document.getElementById('settingAutoSaveKey');
        if (autoSaveKey) {
            autoSaveKey.checked = this.get('ai.autoSaveKey');
            autoSaveKey.addEventListener('change', (e) => {
                this.set('ai.autoSaveKey', e.target.checked);
            });
        }

        // 交互开关
        ['SoundEnabled', 'VibrationEnabled', 'GestureEnabled', 'ShowAnimations'].forEach(key => {
            const el = document.getElementById(`setting${key}`);
            if (el) {
                const settingKey = key.charAt(0).toLowerCase() + key.slice(1);
                el.checked = this.get(`interaction.${settingKey}`);
                el.addEventListener('change', (e) => {
                    this.set(`interaction.${settingKey}`, e.target.checked);
                });
            }
        });

        // 数据管理按钮
        const btnExport = document.getElementById('btnExportSettings');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportSettings());
        }

        const btnImport = document.getElementById('btnImportSettings');
        const importFile = document.getElementById('importSettingsFile');
        if (btnImport && importFile) {
            btnImport.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    await this.importSettings(file);
                    showToast('设置导入成功', 2000);
                    this.refreshSettingsPanel();
                } catch (err) {
                    showToast('设置导入失败: ' + err.message, 2000);
                }
                importFile.value = '';
            });
        }

        const btnReset = document.getElementById('btnResetSettings');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (confirm('确定要重置所有设置为默认值吗？')) {
                    this.resetToDefault();
                    this.refreshSettingsPanel();
                }
            });
        }

        // 重置引导按钮
        const btnResetGuide = document.getElementById('btnResetGuide');
        if (btnResetGuide) {
            btnResetGuide.addEventListener('click', () => {
                if (confirm('确定要重新开始新手引导吗？\n\n刷新页面后将重新显示引导。')) {
                    localStorage.removeItem('qky_guide_completed');
                    showToast('引导已重置，刷新页面后将重新开始', 2000);
                }
            });
        }

        // 生成模块列表
        this.generateModuleList();
    }

    /**
     * 生成模块列表
     */
    generateModuleList() {
        const container = document.getElementById('moduleList');
        if (!container) return;

        const moduleNames = {
            dashboard: '太极乾坤',
            bazi: '天星排盘',
            liuyao: '六爻占卜',
            huangli: '万年择吉',
            fengshui: '理气布局',
            chat: '乾坤问卜',
            xingming: '姓名五格',
            meihua: '梅花易数',
            hehun: '合婚匹配',
            ziwei: '紫微斗数',
            hepan: '八字合盘',
            shuzi: '数字能量',
            qimen: '奇门遁甲',
        };

        container.innerHTML = '';
        for (const [id, name] of Object.entries(moduleNames)) {
            const visible = this.get(`modules.${id}.visible`);
            const item = document.createElement('div');
            item.className = 'module-item';
            item.innerHTML = `
                <label class="toggle-switch">
                    <input type="checkbox" data-module="${id}" ${visible ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
                <span class="module-name">${name}</span>
            `;

            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                this.set(`modules.${id}.visible`, e.target.checked);
            });

            container.appendChild(item);
        }
    }

    /**
     * 刷新设置面板
     */
    refreshSettingsPanel() {
        // 重新加载所有设置值
        const themeMode = document.getElementById('settingThemeMode');
        if (themeMode) themeMode.value = this.get('theme.mode');

        const fontSize = document.getElementById('settingFontSize');
        if (fontSize) fontSize.value = this.get('theme.fontSize');

        const aiModel = document.getElementById('settingAiModel');
        if (aiModel) aiModel.value = this.get('ai.model');

        const apiKey = document.getElementById('settingApiKey');
        if (apiKey) apiKey.value = this.get('ai.apiKey');

        const autoSaveKey = document.getElementById('settingAutoSaveKey');
        if (autoSaveKey) autoSaveKey.checked = this.get('ai.autoSaveKey');

        // 刷新开关
        ['soundEnabled', 'vibrationEnabled', 'gestureEnabled', 'showAnimations'].forEach(key => {
            const el = document.getElementById(`setting${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (el) el.checked = this.get(`interaction.${key}`);
        });

        // 刷新主色调
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.get('theme.primaryColor'));
        });

        // 刷新模块列表
        this.generateModuleList();
    }

    /**
     * 打开设置面板
     */
    openSettings() {
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            panel.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.refreshSettingsPanel();
        }
    }

    /**
     * 关闭设置面板
     */
    closeSettings() {
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            panel.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

/* ========== 设置面板 CSS ========== */

const settingsCSS = `
/* 设置面板 */
.settings-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    justify-content: flex-end;
}

.settings-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.settings-drawer {
    position: relative;
    width: 360px;
    max-width: 90vw;
    height: 100%;
    background: #14141A;
    border-left: 1px solid rgba(212, 175, 55, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(212, 175, 55, 0.1);
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.settings-header h2 {
    font-size: 1.1rem;
    color: #D4AF37;
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-close-settings {
    background: transparent;
    border: none;
    color: #A2A2AC;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.btn-close-settings:hover {
    background: rgba(212, 175, 55, 0.2);
    color: #D4AF37;
}

.settings-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
}

/* 设置分组 */
.settings-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.settings-section:last-child {
    border-bottom: none;
}

.settings-section h3 {
    font-size: 0.95rem;
    color: #D4AF37;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.settings-section h3 i {
    font-size: 1rem;
}

.setting-hint {
    font-size: 0.75rem;
    color: #A2A2AC;
    margin-bottom: 12px;
}

/* 设置项 */
.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
}

.setting-item label {
    font-size: 0.85rem;
    color: #F5F0E8;
}

.setting-control {
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-control select,
.setting-control input[type="text"],
.setting-control input[type="password"] {
    background: rgba(10, 10, 12, 0.8);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 6px;
    color: #F5F0E8;
    font-size: 0.82rem;
    padding: 6px 10px;
    min-width: 140px;
}

.setting-control select:focus,
.setting-control input:focus {
    outline: none;
    border-color: #D4AF37;
    box-shadow: 0 0 5px rgba(212, 175, 55, 0.3);
}

/* 颜色选择按钮 */
.color-options {
    display: flex;
    gap: 8px;
}

.color-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.color-btn:hover {
    transform: scale(1.1);
}

.color-btn.active {
    border-color: #F5F0E8;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
}

/* 开关样式 */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(10, 10, 12, 0.8);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 24px;
    transition: 0.3s;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: #A2A2AC;
    border-radius: 50%;
    transition: 0.3s;
}

input:checked + .toggle-slider {
    background-color: rgba(212, 175, 55, 0.3);
    border-color: #D4AF37;
}

input:checked + .toggle-slider:before {
    transform: translateX(20px);
    background-color: #D4AF37;
}

/* 模块列表 */
.module-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.module-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(10, 10, 12, 0.4);
    border: 1px solid rgba(212, 175, 55, 0.1);
    border-radius: 6px;
    transition: all 0.2s ease;
}

.module-item:hover {
    background: rgba(212, 175, 55, 0.05);
    border-color: rgba(212, 175, 55, 0.2);
}

.module-name {
    font-size: 0.85rem;
    color: #F5F0E8;
}

/* 操作按钮 */
.setting-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.btn-setting-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 6px;
    color: #D4AF37;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-setting-action:hover {
    background: rgba(212, 175, 55, 0.2);
    border-color: rgba(212, 175, 55, 0.5);
}

.btn-setting-action.btn-danger {
    background: rgba(199, 62, 58, 0.1);
    border-color: rgba(199, 62, 58, 0.3);
    color: #e86b6b;
}

.btn-setting-action.btn-danger:hover {
    background: rgba(199, 62, 58, 0.2);
    border-color: rgba(199, 62, 58, 0.5);
}

/* 响应式 */
@media (max-width: 480px) {
    .settings-drawer {
        width: 100%;
        max-width: 100%;
    }

    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .setting-control {
        width: 100%;
    }

    .setting-control select,
    .setting-control input[type="text"],
    .setting-control input[type="password"] {
        width: 100%;
    }
}
`;

/* ========== 注入 CSS ========== */

function injectSettingsCSS() {
    const style = document.createElement('style');
    style.textContent = settingsCSS;
    document.head.appendChild(style);
}

/* ========== 初始化函数 ========== */

const settingsManager = new SettingsManager();

function initSettings() {
    injectSettingsCSS();
    settingsManager.init();
}

function openSettings() {
    settingsManager.openSettings();
}

function closeSettings() {
    settingsManager.closeSettings();
}

/* ========== 导出 ========== */
export {
    initSettings,
    openSettings,
    closeSettings,
    settingsManager,
    SettingsManager,
};
