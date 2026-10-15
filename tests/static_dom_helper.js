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
  focus() { this.focused = true; }
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

module.exports = { parseHtml };
