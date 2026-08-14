const MAP_URL = '../Pokemon/mapa etruria.html';
const TRAINER_STORAGE_KEY = 'evolink-active-trainer-v1';
const POKEMON_ART_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const trainers = Array.isArray(window.ETRURIA_TRAINERS) ? window.ETRURIA_TRAINERS : [];

const fallbackTrainer = {
  id: 'evolink-guest',
  name: 'Entrenador invitado',
  title: 'Usuario de Evolink',
  region: 'Etruria',
  style: 'Por registrar',
  status: 'Activo',
  location: 'Villa Arcanum',
  goal: 'Comenzar una nueva aventura',
  colors: ['#3aa6ff', '#102842'],
  summary: 'La Red Regional todavía no ha recibido su expediente.',
  team: [],
  reserves: [],
  badges: [],
  achievements: [],
};

const savedTrainerId = localStorage.getItem(TRAINER_STORAGE_KEY);
const initialTrainer = trainers.find(trainer => trainer.id === savedTrainerId) || trainers[0] || fallbackTrainer;

const state = {
  activeView: 'home',
  selectedMessage: 0,
  selectedContact: null,
  selectedTrainerId: initialTrainer.id,
  trainer: initialTrainer,
};

function messagesForTrainer() {
  const trainer = state.trainer;
  const badgeCount = (trainer.badges || []).length;
  const firstName = String(trainer.name || 'Entrenador').split(' ')[0];
  return [
    {
      from: 'Profesora Romaine',
      title: 'Evolink sincronizado',
      time: 'Ahora',
      body: `Hola, ${firstName}. Tu expediente ya está enlazado con la Red Regional de Etruria. Desde aquí podrás consultar tu equipo, tus medallas y los avisos importantes del viaje.`,
    },
    {
      from: 'Infinity Y Institute',
      title: badgeCount >= 2 ? 'Invitación disponible' : 'Expediente en observación',
      time: 'Hace 12 min',
      body: badgeCount >= 2
        ? `Hemos verificado tus ${badgeCount} medallas. Tu progreso cumple los requisitos mínimos para solicitar acceso al instituto.`
        : `Tu expediente está siendo observado. Consigue al menos 2 medallas para poder solicitar acceso al instituto. Progreso actual: ${badgeCount}/2.`,
      action: 'infinity',
    },
    {
      from: 'Sistema',
      title: 'Mapa regional conectado',
      time: 'Hoy',
      body: `Ubicación registrada: ${trainer.location || 'sin determinar'}. El módulo de mapa está enlazado con el archivo regional de Etruria.`,
    },
  ];
}

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

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function titleCase(value = '') {
  return String(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\p{L}/gu, letter => letter.toUpperCase());
}

function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase() || 'ET';
}

function safeColor(value, fallback) {
  return /^#[0-9a-f]{3,8}$/i.test(String(value || '')) ? value : fallback;
}

function trainerColors(trainer) {
  return [
    safeColor(trainer?.colors?.[0], '#3aa6ff'),
    safeColor(trainer?.colors?.[1], '#102842'),
  ];
}

function trainerGlyph(trainer) {
  const [primary, secondary] = trainerColors(trainer);
  if (trainer?.portrait) {
    return `<div class="trainer-glyph" style="--avatar-a:${primary};--avatar-b:${secondary}"><img src="${escapeHtml(trainer.portrait)}" alt="Retrato de ${escapeHtml(trainer.name)}"></div>`;
  }
  return `<div class="trainer-glyph" style="--avatar-a:${primary};--avatar-b:${secondary}"><span>${escapeHtml(initials(trainer?.name))}</span></div>`;
}

function pokemonImage(pokemon = {}) {
  if (pokemon.image) {
    const source = String(pokemon.image);
    if (/^(?:https?:|data:|\/)/i.test(source)) return source;
    return `../Pokemon/${source.replace(/^\.\//, '')}`;
  }
  const id = pokemon.spriteId || pokemon.formId || pokemon.apiId || pokemon.id;
  return id ? `${POKEMON_ART_URL}/${id}.png` : '';
}

function pokemonRoster(team = []) {
  if (!team.length) return '<p class="profile-note">Todavía no hay Pokémon registrados en este equipo.</p>';
  return `<div class="team-roster">${team.map(pokemon => {
    const image = pokemonImage(pokemon);
    return `<div class="team-member">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" onerror="this.hidden=true">` : ''}<span>${escapeHtml(titleCase(pokemon.name || 'Pokémon'))}</span></div>`;
  }).join('')}</div>`;
}

const views = [...document.querySelectorAll('.view')];
const navButtons = [...document.querySelectorAll('[data-view]')];
const viewTitle = document.getElementById('viewTitle');
const titles = { home: 'Inicio', messages: 'Mensajes', calls: 'Llamadas', profile: 'Perfil', research: 'Investigación', infinity: 'Infinity Y', mapload: 'Mapa regional' };

function boot() {
  setTimeout(() => {
    document.getElementById('bootScreen').classList.add('done');
    openIdentityPicker();
  }, 2600);
}

function tickClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function openIdentityPicker() {
  const screen = document.getElementById('identityScreen');
  const search = document.getElementById('trainerSearch');
  state.selectedTrainerId = state.trainer?.id || savedTrainerId || trainers[0]?.id || '';
  search.value = '';
  screen.hidden = false;
  screen.scrollTop = 0;
  screen.scrollLeft = 0;
  renderTrainerPicker();
  window.setTimeout(() => search.focus(), 80);
}

function renderTrainerPicker(query = '') {
  const grid = document.getElementById('trainerPickerGrid');
  const normalizedQuery = String(query).trim().toLocaleLowerCase('es');
  const filtered = trainers.filter(trainer => [
    trainer.name,
    trainer.title,
    trainer.region,
    trainer.style,
    (trainer.team || []).map(pokemon => pokemon.name).join(' '),
  ].join(' ').toLocaleLowerCase('es').includes(normalizedQuery));

  if (!filtered.length) {
    grid.innerHTML = `<div class="identity-empty">${trainers.length ? 'No hay entrenadores que coincidan con la búsqueda.' : 'No se han encontrado entrenadores en el registro de Etruria.'}</div>`;
  } else {
    grid.innerHTML = filtered.map(trainer => {
      const selected = trainer.id === state.selectedTrainerId;
      const team = (trainer.team || []).slice(0, 6);
      return `
        <button class="trainer-choice${selected ? ' selected' : ''}" type="button" data-trainer-id="${escapeHtml(trainer.id)}" aria-pressed="${selected}">
          ${trainerGlyph(trainer)}
          <span class="trainer-choice-copy">
            <strong>${escapeHtml(trainer.name)}</strong>
            <small>${escapeHtml(trainer.title || trainer.style || 'Entrenador')}</small>
            <em>${escapeHtml(trainer.region || 'Etruria')} · ${(trainer.badges || []).length} medallas</em>
          </span>
          <span class="trainer-mon-preview">${team.map(pokemon => {
            const image = pokemonImage(pokemon);
            return image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(titleCase(pokemon.name))}" loading="lazy" onerror="this.hidden=true">` : '';
          }).join('')}</span>
        </button>`;
    }).join('');
  }

  updateTrainerSelectionText();
}

function updateTrainerSelectionText() {
  const trainer = trainers.find(entry => entry.id === state.selectedTrainerId);
  const label = document.getElementById('selectedTrainerText');
  const confirm = document.getElementById('confirmTrainer');
  confirm.disabled = !trainer;
  label.innerHTML = trainer
    ? `Seleccionado: <strong>${escapeHtml(trainer.name)}</strong>`
    : 'Elige un entrenador para continuar.';
}

function confirmTrainerSelection() {
  const trainer = trainers.find(entry => entry.id === state.selectedTrainerId);
  if (!trainer) return;
  state.trainer = trainer;
  state.selectedMessage = 0;
  state.selectedContact = null;
  localStorage.setItem(TRAINER_STORAGE_KEY, trainer.id);
  document.getElementById('identityScreen').hidden = true;
  applyTrainerTheme();
  renderAll();
  openView('home');
  toast(`Evolink sincronizado con ${trainer.name}.`);
}

function applyTrainerTheme() {
  const [primary, secondary] = trainerColors(state.trainer);
  const device = document.getElementById('device');
  device.style.setProperty('--trainer-a', primary);
  device.style.setProperty('--trainer-b', secondary);
  document.title = `Evolink · ${state.trainer.name}`;
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
  const badgeCount = (t.badges || []).length;
  const eligible = badgeCount >= 2;
  document.getElementById('trainerAvatar').innerHTML = trainerGlyph(t);
  document.getElementById('trainerName').textContent = t.name;
  document.getElementById('trainerStatus').textContent = `${badgeCount} medalla${badgeCount === 1 ? '' : 's'} · ${t.status || 'Estado por registrar'}`;
  document.querySelector('.map-info p').textContent = `${t.location || 'Ubicación por registrar'}. Pulsa para abrir el mapa completo.`;
  document.getElementById('infinityHomeTitle').textContent = eligible ? 'Invitación disponible' : 'Acceso en observación';
  document.getElementById('infinityHomeCopy').textContent = eligible
    ? `${badgeCount} medallas verificadas. Puedes solicitar acceso.`
    : `Necesitas 2 medallas. Progreso actual: ${badgeCount}/2.`;
  document.getElementById('messageCount').textContent = `${messagesForTrainer().length} avisos`;
  document.getElementById('notifyButton').textContent = `${messagesForTrainer().length} avisos`;
}

function renderMessages() {
  const list = document.getElementById('messageList');
  const detail = document.getElementById('messageDetail');
  const messages = messagesForTrainer();
  if (state.selectedMessage >= messages.length) state.selectedMessage = 0;
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
  const badges = t.badges || [];
  const reserves = t.reserves || [];
  document.getElementById('profileCard').innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar" aria-hidden="true">${trainerGlyph(t)}</div>
      <div>
        <span class="kicker">${escapeHtml(String(t.id || 'ETR').toUpperCase())}</span>
        <h3>${escapeHtml(t.name)}</h3>
        <p>${escapeHtml(t.title || t.style || 'Entrenador de Etruria')}</p>
        <button class="ghost-action" type="button" data-action="change-trainer">Cambiar entrenador</button>
      </div>
    </div>
    <div class="profile-data">
      <div><span>Estado</span><strong>${escapeHtml(t.status || 'Por registrar')}</strong></div>
      <div><span>Ubicación</span><strong>${escapeHtml(t.location || 'Por registrar')}</strong></div>
      <div><span>Medallas</span><strong>${badges.length}</strong></div>
      <div><span>Región</span><strong>${escapeHtml(t.region || 'Etruria')}</strong></div>
    </div>
    <h4>Equipo actual</h4>
    ${pokemonRoster(t.team || [])}
    ${reserves.length ? `<h4>Pokémon en reserva</h4>${pokemonRoster(reserves)}` : ''}
    <h4>Objetivo</h4>
    <p class="profile-note">${escapeHtml(t.goal || t.summary || 'Objetivo todavía por registrar.')}</p>
    ${badges.length ? `<h4>Medallas verificadas</h4><div class="chip-row">${badges.map(badge => `<span>${escapeHtml(badge.name || 'Medalla')}</span>`).join('')}</div>` : ''}
  `;
}

function renderInfinity() {
  const trainer = state.trainer;
  const badgeCount = (trainer.badges || []).length;
  const eligible = badgeCount >= 2;
  const panel = document.getElementById('infinityPanel');
  panel.innerHTML = `
    <span class="redacted">████████████████</span>
    <span class="y-mark large">Y</span>
    <h3>INFINITY Y INSTITUTE</h3>
    <p>${eligible
      ? `${escapeHtml(trainer.name)} es compatible. Nivel de autorización provisional: III.`
      : `El expediente de ${escapeHtml(trainer.name)} todavía no alcanza el nivel de autorización requerido.`}</p>
    <div class="access-box">
      <span>Estado</span><strong>${eligible ? 'Invitación disponible' : 'Expediente en observación'}</strong>
      <span>Progreso</span><strong>${badgeCount}/2 medallas</strong>
    </div>
    <button class="primary-action" id="requestAccess" type="button" ${eligible ? '' : 'disabled'}>${eligible ? 'Solicitar acceso' : 'Acceso bloqueado'}</button>
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
    const trainerChoice = event.target.closest('[data-trainer-id]');
    if (trainerChoice) {
      state.selectedTrainerId = trainerChoice.dataset.trainerId;
      renderTrainerPicker(document.getElementById('trainerSearch').value);
      return;
    }

    if (event.target.closest('[data-action="change-trainer"]')) {
      openIdentityPicker();
      return;
    }

    if (event.target.closest('#requestAccess')) {
      const badgeCount = (state.trainer.badges || []).length;
      if (badgeCount >= 2) toast(`Solicitud de ${state.trainer.name} enviada al Infinity Y Institute.`);
      return;
    }

    const button = event.target.closest('[data-view]');
    if (button) openView(button.dataset.view);
  });

  document.getElementById('openMap').onclick = () => openView('mapload');
  document.getElementById('infinityShortcut').onclick = () => openView('infinity');
  document.getElementById('notifyButton').onclick = () => openView('messages');
  document.getElementById('changeTrainer').onclick = openIdentityPicker;
  document.querySelector('.trainer-summary').onclick = () => openView('profile');
  document.getElementById('trainerSearch').oninput = event => renderTrainerPicker(event.target.value);
  document.getElementById('confirmTrainer').onclick = confirmTrainerSelection;
}

function renderAll() {
  renderHome();
  renderMessages();
  renderCalls();
  renderProfile();
  renderResearch();
  renderInfinity();
}

setInterval(tickClock, 1000);
tickClock();
applyTrainerTheme();
renderAll();
bindEvents();
boot();
