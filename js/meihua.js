import { getGuaInfo, SIXTY_FOUR_GUA } from './utils.js?20260626-5';

function initMeihuaModule() {
    const btnCalc = document.getElementById("btnCalcMeihua");
    const btnRand = document.getElementById("btnMhRandom");
    if (!btnCalc) return;

    if (btnRand) {
        btnRand.addEventListener("click", () => {
            document.getElementById("mhNum1").value = Math.floor(Math.random() * 8) + 1;
            document.getElementById("mhNum2").value = Math.floor(Math.random() * 8) + 1;
            document.getElementById("mhNum3").value = Math.floor(Math.random() * 6) + 1;
        });
    }

    const BA_GUA = ['坤','艮','坎','巽','震','离','兑','乾'];
    const BA_GUA_SYMBOL = ['☷','☶','☵','☴','☳','☲','☱','☰'];

    btnCalc.addEventListener("click", () => {
        const n1 = parseInt(document.getElementById("mhNum1").value) || 1;
        const n2 = parseInt(document.getElementById("mhNum2").value) || 1;
        const n3 = parseInt(document.getElementById("mhNum3").value) || 1;

        const shangIdx = (n1 - 1) % 8;
        const xiaIdx = (n2 - 1) % 8;
        const dongIdx = (n3 - 1) % 6;

        const shang = BA_GUA[shangIdx];
        const xia = BA_GUA[xiaIdx];
        const shangSym = BA_GUA_SYMBOL[shangIdx];
        const xiaSym = BA_GUA_SYMBOL[xiaIdx];

        let binCode = '';
        for (let i = 2; i >= 0; i--) binCode += ((xiaIdx >> i) & 1) ? "1" : "0";
        for (let i = 2; i >= 0; i--) binCode += ((shangIdx >> i) & 1) ? "1" : "0";

        const gua = getGuaInfo(binCode);

        document.getElementById("mhResultTitle").innerHTML = `${shangSym}${xiaSym} ${shang}${xia} · ${gua.name}`;

        const dongCn = ["初爻","二爻","三爻","四爻","五爻","上爻"][dongIdx];
        document.getElementById("mhResultBody").innerHTML = `
            <p>起卦数字：<strong>${n1}</strong>（上卦 ${shang}）、<strong>${n2}</strong>（下卦 ${xia}）、<strong>${n3}</strong>（动爻 ${dongCn}）</p>
            <p>得卦 <strong>【${gua.name}】</strong>。卦辞曰：<em>${gua.dec}</em></p>
            <h4>大师点拨</h4>
            <p>${gua.advice}</p>
            <h4>动爻启示</h4>
            <p>${dongCn}发动，变在即。${dongIdx % 2 === 0 ? '阴爻动，宜静观其变。' : '阳爻动，当主动求变。'} 吉凶悔吝生乎动，顺势而为可也。</p>
        `;
        document.getElementById("mhResultCard").style.display = "block";
    });
}

export { initMeihuaModule };