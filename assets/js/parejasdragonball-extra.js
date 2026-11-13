/* Apartado opcional, separado de los datos y búsquedas del archivo principal.
   Es un bloqueo visual en una web estática, no autenticación de servidor. */
(() => {
  // Añade o edita aquí los hijos de Jane Doe y Alcides.
  const children = [
    {
      name: 'Ibuki Doe',
      img: 'Hijos/Alcides y Jane/Ibuki Doe.jpg',
      gender: 'F',
      tag: 'L',
      series: 'Street Fighter',
      meta: 'Ibuki — Street Fighter'
    }
  ];

  const explorer = document.querySelector('.family-explorer.fx-dragon');
  if (!explorer) return;

  const heading = explorer.querySelector('.fx-heading');
  const mode = document.getElementById('fx-mode');
  const workspace = document.getElementById('fx-workspace');
  const actions = document.createElement('div');
  actions.className = 'fx-extra-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'Archivo extra';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'fx-extra');
  heading.append(actions);
  actions.append(mode, toggle);

  const panel = document.createElement('section');
  panel.id = 'fx-extra';
  panel.className = 'fx-extra';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'fx-extra-title');
  panel.innerHTML = `
    <div class="fx-extra-heading"><div><span class="fx-kicker">ARCHIVO EXTRA</span>
      <h2 id="fx-extra-title" tabindex="-1">Acceso con código</h2>
      <p id="fx-extra-description">Introduce el código para abrir este apartado.</p></div>
      <button type="button" id="fx-extra-lock" hidden>Volver a bloquear</button></div>
    <form id="fx-extra-form" class="fx-extra-form">
      <label for="fx-extra-code">Código de acceso</label>
      <div class="fx-extra-entry"><input id="fx-extra-code" type="password" inputmode="numeric"
        pattern="[0-9]{6}" maxlength="6" minlength="6" required autocomplete="off"
        placeholder="6 dígitos" aria-describedby="fx-extra-error">
        <button type="submit">Desbloquear</button></div>
      <p id="fx-extra-error" role="status" aria-live="polite"></p>
    </form>
    <div id="fx-extra-content" hidden></div>`;
  workspace.before(panel);
  const form = panel.querySelector('form');
  const input = panel.querySelector('input');
  const error = panel.querySelector('#fx-extra-error');
  const content = panel.querySelector('#fx-extra-content');
  const lock = panel.querySelector('#fx-extra-lock');
  const title = panel.querySelector('h2');
  const description = panel.querySelector('#fx-extra-description');
  let wasExplorer = true;

  function resetLock() {
    content.replaceChildren();
    content.hidden = true;
    lock.hidden = true;
    form.hidden = false;
    form.reset();
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    title.textContent = 'Acceso con código';
    description.textContent = 'Introduce el código para abrir este apartado.';
  }

  toggle.addEventListener('click', () => {
    const opening = panel.hidden;
    if (opening) {
      wasExplorer = document.body.classList.contains('fx-active');
      document.body.classList.add('fx-active');
      workspace.hidden = true;
      document.body.classList.remove('index-open');
    } else {
      resetLock();
      document.body.classList.toggle('fx-active', wasExplorer);
      workspace.hidden = !wasExplorer;
    }
    panel.hidden = !opening;
    mode.hidden = opening;
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.textContent = opening ? 'Volver al archivo' : 'Archivo extra';
    if (opening) input.focus();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (input.value !== '034001') {
      error.textContent = 'Código incorrecto. Inténtalo de nuevo.';
      input.setAttribute('aria-invalid', 'true');
      input.select();
      return;
    }
    content.innerHTML = `
      <article class="fx-extra-couple" aria-labelledby="fx-extra-couple-title">
        <h3 id="fx-extra-couple-title">Jane Doe y Alcides</h3>
        <div class="fx-extra-portraits">
          <figure><img src="fotos-poderes/JaneDoe.jpg" alt="Jane Doe" width="240" height="300">
            <figcaption>Jane Doe</figcaption></figure>
          <span class="fx-extra-bond" aria-label="Pareja">♥</span>
          <figure><img src="fotos-poderes/Antiquiles.jpg" alt="Alcides" width="240" height="300">
            <figcaption>Alcides</figcaption></figure>
        </div>
        <section class="fx-extra-descendants" aria-labelledby="fx-extra-children-title">
          <h4 id="fx-extra-children-title">Descendencia</h4>
          <div class="fx-extra-children"></div>
        </section>
      </article>`;
    const childList = content.querySelector('.fx-extra-children');
    children.forEach(child => {
      const card = document.createElement('figure');
      card.className = 'fx-extra-child';
      const image = document.createElement('img');
      image.src = child.img;
      image.alt = child.name;
      image.width = 240;
      image.height = 300;
      image.loading = 'lazy';
      const caption = document.createElement('figcaption');
      const name = document.createElement('strong');
      name.textContent = child.name;
      const details = document.createElement('p');
      const gender = child.gender === 'F' ? 'Femenina' : child.gender === 'M' ? 'Masculino' : 'Sin especificar';
      details.textContent = `Clase ${child.tag} · ${gender} · ${child.series}`;
      const reference = document.createElement('small');
      reference.textContent = child.meta || '';
      caption.append(name, details, reference);
      card.append(image, caption);
      childList.append(card);
    });
    form.reset();
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    form.hidden = true;
    content.hidden = false;
    lock.hidden = false;
    title.textContent = 'Archivo desbloqueado';
    description.textContent = 'Al salir de este apartado se volverá a pedir el código.';
    title.focus();
  });
  lock.addEventListener('click', () => { resetLock(); input.focus(); });
})();
