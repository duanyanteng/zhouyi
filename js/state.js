import { escapeHTML } from './utils.js?v=20260624-1';

const AppState = {
    wuxingData: { 金: 20, 木: 20, 水: 20, 火: 20, 土: 20 },
    liuyao: { isStarted: false, currentStep: 0, lines: [], category: 'career' },
    huangliDate: new Date()
};

const GLOBAL_HISTORY_KEY = "qky_global_history_v1";

const HISTORY_MODULE_META = {
    bazi: { label: "八字", icon: "fa-chart-pie", target: "bazi" },
    liuyao: { label: "六爻", icon: "fa-coins", target: "liuyao" },
    huangli: { label: "黄历", icon: "fa-calendar-days", target: "huangli" },
    fengshui: { label: "风水", icon: "fa-house-chimney", target: "fengshui" },
    chat: { label: "问卜", icon: "fa-comments", target: "chat" },
    xingming: { label: "姓名", icon: "fa-signature", target: "xingming" },
    meihua: { label: "梅花", icon: "fa-hand-sparkles", target: "meihua" },
    hehun: { label: "合婚", icon: "fa-heart", target: "hehun" },
    hepan: { label: "合盘", icon: "fa-people-arrows", target: "hepan" },
    ziwei: { label: "紫微", icon: "fa-star", target: "ziwei" }
};

function getHistoryRecords(filter = {}) {
    try {
        const raw = localStorage.getItem(GLOBAL_HISTORY_KEY);
        let records = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(records)) records = [];
        if (filter.module) records = records.filter(item => item.module === filter.module);
        if (filter.favorite === true) records = records.filter(item => item.favorite);
        if (filter.query) {
            const q = filter.query.toLowerCase();
            records = records.filter(item => `${item.title || ""} ${item.summary || ""}`.toLowerCase().includes(q));
        }
        return records.sort((a, b) => (b.time || 0) - (a.time || 0));
    } catch(e) {
        return [];
    }
}

function writeHistoryRecords(records) {
    try {
        localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(records.slice(0, 80)));
    } catch(e) {}
}

function addHistoryRecord(record) {
    const records = getHistoryRecords();
    const duplicate = records.find(old => {
        if (record.id && old.id === record.id) return true;
        if (record.dedupeKey && old.dedupeKey === record.dedupeKey) return true;
        return false;
    });
    const item = {
        id: duplicate?.id || record.id || `${record.module || "record"}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        module: record.module || "misc",
        title: record.title || "未命名记录",
        summary: record.summary || "",
        detail: record.detail || null,
        dedupeKey: record.dedupeKey || "",
        favorite: duplicate ? Boolean(duplicate.favorite) : Boolean(record.favorite),
        time: record.time || Date.now()
    };
    const next = [item, ...records.filter(old => old.id !== item.id && (!item.dedupeKey || old.dedupeKey !== item.dedupeKey))];
    writeHistoryRecords(next);
    document.dispatchEvent(new CustomEvent("global-history-updated", { detail: item }));
    return item;
}

function deleteHistoryRecord(id) {
    writeHistoryRecords(getHistoryRecords().filter(item => item.id !== id));
    document.dispatchEvent(new CustomEvent("global-history-updated"));
}

function toggleHistoryFavorite(id) {
    const records = getHistoryRecords();
    const next = records.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item);
    writeHistoryRecords(next);
    document.dispatchEvent(new CustomEvent("global-history-updated"));
}

function restoreBaziInput() {
    try {
        const json = localStorage.getItem("bazi_input_cache");
        if (json) return JSON.parse(json);
    } catch(e) {}
    return null;
}

function saveBaziInput(name, gender, date) {
    try {
        localStorage.setItem("bazi_input_cache", JSON.stringify({ name, gender, date }));
    } catch(e) {}
}

function restoreChatHistory() {
    try {
        const json = localStorage.getItem("chat_history");
        if (!json) return;
        const msgs = JSON.parse(json);
        const history = document.getElementById("chatHistory");
        if (!history || !Array.isArray(msgs) || msgs.length === 0) return;
        history.innerHTML = '';
        msgs.forEach(m => {
            const msg = document.createElement("div");
            msg.className = `chat-message ${m.role}`;
            const avatarHtml = m.role === "user" ? "信" : "☯";
            msg.innerHTML = `
                <div class="avatar">${avatarHtml}</div>
                <div class="message-bubble font-shufa">${m.role === "assistant" ? m.content : `<p>${escapeHTML(m.content)}</p>`}</div>
            `;
            history.appendChild(msg);
        });
        history.scrollTop = history.scrollHeight;
    } catch(e) {}
}

function saveChatHistory() {
    try {
        const history = document.getElementById("chatHistory");
        if (!history) return;
        const msgs = [];
        history.querySelectorAll(".chat-message").forEach(el => {
            const role = el.classList.contains("assistant") ? "assistant" : "user";
            const text = el.querySelector(".message-bubble")?.innerText || "";
            if (text) msgs.push({ role, content: text });
        });
        if (msgs.length > 0) {
            localStorage.setItem("chat_history", JSON.stringify(msgs));
        }
    } catch(e) {}
}

export {
    AppState,
    HISTORY_MODULE_META,
    restoreBaziInput,
    saveBaziInput,
    restoreChatHistory,
    saveChatHistory,
    getHistoryRecords,
    addHistoryRecord,
    deleteHistoryRecord,
    toggleHistoryFavorite
};
