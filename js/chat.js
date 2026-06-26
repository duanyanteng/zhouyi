import { restoreChatHistory, saveChatHistory } from './state.js?20260626-4';
import { escapeHTML, sanitizeHTML } from './utils.js?20260626-4';
import { aiAnalyzer } from './ai-enhanced.js?20260626-4';

function initChatModule() {
    const btnSend = document.getElementById("btnSendMessage");
    const input = document.getElementById("chatInput");
    const modeSelect = document.getElementById("chatModeSelect");
    const apiConfig = document.getElementById("chatApiConfig");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const btnClear = document.getElementById("btnClearChat");

    if (!btnSend || !input) return;

    restoreChatHistory();

    if (apiKeyInput) {
        const saved = localStorage.getItem("gemini_api_key_saved");
        if (saved === "true") {
            const key = localStorage.getItem("gemini_api_key");
            if (key) apiKeyInput.value = key;
        }
        const saveToggle = document.getElementById("apiKeySaveToggle");
        if (saveToggle) {
            saveToggle.checked = saved === "true";
            saveToggle.addEventListener("change", () => {
                localStorage.setItem("gemini_api_key_saved", saveToggle.checked ? "true" : "false");
                if (!saveToggle.checked) localStorage.removeItem("gemini_api_key");
            });
        }
        apiKeyInput.addEventListener("input", () => {
            if (saveToggle && saveToggle.checked) localStorage.setItem("gemini_api_key", apiKeyInput.value);
        });
        const clearKeyBtn = document.getElementById("btnClearApiKey");
        if (clearKeyBtn) {
            clearKeyBtn.addEventListener("click", () => {
                apiKeyInput.value = "";
                localStorage.removeItem("gemini_api_key");
                localStorage.setItem("gemini_api_key_saved", "false");
                if (saveToggle) saveToggle.checked = false;
            });
        }
    }

    if (btnClear) {
        btnClear.addEventListener("click", () => {
            const history = document.getElementById("chatHistory");
            if (!history) return;
            history.innerHTML = '';
            const welcome = document.createElement("div");
            welcome.className = "chat-message assistant";
            welcome.innerHTML = `<div class="avatar">☯</div><div class="message-bubble font-shufa"><p>善信你好，老夫在此稽首了。若有任何不解，皆可向老夫追问。</p></div>`;
            history.appendChild(welcome);
            localStorage.removeItem("chat_history");
        });
    }

    // 测试 API 连接
    const btnChatTestApi = document.getElementById('btnChatTestApi');
    const chatApiTestResult = document.getElementById('chatApiTestResult');
    if (btnChatTestApi && chatApiTestResult) {
        btnChatTestApi.addEventListener('click', async () => {
            const key = apiKeyInput?.value?.trim();
            if (!key) {
                chatApiTestResult.innerHTML = '<span style="color: #e86b6b;">请先输入 API Key</span>';
                return;
            }
            btnChatTestApi.disabled = true;
            btnChatTestApi.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> 测试中...';
            chatApiTestResult.innerHTML = '<span style="color:var(--text-gray);">测试中...</span>';
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, { signal: AbortSignal.timeout(10000) });
                if (response.ok) {
                    const data = await response.json();
                    chatApiTestResult.innerHTML = `<span style="color: #3B9C7A;"><i class="fa-solid fa-circle-check"></i> 连接成功！可用模型: ${data.models?.length || 0} 个</span>`;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (err) {
                let msg = '连接失败';
                if (err.name === 'TimeoutError') msg = '连接超时';
                else if (err.message?.includes('Failed to fetch')) msg = '网络错误';
                chatApiTestResult.innerHTML = `<span style="color: #e86b6b;"><i class="fa-solid fa-circle-xmark"></i> ${msg}</span>`;
            } finally {
                btnChatTestApi.disabled = false;
                btnChatTestApi.innerHTML = '<i class="fa-solid fa-plug"></i> 测试连接';
            }
        });
    }

    if (modeSelect && apiConfig) {
        modeSelect.addEventListener("change", () => {
            apiConfig.classList.toggle("visible", modeSelect.value === "api");
        });
        apiConfig.classList.toggle("visible", modeSelect.value === "api");
    }

    async function handleSend() {
        const text = input.value.trim();
        if (!text) return;

        appendMessage("user", text);
        input.value = "";

        const chatMode = document.getElementById("chatModeSelect").value;

        if (chatMode === "api") {
            // 同步 API Key 到 localStorage（确保 AI 模块能读取）
            const currentKey = apiKeyInput?.value?.trim();
            if (currentKey) {
                localStorage.setItem('gemini_api_key', currentKey);
            }

            // 同步模型选择到 localStorage 和 AI 模块
            const modelSelect = document.getElementById("modelSelect");
            if (modelSelect?.value) {
                localStorage.setItem('ai_model', modelSelect.value);
                aiAnalyzer.setModel(modelSelect.value);
            }

            const history = document.getElementById("chatHistory");

            // 创建助手消息容器（用于流式输出）
            const assistantMsg = document.createElement("div");
            assistantMsg.className = "chat-message assistant";
            assistantMsg.innerHTML = `
                <div class="avatar">☯</div>
                <div class="message-bubble font-shufa" id="streamOutput">
                    <i class="fa-solid fa-spinner animate-spin" style="margin-right:6px;"></i> 大师抚须推演天机中...
                </div>
            `;
            history.appendChild(assistantMsg);
            history.scrollTop = history.scrollHeight;

            try {
                // 使用 AI 增强模块（流式输出）
                const reply = await aiAnalyzer.sendMessageStream(text, 'general', 'streamOutput');
                saveChatHistory();
            } catch (err) {
                // AI 模块失败，直接降级到本地回复（不尝试 Gemini，避免双重 503）
                const streamEl = document.getElementById("streamOutput");
                if (streamEl) {
                    const isKeyMissing = err.message && err.message.includes("API Key");
                    const isOverloaded = err.message && (err.message.includes("503") || err.message.includes("high demand"));
                    let fallbackNotice = '';

                    if (isKeyMissing) {
                        fallbackNotice = `<p style="color:var(--cinnabar-red);font-style:italic;font-size:0.8rem;margin-bottom:8px;"><i class="fa-solid fa-circle-exclamation"></i> 请输入有效的 Gemini API Key 后重试</p>`;
                    } else if (isOverloaded) {
                        fallbackNotice = `<p style="color:var(--text-gold);font-style:italic;font-size:0.78rem;margin-bottom:8px;"><i class="fa-solid fa-circle-info"></i> Gemini 服务繁忙，已为您切换至本地易理分析</p>`;
                    } else {
                        fallbackNotice = `<p style="color:var(--text-gold);font-style:italic;font-size:0.78rem;margin-bottom:8px;"><i class="fa-solid fa-circle-nodes"></i> 已切换至本地易理心法为您解答</p>`;
                    }
                    streamEl.innerHTML = fallbackNotice + generateMasterReply(text);
                    saveChatHistory();
                }
            }
        } else {
            const history = document.getElementById("chatHistory");
            const loadingMsg = document.createElement("div");
            loadingMsg.className = "chat-message assistant loading-msg";
            loadingMsg.innerHTML = `
                <div class="avatar">☯</div>
                <div class="message-bubble font-shufa" style="color:var(--text-gray);font-style:italic;">
                    <i class="fa-solid fa-pen-nib animate-pulse" style="margin-right:6px;"></i> 大师解卦中...
                </div>
            `;
            history.appendChild(loadingMsg);
            history.scrollTop = history.scrollHeight;

            setTimeout(() => {
                loadingMsg.remove();
                appendMessage("assistant", generateMasterReply(text));
            }, 1000);
        }
    }

    btnSend.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    // 语音输入功能
    const btnVoice = document.getElementById("btnVoiceInput");
    if (btnVoice) {
        let recognition = null;
        let isRecording = false;

        // 检查浏览器是否支持语音识别
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'zh-CN'; // 设置为中文

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                input.value = transcript;
            };

            recognition.onend = () => {
                isRecording = false;
                btnVoice.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                btnVoice.style.background = '';
                btnVoice.style.color = '';
            };

            recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                isRecording = false;
                btnVoice.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                btnVoice.style.background = '';
                btnVoice.style.color = '';
                if (event.error === 'not-allowed') {
                    alert('请允许麦克风权限以使用语音输入功能');
                }
            };

            btnVoice.addEventListener("click", () => {
                if (isRecording) {
                    recognition.stop();
                } else {
                    // 请求麦克风权限
                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(() => {
                            recognition.start();
                            isRecording = true;
                            btnVoice.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
                            btnVoice.style.background = 'var(--cinnabar-red)';
                            btnVoice.style.color = 'white';
                        })
                        .catch((err) => {
                            console.error('麦克风权限被拒绝:', err);
                            alert('请允许麦克风权限以使用语音输入功能');
                        });
                }
            });
        } else {
            // 浏览器不支持语音识别
            btnVoice.style.display = 'none';
        }
    }
}

/* ---------- 消息渲染 ---------- */
function appendMessage(role, content) {
    const history = document.getElementById("chatHistory");
    if (!history) return;

    const msg = document.createElement("div");
    msg.className = `chat-message ${role}`;
    const avatarHtml = role === "user" ? "信" : "☯";
    msg.innerHTML = `
        <div class="avatar">${avatarHtml}</div>
        <div class="message-bubble font-shufa">${role === "assistant" ? content : `<p>${escapeHTML(content)}</p>`}</div>
    `;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
    saveChatHistory();
}

async function generateMasterReplyFromGemini(userQuestion) {
    const name = document.getElementById("baziName").value || "善信";
    const gender = document.querySelector('input[name="baziGender"]:checked').value;
    const apiKey = localStorage.getItem("gemini_api_key");
    const model = localStorage.getItem("ai_model") || "gemini-3.5-flash";

    if (!apiKey) {
        throw new Error("API Key 未配置");
    }

    let baziContext = "尚未排盘";
    const colYear = document.getElementById("colYear");
    if (colYear) {
        const y = colYear.querySelector(".gan").textContent + colYear.querySelector(".zhi").textContent;
        const m = document.getElementById("colMonth").querySelector(".gan").textContent + document.getElementById("colMonth").querySelector(".zhi").textContent;
        const d = document.getElementById("colDay").querySelector(".gan").textContent + document.getElementById("colDay").querySelector(".zhi").textContent;
        const t = document.getElementById("colTime").querySelector(".gan").textContent + document.getElementById("colTime").querySelector(".zhi").textContent;
        baziContext = `${y}年 ${m}月 ${d}日 ${t}时`;
    }

    const systemPrompt = `你是乾坤易道AI命理大师，精通八字、六爻、紫微斗数、奇门遁甲、风水等传统命理学。用户${name}，${gender}造，八字为${baziContext}。请用专业且通俗的语言回答问题。`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ role: "user", parts: [{ text: userQuestion }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`API ${response.status}: ${errBody.slice(0, 100)}`);
    }

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }
    throw new Error("API 返回格式异常");
}


/* ---------- 本地规则回复 ---------- */

/* ---------- 本地规则回复 ---------- */
/* ---------- 本地规则回复 ---------- */
function generateMasterReply(q) {
    q = q.toLowerCase();

    if (q.includes("你好") || q.includes("你是谁")) {
        return `<p>善信有礼了。老夫以乾坤易道AI命理师，精通八字、六爻、紫微、奇门、风水。</p>`;
    }
    if (q.includes("事业") || q.includes("工作")) {
        return `<p>事业之道，当观官杀星与印星之强弱。善信今年宜稳中求进，把握机遇。</p>`;
    }
    return `<p>善信所问之事，命理之道，在于知命而修己。建议善信结合八字排盘，从五行调和、方位选择、时机把握三方面综合考量。</p>`;
}

export { initChatModule };
