(() => {
  "use strict";
  const characters = Array.isArray(window.RP_CHARACTERS) ? window.RP_CHARACTERS : [];
  const STORAGE_KEY = "rpEquipoIdealV1";
  const formations = {
    "4-3-3": [
      ["EI","Extremo izquierdo",1,1],["DC","Delantero centro",3,1],["ED","Extremo derecho",5,1],
      ["MC-I","Mediocentro",2,2],["MCO","Mediapunta",3,2],["MC-D","Mediocentro",4,2],
      ["LI","Lateral izquierdo",1,3],["DFC-I","Defensa central",2,3],["DFC-D","Defensa central",4,3],["LD","Lateral derecho",5,3],
      ["POR","Portero",3,4]
    ],
    "4-4-2": [
      ["DC-I","Delantero",2,1],["DC-D","Delantero",4,1],
      ["MI","Interior izquierdo",1,2],["MC-I","Mediocentro",2,2],["MC-D","Mediocentro",4,2],["MD","Interior derecho",5,2],
      ["LI","Lateral izquierdo",1,3],["DFC-I","Defensa central",2,3],["DFC-D","Defensa central",4,3],["LD","Lateral derecho",5,3],
      ["POR","Portero",3,4]
    ],
    "3-5-2": [
      ["DC-I","Delantero",2,1],["DC-D","Delantero",4,1],
      ["CAI","Carrilero izquierdo",1,2],["MC-I","Mediocentro",2,2],["MCO","Mediapunta",3,2],["MC-D","Mediocentro",4,2],["CAD","Carrilero derecho",5,2],
      ["DFC-I","Defensa central",1,3],["DFC","Defensa central",3,3],["DFC-D","Defensa central",5,3],
      ["POR","Portero",3,4]
    ]
  };

  const nodes = {
    formation: document.getElementById("formationSelect"), pitch: document.getElementById("pitch"),
    search: document.getElementById("characterSearch"), owner: document.getElementById("ownerFilter"),
    anime: document.getElementById("animeFilter"), list: document.getElementById("candidateList"),
    resultCount: document.getElementById("resultCount"), hint: document.getElementById("selectedHint"),
    filled: document.getElementById("filledMetric"), owners: document.getElementById("ownerMetric"),
    animes: document.getElementById("animeMetric"), random: document.getElementById("randomBtn"),
    clear: document.getElementById("clearBtn"), copy: document.getElementById("copyBtn"),
    saveState: document.getElementById("saveState"), toast: document.getElementById("toast")
  };
  const byName = new Map(characters.map(character => [character.name, character]));
  let state = loadState();
  let selectedSlot = formations[state.formation].find(slot => !state.lineup[slot[0]])?.[0] || formations[state.formation][0][0];
  let toastTimer = 0;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const formation = formations[saved?.formation] ? saved.formation : "4-3-3";
      const validSlots = new Set(formations[formation].map(slot => slot[0]));
      const lineup = Object.fromEntries(Object.entries(saved?.lineup || {}).filter(([slot,name]) => validSlots.has(slot) && byName.has(name)));
      return { formation, lineup };
    } catch { return { formation:"4-3-3", lineup:{} }; }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    nodes.saveState.textContent = "✓ Equipo guardado";
    clearTimeout(saveState.timer);
    saveState.timer = setTimeout(() => { nodes.saveState.textContent = "Guardado automático"; }, 1500);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;" }[char]));
  }

  function initials(name) {
    return String(name || "?").split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0]).join("").toUpperCase();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    nodes.toast.textContent = message;
    nodes.toast.hidden = false;
    toastTimer = setTimeout(() => { nodes.toast.hidden = true; }, 2200);
  }

  function selectedNames() {
    return new Set(Object.values(state.lineup));
  }

  function renderPitch() {
    nodes.formation.value = state.formation;
    nodes.pitch.innerHTML = formations[state.formation].map(([id,label,column,row]) => {
      const character = byName.get(state.lineup[id]);
      return `<button class="slot ${selectedSlot === id ? "active" : ""} ${character ? "filled" : ""}" type="button" data-slot="${id}" style="grid-column:${column};grid-row:${row}" aria-label="${escapeHTML(label)}${character ? `: ${escapeHTML(character.name)}` : ", vacío"}"><span class="role">${escapeHTML(id)}</span><strong>${character ? escapeHTML(character.name) : "Elegir jugador"}</strong><small>${character ? escapeHTML(character.anime || character.owner || "") : escapeHTML(label)}</small></button>`;
    }).join("");
    const slot = formations[state.formation].find(item => item[0] === selectedSlot);
    nodes.hint.textContent = slot ? `${slot[0]} · ${slot[1]}` : "Selecciona un puesto";
    renderMetrics();
  }

  function renderMetrics() {
    const picked = Object.values(state.lineup).map(name => byName.get(name)).filter(Boolean);
    nodes.filled.textContent = `${picked.length}/11`;
    nodes.owners.textContent = new Set(picked.map(item => item.owner).filter(Boolean)).size;
    nodes.animes.textContent = new Set(picked.map(item => item.anime).filter(Boolean)).size;
  }

  function filteredCharacters() {
    const query = normalize(nodes.search.value);
    return characters.filter(character => {
      const queryMatch = !query || normalize(`${character.name} ${character.anime} ${character.owner}`).includes(query);
      const ownerMatch = nodes.owner.value === "all" || (character.owner || "Sin dueño") === nodes.owner.value;
      const animeMatch = nodes.anime.value === "all" || (character.anime || "Sin universo") === nodes.anime.value;
      return queryMatch && ownerMatch && animeMatch;
    }).sort((a,b) => a.name.localeCompare(b.name,"es")).slice(0,180);
  }

  function renderCandidates() {
    const list = filteredCharacters();
    const picked = selectedNames();
    nodes.resultCount.textContent = String(list.length);
    if (!characters.length) {
      nodes.list.innerHTML = '<div class="empty">No se ha podido cargar personajes-datos.js.</div>';
      return;
    }
    nodes.list.innerHTML = list.length ? list.map(character => {
      const used = picked.has(character.name) && state.lineup[selectedSlot] !== character.name;
      return `<button class="candidate" type="button" data-character="${escapeHTML(character.name)}" ${used ? "disabled" : ""}><span class="avatar">${escapeHTML(initials(character.name))}</span><span><strong>${escapeHTML(character.name)}</strong><small>${escapeHTML(character.anime || "Sin universo")}</small></span><span>${used ? "EN EL XI" : escapeHTML(character.owner || "Libre")}</span></button>`;
    }).join("") : '<div class="empty">No hay personajes con estos filtros.</div>';
  }

  function populateFilters() {
    const owners = [...new Set(characters.map(item => item.owner || "Sin dueño"))].sort((a,b) => a.localeCompare(b,"es"));
    const animes = [...new Set(characters.map(item => item.anime || "Sin universo"))].sort((a,b) => a.localeCompare(b,"es"));
    nodes.owner.innerHTML = '<option value="all">Todos los dueños</option>' + owners.map(value => `<option>${escapeHTML(value)}</option>`).join("");
    nodes.anime.innerHTML = '<option value="all">Todos los universos</option>' + animes.map(value => `<option>${escapeHTML(value)}</option>`).join("");
  }

  function assignCharacter(name) {
    if (!selectedSlot || !byName.has(name)) return;
    Object.keys(state.lineup).forEach(slot => { if (state.lineup[slot] === name) delete state.lineup[slot]; });
    state.lineup[selectedSlot] = name;
    const slots = formations[state.formation];
    const index = slots.findIndex(slot => slot[0] === selectedSlot);
    selectedSlot = slots.slice(index + 1).find(slot => !state.lineup[slot[0]])?.[0] || selectedSlot;
    saveState();
    renderPitch();
    renderCandidates();
  }

  function changeFormation(formation) {
    const oldNames = Object.values(state.lineup);
    state = { formation, lineup:{} };
    formations[formation].forEach((slot,index) => { if (oldNames[index]) state.lineup[slot[0]] = oldNames[index]; });
    selectedSlot = formations[formation].find(slot => !state.lineup[slot[0]])?.[0] || formations[formation][0][0];
    saveState();
    renderPitch();
    renderCandidates();
  }

  function randomize() {
    if (characters.length < 11) return showToast("No hay suficientes personajes disponibles.");
    const shuffled = [...characters].sort(() => Math.random() - .5).slice(0,11);
    state.lineup = {};
    formations[state.formation].forEach((slot,index) => { state.lineup[slot[0]] = shuffled[index].name; });
    saveState();
    renderPitch();
    renderCandidates();
    showToast("Once aleatorio creado.");
  }

  async function copyLineup() {
    const lines = formations[state.formation].map(([id,label]) => `${id} (${label}): ${state.lineup[id] || "Vacío"}`);
    const text = `Equipo Ideal · ${state.formation}\n\n${lines.join("\n")}`;
    try { await navigator.clipboard.writeText(text); showToast("Once copiado al portapapeles."); }
    catch { showToast("No se pudo copiar automáticamente."); }
  }

  nodes.pitch.addEventListener("click", event => {
    const slot = event.target.closest("[data-slot]");
    if (!slot) return;
    selectedSlot = slot.dataset.slot;
    renderPitch();
    renderCandidates();
    nodes.search.focus();
  });
  nodes.list.addEventListener("click", event => {
    const candidate = event.target.closest("[data-character]");
    if (candidate && !candidate.disabled) assignCharacter(candidate.dataset.character);
  });
  [nodes.search,nodes.owner,nodes.anime].forEach(node => node.addEventListener(node === nodes.search ? "input" : "change", renderCandidates));
  nodes.formation.addEventListener("change", () => changeFormation(nodes.formation.value));
  nodes.random.addEventListener("click", randomize);
  nodes.clear.addEventListener("click", () => {
    if (!Object.keys(state.lineup).length || confirm("¿Vaciar toda la alineación?")) {
      state.lineup = {};
      selectedSlot = formations[state.formation][0][0];
      saveState();
      renderPitch();
      renderCandidates();
    }
  });
  nodes.copy.addEventListener("click", copyLineup);
  document.addEventListener("keydown", event => {
    if (event.key === "/" && document.activeElement !== nodes.search) { event.preventDefault(); nodes.search.focus(); }
  });

  populateFilters();
  renderPitch();
  renderCandidates();
})();
