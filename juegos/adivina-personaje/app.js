(() => {
  "use strict";

  const ROOT = "../../";
  const PAGE_SIZE = 60;
  const OPTION_LIMIT = 12;

  const CATEGORY_DEFS = [
    { key: "universe", label: "Universo", icon: "◎", description: "Inazuma, Dragon Ball, Pokémon u otros mundos", open: true },
    { key: "gender", label: "Género registrado", icon: "⚥", description: "Solo usa datos confirmados", open: true },
    { key: "source", label: "Centro de procedencia", icon: "▤", description: "Inazuma Center, Dragon Dex o Pokémon Center", open: true },
    { key: "origin", label: "Saga o procedencia", icon: "✦", description: "Anime, juego o universo concreto", searchable: true },
    { key: "status", label: "Estado", icon: "●", description: "Activo, registrado o sin clasificar" },
    { key: "role", label: "Rol o posición", icon: "⌖", description: "Delantero, defensa, guerrero, entrenador…" },
    { key: "team", label: "Equipo o afiliación", icon: "⚑", description: "Club, grupo o facción", searchable: true },
    { key: "element", label: "Elemento Inazuma", icon: "◇", description: "Fuego, Aire, Bosque, Montaña…" },
    { key: "race", label: "Raza", icon: "◉", description: "Raza registrada en Dragon Dex" },
    { key: "region", label: "Región Pokémon", icon: "⌁", description: "Etruria, Kalos, Paldea…" },
    { key: "pokemonType", label: "Tipos de su equipo Pokémon", icon: "◒", description: "Tipos presentes entre sus Pokémon" },
    { key: "location", label: "Localización", icon: "⌂", description: "Ciudad o zona actual", searchable: true },
    { key: "family", label: "Familia o linaje", icon: "♧", description: "Grupos familiares registrados", searchable: true },
    { key: "powerTier", label: "Escala de poder", icon: "▲", description: "Tramo de poder base en Dragon Ball" },
    { key: "initial", label: "Inicial del nombre", icon: "A", description: "Primer tramo alfabético" },
    { key: "traits", label: "Rasgos especiales", icon: "✧", description: "Poderes, relaciones, recursos y logros", searchable: true },
  ];

  const dom = {
    totalCount: document.querySelector("#total-count"),
    remainingCount: document.querySelector("#remaining-count"),
    activeCount: document.querySelector("#active-count"),
    resultCount: document.querySelector("#result-count"),
    search: document.querySelector("#character-search"),
    filters: document.querySelector("#filter-groups"),
    activeFilters: document.querySelector("#active-filters"),
    candidates: document.querySelector("#candidate-grid"),
    finalReveal: document.querySelector("#final-reveal"),
    suggestion: document.querySelector("#suggestion"),
    loadMore: document.querySelector("#load-more"),
    undo: document.querySelector("#undo-filter"),
    reset: document.querySelector("#reset-filters"),
    suggest: document.querySelector("#suggest-filter"),
    toggleIdentities: document.querySelector("#toggle-identities"),
    collapseFilters: document.querySelector("#collapse-filters"),
    filterPanel: document.querySelector(".filter-panel"),
    help: document.querySelector("#help-dialog"),
    openHelp: document.querySelector("#open-help"),
    closeHelp: document.querySelector("#close-help"),
    characterDialog: document.querySelector("#character-dialog"),
    characterContent: document.querySelector("#character-dialog-content"),
    closeCharacter: document.querySelector("#close-character"),
  };

  const genderMap = buildGenderMap(window.RP_INAZUMA_FAMILIES || []);
  const candidates = buildCandidates();
  const allOptions = buildAllOptions(candidates);
  const selectedFilters = new Map();
  const filterSearches = new Map();
  const expandedGroups = new Set();
  const openGroups = new Set(CATEGORY_DEFS.filter((entry) => entry.open).map((entry) => entry.key));
  const history = [];
  let renderLimit = PAGE_SIZE;
  let hideIdentities = false;
  let suggestion = null;

  bindEvents();
  render();

  function buildCandidates() {
    const registry = new Map();

    for (const player of window.INAZUMA_CENTER_DATA?.players || []) {
      const traits = [];
      if (player.techniques?.length) traits.push("Tiene supertécnicas");
      if (player.talent?.nombre) traits.push("Tiene talento");
      if (player.spirit?.nombre) traits.push("Tiene espíritu guerrero");
      if (player.spirit?.armadura) traits.push("Tiene armadura de espíritu");
      if (player.miximax?.nombre || player.miximax?.name) traits.push("Tiene Mixi Max");
      if ((player.goals || 0) > 0) traits.push("Ha marcado goles");
      if ((player.assists || 0) > 0) traits.push("Ha dado asistencias");
      if ((player.cleanSheets || 0) > 0) traits.push("Tiene porterías a cero");
      upsert(registry, {
        name: player.name,
        universe: "Inazuma Eleven",
        origin: "RP Inazuma Eleven",
        source: "Inazuma Center",
        image: rootAsset(player.image),
        gender: genderMap.get(normalize(player.name)) || "Sin clasificar",
        status: player.status || "Sin clasificar",
        role: player.positionGroup || player.position || "Futbolista",
        team: player.team,
        element: player.element,
        traits,
        detail: player.title,
        priority: 5,
      });
    }

    for (const warrior of window.DRAGON_DEX_DATA?.characters || []) {
      const family = warrior.family || {};
      const traits = [];
      if (warrior.image) traits.push("Tiene imagen");
      if (warrior.transformations?.length) traits.push("Tiene transformaciones");
      if (warrior.seals?.length) traits.push("Tiene sellos de Tao");
      if (family.partners?.length) traits.push("Tiene pareja registrada");
      if (family.parents?.length) traits.push("Tiene padres registrados");
      if (family.children?.length) traits.push("Tiene descendencia");
      if ((warrior.basePower || 0) >= 100000000) traits.push("Supera 100 millones de poder");
      upsert(registry, {
        name: warrior.name,
        universe: "Dragon Ball",
        origin: "RP Dragon Ball",
        source: "Dragon Dex",
        image: rootAsset(warrior.image),
        gender: "Sin clasificar",
        status: warrior.status || "Sin clasificar",
        role: warrior.role || "Guerrero/a",
        race: warrior.race || "Sin clasificar",
        team: warrior.affiliation,
        family: family.group,
        powerTier: getPowerTier(warrior.basePower),
        traits,
        detail: warrior.alias,
        priority: 5,
      });
    }

    for (const trainer of window.ETRURIA_TRAINERS || []) {
      const allPokemon = [...(trainer.team || []), ...(trainer.reserves || [])];
      const types = unique(allPokemon.flatMap((pokemon) => pokemon.types || []).map(translatePokemonType));
      const traits = ["Es entrenador Pokémon"];
      if (trainer.team?.length) traits.push("Tiene equipo Pokémon");
      if (trainer.reserves?.length) traits.push("Tiene reservas Pokémon");
      if (trainer.badges?.length) traits.push("Tiene medallas");
      if (trainer.achievements?.length) traits.push("Tiene logros");
      if (allPokemon.some((pokemon) => pokemon.image)) traits.push("Tiene Pokémon custom");
      const teamSize = allPokemon.length;
      if (teamSize <= 2) traits.push("Equipo Pokémon pequeño");
      else if (teamSize <= 4) traits.push("Equipo Pokémon mediano");
      else traits.push("Equipo Pokémon grande");
      upsert(registry, {
        name: trainer.name,
        universe: "Pokémon",
        origin: "RP Pokémon Etruria",
        source: "Pokémon Center",
        image: rootAsset(trainer.image),
        gender: inferTrainerGender(trainer),
        status: trainer.status || "Sin clasificar",
        role: "Entrenador/a Pokémon",
        region: trainer.region,
        location: trainer.location,
        pokemonType: types,
        traits,
        detail: trainer.title || trainer.summary,
        priority: 5,
      });
    }

    return [...registry.values()]
      .map(finalizeCandidate)
      .filter((candidate) => candidate.name && candidate.name !== "???")
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }

  function upsert(registry, raw) {
    const name = clean(raw.name);
    if (!name || name === "???") return;
    const universe = clean(raw.universe) || "Otros mundos";
    const keyScope = ["Inazuma Eleven", "Dragon Ball", "Pokémon"].includes(universe)
      ? universe
      : clean(raw.origin) || universe;
    const key = `${normalize(keyScope)}::${normalize(name)}`;
    const existing = registry.get(key);
    const incoming = {
      id: slug(`${keyScope}-${name}`), name, universe,
      origin: list(raw.origin), owner: list(raw.owner), source: list(raw.source), gender: list(raw.gender), status: list(raw.status),
      role: list(raw.role), team: list(raw.team), element: list(raw.element), race: list(raw.race), region: list(raw.region),
      pokemonType: list(raw.pokemonType), location: list(raw.location), family: list(raw.family), powerTier: list(raw.powerTier),
      traits: list(raw.traits), image: raw.image || "", detail: clean(raw.detail), priority: raw.priority || 0,
    };
    if (!existing) {
      registry.set(key, incoming);
      return;
    }
    for (const field of ["origin", "owner", "source", "gender", "status", "role", "team", "element", "race", "region", "pokemonType", "location", "family", "powerTier", "traits"]) {
      existing[field] = unique([...existing[field], ...incoming[field]]);
    }
    if (incoming.priority >= existing.priority) {
      if (incoming.image) existing.image = incoming.image;
      if (incoming.detail) existing.detail = incoming.detail;
      existing.priority = incoming.priority;
    }
  }

  function finalizeCandidate(candidate) {
    for (const field of ["origin", "owner", "source", "gender", "status", "role", "team", "element", "race", "region", "pokemonType", "location", "family", "powerTier", "traits"]) {
      candidate[field] = unique(candidate[field].filter(Boolean));
    }
    if (!candidate.gender.length) candidate.gender = ["Sin clasificar"];
    if (!candidate.owner.length) candidate.owner = ["Sin asignar"];
    candidate.initial = [getInitialGroup(candidate.name)];
    if (candidate.image && !candidate.traits.includes("Tiene imagen")) candidate.traits.push("Tiene imagen");
    if (!candidate.image && !candidate.traits.includes("Sin imagen")) candidate.traits.push("Sin imagen");
    candidate.searchText = normalize([
      candidate.name, candidate.universe, candidate.detail,
      ...CATEGORY_DEFS.flatMap((definition) => candidate[definition.key] || []),
    ].join(" "));
    return candidate;
  }

  function buildGenderMap(families) {
    const map = new Map();
    for (const group of families) {
      if (group.madre?.nombre) map.set(normalize(group.madre.nombre), "Femenino");
      if (group.padre?.nombre) map.set(normalize(group.padre.nombre), "Masculino");
      for (const child of group.hijos || []) {
        if (child.genero === "M") map.set(normalize(child.nombre), "Masculino");
        if (child.genero === "F") map.set(normalize(child.nombre), "Femenino");
      }
    }
    return map;
  }

  function buildAllOptions(entries) {
    const result = new Map();
    for (const definition of CATEGORY_DEFS) {
      result.set(definition.key, unique(entries.flatMap((candidate) => valuesFor(candidate, definition.key))).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })));
    }
    return result;
  }

  function bindEvents() {
    dom.search.addEventListener("input", () => {
      renderLimit = PAGE_SIZE;
      suggestion = null;
      render();
    });
    dom.undo.addEventListener("click", undo);
    dom.reset.addEventListener("click", reset);
    dom.suggest.addEventListener("click", suggestNextFilter);
    dom.loadMore.addEventListener("click", () => { renderLimit += PAGE_SIZE; renderCandidates(filterCandidates()); });
    dom.toggleIdentities.addEventListener("click", () => {
      hideIdentities = !hideIdentities;
      dom.toggleIdentities.setAttribute("aria-pressed", String(hideIdentities));
      dom.toggleIdentities.textContent = hideIdentities ? "◉ Mostrar identidades" : "◉ Ocultar identidades";
      document.body.classList.toggle("identities-hidden", hideIdentities);
      renderCandidates(filterCandidates());
    });
    dom.collapseFilters.addEventListener("click", () => {
      const collapsed = dom.filterPanel.classList.toggle("collapsed");
      dom.collapseFilters.textContent = collapsed ? "Mostrar" : "Ocultar";
      dom.collapseFilters.setAttribute("aria-expanded", String(!collapsed));
    });
    dom.openHelp.addEventListener("click", () => dom.help.showModal());
    dom.closeHelp.addEventListener("click", () => dom.help.close());
    dom.closeCharacter.addEventListener("click", () => dom.characterDialog.close());
    dom.help.addEventListener("click", closeOnBackdrop);
    dom.characterDialog.addEventListener("click", closeOnBackdrop);
  }

  function render() {
    const filtered = filterCandidates();
    const activeCount = countActiveFilters();
    dom.totalCount.textContent = candidates.length.toLocaleString("es-ES");
    dom.remainingCount.textContent = filtered.length.toLocaleString("es-ES");
    dom.resultCount.textContent = filtered.length.toLocaleString("es-ES");
    dom.activeCount.textContent = activeCount;
    dom.undo.disabled = !history.length;
    dom.reset.disabled = !activeCount && !dom.search.value;
    dom.suggest.disabled = filtered.length < 3;
    renderFilters();
    renderActiveFilters();
    renderSuggestion();
    renderReveal(filtered);
    renderCandidates(filtered);
  }

  function renderFilters() {
    dom.filters.innerHTML = CATEGORY_DEFS.map((definition) => {
      const baseCandidates = filterCandidates(definition.key);
      const counts = countOptions(baseCandidates, definition.key);
      const selected = selectedFilters.get(definition.key) || new Set();
      const optionSearch = filterSearches.get(definition.key) || "";
      let options = allOptions.get(definition.key) || [];
      if (optionSearch) options = options.filter((option) => normalize(option).includes(normalize(optionSearch)));
      options = options
        .filter((option) => (counts.get(option) || 0) > 0 || selected.has(option))
        .sort((a, b) => {
          if (selected.has(a) !== selected.has(b)) return selected.has(a) ? -1 : 1;
          return (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b, "es");
        });
      const expanded = expandedGroups.has(definition.key) || Boolean(optionSearch);
      const shown = expanded ? options.slice(0, 80) : options.slice(0, OPTION_LIMIT);
      const hiddenAmount = Math.max(0, options.length - shown.length);
      return `
        <details class="filter-group" data-group="${definition.key}" ${openGroups.has(definition.key) ? "open" : ""}>
          <summary><span class="filter-icon">${definition.icon}</span><span><strong>${escapeHTML(definition.label)}</strong><small>${escapeHTML(definition.description)}</small></span><b>${selected.size || "＋"}</b></summary>
          <div class="filter-group-body">
            ${definition.searchable ? `<label class="option-search"><span>⌕</span><input type="search" data-filter-search="${definition.key}" value="${escapeHTML(optionSearch)}" placeholder="Buscar opción…" /></label>` : ""}
            <div class="filter-options">
              ${shown.map((option) => `<button type="button" class="filter-option${selected.has(option) ? " selected" : ""}" data-category="${definition.key}" data-value="${escapeHTML(option)}" aria-pressed="${selected.has(option)}"><span>${escapeHTML(option)}</span><b>${counts.get(option) || 0}</b></button>`).join("") || `<p class="no-options">No hay opciones compatibles.</p>`}
            </div>
            ${hiddenAmount ? `<button class="expand-options" type="button" data-expand="${definition.key}">Ver ${hiddenAmount} más</button>` : expanded && options.length > OPTION_LIMIT ? `<button class="expand-options" type="button" data-collapse="${definition.key}">Ver menos</button>` : ""}
          </div>
        </details>`;
    }).join("");

    dom.filters.querySelectorAll("details").forEach((details) => details.addEventListener("toggle", () => {
      if (details.open) openGroups.add(details.dataset.group); else openGroups.delete(details.dataset.group);
    }));
    dom.filters.querySelectorAll(".filter-option").forEach((button) => button.addEventListener("click", () => toggleFilter(button.dataset.category, button.dataset.value)));
    dom.filters.querySelectorAll("[data-expand]").forEach((button) => button.addEventListener("click", () => { expandedGroups.add(button.dataset.expand); renderFilters(); }));
    dom.filters.querySelectorAll("[data-collapse]").forEach((button) => button.addEventListener("click", () => { expandedGroups.delete(button.dataset.collapse); renderFilters(); }));
    dom.filters.querySelectorAll("[data-filter-search]").forEach((input) => input.addEventListener("input", () => {
      filterSearches.set(input.dataset.filterSearch, input.value);
      renderFilters();
      const replacement = dom.filters.querySelector(`[data-filter-search="${input.dataset.filterSearch}"]`);
      replacement?.focus();
      replacement?.setSelectionRange(replacement.value.length, replacement.value.length);
    }));
  }

  function renderActiveFilters() {
    const chips = [];
    for (const definition of CATEGORY_DEFS) {
      for (const value of selectedFilters.get(definition.key) || []) {
        chips.push(`<button type="button" data-remove-category="${definition.key}" data-remove-value="${escapeHTML(value)}"><small>${escapeHTML(definition.label)}</small><strong>${escapeHTML(value)}</strong><span>×</span></button>`);
      }
    }
    if (dom.search.value.trim()) chips.push(`<button type="button" data-clear-search><small>Nombre</small><strong>${escapeHTML(dom.search.value.trim())}</strong><span>×</span></button>`);
    dom.activeFilters.innerHTML = chips.length ? `<span class="active-label">Filtros activos</span>${chips.join("")}` : `<p><strong>Sin filtros todavía.</strong> Empieza por universo, género, posición o raza.</p>`;
    dom.activeFilters.querySelectorAll("[data-remove-category]").forEach((button) => button.addEventListener("click", () => toggleFilter(button.dataset.removeCategory, button.dataset.removeValue)));
    dom.activeFilters.querySelector("[data-clear-search]")?.addEventListener("click", () => { dom.search.value = ""; render(); });
  }

  function renderCandidates(filtered) {
    const visible = filtered.slice(0, renderLimit);
    dom.candidates.classList.toggle("focus-mode", filtered.length > 0 && filtered.length <= 12);
    dom.candidates.innerHTML = visible.map((candidate) => candidateCard(candidate, filtered.length)).join("");
    dom.candidates.querySelectorAll(".candidate-card").forEach((button) => button.addEventListener("click", () => openCharacter(button.dataset.id)));
    dom.candidates.querySelectorAll("img").forEach((image) => image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".candidate-art")?.classList.add("image-failed");
    }));
    dom.loadMore.hidden = filtered.length <= renderLimit;
    dom.loadMore.textContent = `Mostrar ${Math.min(PAGE_SIZE, filtered.length - renderLimit)} más · quedan ${filtered.length - renderLimit}`;
  }

  function candidateCard(candidate, resultCount) {
    const hidden = hideIdentities && resultCount > 1;
    const subtitle = [candidate.universe, candidate.role[0]].filter(Boolean).join(" · ");
    return `<button type="button" class="candidate-card" data-id="${candidate.id}" aria-label="${hidden ? "Candidato oculto" : escapeHTML(candidate.name)}">
      <span class="candidate-art">${candidate.image ? `<img src="${escapeHTML(candidate.image)}" alt="" loading="lazy" />` : ""}<b>${escapeHTML(initials(candidate.name))}</b><i>${hidden ? "?" : ""}</i></span>
      <span class="candidate-copy"><strong>${hidden ? "Expediente oculto" : escapeHTML(candidate.name)}</strong><small>${hidden ? "Añade más filtros para revelarlo" : escapeHTML(subtitle)}</small></span>
      <span class="candidate-source">${escapeHTML(candidate.source[0] || "Archivo")}</span>
    </button>`;
  }

  function renderReveal(filtered) {
    if (filtered.length === 1) {
      const candidate = filtered[0];
      dom.finalReveal.hidden = false;
      dom.finalReveal.className = "final-reveal success";
      dom.finalReveal.innerHTML = `<div class="reveal-symbol">✓</div><div><span>Expediente localizado</span><h3>¿Es ${escapeHTML(candidate.name)}?</h3><p>${escapeHTML([candidate.universe, candidate.role[0], candidate.team[0]].filter(Boolean).join(" · "))}</p></div><button type="button" data-reveal-id="${candidate.id}">Abrir resultado</button>`;
      dom.finalReveal.querySelector("button").addEventListener("click", () => openCharacter(candidate.id));
    } else if (!filtered.length) {
      dom.finalReveal.hidden = false;
      dom.finalReveal.className = "final-reveal empty";
      dom.finalReveal.innerHTML = `<div class="reveal-symbol">!</div><div><span>Combinación imposible</span><h3>No queda ningún personaje</h3><p>Deshaz el último filtro o elimina una de las condiciones activas.</p></div><button type="button" data-empty-undo ${history.length ? "" : "disabled"}>Deshacer</button>`;
      dom.finalReveal.querySelector("button").addEventListener("click", undo);
    } else {
      dom.finalReveal.hidden = true;
      dom.finalReveal.innerHTML = "";
    }
  }

  function renderSuggestion() {
    if (!suggestion) {
      dom.suggestion.hidden = true;
      return;
    }
    const definition = CATEGORY_DEFS.find((entry) => entry.key === suggestion.category);
    dom.suggestion.hidden = false;
    dom.suggestion.innerHTML = `<span aria-hidden="true">✦</span><div><small>Pista recomendada</small><strong>${escapeHTML(definition?.label || suggestion.category)}: ${escapeHTML(suggestion.value)}</strong><p>Si es correcto quedarían aproximadamente ${suggestion.count} candidatos.</p></div><button type="button">Aplicar</button><button class="dismiss-suggestion" type="button" aria-label="Cerrar">×</button>`;
    dom.suggestion.querySelector("button:not(.dismiss-suggestion)").addEventListener("click", () => toggleFilter(suggestion.category, suggestion.value));
    dom.suggestion.querySelector(".dismiss-suggestion").addEventListener("click", () => { suggestion = null; renderSuggestion(); });
  }

  function openCharacter(id) {
    const candidate = candidates.find((entry) => entry.id === id);
    if (!candidate) return;
    const detailRows = CATEGORY_DEFS
      .filter((definition) => !["traits", "initial"].includes(definition.key) && valuesFor(candidate, definition.key).length)
      .map((definition) => `<div><small>${escapeHTML(definition.label)}</small><strong>${escapeHTML(valuesFor(candidate, definition.key).join(" · "))}</strong></div>`)
      .join("");
    dom.characterContent.innerHTML = `
      <div class="character-hero">
        <div class="character-portrait">${candidate.image ? `<img src="${escapeHTML(candidate.image)}" alt="${escapeHTML(candidate.name)}" />` : `<b>${escapeHTML(initials(candidate.name))}</b>`}</div>
        <div><span>${escapeHTML(candidate.universe)}</span><h2 id="character-dialog-title">${escapeHTML(candidate.name)}</h2><p>${escapeHTML(candidate.detail || candidate.origin[0] || "Expediente del rol")}</p></div>
      </div>
      <div class="character-data">${detailRows}</div>
      <section class="trait-list"><h3>Rasgos registrados</h3><div>${candidate.traits.map((trait) => `<span>${escapeHTML(trait)}</span>`).join("") || "<p>Sin rasgos adicionales registrados.</p>"}</div></section>`;
    dom.characterContent.querySelector("img")?.addEventListener("error", (event) => { event.currentTarget.hidden = true; });
    dom.characterDialog.showModal();
  }

  function toggleFilter(category, value) {
    snapshot();
    const values = new Set(selectedFilters.get(category) || []);
    if (values.has(value)) values.delete(value); else values.add(value);
    if (values.size) selectedFilters.set(category, values); else selectedFilters.delete(category);
    suggestion = null;
    renderLimit = PAGE_SIZE;
    render();
  }

  function filterCandidates(ignoreCategory = "") {
    const query = normalize(dom.search.value);
    return candidates.filter((candidate) => {
      if (query && !candidate.searchText.includes(query)) return false;
      for (const [category, selected] of selectedFilters) {
        if (category === ignoreCategory || !selected.size) continue;
        const candidateValues = new Set(valuesFor(candidate, category));
        if (![...selected].some((value) => candidateValues.has(value))) return false;
      }
      return true;
    });
  }

  function countOptions(entries, category) {
    const counts = new Map();
    for (const candidate of entries) {
      for (const value of valuesFor(candidate, category)) counts.set(value, (counts.get(value) || 0) + 1);
    }
    return counts;
  }

  function valuesFor(candidate, category) {
    if (category === "universe") return [candidate.universe];
    return Array.isArray(candidate[category]) ? candidate[category] : list(candidate[category]);
  }

  function suggestNextFilter() {
    const remaining = filterCandidates();
    if (remaining.length < 3) return;
    let best = null;
    for (const definition of CATEGORY_DEFS.filter((entry) => !["initial", "source"].includes(entry.key))) {
      const alreadySelected = selectedFilters.get(definition.key) || new Set();
      const counts = countOptions(remaining, definition.key);
      for (const [value, count] of counts) {
        if (alreadySelected.has(value) || value === "Sin clasificar" || count < 1 || count >= remaining.length) continue;
        const score = Math.abs(remaining.length / 2 - count);
        if (!best || score < best.score) best = { category: definition.key, value, count, score };
      }
    }
    suggestion = best;
    renderSuggestion();
  }

  function snapshot() {
    history.push([...selectedFilters].map(([category, values]) => [category, [...values]]));
    if (history.length > 40) history.shift();
  }

  function undo() {
    const previous = history.pop();
    if (!previous) return;
    selectedFilters.clear();
    for (const [category, values] of previous) selectedFilters.set(category, new Set(values));
    suggestion = null;
    renderLimit = PAGE_SIZE;
    render();
  }

  function reset() {
    if (selectedFilters.size) snapshot();
    selectedFilters.clear();
    dom.search.value = "";
    suggestion = null;
    renderLimit = PAGE_SIZE;
    render();
  }

  function countActiveFilters() {
    let amount = 0;
    for (const values of selectedFilters.values()) amount += values.size;
    return amount;
  }

  function inferTrainerGender(trainer) {
    const text = normalize(`${trainer.title || ""} ${trainer.summary || ""}`);
    if (text.includes("entrenadora") || text.includes("campeona") || text.includes("concursante")) return "Femenino";
    if (text.includes("entrenador") || text.includes("campeon")) return "Masculino";
    return "Sin clasificar";
  }

  function getPowerTier(power) {
    const amount = Number(power) || 0;
    if (!amount) return "Sin clasificar";
    if (amount < 1000000) return "Menos de 1 millón";
    if (amount < 50000000) return "1–50 millones";
    if (amount < 100000000) return "50–100 millones";
    if (amount < 1000000000) return "100 millones–1.000 millones";
    return "Más de 1.000 millones";
  }

  function getInitialGroup(name) {
    const initial = normalize(name).charAt(0).toUpperCase();
    if (initial >= "A" && initial <= "E") return "A–E";
    if (initial >= "F" && initial <= "J") return "F–J";
    if (initial >= "K" && initial <= "O") return "K–O";
    if (initial >= "P" && initial <= "T") return "P–T";
    if (initial >= "U" && initial <= "Z") return "U–Z";
    return "Número o símbolo";
  }

  function rootAsset(path) {
    const value = clean(path);
    if (!value) return "";
    if (/^(https?:|data:)/i.test(value)) return value;
    return `${ROOT}${value.replace(/^\.\.\//, "").replace(/^\//, "")}`;
  }

  function translatePokemonType(type) {
    const translations = { normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico", grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro", steel: "Acero", fairy: "Hada" };
    return translations[normalize(type)] || clean(type);
  }

  function closeOnBackdrop(event) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  function list(value) {
    if (Array.isArray(value)) return value.flatMap(list);
    const cleaned = clean(value);
    return cleaned ? [cleaned] : [];
  }

  function unique(values) {
    const seen = new Set();
    return values.filter((value) => {
      const key = normalize(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function clean(value) {
    return String(value ?? "").trim();
  }

  function normalize(value) {
    return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function slug(value) {
    return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function initials(name) {
    return clean(name).split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "?";
  }

  function escapeHTML(value) {
    return clean(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }
})();
