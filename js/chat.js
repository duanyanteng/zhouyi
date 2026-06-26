import { restoreChatHistory, saveChatHistory } from './state.js?v=20260624-1';
import { escapeHTML, sanitizeHTML } from './utils.js?v=20260624-1';
import { aiAnalyzer } from './ai-enhanced.js?v=20260624-1';

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

                // 流式输出完成后，保存聊天历史
                saveChatHistory();
            } catch (err) {
                console.error("AI 增强模块调用失败，尝试传统方式:", err);

                // 降级到传统方式
                try {
                    const reply = await generateMasterReplyFromGemini(text);
                    const streamEl = document.getElementById("streamOutput");
                    if (streamEl) {
                        streamEl.innerHTML = reply;
                    }
                } catch (err2) {
                    console.error("Gemini AI 接口调用失败，启动本地降级:", err2);
                    const streamEl = document.getElementById("streamOutput");
                    if (streamEl) {
                        const isKeyMissing = err2.message && err2.message.includes("API Key");
                        const errHint = err2.message ? err2.message.replace(/\b(https?:\/\/[^\s]+)\b/g, '') : '未知错误';
                        const fallbackNotice = isKeyMissing
                            ? `<p style="color:var(--cinnabar-red);font-style:italic;font-size:0.8rem;margin-bottom:8px;"><i class="fa-solid fa-circle-exclamation"></i> 请输入有效的 Gemini API Key 后重试</p>`
                            : `<p style="color:var(--cinnabar-red);font-style:italic;font-size:0.7rem;margin-bottom:4px;">⚠ AI 返回异常：${escapeHTML(errHint.slice(0, 80))}</p><p style="color:var(--text-gray);font-style:italic;font-size:0.8rem;margin-bottom:8px;"><i class="fa-solid fa-circle-nodes"></i> 老夫已自动接驳传统易理心法为您解答</p>`;
                        streamEl.innerHTML = fallbackNotice + generateMasterReply(text);
                    }
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

async function generateMasterReplyFromGemini(userQuestion) {
    const name = document.getElementById("baziName").value || "善信";
    const gender = document.querySelector('input[name="baziGender"]:checked').value;

    let baziContext = "尚未排盘";
    const colYear = document.getElementById("colYear");
    if (colYear) {
        const y = colYear.querySelector(".gan").innerHTML + colYear.querySelector(".zhi").innerHTML + "(" + colYear.querySelector(".nayin").innerHTML + ")";
        const m = document.getElementById("colMonth").querySelector(".gan").innerHTML + document.getElementById("colMonth").querySelector(".zhi").innerHTML + "(" + document.getElementById("colMonth").querySelector(".nayin").innerHTML + ")";
        const d = document.getElementById("colDay").querySelector(".gan").innerHTML + document.getElementById("colDay").querySelector(".zhi").innerHTML + "(" + document.getElementById("colDay").querySelector(".nayin").innerHTML + ")";
        const t = document.getElementById("colTime").querySelector(".gan").innerHTML + document.getElementById("colTime").querySelector(".zhi").innerHTML + "(" + document.getElementById("colTime").querySelector(".nayin").innerHTML + ")";
        baziContext = `年柱 ${y}、月柱 ${m}、日柱 ${d}、时柱 ${t}`;
    }

    let liuyaoContext = "尚未起卦";
    const resultScroll = document.getElementById("liuyaoResultScroll");
    if (resultScroll && resultScroll.style.display !== "none") {
        const title = document.getElementById("liuyaoResultTitle").innerHTML;
        const body = document.getElementById("liuyaoResultBody").innerText.slice(0, 150);
        liuyaoContext = `卦名：${title}，简析：${body}`;
    }

    const sitSelect = document.getElementById("houseSitDirection");
    const sitDirection = sitSelect ? sitSelect.value : "坐北朝南";

    const systemInstruction = `你是一位精通中华传统文化的周易大师，拥有极其深厚的易理、命理、风水与卦占造诣。
当前向你咨询问卜的善信信息如下：
- 姓名：${name}，性别：${gender}
- 对方命盘八字：${baziContext}
- 当前摇得的易经卦象：${liuyaoContext}
- 当前居住住宅风水：${sitDirection} 气场格局。

请在回答中严格遵守以下回答原则与沟通风格：
1. 语气必须温和、谦虚、充满长者的睿智与慈爱，用现代生活语言通俗解释古老智慧，引经据典。
2. 结合对方提供的【八字命盘五行属性】或【卦象】进行深度剖析，强调"趋吉避凶"而非绝对宿命论，多给予积极的心理暗示与人生方向性指导。
3. 你的文字风格非常具有古典文学美感，适当在段落中融入古典诗词（如天行健君子以自强不息等），但语言一定要让现代普通人听得懂。
4. 格式要求：直接使用 HTML 标签来排版回答。例如使用 <h4>标签表示小标题，使用 <p>标签表示段落，使用 <br> 换行，多使用粗体 <strong> 重点强调，不要输出 \`\`\`html 这样的包裹符，直接给干净的 HTML。`;

    const apiKey = document.getElementById("apiKeyInput").value.trim();
    if (!apiKey) throw new Error("请先在聊天区输入你的 Gemini API Key");
    const proxyUrl = document.getElementById("proxyUrlInput").value.trim() || "https://generativelanguage.googleapis.com";
    const modelName = document.getElementById("modelSelect").value;
    const url = `${proxyUrl}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: userQuestion }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.75, maxOutputTokens: 2048 }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Gemini API ${response.status} ${response.statusText}: ${body.slice(0, 120)}`);
    }

    const resData = await response.json();
    if (resData.candidates && resData.candidates[0] && resData.candidates[0].content && resData.candidates[0].content.parts[0]) {
        let rawContent = resData.candidates[0].content.parts[0].text;
        rawContent = rawContent.replace(/```html/gi, "").replace(/```/g, "");
        if (!rawContent.includes("<p>")) {
            rawContent = rawContent
                .replace(/\n\n/g, "</p><p>")
                .replace(/\n/g, "<br>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/### (.*?)(<br>|<\/p>)/g, "<h4>$1</h4>")
                .trim();
            rawContent = `<p>${rawContent}</p>`;
        }
        return sanitizeHTML(rawContent);
    } else {
        throw new Error("Gemini API 返回的 JSON 格式不符合预期");
    }
}

function generateMasterReply(q) {
    const name = document.getElementById("baziName").value || "善信";

    if (q.includes("八字") || q.includes("喜忌") || q.includes("五行")) {
        return `<p>贤信 <strong>${name}</strong> 问及命盘喜忌，老夫在此细细道来。</p>
            <p>阁下这造八字：<strong>戊寅 辛酉 壬午 辛丑</strong>，乃是清澈高贵的<strong>正印格</strong>。月干时干双透辛金归禄于酉，印星极其旺相，元神壬水深得金生，格局清奇高远。</p>
            <p><strong>其五行喜忌在于平衡：</strong><br>凡金白水清之造，最喜<strong>木火（食伤、财星）</strong>引通秀气并温暖寒局。今年是 <strong>丙午年</strong>，丙火偏财克制旺金，午火引动财星，实乃难得的<strong>大吉之年</strong>。贤信当放手一搏，必能如鲲鹏展翅，扶摇直上九万里！</p>
            <p>至于后天补救，可在居家或办公环境的<strong>正南（延年财位）</strong>摆放绿植或红黄暖色之饰物，以火制金，必能大旺您的财运与健康。</p>`;
    }

    if (q.includes("事业") || q.includes("前途") || q.includes("工作") || q.includes("考研") || q.includes("就业")) {
        return `<p>古人云："天道酬勤，地道酬善，人道酬诚。" 论及 <strong>${name}</strong> 贤信之事业前程，老夫有两句金石良言：</p>
            <p>您命盘中<strong>印星贴身</strong>，聪慧异常，学习和接受新事物的能力天下少有，在学术、科研、智力密集型产业或公职系统将拥有极高建树。然而，局中印星过旺，有时容易导致思想负担沉重，行事流于空想，缺乏一股冲劲。</p>
            <p>好在年支坐<strong>寅木食神制杀</strong>，这代表您骨子里在关键时刻是极具谋略和决断力的。老夫建议：<br>1. <strong>行胜于言</strong>：做事业最忌多思多虑，看准目标，直接行动，用您的食神克去七杀障碍。<br>2. <strong>借火取暖</strong>：多与性格热情、雷厉风行的伙伴（五行火旺者）合伙，他们的阳刚之气能生旺您的财星，助您开拓商机。</p>`;
    }

    if (q.includes("财运") || q.includes("发财") || q.includes("钱")) {
        return `<p>论及财禄，贤信命盘自坐<strong>午火正财</strong>，且与日元壬水有暗合之意，这在八字中叫<strong>"财来就我"</strong>，注定一生衣食丰盈，只要务实耕耘，必能富贵自来。</p>
            <p>阁下的求财契机在于：<br>1. <strong>食神生财</strong>：年支寅木木能生火，您的才华、创意与技能是源源不断的财路来源。不可光想不做，必须运用一技之长（木）去撬动财富。<br>2. <strong>流年共振</strong>：2026年是丙午火运，正财偏财并旺，是您近五年来财运的最高峰。投资理财、业务扩张皆可顺势而为，定能斩获丰盈财富。</p>`;
    }

    if (q.includes("婚姻") || q.includes("感情") || q.includes("恋爱") || q.includes("老婆") || q.includes("妻子")) {
        return `<p>"关关雎鸠，在河之洲。" 贤信壬水日元，自坐午火正财，午火中藏有丁火与己土，丁火即是壬水之正财妻星，且丁壬暗合，此乃<strong>极其深厚之夫妻缘分</strong>。</p>
            <p>这代表您未来的妻子贤良淑德，理财有道，不仅是您的贤内助，更能在事业与气场上给予您极大的生旺（火为您的喜用神）。日支为妻宫，坐午火，预示着夫妻恩爱。唯需注意，今年丙午自刑，偶有情绪摩擦，当以包容理解为先，执子之手，与子偕老。</p>`;
    }

    if (q.includes("风水") || q.includes("卧室") || q.includes("摆设") || q.includes("户型")) {
        return `<p>"人因宅而立，宅因人而存。" 贤信若要调理空间气场，老夫指点如下：</p>
            <p>您壬水身旺，住宅最宜<strong>坐北朝南（坎宅）</strong>或<strong>坐东朝西（震宅）</strong>。以坎宅为例：<br>1. <strong>催旺财位</strong>：家中的<strong>正南方（延年位）</strong>是极佳的财位，应保持明亮整洁，可在此放置一盆发财树或金蟾，大旺财源。<br>2. <strong>化解煞气</strong>：东北方为<strong>五鬼火大凶</strong>之位，绝不宜作主卧室。若卫生间不幸在此，则大吉；若在此处设有卧榻，宜悬挂一个<strong>纯铜葫芦</strong>，以收纳煞气，保全家人安康。</p>`;
    }

    return `<p>贤信 <strong>${name}</strong>，所言甚是，万物皆有其数理常道。</p>
        <p>古圣先贤创《易经》，盖因"穷则变，变则通，通则久"。人生起伏犹如卦象之阴阳消长，没有永远的困境，亦没有恒久的一帆风顺。</p>
        <p>贤信命盘金白水清，气宇轩昂，当下若有踌躇，老夫劝您：<strong>"静中蓄力，动中顺时。"</strong> 顺应天道消长，积德行善，读圣贤书，必能逢凶化吉，前程无量。若有更细致之事项，不妨与老夫细细表述，老夫必倾心相授。</p>`;
}

function appendMessage(sender, text) {
    const history = document.getElementById("chatHistory");
    const msg = document.createElement("div");
    msg.className = `chat-message ${sender}`;
    const avatarHtml = sender === "user" ? "信" : "☯";
    const bubbleContent = sender === "assistant" ? text : `<p>${escapeHTML(text)}</p>`;
    msg.innerHTML = `<div class="avatar">${avatarHtml}</div><div class="message-bubble font-shufa">${bubbleContent}</div>`;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
    setTimeout(saveChatHistory, 50);
}

export { initChatModule };
