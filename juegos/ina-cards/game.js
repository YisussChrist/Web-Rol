import { CARDS_BY_ID } from "./cards.js";
import { addPlayer, applyAction, createRoom, publicView } from "./engine.js";
import { SERVER_URL } from "./config.js";

const elements = {
  lobby: document.querySelector("#lobby-screen"),
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
  turn: document.querySelector("#turn-label"),
  opponentName: document.querySelector("#opponent-name"),
  opponentMorale: document.querySelector("#opponent-morale"),
  opponentGuard: document.querySelector("#opponent-guard"),
  opponentHand: document.querySelector("#opponent-hand"),
  myName: document.querySelector("#my-name"),
  myMorale: document.querySelector("#my-morale"),
  myGuard: document.querySelector("#my-guard"),
  myEnergy: document.querySelector("#my-energy"),
  effects: document.querySelector("#effect-strip"),
  log: document.querySelector("#match-log"),
  hand: document.querySelector("#card-hand"),
  handMessage: document.querySelector("#hand-message"),
  endTurn: document.querySelector("#end-turn"),
  rules: document.querySelector("#rules-dialog"),
  openRules: document.querySelector("#open-rules"),
  closeRules: document.querySelector("#close-rules"),
};

let socket = null;
let token = "";
let view = null;
let localState = null;
let localMode = false;

elements.name.value = localStorage.getItem("ina-card-nickname") || "";

elements.create.addEventListener("click", createOnlineRoom);
elements.join.addEventListener("click", joinOnlineRoom);
elements.demo.addEventListener("click", startLocalDemo);
elements.ready.addEventListener("click", () => sendAction({ type: "ready", ready: !view?.me.ready }));
elements.endTurn.addEventListener("click", () => sendAction({ type: "end-turn" }));
elements.leaveRoom.addEventListener("click", leaveSession);
elements.leaveMatch.addEventListener("click", leaveSession);
elements.copyCode.addEventListener("click", copyRoomCode);
elements.openRules.addEventListener("click", () => elements.rules.showModal());
elements.closeRules.addEventListener("click", () => elements.rules.close());

elements.code.addEventListener("input", () => {
  elements.code.value = elements.code.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
});

elements.code.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinOnlineRoom();
});

async function createOnlineRoom() {
  const name = getName();
  if (!name || !ensureServer()) return;
  setBusy(true, "Creando sala…");

  try {
    const session = await apiRequest("/api/rooms", { method: "POST", body: { name } });
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
    const session = await apiRequest(`/api/rooms/${code}/join`, { method: "POST", body: { name } });
    enterOnlineSession(session);
  } catch (error) {
    showLobbyError(error.message);
  } finally {
    setBusy(false);
  }
}

function startLocalDemo() {
  const firstName = getName(false) || "Jugador 1";
  const first = { token: randomToken(), name: firstName };
  const second = { token: randomToken(), name: "Jugador 2" };
  localState = createRoom("LOCAL1", first);
  addPlayer(localState, second);
  applyAction(localState, first.token, { type: "ready", ready: true });
  applyAction(localState, second.token, { type: "ready", ready: true });
  token = localState.players[localState.turn].token;
  localMode = true;
  view = publicView(localState, token);
  render();
  elements.handMessage.textContent = "Modo local: al terminar el turno, el control pasa al otro jugador.";
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
  if (localMode) {
    try {
      applyAction(localState, token, action);
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
}

function render() {
  if (!view) return;
  if (view.phase === "waiting") {
    renderWaiting();
  } else {
    renderGame();
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
    status.style.color = player.ready ? "var(--green)" : "var(--muted)";
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

  if (view.phase === "finished") {
    elements.turn.textContent = view.didIWin ? "Has ganado" : `${view.winnerName} ha ganado`;
    elements.turn.classList.remove("waiting");
  } else {
    elements.turn.textContent = view.isMyTurn ? "Tu turno" : `Turno de ${view.currentPlayerName}`;
    elements.turn.classList.toggle("waiting", !view.isMyTurn);
  }

  renderEffects();
  renderLog();
  renderHand();
  elements.endTurn.disabled = !view.isMyTurn || view.phase !== "playing";
}

function renderEffects() {
  const effects = [];
  if (view.me.attackBuff) effects.push(`Tu próximo ataque: +${view.me.attackBuff}`);
  if (view.me.weakness) effects.push(`Tu próximo ataque: -${view.me.weakness}`);
  if (view.opponent?.attackBuff) effects.push(`Buff rival: +${view.opponent.attackBuff}`);
  if (view.opponent?.weakness) effects.push(`Debuff rival: -${view.opponent.weakness}`);
  if (!effects.length) effects.push("No hay efectos pendientes");
  elements.effects.replaceChildren(...effects.map(createTag));
}

function renderLog() {
  elements.log.replaceChildren();
  [...view.log].reverse().forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    elements.log.append(item);
  });
}

function renderHand() {
  elements.hand.replaceChildren();
  for (const cardId of view.me.hand) {
    const card = CARDS_BY_ID[cardId];
    if (!card) continue;
    const hasBase = !card.evolutionOf || view.me.discard.includes(card.evolutionOf);
    const canPlay = view.isMyTurn && view.phase === "playing" && card.cost <= view.me.energy && hasBase;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `game-card${card.evolutionOf ? " evolution" : ""}`;
    button.disabled = !canPlay;
    button.setAttribute("aria-label", `${card.name}, ${card.version}. Cuesta ${card.cost} de energía. ${card.text}`);
    button.innerHTML = `
      <span class="card-topline"><span>${escapeHtml(card.kind)}</span><span class="card-cost">⚡ ${card.cost}</span></span>
      <h4>${escapeHtml(card.name)}</h4>
      <p class="card-version">${escapeHtml(card.version)}</p>
      <p class="card-text">${escapeHtml(card.text)}</p>
      <p class="card-quote">“${escapeHtml(card.quote)}”</p>
    `;
    button.addEventListener("click", () => sendAction({ type: "play-card", cardId }));
    elements.hand.append(button);
  }

  if (!view.me.hand.length) {
    const empty = document.createElement("p");
    empty.textContent = "No te quedan cartas en la mano.";
    elements.hand.append(empty);
  }
}

function showScreen(screen) {
  elements.lobby.hidden = screen !== "lobby";
  elements.waiting.hidden = screen !== "waiting";
  elements.game.hidden = screen !== "game";
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
  elements.connectionNote.textContent = "";
  elements.handMessage.textContent = "";
  showScreen("lobby");
}

function createTag(text) {
  const tag = document.createElement("span");
  tag.textContent = text;
  return tag;
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
