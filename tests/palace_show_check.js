const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseHtml } = require('./static_dom_helper');
const root = path.resolve(__dirname, '..');
const panelTexts = {};
for (const filename of ['index.html', 'qimen_static.html']) {
  const document = parseHtml(fs.readFileSync(path.join(root, filename), 'utf8'));
  const context = vm.createContext({ document, console, navigator: {}, location: { protocol: 'file:' }, alert(message) { throw new Error(message); } });
  context.window = context;
  for (const script of document.elements.filter((e) => e.tagName === 'script')) {
    vm.runInContext(fs.readFileSync(path.join(root, script.src.split('?')[0]), 'utf8'), context, { filename: script.src });
  }
  const get = (id) => document.getElementById(id);
  for (const [id, value] of Object.entries({ year: '2026', month: '10', day: '15', hour: '21', minute: '00', yuanMethod: 'yinpan' })) get(id).value = value;
  get('chartBtn').events.click();
  assert.match(get('headerText').textContent, /陰遁7局/);
  const panel = get('palacePanel');
  const text = () => get('palacePanelTitle').textContent + '\n' + get('palacePanelText').textContent;
  const cells = () => get('qimenGrid').children.filter((e) => e.dataset.palace);
  const cell = (n) => cells().find((e) => e.dataset.palace === String(n));
  const button = (n) => cell(n).children.find((e) => e.className === 'palace-show');
  const open = (n) => button(n).events.click();
  assert.equal(panel.hidden, true);
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    assert.equal(button(n).tagName, 'button');
    assert.equal(button(n).type, 'button');
    assert.equal(button(n)['aria-controls'], 'palacePanel');
    assert.equal(button(n)['aria-expanded'], 'false');
    assert.ok(button(n)['aria-label']);
  }
  open(4);
  assert.equal(panel.hidden, false);
  assert.equal(button(4)['aria-expanded'], 'true');
  assert.ok(cell(4).className.includes('palace-selected'));
  assert.match(text(), /巽四宮・東南.*第一用神.*值符宮.*馬星宮/);
  assert.match(text(), /擊刑｜成因：天盤壬落4宮/);
  assert.match(text(), /入墓｜成因：天盤壬的墓在辰，辰在本宮；地盤辛的墓在辰/);
  assert.match(text(), /本宮無伏吟反吟/);
  assert.match(text(), /天盤干：壬｜地盤干：辛/);
  assert.match(text(), /地支：辰、巳｜十二長生（用干壬）：辰墓、巳絕/);
  panelTexts[filename + '-4'] = text();
  open(1);
  assert.equal(button(4)['aria-expanded'], 'false');
  assert.ok(!cell(4).className.includes('palace-selected'));
  assert.match(text(), /門迫｜成因：死門（土）剋本宮（水）/);
  open(3);
  assert.match(text(), /^震三宮・東\n/);
  assert.match(text(), /空亡｜成因：本宮地支卯為甲辰旬空（寅卯）/);
  assert.match(text(), /門迫｜成因：開門（金）剋本宮（木）/);
  assert.equal(cells().filter((e) => e.className.includes('palace-selected')).length, 1);
  panelTexts[filename + '-3'] = text();
  open(7);
  assert.match(text(), /本宮無四害/);
  open(5);
  assert.match(text(), /陰盤法中宮不列，五寄坤二宮/);
  assert.equal(get('palaceHostBtn').hidden, false);
  get('palaceHostBtn').events.click();
  assert.match(text(), /^坤二宮・西南/);
  assert.equal(button(2)['aria-expanded'], 'true');
  assert.equal(get('palaceHostBtn').hidden, true);
  open(5);
  open(5);
  assert.equal(panel.hidden, true);
  assert.equal(button(5).focused, true);
  open(4);
  get('palaceCloseBtn').events.click();
  assert.equal(panel.hidden, true);
  assert.equal(button(4).focused, true);
  open(3);
  let prevented = false;
  document.events.keydown({ key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(panel.hidden, true);
  assert.equal(button(3).focused, true);
  open(4);
  get('hour').value = '09';
  get('chartBtn').events.click();
  assert.equal(panel.hidden, true);
  assert.equal(text(), '\n');
  assert.equal(cells().filter((e) => e.className.includes('palace-selected')).length, 0);
  assert.ok(cells().every((e) => e.children.find((c) => c.className === 'palace-show')['aria-expanded'] === 'false'));
  // 案例載入及盤種切換也必須關閉。
  open(4);
  get('caseList').children[0].children.at(-1).events.click();
  assert.equal(panel.hidden, true);
  open(4);
  get('chartType').events.change();
  assert.equal(panel.hidden, true);
  console.log(`${filename}：四害具體成因、標記、寄宮跳轉、單宮切換、同宮／關閉／Esc、三種換盤收起 PASS`);
  // 對不同盤的各宮，面板列出的四害／伏吟反吟必須與原始判定完全一致。
  const core = context.QimenStatic;
  const coverage = new Set();
  let fiveCount = 0;
  for (let day = 1; day <= 12; day++) {
    for (const hour of [0, 5, 9, 15, 21]) {
      const chart = core.buildChart({ year: 2026, month: 10, day, hour });
      const snapshot = JSON.stringify(chart);
      const response = core.toResponse(chart);
      for (const p of Object.values(chart.palaces).filter((p) => p.number !== 5)) {
        const a = response.palaces[p.number].analysis;
        assert.equal(a.labels.includes('第一用神'), p.number === chart.first_yongshen_palace);
        assert.equal(a.labels.includes('第二用神'), p.number === chart.second_yongshen_palace);
        assert.equal(a.labels.includes('值符宮'), p.god === '值符');
        assert.equal(a.labels.includes('值使宮'), p.number === chart.value_door_palace);
        assert.equal(a.labels.includes('馬星宮'), p.has_horse);
        assert.deepEqual(Array.from(a.harms, (e) => e.name).sort(), Array.from(p.flags).filter((f) => ['空亡', '入墓', '擊刑', '門迫'].includes(f)).sort());
        assert.deepEqual(Array.from(a.resonance, (e) => e.name), Array.from(p.resonance_flags));
        for (const item of [...a.harms, ...a.resonance]) {
          assert.ok(item.cause && item.advice);
          assert.doesNotMatch(item.cause + item.advice, /undefined|null/);
          coverage.add(item.name);
        }
        const dayStem = chart.bazi[2][0], hourStem = chart.bazi[3][0];
        const expectedFive = { 甲: '庚', 乙: '辛', 丙: '壬', 丁: '癸', 戊: '甲', 己: '乙', 庚: '丙', 辛: '丁', 壬: '戊', 癸: '己' }[dayStem] === hourStem;
        assert.equal(Boolean(a.five), expectedFive && p.number === chart.second_yongshen_palace);
        if (a.five) { fiveCount++; assert.match(a.five, /五不遇時.*時干.*剋日干/); }
        const sentences = a.summary.split('。').filter(Boolean);
        assert.ok(sentences.length >= 2 && sentences.length <= 3);
      }
      assert.equal(JSON.stringify(chart), snapshot, '新增解析不可修改排盤');
    }
  }
  for (const name of ['空亡', '入墓', '擊刑', '門迫', '干伏吟', '門伏吟', '星伏吟', '干反吟', '門反吟', '星反吟']) assert.ok(coverage.has(name), name);
  assert.ok(fiveCount > 0);
  console.log(`${filename}：60 盤逐宮比對、四害與六類伏吟反吟、五不遇時、2–3 句小結、排盤唯讀 PASS`);
}
assert.equal(panelTexts['index.html-4'], panelTexts['qimen_static.html-4']);
assert.equal(panelTexts['index.html-3'], panelTexts['qimen_static.html-3']);
if (process.argv.includes('--panels')) {
  console.log('\n巽四宮面板全文\n' + panelTexts['index.html-4']);
  console.log('\n震三宮面板全文\n' + panelTexts['index.html-3']);
}
