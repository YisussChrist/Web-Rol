(() => {
  'use strict';
  const S = window.LeagueStats;
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
      clean.stats = S.validate(item.stats);
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
  function initStatsEditor() {
    $('stats-fields').innerHTML = S.keys.map((k, i) => `<div class="stat-editor-card" id="stat-card-${k}"><div class="stat-editor-heading"><label for="base-${k}">${S.labels[i]}</label><span id="stat-level-${k}" class="stat-level">Pendiente</span></div><div class="stat-editor-controls"><input id="slider-${k}" data-slider="${k}" type="range" min="1" max="255" step="1" value="1" aria-label="${S.labels[i]}, valor a nivel 50" aria-describedby="stat-level-${k}"><input id="base-${k}" name="base-${k}" type="number" min="1" max="255" step="1" placeholder="—" aria-label="${S.labels[i]}, valor exacto"></div><div class="stat-editor-footer"><span id="stat-final-${k}">Nivel 50: —</span><button type="button" data-clear-stat="${k}" aria-label="Dejar ${S.labels[i]} pendiente">Sin asignar</button></div></div>`).join('');
    $('nature').innerHTML = S.natures.map(n => `<option value="${n.name}">${n.name} · ${n.up ? `+${S.labels[S.keys.indexOf(n.up)]} / −${S.labels[S.keys.indexOf(n.down)]}` : 'Neutra'}</option>`).join('');
    $('stats-fields').addEventListener('input', event => {
      const key = event.target.dataset.slider;
      if (S.keys.includes(key)) $('edit-form').elements.namedItem('base-' + key).value = event.target.value;
      previewStats();
    });
    $('stats-fields').addEventListener('click', event => {
      const key = event.target.closest('[data-clear-stat]')?.dataset.clearStat;
      if (!S.keys.includes(key)) return;
      $('edit-form').elements.namedItem('base-' + key).value = '';
      previewStats();
    });
    $('nature').addEventListener('change', previewStats);
  }
  function readStats() {
    const stats = S.blank();
    S.keys.forEach(k => { const value = $('edit-form').elements.namedItem('base-' + k).value; stats.base[k] = value === '' ? null : Number(value); });
    stats.nature = $('nature').value;
    return S.validate(stats);
  }
  function previewStats() {
    S.keys.forEach(k => {
      const input = $('edit-form').elements.namedItem('base-' + k);
      const value = input.value === '' ? null : Number(input.value);
      const valid = value !== null && Number.isInteger(value) && value >= 1 && value <= 255;
      const tone = statTone(valid ? value : null);
      $('slider-' + k).value = valid ? value : 1;
      $('slider-' + k).setAttribute('aria-valuetext', valid ? `${value}, ${tone.label}` : value === null ? 'Sin asignar' : 'Valor no válido');
      $('stat-card-' + k).setAttribute('style', `--level-color:${tone.color};--level-fill:${valid ? (value - 1) / 254 * 100 : 0}%`);
      $('stat-level-' + k).textContent = value !== null && !valid ? 'Valor no válido' : tone.label;
      $('stat-final-' + k).textContent = 'Nivel 50: —';
    });
    try { const stats = readStats(); const v = S.values(stats); $('editor-bst').innerHTML = bstPanel(stats); S.keys.forEach(k => { $('stat-final-' + k).textContent = `Nivel 50: ${v[k] ?? '—'}`; }); $('stats-preview').textContent = 'A nivel 50: ' + S.keys.map((k, i) => `${S.labels[i]} ${v[k] ?? '—'}`).join(' · '); }
    catch (error) { $('stats-preview').textContent = error.message; $('editor-bst').innerHTML = '<p class="muted">Corrige los valores para calcular el total.</p>'; }
  }
  function statTone(value) {
    if (value === null) return { color: '#afa4a8', label: 'Pendiente' };
    if (value <= 39) return { color: '#f1757f', label: 'Mínimo' };
    if (value <= 79) return { color: '#f2a65a', label: 'Bajo' };
    if (value <= 149) return { color: '#78cf99', label: 'Medio' };
    return { color: '#70b7ff', label: 'Alto' };
  }
  function bstPanel(stats) {
    const assigned = S.keys.filter(k => stats.base[k] !== null);
    const total = assigned.reduce((sum, k) => sum + stats.base[k], 0);
    const complete = assigned.length === S.keys.length;
    return `<div class="bst-panel"><div class="bst-description"><span class="bst-label">TOTAL</span><strong>Total de estadísticas a nivel 50</strong><span class="bst-note">${complete ? 'Suma de los 6 valores · Sin modificadores de combate' : `${assigned.length} de 6 asignadas · ${6 - assigned.length} pendientes`}</span></div><div class="bst-score"><strong>${assigned.length ? total : '—'}</strong><span>${complete ? 'TOTAL NIVEL 50' : assigned.length ? 'SUMA PARCIAL' : 'SIN ASIGNAR'}</span></div></div>`;
  }
  function statsPanel(item) {
    const stats = item.stats, v = S.values(stats), hp = stats.battle.hp ?? v.hp;
    return `<section class="power-panel" aria-label="Estadísticas"><div class="section-heading"><div><p class="eyebrow">PERFIL DE COMBATE / NIVEL 50</p><h4>Estadísticas</h4></div><span class="nature-tag">${escape(stats.nature)}</span></div><p class="muted">Valores finales de nivel 50 · Naturaleza informativa, ya incluida en tus cifras</p>
      ${bstPanel(stats)}
      ${S.keys.map((k, i) => `<div class="stat-row stat-${k}" style="--stat-color:${statTone(stats.base[k]).color}"><span>${S.labels[i]}<small>Nivel 50 ${stats.base[k] ?? '—'} · ${statTone(stats.base[k]).label}</small></span><div class="stat-track"><span style="width:${v[k] === null ? 0 : Math.min(100, v[k] / 255 * 100)}%"></span></div><strong>${v[k] ?? '—'}</strong></div>`).join('')}

      <details class="battle-panel" open><summary>Panel de combate</summary><p class="muted">Los cambios se guardan en este navegador y se incluyen en las descargas.</p>
      <div class="health-heading"><strong>PS <span id="hp-value">${hp ?? '—'} / ${v.hp ?? '—'}</span></strong><span id="hp-state">${hp === 0 ? 'Sin PS' : ''}</span></div><progress id="health-bar" max="${v.hp || 1}" value="${hp ?? 0}" aria-label="PS actuales"></progress>
      <div class="health-controls"><label>Cantidad<input id="hp-amount" type="number" min="1" step="1" max="99999" value="10" ${v.hp === null ? 'disabled' : ''}></label><button type="button" id="damage" ${v.hp === null ? 'disabled' : ''}>− Daño</button><button type="button" id="heal" ${v.hp === null ? 'disabled' : ''}>+ Curar</button><button type="button" id="full-health" ${v.hp === null ? 'disabled' : ''}>Recuperar PS</button></div>
      <div class="stage-heading"><span>Estadística</span><span>Nivel</span><span>Resultado</span></div>
      ${S.keys.slice(1).map(k => `<div class="stage-row"><label for="stage-${k}">${S.labels[S.keys.indexOf(k)]}</label><select id="stage-${k}" data-stage="${k}">${Array.from({ length: 13 }, (_, i) => i - 6).map(n => `<option value="${n}" ${stats.battle.stages[k] === n ? 'selected' : ''}>${n > 0 ? '+' : ''}${n}</option>`).join('')}</select><strong id="result-${k}">${S.modified(v[k], stats.battle.stages[k]) ?? '—'}</strong></div>`).join('')}
      <button type="button" id="reset-stages">Restablecer modificadores</button><p id="battle-notice" role="status" aria-live="polite"></p></details></section>`;
  }
  function bindBattle(item) {
    function update(change) {
      try {
        const current = villains.find(v => v.id === item.id);
        const stats = structuredClone(current.stats);
        change(stats);
        const clean = S.validate(stats);
        save(villains.map(v => v.id === item.id ? { ...v, stats: clean } : v));
        const values = S.values(clean), hp = clean.battle.hp ?? values.hp;
        $('hp-value').textContent = `${hp ?? '—'} / ${values.hp ?? '—'}`;
        $('hp-state').textContent = hp === 0 ? 'Sin PS' : '';
        $('health-bar').value = hp ?? 0;
        S.keys.slice(1).forEach(k => { $('stage-' + k).value = clean.battle.stages[k]; $('result-' + k).textContent = S.modified(values[k], clean.battle.stages[k]) ?? '—'; });
        $('battle-notice').textContent = 'Combate guardado en este navegador.';
      } catch (error) {
        const current = villains.find(v => v.id === item.id);
        S.keys.slice(1).forEach(k => { $('stage-' + k).value = current.stats.battle.stages[k]; });
        $('battle-notice').textContent = error.message;
      }
    }
    $('detail').querySelectorAll('[data-stage]').forEach(el => el.addEventListener('change', () => update(s => { s.battle.stages[el.dataset.stage] = Number(el.value); })));
    function health(sign) {
      const input = $('hp-amount');
      if (!input.value || !input.reportValidity()) return;
      update(s => { const max = S.values(s).hp; if (max === null) return; s.battle.hp = Math.max(0, Math.min(max, (s.battle.hp ?? max) + sign * Number(input.value))); });
    }
    $('damage').addEventListener('click', () => health(-1));
    $('heal').addEventListener('click', () => health(1));
    $('full-health').addEventListener('click', () => update(s => { s.battle.hp = S.values(s).hp; }));
    $('reset-stages').addEventListener('click', () => update(s => { S.keys.slice(1).forEach(k => { s.battle.stages[k] = 0; }); }));
  }
  function renderDetail() {
    const item = villains.find(villain => villain.id === selected);
    if (!item) { $('detail').innerHTML = ''; return; }
    const image = safeImage(item.image);
    const index = villains.indexOf(item) + 1;
    $('detail').innerHTML = `
      <div class="detail-top"><span>EXPEDIENTE MK-${String(index).padStart(3, '0')}</span>${badge(item.status)}</div>
      <div class="identity"><div class="identity-copy"><p class="eyebrow">${item.id === 'zoya' ? 'JEFATURA DE LOS VILLANOS' : 'REGISTRO DE VILLANOS'}</p><h3>${escape(item.name)}</h3><p>${escape(item.title || 'Sin título registrado')}</p><p class="real-name">IDENTIDAD / ${escape(item.realName || 'Por confirmar')}</p></div>${image ? `<img class="portrait ${item.image.endsWith('-ficha.png') ? 'poster-portrait' : ''}" src="${escape(image)}" alt="Ficha visual de ${escape(item.name)}">` : '<div class="portrait-placeholder" aria-label="Sin retrato">?</div>'}</div>
      <div class="detail-body"><button class="primary edit-top" id="edit-top" type="button">Editar ficha y estadísticas ↗</button><div class="metadata"><div><small>AFILIACIÓN</small><strong>${escape(item.affiliation)}</strong></div><div><small>AMENAZA</small><strong>${escape(item.threat)}</strong></div><div><small>ÚLTIMA UBICACIÓN</small><strong>${escape(item.location || 'Sin confirmar')}</strong></div></div>
      ${statsPanel(item)}<section class="ability"><p class="eyebrow">DON / HABILIDAD</p><h4>${escape(item.gift)}</h4>${copy(item.description)}</section>
      <div class="detail-sections"><section><h4 class="section-label">01 — Activación</h4>${copy(item.activation)}</section><section><h4 class="section-label">02 — Límites y debilidades</h4>${copy(item.limits)}</section></div>
      <section><h4 class="section-label">03 — Historia y observaciones</h4>${copy(item.notes)}</section>
      <details><summary>Procedencia y datos pendientes</summary>${copy(item.source)}</details>
      <div class="detail-actions">${image ? `<a class="original-sheet" href="${escape(image)}" target="_blank" rel="noopener">Ver imagen completa ↗</a>` : ''}<button id="edit-selected" type="button">Editar expediente ↗</button></div></div>`;
    $('edit-top').addEventListener('click', () => openEditor(item));
    bindBattle(item);
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
    const membersList = villains.filter(item => item.affiliation === 'Liga de Villanos');
    const filtered = membersList.filter(item => (!status || item.status === status) && normalize(fields.map(field => item[field]).join(' ')).includes(query));
    if (!filtered.some(item => item.id === selected)) selected = filtered[0]?.id;
    $('results').textContent = `${filtered.length} de ${membersList.length} miembros · Selecciona un expediente`;
    $('empty').hidden = filtered.length !== 0;
    document.querySelector('.dossiers').hidden = filtered.length === 0;
    $('villain-list').innerHTML = filtered.map(item => `<button class="villain-card" type="button" data-id="${escape(item.id)}" aria-pressed="${item.id === selected}" aria-controls="detail">${safeImage(item.image) ? `<img class="card-portrait" src="${escape(safeImage(item.image))}" alt="" loading="lazy">` : '<span class="card-placeholder">魔</span>'}<span class="card-id">MK-${String(villains.indexOf(item) + 1).padStart(3, '0')} / EXPEDIENTE</span><h3>${escape(item.name)}</h3><p>${escape(item.title || 'Sin título registrado')}</p><div class="card-bottom"><span class="gift-label">${escape(item.gift)}</span>${badge(item.status)}</div></button>`).join('');
    renderDetail();
    const leader = villains.find(v => v.id === 'zoya');
    if (leader) { $('leader-name').textContent = leader.name; $('leader-gift').textContent = leader.gift; $('leader-image').src = safeImage(leader.image); }
    $('total').textContent = membersList.length;
    $('alive').textContent = membersList.filter(item => item.status === 'Vivo').length;
    $('dead').textContent = membersList.filter(item => item.status === 'Muerto').length;
    $('pending').textContent = membersList.filter(item => item.status === 'Sin confirmar').length;
    const members = villains.filter(item => item.affiliation === 'Liga de Villanos').length;
    $('league-summary').textContent = members ? `${members} ${members === 1 ? 'miembro registrado' : 'miembros registrados'} en la Liga.` : 'La lista de miembros está pendiente de confirmar. Puedes asignar la afiliación desde cada expediente.';
  }
  function openEditor(item) {
    editing = item?.id || null;
    $('edit-form').reset();
    fields.forEach(field => { if (item) $('edit-form').elements.namedItem(field).value = item[field]; });
    $('edit-form').elements.namedItem('affiliation').value = 'Liga de Villanos';
    const stats = item?.stats || S.blank();
    S.keys.forEach(k => { $('edit-form').elements.namedItem('base-' + k).value = stats.base[k] ?? ''; });
    $('nature').value = stats.nature;
    previewStats();
    $('editor-title').textContent = item ? `Editar · ${item.name}` : 'Nuevo miembro';
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
    if (window.matchMedia('(max-width: 700px)').matches) $('detail').scrollIntoView({ block: 'start' });
  });
  ['search', 'status-filter'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
  $('clear-filters').addEventListener('click', () => { $('search').value = ''; $('status-filter').value = ''; render(); $('search').focus(); });
  $('show-league').addEventListener('click', () => { $('search').value = ''; $('status-filter').value = ''; render(); $('search').focus(); $('archivo').scrollIntoView(); });
  $('add').addEventListener('click', () => openEditor());
  $('close-editor').addEventListener('click', () => $('editor').close());
  $('edit-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const item = { id: editing || `villano-${crypto.randomUUID()}` };
      fields.forEach(field => { item[field] = $('edit-form').elements.namedItem(field).value.trim(); });
      item.stats = readStats();
      const previous = villains.find(v => v.id === editing);
      if (previous) item.stats.battle = structuredClone(previous.stats.battle);
      const maximum = S.values(item.stats).hp;
      item.stats.battle.hp = maximum === null ? null : item.stats.battle.hp === null ? null : Math.min(maximum, item.stats.battle.hp);
      const [clean] = validate({ version: 1, villains: [item] });
      const next = editing ? villains.map(previous => previous.id === editing ? clean : previous) : [...villains, clean];
      save(next); selected = clean.id;
      $('search').value = ''; $('status-filter').value = '';
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
  initStatsEditor();
  $('select-leader').addEventListener('click', () => { $('search').value = ''; $('status-filter').value = ''; selected = 'zoya'; render(); });
  render();
})();
