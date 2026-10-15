const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const version = source.match(/qimen-pwa-v(\d+)/)[1];
const scope = 'https://example.test/app/';
const handlers = {};
const stored = new Map();
let installed;
let offline = false;
let status = 200;
let skipped = false;
let claimed = false;
const deleted = [];
const cache = {
  async addAll(requests) { installed = requests; },
  async put(request, response) { stored.set(request.url, response); }
};
vm.runInNewContext(source, {
  URL,
  Request: class extends Request {
    constructor(input, options) { super(input.url || input, options); }
  },
  self: {
    registration: { scope },
    addEventListener(type, handler) { handlers[type] = handler; },
    skipWaiting() { skipped = true; },
    clients: { claim() { claimed = true; } }
  },
  caches: {
    async open(name) { assert.equal(name, `qimen-pwa-v${version}`); return cache; },
    async match(request) { return stored.get(request.url); },
    async keys() { return ['qimen-pwa-v23', `qimen-pwa-v${version}`]; },
    async delete(name) { deleted.push(name); }
  },
  async fetch(request) {
    if (offline) throw new Error('offline');
    assert.equal(request.cache, 'reload');
    return new Response('network', { status });
  }
});
async function lifecycle(type) {
  let pending;
  handlers[type]({ waitUntil(value) { pending = value; } });
  await pending;
}
async function request(pathname, mode = 'cors') {
  let pending;
  handlers.fetch({ request: { method: 'GET', url: new URL(pathname, scope).href, mode }, respondWith(value) { pending = value; } });
  return pending;
}
(async () => {
  await lifecycle('install');
  assert.ok(skipped);
  assert.ok(installed.every((r) => r.cache === 'reload'));
  const assets = new Set(installed.map((r) => r.url));
  for (const filename of ['index.html', 'qimen_static.html', 'number_static.html']) {
    const html = fs.readFileSync(path.join(root, filename), 'utf8');
    for (const match of html.matchAll(/(?:src|href)="([^"]+\?v=([^"&]+)[^"]*)"/g)) {
      assert.equal(match[2], version, `${filename}: ${match[1]}`);
      assert.ok(assets.has(new URL(match[1], scope).href), match[1]);
    }
    assert.match(html, new RegExp(`<small>v${version}</small>`));
  }
  await lifecycle('activate');
  assert.ok(claimed);
  assert.deepEqual(deleted, ['qimen-pwa-v23']);
  for (const [pathname, mode] of [['index.html', 'navigate'], ['', 'navigate'], ['qimen_static_app.js?v=26', 'cors'], ['styles.css?v=26', 'cors']]) {
    offline = false; status = 200;
    const key = new URL(pathname, scope).href;
    stored.set(key, new Response('old'));
    assert.equal(await (await request(pathname, mode)).text(), 'network');
    assert.equal(await stored.get(key).clone().text(), 'network');
    offline = true;
    assert.equal(await (await request(pathname, mode)).clone().text(), 'network');
    offline = false; status = 503;
    assert.equal(await (await request(pathname, mode)).clone().text(), 'network');
  }
  console.log(`PASS: v${version} HTML / ASSETS consistency; install reload; activation cleanup; HTML/navigation/JS/CSS network-first, cache writes and offline/HTTP-error fallback`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
