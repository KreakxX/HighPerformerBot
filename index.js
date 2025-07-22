// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

let TimeSessions = {

}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction =>{
    if(!interaction.isButton() && !interaction.isModalSubmit()) return;
      if(interaction.customId == "highperformer_modal" ){
        const modal = new ModalBuilder()
        .setCustomId("highperformer_response")
        .setTitle("Action")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
            .setCustomId("focus_input")
            .setLabel("Was highperformst du ?")
            .setStyle(TextInputStyle.Short)
          )
        );
        await interaction.showModal(modal);
      }
       if (interaction.isModalSubmit() && interaction.customId === 'highperformer_response') {
    const response = interaction.fields.getTextInputValue('focus_input');
    const username = interaction.user.username;
    TimeSessions[username] = {
    timeLeft: TimeSessions[username].timeLeft,
    timeJoined: TimeSessions[username].timeJoined,
    highperforming: response
    }
        await interaction.reply({ content: "Response saved!", ephemeral: true });

  }
    });

client.on('voiceStateUpdate', (oldState, newState) => {
  const user = newState.member.user;
  const guild = newState.guild;
  const logChannel = guild.channels.cache.find(
    channel => channel.name === 'highperformertime' && channel.isTextBased()
  );


  // when joining the highperformer call start the Timer
if ((!oldState.channel || oldState.channel.name !== "highperformer") 
      && newState.channel && newState.channel.name === "highperformer") {
      let currentTime = new Date();
    startTimer(user.username,currentTime)
      
    // sending a Button 
    user.send({
      content: "Was highperformst du ?",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
          .setCustomId("highperformer_modal")
          .setLabel("Answer")
          .setStyle(ButtonStyle.Primary)
        )
      ]
    })    
  }

  // when leaving the highperformer call stop the timer
  if (oldState.channel && oldState.channel.name === "highperformer" 
      && (!newState.channel || newState.channel.name !== "highperformer")) {
    let currentTime = new Date();
    const time = stopTimer(user.username, currentTime)
    const timeSession = TimeSessions[user.username];
    const highperforming = timeSession.highperforming || "Keine Angabe"
    const embed = new EmbedBuilder()
    .setColor("#0099ff").setTitle(`${user.username}'s HighPerformer statistics from last Session`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {name: "Highperforming", value: highperforming},
      {name: "Joined Call:", value: timeSession.timeJoined.toLocaleString("de-DE", {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})},
      {name: "Left Call:", value: timeSession.timeLeft.toLocaleString("de-DE", {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})},
      {name: "Total Time in Session:", value: `**${time}**`}
    )
    
  logChannel.send({ embeds: [embed] });
    
  }
});
client.login(process.env.DISCORD_TOKEN);

function startTimer(username, currenTime){
  TimeSessions[username]= {
    timeJoined: currenTime
  }
}

function stopTimer(username, currentTime){
  TimeSessions[username]= {
    timeLeft: currentTime,
    timeJoined: TimeSessions[username].timeJoined,
    highperforming: TimeSessions[username].highperforming
  }

  const dateJoined = TimeSessions[username].timeJoined;
  const dateLeft = TimeSessions[username].timeLeft;

  const diffMs = dateLeft - dateJoined;

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const hours = Math.floor(totalSeconds / 3600);
  const seconds = totalSeconds % 60;

  let durationStr = '';
  if (hours > 0) durationStr += `${hours} hour${hours > 1 ? 's' : ''} `;
  if (minutes > 0) durationStr += `${minutes} minute${minutes > 1 ? 's' : ''} `;
  if (hours === 0 && minutes === 0) durationStr += `${seconds} second${seconds !== 1 ? 's' : ''}`;
  return durationStr.trim();
}



// Button asking Field in Chat for everyone client sided so we can check if they are still highperforming
// Noch Angabe was man highperformed am Anfang wenn man Joined oder das man irgendwie approven muss
// nur wer highperformer rolle hat dann wird gesendet also Rolle bekommen und checken
// gucken auch ob bei changen es gecallt wird also wenn man call schriebt muss auch gesendet werden  // also das auch noch checken