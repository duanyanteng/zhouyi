import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 18911;
const ROOT = path.resolve('.');

function startServer() {
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            let urlPath = req.url.split('?')[0];
            if (urlPath === '/') urlPath = '/index.html';
            const safePath = urlPath.replace(/^[/\\]+/, '').replace(/[/\\]/g, path.sep);
            const filePath = path.join(ROOT, safePath);
            if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
            const ext = path.extname(filePath).toLowerCase();
            const mime = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon' };
            fs.readFile(filePath, (err, data) => {
                if (err) { res.writeHead(404); res.end('Not found'); return; }
                res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
                res.end(data);
            });
        });
        srv.listen(PORT, () => { console.log(`Test server on :${PORT}`); resolve(srv); });
    });
}

async function waitForApp(page) {
    await page.waitForSelector('.nav-item', { timeout: 15000 });
}

async function main() {
    const server = await startServer();
    const BASE = `http://localhost:${PORT}`;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    console.log('=== V3 模块加载验证 ===');

    // 1. Home page
    console.log('[1] 加载首页...');
    // Clear localStorage before loading to prevent auto-calculation
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    const navItems = await page.locator('.nav-item').count();
    console.log(`    导航项: ${navItems}`);
    if (navItems !== 11) throw new Error(`预期11个导航项，实际${navItems}`);
    console.log('    OK');

    // 2. 切换面板
    const panels = ['bazi','liuyao','huangli','fengshui','chat','xingming','meihua','hehun','ziwei','hepan'];
    for (const target of panels) {
        console.log(`[2] 切换至 ${target}...`);
        await page.click(`.nav-item[data-target="${target}"]`);
        await page.waitForTimeout(500);
        const active = await page.locator(`#panel-${target}`).evaluate(el => el.classList.contains('active'));
        if (!active) throw new Error(`面板 ${target} 未激活`);
    }
    console.log('    全部面板切换 OK');

    // 3. 八字
    console.log('[3] 八字排盘...');
    // Collect all console errors
    const allErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') allErrors.push(msg.text()); });
    page.on('pageerror', err => allErrors.push(err.message));

    await page.click('.nav-item[data-target="bazi"]');
    await page.waitForTimeout(500);
    const baziActive = await page.locator('#panel-bazi.active').isVisible();
    console.log(`    bazi active: ${baziActive}`);
    if (!baziActive) {
        console.log('    Errors:', allErrors.join(' | '));
        // Try clicking again
        await page.click('.nav-item[data-target="bazi"]');
        await page.waitForTimeout(1000);
        const baziActive2 = await page.locator('#panel-bazi.active').isVisible();
        console.log(`    bazi active after retry: ${baziActive2}`);
        if (!baziActive2) throw new Error('八字面板未激活');
    }
    await page.waitForTimeout(500);
    await page.fill('#baziName', '测试');
    await page.locator('#baziDate').evaluate(el => { el.value = '1990-06-15T10:00'; });
    await page.waitForTimeout(100);
    const errorsBefore = allErrors.length;
    await page.click('#btnCalculateBazi');
    await page.waitForTimeout(500);
    const resultVisible = await page.locator('#baziResultArea').isVisible();
    console.log(`    结果可见: ${resultVisible}`);
    if (allErrors.length > errorsBefore) console.log('    Errors:', allErrors.slice(errorsBefore).join('; '));
    if (!resultVisible) throw new Error('八字结果未显示');
    console.log('    OK');

    // 3b. 八字数据正确性验证
    console.log('[3b] 八字数据正确性...');
    // 使用 lunar-javascript 计算期望值，与 DOM 渲染结果交叉验证
    const expectedBazi = await page.evaluate(() => {
        // Use 1990-06-15T10:00 (巳时) — same date entered in [3]
        const birthDate = new Date('1990-06-15T10:00');
        const solar = Solar.fromDate(birthDate);
        const lunar = solar.getLunar();
        const bazi = lunar.getEightChar();
        return {
            yearGan: bazi.getYearGan(), yearZhi: bazi.getYearZhi(),
            monthGan: bazi.getMonthGan(), monthZhi: bazi.getMonthZhi(),
            dayGan: bazi.getDayGan(), dayZhi: bazi.getDayZhi(),
            timeGan: bazi.getTimeGan(), timeZhi: bazi.getTimeZhi(),
            yearShiShen: bazi.getYearShiShenGan(),
            monthShiShen: bazi.getMonthShiShenGan(),
            timeShiShen: bazi.getTimeShiShenGan(),
            yearNayin: bazi.getYearNaYin(),
            monthNayin: bazi.getMonthNaYin(),
            dayNayin: bazi.getDayNaYin(),
            timeNayin: bazi.getTimeNaYin(),
        };
    });
    console.log(`    八字: ${expectedBazi.yearGan}${expectedBazi.yearZhi} ${expectedBazi.monthGan}${expectedBazi.monthZhi} ${expectedBazi.dayGan}${expectedBazi.dayZhi} ${expectedBazi.timeGan}${expectedBazi.timeZhi}`);
    console.log(`    纳音: ${expectedBazi.yearNayin} ${expectedBazi.monthNayin} ${expectedBazi.dayNayin} ${expectedBazi.timeNayin}`);

    // Verify DOM matches library output
    const domYearGan = await page.locator('#colYear .gan').textContent();
    const domYearZhi = await page.locator('#colYear .zhi').textContent();
    const domMonthGan = await page.locator('#colMonth .gan').textContent();
    const domMonthZhi = await page.locator('#colMonth .zhi').textContent();
    const domDayGan = await page.locator('#colDay .gan').textContent();
    const domDayZhi = await page.locator('#colDay .zhi').textContent();
    const domTimeGan = await page.locator('#colTime .gan').textContent();
    const domTimeZhi = await page.locator('#colTime .zhi').textContent();

    if (domYearGan.trim() !== expectedBazi.yearGan) throw new Error(`年柱天干不符: DOM=${domYearGan} 预期=${expectedBazi.yearGan}`);
    if (domYearZhi.trim() !== expectedBazi.yearZhi) throw new Error(`年柱地支不符: DOM=${domYearZhi} 预期=${expectedBazi.yearZhi}`);
    if (domMonthGan.trim() !== expectedBazi.monthGan) throw new Error(`月柱天干不符: DOM=${domMonthGan} 预期=${expectedBazi.monthGan}`);
    if (domMonthZhi.trim() !== expectedBazi.monthZhi) throw new Error(`月柱地支不符: DOM=${domMonthZhi} 预期=${expectedBazi.monthZhi}`);
    if (domDayGan.trim() !== expectedBazi.dayGan) throw new Error(`日柱天干不符: DOM=${domDayGan} 预期=${expectedBazi.dayGan}`);
    if (domDayZhi.trim() !== expectedBazi.dayZhi) throw new Error(`日柱地支不符: DOM=${domDayZhi} 预期=${expectedBazi.dayZhi}`);
    if (domTimeGan.trim() !== expectedBazi.timeGan) throw new Error(`时柱天干不符: DOM=${domTimeGan} 预期=${expectedBazi.timeGan}`);
    if (domTimeZhi.trim() !== expectedBazi.timeZhi) throw new Error(`时柱地支不符: DOM=${domTimeZhi} 预期=${expectedBazi.timeZhi}`);

    // Verify 十神 and 纳音 match
    const domYearShiShen = await page.locator('#colYear .shishen').textContent();
    const domMonthNayin = await page.locator('#colMonth .nayin').textContent();
    if (domYearShiShen.trim() !== expectedBazi.yearShiShen) throw new Error(`年上十神不符: DOM=${domYearShiShen} 预期=${expectedBazi.yearShiShen}`);
    if (domMonthNayin.trim() !== expectedBazi.monthNayin) throw new Error(`月柱纳音不符: DOM=${domMonthNayin} 预期=${expectedBazi.monthNayin}`);

    console.log('    ✓ 八字各柱数据正确，与 lunar-javascript 库输出完全一致');
    console.log('    OK');

    // 4. 六爻
    console.log('[4] 六爻起卦...');
    await page.click('.nav-item[data-target="liuyao"]');
    await page.waitForSelector('#panel-liuyao.active');
    await page.click('#btnStartLiuyao');
    await page.waitForSelector('#btnShakeCoins', { timeout: 3000 });
    for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(100);
        await page.click('#btnShakeCoins');
        // Wait for animation (1200ms) + button re-enable
        await page.waitForTimeout(1600);
    }
    const statusText = await page.locator('#shakeStatus').textContent();
    console.log(`    状态: ${statusText.trim()}`);
    if (!statusText.includes('6 / 6')) throw new Error('六爻未完成6次');
    console.log('    OK');

    // 5. 黄历
    console.log('[5] 黄历择吉...');
    await page.click('.nav-item[data-target="huangli"]');
    await page.waitForSelector('.huangli-board-card', { timeout: 3000 });
    const jiriItems = await page.locator('.jiri-list-item').count();
    console.log(`    吉日项: ${jiriItems}`);
    // If no jiri items, just warn but don't fail (only visible when event is selected)
    if (jiriItems < 1) console.log('    黄历面板渲染正常 (无吉日查询项)');

    // 6. 风水
    console.log('[6] 风水布局...');
    await page.click('.nav-item[data-target="fengshui"]');
    await page.waitForSelector('#panel-fengshui.active');
    await page.selectOption('#houseSitDirection', '坐北朝南');
    await page.waitForTimeout(300);
    // Click a grid cell to show result
    await page.locator('.grid-cell[data-pos="S"]').click();
    await page.waitForTimeout(300);
    const fsVisible = await page.locator('#fengshuiResultBody').isVisible();
    console.log(`    结果可见: ${fsVisible}`);
    if (!fsVisible) throw new Error('风水结果未显示');
    console.log('    OK');

    // 7. 聊天
    console.log('[7] 聊天界面...');
    await page.click('.nav-item[data-target="chat"]');
    await page.waitForSelector('#panel-chat.active');
    await page.fill('#chatInput', '你好');
    const sendBtn = await page.locator('#btnSendMessage').isVisible();
    if (!sendBtn) throw new Error('发送按钮缺失');
    console.log('    OK');

    // 8. 姓名
    console.log('[8] 姓名五格...');
    await page.click('.nav-item[data-target="xingming"]');
    await page.waitForSelector('#panel-xingming.active');
    await page.fill('#xmSurname', '李');
    await page.fill('#xmGivenName', '明');
    await page.click('#btnCalcXingming');
    await page.waitForSelector('#xmResultCard', { timeout: 3000 });
    const xmCells = await page.locator('.xm-cell').count();
    if (xmCells !== 5) throw new Error(`姓名五格不足: ${xmCells}`);
    console.log('    OK');

    // 9. 梅花
    console.log('[9] 梅花易数...');
    await page.click('.nav-item[data-target="meihua"]');
    await page.waitForSelector('#panel-meihua.active');
    await page.click('#btnMhRandom');
    const num1 = await page.locator('#mhNum1').inputValue();
    if (num1 === '') throw new Error('随机数未生成');
    await page.click('#btnCalcMeihua');
    await page.waitForSelector('#mhResultCard', { timeout: 3000 });
    console.log('    OK');

    // 10. 合婚
    console.log('[10] 合婚...');
    await page.click('.nav-item[data-target="hehun"]');
    await page.waitForSelector('#panel-hehun.active');
    await page.fill('#hhNameM', '张生');
    await page.fill('#hhNameF', '崔莺莺');
    await page.locator('#hhDateM').evaluate(el => el.value = '1990-06-15T12:00');
    await page.locator('#hhDateF').evaluate(el => el.value = '1992-08-20T12:00');
    await page.click('#btnCalcHehun');
    await page.waitForSelector('#hhResultCard', { timeout: 3000 });
    const hhScore = await page.locator('.hh-score').textContent();
    if (!hhScore) throw new Error('合婚分数缺失');
    console.log(`    分数: ${hhScore.trim()} OK`);

    // 11. 紫微
    console.log('[11] 紫微斗数...');
    await page.click('.nav-item[data-target="ziwei"]');
    await page.waitForSelector('#panel-ziwei.active');
    await page.fill('#zwName', '测试');
    await page.locator('#zwDate').evaluate(el => el.value = '1990-06-15T10:00');
    await page.click('#btnCalcZw');
    await page.waitForSelector('#zwResultCard', { timeout: 3000 });
    const zwPalaces = await page.locator('.zw-palace').count();
    if (zwPalaces !== 12) throw new Error(`紫微宫位不足: ${zwPalaces}`);
    console.log('    OK');

    // 11b. 合盘
    console.log('[11b] 八字合盘...');
    await page.click('.nav-item[data-target="hepan"]');
    await page.waitForSelector('#panel-hepan.active');
    // Fill two persons
    await page.fill('#hpNameA', '张三');
    await page.fill('#hpNameB', '李四');
    await page.locator('#hpDateA').evaluate(el => el.value = '1990-06-15T10:00');
    await page.locator('#hpDateB').evaluate(el => el.value = '1992-08-20T14:00');
    await page.click('#btnCalculateHp');
    await page.waitForTimeout(1500);
    const hpResultVisible = await page.locator('#hpResultCard').isVisible();
    if (!hpResultVisible) throw new Error('合盘结果未显示');
    console.log('    OK');

    // 12. 复制按钮
    console.log('[12] 复制按钮...');
    await page.click('.nav-item[data-target="bazi"]');
    const copyBtns = await page.locator('.btn-copy-result').count();
    console.log(`    复制按钮数: ${copyBtns}`);

    // 13. 截图按钮
    console.log('[13] 截图按钮...');
    const screenshotBtns = await page.locator('.btn-screenshot').count();
    console.log(`    截图按钮数: ${screenshotBtns}`);

    // 14. 模块加载检查
    console.log('[14] 模块加载检查...');
    const moduleFiles = ['js/app.js','js/state.js','js/utils.js','js/calendar.js','js/bazi.js','js/liuyao.js','js/fengshui.js','js/chat.js','js/xingming.js','js/meihua.js','js/hehun.js','js/ziwei.js','js/hepan.js'];
    for (const mf of moduleFiles) {
        const resp = await page.request.get(`${BASE}/${mf}`);
        if (resp.status() !== 200) throw new Error(`模块 ${mf} 加载失败 (${resp.status()})`);
    }
    console.log('    全部模块 200 OK');

    // Error summary
    console.log('\n=== 测试完成 ===');
    if (errors.length > 0) {
        console.log(`控制台错误 (${errors.length}):`);
        errors.forEach(e => console.log(`  ${e}`));
        process.exit(1);
    } else {
        console.log('✅ 所有 V3 验证通过，零控制台错误');
    }

    await browser.close();
    server.close();
}

main().catch(err => {
    console.error('❌ 测试失败:', err.message);
    process.exit(1);
});
