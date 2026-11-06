/* Local SVG controls shared by the persistent player and the music library. */
(() => {
  'use strict';
  const paths = {
    play: '<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
    previous: '<path d="M5 5v14m14-14L8 12l11 7Z"/>',
    next: '<path d="M19 5v14M5 5l11 7-11 7Z"/>',
    shuffle: '<path d="m17 3 4 4-4 4M3 17h3c5 0 7-10 12-10h3M3 7h3c2 0 3 1 4 3m4 4c1 2 3 3 4 3h3m-4-4 4 4-4 4"/>',
    repeat: '<path d="m16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4M11 11l1-1v5"/>',
    volume: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    quiet: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8"/>',
    muted: '<path d="m11 4-6 5H2v6h3l6 5Zm5 5 5 6m0-6-5 6"/>',
    queue: '<path d="M3 5h18M3 10h12M3 15h8m5-1 5 4-5 4Z"/>',
    share: '<path d="M12 16V3m-5 5 5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4m8.4-8.4a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    heartFilled: '<path fill="currentColor" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    moon: '<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    lyrics: '<path d="M9 18V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="15" rx="3" ry="3"/>'
  };
  window.resonanceIcon = name => `<svg class="resonance-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.play}</svg>`;
  document.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = window.resonanceIcon(node.dataset.icon); });
})();
