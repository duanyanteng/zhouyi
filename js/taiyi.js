/**
 * 乾坤易道 - 太乙神数模块
 * @module taiyi
 * @description 实现太乙神数排盘，包括太乙积年、三基五福、十六宫分析
 */

import { showToast } from './utils.js?20260626-4';
import { exportToPDF, formatDate, generateShareLink } from './export.js?20260626-4';

/* ========== 太乙神数核心数据 ========== */

/** 太乙九宫 */
const TAIYI_NINE_PALACES = [
    { name: '太乙', wuxing: '火', nature: '大吉', symbol: '⭐', desc: '主君王、权威、决策' },
    { name: '摄提', wuxing: '木', nature: '吉', symbol: '🌿', desc: '主权臣、辅佐、谋略' },
    { name: '轩辕', wuxing: '土', nature: '中', symbol: '🏛️', desc: '主后宫、内政、稳定' },
    { name: '招摇', wuxing: '木', nature: '凶', symbol: '⚔️', desc: '主边疆、军事、冲突' },
    { name: '天符', wuxing: '土', nature: '吉', symbol: '📜', desc: '主中央、法令、规则' },
    { name: '青龙', wuxing: '木', nature: '大吉', symbol: '🐲', desc: '主东方、春季、生机' },
    { name: '咸池', wuxing: '金', nature: '凶', symbol: '🌊', desc: '主西方、秋季、肃杀' },
    { name: '太阴', wuxing: '金', nature: '吉', symbol: '🌙', desc: '主阴私、暗助、密谋' },
    { name: '天乙', wuxing: '水', nature: '大吉', symbol: '💧', desc: '主贵人、化解、智慧' },
];

/** 三基 */
const SANJI = [
    { name: '君基', desc: '主国运、君王运势' },
    { name: '臣基', desc: '主大臣、辅佐运势' },
    { name: '民基', desc: '主百姓、民生运势' },
];

/** 五福 */
const WUFU = [
    { name: '君福', desc: '主君王福祉' },
    { name: '臣福', desc: '主大臣福祉' },
    { name: '民福', desc: '主百姓福祉' },
    { name: '岁福', desc: '主当年福祉' },
    { name: '月福', desc: '主当月福祉' },
];

/** 十六宫（十二地支 + 四维） */
const SIXTEEN_PALACES = [
    '子', '丑', '寅', '卯', '辰', '巳', '午', '未',
    '申', '酉', '戌', '亥', '乾', '坤', '艮', '巽'
];

/** 地支五行 */
const ZHI_WUXING = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水',
    '乾': '金', '坤': '土', '艮': '土', '巽': '木',
};

/** 地支方位 */
const ZHI_DIRECTION = {
    '子': '北', '丑': '东北', '寅': '东北', '卯': '东',
    '辰': '东南', '巳': '东南', '午': '南', '未': '西南',
    '申': '西南', '酉': '西', '戌': '西北', '亥': '西北',
    '乾': '西北', '坤': '西南', '艮': '东北', '巽': '东南',
};

/** 地支吉凶 */
const ZHI_NATURE = {
    '子': '吉', '丑': '中', '寅': '吉', '卯': '大吉',
    '辰': '中', '巳': '凶', '午': '中', '未': '凶',
    '申': '吉', '酉': '中', '戌': '凶', '亥': '大吉',
    '乾': '大吉', '坤': '吉', '艮': '吉', '巽': '中',
};

/* ========== 太乙神数排盘算法 ========== */

/**
 * 计算太乙积年
 * @param {number} year - 公历年份
 * @returns {number} 太乙积年数
 */
function calculateJiYear(year) {
    // 太乙积年计算公式（简化版）
    // 实际应根据古历精确计算
    const baseYear = 1015420; // 上元积年基数
    const cycle = 360; // 太乙周期

    const diff = year - 2024; // 以2024年为基准
    const jiYear = (baseYear + diff) % cycle;

    return jiYear;
}

/**
 * 计算太乙宫位
 * @param {number} jiYear - 太乙积年
 * @returns {number} 太乙宫位（1-9）
 */
function calculateTaiyiPosition(jiYear) {
    // 太乙在九宫中运行，每宫3年
    const pos = (jiYear % 27) / 3;
    return Math.floor(pos) + 1;
}

/**
 * 计算计神宫位
 * @param {number} jiYear - 太乙积年
 * @returns {string} 计神所在地支
 */
function calculateJishenPosition(jiYear) {
    // 计神在十二地支中运行
    const index = jiYear % 12;
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return zhiList[index];
}

/**
 * 计算文昌位置
 * @param {number} jiYear - 太乙积年
 * @returns {string} 文昌所在地支
 */
function calculateWenchang(jiYear) {
    // 文昌在十二地支中运行（简化）
    const index = (jiYear + 2) % 12;
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return zhiList[index];
}

/**
 * 计算始击位置
 * @param {number} jiYear - 太乙积年
 * @returns {string} 始击所在地支
 */
function calculateShiji(jiYear) {
    // 始击在十二地支中运行（简化）
    const index = (jiYear + 8) % 12;
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return zhiList[index];
}

/**
 * 计算三基位置
 * @param {number} jiYear - 太乙积年
 * @returns {Object} 三基位置
 */
function calculateSanji(jiYear) {
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    return {
        junji: zhiList[(jiYear) % 12],      // 君基
        chenji: zhiList[(jiYear + 4) % 12],  // 臣基
        minji: zhiList[(jiYear + 8) % 12],   // 民基
    };
}

/**
 * 计算五福位置
 * @param {number} jiYear - 太乙积年
 * @returns {Object} 五福位置
 */
function calculateWufu(jiYear) {
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    return {
        junfu: zhiList[(jiYear + 1) % 12],      // 君福
        chenfu: zhiList[(jiYear + 5) % 12],      // 臣福
        minfu: zhiList[(jiYear + 9) % 12],       // 民福
        suifu: zhiList[(jiYear + 3) % 12],       // 岁福
        yuefu: zhiList[(jiYear + 7) % 12],       // 月福
    };
}

/**
 * 判断格局
 * @param {Object} positions - 各星位置
 * @returns {Object} 格局信息
 */
function identifyPattern(positions) {
    const { taiyiPos, jishenPos, wenchang, shiji, sanji, wufu } = positions;

    // 检查太乙与计神的关系
    if (taiyiPos === jishenPos) {
        return {
            name: '太乙临计',
            nature: '大吉',
            desc: '太乙与计神同宫，主权威稳固，决策正确。'
        };
    }

    // 检查文昌与始击的关系
    if (wenchang === shiji) {
        return {
            name: '文昌始击',
            nature: '中',
            desc: '文昌与始击同位，主文武相争，需权衡利弊。'
        };
    }

    // 检查君基与君福的关系
    if (sanji.junji === wufu.junfu) {
        return {
            name: '君基君福',
            nature: '大吉',
            desc: '君基与君福同位，主国运昌盛，君王有福。'
        };
    }

    // 默认格局
    return {
        name: '平和格局',
        nature: '中',
        desc: '各星分布平稳，无明显吉凶。'
    };
}

/**
 * 生成用事建议
 * @param {Object} pattern - 格局
 * @param {Object} positions - 各星位置
 * @returns {Object} 用事建议
 */
function generateAdvice(pattern, positions) {
    const advice = {
        summary: `本年为${pattern.name}，${pattern.desc}`,
        suitable: [],
        unsuitable: [],
        nationalAdvice: '',
        personalAdvice: '',
    };

    // 根据格局生成建议
    switch (pattern.nature) {
        case '大吉':
            advice.suitable = ['施政', '改革', '建设', '外交'];
            advice.unsuitable = ['战争', '冲突'];
            advice.nationalAdvice = '国运昌隆，适合推进重大政策和建设项目。';
            advice.personalAdvice = '个人运势良好，适合创业、投资、求学。';
            break;
        case '吉':
            advice.suitable = ['治理', '发展', '合作'];
            advice.unsuitable = ['冒进', '冒险'];
            advice.nationalAdvice = '运势平稳，适合稳步推进各项事业。';
            advice.personalAdvice = '运势稳定，适合稳步发展，不宜冒进。';
            break;
        case '凶':
            advice.suitable = ['守成', '防御', '谨慎'];
            advice.unsuitable = ['扩张', '投资', '冲突'];
            advice.nationalAdvice = '运势不稳，宜守不宜攻，防范风险。';
            advice.personalAdvice = '运势低迷，宜守不宜进，避免冒险。';
            break;
        default:
            advice.suitable = ['谋划', '准备', '观察'];
            advice.unsuitable = ['冲动', '盲动'];
            advice.nationalAdvice = '运势中平，宜静观其变，等待时机。';
            advice.personalAdvice = '运势平常，宜静观其变，不宜轻举妄动。';
    }

    return advice;
}

/* ========== 主排盘函数 ========== */

/**
 * 太乙神数排盘主函数
 * @param {number} year - 公历年份
 * @returns {Object} 排盘结果
 */
function calculateTaiyi(year) {
    // 1. 计算太乙积年
    const jiYear = calculateJiYear(year);

    // 2. 计算太乙宫位
    const taiyiPos = calculateTaiyiPosition(jiYear);

    // 3. 计算计神宫位
    const jishenPos = calculateJishenPosition(jiYear);

    // 4. 计算文昌位置
    const wenchang = calculateWenchang(jiYear);

    // 5. 计算始击位置
    const shiji = calculateShiji(jiYear);

    // 6. 计算三基位置
    const sanji = calculateSanji(jiYear);

    // 7. 计算五福位置
    const wufu = calculateWufu(jiYear);

    // 8. 判断格局
    const positions = { taiyiPos, jishenPos, wenchang, shiji, sanji, wufu };
    const pattern = identifyPattern(positions);

    // 9. 生成建议
    const advice = generateAdvice(pattern, positions);

    return {
        year,
        jiYear,
        taiyiPos,
        jishenPos,
        wenchang,
        shiji,
        sanji,
        wufu,
        pattern,
        advice,
    };
}

/* ========== 渲染函数 ========== */

/**
 * 渲染太乙神数排盘结果
 * @param {Object} result - 排盘结果
 * @returns {string} HTML 内容
 */
function renderTaiyiResult(result) {
    const {
        year, jiYear, taiyiPos, jishenPos, wenchang, shiji,
        sanji, wufu, pattern, advice
    } = result;

    // 太乙宫信息
    const taiyiPalace = TAIYI_NINE_PALACES[taiyiPos - 1];

    // 渲染三基
    const sanjiHtml = `
        <div class="taiyi-sanji">
            <div class="sanji-item junji">
                <div class="sanji-label">君基</div>
                <div class="sanji-content">${sanji.junji}</div>
                <div class="sanji-wuxing">${ZHI_WUXING[sanji.junji]}</div>
            </div>
            <div class="sanji-item chenji">
                <div class="sanji-label">臣基</div>
                <div class="sanji-content">${sanji.chenji}</div>
                <div class="sanji-wuxing">${ZHI_WUXING[sanji.chenji]}</div>
            </div>
            <div class="sanji-item minji">
                <div class="sanji-label">民基</div>
                <div class="sanji-content">${sanji.minji}</div>
                <div class="sanji-wuxing">${ZHI_WUXING[sanji.minji]}</div>
            </div>
        </div>
    `;

    // 渲染五福
    const wufuHtml = `
        <div class="taiyi-wufu">
            <div class="wufu-item">
                <div class="wufu-label">君福</div>
                <div class="wufu-content">${wufu.junfu}</div>
            </div>
            <div class="wufu-item">
                <div class="wufu-label">臣福</div>
                <div class="wufu-content">${wufu.chenfu}</div>
            </div>
            <div class="wufu-item">
                <div class="wufu-label">民福</div>
                <div class="wufu-content">${wufu.minfu}</div>
            </div>
            <div class="wufu-item">
                <div class="wufu-label">岁福</div>
                <div class="wufu-content">${wufu.suifu}</div>
            </div>
            <div class="wufu-item">
                <div class="wufu-label">月福</div>
                <div class="wufu-content">${wufu.yuefu}</div>
            </div>
        </div>
    `;

    // 渲染关键星曜
    const keyStarsHtml = `
        <div class="taiyi-key-stars">
            <div class="star-item">
                <div class="star-name">太乙</div>
                <div class="star-position">${TAIYI_NINE_PALACES[taiyiPos - 1].name}宫（${taiyiPos}宫）</div>
                <div class="star-symbol">${TAIYI_NINE_PALACES[taiyiPos - 1].symbol}</div>
            </div>
            <div class="star-item">
                <div class="star-name">计神</div>
                <div class="star-position">${jishenPos}位</div>
                <div class="star-symbol">🔮</div>
            </div>
            <div class="star-item">
                <div class="star-name">文昌</div>
                <div class="star-position">${wenchang}位</div>
                <div class="star-symbol">📚</div>
            </div>
            <div class="star-item">
                <div class="star-name">始击</div>
                <div class="star-position">${shiji}位</div>
                <div class="star-symbol">⚔️</div>
            </div>
        </div>
    `;

    return `
        <div class="taiyi-report">
            <div class="taiyi-header">
                <div class="taiyi-info">
                    <span class="taiyi-year">${year}年太乙神数排盘</span>
                    <span class="taiyi-ji">太乙积年：${jiYear}</span>
                    <span class="taiyi-pattern ${pattern.nature}">${pattern.name}</span>
                </div>
            </div>

            <div class="taiyi-section">
                <h4>⭐ 关键星曜</h4>
                ${keyStarsHtml}
            </div>

            <div class="taiyi-section">
                <h4>👑 三基</h4>
                ${sanjiHtml}
            </div>

            <div class="taiyi-section">
                <h4>🍀 五福</h4>
                ${wufuHtml}
            </div>

            <div class="taiyi-section">
                <h4>📊 格局判断</h4>
                <div class="pattern-info">
                    <div class="pattern-name">${pattern.name}</div>
                    <div class="pattern-nature ${pattern.nature}">${pattern.nature === '大吉' ? '上吉' : pattern.nature === '吉' ? '中吉' : pattern.nature === '凶' ? '凶' : '中平'}</div>
                    <div class="pattern-desc">${pattern.desc}</div>
                </div>
            </div>

            <div class="taiyi-section">
                <h4>🎯 用事建议</h4>
                <div class="advice-content">
                    <p class="advice-summary">${advice.summary}</p>
                    <div class="advice-grid">
                        <div class="advice-item ji">
                            <span class="advice-label">宜</span>
                            <span class="advice-value">${advice.suitable.join('、')}</span>
                        </div>
                        <div class="advice-item xiong">
                            <span class="advice-label">忌</span>
                            <span class="advice-value">${advice.unsuitable.join('、')}</span>
                        </div>
                    </div>
                    <div class="advice-detail">
                        <p><strong>国运：</strong>${advice.nationalAdvice}</p>
                        <p><strong>个人：</strong>${advice.personalAdvice}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* ========== 初始化函数 ========== */

/**
 * 初始化太乙神数模块
 */
function initTaiyiModule() {
    const btnCalculate = document.getElementById('btnCalculateTaiyi');
    if (!btnCalculate) return;

    btnCalculate.addEventListener('click', () => {
        const yearInput = document.getElementById('taiyiYear');
        const year = yearInput ? parseInt(yearInput.value) : new Date().getFullYear();

        if (!year || year < 1900 || year > 2100) {
            alert('请输入有效的年份（1900-2100）');
            return;
        }

        // 显示结果卡片
        const resultCard = document.getElementById('taiyiResultCard');
        if (resultCard) {
            resultCard.style.display = 'block';
        }

        // 显示加载状态
        const resultEl = document.getElementById('taiyiResultBody');
        if (resultEl) {
            resultEl.innerHTML = `
                <div class="bazi-report-loading">
                    <div class="skeleton-card">
                        <div class="skeleton-pulse skeleton-block w40"></div>
                        <div class="skeleton-pulse skeleton-block"></div>
                        <div class="skeleton-pulse skeleton-block w80"></div>
                    </div>
                </div>
            `;
        }

        // 延迟执行，让加载动画显示
        setTimeout(() => {
            try {
                const result = calculateTaiyi(year);
                const html = renderTaiyiResult(result);

                if (resultEl) {
                    resultEl.innerHTML = html;
                }

                showToast('太乙神数排盘完成！', 2000);
            } catch (err) {
                console.error('太乙神数排盘失败:', err);
                if (resultEl) {
                    resultEl.innerHTML = `<div style="text-align:center;padding:40px;color:#e86b6b;"><i class="fa-solid fa-exclamation-triangle" style="font-size:2rem;margin-bottom:12px;"></i><p>排盘失败，请重试</p></div>`;
                }
                showToast('排盘失败，请重试', 2000);
            }
        }, 500);
    });
}

/* ========== 导出 ========== */
export {
    initTaiyiModule,
    calculateTaiyi,
    renderTaiyiResult,
    TAIYI_NINE_PALACES,
    SANJI,
    WUFU,
    SIXTEEN_PALACES,
};
