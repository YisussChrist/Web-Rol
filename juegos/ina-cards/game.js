import {
  CARDS,
  CARDS_BY_ID,
  COACHES,
  COACHES_BY_ID,
  DECK_SIZE,
  LEADER,
  MAX_COPIES,
  MIN_DEFENSIVE_CARDS,
  MIN_OFFENSIVE_CARDS,
  MIN_UNIQUE_CARDS,
  STARTER_DECK,
  STARTER_UNLOCKS,
} from "./cards.js";
import { addPlayer, applyAction, createRoom, publicView } from "./engine.js";
import { SERVER_URL } from "./config.js";

const MAX_MORALE = 20;
const GUIDE_SEEN_KEY = "ina-card-guide-seen";
const COLLECTION_KEY = "ina-card-unlocks-beta-v2";
const DECK_KEY = "ina-card-active-deck-v1";
const CHALLENGE_PROGRESS_KEY = "ina-card-challenge-progress-beta-v2";
const LEGACY_STARTER_DECK = [
  "irene-villa", "irene-villa",
  "jeanne-darc", "jeanne-darc",
  "riko-wingate", "riko-wingate",
  "mavuika-heartless", "mavuika-heartless",
  "mikan-tsumiki", "mikan-tsumiki",
  "wang-qing", "wang-qing",
];

const UNLOCK_CHALLENGES = {
  "shiro-harukawa": {
    title: "Cadena perfecta",
    description: "Juega 3 cartas durante un mismo turno.",
    metric: "maxCardsInTurn",
    goal: 3,
    unit: "cartas en un turno",
  },
  "shinoa-hiiragi": {
    title: "Muralla imperturbable",
    description: "Termina una partida conservando al menos 8 de defensa.",
    metric: "bestFinishGuard",
    goal: 8,
    unit: "defensa al terminar",
  },
  "leii-ishikawa": {
    title: "Ojeadora incansable",
    description: "Roba 5 cartas adicionales a lo largo de tus partidas.",
    metric: "extraDraws",
    goal: 5,
    unit: "robos adicionales",
  },
  "renzu-ito": {
    title: "Orgullo encendido",
    description: "Realiza un ataque de 8 o más mientras tengas una potenciación activa.",
    metric: "poweredAttacks",
    goal: 1,
    unit: "ataque potenciado",
  },
  "ciro-castaneda": {
    title: "Trabajo de cantera",
    description: "Juega 12 cartas en total.",
    metric: "cardsPlayed",
    goal: 12,
    unit: "cartas jugadas",
  },
  "natsu-dragneel": {
    title: "Desde el banquillo",
    description: "Juega 6 cartas de gerente o apoyo.",
    metric: "supportPlayed",
    goal: 6,
    unit: "apoyos jugados",
  },
  "rikuo-nura": {
    title: "Ataque y defensa",
    description: "Juega 6 cartas de equilibrio.",
    metric: "balancePlayed",
    goal: 6,
    unit: "cartas de equilibrio",
  },
  "delta-hervieux": {
    title: "Portería inexpugnable",
    description: "Obtén 40 puntos de defensa mediante cartas.",
    metric: "guardGained",
    goal: 40,
    unit: "defensa obtenida",
  },
  "victor-koga": {
    title: "Hambre de gol",
    description: "Acumula 50 puntos de potencia de ataque.",
    metric: "attackDealt",
    goal: 50,
    unit: "potencia de ataque",
  },
  "pan-walker": {
    title: "Energía inagotable",
    description: "Juega 30 cartas en total.",
    metric: "cardsPlayed",
    goal: 30,
    unit: "cartas jugadas",
  },
  "nalu-tanaka": {
    title: "Marea de recursos",
    description: "Roba 12 cartas adicionales a lo largo de tus partidas.",
    metric: "extraDraws",
    goal: 12,
    unit: "robos adicionales",
  },
  "jikan-alonso": {
    title: "Ni un segundo perdido",
    description: "Termina 4 turnos gastando toda tu energía.",
    metric: "zeroEnergyTurns",
    goal: 4,
    unit: "turnos a 0 de energía",
  },
  "yachiho-azuma": {
    title: "Hora punta",
    description: "Consigue jugar 4 cartas durante un mismo turno.",
    metric: "maxCardsInTurn",
    goal: 4,
    unit: "cartas en un turno",
  },
  "yokoya-hitoyoshi": {
    title: "Control desde las sombras",
    description: "Acumula 8 puntos de debilitación sobre los ataques rivales.",
    metric: "debuffApplied",
    goal: 8,
    unit: "debilitación aplicada",
  },
  "lambda-zinaida": {
    title: "Experiencia de campo",
    description: "Completa 3 partidas, sin importar el resultado.",
    metric: "gamesFinished",
    goal: 3,
    unit: "partidas completadas",
  },
  "shinbad-ramirez": {
    title: "Disparo preparado",
    description: "Realiza 5 ataques de 8 o más con una potenciación activa.",
    metric: "poweredAttacks",
    goal: 5,
    unit: "ataques potenciados",
  },
  "bronya-wingate": {
    title: "Invierno constante",
    description: "Juega 10 cartas de afinidad Hielo.",
    metric: "iceCardsPlayed",
    goal: 10,
    unit: "cartas de Hielo",
  },
  "fubuki-sumiye": {
    title: "Escuela de porteros",
    description: "Juega 10 cartas de portero.",
    metric: "goalkeepersPlayed",
    goal: 10,
    unit: "cartas de portero",
  },
  "willow-proude": {
    title: "Romper la muralla",
    description: "Ataca 5 veces cuando el rival tenga defensa.",
    metric: "guardBreakAttacks",
    goal: 5,
    unit: "ataques contra defensa",
  },
  "miu-iruma": {
    title: "Ingeniería de campo",
    description: "Juega 10 cartas de gerente o apoyo.",
    metric: "supportPlayed",
    goal: 10,
    unit: "apoyos jugados",
  },
  "kazuichi-souda-counter": {
    title: "Desmontar la muralla",
    description: "Ataca 8 veces cuando el rival tenga defensa.",
    metric: "guardBreakAttacks",
    goal: 8,
    unit: "ataques contra defensa",
  },
  "aika-wingate-counter": {
    title: "Viento del norte",
    description: "Juega 12 cartas de afinidad Hielo.",
    metric: "iceCardsPlayed",
    goal: 12,
    unit: "cartas de Hielo",
  },
  "kyoko-kirigiri-counter": {
    title: "Todas las pistas",
    description: "Roba 15 cartas adicionales a lo largo de tus partidas.",
    metric: "extraDraws",
    goal: 15,
    unit: "robos adicionales",
  },
  "akane-owari-counter": {
    title: "Presión constante",
    description: "Acumula 70 puntos de potencia de ataque.",
    metric: "attackDealt",
    goal: 70,
    unit: "potencia de ataque",
  },
  "ishigami-senku-counter": {
    title: "Diez mil millones por ciento",
    description: "Juega 45 cartas en total.",
    metric: "cardsPlayed",
    goal: 45,
    unit: "cartas jugadas",
  },
  "kokichi-oma-counter": {
    title: "Engaño de campeonato",
    description: "Completa 5 partidas, sin importar el resultado.",
    metric: "gamesFinished",
    goal: 5,
    unit: "partidas completadas",
  },
};

const RARITIES = {
  normal: { label: "Normal", description: "Carta directa y sencilla" },
  special: { label: "Especial", description: "Técnica o apoyo avanzado del cuerpo técnico" },
  awakened: { label: "Despertada", description: "Versión mejorada que necesita su carta base" },
};

const ROLES = {
  attack: { label: "Ataque", icon: "⚔️" },
  defense: { label: "Defensa", icon: "🛡️" },
  strategy: { label: "Táctica", icon: "⚡" },
  weakening: { label: "Debilitación", icon: "⛓️" },
  balance: { label: "Equilibrio", icon: "🔄" },
  support: { label: "Apoyo", icon: "📋" },
};

const AFFINITY_ICONS = {
  Fuego: "🔥",
  Agua: "💧",
  Hielo: "❄️",
  Metal: "⚙️",
  Sombra: "🌑",
  Bosque: "🌿",
  Aire: "🌪️",
  Dragón: "🐉",
  Fuerza: "💥",
  Montaña: "⛰️",
  Sangre: "🩸",
  Tierra: "🪨",
  Neutral: "✦",
};

const elements = {
  lobby: document.querySelector("#lobby-screen"),
  notebook: document.querySelector("#notebook-screen"),
  waiting: document.querySelector("#waiting-screen"),
  game: document.querySelector("#game-screen"),
  name: document.querySelector("#player-name"),
  code: document.querySelector("#room-code"),
  create: document.querySelector("#create-room"),
  join: document.querySelector("#join-room"),
  demo: document.querySelector("#local-demo"),
  connectionNote: document.querySelector("#connection-note"),
  shownCode: document.querySelector("#shown-room-code"),
  copyCode: document.querySelector("#copy-code"),
  playerList: document.querySelector("#player-list"),
  ready: document.querySelector("#ready-button"),
  leaveRoom: document.querySelector("#leave-room"),
  waitingNote: document.querySelector("#waiting-note"),
  leaveMatch: document.querySelector("#leave-match"),
  matchCode: document.querySelector("#match-room-code"),
  turnCallout: document.querySelector("#turn-callout"),
  turnSymbol: document.querySelector("#turn-symbol"),
  turn: document.querySelector("#turn-label"),
  turnGuidance: document.querySelector("#turn-guidance"),
  opponentName: document.querySelector("#opponent-name"),
  opponentMorale: document.querySelector("#opponent-morale"),
  opponentGuard: document.querySelector("#opponent-guard"),
  opponentHand: document.querySelector("#opponent-hand"),
  myName: document.querySelector("#my-name"),
  myMorale: document.querySelector("#my-morale"),
  myGuard: document.querySelector("#my-guard"),
  myEnergy: document.querySelector("#my-energy"),
  coachPanel: document.querySelector("#coach-panel"),
  coachImage: document.querySelector("#coach-image"),
  coachKicker: document.querySelector("#coach-kicker"),
  coachName: document.querySelector("#coach-name"),
  coachDescription: document.querySelector("#coach-description"),
  useLeader: document.querySelector("#use-leader"),
  leaderStatus: document.querySelector("#leader-status"),
  effects: document.querySelector("#effect-strip"),
  log: document.querySelector("#match-log"),
  hand: document.querySelector("#card-hand"),
  handMessage: document.querySelector("#hand-message"),
  useInvention: document.querySelector("#use-invention"),
  endTurn: document.querySelector("#end-turn"),
  rules: document.querySelector("#rules-dialog"),
  rulesTriggers: document.querySelectorAll(".rules-trigger"),
  closeRules: document.querySelector("#close-rules"),
  finishRules: document.querySelector("#finish-rules"),
  cardDetail: document.querySelector("#card-detail-dialog"),
  closeCardDetail: document.querySelector("#close-card-detail"),
  cardDetailRarity: document.querySelector("#card-detail-rarity"),
  cardDetailTitle: document.querySelector("#card-detail-title"),
  cardDetailContent: document.querySelector("#card-detail-content"),
  cardDetailStatus: document.querySelector("#card-detail-status"),
  playDetailedCard: document.querySelector("#play-detailed-card"),
  choice: document.querySelector("#choice-dialog"),
  choiceEyebrow: document.querySelector("#choice-eyebrow"),
  choiceTitle: document.querySelector("#choice-title"),
  choiceDescription: document.querySelector("#choice-description"),
  choiceGrid: document.querySelector("#choice-grid"),
  choiceNote: document.querySelector("#choice-note"),
  closeChoice: document.querySelector("#close-choice"),
  statChips: document.querySelectorAll(".stat-chip"),
  notebookTriggers: document.querySelectorAll(".notebook-trigger"),
  closeNotebook: document.querySelector("#close-notebook"),
  collectionTab: document.querySelector("#collection-tab"),
  deckTab: document.querySelector("#deck-tab"),
  collectionPanel: document.querySelector("#collection-panel"),
  deckPanel: document.querySelector("#deck-panel"),
  collectionCount: document.querySelector("#collection-count"),
  collectionProgressBar: document.querySelector("#collection-progress-bar"),
  notebookGrid: document.querySelector("#notebook-grid"),
  coachCollectionGrid: document.querySelector("#coach-collection-grid"),
  deckTabCount: document.querySelector("#deck-tab-count"),
  deckRules: document.querySelector("#deck-rules"),
  deckCount: document.querySelector("#deck-count"),
  selectedDeckList: document.querySelector("#selected-deck-list"),
  deckCardGrid: document.querySelector("#deck-card-grid"),
  resetDeck: document.querySelector("#reset-deck"),
  saveDeck: document.querySelector("#save-deck"),
  deckMessage: document.querySelector("#deck-message"),
  unlockToast: document.querySelector("#unlock-toast"),
  unlockToastName: document.querySelector("#unlock-toast-name"),
};

let socket = null;
let token = "";
let view = null;
let localState = null;
let localMode = false;
let selectedCardId = "";
let guideOffered = false;
let choiceMode = "";
let previousScreen = "lobby";
let currentScreen = "lobby";
let cardsPlayedThisTurn = 0;
let lastFinishedChallenge = "";
let unlockToastTimer = 0;
let unlockedCards = loadUnlockedCards();
let challengeProgress = loadChallengeProgress();
let workingDeck = getActiveDeck();

elements.name.value = localStorage.getItem("ina-card-nickname") || "";

elements.create.addEventListener("click", createOnlineRoom);
elements.join.addEventListener("click", joinOnlineRoom);
elements.demo.addEventListener("click", startLocalDemo);
elements.ready.addEventListener("click", () => sendAction({ type: "ready", ready: !view?.me.ready }));
elements.endTurn.addEventListener("click", () => sendAction({ type: "end-turn" }));
elements.leaveRoom.addEventListener("click", leaveSession);
elements.leaveMatch.addEventListener("click", leaveSession);
elements.copyCode.addEventListener("click", copyRoomCode);
elements.rulesTriggers.forEach((button) => button.addEventListener("click", openRules));
elements.closeRules.addEventListener("click", () => elements.rules.close());
elements.finishRules.addEventListener("click", finishRules);
elements.closeCardDetail.addEventListener("click", closeCardDetail);
elements.playDetailedCard.addEventListener("click", playSelectedCard);
elements.useLeader.addEventListener("click", openLeaderChoice);
elements.useInvention.addEventListener("click", openInventionChoice);
elements.closeChoice.addEventListener("click", closeChoiceDialog);
elements.statChips.forEach((chip) => chip.addEventListener("click", () => showContextHelp(chip.dataset.help)));
elements.notebookTriggers.forEach((button) => button.addEventListener("click", openNotebook));
elements.closeNotebook.addEventListener("click", closeNotebook);
elements.collectionTab.addEventListener("click", () => showNotebookTab("collection"));
elements.deckTab.addEventListener("click", () => showNotebookTab("deck"));
elements.resetDeck.addEventListener("click", resetWorkingDeck);
elements.saveDeck.addEventListener("click", saveWorkingDeck);

elements.code.addEventListener("input", () => {
  elements.code.value = elements.code.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
});

elements.code.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinOnlineRoom();
});

elements.rules.addEventListener("click", (event) => closeOnBackdrop(event, elements.rules));
elements.cardDetail.addEventListener("click", (event) => closeOnBackdrop(event, elements.cardDetail));
elements.choice.addEventListener("cancel", (event) => {
  if (choiceMode === "pending") event.preventDefault();
});

async function createOnlineRoom() {
  const name = getName();
  if (!name || !ensureServer()) return;
  setBusy(true, "Creando sala…");

  try {
    const session = await apiRequest("/api/rooms", {
      method: "POST",
      body: { name, deck: getActiveDeck() },
    });
    enterOnlineSession(session);
  } catch (error) {
    showLobbyError(error.message);
  } finally {
    setBusy(false);
  }
}

async function joinOnlineRoom() {
  const name = getName();
  const code = elements.code.value.trim().toUpperCase();
  if (!name || !ensureServer()) return;
  if (code.length !== 6) {
    showLobbyError("Escribe el código completo de seis caracteres.");
    elements.code.focus();
    return;
  }

  setBusy(true, "Entrando en la sala…");
  try {
    const session = await apiRequest(`/api/rooms/${code}/join`, {
      method: "POST",
      body: { name, deck: getActiveDeck() },
    });
    enterOnlineSession(session);
  } catch (error) {
    showLobbyError(error.message);
  } finally {
    setBusy(false);
  }
}

function startLocalDemo() {
  const firstName = getName(false) || "Jugador 1";
  const activeDeck = getActiveDeck();
  const first = { token: randomToken(), name: firstName, deck: activeDeck };
  const second = { token: randomToken(), name: "Jugador 2", deck: activeDeck };
  localState = createRoom("LOCAL1", first);
  addPlayer(localState, second);
  applyAction(localState, first.token, { type: "ready", ready: true });
  applyAction(localState, second.token, { type: "ready", ready: true });
  token = localState.players[localState.turn].token;
  localMode = true;
  view = publicView(localState, token);
  render();
  showContextHelp("Modo local: al terminar el turno, el control pasa al otro jugador.");
}

function enterOnlineSession(session) {
  token = session.token;
  localMode = false;
  connectSocket(session.code, session.token);
}

function connectSocket(code, playerToken) {
  if (socket) socket.close();
  const socketBase = SERVER_URL.replace(/^http/, "ws");
  socket = new WebSocket(`${socketBase}/api/rooms/${code}/connect?token=${encodeURIComponent(playerToken)}`);
  showScreen("waiting");
  elements.shownCode.textContent = code;
  elements.waitingNote.textContent = "Conectando con la sala…";

  socket.addEventListener("open", () => {
    elements.waitingNote.textContent = "Conectado.";
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "state") {
        view = message.state;
        elements.waitingNote.textContent = "";
        render();
      } else if (message.type === "error") {
        showActionError(message.message);
      }
    } catch {
      showActionError("La sala ha enviado una respuesta que no se ha podido leer.");
    }
  });

  socket.addEventListener("close", () => {
    if (!localMode && view?.phase !== "finished") {
      showActionError("Se ha perdido la conexión con la sala. Vuelve al menú e inténtalo de nuevo.");
    }
  });

  socket.addEventListener("error", () => {
    showActionError("No se ha podido conectar con el servidor de partidas.");
  });
}

function sendAction(action) {
  clearActionError();
  const challengeEvent = getChallengeEvent(action);
  if (localMode) {
    try {
      applyAction(localState, token, action);
      recordSuccessfulAction(challengeEvent);
      if (action.type === "end-turn" && localState.phase === "playing") {
        token = localState.players[localState.turn].token;
      }
      view = publicView(localState, token);
      render();
    } catch (error) {
      showActionError(error.message);
    }
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    showActionError("Todavía no hay conexión con la sala.");
    return;
  }
  socket.send(JSON.stringify(action));
  recordSuccessfulAction(challengeEvent);
}

function render() {
  if (!view) return;
  const keepNotebookOpen = currentScreen === "notebook";
  if (view.phase === "waiting") {
    renderWaiting();
  } else {
    renderGame();
  }
  if (keepNotebookOpen) {
    previousScreen = view.phase === "waiting" ? "waiting" : "game";
    showScreen("notebook");
    renderNotebook();
  }
}

function renderWaiting() {
  showScreen("waiting");
  elements.shownCode.textContent = view.roomCode;
  elements.playerList.replaceChildren();

  for (const player of [view.me, view.opponent].filter(Boolean)) {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const status = document.createElement("span");
    name.textContent = player.name;
    status.textContent = player.ready ? "Preparado" : "Esperando";
    status.className = player.ready ? "player-ready" : "";
    item.append(name, status);
    elements.playerList.append(item);
  }

  if (!view.opponent) {
    const item = document.createElement("li");
    item.innerHTML = "<strong>Segundo jugador</strong><span>Sin conectar</span>";
    elements.playerList.append(item);
  }

  elements.ready.textContent = view.me.ready ? "Dejar de estar preparado" : "Estoy preparado";
}

function renderGame() {
  showScreen("game");
  elements.matchCode.textContent = localMode ? "PRUEBA LOCAL" : view.roomCode;
  elements.myName.textContent = view.me.name;
  elements.myMorale.textContent = view.me.morale;
  elements.myGuard.textContent = view.me.guard;
  elements.myEnergy.textContent = `${view.me.energy}/${view.me.maxEnergy}`;

  elements.opponentName.textContent = view.opponent?.name || "Sin rival";
  elements.opponentMorale.textContent = view.opponent?.morale ?? 0;
  elements.opponentGuard.textContent = view.opponent?.guard ?? 0;
  elements.opponentHand.textContent = view.opponent?.handCount ?? 0;

  renderTurnState();
  renderEffects();
  renderLog();
  renderHand();
  renderLeader();
  renderInvention();
  renderPendingChoice();
  checkFinishedChallenges();
  elements.endTurn.disabled = !view.isMyTurn || view.phase !== "playing" || Boolean(view.me.pendingChoice);

  if (!guideOffered && !localStorage.getItem(GUIDE_SEEN_KEY)) {
    guideOffered = true;
    window.setTimeout(openRules, 300);
  }
}

function renderTurnState() {
  elements.turnCallout.classList.remove("mine", "waiting", "finished", "lost");

  if (view.phase === "finished") {
    elements.turn.textContent = view.didIWin ? "¡Victoria!" : "Partido terminado";
    elements.turnGuidance.textContent = view.didIWin
      ? "Has llevado la moral rival a cero. ¡Gran combinación!"
      : `${view.winnerName} ha llevado tu moral a cero.`;
    elements.turnSymbol.textContent = view.didIWin ? "🏆" : "⏱️";
    elements.turnCallout.classList.add("finished");
    if (!view.didIWin) elements.turnCallout.classList.add("lost");
    return;
  }

  if (view.isMyTurn) {
    if (view.me.pendingChoice) {
      elements.turn.textContent = view.me.pendingChoice.type === "tactical-role" ? "Robo Táctico" : "Decisión táctica";
      elements.turnGuidance.textContent = view.me.pendingChoice.type === "tactical-role"
        ? "Tu mano necesita una respuesta. Elige buscar ataque o defensa."
        : "Elige una de las cartas encontradas antes de continuar tu turno.";
      elements.turnSymbol.textContent = "🔎";
      elements.turnCallout.classList.add("mine");
      return;
    }
    const playableCount = view.me.hand.filter((cardId) => getCardAvailability(CARDS_BY_ID[cardId]).canPlay).length;
    elements.turn.textContent = "Tu turno";
    elements.turnGuidance.textContent = playableCount
      ? `Tienes ${view.me.energy} de energía y ${playableCount} ${playableCount === 1 ? "carta disponible" : "cartas disponibles"}. Elige tu jugada.`
      : "No puedes jugar ninguna carta ahora. Termina el turno para recuperar energía.";
    elements.turnSymbol.textContent = "⚡";
    elements.turnCallout.classList.add("mine");
  } else {
    elements.turn.textContent = `Turno de ${view.currentPlayerName}`;
    elements.turnGuidance.textContent = "Observa sus jugadas y prepara tu respuesta. Tus cartas permanecen ocultas.";
    elements.turnSymbol.textContent = "⏳";
    elements.turnCallout.classList.add("waiting");
  }
}

function renderEffects() {
  const effects = [];
  if (view.me.affinityChain && view.me.affinityCount) {
    const next = view.me.affinityCount === 1 ? "La siguiente activa Resonancia +1" : "La siguiente activa Afinidad Total";
    effects.push(createTag(`${getAffinityIcon(view.me.affinityChain)} ${view.me.affinityChain} ×${view.me.affinityCount} · ${next}`, "affinity"));
  }
  for (const talent of view.me.activeTalents || []) {
    effects.push(createTag(`✦ ${talent.name} activo — ${talent.text}`, "talent"));
  }
  if (view.me.attackBuff) effects.push(createTag(`Tu próximo ataque recibe +${view.me.attackBuff}`, "buff"));
  if (view.me.weakness) effects.push(createTag(`Tu próximo ataque pierde ${view.me.weakness}`, "debuff"));
  if (view.me.costReduction) effects.push(createTag(`${view.me.costReduction} cartas cuestan 1 menos`, "good"));
  if (view.me.nextCardDiscount) effects.push(createTag(`Tu próxima carta cuesta ${view.me.nextCardDiscount} menos`, "good"));
  if (view.me.nextAffinityDiscount) effects.push(createTag(`${getAffinityIcon(view.me.nextAffinityDiscount.affinity)} Próxima ${view.me.nextAffinityDiscount.affinity}: −${view.me.nextAffinityDiscount.amount}`, "affinity"));
  if (view.me.fatigue) effects.push(createTag(`Próximo agotamiento: −${view.me.fatigue + 1} de moral`, "debuff"));
  if (view.me.healingBlock) effects.push(createTag("Tu próxima curación será anulada", "debuff"));
  if (view.me.drawLock) effects.push(createTag("Tu próximo robo adicional será anulado", "debuff"));
  if (view.me.talentSilenced) effects.push(createTag("Tus talentos están silenciados este turno", "debuff"));
  if (view.me.coachLocked) effects.push(createTag("Tu entrenador está bloqueado este turno", "debuff"));
  if (view.opponent?.attackBuff) effects.push(createTag(`El próximo ataque rival recibe +${view.opponent.attackBuff}`, "rival"));
  if (view.opponent?.weakness) effects.push(createTag(`El próximo ataque rival pierde ${view.opponent.weakness}`, "good"));

  if (!effects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No hay aumentos ni debilitaciones pendientes.";
    effects.push(empty);
  }
  elements.effects.replaceChildren(...effects);
}

function renderLog() {
  elements.log.replaceChildren();
  [...view.log].reverse().forEach((entry, index) => {
    const item = document.createElement("li");
    if (index === 0) item.className = "latest";
    item.textContent = entry;
    elements.log.append(item);
  });
}

function renderHand() {
  elements.hand.replaceChildren();
  const lanes = [
    { id: "attack", icon: "⚔️", title: "Ataque", hint: "Presiona la moral rival", cards: [] },
    { id: "defense", icon: "🛡️", title: "Defensa", hint: "Protege tu equipo", cards: [] },
    { id: "tactics", icon: "📋", title: "Táctica y apoyo", hint: "Combos, gerentes y equilibrio", cards: [] },
  ];
  for (const cardId of view.me.hand) {
    const card = CARDS_BY_ID[cardId];
    if (!card) continue;
    const lane = getHandLane(card);
    lanes.find((entry) => entry.id === lane)?.cards.push(card);
  }
  for (const lane of lanes) {
    const section = document.createElement("section");
    section.className = `hand-lane hand-lane-${lane.id}`;
    section.innerHTML = `<header><span>${lane.icon}</span><div><strong>${lane.title}</strong><small>${lane.hint}</small></div><b>${lane.cards.length}</b></header><div class="hand-lane-track"></div>`;
    const track = section.querySelector(".hand-lane-track");
    for (const card of lane.cards) track.append(createCard(card));
    if (!lane.cards.length) {
      const empty = document.createElement("p");
      empty.className = "empty-lane";
      empty.textContent = lane.id === "attack" ? "Sin cartas ofensivas" : lane.id === "defense" ? "Sin cartas defensivas" : "Sin apoyos";
      track.append(empty);
    }
    elements.hand.append(section);
  }

  if (!view.me.hand.length) {
    const empty = document.createElement("p");
    empty.className = "empty-hand";
    empty.textContent = "No te quedan cartas en la mano.";
    elements.hand.append(empty);
  }

  if (elements.cardDetail.open && selectedCardId && !view.me.hand.includes(selectedCardId)) {
    closeCardDetail();
  }
}

function getHandLane(card) {
  const attacks = (card.attack || 0) > 0;
  const defends = (card.guard || 0) > 0;
  if (card.category === "support" || (attacks && defends) || (!attacks && !defends)) return "tactics";
  return attacks ? "attack" : "defense";
}

function renderLeader() {
  const coach = COACHES_BY_ID[view.me.leaderId] || LEADER;
  const hasDiscard = view.me.discard.length > 0;
  const hasCardsToScout = view.me.deckCount + view.me.discardCount > 0;
  const baseCanUse = view.phase === "playing"
    && view.isMyTurn
    && !view.me.leaderUsed
    && !view.me.coachLocked
    && !view.me.pendingChoice;
  const needsDiscard = coach.abilityType === "rewind";
  const needsScoutCards = coach.abilityType === "ninja-scout";
  const needsHandSpace = ["rewind", "ninja-scout"].includes(coach.abilityType);
  const canUse = baseCanUse
    && (!needsDiscard || hasDiscard)
    && (!needsScoutCards || hasCardsToScout)
    && (!needsHandSpace || view.me.handCount < 8);

  elements.coachPanel.style.setProperty("--coach-color", coach.color || "#e1596d");
  elements.coachPanel.dataset.symbol = coach.symbol || "★";
  elements.coachImage.src = coach.image;
  elements.coachImage.alt = coach.name;
  elements.coachKicker.textContent = `${coach.version} · ${coach.team}`;
  elements.coachName.textContent = coach.name;
  elements.coachDescription.innerHTML = `<strong>${escapeHtml(coach.abilityName)}:</strong> ${escapeHtml(coach.abilityText)}`;

  elements.useLeader.disabled = !canUse;
  elements.useLeader.innerHTML = `
    <span>${view.me.leaderUsed ? "Habilidad usada" : `Usar ${escapeHtml(coach.abilityName)}`}</span>
    <small>${escapeHtml(coach.abilityText)}</small>
  `;
  elements.useLeader.title = `${coach.abilityName}: ${coach.abilityText}`;
  elements.useLeader.setAttribute("aria-label", `${view.me.leaderUsed ? "Habilidad usada" : "Activar habilidad"}. ${coach.abilityName}: ${coach.abilityText}`);
  if (view.me.leaderUsed) {
    elements.leaderStatus.textContent = "Agotado";
    elements.leaderStatus.className = "coach-status used";
  } else if (view.me.coachLocked) {
    elements.leaderStatus.textContent = "Bloqueado por Presión al banquillo";
    elements.leaderStatus.className = "coach-status waiting";
  } else if (needsDiscard && !hasDiscard) {
    elements.leaderStatus.textContent = "Necesitas una carta descartada";
    elements.leaderStatus.className = "coach-status waiting";
  } else if (needsScoutCards && !hasCardsToScout) {
    elements.leaderStatus.textContent = "No quedan cartas que buscar";
    elements.leaderStatus.className = "coach-status waiting";
  } else if (needsHandSpace && view.me.handCount >= 8) {
    elements.leaderStatus.textContent = "Tu mano está llena";
    elements.leaderStatus.className = "coach-status waiting";
  } else if (!view.isMyTurn || view.me.pendingChoice) {
    elements.leaderStatus.textContent = "Espera tu momento";
    elements.leaderStatus.className = "coach-status waiting";
  } else {
    elements.leaderStatus.textContent = "Disponible · una vez por partida";
    elements.leaderStatus.className = "coach-status ready";
  }
}

function renderInvention() {
  const active = hasActiveTalent("miu-iruma");
  const used = Boolean(view.me.talentUses?.invencion);
  const hasEligibleCard = view.me.hand.some((cardId) => {
    const card = CARDS_BY_ID[cardId];
    const attacks = (card?.attack || 0) > 0;
    const defends = (card?.guard || 0) > 0;
    return attacks !== defends;
  });
  elements.useInvention.hidden = !active;
  elements.useInvention.disabled = !view.isMyTurn || used || !hasEligibleCard || Boolean(view.me.pendingChoice);
  elements.useInvention.innerHTML = used
    ? "✓ Invención utilizada"
    : "🔧 Usar Invención";
  elements.useInvention.title = "Cambia una carta ofensiva por una defensiva, o al revés.";
}

function renderPendingChoice() {
  const pending = view.me.pendingChoice;
  if (!pending) {
    if (choiceMode === "pending" && elements.choice.open) elements.choice.close();
    if (choiceMode === "pending") choiceMode = "";
    return;
  }

  choiceMode = "pending";
  if (pending.type === "tactical-role") {
    elements.choiceEyebrow.textContent = "Robo Táctico · inicio del turno";
    elements.choiceTitle.textContent = "¿Qué necesita tu equipo?";
    elements.choiceDescription.textContent = "Este robo sustituye al robo normal y evita que una mano desequilibrada te deje sin respuesta.";
    elements.choiceNote.textContent = hasActiveTalent("leii-ishikawa")
      ? "Perspicacia está activa: después podrás elegir entre hasta 3 cartas compatibles."
      : "Recibirás una carta aleatoria de la función que elijas.";
    elements.closeChoice.hidden = true;
    renderTacticalRoleChoices(pending.roles || []);
    if (!elements.choice.open) elements.choice.showModal();
    return;
  }
  const coachChoice = pending.type === "coach-scout";
  const tacticalChoice = pending.type === "tactical-scout";
  elements.choiceEyebrow.textContent = coachChoice
    ? "Code · Lectura Shinobi"
    : tacticalChoice
      ? "Leii Ishikawa · Perspicacia"
      : "Leii Ishikawa · Lectura desde la Banda";
  elements.choiceTitle.textContent = "Elige la próxima jugada";
  elements.choiceDescription.textContent = coachChoice
    ? "Code ha localizado estas opciones. Añade una a tu mano y devuelve las demás al fondo."
    : tacticalChoice
      ? `Perspicacia ha encontrado estas cartas ${pending.role === "attack" ? "ofensivas" : "defensivas"}. Elige una.`
      : "Añade una de estas cartas a tu mano. Las demás volverán al fondo del mazo.";
  elements.choiceNote.textContent = "Debes realizar esta elección antes de continuar el turno.";
  elements.closeChoice.hidden = true;
  renderChoiceCards(pending.cardIds, (cardId) => sendAction({ type: "choose-card", cardId }));
  if (!elements.choice.open) elements.choice.showModal();
}

function renderTacticalRoleChoices(roles) {
  elements.choiceGrid.replaceChildren();
  const choices = {
    attack: { icon: "⚔️", title: "Buscar ataque", text: "Encuentra una carta capaz de dañar la moral rival." },
    defense: { icon: "🛡️", title: "Buscar defensa", text: "Encuentra una carta capaz de levantar tu muralla." },
  };
  for (const role of roles) {
    const option = choices[role];
    if (!option) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tactical-role-choice tactical-role-${role}`;
    button.innerHTML = `<span>${option.icon}</span><strong>${option.title}</strong><small>${option.text}</small>`;
    button.addEventListener("click", () => sendAction({ type: "tactical-draw", role }));
    elements.choiceGrid.append(button);
  }
}

function openInventionChoice() {
  if (!view?.isMyTurn || !hasActiveTalent("miu-iruma") || view.me.talentUses?.invencion || view.me.pendingChoice) return;
  const eligible = [...new Set(view.me.hand)].filter((cardId) => {
    const card = CARDS_BY_ID[cardId];
    const attacks = (card?.attack || 0) > 0;
    const defends = (card?.guard || 0) > 0;
    return attacks !== defends;
  });
  if (!eligible.length) return;
  choiceMode = "invention";
  elements.choiceEyebrow.textContent = "Miu Iruma · Talento activo";
  elements.choiceTitle.textContent = "Invención";
  elements.choiceDescription.textContent = "Elige una carta ofensiva o defensiva. Miu la cambiará por una carta aleatoria de la función contraria.";
  elements.choiceNote.textContent = "Puede utilizarse una vez por turno mientras Miu permanezca en el descarte.";
  elements.closeChoice.hidden = false;
  renderChoiceCards(eligible, (cardId) => {
    closeChoiceDialog();
    sendAction({ type: "invent-card", cardId });
  });
  if (!elements.choice.open) elements.choice.showModal();
}

function openLeaderChoice() {
  if (!view || !view.isMyTurn || view.me.leaderUsed || view.me.pendingChoice) return;
  const coach = COACHES_BY_ID[view.me.leaderId] || LEADER;
  if (coach.abilityType !== "rewind") {
    sendAction({ type: "coach-ability" });
    return;
  }
  if (!view.me.discard.length || view.me.handCount >= 8) return;
  choiceMode = "leader";
  elements.choiceEyebrow.textContent = `${coach.name} · ${coach.version}`;
  elements.choiceTitle.textContent = coach.abilityName;
  elements.choiceDescription.textContent = "Elige la carta del descarte que quieres devolver a tu mano.";
  elements.choiceNote.textContent = "Zafkiel solo puede utilizarse una vez por partida.";
  elements.closeChoice.hidden = false;
  const cardIds = [...new Set([...view.me.discard].reverse())];
  renderChoiceCards(cardIds, (cardId) => {
    closeChoiceDialog();
    sendAction({ type: "coach-ability", cardId });
  });
  if (!elements.choice.open) elements.choice.showModal();
}

function renderChoiceCards(cardIds, onChoose) {
  elements.choiceGrid.replaceChildren();
  for (const cardId of cardIds) {
    const card = CARDS_BY_ID[cardId];
    if (!card) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-card rarity-${card.rarity || "normal"}`;
    button.innerHTML = `
      <img src="${escapeHtml(card.image)}" alt="" />
      <span><small>${escapeHtml(card.team)}</small><strong>${escapeHtml(card.name)}</strong><em>${escapeHtml(card.version)}</em></span>
      <b>Elegir</b>
    `;
    button.querySelector("img").addEventListener("error", (event) => {
      event.currentTarget.hidden = true;
    });
    button.addEventListener("click", () => onChoose(cardId));
    elements.choiceGrid.append(button);
  }
}

function closeChoiceDialog() {
  if (choiceMode === "pending") return;
  if (elements.choice.open) elements.choice.close();
  choiceMode = "";
}

function createCard(card) {
  const rarity = RARITIES[card.rarity] || RARITIES.normal;
  const role = ROLES[card.role] || { label: card.kind, icon: "⭐" };
  const availability = getCardAvailability(card);
  const effectiveCost = getEffectiveCardCost(card);
  const article = document.createElement("article");
  article.className = `game-card rarity-${card.rarity || "normal"} role-${card.role || "balance"}${availability.canPlay ? " playable" : " unavailable"}`;
  article.setAttribute("aria-label", `${rarity.label}: ${card.name}, ${card.version}`);

  article.innerHTML = `
    <div class="card-topline">
      <span class="rarity-badge rarity-${escapeHtml(card.rarity || "normal")}">${escapeHtml(rarity.label)}</span>
      <span class="card-cost${effectiveCost < card.cost ? " discounted" : ""}" aria-label="Cuesta ${effectiveCost} de energía${effectiveCost < card.cost ? `, reducido desde ${card.cost}` : ""}">⚡ ${effectiveCost}</span>
    </div>
    <div class="card-visual" aria-hidden="true">
      <img class="card-character-image" src="${escapeHtml(card.image)}" alt="" />
      <span class="role-icon">${role.icon}</span>
      <strong class="card-monogram">${escapeHtml(getInitials(card.name))}</strong>
      <span>${escapeHtml(card.team)} · ${getAffinityIcon(card.affinity)} ${escapeHtml(card.affinity || role.label)}</span>
    </div>
    <div class="card-identity">
      <h4>${escapeHtml(card.name)}</h4>
      <p class="card-version">${escapeHtml(card.version)}</p>
    </div>
    <div class="effect-pills">${getEffectPills(card).join("")}</div>
    <p class="card-text">${escapeHtml(getClearCardText(card))}</p>
    <div class="card-preview"><span>Si la juegas ahora</span><strong>${escapeHtml(getCurrentResult(card))}</strong></div>
    <p class="card-status ${availability.canPlay ? "ready" : "blocked"}">${availability.canPlay ? "✓ Lista para jugar" : `ⓘ ${escapeHtml(availability.reason)}`}</p>
    <div class="card-actions">
      <button class="card-details-button" type="button">Ver detalles</button>
      <button class="card-play-button" type="button" ${availability.canPlay ? "" : "disabled"}>Jugar</button>
    </div>
  `;

  article.querySelector(".card-details-button").addEventListener("click", () => openCardDetail(card.id));
  article.querySelector(".card-play-button").addEventListener("click", () => sendAction({ type: "play-card", cardId: card.id }));
  article.querySelector(".card-character-image").addEventListener("error", (event) => {
    event.currentTarget.hidden = true;
  });
  return article;
}

function getCardAvailability(card) {
  if (!view || view.phase === "finished") return { canPlay: false, reason: "La partida ha terminado" };
  if (!view.isMyTurn) return { canPlay: false, reason: "Espera a tu turno" };
  if (view.me.pendingChoice) return { canPlay: false, reason: "Completa primero la elección de cartas" };
  if (card.evolutionOf && !view.me.discard.includes(card.evolutionOf)) {
    const base = CARDS_BY_ID[card.evolutionOf];
    return { canPlay: false, reason: `Juega antes la versión base de ${base?.name || "este personaje"}` };
  }
  const effectiveCost = getEffectiveCardCost(card);
  if (effectiveCost > view.me.energy) {
    const missing = effectiveCost - view.me.energy;
    return { canPlay: false, reason: `Te ${missing === 1 ? "falta" : "faltan"} ${missing} de energía` };
  }
  return { canPlay: true, reason: "Lista para jugar" };
}

function getEffectiveCardCost(card) {
  if (!view?.me) return card.cost;
  let discount = view.me.costReduction ? 1 : 0;
  discount += view.me.nextCardDiscount || 0;
  const affinityDiscount = view.me.nextAffinityDiscount;
  if (affinityDiscount && card.affinity && affinityDiscount.affinity === card.affinity) {
    discount += affinityDiscount.amount || 0;
  }
  if (hasActiveTalent("yachiho-azuma") && view.me.cardsPlayedThisTurn === 1) discount += 1;
  return Math.max(0, card.cost - discount);
}

function getEffectPills(card) {
  const pills = [];
  if (card.attack) pills.push(effectPill("attack", "⚔️", card.attack, "Ataque base"));
  if (card.guard) pills.push(effectPill("guard", "🛡️", card.guard, "Defensa que obtienes"));
  if (card.buff) pills.push(effectPill("buff", "⚡", `+${card.buff}`, "Aumento al próximo ataque"));
  if (card.debuff) pills.push(effectPill("debuff", "⛓️", `−${card.debuff}`, "Reducción al próximo ataque rival"));
  if (card.heal) pills.push(effectPill("heal", "💚", `+${card.heal}`, "Moral que recuperas"));
  if (card.draw) pills.push(effectPill("draw", "🃏", `+${card.draw}`, "Cartas que robas"));
  if (card.scout) pills.push(effectPill("scout", "🔎", card.scout, "Cartas entre las que eliges"));
  if (card.cleanse) pills.push(effectPill("cleanse", "✨", "✓", "Elimina tu debilitación"));
  if (card.energyGain) pills.push(effectPill("energy", "⚡", `+${card.energyGain}`, "Energía que recuperas"));
  if (card.pierce) pills.push(effectPill("pierce", "🗡️", card.pierce, "Ataque que atraviesa defensa"));
  if (card.guardBreak) pills.push(effectPill("counter", "💥", card.guardBreak, "Defensa rival que destruye"));
  if (card.breakAffinity) pills.push(effectPill("counter", "✂️", "Cadena", "Rompe la afinidad rival"));
  if (card.healingBlock) pills.push(effectPill("counter", "🚫", "Cura", "Anula la próxima curación rival"));
  if (card.drawLock) pills.push(effectPill("counter", "🔒", "Robo", "Anula el próximo robo adicional rival"));
  if (card.talentSilence) pills.push(effectPill("counter", "🔇", "Talento", "Silencia los talentos rivales"));
  if (card.coachLock) pills.push(effectPill("counter", "🚷", "Míster", "Bloquea al entrenador rival"));
  if (card.bonusIfBuff) pills.push(effectPill("condition", "🔥", `+${card.bonusIfBuff}`, "Extra si estaba potenciado"));
  if (card.bonusIfNoGuard) pills.push(effectPill("condition", "🎯", `+${card.bonusIfNoGuard}`, "Extra si el rival no tiene defensa"));
  if (card.affinity) pills.push(effectPill("affinity", getAffinityIcon(card.affinity), card.affinity, "Afinidad"));
  if (card.talent) pills.push(effectPill("talent", "✦", card.talent.name, "Talento de descarte"));
  return pills;
}

function effectPill(type, icon, value, label) {
  return `<span class="effect-pill ${type}" title="${escapeHtml(label)}"><span aria-hidden="true">${icon}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></span>`;
}

function getClearCardText(card) {
  const parts = [card.text || "Aplica su efecto."];
  if (card.affinityTotal) parts.push(`Afinidad Total ${card.affinity} ×3: ${card.affinityTotal.text}`);
  if (card.talent) parts.push(`Talento — ${card.talent.name}: ${card.talent.text}`);
  return parts.join(" ");
}

function getCurrentResult(card) {
  const results = [];
  const affinity = getAffinityPreview(card);
  const reward = affinity.total ? (card.affinityTotal || {}) : {};
  let conditionalBonus = (card.bonusIfBuff && view.me.attackBuff ? card.bonusIfBuff : 0)
    + (card.bonusIfNoGuard && !view.opponent?.guard ? card.bonusIfNoGuard : 0)
    + (card.bonusIfCardPlayedThisTurn && view.me.cardsPlayedThisTurn > 0 ? card.bonusIfCardPlayedThisTurn : 0)
    + (card.bonusIfHasGuard && view.me.guard > 0 ? card.bonusIfHasGuard : 0)
    + (card.affinityComboBonus && card.bonusIfAffinityPlayed?.some((entry) => view.me.playedAffinitiesThisTurn.includes(entry)) ? card.affinityComboBonus : 0);
  if (card.attack && hasActiveTalent("shinbad-ramirez") && !view.me.talentUses?.fuerzaDeTiro) conditionalBonus += 1;
  if (affinity.resonance && card.affinityPrimary === "attack") conditionalBonus += 1;
  conditionalBonus += reward.attack || 0;
  const guardBreakPreview = Math.min((card.guardBreak || 0) + (reward.guardBreak || 0), view.opponent?.guard || 0);
  const rivalGuardAfterCounter = Math.max(0, (view.opponent?.guard || 0) - guardBreakPreview);
  if (card.attack) {
    const attack = Math.max(0, card.attack + view.me.attackBuff - view.me.weakness + conditionalBonus);
    const pierce = Math.min(attack, (card.pierce || 0) + (reward.pierce || 0));
    const blocked = Math.min(rivalGuardAfterCounter, attack - pierce);
    const moraleDamage = Math.max(0, attack - blocked);
    if (blocked && moraleDamage) results.push(`rompe ${blocked} de defensa y quita ${moraleDamage} de moral`);
    else if (blocked) results.push(`rompe ${blocked} de defensa`);
    else results.push(`quita ${moraleDamage} de moral`);
    if (pierce) results.push(`${pierce} atraviesa la defensa`);
  }
  let guard = (card.guard || 0) + (reward.guard || 0);
  if (affinity.resonance && card.affinityPrimary === "guard") guard += 1;
  if (card.guard && hasActiveTalent("bronya-wingate") && ["Agua", "Hielo"].includes(card.affinity) && !view.me.talentUses?.defensaPlus) guard += 1;
  if (card.guard && hasActiveTalent("fubuki-sumiye") && /porter[oa]/i.test(card.position || "")) guard += 1;
  if (guard) results.push(`ganas ${guard} de defensa`);
  if (card.heal) {
    const requested = view.me.morale <= (card.criticalHealThreshold ?? -1) ? (card.criticalHeal || card.heal) : card.heal;
    const allowed = Math.max(0, 3 - (view.me.healingThisTurn || 0));
    results.push(view.me.healingBlock
      ? "tu curación será anulada"
      : `recuperas ${Math.min(requested, allowed, MAX_MORALE - view.me.morale)} de moral`);
  }
  const buff = (card.buff || 0) + (reward.buff || 0);
  const debuff = (card.debuff || 0) + (reward.debuff || 0);
  if (buff) results.push(`guardas +${buff} para tu próximo ataque`);
  if (debuff) results.push(`el próximo ataque rival pierde ${debuff}`);
  let draw = (card.draw || 0) + (reward.draw || 0);
  if (card.drawIfDiscardContains && view.me.discard.includes(card.drawIfDiscardContains)) draw += 1;
  if (hasActiveTalent("jikan-alonso") && !view.me.talentUses?.enPunto && getEffectiveCardCost(card) > 0 && getEffectiveCardCost(card) === view.me.energy) draw += 1;
  if (draw) results.push(`robas ${draw} carta${draw === 1 ? "" : "s"}`);
  if (card.scout) results.push(`eliges 1 de las próximas ${Math.min(card.scout, view.me.deckCount)} cartas`);
  if (card.cleanse) results.push(view.me.weakness ? "eliminas tu debilitación" : "no tienes debilitaciones que eliminar");
  let energy = (card.energyGain || 0) + (reward.energyGain || 0);
  if (hasActiveTalent("pan-walker") && view.me.cardsPlayedThisTurn === 2) energy += 1;
  if (energy) results.push(`recuperas hasta ${energy} de energía`);
  if (card.removeOpponentBuff) results.push(view.opponent?.attackBuff ? "eliminas la potenciación rival" : "el rival no tiene potenciación que eliminar");
  if (card.guardBreak) results.push(guardBreakPreview ? `destruyes ${guardBreakPreview} de defensa rival antes de atacar` : "el rival no tiene defensa que desmontar");
  if (card.breakAffinity) results.push("rompes la cadena de afinidad rival");
  if (card.healingBlock) results.push("bloqueas su próxima curación");
  if (card.drawLock) results.push("bloqueas su próximo robo adicional");
  if (card.talentSilence) results.push("silencias sus talentos durante su próximo turno");
  if (card.coachLock) results.push("bloqueas su entrenador durante su próximo turno");
  if (affinity.resonance) results.push(`activas Resonancia ${card.affinity} ×2`);
  if (affinity.total) results.push(`activas Afinidad Total: ${card.affinityTotal?.text || "beneficio especial"}`);
  return capitalize(results.join("; ")) || "Aplica su efecto";
}

function getAffinityPreview(card) {
  if (card.category !== "player" || !card.affinity) return { count: 0, resonance: false, total: false };
  const count = view.me.affinityChain === card.affinity ? (view.me.affinityCount || 0) + 1 : 1;
  return { count, resonance: count === 2, total: count >= 3 };
}

function hasActiveTalent(cardId) {
  return Boolean(view?.me?.activeTalents?.some((talent) => talent.cardId === cardId));
}

function getAffinityIcon(affinity) {
  return AFFINITY_ICONS[affinity] || "✦";
}

function openCardDetail(cardId) {
  const card = CARDS_BY_ID[cardId];
  if (!card || !view) return;
  selectedCardId = cardId;
  const rarity = RARITIES[card.rarity] || RARITIES.normal;
  const role = ROLES[card.role] || { label: card.kind, icon: "⭐" };
  const availability = getCardAvailability(card);
  const base = card.evolutionOf ? CARDS_BY_ID[card.evolutionOf] : null;

  elements.cardDetail.className = `card-detail-dialog rarity-${card.rarity || "normal"}`;
  elements.cardDetailRarity.textContent = `${rarity.label} · ${role.icon} ${role.label}`;
  elements.cardDetailTitle.textContent = card.name;
  elements.cardDetailContent.innerHTML = `
    <div class="detail-hero">
      <div class="detail-monogram"><img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}" /></div>
      <div><span>${escapeHtml(card.version)}</span><p>${escapeHtml(card.team)} · ${escapeHtml(card.position)} · ${escapeHtml(card.element)}</p></div>
      <strong class="detail-cost">⚡ ${getEffectiveCardCost(card)}${getEffectiveCardCost(card) < card.cost ? `<small> antes ${card.cost}</small>` : ""}</strong>
    </div>
    <section class="detail-section">
      <h3>¿Qué hace?</h3>
      <div class="effect-pills detail-effects">${getEffectPills(card).join("")}</div>
      <p>${escapeHtml(getClearCardText(card))}</p>
    </section>
    ${card.talent ? `<section class="talent-detail-box"><span aria-hidden="true">✦</span><div><strong>Talento de descarte · ${escapeHtml(card.talent.name)}</strong><p>${escapeHtml(card.talent.text)}</p></div></section>` : ""}
    ${card.affinityTotal ? `<section class="affinity-detail-box"><span aria-hidden="true">${getAffinityIcon(card.affinity)}</span><div><strong>Afinidad Total · ${escapeHtml(card.affinity)} ×3</strong><p>${escapeHtml(card.affinityTotal.text)}</p></div></section>` : ""}
    <section class="current-result-box">
      <span>Resultado con el estado actual</span>
      <strong>${escapeHtml(getCurrentResult(card))}</strong>
    </section>
    ${base ? `<section class="requirement-box ${view.me.discard.includes(card.evolutionOf) ? "complete" : "pending"}"><span aria-hidden="true">${view.me.discard.includes(card.evolutionOf) ? "✓" : "🔒"}</span><div><strong>Requisito de despertar</strong><p>${view.me.discard.includes(card.evolutionOf) ? "Cumplido: ya jugaste" : "Juega primero"} ${escapeHtml(base.name)} · ${escapeHtml(base.version)}.</p></div></section>` : ""}
    <section class="coach-tip"><span aria-hidden="true">💡</span><div><strong>Consejo del entrenador</strong><p>${escapeHtml(card.tip || card.quote)}</p></div></section>
  `;
  elements.cardDetailContent.querySelector(".detail-monogram img").addEventListener("error", (event) => {
    event.currentTarget.hidden = true;
  });
  elements.cardDetailStatus.textContent = availability.canPlay ? "Esta carta está lista." : availability.reason;
  elements.cardDetailStatus.className = availability.canPlay ? "ready" : "blocked";
  elements.playDetailedCard.disabled = !availability.canPlay;
  elements.cardDetail.showModal();
}

function playSelectedCard() {
  if (!selectedCardId) return;
  const card = CARDS_BY_ID[selectedCardId];
  if (!card || !getCardAvailability(card).canPlay) return;
  const cardId = selectedCardId;
  closeCardDetail();
  sendAction({ type: "play-card", cardId });
}

function closeCardDetail() {
  if (elements.cardDetail.open) elements.cardDetail.close();
  selectedCardId = "";
}

function openNotebook() {
  if (currentScreen !== "notebook") previousScreen = currentScreen;
  workingDeck = [...getActiveDeck()];
  showScreen("notebook");
  showNotebookTab("collection");
  renderNotebook();
  elements.unlockToast.hidden = true;
}

function closeNotebook() {
  const destination = ["lobby", "waiting", "game"].includes(previousScreen) ? previousScreen : "lobby";
  showScreen(destination);
  if (destination === "game" && view) renderGame();
  if (destination === "waiting" && view) renderWaiting();
}

function showNotebookTab(tab) {
  const showDeck = tab === "deck";
  elements.collectionTab.classList.toggle("active", !showDeck);
  elements.deckTab.classList.toggle("active", showDeck);
  elements.collectionTab.setAttribute("aria-selected", String(!showDeck));
  elements.deckTab.setAttribute("aria-selected", String(showDeck));
  elements.collectionPanel.hidden = showDeck;
  elements.deckPanel.hidden = !showDeck;
  if (showDeck) renderDeckBuilder();
}

function renderNotebook() {
  const unlockedCount = CARDS.filter((card) => unlockedCards.has(card.id)).length;
  elements.collectionCount.textContent = `${unlockedCount}/${CARDS.length}`;
  elements.collectionProgressBar.style.width = `${(unlockedCount / CARDS.length) * 100}%`;
  elements.notebookGrid.replaceChildren(...CARDS.map(createNotebookCard));
  elements.coachCollectionGrid.replaceChildren(...COACHES.map(createCoachCollectionCard));
  renderDeckBuilder();
}

function createCoachCollectionCard(coach) {
  const article = document.createElement("article");
  article.className = "coach-collection-card";
  article.style.setProperty("--coach-card-color", coach.color || "#e1596d");
  article.innerHTML = `
    <div><img src="${escapeHtml(coach.image)}" alt="${escapeHtml(coach.name)}" /><span>${escapeHtml(coach.symbol || "★")}</span></div>
    <section><small>${escapeHtml(coach.team)}</small><h3>${escapeHtml(coach.name)}</h3><p>${escapeHtml(coach.version)}</p><strong>${escapeHtml(coach.abilityName)}</strong><em>${escapeHtml(coach.abilityText)}</em></section>
  `;
  article.querySelector("img").addEventListener("error", (event) => (event.currentTarget.hidden = true));
  return article;
}

function createNotebookCard(card) {
  const unlocked = unlockedCards.has(card.id);
  const rarity = RARITIES[card.rarity] || RARITIES.normal;
  const role = ROLES[card.role] || { label: card.kind, icon: "⭐" };
  const challenge = UNLOCK_CHALLENGES[card.id];
  const article = document.createElement("article");
  article.className = `notebook-card rarity-${card.rarity || "normal"}${unlocked ? " unlocked" : " locked"}`;
  article.innerHTML = `
    <div class="notebook-card-art">
      <img src="${escapeHtml(card.image)}" alt="${unlocked ? escapeHtml(card.name) : "Carta por descubrir"}" />
      <span class="notebook-card-state">${unlocked ? "✓ Desbloqueada" : "🔒 Por descubrir"}</span>
      <span class="notebook-card-cost">⚡ ${card.cost}</span>
    </div>
    <div class="notebook-card-copy">
      <div class="card-topline"><span class="rarity-badge rarity-${escapeHtml(card.rarity || "normal")}">${escapeHtml(rarity.label)}</span><span>${role.icon} ${escapeHtml(role.label)}</span></div>
      <h3>${unlocked ? escapeHtml(card.name) : "Expediente oculto"}</h3>
      <p class="notebook-version">${unlocked ? escapeHtml(card.version) : escapeHtml(card.team)}</p>
      ${unlocked
        ? `<div class="effect-pills">${getEffectPills(card).join("")}</div><p>${escapeHtml(getClearCardText(card))}</p><small>${escapeHtml(card.tip || "")}</small>`
        : `<div class="unlock-challenge"><span aria-hidden="true">🎯</span><div><strong>${escapeHtml(challenge?.title || "Desafío secreto")}</strong><p>${escapeHtml(challenge?.description || "Sigue jugando para descubrir esta carta.")}</p>${getChallengeProgressMarkup(card.id)}</div></div>`}
    </div>
  `;
  article.querySelector("img").addEventListener("error", (event) => {
    event.currentTarget.hidden = true;
  });
  return article;
}

function getChallengeProgressMarkup(cardId) {
  const challenge = UNLOCK_CHALLENGES[cardId];
  if (!challenge?.metric || !challenge.goal) return "<small>Se completa automáticamente durante las partidas.</small>";
  const amount = Math.min(challenge.goal, Math.max(0, challengeProgress[challenge.metric] || 0));
  const percentage = Math.min(100, (amount / challenge.goal) * 100);
  return `<div class="challenge-meter"><i style="width:${percentage}%"></i></div><small>${amount}/${challenge.goal} ${escapeHtml(challenge.unit || "progreso")}</small>`;
}

function renderDeckBuilder() {
  const validation = getDeckValidation(workingDeck);
  const counts = countDeckCards(workingDeck);
  const uniqueCount = counts.size;
  const offensiveCount = workingDeck.filter((cardId) => (CARDS_BY_ID[cardId]?.attack || 0) > 0).length;
  const defensiveCount = workingDeck.filter((cardId) => (CARDS_BY_ID[cardId]?.guard || 0) > 0).length;

  elements.deckCount.textContent = `${workingDeck.length}/${DECK_SIZE}`;
  elements.deckTabCount.textContent = `${workingDeck.length}/${DECK_SIZE}`;
  elements.deckRules.innerHTML = `
    <span class="${workingDeck.length === DECK_SIZE ? "complete" : "pending"}">${workingDeck.length === DECK_SIZE ? "✓" : "○"} ${DECK_SIZE} cartas</span>
    <span class="${uniqueCount >= MIN_UNIQUE_CARDS ? "complete" : "pending"}">${uniqueCount >= MIN_UNIQUE_CARDS ? "✓" : "○"} ${MIN_UNIQUE_CARDS} diferentes</span>
    <span class="${offensiveCount >= MIN_OFFENSIVE_CARDS ? "complete" : "pending"}">${offensiveCount >= MIN_OFFENSIVE_CARDS ? "✓" : "○"} ${offensiveCount}/${MIN_OFFENSIVE_CARDS} ofensivas</span>
    <span class="${defensiveCount >= MIN_DEFENSIVE_CARDS ? "complete" : "pending"}">${defensiveCount >= MIN_DEFENSIVE_CARDS ? "✓" : "○"} ${defensiveCount}/${MIN_DEFENSIVE_CARDS} defensivas</span>
    <span class="${validation.copyLimitValid ? "complete" : "pending"}">${validation.copyLimitValid ? "✓" : "○"} Máx. ${MAX_COPIES} copias</span>
  `;
  elements.saveDeck.disabled = !validation.valid;

  elements.selectedDeckList.replaceChildren();
  if (!counts.size) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Todavía no has elegido ninguna carta.";
    elements.selectedDeckList.append(empty);
  } else {
    for (const [cardId, amount] of counts) {
      const card = CARDS_BY_ID[cardId];
      if (!card) continue;
      const row = document.createElement("div");
      row.className = "selected-deck-row";
      row.innerHTML = `<img src="${escapeHtml(card.image)}" alt="" /><span><strong>${escapeHtml(card.name)}</strong><small>${escapeHtml(card.version)}</small></span><b>×${amount}</b><button type="button" aria-label="Quitar una copia de ${escapeHtml(card.name)}">−</button>`;
      row.querySelector("button").addEventListener("click", () => changeDeckCard(cardId, -1));
      row.querySelector("img").addEventListener("error", (event) => (event.currentTarget.hidden = true));
      elements.selectedDeckList.append(row);
    }
  }

  elements.deckCardGrid.replaceChildren();
  for (const card of CARDS) {
    const unlocked = unlockedCards.has(card.id);
    const amount = counts.get(card.id) || 0;
    const canAdd = unlocked && workingDeck.length < DECK_SIZE && amount < MAX_COPIES;
    const item = document.createElement("article");
    item.className = `deck-card rarity-${card.rarity || "normal"}${unlocked ? "" : " locked"}`;
    item.innerHTML = `
      <div><img src="${escapeHtml(card.image)}" alt="" /><span>${unlocked ? `×${amount}` : "🔒"}</span></div>
      <section><small>${escapeHtml((RARITIES[card.rarity] || RARITIES.normal).label)}</small><strong>${unlocked ? escapeHtml(card.name) : "Carta oculta"}</strong><p>${unlocked ? escapeHtml(card.version) : escapeHtml(UNLOCK_CHALLENGES[card.id]?.description || "Desbloquéala en el Cuaderno")}</p></section>
      <button type="button" ${canAdd ? "" : "disabled"}>${amount >= MAX_COPIES ? "Máximo" : unlocked ? "+ Añadir" : "Bloqueada"}</button>
    `;
    item.querySelector("button").addEventListener("click", () => changeDeckCard(card.id, 1));
    item.querySelector("img").addEventListener("error", (event) => (event.currentTarget.hidden = true));
    elements.deckCardGrid.append(item);
  }
}

function changeDeckCard(cardId, change) {
  elements.deckMessage.textContent = "";
  if (change > 0) {
    const amount = workingDeck.filter((entry) => entry === cardId).length;
    if (!unlockedCards.has(cardId) || workingDeck.length >= DECK_SIZE || amount >= MAX_COPIES) return;
    workingDeck.push(cardId);
  } else {
    const index = workingDeck.lastIndexOf(cardId);
    if (index === -1) return;
    workingDeck.splice(index, 1);
  }
  renderDeckBuilder();
}

function resetWorkingDeck() {
  workingDeck = [...STARTER_DECK];
  elements.deckMessage.textContent = "Mazo inicial preparado. Pulsa Guardar para usarlo.";
  elements.deckMessage.className = "deck-message";
  renderDeckBuilder();
}

function saveWorkingDeck() {
  const validation = getDeckValidation(workingDeck);
  if (!validation.valid) {
    elements.deckMessage.textContent = validation.message;
    elements.deckMessage.className = "deck-message error";
    return;
  }
  localStorage.setItem(DECK_KEY, JSON.stringify(workingDeck));
  elements.deckMessage.textContent = "Mazo guardado. Se usará en tu próxima sala o partida local.";
  elements.deckMessage.className = "deck-message success";
  renderDeckBuilder();
}

function getActiveDeck() {
  try {
    const saved = JSON.parse(localStorage.getItem(DECK_KEY) || "null");
    if (hasSameCardCounts(saved, LEGACY_STARTER_DECK)) {
      localStorage.setItem(DECK_KEY, JSON.stringify(STARTER_DECK));
      return [...STARTER_DECK];
    }
    if (getDeckValidation(saved).valid) return [...saved];
  } catch {
    // Se usa el mazo inicial si el guardado local se dañó.
  }
  return [...STARTER_DECK];
}

function hasSameCardCounts(first, second) {
  if (!Array.isArray(first) || first.length !== second.length) return false;
  const firstCounts = countDeckCards(first);
  const secondCounts = countDeckCards(second);
  return firstCounts.size === secondCounts.size
    && [...firstCounts].every(([cardId, amount]) => secondCounts.get(cardId) === amount);
}

function getDeckValidation(deck) {
  if (!Array.isArray(deck)) return { valid: false, copyLimitValid: false, offensiveValid: false, defensiveValid: false, message: "El mazo no se puede leer." };
  const counts = countDeckCards(deck);
  const known = deck.every((cardId) => CARDS_BY_ID[cardId] && unlockedCards.has(cardId));
  const copyLimitValid = [...counts.values()].every((amount) => amount <= MAX_COPIES);
  const offensiveValid = deck.filter((cardId) => (CARDS_BY_ID[cardId]?.attack || 0) > 0).length >= MIN_OFFENSIVE_CARDS;
  const defensiveValid = deck.filter((cardId) => (CARDS_BY_ID[cardId]?.guard || 0) > 0).length >= MIN_DEFENSIVE_CARDS;
  if (deck.length !== DECK_SIZE) return { valid: false, copyLimitValid, offensiveValid, defensiveValid, message: `Necesitas exactamente ${DECK_SIZE} cartas.` };
  if (!known) return { valid: false, copyLimitValid, offensiveValid, defensiveValid, message: "El mazo contiene una carta que aún no has desbloqueado." };
  if (!copyLimitValid) return { valid: false, copyLimitValid, offensiveValid, defensiveValid, message: `Solo puedes llevar ${MAX_COPIES} copias de cada carta.` };
  if (counts.size < MIN_UNIQUE_CARDS) return { valid: false, copyLimitValid, offensiveValid, defensiveValid, message: `Necesitas al menos ${MIN_UNIQUE_CARDS} cartas diferentes.` };
  if (!offensiveValid) return { valid: false, copyLimitValid, offensiveValid, defensiveValid, message: `Necesitas al menos ${MIN_OFFENSIVE_CARDS} cartas ofensivas.` };
  if (!defensiveValid) return { valid: false, copyLimitValid, offensiveValid, defensiveValid, message: `Necesitas al menos ${MIN_DEFENSIVE_CARDS} cartas defensivas.` };
  return { valid: true, copyLimitValid: true, offensiveValid: true, defensiveValid: true, message: "Mazo válido." };
}

function countDeckCards(deck) {
  const counts = new Map();
  if (!Array.isArray(deck)) return counts;
  for (const cardId of deck) counts.set(cardId, (counts.get(cardId) || 0) + 1);
  return counts;
}

function loadUnlockedCards() {
  const unlocked = new Set(STARTER_UNLOCKS);
  try {
    const saved = JSON.parse(localStorage.getItem(COLLECTION_KEY) || "[]");
    if (Array.isArray(saved)) {
      for (const cardId of saved) if (CARDS_BY_ID[cardId]) unlocked.add(cardId);
    }
  } catch {
    // Los desbloqueos iniciales siempre permanecen disponibles.
  }
  return unlocked;
}

function loadChallengeProgress() {
  const defaults = {
    cardsPlayed: 0,
    maxCardsInTurn: 0,
    extraDraws: 0,
    poweredAttacks: 0,
    bestFinishGuard: 0,
    supportPlayed: 0,
    balancePlayed: 0,
    guardGained: 0,
    attackDealt: 0,
    zeroEnergyTurns: 0,
    debuffApplied: 0,
    gamesFinished: 0,
    iceCardsPlayed: 0,
    goalkeepersPlayed: 0,
    guardBreakAttacks: 0,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(CHALLENGE_PROGRESS_KEY) || "{}");
    for (const key of Object.keys(defaults)) defaults[key] = Math.max(0, Number(saved[key]) || 0);
    return defaults;
  } catch {
    return defaults;
  }
}

function saveChallengeProgress() {
  localStorage.setItem(CHALLENGE_PROGRESS_KEY, JSON.stringify(challengeProgress));
}

function getChallengeEvent(action) {
  if (action.type === "end-turn") return { type: action.type, zeroEnergy: view?.me?.energy === 0 };
  if (action.type !== "play-card") return { type: action.type };
  const card = CARDS_BY_ID[action.cardId];
  if (!card || !view) return { type: action.type };
  const conditionalBonus = (card.bonusIfBuff && view.me.attackBuff ? card.bonusIfBuff : 0)
    + (card.bonusIfNoGuard && !view.opponent?.guard ? card.bonusIfNoGuard : 0);
  const attack = card.attack
    ? Math.max(0, card.attack + view.me.attackBuff - view.me.weakness + conditionalBonus)
    : 0;
  return {
    type: action.type,
    cardId: card.id,
    extraDraw: card.draw || 0,
    poweredAttack: view.me.attackBuff > 0 && attack >= 8,
    attack,
    guardGained: card.guard || 0,
    supportPlayed: card.category === "support" ? 1 : 0,
    balancePlayed: card.role === "balance" ? 1 : 0,
    debuffApplied: card.debuff || 0,
    iceCard: card.affinity === "Hielo" ? 1 : 0,
    goalkeeper: /porter[oa]/i.test(card.position || "") ? 1 : 0,
    guardBreakAttack: attack > 0 && (view.opponent?.guard || 0) > 0 ? 1 : 0,
  };
}

function recordSuccessfulAction(event) {
  if (!event) return;
  if (event.type === "end-turn") {
    if (event.zeroEnergy) challengeProgress.zeroEnergyTurns += 1;
    cardsPlayedThisTurn = 0;
    saveChallengeProgress();
    unlockEligibleCards();
    return;
  }
  if (event.type !== "play-card") return;

  cardsPlayedThisTurn += 1;
  challengeProgress.cardsPlayed += 1;
  challengeProgress.maxCardsInTurn = Math.max(challengeProgress.maxCardsInTurn, cardsPlayedThisTurn);
  challengeProgress.extraDraws += event.extraDraw || 0;
  challengeProgress.poweredAttacks += event.poweredAttack ? 1 : 0;
  challengeProgress.supportPlayed += event.supportPlayed || 0;
  challengeProgress.balancePlayed += event.balancePlayed || 0;
  challengeProgress.guardGained += event.guardGained || 0;
  challengeProgress.attackDealt += event.attack || 0;
  challengeProgress.debuffApplied += event.debuffApplied || 0;
  challengeProgress.iceCardsPlayed += event.iceCard || 0;
  challengeProgress.goalkeepersPlayed += event.goalkeeper || 0;
  challengeProgress.guardBreakAttacks += event.guardBreakAttack || 0;
  saveChallengeProgress();
  unlockEligibleCards();
}

function checkFinishedChallenges() {
  if (!view || view.phase !== "finished") return;
  const finishKey = `${view.roomCode}-${view.version}-${view.me.name}`;
  if (lastFinishedChallenge === finishKey) return;
  lastFinishedChallenge = finishKey;
  challengeProgress.gamesFinished += 1;
  challengeProgress.bestFinishGuard = Math.max(challengeProgress.bestFinishGuard, view.me.guard || 0);
  saveChallengeProgress();
  unlockEligibleCards();
}

function unlockEligibleCards() {
  for (const [cardId, challenge] of Object.entries(UNLOCK_CHALLENGES)) {
    if ((challengeProgress[challenge.metric] || 0) >= challenge.goal) unlockCard(cardId);
  }
}

function unlockCard(cardId) {
  if (!CARDS_BY_ID[cardId] || unlockedCards.has(cardId)) return;
  unlockedCards.add(cardId);
  localStorage.setItem(COLLECTION_KEY, JSON.stringify([...unlockedCards]));
  const card = CARDS_BY_ID[cardId];
  elements.unlockToastName.textContent = `${card.name} · ${card.version}`;
  elements.unlockToast.hidden = false;
  window.clearTimeout(unlockToastTimer);
  unlockToastTimer = window.setTimeout(() => {
    elements.unlockToast.hidden = true;
  }, 7000);
  if (currentScreen === "notebook") renderNotebook();
}

function openRules() {
  if (elements.choice.open && choiceMode === "scout") return;
  if (elements.choice.open) closeChoiceDialog();
  if (elements.cardDetail.open) closeCardDetail();
  if (!elements.rules.open) {
    elements.rules.showModal();
    elements.rules.scrollTop = 0;
  }
}

function finishRules() {
  localStorage.setItem(GUIDE_SEEN_KEY, "true");
  elements.rules.close();
}

function showContextHelp(message) {
  if (!message) return;
  elements.handMessage.textContent = message;
  elements.handMessage.classList.remove("error");
}

function closeOnBackdrop(event, dialog) {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  if (!inside) dialog.close();
}

function showScreen(screen) {
  elements.lobby.hidden = screen !== "lobby";
  elements.notebook.hidden = screen !== "notebook";
  elements.waiting.hidden = screen !== "waiting";
  elements.game.hidden = screen !== "game";
  currentScreen = screen;
}

function getName(reportError = true) {
  const name = elements.name.value.trim().slice(0, 24);
  if (!name && reportError) {
    showLobbyError("Escribe primero tu nombre.");
    elements.name.focus();
    return "";
  }
  if (name) localStorage.setItem("ina-card-nickname", name);
  return name;
}

function ensureServer() {
  if (SERVER_URL) return true;
  showLobbyError("La base online todavía no está publicada. Puedes probar ahora las reglas en este dispositivo.");
  return false;
}

async function apiRequest(path, options) {
  const response = await fetch(`${SERVER_URL}${path}`, {
    method: options.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No se ha podido completar la operación.");
  return data;
}

function setBusy(busy, message = "") {
  elements.create.disabled = busy;
  elements.join.disabled = busy;
  if (message) {
    elements.connectionNote.textContent = message;
    elements.connectionNote.classList.remove("error");
  }
}

function showLobbyError(message) {
  elements.connectionNote.textContent = message;
  elements.connectionNote.classList.add("error");
}

function showActionError(message) {
  const target = view?.phase === "waiting" ? elements.waitingNote : elements.handMessage;
  target.textContent = message;
  target.classList.add("error");
}

function clearActionError() {
  elements.waitingNote.classList.remove("error");
  elements.handMessage.classList.remove("error");
  elements.handMessage.textContent = "";
}

async function copyRoomCode() {
  const code = elements.shownCode.textContent;
  try {
    await navigator.clipboard.writeText(code);
    elements.copyCode.textContent = "Copiado";
    window.setTimeout(() => (elements.copyCode.textContent = "Copiar"), 1400);
  } catch {
    elements.waitingNote.textContent = `Código: ${code}`;
  }
}

function leaveSession() {
  if (socket) socket.close();
  socket = null;
  token = "";
  view = null;
  localState = null;
  localMode = false;
  selectedCardId = "";
  choiceMode = "";
  guideOffered = false;
  cardsPlayedThisTurn = 0;
  lastFinishedChallenge = "";
  elements.connectionNote.textContent = "";
  elements.handMessage.textContent = "";
  if (elements.rules.open) elements.rules.close();
  if (elements.cardDetail.open) elements.cardDetail.close();
  if (elements.choice.open) elements.choice.close();
  showScreen("lobby");
}

function createTag(text, type) {
  const tag = document.createElement("span");
  tag.className = `effect-tag ${type}`;
  tag.textContent = text;
  return tag;
}

function getInitials(name) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function randomToken() {
  return crypto.getRandomValues(new Uint32Array(4)).join("-");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
