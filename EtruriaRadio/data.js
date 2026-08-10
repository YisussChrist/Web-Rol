/*
 * CATÁLOGO DE ETRURIA RADIO
 *
 * 1. Guarda las canciones en audio/ y las portadas en img/.
 * 2. Copia el bloque de ejemplo que aparece más abajo.
 * 3. Usa una de estas emisoras: route, city, league o mystery.
 *
 * El formato es compatible con la organización del Resonance original:
 * personaje -> canciones. La página crea la lista completa automáticamente.
 */

const stations = [
  {
    id: "route",
    short: "RUTA",
    name: "Radio Ruta",
    frequency: "101.3",
    host: "DJ Brezo",
    show: "Kilómetros de aventura",
    description: "Música para entrenadores en camino, avisos de rutas y el tiempo en Etruria.",
    color: "#e3a83a",
    angle: -135
  },
  {
    id: "city",
    short: "CITY",
    name: "Ciudad Central",
    frequency: "88.7",
    host: "Vera & Rotom",
    show: "Etruria despierta",
    description: "Noticias, encuentros, encargos y rumores desde el corazón de la región.",
    color: "#df7158",
    angle: -45
  },
  {
    id: "league",
    short: "LIGA",
    name: "Liga Etruria",
    frequency: "94.6",
    host: "Marco Drago",
    show: "Combate estelar",
    description: "Resultados, análisis de gimnasios y retransmisiones de los grandes combates.",
    color: "#568ac4",
    angle: 45
  },
  {
    id: "mystery",
    short: "???",
    name: "Señal Arcana",
    frequency: "77.9",
    host: "Origen desconocido",
    show: "Ecos bajo la niebla",
    description: "Una transmisión irregular relacionada con ruinas, leyendas y señales extrañas.",
    color: "#9a74b8",
    angle: 135
  }
];

const characters = [
  /*
  {
    character: "Nombre del entrenador o personaje",
    characterFace: "img/personaje.png",
    lore: "Descripción general del personaje.",
    tracks: [
      {
        songTitle: "Título de la canción",
        songDescription: "Texto corto que aparecerá en la radio.",
        songCover: "img/portada.png",
        audio: "audio/cancion.mp3",
        station: "route",
        tags: ["aventura", "ruta"],
        lore: "Descripción larga opcional de la canción."
      }
    ]
  }
  */
];

const soundtracks = characters.flatMap((character, characterIndex) =>
  (character.tracks || []).map((track, trackIndex) => ({
    ...track,
    character: character.character,
    characterFace: character.characterFace,
    characterLore: character.lore,
    characterIndex,
    trackIndex
  }))
);

window.ETRURIA_RADIO_DATA = { stations, characters, soundtracks };
