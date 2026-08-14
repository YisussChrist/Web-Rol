/*
  REGISTRO DE ENTRENADORES POKÉMON
  --------------------------------
  Este archivo es la única fuente de datos de la página. No usa localStorage
  ni una base de datos: lo que escribas aquí quedará guardado en el código.

  Para añadir un entrenador, copia uno de los bloques completos y cambia sus
  valores. Se pueden dejar vacíos location, goal, badges, reserves y
  achievements; la página mostrará "Por registrar" sin romper el diseño.

  Pokémon normal:
  { id: 448, name: "lucario", types: ["fighting", "steel"] }

  Moveset y habilidad elegidos (usa los identificadores ingleses de PokéAPI):
  { id: 25, name: "pikachu", types: ["electric"], ability: "static", moves: ["thunderbolt", "quick-attack"] }

  Forma alternativa de PokéAPI:
  { id: 706, spriteId: 10242, name: "goodra de hisui", form: "Hisui", types: ["dragon", "steel"] }

  Pokémon custom (sus datos no se comparan con una especie oficial):
  {
    id: 1150,
    name: "aegislash de hyrule",
    image: "Pokemon Custom/Aegislash de Hyrule.png",
    types: ["fairy", "steel"],
    ability: { name: "Habilidad propia", description: "Escribe aquí su efecto." },
    moves: [
      { name: "Movimiento propio", type: "fairy", power: 80, accuracy: 100, description: "Escribe aquí su efecto." }
    ]
  }

  Medalla:
  { name: "Nombre de la medalla", gym: "Ciudad o gimnasio", icon: "🔥", date: "" }
*/

window.ETRURIA_TRAINERS = [
  {
    id: "link-ordon",
    name: "Link Ordon",
    title: "Campeón de Hyrule",
    region: "Hyrule",
    style: "Equilibrado",
    status: "Activo",
    location: "Villa Arcanum",
    goal: "Ser campeón de la Liga Pokémon",
    colors: ["#32cd32", "#006400"],
    summary: "Un equipo sólido y equilibrado, guiado por un campeón con experiencia y unido bajo la bendición de la Diosa Hylia.",
    team: [
      { id: 723, name: "dartrix", types: ["grass", "flying"] },
      { id: 530, name: "excadrill", types: ["ground", "steel"] },
      { id: 1052, name: "honedge de hyrule", image: "Pokemon Custom/Honedge de Hyrule.png", types: ["fairy", "steel"] }
    ],
    reserves: [
      { id: 246, name: "larvitar", types: ["rock", "ground"]}
    ],
    badges: [
      { name: "Medalla Muscidae", gym: "Gimnasio de tipo Bicho", image: "Medallas/MedallaMuscidae.webp", date: "", note: "Tras derrotar a Gonta, el líder de tipo Bicho." },
      { name: "Medalla Estatua", gym: "Gimnasio de tipo Roca", image: "Medallas/MedallaEstatua.webp", date: "", note: "Tras derrotar a Holo, la líder de tipo Roca." },
      { name: "Medalla Centella", gym: "Gimnasio de tipo Eléctrico", image: "Medallas/MedallaCentella.webp", date: "", note: "Tras derrotar a Ciel, el líder de tipo Eléctrico."}
    ],
    achievements: ["Campeón de Hyrule"],
    links: []
  },
  {
    id: "shin-haein",
    name: "Shin Haein",
    title: "Entrenadora cantante",
    region: "Etruria",
    style: "Especial",
    status: "Activo",
    location: "Villa Arcanum",
    goal: "",
    colors: ["#8900ff", "#b561ff"],
    summary: "Ama la música y convierte cada combate en una actuación, enfrentándose al reto de cantar mientras pelea junto a los suyos.",
    team: [
      { id: 159, name: "toto", types: ["water"] },
      { id: 441, name: "chatot", types: ["normal", "flying"] },
      { id: 848, name: "toxy", types: ["electric", "poison"] }
    ],
    reserves: [],
    badges: [
      { name: "Medalla Muscidae", gym: "Gimnasio de tipo Bicho", image: "Medallas/MedallaMuscidae.webp", date: "", note: "Tras derrotar a Gonta, el líder de tipo Bicho." },
      { name: "Medalla Estatua", gym: "Gimnasio de tipo Roca", image: "Medallas/MedallaEstatua.webp", date: "", note: "Tras derrotar a Holo, la líder de tipo Roca." },
      { name: "Medalla Centella", gym: "Gimnasio de tipo Eléctrico", image: "Medallas/MedallaCentella.webp", date: "", note: "Tras derrotar a Ciel, el líder de tipo Eléctrico."}
    ],
    achievements: [],
    links: []
  },
  {
    id: "serena-vaniville",
    name: "Serena Vaniville",
    title: "Concursante excelente",
    region: "Kalos",
    style: "Equilibrado",
    status: "Activo",
    location: "Villa Arcanum",
    goal: "Ser la mejor concursante de todas.",
    colors: ["#ffcc00", "#8f6f00"],
    summary: "Su equipo reúne a Pokémon con una oportunidad para brillar, demostrando que el talento no depende de encajar en una única idea de belleza.",
    team: [
      { id: 654, name: "braixen", types: ["fire"] },
      { id: 280, name: "ralts", types: ["psychic", "fairy"] },
      { id: 23, name: "ekans", types: ["poison"] }
    ],
    reserves: [],
    badges: [
      { name: "Medalla Muscidae", gym: "Gimnasio de tipo Bicho", image: "Medallas/MedallaMuscidae.webp", date: "", note: "Tras derrotar a Gonta, el líder de tipo Bicho." },
      { name: "Medalla Estatua", gym: "Gimnasio de tipo Roca", image: "Medallas/MedallaEstatua.webp", date: "", note: "Tras derrotar a Holo, la líder de tipo Roca." },
      { name: "Medalla Centella", gym: "Gimnasio de tipo Eléctrico", image: "Medallas/MedallaCentella.webp", date: "", note: "Tras derrotar a Ciel, el líder de tipo Eléctrico."}
    ],
    achievements: [],
    links: []
  },
  {
    id: "mencia-scarlet",
    name: "Mencía Scarlet",
    title: "Luchadora carmesí",
    region: "Paldea",
    style: "Físico",
    status: "Activo",
    location: "",
    goal: "",
    colors: ["#0b6b31", "#00ab53"],
    summary: "Pelea para demostrar que los combates no son una obligación: entrenadores y Pokémon también pueden disfrutarlos juntos.",
    team: [
      { id: 923, name: "pawmo", types: ["fighting", "electric"] },
      { id: 177, name: "natu", types: ["flying", "psychic"] },
      { id: 907, name: "floragato", types: ["grass", "dark"] },
      { id: 123, name: "scyther", types: ["bug", "flying"] },
      { id: 932, name: "nacli", types: ["rock"] }
    ],
    reserves: [],
    badges: [
      { name: "Medalla Muscidae", gym: "Gimnasio de tipo Bicho", image: "Medallas/MedallaMuscidae.webp", date: "", note: "Tras derrotar a Gonta, el líder de tipo Bicho." },
      { name: "Medalla Estatua", gym: "Gimnasio de tipo Roca", image: "Medallas/MedallaEstatua.webp", date: "", note: "Tras derrotar a Holo, la líder de tipo Roca." },
      { name: "Medalla Centella", gym: "Gimnasio de tipo Eléctrico", image: "Medallas/MedallaCentella.webp", date: "", note: "Tras derrotar a Ciel, el líder de tipo Eléctrico."}
    ],
    achievements: [],
    links: []
  },
  {
    id: "judith",
    name: "Judith",
    title: "Líder de gimnasio de tipo Lucha",
    region: "Galar",
    style: "Físico",
    status: "Activo",
    location: "Ciudad Colisea",
    goal: "Ser líder de gimnasio de tipo Lucha.",
    colors: ["#9a6100", "#d49a2a"],
    summary: "Una líder especializada en el combate directo, la disciplina y la fuerza ganada a través del entrenamiento constante.",
    team: [
      { id: 66, name: "machop", types: ["fighting"] }
    ],
    reserves: [],
    badges: [],
    achievements: ["Líder de gimnasio de tipo Lucha de Kalos"],
    links: []
  },
  {
    id: "mogari-shishikuno",
    name: "Mogari Shishikuno",
    title: "Heredero Shishikuno",
    region: "Etruria",
    style: "Equilibrado",
    status: "Activo",
    location: "Villa Arcanum",
    goal: "???",
    colors: ["#242424", "#777777"],
    summary: "Un equipo preparado para crear los mejores platos y honrar el nombre del Clan Shishikuno dentro y fuera del combate.",
    team: [
      { id: 394, name: "prinplup", types: ["water"] },
      { id: 607, name: "litwick", types: ["fire", "ghost"]}
    ],
    reserves: [],
    badges: [],
    achievements: [],
    links: []
  },
  {
    id: "gama-sazare",
    name: "Gama Sazare",
    title: "Fotógrafa entrenadora",
    region: "Sinnoh",
    style: "Equilibrado",
    status: "Activo",
    location: "Ciudad ???",
    goal: "Ser la mejor fotógrafa de la región",
    colors: ["#0750a4", "#00aec4"],
    summary: "Entregada a la fotografía, viaja con un equipo capaz de convertir cualquier playa, ruta o atardecer en una imagen inolvidable.",
    team: [
      { id: 704, name: "goomy", types: ["dragon"] },
      { id: 619, name: "mienfoo", types: ["fighting"] }
    ],
    reserves: [],
    badges: [],
    achievements: [],
    links: []
  },
  {
    id: "philip",
    name: "Philip",
    title: "Entrenador erudito",
    region: "Etruria",
    style: "Equilibrado",
    status: "Activo",
    location: "",
    goal: "",
    colors: ["#1c6600", "#43b929"],
    summary: "Un entrenador erudito con un deseo inagotable de aprender, investigar y superarse cada día junto a sus compañeros.",
    team: [
      { id: 495, name: "snivy", types: ["grass"] },
      { id: 519, name: "pidove", types: ["normal", "flying"] },
      { id: 54, name: "psyduck", types: ["water"] }
    ],
    reserves: [],
    badges: [
      { name: "Medalla Muscidae", gym: "Gimnasio de tipo Bicho", image: "Medallas/MedallaMuscidae.webp", date: "", note: "Tras derrotar a Gonta, el líder de tipo Bicho." },
      { name: "Medalla Estatua", gym: "Gimnasio de tipo Roca", image: "Medallas/MedallaEstatua.webp", date: "", note: "Tras derrotar a Holo, la líder de tipo Roca." },
      { name: "Medalla Centella", gym: "Gimnasio de tipo Eléctrico", image: "Medallas/MedallaCentella.webp", date: "", note: "Tras derrotar a Ciel, el líder de tipo Eléctrico."}
    ],
    achievements: [],
    links: []
  },
  {
  id: "toya",
  name: "Toya",
  title: "Entrenador Cantante",
  region: "Etruria",
  style: "Equilibrado",
  status: "Activo",
  location: "Villa Arcanum",
  goal: "Ninguno",
  colors: ["#2a75bb", "#174b7d"],
  summary: "Un entrenador con la templanza de la voz, la seguridad de un vocalista y las ganas de aprender de un niño.",
  team: [
    { id: 912, name: "quaxly", types: ["water"] }
  ],
  reserves: [],
  badges: [
      { name: "Medalla Muscidae", gym: "Gimnasio de tipo Bicho", image: "Medallas/MedallaMuscidae.webp", date: "", note: "Tras derrotar a Gonta, el líder de tipo Bicho." },
      { name: "Medalla Estatua", gym: "Gimnasio de tipo Roca", image: "Medallas/MedallaEstatua.webp", date: "", note: "Tras derrotar a Holo, la líder de tipo Roca." },
      { name: "Medalla Centella", gym: "Gimnasio de tipo Eléctrico", image: "Medallas/MedallaCentella.webp", date: "", note: "Tras derrotar a Ciel, el líder de tipo Eléctrico."}
    ],
  achievements: [],
  links: []
},
];
