(() => {
  "use strict";

  const center = window.INAZUMA_CENTER_DATA || { season: {}, players: [] };
  const market = window.INAMARKT_DATA || { profiles: {}, transfers: [], teamColors: {} };
  const rawPlayers = Array.isArray(center.players) ? center.players : [];
  const state = { view: "home", query: "", team: "all", position: "all", sort: "value-desc" };
  const STORAGE_KEY = "inamarkt-market-profiles-v2";
  const SESSION_KEY = "inamarkt-admin-unlocked";

  try {
    const localProfiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    market.profiles = { ...(market.profiles || {}), ...localProfiles };
  } catch (_) { market.profiles ||= {}; }

  const PRICE = {
    positions: { Delantero: 850000, Mediocentro: 700000, Portero: 650000, Defensa: 600000, other: 350000 },
    grades: { G1: 250000, G2: 500000, G3: 800000, G4: 1200000, G5: 1800000 },
    talent: [0, 750000, 1200000, 1650000, 2100000, 2500000],
    spirit: [0, 2000000, 2750000, 3500000, 4250000, 5000000],
    armor: [0, 1500000, 2250000, 3000000],
    miximax: [0, 2500000, 3100000, 3750000, 4400000, 5000000],
    narrative: [.90, .95, 1, 1.07, 1.14, 1.20],
    clubRole: { out: .80, bench: .85, rotation: .95, neutral: 1, starter: 1.05, key: 1.15, captain: 1.20 },
    performance: { very_low: .85, low: .93, normal: 1, good: 1.10, excellent: 1.25 },
    injury: { none: 1, short: .97, minor: .93, medium: .85, long: .75, chronic: .65 },
    contract: { free: .90, expiring: .80, short: .90, neutral: 1, long: 1.05 }
  };

  const LABELS = {
    clubRole: { out: "Fuera de convocatorias", bench: "Suplente", rotation: "Rotación", neutral: "Sin valorar", starter: "Titular habitual", key: "Jugador clave", captain: "Capitán o referente" },
    performance: { very_low: "Muy por debajo", low: "Por debajo", normal: "Normal / sin datos", good: "Bueno", excellent: "Excepcional" },
    injury: { none: "Sin lesión", short: "Menos de 2 semanas", minor: "2–6 semanas", medium: "2–3 meses", long: "4–6 meses", chronic: "Crónica / riesgo serio" },
    contract: { free: "Agente libre", expiring: "Menos de 6 meses", short: "6–12 meses", neutral: "1–2 años / sin valorar", long: "Más de 2 años" }
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const fold = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const initials = value => String(value || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const playerImage = player => player.image ? `../${String(player.image).replace(/^\.\.\//, "")}` : "";

  function stringHash(value) {
    return [...String(value)].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0);
  }

  function defaultProfile(player) {
    return {
      talentTier: player.talent?.nombre ? 3 : 0,
      spiritTier: player.spirit?.nombre ? 3 : 0,
      armorTier: player.spirit?.armadura ? 2 : 0,
      miximaxTier: player.miximax?.nombre ? 3 : 0,
      narrativeScore: 2,
      narrativeReason: "",
      clubRole: "neutral",
      performance: "normal",
      injury: player.status === "Lesionado" ? "medium" : "none",
      contract: fold(player.team).includes("agente libre") ? "free" : "neutral",
      demand: 0,
      rumor: 0,
      change: 0,
      manualValue: null
    };
  }

  function profileFor(player) { return { ...defaultProfile(player), ...(market.profiles?.[player.id] || {}) }; }
  function gradeValue(technique) {
    const grade = String(technique?.grade || technique?.[2] || "").toUpperCase().trim();
    return PRICE.grades[grade] || 0;
  }
  function specialTechniquesValue(source) { return Array.isArray(source) ? source.reduce((sum, technique) => sum + gradeValue(technique), 0) : 0; }

  function calculateMarket(player, suppliedProfile) {
    const profile = { ...defaultProfile(player), ...(suppliedProfile || market.profiles?.[player.id] || {}) };
    const base = PRICE.positions[player.positionGroup] || PRICE.positions.other;
    const techniques = specialTechniquesValue(player.techniques);
    const spiritTechniques = Math.round(specialTechniquesValue(player.spirit?.tecnicas) * .5);
    const miximaxTechniques = Math.round(specialTechniquesValue(player.miximax?.tecnicas) * .5);
    const talent = PRICE.talent[Math.max(0, Math.min(5, Number(profile.talentTier) || 0))];
    const spirit = PRICE.spirit[Math.max(0, Math.min(5, Number(profile.spiritTier) || 0))];
    const armor = PRICE.armor[Math.max(0, Math.min(3, Number(profile.armorTier) || 0))];
    const miximax = PRICE.miximax[Math.max(0, Math.min(5, Number(profile.miximaxTier) || 0))];
    const capabilities = base + techniques + spiritTechniques + miximaxTechniques + talent + spirit + armor + miximax;
    const narrative = PRICE.narrative[Math.max(0, Math.min(5, Number(profile.narrativeScore) || 0))];
    const club = PRICE.clubRole[profile.clubRole] || 1;
    const performance = PRICE.performance[profile.performance] || 1;
    const injury = PRICE.injury[profile.injury] || 1;
    const contract = PRICE.contract[profile.contract] || 1;
    const demand = Math.max(0, Math.min(5, Number(profile.demand) || 0));
    const rumor = Math.max(0, Math.min(5, Number(profile.rumor) || 0));
    const marketHeat = Math.min(1.20, 1 + demand * .025 + rumor * .015);
    const rawContext = narrative * club * performance * injury * contract * marketHeat;
    const context = Math.max(.45, Math.min(2, rawContext));
    const automaticValue = Math.max(250000, Math.round((capabilities * context) / 50000) * 50000);
    const manual = Number(profile.manualValue);
    const hasManual = profile.manualValue !== null && profile.manualValue !== "" && Number.isFinite(manual) && manual > 0;
    return { profile, base, techniques, spiritTechniques, miximaxTechniques, talent, spirit, armor, miximax, capabilities, narrative, club, performance, injury, contract, marketHeat, rawContext, context, automaticValue, value: hasManual ? manual : automaticValue, change: Number(profile.change) || 0, hasManual };
  }

  const players = rawPlayers.map(player => ({ ...player }));
  function refreshAllPlayers() {
    players.forEach(player => {
      player.valuation = calculateMarket(player);
      player.marketValue = player.valuation.value;
      player.marketChange = player.valuation.change;
      player.manualMarketValue = player.valuation.hasManual;
    });
  }
  refreshAllPlayers();

  const playerById = id => players.find(player => player.id === id);
  const teamColor = team => market.teamColors?.[team] || `hsl(${Math.abs(stringHash(team)) % 360} 65% 46%)`;
  const teamStyle = team => `--team-color:${teamColor(team)}`;

  function formatValue(value) {
    const number = Number(value || 0);
    if (number >= 1000000) return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: number % 1000000 ? 1 : 0 }).format(number / 1000000)} M€`;
    if (number >= 1000) return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(number / 1000)} mil €`;
    return `${new Intl.NumberFormat("es-ES").format(number)} €`;
  }

  function formatDate(value) {
    if (!value) return "Sin fecha";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  function trendMarkup(change, compact = false) {
    const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
    const symbol = change > 0 ? "▲" : change < 0 ? "▼" : "—";
    const text = compact && change ? formatValue(Math.abs(change)).replace(" €", "") : formatValue(Math.abs(change));
    return `<span class="trend ${direction}">${symbol}${change ? ` ${text}` : ""}</span>`;
  }

  function imageMarkup(player, className = "player-avatar") {
    const src = playerImage(player);
    if (!src) return `<span class="${className} avatar-fallback">${escapeHTML(initials(player.name))}</span>`;
    return `<img class="${className}" src="${escapeHTML(src)}" alt="${escapeHTML(player.name)}" loading="lazy"><span class="${className} avatar-fallback" hidden>${escapeHTML(initials(player.name))}</span>`;
  }

  function bindImageFallbacks(root = document) {
    root.querySelectorAll("img + .avatar-fallback").forEach(fallback => {
      const image = fallback.previousElementSibling;
      if (!image || image.dataset.fallbackBound) return;
      image.dataset.fallbackBound = "true";
      image.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; });
    });
  }

  function playerCell(player) {
    return `<div class="player-cell">${imageMarkup(player)}<div class="player-info"><strong>${escapeHTML(player.name)}</strong><span>${escapeHTML(player.element || "Sin afinidad")} · ${escapeHTML(player.position || player.positionGroup || "—")}</span></div></div>`;
  }

  function clubCell(team) {
    const name = team || "Sin club";
    return `<div class="club-cell" style="${teamStyle(name)}"><span class="club-mark">${escapeHTML(initials(name))}</span><span>${escapeHTML(name)}</span></div>`;
  }

  function teamsData() {
    const map = new Map();
    players.forEach(player => {
      const team = player.team || "Sin club";
      if (!map.has(team)) map.set(team, { name: team, players: [], value: 0 });
      const entry = map.get(team);
      entry.players.push(player);
      entry.value += player.marketValue;
    });
    return [...map.values()].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "es"));
  }

  function renderHero() {
    const teams = teamsData();
    const active = players.filter(player => player.status === "Activo").length;
    const totalValue = players.reduce((total, player) => total + player.marketValue, 0);
    $("#seasonName").textContent = center.season?.name || "Temporada actual";
    $("#activeCount").textContent = active;
    $("#lastUpdate").textContent = formatDate(market.lastUpdate);
    $("#heroStats").innerHTML = `
      <div class="hero-stat"><strong>${players.length}</strong><span>jugadores</span></div>
      <div class="hero-stat"><strong>${teams.length}</strong><span>clubes</span></div>
      <div class="hero-stat"><strong>${formatValue(totalValue)}</strong><span>valor total</span></div>`;

    const top = [...players].sort((a, b) => b.marketValue - a.marketValue)[0];
    if (!top) { $("#spotlight").hidden = true; return; }
    $("#spotlight").innerHTML = `
      <div class="spotlight-player">${imageMarkup(top, "spotlight-image")}</div>
      <div class="spotlight-copy">
        <span class="spotlight-label">N.º 1 DEL MERCADO</span>
        <h2>${escapeHTML(top.name)}</h2>
        <span class="spotlight-club">${escapeHTML(top.team || "Sin club")} · ${escapeHTML(top.position || "—")}</span>
        <strong class="spotlight-value">${formatValue(top.marketValue)}</strong>
        <span class="spotlight-change">${top.marketChange >= 0 ? "▲" : "▼"} ${formatValue(Math.abs(top.marketChange))}</span>
        <button type="button" data-player-id="${escapeHTML(top.id)}">Ver expediente →</button>
      </div>`;
  }

  function renderHome() {
    const rising = [...players].sort((a, b) => b.marketChange - a.marketChange || b.marketValue - a.marketValue).slice(0, 4);
    $("#moversGrid").innerHTML = rising.map(player => `
      <article class="mover-card" data-player-id="${escapeHTML(player.id)}">
        <div class="mover-photo">${imageMarkup(player, "mover-image")}</div>
        <div class="mover-copy"><h3>${escapeHTML(player.name)}</h3><small>${escapeHTML(player.team || "Sin club")} · ${escapeHTML(player.position || "—")}</small><div class="mover-numbers"><strong>${formatValue(player.marketValue)}</strong>${trendMarkup(player.marketChange, true)}</div></div>
      </article>`).join("");

    const topPlayers = [...players].sort((a, b) => b.marketValue - a.marketValue).slice(0, 8);
    $("#valueList").innerHTML = topPlayers.map((player, index) => `
      <div class="value-row" data-player-id="${escapeHTML(player.id)}">
        <span class="rank">${index + 1}</span>${playerCell(player)}${clubCell(player.team)}<span class="position-pill">${escapeHTML(player.position || "—")}</span><strong class="market-value">${formatValue(player.marketValue)}</strong>${trendMarkup(player.marketChange, true)}<span class="row-chevron">›</span>
      </div>`).join("");

    const clubs = teamsData().slice(0, 5);
    $("#clubLeaderboard").innerHTML = `<div class="club-list">${clubs.map(club => `
      <div class="club-row"><span class="club-mark" style="${teamStyle(club.name)}">${escapeHTML(initials(club.name))}</span><div class="club-row-copy"><strong>${escapeHTML(club.name)}</strong><small>${club.players.length} jugadores</small></div><strong>${formatValue(club.value)}</strong></div>`).join("")}</div>`;
    $("#freeAgentsCount").textContent = players.filter(player => fold(player.team).includes("agente libre") || !player.team).length;
  }

  function populateFilters() {
    const teams = [...new Set(players.map(player => player.team || "Sin club"))].sort((a, b) => a.localeCompare(b, "es"));
    const positions = [...new Set(players.map(player => player.positionGroup || "Sin definir"))].sort((a, b) => a.localeCompare(b, "es"));
    $("#teamFilter").innerHTML = `<option value="all">Todos los clubes</option>${teams.map(team => `<option value="${escapeHTML(team)}">${escapeHTML(team)}</option>`).join("")}`;
    $("#positionFilter").innerHTML = `<option value="all">Todas las posiciones</option>${positions.map(position => `<option value="${escapeHTML(position)}">${escapeHTML(position)}</option>`).join("")}`;
  }

  function filteredPlayers() {
    const query = fold(state.query);
    const list = players.filter(player => {
      const matchesQuery = !query || [player.name, player.team, player.position, player.positionGroup, player.element, player.title].some(value => fold(value).includes(query));
      const matchesTeam = state.team === "all" || (player.team || "Sin club") === state.team;
      const matchesPosition = state.position === "all" || (player.positionGroup || "Sin definir") === state.position;
      return matchesQuery && matchesTeam && matchesPosition;
    });
    return list.sort((a, b) => {
      if (state.sort === "value-asc") return a.marketValue - b.marketValue;
      if (state.sort === "change-desc") return b.marketChange - a.marketChange;
      if (state.sort === "name") return a.name.localeCompare(b.name, "es");
      return b.marketValue - a.marketValue;
    });
  }

  function renderPlayers() {
    const list = filteredPlayers();
    $("#playerCountLabel").textContent = `${list.length} de ${players.length} futbolistas.`;
    $("#playersEmpty").hidden = list.length > 0;
    $("#playersTable").innerHTML = list.map((player, index) => `
      <tr data-player-id="${escapeHTML(player.id)}"><td class="rank">${index + 1}</td><td>${playerCell(player)}</td><td>${clubCell(player.team)}</td><td><span class="position-pill">${escapeHTML(player.position || player.positionGroup || "—")}</span></td><td class="market-value">${formatValue(player.marketValue)}</td><td class="trend-cell">${trendMarkup(player.marketChange, true)}</td><td class="row-chevron">›</td></tr>`).join("");
    $("#mobilePlayerList").innerHTML = list.map(player => `
      <article class="mobile-player-card" data-player-id="${escapeHTML(player.id)}">${imageMarkup(player)}<div class="mobile-player-copy"><strong>${escapeHTML(player.name)}</strong><span>${escapeHTML(player.team || "Sin club")} · ${escapeHTML(player.position || "—")}</span></div><div class="mobile-player-value"><strong>${formatValue(player.marketValue)}</strong>${trendMarkup(player.marketChange, true)}</div></article>`).join("");
    bindImageFallbacks($("#playersView"));
  }

  function renderClubs() {
    const teams = teamsData();
    const maxValue = teams[0]?.value || 1;
    $("#clubsGrid").innerHTML = teams.map(team => `
      <article class="club-card" data-club-name="${escapeHTML(team.name)}" data-initials="${escapeHTML(initials(team.name))}" style="${teamStyle(team.name)}">
        <div class="club-card-head"><span class="club-mark">${escapeHTML(initials(team.name))}</span><div><h2>${escapeHTML(team.name)}</h2><small>${team.players.length} jugadores · Media ${formatValue(team.value / team.players.length)}</small></div></div>
        <div class="club-card-value"><span>Valor de plantilla</span><strong>${formatValue(team.value)}</strong></div><div class="club-progress"><i style="--progress:${Math.max(5, team.value / maxValue * 100)}%"></i></div>
      </article>`).join("");
  }

  function renderTransfers() {
    const transfers = Array.isArray(market.transfers) ? market.transfers : [];
    const paid = transfers.reduce((total, transfer) => total + Number(transfer.fee || 0), 0);
    const record = transfers.reduce((highest, transfer) => Number(transfer.fee || 0) > Number(highest?.fee || 0) ? transfer : highest, null);
    $("#transferSummary").innerHTML = `
      <article class="summary-card"><span>Operaciones</span><strong>${transfers.length}</strong></article>
      <article class="summary-card"><span>Volumen total</span><strong>${formatValue(paid)}</strong></article>
      <article class="summary-card"><span>Fichaje récord</span><strong>${record ? formatValue(record.fee) : "—"}</strong></article>`;

    if (!transfers.length) {
      $("#transfersList").innerHTML = `<div class="transfer-empty"><div><span>⇄</span><h3>Mercado preparado</h3><p>Todavía no hay operaciones registradas. Añádelas en <b>inamarkt-datos.js</b> y aparecerán aquí automáticamente.</p></div></div>`;
      return;
    }
    $("#transfersList").innerHTML = transfers.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).map(transfer => {
      const player = playerById(transfer.playerId) || { id: transfer.playerId, name: transfer.playerName || "Jugador", position: transfer.type || "Operación" };
      return `<div class="transfer-row">${playerCell(player)}${clubCell(transfer.from || "Agente Libre")}<span class="transfer-arrow">→</span>${clubCell(transfer.to || "Agente Libre")}<strong class="transfer-fee">${transfer.fee ? formatValue(transfer.fee) : escapeHTML(transfer.type || "Libre")}</strong><time class="transfer-date">${formatDate(transfer.date)}</time></div>`;
    }).join("");
  }

  function openPlayer(id) {
    const player = playerById(id);
    if (!player) return;
    const techniques = Array.isArray(player.techniques) ? player.techniques : [];
    $("#playerDialogBody").innerHTML = `
      <div class="player-dialog-hero"><div class="dialog-photo">${imageMarkup(player, "dialog-image")}</div><div class="dialog-copy"><span class="position-pill">${escapeHTML(player.position || player.positionGroup || "—")}</span><h2>${escapeHTML(player.name)}</h2><span>${escapeHTML(player.team || "Sin club")} · ${escapeHTML(player.element || "Sin afinidad")}</span><div class="dialog-value"><small>VALOR DE MERCADO</small><strong>${formatValue(player.marketValue)}</strong> ${trendMarkup(player.marketChange, true)}</div></div></div>
      <div class="player-dialog-body"><div class="dialog-stats"><div class="dialog-stat"><strong>${Number(player.goals || 0)}</strong><span>Goles</span></div><div class="dialog-stat"><strong>${Number(player.assists || 0)}</strong><span>Asistencias</span></div><div class="dialog-stat"><strong>${Array.isArray(player.matches) ? player.matches.length : 0}</strong><span>Partidos</span></div><div class="dialog-stat"><strong>${techniques.length}</strong><span>Técnicas</span></div></div>
      <section class="dialog-section"><h3>Técnicas registradas</h3><div class="technique-list">${techniques.length ? techniques.map(technique => `<span class="technique">${escapeHTML(technique.name || technique[0] || "Técnica")}${technique.grade ? ` · ${escapeHTML(technique.grade)}` : ""}</span>`).join("") : `<span class="technique">Sin técnicas registradas</span>`}</div></section>
      ${player.title || player.talent?.nombre ? `<section class="dialog-section"><h3>Perfil</h3><div class="technique-list">${player.title ? `<span class="technique">${escapeHTML(player.title)}</span>` : ""}${player.talent?.nombre ? `<span class="technique">Talento: ${escapeHTML(player.talent.nombre)}</span>` : ""}${player.status ? `<span class="technique">${escapeHTML(player.status)}</span>` : ""}</div></section>` : ""}
      <section class="dialog-section"><h3>Composición del valor</h3><div class="technique-list"><span class="technique">Capacidades: ${formatValue(player.valuation.capabilities)}</span><span class="technique">Contexto: ×${player.valuation.context.toFixed(3)}</span>${player.valuation.hasManual ? `<span class="technique">Precio manual</span>` : `<span class="technique">Precio calculado</span>`}</div></section></div>`;
    bindImageFallbacks($("#playerDialog"));
    $("#playerDialog").showModal();
  }

  function fillSelect(id, entries) {
    $(id).innerHTML = entries.map(([value, label]) => `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`).join("");
  }

  function setupAdminOptions() {
    const tier = (max, absent = "No posee") => [["0", absent], ...Array.from({ length: max }, (_, index) => [String(index + 1), `Nivel ${index + 1}`])];
    fillSelect("#talentTier", tier(5));
    fillSelect("#spiritTier", tier(5));
    fillSelect("#armorTier", [["0", "Sin armadura"], ["1", "Inestable"], ["2", "Estable"], ["3", "Dominada"]]);
    fillSelect("#miximaxTier", tier(5));
    fillSelect("#narrativeScore", [["0", "0 · Fondo"], ["1", "1 · Secundario menor"], ["2", "2 · Secundario habitual"], ["3", "3 · Relevante"], ["4", "4 · Central en un arco"], ["5", "5 · Eje protagonista"]]);
    Object.entries(LABELS).forEach(([id, labels]) => fillSelect(`#${id}`, Object.entries(labels)));
  }

  function isAdminUnlocked() { return sessionStorage.getItem(SESSION_KEY) === "yes"; }

  function showAdminState() {
    const unlocked = isAdminUnlocked();
    $("#adminLogin").hidden = unlocked;
    $("#adminWorkspace").hidden = !unlocked;
    if (unlocked) {
      if (!state.adminPlayerId) state.adminPlayerId = players[0]?.id || "";
      renderAdminPlayerList();
      selectAdminPlayer(state.adminPlayerId);
    }
  }

  function renderAdminPlayerList() {
    const query = fold($("#adminSearch").value);
    const list = players.filter(player => !query || fold(`${player.name} ${player.team} ${player.position}`).includes(query));
    $("#adminPlayerList").innerHTML = list.map(player => `
      <button class="admin-player-button ${state.adminPlayerId === player.id ? "active" : ""} ${market.profiles?.[player.id] ? "configured" : ""}" type="button" data-admin-player-id="${escapeHTML(player.id)}">
        ${imageMarkup(player)}<span><strong>${escapeHTML(player.name)}</strong><small>${escapeHTML(player.team || "Sin club")} · ${formatValue(player.marketValue)}</small></span><i title="${market.profiles?.[player.id] ? "Revisado" : "Valores provisionales"}"></i>
      </button>`).join("");
    bindImageFallbacks($("#adminPlayerList"));
  }

  function selectAdminPlayer(id) {
    const player = playerById(id) || players[0];
    if (!player) return;
    state.adminPlayerId = player.id;
    const profile = profileFor(player);
    $("#adminPlayerId").value = player.id;
    ["talentTier", "spiritTier", "armorTier", "miximaxTier", "narrativeScore", "clubRole", "performance", "injury", "contract"].forEach(key => { $(`#${key}`).value = String(profile[key]); });
    $("#narrativeReason").value = profile.narrativeReason || "";
    $("#demand").value = Number(profile.demand) || 0;
    $("#rumor").value = Number(profile.rumor) || 0;
    $("#marketChange").value = Number(profile.change) || 0;
    $("#manualValue").value = profile.manualValue ?? "";
    $("#adminEditorHead").innerHTML = `${imageMarkup(player)}<div><h2>${escapeHTML(player.name)}</h2><p>${escapeHTML(player.team || "Sin club")} · ${escapeHTML(player.position || player.positionGroup || "—")}${market.profiles?.[player.id] ? " · Ficha revisada" : " · Valores provisionales"}</p></div><div class="editor-current-value"><small>VALOR ACTUAL</small><strong>${formatValue(player.marketValue)}</strong></div>`;
    renderAdminPlayerList();
    renderCalculationPreview();
    bindImageFallbacks($("#adminEditorHead"));
  }

  function readProfileForm() {
    return {
      talentTier: Number($("#talentTier").value),
      spiritTier: Number($("#spiritTier").value),
      armorTier: Number($("#armorTier").value),
      miximaxTier: Number($("#miximaxTier").value),
      narrativeScore: Number($("#narrativeScore").value),
      narrativeReason: $("#narrativeReason").value.trim(),
      clubRole: $("#clubRole").value,
      performance: $("#performance").value,
      injury: $("#injury").value,
      contract: $("#contract").value,
      demand: Math.max(0, Math.min(5, Number($("#demand").value) || 0)),
      rumor: Math.max(0, Math.min(5, Number($("#rumor").value) || 0)),
      change: Number($("#marketChange").value) || 0,
      manualValue: $("#manualValue").value === "" ? null : Math.max(0, Number($("#manualValue").value) || 0)
    };
  }

  function renderCalculationPreview() {
    const player = playerById($("#adminPlayerId").value);
    if (!player) return;
    const calculation = calculateMarket(player, readProfileForm());
    $("#calculationPreview").innerHTML = `<div class="calculation-head"><div><span>${calculation.hasManual ? "PRECIO MANUAL" : "VALOR CALCULADO"}</span><strong>${formatValue(calculation.value)}</strong></div><div><span>CAPACIDADES</span><strong>${formatValue(calculation.capabilities)}</strong></div></div><div class="calculation-parts"><span>Base<b>${formatValue(calculation.base)}</b></span><span>STs<b>${formatValue(calculation.techniques)}</b></span><span>Talento<b>${formatValue(calculation.talent)}</b></span><span>Espíritu + técnicas<b>${formatValue(calculation.spirit + calculation.spiritTechniques)}</b></span><span>Armadura<b>${formatValue(calculation.armor)}</b></span><span>Miximax + técnicas<b>${formatValue(calculation.miximax + calculation.miximaxTechniques)}</b></span><span>Contexto total<b>×${calculation.context.toFixed(3)}</b></span><span>Mercado<b>×${calculation.marketHeat.toFixed(3)}</b></span></div>${Math.abs(calculation.rawContext - calculation.context) > .0001 ? `<p class="calculation-warning">Se ha aplicado el límite de contexto: ×${calculation.rawContext.toFixed(3)} pasa a ×${calculation.context.toFixed(2)}.</p>` : ""}`;
  }

  function persistProfiles() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(market.profiles || {}));
    $("#adminSaveIndicator").textContent = "Cambios guardados en este navegador";
  }

  function refreshMarketUI() {
    refreshAllPlayers();
    renderHero();
    renderHome();
    renderPlayers();
    renderClubs();
    renderTransfers();
  }

  function marketDataCode() {
    const data = {
      version: 2,
      lastUpdate: new Date().toISOString().slice(0, 10),
      currency: market.currency || "EUR",
      passwordHash: market.passwordHash,
      profiles: market.profiles || {},
      transfers: market.transfers || [],
      teamColors: market.teamColors || {}
    };
    return `/*\n * INAMARKT — DATOS EDITABLES DEL MERCADO\n * Archivo generado desde la pestaña Administrar.\n */\nwindow.INAMARKT_DATA = ${JSON.stringify(data, null, 2)};\n`;
  }

  function downloadMarketData() {
    const blob = new Blob([marketDataCode()], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inamarkt-datos.js";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function saveMarketCode() {
    try {
      if ("showOpenFilePicker" in window) {
        const [handle] = await window.showOpenFilePicker({ multiple: false, types: [{ description: "Datos JavaScript de InaMarkt", accept: { "text/javascript": [".js"] } }] });
        if (handle.name !== "inamarkt-datos.js" && !confirm(`Has elegido «${handle.name}». ¿Quieres sobrescribirlo?`)) return;
        const writable = await handle.createWritable();
        await writable.write(marketDataCode());
        await writable.close();
        $("#adminSaveIndicator").textContent = "Código actualizado correctamente";
        alert("InaMarkt se ha guardado en el código.");
        return;
      }
      downloadMarketData();
      alert("Se ha descargado inamarkt-datos.js. Sustituye con él el archivo de la carpeta InaMarkt.");
    } catch (error) {
      if (error?.name !== "AbortError") alert("No se ha podido guardar el archivo. Prueba con «Descargar copia».");
    }
  }

  async function hashPassword(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function switchView(view, options = {}) {
    const next = ["home", "players", "clubs", "transfers", "methodology", "admin"].includes(view) ? view : "home";
    state.view = next;
    $$('[data-view-panel]').forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === next));
    $$('[data-view]').forEach(button => button.classList.toggle("active", button.dataset.view === next));
    $("#homeHero").hidden = next !== "home";
    $(".market-ticker").hidden = next !== "home";
    if (!options.keepHash) history.replaceState(null, "", next === "home" ? location.pathname : `#${next}`);
    if (next === "players") renderPlayers();
    if (next === "clubs") renderClubs();
    if (next === "transfers") renderTransfers();
    if (next === "admin") showAdminState();
    if (!options.noScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function connectToShellPlayer() {
    if (window.parent === window) return;
    try {
      const player = window.parent.document.querySelector(".resonance-bar:not([hidden]), .mini-player:not([hidden])");
      if (!player) return;
      const syncOffset = () => {
        const rect = player.getBoundingClientRect();
        const overlap = Math.max(0, window.parent.innerHeight - rect.top);
        document.documentElement.style.setProperty("--shell-player-offset", `${Math.round(overlap)}px`);
      };
      syncOffset();
      new ResizeObserver(syncOffset).observe(player);
      window.parent.addEventListener("resize", syncOffset, { passive: true });
    } catch (_) {
      document.documentElement.style.setProperty("--shell-player-offset", "0px");
    }
  }

  document.addEventListener("click", event => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) { switchView(viewButton.dataset.view); return; }
    const adminPlayer = event.target.closest("[data-admin-player-id]");
    if (adminPlayer) { selectAdminPlayer(adminPlayer.dataset.adminPlayerId); return; }
    const playerTarget = event.target.closest("[data-player-id]");
    if (playerTarget) { openPlayer(playerTarget.dataset.playerId); return; }
    const teamTarget = event.target.closest("[data-filter-team], [data-club-name]");
    if (teamTarget) {
      state.team = teamTarget.dataset.filterTeam || teamTarget.dataset.clubName;
      $("#teamFilter").value = state.team;
      switchView("players");
      return;
    }
    if (event.target.closest("[data-close-dialog]")) $("#playerDialog").close();
  });

  $("#playerDialog").addEventListener("click", event => { if (event.target === $("#playerDialog")) $("#playerDialog").close(); });
  $("#globalSearch").addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    state.query = event.currentTarget.value.trim();
    $("#playerSearch").value = state.query;
    switchView("players");
  });
  $("#playerSearch").addEventListener("input", event => { state.query = event.currentTarget.value; renderPlayers(); });
  $("#teamFilter").addEventListener("change", event => { state.team = event.currentTarget.value; renderPlayers(); });
  $("#positionFilter").addEventListener("change", event => { state.position = event.currentTarget.value; renderPlayers(); });
  $("#sortFilter").addEventListener("change", event => { state.sort = event.currentTarget.value; renderPlayers(); });
  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const password = $("#adminPassword").value;
    const hash = await hashPassword(password);
    if (hash !== market.passwordHash) {
      $("#loginError").hidden = false;
      $("#adminPassword").select();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "yes");
    $("#loginError").hidden = true;
    $("#adminPassword").value = "";
    showAdminState();
  });
  $("#adminLogout").addEventListener("click", () => { sessionStorage.removeItem(SESSION_KEY); showAdminState(); });
  $("#adminSearch").addEventListener("input", renderAdminPlayerList);
  $("#marketProfileForm").addEventListener("input", renderCalculationPreview);
  $("#marketProfileForm").addEventListener("change", renderCalculationPreview);
  $("#marketProfileForm").addEventListener("submit", event => {
    event.preventDefault();
    const player = playerById($("#adminPlayerId").value);
    if (!player) return;
    market.profiles ||= {};
    market.profiles[player.id] = readProfileForm();
    persistProfiles();
    refreshMarketUI();
    selectAdminPlayer(player.id);
  });
  $("#resetProfile").addEventListener("click", () => {
    const player = playerById($("#adminPlayerId").value);
    if (!player || !confirm(`¿Restaurar la valoración provisional de ${player.name}?`)) return;
    delete market.profiles[player.id];
    persistProfiles();
    refreshMarketUI();
    selectAdminPlayer(player.id);
  });
  $("#downloadMarketData").addEventListener("click", downloadMarketData);
  $("#saveMarketCode").addEventListener("click", saveMarketCode);

  setupAdminOptions();
  populateFilters();
  renderHero();
  renderHome();
  renderTransfers();
  bindImageFallbacks();
  connectToShellPlayer();
  const initialView = location.hash.replace("#", "");
  switchView(initialView || "home", { keepHash: true, noScroll: true });
})();
