// estadisticas.js
const estadisticas = {
  goles: [
    ["Mavuika", 9],
    ["Ren", 8],
    ["Victor", 4],
    ["Jikan", 2],
    ["Pan", 1],
    ["Ryuji", 1],
    ["Lambda", 1],
    ["Shiro", 1],
    ["Akari", 1],
    ["Rikuo", 1],
    ["Hikaru", 1],
    ["Yachiho", 1],
    ["Dan", 1],
    ["Rumi", 1],
  ],
  asistencias: [
    ["Renzu", 5],
    ["Pan", 4],
    ["Mavuika", 3],
    ["Rikuo", 2],
    ["Victor", 2],
    ["Dan", 2],
    ["Shiro", 1],
    ["Lambda", 1],
    ["Jibril", 1],
    ["Candace", 1],
    ["Chisato", 1],
    ["Hikaru", 1],
    ["Shinbad", 1],
  ],
  porterias: [
    ["Delta", 2],
    ["Fubuki", 1],
  ],
};

function renderRanking(id, datos) {
  const contenedor = document.getElementById(id);

  contenedor.innerHTML = datos.map(([nombre, valor], index) => `
    <div class="fila">
      <span>
        <span class="posicion">${index + 1}.</span>
        ${nombre}
      </span>
      <span class="valor">${valor}</span>
    </div>
  `).join("");
}

renderRanking("goles", estadisticas.goles);
renderRanking("asistencias", estadisticas.asistencias);
renderRanking("porterias", estadisticas.porterias);