import { escapeHTML, showToast } from './utils.js?20260626-4';
import { exportToPDF, formatDate, generateShareLink } from './export.js?20260626-4';

/* ========== 数字能量学核心 ========== */

// 八星磁场能量表
const ENERGY_MAGNETS = {
    '天医': { stars: ['13', '31', '68', '86', '49', '94', '27', '72'], desc: '主财运、婚姻、智慧。天医数字能量的人聪明、善良、有财运，易得贵人相助。', level: '上吉', color: 'var(--jade-green)' },
    '延年': { stars: ['19', '91', '78', '87', '34', '43', '26', '62'], desc: '主事业、领导、能力。延年数字能量的人有领导才能、做事稳重、事业心强。', level: '上吉', color: 'var(--jade-green)' },
    '生气': { stars: ['14', '41', '67', '76', '39', '93', '28', '82'], desc: '主贵人、乐观、活力。生气数字能量的人人缘好、乐观开朗、有贵人运。', level: '上吉', color: 'var(--jade-green)' },
    '伏位': { stars: ['11', '22', '33', '44', '55', '66', '77', '88', '99', '00'], desc: '主等待、蓄势、固执。伏位数字能量的人有耐心、固执、善于等待时机。', level: '中平', color: 'var(--text-gold)' },
    '绝命': { stars: ['12', '21', '69', '96', '48', '84', '37', '73'], desc: '主投资、冲动、起伏。绝命数字能量的人敢冒险、冲动、财运起伏大。', level: '慎', color: 'var(--cinnabar-red)' },
    '五鬼': { stars: ['18', '81', '79', '97', '36', '63', '24', '42'], desc: '主智慧、变动、不稳定。五鬼数字能量的人聪明、想法多、变化无常。', level: '慎', color: 'var(--cinnabar-red)' },
    '六煞': { stars: ['16', '61', '47', '74', '38', '83', '29', '92'], desc: '主情感、桃花、忧郁。六煞数字能量的人感情丰富、异性缘好、易多愁善感。', level: '慎', color: 'var(--cinnabar-red)' },
    '祸害': { stars: ['17', '71', '89', '98', '46', '64', '23', '32'], desc: '主口才、小人、健康。祸害数字能量的人口才好、易招小人、注意健康。', level: '慎', color: 'var(--cinnabar-red)' }
};

// 数字五行属性
const NUMBER_WUXING = {
    '1': '水', '2': '土', '3': '木', '4': '木',
    '5': '土', '6': '金', '7': '金', '8': '土',
    '9': '火', '0': '水'
};

// 数字含义
const NUMBER_MEANING = {
    '1': { meaning: '太极之数', desc: '万物开端，独步天下', wuxing: '水', nature: '阳' },
    '2': { meaning: '两仪之数', desc: '混沌未开，进退保守', wuxing: '土', nature: '阴' },
    '3': { meaning: '三才之数', desc: '天地人和，繁荣昌隆', wuxing: '木', nature: '阳' },
    '4': { meaning: '四象之数', desc: '万事谨慎，不具才能', wuxing: '木', nature: '阴' },
    '5': { meaning: '五行之数', desc: '循环相生，圆通畅达', wuxing: '土', nature: '阳' },
    '6': { meaning: '六爻之数', desc: '发展变化，天赋美德', wuxing: '金', nature: '阴' },
    '7': { meaning: '七政之数', desc: '刚毅果断，勇往直前', wuxing: '金', nature: '阳' },
    '8': { meaning: '八卦之数', desc: '乾坎艮震，巽离坤兑', wuxing: '土', nature: '阴' },
    '9': { meaning: '九宫之数', desc: '大成之数，蕴含凶险', wuxing: '火', nature: '阳' },
    '0': { meaning: '无极之数', desc: '虚空无穷，待时而动', wuxing: '水', nature: '阴' }
};

function analyzeNumber(numberStr) {
    // 清理输入，只保留数字
    const cleanNum = numberStr.replace(/[^0-9]/g, '');
    if (!cleanNum) return null;

    // 分析数字组合
    const pairs = [];
    for (let i = 0; i < cleanNum.length - 1; i++) {
        pairs.push(cleanNum.slice(i, i + 2));
    }

    // 识别磁场
    const magnets = [];
    for (const [name, data] of Object.entries(ENERGY_MAGNETS)) {
        for (const pair of pairs) {
            if (data.stars.includes(pair)) {
                magnets.push({ name, pair, ...data });
                break;
            }
        }
    }

    // 计算数字五行分布
    const wuxingCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    for (const char of cleanNum) {
        const wx = NUMBER_WUXING[char];
        if (wx) wuxingCount[wx]++;
    }

    // 计算数字吉凶
    let goodCount = 0, badCount = 0;
    magnets.forEach(m => {
        if (m.level === '上吉') goodCount++;
        else if (m.level === '慎') badCount++;
    });

    // 整体评分
    let score = 60;
    score += goodCount * 10;
    score -= badCount * 8;
    if (score > 100) score = 100;
    if (score < 30) score = 30;

    // 主磁场
    const mainMagnet = magnets.find(m => m.level === '上吉') || magnets[0] || null;

    return {
        number: cleanNum,
        pairs,
        magnets,
        wuxingCount,
        score,
        mainMagnet,
        goodCount,
        badCount
    };
}

function getNumberAnalysisHtml(analysis) {
    if (!analysis) return '<p style="color:var(--text-gray);">请输入有效数字</p>';

    const scoreColor = analysis.score >= 80 ? 'var(--jade-green)' :
                      analysis.score >= 60 ? 'var(--text-gold)' : 'var(--cinnabar-red)';

    let html = `
        <div class="number-analysis-report">
            <!-- 数字概览 -->
            <div class="report-section">
                <h4>🔮 数字能量总览</h4>
                <div style="background:linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05));border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                        <div>
                            <div style="font-size:0.72rem;color:var(--text-gray);">数字组合</div>
                            <div style="font-size:1.5rem;font-weight:700;color:var(--text-gold);font-family:'ZCOOL XiaoWei',serif;letter-spacing:2px;">${analysis.number}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="display:inline-block;padding:8px 24px;border-radius:20px;font-size:1.2rem;font-weight:700;background:${scoreColor}22;color:${scoreColor};border:1px solid ${scoreColor}44;">${analysis.score}分</div>
                            <div style="font-size:0.65rem;color:var(--text-gray);margin-top:4px;">能量评分</div>
                        </div>
                    </div>
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);">
                        <p style="font-size:0.8rem;color:var(--text-white);margin:0;">
                            <strong>主磁场：</strong>${analysis.mainMagnet ? analysis.mainMagnet.name + '（' + analysis.mainMagnet.desc.split('。')[0] + '）' : '无明显主磁场'}
                        </p>
                        <p style="font-size:0.75rem;color:var(--text-gray);margin:6px 0 0 0;">
                            吉星${analysis.goodCount}个 · 凶星${analysis.badCount}个
                        </p>
                    </div>
                </div>
            </div>

            <!-- 数字逐位解析 -->
            <div class="report-section">
                <h4>📊 数字逐位解析</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:8px;">
    `;

    for (const char of analysis.number) {
        const info = NUMBER_MEANING[char];
        const wxColor = info.wuxing === '金' ? 'var(--text-gold)' :
                       info.wuxing === '木' ? 'var(--jade-green)' :
                       info.wuxing === '水' ? '#4A90D9' :
                       info.wuxing === '火' ? 'var(--cinnabar-red)' : '#8B7355';
        html += `
            <div style="background:rgba(10,10,12,0.4);border:1px solid var(--border-color);border-radius:8px;padding:10px;text-align:center;">
                <div style="font-size:1.3rem;font-weight:700;color:var(--text-white);">${char}</div>
                <div style="font-size:0.68rem;color:${wxColor};margin:4px 0;">${info.wuxing} · ${info.nature}</div>
                <div style="font-size:0.62rem;color:var(--text-gray);">${info.meaning}</div>
            </div>
        `;
    }

    html += `
                </div>
            </div>

            <!-- 磁场能量分析 -->
            <div class="report-section">
                <h4>⚡ 磁场能量分析</h4>
    `;

    if (analysis.magnets.length > 0) {
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;">';
        analysis.magnets.forEach(m => {
            const levelColor = m.level === '上吉' ? 'var(--jade-green)' :
                              m.level === '中吉' ? 'var(--text-gold)' :
                              m.level === '中平' ? 'var(--text-gray)' : 'var(--cinnabar-red)';
            html += `
                <div style="background:rgba(10,10,12,0.4);border:1px solid ${levelColor}33;border-radius:8px;padding:12px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        <span style="font-weight:700;color:var(--text-white);font-size:0.85rem;">${m.name}</span>
                        <span style="margin-left:auto;padding:2px 8px;border-radius:10px;font-size:0.68rem;background:${levelColor}22;color:${levelColor};border:1px solid ${levelColor}44;">${m.level}</span>
                    </div>
                    <p style="font-size:0.72rem;color:var(--text-gray);margin:0 0 6px 0;line-height:1.5;">${m.desc}</p>
                    <div style="font-size:0.72rem;color:var(--text-gold);">
                        数组：${m.pair}
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        html += '<p style="font-size:0.78rem;color:var(--text-gray);">未识别到明显的磁场组合</p>';
    }

    html += `
            </div>

            <!-- 五行分布 -->
            <div class="report-section">
                <h4>🌀 五行分布</h4>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
    `;

    const wuxingOrder = ['金', '木', '水', '火', '土'];
    const wuxingColors = { '金': 'var(--text-gold)', '木': 'var(--jade-green)', '水': '#4A90D9', '火': 'var(--cinnabar-red)', '土': '#8B7355' };
    wuxingOrder.forEach(wx => {
        const count = analysis.wuxingCount[wx] || 0;
        html += `
            <div style="background:rgba(10,10,12,0.4);border:1px solid var(--border-color);border-radius:8px;padding:10px;text-align:center;">
                <div style="font-size:0.85rem;font-weight:700;color:${wuxingColors[wx]};">${wx}</div>
                <div style="font-size:1.2rem;font-weight:700;color:var(--text-white);margin:4px 0;">${count}</div>
                <div style="font-size:0.62rem;color:var(--text-gray);">${count > 0 ? '有' : '无'}</div>
            </div>
        `;
    });

    html += `
                </div>
                <p style="font-size:0.72rem;color:var(--text-gray);margin-top:10px;">
                    五行平衡建议：${getWuxingAdvice(analysis.wuxingCount)}
                </p>
            </div>

            <!-- 使用建议 -->
            <div class="report-section">
                <h4>💡 使用建议</h4>
                <div style="background:rgba(212,175,55,0.06);border-radius:8px;padding:14px;">
                    <ul style="font-size:0.78rem;color:var(--text-white);margin:0;padding-left:20px;line-height:1.8;">
                        ${getUsageAdvice(analysis).map(advice => `<li>${advice}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    return html;
}

function getWuxingAdvice(wuxingCount) {
    const minWx = Object.entries(wuxingCount).reduce((min, [wx, count]) =>
        count < min[1] ? [wx, count] : min, ['金', Infinity])[0];
    const maxWx = Object.entries(wuxingCount).reduce((max, [wx, count]) =>
        count > max[1] ? [wx, count] : max, ['金', -Infinity])[0];

    const shengMap = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
    const advice = [];

    if (wuxingCount[minWx] === 0) {
        advice.push(`五行缺${minWx}，建议在日常生活中多接触${minWx}属性事物`);
    }
    if (wuxingCount[maxWx] > 3) {
        advice.push(`${maxWx}气过旺，可多用${shengMap[maxWx]}来泄其锐气`);
    }
    if (advice.length === 0) {
        advice.push('五行分布较为平衡，保持即可');
    }
    return advice.join('。');
}

function getUsageAdvice(analysis) {
    const advice = [];

    if (analysis.mainMagnet) {
        if (analysis.mainMagnet.level === '上吉') {
            advice.push(`主磁场为${analysis.mainMagnet.name}，能量良好，适合长期使用`);
        } else {
            advice.push(`主磁场为${analysis.mainMagnet.name}，需谨慎使用，可考虑调整数字组合`);
        }
    }

    if (analysis.badCount > analysis.goodCount) {
        advice.push('凶星较多，建议调整数字组合，增加吉星磁场');
    }

    advice.push('数字能量仅供参考，实际运势还需结合个人八字综合分析');

    return advice;
}

function initShuziModule() {
    const btn = document.getElementById("btnCalcShuzi");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const numberInput = document.getElementById("shuziInput");
        const resultCard = document.getElementById("shuziResultCard");
        const analysisEl = document.getElementById("shuziAnalysis");

        if (!numberInput || !resultCard || !analysisEl) return;

        const numberStr = numberInput.value.trim();
        if (!numberStr) {
            alert("请输入数字组合");
            return;
        }

        const analysis = analyzeNumber(numberStr);
        if (!analysis) {
            alert("请输入有效的数字");
            return;
        }

        analysisEl.innerHTML = getNumberAnalysisHtml(analysis);
        resultCard.style.display = "block";

        // 滚动到结果区域
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 绑定导出按钮事件
        const btnExportPDF = document.getElementById('btnExportShuziPDF');
        if (btnExportPDF) {
            btnExportPDF.onclick = () => {
                exportToPDF('shuziResultCard', {
                    filename: `数字能量_${numberStr}_${formatDate(new Date())}.pdf`,
                    title: '乾坤易道 · 数字能量分析',
                    subtitle: `数字组合：${numberStr}`,
                });
            };
        }

        // 绑定分享按钮事件
        const btnShare = document.querySelector('#panel-shuzi [data-action="share"]');
        if (btnShare) {
            btnShare.onclick = () => {
                const shareData = {
                    number: numberStr,
                    analysis: analysis,
                };
                const shareUrl = generateShareLink(shareData, 'shuzi');
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

export { initShuziModule, analyzeNumber };