(() => {
  'use strict';
  if (window.__RP_SHELL_NESTED__) return;

  const resonance = window.RESONANCE_DATA || { soundtracks: [] };
  const tracks = resonance.soundtracks || [];
  const $ = id => document.getElementById(id);
  const frame = $('siteFrame');
  const audio = $('globalAudio');
  const nodes = {
    loading: $('pageLoading'), bar: $('resonanceBar'), home: $('homeButton'), openResonance: $('openResonance'),
    cover: $('globalCover'), title: $('globalTitle'), artist: $('globalArtist'), pageLabel: $('pageLabel'), play: $('globalPlay'),
    previous: $('globalPrevious'), next: $('globalNext'), shuffle: $('globalShuffle'), current: $('globalCurrent'),
    duration: $('globalDuration'), progress: $('globalProgress'), volume: $('globalVolume'), mute: $('globalMute'),
    queueButton: $('queueButton'), queue: $('globalQueue'), closeQueue: $('closeQueue'), queueList: $('globalQueueList'),
    collapse: $('collapsePlayer'), miniPlayer: $('miniPlayer'), miniIcon: $('miniIcon'), miniTitle: $('miniTitle'),
    resumeNotice: $('resumeNotice'), resumeButton: $('resumeButton')
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
  let lastSavedSecond = -1;

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function formatTime(seconds) {
    return Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
  }

  function assetURL(source = '') {
    if (/^(?:https?:|data:|blob:)/i.test(source)) return source;
    return new URL(source.startsWith('OST/') ? source : `OST/${source.replace(/^\.\//, '')}`, baseURL).href;
  }

  function audioURL(index) {
    return assetURL(tracks[index]?.audio || '');
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
      title: track.songTitle, artist: track.character, album: 'Resonance',
      artwork: [{ src: assetURL(track.songCover) }]
    });
  }

  function setTrack(index, autoplay = true) {
    index = Math.max(0, Math.min(tracks.length - 1, Number(index)));
    const track = tracks[index];
    if (!track) return;
    const nextSource = audioURL(index);
    const changed = state.current !== index || !sameURL(audio.src, nextSource);
    state.current = index;
    localStorage.setItem('resonanceTrack', String(index));
    if (changed) {
      state.restoreTime = 0;
      audio.src = nextSource;
      audio.load();
    }
    updateMetadata(track);
    renderPlayer();
    renderQueue();
    notify();
    if (autoplay) play();
  }

  async function play() {
    if (!tracks.length) return;
    if (!audio.src) setTrack(state.current, false);
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
    if (!tracks.length) return;
    let index;
    if (state.shuffle && tracks.length > 1) {
      do index = Math.floor(Math.random() * tracks.length); while (index === state.current);
    } else index = (state.current + direction + tracks.length) % tracks.length;
    setTrack(index, true);
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
    const track = tracks[state.current];
    if (!track) return;
    const playing = !audio.paused;
    nodes.cover.src = assetURL(track.songCover);
    nodes.cover.alt = `Portada de ${track.songTitle}`;
    nodes.title.textContent = track.songTitle;
    nodes.artist.textContent = track.character;
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
    if (!tracks.length) return;
    const ordered = [...tracks.keys()].slice(state.current).concat([...tracks.keys()].slice(0, state.current));
    nodes.queueList.innerHTML = ordered.map(index => {
      const track = tracks[index];
      return `<button class="queue-item ${index === state.current ? 'active' : ''}" data-track="${index}" type="button"><img src="${escapeHTML(assetURL(track.songCover))}" alt=""><span><strong>${escapeHTML(track.songTitle)}</strong><span>${escapeHTML(track.character)}</span></span>${index === state.current ? '<b>SONANDO</b>' : '<b>▶</b>'}</button>`;
    }).join('');
    nodes.queueList.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => { setTrack(Number(button.dataset.track), true); closeQueue(); }));
  }

  function getState() {
    return { current: state.current, playing: !audio.paused, shuffle: state.shuffle, volume: audio.volume, currentTime: audio.currentTime, duration: audio.duration, track: tracks[state.current] || null };
  }

  function subscribe(callback) {
    subscribers.add(callback);
    callback(getState());
    return () => subscribers.delete(callback);
  }

  window.ResonanceShell = { audio, tracks, setTrack, play, pause, toggle, setShuffle, next: () => next(1), previous: () => next(-1), getState, subscribe, assetURL };

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
    const hash = `#route=${encodeURIComponent(route)}`;
    if (replace) history.replaceState(null, '', hash);
    else if (location.hash !== hash) history.pushState(null, '', hash);
    if (state.route === route && frame.src) return;
    state.route = route;
    nodes.loading.classList.remove('done');
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
    nodes.loading.classList.add('done');
    try {
      const childDocument = frame.contentDocument;
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
      nodes.pageLabel.textContent = `${title.toUpperCase()} · RESONANCE GLOBAL`;
      document.title = `${title} · RP HUB`;
    } catch (error) {
      nodes.pageLabel.textContent = 'RP HUB · RESONANCE GLOBAL';
    }
  });

  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.type !== 'rp-shell-navigate') return;
    loadRoute(event.data.route || 'hub.html');
  });
  window.addEventListener('popstate', () => loadRoute(routeFromHash(), true));

  function closeQueue() { nodes.queue.classList.remove('open'); nodes.queue.setAttribute('aria-hidden', 'true'); }
  nodes.home.addEventListener('click', () => loadRoute('hub.html'));
  nodes.openResonance.addEventListener('click', () => loadRoute('OST/index.html'));
  nodes.play.addEventListener('click', toggle);
  nodes.previous.addEventListener('click', () => next(-1));
  nodes.next.addEventListener('click', () => next(1));
  nodes.shuffle.addEventListener('click', () => setShuffle(!state.shuffle));
  nodes.progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = audio.duration * Number(nodes.progress.value) / 100; });
  nodes.volume.addEventListener('input', () => setVolume(nodes.volume.value));
  nodes.mute.addEventListener('click', () => setVolume(audio.volume > 0 ? 0 : state.previousVolume, audio.volume === 0));
  nodes.queueButton.addEventListener('click', () => { nodes.queue.classList.toggle('open'); nodes.queue.setAttribute('aria-hidden', String(!nodes.queue.classList.contains('open'))); });
  nodes.closeQueue.addEventListener('click', closeQueue);
  nodes.collapse.addEventListener('click', () => { state.collapsed = true; document.body.classList.add('player-collapsed'); localStorage.setItem('resonancePlayerCollapsed', 'true'); });
  nodes.miniPlayer.addEventListener('click', () => { state.collapsed = false; document.body.classList.remove('player-collapsed'); localStorage.setItem('resonancePlayerCollapsed', 'false'); });
  nodes.resumeButton.addEventListener('click', play);

  audio.addEventListener('play', () => { localStorage.setItem('resonanceWasPlaying', 'true'); renderPlayer(); notify(); });
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
    if (second !== lastSavedSecond) { lastSavedSecond = second; localStorage.setItem('resonanceCurrentTime', String(audio.currentTime)); }
  });
  audio.addEventListener('volumechange', () => setVolume(audio.volume, false));

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('previoustrack', () => next(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => next(1));
    navigator.mediaSession.setActionHandler('seekto', details => { if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime; });
  }

  setVolume(storedVolume, false);
  document.body.classList.toggle('player-collapsed', state.collapsed);
  if (tracks.length) setTrack(state.current, false);
  nodes.resumeNotice.hidden = !state.resumeWanted;
  renderQueue();
  loadRoute(routeFromHash(), true);
})();
