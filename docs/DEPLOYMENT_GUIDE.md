# 乾坤易道周易命理系统 - 本地启动与部署指南

> 版本：v4.0 | 更新：2026-06-23

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [本地部署方案](#本地部署方案)
- [生产环境部署](#生产环境部署)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

---

## 项目概述

乾坤易道是一个纯前端的周易命理分析应用，包含八字排盘、六爻占卜、黄历择吉、风水罗盘等 12 个功能模块。项目采用原生 JavaScript 开发，无需构建工具，可直接在浏览器中运行。

### 项目结构

```
zhouyi/
├── index.html              # 主入口文件
├── js/                     # JavaScript 模块
│   ├── app.js             # 应用入口
│   ├── state.js           # 状态管理
│   ├── utils.js           # 工具函数
│   ├── bazi.js            # 八字排盘
│   ├── liuyao.js          # 六爻占卜
│   ├── calendar.js        # 黄历择吉
│   ├── fengshui.js        # 八宅风水
│   ├── chat.js            # 乾坤问卜
│   ├── xingming.js        # 姓名五格
│   ├── meihua.js          # 梅花易数
│   ├── hehun.js           # 八字合婚
│   ├── ziwei.js           # 紫微斗数
│   ├── hepan.js           # 八字合盘
│   ├── shuzi.js           # 数字能量学
│   └── gua-data.js        # 六十四卦数据
├── css/                    # 样式文件
│   ├── base.css           # 基础样式
│   ├── components.css     # 组件样式
│   └── modules.css        # 模块样式
├── assets/                 # 静态资源
├── scripts/                # 脚本工具
└── docs/                   # 文档
```

---

## 技术栈

- **前端框架**: 原生 JavaScript (ES6+ Modules)
- **日历库**: lunar-javascript v1.6.12
- **图表库**: Chart.js v4.4.0
- **存储**: localStorage (浏览器本地存储)
- **构建工具**: 无需构建，原生 ES Modules
- **兼容性**: 现代浏览器（Chrome、Firefox、Safari、Edge）

---

## 环境要求

### 开发环境

- **操作系统**: Windows 10+、macOS 10.15+、Linux (Ubuntu 18.04+)
- **浏览器**: Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **代码编辑器**: VS Code（推荐）、WebStorm、Sublime Text
- **Node.js**: v14.0.0+（仅用于本地服务器，非必需）
- **Git**: v2.30.0+（用于版本控制）

### 浏览器支持

| 浏览器 | 最低版本 | 推荐版本 | 备注 |
|--------|----------|----------|------|
| Chrome | 80 | 110+ | 完全支持 |
| Firefox | 78 | 115+ | 完全支持 |
| Safari | 14 | 16+ | 完全支持 |
| Edge | 80 | 110+ | 完全支持 |
| IE | 11 | - | 不支持（需使用 ES6+） |

### 功能依赖

| 功能 | 浏览器 API | 兼容性 | 降级方案 |
|------|-----------|--------|----------|
| 音效 | Web Audio API | 所有现代浏览器 | 静默模式 |
| 震动 | Navigator.vibrate | 移动端 | 桌面端忽略 |
| 语音 | Web Speech API | Chrome 33+、Edge 79+ | 隐藏按钮 |
| 手势 | Touch Events | 移动端浏览器 | 桌面端忽略 |

---

## 本地开发

### 方案 1：直接打开 HTML 文件（最简单）

**适用场景**: 快速查看、个人学习、功能测试

**步骤**:

1. **克隆或下载项目**
   ```bash
   # 使用 Git
   git clone https://gitee.com/your-username/zhouyi.git
   cd zhouyi

   # 或直接下载 ZIP 并解压
   ```

2. **直接打开 index.html**
   - Windows: 双击 `index.html` 或使用浏览器打开
   - macOS: `open index.html`
   - Linux: `xdg-open index.html`

**注意事项**:
- ⚠️ 直接打开文件可能遇到 CORS 限制（本地文件访问）
- 某些浏览器可能需要允许本地文件访问
- 推荐使用本地服务器方式（见方案 2）

---

### 方案 2：使用本地 HTTP 服务器（推荐）

**适用场景**: 完整功能测试、避免 CORS 问题、模拟真实环境

#### 方法 A：使用 Python（已安装 Python）

**Python 3.x**:
```bash
cd zhouyi
python -m http.server 8000
```

**Python 2.x**:
```bash
cd zhouyi
python -m SimpleHTTPServer 8000
```

**访问**: 打开浏览器访问 `http://localhost:8000`

---

#### 方法 B：使用 Node.js（推荐）

**安装 Node.js**: https://nodejs.org/

**方式 1：使用 serve（最简单）**
```bash
# 全局安装 serve
npm install -g serve

# 启动服务器
cd zhouyi
serve .
```

**方式 2：使用 http-server**
```bash
# 全局安装 http-server
npm install -g http-server

# 启动服务器
cd zhouyi
http-server -p 8000
```

**方式 3：使用项目脚本**
```bash
cd zhouyi

# 如果项目包含 package.json
npm install
npm run dev

# 或使用 scripts 目录下的脚本
node scripts/dev-server.mjs
```

**访问**: 打开浏览器访问 `http://localhost:8000`

---

#### 方法 C：使用 VS Code Live Server 扩展

1. **安装扩展**
   - 在 VS Code 中搜索 "Live Server"
   - 安装 Ritwick Dey 的 Live Server 扩展

2. **启动服务器**
   - 在 VS Code 中打开 `index.html`
   - 右键点击选择 "Open with Live Server"
   - 或点击底部状态栏的 "Go Live" 按钮

3. **访问**: 自动打开浏览器访问 `http://localhost:5500`

**优势**:
- 自动热重载（文件修改自动刷新）
- 自动打开浏览器
- 无需命令行

---

#### 方法 D：使用 PHP 内置服务器（已安装 PHP）

```bash
cd zhouyi
php -S localhost:8000
```

---

#### 方法 E：使用 Ruby 内置服务器（已安装 Ruby）

```bash
cd zhouyi
ruby -run -e httpd . -p 8000
```

---

### 方案 3：使用 Docker（容器化开发）

**适用场景**: 团队开发、环境隔离、跨平台一致

#### 创建 Dockerfile

```dockerfile
# 使用 nginx 作为基础镜像
FROM nginx:alpine

# 复制项目文件
COPY .. /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 构建和运行

```bash
# 构建镜像
docker build -t zhouyi .

# 运行容器
docker run -d -p 8080:80 zhouyi
```

**访问**: 打开浏览器访问 `http://localhost:8080`

---

## 本地部署方案

### 方案 A：使用 Nginx 部署（推荐生产环境）

#### 1. 安装 Nginx

**Windows**:
- 下载: http://nginx.org/en/download.html
- 解压到任意目录

**macOS**:
```bash
brew install nginx
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install nginx
```

#### 2. 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/zhouyi`:

```nginx
server {
    listen 80;
    server_name localhost;  # 或你的域名

    root /path/to/zhouyi;  # 项目路径
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/zhouyi /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 nginx
sudo systemctl restart nginx
```

**访问**: 打开浏览器访问 `http://localhost`

---

### 方案 B：使用 Apache 部署

#### 1. 安装 Apache

**Windows**:
- 下载 XAMPP 或 WAMP
- 安装并启动 Apache

**macOS**:
```bash
brew install httpd
```

**Linux**:
```bash
sudo apt update
sudo apt install apache2
```

#### 2. 配置虚拟主机

创建配置文件 `/etc/apache2/sites-available/zhouyi.conf`:

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /path/to/zhouyi

    <Directory /path/to/zhouyi>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # 启用压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript
    </IfModule>

    # 缓存控制
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
    </IfModule>
</VirtualHost>
```

#### 3. 启用配置

```bash
# 启用模块
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires

# 启用站点
sudo a2ensite zhouyi.conf

# 重启 Apache
sudo systemctl restart apache2
```

---

### 方案 C：使用 Node.js 部署

#### 1. 创建 Node.js 服务器

创建 `server.js`:

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);

    // 安全检查：防止目录遍历
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // SPA 回退
                fs.readFile(path.join(ROOT, 'index.html'), (err, content) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

#### 2. 启动服务器

```bash
node server.js
```

**访问**: 打开浏览器访问 `http://localhost:3000`

---

## 生产环境部署

### 方案 1：GitHub Pages（免费、简单）

#### 1. 准备项目

```bash
# 初始化 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/your-username/zhouyi.git
git branch -M main
git push -u origin main
```

#### 2. 配置 GitHub Pages

1. 进入 GitHub 仓库设置
2. 找到 "Pages" 选项
3. 选择分支部署（通常为 `main` 或 `gh-pages`）
4. 选择根目录 `/ (root)`
5. 保存

**访问**: `https://your-username.github.io/zhouyi`

---

### 方案 2：Vercel（推荐、免费、自动部署）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录并部署

```bash
cd zhouyi

# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

**访问**: Vercel 会自动分配一个域名，如 `zhouyi.vercel.app`

#### 3. 配置自定义域名（可选）

1. 在 Vercel 控制台添加域名
2. 配置 DNS 记录
3. Vercel 自动配置 SSL

---

### 方案 3：Netlify（免费、自动部署）

#### 1. 通过 Git 部署

1. 访问 https://www.netlify.com/
2. 连接 GitHub/GitLab/Bitbucket
3. 选择仓库
4. 配置构建设置（无需构建，直接发布）
5. 部署

#### 2. 通过 CLI 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

**访问**: Netlify 会自动分配域名，如 `zhouyi.netlify.app`

---

### 方案 4：腾讯云 COS（国内访问快）

#### 1. 创建存储桶

1. 登录腾讯云控制台
2. 进入 COS 对象存储
3. 创建存储桶
4. 配置静态网站托管

#### 2. 上传文件

```bash
# 使用 COSCMD 工具
pip install coscmd

# 配置
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>

# 上传文件
coscmd upload -r ./ /zhouyi/
```

#### 3. 配置 CDN（可选）

1. 在 CDN 控制台添加域名
2. 配置源站（COS 存储桶）
3. 配置缓存规则
4. 配置 HTTPS 证书

**访问**: `https://your-domain.com`

---

### 方案 5：阿里云 OSS（国内访问快）

#### 1. 创建 Bucket

1. 登录阿里云控制台
2. 进入 OSS 对象存储
3. 创建 Bucket
4. 配置静态网站托管

#### 2. 上传文件

```bash
# 使用 ossutil 工具
ossutil cp -r ./zhouyi/ oss://your-bucket/zhouyi/
```

#### 3. 配置 CDN（可选）

1. 在 CDN 控制台添加加速域名
2. 配置源站
3. 配置缓存规则
4. 配置 HTTPS

---

### 方案 6：Docker 容器部署

#### 1. 创建 Dockerfile

```dockerfile
# 使用 nginx:alpine 镜像
FROM nginx:alpine

# 复制项目文件
COPY . /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # 启用 gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. 构建并运行

```bash
# 构建镜像
docker build -t zhouyi .

# 运行容器
docker run -d -p 80:80 zhouyi
```

#### 4. 推送到镜像仓库

```bash
# 标记镜像
docker tag zhouyi your-registry/zhouyi:latest

# 推送
docker push your-registry/zhouyi:latest
```

---

### 方案 7：使用云服务器（完全控制）

#### 1. 购买云服务器

- 腾讯云轻量应用服务器
- 阿里云 ECS
- AWS EC2

#### 2. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install nginx
```

#### 3. 上传项目

```bash
# 使用 scp
scp -r ./zhouyi/ user@server-ip:/var/www/

# 或使用 rsync
rsync -avz ./zhouyi/ user@server-ip:/var/www/
```

#### 4. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/zhouyi;
    index index.html;

    # ... 其他配置
}
```

#### 5. 配置 HTTPS（Let's Encrypt）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 配置说明

### 1. Gemini API 配置（可选）

如果使用 AI 问卜功能，需要配置 Gemini API：

1. 访问 https://makersuite.google.com/app/apikey
2. 创建 API Key
3. 在应用中配置（设置 → API 配置）

### 2. 本地存储

应用使用 localStorage 存储数据：

- `bazi_records`: 八字历史记录
- `qky_global_history_v1`: 全局历史记录
- `gemini_api_key`: API 密钥
- `theme`: 主题设置
- `nav_collapsed`: 导航状态

**清除数据**: 在浏览器开发者工具中清除 localStorage

### 3. 环境变量（可选）

创建 `.env` 文件（仅用于开发）：

```env
GEMINI_API_KEY=your_api_key_here
```

---

## 常见问题

### Q1: 打开页面后内容为空

**原因**: 可能是 CORS 限制或 JavaScript 加载失败

**解决方案**:
1. 使用本地服务器（不要直接打开文件）
2. 检查浏览器控制台是否有错误
3. 确保所有 JS 文件存在且未损坏

---

### Q2: 音效或震动功能不工作

**原因**: 浏览器不支持或权限被拒绝

**解决方案**:
1. 确保使用现代浏览器（Chrome、Firefox、Safari、Edge）
2. 检查浏览器是否允许网站播放声音
3. 震动功能仅在移动端浏览器有效
4. 这些功能会优雅降级，不影响其他功能

---

### Q3: 语音输入功能不工作

**原因**: 浏览器不支持 Web Speech API 或麦克风权限被拒绝

**解决方案**:
1. 使用 Chrome 或 Edge 浏览器（支持最好）
2. 确保允许网站使用麦克风
3. 检查系统麦克风设置
4. 如果浏览器不支持，按钮会自动隐藏

---

### Q4: 手势操作不灵敏

**原因**: 滑动阈值设置或触摸事件问题

**解决方案**:
1. 确保滑动距离足够（默认阈值 80px）
2. 避免在输入框内滑动
3. 桌面端不支持触摸手势
4. 可在 utils.js 中调整阈值参数

---

### Q5: 数据丢失

**原因**: 清除浏览器缓存或使用隐私模式

**解决方案**:
1. 定期备份数据（使用历史记录导出功能）
2. 避免在隐私模式下使用
3. 不要手动清除 localStorage

---

### Q6: 页面加载缓慢

**原因**: lunar-javascript 库较大（610KB）

**解决方案**:
1. 使用 CDN 加速（见部署配置）
2. 启用 Gzip 压缩
3. 配置浏览器缓存
4. 首次加载后会缓存

---

### Q7: 某些功能显示"暂无数据"

**原因**: 该功能依赖外部 API 或数据未初始化

**解决方案**:
1. 检查网络连接
2. 确认 API 配置正确
3. 刷新页面重新初始化
4. 检查浏览器控制台错误信息

---

### Q8: 如何更新到最新版本

**Git 用户**:
```bash
git pull origin main
```

**手动下载**:
1. 下载最新版本
2. 替换所有文件（保留 localStorage 数据）

---

### Q9: 如何贡献代码

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

---

### Q10: 如何报告 Bug

1. 在 Issue 中描述问题
2. 提供复现步骤
3. 附上浏览器控制台错误信息
4. 说明操作系统和浏览器版本

---

## 性能优化建议

### 开发环境
- 使用本地服务器（避免 CORS）
- 使用 Chrome DevTools 调试
- 启用代码热重载（Live Server）

### 生产环境
- 启用 Gzip 压缩
- 配置 CDN 加速
- 设置浏览器缓存
- 使用 HTTPS
- 配置 HTTP/2
- 压缩图片资源（如有）

---

## 安全建议

### 本地开发
- 不要将 API 密钥提交到 Git
- 使用环境变量存储敏感信息
- 定期更新依赖库

### 生产部署
- 启用 HTTPS
- 配置安全头（CSP、X-Frame-Options 等）
- 定期备份数据
- 监控访问日志
- 限制 API 访问频率

---

## 监控与日志

### 本地开发
- 使用浏览器 DevTools
- 检查 Console 输出
- 使用 Network 面板监控请求

### 生产环境
- 配置服务器访问日志
- 使用监控工具（如 Google Analytics）
- 设置错误追踪（如 Sentry）

---

## 更新日志

### v4.0 (2026-06-23)
- 新增八字神煞系统
- 新增紫微斗数深化（四化、大限）
- 新增数字能量学模块
- 新增手势操作支持
- 技术架构优化（JSDoc 文档）

### v3.2 (2026-06-23)
- 新增流年运势详批
- 新增择日与八字结合
- 新增音频与震动反馈
- 新增语音输入功能

### v3.1 (2026-06-23)
- 六十四卦数据补全
- 六爻变卦分析增强
- 历史记录系统
- 导航重构
- 骨架屏统一

---

## 参考资源

- [MDN Web Docs](https://developer.mozilla.org/zh-CN/)
- [Web Audio API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API)
- [Web Speech API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Speech_API)
- [Touch Events](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch_events)
- [Nginx 配置文档](https://nginx.org/en/docs/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vercel 文档](https://vercel.com/docs)
- [Netlify 文档](https://docs.netlify.com/)

---

## 许可证

本项目为开源项目，仅供学习和研究使用。

---

## 联系方式

- **问题反馈**: 请提交 GitHub Issue
- **功能建议**: 欢迎提交 Pull Request
- **技术支持**: 查看本文档或项目 README

---

**最后更新**: 2026-06-23
