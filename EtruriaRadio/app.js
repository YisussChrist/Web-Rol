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
      station: track.station || "route"
    };
  });

  const $ = (id) => document.getElementById(id);
  const audio = $("radioAudio");
  const nodes = {
    clock: $("clock"), day: $("dayLabel"), stationLine: $("stationLine"), title: $("trackTitle"),
    artist: $("trackArtist"), message: $("broadcastMessage"), status: $("radioStatus"), live: $("liveLabel"),
    avatar: $("stationAvatar"), cover: $("stationCover"), initial: $("stationInitial"), pulse: $("playingPulse"),
    pointer: $("dialPointer"), frequency: $("dialFrequency"), dialPlay: $("dialPlay"), dialPlayIcon: $("dialPlayIcon"),
    play: $("playButton"), previous: $("previousButton"), next: $("nextButton"), progress: $("progressInput"),
    current: $("currentTime"), duration: $("duration"), progressLabel: $("progressLabel"), volume: $("volumeInput"),
    shuffle: $("shuffleButton"), count: $("trackCount"), list: $("trackList"), empty: $("emptyLibrary")
  };

  const savedStation = localStorage.getItem("etruriaRadioStation");
  const savedTrack = Number(localStorage.getItem("etruriaRadioTrack"));
  const savedVolume = Number(localStorage.getItem("etruriaRadioVolume"));
  const state = {
    station: stations.some((item) => item.id === savedStation) ? savedStation : (stations[0]?.id || "route"),
    current: Number.isInteger(savedTrack) && tracks[savedTrack] ? savedTrack : -1,
    shuffle: localStorage.getItem("etruriaRadioShuffle") === "true",
    volume: Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1 ? savedVolume : .68,
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
      id: "route", short: "RUTA", name: "Etruria Radio", frequency: "--.-", host: "", show: "Sin señal", description: "", color: "#e3a83a", angle: -135
    };
  }

  function stationTracks() {
    return tracks.filter((track) => track.station === state.station);
  }

  function currentTrack() {
    return tracks[state.current] || null;
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
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
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
    audio.paused ? play() : audio.pause();
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
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: currentStation().name,
      artwork: track.cover ? [{ src: new URL(track.cover, location.href).href }] : []
    });
  }

  function renderLibrary() {
    const pool = stationTracks();
    nodes.count.textContent = `${pool.length} ${pool.length === 1 ? "CANCIÓN" : "CANCIONES"}`;
    nodes.empty.hidden = pool.length > 0;
    nodes.list.hidden = pool.length === 0;
    nodes.list.innerHTML = pool.map((track, position) => `
      <button class="track-card ${track.index === state.current ? "active" : ""}" type="button" data-track="${track.index}">
        <span class="track-number">${String(position + 1).padStart(2, "0")}</span>
        <span class="track-cover">${track.cover ? `<img src="${escapeHTML(track.cover)}" alt="">` : "♪"}</span>
        <span class="track-copy"><strong>${escapeHTML(track.title)}</strong><span>${escapeHTML(track.artist)}</span></span>
        <span class="track-station">${escapeHTML(currentStation().frequency)} FM</span>
        <b class="track-action">${track.index === state.current && !audio.paused ? "Ⅱ" : "▶"}</b>
      </button>
    `).join("");
    nodes.list.querySelectorAll("[data-track]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.track);
        if (index === state.current && !audio.paused) audio.pause();
        else setTrack(index, true);
      });
    });
  }

  function render() {
    const station = currentStation();
    const track = currentTrack();
    const trackIsTuned = track && track.station === station.id;
    const playing = trackIsTuned && !audio.paused;

    document.documentElement.style.setProperty("--active-station", station.color);
    nodes.avatar.style.setProperty("--station-color", station.color);
    nodes.stationLine.textContent = `${station.name} · ${station.frequency} FM`;
    nodes.title.textContent = trackIsTuned ? track.title : station.show;
    nodes.artist.textContent = trackIsTuned ? (track.challenge || track.artist) : `CON ${station.host}`;
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
    } else {
      nodes.cover.hidden = true;
      nodes.initial.hidden = false;
      nodes.initial.textContent = station.short.slice(0, 1);
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
    render();
  });
  nodes.progress.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = audio.duration * Number(nodes.progress.value) / 100;
  });
  nodes.volume.value = String(state.volume);
  audio.volume = state.volume;
  nodes.volume.addEventListener("input", () => {
    audio.volume = Number(nodes.volume.value);
    localStorage.setItem("etruriaRadioVolume", String(audio.volume));
  });
  audio.addEventListener("play", render);
  audio.addEventListener("pause", render);
  audio.addEventListener("ended", () => changeTrack(1));
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
    if (!audio.getAttribute("src")) return;
    state.error = "No se encuentra el audio. Comprueba el nombre y la ruta en data.js.";
    render();
  });

  if ("mediaSession" in navigator) {
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
  if (state.current >= 0 && tracks[state.current]) {
    state.station = tracks[state.current].station;
    audio.src = tracks[state.current].audio;
    updateMediaSession(tracks[state.current]);
  }
  render();
})();
