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
                        const isGoodYear = (() => {
                            if (wx === '水' && ['木','火'].includes(lnWx)) return true;
                            if (wx === '金' && ['水','木'].includes(lnWx)) return true;
                            return false;
                        })();
                        const yearAdvice = isGoodYear
                            ? `<p>今年${lnGz}年，流年五行<span class="pill-tag pill-${getWuxingEng(lnWx)}">${lnWx}</span>对命主<span class="pill-tag pill-${getWuxingEng(wx)}">${wx}</span>日主有助益，是积极进取的一年，宜把握时机，在事业和财务上大胆布局。</p>`
                            : `<p>今年${lnGz}年，流年五行<span class="pill-tag pill-${getWuxingEng(lnWx)}">${lnWx}</span>对命主<span class="pill-tag pill-${getWuxingEng(wx)}">${wx}</span>日主带来一定挑战。宜守不宜攻，注重人际关系和身体健康，稳中求进为上。</p>`;

                        daYunHtml += `
                            <div class="report-section">
                                <h4>🎯 ${nowYear}年（${lnGz}年）流年点睛</h4>
                                <p><strong>岁君：</strong>${lnGz} &nbsp;|&nbsp; <strong>五行：</strong><span class="pill-tag pill-${getWuxingEng(lnWx)}">${lnWx}</span> &nbsp;|&nbsp; <strong>与日主：</strong>${isGoodYear ? '相生为喜' : '须谨慎应对'}</p>
                                ${yearAdvice}
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
                <p style="margin-top:10px;font-size:0.78rem;color:var(--text-gray);font-style:italic;">“一命二运三风水，四积阴德五读书。” 知命不是认命，而是更好地把握自我，修身养性以待天时。</p>
            </div>

            ${daYunHtml}

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

export { initBaziModule, drawWuxingRadar, calculateWuxing, generateBaziAnalysis, renderBaziCol };
