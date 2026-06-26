/**
 * 乾坤易道 - AI 增强模块
 * @module ai-enhanced
 * @description 提供智能AI分析功能，包括上下文管理、专业提示词、流式输出、多模型支持
 */

import { showToast } from './utils.js?20260626-4';

/* ========== AI 配置 ========== */

const AI_CONFIG = {
    // 模型配置
    models: {
        'gemini-3.5-flash': {
            name: 'Gemini 3.5 Flash',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',
            maxTokens: 8192,
            temperature: 0.7,
            desc: '最新快速模型，性能优秀',
        },
        'gemini-3.1-flash-lite': {
            name: 'Gemini 3.1 Flash Lite',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
            maxTokens: 4096,
            temperature: 0.7,
            desc: '轻量级模型，速度快',
        },
        'gemini-2.5-pro': {
            name: 'Gemini 2.5 Pro',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
            maxTokens: 16384,
            temperature: 0.7,
            desc: '高质量模型（如果可用）',
        },
        'gemini-2.0-flash': {
            name: 'Gemini 2.0 Flash',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            maxTokens: 8192,
            temperature: 0.7,
            desc: '稳定版本，兼容性好',
        },
    },

    // 默认配置
    defaultModel: 'gemini-3.5-flash',
    maxHistory: 10, // 保留最近10轮对话
    streamDelay: 50, // 流式输出延迟（毫秒）

    // 自定义模型存储键
    customModelsKey: 'qky_custom_ai_models',

    // 系统提示词模板
    systemPrompts: {
        base: `你是"乾坤易道"AI命理大师，精通中国传统命理学，包括八字、六爻、紫微斗数、奇门遁甲、风水等。

## 核心原则
1. **专业准确**：基于传统命理理论，结合现代解读
2. **通俗易懂**：用现代语言解释专业术语
3. **积极正面**：趋吉避凶，给出建设性建议
4. **尊重传统**：保持命理学的严谨性

## 回答规范
- 使用段落分明的结构
- 关键信息用**加粗**标注
- 适当使用emoji增加亲和力
- 给出具体的行动建议`,

        bazi: `## 八字分析专长

你擅长以下八字分析：
- **五行旺衰**：分析日主强弱，判断喜用神
- **十神关系**：解读正印、偏印、正官、七杀等
- **格局判断**：正格、变格、特殊格局
- **神煞分析**：天乙贵人、文昌贵人、驿马、华盖等
- **大运流年**：分析运势变化趋势
- **调理建议**：五行补救、方位选择、行业建议

### 分析维度
1. 性格特质（基于日主和十神）
2. 事业财运（基于官杀和财星）
3. 感情婚姻（基于日支和桃花）
4. 健康状况（基于五行平衡）
5. 流年运势（基于大运流年）`,

        liuyao: `## 六爻分析专长

你擅长以下六爻分析：
- **卦象解读**：本卦、变卦、互卦、错卦、综卦
- **六亲关系**：父母、兄弟、子孙、妻财、官鬼
- **用神判断**：根据所问事项确定用神
- **动爻分析**：动爻的含义和影响
- **应期判断**：事情发生的时间

### 分析步骤
1. 确定所问事项和用神
2. 分析卦象整体信息
3. 重点分析动爻和变爻
4. 判断事情发展趋势
5. 给出具体建议和应期`,

        ziwei: `## 紫微斗数分析专长

你擅长以下紫微分析：
- **星曜解读**：14主星、6吉星、6煞星
- **宫位分析**：命宫、兄弟宫、夫妻宫等12宫
- **四化飞星**：化禄、化权、化科、化忌
- **大限流年**：10年大限、流年运势
- **格局判断**：富贵格局、特殊格局

### 分析维度
1. 命宫主星（性格、长相、能力）
2. 财帛宫（财运、理财能力）
3. 官禄宫（事业、工作）
4. 夫妻宫（婚姻、感情）
5. 大限运势（阶段性运势）`,

        qimen: `## 奇门遁甲分析专长

你擅长以下奇门分析：
- **天地人神**：天盘、地盘、人盘、神盘
- **九星八门**：九星吉凶、八门含义
- **格局判断**：吉格、凶格、特殊格局
- **用事指导**：出行、求财、嫁娶、诉讼等
- **方位选择**：吉方、凶方、最佳方位

### 分析步骤
1. 确定阴阳遁和局数
2. 排布天地人神四盘
3. 分析格局吉凶
4. 给出用事建议
5. 推荐吉时吉方`,

        fengshui: `## 风水分析专长

你擅长以下风水分析：
- **八宅风水**：东四宅、西四宅、吉凶方位
- **玄空飞星**：九运飞星、流年飞星
- **24山方位**：精确方位判断
- **家居布局**：客厅、卧室、厨房、书房
- **调理化解**：风水物品、颜色、方位

### 分析维度
1. 房屋坐向和宅命
2. 吉凶方位判断
3. 重要区域布局
4. 流年飞星影响
5. 调理化解建议`,
    },
};

/* ========== 上下文管理器 ========== */

class AIContextManager {
    constructor() {
        this.context = {};
        this.history = [];
        this.currentModule = 'general';
    }

    /**
     * 注入模块上下文
     * @param {string} module - 模块名称
     * @param {Object} data - 模块数据
     */
    injectContext(module, data) {
        this.context[module] = {
            ...data,
            timestamp: Date.now(),
        };
        console.log(`AI上下文已注入: ${module}`, data);
    }

    /**
     * 清除模块上下文
     * @param {string} module - 模块名称
     */
    clearContext(module) {
        delete this.context[module];
    }

    /**
     * 清除所有上下文
     */
    clearAllContext() {
        this.context = {};
        this.history = [];
    }

    /**
     * 获取模块上下文
     * @param {string} module - 模块名称
     * @returns {Object} 上下文数据
     */
    getContext(module) {
        return this.context[module] || null;
    }

    /**
     * 添加对话历史
     * @param {string} role - 角色（user/assistant）
     * @param {string} content - 内容
     */
    addHistory(role, content) {
        this.history.push({
            role,
            content,
            timestamp: Date.now(),
        });

        // 保持历史记录在限制范围内
        if (this.history.length > AI_CONFIG.maxHistory * 2) {
            this.history = this.history.slice(-AI_CONFIG.maxHistory * 2);
        }
    }

    /**
     * 获取对话历史
     * @returns {Array} 对话历史
     */
    getHistory() {
        return this.history;
    }

    /**
     * 生成系统提示词
     * @param {string} module - 模块名称
     * @returns {string} 系统提示词
     */
    generateSystemPrompt(module) {
        const basePrompt = AI_CONFIG.systemPrompts.base;
        const modulePrompt = AI_CONFIG.systemPrompts[module] || '';
        const contextPrompt = this.generateContextPrompt(module);

        return `${basePrompt}\n\n${modulePrompt}\n\n${contextPrompt}`;
    }

    /**
     * 生成上下文提示词
     * @param {string} module - 模块名称
     * @returns {string} 上下文提示词
     */
    generateContextPrompt(module) {
        const context = this.context[module];
        if (!context) return '';

        let prompt = `## 当前用户信息\n\n`;

        // 根据模块生成不同的上下文
        switch (module) {
            case 'bazi':
                prompt += this.generateBaziContext(context);
                break;
            case 'liuyao':
                prompt += this.generateLiuyaoContext(context);
                break;
            case 'ziwei':
                prompt += this.generateZiweiContext(context);
                break;
            case 'qimen':
                prompt += this.generateQimenContext(context);
                break;
            case 'fengshui':
                prompt += this.generateFengshuiContext(context);
                break;
            default:
                prompt += `- 用户正在咨询命理问题\n`;
        }

        return prompt;
    }

    /**
     * 生成八字上下文
     */
    generateBaziContext(context) {
        const { name, gender, date, pillars, dayMaster, wuxing, shishen, shensha } = context;

        let prompt = '';
        prompt += `- **姓名**：${name || '未提供'}\n`;
        prompt += `- **性别**：${gender || '未提供'}\n`;
        prompt += `- **出生日期**：${date || '未提供'}\n`;

        if (pillars) {
            prompt += `- **四柱八字**：\n`;
            prompt += `  - 年柱：${pillars.year || '--'}\n`;
            prompt += `  - 月柱：${pillars.month || '--'}\n`;
            prompt += `  - 日柱：${pillars.day || '--'}\n`;
            prompt += `  - 时柱：${pillars.time || '--'}\n`;
        }

        if (dayMaster) {
            prompt += `- **日主**：${dayMaster}\n`;
        }

        if (wuxing) {
            prompt += `- **五行分布**：${JSON.stringify(wuxing)}\n`;
        }

        if (shishen) {
            prompt += `- **十神**：${shishen.join('、')}\n`;
        }

        if (shensha && shensha.length > 0) {
            prompt += `- **神煞**：${shensha.join('、')}\n`;
        }

        return prompt;
    }

    /**
     * 生成六爻上下文
     */
    generateLiuyaoContext(context) {
        const { category, lines, title, summary } = context;

        let prompt = '';
        prompt += `- **占卜事项**：${category || '未指定'}\n`;

        if (title) {
            prompt += `- **卦名**：${title}\n`;
        }

        if (lines && lines.length > 0) {
            prompt += `- **六爻**：${lines.join('、')}\n`;
        }

        if (summary) {
            prompt += `- **卦辞**：${summary}\n`;
        }

        return prompt;
    }

    /**
     * 生成紫微上下文
     */
    generateZiweiContext(context) {
        const { name, gender, date, result, daXian } = context;

        let prompt = '';
        prompt += `- **姓名**：${name || '未提供'}\n`;
        prompt += `- **性别**：${gender || '未提供'}\n`;
        prompt += `- **出生日期**：${date || '未提供'}\n`;

        if (result) {
            prompt += `- **命宫位置**：${result.mingPos || '--'}\n`;
            prompt += `- **命宫主星**：${result.mainStar || '--'}\n`;

            if (result.sihua) {
                prompt += `- **四化飞星**：${JSON.stringify(result.sihua)}\n`;
            }
        }

        if (daXian && daXian.length > 0) {
            prompt += `- **大限运势**：\n`;
            daXian.slice(0, 3).forEach((dx, i) => {
                prompt += `  - ${dx.startAge}-${dx.endAge}岁：${dx.palaceName}\n`;
            });
        }

        return prompt;
    }

    /**
     * 生成奇门遁甲上下文
     */
    generateQimenContext(context) {
        const { year, month, day, hour, dunType, ju, zhiFu, zhiShi, patterns, advice } = context;

        let prompt = '';
        prompt += `- **占卜时间**：${year}年${month}月${day}日 ${hour}时\n`;
        prompt += `- **阴阳遁**：${dunType || '--'}\n`;
        prompt += `- **局数**：${ju || '--'}局\n`;
        prompt += `- **值符**：${zhiFu?.name || '--'}\n`;
        prompt += `- **值使**：${zhiShi?.name || '--'}\n`;

        if (patterns && patterns.length > 0) {
            prompt += `- **格局**：\n`;
            patterns.forEach(p => {
                prompt += `  - ${p.name}（${p.palaceName}）- ${p.type}\n`;
            });
        }

        if (advice) {
            prompt += `- **用事建议**：${advice.summary || '--'}\n`;
        }

        return prompt;
    }

    /**
     * 生成风水上下文
     */
    generateFengshuiContext(context) {
        const { direction, mountain, year } = context;

        let prompt = '';
        prompt += `- **房屋坐向**：${direction || '未指定'}\n`;

        if (mountain) {
            prompt += `- **24山方位**：${mountain.name}（${mountain.degree}°）\n`;
            prompt += `- **五行属性**：${mountain.wuxing}\n`;
            prompt += `- **吉凶**：${mountain.吉凶}\n`;
        }

        if (year) {
            prompt += `- **流年**：${year}年\n`;
        }

        return prompt;
    }
}

/* ========== 流式输出管理器 ========== */

class StreamOutputManager {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.content = '';
        this.isStreaming = false;
        this.abortController = null;
        this.cursorElement = null;
    }

    /**
     * 开始流式输出
     */
    start() {
        if (!this.element) return;

        this.isStreaming = true;
        this.content = '';

        // 创建光标元素
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'typing-cursor';
        this.cursorElement.textContent = '▋';

        // 清空内容并添加光标
        this.element.innerHTML = '';
        this.element.appendChild(this.cursorElement);
    }

    /**
     * 追加内容
     * @param {string} chunk - 追加的内容
     */
    append(chunk) {
        if (!this.isStreaming || !this.element) return;

        this.content += chunk;

        // 更新显示（使用 innerHTML 支持 Markdown）
        const formattedContent = this.formatMarkdown(this.content);
        this.element.innerHTML = formattedContent;
        this.element.appendChild(this.cursorElement);

        // 自动滚动到底部
        this.element.scrollTop = this.element.scrollHeight;
    }

    /**
     * 完成流式输出
     */
    finish() {
        if (!this.element) return;

        this.isStreaming = false;

        // 移除光标
        if (this.cursorElement) {
            this.cursorElement.remove();
            this.cursorElement = null;
        }

        // 最终格式化
        const formattedContent = this.formatMarkdown(this.content);
        this.element.innerHTML = formattedContent;
    }

    /**
     * 中断流式输出
     */
    abort() {
        this.isStreaming = false;
        if (this.abortController) {
            this.abortController.abort();
        }
        this.finish();
    }

    /**
     * 格式化 Markdown
     */
    formatMarkdown(text) {
        // 简单的 Markdown 转换
        let html = text
            // 加粗
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 标题
            .replace(/^### (.*$)/gm, '<h4 style="color:#D4AF37;margin:12px 0 8px;">$1</h4>')
            .replace(/^## (.*$)/gm, '<h3 style="color:#D4AF37;margin:16px 0 10px;">$1</h3>')
            .replace(/^# (.*$)/gm, '<h2 style="color:#D4AF37;margin:20px 0 12px;">$1</h2>')
            // 列表
            .replace(/^\- (.*$)/gm, '<li style="margin:4px 0;">$1</li>')
            // 换行
            .replace(/\n\n/g, '</p><p style="margin:8px 0;">')
            .replace(/\n/g, '<br>');

        // 包装列表项
        html = html.replace(/(<li.*<\/li>)/gs, '<ul style="padding-left:20px;margin:8px 0;">$1</ul>');

        return `<p style="margin:8px 0;">${html}</p>`;
    }
}

/* ========== 模型管理器 ========== */

class ModelManager {
    constructor() {
        this.currentModel = AI_CONFIG.defaultModel;
        this.apiKey = null;
        this.customModels = this.loadCustomModels();
    }

    /**
     * 设置 API Key
     */
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
    }

    /**
     * 获取 API Key
     */
    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('gemini_api_key');
        }
        return this.apiKey;
    }

    /**
     * 设置当前模型
     */
    setModel(modelId) {
        // 检查内置模型
        if (AI_CONFIG.models[modelId]) {
            this.currentModel = modelId;
            localStorage.setItem('ai_model', modelId);
            return;
        }
        // 检查自定义模型
        if (this.customModels[modelId]) {
            this.currentModel = modelId;
            localStorage.setItem('ai_model', modelId);
            return;
        }
        console.warn('模型不存在:', modelId);
    }

    /**
     * 获取当前模型
     */
    getModel() {
        const saved = localStorage.getItem('ai_model');
        if (saved && (AI_CONFIG.models[saved] || this.customModels[saved])) {
            this.currentModel = saved;
        }
        return this.currentModel;
    }

    /**
     * 获取模型配置
     */
    getModelConfig() {
        // 优先返回内置模型
        if (AI_CONFIG.models[this.currentModel]) {
            return AI_CONFIG.models[this.currentModel];
        }
        // 其次返回自定义模型
        if (this.customModels[this.currentModel]) {
            return this.customModels[this.currentModel];
        }
        // 默认返回第一个内置模型
        return Object.values(AI_CONFIG.models)[0];
    }

    /**
     * 获取所有模型列表
     */
    getAllModels() {
        const models = {};
        // 内置模型
        for (const [id, config] of Object.entries(AI_CONFIG.models)) {
            models[id] = { ...config, type: 'builtin' };
        }
        // 自定义模型
        for (const [id, config] of Object.entries(this.customModels)) {
            models[id] = { ...config, type: 'custom' };
        }
        return models;
    }

    /**
     * 添加自定义模型
     */
    addCustomModel(id, config) {
        // 验证配置
        if (!id || !config.name || !config.endpoint) {
            throw new Error('模型 ID、名称和端点是必填项');
        }

        // 检查是否与内置模型冲突
        if (AI_CONFIG.models[id]) {
            throw new Error('不能覆盖内置模型');
        }

        // 添加模型
        this.customModels[id] = {
            name: config.name,
            endpoint: config.endpoint,
            maxTokens: config.maxTokens || 4096,
            temperature: config.temperature || 0.7,
            desc: config.desc || '自定义模型',
        };

        // 保存到 localStorage
        this.saveCustomModels();
        console.log('自定义模型已添加:', id);
        return true;
    }

    /**
     * 删除自定义模型
     */
    removeCustomModel(id) {
        if (!this.customModels[id]) {
            console.warn('模型不存在:', id);
            return false;
        }

        // 如果是当前模型，切换到默认模型
        if (this.currentModel === id) {
            this.currentModel = AI_CONFIG.defaultModel;
            localStorage.setItem('ai_model', this.currentModel);
        }

        // 删除模型
        delete this.customModels[id];
        this.saveCustomModels();
        console.log('自定义模型已删除:', id);
        return true;
    }

    /**
     * 获取自定义模型列表
     */
    getCustomModels() {
        return { ...this.customModels };
    }

    /**
     * 保存自定义模型到 localStorage
     */
    saveCustomModels() {
        try {
            localStorage.setItem(AI_CONFIG.customModelsKey, JSON.stringify(this.customModels));
        } catch (e) {
            console.error('保存自定义模型失败:', e);
        }
    }

    /**
     * 从 localStorage 加载自定义模型
     */
    loadCustomModels() {
        try {
            const saved = localStorage.getItem(AI_CONFIG.customModelsKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('加载自定义模型失败:', e);
            return {};
        }
    }

    /**
     * 从 API 获取可用模型列表
     */
    async fetchAvailableModels() {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('请先配置 API Key');
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('获取模型列表失败');
            }

            const data = await response.json();
            const models = data.models || [];

            // 过滤出可用的模型
            return models
                .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
                .map(model => ({
                    id: model.name.replace('models/', ''),
                    name: model.displayName,
                    desc: model.description,
                    maxTokens: model.outputTokenLimit || 4096,
                }));
        } catch (err) {
            console.error('获取模型列表失败:', err);
            throw err;
        }
    }

    /**
     * 发送消息（非流式）
     */
    async sendMessage(systemPrompt, messages) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('请先配置 API Key');
        }

        const modelConfig = this.getModelConfig();
        const url = `${modelConfig.endpoint}?key=${apiKey}`;

        const body = {
            contents: messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                temperature: modelConfig.temperature,
                maxOutputTokens: modelConfig.maxTokens,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
        };

        // 如果有系统提示词，添加 systemInstruction
        if (systemPrompt) {
            body.systemInstruction = {
                parts: [{ text: systemPrompt }],
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'AI 请求失败');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    /**
     * 发送消息（流式）
     */
    async sendMessageStream(systemPrompt, messages, onChunk) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('请先配置 API Key');
        }

        const modelConfig = this.getModelConfig();
        // 使用流式端点
        const streamEndpoint = modelConfig.endpoint.replace(':generateContent', ':streamGenerateContent');
        const url = `${streamEndpoint}?key=${apiKey}&alt=sse`;

        const body = {
            contents: messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                temperature: modelConfig.temperature,
                maxOutputTokens: modelConfig.maxTokens,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
        };

        if (systemPrompt) {
            body.systemInstruction = {
                parts: [{ text: systemPrompt }],
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI 请求失败: ${response.status}`);
        }

        // 处理 SSE 流
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            onChunk(text);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }
    }
}

/* ========== AI 分析器 ========== */

class AIAnalyzer {
    constructor() {
        this.contextManager = new AIContextManager();
        this.modelManager = new ModelManager();
        this.streamManager = null;
    }

    init() {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (apiKey) {
            this.modelManager.setApiKey(apiKey);
        }
        const model = localStorage.getItem('ai_model');
        if (model) {
            this.modelManager.setModel(model);
        }
    }

    injectContext(module, data) {
        this.contextManager.injectContext(module, data);
    }

    async sendMessage(userMessage, module = 'general') {
        const systemPrompt = this.contextManager.generateSystemPrompt(module);
        const history = this.contextManager.getHistory();
        this.contextManager.addHistory('user', userMessage);
        const messages = [
            ...history.slice(-AI_CONFIG.maxHistory * 2),
            { role: 'user', content: userMessage },
        ];
        try {
            const response = await this.modelManager.sendMessage(systemPrompt, messages);
            this.contextManager.addHistory('assistant', response);
            return response;
        } catch (err) {
            console.error('AI 请求失败:', err);
            throw err;
        }
    }

    async sendMessageStream(userMessage, module = 'general', elementId) {
        const systemPrompt = this.contextManager.generateSystemPrompt(module);
        const history = this.contextManager.getHistory();
        this.contextManager.addHistory('user', userMessage);
        const messages = [
            ...history.slice(-AI_CONFIG.maxHistory * 2),
            { role: 'user', content: userMessage },
        ];
        this.streamManager = new StreamOutputManager(elementId);
        this.streamManager.start();
        let fullResponse = '';
        try {
            await this.modelManager.sendMessageStream(systemPrompt, messages, (chunk) => {
                fullResponse += chunk;
                this.streamManager.append(chunk);
            });
            this.streamManager.finish();
            this.contextManager.addHistory('assistant', fullResponse);
            return fullResponse;
        } catch (err) {
            this.streamManager.finish();
            console.error('AI 流式请求失败:', err);
            throw err;
        }
    }

    abortStream() {
        if (this.streamManager) {
            this.streamManager.abort();
        }
    }

    clearContext(module) {
        if (module) {
            this.contextManager.clearContext(module);
        } else {
            this.contextManager.clearAllContext();
        }
    }

    getCurrentModel() { return this.modelManager.getModel(); }
    setModel(modelId) { this.modelManager.setModel(modelId); }
    getAllModels() { return this.modelManager.getAllModels(); }
    addCustomModel(id, config) { return this.modelManager.addCustomModel(id, config); }
    removeCustomModel(id) { return this.modelManager.removeCustomModel(id); }
    getCustomModels() { return this.modelManager.getCustomModels(); }
    async fetchAvailableModels() { return await this.modelManager.fetchAvailableModels(); }
}

/* ========== 全局实例 ========== */
const aiAnalyzer = new AIAnalyzer();

/* ========== 导出 ========== */
export {
    AI_CONFIG,
    AIContextManager,
    StreamOutputManager,
    ModelManager,
    AIAnalyzer,
    aiAnalyzer,
};