(() => {
  'use strict';
  const KEY = 'rp-makai-v1';
  const STATUS_REVISION = window.MAKAI_DATA?.statusRevision || '';
  const $ = id => document.getElementById(id);
  const statuses = ['Sin confirmar', 'Vivo', 'Muerto'];
  const affiliations = ['Por confirmar', 'Liga de Villanos', 'Independiente', 'Otra organización'];
  const threats = ['Sin evaluar', 'Bajo', 'Medio', 'Alto', 'Crítico'];
  const fields = ['name', 'realName', 'title', 'image', 'status', 'affiliation', 'threat', 'location', 'gift', 'description', 'activation', 'limits', 'notes', 'source'];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const safeImage = value => {
    if (!value) return '';
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) || (url.protocol === 'file:' && location.protocol === 'file:') ? url.href : '';
    } catch { return ''; }
  };
  function validate(data) {
    if (data?.version !== 1 || !Array.isArray(data.villains) || data.villains.length > 1000) throw new Error('La copia debe ser un archivo de Makai (versión 1), con un máximo de 1000 fichas.');
    const ids = new Set();
    return data.villains.map(item => {
      if (!item || typeof item.id !== 'string' || !/^[a-z0-9-]{1,100}$/.test(item.id) || ids.has(item.id)) throw new Error('Hay identificadores de ficha inválidos o repetidos.');
      ids.add(item.id);
      const clean = { id: item.id };
      fields.forEach(field => {
        if (typeof item[field] !== 'string' || item[field].length > 6000) throw new Error(`El campo «${field}» de una ficha no es válido.`);
        clean[field] = item[field].trim();
      });
      if (!clean.name || !clean.gift || !clean.description || !statuses.includes(clean.status) || !affiliations.includes(clean.affiliation) || !threats.includes(clean.threat)) throw new Error('Una ficha tiene campos obligatorios vacíos o un estado no válido.');
      if (clean.image && !safeImage(clean.image)) throw new Error('La imagen debe ser una ruta local o una dirección HTTP/HTTPS.');
      return clean;
    });
  }
  let villains;
  try { villains = validate(window.MAKAI_DATA); }
  catch (error) { $('notice').textContent = `No se pudo abrir el archivo base: ${error.message}`; return; }
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const saved = JSON.parse(stored);
      const local = validate(saved);
      const merged = new Map(villains.map(item => [item.id, item]));
      const migrate = saved.statusRevision !== STATUS_REVISION;
      local.forEach(item => {
        const base = merged.get(item.id);
        if (migrate && base) {
          item.status = base.status;
          item.source = base.source;
          if (item.id === 'marionette') {
            if (item.image === 'assets/img/makai/marionette.png') item.image = base.image;
            item.notes = item.notes.replace('El desenlace del enfrentamiento y su estado vital actual están pendientes de registrar.', 'Marionette está muerta; las circunstancias no se han especificado.');
          }
        }
        merged.set(item.id, item);
      });
      villains = [...merged.values()];
      if (migrate) {
        try { localStorage.setItem(KEY, JSON.stringify({ version: 1, statusRevision: STATUS_REVISION, villains })); }
        catch { $('notice').textContent = 'Estados actualizados en pantalla. No se pudo guardar la actualización local; descarga una copia.'; }
      }
    }
  } catch { $('notice').textContent = 'No se pudo leer la copia local. Se muestra el archivo base; la copia anterior no se ha sobrescrito.'; }
  let selected = villains.find(item => item.id === 'zoya')?.id || villains[0]?.id;
  let editing = null;
  const badge = status => `<span class="badge ${status === 'Vivo' ? 'alive' : status === 'Muerto' ? 'dead' : ''}">${escape(status)}</span>`;
  const copy = (value, fallback = 'Pendiente de registrar.') => `<p class="copy">${escape(value || fallback)}</p>`;
  function announce(message) { $('notice').textContent = message; }
  function save(next) {
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, statusRevision: STATUS_REVISION, villains: next })); }
    catch { throw new Error('El navegador no permite guardar o no tiene espacio. No se ha cambiado el archivo. Descarga una copia de tus datos actuales.'); }
    villains = next;
  }
  function renderDetail() {
    const item = villains.find(villain => villain.id === selected);
    if (!item) { $('detail').innerHTML = ''; return; }
    const image = safeImage(item.image);
    const index = villains.indexOf(item) + 1;
    $('detail').innerHTML = `
      <div class="detail-top"><span>EXPEDIENTE MK-${String(index).padStart(3, '0')}</span>${badge(item.status)}</div>
      <div class="identity"><div class="identity-copy"><p class="eyebrow">${item.id === 'zoya' ? 'JEFATURA DE LOS VILLANOS' : 'REGISTRO DE VILLANOS'}</p><h3>${escape(item.name)}</h3><p>${escape(item.title || 'Sin título registrado')}</p><p class="real-name">IDENTIDAD / ${escape(item.realName || 'Por confirmar')}</p></div>${image ? `<img class="portrait ${item.image.endsWith('-ficha.png') ? 'poster-portrait' : ''}" src="${escape(image)}" alt="Ficha visual de ${escape(item.name)}">` : '<div class="portrait-placeholder" aria-label="Sin retrato">?</div>'}</div>
      <div class="detail-body"><div class="metadata"><div><small>AFILIACIÓN</small><strong>${escape(item.affiliation)}</strong></div><div><small>AMENAZA</small><strong>${escape(item.threat)}</strong></div><div><small>ÚLTIMA UBICACIÓN</small><strong>${escape(item.location || 'Sin confirmar')}</strong></div></div>
      <section class="ability"><p class="eyebrow">DON / HABILIDAD</p><h4>${escape(item.gift)}</h4>${copy(item.description)}</section>
      <div class="detail-sections"><section><h4 class="section-label">01 — Activación</h4>${copy(item.activation)}</section><section><h4 class="section-label">02 — Límites y debilidades</h4>${copy(item.limits)}</section></div>
      <section><h4 class="section-label">03 — Historia y observaciones</h4>${copy(item.notes)}</section>
      <details><summary>Procedencia y datos pendientes</summary>${copy(item.source)}</details>
      <div class="detail-actions">${image ? `<a class="original-sheet" href="${escape(image)}" target="_blank" rel="noopener">Ver imagen completa ↗</a>` : ''}<button id="edit-selected" type="button">Editar expediente ↗</button></div></div>`;
    $('edit-selected').addEventListener('click', () => openEditor(item));
    $('detail').querySelector('img')?.addEventListener('error', event => {
      const placeholder = document.createElement('div');
      placeholder.className = 'portrait-placeholder'; placeholder.textContent = '?';
      placeholder.setAttribute('aria-label', 'Retrato no disponible');
      event.target.replaceWith(placeholder);
    }, { once: true });
  }
  function render() {
    const query = normalize($('search').value.trim());
    const status = $('status-filter').value;
    const affiliation = $('affiliation-filter').value;
    const filtered = villains.filter(item => (!status || item.status === status) && (!affiliation || item.affiliation === affiliation) && normalize(fields.map(field => item[field]).join(' ')).includes(query));
    if (!filtered.some(item => item.id === selected)) selected = filtered[0]?.id;
    $('results').textContent = `${filtered.length} de ${villains.length} expedientes · Selecciona una ficha para consultar el don`;
    $('empty').hidden = filtered.length !== 0;
    document.querySelector('.dossiers').hidden = filtered.length === 0;
    $('villain-list').innerHTML = filtered.map(item => `<button class="villain-card" type="button" data-id="${escape(item.id)}" aria-pressed="${item.id === selected}" aria-controls="detail"><span class="card-id">MK-${String(villains.indexOf(item) + 1).padStart(3, '0')} / EXPEDIENTE</span><h3>${escape(item.name)}</h3><p>${escape(item.title || 'Sin título registrado')}</p><div class="card-bottom"><span class="gift-label">${escape(item.gift)}</span>${badge(item.status)}</div></button>`).join('');
    renderDetail();
    $('total').textContent = villains.length;
    $('alive').textContent = villains.filter(item => item.status === 'Vivo').length;
    $('dead').textContent = villains.filter(item => item.status === 'Muerto').length;
    $('pending').textContent = villains.filter(item => item.status === 'Sin confirmar').length;
    const members = villains.filter(item => item.affiliation === 'Liga de Villanos').length;
    $('league-summary').textContent = members ? `${members} ${members === 1 ? 'miembro registrado' : 'miembros registrados'} en la Liga.` : 'La lista de miembros está pendiente de confirmar. Puedes asignar la afiliación desde cada expediente.';
  }
  function openEditor(item) {
    editing = item?.id || null;
    $('edit-form').reset();
    fields.forEach(field => { if (item) $('edit-form').elements.namedItem(field).value = item[field]; });
    $('editor-title').textContent = item ? 'Editar expediente' : 'Nuevo villano';
    $('form-error').textContent = '';
    $('editor').showModal();
  }
  $('villain-list').addEventListener('click', event => {
    const button = event.target.closest('[data-id]');
    if (!button) return;
    selected = button.dataset.id;
    // Preserve the focused card while updating the dossier for keyboard users.
    document.querySelectorAll('[data-id]').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.id === selected)));
    renderDetail();
  });
  ['search', 'status-filter', 'affiliation-filter'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
  $('clear-filters').addEventListener('click', () => { $('search').value = ''; $('status-filter').value = ''; $('affiliation-filter').value = ''; render(); $('search').focus(); });
  $('show-league').addEventListener('click', () => { $('search').value = ''; $('status-filter').value = ''; $('affiliation-filter').value = 'Liga de Villanos'; render(); $('affiliation-filter').focus(); $('archivo').scrollIntoView(); });
  $('add').addEventListener('click', () => openEditor());
  $('close-editor').addEventListener('click', () => $('editor').close());
  $('edit-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const item = { id: editing || `villano-${crypto.randomUUID()}` };
      fields.forEach(field => { item[field] = $('edit-form').elements.namedItem(field).value.trim(); });
      const [clean] = validate({ version: 1, villains: [item] });
      const next = editing ? villains.map(previous => previous.id === editing ? clean : previous) : [...villains, clean];
      save(next); selected = clean.id;
      $('search').value = ''; $('status-filter').value = ''; $('affiliation-filter').value = '';
      render(); $('editor').close(); announce('Expediente guardado en este navegador. Puedes descargar una copia desde el mantenimiento del archivo.');
    } catch (error) { $('form-error').textContent = error.message; }
  });
  function download(filename, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const serialized = () => JSON.stringify({ version: 1, statusRevision: STATUS_REVISION, villains }, null, 2);
  $('export').addEventListener('click', () => download('makai-copia.json', serialized() + '\n', 'application/json'));
  $('export-code').addEventListener('click', () => {
    download('makai-datos.js', '/* Archivo de datos de Makai. */\nwindow.MAKAI_DATA = ' + serialized() + ';\n', 'text/javascript');
    announce('Archivo preparado. Sustituye makai-datos.js en la carpeta de la web para conservar y publicar estas fichas.');
  });
  $('import').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('La copia supera el máximo de 5 MB.');
      const imported = validate(JSON.parse(await file.text()));
      const merged = new Map(villains.map(item => [item.id, item]));
      imported.forEach(item => merged.set(item.id, item));
      if (merged.size > 1000) throw new Error('La combinación supera las 1000 fichas.');
      if (!window.confirm(`Importar ${imported.length} fichas. Las que tengan el mismo identificador se actualizarán; el resto se conservará. ¿Continuar?`)) return;
      save([...merged.values()]); render(); announce(`${imported.length} fichas importadas y guardadas en este navegador.`);
    } catch (error) { announce(`No se ha importado la copia: ${error.message}`); }
    finally { event.target.value = ''; }
  });
  render();
})();
