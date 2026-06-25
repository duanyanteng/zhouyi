# 乾坤易道 v6.0 版本迭代规划

> 周易数理命理智能分析系统 · 下一个大版本
> 规划日期：2026-06-25
> 基于：v5.0 完成状态

---

## 📊 v5.0 完成情况回顾

### 已完成的功能（8/8）

| 功能 | 状态 | 说明 |
|------|------|------|
| PDF 导出 | ✅ | jsPDF + html2canvas |
| JSON 备份/恢复 | ✅ | 全量数据管理 |
| 分享链接 | ✅ | 压缩URL + 独立页面 |
| 奇门遁甲模块 | ✅ | 时家奇门排盘 |
| 用户设置中心 | ✅ | 主题、AI、模块管理 |
| 风水深化 | ✅ | 24山、玄空飞星、指南针 |
| 性能优化 | ✅ | Service Worker |
| 首次使用引导 | ✅ | 分步引导系统 |

### v5.0 未实现的功能

v5.0 规划中的所有功能都已完成，没有遗留未实现的功能。

---

## 🎯 v6.0 版本定位

### 版本口号
**「智能进化，云端互联，生态完善」**

### 核心目标
1. **AI 增强**：更智能的命理分析
2. **云端同步**：多设备数据同步
3. **新模块开发**：六壬、太乙等传统命理
4. **生态完善**：社区、分享、插件系统

### 版本拆分

| 子版本 | 重点 | 预计周期 | 核心功能 |
|--------|------|----------|----------|
| **v6.0** | AI增强 + 六壬 | 3周 | AI上下文、提示词优化、六壬模块 |
| **v6.1** | 太乙神数 + 云端同步 | 3周 | 太乙模块、数据同步、冲突解决 |
| **v6.2** | 生态完善 | 2周 | 社区功能、插件系统、高级分析 |

**总周期**：约 8 周

---

## 📦 v6.0 功能规划

### 🥇 优先级 P0（必做）

#### 1. AI 增强系统

**目标**：让 AI 分析更智能、更准确、更个性化

**功能清单**：

- **上下文管理器**
  - 自动注入八字信息到 AI 上下文
  - 自动注入六爻卦象信息
  - 自动注入紫微星盘信息
  - 自动注入奇门遁甲排盘
  - 记忆历史对话（短期记忆，最近 10 轮）

- **提示词优化**
  - 针对不同模块的专业提示词
  - 八字模块：强调五行平衡、十神关系
  - 六爻模块：强调卦象、动爻、变卦
  - 紫微模块：强调星曜组合、四化飞星
  - 奇门模块：强调格局、用事、方位
  - 结构化输出格式（段落 + 列表 + 建议）

- **多模型支持**
  - Gemini Pro（高质量，较慢）
  - Gemini Flash（快速，性价比高）
  - 本地模型（Ollama，离线可用）
  - 模型性能对比和自动切换

- **流式输出**
  - 打字机效果（逐字显示）
  - 实时显示推理过程
  - 可中断生成（停止按钮）
  - 输出进度指示器

**技术方案**：
```javascript
class AIContextManager {
    constructor() {
        this.context = {};
        this.history = [];
        this.maxHistory = 10;
    }

    // 注入模块上下文
    injectContext(module, data) {
        this.context[module] = data;
    }

    // 生成系统提示词
    generateSystemPrompt(module) {
        const basePrompt = this.getBasePrompt();
        const modulePrompt = this.getModulePrompt(module);
        const contextPrompt = this.getContextPrompt(module);
        return `${basePrompt}\n\n${modulePrompt}\n\n${contextPrompt}`;
    }

    // 发送消息（流式）
    async sendMessageStream(userMessage, module, onChunk) {
        const systemPrompt = this.generateSystemPrompt(module);
        const messages = this.formatMessages(userMessage);

        const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt, messages })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            onChunk(chunk);
        }
    }
}
```

**UI 设计**：
- 对话界面优化
- 打字机效果动画
- 输出格式美化（Markdown 渲染）
- 模型切换下拉框
- 停止生成按钮

---

#### 2. 六壬模块

**目标**：开发大六壬排盘系统

**功能清单**：

- **时家六壬排盘**
  - 月将计算
  - 贵人定位
  - 四课排布（日干、日支、干上神、支上神）
  - 三传排布（初传、中传、末传）
  - 天盘排布

- **十二天将**
  - 贵人、腾蛇、朱雀、六合、勾陈、青龙
  - 天空、白虎、太常、玄武、太阴、天后
  - 每个天将的五行、吉凶、象征

- **课体格局**
  - 贼克课、比用课、涉害课
  - 遥克课、昴星课、别责课
  - 八专课、伏吟课、返吟课
  - 格局详解和用事建议

- **用事指导**
  - 选择事项（出行、求财、嫁娶、诉讼等）
  - 推荐吉时吉方
  - 忌时忌方提醒

**数据结构**：
```javascript
const LIUREN_SYSTEM = {
    // 十二天将
    generals: [
        { name: '贵人', wuxing: '土', nature: '吉', desc: '主权威、贵人、化解' },
        { name: '腾蛇', wuxing: '火', nature: '凶', desc: '主惊恐、怪异、虚假' },
        // ... 共 12 个
    ],

    // 四课
    fourLessons: {
        dayGan: '日干',
        dayZhi: '日支',
        ganShangShen: '干上神',
        zhiShangShen: '支上神'
    },

    // 三传
    threeTransmission: {
        chu: '初传',
        zhong: '中传',
        mo: '末传'
    },

    // 课体格局
    patterns: [
        { name: '贼克课', condition: '...', desc: '主取用、获取' },
        { name: '比用课', condition: '...', desc: '主比较、选择' },
        // ... 共 9 种课体
    ]
};

// 六壬排盘主函数
function calculateLiuren(year, month, day, hour) {
    // 1. 起月将
    const monthGeneral = getMonthGeneral(month);

    // 2. 起贵人
    const noblePerson = getNoblePerson(year, month, day, hour);

    // 3. 排四课
    const fourLessons = arrangeFourLessons(year, month, day, hour);

    // 4. 起三传
    const threeTransmission = getThreeTransmission(fourLessons);

    // 5. 排天盘
    const heavenPlate = arrangeHeavenPlate(monthGeneral, noblePerson);

    // 6. 判断课体
    const pattern = identifyPattern(fourLessons, threeTransmission);

    return {
        year, month, day, hour,
        monthGeneral,
        noblePerson,
        fourLessons,
        threeTransmission,
        heavenPlate,
        pattern,
    };
}
```

**UI 设计**：
- 四课三传表格展示
- 天盘十二宫展示
- 格局高亮显示
- 用事建议面板

**预计代码量**：~1000 行

---

### 🥈 优先级 P1（重要）

#### 3. 太乙神数模块

**目标**：开发太乙神数排盘系统

**功能清单**：

- **太乙积年计算**
  - 计算太乙积年数
  - 定太乙宫位
  - 定计神宫位

- **三基五福**
  - 君基、臣基、民基
  - 君福、臣福、民福
  - 各星的吉凶和象征

- **十六宫排布**
  - 十二地支宫
  - 四维宫（乾、坤、艮、巽）
  - 太乙、计神、文昌、始击的排布

- **格局判断**
  - 吉格：太乙临宫、文昌临宫等
  - 凶格：太乙入墓、计神落空等
  - 用事建议

**数据结构**：
```javascript
const TAIYI_SYSTEM = {
    // 太乙九宫
    palaces: [
        { name: '太乙', wuxing: '火', desc: '主君王、权威' },
        { name: '摄提', wuxing: '木', desc: '主权臣、辅佐' },
        // ... 共 9 宫
    ],

    // 三基
    sanji: ['君基', '臣基', '民基'],

    // 五福
    wufu: ['君福', '臣福', '民福'],

    // 十六宫
    sixteenPalaces: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未',
                     '申', '酉', '戌', '亥', '乾', '坤', '艮', '巽'],
};

// 太乙排盘
function calculateTaiyi(year) {
    // 1. 计算太乙积年
    const jiYear = calculateJiYear(year);

    // 2. 定太乙宫位
    const taiyiPosition = calculateTaiyiPosition(jiYear);

    // 3. 定计神宫位
    const jishenPosition = calculateJishenPosition(jiYear);

    // 4. 定文昌、始击
    const wenchang = calculateWenchang(jiYear);
    const shiji = calculateShiji(jiYear);

    // 5. 定三基五福
    const sanji = calculateSanji(jiYear);
    const wufu = calculateWufu(jiYear);

    return {
        year, jiYear,
        taiyiPosition, jishenPosition,
        wenchang, shiji,
        sanji, wufu,
    };
}
```

**预计代码量**：~800 行

---

#### 4. 云端同步系统

**目标**：支持多设备数据同步，数据不丢失

**功能清单**：

- **用户认证**
  - 邮箱注册/登录
  - 社交登录（微信、QQ）
  - 游客模式（本地存储）

- **数据同步**
  - 自动同步（每 5 分钟）
  - 手动同步按钮
  - 同步状态显示
  - 冲突解决（时间戳优先 + 手动选择）

- **同步范围**
  - 历史记录
  - 用户设置
  - 八字缓存
  - 收藏内容

- **离线支持**
  - 离线模式可用
  - 联网后自动同步
  - 同步队列管理

**技术方案**：
```javascript
class CloudSyncManager {
    constructor() {
        this.userId = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.lastSyncTime = null;
    }

    // 初始化
    async init() {
        // 检查登录状态
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.userId = await this.verifyToken(token);
        }

        // 监听网络状态
        window.addEventListener('online', () => this.onOnline());
        window.addEventListener('offline', () => this.onOffline());

        // 启动自动同步
        this.startAutoSync();
    }

    // 同步到云端
    async syncToCloud() {
        const data = this.collectLocalData();
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify({
                userId: this.userId,
                data: data,
                timestamp: Date.now()
            })
        });

        if (response.ok) {
            this.lastSyncTime = Date.now();
            this.showSyncStatus('同步成功');
        }
    }

    // 从云端恢复
    async restoreFromCloud() {
        const response = await fetch(`/api/restore/${this.userId}`, {
            headers: { 'Authorization': `Bearer ${this.getToken()}` }
        });

        const data = await response.json();
        this.restoreToLocal(data);
    }

    // 冲突解决
    async resolveConflict(localData, cloudData) {
        // 策略1：时间戳优先
        if (localData.timestamp > cloudData.timestamp) {
            return localData;
        }

        // 策略2：手动选择
        return await this.showConflictDialog(localData, cloudData);
    }
}
```

**UI 设计**：
- 登录/注册界面
- 同步状态指示器
- 同步历史记录
- 冲突解决对话框

**后端需求**：
- 用户认证 API
- 数据同步 API
- 冲突解决 API
- 数据存储（PostgreSQL/MySQL）

**预计代码量**：前端 ~600 行，后端 ~1000 行

---

### 🥉 优先级 P2（优化）

#### 5. 性能优化（深化）

**功能清单**：

- **代码分割**
  - 模块按需加载（动态 import）
  - 首屏只加载核心模块
  - 预加载常用模块

- **Canvas 优化**
  - 金沙粒子动画优化
  - 低帧率设备降级
  - 移动端优化

- **图片优化**
  - WebP 格式优先
  - 图片懒加载
  - 响应式图片

- **缓存策略**
  - LocalStorage 数据压缩
  - IndexedDB 大数据存储
  - 缓存清理策略

---

#### 6. 可访问性优化

**功能清单**：

- **ARIA 标签**
  - 所有交互元素添加 aria-label
  - 动态内容添加 aria-live
  - 表单元素关联 label

- **键盘导航**
  - 所有按钮可聚焦
  - Tab 顺序合理
  - 快捷键支持

- **屏幕阅读器**
  - 图片 alt 文本
  - 图表文字描述
  - 动画暂停选项

- **视觉辅助**
  - 高对比度模式
  - 大字体模式
  - 色盲友好配色

---

#### 7. 社区功能

**功能清单**：

- **分享社区**
  - 用户分享命盘到社区
  - 点赞、评论、收藏
  - 热门命盘排行

- **学习资料**
  - 命理知识库
  - 视频教程
  - 名师讲座

- **互动功能**
  - 命理论坛
  - 问答系统
  - 名师一对一（付费）

---

#### 8. 插件系统

**功能清单**：

- **插件架构**
  - 插件注册机制
  - 插件生命周期管理
  - 插件 API 文档

- **官方插件**
  - 八字高级分析插件
  - 紫微斗数高级插件
  - 风水高级插件

- **第三方插件**
  - 插件市场
  - 插件审核机制
  - 插件开发者文档

---

## 📅 开发时间表

### 第一阶段：AI 增强 + 六壬（v6.0）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 1 | AI 上下文管理器 | 24h |
| Week 1 | 提示词优化 | 16h |
| Week 2 | 流式输出实现 | 24h |
| Week 2 | 多模型支持 | 16h |
| Week 3 | 六壬核心算法 | 32h |
| Week 3 | 六壬 UI 界面 | 24h |

**小计**：136 小时

### 第二阶段：太乙神数 + 云端同步（v6.1）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 4 | 太乙神数算法 | 32h |
| Week 5 | 太乙 UI 界面 | 24h |
| Week 5 | 用户认证系统 | 32h |
| Week 6 | 数据同步逻辑 | 32h |
| Week 6 | 冲突解决机制 | 16h |

**小计**：136 小时

### 第三阶段：生态完善（v6.2）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 7 | 社区功能基础 | 40h |
| Week 7 | 插件系统架构 | 32h |
| Week 8 | 性能优化 | 24h |
| Week 8 | 可访问性优化 | 24h |

**小计**：120 小时

**总计**：~392 小时（8 周全职开发）

---

## 📦 技术依赖

### 新增依赖

**前端**：
```json
{
    "dependencies": {
        "react": "^18.2.0",           // 可选，用于复杂 UI
        "react-dom": "^18.2.0",       // 可选
        "firebase": "^10.7.0",        // 云端同步（可选）
        "socket.io-client": "^4.7.0"  // 实时同步
    }
}
```

**后端**（如果自建）：
```json
{
    "dependencies": {
        "express": "^4.18.2",
        "pg": "^8.11.0",              // PostgreSQL
        "redis": "^4.6.0",            // 缓存
        "jsonwebtoken": "^9.0.0",     // JWT 认证
        "bcryptjs": "^2.4.3"          // 密码加密
    }
}
```

### CDN 引入

```html
<!-- Firebase SDK（可选） -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
```

---

## 🎨 UI 设计规范

### v6.0 新增设计元素

#### AI 对话界面优化

```css
/* 打字机效果 */
.typing-cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    background: #D4AF37;
    animation: blink 0.7s infinite;
    margin-left: 2px;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

/* 流式输出动画 */
.stream-output {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
```

#### 六壬界面

```css
/* 四课三传表格 */
.liuren-table {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    background: rgba(10, 10, 12, 0.6);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 12px;
    padding: 16px;
}

.liuren-cell {
    text-align: center;
    padding: 12px 8px;
    background: rgba(20, 18, 14, 0.9);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 8px;
}
```

#### 云端同步状态

```css
/* 同步状态指示器 */
.sync-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(10, 10, 12, 0.8);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 20px;
    font-size: 0.82rem;
}

.sync-status.syncing {
    border-color: rgba(80, 227, 194, 0.5);
    color: #50E3C2;
}

.sync-status.synced {
    border-color: rgba(59, 156, 122, 0.5);
    color: #3B9C7A;
}

.sync-status.error {
    border-color: rgba(199, 62, 58, 0.5);
    color: #e86b6b;
}
```

---

## 📈 预期效果

### 用户价值

- **更智能的 AI**：上下文感知，个性化分析
- **更完整的命理**：六壬、太乙等传统命理
- **数据安全**：云端备份，多设备同步
- **更好的体验**：流式输出，性能优化

### 技术价值

- **架构升级**：云端架构，可扩展性更强
- **性能提升**：代码分割，加载更快
- **可访问性**：支持更多用户群体
- **生态建设**：插件系统，社区功能

### 业务价值

- **用户增长**：云端同步吸引多设备用户
- **用户留存**：社区功能增加粘性
- **商业化**：高级功能付费，插件市场
- **品牌影响力**：专业命理系统

---

## 🔄 版本演进路线

```
v5.0 (当前)
    ↓
v6.0 - AI增强 + 六壬模块
    ↓
v6.1 - 太乙神数 + 云端同步
    ↓
v6.2 - 生态完善（社区、插件）
    ↓
v7.0 - 移动端 App + 更多新模块
```

---

## ✅ 完成标准

### 功能完整性

- [ ] AI 上下文管理器工作正常
- [ ] 流式输出无卡顿
- [ ] 六壬排盘准确
- [ ] 太乙排盘准确
- [ ] 云端同步稳定
- [ ] 冲突解决正确
- [ ] 社区功能可用
- [ ] 插件系统可用

### 性能指标

- [ ] 首屏加载时间 < 2 秒
- [ ] AI 响应时间 < 3 秒
- [ ] 同步延迟 < 5 秒
- [ ] 代码覆盖率 > 80%

### 质量标准

- [ ] 0 个严重 bug
- [ ] 所有新代码有 JSDoc 注释
- [ ] 单元测试覆盖率 > 70%
- [ ] 文档完整

---

## 📝 文档更新计划

### 需要更新的文档

- `PROJECT_DOCUMENTATION.md` - 添加新功能说明
- `DEPLOYMENT_GUIDE.md` - 添加后端部署说明
- `CHANGELOG.md` - 记录 v6.0 更新

### 新增文档

- `AI_GUIDE.md` - AI 功能使用指南
- `LIUREN_GUIDE.md` - 六壬使用指南
- `TAIYI_GUIDE.md` - 太乙神数使用指南
- `CLOUD_SYNC_GUIDE.md` - 云端同步指南
- `PLUGIN_DEVELOPMENT.md` - 插件开发文档
- `API_DOCUMENTATION.md` - 后端 API 文档

---

## 🎯 总结

v6.0 将是一个重要的升级版本，重点在于：

1. **AI 智能化**：上下文感知、流式输出、多模型支持
2. **命理完善**：六壬、太乙等传统命理模块
3. **云端互联**：多设备同步、数据安全
4. **生态建设**：社区、插件、商业化

这将使乾坤易道从一个本地应用升级为一个完整的云端命理分析平台。

---

**规划人**：Claude Assistant
**规划日期**：2026-06-25
**预计完成**：2026-08-20（8 周后）
