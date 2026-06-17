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

const BENCH_SIZE = 10;
const MANAGER_SIZE = 3;

let formaciones = {};
let personajes = [];
let currentFormation = "";
let placedPlayers = {};
let benchPlayers = Array(BENCH_SIZE).fill(null);
let managers = Array(MANAGER_SIZE).fill(null);
let coach = null;
let selectedTarget = null;
let draggedItem = null;
let dialogSelectedTeam = "";
let dialogSelectedPosition = "";

init();

async function init() {
  const [formacionesRes, personajesRes] = await Promise.all([
    fetch("formaciones.json"),
    fetch("personajes.json")
  ]);

  formaciones = await formacionesRes.json();
  personajes = await personajesRes.json();

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
  renderAll();
}

function renderAll() {
  renderSlots();
  renderHud();
  generateOutput();
}

function renderSlots() {
  const formation = formaciones[currentFormation] || [];
  slotsContainer.innerHTML = "";

  formation.forEach((slot, index) => {
    const player = placedPlayers[index];
    const slotEl = document.createElement("div");
    slotEl.className = "slot";
    slotEl.style.left = `${slot.x}%`;
    slotEl.style.top = `${slot.y}%`;

    slotEl.innerHTML = `
      <div class="magnet ${player ? "filled draggable-card" : "empty"}" data-index="${index}" ${player ? 'draggable="true"' : ""}>
        ${player ? renderAvatar(player) : `<span class="slot-role">${escapeHtml(slot.rol)}</span>`}
        ${player ? `<span class="slot-number">${escapeHtml(getJerseyForTarget("field", index) ?? "?")}</span>` : ""}
      </div>
      <div class="slot-role">${escapeHtml(slot.rol)}</div>
      <div class="slot-name">${player ? escapeHtml(player.nombre) : "Vacío"}</div>
    `;

    const magnet = slotEl.querySelector(".magnet");
    magnet.addEventListener("click", () => openPicker("field", index));
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
    teamHud.innerHTML = `
      <div class="hud-summary compact-summary">
        <div><strong>${starters}</strong><span>Titulares</span></div>
        <div><strong>${benchCount}/${BENCH_SIZE}</strong><span>Banquillo</span></div>
        <div><strong>${managerCount}/${MANAGER_SIZE}</strong><span>Gerentes</span></div>
        <div><strong>${coach ? "1" : "0"}/1</strong><span>Entrenador</span></div>
      </div>
      <p class="hud-tip">Puedes clicar una tarjeta o arrastrar jugadores desde el menú hacia campo, banquillo, gerentes o entrenador.</p>
    `;
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
    card.addEventListener("click", () => openPicker(type, index));
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
  if (type === "field") {
    if (player) placedPlayers[index] = player;
    else delete placedPlayers[index];
  }
  if (type === "bench") benchPlayers[index] = player || null;
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
    // Si arrastras entre dos espacios ocupados, intercambia. Si el destino está vacío, mueve y limpia el origen.
    setTargetPlayer(source.type, source.index, targetPlayer || null);
    setTargetPlayer(type, index, movedPlayer);
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
    "",
    "## 🟦 TITULARES"
  ];

  formaciones[currentFormation]?.forEach((slot, index) => {
    const player = placedPlayers[index];
    lines.push(player
      ? `${roleIcon(slot.rol)} **${slot.rol}** — ${formatPlayerForPaste(player, getJerseyForTarget("field", index))}`
      : `${roleIcon(slot.rol)} **${slot.rol}** — *Vacío*`);
  });

  const filledBench = benchPlayers.map((player, index) => ({ player, index })).filter(item => item.player);
  lines.push("", "## 🟨 BANQUILLO");
  if (filledBench.length) {
    filledBench.forEach(({ player, index }) => {
      lines.push(`• ${formatPlayerForPaste(player, getJerseyForTarget("bench", index))}`);
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
