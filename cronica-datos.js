/*
 * ═══════════════════════════════════════════════════════════════════════
 *  DATOS DE LAS CRÓNICAS DEL ROL — GUÍA RÁPIDA
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Este archivo es la fuente definitiva de las tres crónicas. La forma más
 * cómoda de añadir o editar una entrada es abrir cronica.html, utilizar
 * “Nueva entrada” y terminar pulsando “Guardar en el código”.
 *
 * TAMBIÉN PUEDES AÑADIR UNA ENTRADA A MANO:
 *
 * 1. Copia uno de los bloques comprendidos entre { y }.
 * 2. Pégalo antes del corchete final de window.CRONICA_EVENTS.
 * 3. Separa los bloques con una coma.
 * 4. Cambia el id: cada entrada debe tener uno diferente.
 * 5. Guarda el archivo y vuelve a cargar cronica.html.
 *
 * PLANTILLA PARA COPIAR (está comentada y no aparece en la web):
 *
 * {
 *   "id": "inazuma-partido-001",
 *   "title": "Título del acontecimiento",
 *   "date": "2026-07-25",
 *   "roleDate": "Jornada 8",
 *   "universe": "Inazuma Eleven",
 *   "type": "Partido",
 *   "arc": "Nombre del arco o temporada",
 *   "status": "En curso",
 *   "characters": ["Personaje uno", "Personaje dos"],
 *   "location": "Lugar del acontecimiento",
 *   "summary": "Qué ocurrió.",
 *   "consequences": "Consecuencias y asuntos pendientes.",
 *   "related": "calendario.html",
 *   "favorite": false,
 *   "demo": false,
 *   "createdAt": 1784991004000
 * }
 *
 * VALORES RECONOCIDOS:
 *
 * universe: “General”, “Inazuma Eleven”, “Dragon Ball” o “Pokémon”.
 * type: “Sesión”, “Combate”, “Misión”, “Relación”, “Nacimiento”,
 *       “Transformación”, “Descubrimiento”, “Partido”, “Torneo” u “Otro”.
 * status: “Completado”, “En curso” o “Pendiente”.
 * characters: siempre entre corchetes; cada nombre entre comillas.
 * favorite: true para destacar la entrada; false para una entrada normal.
 * related: ruta de otra página de la web o "" si no hay ninguna.
 * createdAt: número usado para ordenar empates; puedes usar Date.now() desde
 *            la consola o copiar uno existente y cambiar sus últimas cifras.
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
    "characters": ["Personaje A", "Personaje B"],
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
    "characters": ["Capitán del equipo", "Rival principal"],
    "location": "Estadio central",
    "summary": "El equipo cambia de estrategia en la segunda parte y logra remontar un encuentro que parecía perdido.",
    "consequences": "Nueva formación disponible y rivalidad reforzada.",
    "related": "historial/historialpartidos.html",
    "favorite": false,
    "demo": true,
    "createdAt": 2
  },
  {
    "id": "demo-3",
    "title": "Ejemplo — Transformación inesperada",
    "date": "2026-07-12",
    "roleDate": "Día 43",
    "universe": "Dragon Ball",
    "type": "Transformación",
    "arc": "La amenaza del vacío",
    "status": "Completado",
    "characters": ["Guerrero protagonista"],
    "location": "Planeta remoto",
    "summary": "Una situación límite despierta una transformación que todavía no puede controlarse por completo.",
    "consequences": "Aumenta el nivel de poder, pero aparece un coste físico pendiente de investigar.",
    "related": "transformacionesdragonball.html",
    "favorite": true,
    "demo": true,
    "createdAt": 3
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
    "characters": ["Entrenadora", "Pokémon compañero"],
    "location": "Ruinas del norte",
    "summary": "El grupo encuentra una inscripción relacionada con el origen de la región y marca una nueva zona en el mapa.",
    "consequences": "Se desbloquea una localización y queda pendiente descifrar el símbolo central.",
    "related": "Pokemon/mapa etruria.html",
    "favorite": false,
    "demo": true,
    "createdAt": 4
  }
];
