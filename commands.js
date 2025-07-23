const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder().setName('last_session').setDescription('Gives you the Stats of the Last Session!'),
  new SlashCommandBuilder().setName('leaderboard').setDescription('Gives you the leaderboard with the best highperformers!'),
  new SlashCommandBuilder().setName('dailyhighperforming').setDescription('Gives you the amount of time, you highperformed today!'),
  new SlashCommandBuilder().setName('monthlyhighperforming').setDescription('Gives you the amount of time, you highperformed this month!')


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