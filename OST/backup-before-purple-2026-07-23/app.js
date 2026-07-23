(() => {
  'use strict';

  const { characters, soundtracks } = window.RESONANCE_DATA;
  const state = {
    view: 'library',
    filter: 'all',
    query: '',
    current: Math.min(Number(localStorage.getItem('resonanceTrack') || 0), soundtracks.length - 1),
    favorites: JSON.parse(localStorage.getItem('resonanceFavorites') || '[]'),
    shuffle: JSON.parse(localStorage.getItem('resonanceShuffle') || 'false'),
    playing: false
  };

  const scenes = [
    { id: 'calm', name: 'Momentos tranquilos', description: 'Conversaciones, descanso y vínculos entre personajes.', tags: ['calm', 'emotional'] },
    { id: 'mystery', name: 'Investigación', description: 'Secretos, pistas y una tensión que avanza lentamente.', tags: ['darkvictorian', 'emotional'] },
    { id: 'battle', name: 'Combate', description: 'Encuentros directos, movimiento y peligro inmediato.', tags: ['normalbattle', 'seriousbattle', 'rage'] },
    { id: 'finale', name: 'Punto de no retorno', description: 'Las resonancias más intensas para un enfrentamiento final.', tags: ['finalboss', 'rage'] },
    { id: 'epilogue', name: 'Epílogo', description: 'Victoria, pérdida y el silencio después de la historia.', tags: ['emotional', 'calm'] }
  ];

  const filters = [
    ['all', 'Todo'], ['calm', 'Calma'], ['emotional', 'Emocional'], ['normalbattle', 'Combate'],
    ['seriousbattle', 'Combate serio'], ['finalboss', 'Jefe final'], ['darkvictorian', 'Oscuro']
  ];

  const $ = selector => document.querySelector(selector);
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = .85;
  let lastFocus = null;

  const nodes = {
    hero: $('#hero'), catalog: $('#catalog'), filterRow: $('#filterRow'), sectionTitle: $('#sectionTitle'),
    sectionEyebrow: $('#sectionEyebrow'), resultCount: $('#resultCount'), search: $('#searchInput'),
    favoritesButton: $('#favoritesButton'), player: $('#player'), playerCover: $('#playerCover'),
    playerTitle: $('#playerTitle'), playerArtist: $('#playerArtist'), playerFavorite: $('#playerFavorite'),
    playButton: $('#playButton'), shuffleButton: $('#shuffleButton'), progress: $('#progressInput'),
    currentTime: $('#currentTime'), duration: $('#duration'), volume: $('#volumeInput'),
    queue: $('#queueDrawer'), queueList: $('#queueList'), modal: $('#detailModal'), modalContent: $('#modalContent')
  };

  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const trackTags = track => (track.tags || []).map(tag => normalize(tag).replace(/\s+/g, ''));
  const formatTime = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
  const escapeHTML = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  function visibleTracks() {
    const query = normalize(state.query);
    return soundtracks.map((track, index) => ({ track, index })).filter(({ track, index }) => {
      const text = normalize(`${track.songTitle} ${track.character} ${track.songDescription} ${(track.tags || []).join(' ')}`);
      const filterMatch = state.filter === 'all' || (state.filter === 'favorites' && state.favorites.includes(index)) || trackTags(track).includes(state.filter);
      return (!query || text.includes(query)) && filterMatch;
    });
  }

  function renderHero() {
    const track = soundtracks[state.current] || soundtracks[0];
    nodes.hero.innerHTML = `
      <article class="hero-card">
        <img class="hero-backdrop" src="${escapeHTML(track.songCover)}" alt="">
        <img class="hero-cover" src="${escapeHTML(track.songCover)}" alt="Portada de ${escapeHTML(track.songTitle)}">
        <div class="hero-copy">
          <p class="eyebrow">Resonancia seleccionada</p>
          <h2>${escapeHTML(track.songTitle)}</h2>
          <p class="hero-character">${escapeHTML(track.character)}</p>
          <p class="hero-description">${escapeHTML(track.songDescription)}</p>
          <div class="hero-actions">
            <button class="primary-button" data-play="${state.current}">${state.playing ? 'Pausar' : 'Reproducir'}</button>
            <button class="secondary-button" data-lore="${state.current}">Ver historia</button>
          </div>
        </div>
      </article>`;
  }

  function renderFilters() {
    nodes.filterRow.hidden = state.view !== 'library';
    nodes.filterRow.innerHTML = filters.map(([id, label]) => `<button class="filter-chip ${state.filter === id ? 'active' : ''}" data-filter="${id}" aria-pressed="${state.filter === id}">${label}</button>`).join('');
  }

  function trackCard({ track, index }) {
    const favorite = state.favorites.includes(index);
    return `<article class="track-card ${state.current === index && state.playing ? 'playing' : ''}" data-detail="${index}">
      <div class="cover-shell">
        <img src="${escapeHTML(track.songCover)}" alt="Portada de ${escapeHTML(track.songTitle)}" loading="lazy">
        <button class="card-favorite ${favorite ? 'active' : ''}" data-favorite="${index}" aria-label="${favorite ? 'Quitar de' : 'Añadir a'} favoritos" aria-pressed="${favorite}">${favorite ? '♥' : '♡'}</button>
        <button class="card-play" data-play="${index}" aria-label="Reproducir ${escapeHTML(track.songTitle)}">${state.current === index && state.playing ? 'Ⅱ' : '▶'}</button>
      </div>
      <h3>${escapeHTML(track.songTitle)}</h3><p>${escapeHTML(track.character)}</p>
    </article>`;
  }

  function renderLibrary() {
    const visible = visibleTracks();
    nodes.sectionEyebrow.textContent = state.filter === 'favorites' ? 'Tu selección' : 'Archivo musical';
    nodes.sectionTitle.textContent = state.filter === 'favorites' ? 'Favoritos' : 'Todas las resonancias';
    nodes.resultCount.textContent = `${visible.length} ${visible.length === 1 ? 'pista' : 'pistas'}`;
    nodes.catalog.innerHTML = visible.length ? visible.map(trackCard).join('') : '<div class="empty-state"><h2>No hay resultados</h2><p>Prueba con otra búsqueda o filtro.</p></div>';
  }

  function renderScenes() {
    nodes.sectionEyebrow.textContent = 'Selecciones narrativas';
    nodes.sectionTitle.textContent = 'Escenas';
    nodes.resultCount.textContent = `${scenes.length} ambientes`;
    nodes.catalog.innerHTML = `<div class="scene-grid">${scenes.map((scene, index) => `<button class="scene-card" data-scene="${scene.id}"><span class="scene-index">0${index + 1}</span><h2>${scene.name}</h2><p>${scene.description}</p></button>`).join('')}</div>`;
  }

  function renderCharacters() {
    nodes.sectionEyebrow.textContent = 'Expedientes';
    nodes.sectionTitle.textContent = 'Personajes';
    nodes.resultCount.textContent = `${characters.length} personajes`;
    nodes.catalog.innerHTML = `<div class="character-grid">${characters.map((character, index) => `<button class="character-card" data-character="${index}"><img src="${escapeHTML(character.characterFace)}" alt="Retrato de ${escapeHTML(character.character)}" loading="lazy"><strong>${escapeHTML(character.character)}</strong><span>${character.tracks.length} ${character.tracks.length === 1 ? 'tema' : 'temas'}</span></button>`).join('')}</div>`;
  }

  function render() {
    document.querySelectorAll('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.view === state.view));
    nodes.favoritesButton.classList.toggle('active', state.filter === 'favorites');
    nodes.favoritesButton.setAttribute('aria-pressed', String(state.filter === 'favorites'));
    renderHero();
    renderFilters();
    if (state.view === 'library') renderLibrary();
    if (state.view === 'scenes') renderScenes();
    if (state.view === 'characters') renderCharacters();
    renderPlayer();
    renderQueue();
  }

  function loadTrack(index, autoplay = true) {
    const track = soundtracks[index];
    if (!track) return;
    const changed = state.current !== index || !audio.src;
    state.current = index;
    localStorage.setItem('resonanceTrack', String(index));
    if (changed) audio.src = track.audio;
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: track.songTitle, artist: track.character, album: 'Resonance', artwork: [{ src: track.songCover }] });
    if (autoplay) togglePlayback(true);
    else render();
  }

  async function togglePlayback(forcePlay = false) {
    if (!audio.src) audio.src = soundtracks[state.current].audio;
    if (state.playing && !forcePlay) audio.pause();
    else {
      try { await audio.play(); }
      catch { state.playing = false; }
    }
    render();
  }

  function renderPlayer() {
    const track = soundtracks[state.current];
    nodes.player.hidden = !audio.src;
    nodes.playerCover.src = track.songCover;
    nodes.playerCover.alt = `Portada de ${track.songTitle}`;
    nodes.playerTitle.textContent = track.songTitle;
    nodes.playerArtist.textContent = track.character;
    nodes.playButton.textContent = state.playing ? 'Ⅱ' : '▶';
    nodes.playButton.setAttribute('aria-label', state.playing ? 'Pausar' : 'Reproducir');
    const favorite = state.favorites.includes(state.current);
    nodes.playerFavorite.textContent = favorite ? '♥' : '♡';
    nodes.playerFavorite.classList.toggle('active', favorite);
    nodes.shuffleButton.classList.toggle('active', state.shuffle);
    nodes.shuffleButton.setAttribute('aria-pressed', String(state.shuffle));
  }

  function nextTrack(direction = 1) {
    const visible = visibleTracks();
    const pool = visible.length ? visible.map(item => item.index) : soundtracks.map((_, index) => index);
    let next;
    if (state.shuffle) next = pool[Math.floor(Math.random() * pool.length)];
    else {
      const position = Math.max(0, pool.indexOf(state.current));
      next = pool[(position + direction + pool.length) % pool.length];
    }
    loadTrack(next);
  }

  function toggleFavorite(index) {
    state.favorites = state.favorites.includes(index) ? state.favorites.filter(item => item !== index) : [...state.favorites, index];
    localStorage.setItem('resonanceFavorites', JSON.stringify(state.favorites));
    render();
  }

  function renderQueue() {
    const pool = visibleTracks();
    const position = Math.max(0, pool.findIndex(item => item.index === state.current));
    const ordered = pool.slice(position).concat(pool.slice(0, position));
    nodes.queueList.innerHTML = ordered.map(({ track, index }) => `<div class="queue-item ${index === state.current ? 'active' : ''}" data-play="${index}"><img src="${escapeHTML(track.songCover)}" alt=""><div><strong>${escapeHTML(track.songTitle)}</strong><span>${escapeHTML(track.character)}</span></div><button data-play="${index}" aria-label="Reproducir">▶</button></div>`).join('');
  }

  function openTrackDetail(index) {
    const track = soundtracks[index];
    lastFocus = document.activeElement;
    nodes.modalContent.innerHTML = `<button class="icon-button modal-close" data-close-modal aria-label="Cerrar">×</button><div class="detail-head"><img src="${escapeHTML(track.songCover)}" alt=""><div><p class="eyebrow">${escapeHTML(track.character)}</p><h2 id="modalTitle">${escapeHTML(track.songTitle)}</h2></div></div><p class="detail-copy">${escapeHTML(track.lore || track.characterLore || track.songDescription)}</p><button class="primary-button" data-play="${index}">Reproducir</button>`;
    openModal();
  }

  function openCharacter(index) {
    const character = characters[index];
    const tracks = soundtracks.map((track, trackIndex) => ({ track, index: trackIndex })).filter(item => item.track.characterIndex === index);
    lastFocus = document.activeElement;
    nodes.modalContent.innerHTML = `<button class="icon-button modal-close" data-close-modal aria-label="Cerrar">×</button><div class="detail-head"><img src="${escapeHTML(character.characterFace)}" alt="Retrato de ${escapeHTML(character.character)}"><div><p class="eyebrow">Expediente de personaje</p><h2 id="modalTitle">${escapeHTML(character.character)}</h2></div></div><p class="detail-copy">${escapeHTML(character.lore)}</p><div class="detail-list">${tracks.map(({ track, index: trackIndex }) => `<div class="detail-track"><img src="${escapeHTML(track.songCover)}" alt=""><div><strong>${escapeHTML(track.songTitle)}</strong><p>${escapeHTML((track.tags || []).join(' · '))}</p></div><button data-play="${trackIndex}" aria-label="Reproducir ${escapeHTML(track.songTitle)}">▶</button></div>`).join('')}</div>`;
    openModal();
  }

  function openModal() { nodes.modal.classList.add('open'); nodes.modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; nodes.modal.querySelector('button').focus(); }
  function closeModal() { nodes.modal.classList.remove('open'); nodes.modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lastFocus?.focus(); }

  document.addEventListener('click', event => {
    const play = event.target.closest('[data-play]');
    const favorite = event.target.closest('[data-favorite]');
    const detail = event.target.closest('[data-detail]');
    const character = event.target.closest('[data-character]');
    const scene = event.target.closest('[data-scene]');
    const filter = event.target.closest('[data-filter]');
    const view = event.target.closest('[data-view]');
    if (play) { event.stopPropagation(); loadTrack(Number(play.dataset.play)); }
    else if (favorite) { event.stopPropagation(); toggleFavorite(Number(favorite.dataset.favorite)); }
    else if (detail) openTrackDetail(Number(detail.dataset.detail));
    else if (character) openCharacter(Number(character.dataset.character));
    else if (scene) { state.view = 'library'; state.filter = scene.dataset.scene === 'finale' ? 'finalboss' : scenes.find(item => item.id === scene.dataset.scene).tags[0]; render(); }
    else if (filter) { state.filter = filter.dataset.filter; render(); }
    else if (view) { state.view = view.dataset.view; state.filter = 'all'; state.query = ''; nodes.search.value = ''; render(); }
    else if (event.target.closest('[data-close-modal]') || event.target === nodes.modal) closeModal();
  });

  nodes.search.addEventListener('input', () => { state.query = nodes.search.value; state.view = 'library'; render(); });
  nodes.favoritesButton.addEventListener('click', () => { state.view = 'library'; state.filter = state.filter === 'favorites' ? 'all' : 'favorites'; render(); });
  nodes.playButton.addEventListener('click', () => togglePlayback());
  nodes.playerFavorite.addEventListener('click', () => toggleFavorite(state.current));
  $('#previousButton').addEventListener('click', () => nextTrack(-1));
  $('#nextButton').addEventListener('click', () => nextTrack(1));
  nodes.shuffleButton.addEventListener('click', () => { state.shuffle = !state.shuffle; localStorage.setItem('resonanceShuffle', JSON.stringify(state.shuffle)); renderPlayer(); });
  $('#queueButton').addEventListener('click', () => { nodes.queue.classList.add('open'); nodes.queue.setAttribute('aria-hidden', 'false'); });
  $('#closeQueue').addEventListener('click', () => { nodes.queue.classList.remove('open'); nodes.queue.setAttribute('aria-hidden', 'true'); });
  nodes.volume.addEventListener('input', () => { audio.volume = Number(nodes.volume.value); });
  nodes.progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = audio.duration * Number(nodes.progress.value) / 100; });

  audio.addEventListener('play', () => { state.playing = true; render(); });
  audio.addEventListener('pause', () => { state.playing = false; render(); });
  audio.addEventListener('ended', () => nextTrack(1));
  audio.addEventListener('loadedmetadata', () => { nodes.duration.textContent = formatTime(audio.duration); });
  audio.addEventListener('timeupdate', () => { nodes.currentTime.textContent = formatTime(audio.currentTime); nodes.progress.value = audio.duration ? audio.currentTime / audio.duration * 100 : 0; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeModal(); nodes.queue.classList.remove('open'); } if (event.code === 'Space' && !['INPUT','BUTTON'].includes(document.activeElement.tagName)) { event.preventDefault(); togglePlayback(); } });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => togglePlayback(true));
    navigator.mediaSession.setActionHandler('pause', () => togglePlayback());
    navigator.mediaSession.setActionHandler('previoustrack', () => nextTrack(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack(1));
  }

  render();
})();
