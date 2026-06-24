# 周易命理系统 - 项目文档

> 版本：v4.0 | 最后更新：2026-06-23

## 项目简介

乾坤易道周易命理系统是一个纯前端的命理分析应用，集成了八字排盘、六爻占卜、黄历择吉、风水罗盘、梅花易数、姓名学、紫微斗数、数字能量学等多种传统命理功能。

## 技术架构

### 技术栈
- **前端框架**: 原生 JavaScript (ES6+ Modules)
- **UI 框架**: 自定义 CSS + 玻璃拟态设计
- **日历库**: lunar-javascript (610KB)
- **图表库**: Chart.js
- **存储**: localStorage
- **部署**: 静态文件托管

### 项目结构
```
zhouyi/
├── index.html              # 主页面入口
├── js/
│   ├── app.js             # 应用入口、全局初始化、手势导航
│   ├── state.js           # 全局状态管理、历史记录系统
│   ├── utils.js           # 工具函数库（五行、手势、UI组件）
│   ├── gua-data.js        # 六十四卦数据
│   ├── bazi.js            # 八字排盘与命理分析（含神煞、流年运势）
│   ├── liuyao.js          # 六爻占卜（含音效、震动反馈）
│   ├── calendar.js        # 黄历择吉（含八字结合）
│   ├── fengshui.js        # 八宅风水罗盘
│   ├── chat.js            # 乾坤问卜（含语音输入）
│   ├── xingming.js        # 姓名五格剖象
│   ├── meihua.js          # 梅花易数
│   ├── hehun.js           # 八字合婚
│   ├── ziwei.js           # 紫微斗数（含四化、大限）
│   ├── hepan.js           # 八字合盘
│   └── shuzi.js           # 数字能量学
├── css/
│   ├── base.css           # 基础样式、主题变量
│   ├── components.css     # 组件样式、动画
│   └── modules.css        # 模块特定样式
└── assets/                # 静态资源
```

## 功能模块

### 1. 八字排盘 (bazi.js)
- **核心功能**: 根据出生年月日时排布四柱八字
- **高级功能**:
  - 十神分析（正印、偏印、正官、七杀等）
  - 五行旺衰分析与雷达图
  - 神煞系统（天乙贵人、文昌贵人、驿马等 8 种）
  - 大运推演
  - 流年运势详批（含本命年、冲太岁检测）
  - 流月运势（12 个月运势）
  - 命理特质与调理建议

### 2. 六爻占卜 (liuyao.js)
- **核心功能**: 模拟摇卦过程，生成六爻卦象
- **高级功能**:
  - 3D 铜钱动画
  - 变卦分析（本卦、变卦、互卦、错卦、综卦）
  - 铜钱落地音效（Web Audio API）
  - 震动反馈（Navigator.vibrate）
  - 手动录入六爻

### 3. 黄历择吉 (calendar.js)
- **核心功能**: 万年历查询、宜忌事项
- **高级功能**:
  - 智能吉日筛选（未来 30 天）
  - 结合个人八字优选吉日（根据喜用神）
  - 每日运势评级
  - 穿衣指南
  - 月历视图

### 4. 八宅风水 (fengshui.js)
- **核心功能**: 八宅风水罗盘、方位分析
- **高级功能**:
  - 24 山方位细分
  - 八宅吉凶方位
  - 家居摆设建议
  - 3D 罗盘视差效果

### 5. 乾坤问卜 (chat.js)
- **核心功能**: AI 对话式命理咨询
- **高级功能**:
  - Gemini API 集成
  - 本地命理问答模式
  - 语音输入（Web Speech API）
  - 上下文感知（八字、六爻信息）

### 6. 姓名五格 (xingming.js)
- **核心功能**: 姓名五格剖象分析
- **高级功能**:
  - 天格、地格、人格、外格、总格计算
  - 三才配置分析
  - 姓名吉凶评分

### 7. 梅花易数 (meihua.js)
- **核心功能**: 梅花易数起卦
- **高级功能**:
  - 数字起卦
  - 时间起卦
  - 随机起卦
  - 卦象解析

### 8. 八字合婚 (hehun.js)
- **核心功能**: 两人八字合婚分析
- **高级功能**:
  - 五行互补分析
  - 十神互参
  - 婚姻运势预测

### 9. 紫微斗数 (ziwei.js)
- **核心功能**: 紫微斗数排盘
- **高级功能**:
  - 14 主星安星
  - 12 辅星安星（左辅、右弼、文昌、文曲、天魁、天钺等）
  - 四化飞星（10 天干 × 4 化 = 40 种组合）
  - 五行局计算
  - 大限运势推演（10 年一限）
  - 四化标记显示

### 10. 八字合盘 (hepan.js)
- **核心功能**: 双人八字对比分析
- **高级功能**:
  - 五行互补分析
  - 十神互参
  - 纳音相济

### 11. 数字能量学 (shuzi.js)
- **核心功能**: 手机号、车牌号等数字能量分析
- **高级功能**:
  - 八星磁场识别（天医、延年、生气等）
  - 数字五行属性分析
  - 能量评分系统（30-100 分）
  - 使用建议生成

## 核心工具库 (utils.js)

### 五行计算
- `getGanWuxing(gan)` - 获取天干五行
- `getZhiWuxing(zhi)` - 获取地支五行
- `getWuxingEng(wx)` - 五行转英文
- `getMaxWuxing()` - 获取最强五行
- `getMinWuxing()` - 获取最弱五行

### UI 组件
- `showLoading(containerId, options)` - 显示骨架屏
- `hideLoading(containerId)` - 隐藏骨架屏
- `showToast(msg, duration)` - 显示通知

### 手势处理
- `initGestureHandler(options)` - 初始化手势监听
- `getModuleNavOrder()` - 获取模块导航顺序
- `switchToNextModule(current, callback)` - 切换到下一模块
- `switchToPrevModule(current, callback)` - 切换到上一模块

### 数据处理
- `escapeHTML(str)` - HTML 转义
- `sanitizeHTML(html)` - HTML 净化
- `getStroke(char)` - 获取康熙字典笔画

## 状态管理 (state.js)

### 全局状态
- `AppState` - 应用全局状态（五行数据、六爻状态、黄历日期等）

### 历史记录系统
- `getHistoryRecords(filter)` - 获取历史记录
- `addHistoryRecord(data)` - 添加历史记录
- `deleteHistoryRecord(key)` - 删除历史记录
- `toggleHistoryFavorite(key)` - 切换收藏状态

### 模块元数据
- `HISTORY_MODULE_META` - 10 个模块的元数据定义

## 交互功能

### 音效系统
- **技术**: Web Audio API
- **实现**: `js/liuyao.js` 中的 `playCoinSound()` 函数
- **效果**: 双音调金属碰撞（800Hz + 1200Hz）

### 震动反馈
- **技术**: Navigator.vibrate API
- **实现**: `js/liuyao.js` 中的 `triggerVibration()` 函数
- **场景**: 摇卦落地（80ms）、导航切换（20ms）

### 语音输入
- **技术**: Web Speech API
- **实现**: `js/chat.js` 中的语音识别功能
- **支持**: 中文实时转写

### 手势操作
- **技术**: Touch Events API
- **实现**: `js/utils.js` 中的 `initGestureHandler()` 函数
- **支持**: 左右滑动切换模块（阈值 80px）

## 样式系统

### 主题变量
- 暗色主题（默认）
- 亮色主题
- 主色调：金色 (#D4AF37)、朱红 (#C73E3A)、翡翠绿

### 组件样式
- 玻璃拟态卡片
- 骨架屏加载动画
- 响应式布局（桌面 + 移动端）
- 移动端底部 Tab 导航

## 浏览器兼容性

### 必需 API
- ES6+ Modules
- localStorage
- CSS Custom Properties
- Flexbox / Grid

### 可选 API（优雅降级）
- Web Audio API（音效）
- Navigator.vibrate（震动）
- Web Speech API（语音）
- DeviceOrientationEvent（罗盘）

## 开发指南

### 本地运行
```bash
# 使用任意静态文件服务器
npx serve .
# 或
python -m http.server 8000
```

### 代码规范
- 使用 ES6+ 语法
- 模块化设计（每个功能一个文件）
- 函数添加 JSDoc 注释
- 避免全局变量污染

### 新增模块步骤
1. 创建 `js/[module].js` 文件
2. 在 `index.html` 中添加界面
3. 在 `js/app.js` 中导入并初始化
4. 在 `js/state.js` 中添加模块元数据
5. 添加历史记录支持

## 性能优化建议

### 已实现
- 骨架屏加载动画
- 响应式设计
- 本地存储持久化

### 可优化
- 代码分割（动态 import）
- 图片懒加载
- Canvas 动画节流
- Service Worker 离线缓存

## 更新日志

### v4.0 (2026-06-23) - Phase 3
- ✅ 八字神煞系统（8 种神煞）
- ✅ 紫微斗数深化（四化飞星、大限推演）
- ✅ 数字能量学模块（八星磁场分析）
- ✅ 手势操作支持（左右滑动切换）
- ✅ 技术架构优化（JSDoc 文档）

### v3.2 (2026-06-23) - Phase 2
- ✅ 流年运势详批
- ✅ 择日与八字结合
- ✅ 音频与震动反馈
- ✅ 语音输入

### v3.1 (2026-06-23) - Phase 1
- ✅ 六十四卦数据补全
- ✅ 六爻变卦分析增强
- ✅ 历史记录系统
- ✅ 导航重构
- ✅ 骨架屏统一

## 许可证

本项目为开源项目，仅供学习和研究使用。

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
