    const PAGES = [
      { title: "Árbol Familiar", category: "Inazuma Eleven", emoji: "🌳", url: "Hijos Inazuma/index.html", description: "Linajes, hijos, familias y relaciones del universo Inazuma." },
      { title: "Posiciones", category: "Inazuma Eleven", emoji: "📍", url: "posiciones.html", description: "Organiza jugadores, roles, puestos y estructura de equipos.", status: "" },
      { title: "Team Builder", category: "Inazuma Eleven", emoji: "⚽", url: "plantillas_inazuma/plantillas-inazuma.html?v=7", description: "Centro táctico para crear alineaciones, analizar química, preparar partidos y exportar equipos.", status: "Renovado"},
      { title: "Inazuma Central", category: "Inazuma Eleven", emoji: "🏟️", url: "centro-inazuma.html?v=5", description: "Centro deportivo de jugadores, equipos, técnicas, estadísticas y temporada.", status: "Nuevo" },
      { title: "InaMarkt", category: "Inazuma Eleven", emoji: "📈", url: "InaMarkt/index.html", description: "Valores de mercado, rankings de jugadores, clubes y operaciones del fútbol Inazuma.", status: "Nuevo" },
      { title: "Raimon.com", category: "Inazuma Eleven", emoji: "📋", url: "estadísticas Inazuma/estadisticas.html", description: "La página donde se verán las stats de cada jugador.", status: "" },
      { title: "Inventario", category: "Inazuma Eleven", emoji: "📦", url: "sts/sts.html", description: "Aquí podrás ver toda la info en cuanto a STs, EGs y Mimiximax de todos los personajes.", status: ""},
      { title: "Calculadora de Precios", category: "Inazuma Eleven", emoji: "💶", url: "calculadora-precios.html", description: "Calculadora para determinar los precios de los artículos en el universo Inazuma.", status: ""},
      { title: "Historial de Partidos", category: "Inazuma Eleven", emoji: "📜", url: "historial/historialpartidos.html", description: "Registro de partidos, resultados y estadísticas de los equipos.", status: "" },

      { title: "Héroes", category: "Dragon Ball", emoji: "🦸", url: "heroes.html", description: "Registro de héroes, personajes y fichas del servidor Dragon Ball.", status: "" },
      { title: "Dragon Dex", category: "Dragon Ball", emoji: "🐲", url: "dragon-dex.html", description: "Centro unificado de guerreros, poder, transformaciones, linajes y sellos.", status: "Nuevo" },
      { title: "Poder", category: "Dragon Ball", emoji: "⚡", url: "poder.html", description: "Escalas, niveles de poder y referencias de fuerza.", status: "" },
      { title: "Árbol Familiar DB", category: "Dragon Ball", emoji: "🌳", url: "parejasdragonball.html", description: "Familias, parejas y descendencia del universo Dragon Ball.", status: "" },
      { title: "Transformaciones", category: "Dragon Ball", emoji: "🔺", url: "transformacionesdragonball.html?v=2", description: "Archivo de formas, rutas evolutivas, multiplicadores, poder y condiciones.", status: "Renovado" },
      { title: "Torneos", category: "Dragon Ball", emoji: "🏆", url: "torneos.html", description: "Generador de torneos simple. V16 combatientes.", status: "Sin terminar" },
      { title: "Fusiones", category: "Dragon Ball", emoji: "🔀", url: "fusiones.html", description: "Generador de nombres para fusiones con combinaciones aleatorias y personalizadas.", status: "" },
      { title: "Sellos de Tao", category: "Dragon Ball", emoji: "🌀", url: "sellos tao.html?v=2", description: "Expediente de los quince sellos, sus capacidades, riesgos y combinaciones.", status: "Renovado" },

      { title: "Entrenadores", category: "Pokémon", "emoji": "🪪", url: "Pokemon/index.html", description: "Expedientes de entrenadores, equipos actuales, medallas y progreso en la Liga.", status: "" },
      { title: "Mapa", category: "Pokémon", emoji: "🗺️", url: "Pokemon/mapa etruria.html", description: "Mapa interactivo de la región de Etruria.", status: "" },
      { title: "Datos", category: "Pokémon", emoji: "📊", url: "Pokemon/datos.html", description: "Buscador para conocer las stats y ataques Pokémon.", status: "" },
      { title: "Evolink", category: "Pokémon", emoji: "📱", url: "compromised/index.html", description: "Sistema Operativo desarrollado por el Instituto Infinte Y para los entrenadores de la Profesora Romaine.", status: "", disabled:true },
      { title: "PokéDamage Calculator", category: "Pokémon", emoji: "🧮", url: "Pokemon/dsadsa/index.html", description: "Una calculadora en construcción para calcular los daños de los Pokémon en competitivo", status: ""},

      { title: "Crónicas del Rol", category: "General", emoji: "⌛", url: "cronica.html", description: "Tres archivos narrativos con estilos propios para Inazuma, Dragon Ball y Pokémon.", status: "Restaurado" },
      { title: "Personajes", category: "General", emoji: "👤", url: "personajes.html", description: "Entrada general para fichas de personajes y datos de rol.", status: "" },
      { title: "Embarazos", category: "General", emoji: "🤰", url: "embarazos.html", description: "Seguimiento de embarazos, fechas y relaciones familiares.", status: "" },
      { title: "Códigos", category: "General", emoji: "💻", url: "Hub/index.html", description: "Hub para códigos..", status: "" },

      { title: "Bolos", category: "General", emoji: "🎳", url: "bolos.html", description: "Calculadora de una partida de bolos.", status: "Nuevo" },
      { title: "Clima", category: "General", emoji: "🌤️", url: "clima.html", description: "Página de clima y ambiente para escenas de rol.", status: "" },
      { title: "Resonance\u2122", category: "General", emoji: "🎵", url: "OST/index.html", description: "Soundtracks de batalla, temas de personajes y música de escena.", status: "" },
      { title: "Calendario Conectado", category: "General", emoji: "📆", url: "calendario.html", description: "Agenda de cumpleaños, aniversarios, sesiones y acontecimientos de los servidores.", status: "Nuevo" },
      { title: "Relaciones 2.0", category: "General", emoji: "💖", url: "relaciones.html", description: "Mapa narrativo de personajes, vínculos, estados y evolución de relaciones.", status: "Nuevo" },
      { title: "Series", category: "General", emoji: "🎥", url: "Series/series.html", description: "Cantidad de series que hemos visto y/o tenemos a medias.", status: "" },

      { title: "Juegos", category: "Minijuegos", emoji: "🎮", url: "juegos/index.html", description: "Centro de juegos de Web-Rol, con Duelo de Resonancia disponible como primera Beta.", status: "Beta" },
      { title: "Copero del Rol", category: "Minijuegos", emoji: "🏆", url: "juegos/copero/index.html", description: "Tres carreras narrativas inspiradas en Dragon Ball, Pokémon e Inazuma, conectadas con el lore de los servidores.", status: "Nuevo" },
      { title: "Equipo Ideal", category: "Minijuegos", emoji: "⚽", url: "juegos/equipo.html", description: "Construye un once con personajes del RP, asigna posiciones y guarda tu alineación.", status: "Nuevo" },
];

    /*
      CONFIGURACIÓN RÁPIDA
      - background: imagen de fondo para cada categoría.
      - color/accent2: color dominante del HUB al pasar por esa categoría.
      - La música ahora va TODA junta en HUB_PLAYLIST, no por página ni por categoría.
    */
    const CATEGORY_CONFIG = {
      "General": { color: "#a855f7", accent2: "#ec4899", background: "backgrounds/general.webp" },
      "Inazuma Eleven": { color: "#3b82f6", accent2: "#22d3ee", background: "backgrounds/inazuma.webp" },
      "Dragon Ball": { color: "#f97316", accent2: "#facc15", background: "backgrounds/dragonball.webp" },
      "Pokémon": { color: "#22c55e", accent2: "#38bdf8", background: "backgrounds/pokemon.webp" },
      "Minijuegos": { color: "#facc15", accent2: "#fb7185", background: "backgrounds/minijuegos.webp" }
    };

    /*
      Extras opcionales por página.
      Si quieres que una página concreta tenga música/fondo propio, ponlo aquí usando su title exacto.
      Ejemplo:
      "Poder": { background: "backgrounds/poder.webp", music: "music/db/poder.mp3", color: "#ff9800" }
    */
    const PAGE_EXTRAS = {
      "Poder": { background: "backgrounds/namek.png", color: "#ff9800", accent2: "#ffd54f" },
      "Mapa": { background: "backgrounds/etruria.webp", color: "#22c55e", accent2: "#38bdf8" },
      "Team Builder": { background: "backgrounds/IEW.jpg", color: "#3b82f6", accent2: "#22d3ee" },
      "Inventario": { background: "backgrounds/inventario.webp" },
      "Héroes": { background: "backgrounds/heroes.jpg", color: "#facc15", accent2: "#fb923c" }
    };


    /*
      PLAYLIST GLOBAL
      Mete aquí TODAS las canciones que quieras que tenga el HUB.
      No dependen de categoría ni de página.

      Ejemplo:
      { title: "Nombre visible", src: "music/cancion.mp3" }
    */
    const HUB_PLAYLIST = [
      { title: "Tema 1", src: "music/Chill DB 1h.mp3" },
      { title: "Tema 2", src: "music/Chill IE 30m.mp3" },
      { title: "Tema 3", src: "music/Chill PKM 1h.mp3" }
    ];

    const QUICK_LINK_TITLES = ["Dragon Dex", "Inazuma Central", "InaMarkt", "Calendario Conectado", "Inventario", "Personajes", "Árbol Familiar"];

    const quotes = [
        { text: "El fútbol no se juega solo con los pies. También se juega con lo que eres.", author: "RP Inazuma" },
      { text: "Solo sé que no sé nada.", author: "Sócrates" },
      { text: "El hombre está condenado a ser libre.", author: "Jean-Paul Sartre" },
      { text: "Lo que no me mata, me hace más fuerte.", author: "Friedrich Nietzsche" },
      { text: "Conócete a ti mismo.", author: "Templo de Delfos" },
      { text: "La vida es lo que pasa mientras estás ocupado haciendo otros planes.", author: "John Lennon" },
      { text: "El destino mezcla las cartas, pero nosotros jugamos la mano.", author: "Arthur Schopenhauer" },
      { text: "La paciencia es amarga, pero su fruto es dulce.", author: "Aristóteles" },
      { text: "Un héroe no es el que nunca cae, sino el que siempre se levanta.", author: "General" },
      { text: "El poder revela quién eres cuando nadie puede detenerte.", author: "General" },
      { text: "No hay gloria sin sacrificio.", author: "RP General" },
      { text: "Los débiles esperan oportunidades. Los fuertes las crean.", author: "RP" },
      { text: "Cada batalla perdida enseña algo que la victoria jamás podría.", author: "RP" },
      { text: "El verdadero enemigo no siempre está enfrente. A veces está dentro.", author: "General" },
      { text: "La voluntad es el arma más fuerte que existe.", author: "RP Dragon Ball" },
      { text: "Un linaje no se mide por su origen, sino por lo que decide proteger.", author: "Árbol Familiar" },
      { text: "Algunos nacen con poder, otros lo forjan.", author: "RP" },
      { text: "Quien controla su mente, controla su destino.", author: "Filosofía" },
      { text: "El miedo es natural. Rendirse es opcional.", author: "General" },
      { text: "No luches para ganar, lucha para no perder quién eres.", author: "RP Inazuma" },
      { text: "La historia recuerda a los que se atreven.", author: "General" },
      { text: "El fin justifica los medios.", author: "Maquiavelo" },
      { text: "Los hombres olvidan antes la muerte de su padre que la pérdida de su patrimonio.", author: "Maquiavelo" },
      { text: "Es mejor ser temido que amado, si no puedes ser ambos.", author: "Maquiavelo" },
      { text: "Quien desea obediencia debe saber mandar.", author: "Maquiavelo" },
      { text: "La fortuna favorece a los audaces.", author: "Virgilio" },
      { text: "Pienso, luego existo.", author: "René Descartes" },
      { text: "El hombre que mueve montañas empieza apartando pequeñas piedras.", author: "Confucio" },
      { text: "La libertad no es hacer lo que quieras, sino no tener que hacer lo que no quieres.", author: "Jean-Jacques Rousseau" },
      { text: "Aquel que tiene un porqué para vivir puede soportar casi cualquier cómo.", author: "Nietzsche" },
      { text: "La guerra es la continuación de la política por otros medios.", author: "Clausewitz" },
      { text: "Y el universo te dijo: Te quiero.", author: "Minecraft" },
      { text: "Eres más fuerte de lo que crees.", author: "Minecraft" },
      { text: "El único límite es tu propia imaginación.", author: "Minecraft" },
      { text: "Después de todo, sigues siendo tú.", author: "Undertale", meaning: "Aunque cambies, falles o te rompas un poco por el camino, sigues conservando tu identidad más profunda: tú." },
      { text: "Determinación.", author: "Undertale" },
      { text: "Hace un día hermoso, los pájaros cantan, las flores florecen.", author: "Sans" },
      { text: "En este mundo, es matar o ser asesinado.", author: "Undertale" },
      { text: "El hombre es libre en el momento en que desea serlo.", author: "Voltaire" },
      { text: "La vida debe ser comprendida hacia atrás, pero debe ser vivida hacia adelante.", author: "Kierkegaard" },
      { text: "¿Qué es un hombre, sino la suma de sus decisiones?", author: "Filosofía" },
      { text: "No temo a la muerte, temo no haber vivido.", author: "Marco Aurelio" },
      { text: "Quien mira hacia afuera sueña, quien mira hacia adentro despierta.", author: "Carl Jung" },
      { text: "La duda es el origen de la sabiduría.", author: "Descartes" },
      { text: "¿Quién eres cuando nadie te está mirando?", author: "General" },
      { text: "Cada decisión crea un camino que no volverá a existir.", author: "General" },
      { text: "¿Y si todo lo que recuerdas no fuera toda la historia?", author: "General" },
      { text: "¿Hasta dónde llegarías por aquello que quieres proteger?", author: "General" },
      { text: "Mantente con determinación.", author: "Undertale" },
      { text: "Don't forget.", author: "Undertale" },
      { text: "¿Es este el mundo que has elegido?", author: "Minecraft" },
      { text: "La guerra nunca cambia.", author: "Fallout" },
      { text: "¿Qué es mejor? ¿Nacer bueno, o superar tu naturaleza malvada?", author: "Skyrim" },
      { text: "El hombre correcto en el lugar equivocado puede marcar la diferencia en el mundo.", author: "Half-Life" },
      { text: "Ningún precio es demasiado alto.", author: "Hollow Knight" },
      { text: "¿Recuerdas quién querías ser?", author: "General" },
      { text: "Toda historia necesita alguien que se niegue a rendirse.", author: "General" },
      { text: "No todos los finales son el final.", author: "General" },
      { text: "But it refused.", author: "Undertale", meaning: "No te rindas." },
      { text: "¿Alguien de verdad lee esto?", author: "Minecraft" },
      { text: "El hombre sufre porque se toma en serio lo que los dioses hicieron para divertirse.", author: "Alan Watts" },
      { text: "Nada es verdad, todo está permitido.", author: "Assassin's Creed" },
      { text: "No puedes cambiar el pasado, pero puedes aprender de él.", author: "General" },
      { text: "El tiempo que disfrutas perder no es tiempo perdido.", author: "John Lennon" },
      { text: "El sabio no dice todo lo que piensa, pero siempre piensa todo lo que dice.", author: "Aristóteles" },
      { text: "La realidad es aquello que, cuando dejas de creer en ella, sigue ahí.", author: "Philip K. Dick" },
      { text: "Todo lo que somos es el resultado de lo que hemos pensado.", author: "Buda" },
      { text: "No hay mejor victoria que vencerse a sí mismo.", author: "Platón" },
      { text: "¿Y si el verdadero enemigo siempre fuiste tú?", author: "General" },
      { text: "El silencio también es una respuesta.", author: "General" },
      { text: "El mundo no cambia solo. Alguien decide cambiarlo.", author: "General" },
      { text: "Cada jugador cree que es el protagonista.", author: "General" },
      { text: "No todo el que camina está perdido.", author: "J.R.R. Tolkien" },
      { text: "Las decisiones pequeñas crean futuros enormes.", author: "General" },
      { text: "El universo no tiene obligación de tener sentido para ti.", author: "Neil deGrasse Tyson" },
      { text: "¿Cuántas veces puedes empezar de nuevo?", author: "General" },
      { text: "La esperanza es lo último que se pierde.", author: "General" },
      { text: "No puedes salvar a todo el mundo.", author: "General" },
      { text: "El mundo siempre seguirá hacia adelante, contigo o sin ti.", author: "General" },
      { text: "Despierta.", author: "General" },
      { text: "El viaje importa más que el destino.", author: "Filosofía" },
      { text: "La voluntad es capaz de cambiar el resultado.", author: "General" },
      { text: "A veces, incluso el héroe duda.", author: "General" },
      { text: "No todo está escrito.", author: "General" },
      { text: "El final depende de lo que hagas ahora.", author: "General" },
      { text: "¿Elegiste este camino, o fue el camino quien te eligió a ti?", author: "General" },
      { text: "Sigue adelante.", author: "Undertale" },
      { text: "El jugador siempre vuelve.", author: "Minecraft" },
      { text: "O mueres como un héroe, o vives lo suficiente para convertirte en un villano.", author: "El Caballero Oscuro" },
      { text: "Un gran poder conlleva una gran responsabilidad.", author: "Tío Ben" },
      { text: "Un héroe puede ser cualquiera, incluso alguien que hace algo tan simple como ponerse un abrigo para que un niño no tenga frío.", author: "Batman" },
      { text: "La libertad es el derecho de todos los seres conscientes.", author: "Optimus Prime" },
      { text: "La esperanza es lo que nos hace fuertes.", author: "Spider-Man" },
      { text: "Incluso la persona más pequeña puede cambiar el curso del futuro.", author: "El Señor de los Anillos" },
      { text: "El mundo no es perfecto, pero está ahí para nosotros, intentando lo mejor que puede.", author: "Fullmetal Alchemist" },
      { text: "Levántate y avanza. Tienes dos piernas y un corazón.", author: "Edward Elric" },
      { text: "La gente muere cuando se la olvida.", author: "One Piece" },
      { text: "Si no puedes hacer algo, entonces no lo hagas. Concéntrate en lo que sí puedes.", author: "Attack on Titan" },
      { text: "El dolor es inevitable, el sufrimiento es opcional.", author: "Buda" },
      { text: "El infierno está vacío, todos los demonios están aquí.", author: "Shakespeare" },
      { text: "La vida no es cuestión de encontrarse, sino de crearse.", author: "George Bernard Shaw" },
      { text: "El hombre que teme sufrir, ya sufre por lo que teme.", author: "Montaigne" },
      { text: "No importa lo lento que vayas, siempre que no te detengas.", author: "Confucio" },
      { text: "La verdadera derrota es rendirse.", author: "General" },
      { text: "El pasado puede doler; puedes aprender de él o huir.", author: "El Rey León" },
      { text: "El verdadero poder está en la voluntad.", author: "Dragon Ball" },
      { text: "No todos los que luchan son héroes, pero todos los héroes luchan.", author: "General" },
      { text: "Nada dura para siempre, y por eso tiene valor.", author: "General" },
      { text: "Solo con el corazón se puede ver bien; lo esencial es invisible para los ojos.", author: "El Principito" },
      { text: "Fue el tiempo que pasaste con tu rosa lo que la hizo tan importante.", author: "El Principito" },
      { text: "Todos los adultos fueron una vez niños, pero muy pocos lo recuerdan.", author: "El Principito" },
      { text: "Es mucho más difícil juzgarse a sí mismo que juzgar a los demás.", author: "El Principito" },
      { text: "Lo que embellece al desierto es que en alguna parte se esconde un pozo.", author: "El Principito" },
      { text: "Avanzar da miedo porque no hay excusas.", author: "Celeste", meaning: "Mientras no avanzas, puedes culpar al mundo. Cuando avanzas, la responsabilidad es tuya." },
      { text: "Da igual cuán oscuro sea el camino, siempre habrá alguien dispuesto a caminar contigo.", author: "Final Fantasy XV", meaning: "Nos recuerda el valor de la amistad y el apoyo mutuo." },
      { text: "Un hombre elige, un esclavo obedece.", author: "BioShock", meaning: "La libertad no está en hacer lo que te dicen, sino en cuestionar y decidir por ti mismo." },
      { text: "Al activar los trucos, desactivas los logros.", author: "Minecraft", meaning: "El camino fácil no siempre dará recompensas." },
      { text: "Cada bloque cuenta en el camino hacia tus sueños.", author: "Minecraft", meaning: "Por insignificante que parezca, cada bloque sirve para crear algo más grande a futuro." },
      { text: "No siempre necesitas una antorcha para iluminar la cueva; también hay otras maneras de encontrar luz.", author: "Minecraft", meaning: "Aunque una opción parezca la más obvia, no siempre es la única ni la mejor." },
      { text: "Es fácil confundir lapislázuli con diamantes; son parecidos, pero su valor es muy diferente.", author: "Minecraft", meaning: "No te dejes engañar por las apariencias en el amor." },
      { text: "¡Si mueres en Modo Hardcore, no podrás volver a jugar!", author: "Minecraft", meaning: "Considera tus acciones y sus consecuencias." },
      { text: "Si caminas solo, llegarás más rápido; si caminas acompañado, llegarás más lejos.", author: "Minecraft", meaning: "La soledad da agilidad, pero el apoyo te lleva más lejos." },
      { text: "¡Cuanto más desciendas, más común se vuelve el diamante!", author: "Minecraft", meaning: "Esa persona no es la única que existe; si buscas, encontrarás tesoros mejores." },
      { text: "Cuidado al entrar en una cueva: puede que encuentres la entrada, pero no la salida.", author: "Minecraft", meaning: "Adentrarse en tus pensamientos es fácil; salir de ellos no tanto." },
      { text: "El Creeper fue un error y ahora es un icono internacional.", author: "Minecraft", meaning: "A veces hasta un error puede beneficiarte y enseñar." },
      { text: "¡Si cavas hacia abajo puedes caer en la lava!", author: "Minecraft", meaning: "Actuar sin precaución puede acarrear problemas inesperados." },
      { text: "Maravillas infinitas, posibilidades infinitas.", author: "Minecraft", meaning: "El mundo está lleno de oportunidades esperando ser exploradas." },
      { text: "No todo lo que brilla es oro.", author: "Minecraft", meaning: "No te dejes engañar por la apariencia de alguien o algo." },
      { text: "No destruyas tu mundo por un mal momento.", author: "Minecraft", meaning: "No tomes decisiones en momentos de ira, impotencia o tristeza." },
      { text: "Hay muchas pociones; usa la que más necesites.", author: "Minecraft", meaning: "Hay muchas maneras de sanar; usa la más útil para ti." },
      { text: "No explores un barco por segunda vez si ya sabes que no hay nada.", author: "Minecraft", meaning: "Busca nuevas oportunidades y no te encierres donde ya viste que no había nada." },
      { text: "Si tus amigos no se pueden unir a tu mundo, puede deberse a que no están en la versión adecuada.", author: "Minecraft", meaning: "La compatibilidad también importa en las amistades." },
      { text: "Las mejores librerías siempre ofrecen los mejores libros.", author: "Minecraft", meaning: "Rodearte de buenas personas puede beneficiarte mucho." },
      { text: "¡No construyas sobre arena movediza!", author: "Minecraft", meaning: "Establece una base sólida antes de actuar o emprender." },
      { text: "¿Quieres eliminar tu mundo? ¡Lo perderás para siempre! (Es muchísimo tiempo).", author: "Minecraft", meaning: "Tus acciones a veces no tienen retorno." },
      { text: "Besa el cielo.", author: "Minecraft", meaning: "Sé ambicioso; persigue tus sueños." },
      { text: "No dejes árboles flotando.", author: "Minecraft", meaning: "No dejes nada a medias; termina lo que empezaste." },
      { text: "Dale amor a un hombre y cambiará la corona por un beso.", author: "Maquiavelo" },
      { text: "Aquello que ya fue tuyo podrás recuperarlo de un zarpazo.", author: "Maquiavelo" },
      { text: "Nunca dejé de amarla, pero quizás, la noche que me fui la quise más que nunca.", author: "Fiódor Dostoyevski" },
      { text: "Aplasta por completo a tus enemigos o prepárate para ser aniquilado.", author: "Robert Greene" },
      { text: "Un mendigo sano siempre será más feliz que un rey enfermo.", author: "Arthur Schopenhauer" },
      { text: "Es precisamente porque te amo, que te atormento.", author: "Fiódor Dostoyevski" },
      { text: "Si juegas limpio en un mundo de tramposos estás condenado a perder.", author: "Maquiavelo" },
      { text: "Siempre hay tragedia en las amistades temidas por el romance.", author: "Oscar Wilde" },
      { text: "El egoísmo no tiene moral, tiene dueño.", author: "Nietzsche" },
      { text: "No tienes enemigos, nadie tiene enemigos.", author: "Vinland Saga" },
      { text: "Hay sentimientos tan profundos, que recuerdan a la infinidad del universo.", author: "General" },
      { text: "Solo el diablo sabe el precio de querer cuando te conviene.", author: "Fiódor Dostoyevski" },
      { text: "Prefiero traicionar al mundo entero, antes de que el mundo me traicione a mí.", author: "Cao Cao" },
      { text: "No destruyas lo que otros construyeron; demuestra que puedes superarlo.", author: "Alejandro Magno" },
      { text: "No recites poemas para quien no es poeta.", author: "Clásico budista" },
      { text: "Afronta cada acción como si fuera la última y lo lograrás.", author: "Marco Aurelio" },
      { text: "Incluso cuando me critican, tengo mi cuota de fama.", author: "Pietro Aretino" },
      { text: "Podrán matarme, pero no hacerme daño.", author: "General" },
      { text: "Yo seré el bruto de los reyes y el César de la república.", author: "Napoleón Bonaparte" },
      {
    text: "Sabemos lo que somos, pero no lo que podemos llegar a ser.",
    author: "William Shakespeare",
    meaning: "Nuestro potencial siempre es mayor de lo que creemos."
},
{
    text: "El cobarde muere muchas veces antes de su muerte; el valiente solo prueba la muerte una vez.",
    author: "William Shakespeare",
    meaning: "El miedo hace sufrir mucho antes de que ocurra el verdadero peligro."
},
{
    text: "No hay oscuridad más grande que la ignorancia.",
    author: "William Shakespeare",
    meaning: "La falta de conocimiento puede ser más peligrosa que cualquier enemigo."
},
{
    text: "Amamos no por encontrar a la persona perfecta, sino por aprender a ver perfectamente a una persona imperfecta.",
    author: "William Shakespeare",
    meaning: "El amor consiste en aceptar las imperfecciones del otro."
},
{
    text: "El tiempo descubre la verdad.",
    author: "William Shakespeare",
    meaning: "Tarde o temprano, todo acaba saliendo a la luz."
},
{
    text: "Nuestras dudas son traidoras y nos hacen perder el bien que podríamos ganar por miedo a intentarlo.",
    author: "William Shakespeare",
    meaning: "La inseguridad suele robarnos oportunidades."
},
{
    text: "El destino decide quién entra en tu vida, pero tú decides quién se queda.",
    author: "William Shakespeare",
    meaning: "No puedes controlar a quién conoces, pero sí a quién conservas."
},
{
    text: "Escucha a muchos, habla con pocos.",
    author: "William Shakespeare",
    meaning: "Aprende de todos, pero no reveles tus pensamientos a cualquiera."
},
{
    text: "El amor mira con el alma y no con los ojos.",
    author: "William Shakespeare",
    meaning: "Las personas valiosas se conocen por lo que son, no por su apariencia."
},
{
    text: "El que asciende demasiado deprisa, cae con la misma rapidez.",
    author: "William Shakespeare",
    meaning: "Los éxitos sin una base sólida suelen durar poco."
},
{
    text: "Las cosas malas que hacen los hombres sobreviven a ellos; las buenas suelen ser enterradas con sus huesos.",
    author: "William Shakespeare",
    meaning: "La gente recuerda más fácilmente los errores que las buenas acciones."
},
{
    text: "La conciencia nos convierte a todos en cobardes.",
    author: "William Shakespeare",
    meaning: "Pensar demasiado puede impedirnos actuar."
},
{
    text: "No existe legado más rico que la honestidad.",
    author: "William Shakespeare",
    meaning: "La reputación vale más que cualquier riqueza."
},
{
    text: "Los hombres son dueños de su destino; la culpa no está en las estrellas, sino en nosotros mismos.",
    author: "William Shakespeare",
    meaning: "Somos responsables de nuestras decisiones."
},
{
    text: "Las estrellas son fuego, las dudas son humo.",
    author: "William Shakespeare"
},
{
    text: "La ambición debería estar hecha de la materia de los sueños, no del orgullo.",
    author: "William Shakespeare"
},
{
    text: "Ser o no ser, esa es la cuestión.",
    author: "William Shakespeare",
    meaning: "La reflexión sobre la existencia, las decisiones y el sentido de seguir adelante."
}
    ];

    const state = { category: "Todas", query: "" };
    let currentTrackIndex = 0;
    let shuffleMusic = false;
    const content = document.getElementById("content");
    const tabs = document.getElementById("tabs");
    const searchInput = document.getElementById("searchInput");
    const themeBtn = document.getElementById("themeBtn");
    const quoteBtn = document.getElementById("quoteBtn");
    const dynamicBg = document.getElementById("dynamicBg");
    const randomBtn = document.getElementById("randomBtn");
    const musicBtn = document.getElementById("musicBtn");
    const musicPanel = document.getElementById("musicPanel");
    const playMusicBtn = document.getElementById("playMusicBtn");
    const prevMusicBtn = document.getElementById("prevMusicBtn");
    const nextMusicBtn = document.getElementById("nextMusicBtn");
    const shuffleMusicBtn = document.getElementById("shuffleMusicBtn");
    const volumeInput = document.getElementById("volumeInput");
    const hubAudio = document.getElementById("hubAudio");
    const musicTitle = document.getElementById("musicTitle");
    const achievementsBtn = document.getElementById("achievementsBtn");
    const achievementsPanel = document.getElementById("achievementsPanel");
    const achievementsGrid = document.getElementById("achievementsGrid");
    const quickLinks = document.getElementById("quickLinks");
    const dashboard = document.getElementById("dashboard");
    const resetBgBtn = document.getElementById("resetBgBtn");
    const activityBtn = document.getElementById("activityBtn");
    const nextEventCard = document.getElementById("nextEventCard");
    const upcomingFeed = document.getElementById("upcomingFeed");
    const chronicleFeed = document.getElementById("chronicleFeed");
    const relationshipFeed = document.getElementById("relationshipFeed");
    const draftAlert = document.getElementById("draftAlert");
    const serverOverview = document.getElementById("serverOverview");
    const globalResults = document.getElementById("globalResults");
    const categoryGrid = document.getElementById("categoryGrid");

    const LS = {
      theme: "rp-hub-theme",
      favorites: "rp-hub-favorites",
      visits: "rp-hub-visits",
      history: "rp-hub-history-v2",
      volume: "rp-hub-volume",
      achievements: "rp-hub-achievements"
    };

    function normalize(text) { return String(text || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function escapeHTML(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
    function slugify(text) { return normalize(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
    function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
    function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

    function hexToRgb(hex) {
      const value = hex.replace("#", "");
      const full = value.length === 3 ? value.split("").map(x => x + x).join("") : value;
      const num = parseInt(full, 16);
      return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
    }

    function enrichPage(page) {
      const category = CATEGORY_CONFIG[page.category] || {};
      const extra = PAGE_EXTRAS[page.title] || {};
      return { ...category, ...page, ...extra, id: slugify(page.title) };
    }
    const ENRICHED_PAGES = PAGES.map(enrichPage);

    function getCategories() {
      return ["Todas", "⭐ Favoritos", ...new Set(ENRICHED_PAGES.map(page => page.category))];
    }

    function getFavorites() { return readJSON(LS.favorites, []); }
    function setFavorites(favs) { writeJSON(LS.favorites, favs); }
    function isFavorite(page) { return getFavorites().includes(page.id); }
    function toggleFavorite(pageId) {
      const favs = getFavorites();
      const next = favs.includes(pageId) ? favs.filter(id => id !== pageId) : [...favs, pageId];
      setFavorites(next);
      render();
    }

    function getVisits() { return readJSON(LS.visits, {}); }
    function getHistory() { return readJSON(LS.history, []); }
    function registerVisit(pageId) {
      const visits = getVisits();
      visits[pageId] = (visits[pageId] || 0) + 1;
      writeJSON(LS.visits, visits);
      const history = getHistory().filter(item => item.id !== pageId);
      writeJSON(LS.history, [{ id: pageId, at: Date.now() }, ...history].slice(0, 10));
      updateAchievements();
    }

    function filteredPages() {
      const q = normalize(state.query);
      const favs = getFavorites();
      return ENRICHED_PAGES.filter(page => {
        const categoryMatch = state.category === "Todas" || (state.category === "⭐ Favoritos" ? favs.includes(page.id) : page.category === state.category);
        const queryMatch = !q || normalize(`${page.title} ${page.category} ${page.description} ${page.status}`).includes(q);
        return categoryMatch && queryMatch;
      });
    }

    function statusClass(status) {
      const s = normalize(status);
      if (s.includes("nuevo")) return "new";
      if (s.includes("constru") || s.includes("terminar") || s.includes("progreso")) return "wip";
      return "";
    }

    function applyVisualTheme(config = CATEGORY_CONFIG.General) {
      const color = config.color || "#ffd84d";
      const accent2 = config.accent2 || "#ff7a3d";
      document.documentElement.style.setProperty("--accent", color);
      document.documentElement.style.setProperty("--accent-2", accent2);
      document.documentElement.style.setProperty("--accent-rgb", hexToRgb(color));
      if (config.background) {
        dynamicBg.style.backgroundImage = `url("${config.background}")`;
        dynamicBg.classList.add("show");
      } else {
        dynamicBg.classList.remove("show");
      }
    }

    function resetVisualTheme() { applyVisualTheme(CATEGORY_CONFIG.General); }

    function getCurrentTrack() {
      return HUB_PLAYLIST[currentTrackIndex] || null;
    }

    function setCurrentTrack(index, keepPlaying = false) {
      if (!HUB_PLAYLIST.length) {
        musicTitle.innerHTML = `Canción actual: <strong>ninguna</strong><br><small>Añade canciones en HUB_PLAYLIST.</small>`;
        hubAudio.removeAttribute("src");
        return;
      }

      currentTrackIndex = (index + HUB_PLAYLIST.length) % HUB_PLAYLIST.length;
      const track = getCurrentTrack();
      musicTitle.innerHTML = `Canción actual: <strong>${escapeHTML(track.title || track.src)}</strong><br><small>${escapeHTML(track.src)}</small>`;

      if (hubAudio.dataset.src !== track.src) {
        hubAudio.dataset.src = track.src;
        hubAudio.src = track.src;
      }

      if (keepPlaying) {
        hubAudio.play().then(() => playMusicBtn.textContent = "⏸️ Pausar").catch(() => {
          musicTitle.innerHTML += "<br><small>El navegador ha bloqueado la reproducción o la ruta no existe todavía.</small>";
        });
      }
    }

    function nextTrack(keepPlaying = true) {
      if (!HUB_PLAYLIST.length) return;
      if (shuffleMusic && HUB_PLAYLIST.length > 1) {
        let next = currentTrackIndex;
        while (next === currentTrackIndex) next = Math.floor(Math.random() * HUB_PLAYLIST.length);
        setCurrentTrack(next, keepPlaying);
      } else {
        setCurrentTrack(currentTrackIndex + 1, keepPlaying);
      }
    }

    function prevTrack(keepPlaying = true) {
      if (!HUB_PLAYLIST.length) return;
      setCurrentTrack(currentTrackIndex - 1, keepPlaying);
    }

    const SERVER_META = [
      { key:"inazuma", name:"Inazuma Eleven", icon:"⚽", chronicle:"Inazuma Eleven", hash:"inazuma" },
      { key:"dragonball", name:"Dragon Ball", icon:"🐉", chronicle:"Dragon Ball", hash:"dragonball" },
      { key:"pokemon", name:"Pokémon · Etruria", icon:"🧭", chronicle:"Pokémon", hash:"pokemon" }
    ];
    const CALENDAR_TYPE_META = {
      birthday:["🎂","Cumpleaños"], anniversary:["💞","Aniversario"], match:["⚽","Partido"], session:["🎲","Sesión"], birth:["🍼","Nacimiento"], tournament:["🏆","Torneo"], story:["✨","Acontecimiento"], reminder:["🔔","Recordatorio"]
    };
    const RELATION_TYPE_META = { love:"💖", friendship:"🤝", family:"🌳", rivalry:"⚔️", hate:"💢", alliance:"🛡️", mentor:"📚", broken:"💔", secret:"🔒" };

    function chroniclesData() { return Array.isArray(window.CRONICA_EVENTS) ? window.CRONICA_EVENTS : []; }
    function calendarData() { return Array.isArray(window.CALENDAR_EVENTS) ? window.CALENDAR_EVENTS : []; }
    function relationshipsData() {
      const source = window.RELATIONSHIP_DATA || {};
      return { characters:Array.isArray(source.characters) ? source.characters : [], relationships:Array.isArray(source.relationships) ? source.relationships : [] };
    }
    function isSameDay(a,b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
    function nextOccurrence(item, now = new Date()) {
      let year = item.year == null ? now.getFullYear() : Number(item.year);
      const parts = String(item.time || "12:00").split(":").map(Number);
      let date = new Date(year, Number(item.month)-1, Number(item.day), parts[0] || 0, parts[1] || 0);
      if (item.year == null && date < now && !isSameDay(date,now)) date = new Date(year+1, Number(item.month)-1, Number(item.day), parts[0] || 0, parts[1] || 0);
      if (item.year != null && date < now && !isSameDay(date,now)) return null;
      return date;
    }
    function upcomingCalendar() {
      const now = new Date();
      return calendarData().map(item => ({ item, date:nextOccurrence(item,now) })).filter(entry => entry.date).sort((a,b) => a.date-b.date);
    }
    function daysUntil(date) {
      const today = new Date(); today.setHours(0,0,0,0);
      const target = new Date(date); target.setHours(0,0,0,0);
      return Math.round((target-today)/86400000);
    }
    function formatHubDate(date, options={day:"numeric",month:"short"}) { return new Intl.DateTimeFormat("es-ES",options).format(date); }
    function calendarMeta(item) { return CALENDAR_TYPE_META[item.type] || ["📌", String(item.type || "Fecha")]; }
    function chronicleHref(universe) {
      const server = SERVER_META.find(item => item.chronicle === universe);
      return `cronica.html${server ? `#${server.hash}` : "#multiverse"}`;
    }

    function renderNextEvent(entries) {
      const next = entries[0];
      if (!next) {
        nextEventCard.innerHTML = `<div class="next-copy"><small>Próximo acontecimiento</small><h3>No hay fechas futuras</h3><p>Añade una fecha desde el Calendario Conectado.</p></div><a class="pill-button" href="calendario.html" data-open-page="calendario-conectado">Abrir calendario</a>`;
        return;
      }
      const [icon,type] = calendarMeta(next.item);
      const days = daysUntil(next.date);
      const month = formatHubDate(next.date,{month:"short"}).replace(".","");
      const countdown = days===0 ? "Hoy" : days===1 ? "Mañana" : `${days} días`;
      nextEventCard.innerHTML = `<div class="next-date"><div class="date-tile"><strong>${next.date.getDate()}</strong><span>${escapeHTML(month)}</span></div><div class="next-copy"><small>${icon} ${escapeHTML(type)}</small><h3>${escapeHTML(next.item.title)}</h3><p>${escapeHTML(next.item.note || "Próxima fecha del rol")}${next.item.time ? ` · ${escapeHTML(next.item.time)}` : ""}</p></div></div><div class="countdown">${escapeHTML(countdown)}<span>${formatHubDate(next.date,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span></div>`;
    }

    function renderUpcoming(entries) {
      const soon = entries.filter(entry => daysUntil(entry.date) <= 7).slice(0,4);
      upcomingFeed.innerHTML = soon.length ? soon.map(({item,date}) => { const [icon,type]=calendarMeta(item); return `<a class="feed-row" href="${escapeHTML(item.link || "calendario.html")}" data-open-page="calendario-conectado"><span class="feed-icon">${icon}</span><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(type)}</small></span><time>${daysUntil(date)===0 ? "Hoy" : formatHubDate(date)}</time></a>`; }).join("") : `<div class="mini-row"><span>Semana tranquila</span><span>Sin fechas</span></div>`;
    }

    function renderChronicles() {
      const entries = [...chroniclesData()].sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")) || Number(b.createdAt || 0)-Number(a.createdAt || 0)).slice(0,4);
      chronicleFeed.innerHTML = entries.length ? entries.map(item => `<a class="feed-row" href="${escapeHTML(chronicleHref(item.universe))}" data-open-page="cronicas-del-rol"><span class="feed-icon">${item.universe==="Inazuma Eleven"?"⚽":item.universe==="Dragon Ball"?"🐉":item.universe==="Pokémon"?"🧭":"⌛"}</span><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.arc || item.type || "Crónica")}</small></span><time>${item.date ? escapeHTML(item.date.slice(5).split("-").reverse().join("/")) : "—"}</time></a>`).join("") : `<div class="mini-row"><span>Aún no hay crónicas</span><span>Vacío</span></div>`;
    }

    function renderRelationships() {
      const data = relationshipsData();
      const names = Object.fromEntries(data.characters.map(item => [item.id,item.name]));
      const entries = [...data.relationships].slice(-4).reverse();
      relationshipFeed.innerHTML = entries.length ? entries.map(item => `<a class="feed-row" href="relaciones.html" data-open-page="relaciones-2-0"><span class="feed-icon">${RELATION_TYPE_META[item.type] || "🔗"}</span><span><strong>${escapeHTML(item.title || "Vínculo")}</strong><small>${escapeHTML(names[item.from] || item.from)} · ${escapeHTML(names[item.to] || item.to)}</small></span><span>${Number(item.intensity || 0)}/5</span></a>`).join("") : `<div class="mini-row"><span>Aún no hay relaciones</span><span>Vacío</span></div>`;
    }

    function renderDraftAlert() {
      const drafts = [
        { keys:["rpChronicleDraftV2","rpChronicleEventsV1"], label:"Crónicas", href:"cronica.html", page:"cronicas-del-rol" },
        { keys:["rpRelationshipsDraftV2"], label:"Relaciones", href:"relaciones.html", page:"relaciones-2-0" },
        { keys:["rpCalendarDraftV2"], label:"Calendario", href:"calendario.html", page:"calendario-conectado" }
      ].filter(group => group.keys.some(key => { try { return Boolean(localStorage.getItem(key)); } catch { return false; } }));
      if (!drafts.length) { draftAlert.hidden=true; draftAlert.innerHTML=""; return; }
      draftAlert.hidden=false;
      draftAlert.innerHTML=`<div><strong>⚠️ ${drafts.length===1 ? "Hay cambios pendientes de guardar" : "Hay cambios pendientes en varias páginas"}</strong><span>Los borradores están a salvo en este navegador, pero todavía no están escritos en el código.</span></div><div class="draft-links">${drafts.map(item => `<a href="${item.href}" data-open-page="${item.page}">${escapeHTML(item.label)} →</a>`).join("")}</div>`;
    }

    function renderServers() {
      const chronicles = chroniclesData(), calendar = calendarData(), relations = relationshipsData();
      serverOverview.innerHTML = SERVER_META.map(server => {
        const chronicleCount = chronicles.filter(item => item.universe===server.chronicle).length;
        const dateCount = calendar.filter(item => normalize(item.universe)===server.key).length;
        const characterCount = relations.characters.filter(item => normalize(item.universe)===server.key).length;
        return `<a class="server-summary" data-server="${server.key}" href="cronica.html#${server.hash}" data-open-page="cronicas-del-rol"><div class="server-top"><strong>${escapeHTML(server.name)}</strong><span>${server.icon}</span></div><div class="server-numbers"><div class="server-number"><strong>${chronicleCount}</strong><small>Crónicas</small></div><div class="server-number"><strong>${dateCount}</strong><small>Fechas</small></div><div class="server-number"><strong>${characterCount}</strong><small>Personajes</small></div></div></a>`;
      }).join("");
    }

    function renderLiveHub() {
      const upcoming = upcomingCalendar();
      renderNextEvent(upcoming);
      renderUpcoming(upcoming);
      renderChronicles();
      renderRelationships();
      renderDraftAlert();
      renderServers();
    }

    function globalSearchItems(query) {
      const q=normalize(query), items=[];
      if(!q)return items;
      ENRICHED_PAGES.forEach(page => items.push({icon:page.emoji,title:page.title,meta:page.category,kind:"Página",href:page.url,pageId:page.id,search:`${page.title} ${page.category} ${page.description} ${page.status || ""}`}));
      chroniclesData().forEach(item => items.push({icon:"⌛",title:item.title,meta:`${item.universe} · ${item.arc || item.type}`,kind:"Crónica",href:chronicleHref(item.universe),pageId:"cronicas-del-rol",search:`${item.title} ${item.universe} ${item.type} ${item.arc} ${(item.characters||[]).join(" ")} ${item.location} ${item.summary}`}));
      calendarData().forEach(item => { const meta=calendarMeta(item); items.push({icon:meta[0],title:item.title,meta:`${meta[1]} · ${String(item.day).padStart(2,"0")}/${String(item.month).padStart(2,"0")}`,kind:"Fecha",href:item.link||"calendario.html",pageId:"calendario-conectado",search:`${item.title} ${item.note} ${item.type} ${item.universe}`}); });
      const rel=relationshipsData(), names=Object.fromEntries(rel.characters.map(item=>[item.id,item.name]));
      rel.relationships.forEach(item => items.push({icon:RELATION_TYPE_META[item.type]||"🔗",title:item.title||"Relación",meta:`${names[item.from]||item.from} · ${names[item.to]||item.to}`,kind:"Relación",href:"relaciones.html",pageId:"relaciones-2-0",search:`${item.title} ${item.description} ${item.type} ${names[item.from]} ${names[item.to]}`}));
      return items.filter(item => normalize(item.search).includes(q)).slice(0,15);
    }

    function renderGlobalSearch() {
      const query=state.query.trim();
      if(query.length<2){globalResults.hidden=true;globalResults.innerHTML="";return;}
      const results=globalSearchItems(query);
      globalResults.hidden=false;
      globalResults.innerHTML=`<div class="result-head"><h2>Resultados en toda la web</h2><span>${results.length}${results.length===15?"+":""} coincidencias</span></div>${results.length?`<div class="result-grid">${results.map(item=>`<a class="result-item" href="${escapeHTML(item.href)}" data-open-page="${escapeHTML(item.pageId)}"><span>${item.icon}</span><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.meta)}</small></span><span class="result-kind">${escapeHTML(item.kind)}</span></a>`).join("")}</div>`:`<div class="empty">No aparece nada con “${escapeHTML(query)}”.</div>`}`;
    }

    function renderStats() {
      document.getElementById("totalPages").textContent = ENRICHED_PAGES.length;
      document.getElementById("totalEvents").textContent = calendarData().length;
      document.getElementById("totalCharacters").textContent = relationshipsData().characters.length;
    }

    function renderTabs() {
      tabs.innerHTML = getCategories().map(category => `<button class="tab ${category === state.category ? "active" : ""}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("");
    }

    function renderCategoryLauncher() {
      const icons = { "Inazuma Eleven":"⚽", "Dragon Ball":"🐉", "Pokémon":"🧭", "General":"✨", "Minijuegos":"🎮" };
      const categories = ["Inazuma Eleven", "Dragon Ball", "Pokémon", "General", "Minijuegos"];
      const visits = getVisits();
      categoryGrid.innerHTML = categories.map(category => {
        const pages = ENRICHED_PAGES.filter(page => page.category === category && !page.disabled);
        const visited = pages.reduce((total, page) => total + (visits[page.id] || 0), 0);
        return `<button class="category-card ${state.category === category ? "active" : ""}" type="button" data-launch-category="${escapeHTML(category)}"><span class="category-icon">${icons[category]}</span><strong>${escapeHTML(category)}</strong><small>${pages.length} páginas · ${visited} accesos</small></button>`;
      }).join("");
    }

    function renderQuickLinks() {
      quickLinks.innerHTML = QUICK_LINK_TITLES.map(title => ENRICHED_PAGES.find(page => page.title === title)).filter(Boolean).map(page => `
        <a class="quick-link" href="${escapeHTML(page.url)}" data-open-page="${page.id}" data-page-id="${page.id}">${escapeHTML(page.emoji)} ${escapeHTML(page.title)}</a>
      `).join("");
    }

    function renderDashboard() {
      const visits = getVisits();
      const mostUsed = [...ENRICHED_PAGES]
        .map(page => ({ ...page, visits: visits[page.id] || 0 }))
        .sort((a, b) => b.visits - a.visits)
        .filter(page => page.visits > 0)
        .slice(0, 5);
      const favs = getFavorites();
      const favoritePages = ENRICHED_PAGES.filter(page => favs.includes(page.id)).slice(0, 5);
      const recentPages = getHistory().map(entry => ({ ...entry, page:ENRICHED_PAGES.find(page => page.id===entry.id) })).filter(entry => entry.page).slice(0,5);
      dashboard.innerHTML = `
        <article class="dashboard-card">
          <h2>↩️ Continuar donde lo dejaste</h2>
          <div class="mini-list">${recentPages.length ? recentPages.map(entry => `<a class="mini-row" href="${escapeHTML(entry.page.url)}" data-open-page="${entry.page.id}"><span>${escapeHTML(entry.page.emoji)} ${escapeHTML(entry.page.title)}</span><span>${formatHubDate(new Date(entry.at),{day:"2-digit",month:"short"})}</span></a>`).join("") : `<div class="mini-row"><span>Abre una página para iniciar el historial</span><span>Nuevo</span></div>`}</div>
        </article>
        <article class="dashboard-card">
          <h2>🔥 Más utilizadas</h2>
          <div class="mini-list">${mostUsed.length ? mostUsed.map(page => `<a class="mini-row" href="${escapeHTML(page.url)}" data-open-page="${page.id}"><span>${escapeHTML(page.emoji)} ${escapeHTML(page.title)}</span><span>${page.visits} visitas</span></a>`).join("") : `<div class="mini-row"><span>Aún no hay visitas guardadas</span><span>0</span></div>`}</div>
        </article>
        <article class="dashboard-card">
          <h2>⭐ Tus favoritos</h2>
          <div class="mini-list">${favoritePages.length ? favoritePages.map(page => `<a class="mini-row" href="${escapeHTML(page.url)}" data-open-page="${page.id}"><span>${escapeHTML(page.emoji)} ${escapeHTML(page.title)}</span><span>Abrir</span></a>`).join("") : `<div class="mini-row"><span>Marca tarjetas con ❤️</span><span>Vacío</span></div>`}</div>
        </article>
      `;
    }

    function renderPages() {
      const pages = filteredPages();
      if (!pages.length) {
        content.innerHTML = `<div class="empty">No hay páginas con esos filtros. El buscador se ha pasado de modo detective.</div>`;
        return;
      }
      const visits = getVisits();
      const favs = getFavorites();
      const groups = state.category === "⭐ Favoritos" ? ["⭐ Favoritos"] : [...new Set(pages.map(page => page.category))];
      content.innerHTML = groups.map(category => {
        const groupPages = state.category === "⭐ Favoritos" ? pages : pages.filter(page => page.category === category);
        return `
          <div class="section-group">
            <div class="section-title"><h2>${escapeHTML(category)}</h2><span>${groupPages.length} página${groupPages.length === 1 ? "" : "s"}</span></div>
            <div class="grid">
              ${groupPages.map(page => `
                <article class="section-card ${statusClass(page.status)}" data-page-id="${page.id}">
                  <div>
                    <div class="card-top">
                      <div class="icon">${escapeHTML(page.emoji)}</div>
                      <div class="card-actions">
                        <button class="fav-btn" type="button" data-fav-page="${page.id}" title="Favorito">${favs.includes(page.id) ? "❤️" : "🤍"}</button>
                        ${page.status ? `<span class="tag ${statusClass(page.status)}">${escapeHTML(page.status)}</span>` : `<span class="tag">${escapeHTML(page.category)}</span>`}
                      </div>
                    </div>
                    <h3>${escapeHTML(page.title)}</h3>
                    <p>${escapeHTML(page.description)}</p>
                    <div class="usage">👁️ ${visits[page.id] || 0} visitas guardadas</div>
                  </div>
                  <a class="card-link ${page.disabled ? "disabled" : ""}" href="${page.disabled ? "#" : escapeHTML(page.url)}" data-open-page="${page.id}">${page.disabled ? "Próximamente" : "Abrir página"} <span>→</span></a>
                </article>
              `).join("")}
            </div>
          </div>`;
      }).join("");
    }

    const ACHIEVEMENTS = [
      { id: "first", icon: "🏅", title: "Primera visita", desc: "Abre cualquier página del HUB.", check: () => totalVisits() >= 1 },
      { id: "ten", icon: "🔥", title: "10 accesos", desc: "Acumula 10 aperturas de páginas.", check: () => totalVisits() >= 10 },
      { id: "hundred", icon: "👑", title: "100 accesos", desc: "El HUB ya es tu menú principal real.", check: () => totalVisits() >= 100 },
      { id: "explorer", icon: "🧭", title: "Explorador", desc: "Visita al menos una página de cada categoría.", check: () => visitedEveryCategory() },
      { id: "completionist", icon: "🌟", title: "Completionist", desc: "Visita todas las páginas disponibles.", check: () => visitedEveryPage() },
      { id: "favorites", icon: "❤️", title: "Coleccionista", desc: "Guarda 5 páginas como favoritas.", check: () => getFavorites().length >= 5 },
      { id: "inazuma", icon: "⚽", title: "Fan de Inazuma", desc: "Abre 5 páginas de Inazuma Eleven.", check: () => categoryVisits("Inazuma Eleven") >= 5 },
      { id: "dragonball", icon: "🐉", title: "Fan de Dragon Ball", desc: "Abre 5 páginas de Dragon Ball.", check: () => categoryVisits("Dragon Ball") >= 5 },
      { id: "pokemon", icon: "🧢", title: "Fan de Pokémon", desc: "Abre 5 páginas de Pokémon.", check: () => categoryVisits("Pokémon") >= 5 }
    ];

    function totalVisits() { return Object.values(getVisits()).reduce((sum, value) => sum + Number(value || 0), 0); }
    function visitedEveryPage() { const visits = getVisits(); return ENRICHED_PAGES.filter(page => !page.disabled).every(page => visits[page.id] > 0); }
    function visitedEveryCategory() { const visits = getVisits(); return [...new Set(ENRICHED_PAGES.filter(page => !page.disabled).map(page => page.category))].every(category => ENRICHED_PAGES.some(page => page.category === category && visits[page.id] > 0)); }
    function categoryVisits(category) { const visits = getVisits(); return ENRICHED_PAGES.filter(page => page.category === category).reduce((sum, page) => sum + (visits[page.id] || 0), 0); }

    function updateAchievements() {
      const unlocked = readJSON(LS.achievements, []);
      const next = [...unlocked];
      ACHIEVEMENTS.forEach(achievement => { if (achievement.check() && !next.includes(achievement.id)) next.push(achievement.id); });
      writeJSON(LS.achievements, next);
      renderAchievements();
    }

    function renderAchievements() {
      const unlocked = readJSON(LS.achievements, []);
      achievementsGrid.innerHTML = ACHIEVEMENTS.map(a => `
        <div class="achievement ${unlocked.includes(a.id) ? "unlocked" : ""}">
          ${a.icon} ${escapeHTML(a.title)}
          <small>${escapeHTML(a.desc)} ${unlocked.includes(a.id) ? "✅" : "🔒"}</small>
        </div>
      `).join("");
    }

    function render() { renderStats(); renderTabs(); renderCategoryLauncher(); renderQuickLinks(); renderLiveHub(); renderDashboard(); renderPages(); renderGlobalSearch(); renderAchievements(); }

    function showRandomQuote() {
      const random = quotes[Math.floor(Math.random() * quotes.length)];
      document.getElementById("quoteText").textContent = `“${random.text}”`;
      document.getElementById("quoteAuthor").textContent = `— ${random.author}`;
      const meaning = document.getElementById("quoteMeaning");
      if (random.meaning) { meaning.textContent = random.meaning; meaning.classList.add("show"); }
      else { meaning.textContent = ""; meaning.classList.remove("show"); }
    }

    function applyTheme() {
      const saved = localStorage.getItem(LS.theme) || "dark";
      document.body.classList.toggle("light", saved === "light");
      themeBtn.textContent = saved === "light" ? "🌙 Oscuro" : "☀️ Claro";
    }

    tabs.addEventListener("click", event => {
      const button = event.target.closest(".tab");
      if (!button) return;
      state.category = button.dataset.category;
      render();
      const config = CATEGORY_CONFIG[state.category] || CATEGORY_CONFIG.General;
      applyVisualTheme(config);
    });

    searchInput.addEventListener("input", event => { state.query = event.target.value; renderPages(); renderGlobalSearch(); });
    activityBtn.addEventListener("click", () => document.getElementById("activityCenter").scrollIntoView({behavior:"smooth",block:"start"}));
    themeBtn.addEventListener("click", () => { const isLight = document.body.classList.contains("light"); localStorage.setItem(LS.theme, isLight ? "dark" : "light"); applyTheme(); });
    musicBtn.addEventListener("click", () => musicPanel.classList.toggle("open"));
    achievementsBtn.addEventListener("click", () => achievementsPanel.classList.toggle("open"));
    quoteBtn.addEventListener("click", showRandomQuote);
    resetBgBtn.addEventListener("click", resetVisualTheme);

    randomBtn.addEventListener("click", () => {
      const available = ENRICHED_PAGES.filter(page => !page.disabled);
      const random = available[Math.floor(Math.random() * available.length)];
      registerVisit(random.id);
      location.href = random.url;
    });

    document.addEventListener("click", event => {
      const categoryButton = event.target.closest("[data-launch-category]");
      if (categoryButton) {
        state.category = categoryButton.dataset.launchCategory;
        state.query = "";
        searchInput.value = "";
        render();
        applyVisualTheme(CATEGORY_CONFIG[state.category] || CATEGORY_CONFIG.General);
        document.getElementById("pageCatalog").scrollIntoView({ behavior:"smooth", block:"start" });
        return;
      }
      const favBtn = event.target.closest("[data-fav-page]");
      if (favBtn) { event.preventDefault(); toggleFavorite(favBtn.dataset.favPage); updateAchievements(); return; }
      const openLink = event.target.closest("[data-open-page]");
      if (openLink && !openLink.classList.contains("disabled")) registerVisit(openLink.dataset.openPage);
    });

    document.addEventListener("mouseover", event => {
      const card = event.target.closest("[data-page-id]");
      if (!card) return;
      const page = ENRICHED_PAGES.find(item => item.id === card.dataset.pageId);
      if (page) applyVisualTheme(page);
    });

    volumeInput.addEventListener("input", () => { hubAudio.volume = Number(volumeInput.value); localStorage.setItem(LS.volume, String(hubAudio.volume)); });
    playMusicBtn.addEventListener("click", () => {
      if (!hubAudio.src) setCurrentTrack(currentTrackIndex, false);
      if (hubAudio.paused) {
        hubAudio.play().then(() => playMusicBtn.textContent = "⏸️ Pausar").catch(() => {
          musicTitle.innerHTML += "<br><small>El navegador ha bloqueado la reproducción o la ruta no existe todavía.</small>";
        });
      } else {
        hubAudio.pause();
        playMusicBtn.textContent = "▶️ Reproducir";
      }
    });
    prevMusicBtn.addEventListener("click", () => prevTrack(!hubAudio.paused));
    nextMusicBtn.addEventListener("click", () => nextTrack(!hubAudio.paused));
    shuffleMusicBtn.addEventListener("click", () => {
      shuffleMusic = !shuffleMusic;
      shuffleMusicBtn.textContent = shuffleMusic ? "🔀 Aleatorio: ON" : "🔀 Aleatorio";
    });
    hubAudio.addEventListener("ended", () => nextTrack(true));
    hubAudio.addEventListener("pause", () => playMusicBtn.textContent = "▶️ Reproducir");
    hubAudio.addEventListener("play", () => playMusicBtn.textContent = "⏸️ Pausar");

    applyTheme();
    hubAudio.volume = Number(localStorage.getItem(LS.volume) || 0.45);
    volumeInput.value = hubAudio.volume;
    render();
    updateAchievements();
    resetVisualTheme();
    setCurrentTrack(0, false);
    showRandomQuote();
    setInterval(showRandomQuote, 25000);
    setInterval(renderLiveHub, 60000);
