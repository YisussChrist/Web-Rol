(() => {
  'use strict';
  const E = window.Budokai, $ = id => document.getElementById(id), KEY = 'rp-budokai-v1';
  const roster = characters.map(E.fighter).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const byId = new Map(roster.map(f => [f.id, f]));
  const sizes = E.sizes(roster.length);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const number = value => value === null ? 'Sin lectura' : value.toLocaleString('es-ES');
  let state = { version: 1, size: sizes.includes(16) ? 16 : sizes[0], selected: [], rounds: [] };
  let activeRound = 0, stage = 'setup', storageAvailable = true;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const restored = E.restore(JSON.parse(saved), roster.map(f => f.id));
      if (restored) { state = restored; stage = state.rounds.length ? 'arena' : state.selected.length ? 'roster' : 'setup'; activeRound = Math.max(0, state.rounds.length - 1); }
      else $('notice').textContent = 'La partida guardada no es compatible con el archivo actual. Puedes preparar un torneo nuevo.';
    }
  } catch { storageAvailable = false; }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
    catch { storageAvailable = false; }
    $('save-status').textContent = storageAvailable ? 'Torneo guardado en este navegador.' : 'El navegador no permite guardar. Mantén esta pestaña abierta.';
  }
  function announce(text) { $('notice').textContent = text; }
  function confirmAction(title, text) {
    $('confirm-title').textContent = title; $('confirm-text').textContent = text;
    const dialog = $('confirm-dialog'); dialog.returnValue = 'cancel'; dialog.showModal();
    return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'accept'), { once: true }));
  }
  function portrait(f) {
    if (!f.photo) return `<span class="portrait avatar-fallback" aria-hidden="true">${esc(initialsFromName(f.name))}</span>`;
    return `<img class="portrait" src="${esc(f.photo)}" alt="" loading="lazy" data-initials="${esc(initialsFromName(f.name))}">`;
  }
  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement && event.target.matches('.portrait')) {
      const fallback = document.createElement('span'); fallback.className = 'portrait avatar-fallback';
      fallback.setAttribute('aria-hidden', 'true'); fallback.textContent = event.target.dataset.initials; event.target.replaceWith(fallback);
    }
  }, true);
  window.addEventListener('click', event => {
    if (window.parent !== window && event.target.closest?.('#hub-return') && event.button === 0
        && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault(); event.stopPropagation(); window.parent.postMessage({ type: 'rp-shell-navigate', route: 'hub.html' }, '*');
    }
  }, true);
  function renderSetup() {
    $('sizes').innerHTML = sizes.map(size => `<button class="size" data-size="${size}" aria-label="${size} participantes" aria-pressed="${size === state.size}">${size}</button>`).join('');
    $('ticket-size').textContent = state.size; $('round-count').textContent = Math.log2(state.size); $('roster-total').textContent = roster.length;
  }
  function showStage(next, focus = true) {
    stage = next;
    for (const name of ['setup', 'roster', 'arena']) {
      $(name).hidden = name !== stage;
      $('step-' + name).toggleAttribute('aria-current', name === stage);
      if (name === stage) $('step-' + name).setAttribute('aria-current', 'step');
    }
    $('step-roster').disabled = stage === 'setup' && !state.selected.length;
    $('step-arena').disabled = !state.rounds.length;
    if (stage === 'setup') renderSetup();
    if (stage === 'roster') renderRoster();
    if (stage === 'arena') renderArena();
    if (focus) { $(stage + '-title').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
  function renderRoster() {
    const query = norm($('fighter-search').value.trim()), filter = $('fighter-filter').value;
    const filtered = roster.filter(f => norm(f.name).includes(query) && (filter !== 'forms' || f.forms.length)
      && (filter !== 'selected' || state.selected.includes(f.id)));
    $('results-count').textContent = `${filtered.length} de ${roster.length} personajes del archivo de poderes`;
    $('selected-count').textContent = `${state.selected.length} / ${state.size}`;
    $('fighter-grid').innerHTML = filtered.map(f => {
      const selected = state.selected.includes(f.id), index = roster.indexOf(f);
      return `<button class="fighter-card" data-fighter="${index}" aria-label="${esc(f.name)}" aria-pressed="${selected}">${portrait(f)}<span class="selection-mark" aria-hidden="true">${selected ? '✓' : '+'}</span><span class="fighter-info"><strong>${esc(f.name)}</strong><small>BASE ${number(f.base)}</small><small>${f.forms.length ? f.forms.length + (f.forms.length === 1 ? ' forma disponible' : ' formas disponibles') : 'Forma base'}</small></span></button>`;
    }).join('') || '<p class="empty">No hay luchadores que coincidan con esta búsqueda.</p>';
    $('selection-list').innerHTML = state.selected.map(id => `<div class="selected-chip"><span>${esc(id)}</span><button data-remove="${roster.indexOf(byId.get(id))}" aria-label="Quitar a ${esc(id)}">×</button></div>`).join('') || '<p class="muted">Todavía no hay inscritos. Elige sus retratos o completa la lista al azar.</p>';
    const remaining = state.size - state.selected.length;
    $('draw').disabled = remaining !== 0; $('random-fill').disabled = remaining === 0; $('clear-selection').disabled = !state.selected.length;
    $('selection-hint').textContent = remaining ? `Faltan ${remaining} ${remaining === 1 ? 'plaza' : 'plazas'} para sortear los cruces.` : 'Cartel completo. Todos tendrán rival.';
  }
  function roundName(index) {
    const participants = state.size / 2 ** index;
    return ({ 2: 'Final', 4: 'Semifinales', 8: 'Cuartos de final', 16: 'Octavos de final' })[participants] || `Ronda de ${participants}`;
  }
  function readings(f) {
    const peak = f.uncertain ? 'Sin lectura completa' : number(f.peak?.power ?? null);
    const note = f.uncertain ? (f.peak ? `Mayor lectura conocida: ${number(f.peak.power)} · ${f.peak.name}` : 'Poder todavía sin registrar.')
      : (f.forms.length ? f.peak.name : f.disabled ? 'Forma base · transformación deshabilitada excluida' : 'Sin transformaciones registradas');
    return `<dl class="power-readings"><div><dt>PODER BASE</dt><dd>${number(f.base)}</dd></div><div><dt>PODER MÁXIMO</dt><dd class="max">${peak}</dd></div></dl><p class="form-note">${esc(note)}</p>`;
  }
  function formDetails(f) {
    return `<strong>${esc(f.name)}</strong><ul><li>Forma base: ${number(f.base)}</li>${f.forms.map(form => `<li>${esc(form.name)}: ${number(form.power)}</li>`).join('')}${f.disabled ? `<li>${f.disabled} forma deshabilitada, fuera del cálculo.</li>` : ''}</ul>`;
  }
  function renderBracket() {
    const columns = E.bracket(state.size, state.rounds);
    const entry = (id, winner, placeholder) => {
      const fighter = byId.get(id);
      return `<span class="bracket-fighter ${winner === id && id ? 'qualified' : ''}">${fighter ? portrait(fighter) : '<span class="bracket-placeholder" aria-hidden="true">?</span>'}<span>${fighter ? esc(fighter.name) : esc(placeholder)}</span>${id && id === winner ? '<b aria-label="Ganador">✓</b>' : ''}</span>`;
    };
    $('bracket-board').style.setProperty('--bracket-height', `${state.size / 2 * 116}px`);
    $('bracket-board').innerHTML = columns.map((round, r) => `<section class="bracket-column" data-bracket-column="${r}" aria-label="${roundName(r)}"><h4>${roundName(r)}</h4><div class="bracket-games">${round.map((match, i) => `<div class="bracket-slot"><button class="bracket-match ${match.winner ? 'decided' : ''}" data-open-round="${r}" data-open-match="${i}" ${match.available ? '' : 'disabled'} aria-label="${roundName(r)}, combate ${i + 1}: ${esc(match.fighters.map((id, side) => id || `Ganador del combate ${i * 2 + side + 1} de ${roundName(r - 1)}`).join(' contra '))}"><span class="bracket-match-label">COMBATE ${i + 1}${match.winner ? ' · DECIDIDO' : ''}</span>${match.fighters.map((id, side) => entry(id, match.winner, `Ganador de ${roundName(r - 1)} · ${i * 2 + side + 1}`)).join('')}</button></div>`).join('')}</div></section>`).join('');
    const championId = columns.at(-1)[0].winner;
    $('bracket-board').insertAdjacentHTML('beforeend', `<section class="bracket-column bracket-winner" data-bracket-column="${columns.length}" aria-label="Campeón"><h4>Campeón</h4><div class="bracket-games"><div class="bracket-slot"><div class="bracket-match"><span class="bracket-match-label">${championId ? 'CAMPEÓN DEL TORNEO' : 'EL TÍTULO TE ESPERA'}</span>${entry(championId, championId, 'Ganador de la final')}</div></div></div></section>`);
    const currentJump = $('bracket-jump').value;
    $('bracket-jump').innerHTML = columns.map((_, r) => `<option value="${r}">${roundName(r)}</option>`).join('') + `<option value="${columns.length}">Campeón</option>`;
    $('bracket-jump').value = Number(currentJump) <= columns.length ? currentJump || '0' : '0';
  }
  function renderArena() {
    const round = state.rounds[activeRound];
    renderBracket();
    $('round-tabs').innerHTML = Array.from({ length: Math.log2(state.size) }, (_, i) => `<button data-round="${i}" aria-current="${i === activeRound}" ${i >= state.rounds.length ? 'disabled' : ''}>${roundName(i)}</button>`).join('');
    $('round-title').textContent = roundName(activeRound);
    const decided = round.filter(m => m.winner).length;
    $('round-progress').textContent = `${decided} / ${round.length} combates decididos`;
    $('matches').innerHTML = round.map((match, index) => {
      const fighters = match.fighters.map(id => byId.get(id));
      const fighterCard = (f, side) => `<div class="combatant ${match.winner === f.id ? 'winner' : ''}">${portrait(f)}<h4>${esc(f.name)}</h4>${readings(f)}<button class="win-button" data-match="${index}" data-side="${side}" aria-label="Gana ${esc(f.name)}" aria-pressed="${match.winner === f.id}">${match.winner === f.id ? '✓ Ganador' : 'Elegir ganador'}</button></div>`;
      return `<article class="match" aria-label="Combate ${index + 1}: ${esc(fighters[0].name)} contra ${esc(fighters[1].name)}"><div class="match-top"><span>COMBATE ${String(index + 1).padStart(2, '0')}</span><span class="${match.winner ? 'decided' : ''}">${match.winner ? 'RESULTADO REGISTRADO' : 'EN JUEGO'}</span></div><div class="duel">${fighterCard(fighters[0], 0)}<span class="versus" aria-hidden="true">VS</span>${fighterCard(fighters[1], 1)}</div><details class="form-details"><summary>Consultar transformaciones y lecturas</summary>${fighters.map(formDetails).join('')}</details></article>`;
    }).join('');
    const final = state.rounds[state.rounds.length - 1];
    const winner = final.length === 1 && final[0].winner ? byId.get(final[0].winner) : null;
    $('champion').hidden = !winner;
    $('champion').innerHTML = winner ? `${portrait(winner)}<div><p class="eyebrow">CAMPEÓN DEL BUDOKAI TENKAICHI</p><h3>${esc(winner.name)}</h3><p>${state.size} aspirantes. ${Math.log2(state.size)} victorias. Un campeón.</p></div>` : '';
    $('next-round').hidden = round.length === 1;
    $('next-round').disabled = decided !== round.length;
    $('round-hint').textContent = decided < round.length ? 'Selecciona a los ganadores para completar la ronda.' : round.length === 1 ? '¡El torneo tiene campeón! Puedes revisar cualquiera de las rondas.' : 'Ronda completa. Los ganadores esperan su próximo combate.';
  }
  async function editStage(next) {
    if (state.rounds.length) {
      if (!await confirmAction('¿Volver a la preparación?', 'Se borrarán los cruces y los resultados. Mantendremos los luchadores seleccionados.')) return;
      state.rounds = []; activeRound = 0; save();
    }
    announce(''); showStage(next);
  }
  $('sizes').addEventListener('click', async event => {
    const button = event.target.closest('[data-size]'); if (!button) return;
    const size = Number(button.dataset.size);
    if (state.selected.length > size && !await confirmAction('¿Reducir el torneo?', `Se conservarán los primeros ${size} inscritos. Después podrás cambiar la selección.`)) return;
    state.size = size; state.selected = state.selected.slice(0, size); save(); renderSetup();
    $('sizes').querySelector(`[data-size="${size}"]`).focus();
  });
  $('choose-fighters').addEventListener('click', () => { announce(''); showStage('roster'); });
  $('step-setup').addEventListener('click', () => editStage('setup'));
  $('change-size').addEventListener('click', () => editStage('setup'));
  $('step-roster').addEventListener('click', () => editStage('roster'));
  $('step-arena').addEventListener('click', () => showStage('arena'));
  $('fighter-search').addEventListener('input', renderRoster);
  $('fighter-filter').addEventListener('change', renderRoster);
  $('fighter-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-fighter]'); if (!button) return;
    const id = roster[Number(button.dataset.fighter)].id;
    if (state.selected.includes(id)) state.selected = state.selected.filter(value => value !== id);
    else if (state.selected.length < state.size) state.selected.push(id);
    else { announce('Todas las plazas están cubiertas. Quita un luchador para elegir otro.'); return; }
    announce(`${state.selected.length} de ${state.size} plazas cubiertas.`); save(); renderRoster();
    $('fighter-grid').querySelector(`[data-fighter="${button.dataset.fighter}"]`)?.focus({ preventScroll: true });
  });
  $('selection-list').addEventListener('click', event => {
    const button = event.target.closest('[data-remove]'); if (!button) return;
    state.selected = state.selected.filter(id => id !== roster[Number(button.dataset.remove)].id); save(); renderRoster();
    announce(`${state.selected.length} de ${state.size} plazas cubiertas.`);
  });
  $('random-fill').addEventListener('click', () => {
    const available = roster.filter(f => !state.selected.includes(f.id)).map(f => f.id);
    state.selected.push(...E.shuffle(available).slice(0, state.size - state.selected.length));
    save(); renderRoster(); announce('Selección completada al azar. Tus luchadores elegidos se han conservado.');
  });
  $('clear-selection').addEventListener('click', () => { state.selected = []; save(); renderRoster(); announce('Selección vacía.'); });
  $('draw').addEventListener('click', () => {
    if (state.selected.length !== state.size) return;
    state.rounds = [E.pair(E.shuffle(state.selected))]; activeRound = 0; save(); announce('Cruces sorteados. ¡Que comience el torneo!'); showStage('arena');
  });
  $('round-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-round]'); if (!button || button.disabled) return;
    activeRound = Number(button.dataset.round); renderArena(); $('round-tabs').querySelector(`[data-round="${activeRound}"]`).focus();
  });
  $('bracket-board').addEventListener('click', event => {
    const button = event.target.closest('[data-open-match]');
    if (!button || button.disabled) return;
    activeRound = Number(button.dataset.openRound);
    const matchIndex = Number(button.dataset.openMatch);
    renderArena();
    const match = $('matches').children[matchIndex];
    match.scrollIntoView({ block: 'center', behavior: 'instant' });
    match.querySelector('.win-button').focus({ preventScroll: true });
  });
  $('bracket-jump').addEventListener('change', () => {
    const column = $('bracket-board').querySelector(`[data-bracket-column="${$('bracket-jump').value}"]`);
    if (!column) return;
    const slot = column.querySelector('.bracket-match');
    const viewport = $('bracket-scroll');
    const bounds = viewport.getBoundingClientRect(), target = slot.getBoundingClientRect();
    viewport.scrollTo({ left: column.getBoundingClientRect().left - bounds.left + viewport.scrollLeft - 16,
      top: target.top - bounds.top + viewport.scrollTop - viewport.clientHeight / 2 + target.height / 2, behavior: 'instant' });
  });
  $('matches').addEventListener('click', async event => {
    const button = event.target.closest('[data-match]'); if (!button) return;
    const index = Number(button.dataset.match), side = Number(button.dataset.side);
    const winner = state.rounds[activeRound][index].fighters[side];
    if (state.rounds[activeRound][index].winner === winner) return;
    if (state.rounds.length > activeRound + 1 && !await confirmAction('¿Cambiar este resultado?', 'Se borrarán las rondas posteriores, porque sus participantes dependen de este combate.')) return;
    state.rounds = E.choose(state.rounds, activeRound, index, winner); save(); renderArena();
    announce(`${winner} gana su combate.`);
    $('matches').querySelector(`[data-match="${index}"][data-side="${side}"]`).focus({ preventScroll: true });
  });
  $('next-round').addEventListener('click', () => {
    if (state.rounds[activeRound].some(match => !match.winner)) return;
    if (!state.rounds[activeRound + 1]) state.rounds.push(E.advance(state.rounds[activeRound]));
    activeRound++; save(); announce(''); showStage('arena');
  });
  $('new-tournament').addEventListener('click', async () => {
    if (!await confirmAction('¿Preparar otro torneo?', 'Se borrarán los inscritos, cruces y resultados de este torneo.')) return;
    state.selected = []; state.rounds = []; activeRound = 0; $('fighter-search').value = ''; $('fighter-filter').value = 'all'; save(); announce(''); showStage('setup');
  });
  if (!storageAvailable) $('save-status').textContent = 'No se pudo recuperar el guardado. El torneo sigue disponible en esta pestaña.';
  renderSetup(); showStage(stage, false);
})();
