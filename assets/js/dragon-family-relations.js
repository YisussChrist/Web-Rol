/* Explicit maternal lineage for Dragon Ball families. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DragonFamilyRelations = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const name = parent => typeof parent === 'string' ? parent : parent.name;
  function mother(family, child) {
    const value = String(child.mother || '').trim();
    return value ? family.parents.find(p => name(p) === value && p.relation !== 'father') || null : null;
  }
  function needsMother(family) {
    return family.parents.filter(p => p.relation === 'mother').length > 1;
  }
  function parents(family, child) {
    if (!needsMother(family) && !child.mother) return family.parents;
    const selected = mother(family, child);
    return family.parents.filter(p => p.relation === 'father' || p === selected);
  }
  function motherLabel(family, child) {
    const selected = mother(family, child);
    return selected ? name(selected) : needsMother(family) || child.mother ? 'Por asignar' : '';
  }
  return { mother, needsMother, parents, motherLabel };
});
