(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const chapters = window.HERMES_CHAPTERS;
  if (!Array.isArray(chapters) || !chapters.length) {
    $('book').hidden = true;
    $('empty').hidden = false;
    $('emptyTitle').textContent = 'El libro no ha podido abrirse';
    $('emptyText').textContent = 'Recarga la página para volver a cargar las frases.';
    $('emptyReset').textContent = 'Recargar';
    $('emptyReset').onclick = () => location.reload();
    return;
  }
  const key = 'rp-libro-hermes-v1';
  const mobile = matchMedia('(max-width: 600px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const quotes = chapters.flatMap(chapter => chapter.quotes.map(entry => ({
    ...entry, type: 'quote', chapter
  })));
  quotes.forEach((quote, index) => { quote.number = index + 1; });
  const pages = [{ type: 'dedication', id: 'dedication' }, ...quotes, { type: 'closing', id: 'closing' }];
  pages.forEach((page, index) => { page.folio = index + 1; });
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch { /* Reading is available without storage. */ }
  if (typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  const favorites = new Set(Array.isArray(saved.favorites) ? saved.favorites.filter(id => quotes.some(q => q.id === id)) : []);
  let lastPage = pages.some(p => p.id === saved.page) ? saved.page : 'dedication';
  let current = Math.max(0, pages.findIndex(p => p.id === lastPage));
  let visible = pages;
  let chapterFilter = '';
  let favoritesOnly = false;
  let literaryOnly = false;
  let animation = null;
  const size = () => mobile.matches ? 1 : 2;
  const normal = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const isFiltered = () => chapterFilter || favoritesOnly || literaryOnly || $('search').value.trim();
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  function persist() {
    try { localStorage.setItem(key, JSON.stringify({ page: lastPage, favorites: [...favorites] })); }
    catch { $('saveNotice').hidden = false; }
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function renderPage(container, page) {
    container.replaceChildren();
    container.classList.toggle('closing', page?.type === 'closing');
    if (!page) {
      container.append(element('div', 'page-content', '❧'));
      container.setAttribute('aria-label', 'Fin de esta selección');
      return;
    }
    container.setAttribute('aria-label', `Página ${page.folio}${page.type === 'quote' ? `: ${page.chapter.title}` : ''}`);
    container.append(element('div', 'running-title', page.type === 'quote' ? page.chapter.title : 'Libro de Hermes'));
    const content = element('div', 'page-content');
    if (page.type === 'dedication') {
      content.append(element('span', 'page-symbol', '❧'));
      content.append(element('h2', 'dedication-title', 'Para mi hermano mayor'));
      content.append(element('p', 'letter', 'Te dejo estas palabras para los días en los que el mundo haga demasiado ruido y te cueste escuchar tu propia voz.'));
      content.append(element('p', 'letter', 'Úsalas para no olvidarte de quién eres, de todo lo bueno que llevas dentro y de lo mucho que te quiero.'));
      content.append(element('p', 'letter', 'Y si alguna vez pierdes el rumbo, recuerda: siempre tendrás en tu hermanita un lugar al que volver.'));
      content.append(element('p', 'signature', 'Tu hermanita, Thalia Kane'));
    } else if (page.type === 'closing') {
      content.append(element('span', 'page-symbol', '❧'));
      content.append(element('h2', 'dedication-title', 'Siempre, a tu lado.'));
      content.append(element('p', 'letter', 'Hasta aquí llegan las páginas, pero no mi cariño por ti.'));
      content.append(element('p', 'letter', 'Vuelve cuando necesites un poquito de luz. Entre estas palabras siempre habrá un abrazo de tu hermanita esperándote.'));
      content.append(element('p', 'signature', 'Te quiero, hermanito mayor <3'));
      content.append(element('p', 'quote-number', 'THALIA KANE'));
    } else {
      content.append(element('span', 'page-symbol', page.chapter.symbol));
      content.append(element('span', 'quote-number', `REFLEXIÓN ${String(page.number).padStart(3, '0')}`));
      content.append(element('blockquote', `quote${page.text.length > 160 ? ' long' : ''}`, page.text));
      content.append(element('div', 'quote-rule'));
      if (page.kind === 'literary') {
        const credit = element('div', 'quote-credit');
        credit.append(element('strong', 'quote-author', page.author));
        const source = element('a', 'quote-source', `${page.work} ↗`);
        source.href = page.url;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.setAttribute('aria-label', `Consultar la fuente: ${page.work}, de ${page.author} (se abre en otra pestaña)`);
        credit.append(source);
        if (page.translation) credit.append(element('small', 'translation-note', page.translation));
        content.append(credit);
      } else {
        content.append(element('p', 'collection-credit', page.kind === 'shared' ? 'Selección de Thalia' : 'Del cuaderno de Thalia'));
      }
      const button = element('button', 'save-quote', favorites.has(page.id) ? '♥ Guardada' : '♡ Guardar frase');
      button.type = 'button';
      button.dataset.quoteId = page.id;
      button.setAttribute('aria-pressed', String(favorites.has(page.id)));
      button.setAttribute('aria-label', `${favorites.has(page.id) ? 'Quitar de favoritas' : 'Guardar en favoritas'} la reflexión ${page.number}`);
      content.append(button);
    }
    container.append(content);
    const folio = element('div', 'folio');
    folio.append(element('span', '', 'LIBRO DE HERMES'), element('span', '', String(page.folio)));
    container.append(folio);
  }

  function render() {
    current = Math.max(0, Math.min(current, Math.max(0, visible.length - 1)));
    current -= current % size();
    const first = visible[current];
    const last = visible[Math.min(current + size() - 1, visible.length - 1)];
    $('book').hidden = !visible.length;
    $('empty').hidden = !!visible.length;
    $('emptyTitle').textContent = favoritesOnly && !favorites.size ? 'Tus palabras favoritas, aquí' : 'No hay frases en esta selección';
    $('emptyText').textContent = favoritesOnly && !favorites.size ? 'Pulsa «Guardar frase» en cualquier reflexión para volver a encontrarla aquí.' : 'Prueba otra búsqueda o vuelve al libro completo.';
    renderPage($('leftPage'), first);
    renderPage($('rightPage'), mobile.matches ? null : visible[current + 1]);
    $('previous').disabled = current === 0 || !visible.length;
    $('next').disabled = current + size() >= visible.length;
    $('random').disabled = !visible.some((p, index) => p.type === 'quote' && Math.floor(index / size()) !== Math.floor(current / size()));
    $('pageNumber').disabled = !visible.length;
    $('pageNumber').max = Math.max(1, visible.length);
    $('pageNumber').value = visible.length ? current + 1 : 0;
    $('pageTotal').textContent = `de ${visible.length}`;
    $('pageLabel').textContent = isFiltered() ? 'En esta selección' : 'Página';
    $('favorites').setAttribute('aria-pressed', String(favoritesOnly));
    $('literary').setAttribute('aria-pressed', String(literaryOnly));
    $('reset').hidden = !isFiltered();
    const selectedChapter = chapters.find(c => c.id === chapterFilter);
    const parts = [selectedChapter?.title, literaryOnly ? 'Citas de autores' : '', favoritesOnly ? `Favoritas (${favorites.size})` : '', $('search').value.trim() ? 'Búsqueda' : ''].filter(Boolean);
    $('selection').textContent = parts.length ? `${parts.join(' · ')} · ${visible.length} ${visible.length === 1 ? 'frase' : 'frases'}` : `El libro completo · ${quotes.length} frases`;
    $('chapters').querySelectorAll('button').forEach(button => {
      const active = chapterFilter ? button.dataset.chapter === chapterFilter : first?.chapter?.id === button.dataset.chapter;
      button.setAttribute('aria-current', String(active));
    });
    $('dedication').setAttribute('aria-current', String(first?.type === 'dedication'));
    $('ending').setAttribute('aria-current', String(last?.type === 'closing'));
    $('announcement').textContent = first ? `Página ${first.folio}${last !== first ? ` a ${last.folio}` : ''}. ${first.chapter?.title || (first.type === 'dedication' ? 'Dedicatoria de Thalia Kane' : 'Despedida de Thalia Kane')}.` : 'No hay frases en esta selección.';
    if (first && !isFiltered()) { lastPage = first.id; persist(); }
  }
  function stopAnimation() {
    animation?.remove();
    animation = null;
  }
  function go(index, animate = true) {
    const target = Math.max(0, Math.min(index, visible.length - 1));
    if (target === current || !visible.length) return;
    stopAnimation();
    if (animate && !reducedMotion.matches) {
      const forward = target > current;
      const source = mobile.matches || !forward ? $('leftPage') : $('rightPage');
      animation = source.cloneNode(true);
      animation.removeAttribute('id');
      animation.setAttribute('aria-hidden', 'true');
      animation.inert = true;
      animation.className = `paper turning-page ${forward ? 'forward' : 'backward'}`;
      const sheet = animation;
      sheet.addEventListener('animationend', () => { sheet.remove(); if (animation === sheet) animation = null; }, { once: true });
    }
    current = target;
    render();
    if (animation) $('book').append(animation);
  }
  function filter() {
    stopAnimation();
    const query = normal($('search').value.trim());
    visible = isFiltered() ? quotes.filter(q => (!chapterFilter || q.chapter.id === chapterFilter) && (!favoritesOnly || favorites.has(q.id)) && (!literaryOnly || q.kind === 'literary') && (!query || normal([q.text, q.author, q.work].filter(Boolean).join(' ')).includes(query))) : pages;
    current = 0;
    render();
  }
  function reset(targetId) {
    chapterFilter = '';
    favoritesOnly = false;
    literaryOnly = false;
    $('search').value = '';
    visible = pages;
    stopAnimation();
    current = Math.max(0, pages.findIndex(p => p.id === (targetId || lastPage)));
    render();
  }
  chapters.forEach((chapter, index) => {
    const button = element('button', 'index-link');
    button.type = 'button';
    button.dataset.chapter = chapter.id;
    button.title = chapter.subtitle;
    button.append(element('span', 'chapter-number', roman[index]), element('span', '', chapter.title), element('span', '', String(chapter.quotes.length)));
    button.addEventListener('click', () => {
      chapterFilter = chapter.id;
      favoritesOnly = false;
      literaryOnly = false;
      $('search').value = '';
      $('contents').open = false;
      filter();
    });
    $('chapters').append(button);
  });
  $('dedication').addEventListener('click', () => { $('contents').open = false; reset('dedication'); });
  $('ending').addEventListener('click', () => { $('contents').open = false; reset('closing'); });
  $('reset').addEventListener('click', () => reset());
  $('emptyReset').addEventListener('click', () => reset());
  $('search').addEventListener('input', filter);
  $('favorites').addEventListener('click', () => { favoritesOnly = !favoritesOnly; filter(); });
  $('literary').addEventListener('click', () => { literaryOnly = !literaryOnly; filter(); });
  $('previous').addEventListener('click', () => go(current - size()));
  $('next').addEventListener('click', () => go(current + size()));
  function jumpToPage() {
    const value = Number($('pageNumber').value);
    if (Number.isFinite(value) && value >= 1) go(Math.floor(value) - 1);
    render();
  }
  $('pageNumber').addEventListener('change', jumpToPage);
  $('pageNumber').addEventListener('blur', jumpToPage);
  $('pageNumber').addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); jumpToPage(); }
  });
  $('random').addEventListener('click', () => {
    const candidates = visible.map((page, index) => ({ page, index })).filter(({ page, index }) => page.type === 'quote' && Math.floor(index / size()) !== Math.floor(current / size()));
    if (candidates.length) go(candidates[Math.floor(Math.random() * candidates.length)].index);
  });
  $('book').addEventListener('click', event => {
    const button = event.target.closest('[data-quote-id]');
    if (!button || button.closest('.turning-page')) return;
    const id = button.dataset.quoteId;
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    persist();
    if (favoritesOnly) {
      const previousPosition = current;
      filter();
      current = Math.min(previousPosition, Math.max(0, visible.length - 1));
      render();
      const nextFavorite = $('book').querySelector('[data-quote-id]');
      (nextFavorite || $('emptyReset')).focus({ preventScroll: true });
    } else {
      button.textContent = favorites.has(id) ? '♥ Guardada' : '♡ Guardar frase';
      button.setAttribute('aria-pressed', String(favorites.has(id)));
      const quote = quotes.find(q => q.id === id);
      button.setAttribute('aria-label', `${favorites.has(id) ? 'Quitar de favoritas' : 'Guardar en favoritas'} la reflexión ${quote.number}`);
    }
    $('announcement').textContent = favorites.has(id) ? 'Frase guardada en favoritas.' : 'Frase retirada de favoritas.';
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current + (event.key === 'ArrowRight' ? size() : -size()));
    }
  });
  let touch = null;
  $('book').addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button')) { touch = null; return; }
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  $('book').addEventListener('touchend', event => {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? size() : -size()));
  }, { passive: true });
  $('book').addEventListener('touchcancel', () => { touch = null; });
  mobile.addEventListener('change', () => { stopAnimation(); render(); });
  render();
})();
