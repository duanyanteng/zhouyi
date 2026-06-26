import { AppState } from './state.js?20260626-5';
import { getGuaInfo, getGuaRelations } from './gua-data.js?20260626-5';
import { showLoading, hideLoading } from './utils.js?20260626-5';

/* ---------- 音效与震动反馈 ---------- */
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playCoinSound() {
    try {
        const ctx = initAudioContext();
        if (!ctx) return;

        // 创建金属碰撞音效
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);

        // 添加第二个音调模拟金属回响
        const oscillator2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(ctx.destination);

        oscillator2.frequency.setValueAtTime(1200, ctx.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
        oscillator2.type = 'triangle';

        gainNode2.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator2.start(ctx.currentTime + 0.02);
        oscillator2.stop(ctx.currentTime + 0.12);
    } catch(e) {
        console.log('音效播放失败:', e);
    }
}

function triggerVibration(duration = 50) {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    } catch(e) {
        console.log('震动反馈失败:', e);
    }
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

            // 播放铜钱落地音效和震动反馈
            playCoinSound();
            triggerVibration(80);

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
    const relations = getGuaRelations(baseCode);
    const movingLines = AppState.liuyao.lines
        .map((line, idx) => ({ line, idx }))
        .filter(item => item.line === 3 || item.line === 0);

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
        <div class="gua-summary-grid">
            ${renderGuaSummaryCard("本卦", baseGua, "当下局势")}
            ${renderGuaSummaryCard(hasMove ? "变卦" : "守卦", changeGua, hasMove ? "趋势去向" : "静守之象")}
            ${renderGuaSummaryCard(relations.mutual.label, relations.mutual.gua, "内在动因")}
            ${renderGuaSummaryCard(relations.opposite.label, relations.opposite.gua, "反面风险")}
            ${renderGuaSummaryCard(relations.reversed.label, relations.reversed.gua, "换位观察")}
        </div>
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
            ${renderMovingLineAdvice(movingLines, baseGua)}
        `;
    } else {
        analysisHtml += `
            <h4>⚓ 静卦深思良言</h4>
            <p>此卦六爻皆静，无动爻产生。静卦往往代表当下局势平稳，变数不大。无需过于焦虑，当遵循本卦卦辞与德行，顺其自然，以不变应万变，便可安然无恙。</p>
        `;
    }

    analysisHtml += `
        <h4>🧭 互错综参断</h4>
        <p><strong>互卦【${relations.mutual.gua.name}】</strong>：${relations.mutual.hint}${relations.mutual.gua.advice}</p>
        <p><strong>错卦【${relations.opposite.gua.name}】</strong>：${relations.opposite.hint}${relations.opposite.gua.advice}</p>
        <p><strong>综卦【${relations.reversed.gua.name}】</strong>：${relations.reversed.hint}${relations.reversed.gua.advice}</p>
    `;

    bodyEl.innerHTML = analysisHtml;
    document.getElementById("liuyaoResultScroll").style.display = "block";
    document.getElementById("btnShakeCoins").innerHTML = `<i class="fa-solid fa-check"></i> 解卦完成`;
    document.dispatchEvent(new CustomEvent('liuyao-analysis-complete', {
        detail: {
            title: `${baseGua.name}${hasMove ? ' 变 ' + changeGua.name : ' 静卦'}`,
            summary: `${baseGua.name} · ${hasMove ? changeGua.name : '无动爻'} · ${AppState.liuyao.category}`,
            baseCode,
            changeCode,
            lines: [...AppState.liuyao.lines],
            category: AppState.liuyao.category,
            relations: {
                mutual: relations.mutual.gua.name,
                opposite: relations.opposite.gua.name,
                reversed: relations.reversed.gua.name
            }
        }
    }));
    document.getElementById("liuyaoResultScroll").scrollIntoView({ behavior:'smooth' });
}

function renderGuaSummaryCard(label, gua, hint) {
    return `
        <div class="gua-summary-card">
            <span class="summary-role">${label}</span>
            <strong>${gua.symbol || ""} ${gua.name}</strong>
            <small>第${gua.order || "-"}卦 · ${hint}</small>
        </div>
    `;
}

function renderMovingLineAdvice(movingLines, baseGua) {
    if (!movingLines.length) return "";
    const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
    return `
        <div class="moving-line-panel">
            <h4>📌 动爻爻辞</h4>
            ${movingLines.map(({ idx }) => `
                <p><strong>${lineNames[idx]}</strong>：${baseGua.yao?.[idx] || "此爻发动，宜结合本卦之义审慎应事。"}</p>
            `).join("")}
        </div>
    `;
}

export { initLiuyaoModule };