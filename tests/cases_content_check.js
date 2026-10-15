const assert = require('node:assert/strict');
globalThis.window = {};
require('../qimen_cases.js');
const cases = window.QimenCases;
const prefix = '補充解說（非教材原文）：';
assert.equal(cases.length, 17);
assert.equal(new Set(cases.map((item) => item.supplement)).size, cases.length);
for (const item of cases) {
  assert.ok(item.supplement.startsWith(prefix), `${item.id} 缺固定前綴`);
  const sentences = item.supplement.slice(prefix.length).split('。').filter((text) => text.trim());
  assert.ok(sentences.length >= 3 && sentences.length <= 6, `${item.id} 句數 ${sentences.length}`);
  assert.match(item.supplement, /可對應|可視為/, `${item.id} 缺推論語氣`);
  assert.match(item.supplement, /[一二三四五六七八九]宮/, `${item.id} 缺具體宮位`);
  assert.doesNotMatch(item.reasoning, /補充解說|可對應|可視為|若以|假設/, `${item.id} 教材理由混入補充`);
  if (item.category === '健康') assert.match(item.supplement, /盤象不能取代醫療判斷。/);
  else assert.doesNotMatch(item.supplement, /醫療判斷|健康案例僅/);
  console.log(`${item.id}：${sentences.length} 句，專屬補充及教材／推論分界 PASS`);
}
console.log('17 筆專屬補充；4 筆健康案例醫療界線 PASS');
