/*
 * ═══════════════════════════════════════════════════════════════════════
 *  DATOS DE LAS CRÓNICAS DEL ROL — GUÍA RÁPIDA
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Este archivo es la fuente definitiva de las tres crónicas. La forma más
 * cómoda de añadir o editar una entrada es abrir cronica.html, utilizar
 * “Nueva entrada” y terminar pulsando “Guardar en el código”.
 *
 * PARA AÑADIR UNA ENTRADA A MANO:
 * 1. Copia un bloque comprendido entre { y }.
 * 2. Pégalo antes del corchete final de window.CRONICA_EVENTS.
 * 3. Separa los bloques con una coma y utiliza un id diferente.
 *
 * Campos principales:
 * universe: “General”, “Inazuma Eleven”, “Dragon Ball” o “Pokémon”.
 * type: “Sesión”, “Combate”, “Misión”, “Relación”, “Nacimiento”,
 *       “Transformación”, “Descubrimiento”, “Partido”, “Torneo” u “Otro”.
 * status: “Completado”, “En curso” o “Pendiente”.
 * characters: lista de nombres entre corchetes y comillas.
 * favorite: true para destacar; false para una entrada normal.
 * related: ruta de otra página o "" si no existe.
 *
 * IMPORTANTE: no borres “window.CRONICA_EVENTS = [” ni el “];” final.
 */
window.CRONICA_EVENTS = [
  {
    "id": "demo-1",
    "title": "Ejemplo — Comienza un nuevo arco",
    "date": "2026-07-20",
    "roleDate": "Capítulo 1",
    "universe": "General",
    "type": "Sesión",
    "arc": "El eco de una nueva historia",
    "status": "En curso",
    "characters": [
      "Personaje A",
      "Personaje B"
    ],
    "location": "Punto de encuentro",
    "summary": "Los protagonistas reciben la primera pista y descubren que sus historias están conectadas.",
    "consequences": "Queda abierta una misión principal y dos personajes pasan a colaborar.",
    "related": "personajes.html",
    "favorite": true,
    "demo": true,
    "createdAt": 1
  },
  {
    "id": "demo-2",
    "title": "Ejemplo — Partido decisivo",
    "date": "2026-07-17",
    "roleDate": "Jornada 6",
    "universe": "Inazuma Eleven",
    "type": "Partido",
    "arc": "Camino al campeonato",
    "status": "Completado",
    "characters": [
      "Capitán del equipo",
      "Rival principal"
    ],
    "location": "Estadio central",
    "summary": "El equipo cambia de estrategia en la segunda parte y logra remontar un encuentro que parecía perdido.",
    "consequences": "Nueva formación disponible y rivalidad reforzada.",
    "related": "historial/historialpartidos.html",
    "favorite": false,
    "demo": true,
    "createdAt": 2
  },
  {
    "id": "demo-4",
    "title": "Ejemplo — Hallazgo en Etruria",
    "date": "2026-07-05",
    "roleDate": "Día 12 de expedición",
    "universe": "Pokémon",
    "type": "Descubrimiento",
    "arc": "Secretos de Etruria",
    "status": "En curso",
    "characters": [
      "Entrenadora",
      "Pokémon compañero"
    ],
    "location": "Ruinas del norte",
    "summary": "El grupo encuentra una inscripción relacionada con el origen de la región y marca una nueva zona en el mapa.",
    "consequences": "Se desbloquea una localización y queda pendiente descifrar el símbolo central.",
    "related": "Pokemon/mapa etruria.html",
    "favorite": false,
    "demo": true,
    "createdAt": 4
  },
  {
    "id": "event-1785110680857",
    "title": "La llegada de una joven misteriosa.",
    "date": "2026-07-26",
    "roleDate": "Día 27 de julio del 2781",
    "universe": "Dragon Ball",
    "type": "Descubrimiento",
    "arc": "Saga de los Saiyans del Futuro",
    "status": "En curso",
    "characters": [
      "Thalia del Futuro",
      "Ares",
      "Tao",
      "Thalia",
      "Kamin",
      "Oren",
      "Kamioren"
    ],
    "location": "Ciudad de Tsukikage",
    "related": "parejasdragonball.html",
    "summary": "Tras la vuelta de la amenzada de Kamioren, justo tras su gran nueva transformación de Kamioren Full Power, una joven de pelo largo y color verde se persona delante del gran monstruo para propinarle una gran paliza y revelar a todos qué es la hija del mayor de los Kane.\n\nTras ello, advierte del lúgubre futuro que les espera si no entrenan antes de 3 años. Advierten también de la peligrosidad de la salud de Freyja.",
    "consequences": "Advertidos de la amenaza de los saiyans que llegarán en el futuro. Tienen que entrenar ardúamente durante 3 años si quieren evitar que esta línea temporal corra el mismo destino que la de Thalia del futuro.",
    "favorite": true,
    "demo": false,
    "createdAt": 1785110680857
  }
];
