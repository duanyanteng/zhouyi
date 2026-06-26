/**
 * 乾坤易道 - 大六壬模块
 * @module liuren
 * @description 实现大六壬排盘，包括月将、贵人、四课、三传、格局判断
 */

import { showToast } from './utils.js?20260626-4';
import { exportToPDF, formatDate, generateShareLink } from './export.js?20260626-4';

/* ========== 六壬核心数据 ========== */

/** 十二天将 */
const TWELVE_GENERALS = [
    { name: '贵人', wuxing: '土', nature: '吉', symbol: '👑', desc: '主权威、贵人、化解' },
    { name: '腾蛇', wuxing: '火', nature: '凶', symbol: '🐍', desc: '主惊恐、怪异、虚假' },
    { name: '朱雀', wuxing: '火', nature: '凶', symbol: '🐦', desc: '主口舌、文书、消息' },
    { name: '六合', wuxing: '木', nature: '吉', symbol: '🤝', desc: '主合作、婚姻、交易' },
    { name: '勾陈', wuxing: '土', nature: '凶', symbol: '⚔️', desc: '主田土、牢狱、争斗' },
    { name: '青龙', wuxing: '木', nature: '吉', symbol: '🐲', desc: '主财富、喜庆、官运' },
    { name: '天空', wuxing: '土', nature: '凶', symbol: '☁️', desc: '主空亡、欺骗、虚无' },
    { name: '白虎', wuxing: '金', nature: '凶', symbol: '🐯', desc: '主凶伤、丧事、血光' },
    { name: '太常', wuxing: '土', nature: '吉', symbol: '🎭', desc: '主饮食、宴会、衣服' },
    { name: '玄武', wuxing: '水', nature: '凶', symbol: '🐢', desc: '主盗贼、暗昧、欺骗' },
    { name: '太阴', wuxing: '金', nature: '吉', symbol: '🌙', desc: '主阴私、暗助、密谋' },
    { name: '天后', wuxing: '水', nature: '吉', symbol: '👸', desc: '主婚姻、女人、贵人' },
];

/** 十二地支 */
const TWELVE_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 地支五行 */
const ZHI_WUXING = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

/** 地支阴阳 */
const ZHI_YINYANG = {
    '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴',
    '辰': '阳', '巳': '阴', '午': '阳', '未': '阴',
    '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴',
};

/** 月将表（根据节气） */
const MONTH_GENERALS = {
    1: '子',   // 大寒后用子将
    2: '亥',   // 雨水后用亥将
    3: '戌',   // 春分后用戌将
    4: '酉',   // 谷雨后用酉将
    5: '申',   // 小满后用申将
    6: '未',   // 夏至后用未将
    7: '午',   // 大暑后用午将
    8: '巳',   // 处暑后用巳将
    9: '辰',   // 秋分后用辰将
    10: '卯',  // 霜降后用卯将
    11: '寅',  // 小雪后用寅将
    12: '丑',  // 冬至后用丑将
};

/** 贵人诀（根据日干） */
const NOBLE_PERSON_TABLE = {
    '甲': { day: '丑', night: '未' },
    '戊': { day: '丑', night: '未' },
    '庚': { day: '丑', night: '未' },
    '乙': { day: '子', night: '申' },
    '己': { day: '子', night: '申' },
    '丙': { day: '亥', night: '酉' },
    '丁': { day: '亥', night: '酉' },
    '壬': { day: '卯', night: '巳' },
    '癸': { day: '卯', night: '巳' },
    '辛': { day: '午', night: '寅' },
};

/** 四课格局 */
const FOUR_LESSON_PATTERNS = [
    { name: '贼克课', condition: '上克下', desc: '主取用、获取、进取' },
    { name: '比用课', condition: '比和', desc: '主比较、选择、等待' },
    { name: '涉害课', condition: '涉险', desc: '主艰难、曲折、多阻' },
    { name: '遥克课', condition: '远克', desc: '主远程、间接、延迟' },
    { name: '昴星课', condition: '昴星', desc: '主暗昧、阴私、不明' },
    { name: '别责课', condition: '别责', desc: '主分离、独立、特殊' },
    { name: '八专课', condition: '八专', desc: '主专一、固执、不变' },
    { name: '伏吟课', condition: '伏吟', desc: '主停滞、不顺、拖延' },
    { name: '返吟课', condition: '返吟', desc: '主反复、变动、不稳定' },
];

/** 三传格局 */
const THREE_TRANS_PATTERNS = [
    { name: '进茹格', desc: '主进取、发展、上升' },
    { name: '退茹格', desc: '主退守、收敛、下降' },
    { name: '间传格', desc: '主间隔、曲折、延迟' },
    { name: '顺三传', desc: '主顺利、通达、吉庆' },
    { name: '逆三传', desc: '主逆行、阻碍、不顺' },
];

/* ========== 六壬排盘算法 ========== */

/**
 * 获取月将
 * @param {number} month - 月份（1-12）
 * @returns {string} 月将地支
 */
function getMonthGeneral(month) {
    return MONTH_GENERALS[month] || '子';
}

/**
 * 获取贵人位置
 * @param {string} dayGan - 日干
 * @param {number} hour - 时辰（0-23）
 * @returns {string} 贵人所在地支
 */
function getNoblePerson(dayGan, hour) {
    const rule = NOBLE_PERSON_TABLE[dayGan];
    if (!rule) return '丑';

    // 6-18点为昼，其余为夜
    const isDay = hour >= 6 && hour < 18;
    return isDay ? rule.day : rule.night;
}

/**
 * 排布天盘（十二天将）
 * @param {string} nobleZhi - 贵人所在地支
 * @param {boolean} isDay - 是否为昼
 * @returns {Object} 天盘排布
 */
function arrangeHeavenPlate(nobleZhi, isDay) {
    const plate = {};
    const nobleIndex = TWELVE_ZHI.indexOf(nobleZhi);

    // 根据昼夜确定排列方向
    // 昼顺夜逆
    for (let i = 0; i < 12; i++) {
        const general = TWELVE_GENERALS[i];
        let zhiIndex;

        if (isDay) {
            zhiIndex = (nobleIndex + i) % 12;
        } else {
            zhiIndex = (nobleIndex - i + 12) % 12;
        }

        plate[TWELVE_ZHI[zhiIndex]] = general;
    }

    return plate;
}

/**
 * 排布地盘
 * @returns {Object} 地盘排布（固定）
 */
function arrangeEarthPlate() {
    const plate = {};
    TWELVE_ZHI.forEach(zhi => {
        plate[zhi] = { name: zhi, wuxing: ZHI_WUXING[zhi], yinyang: ZHI_YINYANG[zhi] };
    });
    return plate;
}

/**
 * 排布四课
 * @param {string} dayGan - 日干
 * @param {string} dayZhi - 日支
 * @param {Object} heavenPlate - 天盘
 * @returns {Object} 四课排布
 */
function arrangeFourLessons(dayGan, dayZhi, heavenPlate) {
    // 第一课：日干 -> 干上神
    const ganShangShen = heavenPlate[dayGan] || dayGan;

    // 第二课：干上神 -> 干上神的上神
    const ganShangShenShang = heavenPlate[ganShangShen] || ganShangShen;

    // 第三课：日支 -> 支上神
    const zhiShangShen = heavenPlate[dayZhi] || dayZhi;

    // 第四课：支上神 -> 支上神的上神
    const zhiShangShenShang = heavenPlate[zhiShangShen] || zhiShangShen;

    return {
        lesson1: { base: dayGan, top: ganShangShen },
        lesson2: { base: ganShangShen, top: ganShangShenShang },
        lesson3: { base: dayZhi, top: zhiShangShen },
        lesson4: { base: zhiShangShen, top: zhiShangShenShang },
    };
}

/**
 * 起三传
 * @param {Object} fourLessons - 四课
 * @param {Object} heavenPlate - 天盘
 * @returns {Object} 三传排布
 */
function getThreeTransmission(fourLessons, heavenPlate) {
    // 简化版：取四课中的关键地支
    const { lesson1, lesson2, lesson3, lesson4 } = fourLessons;

    // 初传：取干上神
    const chu = lesson1.top;

    // 中传：取支上神
    const zhong = lesson3.top;

    // 末传：取初传的上神
    const mo = heavenPlate[chu] || chu;

    return { chu, zhong, mo };
}

/**
 * 判断课体格局
 * @param {Object} fourLessons - 四课
 * @param {Object} threeTrans - 三传
 * @returns {Object} 格局信息
 */
function identifyPattern(fourLessons, threeTrans) {
    // 简化版：根据四课关系判断
    const { lesson1, lesson2, lesson3, lesson4 } = fourLessons;

    // 检查是否伏吟（上下相同）
    if (lesson1.base === lesson1.top &&
        lesson2.base === lesson2.top &&
        lesson3.base === lesson3.top &&
        lesson4.base === lesson4.top) {
        return FOUR_LESSON_PATTERNS.find(p => p.name === '伏吟课');
    }

    // 检查是否返吟（上下相冲）
    const zhiPairs = { '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥' };
    const isFanYin = Object.entries(zhiPairs).some(([a, b]) =>
        (lesson1.base === a && lesson1.top === b) ||
        (lesson1.base === b && lesson1.top === a)
    );
    if (isFanYin) {
        return FOUR_LESSON_PATTERNS.find(p => p.name === '返吟课');
    }

    // 默认为贼克课
    return FOUR_LESSON_PATTERNS[0];
}

/**
 * 生成用事建议
 * @param {Object} pattern - 格局
 * @param {Object} threeTrans - 三传
 * @returns {Object} 用事建议
 */
function generateAdvice(pattern, threeTrans) {
    const advice = {
        summary: `本课为${pattern.name}，${pattern.desc}。`,
        suitable: [],
        unsuitable: [],
        timeAdvice: '',
    };

    // 根据格局生成建议
    switch (pattern.name) {
        case '贼克课':
            advice.suitable = ['求财', '谋事', '进取'];
            advice.unsuitable = ['守成', '等待'];
            advice.timeAdvice = '宜主动出击，把握时机。';
            break;
        case '伏吟课':
            advice.suitable = ['守成', '静待', '学习'];
            advice.unsuitable = ['进取', '变动', '投资'];
            advice.timeAdvice = '宜静不宜动，耐心等待。';
            break;
        case '返吟课':
            advice.suitable = ['变动', '出行', '改革'];
            advice.unsuitable = ['固守', '签约', '投资'];
            advice.timeAdvice = '事多反复，宜灵活应对。';
            break;
        default:
            advice.suitable = ['谋划', '准备', '考察'];
            advice.unsuitable = ['冲动', '冒险'];
            advice.timeAdvice = '谨慎行事，稳中求进。';
    }

    return advice;
}

/* ========== 主排盘函数 ========== */

/**
 * 大六壬排盘主函数
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {number} day - 日期
 * @param {number} hour - 时辰（0-23）
 * @returns {Object} 排盘结果
 */
function calculateLiuren(year, month, day, hour) {
    // 1. 获取月将
    const monthGeneral = getMonthGeneral(month);

    // 2. 获取日干支（简化：使用 lunar-javascript）
    let dayGan = '甲', dayZhi = '子';
    try {
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        const dayGz = lunar.getDayGanZhi();
        dayGan = dayGz[0];
        dayZhi = dayGz[1];
    } catch (e) {
        console.warn('获取日干支失败，使用默认值');
    }

    // 3. 获取贵人
    const noblePerson = getNoblePerson(dayGan, hour);

    // 4. 判断昼夜
    const isDay = hour >= 6 && hour < 18;

    // 5. 排布天盘
    const heavenPlate = arrangeHeavenPlate(noblePerson, isDay);

    // 6. 排布地盘
    const earthPlate = arrangeEarthPlate();

    // 7. 排布四课
    const fourLessons = arrangeFourLessons(dayGan, dayZhi, heavenPlate);

    // 8. 起三传
    const threeTransmission = getThreeTransmission(fourLessons, heavenPlate);

    // 9. 判断格局
    const pattern = identifyPattern(fourLessons, threeTransmission);

    // 10. 生成建议
    const advice = generateAdvice(pattern, threeTransmission);

    return {
        year, month, day, hour,
        dayGan, dayZhi,
        monthGeneral,
        noblePerson,
        isDay,
        heavenPlate,
        earthPlate,
        fourLessons,
        threeTransmission,
        pattern,
        advice,
    };
}

/* ========== 渲染函数 ========== */

/**
 * 渲染六壬排盘结果
 * @param {Object} result - 排盘结果
 * @returns {string} HTML 内容
 */
function renderLiurenResult(result) {
    const {
        dayGan, dayZhi, monthGeneral, noblePerson, isDay,
        heavenPlate, fourLessons, threeTransmission, pattern, advice
    } = result;

    // 渲染四课表格
    const fourLessonsHtml = `
        <div class="liuren-four-lessons">
            <div class="lesson-item">
                <div class="lesson-label">第一课</div>
                <div class="lesson-content">
                    <span class="lesson-base">${fourLessons.lesson1.base}</span>
                    <span class="lesson-arrow">→</span>
                    <span class="lesson-top">${fourLessons.lesson1.top}</span>
                </div>
            </div>
            <div class="lesson-item">
                <div class="lesson-label">第二课</div>
                <div class="lesson-content">
                    <span class="lesson-base">${fourLessons.lesson2.base}</span>
                    <span class="lesson-arrow">→</span>
                    <span class="lesson-top">${fourLessons.lesson2.top}</span>
                </div>
            </div>
            <div class="lesson-item">
                <div class="lesson-label">第三课</div>
                <div class="lesson-content">
                    <span class="lesson-base">${fourLessons.lesson3.base}</span>
                    <span class="lesson-arrow">→</span>
                    <span class="lesson-top">${fourLessons.lesson3.top}</span>
                </div>
            </div>
            <div class="lesson-item">
                <div class="lesson-label">第四课</div>
                <div class="lesson-content">
                    <span class="lesson-base">${fourLessons.lesson4.base}</span>
                    <span class="lesson-arrow">→</span>
                    <span class="lesson-top">${fourLessons.lesson4.top}</span>
                </div>
            </div>
        </div>
    `;

    // 渲染三传
    const threeTransHtml = `
        <div class="liuren-three-trans">
            <div class="trans-item chu">
                <div class="trans-label">初传</div>
                <div class="trans-content">${threeTransmission.chu}</div>
            </div>
            <div class="trans-item zhong">
                <div class="trans-label">中传</div>
                <div class="trans-content">${threeTransmission.zhong}</div>
            </div>
            <div class="trans-item mo">
                <div class="trans-label">末传</div>
                <div class="trans-content">${threeTransmission.mo}</div>
            </div>
        </div>
    `;

    // 渲染天将表格
    const heavenPlateHtml = `
        <div class="liuren-heaven-plate">
            ${TWELVE_ZHI.map(zhi => {
                const general = heavenPlate[zhi];
                return `
                    <div class="heaven-cell">
                        <div class="heaven-zhi">${zhi}</div>
                        <div class="heaven-general ${general.nature}">${general.symbol} ${general.name}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    return `
        <div class="liuren-report">
            <div class="liuren-header">
                <div class="liuren-info">
                    <span class="liuren-day">日干支：${dayGan}${dayZhi}</span>
                    <span class="liuren-month">月将：${monthGeneral}</span>
                    <span class="liuren-noble">贵人：${noblePerson}</span>
                    <span class="liuren-time">${isDay ? '昼' : '夜'}占</span>
                </div>
            </div>

            <div class="liuren-section">
                <h4>📊 四课排布</h4>
                ${fourLessonsHtml}
            </div>

            <div class="liuren-section">
                <h4>📈 三传</h4>
                ${threeTransHtml}
            </div>

            <div class="liuren-section">
                <h4>⭐ 格局判断</h4>
                <div class="pattern-info">
                    <div class="pattern-name">${pattern.name}</div>
                    <div class="pattern-desc">${pattern.desc}</div>
                </div>
            </div>

            <div class="liuren-section">
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
                    <p class="advice-time">${advice.timeAdvice}</p>
                </div>
            </div>

            <div class="liuren-section">
                <h4>🌌 天盘</h4>
                ${heavenPlateHtml}
            </div>
        </div>
    `;
}

/* ========== 初始化函数 ========== */

/**
 * 初始化六壬模块
 */
function initLiurenModule() {
    const btnCalculate = document.getElementById('btnCalculateLiuren');
    if (!btnCalculate) return;

    btnCalculate.addEventListener('click', () => {
        const dateVal = document.getElementById('liurenDate')?.value;

        if (!dateVal) {
            alert('请选择准确的占卜时辰！');
            return;
        }

        const date = new Date(dateVal);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();

        // 显示结果卡片
        const resultCard = document.getElementById('liurenResultCard');
        if (resultCard) {
            resultCard.style.display = 'block';
        }

        // 显示加载状态
        const resultEl = document.getElementById('liurenResultBody');
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
                const result = calculateLiuren(year, month, day, hour);
                const html = renderLiurenResult(result);

                if (resultEl) {
                    resultEl.innerHTML = html;
                }

                // 注入上下文到 AI
                document.dispatchEvent(new CustomEvent('liuren-analysis-complete', {
                    detail: result
                }));

                showToast('大六壬排盘完成！', 2000);
            } catch (err) {
                console.error('大六壬排盘失败:', err);
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
    initLiurenModule,
    calculateLiuren,
    renderLiurenResult,
    TWELVE_GENERALS,
    TWELVE_ZHI,
    ZHI_WUXING,
    NOBLE_PERSON_TABLE,
};
