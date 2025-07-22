// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

TimeSessions = {

}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const user = newState.member.user;
  const guild = newState.guild;
  const logChannel = guild.channels.cache.find(
    channel => channel.name === 'highperformertime' && channel.isTextBased()
  );

  if (!oldState.channel && newState.channel) {
    logChannel.send(`${user.username} has joined the HighPerformer Call`)
    let currentTime = new Date();
    startTimer(user.username,currentTime)
  }

  if (oldState.channel && !newState.channel) {
    logChannel.send(`${user.username} is now a lowPerformer because he left the HighPerformer Call`)
    let currentTime = new Date();
    const time = stopTimer(user.username, currentTime)
    logChannel.send(`${user.username} highperformed for:  ${time}`)
    console.log(time)
  }
});
console.log("Test")
client.login(process.env.DISCORD_TOKEN);



function startTimer(username, currenTime){
  TimeSessions[username]= {
    timeJoined: currenTime
  }
}

function stopTimer(username, currentTime){
  TimeSessions[username]= {
    timeLeft: currentTime,
    timeJoined: TimeSessions[username].timeJoined
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