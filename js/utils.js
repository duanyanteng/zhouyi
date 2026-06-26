import { AppState } from './state.js?20260626-5';
import { SIXTY_FOUR_GUA, getGuaInfo } from './gua-data.js?20260626-5';

/**
 * 周易命理系统 - 工具函数库
 * @module utils
 * @description 提供五行计算、数据转换、UI组件、手势处理等通用功能
 */

/* ---------- 五行相关 ---------- */

/**
 * 获取天干的五行属性
 * @param {string} gan - 天干（甲乙丙丁戊己庚辛壬癸）
 * @returns {string} 五行属性（金木水火土）
 * @example getGanWuxing('甲') // 返回 '木'
 */
function getGanWuxing(gan) {
    const dict = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
    return dict[gan] || '';
}

/**
 * 获取地支的五行属性
 * @param {string} zhi - 地支（子丑寅卯辰巳午未申酉戌亥）
 * @returns {string} 五行属性（金木水火土）
 * @example getZhiWuxing('寅') // 返回 '木'
 */
function getZhiWuxing(zhi) {
    const dict = { '寅':'木','卯':'木','巳':'火','午':'火','辰':'土','戌':'土','丑':'土','未':'土','申':'金','酉':'金','亥':'水','子':'水' };
    return dict[zhi] || '';
}

/**
 * 将五行转换为英文名称
 * @param {string} wx - 五行（金木水火土）
 * @returns {string} 英文名称（metal/wood/water/fire/earth）
 * @example getWuxingEng('金') // 返回 'metal'
 */
function getWuxingEng(wx) {
    const dict = { '金':'metal','木':'wood','水':'water','火':'fire','土':'earth' };
    return dict[wx] || '';
}
function getMaxWuxing() {
    let maxKey = "金", maxVal = 0;
    for (let key in AppState.wuxingData) {
        if (AppState.wuxingData[key] > maxVal) { maxVal = AppState.wuxingData[key]; maxKey = key; }
    }
    return maxKey;
}
function getMinWuxing() {
    let minKey = "金", minVal = 100;
    for (let key in AppState.wuxingData) {
        if (AppState.wuxingData[key] < minVal) { minVal = AppState.wuxingData[key]; minKey = key; }
    }
    return minKey;
}

/* ---------- 十二长生 ---------- */
function getDiShi(gan, zhi) {
    const stages = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
    const ganIndex = { '甲':0,'丙':11,'戊':11,'庚':8,'壬':5,'乙':5,'丁':8,'己':8,'辛':11,'癸':2 };
    const zhiOrder = ['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌'];
    const startIdx = ganIndex[gan] || 0;
    const zhiIdx = zhiOrder.indexOf(zhi);
    if (zhiIdx === -1) return "临官";
    const isYang = ['甲','丙','戊','庚','壬'].includes(gan);
    let diff = isYang ? (zhiIdx - startIdx + 12) % 12 : (startIdx - zhiIdx + 12) % 12;
    return stages[diff] || "临官";
}

/* ---------- 方向 ---------- */
function getGuaFromDirection(dir) {
    const dict = { '正北':'坎','正南':'离','正东':'震','正西':'兑','西北':'乾','西南':'坤','东北':'艮','东南':'巽' };
    return dict[dir] || '中';
}

/* ---------- HTML 安全 ---------- */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[tag] || tag));
}
function sanitizeHTML(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp.querySelectorAll("script, iframe, object, embed").forEach(el => el.remove());
    tmp.querySelectorAll("*").forEach(el => {
        for (const attr of el.attributes) {
            if (attr.name.startsWith("on") || attr.value.toLowerCase().startsWith("javascript:")) el.removeAttribute(attr.name);
        }
    });
    return tmp.innerHTML;
}

/* ---------- 康熙字典笔画 ---------- */
const KANGXI_STROKES = {
    "一":1,"乙":1,"二":2,"十":2,"丁":2,"七":2,"八":2,"九":2,"人":2,"入":2,"儿":2,"几":2,"了":2,"刀":2,"力":2,"又":2,
    "三":3,"干":3,"于":3,"工":3,"士":3,"土":3,"才":3,"寸":3,"下":3,"大":3,"丈":3,"与":3,"上":3,"小":3,"口":3,"巾":3,"山":3,"千":3,"川":3,"子":3,"也":3,"女":3,"飞":3,"马":3,
    "丰":4,"王":4,"井":4,"开":4,"天":4,"夫":4,"元":4,"无":4,"云":4,"木":4,"不":4,"太":4,"犬":4,"尤":4,"车":4,"日":4,"中":4,"内":4,"水":4,"牛":4,"毛":4,"升":4,"仁":4,"什":4,"片":4,"化":4,"仇":4,"介":4,"从":4,"今":4,"凶":4,"分":4,"公":4,"月":4,"勿":4,"风":4,"丹":4,"文":4,"方":4,"火":4,"为":4,"斗":4,"户":4,"心":4,"尺":4,"引":4,"孔":4,"巴":4,"队":4,"以":4,"允":4,
    "玉":5,"刊":5,"示":5,"艾":5,"古":5,"节":5,"本":5,"术":5,"可":5,"丙":5,"左":5,"石":5,"右":5,"布":5,"戊":5,"龙":5,"平":5,"东":5,"北":5,"占":5,"业":5,"帅":5,"归":5,"旦":5,"目":5,"甲":5,"申":5,"电":5,"田":5,"由":5,"史":5,"央":5,"兄":5,"冉":5,"皿":5,"凹":5,"出":5,"代":5,"仙":5,"们":5,"白":5,"斥":5,"瓜":5,"乎":5,"令":5,"印":5,"尔":5,"乐":5,"冬":5,"务":5,"生":5,"失":5,"乍":5,"禾":5,"丘":5,"付":5,"仗":5,"代":5,"仙":5,"们":5,"仪":5,"他":5,"仔":5,"仕":5,"仝":5,"以":5,"央":5,"永":5,"氾":5,"半":5,"岌":5,"皮":5,"皿":5,"目":5,"矛":5,"矢":5,
    "巨":5,"市":5,"立":5,"玄":5,"穴":5,"闪":5,"兰":5,"半":5,"汁":5,"汇":5,"头":5,"汉":5,"宁":5,"穴":5,"它":5,"讨":5,"写":5,"让":5,"礼":5,"训":5,"议":5,"必":5,"讯":5,"记":5,"永":5,
    "来":6,"式":6,"刑":6,"动":6,"扛":6,"吉":6,"扣":6,"考":6,"托":6,"老":6,"执":6,"扩":6,"扫":6,"地":6,"场":6,"耳":6,"共":6,"芒":6,"亚":6,"芝":6,"朴":6,"机":6,"权":6,"过":6,"臣":6,"再":6,"协":6,"西":6,"压":6,"厌":6,"在":6,"有":6,"百":6,"而":6,"页":6,"匠":6,"至":6,"此":6,"贞":6,"师":6,"尘":6,"尖":6,"劣":6,"光":6,"当":6,"早":6,"吐":6,"吊":6,"同":6,"曲":6,"团":6,"因":6,"吸":6,"吗":6,"屿":6,"帆":6,"岁":6,"回":6,"岂":6,"刚":6,"网":6,"年":6,"朱":6,"先":6,"丢":6,"廷":6,"年":6,"朱":6,"竹":6,"乔":6,"乒":6,"乓":6,"向":6,"行":6,"后":6,"舟":6,"全":6,"会":6,"杀":6,"合":6,"兆":6,"众":6,"伞":6,"创":6,"肌":6,"朵":6,"杂":6,"旬":6,"旨":6,"旭":6,"冲":6,"决":6,"冰":6,"庄":6,"庆":6,"亦":6,"刘":6,"齐":6,"交":6,"衣":6,"次":6,"产":6,"决":6,"充":6,"妄":6,"闭":6,"问":6,"闯":6,"羊":6,"并":6,"关":6,"米":6,"灯":6,"州":6,"汗":6,"污":6,"江":6,"池":6,"汤":6,"宇":6,"守":6,"宅":6,"安":6,"字":6,"讲":6,"军":6,"许":6,"论":6,"农":6,"讽":6,"设":6,"访":6,"寻":6,"那":6,"迅":6,"尽":6,
    "李":7,"张":11,"刘":15,"陈":16,"杨":13,"赵":14,"黄":12,"周":8,"吴":7,"徐":10,"孙":10,"胡":11,"朱":6,"高":10,"林":8,"何":7,"郭":15,"马":10,"罗":8,"梁":11,"宋":7,"郑":19,"谢":17,"韩":12,"唐":10,"冯":12,"于":3,"董":15,"萧":19,"程":12,"曹":11,"袁":10,"邓":19,"许":11,"傅":12,"沈":8,"曾":12,"彭":12,"吕":7,"苏":22,"卢":16,"蒋":17,"蔡":17,"贾":13,"丁":2,
    "魏":18,"薛":19,"叶":15,"阎":16,"余":7,"潘":16,"杜":7,"戴":18,"夏":10,"钟":17,"汪":8,"田":5,"任":6,"姜":9,"范":11,"方":4,"石":5,"姚":9,"谭":19,"廖":14,"邹":17,"熊":14,"金":8,"陆":10,"郝":14,"孔":4,"白":5,"崔":11,"康":11,"毛":4,"邱":12,"秦":10,"江":7,
    "伟":11,"芳":10,"秀":7,"英":11,"华":14,"强":12,"明":8,"婷":12,"杰":12,"志":7,"丽":19,"勇":9,"军":9,"平":5,"红":9,"艳":24,"涛":18,"超":12,"萍":14,"娟":10,"刚":10,"玲":10,"文":4,
    "鑫":24,"森":12,"琳":13,"嘉":14,"宇":6,"轩":10,"涵":12,"博":12,"瑞":14,"晨":11,"曦":20,"耀":20,"凡":3,"菲":14,"茜":12,"颖":16,"娜":9,"瑶":15,"仪":15,"静":16,
    "子":3,"睿":14,"宸":10,"然":12,"一":1,"诺":16,"言":7,"兮":4,"佑":7,"安":6,"思":9,"雨":8,"桐":10,"乐":15
};
const SHU_LI = (() => {
    const data = {};
    const good = [1,3,5,6,7,8,11,13,15,16,17,18,21,23,24,25,29,31,32,33,35,37,39,41,45,47,48,52,55,57,61,63,65,67,68,73,81];
    const semi = [2,4,9,10,12,14,19,20,22,26,27,28,30,34,36,38,40,42,43,44,46,49,50,51,53,54,56,58,59,60,62,64,66,69,70,71,72,74,75,76,77,78,79,80];
    for (let i = 1; i <= 81; i++) {
        if (good.includes(i)) data[i] = { luck: "大吉", desc: "吉运昌隆" };
        else if (semi.includes(i)) data[i] = { luck: "凶", desc: "先吉后凶" };
        else data[i] = { luck: "大凶", desc: "困苦艰难" };
    }
    return data;
})();
function getStroke(char) { return KANGXI_STROKES[char] || 8; }

/* ---------- 紫微斗数 ---------- */
const ZI_WEI_STARS = {
    main: ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"],
    ci: ["左辅","右弼","文昌","文曲","地空","地劫","天魁","天钺","禄存","擎羊","陀罗","火星","铃星","天马"]
};

/* ---------- Loading 骨架屏组件 ---------- */

/**
 * 显示骨架屏加载动画
 * @param {string} containerId - 容器元素的 ID
 * @param {Object} [options={}] - 配置选项
 * @param {number} [options.lines=3] - 骨架屏行数
 * @param {boolean} [options.showTitle=true] - 是否显示标题占位
 * @param {string} [options.titleWidth='40%'] - 标题占位宽度
 * @param {string} [options.customClass=''] - 自定义 CSS 类名
 * @example showLoading('baziAnalysis', { lines: 5, showTitle: true })
 */
function showLoading(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const {
        lines = 3,
        showTitle = true,
        titleWidth = '40%',
        customClass = ''
    } = options;
    let skeletonHtml = '<div class="bazi-report-loading">';
    for (let i = 0; i < lines; i++) {
        skeletonHtml += `
            <div class="skeleton-card ${customClass}">
                ${showTitle ? `<div class="skeleton-pulse skeleton-block" style="width:${titleWidth}"></div>` : ''}
                <div class="skeleton-pulse skeleton-block"></div>
                <div class="skeleton-pulse skeleton-block w80"></div>
                ${i < lines - 1 ? '<div class="skeleton-pulse skeleton-block w60"></div>' : ''}
            </div>
        `;
    }
    skeletonHtml += '</div>';
    container.innerHTML = skeletonHtml;
}

/**
 * 隐藏骨架屏加载动画
 * @param {string} containerId - 容器元素的 ID
 * @example hideLoading('baziAnalysis')
 */
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const loading = container.querySelector('.bazi-report-loading');
    if (loading) loading.remove();
}

/* ---------- 手势处理 ---------- */

/**
 * 初始化手势处理器
 * @param {Object} [options={}] - 配置选项
 * @param {Function} [options.onSwipeLeft] - 左滑回调函数
 * @param {Function} [options.onSwipeRight] - 右滑回调函数
 * @param {Function} [options.onSwipeUp] - 上滑回调函数
 * @param {Function} [options.onSwipeDown] - 下滑回调函数
 * @param {number} [options.threshold=50] - 滑动距离阈值（像素）
 * @param {boolean} [options.preventScroll=false] - 是否阻止默认滚动
 * @example
 * initGestureHandler({
 *   onSwipeLeft: () => console.log('左滑'),
 *   onSwipeRight: () => console.log('右滑'),
 *   threshold: 80
 * })
 */
function initGestureHandler(options = {}) {
    const {
        onSwipeLeft = null,
        onSwipeRight = null,
        onSwipeUp = null,
        onSwipeDown = null,
        threshold = 50,
        preventScroll = false
    } = options;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let isSwiping = false;

    const container = document.body;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        endX = e.touches[0].clientX;
        endY = e.touches[0].clientY;

        // 如果需要阻止默认滚动
        if (preventScroll) {
            const diffX = Math.abs(endX - startX);
            const diffY = Math.abs(endY - startY);
            if (diffX > diffY) {
                e.preventDefault();
            }
        }
    }, { passive: !preventScroll });

    container.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;

        const diffX = endX - startX;
        const diffY = endY - startY;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);

        // 判断是否是有效的滑动
        if (Math.max(absDiffX, absDiffY) < threshold) return;

        // 水平滑动
        if (absDiffX > absDiffY) {
            if (diffX > 0 && onSwipeRight) {
                onSwipeRight();
            } else if (diffX < 0 && onSwipeLeft) {
                onSwipeLeft();
            }
        }
        // 垂直滑动
        else {
            if (diffY > 0 && onSwipeDown) {
                onSwipeDown();
            } else if (diffY < 0 && onSwipeUp) {
                onSwipeUp();
            }
        }

        // 重置
        startX = 0;
        startY = 0;
        endX = 0;
        endY = 0;
    }, { passive: true });
}

/**
 * 获取模块导航顺序
 * @returns {string[]} 模块 ID 数组
 * @example getModuleNavOrder() // 返回 ['dashboard', 'bazi', 'liuyao', ...]
 */
function getModuleNavOrder() {
    return ['dashboard', 'bazi', 'liuyao', 'huangli', 'fengshui', 'chat', 'xingming', 'meihua', 'hehun', 'ziwei', 'hepan', 'shuzi'];
}

/**
 * 切换到下一个模块
 * @param {string} currentModule - 当前模块 ID
 * @param {Function} switchCallback - 切换回调函数
 * @returns {string} 下一个模块 ID
 * @example switchToNextModule('bazi', (id) => switchView(id))
 */
function switchToNextModule(currentModule, switchCallback) {
    const order = getModuleNavOrder();
    const currentIndex = order.indexOf(currentModule);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % order.length;
    const nextModule = order[nextIndex];
    if (switchCallback) switchCallback(nextModule);
    return nextModule;
}

/**
 * 切换到上一个模块
 * @param {string} currentModule - 当前模块 ID
 * @param {Function} switchCallback - 切换回调函数
 * @returns {string} 上一个模块 ID
 * @example switchToPrevModule('bazi', (id) => switchView(id))
 */
function switchToPrevModule(currentModule, switchCallback) {
    const order = getModuleNavOrder();
    const currentIndex = order.indexOf(currentModule);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + order.length) % order.length;
    const prevModule = order[prevIndex];
    if (switchCallback) switchCallback(prevModule);
    return prevModule;
}

/* ---------- Toast 通知 ---------- */

/**
 * 显示 Toast 通知消息
 * @param {string} msg - 通知消息内容
 * @param {number} [duration=2000] - 显示时长（毫秒）
 * @example showToast('操作成功', 1500)
 */
function showToast(msg, duration) {
    const toast = document.getElementById("copyToast") || (() => { const t = document.createElement("div"); t.id = "copyToast"; t.className = "toast-notification"; document.body.appendChild(t); return t; })();
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duration || 2000);
}

export {
    getGanWuxing, getZhiWuxing, getWuxingEng, getMaxWuxing, getMinWuxing,
    getDiShi, getGuaFromDirection, escapeHTML, sanitizeHTML,
    SIXTY_FOUR_GUA, getGuaInfo, KANGXI_STROKES, SHU_LI, getStroke, ZI_WEI_STARS,
    showLoading, hideLoading, showToast,
    initGestureHandler, getModuleNavOrder, switchToNextModule, switchToPrevModule
};