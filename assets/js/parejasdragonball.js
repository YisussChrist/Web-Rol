    // Para poner fotos:
    // 1) Guarda tus imágenes en una carpeta, por ejemplo: img/familias/
    // 2) En padres usa: { name: 'Nombre', img: 'img/familias/foto.png' }
    // 3) En hijos añade: img: 'img/familias/foto.png'
    // Si dejas img: '' o no pones img, saldrán las iniciales como antes.
    //todos estos personajes son la caña de España

    // =========================
    // PERSONAJES DE GEN 1
    // =========================
    // Cuando quieras desbloquear la pestaña "Gen 1", puedes poner aquí sus familias/personajes
    // usando la MISMA estructura que DATA. Ejemplo:
    //
    // const GEN1_DATA = [
    //   { family: 'Nombre Padre y Nombre Madre', parents: [
    //     { name: 'Padre', img: 'ruta/foto-padre.jpg' },
    //     { name: 'Madre', img: 'ruta/foto-madre.jpg' }
    //   ], children: [
    //     { name: 'Hijo/a', img: 'ruta/foto-hijo.jpg', gender: 'F', tag: 'Y', series: 'Serie', meta: 'Personaje original — Serie', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
    //   ]}
    // ];
    //
    // De momento Gen 1 está bloqueado visualmente, así que estos datos no se muestran todavía.
    const GEN1_DATA = [];

    // Campos extra editables para cada personaje:
    // age: '', role: '', personality: '', powers: '', notes: ''

    const DATA = [
      { family: 'Alma y Exusiai', parents: [
        { name: 'Alma Azkaban', img: 'fotos-poderes/Alma Azkaban.jpg' },
        { name: 'Exusiai', img: 'fotos-poderes/Exusiai.jpg' }
      ], children: [
        { name: 'Kiriya Azkaban', img: 'Hijos/Alma y Exusiai/Kiriya Azkaban.jpg', gender: 'F', tag: 'Y', series: "Goddess' Dorm", meta: "Kiriya Sensho — Dorm Mother of the Goddess' Dorm", link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Liva Azkaban', img: 'Hijos/Alma y Exusiai/Liva Azkaban.jpg', gender: 'M', tag: 'S', series: "D-Gray Man", meta: "Liva Bookman — D-Gray Man", link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Lancelot y Tokishikko', parents: [
        { name: 'Lancelot Tsukue', img: "fotos-poderes/Lancelot Tsukue.jpg" },
        { name: 'Tokishikko Dana', img: "fotos-poderes/Tokishikko Dana.jpg" }
      ], children: [
        { name: 'Kabane Tsukue', img: "Hijos/Lancelot y Tokishikko/Kabane Tsukue.jpg", gender: 'M', tag: 'S', series: 'Kemono Jihen', meta: 'Kabane Kusaka — Kemono Jihen', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Ellen Tsukue', img: "Hijos/Lancelot y Tokishikko/Ellen Tsukue.jpg",gender: 'F', tag: 'Y', series: 'Zenless Zone Zero', meta: 'Ellen Joe - Zenless Zone Zero', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Lumine Tsukue', img: "Hijos/Lancelot y Tokishikko/Lumine Tsukue.jpg",gender: 'F', tag: 'Y', series: 'Genshin Impact', meta: 'Lumine - Genshin Impact', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Law y Gogo', parents: [
        { name: 'Law Vireon', img: 'fotos-poderes/Law Vireon.jpg' },
        { name: 'Gogo Karashina', img: 'fotos-poderes/Gogo Karashina.jpg' }
      ], children: [
        { name: 'Fujimaru Vireon', img: 'Hijos/Law y Gogo/Fujimaru Vireon.jpg', gender: 'M', tag: 'L', series: 'Fate', meta: 'Fujimaru Ritsuka — Fate', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Skadi y Beelzebub', parents: [
        { name: 'Skadi Dragenfelt', img: 'fotos-poderes/Skadi Dragenfelt.jpg' },
        { name: 'Beelzebub', img: 'fotos-poderes/Beelzebub.jpg' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Ares y Tao', parents: [
        { name: 'Ares Kane', img: 'fotos-poderes/Ares Kane.jpg' },
        { name: 'Tao Saotome', img: 'fotos-poderes/Tao Saotome.jpg' }
      ], children: [
        { name: 'Hermes Kane', img: "Hijos/Ares y Tao/Hermes Kane.jpg", gender: 'M', tag: 'S', series: 'The Yozakura Family', meta: 'Sui Aoi — The Yozakura Family', link: '#', born: true , age: '5', role: '', personality: '', powers: 'Saiyan', notes: ''},
        { name: 'Thalia Kane', img: "Hijos/Ares y Tao/Thalia Kane.webp", gender: 'F', tag: 'Y', series: 'The Academy’s Sashimi Sword Master', meta: 'Medea Poison — The Academy’s Sashimi Sword Master', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Hestia Kane', img: "Hijos/Ares y Tao/Hestia Kane.jpg", gender: 'F', tag: 'Y', series: 'Someone Stop Her!', meta: 'Yoonda Cha — Someone Stop Her!', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'David y Kurumi', parents: [
        { name: 'David Martínez', img: 'fotos-poderes/David Martinez.jpg' },
        { name: 'Kurumi Tokisaki', img: 'fotos-poderes/Kurumi Tokisaki.jpg' }
      ], children: [
        { name: 'Kiawa Martínez', img: "Hijos/David y Kurumi/Kiawa Martinez.jpg", gender: 'F', tag: 'Y', series: 'Honkai Star Rail', meta: 'Sparkle — Honkai Star Rail', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Zelda y Waru', parents: [
        { name: 'Zelda Hellsdothir', img: 'fotos-poderes/Zelda Hellsdothir.jpg' },
        { name: 'Waru Shintarou', img: 'fotos-poderes/Waru Shintarou.webp' }
      ], children: [
        { name: 'Galbrena Shintarou', img: "Hijos/Waru y Zelda/Galbrena Shintarou.jpg", gender: 'F', tag: 'L', series: 'Wuthering Waves', meta: 'Galbrena — Wuthering Waves', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Setsuna Shintarou', img: "Hijos/Waru y Zelda/Setsuna Shintarou.jpg", gender: 'F', tag: 'L', series: 'Redo of Healer', meta: 'Setsuna — Redo of Healer', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Kawaki Shintarou', img: "Hijos/Waru y Zelda/Kawaki Shintarou.jpg", gender: 'M', tag: 'L', series: 'Naruto', meta: 'Kawaki — Naruto', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Ciel Shintarou', img: "Hijos/Waru y Zelda/Ciel Shintarou.jpg", gender: 'M', tag: 'Y', series: 'Elsword', meta: 'Ciel — Elsword', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Hak y Yoruichi', parents: [
        { name: 'Hak Aethereon', img: 'fotos-poderes/Hak.jpg' },
        { name: 'Yoruichi Shinhouin', img: 'fotos-poderes/Yoruichi Shihoin.jpg' }
      ], children: [
        { name: 'Dax Aethereon', img: "Hijos/Hak y Yoruichi/Dax Aethereon.jpg", gender: 'M', tag: 'L', series: 'Juusen Battle Monsuno', meta: 'Dax — Juusen Battle Monsuno', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Chun Aethereon', img: "Hijos/Hak y Yoruichi/Chun Aethereon.jpg", gender: 'F', tag: 'L', series: 'Record of Ragnarok', meta: 'Chun Yun — Record of Ragnarok', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Add y Albedo', parents: [
        { name: 'Addvok Vileborne', img: 'fotos-poderes/Add.jpg' },
        { name: 'Albedo Dauthrelle', img: 'fotos-poderes/Albedo.jpg' }
      ], children: [
        { name: 'Utena Vileborne', img: "Hijos/Add y Albedo/Utena Vileborne.jpg", gender: 'F', tag: 'S', series: 'Mahou Shoujo ni Akogarete', meta: 'Utena Hiiragi — Mahou Shoujo ni Akogarete', link: '#', born: true , age: '5 años', role: '', personality: '', powers: '', notes: ''},
        { name: 'Astharot Vileborne', img: "Hijos/Add y Albedo/Astharot Vileborne.png", gender: 'F', tag: 'Y', series: 'A Barbarian Adventure in a Fantasy World', meta: 'Astaroth - A Barbarian Adventure in a Fantasy World', born: true, link: '#' , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: "Lilith Vileborne", img: "Hijos/Add y Albedo/Lilith Vileborne.jpg", gender: 'F', tag: 'Y', series: 'Rememento: White Shadows', meta: 'Alcyone — Rememento: White Shadows', link: '#' , age: '', role: '', personality: '', powers: '', notes: '', born: false }
      ]},
      { family: 'Nara y Khrome', parents: [
        { name: 'Nara Midori', img: 'fotos-poderes/Nara Midori.jpg' },
        { name: 'Khrome Ryugu', img: 'fotos-poderes/Khrome2.jpg' }
      ], children: [
        { name: 'Ibuki Ryugu', img: "Hijos/Khrome y Nara/Ibuki Ryugu.jpg", gender: 'F', tag: 'L', series: 'Fate', meta: 'Ibuki-douji — Fate', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Lapis Ryugu', img: "Hijos/Khrome y Nara/Lapis Ryugu.png", gender: 'F', tag: 'Y', series: 'OC', meta: 'Original Character', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Chronoa Ryugu', img: "Hijos/Khrome y Nara/Chronoa Ryugu.jpg", gender: 'F', tag: 'Y', series: 'Dragon Ball Heroes', meta: 'Chronoa - Dragon Ball Heroes', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
      ]},
      { family: 'Plasma y Magilou', parents: [
        { name: 'Killua Zaoldyeck', img: 'fotos-poderes/Plasma.jpg' },
        { name: '', img: 'fotos-poderes/Magilou Mayvin.jpg' }
      ], children: [
        { name: 'Luna Zaoldyeck', img: "Hijos/Plasma y Magilou/Luna Zaoldyeck.jpg", gender: 'F', tag: 'L', series: "Li'l Miss Vampire Can't Suck Right", meta: "Luna Ishikawa — Li'l Miss Vampire Can't Suck Right", link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: "Scar y Wis'Adel", parents: [
        { name: 'Scar', img: 'fotos-poderes/Scar.jpg' },
        { name: 'W', img: 'fotos-poderes/W.jpg' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Simon y Ryuko', parents: [
        { name: 'Simon Drayton', img: 'fotos-poderes/Simon Drayton.jpg' },
        { name: 'Ryuko Matoi', img: 'fotos-poderes/Ryuko Matoi.jpg' }
      ], children: [
        { name: 'Shiki Drayton', img: 'Hijos/Simon y Ryuko/Shiki Drayton.png', gender: 'M', tag: 'S', series: 'Edens Zero', meta: 'Shiki Granbell — Edens Zero', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Kanade Drayton', img: 'Hijos/Simon y Ryuko/Kanade Drayton.jpg', gender: 'F', tag: 'L', series: 'Symphogear', meta: 'Kadane Amou — Symphogear', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Kayama Drayton', img: 'Hijos/Simon y Ryuko/Kayama Drayton.png', gender: 'F', tag: 'L', series: 'My Hero Academia', meta: 'Midnight — My Hero Academia', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Kael y Jibril', parents: [
        { name: 'Kael Kane', img: 'fotos-poderes/Kael.jpg' },
        { name: 'Jibril Hellsdothir', img: 'fotos-poderes/Jibril.jpg' }
      ], children: [
        { name: 'Milim Kane', img: "Hijos/Kael y Jibril/Milim Kane.jpg", gender: 'F', tag: 'Y', series: 'That Time I Got Reincarnated as a Slime', meta: 'Milim Nava — That Time I Got Reincarnated as a Slime', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Joryuu Kane', img: "Hijos/Kael y Jibril/Jouryuu Kane.jpg", gender: 'F', tag: 'L', series: 'Mato Seihei no Slave', meta: 'Jouryuu — Mato Seihei no Slave', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''}

      ]},
      { family: 'Shionne y Goliat', parents: [
        { name: 'Shionne Imeris', img: 'fotos-poderes/Shionne Imeris.jpg' },
        { name: 'Goliat', img: 'fotos-poderes/Goliat.webp' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Gilthunder y Undyne', parents: [
        { name: 'Gilthunder Rainford', img: 'fotos-poderes/Gilthunder.jpg' },
        { name: 'Undyne', img: 'fotos-poderes/Undyne.png' }
      ], children: [
        { name: 'Sirius Rainford', img: "Hijos/Gilthunder y Undyne/Sirius Rainford.jpg", gender: 'F', tag: 'Y', series: 'Boku no Hero', meta: 'Sirius — Boku no Hero', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Billy y Frostleaf', parents: [
        { name: 'Billy Kid', img: 'fotos-poderes/Billy Kid.jpg' },
        { name: 'Yelena Vetrova', img: 'fotos-poderes/Flostleaf.jpg' }
      ], children: [
        { name: 'Iko McArthur', img: "Hijos/Billy y Frostleaf/Iko McArthur.jpg", gender: 'F', tag: 'Y', series: 'Mayonaka Heart Tune', meta: 'Iko Kirino — Mayonaka Heart Tune', link: '#' , age: '', role: '', personality: '', powers: '', notes: '', born: true },
      ]},
      { family: 'Artemisa y Zeo', parents: [
        { name: 'Artemisa Kane', img: 'fotos-poderes/Artemisa Kane.jpg' },
        { name: 'Zeo Torzeus', img: 'fotos-poderes/Zeo Torzeus.jpg' }
      ], children: [
        { name: 'Diana Kane', img: "Hijos/Zeo y Artemisa/Diana Kane.jpg", gender: 'F', tag: 'Y', series: 'Honkai Star Rail', meta: 'Himeko — Honkai Star Rail', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Venus y Jade', parents: [
        { name: 'Venus Shintarou', img: 'fotos-poderes/Venus Shintarou.jpg' },
        { name: 'Jade Karashina', img: 'fotos-poderes/Jade Karashina.webp' }
      ], children: [
        { name: 'Genos Shintarou', img: "Hijos/Venus y Jade/Genos Shintarou.jpg", gender: 'M', tag: 'L', series: 'One Punch Man', meta: 'Genos — One Punch Man', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Uzui y Feixiao', parents: [
        { name: 'Uzui Tengen', img: 'fotos-poderes/Uzui Tengen.jpeg' },
        { name: 'Feixiao Hatsuse', img: 'fotos-poderes/Feixiao.jpg' }
      ], children: [
        { name: 'Fohl Tengen', img: "Hijos/Uzui y Feixiao/Fohl Tengen.jpg", gender: 'M', tag: 'L', series: 'The Rising of the Shield Hero', meta: 'Fohl Fayon — The Rising of the Shield Hero', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Cipher Tengen', img: "Hijos/Uzui y Feixiao/Cipher Tengen.jpg", gender: 'F', tag: 'Y', series: 'Honkai Star Rail', meta: 'Cipher — Honkai Star Rail', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Yachiyo Tengen', img: "Hijos/Uzui y Feixiao/Yachiya Tengen.jpg", gender: 'F', tag: 'L', series: 'Cosmic Princess Kaguya!', meta: 'Yachiyo Runami — Cosmic Princess Kaguya!', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Jin y Freyja', parents: [
        { name: 'Jin Mori', img: 'fotos-poderes/Jin Mori.jpg' },
        { name: 'Freyja Kane', img: 'fotos-poderes/Freyja Kane.jpg' }
      ], children: [
        { name: 'Hera Mori', img: "Hijos/Jin y Freyja/Hera Mori.png", gender: 'F', tag: 'Y', series: 'Alchemy Star', meta: 'Regina — Alchemy Stars', link: '#' , age: '', role: '', personality: '', powers: '', notes: '', born: false },
        { name: 'Eris Mori', img: "Hijos/Jin y Freyja/Eris Mori.jpg", gender: 'F', tag: 'L', series: 'The Rising Of The Shield Hero', meta: 'Malty Melromac — The Rising Of The Shield Hero', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}

      ]},
      { family: 'Hakuryuu y Velvet', parents: [
        { name: 'Hakuryuu Ren', img: 'fotos-poderes/Hakuryuu Ren.jpg' },
        { name: 'Velvet Crowe', img: 'fotos-poderes/Velvet Crowe.jpg' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Sukuna y Sentencia', parents: [
        { name: 'Ryoomen Sukuna', img: 'fotos-poderes/Sukuna.jpg' },
        { name: 'Urtiel', img: 'fotos-poderes/Urtiel.png' }
      ], children: [
        { name: 'Lilith Sukuna', img:'Hijos/Sukuna y Sentencia/Lilith Sukuna.jpg',gender: 'F', tag: 'Y', series: 'Path to Nowhere', meta: 'Ninety-Nine — Path to Nowhere', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Heine Sukuna', img:'Hijos/Sukuna y Sentencia/Heine Sukuna.png', gender: 'F', tag: 'S', series: 'Sentouin, Hakenshimasu!', meta: 'Heine — Sentouin, Hakenshimasu!', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Grimmjow y Justicia', parents: [
        { name: 'Grimmjow Jearjearquez', img: 'fotos-poderes/Grimmjow.png' },
        { name: 'Adalet', img: 'fotos-poderes/Adalet.png' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Juri y Vega', parents: [
        { name: 'Juri Han', img: 'fotos-poderes/Juri Han.jpg' },
        { name: 'Hugo Vega', img: 'fotos-poderes/Hugo Vega.png' }
      ], children: [
        { name: 'Homare Vega', img: "Hijos/Vega y Juri/Homare Vega.jpg", gender: 'F', tag: 'L', series: 'Mato Seihei no Slave', meta: 'Homare Azuma — Mato Seihei no Slave', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Tier y Rokurou', parents: [
        { name: 'Tier Harribel', img: 'fotos-poderes/Tier Harribel.jpg' },
        { name: 'Rokurou', img: 'fotos-poderes/Rokurou.png' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Medaka y Kiba', parents: [
        { name: 'Kurokami Medaka', img: 'fotos-poderes/Kurokami Medaka.jpg' },
        { name: 'Kiba', img: 'fotos-poderes/Yuuto Kiba.jpg' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Yuno y Eula', parents: [
        { name: 'Yuno Grinberryal', img: 'fotos-poderes/Yuno Grinberryal.jpg' },
        { name: 'Eula Lawrence', img: 'fotos-poderes/Eula.jpg' },
        { name: 'Roxy Migurdia', img: 'fotos-poderes/Roxy Migurdia.jpg' }
      ], children: [
        { name: 'Adelaide Grinberryall', img: 'Hijos/Yuno y Eula/Adelaide Grinberryal.png', born:true, gender: 'F', tag: 'Y', series: 'Conquering the Academy with Just a Sashimi Knife', meta: 'Abel von Nibelung — Conquering the Academy with Just a Sashimi Knife — [Eula Lawrence]', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Charlotte Grinberryall', img: 'Hijos/Yuno y Eula/Charlotte Grynberryall.jpg', born:true, gender: 'F', tag: 'Y', series: 'Kanteiskill', meta: 'Charlotte - Kanteiskill — [Roxy Migurdia]', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}

      ]},
      { family: 'Toga, Toru y Hitoshi', parents: [
        { name: 'Himiko Toga', img: 'fotos-poderes/Himiko Toga.png' },
        { name: 'Toru Hagakure', img: 'fotos-poderes/Toru Hagakure.png' },
        { name: 'Hitoshi Shinso', img: 'fotos-poderes/Hitoshi Shinso.png' }
      ], children: [
        { name: 'Tenka Shinso', img: "Hijos/Shiso y cñia/Toru/Tenka Shinso.jpg", gender: 'F', tag: 'Y', series: 'Mato Seihei no Slave', meta: 'Tenka Izumo — Mato Seihei no Slave — [Toru Hagakure]', born: true, link: '#' , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Fadia Shinso', img: "Hijos/Shiso y cñia/Toga/Fadia Shinso.jpg", gender: 'F', tag: 'Y', series: 'Neverness to Everness', meta: 'Fadia — Neverness to Everness — [Himiko Toga]', born: true, link: '#' , age: '', role: '', personality: '', powers: '', notes: ''},

      ]},
      { family: 'Zenos y Rias', parents: [
        { name: 'Zenos Sochiku', img: 'fotos-poderes/Zenos.jpg' },
        { name: 'Rias Gremory', img: 'fotos-poderes/Rias Gremory.jpg' }
      ], children: [
        { name: 'Millicas Shochiku', img: "Hijos/Zenos y cñia/Rias/Millica Shochiku.png", gender: 'M', tag: 'S', series: 'Highschool DxD', meta: 'Millicas Gremory — Highschool DxD — [Rias Gremory]', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Shoto y Mina', parents: [
        { name: 'Shoto Todoroki', img: 'fotos-poderes/Todoroki.jpg' }, //* Devuélveme a mi puta novia *//
        { name: 'Mina Ashido', img: 'fotos-poderes/Mina Ashido.jpg' }
      ], children: [
        { name: 'Tōshirō Todoroki', img: "Hijos/Shoto y Mina/Tōshirō Todoroki.jpg", gender: 'M', tag: 'L', series: 'Bleach', meta: 'Tōshirō Hitsugaya — Bleach', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Uta Todoroki', img: "Hijos/Shoto y Mina/Uta Todoroki.jpg", gender: 'F', tag: 'L', series: 'One Piece', meta: 'Uta — One Piece', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Tao Todoroki', img: "Hijos/Shoto y Mina/Tao Todoroki.jpg", gender: 'F', tag: 'S', series: 'Jigokuraku', meta: 'Tao — Jigokuraku', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Takako Todoroki', img: "Hijos/Shoto y Mina/Takako Todoroki.jpg", gender: 'F', tag: 'L', series: 'Jujutsu Kaisen', meta: 'Takako — Jujutsu Kaisen', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Keigo y Baiken', parents: [
        { name: 'Keigo Magami', img: 'fotos-poderes/Keigo Magami.jpg' },
        { name: 'Baiken Tatakai', img: 'fotos-poderes/Baiken.jpg' }
      ], children: [
        { name: 'Reid Magami', img: "Hijos/Keigo y Baiken/Reid Magami.jpg", gender: 'M', tag: 'Y', series: 'RE:Zero', meta: 'Reid Astrea — RE:Zero', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Hinako Magami', img: "Hijos/Keigo y Baiken/Hinako Magami.png", gender: 'F', tag: 'L', series: 'Mission Yozakura Family', meta: 'Rin Fudou — Mission Yozakura Family', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Garou y Kuroka', parents: [
        { name: 'Garou Silverfang', img: 'fotos-poderes/Garou.jpg' },
        { name: 'Kuroka Toujou', img: 'fotos-poderes/Kuroka Toujou.jpg' }
      ], children: [
        { name: 'Wolf Silverfang', img: "Hijos/Garou y Kuroka/Wolf Silverfang.webp", gender: 'M', tag: 'S', series: 'Witch Watch', meta: 'Wolf — Witch Watch', link: '#', born: true , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Nezumii Silverfang', img: "Hijos/Garou y Kuroka/Lisiá.jpg", gender: 'F', tag: 'L', series: 'Rememento: White Shadow', meta: 'Li Xiang — Rememento: White Shadow', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Zen Silerfang', img: "Hijos/Garou y Kuroka/Zen Silverfang.jpg", gender: 'M', tag: 'L', series: 'Blood Lad', meta: 'Wolf — Blood Lad', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''} //* 💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀 Deadpool — Deadpool', link: '#' }
      ]},
      { family: 'Akira, Mereoleona y Derieri', parents: [
        { name: 'Akira Mikado', img: 'fotos-poderes/Akira Mikado.jpg' },
        { name: 'Mereoleona Vermillion', img: 'fotos-poderes/Mereoleona Vermillion.jpg' },
        { name: 'Derieri Sukuna', img: "fotos-poderes/Derieri.jpg"},
      ], children: [
        { name: 'Leo Mikado', img: "Hijos/Akira y cñia/Mereoleona/Leo Mikado.jpg", gender: 'M', tag: 'L', series: 'Black Clover', meta: 'Leopold Vermillion - Black Clover - [Mereoleona Vermillion]', link: '#', born: true , age: '2 años', role: 'Guerrero', personality: 'Soberbio y aguerrido', powers: 'Fuego', notes: ''},
        { name: 'Evanescencia Mikado', img: "Hijos/Akira y cñia/Derieri/Evanescencia Mikado.jpg", gender: 'F', tag: 'Y', series: 'The Demon King’s Channel', meta: 'Evanescencia - The Demon King’s Channel - [Derieri Sukuna]', link: '#', born: false , age: '', role: '', personality: '', powers: '', notes: ''},
        ]},
      { family: 'Arthur y Momo', parents: [
        { name: 'Arthur Boyle', img: 'fotos-poderes/Arthur Boyle.jpg' },
        { name: 'Momo Yaoyorozu', img: 'fotos-poderes/Momo Yaoyorozu.png' }
      ], children: [
        { name: '???', gender: '?', tag: '?', series: '???', meta: '??? — ???', link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}
      ]},
      { family: 'Kaedehara y Shiva', parents: [
        { name: 'Kaedehara Kazuha', img: 'fotos-poderes/Kazuha.jpg' },
        { name: 'Shiva Kane', img: 'fotos-poderes/Shiva Kane.jpg' }
      ], children: [
        { name: 'Minerva Kane', gender: 'F', tag: 'Y', img:"Hijos/Kaedehara y Shiva/Minerva Kane.jpg" ,series: 'Cardfight!! Vanguard G', meta: 'Tokoha Anjou — Cardfight!! Vanguard G', born:true, link: '#' , age: '', role: '', personality: '', powers: '', notes: ''},
        { name: 'Vesta Kane', gender: 'F', tag: 'L', img:"Hijos/Kaedehara y Shiva/Vesta Kane.webp" ,series: 'The God of Highschool', meta: 'Mah Miseon — The God of Highschool', born:false, link: '#' , age: '', role: '', personality: '', powers: '', notes: ''}

      ]},
    ];

    const familiesEl = document.getElementById('families');
    const indexList = document.getElementById('indexList');
    const noFamiliesMsg = document.getElementById('noFamiliesMsg');
    const siteHeader = document.getElementById('siteHeader');

    const familySidebar = document.getElementById('familySidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const controls = document.getElementById('controls');
    const filtersToggle = document.getElementById('filtersToggle');

    filtersToggle.addEventListener('click', () => {
      const open = controls.classList.toggle('open');
      filtersToggle.setAttribute('aria-expanded', String(open));
      filtersToggle.lastElementChild.textContent = open ? '▴' : '▾';
      updateHeaderHeight();
    });

    function setMobileSidebarState(open){
      const isMobile = window.innerWidth <= 980;

      if(!isMobile){
        familySidebar.classList.remove('open');
        sidebarToggle.setAttribute('aria-expanded', 'true');
        return;
      }

      familySidebar.classList.toggle('open', open);
      sidebarToggle.setAttribute('aria-expanded', String(open));
    }

    function updateHeaderHeight(){
      const h = siteHeader.offsetHeight || 88;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    }

    function normalize(s){
      return (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'')
        .toLowerCase()
        .trim();
    }

    function slugify(title){
      return normalize(title).replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    }

    function escapeHTML(str){
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function initials(name){
      const clean = (name || '??').replace(/[^\p{L}\p{N}\s?]/gu,' ').trim();
      if(clean === '???') return '???';
      const parts = clean.split(/\s+/).filter(Boolean);
      return parts.slice(0,2).map(p => p[0]?.toUpperCase() || '').join('') || '??';
    }

    function genderMark(g){
      return g === 'F' ? '♀️' : g === 'M' ? '♂️' : '❔';
    }

    function tagClass(t){
      return t === 'S' ? 'S' : t === 'L' ? 'L' : t === 'Y' ? 'Y' : 'Q';
    }

    function isValidLink(link){
      return typeof link === 'string' && link.trim() !== '' && link.trim() !== '#';
    }

    function isValidImage(src){
      return typeof src === 'string' && src.trim() !== '';
    }

    function imageOrFallback(src, alt, fallbackHTML, className){
      if(isValidImage(src)){
        return `<img class="${className}" src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy" onerror="this.parentElement.classList.remove('has-img'); this.remove();">`;
      }

      return fallbackHTML;
    }

    function parentName(parent){
      const parentObj = typeof parent === 'string' ? { name: parent, img: '' } : parent;
      return parentObj.name || '???';
    }

    function sortedParents(parents){
      return [...parents].sort((a, b) => normalize(parentName(a)).localeCompare(normalize(parentName(b)), 'es'));
    }

    function sortedFamilies(){
      return [...DATA].sort((a, b) => {
        if(state.sort === 'children-desc'){
          return b.children.length - a.children.length || normalize(a.family).localeCompare(normalize(b.family), 'es');
        }

        if(state.sort === 'children-asc'){
          return a.children.length - b.children.length || normalize(a.family).localeCompare(normalize(b.family), 'es');
        }

        return normalize(a.family).localeCompare(normalize(b.family), 'es');
      });
    }

    function renderFamilies(){
      familiesEl.innerHTML = '';

      sortedFamilies().forEach((fam, i) => {
        const section = document.createElement('section');
        section.className = 'panel family';
        section.dataset.title = fam.family;
        section.dataset.parents = fam.parents.map(parentName).join(' ');
        section.dataset.childCount = String(fam.children.length);
        section.id = slugify(fam.family) || `familia-${i+1}`;

        section.innerHTML = `
          <div class="family-header">
            <div class="parents">
              ${sortedParents(fam.parents).map(parent => {
                const parentObj = typeof parent === 'string' ? { name: parent, img: '' } : parent;
                const parentName = parentObj.name || '???';
                const parentImg = parentObj.img || '';
                return `<div class="avatar ${isValidImage(parentImg) ? 'has-img' : ''}" title="${escapeHTML(parentName)}">${imageOrFallback(parentImg, parentName, escapeHTML(initials(parentName)), 'avatar-img')}</div>`;
              }).join('')}
            </div>
            <h2 class="family-title">${escapeHTML(fam.family)}</h2>
          </div>

          <div class="children">
            ${fam.children.map((kid, idx) => `
              <article
                class="card ${kid.born === true ? 'born' : kid.born === false ? 'unborn' : 'unknown-born'}"
                tabindex="0"
                role="button"
                aria-label="Abrir ficha de ${escapeHTML(kid.name)}"
                data-name="${escapeHTML(kid.name)}"
                data-series="${escapeHTML(kid.series)}"
                data-gender="${escapeHTML(kid.gender)}"
                data-tag="${escapeHTML(kid.tag)}"
                data-link="${escapeHTML(kid.link)}"
                data-age="${escapeHTML(kid.age)}"
                data-role="${escapeHTML(kid.role)}"
                data-personality="${escapeHTML(kid.personality)}"
                data-powers="${escapeHTML(kid.powers)}"
                data-notes="${escapeHTML(kid.notes)}"
                data-parents-label="${escapeHTML(fam.parents.map(parentName).filter(Boolean).join(' y '))}"
                data-born-label="${escapeHTML(kid.born === true ? 'Nacido/a' : kid.born === false ? 'No nacido/a' : 'Estado desconocido')}"
              >
                <div class="card-media ${isValidImage(kid.img) ? 'has-img' : ''}">
                  ${imageOrFallback(
                    kid.img,
                    kid.name,
                    `${escapeHTML(initials(kid.name))}<br><small>${escapeHTML(kid.series || 'Sin serie')}</small>`,
                    'card-img'
                  )}
                </div>

                <div class="card-main">
                  <h3>${escapeHTML(genderMark(kid.gender) + ' ' + kid.name)}</h3>
                  <p>${escapeHTML(kid.meta)}</p>
                  <div class="card-status">
                    <span class="status-pill ${kid.born === true ? 'born' : kid.born === false ? 'unborn' : 'unknown'}">
                      ${escapeHTML(kid.born === true ? 'Nacido/a' : kid.born === false ? 'No nacido/a' : 'Estado desconocido')}
                    </span>
                    <span class="tag-pill ${tagClass(kid.tag)}">Clase ${escapeHTML(kid.tag)}</span>
                  </div>
                </div>

                <div class="card-side">
                  <span class="kid-num" title="Posición en la familia">${idx + 1}</span>
                  <span class="badge ${tagClass(kid.tag)}" title="Etiqueta: ${escapeHTML(kid.tag)}">${escapeHTML(kid.tag)}</span>
                  <span class="card-cta">Ver ficha →</span>
                </div>
              </article>
            `).join('')}
          </div>
        `;

        familiesEl.appendChild(section);
      });

      rebuildIndex();
      apply();
      updateHeaderHeight();
    }

    function rebuildIndex(){
      const visibleFamilies = [...document.querySelectorAll('section.family:not(.hidden)')];
      indexList.innerHTML = '';

      visibleFamilies.forEach((sec, i) => {
        const title = sec.dataset.title || `Familia ${i + 1}`;
        if(!sec.id) sec.id = slugify(title) || `familia-${i + 1}`;

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${sec.id}`;
        a.textContent = title;

        a.addEventListener('click', () => {
          if(window.innerWidth <= 980){
            setMobileSidebarState(false);
          }
        });

        li.appendChild(a);
        indexList.appendChild(li);
      });

      noFamiliesMsg.style.display = visibleFamilies.length ? 'none' : '';
    }

    const themeBtn = document.getElementById('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const storedTheme = localStorage.getItem('dbmin-theme');

    if(storedTheme === 'light' || (!storedTheme && prefersLight)){
      document.documentElement.classList.add('light');
    }

    updateThemeButton();

    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('light');
      localStorage.setItem('dbmin-theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
      updateThemeButton();
    });

    function updateThemeButton(){
      const isLight = document.documentElement.classList.contains('light');
      themeBtn.setAttribute('aria-pressed', String(isLight));
      themeBtn.textContent = isLight ? '🌙 Cambiar a oscuro' : '☀️ Cambiar a claro';
    }

    const q = document.getElementById('q');
    const clear = document.getElementById('clear');
    const results = document.getElementById('results');
    const resultsStrip = document.getElementById('resultsStrip');
    const tagBtns = [...document.querySelectorAll('[data-filter-tag]')];
    const genderBtns = [...document.querySelectorAll('[data-filter-gender]')];
    const sortBtns = [...document.querySelectorAll('[data-sort]')];

    const state = {
      term: '',
      tags: new Set(),
      genders: new Set(),
      sort: 'alpha'
    };

    function toggleBtn(btn){
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
    }

    function apply(){
      const nterm = normalize(state.term);
      const familySections = [...document.querySelectorAll('section.family')];

      familySections.forEach(sec => {
        const familyText = normalize(`${sec.dataset.title || ''} ${sec.dataset.parents || ''}`);
        const familyHit = !!nterm && familyText.includes(nterm);
        const cards = [...sec.querySelectorAll('.card')];

        cards.forEach(card => {
          const name = normalize(card.dataset.name);
          const series = normalize(card.dataset.series);
          const meta = normalize(card.querySelector('p')?.textContent || '');
          const tag = card.dataset.tag || '?';
          const gender = card.dataset.gender || '?';

          const childHit = name.includes(nterm) || series.includes(nterm) || meta.includes(nterm);
          const termOk = !nterm || familyHit || childHit;
          const tagOk = state.tags.size === 0 || state.tags.has(tag);
          const genOk = state.genders.size === 0 || state.genders.has(gender);
          const visible = termOk && tagOk && genOk;

          card.classList.toggle('hidden', !visible);
        });

        const anyVisible = cards.some(c => !c.classList.contains('hidden'));
        sec.classList.toggle('hidden', !anyVisible);
      });

      rebuildIndex();

      // Antes se clonaban las cards arriba en "Coincidencias", y por eso al buscar
      // el mismo personaje podía aparecer repetido. Ahora solo se muestra en su familia.
      results.classList.add('hidden');
      resultsStrip.innerHTML = '';
    }

    let tId = null;

    q.addEventListener('input', () => {
      state.term = q.value;
      clear.style.visibility = q.value ? 'visible' : 'hidden';
      clearTimeout(tId);
      tId = setTimeout(apply, 100);
    });

    clear.addEventListener('click', () => {
      q.value = '';
      state.term = '';
      clear.style.visibility = 'hidden';
      q.focus();
      apply();
    });

    window.addEventListener('keydown', e => {
      if(e.key === '/' && document.activeElement !== q){
        e.preventDefault();
        q.focus();
      }
    });

    tagBtns.forEach(btn => btn.addEventListener('click', () => {
      const tag = btn.dataset.filterTag;
      toggleBtn(btn);

      if(btn.getAttribute('aria-pressed') === 'true'){
        state.tags.add(tag);
      } else {
        state.tags.delete(tag);
      }

      apply();
    }));

    genderBtns.forEach(btn => btn.addEventListener('click', () => {
      const g = btn.dataset.filterGender;
      toggleBtn(btn);

      if(btn.getAttribute('aria-pressed') === 'true'){
        state.genders.add(g);
      } else {
        state.genders.delete(g);
      }

      apply();
    }));

    sortBtns.forEach(btn => btn.addEventListener('click', () => {
      state.sort = btn.dataset.sort || 'alpha';
      sortBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      renderFamilies();
    }));

    function updateDashboardMetrics(){
      const families = DATA.length;
      const children = DATA.reduce((total, fam) => total + fam.children.length, 0);
      const born = DATA.reduce((total, fam) => total + fam.children.filter(kid => kid.born === true).length, 0);

      const metricFamilies = document.getElementById('metricFamilies');
      const metricChildren = document.getElementById('metricChildren');
      const metricBorn = document.getElementById('metricBorn');

      if(metricFamilies) metricFamilies.textContent = families;
      if(metricChildren) metricChildren.textContent = children;
      if(metricBorn) metricBorn.textContent = born;
    }

    document.getElementById('reset').addEventListener('click', () => {
      state.term = '';
      q.value = '';
      clear.style.visibility = 'hidden';
      state.tags.clear();
      state.genders.clear();
      state.sort = 'alpha';

      [...tagBtns, ...genderBtns].forEach(b => b.setAttribute('aria-pressed', 'false'));
      sortBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sort === 'alpha')));
      renderFamilies();
    });

    const modal = document.getElementById('modal');
    const mBox = document.getElementById('mBox');
    const mTitle = document.getElementById('mTitle');
    const mMeta = document.getElementById('mMeta');
    const mLink = document.getElementById('mLink');
    const mStatusRow = document.getElementById('mStatusRow');
    const mDetails = document.getElementById('mDetails');
    const mClose = document.getElementById('mClose');

    let lastFocusedCard = null;

    function openCard(card){
      lastFocusedCard = card;

      const title = card.querySelector('h3')?.textContent || '';
      const meta = card.querySelector('p')?.textContent || '';
      const mediaHTML = card.querySelector('.card-media')?.innerHTML || '';
      const link = card.dataset.link || '#';
      const bornLabel = card.dataset.bornLabel || 'Estado desconocido';
      const tag = card.dataset.tag || '?';
      const gender = card.dataset.gender || '?';
      const parentsLabel = card.dataset.parentsLabel || '';
      const details = [
        ['Padres', parentsLabel],
        ['Edad', card.dataset.age],
        ['Rol', card.dataset.role],
        ['Personalidad', card.dataset.personality, true],
        ['Poderes', card.dataset.powers, true],
        ['Notas', card.dataset.notes, true]
      ];

      mBox.innerHTML = mediaHTML;
      mTitle.textContent = title;
      mMeta.textContent = meta;
      mStatusRow.innerHTML = `
        <span class="m-pill ${bornLabel.includes('No') ? 'locked' : bornLabel.includes('Nacido') ? 'good' : ''}">${escapeHTML(bornLabel)}</span>
        <span class="m-pill">${escapeHTML(genderMark(gender))}</span>
        <span class="m-pill">TAG ${escapeHTML(tag)}</span>
      `;
      mDetails.innerHTML = `
        <div class="m-info-grid">
          ${details
            .filter(([, value]) => String(value || '').trim() !== '')
            .map(([label, value, wide]) => `<div class="${wide ? 'm-note' : 'm-info'}"><b>${escapeHTML(label)}</b><span>${escapeHTML(value)}</span></div>`)
            .join('')}
        </div>
      `;

      if(isValidLink(link)){
        mLink.href = link;
        mLink.setAttribute('aria-disabled', 'false');
      } else {
        mLink.href = '#';
        mLink.setAttribute('aria-disabled', 'true');
      }

      if(typeof modal.showModal === 'function'){
        modal.showModal();
      }
    }

    function closeModal(){
      if(modal.open) modal.close();
      if(lastFocusedCard) lastFocusedCard.focus();
    }

    document.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if(!card) return;
      openCard(card);
    });

    document.addEventListener('keydown', (e) => {
      const card = document.activeElement?.closest?.('.card');

      if(card && (e.key === 'Enter' || e.key === ' ')){
        e.preventDefault();
        openCard(card);
      }

      if(e.key === 'Escape'){
        closeModal();
      }
    });

    mClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if(!inside){
        closeModal();
      }
    });

    sidebarToggle.addEventListener('click', () => {
      const isOpen = familySidebar.classList.contains('open');
      setMobileSidebarState(!isOpen);
    });

    window.addEventListener('resize', () => {
      updateHeaderHeight();

      if(window.innerWidth > 780){
        controls.classList.remove('open');
        filtersToggle.setAttribute('aria-expanded', 'false');
        filtersToggle.lastElementChild.textContent = '▾';
      }

      if(window.innerWidth <= 980){
        setMobileSidebarState(false);
      } else {
        setMobileSidebarState(true);
      }
    });

    window.addEventListener('load', () => {
      updateHeaderHeight();

      if(window.innerWidth <= 980){
        setMobileSidebarState(false);
      } else {
        setMobileSidebarState(true);
      }
    });

    updateDashboardMetrics();
    renderFamilies();

document.querySelectorAll('.tab-btn').forEach(btn=>{
 btn.addEventListener('click',()=>{
   if(btn.disabled) return;
   document.querySelectorAll('.tab-btn').forEach(b=>{
     const active = b === btn;
     b.classList.toggle('active', active);
     b.setAttribute('aria-selected', String(active));
   });
   document.getElementById('tab-eternal').classList.toggle('hidden',btn.dataset.tab!=='eternal');
   document.getElementById('tab-gen1').classList.toggle('hidden',btn.dataset.tab!=='gen1');
   updateHeaderHeight();
 });
});
