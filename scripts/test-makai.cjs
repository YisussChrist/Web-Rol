const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
function load(saved = null, published = null) {
  const elements = new Map(); let storage = saved, failWrite = false, blob;
  function el() { return { value: '', textContent: '', listeners: {}, innerHTML: '', addEventListener(t, fn) { this.listeners[t] = fn; }, querySelector() { return null; }, querySelectorAll() { return []; }, setAttribute() {}, append() {}, remove() {}, click() {}, reset() {}, showModal() {}, close() {}, focus() {}, scrollIntoView() {}, reportValidity() { return true; } }; }
  const get = id => { if (!elements.has(id)) elements.set(id, el()); return elements.get(id); };
  get('edit-form').elements = { namedItem: get };
  const document = { getElementById: get, querySelector: () => el(), querySelectorAll: () => [], body: el(), createElement: el };
  class TestURL extends URL { static createObjectURL(b) { blob = b; return 'blob:test'; } static revokeObjectURL() {} }
  const context = { document, location: { href: 'http://localhost/makai.html', protocol: 'http:' }, URL: TestURL, Blob, structuredClone, setTimeout() {}, crypto: require('node:crypto').webcrypto, localStorage: { getItem: () => storage, setItem(k, v) { if (failWrite) throw Error('full'); storage = v; } }, window: { confirm: () => true, matchMedia: () => ({ matches: false }) } };
  vm.runInNewContext(read('makai-datos.js'), context);
  if (published) context.window.MAKAI_DATA = published;
  vm.runInNewContext(read('assets/js/makai-stats.js'), context);
  vm.runInNewContext(read('assets/js/makai.js'), context);
  return { get, S: context.window.LeagueStats, stored: () => JSON.parse(storage), fail: v => { failWrite = v; }, blob: () => blob };
}
async function main() {
  const app = load(), S = app.S;
  assert.equal(app.get('total').textContent, 17);
  const stats = S.blank(); S.keys.forEach(k => stats.base[k] = 100); stats.nature = 'Firme';
  assert.equal(S.values(stats).hp, 100); assert.equal(S.values(stats).atk, 100); assert.equal(S.values(stats).spa, 100);
  assert.equal(S.modified(100, 6), 400); assert.equal(S.modified(100, -6), 25); assert.equal(S.modified(null, 1), null);
  assert.equal(S.natures.length, 25);
  const oldStats = structuredClone(stats); delete oldStats.valueMode; oldStats.battle.hp = 160;
  assert.equal(S.validate(oldStats).battle.hp, 100);
  oldStats.battle.hp = 60; assert.equal(S.validate(oldStats).battle.hp, 60);
  const tooMuchHp = structuredClone(stats); tooMuchHp.battle.hp = 101;
  assert.throws(() => S.validate(tooMuchHp));
  const source = { window: {} }; vm.runInNewContext(read('makai-datos.js'), source);
  const antiquiles = source.window.MAKAI_DATA.villains.find(v => v.id === 'antiquiles');
  assert.equal(S.values(S.validate(antiquiles.stats)).hp, 150);
  app.get('search').value = 'Antiquiles'; app.get('search').listeners.input();
  assert.match(app.get('detail').innerHTML, /150 \/ 150/);
  app.get('search').value = 'Zoya'; app.get('search').listeners.input();
  for (const bad of [-1, 0, 256, 1.5, '10']) { const invalid = structuredClone(stats); invalid.base.atk = bad; assert.throws(() => S.validate(invalid)); }
  const badStage = structuredClone(stats); badStage.battle.stages.atk = 7; assert.throws(() => S.validate(badStage));
  app.get('edit-top').listeners.click();
  S.keys.forEach(k => app.get('base-' + k).value = '100'); app.get('nature').value = 'Firme';
  app.get('edit-form').listeners.submit({ preventDefault() {} });
  assert.equal(app.stored().villains.find(v => v.id === 'zoya').stats.base.hp, 100);
  app.get('full-health').listeners.click();
  app.get('hp-amount').value = '30'; app.get('damage').listeners.click();
  assert.equal(app.stored().villains.find(v => v.id === 'zoya').stats.battle.hp, 70);
  const reload = load(JSON.stringify(app.stored())); assert.match(reload.get('detail').innerHTML, /70 \/ 100/);
  app.fail(true); app.get('damage').listeners.click(); assert.equal(app.stored().villains.find(v => v.id === 'zoya').stats.battle.hp, 70); assert.match(app.get('battle-notice').textContent, /no permite guardar/); app.fail(false);
  app.get('export-code').listeners.click(); const exported = { window: {} }; vm.runInNewContext(await app.blob().text(), exported);
  assert.equal(exported.window.MAKAI_DATA.villains.find(v => v.id === 'zoya').stats.battle.hp, 70);
  const published = load(null, exported.window.MAKAI_DATA); assert.match(published.get('detail').innerHTML, /70 \/ 100/);
  app.get('export').listeners.click(); const data = await app.blob().text();
  const target = load(); const file = target.get('import-file'); file.files = [{ size: data.length, text: async () => data }]; await file.listeners.change({ target: file });
  assert.equal(target.stored().villains.find(v => v.id === 'zoya').stats.nature, 'Firme');
  const before = JSON.stringify(target.stored()); const invalid = JSON.parse(data); invalid.villains[0].stats.battle.hp = -1; file.files = [{size: 1, text: async () => JSON.stringify(invalid)}]; await file.listeners.change({target: file}); assert.equal(JSON.stringify(target.stored()), before);
  const legacy = JSON.parse(data); legacy.villains.forEach(v => delete v.stats); assert.equal(load(JSON.stringify(legacy)).get('total').textContent, 17);
  console.log('OK: nivel 50, naturalezas, etapas, validación, edición, daño, recarga, fallo de guardado, exportación JS/JSON, importación y copias antiguas.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
