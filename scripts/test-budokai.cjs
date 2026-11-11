const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const E = require('../assets/js/budokai-engine.js');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(require.resolve('../assets/js/poder-datos.js'), 'utf8') + ';globalThis.roster=characters;', context);
const roster = Array.from(context.roster, E.fighter);
assert.equal(new Set(roster.map(f => f.id)).size, roster.length);
assert.equal(E.power('1.400.000.000'), 1400000000);
assert.equal(E.power('???'), null);
assert.equal(E.power(''), null);
assert.equal(E.power('12 desconocido'), null);
assert.equal(E.fighter({ name: 'Legacy', strength: '2', transformations: [{ name: 'Forma', strenght: '1.000' }] }).peak.power, 1000);
assert.equal(E.fighter({ name: 'Desconocido', strength: '2', transformations: [{ name: '?', strength: '???' }] }).uncertain, true);
assert.equal(E.fighter({ name: 'Base mayor', strength: '100', transformations: [{ name: 'Forma', strength: '50' }] }).peak.power, 100);
const velvet = roster.find(f => f.name === 'Velvet Crowe');
assert.equal(velvet.peak.power, velvet.base);
assert.equal(velvet.forms.length, 0);
assert.equal(velvet.disabled, 1);
const ids = roster.map(f => f.id);
for (const size of E.sizes(roster.length)) {
  const selected = ids.slice(0, size);
  const shuffled = E.shuffle(selected);
  assert.deepEqual([...shuffled].sort(), [...selected].sort());
  assert.deepEqual(ids.slice(0, size), selected);
  let rounds = [E.pair(shuffled)], roundIndex = 0;
  const initialBracket = E.bracket(size, rounds);
  assert.equal(initialBracket.length, Math.log2(size));
  assert.equal(initialBracket.flat().length, size - 1);
  assert.deepEqual(initialBracket[0].flatMap(m => m.fighters), shuffled);
  assert.ok(initialBracket.slice(1).flat().every(m => !m.available && m.fighters.every(id => id === null)));
  assert.throws(() => E.advance(rounds[0]));
  while (true) {
    for (let i = 0; i < rounds[roundIndex].length; i++) {
      const winner = rounds[roundIndex][i].fighters[i % 2];
      rounds = E.choose(rounds, roundIndex, i, winner);
      const preview = E.bracket(size, rounds);
      if (roundIndex + 1 < preview.length) assert.equal(preview[roundIndex + 1][Math.floor(i / 2)].fighters[i % 2], winner);
    }
    if (rounds[roundIndex].length === 1) break;
    rounds.push(E.advance(rounds[roundIndex++]));
  }
  assert.equal(rounds.length, Math.log2(size));
  assert.equal(rounds.flat().length, size - 1);
  assert.equal(E.bracket(size, rounds).at(-1)[0].winner, rounds.at(-1)[0].winner);
  const saved = { version: 1, size, selected, rounds };
  assert.ok(E.restore(JSON.parse(JSON.stringify(saved)), ids));
  const changed = E.choose(rounds, 0, 0, rounds[0][0].fighters[1]);
  assert.equal(changed.length, 1);
  const revisedBracket = E.bracket(size, changed);
  if (size > 2) {
    assert.equal(revisedBracket[1][0].fighters[0], changed[0][0].winner);
    assert.ok(revisedBracket.slice(1).flat().every(m => m.winner === null && !m.available));
  }
  const invalid = JSON.parse(JSON.stringify(saved)); invalid.rounds[0][0].winner = 'Ausente';
  assert.equal(E.restore(invalid, ids), null);
  assert.equal(E.restore(saved, ids.slice(size)), null);
}
assert.throws(() => E.pair(ids.slice(0, 6)));
assert.throws(() => E.pair([ids[0], ids[0]]));
assert.throws(() => E.choose([E.pair(ids.slice(0, 2))], 0, 0, 'Ausente'));
console.log(`Budokai: ${roster.length} personajes; poderes, formas deshabilitadas, sorteos, todas las rondas, correcciones y guardado verificados.`);
