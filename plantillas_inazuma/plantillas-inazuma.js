const formationSelect = document.getElementById("formationSelect");
const slotsContainer = document.getElementById("slots");
const playersList = document.getElementById("playersList");
const searchInput = document.getElementById("searchInput");
const teamFilter = document.getElementById("teamFilter");
const positionFilter = document.getElementById("positionFilter");
const eventoInput = document.getElementById("eventoInput");
const equipoInput = document.getElementById("equipoInput");
const boardEventName = document.getElementById("boardEventName");
const boardTeamName = document.getElementById("boardTeamName");
const output = document.getElementById("output");
const btnCopiar = document.getElementById("btnCopiar");
const btnCopiarCodigo = document.getElementById("btnCopiarCodigo");
const btnImportarPaste = document.getElementById("btnImportarPaste");
const btnToggleChemistry = document.getElementById("btnToggleChemistry");
const btnChemistryDetails = document.getElementById("btnChemistryDetails");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnVista = document.getElementById("btnVista");
const btnExportar = document.getElementById("btnExportar");
const btnImportar = document.getElementById("btnImportar");
const importFile = document.getElementById("importFile");
const teamHud = document.getElementById("teamHud");
const benchPanel = document.getElementById("benchPanel");
const managersPanel = document.getElementById("managersPanel");
const templateSelect = document.getElementById("templateSelect");
const btnNuevaPlantilla = document.getElementById("btnNuevaPlantilla");
const btnDuplicarPlantilla = document.getElementById("btnDuplicarPlantilla");
const btnBorrarPlantilla = document.getElementById("btnBorrarPlantilla");
const btnPlantillaAnterior = document.getElementById("btnPlantillaAnterior");
const btnPlantillaSiguiente = document.getElementById("btnPlantillaSiguiente");
const templateMode = document.getElementById("templateMode");
const fieldStyleSelect = document.getElementById("fieldStyleSelect");
const themeSelect = document.getElementById("themeSelect");
const zoomRange = document.getElementById("zoomRange");
const quickCopiar = document.getElementById("quickCopiar");
const quickCodigo = document.getElementById("quickCodigo");
const quickExportar = document.getElementById("quickExportar");
const quickImportar = document.getElementById("quickImportar");
const quickFullscreen = document.getElementById("quickFullscreen");

const playerDialog = document.getElementById("playerDialog");
const selectedSlotInfo = document.getElementById("selectedSlotInfo");
const dialogSearch = document.getElementById("dialogSearch");
const dialogPlayers = document.getElementById("dialogPlayers");
const dialogClose = document.getElementById("dialogClose");
const dialogTeamFilter = document.getElementById("dialogTeamFilter");
const dialogPositionChips = document.getElementById("dialogPositionChips");
const statsDialog = document.getElementById("statsDialog");
const statsDialogTitle = document.getElementById("statsDialogTitle");
const statsDialogMeta = document.getElementById("statsDialogMeta");
const statsGoals = document.getElementById("statsGoals");
const statsAssists = document.getElementById("statsAssists");
const statsYellow = document.getElementById("statsYellow");
const statsRed = document.getElementById("statsRed");
const statsChangePlayer = document.getElementById("statsChangePlayer");
const statsClearPlayer = document.getElementById("statsClearPlayer");
const statsDialogClose = document.getElementById("statsDialogClose");
const chemistryDialog = document.getElementById("chemistryDialog");
const chemistryDialogSummary = document.getElementById("chemistryDialogSummary");
const chemistryDialogContent = document.getElementById("chemistryDialogContent");
const chemistryDialogClose = document.getElementById("chemistryDialogClose");
const chemistryTooltip = document.getElementById("chemistryTooltip");
const freePlayerDialog = document.getElementById("freePlayerDialog");
const freeSlotInfo = document.getElementById("freeSlotInfo");
const freeName = document.getElementById("freeName");
const freePosition = document.getElementById("freePosition");
const freeNumber = document.getElementById("freeNumber");
const freeImage = document.getElementById("freeImage");
const freeTeam = document.getElementById("freeTeam");
const freePreview = document.getElementById("freePreview");
const freeSave = document.getElementById("freeSave");
const freeRemove = document.getElementById("freeRemove");
const freeClose = document.getElementById("freeClose");

const BENCH_SIZE = 10;
const MANAGER_SIZE = 3;

let formaciones = {};
let personajes = [];
let currentFormation = "";
let placedPlayers = {};
let benchPlayers = Array(BENCH_SIZE).fill(null);
let managers = Array(MANAGER_SIZE).fill(null);
let coach = null;
let matchStats = {};
let selectedTarget = null;
let draggedItem = null;
let dialogSelectedTeam = "";
let dialogSelectedPosition = "";
let statsSelectedTarget = null;
let chemistryRules = { relaciones: [], ajustes: [], efectos: [] };
let chemistryEnabled = true;
let templateModeValue = "normal";
let fieldStyleValue = "classic";
let themeValue = "ds";
let zoomValue = 100;
let templates = [];
let activeTemplateId = null;
let isLoadingTemplate = false;
let freeSelectedTarget = null;

init();

async function init() {
  const [formacionesRes, personajesRes, quimicaData] = await Promise.all([
    fetch("formaciones.json"),
    fetch("personajes.json"),
    loadChemistryRules()
  ]);

  formaciones = await formacionesRes.json();
  personajes = await personajesRes.json();
  chemistryRules = normalizeChemistryRules(quimicaData);

  fillFormationSelect();
  fillFilters();
  fillDialogFilters();
  renderPlayers();
  changeFormation(Object.keys(formaciones)[0]);

  formationSelect.addEventListener("change", () => changeFormation(formationSelect.value));
  searchInput.addEventListener("input", renderPlayers);
  teamFilter.addEventListener("change", renderPlayers);
  positionFilter.addEventListener("change", renderPlayers);
  eventoInput.addEventListener("input", updateBoardTitle);
  equipoInput.addEventListener("input", updateBoardTitle);
  btnCopiar.addEventListener("click", copyTemplate);
  btnCopiarCodigo?.addEventListener("click", copyTemplateCode);
  btnImportarPaste?.addEventListener("click", importTemplateFromPaste);
  btnToggleChemistry?.addEventListener("click", toggleChemistry);
  btnChemistryDetails?.addEventListener("click", openChemistryDetailsDialog);
  chemistryDialogClose?.addEventListener("click", () => chemistryDialog?.close());
  btnLimpiar.addEventListener("click", clearBoard);
  btnVista?.addEventListener("click", () => document.body.classList.toggle("wide-view"));
  btnExportar?.addEventListener("click", exportTemplateJson);
  btnImportar?.addEventListener("click", () => importFile?.click());
  importFile?.addEventListener("change", importTemplateJson);
  dialogSearch.addEventListener("input", renderDialogPlayers);
  dialogTeamFilter?.addEventListener("change", () => {
    dialogSelectedTeam = dialogTeamFilter.value;
    renderDialogPlayers();
  });
  dialogClose.addEventListener("click", () => playerDialog.close());
  statsGoals?.addEventListener("change", () => updateStatsDialogValue({ goals: Number(statsGoals.value) }));
  statsAssists?.addEventListener("change", () => updateStatsDialogValue({ assists: Number(statsAssists.value) }));
  statsYellow?.addEventListener("click", () => toggleStatsDialogCard("yellow"));
  statsRed?.addEventListener("click", () => toggleStatsDialogCard("red"));
  statsChangePlayer?.addEventListener("click", () => {
    if (!statsSelectedTarget) return;
    const target = { ...statsSelectedTarget };
    statsDialog?.close();
    openPicker(target.type, target.index);
  });
  statsClearPlayer?.addEventListener("click", () => {
    if (!statsSelectedTarget) return;
    setTargetPlayer(statsSelectedTarget.type, statsSelectedTarget.index, null);
    statsDialog?.close();
    renderAll();
  });
  statsDialogClose?.addEventListener("click", () => statsDialog?.close());

  initTemplateSystem();
  bindLayoutTools();
  updateChemistryToggleButton();
}


async function loadChemistryRules() {
  try {
    const response = await fetch("quimica.json", { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn("No se ha podido cargar quimica.json. Se usará la química automática.", error);
    return null;
  }
}

function normalizeChemistryRules(data) {
  const empty = { relaciones: [], ajustes: [], efectos: [] };
  if (!data || typeof data !== "object") return empty;

  const relaciones = [];
  const ajustes = [];
  const efectos = [];

  const sourceRelaciones = Array.isArray(data.relaciones) ? data.relaciones : [];
  sourceRelaciones.forEach(item => {
    const jugadores = item.jugadores || item.players || item.personajes;
    if (!Array.isArray(jugadores) || jugadores.length < 2) return;
    relaciones.push({
      jugadores: jugadores.slice(0, 2).map(name => normalizePersonName(name)),
      puntos: Number(item.puntos ?? item.points ?? item.valor ?? 0),
      nivel: item.nivel || item.level || "",
      motivo: item.motivo || item.reason || item.tipo || "quimica.json"
    });
  });

  const sourceAjustes = Array.isArray(data.ajustes) ? data.ajustes : [];
  sourceAjustes.forEach(item => {
    const jugador = item.jugador || item.player || item.personaje;
    if (!jugador) return;
    ajustes.push({
      jugador: normalizePersonName(jugador),
      puntos: Number(item.puntos ?? item.points ?? item.valor ?? 0),
      motivo: item.motivo || item.reason || "ajuste manual"
    });
  });

  const sourceEfectos = [
    ...(Array.isArray(data.efectos) ? data.efectos : []),
    ...(Array.isArray(data.presencias) ? data.presencias : []),
    ...(Array.isArray(data.bonusPorPresencia) ? data.bonusPorPresencia : [])
  ];

  sourceEfectos.forEach(item => {
    const fuente = item.fuente || item.jugador || item.player || item.personaje;
    if (!fuente) return;

    const rawZonas = item.zonas || item.ubicaciones || item.where || item.en || item.zona;
    const zonas = (Array.isArray(rawZonas) ? rawZonas : [rawZonas || "field"]).map(normalizeZone).filter(Boolean);

    const rawObjetivos = item.objetivos || item.targets || item.receptores || item.a || item.para || item.jugadoresObjetivo || item.objetivo || "*";
    const objetivos = (Array.isArray(rawObjetivos) ? rawObjetivos : [rawObjetivos]).map(target => String(target).trim() === "*" ? "*" : normalizePersonName(target));

    efectos.push({
      fuente: normalizePersonName(fuente),
      fuenteOriginal: String(fuente),
      zonas: zonas.length ? zonas : ["field"],
      objetivos: objetivos.length ? objetivos : ["*"],
      puntos: Number(item.puntos ?? item.points ?? item.valor ?? item.bonus ?? 0),
      motivo: item.motivo || item.reason || "efecto por presencia",
      nombre: item.nombre || item.name || "efecto de presencia"
    });
  });

  return { relaciones, ajustes, efectos };
}

function normalizeZone(zone) {
  const z = normalize(String(zone || ""));
  if (["titular", "titulares", "campo", "field", "starter", "starters", "once"].includes(z)) return "field";
  if (["banquillo", "suplente", "suplentes", "bench", "sub", "subs"].includes(z)) return "bench";
  if (["gerente", "gerentes", "manager", "managers", "staff"].includes(z)) return "manager";
  if (["entrenador", "coach", "dt"].includes(z)) return "coach";
  return z || "field";
}

function toggleChemistry() {
  chemistryEnabled = !chemistryEnabled;
  updateChemistryToggleButton();
  renderAll();
}

function updateChemistryToggleButton() {
  if (!btnToggleChemistry) return;
  btnToggleChemistry.textContent = chemistryEnabled ? "Sinergia ON" : "Sinergia OFF";
  btnToggleChemistry.classList.toggle("active", chemistryEnabled);
  btnToggleChemistry.classList.toggle("inactive", !chemistryEnabled);
}

function normalizePersonName(name) {
  return normalize(String(name || "").replace(/[’']/g, " ").replace(/\s+/g, " ").trim());
}

function fillFormationSelect() {
  formationSelect.innerHTML = Object.keys(formaciones)
    .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("");
}

function fillFilters() {
  const teams = [...new Set(personajes.map(p => p.equipo).filter(Boolean))].sort();
  const positions = [...new Set(personajes.map(p => p.posicion).filter(Boolean))].sort();

  teamFilter.innerHTML += teams.map(team => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`).join("");
  positionFilter.innerHTML += positions.map(pos => `<option value="${escapeHtml(pos)}">${escapeHtml(pos)}</option>`).join("");
}

function fillDialogFilters() {
  const teams = [...new Set(personajes.map(p => p.equipo).filter(Boolean))].sort();

  if (dialogTeamFilter) {
    dialogTeamFilter.innerHTML = `<option value="">Todos los equipos</option>` +
      teams.map(team => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`).join("");
  }

  renderDialogPositionChips();
}

function renderDialogPositionChips() {
  if (!dialogPositionChips) return;

  const positions = [...new Set(personajes.map(p => p.posicion).filter(Boolean))].sort();
  if (dialogSelectedPosition && !positions.includes(dialogSelectedPosition)) {
    positions.unshift(dialogSelectedPosition);
  }
  const chips = [`<button class="position-chip ${dialogSelectedPosition === "" ? "active" : ""}" data-pos="" type="button">Todas</button>`]
    .concat(positions.map(pos => `
      <button class="position-chip ${dialogSelectedPosition === pos ? "active" : ""}" data-pos="${escapeAttribute(pos)}" type="button">
        ${escapeHtml(pos)}
      </button>
    `));

  dialogPositionChips.innerHTML = chips.join("");
  dialogPositionChips.querySelectorAll(".position-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      dialogSelectedPosition = chip.dataset.pos || "";
      renderDialogPositionChips();
      renderDialogPlayers();
    });
  });
}

function changeFormation(name) {
  saveActiveTemplateState();
  currentFormation = name;
  formationSelect.value = name;
  placedPlayers = {};
  matchStats = {};
  renderAll();
}

function renderAll() {
  renderSlots();
  renderHud();
  generateOutput();
  bindChemistryTooltipEvents();
  saveActiveTemplateState();
}

function renderSlots() {
  const formation = formaciones[currentFormation] || [];
  slotsContainer.innerHTML = renderSynergySvg();

  formation.forEach((slot, index) => {
    const player = placedPlayers[index];
    const slotEl = document.createElement("div");
    slotEl.className = "slot";
    slotEl.style.left = `${slot.x}%`;
    slotEl.style.top = `${slot.y}%`;

    slotEl.innerHTML = `
      <div class="magnet ${player ? "filled draggable-card" : "empty"}" data-index="${index}" ${player ? 'draggable="true"' : ""}>
        ${player ? renderAvatar(player) : `<span class="slot-role">${escapeHtml(slot.rol)}</span>`}
        ${player ? renderPlayerMatchBadges("field", index) : ""}
        ${player ? `<span class="slot-number">${escapeHtml(getJerseyForTarget("field", index) ?? "?")}</span>` : ""}
      </div>
      <div class="slot-role">${escapeHtml(slot.rol)}</div>
      <div class="slot-name">${player ? escapeHtml(player.nombre) : "Vacío"}</div>
    `;

    const magnet = slotEl.querySelector(".magnet");
    magnet.addEventListener("click", () => player ? openStatsDialog("field", index) : openPicker("field", index));
    magnet.dataset.type = "field";
    magnet.dataset.index = index;
    if (player) {
      magnet.addEventListener("dragstart", event => startDragFromSlot(event, "field", index));
      magnet.addEventListener("dragend", endDrag);
    }
    enableDrop(magnet);
    slotsContainer.appendChild(slotEl);
  });
}

function renderHud() {
  const starters = Object.values(placedPlayers).filter(Boolean).length;
  const benchCount = benchPlayers.filter(Boolean).length;
  const managerCount = managers.filter(Boolean).length;

  if (teamHud) {
    const chemistry = calculateChemistry();
    teamHud.innerHTML = `
      <div class="hud-summary compact-summary">
        <div><strong>${starters}</strong><span>Titulares</span></div>
        <div><strong>${benchCount}/${BENCH_SIZE}</strong><span>Banquillo</span></div>
        <div><strong>${managerCount}/${MANAGER_SIZE}</strong><span>Gerentes</span></div>
        <div><strong>${coach ? "1" : "0"}/1</strong><span>Entrenador</span></div>
      </div>
      ${renderChemistryPanel(chemistry)}
      ${renderStatsEditor()}
      <p class="hud-tip">Puedes clicar una tarjeta o arrastrar jugadores desde el menú hacia campo, banquillo, gerentes o entrenador. En el editor puedes marcar goles, asistencias y tarjetas.</p>
    `;
    bindStatsEditorEvents();
  }

  if (managersPanel) {
    managersPanel.innerHTML = `
      ${managers.map((player, index) => renderRosterCard("manager", index, `Gerente ${index + 1}`, player)).join("")}
      ${renderRosterCard("coach", 0, "Entrenador", coach, true)}
    `;
  }

  if (benchPanel) {
    benchPanel.innerHTML = benchPlayers
      .map((player, index) => renderRosterCard("bench", index, `B${index + 1}`, player))
      .join("");
  }

  document.querySelectorAll(".roster-card, .mini-slot").forEach(card => {
    const type = card.dataset.type;
    const index = Number(card.dataset.index);
    card.addEventListener("click", () => getTargetPlayer(type, index) ? openStatsDialog(type, index) : openPicker(type, index));
    if (card.classList.contains("filled")) {
      card.addEventListener("dragstart", event => startDragFromSlot(event, type, index));
      card.addEventListener("dragend", endDrag);
    }
    enableDrop(card);
  });
}

function renderMiniSlot(type, index, label, player) {
  return `
    <button class="mini-slot ${player ? "filled" : ""}" data-type="${type}" data-index="${index}" type="button">
      <span class="mini-label">${label}</span>
      <span class="mini-face">${player ? renderAvatar(player) : "+"}</span>
      <span class="mini-name">${player ? escapeHtml(player.nombre) : "Añadir"}</span>
    </button>
  `;
}

function renderRosterCard(type, index, label, player, isCoach = false) {
  return `
    <button class="roster-card ${player ? "filled draggable-card" : "empty"} ${isCoach ? "coach-card" : ""}" data-type="${type}" data-index="${index}" type="button" ${player ? 'draggable="true"' : ""}>
      <span class="roster-label">${escapeHtml(label)}</span>
      <span class="roster-face">${player ? renderAvatar(player) : "+"}</span>
      <span class="roster-name">${player ? escapeHtml(player.nombre) : "Vacío"}</span>
      <span class="roster-meta">${player ? `${type === "bench" ? `#${escapeHtml(getJerseyForTarget(type, index) ?? "?")} · ` : ""}${escapeHtml(player.posicion ?? "?")}` : "Arrastra o clica"}</span>
    </button>
  `;
}

function renderPlayers() {
  if (templateModeValue === "free") {
    playersList.innerHTML = "";
    return;
  }
  const filtered = getFilteredPlayers(searchInput.value, teamFilter.value, positionFilter.value);
  playersList.innerHTML = filtered.map(player => renderChoiceCard(player)).join("");

  playersList.querySelectorAll(".player-card").forEach(card => {
    const player = personajes.find(p => p.nombre === card.dataset.name);
    card.addEventListener("click", () => addToNextFreePlace(player));
    card.addEventListener("dragstart", event => startDragFromLibrary(event, player));
    card.addEventListener("dragend", endDrag);
  });
}

function addToNextFreePlace(player) {
  const firstEmptyStarter = (formaciones[currentFormation] || []).findIndex((_, i) => !placedPlayers[i]);
  if (firstEmptyStarter !== -1) placedPlayers[firstEmptyStarter] = player;
  else {
    const firstEmptyBench = benchPlayers.findIndex(p => !p);
    if (firstEmptyBench !== -1) benchPlayers[firstEmptyBench] = player;
    else return;
  }
  renderAll();
}

function openPicker(type, index) {
  if (templateModeValue === "free") {
    openFreePlayerDialog(type, index);
    return;
  }
  selectedTarget = { type, index };
  const label = targetLabel(type, index);
  selectedSlotInfo.innerHTML = `<strong>Espacio seleccionado:</strong> ${escapeHtml(label)}<br><small>Elige una tarjeta. Si el espacio ya estaba ocupado, se sustituye.</small>`;
  dialogSearch.value = "";
  dialogSelectedTeam = "";
  dialogSelectedPosition = defaultPositionForTarget(type, index);
  if (dialogTeamFilter) dialogTeamFilter.value = "";
  renderDialogPositionChips();
  renderDialogPlayers();
  playerDialog.showModal();
}

function renderDialogPlayers() {
  const query = dialogSearch.value;
  const filtered = getFilteredPlayers(query, dialogSelectedTeam, dialogSelectedPosition).sort(sortForTarget);

  const clearButton = selectedTarget ? `
    <button class="player-card clear-card" type="button" data-clear="true">
      <div class="avatar avatar-fallback">×</div>
      <div>
        <div class="player-name">Vaciar este espacio</div>
        <div class="player-meta">Quita al integrante seleccionado</div>
      </div>
    </button>
  ` : "";

  dialogPlayers.innerHTML = clearButton + filtered.map(player => renderChoiceCard(player, true)).join("");

  dialogPlayers.querySelector("[data-clear='true']")?.addEventListener("click", () => {
    assignTarget(null);
    playerDialog.close();
  });

  dialogPlayers.querySelectorAll(".player-card[data-name]").forEach(card => {
    const player = personajes.find(p => p.nombre === card.dataset.name);
    card.addEventListener("click", () => {
      assignTarget(player);
      playerDialog.close();
    });
    card.addEventListener("dragstart", event => startDragFromLibrary(event, player));
    card.addEventListener("dragend", endDrag);
  });
}

function sortForTarget(a, b) {
  if (!selectedTarget || selectedTarget.type !== "field") return a.nombre.localeCompare(b.nombre);
  const slot = formaciones[currentFormation]?.[selectedTarget.index];
  const aMatch = positionsAreCompatible(a.posicion, slot?.rol) ? -1 : 0;
  const bMatch = positionsAreCompatible(b.posicion, slot?.rol) ? -1 : 0;
  return aMatch - bMatch || a.nombre.localeCompare(b.nombre);
}

function assignTarget(player) {
  if (!selectedTarget) return;
  setTargetPlayer(selectedTarget.type, selectedTarget.index, player);
  renderAll();
}

function getTargetPlayer(type, index) {
  if (type === "field") return placedPlayers[index] || null;
  if (type === "bench") return benchPlayers[index] || null;
  if (type === "manager") return managers[index] || null;
  if (type === "coach") return coach || null;
  return null;
}

function setTargetPlayer(type, index, player) {
  const key = getTargetKey(type, index);
  if (type === "field") {
    if (player) placedPlayers[index] = player;
    else {
      delete placedPlayers[index];
      delete matchStats[key];
    }
  }
  if (type === "bench") {
    benchPlayers[index] = player || null;
    if (!player) delete matchStats[key];
  }
  if (type === "manager") managers[index] = player || null;
  if (type === "coach") coach = player || null;
}

function sameTarget(a, b) {
  return a && b && a.type === b.type && Number(a.index) === Number(b.index);
}

function startDragFromLibrary(event, player) {
  draggedItem = { player, source: null };
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", player.nombre);
  document.body.classList.add("dragging-player");
}

function startDragFromSlot(event, type, index) {
  const player = getTargetPlayer(type, index);
  if (!player) return;

  draggedItem = { player, source: { type, index } };
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", player.nombre);
  document.body.classList.add("dragging-player");
  event.currentTarget.classList.add("drag-source");
}

function endDrag() {
  draggedItem = null;
  document.body.classList.remove("dragging-player");
  document.querySelectorAll(".drop-hover, .drag-source").forEach(el => el.classList.remove("drop-hover", "drag-source"));
}

function moveDraggedItemTo(type, index) {
  if (!draggedItem) return;

  const target = { type, index };
  const source = draggedItem.source;
  const movedPlayer = draggedItem.player;
  const targetPlayer = getTargetPlayer(type, index);

  if (source && sameTarget(source, target)) {
    endDrag();
    return;
  }

  if (source) {
    // Si arrastras entre dos espacios ocupados, intercambia también sus estadísticas de partido.
    const sourceKey = getTargetKey(source.type, source.index);
    const targetKey = getTargetKey(type, index);
    const sourceStats = getStatsForTarget(source.type, source.index);
    const targetStats = getStatsForTarget(type, index);

    setTargetPlayer(source.type, source.index, targetPlayer || null);
    setTargetPlayer(type, index, movedPlayer);

    if (targetPlayer) matchStats[sourceKey] = targetStats;
    else delete matchStats[sourceKey];
    matchStats[targetKey] = sourceStats;
  } else {
    // Desde el menú de personajes se copia, no se borra de la biblioteca.
    setTargetPlayer(type, index, movedPlayer);
  }

  renderAll();
  endDrag();
}

function enableDrop(element) {
  element.addEventListener("dragover", event => {
    if (!draggedItem) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = draggedItem.source ? "move" : "copy";
    element.classList.add("drop-hover");
  });

  element.addEventListener("dragleave", () => element.classList.remove("drop-hover"));

  element.addEventListener("drop", event => {
    if (!draggedItem) return;
    event.preventDefault();
    moveDraggedItemTo(element.dataset.type, Number(element.dataset.index));
  });
}


const POSITION_GROUPS = {
  POR: ["POR", "PT", "PORTERO", "GK"],
  DFC: ["DFC", "DF", "DEF", "DEFENSA", "CENTRAL", "CB"],
  LI: ["LI", "LTI", "LATERAL IZQUIERDO", "LB"],
  LD: ["LD", "LTD", "LATERAL DERECHO", "RB"],
  CAD: ["CAD", "CARRILERO DERECHO", "RWB"],
  CAI: ["CAI", "CARRILERO IZQUIERDO", "LWB"],
  MCD: ["MCD", "CDM", "PIVOTE", "MEDIOCENTRO DEFENSIVO"],
  VOL: ["VOL", "MCD", "MC", "MEDIOCENTRO", "CENTROCAMPISTA", "CDM", "CM", "PIVOTE"],
  MC: ["MC", "VOL", "MCD", "MCO", "MEDIOCENTRO", "CENTROCAMPISTA", "CM", "CDM", "CAM"],
  MCO: ["MCO", "MP", "CAM", "MEDIAPUNTA", "ENGANCHE"],
  MI: ["MI", "LM", "INTERIOR IZQUIERDO", "MEDIO IZQUIERDO"],
  MD: ["MD", "RM", "INTERIOR DERECHO", "MEDIO DERECHO"],
  EI: ["EI", "ED", "EXTREMO", "EXTREMO IZQUIERDO", "LW", "RW"],
  ED: ["ED", "EI", "EXTREMO", "EXTREMO DERECHO", "RW", "LW"],
  SD: ["SD", "SEGUNDO DELANTERO", "MEDIAPUNTA", "MCO", "MP", "CF"],
  DC: ["DC", "DELANTERO", "DELANTERA", "ST", "DEL", "AR"],
  DEL: ["DEL", "DC", "EI", "ED", "SD", "DELANTERO", "DELANTERA", "EXTREMO", "ST", "LW", "RW", "CF"],
  GERENTE: ["GERENTE", "GE", "MANAGER"],
  ENTRENADOR: ["ENTRENADOR", "DT", "COACH"]
};

function positionTokens(value) {
  const raw = normalize(value).toUpperCase().replace(/[^A-Z0-9Ñ]+/g, " ").trim();
  if (!raw) return [];
  const compact = raw.replace(/\s+/g, "");
  const tokens = [raw, compact];
  raw.split(/\s+/).filter(Boolean).forEach(part => tokens.push(part));
  return [...new Set(tokens)];
}

function getPositionAliases(position) {
  const tokens = positionTokens(position);
  const aliases = new Set(tokens);

  tokens.forEach(token => {
    Object.entries(POSITION_GROUPS).forEach(([key, values]) => {
      if (key === token || values.map(v => normalize(v).toUpperCase().replace(/[^A-Z0-9Ñ]+/g, "")).includes(token.replace(/\s+/g, ""))) {
        aliases.add(key);
        values.forEach(value => positionTokens(value).forEach(alias => aliases.add(alias)));
      }
    });
  });

  return aliases;
}

function positionsAreCompatible(playerPosition, targetPosition) {
  if (!targetPosition) return true;
  if (!playerPosition) return false;
  const playerAliases = getPositionAliases(playerPosition);
  const targetAliases = getPositionAliases(targetPosition);
  for (const alias of playerAliases) {
    if (targetAliases.has(alias)) return true;
  }
  return false;
}

function defaultPositionForTarget(type, index) {
  if (type === "manager") return "Gerente";
  if (type === "coach") return "Entrenador";
  if (type !== "field") return "";
  const slot = formaciones[currentFormation]?.[index];
  return slot?.rol ?? "";
}

function targetLabel(type, index) {
  if (type === "field") {
    const slot = formaciones[currentFormation]?.[index];
    return `Titular ${index + 1} · ${slot?.rol ?? "Posición"}`;
  }
  if (type === "bench") return `Banquillo ${index + 1}`;
  if (type === "manager") return `Gerente ${index + 1}`;
  return "Entrenador";
}

function renderChoiceCard(player) {
  return `
    <button class="player-card player-choice" data-name="${escapeHtml(player.nombre)}" draggable="true" type="button">
      ${renderAvatar(player)}
      <div>
        <div class="player-name">${escapeHtml(player.nombre)}</div>
        <div class="player-meta">#${escapeHtml(player.dorsal ?? "?")} · ${escapeHtml(player.posicion ?? "?")} · ${escapeHtml(player.equipo ?? "Sin equipo")}</div>
      </div>
    </button>
  `;
}

function getFilteredPlayers(query, team, position) {
  const q = normalize(query);

  return personajes.filter(player => {
    const haystack = normalize(`${player.nombre} ${player.equipo} ${player.posicion} ${player.raza ?? ""} ${player.estado ?? ""}`);
    const matchesQuery = !q || haystack.includes(q);
    const matchesTeam = !team || player.equipo === team;
    const matchesPosition = !position || positionsAreCompatible(player.posicion, position);
    return matchesQuery && matchesTeam && matchesPosition;
  });
}

function renderAvatar(player) {
  const imageUrl = player?.foto || player?.imagen || player?.imageUrl || player?.url || "";
  if (imageUrl) {
    return `<img class="avatar" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(player.nombre)}" onerror="this.replaceWith(fallbackAvatar('${escapeAttribute(player.nombre)}'))">`;
  }
  return `<div class="avatar avatar-fallback">${initials(player?.nombre ?? "?")}</div>`;
}

function fallbackAvatar(name) {
  const div = document.createElement("div");
  div.className = "avatar avatar-fallback";
  div.textContent = initials(name);
  return div;
}

function initials(name) {
  return String(name || "?").split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function updateBoardTitle() {
  boardEventName.textContent = eventoInput.value.trim() || "Evento sin nombre";
  boardTeamName.textContent = equipoInput.value.trim() || "Equipo sin definir";
  generateOutput();
  saveActiveTemplateState();
}



function openStatsDialog(type, index) {
  const player = getTargetPlayer(type, index);
  if (!player || !statsDialog) return;

  statsSelectedTarget = { type, index };
  const stats = getStatsForTarget(type, index);
  const jersey = getJerseyForTarget(type, index) ?? player.dorsal ?? "?";
  const role = type === "field" ? (formaciones[currentFormation]?.[index]?.rol ?? "Titular") : targetLabel(type, index);

  statsDialogTitle.textContent = `#${jersey} ${player.nombre}`;
  statsDialogMeta.textContent = `${role} · ${player.posicion ?? "?"} · ${player.equipo || "Sin equipo"}`;
  statsGoals.value = String(stats.goals ?? 0);
  statsAssists.value = String(stats.assists ?? 0);
  statsYellow.classList.toggle("active", !!stats.yellow);
  statsRed.classList.toggle("active", !!stats.red);
  statsDialog.showModal();
}

function updateStatsDialogValue(partial) {
  if (!statsSelectedTarget) return;
  setStatsForTarget(statsSelectedTarget.type, statsSelectedTarget.index, partial);
  renderAll();
}

function toggleStatsDialogCard(card) {
  if (!statsSelectedTarget) return;
  const stats = getStatsForTarget(statsSelectedTarget.type, statsSelectedTarget.index);
  const partial = card === "yellow" ? { yellow: !stats.yellow } : { red: !stats.red };
  setStatsForTarget(statsSelectedTarget.type, statsSelectedTarget.index, partial);
  const updated = getStatsForTarget(statsSelectedTarget.type, statsSelectedTarget.index);
  statsYellow.classList.toggle("active", !!updated.yellow);
  statsRed.classList.toggle("active", !!updated.red);
  renderAll();
}

function getStarterEntries() {
  const starters = [];
  formaciones[currentFormation]?.forEach((slot, index) => {
    const player = placedPlayers[index];
    if (player) starters.push({ type: "field", index, slot, player });
  });
  return starters;
}


function getChemistryPresenceEntries() {
  const entries = [];
  formaciones[currentFormation]?.forEach((slot, index) => {
    const player = placedPlayers[index];
    if (player) entries.push({ type: "field", index, slot, player });
  });
  benchPlayers.forEach((player, index) => {
    if (player) entries.push({ type: "bench", index, player });
  });
  managers.forEach((player, index) => {
    if (player) entries.push({ type: "manager", index, player });
  });
  if (coach) entries.push({ type: "coach", index: 0, player: coach });
  return entries;
}

function getActivePresenceEffects() {
  if (!chemistryEnabled) return [];
  const entries = getChemistryPresenceEntries();
  const active = [];

  chemistryRules.efectos.forEach(effect => {
    const sourceEntry = entries.find(entry =>
      normalizePersonName(entry.player?.nombre || "") === effect.fuente &&
      effect.zonas.includes(entry.type)
    );

    if (!sourceEntry) return;

    active.push({
      ...effect,
      source: sourceEntry.player.nombre,
      sourceType: sourceEntry.type,
      sourceIndex: sourceEntry.index,
      sourceLabel: zoneLabel(sourceEntry.type)
    });
  });

  return active;
}

function zoneLabel(zone) {
  if (zone === "field") return "campo";
  if (zone === "bench") return "banquillo";
  if (zone === "manager") return "gerente";
  if (zone === "coach") return "entrenador";
  return zone;
}

function getPresenceEffectsForPlayer(player) {
  const name = normalizePersonName(player?.nombre || "");
  if (!name) return [];
  return getActivePresenceEffects().filter(effect =>
    effect.objetivos.includes("*") || effect.objetivos.includes(name)
  );
}

function getSurname(player) {
  const clean = normalize(player?.nombre || "").replace(/[’']/g, " ");
  const parts = clean.split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function getPlayerNationality(player) {
  return player?.nacionalidad ?? player?.pais ?? player?.seleccion ?? player?.origen ?? "";
}

function getManualRelationship(a, b) {
  const nameA = normalizePersonName(a?.nombre || "");
  const nameB = normalizePersonName(b?.nombre || "");
  if (!nameA || !nameB) return null;

  return chemistryRules.relaciones.find(rel => {
    const [ra, rb] = rel.jugadores;
    return (ra === nameA && rb === nameB) || (ra === nameB && rb === nameA);
  }) || null;
}

function getManualPlayerAdjustment(player) {
  const name = normalizePersonName(player?.nombre || "");
  if (!name) return 0;
  return chemistryRules.ajustes
    .filter(item => item.jugador === name)
    .reduce((total, item) => total + item.puntos, 0);
}


function getManualPlayerAdjustments(player) {
  const name = normalizePersonName(player?.nombre || "");
  if (!name) return [];
  return chemistryRules.ajustes.filter(item => item.jugador === name);
}

function formatSignedPoints(points) {
  const n = Number(points || 0);
  return `${n >= 0 ? "+" : ""}${n}`;
}

function getSpecialRelationshipScore(a, b) {
  const manual = getManualRelationship(a, b);
  if (manual) return manual.puntos;

  const nameA = normalizePersonName(a?.nombre || "");
  const nameB = normalizePersonName(b?.nombre || "");
  const pair = [nameA, nameB].sort().join("|");
  const hardcoded = new Set([
    ["renzu ito", "jeanne d arc"].sort().join("|"),
    ["renzu ito", "wang qing"].sort().join("|"),
    ["jeanne d arc", "wang qing"].sort().join("|"),
    ["dan karman", "serena kitagawa"].sort().join("|"),
    ["akari foster", "jiro yakuin"].sort().join("|"),
  ]);
  if (hardcoded.has(pair)) return 4;

  const rawA = JSON.stringify(a ?? {}).toLowerCase();
  const rawB = JSON.stringify(b ?? {}).toLowerCase();
  if (rawA.includes(nameB) || rawB.includes(nameA)) return 4;
  return 0;
}
function evaluateChemistryLink(a, b) {
  let points = 0;
  const reasons = [];
  if (a.player.equipo && b.player.equipo && a.player.equipo === b.player.equipo) {
    points += 2;
    reasons.push("mismo equipo");
  }
  const surnameA = getSurname(a.player);
  const surnameB = getSurname(b.player);
  if (surnameA && surnameA === surnameB) {
    points += 3;
    reasons.push("familia/apellido");
  }
  const natA = getPlayerNationality(a.player);
  const natB = getPlayerNationality(b.player);
  if (natA && natB && normalize(natA) === normalize(natB)) {
    points += 2;
    reasons.push("misma nacionalidad");
  }
  const manualRelation = getManualRelationship(a.player, b.player);
  const relation = getSpecialRelationshipScore(a.player, b.player);
  if (relation) {
    points += relation;
    reasons.push(manualRelation?.motivo || "relación especial");
  }

  const manualAdjustment = getManualPlayerAdjustment(a.player) + getManualPlayerAdjustment(b.player);
  if (manualAdjustment) {
    points += manualAdjustment;
    reasons.push(`ajuste manual ${formatSignedPoints(manualAdjustment)}`);
  }

  const presenceEffects = [
    ...getPresenceEffectsForPlayer(a.player).map(effect => ({ ...effect, target: a.player.nombre })),
    ...getPresenceEffectsForPlayer(b.player).map(effect => ({ ...effect, target: b.player.nombre }))
  ];

  presenceEffects.forEach(effect => {
    points += effect.puntos;
    reasons.push(`${effect.source} en ${effect.sourceLabel}: ${effect.target} ${formatSignedPoints(effect.puntos)} · ${effect.motivo}`);
  });

  let level = "dead";
  if (points >= 6) level = "perfect";
  else if (points >= 4) level = "strong";
  else if (points >= 2) level = "medium";
  else if (points >= 1) level = "weak";

  return { points, level, reasons };
}

function getChemistryLinks() {
  if (!chemistryEnabled) return [];
  const starters = getStarterEntries();
  const links = [];
  for (let i = 0; i < starters.length; i++) {
    for (let j = i + 1; j < starters.length; j++) {
      const a = starters[i];
      const b = starters[j];
      const dx = a.slot.x - b.slot.x;
      const dy = a.slot.y - b.slot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 31) continue;
      const evaluation = evaluateChemistryLink(a, b);
      links.push({ a, b, distance, ...evaluation });
    }
  }
  return links;
}

function renderSynergySvg() {
  const links = getChemistryLinks();
  if (!links.length) return `<svg class="synergy-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>`;
  return `
    <svg class="synergy-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Líneas de sinergia">
      ${links.map((link, index) => {
        const tooltip = buildChemistryTooltipText(link);
        return `
          <line class="synergy-line synergy-hitbox" x1="${link.a.slot.x}" y1="${link.a.slot.y}" x2="${link.b.slot.x}" y2="${link.b.slot.y}" data-tooltip="${escapeAttribute(tooltip)}"></line>
          <line class="synergy-line synergy-${escapeAttribute(link.level)}" x1="${link.a.slot.x}" y1="${link.a.slot.y}" x2="${link.b.slot.x}" y2="${link.b.slot.y}" data-tooltip="${escapeAttribute(tooltip)}"></line>
        `;
      }).join("")}
    </svg>
  `;
}

function buildChemistryTooltipText(link) {
  const reasons = link.reasons?.length ? link.reasons.map(reason => `• ${reason}`).join("\n") : "• sin conexión especial";
  return `${link.a.player.nombre} ↔ ${link.b.player.nombre}\nQuímica: ${formatSignedPoints(link.points)}\n${reasons}`;
}

function bindChemistryTooltipEvents() {
  if (!chemistryTooltip) return;
  document.querySelectorAll(".synergy-line[data-tooltip]").forEach(line => {
    line.addEventListener("pointerenter", event => showChemistryTooltip(event, line.dataset.tooltip || ""));
    line.addEventListener("pointermove", moveChemistryTooltip);
    line.addEventListener("pointerleave", hideChemistryTooltip);
  });
}

function showChemistryTooltip(event, text) {
  if (!chemistryTooltip) return;
  chemistryTooltip.innerHTML = escapeHtml(text).replaceAll("\n", "<br>");
  chemistryTooltip.classList.add("visible");
  chemistryTooltip.setAttribute("aria-hidden", "false");
  moveChemistryTooltip(event);
}

function moveChemistryTooltip(event) {
  if (!chemistryTooltip) return;
  chemistryTooltip.style.left = `${event.clientX + 14}px`;
  chemistryTooltip.style.top = `${event.clientY + 14}px`;
}

function hideChemistryTooltip() {
  if (!chemistryTooltip) return;
  chemistryTooltip.classList.remove("visible");
  chemistryTooltip.setAttribute("aria-hidden", "true");
}

function getDefaultStats() {
  return { yellow: false, red: false, goals: 0, assists: 0 };
}

function getStatsForTarget(type, index) {
  return { ...getDefaultStats(), ...(matchStats[getTargetKey(type, index)] || {}) };
}

function renderPlayerMatchBadges(type, index) {
  const stats = getStatsForTarget(type, index);
  const goals = Math.max(0, Math.min(4, Number(stats.goals || 0)));
  const assists = Math.max(0, Math.min(4, Number(stats.assists || 0)));
  const cards = [];

  if (stats.yellow) cards.push(`<span class="card-square yellow-card" title="Tarjeta amarilla"></span>`);
  if (stats.red) cards.push(`<span class="card-square red-card" title="Tarjeta roja"></span>`);

  const cardBadge = cards.length
    ? `<span class="player-marker cards-marker" title="Tarjetas">${cards.join("")}</span>`
    : "";

  const goalBadge = goals > 0
    ? `<span class="player-marker goals-marker" title="${goals} gol${goals === 1 ? "" : "es"}"><span class="marker-icon">⚽</span>${goals > 1 ? `<span class="marker-count">${goals}</span>` : ""}</span>`
    : "";

  const assistBadge = assists > 0
    ? `<span class="player-marker assists-marker" title="${assists} asistencia${assists === 1 ? "" : "s"}"><span class="marker-icon">🦶</span>${assists > 1 ? `<span class="marker-count">${assists}</span>` : ""}</span>`
    : "";

  return cardBadge + goalBadge + assistBadge;
}

function setStatsForTarget(type, index, partial) {
  const key = getTargetKey(type, index);
  const current = getStatsForTarget(type, index);
  matchStats[key] = { ...current, ...partial };
  generateOutput();
}

function getMatchLineupEntries() {
  const entries = [];
  formaciones[currentFormation]?.forEach((slot, index) => {
    const player = placedPlayers[index];
    if (player) entries.push({ type: "field", index, player, role: slot.rol, isStarter: true });
  });
  benchPlayers.forEach((player, index) => {
    if (player) entries.push({ type: "bench", index, player, role: `B${index + 1}`, isStarter: false });
  });
  return entries;
}

function renderStatsEditor() {
  const entries = getMatchLineupEntries();
  if (!entries.length) {
    return `
      <section class="stats-editor empty-stats">
        <h3>🎯 Estadísticas del partido</h3>
        <p>Añade jugadores para poder poner goles, asistencias, amarilla o roja.</p>
      </section>
    `;
  }

  return `
    <section class="stats-editor">
      <h3>🎯 Goles, asistencias y tarjetas</h3>
      <div class="stats-grid">
        ${entries.map(entry => renderStatsRow(entry)).join("")}
      </div>
    </section>
  `;
}

function renderStatsRow(entry) {
  const stats = getStatsForTarget(entry.type, entry.index);
  const jersey = getJerseyForTarget(entry.type, entry.index) ?? "?";
  return `
    <div class="stats-row" data-type="${escapeAttribute(entry.type)}" data-index="${escapeAttribute(entry.index)}">
      <div class="stats-player">
        <strong>#${escapeHtml(jersey)} ${escapeHtml(entry.player.nombre)}</strong>
        <span>${escapeHtml(entry.role)} · ${escapeHtml(entry.player.equipo || "Sin equipo")}</span>
      </div>
      <label>⚽
        <select class="stat-goals">
          ${[0,1,2,3,4].map(n => `<option value="${n}" ${stats.goals === n ? "selected" : ""}>${n}</option>`).join("")}
        </select>
      </label>
      <label>🅰️
        <select class="stat-assists">
          ${[0,1,2,3,4].map(n => `<option value="${n}" ${stats.assists === n ? "selected" : ""}>${n}</option>`).join("")}
        </select>
      </label>
      <button class="card-toggle ${stats.yellow ? "active" : ""}" data-card="yellow" type="button">🟨</button>
      <button class="card-toggle ${stats.red ? "active" : ""}" data-card="red" type="button">🟥</button>
    </div>
  `;
}

function bindStatsEditorEvents() {
  teamHud.querySelectorAll(".stats-row").forEach(row => {
    const type = row.dataset.type;
    const index = Number(row.dataset.index);

    row.querySelector(".stat-goals")?.addEventListener("change", event => {
      setStatsForTarget(type, index, { goals: Number(event.target.value) });
    });

    row.querySelector(".stat-assists")?.addEventListener("change", event => {
      setStatsForTarget(type, index, { assists: Number(event.target.value) });
    });

    row.querySelectorAll(".card-toggle").forEach(button => {
      button.addEventListener("click", () => {
        const card = button.dataset.card;
        const stats = getStatsForTarget(type, index);
        if (card === "yellow") setStatsForTarget(type, index, { yellow: !stats.yellow });
        if (card === "red") setStatsForTarget(type, index, { red: !stats.red });
        renderHud();
      });
    });
  });
}

function calculateChemistry() {
  const starters = getStarterEntries();
  if (!chemistryEnabled) {
    return { score: 0, label: "Desactivada", links: 0, perfectLinks: 0, strongLinks: 0, mediumLinks: 0, weakLinks: 0, deadLinks: 0, teams: {} };
  }
  const links = getChemistryLinks();
  const teamCounts = {};
  starters.forEach(entry => {
    const team = entry.player.equipo || "Sin equipo";
    teamCounts[team] = (teamCounts[team] || 0) + 1;
  });

  const totalPoints = links.reduce((total, link) => total + link.points, 0);
  const perfectLinks = links.filter(link => link.level === "perfect").length;
  const strongLinks = links.filter(link => link.level === "strong").length;
  const mediumLinks = links.filter(link => link.level === "medium").length;
  const weakLinks = links.filter(link => link.level === "weak").length;
  const deadLinks = links.filter(link => link.level === "dead").length;
  const starterRatio = starters.length ? starters.length / 11 : 0;
  const maxPoints = Math.max(1, links.length * 8);
  const rawScore = Math.round((totalPoints / maxPoints) * 100);
  const completionPenalty = Math.round(rawScore * starterRatio);
  const score = Math.min(100, Math.max(0, completionPenalty));

  let label = "Baja";
  if (score >= 90) label = "Perfecta";
  else if (score >= 75) label = "Alta";
  else if (score >= 50) label = "Media";

  return { score, label, links: links.length, perfectLinks, strongLinks, mediumLinks, weakLinks, deadLinks, teams: teamCounts };
}

function renderChemistryPanel(chemistry) {
  if (!chemistryEnabled) {
    return `
      <section class="chemistry-panel disabled-chemistry">
        <div class="chemistry-topline">
          <div>
            <h3>🧪 Sinergia de equipo</h3>
            <p>Desactivada para esta plantilla.</p>
          </div>
          <strong>OFF</strong>
        </div>
        <p class="chemistry-help">Usa el botón "Sinergia ON/OFF" para mostrar u ocultar química y líneas.</p>
      </section>
    `;
  }

  const activeEffects = getActivePresenceEffects();

  return `
    <section class="chemistry-panel">
      <div class="chemistry-topline">
        <div>
          <h3>🧪 Sinergia de equipo</h3>
          <p>${escapeHtml(chemistry.label)} · 🟢 ${chemistry.perfectLinks + chemistry.strongLinks} · 🟡 ${chemistry.mediumLinks + chemistry.weakLinks} · 🔴 ${chemistry.deadLinks}</p>
        </div>
        <strong>${chemistry.score}</strong>
      </div>
      <div class="chemistry-bar"><span style="width:${chemistry.score}%"></span></div>
      ${activeEffects.length ? `
        <div class="active-adjustments-mini">
          <b>Efectos activos:</b>
          ${activeEffects.slice(0, 3).map(effect => `<span>${escapeHtml(effect.source)} en ${escapeHtml(effect.sourceLabel)}: ${formatSignedPoints(effect.puntos)} · ${escapeHtml(effect.motivo)}</span>`).join("")}
          ${activeEffects.length > 3 ? `<span>+${activeEffects.length - 3} más…</span>` : ""}
        </div>
      ` : `<p class="chemistry-help">No hay efectos por presencia activos ahora mismo.</p>`}
      <p class="chemistry-help">Pasa el ratón por una línea para ver el motivo. Pulsa "Ver ajustes" para ver efectos de campo, banquillo y gerentes.</p>
    </section>
  `;
}

function getActiveManualRelationships() {
  const starters = getStarterEntries();
  const active = [];
  for (let i = 0; i < starters.length; i++) {
    for (let j = i + 1; j < starters.length; j++) {
      const rel = getManualRelationship(starters[i].player, starters[j].player);
      if (rel) {
        active.push({
          playerA: starters[i].player.nombre,
          playerB: starters[j].player.nombre,
          puntos: rel.puntos,
          nivel: rel.nivel,
          motivo: rel.motivo
        });
      }
    }
  }
  return active;
}

function getActiveIndividualAdjustments() {
  const starters = getStarterEntries();
  const active = [];
  starters.forEach(entry => {
    getManualPlayerAdjustments(entry.player).forEach(item => {
      active.push({ player: entry.player.nombre, puntos: item.puntos, motivo: item.motivo });
    });
  });
  return active;
}

function openChemistryDetailsDialog() {
  if (!chemistryDialog || !chemistryDialogContent) return;
  const chemistry = calculateChemistry();
  const links = getChemistryLinks();
  const manualRelations = getActiveManualRelationships();
  const individualAdjustments = getActiveIndividualAdjustments();
  const presenceEffects = getActivePresenceEffects();

  chemistryDialogSummary.textContent = chemistryEnabled
    ? `Sinergia actual: ${chemistry.score}/100 · ${chemistry.label}. Enlaces visibles: ${links.length}.`
    : "La sinergia está desactivada para esta plantilla.";

  chemistryDialogContent.innerHTML = `
    <section class="chemistry-detail-section">
      <h3>📍 Efectos por presencia activos</h3>
      ${presenceEffects.length ? presenceEffects.map(effect => `
        <div class="chemistry-detail-card ${Number(effect.puntos) >= 0 ? "positive" : "negative"}">
          <strong>${escapeHtml(effect.source)} en ${escapeHtml(effect.sourceLabel)} ${formatSignedPoints(effect.puntos)}</strong>
          <span>Objetivo: ${escapeHtml(effect.objetivos.includes("*") ? "todos" : effect.objetivos.join(", "))}</span>
          <span>${escapeHtml(effect.motivo || "Sin motivo escrito")}</span>
        </div>
      `).join("") : `<p>No hay efectos por presencia activos. Añade entradas en <code>quimica.json</code> dentro de <code>efectos</code>.</p>`}
    </section>

    <section class="chemistry-detail-section">
      <h3>⚙️ Ajustes individuales activos</h3>
      ${individualAdjustments.length ? individualAdjustments.map(item => `
        <div class="chemistry-detail-card ${Number(item.puntos) >= 0 ? "positive" : "negative"}">
          <strong>${escapeHtml(item.player)} ${formatSignedPoints(item.puntos)}</strong>
          <span>${escapeHtml(item.motivo || "Sin motivo escrito")}</span>
        </div>
      `).join("") : `<p>No hay ajustes individuales activos entre titulares.</p>`}
    </section>

    <section class="chemistry-detail-section">
      <h3>🤝 Relaciones manuales activas</h3>
      ${manualRelations.length ? manualRelations.map(item => `
        <div class="chemistry-detail-card ${Number(item.puntos) >= 0 ? "positive" : "negative"}">
          <strong>${escapeHtml(item.playerA)} ↔ ${escapeHtml(item.playerB)} ${formatSignedPoints(item.puntos)}</strong>
          <span>${escapeHtml(item.motivo || "Sin motivo escrito")}</span>
        </div>
      `).join("") : `<p>No hay relaciones manuales activas entre titulares actuales.</p>`}
    </section>

    <section class="chemistry-detail-section">
      <h3>🧪 Líneas visibles</h3>
      ${links.length ? links.map(link => `
        <div class="chemistry-detail-card level-${escapeAttribute(link.level)}">
          <strong>${escapeHtml(link.a.player.nombre)} ↔ ${escapeHtml(link.b.player.nombre)} ${formatSignedPoints(link.points)}</strong>
          ${link.reasons?.length ? link.reasons.map(reason => `<span>${escapeHtml(reason)}</span>`).join("") : `<span>sin conexión especial</span>`}
        </div>
      `).join("") : `<p>No hay líneas visibles. Puede que falten jugadores o estén demasiado lejos.</p>`}
    </section>
  `;

  chemistryDialog.showModal();
}

function formatStatsForPaste(type, index) {
  const stats = getStatsForTarget(type, index);
  const parts = [];
  if (stats.goals > 0) parts.push(`⚽ x${stats.goals}`);
  if (stats.assists > 0) parts.push(`🅰️ x${stats.assists}`);
  if (stats.yellow) parts.push("🟨");
  if (stats.red) parts.push("🟥");
  return parts.length ? ` — ${parts.join(" ")}` : "";
}

function generateOutput() {
  output.value = buildDiscordPaste();
}

function buildDiscordPaste() {
  const eventName = eventoInput.value.trim() || "Evento sin nombre";
  const teamName = equipoInput.value.trim() || "Equipo sin definir";
  const lines = [
    `# ⚽ ${eventName}`,
    `**Equipo:** ${teamName}`,
    `**Formación:** ${currentFormation}`,
    chemistryEnabled ? `**Sinergia:** ${calculateChemistry().score}/100 · ${calculateChemistry().label}` : `**Sinergia:** Desactivada`,
    chemistryEnabled ? `**Enlaces:** 🟢 ${calculateChemistry().perfectLinks + calculateChemistry().strongLinks} · 🟡 ${calculateChemistry().mediumLinks + calculateChemistry().weakLinks} · 🔴 ${calculateChemistry().deadLinks}` : `**Enlaces:** Ocultos`,
    "",
    "## 🟦 TITULARES"
  ];

  formaciones[currentFormation]?.forEach((slot, index) => {
    const player = placedPlayers[index];
    lines.push(player
      ? `${roleIcon(slot.rol)} **${slot.rol}** — ${formatPlayerForPaste(player, getJerseyForTarget("field", index))}${formatStatsForPaste("field", index)}`
      : `${roleIcon(slot.rol)} **${slot.rol}** — *Vacío*`);
  });

  const filledBench = benchPlayers.map((player, index) => ({ player, index })).filter(item => item.player);
  lines.push("", "## 🟨 BANQUILLO");
  if (filledBench.length) {
    filledBench.forEach(({ player, index }) => {
      lines.push(`• ${formatPlayerForPaste(player, getJerseyForTarget("bench", index))}${formatStatsForPaste("bench", index)}`);
    });
  } else {
    lines.push("• *Sin suplentes*");
  }

  const filledManagers = managers.map((player, index) => ({ player, index })).filter(item => item.player);
  lines.push("", "## 🧠 CUERPO TÉCNICO");
  lines.push(`👔 **Entrenador:** ${coach ? coach.nombre : "*Vacío*"}`);
  if (filledManagers.length) {
    filledManagers.forEach(({ player, index }) => {
      lines.push(`📋 **Gerente ${index + 1}:** ${player.nombre}`);
    });
  } else {
    lines.push("📋 **Gerentes:** *Vacío*");
  }

  lines.push("", `> Dorsales generados automáticamente para que no se repitan en el paste.`);
  return lines.join("\n");
}

function formatPlayerForPaste(player, dorsal) {
  const number = dorsal ?? "?";
  const team = player.equipo ? ` · ${player.equipo}` : "";
  return `#${number} **${player.nombre}**${team}`;
}

function roleIcon(role) {
  const pos = normalize(role);
  if (["por", "pt", "gk", "portero"].includes(pos)) return "🧤";
  if (pos.includes("df") || pos.includes("def") || pos === "li" || pos === "ld" || pos === "dfc") return "🛡️";
  if (pos.includes("mc") || pos.includes("md") || pos.includes("mi") || pos.includes("mcd") || pos.includes("mco")) return "⚙️";
  if (pos.includes("dc") || pos.includes("del") || pos.includes("ei") || pos.includes("ed") || pos.includes("ext")) return "⚡";
  return "🔹";
}

function getLineupEntries() {
  const entries = [];
  formaciones[currentFormation]?.forEach((slot, index) => {
    const player = placedPlayers[index];
    if (player) entries.push({ type: "field", index, player, role: slot.rol });
  });
  benchPlayers.forEach((player, index) => {
    if (player) entries.push({ type: "bench", index, player, role: `B${index + 1}` });
  });
  return entries;
}

function getTargetKey(type, index) {
  return `${type}:${Number(index)}`;
}

function getAutoJerseys() {
  const entries = getLineupEntries();
  const assigned = {};
  let nextNumber = 1;

  entries.forEach(entry => {
    assigned[getTargetKey(entry.type, entry.index)] = nextNumber;
    nextNumber += 1;
  });

  return assigned;
}

function getJerseyForTarget(type, index) {
  const player = getTargetPlayer(type, index);
  if (player?.freePlayer && player.dorsal) return player.dorsal;
  return getAutoJerseys()[getTargetKey(type, index)] ?? null;
}

function getPersonKey(player) {
  if (!player) return null;
  if (player.freePlayer) {
    return {
      freePlayer: true,
      nombre: player.nombre || "Jugador libre",
      posicion: player.posicion || "",
      equipo: player.equipo || "Libre",
      dorsal: player.dorsal || "",
      foto: player.foto || player.imagen || player.imageUrl || player.url || ""
    };
  }
  return player.id ?? player.nombre ?? null;
}

function findPersonByKey(key) {
  if (!key) return null;
  if (typeof key === "object") {
    return {
      freePlayer: true,
      nombre: key.nombre || key.name || "Jugador libre",
      posicion: key.posicion || key.position || "",
      equipo: key.equipo || key.team || "Libre",
      dorsal: key.dorsal || key.number || "",
      foto: key.foto || key.imagen || key.imageUrl || key.url || ""
    };
  }
  return personajes.find(player => String(player.id ?? player.nombre) === String(key)) || null;
}

function getTemplateData() {
  generateOutput();
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    eventName: eventoInput.value.trim(),
    teamName: equipoInput.value.trim(),
    formation: currentFormation,
    mode: templateModeValue,
    fieldStyle: fieldStyleValue,
    theme: themeValue,
    zoom: zoomValue,
    templateName: getActiveTemplate()?.name || teamNameOrDefault(),
    starters: Object.fromEntries(
      Object.entries(placedPlayers).map(([index, player]) => [index, getPersonKey(player)])
    ),
    bench: benchPlayers.map(getPersonKey),
    managers: managers.map(getPersonKey),
    coach: getPersonKey(coach),
    stats: matchStats,
    chemistryEnabled,
    text: output.value
  };
}

function exportTemplateJson() {
  const data = getTemplateData();

  const safeName = normalize(`${data.eventName || "plantilla"}-${data.teamName || "equipo"}`)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "plantilla-inazuma";

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  btnExportar.textContent = "Exportado ✅";
  setTimeout(() => btnExportar.textContent = "Exportar JSON", 1400);
}


function encodeTemplateCode(data) {
  const json = JSON.stringify(data);
  return `INAZUMA-CODE:${btoa(unescape(encodeURIComponent(json)))}`;
}

function decodeTemplateCode(text) {
  const match = String(text || "").match(/INAZUMA-CODE:([A-Za-z0-9+/=]+)/);
  if (!match) return null;
  const json = decodeURIComponent(escape(atob(match[1])));
  return JSON.parse(json);
}

async function copyTemplateCode() {
  const code = encodeTemplateCode(getTemplateData());
  await navigator.clipboard.writeText(code);
  btnCopiarCodigo.textContent = "Código copiado ✅";
  setTimeout(() => btnCopiarCodigo.textContent = "Copiar código", 1400);
}

function loadTemplateData(data) {
  isLoadingTemplate = true;
  eventoInput.value = data.eventName ?? data.evento ?? "";
  equipoInput.value = data.teamName ?? data.equipo ?? "";
  templateModeValue = data.mode || data.tipo || "normal";
  fieldStyleValue = data.fieldStyle || data.campo || "classic";
  themeValue = data.theme || data.tema || "ds";
  zoomValue = Number(data.zoom || 100);
  if (templateMode) templateMode.value = templateModeValue;
  if (fieldStyleSelect) fieldStyleSelect.value = fieldStyleValue;
  if (themeSelect) themeSelect.value = themeValue;
  if (zoomRange) zoomRange.value = String(zoomValue);
  applyVisualSettings();

  const importedFormation = data.formation ?? data.formacion;
  if (importedFormation && formaciones[importedFormation]) {
    currentFormation = importedFormation;
    formationSelect.value = importedFormation;
  }

  placedPlayers = {};
  const importedStarters = data.starters ?? data.titulares ?? {};
  Object.entries(importedStarters).forEach(([index, key]) => {
    const player = findPersonByKey(key);
    if (player) placedPlayers[index] = player;
  });

  benchPlayers = Array(BENCH_SIZE).fill(null);
  (data.bench ?? data.banquillo ?? []).slice(0, BENCH_SIZE).forEach((key, index) => {
    benchPlayers[index] = findPersonByKey(key);
  });

  managers = Array(MANAGER_SIZE).fill(null);
  (data.managers ?? data.gerentes ?? []).slice(0, MANAGER_SIZE).forEach((key, index) => {
    managers[index] = findPersonByKey(key);
  });

  coach = findPersonByKey(data.coach ?? data.entrenador);
  matchStats = data.stats ?? data.estadisticas ?? {};
  chemistryEnabled = data.chemistryEnabled ?? data.sinergiaActiva ?? true;
  updateChemistryToggleButton();

  updateBoardTitle();
  renderAll();
  isLoadingTemplate = false;
}

function importTemplateFromPaste() {
  try {
    const data = decodeTemplateCode(output.value);
    if (!data) {
      alert("Pega en la caja un código que empiece por INAZUMA-CODE:");
      return;
    }
    loadTemplateData(data);
    btnImportarPaste.textContent = "Paste importado ✅";
    setTimeout(() => btnImportarPaste.textContent = "Importar paste", 1400);
  } catch (error) {
    console.error(error);
    alert("No he podido importar ese paste. Revisa que el código INAZUMA-CODE esté completo.");
  }
}

async function importTemplateJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    loadTemplateData(data);

    btnImportar.textContent = "Importado ✅";
    setTimeout(() => btnImportar.textContent = "Importar JSON", 1400);
  } catch (error) {
    console.error(error);
    alert("No he podido importar ese JSON. Revisa que sea una plantilla exportada desde esta herramienta.");
  } finally {
    event.target.value = "";
  }
}

async function copyTemplate() {
  generateOutput();
  await navigator.clipboard.writeText(output.value);
  btnCopiar.textContent = "Copiado ✅";
  setTimeout(() => btnCopiar.textContent = "Copiar Discord", 1400);
}

function clearBoard() {
  placedPlayers = {};
  benchPlayers = Array(BENCH_SIZE).fill(null);
  managers = Array(MANAGER_SIZE).fill(null);
  coach = null;
  matchStats = {};
  renderAll();
}


function teamNameOrDefault() {
  return equipoInput?.value?.trim() || eventoInput?.value?.trim() || "Plantilla";
}

function getActiveTemplate() {
  return templates.find(template => template.id === activeTemplateId) || null;
}

function collectCurrentTemplateData() {
  return {
    version: 3,
    id: activeTemplateId,
    name: getActiveTemplate()?.name || teamNameOrDefault(),
    eventName: eventoInput.value.trim(),
    teamName: equipoInput.value.trim(),
    formation: currentFormation,
    mode: templateModeValue,
    fieldStyle: fieldStyleValue,
    theme: themeValue,
    zoom: zoomValue,
    starters: Object.fromEntries(Object.entries(placedPlayers).map(([index, player]) => [index, getPersonKey(player)])),
    bench: benchPlayers.map(getPersonKey),
    managers: managers.map(getPersonKey),
    coach: getPersonKey(coach),
    stats: matchStats,
    chemistryEnabled,
    text: output?.value || ""
  };
}

function saveActiveTemplateState() {
  if (isLoadingTemplate || !activeTemplateId) return;
  const template = getActiveTemplate();
  if (!template) return;
  const data = collectCurrentTemplateData();
  Object.assign(template, data);
  template.name = (equipoInput.value.trim() || eventoInput.value.trim() || template.name || "Plantilla").slice(0, 42);
  renderTemplateSelect();
}

function initTemplateSystem() {
  templates = [{
    id: `tpl-${Date.now()}`,
    name: "Plantilla 1",
    eventName: "",
    teamName: "",
    formation: currentFormation || Object.keys(formaciones)[0],
    mode: "normal",
    fieldStyle: "classic",
    theme: "ds",
    zoom: 100,
    starters: {},
    bench: Array(BENCH_SIZE).fill(null),
    managers: Array(MANAGER_SIZE).fill(null),
    coach: null,
    stats: {},
    chemistryEnabled: true
  }];
  activeTemplateId = templates[0].id;
  renderTemplateSelect();
  applyVisualSettings();
}

function renderTemplateSelect() {
  if (!templateSelect) return;
  const currentValue = templateSelect.value || activeTemplateId;
  templateSelect.innerHTML = templates.map(template => `<option value="${escapeAttribute(template.id)}">${escapeHtml(template.name || "Plantilla")}</option>`).join("");
  templateSelect.value = templates.some(t => t.id === currentValue) ? currentValue : activeTemplateId;
}

function switchTemplate(id) {
  if (!id || id === activeTemplateId) return;
  saveActiveTemplateState();
  activeTemplateId = id;
  const template = getActiveTemplate();
  if (template) loadTemplateData(template);
  renderTemplateSelect();
}

function createNewTemplate() {
  saveActiveTemplateState();
  const count = templates.length + 1;
  const template = {
    id: `tpl-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: `Plantilla ${count}`,
    eventName: "",
    teamName: "",
    formation: currentFormation || Object.keys(formaciones)[0],
    mode: templateModeValue || "normal",
    fieldStyle: fieldStyleValue || "classic",
    theme: themeValue || "ds",
    zoom: zoomValue || 100,
    starters: {},
    bench: Array(BENCH_SIZE).fill(null),
    managers: Array(MANAGER_SIZE).fill(null),
    coach: null,
    stats: {},
    chemistryEnabled: true
  };
  templates.push(template);
  activeTemplateId = template.id;
  loadTemplateData(template);
  renderTemplateSelect();
}

function duplicateTemplate() {
  saveActiveTemplateState();
  const base = getActiveTemplate();
  if (!base) return;
  const copy = JSON.parse(JSON.stringify(base));
  copy.id = `tpl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  copy.name = `${base.name || "Plantilla"} copia`;
  templates.push(copy);
  activeTemplateId = copy.id;
  loadTemplateData(copy);
  renderTemplateSelect();
}

function deleteTemplate() {
  if (templates.length <= 1) {
    alert("Debe existir al menos una plantilla.");
    return;
  }
  const template = getActiveTemplate();
  if (!confirm(`¿Borrar ${template?.name || "esta plantilla"}?`)) return;
  templates = templates.filter(item => item.id !== activeTemplateId);
  activeTemplateId = templates[0].id;
  loadTemplateData(templates[0]);
  renderTemplateSelect();
}


function switchTemplateByOffset(offset) {
  if (!templates.length) return;
  saveActiveTemplateState();
  const currentIndex = Math.max(0, templates.findIndex(template => template.id === activeTemplateId));
  const nextIndex = (currentIndex + offset + templates.length) % templates.length;
  switchTemplate(templates[nextIndex].id);
}

function bindLayoutTools() {
  templateSelect?.addEventListener("change", () => switchTemplate(templateSelect.value));
  btnNuevaPlantilla?.addEventListener("click", createNewTemplate);
  btnDuplicarPlantilla?.addEventListener("click", duplicateTemplate);
  btnBorrarPlantilla?.addEventListener("click", deleteTemplate);
  btnPlantillaAnterior?.addEventListener("click", () => switchTemplateByOffset(-1));
  btnPlantillaSiguiente?.addEventListener("click", () => switchTemplateByOffset(1));

  templateMode?.addEventListener("change", () => {
    templateModeValue = templateMode.value;
    applyVisualSettings();
    renderPlayers();
    saveActiveTemplateState();
  });
  fieldStyleSelect?.addEventListener("change", () => {
    fieldStyleValue = fieldStyleSelect.value;
    applyVisualSettings();
    saveActiveTemplateState();
  });
  themeSelect?.addEventListener("change", () => {
    themeValue = themeSelect.value;
    applyVisualSettings();
    saveActiveTemplateState();
  });
  zoomRange?.addEventListener("input", () => {
    zoomValue = Number(zoomRange.value || 100);
    applyVisualSettings();
    saveActiveTemplateState();
  });

  quickCopiar?.addEventListener("click", () => btnCopiar?.click());
  quickCodigo?.addEventListener("click", () => btnCopiarCodigo?.click());
  quickExportar?.addEventListener("click", () => btnExportar?.click());
  quickImportar?.addEventListener("click", () => btnImportar?.click());
  quickFullscreen?.addEventListener("click", () => document.body.classList.toggle("focus-field"));
  document.addEventListener("keydown", event => {
    if (event.target && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
    if (event.key === "ArrowLeft") switchTemplateByOffset(-1);
    if (event.key === "ArrowRight") switchTemplateByOffset(1);
  });

  [freeName, freePosition, freeNumber, freeImage, freeTeam].forEach(input => input?.addEventListener("input", updateFreePreview));
  freeSave?.addEventListener("click", saveFreePlayer);
  freeRemove?.addEventListener("click", () => {
    if (!freeSelectedTarget) return;
    setTargetPlayer(freeSelectedTarget.type, freeSelectedTarget.index, null);
    freePlayerDialog?.close();
    renderAll();
  });
  freeClose?.addEventListener("click", () => freePlayerDialog?.close());
}

function applyVisualSettings() {
  document.body.classList.toggle("mode-free", templateModeValue === "free");
  document.body.classList.remove("theme-go", "theme-victory", "theme-dark", "theme-aero");
  if (themeValue && themeValue !== "ds") document.body.classList.add(`theme-${themeValue}`);
  document.documentElement.style.setProperty("--field-zoom", String((Number(zoomValue) || 100) / 100));
  const board = document.getElementById("board");
  if (board) {
    board.className = board.className.split(" ").filter(cls => !cls.startsWith("field-")).join(" ");
    board.classList.add(`field-${fieldStyleValue || "classic"}`);
  }
}

function openFreePlayerDialog(type, index) {
  freeSelectedTarget = { type, index };
  const current = getTargetPlayer(type, index);
  if (freeSlotInfo) freeSlotInfo.textContent = `Hueco seleccionado: ${targetLabel(type, index)}`;
  if (freeName) freeName.value = current?.nombre || "";
  if (freePosition) freePosition.value = current?.posicion || (type === "field" ? (formaciones[currentFormation]?.[index]?.rol || "") : "");
  if (freeNumber) freeNumber.value = current?.dorsal || "";
  if (freeImage) freeImage.value = current?.foto || current?.imagen || current?.imageUrl || current?.url || "";
  if (freeTeam) freeTeam.value = current?.equipo || equipoInput.value.trim() || "Rival temporal";
  updateFreePreview();
  freePlayerDialog?.showModal();
}

function updateFreePreview() {
  if (!freePreview) return;
  const name = freeName?.value?.trim() || "Jugador libre";
  const image = freeImage?.value?.trim();
  const pos = freePosition?.value?.trim() || "Posición";
  if (image) {
    freePreview.innerHTML = `<img src="${escapeAttribute(image)}" alt="${escapeAttribute(name)}" onerror="this.remove()"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(pos)}</span>`;
  } else {
    freePreview.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${escapeHtml(pos)}</span>`;
  }
}

function saveFreePlayer() {
  if (!freeSelectedTarget) return;
  const player = {
    freePlayer: true,
    nombre: freeName?.value?.trim() || "Jugador libre",
    posicion: freePosition?.value?.trim() || "",
    dorsal: freeNumber?.value?.trim() || "",
    foto: freeImage?.value?.trim() || "",
    equipo: freeTeam?.value?.trim() || "Libre"
  };
  setTargetPlayer(freeSelectedTarget.type, freeSelectedTarget.index, player);
  freePlayerDialog?.close();
  renderAll();
}

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(text) {
  return escapeHtml(text).replaceAll("'", "&#039;");
}

// --- Soporte táctil / pointer-based drag & drop mejorado ---
function initPointerDrag() {
  const state = { active: false, ghost: null, longPressTimer: null, startX: 0, startY: 0, moved: false };

  function findPlayerByElement(el) {
    const name = el.dataset.name;
    if (name) return personajes.find(p => p.nombre === name) || findPersonByKey(name);
    return null;
  }

  function startDragImmediate(el, e, source) {
    const player = source ? getTargetPlayer(source.type, source.index) : findPlayerByElement(el) || null;
    if (!player) return;

    draggedItem = { player, source };
    document.body.classList.add('dragging-player');
    if (source && el) el.classList.add('drag-source');
    document.body.style.overflow = 'hidden';

    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.position = 'fixed';
    ghost.style.left = (e.clientX - rect.width / 2) + 'px';
    ghost.style.top = (e.clientY - rect.height / 2) + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.zIndex = 9999;
    ghost.style.pointerEvents = 'none';
    document.body.appendChild(ghost);

    state.active = true;
    state.ghost = ghost;
  }

  function onPointerMove(e) {
    if (state.longPressTimer && !state.moved) {
      const dx = Math.abs(e.clientX - state.startX);
      const dy = Math.abs(e.clientY - state.startY);
      if (dx > 8 || dy > 8) {
        // user moved finger: cancel long-press and start drag
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
        state.moved = true;
        const el = e.target.closest('[draggable="true"], .draggable-card, .player-card, .player-choice, .magnet.filled, .roster-card.filled, .mini-slot.filled');
        if (el) startDragImmediate(el, e, el.dataset.type !== undefined && el.dataset.index !== undefined ? { type: el.dataset.type, index: Number(el.dataset.index) } : null);
      }
    }

    if (!state.active || !state.ghost) return;
    state.ghost.style.left = (e.clientX - state.ghost.offsetWidth / 2) + 'px';
    state.ghost.style.top = (e.clientY - state.ghost.offsetHeight / 2) + 'px';

    // auto-scroll when near edges
    const margin = 60;
    if (e.clientY < margin) window.scrollBy({ top: -20, behavior: 'smooth' });
    else if (window.innerHeight - e.clientY < margin) window.scrollBy({ top: 20, behavior: 'smooth' });

    // highlight drop target under pointer
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const drop = under ? under.closest('[data-type][data-index]') : null;
    document.querySelectorAll('.drop-hover').forEach(x => x.classList.remove('drop-hover'));
    if (drop) drop.classList.add('drop-hover');
  }

  function finishPointerDrag(e) {
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
      // treat as tap: open picker if tapping a slot/magnet
      const tapEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.magnet, .mini-slot, .roster-card, .slot, [data-type]');
      if (tapEl) {
        const type = tapEl.dataset.type ?? tapEl.closest('[data-type]')?.dataset.type;
        const idx = tapEl.dataset.index ?? tapEl.closest('[data-index]')?.dataset.index;
        if (type !== undefined && idx !== undefined) openPicker(type, Number(idx));
      }
    }

    if (!state.active) return;

    const under = document.elementFromPoint(e.clientX, e.clientY);
    const drop = under ? under.closest('[data-type][data-index]') : null;
    if (drop && draggedItem) moveDraggedItemTo(drop.dataset.type, Number(drop.dataset.index));
    else endDrag();

    if (state.ghost && state.ghost.parentNode) state.ghost.parentNode.removeChild(state.ghost);
    state.active = false;
    state.ghost = null;
    state.moved = false;
    document.body.style.overflow = '';
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', finishPointerDrag);
    document.body.classList.remove('dragging-player');
    document.querySelectorAll('.drop-hover, .drag-source').forEach(el => el.classList.remove('drop-hover', 'drag-source'));
  }

  document.addEventListener('pointerdown', function start(e) {
    const el = e.target.closest('[draggable="true"], .draggable-card, .player-card, .player-choice, .magnet.filled, .roster-card.filled, .mini-slot.filled, .magnet');
    if (!el) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // For touch, implement long-press to open picker; start drag only after move or for mouse immediately
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.moved = false;

    if (e.pointerType === 'mouse') {
      e.preventDefault();
      const source = el.dataset.type !== undefined && el.dataset.index !== undefined ? { type: el.dataset.type, index: Number(el.dataset.index) } : null;
      startDragImmediate(el, e, source);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', finishPointerDrag);
      return;
    }

    // touch / pen
    state.longPressTimer = setTimeout(() => {
      state.longPressTimer = null;
      // if user long-presses a magnet/slot, open the picker instead of starting a drag
      const slotEl = el.closest('.magnet, .mini-slot, .roster-card, .slot, [data-type]');
      if (slotEl) {
        const type = slotEl.dataset.type ?? slotEl.closest('[data-type]')?.dataset.type;
        const idx = slotEl.dataset.index ?? slotEl.closest('[data-index]')?.dataset.index;
        if (type !== undefined && idx !== undefined) {
          openPicker(type, Number(idx));
          return;
        }
      }
    }, 450);

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', finishPointerDrag);
  }, { passive: false });
}

// Inicializar soporte pointer al arrancar
initPointerDrag();

// Welcome animation trigger: remove overlay after animation completes
function playWelcomeAnimation() {
  const overlay = document.getElementById('welcomeOverlay');
  const welcomeMsg = document.getElementById('welcomeMsg');
  const welcomeSub = document.getElementById('welcomeSub');
  const skip = document.getElementById('skipIntro');
  if (!overlay) return;

  // allow skipping
  if (skip) skip.addEventListener('click', () => {
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 500);
  });

  // show dynamic welcome message after main animation
  requestAnimationFrame(() => {
    const team = (document.getElementById('equipoInput')?.value || document.getElementById('boardTeamName')?.textContent || '').trim();
    const nameText = team ? `¡Bienvenido, ${team}!` : '¡Bienvenido, entrenador!';

    // after primary animation (ball fly) show welcome message
    const primary = 1400;
    setTimeout(() => {
      if (welcomeSub) welcomeSub.style.opacity = '0';
      if (welcomeMsg) {
        welcomeMsg.textContent = nameText;
        welcomeMsg.classList.add('show');
        welcomeMsg.setAttribute('aria-hidden', 'false');
      }
    }, primary);

    // total display time (primary + message): then hide
    const total = primary + 1600;
    setTimeout(() => {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 700);
    }, total);
  });
}

window.addEventListener('load', () => playWelcomeAnimation());
