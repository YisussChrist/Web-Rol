(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.Budokai = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const power = value => {
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
    const text = String(value ?? '').trim().replace(/\./g, '');
    return /^\d+$/.test(text) ? Number(text) : null;
  };
  function fighter(character) {
    const base = power(character.strength ?? character.strenght);
    const forms = (character.transformations || []).filter(form => !form.disabled)
      .map(form => ({ name: form.name, power: power(form.strength ?? form.strenght) }));
    const known = [{ name: 'Forma base', power: base }, ...forms].filter(form => form.power !== null);
    const peak = known.reduce((best, form) => !best || form.power > best.power ? form : best, null);
    return { id: character.name, name: character.name, photo: character.photo || '', base, forms,
      peak, uncertain: base === null || forms.some(form => form.power === null),
      disabled: (character.transformations || []).filter(form => form.disabled).length };
  }
  function sizes(total) {
    const result = [];
    for (let count = 2; count <= total; count *= 2) result.push(count);
    return result;
  }
  function shuffle(list, random = Math.random) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function pair(ids) {
    if (ids.length < 2 || (ids.length & (ids.length - 1)) || new Set(ids).size !== ids.length)
      throw new Error('Elige un número válido de participantes distintos.');
    return Array.from({ length: ids.length / 2 }, (_, i) => ({ fighters: ids.slice(i * 2, i * 2 + 2), winner: null }));
  }
  function advance(round) {
    if (round.length < 2 || round.some(match => !match.fighters.includes(match.winner)))
      throw new Error('Decide todos los combates de esta ronda.');
    return pair(round.map(match => match.winner));
  }
  function choose(rounds, roundIndex, matchIndex, winner) {
    const match = rounds[roundIndex]?.[matchIndex];
    if (!match || !match.fighters.includes(winner)) throw new Error('Ganador no válido.');
    if (match.winner === winner) return rounds;
    const result = rounds.slice(0, roundIndex + 1).map(round => round.map(m => ({ ...m, fighters: [...m.fighters] })));
    result[roundIndex][matchIndex].winner = winner;
    return result;
  }
  function restore(raw, ids) {
    if (!raw || raw.version !== 1 || !sizes(ids.length).includes(raw.size)) return null;
    const allowed = new Set(ids);
    if (!Array.isArray(raw.selected) || raw.selected.length > raw.size || new Set(raw.selected).size !== raw.selected.length
        || raw.selected.some(id => !allowed.has(id)) || !Array.isArray(raw.rounds)) return null;
    let expected = raw.size / 2;
    for (let i = 0; i < raw.rounds.length; i++) {
      const round = raw.rounds[i];
      if (expected < 1 || !Array.isArray(round) || round.length !== expected) return null;
      if (round.some(m => !Array.isArray(m.fighters) || m.fighters.length !== 2 || m.fighters.some(id => !allowed.has(id))
          || (m.winner !== null && !m.fighters.includes(m.winner)))) return null;
      const actual = round.flatMap(m => m.fighters);
      if (new Set(actual).size !== actual.length) return null;
      if (i === 0 && (actual.length !== raw.selected.length || actual.some(id => !raw.selected.includes(id)))) return null;
      if (i > 0) {
        const previous = raw.rounds[i - 1].map(m => m.winner);
        if (actual.some((id, j) => id !== previous[j])) return null;
      }
      expected /= 2;
    }
    return { version: 1, size: raw.size, selected: [...raw.selected], rounds: raw.rounds };
  }
  return { power, fighter, sizes, shuffle, pair, advance, choose, restore };
});
