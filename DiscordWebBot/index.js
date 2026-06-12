require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    const canal = await client.channels.fetch("1514802130647515285");

    canal.send("🤖 Me cago en todos vuestros muertos.");
});

client.login(process.env.TOKEN);