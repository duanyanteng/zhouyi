# 乾坤易道运行与部署教程

本文档说明如何在本地运行项目，以及发布到 GitHub Pages 前需要检查哪些内容。

## 1. 项目类型

这是一个静态前端项目，不需要后端服务，也不需要构建打包。

主要入口文件：

- `index.html`
- `css/`
- `js/`
- `images/`
- `manifest.json`
- `sw.js`

项目使用了 ES Modules 和 Service Worker，所以不要直接双击 `index.html` 运行。请使用本地 HTTP 服务访问。

## 2. 本地运行

### 推荐方式：Python 静态服务器

打开 PowerShell，进入项目目录：

```powershell
cd D:\WorkFace\Gitee_project\zhouyi
```

启动本地服务：

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

然后浏览器打开：

```text
http://127.0.0.1:4173
```

如果 `4173` 端口被占用，可以换成 `4174`：

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

对应访问：

```text
http://127.0.0.1:4174
```

### 停止本地服务

在运行服务的 PowerShell 窗口按：

```text
Ctrl + C
```

## 3. 浏览器缓存注意事项

项目启用了 `sw.js`，浏览器会缓存静态资源。开发时如果发现页面没有更新，可以：

1. 打开浏览器开发者工具。
2. 进入 `Application`。
3. 找到 `Service Workers`。
4. 点击 `Unregister`。
5. 找到 `Storage`。
6. 点击 `Clear site data`。
7. 刷新页面。

也可以在访问地址后加一个临时参数：

```text
http://127.0.0.1:4173/?dev=1
```

## 4. 发布前检查

发布到 GitHub Pages 前，建议按顺序检查：

```powershell
node --check js\state.js
node --check js\app.js
node --check js\liuyao.js
node --check js\gua-data.js
node --check js\bazi.js
```

然后本地启动服务，手动测试这些路径：

- Dashboard 是否正常打开。
- 八字排盘是否能生成结果。
- 六爻手动起卦是否能生成本卦、变卦、互卦、错卦、综卦。
- 全局历史总览是否能记录八字和六爻。
- 历史搜索、模块筛选、收藏、删除是否正常。
- 浏览器控制台是否没有红色错误。

## 5. GitHub Pages 部署方式

### 方式一：部署 main 分支根目录

适合当前项目结构。

1. 将项目推送到 GitHub 仓库。
2. 打开 GitHub 仓库页面。
3. 进入 `Settings`。
4. 进入 `Pages`。
5. `Source` 选择 `Deploy from a branch`。
6. `Branch` 选择 `main`。
7. 目录选择 `/root`。
8. 保存。

等待 GitHub Pages 构建完成后，访问 GitHub 给出的 Pages 地址。

### 方式二：部署 docs 目录

当前项目没有使用 `docs` 目录，不推荐。

除非后续专门把静态文件整理到 `docs/`，否则保持方式一即可。

## 6. 每次发布前必须注意版本号

因为项目使用 GitHub Pages 和 Service Worker，修改 JS 或 CSS 后需要同步更新缓存版本。

当前版本位置：

- `index.html` 中的资源参数，例如 `js/app.js?v=20260618-2`
- 各 JS 模块的本地 import 参数，例如 `./state.js?v=20260618-2`
- `sw.js` 中的 `CACHE`
- `sw.js` 中的 `ASSET_VERSION`

例如下一版可以改成：

```js
const CACHE = 'qkyd-v8';
const ASSET_VERSION = '20260618-3';
```

并同步更新 `index.html` 里的：

```html
<script type="module" src="js/app.js?v=20260618-3"></script>
```

如果只改了 HTML 文案，通常不需要改所有 JS import。  
如果改了 JS 模块，建议统一升级版本号，避免 GitHub Pages 上出现新旧模块混用。

## 7. 常见问题

### 页面空白

优先检查浏览器控制台是否有模块加载错误。常见原因：

- 直接双击 `index.html` 打开。
- 某个 JS import 版本号不一致。
- Service Worker 缓存了旧文件。

解决方式：

- 使用 `python -m http.server` 运行。
- 清理浏览器站点缓存。
- 检查 `index.html`、`js/*.js`、`sw.js` 的版本号是否一致。

### 修改代码后页面没有变化

通常是缓存问题。

处理方式：

- 刷新时按 `Ctrl + F5`。
- 清理 Service Worker。
- 升级 `sw.js` 的 `CACHE` 和 `ASSET_VERSION`。

### GitHub Pages 发布后旧页面还在

GitHub Pages 和浏览器缓存都可能延迟。

处理方式：

- 等待 1 到 3 分钟。
- 使用无痕窗口打开。
- 在 URL 后加参数，例如 `?v=latest`。
- 确认 `sw.js` 的缓存版本已经升级。

## 8. 当前推荐开发流程

1. 本地修改代码。
2. 运行 `node --check` 检查核心 JS。
3. 本地启动静态服务器。
4. 浏览器手动验证核心功能。
5. 如果改了 JS/CSS，升级资源版本号。
6. 提交代码。
7. 推送到 GitHub。
8. 等待 GitHub Pages 自动发布。

