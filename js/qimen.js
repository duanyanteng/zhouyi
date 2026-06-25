/**
 * 乾坤易道 - 奇门遁甲模块
 * @module qimen
 * @description 实现时家奇门遁甲排盘，包括天地人神四盘、格局判断、用事建议
 */

import { showToast } from './utils.js?v=20260624-1';
import { exportToPDF, formatDate, generateShareLink } from './export.js?v=20260624-1';

/* ========== 奇门遁甲核心数据 ========== */

/** 九星 */
const NINE_STARS = [
    { name: '天蓬', wuxing: '水', nature: '凶', palace: 1, desc: '主盗贼、暗昧、贪婪。宜安守，忌远行。' },
    { name: '天芮', wuxing: '土', nature: '凶', palace: 2, desc: '主疾病、灾厄、阴邪。宜治病，忌动土。' },
    { name: '天冲', wuxing: '木', nature: '吉', palace: 3, desc: '主勇敢、冲动、开创。宜征伐，忌守旧。' },
    { name: '天辅', wuxing: '木', nature: '吉', palace: 4, desc: '主文化、教育、辅佐。宜求学，忌争斗。' },
    { name: '天禽', wuxing: '土', nature: '大吉', palace: 5, desc: '主中央、统领、镇压。宜祭祀，诸事皆吉。' },
    { name: '天心', wuxing: '金', nature: '大吉', palace: 6, desc: '主领导、决策、医药。宜求医，百事皆宜。' },
    { name: '天柱', wuxing: '金', nature: '凶', palace: 7, desc: '主口舌、惊恐、毁折。宜守成，忌远行。' },
    { name: '天任', wuxing: '土', nature: '吉', palace: 8, desc: '主财富、稳重、田宅。宜置业，诸事皆吉。' },
    { name: '天英', wuxing: '火', nature: '中', palace: 9, desc: '主文化、名声、文书。宜谒贵，忌争讼。' },
];

/** 八门 */
const EIGHT_DOORS = [
    { name: '休门', wuxing: '水', nature: '吉', palace: 1, desc: '主休息、安逸、婚姻。宜见贵、嫁娶，百事皆吉。' },
    { name: '死门', wuxing: '土', nature: '大凶', palace: 2, desc: '主死亡、终结、丧事。宜吊丧、埋葬，余事皆凶。' },
    { name: '伤门', wuxing: '木', nature: '凶', palace: 3, desc: '主伤害、损失、争斗。宜讨债、捕盗，余事皆凶。' },
    { name: '杜门', wuxing: '木', nature: '中', palace: 4, desc: '主隐藏、闭塞、保密。宜躲灾、避难，忌远行。' },
    { name: '中宫', wuxing: '土', nature: '大吉', palace: 5, desc: '主中央、统领。通常不直接使用。' },
    { name: '开门', wuxing: '金', nature: '大吉', palace: 6, desc: '主开始、顺利、开业。宜开业、出行，百事皆吉。' },
    { name: '惊门', wuxing: '金', nature: '凶', palace: 7, desc: '主惊恐、口舌、诉讼。宜捉贼、诉讼，余事皆凶。' },
    { name: '生门', wuxing: '土', nature: '大吉', palace: 8, desc: '主财富、生机、置业。宜求财、置业，百事皆吉。' },
    { name: '景门', wuxing: '火', nature: '中', palace: 9, desc: '主文书、考试、宴席。宜献策、考试，忌出征。' },
];

/** 八神 */
const EIGHT_SPIRITS = [
    { name: '值符', nature: '大吉', desc: '主权威、领导、贵人。为八神之首，诸事皆吉。' },
    { name: '腾蛇', nature: '凶', desc: '主惊恐、怪异、虚假。遇事多变，防欺骗。' },
    { name: '太阴', nature: '吉', desc: '主阴私、暗助、密谋。宜密谋策划，暗中有贵人。' },
    { name: '六合', nature: '大吉', desc: '主合作、婚姻、交易。宜合作、嫁娶，诸事皆吉。' },
    { name: '白虎', nature: '大凶', desc: '主凶伤、丧事、血光。诸事皆凶，宜守不宜动。' },
    { name: '玄武', nature: '凶', desc: '主盗贼、暗昧、欺骗。防失盗、欺骗，忌投资。' },
    { name: '九地', nature: '吉', desc: '主稳定、厚德、守成。宜守成、置业，诸事平稳。' },
    { name: '九天', nature: '吉', desc: '主高远、腾飞、扩张。宜进取、扩张，大展宏图。' },
];

/** 九宫方位 */
const NINE_PALACES = [
    { number: 1, name: '坎一宫', direction: '北', wuxing: '水', position: 'bottom' },
    { number: 2, name: '坤二宫', direction: '西南', wuxing: '土', position: 'bottom-left' },
    { number: 3, name: '震三宫', direction: '东', wuxing: '木', position: 'left' },
    { number: 4, name: '巽四宫', direction: '东南', wuxing: '木', position: 'top-left' },
    { number: 5, name: '中五宫', direction: '中', wuxing: '土', position: 'center' },
    { number: 6, name: '乾六宫', direction: '西北', wuxing: '金', position: 'top-right' },
    { number: 7, name: '兑七宫', direction: '西', wuxing: '金', position: 'right' },
    { number: 8, name: '艮八宫', direction: '东北', wuxing: '土', position: 'bottom-right' },
    { number: 9, name: '离九宫', direction: '南', wuxing: '火', position: 'top' },
];

/** 十天干 */
const TEN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 十二地支 */
const TWELVE_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 三奇六仪 */
const SANQI_LIUYI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

/** 阳遁局数（冬至后用阳遁） */
const YANG_DUN_JU = {
    1: { star: 1, door: 1, start: '坎一宫' },
    2: { star: 2, door: 2, start: '坤二宫' },
    3: { star: 3, door: 3, start: '震三宫' },
    4: { star: 4, door: 4, start: '巽四宫' },
    5: { star: 5, door: 5, start: '中五宫' },
    6: { star: 6, door: 6, start: '乾六宫' },
    7: { star: 7, door: 7, start: '兑七宫' },
    8: { star: 8, door: 8, start: '艮八宫' },
    9: { star: 9, door: 9, start: '离九宫' },
};

/** 阴遁局数（夏至后用阴遁） */
const YIN_DUN_JU = {
    1: { star: 1, door: 1, start: '坎一宫' },
    2: { star: 2, door: 2, start: '坤二宫' },
    3: { star: 3, door: 3, start: '震三宫' },
    4: { star: 4, door: 4, start: '巽四宫' },
    5: { star: 5, door: 5, start: '中五宫' },
    6: { star: 6, door: 6, start: '乾六宫' },
    7: { star: 7, door: 7, start: '兑七宫' },
    8: { star: 8, door: 8, start: '艮八宫' },
    9: { star: 9, door: 9, start: '离九宫' },
};

/** 吉格 */
const AUSPICIOUS_PATTERNS = [
    { name: '天遁', condition: '天盘丙奇，地盘生门', desc: '主万事顺利，贵人相助，利于求财、升迁。' },
    { name: '地遁', condition: '天盘乙奇，地盘开门', desc: '主土地、房产之事顺利，利于置业、安葬。' },
    { name: '人遁', condition: '天盘丁奇，地盘休门', desc: '主婚姻、合作之事顺利，利于嫁娶、交易。' },
    { name: '龙遁', condition: '天盘乙奇，地盘天辅', desc: '主学业、文化之事顺利，利于考试、文书。' },
    { name: '虎遁', condition: '天盘辛奇，地盘天心', desc: '主军事、征伐之事顺利，利于捕盗、诉讼。' },
    { name: '风遁', condition: '天盘丙奇，地盘景门', desc: '主名声、传播之事顺利，利于宣传、出行。' },
    { name: '云遁', condition: '天盘乙奇，地盘杜门', desc: '主隐遁、密谋之事顺利，利于保密、躲灾。' },
    { name: '神遁', condition: '天盘丁奇，地盘生门', desc: '主祭祀、祈福之事顺利，利于求神、许愿。' },
];

/** 凶格 */
const INAUSPICIOUS_PATTERNS = [
    { name: '悖格', condition: '天盘庚加地盘丙', desc: '主灾祸、官非、破财。诸事皆凶，宜守不宜动。' },
    { name: '飞格', condition: '天盘庚加地盘丁', desc: '主官灾、口舌、文书错误。忌签合同、诉讼。' },
    { name: '伏格', condition: '天盘庚加地盘癸', desc: '主疾病、暗昧、不顺。忌出行、投资。' },
    { name: '反吟', condition: '天盘与地盘相冲', desc: '主反复、变动、不稳定。事多反复，宜静不宜动。' },
    { name: '伏吟', condition: '天盘与地盘相同', desc: '主停滞、不顺、拖延。事多拖延，宜守不宜进。' },
    { name: '六仪击刑', condition: '六仪落于刑地', desc: '主刑伤、灾祸。诸事不顺，防血光之灾。' },
    { name: '五不遇时', condition: '时干克日干', desc: '主不顺、阻碍。所求之事多有阻碍。' },
    { name: '入墓', condition: '三奇六仪入墓', desc: '主暗昧、困顿。做事不明，难以突破。' },
];

/* ========== 奇门遁甲排盘算法 ========== */

/**
 * 获取节气信息（简化版，实际应使用精确天文算法）
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {number} day - 日期
 * @returns {Object} 节气信息
 */
function getSolarTerm(year, month, day) {
    // 简化版节气计算，实际应使用天文算法
    // 这里使用近似值
    const jieqiTable = {
        1: [6, 20],   // 小寒、大寒
        2: [4, 19],   // 立春、雨水
        3: [6, 21],   // 惊蛰、春分
        4: [5, 20],   // 清明、谷雨
        5: [6, 21],   // 立夏、小满
        3: [6, 21],   // 芒种、夏至
        7: [7, 23],   // 小暑、大暑
        8: [7, 23],   // 立秋、处暑
        9: [8, 23],   // 白露、秋分
        10: [8, 23],  // 寒露、霜降
        11: [7, 22],  // 立冬、小雪
        12: [7, 22],  // 大雪、冬至
    };

    const dates = jieqiTable[month] || [15, 30];

    if (day < dates[0]) {
        return { name: '上半月', isYang: month >= 1 && month <= 6 ? true : false };
    } else {
        return { name: '下半月', isYang: month >= 1 && month <= 6 ? true : false };
    }
}

/**
 * 判断阴阳遁
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {number} day - 日期
 * @returns {string} '阳遁' 或 '阴遁'
 */
function determineDunType(year, month, day) {
    // 冬至后用阳遁，夏至后用阴遁
    // 简化版：根据月份判断
    if (month >= 1 && month <= 6) {
        return '阳遁';
    } else {
        return '阴遁';
    }
}

/**
 * 计算局数
 * @param {string} dunType - 阴阳遁类型
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {number} day - 日期
 * @param {number} hour - 时辰（0-23）
 * @returns {number} 局数（1-9）
 */
function calculateJuNumber(dunType, year, month, day, hour) {
    // 使用日干支计算局数（简化版）
    // 实际应根据节气和日干支精确计算

    // 简化算法：使用日期的数字组合
    const dayNum = (month + day) % 9;
    const ju = dayNum === 0 ? 9 : dayNum;

    return ju;
}

/**
 * 计算值符（天盘九星的首领）
 * @param {string} dunType - 阴阳遁类型
 * @param {number} ju - 局数
 * @param {number} hourGanIndex - 时干序号（0-9）
 * @returns {Object} 值符信息
 */
function calculateZhiFu(dunType, ju, hourGanIndex) {
    // 值符根据时干和局数确定
    const starIndex = ((ju - 1 + hourGanIndex) % 9);
    return NINE_STARS[starIndex];
}

/**
 * 计算值使（人盘八门的首领）
 * @param {string} dunType - 阴阳遁类型
 * @param {number} ju - 局数
 * @param {number} hourGanIndex - 时干序号（0-9）
 * @returns {Object} 值使信息
 */
function calculateZhiShi(dunType, ju, hourGanIndex) {
    // 值使根据时干和局数确定
    // EIGHT_DOORS 有 9 个元素（0-8），所以用 % 9
    const doorIndex = ((ju - 1 + hourGanIndex) % 9);
    return EIGHT_DOORS[doorIndex];
}

/**
 * 排布天盘（九星）
 * @param {string} dunType - 阴阳遁类型
 * @param {number} ju - 局数
 * @param {Object} zhiFu - 值符
 * @returns {Array} 天盘九星在九宫的分布
 */
function arrangeHeavenPlate(dunType, ju, zhiFu) {
    const plate = new Array(9);
    const startPalace = ju - 1;

    // 根据阴阳遁确定排列方向
    for (let i = 0; i < 9; i++) {
        let palaceIndex;
        if (dunType === '阳遁') {
            palaceIndex = (startPalace + i) % 9;
        } else {
            palaceIndex = (startPalace - i + 9) % 9;
        }
        plate[palaceIndex] = NINE_STARS[i];
    }

    return plate;
}

/**
 * 排布地盘（三奇六仪）
 * @param {string} dunType - 阴阳遁类型
 * @param {number} ju - 局数
 * @returns {Array} 地盘三奇六仪在九宫的分布
 */
function arrangeEarthPlate(dunType, ju) {
    const plate = new Array(9);
    const startPalace = ju - 1;

    for (let i = 0; i < 9; i++) {
        let palaceIndex;
        if (dunType === '阳遁') {
            palaceIndex = (startPalace + i) % 9;
        } else {
            palaceIndex = (startPalace - i + 9) % 9;
        }
        plate[palaceIndex] = SANQI_LIUYI[i];
    }

    return plate;
}

/**
 * 排布人盘（八门）
 * @param {string} dunType - 阴阳遁类型
 * @param {number} ju - 局数
 * @param {Object} zhiShi - 值使
 * @returns {Array} 人盘八门在九宫的分布
 */
function arrangeHumanPlate(dunType, ju, zhiShi) {
    const plate = new Array(9);
    const startPalace = ju - 1;

    // EIGHT_DOORS 有 9 个元素，所以循环 9 次
    for (let i = 0; i < 9; i++) {
        let palaceIndex;
        if (dunType === '阳遁') {
            palaceIndex = (startPalace + i) % 9;
        } else {
            palaceIndex = (startPalace - i + 9) % 9;
        }
        plate[palaceIndex] = EIGHT_DOORS[i];
    }

    return plate;
}

/**
 * 排布神盘（八神）
 * @param {Object} zhiFu - 值符
 * @returns {Array} 神盘八神在九宫的分布
 */
function arrangeSpiritPlate(zhiFu) {
    const plate = new Array(9);
    const startPalace = (zhiFu.palace - 1 + 9) % 9;

    // 八神只有 8 个，但要分布在 9 个宫位
    // 值符所在宫位放值符，其他按顺序排列
    for (let i = 0; i < 9; i++) {
        const palaceIndex = (startPalace + i) % 9;
        if (i < 8) {
            plate[palaceIndex] = EIGHT_SPIRITS[i];
        } else {
            // 第 9 个宫位没有神，留空
            plate[palaceIndex] = null;
        }
    }

    return plate;
}

/**
 * 判断格局
 * @param {Array} heavenPlate - 天盘
 * @param {Array} earthPlate - 地盘
 * @param {Array} humanPlate - 人盘
 * @returns {Array} 格局列表
 */
function identifyPatterns(heavenPlate, earthPlate, humanPlate) {
    const patterns = [];

    // 遍历九宫，检查天盘和地盘的组合
    for (let i = 0; i < 9; i++) {
        const heaven = heavenPlate[i];
        const earth = earthPlate[i];
        const human = humanPlate[i];

        if (!heaven || !earth || !human) continue;

        // 检查吉格
        for (const pattern of AUSPICIOUS_PATTERNS) {
            if (checkPatternCondition(pattern, heaven, earth, human)) {
                patterns.push({
                    ...pattern,
                    palace: i + 1,
                    palaceName: NINE_PALACES[i].name,
                    type: '吉格'
                });
            }
        }

        // 检查凶格
        for (const pattern of INAUSPICIOUS_PATTERNS) {
            if (checkPatternCondition(pattern, heaven, earth, human)) {
                patterns.push({
                    ...pattern,
                    palace: i + 1,
                    palaceName: NINE_PALACES[i].name,
                    type: '凶格'
                });
            }
        }
    }

    return patterns;
}

/**
 * 检查格局条件（简化版）
 * @param {Object} pattern - 格局定义
 * @param {Object} heaven - 天盘星
 * @param {Object} earth - 地盘仪
 * @param {Object} human - 人盘门
 * @returns {boolean} 是否满足条件
 */
function checkPatternCondition(pattern, heaven, earth, human) {
    // 简化版条件检查
    // 实际应根据格局的具体条件精确判断

    if (pattern.name === '天遁') {
        return heaven.name === '天心' && human.name === '生门';
    }
    if (pattern.name === '地遁') {
        return heaven.name === '天辅' && human.name === '开门';
    }
    if (pattern.name === '人遁') {
        return heaven.name === '天任' && human.name === '休门';
    }
    if (pattern.name === '悖格') {
        return earth === '庚' && heaven.name === '天英';
    }

    return false;
}

/**
 * 生成用事建议
 * @param {Array} patterns - 格局列表
 * @param {string} dunType - 阴阳遁类型
 * @param {number} ju - 局数
 * @returns {Object} 用事建议
 */
function generateAdvice(patterns, dunType, ju) {
    const advice = {
        summary: '',
        suitable: [],
        unsuitable: [],
        directions: {
            good: [],
            bad: [],
        },
        timeAdvice: '',
    };

    // 根据格局生成建议
    const auspiciousCount = patterns.filter(p => p.type === '吉格').length;
    const inauspiciousCount = patterns.filter(p => p.type === '凶格').length;

    if (auspiciousCount > inauspiciousCount) {
        advice.summary = `本局为${dunType}${ju}局，格局多吉，利于进取。`;
        advice.suitable = ['开业', '求财', '出行', '嫁娶', '签约'];
        advice.unsuitable = ['动土', '安葬'];
    } else if (inauspiciousCount > auspiciousCount) {
        advice.summary = `本局为${dunType}${ju}局，格局多凶，宜守不宜动。`;
        advice.suitable = ['守成', '静养', '学习'];
        advice.unsuitable = ['开业', '出行', '投资', '争讼'];
    } else {
        advice.summary = `本局为${dunType}${ju}局，吉凶参半，谨慎行事。`;
        advice.suitable = ['谋划', '准备', '考察'];
        advice.unsuitable = ['冲动', '冒险'];
    }

    // 方位建议
    advice.directions.good = ['生门方位', '开门方位'];
    advice.directions.bad = ['死门方位', '伤门方位'];

    // 时间建议
    advice.timeAdvice = '宜选择吉时行动，避开凶时。';

    return advice;
}

/* ========== 主排盘函数 ========== */

/**
 * 奇门遁甲排盘主函数
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @param {number} day - 日期
 * @param {number} hour - 时辰（0-23）
 * @returns {Object} 排盘结果
 */
function calculateQimen(year, month, day, hour) {
    try {
        console.log('奇门遁甲排盘开始:', { year, month, day, hour });

        // 1. 判断阴阳遁
        const dunType = determineDunType(year, month, day);
        console.log('阴阳遁:', dunType);

        // 2. 计算局数
        const ju = calculateJuNumber(dunType, year, month, day, hour);
        console.log('局数:', ju);

        // 3. 计算时干序号（简化：使用小时数）
        const hourGanIndex = hour % 10;
        console.log('时干序号:', hourGanIndex);

        // 4. 计算值符、值使
        const zhiFu = calculateZhiFu(dunType, ju, hourGanIndex);
        const zhiShi = calculateZhiShi(dunType, ju, hourGanIndex);
        console.log('值符:', zhiFu.name, '值使:', zhiShi.name);

        // 5. 排布四盘
        const heavenPlate = arrangeHeavenPlate(dunType, ju, zhiFu);
        const earthPlate = arrangeEarthPlate(dunType, ju);
        const humanPlate = arrangeHumanPlate(dunType, ju, zhiShi);
        const spiritPlate = arrangeSpiritPlate(zhiFu);
        console.log('四盘排布完成');

        // 6. 判断格局
        const patterns = identifyPatterns(heavenPlate, earthPlate, humanPlate);
        console.log('格局判断完成:', patterns.length, '个格局');

        // 7. 生成建议
        const advice = generateAdvice(patterns, dunType, ju);
        console.log('建议生成完成');

        const result = {
            year,
            month,
            day,
            hour,
            dunType,
            ju,
            zhiFu,
            zhiShi,
            heavenPlate,
            earthPlate,
            humanPlate,
            spiritPlate,
            patterns,
            advice,
        };

        console.log('奇门遁甲排盘完成');
        return result;

    } catch (err) {
        console.error('奇门遁甲排盘错误:', err);
        throw err;
    }
}

/* ========== UI 渲染函数 ========== */

/**
 * 渲染奇门遁甲排盘结果
 * @param {Object} result - 排盘结果
 * @returns {string} HTML 内容
 */
function renderQimenResult(result) {
    const {
        dunType,
        ju,
        zhiFu,
        zhiShi,
        heavenPlate,
        earthPlate,
        humanPlate,
        spiritPlate,
        patterns,
        advice,
    } = result;

    // 渲染九宫格
    let gridHtml = '';
    for (let i = 0; i < 9; i++) {
        const palace = NINE_PALACES[i];
        const heaven = heavenPlate[i];
        const earth = earthPlate[i];
        const human = humanPlate[i];
        const spirit = spiritPlate[i];

        // 判断该宫的吉凶
        const palacePatterns = patterns.filter(p => p.palace === i + 1);
        const isAuspicious = palacePatterns.some(p => p.type === '吉格');
        const isInauspicious = palacePatterns.some(p => p.type === '凶格');
        const statusClass = isAuspicious ? 'ji' : isInauspicious ? 'xiong' : '';

        gridHtml += `
            <div class="qimen-cell ${statusClass}" data-palace="${i + 1}">
                <div class="qimen-palace-name">${palace.name}</div>
                <div class="qimen-direction">${palace.direction}</div>
                <div class="qimen-spirit">${spirit ? spirit.name : '--'}</div>
                <div class="qimen-heaven">${heaven ? heaven.name : '--'}</div>
                <div class="qimen-earth">${earth || '--'}</div>
                <div class="qimen-human">${human ? human.name : '--'}</div>
            </div>
        `;
    }

    // 渲染格局
    let patternsHtml = '';
    if (patterns.length > 0) {
        patternsHtml = `
            <div class="qimen-patterns">
                <h4><i class="fa-solid fa-star"></i> 格局判断</h4>
                <div class="patterns-list">
                    ${patterns.map(p => `
                        <div class="pattern-item ${p.type === '吉格' ? 'ji' : 'xiong'}">
                            <span class="pattern-name">${p.name}</span>
                            <span class="pattern-palace">${p.palaceName}</span>
                            <span class="pattern-desc">${p.desc}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 渲染建议
    const adviceHtml = `
        <div class="qimen-advice">
            <h4><i class="fa-solid fa-lightbulb"></i> 用事建议</h4>
            <p class="advice-summary">${advice.summary}</p>
            <div class="advice-grid">
                <div class="advice-item">
                    <span class="advice-label">宜</span>
                    <span class="advice-value">${advice.suitable.join('、')}</span>
                </div>
                <div class="advice-item">
                    <span class="advice-label">忌</span>
                    <span class="advice-value">${advice.unsuitable.join('、')}</span>
                </div>
            </div>
            <div class="advice-directions">
                <p><strong>吉方：</strong>${advice.directions.good.join('、')}</p>
                <p><strong>凶方：</strong>${advice.directions.bad.join('、')}</p>
            </div>
            <p class="advice-time">${advice.timeAdvice}</p>
        </div>
    `;

    return `
        <div class="qimen-report">
            <div class="qimen-header">
                <div class="qimen-info">
                    <span class="qimen-dun">${dunType}</span>
                    <span class="qimen-ju">${ju}局</span>
                    <span class="qimen-zhifu">值符：${zhiFu.name}</span>
                    <span class="qimen-zhishi">值使：${zhiShi.name}</span>
                </div>
            </div>

            <div class="qimen-grid">
                ${gridHtml}
            </div>

            ${patternsHtml}
            ${adviceHtml}
        </div>
    `;
}

/* ========== 初始化函数 ========== */

/**
 * 初始化奇门遁甲模块
 */
function initQimenModule() {
    const btnCalculate = document.getElementById('btnCalculateQimen');
    if (!btnCalculate) return;

    btnCalculate.addEventListener('click', () => {
        const dateVal = document.getElementById('qimenDate')?.value;

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
        const resultCard = document.getElementById('qimenResultCard');
        if (resultCard) {
            resultCard.style.display = 'block';
        }

        // 显示加载状态
        const resultEl = document.getElementById('qimenResultBody');
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

        // 更新标题
        const titleEl = document.getElementById('qimenResultTitle');
        if (titleEl) {
            titleEl.textContent = `奇门遁甲排盘 · ${year}年${month}月${day}日 ${hour}时`;
        }

        // 延迟执行，让加载动画显示
        setTimeout(() => {
            try {
                const result = calculateQimen(year, month, day, hour);
                const html = renderQimenResult(result);

                if (resultEl) {
                    resultEl.innerHTML = html;
                }

                showToast('奇门遁甲排盘完成！', 2000);

                // 绑定导出按钮事件
                const btnExportPDF = document.getElementById('btnExportQimenPDF');
                if (btnExportPDF) {
                    btnExportPDF.onclick = () => {
                        exportToPDF('qimenResultCard', {
                            filename: `奇门遁甲_${year}年${month}月${day}日${hour}时_${formatDate(new Date())}.pdf`,
                            title: '乾坤易道 · 奇门遁甲排盘',
                            subtitle: `${year}年${month}月${day}日 ${hour}时`,
                        });
                    };
                }

                // 绑定分享按钮事件
                const btnShare = document.querySelector('#panel-qimen [data-action="share"]');
                if (btnShare) {
                    btnShare.onclick = () => {
                        const shareData = {
                            year, month, day, hour,
                            result: result,
                        };
                        const shareUrl = generateShareLink(shareData, 'qimen');
                        if (shareUrl) {
                            navigator.clipboard.writeText(shareUrl).then(() => {
                                showToast('分享链接已复制到剪贴板！', 2000);
                            }).catch(() => {
                                prompt('请复制以下分享链接：', shareUrl);
                            });
                        } else {
                            showToast('生成分享链接失败', 2000);
                        }
                    };
                }
            } catch (err) {
                console.error('奇门遁甲排盘失败:', err);
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
    initQimenModule,
    calculateQimen,
    renderQimenResult,
    NINE_STARS,
    EIGHT_DOORS,
    EIGHT_SPIRITS,
    NINE_PALACES,
    AUSPICIOUS_PATTERNS,
    INAUSPICIOUS_PATTERNS,
};
