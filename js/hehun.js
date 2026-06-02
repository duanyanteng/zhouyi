import { getGanWuxing, getZhiWuxing } from './utils.js';

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
        const shengKe = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
        let wxScore = 0;
        for (let key in wxM) {
            if (wxM[key] > 2) { const s = shengKe[key]; if (wxF[s] > 1) wxScore += 15; }
            if (wxF[key] > 2) { const s = shengKe[key]; if (wxM[s] > 1) wxScore += 15; }
        }
        wxScore = Math.min(wxScore + 30, 100);

        let naScore = 60;
        try {
            const naM = baziM ? baziM.getYearNaYin() : '';
            const naF = baziF ? baziF.getYearNaYin() : '';
            if (naM && naF && naM === naF) naScore = 90;
        } catch(e) {}

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
            <p style="margin-top:12px;font-size:0.8rem;color:var(--text-gray);">合婚之道，阴阳相济。分数仅供参考，缘分深浅在人心相印。</p>
        `;
        document.getElementById("hhResultTitle").innerHTML = `${nameM} & ${nameF} 合婚批断`;
        document.getElementById("hhResultCard").style.display = "block";
    });
}

export { initHehunModule };
