/* Catálogo de Resonance. Separado de la interfaz para facilitar su mantenimiento. */
const characters = [
    {
        character: "Freyja Kane",
        characterFace: "img/FreyjaKane.webp",
        lore: "Freyja Kane representa una justicia física y directa: no como discurso bonito, sino como el martillazo que cae cuando alguien decide proteger a los demás aunque le tiemblen las manos.",
        tracks: [
            {
                songTitle: "Hammer of Justice",
                songDescription: "La canción de una guerrera que ha aprendido la agilidad de la Tortuga Justiciera.",
                songCover: "img/FreyjaCover.jpg",
                audio: "audio/Hammer of Justice.mp3",
                tags: ["emotional", "normalbattle"],
                lore: "Hammer of Justice representa la justicia como una fuerza física: no como discurso bonito, sino como el martillazo que cae cuando alguien decide proteger a los demás aunque le tiemblen las manos."
            },
            {
                songTitle: "Judgement of Justice",
                songDescription: "La verdadera justicia no necesita gritar. Solo dictar sentencia.",
                songCover: "img/FreyjaCover2.png",
                audio: "audio/Judgement of Justice.mp3",
                tags: ["emotional", "bossbattle", "supersaiyan", "finalphase"],
                lore: "Cuando la falsa justicia y la sentencia corrupta amenazaron aquello que Freyja juró proteger, el martillo dejó de ser suficiente. El poder que despertó aquella noche no nació de la ira, sino de la convicción absoluta. 'This is your Judgement of Justice.'"
            },
        ]
    },
    {
        character: "Shiva Kane",
        characterFace: "img/Shiva.jpg",
        lore: "La pequeña de los Kane, diminuta pero orgullosa como nadie, moriría antes de reconocer la derrota y mataría por proteger a su familia",
        tracks: [
            {
                songTitle: "Psychic",
                songDescription: "La mente se vuelve omnisciente, el poder se transforma en ondas psíquicas, Shiva ha despertado",
                songCover: "img/ShivaCover.jpg",
                audio: "audio/Psychic.mp3",
                tags: ["Boss Battle"],
                lore: "Capaz de lanzar meteoritos con su nuevo poder luchará hasta la muerte con pasión y orgullo, si hace falta morirá de pie"
            },
            {
                songTitle: "Pride",
                songDescription: "La fuerza y la furia aumentan, la pequeña Shiva a alcanzado por fin a sus hermanos y arde en deseos de enfrentar a la amenaza",
                songCover: "img/ShivaCover2.png",
                audio: "audio/Pride.mp3",
                tags: ["Boss Battle"],
                lore: "El poder del legendario super Saiyan y la legendaria familia Kane, unidas ambas leyendas en esta diminuta pero orgullosa guerrera"
            }
        ]
    },
    {
        character: "Ares Kane",
        characterFace: "img/AresKane.png",
        lore: "Ares, mayor que sus hermanas, hará todo lo que esté en su mano para protegerlas, incluso dejando atrás levemente su humanidad",
        tracks: [
            {
                songTitle: "Emerald Pride",
                songDescription: "El himno del conocido como Dios Esmeralda, el saiyan que hacer temer a todos sus enemigos con su presencia",
                songCover: "img/AresCover.png",
                audio: "audio/Emerald Pride.mp3",
                tags: ["Epic Battle", "Emotional"],
                lore: "Incluso el saiyan más humano tiene un orgullo que defender, el orgullo de su familia."
            },
            {
                songTitle: "God Of War",
                songDescription: "La canción que demuestra el poder de la furia del mayor de los Kane.",
                songCover: "img/Ares2Cover.png",
                audio: "audio/God Of War.mp3",
                tags: ["Epic Battle", "Emotional"],
                lore: "Ares, el Dios de la Guerra, en su máximo poder, moverá cielo y tierra para obtener venganza"
            }
        ]
    },
    {
        character: "Gerson Boom",
        characterFace: "img/Gerson.png",
        lore: "Un antiguo guerrero eclipse cuya época ya pasó, ahora es el maestro de la familia Kane, además de historiador",
        tracks: [
            {
                songTitle: "The Elder Hammer Of Justice",
                songDescription: "La canción del legendario Martillo de la Justicia, un ancestral guerrero que sirvió al mundo hará 2000 años",
                songCover: "img/GersonCover.png",
                audio: "audio/The Elder Hammer Of Justice.mp3",
                tags: ["Serious Battle", "Epic", "Heroic"],
                lore: "Cuando los héroes de hoy en día no son suficiente, las viejas glorias tienen que empuñar una última vez su martillo"
            },
            {
            songTitle: "Another Tale",
            songDescription: "Cuando Gerson cuenta una historia, el mundo calla. Déjate llevar por el maravilloso universo de la literatura!",
            songCover: "img/GersonCover2.png",
            audio: "audio/Another Tale.mp3",
            tags: ["Chill", "Ambiental", "calm"],
            lore: "Érase una vez, Gerson, un poderoso héroe conocido como el Señor del Martillo yacía tumbado en una pradera. 'Otra vez la misma historia? Cuenta otra distinta papá!'"
            }
        ]
    },
    {
        character: "Tao Saotome",
        characterFace: "img/TaoSaotome.jpg",
        lore: "Tao se ha entrenado para ser la mejor cazademonios de la historia. Con su pistola y agilidad física no hay nada que se le resista.",
        tracks: [
            {
                songTitle: "Demon's Last Mistake",
                songDescription: "Si Tao apunta, no es necesario que te preocupes por sobrevivir.",
                songCover: "img/TaoCover.png",
                audio: "audio/Demon's Last Mistake.mp3",
                tags: ["normalbattle"],
                lore: "Tao es el cazademonios más letal de la historia, con su pistola y agilidad física no hay nada que se le resista."
            }
        ]
    },
    {
        character: "Kael Kane",
        characterFace: "img/KaelKane.jpg",
        lore: "Kael es alguien marcado por el destierro, la rabia y la necesidad de demostrar que su existencia no fue un error.",
        tracks: [
            {
                songTitle: "I Was Never Chosen",
                songDescription: "La canción de alguien que nunca se ha sentido elegido, siempre se ha sentido abandonado, teniendo que luchar por meritaje propio.",
                songCover: "img/Kael2Cover.png",
                audio: "audio/I Was Never Chosen.mp3",
                tags: ["bossbattle"],
                lore: "I Was Never Chosen es el grito de desesperación ante una vida que no eligió vivir, plasmando en ella todo tipo de venganza hacia aquellos que le causaron ese futuro."
            },
            {
                songTitle: "Born Wrong",
                songDescription: "La canción de alguien que fue desterrado de una familia y ahora busca venganza.",
                songCover: "img/KaelCover.png",
                audio: "audio/Born Wrong.mp3",
                tags: ["rage", "emotional"],
                lore: "Born Wrong suena como una herida que aprendió a caminar. No habla solo de rabia: habla de alguien convencido de que nació en el lado equivocado de una historia que jamás le pidió permiso."
            }
        ]
    },
    {
        character: "Nara Midori",
        characterFace: "img/NaraMidori.png",
        lore: "Nara Midori lucha contra su corrupción interna sin dejar que destruya aquello que ama. Su conflicto no es solo vencer: es seguir siendo ella.",
        tracks: [
            {
                songTitle: "Determination of the World",
                songDescription: "Nadie conoce sus límites, pero todos conocen su determinación.",
                songCover: "img/GoodNaraCover.png",
                audio: "audio/Determination of the Earth.mp3",
                tags: ["normal battle"],
                lore: "Ella protegerá lo que ama, aunque aún no sepa hasta dónde puede llegar.."
            },
            {
                songTitle: "SAVE her Soul",
                songDescription: "Si no logramos alcanzarla ahora, la perderemos para siempre.",
                songCover: "img/NaraCorruptaCover1.png",
                audio: "audio/SAVE Her Soul.mp3",
                tags: ["final boss", "emotional"],
                lore: "SAVE her Soul es una batalla contra la corrupción, pero también contra la rendición. La canción no pide destruir a Nara: pide llegar hasta ella antes de que su cuerpo decida romper todo lo que ama."
            },
            {
                songTitle: "But She Refused",
                songDescription: "Por mucho que la oscuridad insistiera, ella se negó a caer.",
                songCover: "img/NaraCover.png",
                audio: "audio/But She Refused.mp3",
                tags: ["emotional", "final boss"],
                lore: "But She Refused es el momento en el que Nara deja de hundirse y empieza a pelear por sí misma. No es una victoria feliz: es una decisión firme. No va a dejar que su parte corrupta destruya aquello que ama."
            }
        ]
    },
    {
        character: "Billy Kid",
        characterFace: "img/BillyKid.jpg",
        lore: "Billy convierte el combate en espectáculo. Para él, cada disparo es parte de una función macabra.",
        tracks: [
            {
                songTitle: "THE WORLD REVOLVING",
                songDescription: "Sientes como gira todo el mundo mientras se se suma en ¡CAOS, CAOS!.",
                songCover: "img/BillyCover.png",
                audio: "audio/THE WORLD REVOLVING.mp3",
                tags: ["rage", "final boss"],
                lore: "EL MUNDO ES CAOS CAOS, Y SU ÚNICO CAMINO ES LA PERDICIÓN."
            },
            {
                songTitle: "THE LAST REVOLVING",
                songDescription: "Bienvenidos a la última vuelta del carrusel, espero que hayáis disfrutado de la experiencia, porque ahora empieza el verdadero caos.",
                songCover: "img/BillyKidCover.png",
                audio: "audio/THE LAST REVOLVING.mp3",
                tags: ["finalboss"],
                lore: "Si escuchas esta canción, es porque ya no hay vuelta atrás."
            }
        ]
    },
    {
        character: "Mina Ashido",
        characterFace: "img/MinaAshido.jpg",
        lore: "Mina convierte el entrenamiento y el combate en movimiento, ritmo y estilo propio.",
        tracks: [
            {
                songTitle: "Dancin' With Acid",
                songDescription: "¿Porque elegir entre pelear y bailar cuando puedes hacer ambas? ¡Vamos a entrenar y mover el esqueleto con Mina Ashido!",
                songCover: "img/MinaCover.png",
                audio: "audio/Dancin' With Acid.mp3",
                tags: ["dance", "normal battle"],
                lore: "En el intento de Mina por mejorar peleando, inventó su estilo basado en el baile urbano, que no es muy letal, pero es sumamente divertido."
            }
        ]
    },
    {
        character: "Kurumi Tokisaki",
        characterFace: "img/KurumiTokisaki.jpg",
        lore: "Kurumi hace que el tiempo pese como una sentencia. Cada tic tac es una amenaza.",
        tracks: [
            {
                songTitle: "Lady Portrait",
                songDescription: "El final de tu último muy hermoso atardecer es la fina doncella de porcelana que oculta su mirada con un flequillo.",
                songCover: "img/KurumiCover2.png",
                audio: "audio/Lady Portrait.mp3",
                tags: ["calm", "Seductive"],
                lore: "La sutileza y las buenas palabras son un arma aún más peligrosa que las pistolas"
            },
            {
                songTitle: "Die O'Clock",
                songDescription: "El tiempo no perdona a nadie, tu hora ha llegado, tu hora de morir.",
                songCover: "img/KurumiCover.png",
                audio: "audio/Die O'Clock.mp3",
                tags: ["SeriousBattle", "DarkVictorian"],
                lore: "Zafkiel, el Ángel de Kurumi Tokisaki, aquel que le concede el poder de controlar el tiempo, solo su tictaqueo hace temblar a cualquiera."
            }
        ]
    },
    {
        character: "Magilou Mayvin",
        characterFace: "img/Magilou.png",
        lore: "Una encantadora bruja sin licencia. ¡Miss Magilou ha nacido con el objetivo de hacer a todo el mundo sonreir con su magia!",
        tracks: [
            {
                songTitle: "Circus March",
                songDescription: "¡El circo ha llegado a la ciudad de la mano de Miss Magilou! ¡Bienvenidos al mayor espectáculo mágico nunca antes visto! ¡Tomad asiento y disfrutad!",
                songCover: "img/MagilouCover.png",
                audio: "audio/Circus March.mp3",
                tags: ["NormalBattle", "Circus"],
                lore: "¡Miss Magilou siempre se ha dedicado a su público encantador! ¡Y prácticamente sin sangre, sudor, ni lágrimas! (creo)"
            },
            {
                songTitle: "Little Sorceress",
                songDescription: "¡La banda sonora que acompaña a Miss Magilou, la brujita que todos los niños adoran!",
                songCover: "img/MagilouCover2.png",
                audio: "audio/Little Sorceress.mp3",
                tags: ["Circus", "Fun", "Chill", "calm"],
                lore: "¡Cuando Magilou entra en escena el viento rezuma diversión a raudales!"
            }
        ]
    },
    {
        character: "Exusiai",
        characterFace: "img/Exusiai.png",
        lore: "Exusiai, la hija del cielo, llegó como una débil y simple humana, se fue con el objetivo de ser el angel de la guarda de cada persona que la necesite",
        tracks: [
            {
                songTitle: "Celestial Guardian",
                songDescription: "Los cantos celestiales que acompañan cada combate de Exusiai, que después de tanto tiempo en el otro mundo, se ganó el respeto de los dioses",
                songCover: "img/ExusiaiCover.png",
                audio: "audio/Celestial Guardian.mp3",
                tags: ["Epic Battle", "Celestial"],
                lore: "El canto de guerra de los arcángeles, la melodía que avecina la guerra entre el cielo y la tierra"
            }
        ]
    },
    {
        character: "Addvok Vileborne",
        characterFace: "img/Add.png",
        lore: "Add, el alumno predilecto de la más poderosa del inframundo, no llega a una fracción de todo su poder, y aún así, te hará sentir el infierno en La Tierra",
        tracks: [
            {
                songTitle: "Doom Bringer",
                songDescription: "La locura y violencia que caracterizan a cierta parte del infierno, en una misma canción",
                songCover: "img/AddCover.png",
                audio: "audio/Doom Bringer.mp3",
                tags: ["Epic Battle", "Boss Battle"],
                lore: "El rugir del infierno en un único combate, por aquel que asegura que traerá la devastación al planeta"
            }
        ]
    },
    {
        character: "Simon Drayton",
        characterFace: "img/SimonDrayton.jpg",
        lore: "Simon Drayton, Drill Hero, sin ser perfecto, su inestimable esfuerzo y fuerza de voluntad perforarán a cada enemigo",
        tracks: [
            {
                songTitle: "Pierce The Heavens",
                songDescription: "La canción de aquel que no cesará hasta ser inalcanzable... \"¡Mi taladro atravesará el cielo!\"",
                songCover: "img/SimonCover.png",
                audio: "audio/Pierce The Heavens.mp3",
                tags: ["normalbattle", "emotional"],
                lore: "No hay nada que supere a la voluntad, ni siquiera el Ki, con suficiente esfuerzo, un humano podrá desafiar a los grandes"
            }
        ]
    },
    {
       character: "YoRHa No.12 Type B-S (Hybrid Model)",
        characterFace: "img/Danya12BS.png",
        lore: "Un androide enviado de YoRHa para estudiar la vida humana, desde que perdió en contacto con el bunker, vaga sin rumbo",
        tracks: [
            {
                songTitle: "Combat Routine",
                songDescription: "Un YoRHa con un sistema de combate algo anticuado, pero eficiente.",
                songCover: "img/DanyaCover.png",
                audio: "audio/Combat Routine.mp3",
                tags: ["Normal Battle"],
                lore: "Siendo un modelo de combate anticuado, pelea demasiado bien para ser de escaner."
            }
        ]
    },
    {
        character: "YoRHa No.9 Type S",
        characterFace: "img/9S.png",
        lore: "Un androide enviado de YoRHa para estudiar la vida humana, desde que perdió en contacto con el bunker, vaga sin rumbo",
        tracks: [
            {
                songTitle: "Glory To Mankind",
                songDescription: "La OST predeterminada cuando un androide del tipo S entra en combate.",
                songCover: "img/9SCover.png",
                audio: "audio/Glory to Mankind.mp3",
                tags: ["Normal Battle"],
                lore: "Los modelos de escáner no están especializados en el combate, sin embargo, están completamente capacitados."
            }
        ]
    },
    {
        character: "Gilthunder Rainford",
        characterFace: "img/Gilthunder.jpg",
        lore: "Gilthunder, el Caballero del Trueno, un noble que se ha ganado su título a base de esfuerzo y dedicación, aunque a veces se le suba un poco la arrogancia a la cabeza.",
        tracks: [
            {
                songTitle: "Perfect Time",
                songDescription: "Aunque los relámpagos siempre caen en zonas impredecibles, Gilthunder siempre sabe el momento perfecto para atacar.",
                songCover: "img/GilthunderCover.png",
                audio: "audio/Perfect Time.mp3",
                tags: ["Normal Battle", "Heroic", "Epic", "Emotional"],
                lore: "La canción de un noble caballero que dará todo para salvar a la humanidad, cueste lo que cueste."
            },
            {
                songTitle: "Skybreaker",
                songDescription: "Cuando el cielo se parte en dos, ya es demasiado tarde para escapar del Rey del Trueno.",
                songCover: "img/Gilthunder2Cover.jpg",
                audio: "audio/Skybreaker.mp3",
                tags: ["Epic Battle", "Thunder", "Heroic", "Epic", "Orchestral"],
                lore: "Cada relámpago anuncia su llegada. No lucha por la gloria, sino por proteger un futuro que solo puede forjarse a través de la tormenta."
            },
        ]
    },
    {
        character: "Undyne",
        characterFace: "img/Undyne.png",
        lore: "Una brusca mujer pez con un talento increible, inspirandose en su maestro, se hace llamar la Lanza de la Justicia",
        tracks: [
            {
                songTitle: "Spear Of Justice",
                songDescription: "La canción de la Lanza de la Justicia, una poderosa guerrera que no le teme ni a la muerte",
                songCover: "img/UndyneCover.png",
                audio: "audio/Spear of Justice.mp3",
                tags: ["Serious Battle", "Heroic"],
                lore: "Ante la injusticia de este mundo, Undyne, la más fiera guerrera, eleva su lanza para combatir"
            },
            {
                songTitle: "Battle Against A True Hero",
                songDescription: "La canción de Undyne, la guerrera que venció a la muerte misma, con el poder de la DETERMINACIÓN",
                songCover: "img/UndyneCover2.png",
                audio: "audio/Battle Against A True Hero.mp3",
                tags: ["Serious Battle", "Heroic"],
                lore: "La determinación, el poder de cambiar el destino, para los monstruos puede ser letal por su poder abrumador"
            }
        ]
    },
    {
        character: "Baiken Tatakai",
        characterFace: "img/Baiken.jpg",
        lore: "Una samurái que luego de haber perdido a toda su familia, busca la forma de hacerse más fuerte para proteger a los que ama, y vengar a los que le arrebataron todo",
        tracks: [
            {
                songTitle: "Petals of Steel",
                songDescription: "Una samurái que busca venganza al más puro estilo del Japón feudal, con honor y respeto, pero sin piedad para sus enemigos",
                songCover: "img/BaikenCover.png",
                audio: "audio/Petals of Steel.mp3",
                tags: ["Serious Battle", "Epic", "Heroic"],
                lore: "Baiken Tatakai, la samurái que busca venganza al más puro estilo del Japón feudal, con honor y respeto, pero sin piedad para sus enemigos"
            }
        ]
    },
    {
        character: "Hugo Vega",
        characterFace: "img/Vega.png",
        lore: "Un elegante asesino nacido al sur de España, severos traumas le hicieron pensar que solo las personas bellas merecen vivir",
        tracks: [
            {
                songTitle: "Rosa de Sangre",
                songDescription: "La música que suena cuando Vega entra en escena, su distorsionada realidad le lleva a decisiones extremas",
                songCover: "img/VegaCover.png",
                audio: "audio/Rosa de Sangre.mp3",
                tags: ["Boss Battle"],
                lore: "El mundo es demasiado hermoso para gente tan horrible lo habite, yo haré justicia por mi amor"
            }
        ]
    },
    {
        character: "David Martínez",
        characterFace: "img/David.jpg",
        lore: "En una ciudad que devora sueños y personas por igual, un chico humilde decidió correr más rápido que su destino… hasta arder como una leyenda",
        tracks: [
            {
                songTitle: "Sandevistman",
                songDescription: "La última sonrisa de un hombre que siguió avanzando incluso después de perderlo todo… porque algunas leyendas solo nacen cuando ya no queda nada que salvar",
                songCover: "img/CoverDavid.png",
                audio: "audio/Sandevistman.mp3",
                tags: ["Boss Battle"],
                lore: "Perdí mi humanidad hace mucho… lo único que me queda es demostrar que incluso un monstruo puede llegar a la cima entre montañas de acero y sangre"
            }
        ]
    },
    {
        character: "Ryomen Sukuna",
        characterFace: "img/Sukuna.jpg",
        lore: "Un hombre que desafía los límites de lo posible, cuyo poder es tan aterrador como su presencia, y cuya ambición no conoce fronteras",
        tracks: [
            {
                songTitle: "Beneath His Smile",
                songDescription: "Un hombre que adora ver a la gente sufrir y que no dudará en destruir todo lo que se interponga en su camino",
                songCover: "img/SukunaCover.png",
                audio: "audio/Beneath His Smile.mp3",
                tags: ["Boss Battle"],
                lore: "Para que perdonar a los humanos cuando puedo verlos sufrir y destruirlos a todos sin que nadie pueda detenerme"
            }
        ]
    },
    {
        character: "Feixiao Hatsuse",
        characterFace: "img/Feixiao.jpg",
        lore: "Nacida para la guerra y moldeada por incontables batallas, avanzó hasta convertirse en la tormenta que hace temblar incluso a los cielos",
        tracks: [
            {
                songTitle: "Fighter from Beyond",
                songDescription: "El rugido de una guerrera que convirtió cada cicatriz en el anuncio de una batalla imposible de detener",
                songCover: "img/FeixiaoCover.png",
                audio: "audio/Fighter from Beyond.mp3",
                tags: ["Boss Battle"],
                lore: "Si el destino insiste en desafiarme… entonces cortaré el propio cielo hasta que aprenda a temer mi nombre"
            }
        ]
    },
    {
        character: "Grillby Kamiji",
        characterFace: "img/Grillby.png",
        lore: "Un caballeroso bartender de personalidad cálida, a pesar de vivir una vida de paz, se encarga de entrenar a su hija",
        tracks: [
            {
                songTitle: "Burnt Out",
                songDescription: "La canción que suena cuando el pacífico Grillby tiene que actuar, nadie dijo que sea un rival fácil",
                songCover: "img/GrillbyCover.png",
                audio: "audio/Burnt Out.mp3",
                tags: ["Serious Battle"],
                lore: "¿Que le has hecho? El bar está en llamas, todo esto es tu culpa... ¿Estás orgulloso?"
            }
        ]
    },
    {
        character: "Moe Kamiji",
        characterFace: "img/Moe.jpg",
        lore: "Una dulce niña con un gran talento para el combate y un sentido de la justicia admirable.",
        tracks: [
            {
                songTitle: "FLASHPOINT",
                songDescription: "La música que suena cuando Moe se pone su traje de heroína y llena de fuego y energía el combate.",
                songCover: "img/MoeCover.png",
                audio: "audio/FLASHPOINT.mp3",
                tags: ["Serious Battle", "Heroic"],
                lore: "Cuando el bien necesita una heroína, Moe hará arder las esperanzas del mal."
            }
        ]
    },
    {
        character: "Solazar Kamiji",
        characterFace: "img/Solazar.png",
        lore: "Un serio oficinista de personalidad incandescente, compagina sus varios trabajos con la tutela de Agoti, su hijo adoptivo",
        tracks: [
            {
                songTitle: "Godrays",
                songDescription: "La canción que suena cuando el violento Solazar tiene que actuar, su voz es temida incluso en el vacío",
                songCover: "img/SolazarCover.png",
                audio: "audio/Godrays.mp3",
                tags: ["Serious Battle"],
                lore: "¿Pensabas que venía a divertirse? Solazar cuando se propone algo, lo consigue."
            }
        ]
    },
    {
        character: "Aya Tademaru",
        characterFace: "img/Aya.png",
        lore: "La hija adoptiva de la hija de Dios, nacida con la capacidad de curar las heridas, después de todo lo sufrido en su infancia, no quiere ver a nadie más sufrir",
        tracks: [
            {
                songTitle: "Safety Zone",
                songDescription: "La música que suena cuando Aya entra a ayudar en el campo de batalla",
                songCover: "img/AyaCover.png",
                audio: "audio/Safety Zone.mp3",
                tags: ["Emotional"],
                lore: "Aya quizás no sea la mas valiente, pero por proteger a sus seres queridos haría lo que fuese"
            }
        ]
    },
    {
        character: "Adalet (Justicia)",
        characterFace: "img/Justicia.png",
        lore: "Una de las abogadas del diablo, su estilo despreocupado y burlón hacen parecer que no es la gran cosa, pero poseé la capacidad de someter a cualquiera",
        tracks: [
            {
                songTitle: "Unfair Decree",
                songDescription: "La música de batalla de Justicia, quien maneja el cotarro en los juzgados para que suceda lo que ella desea",
                songCover: "img/JusticiaCover.png",
                audio: "audio/Unfair Decree.mp3",
                tags: ["Cool", "Battle"],
                lore: "Aunque ciega, nadie se puede librar del largo brazo de la justicia"
            }
        ]
    },
    {
        character: "Beelzebub",
        characterFace: "img/Beelze.png",
        lore: "El principe del inframundo, a pesar de formar parte de la familia real, su vínculo con los humanos hace que no respete las decisiones de su padre, el solo quiere estar tranquilo",
        tracks: [
            {
                songTitle: "Oh hell nah!",
                songDescription: "La canción de batalla de Beelzebub, el principe anti sistema que solo mira por si mismo, y no comete malas acciones",
                songCover: "img/BeelzeCover.png",
                audio: "audio/Oh hell nah!.mp3",
                tags: ["Cool", "Battle"],
                lore: "Incluso el principe de los demonios, puede volverse humano rodeado de las personas correctas"
            }
        ]
    },
    {
        character: "Grimmjow Jaegerjaquez",
        characterFace: "img/Grimmjow.jpg",
        lore: "En uno de los remotos confines del infierno yace dormido uno de los pilares más poderosos del antiguo infierno... Que hoy busca renacer como era en el pasado",
        tracks: [
            {
                songTitle: "Destroy Everything",
                songDescription: "La locura y la sed de destrucción de alguien que tiene poco que perder y mucho que ganar",
                songCover: "img/GrimmjowCover.jpg",
                audio: "audio/Destroy Everything.mp3",
                tags: ["Boss Battle"],
                lore: "En un día como hoy sienta muy bien regar el suelo con tu sangre y toda la de tus seres queridos, no temas por morir, teme porque seré yo quien te mate"
            }
        ]
    },
    {
        character: "Shoto Todoroki",
        characterFace: "img/Todoroki.jpg",
        lore: "Esta es la historia como el hijo maldito del segundo mejor del mundo llegó a ser lo que el quiso ser, un amigo, un héroe y un gran novio",
        tracks: [
            {
                songTitle: "Fire And Ice",
                songDescription: "El equilibrio perfecto, fuego y hielo, cuerpo y alma, entrenamiento y constancia, fuerza e inteligencia, todo hecho para un padre incomplacido",
                songCover: "img/TodorokiCover.jpg",
                audio: "audio/FireAndIce.mp3",
                tags: ["Boss Battle"],
                lore: "Cuando el equilibrio pierde su constancia todo se cae pero no significa derrota, significa renacer como alguien nuevo"
            }
        ]
    },
    {
        character: "Shionne Imeris",
        characterFace: "img/Shionne.png",
        lore: "La princesa maldita de un reino extinto, estar acostumbrada a los lujos de la alta vida no evita que sea toda una aventurera",
        tracks: [
            {
                songTitle: "Fateful Thorns",
                songDescription: "La canción de batalla de Shionne, la princesa maldita por las espinas, una vida de soledad forjó el valor de una guerrera",
                songCover: "img/ShionneCover.png",
                audio: "audio/Fateful Thorns.mp3",
                tags: ["Emotional", "Battle"],
                lore: "Cuando tienes todos los lujos del mundo, no eres capaz de apreciar el valor de un abrazo, no es el caso de Shionne"
            }
        ]
    },
    {
        character: "Law Vireon",
        characterFace: "img/Law.png",
        lore: "Un fiero guerrero que fue liberado del cruel destino que le amparaba, desde entonces usa su fuerza para el bien del mundo",
        tracks: [
            {
                songTitle: "Broken Chains",
                songDescription: "La canción de batalla de Law, el esclavo que se rebeló contra su nación, piensa cambiar el mundo a puñetazos",
                songCover: "img/LawCover.png",
                audio: "audio/Broken Chains.mp3",
                tags: ["Epic", "Battle"],
                lore: "La fuerza que un día fue usada en servidumbre en manos del mal, hoy en día lucha por liberar al mundo de la devastación"
            }
        ]
    },
    {
        character: "Wiš'adel Kal'zen",
        characterFace: "img/W.png",
        lore: "Un experimento fallido por hacer a la soldado perfecta, su cuerpo soportó el tratamiento, su mente explotó en mil pedazos",
        tracks: [
            {
                songTitle: "Maniacal Explosion Drive",
                songDescription: "La canción de una psicópata con la mente fracturada que solo piensa en el placer de ver el mundo arder",
                songCover: "img/WCover.png",
                audio: "audio/Maniacal Explosion Drive.mp3",
                tags: ["Boss Battle", "Chaotic"],
                lore: "La Piromanía es un trastorno donde una persona provoca incendios por impulso, sintiendo tensión antes y alivio o placer después."
            }
        ]
    },
    {
        character: "Velvet Crowe",
        characterFace: "img/Velvet.jpg",
        lore: "Una chica normal que, tras la trágica muerte de su hermano menor, fue encerrada a su suerte. Posteriormente fue maldecida con una garra que le da un gran poder, pero si no se alimenta de seres vivos, le consumirá.",
        tracks: [
            {
                songTitle: "Shout Your Soul",
                songDescription: "El tema de batalla de Velvet, quien a pesar de todo, sigue tratando luchar con honor y si dejarse llevar por sus instintos salvajes",
                songCover: "img/VelvelCover.jpg",
                audio: "audio/Shout your soul.mp3",
                tags: ["Battle", "Epic"],
                lore: "El valor nunca se puede poner en entredicho, menos a una guerrera que disputa sus peores batallas en su propia piel"
            },
            {
                songTitle: "Red Velvet",
                songDescription: "La melancólica y motivadora melodía de Velvet, quien a pesar de todo lo sufrido, luchará por lo que es justo.",
                songCover: "img/VelvetCover2.png",
                audio: "audio/Red Velvet.mp3",
                tags: ["Melancholic", "Inspirational", "calm", "Chill"],
                lore: "Velvet agradece día a día poder seguir siendo consciente del siguiente amanecer, y su corazón seguirá luchando para que esa sensación sea eterna."
            }
        ]
    },
    {
        character: "Aqua Flower",
        characterFace: "img/Aqua.jpg",
        lore: "Aqua es una chica infantil, impulsiva y muy juguetona. Le encantan los cuchillos y pelear por diversión, aunque no es malvada.",
        tracks: [
            {
                songTitle: "Playplayplayplayplay!",
                songDescription: "De verdad nadie va a jugar con la pequeña Aqua? Mira con que carita de lo pide...!",
                songCover: "img/AquaCover.png",
                audio: "audio/Playplayplayplayplay!.mp3",
                tags: ["Playful", "calm", "Japanese"],
                lore: "Cuando la juguetona Aqua hace de las suyas, es un caos, un caos muy adorable, pero un caos"
            },
            {
                songTitle: "Petal Dance",
                songDescription: "No! Aqua mala! No se juega con cuchillos! Ni mucho menos se baila y corretea con ellos en las manos!",
                songCover: "img/AquaCover2.png",
                audio: "audio/Petal Dance.mp3",
                tags: ["Playful", "Battle", "Japanese"],
                lore: "Aqua no es capaz de diferenciar entre un juego y una pelea, lo cual la hace extremadamente peligrosa si no se sabe controlar."
            }
        ]
    },
    {
        character: "Pink Flower",
        characterFace: "img/Pink.jpg",
        lore: "¡Una chica que canta y baila al ritmo de las bombas! Aunque con un carácter un tanto bipolar.",
        tracks: [
            {
                songTitle: "Pink",
                songDescription: "¡Mira mamá! ¡Es Pink! ¡Es la cantante Pink!",
                songCover: "img/Pink2Cover.png",
                audio: "audio/Pink.mp3",
                tags: ["calm", "moment"],
                lore: "¿Qué es esa melodía tan agradable que suena al hablar con Pink?"
            },
            {
                songTitle: "Cutie Mew Mew Magic",
                songDescription: "¡Bailad todos al ritmo de la canción! ¡La talentosa chica adorable mew mew os va a dar un show que será la bomba!",
                songCover: "img/PinkCover.png",
                audio: "audio/Cutie Mew Mew Magic.mp3",
                tags: ["Battle", "Epic", "Dance"],
                lore: "Es la canción más famosa de la exitosa cantante Pink. No te confíes mucho que las bombas explotan cerca."
            }
        ]
    },
    {
        character: "Zelda Hellsdothir",
        characterFace: "img/Zelda.jpg",
        lore: "Una demonio que convivía con los humanos, traicionada, se ha propuesto acabar con todos y cada uno de ellos.",
        tracks: [
            {
                songTitle: "GUARDIAN",
                songDescription: "Intenta pasar por el bastión más temible del Infierno.",
                songCover: "img/ZeldaCover.png",
                audio: "audio/GUARDIAN.mp3",
                tags: ["BossBattle", "Epic"],
                lore: "Así suena cuando te atreves a enfrentar el bastión más poderoso del Inframundo."
            }
        ]
    },
    {
        character: "Thalia Kane",
        characterFace: "img/Thalia.jpg",
        lore: "La salvación del Planeta Tierra. Recorre el espacio y tiempo para que todos prosperen hacia un futuro en paz.",
        tracks: [
            {
                songTitle: "Flower Girl",
                songDescription: "El uso del poder todos aquellos que han perecido en batalla. Usará toda esa rabia para vengar a cada caído.",
                songCover: "img/ThaliaCover.png",
                audio: "audio/Flower Girl.mp3",
                // Pega la letra entre los acentos graves. El botón aparecerá automáticamente cuando haya contenido.
                lyrics: `[Verse]
Ten feet twenty the Flower Girl
Is tending the last little bloom
Petals have fallen far too soon
Yet every morning
Hope that blossoms in Flower Girl
Would never wither into the rain
One tiny flower can bloom again
So she keeps the...

[Chorus]
Flower Girl, Flower Girl
With the seeds in her hands still she stands
Watching every little bud
While she can
Way up high in the sky
With the tears in her eyes
Isn't spring worth waiting for... Flowers

[Verse]
Ten feet twenty the Flower Girl
Remembers a garden once bright
Now only roots hold onto the light
Yet every morning
Winter learned every flower's name
Still one last blossom carried the dawn
Leaving her seeds to carry on
So she keeps the...

[Chorus]
Flower Girl, Flower Girl
With the seeds in her hands
Still she stands
Watching every little bud
While she can
Way up high in the sky
With the tears in her eyes
Isn't spring worth waiting for... Flowers

[Verse]
Ten feet twenty the Flower Girl
Remembers a garden once bright
Now only roots hold onto the light
Yet every morning
Winter learned every flower's name
Still one last blossom carried the dawn
Leaving her seeds to carry on
So she keeps the...
`.trim(),
                // Traducción línea por línea: cada verso ocupa la misma posición que en lyrics.
                lyricsTranslation: `[Verso]
Diez pies veinte, la Chica Flor
Cuida la última pequeña flor
Los pétalos han caído demasiado pronto
Sin embargo, cada mañana
La esperanza que florece en la Chica Flor
Jamás se marchitaría bajo la lluvia
Una diminuta flor puede volver a florecer
Así que ella conserva las...

[Estribillo]
Chica Flor, Chica Flor
Con las semillas en sus manos, aún sigue en pie
Observando cada pequeño brote mientras puede
Allá arriba, en lo alto del cielo
Con lágrimas en los ojos
¿No merece la pena esperar a la primavera... a las flores?

[Verso]
Diez pies veinte, la Chica Flor
Recuerda un jardín que una vez brilló
Ahora solo las raíces se aferran a la luz
Sin embargo, cada mañana
El invierno aprendió el nombre de cada flor
Aun así, una última flor llevó consigo el amanecer
Dejando sus semillas para continuar
Así que ella conserva las...

[Estribillo]
Chica Flor, Chica Flor
Con las semillas en sus manos
Aún sigue en pie
Observando cada pequeño brote
Mientras puede
Allá arriba, en lo alto del cielo
Con lágrimas en los ojos
¿No merece la pena esperar a la primavera... a las flores?

[Verso]
Diez pies veinte, la Chica Flor
Recuerda un jardín que una vez brilló
Ahora solo las raíces se aferran a la luz
Sin embargo, cada mañana
El invierno aprendió el nombre de cada flor
Aun así, una última flor llevó consigo el amanecer
Dejando sus semillas para continuar
Así que ella conserva las...
`.trim(),
                tags: ["Battle", "Epic", "Emotional"],
                lore: "La epicidad de la canción entra acorde al poder de la chica. Si le brilla el pelo, huye."
            }
        ]
    },
    {
        character: "Kaedehara Kazuha",
        characterFace: "img/Kaedehara.jpg",
        lore: "Un samurái ágil y astuto capaz de cortar el viento. No te sorprendas si te queman sus golpes (literalmente).",
        tracks: [
            {
                songTitle: "Kindled Heart",
                songDescription: "¿Notas como se caldea el ambiente? Si Kaedehara pelea, es para darlo todo.",
                songCover: "img/KaedeharaCover.png",
                audio: "audio/Kindled Heart.mp3",
                tags: ["battle", "epic"],
                lore: "Si tú luchas por tus bienes, él también luchará por los tuyos."
            },
            {
                songTitle: "Sunshine",
                songDescription: "¿Que tú eres más fuerte que yo? ¿Y eso quién lo decidió?",
                songCover: "img/KaedeharaCover2.png",
                audio: "audio/Sunshine.mp3",
                tags: ["battle", "bossbattle", "epic"],
                lore: "Es el poder de aquel que arde con la soberbia de su fuerza. Siempre va a considerarte débil, porque solo el fuerte prevalece."
            }
        ]
    },
    {
        character: "Rin Drayton",
        characterFace: "img/Rin.jpg",
        lore: "Un niño con un pasado devastador y un futuro prometedor.",
        tracks: [
            {
                songTitle: "Heir to the Mantle",
                songDescription: "Las ganas y determinación del chico lo convierten en alguien capaz de convertirse en un superhéroe.",
                songCover: "img/RinCover.png",
                audio: "audio/Heir to the Mantle.mp3",
                tags: ["battle", "epic"],
                lore: "Cuando la canción suene, prepárate para pelear contra alguien que está dispuesto a darlo todo."
            },
            {
                songTitle: "A True Superhero",
                songDescription: "La ascendencia de un verdadero superhéroe que, por todos los medios, busca la salvación de todos.",
                songCover: "img/Rin2Cover.png",
                audio: "audio/A True Superhero.mp3",
                tags: ["epic", "bossbattle"],
                lore: "Si en su cabeza hay dos volutas, significa que ha duplicado sus ganas de vencer."
            }
        ]
    },  
    {
        character: "Urtiel (Sentencia)",
        characterFace: "img/Sentencia.jpg",
        lore: "Una demonio berserker que ejerció de abogada del diablo por un castigo. Es brutal y enormemente sanguinaria.",
        tracks: [
            {
                songTitle: "Last Judgement",
                songDescription: "Cuando Sentencia empieza a combatir, sus ojos se inyectan en sangre, y solo piensa en matar a su oponente.",
                songCover: "img/SentenciaCover.png",
                audio: "audio/Last Judgement.mp3",
                tags: ["Epic Battle", "Evil"],
                lore: "Urtiel, la ex-abogada del diablo, obligada a dar muerte solo en los tribunales, ahora es libre para acabar con cualquiera que se cruce en su camino"
            }
        ]
    },
    {
        character: "Pandora Valzareth",
        characterFace: "img/Pandora.jpg",
        lore: "La extravagante y alocada científica real, mil experimentos fallidos y horas frente a una pantalla han provocado esta personalidad inestable.",
        tracks: [
            {
                songTitle: "Titanium Paradox",
                songDescription: "Pandora experimenta con sus creaciones en pleno combate, sin miedo a las explosiones o las muertes que pueda causar, pues buena parte de su cuerpo está protegida por titanio.",
                songCover: "img/PandoraCover.png",
                audio: "audio/Titanium Paradox.mp3",
                tags: ["Battle", "Playfull"],
                lore: "Pandora ha sufrido miles de modificaciones en su propio cuerpo debido a los experimentos fallidos, su cerebro sin embargo sigue intacto, como su tesoro más preciado"
            }
        ]
    },
];

const soundtracks = characters.flatMap((char, characterIndex) =>
    char.tracks.map((track, trackIndex) => ({
        ...track,
        character: char.character,
        characterFace: char.characterFace,
        characterLore: char.lore,
        characterIndex,
        trackIndex
    }))
);


window.RESONANCE_DATA = { characters, soundtracks };
