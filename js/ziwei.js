import { ZI_WEI_STARS, showToast } from './utils.js?20260626-4';
import { exportToPDF, formatDate, generateShareLink } from './export.js?20260626-4';

/* ========== 紫微斗数排盘核心 ========== */

// 四化飞星表（根据天干）
const SIHUA_TABLE = {
    '甲': { '廉贞': '化禄', '破军': '化权', '武曲': '化科', '太阳': '化忌' },
    '乙': { '天机': '化禄', '天梁': '化权', '紫微': '化科', '太阴': '化忌' },
    '丙': { '天同': '化禄', '天机': '化权', '文昌': '化科', '廉贞': '化忌' },
    '丁': { '太阴': '化禄', '天同': '化权', '天机': '化科', '巨门': '化忌' },
    '戊': { '贪狼': '化禄', '太阴': '化权', '右弼': '化科', '天机': '化忌' },
    '己': { '武曲': '化禄', '贪狼': '化权', '天梁': '化科', '文曲': '化忌' },
    '庚': { '太阳': '化禄', '武曲': '化权', '太阴': '化科', '天同': '化忌' },
    '辛': { '巨门': '化禄', '太阳': '化权', '文曲': '化科', '文昌': '化忌' },
    '壬': { '天梁': '化禄', '紫微': '化权', '左辅': '化科', '武曲': '化忌' },
    '癸': { '破军': '化禄', '巨门': '化权', '太阴': '化科', '贪狼': '化忌' }
};

// 辅星安星表
const AUXILIARY_STARS = {
    // 吉星
    '天魁': { calc: (yearGan) => {
        const map = { '甲': '丑', '乙': '子', '丙': '亥', '丁': '亥', '戊': '丑', '己': '子', '庚': '丑', '辛': '寅', '壬': '卯', '癸': '辰' };
        return map[yearGan] || '丑';
    }},
    '天钺': { calc: (yearGan) => {
        const map = { '甲': '未', '乙': '申', '丙': '酉', '丁': '酉', '戊': '未', '己': '申', '庚': '未', '辛': '午', '壬': '巳', '癸': '卯' };
        return map[yearGan] || '未';
    }},
    '禄存': { calc: (yearGan) => {
        const map = { '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳', '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子' };
        return map[yearGan] || '寅';
    }},
    '天马': { calc: (yearZhi) => {
        const map = { '寅': '申', '午': '申', '戌': '申', '亥': '巳', '卯': '巳', '未': '巳', '巳': '亥', '酉': '亥', '丑': '亥', '申': '寅', '子': '寅', '辰': '寅' };
        return map[yearZhi] || '申';
    }},
    // 凶星
    '擎羊': { calc: (yearGan) => {
        const map = { '甲': '卯', '乙': '辰', '丙': '午', '丁': '未', '戊': '午', '己': '未', '庚': '酉', '辛': '戌', '壬': '子', '癸': '丑' };
        return map[yearGan] || '卯';
    }},
    '陀罗': { calc: (yearGan) => {
        const map = { '甲': '丑', '乙': '寅', '丙': '辰', '丁': '巳', '戊': '辰', '己': '巳', '庚': '未', '辛': '申', '壬': '戌', '癸': '亥' };
        return map[yearGan] || '丑';
    }},
    '火星': { calc: (yearZhi) => {
        const map = { '寅': '丑', '午': '丑', '戌': '丑', '巳': '酉', '酉': '酉', '丑': '酉', '申': '戌', '子': '戌', '辰': '戌', '亥': '未', '卯': '未', '未': '未' };
        return map[yearZhi] || '丑';
    }},
    '铃星': { calc: (yearZhi) => {
        const map = { '寅': '卯', '午': '卯', '戌': '卯', '巳': '戌', '酉': '戌', '丑': '戌', '申': '未', '子': '未', '辰': '未', '亥': '辰', '卯': '辰', '未': '辰' };
        return map[yearZhi] || '卯';
    }},
    '地空': { calc: (yearGan) => {
        const map = { '甲': '亥', '乙': '戌', '丙': '酉', '丁': '申', '戊': '未', '己': '午', '庚': '巳', '辛': '辰', '壬': '卯', '癸': '寅' };
        return map[yearGan] || '亥';
    }},
    '地劫': { calc: (yearGan) => {
        const map = { '甲': '戌', '乙': '酉', '丙': '申', '丁': '未', '戊': '午', '己': '巳', '庚': '辰', '辛': '卯', '壬': '寅', '癸': '丑' };
        return map[yearGan] || '戌';
    }}
};

// 地支转宫位索引
const ZHI_TO_INDEX = { '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5, '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11 };

function ziweiPaiPan(year, month, day, hour, gender, yearGan, yearZhi) {
    const ziWeiPos = ((day - 1) % 12);
    const palaces = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
    const stars = Array(12).fill(null).map(() => []);

    // 安紫微系主星
    const mainOffset = { "紫微":0,"天机":-1,"太阳":-3,"武曲":-4,"天同":-5,"廉贞":4 };
    for (let [name, offset] of Object.entries(mainOffset)) {
        const pos = ((ziWeiPos + offset + 12) % 12);
        stars[pos].push({ name, type:'main' });
    }

    // 安天府系主星
    const tianFuPos = (ziWeiPos + 6) % 12;
    stars[tianFuPos].push({ name:"天府", type:'main' });
    const tianFuOffset = { "太阴":2,"贪狼":3,"巨门":4,"天相":5,"天梁":6,"七杀":7,"破军":10 };
    for (let [name, offset] of Object.entries(tianFuOffset)) {
        const pos = ((tianFuPos + offset + 12) % 12);
        if (!stars[pos].find(s => s.name === name)) stars[pos].push({ name, type:'main' });
    }

    // 安辅星（基于紫微星位置）
    stars[(ziWeiPos + 3) % 12].push({ name:"左辅", type:'ci' });
    stars[(ziWeiPos + 9) % 12].push({ name:"右弼", type:'ci' });
    stars[(ziWeiPos + 5) % 12].push({ name:"文昌", type:'ci' });
    stars[(ziWeiPos + 7) % 12].push({ name:"文曲", type:'ci' });

    // 安年干系辅星
    for (const [name, data] of Object.entries(AUXILIARY_STARS)) {
        const zhi = data.calc(yearGan || '甲');
        const pos = ZHI_TO_INDEX[zhi];
        if (pos !== undefined) {
            const type = ['天魁', '天钺', '禄存', '天马'].includes(name) ? 'good' : 'bad';
            stars[pos].push({ name, type });
        }
    }

    // 安年支系辅星（天马、火星、铃星）
    if (yearZhi) {
        const tianMaZhi = AUXILIARY_STARS['天马'].calc(yearZhi);
        const tianMaPos = ZHI_TO_INDEX[tianMaZhi];
        if (tianMaPos !== undefined && !stars[tianMaPos].find(s => s.name === '天马')) {
            stars[tianMaPos].push({ name: '天马', type: 'good' });
        }

        const huoXingZhi = AUXILIARY_STARS['火星'].calc(yearZhi);
        const huoXingPos = ZHI_TO_INDEX[huoXingZhi];
        if (huoXingPos !== undefined) {
            stars[huoXingPos].push({ name: '火星', type: 'bad' });
        }

        const lingXingZhi = AUXILIARY_STARS['铃星'].calc(yearZhi);
        const lingXingPos = ZHI_TO_INDEX[lingXingZhi];
        if (lingXingPos !== undefined) {
            stars[lingXingPos].push({ name: '铃星', type: 'bad' });
        }
    }

    // 计算四化飞星
    const sihua = {};
    const yearGanForSihua = yearGan || '甲';
    const sihuaRow = SIHUA_TABLE[yearGanForSihua];
    if (sihuaRow) {
        for (const [star, transform] of Object.entries(sihuaRow)) {
            sihua[star] = transform;
            // 在星盘中标记四化
            for (let i = 0; i < 12; i++) {
                const starObj = stars[i].find(s => s.name === star);
                if (starObj) {
                    starObj.sihua = transform;
                }
            }
        }
    }

    // 计算命宫位置（根据月和时辰）
    const monthIdx = (month - 1) % 12;
    const shengIdx = Math.floor(hour / 2) % 12;
    const mingPos = (monthIdx + shengIdx) % 12;
    const shenPos = (monthIdx + shengIdx + 6) % 12;

    // 计算身宫位置
    const shenGong = palaces[shenPos];

    // 计算五行局
    const wuxingJu = calculateWuxingJu(ziWeiPos);

    return {
        palaces,
        stars,
        mingPos,
        shenPos,
        ziWeiPos,
        tianFuPos,
        sihua,
        wuxingJu,
        yearGan: yearGanForSihua,
        yearZhi
    };
}

function calculateWuxingJu(ziWeiPos) {
    // 简化的五行局计算（基于紫微星位置）
    const juMap = {
        0: '水二局', 1: '火六局', 2: '木三局', 3: '金四局',
        4: '土五局', 5: '水二局', 6: '火六局', 7: '木三局',
        8: '金四局', 9: '土五局', 10: '水二局', 11: '火六局'
    };
    return juMap[ziWeiPos] || '水二局';
}

function calculateDaXian(mingPos, gender, birthYear) {
    // 计算大限（10年一限）
    const daXianList = [];
    const direction = gender === '男' ? 1 : -1; // 男顺女逆
    const startAge = 1;

    for (let i = 0; i < 10; i++) {
        const palaceIdx = ((mingPos + i * direction) + 12) % 12;
        const startYear = birthYear + i * 10;
        const endYear = startYear + 9;
        daXianList.push({
            palaceIdx,
            palaceName: ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'][palaceIdx],
            startAge: i * 10 + startAge,
            endAge: (i + 1) * 10,
            startYear,
            endYear
        });
    }

    return daXianList;
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
        const yearGan = lunar.getYearGan();
        const yearZhi = lunar.getYearZhi();

        const result = ziweiPaiPan(year, month, day, hour, gender, yearGan, yearZhi);
        const daXian = calculateDaXian(result.mingPos, gender, dt.getFullYear());

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
                let starClass = `zw-star ${s.type}`;
                if (s.sihua) starClass += ' sihua';
                span.className = starClass;
                span.innerHTML = s.name + (s.sihua ? `<sup class="sihua-mark">${s.sihua}</sup>` : '');
                pal.appendChild(span);
            });
            chart.appendChild(pal);
        }

        const mingStars = result.stars[result.mingPos] || [];
        const mainStars = mingStars.filter(s => s.type === 'main').map(s => s.name).join('、') || '无主星（借星安宫）';
        const ciStars = mingStars.filter(s => s.type === 'ci').map(s => s.name).join('、') || '无';

        document.getElementById("zwBoardTitle").innerHTML = `${name} · ${gender}命 · ${shengXiao}年 · 紫微斗数命盘`;
        document.getElementById("zwAnalysis").innerHTML = `
            <div class="zw-analysis-content">
                <div class="zw-basic-info">
                    <p><strong>命宫：</strong>${result.palaces[result.mingPos]} | <strong>身宫：</strong>${result.palaces[result.shenPos]}</p>
                    <p><strong>紫微星：</strong>${result.palaces[result.ziWeiPos]} | <strong>天府星：</strong>${result.palaces[result.tianFuPos]}</p>
                    <p><strong>五行局：</strong>${result.wuxingJu}</p>
                </div>

                <div class="zw-stars-info">
                    <p><strong>命宫主星：</strong>${mainStars}</p>
                    <p><strong>命宫辅星：</strong>${ciStars}</p>
                </div>

                <div class="zw-sihua-info">
                    <p><strong>${yearGan}年四化：</strong></p>
                    <div class="sihua-grid">
                        ${Object.entries(result.sihua).map(([star, transform]) =>
                            `<span class="sihua-item"><span class="star-name">${star}</span><span class="transform ${transform}">${transform}</span></span>`
                        ).join('')}
                    </div>
                </div>

                <div class="zw-daxian-info">
                    <p><strong>大限运势：</strong></p>
                    <div class="daxian-grid">
                        ${daXian.slice(0, 5).map(dx =>
                            `<div class="daxian-item ${isCurrentDaXian(dx, dt.getFullYear()) ? 'current' : ''}">
                                <span class="age">${dx.startAge}-${dx.endAge}岁</span>
                                <span class="palace">${dx.palaceName}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>

                <p style="margin-top:12px;font-size:0.75rem;color:var(--text-gray);">
                    * 此为紫微斗数基础排盘，包含主星、辅星、四化飞星及大限分析。
                </p>
            </div>
        `;
        document.getElementById("zwResultCard").style.display = "block";

        // 绑定导出按钮事件
        const btnExportPDF = document.getElementById('btnExportZwPDF');
        if (btnExportPDF) {
            btnExportPDF.onclick = () => {
                exportToPDF('zwResultCard', {
                    filename: `紫微斗数_${name}_${formatDate(new Date())}.pdf`,
                    title: '乾坤易道 · 紫微斗数命盘',
                    subtitle: `${name} 的紫微斗数排盘`,
                });
            };
        }

        // 绑定分享按钮事件
        const btnShare = document.querySelector('#panel-ziwei [data-action="share"]');
        if (btnShare) {
            btnShare.onclick = () => {
                const zwData = {
                    name: name,
                    gender: gender,
                    date: dateVal,
                    result: result,
                    daXian: daXian,
                };
                const shareUrl = generateShareLink(zwData, 'ziwei');
                if (shareUrl) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showToast('分享链接已复制到剪贴板！', 2000);
                    }).catch(() => {
                        prompt('请复制以下分享链接：', shareUrl);
                    });
                } else {
                    showToast('生成分享链接失败', 2000);
                }
            };
        }
    });
}

function isCurrentDaXian(dx, currentYear) {
    return currentYear >= dx.startYear && currentYear <= dx.endYear;
}

export { initZiweiModule };
