const ideas = [
  "Nuevo Mario",
  "Super Smash Bros",
  "Animal Crossing Nuevo",
  "Danganronpa 2x2",
  "Wario Land",
  "DLC de Mario Kart",
  "Deltarune mentioned",
  "Pokémon W&W",
  "IP pochísima",
  "Algo del Splatoon",
  "Port de un juego antiguo para Switch",
  "Nuevo emulador para NSO",
  "Juego que lleva 5 años en la Play 5",
  "Nuevos Pokémon del UNITE",
  "Victory Road Nintendo Switch 2 EDITION",
  "Actualización Tomodachi Life",
  "Algo de Kirby",
  "Dragon Ball Xenoverse 3",
  "Subnautica 2",
  "Super Mario 3D",
  "Super Mario Maker 3",
  "Paper Mario",
  "Merchandising de Nintendo",
  "Starfox",
  "Remake de ub juego",
  "Remaster de un juego",
  "Monster Hunter"
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
