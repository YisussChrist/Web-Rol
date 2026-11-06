/* Listening history and stable previews. One navigator per music source. */
(() => {
  const createShuffle = typeof module !== 'undefined' && module.exports
    ? require('./shuffle-cycle.js') : window.createShuffleCycle;

  function createTrackNavigation(random = Math.random) {
    const shuffleCycle = createShuffle(random);
    let history = [], cursor = -1;

    function select(index) {
      if (history[cursor] === index) return;
      history = history.slice(0, cursor + 1);
      history.push(index);
      cursor = history.length - 1;
    }

    function preview(pool, current, shuffle) {
      if (!pool.length) return { previous: null, next: null };
      select(current);
      const position = pool.indexOf(current);
      return {
        previous: cursor > 0 ? history[cursor - 1] : pool[(Math.max(0, position) - 1 + pool.length) % pool.length],
        next: cursor < history.length - 1 ? history[cursor + 1]
          : shuffle ? shuffleCycle.peek(pool, current) : pool[(position + 1) % pool.length]
      };
    }

    function step(direction, pool, current, shuffle) {
      const adjacent = preview(pool, current, shuffle);
      const index = direction < 0 ? adjacent.previous : adjacent.next;
      if (index === null || index === current) return index;
      if (direction < 0) {
        if (cursor > 0) cursor--;
        else history.unshift(index);
      } else if (cursor < history.length - 1) cursor++;
      else {
        if (shuffle) shuffleCycle.next(pool, current);
        select(index);
      }
      return index;
    }

    return { select, preview, step };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = createTrackNavigation;
  else window.createTrackNavigation = createTrackNavigation;
})();
