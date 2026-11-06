/* Comparación de lecturas: los valores desconocidos nunca equivalen a cero. */
(() => {
  const key = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
  const power = value => {
    const text = String(value ?? '').trim().replace(/\./g, '');
    return /^\d+$/.test(text) && Number.isSafeInteger(Number(text)) ? Number(text) : null;
  };
  const aliases = { 'wolf silverfang': 'wolf' };
  function compare(current, previous) {
    const now = power(current.strength ?? current.strenght);
    if (!previous) return { kind: 'new', previous: null, current: now };
    const before = power(previous.strength ?? previous.strenght);
    const kind = before === null ? (now === null ? 'same' : 'known') : now === null ? 'unknown' : now > before ? 'up' : now < before ? 'down' : 'same';
    return { kind, previous: before, current: now, delta: now !== null && before !== null ? now - before : null };
  }
  function annotate(list, baseline) {
    if (!Array.isArray(baseline)) return list.map(c => ({ ...c, change: { kind: 'unavailable' } }));
    const old = new Map(baseline.map(c => [key(c.name), c]));
    return list.map(c => {
      const previous = old.get(aliases[key(c.name)] || key(c.name));
      const forms = new Map((previous?.transformations || []).map(t => [key(t.name), t]));
      return { ...c, change: compare(c, previous), transformations: (c.transformations || []).map(t => ({ ...t, change: compare(t, forms.get(key(t.name))) })) };
    });
  }
  window.PowerChanges = { annotate, compare };
})();
