const afinidadClase = (afinidad = "") =>
  afinidad
    .toLocaleLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  const iconosAfinidad = {
   Agua: "afinidades/Agua.png",
   Aire: "afinidades/Aire.webp",
   Bosque: "afinidades/Bosque.webp",
   Cosmico: "afinidades/Cosmico.png",
   Electricidad: "afinidades/Electricidad.png",
   Fuego: "afinidades/Fuego.webp",
   Fuerza: "afinidades/Fuerza.png",
   Hielo: "afinidades/Hielo.png",
   Luz: "afinidades/Luz.png",
   Metal: "afinidades/Metal.png",
   Onirico: "afinidades/Onírica.png",
   Psiquico: "afinidades/Psiquico.png",
   Sangre: "afinidades/Sangre.png",
   Sombra: "afinidades/Sombra.png",
   Montana: "afinidades/Tierra.webp",
   Veneno: "afinidades/Veneno.png",
   Dragon: "afinidades/Dragon.png"
};

const iconosPosicion = {
  Portero: "posiciones/POR.webp",
  Defensa: "posiciones/DF.webp",
  Mediocentro: "posiciones/MC.webp",
  Delantero: "posiciones/DC.webp",
  Gerente: "posiciones/GE.webp",
  Entrenador: "posiciones/DT.webp"
};

const escudosEquipos = {
  Raimon: "escudos/Raimon.png",
  Galaxia: "escudos/Galaxia.webp",
  Alpino: "escudos/Alpino.webp",
  Ultramegahiedra: "escudos/Ultramegahiedra.webp",
  Lyon: "escudos/OlympiqueLyonnais.png",
  Universal: "escudos/Universal.webp",
  Espejismo: "escudos/Espejismo.webp",
  Osasuna: "escudos/Osasuna.png",
  MaryTimes: "escudos/Mary Times.webp"

};

const iconosGrado = {
  G2: "grados/G2.webp",
  G3: "grados/G3.webp",
  G4: "grados/G4.webp",
  G5: "grados/G5.webp"
};

const personajes = [
  {
    nombre: "Renzu Ito",
    titulo: "León Solar",
    equipo: "Raimon",
    imagen: "../Hijos Inazuma/pjs/Renzu Ito.jpg",
    elemento: "Fuego",
    posicion: "Delantero",
    tecnicas: [
      ["V de Fuego", "V-Create", "G5", "Tiro"],
      ["Chorro Arena", "Sand Stream", "G5", "Regate", "", "Montana"],
      ["Espada Solar", "Solar Blade", "G5", "Tiro"],
      ["Superrelámpago", "Inazuma-1", "G5", "Tiro", "Con Pan"],
      ["Tornado de Fuego", "Fire Tornado", "G5", "Tiro"],
      ["Tornado Solar", "Kōsei Tornēdo", "G2", "Tiro"],
      ["Fuego Absoluto", "Absolute Blaze", "G3", "Tiro", "Con Mavuika"],
    ],
    talento: {
      nombre: "Orgullo Ígneo",
      ingles: "Fire Pride",
      descripcion:
        "Los chooses de Ren aumentan +1 si justo antes, algún rival o aliado en el campo realiza una técnica de fuego. Pelea así para demostrar que su fuego arde más que otro."
    },
    espirituGuerrero: {
      nombre: "Gracia del Sol, Escanor",
      ingles: "Sun Grace, Escanor",
      tecnicas: [
        ["Final Prominence", "Prominencia Final", "Tiro"]
      ]
    },
    miximax: {
      nombre: "Sun Wukong",
      tecnicas: [
        ["Castigo del Rey Mono", "Punishment of Sun Wukong"]
      ]
    }
  },
  {
    nombre: "Rumi Kurogane",
    titulo: "Reina Escarlata",
    equipo: "Raimon",
    imagen: "../Hijos Inazuma/pjs/Rumi Kurogane 2.jpg",
    elemento: "Sombra",
    posicion: "Mediocentro",
    tecnicas: [
      ["Golpe Umbrío", "Shadow Force", "G5", "Regate"],
      ["Sombra Vil", "Shadow Sneak", "G5", "Bloqueo"],
      ["Bola Sombra", "Shadow Ball", "G5", "Tiro"],
      ["Campo Umbrío", "Black Field", "G5", "Tiro"],
    ],
    talento: {
      nombre: "Mundo Distorsión",
      ingles: "Distorsion World",
      descripcion:
        "La realidad se tuerce a favor de Rumi cuando entra en acción, esto consigue que, una vez por parte, Rumi pueda invertir el resultado de un choose a su favor."
    },
    espirituGuerrero: {
      nombre: "Dragón Divino Desterrado, Giratina",
      ingles: "Exiled Divine Angel,",
      tecnicas: [
        ["Impacto Distorsión", "Distorsion Impact", "Tiro"]
      ]
    },
    miximax: {
      nombre: "Mulán",
      tecnicas: [
        ["Danza de Guerra de la Flor Carmesí", "War Dance of the Crimson Flower"]
      ]
    }
  },
  {
    nombre: "Hikaru Hoshihara",
    titulo: "",
    equipo: "Raimon",
    imagen: "../Hijos Inazuma/pjs/Hikaru Hoshihara.jpg",
    elemento: "Metal",
    posicion: "Mediocentro",
    tecnicas: [
      [
        "Impulso De Catástrofe",
        "Catastrophe Drive",
        "G5",
        "Regate",
        "",
        "Metal"
      ],
      [
        "Tormenta De Espadas",
        "Sword Storm",
        "G5",
        "Bloqueo"
      ],
      [
        "Tri-Cañón",
        "Tri-Cannon",
        "G5",
        "Tiro"
      ],
      [
        "Cruce Delta",
        "Delta Cross",
        "G5",
        "Tiro"
      ],
      [
        "Hora Final",
        "Final Hour",
        "G5",
        "Tiro"
      ]
    ],
    talento: {
      "nombre": "Ajuste Táctico",
      "ingles": "Tactical Setting",
      "descripcion": "Una vez por parte puede elegir el talento de uno de sus compañeros. El talento se lo quedará lo que reste de mitad."
    },
    espirituGuerrero: {
      nombre: "Ángel Del Caos Y La Destrucción, Lucifer",
      ingles: "Angel Of Chaos And Destruction, Lucifer",
      tecnicas: [
        [
          "Ala Seráfica",
          "Seraphic Wing",
          "Regate",
          ""
        ]
      ]
    },
    miximax: {
      nombre: "Gobwa Foster",
      tecnicas: [
        [
          "Sable Tornado",
          "Tornado Saber",
          "G5",
          "Regate"
        ]
      ]
    }
  },
  {
  nombre: "Justin Kaido",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Jin Kaido.jpg",
  elemento: "Psiquico",
  posicion: "Delantero",
  tecnicas: [
    [
        "Filo Del Abismo",
        "Precipice Blades",
        "G5",
        "Bloqueo",
        "",
        "Cosmico"
    ],
    [
        "Cañón Fénix Oscuro",
        "Dark Phoenix Cannon",
        "G5",
        "Tiro"
    ],
    [
        "Ascenso Draco",
        "Dragon Ascent",
        "G5",
        "Regate",
        "",
        "Cosmico"
    ]
],
  talento: {
    nombre: "Casanova",
    ingles: "Casanova",
    descripcion: "Los duelos contra chicas tienen una opcion extra de choose"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Siete de Marzo",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Siete de Marzo.jpg",
  elemento: "Hielo",
  posicion: "Defensa",
  tecnicas: [
    [
        "Lluvia Glacial",
        "Glacial Rain",
        "G5",
        "Bloqueo"
    ]
],
  talento: {
    nombre: "Hielo Compacto",
    ingles: "Packed Ice",
    descripcion: "Todas las supertécnicas de hielo se ven aumentadas en 2 por ambos bandos"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Kiyoka Sendou",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Kiyoka Sendou.jpg",
  elemento: "Psiquico",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Cúpula De Cartas",
        "Card Dome",
        "G5",
        "Bloqueo"
    ],
    [
        "Hélice Oscura",
        "Deathscythe Hurricane",
        "G5",
        "Regate"
    ],
    [
        "Mandala De Buda",
        "Buddha Mandala",
        "G5",
        "Tiro"
    ]
],
  talento: {
    nombre: "Grieta De La Suerte",
    ingles: "Lucky Rift",
    descripcion: "A cada choose que se tenga que tirar en el que Kiyoka esté afectada se tirará 1d4 con posibilidad de 0 y un nekochoose de + y -, el resultado se suma a lo dado en las tiradas"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Víctor Koga",
  titulo: "Tiburón Rojo",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Victor Koga.jpg",
  elemento: "Fuego",
  posicion: "Delantero",
  tecnicas: [
    [
        "Asalto Impulsivo",
        "Impulsive Assault",
        "G5",
        "Tiro"
    ],
    [
        "Cuatro Castillos",
        "Fourth Castle",
        "G5",
        "Bloqueo"
    ],
    [
        "Surfeo Tiburón",
        "Shark Surfing",
        "G5",
        "Regate"
    ],
    [
        "Pájaro De Fuego",
        "Fire Rooster",
        "G5",
        "Tiro"
    ]
],
  talento: {
    nombre: "Rugido Celestial",
    ingles: "Celestial Roar",
    descripcion: "Una vez cada dos goles contando de ambos bandos Víctor puede ganar un choose de forma automática"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "Dios Agni",
    tecnicas: [
    [
        "Pájaro Ardiente",
        "Flaming Firebird",
        "G5",
        "Tiro"
    ]
]
  }
},
{
  nombre: "Top Blaze",
  titulo: "Relámpago",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Top Blaze.jpg",
  elemento: "Fuego",
  posicion: "Delantero",
  tecnicas: [
    [
        "Impulso Cibernético",
        "Cyber Impulse",
        "G5",
        "Regate"
    ]
],
  talento: {
    nombre: "Sprint Flash",
    ingles: "Flash Sprint",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Jeanne d'Arc",
  titulo: "",
  equipo: "Lyon",
  imagen: "../Hijos Inazuma/pjs/Jeanne Darc.jpg",
  elemento: "Fuerza",
  posicion: "Defensa",
  tecnicas: [
    [
        "Fuego De Venus",
        "Venus Fire",
        "G5",
        "Tiro",
        "",
        "Fuego"
    ],
    [
        "Sacudida De La Llama Del Dragón Oscuro",
        "Dark Dragon Flame Shock",
        "G1",
        "Bloqueo",
        "Con 3+",
        "Fuego",
    ],
    [
        "Ataque Gigante",
        "Giant Attack",
        "G5",
        "Regate"
    ],
    [
        "Arremetida Estallido",
        "Burst Charge",
        "G5",
        "Bloqueo"
    ],
    [
        "Estallido De Odio",
        "Hate Burst",
        "G5",
        "Bloqueo"
    ],
    [
        "Lluvia Final",
        "Final Rain",
        "G5",
        "Bloqueo"
    ]
],
  talento: {
    nombre: "Femme Fatale",
    ingles: "Femme Fatale",
    descripcion: "+1 en duelos contra personajes masculinos."
  },
  espirituGuerrero: {
    nombre: "Stake Victim Dragon",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Joanna",
  titulo: "",
  equipo: "Lyon",
  imagen: "../Hijos Inazuma/pjs/Joanna Darc.webp",
  elemento: "Fuerza",
  posicion: "Defensa",
  tecnicas: [
    [
        "Estandarte Sagrado",
        "Sacred Standard",
        "G5",
        "Bloqueo",
        "",
        "Luz"
    ]
],
  talento: {
    nombre: "Bendición Divina",
    ingles: "God Bless",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Jibril Foster",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Jibril Foster.jpg",
  elemento: "Cosmico",
  posicion: "Delantero",
  tecnicas: [
    [
        "Materia Oscura",
        "Black Matter",
        "G5",
        "Tiro"
    ],
    [
        "Golpe Del Cielo",
        "Heaven's Strike",
        "G5",
        "Regate",
        "",
        "Luz"
    ],
    [
        "Hojas Del Juicio",
        "Judgement Blades",
        "G5",
        "Bloqueo",
        "",
        "Luz"
    ],
    [
        "Omnisabiduría Divina",
        "God Alone Knows",
        "G5",
        "Tiro",
        "",
        "Luz"
    ]
],
  talento: {
    nombre: "Recobro",
    ingles: "Recovery",
    descripcion: "Permite repetir el choose a la hora de hacer un duelo"
  },
  espirituGuerrero: {
    nombre: "Asesino De Dioses, Zamasu",
    ingles: "God's Killer, Zamasu",
    tecnicas: [
    [
        "Luz De La Absolución",
        "Absolving Light",
        "Tiro",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Akari Foster",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Akari Foster.jpg",
  elemento: "Cosmico",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Astro Metralla",
        "Stellar Shrapnel",
        "G5",
        "Tiro"
    ],
    [
        "Perforador Galáctico",
        "Galactic Piercer",
        "G5",
        "Regate"
    ],
    [
        "Quiebragalaxias",
        "Galactic Breaker",
        "G5",
        "Bloqueo"
    ]
],
  talento: {
    nombre: "Femme Fatale",
    ingles: "Femme Fatale",
    descripcion: "Los duelos contra chicos tienen una opcion extra de choose"
  },
  espirituGuerrero: {
    nombre: "Protectora De Jarilo VI, Cocolia",
    ingles: "Guardian Of Jarilo VI, Cocolia",
    tecnicas: [
    [
        "Castigo Del Invierno Eterno",
        "Eternal Winter Punishment",
        "Bloqueo",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Lidia Foster",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/LidiaAdolescente.jpg",
  elemento: "Luz",
  posicion: "Defensa",
  tecnicas: [
    [
        "Muro Duo-Sen",
        "Duo-Sen Wall",
        "G5",
        "Bloqueo",
        "Con Candace",
        "Bosque"
    ],
    [
        "Ojo De Dios",
        "God's Eye",
        "G5",
        "Regate",
        "",
      
    ],
    [
        "Deslumbramiento Celestial",
        "Heaven's Dazzle",
        "G5",
        "Bloqueo",
        "",
    ]
],
  talento: {
    nombre: "Ayuda De Reserva",
    ingles: "Reserve Assist",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Yachiho Azuma",
  titulo: "Golden Hour",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Yachiho Azuma.jpg",
  elemento: "Bosque",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Hora Celestial",
        "Heaven's Time",
        "G5",
        "Regate"
    ],
    [
        "Hora Final",
        "Final Hour",
        "G5",
        "Tiro"
    ]
],
  talento: {
    nombre: "Hora Punta",
    ingles: "Prime Time",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "Dios Del Tiempo, Chronos",
    ingles: "God Of Time, Chronos (Armadura)",
    tecnicas: [
    [
        "Bala De Oro",
        "Golden Bullet",
        "Tiro",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Himari Azuma",
  titulo: "",
  equipo: "",
  imagen: "../Hijos Inazuma/pjs/Himari Azuma.jpg",
  elemento: "Metal",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Mano Metralleta",
        "Machine-Gun Hand",
        "G5",
        "Regate"
    ],
    [
        "Lluvia De Balas",
        "Bullet Rain",
        "G5",
        "Regate"
    ]
],
  talento: {
    nombre: "Femme Fatale",
    ingles: "Femme Fatale",
    descripcion: "Los duelos contra chicos tienen una opcion extra de choose"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Norman Heartless",
  titulo: "",
  equipo: "Universal",
  imagen: "../Hijos Inazuma/pjs/Norman Hearthless.jpg",
  elemento: "Fuego",
  posicion: "",
  tecnicas: [
    [
        "Sombra De Fuego",
        "Fire Shadow",
        "G5",
        "Regate"
    ],
    [
        "Llama Pesadilla",
        "Nightmare Flare",
        "G5",
        "Tiro"
    ],
    [
        "Tornado Oscuro",
        "Dark Tornado",
        "G5",
        "Tiro"
    ],
    [
        "Bomba Espectral",
        "Spectral Bomb",
        "G5",
        "Bloqueo",
        "",
        "Sombra"
    ]
],
  talento: {
    nombre: "Linaje Heartless",
    ingles: "Heartless Lineage",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "Demonio Sombrío De La Bondad, Mujika",
    ingles: "Shadow Demon Of Kindness, Mujika",
    tecnicas: [
    [
        "Garra Demoníaca",
        "Demon's Claw",
        "Tiro",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Fubuki Sumiye",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Fubuki Sumiye.jpg",
  elemento: "Agua",
  posicion: "Portero",
  tecnicas: [
    [
        "Guardia Del Emperador",
        "Emperor Guard",
        "G5",
        "Parada"
    ],
    [
        "Atadura Divina",
        "Divine Bind",
        "G5",
        "Parada"
    ],
    [
        "Muralla Tsunami",
        "Tsunami Wall",
        "G5",
        "Parada"
    ]
],
  talento: {
    nombre: "Portero+",
    ingles: "Goalkeeper+",
    descripcion: "Tus acciones de portero aumentan en 1"
  },
  espirituGuerrero: {
    nombre: "Emperador Forneus",
    ingles: "Forneus Emperor",
    tecnicas: [
    [
        "Colmillo Acuático Oricalco",
        "Orichalcum Aqua Fang",
        "Parada",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Riko Wingate",
  titulo: "",
  equipo: "Alpino",
  imagen: "../Hijos Inazuma/pjs/Riko Wingate.jpg",
  elemento: "Hielo",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Regate Kitsune",
        "Kitsune Drible",
        "G5",
        "Regate"
    ],
    [
        "Kitsunes De Nieve",
        "Snow Kitsune's",
        "G5",
        "Bloqueo",
        "Con Bronya"
    ]
],
  talento: {
    nombre: "Defensa+",
    ingles: "Defense+",
    descripcion: "Tus choose defensivos aumentan en 1"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Rikuo Nura",
  titulo: "",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Rikuo Mura.jpg",
  elemento: "Dragon",
  posicion: "Delantero",
  tecnicas: [
    [
        "Dragón Ascendente",
        "Rising Dragon",
        "G5",
        "Regate"
    ],
    [
        "Rizo De Dragón",
        "Dragon Drive",
        "G5",
        "Tiro"
    ]
],
  talento: {
    nombre: "Refuerzo Samurái",
    ingles: "Samurái Reinforcement",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Shinoa Hiiragi",
  titulo: "",
  equipo: "Espejismo",
  imagen: "../Hijos Inazuma/pjs/Shinoa Hiiragi.jpg",
  elemento: "Sangre",
  posicion: "",
  tecnicas: [
    [
        "Luna Roja",
        "Red Moon",
        "G5",
        "Tiro"
    ],
    [
        "Colmillo De Vampiro",
        "Vampire Fang",
        "G5",
        "Bloqueo"
    ],
    [
        "Estrella Invertida",
        "Inverted Star",
        "G5",
        "Regate",
        "",
        "Cosmico"
    ],
    [
        "Bella Y Edward",
        "Bella And Edward",
        "G5",
        "Tiro",
        "con Hitoyoshi"
    ]
],
  talento: {
    nombre: "Runa Vampírica",
    ingles: "Vampiric Rune",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "Shikamadōji",
    ingles: "Shikamadōji",
    tecnicas: [
    [
        "Guadaña De Shikamadōji",
        "Shikamadōji Scythe",
        "Bloqueo",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Shinbad",
  titulo: "",
  equipo: "Osasuna",
  imagen: "../Hijos Inazuma/pjs/Shinbad Ramirez.jpg",
  elemento: "Fuerza",
  posicion: "",
  tecnicas: [
    [
        "Aullido Cometa",
        "Burning Bark",
        "G5",
        "Bloqueo"
    ],
    [
        "Meteorayo",
        "Meteobeam",
        "G5",
        "Tiro"
    ],
    [
        "Disparo Valiente",
        "Brave Shot",
        "G5",
        "Tiro"
    ]
],
  talento: {
    nombre: "Fuerza De Tiro",
    ingles: "Power Shot",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Giyuu Tomioka",
  titulo: "",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Tomioka.jpg",
  elemento: "Agua",
  posicion: "Delantero",
  tecnicas: [
    [
        "Katana Crisantemo",
        "Chrysanthemum Beeline",
        "G5",
        "Tiro",
        "",
        "Fuego"
    ],
    [
        "Chorro De Agua",
        "Liquid Flow",
        "G5",
        "Regate"
    ],
    [
        "Gran Catarata",
        "Waterfall",
        "G5",
        "Bloqueo"
    ],
    [
        "La Calma",
        "Deep Calm",
        "G5",
        "Regate"
    ]
],
  talento: {
    nombre: "Mejor Garantía",
    ingles: "Best Garantier",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Power Aoyama",
  titulo: "",
  equipo: "",
  imagen: "../Hijos Inazuma/pjs/Power Aoyama.jpg",
  elemento: "Sangre",
  posicion: "Portero",
  tecnicas: [
    [
        "Aplastamiento Sangriento",
        "Bloody Crash",
        "G5",
        "Parada"
    ]
],
  talento: {
    nombre: "Martillo De Sangre",
    ingles: "Blood Hammer",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "Demonio Motosierra, Denji",
    ingles: "Chainsaw Demon, Denji",
    tecnicas: [
    [
        "Avasallamiento Motosierra",
        "Chainsaw Overrun",
        "Parada",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Pan Walker",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Pan Walker.jpg",
  elemento: "Fuego",
  posicion: "Delantero",
  tecnicas: [
    [
        "Shunkanido",
        "Instant Transmision",
        "G5",
        "Regate"
    ],
    [
        "Genkidama",
        "Spirit Bomb",
        "G5",
        "Tiro"
    ]
],
  talento: {
    nombre: "Poder Dorado",
    ingles: "Golden Power",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "Supersaiyan",
    tecnicas: [
    [
        "Genkidama De Oro",
        "Golden Spirit Bomb",
        "G5",
        "Tiro"
    ]
]
  }
},
{
  nombre: "Flora Sprigan",
  titulo: "",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Flora Sprigan.jpg",
  elemento: "Aire",
  posicion: "Portero",
  tecnicas: [
    [
        "Trampa Vegetal",
        "Venus Belltrap",
        "G5",
        "Parada",
        "",
        "Bosque"
    ],
    [
        "Ciclón Oscuro",
        "Psychlone",
        "G5",
        "Parada"
    ],
    [
        "Agujero Blanco",
        "White Hole",
        "G5",
        "Parada"
    ],
    [
        "Polen Devastador",
        "Flower Plower",
        "G5",
        "Tiro",
        "",
        "Montana"
    ],
    [
        "Fiesta Floral",
        "Floral Fiesta",
        "G5",
        "Bloqueo"
    ]
],
  talento: {
    nombre: "Pétalo Negro",
    ingles: "Black Petal",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "Eris, Bruja De La Discordia",
    ingles: "Discordian Witch Eris",
    tecnicas: [
    [
        "Espinas Insidiosas",
        "Sordid Thorns",
        "",
        ""
    ]
]
  },
  miximax: {
    nombre: "Rosa Negra",
    tecnicas: [
    [
        "Tiro Supermasivo",
        "Supermassive Shot",
        "G5",
        "Tiro"
    ]
]
  }
},
{
  nombre: "Candace Foster",
  titulo: "Leopardo de la Ventisca",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Candace Foster.jpg",
  elemento: "Hielo",
  posicion: "Defensa",
  tecnicas: [
    [
        "Ojo de Dios",
        "God's Eye",
        "G5",
        "Regate",
        "Heredada de Nakaoka"
    ],
    [
        "Reina Leopardo",
        "Leopard Queen",
        "G5",
        "Bloqueo",
        "Heredada de Claire"
    ],
    [
        "Sabiduría Divina",
        "God's Knows",
        "G5",
        "Tiro",
        ""
    ],
    [
        "Fuego Cruzado Cósmico",
        "",
        "",
        "Tiro",
        "Con Mavuika y Norman"
    ],
    [
        "Cero Absoluta",
        "Absolute Zero",
        "",
        "Bloqueo",
        ""
    ]
],
  talento: {
    nombre: "Defensa+",
    ingles: "Defense+",
    descripcion: "+1 choose al defender"
  },
  espirituGuerrero: {
    nombre: "Chione, Reina de la Nieve",
    ingles: "Snow Nymph Chione",
    tecnicas: [
    [
        "Lanza de Carámbanos",
        "Icicle Road",
        "",
        "Tiro",
        ""
    ]
]
  },
  miximax: {
    nombre: "Diosa Isis",
    tecnicas: [
    [
        "Velo de <strong>Isis</strong>tencia",
        "Isis-tence Veil",
        "",
        "Bloqueo",
        ""
    ]
]
  }
},
{
  nombre: "Rebecca Whitering",
  titulo: "Delantera de Fuego",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Rebecca Whitering.jpg",
  elemento: "Fuego",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Trampa Ceniza",
        "Ash Trap",
        "G5",
        "Regate",
        "Heredada de Ethan"
    ],
    [
        "Flecha de Cupido",
        "Cupid's Arrow",
        "G5",
        "Tiro",
        "Heredada de Katya"
    ],
    [
        "Torbellino de Fuego",
        "Fireball Screw",
        "G5",
        "Tiro",
        ""
    ],
    [
        "Corte Flamígero",
        "Heat Tackle",
        "G5",
        "Regate",
        ""
    ],
    [
        "Pájaro de Fuego",
        "Fire Bird",
        "G5",
        "Tiro",
        "con Victor"
    ]
],
  talento: {
    nombre: "Femme Fatale",
    ingles: "",
    descripcion: "+1 choose en duelos contra hombres"
  },
  espirituGuerrero: {
    nombre: "Ave del Amanecer, Bennu",
    ingles: "Dawn Bird, Bennu",
    tecnicas: [
      [
        "Renacer del Sol",
        "Solar Rebirth",
        "Tiro"
      ]
    ]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Irina Greenway",
  titulo: "Heredera del Espacio-Tiempo",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Irina Greenway.jpg",
  elemento: "Cosmico",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Tiempo Emergente",
        "Rising Time",
        "G5",
        "Tiro",
        "Heredada de Isabelle"
    ],
    [
        "Danza Gravitatoria",
        "Gravitational Dance",
        "G5",
        "Regate",
        "Heredada de Jordan"
    ],
    [
        "Puesta en Órbita",
        "Orbit Deployment",
        "",
        "Regate",
        ""
    ],
    [
        "Expansión Cósmica",
        "Cosmic Expansion",
        "",
        "Bloqueo",
        ""
    ]
],
  talento: {
    nombre: "¡Vamos todos!",
    ingles: "Everyone Go Go!",
    descripcion: "+1 choose global si el equipo gana por diferencia de goles, -1 si pierde"
  },
  espirituGuerrero: {
    nombre: "Custodia del Flujo Infinito, Aión Astrae",
    ingles: "Guardian of the Infinite Flow, Aion Astraea",
    tecnicas: [
    [
        "Horizonte de los Posibles",
        "Possibility Horizon",
        "",
        "Regate",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},

{
  nombre: "Serena Kitagawa",
  titulo: "Supermodelo Mundial",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Serena Kitagawa.jpg",
  elemento: "Luz",
  posicion: "Defemsa",
  tecnicas: [
    [
        "Destellos de Pasarela",
        "Runway Gleam",
        "G5",
        "Bloqueo",
        ""
    ],
    [
        "Cabezazo Megatón",
        "Megaton Head",
        "G5",
        "Bloqueo",
        ""
    ]
],
  talento: {
    nombre: "Defensa+",
    ingles: "Defense+",
    descripcion: "+1 choose al defender"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Jikan Alonso",
  titulo: "Heredero Temporal",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Jikan Alonso.jpg",
  elemento: "Metal",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Poderoso Shogun",
        "Mighty Shogun",
        "G5",
        "Tiro",
        "Heredada de Iker"
    ],
    [
        "Zaphkiel Primera Bala: Aleph",
        "Zaphkiel Fisrt Bullet: Aleph",
        "G5",
        "Regate",
        "Heredada de Kurumi"
    ],
    [
        "Corona de Espadas",
        "Crown Blades",
        "G5",
        "Bloqueo",
        ""
    ],
    [
        "Ramen de Metralla",
        "Shrapnel Ramen",
        "G5",
        "Bloqueo",
        "Con Ryuji",
        "Fuego"
    ],
    [
        "Hora Final",
        "Final Hour",
        "",
        "Tiro",
        "Con Yachiho y Hikaru"
    ]
],
  talento: {
    nombre: "En Punto",
    ingles: "On the Dot",
    descripcion: "Permite repetir un duelo perdido. Para reutilizarlo, el equipo debe ganar 2 chooses."
  },
  espirituGuerrero: {
    nombre: "Emperador del Tiempo, Zaphkiel",
    ingles: "Time's Emperoor, Zaphkiel [Armadura]",
    tecnicas: [
    [
        "Zaphkiel Tercera Bala: Gimmel",
        "Zaphkiel, Third Bullet: Gimmel",
        "",
        "Tiro",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Shu Ogata",
  titulo: "Tirador Definitivo",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Shu Ogata.jpg",
  elemento: "Metal",
  posicion: "Delantero",
  tecnicas: [
    [
        "Bullet Time",
        "Tiempo bala",
        "G5",
        "Regate",
        ""
    ],
    [
        "Infierno Balístico",
        "Ballistic Hellfire",
        "G5",
        "Tiro",
        "",
        "Fuego"
    ],
    [
        "Defensa Férrea",
        "Iron Defense",
        "G5",
        "Defensa",
        ""
    ]
],
  talento: {
    nombre: "Puntería Asegurada",
    ingles: "Perfect Aim",
    descripcion: "Cualquier bloqueo que traten de hacer a Shu, se deberá realizar un !choose si, no, no. Si este sale que si, el tiro seguirá su curso, de lo contrario, se realizará el choose correspondiente al duelo."
  },
  espirituGuerrero: {
    nombre: "Guerrero Divino Imbatible, Rambo",
    ingles: "Unbeatable Divine Warrior, Rambo",
    tecnicas: [
    [
        "Ráfaga Celestial",
        "Heavenly Burst",
        "",
        "Tiro",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Sen Kaibara",
  titulo: "Taladrador Definitivo",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Sen Kaibara.jpg",
  elemento: "Fuerza",
  posicion: "Delantero",
  tecnicas: [
    [
        "Cascabel",
        "Sidewinder",
        "G5",
        "Tiro",
        "",
        "Montana"
    ],
    [
        "Turbotaladro",
        "Turbo Drill",
        "G2",
        "Tiro",
        ""
    ]
],
  talento: {
    nombre: "Taladrador",
    ingles: "Drill Mastery",
    descripcion: "Si Sen encadena más de un duelo sin interrumpir, obtendrá un choose más por duelo (acumulable hasta 3). Dicha racha se pierde si pasa, tira o pierde el balón."
  },
  espirituGuerrero: {
    nombre: "Shuten Rasendōji ",
    ingles: "酒天螺旋童子",
    tecnicas: [
      [
        "Espiral Oni Carmesí",
        "Kurenai Oni Rasen",
        "Regate",
        "",
        "Sombra"
      ]
    ]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Kuro Fujimoto",
  titulo: "Estratega Definitivo",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Kuro Fujimoto.jpg",
  elemento: "Psiquico",
  posicion: "Mediocentro",
  tecnicas: [
    [
        "Esquema Kurokawa",
        "Kurokawa Scheme",
        "G5",
        "Defensa",
        ""
    ],
    [
        "Estrategia Perfecta",
        "Perfect Strategy",
        "G5",
        "Regate",
        ""
    ]
],
  talento: {
    nombre: "",
    ingles: "",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Shiro Harukawa",
  titulo: "Asesino Definitivo",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Shiro Takeda.png",
  elemento: "",
  posicion: "",
  tecnicas: [
    [
        "Genufendiente",
        "Kowtow Cleave",
        "G5",
        "Tiro",
        ""
    ],
    [
        "Ejecución Sobría",
        "Sober Execution",
        "G5",
        "Tiro",
        "Con Lambda"
    ],
    [
        "Danza Espada",
        "Sword Dance",
        "G5",
        "Regate",
        ""
    ],
    [
        "Asalto Espadón",
        "Glaive Rush",
        "G5",
        "Bloqueo",
        ""
    ],
    [
        "Corte Divino",
        "Divine Slash",
        "G5",
        "Bloqueo",
        ""
    ]
],
  talento: {
    nombre: "Instinto Asesino",
    ingles: "Killer Instinct",
    descripcion: "Se escoge a un personaje del 11 titular y Shiro tendrá un choose más contra ese jugador."
  },
  espirituGuerrero: {
    nombre: "Personificación de la Muerte, Thanatos",
    ingles: "Personification of the Dead, Thanatos",
    tecnicas: [
      ["Juicio Silencioso",
        "Silent Judgment",
        "Tiro"
      ]
    ]
  },

  miximax: {
    nombre: "",
    tecnicas: []
  }
},

{
  nombre: "Nalu Tanaka",
  titulo: "Torpedo de Alta Mar",
  equipo: "MaryTimes",
  imagen: "../Hijos Inazuma/pjs/Nalu Tanaka.jpg",
  elemento: "Agua",
  posicion: "Delantero",
  tecnicas: [
    [
        "Torpedo",
        "",
        "G5",
        "Tiro",
        ""
    ]
],
  talento: {
    nombre: "Ola Monstruo",
    ingles: "Monster Wave",
    descripcion: "Si Nalu encadena un tiro con una Supertécnica de afinidad Agua, sus chooses aumentan según cuántos compañeros participen en la cadena (sin contarse a él) = Nalu + 1 compañero → +1 choose, Nalu + 2 compañeros → +2 chooses"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Peko Pekoyama",
  titulo: "Espadachina Definitiva",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Peko Pekoyama.jpg",
  elemento: "Metal",
  posicion: "",
  tecnicas: [
    [
        "Katana Crisantemo",
        "Chrysanthemum Katana",
        "G5",
        "Tiro",
        ""
    ],
    [
        "Estocada Certera",
        "Sure-Strike Thrust",
        "G5",
        "Regate",
        ""
    ]
],
  talento: {
    nombre: "Guardiana de la Katana",
    ingles: "Katana Guardian",
    descripcion: "Si un compañero cercano (de la misma posición) pierde un duelo, Peko puede interceptar: repite el duelo en su lugar, pero con −1 choose."
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Chiaki Nanami",
  titulo: "Gamer Definitiva",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Nanami.jpg",
  elemento: "Bosque",
  posicion: "Defensa",
  tecnicas: [
    [
        "Cuenta Baneada",
        "Banned Account",
        "G5",
        "Bloqueo",
        "",
        "Hielo"
    ],
    [
        "Space Invaders",
        "",
        "G5",
        "Bloqueo",
        "Con Miu Iruma"
    ]
],
  talento: {
    nombre: "",
    ingles: "",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Akane Owari",
  titulo: "Atleta Definitiva",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Akane Owari.jpg",
  elemento: "Fuerza",
  posicion: "Delantera",
  tecnicas: [
    [
        "Embiste de Toro",
        "Bull Charge",
        "G5",
        "Regate",
        ""
    ],
    [
        "Rugido Salvaje",
        "Salvage Roar",
        "G5",
        "Tiro",
        ""
    ],
    [
        "Dragon Nova",
        "",
        "G3",
        "Tiro",
        "",
        "Dragon"
    ]
],
  talento: {
    nombre: "",
    ingles: "",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "Dragón Supremo, Bahamut",
    ingles: "Supreme Dragon, Bahamut",
    tecnicas: [
      [
        "Megaflama Primordial",
        "Primordial Hyperflame",
        "Tiro"
      ]
    ]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Miu Iruma",
  titulo: "Inventora Definitiva",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Miu Iruma.jpg",
  elemento: "Metal",
  posicion: "Defensa",
  tecnicas: [
    [
        "Space Invaders",
        "",
        "G5",
        "Bloqueo",
        "Con Nanami",
        "Bosque"
    ],
    [
        "Acero Puro",
        "Real Steel",
        "G5",
        "Bloqueo",
        ""
    ],
    [
        "Sorpresa",
        "Sorprise",
        "G5",
        "Bloqueo",
        "",
        "Fuerza"
    ]
],
  talento: {
    nombre: "Femme Fatale",
    ingles: "",
    descripcion: "+1 en choose contra hombres"
  },
  espirituGuerrero: {
    nombre: "Deus-Machina, Mecha Godzilla",
    ingles: "",
    tecnicas: [
      [
        "Caos",
        "Doom",
        "Defensa"
      ]
    ]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Bronya Wingate",
  titulo: "Viento Fresco de Hokkaido",
  equipo: "Alpino",
  imagen: "../Hijos Inazuma/pjs/Bronya Wingate.jpg",
  elemento: "Hielo",
  posicion: "Defensa",
  tecnicas: [
    [
        "Cuenta Baneada",
        "Banned Account",
        "G5",
        "Bloqueo",
        ""
    ],
    [
        "Kitsunes de Nieve",
        "Snow Kitsunes",
        "G5",
        "Bloqueo",
        "Con Riko"
    ]
],
  talento: {
    nombre: "Defensa+",
    ingles: "Defense+",
    descripcion: "Otorga un choose más a la hora de defender"
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Yokoya Hitoyoshi",
  titulo: "Tactico Sombrío",
  equipo: "Espejismo",
  imagen: "../Hijos Inazuma/pjs/Yokoya Hitoyoshi.jpg",
  elemento: "Sombra",
  posicion: "",
  tecnicas: [
    [
        "Bella y Edward",
        "",
        "G5",
        "Tiro",
        "Con Shinoa",
        "Sangre"
    ],
    [
        "Luna de Sangre",
        "",
        "G5",
        "Tiro",
        "",
        "Sangre"
    ]
],
  talento: {
    nombre: "Ataque+",
    ingles: "Attack+",
    descripcion: "+1 en todos los chooses de regate"
  },
  espirituGuerrero: {
    nombre: "Heraldo del Abismo, Darkrai.",
    ingles: "Herald of the Abyss, Darkrai",
    tecnicas: [
    [
        "Brecha Negra",
        "Dark Void",
        "Tiro",
        "",
        ""
    ]
]
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Maki Harukawa",
  titulo: "Asesina Definitiva",
  equipo: "Galaxia",
  imagen: "../Hijos Inazuma/pjs/Maki Harukawa.jpg",
  elemento: "Sangre",
  posicion: "Defensa",
  tecnicas: [
    [
        "Cruce Motosierra",
        "Chainsaw Cross",
        "G5",
        "Bloqueo",
        "",
        "Metal"
    ]
],
  talento: {
    nombre: "Instinto Asesino",
    ingles: "Killer Instinct",
    descripcion: "Dos veces por partido, Maki puede usar este talento para anticiparse a su oponente: si entra en un duelo de robo o interceptación, su efectividad aumenta en +2."
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
{
  nombre: "Irene Villa",
  titulo: "Sombra Felina",
  equipo: "Raimon",
  imagen: "../Hijos Inazuma/pjs/Irene Villa.png",
  elemento: "Montana",
  posicion: "Portero",
  tecnicas: [
    [
        "Garra Celestial",
        "God Claw",
        "G5",
        "Parada",
        ""
    ],
    [
        "Zarpazo de Acero",
        "Steel Slash",
        "",
        "Parada",
        "",
        "Metal"
    ],
    [
        "Muralla Pireneica",
        "Pyrenean Wall",
        "G3",
        "Parada",
        ""
    ],
    [
        "Mano Celestial del Tigre",
        "God Hand Tiger",
        "G5",
        "Parada",
        ""
    ],
    [
        "Salto Felino",
        "Feline Leap",
        "G2",
        "Bloqueo",
        ""
    ],
    [
        "Rugido Final",
        "Final Roar",
        "G5",
        "Tiro",
        "con David"
    ]
],
  talento: {
    nombre: "",
    ingles: "",
    descripcion: ""
  },
  espirituGuerrero: {
    nombre: "",
    ingles: "",
    tecnicas: []
  },
  miximax: {
    nombre: "",
    tecnicas: []
  }
},
  // Copia este bloque para añadir más personajes:
  /*
  {
    nombre: "Mavuika",
    titulo: "La Estrella Ardiente",
    imagen: "img/mavuika.png",
    elemento: "Fuego",
    posicion: "Delantera",
    tecnicas: [],
    talento: {
      nombre: "",
      ingles: "",
      descripcion: ""
    },
    espirituGuerrero: {
      nombre: "",
      ingles: "",
      tecnicas: []
    },
    miximax: {
      nombre: "",
      tecnicas: []
    }
  }
  */
];


const selector = document.getElementById("selector-personajes");
const ficha = document.getElementById("ficha-personaje");
const buscador = document.getElementById("buscador-personajes");
const contador = document.getElementById("contador-personajes");

const filtroAfinidad = document.getElementById("filtro-afinidad");
const filtroPosicion = document.getElementById("filtro-posicion");
const filtroEquipo = document.getElementById("filtro-equipo");
const filtroTipo = document.getElementById("filtro-tipo");
const limpiarFiltrosBtn = document.getElementById("limpiar-filtros");
const toggleFiltrosBtn = document.getElementById("toggle-filtros");
const filtrosPanel = document.getElementById("filtros-panel");
const filtrosContenido = document.getElementById("filtros-contenido");
const chipsEspeciales = Array.from(document.querySelectorAll(".filtro-chip"));

let personajeActivo = 0;

const estadoFiltros = {
  busqueda: "",
  afinidad: "",
  posicion: "",
  equipo: "",
  tipo: "",
  especiales: new Set()
};

function normalizarTexto(texto = "") {
  return String(texto ?? "")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function posicionCanonica(posicion = "") {
  const p = normalizarTexto(posicion);
  const posiciones = {
    portero: "Portero",
    por: "Portero",
    pt: "Portero",
    defensa: "Defensa",
    defemsa: "Defensa",
    df: "Defensa",
    def: "Defensa",
    mediocentro: "Mediocentro",
    medio: "Mediocentro",
    centrocampista: "Mediocentro",
    mc: "Mediocentro",
    delantero: "Delantero",
    delantera: "Delantero",
    dc: "Delantero",
    dl: "Delantero",
    gerente: "Gerente",
    ge: "Gerente",
    entrenador: "Entrenador",
    dt: "Entrenador"
  };

  return posiciones[p] || String(posicion || "").trim();
}

function tecnicaTipo(tecnica = []) {
  const tipo = normalizarTexto(tecnica?.[3]);
  if (["tiro", "disparo"].includes(tipo)) return "Tiro";
  if (["regate", "drible", "dribble"].includes(tipo)) return "Regate";
  if (["bloqueo", "defensa"].includes(tipo)) return "Bloqueo";
  if (["parada", "atajada", "portero"].includes(tipo)) return "Parada";
  return String(tecnica?.[3] || "").trim();
}

function tecnicaAfinidad(tecnica = [], pj = {}) {
  return String(tecnica?.[5] || pj.elemento || "").trim();
}

function textoBusqueda(pj) {
  const tecnicas = (pj.tecnicas || []).flatMap(st => st || []);
  const eg = [
    pj.espirituGuerrero?.nombre,
    pj.espirituGuerrero?.ingles,
    ...(pj.espirituGuerrero?.tecnicas || []).flat()
  ];
  const miximax = [
    pj.miximax?.nombre,
    ...(pj.miximax?.tecnicas || []).flat()
  ];

  return normalizarTexto([
    pj.nombre,
    pj.titulo,
    pj.equipo,
    pj.elemento,
    pj.posicion,
    posicionCanonica(pj.posicion),
    pj.talento?.nombre,
    pj.talento?.ingles,
    pj.talento?.descripcion,
    ...tecnicas,
    ...eg,
    ...miximax
  ].filter(Boolean).join(" "));
}

function opcionesUnicas(valores) {
  return [...new Set(
    valores
      .map(v => String(v || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function rellenarSelect(select, textoTodas, opciones) {
  if (!select) return;
  const valorPrevio = select.value;
  select.innerHTML = `<option value="">${textoTodas}</option>` +
    opciones.map(opcion => `<option value="${opcion}">${opcion}</option>`).join("");
  select.value = opciones.includes(valorPrevio) ? valorPrevio : "";
}

function tieneEG(pj) {
  return Boolean(
    pj.espirituGuerrero?.nombre ||
    pj.espirituGuerrero?.ingles ||
    (pj.espirituGuerrero?.tecnicas || []).length
  );
}

function tieneMiximax(pj) {
  return Boolean(
    pj.miximax?.nombre ||
    (pj.miximax?.tecnicas || []).length
  );
}

function tieneCombinada(pj) {
  return (pj.tecnicas || []).some(st => {
    const extra = normalizarTexto(st?.[4]);
    return extra.startsWith("con ") || extra.includes(" con ");
  });
}

function sincronizarEstadoDesdeHTML() {
  estadoFiltros.busqueda = normalizarTexto(buscador?.value || "");
  estadoFiltros.afinidad = filtroAfinidad?.value || "";
  estadoFiltros.posicion = filtroPosicion?.value || "";
  estadoFiltros.equipo = filtroEquipo?.value || "";
  estadoFiltros.tipo = filtroTipo?.value || "";
}

function hayFiltrosActivos() {
  return Boolean(
    estadoFiltros.busqueda ||
    estadoFiltros.afinidad ||
    estadoFiltros.posicion ||
    estadoFiltros.equipo ||
    estadoFiltros.tipo ||
    estadoFiltros.especiales.size
  );
}

function actualizarEstadoVisualFiltros() {
  filtrosPanel?.classList.toggle("tiene-filtros", hayFiltrosActivos());

  chipsEspeciales.forEach(chip => {
    chip.classList.toggle("activo", estadoFiltros.especiales.has(chip.dataset.especial));
  });
}

function coincideConEspeciales(pj) {
  if (!estadoFiltros.especiales.size) return true;
  if (estadoFiltros.especiales.has("eg") && !tieneEG(pj)) return false;
  if (estadoFiltros.especiales.has("miximax") && !tieneMiximax(pj)) return false;
  if (estadoFiltros.especiales.has("combinada") && !tieneCombinada(pj)) return false;
  return true;
}

function personajesFiltrados() {
  const afinidad = normalizarTexto(estadoFiltros.afinidad);
  const posicion = normalizarTexto(estadoFiltros.posicion);
  const equipo = normalizarTexto(estadoFiltros.equipo);
  const tipo = normalizarTexto(estadoFiltros.tipo);
  const busqueda = estadoFiltros.busqueda;

  return personajes
    .map((pj, index) => ({ pj, index }))
    .filter(({ pj }) => {
      const coincideBusqueda = !busqueda || textoBusqueda(pj).includes(busqueda);
      const coincideAfinidad = !afinidad ||
        normalizarTexto(pj.elemento) === afinidad ||
        (pj.tecnicas || []).some(st => normalizarTexto(tecnicaAfinidad(st, pj)) === afinidad);
      const coincidePosicion = !posicion || normalizarTexto(posicionCanonica(pj.posicion)) === posicion;
      const coincideEquipo = !equipo || normalizarTexto(pj.equipo) === equipo;
      const coincideTipo = !tipo || (pj.tecnicas || []).some(st => normalizarTexto(tecnicaTipo(st)) === tipo);

      return coincideBusqueda && coincideAfinidad && coincidePosicion && coincideEquipo && coincideTipo && coincideConEspeciales(pj);
    });
}

function inicializarFiltros() {
  const afinidades = opcionesUnicas([
    ...personajes.map(pj => pj.elemento),
    ...personajes.flatMap(pj => (pj.tecnicas || []).map(st => tecnicaAfinidad(st, pj)))
  ]);

  const posiciones = opcionesUnicas(personajes.map(pj => posicionCanonica(pj.posicion)));
  const equipos = opcionesUnicas(personajes.map(pj => pj.equipo));
  const tipos = opcionesUnicas(personajes.flatMap(pj => (pj.tecnicas || []).map(st => tecnicaTipo(st))));

  rellenarSelect(filtroAfinidad, "Todas", afinidades);
  rellenarSelect(filtroPosicion, "Todas", posiciones);
  rellenarSelect(filtroEquipo, "Todos", equipos);
  rellenarSelect(filtroTipo, "Todas", tipos);
}

function asegurarPersonajeVisible(visibles) {
  if (!visibles.length) return;
  if (!visibles.some(({ index }) => index === personajeActivo)) {
    personajeActivo = visibles[0].index;
  }
}

function renderSelector() {
  const visibles = personajesFiltrados();
  asegurarPersonajeVisible(visibles);

  if (contador) contador.textContent = `${visibles.length}/${personajes.length}`;

  if (!selector) return;

  if (!visibles.length) {
    selector.innerHTML = `
      <div class="sin-resultados">
        <strong>No hay jugadores</strong>
        <span>Prueba con otra afinidad, posición, equipo, tipo de ST o búsqueda.</span>
      </div>
    `;
    return;
  }

  selector.innerHTML = visibles.map(({ pj, index }, orden) => {
    const activo = index === personajeActivo ? "activo" : "";
    const elemento = pj.elemento || "";
    const iconoElemento = iconosAfinidad[elemento] || "";
    const posicion = posicionCanonica(pj.posicion);
    const iconoPosicion = iconosPosicion[posicion] || "";

    return `
      <button class="slot-personaje ${activo} afinidad-${afinidadClase(elemento)}" data-index="${index}" style="--delay:${orden * 18}ms">
        <div class="slot-foto">
          <img src="${pj.imagen}" alt="${pj.nombre}">
        </div>

        <div class="slot-info">
          <strong>${pj.nombre}</strong>
          <span>${pj.titulo || pj.equipo || posicion || "Jugador"}</span>
        </div>

        <div class="slot-mini-icons">
          ${iconoElemento ? `<img src="${iconoElemento}" alt="${elemento}">` : ""}
          ${iconoPosicion ? `<img src="${iconoPosicion}" alt="${posicion}">` : ""}
        </div>
      </button>
    `;
  }).join("");

  selector.querySelectorAll(".slot-personaje").forEach(btn => {
    btn.addEventListener("click", () => {
      personajeActivo = Number(btn.dataset.index);
      renderSelector();
      renderFicha(personajes[personajeActivo]);
    });
  });
}

function crearTecnica(tecnica, elementoPersonaje) {
  const [nombre, ingles, grado, tipo, extra, afinidad] = tecnica;
  const elementoTecnica = afinidad || elementoPersonaje;
  const tipoLimpio = tecnicaTipo(tecnica);
  const icono = iconosAfinidad[elementoTecnica] || "";
  const iconoGrado = iconosGrado[grado] || "";
  const claseAfinidad = afinidadClase(elementoTecnica);

  return `
    <li class="tecnica afinidad-${claseAfinidad}">
      <div class="tecnica-main">
        ${icono ? `<img class="icono-tecnica" src="${icono}" alt="${elementoTecnica}">` : ""}
        <div>
          <strong>${nombre || "Técnica sin nombre"}</strong>
          ${ingles ? `<span>/ ${ingles}</span>` : ""}
        </div>
      </div>

      <div class="tecnica-tags">
        ${iconoGrado ? `<img class="icono-grado" src="${iconoGrado}" alt="${grado}">` : grado ? `<b>${grado}</b>` : ""}
        ${tipoLimpio ? `<em>${tipoLimpio}</em>` : ""}
        ${extra ? `<small>${extra}</small>` : ""}
      </div>
    </li>
  `;
}

function renderListaExtra(titulo, subtitulo, lista, tipoFallback = "") {
  const hayContenido = subtitulo || (lista && lista.length);

  return `
    <section class="bloque bloque-extra ${!hayContenido ? "bloque-vacio" : ""}">
      <h4>${titulo}</h4>
      ${subtitulo ? `<h5>${subtitulo}</h5>` : `<p class="sub">No registrado.</p>`}
      <ul>
        ${(lista || []).map(st => `
          <li class="tecnica">
            <div class="tecnica-main">
              <div>
                <strong>${st[0] || "Técnica"}</strong>
                ${st[1] ? `<span>/ ${st[1]}</span>` : ""}
              </div>
            </div>
            <div class="tecnica-tags">
              ${st[2] || tipoFallback ? `<em>${tecnicaTipo(["", "", "", st[2] || tipoFallback])}</em>` : ""}
            </div>
          </li>
        `).join("")}
      </ul>
    </section>
  `;
}

function renderFicha(pj) {
  if (!ficha || !pj) return;

  const elemento = pj.elemento || "";
  const iconoElemento = iconosAfinidad[elemento] || "";
  const posicion = posicionCanonica(pj.posicion);
  const iconoPosicion = iconosPosicion[posicion] || "";
  const escudo = pj.equipo && escudosEquipos[pj.equipo] ? escudosEquipos[pj.equipo] : "";

  ficha.innerHTML = `
    <article class="panel-ficha afinidad-${afinidadClase(elemento)}">
      <section class="hero-jugador">
        <div class="retrato-grande">
          <img src="${pj.imagen}" alt="${pj.nombre}">
        </div>

        <div class="hero-info">
          <div class="numero-falso">${String(personajeActivo + 1).padStart(2, "0")}</div>
          <p class="eyebrow">PLAYER FILE</p>
          <h2>${pj.nombre}</h2>
          ${pj.titulo ? `<h3>${pj.titulo}</h3>` : ""}

          <div class="datos-rapidos">
            ${elemento ? `
              <span class="chip-afinidad afinidad-${afinidadClase(elemento)}">
                ${iconoElemento ? `<img src="${iconoElemento}" alt="${elemento}">` : ""}
                ${elemento}
              </span>` : ""}

            ${posicion ? `
              <span class="chip-posicion">
                ${iconoPosicion ? `<img src="${iconoPosicion}" alt="${posicion}">` : ""}
                ${posicion}
              </span>` : ""}

            ${pj.equipo ? `<span class="chip-equipo">${pj.equipo}</span>` : ""}
          </div>
        </div>

        ${escudo ? `<img class="escudo-equipo" src="${escudo}" alt="${pj.equipo}">` : ""}
      </section>

      <section class="contenido-ficha">
        <section class="bloque bloque-tecnicas">
          <h4>Supertécnicas</h4>
          <ul>
            ${(pj.tecnicas || []).map(t => crearTecnica(t, elemento)).join("") || `<p class="sub">Sin técnicas registradas.</p>`}
          </ul>
        </section>

        <section class="bloque talento">
          <h4>Talento</h4>
          ${(pj.talento?.nombre || pj.talento?.ingles || pj.talento?.descripcion) ? `
            <h5>${pj.talento.nombre || "Talento"} ${pj.talento.ingles ? `<span>/ ${pj.talento.ingles}</span>` : ""}</h5>
            <p>${pj.talento.descripcion || "Sin descripción."}</p>
          ` : `<p class="sub">No registrado.</p>`}
        </section>

        ${renderListaExtra("Espíritu Guerrero", pj.espirituGuerrero?.nombre, pj.espirituGuerrero?.tecnicas)}
        ${pj.espirituGuerrero?.ingles ? `<p class="eg-ingles">${pj.espirituGuerrero.ingles}</p>` : ""}
        ${renderListaExtra("Miximax", pj.miximax?.nombre, pj.miximax?.tecnicas)}
      </section>
    </article>
  `;

  ficha.classList.remove("animar-ficha");
  void ficha.offsetWidth;
  ficha.classList.add("animar-ficha");
}

function aplicarFiltrosYRenderizar() {
  sincronizarEstadoDesdeHTML();
  const visibles = personajesFiltrados();
  asegurarPersonajeVisible(visibles);
  actualizarEstadoVisualFiltros();
  renderSelector();

  if (visibles.length) {
    renderFicha(personajes[personajeActivo]);
  } else if (ficha) {
    ficha.innerHTML = `
      <article class="panel-ficha panel-sin-resultados">
        <section class="bloque sin-resultados-grande">
          <h4>Sin resultados</h4>
          <p>No hay ningún jugador que cumpla esos filtros.</p>
        </section>
      </article>
    `;
  }
}

function limpiarTodosLosFiltros() {
  if (buscador) buscador.value = "";
  [filtroAfinidad, filtroPosicion, filtroEquipo, filtroTipo].forEach(select => {
    if (select) select.value = "";
  });

  estadoFiltros.busqueda = "";
  estadoFiltros.afinidad = "";
  estadoFiltros.posicion = "";
  estadoFiltros.equipo = "";
  estadoFiltros.tipo = "";
  estadoFiltros.especiales.clear();

  personajeActivo = 0;
  aplicarFiltrosYRenderizar();
}

function conectarEventosFiltros() {
  buscador?.addEventListener("input", aplicarFiltrosYRenderizar);

  [filtroAfinidad, filtroPosicion, filtroEquipo, filtroTipo].forEach(select => {
    select?.addEventListener("change", aplicarFiltrosYRenderizar);
  });

  chipsEspeciales.forEach(chip => {
    chip.addEventListener("click", () => {
      const especial = chip.dataset.especial;
      if (!especial) return;

      if (estadoFiltros.especiales.has(especial)) {
        estadoFiltros.especiales.delete(especial);
      } else {
        estadoFiltros.especiales.add(especial);
      }

      aplicarFiltrosYRenderizar();
    });
  });

  limpiarFiltrosBtn?.addEventListener("click", limpiarTodosLosFiltros);

  toggleFiltrosBtn?.addEventListener("click", () => {
    const abierto = filtrosPanel?.classList.toggle("abierto");
    toggleFiltrosBtn.setAttribute("aria-expanded", String(Boolean(abierto)));

    if (filtrosContenido) {
      filtrosContenido.hidden = false;
    }
  });
}

function iniciarPagina() {
  inicializarFiltros();
  conectarEventosFiltros();
  sincronizarEstadoDesdeHTML();
  actualizarEstadoVisualFiltros();
  aplicarFiltrosYRenderizar();
}

iniciarPagina();
