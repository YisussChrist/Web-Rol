import { CARDS_BY_ID, STARTER_DECK } from "./cards.js";

const MAX_MORALE = 20;
const MAX_ENERGY = 8;
const STARTING_HAND = 5;

export function createRoom(code, host) {
  return {
    roomCode: code,
    phase: "waiting",
    players: [createPlayer(host.token, host.name)],
    turn: 0,
    winnerToken: null,
    log: [`${host.name} ha creado la sala.`],
    version: 1,
  };
}

export function addPlayer(state, player) {
  if (state.phase !== "waiting") throw new Error("La partida ya ha comenzado.");
  if (state.players.length >= 2) throw new Error("La sala ya está completa.");
  if (state.players.some((entry) => entry.token === player.token)) return state;
  state.players.push(createPlayer(player.token, player.name));
  state.log.push(`${player.name} se ha unido a la sala.`);
  bump(state);
  return state;
}

export function applyAction(state, token, action) {
  const playerIndex = state.players.findIndex((player) => player.token === token);
  if (playerIndex === -1) throw new Error("No perteneces a esta sala.");

  if (action.type === "ready") {
    return setReady(state, playerIndex, Boolean(action.ready));
  }

  if (state.phase !== "playing") throw new Error("La partida no está en curso.");
  if (state.turn !== playerIndex) throw new Error("Ahora juega tu rival.");

  if (action.type === "play-card") {
    playCard(state, playerIndex, String(action.cardId || ""));
  } else if (action.type === "end-turn") {
    endTurn(state, playerIndex);
  } else {
    throw new Error("Acción desconocida.");
  }

  bump(state);
  return state;
}

export function publicView(state, token) {
  const meIndex = state.players.findIndex((player) => player.token === token);
  if (meIndex === -1) throw new Error("No perteneces a esta sala.");
  const me = state.players[meIndex];
  const opponent = state.players.find((_, index) => index !== meIndex) || null;
  const currentPlayer = state.players[state.turn] || null;
  const winner = state.players.find((player) => player.token === state.winnerToken) || null;

  return {
    roomCode: state.roomCode,
    phase: state.phase,
    version: state.version,
    isMyTurn: state.phase === "playing" && state.turn === meIndex,
    currentPlayerName: currentPlayer?.name || "",
    winnerName: winner?.name || "",
    didIWin: state.winnerToken === token,
    me: playerView(me, true),
    opponent: opponent ? playerView(opponent, false) : null,
    log: state.log.slice(-12),
  };
}

function createPlayer(token, name) {
  return {
    token,
    name: cleanName(name),
    ready: false,
    morale: MAX_MORALE,
    guard: 0,
    energy: 3,
    maxEnergy: 3,
    attackBuff: 0,
    weakness: 0,
    hand: [],
    deck: [],
    discard: [],
  };
}

function setReady(state, playerIndex, ready) {
  if (state.phase !== "waiting") throw new Error("La preparación ya ha terminado.");
  const player = state.players[playerIndex];
  player.ready = ready;
  state.log.push(`${player.name} ${ready ? "está preparado" : "ha dejado de estar preparado"}.`);

  if (state.players.length === 2 && state.players.every((entry) => entry.ready)) {
    startGame(state);
  }

  bump(state);
  return state;
}

function startGame(state) {
  state.phase = "playing";
  state.turn = Math.floor(Math.random() * state.players.length);
  for (const player of state.players) {
    player.deck = shuffle([...STARTER_DECK]);
    drawCards(player, STARTING_HAND);
  }
  state.log.push(`Empieza la partida. El primer turno es de ${state.players[state.turn].name}.`);
}

function playCard(state, playerIndex, cardId) {
  const player = state.players[playerIndex];
  const rival = state.players[(playerIndex + 1) % 2];
  const handIndex = player.hand.indexOf(cardId);
  if (handIndex === -1) throw new Error("Esa carta no está en tu mano.");

  const card = CARDS_BY_ID[cardId];
  if (!card) throw new Error("La carta no existe.");
  if (card.cost > player.energy) throw new Error("No tienes suficiente energía.");
  if (card.evolutionOf && !player.discard.includes(card.evolutionOf)) {
    const base = CARDS_BY_ID[card.evolutionOf];
    throw new Error(`Primero debes haber jugado a ${base?.name || "su versión base"}.`);
  }

  player.hand.splice(handIndex, 1);
  player.energy -= card.cost;

  let attack = card.attack || 0;
  if (attack > 0) {
    attack = Math.max(0, attack + player.attackBuff - player.weakness);
    player.attackBuff = 0;
    player.weakness = 0;
    dealDamage(rival, attack);
  }

  if (card.guard) player.guard += card.guard;
  if (card.heal) player.morale = Math.min(MAX_MORALE, player.morale + card.heal);
  if (card.buff) player.attackBuff += card.buff;
  if (card.debuff) rival.weakness += card.debuff;
  if (card.draw) drawCards(player, card.draw);
  player.discard.push(card.id);

  const details = [];
  if (attack) details.push(`${attack} de ataque`);
  if (card.guard) details.push(`${card.guard} de defensa`);
  if (card.buff) details.push(`+${card.buff} al próximo ataque`);
  if (card.debuff) details.push(`-${card.debuff} al próximo ataque rival`);
  state.log.push(`${player.name} juega ${card.name} — ${card.version}${details.length ? ` (${details.join(", ")})` : ""}.`);

  if (rival.morale <= 0) {
    state.phase = "finished";
    state.winnerToken = player.token;
    state.log.push(`${player.name} gana el Duelo de Resonancia.`);
  }
}

function endTurn(state, playerIndex) {
  const player = state.players[playerIndex];
  const nextIndex = (playerIndex + 1) % state.players.length;
  const next = state.players[nextIndex];
  state.turn = nextIndex;
  next.maxEnergy = Math.min(MAX_ENERGY, next.maxEnergy + 1);
  next.energy = next.maxEnergy;
  drawCards(next, 1);
  state.log.push(`${player.name} termina su turno. Ahora juega ${next.name}.`);
}

function dealDamage(player, amount) {
  const blocked = Math.min(player.guard, amount);
  player.guard -= blocked;
  player.morale = Math.max(0, player.morale - (amount - blocked));
}

function drawCards(player, count) {
  for (let index = 0; index < count; index += 1) {
    if (!player.deck.length || player.hand.length >= 8) return;
    player.hand.push(player.deck.pop());
  }
}

function playerView(player, revealHand) {
  return {
    name: player.name,
    ready: player.ready,
    morale: player.morale,
    guard: player.guard,
    energy: player.energy,
    maxEnergy: player.maxEnergy,
    attackBuff: player.attackBuff,
    weakness: player.weakness,
    hand: revealHand ? [...player.hand] : [],
    handCount: player.hand.length,
    deckCount: player.deck.length,
    discard: revealHand ? [...player.discard] : [],
    discardCount: player.discard.length,
  };
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [items[index], items[target]] = [items[target], items[index]];
  }
  return items;
}

function cleanName(name) {
  const value = String(name || "Jugador").trim().slice(0, 24);
  return value || "Jugador";
}

function bump(state) {
  state.version += 1;
}
