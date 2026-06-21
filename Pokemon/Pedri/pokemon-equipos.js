const STORAGE_KEY = "webrol_pokemon_teams_v1";
const regions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Teselia", "Kalos", "Alola", "Galar", "Hisui", "Paldea", "Etruria"];

const defaultTeams = [
  {
    id: crypto.randomUUID(),
    region: "Teselia",
    name: "Emboar",
    level: 36,
    role: "Atacante físico",
    type1: "Fuego",
    type2: "Lucha",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/500.png",
    ability: "Mar Llamas",
    item: "",
    moves: "Nitrocarga, Empujón, Golpe Calor, Desenrollar",
    notes: "Inicial de la aventura. El jefe, el tanque, el que entra cuando hay que tirar la puerta abajo."
  },
  {
    id: crypto.randomUUID(),
    region: "Teselia",
    name: "Krookodile",
    level: 40,
    role: "Sweeper / intimidación",
    type1: "Tierra",
    type2: "Siniestro",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/553.png",
    ability: "Intimidación",
    item: "Gafas Negras",
    moves: "Terremoto, Triturar, Avalancha, Excavar",
    notes: "Cuando Sandile aprende Excavar empieza el cine. Literalmente Netflix pero con cocodrilo."
  }
];

let teams = loadTeams();

const form = document.getElementById("pokemonForm");
const regionsContainer = document.getElementById("regionsContainer");
const searchInput = document.getElementById("searchInput");
const filterRegion = document.getElementById("filterRegion");
const modal = document.getElementById("infoModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const resetBtn = document.getElementById("resetBtn");

initFilters();
renderTeams();

form.addEventListener("submit", event => {
  event.preventDefault();

  const pokemon = {
    id: crypto.randomUUID(),
    region: value("regionInput"),
    name: value("nameInput"),
    level: value("levelInput"),
    role: value("roleInput"),
    type1: value("type1Input"),
    type2: value("type2Input"),
    image: value("imageInput") || fallbackSprite(value("nameInput")),
    ability: value("abilityInput"),
    item: value("itemInput"),
    moves: value("movesInput"),
    notes: value("notesInput")
  };

  teams.push(pokemon);
  saveTeams();
  form.reset();
  document.getElementById("regionInput").value = pokemon.region;
  renderTeams();
});

searchInput.addEventListener("input", renderTeams);
filterRegion.addEventListener("change", renderTeams);
closeModal.addEventListener("click", () => modal.close());
modal.addEventListener("click", event => {
  if (event.target === modal) modal.close();
});

resetBtn.addEventListener("click", () => {
  const ok = confirm("¿Seguro que quieres borrar todos los Pokémon guardados?");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  teams = [];
  renderTeams();
});

function initFilters() {
  regions.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    filterRegion.appendChild(option);
  });
}

function renderTeams() {
  regionsContainer.innerHTML = "";
  const query = searchInput.value.trim().toLowerCase();
  const selectedRegion = filterRegion.value;

  const filtered = teams.filter(p => {
    const matchesRegion = selectedRegion === "Todas" || p.region === selectedRegion;
    const text = `${p.region} ${p.name} ${p.role} ${p.type1} ${p.type2} ${p.ability} ${p.item} ${p.moves} ${p.notes}`.toLowerCase();
    return matchesRegion && text.includes(query);
  });

  if (!filtered.length) {
    regionsContainer.innerHTML = `<div class="panel empty-state">No hay Pokémon registrados con esos filtros. Añade uno y empieza el lore competitivo.</div>`;
    return;
  }

  regions.forEach(region => {
    const pokemonInRegion = filtered.filter(p => p.region === region);
    if (!pokemonInRegion.length) return;

    const regionTemplate = document.getElementById("regionTemplate").content.cloneNode(true);
    const regionCard = regionTemplate.querySelector(".region-card");
    regionCard.querySelector("h2").textContent = region;
    regionCard.querySelector(".counter").textContent = `${pokemonInRegion.length}/6`;

    const teamGrid = regionCard.querySelector(".team-grid");
    pokemonInRegion.forEach(pokemon => teamGrid.appendChild(createPokemonCard(pokemon)));
    regionsContainer.appendChild(regionCard);
  });
}

function createPokemonCard(pokemon) {
  const template = document.getElementById("pokemonTemplate").content.cloneNode(true);
  const card = template.querySelector(".pokemon-card");
  const img = card.querySelector("img");
  img.src = pokemon.image || fallbackSprite(pokemon.name);
  img.alt = pokemon.name;
  img.onerror = () => { img.src = fallbackSprite(pokemon.name); };
  card.querySelector("strong").textContent = pokemon.name;
  card.querySelector("span").textContent = [pokemon.role, pokemon.level ? `Nv. ${pokemon.level}` : ""].filter(Boolean).join(" · ") || "Sin rol definido";
  card.addEventListener("click", () => openInfo(pokemon));
  return card;
}

function openInfo(pokemon) {
  modalContent.innerHTML = `
    <div class="modal-inner">
      <div class="modal-top">
        <img src="${escapeHtml(pokemon.image || fallbackSprite(pokemon.name))}" alt="${escapeHtml(pokemon.name)}" onerror="this.src='${fallbackSprite(pokemon.name)}'">
        <div>
          <h2>${escapeHtml(pokemon.name)}</h2>
          <div class="tags">
            ${tag(pokemon.region)}
            ${pokemon.level ? tag(`Nv. ${pokemon.level}`) : ""}
            ${pokemon.type1 ? tag(pokemon.type1) : ""}
            ${pokemon.type2 ? tag(pokemon.type2) : ""}
          </div>
        </div>
      </div>

      <div class="info-grid">
        ${box("Rol", pokemon.role || "Sin rol definido")}
        ${box("Habilidad", pokemon.ability || "Sin habilidad registrada")}
        ${box("Objeto", pokemon.item || "Sin objeto")}
        ${box("Tipos", [pokemon.type1, pokemon.type2].filter(Boolean).join(" / ") || "Sin tipos")}
        ${box("Movimientos", pokemon.moves || "Sin movimientos registrados", true)}
        ${box("Notas", pokemon.notes || "Sin notas todavía", true)}
      </div>

      <button class="delete-pokemon" onclick="deletePokemon('${pokemon.id}')">Eliminar de este registro</button>
    </div>
  `;
  modal.showModal();
}

window.deletePokemon = function(id) {
  const ok = confirm("¿Eliminar este Pokémon del registro?");
  if (!ok) return;
  teams = teams.filter(pokemon => pokemon.id !== id);
  saveTeams();
  modal.close();
  renderTeams();
};

function box(title, content, full = false) {
  return `<div class="info-box ${full ? "full" : ""}"><small>${escapeHtml(title)}</small><p>${escapeHtml(content)}</p></div>`;
}

function tag(content) {
  return `<span class="tag">${escapeHtml(content)}</span>`;
}

function value(id) {
  return document.getElementById(id).value.trim();
}

function saveTeams() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

function loadTeams() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultTeams;
  try {
    return JSON.parse(saved);
  } catch {
    return defaultTeams;
  }
}

function fallbackSprite(name) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `https://img.pokemondb.net/sprites/home/normal/${cleaned || "pokeball"}.png`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
