import {
    AppState,
    HISTORY_MODULE_META,
    restoreBaziInput,
    saveBaziInput,
    getHistoryRecords,
    addHistoryRecord,
    deleteHistoryRecord,
    toggleHistoryFavorite
} from './state.js?v=20260624-1';
import { initClock, initHuangliModule, renderHuangliCard } from './calendar.js?v=20260624-1';
import { initBaziModule, drawWuxingRadar } from './bazi.js?v=20260624-1';
import { initLiuyaoModule } from './liuyao.js?v=20260624-1';
import { initFengshuiModule } from './fengshui.js?v=20260624-1';
import { initChatModule } from './chat.js?v=20260624-1';
import { initXingmingModule } from './xingming.js?v=20260624-1';
import { initMeihuaModule } from './meihua.js?v=20260624-1';
import { initHehunModule } from './hehun.js?v=20260624-1';
import { initZiweiModule } from './ziwei.js?v=20260624-1';
import { initHepanModule } from './hepan.js?v=20260624-1';
import { initShuziModule } from './shuzi.js?v=20260624-1';
import { getGanWuxing, getWuxingEng, showToast, initGestureHandler, switchToNextModule, switchToPrevModule } from './utils.js?v=20260624-1';

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
    initHepanModule();
    initShuziModule();

    // Re-run dress guide after clock init
    setTimeout(() => { renderDressGuide(); renderFortuneMonth(); }, 500);
    // Re-run dress guide on every clock tick (every 1s in calendar.js)
    const origRender = renderDressGuide;
    const origFortune = renderFortuneMonth;
    setInterval(() => {
        const gzEl = document.querySelector('.ganzhi-time');
        if (gzEl && gzEl.textContent !== '') { origRender(); origFortune(); }
    }, 5000);

    loadBaziHistory();
    initGlobalHistoryPanel();

    // 初始化手势操作
    initGestureNavigation();

    document.addEventListener('bazi-analysis-complete', e => {
        saveBaziHistory(e.detail.name, e.detail.gender, e.detail.date);
        renderFortuneMonth();
        addHistoryRecord({
            module: 'bazi',
            title: `${e.detail.name || '无名善信'} · ${e.detail.gender || ''}八字`,
            summary: e.detail.date || '',
            dedupeKey: `bazi:${e.detail.name || ''}:${e.detail.gender || ''}:${e.detail.date || ''}`,
            detail: e.detail
        });
    });

    document.addEventListener('liuyao-analysis-complete', e => {
        addHistoryRecord({
            module: 'liuyao',
            title: e.detail?.title || '六爻卦例',
            summary: e.detail?.summary || '',
            dedupeKey: `liuyao:${e.detail?.category || ''}:${(e.detail?.lines || []).join('')}`,
            detail: e.detail
        });
    });

    document.addEventListener('global-history-updated', renderGlobalHistory);

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

function initGlobalHistoryPanel() {
    const search = document.getElementById('globalHistorySearch');
    const filter = document.getElementById('globalHistoryFilter');
    if (search) search.addEventListener('input', renderGlobalHistory);
    if (filter) filter.addEventListener('change', renderGlobalHistory);
    renderGlobalHistory();
}

function renderGlobalHistory() {
    const list = document.getElementById('globalHistoryList');
    if (!list) return;
    const query = document.getElementById('globalHistorySearch')?.value || '';
    const module = document.getElementById('globalHistoryFilter')?.value || '';
    const records = getHistoryRecords({ query, module }).slice(0, 20);

    if (!records.length) {
        list.innerHTML = '<div class="global-history-empty">暂无历史记录。完成排盘或起卦后会自动出现在这里。</div>';
        return;
    }

    list.innerHTML = records.map(item => {
        const meta = HISTORY_MODULE_META[item.module] || { label: '记录', icon: 'fa-book', target: '' };
        const time = item.time ? new Date(item.time).toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
        return `
            <div class="global-history-item" data-id="${item.id}" data-target="${meta.target}">
                <span class="history-icon"><i class="fa-solid ${meta.icon}"></i></span>
                <div>
                    <div class="history-title">${escapeAttr(item.title)}</div>
                    <div class="history-meta">${meta.label} · ${time}${item.summary ? ' · ' + escapeAttr(item.summary) : ''}</div>
                </div>
                <div class="global-history-actions">
                    <button class="btn-fav-history ${item.favorite ? 'active' : ''}" data-id="${item.id}" title="收藏"><i class="fa-solid fa-star"></i></button>
                    <button class="btn-del-history" data-id="${item.id}" title="删除"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.global-history-item').forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.closest('button')) return;
            const target = item.dataset.target;
            if (target) document.querySelector(`.nav-item[data-target="${target}"]`)?.click();
        });
    });
    list.querySelectorAll('.btn-fav-history').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            toggleHistoryFavorite(btn.dataset.id);
        });
    });
    list.querySelectorAll('.btn-del-history').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            deleteHistoryRecord(btn.dataset.id);
        });
    });
}

function escapeAttr(value) {
    return String(value || '').replace(/[&<>'"]/g, tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[tag] || tag));
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

/* ---------- 本月运势卡片 ---------- */
function renderFortuneMonth() {
    const card = document.getElementById('fortuneMonthCard');
    const body = document.getElementById('fortuneMonthBody');
    if (!card || !body) return;
    const saved = restoreBaziInput();
    if (!saved || !saved.date) { card.style.display = 'none'; return; }
    const d = new Date(saved.date);
    if (isNaN(d.getTime())) { card.style.display = 'none'; return; }
    const now = new Date();
    const monthIdx = now.getMonth();
    const wxCycle = ['金','水','木','火','土'];
    const monthGanZhi = ['丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥','丙子','丁丑'];
    const monthWx = monthGanZhi.map(gz => getGanWuxing(gz[0]));
    const cmWx = monthWx[monthIdx];
    const cmGz = monthGanZhi[monthIdx];
    const lunar = window.Lunar ? Lunar.fromDate(now) : null;
    const monthName = lunar ? lunar.getMonthInChinese() + '月' : (monthIdx + 1) + '月';
    const gzText = document.querySelector('.ganzhi-time')?.textContent || '';
    const dayMatch = gzText.match(/[日]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/);
    const dayG = dayMatch ? dayMatch[1][0] : '';
    const dayWx = dayG ? getGanWuxing(dayG) : '';
    const wxIdx = wxCycle.indexOf(cmWx);
    const dayWxIdx = wxCycle.indexOf(dayWx);
    const sheng = (wxIdx >= 0 && dayWxIdx >= 0 && wxCycle[(wxIdx + 1) % 5] === dayWx) || (wxCycle[(wxIdx + 2) % 5] === dayWx);
    const ke = (wxIdx >= 0 && dayWxIdx >= 0 && wxCycle[(wxIdx + 3) % 5] === dayWx) || (wxCycle[(wxIdx + 4) % 5] === dayWx);
    const rating = sheng ? '吉' : ke ? '慎' : '平';
    const badgeCls = sheng ? 'badge-ji' : ke ? 'badge-shen' : 'badge-ping';
    const ratingLabel = sheng ? '运势顺遂，宜积极行动' : ke ? '谨言慎行，稳中求进' : '平稳过渡，顺势而为';
    body.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span class="fortune-month-badge ${badgeCls}">${monthName} ${rating}</span>
            <span style="font-size:0.78rem;color:var(--text-gray);">${cmGz} · 五行${cmWx}</span>
        </div>
        <div class="fortune-month-row">
            <div class="fortune-month-item">
                <strong>本月评级</strong>
                <span>${ratingLabel}</span>
            </div>
            <div class="fortune-month-item">
                <strong>日主五行</strong>
                <span>${dayWx || '未知'}日</span>
            </div>
            <div class="fortune-month-item">
                <strong>月令五行</strong>
                <span>${cmWx}</span>
            </div>
        </div>
        <p style="font-size:0.72rem;color:var(--text-gray);margin-top:6px;font-style:italic;">基于命主八字与当前月令生克关系推演</p>
    `;
    card.style.display = '';
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
    const sideNav = document.getElementById("sideNav");
    const mobileBottomNav = document.getElementById("mobileBottomNav");
    const mobileMoreMenu = document.getElementById("mobileMoreMenu");
    const mobileMoreBackdrop = document.getElementById("mobileMoreBackdrop");

    function switchView(targetId) {
        if (targetId === "more") {
            if (mobileMoreMenu) mobileMoreMenu.classList.add("open");
            return;
        }

        // 导航切换触感反馈
        try {
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
        } catch(e) {}

        navItems.forEach(item => {
            item.classList.toggle("active", item.getAttribute("data-target") === targetId);
        });
        viewPanels.forEach(panel => {
            panel.classList.toggle("active", panel.id === `panel-${targetId}`);
        });
        // 同步移动端底部Tab
        if (mobileBottomNav) {
            mobileBottomNav.querySelectorAll(".mobile-nav-item").forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-target") === targetId);
            });
        }
        // 关闭更多菜单
        if (mobileMoreMenu) mobileMoreMenu.classList.remove("open");
        if (targetId === "bazi") setTimeout(drawWuxingRadar, 200);
        // 滚动到顶部
        const activePanel = document.querySelector(".view-panel.active");
        if (activePanel) activePanel.scrollTop = 0;
    }

    // 桌面侧栏导航
    navItems.forEach(item => {
        item.addEventListener("click", () => switchView(item.getAttribute("data-target")));
    });
    // Dashboard功能卡片
    featureCards.forEach(card => {
        card.addEventListener("click", () => switchView(card.getAttribute("data-goto")));
    });
    // 移动端底部Tab
    if (mobileBottomNav) {
        mobileBottomNav.querySelectorAll(".mobile-nav-item").forEach(btn => {
            btn.addEventListener("click", () => switchView(btn.getAttribute("data-target")));
        });
    }
    // 更多菜单项
    if (mobileMoreMenu) {
        mobileMoreMenu.querySelectorAll(".mobile-more-item").forEach(btn => {
            btn.addEventListener("click", () => switchView(btn.getAttribute("data-target")));
        });
        if (mobileMoreBackdrop) {
            mobileMoreBackdrop.addEventListener("click", () => mobileMoreMenu.classList.remove("open"));
        }
    }

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

/* ---------- 手势导航 ---------- */
function initGestureNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const viewPanels = document.querySelectorAll(".view-panel");
    const featureCards = document.querySelectorAll(".feature-link-card");
    const sideNav = document.getElementById("sideNav");
    const toggleBtn = document.getElementById("navToggleBtn");
    const mobileBottomNav = document.getElementById("mobileBottomNav");
    const mobileMoreMenu = document.getElementById("mobileMoreMenu");
    const mobileMoreBackdrop = document.getElementById("mobileMoreBackdrop");

    // 获取当前活动的模块
    function getCurrentModule() {
        const activeNav = document.querySelector(".mobile-nav-item.active, .nav-item.active");
        return activeNav ? activeNav.getAttribute("data-target") : "dashboard";
    }

    // 切换模块
    function navigateToModule(moduleId) {
        switchView(moduleId);
        showToast(`切换到：${moduleId}`, 1000);
    }

    // 设置手势处理
    initGestureHandler({
        onSwipeLeft: () => {
            // 左滑切换到下一个模块
            const current = getCurrentModule();
            switchToNextModule(current, navigateToModule);
        },
        onSwipeRight: () => {
            // 右滑切换到上一个模块
            const current = getCurrentModule();
            switchToPrevModule(current, navigateToModule);
        },
        threshold: 80 // 滑动阈值，避免误触
    });
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

/* ---------- 分享卡片 ---------- */
function generateShareCardHtml(el) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bg = isLight ? '#F0EBE0' : '#0A0A0C';
    const cardBg = isLight ? 'rgba(255,252,245,0.95)' : 'rgba(20,20,25,0.92)';
    const borderClr = isLight ? '#B8942E' : '#D4AF37';
    const textClr = isLight ? '#2C2C2C' : '#E5E5EA';
    const innerHtml = el.innerHTML;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:absolute;left:-9999px;top:0;width:${Math.min(el.scrollWidth + 40, 800)}px;background:${bg};padding:20px;`;
    wrapper.innerHTML = `
        <div style="background:${cardBg};border:2px solid ${borderClr};border-radius:12px;padding:24px;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,transparent,${borderClr},transparent);"></div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid ${borderClr}44;">
                <span style="font-size:1.5rem;">☯</span>
                <div>
                    <div style="font-size:0.95rem;font-weight:700;color:${borderClr};">乾坤易道</div>
                    <div style="font-size:0.7rem;color:${textClr}66;">周 易 数 理 命 理 智 能 分 析 系 统</div>
                </div>
            </div>
            <div style="font-size:0.82rem;color:${textClr};line-height:1.7;">${innerHtml}</div>
            <div style="margin-top:16px;padding-top:10px;border-top:1px solid ${borderClr}33;text-align:center;font-size:0.65rem;color:${textClr}55;">
                乾坤易道 · 知命而修己
            </div>
        </div>`;
    document.body.appendChild(wrapper);
    return wrapper;
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-screenshot");
    if (!btn) return;
    const targetId = btn.getAttribute("data-target");
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (!el || typeof html2canvas === 'undefined') { alert("截图功能需要 html2canvas 库支持"); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 生成中...';

    const wrapper = generateShareCardHtml(el);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bg = isLight ? '#F0EBE0' : '#0A0A0C';
    html2canvas(wrapper, { backgroundColor: bg, scale: 2, useCORS: true, allowTaint: true }).then(canvas => {
        document.body.removeChild(wrapper);

        const action = btn.getAttribute("data-action") || 'download';
        if (action === 'clipboard') {
            canvas.toBlob(blob => {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
                    showToast("图片已复制到剪贴板");
                }).catch(() => {
                    const link = document.createElement("a");
                    link.download = `${targetId}-${Date.now()}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                });
            });
        } else {
            const link = document.createElement("a");
            link.download = `${targetId}-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    }).catch(err => {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        console.error("html2canvas error:", err);
        alert("图片生成失败: " + (err.message || "未知错误"));
    }).finally(() => {
        btn.disabled = false;
        btn.innerHTML = btn.getAttribute("data-action") === 'clipboard' ? '<i class="fa-solid fa-share-nodes"></i> 分享卡片' : '<i class="fa-solid fa-download"></i> 保存图片';
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
        showToast("已复制到剪贴板");
    }).catch(() => alert("复制失败，请手动选择文本复制"));
});
