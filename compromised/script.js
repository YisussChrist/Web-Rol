const MAP_URL = '../Pokemon/mapa etruria.html';

const trainers = [
  { id:'ETR-024', name:'Link', avatar:'https://api.dicebear.com/8.x/adventurer/svg?seed=Link', status:'2 medallas · En ruta', location:'Ruta posterior a la segunda medalla', rank:'Alumno de Romaine', medals:['Medalla 1','Medalla 2'], team:['Sprigatito','Riolu','Rookidee','Shinx'], notes:'Perfil sincronizado por la Profesora Romaine. Evolink recibido correctamente.' },
  { id:'ETR-011', name:'Ayla', avatar:'https://api.dicebear.com/8.x/adventurer/svg?seed=Ayla', status:'2 medallas · Investigación activa', location:'Ciudad académica', rank:'Entrenadora registrada', medals:['Medalla 1','Medalla 2'], team:['Fennekin','Ralts','Eevee'], notes:'Muestra interés en fenómenos cristalinos. Pendiente de revisión de datos.' },
  { id:'ETR-037', name:'Noah', avatar:'https://api.dicebear.com/8.x/adventurer/svg?seed=Noah', status:'1 medalla · Reconocimiento', location:'Centro Pokémon cercano', rank:'Alumno en prácticas', medals:['Medalla 1'], team:['Timburr','Purrloin','Pidove'], notes:'Recomendación: actualizar equipo antes de la siguiente ruta.' }
];

const contacts = [
{
  name:'Profesora Romaine',
  role:'Profesora Pokémon',
  icon:'🧪',
  msg:''
},  { name:'Alaric Morrow', role:'Director del Infinity Y Institute', icon:'⭐', msg:'He oído hablar de tus avances. Cuando tengas ocasión, me gustaría mostrarte el instituto. Creo que tu viaje puede aportar datos muy valiosos.' },
  { name:'Oriana Rova', role:'Departamento Mega', icon:'🧬', msg:'Si observas cambios físicos anómalos en tus Pokémon durante una transformación, registra la duración exacta. Cada segundo importa.' },
  { name:'Dante Koval', role:'Pruebas de Campo', icon:'🦁', msg:'Los datos de laboratorio sirven de poco si no sobreviven a la realidad. Sigue combatiendo. Ahí se ve lo que vale cada teoría.' },
  { name:'Lyra Thorne', role:'Fenómenos Cristalinos', icon:'💎', msg:'Si encuentras cristales con patrones de luz irregulares, no los toques directamente. Obsérvalos primero. A veces mirar ya es suficiente.' },
  { name:'Kiran Zula', role:'Fenómenos Dimensionales', icon:'🌌', msg:'Tu ruta presenta pequeñas irregularidades energéticas. Nada preocupante. Por ahora.' }
];

const messages = [
  { from:'Romaine', title:'Evolink activado', text:'He enviado el dispositivo a todos mis alumnos. Usa el perfil para identificarte y mantener tu progreso al día.', time:'Ahora' },
  { from:'Sistema', title:'Nuevo módulo disponible', text:'El módulo Mapa redirige al archivo regional de Etruria.', time:'Hace 3 min' },
{
  from:'Infinity Y Institute',
  title:'Invitación pendiente',
  text:'El instituto abre sus puertas a entrenadores con dos medallas o más.',
  time:'Hace 12 min',
  action:'invite'
},  { from:'Centro Pokémon', title:'Consejo de viaje', text:'Recuerda revisar tu equipo antes de avanzar hacia rutas de mayor dificultad.', time:'Hoy' }
];

const research = [
  { title:'Megaenergía', state:'Público', text:'Estudio sobre cambios temporales de alto impacto en Pokémon compatibles.' },
  { title:'Movimientos Z', state:'Público', text:'Informe sobre sincronización emocional y liberación concentrada de energía.' },
  { title:'Gigamax', state:'Público', text:'Registro comparativo de expansión energética y modificación de escala.' },
  { title:'Teracristalización', state:'Público', text:'Análisis inicial de estructuras cristalinas y variaciones de tipo.' },
  { title:'Proyecto 05', state:'Bloqueado', text:'Autorización insuficiente.' },
  { title:'Proyecto Horizonte', state:'Clasificado', text:'Acceso denegado.' }
];

let activeTrainer = JSON.parse(localStorage.getItem('evolinkTrainer') || '0');
const screens = [...document.querySelectorAll('.screen')];
const title = document.getElementById('screenTitle');
const backBtn = document.getElementById('backBtn');
const toastPanel = document.getElementById('toastPanel');

function boot(){
  setTimeout(()=>{
    document.getElementById('bootScreen').classList.add('done');
    showToast('Bienvenido, Entrenador.');
  }, 2900);
}
function clock(){
  const d = new Date();
  document.getElementById('clock').textContent = d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
}
setInterval(clock,1000); clock();

function openScreen(name){
  screens.forEach(s=>s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
  const names = {home:'Menú principal',profile:'Mi perfil',calls:'Llamadas',messages:'Mensajes',research:'Investigación',settings:'Ajustes',mapload:'Mapa regional'};
  title.textContent = names[name] || 'Evolink';
  backBtn.classList.toggle('hidden', name==='home');
}

function showToast(text){
  const el = document.createElement('div');
  el.className='toast'; el.textContent=text;
  toastPanel.appendChild(el);
  setTimeout(()=>el.remove(), 3600);
}

function renderHome(){
  const t = trainers[activeTrainer];
  document.getElementById('homeAvatar').src = t.avatar;
  document.getElementById('homeName').textContent = t.name;
  document.getElementById('homeStatus').textContent = t.status;
}

function renderProfiles(){
  const list = document.getElementById('profileSelector');
  list.innerHTML = '';
  trainers.forEach((t,i)=>{
    const btn = document.createElement('button');
    btn.className = `select-row ${i===activeTrainer?'active':''}`;
    btn.innerHTML = `<strong>${t.name}</strong><br><small>${t.id} · ${t.status}</small>`;
    btn.onclick=()=>{ activeTrainer=i; localStorage.setItem('evolinkTrainer', i); renderAll(); showToast(`Perfil activo: ${t.name}`); };
    list.appendChild(btn);
  });
  const t = trainers[activeTrainer];
  document.getElementById('trainerProfile').innerHTML = `
    <div class="profile-header">
      <img class="profile-avatar" src="${t.avatar}" alt="${t.name}">
      <div><span class="eyebrow">Entrenador registrado</span><h2>${t.name}</h2><p>${t.rank}</p></div>
    </div>
    <div class="stat-grid">
      <div class="stat"><span>ID</span><b>${t.id}</b></div>
      <div class="stat"><span>Ubicación</span><b>${t.location}</b></div>
      <div class="stat"><span>Estado</span><b>${t.status}</b></div>
      <div class="stat"><span>Red</span><b>Conectado</b></div>
    </div>
    <h3>Medallas</h3><div class="badge-row">${t.medals.map(m=>`<span class="chip medal">${m}</span>`).join('') || '<span class="chip">Sin medallas</span>'}</div>
    <h3>Equipo actual</h3><div class="pokemon-row">${t.team.map(p=>`<span class="chip">${p}</span>`).join('')}</div>
    <h3>Notas de Romaine</h3><p>${t.notes}</p>
  `;
}

function renderCalls(){
  const list = document.getElementById('contactList'); list.innerHTML='';
  contacts.forEach((c,i)=>{
    const btn = document.createElement('button'); btn.className='contact-row';
    btn.innerHTML = `<strong>${c.icon} ${c.name}</strong><br><small>${c.role}</small>`;
    btn.onclick=()=>startCall(i);
    list.appendChild(btn);
  });
}
function startCall(i){
  document.querySelectorAll('.contact-row').forEach((e,idx)=>e.classList.toggle('active', idx===i));
  const c = contacts[i]; const box = document.getElementById('callDisplay');
  box.classList.add('calling');
  box.innerHTML = box.innerHTML = `
  <div class="call-avatar">${c.icon}</div>
  <h3>${c.name}</h3>
  <p><b>${c.role}</b></p>
  <div class="call-status">Llamada conectada</div>
  <button class="hang-btn" onclick="endCall()">Colgar</button>
`;;
  setTimeout(()=>{
    box.classList.remove('calling');
    box.innerHTML = `<div class="call-avatar">${c.icon}</div><h3>${c.name}</h3><p><b>${c.role}</b></p><p>“${c.msg}”</p><button class="ghost-btn" onclick="endCall()">Finalizar llamada</button>`;
  }, 950);
}

function autoCallRomaine(){
  const romaineIndex = contacts.findIndex(c => c.name.includes('Romaine'));

  if (romaineIndex === -1) return;

  setTimeout(() => {
    startCall(romaineIndex);
  }, 450);
}

window.endCall = function(){
  document.getElementById('callDisplay').innerHTML = `<div class="call-avatar">📞</div><h3>Llamada finalizada</h3><p>Registro guardado en el Evolink.</p>`;
  document.querySelectorAll('.contact-row').forEach(e=>e.classList.remove('active'));
}

function renderMessages(){
  const list = document.getElementById('messageList');
  list.innerHTML = '';

  messages.forEach(m => {
    const card = document.createElement('article');
    card.className = `message-card ${m.action ? 'clickable' : ''}`;

    card.innerHTML = `
      <small>${m.time} · ${m.from}</small>
      <strong>${m.title}</strong>
      <p>${m.text}</p>
      ${m.action ? '<span class="message-hint">Abrir →</span>' : ''}
    `;

    if (m.action === 'invite') {
      card.onclick = () => openScreen('invite');
    }

    list.appendChild(card);
  });
}
function renderResearch(){
  const grid = document.getElementById('researchGrid'); grid.innerHTML='';
  research.forEach(r=>{
    const card = document.createElement('article'); card.className='research-card';
    card.innerHTML = `<small>${r.state}</small><strong>${r.state==='Público'?'📄':'🔒'} ${r.title}</strong><p>${r.text}</p>`;
    grid.appendChild(card);
  });
}
function renderAll(){ renderHome(); renderProfiles(); renderCalls(); renderMessages(); renderResearch(); }

function goMap(){
  openScreen('mapload');
  const phrases = ['Estableciendo enlace con Etruria...', 'Cargando rutas y ciudades...', 'Sincronizando señal regional...', 'Abriendo mapa...'];
  let i=0;
  const p = document.getElementById('mapLoadText');
  const interval = setInterval(()=>{ i++; if(i<phrases.length) p.textContent=phrases[i]; }, 550);
  const timeout = setTimeout(()=>{ window.location.href = MAP_URL; }, 2400);
  document.getElementById('cancelMap').onclick = ()=>{ clearTimeout(timeout); clearInterval(interval); openScreen('home'); };
}

function applySettings(){
  document.body.className = '';
  const theme = localStorage.getItem('evolinkTheme') || 'default';
  if(theme !== 'default') document.body.classList.add(`theme-${theme}`);
  const font = localStorage.getItem('evolinkFont') || 'normal';
  if(font === 'large') document.body.classList.add('large-text');
  if(font === 'compact') document.body.classList.add('compact-text');
  if(localStorage.getItem('evolinkMotion') === '1') document.body.classList.add('reduce-motion');
  if(localStorage.getItem('evolinkSimple') === '1') document.body.classList.add('simple-mode');
  document.documentElement.style.setProperty('--brightness', (localStorage.getItem('evolinkBrightness') || 100) / 100);
  document.getElementById('themeSelect').value = theme;
  document.getElementById('fontSelect').value = font;
  document.getElementById('brightnessRange').value = localStorage.getItem('evolinkBrightness') || 100;
  document.getElementById('motionToggle').checked = localStorage.getItem('evolinkMotion') === '1';
  document.getElementById('simpleToggle').checked = localStorage.getItem('evolinkSimple') === '1';
}

document.querySelectorAll('[data-open]').forEach(b => {
  b.onclick = () => {
    if (b.dataset.open === 'calls') {
      openScreen('calls');
      autoCallRomaine();
      return;
    }

    openScreen(b.dataset.open);
  };
});document.querySelectorAll('[data-action="map"]').forEach(b=>b.onclick=goMap);
backBtn.onclick=()=>openScreen('home');
document.getElementById('notifyBtn').onclick=()=>showToast('3 notificaciones pendientes. Revisa Mensajes.');
document.getElementById('themeSelect').onchange=e=>{ localStorage.setItem('evolinkTheme', e.target.value); applySettings(); };
document.getElementById('fontSelect').onchange=e=>{ localStorage.setItem('evolinkFont', e.target.value); applySettings(); };
document.getElementById('brightnessRange').oninput=e=>{ localStorage.setItem('evolinkBrightness', e.target.value); applySettings(); };
document.getElementById('motionToggle').onchange=e=>{ localStorage.setItem('evolinkMotion', e.target.checked?'1':'0'); applySettings(); };
document.getElementById('simpleToggle').onchange=e=>{ localStorage.setItem('evolinkSimple', e.target.checked?'1':'0'); applySettings(); };
document.getElementById('resetBtn').onclick=()=>{ localStorage.clear(); activeTrainer=0; applySettings(); renderAll(); showToast('Evolink reiniciado.'); };

renderAll(); applySettings(); boot();
