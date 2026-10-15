const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

// 僅提供介面使用的 DOM 行為，驗證資料載入及事件；不代替瀏覽器排版驗證。
const { parseHtml } = require('./static_dom_helper');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.equal(index, fs.readFileSync(path.join(root, 'qimen_static.html'), 'utf8'));
for (const filename of ['index.html', 'qimen_static.html']) {
  const html = fs.readFileSync(path.join(root, filename), 'utf8');
  const document = parseHtml(html);
  assert.ok(document.querySelectorAll('.tab').some((tab) => tab.dataset.tab === 'cases'));
  assert.ok(document.getElementById('cases'));
  const scripts = document.elements.filter((node) => node.tagName === 'script').map((node) => node.src);
  assert.ok(scripts.indexOf('./qimen_cases.js?v=23') < scripts.indexOf('./qimen_static_app.js?v=23'));
  assert.ok(scripts.includes('./qimen_cases.js?v=23'));
  const context = vm.createContext({ document, console, navigator: {}, location: { protocol: 'file:' }, alert: (message) => { throw new Error(message); } });
  context.window = context;
  for (const src of scripts) vm.runInContext(fs.readFileSync(path.join(root, src.split('?')[0]), 'utf8'), context, { filename: src });
  const list = document.getElementById('caseList');
  const filter = document.getElementById('caseCategory');
  assert.equal(list.children.length, context.QimenCases.length);
  for (const category of filter.options.slice(1).map((option) => option.value)) {
    filter.value = category;
    filter.events.change();
    assert.equal(list.children.length, context.QimenCases.filter((item) => item.category === category).length);
  }
  filter.value = '';
  filter.events.change();
  list.children.forEach((card, i) => {
    const supplements = card.children.filter((node) => node.className === 'case-supplement');
    assert.equal(supplements.length, 1);
    assert.equal(supplements[0].tagName, 'aside');
    assert.equal(supplements[0]['aria-label'], '補充解說，非教材原文');
    assert.equal(supplements[0].children[0].textContent, '補充｜非教材原文');
    assert.equal(supplements[0].children[1].textContent, context.QimenCases[i].supplement);
    document.querySelectorAll('.tab').find((tab) => tab.dataset.tab === 'cases').events.click();
    document.getElementById('yuanMethod').value = 'branch';
    card.children.at(-1).events.click();
    const item = context.QimenCases[i];
    assert.equal(['year', 'month', 'day', 'hour', 'minute'].map((id) => document.getElementById(id).value).join(','), item.datetime.split(/[-T:]/).join(','));
    assert.equal(document.getElementById('chartType').value, item.chartType);
    assert.equal(document.getElementById('yuanMethod').value, 'yinpan');
    assert.equal(document.getElementById('queryConditions').style.display, item.id === 'lifetime' ? 'none' : 'grid');
    assert.ok(document.getElementById('chart').className.includes('active'));
    assert.ok(document.getElementById('headerText').textContent.includes(item.datetime.slice(0, 10)));
    assert.equal(document.getElementById('qimenGrid').children.filter((node) => node.className.startsWith('palace')).length, 9);
  });
  console.log(`${filename}: 頁籤、載入順序、分類篩選、${context.QimenCases.length} 筆載入排盤及盤種切換 PASS`);
}
const worker = vm.createContext({ URL, self: { registration: { scope: 'https://example.test/' }, addEventListener() {} } });
vm.runInContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), worker);
assert.equal(vm.runInContext('CACHE_NAME', worker), 'qimen-pwa-v25');
const assets = vm.runInContext('ASSETS', worker);
for (const src of index.matchAll(/(?:src|href)="\.\/([^" ]+\.(?:js|css)(?:\?[^" ]*)?)"/g)) assert.ok(assets.includes(`https://example.test/${src[1]}`));
console.log('PWA: v25、入口頁全部 JS／CSS 快取 URL PASS');
