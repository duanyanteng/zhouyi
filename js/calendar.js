import { AppState, restoreBaziInput } from './state.js?20260626-5';
import { getGuaFromDirection, getGanWuxing, getZhiWuxing } from './utils.js?20260626-5';

function initClock() {
    const clockEl = document.getElementById("headerClock");
    if (!clockEl) return;

    const solarTimeEl = clockEl.querySelector(".solar-time");
    const lunarTimeEl = clockEl.querySelector(".lunar-time");
    const ganzhiTimeEl = clockEl.querySelector(".ganzhi-time");

    function updateClock() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const weekDay = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];

        solarTimeEl.innerHTML = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} 星期${weekDay}`;

        try {
            const solar = Solar.fromDate(now);
            const lunar = solar.getLunar();
            const baZi = lunar.getEightChar();

            const yearGanZhi = baZi.getYearGanZhi ? baZi.getYearGanZhi() : (baZi.getYearGan() + baZi.getYearZhi());
            const monthGanZhi = baZi.getMonthGanZhi ? baZi.getMonthGanZhi() : (baZi.getMonthGan() + baZi.getMonthZhi());
            const dayGanZhi = baZi.getDayGanZhi ? baZi.getDayGanZhi() : (baZi.getDayGan() + baZi.getDayZhi());
            const timeGanZhi = baZi.getTimeGanZhi ? baZi.getTimeGanZhi() : (baZi.getTimeGan() + baZi.getTimeZhi());

            lunarTimeEl.innerHTML = `农历：${lunar.getYearInGanZhi()}年(${lunar.getYearShengXiao()}) ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getJieQi() ? ' • ' + lunar.getJieQi() : ''}`;
            ganzhiTimeEl.innerHTML = `天时：${yearGanZhi}年 ${monthGanZhi}月 ${dayGanZhi}日 ${timeGanZhi}时`;
        } catch (err) {
            console.error("历法时钟计算错误:", err);
        }
    }

    updateClock();
    setInterval(updateClock, 1000);
}

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

    const posItems = document.querySelectorAll(".position-item");
    const pointer = document.getElementById("compassPointer");
    posItems.forEach(item => {
        item.addEventListener("click", () => {
            const deg = item.getAttribute("data-deg");
            pointer.style.transform = `rotate(${deg}deg)`;
        });
    });

    renderMonthlyCalendar(AppState.huangliDate);
}

function renderHuangliCard(date) {
    try {
        const solar = Solar.fromDate(date);
        const lunar = solar.getLunar();

        document.getElementById("hlCurrentDateLabel").innerHTML = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        document.getElementById("hlGanzhiDisplay").innerHTML = `${lunar.getYearInGanZhi()}年(${lunar.getYearShengXiao()}) ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`;
        document.getElementById("hlLunarDisplay").innerHTML = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
        document.getElementById("hlSolarDay").innerHTML = date.getDate();
        document.getElementById("hlSolarYearMonth").innerHTML = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')} | 星期${["日","一","二","三","四","五","六"][date.getDay()]}`;

        const yiList = lunar.getDayYi();
        const jiList = lunar.getDayJi();
        document.getElementById("hlYiList").innerHTML = yiList.length > 0 ? yiList.join("、") : "诸事皆宜 (平)";
        document.getElementById("hlJiList").innerHTML = jiList.length > 0 ? jiList.join("、") : "诸事无忌 (大吉)";

        const pengZuTian = lunar.getPengZuBaiJiTian ? lunar.getPengZuBaiJiTian() : (lunar.getDayInGanZhi ? `${lunar.getDayInGanZhi()}日` : '诸事平安');
        const pengZuDi = lunar.getPengZuBaiJiDi ? lunar.getPengZuBaiJiDi() : (() => { const d = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][new Date(date).getHours() % 12]; return `${d}时`; })();
        document.getElementById("hlPengzu").innerHTML = `${pengZuTian}，${pengZuDi}`;

        document.getElementById("hlPositionXi").innerHTML = `${lunar.getDayPositionXiDesc()} (${getGuaFromDirection(lunar.getDayPositionXiDesc())})`;
        document.getElementById("hlPositionCai").innerHTML = `${lunar.getDayPositionCaiDesc()} (${getGuaFromDirection(lunar.getDayPositionCaiDesc())})`;
        document.getElementById("hlPositionFu").innerHTML = `${lunar.getDayPositionFuDesc()} (${getGuaFromDirection(lunar.getDayPositionFuDesc())})`;

        const caiDirection = lunar.getDayPositionCaiDesc();
        const degMap = { '正南':180,'正北':0,'正东':90,'正西':270,'东北':45,'东南':135,'西北':315,'西南':225 };
        document.getElementById("compassPointer").style.transform = `rotate(${degMap[caiDirection] || 0}deg)`;

        const dashLunar = document.getElementById("dashLunarDate");
        const dashSolar = document.getElementById("dashSolarDate");
        const dashYi = document.getElementById("dashYiList");
        const dashJi = document.getElementById("dashJiList");
        if (dashLunar) {
            dashLunar.innerHTML = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
            dashSolar.innerHTML = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${["日","一","二","三","四","五","六"][date.getDay()]}`;
            dashYi.innerHTML = yiList.slice(0, 5).join("、");
            dashJi.innerHTML = jiList.slice(0, 5).join("、");
        }

        renderMonthlyCalendar(date);

        // 胎神信息
        const taishenContainer = document.querySelector(".huangli-board-card .calendar-sheet .cal-sheet-body");
        if (taishenContainer && !taishenContainer.querySelector(".taishen-section")) {
            try {
                const taishen = getTaishenPosition(lunar);
                const yi = lunar.getDayYi();
                const isGoodForBaby = yi.includes("嫁娶") || yi.includes("求嗣") || yi.includes("纳采");
                const section = document.createElement("div");
                section.className = "taishen-section";
                section.innerHTML = `<h4><i class="fa-solid fa-baby"></i> 胎神占方 & 生育宜忌</h4><div class="taishen-item"><span class="label">胎神占方</span><span class="value">${taishen}</span></div><div class="taishen-item"><span class="label">求嗣择日</span><span class="value">${isGoodForBaby ? '吉日，宜婚嫁求嗣' : '平，可择吉日而行'}</span></div>`;
                taishenContainer.appendChild(section);
            } catch(e) {}
        }

    } catch (e) {
        console.error("黄历渲染错误:", e);
    }
}

function filterJiriList(event) {
    const container = document.getElementById("jiriResultsList");
    container.innerHTML = '';
    const results = [];
    const scanDate = new Date(AppState.huangliDate);
    const combineBazi = document.getElementById("jiriCombineBazi")?.checked || false;

    // 获取八字喜用神（如果启用）
    let xiYongWx = null;
    if (combineBazi) {
        const savedBazi = restoreBaziInput();
        if (savedBazi && savedBazi.date) {
            try {
                const birthDate = new Date(savedBazi.date);
                const solar = Solar.fromDate(birthDate);
                const lunar = solar.getLunar();
                const baZi = lunar.getEightChar();
                const dayGan = baZi.getDayGan();
                const dayWx = getGanWuxing(dayGan);

                // 简化的喜用神计算：日主弱则喜生扶，日主强则喜克泄
                const wxCount = { 金:0, 木:0, 水:0, 火:0, 土:0 };
                [baZi.getYearGan(), baZi.getMonthGan(), baZi.getDayGan(), baZi.getTimeGan()].forEach(g => {
                    wxCount[getGanWuxing(g)] += 2;
                });
                [baZi.getYearZhi(), baZi.getMonthZhi(), baZi.getDayZhi(), baZi.getTimeZhi()].forEach(z => {
                    wxCount[getZhiWuxing(z)] += 2.5;
                });

                const total = Object.values(wxCount).reduce((a, b) => a + b, 0);
                const dayMasterStrength = (wxCount[dayWx] / total) * 100;

                const shengMap = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
                const keMap = { '金':'木','木':'土','土':'水','水':'火','火':'金' };

                // 日主弱（<30%）喜生扶，日主强（>40%）喜克泄
                if (dayMasterStrength < 30) {
                    xiYongWx = [dayWx, shengMap[dayWx]]; // 喜日主本身和生日主的五行
                } else if (dayMasterStrength > 40) {
                    xiYongWx = [keMap[dayWx], shengMap[dayWx]]; // 喜克日主和日主生的五行
                } else {
                    xiYongWx = [shengMap[dayWx], keMap[dayWx]]; // 平衡状态，喜生和克
                }
            } catch(e) {
                console.error("获取八字信息失败:", e);
            }
        }
    }

    for (let i = 0; i < 30; i++) {
        const solar = Solar.fromDate(scanDate);
        const lunar = solar.getLunar();
        const yiList = lunar.getDayYi();
        const jiList = lunar.getDayJi();

        if (yiList.includes(event) && !jiList.includes(event)) {
            let score = Math.min(yiList.length * 8 + 20, 100);

            // 如果结合八字，根据日干支五行调整评分
            if (combineBazi && xiYongWx) {
                const dayGanZhi = lunar.getDayInGanZhi();
                const dayGan = dayGanZhi[0];
                const dayWx = getGanWuxing(dayGan);

                if (xiYongWx.includes(dayWx)) {
                    score = Math.min(score + 15, 100); // 喜用神五行加分
                }
            }

            results.push({
                dateStr: `${scanDate.getFullYear()}-${String(scanDate.getMonth() + 1).padStart(2,'0')}-${String(scanDate.getDate()).padStart(2,'0')}`,
                lunarStr: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
                ganzhiStr: `${lunar.getDayInGanZhi()}日`,
                score: score,
                rawDate: new Date(scanDate),
                combineBazi: combineBazi
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
        const scoreCls = res.score >= 70 ? "high" : res.score >= 50 ? "mid" : "low";
        const baziBadge = res.combineBazi ? '<span style="display:inline-block;padding:1px 6px;margin-left:6px;font-size:0.65rem;background:var(--text-gold)22;color:var(--text-gold);border-radius:4px;border:1px solid var(--text-gold)44;">八字</span>' : '';
        item.innerHTML = `
            <span class="date-info">${res.dateStr}</span>
            <span class="lunar-info">${res.lunarStr} (${res.ganzhiStr})${baziBadge}</span>
            <span class="jiri-score ${scoreCls}">${res.score}分</span>
        `;
        item.addEventListener("click", () => {
            AppState.huangliDate = res.rawDate;
            renderHuangliCard(AppState.huangliDate);
            const frame = document.querySelector(".huangli-wood-frame");
            frame.style.animation = "pulseGlow 0.5s ease";
            setTimeout(() => { frame.style.animation = ""; }, 500);
        });
        container.appendChild(item);
    });

    // 如果结合了八字，显示提示信息
    if (combineBazi && xiYongWx) {
        const tip = document.createElement("div");
        tip.style.cssText = "margin-top:10px;padding:8px 12px;background:var(--text-gold)11;border:1px solid var(--text-gold)33;border-radius:6px;font-size:0.72rem;color:var(--text-gold);";
        tip.innerHTML = `<i class="fa-solid fa-circle-info"></i> 已结合您的八字喜用神（${xiYongWx.join('、')}）优选吉日`;
        container.appendChild(tip);
    }
}

function renderMonthlyCalendar(date) {
    const container = document.getElementById("monthlyCalendarGrid");
    if (!container) return;
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekDay = firstDay.getDay();
    container.innerHTML = '';
    const weekHeaders = ["日","一","二","三","四","五","六"];
    weekHeaders.forEach(w => {
        const h = document.createElement("div");
        h.className = "cal-week-header";
        h.textContent = w;
        container.appendChild(h);
    });
    for (let i = 0; i < startWeekDay; i++) {
        const blank = document.createElement("div");
        blank.className = "cal-day-cell blank";
        container.appendChild(blank);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const cellDate = new Date(year, month, d);
        const cell = document.createElement("div");
        cell.className = "cal-day-cell";
        try {
            const s = Solar.fromDate(cellDate);
            const l = s.getLunar();
            const yi = l.getDayYi();
            const ji = l.getDayJi();
            const score = yi.length * 5 + (ji.length > 0 ? -ji.length * 3 : 5);
            const scoreCls = score >= 20 ? "high" : score >= 10 ? "mid" : "low";
            cell.innerHTML = `<span class="cal-day-num">${d}</span><span class="cal-day-lunar">${l.getDayInChinese()}</span><span class="cal-day-score ${scoreCls}">${score}</span>`;
            cell.addEventListener("click", () => {
                AppState.huangliDate = new Date(cellDate);
                renderHuangliCard(AppState.huangliDate);
            });
        } catch(e) {
            cell.innerHTML = `<span class="cal-day-num">${d}</span>`;
        }
        if (cellDate.toDateString() === new Date().toDateString()) cell.classList.add("today");
        if (d === AppState.huangliDate.getDate()) cell.classList.add("active");
        container.appendChild(cell);
    }
}

function getTaishenPosition(lunar) {
    const month = lunar.getMonth();
    const day = lunar.getDay();
    const monthMap = {1:"房床",2:"户窗",3:"门堂",4:"厨灶",5:"房床",6:"床仓",7:"碓磨",8:"厕户",9:"门房",10:"房灶",11:"灶床",12:"仓库"};
    const dayMap = {1:"大门",2:"厨灶",3:"仓库",4:"房床",5:"碓磨",6:"厕户",7:"门堂",8:"床仓",9:"厨灶",10:"房床",11:"大门",12:"仓库"};
    return `占 ${monthMap[month] || "中宫"} · ${dayMap[((day - 1) % 12) + 1] || "外"}`;
}

export { initClock, initHuangliModule, renderHuangliCard, filterJiriList, renderMonthlyCalendar, getTaishenPosition };