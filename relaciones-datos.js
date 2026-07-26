/*
 * DATOS DEL MAPA DE RELACIONES RP
 * Se actualiza desde relaciones.html mediante “Guardar en el código”.
 */
window.RELATIONSHIP_DATA = {
  "characters": [
    {"id":"ren","name":"Renzu Itō","universe":"inazuma","role":"Delantero Solar","icon":"🔥","image":"https://cdn.polyspeak.ai/speakmaster/44684906541e82a2213588e6c53521c1.webp","status":"active"},
    {"id":"dan","name":"Dan Karman","universe":"inazuma","role":"Francia / Raimon","icon":"🌪️","image":"https://static.wikia.nocookie.net/inazuma-eleven-eternal-thunder/images/2/24/DanNuevo.jpg/revision/latest?cb=20241112220422&path-prefix=es","status":"active"},
    {"id":"hikaru","name":"Hikaru Hoshihara","universe":"inazuma","role":"Capitán del Raimon","icon":"🤺","image":"https://static.wikia.nocookie.net/inazuma-eleven-eternal-thunder/images/a/a5/Hikaru_Hoshihara.png/revision/latest?cb=20250107013330&path-prefix=es","status":"active"},
    {"id":"candace","name":"Candace Foster","universe":"inazuma","role":"Ex-Capitana del Raimon","icon":"❄️","image":"https://static.wikia.nocookie.net/inazuma-eleven-eternal-thunder/images/b/bd/Candace.jpg/revision/latest?cb=20240330152210&path-prefix=es","status":"active"},
    {"id":"serena","name":"Serena Kitagawa","universe":"inazuma","role":"Modelo y Futbolista","icon":"💡","image":"https://i.pinimg.com/736x/0b/d3/13/0bd3138c5acaae90a18667a0da118892.jpg","status":"active"},
    {"id":"wangqing","name":"Wang Qing","universe":"inazuma","role":"Modelo","icon":"👲","image":"https://i.pinimg.com/736x/8b/69/b2/8b69b20b1b5f8cb8c76fdb6996d9c272.jpg","status":"active"},
    {"id":"freyja","name":"Freyja Kane","universe":"dragonball","role":"Heredera de los Kane","icon":"⚔️","image":"https://i.pinimg.com/1200x/2b/62/07/2b620780b4b1cc11a5f26a855822ee1d.jpg","status":"active"},
    {"id":"nara","name":"Nara Midori","universe":"dragonball","role":"Majin protectora","icon":"💚","image":"https://static.wikia.nocookie.net/dragon-ball-eternal-warriors/images/d/d6/Nara.png/revision/latest?cb=20250614182618&path-prefix=es","status":"active"}
  ],
  "relationships": [
    {"id":"rel-1","from":"ren","to":"dan","type":"friendship","title":"Duelo en punta","label":"","status":"active","visibility":"public","intensity":3,"description":"Son muy buenos amigos que se conocen desde que Ren llegó al equipo. Quieren demostrar quién de los dos merece ser llamado el pichichi del Raimon.","moments":[]},
    {"id":"rel-2","from":"ren","to":"hikaru","type":"friendship","title":"Respeto al capitán","label":"","status":"active","visibility":"public","intensity":3,"description":"Desde que lo nombraron capitán se ha hecho de respetar, y esa actitud hace que Ren le tenga cierto respeto.","moments":[]},
    {"id":"rel-3","from":"dan","to":"hikaru","type":"friendship","title":"Desde el inicio","label":"🤝 Amistad","status":"active","visibility":"public","intensity":3,"description":"Se conocen desde que ambos se unieron al Raimon; la amistad vino con los años.","moments":[]},
    {"id":"rel-4","from":"hikaru","to":"candace","type":"love","title":"Diosa y Mortal","label":"","status":"active","visibility":"public","intensity":3,"description":"Unidos por el fútbol y la confianza, Candace profesa un amor divino hacia Hikaru inquebrantable.","moments":[]},
    {"id":"rel-5","from":"candace","to":"dan","type":"friendship","title":"Dioses del viento","label":"","status":"active","visibility":"public","intensity":3,"description":"Cuando Dan se unió al Raimon, Candace aún era la capitana; se conocen por el respeto mutuo.","moments":[]},
    {"id":"rel-6","from":"ren","to":"candace","type":"friendship","title":"Sabana Africana","label":"","status":"active","visibility":"public","intensity":3,"description":"Ren y Candace lideraban la delantera junto a Dan, y tenían una riña por ver quién metía más goles: el guepardo o el león.","moments":[]},
    {"id":"rel-7","from":"ren","to":"wangqing","type":"love","title":"Destellos de un Futuro Perfecto","label":"","status":"active","visibility":"public","intensity":3,"description":"Fue la persona que le sacó de una penumbra tenebrosa que acechaba la cabeza de Ren.","moments":[]},
    {"id":"rel-8","from":"wangqing","to":"serena","type":"friendship","title":"Trabajo en equipo","label":"","status":"active","visibility":"public","intensity":3,"description":"Se conocieron en la sede de modelaje y se han convertido, juntas, en las mejores de Japón.","moments":[]},
    {"id":"rel-9","from":"serena","to":"dan","type":"love","title":"Amor de Modelo","label":"","status":"active","visibility":"public","intensity":3,"description":"No la enamoró su belleza, sino lo bello que es su corazón.","moments":[]},
    {"id":"rel-10","from":"dan","to":"wangqing","type":"friendship","title":"Amigo de mis Amigos","label":"","status":"active","visibility":"public","intensity":3,"description":"Novia de Ren y mejor amiga de Serena: es una conexión simple, pero de buen rollo.","moments":[]},
    {"id":"rel-11","from":"serena","to":"hikaru","type":"friendship","title":"¡Sí, capitán!","label":"","status":"active","visibility":"public","intensity":3,"description":"Se conocen al aparecer juntos con los campeones japoneses, pero le guarda respeto por ser el capitán del Raimon.","moments":[]},
    {"id":"rel-12","from":"ren","to":"serena","type":"friendship","title":"Modelo x Modelo","label":"","status":"active","visibility":"public","intensity":3,"description":"Es la mejor amiga de su novia y compañera de equipo.","moments":[]}
  ]
};
