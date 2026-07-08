const partidos = [
  {
    id: "raimon-protocolo-omega-2026",
    fecha: "8-7-2026",
    competicion: "Partido contra El Dorado",
    estadio: "Campo Kurogane",
    etiqueta: "PARTIDAZO",

    local: {
      nombre: "Raimon",
      escudo: "../sts/escudos/raimon.png",
      goles: 5
    },

    visitante: {
      nombre: "Protocolo Omega 4.0",
      escudo: "../sts/escudos/Protocolo Omega 4.png",
      goles: 4
    },

    eventos: [
      {
        tipo: "gol",
        minuto: "3'",
        equipo: "Raimon",
        jugador: "Mavuika Heartless",
        asistente: "Renzu Itō",
        resultado: "1-0"
      },
      {
        tipo: "gol",
        minuto: "27'",
        equipo: "Raimon",
        jugador: "Jikan Alonso",
        asistente: "Mavuika Heartless",
        resultado: "2-0"
      },
      {
        tipo: "gol",
        minuto: "45'",
        equipo: "Protocolo Omega 4.0",
        jugador: "Willow Proude",
        asistente: null,
        resultado: "2-1"
      },
      {
        tipo: "descanso",
        minuto: "45'",
        texto: "Descanso"
      },
      {
        tipo: "gol",
        minuto: "49'",
        equipo: "Raimon",
        jugador: "Renzu Itō",
        asistente: "Pan Walker",
        resultado: "3-1"
      },
      {
        tipo: "gol",
        minuto: "55'",
        equipo: "Protocolo Omega 4.0",
        jugador: "Heaven Heaton",
        asistente: "Jibril Hellsdothir",
        resultado: "3-2"
      },
      {
        tipo: "cambio",
        minuto: "55'",
        equipo: "Raimon",
        sale: "Fubuki Sumiye",
        entra: "Delta Hervieux",
        posicion: "POR"
      },
      {
        tipo: "cambio",
        minuto: "55'",
        equipo: "Raimon",
        sale: "Chisato Nishikigi",
        entra: "Miu Iruma",
        posicion: "LI"
      },
      {
        tipo: "gol",
        minuto: "60'",
        equipo: "Protocolo Omega 4.0",
        jugador: "Heaven Heaton",
        asistente: null,
        resultado: "3-3"
      },
      {
        tipo: "gol",
        minuto: "70'",
        equipo: "Protocolo Omega 4.0",
        jugador: "Willow Proude",
        asistente: null,
        resultado: "3-4"
      },
      {
        tipo: "gol",
        minuto: "81'",
        equipo: "Raimon",
        jugador: "Renzu Itō",
        asistente: "Shinbad Ramírez",
        resultado: "4-4"
      },
      {
        tipo: "gol",
        minuto: "90'",
        equipo: "Raimon",
        jugador: "Renzu Itō",
        asistente: "Chisato Nishikigi",
        resultado: "5-4"
      },
      {
        tipo: "final",
        minuto: "90'",
        texto: "Final del partido"
      }
    ]
  }
];

const iconos = {
  gol: "⚽",
  cambio: "🔄",
  descanso: "⏸️",
  final: "🏁"
};

const historyScreen = document.getElementById("historyScreen");
const detailScreen = document.getElementById("detailScreen");
const backBtn = document.getElementById("backBtn");

const matchesGrid = document.getElementById("matchesGrid");
const searchInput = document.getElementById("searchInput");
const teamFilter = document.getElementById("teamFilter");

const detailCompetition = document.getElementById("detailCompetition");
const detailTitle = document.getElementById("detailTitle");
const detailInfo = document.getElementById("detailInfo");
const timeline = document.getElementById("timeline");

function getEquipo(partido, nombreEquipo) {
  if (partido.local.nombre === nombreEquipo) return partido.local;
  if (partido.visitante.nombre === nombreEquipo) return partido.visitante;
  return null;
}

function cargarEquipos() {
  const equipos = new Set();

  partidos.forEach(partido => {
    equipos.add(partido.local.nombre);
    equipos.add(partido.visitante.nombre);
  });

  equipos.forEach(equipo => {
    const option = document.createElement("option");
    option.value = equipo;
    option.textContent = equipo;
    teamFilter.appendChild(option);
  });
}

function renderPartidos() {
  const busqueda = searchInput.value.toLowerCase();
  const equipoSeleccionado = teamFilter.value;

  const filtrados = partidos.filter(partido => {
    const texto = `
      ${partido.local.nombre}
      ${partido.visitante.nombre}
      ${partido.competicion}
      ${partido.estadio}
      ${partido.fecha}
    `.toLowerCase();

    const coincideBusqueda = texto.includes(busqueda);

    const coincideEquipo =
      !equipoSeleccionado ||
      partido.local.nombre === equipoSeleccionado ||
      partido.visitante.nombre === equipoSeleccionado;

    return coincideBusqueda && coincideEquipo;
  });

  matchesGrid.innerHTML = "";

  filtrados.forEach(partido => {
    const card = document.createElement("article");
    card.className = "match-card";

    card.innerHTML = `
      <div class="match-top">
        <span>${partido.competicion}</span>
        <span>${partido.fecha}</span>
      </div>

      <div class="scoreboard visual-scoreboard">
        <div class="team-box">
          <img src="${partido.local.escudo}" alt="${partido.local.nombre}" class="team-crest">
          <div class="team">${partido.local.nombre}</div>
        </div>

        <div class="score">${partido.local.goles} - ${partido.visitante.goles}</div>

        <div class="team-box away">
          <img src="${partido.visitante.escudo}" alt="${partido.visitante.nombre}" class="team-crest">
          <div class="team away">${partido.visitante.nombre}</div>
        </div>
      </div>

      <div class="match-footer">
        ${partido.estadio}
        <br>
        <span class="badge">${partido.etiqueta}</span>
      </div>
    `;

    card.addEventListener("click", () => abrirDetalle(partido));
    matchesGrid.appendChild(card);
  });
}

function abrirDetalle(partido) {
  historyScreen.classList.remove("active");
  detailScreen.classList.add("active");

  detailCompetition.textContent = partido.competicion;
  detailTitle.textContent = `${partido.local.nombre} ${partido.local.goles} - ${partido.visitante.goles} ${partido.visitante.nombre}`;
  detailInfo.textContent = `${partido.fecha} · ${partido.estadio}`;

  timeline.innerHTML = "";

  partido.eventos.forEach(evento => {
    const item = document.createElement("div");

    if (evento.tipo === "descanso" || evento.tipo === "final") {
      item.className = `timeline-special ${evento.tipo}`;
      item.innerHTML = `
        <span>${iconos[evento.tipo]}</span>
        <strong>${evento.texto}</strong>
      `;
      timeline.appendChild(item);
      return;
    }

    const equipo = getEquipo(partido, evento.equipo);
    const esLocal = evento.equipo === partido.local.nombre;

    item.className = `timeline-event ${esLocal ? "local-event" : "away-event"}`;

    if (evento.tipo === "gol") {
      item.innerHTML = `
        <div class="event-minute">${evento.minuto}</div>

        <div class="event-crest">
          <img src="${equipo.escudo}" alt="${equipo.nombre}">
        </div>

        <div class="event-content">
          <div class="event-type">${iconos.gol} Gol de ${equipo.nombre}</div>
          <div class="event-main">${evento.jugador}</div>
          ${
            evento.asistente
              ? `<div class="event-assist">🦶 Asistencia: ${evento.asistente}</div>`
              : `<div class="event-assist no-assist">Sin asistencia registrada</div>`
          }
        </div>

        <div class="event-score">${evento.resultado}</div>
      `;
    }

    if (evento.tipo === "cambio") {
      item.innerHTML = `
        <div class="event-minute">${evento.minuto}</div>

        <div class="event-crest">
          <img src="${equipo.escudo}" alt="${equipo.nombre}">
        </div>

        <div class="event-content">
          <div class="event-type">${iconos.cambio} Cambio de ${equipo.nombre}</div>
          <div class="event-main">Entra ${evento.entra}</div>
          <div class="event-assist">Sale ${evento.sale} · ${evento.posicion}</div>
        </div>

        <div class="event-score">↔️</div>
      `;
    }

    timeline.appendChild(item);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function volverAlHistorial() {
  detailScreen.classList.remove("active");
  historyScreen.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

searchInput.addEventListener("input", renderPartidos);
teamFilter.addEventListener("change", renderPartidos);
backBtn.addEventListener("click", volverAlHistorial);

cargarEquipos();
renderPartidos();