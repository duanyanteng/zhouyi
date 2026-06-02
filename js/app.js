import { AppState, restoreBaziInput, saveBaziInput } from './state.js';
import { initClock, initHuangliModule, renderHuangliCard } from './calendar.js';
import { initBaziModule, drawWuxingRadar } from './bazi.js';
import { initLiuyaoModule } from './liuyao.js';
import { initFengshuiModule } from './fengshui.js';
import { initChatModule } from './chat.js';
import { initXingmingModule } from './xingming.js';
import { initMeihuaModule } from './meihua.js';
import { initHehunModule } from './hehun.js';
import { initZiweiModule } from './ziwei.js';
import { getGanWuxing, getWuxingEng } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initRipple();
    initAppNavigation();
    initParticleBackground();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    initClock();
    initBaziModule();
    initLiuyaoModule();
    initHuangliModule();
    initFengshuiModule();
    initChatModule();
    initXingmingModule();
    initMeihuaModule();
    initHehunModule();
    initZiweiModule();

    // Re-run dress guide after clock init
    setTimeout(renderDressGuide, 500);
    // Re-run dress guide on every clock tick (every 1s in calendar.js)
    const origRender = renderDressGuide;
    setInterval(() => {
        const gzEl = document.querySelector('.ganzhi-time');
        if (gzEl && gzEl.textContent !== '') origRender();
    }, 5000);

    loadBaziHistory();

    document.addEventListener('bazi-analysis-complete', e => {
        saveBaziHistory(e.detail.name, e.detail.gender, e.detail.date);
    });

    const savedBirthInfo = restoreBaziInput();
    if (savedBirthInfo) {
        const name = savedBirthInfo.name, gender = savedBirthInfo.gender, date = savedBirthInfo.date;
        if (name) document.getElementById("baziName").value = name;
        if (gender) {
            document.querySelectorAll('input[name="baziGender"]').forEach(r => r.checked = r.value === gender);
        }
        if (date) {
            document.getElementById("baziDate").value = date;
            setTimeout(() => document.getElementById("btnCalculateBazi").click(), 600);
        }
    }
});

/* ---------- 主题切换 ---------- */
function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = saved === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        btn.innerHTML = next === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    });
}

/* ---------- 涟漪点击效果 ---------- */
function initRipple() {
    document.addEventListener('click', e => {
        const btn = e.target.closest('.btn-primary, .btn-secondary, .theme-toggle, .nav-item');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });
}

/* ---------- 今日穿搭指南 ---------- */
function renderDressGuide() {
    const container = document.getElementById('dressGuideContainer');
    const sub = document.getElementById('dressGuideSub');
    if (!container) return;
    const gzText = document.querySelector('.ganzhi-time')?.textContent || '';
    // Parse "天时：丙午年 癸巳月 丁卯日 戊子时"
    const match = gzText.match(/[日]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/);
    if (!match) { container.innerHTML = '<span style="color:var(--text-gray);font-size:0.78rem;">等待天时加载...</span>'; return; }
    const dayGZ = match[1];
    const dayGan = dayGZ[0];
    const dayZhi = dayGZ[1];
    const wx = getGanWuxing(dayGan);

    // 五行相生为吉 color, 相克为慎
    const shengMap = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
    const keMap = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
    const good = shengMap[wx];       // 生=吉
    const bad = keMap[wx];           // 克=慎

    const colorMap = {
        '金': [{ name:'乳白 · 素纱', hex:'#F5F0E8' }, { name:'浅金 · 流苏', hex:'#D4AF37' }, { name:'银灰 · 云锦', hex:'#C0C0C0' }],
        '木': [{ name:'翠绿 · 青竹', hex:'#3B9C7A' }, { name:'碧色 · 春水', hex:'#5FB79C' }, { name:'黛青 · 远山', hex:'#4A7C6F' }],
        '水': [{ name:'玄黑 · 墨韵', hex:'#2C2C3A' }, { name:'藏蓝 · 夜穹', hex:'#3A5A8C' }, { name:'天青 · 雨过', hex:'#6B9BD2' }],
        '火': [{ name:'朱砂 · 赤焰', hex:'#C93C3C' }, { name:'绛紫 · 烟霞', hex:'#8B3A62' }, { name:'珊瑚 · 暖玉', hex:'#E87A5D' }],
        '土': [{ name:'赭石 · 大地', hex:'#B8860B' }, { name:'琥珀 · 蜜蜡', hex:'#D4A03C' }, { name:'驼色 · 秋叶', hex:'#C49A6C' }],
        '通用': [{ name:'素黑 · 玄端', hex:'#2C2C2C' }, { name:'纯白 · 素缟', hex:'#F0EBE0' }, { name:'金色 · 流金', hex:'#D4AF37' }]
    };

    const goodColors = colorMap[good] || colorMap['通用'];
    const badColors = colorMap[bad] || [];
    const universal = colorMap['通用'];

    container.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:10px;width:100%;">
            <div style="flex:1;min-width:100px;">
                <div style="font-size:0.72rem;color:var(--text-gray);margin-bottom:4px;">✨ 宜着 · 生扶日主${wx}</div>
                <div class="dress-guide">
                    ${goodColors.map(c => `<span class="dress-swatch" style="background:${c.hex}22;border:1px solid ${c.hex}55;color:var(--text-white);"><span class="color-dot" style="background:${c.hex}"></span>${c.name}</span>`).join('')}
                </div>
            </div>
            <div style="flex:1;min-width:100px;">
                <div style="font-size:0.72rem;color:var(--text-gray);margin-bottom:4px;">⚡ 慎用 · 克制日主${wx}</div>
                <div class="dress-guide">
                    ${badColors.length ? badColors.map(c => `<span class="dress-swatch" style="background:${c.hex}22;border:1px solid ${c.hex}55;color:var(--text-gray);opacity:0.6;"><span class="color-dot" style="background:${c.hex}"></span>${c.name}</span>`).join('') : '<span style="font-size:0.75rem;color:var(--text-gray);">今日无忌</span>'}
                </div>
            </div>
        </div>`;

    const zhiMap = { '子':'鼠','丑':'牛','寅':'虎','卯':'兔','辰':'龙','巳':'蛇','午':'马','未':'羊','申':'猴','酉':'鸡','戌':'狗','亥':'猪' };
    if (sub) sub.textContent = `日柱 ${dayGZ} · ${wx}日 · 逢${zhiMap[dayZhi] || dayZhi}`;
}

/* ---------- 命盘历史 ---------- */
function saveBaziHistory(name, gender, date) {
    let history = JSON.parse(localStorage.getItem('baziHistory') || '[]');
    history.unshift({ name, gender, date, time: Date.now() });
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('baziHistory', JSON.stringify(history));
    loadBaziHistory();
}

function loadBaziHistory() {
    const list = document.getElementById('baziHistoryList');
    if (!list) return;
    const history = JSON.parse(localStorage.getItem('baziHistory') || '[]');
    if (!history.length) {
        list.innerHTML = '<div style="font-size:0.78rem;color:var(--text-gray);padding:10px 0;">暂无排盘记录</div>';
        return;
    }
    list.innerHTML = history.map((h, i) => `
        <div class="bazi-history-item" data-idx="${i}">
            <span>${h.name} · ${h.gender} · ${h.date}</span>
            <button class="del-btn" data-idx="${i}" title="删除记录"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');

    list.querySelectorAll('.bazi-history-item').forEach(el => {
        el.addEventListener('click', e => {
            if (e.target.closest('.del-btn')) return;
            const idx = parseInt(el.dataset.idx);
            const h = history[idx];
            if (!h) return;
            document.getElementById('baziName').value = h.name;
            document.querySelectorAll('input[name="baziGender"]').forEach(r => r.checked = r.value === h.gender);
            document.getElementById('baziDate').value = h.date;
            document.querySelector('[data-target="bazi"]').click();
            setTimeout(() => document.getElementById('btnCalculateBazi').click(), 400);
        });
    });
    list.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            let history = JSON.parse(localStorage.getItem('baziHistory') || '[]');
            const idx = parseInt(btn.dataset.idx);
            history.splice(idx, 1);
            localStorage.setItem('baziHistory', JSON.stringify(history));
            loadBaziHistory();
        });
    });
}

/* ---------- 骨架屏 ---------- */
function showBaziSkeleton() {
    const el = document.getElementById('baziDetailAnalysis');
    if (!el) return;
    el.innerHTML = `
        <div class="bazi-report-loading">
            <div class="skeleton-card">
                <div class="skeleton-pulse skeleton-block w40"></div>
                <div class="skeleton-pulse skeleton-block"></div>
                <div class="skeleton-pulse skeleton-block w80"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-pulse skeleton-block w40"></div>
                <div class="skeleton-pulse skeleton-block"></div>
                <div class="skeleton-pulse skeleton-block w60"></div>
                <div class="skeleton-pulse skeleton-block"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-pulse skeleton-block w40"></div>
                <div class="skeleton-pulse skeleton-block w80"></div>
                <div class="skeleton-pulse skeleton-block"></div>
            </div>
        </div>`;
}

/* ---------- 导航 ---------- */
function initAppNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const viewPanels = document.querySelectorAll(".view-panel");
    const featureCards = document.querySelectorAll(".feature-link-card");

    function switchView(targetId) {
        navItems.forEach(item => {
            item.classList.toggle("active", item.getAttribute("data-target") === targetId);
        });
        viewPanels.forEach(panel => {
            panel.classList.toggle("active", panel.id === `panel-${targetId}`);
        });
        if (targetId === "bazi") setTimeout(drawWuxingRadar, 200);
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => switchView(item.getAttribute("data-target")));
    });
    featureCards.forEach(card => {
        card.addEventListener("click", () => switchView(card.getAttribute("data-goto")));
    });

    const parallaxCompass = document.getElementById("parallaxCompass");
    if (parallaxCompass) {
        document.addEventListener("mousemove", (e) => {
            const rect = parallaxCompass.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            parallaxCompass.style.transform = `rotateX(${-y / 15}deg) rotateY(${x / 15}deg)`;
        });
        parallaxCompass.addEventListener("mouseleave", () => {
            parallaxCompass.style.transform = "rotateX(0deg) rotateY(0deg)";
        });
    }
}

/* ---------- 金沙粒子 ---------- */
function initParticleBackground() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const particleCount = 60;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.3;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * -0.5 - 0.1;
            this.life = Math.random() * 100 + 100;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() { this.x += this.speedX; this.y += this.speedY; this.life--; if (this.y < 0 || this.life <= 0) { this.reset(); this.y = canvas.height; } }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; ctx.shadowBlur = 4; ctx.shadowColor = "rgba(212, 175, 55, 0.5)"; ctx.fill(); }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    let animId;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else animId = requestAnimationFrame(animate);
    });
}

/* ---------- 截图 ---------- */
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-screenshot");
    if (!btn) return;
    const targetId = btn.getAttribute("data-target");
    const el = document.getElementById(targetId);
    if (!el || typeof html2canvas === 'undefined') { alert("截图功能需要 html2canvas 库支持"); return; }
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    html2canvas(el, { backgroundColor: isLight ? '#F0EBE0' : '#0A0A0C', scale:2, useCORS:true }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${targetId}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});

/* ---------- 复制 ---------- */
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-copy-result");
    if (!btn) return;
    const targetId = btn.getAttribute("data-copy-target");
    const el = document.getElementById(targetId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById("copyToast") || (() => { const t = document.createElement("div"); t.id = "copyToast"; t.className = "toast-notification"; document.body.appendChild(t); return t; })();
        toast.textContent = "已复制到剪贴板";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }).catch(() => alert("复制失败，请手动选择文本复制"));
});


