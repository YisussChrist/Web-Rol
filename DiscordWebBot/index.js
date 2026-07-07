const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const CANAL_AVISOS_ID = "1514802130647515285";

const WIKI_API = "https://dragon-ball-eternal-warriors.fandom.com/es/api.php";
const WIKI_BASE = "https://dragon-ball-eternal-warriors.fandom.com/es/wiki/";

const RUTA_CALENDARIO = path.join(__dirname, "..", "calendario.html");
const RUTA_EMBARAZOS = path.join(__dirname, "..", "embarazos.html");
const RUTA_PERSONAJES = path.join(__dirname, "..", "personajes.json");
const RUTA_PODER = path.join(__dirname, "..", "poder.html");

let ultimoComandoRepetible = null;

function crearEmbedError(titulo, descripcion) {
    return new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle(titulo)
        .setDescription(descripcion)
        .setTimestamp();
}

function mezclarLista(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function dividirEnGrupos(lista, tamanoGrupo) {
    const grupos = [];

    for (let i = 0; i < lista.length; i += tamanoGrupo) {
        grupos.push(lista.slice(i, i + tamanoGrupo));
    }

    return grupos;
}

function partirListaPorComas(texto) {
    return texto
        .split(",")
        .map(x => x.trim())
        .filter(x => x.length > 0);
}

function limitarTexto(texto, max = 3900) {
    if (!texto) return "";
    if (texto.length <= max) return texto;
    return texto.slice(0, max - 20) + "\n...";
}

function formatearNumero(numero) {
    return Number(numero).toLocaleString("es-ES");
}

function extraerEventosCalendario() {
    if (!fs.existsSync(RUTA_CALENDARIO)) return null;

    const contenido = fs.readFileSync(RUTA_CALENDARIO, "utf8");

    const regex =
        /name:\s*"([^"]+)"[\s\S]*?day:\s*(\d+)[\s\S]*?month:\s*(\d+)[\s\S]*?type:\s*"([^"]+)"/g;

    const eventos = [];
    let match;

    while ((match = regex.exec(contenido)) !== null) {
        eventos.push({
            nombre: match[1],
            dia: Number(match[2]),
            mes: Number(match[3]),
            tipo: match[4]
        });
    }

    return eventos;
}

function extraerPersonajesPoder() {
    if (!fs.existsSync(RUTA_PODER)) return null;

    const html = fs.readFileSync(RUTA_PODER, "utf8");

    const inicio = html.indexOf("const characters =");

    if (inicio === -1) return [];

    const inicioArray = html.indexOf("[", inicio);
    const finArray = html.indexOf("];", inicioArray);

    if (inicioArray === -1 || finArray === -1) return [];

    let textoArray = html.slice(inicioArray, finArray + 1);

    textoArray = textoArray
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/,\s*]/g, "]")
        .replace(/,\s*}/g, "}");

    try {
        return Function(`"use strict"; return (${textoArray});`)();
    } catch (error) {
        console.error("Error leyendo characters de poder.html:", error);
        console.log("Fragmento problemático:");
        console.log(textoArray.slice(0, 1000));
        return [];
    }
}

function extraerEmbarazos() {
    if (!fs.existsSync(RUTA_EMBARAZOS)) return null;

    const html = fs.readFileSync(RUTA_EMBARAZOS, "utf8");

    const matchArray = html.match(/const\s+embarazos\s*=\s*\[([\s\S]*?)\];/);

    if (!matchArray) return [];

    const bloque = matchArray[1];

    const regex = /\{\s*pareja:\s*"([^"]+)"\s*,\s*anuncio:\s*"([^"]+)"\s*,\s*parto:\s*"([^"]+)"\s*\}/g;

    const embarazos = [];
    let match;

    while ((match = regex.exec(bloque)) !== null) {
        embarazos.push({
            pareja: match[1],
            anuncio: match[2],
            parto: match[3]
        });
    }

    return embarazos;
}

function crearBarra(porcentaje) {
    const totalBloques = 10;
    const llenos = Math.round((porcentaje / 100) * totalBloques);
    const vacios = totalBloques - llenos;

    return "🟩".repeat(llenos) + "⬜".repeat(vacios);
}

function calcularProgreso(fechaInicio, fechaParto) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const parto = new Date(fechaParto);

    const total = parto - inicio;
    const pasado = hoy - inicio;
    const restante = parto - hoy;

    const porcentaje = Math.min(100, Math.max(0, Math.round((pasado / total) * 100)));
    const diasRestantes = Math.max(0, Math.ceil(restante / (1000 * 60 * 60 * 24)));

    return {
        porcentaje,
        diasRestantes,
        barra: crearBarra(porcentaje)
    };
}

function diasHastaEvento(dia, mes) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let fechaEvento = new Date(hoy.getFullYear(), mes - 1, dia);
    fechaEvento.setHours(0, 0, 0, 0);

    if (fechaEvento < hoy) {
        fechaEvento = new Date(hoy.getFullYear() + 1, mes - 1, dia);
        fechaEvento.setHours(0, 0, 0, 0);
    }

    return Math.round((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
}



function buscarPersonaje(nombreBuscado) {
    if (!fs.existsSync(RUTA_PERSONAJES)) return null;

    const personajes = JSON.parse(fs.readFileSync(RUTA_PERSONAJES, "utf8"));
    const lista = Array.isArray(personajes) ? personajes : Object.values(personajes);
    const busqueda = nombreBuscado.toLowerCase();

    return lista.find(p => {
        const nombre = String(p.nombre || p.name || "").toLowerCase();
        return nombre.includes(busqueda);
    });
}

async function buscarWiki(nombrePagina) {

    // Intentar búsqueda exacta primero
    let params = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "extracts|pageimages",
        exintro: "true",
        explaintext: "true",
        redirects: "true",
        pithumbsize: "400",
        titles: nombrePagina
    });

    let respuesta = await fetch(`${WIKI_API}?${params.toString()}`);
    let data = await respuesta.json();

    let pages = data.query.pages;
    let pagina = Object.values(pages)[0];

    // Si no existe, buscar sugerencias
    if (!pagina || pagina.missing) {

        const busqueda = await fetch(
    `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(nombrePagina)}&srlimit=5&format=json`
);

const resultado = await busqueda.json();

if (!resultado.query || !resultado.query.search || resultado.query.search.length === 0) {
    return null;
}

const tituloEncontrado = resultado.query.search[0].title;

        params = new URLSearchParams({
            action: "query",
            format: "json",
            prop: "extracts|pageimages",
            exintro: "true",
            explaintext: "true",
            redirects: "true",
            pithumbsize: "400",
            titles: tituloEncontrado
        });

        respuesta = await fetch(`${WIKI_API}?${params.toString()}`);
        data = await respuesta.json();

        pages = data.query.pages;
        pagina = Object.values(pages)[0];
    }

    if (!pagina || pagina.missing) {
        return null;
    }

    return {
        titulo: pagina.title,
        resumen: pagina.extract || "Esta página no tiene resumen disponible.",
        imagen: pagina.thumbnail ? pagina.thumbnail.source : null,
        url: WIKI_BASE + encodeURIComponent(
            pagina.title.replaceAll(" ", "_")
        )
    };
}

async function comandoDuelo(message, texto, guardar = true) {
    const participantes = partirListaPorComas(texto);

    if (participantes.length === 0) {
        const embed = crearEmbedError(
            "❌ Error en el duelo",
            "Debes poner al menos un participante.\n\nEjemplo:\n`-duelo Alma, Tao, Freyja`"
        );

        return message.reply({ embeds: [embed] });
    }

    if (guardar) {
        ultimoComandoRepetible = {
            tipo: "duelo",
            texto
        };
    }

    const ganador = participantes[Math.floor(Math.random() * participantes.length)];

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle("🏆 Resultado del Duelo")
        .setDescription(`El ganador es:\n\n# ${ganador}`)
        .setFooter({ text: "Sistema de Duelo" })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
}

async function comandoTorneo(message, texto, guardar = true) {
    const partes = texto.split(" ");
    const tamanoGrupo = Number(partes[0]);

    if (!tamanoGrupo || tamanoGrupo < 2) {
        const embed = crearEmbedError(
            "❌ Error en el torneo",
            "Debes indicar cuántos equipos tendrá cada grupo.\n\nEjemplo:\n`-torneo 2 Raimon, Zeus, Royal, Alius`"
        );

        return message.reply({ embeds: [embed] });
    }

    const listaTexto = texto.replace(String(tamanoGrupo), "").trim();
    const equipos = partirListaPorComas(listaTexto);

    if (equipos.length < tamanoGrupo) {
        const embed = crearEmbedError(
            "❌ Equipos insuficientes",
            "Hay menos equipos que el tamaño de grupo indicado."
        );

        return message.reply({ embeds: [embed] });
    }

    if (guardar) {
        ultimoComandoRepetible = {
            tipo: "torneo",
            texto
        };
    }

    const mezclados = mezclarLista(equipos);
    const grupos = dividirEnGrupos(mezclados, tamanoGrupo);

    const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle("🏆 Sorteo de Torneo")
        .setDescription(`Grupos de **${tamanoGrupo}** equipos.`)
        .setFooter({ text: "Sistema de Torneos" })
        .setTimestamp();

    grupos.forEach((grupo, index) => {
        const letra = String.fromCharCode(65 + index);

        embed.addFields({
            name: `Grupo ${letra}`,
            value: grupo.map(e => `• ${e}`).join("\n"),
            inline: true
        });
    });

    return message.channel.send({ embeds: [embed] });
}

async function comandoBrackets(message, texto, guardar = true) {
    const equipos = partirListaPorComas(texto);

    if (equipos.length < 2) {
        const embed = crearEmbedError(
            "❌ Error en brackets",
            "Debes poner al menos 2 equipos.\n\nEjemplo:\n`-brackets Raimon, Zeus, Royal, Alius`"
        );

        return message.reply({ embeds: [embed] });
    }

    if (guardar) {
        ultimoComandoRepetible = {
            tipo: "brackets",
            texto
        };
    }

    const mezclados = mezclarLista(equipos);
    const emparejamientos = [];

    for (let i = 0; i < mezclados.length; i += 2) {
        const equipo1 = mezclados[i];
        const equipo2 = mezclados[i + 1];

        if (equipo2) {
            emparejamientos.push(`⚔️ **${equipo1}** VS **${equipo2}**`);
        } else {
            emparejamientos.push(`🟢 **${equipo1}** pasa automáticamente.`);
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle("⚔️ Brackets del Torneo")
        .setDescription(emparejamientos.join("\n\n"))
        .setFooter({ text: "Sistema de Brackets" })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
}

async function comandoEquipos(message, texto, guardar = true) {
    const partes = texto.split("|");

    if (partes.length < 2) {
        const embed = crearEmbedError(
            "❌ Error en equipos",
            "Formato correcto:\n`-equipos Ren, Jeanne | Alma, Tao, Freyja, Goku, Vegeta`"
        );

        return message.reply({ embeds: [embed] });
    }

    const capitanes = partirListaPorComas(partes[0]);
    const jugadores = partirListaPorComas(partes[1]);

    if (capitanes.length !== 2) {
        const embed = crearEmbedError(
            "❌ Faltan capitanes",
            "Debes poner exactamente 2 capitanes antes de la barra `|`."
        );

        return message.reply({ embeds: [embed] });
    }

    if (jugadores.length < 2) {
        const embed = crearEmbedError(
            "❌ Faltan jugadores",
            "Debes poner al menos 2 jugadores después de la barra `|`."
        );

        return message.reply({ embeds: [embed] });
    }

    if (guardar) {
        ultimoComandoRepetible = {
            tipo: "equipos",
            texto
        };
    }

    const mezclados = mezclarLista(jugadores);
    const equipo1 = [];
    const equipo2 = [];

    mezclados.forEach((jugador, index) => {
        if (index % 2 === 0) equipo1.push(jugador);
        else equipo2.push(jugador);
    });

    const embed = new EmbedBuilder()
        .setColor(0x1ABC9C)
        .setTitle("🎯 Equipos aleatorios")
        .addFields(
            {
                name: `Equipo de ${capitanes[0]}`,
                value: [`👑 ${capitanes[0]}`, ...equipo1.map(j => `• ${j}`)].join("\n"),
                inline: true
            },
            {
                name: `Equipo de ${capitanes[1]}`,
                value: [`👑 ${capitanes[1]}`, ...equipo2.map(j => `• ${j}`)].join("\n"),
                inline: true
            }
        )
        .setFooter({ text: "Sistema de Equipos" })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
}

client.once("ready", async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    try {
        const canal = await client.channels.fetch(CANAL_AVISOS_ID);

        const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle("🤖 Bot conectado")
            .setDescription("Bot completamente operativo de nuevo.")
            .setFooter({ text: "Web Updates Bot" })
            .setTimestamp();

        await canal.send({ embeds: [embed] });
    } catch (error) {
        console.log("⚠️ No he podido enviar el aviso de conexión:", error.message);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const contenido = message.content.trim();

    if (contenido.startsWith("-wiki")) {
    const busqueda = contenido.replace("-wiki", "").trim();

    if (!busqueda) {
        const embed = crearEmbedError(
            "❌ Falta el nombre de la página",
            "Ejemplo:\n`-wiki Nara Midori`"
        );

        return message.reply({ embeds: [embed] });
    }

    try {
        const pagina = await buscarWiki(busqueda);

if (!pagina) {
    const embed = crearEmbedError(
        "❌ Página no encontrada",
        `No he encontrado ninguna página llamada **${busqueda}** en la wiki.`
    );

    return message.reply({ embeds: [embed] });
}

        const embed = new EmbedBuilder()
    .setColor(0x8E44AD)
    .setTitle(`📚 ${pagina.titulo}`)
    .setURL(pagina.url)
    .setDescription(limitarTexto(pagina.resumen, 1000))
    .addFields(
        {
            name: "🔗 Enlace",
            value: `[Abrir artículo completo](${pagina.url})`,
            inline: false
        }
    )
    .setFooter({ text: "Dragon Ball Eternal Warriors Wiki" })
    .setTimestamp();

        if (pagina.imagen) {
            embed.setThumbnail(pagina.imagen);
        }

        return message.channel.send({
            embeds: [embed]
        });

    } catch (error) {
        console.error(error);

        const embed = crearEmbedError(
            "❌ Error al consultar la wiki",
            error.message
        );

        return message.reply({ embeds: [embed] });
    }
}

    if (contenido === "-help") {
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle("🤖 Web Updates Bot - Ayuda")
            .setDescription("Lista de comandos disponibles.")
            .addFields(
                {
                    name: "🎲 Rol y azar",
                    value:
                        "`-duelo nombre1, nombre2, nombre3`\n" +
                        "Elige un ganador aleatorio.\n\n" +
                        "`-dado`\n" +
                        "Tira un dado de 20 caras por defecto.\n\n" +
                        "`-d6`, `-d20`, `-d100`\n" +
                        "Tira dados concretos.\n\n" +
                        "`-explicacionduelo`\n" +
                        "Explica cómo funciona el sistema aleatorio de duelos.\n\n"
                },
                {
                    name: "🏆 Torneos",
                    value:
                        "`-torneo 2 equipo1, equipo2, equipo3, equipo4`\n" +
                        "Crea grupos de X equipos.\n\n" +
                        "`-brackets equipo1, equipo2, equipo3, equipo4`\n" +
                        "Crea emparejamientos eliminatorios.\n\n" +
                        "`-equipos Ren, Jeanne | Alma, Tao, Freyja, Goku`\n" +
                        "Reparte jugadores entre dos capitanes.\n\n" +
                        "`-reroll`\n" +
                        "Repite el último duelo, torneo, brackets o equipos."
                },
                {
                    name: "📅 Calendario",
                    value:
                        "`-cumples`\n" +
                        "`-cumples hoy`\n" +
                        "`-cumples mañana`\n" +
                        "`-cumples 24/12`\n\n" +
                        "`-proximoscumples`\n" +
                        "Muestra los próximos eventos."
                },
                {
                    name: "👶 Familias",
                    value:
                        "`-nacimientos`\n" +
                        "Sistema en construcción.\n\n" +
                        "`-embarazos`\n" +
                        "Muestra los embarazos activos desde `embarazos.html`."
                },
                {
                    name: "🧮 Utilidades",
                    value:
                      "`-calc 1500 * 2 + 300`\n" +
                      "Calcula operaciones matemáticas.\n\n" +

                      "`-multi 51000000 50`\n" +
                       "Calcula un multiplicador sobre un poder base.\n\n" +

                       "`-podercalc Freyja Kane * 100`\n" +
                       "Calcula operaciones usando el poder base del personaje.\n\n" +

                       "`-st Ren 4, Mavuika 2`\n" +
                       "Enfrenta dos supertécnicas. Un mayor grado aumenta las probabilidades de victoria.\n\n" +

                      "`-chatot`\n" +
                       "`'La verdad que sí'`\n\n"
                },
                {
                    name: "📚 Personajes / Wiki",
                    value:
                        "`-personaje Freyja`\n" +
                        "Busca un personaje en `personajes.json`.\n\n" +
                        "`-wiki Nara Midori`\n" +
                        "Busca una página en la wiki de Fandom.\n\n" +
                        "`-poder Freyja Kane`\n" +
                        "Muestra el poder base y transformaciones de un personaje según `poder.html`.\n\n" +
                        "`-roadmap`\n" +
                        "Muestra la hoja de ruta de eventos planeados.\n\n" 
                },
                {
                    name: "🌐 GitHub / Web",
                    value:
                        "`-ultimocambio`\n" +
                        "Muestra el último commit del repositorio."
                }
            )
            .setFooter({ text: "Web Updates Bot" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    const { WebhookClient } = require('discord.js');

const chatotWebhook = new WebhookClient({
    url: process.env.CHATOT_WEBHOOK
});

if (contenido.toLowerCase() === "-helpst") {
    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle("⚡ Sistema de Supertécnicas")
        .setDescription(
            "El comando `-st` permite enfrentar **supertécnicas**, **Espíritus Guerreros** y **Armaduras**.\n\n" +

            "## 🕹️ Uso\n" +
            "`-st Ren 5, Mavuika eg`\n" +
            "`-st Ren arm, Mavuika steg`\n\n" +

            "## 📘 Leyenda\n" +
            "`0` → Duelo sin ST **(1 choose)**\n" +
            "`1` → ST Base **(2 chooses)**\n" +
            "`2` → Grado 2 **(3 chooses)**\n" +
            "`3` → Grado 3 **(4 chooses)**\n" +
            "`4` → Grado 4 **(5 chooses)**\n" +
            "`5` → Grado 5 **(6 chooses)**\n\n" +

            "## ⚔️ Especiales\n" +
            "`eg` → Espíritu Guerrero **(7 chooses)**\n" +
            "`arm` → Armadura **(8 chooses)**\n" +
            "`armst` → ST + Armadura **(9 chooses)**\n" +
            "`steg` → ST + Espíritu Guerrero **(10 chooses)**\n\n" +

            "## 🎲 Funcionamiento\n" +
            "Cada técnica mete sus **chooses** en una bolsa imaginaria.\n" +
            "Cuantos más **chooses** tenga una técnica, mayores serán sus probabilidades de ganar.\n\n" +
            "El resultado final sigue siendo aleatorio."
        )
        .addFields(
            {
                name: "📌 Ejemplo rápido",
                value:
                    "`Ren 4` → 5 chooses\n" +
                    "`Mavuika eg` → 7 chooses\n\n" +
                    "Mavuika tendría más probabilidades, pero Ren todavía puede ganar."
            }
        )
        .setFooter({ text: "Sistema de Supertécnicas Web-Rol" })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
}

if (contenido.toLowerCase().startsWith("-st ")) {
    const texto = contenido.slice(4).trim();
    const partes = texto.split(",").map(x => x.trim()).filter(Boolean);

    if (partes.length < 2) {
        return message.reply("Uso: `-st Ren 5, Mavuika eg, Shu 3`");
    }

    function leerLado(textoLado) {
        const match = textoLado.trim().match(/(.+?)\s+(\d+|eg|arm|steg|armst)(?:\s+([+-]\d+))?$/i);

        if (!match) return null;

        const nombre = match[1].trim();
        const valor = match[2].toLowerCase();
        const modificador = match[3] ? Number(match[3]) : 0;

        const pesos = {
            eg: 7,
            arm: 8,
            armst: 9,
            steg: 10
        };

        const etiquetas = {
            eg: "Espíritu Guerrero",
            arm: "Armadura",
            armst: "ST + Armadura",
            steg: "ST + Espíritu Guerrero"
        };

        let etiqueta;
        let papeletasBase;

        if (!isNaN(valor)) {
            const grado = Number(valor);
            etiqueta = grado === 0 ? "Sin ST" : `Grado ${grado}`;
            papeletasBase = grado + 1;
        } else {
            etiqueta = etiquetas[valor];
            papeletasBase = pesos[valor];
        }

        const papeletasFinales = Math.max(1, papeletasBase + modificador);

        return {
            nombre,
            etiqueta,
            papeletasBase,
            modificador,
            papeletas: papeletasFinales
        };
    }

    const participantes = partes.map(leerLado);

    if (participantes.some(p => !p)) {
        return message.reply(
            "Uso:\n" +
            "`-st Ren 5, Mavuika eg, Shu 3`\n" +
            "`-st Ren steg +2, Mavuika armst -1, Victor 2`\n\n" +
            "Puedes añadir o quitar chooses extra con `+X` o `-X`."
        );
    }

    const total = participantes.reduce((sum, p) => sum + p.papeletas, 0);

    const bolsa = [];

    participantes.forEach(p => {
        for (let i = 0; i < p.papeletas; i++) {
            bolsa.push(p.nombre);
        }
    });

    const ganador = bolsa[Math.floor(Math.random() * bolsa.length)];

    const descripcion = participantes
        .map(p => {
            const extra = p.modificador !== 0
                ? ` ${p.modificador > 0 ? "+" : ""}${p.modificador} extra`
                : "";

            return `**${p.nombre}** (${p.etiqueta}${extra})`;
        })
        .join("\nVS\n");

    const probabilidades = participantes
        .map(p => {
            const prob = ((p.papeletas / total) * 100).toFixed(1);

            let detalle = `${p.papeletas} chooses`;

            if (p.modificador !== 0) {
                detalle += ` | ${p.papeletasBase} base ${p.modificador > 0 ? "+" : ""}${p.modificador}`;
            }

            return `${p.nombre}: ${prob}% (${detalle})`;
        })
        .join("\n");

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle("⚡ Duelo de Supertécnicas")
        .setDescription(
            `${descripcion}\n\n` +
            `🏆 **GANADOR**\n` +
            `# ${ganador}`
        )
        .addFields(
            {
                name: "📊 Probabilidades",
                value: probabilidades
            }
        )
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
}

    if (message.content === "-roadmap") {

    const roadmap = [
        {
            nombre: "Viaje en el Espacio-Tiempo a Dragon Ball",
            universo: "⚽ Inazuma Eleven",
            fecha: "18/06/2026",
            estado: "🟡"
        },
        {
            nombre: "Torneo Budokai Infantil",
            universo: "🐉 Dragon Ball",
            fecha: "",
            estado: "🟢"
        },
    ];

    const eventos = roadmap.map((evento, i) => {
        const fecha = evento.fecha?.trim()
            ? evento.fecha
            : "Aún sin fijar fecha";

        return `${evento.estado} **${i + 1}. ${evento.nombre}**
🌍 Universo: ${evento.universo}
📅 Fecha: ${fecha}`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
        .setTitle("🗺️ Hoja de Ruta del Rol")
        .setColor(0x3498DB)
        .setDescription(eventos)
        .addFields(
            {
                name: "📖 Leyenda de Estados",
                value:
                    "🟢 En preparación\n" +
                    "🟡 En desarrollo\n" +
                    "🔵 Próximo evento\n" +
                    "🟣 Planeado\n" +
                    "🔴 Retrasado\n" +
                    "✅ Completado"
            }
        )
        .setFooter({
            text: "Las fechas y eventos pueden cambiar según la historia."
        });

    await message.channel.send({ embeds: [embed] });
}



    if (contenido.startsWith("-duelo")) {
        const texto = contenido.replace("-duelo", "").trim();
        return comandoDuelo(message, texto);
    }

    if (contenido === "-explicacionduelo") {

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle("🎲 ¿Cómo funciona el sistema de duelos?")
        .setDescription(
            "El sistema utiliza el generador aleatorio interno de JavaScript (`Math.random()`).\n\n" +

            "Por cada duelo:\n\n" +

            "1️⃣ Se cuentan todos los participantes.\n" +
            "2️⃣ Se genera un número aleatorio.\n" +
            "3️⃣ Se elige al participante correspondiente a ese número.\n\n" +

            "Ejemplo:\n" +
            "• Alma → 0\n" +
            "• Tao → 1\n" +
            "• Freyja → 2\n" +
            "• Goku → 3\n\n" +

            "Cada participante tiene exactamente las mismas probabilidades de ganar.\n\n" +

            "La posición en la lista NO influye en el resultado.\n" +
            "No existen favoritos, pesos ocultos ni ventajas para las primeras opciones."
        )
        .addFields({
            name: "📊 Importante",
            value:
                "Que alguien pierda muchas veces seguidas no significa que el sistema esté trucado.\n\n" +
                "La mala suerte también existe. 😈"
        })
        .setFooter({
            text: "⚠️ 'NekoChoose me odia' no constituye evidencia científica."
        })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
    }

    if (contenido.startsWith("-torneo")) {
        const texto = contenido.replace("-torneo", "").trim();
        return comandoTorneo(message, texto);
    }

    if (contenido.startsWith("-brackets")) {
        const texto = contenido.replace("-brackets", "").trim();
        return comandoBrackets(message, texto);
    }

    if (contenido === "-dado" || contenido === "-d20" || contenido === "-d100" || contenido === "-d6") {
        let caras = 20;

        if (contenido === "-d6") caras = 6;
        if (contenido === "-d20") caras = 20;
        if (contenido === "-d100") caras = 100;

        const resultado = Math.floor(Math.random() * caras) + 1;

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`🎲 Dado de ${caras}`)
            .setDescription(`# Resultado: ${resultado}`)
            .setFooter({ text: "Sistema de Dados" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (contenido.startsWith("-multi")) {
    const args = contenido.replace("-multi", "").trim().split(/\s+/);

    if (args.length < 2) {
        const embed = crearEmbedError(
            "❌ Faltan datos",
            "Ejemplo:\n`-multi 51000000 50`"
        );

        return message.reply({ embeds: [embed] });
    }

    const base = Number(args[0]);
    const multiplicador = Number(args[1]);

    if (isNaN(base) || isNaN(multiplicador)) {
        const embed = crearEmbedError(
            "❌ Datos inválidos",
            "Debes usar números.\n\nEjemplo:\n`-multi 51000000 50`"
        );

        return message.reply({ embeds: [embed] });
    }

    const resultado = base * multiplicador;

    const embed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle("🔥 Multiplicador")
        .addFields(
            {
                name: "Poder base",
                value: formatearNumero(base),
                inline: true
            },
            {
                name: "Multiplicador",
                value: `x${multiplicador}`,
                inline: true
            },
            {
                name: "Resultado",
                value: `# ${formatearNumero(resultado)}`
            }
        )
        .setFooter({ text: "Calculadora de Poder" })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
}

    if (contenido.startsWith("-calc")) {
    const expresion = contenido.replace("-calc", "").trim();

    if (!expresion) {
        const embed = crearEmbedError(
            "❌ Falta la operación",
            "Ejemplo:\n`-calc 1500 * 2 + 300`"
        );

        return message.reply({ embeds: [embed] });
    }

    // Solo permitir números, espacios y operadores básicos
    if (!/^[0-9+\-*/().%\s]+$/.test(expresion)) {
        const embed = crearEmbedError(
            "❌ Operación inválida",
            "Solo se permiten números y operadores matemáticos."
        );

        return message.reply({ embeds: [embed] });
    }

    try {
        let operacion = expresion;

        // Convierte porcentajes:
        // 30% -> (30/100)
        operacion = operacion.replace(
            /(\d+(\.\d+)?)%/g,
            "($1/100)"
        );

        const resultado = Function(
            `"use strict"; return (${operacion})`
        )();

        const embed = new EmbedBuilder()
            .setColor(0x16A085)
            .setTitle("🧮 Calculadora")
            .addFields(
                {
                    name: "Operación",
                    value: `\`${expresion}\``
                },
                {
                    name: "Resultado",
                    value: `# ${resultado}`
                }
            )
            .setFooter({ text: "Calculadora Web-Rol" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });

    } catch {
        const embed = crearEmbedError(
            "❌ Error matemático",
            "No he podido resolver esa operación."
        );

        return message.reply({ embeds: [embed] });
    }

    
}
    if (contenido.startsWith("-podercalc")) {

    const texto = contenido.replace("-podercalc", "").trim();

    const match = texto.match(/(.+?)\s*([\*\/\+\-])\s*(\d+(?:\.\d+)?)/);

    if (!match) {
        const embed = crearEmbedError(
            "❌ Formato incorrecto",
            "Ejemplo:\n`-podercalc Freyja Kane * 100`"
        );

        return message.reply({ embeds: [embed] });
    }

    const nombrePersonaje = match[1].trim();
    const operador = match[2];
    const valor = Number(match[3]);

    const personajes = extraerPersonajesPoder();

    if (!personajes || personajes.length === 0) {
        const embed = crearEmbedError(
            "❌ No he podido leer poder.html",
            "Comprueba que exista y que contenga `const characters = [...]`"
        );

        return message.reply({ embeds: [embed] });
    }

    const personaje = personajes.find(p =>
        p.name.toLowerCase() === nombrePersonaje.toLowerCase()
    );

    if (!personaje) {
        const embed = crearEmbedError(
            "❌ Personaje no encontrado",
            `No he encontrado a **${nombrePersonaje}** en poder.html`
        );

        return message.reply({ embeds: [embed] });
    }

    const base = Number(personaje.strength);

    let resultado = base;

    switch (operador) {
        case "*":
            resultado = base * valor;
            break;
        case "/":
            resultado = base / valor;
            break;
        case "+":
            resultado = base + valor;
            break;
        case "-":
            resultado = base - valor;
            break;
    }

    const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle("🔥 Calculadora de Poder")
        .addFields(
            {
                name: "Personaje",
                value: personaje.name,
                inline: true
            },
            {
                name: "Poder base",
                value: formatearNumero(base),
                inline: true
            },
            {
                name: "Operación",
                value: `${operador} ${valor}`,
                inline: true
            },
            {
                name: "Resultado",
                value: `# ${formatearNumero(resultado)}`
            }
        )
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
}

if (contenido.startsWith("-poder")) {

    const nombreBuscado = contenido.replace("-poder", "").trim();

    if (!nombreBuscado) {
        const embed = crearEmbedError(
            "❌ Falta el nombre",
            "Ejemplo:\n`-poder Freyja Kane`"
        );

        return message.reply({ embeds: [embed] });
    }

    const personajes = extraerPersonajesPoder();

    if (!personajes || personajes.length === 0) {
        const embed = crearEmbedError(
            "❌ No he podido leer poder.html",
            "Comprueba que exista y que contenga `const characters = [...]`"
        );

        return message.reply({ embeds: [embed] });
    }

    const personaje = personajes.find(p =>
        p.name.toLowerCase().includes(nombreBuscado.toLowerCase())
    );

    if (!personaje) {
        const embed = crearEmbedError(
            "❌ Personaje no encontrado",
            `No he encontrado a **${nombreBuscado}** en poder.html`
        );

        return message.reply({ embeds: [embed] });
    }

    let descripcion =
        `🔥 **Poder Base**\n` +
        `# ${formatearNumero(personaje.strength)}`;

    if (personaje.transformations && personaje.transformations.length > 0) {
        descripcion += "\n\n⚡ **Transformaciones**\n";

        personaje.transformations.forEach(t => {
            descripcion +=
                `• **${t.name}** → ${formatearNumero(t.strength)}\n`;
        });
    }

    const embed = new EmbedBuilder()
        .setColor(0xF39C12)
        .setTitle(`🔥 ${personaje.name}`)
        .setDescription(descripcion)
        .setTimestamp();

    // if (personaje.photo) {
    // embed.setThumbnail(personaje.photo);
    // }

    return message.channel.send({ embeds: [embed] });
}

if (contenido === "-tit") {
    return message.channel.send(
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQttWT0cD9kg6S83c4_qsZvTdPaoZDd-Emoqw&s"
    );
}

    if (contenido.startsWith("-equipos")) {
        const texto = contenido.replace("-equipos", "").trim();
        return comandoEquipos(message, texto);
    }

    if (message.content === '-chatot') {
    await chatotWebhook.send({
        content: 'La verdad que sí'
    });
}

    if (contenido === "-reroll") {
        if (!ultimoComandoRepetible) {
            const embed = crearEmbedError(
                "❌ No hay nada que repetir",
                "Primero usa `-duelo`, `-torneo`, `-brackets` o `-equipos`."
            );

            return message.reply({ embeds: [embed] });
        }

        if (ultimoComandoRepetible.tipo === "duelo") {
            return comandoDuelo(message, ultimoComandoRepetible.texto, false);
        }

        if (ultimoComandoRepetible.tipo === "torneo") {
            return comandoTorneo(message, ultimoComandoRepetible.texto, false);
        }

        if (ultimoComandoRepetible.tipo === "brackets") {
            return comandoBrackets(message, ultimoComandoRepetible.texto, false);
        }

        if (ultimoComandoRepetible.tipo === "equipos") {
            return comandoEquipos(message, ultimoComandoRepetible.texto, false);
        }
    }

    if (contenido.startsWith("-cumples")) {
        const eventos = extraerEventosCalendario();

        if (!eventos) {
            const embed = crearEmbedError(
                "❌ No encuentro calendario.html",
                "Comprueba que `calendario.html` esté en la carpeta correcta."
            );

            return message.reply({ embeds: [embed] });
        }

        const args = contenido.replace("-cumples", "").trim().toLowerCase();

        let fecha = new Date();

        if (args === "mañana" || args === "manana") {
            fecha.setDate(fecha.getDate() + 1);
        } else if (args && args !== "hoy") {
            const matchFecha = args.match(/^(\d{1,2})[\/-](\d{1,2})$/);

            if (!matchFecha) {
                const embed = crearEmbedError(
                    "❌ Fecha no válida",
                    "Usa uno de estos formatos:\n\n`-cumples`\n`-cumples mañana`\n`-cumples 24/12`"
                );

                return message.reply({ embeds: [embed] });
            }

            fecha = new Date();
            fecha.setDate(Number(matchFecha[1]));
            fecha.setMonth(Number(matchFecha[2]) - 1);
        }

        const dia = fecha.getDate();
        const mes = fecha.getMonth() + 1;

        const eventosDelDia = eventos.filter(e => e.dia === dia && e.mes === mes);
        const birthdays = eventosDelDia.filter(e => e.tipo === "birthday").map(e => e.nombre);
        const anniversaries = eventosDelDia.filter(e => e.tipo === "anniversary").map(e => e.nombre);

        if (birthdays.length === 0 && anniversaries.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0x95A5A6)
                .setTitle(`📅 Eventos del ${dia}/${mes}`)
                .setDescription("No hay eventos registrados para esta fecha.")
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle(`📅 Eventos del ${dia}/${mes}`)
            .setTimestamp();

        if (birthdays.length > 0) {
            embed.addFields({
                name: "🎂 Cumpleaños",
                value: birthdays.map(n => `🎉 ${n}`).join("\n")
            });
        }

        if (anniversaries.length > 0) {
            embed.addFields({
                name: "💍 Aniversarios",
                value: anniversaries.map(n => `❤️ ${n}`).join("\n")
            });
        }

        return message.channel.send({ embeds: [embed] });
    }

    if (contenido === "-proximoscumples") {
        const eventos = extraerEventosCalendario();

        if (!eventos) {
            const embed = crearEmbedError(
                "❌ No encuentro calendario.html",
                "Comprueba que `calendario.html` esté en la carpeta correcta."
            );

            return message.reply({ embeds: [embed] });
        }

        const proximos = eventos
            .map(e => ({
                ...e,
                dias: diasHastaEvento(e.dia, e.mes)
            }))
            .sort((a, b) => a.dias - b.dias)
            .slice(0, 10);

        const descripcion = proximos.map(e => {
            const icono = e.tipo === "birthday" ? "🎂" : "💍";
            const dia = String(e.dia).padStart(2, "0");
            const mes = String(e.mes).padStart(2, "0");

            return `${icono} **${dia}/${mes}** - ${e.nombre}`;
        }).join("\n");

        const embed = new EmbedBuilder()
            .setColor(0xFFB6C1)
            .setTitle("🎂 Próximos eventos")
            .setDescription(descripcion || "No hay eventos registrados.")
            .setFooter({ text: "Calendario Web-Rol" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (contenido === "-nacimientos") {
        const embed = new EmbedBuilder()
            .setColor(0x87CEEB)
            .setTitle("👶 Nacimientos registrados")
            .setDescription(
                "🚧 Este sistema todavía está en construcción.\n\n" +
                "Próximamente leerá automáticamente los nacimientos registrados en la web."
            )
            .setFooter({ text: "Sistema de Nacimientos" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (contenido === "-embarazos") {
        const embarazos = extraerEmbarazos();

        if (embarazos === null) {
            const embed = crearEmbedError(
                "❌ No encuentro embarazos.html",
                "Comprueba que `embarazos.html` esté en la carpeta correcta."
            );

            return message.reply({ embeds: [embed] });
        }

        if (embarazos.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0x95A5A6)
                .setTitle("🤰 Embarazos activos")
                .setDescription("No hay embarazos activos registrados.")
                .setFooter({ text: "Sistema de Embarazos" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        const embarazosOrdenados = embarazos
    .filter(item => item.parto)
    .sort((a, b) => new Date(a.parto) - new Date(b.parto));

const descripcion = embarazosOrdenados
    .map(item => {
        const progreso = calcularProgreso(item.anuncio, item.parto);

        return `• **${item.pareja}**
  📅 Anuncio: ${item.anuncio}
  🍼 Parto: ${item.parto}
  ⏳ Faltan: **${progreso.diasRestantes} días**
  ${progreso.barra} **${progreso.porcentaje}%**`;
    })
    .join("\n\n");

        const embed = new EmbedBuilder()
            .setColor(0xE84393)
            .setTitle("🤰 Embarazos activos")
            .setDescription(limitarTexto(descripcion))
            .setFooter({ text: "Sistema de Embarazos" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (contenido.startsWith("-personaje")) {
        const nombre = contenido.replace("-personaje", "").trim();

        if (!nombre) {
            const embed = crearEmbedError(
                "❌ Falta el nombre",
                "Ejemplo:\n`-personaje Freyja`"
            );

            return message.reply({ embeds: [embed] });
        }

        if (!fs.existsSync(RUTA_PERSONAJES)) {
            const embed = new EmbedBuilder()
                .setColor(0x95A5A6)
                .setTitle("📚 Sistema de personajes")
                .setDescription(
                    "Todavía no existe `personajes.json`.\n" +
                    "Este comando aún no ha sido configurado."
                )
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        const personaje = buscarPersonaje(nombre);

        if (!personaje) {
            const embed = crearEmbedError(
                "❌ Personaje no encontrado",
                "No lo he encontrado en `personajes.json`."
            );

            return message.reply({ embeds: [embed] });
        }

        const nombrePersonaje = personaje.nombre || personaje.name || nombre;
        const raza = personaje.raza || personaje.race || "No especificada";
        const estado = personaje.estado || personaje.status || "No especificado";
        const universo = personaje.universo || personaje.universe || "No especificado";
        const grupo = personaje.grupo || "Ninguno";
        const edad = personaje.edad || "Desconocida";
        const sexo = personaje.sexo || "Desconocido";
        const imagen = personaje.imagen || null;
        const descripcion = personaje.descripcion || personaje.description || "Sin descripción.";

        const embed = new EmbedBuilder()
            .setColor(0x8E44AD)
            .setTitle(`📖 ${nombrePersonaje}`)
            .addFields(
                {
                    name: "Raza",
                    value: String(raza),
                    inline: true
                },
                {
                    name: "Estado",
                    value: String(estado),
                    inline: true
                },
                {
                    name: "Universo",
                    value: String(universo),
                    inline: true
                },
                {
                    name: "Edad",
                    value: String(edad),
                    inline: true
                },
                {
                    name: "Sexo",
                    value: String(sexo),
                    inline: true
                },
                {
                    name: "Grupo",
                    value: String(grupo),
                    inline: true
                },
                {
                    name: "Descripción",
                    value: limitarTexto(String(descripcion), 900)
                }
            )
            .setFooter({ text: "Base de personajes" })
            .setTimestamp();
            if (imagen) {
                embed.setThumbnail(imagen);
}
        return message.channel.send({ embeds: [embed] });
    }

    if (contenido === "-ultimocambio") {
        try {
            const repoPath = path.join(__dirname, "..");

            const mensaje = execSync("git log -1 --pretty=%s", { cwd: repoPath }).toString().trim();
            const autor = execSync("git log -1 --pretty=%an", { cwd: repoPath }).toString().trim();
            const fecha = execSync("git log -1 --pretty=%cd --date=short", { cwd: repoPath }).toString().trim();
            const hash = execSync("git log -1 --pretty=%h", { cwd: repoPath }).toString().trim();

            const embed = new EmbedBuilder()
                .setColor(0x34495E)
                .setTitle("📜 Última actualización")
                .setDescription(`**${mensaje}**`)
                .addFields(
                    {
                        name: "Autor",
                        value: autor || "Desconocido",
                        inline: true
                    },
                    {
                        name: "Fecha",
                        value: fecha || "Desconocida",
                        inline: true
                    },
                    {
                        name: "Commit",
                        value: hash || "Desconocido",
                        inline: true
                    }
                )
                .setFooter({ text: "GitHub / Web-Rol" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        } catch (error) {
            const embed = crearEmbedError(
                "❌ No puedo leer el último cambio",
                "Asegúrate de que el bot está dentro de una carpeta con Git y que el repositorio tiene commits."
            );

            return message.reply({ embeds: [embed] });
        }
    }
});

client.login(process.env.TOKEN);