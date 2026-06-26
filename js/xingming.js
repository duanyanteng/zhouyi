import { getStroke, SHU_LI } from './utils.js?20260626-5';

function initXingmingModule() {
    const btn = document.getElementById("btnCalcXingming");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const sur = document.getElementById("xmSurname").value.trim();
        const given = document.getElementById("xmGivenName").value.trim();
        if (!sur || !given) { alert("请同时输入姓氏和名字"); return; }

        const tian = getStroke(sur[0]) + 1;
        const ren = getStroke(sur[0]) + getStroke(given[0]);
        const di = getStroke(given[0]) + (given[1] ? getStroke(given[1]) : 1);
        const wai = (given[1] ? getStroke(given[1]) : 0) + 1 + (sur.length > 1 ? getStroke(sur[1]) : 0);
        const zong2 = [...sur.split(''), ...given.split('')].reduce((s, c) => s + getStroke(c), 0);

        const cells = [
            { label:"天格", val:tian, idx:tian > 81 ? tian % 81 : tian },
            { label:"人格", val:ren, idx:ren > 81 ? ren % 81 : ren },
            { label:"地格", val:di, idx:di > 81 ? di % 81 : di },
            { label:"外格", val:wai, idx:wai > 81 ? wai % 81 : wai },
            { label:"总格", val:zong2, idx:zong2 > 81 ? zong2 % 81 : zong2 }
        ];

        const grid = document.getElementById("xmGrid");
        grid.innerHTML = cells.map(c => {
            const sl = SHU_LI[c.idx] || { luck:"平", desc:"中庸" };
            return `<div class="xm-cell">
                <div class="cell-label">${c.label} (${c.val}画)</div>
                <div class="cell-value">${c.idx}</div>
                <div class="cell-score ${sl.luck.includes('吉') ? 'good' : 'bad'}">${sl.luck}<br>${sl.desc}</div>
            </div>`;
        }).join('');

        const totalScore = cells.filter(c => (SHU_LI[c.idx] || {}).luck.includes('吉')).length;
        document.getElementById("xmAnalysis").innerHTML = `
            <p style="margin-top:12px;"><strong>${sur}${given}</strong> 此名五格数理：${totalScore >= 4 ? '上佳之选，数理清正' : totalScore >= 3 ? '中平，有吉有凶' : '需谨慎，凶数偏多'}。</p>
            <p>${cells.map(c => { const sl = SHU_LI[c.idx] || { luck:"平", desc:"中庸" }; return `<strong>${c.label}</strong> ${c.val}画 → ${c.idx}数（${sl.luck}）：${sl.desc}。`; }).join('<br>')}</p>
            <p style="margin-top:8px;font-size:0.75rem;color:var(--text-gray);">* 笔画按康熙繁体重计算，部分生僻字采用近似值。</p>
        `;
        document.getElementById("xmResultCard").style.display = "block";
    });
}

export { initXingmingModule };