import { AppState, restoreBaziInput } from './state.js';
import { initClock, initHuangliModule, renderHuangliCard } from './calendar.js';
import { initBaziModule, drawWuxingRadar } from './bazi.js';
import { initLiuyaoModule } from './liuyao.js';
import { initFengshuiModule } from './fengshui.js';
import { initChatModule } from './chat.js';
import { initXingmingModule } from './xingming.js';
import { initMeihuaModule } from './meihua.js';
import { initHehunModule } from './hehun.js';
import { initZiweiModule } from './ziwei.js';

document.addEventListener("DOMContentLoaded", () => {
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
    html2canvas(el, { backgroundColor:'#0A0A0C', scale:2, useCORS:true }).then(canvas => {
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


