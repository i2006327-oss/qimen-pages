const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { parseHtml } = require('./static_dom_helper');
const root = path.resolve(__dirname, '..');
for (const filename of ['index.html', 'qimen_static.html']) {
  const html = fs.readFileSync(path.join(root, filename), 'utf8');
  assert.ok(!html.includes('????'), filename + ': corrupted text');
  const settingsStart = html.indexOf('<details id="chartSettings"');
  const settingsEnd = html.indexOf('</details>', settingsStart);
  const navStart = html.indexOf('<nav class="tabs"');
  assert.ok(settingsStart >= 0 && settingsEnd > settingsStart && navStart > settingsEnd, filename + ': settings must close before tabs');
  const settingsHtml = html.slice(settingsStart, settingsEnd);
  assert.equal((settingsHtml.match(/<details\b/g) || []).length, 1, filename + ': nested details');
  assert.ok(!settingsHtml.includes('</section>'), filename + ': mismatched settings closing tag');
  assert.match(settingsHtml, /<summary>\u6392\u76e4\u8a2d\u5b9a<\/summary>/);
  const panelPositions = [...html.matchAll(/<section\b[^>]*class="[^"]*\btab-panel\b/g)].map((match) => match.index);
  assert.equal(panelPositions.length, 7, filename + ': all tab panels found');
  assert.ok(panelPositions.every((position) => position > settingsEnd), filename + ': panels must be outside settings');
  const document = parseHtml(html);
  const context = vm.createContext({ document, console, navigator: {}, location: { protocol: 'file:' }, alert: (message) => { throw Error(message); } });
  context.window = context;
  for (const node of document.elements.filter((n) => n.tagName === 'script')) vm.runInContext(fs.readFileSync(path.join(root, node.src.split('?')[0]), 'utf8'), context);
  const numberPanel = document.getElementById('number');
  for (const id of ['numberKind', 'numberInput', 'numberGender', 'numberYear', 'numberBtn']) {
    let element = document.getElementById(id);
    while (element && element !== numberPanel) element = element.parentElement;
    assert.equal(element, numberPanel, `${id} ???????`);
  }
  document.getElementById('numberInput').value = '0912345678';
  document.getElementById('numberBtn').events.click();
  assert.ok(document.getElementById('numberCards').children.length > 0);
  assert.ok(document.getElementById('numberText').textContent.length > 0);
  document.getElementById('chartSettings').open = true;
  document.elements.find((node) => node.dataset.tab === 'daily').events.click();
  assert.equal(document.getElementById('chartSettings').open, false);
  for (const [storage, restored] of [
    [{ getItem: () => 'daily', setItem() {} }, true],
    [{ getItem() { throw Error('storage unavailable'); }, setItem() { throw Error('storage unavailable'); } }, false],
  ]) {
    const freshDocument = parseHtml(html);
    const fresh = vm.createContext({ document: freshDocument, console, localStorage: storage, navigator: {}, location: { protocol: 'file:' }, alert: (message) => { throw Error(message); } });
    fresh.window = fresh;
    for (const node of freshDocument.elements.filter((n) => n.tagName === 'script')) vm.runInContext(fs.readFileSync(path.join(root, node.src.split('?')[0]), 'utf8'), fresh);
    if (restored) {
      assert.ok(freshDocument.getElementById('daily').className.includes('active'));
      assert.equal(freshDocument.getElementById('chartSettings').open, false);
      assert.equal(freshDocument.getElementById('dailyResults').children.length, 8);
      assert.equal(freshDocument.getElementById('dailyDate').value, fresh.dailyTaipeiDate());
    } else assert.ok(freshDocument.getElementById('chart').className.includes('active'));
  }
  const build = (day) => context.buildDailyResults(`2026-11-${day}`, 'yinpan');
  const row = (results, hour) => results.find((item) => item.hour === hour);
  const a = build('09'), b = build('10'), c = build('11'), d = build('12');
  if (filename === 'index.html') for (const [day, rows] of [['09', a], ['10', b], ['11', c], ['12', d]]) console.log(`2026-11-${day}: ${rows.map((r) => `${r.branch} ${r.grade}${r.rank ? `(${r.rank})` : ''} [${r.mainHarmCount},${r.chart.eight_harm_count}]`).join('｜')}`);
  assert.equal(row(a, 19).grade, '上'); assert.equal(row(a, 19).rank, '推薦');
  assert.ok(row(a, 19).main.every((p) => p.name === '巽四宮'));
  assert.equal(row(c, 19).grade, '避開');
  assert.equal(row(c, 15).grade, '中'); assert.equal(row(c, 15).rank, '推薦');
  assert.equal(row(d, 19).grade, '避開'); assert.ok(row(d, 19).five);
  assert.equal(row(d, 13).grade, '中'); assert.equal(row(d, 13).rank, '推薦');
  assert.ok(b.every((item) => item.self.number === item.capital.number && item.main.length <= 2));
  document.getElementById('chartType').value = '終身盤（出生盤）';
  document.getElementById('nowBtn').events.click();
  assert.equal(document.getElementById('chartType').value, '時盤（預測盤）');
  assert.equal(document.getElementById('queryConditions').style.display, 'grid');
  document.getElementById('dailyDate').value = '2026-11-12';
  document.getElementById('dailyCompare').events.click();
  const cards = document.getElementById('dailyResults').children;
  assert.equal(cards.length, 8); cards[4].children.find((e) => e.textContent === '載入此盤').events.click();
  assert.equal(document.getElementById('hour').value, '13'); assert.equal(document.getElementById('minute').value, '30');
  assert.equal(document.getElementById('topic').value, '財運'); assert.ok(document.getElementById('chart').className.includes('active'));
  let opened = '';
  context.open = () => ({ location: { set href(value) { opened = value; } } });
  context.dailyMap(row(d, 13).wealth);
  assert.equal(opened, 'https://www.google.com/maps/search/彩券行');
  assert.match(document.getElementById('dailyLocationStatus').textContent, /不支援定位/);
  let saved = null, requests = 0;
  context.localStorage = { getItem: () => saved, setItem: (key, value) => { saved = value; }, removeItem: () => { saved = null; } };
  context.navigator.geolocation = { getCurrentPosition(success) { requests++; success({ coords: { latitude: 0, longitude: 0 } }); } };
  document.getElementById('dailyRemember').checked = true;
  context.dailyMap(row(d, 13).wealth); assert.match(opened, /\/\@-?\d+\.\d+,-?\d+\.\d+,16z$/);
  context.dailyMap(row(d, 13).wealth); assert.equal(requests, 1);
  document.getElementById('dailyClearLocation').events.click(); assert.equal(saved, null);
  const explanation = context.QimenStatic.toResponse(row(d, 13).chart).explanation;
  assert.ok((explanation.match(/做法反覆，容易原地打轉/g) || []).length <= 1);
  assert.equal((explanation.match(/感情：/g) || []).length, 1);
  for (const name of ['index.html', 'qimen_static.html', 'qimen_static_app.js', 'qimen_daily.js']) assert.doesNotMatch(fs.readFileSync(path.join(root, name), 'utf8'), /(?:24|120)\.\d{3,}/);
  assert.equal(row(c, 5).rank, '次選', '11 月 11 日卯時預期次選');
  console.log(`${filename}：指定日期、現在、載入、解說、座標檢查 PASS`);
  if (filename === 'index.html') for (const [day, rows] of [['09', a], ['10', b], ['11', c], ['12', d]]) console.log(`2026-11-${day}: ${rows.map((r) => `${r.branch} ${r.grade}${r.rank ? `(${r.rank})` : ''}`).join('｜')}`);
}
