const API = 'https://pokeapi.co/api/v2';

const typeNames = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico', grass: 'Planta', ice: 'Hielo',
  fighting: 'Lucha', poison: 'Veneno', ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro', steel: 'Acero', fairy: 'Hada'
};
const allTypes = Object.keys(typeNames);

const typeChart = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const itemOptions = [
  ['none','Ninguno'], ['choice-band','Cinta Elegida'], ['choice-specs','Gafas Elegidas'], ['life-orb','Vidasfera'], ['expert-belt','Cinta Experto'],
  ['muscle-band','Cinta Fuerte'], ['wise-glasses','Gafas Especiales'], ['metronome','Metrónomo x1.2'], ['type-boost','Objeto potenciador de tipo x1.2'],
  ['plate','Tabla / Arceus plate x1.2'], ['gem','Gema de tipo x1.3'], ['assault-vest','Chaleco Asalto'], ['eviolite','Mineral Evolutivo'],
  ['light-clay','Refleluz (solo duración)'], ['custom-boost','Multiplicador custom x1.5']
];

let attacker = null, defender = null, move = null;
const $ = id => document.getElementById(id);

function normalizeName(name){ return (name || '').trim().toLowerCase().replaceAll(' ', '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ñ/g,'n'); }
async function fetchJson(url){ const res = await fetch(url); if(!res.ok) throw new Error('No encontrado'); return res.json(); }
function getStat(pokemon, stat){ return pokemon?.stats?.find(s => s.stat.name === stat)?.base_stat ?? 1; }
function getTypes(pokemon){ return pokemon?.types?.map(t => t.type.name) ?? []; }
function prettyName(name){ return (name || '').split('-').map(x => x.charAt(0).toUpperCase()+x.slice(1)).join(' '); }
function typeChip(type){ return `<span class="type-chip type-${type}">${typeNames[type] || type}</span>`; }
function val(id){ return $(id).value; }
function yes(id){ return val(id) === 'yes'; }

function fillSelects(){
  ['moveType','attackerTeraType','defenderTeraType'].forEach(id => {
    const select = $(id); select.innerHTML = '';
    allTypes.forEach(type => {
      const option = document.createElement('option'); option.value = type; option.textContent = typeNames[type]; select.appendChild(option);
    });
  });
  $('moveType').value = 'fire'; $('attackerTeraType').value = 'normal'; $('defenderTeraType').value = 'normal';
  ['attackBoost','defenseBoost','attackBoostInline','spAttackBoostInline','defenseBoostInline','spDefenseBoostInline'].forEach(id => {
    const select = $(id); if(!select) return; select.innerHTML = '';
    for(let i=-6;i<=6;i++){ const opt=document.createElement('option'); opt.value=i; opt.textContent=i>0?`+${i}`:`${i}`; if(i===0) opt.selected=true; select.appendChild(opt); }
  });
  ['attackerItem','defenderItem'].forEach(id => {
    const select=$(id); select.innerHTML=itemOptions.map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
  });
}

function getFormLabel(name){
  if(name.includes('mega')) return 'Mega'; if(name.includes('primal')) return 'Primigenio'; if(name.includes('gmax')) return 'Gigamax';
  if(name.includes('alola')) return 'Alola'; if(name.includes('galar')) return 'Galar'; if(name.includes('hisui')) return 'Hisui'; if(name.includes('paldea')) return 'Paldea'; if(name.includes('ash')) return 'Especial';
  return '';
}

function renderPokemonPreview(target, pokemon){
  const types = getTypes(pokemon);
  const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
  const formNote = getFormLabel(pokemon.name);
  $(target).innerHTML = `${sprite ? `<img src="${sprite}" alt="${pokemon.name}">` : `<div class="sprite-placeholder">?</div>`}<div><strong>${prettyName(pokemon.name)}</strong>${formNote ? `<span class="form-badge">${formNote}</span>` : ''}<p>HP ${getStat(pokemon,'hp')} · Atk ${getStat(pokemon,'attack')} · Def ${getStat(pokemon,'defense')} · SpA ${getStat(pokemon,'special-attack')} · SpD ${getStat(pokemon,'special-defense')}</p><div class="types">${types.map(typeChip).join('')}</div></div>`;
}

function setBaseFields(kind, pokemon){
  if(kind === 'attacker'){
    $('atkBaseHp').value = getStat(pokemon,'hp');
    $('baseAtk').value = getStat(pokemon,'attack');
    $('atkBaseDef').value = getStat(pokemon,'defense');
    $('baseSpa').value = getStat(pokemon,'special-attack');
    $('atkBaseSpd').value = getStat(pokemon,'special-defense');
    $('atkBaseSpe').value = getStat(pokemon,'speed');
  } else {
    $('baseHp').value = getStat(pokemon,'hp');
    $('defBaseAtk').value = getStat(pokemon,'attack');
    $('baseDef').value = getStat(pokemon,'defense');
    $('defBaseSpa').value = getStat(pokemon,'special-attack');
    $('baseSpd').value = getStat(pokemon,'special-defense');
    $('defBaseSpe').value = getStat(pokemon,'speed');
  }
  updateStatOutputs();
}

function fillAbilitySelect(kind, pokemon){
  const select = $(kind === 'attacker' ? 'attackerAbility' : 'defenderAbility');
  const abilities = pokemon.abilities?.map(a => a.ability.name) ?? [];
  select.innerHTML = '<option value="none">Ninguna / ignorar</option>' + abilities.map(a => `<option value="${a}">${prettyName(a)}</option>`).join('');
}

async function populateForms(kind, pokemon){
  const selectId = kind === 'attacker' ? 'attackerFormSelect' : 'defenderFormSelect';
  const buttonId = kind === 'attacker' ? 'applyAttackerForm' : 'applyDefenderForm';
  const select = $(selectId);
  try{
    const species = await fetchJson(pokemon.species.url);
    const forms = species.varieties.map(v => v.pokemon.name);
    select.innerHTML = forms.map(name => `<option value="${name}" ${name===pokemon.name?'selected':''}>${prettyName(name)}${getFormLabel(name)?' · '+getFormLabel(name):''}</option>`).join('');
  }catch(e){ select.innerHTML = `<option value="${pokemon.name}">${prettyName(pokemon.name)}</option>`; }
  select.disabled = false; $(buttonId).disabled = false;
}

async function loadPokemon(kind, forcedName=null){
  const inputId = kind === 'attacker' ? 'attackerName' : 'defenderName';
  const previewId = kind === 'attacker' ? 'attackerPreview' : 'defenderPreview';
  try{
    const name = forcedName || normalizeName($(inputId).value); if(!name) return;
    const data = await fetchJson(`${API}/pokemon/${name}`);
    if(kind === 'attacker') attacker = data; else defender = data;
    $(inputId).value = data.name;
    renderPokemonPreview(previewId, data); setBaseFields(kind, data); fillAbilitySelect(kind, data); await populateForms(kind, data);
  }catch(e){ $(previewId).innerHTML = `<div class="error">No he encontrado ese Pokémon o forma. Prueba con nombres ingleses como charizard-mega-x, scizor-mega, groudon-primal...</div>`; }
}

async function loadMove(){
  try{
    const name = normalizeName($('moveName').value); if(!name) return;
    const data = await fetchJson(`${API}/move/${name}`); move = data;
    const power = data.power || 0; const type = data.type.name; const category = data.damage_class.name;
    if(power > 0) $('movePower').value = power; if(typeNames[type]) $('moveType').value = type; if(category === 'physical' || category === 'special') $('moveCategory').value = category;
    const zPower = getZMovePower(power); if(zPower) $('zMovePower').value = zPower;
    $('movePreview').innerHTML = `<strong>${prettyName(data.name)}</strong><p>Potencia ${power || 'variable'} · Z ${zPower || 'manual'} · ${category === 'physical' ? 'Físico' : category === 'special' ? 'Especial' : 'Estado'}</p><div class="types">${typeChip(type)}</div>`;
  }catch(e){ $('movePreview').innerHTML = `<div class="error">No he encontrado ese movimiento. Usa el nombre inglés: flamethrower, earthquake, thunderbolt...</div>`; }
}

function getZMovePower(basePower){ const p=Number(basePower); if(!p || p<=0) return 0; if(p<=55) return 100; if(p===60) return 120; if(p<=70) return 140; if(p<=80) return 160; if(p<=95) return 175; if(p<=100) return 180; if(p<=110) return 185; if(p<=125) return 190; if(p<=130) return 195; return 200; }
function effectiveMovePower(){ const p=Number(val('movePower')); if(val('zMoveMode')==='off') return p; if(val('zMoveMode')==='custom') return Number(val('zMovePower')); return getZMovePower(p) || p; }
function calcStat(base, iv, ev, level, nature=1, isHP=false){ if(isHP) return Math.floor(((2*base+iv+Math.floor(ev/4))*level)/100)+level+10; return Math.floor((Math.floor(((2*base+iv+Math.floor(ev/4))*level)/100)+5)*nature); }
function boostModifier(stage){ stage=Number(stage); return stage>=0 ? (2+stage)/2 : 2/(2+Math.abs(stage)); }
function currentAbility(kind){ const custom = normalizeName($(kind==='attacker'?'attackerAbilityCustom':'defenderAbilityCustom').value); return custom || val(kind==='attacker'?'attackerAbility':'defenderAbility'); }
function hasAbility(kind, names){ const a=currentAbility(kind); return names.includes(a); }

function effectiveDefenderTypes(){
  let types = yes('defenderTeraActive') ? [val('defenderTeraType')] : [...getTypes(defender)];
  if(yes('roost')) types = types.filter(t => t !== 'flying');
  if(yes('forestCurse') && !types.includes('grass')) types.push('grass');
  if(yes('trickOrTreat') && !types.includes('ghost')) types.push('ghost');
  if(types.length === 0) types = ['normal'];
  return types;
}

function getEffectiveness(moveType, defenderTypes){
  if(hasAbility('defender',['wonder-guard'])) return 1; // aviso más que simulación completa
  let mult = 1;
  defenderTypes.forEach(defType => {
    let part = typeChart[moveType]?.[defType] ?? 1;
    if(yes('gravity') && moveType === 'ground' && defType === 'flying') part = 1;
    mult *= part;
  });
  if(yes('tarShot') && moveType === 'fire') mult *= 2;
  if(hasAbility('defender',['levitate']) && moveType === 'ground' && !yes('gravity')) mult = 0;
  if(hasAbility('defender',['flash-fire']) && moveType === 'fire') mult = 0;
  if(hasAbility('defender',['water-absorb','storm-drain','dry-skin']) && moveType === 'water') mult = 0;
  if(hasAbility('defender',['sap-sipper']) && moveType === 'grass') mult = 0;
  if(hasAbility('defender',['volt-absorb','lightning-rod','motor-drive']) && moveType === 'electric') mult = 0;
  return mult;
}

function getStab(moveType){
  const originalTypes = getTypes(attacker);
  const teraOn = yes('attackerTeraActive');
  const teraType = val('attackerTeraType');
  if(val('stabMode') === 'yes') return teraOn && moveType === teraType && originalTypes.includes(moveType) ? 2 : 1.5;
  if(val('stabMode') === 'no') return 1;
  let stab = originalTypes.includes(moveType) ? 1.5 : 1;
  if(teraOn && moveType === teraType) stab = originalTypes.includes(moveType) ? 2 : 1.5;
  if(hasAbility('attacker',['adaptability']) && stab > 1) stab = teraOn && originalTypes.includes(moveType) && moveType === teraType ? 2.25 : 2;
  return stab;
}

function weatherDamageModifier(moveType){
  const w=val('weather');
  if(w==='sun' && moveType==='fire') return 1.5; if(w==='sun' && moveType==='water') return 0.5;
  if(w==='rain' && moveType==='water') return 1.5; if(w==='rain' && moveType==='fire') return 0.5;
  return 1;
}
function terrainDamageModifier(moveType){
  const t=val('terrain');
  const atkGrounded = yes('gravity') || yes('attackerGrounded');
  const defGrounded = yes('gravity') || yes('defenderGrounded');
  if(t==='electric' && moveType==='electric' && atkGrounded) return 1.3;
  if(t==='grassy' && moveType==='grass' && atkGrounded) return 1.3;
  if(t==='psychic' && moveType==='psychic' && atkGrounded) return 1.3;
  if(t==='misty' && moveType==='dragon' && defGrounded) return 0.5;
  if(t==='grassy' && val('moveTag')==='earthquake' && defGrounded) return 0.5;
  return 1;
}
function screenModifier(category){
  if(yes('critical')) return 1;
  const active = (category==='physical' && yes('reflect')) || (category==='special' && yes('lightScreen')) || yes('auroraVeil');
  if(!active) return 1;
  return val('battleFormat') === 'doubles' ? 2/3 : 0.5;
}
function statusModifier(category){
  if(val('attackerStatus')==='burn' && category==='physical' && !hasAbility('attacker',['guts'])) return 0.5;
  return 1;
}

function itemAttackModifier(category){
  if(yes('magicRoom')) return 1;
  const item = val('attackerItem');
  if(item==='choice-band' && category==='physical') return 1.5;
  if(item==='choice-specs' && category==='special') return 1.5;
  return 1;
}
function itemDefenseModifier(category){
  if(yes('magicRoom')) return 1;
  const item = val('defenderItem');
  if(item==='assault-vest' && category==='special') return 1.5;
  if(item==='eviolite') return 1.5;
  return 1;
}
function itemDamageModifier(category, effectiveness){
  if(yes('magicRoom')) return 1;
  const item=val('attackerItem');
  if(item==='life-orb') return 1.3; if(item==='expert-belt' && effectiveness>1) return 1.2;
  if(item==='muscle-band' && category==='physical') return 1.1; if(item==='wise-glasses' && category==='special') return 1.1;
  if(['type-boost','plate'].includes(item)) return 1.2; if(item==='gem') return 1.3; if(item==='metronome') return 1.2; if(item==='custom-boost') return 1.5;
  return 1;
}

function abilityAttackModifier(category, moveType){
  let m=1;
  if(hasAbility('attacker',['huge-power','pure-power']) && category==='physical') m*=2;
  if(hasAbility('attacker',['guts']) && val('attackerStatus')!=='none' && category==='physical') m*=1.5;
  if(hasAbility('attacker',['solar-power']) && val('weather')==='sun' && category==='special') m*=1.5;
  if(hasAbility('attacker',['flower-gift']) && val('weather')==='sun' && category==='physical') m*=1.5;
  return m;
}
function abilityDefenseModifier(category, moveType){
  let m=1;
  if(hasAbility('defender',['marvel-scale']) && val('defenderStatus')!=='none' && category==='physical') m*=1.5;
  if(hasAbility('defender',['fur-coat']) && category==='physical') m*=2;
  if(val('weather')==='sand' && effectiveDefenderTypes().includes('rock') && category==='special') m*=1.5;
  if(val('weather')==='snow' && effectiveDefenderTypes().includes('ice') && category==='physical') m*=1.5;
  return m;
}
function abilityDamageModifier(category, moveType, effectiveness){
  let m=1; const tag=val('moveTag');
  if(hasAbility('attacker',['technician']) && Number(val('movePower')) <= 60) m*=1.5;
  if(hasAbility('attacker',['tough-claws']) && yes('moveContact')) m*=1.3;
  if(hasAbility('attacker',['strong-jaw']) && tag==='bite') m*=1.5;
  if(hasAbility('attacker',['iron-fist']) && tag==='punch') m*=1.2;
  if(hasAbility('attacker',['mega-launcher']) && tag==='pulse') m*=1.5;
  if(hasAbility('attacker',['sharpness']) && tag==='blade') m*=1.5;
  if(hasAbility('attacker',['punk-rock']) && tag==='sound') m*=1.3;
  if(hasAbility('attacker',['sheer-force'])) m*=1.3;
  if(hasAbility('attacker',['sand-force']) && val('weather')==='sand' && ['rock','ground','steel'].includes(moveType)) m*=1.3;
  if(hasAbility('attacker',['tinted-lens']) && effectiveness < 1 && effectiveness > 0) m*=2;

  if(hasAbility('defender',['filter','solid-rock','prism-armor']) && effectiveness > 1) m*=0.75;
  if(hasAbility('defender',['multiscale','shadow-shield']) && hpRatioIsFull()) m*=0.5;
  if(hasAbility('defender',['fluffy']) && yes('moveContact')) m*=0.5;
  if(hasAbility('defender',['fluffy']) && moveType==='fire') m*=2;
  if(hasAbility('defender',['thick-fat']) && ['fire','ice'].includes(moveType)) m*=0.5;
  if(hasAbility('defender',['heatproof']) && moveType==='fire') m*=0.5;
  return m;
}
function hpRatioIsFull(){ const hp=calcDefenderHp(); const current=Number(val('currentHp')); return !current || current >= hp; }
function calcDefenderHp(){ const level=Number(val('level')); return calcStat(Number(val('baseHp')), Number(val('hpIV')), Number(val('hpEV')), level, 1, true); }
function setOut(id, value){ const el=$(id); if(el) el.value = Number.isFinite(value) ? value : '—'; }
function calcNormal(base, iv, ev, nature=1){ return calcStat(Number(val(base)), Number(val(iv)), Number(val(ev)), Number(val('level')), nature, false); }
function calcHp(base, iv, ev){ return calcStat(Number(val(base)), Number(val(iv)), Number(val(ev)), Number(val('level')), 1, true); }
function updateStatOutputs(){
  try{
    setOut('atkHpFinal', calcHp('atkBaseHp','atkHpIV','atkHpEV'));
    setOut('atkFinal', calcNormal('baseAtk','atkIV','atkEV', Number(val('attackNature'))));
    setOut('atkDefFinal', calcNormal('atkBaseDef','atkDefIV','atkDefEV'));
    setOut('spaFinal', calcNormal('baseSpa','spaIV','spaEV', Number(val('attackNature'))));
    setOut('atkSpdFinal', calcNormal('atkBaseSpd','atkSpdIV','atkSpdEV'));
    setOut('atkSpeFinal', calcNormal('atkBaseSpe','atkSpeIV','atkSpeEV'));
    setOut('hpFinal', calcHp('baseHp','hpIV','hpEV'));
    setOut('defAtkFinal', calcNormal('defBaseAtk','defAtkIV','defAtkEV'));
    setOut('defFinal', calcNormal('baseDef','defIV','defEV', Number(val('defenseNature'))));
    setOut('defSpaFinal', calcNormal('defBaseSpa','defSpaIV','defSpaEV'));
    setOut('spdFinal', calcNormal('baseSpd','spdIV','spdEV', Number(val('defenseNature'))));
    setOut('defSpeFinal', calcNormal('defBaseSpe','defSpeIV','defSpeEV'));
  }catch(e){}
}

function warningNotes(){
  const notes=[];
  if(yes('tailwind')) notes.push('Viento Afín está activo: afecta a Velocidad, no al daño directo.');
  if(val('attackerStatus')==='sleep' || val('attackerStatus')==='freeze') notes.push('El atacante está dormido/congelado: si no puede atacar, el daño real sería 0; aquí se calcula el golpe si llega a salir.');
  if(val('attackerStatus')==='paralysis') notes.push('Parálisis no baja el daño; solo afecta velocidad y probabilidad de moverse.');
  if(val('defenderStatus')==='poison') notes.push('Veneno no cambia el daño del golpe salvo movimientos concretos como Venoshock, que puedes ajustar manualmente.');
  if(yes('magicRoom')) notes.push('Zona Mágica activa: se ignoran multiplicadores de objetos equipados.');
  if(yes('gravity')) notes.push('Gravedad activa: se considera que los objetivos voladores/Levitación pueden ser golpeados por Tierra.');
  return notes;
}

function calculateDamage(){
  if(!attacker || !defender){ $('result').innerHTML = `<div class="error">Carga primero atacante y defensor.</div>`; return; }
  const level=Number(val('level')); const power=effectiveMovePower(); const originalPower=Number(val('movePower')); const moveType=val('moveType'); const category=val('moveCategory');
  if(!level || !power){ $('result').innerHTML = `<div class="error">Nivel y potencia deben tener valor válido.</div>`; return; }

  syncInlineBoosts(); updateStatOutputs();
  const atkBase = category==='physical' ? Number(val('baseAtk')) : Number(val('baseSpa'));
  const defBase = category==='physical' ? Number(val('baseDef')) : Number(val('baseSpd'));
  const atkIV = category==='physical' ? Number(val('atkIV')) : Number(val('spaIV'));
  const atkEV = category==='physical' ? Number(val('atkEV')) : Number(val('spaEV'));
  const defIV = category==='physical' ? Number(val('defIV')) : Number(val('spdIV'));
  const defEV = category==='physical' ? Number(val('defEV')) : Number(val('spdEV'));
  let attackStat = calcStat(atkBase, atkIV, atkEV, level, Number(val('attackNature')));
  let defenseStat = calcStat(defBase, defIV, defEV, level, Number(val('defenseNature')));
  const hpStat = calcDefenderHp(); const currentHp = Number(val('currentHp')) > 0 ? Number(val('currentHp')) : hpStat;

  attackStat = Math.floor(attackStat * boostModifier(val('attackBoost')) * itemAttackModifier(category) * abilityAttackModifier(category, moveType));
  defenseStat = Math.floor(defenseStat * boostModifier(val('defenseBoost')) * itemDefenseModifier(category) * abilityDefenseModifier(category, moveType));

  const defenderTypes = effectiveDefenderTypes();
  const effectiveness = getEffectiveness(moveType, defenderTypes);
  let baseDamage = Math.floor(Math.floor(Math.floor((2 * level) / 5 + 2) * power * Math.max(1, attackStat) / Math.max(1, defenseStat)) / 50) + 2;

  let modifier = 1;
  modifier *= getStab(moveType);
  modifier *= effectiveness;
  modifier *= weatherDamageModifier(moveType);
  modifier *= terrainDamageModifier(moveType);
  modifier *= screenModifier(category);
  modifier *= itemDamageModifier(category, effectiveness);
  modifier *= abilityDamageModifier(category, moveType, effectiveness);
  modifier *= statusModifier(category);
  modifier *= yes('charge') && moveType === 'electric' ? 2 : 1;
  modifier *= yes('critical') ? 1.5 : 1;

  const minDamage = Math.floor(baseDamage * modifier * 0.85);
  const maxDamage = Math.floor(baseDamage * modifier);
  const minPercent = (minDamage / hpStat) * 100;
  const maxPercent = (maxDamage / hpStat) * 100;
  const minCurrentPercent = (minDamage / currentHp) * 100;
  const maxCurrentPercent = (maxDamage / currentHp) * 100;
  const barWidth = Math.min(maxCurrentPercent, 100);

  let verdict = 'No parece tumbar.';
  if(minDamage >= currentHp) verdict = 'KO garantizado sobre la vida actual.';
  else if(maxDamage >= currentHp) verdict = 'Posible KO con buen roll sobre la vida actual.';
  else if(minDamage * 2 >= currentHp) verdict = '2HKO garantizado aproximadamente.';
  else if(maxDamage * 2 >= currentHp) verdict = 'Posible 2HKO aproximadamente.';

  const effText = effectiveness===0 ? 'Inmune x0' : effectiveness>1 ? `Supereficaz x${effectiveness}` : effectiveness<1 ? `Resistido x${effectiveness}` : 'Neutro x1';
  const notes = warningNotes();
  $('result').innerHTML = `
    <div class="result-main">
      <div>
        <div class="damage-number">${minDamage} - ${maxDamage}</div>
        <p class="result-note">${minPercent.toFixed(1)}% - ${maxPercent.toFixed(1)}% de los PS máximos (${hpStat}). Contra vida actual (${currentHp} PS): ${minCurrentPercent.toFixed(1)}% - ${maxCurrentPercent.toFixed(1)}%. <strong>${verdict}</strong></p>
        <div class="bar"><div class="bar-fill" style="width:${barWidth}%"></div></div>
      </div>
      <div class="details">
        <div><strong>Atacante:</strong> ${prettyName(attacker.name)} · Stat usado: ${attackStat} · Habilidad: ${prettyName(currentAbility('attacker'))}</div>
        <div><strong>Defensor:</strong> ${prettyName(defender.name)} · Stat usado: ${defenseStat} · Tipos efectivos: ${defenderTypes.map(t=>typeNames[t]).join(' / ')} · Habilidad: ${prettyName(currentAbility('defender'))}</div>
        <div><strong>Movimiento:</strong> ${typeNames[moveType]} · ${category==='physical'?'Físico':'Especial'} · Potencia ${power}${val('zMoveMode')!=='off' ? ` · Ataque Z desde ${originalPower}` : ''}</div>
        <div><strong>STAB:</strong> x${getStab(moveType)} · <strong>Efectividad:</strong> ${effText} · <strong>Modificador total aprox:</strong> x${modifier.toFixed(3)}</div>
        ${notes.length ? `<div class="note-list"><strong>Avisos:</strong><ul>${notes.map(n=>`<li>${n}</li>`).join('')}</ul></div>` : ''}
      </div>
    </div>`;
}

$('loadAttacker').addEventListener('click', () => loadPokemon('attacker'));
$('loadDefender').addEventListener('click', () => loadPokemon('defender'));
$('loadMove').addEventListener('click', loadMove);
$('applyAttackerForm').addEventListener('click', () => loadPokemon('attacker', val('attackerFormSelect')));
$('applyDefenderForm').addEventListener('click', () => loadPokemon('defender', val('defenderFormSelect')));
$('calculateDamage').addEventListener('click', calculateDamage);
['attackerName','defenderName','moveName'].forEach(id => $(id).addEventListener('keydown', e => { if(e.key!=='Enter') return; if(id==='attackerName') loadPokemon('attacker'); if(id==='defenderName') loadPokemon('defender'); if(id==='moveName') loadMove(); }));
$('movePower').addEventListener('input', () => { const z=getZMovePower(val('movePower')); if(z && val('zMoveMode')==='auto') $('zMovePower').value=z; });
$('zMoveMode').addEventListener('change', () => { const z=getZMovePower(val('movePower')); if(z && val('zMoveMode')==='auto') $('zMovePower').value=z; });
function syncInlineBoosts(){
  if($('attackBoostInline')) $('attackBoost').value = val('moveCategory') === 'physical' ? val('attackBoostInline') : val('spAttackBoostInline');
  if($('defenseBoostInline')) $('defenseBoost').value = val('moveCategory') === 'physical' ? val('defenseBoostInline') : val('spDefenseBoostInline');
}
document.addEventListener('input', updateStatOutputs);
document.addEventListener('change', updateStatOutputs);

fillSelects(); updateStatOutputs();

const siteWarning = document.getElementById("siteWarning");
const closeSiteWarning = document.getElementById("closeSiteWarning");

closeSiteWarning.addEventListener("click", () => {
    siteWarning.classList.add("is-hidden");
});

document.getElementById("backToMenu").addEventListener("click", () => {
    window.location.href = "../../index.html";
});
