import { ZI_WEI_STARS } from './utils.js';

function ziweiPaiPan(year, month, day, hour, gender) {
    const ziWeiPos = ((day - 1) % 12) + 1;
    const palaces = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
    const stars = Array(12).fill(null).map(() => []);
    const mainOffset = { "紫微":0,"天机":-1,"太阳":-3,"武曲":-4,"天同":-5,"廉贞":4,"天府":0,"太阴":2,"贪狼":3,"巨门":4,"天相":5,"天梁":6,"七杀":7,"破军":10 };
    for (let [name, offset] of Object.entries(mainOffset).slice(0, 6)) {
        const pos = ((ziWeiPos + offset - 1 + 12) % 12);
        stars[pos].push({ name, type:'main' });
    }
    const tianFuPos = (ziWeiPos + 6) % 12;
    stars[tianFuPos].push({ name:"天府", type:'main' });
    const tianFuOffset = { "太阴":2,"贪狼":3,"巨门":4,"天相":5,"天梁":6,"七杀":7,"破军":10 };
    for (let [name, offset] of Object.entries(tianFuOffset)) {
        const pos = ((tianFuPos + offset - 1 + 12) % 12);
        if (!stars[pos].find(s => s.name === name)) stars[pos].push({ name, type:'main' });
    }
    stars[(ziWeiPos + 3) % 12].push({ name:"左辅", type:'ci' });
    stars[(ziWeiPos + 9) % 12].push({ name:"右弼", type:'ci' });
    stars[(ziWeiPos + 5) % 12].push({ name:"文昌", type:'ci' });
    stars[(ziWeiPos + 7) % 12].push({ name:"文曲", type:'ci' });
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

        const chart = document.getElementById("zwChart");
        const layoutOrder = [5,4,3,2,1,0,11,10,9,8,7,6];
        chart.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const pi = layoutOrder[i];
            const pal = document.createElement("div");
            pal.className = `zw-palace ${pi === result.mingPos ? 'ming' : ''} ${pi === result.shenPos ? 'shen' : ''}`;
            pal.innerHTML = `<div class="zw-palace-name">${result.palaces[pi]}${pi === result.mingPos ? ' (命)' : ''}${pi === result.shenPos ? ' (身)' : ''}</div>`;
            (result.stars[pi] || []).forEach(s => {
                const span = document.createElement("div");
                span.className = `zw-star ${s.type}`;
                span.textContent = s.name;
                pal.appendChild(span);
            });
            chart.appendChild(pal);
        }

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

export { initZiweiModule };
