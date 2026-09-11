(() => {
  'use strict';

  const search = document.querySelector('#game-search');
  const cards = [...document.querySelectorAll('[data-status]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const entries = cards.map(card => ({ card, text: normalize(card.textContent) }));
  let selected = 'all';

  function update() {
    const query = normalize(search.value.trim());
    let visible = 0;
    entries.forEach(({ card, text }) => {
      card.hidden = !(selected === 'all' || card.dataset.status === selected) || !text.includes(query);
      if (!card.hidden) visible += 1;
    });
    document.querySelectorAll('[data-group]').forEach(section => {
      section.hidden = ![...section.querySelectorAll('[data-status]')].some(card => !card.hidden);
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
    document.querySelector('#game-results').textContent = `${visible} de ${cards.length} juegos`;
    document.querySelector('#empty-state').hidden = visible !== 0;
  }

  document.querySelectorAll('[data-count]').forEach(counter => {
    counter.textContent = cards.filter(card => card.dataset.status === counter.dataset.count).length;
  });
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter;
    update();
  }));
  search.addEventListener('input', update);
  document.querySelector('#reset-search').addEventListener('click', () => {
    search.value = '';
    selected = 'all';
    update();
    search.focus();
  });
  document.querySelector('#catalogo').hidden = false;
  update();
})();
