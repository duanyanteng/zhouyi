import { AppState, saveBaziInput } from './state.js';
import { getGanWuxing, getZhiWuxing, getWuxingEng, getDiShi, getMaxWuxing, getMinWuxing } from './utils.js';

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

        saveBaziInput(name, gender, dateVal);

        const birthDate = new Date(dateVal);
        const solar = Solar.fromDate(birthDate);
        const lunar = solar.getLunar();
        const baZi = lunar.getEightChar();

        document.getElementById("baziBoardTitle").innerHTML = `${gender === "男" ? "乾造" : "坤造"}八字命盘 • 善信【${name}】`;

        const colYear = document.getElementById("colYear");
        const colMonth = document.getElementById("colMonth");
        const colDay = document.getElementById("colDay");
        const colTime = document.getElementById("colTime");

        const yg = baZi.getYearGan(), yz = baZi.getYearZhi();
        const mg = baZi.getMonthGan(), mz = baZi.getMonthZhi();
        const dg = baZi.getDayGan(), dz = baZi.getDayZhi();
        const tg = baZi.getTimeGan(), tz = baZi.getTimeZhi();

        const yearShiShen = baZi.getYearShiShenGan ? baZi.getYearShiShenGan() : (baZi.getYearShiShen ? baZi.getYearShiShen() : "七杀");
        const monthShiShen = baZi.getMonthShiShenGan ? baZi.getMonthShiShenGan() : (baZi.getMonthShiShen ? baZi.getMonthShiShen() : "正印");
        const timeShiShen = baZi.getTimeShiShenGan ? baZi.getTimeShiShenGan() : (baZi.getTimeShiShen ? baZi.getTimeShiShen() : "正印");

        const yearCang = baZi.getYearCangGan ? baZi.getYearCangGan() : (baZi.getYearZhiCangGan ? baZi.getYearZhiCangGan() : ["甲","丙","戊"]);
        const monthCang = baZi.getMonthCangGan ? baZi.getMonthCangGan() : (baZi.getMonthZhiCangGan ? baZi.getMonthZhiCangGan() : ["辛"]);
        const dayCang = baZi.getDayCangGan ? baZi.getDayCangGan() : (baZi.getDayZhiCangGan ? baZi.getDayZhiCangGan() : ["丁","己"]);
        const timeCang = baZi.getTimeCangGan ? baZi.getTimeCangGan() : (baZi.getTimeZhiCangGan ? baZi.getTimeZhiCangGan() : ["己","癸","辛"]);

        renderBaziCol(colYear, "年柱", yg, yz, yearShiShen, lunar.getYearShengXiao(), baZi.getYearNaYin(), getDiShi(yg, yz));
        renderBaziCol(colMonth, "月柱", mg, mz, monthShiShen, monthCang.join(','), baZi.getMonthNaYin(), getDiShi(mg, mz));
        renderBaziCol(colDay, "日元 (元神)", dg, dz, "日主", dayCang.join(','), baZi.getDayNaYin(), getDiShi(dg, dz));
        renderBaziCol(colTime, "时柱", tg, tz, timeShiShen, timeCang.join(','), baZi.getTimeNaYin(), getDiShi(tg, tz));

        calculateWuxing(yg, yz, mg, mz, dg, dz, tg, tz);
        generateBaziAnalysis(name, gender, yg, yz, mg, mz, dg, dz, tg, tz, baZi);

        const resultArea = document.getElementById("baziResultArea");
        resultArea.style.display = "block";
        setTimeout(drawWuxingRadar, 100);
    });
}

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

function calculateWuxing(yg, yz, mg, mz, dg, dz, tg, tz) {
    const baseWuxing = { 金:0,木:0,水:0,火:0,土:0 };
    [yg, mg, dg, tg].forEach(g => baseWuxing[getGanWuxing(g)] += 1.5);
    [yz, mz, dz, tz].forEach(z => baseWuxing[getZhiWuxing(z)] += 2.0);
    baseWuxing[getZhiWuxing(mz)] += 2.0;

    const total = Object.values(baseWuxing).reduce((a, b) => a + b, 0);
    const barsContainer = document.getElementById("wuxingBarsContainer");
    barsContainer.innerHTML = '';

    for (let key in baseWuxing) {
        const percentage = Math.round((baseWuxing[key] / total) * 100);
        AppState.wuxingData[key] = percentage;

        const barItem = document.createElement("div");
        barItem.className = "wuxing-bar-item";
        barItem.innerHTML = `
            <span class="wuxing-name text-${getWuxingEng(key)}">${key}</span>
            <div class="wuxing-progress-bg">
                <div class="wuxing-progress-fill" style="width:${percentage}%;background-color:var(--color-${getWuxingEng(key)});box-shadow:0 0 6px var(--color-${getWuxingEng(key)})"></div>
            </div>
            <span class="wuxing-val">${percentage}%</span>
        `;
        barsContainer.appendChild(barItem);
    }
}

function drawWuxingRadar() {
    const canvas = document.getElementById("wuxingRadarCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = canvas.width / 2;
    const radius = center - 30;
    const labels = ["金","木","水","火","土"];
    const values = [
        AppState.wuxingData["金"] || 20, AppState.wuxingData["木"] || 20,
        AppState.wuxingData["水"] || 20, AppState.wuxingData["火"] || 20, AppState.wuxingData["土"] || 20
    ];

    ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
    ctx.lineWidth = 1;
    for (let j = 1; j <= 5; j++) {
        ctx.beginPath();
        const r = (radius / 5) * j;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        ctx.moveTo(center, center);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const valRatio = Math.min(values[i] / 50, 1.0);
        const r = radius * valRatio;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(212, 175, 55, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 13px 'Noto Serif SC', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = center + (radius + 15) * Math.cos(angle);
        const y = center + (radius + 15) * Math.sin(angle);
        ctx.fillStyle = `var(--color-${getWuxingEng(labels[i])})`;
        ctx.fillText(labels[i], x, y);
        const valRatio = Math.min(values[i] / 50, 1.0);
        const dotX = center + (radius * valRatio) * Math.cos(angle);
        const dotY = center + (radius * valRatio) * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `var(--color-${getWuxingEng(labels[i])})`;
        ctx.fill();
    }
}

function generateBaziAnalysis(name, gender, yg, yz, mg, mz, dg, dz, tg, tz, lunarObj) {
    const analysisEl = document.getElementById("baziDetailAnalysis");
    const dgGan = dg;
    const wx = getGanWuxing(dgGan);

    const summaryText = document.getElementById("baziSummaryText");
    const maxWx = getMaxWuxing();
    const minWx = getMinWuxing();
    const balanceDesc = (() => {
        if (AppState.wuxingData[maxWx] - AppState.wuxingData[minWx] <= 15) return "五行均衡";
        const strong = AppState.wuxingData[maxWx] >= 35 ? "偏旺" : "偏强";
        const weak = AppState.wuxingData[minWx] <= 15 ? "偏弱" : "偏弱";
        return `${maxWx}${strong}、${minWx}${weak}`;
    })();
    if (summaryText) {
        summaryText.innerHTML = `命盘平衡：<strong>${balanceDesc}</strong> &nbsp;|&nbsp; 旺势五行：<strong class="text-${getWuxingEng(maxWx)}">${maxWx}</strong> &nbsp;|&nbsp; 待补五行：<strong class="text-${getWuxingEng(minWx)}">${minWx}</strong>`;
    }

    const htmlContent = `
        <p><strong>${name}</strong>善信，今日得观阁下这造八字。大凡乾坤之命，各有玄妙，以日元代表自我，五行消长指点迷津：</p>
        <h4>一、本命元神</h4>
        <p>您的本命元神为 <strong>${dgGan}${wx}</strong>。生于 <strong>${mz}月</strong>，五行气场独特。以 <strong>${dgGan}</strong> 之性，立身处世自有其天赋。${wx === '水' ? '水主智慧，奔流不息，具包容之德，善于应变。' : ''}${wx === '木' ? '木主仁慈，蓬勃向上，具生发之机，富有同情心。' : ''}${wx === '火' ? '火主礼仪，热情澎湃，具照耀之能，性急而刚正。' : ''}${wx === '土' ? '土主信义，厚德载物，具包容之量，稳重而踏实。' : ''}${wx === '金' ? '金主义气，刚毅果决，具变革之勇，仗义而执着。' : ''}</p>
        <h4>二、五行能量气场</h4>
        <p>根据您的天干地支综合计算，目前您命盘中能量最旺的五行是 <strong>${getMaxWuxing()}</strong>，相对较弱的五行是 <strong>${getMinWuxing()}</strong>。易理的核心在于求得"中庸平衡"。较旺的五行需要适当发泄或克制，较弱的五行则需要在后天起居、色彩、地理和行为上予以弥补，以此调和全身气场，达到趋吉避凶之效。</p>
        <h4>三、大师开运点拨</h4>
        <p>1. <strong>行为开运</strong>：平日里做决策，要多结合您的弱势五行进行调整。多向您命中"喜用神"代表的行业或方向发展。<br>2. <strong>色彩调和</strong>：建议多采用 <strong>${getWuxingColor()}</strong> 颜色的服饰、软装等，从而在气场上形成良好的五行循环。<br>3. <strong>修心立德</strong>：古人云："一命二运三风水，四积阴德五读书。" 掌握命运运行的轨迹，顺应时势，定能得天地之眷顾。</p>
    `;
    analysisEl.innerHTML = htmlContent;
}

function getWuxingColor() {
    const min = getMinWuxing();
    const colors = { '金':'乳白、浅黄、金色','木':'青色、翠绿、玉色','水':'玄黑、天蓝、墨色','火':'朱砂红、紫色、粉色','土':'黄褐色、土黄、金色' };
    return colors[min] || '金色';
}

export { initBaziModule, drawWuxingRadar, calculateWuxing, generateBaziAnalysis, renderBaziCol };
