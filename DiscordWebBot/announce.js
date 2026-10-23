require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
    const canal = await client.channels.fetch("1514802130647515285");

    const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setAuthor({ name: "Web-Rol · Tu compañero de aventuras" })
        .setTitle("✨ Tu universo de rol sigue creciendo")
        .setDescription("Ya puedes explorar las novedades de Web-Rol.")
        .addFields(
            { name: "📌 En esta actualización", value: "• Nuevas secciones\n• Correcciones visuales\n• Mejoras generales" }
        )
        .setFooter({ text: "Web-Rol · Novedades de la comunidad" })
        .setTimestamp();

    await canal.send({
        content: "📢 <@&1514803118746108004>",
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel("Ver novedades en la web").setEmoji("🌐")
                .setStyle(ButtonStyle.Link).setURL("https://yisusschrist.github.io/Web-Rol/")
        )]
    });

    console.log("✅ Aviso bonito enviado.");
    client.destroy();
});

client.login(process.env.TOKEN);
