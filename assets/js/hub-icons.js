/* One local, consistent icon set for navigation and archive cards. */
(() => {
  const paths = {
    orbit: '<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="11" ry="6" transform="rotate(-40 12 12)"/><path d="m18 3 2 2"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    activity: '<path d="M2 12h4l3-8 6 16 3-8h4"/>',
    music: '<path d="M9 18V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="15" rx="3" ry="3"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--bg)"/><circle cx="15" cy="17" r="3" fill="var(--bg)"/>',
    trophy: '<path d="M7 3h10v6a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 2v7m-4 0h8"/>',
    shuffle: '<path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3-2 4-4m4-4c1-2 2-4 4-4h3m-4-4 4 4-4 4"/>',
    refresh: '<path d="M20 8a9 9 0 1 0 1 7M20 3v5h-5"/>',
    moon: '<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
    quote: '<path d="M10 5H4v7h4c0 3-1 5-4 7m16-14h-6v7h4c0 3-1 5-4 7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
    book: '<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/>',
    heart: '<path d="M12 21 3 12a5.5 5.5 0 0 1 9-7 5.5 5.5 0 0 1 9 7Z"/>',
    heartFilled: '<path fill="currentColor" d="M12 21 3 12a5.5 5.5 0 0 1 9-7 5.5 5.5 0 0 1 9 7Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    game: '<path d="M7 6h10c3 0 4 3 5 10s-4 4-6 1H8c-2 3-7 6-6-1S4 6 7 6ZM5 11h6m-3-3v6m8-3h.1m3 2h.1"/>',
    pin: '<path d="m8 3 8 0-1 7 4 4H5l4-4ZM12 14v8"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6Zm0 0V3M7 11l-4-1m14 1 4-1m-6 7 2 3m-8-3-2 3"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    tree: '<rect x="9" y="2" width="6" height="6" rx="1"/><path d="M12 8v5H5v3m7-3h7v3"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/>',
    chart: '<path d="M3 3v18h18M7 15l4-5 4 2 6-7"/>',
    box: '<path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5M7 4l10 5v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    link: '<path d="m10 13 4-2M9 15l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-2 2"/>'
  };
  const aliases = {'🎂':'calendar','🎉':'calendar','💍':'heart','⚽':'ball','🐉':'orbit','🐲':'orbit','⚡':'bolt','🌳':'tree','📍':'compass','🏟️':'ball','📈':'chart','📋':'book','📦':'box','💶':'chart','📜':'book','🦸':'user','📖':'book','☠️':'bolt','🔺':'bolt','🏆':'trophy','🔀':'shuffle','🌀':'orbit','🏥':'grid','🪪':'user','◉':'compass','⚗':'grid','🗺️':'compass','📊':'chart','📱':'grid','🧮':'grid','📻':'music','⌛':'clock','◎':'user','👤':'user','🤰':'heart','💻':'grid','🎳':'game','🌤️':'sun','🎵':'music','📆':'calendar','💖':'heart','🎥':'image','🎮':'game','🔎':'search','🧭':'compass','🔗':'link','⭐':'pin'};
  window.hubIcon = name => `<svg class="hub-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[aliases[name] || name] || paths.grid}</svg>`;
  document.querySelectorAll('[data-hub-icon]').forEach(node => { node.innerHTML = window.hubIcon(node.dataset.hubIcon); });
})();
