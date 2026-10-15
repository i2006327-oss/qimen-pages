const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ console });
context.window = context;
for (const file of ['lunar.js', 'qimen_static_core.js', 'qimen_cases.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
assert.ok(context.QimenCases.length);
for (const item of context.QimenCases) {
  const [year, month, day, hour, minute] = item.datetime.split(/[-T:]/).map(Number);
  const chart = context.QimenStatic.buildChart({ year, month, day, hour, minute, yuanMethod: 'yinpan' });
  const expected = item.material_chart;
  const differences = [];
  function compare(field, actual, material) {
    if (JSON.stringify(actual) !== JSON.stringify(material)) differences.push(`${field}：教材 ${JSON.stringify(material)}／引擎 ${JSON.stringify(actual)}`);
  }
  for (const key of ['dun', 'ju', 'bazi', 'value_star', 'value_door', 'xun_empty', 'horse_star']) compare(key, chart[key], expected[key]);
  for (const [number, palace] of Object.entries(expected.palaces)) {
    for (const key of ['god', 'star', 'door', 'heaven_stem', 'earth_stem']) compare(`${number}宮.${key}`, chart.palaces[number][key], palace[key]);
  }
  const actual = {};
  for (const key of ['dun', 'ju', 'value_star', 'value_door', 'bazi', 'xun_empty', 'horse_star']) actual[key] = chart[key];
  const check = { status: differences.length ? '有差異' : '一致', actual, differences };
  if (process.argv.includes('--update')) item.engine_check = check;
  else assert.deepEqual(JSON.parse(JSON.stringify(item.engine_check)), JSON.parse(JSON.stringify(check)), `${item.id} 比對紀錄過期`);
  const source = item.source_slides.length ? `投影片 ${item.source_slides.join('、')}` : (item.source_documents || []).map((doc) => `${doc.filename} 第 ${doc.pages.join('、')} 頁`).join('；');
  console.log(`${item.id}｜${item.title}｜${item.datetime}｜${source}｜${chart.dun}遁${chart.ju}局｜值符${chart.value_star}｜值使${chart.value_door}｜${check.status}（${differences.length} 項）`);
  for (const difference of differences) console.log(`  ${difference}`);
}
if (process.argv.includes('--update')) fs.writeFileSync(path.join(root, 'qimen_cases.js'), `window.QimenCases = ${JSON.stringify(context.QimenCases, null, 2)};\n`);
