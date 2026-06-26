# 乾坤易道 v7.0 版本迭代规划

> 周易数理命理智能分析系统 · 移动优先 · 数据可视化
> 规划日期：2026-06-25
> 更新日期：2026-06-25（基于实际情况调整）
> 基于：v6.0 完成状态

---

## 📊 v6.0 完成情况回顾

### 已完成的功能（4/4）

| 功能 | 状态 | 说明 |
|------|------|------|
| AI 增强系统 | ✅ | 上下文管理、流式输出、多模型、测试连接 |
| 大六壬模块 | ✅ | 月将、贵人、四课、三传 |
| 太乙神数模块 | ✅ | 太乙积年、三基五福 |
| 云端同步系统 | ✅ | 用户认证、数据同步、冲突解决 |

### v5.0 已实现的功能（更新状态）

| 功能 | 状态 | 说明 |
|------|------|------|
| 语音输入 | ✅ | Web Speech API 集成 |
| 数据导出 | ✅ | PDF、JSON、分享链接 |
| 手势操作 | ✅ | 左右滑动切换模块 |

### 当前项目规模

- **代码量**：15,500+ 行
- **功能模块**：15 个
- **核心功能**：50+

---

## 🎯 v7.0 版本定位

### 版本口号
**「移动优先，数据可视，体验升级」**

### 核心目标
1. **移动体验**：PWA 支持，离线优先，原生体验
2. **数据可视化**：图表分析，直观展示命理结果
3. **性能优化**：加载更快，响应更流畅
4. **报告生成**：专业级命理分析报告

### 版本拆分

| 子版本 | 重点 | 预计周期 | 核心功能 |
|--------|------|----------|----------|
| **v7.0** | PWA + 数据可视化 | 4 周 | PWA配置、Chart.js图表、五行雷达图 |
| **v7.1** | 高级报告 + 可访问性 | 3 周 | 专业报告生成、ARIA标签、键盘导航 |
| **v7.2** | AI进化 + 性能优化 | 3 周 | 本地模型、语音交互、代码分割 |

**总周期**：约 10 周（原 11 周，移除社区功能后缩短）

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

- **原生体验**
  - 全屏模式
  - 自定义启动画面
  - 应用内导航
  - 安全区域适配（刘海屏）

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
        { "src": "/assets/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/assets/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
}
```

**UI 设计**：
- 安装提示弹窗（底部滑出）
- 离线状态指示器
- 更新提示

---

#### 2. 数据可视化（Chart.js）

**目标**：用图表直观展示命理分析结果

**功能清单**：

- **五行分布图**
  - 雷达图展示金木水火土分布
  - 动态数据绑定
  - 交互式图表（点击查看详情）

- **大运流年时间轴**
  - 折线图展示运势走势
  - 标注关键节点（转折点）
  - 悬停显示详细信息

- **十神关系图**
  - 饼图展示十神分布
  - 柱状图对比旺衰

- **运势对比图**
  - 多人八字对比
  - 合婚五行互补分析

**技术方案**：
```javascript
// Chart.js 雷达图
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
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 40,
                ticks: { stepSize: 10, color: '#A2A2AC' },
                grid: { color: 'rgba(212, 175, 55, 0.1)' },
                pointLabels: { color: '#F5F0E8', font: { size: 14, family: 'Noto Serif SC' } }
            }
        },
        plugins: {
            legend: { labels: { color: '#F5F0E8' } }
        }
    }
});
```

**UI 设计**：
- 图表卡片组件
- 加载状态动画
- 数据筛选控件
- 导出图表（PNG/SVG）

---

#### 3. 移动端优化

**目标**：优化移动端的交互体验

**功能清单**：

- **触摸优化**
  - 按钮大小优化（最小 44px）
  - 触摸反馈动画
  - 防误触机制
  - 滚动优化（惯性滚动）

- **性能优化**
  - 图片懒加载
  - 虚拟滚动（长列表）
  - 动画性能优化（requestAnimationFrame）

- **适配优化**
  - 安全区域适配（刘海屏、底部黑条）
  - 键盘弹出处理
  - 横屏支持（可选）

**技术方案**：
```css
/* 安全区域适配 */
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

#### 4. 高级报告生成

**目标**：生成专业的命理分析报告

**功能清单**：

- **报告模板**
  - 八字详批报告（封面 + 目录 + 详细分析 + 建议）
  - 紫微斗数报告（星盘 + 四化 + 大限 + 总结）
  - 合婚分析报告（双方对比 + 互补分析 + 建议）
  - 流年运势报告（年度运势 + 月度提示）

- **报告内容**
  - 专业封面设计
  - 自动生成目录
  - 详细文字分析
  - 图表配图
  - 调理建议

- **导出格式**
  - PDF 报告（带封面、水印）
  - 图片集（每页一张图）
  - HTML 网页（可分享）

**技术方案**：
```javascript
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

        // 1. 封面
        this.addCover(doc, options.cover);

        // 2. 目录
        this.addTableOfContents(doc, template.chapters);

        // 3. 内容
        for (const chapter of template.chapters) {
            doc.addPage();
            this.addChapter(doc, chapter, data);
        }

        // 4. 水印
        if (options.watermark) {
            this.addWatermark(doc, options.watermark);
        }

        return doc;
    }
}
```

**UI 设计**：
- 报告类型选择
- 个性化选项（封面、水印）
- 生成进度条
- 预览功能

---

#### 5. 可访问性优化

**目标**：让更多人可以使用应用

**功能清单**：

- **ARIA 标签**
  - 所有交互元素添加 aria-label
  - 动态内容添加 aria-live
  - 表单元素关联 label

- **键盘导航**
  - Tab 顺序优化
  - 快捷键支持
  - 焦点管理

- **屏幕阅读器**
  - 图片 alt 文本
  - 图表描述
  - 动画暂停选项

- **视觉辅助**
  - 高对比度模式
  - 大字体模式
  - 色盲模式

---

### 🥉 优先级 P2（优化）

#### 6. AI 进化

**目标**：让 AI 更智能、更个性化

**功能清单**：

- **本地模型支持**
  - Ollama 集成
  - 本地推理
  - 离线 AI
  - 隐私保护

- **智能推荐**
  - 个性化运势推送
  - 基于历史的建议
  - 学习路径推荐

- **AI 教程**
  - 命理知识问答
  - 互动教学
  - 测验评估

**技术方案**：
```javascript
// 本地模型集成（Ollama）
class LocalAI {
    constructor() {
        this.baseUrl = 'http://localhost:11434';
    }

    async init() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            const models = await response.json();
            console.log('可用本地模型:', models);
            return true;
        } catch (err) {
            console.warn('本地 AI 服务未运行');
            return false;
        }
    }

    async chat(message, context = {}) {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2:7b',
                prompt: this.buildPrompt(message, context),
                stream: false
            })
        });
        return await response.json();
    }
}
```

---

## 📅 开发时间表

### 第一阶段：PWA + 数据可视化（v7.0）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 1 | PWA 配置（manifest, icons） | 12h |
| Week 1 | Service Worker 增强 | 12h |
| Week 2 | 安装提示 + 离线支持 | 16h |
| Week 2 | 移动端适配优化 | 12h |
| Week 3 | Chart.js 集成 | 16h |
| Week 3 | 五行雷达图 | 12h |
| Week 4 | 大运流年图表 | 12h |
| Week 4 | 运势对比图表 | 8h |

**小计**：100 小时

### 第二阶段：报告生成 + 可访问性（v7.1）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 5 | 报告模板设计 | 16h |
| Week 5 | PDF 生成引擎 | 16h |
| Week 6 | 八字详批报告 | 12h |
| Week 6 | 紫微斗数报告 | 12h |
| Week 7 | ARIA 标签补全 | 12h |
| Week 7 | 键盘导航 + 可访问性 | 12h |

**小计**：80 小时

### 第三阶段：AI 进化 + 性能优化（v7.2）

| 周数 | 任务 | 预计工时 |
|------|------|----------|
| Week 8 | 本地模型集成（Ollama） | 24h |
| Week 8 | 智能推荐系统 | 16h |
| Week 9 | 代码分割 + 性能优化 | 16h |
| Week 9 | 测试 + 文档 | 16h |

**小计**：72 小时

**总计**：~252 小时（9 周）

---

## 📦 技术依赖

### 新增依赖

**前端**：
```json
{
    "dependencies": {
        "chart.js": "^4.4.0"  // 图表库
    }
}
```

### CDN 引入

```html
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

**注意**：移除了 vue-chartjs（不适用于原生 JS 项目）和 Firebase（需要后端服务）

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
```

#### 图表卡片
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
```

---

## 📈 预期效果

### 用户价值

- **移动优先**：手机原生体验，随时使用
- **数据可视化**：直观易懂，专业呈现
- **专业报告**：一键生成 PDF，分享方便
- **性能提升**：加载更快，响应更流畅

### 技术价值

- **PWA 架构**：现代化，可扩展
- **图表系统**：专业分析，易于理解
- **可访问性**：支持更多用户群体
- **本地 AI**：隐私保护，离线可用

---

## 🔄 版本演进路线

```
v6.0 (当前)
    ↓
v7.0 - PWA + 数据可视化（4周）
    ↓
v7.1 - 报告生成 + 可访问性（3周）
    ↓
v7.2 - AI 进化 + 性能优化（3周）
    ↓
v8.0 - 社区功能 + 原生 App
```

**说明**：社区功能推迟到 v8.0，因为需要后端服务支持，当前纯前端架构难以实现。

---

## ✅ 完成标准

### 功能完整性

- [ ] PWA 可安装到桌面
- [ ] 离线模式可用
- [ ] 五行雷达图正常显示
- [ ] 大运流年图表正常
- [ ] PDF 报告生成正常
- [ ] 可访问性基本支持

### 性能指标

- [ ] 首屏加载时间 < 2 秒
- [ ] 离线加载时间 < 1 秒
- [ ] 图表渲染时间 < 500ms
- [ ] PDF 生成时间 < 5 秒

### 质量标准

- [ ] 0 个严重 bug
- [ ] 所有新代码有 JSDoc 注释
- [ ] 移动端测试通过
- [ ] 文档完整

---

## 📝 文档更新计划

### 需要更新的文档

- `PROJECT_DOCUMENTATION.md` - 添加新功能说明
- `DEPLOYMENT_GUIDE.md` - 添加 PWA 部署说明
- `CHANGELOG.md` - 记录 v7.0 更新

### 新增文档

- `PWA_GUIDE.md` - PWA 配置和使用
- `CHARTS_GUIDE.md` - 数据可视化指南
- `REPORT_GUIDE.md` - 报告生成指南

---

## 🎯 总结

v7.0 将是一个重要的升级版本，重点在于：

1. **移动优先**：PWA 支持，离线优先，原生体验
2. **数据可视化**：Chart.js 图表，直观展示命理结果
3. **专业报告**：PDF 报告生成，一键分享
4. **性能优化**：加载更快，响应更流畅
5. **可访问性**：支持更多用户群体

这将使乾坤易道从一个功能应用升级为一个**专业的移动命理分析平台**。

---

**规划人**：Claude Assistant
**规划日期**：2026-06-25
**预计完成**：2026-09-02（9 周后，原 11 周）
**总工时**：~252 小时
