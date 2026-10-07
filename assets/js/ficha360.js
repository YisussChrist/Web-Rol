(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’'`´]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const registry = new Map();
  const editor = window.Ficha360Editor;
  const universeMeta = {
    inazuma: {label:'Inazuma Eleven', icon:'⚽', page:'centro-inazuma.html'},
    dragonball: {label:'Dragon Ball', icon:'🐉', page:'dragon-dex.html'},
    pokemon: {label:'Pokémon · Etruria', icon:'◉', page:'Pokemon/index.html'}
  };
  const sourceLabels = {inazuma:'Inazuma Central',dragon:'Dragon Dex',pokemon:'Entrenadores de Etruria',family:'Árbol Familiar',relationships:'Relaciones',calendar:'Calendario',chronicle:'Crónicas'};

  function ensure(name, universe, forcedKey = '') {
    const key = forcedKey || normalize(name);
    if (!key) return null;
    if (!registry.has(key)) registry.set(key,{key,name:String(name).trim(),universes:new Set(),sources:new Set(),familyLinks:[],relationships:[],events:[],chronicles:[],isChild:false});
    const record = registry.get(key);
    if (universe) record.universes.add(universe);
    return record;
  }
  function source(record, id) { if (record) record.sources.add(id); }
  function familyImage(path) { return path ? `Hijos Inazuma/${String(path).replace(/^\.\//,'')}` : ''; }

  (window.INAZUMA_CENTER_DATA?.players || []).forEach(player => {
    const record=ensure(player.name,'inazuma'); record.inazuma=player; record.image=record.image||player.image||''; source(record,'inazuma');
  });
  (window.RP_INAZUMA_FAMILIES || []).forEach(family => {
    const mother=ensure(family.madre?.nombre,'inazuma'), father=ensure(family.padre?.nombre,'inazuma');
    const parentKeys=[family.madre?.nombre,family.padre?.nombre].map(normalize);
    [[mother,family.madre],[father,family.padre]].forEach(([record,data])=>{ if(!record)return; record.image=record.image||familyImage(data?.foto); record.familyLinks.push({role:'parent',family}); source(record,'family'); });
    (family.hijos || []).forEach(child => {
      if (!child?.nombre || normalize(child.nombre)==='cargando hijo') return;
      const baseKey=normalize(child.nombre), childKey=parentKeys.includes(baseKey)?`${baseKey} hijo ${normalize(family.familia)}`:baseKey;
      const record=ensure(child.nombre,'inazuma',childKey); record.isChild=true; record.childData=record.childData||child; record.image=record.image||familyImage(child.foto); record.familyLinks.push({role:'child',family}); source(record,'family');
    });
  });
  const dragonCharacters=window.DRAGON_DEX_DATA?.characters || [];
  dragonCharacters.forEach(character => {
    const record=ensure(character.name,'dragonball'); record.dragon=character; record.image=record.image||character.image||''; source(record,'dragon');
  });
  dragonCharacters.forEach(parent => (parent.family?.children || []).forEach(childName => {
    const child=ensure(childName,'dragonball'); child.isChild=true; child.dragonParents=child.dragonParents||[]; if(!child.dragonParents.includes(parent.name))child.dragonParents.push(parent.name); source(child,'dragon');
  }));
  (window.ETRURIA_TRAINERS || []).forEach(trainer => {
    const record=ensure(trainer.name,'pokemon'); record.pokemon=trainer; source(record,'pokemon');
  });

  const relationData=window.RELATIONSHIP_DATA || {characters:[],relationships:[]};
  const relationCharacters=new Map((relationData.characters||[]).map(character=>[character.id,character]));
  (relationData.characters||[]).forEach(character=>{ const record=registry.get(normalize(character.name)); if(record){record.relationIdentity=character;record.image=record.image||character.image||'';source(record,'relationships');} });
  (relationData.relationships||[]).forEach(relation=>{
    const from=relationCharacters.get(relation.from),to=relationCharacters.get(relation.to);
    [[from,to],[to,from]].forEach(([person,other])=>{const record=registry.get(normalize(person?.name));if(record){record.relationships.push({...relation,other});source(record,'relationships');}});
  });
  function universeId(value){const id=normalize(value);return id.includes('inazuma')?'inazuma':id.includes('dragon')?'dragonball':id.includes('pokemon')?'pokemon':'';}
  function findOfficial(name, universe=''){
    const key=normalize(name), exact=registry.get(key);if(exact&&(!universe||exact.universes.has(universe)))return exact;
    if(key.length<4)return null;
    const matches=[...registry.values()].filter(record=>(!universe||record.universes.has(universe))&&(normalize(record.name).startsWith(`${key} `)||key.startsWith(`${normalize(record.name)} `)));
    return matches.length===1?matches[0]:null;
  }
  (window.CALENDAR_EVENTS || []).forEach(event=>{const record=findOfficial(event.title,universeId(event.universe));if(record){record.events.push(event);source(record,'calendar');}});
  (window.CRONICA_EVENTS || []).forEach(entry=>(entry.characters||[]).forEach(name=>{const record=findOfficial(name,universeId(entry.universe));if(record){record.chronicles.push(entry);source(record,'chronicle');}}));

  const records=[...registry.values()].sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
  let selected=null, activeUniverse='all', query='';
  const nodes={list:$('#characterList'),profile:$('#profile'),search:$('#characterSearch'),filters:$('#universeFilters'),count:$('#resultCount'),note:$('#listNote')};
  const initials=name=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  const universeOf=record=>record.universes.has('inazuma')?'inazuma':record.universes.has('dragonball')?'dragonball':'pokemon';
  const universeLabel=record=>[...record.universes].map(id=>universeMeta[id]?.label).filter(Boolean).join(' · ');
  const mainDetail=record=>record.inazuma?.team||record.dragon?.race||record.pokemon?.title||(record.isChild?'Descendencia registrada':'Personaje oficial');
  const avatar=(record,cls='')=>record.image?`<span class="${cls}"><img src="${escapeHTML(record.image)}" alt="" loading="lazy"></span>`:`<span class="${cls}">${escapeHTML(initials(record.name))}</span>`;
  const unique=items=>[...new Set(items.filter(Boolean))];
  const formatPower=value=>value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))?Number(value).toLocaleString('es-ES'):'Pendiente';
  const eventDate=event=>`${String(event.day).padStart(2,'0')}/${String(event.month).padStart(2,'0')}${event.year?`/${event.year}`:''}`;
  const typeIcon=type=>({birthday:'🎂',session:'🎲',anniversary:'💞',event:'✦'}[type]||'◷');

  function fact(label,value){return value!==undefined&&value!==null&&value!==''?`<div class="fact"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`:'';}
  function card(title,body,options={}){return `<article class="data-card ${options.wide?'wide':''}"><div class="card-heading"><h3>${options.icon||'✦'} ${escapeHTML(title)}</h3>${options.link?`<a href="${escapeHTML(options.link)}">Abrir archivo →</a>`:''}</div>${body}</article>`;}
  function chips(values){return values.length?`<div class="chip-list">${values.map(value=>`<span class="chip">${escapeHTML(value)}</span>`).join('')}</div>`:`<p class="empty-data">Todavía no hay información registrada.</p>`;}
  function facts(values){const body=values.filter(Boolean).join('');return body?`<div class="fact-grid">${body}</div>`:`<p class="empty-data">Todavía no hay información registrada.</p>`;}

  function identityCard(record){
    const info=record.details;
    const values=['alias','age','gender','race','status','role','affiliation','origin'].map((id,index)=>fact(['Alias','Edad','Género','Raza o especie','Estado','Ocupación o rol','Afiliación','Origen'][index],info[id]!==''&&info[id]!=null?info[id]:'Pendiente'));
    if(record.inazuma){const p=record.inazuma;values.push(fact('Equipo',p.team||'Pendiente'),fact('Posición',p.position||'Pendiente'),fact('Dorsal',p.number),fact('Elemento',p.element||'Pendiente'),fact('Goles',p.goals),fact('Asistencias',p.assists));}
    if(record.dragon)values.push(fact('Poder base',formatPower(record.dragon.basePower)));
    if(record.pokemon){const p=record.pokemon;values.push(fact('Título',p.title),fact('Región',p.region||'Pendiente'),fact('Ubicación',p.location),fact('Estilo',p.style),fact('Objetivo',p.goal));}
    if(record.childData)values.push(fact('Referencia',record.childData.referencia));
    return card('Identidad',facts(values),{icon:'◎'});
  }
  function abilitiesCard(record){
    let items=[];
    if(record.inazuma){items=(record.inazuma.techniques||[]).map(t=>`${t.name}${t.grade?` · ${t.grade}`:''}`);if(record.inazuma.talent?.nombre)items.unshift(`Talento: ${record.inazuma.talent.nombre}`);if(record.inazuma.spirit?.nombre)items.push(`Espíritu: ${record.inazuma.spirit.nombre}`);if(record.inazuma.miximax?.nombre)items.push(`Miximax: ${record.inazuma.miximax.nombre}`);}
    if(record.dragon){items=(record.dragon.transformations||[]).map(t=>`${t.name}${t.power?` · ${formatPower(t.power)}`:''}`);items.push(...(record.dragon.seals||[]).map(s=>`Sello: ${typeof s==='string'?s:s.name}`));}
    if(record.pokemon){items=[...(record.pokemon.team||[]).map(p=>`${p.name}${p.types?.length?` · ${p.types.join('/')}`:''}`),...(record.pokemon.reserves||[]).map(p=>`${p.name} · reserva`),...(record.pokemon.badges||[]).map(p=>`Medalla: ${p.name}`)];}
    return card(record.pokemon?'Equipo Pokémon':record.dragon?'Poder y transformaciones':'Técnicas y talentos',chips(items),{icon:record.pokemon?'◉':record.dragon?'⚡':'✦'});
  }
  function familyCard(record){
    const rows=[];
    record.familyLinks.forEach(link=>{
      const family=link.family, parents=unique([family.madre?.nombre,family.padre?.nombre]);
      if(link.role==='child')rows.push(`<div class="stack-row"><span class="stack-icon">✦</span><span><strong>Hijo/a de ${escapeHTML(parents.join(' y '))}</strong><small>${escapeHTML(family.familia)} · ${(family.hijos||[]).length} hijos registrados</small></span><span>HIJO/A</span></div>`);
      else {const partner=parents.find(name=>normalize(name)!==record.key);rows.push(`<div class="stack-row"><span class="stack-icon">⌂</span><span><strong>${escapeHTML(partner?`Pareja de ${partner}`:family.familia)}</strong><small>${(family.hijos||[]).filter(h=>normalize(h.nombre)!=='cargando hijo').map(h=>h.nombre).join(', ')||'Sin hijos registrados'}</small></span><span>FAMILIA</span></div>`);}
    });
    if(record.dragon?.family){const f=record.dragon.family;unique([...(f.partners||[])]).forEach(name=>rows.push(`<div class="stack-row"><span class="stack-icon">♡</span><span><strong>Pareja de ${escapeHTML(name)}</strong><small>${escapeHTML(f.group||'Linaje Dragon Ball')}</small></span><span>PAREJA</span></div>`));if(record.dragonParents?.length)rows.push(`<div class="stack-row"><span class="stack-icon">✦</span><span><strong>Hijo/a de ${escapeHTML(unique(record.dragonParents).join(' y '))}</strong><small>Descendencia registrada en Dragon Dex</small></span><span>HIJO/A</span></div>`);if((f.children||[]).length)rows.push(`<div class="stack-row"><span class="stack-icon">⌂</span><span><strong>${f.children.length} hijo${f.children.length===1?'':'s'}</strong><small>${escapeHTML(f.children.join(', '))}</small></span><span>FAMILIA</span></div>`);}
    return card('Familia y descendencia',rows.length?`<div class="stack-list">${rows.join('')}</div>`:`<p class="empty-data">No hay vínculos familiares conectados.</p>`,{icon:'⌂',link:record.universes.has('inazuma')?'Hijos Inazuma/index.html':record.universes.has('dragonball')?'parejasdragonball.html':''});
  }
  function relationshipsCard(record){
    const body=record.relationships.length?`<div class="stack-list">${record.relationships.map(rel=>`<div class="stack-row"><span class="stack-icon">${rel.type==='love'?'♥':'◇'}</span><span><strong>${escapeHTML(rel.other?.name||'Personaje')}</strong><small>${escapeHTML(rel.title||rel.label||'Vínculo registrado')}</small></span><span>${Number(rel.intensity||0)}/5</span></div>`).join('')}</div>`:`<p class="empty-data">No tiene relaciones registradas en el mapa.</p>`;
    return card('Relaciones',body,{icon:'♡',link:'relaciones.html'});
  }
  function eventsCard(record){
    const body=record.events.length?`<div class="stack-list">${record.events.map(event=>`<div class="stack-row"><span class="stack-icon">${typeIcon(event.type)}</span><span><strong>${escapeHTML(event.type==='birthday'?'Cumpleaños':event.title)}</strong><small>${escapeHTML(event.note||'Fecha conectada')}</small></span><span>${eventDate(event)}</span></div>`).join('')}</div>`:`<p class="empty-data">No tiene fechas conectadas.</p>`;
    return card('Fechas',body,{icon:'◷',link:'calendario.html'});
  }
  function chroniclesCard(record){
    const body=record.chronicles.length?`<div class="stack-list">${record.chronicles.map(entry=>`<div class="stack-row"><span class="stack-icon">⌛</span><span><strong>${escapeHTML(entry.title)}</strong><small>${escapeHTML(entry.arc||entry.summary||entry.type)}</small></span><span>${escapeHTML(entry.date||'')}</span></div>`).join('')}</div>`:`<p class="empty-data">Todavía no aparece en ninguna crónica registrada.</p>`;
    return card('Crónicas',body,{icon:'⌛',link:'cronica.html',wide:true});
  }
  function notesCard(record){
    const notes=record.details.description;
    const sources=[...record.sources].map(id=>sourceLabels[id]).filter(Boolean);
    const links=[...record.universes].map(id=>`<a class="source-link" href="${universeMeta[id].page}">${universeMeta[id].icon} ${universeMeta[id].label}</a>`);
    return card('Fuentes de la ficha',`${notes?`<p class="summary-text">${escapeHTML(notes)}</p>`:''}<div class="source-links" style="margin-top:${notes?'14px':'0'}">${links.join('')}<span class="source-link">${escapeHTML(sources.join(' · '))}</span></div>`,{icon:'↗',wide:true});
  }

  function renderProfile(record){
    if(!record){nodes.profile.innerHTML=`<div class="empty-profile"><span>◎</span><h2>Elige un personaje</h2><p>Busca en el directorio para reunir toda su información oficial en una sola ficha.</p></div>`;return;}
    selected=registry.get(record.key);record=editor.effective(selected);document.body.dataset.universe=universeOf(record);
    const universeBadges=[...record.universes].map(id=>`<span class="badge universe">${universeMeta[id].icon} ${universeMeta[id].label}</span>`).join('');
    nodes.profile.innerHTML=`<header class="profile-hero">${avatar(record,'profile-avatar')}<div class="profile-copy"><div class="badges">${universeBadges}${record.isChild?'<span class="badge child">✦ Hijo/a</span>':''}${record.details.status?`<span class="badge status">● ${escapeHTML(record.details.status)}</span>`:''}</div><h2>${escapeHTML(record.name)}</h2><p>${escapeHTML(mainDetail(record))}</p></div><div class="profile-score"><strong>${record.sources.size}</strong><span>fuentes<br>conectadas</span></div></header><div class="profile-body"><div class="section-grid">${identityCard(record)}${abilitiesCard(record)}${familyCard(record)}${relationshipsCard(record)}${eventsCard(record)}${chroniclesCard(record)}${notesCard(record)}</div></div>`;
    const completion=editor.completion(selected),tools=document.createElement('div');tools.className='profile-edit-bar';
    tools.innerHTML=`<div><strong>${completion.percent}% de datos básicos completados</strong><progress max="100" value="${completion.percent}" aria-label="Datos básicos completados"></progress><small>${completion.pending.length?`Pendiente: ${escapeHTML(completion.pending.join(', '))}`:'Datos básicos completos. Los vínculos y archivos asociados se gestionan en sus páginas.'}</small></div><button type="button" id="editProfile360">Editar ficha</button>`;
    nodes.profile.querySelector('.profile-body').prepend(tools);
    tools.querySelector('button').addEventListener('click',()=>editor.open(selected));
    nodes.profile.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const holder=img.parentElement;holder.textContent=initials(record.name);},{once:true}));
    history.replaceState(null,'',`?personaje=${encodeURIComponent(record.key)}`);
    renderList();
  }
  function filteredRecords(){
    const q=normalize(query);
    return records.map(record=>editor.effective(record)).filter(record=>{
      if($('#incompleteOnly').checked&&editor.completion(registry.get(record.key)).percent===100)return false;
      if(activeUniverse==='children'&&!record.isChild)return false;
      if(!['all','children'].includes(activeUniverse)&&!record.universes.has(activeUniverse))return false;
      if(!q)return true;
      const text=normalize([record.name,registry.get(record.key).name,record.details.alias,record.details.race,record.details.affiliation,mainDetail(record),record.inazuma?.title,record.inazuma?.team,record.pokemon?.region,record.pokemon?.location].filter(Boolean).join(' '));
      return text.includes(q);
    }).sort((a,b)=>{if(q){const aa=normalize(a.name),bb=normalize(b.name);if(aa===q)return-1;if(bb===q)return 1;if(aa.startsWith(q)!==bb.startsWith(q))return aa.startsWith(q)?-1:1;}return a.name.localeCompare(b.name,'es',{sensitivity:'base'});});
  }
  function renderList(){
    const found=filteredRecords(), visible=found.slice(0,80);nodes.count.textContent=`${found.length} resultado${found.length===1?'':'s'}`;
    nodes.list.innerHTML=visible.length?visible.map(record=>`<button class="character-result ${selected?.key===record.key?'active':''}" type="button" data-character="${escapeHTML(record.key)}">${avatar(record,'result-avatar')}<span class="result-copy"><strong>${escapeHTML(record.name)}</strong><span>${escapeHTML(universeLabel(record))} · ${escapeHTML(mainDetail(record))}</span></span>${record.isChild?'<span class="child-mini">Hijo/a</span>':'<span aria-hidden="true">›</span>'}</button>`).join(''):`<p class="empty-data">No hay personajes con esos filtros.</p>`;
    nodes.note.textContent=found.length>80?`Mostrando los primeros 80 de ${found.length}. Escribe parte del nombre para concretar.`:'Los personajes marcados como hijo/a proceden de los árboles familiares o la descendencia del Dragon Dex.';
    nodes.list.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const button=img.closest('[data-character]'),record=registry.get(button?.dataset.character);if(record){const holder=img.parentElement;holder.textContent=initials(record.name);}},{once:true}));
  }
  nodes.list.addEventListener('click',event=>{const button=event.target.closest('[data-character]');if(button)renderProfile(registry.get(button.dataset.character));});
  nodes.search.addEventListener('input',event=>{query=event.target.value;renderList();});
  nodes.filters.addEventListener('click',event=>{const button=event.target.closest('[data-universe]');if(!button)return;activeUniverse=button.dataset.universe;nodes.filters.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));renderList();});
  $('#characterCount').textContent=records.length;
  $('#childCount').textContent=records.filter(record=>record.isChild).length;
  $('#connectedCount').textContent=records.filter(record=>record.sources.size>1).length;
  $('#incompleteOnly').addEventListener('change',renderList);
  editor.init(records,()=>{ $('#childCount').textContent=records.filter(record=>editor.effective(record).isChild).length;if(selected)renderProfile(selected);else renderList(); });
  $('#childCount').textContent=records.filter(record=>editor.effective(record).isChild).length;
  renderList();
  const requested=new URLSearchParams(location.search).get('personaje');
  const initial=registry.get(requested)||registry.get(normalize(requested))||registry.get(normalize('Renzu Itō'))||records[0];
  renderProfile(initial);
})();
