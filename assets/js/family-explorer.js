/* Shared family navigation. Original records and catalogue remain untouched. */
(() => {
  const inazuma = typeof FAMILIAS !== 'undefined';
  const normalizeName = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const person = (p, role) => ({ name: p.nombre || p.name || 'Sin nombre', image: p.foto || p.img || '', role,
    description: p.descripcion || p.notes || '', reference: p.referencia || p.meta || '',
    born: p.nacido ?? p.born, extra: [p.age && `Edad: ${p.age}`, p.powers && `Poderes: ${p.powers}`, p.personality && `Personalidad: ${p.personality}`].filter(Boolean) });
  const families = (inazuma ? FAMILIAS : DATA).map((f, id) => ({ id, name: f.familia || f.family,
    parents: inazuma ? [f.madre && person(f.madre, 'Madre'), f.padre && person(f.padre, 'Padre')].filter(Boolean) : f.parents.map(p => person(typeof p === 'string' ? {name:p} : p, 'Progenitor')),
    children: (f.hijos || f.children).map(p => person(p, 'Descendiente')),
    description: f.descripcion || ''
  }));
  let current = null, selection = null, zoom = 1, near = false;
  // Keep the existing optional Inazuma branch behind its original control.
  const available = () => families.filter(f => !inazuma || (mostrarRen ? f.name === 'Ren y Jeanne' : f.name !== 'Ren y Jeanne'));
  const mount = document.createElement('section');
  mount.className = `family-explorer ${inazuma ? 'fx-inazuma' : 'fx-dragon'}`;
  mount.setAttribute('aria-label', 'Explorador de familias');
  mount.innerHTML = `
    <div class="fx-heading"><div><span class="fx-kicker">${inazuma ? 'INAZUMA ELEVEN · CONEXIONES' : 'DRAGON BALL · LINAJES'}</span><h2>Explorador de familias.</h2><p>Encuentra un personaje y explora las relaciones de su rama.</p></div><button type="button" id="fx-mode">Ver catálogo</button></div>
    <div id="fx-workspace">
      <div class="fx-tools"><label>Buscar personaje o familia<input id="fx-search" type="search" placeholder="Escribe un nombre…" autocomplete="off"></label><label>Rama familiar<select id="fx-family"><option value="">Todas las familias</option></select></label><button id="fx-home" type="button">Vista general</button></div>
      <div id="fx-results" class="fx-results" aria-label="Resultados de búsqueda"></div>
      <div class="fx-status" id="fx-status" role="status"></div>
      <div id="fx-overview" class="fx-overview"></div>
      <section id="fx-branch" hidden>
        <div class="fx-branch-head"><h3 id="fx-title"></h3><div class="fx-view-controls"><button id="fx-out" type="button" aria-label="Alejar árbol">−</button><output id="fx-zoom">100 %</output><button id="fx-in" type="button" aria-label="Acercar árbol">+</button><button id="fx-center" type="button">Centrar</button></div></div>
        <p class="fx-legend">Línea horizontal: progenitores de la familia · Líneas descendentes: hijos registrados</p>
        <div class="fx-branch-layout"><div id="fx-viewport" class="fx-viewport" tabindex="0" aria-label="Árbol familiar. Desplázate para explorar."><div id="fx-diagram" class="fx-diagram"></div></div>
        <aside id="fx-detail" class="fx-detail" aria-label="Ficha y relaciones"><p>Selecciona una persona para consultar sus relaciones.</p></aside></div>
      </section>
    </div>`;
  document.querySelector('body > header').after(mount);
  const $ = id => mount.querySelector(`#fx-${id}`);
  document.body.classList.add('fx-active');
  const text = (tag, value, cls) => { const el = document.createElement(tag); el.textContent = value; if(cls) el.className = cls; return el; };
  function portrait(p) {
    const fallback = text('span', p.name.split(/\s+/).map(s => s[0]).slice(0,2).join(''), 'fx-portrait');
    if (!p.image) return fallback;
    const img = document.createElement('img'); img.src = p.image; img.alt = ''; img.className = 'fx-portrait'; img.loading = 'lazy';
    img.addEventListener('error', () => img.replaceWith(fallback), {once:true}); return img;
  }
  function openFamily(id, p = null) {
    current = available().find(f => f.id === Number(id));
    if(!current) return;
    $('family').value = current.id;
    $('overview').hidden = true; $('branch').hidden = false;
    $('title').textContent = current.name;
    $('diagram').replaceChildren();
    const parents = document.createElement('div'); parents.className = 'fx-parents';
    current.parents.forEach(p => parents.append(node(p)));
    if (!current.parents.length) parents.append(text('p', 'Progenitores sin registrar'));
    const children = document.createElement('div'); children.className = 'fx-children';
    current.children.forEach(p => children.append(node(p)));
    const generation = text('div', '', 'fx-generation');
    generation.append(text('span', 'Descendencia'));
    $('diagram').append(parents, generation, children);
    if (!current.children.length) children.append(text('p', 'Sin descendencia registrada.'));
    $('status').textContent = `${current.parents.length} progenitores · ${current.children.length} hijos registrados`;
    selection = p; zoom = 1; applyZoom();
    if(p) selectPerson(p); else $('detail').replaceChildren(text('h4', 'Relaciones familiares'), text('p', current.description || 'Selecciona una persona para ver su ficha y sus vínculos.'));
    requestAnimationFrame(center);
  }
  function node(p) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'fx-person';
    button.dataset.name = p.name; button.setAttribute('aria-pressed','false');
    button.append(portrait(p), text('strong', p.name), text('small', p.role));
    if(p.born === true) button.append(text('span','Nacido','fx-born'));
    button.addEventListener('click', () => selectPerson(p)); return button;
  }
  function same(a,b) { return !/^(\?+|sin nombre)$/i.test(a.name) && normalizeName(a.name) === normalizeName(b.name); }
  function selectPerson(p) {
    selection = p;
    $('diagram').querySelectorAll('.fx-person').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.name === p.name)));
    const detail = $('detail'); detail.replaceChildren(portrait(p),text('h4',p.name),text('p',p.reference || p.role));
    if(p.description) detail.append(text('p',p.description));
    p.extra.forEach(value => detail.append(text('p',value)));
    const related = current.parents.includes(p) ? current.children : current.parents;
    detail.append(text('h5',current.parents.includes(p) ? 'Hijos registrados' : 'Progenitores'));
    relationList(related, detail);
    if(current.children.includes(p)) { detail.append(text('h5','Otros hijos de esta familia')); relationList(current.children.filter(c => c !== p),detail); }
    else { detail.append(text('h5','Otros progenitores de esta familia')); relationList(current.parents.filter(c=>c!==p),detail); }
    const button = text('button','Ver familia cercana'); button.type='button';
    button.addEventListener('click', () => { near = true; $('search').value = ''; overview(); }); detail.append(button);
  }
  function relationList(people, container) {
    if(!people.length) { container.append(text('p','Sin otros miembros registrados.')); return; }
    people.forEach(p => { const b = text('button',p.name,'fx-relation'); b.type='button'; b.addEventListener('click',()=>{ selectPerson(p); center(); }); container.append(b); });
  }
  function overview() {
    current = null; $('family').value = ''; $('branch').hidden = true; $('overview').hidden = false;
    $('overview').replaceChildren();
    const query = normalizeName($('search').value);
    const visible = available().filter(f => (!near || !selection || [...f.parents,...f.children].some(p => p === selection || same(p,selection))) && (!query || normalizeName(f.name).includes(query) || [...f.parents,...f.children].some(p => normalizeName(p.name).includes(query))));
    $('status').textContent = near && selection ? `Familia cercana de ${selection.name} · ${visible.length} ramas registradas` : `${visible.length} familias · Selecciona una rama para abrir el árbol`;
    visible.forEach(f => {
      const button = text('button','','fx-family-card'); button.type='button';
      const images = document.createElement('div'); images.className = 'fx-family-portraits'; f.parents.forEach(p => images.append(portrait(p)));
      button.append(images,text('h3',f.name),text('p',`${f.children.length} hijos · ${f.parents.map(p=>p.name).join(' · ') || 'Progenitores sin registrar'}`),text('span','Explorar rama →'));
      button.addEventListener('click',()=>openFamily(f.id)); $('overview').append(button);
    });
    if(!visible.length) $('overview').append(text('p','No hay coincidencias. Prueba otro nombre o vuelve a la vista general.'));
  }
  function search() {
    near = false; overview(); $('results').replaceChildren();
    const query = normalizeName($('search').value); if(!query) return;
    const matches = available().flatMap(f => [...f.parents,...f.children].filter(p=>normalizeName(p.name).includes(query)).map(p=>({f,p})));
    matches.slice(0,30).forEach(({f,p}) => {
      const button = text('button',`${p.name} · ${f.name}`); button.type='button';
      button.addEventListener('click',()=>{ $('results').replaceChildren(); openFamily(f.id,p); }); $('results').append(button);
    });
    if(matches.length > 30) $('results').append(text('p','Mostrando 30 personajes. Escribe más letras para afinar la búsqueda.'));
  }
  function center() {
    const target = $('diagram').querySelector('[aria-pressed="true"]') || $('diagram').querySelector('.fx-parents');
    if(!target) return;
    const view = $('viewport'), rect = target.getBoundingClientRect(), frame = view.getBoundingClientRect();
    view.scrollTo({left:view.scrollLeft+rect.left-frame.left-(view.clientWidth-rect.width)/2,top:view.scrollTop+rect.top-frame.top-40,behavior:'auto'});
  }
  function applyZoom() { $('diagram').style.zoom = zoom; $('zoom').textContent = `${Math.round(zoom*100)} %`; $('out').disabled=zoom<=.5; $('in').disabled=zoom>=1.5; }
  $('out').onclick = () => { zoom=Math.max(.5, +(zoom-.1).toFixed(1)); applyZoom(); center(); };
  $('in').onclick = () => { zoom=Math.min(1.5, +(zoom+.1).toFixed(1)); applyZoom(); center(); };
  $('center').onclick = center;
  $('search').addEventListener('input', search);
  $('family').addEventListener('change', () => { near=false; $('search').value=''; $('results').replaceChildren(); $('family').value === '' ? overview() : openFamily($('family').value); });
  $('home').onclick = () => { near=false; selection=null; $('search').value=''; $('results').replaceChildren(); overview(); };
  $('mode').onclick = () => {
    const active = document.body.classList.toggle('fx-active'); $('workspace').hidden=!active;
    $('mode').textContent=active?'Ver catálogo':'Ver árbol';
    document.body.classList.remove('index-open');
  };
  document.addEventListener('keydown', e => {
    if(document.body.classList.contains('fx-active') && e.key==='/') {
      e.stopImmediatePropagation();
      if(!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) { e.preventDefault(); $('search').focus(); }
    }
  },true);
  function refresh() {
    $('family').replaceChildren(new Option('Todas las familias',''));
    available().sort((a,b)=>a.name.localeCompare(b.name,'es')).forEach(f=>$('family').append(new Option(f.name,f.id)));
    near=false; selection=null; $('search').value=''; $('results').replaceChildren(); overview();
  }
  if(inazuma) document.getElementById('secretRenBtn').addEventListener('click',refresh);
  refresh();
})();
