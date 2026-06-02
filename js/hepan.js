import { getGanWuxing, getZhiWuxing, getWuxingEng, getMaxWuxing, getMinWuxing, getDiShi } from './utils.js';

const LIUHE_MAP = {
    '子丑':'合','寅亥':'合','卯戌':'合','辰酉':'合','巳申':'合','午未':'合'
};
const SANHE_MAP = {
    '申子辰':'水局','亥卯未':'木局','寅午戌':'火局','巳酉丑':'金局'
};
const LIUCHONG_MAP = {
    '子午':'冲','丑未':'冲','寅申':'冲','卯酉':'冲','辰戌':'冲','巳亥':'冲'
};
const LIUHAI_MAP = {
    '子未':'害','丑午':'害','寅巳':'害','卯辰':'害','申亥':'害','酉戌':'害'
};
const HE_TAO_MAP = {
    '金': { pair:'水', desc:'金生水，源源不绝，互助之象', score:8 },
    '水': { pair:'木', desc:'水生木，生机勃发，相辅相成', score:8 },
    '木': { pair:'火', desc:'木生火，星火燎原，共同成长', score:8 },
    '火': { pair:'土', desc:'火生土，厚德载物，根基稳固', score:8 },
    '土': { pair:'金', desc:'土生金，藏珠蕴玉，相得益彰', score:8 }
};
const KE_MAP = {
    '金': { pair:'木', desc:'金克木，刚毅对柔韧，互有制衡', score:4 },
    '木': { pair:'土', desc:'木克土，进取对保守，需磨合', score:4 },
    '土': { pair:'水', desc:'土克水，堤坝对江河，以柔克刚', score:4 },
    '水': { pair:'火', desc:'水克火，冷静对热情，互补共存', score:4 },
    '火': { pair:'金', desc:'火克金，熔炉锻铁，淬炼成器', score:4 }
};
const SAME_MAP = {
    '金': { desc:'双金铿锵，皆具锋芒，刚烈易折需包容', score:5 },
    '木': { desc:'双木成林，欣欣向荣，同频共振默契足', score:6 },
    '水': { desc:'双水汇流，情深似海，灵犀相通智慧深', score:6 },
    '火': { desc:'双火烈焰，热情过盛，需有节制方长久', score:4 },
    '土': { desc:'双土厚重，诚信稳重，但嫌活力稍不足', score:5 }
};

const GAN_HE_MAP = {
    '甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'
};
const GAN_CHONG_MAP = {
    '甲庚':'冲','乙辛':'冲','丙壬':'冲','丁癸':'冲'
};

function initHepanModule() {
    const btn = document.getElementById("btnCalculateHp");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const nameA = document.getElementById("hpNameA").value.trim() || "甲方";
        const nameB = document.getElementById("hpNameB").value.trim() || "乙方";
        const genderA = document.querySelector('input[name="hpGenderA"]:checked').value;
        const genderB = document.querySelector('input[name="hpGenderB"]:checked').value;
        const dateA = document.getElementById("hpDateA").value;
        const dateB = document.getElementById("hpDateB").value;

        if (!dateA || !dateB) { alert("请填写两人的出生日期！"); return; }

        // Show skeleton
        const analysisEl = document.getElementById("hpAnalysis");
        if (analysisEl) {
            analysisEl.innerHTML = `
                <div class="bazi-report-loading">
                    <div class="skeleton-card"><div class="skeleton-pulse skeleton-block w40"></div><div class="skeleton-pulse skeleton-block"></div><div class="skeleton-pulse skeleton-block w80"></div></div>
                    <div class="skeleton-card"><div class="skeleton-pulse skeleton-block w40"></div><div class="skeleton-pulse skeleton-block"></div><div class="skeleton-pulse skeleton-block w60"></div></div>
                    <div class="skeleton-card"><div class="skeleton-pulse skeleton-block w40"></div><div class="skeleton-pulse skeleton-block w80"></div></div>
                </div>`;
            document.getElementById("hpResultCard").style.display = "block";
        }

        setTimeout(() => {
            try {
                const result = generateHepanAnalysis(nameA, genderA, dateA, nameB, genderB, dateB);
                if (analysisEl) analysisEl.innerHTML = result;
                document.getElementById("hpResultTitle").textContent = `${nameA} · ${nameB} 合盘对比分析`;
            } catch(e) {
                if (analysisEl) analysisEl.innerHTML = `<p style="color:var(--cinnabar-red);">合盘分析出错：${e.message}</p>`;
            }
        }, 50);
    });
}

function getBaziInfo(dateStr, gender) {
    const d = new Date(dateStr);
    const solar = Solar.fromDate(d);
    const lunar = solar.getLunar();
    const ba = lunar.getEightChar();
    return {
        solar, lunar, ba,
        yg: ba.getYearGan(), yz: ba.getYearZhi(),
        mg: ba.getMonthGan(), mz: ba.getMonthZhi(),
        dg: ba.getDayGan(), dz: ba.getDayZhi(),
        tg: ba.getTimeGan(), tz: ba.getTimeZhi(),
        gender,
        yearNayin: ba.getYearNaYin(),
        monthNayin: ba.getMonthNaYin(),
        dayNayin: ba.getDayNaYin(),
        timeNayin: ba.getTimeNaYin(),
        yearSS: ba.getYearShiShenGan(),
        monthSS: ba.getMonthShiShenGan(),
        timeSS: ba.getTimeShiShenGan(),
        wuxing: {} // computed below
    };
}

function calcPersonWuxing(p) {
    const w = { 金:0,木:0,水:0,火:0,土:0 };
    [p.yg, p.mg, p.dg, p.tg].forEach(g => w[getGanWuxing(g)] += 1.5);
    [p.yz, p.mz, p.dz, p.tz].forEach(z => w[getZhiWuxing(z)] += 2.0);
    w[getZhiWuxing(p.mz)] += 2.0;
    return w;
}

function analyzePillarRelationship(z1, z2, label) {
    const key = z1 + z2;
    const keyRev = z2 + z1;
    const liuhe = LIUHE_MAP[key] || LIUHE_MAP[keyRev];
    const liuchong = LIUCHONG_MAP[key] || LIUCHONG_MAP[keyRev];
    const liuhai = LIUHAI_MAP[key] || LIUHAI_MAP[keyRev];
    // Sanhe: check if both zhi belong to same sanhe group
    let sanhe = '';
    for (const [group, name] of Object.entries(SANHE_MAP)) {
        if (group.includes(z1) && group.includes(z2)) { sanhe = name; break; }
    }

    const ganKey = z1[0] + z2[0]; // This doesn't work for gan - need separate gan check
    // Actually for pillar relationship, we compare gan separately
    return { liuhe, liuchong, liuhai, sanhe, label };
}

function analyzeGanRelationship(g1, g2, label) {
    const key = g1 + g2;
    const keyRev = g2 + g1;
    const he = GAN_HE_MAP[key] || GAN_HE_MAP[keyRev];
    const chong = GAN_CHONG_MAP[key] || GAN_CHONG_MAP[keyRev];
    return { he, chong, label };
}

function generateHepanAnalysis(nameA, genderA, dateA, nameB, genderB, dateB) {
    const pA = getBaziInfo(dateA, genderA);
    const pB = getBaziInfo(dateB, genderB);
    pA.wuxing = calcPersonWuxing(pA);
    pB.wuxing = calcPersonWuxing(pB);

    const maxWA = Object.entries(pA.wuxing).sort((a,b) => b[1]-a[1])[0];
    const maxWB = Object.entries(pB.wuxing).sort((a,b) => b[1]-a[1])[0];
    const minWA = Object.entries(pA.wuxing).sort((a,b) => a[1]-b[1])[0];
    const minWB = Object.entries(pB.wuxing).sort((a,b) => a[1]-b[1])[0];

    // 1. Five elements comparison
    let wxAnalysis = '';
    let totalScore = 0;
    const wxA = pA.wuxing;
    const wxB = pB.wuxing;
    const allWx = Object.keys(wxA);
    
    allWx.forEach(wx => {
        const aV = wxA[wx], bV = wxB[wx];
        const avg = (aV + bV) / 2;
        const barW = Math.round((avg / 40) * 100);

        // Relationship analysis
        let rel = '';
        let relScore = 0;
        if (HE_TAO_MAP[wx]) {
            const partner = HE_TAO_MAP[wx].pair;
            if (partner && wxB[partner] > 0) {
                // This element generates partner
            }
        }
        // Direct analysis
        if (aV >= 25 && bV >= 25) {
            // Both strong in this element
            if (SAME_MAP[wx]) { rel = SAME_MAP[wx].desc; relScore = SAME_MAP[wx].score; }
        }
        // Check if one is the other's "sheng" (generating) relationship
        for (const [k, v] of Object.entries(HE_TAO_MAP)) {
            if (wx === k && allWx.includes(v.pair)) {
                if (aV >= 20 && wxB[v.pair] >= 15) {
                    rel = v.desc; relScore = v.score; break;
                }
                if (bV >= 20 && wxA[v.pair] >= 15) {
                    rel = v.desc; relScore = v.score; break;
                }
            }
        }
        if (!rel) {
            for (const [k, v] of Object.entries(KE_MAP)) {
                if (wx === k && allWx.includes(v.pair)) {
                    if ((aV >= 20 && wxB[v.pair] >= 15) || (bV >= 20 && wxA[v.pair] >= 15)) {
                        rel = v.desc; relScore = v.score; break;
                    }
                }
            }
        }
        if (!rel && aV >= 20 && bV >= 20) {
            rel = SAME_MAP[wx] ? SAME_MAP[wx].desc : `${wx}共鸣`;
            relScore = SAME_MAP[wx] ? SAME_MAP[wx].score : 5;
        }

        totalScore += relScore;
        wxAnalysis += `
            <div style="flex:1 1 160px;min-width:120px;background:rgba(212,175,55,0.04);border:1px solid rgba(212,175,55,0.1);border-radius:6px;padding:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="color:var(--color-${getWuxingEng(wx)});font-weight:700;font-size:0.82rem;">${wx}</span>
                    <span style="font-size:0.7rem;color:var(--text-gray);">${Math.round(aV)}% · ${Math.round(bV)}%</span>
                </div>
                <div style="display:flex;gap:4px;align-items:center;margin-bottom:4px;">
                    <div style="flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
                        <div style="height:100%;width:${Math.round((aV/40)*100)}%;background:var(--color-${getWuxingEng(wx)});border-radius:3px;opacity:0.7;"></div>
                    </div>
                    <span style="font-size:0.65rem;color:var(--text-gray);">${nameA}</span>
                </div>
                <div style="display:flex;gap:4px;align-items:center;">
                    <div style="flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
                        <div style="height:100%;width:${Math.round((bV/40)*100)}%;background:var(--color-${getWuxingEng(wx)});border-radius:3px;opacity:0.7;"></div>
                    </div>
                    <span style="font-size:0.65rem;color:var(--text-gray);">${nameB}</span>
                </div>
                ${rel ? `<div style="font-size:0.7rem;color:var(--text-gray);margin-top:4px;">${rel}</div>` : ''}
            </div>`;
    });

    // 2. Pillar relationships (地支)
    const pillarPairs = [
        { z1: pA.yz, z2: pB.yz, label: '年柱' },
        { z1: pA.mz, z2: pB.mz, label: '月柱' },
        { z1: pA.dz, z2: pB.dz, label: '日柱(婚姻)' },
        { z1: pA.tz, z2: pB.tz, label: '时柱' }
    ];
    let zhiHtml = '';
    let zhiScore = 0;
    pillarPairs.forEach(({ z1, z2, label }) => {
        const rel = analyzePillarRelationship(z1, z2, label);
        const parts = [];
        if (rel.liuhe) parts.push(`<span style="color:var(--jade-green);">六合</span>`);
        if (rel.sanhe) parts.push(`<span style="color:var(--jade-green);">${rel.sanhe}</span>`);
        if (rel.liuchong) { parts.push(`<span style="color:var(--cinnabar-red);">六冲</span>`); zhiScore -= 3; }
        if (rel.liuhai) { parts.push(`<span style="color:var(--cinnabar-red);">六害</span>`); zhiScore -= 2; }
        if (!parts.length) parts.push(`<span style="color:var(--text-gray);">平</span>`);
        if (rel.liuhe) zhiScore += 5;
        if (rel.sanhe) zhiScore += 4;
        zhiHtml += `<span style="padding:4px 10px;border:1px solid var(--border-color);border-radius:4px;font-size:0.78rem;">${label}：${z1} ${rel.liuchong || rel.liuhe || rel.liuhai ? '-' : 'vs'} ${z2} → ${parts.join('、')}</span>`;
    });

    // 3. Gan relationships (天干)
    const ganPairs = [
        { g1: pA.yg, g2: pB.yg, label: '年干' },
        { g1: pA.mg, g2: pB.mg, label: '月干' },
        { g1: pA.dg, g2: pB.dg, label: '日干(元神)' },
        { g1: pA.tg, g2: pB.tg, label: '时干' }
    ];
    let ganHtml = '';
    let ganScore = 0;
    ganPairs.forEach(({ g1, g2, label }) => {
        const rel = analyzeGanRelationship(g1, g2, label);
        const parts = [];
        if (rel.he) { parts.push(`<span style="color:var(--jade-green);">天干五合</span>`); ganScore += 4; }
        if (rel.chong) { parts.push(`<span style="color:var(--cinnabar-red);">天干相冲</span>`); ganScore -= 3; }
        if (!parts.length) parts.push(`<span style="color:var(--text-gray);">平</span>`);
        ganHtml += `<span style="padding:4px 10px;border:1px solid var(--border-color);border-radius:4px;font-size:0.78rem;">${label}：${g1}${g2} → ${parts.join('、')}</span>`;
    });

    // 4. NaYin comparison
    const nayinItems = [
        { n1: pA.yearNayin, n2: pB.yearNayin, label: '年柱' },
        { n1: pA.monthNayin, n2: pB.monthNayin, label: '月柱' },
        { n1: pA.dayNayin, n2: pB.dayNayin, label: '日柱' },
        { n1: pA.timeNayin, n2: pB.timeNayin, label: '时柱' }
    ];
    let nayinHtml = nayinItems.map(({ n1, n2, label }) =>
        `<span style="padding:4px 10px;border:1px solid var(--border-color);border-radius:4px;font-size:0.78rem;">${label}：${n1} · ${n2}</span>`
    ).join('');

    // 5. Score calculation
    const finalScore = Math.min(Math.max(Math.round(50 + totalScore + zhiScore + ganScore), 0), 100);
    let scoreLevel = '', scoreColor = '';
    if (finalScore >= 80) { scoreLevel = '上等合盘 · 天作之合'; scoreColor = 'var(--jade-green)'; }
    else if (finalScore >= 60) { scoreLevel = '中等合盘 · 相辅相成'; scoreColor = 'var(--text-gold)'; }
    else if (finalScore >= 40) { scoreLevel = '中等偏下 · 需要磨合'; scoreColor = '#D4A03C'; }
    else { scoreLevel = '下等合盘 · 冲突较多'; scoreColor = 'var(--cinnabar-red)'; }

    // 6. Ten Gods comparison
    const tenGodHtml = `
        <p style="font-size:0.82rem;"><strong>${nameA}</strong>：${[pA.yearSS, pA.monthSS, pA.timeSS].filter(Boolean).join(' · ') || '—'}</p>
        <p style="font-size:0.82rem;"><strong>${nameB}</strong>：${[pB.yearSS, pB.monthSS, pB.timeSS].filter(Boolean).join(' · ') || '—'}</p>`;

    return `
        <div class="bazi-report">
            <div class="divider-quote">"合二姓之好，上以事宗庙，下以继后世。" 双命合参，以示天意。</div>

            <div class="report-section" style="text-align:center;">
                <div style="font-size:2.5rem;font-weight:900;color:${scoreColor};">${finalScore}<span style="font-size:1rem;">分</span></div>
                <div style="font-size:0.9rem;color:${scoreColor};font-weight:600;margin-top:4px;">${scoreLevel}</div>
                <div style="display:flex;justify-content:center;gap:20px;margin-top:10px;font-size:0.78rem;color:var(--text-gray);">
                    <span>${nameA} · ${genderA === '男' ? '乾造' : '坤造'}</span>
                    <span>${nameB} · ${genderB === '男' ? '乾造' : '坤造'}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>🧐 一、八字排盘对比</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="background:rgba(212,175,55,0.04);border-radius:6px;padding:10px;">
                        <p style="font-size:0.82rem;font-weight:600;color:var(--text-gold);margin:0 0 6px 0;">${nameA}</p>
                        <p style="font-size:0.78rem;">年柱 ${pA.yg}${pA.yz}（${pA.yearNayin}）<br>月柱 ${pA.mg}${pA.mz}（${pA.monthNayin}）<br>日柱 ${pA.dg}${pA.dz}（${pA.dayNayin}）<br>时柱 ${pA.tg}${pA.tz}（${pA.timeNayin}）</p>
                    </div>
                    <div style="background:rgba(212,175,55,0.04);border-radius:6px;padding:10px;">
                        <p style="font-size:0.82rem;font-weight:600;color:var(--text-gold);margin:0 0 6px 0;">${nameB}</p>
                        <p style="font-size:0.78rem;">年柱 ${pB.yg}${pB.yz}（${pB.yearNayin}）<br>月柱 ${pB.mg}${pB.mz}（${pB.monthNayin}）<br>日柱 ${pB.dg}${pB.dz}（${pB.dayNayin}）<br>时柱 ${pB.tg}${pB.tz}（${pB.timeNayin}）</p>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>🔮 二、五行能量对比</h4>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">${wxAnalysis}</div>
            </div>

            <div class="report-section">
                <h4>🌿 三、地支关系</h4>
                <p style="font-size:0.78rem;color:var(--text-gray);margin:0 0 8px 0;">年、月、日、时四柱地支间的生合冲害关系：</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">${zhiHtml}</div>
            </div>

            <div class="report-section">
                <h4>☀️ 四、天干关系</h4>
                <p style="font-size:0.78rem;color:var(--text-gray);margin:0 0 8px 0;">四柱天干间的五合与相冲：</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">${ganHtml}</div>
            </div>

            <div class="report-section">
                <h4>🎵 五、纳音对照</h4>
                <p style="font-size:0.78rem;color:var(--text-gray);margin:0 0 8px 0;">双方四柱纳音对比：</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">${nayinHtml}</div>
            </div>

            <div class="report-section">
                <h4>📜 六、十神格局</h4>
                <p style="font-size:0.78rem;color:var(--text-gray);margin:0 0 6px 0;">双方十神组合对比：</p>
                ${tenGodHtml}
            </div>

            <div class="footer-note">✦ 合盘仅供趋吉避凶之参考，缘分之深浅在于人心。相知相惜，方为正道。 ✦</div>
        </div>`;
}

export { initHepanModule };
