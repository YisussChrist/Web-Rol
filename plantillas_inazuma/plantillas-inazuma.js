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
const btnLimpiar = document.getElementById("btnLimpiar");
const btnVista = document.getElementById("btnVista");
const btnExportar = document.getElementById("btnExportar");
const btnImportar = document.getElementById("btnImportar");
const importFile = document.getElementById("importFile");
const teamHud = document.getElementById("teamHud");
const benchPanel = document.getElementById("benchPanel");
const managersPanel = document.getElementById("managersPanel");

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
let chemistryRules = { relaciones: [], ajustes: [] };
let chemistryEnabled = true;

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
  const empty = { relaciones: [], ajustes: [] };
  if (!data || typeof data !== "object") return empty;

  const relaciones = [];
  const ajustes = [];

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

  return { relaciones, ajustes };
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
  const aMatch = normalize(a.posicion) === normalize(slot?.rol) ? -1 : 0;
  const bMatch = normalize(b.posicion) === normalize(slot?.rol) ? -1 : 0;
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

function defaultPositionForTarget(type, index) {
  if (type !== "field") return "";
  const slot = formaciones[currentFormation]?.[index];
  const slotRole = slot?.rol ?? "";
  const exists = personajes.some(player => normalize(player.posicion) === normalize(slotRole));
  return exists ? personajes.find(player => normalize(player.posicion) === normalize(slotRole)).posicion : "";
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
    const matchesPosition = !position || player.posicion === position;
    return matchesQuery && matchesTeam && matchesPosition;
  });
}

function renderAvatar(player) {
  if (player?.foto) {
    return `<img class="avatar" src="${escapeHtml(player.foto)}" alt="${escapeHtml(player.nombre)}" onerror="this.replaceWith(fallbackAvatar('${escapeAttribute(player.nombre)}'))">`;
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
    reasons.push("ajuste manual");
  }

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
    <svg class="synergy-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${links.map(link => `
        <line class="synergy-line synergy-${escapeAttribute(link.level)}" x1="${link.a.slot.x}" y1="${link.a.slot.y}" x2="${link.b.slot.x}" y2="${link.b.slot.y}">
          <title>${escapeHtml(link.a.player.nombre)} + ${escapeHtml(link.b.player.nombre)} · ${escapeHtml(link.reasons.join(", ") || "sin conexión")}</title>
        </line>
      `).join("")}
    </svg>
  `;
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
      <p class="chemistry-help">Valora equipo, apellido/familia, nacionalidad y relaciones especiales de quimica.json. Verde = química top; rojo = no conectan.</p>
    </section>
  `;
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
  return getAutoJerseys()[getTargetKey(type, index)] ?? null;
}

function getPersonKey(player) {
  if (!player) return null;
  return player.id ?? player.nombre ?? null;
}

function findPersonByKey(key) {
  if (!key) return null;
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
  eventoInput.value = data.eventName ?? data.evento ?? "";
  equipoInput.value = data.teamName ?? data.equipo ?? "";

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
