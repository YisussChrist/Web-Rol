(() => {
  'use strict';

  const icon = window.resonanceIcon;
  const { characters, soundtracks } = window.RESONANCE_DATA;
  const storedLevel = (key, fallback, minimum = 0) => {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? Math.min(1, Math.max(minimum, value)) : fallback;
  };
  const state = {
    view: 'library',
    filter: 'all',
    query: '',
    current: Math.min(Number(localStorage.getItem('resonanceTrack') || 0), soundtracks.length - 1),
    favorites: JSON.parse(localStorage.getItem('resonanceFavorites') || '[]'),
    repeat: localStorage.getItem('resonanceRepeat') === 'true',
    shuffle: JSON.parse(localStorage.getItem('resonanceShuffle') || 'false'),
    volume: localStorage.getItem('resonanceVolume') === null ? .85 : storedLevel('resonanceVolume', .85),
    previousVolume: localStorage.getItem('resonancePreviousVolume') === null ? .85 : storedLevel('resonancePreviousVolume', .85, .01),
    playing: false
  };

  const filters = [
    ['all', 'Todo'], ['calm', 'Calma'], ['fight', 'Pelea']
  ];

  const $ = selector => document.querySelector(selector);
  const sharedShell = (() => {
    try { return window.parent !== window ? window.parent.ResonanceShell || null : null; }
    catch (error) { return null; }
  })();
  const audio = sharedShell?.audio || new Audio();
  if (sharedShell) {
    const sharedState = sharedShell.getState();
    if (sharedState.sourceId === 'resonance') {
      state.current = sharedState.current;
      state.playing = sharedState.playing;
    }
    state.shuffle = sharedState.shuffle;
    state.repeat = sharedState.repeat;
    state.volume = sharedState.volume;
  }
  if (!sharedShell) audio.loop = state.repeat;
  audio.preload = 'metadata';
  audio.volume = state.volume;
  let lastFocus = null;
  const trackNavigator = window.createTrackNavigation();

  const nodes = {
    hero: $('#hero'), catalog: $('#catalog'), filterRow: $('#filterRow'), sectionTitle: $('#sectionTitle'),
    sectionEyebrow: $('#sectionEyebrow'), resultCount: $('#resultCount'), search: $('#searchInput'),
    favoritesButton: $('#favoritesButton'), player: $('#player'), playerCover: $('#playerCover'),
    headerShuffle: $('#headerShuffleButton'),
    repeat: $('#repeatButton'), headerRepeat: $('#headerRepeatButton'),
    playerTitle: $('#playerTitle'), playerArtist: $('#playerArtist'), playerFavorite: $('#playerFavorite'),
    playButton: $('#playButton'), shuffleButton: $('#shuffleButton'), progress: $('#progressInput'),
    currentTime: $('#currentTime'), duration: $('#duration'), volume: $('#volumeInput'),
    muteButton: $('#muteButton'),
    queue: $('#queueDrawer'), queueList: $('#queueList'), modal: $('#detailModal'), modalContent: $('#modalContent')
  };
  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const trackTags = track => (track.tags || []).map(tag => normalize(tag).replace(/\s+/g, ''));
  const formatTime = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
  const escapeHTML = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const lyricsText = track => Array.isArray(track?.lyrics) ? track.lyrics.join('\n').trim() : String(track?.lyrics || '').trim();
  const lyricsTranslationText = track => Array.isArray(track?.lyricsTranslation) ? track.lyricsTranslation.join('\n').trim() : String(track?.lyricsTranslation || '').trim();
  const hasLyrics = track => lyricsText(track).length > 0;
  const trackBelongsToCharacter = (track, index) => Array.isArray(track.characterIndices)
    ? track.characterIndices.includes(index)
    : track.characterIndex === index;
  const characterTrackCount = index => soundtracks.filter(track => trackBelongsToCharacter(track, index)).length;
  const characterButtons = (track, className) => {
    const profiles = Array.isArray(track.characterProfiles) && track.characterProfiles.length
      ? track.characterProfiles
      : [{ name: track.character, face: track.characterFace, index: track.characterIndex }];
    return profiles.filter(profile => Number.isInteger(profile.index)).map(profile => {
      const label = className === 'detail-character'
        ? `<div><strong>${escapeHTML(profile.name)}</strong><span>Ver expediente del personaje</span></div>`
        : escapeHTML(profile.name);
      return `<button class="${className}" data-character="${profile.index}" type="button"><img src="${escapeHTML(profile.face)}" alt="Retrato de ${escapeHTML(profile.name)}">${label}</button>`;
    }).join('');
  };

  function lyricsMarkup(track) {
    const original = lyricsText(track).split('\n');
    const translation = lyricsTranslationText(track).split('\n');
    const lineCount = Math.max(original.length, translation.length);
    return Array.from({ length: lineCount }, (_, index) => {
      const sourceLine = original[index] || '';
      const translatedLine = translation[index] || '';
      if (!sourceLine.trim() && !translatedLine.trim()) return '<div class="lyrics-stanza-gap" aria-hidden="true"></div>';
      return `<div class="lyrics-line">${sourceLine ? `<p class="lyrics-original">${escapeHTML(sourceLine)}</p>` : ''}${translatedLine ? `<p class="lyrics-translation" lang="es">${escapeHTML(translatedLine)}</p>` : ''}</div>`;
    }).join('');
  }

  function visibleTracks() {
    const query = normalize(state.query);
    return soundtracks.map((track, index) => ({ track, index })).filter(({ track, index }) => {
      const text = normalize(`${track.songTitle} ${track.character} ${track.songDescription} ${(track.tags || []).join(' ')} ${lyricsText(track)} ${lyricsTranslationText(track)}`);
      const tags = trackTags(track);
      const fightTags = ['normalbattle', 'seriousbattle', 'finalboss', 'rage'];
      const filterMatch = state.filter === 'all'
        || (state.filter === 'favorites' && state.favorites.includes(index))
        || (state.filter === 'fight' && tags.some(tag => fightTags.includes(tag)))
        || (state.filter === 'lyrics' && hasLyrics(track))
        || tags.includes(state.filter);
      return (!query || text.includes(query)) && filterMatch;
    });
  }

  function renderHero() {
    const track = soundtracks[state.current] || soundtracks[0];
    const adjacent = sharedShell ? sharedShell.getNavigation('resonance', state.current)
      : trackNavigator.preview(navigationPool(), state.current, state.shuffle);
    const preview = (index, direction, label) => {
      const neighbor = soundtracks[index];
      if (!neighbor || index === state.current) return '<div class="hero-neighbor-spacer" aria-hidden="true"></div>';
      return `<button class="hero-neighbor hero-neighbor-${direction}" data-track-direction="${direction}" aria-label="${label}: ${escapeHTML(neighbor.songTitle)}"><img src="${escapeHTML(neighbor.songCover)}" alt=""><span class="neighbor-direction">${icon(direction === 'previous' ? 'previous' : 'next')}<span>${label}</span></span><span class="neighbor-copy"><strong>${escapeHTML(neighbor.songTitle)}</strong><span>${escapeHTML(neighbor.character)}</span></span></button>`;
    };
    nodes.hero.innerHTML = `
      <div class="hero-stage">
      ${preview(adjacent.previous, 'previous', 'Anterior')}
      <article class="hero-card ${state.playing ? 'is-playing' : ''}">
        <img class="hero-backdrop" src="${escapeHTML(track.songCover)}" alt="">
        <img class="hero-cover" src="${escapeHTML(track.songCover)}" alt="Portada de ${escapeHTML(track.songTitle)}">
        <div class="hero-copy">
          <p class="hero-status"><span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>${state.playing ? 'Sonando ahora' : 'Tu próxima resonancia'}</p>
          <h2>${escapeHTML(track.songTitle)}</h2>
          <div class="hero-characters" aria-label="Personajes vinculados">${characterButtons(track, 'hero-character')}</div>
          <p class="hero-description">${escapeHTML(track.songDescription)}</p>
          <div class="hero-actions">
            <button class="primary-button" data-play="${state.current}">${icon(state.playing ? 'pause' : 'play')}${state.playing ? 'Pausar' : 'Reproducir'}</button>
            <button class="secondary-button" data-lore="${state.current}">Ver historia</button>
            ${hasLyrics(track) ? `<button class="secondary-button lyrics-button" data-lyrics="${state.current}">Ver letra</button>` : ''}
            <button class="secondary-button" data-cover="${state.current}">Portada y compartir</button>
          </div>
        </div>
      </article>
      ${preview(adjacent.next, 'next', 'Siguiente')}
      </div>`;
  }

  function renderDiscovery() {
    const discovery = $('#discovery');
    discovery.hidden = state.view !== 'library';
    const moods = [
      { id: 'calm', icon: 'moon', title: 'Baja el ritmo', subtitle: 'Un respiro entre historias', label: 'Calma' },
      { id: 'fight', icon: 'bolt', title: 'Sube la intensidad', subtitle: 'La banda sonora del combate', label: 'Pelea' },
      { id: 'favorites', icon: 'heart', title: 'Siempre contigo', subtitle: 'Las canciones que has guardado', label: 'Favoritos' }
    ];
    discovery.innerHTML = `<div class="discovery-heading"><h2 id="discoveryTitle">Encuentra tu frecuencia</h2><span>Un sonido para cada momento</span></div><div class="mood-grid">${moods.map(mood => {
      const count = soundtracks.filter((track, index) => mood.id === 'favorites' ? state.favorites.includes(index)
        : mood.id === 'calm' ? trackTags(track).includes('calm')
        : trackTags(track).some(tag => ['normalbattle', 'seriousbattle', 'finalboss', 'rage'].includes(tag))).length;
      return `<button class="mood-card mood-${mood.id}" data-mood="${mood.id}" aria-pressed="${state.filter === mood.id}"><span class="mood-icon">${icon(mood.icon)}</span><span class="mood-copy"><span class="mood-label">${mood.label} · ${count} ${count === 1 ? 'pista' : 'pistas'}</span><strong>${mood.title}</strong><span class="mood-description">${mood.subtitle}</span></span><span class="mood-arrow">${icon('arrow')}</span></button>`;
    }).join('')}</div>`;
  }

  function renderFilters() {
    nodes.filterRow.hidden = state.view !== 'library';
    const availableFilters = soundtracks.some(hasLyrics) ? [...filters, ['lyrics', 'Con letra']] : filters;
    nodes.filterRow.innerHTML = availableFilters.map(([id, label]) => `<button class="filter-chip ${state.filter === id ? 'active' : ''}" data-filter="${id}" aria-pressed="${state.filter === id}">${label}</button>`).join('');
  }

  function trackCard({ track, index }) {
    const favorite = state.favorites.includes(index);
    return `<article class="track-card ${state.current === index && state.playing ? 'playing' : ''}" data-detail="${index}">
      <div class="cover-shell">
        <img src="${escapeHTML(track.songCover)}" alt="Portada de ${escapeHTML(track.songTitle)}" loading="lazy">
        ${hasLyrics(track) ? `<button class="card-lyrics" data-lyrics="${index}" aria-label="Ver letra de ${escapeHTML(track.songTitle)}">${icon('lyrics')} Letra</button>` : ''}
        <button class="card-favorite ${favorite ? 'active' : ''}" data-favorite="${index}" aria-label="${favorite ? 'Quitar de' : 'Añadir a'} favoritos" aria-pressed="${favorite}">${icon(favorite ? 'heartFilled' : 'heart')}</button>
        <button class="card-play" data-play="${index}" aria-label="${state.current === index && state.playing ? 'Pausar' : 'Reproducir'} ${escapeHTML(track.songTitle)}">${icon(state.current === index && state.playing ? 'pause' : 'play')}</button>
      </div>
      <div class="track-caption"><span class="track-number">${String(index + 1).padStart(2, '0')}</span><div><h3 title="${escapeHTML(track.songTitle)}">${escapeHTML(track.songTitle)}</h3><p>${escapeHTML(track.character)}</p></div>${state.current === index && state.playing ? '<span class="track-live" aria-label="Sonando"><span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span></span>' : ''}</div>
    </article>`;
  }

  function renderLibrary() {
    const visible = visibleTracks();
    nodes.sectionEyebrow.textContent = state.filter === 'favorites' ? 'Tu selección' : 'Archivo musical';
    nodes.sectionTitle.textContent = ({ favorites: 'Favoritos', calm: 'Resonancias en calma', fight: 'Resonancias de combate', lyrics: 'Resonancias con letra' })[state.filter] || 'Todas las resonancias';
    nodes.resultCount.textContent = `${visible.length} ${visible.length === 1 ? 'pista' : 'pistas'}`;
    nodes.catalog.innerHTML = visible.length ? visible.map(trackCard).join('') : '<div class="empty-state"><h2>No hay resultados</h2><p>Prueba con otra búsqueda o filtro.</p></div>';
  }

  function renderCharacters() {
    nodes.sectionEyebrow.textContent = 'Expedientes';
    nodes.sectionTitle.textContent = 'Personajes';
    nodes.resultCount.textContent = `${characters.length} personajes`;
    nodes.catalog.innerHTML = `<div class="character-grid">${characters.map((character, index) => `<button class="character-card" data-character="${index}"><img src="${escapeHTML(character.characterFace)}" alt="Retrato de ${escapeHTML(character.character)}" loading="lazy"><strong>${escapeHTML(character.character)}</strong><span>${characterTrackCount(index)} ${characterTrackCount(index) === 1 ? 'tema' : 'temas'}</span></button>`).join('')}</div>`;
  }

  function render() {
    document.querySelectorAll('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.view === state.view));
    nodes.favoritesButton.classList.toggle('active', state.filter === 'favorites');
    nodes.favoritesButton.setAttribute('aria-pressed', String(state.filter === 'favorites'));
    renderHero();
    renderFilters();
    renderDiscovery();
    if (state.view === 'library') renderLibrary();
    if (state.view === 'characters') renderCharacters();
    renderPlayer();
    renderQueue();
  }

  function loadTrack(index, autoplay = true) {
    const track = soundtracks[index];
    if (!track) return;
    if (sharedShell) {
      state.current = index;
      localStorage.setItem('resonanceTrack', String(index));
      sharedShell.setTrack(index, autoplay);
      render();
      return;
    }
    const changed = state.current !== index || !audio.src;
    trackNavigator.select(index);
    state.current = index;
    localStorage.setItem('resonanceTrack', String(index));
    if (changed) audio.src = track.audio;
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: track.songTitle, artist: track.character, album: 'Resonance', artwork: [{ src: track.songCover }] });
    if (autoplay) togglePlayback(true);
    else render();
  }

  async function togglePlayback(forcePlay = false) {
    if (sharedShell) {
      if (forcePlay) await sharedShell.play();
      else sharedShell.toggle();
      return;
    }
    if (!audio.src) audio.src = soundtracks[state.current].audio;
    if (state.playing && !forcePlay) audio.pause();
    else {
      try { await audio.play(); }
      catch { state.playing = false; }
    }
    render();
  }

  function renderPlayer() {
    for (const button of [nodes.repeat, nodes.headerRepeat]) {
      button.classList.toggle('active', state.repeat);
      button.setAttribute('aria-pressed', String(state.repeat));
      button.title = state.repeat ? 'Desactivar bucle de canción' : 'Activar bucle de canción';
      button.setAttribute('aria-label', button.title);
    }
    const track = soundtracks[state.current];
    nodes.player.hidden = sharedShell ? true : !audio.src;
    nodes.playerCover.src = track.songCover;
    nodes.playerCover.alt = `Portada de ${track.songTitle}`;
    nodes.playerTitle.textContent = track.songTitle;
    nodes.playerArtist.textContent = track.character;
    nodes.playButton.innerHTML = icon(state.playing ? 'pause' : 'play');
    nodes.playButton.setAttribute('aria-label', state.playing ? 'Pausar' : 'Reproducir');
    const favorite = state.favorites.includes(state.current);
    nodes.playerFavorite.innerHTML = icon(favorite ? 'heartFilled' : 'heart');
    nodes.playerFavorite.classList.toggle('active', favorite);
    nodes.shuffleButton.classList.toggle('active', state.shuffle);
    nodes.shuffleButton.setAttribute('aria-pressed', String(state.shuffle));
    nodes.headerShuffle.classList.toggle('active', state.shuffle);
    nodes.headerShuffle.setAttribute('aria-pressed', String(state.shuffle));
    nodes.headerShuffle.setAttribute('aria-label', state.shuffle ? 'Desactivar reproducción aleatoria' : 'Activar reproducción aleatoria');
  }

  function navigationPool() {
    const visible = visibleTracks();
    return visible.length ? visible.map(item => item.index) : soundtracks.map((_, index) => index);
  }

  function nextTrack(direction = 1) {
    if (sharedShell) {
      if (sharedShell.getState().sourceId !== 'resonance') sharedShell.setTrack(state.current, false);
      direction < 0 ? sharedShell.previous() : sharedShell.next();
      return;
    }
    const pool = navigationPool();
    if (!pool.length) return;
    const next = trackNavigator.step(direction, pool, state.current, state.shuffle);
    loadTrack(next);
  }

  function toggleFavorite(index) {
    state.favorites = state.favorites.includes(index) ? state.favorites.filter(item => item !== index) : [...state.favorites, index];
    localStorage.setItem('resonanceFavorites', JSON.stringify(state.favorites));
    render();
  }

  function toggleRepeat() {
    state.repeat = !state.repeat;
    if (sharedShell) sharedShell.setRepeat(state.repeat);
    else {
      audio.loop = state.repeat;
      localStorage.setItem('resonanceRepeat', String(state.repeat));
    }
    renderPlayer();
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;
    localStorage.setItem('resonanceShuffle', JSON.stringify(state.shuffle));
    if (sharedShell) sharedShell.setShuffle(state.shuffle);
    renderHero();
    renderPlayer();
  }

  function updateVolume(value, remember = true) {
    state.volume = Math.min(1, Math.max(0, Number(value)));
    audio.volume = state.volume;
    nodes.volume.value = String(state.volume);
    nodes.volume.style.setProperty('--fill', `${state.volume * 100}%`);
    localStorage.setItem('resonanceVolume', String(state.volume));
    if (remember && state.volume > 0) {
      state.previousVolume = state.volume;
      localStorage.setItem('resonancePreviousVolume', String(state.previousVolume));
    }
    const muted = state.volume === 0;
    nodes.muteButton.innerHTML = icon(muted ? 'muted' : state.volume < .45 ? 'quiet' : 'volume');
    nodes.muteButton.classList.toggle('muted', muted);
    nodes.muteButton.setAttribute('aria-label', muted ? 'Restaurar volumen' : 'Silenciar');
    nodes.muteButton.title = muted ? 'Restaurar volumen' : 'Silenciar';
  }

  function toggleMute() {
    if (state.volume > 0) updateVolume(0, false);
    else updateVolume(state.previousVolume || .85);
  }

  function renderQueue() {
    const pool = visibleTracks();
    const position = Math.max(0, pool.findIndex(item => item.index === state.current));
    const ordered = pool.slice(position).concat(pool.slice(0, position));
    nodes.queueList.innerHTML = ordered.map(({ track, index }) => `<div class="queue-item ${index === state.current ? 'active' : ''}" data-play="${index}"><img src="${escapeHTML(track.songCover)}" alt=""><div><strong>${escapeHTML(track.songTitle)}</strong><span>${escapeHTML(track.character)}</span></div><button data-play="${index}" aria-label="Reproducir">${icon('play')}</button></div>`).join('');
  }

  function openTrackDetail(index) {
    const track = soundtracks[index];
    lastFocus = document.activeElement;
    nodes.modalContent.className = 'modal-card';
    nodes.modalContent.innerHTML = `<button class="icon-button modal-close" data-close-modal aria-label="Cerrar">${icon('close')}</button><div class="detail-head"><img src="${escapeHTML(track.songCover)}" alt="Portada de ${escapeHTML(track.songTitle)}"><div><p class="eyebrow">Soundtrack</p><h2 id="modalTitle">${escapeHTML(track.songTitle)}</h2></div></div><div class="detail-characters" aria-label="Personajes vinculados">${characterButtons(track, 'detail-character')}</div><p class="detail-copy">${escapeHTML(track.lore || track.characterLore || track.songDescription)}</p><div class="hero-actions"><button class="primary-button" data-play="${index}">Reproducir</button>${hasLyrics(track) ? `<button class="secondary-button lyrics-button" data-lyrics="${index}">Ver letra</button>` : ''}<button class="secondary-button" data-cover="${index}">Portada y compartir</button></div>`;
    openModal();
  }

  function openLyrics(index) {
    const track = soundtracks[index];
    const lyrics = lyricsText(track);
    if (!track || !lyrics) return;
    lastFocus = document.activeElement;
    nodes.modalContent.className = 'modal-card lyrics-view';
    nodes.modalContent.innerHTML = `<button class="icon-button modal-close" data-close-modal aria-label="Cerrar">${icon('close')}</button><div class="lyrics-heading"><img src="${escapeHTML(track.songCover)}" alt="Portada de ${escapeHTML(track.songTitle)}"><div><p class="eyebrow">${lyricsTranslationText(track) ? 'Letra · Traducción' : 'Letra'}</p><h2 id="modalTitle">${escapeHTML(track.songTitle)}</h2><p>${escapeHTML(track.character)}</p></div></div><div class="lyrics-copy">${lyricsMarkup(track)}</div><div class="hero-actions lyrics-actions"><button class="primary-button" data-play="${index}">Reproducir</button><button class="secondary-button" data-lore="${index}">Ver historia</button></div>`;
    openModal();
  }

  function openCover(index) {
    if(sharedShell?.showTrackShare) { sharedShell.showTrackShare(index); return; }
    const track = soundtracks[index];
    lastFocus = document.activeElement;
    nodes.modalContent.className = 'modal-card cover-viewer';
    nodes.modalContent.innerHTML = `<button class="icon-button modal-close" data-close-modal aria-label="Cerrar">${icon('close')}</button><img src="${escapeHTML(track.songCover)}" alt="Portada ampliada de ${escapeHTML(track.songTitle)}"><div class="cover-viewer-info"><div><h2 id="modalTitle">${escapeHTML(track.songTitle)}</h2><p>${escapeHTML(track.character)}</p></div><button class="primary-button" data-play="${index}">Reproducir</button></div>`;
    openModal();
  }

  function openCharacter(index) {
    const character = characters[index];
    const tracks = soundtracks.map((track, trackIndex) => ({ track, index: trackIndex })).filter(item => trackBelongsToCharacter(item.track, index));
    lastFocus = document.activeElement;
    nodes.modalContent.className = 'modal-card';
    nodes.modalContent.innerHTML = `<button class="icon-button modal-close" data-close-modal aria-label="Cerrar">${icon('close')}</button><div class="detail-head"><img src="${escapeHTML(character.characterFace)}" alt="Retrato de ${escapeHTML(character.character)}"><div><p class="eyebrow">Expediente de personaje</p><h2 id="modalTitle">${escapeHTML(character.character)}</h2></div></div><p class="detail-copy">${escapeHTML(character.lore)}</p><div class="detail-list">${tracks.map(({ track, index: trackIndex }) => `<div class="detail-track"><img src="${escapeHTML(track.songCover)}" alt=""><div><strong>${escapeHTML(track.songTitle)}</strong><p>${escapeHTML((track.tags || []).join(' · '))}</p></div><button data-play="${trackIndex}" aria-label="Reproducir ${escapeHTML(track.songTitle)}">${icon('play')}</button></div>`).join('')}</div>`;
    openModal();
  }

  function openModal() { nodes.modal.classList.add('open'); nodes.modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; nodes.modal.querySelector('button').focus(); }
  function closeModal() { nodes.modal.classList.remove('open'); nodes.modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lastFocus?.focus(); }

  document.addEventListener('click', event => {
    const play = event.target.closest('[data-play]');
    const favorite = event.target.closest('[data-favorite]');
    const detail = event.target.closest('[data-detail]');
    const character = event.target.closest('[data-character]');
    const cover = event.target.closest('[data-cover]');
    const lore = event.target.closest('[data-lore]');
    const lyrics = event.target.closest('[data-lyrics]');
    const mood = event.target.closest('[data-mood]');
    const trackDirection = event.target.closest('[data-track-direction]');
    const filter = event.target.closest('[data-filter]');
    const view = event.target.closest('[data-view]');
    if (play) { event.stopPropagation(); loadTrack(Number(play.dataset.play)); }
    else if (favorite) { event.stopPropagation(); toggleFavorite(Number(favorite.dataset.favorite)); }
    else if (lyrics) { event.stopPropagation(); openLyrics(Number(lyrics.dataset.lyrics)); }
    else if (cover) openCover(Number(cover.dataset.cover));
    else if (lore) openTrackDetail(Number(lore.dataset.lore));
    else if (detail) openTrackDetail(Number(detail.dataset.detail));
    else if (character) openCharacter(Number(character.dataset.character));
    else if (trackDirection) nextTrack(trackDirection.dataset.trackDirection === 'previous' ? -1 : 1);
    else if (mood) {
      state.view = 'library'; state.filter = mood.dataset.mood; state.query = ''; nodes.search.value = ''; render();
      nodes.sectionTitle.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
    else if (filter) { state.filter = filter.dataset.filter; render(); }
    else if (view) { state.view = view.dataset.view; state.filter = 'all'; state.query = ''; nodes.search.value = ''; render(); }
    else if (event.target.closest('[data-close-modal]') || event.target === nodes.modal) closeModal();
  });

  nodes.search.addEventListener('input', () => { state.query = nodes.search.value; state.view = 'library'; render(); });
  nodes.favoritesButton.addEventListener('click', () => { state.view = 'library'; state.filter = state.filter === 'favorites' ? 'all' : 'favorites'; render(); });
  nodes.playButton.addEventListener('click', () => togglePlayback());
  nodes.playerFavorite.addEventListener('click', () => toggleFavorite(state.current));
  $('#playerCoverButton').addEventListener('click', () => openCover(state.current));
  $('#previousButton').addEventListener('click', () => nextTrack(-1));
  $('#nextButton').addEventListener('click', () => nextTrack(1));
  nodes.repeat.addEventListener('click', toggleRepeat);
  nodes.headerRepeat.addEventListener('click', toggleRepeat);
  nodes.shuffleButton.addEventListener('click', toggleShuffle);
  nodes.headerShuffle.addEventListener('click', toggleShuffle);
  $('#queueButton').addEventListener('click', () => { nodes.queue.classList.add('open'); nodes.queue.setAttribute('aria-hidden', 'false'); });
  $('#closeQueue').addEventListener('click', () => { nodes.queue.classList.remove('open'); nodes.queue.setAttribute('aria-hidden', 'true'); });
  nodes.volume.addEventListener('input', () => updateVolume(nodes.volume.value));
  nodes.muteButton.addEventListener('click', toggleMute);
  nodes.progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = audio.duration * Number(nodes.progress.value) / 100; });

  audio.addEventListener('play', () => { state.playing = true; render(); });
  audio.addEventListener('pause', () => { state.playing = false; render(); });
  if (!sharedShell) audio.addEventListener('ended', () => nextTrack(1));
  audio.addEventListener('loadedmetadata', () => { nodes.duration.textContent = formatTime(audio.duration); });
  audio.addEventListener('timeupdate', () => { const percent = audio.duration ? audio.currentTime / audio.duration * 100 : 0; nodes.currentTime.textContent = formatTime(audio.currentTime); nodes.progress.value = percent; nodes.progress.style.setProperty('--fill', `${percent}%`); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeModal(); nodes.queue.classList.remove('open'); } if (event.code === 'Space' && !['INPUT','BUTTON'].includes(document.activeElement.tagName)) { event.preventDefault(); togglePlayback(); } });

  if (!sharedShell && 'mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => togglePlayback(true));
    navigator.mediaSession.setActionHandler('pause', () => togglePlayback());
    navigator.mediaSession.setActionHandler('previoustrack', () => nextTrack(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack(1));
  }

  updateVolume(state.volume, false);

  if (sharedShell) sharedShell.subscribe(sharedState => {
    if (sharedState.sourceId === 'resonance') {
      state.current = sharedState.current;
      state.playing = sharedState.playing;
    } else state.playing = false;
    state.shuffle = sharedState.shuffle;
    state.repeat = sharedState.repeat;
    state.volume = sharedState.volume;
    render();
  });
  render();
  const linkedTrack = new URLSearchParams(location.search).get('track');
  if(linkedTrack) {
    const index=soundtracks.findIndex(track=>window.ResonanceSharing.key(track)===linkedTrack);
    if(index>=0) { loadTrack(index,false); openCover(index); }
    else { nodes.sectionTitle.textContent='Esta canción ya no está disponible'; nodes.resultCount.textContent='Puedes explorar el resto de la biblioteca.'; }
  }
})();
