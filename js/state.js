import { escapeHTML } from './utils.js';

const AppState = {
    wuxingData: { 金: 20, 木: 20, 水: 20, 火: 20, 土: 20 },
    liuyao: { isStarted: false, currentStep: 0, lines: [], category: 'career' },
    huangliDate: new Date()
};

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

export { AppState, restoreBaziInput, saveBaziInput, restoreChatHistory, saveChatHistory };
