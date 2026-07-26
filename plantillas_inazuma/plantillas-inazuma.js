(() => {
  'use strict';

  const DATA = window.INAZUMA_TEAM_BUILDER_DATA;
  if (!DATA?.players?.length || !Object.keys(DATA.formations || {}).length) {
    document.body.innerHTML = '<main style="max-width:760px;margin:80px auto;padding:30px;color:white;font-family:system-ui"><h1>No se han podido leer los datos</h1><p>Comprueba que <b>team-builder-datos.js</b> está junto a esta página.</p><a href="../index.html" style="color:#60e5ff">Volver al HUB</a></main>';
    return;
  }

  const $ = id => document.getElementById(id);
  const dom = {
    saveState: $('saveState'), squadSelect: $('squadSelect'), previousSquad: $('previousSquad'), nextSquad: $('nextSquad'),
    newSquad: $('newSquad'), duplicateSquad: $('duplicateSquad'), deleteSquad: $('deleteSquad'), formationSelect: $('formationSelect'),
    formationDisplay: $('formationDisplay'), undoButton: $('undoButton'), redoButton: $('redoButton'), chemistryButton: $('chemistryButton'),
    focusButton: $('focusButton'), copyButton: $('copyButton'), copyCodeButton: $('copyCodeButton'), draftButton: $('draftButton'),
    techniqueButton: $('techniqueButton'), clearButton: $('clearButton'), exportButton: $('exportButton'), importButton: $('importButton'), importFile: $('importFile'),
    teamName: $('teamName'), eventName: $('eventName'), playerSearch: $('playerSearch'), teamFilter: $('teamFilter'),
    positionFilters: $('positionFilters'), playerCount: $('playerCount'), playerLibrary: $('playerLibrary'),
    field: $('field'), fieldSlots: $('fieldSlots'), chemistryLayer: $('chemistryLayer'), benchSlots: $('benchSlots'), staffSlots: $('staffSlots'),
    chemistryScore: $('chemistryScore'), scoreRing: $('scoreRing'), chemistryLabel: $('chemistryLabel'), filledMetric: $('filledMetric'),
    fitMetric: $('fitMetric'), linksMetric: $('linksMetric'), teamsMetric: $('teamsMetric'), recommendations: $('recommendations'),
    relationshipList: $('relationshipList'), lineupList: $('lineupList'), pickerDialog: $('pickerDialog'), pickerTitle: $('pickerTitle'),
    pickerSearch: $('pickerSearch'), pickerFilters: $('pickerFilters'), pickerPlayers: $('pickerPlayers'), playerDialog: $('playerDialog'),
    playerDialogTitle: $('playerDialogTitle'), playerDialogBody: $('playerDialogBody'), draftDialog: $('draftDialog'), codeDialog: $('codeDialog'),
    codeArea: $('codeArea'), copyCodeFromDialog: $('copyCodeFromDialog'), loadCodeButton: $('loadCodeButton'), toast: $('toast'),
    techniqueDialog: $('techniqueDialog'), techniqueName: $('techniqueName'), techniquePlayerA: $('techniquePlayerA'),
    techniquePlayerB: $('techniquePlayerB'), techniqueType: $('techniqueType'), techniqueGrade: $('techniqueGrade'),
    techniqueDescription: $('techniqueDescription'), techniqueOutput: $('techniqueOutput'), generateTechnique: $('generateTechnique'), copyTechnique: $('copyTechnique')
  };

  const STORAGE_KEY = 'inazuma_centro_tactico_v7';
  const BENCH_SIZE = 7;
  const STAFF_SIZE = 3;
  const playerById = new Map(DATA.players.map(player => [player.id, player]));
  const playerByName = new Map(DATA.players.map(player => [normalize(player.name), player]));
  const formationNames = Object.keys(DATA.formations);
  const fieldPlayers = DATA.players.filter(player => !['ENT', 'GER'].includes(player.position));
  const staffPlayers = DATA.players.filter(player => ['ENT', 'GER'].includes(player.position));
  const relationMeta = DATA.chemistry.tiposRelaciones || {};
  const relationGroups = {
    parejas: 'pareja', exparejas: 'expareja', padres: 'familia', hermanos: 'familia', primos: 'familia',
    mejoresAmigos: 'amistad', rivales: 'rivalidad', relaciones: 'amistad'
  };
  const relationships = Object.entries(relationGroups).flatMap(([group, fallbackType]) =>
    (DATA.chemistry[group] || []).filter(item => item?.jugadores?.length >= 2).map(item => ({
      a: normalize(item.jugadores[0]), b: normalize(item.jugadores[1]), points: Number(item.puntos) || 0,
      type: item.tipo || fallbackType, reason: item.motivo || relationMeta[item.tipo || fallbackType]?.descripcion || group
    }))
  );

  let state = loadState();
  let history = [];
  let future = [];
  let libraryPosition = 'all';
  let pickerTarget = null;
  let pickerPosition = 'recommended';
  let toastTimer = null;
  let dragPayload = null;

  function normalize(value = '') {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function uid(prefix = 'squad') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function defaultFormation() {
    return DATA.formations['4-3-3'] ? '4-3-3' : formationNames[0];
  }

  function createSquad(name = 'Nuevo equipo') {
    return {
      id: uid(), name, event: '', formation: defaultFormation(), starters: Array(11).fill(null),
      bench: Array(BENCH_SIZE).fill(null), staff: Array(STAFF_SIZE).fill(null), captain: null, stats: {}, techniques: []
    };
  }

  function cleanSquad(squad) {
    const formation = DATA.formations[squad?.formation] ? squad.formation : defaultFormation();
    const valid = value => playerById.has(value) ? value : resolvePlayerKey(value);
    const startersSource = Array.isArray(squad?.starters) ? squad.starters : Object.keys(squad?.starters || {}).sort((a, b) => Number(a) - Number(b)).map(key => squad.starters[key]);
    const staffSource = [...(squad?.staff || squad?.managers || []), squad?.coach].filter(Boolean);
    return {
      id: squad?.id || uid(), name: squad?.name || squad?.teamName || 'Plantilla recuperada', event: squad?.event || squad?.eventName || '',
      formation, starters: Array.from({ length: 11 }, (_, index) => valid(startersSource[index]) || null),
      bench: Array.from({ length: BENCH_SIZE }, (_, index) => valid(squad?.bench?.[index]) || null),
      staff: Array.from({ length: STAFF_SIZE }, (_, index) => valid(staffSource[index]) || null),
      captain: valid(squad?.captain) || null, stats: squad?.stats && typeof squad.stats === 'object' ? squad.stats : {},
      techniques: Array.isArray(squad?.techniques) ? squad.techniques : []
    };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored?.squads?.length) {
        const squads = stored.squads.map(cleanSquad);
        return { version: 7, activeSquadId: squads.some(s => s.id === stored.activeSquadId) ? stored.activeSquadId : squads[0].id, chemistryVisible: stored.chemistryVisible !== false, squads };
      }
    } catch (error) {}
    const first = createSquad();
    return { version: 7, activeSquadId: first.id, chemistryVisible: true, squads: [first] };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      dom.saveState.innerHTML = '<i></i> Guardado local';
    } catch (error) {
      dom.saveState.textContent = 'No se pudo guardar';
    }
  }

  function activeSquad() {
    return state.squads.find(squad => squad.id === state.activeSquadId) || state.squads[0];
  }

  function commit(mutator, message = '') {
    const before = JSON.stringify(state);
    mutator();
    if (JSON.stringify(state) === before) return;
    history.push(before);
    if (history.length > 35) history.shift();
    future = [];
    saveState();
    renderAll();
    if (message) showToast(message);
  }

  function undo() {
    if (!history.length) return;
    future.push(JSON.stringify(state));
    state = JSON.parse(history.pop());
    saveState();
    renderAll();
    showToast('Movimiento deshecho');
  }

  function redo() {
    if (!future.length) return;
    history.push(JSON.stringify(state));
    state = JSON.parse(future.pop());
    saveState();
    renderAll();
    showToast('Movimiento rehecho');
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2200);
  }

  function positionGroup(position) {
    if (position === 'POR') return 'POR';
    if (['DFC', 'LD', 'LI'].includes(position)) return 'DEF';
    if (['MCD', 'MC', 'MCO', 'MI', 'MD'].includes(position)) return 'MED';
    if (['DC', 'EI', 'ED'].includes(position)) return 'ATA';
    return 'STAFF';
  }

  function positionFit(playerPosition, slotRole) {
    if (!playerPosition || !slotRole) return 0;
    if (playerPosition === slotRole) return 100;
    const playerGroup = positionGroup(playerPosition);
    const slotGroup = positionGroup(slotRole);
    if (playerGroup === slotGroup) {
      if (['LI', 'LD'].includes(playerPosition) && slotRole === 'DFC') return 76;
      if (playerPosition === 'DFC' && ['LI', 'LD'].includes(slotRole)) return 70;
      return 72;
    }
    if ((playerGroup === 'MED' && ['DEF', 'ATA'].includes(slotGroup)) || (slotGroup === 'MED' && ['DEF', 'ATA'].includes(playerGroup))) return 38;
    return 8;
  }

  function resolvePlayerKey(key) {
    if (!key) return null;
    if (typeof key === 'object') key = key.id || key.nombre || key.name;
    return playerById.get(String(key))?.id || playerByName.get(normalize(key))?.id || null;
  }

  function playerImage(player, extraClass = '') {
    const initials = escapeHTML((player.name || '?').split(/\s+/).slice(0, 2).map(part => part[0]).join(''));
    return `<span class="avatar ${extraClass}"><span>${initials}</span><img src="${escapeHTML(player.image)}" alt="" onerror="this.remove()"></span>`;
  }

  function slotImage(player) {
    const initials = escapeHTML((player.name || '?').split(/\s+/).slice(0, 2).map(part => part[0]).join(''));
    return `<span>${initials}</span><img src="${escapeHTML(player.image)}" alt="" onerror="this.remove()">`;
  }

  function allAssignments(squad = activeSquad()) {
    return [...squad.starters, ...squad.bench, ...squad.staff].filter(Boolean);
  }

  function locatePlayer(playerId, squad = activeSquad()) {
    for (const type of ['starters', 'bench', 'staff']) {
      const index = squad[type].indexOf(playerId);
      if (index >= 0) return { type: type === 'starters' ? 'field' : type, index };
    }
    return null;
  }

  function targetArray(squad, type) {
    return type === 'field' ? squad.starters : squad[type];
  }

  function assignPlayer(target, playerId, source = null) {
    const squad = activeSquad();
    const player = playerById.get(playerId);
    if (!player || !target) return;
    if (target.type === 'staff' && !['ENT', 'GER'].includes(player.position)) return showToast('Ese hueco está reservado al cuerpo técnico');
    if (target.type !== 'staff' && ['ENT', 'GER'].includes(player.position)) return showToast('Añádelo desde la pestaña Cuerpo técnico');
    commit(() => {
      const current = source || locatePlayer(playerId, squad);
      const targetList = targetArray(squad, target.type);
      const displaced = targetList[target.index] || null;
      if (current && current.type === target.type && current.index === target.index) return;
      if (current) targetArray(squad, current.type)[current.index] = displaced;
      else if (displaced) {
        const freeBench = squad.bench.findIndex(item => !item);
        if (target.type === 'field' && freeBench >= 0) squad.bench[freeBench] = displaced;
      }
      targetList[target.index] = playerId;
      if (squad.captain === displaced && !allAssignments(squad).includes(displaced)) squad.captain = null;
    }, `${player.name} añadido a la plantilla`);
  }

  function removeTarget(target) {
    const squad = activeSquad();
    const list = targetArray(squad, target.type);
    const removed = list[target.index];
    if (!removed) return;
    commit(() => {
      list[target.index] = null;
      if (squad.captain === removed) squad.captain = null;
      delete squad.stats[removed];
    }, 'Integrante retirado');
  }

  function renderAll() {
    renderControls();
    renderLibrary();
    renderField();
    renderBench();
    renderInspector();
    requestAnimationFrame(drawChemistry);
  }

  function renderControls() {
    const squad = activeSquad();
    dom.squadSelect.innerHTML = state.squads.map(item => `<option value="${item.id}">${escapeHTML(item.name)}</option>`).join('');
    dom.squadSelect.value = squad.id;
    if (!dom.formationSelect.options.length) dom.formationSelect.innerHTML = formationNames.map(name => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');
    dom.formationSelect.value = squad.formation;
    dom.formationDisplay.textContent = squad.formation;
    dom.teamName.value = squad.name;
    dom.eventName.value = squad.event;
    dom.undoButton.disabled = !history.length;
    dom.redoButton.disabled = !future.length;
    dom.chemistryButton.classList.toggle('active', state.chemistryVisible);
    dom.chemistryButton.textContent = state.chemistryVisible ? '✦ Química' : '○ Química';
  }

  function filterMatches(player, filter) {
    if (filter === 'all') return true;
    return positionGroup(player.position) === filter;
  }

  function renderPositionButtons(container, current, callback, includeRecommended = false) {
    const options = includeRecommended ? [['recommended', 'Recomendados'], ['all', 'Todos'], ['POR', 'POR'], ['DEF', 'DEF'], ['MED', 'MED'], ['ATA', 'ATA'], ['STAFF', 'Staff']] : [['all', 'Todos'], ['POR', 'POR'], ['DEF', 'DEF'], ['MED', 'MED'], ['ATA', 'ATA'], ['STAFF', 'Staff']];
    container.innerHTML = options.map(([value, label]) => `<button class="${current === value ? 'active' : ''}" data-position="${value}" type="button">${label}</button>`).join('');
    container.querySelectorAll('button').forEach(button => button.addEventListener('click', () => callback(button.dataset.position)));
  }

  function renderLibrary() {
    if (!dom.teamFilter.options.length || dom.teamFilter.options.length === 1) {
      const teams = [...new Set(DATA.players.map(player => player.team))].sort((a, b) => a.localeCompare(b, 'es'));
      dom.teamFilter.innerHTML = '<option value="">Todos los equipos</option>' + teams.map(team => `<option value="${escapeHTML(team)}">${escapeHTML(team)}</option>`).join('');
    }
    renderPositionButtons(dom.positionFilters, libraryPosition, value => { libraryPosition = value; renderLibrary(); });
    const query = normalize(dom.playerSearch.value);
    const team = dom.teamFilter.value;
    const squad = activeSquad();
    const assigned = new Set(allAssignments(squad));
    const players = DATA.players.filter(player => (!query || normalize(`${player.name} ${player.team} ${player.position}`).includes(query)) && (!team || player.team === team) && filterMatches(player, libraryPosition));
    dom.playerCount.textContent = players.length;
    dom.playerLibrary.innerHTML = players.length ? players.map(player => `
      <article class="player-card ${assigned.has(player.id) ? 'used' : ''}" data-player="${player.id}" draggable="true" tabindex="0">
        ${playerImage(player)}<div class="player-copy"><strong>${escapeHTML(player.name)}</strong><span>${escapeHTML(player.team)} · ${player.number || '—'}</span></div>
        <span class="position-tag ${player.position === 'POR' ? 'gk' : ['ENT', 'GER'].includes(player.position) ? 'staff' : ''}">${escapeHTML(player.position)}</span>
      </article>`).join('') : '<div class="empty-state">No hay jugadores que coincidan con estos filtros.</div>';
    dom.playerLibrary.querySelectorAll('.player-card').forEach(card => {
      const playerId = card.dataset.player;
      card.addEventListener('click', () => quickAdd(playerId));
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); quickAdd(playerId); } });
      card.addEventListener('dragstart', event => startDrag(event, { type: 'library', playerId }));
      card.addEventListener('dragend', clearDrag);
    });
  }

  function quickAdd(playerId) {
    const squad = activeSquad();
    const existing = locatePlayer(playerId, squad);
    if (existing) return openPlayer(playerId, existing);
    const player = playerById.get(playerId);
    if (['ENT', 'GER'].includes(player.position)) {
      const staffIndex = squad.staff.findIndex(item => !item);
      if (staffIndex >= 0) return assignPlayer({ type: 'staff', index: staffIndex }, playerId);
      return openPicker({ type: 'staff', index: 0 });
    }
    const slots = DATA.formations[squad.formation];
    const candidates = slots.map((slot, index) => ({ index, fit: positionFit(player.position, slot.rol) })).filter(item => !squad.starters[item.index]).sort((a, b) => b.fit - a.fit);
    if (candidates.length) return assignPlayer({ type: 'field', index: candidates[0].index }, playerId);
    const benchIndex = squad.bench.findIndex(item => !item);
    if (benchIndex >= 0) return assignPlayer({ type: 'bench', index: benchIndex }, playerId);
    openPlayer(playerId, null);
  }

  function slotHTML(playerId, slot, index) {
    const player = playerById.get(playerId);
    const fit = player ? positionFit(player.position, slot.rol) : 100;
    return `<div class="slot" data-target="field" data-index="${index}" style="left:${slot.x}%;top:${slot.y}%">
      <div class="slot-core" draggable="${Boolean(player)}">${player ? slotImage(player) : '<span class="empty-plus">＋</span>'}
        ${player ? `<span class="slot-number">${player.number || index + 1}</span>` : ''}<span class="slot-role ${fit < 60 ? 'bad-fit' : ''}">${escapeHTML(slot.rol)}</span>${activeSquad().captain === playerId ? '<span class="captain-badge">C</span>' : ''}
      </div><span class="slot-name ${player ? '' : 'empty'}">${player ? escapeHTML(player.name) : 'Elegir jugador'}</span>
    </div>`;
  }

  function renderField() {
    const squad = activeSquad();
    const formation = DATA.formations[squad.formation];
    dom.fieldSlots.innerHTML = formation.map((slot, index) => slotHTML(squad.starters[index], slot, index)).join('');
    dom.chemistryLayer.classList.toggle('hidden', !state.chemistryVisible);
    dom.fieldSlots.querySelectorAll('.slot').forEach(slotElement => {
      const target = { type: 'field', index: Number(slotElement.dataset.index) };
      const playerId = squad.starters[target.index];
      slotElement.querySelector('.slot-core').addEventListener('click', () => playerId ? openPlayer(playerId, target) : openPicker(target));
      if (playerId) {
        slotElement.querySelector('.slot-core').addEventListener('dragstart', event => startDrag(event, { type: 'field', index: target.index, playerId }));
        slotElement.querySelector('.slot-core').addEventListener('dragend', clearDrag);
      }
      enableDrop(slotElement, target);
    });
  }

  function renderBench() {
    const squad = activeSquad();
    dom.benchSlots.innerHTML = squad.bench.map((playerId, index) => {
      const player = playerById.get(playerId);
      return `<div class="mini-slot ${player ? '' : 'empty'}" data-target="bench" data-index="${index}" draggable="${Boolean(player)}">${player ? `${playerImage(player)}<span class="mini-name">${escapeHTML(player.name)}</span>` : `＋ B${index + 1}`}</div>`;
    }).join('');
    dom.benchSlots.querySelectorAll('.mini-slot').forEach(element => {
      const index = Number(element.dataset.index), playerId = squad.bench[index], target = { type: 'bench', index };
      element.addEventListener('click', () => playerId ? openPlayer(playerId, target) : openPicker(target));
      if (playerId) {
        element.addEventListener('dragstart', event => startDrag(event, { type: 'bench', index, playerId }));
        element.addEventListener('dragend', clearDrag);
      }
      enableDrop(element, target);
    });
  }

  function startDrag(event, payload) {
    dragPayload = payload;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
  }

  function clearDrag() {
    dragPayload = null;
    document.querySelectorAll('.drop-target').forEach(element => element.classList.remove('drop-target'));
  }

  function enableDrop(element, target) {
    element.addEventListener('dragover', event => { event.preventDefault(); element.classList.add('drop-target'); });
    element.addEventListener('dragleave', () => element.classList.remove('drop-target'));
    element.addEventListener('drop', event => {
      event.preventDefault();
      element.classList.remove('drop-target');
      let payload = dragPayload;
      try { payload ||= JSON.parse(event.dataTransfer.getData('text/plain')); } catch (error) {}
      if (payload?.playerId) assignPlayer(target, payload.playerId, payload.type === 'library' ? null : { type: payload.type, index: payload.index });
      clearDrag();
    });
  }

  function activeRelationships(ids) {
    const normalized = new Map(ids.map(id => [normalize(playerById.get(id)?.name), id]));
    return relationships.filter(link => normalized.has(link.a) && normalized.has(link.b)).map(link => ({ ...link, aId: normalized.get(link.a), bId: normalized.get(link.b) }));
  }

  function calculateAnalysis() {
    const squad = activeSquad();
    const formation = DATA.formations[squad.formation];
    const filled = squad.starters.filter(Boolean);
    const fits = squad.starters.map((id, index) => id ? positionFit(playerById.get(id).position, formation[index].rol) : 0).filter((_, index) => squad.starters[index]);
    const fit = fits.length ? Math.round(fits.reduce((sum, value) => sum + value, 0) / fits.length) : 0;
    const links = activeRelationships(filled);
    const positivePoints = links.reduce((sum, link) => sum + link.points, 0);
    const teamCounts = filled.reduce((counts, id) => { const team = playerById.get(id).team; counts[team] = (counts[team] || 0) + 1; return counts; }, {});
    const teams = Object.keys(teamCounts).length;
    const largestBlock = Math.max(0, ...Object.values(teamCounts));
    const score = Math.max(0, Math.min(100, Math.round((filled.length / 11) * 36 + fit * .27 + Math.min(24, Math.max(-12, positivePoints * 1.35)) + (largestBlock / Math.max(1, filled.length)) * 13)));
    return { filled, fit, links, teams, teamCounts, largestBlock, score, formation };
  }

  function renderInspector() {
    const squad = activeSquad();
    const analysis = calculateAnalysis();
    dom.chemistryScore.textContent = analysis.score;
    dom.scoreRing.style.setProperty('--score', `${analysis.score}%`);
    dom.scoreRing.querySelector('i').textContent = `${analysis.score}%`;
    dom.chemistryLabel.textContent = analysis.score >= 85 ? 'Equipo preparado para competir' : analysis.score >= 65 ? 'Base sólida con margen de mejora' : analysis.score >= 40 ? 'La estructura empieza a tomar forma' : 'Plantilla por construir';
    dom.filledMetric.textContent = `${analysis.filled.length}/11`;
    dom.fitMetric.textContent = `${analysis.fit}%`;
    dom.linksMetric.textContent = analysis.links.length;
    dom.teamsMetric.textContent = analysis.teams;
    renderRecommendations(analysis);
    renderRelationships(analysis.links);
    renderLineup();
    renderStaff();
  }

  function renderRecommendations(analysis) {
    const squad = activeSquad();
    const items = [];
    const empty = 11 - analysis.filled.length;
    if (empty) items.push({ type: 'warn', icon: '＋', text: `Faltan ${empty} ${empty === 1 ? 'titular' : 'titulares'} para completar el once.` });
    const badFits = squad.starters.filter((id, index) => id && positionFit(playerById.get(id).position, analysis.formation[index].rol) < 60).length;
    if (badFits) items.push({ type: 'bad', icon: '!', text: `${badFits} ${badFits === 1 ? 'jugador está' : 'jugadores están'} claramente fuera de posición.` });
    else if (analysis.filled.length >= 6) items.push({ type: 'good', icon: '✓', text: 'Todos los jugadores ocupan posiciones compatibles.' });
    const keeperIndex = analysis.formation.findIndex(slot => slot.rol === 'POR');
    if (keeperIndex >= 0 && !squad.starters[keeperIndex]) items.push({ type: 'bad', icon: '🧤', text: 'La portería sigue vacía: conviene resolverla primero.' });
    const negative = analysis.links.filter(link => link.points < 0).length;
    if (negative) items.push({ type: 'bad', icon: '↯', text: `${negative} vínculo negativo puede afectar al vestuario.` });
    const positive = analysis.links.filter(link => link.points > 0).length;
    if (positive >= 3) items.push({ type: 'good', icon: '✦', text: `Hay ${positive} vínculos positivos activos en el once.` });
    if (analysis.largestBlock >= 6) items.push({ type: 'good', icon: '⚑', text: `El bloque principal comparte equipo: ${analysis.largestBlock} futbolistas.` });
    if (!items.length) items.push({ type: '', icon: '○', text: 'Añade jugadores para recibir recomendaciones tácticas.' });
    dom.recommendations.innerHTML = items.map(item => `<div class="recommendation ${item.type}"><b>${item.icon}</b> ${escapeHTML(item.text)}</div>`).join('');
  }

  function renderRelationships(links) {
    const sorted = [...links].sort((a, b) => b.points - a.points);
    dom.relationshipList.innerHTML = sorted.length ? sorted.slice(0, 12).map(link => {
      const a = playerById.get(link.aId), b = playerById.get(link.bId), meta = relationMeta[link.type] || {};
      return `<div class="relationship-row ${link.points < 0 ? 'negative' : ''}"><i>${meta.icono || (link.points < 0 ? '↯' : '✦')}</i><div><strong>${escapeHTML(a.name)} · ${escapeHTML(b.name)}</strong><span>${escapeHTML(link.reason)}</span></div><b>${link.points > 0 ? '+' : ''}${link.points}</b></div>`;
    }).join('') : '<div class="empty-state">Todavía no hay vínculos automáticos dentro del once.</div>';
  }

  function renderLineup() {
    const squad = activeSquad(), formation = DATA.formations[squad.formation];
    const rows = squad.starters.map((id, index) => lineupRow(id, formation[index].rol, { type: 'field', index })).join('');
    const benchRows = squad.bench.map((id, index) => id ? lineupRow(id, `B${index + 1}`, { type: 'bench', index }) : '').join('');
    dom.lineupList.innerHTML = `<div class="lineup-divider">Titulares</div>${rows}<div class="lineup-divider">Banquillo</div>${benchRows || '<div class="empty-state">Banquillo vacío</div>'}`;
    dom.lineupList.querySelectorAll('.lineup-row').forEach(row => row.addEventListener('click', event => {
      if (event.target.closest('button')) return;
      const id = row.dataset.player;
      if (id) openPlayer(id, { type: row.dataset.type, index: Number(row.dataset.index) });
    }));
    dom.lineupList.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => removeTarget({ type: button.dataset.type, index: Number(button.dataset.index) })));
  }

  function lineupRow(playerId, role, target) {
    const player = playerById.get(playerId);
    return `<div class="lineup-row" data-player="${playerId || ''}" data-type="${target.type}" data-index="${target.index}">${player ? playerImage(player) : '<span class="avatar">＋</span>'}<div><strong>${player ? escapeHTML(player.name) : 'Hueco libre'}</strong><span>${escapeHTML(role)}${player ? ` · ${escapeHTML(player.position)}` : ''}</span></div>${player ? `<button data-remove data-type="${target.type}" data-index="${target.index}" title="Retirar">×</button>` : ''}</div>`;
  }

  function renderStaff() {
    const squad = activeSquad();
    const labels = ['Entrenador/a', 'Gerente', 'Asistente'];
    dom.staffSlots.innerHTML = squad.staff.map((id, index) => {
      const player = playerById.get(id);
      return `<div class="staff-slot" data-index="${index}" draggable="${Boolean(player)}">${player ? playerImage(player) : '<span class="avatar">＋</span>'}<div><strong>${player ? escapeHTML(player.name) : labels[index]}</strong><span>${player ? `${escapeHTML(player.position)} · ${escapeHTML(player.team)}` : 'Pulsa para elegir'}</span></div></div>`;
    }).join('');
    dom.staffSlots.querySelectorAll('.staff-slot').forEach(element => {
      const index = Number(element.dataset.index), id = squad.staff[index], target = { type: 'staff', index };
      element.addEventListener('click', () => id ? openPlayer(id, target) : openPicker(target));
      if (id) {
        element.addEventListener('dragstart', event => startDrag(event, { type: 'staff', index, playerId: id }));
        element.addEventListener('dragend', clearDrag);
      }
      enableDrop(element, target);
    });
  }

  function drawChemistry() {
    const squad = activeSquad();
    if (!state.chemistryVisible) { dom.chemistryLayer.innerHTML = ''; return; }
    const formation = DATA.formations[squad.formation];
    const links = activeRelationships(squad.starters.filter(Boolean)).slice(0, 14);
    const width = dom.field.clientWidth || 700, height = dom.field.clientHeight || 520;
    dom.chemistryLayer.innerHTML = links.map(link => {
      const aIndex = squad.starters.indexOf(link.aId), bIndex = squad.starters.indexOf(link.bId);
      const a = formation[aIndex], b = formation[bIndex];
      if (!a || !b) return '';
      const dx = (b.x - a.x) / 100 * width, dy = (b.y - a.y) / 100 * height;
      const length = Math.sqrt(dx * dx + dy * dy), angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const meta = relationMeta[link.type] || {};
      return `<div class="chem-line ${link.points < 0 ? 'negative' : ''}" style="left:${a.x}%;top:${a.y}%;width:${length}px;transform:rotate(${angle}deg);--link-color:${meta.color || '#60e5ff'}"><span>${meta.icono || '✦'}</span></div>`;
    }).join('');
  }

  function openPicker(target) {
    pickerTarget = target;
    pickerPosition = 'recommended';
    dom.pickerSearch.value = '';
    const squad = activeSquad();
    const role = target.type === 'field' ? DATA.formations[squad.formation][target.index].rol : target.type === 'staff' ? 'ENT / GER' : 'Banquillo';
    dom.pickerTitle.textContent = `Elegir para ${role}`;
    renderPicker();
    dom.pickerDialog.showModal();
    setTimeout(() => dom.pickerSearch.focus(), 30);
  }

  function renderPicker() {
    renderPositionButtons(dom.pickerFilters, pickerPosition, value => { pickerPosition = value; renderPicker(); }, true);
    const squad = activeSquad(), used = new Set(allAssignments(squad));
    const query = normalize(dom.pickerSearch.value);
    const role = pickerTarget?.type === 'field' ? DATA.formations[squad.formation][pickerTarget.index].rol : null;
    let players = pickerTarget?.type === 'staff' ? staffPlayers : fieldPlayers;
    players = players.filter(player => !used.has(player.id) && (!query || normalize(`${player.name} ${player.team} ${player.position}`).includes(query)));
    if (pickerPosition === 'recommended' && role) players = players.filter(player => positionFit(player.position, role) >= 60).sort((a, b) => positionFit(b.position, role) - positionFit(a.position, role));
    else if (pickerPosition === 'recommended' && pickerTarget?.type === 'staff') players = staffPlayers.filter(player => !used.has(player.id));
    else if (pickerPosition !== 'all' && pickerPosition !== 'recommended') players = players.filter(player => filterMatches(player, pickerPosition));
    dom.pickerPlayers.innerHTML = players.length ? players.map(player => `<button class="picker-card" data-player="${player.id}" type="button">${playerImage(player)}<span><strong>${escapeHTML(player.name)}</strong><span>${escapeHTML(player.team)} · ${escapeHTML(player.position)}${role ? ` · ${positionFit(player.position, role)}%` : ''}</span></span></button>`).join('') : '<div class="empty-state">No quedan opciones disponibles con este filtro.</div>';
    dom.pickerPlayers.querySelectorAll('.picker-card').forEach(card => card.addEventListener('click', () => { assignPlayer(pickerTarget, card.dataset.player); dom.pickerDialog.close(); }));
  }

  function openPlayer(playerId, target = null) {
    const player = playerById.get(playerId);
    if (!player) return;
    const squad = activeSquad(), location = target || locatePlayer(playerId, squad), stats = squad.stats[playerId] || { goals: 0, assists: 0, yellow: false, red: false };
    dom.playerDialogTitle.textContent = player.name;
    dom.playerDialogBody.innerHTML = `<div class="profile-photo"><img src="${escapeHTML(player.image)}" alt="${escapeHTML(player.name)}" onerror="this.remove()"></div><div class="profile-content"><h1>${escapeHTML(player.name)}</h1><p class="profile-sub">${escapeHTML(player.team)} · Dorsal ${player.number || '—'}</p><div class="profile-chips"><span>${escapeHTML(player.position)}</span><span>${location ? locationLabel(location) : 'Sin convocar'}</span>${squad.captain === playerId ? '<span>👑 Capitán/a</span>' : ''}</div><div class="stats-grid"><div class="stat-field"><label>Goles</label><input id="detailGoals" type="number" min="0" max="99" value="${Number(stats.goals) || 0}"></div><div class="stat-field"><label>Asistencias</label><input id="detailAssists" type="number" min="0" max="99" value="${Number(stats.assists) || 0}"></div><div class="stat-field"><label>Tarjeta</label><select id="detailCard"><option value="none">Sin tarjeta</option><option value="yellow" ${stats.yellow ? 'selected' : ''}>Amarilla</option><option value="red" ${stats.red ? 'selected' : ''}>Roja</option></select></div></div><div class="dialog-actions"><a class="button quiet" href="../centro-inazuma.html">Abrir en Inazuma Central</a>${location ? `<button class="button quiet" id="captainDetail" type="button">${squad.captain === playerId ? 'Quitar capitanía' : 'Nombrar capitán/a'}</button><button class="button quiet danger-text" id="removeDetail" type="button">Retirar</button>` : ''}</div></div>`;
    ['detailGoals', 'detailAssists', 'detailCard'].forEach(id => $(id)?.addEventListener('change', saveDetailStats));
    $('captainDetail')?.addEventListener('click', () => { commit(() => { squad.captain = squad.captain === playerId ? null : playerId; }, 'Capitanía actualizada'); dom.playerDialog.close(); });
    $('removeDetail')?.addEventListener('click', () => { removeTarget(location); dom.playerDialog.close(); });
    function saveDetailStats() {
      commit(() => { squad.stats[playerId] = { goals: Number($('detailGoals').value) || 0, assists: Number($('detailAssists').value) || 0, yellow: $('detailCard').value === 'yellow', red: $('detailCard').value === 'red' }; });
    }
    dom.playerDialog.showModal();
  }

  function locationLabel(location) {
    if (location.type === 'field') return `Titular · ${DATA.formations[activeSquad().formation][location.index].rol}`;
    if (location.type === 'bench') return `Banquillo · B${location.index + 1}`;
    return ['Entrenador/a', 'Gerente', 'Asistente'][location.index] || 'Cuerpo técnico';
  }

  function changeFormation(name) {
    if (!DATA.formations[name] || name === activeSquad().formation) return;
    commit(() => {
      const squad = activeSquad(), players = squad.starters.filter(Boolean), slots = DATA.formations[name];
      const available = [...players], next = Array(11).fill(null);
      slots.forEach((slot, index) => {
        if (!available.length) return;
        available.sort((a, b) => positionFit(playerById.get(b).position, slot.rol) - positionFit(playerById.get(a).position, slot.rol));
        next[index] = available.shift();
      });
      squad.formation = name;
      squad.starters = next;
    }, `Formación cambiada a ${name}`);
  }

  function runDraft(mode) {
    const squad = activeSquad(), slots = DATA.formations[squad.formation], pool = [...fieldPlayers], chosen = [];
    const next = slots.map(slot => {
      pool.sort((a, b) => draftScore(b, slot, chosen, mode) - draftScore(a, slot, chosen, mode));
      const selection = mode === 'chaos' ? pool.splice(Math.floor(Math.random() * pool.length), 1)[0] : pool.splice(0, 1)[0];
      chosen.push(selection.id);
      return selection.id;
    });
    commit(() => { squad.starters = next; squad.captain = next[0]; }, mode === 'chemistry' ? 'Draft de química completado' : mode === 'chaos' ? 'Draft caótico completado' : 'Draft equilibrado completado');
    dom.draftDialog.close();
  }

  function draftScore(player, slot, chosen, mode) {
    if (mode === 'chaos') return Math.random();
    let score = positionFit(player.position, slot.rol) + Math.random() * 10;
    if (mode === 'balanced') {
      const teams = chosen.map(id => playerById.get(id).team);
      score += teams.includes(player.team) ? -4 : 8;
    }
    if (mode === 'chemistry') {
      const playerName = normalize(player.name);
      chosen.forEach(id => {
        const other = normalize(playerById.get(id).name);
        const link = relationships.find(item => (item.a === playerName && item.b === other) || (item.b === playerName && item.a === other));
        if (link) score += link.points * 8;
        if (playerById.get(id).team === player.team) score += 4;
      });
    }
    return score;
  }

  function buildExport() {
    return { version: 7, exportedAt: new Date().toISOString(), squad: activeSquad() };
  }

  function encodeCode(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return `INAZUMA-V7:${btoa(binary)}`;
  }

  function decodeCode(text) {
    const clean = String(text).trim().replace(/^INAZUMA-V7:/, '');
    const binary = atob(clean), bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function importPayload(payload) {
    const raw = payload?.squad || payload;
    if (!raw || (!raw.starters && !raw.formation)) throw new Error('Formato no reconocido');
    const squad = cleanSquad({ ...raw, id: uid(), name: `${raw.name || raw.teamName || 'Equipo importado'} · importado` });
    commit(() => { state.squads.push(squad); state.activeSquadId = squad.id; }, 'Plantilla importada');
  }

  function downloadSquad() {
    const payload = buildExport(), safe = normalize(activeSquad().name).replace(/[^a-z0-9]+/g, '-') || 'equipo-inazuma';
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `${safe}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('Equipo exportado');
  }

  function buildDiscordText() {
    const squad = activeSquad(), formation = DATA.formations[squad.formation], analysis = calculateAnalysis();
    const starters = squad.starters.map((id, index) => {
      const player = playerById.get(id); if (!player) return `▫️ ${formation[index].rol}: —`;
      const stats = squad.stats[id] || {}, extras = [stats.goals ? `⚽ ${stats.goals}` : '', stats.assists ? `🅰️ ${stats.assists}` : '', stats.red ? '🟥' : stats.yellow ? '🟨' : ''].filter(Boolean).join(' · ');
      return `${squad.captain === id ? '👑' : '⚽'} ${formation[index].rol}: ${player.name} #${player.number || index + 1}${extras ? ` · ${extras}` : ''}`;
    });
    const bench = squad.bench.map(id => playerById.get(id)?.name).filter(Boolean);
    const staff = squad.staff.map(id => playerById.get(id)?.name).filter(Boolean);
    return [`## ${squad.name}`, squad.event ? `**${squad.event}**` : '', `Formación: **${squad.formation}** · Química: **${analysis.score}/100**`, '', ...starters, '', `**Banquillo:** ${bench.join(', ') || 'Sin definir'}`, `**Cuerpo técnico:** ${staff.join(', ') || 'Sin definir'}`].filter((line, index, all) => line !== '' || all[index - 1] !== '').join('\n');
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
    }
    showToast(successMessage);
  }

  function openTechniqueBuilder() {
    const players = activeSquad().starters.map(id => playerById.get(id)).filter(Boolean);
    const options = players.map(player => `<option value="${player.id}">${escapeHTML(player.name)}</option>`).join('');
    dom.techniquePlayerA.innerHTML = options || '<option>Completa el once primero</option>';
    dom.techniquePlayerB.innerHTML = options;
    if (players[1]) dom.techniquePlayerB.value = players[1].id;
    dom.techniqueOutput.value = '';
    dom.techniqueDialog.showModal();
  }

  function generateTechnique() {
    const a = playerById.get(dom.techniquePlayerA.value), b = playerById.get(dom.techniquePlayerB.value);
    const name = dom.techniqueName.value.trim() || 'Supertécnica sin nombre';
    const text = [`⚡ **${name}**`, `Tipo: ${dom.techniqueType.value} · ${dom.techniqueGrade.value}`, `Participantes: ${[a?.name, b?.name].filter(Boolean).join(' + ') || 'Por definir'}`, dom.techniqueDescription.value.trim() ? `Descripción: ${dom.techniqueDescription.value.trim()}` : ''].filter(Boolean).join('\n');
    dom.techniqueOutput.value = text;
  }

  function bindEvents() {
    dom.playerSearch.addEventListener('input', renderLibrary);
    dom.teamFilter.addEventListener('change', renderLibrary);
    dom.pickerSearch.addEventListener('input', renderPicker);
    dom.formationSelect.addEventListener('change', () => changeFormation(dom.formationSelect.value));
    dom.squadSelect.addEventListener('change', () => { state.activeSquadId = dom.squadSelect.value; history = []; future = []; saveState(); renderAll(); });
    dom.previousSquad.addEventListener('click', () => switchSquad(-1));
    dom.nextSquad.addEventListener('click', () => switchSquad(1));
    dom.newSquad.addEventListener('click', () => commit(() => { const squad = createSquad(`Plantilla ${state.squads.length + 1}`); state.squads.push(squad); state.activeSquadId = squad.id; }, 'Nueva plantilla creada'));
    dom.duplicateSquad.addEventListener('click', () => commit(() => { const copy = JSON.parse(JSON.stringify(activeSquad())); copy.id = uid(); copy.name = `${copy.name} · copia`; state.squads.push(copy); state.activeSquadId = copy.id; }, 'Plantilla duplicada'));
    dom.deleteSquad.addEventListener('click', () => {
      if (state.squads.length <= 1) return showToast('Debe existir al menos una plantilla');
      if (!confirm(`¿Borrar ${activeSquad().name}?`)) return;
      commit(() => { const id = activeSquad().id; state.squads = state.squads.filter(item => item.id !== id); state.activeSquadId = state.squads[0].id; }, 'Plantilla borrada');
    });
    dom.teamName.addEventListener('input', () => { activeSquad().name = dom.teamName.value.slice(0, 60) || 'Nuevo equipo'; saveState(); dom.squadSelect.options[dom.squadSelect.selectedIndex].textContent = activeSquad().name; });
    dom.eventName.addEventListener('input', () => { activeSquad().event = dom.eventName.value.slice(0, 80); saveState(); });
    dom.undoButton.addEventListener('click', undo); dom.redoButton.addEventListener('click', redo);
    dom.chemistryButton.addEventListener('click', () => commit(() => state.chemistryVisible = !state.chemistryVisible));
    dom.focusButton.addEventListener('click', () => { document.body.classList.toggle('focus-mode'); dom.focusButton.textContent = document.body.classList.contains('focus-mode') ? '← Volver' : '⛶ Solo campo'; requestAnimationFrame(drawChemistry); });
    dom.clearButton.addEventListener('click', () => { if (confirm('¿Vaciar titulares, banquillo y cuerpo técnico?')) commit(() => { const squad = activeSquad(); squad.starters.fill(null); squad.bench.fill(null); squad.staff.fill(null); squad.captain = null; squad.stats = {}; }, 'Plantilla vaciada'); });
    dom.draftButton.addEventListener('click', () => { document.querySelector('.more-menu').removeAttribute('open'); dom.draftDialog.showModal(); });
    dom.draftDialog.querySelectorAll('[data-draft]').forEach(button => button.addEventListener('click', () => runDraft(button.dataset.draft)));
    dom.copyButton.addEventListener('click', () => copyText(buildDiscordText(), 'Plantilla copiada para Discord'));
    dom.copyCodeButton.addEventListener('click', () => { document.querySelector('.more-menu').removeAttribute('open'); dom.codeArea.value = encodeCode(buildExport()); dom.codeDialog.showModal(); });
    dom.copyCodeFromDialog.addEventListener('click', () => copyText(dom.codeArea.value, 'Código copiado'));
    dom.loadCodeButton.addEventListener('click', () => { try { importPayload(decodeCode(dom.codeArea.value)); dom.codeDialog.close(); } catch (error) { showToast('Ese código no es válido'); } });
    dom.exportButton.addEventListener('click', downloadSquad);
    dom.importButton.addEventListener('click', () => dom.importFile.click());
    dom.importFile.addEventListener('change', async event => { const file = event.target.files?.[0]; if (!file) return; try { importPayload(JSON.parse(await file.text())); } catch (error) { showToast('No se pudo importar ese archivo'); } event.target.value = ''; });
    dom.techniqueButton.addEventListener('click', () => { document.querySelector('.more-menu').removeAttribute('open'); openTechniqueBuilder(); });
    dom.generateTechnique.addEventListener('click', generateTechnique);
    dom.copyTechnique.addEventListener('click', () => { if (!dom.techniqueOutput.value) generateTechnique(); copyText(dom.techniqueOutput.value, 'Supertécnica copiada'); });
    document.querySelectorAll('.inspector-tabs button').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('.inspector-tabs button').forEach(item => item.classList.toggle('active', item === button));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `${button.dataset.tab}Tab`));
    }));
    document.addEventListener('keydown', event => {
      if (!(event.ctrlKey || event.metaKey) || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    });
    window.addEventListener('resize', () => requestAnimationFrame(drawChemistry));
  }

  function switchSquad(offset) {
    const index = state.squads.findIndex(squad => squad.id === state.activeSquadId);
    const next = (index + offset + state.squads.length) % state.squads.length;
    state.activeSquadId = state.squads[next].id; history = []; future = []; saveState(); renderAll();
  }

  bindEvents();
  saveState();
  renderAll();
})();
