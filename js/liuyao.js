import { AppState } from './state.js';
import { getGuaInfo, getGanWuxing, getWuxingEng } from './utils.js';

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

        const container = document.getElementById("guaLinesContainer");
        container.innerHTML = `<div class="empty-gua-tip" style="display:none;"></div>`;
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

        const coins = document.querySelectorAll(".coin");
        coins.forEach(coin => coin.classList.add("spinning"));

        setTimeout(() => {
            const coinResults = [
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 2)
            ];

            coins.forEach((coin, idx) => {
                coin.classList.remove("spinning");
                const rotateY = coinResults[idx] === 0 ? 0 : 180;
                const rotateX = Math.floor(Math.random() * 20) - 10;
                coin.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            const headCount = coinResults.filter(r => r === 0).length;
            let lineType = 1, lineName = "";

            if (headCount === 3) { lineType = 3; lineName = "老阳 (动)"; }
            else if (headCount === 0) { lineType = 0; lineName = "老阴 (动)"; }
            else if (headCount === 2) { lineType = 2; lineName = "少阳"; }
            else { lineType = 1; lineName = "少阴"; }

            AppState.liuyao.lines.push(lineType);
            AppState.liuyao.currentStep++;

            renderGuaLine(AppState.liuyao.currentStep, lineType, lineName);

            const progress = (AppState.liuyao.currentStep / 6) * 100;
            document.getElementById("liuyaoProgressBar").style.width = `${progress}%`;
            document.getElementById("shakeStatus").innerHTML = `已摇卦：${AppState.liuyao.currentStep} / 6 次`;

            if (AppState.liuyao.currentStep < 6) {
                btnShake.disabled = false;
                btnShake.innerHTML = `<i class="fa-solid fa-hand-sparkles"></i> 继续摇第 ${AppState.liuyao.currentStep + 1} 爻`;
            } else {
                btnShake.innerHTML = `<i class="fa-solid fa-scroll"></i> 六爻卦成，正在解卦`;
                setTimeout(revealGuaResult, 800);
            }
        }, 1200);
    });

    btnReset.addEventListener("click", () => {
        instructionSection.style.display = "flex";
        stageSection.style.display = "none";
    });

    const btnManual = document.getElementById("btnManualLiuyao");
    const manualPanel = document.getElementById("liuyaoManualPanel");
    if (btnManual && manualPanel) {
        const inputContainer = document.getElementById("manualYaoInputs");
        if (inputContainer) {
            const stepsCn = ["初爻","二爻","三爻","四爻","五爻","上爻"];
            inputContainer.innerHTML = stepsCn.map((name, i) => `
                <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                    <span style="width:36px;font-size:0.78rem;color:var(--text-gray);">${name}</span>
                    <select class="manual-yao-select" data-idx="${i}" style="flex:1;background:rgba(10,10,12,0.8);border:1px solid rgba(212,175,55,0.25);border-radius:4px;color:var(--text-gold);font-size:0.78rem;padding:4px 6px;">
                        <option value="2">少阳 (—)</option>
                        <option value="1">少阴 (--)</option>
                        <option value="3">老阳 (—○ 动)</option>
                        <option value="0">老阴 (--× 动)</option>
                    </select>
                </div>
            `).join('');
        }
        btnManual.addEventListener("click", () => {
            manualPanel.style.display = manualPanel.style.display === "none" ? "block" : "none";
        });
        document.getElementById("btnSubmitManualGua").addEventListener("click", () => {
            const selects = manualPanel.querySelectorAll(".manual-yao-select");
            AppState.liuyao.lines = [];
            AppState.liuyao.currentStep = 0;
            let valid = true;
            selects.forEach(sel => {
                const val = parseInt(sel.value);
                if (isNaN(val)) { valid = false; return; }
                AppState.liuyao.lines.push(val);
                AppState.liuyao.currentStep++;
            });
            if (!valid || AppState.liuyao.lines.length !== 6) { alert("请为每一爻选择正确的阴阳类型"); return; }
            instructionSection.style.display = "none";
            stageSection.style.display = "flex";
            manualPanel.style.display = "none";
            const container = document.getElementById("guaLinesContainer");
            container.innerHTML = '';
            const stepsCn = ["初爻","二爻","三爻","四爻","五爻","上爻"];
            AppState.liuyao.lines.forEach((type, i) => {
                const nameMap = { 3:"老阳 (动)",0:"老阴 (动)",2:"少阳",1:"少阴" };
                renderGuaLine(i + 1, type, nameMap[type] || "少阴");
                document.getElementById("liuyaoProgressBar").style.width = `${((i + 1) / 6) * 100}%`;
                document.getElementById("shakeStatus").innerHTML = `已手动排爻：${i + 1} / 6 次`;
            });
            document.getElementById("shakeStatus").innerHTML = `已手动排爻：6 / 6`;
            document.getElementById("btnShakeCoins").disabled = true;
            document.getElementById("btnShakeCoins").innerHTML = `<i class="fa-solid fa-scroll"></i> 六爻卦成`;
            setTimeout(revealGuaResult, 600);
        });
    }
}

function renderGuaLine(step, type, name) {
    const container = document.getElementById("guaLinesContainer");
    if (step === 1) container.innerHTML = '';

    const lineItem = document.createElement("div");
    lineItem.className = "gua-line-item";

    let lineVisualClass = "yin";
    let lineVisualHtml = `<div class="seg"></div><div class="seg"></div>`;
    let isMove = false;

    if (type === 2) { lineVisualClass = "yang"; lineVisualHtml = `<div class="seg"></div>`; }
    else if (type === 3) { lineVisualClass = "yang active-move"; lineVisualHtml = `<div class="seg"></div>`; isMove = true; }
    else if (type === 0) { lineVisualClass = "yin active-move"; lineVisualHtml = `<div class="seg"></div><div class="seg"></div>`; isMove = true; }

    lineItem.innerHTML = `
        <span class="line-num">初爻</span>
        <div class="line-visual ${lineVisualClass}">${lineVisualHtml}</div>
        <span class="line-tag ${isMove ? 'move-tag' : ''}">${name}</span>
    `;

    const stepsCn = ["初爻","二爻","三爻","四爻","五爻","上爻"];
    lineItem.querySelector(".line-num").innerHTML = stepsCn[step - 1];
    container.appendChild(lineItem);
}

function revealGuaResult() {
    const baseCode = AppState.liuyao.lines.map(l => (l === 2 || l === 3) ? "1" : "0").join("");
    const changeCode = AppState.liuyao.lines.map(l => {
        if (l === 3) return "0";
        if (l === 0) return "1";
        return (l === 2) ? "1" : "0";
    }).join("");

    const baseGua = getGuaInfo(baseCode);
    const changeGua = getGuaInfo(changeCode);

    const titleEl = document.getElementById("liuyaoResultTitle");
    const bodyEl = document.getElementById("liuyaoResultBody");

    const hasMove = AppState.liuyao.lines.includes(3) || AppState.liuyao.lines.includes(0);
    titleEl.innerHTML = `${baseGua.name} ${hasMove ? ' 变 ' + changeGua.name : '(静卦静思)'}`;

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
    document.getElementById("liuyaoResultScroll").style.display = "block";
    document.getElementById("btnShakeCoins").innerHTML = `<i class="fa-solid fa-check"></i> 解卦完成`;
    document.getElementById("liuyaoResultScroll").scrollIntoView({ behavior:'smooth' });
}

export { initLiuyaoModule };
