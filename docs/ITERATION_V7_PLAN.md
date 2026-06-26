# 乾坤易道 v7.0 版本迭代规划

> 周易数理命理智能分析系统 · 移动优先 · 生态完善
> 规划日期：2026-06-25
> 基于：v6.0 完成状态

---

## 📊 v6.0 完成情况回顾

### 已完成的功能（4/4）

| 功能 | 状态 | 说明 |
|------|------|------|
| AI 增强系统 | ✅ | 上下文管理、流式输出、多模型 |
| 大六壬模块 | ✅ | 月将、贵人、四课、三传 |
| 太乙神数模块 | ✅ | 太乙积年、三基五福 |
| 云端同步系统 | ✅ | 用户认证、数据同步、冲突解决 |

### 当前项目规模

- **代码量**：15,473 行
- **功能模块**：15 个
- **核心功能**：50+

---

## 🎯 v7.0 版本定位

### 版本口号
**「移动优先，社区共建，智能进化」**

### 核心目标
1. **移动体验**：PWA 支持，离线优先，原生体验
2. **社区生态**：用户互动，内容分享，知识共建
3. **AI 进化**：本地模型，语音交互，智能推荐
4. **数据可视化**：图表分析，趋势预测，个性化报告

### 版本拆分

| 子版本 | 重点 | 预计周期 | 核心功能 |
|--------|------|----------|----------|
| **v7.0** | PWA + 移动优化 | 3周 | PWA配置、离线支持、手势增强 |
| **v7.1** | 社区功能 | 3周 | 用户主页、内容分享、评论互动 |
| **v7.2** | AI 进化 | 3周 | 本地模型、语音交互、智能推荐 |
| **v7.3** | 数据可视化 | 2周 | 图表分析、趋势预测、报告生成 |

**总周期**：约 11 周

---

## 📦 v7.0 功能规划

### 🥇 优先级 P0（必做）

#### 1. PWA 渐进式Web应用

**目标**：让应用可以安装到手机桌面，支持离线使用

**功能清单**：

- **PWA 配置**
  - Web App Manifest 配置
  - Service Worker 增强
  - 安装提示（添加到主屏幕）
  - 应用图标和启动画面

- **离线优先**
  - 核心功能离线可用
  - 离线数据缓存
  - 联网后自动同步
  - 离线状态提示

- **推送通知**
  - 每日运势提醒
  - 同步状态通知
  - 新功能通知

- **原生体验**
  - 全屏模式
  - 自定义启动画面
  - 应用内导航
  - 返回手势支持

**技术方案**：
```javascript
// manifest.json
{
    "name": "乾坤易道",
    "short_name": "乾坤易道",
    "description": "周易数理命理智能分析系统",
    "start_url": "/index.html",
    "display": "standalone",
    "background_color": "#0A0A0C",
    "theme_color": "#D4AF37",
    "orientation": "portrait",
    "icons": [
        {
            "src": "/assets/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/assets/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}

// Service Worker 增强
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/assets/icon-192.png',
        badge: '/assets/badge-72.png'
    };
    event.waitUntil(
        self.registration.showNotification('乾坤易道', options)
    );
});
```

**UI 设计**：
- 安装提示弹窗
- 离线状态指示器
- 更新提示
- 启动画面

---

#### 2. 移动端优化

**目标**：优化移动端的交互体验

**功能清单**：

- **手势增强**
  - 左右滑动切换模块
  - 下拉刷新
  - 双指缩放（图表）
  - 长按菜单

- **触摸优化**
  - 按钮大小优化（最小 44px）
  - 触摸反馈
  - 防误触
  - 滚动优化

- **性能优化**
  - 图片懒加载
  - 代码分割
  - 虚拟滚动（长列表）
  - 动画性能优化

- **适配优化**
  - 安全区域适配
  - 刘海屏适配
  - 键盘弹出处理
  - 横屏支持

**技术方案**：
```javascript
// 手势增强
class GestureManager {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
    }

    init() {
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.startTime = Date.now();
    }

    onTouchEnd(e) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - this.startX;
        const diffY = endY - this.startY;
        const duration = Date.now() - this.startTime;

        // 判断手势类型
        if (Math.abs(diffX) > Math.abs(diffY) && duration < 300) {
            if (diffX > 50) {
                this.onSwipeRight();
            } else if (diffX < -50) {
                this.onSwipeLeft();
            }
        }
    }
}

// 安全区域适配
@supports (padding-top: env(safe-area-inset-top)) {
    .app-header {
        padding-top: env(safe-area-inset-top);
    }
    .mobile-bottom-nav {
        padding-bottom: env(safe-area-inset-bottom);
    }
}
```

---

### 🥈 优先级 P1（重要）

#### 3. 社区功能

**目标**：建立用户社区，促进内容分享和互动

**功能清单**：

- **用户主页**
  - 个人资料编辑
  - 命盘展示
  - 动态时间线
  - 粉丝/关注

- **内容分享**
  - 命盘分享到社区
  - 分析报告分享
  - 文章/教程发布
  - 话题讨论

- **互动功能**
  - 点赞/收藏
  - 评论/回复
  - 私信功能
  - @提及

- **社区运营**
  - 热门话题
  - 精选内容
  - 专家入驻
  - 活动运营

**数据结构**：
```javascript
// 用户资料
const UserProfile = {
    id: 'user_123',
    username: '易学爱好者',
    avatar: '/avatars/user123.jpg',
    bio: '研究命理10年，擅长八字和紫微',
    followers: 128,
    following: 56,
    posts: 24,
    joinDate: '2024-01-15',
    level: '高级会员',
    badges: ['八字达人', '紫微专家']
};

// 社区帖子
const Post = {
    id: 'post_456',
    userId: 'user_123',
    type: 'bazi_analysis', // bazi_analysis, liuyao_case, article, question
    title: '八字分析：某人生辰八字详解',
    content: '...',
    images: ['/posts/post456_1.jpg'],
    likes: 56,
    comments: 12,
    shares: 8,
    createdAt: '2024-06-25T10:30:00Z',
    tags: ['八字', '命理分析', '五行']
};

// 评论
const Comment = {
    id: 'comment_789',
    postId: 'post_456',
    userId: 'user_789',
    content: '分析得很到位！',
    likes: 5,
    replies: [],
    createdAt: '2024-06-25T11:00:00Z'
};
```

**UI 设计**：
- 社区 Feed 流
- 帖子详情页
- 用户主页
- 评论组件
- 互动按钮

---

#### 4. 数据可视化增强

**目标**：用图表直观展示命理分析结果

**功能清单**：

- **八字可视化**
  - 五行分布雷达图
  - 十神关系网络图
  - 大运流年时间轴
  - 五行旺衰柱状图

- **紫微可视化**
  - 星盘交互图
  - 四化飞星路径图
  - 大限运势曲线
  - 宫位关系图

- **运势可视化**
  - 年度运势折线图
  - 月度运势热力图
  - 吉凶分布饼图
  - 趋势预测图

- **对比分析**
  - 合婚对比图
  - 合盘雷达图
  - 流年对比图
  - 五行互补图

**技术方案**：
```javascript
// Chart.js 配置示例
const wuxingChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['金', '木', '水', '火', '土'],
        datasets: [{
            label: '五行分布',
            data: [20, 25, 15, 30, 10],
            backgroundColor: 'rgba(212, 175, 55, 0.2)',
            borderColor: '#D4AF37',
            borderWidth: 2,
            pointBackgroundColor: '#D4AF37'
        }]
    },
    options: {
        scales: {
            r: {
                beginAtZero: true,
                max: 40,
                ticks: {
                    stepSize: 10,
                    color: '#A2A2AC'
                },
                grid: {
                    color: 'rgba(212, 175, 55, 0.1)'
                },
                pointLabels: {
                    color: '#F5F0E8',
                    font: {
                        size: 14,
                        family: 'Noto Serif SC'
                    }
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#F5F0E8'
                }
            }
        }
    }
});
```

**UI 设计**：
- 图表卡片
- 交互式图表
- 数据筛选
- 导出图表

---

### 🥉 优先级 P2（优化）

#### 5. AI 进化

**目标**：让 AI 更智能、更个性化

**功能清单**：

- **本地模型支持**
  - Ollama 集成
  - 本地推理
  - 离线 AI
  - 隐私保护

- **语音交互**
  - 语音输入
  - 语音输出
  - 语音对话
  - 语音导航

- **智能推荐**
  - 个性化运势推送
  - 基于历史的建议
  - 学习路径推荐
  - 内容推荐

- **AI 教程**
  - 命理知识问答
  - 学习进度跟踪
  - 互动教学
  - 测验评估

**技术方案**：
```javascript
// 本地模型集成
class LocalAI {
    constructor() {
        this.model = null;
        this.isReady = false;
    }

    async init() {
        // 连接 Ollama 服务
        const response = await fetch('http://localhost:11434/api/tags');
        const models = await response.json();
        console.log('可用模型:', models);
    }

    async chat(message, context) {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2:7b',
                prompt: message,
                context: context,
                stream: false
            })
        });
        return await response.json();
    }
}

// 语音交互
class VoiceManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
    }

    init() {
        // 语音识别
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
    }

    startListening(onResult) {
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };
        this.recognition.start();
    }

    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        this.synthesis.speak(utterance);
    }
}
```

---

#### 6. 高级报告生成

**目标**：生成专业的命理分析报告

**功能清单**：

- **报告模板**
  - 八字详批报告
  - 紫微斗数报告
  - 合婚分析报告
  - 流年运势报告

- **报告内容**
  - 封面设计
  - 目录结构
  - 详细分析
  - 图表配图
  - 建议总结

- **导出格式**
  - PDF 报告
  - Word 文档
  - HTML 网页
  - 图片集

- **个性化定制**
  - 报告封面
  - 水印设置
  - 品牌定制
  - 批量生成

**技术方案**：
```javascript
// 报告生成器
class ReportGenerator {
    constructor() {
        this.templates = {
            bazi: BaziReportTemplate,
            ziwei: ZiweiReportTemplate,
            hehun: HehunReportTemplate
        };
    }

    async generatePDF(type, data, options = {}) {
        const template = this.templates[type];
        const doc = new jsPDF();

        // 封面
        this.addCover(doc, options.cover);

        // 目录
        this.addTableOfContents(doc, template.chapters);

        // 内容
        for (const chapter of template.chapters) {
            doc.addPage();
            this.addChapter(doc, chapter, data);
        }

        // 水印
        if (options.watermark) {
            this.addWatermark(doc, options.watermark);
        }

        return doc;
    }

    addChapter(doc, chapter, data) {
        // 标题
        doc.setFontSize(18);
        doc.text(chapter.title, 20, 30);

        // 内容
        doc.setFontSize(12);
        const content = chapter.render(data);
        doc.text(content, 20, 50);

        // 图表
        if (chapter.chart) {
            const chartImage = this.renderChart(chapter.chart, data);
            doc.addImage(chartImage, 'PNG', 20, 100, 170, 100);
        }
    }
}
```

---

#### 7. 可访问性优化

**目标**：让更多人可以使用应用

**功能清单**：

- **ARIA 标签**
  - 所有交互元素
  - 动态内容
  - 表单元素

- **键盘导航**
  - Tab 顺序
  - 快捷键
  - 焦点管理

- **屏幕阅读器**
  - 图片 alt 文本
  - 图表描述
  - 动画控制

- **视觉辅助**
  - 高对比度模式
  - 大字体模式
  - 色盲模式
  - 动画减弱

---

## 📅 开发时间表

### 第一阶段：PWA + 移动优化（v7.0）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 1 | PWA 配置（manifest, icons） | 16h |
| Week 1 | Service Worker 增强 | 16h |
| Week 2 | 离线支持完善 | 16h |
| Week 2 | 推送通知 | 16h |
| Week 3 | 手势增强 | 16h |
| Week 3 | 移动端适配优化 | 16h |

**小计**：96 小时

### 第二阶段：社区功能（v7.1）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 4 | 用户主页 | 24h |
| Week 4 | 社区 Feed | 24h |
| Week 5 | 内容分享 | 24h |
| Week 5 | 评论互动 | 24h |
| Week 6 | 点赞/收藏 | 16h |
| Week 6 | 社区运营功能 | 16h |

**小计**：128 小时

### 第三阶段：AI 进化（v7.2）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 7 | 本地模型集成 | 24h |
| Week 7 | 语音交互 | 24h |
| Week 8 | 智能推荐 | 24h |
| Week 8 | AI 教程 | 24h |
| Week 9 | 语音输出 | 16h |

**小计**：112 小时

### 第四阶段：数据可视化（v7.3）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 10 | 八字可视化 | 24h |
| Week 10 | 紫微可视化 | 24h |
| Week 11 | 运势图表 | 16h |
| Week 11 | 报告生成 | 16h |

**小计**：80 小时

**总计**：~416 小时（11 周）

---

## 📦 技术依赖

### 新增依赖

**前端**：
```json
{
    "dependencies": {
        "chart.js": "^4.4.0",
        "vue-chartjs": "^5.3.0",
        "workbox-webpack-plugin": "^7.0.0",
        "firebase": "^10.7.0"
    }
}
```

### CDN 引入

```html
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
```

---

## 🎨 UI 设计规范

### v7.0 新增设计元素

#### PWA 安装提示
```css
.install-prompt {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: #14141A;
    border: 1px solid rgba(212, 175, 55, 0.5);
    border-radius: 12px;
    padding: 16px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 1000;
    animation: slideUp 0.3s ease;
}

.install-prompt h4 {
    color: #D4AF37;
    margin: 0 0 8px 0;
}

.install-prompt p {
    color: #F5F0E8;
    margin: 0 0 12px 0;
    font-size: 0.88rem;
}

.install-prompt .btn-group {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}
```

#### 社区 Feed
```css
.community-feed {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.post-card {
    background: rgba(20, 18, 14, 0.9);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 12px;
    padding: 16px;
}

.post-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.post-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #D4AF37;
}

.post-username {
    color: #D4AF37;
    font-weight: 600;
}

.post-time {
    color: #A2A2AC;
    font-size: 0.75rem;
}

.post-content {
    color: #F5F0E8;
    line-height: 1.8;
    margin-bottom: 12px;
}

.post-actions {
    display: flex;
    gap: 16px;
    border-top: 1px solid rgba(212, 175, 55, 0.1);
    padding-top: 12px;
}

.post-action {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #A2A2AC;
    font-size: 0.82rem;
    cursor: pointer;
    transition: color 0.2s ease;
}

.post-action:hover {
    color: #D4AF37;
}
```

#### 数据可视化图表
```css
.chart-container {
    background: rgba(20, 18, 14, 0.9);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
}

.chart-title {
    color: #D4AF37;
    font-size: 1rem;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.chart-canvas {
    width: 100%;
    height: 300px;
}

.chart-legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 12px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: #F5F0E8;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
}
```

---

## 📈 预期效果

### 用户价值

- **移动优先**：手机原生体验，随时使用
- **社区互动**：分享交流，学习成长
- **智能 AI**：更懂你，更个性化
- **数据可视化**：直观易懂，专业呈现

### 技术价值

- **PWA 架构**：现代化，可扩展
- **社区系统**：用户粘性，内容生态
- **本地 AI**：隐私保护，离线可用
- **图表系统**：专业分析，易于理解

### 业务价值

- **用户增长**：移动用户，社区传播
- **用户留存**：社区互动，内容沉淀
- **商业化**：高级功能付费，会员体系
- **品牌影响力**：专业命理平台

---

## 🔄 版本演进路线

```
v6.0 (当前)
    ↓
v7.0 - PWA + 移动优化
    ↓
v7.1 - 社区功能
    ↓
v7.2 - AI 进化
    ↓
v7.3 - 数据可视化
    ↓
v8.0 - 原生 App + 更多功能
```

---

## ✅ 完成标准

### 功能完整性

- [ ] PWA 可安装到桌面
- [ ] 离线模式可用
- [ ] 社区功能完整
- [ ] 数据可视化正常
- [ ] AI 本地模型可用
- [ ] 语音交互正常

### 性能指标

- [ ] 首屏加载时间 < 2 秒
- [ ] 离线加载时间 < 1 秒
- [ ] 图表渲染时间 < 500ms
- [ ] AI 响应时间 < 3 秒

### 质量标准

- [ ] 0 个严重 bug
- [ ] 所有新代码有 JSDoc 注释
- [ ] 单元测试覆盖率 > 80%
- [ ] 文档完整

### 可访问性

- [ ] ARIA 标签完整
- [ ] 键盘导航可用
- [ ] 屏幕阅读器兼容
- [ ] 高对比度模式支持

---

## 📝 文档更新计划

### 需要更新的文档

- `PROJECT_DOCUMENTATION.md` - 添加新功能说明
- `DEPLOYMENT_GUIDE.md` - 添加 PWA 部署说明
- `CHANGELOG.md` - 记录 v7.0 更新

### 新增文档

- `PWA_GUIDE.md` - PWA 配置和使用
- `COMMUNITY_GUIDE.md` - 社区功能指南
- `VOICE_GUIDE.md` - 语音交互指南
- `VISUALIZATION_GUIDE.md` - 数据可视化指南
- `REPORT_GUIDE.md` - 报告生成指南

---

## 🎯 总结

v7.0 将是一个重要的升级版本，重点在于：

1. **移动优先**：PWA 支持，离线优先，原生体验
2. **社区生态**：用户互动，内容分享，知识共建
3. **AI 进化**：本地模型，语音交互，智能推荐
4. **数据可视化**：图表分析，趋势预测，专业报告

这将使乾坤易道从一个本地应用升级为一个完整的**移动优先的命理社区平台**。

---

**规划人**：Claude Assistant
**规划日期**：2026-06-25
**预计完成**：2026-09-15（11 周后）
