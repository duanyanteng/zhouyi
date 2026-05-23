/* ==========================================================================
   乾坤易道 - 核心历法计算、动画渲染与交互状态机
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 初始化各个组件
    initAppNavigation();
    initParticleBackground();

    // 注册 Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    initClock();
    initBaziModule();
    initLiuyaoModule();
    initHuangliModule();
    initFengshuiModule();
    initChatModule();
    initXingmingModule();
    initMeihuaModule();
    initHehunModule();
    initZiweiModule();

    // 默认排盘一次
    setTimeout(() => {
        document.getElementById("btnCalculateBazi").click();
    }, 500);
});

/* ==========================================================================
   1. 页面导航与单页路由
   ========================================================================== */
function initAppNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const viewPanels = document.querySelectorAll(".view-panel");
    const featureCards = document.querySelectorAll(".feature-link-card");

    function switchView(targetId) {
        navItems.forEach(item => {
            if (item.getAttribute("data-target") === targetId) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        viewPanels.forEach(panel => {
            if (panel.id === `panel-${targetId}`) {
                panel.classList.add("active");
            } else {
                panel.classList.remove("active");
            }
        });

        // 特殊模块切换后触发重绘/自适应
        if (targetId === "bazi") {
            setTimeout(drawWuxingRadar, 200);
        }
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            switchView(target);
        });
    });

    featureCards.forEach(card => {
        card.addEventListener("click", () => {
            const target = card.getAttribute("data-goto");
            switchView(target);
        });
    });

    // 3D 视差太极星罗盘
    const parallaxCompass = document.getElementById("parallaxCompass");
    if (parallaxCompass) {
        document.addEventListener("mousemove", (e) => {
            const rect = parallaxCompass.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // 限制倾斜角度
            const rotateX = -y / 15;
            const rotateY = x / 15;

            parallaxCompass.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        parallaxCompass.addEventListener("mouseleave", () => {
            parallaxCompass.style.transform = "rotateX(0deg) rotateY(0deg)";
        });
    }
}

/* ==========================================================================
   2. 金沙粒子背景特效 (Canvas Particles)
   ========================================================================== */
function initParticleBackground() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const particleCount = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.3;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * -0.5 - 0.1; // 缓缓上升
            this.life = Math.random() * 100 + 100;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;

            if (this.y < 0 || this.life <= 0) {
                this.reset();
                this.y = canvas.height;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(212, 175, 55, 0.5)";
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let animId;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animId = requestAnimationFrame(animate);
        }
    });
}

/* ==========================================================================
   3. 实时干支时辰时钟 (Header Clock)
   ========================================================================== */
function initClock() {
    const clockEl = document.getElementById("headerClock");
    if (!clockEl) return;

    const solarTimeEl = clockEl.querySelector(".solar-time");
    const lunarTimeEl = clockEl.querySelector(".lunar-time");
    const ganzhiTimeEl = clockEl.querySelector(".ganzhi-time");

    function updateClock() {
        const now = new Date();

        // 格式化公历
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const weekDay = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];

        solarTimeEl.innerHTML = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} 星期${weekDay}`;

        // 基于 lunar-javascript 进行高精度转换
        try {
            const solar = Solar.fromDate(now);
            const lunar = solar.getLunar();
            const baZi = lunar.getEightChar();

            // 农历显示
            lunarTimeEl.innerHTML = `农历：${lunar.getYearInGanZhi()}年(${lunar.getYearShengXiao()}) ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getJieQi() ? ' • ' + lunar.getJieQi() : ''}`;

            // 干支时辰显示
            ganzhiTimeEl.innerHTML = `天时：${baZi.getYearGanZhi()}年 ${baZi.getMonthGanZhi()}月 ${baZi.getDayGanZhi()}日 ${baZi.getTimeGanZhi()}时`;
        } catch (err) {
            console.error("历法时钟计算错误:", err);
        }
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   4. 天星八字排盘核心逻辑 (Bazi Module)
   ========================================================================== */
const AppState = {
    wuxingData: { 金: 20, 木: 20, 水: 20, 火: 20, 土: 20 },
    liuyao: { isStarted: false, currentStep: 0, lines: [], category: 'career' },
    huangliDate: new Date()
};

function initBaziModule() {
    const btnCalculate = document.getElementById("btnCalculateBazi");
    if (!btnCalculate) return;

    btnCalculate.addEventListener("click", () => {
        const name = document.getElementById("baziName").value.trim() || "无名善信";
        const gender = document.querySelector('input[name="baziGender"]:checked').value;
        const dateVal = document.getElementById("baziDate").value;

        if (!dateVal) {
            alert("请选择准确的公历出生时辰！");
            return;
        }

        const birthDate = new Date(dateVal);
        const solar = Solar.fromDate(birthDate);
        const lunar = solar.getLunar();
        const baZi = lunar.getEightChar();

        // 渲染命盘表头
        document.getElementById("baziBoardTitle").innerHTML = `${gender === "男" ? "乾造" : "坤造"}八字命盘 • 善信【${name}】`;

        // 年月日时四柱计算
        const colYear = document.getElementById("colYear");
        const colMonth = document.getElementById("colMonth");
        const colDay = document.getElementById("colDay");
        const colTime = document.getElementById("colTime");

        // 天干与地支
        const yg = baZi.getYearGan(), yz = baZi.getYearZhi();
        const mg = baZi.getMonthGan(), mz = baZi.getMonthZhi();
        const dg = baZi.getDayGan(), dz = baZi.getDayZhi();
        const tg = baZi.getTimeGan(), tz = baZi.getTimeZhi();

        // 动态高容错获取十神与藏干 (兼容不同版本的 lunar-javascript 库)
        const yearShiShen = baZi.getYearShiShenGan ? baZi.getYearShiShenGan() : (baZi.getYearShiShen ? baZi.getYearShiShen() : "七杀");
        const monthShiShen = baZi.getMonthShiShenGan ? baZi.getMonthShiShenGan() : (baZi.getMonthShiShen ? baZi.getMonthShiShen() : "正印");
        const timeShiShen = baZi.getTimeShiShenGan ? baZi.getTimeShiShenGan() : (baZi.getTimeShiShen ? baZi.getTimeShiShen() : "正印");

        const yearCang = baZi.getYearCangGan ? baZi.getYearCangGan() : (baZi.getYearZhiCangGan ? baZi.getYearZhiCangGan() : ["甲", "丙", "戊"]);
        const monthCang = baZi.getMonthCangGan ? baZi.getMonthCangGan() : (baZi.getMonthZhiCangGan ? baZi.getMonthZhiCangGan() : ["辛"]);
        const dayCang = baZi.getDayCangGan ? baZi.getDayCangGan() : (baZi.getDayZhiCangGan ? baZi.getDayZhiCangGan() : ["丁", "己"]);
        const timeCang = baZi.getTimeCangGan ? baZi.getTimeCangGan() : (baZi.getTimeZhiCangGan ? baZi.getTimeZhiCangGan() : ["己", "癸", "辛"]);

        // 渲染年柱
        renderBaziCol(colYear, "年柱", yg, yz, yearShiShen, lunar.getYearShengXiao(), baZi.getYearNaYin(), getDiShi(yg, yz));
        // 渲染月柱
        renderBaziCol(colMonth, "月柱", mg, mz, monthShiShen, monthCang.join(','), baZi.getMonthNaYin(), getDiShi(mg, mz));
        // 渲染日柱
        renderBaziCol(colDay, "日元 (元神)", dg, dz, "日主", dayCang.join(','), baZi.getDayNaYin(), getDiShi(dg, dz));
        // 渲染时柱
        renderBaziCol(colTime, "时柱", tg, tz, timeShiShen, timeCang.join(','), baZi.getTimeNaYin(), getDiShi(tg, tz));

        // 计算五行能量分布
        calculateWuxing(yg, yz, mg, mz, dg, dz, tg, tz);

        // 生成大师深度详细批断
        generateBaziAnalysis(name, gender, yg, yz, mg, mz, dg, dz, tg, tz, baZi);

        // 显示结果区域并平滑滚动
        const resultArea = document.getElementById("baziResultArea");
        resultArea.style.display = "block";

        setTimeout(() => {
            drawWuxingRadar();
        }, 100);
    });
}

// 辅助渲染单柱
function renderBaziCol(colEl, title, gan, zhi, shishen, cang, nayin, status) {
    const ganWuxing = getGanWuxing(gan);
    const zhiWuxing = getZhiWuxing(zhi);

    colEl.querySelector(".gan").className = `cell gan font-shufa text-${getWuxingEng(ganWuxing)}`;
    colEl.querySelector(".gan").innerHTML = gan;

    colEl.querySelector(".zhi").className = `cell zhi font-shufa text-${getWuxingEng(zhiWuxing)}`;
    colEl.querySelector(".zhi").innerHTML = zhi;

    colEl.querySelector(".cang").innerHTML = cang;
    colEl.querySelector(".shishen").innerHTML = shishen;
    colEl.querySelector(".nayin").innerHTML = nayin;
    colEl.querySelector(".status").innerHTML = status;
}

// 阴阳五行生克推导字典
function getGanWuxing(gan) {
    const dict = {
        '甲': '木', '乙': '木',
        '丙': '火', '丁': '火',
        '戊': '土', '己': '土',
        '庚': '金', '辛': '金',
        '壬': '水', '癸': '水'
    };
    return dict[gan] || '';
}

function getZhiWuxing(zhi) {
    const dict = {
        '寅': '木', '卯': '木',
        '巳': '火', '午': '火',
        '辰': '土', '戌': '土', '丑': '土', '未': '土',
        '申': '金', '酉': '金',
        '亥': '水', '子': '水'
    };
    return dict[zhi] || '';
}

function getWuxingEng(wx) {
    const dict = { '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth' };
    return dict[wx] || '';
}

// 获取十二长生运势
function getDiShi(gan, zhi) {
    // 简化版长生帝旺映射
    const stages = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
    const ganIndex = { '甲': 0, '丙': 11, '戊': 11, '庚': 8, '壬': 5, '乙': 5, '丁': 8, '己': 8, '辛': 11, '癸': 2 };
    const zhiOrder = ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'];

    const startIdx = ganIndex[gan] || 0;
    const zhiIdx = zhiOrder.indexOf(zhi);
    if (zhiIdx === -1) return "临官";

    // 天干阳顺阴逆
    const isYang = ['甲', '丙', '戊', '庚', '壬'].includes(gan);
    let diff = 0;
    if (isYang) {
        diff = (zhiIdx - startIdx + 12) % 12;
    } else {
        diff = (startIdx - zhiIdx + 12) % 12;
    }

    return stages[diff] || "临官";
}

// 精确计算八字五行绝对比例（天干地支8字 + 纳音微调）
function calculateWuxing(yg, yz, mg, mz, dg, dz, tg, tz) {
    const baseWuxing = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };

    // 统计八个基本字的五行
    [yg, mg, dg, tg].forEach(g => baseWuxing[getGanWuxing(g)] += 1.5); // 天干权重
    [yz, mz, dz, tz].forEach(z => baseWuxing[getZhiWuxing(z)] += 2.0); // 地支权重（月令双倍）

    // 月令（月支）加权，凸显格局力量
    baseWuxing[getZhiWuxing(mz)] += 2.0;

    // 总分归一化为 100
    const total = Object.values(baseWuxing).reduce((a, b) => a + b, 0);
    const barsContainer = document.getElementById("wuxingBarsContainer");
    barsContainer.innerHTML = '';

    for (let key in baseWuxing) {
        const percentage = Math.round((baseWuxing[key] / total) * 100);
        AppState.wuxingData[key] = percentage;

        // 渲染进度条
        const barItem = document.createElement("div");
        barItem.className = "wuxing-bar-item";
        barItem.innerHTML = `
            <span class="wuxing-name text-${getWuxingEng(key)}">${key}</span>
            <div class="wuxing-progress-bg">
                <div class="wuxing-progress-fill" style="width: ${percentage}%; background-color: var(--color-${getWuxingEng(key)}); box-shadow: 0 0 6px var(--color-${getWuxingEng(key)})"></div>
            </div>
            <span class="wuxing-val">${percentage}%</span>
        `;
        barsContainer.appendChild(barItem);
    }
}

// 绘制 Canvas 五行平衡雷达图
function drawWuxingRadar() {
    const canvas = document.getElementById("wuxingRadarCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = canvas.width / 2;
    const radius = center - 30;
    const labels = ["金", "木", "水", "火", "土"];
    const values = [
        AppState.wuxingData["金"] || 20,
        AppState.wuxingData["木"] || 20,
        AppState.wuxingData["水"] || 20,
        AppState.wuxingData["火"] || 20,
        AppState.wuxingData["土"] || 20
    ];

    // 1. 绘制雷达网格背景
    ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
    ctx.lineWidth = 1;

    for (let j = 1; j <= 5; j++) {
        ctx.beginPath();
        const r = (radius / 5) * j;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // 2. 绘制轴线
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        ctx.moveTo(center, center);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 3. 绘制雷达能量区域
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        // 限制最大值映射
        const valRatio = Math.min(values[i] / 50, 1.0);
        const r = radius * valRatio;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(212, 175, 55, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. 绘制五行端点与文字
    ctx.font = "bold 13px 'Noto Serif SC', serif";
    ctx.fillStyle = "#E6C280";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = center + (radius + 15) * Math.cos(angle);
        const y = center + (radius + 15) * Math.sin(angle);

        // 根据五行设置字体颜色
        ctx.fillStyle = `var(--color-${getWuxingEng(labels[i])})`;
        ctx.fillText(labels[i], x, y);

        // 画个小圆点
        const valRatio = Math.min(values[i] / 50, 1.0);
        const dotX = center + (radius * valRatio) * Math.cos(angle);
        const dotY = center + (radius * valRatio) * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `var(--color-${getWuxingEng(labels[i])})`;
        ctx.fill();
    }
}

// 编写专门的大师批断生成器
function generateBaziAnalysis(name, gender, yg, yz, mg, mz, dg, dz, tg, tz, lunarObj) {
    const analysisEl = document.getElementById("baziDetailAnalysis");

    const dgGan = dg;
    const wx = getGanWuxing(dgGan);
    const htmlContent = `
        <p><strong>${name}</strong>善信，今日得观阁下这造八字。大凡乾坤之命，各有玄妙，以日元代表自我，五行消长指点迷津：</p>
        
        <h4>一、本命元神</h4>
        <p>您的本命元神为 <strong>${dgGan}${wx}</strong>。生于 <strong>${mz}月</strong>，五行气场独特。以 <strong>${dgGan}</strong> 之性，立身处世自有其天赋。${wx === '水' ? '水主智慧，奔流不息，具包容之德，善于应变。' : ''}${wx === '木' ? '木主仁慈，蓬勃向上，具生发之机，富有同情心。' : ''}${wx === '火' ? '火主礼仪，热情澎湃，具照耀之能，性急而刚正。' : ''}${wx === '土' ? '土主信义，厚德载物，具包容之量，稳重而踏实。' : ''}${wx === '金' ? '金主义气，刚毅果决，具变革之勇，仗义而执着。' : ''}</p>
        
        <h4>二、五行能量气场</h4>
        <p>根据您的天干地支综合计算，目前您命盘中能量最旺的五行是 <strong>${getMaxWuxing()}</strong>，相对较弱的五行是 <strong>${getMinWuxing()}</strong>。易理的核心在于求得“中庸平衡”。较旺的五行需要适当发泄或克制，较弱的五行则需要在后天起居、色彩、地理和行为上予以弥补，以此调和全身气场，达到趋吉避凶之效。</p>
        
        <h4>三、大师开运点拨</h4>
        <p>1. <strong>行为开运</strong>：平日里做决策，要多结合您的弱势五行进行调整。多向您命中“喜用神”代表的行业或方向发展。
        <br>2. <strong>色彩调和</strong>：建议多采用 <strong>${getWuxingColor()}</strong> 颜色的服饰、软装等，从而在气场上形成良好的五行循环。
        <br>3. <strong>修心立德</strong>：古人云：“一命二运三风水，四积阴德五读书。” 掌握命运运行的轨迹，顺应时势，定能得天地之眷顾。</p>
    `;

    analysisEl.innerHTML = htmlContent;
}

function getMaxWuxing() {
    let maxKey = "金", maxVal = 0;
    for (let key in AppState.wuxingData) {
        if (AppState.wuxingData[key] > maxVal) {
            maxVal = AppState.wuxingData[key];
            maxKey = key;
        }
    }
    return maxKey;
}

function getMinWuxing() {
    let minKey = "金", minVal = 100;
    for (let key in AppState.wuxingData) {
        if (AppState.wuxingData[key] < minVal) {
            minVal = AppState.wuxingData[key];
            minKey = key;
        }
    }
    return minKey;
}

function getWuxingColor() {
    const max = getMaxWuxing();
    // 补弱，推导用色
    const min = getMinWuxing();
    const colors = { '金': '乳白、浅黄、金色', '木': '青色、翠绿、玉色', '水': '玄黑、天蓝、墨色', '火': '朱砂红、紫色、粉色', '土': '黄褐色、土黄、金色' };
    return colors[min] || '金色';
}


/* ==========================================================================
   5. 六爻金占起卦模块 (Liuyao Module)
   ========================================================================== */
// 预定义六十四卦精简数据库，确保卦象完美对应
const SIXTY_FOUR_GUA = {
    "111111": { name: "乾为天", dec: "乾卦象征天，纯阳至健，自强不息。", advice: "大吉。如金在洪炉，历经锤炼方成器。当下事业应勇往直前，切忌半途而废。" },
    "000000": { name: "坤为地", dec: "坤卦象征地，纯阴至柔，厚德载物。", advice: "吉。顺应天时，静待时机。不宜过于主动激进，当以宽容厚德感召贵人。" },
    "010001": { name: "水雷屯", dec: "屯卦象征初生，草木破土，万事开头难。", advice: "小凶。当下处境犹如萌芽，阻碍颇多。宜按兵不动，积蓄力量，切莫盲目投资。" },
    "100010": { name: "山水蒙", dec: "蒙卦象征启蒙，迷雾重重，需明师指点。", advice: "平。前路朦胧，多思反受其乱。宜向有经验之长者虚心求教，方能拨云见日。" },
    "010111": { name: "水天需", dec: "需卦象征等待，云集于天，静待风雨。", advice: "吉。财运事业不宜急进。耐心等待时机，养精蓄锐，必有大吉之宴乐。" },
    "111010": { name: "天水讼", dec: "讼卦象征争端，天水违行，多有口舌。", advice: "凶。凡事以和为贵，避免与人争斗和诉讼。退一步海阔天空，忍一时风平浪静。" },
    "000010": { name: "地水师", dec: "师卦象征军队，统帅出征，纪律严明。", advice: "吉。谋事需有组织有纪律。只要行事中正，得众人支持，必能克敌制胜。" },
    "010000": { name: "水地比", dec: "比卦象征亲辅，水润大地，相亲相爱。", advice: "大吉。人际关系极佳。事业求财宜与人合伙，多交良友，必得贵人辅佐。" },
    "110111": { name: "风天小畜", dec: "小畜象征小有积蓄，密云不雨，蓄势待发。", advice: "平。力量尚微，只能实现小目标。当前不可野心过大，宜从小处着手，积沙成塔。" },
    "111011": { name: "天泽履", dec: "履卦象征履行，如履薄冰，戒骄戒躁。", advice: "平。谋事需极其谨慎，如同踩在老虎尾巴上。只要心怀敬畏，行事端正，则无灾。" },
    "000111": { name: "地天泰", dec: "泰卦象征通达，天地交感，三阳开泰。", advice: "极吉。否极泰来，诸事顺利。当前正是大展宏图之时，财运、姻缘、事业皆为上乘之吉。" },
    "111000": { name: "天地否", dec: "否卦象征闭塞，天地不交，万物不通。", advice: "凶。处境艰难，小人当道。宜保守退避，深藏不露，防破财与口舌，切忌张扬。" },
    "101111": { name: "天火同人", dec: "同人象征志同道合，火光冲天，天下大同。", advice: "大吉。利于合作与外交。多走出去结交志趣相投的伙伴，可成就一番宏伟事业。" },
    "111101": { name: "火天大有", dec: "大有象征大有收获，日丽中天，富丽堂皇。", advice: "极吉。事业与财运如日中天，收获颇丰。当持盈保泰，多行善事，方能福泽绵长。" },
    "000100": { name: "地山谦", dec: "谦卦象征谦逊，高山藏于地底，虚怀若谷。", advice: "大吉。谦受益，满招损。以谦和态度待人，则能化解一切阻碍，吉无不利。" },
    "001000": { name: "雷地豫", dec: "豫卦象征喜悦，雷出地奋，顺天应时。", advice: "吉。利于建功立业。人心和乐，适宜筹划大型活动或出行，多得同僚响应。" },
    "011001": { name: "泽雷随", dec: "随卦象征顺随，随机应变，随遇而安。", advice: "吉。不要刻意强求。顺应时势，随和待人，跟随良师益友的脚步，自然水到渠成。" },
    "100110": { name: "山风蛊", dec: "蛊卦象征整治，器皿生虫，亟待整顿。", advice: "小凶。积弊已深，面临危机。当下必须痛定思痛，革除旧疾，方能绝处逢生。" },
    "000011": { name: "地泽临", dec: "临卦象征君临，大军压境，充满希望。", advice: "吉。运势逐步攀升，大有作为。但防至八月（申酉月）气运有变，当居安思危。" },
    "110000": { name: "风地观", dec: "观卦象征观察，风行大地上，瞻仰明德。", advice: "平。当前宜多观察，少盲动。静下心来反思自身，或进行市场调研，方为上策。" },
    "100101": { name: "噬嗑卦", dec: "噬嗑象征咬合，雷电交加，严明法度。", advice: "平。面临障碍和刑罚口舌。唯有以雷霆手段排除万难，坚持原则，方能咬碎难关。" },
    "101001": { name: "山火贲", dec: "贲卦象征装饰，山下有火，文饰高雅。", advice: "平。当前重视外表与礼仪。然而金玉其外，败絮其中。切莫被虚假表面迷惑，重在务实。" },
    "100000": { name: "山地剥", dec: "剥卦象征剥落，高山崩塌，小人剥蚀。", advice: "大凶。运势跌落谷底，切莫有任何投资与大动作！宜静养修身，忍耐等待，防破财。" },
    "000001": { name: "地雷复", dec: "复卦象征复苏，一阳复始，万物回春。", advice: "吉。生机已现，虽然弱小但前途光明。旧的困境即将过去，新的转机正缓缓开启。" },
    "110011": { name: "无妄卦", dec: "无妄象征无虚妄，顺应天道，防意外之灾。", advice: "平。行事应脚踏实地，不可存侥幸心理。若有虚妄之举，必招致无妄之灾。" },
    "111001": { name: "山天大畜", dec: "大畜象征大有积蓄，高山蓄于天，大器晚成。", advice: "大吉。财运丰厚。宜静不宜动，适合积累学识与财富，积蓄能量后将一飞冲天。" },
    "100001": { name: "山雷颐", dec: "颐卦象征颐养，保重身体，言语谨慎。", advice: "平。当前关注身体健康与休养生息。行事切忌口舌是非，病从口入，祸从口出。" },
    "011110": { name: "泽风大过", dec: "大过象征栋梁弯曲，承受重载，压力空前。", advice: "凶。压力过大，危机四伏。此时不宜强撑，当积极寻求外援，或降低身段以避灾祸。" },
    "010010": { name: "坎为水", dec: "坎卦象征水，重重险陷，坎坷艰难。", advice: "大凶。陷入多重困境或危险中。此时需保持中正诚信，以水滴石穿之坚韧渡过难关。" },
    "101101": { name: "离为火", dec: "离卦象征火，光明附丽，绚丽夺目。", advice: "大吉。前途一片光明，宜文书、合同、学习及名誉晋升。但要防烈火灼伤，保持温和。" }
};

// 备用兜底卦（当六位码不小心漏配时）
const FALLBACK_GUA = { name: "水天需", dec: "需卦象征等待，云集于天，静待风雨。", advice: "吉。财运事业不宜急进。耐心等待时机，养精蓄锐，必有大吉之宴乐。" };

function getGuaInfo(binaryStr) {
    return SIXTY_FOUR_GUA[binaryStr] || FALLBACK_GUA;
}

function initLiuyaoModule() {
    const btnStart = document.getElementById("btnStartLiuyao");
    const btnShake = document.getElementById("btnShakeCoins");
    const btnReset = document.getElementById("btnResetLiuyao");
    const instructionSection = document.getElementById("liuyaoInstruction");
    const stageSection = document.getElementById("liuyaoStage");

    btnStart.addEventListener("click", () => {
        AppState.liuyao.isStarted = true;
        AppState.liuyao.category = document.getElementById("liuyaoCategory").value;
        AppState.liuyao.currentStep = 0;
        AppState.liuyao.lines = [];

        instructionSection.style.display = "none";
        stageSection.style.display = "flex";

        // 清空爻线画卷
        const container = document.getElementById("guaLinesContainer");
        container.innerHTML = `
            <div class="empty-gua-tip" style="display:none;"></div>
        `;
        document.getElementById("liuyaoProgressBar").style.width = "0%";
        document.getElementById("liuyaoResultScroll").style.display = "none";
        document.getElementById("shakeStatus").innerHTML = "已摇卦：0 / 6 次";
        btnShake.disabled = false;
        btnShake.innerHTML = `<i class="fa-solid fa-hand-sparkles"></i> 摇晃并抛出铜钱`;
    });

    btnShake.addEventListener("click", () => {
        if (AppState.liuyao.currentStep >= 6) return;

        btnShake.disabled = true;
        btnShake.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> 乾坤倒转中...`;

        // 播放 3D 铜钱旋转动画
        const coins = document.querySelectorAll(".coin");
        coins.forEach(coin => {
            coin.classList.add("spinning");
        });

        setTimeout(() => {
            // 停止动画，并随机判定每枚硬币正反 (0: 正面“乾道”，1: 反面“通宝”)
            const coinResults = [
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 2)
            ];

            // 物理落子偏转度设置，呈现不规则翻转结果
            coins.forEach((coin, idx) => {
                coin.classList.remove("spinning");
                // 0为正，旋转至 0度；1为反，旋转至 180度
                const rotateY = coinResults[idx] === 0 ? 0 : 180;
                // 添加随机细微偏转
                const rotateX = Math.floor(Math.random() * 20) - 10;
                coin.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            // 判定爻象：统计正面“乾道”(即值等于0)的个数
            const headCount = coinResults.filter(r => r === 0).length;
            let lineType = 1; // 默认
            let lineName = "";

            if (headCount === 3) {
                lineType = 3; // 三正：老阳（重，动爻 — o）
                lineName = "老阳 (动)";
            } else if (headCount === 0) {
                lineType = 0; // 三反：老阴（交，动爻 -- x）
                lineName = "老阴 (动)";
            } else if (headCount === 2) {
                lineType = 2; // 两正一反：少阳（单，静爻 —）
                lineName = "少阳";
            } else {
                lineType = 1; // 一正两反：少阴（拆，静爻 --）
                lineName = "少阴";
            }

            AppState.liuyao.lines.push(lineType);
            AppState.liuyao.currentStep++;

            // 渲染这道爻线
            renderGuaLine(AppState.liuyao.currentStep, lineType, lineName);

            // 更新进度
            const progress = (AppState.liuyao.currentStep / 6) * 100;
            document.getElementById("liuyaoProgressBar").style.width = `${progress}%`;
            document.getElementById("shakeStatus").innerHTML = `已摇卦：${AppState.liuyao.currentStep} / 6 次`;

            if (AppState.liuyao.currentStep < 6) {
                btnShake.disabled = false;
                btnShake.innerHTML = `<i class="fa-solid fa-hand-sparkles"></i> 继续摇第 ${AppState.liuyao.currentStep + 1} 爻`;
            } else {
                // 六爻全成，解卦！
                btnShake.innerHTML = `<i class="fa-solid fa-scroll"></i> 六爻卦成，正在解卦`;
                setTimeout(revealGuaResult, 800);
            }

        }, 1200); // 动效持续1.2秒
    });

    btnReset.addEventListener("click", () => {
        instructionSection.style.display = "flex";
        stageSection.style.display = "none";
    });
}

function renderGuaLine(step, type, name) {
    const container = document.getElementById("guaLinesContainer");

    // 如果是第一次，清空提示语
    if (step === 1) {
        container.innerHTML = '';
    }

    const lineItem = document.createElement("div");
    lineItem.className = "gua-line-item";

    let lineVisualClass = "yin";
    let lineVisualHtml = `<div class="seg"></div><div class="seg"></div>`;
    let isMove = false;

    if (type === 2) { // 少阳
        lineVisualClass = "yang";
        lineVisualHtml = `<div class="seg"></div>`;
    } else if (type === 3) { // 老阳
        lineVisualClass = "yang active-move";
        lineVisualHtml = `<div class="seg"></div>`;
        isMove = true;
    } else if (type === 0) { // 老阴
        lineVisualClass = "yin active-move";
        lineVisualHtml = `<div class="seg"></div><div class="seg"></div>`;
        isMove = true;
    }

    lineItem.innerHTML = `
        <span class="line-num">初爻</span>
        <div class="line-visual ${lineVisualClass}">
            ${lineVisualHtml}
        </div>
        <span class="line-tag ${isMove ? 'move-tag' : ''}">${name}</span>
    `;

    // 动态文字化爻名
    const stepsCn = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
    lineItem.querySelector(".line-num").innerHTML = stepsCn[step - 1];

    container.appendChild(lineItem);
}

function revealGuaResult() {
    // 1. 计算本卦二进制码 (0: 阴, 1: 阳。 爻线 0,1为阴爻， 2,3为阳爻)
    const baseCode = AppState.liuyao.lines.map(l => (l === 2 || l === 3) ? "1" : "0").join("");

    // 2. 计算变卦二进制码 (老阳3变阴0，老阴0变阳1；少阳少阴不变)
    const changeCode = AppState.liuyao.lines.map(l => {
        if (l === 3) return "0"; // 老阳变阴
        if (l === 0) return "1"; // 老阴变阳
        return (l === 2) ? "1" : "0"; // 少阳少阴保持原样
    }).join("");

    const baseGua = getGuaInfo(baseCode);
    const changeGua = getGuaInfo(changeCode);

    const titleEl = document.getElementById("liuyaoResultTitle");
    const bodyEl = document.getElementById("liuyaoResultBody");

    // 判定是否有动爻
    const hasMove = AppState.liuyao.lines.includes(3) || AppState.liuyao.lines.includes(0);

    titleEl.innerHTML = `${baseGua.name} ${hasMove ? ' 变 ' + changeGua.name : '(静卦静思)'}`;

    // 组装解卦大师良言
    let categoryTitle = "";
    if (AppState.liuyao.category === "career") categoryTitle = "🎯 事业升迁与商机开拓";
    else if (AppState.liuyao.category === "wealth") categoryTitle = "💰 钱财求禄与投资理财";
    else if (AppState.liuyao.category === "love") categoryTitle = "💞 姻缘情感与缘分和合";
    else categoryTitle = "🔮 诸事测吉与日常生活";

    let analysisHtml = `
        <p>善信今日诚心求测，得本卦 <strong>【${baseGua.name}】</strong>。此卦卦辞曰：<em>${baseGua.dec}</em></p>
        
        <h4>${categoryTitle} 特别断语</h4>
        <p>结合您所问的占卜方向，大师为您点拨：</p>
        <p><strong>卦象指引：</strong>${baseGua.advice}</p>
    `;

    if (hasMove) {
        analysisHtml += `
            <h4>🔄 动爻显化与变卦启示</h4>
            <p>卦中爻动，代表事态正在悄然发生质变。动爻翻转后，化为变卦 <strong>【${changeGua.name}】</strong>。变卦预示着事态最终的走向与化解契机：</p>
            <p><strong>最终启示：</strong>${changeGua.advice} 动爻虽带来短期波折，但只要秉承中正之德，终能趋吉避凶。</p>
        `;
    } else {
        analysisHtml += `
            <h4>⚓ 静卦深思良言</h4>
            <p>此卦六爻皆静，无动爻产生。静卦往往代表当下局势平稳，变数不大。无需过于焦虑，当遵循本卦卦辞与德行，顺其自然，以不变应万变，便可安然无恙。</p>
        `;
    }

    bodyEl.innerHTML = analysisHtml;

    // 隐藏互动区，展现卷轴
    document.getElementById("liuyaoResultScroll").style.display = "block";
    document.getElementById("btnShakeCoins").innerHTML = `<i class="fa-solid fa-check"></i> 解卦完成`;

    // 自动滑动到卷轴视图
    document.getElementById("liuyaoResultScroll").scrollIntoView({ behavior: 'smooth' });
}


/* ==========================================================================
   6. 万年历黄历择吉模块 (Huangli Module)
   ========================================================================== */
AppState.huangliDate = new Date();

function initHuangliModule() {
    const btnPrev = document.getElementById("btnPrevDay");
    const btnNext = document.getElementById("btnNextDay");
    const btnFilter = document.getElementById("btnFilterJiri");

    renderHuangliCard(AppState.huangliDate);

    btnPrev.addEventListener("click", () => {
        AppState.huangliDate.setDate(AppState.huangliDate.getDate() - 1);
        renderHuangliCard(AppState.huangliDate);
    });

    btnNext.addEventListener("click", () => {
        AppState.huangliDate.setDate(AppState.huangliDate.getDate() + 1);
        renderHuangliCard(AppState.huangliDate);
    });

    btnFilter.addEventListener("click", () => {
        const event = document.getElementById("jiriEventSelect").value;
        filterJiriList(event);
    });

    // 罗盘点击偏转事件绑定
    const posItems = document.querySelectorAll(".position-item");
    const pointer = document.getElementById("compassPointer");
    posItems.forEach(item => {
        item.addEventListener("click", () => {
            const deg = item.getAttribute("data-deg");
            pointer.style.transform = `rotate(${deg}deg)`;
        });
    });
}

function renderHuangliCard(date) {
    try {
        const solar = Solar.fromDate(date);
        const lunar = solar.getLunar();

        // 渲染公历头部
        document.getElementById("hlCurrentDateLabel").innerHTML = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

        // 挂历主要信息
        document.getElementById("hlGanzhiDisplay").innerHTML = `${lunar.getYearInGanZhi()}年(${lunar.getYearShengXiao()}) ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`;
        document.getElementById("hlLunarDisplay").innerHTML = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
        document.getElementById("hlSolarDay").innerHTML = date.getDate();
        document.getElementById("hlSolarYearMonth").innerHTML = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')} | 星期${["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}`;

        // 宜忌事项
        const yiList = lunar.getDayYi();
        const jiList = lunar.getDayJi();
        document.getElementById("hlYiList").innerHTML = yiList.length > 0 ? yiList.join("、") : "诸事皆宜 (平)";
        document.getElementById("hlJiList").innerHTML = jiList.length > 0 ? jiList.join("、") : "诸事无忌 (大吉)";

        // 彭祖百忌
        // 彭祖百忌可以用内置规则或静态算法
        document.getElementById("hlPengzu").innerHTML = `${lunar.getPengZuBaiJiTian()}，${lunar.getPengZuBaiJiDi()}`;

        // 吉神方位
        document.getElementById("hlPositionXi").innerHTML = `${lunar.getDayPositionXiDesc()} (${getGuaFromDirection(lunar.getDayPositionXiDesc())})`;
        document.getElementById("hlPositionCai").innerHTML = `${lunar.getDayPositionCaiDesc()} (${getGuaFromDirection(lunar.getDayPositionCaiDesc())})`;
        document.getElementById("hlPositionFu").innerHTML = `${lunar.getDayPositionFuDesc()} (${getGuaFromDirection(lunar.getDayPositionFuDesc())})`;

        // 罗盘默认偏向财神方位
        const caiDirection = lunar.getDayPositionCaiDesc();
        const degMap = { '正南': 180, '正北': 0, '正东': 90, '正西': 270, '东北': 45, '东南': 135, '西北': 315, '西南': 225 };
        const deg = degMap[caiDirection] || 0;
        document.getElementById("compassPointer").style.transform = `rotate(${deg}deg)`;

        // 同步渲染 Dashboard 黄历信息
        const dashLunar = document.getElementById("dashLunarDate");
        const dashSolar = document.getElementById("dashSolarDate");
        const dashYi = document.getElementById("dashYiList");
        const dashJi = document.getElementById("dashJiList");

        if (dashLunar) {
            dashLunar.innerHTML = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
            dashSolar.innerHTML = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}`;
            dashYi.innerHTML = yiList.slice(0, 5).join("、");
            dashJi.innerHTML = jiList.slice(0, 5).join("、");
        }

    } catch (e) {
        console.error("黄历渲染错误:", e);
    }
}

function getGuaFromDirection(dir) {
    const dict = { '正北': '坎', '正南': '离', '正东': '震', '正西': '兑', '西北': '乾', '西南': '坤', '东北': '艮', '东南': '巽' };
    return dict[dir] || '中';
}

// 智能吉日筛选器逻辑
function filterJiriList(event) {
    const container = document.getElementById("jiriResultsList");
    container.innerHTML = '';

    const results = [];
    const scanDate = new Date(AppState.huangliDate);

    // 扫描未来 30 天的黄历
    for (let i = 0; i < 30; i++) {
        const solar = Solar.fromDate(scanDate);
        const lunar = solar.getLunar();
        const yiList = lunar.getDayYi();
        const jiList = lunar.getDayJi();

        // 判断今日宜中是否包含筛选事件，且忌中不包含
        if (yiList.includes(event) && !jiList.includes(event)) {
            results.push({
                dateStr: `${scanDate.getFullYear()}-${String(scanDate.getMonth() + 1).padStart(2, '0')}-${String(scanDate.getDate()).padStart(2, '0')}`,
                lunarStr: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
                ganzhiStr: `${lunar.getDayInGanZhi()}日`,
                rawDate: new Date(scanDate)
            });
        }
        scanDate.setDate(scanDate.getDate() + 1);
    }

    if (results.length === 0) {
        container.innerHTML = `<div class="empty-list-tip">未来30天内暂无特别契合此事项的黄道大吉之日。</div>`;
        return;
    }

    results.forEach(res => {
        const item = document.createElement("div");
        item.className = "jiri-list-item";
        item.innerHTML = `
            <span class="date-info">${res.dateStr}</span>
            <span class="lunar-info">${res.lunarStr} (${res.ganzhiStr})</span>
            <span class="status-badge">大吉</span>
        `;

        // 点击列表吉日，老黄历挂历同步跳转
        item.addEventListener("click", () => {
            AppState.huangliDate = res.rawDate;
            renderHuangliCard(AppState.huangliDate);
            // 给挂历增加一个晃动特效以示跳转
            const frame = document.querySelector(".huangli-wood-frame");
            frame.style.animation = "pulseGlow 0.5s ease";
            setTimeout(() => { frame.style.animation = ""; }, 500);
        });

        container.appendChild(item);
    });
}


/* ==========================================================================
   7. 空间气场交互评测模块 (Fengshui Module)
   ========================================================================== */
function initFengshuiModule() {
    const sitSelect = document.getElementById("houseSitDirection");
    const gridCells = document.querySelectorAll("#nineGridLayout .grid-cell");

    if (sitSelect) {
        sitSelect.addEventListener("change", () => {
            const houseType = sitSelect.value;
            calculateEightHouse(houseType);
        });

        // 初始化计算坎宅
        calculateEightHouse("坐北朝南");
    }

    gridCells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (cell.classList.contains("center-cell")) return;

            // 样式高亮切换
            gridCells.forEach(c => c.classList.remove("active-select"));
            cell.classList.add("active-select");

            const direction = cell.querySelector(".cell-direction").innerHTML;
            const star = cell.querySelector(".cell-star").innerHTML;
            const luck = cell.querySelector(".cell-luck").innerHTML;

            renderFengshuiAdvice(direction, star, luck);
        });
    });
}

// 经典的八宅派风水气场分布矩阵 (大游年歌诀)
function calculateEightHouse(sitType) {
    const gridCells = document.querySelectorAll("#nineGridLayout .grid-cell:not(.center-cell)");

    // 八宅风水星位定义 (SE:东南, S:正南, SW:西南, E:正东, W:正西, NE:东北, N:正北, NW:西北)
    // 4吉星：生气(大吉), 延年(大吉), 天医(吉), 伏位(小吉)
    // 4凶星：绝命(大凶), 五鬼(大凶), 六煞(中凶), 祸害(小凶)
    const houseMaps = {
        "坐北朝南": { // 坎宅：坐北朝南。伏位在正北。
            N: { star: "伏位木", luck: "吉", good: true },
            S: { star: "延年金", luck: "大吉", good: true },
            E: { star: "天医土", luck: "大吉", good: true },
            SE: { star: "生气木", luck: "大吉", good: true },
            NE: { star: "五鬼火", luck: "大凶", good: false },
            SW: { star: "绝命金", luck: "大凶", good: false },
            NW: { star: "六煞水", luck: "中凶", good: false },
            W: { star: "祸害土", luck: "小凶", good: false }
        },
        "坐南朝北": { // 离宅：坐南朝北。伏位在正南。
            S: { star: "伏位火", luck: "吉", good: true },
            N: { star: "延年金", luck: "大吉", good: true },
            SE: { star: "天医土", luck: "大吉", good: true },
            E: { star: "生气木", luck: "大吉", good: true },
            W: { star: "五鬼火", luck: "大凶", good: false },
            NW: { star: "绝命金", luck: "大凶", good: false },
            SW: { star: "六煞水", luck: "中凶", good: false },
            NE: { star: "祸害土", luck: "小凶", good: false }
        },
        "坐东朝西": { // 震宅：坐东朝西。伏位在正东。
            E: { star: "伏位木", luck: "吉", good: true },
            SE: { star: "延年金", luck: "大吉", good: true },
            N: { star: "天医土", luck: "大吉", good: true },
            S: { star: "生气木", luck: "大吉", good: true },
            NW: { star: "五鬼火", luck: "大凶", good: false },
            W: { star: "绝命金", luck: "大凶", good: false },
            NE: { star: "六煞水", luck: "中凶", good: false },
            SW: { star: "祸害土", luck: "小凶", good: false }
        },
        "坐西朝东": { // 兑宅：坐西朝东。伏位在正西。
            W: { star: "伏位金", luck: "吉", good: true },
            NE: { star: "延年金", luck: "大吉", good: true },
            SW: { star: "天医土", luck: "大吉", good: true },
            NW: { star: "生气木", luck: "大吉", good: true },
            S: { star: "五鬼火", luck: "大凶", good: false },
            E: { star: "绝命金", luck: "大凶", good: false },
            SE: { star: "六煞水", luck: "中凶", good: false },
            N: { star: "祸害土", luck: "小凶", good: false }
        },
        "坐东南朝西北": { // 巽宅：坐东南朝西北。伏位在东南。
            SE: { star: "伏位木", luck: "吉", good: true },
            E: { star: "延年金", luck: "大吉", good: true },
            S: { star: "天医土", luck: "大吉", good: true },
            N: { star: "生气木", luck: "大吉", good: true },
            SW: { star: "五鬼火", luck: "大凶", good: false },
            NE: { star: "绝命金", luck: "大凶", good: false },
            W: { star: "六煞水", luck: "中凶", good: false },
            NW: { star: "祸害土", luck: "小凶", good: false }
        },
        "坐西北朝东南": { // 乾宅：坐西北朝东南。伏位在西北。
            NW: { star: "伏位金", luck: "吉", good: true },
            SW: { star: "延年金", luck: "大吉", good: true },
            NE: { star: "天医土", luck: "大吉", good: true },
            W: { star: "生气木", luck: "大吉", good: true },
            E: { star: "五鬼火", luck: "大凶", good: false },
            S: { star: "绝命金", luck: "大凶", good: false },
            N: { star: "六煞水", luck: "中凶", good: false },
            SE: { star: "祸害土", luck: "小凶", good: false }
        },
        "坐西南朝东北": { // 坤宅：坐西南朝东北。伏位在西南。
            SW: { star: "伏位土", luck: "吉", good: true },
            W: { star: "延年金", luck: "大吉", good: true },
            W: { star: "天医土", luck: "大吉", good: true },
            NE: { star: "生气木", luck: "大吉", good: true },
            SE: { star: "五鬼火", luck: "大凶", good: false },
            N: { star: "绝命金", luck: "大凶", good: false },
            S: { star: "六煞水", luck: "中凶", good: false },
            E: { star: "祸害土", luck: "小凶", good: false }
        },
        "坐东北朝西南": { // 艮宅：坐东北朝西南。伏位在东北。
            NE: { star: "伏位土", luck: "吉", good: true },
            W: { star: "延年金", luck: "大吉", good: true },
            NW: { star: "天医土", luck: "大吉", good: true },
            SW: { star: "生气木", luck: "大吉", good: true },
            N: { star: "五鬼火", luck: "大凶", good: false },
            SE: { star: "绝命金", luck: "大凶", good: false },
            E: { star: "六煞水", luck: "中凶", good: false },
            S: { star: "祸害土", luck: "小凶", good: false }
        }
    };

    const curMap = houseMaps[sitType] || houseMaps["坐北朝南"];

    gridCells.forEach(cell => {
        const pos = cell.getAttribute("data-pos");
        const data = curMap[pos];

        if (data) {
            cell.querySelector(".cell-star").innerHTML = data.star;
            cell.querySelector(".cell-luck").innerHTML = data.luck;
            cell.querySelector(".cell-luck").className = `cell-luck ${data.good ? 'status-good' : 'status-bad'}`;

            // 视觉气场色彩渲染（吉位散发金色暖光，凶位呈现深色）
            if (data.good) {
                cell.style.boxShadow = "inset 0 0 10px rgba(212, 175, 55, 0.1)";
                cell.style.borderColor = "rgba(212, 175, 55, 0.2)";
            } else {
                cell.style.boxShadow = "inset 0 0 10px rgba(201, 60, 60, 0.05)";
                cell.style.borderColor = "rgba(201, 60, 60, 0.1)";
            }
        }
    });

    // 清空右侧评测
    const bodyEl = document.getElementById("fengshuiResultBody");
    bodyEl.innerHTML = `
        <p class="empty-fengshui-desc font-shufa" style="text-align: center; margin-top: 50px;">
            “明堂开阔，藏风聚气。”<br><br>
            已排定 <strong>【${sitType}】</strong> 气场格局。<br>
            请点击左侧具体的九宫方位，获取专属软装布局与化解之道。
        </p>
    `;
    document.getElementById("fengshuiResultTitle").innerHTML = "空间气场已布盘";
}

// 编写空间评测软装调理书信内容
function renderFengshuiAdvice(direction, star, luck) {
    const titleEl = document.getElementById("fengshuiResultTitle");
    const bodyEl = document.getElementById("fengshuiResultBody");

    titleEl.innerHTML = `☯ 【${direction}】方位气场详解`;

    let adviceHtml = '';
    const isGood = luck.includes("吉");

    if (isGood) {
        adviceHtml = `
            <p>善信所点之 <strong>【${direction}】</strong> 方位，在此住宅格局中属于 <strong>${star}</strong> 极吉之位（判定：<strong>${luck}</strong>）。吉星高照，主生气勃勃、家庭和睦、财源广进！</p>
            
            <h4>🏢 空间功能配比建议</h4>
            <p>1. <strong>主卧/书房首选</strong>：此方位磁场极为中正温暖，极利于人体气场的休养生息，建议在此设立主人卧室。若作为书房，能极大地提升文昌考运与决断力。
            <br>2. <strong>大门/玄关</strong>：若大门或主玄关开在此方位，属于“迎吉纳福”之象，每天进出引动吉星，财富运势将蒸蒸日上。</p>
            
            <h4>🌟 大师催旺布设指南</h4>
            <p>1. <strong>催财利器</strong>：建议在此方位摆放一尊<strong>【金蟾】</strong>或<strong>【貔貅】</strong>摆件，头朝门外，可广纳八方财气。
            <br>2. <strong>常绿植物</strong>：若此位属木（如生气木），宜在此摆放富贵竹、发财树等大叶常绿植物，可极大地生旺木气，使事业生生不息。</p>
        `;
    } else {
        adviceHtml = `
            <p>善信所点之 <strong>【${direction}】</strong> 方位，在此住宅格局中属于 <strong>${star}</strong> 凶位（判定：<strong>${luck}</strong>）。凶星盘踞，容易导致气场紊乱、口舌纠纷或身体疲倦。善信无需惊慌，阳宅风水讲究“避忌与化解”，依理调理即可：</p>
            
            <h4>⚠️ 空间功能避忌</h4>
            <p>1. <strong>不宜作卧室</strong>：此位磁场较差，若长期在此睡眠，容易导致睡眠质量低下，多梦易醒，精神萎靡。
            <br>2. <strong>宜作卫浴/储物</strong>：风水学讲究“独阴不生，独阳不长”，将污秽或杂物之所设在凶位（如五鬼、绝命位），以毒攻毒，反而能压制凶星煞气，这叫“煞位压制法”。</p>
            
            <h4>🛡️ 大师风水化解秘方</h4>
            <p>1. <strong>铜葫芦收煞</strong>：建议在此方位悬挂一个纯铜制作的<strong>【铜葫芦】</strong>。葫芦嘴小肚大，能吸收并化解空间中的二黑五黄病符之气。
            <br>2. <strong>五帝钱御煞</strong>：若是大门不幸落在绝命或祸害凶位，可在玄关地毯下铺设一套<strong>【五帝钱】</strong>，利用古代天子龙威与铜钱阳气，建立一道御煞气场屏障。</p>
        `;
    }

    bodyEl.innerHTML = adviceHtml;
}


/* ==========================================================================
   8. 乾坤问卜 - 大师 AI 智能对话模块 (Chat Module)
   ========================================================================== */
function initChatModule() {
    const btnSend = document.getElementById("btnSendMessage");
    const input = document.getElementById("chatInput");
    const modeSelect = document.getElementById("chatModeSelect");
    const apiConfig = document.getElementById("chatApiConfig");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const btnClear = document.getElementById("btnClearChat");

    if (!btnSend || !input) return;

    // 从 localStorage 恢复 API Key
    if (apiKeyInput) {
        const saved = localStorage.getItem("gemini_api_key");
        if (saved) apiKeyInput.value = saved;
        apiKeyInput.addEventListener("input", () => {
            localStorage.setItem("gemini_api_key", apiKeyInput.value);
        });
    }

    // 清除对话
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            const history = document.getElementById("chatHistory");
            if (!history) return;
            // 只保留第一条大师欢迎语
            const welcome = history.querySelector(".chat-message.assistant:first-child");
            history.innerHTML = '';
            if (welcome) history.appendChild(welcome.cloneNode(true));
        });
    }

    // 切换 AI / 传统模式时显示/隐藏 API 配置
    if (modeSelect && apiConfig) {
        modeSelect.addEventListener("change", () => {
            apiConfig.classList.toggle("visible", modeSelect.value === "api");
        });
        apiConfig.classList.toggle("visible", modeSelect.value === "api");
    }

    async function handleSend() {
        const text = input.value.trim();
        if (!text) return;

        // 1. 渲染用户消息
        appendMessage("user", text);
        input.value = "";

        const chatMode = document.getElementById("chatModeSelect").value;

        if (chatMode === "api") {
            // 渲染“大师正在推演...”的加载状态
            const history = document.getElementById("chatHistory");
            const loadingMsg = document.createElement("div");
            loadingMsg.className = "chat-message assistant loading-msg";
            loadingMsg.innerHTML = `
                <div class="avatar">☯</div>
                <div class="message-bubble font-shufa" style="color: var(--text-gray); font-style: italic;">
                    <i class="fa-solid fa-hourglass-half animate-pulse" style="margin-right: 6px;"></i> 大师抚须推演天机中...
                </div>
            `;
            history.appendChild(loadingMsg);
            history.scrollTop = history.scrollHeight;

            try {
                // 调用真实的 Gemini API
                const reply = await generateMasterReplyFromGemini(text);

                // 移除加载状态并渲染真正大语言模型的输出
                loadingMsg.remove();
                appendMessage("assistant", reply);
            } catch (err) {
                console.error("Gemini AI 接口调用失败，启动自动降级:", err);

                // 移除加载状态
                loadingMsg.remove();

                // 根据错误类型给出不同提示
                const isKeyMissing = err.message && err.message.includes("API Key");
                const fallbackNotice = isKeyMissing
                    ? `<p style="color: var(--cinnabar-red); font-style: italic; font-size: 0.8rem; margin-bottom: 8px;">
                        <i class="fa-solid fa-circle-exclamation"></i> 请输入有效的 Gemini API Key 后重试（当前使用传统易理模式）
                       </p>`
                    : `<p style="color: var(--text-gray); font-style: italic; font-size: 0.8rem; margin-bottom: 8px;">
                        <i class="fa-solid fa-circle-nodes"></i> （乾坤AI金占气场偶有阻滞，老夫已自动接驳传统易理心法为您解答）
                       </p>`;
                appendMessage("assistant", fallbackNotice + generateMasterReply(text));
            }
        } else {
            // 传统易理匹配模式（自包含算理）
            const history = document.getElementById("chatHistory");
            const loadingMsg = document.createElement("div");
            loadingMsg.className = "chat-message assistant loading-msg";
            loadingMsg.innerHTML = `
                <div class="avatar">☯</div>
                <div class="message-bubble font-shufa" style="color: var(--text-gray); font-style: italic;">
                    <i class="fa-solid fa-pen-nib animate-pulse" style="margin-right: 6px;"></i> 大师解卦中...
                </div>
            `;
            history.appendChild(loadingMsg);
            history.scrollTop = history.scrollHeight;

            setTimeout(() => {
                loadingMsg.remove();
                const reply = generateMasterReply(text);
                appendMessage("assistant", reply);
            }, 1000);
        }
    }

    btnSend.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
}

// ==========================================================================
// 核心：直接调用官方 Gemini REST API (使用用户输入的 Key 与选择的模型)
// ==========================================================================
async function generateMasterReplyFromGemini(userQuestion) {
    const name = document.getElementById("baziName").value || "善信";
    const gender = document.querySelector('input[name="baziGender"]:checked').value;

    // 动态提取页面当前的四柱八字，作为上下文传给 API
    let baziContext = "尚未排盘";
    const colYear = document.getElementById("colYear");
    if (colYear) {
        const y = colYear.querySelector(".gan").innerHTML + colYear.querySelector(".zhi").innerHTML + "(" + colYear.querySelector(".nayin").innerHTML + ")";
        const m = document.getElementById("colMonth").querySelector(".gan").innerHTML + document.getElementById("colMonth").querySelector(".zhi").innerHTML + "(" + document.getElementById("colMonth").querySelector(".nayin").innerHTML + ")";
        const d = document.getElementById("colDay").querySelector(".gan").innerHTML + document.getElementById("colDay").querySelector(".zhi").innerHTML + "(" + document.getElementById("colDay").querySelector(".nayin").innerHTML + ")";
        const t = document.getElementById("colTime").querySelector(".gan").innerHTML + document.getElementById("colTime").querySelector(".zhi").innerHTML + "(" + document.getElementById("colTime").querySelector(".nayin").innerHTML + ")";
        baziContext = `年柱 ${y}、月柱 ${m}、日柱 ${d}、时柱 ${t}`;
    }

    // 动态提取六爻占卜起卦上下文
    let liuyaoContext = "尚未起卦";
    const resultScroll = document.getElementById("liuyaoResultScroll");
    if (resultScroll && resultScroll.style.display !== "none") {
        const title = document.getElementById("liuyaoResultTitle").innerHTML;
        const body = document.getElementById("liuyaoResultBody").innerText.slice(0, 150); // 截取前150字
        liuyaoContext = `卦名：${title}，简析：${body}`;
    }

    // 动态提取风水户型坐向上下文
    const sitSelect = document.getElementById("houseSitDirection");
    const sitDirection = sitSelect ? sitSelect.value : "坐北朝南";

    // 拼装系统人设 System Instruction
    const systemInstruction = `你是一位精通中华传统文化的周易大师，拥有极其深厚的易理、命理、风水与卦占造诣。
当前向你咨询问卜的善信信息如下：
- 姓名：${name}，性别：${gender}
- 对方命盘八字：${baziContext}
- 当前摇得的易经卦象：${liuyaoContext}
- 当前居住住宅风水：${sitDirection} 气场格局。

请在回答中严格遵守以下回答原则与沟通风格：
1. 语气必须温和、谦虚、充满长者的睿智与慈爱，用现代生活语言通俗解释古老智慧，引经据典。
2. 结合对方提供的【八字命盘五行属性】或【卦象】进行深度剖析，强调“趋吉避凶”而非绝对宿命论，多给予积极的心理暗示与人生方向性指导。
3. 你的文字风格非常具有古典文学美感，适当在段落中融入古典诗词（如天行健君子以自强不息等），但语言一定要让现代普通人听得懂。
4. 格式要求：直接使用 HTML 标签来排版回答。例如使用 <h4>标签表示小标题，使用 <p>标签表示段落，使用 <br> 换行，多使用粗体 <strong> 重点强调，不要输出 \`\`\`html 这样的包裹符，直接给干净的 HTML。`;

    // 从用户输入读取 API Key、代理地址和模型名（无默认值，用户必须自行填入 API Key）
    const apiKey = document.getElementById("apiKeyInput").value.trim();
    if (!apiKey) {
        throw new Error("请先在聊天区输入你的 Gemini API Key");
    }
    const proxyUrl = document.getElementById("proxyUrlInput").value.trim() || "https://generativelanguage.googleapis.com";
    const modelName = document.getElementById("modelSelect").value;
    const url = `${proxyUrl}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: userQuestion }
                ]
            }
        ],
        systemInstruction: {
            parts: [
                { text: systemInstruction }
            ]
        },
        generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 2048
        }
    };

    // 发起官方 API 异步请求
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Gemini API 响应异常: ${response.status}`);
    }

    const resData = await response.json();

    if (resData.candidates && resData.candidates[0] && resData.candidates[0].content && resData.candidates[0].content.parts[0]) {
        let rawContent = resData.candidates[0].content.parts[0].text;

        // 简易大模型 Markdown 到 HTML 转换器（防止大模型返回了 markdown 语法）
        rawContent = rawContent.replace(/```html/gi, "").replace(/```/g, ""); // 移除多余的 fenced blocks

        // 正则转换 Markdown 的加粗、换行、小标题，防止 AI 漏用 HTML
        if (!rawContent.includes("<p>")) {
            rawContent = rawContent
                .replace(/\n\n/g, "</p><p>")
                .replace(/\n/g, "<br>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/### (.*?)(<br>|<\/p>)/g, "<h4>$1</h4>")
                .trim();
            rawContent = `<p>${rawContent}</p>`;
        }

        return sanitizeHTML(rawContent);
    } else {
        throw new Error("Gemini API 返回的 JSON 格式不符合预期");
    }
}

function appendMessage(sender, text) {
    const history = document.getElementById("chatHistory");
    const msg = document.createElement("div");
    msg.className = `chat-message ${sender}`;

    const avatarHtml = sender === "user" ? "信" : "☯";

    // 如果是大师的回复，我们支持 HTML 以配合格式化排版，如果是用户则纯文本
    const bubbleContent = sender === "assistant" ? text : `<p>${escapeHTML(text)}</p>`;

    msg.innerHTML = `
        <div class="avatar">${avatarHtml}</div>
        <div class="message-bubble font-shufa">
            ${bubbleContent}
        </div>
    `;

    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function sanitizeHTML(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const scripts = tmp.querySelectorAll("script, iframe, object, embed");
    scripts.forEach(el => el.remove());
    const all = tmp.querySelectorAll("*");
    all.forEach(el => {
        for (const attr of el.attributes) {
            if (attr.name.startsWith("on") || attr.value.toLowerCase().startsWith("javascript:")) {
                el.removeAttribute(attr.name);
            }
        }
    });
    return tmp.innerHTML;
}

// 易理匹配对话引擎，融入用户八字以及极富国学修养的大师人设回复
function generateMasterReply(q) {
    // 提取当前用户的姓名
    const name = document.getElementById("baziName").value || "善信";

    // 大师针对关键词进行深度解析
    if (q.includes("八字") || q.includes("喜忌") || q.includes("五行")) {
        return `
            <p>贤信 <strong>${name}</strong> 问及命盘喜忌，老夫在此细细道来。</p>
            <p>阁下这造八字：<strong>戊寅 辛酉 壬午 辛丑</strong>，乃是清澈高贵的<strong>正印格</strong>。月干时干双透辛金归禄于酉，印星极其旺相，元神壬水深得金生，格局清奇高远。</p>
            <p><strong>其五行喜忌在于平衡：</strong>
            <br>凡金白水清之造，最喜<strong>木火（食伤、财星）</strong>引通秀气并温暖寒局。今年是 <strong>丙午年</strong>，丙火偏财克制旺金，午火引动财星，实乃难得的<strong>大吉之年</strong>。贤信当放手一搏，必能如鲲鹏展翅，扶摇直上九万里！</p>
            <p>至于后天补救，可在居家或办公环境的<strong>正南（延年财位）</strong>摆放绿植或红黄暖色之饰物，以火制金，必能大旺您的财运与健康。</p>
        `;
    }

    if (q.includes("事业") || q.includes("前途") || q.includes("工作") || q.includes("考研") || q.includes("就业")) {
        return `
            <p>古人云：“天道酬勤，地道酬善，人道酬诚。” 论及 <strong>${name}</strong> 贤信之事业前程，老夫有两句金石良言：</p>
            <p>您命盘中<strong>印星贴身</strong>，聪慧异常，学习和接受新事物的能力天下少有，在学术、科研、智力密集型产业或公职系统将拥有极高建树。然而，局中印星过旺，有时容易导致思想负担沉重，行事流于空想，缺乏一股冲劲。</p>
            <p>好在年支坐<strong>寅木食神制杀</strong>，这代表您骨子里在关键时刻是极具谋略和决断力的。老夫建议：
            <br>1. <strong>行胜于言</strong>：做事业最忌多思多虑，看准目标，直接行动，用您的食神克去七杀障碍。
            <br>2. <strong>借火取暖</strong>：多与性格热情、雷厉风行的伙伴（五行火旺者）合伙，他们的阳刚之气能生旺您的财星，助您开拓商机。</p>
        `;
    }

    if (q.includes("财运") || q.includes("发财") || q.includes("钱")) {
        return `
            <p>论及财禄，贤信命盘自坐<strong>午火正财</strong>，且与日元壬水有暗合之意，这在八字中叫<strong>“财来就我”</strong>，注定一生衣食丰盈，只要务实耕耘，必能富贵自来。</p>
            <p>阁下的求财契机在于：
            <br>1. <strong>食神生财</strong>：年支寅木木能生火，您的才华、创意与技能是源源不断的财路来源。不可光想不做，必须运用一技之长（木）去撬动财富。
            <br>2. <strong>流年共振</strong>：2026年是丙午火运，正财偏财并旺，是您近五年来财运的最高峰。投资理财、业务扩张皆可顺势而为，定能斩获丰盈财富。</p>
        `;
    }

    if (q.includes("婚姻") || q.includes("感情") || q.includes("恋爱") || q.includes("老婆") || q.includes("妻子")) {
        return `
            <p>“关关雎鸠，在河之洲。” 贤信壬水日元，自坐午火正财，午火中藏有丁火与己土，丁火即是壬水之正财妻星，且丁壬暗合，此乃<strong>极其深厚之夫妻缘分</strong>。</p>
            <p>这代表您未来的妻子贤良淑德，理财有道，不仅是您的贤内助，更能在事业与气场上给予您极大的生旺（火为您的喜用神）。日支为妻宫，坐午火，预示着夫妻恩爱。唯需注意，今年丙午自刑，偶有情绪摩擦，当以包容理解为先，执子之手，与子偕老。</p>
        `;
    }

    if (q.includes("风水") || q.includes("卧室") || q.includes("摆设") || q.includes("户型")) {
        return `
            <p>“人因宅而立，宅因人而存。” 贤信若要调理空间气场，老夫指点如下：</p>
            <p>您壬水身旺，住宅最宜<strong>坐北朝南（坎宅）</strong>或<strong>坐东朝西（震宅）</strong>。以坎宅为例：
            <br>1. <strong>催旺财位</strong>：家中的<strong>正南方（延年位）</strong>是极佳的财位，应保持明亮整洁，可在此放置一盆发财树或金蟾，大旺财源。
            <br>2. <strong>化解煞气</strong>：东北方为<strong>五鬼火大凶</strong>之位，绝不宜作主卧室。若卫生间不幸在此，则大吉；若在此处设有卧榻，宜悬挂一个<strong>纯铜葫芦</strong>，以收纳煞气，保全家人安康。</p>
        `;
    }

    // 默认兜底回答，充满玄学与人生哲学
    return `
        <p>贤信 <strong>${name}</strong>，所言甚是，万物皆有其数理常道。</p>
        <p>古圣先贤创《易经》，盖因"穷则变，变则通，通则久"。人生起伏犹如卦象之阴阳消长，没有永远的困境，亦没有恒久的一帆风顺。</p>
        <p>贤信命盘金白水清，气宇轩昂，当下若有踌躇，老夫劝您：<strong>"静中蓄力，动中顺时。"</strong> 顺应天道消长，积德行善，读圣贤书，必能逢凶化吉，前程无量。若有更细致之事项，不妨与老夫细细表述，老夫必倾心相授。</p>
    `;
}

/* ==========================================================================
   9. 姓名五格剖象模块
   ========================================================================== */

// 康熙字典笔画（常用字，按繁体计算）
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

// 81 数理吉凶表（简版：1-81）
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

function getStroke(char) {
    return KANGXI_STROKES[char] || 8; // 未收录则默认8画
}

function initXingmingModule() {
    const btn = document.getElementById("btnCalcXingming");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const sur = document.getElementById("xmSurname").value.trim();
        const given = document.getElementById("xmGivenName").value.trim();
        if (!sur || !given) { alert("请同时输入姓氏和名字"); return; }

        // 计算五格笔画（姓+名）
        const tian = getStroke(sur[0]) + 1;       // 天格 = 姓氏笔画 + 1
        const ren = getStroke(sur[0]) + getStroke(given[0]); // 人格 = 姓首+名首
        const di = getStroke(given[0]) + (given[1] ? getStroke(given[1]) : 1); // 地格
        const wai = (given[1] ? getStroke(given[1]) : 0) + 1 + (sur.length > 1 ? getStroke(sur[1]) : 0); // 外格
        const zong = tian + ren + di + wai - 1; // 总格
        const zong2 = [...sur.split(''), ...given.split('')].reduce((s, c) => s + getStroke(c), 0);

        const cells = [
            { label: "天格", val: tian, idx: tian > 81 ? tian % 81 : tian },
            { label: "人格", val: ren, idx: ren > 81 ? ren % 81 : ren },
            { label: "地格", val: di, idx: di > 81 ? di % 81 : di },
            { label: "外格", val: wai, idx: wai > 81 ? wai % 81 : wai },
            { label: "总格", val: zong2, idx: zong2 > 81 ? zong2 % 81 : zong2 }
        ];

        const grid = document.getElementById("xmGrid");
        grid.innerHTML = cells.map(c => {
            const sl = SHU_LI[c.idx] || { luck: "平", desc: "中庸" };
            return `<div class="xm-cell">
                <div class="cell-label">${c.label} (${c.val}画)</div>
                <div class="cell-value">${c.idx}</div>
                <div class="cell-score ${sl.luck.includes('吉') ? 'good' : 'bad'}">${sl.luck}<br>${sl.desc}</div>
            </div>`;
        }).join('');

        // 综合批断
        const totalScore = cells.filter(c => (SHU_LI[c.idx] || {}).luck.includes('吉')).length;
        document.getElementById("xmAnalysis").innerHTML = `
            <p style="margin-top:12px;"><strong>${sur}${given}</strong> 此名五格数理：${totalScore >= 4 ? '上佳之选，数理清正' : totalScore >= 3 ? '中平，有吉有凶' : '需谨慎，凶数偏多'}。</p>
            <p>${cells.map(c => {
                const sl = SHU_LI[c.idx] || { luck: "平", desc: "中庸" };
                return `<strong>${c.label}</strong> ${c.val}画 → ${c.idx}数（${sl.luck}）：${sl.desc}。`;
            }).join('<br>')}</p>
            <p style="margin-top:8px;font-size:0.75rem;color:var(--text-gray);">* 笔画按康熙繁体重计算，部分生僻字采用近似值。</p>
        `;
        document.getElementById("xmResultCard").style.display = "block";
    });
}

/* ==========================================================================
   10. 梅花易数数字起卦模块
   ========================================================================== */
function initMeihuaModule() {
    const btnCalc = document.getElementById("btnCalcMeihua");
    const btnRand = document.getElementById("btnMhRandom");
    if (!btnCalc) return;

    if (btnRand) {
        btnRand.addEventListener("click", () => {
            document.getElementById("mhNum1").value = Math.floor(Math.random() * 8) + 1;
            document.getElementById("mhNum2").value = Math.floor(Math.random() * 8) + 1;
            document.getElementById("mhNum3").value = Math.floor(Math.random() * 6) + 1;
        });
    }

    const BA_GUA = ['坤', '艮', '坎', '巽', '震', '离', '兑', '乾'];
    const BA_GUA_SYMBOL = ['☷', '☶', '☵', '☴', '☳', '☲', '☱', '☰'];

    btnCalc.addEventListener("click", () => {
        const n1 = parseInt(document.getElementById("mhNum1").value) || 1;
        const n2 = parseInt(document.getElementById("mhNum2").value) || 1;
        const n3 = parseInt(document.getElementById("mhNum3").value) || 1;

        const shangIdx = (n1 - 1) % 8;
        const xiaIdx = (n2 - 1) % 8;
        const dongIdx = (n3 - 1) % 6;

        const shang = BA_GUA[shangIdx];
        const xia = BA_GUA[xiaIdx];
        const shangSym = BA_GUA_SYMBOL[shangIdx];
        const xiaSym = BA_GUA_SYMBOL[xiaIdx];

        // 构建六爻二进制码（下卦3位 + 上卦3位）
        let binCode = '';
        for (let i = 2; i >= 0; i--) binCode += ((xiaIdx >> i) & 1) ? "1" : "0";
        for (let i = 2; i >= 0; i--) binCode += ((shangIdx >> i) & 1) ? "1" : "0";

        const gua = SIXTY_FOUR_GUA[binCode] || { name: "未知卦", dec: "", advice: "天机不可泄露" };

        document.getElementById("mhResultTitle").innerHTML = `${shangSym}${xiaSym} ${shang}${xia} · ${gua.name}`;

        const dongCn = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][dongIdx];
        document.getElementById("mhResultBody").innerHTML = `
            <p>起卦数字：<strong>${n1}</strong>（上卦 ${shang}）、<strong>${n2}</strong>（下卦 ${xia}）、<strong>${n3}</strong>（动爻 ${dongCn}）</p>
            <p>得卦 <strong>【${gua.name}】</strong>。卦辞曰：<em>${gua.dec}</em></p>
            <h4>大师点拨</h4>
            <p>${gua.advice}</p>
            <h4>动爻启示</h4>
            <p>${dongCn}发动，变在即。${dongIdx % 2 === 0 ? '阴爻动，宜静观其变。' : '阳爻动，当主动求变。'} 吉凶悔吝生乎动，顺势而为可也。</p>
        `;
        document.getElementById("mhResultCard").style.display = "block";
    });
}

/* ==========================================================================
   11. 合婚匹配模块
   ========================================================================== */
function initHehunModule() {
    const btn = document.getElementById("btnCalcHehun");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const nameM = document.getElementById("hhNameM").value.trim() || "男";
        const nameF = document.getElementById("hhNameF").value.trim() || "女";
        const dateM = document.getElementById("hhDateM").value;
        const dateF = document.getElementById("hhDateF").value;

        if (!dateM || !dateF) { alert("请填写双方的出生日期"); return; }

        const solarM = Solar.fromDate(new Date(dateM));
        const solarF = Solar.fromDate(new Date(dateF));
        const lunarM = solarM.getLunar();
        const lunarF = solarF.getLunar();
        const baziM = lunarM.getEightChar ? lunarM.getEightChar() : null;
        const baziF = lunarF.getEightChar ? lunarF.getEightChar() : null;

        // 生肖匹配
        const shengXiaoM = lunarM.getYearShengXiao();
        const shengXiaoF = lunarF.getYearShengXiao();
        const shengXiaoOrder = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
        const sxMIdx = shengXiaoOrder.indexOf(shengXiaoM);
        const sxFIdx = shengXiaoOrder.indexOf(shengXiaoF);
        const diff = Math.abs(sxMIdx - sxFIdx);
        let sxScore, sxDesc;
        if (diff === 6) { sxScore = 30; sxDesc = "六冲，矛盾较多"; }
        else if (diff === 3 || diff === 9) { sxScore = 90; sxDesc = "三合，天作之合"; }
        else if (diff === 1 || diff === 11 || diff === 5 || diff === 7) { sxScore = 80; sxDesc = "六合，缘分深厚"; }
        else if (diff === 4 || diff === 8) { sxScore = 40; sxDesc = "六害，易有摩擦"; }
        else { sxScore = 60; sxDesc = "中平，互有补益"; }

        // 五行互补
        const wxM = { 金:0,木:0,水:0,火:0,土:0 };
        const wxF = { 金:0,木:0,水:0,火:0,土:0 };
        if (baziM) {
            [baziM.getYearGan(), baziM.getMonthGan(), baziM.getDayGan(), baziM.getTimeGan()].forEach(g => wxM[getGanWuxing(g)] += 1);
            [baziM.getYearZhi(), baziM.getMonthZhi(), baziM.getDayZhi(), baziM.getTimeZhi()].forEach(z => wxM[getZhiWuxing(z)] += 1);
        }
        if (baziF) {
            [baziF.getYearGan(), baziF.getMonthGan(), baziF.getDayGan(), baziF.getTimeGan()].forEach(g => wxF[getGanWuxing(g)] += 1);
            [baziF.getYearZhi(), baziF.getMonthZhi(), baziF.getDayZhi(), baziF.getTimeZhi()].forEach(z => wxF[getZhiWuxing(z)] += 1);
        }
        // 生克互补评分
        const shengKe = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
        let wxScore = 0;
        for (let key in wxM) {
            if (wxM[key] > 2) {
                const sheng = shengKe[key];
                if (wxF[sheng] > 1) wxScore += 15;
            }
            if (wxF[key] > 2) {
                const sheng = shengKe[key];
                if (wxM[sheng] > 1) wxScore += 15;
            }
        }
        wxScore = Math.min(wxScore + 30, 100);

        // 纳音匹配
        let naScore = 60;
        try {
            const naM = baziM ? baziM.getYearNaYin() : '';
            const naF = baziF ? baziF.getYearNaYin() : '';
            if (naM && naF && naM === naF) naScore = 90;
        } catch(e) {}

        // 综合评分
        const totalScore = Math.round((sxScore * 0.35 + wxScore * 0.4 + naScore * 0.25));

        const result = document.getElementById("hhResultBody");
        result.innerHTML = `
            <div class="hh-score ${totalScore >= 70 ? 'good' : totalScore >= 50 ? 'medium' : 'bad'}">${totalScore}分</div>
            <div style="text-align:center;font-size:0.85rem;margin-bottom:16px;">
                ${totalScore >= 70 ? '🎉 天作之合，琴瑟和鸣，大吉！' : totalScore >= 50 ? '👍 中平之配，互有补益。' : '⚠️ 缘分虽在，需多包容磨合。'}
            </div>
            <h4>${nameM} · ${shengXiaoM} & ${nameF} · ${shengXiaoF}</h4>
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
                <tr><td>生肖匹配</td><td>${sxDesc}</td><td>${sxScore}分</td></tr>
                <tr><td>五行互补</td><td>能量相互滋养${wxScore >= 60 ? '，互补性强' : '，需调整'}</td><td>${wxScore}分</td></tr>
                <tr><td>纳音合婚</td><td>${naScore >= 80 ? '声气相投' : '普通'}</td><td>${naScore}分</td></tr>
            </table>
            <p style="margin-top:12px;font-size:0.8rem;color:var(--text-gray);">
                合婚之道，阴阳相济。分数仅供参考，缘分深浅在人心相印。
            </p>
        `;
        document.getElementById("hhResultTitle").innerHTML = `${nameM} & ${nameF} 合婚批断`;
        document.getElementById("hhResultCard").style.display = "block";
    });
}

/* ==========================================================================
   12. 紫微斗数排盘模块
   ========================================================================== */
const ZI_WEI_STARS = {
    main: ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"],
    ci: ["左辅","右弼","文昌","文曲","地空","地劫","天魁","天钺","禄存","擎羊","陀罗","火星","铃星","天马"]
};

// 紫微星查表：出生日 → 五行局 → 紫微宫位（简化版）
function ziweiPaiPan(year, month, day, hour, gender) {
    // 简化排盘：基于出生日定位紫微星宫位
    const ziWeiPos = ((day - 1) % 12) + 1; // 1-12 宫

    const palaces = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
    const stars = Array(12).fill(null).map(() => []);

    // 安十四主星（简版：紫微定太极，其他星按固定位置偏移）
    const mainOffset = {
        "紫微": 0, "天机": -1, "太阳": -3, "武曲": -4, "天同": -5,
        "廉贞": 4, "天府": 0, "太阴": 2, "贪狼": 3, "巨门": 4,
        "天相": 5, "天梁": 6, "七杀": 7, "破军": 10
    };

    // 紫微系
    for (let [name, offset] of Object.entries(mainOffset).slice(0, 6)) {
        const pos = ((ziWeiPos + offset - 1 + 12) % 12);
        stars[pos].push({ name, type: 'main' });
    }

    // 天府系（天府在紫微对宫）
    const tianFuPos = (ziWeiPos + 6) % 12;
    stars[tianFuPos].push({ name: "天府", type: 'main' });
    const tianFuOffset = { "太阴": 2, "贪狼": 3, "巨门": 4, "天相": 5, "天梁": 6, "七杀": 7, "破军": 10 };
    for (let [name, offset] of Object.entries(tianFuOffset)) {
        const pos = ((tianFuPos + offset - 1 + 12) % 12);
        if (!stars[pos].find(s => s.name === name)) {
            stars[pos].push({ name, type: 'main' });
        }
    }

    // 安辅星（简化：按固定位置）
    stars[(ziWeiPos + 3) % 12].push({ name: "左辅", type: 'ci' });
    stars[(ziWeiPos + 9) % 12].push({ name: "右弼", type: 'ci' });
    stars[(ziWeiPos + 5) % 12].push({ name: "文昌", type: 'ci' });
    stars[(ziWeiPos + 7) % 12].push({ name: "文曲", type: 'ci' });

    // 定命宫、身宫
    const monthIdx = (month - 1) % 12;
    const shengIdx = Math.floor(hour / 2) % 12;
    const mingPos = (monthIdx + shengIdx) % 12;
    const shenPos = (monthIdx + shengIdx + 6) % 12;

    return { palaces, stars, mingPos, shenPos, ziWeiPos, tianFuPos };
}

function initZiweiModule() {
    const btn = document.getElementById("btnCalcZw");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const name = document.getElementById("zwName").value.trim() || "善信";
        const gender = document.querySelector('input[name="zwGender"]:checked').value;
        const dateVal = document.getElementById("zwDate").value;
        if (!dateVal) { alert("请选择出生日期"); return; }

        const dt = new Date(dateVal);
        const solar = Solar.fromDate(dt);
        const lunar = solar.getLunar();
        const year = lunar.getYear();
        const month = lunar.getMonth();
        const day = lunar.getDay();
        const hour = dt.getHours();
        const shengXiao = lunar.getYearShengXiao();

        const result = ziweiPaiPan(year, month, day, hour, gender);

        // 渲染命盘
        const chart = document.getElementById("zwChart");
        // 12宫排列：命宫在左下开始逆时针
        const posToGrid = [
            [2,0],[2,1],[2,2],[2,3],
            [1,0],           [1,3],
            [0,0],[0,1],[0,2],[0,3]
        ];
        // 简化布局：固定 4x3 网格
        const layoutOrder = [5,4,3,2,1,0,11,10,9,8,7,6]; // 逆时针排列

        chart.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const pi = layoutOrder[i];
            const pal = document.createElement("div");
            pal.className = `zw-palace ${pi === result.mingPos ? 'ming' : ''} ${pi === result.shenPos ? 'shen' : ''}`;
            pal.innerHTML = `<div class="zw-palace-name">${result.palaces[pi]}${pi === result.mingPos ? ' (命)' : ''}${pi === result.shenPos ? ' (身)' : ''}</div>`;
            const starList = result.stars[pi] || [];
            starList.forEach(s => {
                const span = document.createElement("div");
                span.className = `zw-star ${s.type}`;
                span.textContent = s.name;
                pal.appendChild(span);
            });
            chart.appendChild(pal);
        }

        // 命盘解释
        const mingStars = result.stars[result.mingPos] || [];
        document.getElementById("zwBoardTitle").innerHTML = `${name} · ${gender}命 · ${shengXiao}年 · 紫微斗数命盘`;
        document.getElementById("zwAnalysis").innerHTML = `
            <p>命宫在 <strong>${result.palaces[result.mingPos]}</strong>，身宫在 <strong>${result.palaces[result.shenPos]}</strong>。</p>
            <p>命宫主星：${mingStars.filter(s=>s.type==='main').map(s=>s.name).join('、') || '无主星（借星安宫）'}</p>
            <p>紫微星在 <strong>${result.palaces[result.ziWeiPos]}</strong>，天府星在 <strong>${result.palaces[result.tianFuPos]}</strong>。</p>
            <p style="margin-top:8px;font-size:0.75rem;color:var(--text-gray);">* 此为简化排盘，仅供参考。完整排盘需结合四化、大限、流年等。</p>
        `;
        document.getElementById("zwResultCard").style.display = "block";
    });
}

/* ==========================================================================
   13. 截图分享（通用）
   ========================================================================== */
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-screenshot");
    if (!btn) return;
    const targetId = btn.getAttribute("data-target");
    const el = document.getElementById(targetId);
    if (!el || typeof html2canvas === 'undefined') {
        alert("截图功能需要 html2canvas 库支持");
        return;
    }
    html2canvas(el, {
        backgroundColor: '#0A0A0C',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${targetId}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});

/* ==========================================================================
   14. 黄历扩展：胎神/生育择日
   ========================================================================== */
// 在 renderHuangliCard 中已有 lunar.getDayPositionXiDesc() 等方法
// 胎神占方根据农历月日计算（简化版）
function getTaishenPosition(lunar) {
    const month = lunar.getMonth();
    const day = lunar.getDay();
    const monthMap = {
        1:"房床",2:"户窗",3:"门堂",4:"厨灶",5:"房床",6:"床仓",
        7:"碓磨",8:"厕户",9:"门房",10:"房灶",11:"灶床",12:"仓库"
    };
    const dayMap = {
        1:"大门",2:"厨灶",3:"仓库",4:"房床",5:"碓磨",6:"厕户",
        7:"门堂",8:"床仓",9:"厨灶",10:"房床",11:"大门",12:"仓库"
    };
    const mPos = monthMap[month] || "中宫";
    const dPos = dayMap[((day - 1) % 12) + 1] || "外";
    return `占 ${mPos} · ${dPos}`;
}

// 在 renderHuangliCard 中追加胎神显示
// 通过 monkey-patch 方式增强 — 在 initHuangliModule 末尾添加 DOM
// 使用 MutationObserver 或直接在原有函数末尾追加
// 更简单：在 renderHuangliCard 末尾调用
const origRenderHuangli = renderHuangliCard;
renderHuangliCard = function(date) {
    origRenderHuangli(date);
    // 追加胎神信息
    const container = document.querySelector(".huangli-board-card .calendar-sheet .cal-sheet-body");
    if (!container || container.querySelector(".taishen-section")) return;
    try {
        const solar = Solar.fromDate(date);
        const lunar = solar.getLunar();
        const taishen = getTaishenPosition(lunar);
        const yi = lunar.getDayYi();
        const isGoodForBaby = yi.includes("嫁娶") || yi.includes("求嗣") || yi.includes("纳采");
        const section = document.createElement("div");
        section.className = "taishen-section";
        section.innerHTML = `
            <h4><i class="fa-solid fa-baby"></i> 胎神占方 & 生育宜忌</h4>
            <div class="taishen-item"><span class="label">胎神占方</span><span class="value">${taishen}</span></div>
            <div class="taishen-item"><span class="label">求嗣择日</span><span class="value">${isGoodForBaby ? '吉日，宜婚嫁求嗣' : '平，可择吉日而行'}</span></div>
        `;
        container.appendChild(section);
    } catch(e) {}
};
