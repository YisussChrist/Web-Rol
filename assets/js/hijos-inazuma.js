    /*
      CÓMO EDITAR LA WEB:
      - familia: nombre de la familia o pareja.
      - madre / padre: cada uno tiene nombre y foto. Ejemplo: { nombre:"Rumi", foto:"img/rumi.webp" }.
      - si falta uno de los dos, pon padre: null o madre: null.
      - descripcion: texto general de esa familia.
      - hijos: lista de hijos.
      - genero: usa solo "M", "F" o "?". La web pone ♂️, ♀️ o ? automáticamente.
      - foto del hijo: ruta de imagen. Ejemplo: "img/EllenKaido.webp".
      - descripcion del hijo: texto libre para lore, personalidad o notas.
    */
const FAMILIAS = window.RP_INAZUMA_FAMILIES || [];
const $ = (id) => document.getElementById(id);
    const searchInput = $("searchInput");
    const genderFilter = $("genderFilter");
    const statusFilter = $("statusFilter");
    const seriesFilter = $("seriesFilter");
    const familiesContainer = $("familiesContainer");
    const indexList = $("indexList");
    const stats = $("stats");
    const childModal = $("childModal");
    const modalContent = $("modalContent");
    const themeToggle = $("themeToggle");
    const updatesBtn = $("updatesBtn");
    const updatesDialog = $("updatesDialog");
    const updatesContent = $("updatesContent");
    const familyIndex = $("familyIndex");
    const familyIndexToggle = $("familyIndexToggle");
    const familyIndexClose = $("familyIndexClose");
    const familyIndexScrim = $("familyIndexScrim");
    const scrollTopBtn = $("scrollTopBtn");

    const ACTUALIZACIONES = [
      {
        fecha: "04-05-2026",
        cambios: [
          "Añadido botón de modo oscuro con guardado automático.",
          "Añadido panel de actualizaciones para enseñar las novedades a quienes entren.",
          "Preparada la estructura para editar futuras novedades desde el array ACTUALIZACIONES.",
          "Rediseño visual estilo Inazuma Eleven.",
          "Índice alfabético lateral, filtros y fichas de hijos.",
          "Soporte para fotos separadas de madre y padre.",
          "Añadidas la familia de Natsu y Flora así como Yoruichi en la familia de James y Abigail."
        ]
      },
      {
        fecha: "05-05-2026",
        cambios: [
          "Añadida como 2a hija 'Rio Tsukatsuki' como 'Rio Momota' a los hijos de Kaito y Maki.",
          "Actualizadas algunas faltas de ortografía.",
        ]
      },
    ];

    const PLACEHOLDER_FAMILY = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='#22a7ff'/><stop offset='1' stop-color='#ff9f1c'/></linearGradient></defs><rect width='300' height='300' rx='60' fill='url(#g)'/><circle cx='105' cy='118' r='42' fill='white' opacity='.88'/><circle cx='194' cy='118' r='42' fill='white' opacity='.72'/><path d='M55 238c18-54 78-72 112-38 30-32 86-20 105 38' fill='white' opacity='.86'/><text x='150' y='275' text-anchor='middle' font-size='28' font-family='Arial' font-weight='900' fill='#07142d'>FAMILY</text></svg>`);
    const PLACEHOLDER_CHILD = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 280'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#dbeafe'/><stop offset='1' stop-color='#fff3dc'/></linearGradient></defs><rect width='220' height='280' rx='42' fill='url(#g)'/><circle cx='110' cy='92' r='48' fill='#ffffff'/><path d='M39 242c10-61 132-61 142 0' fill='#ffffff'/><path d='M68 35l24 30-38 5 50 68' fill='none' stroke='#ff9f1c' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/></svg>`);

    function normalize(text) {
      return String(text || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    }

    function slugify(text) {
      return normalize(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    function genderIcon(gender) {
      if (gender === "F") return "♀️";
      if (gender === "M") return "♂️";
      return "?";
    }

    function genderLabel(gender) {
      if (gender === "F") return "Chica";
      if (gender === "M") return "Chico";
      return "Indefinido";
    }

    function getSeries(ref) {
      const parts = String(ref || "").split(" - ");
      return parts.length > 1 ? parts.slice(1).join(" - ").trim() : "Sin serie";
    }

    function familyMatches(family) {
      const query = normalize(searchInput.value.trim());
      const gender = genderFilter.value;
      const status = statusFilter.value;
      const series = seriesFilter.value;

      const hijos = family.hijos.filter(child => {
        const childSeries = getSeries(child.referencia);
        const text = normalize(`${family.familia} ${family.descripcion} ${child.nombre} ${child.referencia} ${child.descripcion} ${childSeries}`);
        const queryOk = !query || text.includes(query);
        const genderOk = gender === "all" || child.genero === gender;
        const statusOk = status === "all" || child.estado === status;
        const seriesOk = series === "all" || childSeries === series;
        return queryOk && genderOk && statusOk && seriesOk;
      });

      return { ...family, hijos };
    }

    function getFilteredFamilies() {
      return FAMILIAS
        .map(familyMatches)
        .filter(family => family.hijos.length > 0)
        .sort((a,b) => a.familia.localeCompare(b.familia, "es", { sensitivity:"base" }));
    }

    function populateSeries() {
      const series = [...new Set(FAMILIAS.flatMap(f => f.hijos.map(h => getSeries(h.referencia))))]
        .filter(Boolean)
        .sort((a,b) => a.localeCompare(b, "es", { sensitivity:"base" }));
      seriesFilter.innerHTML = `<option value="all">Todas las series</option>` + series.map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("");
    }

    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
    }

    function renderStats(families) {
      const allChildren = families.flatMap(f => f.hijos);
      const girls = allChildren.filter(h => h.genero === "F").length;
      const boys = allChildren.filter(h => h.genero === "M").length;
      stats.innerHTML = `
        <div class="stat"><strong>${families.length}</strong><span>familias visibles</span></div>
        <div class="stat"><strong>${allChildren.length}</strong><span>hijos visibles</span></div>
        <div class="stat"><strong>${girls}</strong><span>chicas</span></div>
        <div class="stat"><strong>${boys}</strong><span>chicos</span></div>
      `;
    }

    function renderIndex(families) {
      indexList.innerHTML = families.map(f => `
        <a class="index-link" href="#${slugify(f.familia)}">
          <span>${escapeHTML(f.familia)}</span>
          <small>${f.hijos.length}</small>
        </a>
      `).join("");
    }

    function parentCardHTML(parent, role, side) {
      if (!parent) {
        return `<div class="parent-card ${side} empty"><span>Sin ${role.toLowerCase()}</span></div>`;
      }
      return `
        <div class="parent-card ${side}">
          ${side === "mother" ? `
            <div class="parent-text"><span class="role">${role}</span><strong>${escapeHTML(parent.nombre || "Sin nombre")}</strong></div>
            <img src="${escapeHTML(parent.foto || PLACEHOLDER_FAMILY)}" alt="${escapeHTML(parent.nombre || role)}" loading="lazy">
          ` : `
            <img src="${escapeHTML(parent.foto || PLACEHOLDER_FAMILY)}" alt="${escapeHTML(parent.nombre || role)}" loading="lazy">
            <div class="parent-text"><span class="role">${role}</span><strong>${escapeHTML(parent.nombre || "Sin nombre")}</strong></div>
          `}
        </div>
      `;
    }

    function parentsLineupHTML(family) {
      return `
        <div class="parents-lineup" aria-label="Padres de ${escapeHTML(family.familia)}">
          ${parentCardHTML(family.madre, "Madre", "mother")}
          <div class="lineup-vs">×</div>
          ${parentCardHTML(family.padre, "Padre", "father")}
        </div>
      `;
    }

    let mostrarRen = false;

function renderFamilies() {
  let families;

  if (mostrarRen) {
    families = FAMILIAS.filter(
      f => f.familia === "Ren y Jeanne"
    );
  } else {
    families = getFilteredFamilies().filter(
      f => f.familia !== "Ren y Jeanne"
    );
  }

  renderStats(families);
  renderIndex(families);

  if (!families.length) {
    familiesContainer.innerHTML = `<div class="empty">No hay resultados con esos filtros.</div>`;
    return;
  }

      renderStats(families);
      renderIndex(families);

      if (!families.length) {
        familiesContainer.innerHTML = `<div class="empty">No hay resultados con esos filtros.</div>`;
        return;
      }

      familiesContainer.innerHTML = families.map(family => `
        <section class="family-card" id="${slugify(family.familia)}">
          <div class="family-header">
            ${parentsLineupHTML(family)}
            <div class="family-title">
              <h2>${escapeHTML(family.familia)}</h2>
              <p>${escapeHTML(family.descripcion || "Familia registrada en el árbol. Puedes añadir aquí una descripción general desde el bloque FAMILIAS.")}</p>
            </div>
            <div class="family-count"><span>${family.hijos.length}<small>hijos</small></span></div>
          </div>
          <div class="children-grid">
            ${family.hijos.map(child => childCardHTML(child, family)).join("")}
          </div>
        </section>
      `).join("");
    }

    function childCardHTML(child, family) {
      const series = getSeries(child.referencia);
      const key = `${family.familia}::${child.nombre}`;
      return `
        <article class="child-card ${child.nacido ? "is-born" : ""}">
          ${child.nacido ? `<span class="badge-nacido">NACIDO</span>` : ""}
          <img class="avatar" src="${escapeHTML(child.foto || PLACEHOLDER_CHILD)}" alt="${escapeHTML(child.nombre)}" loading="lazy">
          <div class="child-info">
            <div class="child-top">
              ${child.numero ? `<span class="badge">#${escapeHTML(child.numero)}</span>` : ""}
              <span class="badge gender-${escapeHTML(child.genero)}">${genderIcon(child.genero)} ${genderLabel(child.genero)}</span>
              <span class="badge status-${escapeHTML(child.estado)}">${escapeHTML(child.estado)}</span>
            </div>
            <h3>${escapeHTML(child.nombre)}</h3>
            <p class="ref">${escapeHTML(child.referencia || "Sin referencia")}</p>
            <p class="desc">${escapeHTML(child.descripcion || `Serie: ${series}`)}</p>
            <button class="mini-action" onclick="openChild('${escapeHTML(key)}')">Ver ficha</button>
          </div>
        </article>
      `;
    }

    function openChild(key) {
      const [familyName, childName] = key.split("::");
      const family = FAMILIAS.find(f => f.familia === familyName);
      const child = family?.hijos.find(h => h.nombre === childName);
      if (!family || !child) return;
      modalContent.innerHTML = `
        <div class="modal-head">
          <img src="${escapeHTML(child.foto || PLACEHOLDER_CHILD)}" alt="${escapeHTML(child.nombre)}">
          <div>
            <div class="eyebrow" style="color:#1167d8">${escapeHTML(family.familia)}</div>
            <h2 style="margin:8px 0 8px; font-size:34px; line-height:1">${genderIcon(child.genero)} ${escapeHTML(child.nombre)}</h2>
            <p style="margin:0; color:#5b6b82">${escapeHTML(child.referencia || "Sin referencia")}</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:14px">
              <span class="badge gender-${escapeHTML(child.genero)}">${genderLabel(child.genero)}</span>
              <span class="badge status-${escapeHTML(child.estado)}">Estado ${escapeHTML(child.estado)}</span>
              ${child.numero ? `<span class="badge">Hijo #${escapeHTML(child.numero)}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="modal-body">
          <h3>Descripción</h3>
          <p>${escapeHTML(child.descripcion || "Todavía no tiene descripción. Añádela en el campo descripcion del hijo dentro de FAMILIAS.")}</p>
        </div>
      `;
      childModal.showModal();
    }

    window.openChild = openChild;


    function renderUpdates() {
      updatesContent.innerHTML = ACTUALIZACIONES.map(update => `
        <article class="update-item">
          <div class="update-date">📅 ${escapeHTML(update.fecha)}</div>
          <ul>${update.cambios.map(cambio => `<li>${escapeHTML(cambio)}</li>`).join("")}</ul>
        </article>
      `).join("");
    }

    function applyTheme(theme) {
      const dark = theme === "dark";
      document.body.classList.toggle("dark-mode", dark);
      themeToggle.textContent = dark ? "☀️ Modo claro" : "🌙 Modo oscuro";
      themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
      localStorage.setItem("familyTreeTheme", theme);
    }

    function toggleTheme() {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      applyTheme(nextTheme);
    }

    function resetFilters() {
      searchInput.value = "";
      genderFilter.value = "all";
      statusFilter.value = "all";
      seriesFilter.value = "all";
      renderFamilies();
    }

    function setIndexOpen(open) {
      familyIndex.classList.toggle("open", open);
      document.body.classList.toggle("index-open", open);
      familyIndexToggle.setAttribute("aria-expanded", String(open));
      if (open) familyIndexClose.focus();
    }

    [searchInput, genderFilter, statusFilter, seriesFilter].forEach(el => el.addEventListener("input", renderFamilies));
    $("resetBtn").addEventListener("click", resetFilters);
    themeToggle.addEventListener("click", toggleTheme);
    updatesBtn.addEventListener("click", () => updatesDialog.showModal());
    familyIndexToggle.addEventListener("click", () => setIndexOpen(true));
    familyIndexClose.addEventListener("click", () => setIndexOpen(false));
    familyIndexScrim.addEventListener("click", () => setIndexOpen(false));
    indexList.addEventListener("click", event => {
      if (event.target.closest(".index-link") && matchMedia("(max-width: 980px)").matches) setIndexOpen(false);
    });
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));
    window.addEventListener("scroll", () => scrollTopBtn.classList.toggle("show", window.scrollY > 700), { passive:true });
    document.addEventListener("keydown", e => {
      if (e.key === "/" && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
      if (e.key === "Escape" && childModal.open) childModal.close();
      if (e.key === "Escape" && updatesDialog.open) updatesDialog.close();
      if (e.key === "Escape" && familyIndex.classList.contains("open")) setIndexOpen(false);
    });

    applyTheme(localStorage.getItem("familyTreeTheme") || "light");
    renderUpdates();
    populateSeries();
    renderFamilies();

    document.getElementById("secretRenBtn").addEventListener("click", () => {
      mostrarRen = !mostrarRen;
      renderFamilies();
    });
