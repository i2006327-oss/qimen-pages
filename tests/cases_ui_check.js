const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

// 僅提供介面使用的 DOM 行為，驗證資料載入及事件；不代替瀏覽器排版驗證。
class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.events = {};
    this.className = '';
    this.value = '';
    this.textContent = '';
    this.classList = { toggle: (name, enabled) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      if (enabled) classes.add(name); else classes.delete(name);
      this.className = [...classes].join(' ');
    } };
  }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  append(...children) { children.forEach((child) => this.appendChild(child)); }
  replaceChildren() { this.children = []; }
  set innerHTML(value) { this.children = []; this.html = value; }
  get innerHTML() { return this.html || ''; }
  get options() { return this.children.filter((child) => child.tagName === 'option'); }
  addEventListener(event, handler) { this.events[event] = handler; }
  setAttribute(name, value) { this[name] = value; }
  scrollIntoView() { this.scrolled = true; }
}

function parseHtml(html) {
  const document = new Element('document');
  const stack = [document];
  const elements = [];
  for (const token of html.match(/<[^>]+>|[^<]+/g)) {
    if (token.startsWith('</')) { stack.pop(); continue; }
    if (token.startsWith('<!')) continue;
    if (!token.startsWith('<')) {
      const current = stack[stack.length - 1];
      current.textContent += token.trim();
      if (current.tagName === 'option' && !current.explicitValue) current.value = current.textContent;
      continue;
    }
    const tag = token.match(/^<([\w-]+)/)[1];
    const element = new Element(tag);
    for (const match of token.matchAll(/([\w-]+)="([^"]*)"/g)) {
      const [, key, value] = match;
      if (key === 'class') element.className = value;
      else if (key === 'data-tab') element.dataset.tab = value;
      else element[key] = value;
      if (key === 'value') element.explicitValue = true;
    }
    stack[stack.length - 1].appendChild(element);
    elements.push(element);
    if (!['meta', 'link', 'input', 'br'].includes(tag)) stack.push(element);
  }
  for (const element of elements.filter((node) => node.tagName === 'select')) element.value = element.options[0]?.value || '';
  document.createElement = (tag) => new Element(tag);
  document.getElementById = (id) => elements.find((element) => element.id === id);
  document.querySelectorAll = (selector) => elements.filter((element) => element.className.split(/\s+/).includes(selector.slice(1)));
  document.elements = elements;
  return document;
}

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
assert.equal(vm.runInContext('CACHE_NAME', worker), 'qimen-pwa-v23');
const assets = vm.runInContext('ASSETS', worker);
for (const src of index.matchAll(/(?:src|href)="\.\/([^" ]+\.(?:js|css)(?:\?[^" ]*)?)"/g)) assert.ok(assets.includes(`https://example.test/${src[1]}`));
console.log('PWA: v23、入口頁全部 JS／CSS 快取 URL PASS');
