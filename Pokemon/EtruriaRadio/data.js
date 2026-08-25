/*
 * CATÁLOGO DE ETRURIA RADIO
 *
 * 1. Guarda las canciones en audio/ y las portadas en img/.
 * 2. Copia el bloque de ejemplo que aparece más abajo.
 * 3. Usa una de estas emisoras: battle, city, league o mystery.
 *
 * El formato es compatible con la organización del Resonance original:
 * personaje -> canciones. La página crea la lista completa automáticamente.
 */

(() => {
'use strict';

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
  },
  {
    character: "Shin Haein",
    characterFace: "img/Shin Haein.jpg",
    lore: "Una jóven cantante con un talento innato para la música.",
    tracks: [
      {
        songTitle: "Makin' Noise",
        songDescription: "La energía de una joven cantante que llena el aire con su música.",
        songCover: "img/ShinHaeinCover.png",
        audio: "audio/Makin' Noise.mp3",
        station: "battle",
        challengeText: "Entrenadora {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "El ruido solo se combate con más ruido."
      },
    ]
  },
  {
    character: "Serena Vaniville",
    characterFace: "img/Serena.jpg",
    lore: "La precios figura de una coordinadora de batalla.",
    tracks: [
      {
        songTitle: "Starlight Showdown",
        songDescription: "Una intensa batalla bajo la luz de las estrellas.",
        songCover: "img/SerenaCover.png",
        audio: "audio/Starlight Showdown.mp3",
        station: "battle",
        challengeText: "Entrenadora {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "Brilla tanto que es complicado de ignorar."
      },
      {
        songTitle: "The Final Performance",
        songDescription: "Ninguna concursante llega al estrellato sin una última actuación.",
        songCover: "img/Serena2Cover.png",
        audio: "audio/The Last Performance.mp3",
        station: "battle",
        challengeText: "Virtuosa {character} te desafía.",
        tags: ["aventura", "batalla", "épico", "boss"],
        lore: "Una última actuación para alcanzar las estrellas."
      }
    ]
  },
  {
    character: "Matis Hugh",
    characterFace: "img/MatisHugh.jpg",
    lore: "El joven entrenador que lucha por la libertad de los Pokémon.",
    tracks: [
      {
        songTitle: "Bond",
        songDescription: "La libertad no tiene precio.",
        songCover: "img/MatisCover.png",
        audio: "audio/Bond.mp3",
        station: "battle",
        challengeText: "Entrenador {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "No podemos impedir que la libertad se expanda."
      },
    ]
  },
  {
    character: "Pyra Magnum",
    characterFace: "img/Pyra.jpg",
    lore: "Una joven exploradora que le encanta vivir aventuras.",
    tracks: [
      {
        songTitle: "Smiling Fighter",
        songDescription: "No puedes hacer nada contra alguien que nunca se rinde.",
        songCover: "img/PyraCover.png",
        audio: "audio/Smiling Fighter.mp3",
        station: "battle",
        challengeText: "Entrenadora {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "Es la propia pasión de las aventuras."
      },
    ]
  },
  {
    character: "Justin Kaido",
    characterFace: "img/Justin.jpg",
    lore: "El emperador de los Pokémon no dará tregua.",
    tracks: [
      {
        songTitle: "The Emperor Pokemon",
        songDescription: "Todo emperador vela por la gloria de su pueblo.",
        songCover: "img/JustinCover.png",
        audio: "audio/The Emperor Pokemon.mp3",
        station: "battle",
        challengeText: "Entrenadora {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "No se detendrá hasta que la victoria esté asegurada."
      },
    ]
  },
  {
    character: "Mencía Scarlet",
    characterFace: "img/Mencia.jpg",
    lore: "Una chica que AMA las batallas.",
    tracks: [
      {
        songTitle: "Bond by Trust",
        songDescription: "La unión hace la fuerza, nunca mejor dicho.",
        songCover: "img/MenciaCover.png",
        audio: "audio/Bond by Trust.mp3",
        station: "battle",
        challengeText: "Entrenadora {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "Es indescriptible decir cuán fuerte es."
      },
      {
        songTitle: "Unbreakable Bonds",
        songDescription: "No hay vuelta atrás, está dispuesta a luchar hasta el final.",
        songCover: "img/Mencia2Cover.png",
        audio: "audio/Unbreakable Bonds.mp3",
        station: "battle",
        challengeText: "Aspirante {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "No sabe qué pasará, lo que sí sabe es que lo va a dar todo."
      }
    ]
  },
  {
    character: "Mogari Shishikuno",
    characterFace: "img/Mogari.jpg",
    lore: "El Heredero de una famosa cadena de ¿gastronomía?.",
    tracks: [
      {
        songTitle: "Hidden in Plain Sight",
        songDescription: "A simple vista no parece nada sospechoso.",
        songCover: "img/MogariCover.png",
        audio: "audio/Hidden in Plain Sight.mp3",
        station: "battle",
        challengeText: "Entrenador {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "No sabemos que esconde, pero no parece sospechoso."
      },
      {
        songTitle: "One Last Stand Together",
        songDescription: "Texto corto que aparecerá en la radio.",
        songCover: "img/Mogari2Cover.png",
        audio: "audio/One Last Stand Together.mp3",
        station: "battle",
        challengeText: "Heredero {character} te desafía.",
        tags: ["aventura", "ruta"],
        lore: "Esto no debería haber sucedido así..."
      }
    ]
  },
  {
    character: "Gama Sazare",
    characterFace: "img/Gama.jpg",
    lore: "La joven nómada que inmortaliza todo.",
    tracks: [
      {
        songTitle: "Capured Memories",
        songDescription: "Nada se pierde si lo inmortalizas en el tiempo.",
        songCover: "img/GamaCover.png",
        audio: "audio/Captured Memories.mp3",
        station: "battle",
        challengeText: "Entrenadora {character} te desafía.",
        tags: ["aventura", "batalla"],
        lore: "Quedarás inmortalizado en su sonrisa."
      },
      {
        songTitle: "Forever in Our Hearts",
        songDescription: "Nadie morirá mientras permanezcan en nuestros recuerdos.",
        songCover: "img/Gama2Cover.png",
        audio: "audio/Forever in Our Hearts.mp3",
        station: "battle",
        challengeText: "Cronista {character} te desafía.",
        tags: ["aventura", "batalla", "boss"],
        lore: "La necesidad imperativa de salvaguardar los recuerdos."
      }

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
        station: "battle",
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
})();
