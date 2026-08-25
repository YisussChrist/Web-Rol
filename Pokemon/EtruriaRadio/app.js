(() => {
  "use strict";

  const data = window.ETRURIA_RADIO_DATA || { stations: [], soundtracks: [] };
  const stations = data.stations || [];
  const tracks = (data.soundtracks || []).map((track, index) => {
    const artist = track.character || track.artist || "Etruria Radio";
    const challenge = String(track.challengeText ?? track.challenge ?? "")
      .replace(/\{(?:character|name)\}/gi, artist);

    return {
      ...track,
      index,
      title: track.songTitle || track.title || `Canción ${index + 1}`,
      artist,
      challenge,
      cover: track.songCover || track.cover || "",
      description: track.songDescription || track.description || track.lore || "",
      station: track.station || "battle"
    };
  });

  const $ = (id) => document.getElementById(id);
  const sharedShell = (() => {
    try { return window.parent !== window ? (window.parent.GlobalAudioShell || window.parent.ResonanceShell || null) : null; }
    catch (error) { return null; }
  })();
  const localAudio = $("radioAudio");
  const audio = sharedShell?.audio || localAudio;
  let sharedState = sharedShell?.getState() || null;
  const nodes = {
    clock: $("clock"), day: $("dayLabel"), stationLine: $("stationLine"), title: $("trackTitle"),
    artist: $("trackArtist"), message: $("broadcastMessage"), status: $("radioStatus"), live: $("liveLabel"),
    challenge: $("challengeBanner"), challengeText: $("challengeText"),
    avatar: $("stationAvatar"), cover: $("stationCover"), initial: $("stationInitial"), pulse: $("playingPulse"),
    pointer: $("dialPointer"), frequency: $("dialFrequency"), dialPlay: $("dialPlay"), dialPlayIcon: $("dialPlayIcon"),
    play: $("playButton"), previous: $("previousButton"), next: $("nextButton"), progress: $("progressInput"),
    current: $("currentTime"), duration: $("duration"), progressLabel: $("progressLabel"), volume: $("volumeInput"),
    shuffle: $("shuffleButton"), count: $("trackCount"), list: $("trackList"), empty: $("emptyLibrary"),
    coverDialog: $("coverDialog"), coverArt: $("coverDialogArt"), largeCover: $("largeCover"),
    coverTitle: $("coverDialogTitle"), coverArtist: $("coverDialogArtist"), coverLore: $("coverDialogLore"),
    closeCover: $("closeCoverDialog"), openArchive: $("openSongArchive")
  };
  let coverLastFocus = null;

  const savedStation = localStorage.getItem("etruriaRadioStation");
  const savedTrack = Number(localStorage.getItem("etruriaRadioTrack"));
  const savedVolume = Number(localStorage.getItem("etruriaRadioVolume"));
  const state = {
    station: stations.some((item) => item.id === savedStation) ? savedStation : (stations[0]?.id || "battle"),
    current: Number.isInteger(savedTrack) && tracks[savedTrack] ? savedTrack : -1,
    shuffle: localStorage.getItem("etruriaRadioShuffle") === "true",
    volume: sharedShell ? sharedState.volume : (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1 ? savedVolume : .68),
    error: ""
  };

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  }

  function currentStation() {
    return stations.find((item) => item.id === state.station) || stations[0] || {
      id: "battle", short: "BATALLA", name: "Etruria Radio", frequency: "--.-", host: "", show: "Sin señal", description: "", color: "#e3a83a", angle: -135
    };
  }

  function stationTracks() {
    return tracks.filter((track) => track.station === state.station);
  }

  function currentTrack() {
    return tracks[state.current] || null;
  }

  function sourceId(stationId = state.station) {
    return `etruria:${stationId}`;
  }

  function radioIsPlaying(stationId = state.station) {
    if (!sharedShell) return !audio.paused && Boolean(audio.src);
    return sharedState?.sourceId === sourceId(stationId) && sharedState.playing;
  }

  function sourceDefinition(station, pool) {
    return {
      id: sourceId(station.id),
      label: `ETRURIA RADIO · ${station.frequency} FM`,
      queueLabel: `Cola de ${station.name}`,
      route: "Pokemon/EtruriaRadio/index.html",
      album: station.name,
      tracks: pool.map((track) => ({
        sourceTrackId: track.index,
        songTitle: track.title,
        character: track.artist,
        challengeText: track.challenge,
        songCover: track.cover ? new URL(track.cover, location.href).href : "",
        audio: new URL(track.audio, location.href).href
      }))
    };
  }

  function updateClock() {
    const now = new Date();
    nodes.clock.textContent = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    nodes.day.textContent = now.toLocaleDateString("es-ES", { weekday: "long" }).toUpperCase();
  }

  function setStation(id, chooseFirst = true) {
    if (!stations.some((station) => station.id === id)) return;
    const wasPlaying = !audio.paused && Boolean(audio.src);
    state.station = id;
    state.error = "";
    localStorage.setItem("etruriaRadioStation", id);
    const pool = stationTracks();
    if (chooseFirst && !pool.some((track) => track.index === state.current)) {
      if (pool.length) setTrack(pool[0].index, wasPlaying);
      else {
        if (!sharedShell) {
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
        }
        state.current = -1;
        localStorage.removeItem("etruriaRadioTrack");
      }
    }
    render();
  }

  function setTrack(index, autoplay = true) {
    const track = tracks[index];
    if (!track) return;
    state.current = index;
    state.station = track.station;
    state.error = "";
    localStorage.setItem("etruriaRadioTrack", String(index));
    localStorage.setItem("etruriaRadioStation", state.station);
    if (sharedShell) {
      const station = currentStation();
      const pool = stationTracks();
      const position = pool.findIndex((item) => item.index === index);
      sharedShell.setSource(sourceDefinition(station, pool), Math.max(0, position), autoplay);
      render();
      return;
    }
    const target = new URL(track.audio, location.href).href;
    if (audio.src !== target) {
      audio.src = track.audio;
      audio.load();
    }
    updateMediaSession(track);
    render();
    if (autoplay) play();
  }

  async function play() {
    let track = currentTrack();
    if (!track || track.station !== state.station) {
      track = stationTracks()[0] || null;
      if (!track) {
        state.error = "Esta emisora todavía no tiene canciones.";
        render();
        return;
      }
      setTrack(track.index, false);
    }
    if (sharedShell) {
      if (sharedState?.sourceId !== sourceId(track.station) || sharedState?.sourceTrackId !== track.index) setTrack(track.index, false);
      try {
        await sharedShell.play();
        state.error = "";
      } catch (error) {
        state.error = "No se pudo iniciar la emisión.";
        render();
      }
      return;
    }
    if (!audio.src) audio.src = track.audio;
    try {
      await audio.play();
      state.error = "";
    } catch (error) {
      state.error = "No se pudo reproducir el archivo. Comprueba la ruta escrita en data.js.";
      render();
    }
  }

  function togglePlay() {
    radioIsPlaying() ? (sharedShell ? sharedShell.pause() : audio.pause()) : play();
  }

  function changeTrack(direction) {
    const pool = stationTracks();
    if (!pool.length) return;
    let position = pool.findIndex((track) => track.index === state.current);
    if (state.shuffle && pool.length > 1) {
      let nextPosition;
      do nextPosition = Math.floor(Math.random() * pool.length); while (nextPosition === position);
      position = nextPosition;
    } else {
      position = (position + direction + pool.length) % pool.length;
    }
    setTrack(pool[position].index, true);
  }

  function updateMediaSession(track) {
    if (sharedShell) return;
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: currentStation().name,
      artwork: track.cover ? [{ src: new URL(track.cover, location.href).href }] : []
    });
  }

  function openCover(track) {
    if (!track) return;
    coverLastFocus = document.activeElement;
    if (track.cover) {
      nodes.largeCover.src = track.cover;
      nodes.largeCover.alt = `Portada ampliada de ${track.title}`;
      nodes.largeCover.hidden = false;
      nodes.coverArt.classList.remove("empty");
    } else {
      nodes.largeCover.removeAttribute("src");
      nodes.largeCover.alt = "";
      nodes.largeCover.hidden = true;
      nodes.coverArt.classList.add("empty");
    }
    nodes.coverTitle.textContent = track.title;
    nodes.coverArtist.textContent = track.artist;
    nodes.coverLore.textContent = track.lore || "Esta canción todavía no tiene lore registrado.";
    if (!nodes.coverDialog.open) nodes.coverDialog.showModal();
    nodes.closeCover.focus();
  }

  function closeCover() {
    if (nodes.coverDialog.open) nodes.coverDialog.close();
    coverLastFocus?.focus();
  }

  function renderLibrary() {
    const pool = stationTracks();
    nodes.count.textContent = `${pool.length} ${pool.length === 1 ? "CANCIÓN" : "CANCIONES"}`;
    nodes.empty.hidden = pool.length > 0;
    nodes.list.hidden = pool.length === 0;
    nodes.list.innerHTML = pool.map((track, position) => `
      <button class="track-card ${track.index === state.current ? "active" : ""}" type="button" data-track="${track.index}">
        <span class="track-number">${String(position + 1).padStart(2, "0")}</span>
        <span class="track-cover" ${track.cover ? `data-cover="${track.index}" title="Ver portada en grande"` : ""}>${track.cover ? `<img src="${escapeHTML(track.cover)}" alt="">` : "♪"}</span>
        <span class="track-copy"><strong>${escapeHTML(track.title)}</strong><span>${escapeHTML(track.artist)}</span></span>
        <span class="track-station">${escapeHTML(currentStation().frequency)} FM</span>
        <b class="track-action">${track.index === state.current && radioIsPlaying(track.station) ? "Ⅱ" : "▶"}</b>
      </button>
    `).join("");
    nodes.list.querySelectorAll("[data-track]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const index = Number(button.dataset.track);
        if (event.target.closest("[data-cover]")) {
          event.stopPropagation();
          openCover(tracks[index]);
          return;
        }
        if (index === state.current && radioIsPlaying()) sharedShell ? sharedShell.pause() : audio.pause();
        else setTrack(index, true);
      });
    });
  }

  function render() {
    const station = currentStation();
    const track = currentTrack();
    const trackIsTuned = track && track.station === station.id;
    const playing = trackIsTuned && radioIsPlaying(station.id);

    document.documentElement.style.setProperty("--active-station", station.color);
    nodes.avatar.style.setProperty("--station-color", station.color);
    nodes.stationLine.textContent = `${station.name} · ${station.frequency} FM`;
    nodes.title.textContent = trackIsTuned ? track.title : station.show;
    nodes.artist.textContent = trackIsTuned ? track.artist : `CON ${station.host}`;
    const showChallenge = Boolean(playing && track?.challenge);
    nodes.challenge.hidden = !showChallenge;
    nodes.challengeText.textContent = showChallenge ? track.challenge : "";
    nodes.openArchive.hidden = !(trackIsTuned && track?.lore);
    nodes.message.textContent = state.error || (trackIsTuned ? (track.description || station.description) : station.description);
    nodes.status.textContent = state.error ? "REVISAR ARCHIVO" : playing ? `RECIBIENDO · ${station.frequency} FM` : trackIsTuned ? "EMISIÓN EN PAUSA" : "EMISORA SINTONIZADA";
    nodes.live.textContent = playing ? "AL AIRE" : "PAUSA";
    nodes.frequency.textContent = station.frequency;
    nodes.pointer.style.transform = `rotate(${station.angle}deg)`;
    nodes.play.textContent = playing ? "Ⅱ" : "▶";
    nodes.dialPlayIcon.textContent = playing ? "Ⅱ" : "▶";
    nodes.play.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
    nodes.dialPlay.setAttribute("aria-label", playing ? "Pausar emisión" : "Reproducir emisión");
    nodes.pulse.classList.toggle("active", playing);
    nodes.progressLabel.textContent = trackIsTuned ? track.title : "SIN EMISIÓN";
    nodes.shuffle.classList.toggle("active", state.shuffle);
    nodes.shuffle.setAttribute("aria-pressed", String(state.shuffle));

    if (trackIsTuned && track.cover) {
      nodes.cover.src = track.cover;
      nodes.cover.alt = `Portada de ${track.title}`;
      nodes.cover.hidden = false;
      nodes.initial.hidden = true;
      nodes.avatar.disabled = false;
      nodes.avatar.setAttribute("aria-label", `Ver portada ampliada de ${track.title}`);
    } else {
      nodes.cover.hidden = true;
      nodes.initial.hidden = false;
      nodes.initial.textContent = station.short.slice(0, 1);
      nodes.avatar.disabled = true;
      nodes.avatar.setAttribute("aria-label", "No hay portada disponible");
    }

    document.querySelectorAll("[data-station]").forEach((button) => {
      button.classList.toggle("active", button.dataset.station === state.station);
    });
    renderLibrary();
  }

  document.querySelectorAll("[data-station]").forEach((button) => button.addEventListener("click", () => setStation(button.dataset.station)));
  nodes.play.addEventListener("click", togglePlay);
  nodes.dialPlay.addEventListener("click", togglePlay);
  nodes.previous.addEventListener("click", () => changeTrack(-1));
  nodes.next.addEventListener("click", () => changeTrack(1));
  nodes.shuffle.addEventListener("click", () => {
    state.shuffle = !state.shuffle;
    localStorage.setItem("etruriaRadioShuffle", String(state.shuffle));
    if (sharedShell) sharedShell.setShuffle(state.shuffle);
    render();
  });
  nodes.avatar.addEventListener("click", () => openCover(currentTrack()));
  nodes.openArchive.addEventListener("click", () => openCover(currentTrack()));
  nodes.closeCover.addEventListener("click", closeCover);
  nodes.coverDialog.addEventListener("click", (event) => { if (event.target === nodes.coverDialog) closeCover(); });
  nodes.coverDialog.addEventListener("cancel", (event) => { event.preventDefault(); closeCover(); });
  nodes.progress.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = audio.duration * Number(nodes.progress.value) / 100;
  });
  nodes.volume.value = String(state.volume);
  if (!sharedShell) audio.volume = state.volume;
  nodes.volume.addEventListener("input", () => {
    if (sharedShell) sharedShell.setVolume(nodes.volume.value);
    else audio.volume = Number(nodes.volume.value);
    localStorage.setItem("etruriaRadioVolume", String(audio.volume));
  });
  audio.addEventListener("play", render);
  audio.addEventListener("pause", render);
  if (!sharedShell) audio.addEventListener("ended", () => changeTrack(1));
  audio.addEventListener("volumechange", () => {
    state.volume = audio.volume;
    nodes.volume.value = String(audio.volume);
  });
  audio.addEventListener("loadedmetadata", () => {
    nodes.duration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    nodes.current.textContent = formatTime(audio.currentTime);
    nodes.duration.textContent = formatTime(audio.duration);
    nodes.progress.value = String(percent);
    nodes.progress.style.setProperty("--fill", `${percent}%`);
  });
  audio.addEventListener("error", () => {
    if (sharedShell && !String(sharedState?.sourceId || "").startsWith("etruria:")) return;
    if (!audio.getAttribute("src")) return;
    state.error = "No se encuentra el audio. Comprueba el nombre y la ruta en data.js.";
    render();
  });

  if (!sharedShell && "mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => changeTrack(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => changeTrack(1));
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
  if (!sharedShell && state.current >= 0 && tracks[state.current]) {
    state.station = tracks[state.current].station;
    audio.src = tracks[state.current].audio;
    updateMediaSession(tracks[state.current]);
  }
  if (sharedShell) sharedShell.subscribe((snapshot) => {
    sharedState = snapshot;
    state.shuffle = snapshot.shuffle;
    state.volume = snapshot.volume;
    if (String(snapshot.sourceId || "").startsWith("etruria:")) {
      const selected = tracks.find((track) => track.index === snapshot.sourceTrackId);
      if (selected) {
        state.current = selected.index;
        state.station = selected.station;
        localStorage.setItem("etruriaRadioTrack", String(selected.index));
        localStorage.setItem("etruriaRadioStation", selected.station);
      }
    }
    render();
  });
  render();
})();
