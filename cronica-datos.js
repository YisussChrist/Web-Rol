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
  },
  {
    "id": "event-1785270324958",
    "title": "La electricidad se vence con esmero.",
    "date": "2026-06-03",
    "roleDate": "3 de Junio del 2026",
    "universe": "Pokémon",
    "type": "Combate",
    "arc": "Saga de los Gimnasios",
    "status": "Completado",
    "characters": [
      "Mogari",
      "Mencía",
      "Shin Haein",
      "Matis",
      "Ciel"
    ],
    "location": "Villa Arcanum",
    "related": "",
    "summary": "Varios de los protagonistas vencen con creces a Ciel y obtienen así la Medalla Centella del gimnasio de Villa Arcanum",
    "consequences": "",
    "favorite": false,
    "demo": false,
    "createdAt": 1785270324958
  }
];
