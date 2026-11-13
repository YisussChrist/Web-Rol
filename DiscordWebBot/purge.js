const { PermissionFlagsBits } = require("discord.js");

async function comandoPurge(message, argumentos = "") {
    const responder = content => message.reply({
        content,
        allowedMentions: { parse: [], repliedUser: false }
    });

    if (!message.inGuild()) {
        return responder("Este comando solo se puede usar en un servidor.");
    }

    const filtro = argumentos.match(/^all\s+(\S[\s\S]*)$/i)?.[1].trim();
    if (!filtro) {
        return responder("Uso: `-purge all <texto>`. Ejemplo: `-purge all ///`. Revisa los 50 mensajes anteriores al comando.");
    }

    if (!message.member?.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) {
        return responder("Necesitas el permiso Gestionar mensajes en este canal.");
    }

    const permisosBot = message.channel.permissionsFor(message.client.user);
    if (!permisosBot?.has([
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages
    ])) {
        return responder("Necesito los permisos Ver canal, Leer el historial de mensajes y Gestionar mensajes en este canal.");
    }

    let mensajes;
    try {
        mensajes = await message.channel.messages.fetch({ limit: 50, before: message.id });
    } catch (error) {
        console.error("No se pudo leer el historial para purge:", error);
        return responder("No he podido leer los últimos 50 mensajes. Comprueba mis permisos e inténtalo de nuevo.");
    }

    const coincidencias = mensajes.filter(m => m.content.includes(filtro));
    if (!coincidencias.size) {
        return responder(`No hay coincidencias entre los ${mensajes.size} mensajes revisados.`);
    }

    let borrados = 0;
    let fallidos = 0;
    // Borrado individual: también permite limpiar mensajes antiguos.
    // Las peticiones se esperan en orden; discord.js gestiona los límites de la API.
    for (const candidato of coincidencias.values()) {
        try {
            await candidato.delete();
            borrados++;
        } catch (error) {
            fallidos++;
            console.error(`No se pudo borrar el mensaje ${candidato.id}:`, error);
        }
    }

    return responder(
        `He borrado ${borrados} mensajes de los ${mensajes.size} revisados.` +
        (fallidos ? ` No he podido borrar ${fallidos} coincidencias.` : "")
    );
}

module.exports = { comandoPurge };
