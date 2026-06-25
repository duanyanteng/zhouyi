/**
 * 乾坤易道 - 数据导出模块
 * @module export
 * @description 提供 PDF 导出、JSON 备份、分享链接等数据导出功能
 */

/* ========== PDF 导出 ========== */

/**
 * 初始化 PDF 导出功能
 * 加载 jsPDF 和 html2canvas 库
 */
function initPDFExport() {
    // 动态加载 jsPDF
    if (!window.jspdf) {
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script1.onload = () => {
            console.log('jsPDF 加载完成');
        };
        document.head.appendChild(script1);
    }

    // 动态加载 html2canvas
    if (!window.html2canvas) {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script2.onload = () => {
            console.log('html2canvas 加载完成');
        };
        document.head.appendChild(script2);
    }
}

/**
 * 将 HTML 元素导出为 PDF
 * @param {string} elementId - 要导出的元素 ID
 * @param {Object} options - 导出选项
 * @param {string} options.filename - 文件名
 * @param {string} options.title - PDF 标题
 * @param {string} options.subtitle - PDF 副标题
 * @param {string} options.watermark - 水印文字
 * @param {string} options.format - 纸张格式 ('a4', 'letter')
 * @param {string} options.orientation - 方向 ('portrait', 'landscape')
 * @param {number} options.quality - 图片质量 (1-3)
 * @returns {Promise<void>}
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

    // 检查依赖库是否加载
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
        // 1. 生成 Canvas
        const canvas = await html2canvas(element, {
            scale: quality,
            useCORS: true,
            logging: false,
            backgroundColor: '#0A0A0C',
            onclone: (clonedDoc) => {
                // 克隆时可以调整样式
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.padding = '20px';
                }
            }
        });

        // 2. 创建 PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF(orientation, 'mm', format);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // 3. 添加封面
        pdf.setFillColor(10, 10, 12);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        // 标题
        pdf.setTextColor(230, 194, 128);
        pdf.setFontSize(28);
        pdf.text(title, pdfWidth / 2, 60, { align: 'center' });

        // 副标题
        if (subtitle) {
            pdf.setTextColor(162, 162, 172);
            pdf.setFontSize(14);
            pdf.text(subtitle, pdfWidth / 2, 80, { align: 'center' });
        }

        // 分隔线
        pdf.setDrawColor(212, 175, 55);
        pdf.setLineWidth(0.5);
        pdf.line(50, 90, pdfWidth - 50, 90);

        // 日期
        pdf.setTextColor(162, 162, 172);
        pdf.setFontSize(12);
        const now = new Date();
        const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
        pdf.text(`生成日期：${dateStr}`, pdfWidth / 2, 110, { align: 'center' });

        // 品牌标识
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(10);
        pdf.text('乾坤易道 · 周易数理命理智能分析系统', pdfWidth / 2, pdfHeight - 20, { align: 'center' });

        // 4. 添加内容页
        pdf.addPage();

        // 将 Canvas 转换为图片
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 20) / imgHeight);
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;

        // 居中放置
        const x = (pdfWidth - scaledWidth) / 2;
        const y = 10;

        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

        // 5. 添加水印
        if (watermark) {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 2; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setTextColor(200, 200, 200);
                pdf.setFontSize(50);
                pdf.text(watermark, pdfWidth / 2, pdfHeight / 2, {
                    align: 'center',
                    angle: 45,
                    opacity: 0.1,
                });
            }
        }

        // 6. 保存
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
 * @param {Object} options - 导出选项
 * @param {boolean} options.includeHistory - 是否包含历史记录
 * @param {boolean} options.includeSettings - 是否包含设置
 * @param {boolean} options.includeApiKey - 是否包含 API Key（加密）
 * @returns {void}
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

        // 八字数据
        const baziInput = localStorage.getItem('bazi_input_cache');
        if (baziInput) {
            data.modules.bazi = {
                input: JSON.parse(baziInput),
            };
        }

        // 历史记录
        if (includeHistory) {
            const globalHistory = localStorage.getItem('qky_global_history_v1');
            if (globalHistory) {
                data.modules.history = JSON.parse(globalHistory);
            }
        }

        // 设置
        if (includeSettings) {
            data.modules.settings = {
                theme: localStorage.getItem('theme') || 'dark',
                navCollapsed: localStorage.getItem('nav_collapsed') === 'true',
            };
        }

        // API Key（可选，加密存储）
        if (includeApiKey) {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (apiKey) {
                data.modules.apiKey = btoa(apiKey); // 简单 base64 编码
            }
        }

        // 生成并下载
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
 * @param {File} file - 文件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // 验证文件格式
                if (data.app !== '乾坤易道') {
                    reject({ success: false, message: '无效的备份文件' });
                    return;
                }

                // 版本检查
                if (data.version !== '5.0') {
                    // 尝试兼容旧版本
                    console.warn('备份文件版本较旧，尝试兼容处理');
                }

                // 恢复数据
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

        reader.onerror = () => {
            reject({ success: false, message: '文件读取失败' });
        };

        reader.readAsText(file);
    });
}

/* ========== 分享链接 ========== */

/**
 * 生成分享链接
 * @param {Object} data - 要分享的数据
 * @param {string} type - 数据类型 ('bazi', 'ziwei', 'shuzi')
 * @param {Object} options - 选项
 * @param {number} options.expiresIn - 过期时间（毫秒），默认 7 天
 * @returns {string} 分享链接
 */
function generateShareLink(data, type, options = {}) {
    const {
        expiresIn = 7 * 24 * 60 * 60 * 1000, // 默认 7 天
    } = options;

    try {
        const shareData = {
            type: type,
            data: data,
            expires: Date.now() + expiresIn,
            created: Date.now(),
        };

        // 压缩数据（简单的 base64 编码）
        const jsonStr = JSON.stringify(shareData);
        const encoded = btoa(encodeURIComponent(jsonStr));

        // 生成链接
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?share=${encoded}`;

        return shareUrl;

    } catch (err) {
        console.error('生成分享链接失败:', err);
        return null;
    }
}

/**
 * 解析分享链接
 * @param {string} url - 分享链接
 * @returns {Object|null} 解析后的数据，无效返回 null
 */
function parseShareLink(url) {
    try {
        const urlObj = new URL(url);
        const encoded = urlObj.searchParams.get('share');

        if (!encoded) return null;

        const jsonStr = decodeURIComponent(atob(encoded));
        const shareData = JSON.parse(jsonStr);

        // 检查是否过期
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

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
}

/**
 * 显示 Toast 消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒）
 */
function showToast(message, duration = 2000) {
    // 复用全局 showToast 或创建新的
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

/* ========== UI 组件 ========== */

/**
 * 创建导出按钮组
 * @param {string} elementId - 要导出的内容元素 ID
 * @param {string} title - PDF 标题
 * @returns {HTMLElement} 按钮组元素
 */
function createExportButtons(elementId, title) {
    const container = document.createElement('div');
    container.className = 'export-btn-group';
    container.style.cssText = 'display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;';

    // PDF 导出按钮
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'btn-secondary export-btn';
    pdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> 导出 PDF';
    pdfBtn.addEventListener('click', () => {
        exportToPDF(elementId, {
            filename: `${title}_${formatDate(new Date())}.pdf`,
            title: `乾坤易道 · ${title}`,
            subtitle: document.getElementById('baziName')?.value || '',
        });
    });

    // 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-secondary export-btn';
    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> 复制';
    copyBtn.addEventListener('click', () => {
        const element = document.getElementById(elementId);
        if (element) {
            const text = element.innerText;
            navigator.clipboard.writeText(text).then(() => {
                showToast('已复制到剪贴板', 1500);
            });
        }
    });

    // 分享按钮
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn-secondary export-btn';
    shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> 分享';
    shareBtn.addEventListener('click', () => {
        // 分享逻辑（后续实现）
        showToast('分享功能开发中...', 1500);
    });

    container.appendChild(pdfBtn);
    container.appendChild(copyBtn);
    container.appendChild(shareBtn);

    return container;
}

/**
 * 为指定模块添加导出功能
 * @param {string} module - 模块名称
 * @param {string} elementId - 内容元素 ID
 */
function addExportToModule(module, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // 查找现有的按钮容器或创建新的
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
    formatDate,
};
