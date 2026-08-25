(() => {
  'use strict';
  if (window.__RP_SHELL_NESTED__) return;

  const resonance = window.RESONANCE_DATA || { soundtracks: [] };
  const etruriaRadio = window.ETRURIA_RADIO_DATA || { stations: [], soundtracks: [] };
  const tracks = resonance.soundtracks || [];
  const $ = id => document.getElementById(id);
  const frame = $('siteFrame');
  const audio = $('globalAudio');
  const nodes = {
    loading: $('pageLoading'), bar: $('resonanceBar'), home: $('homeButton'), openResonance: $('openResonance'),
    sourcePickerButton: $('sourcePickerButton'), sourcePicker: $('sourcePicker'), sourcePickerList: $('sourcePickerList'),
    sourcePickerCurrent: $('sourcePickerCurrent'), closeSourcePicker: $('closeSourcePicker'),
    cover: $('globalCover'), title: $('globalTitle'), artist: $('globalArtist'), pageLabel: $('pageLabel'), play: $('globalPlay'),
    previous: $('globalPrevious'), next: $('globalNext'), shuffle: $('globalShuffle'), current: $('globalCurrent'),
    duration: $('globalDuration'), progress: $('globalProgress'), volume: $('globalVolume'), mute: $('globalMute'),
    queueButton: $('queueButton'), queue: $('globalQueue'), queueTitle: $('globalQueueTitle'), closeQueue: $('closeQueue'), queueList: $('globalQueueList'),
    collapse: $('collapsePlayer'), miniPlayer: $('miniPlayer'), miniIcon: $('miniIcon'), miniTitle: $('miniTitle'),
    resumeNotice: $('resumeNotice'), resumeButton: $('resumeButton'),
    loadingTitle: $('loadingTitle'), loadingHelp: $('loadingHelp'), retryRoute: $('retryRoute'), loadingBackHome: $('loadingBackHome'),
    diagnosticTrigger: $('diagnosticTrigger'), diagnosticScrim: $('diagnosticScrim'), diagnosticPanel: $('diagnosticPanel'), diagnosticClose: $('diagnosticClose'),
    diagnosticOnline: $('diagnosticOnline'), diagnosticRoute: $('diagnosticRoute'), diagnosticCount: $('diagnosticCount'), diagnosticHealth: $('diagnosticHealth'),
    diagnosticClear: $('diagnosticClear'), diagnosticLog: $('diagnosticLog'), diagnosticToast: $('diagnosticToast'), diagnosticToastIcon: $('diagnosticToastIcon'),
    diagnosticToastTitle: $('diagnosticToastTitle'), diagnosticToastText: $('diagnosticToastText'), diagnosticToastClose: $('diagnosticToastClose')
  };
  const baseURL = new URL('./', location.href.split('#')[0]);
  const subscribers = new Set();
  const storedTrack = Math.max(0, Math.min(tracks.length - 1, Number(localStorage.getItem('resonanceTrack') || 0)));
  const storedVolume = Math.max(0, Math.min(1, Number(localStorage.getItem('resonanceVolume') ?? .85)));
  const state = {
    current: Number.isFinite(storedTrack) ? storedTrack : 0,
    shuffle: JSON.parse(localStorage.getItem('resonanceShuffle') || 'false'),
    previousVolume: Math.max(.01, Number(localStorage.getItem('resonancePreviousVolume') || storedVolume || .85)),
    route: '', collapsed: localStorage.getItem('resonancePlayerCollapsed') === 'true', restoreTime: Number(localStorage.getItem('resonanceCurrentTime') || 0),
    resumeWanted: localStorage.getItem('resonanceWasPlaying') === 'true'
  };
  const sources = new Map();
  let activeSource = createSource({
    id: 'resonance', label: 'RESONANCE · REPRODUCTOR GLOBAL', queueLabel: 'Cola de Resonance',
    route: 'OST/index.html', album: 'Resonance', basePath: 'OST/', tracks
  });
  sources.set(activeSource.id, activeSource);
  registerEtruriaSources();
  const storedSourceId = localStorage.getItem('globalAudioSource') || 'resonance';
  if (sources.get(storedSourceId)?.tracks.length) activeSource = sources.get(storedSourceId);
  const storedSourceTrack = Number(localStorage.getItem(`globalAudioTrack:${activeSource.id}`) ?? (activeSource.id === 'resonance' ? storedTrack : 0));
  state.current = Number.isFinite(storedSourceTrack) ? Math.max(0, Math.min(activeSource.tracks.length - 1, storedSourceTrack)) : 0;
  state.restoreTime = Number(localStorage.getItem(`globalAudioTime:${activeSource.id}`) ?? (activeSource.id === 'resonance' ? state.restoreTime : 0));
  let lastSavedSecond = -1;
  let loadWarningTimer = 0;
  let diagnosticToastTimer = 0;
  let diagnosticEvents = (() => {
    try { return JSON.parse(localStorage.getItem('rpDiagnosticEvents') || '[]').slice(0, 30); }
    catch (error) { return []; }
  })();

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function saveDiagnostics() {
    try { localStorage.setItem('rpDiagnosticEvents', JSON.stringify(diagnosticEvents.slice(0, 30))); }
    catch (error) {}
  }

  function diagnosticTime(timestamp) {
    return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(timestamp));
  }

  function renderDiagnostics() {
    if (!nodes.diagnosticLog) return;
    const online = navigator.onLine;
    nodes.diagnosticOnline.textContent = online ? 'En línea' : 'Sin conexión';
    nodes.diagnosticOnline.className = online ? 'ok' : 'bad';
    nodes.diagnosticRoute.textContent = state.route || routeFromHash();
    nodes.diagnosticCount.textContent = `${diagnosticEvents.length} ${diagnosticEvents.length === 1 ? 'registrada' : 'registradas'}`;
    nodes.diagnosticLog.innerHTML = diagnosticEvents.length ? diagnosticEvents.map(entry => `
      <article class="diagnostic-entry ${escapeHTML(entry.level)}">
        <header><strong>${escapeHTML(entry.title)}</strong><time datetime="${escapeHTML(entry.time)}">${escapeHTML(diagnosticTime(entry.time))}</time></header>
        <p>${escapeHTML(entry.detail)}</p>
      </article>`).join('') : '<p class="diagnostic-empty">Todavía no se ha detectado ningún problema.</p>';
  }

  function showDiagnosticToast(level, title, detail, duration = 6500) {
    clearTimeout(diagnosticToastTimer);
    nodes.diagnosticToast.className = `diagnostic-toast ${level}`;
    nodes.diagnosticToastIcon.textContent = level === 'success' ? '✓' : level === 'error' ? '×' : '!';
    nodes.diagnosticToastTitle.textContent = title;
    nodes.diagnosticToastText.textContent = detail;
    nodes.diagnosticToast.hidden = false;
    diagnosticToastTimer = window.setTimeout(() => { nodes.diagnosticToast.hidden = true; }, duration);
  }

  function addDiagnostic(level, title, detail, notifyUser = false) {
    const duplicate = diagnosticEvents[0];
    if (!duplicate || duplicate.title !== title || duplicate.detail !== detail || Date.now() - new Date(duplicate.time).getTime() > 3000) {
      diagnosticEvents.unshift({ level, title, detail, time: new Date().toISOString(), route: state.route });
      diagnosticEvents = diagnosticEvents.slice(0, 30);
      saveDiagnostics();
      renderDiagnostics();
    }
    if (notifyUser) showDiagnosticToast(level, title, detail);
  }

  function openDiagnostics() {
    renderDiagnostics();
    nodes.diagnosticScrim.hidden = false;
    nodes.diagnosticPanel.classList.add('open');
    nodes.diagnosticPanel.setAttribute('aria-hidden', 'false');
    nodes.diagnosticClose.focus();
  }

  function closeDiagnostics() {
    nodes.diagnosticPanel.classList.remove('open');
    nodes.diagnosticPanel.setAttribute('aria-hidden', 'true');
    nodes.diagnosticScrim.hidden = true;
    nodes.diagnosticTrigger.focus();
  }

  function runHealthCheck() {
    let frameStatus = 'No disponible';
    let missingResources = 0;
    try {
      const childDocument = frame.contentDocument;
      frameStatus = childDocument?.readyState === 'complete' ? 'Página cargada' : `Estado: ${childDocument?.readyState || 'desconocido'}`;
      missingResources = [...(childDocument?.images || [])].filter(image => image.complete && image.naturalWidth === 0).length;
    } catch (error) { frameStatus = 'No se puede inspeccionar esta página'; }
    const detail = `${navigator.onLine ? 'Conexión disponible' : 'Sin conexión'} · ${frameStatus} · ${tracks.length} canciones registradas · ${missingResources} imágenes ausentes`;
    addDiagnostic(missingResources ? 'warning' : 'success', 'Revisión rápida completada', detail, true);
  }

  function installFrameDiagnostics(childWindow, childDocument) {
    if (!childWindow || !childDocument || childDocument.documentElement?.dataset.rpDiagnostics === 'on') return;
    if (childDocument.documentElement) childDocument.documentElement.dataset.rpDiagnostics = 'on';
    childWindow.addEventListener('error', event => {
      const target = event.target;
      if (target && target !== childWindow) {
        const tag = String(target.tagName || '').toLowerCase();
        const source = target.currentSrc || target.src || target.href || 'recurso desconocido';
        const important = ['script', 'link', 'audio', 'video'].includes(tag);
        addDiagnostic(important ? 'error' : 'warning', important ? 'Archivo esencial no disponible' : 'Recurso no disponible', `${tag || 'archivo'}: ${source}`, important);
      } else if (event.message) {
        addDiagnostic('error', 'Error en la página', event.message, true);
      }
    }, true);
    childWindow.addEventListener('unhandledrejection', event => {
      addDiagnostic('error', 'La página no pudo completar una tarea', String(event.reason?.message || event.reason || 'Error desconocido'), true);
    });
  }

  function formatTime(seconds) {
    return Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
  }

  function assetURL(source = '') {
    if (/^(?:https?:|data:|blob:)/i.test(source)) return source;
    return new URL(source.startsWith('OST/') ? source : `OST/${source.replace(/^\.\//, '')}`, baseURL).href;
  }

  function sourceURL(source, value = '') {
    if (!value) return '';
    if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
    return new URL(`${source.basePath || ''}${String(value).replace(/^\.\//, '')}`, baseURL).href;
  }

  function createSource(definition = {}) {
    const source = {
      id: String(definition.id || 'external'),
      label: String(definition.label || 'REPRODUCTOR GLOBAL'),
      queueLabel: String(definition.queueLabel || 'Cola de reproducción'),
      route: cleanRoute(definition.route || 'hub.html'),
      album: String(definition.album || definition.label || 'RP HUB'),
      basePath: String(definition.basePath || ''),
      short: String(definition.short || definition.label || 'RADIO'),
      frequency: String(definition.frequency || ''),
      color: String(definition.color || '#a882ff'),
      kind: String(definition.kind || 'radio'),
      tracks: []
    };
    source.tracks = (Array.isArray(definition.tracks) ? definition.tracks : []).map((track, index) => ({
      ...track,
      sourceTrackId: track.sourceTrackId ?? track.index ?? index,
      songTitle: track.songTitle || track.title || `Canción ${index + 1}`,
      character: track.character || (Array.isArray(track.characters) ? track.characters.join(' · ') : '') || track.artist || source.label,
      songCover: sourceURL(source, track.songCover || track.cover || ''),
      audio: sourceURL(source, track.audio || '')
    }));
    return source;
  }

  function registerEtruriaSources() {
    const indexedTracks = (etruriaRadio.soundtracks || []).map((track, index) => ({ ...track, index }));
    (etruriaRadio.stations || []).forEach(station => {
      const stationTracks = indexedTracks.filter(track => (track.station || 'battle') === station.id);
      const source = createSource({
        id: `etruria:${station.id}`,
        label: `ETRURIA RADIO · ${station.frequency} FM`,
        queueLabel: `Cola de ${station.name}`,
        route: 'Pokemon/EtruriaRadio/index.html',
        album: station.name,
        basePath: 'Pokemon/EtruriaRadio/',
        short: station.short,
        frequency: `${station.frequency} FM`,
        color: station.color,
        kind: 'etruria',
        tracks: stationTracks
      });
      sources.set(source.id, source);
    });
  }

  function sourceDisplayName(source) {
    return source.id === 'resonance' ? 'Resonance' : `${source.album} · ${source.frequency}`;
  }

  function renderSourcePicker() {
    if (!nodes.sourcePickerList) return;
    const availableSources = [...sources.values()].filter(source => source.id === 'resonance' || source.id.startsWith('etruria:'));
    nodes.sourcePickerCurrent.textContent = `${sourceDisplayName(activeSource)} está seleccionada`;
    nodes.sourcePickerList.innerHTML = availableSources.map(source => {
      const active = source.id === activeSource.id;
      const available = source.tracks.length > 0;
      const icon = source.id === 'resonance' ? 'R' : escapeHTML(source.short.slice(0, 3));
      const subtitle = source.id === 'resonance'
        ? `${source.tracks.length} canciones · Banda sonora general`
        : `${source.tracks.length} canciones · ${escapeHTML(source.frequency)}`;
      return `<button class="source-option ${active ? 'active' : ''}" type="button" data-source-id="${escapeHTML(source.id)}" aria-pressed="${active}" ${available ? '' : 'disabled'} style="--source-color:${escapeHTML(source.color)}"><span class="source-option-icon">${icon}</span><span class="source-option-copy"><strong>${escapeHTML(sourceDisplayName(source))}</strong><span>${subtitle}</span></span><span class="source-option-state">${active ? 'SONANDO' : available ? 'ELEGIR' : 'VACÍA'}</span></button>`;
    }).join('');
    nodes.sourcePickerList.querySelectorAll('[data-source-id]').forEach(button => button.addEventListener('click', () => {
      switchSource(button.dataset.sourceId, true);
      closeSourcePicker();
    }));
  }

  function closeSourcePicker(returnFocus = false) {
    if (!nodes.sourcePicker) return;
    nodes.sourcePicker.classList.remove('open');
    nodes.sourcePicker.setAttribute('aria-hidden', 'true');
    nodes.sourcePickerButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) nodes.sourcePickerButton.focus();
  }

  function toggleSourcePicker() {
    const willOpen = !nodes.sourcePicker.classList.contains('open');
    closeQueue();
    nodes.sourcePicker.classList.toggle('open', willOpen);
    nodes.sourcePicker.setAttribute('aria-hidden', String(!willOpen));
    nodes.sourcePickerButton.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) renderSourcePicker();
  }

  function switchSource(sourceId, autoplay = true) {
    const nextSource = sources.get(sourceId);
    if (!nextSource?.tracks.length) return;
    const sourceChanged = activeSource.id !== nextSource.id;
    activeSource = nextSource;
    if (sourceChanged) state.restoreTime = 0;
    const rememberedTrack = Number(localStorage.getItem(`globalAudioTrack:${activeSource.id}`) || 0);
    const index = Number.isFinite(rememberedTrack) ? Math.max(0, Math.min(activeSource.tracks.length - 1, rememberedTrack)) : 0;
    selectActiveTrack(index, autoplay);
  }

  function currentTracks() {
    return activeSource.tracks;
  }

  function currentTrack() {
    return currentTracks()[state.current] || null;
  }

  function audioURL(index) {
    return currentTracks()[index]?.audio || '';
  }

  function sameURL(a, b) {
    try { return decodeURI(a) === decodeURI(b); } catch (error) { return a === b; }
  }

  function notify() {
    const snapshot = getState();
    subscribers.forEach(callback => { try { callback(snapshot); } catch (error) {} });
  }

  function updateMetadata(track) {
    if (!track || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.songTitle, artist: track.character, album: activeSource.album,
      artwork: track.songCover ? [{ src: track.songCover }] : []
    });
  }

  function selectActiveTrack(index, autoplay = true) {
    const sourceTracks = currentTracks();
    index = Math.max(0, Math.min(sourceTracks.length - 1, Number(index)));
    const track = sourceTracks[index];
    if (!track) return;
    const nextSource = audioURL(index);
    const changed = state.current !== index || !sameURL(audio.src, nextSource);
    state.current = index;
    if (activeSource.id === 'resonance') localStorage.setItem('resonanceTrack', String(index));
    localStorage.setItem('globalAudioSource', activeSource.id);
    localStorage.setItem(`globalAudioTrack:${activeSource.id}`, String(index));
    if (changed) {
      state.restoreTime = 0;
      audio.src = nextSource;
      audio.load();
    }
    updateMetadata(track);
    renderPlayer();
    renderQueue();
    renderSourcePicker();
    notify();
    if (autoplay) play();
  }

  function setSource(definition, index = 0, autoplay = true) {
    const previousDefinition = sources.get(String(definition?.id || '')) || {};
    const nextSource = createSource({ ...previousDefinition, ...definition });
    if (!nextSource.tracks.length) return;
    const sourceChanged = activeSource.id !== nextSource.id;
    sources.set(nextSource.id, nextSource);
    activeSource = nextSource;
    if (sourceChanged) state.restoreTime = 0;
    selectActiveTrack(index, autoplay);
  }

  function setTrack(index, autoplay = true) {
    const resonanceSource = sources.get('resonance');
    if (!resonanceSource) return;
    activeSource = resonanceSource;
    selectActiveTrack(index, autoplay);
  }

  async function play() {
    if (!currentTracks().length) return;
    if (!audio.src) selectActiveTrack(state.current, false);
    try {
      await audio.play();
      localStorage.setItem('resonanceWasPlaying', 'true');
      nodes.resumeNotice.hidden = true;
    } catch (error) {
      nodes.resumeNotice.hidden = false;
    }
  }

  function pause() {
    audio.pause();
    localStorage.setItem('resonanceWasPlaying', 'false');
  }

  function toggle() {
    audio.paused ? play() : pause();
  }

  function next(direction = 1) {
    const sourceTracks = currentTracks();
    if (!sourceTracks.length) return;
    let index;
    if (state.shuffle && sourceTracks.length > 1) {
      do index = Math.floor(Math.random() * sourceTracks.length); while (index === state.current);
    } else index = (state.current + direction + sourceTracks.length) % sourceTracks.length;
    selectActiveTrack(index, true);
  }

  function setShuffle(value) {
    state.shuffle = Boolean(value);
    localStorage.setItem('resonanceShuffle', String(state.shuffle));
    renderPlayer();
    notify();
  }

  function setVolume(value, remember = true) {
    const nextVolume = Math.max(0, Math.min(1, Number(value)));
    if (audio.volume !== nextVolume) audio.volume = nextVolume;
    nodes.volume.value = String(audio.volume);
    nodes.volume.style.setProperty('--fill', `${audio.volume * 100}%`);
    localStorage.setItem('resonanceVolume', String(audio.volume));
    if (remember && audio.volume > 0) {
      state.previousVolume = audio.volume;
      localStorage.setItem('resonancePreviousVolume', String(audio.volume));
    }
    nodes.mute.textContent = audio.volume === 0 ? '×' : audio.volume < .45 ? '◔' : '◖';
    nodes.mute.setAttribute('aria-label', audio.volume === 0 ? 'Restaurar volumen' : 'Silenciar');
  }

  function renderPlayer() {
    const track = currentTrack();
    if (!track) return;
    const playing = !audio.paused;
    nodes.cover.src = track.songCover || 'OST/ResonanceLogo.png';
    nodes.cover.alt = `Portada de ${track.songTitle}`;
    nodes.title.textContent = track.songTitle;
    nodes.artist.textContent = track.character;
    nodes.pageLabel.textContent = activeSource.label;
    nodes.openResonance.setAttribute('aria-label', `Abrir ${activeSource.label.toLowerCase()}`);
    nodes.sourcePickerButton.setAttribute('title', `Cambiar de radio · Ahora: ${sourceDisplayName(activeSource)}`);
    nodes.play.textContent = playing ? '❚❚' : '▶';
    nodes.play.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
    nodes.bar.classList.toggle('playing', playing);
    nodes.shuffle.classList.toggle('active', state.shuffle);
    nodes.shuffle.setAttribute('aria-pressed', String(state.shuffle));
    nodes.miniIcon.textContent = playing ? '❚❚' : '▶';
    nodes.miniTitle.textContent = `${track.songTitle} · ${track.character}`;
  }

  function renderTimeline() {
    const percent = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    nodes.current.textContent = formatTime(audio.currentTime);
    nodes.duration.textContent = formatTime(audio.duration);
    nodes.progress.value = String(percent);
    nodes.progress.style.setProperty('--fill', `${percent}%`);
  }

  function renderQueue() {
    const sourceTracks = currentTracks();
    if (!sourceTracks.length) return;
    const ordered = [...sourceTracks.keys()].slice(state.current).concat([...sourceTracks.keys()].slice(0, state.current));
    if (nodes.queueTitle) nodes.queueTitle.textContent = activeSource.queueLabel;
    nodes.queueList.innerHTML = ordered.map(index => {
      const track = sourceTracks[index];
      return `<button class="queue-item ${index === state.current ? 'active' : ''}" data-track="${index}" type="button"><img src="${escapeHTML(track.songCover || 'OST/ResonanceLogo.png')}" alt=""><span><strong>${escapeHTML(track.songTitle)}</strong><span>${escapeHTML(track.character)}</span></span>${index === state.current ? '<b>SONANDO</b>' : '<b>▶</b>'}</button>`;
    }).join('');
    nodes.queueList.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => { selectActiveTrack(Number(button.dataset.track), true); closeQueue(); }));
  }

  function getState() {
    const track = currentTrack();
    return { current: state.current, sourceId: activeSource.id, sourceLabel: activeSource.label, sourceTrackId: track?.sourceTrackId ?? null, playing: !audio.paused, shuffle: state.shuffle, volume: audio.volume, currentTime: audio.currentTime, duration: audio.duration, track };
  }

  function subscribe(callback) {
    subscribers.add(callback);
    callback(getState());
    return () => subscribers.delete(callback);
  }

  window.ResonanceShell = { audio, tracks, setTrack, setSource, play, pause, toggle, setShuffle, setVolume, next: () => next(1), previous: () => next(-1), getState, subscribe, assetURL };
  window.GlobalAudioShell = window.ResonanceShell;

  function cleanRoute(route = '') {
    route = decodeURIComponent(String(route).replace(/^#?\/?/, '')) || 'hub.html';
    if (route === 'index.html' || route.startsWith('index.html?') || route.startsWith('index.html#')) route = `hub.html${route.slice('index.html'.length)}`;
    try {
      const target = new URL(route, baseURL);
      if (target.protocol !== baseURL.protocol || target.host !== baseURL.host || !decodeURI(target.href).startsWith(decodeURI(baseURL.href))) return 'hub.html';
      return decodeURI(target.href.slice(baseURL.href.length));
    } catch (error) { return 'hub.html'; }
  }

  function routeFromHash() {
    const match = location.hash.match(/^#route=(.*)$/);
    return cleanRoute(match ? decodeURIComponent(match[1]) : 'hub.html');
  }

  function loadRoute(route, replace = false) {
    route = cleanRoute(route);
    document.body.classList.toggle('route-hub', route.split(/[?#]/)[0] === 'hub.html');
    const hash = `#route=${encodeURIComponent(route)}`;
    if (replace) history.replaceState(null, '', hash);
    else if (location.hash !== hash) history.pushState(null, '', hash);
    if (state.route === route && frame.src) return;
    state.route = route;
    clearTimeout(loadWarningTimer);
    nodes.loading.classList.remove('done', 'slow', 'diagnostic-preview');
    nodes.loadingTitle.textContent = 'Abriendo archivo…';
    nodes.loadingHelp.hidden = true;
    loadWarningTimer = window.setTimeout(() => {
      if (nodes.loading.classList.contains('done')) return;
      nodes.loading.classList.add('slow');
      nodes.loadingTitle.textContent = 'La carga está tardando';
      nodes.loadingHelp.hidden = false;
      addDiagnostic('warning', 'Carga más lenta de lo normal', `La ruta ${route} lleva más de 8 segundos cargando. Puede ser la conexión o GitHub.`, false);
    }, 8000);
    frame.src = new URL(route, baseURL).href;
  }

  function relativeRoute(url) {
    try {
      if (url.protocol !== baseURL.protocol || url.host !== baseURL.host || !decodeURI(url.href).startsWith(decodeURI(baseURL.href))) return null;
      return cleanRoute(decodeURI(url.href.slice(baseURL.href.length)));
    } catch (error) { return null; }
  }

  function interceptFrameNavigation(documentReference) {
    documentReference.addEventListener('click', event => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const raw = anchor.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
      const target = new URL(anchor.href, frame.contentWindow.location.href);
      const route = relativeRoute(target);
      if (route !== null) {
        event.preventDefault();
        loadRoute(route);
      } else if (/^https?:/i.test(target.protocol)) {
        event.preventDefault();
        window.open(target.href, '_blank', 'noopener');
      }
    }, true);
  }

  frame.addEventListener('load', () => {
    clearTimeout(loadWarningTimer);
    nodes.loading.classList.add('done');
    try {
      const childDocument = frame.contentDocument;
      installFrameDiagnostics(frame.contentWindow, childDocument);
      const childURL = new URL(frame.contentWindow.location.href);
      const route = relativeRoute(childURL);
      if (route && route !== state.route) {
        state.route = route;
        history.replaceState(null, '', `#route=${encodeURIComponent(route)}`);
      }
      interceptFrameNavigation(childDocument);
      const hubAudio = childDocument.getElementById('hubAudio');
      if (hubAudio) hubAudio.pause();
      const musicPanel = childDocument.getElementById('musicPanel');
      if (musicPanel) musicPanel.style.display = 'none';
      const title = childDocument.title?.replace(/\s*[—·|-].*$/, '') || 'RP HUB';
      document.title = `${title} · RP HUB`;
      renderPlayer();
    } catch (error) {
      renderPlayer();
    }
  });

  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.type !== 'rp-shell-navigate') return;
    loadRoute(event.data.route || 'hub.html');
  });
  window.addEventListener('popstate', () => loadRoute(routeFromHash(), true));

  function closeQueue() { nodes.queue.classList.remove('open'); nodes.queue.setAttribute('aria-hidden', 'true'); }
  nodes.home.addEventListener('click', () => loadRoute('hub.html'));
  nodes.openResonance.addEventListener('click', () => loadRoute(activeSource.route));
  nodes.sourcePickerButton.addEventListener('click', toggleSourcePicker);
  nodes.closeSourcePicker.addEventListener('click', () => closeSourcePicker(true));
  nodes.play.addEventListener('click', toggle);
  nodes.previous.addEventListener('click', () => next(-1));
  nodes.next.addEventListener('click', () => next(1));
  nodes.shuffle.addEventListener('click', () => setShuffle(!state.shuffle));
  nodes.progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = audio.duration * Number(nodes.progress.value) / 100; });
  nodes.volume.addEventListener('input', () => setVolume(nodes.volume.value));
  nodes.mute.addEventListener('click', () => setVolume(audio.volume > 0 ? 0 : state.previousVolume, audio.volume === 0));
  nodes.queueButton.addEventListener('click', () => { closeSourcePicker(); nodes.queue.classList.toggle('open'); nodes.queue.setAttribute('aria-hidden', String(!nodes.queue.classList.contains('open'))); });
  nodes.closeQueue.addEventListener('click', closeQueue);
  nodes.collapse.addEventListener('click', () => { closeSourcePicker(); closeQueue(); state.collapsed = true; document.body.classList.add('player-collapsed'); localStorage.setItem('resonancePlayerCollapsed', 'true'); });
  nodes.miniPlayer.addEventListener('click', () => { state.collapsed = false; document.body.classList.remove('player-collapsed'); localStorage.setItem('resonancePlayerCollapsed', 'false'); });
  nodes.resumeButton.addEventListener('click', () => {
    state.resumeWanted = false;
    nodes.resumeNotice.hidden = true;
    play();
  });
  nodes.retryRoute.addEventListener('click', () => {
    const route = state.route || routeFromHash();
    state.route = '';
    loadRoute(route, true);
  });
  nodes.loadingBackHome.addEventListener('click', () => {
    state.route = '';
    loadRoute('hub.html', true);
  });
  nodes.diagnosticTrigger.addEventListener('click', openDiagnostics);
  nodes.diagnosticClose.addEventListener('click', closeDiagnostics);
  nodes.diagnosticScrim.addEventListener('click', closeDiagnostics);
  nodes.diagnosticToastClose.addEventListener('click', () => {
    clearTimeout(diagnosticToastTimer);
    nodes.diagnosticToast.hidden = true;
  });
  nodes.diagnosticHealth.addEventListener('click', runHealthCheck);
  nodes.diagnosticClear.addEventListener('click', () => {
    diagnosticEvents = [];
    saveDiagnostics();
    renderDiagnostics();
    showDiagnosticToast('success', 'Registro vacío', 'Se han eliminado las incidencias guardadas en este navegador.');
  });
  nodes.diagnosticPanel.addEventListener('click', event => {
    const button = event.target.closest('[data-diagnostic-test]');
    if (!button) return;
    const test = button.dataset.diagnosticTest;
    if (test === 'slow') {
      addDiagnostic('warning', 'Prueba · Carga lenta', 'Simulación manual del aviso de carga prolongada.', false);
      closeDiagnostics();
      nodes.loading.classList.remove('done');
      nodes.loading.classList.add('slow', 'diagnostic-preview');
      nodes.loadingTitle.textContent = 'La carga está tardando';
      nodes.loadingHelp.hidden = false;
      return;
    }
    const tests = {
      offline: ['warning', 'Prueba · Sin conexión', 'No hay conexión a Internet. Algunas páginas pueden no abrir hasta que la red vuelva.'],
      github: ['error', 'Prueba · GitHub no responde', 'GitHub está tardando en servir los archivos. Prueba a reintentarlo dentro de unos segundos.'],
      data: ['error', 'Prueba · Datos sin cargar', 'El archivo de datos de esta sección no se ha podido leer. Recarga la página y comprueba el registro.'],
      resource: ['warning', 'Prueba · Recurso ausente', 'Una imagen o archivo asociado no está disponible. El resto de la página puede seguir funcionando.'],
      audio: ['error', 'Prueba · Audio no disponible', 'No se ha podido cargar esta canción. El archivo puede faltar o seguir descargándose.']
    };
    const selected = tests[test];
    if (selected) addDiagnostic(selected[0], selected[1], selected[2], true);
  });
  document.addEventListener('keydown', event => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      nodes.diagnosticPanel.classList.contains('open') ? closeDiagnostics() : openDiagnostics();
    } else if (event.key === 'Escape' && nodes.diagnosticPanel.classList.contains('open')) closeDiagnostics();
    else if (event.key === 'Escape' && nodes.sourcePicker.classList.contains('open')) closeSourcePicker(true);
  });
  document.addEventListener('click', event => {
    if (!nodes.sourcePicker.classList.contains('open')) return;
    if (nodes.sourcePicker.contains(event.target) || nodes.sourcePickerButton.contains(event.target)) return;
    closeSourcePicker();
  });

  window.addEventListener('offline', () => addDiagnostic('warning', 'Sin conexión', 'Se ha perdido la conexión a Internet. Mantén la página abierta y vuelve a intentarlo cuando regrese.', true));
  window.addEventListener('online', () => addDiagnostic('success', 'Conexión recuperada', 'La conexión a Internet vuelve a estar disponible.', true));
  window.addEventListener('error', event => {
    if (event.target === window && event.message) addDiagnostic('error', 'Error del reproductor global', event.message, true);
  });
  window.addEventListener('unhandledrejection', event => addDiagnostic('error', 'Tarea global interrumpida', String(event.reason?.message || event.reason || 'Error desconocido'), true));

  audio.addEventListener('play', () => {
    state.resumeWanted = false;
    nodes.resumeNotice.hidden = true;
    localStorage.setItem('resonanceWasPlaying', 'true');
    renderPlayer();
    notify();
  });
  audio.addEventListener('pause', () => { renderPlayer(); notify(); });
  audio.addEventListener('ended', () => next(1));
  audio.addEventListener('loadedmetadata', () => {
    if (state.restoreTime > 0 && state.restoreTime < audio.duration - 1) audio.currentTime = state.restoreTime;
    state.restoreTime = 0;
    renderTimeline();
  });
  audio.addEventListener('timeupdate', () => {
    renderTimeline();
    const second = Math.floor(audio.currentTime);
    if (second !== lastSavedSecond) {
      lastSavedSecond = second;
      localStorage.setItem(`globalAudioTime:${activeSource.id}`, String(audio.currentTime));
      if (activeSource.id === 'resonance') localStorage.setItem('resonanceCurrentTime', String(audio.currentTime));
    }
  });
  audio.addEventListener('volumechange', () => setVolume(audio.volume, false));
  audio.addEventListener('error', () => {
    const title = currentTrack()?.songTitle || 'la canción seleccionada';
    addDiagnostic('error', 'Audio no disponible', `No se ha podido cargar ${title}. Comprueba que el archivo existe y vuelve a intentarlo.`, true);
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('previoustrack', () => next(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => next(1));
    navigator.mediaSession.setActionHandler('seekto', details => { if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime; });
  }

  setVolume(storedVolume, false);
  document.body.classList.toggle('player-collapsed', state.collapsed);
  if (activeSource.tracks.length) selectActiveTrack(state.current, false);
  nodes.resumeNotice.hidden = !state.resumeWanted;
  renderDiagnostics();
  if (!navigator.onLine) addDiagnostic('warning', 'Sin conexión al abrir la página', 'El navegador indica que no hay conexión a Internet.', true);
  if (!tracks.length) addDiagnostic('error', 'Datos de Resonance sin cargar', 'No se ha encontrado ninguna canción. Es posible que el archivo de datos no haya cargado.', true);
  renderQueue();
  renderSourcePicker();
  loadRoute(routeFromHash(), true);
})();
