function initFengshuiModule() {
    const sitSelect = document.getElementById("houseSitDirection");
    const gridCells = document.querySelectorAll("#nineGridLayout .grid-cell");

    if (sitSelect) {
        sitSelect.addEventListener("change", () => {
            calculateEightHouse(sitSelect.value);
        });
        calculateEightHouse("坐北朝南");
    }

    gridCells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (cell.classList.contains("center-cell")) return;
            gridCells.forEach(c => c.classList.remove("active-select"));
            cell.classList.add("active-select");

            const direction = cell.querySelector(".cell-direction").innerHTML;
            const star = cell.querySelector(".cell-star").innerHTML;
            const luck = cell.querySelector(".cell-luck").innerHTML;
            renderFengshuiAdvice(direction, star, luck);
        });
    });
}

function calculateEightHouse(sitType) {
    const gridCells = document.querySelectorAll("#nineGridLayout .grid-cell:not(.center-cell)");

    const houseMaps = {
        "坐北朝南": { N:{star:"伏位木",luck:"吉",good:true}, S:{star:"延年金",luck:"大吉",good:true}, E:{star:"天医土",luck:"大吉",good:true}, SE:{star:"生气木",luck:"大吉",good:true}, NE:{star:"五鬼火",luck:"大凶",good:false}, SW:{star:"绝命金",luck:"大凶",good:false}, NW:{star:"六煞水",luck:"中凶",good:false}, W:{star:"祸害土",luck:"小凶",good:false} },
        "坐南朝北": { S:{star:"伏位火",luck:"吉",good:true}, N:{star:"延年金",luck:"大吉",good:true}, SE:{star:"天医土",luck:"大吉",good:true}, E:{star:"生气木",luck:"大吉",good:true}, W:{star:"五鬼火",luck:"大凶",good:false}, NW:{star:"绝命金",luck:"大凶",good:false}, SW:{star:"六煞水",luck:"中凶",good:false}, NE:{star:"祸害土",luck:"小凶",good:false} },
        "坐东朝西": { E:{star:"伏位木",luck:"吉",good:true}, SE:{star:"延年金",luck:"大吉",good:true}, N:{star:"天医土",luck:"大吉",good:true}, S:{star:"生气木",luck:"大吉",good:true}, NW:{star:"五鬼火",luck:"大凶",good:false}, W:{star:"绝命金",luck:"大凶",good:false}, NE:{star:"六煞水",luck:"中凶",good:false}, SW:{star:"祸害土",luck:"小凶",good:false} },
        "坐西朝东": { W:{star:"伏位金",luck:"吉",good:true}, NE:{star:"延年金",luck:"大吉",good:true}, SW:{star:"天医土",luck:"大吉",good:true}, NW:{star:"生气木",luck:"大吉",good:true}, S:{star:"五鬼火",luck:"大凶",good:false}, E:{star:"绝命金",luck:"大凶",good:false}, SE:{star:"六煞水",luck:"中凶",good:false}, N:{star:"祸害土",luck:"小凶",good:false} },
        "坐东南朝西北": { SE:{star:"伏位木",luck:"吉",good:true}, E:{star:"延年金",luck:"大吉",good:true}, S:{star:"天医土",luck:"大吉",good:true}, N:{star:"生气木",luck:"大吉",good:true}, SW:{star:"五鬼火",luck:"大凶",good:false}, NE:{star:"绝命金",luck:"大凶",good:false}, W:{star:"六煞水",luck:"中凶",good:false}, NW:{star:"祸害土",luck:"小凶",good:false} },
        "坐西北朝东南": { NW:{star:"伏位金",luck:"吉",good:true}, SW:{star:"延年金",luck:"大吉",good:true}, NE:{star:"天医土",luck:"大吉",good:true}, W:{star:"生气木",luck:"大吉",good:true}, E:{star:"五鬼火",luck:"大凶",good:false}, S:{star:"绝命金",luck:"大凶",good:false}, N:{star:"六煞水",luck:"中凶",good:false}, SE:{star:"祸害土",luck:"小凶",good:false} },
        "坐西南朝东北": { SW:{star:"伏位土",luck:"吉",good:true}, W:{star:"延年金",luck:"大吉",good:true}, NE:{star:"生气木",luck:"大吉",good:true}, N:{star:"绝命金",luck:"大凶",good:false}, E:{star:"祸害土",luck:"小凶",good:false} },
        "坐东北朝西南": { NE:{star:"伏位土",luck:"吉",good:true}, W:{star:"延年金",luck:"大吉",good:true}, NW:{star:"天医土",luck:"大吉",good:true}, SW:{star:"生气木",luck:"大吉",good:true}, N:{star:"五鬼火",luck:"大凶",good:false}, SE:{star:"绝命金",luck:"大凶",good:false}, E:{star:"六煞水",luck:"中凶",good:false}, S:{star:"祸害土",luck:"小凶",good:false} }
    };

    const curMap = houseMaps[sitType] || houseMaps["坐北朝南"];

    gridCells.forEach(cell => {
        const pos = cell.getAttribute("data-pos");
        const data = curMap[pos];
        if (data) {
            cell.querySelector(".cell-star").innerHTML = data.star;
            cell.querySelector(".cell-luck").innerHTML = data.luck;
            cell.querySelector(".cell-luck").className = `cell-luck ${data.good ? 'status-good' : 'status-bad'}`;
            if (data.good) {
                cell.style.boxShadow = "inset 0 0 10px rgba(212, 175, 55, 0.1)";
                cell.style.borderColor = "rgba(212, 175, 55, 0.2)";
            } else {
                cell.style.boxShadow = "inset 0 0 10px rgba(201, 60, 60, 0.05)";
                cell.style.borderColor = "rgba(201, 60, 60, 0.1)";
            }
        }
    });

    const bodyEl = document.getElementById("fengshuiResultBody");
    bodyEl.innerHTML = `
        <p class="empty-fengshui-desc font-shufa" style="text-align:center;margin-top:50px;">
            "明堂开阔，藏风聚气。"<br><br>
            已排定 <strong>【${sitType}】</strong> 气场格局。<br>
            请点击左侧具体的九宫方位，获取专属软装布局与化解之道。
        </p>
    `;
    document.getElementById("fengshuiResultTitle").innerHTML = "空间气场已布盘";
}

function renderFengshuiAdvice(direction, star, luck) {
    const titleEl = document.getElementById("fengshuiResultTitle");
    const bodyEl = document.getElementById("fengshuiResultBody");
    titleEl.innerHTML = `☯ 【${direction}】方位气场详解`;

    const isGood = luck.includes("吉");
    if (isGood) {
        bodyEl.innerHTML = `
            <p>善信所点之 <strong>【${direction}】</strong> 方位，在此住宅格局中属于 <strong>${star}</strong> 极吉之位（判定：<strong>${luck}</strong>）。吉星高照，主生气勃勃、家庭和睦、财源广进！</p>
            <h4>🏢 空间功能配比建议</h4>
            <p>1. <strong>主卧/书房首选</strong>：此方位磁场极为中正温暖，极利于人体气场的休养生息，建议在此设立主人卧室。若作为书房，能极大地提升文昌考运与决断力。<br>2. <strong>大门/玄关</strong>：若大门或主玄关开在此方位，属于"迎吉纳福"之象，每天进出引动吉星，财富运势将蒸蒸日上。</p>
            <h4>🌟 大师催旺布设指南</h4>
            <p>1. <strong>催财利器</strong>：建议在此方位摆放一尊<strong>【金蟾】</strong>或<strong>【貔貅】</strong>摆件，头朝门外，可广纳八方财气。<br>2. <strong>常绿植物</strong>：若此位属木（如生气木），宜在此摆放富贵竹、发财树等大叶常绿植物，可极大地生旺木气，使事业生生不息。</p>
        `;
    } else {
        bodyEl.innerHTML = `
            <p>善信所点之 <strong>【${direction}】</strong> 方位，在此住宅格局中属于 <strong>${star}</strong> 凶位（判定：<strong>${luck}</strong>）。凶星盘踞，容易导致气场紊乱、口舌纠纷或身体疲倦。善信无需惊慌，阳宅风水讲究"避忌与化解"，依理调理即可：</p>
            <h4>⚠️ 空间功能避忌</h4>
            <p>1. <strong>不宜作卧室</strong>：此位磁场较差，若长期在此睡眠，容易导致睡眠质量低下，多梦易醒，精神萎靡。<br>2. <strong>宜作卫浴/储物</strong>：风水学讲究"独阴不生，独阳不长"，将污秽或杂物之所设在凶位（如五鬼、绝命位），以毒攻毒，反而能压制凶星煞气，这叫"煞位压制法"。</p>
            <h4>🛡️ 大师风水化解秘方</h4>
            <p>1. <strong>铜葫芦收煞</strong>：建议在此方位悬挂一个纯铜制作的<strong>【铜葫芦】</strong>。葫芦嘴小肚大，能吸收并化解空间中的二黑五黄病符之气。<br>2. <strong>五帝钱御煞</strong>：若是大门不幸落在绝命或祸害凶位，可在玄关地毯下铺设一套<strong>【五帝钱】</strong>，利用古代天子龙威与铜钱阳气，建立一道御煞气场屏障。</p>
        `;
    }
}

export { initFengshuiModule };