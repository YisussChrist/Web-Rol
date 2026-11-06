/* Shuffle without replacement. Each player/source keeps its own listening cycle. */
(() => {
  function createShuffleCycle(random = Math.random) {
    let signature = '', remaining = [];
    function prepare(pool, current) {
        const unique = [...new Set(pool)];
        if (!unique.length) return null;
        const key = JSON.stringify(unique);
        if (key !== signature) { signature = key; remaining = []; }
        remaining = remaining.filter(index => index !== current && unique.includes(index));
        if (!remaining.length) {
          remaining = unique.filter(index => index !== current);
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
        }
        return remaining.length ? remaining[remaining.length - 1] : unique[0];
    }
    return {
      peek: prepare,
      next(pool, current) {
        const next = prepare(pool, current);
        if (remaining.length) remaining.pop();
        return next;
      }
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = createShuffleCycle;
  else window.createShuffleCycle = createShuffleCycle;
})();
