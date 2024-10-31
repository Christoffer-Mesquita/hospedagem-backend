const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ] 
});

client.on('ready', () => {
  console.log(`Bot está online como ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN); 