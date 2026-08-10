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
    id: "battle",
    short: "BATALLA",
    name: "Radio Batalla",
    frequency: "101.3",
    host: "DJ Brezo",
    show: "Kilómetros de aventura",
    description: "Música digna de una batalla sin precedentes.",
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
  {
    character: "Link Ordon",
    characterFace: "img/Link.png",
    lore: "Un joven de orejas puntiagudas que se aventura en Etruria en busca de su destino.",
    tracks: [
      {
        songTitle: "Let's Go!",
        songDescription: "Las notas bajas te invitan a explorar y combatir.",
        songCover: "img/LinkCover.png",
        audio: "audio/Let'sGo.mp3",
        station: "battle",
        challengeText: "Entrenador {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "Esta canción representa el espíritu combativo de Link."
      },
      {
        songTitle: "Rise, Hero",
        songDescription: "Notas como todo se viene abajo, es la determinación del que fue campeón una vez.",
        songCover: "img/Link2Cover.png",
        audio: "audio/Rise, Hero.mp3",
        station: "battle",
        challengeText: "Campeón de Hyrule {character} te desafía.",
        tags: ["aventura", "batalla", "boss"],
        lore: "¿Escuchas eso? Es la llamada de un pueblo pidiendo ayuda a su héroe."
      },
    ]
  }
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
        challengeText: "Entrenador {character} te desafía.",
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
    challengeText: track.challengeText ?? character.challengeText ?? "",
    characterIndex,
    trackIndex
  }))
);

window.ETRURIA_RADIO_DATA = { stations, characters, soundtracks };
