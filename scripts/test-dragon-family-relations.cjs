const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const relations = require('../assets/js/dragon-family-relations.js');
const source = fs.readFileSync('assets/js/parejasdragonball.js', 'utf8');
const context = vm.createContext({});
vm.runInContext(source.slice(0, source.indexOf('const familiesEl')) + ';globalThis.families = DATA;', context);
const multi = context.families.filter(f => f.parents.length > 2);
assert.equal(multi.length, 3);
const expected = {
  'Adelaide Grinberryall': 'Eula Lawrence',
  'Charlotte Grinberryall': 'Roxy Migurdia',
  'Cecilia Grinberryall': 'Eula Lawrence',
  'Tenka Shinso': 'Toru Hagakure',
  'Fadia Shinso': 'Himiko Toga',
  'Leo Mikado': 'Mereoleona Vermillion',
  'Evanescencia Mikado': 'Derieri Sukuna'
};
for (const family of multi) {
  assert.ok(relations.needsMother(family));
  for (const child of family.children) {
    assert.equal(relations.motherLabel(family, child), expected[child.name]);
    const parents = relations.parents(family, child);
    assert.equal(parents.length, 2);
    assert.ok(parents.some(p => p.relation === 'father'));
    assert.equal(parents.find(p => p.relation === 'mother').name, child.mother);
  }
  for (const mother of ['', 'Nombre inexistente', family.parents.find(p => p.relation === 'father').name]) {
    const child = {...family.children[0], mother};
    assert.equal(relations.motherLabel(family, child), 'Por asignar');
    assert.ok(relations.parents(family, child).every(p => p.relation === 'father'));
  }
}
for (const family of context.families.filter(f => f.parents.length <= 2)) {
  for (const child of family.children) assert.equal(relations.parents(family, child), family.parents);
}
console.log('Linajes DB: 7 madres asignadas, 3 familias múltiples, casos sin madre y familias existentes verificados.');
