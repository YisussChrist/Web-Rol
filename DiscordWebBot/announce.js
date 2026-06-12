require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
    const canal = await client.channels.fetch("1514802130647515285");

    const embed = new EmbedBuilder()
        .setTitle("🌐 Nueva actualización de la web")
        .setDescription("Se han subido nuevos cambios a la web del rol.")
        .addFields(
            { name: "📌 Cambios", value: "• Nuevas secciones\n• Correcciones visuales\n• Mejoras generales" },
            { name: "🔗 Enlace", value: "https://yisusschrist.github.io/Web-Rol/" }
        )
        .setFooter({ text: "Web-Rol Updates" })
        .setTimestamp();

    await canal.send({
        content: "📢 <@&1514803118746108004>",
        embeds: [embed]
    });

    console.log("✅ Aviso bonito enviado.");
    client.destroy();
});

client.login(process.env.TOKEN);