// Test lunar-javascript DaYun API
const fs = require('fs');
const code = fs.readFileSync(__dirname + '/lunar-check.js', 'utf8');
const lunar = {};
// The UMD wrapper handles this
const wrapper = code.replace(
  /function\s*\([^)]*\)\s*\{/,
  'function(root, factory) { factory(lunar); return lunar; }('
);
// Simpler approach: just eval with global
global.Solar = undefined;
global.Lunar = undefined;
eval(code);
const Solar = global.Solar;

const s = Solar.fromYmd(1990, 6, 15);
const lunarObj = s.getLunar();
const bz = lunarObj.getEightChar();

console.log('=== EightChar methods ===');
const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(bz)).filter(n => !n.startsWith('_'));
console.log(proto.join('\n'));

console.log('\n=== DaYun test ===');
try {
  const dy = bz.getDaYun();
  console.log('DaYun count:', dy.length);
  dy.forEach((d, i) => {
    const dp = Object.getOwnPropertyNames(Object.getPrototypeOf(d)).filter(n => !n.startsWith('_'));
    console.log(`DaYun ${i}: gan=${d.getGan()}, zhi=${d.getZhi()}, age=${d.getStartAge()}-${d.getEndAge()}, year=${d.getStartYear()}-${d.getEndYear()}`);
    if (i === 0) console.log('  methods:', dp.join(', '));
  });
} catch(e) {
  console.log('DaYun error:', e.message);
}

console.log('\n=== Current DaYun test ===');
try {
  const cur = bz.getCurrentDaYun();
  console.log('Current DaYun:', cur.getGan(), cur.getZhi(), cur.getStartAge(), cur.getEndAge());
} catch(e) {
  console.log('Current DaYun error:', e.message);
}

console.log('\n=== Stream test ===');
try {
  const gz = bz.getStreamGanZhi(2026);
  console.log('2026 Stream:', gz);
} catch(e) {
  console.log('Stream error:', e.message);
}

console.log('\n=== NaYin test ===');
console.log('Year:', bz.getYearNaYin());
console.log('Month:', bz.getMonthNaYin());
console.log('Day:', bz.getDayNaYin());
console.log('Time:', bz.getTimeNaYin());
