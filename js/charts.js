/**
 * 乾坤易道 - 数据可视化模块
 * @module charts
 * @description 基于 Chart.js 的图表渲染，用于五行分布、运势趋势等可视化展示
 */

/* ========== 图表配置 ========== */

const CHART_COLORS = {
    gold: { bg: 'rgba(212, 175, 55, 0.2)', border: '#D4AF37' },
    green: { bg: 'rgba(59, 156, 122, 0.2)', border: '#3B9C7A' },
    red: { bg: 'rgba(199, 62, 58, 0.2)', border: '#C73E3A' },
    blue: { bg: 'rgba(74, 144, 217, 0.2)', border: '#4A90D9' },
    white: { bg: 'rgba(245, 240, 232, 0.2)', border: '#F5F0E8' },
    gray: { bg: 'rgba(162, 162, 172, 0.2)', border: '#A2A2AC' },
};

const WUXING_COLORS = {
    '金': '#E6C280',
    '木': '#3B9C7A',
    '水': '#50E3C2',
    '火': '#C93C3C',
    '土': '#D2B48C',
};

/* ========== Chart.js 配置 ========== */

const DEFAULT_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#F5F0E8',
                font: { family: 'Noto Serif SC', size: 12 },
            },
        },
        tooltip: {
            backgroundColor: 'rgba(20, 20, 26, 0.95)',
            titleColor: '#D4AF37',
            bodyColor: '#F5F0E8',
            borderColor: 'rgba(212, 175, 55, 0.3)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
        },
    },
};

/* ========== 五行雷达图 ========== */

/**
 * 创建五行分布雷达图
 * @param {string} canvasId - Canvas 元素 ID
 * @param {Object} wuxingData - 五行数据 {金: 20, 木: 25, 水: 15, 火: 30, 土: 10}
 * @returns {Chart} Chart.js 实例
 */
function createWuxingRadar(canvasId, wuxingData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const labels = ['金', '木', '水', '火', '土'];
    const data = labels.map(label => wuxingData[label] || 0);

    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '五行分布',
                data: data,
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                borderColor: '#D4AF37',
                borderWidth: 2,
                pointBackgroundColor: labels.map(label => WUXING_COLORS[label]),
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 7,
            }],
        },
        options: {
            ...DEFAULT_OPTIONS,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 40,
                    ticks: {
                        stepSize: 10,
                        color: '#A2A2AC',
                        backdropColor: 'transparent',
                    },
                    grid: {
                        color: 'rgba(212, 175, 55, 0.1)',
                    },
                    angleLines: {
                        color: 'rgba(212, 175, 55, 0.15)',
                    },
                    pointLabels: {
                        color: '#F5F0E8',
                        font: {
                            size: 16,
                            family: 'ZCOOL XiaoWei, Noto Serif SC, serif',
                            weight: '700',
                        },
                    },
                },
            },
        },
    });
}

/* ========== 大运流年折线图 ========== */

/**
 * 创建大运流年运势折线图
 * @param {string} canvasId - Canvas 元素 ID
 * @param {Array} daXianData - 大运数据 [{year, month, rating, desc}]
 * @returns {Chart} Chart.js 实例
 */
function createDayunLineChart(canvasId, daXianData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const labels = daXianData.map(d => d.year || d.month);
    const ratings = daXianData.map(d => d.rating === '吉' ? 80 : d.rating === '平' ? 50 : d.rating === '慎' ? 30 : 50);

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '运势走势',
                data: ratings,
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: ratings.map(r => r >= 70 ? '#3B9C7A' : r >= 50 ? '#D4AF37' : '#C73E3A'),
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6,
            }],
        },
        options: {
            ...DEFAULT_OPTIONS,
            scales: {
                x: {
                    grid: { color: 'rgba(212, 175, 55, 0.1)' },
                    ticks: { color: '#A2A2AC', font: { size: 11 } },
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(212, 175, 55, 0.1)' },
                    ticks: {
                        color: '#A2A2AC',
                        font: { size: 11 },
                        callback: function(value) {
                            if (value === 80) return '吉';
                            if (value === 50) return '平';
                            if (value === 30) return '慎';
                            return '';
                        },
                    },
                },
            },
        },
    });
}

/* ========== 十神柱状图 ========== */

/**
 * 创建十神分布柱状图
 * @param {string} canvasId - Canvas 元素 ID
 * @param {Object} shishenData - 十神数据 {'正印': 2, '偏印': 1, ...}
 * @returns {Chart} Chart.js 实例
 */
function createShishenBarChart(canvasId, shishenData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const labels = Object.keys(shishenData);
    const data = Object.values(shishenData);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '十神分布',
                data: data,
                backgroundColor: labels.map((_, i) => {
                    const colors = ['#D4AF37', '#E6C280', '#3B9C7A', '#50E3C2', '#C93C3C'];
                    return colors[i % colors.length] + '80';
                }),
                borderColor: labels.map((_, i) => {
                    const colors = ['#D4AF37', '#E6C280', '#3B9C7A', '#50E3C2', '#C93C3C'];
                    return colors[i % colors.length];
                }),
                borderWidth: 1,
                borderRadius: 4,
            }],
        },
        options: {
            ...DEFAULT_OPTIONS,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#A2A2AC', font: { size: 11 } },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(212, 175, 55, 0.1)' },
                    ticks: {
                        color: '#A2A2AC',
                        font: { size: 11 },
                        stepSize: 1,
                    },
                },
            },
        },
    });
}

/* ========== 通用饼图 ========== */

/**
 * 创建通用饼图
 * @param {string} canvasId - Canvas 元素 ID
 * @param {Array} data - 数据 [{label, value, color}]
 * @param {string} title - 图表标题
 * @returns {Chart} Chart.js 实例
 */
function createPieChart(canvasId, data, title = '') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: data.map(d => d.color || '#D4AF37'),
                borderColor: '#14141A',
                borderWidth: 2,
            }],
        },
        options: {
            ...DEFAULT_OPTIONS,
            cutout: '60%',
            plugins: {
                ...DEFAULT_OPTIONS.plugins,
                title: {
                    display: !!title,
                    text: title,
                    color: '#D4AF37',
                    font: { size: 14, family: 'Noto Serif SC' },
                },
            },
        },
    });
}

/* ========== 图表容器组件 ========== */

/**
 * 创建图表容器 HTML
 * @param {string} title - 图表标题
 * @param {string} canvasId - Canvas ID
 * @param {string} description - 描述文字
 * @returns {string} HTML 字符串
 */
function createChartContainer(title, canvasId, description = '') {
    return `
        <div class="chart-container">
            <div class="chart-header">
                <h4 class="chart-title"><i class="fa-solid fa-chart-pie"></i> ${title}</h4>
                ${description ? `<p class="chart-desc">${description}</p>` : ''}
            </div>
            <div class="chart-canvas-wrapper">
                <canvas id="${canvasId}"></canvas>
            </div>
        </div>
    `;
}

/* ========== 工具函数 ========== */

/**
 * 从八字数据提取五行分布
 * @param {Object} wuxingData - 五行数据
 * @returns {Object} 格式化的五行数据
 */
function formatWuxingData(wuxingData) {
    return {
        '金': wuxingData.金 || 0,
        '木': wuxingData.木 || 0,
        '水': wuxingData.水 || 0,
        '火': wuxingData.火 || 0,
        '土': wuxingData.土 || 0,
    };
}

/**
 * 从大运数据提取运势趋势
 * @param {Array} daXian - 大运数组
 * @returns {Array} 格式化的运势数据
 */
function formatDayunData(daXian) {
    return daXian.slice(0, 10).map(dx => ({
        year: `${dx.startAge}-${dx.endAge}岁`,
        rating: dx.rating || '平',
        palace: dx.palaceName || '',
    }));
}

/* ========== 初始化函数 ========== */

/**
 * 初始化图表模块
 * 检查 Chart.js 是否可用
 * @returns {boolean} 是否初始化成功
 */
function initCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js 未加载，图表功能不可用');
        return false;
    }

    // Chart.js 全局配置
    Chart.defaults.color = '#A2A2AC';
    Chart.defaults.font.family = 'Noto Serif SC, serif';

    console.log('图表模块初始化完成');
    return true;
}

/* ========== 导出 ========== */
export {
    initCharts,
    createWuxingRadar,
    createDayunLineChart,
    createShishenBarChart,
    createPieChart,
    createChartContainer,
    formatWuxingData,
    formatDayunData,
    CHART_COLORS,
    WUXING_COLORS,
};