    /*
      CÓMO AÑADIR SERIES:
      1. Copia uno de los bloques de ejemplo dentro de SERIES.
      2. Cambia title, poster, status, platform, genre, seasons, episodes, watchedEpisodes y ratings.
      3. Las portadas pueden ir en una carpeta tipo: img/series/nombre.jpg
      4. Si alguien no ha puesto nota aún, deja null. Ejemplo: ratings: { Y: 8, S: null, L: 7 }
    */
const BASE_SERIES = window.RP_SERIES || [];
const STORAGE_KEYS = {
      theme: "rpHubSeriesTheme",
      favorites: "rpHubSeriesFavorites",
      edits: "rpHubSeriesEditsV1"
    };
    let seriesEdits = readStored(STORAGE_KEYS.edits, {});
    let SERIES = mergeSeriesEdits();

    const els = {
      body: document.body,
      themeBtn: document.getElementById("themeBtn"),
      searchInput: document.getElementById("searchInput"),
      statusFilter: document.getElementById("statusFilter"),
      genreFilter: document.getElementById("genreFilter"),
      sortSelect: document.getElementById("sortSelect"),
      platformChips: document.getElementById("platformChips"),
      seriesGrid: document.getElementById("seriesGrid"),
      emptyState: document.getElementById("emptyState"),
      totalSeries: document.getElementById("totalSeries"),
      avgScore: document.getElementById("avgScore"),
      watchingCount: document.getElementById("watchingCount"),
      modal: document.getElementById("seriesModal"),
      modalContent: document.getElementById("modalContent"),
      closeModal: document.getElementById("closeModal")
    };

    let activePlatform = "all";
    let favoriteOverrides = readStored(STORAGE_KEYS.favorites, {});

    function slugify(text) {
      return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    function readStored(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    }

    function mergeSeriesEdits() {
      return BASE_SERIES.map(series => {
        const edit = seriesEdits[slugify(series.title)] || {};
        return { ...series, ...edit, ratings:{ ...(series.ratings || {}), ...(edit.ratings || {}) } };
      });
    }

    function refreshSeries() {
      SERIES = mergeSeriesEdits();
      renderStats();
      renderFilters();
      renderSeries();
    }

    function numberOrNull(value) {
      if (value === "") return null;
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    }

    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
    }

    function getFavorite(series) {
      const id = slugify(series.title);
      return favoriteOverrides[id] ?? Boolean(series.favorite);
    }

    function saveFavorite(series, value) {
      favoriteOverrides[slugify(series.title)] = value;
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteOverrides));
    }

    function averageRating(series) {
      const values = Object.values(series.ratings || {}).filter(value => typeof value === "number");
      if (!values.length) return null;
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    function progressPercent(series) {
      if (!series.episodes) return 0;
      return Math.min(100, Math.round((series.watchedEpisodes / series.episodes) * 100));
    }

    function statusClass(status) {
      return {
        "Completa": "completed",
        "Viendo": "watching",
        "Pausada": "paused",
        "Pendiente": "pending",
        "Abandonada": "dropped"
      }[status] || "pending";
    }

    function ratingHTML(label, value) {
      return `<div class="rating-box"><span>${label}</span><strong>${typeof value === "number" ? value.toFixed(value % 1 ? 1 : 0) : "—"}</strong></div>`;
    }

    function getFilteredSeries() {
      const query = els.searchInput.value.trim().toLowerCase();
      const status = els.statusFilter.value;
      const genre = els.genreFilter.value;
      const sort = els.sortSelect.value;

      let result = SERIES.filter(series => {
        const searchable = [
          series.title,
          series.status,
          series.platform,
          series.universe,
          series.year,
          ...(series.genre || [])
        ].join(" ").toLowerCase();

        const matchesQuery = !query || searchable.includes(query);
        const matchesStatus = status === "all" || series.status === status;
        const matchesGenre = genre === "all" || (series.genre || []).includes(genre);
        const matchesPlatform = activePlatform === "all" || series.platform === activePlatform;

        return matchesQuery && matchesStatus && matchesGenre && matchesPlatform;
      });

      result.sort((a, b) => {
        if (sort === "score") return (averageRating(b) ?? -1) - (averageRating(a) ?? -1);
        if (sort === "progress") return progressPercent(b) - progressPercent(a);
        if (sort === "recent") return (b.year || 0) - (a.year || 0);
        if (sort === "favorites") return Number(getFavorite(b)) - Number(getFavorite(a)) || a.title.localeCompare(b.title);
        return a.title.localeCompare(b.title);
      });

      return result;
    }

    function renderStats() {
      const rated = SERIES.map(averageRating).filter(value => typeof value === "number");
      const avg = rated.length ? rated.reduce((sum, value) => sum + value, 0) / rated.length : 0;
      els.totalSeries.textContent = SERIES.length;
      els.avgScore.textContent = avg.toFixed(1);
      els.watchingCount.textContent = SERIES.filter(series => series.status === "Viendo").length;
    }

    function renderFilters() {
      const genres = [...new Set(SERIES.flatMap(series => series.genre || []))].sort();
      els.genreFilter.innerHTML = `<option value="all">Todos los géneros</option>` + genres.map(genre => `<option value="${escapeHTML(genre)}">${escapeHTML(genre)}</option>`).join("");

      const platforms = ["all", ...new Set(SERIES.map(series => series.platform).filter(Boolean))];
      els.platformChips.innerHTML = platforms.map(platform => `
        <button class="chip ${platform === activePlatform ? "active" : ""}" type="button" data-platform="${escapeHTML(platform)}">
          ${platform === "all" ? "Todas las plataformas" : escapeHTML(platform)}
        </button>
      `).join("");
    }

    function renderSeries() {
      const filtered = getFilteredSeries();
      els.emptyState.style.display = filtered.length ? "none" : "block";

      els.seriesGrid.innerHTML = filtered.map(series => {
        const avg = averageRating(series);
        const progress = progressPercent(series);
        const favorite = getFavorite(series);
        const id = slugify(series.title);

        return `
          <article class="series-card">
            <div class="poster-wrap">
              ${series.poster ? `<img src="${escapeHTML(series.poster)}" alt="Portada de ${escapeHTML(series.title)}" onerror="this.parentElement.innerHTML='<div class=&quot;poster-fallback&quot;>🎥</div>'">` : `<div class="poster-fallback">🎥</div>`}
              <div class="poster-top">
                <span class="status ${statusClass(series.status)}">${escapeHTML(series.status)}</span>
                <button class="fav ${favorite ? "active" : ""}" type="button" data-fav="${id}" title="Marcar favorito">${favorite ? "★" : "☆"}</button>
              </div>
            </div>
            <div class="series-body">
              <h3>${escapeHTML(series.title)}</h3>
              <div class="meta">
                <span>${escapeHTML(series.year || "—")}</span>
                <span>•</span>
                <span>${escapeHTML(series.platform || "Sin plataforma")}</span>
                <span>•</span>
                <span>${escapeHTML(series.universe || "Serie")}</span>
              </div>
              <p class="desc">${escapeHTML(series.notes || "Sin notas todavía.")}</p>
              <div class="ratings">
                ${ratingHTML("Y", series.ratings?.Y)}
                ${ratingHTML("S", series.ratings?.S)}
                ${ratingHTML("L", series.ratings?.L)}
                <div class="rating-box avg"><span>MEDIA</span><strong>${avg === null ? "—" : avg.toFixed(1)}</strong></div>
              </div>
              <div class="progress-line">
                <div class="progress-info"><span>${series.watchedEpisodes || 0}/${series.episodes || 0} episodios</span><span>${progress}%</span></div>
                <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
              </div>
              <div class="card-actions">
                <button class="small-btn" type="button" data-open="${id}">Ver ficha</button>
              </div>
            </div>
          </article>
        `;
      }).join("");
    }

    function openModal(series) {
      const avg = averageRating(series);
      const progress = progressPercent(series);
      const id = slugify(series.title);
      const statusOptions = ["Pendiente", "Viendo", "Pausada", "Completa", "Abandonada"]
        .map(status => `<option value="${status}" ${series.status === status ? "selected" : ""}>${status}</option>`).join("");
      els.modalContent.innerHTML = `
        <div class="modal-poster">
          ${series.poster ? `<img src="${escapeHTML(series.poster)}" alt="Portada de ${escapeHTML(series.title)}" onerror="this.parentElement.innerHTML='<div class=&quot;poster-fallback&quot;>🎥</div>'">` : `<div class="poster-fallback">🎥</div>`}
        </div>
        <div class="modal-content">
          <span class="eyebrow">${escapeHTML(series.status)} · ${escapeHTML(series.platform || "Sin plataforma")}</span>
          <h2 id="modalTitle">${escapeHTML(series.title)}</h2>
          <p>${escapeHTML(series.notes || "Sin notas todavía.")}</p>
          <div class="ratings">
            ${ratingHTML("Y", series.ratings?.Y)}
            ${ratingHTML("S", series.ratings?.S)}
            ${ratingHTML("L", series.ratings?.L)}
            <div class="rating-box avg"><span>MEDIA</span><strong>${avg === null ? "—" : avg.toFixed(1)}</strong></div>
          </div>
          <div class="detail-list">
            <div class="detail-item"><span>Géneros</span><strong>${escapeHTML((series.genre || []).join(", ") || "—")}</strong></div>
            <div class="detail-item"><span>Año</span><strong>${escapeHTML(series.year || "—")}</strong></div>
            <div class="detail-item"><span>Temporadas</span><strong>${escapeHTML(series.seasons || "—")}</strong></div>
            <div class="detail-item"><span>Progreso</span><strong>${escapeHTML(series.watchedEpisodes || 0)}/${escapeHTML(series.episodes || 0)} episodios · ${progress}%</strong></div>
          </div>
          <form class="series-editor" id="seriesEditor">
            <div class="editor-heading"><div><span>EDICIÓN RÁPIDA</span><h3>Actualizar seguimiento</h3></div><small>Se guarda en este navegador</small></div>
            <div class="editor-grid">
              <label><span>Estado</span><select name="status">${statusOptions}</select></label>
              <label><span>Plataforma</span><input name="platform" value="${escapeHTML(series.platform || "")}" placeholder="Netflix, Crunchyroll..."></label>
              <label><span>Episodio visto</span><input name="watchedEpisodes" type="number" min="0" max="${Number(series.episodes || 0)}" value="${Number(series.watchedEpisodes || 0)}"></label>
              <label><span>Nota Y</span><input name="ratingY" type="number" min="0" max="10" step="0.1" value="${series.ratings?.Y ?? ""}"></label>
              <label><span>Nota S</span><input name="ratingS" type="number" min="0" max="10" step="0.1" value="${series.ratings?.S ?? ""}"></label>
              <label><span>Nota L</span><input name="ratingL" type="number" min="0" max="10" step="0.1" value="${series.ratings?.L ?? ""}"></label>
              <label class="editor-notes"><span>Comentario</span><textarea name="notes" rows="4">${escapeHTML(series.notes || "")}</textarea></label>
            </div>
            <div class="editor-actions"><button class="small-btn secondary" id="resetSeriesEdit" type="button">Restaurar datos</button><button class="small-btn" type="submit">Guardar cambios</button></div>
          </form>
        </div>
      `;
      const editor = document.getElementById("seriesEditor");
      editor.addEventListener("submit", event => {
        event.preventDefault();
        const values = new FormData(editor);
        seriesEdits[id] = {
          status: values.get("status"),
          platform: String(values.get("platform") || "").trim(),
          watchedEpisodes: Math.max(0, Math.min(Number(series.episodes || 0), Number(values.get("watchedEpisodes") || 0))),
          ratings: { Y:numberOrNull(values.get("ratingY")), S:numberOrNull(values.get("ratingS")), L:numberOrNull(values.get("ratingL")) },
          notes: String(values.get("notes") || "").trim()
        };
        localStorage.setItem(STORAGE_KEYS.edits, JSON.stringify(seriesEdits));
        refreshSeries();
        openModal(SERIES.find(item => slugify(item.title) === id));
      });
      document.getElementById("resetSeriesEdit").addEventListener("click", () => {
        delete seriesEdits[id];
        localStorage.setItem(STORAGE_KEYS.edits, JSON.stringify(seriesEdits));
        refreshSeries();
        openModal(SERIES.find(item => slugify(item.title) === id));
      });
      els.modal.classList.add("show");
      els.modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      els.modal.classList.remove("show");
      els.modal.setAttribute("aria-hidden", "true");
    }

    function applyTheme(theme) {
      els.body.classList.toggle("light", theme === "light");
      els.themeBtn.textContent = theme === "light" ? "🌙 Modo oscuro" : "☀️ Modo claro";
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    }

    function initEvents() {
      els.themeBtn.addEventListener("click", () => applyTheme(els.body.classList.contains("light") ? "dark" : "light"));
      [els.searchInput, els.statusFilter, els.genreFilter, els.sortSelect].forEach(el => el.addEventListener("input", renderSeries));

      els.platformChips.addEventListener("click", event => {
        const chip = event.target.closest("[data-platform]");
        if (!chip) return;
        activePlatform = chip.dataset.platform;
        renderFilters();
        renderSeries();
      });

      els.seriesGrid.addEventListener("click", event => {
        const favBtn = event.target.closest("[data-fav]");
        if (favBtn) {
          const series = SERIES.find(item => slugify(item.title) === favBtn.dataset.fav);
          saveFavorite(series, !getFavorite(series));
          renderSeries();
          return;
        }

        const openBtn = event.target.closest("[data-open]");
        if (openBtn) {
          const series = SERIES.find(item => slugify(item.title) === openBtn.dataset.open);
          if (series) openModal(series);
        }
      });

      els.closeModal.addEventListener("click", closeModal);
      els.modal.addEventListener("click", event => { if (event.target === els.modal) closeModal(); });
      document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
    }

    function init() {
      applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "dark");
      renderStats();
      renderFilters();
      renderSeries();
      initEvents();
    }

    init();
