/**
 * 乾坤易道 - 数据导出模块
 * @module export
 * @description 提供 PDF 导出、JSON 备份、分享链接等数据导出功能
 */

/* ========== PDF 导出 ========== */

/**
 * 初始化 PDF 导出功能
 */
function initPDFExport() {
    if (!window.jspdf) {
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script1.onload = () => console.log('jsPDF 加载完成');
        document.head.appendChild(script1);
    }
    if (!window.html2canvas) {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script2.onload = () => console.log('html2canvas 加载完成');
        document.head.appendChild(script2);
    }
}

/**
 * 将 HTML 元素导出为 PDF
 */
async function exportToPDF(elementId, options = {}) {
    const {
        filename = '命理分析.pdf',
        title = '乾坤易道 · 命理分析报告',
        subtitle = '',
        watermark = '乾坤易道',
        format = 'a4',
        orientation = 'portrait',
        quality = 2,
    } = options;

    if (!window.jspdf || !window.html2canvas) {
        showToast('PDF 库正在加载，请稍后再试...', 2000);
        initPDFExport();
        return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        showToast('未找到要导出的内容', 2000);
        return;
    }

    showToast('正在生成 PDF，请稍候...', 3000);

    try {
        const canvas = await html2canvas(element, {
            scale: quality,
            useCORS: true,
            logging: false,
            backgroundColor: '#0A0A0C',
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF(orientation, 'mm', format);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // 添加封面
        pdf.setFillColor(10, 10, 12);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        pdf.setTextColor(230, 194, 128);
        pdf.setFontSize(28);
        pdf.text(title, pdfWidth / 2, 60, { align: 'center' });

        if (subtitle) {
            pdf.setTextColor(162, 162, 172);
            pdf.setFontSize(14);
            pdf.text(subtitle, pdfWidth / 2, 80, { align: 'center' });
        }

        pdf.setDrawColor(212, 175, 55);
        pdf.setLineWidth(0.5);
        pdf.line(50, 90, pdfWidth - 50, 90);

        pdf.setTextColor(162, 162, 172);
        pdf.setFontSize(12);
        const now = new Date();
        pdf.text(`生成日期：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`, pdfWidth / 2, 110, { align: 'center' });

        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(10);
        pdf.text('乾坤易道 · 周易数理命理智能分析系统', pdfWidth / 2, pdfHeight - 20, { align: 'center' });

        // 添加内容页
        pdf.addPage();
        const imgData = canvas.toDataURL('image/png');
        const ratio = Math.min(pdfWidth / canvas.width, (pdfHeight - 20) / canvas.height);
        pdf.addImage(imgData, 'PNG', (pdfWidth - canvas.width * ratio) / 2, 10, canvas.width * ratio, canvas.height * ratio);

        // 添加水印
        if (watermark) {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 2; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setTextColor(200, 200, 200);
                pdf.setFontSize(50);
                pdf.text(watermark, pdfWidth / 2, pdfHeight / 2, { align: 'center', angle: 45 });
            }
        }

        pdf.save(filename);
        showToast('PDF 导出成功！', 2000);
    } catch (err) {
        console.error('PDF 导出失败:', err);
        showToast('PDF 导出失败，请重试', 2000);
    }
}

/* ========== JSON 备份 ========== */

/**
 * 导出所有数据为 JSON 文件
 */
function exportToJSON(options = {}) {
    const {
        includeHistory = true,
        includeSettings = true,
        includeApiKey = false,
    } = options;

    try {
        const data = {
            version: '5.0',
            app: '乾坤易道',
            exportTime: new Date().toISOString(),
            modules: {}
        };

        const baziInput = localStorage.getItem('bazi_input_cache');
        if (baziInput) {
            data.modules.bazi = { input: JSON.parse(baziInput) };
        }

        if (includeHistory) {
            const globalHistory = localStorage.getItem('qky_global_history_v1');
            if (globalHistory) {
                data.modules.history = JSON.parse(globalHistory);
            }
        }

        if (includeSettings) {
            data.modules.settings = {
                theme: localStorage.getItem('theme') || 'dark',
                navCollapsed: localStorage.getItem('nav_collapsed') === 'true',
            };
        }

        if (includeApiKey) {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (apiKey) {
                data.modules.apiKey = btoa(apiKey);
            }
        }

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `乾坤易道备份_${formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('数据备份成功！', 2000);
    } catch (err) {
        console.error('JSON 导出失败:', err);
        showToast('数据备份失败，请重试', 2000);
    }
}

/**
 * 从 JSON 文件导入数据
 */
async function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.app !== '乾坤易道') {
                    reject({ success: false, message: '无效的备份文件' });
                    return;
                }

                if (data.modules.bazi?.input) {
                    localStorage.setItem('bazi_input_cache', JSON.stringify(data.modules.bazi.input));
                }
                if (data.modules.history) {
                    localStorage.setItem('qky_global_history_v1', JSON.stringify(data.modules.history));
                }
                if (data.modules.settings) {
                    if (data.modules.settings.theme) {
                        localStorage.setItem('theme', data.modules.settings.theme);
                    }
                    if (data.modules.settings.navCollapsed !== undefined) {
                        localStorage.setItem('nav_collapsed', String(data.modules.settings.navCollapsed));
                    }
                }
                if (data.modules.apiKey) {
                    const apiKey = atob(data.modules.apiKey);
                    localStorage.setItem('gemini_api_key', apiKey);
                }

                resolve({ success: true, message: '数据恢复成功！页面将自动刷新。' });
            } catch (err) {
                console.error('JSON 解析失败:', err);
                reject({ success: false, message: '备份文件格式错误' });
            }
        };
        reader.onerror = () => reject({ success: false, message: '文件读取失败' });
        reader.readAsText(file);
    });
}

/* ========== 分享链接 ========== */

/**
 * 生成分享链接
 */
function generateShareLink(data, type, options = {}) {
    const { expiresIn = 7 * 24 * 60 * 60 * 1000 } = options;
    try {
        const shareData = {
            type: type,
            data: data,
            expires: Date.now() + expiresIn,
            created: Date.now(),
        };
        const jsonStr = JSON.stringify(shareData);
        const encoded = btoa(encodeURIComponent(jsonStr));
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?share=${encoded}`;
    } catch (err) {
        console.error('生成分享链接失败:', err);
        return null;
    }
}

/**
 * 解析分享链接
 */
function parseShareLink(url) {
    try {
        const urlObj = new URL(url);
        const encoded = urlObj.searchParams.get('share');
        if (!encoded) return null;
        const jsonStr = decodeURIComponent(atob(encoded));
        const shareData = JSON.parse(jsonStr);
        if (shareData.expires < Date.now()) {
            console.warn('分享链接已过期');
            return null;
        }
        return shareData;
    } catch (err) {
        console.error('解析分享链接失败:', err);
        return null;
    }
}

/* ========== 工具函数 ========== */

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
}

function showToast(message, duration = 2000) {
    if (window.showToast) {
        window.showToast(message, duration);
        return;
    }
    const toast = document.getElementById('copyToast') || (() => {
        const t = document.createElement('div');
        t.id = 'copyToast';
        t.className = 'toast-notification';
        document.body.appendChild(t);
        return t;
    })();
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

function createExportButtons(elementId, title) {
    const container = document.createElement('div');
    container.className = 'export-btn-group';
    container.style.cssText = 'display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;';

    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'btn-secondary export-btn';
    pdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> 导出 PDF';
    pdfBtn.addEventListener('click', () => {
        exportToPDF(elementId, {
            filename: `${title}_${formatDate(new Date())}.pdf`,
            title: `乾坤易道 · ${title}`,
        });
    });

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-secondary export-btn';
    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> 复制';
    copyBtn.addEventListener('click', () => {
        const element = document.getElementById(elementId);
        if (element) {
            navigator.clipboard.writeText(element.innerText).then(() => {
                showToast('已复制到剪贴板', 1500);
            });
        }
    });

    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn-secondary export-btn';
    shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> 分享';
    shareBtn.addEventListener('click', () => {
        showToast('分享功能开发中...', 1500);
    });

    container.appendChild(pdfBtn);
    container.appendChild(copyBtn);
    container.appendChild(shareBtn);
    return container;
}

function addExportToModule(module, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let btnContainer = element.parentElement.querySelector('.export-btn-group');
    if (!btnContainer) {
        const titles = {
            'bazi': '八字命盘分析',
            'liuyao': '六爻占卜',
            'ziwei': '紫微斗数',
            'shuzi': '数字能量',
            'hehun': '八字合婚',
            'hepan': '八字合盘',
        };
        btnContainer = createExportButtons(elementId, titles[module] || '命理分析');
        element.parentElement.appendChild(btnContainer);
    }
}

/* ========== 选择性导出 ========== */

function showSelectiveExportDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'export-dialog-overlay';
        dialog.innerHTML = `
            <div class="export-dialog">
                <div class="export-dialog-header">
                    <h3><i class="fa-solid fa-database"></i> 选择性导出</h3>
                    <button class="export-dialog-close"><i class="fa-solid fa-times"></i></button>
                </div>
                <div class="export-dialog-body">
                    <p class="export-dialog-desc">选择要导出的数据模块：</p>
                    <div class="export-checkbox-group">
                        <label class="export-checkbox-item">
                            <input type="checkbox" name="export-bazi" checked>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">八字数据</span>
                        </label>
                        <label class="export-checkbox-item">
                            <input type="checkbox" name="export-history" checked>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">历史记录</span>
                        </label>
                        <label class="export-checkbox-item">
                            <input type="checkbox" name="export-settings" checked>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">用户设置</span>
                        </label>
                        <label class="export-checkbox-item">
                            <input type="checkbox" name="export-apikey">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">API Key（已加密）</span>
                        </label>
                    </div>
                    <div class="export-encrypt-option">
                        <label class="export-checkbox-item">
                            <input type="checkbox" name="export-encrypt">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">加密备份（需要密码恢复）</span>
                        </label>
                    </div>
                </div>
                <div class="export-dialog-footer">
                    <button class="btn-secondary export-dialog-cancel">取消</button>
                    <button class="btn-primary export-dialog-confirm"><i class="fa-solid fa-download"></i> 导出</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const closeBtn = dialog.querySelector('.export-dialog-close');
        const cancelBtn = dialog.querySelector('.export-dialog-cancel');
        const confirmBtn = dialog.querySelector('.export-dialog-confirm');

        const closeDialog = () => dialog.remove();

        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);

        confirmBtn.addEventListener('click', () => {
            const options = {
                includeBazi: dialog.querySelector('[name="export-bazi"]').checked,
                includeHistory: dialog.querySelector('[name="export-history"]').checked,
                includeSettings: dialog.querySelector('[name="export-settings"]').checked,
                includeApiKey: dialog.querySelector('[name="export-apikey"]').checked,
                encrypt: dialog.querySelector('[name="export-encrypt"]').checked,
            };
            closeDialog();
            resolve(options);
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
                resolve(null);
            }
        });
    });
}

async function executeSelectiveExport(options) {
    if (!options) return;

    try {
        const data = {
            version: '5.0',
            app: '乾坤易道',
            exportTime: new Date().toISOString(),
            encrypted: options.encrypt,
            modules: {}
        };

        if (options.includeBazi) {
            const baziInput = localStorage.getItem('bazi_input_cache');
            if (baziInput) {
                data.modules.bazi = { input: JSON.parse(baziInput) };
            }
        }

        if (options.includeHistory) {
            const globalHistory = localStorage.getItem('qky_global_history_v1');
            if (globalHistory) {
                data.modules.history = JSON.parse(globalHistory);
            }
        }

        if (options.includeSettings) {
            data.modules.settings = {
                theme: localStorage.getItem('theme') || 'dark',
                navCollapsed: localStorage.getItem('nav_collapsed') === 'true',
            };
        }

        if (options.includeApiKey) {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (apiKey) {
                data.modules.apiKey = btoa(apiKey);
            }
        }

        if (options.encrypt) {
            const password = prompt('请输入备份密码：');
            if (!password) {
                showToast('备份已取消', 1500);
                return;
            }
            data.passwordHash = btoa(password);
        }

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `乾坤易道备份_${formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('数据备份成功！', 2000);
    } catch (err) {
        console.error('选择性导出失败:', err);
        showToast('数据备份失败，请重试', 2000);
    }
}

/* ========== 自动备份提醒 ========== */

function setupAutoBackup(intervalDays = 7) {
    const LAST_BACKUP_KEY = 'qky_last_backup_time';
    const BACKUP_INTERVAL = intervalDays * 24 * 60 * 60 * 1000;

    function checkBackupReminder() {
        const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
        const now = Date.now();
        if (!lastBackup || (now - parseInt(lastBackup)) > BACKUP_INTERVAL) {
            showBackupReminder();
        }
    }

    function showBackupReminder() {
        const reminder = document.createElement('div');
        reminder.className = 'backup-reminder';
        reminder.innerHTML = `
            <div class="backup-reminder-content">
                <div class="backup-reminder-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <div class="backup-reminder-text">
                    <p class="backup-reminder-title">数据备份提醒</p>
                    <p class="backup-reminder-desc">已超过 ${intervalDays} 天未备份数据，建议备份以防数据丢失。</p>
                </div>
                <div class="backup-reminder-actions">
                    <button class="btn-secondary backup-reminder-later">稍后提醒</button>
                    <button class="btn-primary backup-reminder-now"><i class="fa-solid fa-download"></i> 立即备份</button>
                </div>
                <button class="backup-reminder-close"><i class="fa-solid fa-times"></i></button>
            </div>
        `;

        document.body.appendChild(reminder);

        const closeReminder = () => reminder.remove();

        reminder.querySelector('.backup-reminder-close').addEventListener('click', closeReminder);

        reminder.querySelector('.backup-reminder-later').addEventListener('click', () => {
            localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
            closeReminder();
        });

        reminder.querySelector('.backup-reminder-now').addEventListener('click', async () => {
            closeReminder();
            const options = await showSelectiveExportDialog();
            if (options) {
                await executeSelectiveExport(options);
                localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
            }
        });
    }

    setTimeout(checkBackupReminder, 3000);
}

/* ========== 导出样式 ========== */

const exportDialogCSS = `
.export-dialog-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
}
.export-dialog {
    background: #14141A; border: 1px solid rgba(212, 175, 55, 0.5);
    border-radius: 12px; width: 90%; max-width: 450px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.export-dialog-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 20px; border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}
.export-dialog-header h3 {
    font-size: 1rem; color: #D4AF37; margin: 0;
    display: flex; align-items: center; gap: 8px;
}
.export-dialog-close {
    background: transparent; border: none; color: #A2A2AC;
    font-size: 1rem; cursor: pointer; padding: 4px;
}
.export-dialog-close:hover { color: #e86b6b; }
.export-dialog-body { padding: 20px; }
.export-dialog-desc {
    font-size: 0.88rem; color: #F5F0E8; margin: 0 0 16px 0;
}
.export-checkbox-group {
    display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;
}
.export-checkbox-item {
    display: flex; align-items: center; gap: 10px; cursor: pointer;
}
.export-checkbox-item input[type="checkbox"] { display: none; }
.checkbox-custom {
    width: 18px; height: 18px;
    border: 2px solid rgba(212, 175, 55, 0.5); border-radius: 4px;
    background: rgba(10, 10, 12, 0.8); transition: all 0.2s ease; flex-shrink: 0;
}
.export-checkbox-item input[type="checkbox"]:checked + .checkbox-custom {
    background: #D4AF37; border-color: #D4AF37;
}
.export-checkbox-item input[type="checkbox"]:checked + .checkbox-custom::after {
    content: '✓'; display: flex; align-items: center; justify-content: center;
    color: #0A0A0C; font-size: 0.7rem; font-weight: bold;
}
.checkbox-label { font-size: 0.88rem; color: #F5F0E8; }
.export-encrypt-option {
    padding-top: 16px; border-top: 1px solid rgba(212, 175, 55, 0.2);
}
.export-dialog-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 16px 20px; border-top: 1px solid rgba(212, 175, 55, 0.2);
}
.backup-reminder {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    z-index: 9999; animation: reminderSlideUp 0.4s ease;
}
@keyframes reminderSlideUp {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
.backup-reminder-content {
    display: flex; align-items: center; gap: 16px;
    background: #14141A; border: 1px solid rgba(212, 175, 55, 0.5);
    border-radius: 12px; padding: 16px 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); max-width: 500px;
    position: relative;
}
.backup-reminder-icon { font-size: 2rem; color: #D4AF37; }
.backup-reminder-text { flex: 1; }
.backup-reminder-title {
    font-size: 0.95rem; color: #D4AF37; margin: 0 0 4px 0; font-weight: 600;
}
.backup-reminder-desc { font-size: 0.82rem; color: #F5F0E8; margin: 0; }
.backup-reminder-actions { display: flex; gap: 8px; }
.backup-reminder-close {
    background: transparent; border: none; color: #A2A2AC;
    font-size: 0.9rem; cursor: pointer; padding: 4px;
    position: absolute; top: 8px; right: 8px;
}
.backup-reminder-close:hover { color: #e86b6b; }
@media (max-width: 640px) {
    .backup-reminder-content { flex-direction: column; text-align: center; }
    .backup-reminder-actions { width: 100%; justify-content: center; }
}
`;

function injectExportStyles() {
    const style = document.createElement('style');
    style.textContent = exportDialogCSS;
    document.head.appendChild(style);
}

/* ========== 导出 ========== */
export {
    initPDFExport,
    exportToPDF,
    exportToJSON,
    importFromJSON,
    generateShareLink,
    parseShareLink,
    createExportButtons,
    addExportToModule,
    showSelectiveExportDialog,
    executeSelectiveExport,
    setupAutoBackup,
    injectExportStyles,
    formatDate,
};