import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 18913;
const ROOT = path.resolve('.');

function startServer() {
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            let u = req.url.split('?')[0];
            if (u === '/') u = '/index.html';
            const safe = u.replace(/^[/\\]+/, '').replace(/[/\\]/g, path.sep);
            const fp = path.join(ROOT, safe);
            if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
            let data;
            try { data = fs.readFileSync(fp); } catch(e) { res.writeHead(404); res.end(); return; }
            const ext = path.extname(fp).toLowerCase();
            const mime = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png' };
            res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.end(data);
        });
        srv.listen(PORT, () => { console.log(`Server on :${PORT}`); resolve(srv); });
    });
}

async function main() {
    const server = await startServer();
    const BASE = `http://localhost:${PORT}`;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const logs = [];
    page.on('console', msg => logs.push(msg));

    // Track network requests to find module failures
    const networkLog = [];
    page.on('requestfailed', req => networkLog.push(`FAIL ${req.url()} ${req.failure().errorText}`));
    page.on('requestfinished', req => {
        if (req.url().includes('.js') || req.url().includes('.css')) {
            networkLog.push(`OK ${req.url().split('/').pop().split('?')[0]}`);
        }
    });
    
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    console.log('Network log:');
    networkLog.forEach(l => console.log('  ' + l));
    
    // Check if DOMContentLoaded handler ran
    const pageState = await page.evaluate(() => {
        const canvas = document.getElementById('particleCanvas');
        return {
            clockContent: document.querySelector('.solar-time')?.textContent,
            canvasSize: canvas ? canvas.width + 'x' + canvas.height : 'none',
            navItems: document.querySelectorAll('.nav-item').length,
            bodyClass: document.body.className,
            readyState: document.readyState
        };
    });
    console.log('Page state:', JSON.stringify(pageState));
    
    // Try clicking nav items
    await page.click('.nav-item[data-target="bazi"]');
    await page.waitForTimeout(300);
    const baziActive = await page.evaluate(() => {
        return document.getElementById('panel-bazi')?.classList.contains('active');
    });
    console.log('Bazi panel active:', baziActive);
    
    // Read all console logs
    console.log(`Console messages (${logs.length}):`);
    logs.forEach(msg => console.log(`  [${msg.type()}] ${msg.text().substring(0, 300)}`));

    await browser.close();
    server.close();
}

main().catch(e => { console.error(e.message); process.exit(1); });
