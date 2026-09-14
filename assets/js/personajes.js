/* Read-only character archive. Source records are never modified. */
(() => {
  const $ = selector => document.querySelector(selector);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const owners = [{code:'L',name:'Lexy'},{code:'S',name:'Sans'},{code:'Y',name:'Yisuss'},{code:'O',name:'Otros'},{code:'U',name:'Sin asignar'}];
  const ownerCode = value => { const name = normalize(value); return !name ? 'U' : name.includes('lexy') ? 'L' : name.includes('sans') ? 'S' : /^yisuss?$/.test(name) ? 'Y' : 'O'; };
  const data = (window.RP_CHARACTERS || []).map((record,id) => ({...record,id,name:String(record.name || 'Sin nombre').trim(),anime:String(record.anime || '').replace(/\s+/g,' ').trim(),owner:String(record.owner || '').trim(),note:String(record.note || ''),code:ownerCode(record.owner)}));
  const groups = new Map();
  data.forEach(d => { const key=normalize(d.anime); if(key && !groups.has(key)) groups.set(key,d.anime); });
  const KEY='rp-character-archive-v2';
  function stored() { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {q:localStorage.getItem('q')||'',anime:localStorage.getItem('anime')||'',owner:JSON.parse(localStorage.getItem('owner')||'null'),sort:localStorage.getItem('sort')||'name'}; } catch { return {}; } }
  const saved=stored();
  const state={q:typeof saved.q==='string'?saved.q:'',anime:groups.has(normalize(saved.anime))?normalize(saved.anime):'',owner:Array.isArray(saved.owner)?saved.owner.filter(c=>owners.some(o=>o.code===c)):owners.map(o=>o.code),sort:['name','anime','owner','random'].includes(saved.sort)?saved.sort:'name',view:saved.view==='list'?'list':'cards',page:1};
  const PAGE_SIZE=48;
  let filtered=[];
  let randomOrder=new Map();
  function shuffle() { const ids=data.map(d=>d.id); for(let i=ids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; } randomOrder=new Map(ids.map((id,i)=>[id,i])); }
  shuffle();
  function persist() { try { localStorage.setItem(KEY,JSON.stringify({...state,page:undefined})); } catch {} }
  function element(tag,value,cls) { const el=document.createElement(tag); if(value!==undefined) el.textContent=value; if(cls) el.className=cls; return el; }
  function button(label,action,cls) { const b=element('button',label,cls); b.type='button'; b.addEventListener('click',action); return b; }
  function ownerLabel(d) { return d.owner || 'Sin asignar'; }
  function badge(d) { const b=element('span',ownerLabel(d),'owner-badge'); b.dataset.owner=d.code; return b; }
  function avatar(d) { const el=element('span',d.name.split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase(),'avatar'); el.setAttribute('aria-hidden','true'); el.dataset.owner=d.code; return el; }
  function updateOwners() {
    const wrap=$('#ownerChips'); wrap.replaceChildren();
    owners.forEach(o=>{ const b=button('',()=>{ state.owner=state.owner.includes(o.code)?state.owner.filter(c=>c!==o.code):[...state.owner,o.code]; updateOwners(); render(true); },'owner-option'); b.setAttribute('aria-pressed',String(state.owner.includes(o.code))); b.dataset.owner=o.code; b.append(element('span',o.name),element('span',data.filter(d=>d.code===o.code).length,'count')); wrap.append(b); });
  }
  function activeFilters() {
    const wrap=$('#activeFilters'); wrap.replaceChildren();
    if(state.q) wrap.append(button(`Búsqueda: ${state.q} ×`,()=>{state.q='';$('#q').value='';render(true);},'filter-chip'));
    if(state.anime) wrap.append(button(`${groups.get(state.anime)} ×`,()=>{state.anime='';$('#animeSel').value='';render(true);},'filter-chip'));
    if(state.owner.length!==owners.length) wrap.append(button(`Dueños: ${state.owner.length ? state.owner.map(c=>owners.find(o=>o.code===c).name).join(', ') : 'ninguno'} ×`,()=>{state.owner=owners.map(o=>o.code);updateOwners();render(true);},'filter-chip'));
  }
  function openCharacter(d) {
    const content=$('#characterContent'); content.replaceChildren(avatar(d),element('h2',d.name)); content.querySelector('h2').id='characterTitle';
    const dl=document.createElement('dl');
    [['Serie u obra',d.anime||'Sin serie registrada'],['Dueño',ownerLabel(d)]].forEach(([key,value])=>dl.append(element('dt',key),element('dd',value)));
    content.append(dl,element('h3','Notas'),element('p',d.note||'No hay notas registradas para este personaje.','character-note'));
    const actions=element('div','','dialog-actions');
    if(d.anime) actions.append(button('Ver personajes de esta serie',()=>{state.q='';state.anime=normalize(d.anime);state.owner=owners.map(o=>o.code);$('#q').value='';$('#animeSel').value=state.anime;updateOwners();$('#characterDialog').close();render(true);},'btn'));
    actions.append(button('Ver personajes de este dueño',()=>{state.q='';state.anime='';state.owner=[d.code];$('#q').value='';$('#animeSel').value='';updateOwners();$('#characterDialog').close();render(true);},'btn'));content.append(actions);
    $('#characterDialog').showModal();
  }
  function render(resetPage=false) {
    if(resetPage) state.page=1;
    const terms=normalize(state.q).split(' ').filter(Boolean);
    filtered=data.filter(d=>state.owner.includes(d.code)&&(!state.anime||normalize(d.anime)===state.anime)&&terms.every(t=>normalize([d.name,d.anime,d.owner,d.note].join(' ')).includes(t)));
    const collator=new Intl.Collator('es',{sensitivity:'base',numeric:true});
    const unknownName = d => /^(\?+|sin nombre)$/i.test(d.name);
    filtered.sort((a,b)=>state.sort!=='random' && unknownName(a)!==unknownName(b) ? Number(unknownName(a))-Number(unknownName(b)) : state.sort==='random'?randomOrder.get(a.id)-randomOrder.get(b.id):state.sort==='anime'?collator.compare(a.anime,b.anime)||collator.compare(a.name,b.name):state.sort==='owner'?collator.compare(ownerLabel(a),ownerLabel(b))||collator.compare(a.name,b.name):collator.compare(a.name,b.name));
    const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)); state.page=Math.min(state.page,pages);
    const start=(state.page-1)*PAGE_SIZE, visible=filtered.slice(start,start+PAGE_SIZE);
    $('#resultCount').textContent=`${filtered.length.toLocaleString('es-ES')} de ${data.length.toLocaleString('es-ES')} personajes${filtered.length ? ` · Mostrando ${start+1}–${start+visible.length}`:''}`;
    const grid=$('#grid'); grid.replaceChildren(); grid.classList.toggle('compact',state.view==='list');
    visible.forEach(d=>{ const card=button('',()=>openCharacter(d),'character-card'); card.setAttribute('aria-label',`${d.name} · ${d.anime||'Sin serie'} · ${ownerLabel(d)}. Abrir ficha`); const meta=element('span','','meta'); meta.append(element('strong',d.name),element('span',d.anime||'Sin serie registrada','series-name')); card.append(avatar(d),meta,badge(d)); grid.append(card); });
    if(!visible.length) { const empty=element('div','','empty-state'); empty.append(element('h3','No encontramos personajes'),element('p','Prueba otra búsqueda o elimina alguno de los filtros.'),button('Limpiar filtros',reset,'btn')); grid.append(empty); }
    $('#pageInfo').textContent=`Página ${state.page} de ${pages}`; $('#prevPage').disabled=state.page===1; $('#nextPage').disabled=state.page>=pages;
    $('#cardsView').setAttribute('aria-pressed',String(state.view==='cards')); $('#listView').setAttribute('aria-pressed',String(state.view==='list'));
    $('#clearSearch').hidden=!state.q;
    activeFilters(); distribution(); persist();
  }
  function distribution() {
    const wrap=$('#ownerChart');wrap.replaceChildren();
    owners.forEach(o=>{ const count=filtered.filter(d=>d.code===o.code).length;const row=element('div','','distribution-row');row.append(element('span',o.name),element('strong',count));const track=element('div','','distribution-track');const bar=element('span');bar.style.width=`${filtered.length?count/filtered.length*100:0}%`;track.setAttribute('aria-hidden','true');track.append(bar);row.append(track);wrap.append(row); });
  }
  function reset() { state.q='';state.anime='';state.owner=owners.map(o=>o.code);state.sort='name';$('#q').value='';$('#animeSel').value='';$('#sortSel').value='name';updateOwners();render(true); }
  function exportCSV() {
    const rows=[['Nombre','Serie','Dueño','Código','Notas'],...filtered.map(d=>[d.name,d.anime,d.owner,d.code,d.note])];
    const csv='\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='personajes_filtrado.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  $('#allCount').textContent=data.length.toLocaleString('es-ES');$('#allSeries').textContent=groups.size.toLocaleString('es-ES');$('#allFree').textContent=data.filter(d=>d.code==='U').length;
  [...groups].sort((a,b)=>a[1].localeCompare(b[1],'es')).forEach(([key,label])=>$('#animeSel').append(new Option(label,key)));
  $('#animeSel').value=state.anime;$('#sortSel').value=state.sort;$('#q').value=state.q;
  $('#q').addEventListener('input',e=>{state.q=e.target.value;render(true);});
  $('#clearSearch').onclick=()=>{state.q='';$('#q').value='';render(true);$('#q').focus();};
  $('#animeSel').onchange=e=>{state.anime=e.target.value;render(true);};
  $('#sortSel').onchange=e=>{state.sort=e.target.value;if(state.sort==='random')shuffle();render(true);};
  $('#filterToggle').onclick=()=>{const open=$('.filters').classList.toggle('open');$('#filterToggle').setAttribute('aria-expanded',String(open));$('#filterToggle').textContent=open?'Ocultar filtros':'Mostrar filtros';};
  $('#resetBtn').onclick=reset;$('#allOwners').onclick=()=>{state.owner=owners.map(o=>o.code);updateOwners();render(true);};$('#exportCsv').onclick=exportCSV;
  $('#cardsView').onclick=()=>{state.view='cards';render();};$('#listView').onclick=()=>{state.view='list';render();};
  function page(delta) { state.page+=delta;render();$('#resultsTitle').scrollIntoView({block:'start',behavior:'auto'}); }
  $('#prevPage').onclick=()=>page(-1);$('#nextPage').onclick=()=>page(1);
  $('#actBtn').onclick=()=>$('#updatesDialog').showModal();
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){e.preventDefault();$('#q').focus();}});
  updateOwners();render();
})();
