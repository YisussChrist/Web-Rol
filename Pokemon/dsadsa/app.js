'use strict';

// Bundled mechanics and data: calculations do not depend on network access.
const gen = calc.Generations.get(9);
const $ = id => document.getElementById(id);
const val = id => $(id).value;
const yes = id => val(id) === 'yes';
const num = id => Number(val(id));
const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeNames = {Normal:'Normal',Fire:'Fuego',Water:'Agua',Electric:'Eléctrico',Grass:'Planta',Ice:'Hielo',Fighting:'Lucha',Poison:'Veneno',Ground:'Tierra',Flying:'Volador',Psychic:'Psíquico',Bug:'Bicho',Rock:'Roca',Ghost:'Fantasma',Dragon:'Dragón',Dark:'Siniestro',Steel:'Acero',Fairy:'Hada'};
const itemNames = {'Choice Band':'Cinta Elegida','Choice Specs':'Gafas Elegidas','Choice Scarf':'Pañuelo Elegido','Life Orb':'Vidasfera','Expert Belt':'Cinta Experto','Muscle Band':'Cinta Fuerte','Wise Glasses':'Gafas Especiales','Assault Vest':'Chaleco Asalto','Eviolite':'Mineral Evolutivo','Leftovers':'Restos','Black Sludge':'Lodo Negro','Focus Sash':'Banda Focus','Focus Band':'Cinta Focus','Air Balloon':'Globo Helio','Heavy-Duty Boots':'Botas Gruesas','Rocky Helmet':'Casco Dentado','Safety Goggles':'Gafas Protectoras','Light Clay':'Refleluz','Metronome':'Metrónomo','Punching Glove':'Guante de Boxeo','Loaded Dice':'Dado Trucado','Booster Energy':'Energía Potenciadora','Clear Amulet':'Amuleto Puro','Ability Shield':'Escudo Habilidad','Covert Cloak':'Capa Furtiva','Iron Ball':'Bola Férrea','Thick Club':'Hueso Grueso','Light Ball':'Bola Luminosa','Soul Dew':'Rocío Bondad','Deep Sea Tooth':'Diente Marino','Deep Sea Scale':'Escama Marina','Charcoal':'Carbón','Mystic Water':'Agua Mística','Magnet':'Imán','Miracle Seed':'Semilla Milagro','Never-Melt Ice':'Antiderretir','Black Belt':'Cinturón Negro','Poison Barb':'Flecha Venenosa','Soft Sand':'Arena Fina','Sharp Beak':'Pico Afilado','Twisted Spoon':'Cuchara Torcida','Silver Powder':'Polvo Plata','Hard Stone':'Piedra Dura','Spell Tag':'Hechizo','Dragon Fang':'Colmillo Dragón','Black Glasses':'Gafas de Sol','Metal Coat':'Revestimiento Metálico','Silk Scarf':'Pañuelo Seda','Fairy Feather':'Pluma Feérica','Occa Berry':'Baya Caoca','Passho Berry':'Baya Pasio','Wacan Berry':'Baya Gualot','Rindo Berry':'Baya Tamar','Yache Berry':'Baya Rimoya','Chople Berry':'Baya Pomaro','Kebia Berry':'Baya Kebia','Shuca Berry':'Baya Acardo','Coba Berry':'Baya Kouba','Payapa Berry':'Baya Payapa','Tanga Berry':'Baya Yecana','Charti Berry':'Baya Alcho','Kasib Berry':'Baya Drasi','Haban Berry':'Baya Anjiro','Colbur Berry':'Baya Dillo','Babiri Berry':'Baya Baribá','Chilan Berry':'Baya Chilan','Roseli Berry':'Baya Hibis','Sitrus Berry':'Baya Zidra','Oran Berry':'Baya Aranja','Lum Berry':'Baya Ziuela'};
const favoriteItems = ['Choice Band','Choice Specs','Life Orb','Expert Belt','Assault Vest','Eviolite','Leftovers','Focus Sash','Air Balloon','Heavy-Duty Boots','Punching Glove','Booster Energy','Occa Berry','Yache Berry','Light Ball','Thick Club'];
const fields = {
  attacker:{hp:['atkBaseHp','atkHpIV','atkHpEV','atkHpFinal'],atk:['baseAtk','atkIV','atkEV','atkFinal'],def:['atkBaseDef','atkDefIV','atkDefEV','atkDefFinal'],spa:['baseSpa','spaIV','spaEV','spaFinal'],spd:['atkBaseSpd','atkSpdIV','atkSpdEV','atkSpdFinal'],spe:['atkBaseSpe','atkSpeIV','atkSpeEV','atkSpeFinal']},
  defender:{hp:['baseHp','hpIV','hpEV','hpFinal'],atk:['defBaseAtk','defAtkIV','defAtkEV','defAtkFinal'],def:['baseDef','defIV','defEV','defFinal'],spa:['defBaseSpa','defSpaIV','defSpaEV','defSpaFinal'],spd:['baseSpd','spdIV','spdEV','spdFinal'],spe:['defBaseSpe','defSpeIV','defSpeEV','defSpeFinal']}
};
let attacker = null, defender = null, move = null, lastSummary = '', restoring = false;
const storageKey = 'pokedamage-v2';
const option = (value,label = value) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
const chip = type => `<span class="type-chip type-${type.toLowerCase()}">${typeNames[type] || escapeHtml(type)}</span>`;
const resolveSpecies = name => gen.species.get(calc.toID(name.replace(/^mega[ -](.+)$/i,'$1-Mega')));

function fillItems(kind,query = '') {
  const select = $(kind + 'Item'), selected = select.value;
  const matches = [...gen.items].filter(i => `${i.name} ${itemNames[i.name] || ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const label = i => itemNames[i.name] ? `${itemNames[i.name]} · ${i.name}` : i.name;
  const favorites = matches.filter(i => favoriteItems.includes(i.name));
  const others = matches.filter(i => !favoriteItems.includes(i.name)).sort((a,b) => label(a).localeCompare(label(b),'es'));
  select.innerHTML = option('','Ninguno') + (selected && !matches.some(i => i.name === selected) ? option(selected,itemNames[selected] || selected) : '') + `<optgroup label="Habituales">${favorites.map(i => option(i.name,label(i))).join('')}</optgroup><optgroup label="Catálogo completo">${others.map(i => option(i.name,label(i))).join('')}</optgroup>`;
  select.value = selected;
}

function initializeControls() {
  ['moveType','attackerTeraType','defenderTeraType','attackerType1','defenderType1'].forEach(id => $(id).innerHTML = Object.entries(typeNames).map(([t,n]) => option(t,n)).join(''));
  ['attackerType2','defenderType2'].forEach(id => $(id).innerHTML = option('','Ninguno') + Object.entries(typeNames).map(([t,n]) => option(t,n)).join(''));
  const boosts = ['attackBoostInline','spAttackBoostInline','defenseBoostInline','spDefenseBoostInline'];
  boosts.forEach(id => { $(id).innerHTML = Array.from({length:13},(_,i) => option(i-6,i>6?`+${i-6}`:i-6)).join(''); $(id).value = '0'; });
  ['attacker','defender'].forEach(kind => { fillItems(kind); $(kind + 'Ability').innerHTML = option('','Ninguna / ignorar') + [...gen.abilities].map(a => option(a.name)).join(''); });
  const natureNames = {Adamant:'Firme',Modest:'Modesta',Jolly:'Alegre',Timid:'Miedosa',Bold:'Osada',Impish:'Agitada',Calm:'Serena',Careful:'Cauta',Serious:'Seria'};
  ['attackNature','defenseNature'].forEach(id => { $(id).innerHTML = [...gen.natures].map(n => option(n.name,`${natureNames[n.name] || n.name}${n.plus !== n.minus ? ` (+${n.plus}, −${n.minus})` : ' (neutral)'}`)).join(''); $(id).value = 'Serious'; });
  $('pokemonExamples').innerHTML = [...gen.species].map(s => option(s.name)).join('');
  $('moveExamples').innerHTML = [...gen.moves].map(m => option(m.name)).join('');
  for (const [kind,stats] of Object.entries(fields)) {
    for (const [stat,ids] of Object.entries(stats)) ids.slice(0,3).forEach((id,i) => { $(id).setAttribute('aria-label', `${kind === 'attacker'?'Atacante':'Defensor'} ${stat} ${['base','IV','EV'][i]}`); $(id).step = '1'; });
  }
  ['attackBoostInline','spAttackBoostInline','defenseBoostInline','spDefenseBoostInline'].forEach((id,i) => $(id).setAttribute('aria-label',['Cambio de Ataque','Cambio de Ataque Especial','Cambio de Defensa','Cambio de Defensa Especial'][i]));
}

function renderPokemon(kind) {
  const species = kind === 'attacker' ? attacker : defender;
  if (!species) return;
  $(kind + 'Preview').innerHTML = `<img src="https://play.pokemonshowdown.com/sprites/dex/${species.id}.png" alt="${escapeHtml(species.name)}" width="88" height="88"><div><strong>${escapeHtml(species.name)}</strong><p>Datos base oficiales · editables abajo</p><div class="types">${species.types.map(chip).join('')}</div></div>`;
  $(kind + 'Preview').querySelector('img').addEventListener('error',e => { e.target.style.display = 'none'; });
}

function loadPokemon(kind,forcedName) {
  const species = resolveSpecies(forcedName || val(kind + 'Name'));
  if (!species) { $(kind + 'Preview').innerHTML = '<div class="error">No se encuentra ese Pokémon. Elige un nombre del autocompletado (en inglés).</div>'; return false; }
  if (kind === 'attacker') attacker = species; else defender = species;
  $(kind + 'Name').value = species.name;
  for (const [stat,ids] of Object.entries(fields[kind])) $(ids[0]).value = species.baseStats[stat];
  $(kind + 'Type1').value = species.types[0]; $(kind + 'Type2').value = species.types[1] || '';
  $(kind + 'Ability').value = species.abilities?.[0] || ''; $(kind + 'AbilityCustom').value = '';
  const base = species.baseSpecies ? gen.species.get(calc.toID(species.baseSpecies)) : species;
  const forms = [...new Set([base?.name || species.name,...(base?.otherFormes || []),species.name])];
  $(kind + 'FormSelect').innerHTML = forms.map(n => option(n)).join('');
  $(kind + 'FormSelect').value = species.name; $(kind + 'FormSelect').disabled = false;
  $(kind === 'attacker' ? 'applyAttackerForm' : 'applyDefenderForm').disabled = false;
  renderPokemon(kind); updateStatOutputs();
  if (kind === 'defender') $('currentHp').value = '0';
  markStale(); saveState(); return true;
}

function loadMove() {
  const data = gen.moves.get(calc.toID(val('moveName')));
  if (!data) { $('movePreview').innerHTML = '<div class="error">No se encuentra ese movimiento. Elígelo del autocompletado o usa el modo manual.</div>'; return false; }
  move = data; $('moveName').value = data.name; $('moveMode').value = 'official';
  $('movePower').value = data.basePower; $('moveType').value = data.type;
  $('moveCategory').value = data.category.toLowerCase(); $('moveContact').value = data.flags.contact ? 'yes' : 'no';
  const tag = ['punch','bite','sound','pulse','slicing','bullet'].find(t => data.flags[t]);
  $('moveTag').value = tag === 'bullet' ? 'bomb' : tag === 'slicing' ? 'blade' : tag || 'none';
  $('moveSecondary').value = data.secondaries ? 'yes' : 'no';
  $('spreadMove').value = ['allAdjacent','allAdjacentFoes'].includes(data.target) ? 'yes' : 'no';
  $('movePreview').innerHTML = `<div><strong>${escapeHtml(data.name)}</strong><p>${data.category === 'Status' ? 'Estado · no inflige daño directo' : `Potencia ${data.basePower || 'variable'} · ${data.category === 'Physical' ? 'Físico' : 'Especial'}`}</p><div class="types">${chip(data.type)}</div></div>`;
  $('zMovePower').value = data.zMove?.basePower || 175;
  markStale(); saveState(); return true;
}

function makePokemon(kind) {
  const species = kind === 'attacker' ? attacker : defender;
  if (!species) return null;
  const baseStats = {}, ivs = {}, evs = {};
  for (const [stat,ids] of Object.entries(fields[kind])) { baseStats[stat] = num(ids[0]); ivs[stat] = num(ids[1]); evs[stat] = num(ids[2]); }
  const abilityInput = val(kind + 'AbilityCustom').trim();
  const ability = abilityInput ? gen.abilities.get(calc.toID(abilityInput))?.name : val(kind + 'Ability');
  if (abilityInput && !ability) throw new Error('Habilidad manual desconocida. Usa el nombre inglés o el selector.');
  const types = [val(kind + 'Type1'),val(kind + 'Type2')].filter(Boolean);
  const boosts = kind === 'attacker' ? {atk:num('attackBoostInline'),spa:num('spAttackBoostInline')} : {def:num('defenseBoostInline'),spd:num('spDefenseBoostInline')};
  const statuses = {none:'',burn:'brn',freeze:'frz',sleep:'slp',poison:'psn',paralysis:'par'};
  return new calc.Pokemon(gen,species.name,{
    level:num(kind === 'attacker' ? 'level' : 'defenderLevel'),nature:val(kind === 'attacker' ? 'attackNature' : 'defenseNature'),
    ivs,evs,boosts,ability:ability || '(none)',abilityOn:yes(kind + 'AbilityOn'),item:val(kind + 'Item'),status:statuses[val(kind + 'Status')],
    curHP:kind === 'defender' ? num('currentHp') || undefined : num('attackerHp') || undefined,
    teraType:yes(kind + 'TeraActive') ? val(kind + 'TeraType') : undefined,overrides:{baseStats,types}
  });
}

function makeMove(atk) {
  const manual = val('moveMode') === 'manual';
  if (!manual && !move) throw new Error('Carga un movimiento o selecciona el modo manual.');
  const tag = val('moveTag') === 'bomb' ? 'bullet' : val('moveTag') === 'blade' ? 'slicing' : val('moveTag');
  const power = num('movePower');
  const zPower = power <= 55 ? 100 : power <= 65 ? 120 : power <= 75 ? 140 : power <= 85 ? 160 : power <= 95 ? 175 : power <= 100 ? 180 : power <= 110 ? 185 : power <= 125 ? 190 : power <= 130 ? 195 : 200;
  const overrides = manual ? {basePower:power,type:val('moveType'),category:val('moveCategory') === 'physical' ? 'Physical' : val('moveCategory') === 'status' ? 'Status' : 'Special',flags:{contact:yes('moveContact')?1:0,...(tag !== 'none' ? {[tag]:1} : {})},secondaries:yes('moveSecondary'),target:yes('spreadMove')?'allAdjacentFoes':'normal',zMove:{basePower:zPower},...(num('moveHits') > 1 ? {multihit:num('moveHits')} : {})} : {};
  if (val('zMoveMode') === 'custom') overrides.zMove = {basePower:num('zMovePower')};
  return new calc.Move(gen,manual ? 'Ataque manual' : move.name,{ability:atk.ability,item:atk.item,isCrit:yes('critical'),hits:num('moveHits'),timesUsedWithMetronome:num('metronomeTurns'),useZ:val('zMoveMode') !== 'off',overrides});
}

function makeField() {
  const weather = {none:undefined,sun:'Sun',rain:'Rain',sand:'Sand',snow:'Snow'};
  const terrain = {none:undefined,electric:'Electric',grassy:'Grassy',misty:'Misty',psychic:'Psychic'};
  return new calc.Field({gameType:val('battleFormat') === 'doubles' ? 'Doubles':'Singles',weather:weather[val('weather')],terrain:terrain[val('terrain')],isMagicRoom:yes('magicRoom'),isGravity:yes('gravity'),
    attackerSide:{isCharge:yes('charge'),isTailwind:yes('tailwind'),isHelpingHand:yes('helpingHand')},
    defenderSide:{isReflect:yes('reflect'),isLightScreen:yes('lightScreen'),isAuroraVeil:yes('auroraVeil'),isProtected:yes('protect')}
  });
}

function updateStatOutputs() {
  for (const kind of ['attacker','defender']) {
    try {
      const pokemon = makePokemon(kind); if (!pokemon) continue;
      for (const [stat,ids] of Object.entries(fields[kind])) $(ids[3]).value = pokemon.rawStats[stat];
      $(kind + 'EvTotal').textContent = `EV: ${Object.values(pokemon.evs).reduce((a,b) => a+b,0)} / 510`;
    } catch { /* Incomplete editing is validated when calculating. */ }
  }
}

function validateInputs() {
  for (const input of document.querySelectorAll('input[type="number"]')) {
    if (!input.checkValidity() || input.value === '' || !Number.isInteger(Number(input.value))) { input.focus(); throw new Error('Revisa los valores numéricos: niveles 1–100, IV 0–31 y EV 0–252.'); }
  }
  for (const kind of ['attacker','defender']) {
    const total = Object.values(fields[kind]).reduce((sum,ids) => sum + num(ids[2]),0);
    if (total > 510) throw new Error(`El ${kind === 'attacker' ? 'atacante':'defensor'} supera el límite de 510 EV (${total}).`);
  }
}

function getDamageRolls(damage) {
  if (typeof damage === 'number') return [damage];
  // Nested distributions are per-hit; do not misreport their KO probability.
  if (Array.isArray(damage[0]) || damage.length < 16) return null;
  return Array.from(damage);
}

function calculateDamage() {
  try {
    if (!attacker || !defender) throw new Error('Carga primero el atacante y el defensor.');
    validateInputs(); updateStatOutputs();
    const atk = makePokemon('attacker'), def = makePokemon('defender');
    if (num('currentHp') > def.maxHP() || num('attackerHp') > atk.maxHP()) throw new Error('Los PS actuales no pueden superar los PS máximos. Usa 0 para indicar vida completa.');
    const result = calc.calculate(gen,atk,def,makeMove(atk),makeField()), attack = result.move;
    const [min,max] = result.range(), hp = def.maxHP(), current = def.curHP();
    const rolls = getDamageRolls(result.damage), singleHit = attack.hits === 1 && rolls !== null;
    const sash = !yes('magicRoom') && result.defender.item === 'Focus Sash' && result.defender.ability !== 'Klutz';
    const survives = singleHit && current === hp && (sash || result.defender.ability === 'Sturdy') && attack.category !== 'Status';
    const focusBand = !yes('magicRoom') && result.defender.item === 'Focus Band' && result.defender.ability !== 'Klutz';
    const remainingMin = Math.max(survives ? 1 : 0,current-max), remainingMax = Math.max(survives || focusBand ? 1 : 0,current-min);
    let koChance = singleHit ? 100 * rolls.filter(d => d >= current).length / rolls.length : null;
    if (survives) koChance = 0;
    if (focusBand && koChance !== null) koChance *= .9;
    const notes = [];
    if (!singleHit) notes.push(`Daño total de ${Math.max(attack.hits,Array.isArray(result.damage) && result.damage.length < 16 ? result.damage.length : 1)} golpes. La probabilidad de KO multigolpe no se estima aquí.`);
    if (survives) notes.push(`${sash ? 'Banda Focus' : 'Robustez'} evita el KO con PS completos y deja al menos 1 PS. El rango de daño muestra la potencia del ataque antes de ese efecto.`);
    if (focusBand) notes.push('Cinta Focus ofrece un 10% de supervivencia ante un golpe letal; se incluye en la probabilidad de KO de un golpe.');
    if (attack.category === 'Status') notes.push('Este movimiento es de estado y no causa daño directo.');
    if (yes('tailwind')) notes.push('Viento Afín modifica la velocidad, no el daño directo.');
    if (yes('magicRoom')) notes.push('Zona Mágica anula los efectos de los objetos.');
    if (val('zMoveMode') !== 'off') notes.push('Ataque Z en reglas mixtas: esta mecánica no está disponible en Escarlata/Púrpura.');
    if (['sleep','freeze'].includes(val('attackerStatus'))) notes.push('El resultado supone que el atacante consigue ejecutar el movimiento.');
    if (val('moveMode') === 'manual') notes.push('Modo manual: se usan la potencia, el tipo y las etiquetas que has configurado.');
    notes.push('Los PS restantes muestran el golpe directo; no incluyen recuperación, retroceso ni daño al final del turno.');
    const verdict = max === 0 ? 'Sin daño directo' : survives ? 'Sobrevive con al menos 1 PS' : min >= current && !focusBand ? 'KO garantizado' : max >= current ? 'KO posible' : 'El defensor sobrevive al golpe';
    lastSummary = `${atk.name} → ${def.name} · ${attack.name}: ${min}–${max} PS (${(min/hp*100).toFixed(1)}–${(max/hp*100).toFixed(1)}%). ${verdict}${koChance !== null ? ` · KO de un golpe: ${koChance.toFixed(1)}%` : ''}.`;
    $('result').innerHTML = `<div class="result-header"><span class="eyebrow">Resultado del combate</span><span class="result-verdict">${verdict}</span></div><div class="result-main"><div><div class="damage-number">${min}–${max}<small> PS</small></div><p class="damage-percent">${(min/hp*100).toFixed(1)}–${(max/hp*100).toFixed(1)}% de los PS máximos</p><p class="result-note">${koChance !== null ? `<strong>${koChance.toFixed(1)}% de probabilidad de KO de un golpe</strong><br>` : ''}PS actuales: ${current} / ${hp} · Tras el golpe: ${remainingMin}–${remainingMax} PS</p><div class="bar" aria-label="PS mínimos restantes"><div class="bar-fill" style="width:${remainingMin/hp*100}%"></div></div>${singleHit && rolls ? `<details class="rolls"><summary>Ver ${rolls.length} valores posibles de daño</summary><div class="roll-list">${rolls.map(d => `<span class="${d >= current?'ko-roll':''}">${d}</span>`).join('')}</div></details>` : ''}</div><div class="details"><div><strong>${escapeHtml(atk.name)}</strong> · Nv. ${atk.level} · ${escapeHtml(itemNames[atk.item] || atk.item || 'Sin objeto')}<br>vs. <strong>${escapeHtml(def.name)}</strong> · Nv. ${def.level} · ${escapeHtml(itemNames[def.item] || def.item || 'Sin objeto')}</div><div><strong>${escapeHtml(attack.name)}</strong> · ${typeNames[attack.type] || escapeHtml(attack.type)} · ${attack.category === 'Physical'?'Físico':attack.category === 'Special'?'Especial':'Estado'} · Potencia ${attack.bp || 'variable'}<br>Motor Smogon · Reglas de generación 9</div><details class="calculation-detail"><summary>Desglose del motor (en inglés)</summary><p>${escapeHtml(result.desc())}</p></details></div></div><details class="result-notes"><summary>Detalles y alcance del resultado</summary><ul>${notes.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul></details>`;
    $('resultStatus').textContent = 'Resultado actualizado'; $('copyResult').disabled = false; saveState();
  } catch (error) { $('result').innerHTML = `<div class="error" role="alert">${escapeHtml(error.message)}</div>`; $('copyResult').disabled = true; $('resultStatus').textContent = 'Revisa la configuración'; }
}

function markStale() { $('resultStatus').textContent = 'Configuración modificada · vuelve a calcular'; $('copyResult').disabled = true; }
function saveState() {
  if (restoring) return;
  try {
    const values = {};
    document.querySelectorAll('input[id],select[id]').forEach(el => { if (!el.id.endsWith('ItemSearch')) values[el.id] = el.value; });
    localStorage.setItem(storageKey,JSON.stringify({values,attacker:attacker?.name,defender:defender?.name,move:move?.name}));
  } catch { /* Storage unavailable must not block calculations. */ }
}
function restoreState() {
  try {
    const state = JSON.parse(localStorage.getItem(storageKey)); if (!state?.values) return false;
    restoring = true;
    if (state.attacker) loadPokemon('attacker',state.attacker);
    if (state.defender) loadPokemon('defender',state.defender);
    if (state.move) { $('moveName').value = state.move; loadMove(); }
    for (const [id,value] of Object.entries(state.values)) if ($(id)) $(id).value = value;
    updateStatOutputs(); return true;
  } catch { return false; }
  finally { restoring = false; }
}
function loadExample() {
  document.querySelectorAll('input,select').forEach(el => { if (el.tagName === 'SELECT') { const selected = [...el.options].find(o => o.defaultSelected); el.value = selected?.value ?? el.options[0]?.value ?? ''; } else el.value = el.defaultValue; });
  ['attackBoostInline','spAttackBoostInline','defenseBoostInline','spDefenseBoostInline'].forEach(id => $(id).value = '0');
  ['attacker','defender'].forEach(kind => { $(kind + 'ItemSearch').value = ''; $(kind + 'Item').value = ''; fillItems(kind); });
  $('attackNature').value = 'Modest'; $('defenseNature').value = 'Serious';
  loadPokemon('attacker','Charizard'); loadPokemon('defender','Scizor');
  $('moveName').value = 'Flamethrower'; loadMove(); calculateDamage();
}

initializeControls();
['attacker','defender'].forEach(kind => {
  $(kind === 'attacker'?'loadAttacker':'loadDefender').addEventListener('click',() => loadPokemon(kind));
  $(kind === 'attacker'?'applyAttackerForm':'applyDefenderForm').addEventListener('click',() => loadPokemon(kind,val(kind + 'FormSelect')));
  $(kind + 'ItemSearch').addEventListener('input',() => fillItems(kind,val(kind + 'ItemSearch')));
  $(kind + 'Name').addEventListener('keydown',e => { if (e.key === 'Enter') { e.preventDefault(); loadPokemon(kind); } });
});
$('loadMove').addEventListener('click',loadMove);
$('moveName').addEventListener('keydown',e => { if (e.key === 'Enter') { e.preventDefault(); loadMove(); } });
$('calculateDamage').addEventListener('click',() => { calculateDamage(); $('result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); });
$('setCurrentHpMax').addEventListener('click',() => { $('currentHp').value = '0'; markStale(); saveState(); });
$('loadExample').addEventListener('click',loadExample);
$('copyResult').addEventListener('click',async () => {
  try { await navigator.clipboard.writeText(lastSummary); $('resultStatus').textContent = 'Resultado copiado'; }
  catch { $('resultStatus').textContent = 'No se pudo copiar. Puedes seleccionar el texto del resultado.'; }
});
document.addEventListener('input',e => {
  if (!e.target.matches('input,select')) return;
  if (['movePower','moveType','moveCategory','moveContact','moveTag','moveSecondary','spreadMove'].includes(e.target.id)) $('moveMode').value = 'manual';
  if (e.target.id === 'attackerName') attacker = null; else if (e.target.id === 'defenderName') defender = null; else if (e.target.id === 'moveName') move = null;
  updateStatOutputs(); markStale(); saveState();
});
document.addEventListener('change',e => { if (e.target.matches('input,select')) { updateStatOutputs(); markStale(); saveState(); } });
if (!restoreState()) loadExample(); else if (attacker && defender && (move || val('moveMode') === 'manual')) calculateDamage();
