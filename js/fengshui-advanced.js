/**
 * 乾坤易道 - 风水深化模块
 * @module fengshui-advanced
 * @description 实现24山方位细分、玄空飞星、指南针API等高级风水功能
 */

import { showToast } from './utils.js?v=20260624-1';

/* ========== 24山方位数据 ========== */

/**
 * 24山方位表
 * 每山15度，共360度
 */
const MOUNTAINS_24 = [
    // 北方（坎宫）
    { name: '壬', degree: 337.5, wuxing: '水', yinyang: '阳', palace: '坎',吉凶: '吉', desc: '壬水长流，主智慧、流动' },
    { name: '子', degree: 0, wuxing: '水', yinyang: '阳', palace: '坎',吉凶: '吉', desc: '子水正位，主聪明、桃花' },
    { name: '癸', degree: 22.5, wuxing: '水', yinyang: '阴', palace: '坎',吉凶: '吉', desc: '癸水雨露，主滋润、柔和' },

    // 东北（艮宫）
    { name: '丑', degree: 45, wuxing: '土', yinyang: '阴', palace: '艮',吉凶: '凶', desc: '丑土墓库，主收藏、阻碍' },
    { name: '艮', degree: 67.5, wuxing: '土', yinyang: '阳', palace: '艮',吉凶: '中', desc: '艮土高山，主稳定、止步' },
    { name: '寅', degree: 90, wuxing: '木', yinyang: '阳', palace: '艮',吉凶: '中', desc: '寅木初生，主开始、希望' },

    // 东方（震宫）
    { name: '甲', degree: 112.5, wuxing: '木', yinyang: '阳', palace: '震',吉凶: '吉', desc: '甲木参天，主正直、领导' },
    { name: '卯', degree: 135, wuxing: '木', yinyang: '阴', palace: '震',吉凶: '吉', desc: '卯木花草，主桃花、人缘' },
    { name: '乙', degree: 157.5, wuxing: '木', yinyang: '阴', palace: '震',吉凶: '吉', desc: '乙木藤萝，主柔韧、适应' },

    // 东南（巽宫）
    { name: '辰', degree: 180, wuxing: '土', yinyang: '阳', palace: '巽',吉凶: '中', desc: '辰土水库，主变化、机遇' },
    { name: '巽', degree: 202.5, wuxing: '木', yinyang: '阴', palace: '巽',吉凶: '吉', desc: '巽木风行，主顺利、财运' },
    { name: '巳', degree: 225, wuxing: '火', yinyang: '阴', palace: '巽',吉凶: '中', desc: '巳火文明，主文化、名声' },

    // 南方（离宫）
    { name: '丙', degree: 247.5, wuxing: '火', yinyang: '阳', palace: '离',吉凶: '吉', desc: '丙火太阳，主光明、热情' },
    { name: '午', degree: 270, wuxing: '火', yinyang: '阳', palace: '离',吉凶: '中', desc: '午火正位，主礼仪、文书' },
    { name: '丁', degree: 292.5, wuxing: '火', yinyang: '阴', palace: '离',吉凶: '吉', desc: '丁火灯烛，主文明、智慧' },

    // 西南（坤宫）
    { name: '未', degree: 315, wuxing: '土', yinyang: '阴', palace: '坤',吉凶: '凶', desc: '未土墓库，主收藏、疾病' },
    { name: '坤', degree: 337.5, wuxing: '土', yinyang: '阴', palace: '坤',吉凶: '吉', desc: '坤土大地，主包容、厚德' },
    { name: '申', degree: 0, wuxing: '金', yinyang: '阳', palace: '坤',吉凶: '中', desc: '申金刀剑，主果断、变革' },

    // 西方（兑宫）
    { name: '庚', degree: 22.5, wuxing: '金', yinyang: '阳', palace: '兑',吉凶: '中', desc: '庚金斧钺，主刚毅、决断' },
    { name: '酉', degree: 45, wuxing: '金', yinyang: '阴', palace: '兑',吉凶: '吉', desc: '酉金珠玉，主收获、喜悦' },
    { name: '辛', degree: 67.5, wuxing: '金', yinyang: '阴', palace: '兑',吉凶: '中', desc: '辛金首饰，主精致、细腻' },

    // 西北（乾宫）
    { name: '戌', degree: 90, wuxing: '土', yinyang: '阳', palace: '乾',吉凶: '凶', desc: '戌土火库，主冲突、变化' },
    { name: '乾', degree: 112.5, wuxing: '金', yinyang: '阳', palace: '乾',吉凶: '吉', desc: '乾金天门，主权威、领导' },
    { name: '亥', degree: 135, wuxing: '水', yinyang: '阴', palace: '乾',吉凶: '中', desc: '亥水天河，主智慧、财富' },
];

/* ========== 玄空飞星数据 ========== */

/**
 * 九运飞星轨迹
 * 每运20年，当前为八运（2004-2023）或九运（2024-2043）
 */
const FEIXING_ORBITS = {
    1: [5, 6, 7, 8, 9, 1, 2, 3, 4], // 一运（1864-1883）
    2: [4, 5, 6, 7, 8, 9, 1, 2, 3], // 二运（1884-1903）
    3: [3, 4, 5, 6, 7, 8, 9, 1, 2], // 三运（1904-1923）
    4: [2, 3, 4, 5, 6, 7, 8, 9, 1], // 四运（1924-1943）
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9], // 五运（1944-1963）
    6: [9, 1, 2, 3, 4, 5, 6, 7, 8], // 六运（1964-1983）
    7: [8, 9, 1, 2, 3, 4, 5, 6, 7], // 七运（1984-2003）
    8: [7, 8, 9, 1, 2, 3, 4, 5, 6], // 八运（2004-2023）
    9: [6, 7, 8, 9, 1, 2, 3, 4, 5], // 九运（2024-2043）
};

/**
 * 飞星五行属性
 */
const STAR_WUXING = {
    1: '水', 2: '土', 3: '木', 4: '木',
    5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
};

/**
 * 飞星吉凶属性
 */
const STAR_NATURE = {
    1: { nature: '吉', desc: '一白贪狼星，主官贵、桃花、文昌' },
    2: { nature: '凶', desc: '二黑巨门星，主疾病、灾厄、阴邪' },
    3: { nature: '凶', desc: '三碧禄存星，主官非、口舌、争斗' },
    4: { nature: '吉', desc: '四绿文曲星，主文昌、桃花、学业' },
    5: { nature: '大凶', desc: '五黄廉贞星，主灾祸、疾病、意外' },
    6: { nature: '吉', desc: '六白武曲星，主官贵、权力、财运' },
    7: { nature: '凶', desc: '七赤破军星，主盗贼、口舌、损失' },
    8: { nature: '大吉', desc: '八白左辅星，主财运、喜事、吉庆' },
    9: { nature: '吉', desc: '九紫右弼星，主喜庆、婚姻、名声' },
};

/**
 * 飞星组合吉凶
 */
const STAR_COMBINATIONS = {
    '16': { level: '上吉', desc: '一六共宗，金水相生，主科名、官运、文昌' },
    '27': { level: '中吉', desc: '二七同道，火土相生，主横财、地产' },
    '38': { level: '中吉', desc: '三八为友，木土相克，主文才、考试' },
    '49': { level: '上吉', desc: '四九为友，木火相生，主桃花、人缘' },
    '14': { level: '上吉', desc: '一四同宫，水木相生，主科名、桃花' },
    '25': { level: '大凶', desc: '二五交加，土土比和，主疾病、损丁' },
    '37': { level: '凶', desc: '三七叠临，金木相克，主官非、盗贼' },
    '68': { level: '上吉', desc: '六八同宫，金土相生，主武贵、财富' },
    '69': { level: '凶', desc: '六九火克金，主官灾、口舌' },
    '12': { level: '凶', desc: '一二相逢，土克水，主中男、疾病' },
    '13': { level: '中吉', desc: '一三相逢，水生木，主官运、文昌' },
    '17': { level: '凶', desc: '一七相逢，金生水，主桃花、劫财' },
    '18': { level: '凶', desc: '一八相逢，土克水，主疾病、耳疾' },
    '23': { level: '凶', desc: '二三斗牛煞，木克土，主官非、疾病' },
    '24': { level: '凶', desc: '二四相逢，木克土，主疾病、风流' },
    '26': { level: '中吉', desc: '二六相逢，土生金，主官运、财运' },
    '29': { level: '凶', desc: '二九相逢，火生土，主疾病、火灾' },
    '34': { level: '中吉', desc: '三四相逢，木木比和，主桃花、官非' },
    '36': { level: '凶', desc: '三六相逢，金克木，主官灾、手脚' },
    '39': { level: '中吉', desc: '三九相逢，木生火，主官运、文昌' },
    '46': { level: '凶', desc: '四六相逢，金克木，主官灾、桃花' },
    '47': { level: '凶', desc: '四七相逢，金克木，主官灾、桃花' },
    '48': { level: '凶', desc: '四八相逢，木克土，主疾病、风流' },
    '57': { level: '凶', desc: '五七相逢，土生金，主疾病、口舌' },
    '59': { level: '凶', desc: '五九相逢，火生土，主疾病、火灾' },
    '78': { level: '中吉', desc: '七八相逢，土生金，主财运、口舌' },
    '79': { level: '凶', desc: '七九相逢，火克金，主官灾、回禄' },
    '89': { level: '上吉', desc: '八九相逢，火生土，主喜庆、财运' },
};

/* ========== 流年飞星 ========== */

/**
 * 计算流年飞星入中宫的星号
 * @param {number} year - 年份
 * @returns {number} 入中宫的飞星号（1-9）
 */
function getAnnualStar(year) {
    // 流年飞星计算公式
    // 2024年九紫入中，之后逐年逆推
    const baseYear = 2024;
    const baseStar = 9;
    const diff = year - baseYear;
    const star = ((baseStar - diff) % 9 + 9) % 9;
    return star === 0 ? 9 : star;
}

/**
 * 排布流年飞星九宫
 * @param {number} year - 年份
 * @returns {Array} 九宫飞星分布
 */
function arrangeAnnualFeixing(year) {
    const centerStar = getAnnualStar(year);
    const grid = new Array(9);

    // 飞星排布顺序：中宫 → 西北 → 西 → 东北 → 南 → 北 → 西南 → 东 → 东南
    const order = [4, 8, 6, 0, 2, 5, 7, 1, 3]; // 对应洛书九宫的顺序（0-8）

    for (let i = 0; i < 9; i++) {
        const starNum = ((centerStar - 1 + i) % 9) + 1;
        grid[order[i]] = starNum;
    }

    return grid;
}

/* ========== 指南针管理器 ========== */

class CompassManager {
    constructor() {
        this.currentDegree = 0;
        this.currentMountain = null;
        this.isSupported = false;
        this.isListening = false;
        this.callbacks = [];
        this.simulationMode = false;
    }

    /**
     * 初始化指南针
     */
    init() {
        if (window.DeviceOrientationEvent) {
            // iOS 13+ 需要请求权限
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                this.requestPermission();
            } else {
                this.startListening();
            }
            this.isSupported = true;
        } else {
            console.warn('设备不支持指南针 API');
            this.isSupported = false;
            this.simulationMode = true;
        }
    }

    /**
     * 请求指南针权限（iOS）
     */
    async requestPermission() {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                this.startListening();
            } else {
                console.warn('指南针权限被拒绝');
                this.simulationMode = true;
            }
        } catch (err) {
            console.error('请求指南针权限失败:', err);
            this.simulationMode = true;
        }
    }

    /**
     * 开始监听设备方向
     */
    startListening() {
        if (this.isListening) return;

        window.addEventListener('deviceorientationabsolute', (e) => {
            if (e.alpha !== null) {
                this.updateOrientation(e.alpha);
            }
        });

        // 备用方案
        window.addEventListener('deviceorientation', (e) => {
            if (e.alpha !== null && !this.currentDegree) {
                this.updateOrientation(e.alpha);
            }
        });

        this.isListening = true;
    }

    /**
     * 更新方向
     */
    updateOrientation(alpha) {
        this.currentDegree = alpha;
        this.currentMountain = this.getMountainByDegree(alpha);
        this.notifyCallbacks();
    }

    /**
     * 根据角度获取山向
     */
    getMountainByDegree(degree) {
        const normalizedDegree = ((degree % 360) + 360) % 360;
        const index = Math.floor(normalizedDegree / 15) % 24;
        return MOUNTAINS_24[index];
    }

    /**
     * 注册回调
     */
    onUpdate(callback) {
        this.callbacks.push(callback);
    }

    /**
     * 通知回调
     */
    notifyCallbacks() {
        for (const cb of this.callbacks) {
            try {
                cb({
                    degree: this.currentDegree,
                    mountain: this.currentMountain,
                });
            } catch (err) {
                console.error('指南针回调错误:', err);
            }
        }
    }

    /**
     * 模拟模式（桌面端）
     */
    simulate(degree) {
        this.currentDegree = degree;
        this.currentMountain = this.getMountainByDegree(degree);
        this.notifyCallbacks();
    }

    /**
     * 获取当前山向
     */
    getCurrentMountain() {
        return this.currentMountain;
    }

    /**
     * 获取当前度数
     */
    getCurrentDegree() {
        return this.currentDegree;
    }
}

/* ========== 渲染函数 ========== */

/**
 * 渲染24山方位表
 * @returns {string} HTML 内容
 */
function renderMountains24() {
    let html = '<div class="mountains-24-grid">';

    for (let i = 0; i < 24; i++) {
        const mountain = MOUNTAINS_24[i];
        const jiClass = mountain.吉凶 === '吉' ? 'ji' : mountain.吉凶 === '凶' ? 'xiong' : '';

        html += `
            <div class="mountain-cell ${jiClass}" data-mountain="${mountain.name}">
                <div class="mountain-name">${mountain.name}</div>
                <div class="mountain-degree">${mountain.degree}°</div>
                <div class="mountain-wuxing">${mountain.wuxing}</div>
                <div class="mountain-desc">${mountain.desc}</div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * 渲染玄空飞星九宫格
 * @param {Array} grid - 飞星九宫分布
 * @param {number} year - 年份
 * @returns {string} HTML 内容
 */
function renderFeixingGrid(grid, year) {
    const palaceNames = ['中宫', '乾六宫', '兑七宫', '艮八宫', '离九宫', '坎一宫', '坤二宫', '震三宫', '巽四宫'];
    const directions = ['中', '西北', '西', '东北', '南', '北', '西南', '东', '东南'];

    let html = '<div class="feixing-grid-container">';
    html += `<div class="feixing-header"><h4>${year}年流年飞星</h4></div>`;
    html += '<div class="feixing-grid">';

    for (let i = 0; i < 9; i++) {
        const starNum = grid[i];
        const starInfo = STAR_NATURE[starNum];
        const jiClass = starInfo.nature === '吉' || starInfo.nature === '大吉' ? 'ji' :
                        starInfo.nature === '凶' || starInfo.nature === '大凶' ? 'xiong' : '';

        html += `
            <div class="feixing-cell ${jiClass}" data-palace="${i}">
                <div class="feixing-palace">${palaceNames[i]}</div>
                <div class="feixing-direction">${directions[i]}</div>
                <div class="feixing-star">${starNum}</div>
                <div class="feixing-nature ${starInfo.nature === '吉' || starInfo.nature === '大吉' ? 'text-ji' : starInfo.nature === '凶' || starInfo.nature === '大凶' ? 'text-xiong' : ''}">${starInfo.nature}</div>
            </div>
        `;
    }

    html += '</div></div>';
    return html;
}

/**
 * 渲染飞星组合分析
 * @param {Array} grid - 飞星九宫分布
 * @returns {string} HTML 内容
 */
function renderFeixingCombinations(grid) {
    let combinations = [];

    // 检查相邻宫位的飞星组合
    const adjacentPairs = [
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 1],
    ];

    const palaceNames = ['中宫', '乾六宫', '兑七宫', '艮八宫', '离九宫', '坎一宫', '坤二宫', '震三宫', '巽四宫'];

    for (const [a, b] of adjacentPairs) {
        const starA = grid[a];
        const starB = grid[b];
        const key1 = `${starA}${starB}`;
        const key2 = `${starB}${starA}`;

        const combo = STAR_COMBINATIONS[key1] || STAR_COMBINATIONS[key2];
        if (combo) {
            combinations.push({
                palace1: palaceNames[a],
                palace2: palaceNames[b],
                star1: starA,
                star2: starB,
                ...combo,
            });
        }
    }

    if (combinations.length === 0) {
        return '<div class="feixing-combinations"><p style="color:#A2A2AC;">本年无特殊飞星组合</p></div>';
    }

    let html = '<div class="feixing-combinations">';
    html += '<h4>飞星组合分析</h4>';
    html += '<div class="combinations-list">';

    for (const combo of combinations) {
        const jiClass = combo.level === '上吉' || combo.level === '中吉' ? 'ji' :
                        combo.level === '凶' || combo.level === '大凶' ? 'xiong' : '';

        html += `
            <div class="combination-item ${jiClass}">
                <div class="combo-header">
                    <span class="combo-stars">${combo.star1}-${combo.star2}</span>
                    <span class="combo-palaces">${combo.palace1} ↔ ${combo.palace2}</span>
                    <span class="combo-level ${jiClass}">${combo.level}</span>
                </div>
                <div class="combo-desc">${combo.desc}</div>
            </div>
        `;
    }

    html += '</div></div>';
    return html;
}

/**
 * 渲染指南针 UI
 * @param {Object} compass - 指南针管理器实例
 * @returns {string} HTML 内容
 */
function renderCompassUI(compass) {
    return `
        <div class="compass-ui-container">
            <div class="compass-visual" id="compassVisual">
                <div class="compass-ring"></div>
                <div class="compass-needle" id="compassNeedle"></div>
                <div class="compass-center">
                    <span class="compass-degree" id="compassDegree">0°</span>
                </div>
            </div>
            <div class="compass-info">
                <div class="compass-mountain" id="compassMountain">子</div>
                <div class="compass-direction" id="compassDirection">北方</div>
                <div class="compass-wuxing" id="compassWuxing">水</div>
            </div>
            <div class="compass-controls">
                <input type="range" id="compassSlider" min="0" max="359" value="0" class="compass-slider">
                <div class="compass-markers">
                    <span>0°</span>
                    <span>90°</span>
                    <span>180°</span>
                    <span>270°</span>
                </div>
            </div>
        </div>
    `;
}

/* ========== 初始化函数 ========== */

/**
 * 初始化风水深化模块
 */
function initFengshuiAdvancedModule() {
    // 24山按钮
    const btn24Mountains = document.getElementById('btnShow24Mountains');
    if (btn24Mountains) {
        btn24Mountains.addEventListener('click', () => {
            const resultEl = document.getElementById('fengshuiAdvancedResult');
            if (resultEl) {
                resultEl.innerHTML = renderMountains24();
                resultEl.style.display = 'block';
            }
        });
    }

    // 玄空飞星按钮
    const btnFeixing = document.getElementById('btnShowFeixing');
    if (btnFeixing) {
        btnFeixing.addEventListener('click', () => {
            const year = new Date().getFullYear();
            const grid = arrangeAnnualFeixing(year);
            const resultEl = document.getElementById('fengshuiAdvancedResult');
            if (resultEl) {
                resultEl.innerHTML = renderFeixingGrid(grid, year) + renderFeixingCombinations(grid);
                resultEl.style.display = 'block';
            }
        });
    }

    // 指南针按钮
    const btnCompass = document.getElementById('btnShowCompass');
    if (btnCompass) {
        btnCompass.addEventListener('click', () => {
            const resultEl = document.getElementById('fengshuiAdvancedResult');
            if (resultEl) {
                resultEl.innerHTML = renderCompassUI();
                resultEl.style.display = 'block';
                initCompassControls();
            }
        });
    }

    console.log('风水深化模块初始化完成');
}

/**
 * 初始化指南针控制
 */
function initCompassControls() {
    const slider = document.getElementById('compassSlider');
    const needle = document.getElementById('compassNeedle');
    const degreeEl = document.getElementById('compassDegree');
    const mountainEl = document.getElementById('compassMountain');
    const directionEl = document.getElementById('compassDirection');
    const wuxingEl = document.getElementById('compassWuxing');

    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const degree = parseInt(e.target.value);
        const mountain = MOUNTAINS_24[Math.floor(degree / 15) % 24];

        if (needle) needle.style.transform = `rotate(${degree}deg)`;
        if (degreeEl) degreeEl.textContent = `${degree}°`;
        if (mountainEl) mountainEl.textContent = mountain.name;
        if (directionEl) directionEl.textContent = mountain.palace + '方';
        if (wuxingEl) wuxingEl.textContent = mountain.wuxing;
    });
}

/* ========== 导出 ========== */
export {
    initFengshuiAdvancedModule,
    MOUNTAINS_24,
    FEIXING_ORBITS,
    STAR_WUXING,
    STAR_NATURE,
    STAR_COMBINATIONS,
    getAnnualStar,
    arrangeAnnualFeixing,
    renderMountains24,
    renderFeixingGrid,
    renderFeixingCombinations,
    renderCompassUI,
    CompassManager,
};
