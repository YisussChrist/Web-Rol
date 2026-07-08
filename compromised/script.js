const MAP_URL = '../Pokemon/mapa etruria.html';

const state = {
  activeView: 'home',
  selectedMessage: 0,
  selectedContact: null,
  trainer: {
    id: 'ETR-024',
    name: 'Link',
    avatar: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Link',
    rank: 'Alumno de Romaine',
    status: '2 medallas · En ruta',
    location: 'Ruta posterior a la segunda medalla',
    medals: ['Medalla 1', 'Medalla 2'],
    team: ['Sprigatito', 'Riolu', 'Rookidee', 'Shinx'],
    note: 'Evolink recibido correctamente. Perfil sincronizado con la Red Regional de Etruria.'
  }
};

const messages = [
  {
    from: 'Profesora Romaine',
    title: 'Evolink activado',
    time: 'Ahora',
    body: 'He enviado el dispositivo a todos mis alumnos. Desde aquí podrás consultar el mapa, mantener tu ficha actualizada y recibir avisos importantes durante tu viaje.'
  },
  {
    from: 'Infinity Y Institute',
    title: 'Invitación pendiente',
    time: 'Hace 12 min',
    body: 'El instituto abre sus puertas a entrenadores con dos medallas o más. Tu progreso actual cumple los requisitos mínimos para solicitar acceso.',
    action: 'infinity'
  },
  {
    from: 'Sistema',
    title: 'Mapa regional conectado',
    time: 'Hoy',
    body: 'El módulo de mapa está enlazado con el archivo regional de Etruria. Pulsa la tarjeta principal del inicio para abrirlo.'
  }
];

const contacts = [
  { name: 'Profesora Romaine', role: 'Profesora Pokémon', icon: '🧪', line: 'Me alegra verte usando el Evolink. No olvides registrar cualquier fenómeno extraño que encuentres en ruta.' },
  { name: 'Alaric Morrow', role: 'Director del Infinity Y Institute', icon: 'Y', line: 'Tu viaje está generando datos interesantes. Cuando estés listo, el instituto puede mostrarte un horizonte más amplio.' },
  { name: 'Oriana Rova', role: 'Departamento Mega', icon: '🧬', line: 'Si observas cambios físicos durante una transformación, registra la duración exacta. Cada segundo importa.' },
  { name: 'Dante Koval', role: 'Pruebas de Campo', icon: '🦁', line: 'Los datos de laboratorio solo valen si sobreviven a la realidad. Sigue combatiendo.' },
  { name: 'Lyra Thorne', role: 'Fenómenos Cristalinos', icon: '◇', line: 'No todos los cambios se entienden tocándolos. A veces basta con observar.' },
  { name: 'Kiran Zula', role: 'Fenómenos Dimensionales', icon: '◎', line: 'Tu ruta presenta pequeñas irregularidades energéticas. Nada preocupante. Por ahora.' }
];

const research = [
  { title: 'Megaenergía', progress: 92, unlocked: true, text: 'Cambios temporales de alto impacto en Pokémon compatibles.' },
  { title: 'Movimientos Z', progress: 76, unlocked: true, text: 'Sincronización emocional y liberación concentrada de energía.' },
  { title: 'Gigamax', progress: 81, unlocked: true, text: 'Expansión energética y alteración visible de escala.' },
  { title: 'Teracristalización', progress: 68, unlocked: true, text: 'Estructuras cristalinas y variaciones de tipo.' },
  { title: 'Proyecto Horizonte', progress: 12, unlocked: false, text: 'Autorización superior requerida.' },
  { title: 'Proyecto 05', progress: 0, unlocked: false, text: 'Archivo clasificado.' }
];

const views = [...document.querySelectorAll('.view')];
const navButtons = [...document.querySelectorAll('[data-view]')];
const viewTitle = document.getElementById('viewTitle');
const titles = { home: 'Inicio', messages: 'Mensajes', calls: 'Llamadas', profile: 'Perfil', research: 'Investigación', infinity: 'Infinity Y', mapload: 'Mapa regional' };

function boot() {
  setTimeout(() => {
    document.getElementById('bootScreen').classList.add('done');
    toast('Bienvenido al Evolink.');
  }, 2600);
}

function tickClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function openView(name) {
  if (name === 'mapload') return goMap();
  state.activeView = name;
  views.forEach(view => view.classList.toggle('active', view.id === `view-${name}`));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));
  viewTitle.textContent = titles[name] || 'Evolink';
}

function toast(text) {
  const stack = document.getElementById('toastStack');
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = text;
  stack.appendChild(item);
  setTimeout(() => item.remove(), 3200);
}

function renderHome() {
  const t = state.trainer;
  document.getElementById('trainerAvatar').src = t.avatar;
  document.getElementById('trainerName').textContent = t.name;
  document.getElementById('trainerStatus').textContent = t.status;
}

function renderMessages() {
  const list = document.getElementById('messageList');
  const detail = document.getElementById('messageDetail');
  list.innerHTML = messages.map((msg, index) => `
    <button class="list-row ${index === state.selectedMessage ? 'active' : ''}" data-message="${index}">
      <small>${msg.time}</small>
      <strong>${msg.from}</strong>
      <span>${msg.title}</span>
    </button>
  `).join('');

  const msg = messages[state.selectedMessage];
  detail.innerHTML = `
    <span class="kicker">${msg.time}</span>
    <h3>${msg.title}</h3>
    <strong>${msg.from}</strong>
    <p>${msg.body}</p>
    ${msg.action === 'infinity' ? '<button class="primary-action" data-view="infinity">Abrir invitación</button>' : ''}
  `;

  list.querySelectorAll('[data-message]').forEach(button => {
    button.onclick = () => {
      state.selectedMessage = Number(button.dataset.message);
      renderMessages();
    };
  });
}

function renderCalls() {
  const list = document.getElementById('contactList');
  list.innerHTML = contacts.map((contact, index) => `
    <button class="list-row ${index === state.selectedContact ? 'active' : ''}" data-contact="${index}">
      <small>${contact.role}</small>
      <strong>${contact.icon} ${contact.name}</strong>
      <span>Disponible</span>
    </button>
  `).join('');

  list.querySelectorAll('[data-contact]').forEach(button => {
    button.onclick = () => startCall(Number(button.dataset.contact));
  });
}

function startCall(index) {
  state.selectedContact = index;
  renderCalls();
  const contact = contacts[index];
  const panel = document.getElementById('callPanel');
  panel.className = 'call-panel ringing';
  panel.innerHTML = `
    <div class="call-avatar">${contact.icon}</div>
    <span class="kicker">Conectando</span>
    <h3>${contact.name}</h3>
    <p>${contact.role}</p>
    <button class="danger-action" id="hangCall">Colgar</button>
  `;

  document.getElementById('hangCall').onclick = endCall;

  setTimeout(() => {
    if (state.selectedContact !== index) return;
    panel.className = 'call-panel connected';
    panel.innerHTML = `
      <div class="call-avatar">${contact.icon}</div>
      <span class="kicker">Comunicación establecida</span>
      <h3>${contact.name}</h3>
      <p><strong>${contact.role}</strong></p>
      <blockquote>${contact.line}</blockquote>
      <button class="ghost-action" id="endCall">Finalizar llamada</button>
    `;
    document.getElementById('endCall').onclick = endCall;
  }, 900);
}

function endCall() {
  state.selectedContact = null;
  renderCalls();
  const panel = document.getElementById('callPanel');
  panel.className = 'call-panel';
  panel.innerHTML = '<div class="call-idle">Llamada finalizada. Registro guardado en el Evolink.</div>';
}

function renderProfile() {
  const t = state.trainer;
  document.getElementById('profileCard').innerHTML = `
    <div class="profile-hero">
      <img src="${t.avatar}" alt="${t.name}" />
      <div>
        <span class="kicker">${t.id}</span>
        <h3>${t.name}</h3>
        <p>${t.rank}</p>
      </div>
    </div>
    <div class="profile-data">
      <div><span>Estado</span><strong>${t.status}</strong></div>
      <div><span>Ubicación</span><strong>${t.location}</strong></div>
      <div><span>Medallas</span><strong>${t.medals.length}</strong></div>
      <div><span>Red</span><strong>Conectado</strong></div>
    </div>
    <h4>Equipo actual</h4>
    <div class="chip-row">${t.team.map(p => `<span>${p}</span>`).join('')}</div>
    <h4>Nota de Romaine</h4>
    <p>${t.note}</p>
  `;
}

function renderResearch() {
  document.getElementById('researchBoard').innerHTML = research.map(item => `
    <article class="research-node ${item.unlocked ? '' : 'locked'}">
      <div>
        <span class="kicker">${item.unlocked ? 'Público' : 'Bloqueado'}</span>
        <h3>${item.unlocked ? item.title : '████████'}</h3>
        <p>${item.text}</p>
      </div>
      <div class="progress"><span style="width:${item.progress}%"></span></div>
    </article>
  `).join('');
}

function goMap() {
  openRawView('mapload');
  const phrases = ['Estableciendo enlace con Etruria...', 'Cargando rutas principales...', 'Sincronizando señal regional...', 'Abriendo mapa...'];
  const text = document.getElementById('mapLoadText');
  let index = 0;
  const interval = setInterval(() => {
    index += 1;
    if (phrases[index]) text.textContent = phrases[index];
  }, 520);
  setTimeout(() => {
    clearInterval(interval);
    window.location.href = MAP_URL;
  }, 2300);
}

function openRawView(name) {
  state.activeView = name;
  views.forEach(view => view.classList.toggle('active', view.id === `view-${name}`));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));
  viewTitle.textContent = titles[name] || 'Evolink';
}

function bindEvents() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (button) openView(button.dataset.view);
  });

  document.getElementById('openMap').onclick = () => openView('mapload');
  document.getElementById('infinityShortcut').onclick = () => openView('infinity');
  document.getElementById('notifyButton').onclick = () => openView('messages');
  document.getElementById('requestAccess').onclick = () => toast('Solicitud enviada al Infinity Y Institute.');
}

function renderAll() {
  renderHome();
  renderMessages();
  renderCalls();
  renderProfile();
  renderResearch();
}

setInterval(tickClock, 1000);
tickClock();
renderAll();
bindEvents();
boot();
