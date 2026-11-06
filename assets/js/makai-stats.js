/* Las cifras introducidas ya son valores finales de nivel 50. */
(() => {
  'use strict';
  const keys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const labels = ['PS', 'Ataque', 'Defensa', 'Ataque especial', 'Defensa especial', 'Velocidad'];
  const names = [
    ['Fuerte', 'Huraña', 'Audaz', 'Firme', 'Pícara'],
    ['Osada', 'Dócil', 'Plácida', 'Agitada', 'Floja'],
    ['Miedosa', 'Activa', 'Seria', 'Alegre', 'Ingenua'],
    ['Modesta', 'Afable', 'Mansa', 'Tímida', 'Alocada'],
    ['Serena', 'Amable', 'Grosera', 'Cauta', 'Rara']
  ];
  const order = ['atk', 'def', 'spe', 'spa', 'spd'];
  const natures = names.flatMap((row, i) => row.map((name, j) => ({ name, up: i === j ? null : order[i], down: i === j ? null : order[j] })));
  const blank = () => ({ valueMode: 'level50', base: Object.fromEntries(keys.map(k => [k, null])), nature: 'Fuerte', battle: { hp: null, stages: Object.fromEntries(keys.slice(1).map(k => [k, 0])) } });
  function values(stats) {
    return Object.fromEntries(keys.map(k => [k, stats.base[k]]));
  }
  function validate(raw) {
    if (raw === undefined) return blank();
    if (!raw || !raw.base || !raw.battle || !raw.battle.stages || !natures.some(n => n.name === raw.nature)) throw new Error('Estadísticas o naturaleza no válidas.');
    const result = blank(); result.nature = raw.nature;
    keys.forEach(k => {
      const v = raw.base[k];
      if (v !== null && (!Number.isInteger(v) || v < 1 || v > 255)) throw new Error('Cada estadística de nivel 50 debe estar vacía o ser un entero entre 1 y 255.');
      result.base[k] = v;
    });
    keys.slice(1).forEach(k => {
      const v = raw.battle.stages[k];
      if (!Number.isInteger(v) || v < -6 || v > 6) throw new Error('Los modificadores deben estar entre −6 y +6.');
      result.battle.stages[k] = v;
    });
    const hp = raw.battle.hp, max = values(result).hp;
    // Las copias anteriores podían guardar hasta 60 PS añadidos por el cálculo antiguo.
    const savedMax = max === null ? null : max + (raw.valueMode === undefined ? 60 : 0);
    if (hp !== null && (!Number.isInteger(hp) || hp < 0 || max === null || hp > savedMax)) throw new Error('Los PS actuales deben estar entre cero y los PS máximos.');
    result.battle.hp = hp === null ? null : Math.min(hp, max);
    return result;
  }
  const modified = (value, stage) => value === null ? null : Math.max(1, Math.floor(value * (stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage))));
  window.LeagueStats = { keys, labels, natures, blank, values, validate, modified };
})();
