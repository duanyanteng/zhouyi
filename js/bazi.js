import { AppState, saveBaziInput } from './state.js?v=20260618-4';

import { getGanWuxing, getZhiWuxing, getWuxingEng, getDiShi, getMaxWuxing, getMinWuxing } from './utils.js?v=20260618-4';
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

        // Show skeleton loading
        const analysisEl = document.getElementById("baziDetailAnalysis");
        if (analysisEl) {
            analysisEl.innerHTML = `
                <div class="bazi-report-loading">
                    <div class="skeleton-card"><div class="skeleton-pulse skeleton-block w40"></div><div class="skeleton-pulse skeleton-block"></div><div class="skeleton-pulse skeleton-block w80"></div></div>
                    <div class="skeleton-card"><div class="skeleton-pulse skeleton-block w40"></div><div class="skeleton-pulse skeleton-block"></div><div class="skeleton-pulse skeleton-block w60"></div><div class="skeleton-pulse skeleton-block"></div></div>
                    <div class="skeleton-card"><div class="skeleton-pulse skeleton-block w40"></div><div class="skeleton-pulse skeleton-block w80"></div><div class="skeleton-pulse skeleton-block"></div></div>
                </div>`;
        }

        // Use setTimeout to let skeleton render before heavy computation
        setTimeout(() => {

        const birthDate = new Date(dateVal);
        const solar = Solar.fromDate(birthDate);
        const lunar = solar.getLunar();
        const baZi = lunar.getEightChar();

        document.getElementById("baziBoardTitle").innerHTML = `${gender === "男" ? "乾造" : "坤造"}八字命理分析报告 • ${name}`;

        const colYear = document.getElementById("colYear");
        const colMonth = document.getElementById("colMonth");
        const colDay = document.getElementById("colDay");
        const colTime = document.getElementById("colTime");

        const yg = baZi.getYearGan(), yz = baZi.getYearZhi();
        const mg = baZi.getMonthGan(), mz = baZi.getMonthZhi();
        const dg = baZi.getDayGan(), dz = baZi.getDayZhi();
        const tg = baZi.getTimeGan(), tz = baZi.getTimeZhi();

        const yearShiShen = baZi.getYearShiShenGan();
        const monthShiShen = baZi.getMonthShiShenGan();
        const timeShiShen = baZi.getTimeShiShenGan();

        const yearCang = baZi.getYearHideGan();
        const monthCang = baZi.getMonthHideGan();
        const dayCang = baZi.getDayHideGan();
        const timeCang = baZi.getTimeHideGan();

        renderBaziCol(colYear, "年柱", yg, yz, yearShiShen, (yearCang || []).join(','), baZi.getYearNaYin(), getDiShi(yg, yz));
        renderBaziCol(colMonth, "月柱", mg, mz, monthShiShen, (monthCang || []).join(','), baZi.getMonthNaYin(), getDiShi(mg, mz));
        renderBaziCol(colDay, "日元 (元神)", dg, dz, "日主", (dayCang || []).join(','), baZi.getDayNaYin(), getDiShi(dg, dz));
        renderBaziCol(colTime, "时柱", tg, tz, timeShiShen, (timeCang || []).join(','), baZi.getTimeNaYin(), getDiShi(tg, tz));

        calculateWuxing(yg, yz, mg, mz, dg, dz, tg, tz);
        generateBaziAnalysis(name, gender, baZi, solar, lunar);

        const resultArea = document.getElementById("baziResultArea");
        resultArea.style.display = "block";
        setTimeout(drawWuxingRadar, 100);

        // Dispatch custom event for history save
        document.dispatchEvent(new CustomEvent('bazi-analysis-complete', { detail: { name, gender, date: dateVal } }));
    }, 50);
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

/* ========== 增强版命批 ========== */

const GAN_DESC = {
    '甲': { wx:'木', yin:'阳', name:'甲木 · 参天栋梁', desc:'甲木为阳木，如参天大树，正直挺拔、顶天立地。甲木之人格局宏阔，有领导风范，不惧艰难，敢于担当。天生具有开拓精神，适合做开创性事业。然甲木过旺则刚愎自用，需金来雕琢方能成器。' },
    '乙': { wx:'木', yin:'阴', name:'乙木 · 花草藤萝', desc:'乙木为阴木，如藤萝花草，柔韧善附、灵活多变。乙木之人善于适应环境，心思细腻，有很强的审美力和策划力。看似柔弱实则坚韧，能在夹缝中求生。乙木喜甲木为靠，喜丙火温暖。' },
    '丙': { wx:'火', yin:'阳', name:'丙火 · 太阳之火', desc:'丙火为阳火，如太阳当空，光芒万丈、热情慷慨。丙火之人性格开朗大方，乐于助人，有极强的人格魅力和感染力。做事有魄力，但易急躁冲动。丙火喜壬水之映照，水火既济方能成就大业。' },
    '丁': { wx:'火', yin:'阴', name:'丁火 · 灯烛之火', desc:'丁火为阴火，如灯烛之光，温和细腻、文明有礼。丁火之人聪明灵秀，善于思考，在文化、艺术、科技领域有天赋。外表温文尔雅，内心自有坚持。丁火喜庚金来锻炼，形成"丁火炼金"的贵格。' },
    '戊': { wx:'土', yin:'阳', name:'戊土 · 高岗厚土', desc:'戊土为阳土，如巍峨高山，稳重诚信、包容厚重。戊土之人一诺千金，做事踏实可靠，有大地的承载之德。性格沉稳大度，适合从事管理、地产、建筑等稳定领域。戊土喜甲木来疏通，喜癸水来滋润。' },
    '己': { wx:'土', yin:'阴', name:'己土 · 田园之土', desc:'己土为阴土，如田园沃土，谦逊务实、善于滋养。己土之人性格温和包容，善于协调，有很强的服务意识和执行力。虽不如戊土那般锋芒毕露，但胜在持久绵长。己土喜丙火照耀，喜庚金相生。' },
    '庚': { wx:'金', yin:'阳', name:'庚金 · 斧钺之金', desc:'庚金为阳金，如钢铁刀剑，刚毅果断、杀伐决断。庚金之人性格刚直，讲义气，有极强的执行力和变革精神。做事雷厉风行，不适合做繁琐细致的案头工作。庚金喜丁火来锻炼，铸成利器。' },
    '辛': { wx:'金', yin:'阴', name:'辛金 · 珠玉之金', desc:'辛金为阴金，如珠宝玉石，精致细腻、品位高雅。辛金之人审美出众，追求品质生活，在艺术、设计、珠宝等领域有天然优势。外表温和，内心清高，有自己的价值标准。辛金喜壬水来洗涤，愈显光华。' },
    '壬': { wx:'水', yin:'阳', name:'壬水 · 江河之水', desc:'壬水为阳水，如长江大河，奔流不息、智慧深邃。壬水之人胸襟开阔，思维敏捷，善于变通和谋划。有很强的战略眼光和宏观思维能力，适合做决策者和规划者。壬水喜戊土来筑堤，方能有所归依。' },
    '癸': { wx:'水', yin:'阴', name:'癸水 · 雨露之水', desc:'癸水为阴水，如雨露甘霖，细腻敏锐、洞察入微。癸水之人直觉极强，善于捕捉细节和信息，在科研、玄学、侦探等领域有卓越天赋。外表沉静内敛，内心世界丰富。癸水喜己土为伴侣，喜丙火为温暖。' }
};

const NAYIN_DESC = {
    '海中金':'如龙潜深渊之金，贵气内藏，待时运而发',
    '炉中火':'如洪炉冶炼之火，热情炽烈，能量充沛',
    '大林木':'如茂密森林之木，生机旺盛，团队协作强',
    '路旁土':'如路边滋养之土，低调务实，脚踏实地',
    '剑锋金':'如宝剑出鞘之金，锋芒毕露，锐不可当',
    '山头火':'如野火燎原之火，气势磅礴，一往无前',
    '涧下水':'如山涧清流之水，清澈灵动，润物无声',
    '城头土':'如城墙防御之土，坚毅稳固，守护一方',
    '白蜡金':'如金器初成之金，尚未磨砺，需经雕琢',
    '杨柳木':'如垂柳依依之木，柔美多姿，善于交际',
    '泉中水':'如甘泉涌出之水，源源不断，智慧绵长',
    '屋上土':'如房屋覆盖之土，遮风挡雨，安家立业',
    '霹雳火':'如雷电交加之火，惊天动地，爆发力强',
    '松柏木':'如松柏傲霜之木，坚韧不拔，历久弥坚',
    '长流水':'如长河不息之水，连绵不绝，善始善终',
    '砂石金':'如砂砾淘金之金，历经磨砺，终见光芒',
    '山下火':'如余晖映照之火，温暖含蓄，晚景丰隆',
    '平地木':'如平地草木之木，生生不息，适应力强',
    '壁上土':'如墙壁支撑之土，稳固可靠，成就不凡',
    '金箔金':'如金箔装饰之金，华美精致，重面子礼仪',
    '覆灯火':'如灯烛照明之火，温和持久，文化润泽',
    '天河水':'如银河倾泻之水，高雅脱俗，理想远大',
    '大驿土':'如通衢大道之土，四通八达，格局开阔',
    '钗钏金':'如首饰妆点之金，优雅华贵，注重仪表',
    '桑柘木':'如桑柘灌木之木，实用质朴，惠及他人',
    '大溪水':'如溪流汇河之水，渐成气候，后劲十足',
    '沙中土':'如沙土混杂之土，历经淘洗，方显本色',
    '天上火':'如日照中天之火，光芒万丈，气度非凡',
    '石榴木':'如石榴果木之木，多子多福，才华横溢',
    '大海水':'如浩瀚海洋之水，包容万象，深沉博大'
};

const MONTH_ANALYSIS = {
    '寅': { season:'春', wx:'木', name:'寅月（孟春）', desc:'正值初春，木气始发。万物复苏，生机勃勃。', power:'木旺',
        pattern:{ '丙':'日照春林','壬':'春江潮水','甲':'春木向阳','庚':'金埋木盛','戊':'春土润物','丁':'星火燎原','己':'春园草木','辛':'珠藏春渊','乙':'绿柳含烟','癸':'春雨润物' } },
    '卯': { season:'春', wx:'木', name:'卯月（仲春）', desc:'仲春时节，木气正盛。百花争艳，木火通明。', power:'木旺',
        pattern:{ '丙':'木火通明','壬':'水木清华','甲':'春木参天','庚':'金木交锋','戊':'春土培木','丁':'灯火照春','己':'春畦种玉','辛':'辛金裁木','乙':'绿野仙踪','癸':'春水潺潺' } },
    '辰': { season:'春', wx:'土', name:'辰月（季春）', desc:'暮春时节，木气渐退，土气承接。土中含木蓄水。', power:'土旺',
        pattern:{ '丙':'春暮余晖','壬':'春江暖水','甲':'春木入土','庚':'金归厚土','戊':'土重成山','丁':'残阳照土','己':'春泥护花','辛':'珠藏土中','乙':'藤萝绕土','癸':'春池映月' } },
    '巳': { season:'夏', wx:'火', name:'巳月（孟夏）', desc:'初夏时节，火气初升。万物繁盛，热情渐浓。', power:'火旺',
        pattern:{ '丙':'日丽中天','壬':'水火既济','甲':'夏木成荫','庚':'金入熔炉','戊':'夏土燥烈','丁':'星火初燃','己':'夏园丰茂','辛':'金销火中','乙':'藤附夏木','癸':'夏露凝珠' } },
    '午': { season:'夏', wx:'火', name:'午月（仲夏）', desc:'仲夏时节，火气最旺。烈日当空，阳极阴生。', power:'火旺',
        pattern:{ '丙':'盛夏骄阳','壬':'水火相济','甲':'夏木向荣','庚':'金畏烈火','戊':'焦土生金','丁':'灯火辉煌','己':'夏土焦炎','辛':'金入洪炉','乙':'藤蔓向阳','癸':'甘霖润燥' } },
    '未': { season:'夏', wx:'土', name:'未月（季夏）', desc:'暮夏时节，火气渐消，土气承接。暑湿相蒸。', power:'土旺',
        pattern:{ '丙':'夏末余炎','壬':'夏雨润土','甲':'木入土库','庚':'金藏厚土','戊':'厚土成峰','丁':'余晖晚照','己':'夏土膏腴','辛':'金埋土中','乙':'藤蔓入土','癸':'夏泉暗涌' } },
    '申': { season:'秋', wx:'金', name:'申月（孟秋）', desc:'初秋时节，金气始生。暑气消退，秋高气爽。', power:'金旺',
        pattern:{ '丙':'金火交辉','壬':'秋水长天','甲':'木入秋林','庚':'秋金正盛','戊':'土金相生','丁':'金灯照夜','己':'秋土生金','辛':'珠玉生辉','乙':'秋藤结果','癸':'秋水凝露' } },
    '酉': { season:'秋', wx:'金', name:'酉月（仲秋）', desc:'仲秋时节，金气正旺。金风玉露，月华如练。', power:'金旺',
        pattern:{ '丙':'金火相济','壬':'金白水清','甲':'木弱逢金','庚':'秋金肃杀','戊':'土生秋金','丁':'星火炼金','己':'秋土润金','辛':'辛金得令','乙':'藤蔓逢秋','癸':'秋水盈盈' } },
    '戌': { season:'秋', wx:'土', name:'戌月（季秋）', desc:'暮秋时节，金气衰退，土气承接。秋收冬藏。', power:'土旺',
        pattern:{ '丙':'秋晚余照','壬':'秋潭映月','甲':'木入秋墓','庚':'金归土库','戊':'土厚藏金','丁':'残灯照壁','己':'秋园收成','辛':'金隐土中','乙':'藤附秋垣','癸':'秋露凝霜' } },
    '亥': { season:'冬', wx:'水', name:'亥月（孟冬）', desc:'初冬时节，水气始生。万物收藏，寒气渐起。', power:'水旺',
        pattern:{ '丙':'冬火暖水','壬':'冬江寒水','甲':'木浮于水','庚':'金沉水底','戊':'水润土厚','丁':'寒夜明灯','己':'冬土封藏','辛':'珠藏寒渊','乙':'藤蔓越冬','癸':'寒泉涌动' } },
    '子': { season:'冬', wx:'水', name:'子月（仲冬）', desc:'仲冬时节，水气最旺。阴极阳生，阳气潜藏。', power:'水旺',
        pattern:{ '丙':'冬阳暖水','壬':'冬水汪洋','甲':'木漂水中','庚':'金寒水冷','戊':'水旺土荡','丁':'寒夜孤灯','己':'冬土冰封','辛':'珠沉寒水','乙':'藤依水畔','癸':'寒潭千尺' } },
    '丑': { season:'冬', wx:'土', name:'丑月（季冬）', desc:'暮冬时节，水气渐退，土气承接。寒极将春。', power:'土旺',
        pattern:{ '丙':'冬末暖阳','壬':'冬水归土','甲':'木蓄土中','庚':'金藏土库','戊':'冻土待春','丁':'寒灯将灭','己':'冬土孕春','辛':'金埋冻土','乙':'藤藏土中','癸':'冬泉暗涌' } }
};

const TEN_GODS_TRAITS = {
    '正印': { trait:'正印护身，学业有成，为人仁慈有德。', career:'适合教育、文化、学术、医疗等领域。' },
    '偏印': { trait:'偏印生慧，思维独特，颇具玄学天赋。', career:'适合设计、心理学、命理、科研等创新型领域。' },
    '正官': { trait:'正官束身，自律严谨，有领导才能。', career:'适合政府、管理、法律、公务员等规范领域。' },
    '七杀': { trait:'七杀攻身，果敢决断，富于拼搏精神。', career:'适合军警、外科、竞争性行业、创业等。' },
    '正财': { trait:'正财守业，勤劳致富，财务稳健务实。', career:'适合财务、商贸、实体产业等领域。' },
    '偏财': { trait:'偏财慷慨，善抓机遇，有经商天赋。', career:'适合投资、贸易、市场营销等风险性行业。' },
    '比肩': { trait:'比肩相助，朋友众多，人缘广阔。', career:'适合合作创业、团队管理、社交行业。' },
    '劫财': { trait:'劫财好义，敢于竞争，但须防破财。', career:'适合体育、演艺、资源整合等行业。' },
    '食神': { trait:'食神享福，心胸豁达，多才多艺。', career:'适合美食、文艺、演艺、教育等愉悦大众的行业。' },
    '伤官': { trait:'伤官傲物，才华出众，不喜被约束。', career:'适合创作、艺术、技术研发、自主创业等。' }
};

/* ========== 神煞系统 ========== */
const SHENSHA_DATA = {
    '天乙贵人': {
        icon: '⭐',
        desc: '命中最大贵人，逢凶化吉，遇难呈祥。主聪明智慧，易得贵人相助。',
        level: '上吉',
        calc: (dg, allZhi) => {
            // 天乙贵人查法：以日干查四柱地支
            const map = {
                '甲': ['丑', '未'], '戊': ['丑', '未'],
                '乙': ['子', '申'], '己': ['子', '申'],
                '丙': ['亥', '酉'], '庚': ['亥', '酉'],
                '丁': ['亥', '酉'], '辛': ['亥', '酉'],
                '壬': ['卯', '巳'], '癸': ['卯', '巳']
            };
            const targets = map[dg] || [];
            const found = allZhi.filter(z => targets.includes(z));
            return found.length > 0 ? found : null;
        }
    },
    '文昌贵人': {
        icon: '📚',
        desc: '主聪明好学，学业有成，考试运佳。利读书、考试、升职。',
        level: '上吉',
        calc: (dg, allZhi) => {
            // 文昌贵人查法：以日干查地支
            const map = {
                '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
                '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
                '壬': '寅', '癸': '卯'
            };
            const target = map[dg];
            const found = allZhi.filter(z => z === target);
            return found.length > 0 ? found : null;
        }
    },
    '驿马星': {
        icon: '🐎',
        desc: '主出行、变动、迁移。命带驿马者一生多动，适合流动性工作。',
        level: '中平',
        calc: (dg, allZhi) => {
            // 驿马查法：以年支查日支
            const yearZhi = allZhi[0];
            const map = {
                '寅': '申', '午': '寅', '戌': '寅',
                '亥': '巳', '卯': '亥', '未': '亥',
                '巳': '亥', '酉': '巳', '丑': '巳',
                '申': '寅', '子': '申', '辰': '申'
            };
            const target = map[yearZhi];
            const found = allZhi.filter(z => z === target);
            return found.length > 0 ? found : null;
        }
    },
    '华盖星': {
        icon: '🎭',
        desc: '主艺术、宗教、哲学。命带华盖者聪明好学，有艺术天赋，适合从事文艺、科研、宗教。',
        level: '中吉',
        calc: (dg, allZhi) => {
            // 华盖查法：以年支查四柱地支
            const yearZhi = allZhi[0];
            const map = {
                '寅': '戌', '午': '戌', '戌': '戌',
                '亥': '未', '卯': '未', '未': '未',
                '巳': '丑', '酉': '丑', '丑': '丑',
                '申': '辰', '子': '辰', '辰': '辰'
            };
            const target = map[yearZhi];
            const found = allZhi.filter(z => z === target);
            return found.length > 0 ? found : null;
        }
    },
    '桃花星': {
        icon: '🌸',
        desc: '主异性缘、人缘、魅力。命带桃花者长相端正，异性缘佳。',
        level: '中平',
        calc: (dg, allZhi) => {
            // 桃花查法：以年支查日支
            const yearZhi = allZhi[0];
            const map = {
                '寅': '午', '午': '午', '戌': '午',
                '亥': '子', '卯': '子', '未': '子',
                '巳': '酉', '酉': '酉', '丑': '酉',
                '申': '卯', '子': '卯', '辰': '卯'
            };
            const target = map[yearZhi];
            const found = allZhi.filter(z => z === target);
            return found.length > 0 ? found : null;
        }
    },
    '天德贵人': {
        icon: '☀️',
        desc: '主逢凶化吉，化险为夷。命带天德者一生少灾，有贵人暗助。',
        level: '上吉',
        calc: (dg, allZhi) => {
            // 天德贵人查法：以月支查年日时干
            const monthZhi = allZhi[1];
            const map = {
                '寅': '丁', '卯': '申', '辰': '壬',
                '巳': '辛', '午': '亥', '未': '甲',
                '申': '癸', '酉': '寅', '戌': '丙',
                '亥': '乙', '子': '巳', '丑': '庚'
            };
            const target = map[monthZhi];
            const found = [dg]; // 日干
            return target && dg === target ? found : null;
        }
    },
    '将星': {
        icon: '👑',
        desc: '主领导才能，有统御之能。命带将星者适合从事管理、领导岗位。',
        level: '上吉',
        calc: (dg, allZhi) => {
            // 将星查法：以年支查日支
            const yearZhi = allZhi[0];
            const map = {
                '寅': '午', '午': '午', '戌': '午',
                '亥': '卯', '卯': '卯', '未': '卯',
                '巳': '酉', '酉': '酉', '丑': '酉',
                '申': '子', '子': '子', '辰': '子'
            };
            const target = map[yearZhi];
            const found = allZhi.filter(z => z === target);
            return found.length > 0 ? found : null;
        }
    },
    '金舆星': {
        icon: '🚗',
        desc: '主富贵、车马。命带金舆者生活富足，有车有房。',
        level: '中吉',
        calc: (dg, allZhi) => {
            // 金舆查法：以日干查地支
            const map = {
                '甲': '辰', '乙': '巳', '丙': '未', '丁': '申',
                '戊': '未', '己': '申', '庚': '戌', '辛': '亥',
                '壬': '丑', '癸': '寅'
            };
            const target = map[dg];
            const found = allZhi.filter(z => z === target);
            return found.length > 0 ? found : null;
        }
    }
};

function calculateShensha(dg, yearZhi, monthZhi, dayZhi, timeZhi) {
    const allZhi = [yearZhi, monthZhi, dayZhi, timeZhi];
    const result = [];

    for (const [name, data] of Object.entries(SHENSHA_DATA)) {
        const found = data.calc(dg, allZhi);
        if (found && found.length > 0) {
            result.push({
                name,
                icon: data.icon,
                desc: data.desc,
                level: data.level,
                positions: found
            });
        }
    }

    return result;
}

function getShenshaHtml(shenshaList) {
    if (!shenshaList || shenshaList.length === 0) {
        return '<p style="font-size:0.78rem;color:var(--text-gray);">暂未发现明显神煞</p>';
    }

    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">';
    shenshaList.forEach(ss => {
        const levelColor = ss.level === '上吉' ? 'var(--jade-green)' :
                          ss.level === '中吉' ? 'var(--text-gold)' :
                          ss.level === '中平' ? 'var(--text-gray)' : 'var(--cinnabar-red)';
        html += `
            <div style="background:rgba(10,10,12,0.4);border:1px solid var(--border-color);border-radius:8px;padding:12px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <span style="font-size:1.2rem;">${ss.icon}</span>
                    <span style="font-weight:700;color:var(--text-white);font-size:0.85rem;">${ss.name}</span>
                    <span style="margin-left:auto;padding:2px 8px;border-radius:10px;font-size:0.68rem;background:${levelColor}22;color:${levelColor};border:1px solid ${levelColor}44;">${ss.level}</span>
                </div>
                <p style="font-size:0.75rem;color:var(--text-gray);margin:0 0 6px 0;line-height:1.5;">${ss.desc}</p>
                <div style="font-size:0.72rem;color:var(--text-gold);">
                    落宫：${ss.positions.map(p => `<span style="display:inline-block;padding:1px 6px;margin:2px;background:var(--text-gold)11;border:1px solid var(--text-gold)33;border-radius:4px;">${p}</span>`).join(' ')}
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function getDayMasterDesc(dg, dz, monZhi) {
    const base = GAN_DESC[dg] || { name:dg, desc:'' };
    const mon = MONTH_ANALYSIS[monZhi] || { power:'', wx:'' };
    if (base.wx === mon.wx) {
        base.desc += `生于${mon.name}，当令${mon.wx}气旺盛，日主得时令之助，能量充沛。`;
    } else {
        base.desc += `生于${mon.name}，${mon.wx}气当令，日主处于${mon.wx === '金' ? '休囚' : mon.wx === '木' ? '休囚' : '相'}-${mon.wx}之地，需结合全局五行判断旺衰。`;
    }
    return base;
}

function getNayinSummary(nayin) {
    return NAYIN_DESC[nayin] || '纳音神煞，暗藏玄机';
}

function getSeasonText(mz) {
    return MONTH_ANALYSIS[mz] || { season:'', wx:'', name:'', desc:'', power:'', pattern:{} };
}

function getTenGodCombination(baZi) {
    const gods = [];
    try {
        const yg = baZi.getYearShiShenGan();
        const mg = baZi.getMonthShiShenGan();
        const dg = baZi.getDayShiShenGan();
        const tg = baZi.getTimeShiShenGan();
        [yg, mg, dg, tg].forEach(g => { if (g && gods.indexOf(g) === -1) gods.push(g); });
    } catch(e) {}
    return gods;
}

function generateBaziAnalysis(name, gender, baZi, solar, lunar) {
    const analysisEl = document.getElementById("baziDetailAnalysis");
    const yg = baZi.getYearGan(), yz = baZi.getYearZhi();
    const mg = baZi.getMonthGan(), mz = baZi.getMonthZhi();
    const dg = baZi.getDayGan(), dz = baZi.getDayZhi();
    const tg = baZi.getTimeGan(), tz = baZi.getTimeZhi();

    const wx = getGanWuxing(dg);
    const dayMaster = getDayMasterDesc(dg, dz, mz);
    const season = getSeasonText(mz);
    const maxWx = getMaxWuxing();
    const minWx = getMinWuxing();
    const genderTitle = gender === "男" ? "乾造" : "坤造";

    const yearNayin = baZi.getYearNaYin();
    const monthNayin = baZi.getMonthNaYin();
    const dayNayin = baZi.getDayNaYin();
    const timeNayin = baZi.getTimeNaYin();

    const yearHide = baZi.getYearHideGan ? (baZi.getYearHideGan() || []).join('、') : '';
    const monthHide = baZi.getMonthHideGan ? (baZi.getMonthHideGan() || []).join('、') : '';
    const dayHide = baZi.getDayHideGan ? (baZi.getDayHideGan() || []).join('、') : '';
    const timeHide = baZi.getTimeHideGan ? (baZi.getTimeHideGan() || []).join('、') : '';

    const yearSS = baZi.getYearShiShenGan();
    const monthSS = baZi.getMonthShiShenGan();
    const timeSS = baZi.getTimeShiShenGan();

    /* --- Summary bar --- */
    const summaryText = document.getElementById("baziSummaryText");
    const balanceDesc = (() => {
        if (AppState.wuxingData[maxWx] - AppState.wuxingData[minWx] <= 15) return "五行均衡";
        const strong = AppState.wuxingData[maxWx] >= 35 ? "偏旺" : "偏强";
        const weak = AppState.wuxingData[minWx] <= 15 ? "偏弱" : "偏弱";
        return `${maxWx}${strong}、${minWx}${weak}`;
    })();
    if (summaryText) {
        summaryText.innerHTML = `命盘平衡：<strong>${balanceDesc}</strong> &nbsp;|&nbsp; 旺势五行：<strong class="text-${getWuxingEng(maxWx)}">${maxWx}</strong> &nbsp;|&nbsp; 待补五行：<strong class="text-${getWuxingEng(minWx)}">${minWx}</strong> &nbsp;|&nbsp; 日主：<strong class="text-${getWuxingEng(wx)}">${dg}${wx}</strong>`;
    }

    /* --- DaYun --- */
    let daYunHtml = '';
    try {
        const yun = baZi.getYun(gender === '男' ? '男' : '女');
        const dyList = yun.getDaYun();
        if (dyList && dyList.length > 1) {
            const nowYear = new Date().getFullYear();
            let currentIdx = -1;
            dyList.forEach((d, i) => {
                if (d.getStartYear() <= nowYear && d.getEndYear() >= nowYear) currentIdx = i;
            });

            const rows = dyList.map((d, i) => {
                const gz = d.getGanZhi() || (i === 0 ? '入运前' : '');
                const isCur = i === currentIdx;
                return `<tr class="${isCur ? 'row-current' : ''}"><td>${i === 0 ? '根基' : '第' + i + '步'}</td><td>${gz}</td><td>${d.getStartAge()}岁</td><td>${d.getStartYear()}</td><td>${d.getEndYear()}</td></tr>`;
            }).join('');

            daYunHtml = `
                <div class="report-section">
                    <h4>📆 大运流转</h4>
                    <p>大运十年一转，掌控人生大趋势。${gender === '男' ? '阳男' : '阴女'}顺排，命主自${dyList[1] ? dyList[1].getStartAge() : '?'}岁起运。目前正值${currentIdx >= 0 && dyList[currentIdx] ? '第' + currentIdx + '步' + dyList[currentIdx].getGanZhi() + '大运': ''}。</p>
                    <div style="overflow-x:auto;">
                        <table class="da-yun-table">
                            <tr><th>运势</th><th>干支</th><th>年龄</th><th>起始</th><th>结束</th></tr>
                            ${rows}
                        </table>
                    </div>
                </div>`;

            if (currentIdx >= 0) {
                const curDY = dyList[currentIdx];
                const lnList = curDY.getLiuNian();
                if (lnList) {
                    const curLN = lnList.find(l => l.getYear() === nowYear);
                    if (curLN) {
                        const lnGz = curLN.getGanZhi();
                        const lnG = lnGz[0];
                        const lnZ = lnGz[1];
                        const lnWx = getGanWuxing(lnG);
                        const wuxingCycle = ['金','水','木','火','土'];
                        const wxIndex = wuxingCycle.indexOf(wx);
                        const lnWxIndex = wuxingCycle.indexOf(lnWx);
                        const isGoodYear = (wxIndex >= 0 && lnWxIndex >= 0 && wuxingCycle[(wxIndex + 1) % 5] === lnWx) || (wxIndex >= 0 && lnWxIndex >= 0 && wuxingCycle[(wxIndex + 2) % 5] === lnWx);
                        const yearAdvice = isGoodYear
                            ? `<p>今年${lnGz}年，流年五行<span class="pill-tag pill-${getWuxingEng(lnWx)}">${lnWx}</span>对命主<span class="pill-tag pill-${getWuxingEng(wx)}">${wx}</span>日主有助益，是积极进取的一年，宜把握时机，在事业和财务上大胆布局。</p>`
                            : `<p>今年${lnGz}年，流年五行<span class="pill-tag pill-${getWuxingEng(lnWx)}">${lnWx}</span>对命主<span class="pill-tag pill-${getWuxingEng(wx)}">${wx}</span>日主带来一定挑战。宜守不宜攻，注重人际关系和身体健康，稳中求进为上。</p>`;

                        // Generate monthly breakdown for current year
                        const monthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
                        const monthGanZhi = ['丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥','丙子','丁丑'];
                        const monthWuxing = monthGanZhi.map(gz => getGanWuxing(gz[0]));
                        const monthDetail = monthNames.map((mn, mi) => {
                            const mw = monthWuxing[mi];
                            const sheng = wuxingCycle[(wxIndex + 1) % 5] === mw;
                            const ke = wuxingCycle[(wxIndex + 3) % 5] === mw;
                            const rating = sheng ? '吉' : ke ? '慎' : '平';
                            const cls = sheng ? 'liuyue-ji' : ke ? 'liuyue-shen' : 'liuyue-ping';
                            return `<span class="month-tag ${cls}" title="${mn}（${monthGanZhi[mi]}）五行${mw}，与日主${wx}${sheng ? '相生' : ke ? '相克' : '持平'}">${mn.slice(0,1)}月:${rating}</span>`;
                        }).join('');

                        const focusAreas = isGoodYear
                            ? `<strong>事业：</strong>宜主动拓展，贵人运佳<br><strong>财运：</strong>正财稳定，偏财有机遇<br><strong>健康：</strong>注意${lnWx === '火' ? '心脑血管' : lnWx === '金' ? '呼吸道' : lnWx === '水' ? '肾脏泌尿' : lnWx === '木' ? '肝胆' : '脾胃'}保养`
                            : `<strong>事业：</strong>宜稳中求进，谨防小人<br><strong>财运：</strong>保守理财，避免高风险投资<br><strong>健康：</strong>重点关注${lnWx === '火' ? '心脑血管' : lnWx === '金' ? '呼吸道' : lnWx === '水' ? '肾脏泌尿' : lnWx === '木' ? '肝胆' : '脾胃'}系统`;

                        daYunHtml += `
                            <div class="report-section">
                                <h4>🎯 ${nowYear}年（${lnGz}年）流年详批</h4>
                                <p><strong>岁君：</strong>${lnGz} <span class="pill-tag pill-${getWuxingEng(lnWx)}">${lnWx}</span> &nbsp;|&nbsp; <strong>与日主：</strong>${isGoodYear ? '相生为喜' : '须谨慎应对'} &nbsp;|&nbsp; <strong>太岁：</strong>${lnZ}（${getZhiWuxing(lnZ)}）</p>
                                ${yearAdvice}
                                <div style="margin-top:10px;">
                                    <p><strong>📅 流月吉凶概览：</strong></p>
                                    <div class="liuyue-monthly-breakdown">${monthDetail}</div>
                                </div>
                                <div style="margin-top:10px;padding:10px;background:rgba(212,175,55,0.06);border-radius:8px;">
                                    <p><strong>📋 ${nowYear}年关注重点：</strong></p>
                                    <p style="font-size:0.8rem;line-height:1.7;">${focusAreas}</p>
                                </div>
                            </div>`;
                    }
                }
            }
        }
    } catch(e) {
        daYunHtml = '<div class="report-section"><p style="color:var(--text-gray);font-size:0.8rem;">大运信息需结合具体时辰精确推算，暂未生成。</p></div>';
    }

    /* --- Main Analysis --- */
    const nayinItems = [
        { pilar:'年柱', gz:`${yg}${yz}`, name:yearNayin, desc:getNayinSummary(yearNayin) },
        { pilar:'月柱', gz:`${mg}${mz}`, name:monthNayin, desc:getNayinSummary(monthNayin) },
        { pilar:'日柱', gz:`${dg}${dz}`, name:dayNayin, desc:getNayinSummary(dayNayin) },
        { pilar:'时柱', gz:`${tg}${tz}`, name:timeNayin, desc:getNayinSummary(timeNayin) }
    ];

    const tenGodHtml = getTenGodAnalysis(yearSS, monthSS, timeSS, baZi);
    const traitsHtml = getPersonalityTraits(dg, yg, yz, mg, mz, dz, tg, tz, yearSS, monthSS, timeSS);
    const dayWx = wx; // wx 在第 318 行定义
    const liunianHtml = generateLiunianAnalysis(dg, dayWx, baZi, name);
    const liuyueHtml = generateLiuyueAnalysis(dg, dayWx, baZi);
    const shenshaList = calculateShensha(dg, yz, mz, dz, tz);
    const shenshaHtml = getShenshaHtml(shenshaList);

    const htmlContent = `
        <div class="bazi-report">
            <div class="divider-quote">
                “易与天地准，故能弥纶天地之道。” —— 命理推演，旨在知命而修己。
            </div>

            <div class="report-section">
                <h4>🧐 一、八字排盘与干支结构</h4>
                <p>
                <strong>年柱 ${yg}${yz}</strong>（${baZi.getYearNaYin()}）— 祖业根基，家世遗传<br>
                <strong>月柱 ${mg}${mz}</strong>（${baZi.getMonthNaYin()}）— 父母环境，事业平台<br>
                <strong>日柱 ${dg}${dz}</strong>（${baZi.getDayNaYin()}）— ${genderTitle}自身，婚姻宫位<br>
                <strong>时柱 ${tg}${tz}</strong>（${baZi.getTimeNaYin()}）— 子女晚运，最终归宿
                </p>
                <div class="section-subtitle">纳音释义</div>
                <ul class="nayin-list">
                    ${nayinItems.map(n => `<li><span class="nayin-pilar">${n.pilar} ${n.gz}</span>（${n.name}）<span class="nayin-desc">— ${n.desc}</span></li>`).join('')}
                </ul>
            </div>

            <div class="report-section">
                <h4>🔮 二、五行旺衰与格局分析</h4>
                <p><strong>${dayMaster.name}</strong></p>
                <p>${dayMaster.desc}</p>
                <p><strong>季节格局：</strong>命主生于${season.name}，${season.desc} 月令为 <strong>${mz}（${season.wx}）</strong>，${season.power}。日主 ${dg}${wx} 立于${season.name}，${getSeasonInfluence(wx, season.wx)}。</p>
                <p><strong>能量气场：</strong>命局中 <span class="pill-tag pill-${getWuxingEng(maxWx)}">${maxWx}</span> 能量最盛，<span class="pill-tag pill-${getWuxingEng(minWx)}">${minWx}</span> 偏弱需补。${getWuxingBalanceAdvice(maxWx, minWx)}</p>
                <div class="ten-god-grid">${tenGodHtml}</div>
            </div>

            <div class="report-section">
                <h4>💎 三、命理特质与人生优势</h4>
                ${traitsHtml}
            </div>

            <div class="report-section">
                <h4>🧧 四、趋吉避凶与调理建议</h4>
                <div class="advice-block">
                    <div class="advice-item">
                        <span class="advice-label">五行喜用</span>
                        <span class="advice-value">宜补 <span class="pill-tag pill-${getWuxingEng(minWx)}">${minWx}</span>，多亲近${minWx}属性</span>
                    </div>
                    <div class="advice-item">
                        <span class="advice-label">色彩调和</span>
                        <span class="advice-value">${getWuxingColor()}</span>
                    </div>
                    <div class="advice-item">
                        <span class="advice-label">地理方位</span>
                        <span class="advice-value">${getDirectionAdvice(minWx)}</span>
                    </div>
                    <div class="advice-item">
                        <span class="advice-label">行业选择</span>
                        <span class="advice-value">${getCareerAdvice(minWx, maxWx)}</span>
                    </div>
                </div>
                <p style=”margin-top:10px;font-size:0.78rem;color:var(--text-gray);font-style:italic;”>”一命二运三风水，四积阴德五读书。” 知命不是认命，而是更好地把握自我，修身养性以待天时。</p>
            </div>

            <div class=”report-section”>
                <h4>✨ 五、命带神煞</h4>
                <p style=”font-size:0.78rem;color:var(--text-gray);margin-bottom:12px;”>神煞是命理中的特殊星曜，反映命主的特殊禀赋和际遇。命带吉神者多有福缘，命带凶煞者需谨慎化解。</p>
                ${shenshaHtml}
            </div>

            ${daYunHtml}

            ${liunianHtml}

            ${liuyueHtml}

            <div class="footer-note">✦ 天机难测，玄理无穷。以上推演仅供趋吉避凶之参考，人生之精彩在于自强不息。 ✦</div>
        </div>
    `;
    analysisEl.innerHTML = htmlContent;
}

function getSeasonInfluence(dw, sw) {
    const shengKe = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
    if (dw === sw) return '当令得时，能量充沛，命格根基扎实';
    if (shengKe[sw] === dw) return '月令生助日主，得时令之助，事半功倍';
    if (shengKe[dw] === sw) return '日主生月令，耗力较多，需余柱补益';
    return '月令克制日主，压力较大，但磨砺可成器';
}

function getWuxingBalanceAdvice(max, min) {
    const shengKe = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
    const ke = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
    let advice = '';
    if (AppState.wuxingData[max] >= 35) {
        advice += `${max}偏旺，宜泄不宜克，可多运用${shengKe[max]}来疏导其锐气。`;
    }
    if (AppState.wuxingData[min] <= 15) {
        advice += `${min}偏弱，需在后天生活中刻意补充。`;
    }
    return advice || '五行能量较为平衡，命局中和，福泽深厚。';
}

function getTenGodAnalysis(yearSS, monthSS, timeSS, baZi) {
    const gods = [];
    try { gods.push(baZi.getYearShiShenGan()); } catch(e) {}
    try { gods.push(baZi.getMonthShiShenGan()); } catch(e) {}
    try { gods.push(baZi.getDayShiShenGan()); } catch(e) {}
    try { gods.push(baZi.getTimeShiShenGan()); } catch(e) {}

    const positionLabels = { yearSS:'年上', monthSS:'月上', timeSS:'时上' };
    const allGods = [
        { name: yearSS, pos: '年上' },
        { name: monthSS, pos: '月上' },
        { name: '日主', pos: '日元' },
        { name: timeSS, pos: '时上' }
    ];

    let html = '';
    const uniqueGods = [...new Set(gods.filter(Boolean))];
    uniqueGods.forEach(g => {
        const info = TEN_GODS_TRAITS[g];
        if (info) {
            html += `<div class="ten-god-card"><span class="god-name">${g}</span><span class="god-trait">${info.trait} ${info.career}</span></div>`;
        }
    });
    return html;
}

function getPersonalityTraits(dg, yg, yz, mg, mz, dz, tg, tz, yss, mss, tss) {
    const dayGanInfo = GAN_DESC[dg] || {};
    let html = '';

    if (dayGanInfo.desc) {
        html += `<p><strong>核心特质：</strong>${dayGanInfo.desc.split('。')[0]}。`;
        const parts = dayGanInfo.desc.split('。');
        if (parts.length > 1) html += ` ${parts[1]}`;
        html += '</p>';
    }

    // Branch combination hints
    const branchPairs = [
        { z:dz, name:'日支婚姻宫', desc: getZhiDesc(dz) },
        { z:mz, name:'月令事业宫', desc: getZhiDesc(mz) },
        { z:yz, name:'年柱祖上宫', desc: getZhiDesc(yz) },
        { z:tz, name:'时柱子女宫', desc: getZhiDesc(tz) }
    ];

    html += '<p><strong>地支藏干玄机：</strong></p><ul style="margin:0 0 10px 20px;font-size:0.8rem;">';
    branchPairs.forEach(b => {
        html += `<li><strong>${b.name}（${b.z}）</strong>：${b.desc}</li>`;
    });
    html += '</ul>';

    // Ten gods based traits
    const godNames = [yss, mss, tss].filter(Boolean);
    let advices = '';
    godNames.forEach(g => {
        const info = TEN_GODS_TRAITS[g];
        if (info && advices.length < 80) {
            advices += `命带${g}，${info.trait.split('。')[0]}。`;
        }
    });
    if (advices) {
        html += `<p><strong>人生优势：</strong>${advices}</p>`;
    }

    return html;
}

function getZhiDesc(zhi) {
    const map = {
        '子': '子水藏癸，暗藏智慧之星，内心敏感深邃，有独立人格。',
        '丑': '丑土藏己癸辛，金库所在，为人务实内敛，有隐忍之德。',
        '寅': '寅木藏甲丙戊，三阳开泰，有开拓精神和领导潜力。',
        '卯': '卯木藏乙，纯木之气，性格温和直率，富有仁爱之心。',
        '辰': '辰土藏戊乙癸，水库之所在，才思敏捷，包容性强。',
        '巳': '巳火藏丙戊庚，金之长生，聪明果敢，善于权变。',
        '午': '午火藏丁己，烈焰纯火，热情奔放，才华横溢。',
        '未': '未土藏己丁乙，木库之所在，外柔内刚，有艺术天赋。',
        '申': '申金藏庚壬戊，金水相生，思维严谨，有将帅之风。',
        '酉': '酉金藏辛，纯金之气，精致内敛，追求完美。',
        '戌': '戌土藏戊辛丁，火库之所在，重情重义，守信用。',
        '亥': '亥水藏壬甲，水木相生，智谋深远，有慈悲之心。'
    };
    return map[zhi] || '藏有玄机，待运而发';
}

function getWuxingColor() {
    const min = getMinWuxing();
    const colors = { '金':'乳白、浅黄、金色','木':'青色、翠绿、玉色','水':'玄黑、天蓝、墨色','火':'朱砂红、紫色、粉色','土':'黄褐色、土黄、金色' };
    return colors[min] || '金色';
}

function getDirectionAdvice(wx) {
    const map = { '金':'西北、正西','木':'正东、东南','水':'正北','火':'正南','土':'中宫、西南、东北' };
    return `宜多用 ${map[wx] || '正南'} 方位之气场。办公或居家时，座位宜朝此方，可吸纳有利能量。`;
}

function getCareerAdvice(min, max) {
    const map = {
        '金': '金融、法律、机械、珠宝、军警等与金相关的行业',
        '木': '教育、出版、设计、环保、医疗、文化创意等与木相关的行业',
        '水': '贸易、物流、传媒、旅游、科技、咨询等与水相关的行业',
        '火': '能源、餐饮、娱乐、互联网、光电等与火相关的行业',
        '土': '地产、建筑、农业、管理、中介等与土相关的行业'
    };
    return `建议向${min}属性行业发展（${map[min] || '适合自身五行之领域'}），可有效补益命局能量。`;
}

function generateLiuyueAnalysis(dayGan, dayWx, baZi) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const shengMap = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
    const keMap = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
    const xieMap = { '金':'土','土':'火','火':'木','木':'水','水':'金' };

    const monthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
    const monthZhi = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

    let html = '';
    let months = [];

    // Generate 12 months starting from current month
    for (let i = 0; i < 12; i++) {
        let m = currentMonth + i;
        let y = currentYear;
        if (m > 12) { m -= 12; y += Math.floor((currentMonth + i - 1) / 12); }

        const zhi = monthZhi[m - 1];
        const monthName = monthNames[m - 1];

        // Get month heavenly stem using the lunar-javascript library
        let monthGan = '';
        try {
            const solar = Solar.fromYmd(y, m, 1);
            const lunar = solar.getLunar();
            const monthGz = lunar.getMonthGanZhi();
            monthGan = monthGz[0];
        } catch(e) {
            // Fallback: approximate from year
            const yearGanIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(dayGan);
            const ganCycle = ['丙','丁','戊','己','庚','辛','壬','癸','甲','乙'];
            monthGan = ganCycle[(m + 1) % 10] || '甲';
        }

        const monthWx = getGanWuxing(monthGan);
        const dayKe = keMap[dayWx] === monthWx;       // day controls month
        const monthSheng = shengMap[monthWx] === dayWx; // month generates day
        const daySheng = shengMap[dayWx] === monthWx;   // day generates month
        const monthKe = keMap[monthWx] === dayWx;       // month controls day
        const same = dayWx === monthWx;

        let rating, ratingLabel, ratingColor;
        if (monthSheng) { rating = '吉'; ratingLabel = '月生日主，运势亨通'; ratingColor = 'var(--jade-green)'; }
        else if (same) { rating = '吉'; ratingLabel = '同气相求，顺势而为'; ratingColor = 'var(--jade-green)'; }
        else if (daySheng) { rating = '平'; ratingLabel = '日主生月，稍耗精力'; ratingColor = 'var(--text-gold)'; }
        else if (monthKe) { rating = '慎'; ratingLabel = '月克日主，谨言慎行'; ratingColor = 'var(--cinnabar-red)'; }
        else if (dayKe) { rating = '平'; ratingLabel = '日主制月，主动破局'; ratingColor = '#D4A03C'; }
        else { rating = '平'; ratingLabel = '平'; ratingColor = 'var(--text-gray)'; }

        // Month pillar (approximate)
        const yearGan = baZi.getYearGan();
        const yearGanIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(yearGan);
        let monthStem = '';
        // 甲己 → 丙寅, 乙庚 → 戊寅, 丙辛 → 庚寅, 丁壬 → 壬寅, 戊癸 → 甲寅
        const stemRules = '丙戊庚壬甲';
        const ruleIdx = yearGanIdx % 5;
        const baseStem = stemRules[ruleIdx];
        const ganCycle = '甲乙丙丁戊己庚辛壬癸';
        const baseIdx = ganCycle.indexOf(baseStem);
        const monthStemIdx = (baseIdx + (m - 1)) % 10;
        monthStem = ganCycle[monthStemIdx];

        months.push({ y, m, monthName, zhi, gan: monthStem, wx: monthWx, rating, ratingLabel, ratingColor });
    }

    // Build grid
    months.forEach(m => {
        const isNow = (m.m === currentMonth && m.y === currentYear);
        html += `
            <div style="background:rgba(212,175,55,0.04);border:1px solid ${isNow ? 'var(--text-gold)' : 'var(--border-color)'};border-radius:6px;padding:10px;text-align:center;${isNow ? 'box-shadow:0 0 8px rgba(212,175,55,0.15);' : ''}">
                <div style="font-size:0.72rem;color:var(--text-gray);">${m.y}年</div>
                <div style="font-size:0.9rem;font-weight:700;color:var(--text-white);margin:2px 0;">${m.monthName}</div>
                <div style="font-size:0.78rem;color:var(--text-gold);font-family:'ZCOOL XiaoWei',serif;margin-bottom:4px;">${m.gan}${m.zhi}</div>
                <div style="display:inline-block;padding:2px 12px;border-radius:10px;font-size:0.72rem;font-weight:600;background:${m.ratingColor}22;color:${m.ratingColor};border:1px solid ${m.ratingColor}44;">${m.rating}</div>
                ${isNow ? '<div style="font-size:0.65rem;color:var(--text-gold);margin-top:4px;">⬅ 本月</div>' : ''}
            </div>`;
    });

    return `
        <div class="report-section">
            <h4>📅 流月运势 · 未来十二个月</h4>
            <p style="font-size:0.78rem;color:var(--text-gray);margin:0 0 10px 0;">以下运势基于日主${dayGan}${dayWx}与各月天干五行的生克关系推演，供参考。</p>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">${html}</div>
            <div style="display:flex;gap:14px;margin-top:10px;font-size:0.72rem;color:var(--text-gray);flex-wrap:wrap;">
                <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--jade-green);vertical-align:middle;margin-right:3px;"></span>吉（月生日主）</span>
                <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--text-gold);vertical-align:middle;margin-right:3px;"></span>平（同气/日生月）</span>
                <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--cinnabar-red);vertical-align:middle;margin-right:3px;"></span>慎（月克日主）</span>
            </div>
        </div>`;
}

/* ========== 流年运势详批 ========== */
function generateLiunianAnalysis(dayGan, dayWx, baZi, name) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 获取当年流年干支
    const yearSolar = Solar.fromYmd(currentYear, 1, 1);
    const yearLunar = yearSolar.getLunar();
    const yearGanZhi = yearLunar.getYearInGanZhi();
    const yearGan = yearGanZhi[0];
    const yearZhi = yearGanZhi[1];
    const yearWx = getGanWuxing(yearGan);

    // 生克关系
    const shengMap = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
    const keMap = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
    const shengByMap = { '水':'金','木':'水','火':'木','土':'火','金':'土' };

    // 流年与日主关系
    const yearShengDay = shengMap[yearWx] === dayWx; // 太岁生日主
    const dayShengYear = shengMap[dayWx] === yearWx; // 日主生太岁
    const yearKeDay = keMap[yearWx] === dayWx;       // 太岁克日主
    const dayKeYear = keMap[dayWx] === yearWx;       // 日主克太岁
    const sameWx = yearWx === dayWx;                  // 同五行

    // 流年评级
    let yearRating, yearRatingDesc, yearAdvice;
    if (yearShengDay) {
        yearRating = '上吉';
        yearRatingDesc = `${yearGan}${yearWx}生助日主${dayGan}${dayWx}，运势亨通，贵人相助`;
        yearAdvice = '今年运势大好，适合积极进取，把握机遇。贵人运旺盛，可得长辈或上司提携。事业、财运、感情皆有进展。';
    } else if (sameWx) {
        yearRating = '中吉';
        yearRatingDesc = `太岁${yearWx}与日主同气，顺应时势，平稳发展`;
        yearAdvice = '今年运势平稳，适合稳扎稳打，不宜冒进。同气相求，朋友助力较多，可借助团队力量成事。';
    } else if (dayShengYear) {
        yearRating = '中平';
        yearRatingDesc = `日主${dayWx}生助太岁${yearWx}，付出较多，收获需努力`;
        yearAdvice = '今年需要多付出努力，才能有所收获。日主生泄，精力消耗较大，注意劳逸结合。适合投资自己，提升能力。';
    } else if (dayKeYear) {
        yearRating = '中平';
        yearRatingDesc = `日主${dayWx}克制太岁${yearWx}，主动出击，财源可求`;
        yearAdvice = '今年利于主动出击，争取机会。日主克财，财运有所提升，但需谨慎投资，避免冲动消费。事业上可有所突破。';
    } else if (yearKeDay) {
        yearRating = '谨慎';
        yearRatingDesc = `太岁${yearWx}克制日主${dayWx}，压力较大，需谨慎应对`;
        yearAdvice = '今年运势较为波折，太岁克身，压力较大。宜守不宜攻，避免大的变动和投资。注意身体健康和人际关系，遇事多忍让。';
    } else {
        yearRating = '中平';
        yearRatingDesc = `流年五行${yearWx}与日主${dayWx}关系中性`;
        yearAdvice = '今年运势平稳，无大起大落。保持平常心，按部就班即可。';
    }

    // 流月详细运势（本月）
    const currentMonthSolar = Solar.fromYmd(currentYear, currentMonth, 1);
    const currentMonthLunar = currentMonthSolar.getLunar();
    const monthGanZhi = currentMonthLunar.getMonthGanZhi();
    const monthGan = monthGanZhi[0];
    const monthWx = getGanWuxing(monthGan);

    const monthShengDay = shengMap[monthWx] === dayWx;
    const sameMonthWx = monthWx === dayWx;
    const monthKeDay = keMap[monthWx] === dayWx;

    let monthRating, monthAdvice;
    if (monthShengDay) {
        monthRating = '上吉';
        monthAdvice = '本月运势极佳，诸事顺遂。';
    } else if (sameMonthWx) {
        monthRating = '中吉';
        monthAdvice = '本月运势平稳，顺势而为。';
    } else if (monthKeDay) {
        monthRating = '慎';
        monthAdvice = '本月需谨慎，避免冲突。';
    } else {
        monthRating = '中平';
        monthAdvice = '本月运势平平，保持稳健。';
    }

    // 年龄和本命年判断
    const birthYear = baZi.getYear();
    const age = currentYear - birthYear;
    const isBenMingNian = yearZhi === baZi.getYearZhi();
    const isFanTaiSui = Math.abs('子丑寅卯辰巳午未申酉戌亥'.indexOf(yearZhi) - '子丑寅卯辰巳午未申酉戌亥'.indexOf(baZi.getYearZhi())) === 6;

    // 太岁相关建议
    let taiSuiAdvice = '';
    if (isBenMingNian) {
        taiSuiAdvice = `<div style="background:var(--cinnabar-red)15;border:1px solid var(--cinnabar-red)33;border-radius:8px;padding:12px;margin-top:10px;">
            <p style="color:var(--cinnabar-red);font-weight:700;margin:0 0 6px 0;">⚠️ 本命年提醒</p>
            <p style="font-size:0.8rem;color:var(--text-white);margin:0;">今年是您的本命年（${yearZhi}年），太岁当头，运势起伏较大。建议佩戴红色饰品或本命佛，年初拜太岁，凡事谨慎为上。</p>
        </div>`;
    } else if (isFanTaiSui) {
        taiSuiAdvice = `<div style="background:var(--cinnabar-red)10;border:1px solid var(--cinnabar-red)22;border-radius:8px;padding:12px;margin-top:10px;">
            <p style="color:var(--cinnabar-red);font-weight:700;margin:0 0 6px 0;">⚡ 冲太岁提醒</p>
            <p style="font-size:0.8rem;color:var(--text-white);margin:0;">今年与太岁相冲，运势波动明显。宜主动化解，可献血、洗牙或做善事。避免大的变动，外出注意安全。</p>
        </div>`;
    }

    return `
        <div class="report-section">
            <h4>📅 三、${currentYear}年流年运势详批</h4>
            <div style="background:linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05));border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <div>
                        <div style="font-size:0.72rem;color:var(--text-gray);">流年太岁</div>
                        <div style="font-size:1.3rem;font-weight:700;color:var(--text-gold);font-family:'ZCOOL XiaoWei',serif;">${yearGanZhi}年</div>
                        <div style="font-size:0.78rem;color:var(--text-gray);">${yearWx}年 · ${currentYear}年</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="display:inline-block;padding:6px 20px;border-radius:20px;font-size:1rem;font-weight:700;background:${yearRating.includes('上') ? 'var(--jade-green)' : yearRating.includes('慎') ? 'var(--cinnabar-red)' : 'var(--text-gold)'}22;color:${yearRating.includes('上') ? 'var(--jade-green)' : yearRating.includes('慎') ? 'var(--cinnabar-red)' : 'var(--text-gold)'};border:1px solid ${yearRating.includes('上') ? 'var(--jade-green)' : yearRating.includes('慎') ? 'var(--cinnabar-red)' : 'var(--text-gold)'}44;">${yearRating}</div>
                        <div style="font-size:0.65rem;color:var(--text-gray);margin-top:4px;">流年评级</div>
                    </div>
                </div>
                <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);">
                    <p style="font-size:0.8rem;color:var(--text-white);margin:0 0 8px 0;"><strong>${yearRatingDesc}</strong></p>
                    <p style="font-size:0.78rem;color:var(--text-gray);margin:0;line-height:1.6;">${yearAdvice}</p>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:14px;">
                <div style="background:rgba(10,10,12,0.4);border:1px solid var(--border-color);border-radius:8px;padding:12px;">
                    <div style="font-size:0.72rem;color:var(--text-gray);margin-bottom:6px;">本月运势</div>
                    <div style="font-size:1rem;font-weight:700;color:${monthRating.includes('上') ? 'var(--jade-green)' : monthRating.includes('慎') ? 'var(--cinnabar-red)' : 'var(--text-gold)'};">${monthRating}</div>
                    <div style="font-size:0.75rem;color:var(--text-gray);margin-top:4px;">${monthGanZhi}月 · ${monthAdvice}</div>
                </div>
                <div style="background:rgba(10,10,12,0.4);border:1px solid var(--border-color);border-radius:8px;padding:12px;">
                    <div style="font-size:0.72rem;color:var(--text-gray);margin-bottom:6px;">年龄运势</div>
                    <div style="font-size:1rem;font-weight:700;color:var(--text-white);">${age}岁</div>
                    <div style="font-size:0.75rem;color:var(--text-gray);margin-top:4px;">虚龄${age + 1}岁 · ${age >= 50 ? '知天命之年，宜稳中求进' : age >= 40 ? '不惑之年，事业当有成' : age >= 30 ? '而立之年，宜积极进取' : '风华正茂，大有可为'}</div>
                </div>
                <div style="background:rgba(10,10,12,0.4);border:1px solid var(--border-color);border-radius:8px;padding:12px;">
                    <div style="font-size:0.72rem;color:var(--text-gray);margin-bottom:6px;">太岁关系</div>
                    <div style="font-size:1rem;font-weight:700;color:${isBenMingNian || isFanTaiSui ? 'var(--cinnabar-red)' : 'var(--jade-green)'};">${isBenMingNian ? '本命年' : isFanTaiSui ? '冲太岁' : '平稳'}</div>
                    <div style="font-size:0.75rem;color:var(--text-gray);margin-top:4px;">${isBenMingNian ? '太岁当头，需化解' : isFanTaiSui ? '年岁相冲，宜化解' : '与太岁无冲克'}</div>
                </div>
            </div>

            ${taiSuiAdvice}

            <div style="background:rgba(10,10,12,0.3);border-radius:8px;padding:14px;margin-top:12px;">
                <p style="font-size:0.78rem;color:var(--text-gold);margin:0 0 8px 0;"><strong>🧧 流年调理建议</strong></p>
                <ul style="font-size:0.75rem;color:var(--text-white);margin:0;padding-left:20px;line-height:1.8;">
                    <li>流年五行 <span class="pill-tag pill-${getWuxingEng(yearWx)}">${yearWx}</span>，${yearShengDay ? '与日主相生，运势顺畅' : yearKeDay ? '克制日主，需多防范' : '与日主关系中性'}</li>
                    <li>${currentMonth}月（${monthGanZhi}）${monthRating.includes('上') ? '运势上佳，可把握机遇' : monthRating.includes('慎') ? '需谨慎行事，避免冲动' : '运势平稳，按部就班'}</li>
                    <li>建议多亲近${yearShengDay ? yearWx : dayWx}属性事物，佩戴相应饰品</li>
                    <li>${isBenMingNian ? '本命年宜低调，年初拜太岁，穿戴红色' : '保持积极心态，顺势而为'}</li>
                </ul>
            </div>
        </div>`;
}

export { initBaziModule, drawWuxingRadar, calculateWuxing, generateBaziAnalysis, renderBaziCol };
