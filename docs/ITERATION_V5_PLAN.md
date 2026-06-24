# 乾坤易道 v5.0 版本迭代方案

> 周易数理命理智能分析系统 · 功能深化与体验升级
> 规划日期：2026-06-24
> 基于：v4.0 已完成功能（11/25，44%）

---

## 📊 v5.0 版本定位

**核心目标**：完善数据管理能力，开发重要新模块，提升用户体验

**版本口号**：「数据通达，遁甲归真，玄空飞星」

**预计工期**：2-3 周（可根据优先级灵活调整）

---

## 🎯 v5.0 重点功能（按优先级）

### 🥇 优先级 P0（必做）

#### 1. 数据导出与备份系统
**目标**：让用户能够导出、备份、分享命理分析结果

**功能清单**：
- **PDF 导出**（全局）
  - 八字命盘精排版 PDF（使用 jsPDF + html2canvas）
  - 合婚/合盘报告 PDF
  - 紫微斗数星盘 PDF
  - 支持自定义封面、页眉页脚
  - 支持水印和品牌标识

- **JSON 备份**（全局）
  - 一键导出所有 localStorage 数据
  - 支持选择性导出（按模块）
  - 支持导入恢复数据
  - 数据版本兼容性处理

- **分享链接**（全局）
  - 八字排盘结果生成压缩编码 URL
  - 紫微斗数星盘分享链接
  - 分享页面独立渲染（无需登录）
  - 链接过期时间设置

**技术方案**：
```javascript
// PDF 导出示例
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function exportToPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  html2canvas(element).then(canvas => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save(filename || '命理分析.pdf');
  });
}

// JSON 备份示例
function exportAllData() {
  const data = {
    version: '5.0',
    exportTime: new Date().toISOString(),
    bazi: localStorage.getItem('bazi_input_cache'),
    history: localStorage.getItem('qky_global_history_v1'),
    settings: localStorage.getItem('user_settings'),
    // ... 其他数据
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `乾坤易道备份_${new Date().toLocaleDateString()}.json`;
  a.click();
}
```

**UI 设计**：
- 每个模块结果页面添加「导出」按钮（PDF / 图片 / 复制）
- 全局设置中添加「数据管理」入口
- 历史记录页面支持批量导出

---

#### 2. 奇门遁甲模块
**目标**：开发完整的奇门遁甲排盘系统

**功能清单**：
- **时家奇门排盘**
  - 天盘（九星）
  - 地盘（九宫）
  - 人盘（八门）
  - 神盘（八神）
  - 值符、值使定位

- **九宫格展示**
  - 复用风水九宫组件
  - 每宫显示：天盘星、地盘干、人门、神煞
  - 用颜色区分吉凶

- **格局判断**
  - 吉格识别（天遁、地遁、人遁等）
  - 凶格识别（悖格、反吟、伏吟等）
  - 格局详解与建议

- **用事指导**
  - 选择事项（出行、求财、嫁娶等）
  - 推荐吉时吉方
  - 忌时忌方提醒

**技术实现**：
```javascript
// 奇门遁甲数据结构
const QIMEN_DATA = {
  // 九星
  stars: ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'],
  // 八门
  doors: ['休门', '死门', '伤门', '杜门', '开门', '惊门', '生门', '景门'],
  // 八神
  spirits: ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'],
  // 九宫
  palaces: ['坎一宫', '坤二宫', '震三宫', '巽四宫', '中五宫', '乾六宫', '兑七宫', '艮八宫', '离九宫'],
};

// 排盘核心函数
function calculateQimen(year, month, day, hour) {
  // 1. 定局（阴遁/阳遁，几局）
  // 2. 定值符、值使
  // 3. 排天盘
  // 4. 排地盘
  // 5. 排人盘
  // 6. 排神盘
  // 7. 判断格局
  return {
    year, month, day, hour,
    ju: '阳遁三局', // 局数
    zhifu: '天冲', // 值符
    zhishi: '伤门', // 值使
    heavenPlate: [...], // 天盘
    earthPlate: [...], // 地盘
    humanPlate: [...], // 人盘
    spiritPlate: [...], // 神盘
    patterns: [...], // 格局
    advice: {...}, // 建议
  };
}
```

**UI 设计**：
- 九宫格布局（复用风水九宫组件）
- 每宫多层显示（天盘、地盘、人门、神）
- 格局高亮显示（吉格绿色、凶格红色）
- 底部显示用事建议

**预计代码量**：~800 行（含数据）

---

### 🥈 优先级 P1（重要）

#### 3. 用户偏好设置中心
**目标**：提供个性化的应用设置

**功能清单**：
- **主题设置**
  - 暗色/亮色主题切换
  - 自定义主题色（金色/朱红/翡翠绿）
  - 字体大小调节（小/中/大/特大）

- **AI 模型配置**
  - 默认 AI 模型选择（Gemini/本地）
  - 代理地址配置
  - API Key 管理（加密存储）

- **模块管理**
  - 模块显示/隐藏开关
  - 模块排序（拖拽排序）
  - 默认首页设置

- **数据管理**
  - 自动备份开关
  - 备份频率设置
  - 导入/导出设置

- **交互设置**
  - 音效开关
  - 震动开关
  - 手势灵敏度调节
  - 自动保存开关

**UI 设计**：
- 侧边栏或独立页面
- 分组展示（主题、AI、模块、数据、交互）
- 实时预览效果
- 一键恢复默认

---

#### 4. 风水模块深化
**目标**：提升风水罗盘精度，增加玄空飞星

**功能清单**：
- **24 山方位细分**
  - 将 8 方位扩展为 24 山（每山 15°）
  - 显示每山的五行属性
  - 标注吉凶方位

- **玄空飞星模块**
  - 九运飞星排盘
  - 年飞星、月飞星
  - 飞星组合吉凶判断
  - 与八宅互补分析

- **指南针 API 集成**
  - 使用 DeviceOrientationEvent
  - 实时显示方位角度
  - 支持校准功能
  - 移动端优先，桌面端模拟

**技术实现**：
```javascript
// 24山数据
const MOUNTAINS_24 = [
  { name: '壬', degree: 337.5, wuxing: '水',吉凶: '吉' },
  { name: '子', degree: 0, wuxing: '水',吉凶: '吉' },
  { name: '癸', degree: 22.5, wuxing: '水',吉凶: '吉' },
  { name: '丑', degree: 45, wuxing: '土',吉凶: '凶' },
  // ... 共24山
];

// 玄空飞星
const FEIXING = {
  // 九运飞星轨迹
  orbits: {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9], // 一运
    2: [2, 3, 4, 5, 6, 7, 8, 9, 1], // 二运
    // ... 九运
  },
  // 飞星组合吉凶
  combinations: {
    '16': { level: '上吉', desc: '一六共宗，主科名、文昌' },
    '25': { level: '大凶', desc: '二五交加，主疾病、损丁' },
    // ... 更多组合
  }
};

// 指南针 API
function initCompass() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientationabsolute', (e) => {
      const alpha = e.alpha; // 0-360度
      const mountain = getMountainByDegree(alpha);
      updateCompassUI(alpha, mountain);
    });
  }
}
```

---

### 🥉 优先级 P2（优化）

#### 5. 性能优化
**目标**：提升应用加载速度和运行流畅度

**优化清单**：
- **模块按需加载**
  - 使用动态 `import()` 实现代码分割
  - 首屏只加载核心模块
  - 其他模块懒加载

- **Canvas 性能优化**
  - 金沙粒子动画节流（requestAnimationFrame）
  - 低帧率降级方案（30fps → 15fps）
  - 移动端降低粒子数量

- **图片资源优化**
  - WebP 格式优先
  - 响应式图片加载
  - 图片懒加载

- **缓存策略**
  - Service Worker 缓存静态资源
  - 离线访问支持
  - 版本更新提示

**技术方案**：
```javascript
// 模块按需加载
async function loadModule(moduleName) {
  try {
    const module = await import(`./js/${moduleName}.js`);
    module.init();
  } catch (err) {
    console.error(`模块 ${moduleName} 加载失败:`, err);
    showToast(`模块加载失败，请刷新重试`, 3000);
  }
}

// Canvas 性能优化
let lastFrameTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function animate(currentTime) {
  if (currentTime - lastFrameTime >= frameInterval) {
    updateParticles();
    lastFrameTime = currentTime;
  }
  requestAnimationFrame(animate);
}
```

---

#### 6. 可访问性优化
**目标**：让残障用户也能使用应用

**优化清单**：
- **ARIA 标签补全**
  - 所有交互元素添加 aria-label
  - 动态内容添加 aria-live
  - 表单元素关联 label

- **键盘导航支持**
  - 所有按钮和链接可聚焦
  - Tab 顺序合理
  - 快捷键支持（如 Esc 关闭弹窗）

- **屏幕阅读器兼容**
  - 图片添加 alt 文本
  - 图表提供文字描述
  - 动画提供暂停选项

- **视觉辅助**
  - 高对比度模式
  - 大字体模式
  - 色盲友好配色

---

#### 7. 首次使用引导
**目标**：帮助新用户快速上手

**功能清单**：
- **欢迎页面**
  - 简短的产品介绍
  - 核心功能展示
  - 快速上手指引

- **模块引导**
  - 每个模块首次使用时显示引导
  - 高亮关键按钮和输入框
  - 提供操作示例

- **快速提示**
  - 工具提示（Tooltip）
  - 操作反馈动画
  - 帮助文档链接

---

## 📅 开发计划

### 第一周：数据管理 + 奇门遁甲
| 天数 | 任务 | 优先级 | 预计工时 |
|------|------|--------|----------|
| Day 1-2 | PDF 导出功能（jsPDF + html2canvas） | P0 | 16h |
| Day 3 | JSON 备份/恢复功能 | P0 | 8h |
| Day 4-5 | 奇门遁甲核心算法 | P0 | 16h |
| Day 6-7 | 奇门遁甲 UI 界面 | P0 | 16h |

### 第二周：用户设置 + 风水深化
| 天数 | 任务 | 优先级 | 预计工时 |
|------|------|--------|----------|
| Day 1-2 | 用户偏好设置中心 | P1 | 16h |
| Day 3-4 | 风水 24 山方位 | P1 | 16h |
| Day 5-6 | 玄空飞星模块 | P1 | 16h |
| Day 7 | 指南针 API 集成 | P1 | 8h |

### 第三周：优化 + 测试
| 天数 | 任务 | 优先级 | 预计工时 |
|------|------|--------|----------|
| Day 1-2 | 性能优化（按需加载、Canvas） | P2 | 16h |
| Day 3-4 | 可访问性优化 | P2 | 16h |
| Day 5 | 首次使用引导 | P2 | 8h |
| Day 6-7 | 测试、Bug 修复、文档更新 | - | 16h |

---

## 📦 技术依赖

### 新增依赖
```json
{
  "dependencies": {
    "jspdf": "^2.5.1",           // PDF 生成
    "html2canvas": "^1.4.1",     // HTML 转 Canvas
    "lz-string": "^1.5.0"        // 数据压缩（分享链接）
  }
}
```

### CDN 引入（可选）
```html
<!-- PDF 导出 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

---

## 🎨 UI 设计规范

### v5.0 新增设计元素

#### 导出按钮样式
```css
.export-btn-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08));
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-gold);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.export-btn:hover {
  background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.15));
  border-color: var(--border-hover);
  transform: translateY(-2px);
}
```

#### 奇门遁甲九宫格
```css
.qimen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 8px;
}
.qimen-cell {
  background: rgba(10,10,12,0.6);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  position: relative;
}
.qimen-cell.ji { border-color: var(--jade-green); }
.qimen-cell.xiong { border-color: var(--cinnabar-red); }
```

---

## 📈 预期效果

### 用户价值
- **数据管理**：用户可导出、备份、分享命理分析结果
- **新功能**：奇门遁甲完善传统命理体系
- **个性化**：用户可根据偏好自定义应用
- **专业性**：风水模块精度提升，满足专业用户需求

### 技术价值
- **性能**：加载速度提升 30%，运行更流畅
- **可访问性**：支持更多用户群体
- **可维护性**：代码结构更清晰，易于扩展

### 业务价值
- **用户留存**：数据导出增加用户粘性
- **口碑传播**：分享链接带来新用户
- **专业认可**：奇门遁甲提升系统专业度

---

## 🔄 版本演进路线

```
v4.0 (当前) → v5.0 (规划中) → v6.0 (未来)
    ↓              ↓              ↓
 11/25 功能     完善数据管理     更多新模块
 44% 完成度     + 奇门遁甲      + AI 增强
                + 风水深化      + 云端同步
                + 用户设置      + 社交功能
```

---

## ✅ 完成标准

### 功能完整性
- [ ] PDF 导出支持所有主要模块
- [ ] JSON 备份/恢复功能正常
- [ ] 奇门遁甲排盘准确
- [ ] 用户设置保存/加载正常
- [ ] 风水 24 山显示正确
- [ ] 玄空飞星计算准确
- [ ] 指南针 API 工作正常

### 性能指标
- [ ] 首屏加载时间 < 3 秒
- [ ] 模块切换延迟 < 300ms
- [ ] Canvas 动画帧率 ≥ 30fps

### 质量标准
- [ ] 所有新代码有 JSDoc 注释
- [ ] 单元测试覆盖率 > 70%
- [ ] 无严重 Bug
- [ ] 文档完整

---

## 📝 文档更新

### 需要更新的文档
- `PROJECT_DOCUMENTATION.md` - 添加新功能说明
- `DEPLOYMENT_GUIDE.md` - 添加新依赖说明
- `CHANGELOG.md` - 记录 v5.0 更新
- `ITERATION_PLAN.md` - 更新为 v5.0 方案

### 新增文档
- `PDF_EXPORT_GUIDE.md` - PDF 导出使用指南
- `QIMEN_GUIDE.md` - 奇门遁甲使用指南
- `FENGSHUI_ADVANCED.md` - 高级风水功能指南

---

**规划人**：Claude Assistant  
**规划日期**：2026-06-24  
**预计发布**：2026-07-15（可根据实际情况调整）
