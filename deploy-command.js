const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!')
].map(cmd => cmd.toJSON());


bot_token = process.env.DISCORD_TOKEN
clientId = process.env.CLIENT_ID

const rest = new REST({version: "10"}).setToken(bot_token);

(async () => {
  try {
    console.log('🔁 Refreshing slash commands...');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('✅ Slash commands registered.');
  } catch (error) {
    console.error(error);
  }
})();