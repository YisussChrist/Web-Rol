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

const RUTA_CALENDARIO = path.join(__dirname, "..", "calendario.html");
const RUTA_EMBARAZOS = path.join(__dirname, "..", "embarazos.html");
const RUTA_PERSONAJES = path.join(__dirname, "..", "personajes.json");

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

function extraerEmbarazos() {
    if (!fs.existsSync(RUTA_EMBARAZOS)) return null;

    const html = fs.readFileSync(RUTA_EMBARAZOS, "utf8");

    const matchArray = html.match(/const\s+embarazos\s*=\s*\[([\s\S]*?)\];/);

    if (!matchArray) return [];

    const bloque = matchArray[1];

    const regex = /\{\s*pareja:\s*"([^"]+)"\s*,\s*anuncio:\s*"([^"]+)"\s*\}/g;

    const embarazos = [];
    let match;

    while ((match = regex.exec(bloque)) !== null) {
        embarazos.push({
            pareja: match[1],
            anuncio: match[2]
        });
    }

    return embarazos;
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
                        "Tira dados concretos."
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
                    name: "📚 Personajes",
                    value:
                        "`-personaje Freyja`\n" +
                        "Busca un personaje en `personajes.json`."
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

    if (contenido.startsWith("-duelo")) {
        const texto = contenido.replace("-duelo", "").trim();
        return comandoDuelo(message, texto);
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

    if (contenido.startsWith("-equipos")) {
        const texto = contenido.replace("-equipos", "").trim();
        return comandoEquipos(message, texto);
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

        const descripcion = embarazos
            .map(item => `• **${item.pareja}**\n  📅 Anuncio: ${item.anuncio}`)
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
                    name: "Descripción",
                    value: limitarTexto(String(descripcion), 900)
                }
            )
            .setFooter({ text: "Base de personajes" })
            .setTimestamp();

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