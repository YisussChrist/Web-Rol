import {
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
} from "./cards.js";

const MAX_MORALE = 20;
const MAX_ENERGY = 8;
const STARTING_HAND = 5;

export function createRoom(code, host) {
  return {
    roomCode: code,
    phase: "waiting",
    players: [createPlayer(host.token, host.name, host.deck)],
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
  state.players.push(createPlayer(player.token, player.name, player.deck));
  state.log.push(`${player.name} se ha unido a la sala.`);
  bump(state);
  return state;
}

export function applyAction(state, token, action) {
  const playerIndex = state.players.findIndex((player) => player.token === token);
  if (playerIndex === -1) throw new Error("No perteneces a esta sala.");
  const player = state.players[playerIndex];

  if (action.type === "ready") {
    return setReady(state, playerIndex, Boolean(action.ready));
  }

  if (state.phase !== "playing") throw new Error("La partida no está en curso.");
  if (state.turn !== playerIndex) throw new Error("Ahora juega tu rival.");
  const resolvingPendingChoice = action.type === "choose-card"
    || (action.type === "tactical-draw" && player.pendingChoice?.type === "tactical-role");
  if (player.pendingChoice && !resolvingPendingChoice) {
    throw new Error("Completa primero la elección de cartas pendiente.");
  }

  if (action.type === "play-card") {
    playCard(state, playerIndex, String(action.cardId || ""));
  } else if (action.type === "choose-card") {
    chooseScoutedCard(state, playerIndex, String(action.cardId || ""));
  } else if (action.type === "tactical-draw") {
    chooseTacticalDraw(state, playerIndex, String(action.role || ""));
  } else if (action.type === "invent-card") {
    useInvention(state, playerIndex, String(action.cardId || ""));
  } else if (action.type === "coach-ability" || action.type === "leader-rewind") {
    useCoachAbility(state, playerIndex, String(action.cardId || ""));
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

export function validateDeck(deck) {
  if (!Array.isArray(deck)) throw new Error("El mazo enviado no es válido.");
  if (deck.length !== DECK_SIZE) throw new Error(`El mazo debe tener exactamente ${DECK_SIZE} cartas.`);

  const counts = new Map();
  for (const rawCardId of deck) {
    const cardId = String(rawCardId || "");
    if (!CARDS_BY_ID[cardId]) throw new Error("El mazo contiene una carta desconocida.");
    const copies = (counts.get(cardId) || 0) + 1;
    if (copies > MAX_COPIES) throw new Error(`Solo puedes llevar ${MAX_COPIES} copias de cada carta.`);
    counts.set(cardId, copies);
  }

  if (counts.size < MIN_UNIQUE_CARDS) {
    throw new Error(`El mazo necesita al menos ${MIN_UNIQUE_CARDS} cartas diferentes.`);
  }
  const offensiveCards = deck.filter((cardId) => (CARDS_BY_ID[cardId]?.attack || 0) > 0).length;
  if (offensiveCards < MIN_OFFENSIVE_CARDS) {
    throw new Error(`El mazo necesita al menos ${MIN_OFFENSIVE_CARDS} cartas ofensivas.`);
  }
  const defensiveCards = deck.filter((cardId) => (CARDS_BY_ID[cardId]?.guard || 0) > 0).length;
  if (defensiveCards < MIN_DEFENSIVE_CARDS) {
    throw new Error(`El mazo necesita al menos ${MIN_DEFENSIVE_CARDS} cartas defensivas.`);
  }
  return [...deck];
}

function createPlayer(token, name, deck = STARTER_DECK) {
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
    costReduction: 0,
    nextCardDiscount: 0,
    nextAffinityDiscount: null,
    fatigue: 0,
    cardsPlayedThisTurn: 0,
    attackCardsPlayedThisTurn: 0,
    playedAffinitiesThisTurn: [],
    affinityChain: "",
    affinityCount: 0,
    talentUses: {},
    healingThisTurn: 0,
    healingBlock: 0,
    drawLock: 0,
    talentSilenced: false,
    coachLocked: false,
    leaderId: LEADER.id,
    leaderUsed: false,
    pendingChoice: null,
    selectedDeck: validateDeck(deck),
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
  const coachIds = shuffle(COACHES.map((coach) => coach.id));
  for (const [index, player] of state.players.entries()) {
    player.leaderId = coachIds[index];
    player.leaderUsed = false;
    player.costReduction = 0;
    player.nextCardDiscount = 0;
    player.nextAffinityDiscount = null;
    player.fatigue = 0;
    resetTurnTrackers(player);
    player.deck = shuffle([...(player.selectedDeck || STARTER_DECK)]);
    drawBalancedStartingHand(state, index);
  }
  state.log.push("Los entrenadores han sido asignados al azar y no se repiten.");
  state.log.push(`Empieza la partida. El primer turno es de ${state.players[state.turn].name}.`);
}

function playCard(state, playerIndex, cardId) {
  const player = state.players[playerIndex];
  const rival = state.players[(playerIndex + 1) % 2];
  ensureTurnState(player);
  const handIndex = player.hand.indexOf(cardId);
  if (handIndex === -1) throw new Error("Esa carta no está en tu mano.");

  const card = CARDS_BY_ID[cardId];
  if (!card) throw new Error("La carta no existe.");
  const activeTalents = getActiveTalentIds(player);
  const costDetails = getEnergyCostDetails(player, card, activeTalents);
  const energyCost = costDetails.cost;
  if (energyCost > player.energy) throw new Error("No tienes suficiente energía.");
  if (card.evolutionOf && !player.discard.includes(card.evolutionOf)) {
    const base = CARDS_BY_ID[card.evolutionOf];
    throw new Error(`Primero debes haber jugado a ${base?.name || "su versión base"}.`);
  }

  const energyBefore = player.energy;
  player.hand.splice(handIndex, 1);
  player.energy -= energyCost;
  if (costDetails.waru) player.costReduction -= 1;
  if (costDetails.nextCard) player.nextCardDiscount = 0;
  if (costDetails.affinity) player.nextAffinityDiscount = null;
  if (costDetails.yachiho) player.talentUses.horaPunta = true;

  const hadBuff = player.attackBuff > 0;
  const rivalHadNoGuard = rival.guard <= 0;
  const affinity = getAffinityTrigger(player, card);
  const affinityReward = affinity.total ? (card.affinityTotal || {}) : {};
  let conditionalBonus = 0;
  if (card.bonusIfBuff && hadBuff) conditionalBonus += card.bonusIfBuff;
  if (card.bonusIfNoGuard && rivalHadNoGuard) conditionalBonus += card.bonusIfNoGuard;
  if (card.bonusIfCardPlayedThisTurn && player.cardsPlayedThisTurn > 0) conditionalBonus += card.bonusIfCardPlayedThisTurn;
  if (card.bonusIfHasGuard && player.guard > 0) conditionalBonus += card.bonusIfHasGuard;
  if (card.affinityComboBonus && card.bonusIfAffinityPlayed?.some((entry) => player.playedAffinitiesThisTurn.includes(entry))) {
    conditionalBonus += card.affinityComboBonus;
  }

  let talentAttack = 0;
  let talentGuard = 0;
  const talentMessages = [];
  if ((card.attack || 0) > 0 && activeTalents.has("fuerza-de-tiro") && !player.talentUses.fuerzaDeTiro) {
    talentAttack += 1;
    player.talentUses.fuerzaDeTiro = true;
    talentMessages.push("Fuerza de Tiro: +1 de ataque");
  }
  if ((card.guard || 0) > 0
    && ["Agua", "Hielo"].includes(card.affinity)
    && activeTalents.has("defensa-plus")
    && !player.talentUses.defensaPlus) {
    talentGuard += 1;
    player.talentUses.defensaPlus = true;
    talentMessages.push("Defensa+: +1 de defensa");
  }
  if ((card.guard || 0) > 0 && /porter[oa]/i.test(card.position || "") && activeTalents.has("portero-plus")) {
    talentGuard += 1;
    talentMessages.push("Portero+: +1 de defensa");
  }

  const resonanceAttack = affinity.resonance && card.affinityPrimary === "attack" ? 1 : 0;
  const resonanceGuard = affinity.resonance && card.affinityPrimary === "guard" ? 1 : 0;
  const attackBonus = conditionalBonus + talentAttack + resonanceAttack + (affinityReward.attack || 0);
  const guardGained = (card.guard || 0) + talentGuard + resonanceGuard + (affinityReward.guard || 0);
  const pierce = (card.pierce || 0) + (affinityReward.pierce || 0);
  const guardBreak = (card.guardBreak || 0) + (affinityReward.guardBreak || 0);
  const guardDestroyed = Math.min(rival.guard, guardBreak);
  if (guardDestroyed) rival.guard -= guardDestroyed;

  let attack = card.attack || 0;
  if (attack > 0) {
    attack = Math.max(0, attack + player.attackBuff - player.weakness + attackBonus);
    player.attackBuff = 0;
    player.weakness = 0;
    dealDamage(rival, attack, pierce);
  }

  if (guardGained) player.guard += guardGained;
  let healingDone = 0;
  let healingBlocked = false;
  if (card.heal) {
    if (player.healingBlock > 0) {
      player.healingBlock -= 1;
      healingBlocked = true;
    } else {
      const requestedHeal = player.morale <= (card.criticalHealThreshold ?? -1)
        ? (card.criticalHeal || card.heal)
        : card.heal;
      const healCapRemaining = Math.max(0, 3 - (player.healingThisTurn || 0));
      healingDone = Math.min(requestedHeal, healCapRemaining, MAX_MORALE - player.morale);
      player.morale += healingDone;
      player.healingThisTurn = (player.healingThisTurn || 0) + healingDone;
    }
  }
  if (card.cleanse) player.weakness = 0;
  const buffGained = (card.buff || 0) + (affinityReward.buff || 0);
  const debuffGiven = (card.debuff || 0) + (affinityReward.debuff || 0);
  const energyGained = (card.energyGain || 0) + (affinityReward.energyGain || 0);
  let cardsDrawn = (card.draw || 0) + (affinityReward.draw || 0);
  if (card.drawIfDiscardContains && player.discard.includes(card.drawIfDiscardContains)) cardsDrawn += 1;
  const enPunto = activeTalents.has("en-punto")
    && !player.talentUses.enPunto
    && energyCost > 0
    && energyCost === energyBefore;
  if (enPunto) {
    cardsDrawn += 1;
    player.talentUses.enPunto = true;
    talentMessages.push("En Punto: roba 1 carta");
  }
  if (buffGained) player.attackBuff += buffGained;
  if (debuffGiven) rival.weakness += debuffGiven;
  if (card.removeOpponentBuff) rival.attackBuff = 0;
  if (card.breakAffinity) {
    rival.affinityChain = "";
    rival.affinityCount = 0;
  }
  if (card.healingBlock) rival.healingBlock = Math.max(rival.healingBlock || 0, card.healingBlock);
  if (card.drawLock) rival.drawLock = Math.max(rival.drawLock || 0, card.drawLock);
  if (card.talentSilence) rival.talentSilenced = true;
  if (card.coachLock) rival.coachLocked = true;
  if (card.nextCardDiscount || affinityReward.nextCardDiscount) {
    player.nextCardDiscount = (player.nextCardDiscount || 0) + (card.nextCardDiscount || 0) + (affinityReward.nextCardDiscount || 0);
  }
  if (affinityReward.nextAffinityDiscount) {
    player.nextAffinityDiscount = { affinity: card.affinity, amount: affinityReward.nextAffinityDiscount };
  }
  if (energyGained) player.energy = Math.min(player.maxEnergy, player.energy + energyGained);
  let drawBlocked = false;
  if (cardsDrawn && player.drawLock > 0) {
    player.drawLock -= 1;
    cardsDrawn = 0;
    drawBlocked = true;
  }
  if (cardsDrawn) drawCards(state, playerIndex, cardsDrawn);
  const talentWasActive = card.talent ? getActiveTalentIds(player).has(card.talent.id) : false;
  player.discard.push(card.id);
  const talentActivated = Boolean(card.talent && !talentWasActive);
  let scoutBlocked = false;
  if (card.scout && state.phase === "playing") {
    if (player.drawLock > 0) {
      player.drawLock -= 1;
      scoutBlocked = true;
    } else {
      beginScout(state, playerIndex, card.scout, "scout");
    }
  }

  player.cardsPlayedThisTurn += 1;
  if ((card.attack || 0) > 0) player.attackCardsPlayedThisTurn += 1;
  if (card.category === "player" && card.affinity) {
    player.playedAffinitiesThisTurn.push(card.affinity);
    player.affinityChain = affinity.total ? "" : card.affinity;
    player.affinityCount = affinity.total ? 0 : affinity.count;
  }
  if (activeTalents.has("poder-dorado") && !player.talentUses.poderDorado && player.cardsPlayedThisTurn === 3) {
    const recovered = Math.min(1, player.maxEnergy - player.energy);
    player.energy += recovered;
    player.talentUses.poderDorado = true;
    talentMessages.push(`Poder Dorado: ${recovered ? "recupera 1 de energía" : "energía ya al máximo"}`);
  }

  const details = [];
  if (attack) details.push(`${attack} de ataque`);
  if (conditionalBonus) details.push(`bonificación de +${conditionalBonus}`);
  if (pierce) details.push(`hasta ${pierce} atraviesa defensa`);
  if (guardDestroyed) details.push(`${guardDestroyed} de defensa rival destruida`);
  if (guardGained) details.push(`${guardGained} de defensa`);
  if (healingDone) details.push(`${healingDone} de moral recuperada`);
  if (healingBlocked) details.push("curación anulada por Anticuración");
  if (card.cleanse) details.push("debilitación eliminada");
  if (buffGained) details.push(`+${buffGained} al próximo ataque`);
  if (debuffGiven) details.push(`-${debuffGiven} al próximo ataque rival`);
  if (card.removeOpponentBuff) details.push("potenciación rival eliminada");
  if (cardsDrawn) details.push(`${cardsDrawn} carta${cardsDrawn === 1 ? "" : "s"} robada${cardsDrawn === 1 ? "" : "s"}`);
  if (drawBlocked || scoutBlocked) details.push("búsqueda anulada por Interferencia");
  if (energyGained) details.push(`${energyGained} de energía recuperada`);
  if (costDetails.totalDiscount) details.push(`coste reducido en ${costDetails.totalDiscount}`);
  if (affinity.resonance) details.push(`Resonancia ${card.affinity} ×2`);
  if (affinity.total) details.push(`Afinidad Total ${card.affinity}: ${card.affinityTotal?.text || "beneficio activado"}`);
  if (talentActivated) details.push(`Talento activado — ${card.talent.name}: ${card.talent.text}`);
  if (card.breakAffinity) details.push("cadena de afinidad rival rota");
  if (card.healingBlock) details.push("próxima curación rival bloqueada");
  if (card.drawLock) details.push("próximo robo adicional rival bloqueado");
  if (card.talentSilence) details.push("talentos rivales silenciados durante su próximo turno");
  if (card.coachLock) details.push("entrenador rival bloqueado durante su próximo turno");
  details.push(...talentMessages);
  if (card.scout && player.pendingChoice) details.push(`elige entre ${player.pendingChoice.cardIds.length} cartas`);
  state.log.push(`${player.name} juega ${card.name} — ${card.version}${details.length ? ` (${details.join(", ")})` : ""}.`);

  if (state.phase === "playing" && rival.morale <= 0) finishGame(state, playerIndex);
}

function beginScout(state, playerIndex, count, type) {
  const player = state.players[playerIndex];
  const cardIds = [];
  for (let index = 0; index < count; index += 1) {
    if (!player.deck.length) recycleDiscard(state, playerIndex);
    if (state.phase !== "playing" || !player.deck.length) break;
    cardIds.push(player.deck.pop());
  }
  if (cardIds.length) player.pendingChoice = { type, cardIds };
}

function chooseScoutedCard(state, playerIndex, cardId) {
  const player = state.players[playerIndex];
  const choice = player.pendingChoice;
  if (!choice || !["scout", "coach-scout", "tactical-scout"].includes(choice.type)) {
    throw new Error("No tienes ninguna elección pendiente.");
  }
  if (!choice.cardIds.includes(cardId)) throw new Error("Esa carta no forma parte de la selección.");
  if (player.hand.length >= 8) throw new Error("Tu mano está llena.");

  const remaining = choice.cardIds.filter((entry) => entry !== cardId);
  player.hand.push(cardId);
  player.deck.unshift(...remaining);
  player.pendingChoice = null;
  const card = CARDS_BY_ID[cardId];
  const source = choice.type === "coach-scout"
    ? "la Lectura Shinobi de Code"
    : choice.type === "tactical-scout"
      ? "la Perspicacia de Leii"
      : "Leii Ishikawa";
  state.log.push(`${player.name} elige ${card?.name || "una carta"} gracias a ${source}.`);
}

function chooseTacticalDraw(state, playerIndex, role) {
  const player = state.players[playerIndex];
  const choice = player.pendingChoice;
  if (!choice || choice.type !== "tactical-role" || !choice.roles.includes(role)) {
    throw new Error("Esa opción de Robo Táctico no está disponible.");
  }
  player.pendingChoice = null;
  performTacticalDraw(state, playerIndex, role);
}

function useInvention(state, playerIndex, cardId) {
  const player = state.players[playerIndex];
  ensureTurnState(player);
  if (!getActiveTalentIds(player).has("invencion")) throw new Error("Invención no está activa.");
  if (player.talentUses.invencion) throw new Error("Ya has usado Invención este turno.");
  const handIndex = player.hand.indexOf(cardId);
  if (handIndex === -1) throw new Error("Esa carta no está en tu mano.");
  const sourceCard = CARDS_BY_ID[cardId];
  const sourceIsAttack = isOffensive(sourceCard) && !isDefensive(sourceCard);
  const sourceIsDefense = isDefensive(sourceCard) && !isOffensive(sourceCard);
  if (!sourceIsAttack && !sourceIsDefense) {
    throw new Error("Invención necesita una carta puramente ofensiva o defensiva.");
  }
  const targetRole = sourceIsAttack ? "defense" : "attack";
  const predicate = targetRole === "attack"
    ? (candidate) => isOffensive(candidate) && !isDefensive(candidate)
    : (candidate) => isDefensive(candidate) && !isOffensive(candidate);
  const candidates = [];
  for (const [zone, cardIds] of [["deck", player.deck], ["discard", player.discard]]) {
    cardIds.forEach((candidateId, index) => {
      if (predicate(CARDS_BY_ID[candidateId])) candidates.push({ zone, index, cardId: candidateId });
    });
  }
  if (!candidates.length) throw new Error("No queda una carta de la función contraria para inventar.");
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  player.hand.splice(handIndex, 1);
  player.discard.push(cardId);
  const zone = picked.zone === "deck" ? player.deck : player.discard;
  const [newCardId] = zone.splice(picked.index, 1);
  player.hand.push(newCardId);
  player.talentUses.invencion = true;
  state.log.push(`${player.name} activa Invención: cambia ${sourceCard.name} por ${CARDS_BY_ID[newCardId]?.name || "una carta de función contraria"}.`);
}

function useCoachAbility(state, playerIndex, cardId) {
  const player = state.players[playerIndex];
  const coach = COACHES_BY_ID[player.leaderId] || LEADER;
  if (player.leaderUsed) throw new Error(`Ya has usado la habilidad de ${coach.name}.`);
  if (player.coachLocked) throw new Error("La Presión al banquillo impide usar a tu entrenador este turno.");

  if (coach.abilityType === "rewind") {
    if (player.hand.length >= 8) throw new Error("Tu mano está llena.");
    const discardIndex = player.discard.lastIndexOf(cardId);
    if (discardIndex === -1) throw new Error("Esa carta no está en tu descarte.");
    player.discard.splice(discardIndex, 1);
    player.hand.push(cardId);
    const card = CARDS_BY_ID[cardId];
    state.log.push(`${player.name} activa ${coach.abilityName} y recupera ${card?.name || "una carta"}.`);
  } else if (coach.abilityType === "stellar-buff") {
    player.attackBuff += 4;
    state.log.push(`${player.name} activa ${coach.abilityName}: su próximo ataque recibe +4.`);
  } else if (coach.abilityType === "ninja-scout") {
    if (player.hand.length >= 8) throw new Error("Tu mano está llena.");
    if (!player.deck.length && !player.discard.length) throw new Error("No quedan cartas que Code pueda localizar.");
    if (player.drawLock > 0) {
      player.drawLock -= 1;
      state.log.push(`${player.name} activa ${coach.abilityName}, pero Interferencia anula la búsqueda.`);
    } else {
      beginScout(state, playerIndex, 5, "coach-scout");
      state.log.push(`${player.name} activa ${coach.abilityName} y busca la jugada decisiva.`);
    }
  } else if (coach.abilityType === "explosive-drive") {
    player.energy = Math.min(player.maxEnergy, player.energy + 2);
    player.attackBuff += 2;
    state.log.push(`${player.name} activa ${coach.abilityName}: recupera energía y potencia su próximo ataque.`);
  } else if (coach.abilityType === "tactical-control") {
    player.costReduction = (player.costReduction || 0) + 2;
    state.log.push(`${player.name} activa ${coach.abilityName}: sus 2 próximas cartas cuestan 1 menos.`);
  } else if (coach.abilityType === "iron-wall") {
    player.guard += 6;
    player.weakness = 0;
    state.log.push(`${player.name} activa ${coach.abilityName}: gana 6 de defensa y elimina su debilitación.`);
  } else {
    throw new Error("La habilidad de este entrenador no está disponible.");
  }

  player.leaderUsed = true;
}

function endTurn(state, playerIndex) {
  const player = state.players[playerIndex];
  if (player.pendingChoice) throw new Error("Completa primero la elección de cartas pendiente.");
  const nextIndex = (playerIndex + 1) % state.players.length;
  const next = state.players[nextIndex];
  player.talentSilenced = false;
  player.coachLocked = false;
  state.turn = nextIndex;
  next.maxEnergy = Math.min(MAX_ENERGY, next.maxEnergy + 1);
  next.energy = next.maxEnergy;
  resetTurnTrackers(player);
  state.log.push(`${player.name} termina su turno. Ahora juega ${next.name}.`);
  beginTurnDraw(state, nextIndex);
}

function getEnergyCostDetails(player, card, activeTalents = getActiveTalentIds(player)) {
  ensureTurnState(player);
  const waru = (player.costReduction || 0) > 0;
  const nextCard = (player.nextCardDiscount || 0) > 0;
  const affinity = Boolean(
    player.nextAffinityDiscount
    && player.nextAffinityDiscount.affinity === card.affinity
    && player.nextAffinityDiscount.amount > 0,
  );
  const yachiho = activeTalents.has("hora-punta")
    && player.cardsPlayedThisTurn === 1
    && !player.talentUses.horaPunta;
  const totalDiscount = (waru ? 1 : 0)
    + (nextCard ? player.nextCardDiscount : 0)
    + (affinity ? player.nextAffinityDiscount.amount : 0)
    + (yachiho ? 1 : 0);
  return {
    cost: Math.max(0, card.cost - totalDiscount),
    totalDiscount,
    waru,
    nextCard,
    affinity,
    yachiho,
  };
}

function getAffinityTrigger(player, card) {
  if (card.category !== "player" || !card.affinity) {
    return { count: player.affinityCount || 0, resonance: false, total: false };
  }
  const count = player.affinityChain === card.affinity ? (player.affinityCount || 0) + 1 : 1;
  return { count, resonance: count === 2, total: count >= 3 };
}

function getActiveTalentIds(player) {
  const talents = new Set();
  if (player.talentSilenced) return talents;
  for (const cardId of player.discard || []) {
    const talentId = CARDS_BY_ID[cardId]?.talent?.id;
    if (talentId) talents.add(talentId);
  }
  return talents;
}

function getActiveTalents(player) {
  const talents = [];
  if (player.talentSilenced) return talents;
  const seen = new Set();
  for (const cardId of player.discard || []) {
    const card = CARDS_BY_ID[cardId];
    if (!card?.talent || seen.has(card.talent.id)) continue;
    seen.add(card.talent.id);
    talents.push({ cardId, name: card.talent.name, text: card.talent.text });
  }
  return talents;
}

function ensureTurnState(player) {
  if (!Array.isArray(player.playedAffinitiesThisTurn)) player.playedAffinitiesThisTurn = [];
  if (!player.talentUses || typeof player.talentUses !== "object") player.talentUses = {};
  player.cardsPlayedThisTurn ||= 0;
  player.attackCardsPlayedThisTurn ||= 0;
  player.affinityChain ||= "";
  player.affinityCount ||= 0;
  player.nextCardDiscount ||= 0;
  player.healingThisTurn ||= 0;
  player.healingBlock ||= 0;
  player.drawLock ||= 0;
  if (!player.nextAffinityDiscount) player.nextAffinityDiscount = null;
}

function resetTurnTrackers(player) {
  player.cardsPlayedThisTurn = 0;
  player.attackCardsPlayedThisTurn = 0;
  player.playedAffinitiesThisTurn = [];
  player.affinityChain = "";
  player.affinityCount = 0;
  player.nextAffinityDiscount = null;
  player.talentUses = {};
  player.healingThisTurn = 0;
}

function dealDamage(player, amount, pierce = 0) {
  const direct = Math.min(amount, Math.max(0, pierce));
  player.morale = Math.max(0, player.morale - direct);
  const remaining = amount - direct;
  const blocked = Math.min(player.guard, remaining);
  player.guard -= blocked;
  player.morale = Math.max(0, player.morale - (remaining - blocked));
}

function drawCards(state, playerIndex, count) {
  const player = state.players[playerIndex];
  for (let index = 0; index < count; index += 1) {
    if (player.hand.length >= 8) return;
    if (!player.deck.length) recycleDiscard(state, playerIndex);
    if (state.phase === "finished" || !player.deck.length) return;
    player.hand.push(player.deck.pop());
  }
}

function drawBalancedStartingHand(state, playerIndex) {
  const player = state.players[playerIndex];
  const preferred = [isDirectOffensive, isDirectOffensive, isDefensive, isDefensive];
  for (const predicate of preferred) {
    const cardId = takeMatchingCard(player.deck, (candidateId) => predicate(CARDS_BY_ID[candidateId]));
    if (cardId) player.hand.push(cardId);
  }
  drawCards(state, playerIndex, STARTING_HAND - player.hand.length);
}

function beginTurnDraw(state, playerIndex) {
  const player = state.players[playerIndex];
  if (player.hand.length >= 8) return;
  const missingRoles = [];
  if (!player.hand.some((cardId) => isOffensive(CARDS_BY_ID[cardId]))) missingRoles.push("attack");
  if (!player.hand.some((cardId) => isDefensive(CARDS_BY_ID[cardId]))) missingRoles.push("defense");
  const availableRoles = missingRoles.filter((role) => hasCardForRole(player, role));
  if (!availableRoles.length) {
    drawCards(state, playerIndex, 1);
    return;
  }
  if (availableRoles.length === 1) {
    performTacticalDraw(state, playerIndex, availableRoles[0]);
    return;
  }
  player.pendingChoice = { type: "tactical-role", roles: availableRoles };
  state.log.push(`${player.name} puede elegir un Robo Táctico de ataque o defensa.`);
}

function performTacticalDraw(state, playerIndex, role) {
  const player = state.players[playerIndex];
  const predicate = role === "attack" ? isOffensive : isDefensive;
  if (!player.deck.some((cardId) => predicate(CARDS_BY_ID[cardId])) && player.discard.length) {
    const matchingDiscard = player.discard.some((cardId) => predicate(CARDS_BY_ID[cardId]));
    if (matchingDiscard) {
      player.deck.push(...shuffle([...player.discard]));
      player.discard = [];
      player.fatigue = (player.fatigue || 0) + 1;
      player.morale = Math.max(0, player.morale - player.fatigue);
      state.log.push(`${player.name} reorganiza su descarte para el Robo Táctico y pierde ${player.fatigue} de moral.`);
      if (player.morale <= 0) {
        finishGame(state, (playerIndex + 1) % state.players.length);
        return;
      }
    }
  }
  const hasPerspicacia = getActiveTalentIds(player).has("perspicacia");
  const compatible = takeMatchingCards(player.deck, (cardId) => predicate(CARDS_BY_ID[cardId]), hasPerspicacia ? 3 : 1);
  if (!compatible.length) {
    drawCards(state, playerIndex, 1);
    state.log.push(`El Robo Táctico de ${player.name} no encontró una carta compatible; roba una carta normal.`);
    return;
  }
  const roleLabel = role === "attack" ? "ofensiva" : "defensiva";
  if (hasPerspicacia && compatible.length > 1) {
    player.pendingChoice = { type: "tactical-scout", role, cardIds: compatible };
    state.log.push(`${player.name} activa Perspicacia y examina ${compatible.length} cartas ${roleLabel}s.`);
    return;
  }
  const [picked, ...remaining] = compatible;
  player.hand.push(picked);
  player.deck.unshift(...remaining);
  state.log.push(`${player.name} realiza un Robo Táctico y recibe una carta ${roleLabel}.`);
}

function hasCardForRole(player, role) {
  const predicate = role === "attack" ? isOffensive : isDefensive;
  return [...player.deck, ...player.discard].some((cardId) => predicate(CARDS_BY_ID[cardId]));
}

function takeMatchingCard(deck, predicate) {
  for (let index = deck.length - 1; index >= 0; index -= 1) {
    if (!predicate(deck[index])) continue;
    return deck.splice(index, 1)[0];
  }
  return "";
}

function takeMatchingCards(deck, predicate, count) {
  const picked = [];
  for (let index = deck.length - 1; index >= 0 && picked.length < count; index -= 1) {
    if (!predicate(deck[index])) continue;
    picked.push(deck.splice(index, 1)[0]);
  }
  return picked;
}

function isOffensive(card) {
  return Boolean((card?.attack || 0) > 0);
}

function isDirectOffensive(card) {
  return isOffensive(card) && card?.role !== "balance";
}

function isDefensive(card) {
  return Boolean((card?.guard || 0) > 0);
}

function recycleDiscard(state, playerIndex) {
  const player = state.players[playerIndex];
  if (player.deck.length || !player.discard.length) return false;
  player.deck = shuffle([...player.discard]);
  player.discard = [];
  player.fatigue = (player.fatigue || 0) + 1;
  player.morale = Math.max(0, player.morale - player.fatigue);
  state.log.push(`${player.name} reorganiza su descarte y pierde ${player.fatigue} de moral por agotamiento.`);
  if (player.morale <= 0) finishGame(state, (playerIndex + 1) % state.players.length);
  return true;
}

function finishGame(state, winnerIndex) {
  if (state.phase === "finished") return;
  const winner = state.players[winnerIndex];
  state.phase = "finished";
  state.winnerToken = winner.token;
  state.log.push(`${winner.name} gana el Duelo de Resonancia.`);
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
    costReduction: player.costReduction || 0,
    nextCardDiscount: player.nextCardDiscount || 0,
    nextAffinityDiscount: player.nextAffinityDiscount
      ? { affinity: player.nextAffinityDiscount.affinity, amount: player.nextAffinityDiscount.amount }
      : null,
    fatigue: player.fatigue || 0,
    cardsPlayedThisTurn: player.cardsPlayedThisTurn || 0,
    attackCardsPlayedThisTurn: player.attackCardsPlayedThisTurn || 0,
    playedAffinitiesThisTurn: [...(player.playedAffinitiesThisTurn || [])],
    affinityChain: player.affinityChain || "",
    affinityCount: player.affinityCount || 0,
    talentUses: { ...(player.talentUses || {}) },
    healingThisTurn: player.healingThisTurn || 0,
    healingBlock: player.healingBlock || 0,
    drawLock: player.drawLock || 0,
    talentSilenced: Boolean(player.talentSilenced),
    coachLocked: Boolean(player.coachLocked),
    activeTalents: getActiveTalents(player),
    leaderId: player.leaderId || LEADER.id,
    leaderUsed: Boolean(player.leaderUsed),
    pendingChoice: revealHand && player.pendingChoice
      ? {
        type: player.pendingChoice.type,
        cardIds: [...(player.pendingChoice.cardIds || [])],
        roles: [...(player.pendingChoice.roles || [])],
        role: player.pendingChoice.role || "",
      }
      : null,
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
