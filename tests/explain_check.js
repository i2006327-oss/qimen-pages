const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ console });
context.window = context;
for (const file of ['lunar.js', 'qimen_static_core.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const api = context.QimenStatic;
const directions = { 1: '北', 2: '西南', 3: '東', 4: '東南', 6: '西北', 7: '西', 8: '東北', 9: '南' };
const rules = [['財運', 'door', '生門'], ['感情', 'god', '六合'],
  ['感情', 'heaven_stem', '乙'], ['感情', 'heaven_stem', '庚'],
  ['事業', 'door', '開門'], ['健康', 'star', '天芮星']];
const dates = [[2026, 10, 15, 21], [2025, 2, 27, 20], [2024, 7, 18, 13], [2026, 3, 10, 4]];
function build([year, month, day, hour]) { return api.buildChart({ year, month, day, hour }); }
function section(text, start, end) { return text.split(start + '\n')[1].split('\n\n' + end)[0]; }
for (const [index, date] of dates.entries()) {
  const chart = build(date);
  const snapshot = JSON.stringify(chart);
  for (const topic of ['一般', '財運', '投資', '感情', '事業', '健康', '失物', '店面客源', '合作人際']) {
    const response = api.toResponse(chart, { topic });
    assert.doesNotMatch(JSON.stringify(response), /中五宮：、、/);
    assert.doesNotMatch(response.explanation + response.issueTable, /中五宮/);
    const fortune = section(response.explanation, '三、各項運勢', '四、可用宮位');
    assert.equal(fortune.split('\n').filter((line) => /^(財運|感情|事業|健康)：/.test(line)).length, 6);
    for (const [name, field, symbol] of rules) {
      const p = Object.values(chart.palaces).find((p) => field === 'heaven_stem'
        ? p[field].includes(symbol) : p[field] === symbol);
      assert.ok(p && p.number !== 5);
      const line = fortune.split('\n').find((line) => line.startsWith(`${name}：`) && line.includes(`用神：${symbol}。`));
      assert.ok(line, `${name}/${symbol} 缺落宮`);
      assert.ok(line.includes(`${name}看${p.name}（${directions[p.number]}），見${p.god}、${p.star}、${p.door}。`));
      if (topic === name) assert.ok(response.explanation.includes(`- ${p.name}${directions[p.number]}方：`), '案例式斷盤須取相同用神');
    }
    const good = section(response.explanation, '四、可用宮位', '五、四害與動象：');
    assert.equal(good.split('\n').filter((line) => line.startsWith('- ')).length, 4);
  }
  assert.equal(JSON.stringify(chart), snapshot, '解說不得改動排盤');
  if (index === 0) {
    assert.equal(chart.palaces[9].door, '生門');
    assert.equal(chart.palaces[1].god, '六合');
    assert.equal(chart.palaces[3].heaven_stem, '乙');
    assert.ok(chart.palaces[7].heaven_stem.includes('庚'));
    assert.equal(chart.palaces[3].door, '開門');
    assert.equal(chart.palaces[7].star, '天芮星');
  }
  console.log(`${date.join('-')}：6 個用神落宮、方位、9 種主題、中宮排除、排盤唯讀 PASS`);
}
// 模擬來源將用神仍放在中五：解說必須以坤二寄宮描述，不改原盤。
const hosted = build(dates[0]);
hosted.first_yongshen_palace = 5;
hosted.second_yongshen_palace = 5;
hosted.value_door_palace = 5;
for (const [field, symbol] of [['god', '六合'], ['star', '天芮星'], ['door', '生門'], ['heaven_stem', '乙庚']]) {
  for (const p of Object.values(hosted.palaces)) {
    if (field === 'heaven_stem') p[field] = p[field].replace(/[乙庚]/g, '');
    else if (p[field] === symbol) p[field] = `測試${symbol}`;
  }
  hosted.palaces[5][field] = symbol;
}
const hostedText = api.toResponse(hosted, { topic: '感情' }).explanation;
assert.doesNotMatch(hostedText, /中五宮/);
for (const name of ['財運', '感情', '健康']) assert.ok(hostedText.includes(`${name}看坤二宮（西南）`));
assert.match(hostedText, /第一用神.*落坤二宮/);
assert.match(hostedText, /第二用神.*落坤二宮/);
console.log('中五用神寄坤二、案例式斷盤 PASS');
// 空白或欠缺任一門星神的外宮也不得當成可用或風險宮；不退回分數排序。
for (const field of ['door', 'star', 'god']) {
  const chart = build(dates[0]);
  chart.palaces[9][field] = '';
  chart.palaces[9].flags = ['空亡'];
  const response = api.toResponse(chart);
  assert.doesNotMatch(section(response.explanation, '四、可用宮位', '五、四害與動象：'), /離九宮/);
  assert.doesNotMatch(section(response.explanation, '六、風險位', '七、行動建議'), /離九宮/);
  assert.doesNotMatch(response.issueTable, /^離九宮｜/m);
  assert.match(response.explanation, /財運用神（生門）未見有效落宮/);
}
assert.match(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), /CACHE_NAME = "qimen-pwa-v25"/);
console.log('缺門／星／神排除、用神缺失不評分替補、快取 v25 PASS');
