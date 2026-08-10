  // --- Datos originales inyectados ---
const characters = window.RP_CHARACTERS || [];
// --- Utilidades ---
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const initials = (name) => (name || '').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase() || '??';
  const ownerCode = (owner) => {
    if(!owner) return '';
    const o = owner.toLowerCase();
    if(o.includes('lexy')) return 'L';
    if(o.includes('sans')) return 'S';
    if(o.includes('yisuss')) return 'Y';
    return 'O'; // Otros
  };

  // Normaliza
  const data = (characters || []).map(c => ({
    name: c.name?.trim() || '—',
    anime: (c.anime || '').replace(/\s+/g,' ').trim(),
    owner: (c.owner ?? '') === '' ? null : c.owner,
    note: c.note || null,
    code: ownerCode(c.owner)
  }));

  function normalizeText(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function levenshtein(a, b) {
  a = normalizeText(a);
  b = normalizeText(b);

  const matrix = Array.from(
    { length: b.length + 1 },
    (_, i) => [i]
  );

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}

function animeEquivalent(a, b) {
  return levenshtein(a, b) <= 2;
}

  // Estado
  const state = {
    q: localStorage.getItem('q') || '',
    owner: JSON.parse(localStorage.getItem('owner') || '["L","S","Y","O","U"]'), // U = unassigned
    anime: localStorage.getItem('anime') || '',
    sort: localStorage.getItem('sort') || 'name'
  };

  // Chips de dueño
  const ownerChips = [
    { code:'L', label:'L (Lexy)'},
    { code:'S', label:'S (Sans)'},
    { code:'Y', label:'Y (Yisuss)'},
    { code:'O', label:'Otros'},
    { code:'U', label:'Sin asignar'}
  ];

  function renderOwnerChips(){
    const wrap = $('#ownerChips');
    wrap.innerHTML = '';
    ownerChips.forEach(ch=>{
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.code = ch.code;
      const on = state.owner.includes(ch.code);
      b.dataset.active = on ? 'true':'false';
      b.textContent = ch.label;
      b.addEventListener('click', ()=>{
        const i = state.owner.indexOf(ch.code);
        if(i>=0) state.owner.splice(i,1); else state.owner.push(ch.code);
        localStorage.setItem('owner', JSON.stringify(state.owner));
        renderOwnerChips();
        render();
      });
      wrap.appendChild(b);
    });
  }

  // Select de anime
  function populateAnimeSelect() {
  const animeGroups = [];

  data.forEach(d => {
    if (!d.anime) return;

    let found = animeGroups.find(group =>
      animeEquivalent(group.name, d.anime)
    );

    if (!found) {
      animeGroups.push({
        name: d.anime
      });
    }
  });

  const animes = animeGroups
    .map(g => g.name)
    .sort((a, b) => a.localeCompare(b));

  const sel = $('#animeSel');
  const prev = state.anime;

  sel.innerHTML =
    '<option value="">Anime: todos</option>' +
    animes
      .map(a =>
        `<option${a === prev ? ' selected' : ''}>${a}</option>`
      )
      .join('');
}

  // Filtro + Orden
  function getFiltered(){
    const q = state.q.toLowerCase();
    return data.filter(d => {
      const okOwner = (()=>{
        const code = d.owner ? ownerCode(d.owner) : 'U';
        return state.owner.includes(code);
      })();
      const okAnime =
      !state.anime ||
      animeEquivalent(d.anime, state.anime);
      const okQ = !q || [d.name, d.anime, d.owner || ''].some(v => (v||'').toLowerCase().includes(q));
      return okOwner && okAnime && okQ;
    }).sort((a,b)=>{
      switch(state.sort){
        case 'name': return a.name.localeCompare(b.name);
        case 'anime': return a.anime.localeCompare(b.anime) || a.name.localeCompare(b.name);
        case 'owner': return (a.owner||'').localeCompare(b.owner||'') || a.name.localeCompare(b.name);
        case 'random': return Math.random() - .5;
        default: return 0;
      }
    });
  }

  // Render listado
  function renderList(list){
    const grid = $('#grid');
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    list.forEach(d=>{
      const card = document.createElement('article');
      card.className = 'card';
      const av = document.createElement('div');
      av.className = 'avatar';
      av.textContent = (d.name[0] || '?').toUpperCase();
      const meta = document.createElement('div');
      meta.className = 'meta';
      const name = document.createElement('div'); name.className='name'; name.textContent=d.name;
      const sub = document.createElement('div'); sub.className='sub'; sub.textContent = d.anime || '—';
      const badge = document.createElement('span'); badge.className='owner-badge';
      const code = d.owner ? ownerCode(d.owner) : 'U';
      badge.textContent = ({'L':'L','S':'S','Y':'Y','O':'Otros','U':'Sin dueño'})[code];
      meta.appendChild(name); meta.appendChild(sub);
      card.appendChild(av); card.appendChild(meta); card.appendChild(badge);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  // Stats + Chart
  let chart;
  function renderStats(list){
    $('#totalCnt').textContent = list.length;
    const uniqAnime = new Set(list.map(d=>d.anime).filter(Boolean));
    $('#uniqueAnime').textContent = uniqAnime.size;
    const counts = {L:0,S:0,Y:0,O:0,U:0};
    list.forEach(d=>{ const c = d.owner ? ownerCode(d.owner) : 'U'; counts[c]++; });
    $('#ownerBreak').textContent = `${counts.L} / ${counts.S} / ${counts.Y}`;

    const labels = ['L','S','Y','Otros','Sin dueño'];
    const values = [counts.L, counts.S, counts.Y, counts.O, counts.U];
    const ctx = document.getElementById('ownerChart').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type:'bar',
      data:{ labels, datasets:[{ label:'Personajes', data: values }] },
      options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
    });
  }

  // Export CSV
  function exportCSV(list){
    const rows = [['Nombre','Anime','Dueño','Código']].concat(list.map(d=>[d.name,d.anime,d.owner||'', ownerCode(d.owner)]));
    const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'personajes_filtrado.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  // Event wiring
  $('#q').value = state.q;
  $('#q').addEventListener('input', e=>{ state.q = e.target.value; localStorage.setItem('q', state.q); render(); });
  $('#animeSel').addEventListener('change', e=>{ state.anime = e.target.value; localStorage.setItem('anime', state.anime); render(); });
  $('#sortSel').value = state.sort;
  $('#sortSel').addEventListener('change', e=>{ state.sort = e.target.value; localStorage.setItem('sort', state.sort); render(); });
  $('#resetBtn').addEventListener('click', ()=>{ localStorage.clear(); state.q=''; state.owner=['L','S','Y','O','U']; state.anime=''; state.sort='name'; $('#q').value=''; populateAnimeSelect(); renderOwnerChips(); render(); });
  $('#exportCsv').addEventListener('click', ()=> exportCSV(getFiltered()));
  document.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); $('#q').focus(); } });

  // Modal ACT
  const backdrop = $('#backdrop');
  const openModal = ()=>{ backdrop.style.display='flex'; };
  const closeModal = ()=>{ backdrop.style.display='none'; };
  $('#actBtn').addEventListener('click', openModal);
  $('#closeModal').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) closeModal(); });

  // Boot
  function render(){
    const list = getFiltered();
    renderList(list);
    renderStats(list);
  }
  renderOwnerChips();
  populateAnimeSelect();
  render();
