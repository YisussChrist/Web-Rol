const ideas = [
  "Mario 3D nuevo",
  "Mario Odyssey 2",
  "Nuevo Animal Crossing",
  "Smash nuevo",
  "Fire Emblem",
  "Remake de Ocarina of Time",
  "Duskbloods",
  "Persona 6",
  "Switch Sports",
  "Farming game",
  "Juego de cartas random",
  "Indie precioso pero nadie sabe qué es",
  "Luigi's Mansion 4",
  "Kirby 2D",
  "Nuevo Donkey Kong",
  "F-Zero revive del cementerio",
  "Golden Sun vuelve",
  "Star Fox",
  "Rhythm Heaven Groove",
  "Splatoon",
  "Fecha: 2027",
  "Disponible hoy",
  "Alguna parida del Nintendo Switch Online",
  "Nuevo Zelda 2D",
  "Remaster de GameCube",
  "Ports de terceros",
  "Algo del Winds and Waves?",
  "Square Enix enseña algo raro",
  "Sakurai jumpscare",
  "Merchandising nuevo",
  "One more thing",
  "Nuevo emulador NSO",
  "Wario?",
  "Nintendo mete un trailer larguísimo",
  "Juego que nadie pidió pero pinta bien",
  "Colección retro",
  "Nueva historia que no le importa ni a Miyamoto",
  "Demo disponible hoy",
  "Inazuma Eleven",
  "Deltarune Cap 5",
  "Remake Metroid?",
  "Juego japonesada",
  "Final Fantasy Remake Remaster Remaster Remake Remismuertos",
  "Remake que parece remaster",
  "Danganronpa 2x2",
  "Nueva especie Pokémon",
  "TCG Live",
  "TCG Pokemon",
];

const board = document.getElementById("board");
const shuffleBtn = document.getElementById("shuffleBtn");
const resetBtn = document.getElementById("resetBtn");
const statusText = document.getElementById("status");
const toast = document.getElementById("toast");

let currentCells = [];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function createBoard() {
  board.innerHTML = "";
  currentCells = shuffle(ideas);

  currentCells.forEach((text, index) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.textContent = text;
    cell.dataset.index = index;

    cell.addEventListener("click", () => {
      cell.classList.toggle("marked");
      checkProgress();
    });

    board.appendChild(cell);
  });

  statusText.textContent = `0/${currentCells.length} casillas marcadas. Que empiece el Direct.`;
}

function checkProgress() {
  const markedCells = document.querySelectorAll(".cell.marked");
  const count = markedCells.length;

  statusText.textContent = `${count}/${currentCells.length} casillas marcadas. Sigue el sufrimiento.`;

  if (count === currentCells.length) {
    document.querySelectorAll(".cell").forEach(cell => cell.classList.add("win"));
    statusText.textContent = "¡¡CARTÓN COMPLETO!! Nintendo ha anunciado hasta Tu Madre 2.";
    showToast("¡¡CARTÓN COMPLETO!!");
  }
}

shuffleBtn.addEventListener("click", () => {
  createBoard();
  showToast("Orden aleatorizado");
});

resetBtn.addEventListener("click", () => {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("marked", "win");
  });

  statusText.textContent = `0/${currentCells.length} casillas marcadas. Volvemos al copium.`;
  showToast("Reiniciado");
});

createBoard();
