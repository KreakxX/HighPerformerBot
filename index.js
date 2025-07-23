const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');


const Prisma = PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});


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
    const user = Prisma.findUnique(
      {
        where:{
          username: username
        }
      }
    )
    const session = Prisma.session.findFirst({
      where:{
        userId: user.id
      },orderBy: {
        createdAt: 'desc' 
  }
  }) 

  if(session){
    Prisma.session.update({
      where:{
        id: session.id
      },
       data: {
      highperforming: response
    }
    })
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

    // checking if user is in Databse than update else create a new 
    const user = Prisma.user.findUnique({
      where:{
        username: user.username
      }
    })
    // if no User create one
    if(!user){
      Prisma.user.create({
        username: user.username,
        TotalTime: 0,
        TotalTimeLastMonth: 0,
        TOtalTimeToday: 0
      })
    }
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

    // make it for finding the Session and than needing the highperforming and get it 
    // we need to get the last session so we need a created at Field and than sort by it
    
    const Session = Prisma.session.findFirst({
      where:{
        userId: user.id
      },
      orderBy: {
    createdAt: 'desc' 
  }
    })

    const highperforming = Session.highperforming || "Keine Angabe"
    const embed = new EmbedBuilder()
    .setColor("#0099ff").setTitle(`${user.username}'s HighPerformer statistics from last Session`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {name: "Highperforming", value: highperforming},
      {name: "Joined Call:", value: timeSession.joinedTime.toLocaleString("de-DE", {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})},
      {name: "Left Call:", value: timeSession.leftTime.toLocaleString("de-DE", {
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
  // create new Session and add to the User
  const user = Prisma.user.findUnique({
    where: {
      username: username
    }
  })

  Prisma.session.create({
    user: user,
    userId: user.id,
    joinedTime:  currenTime,
    createdAt: currenTime
  })
}

function stopTimer(username, currentTime){
   const user = Prisma.user.findUnique({
    where: {
      username: username
    }
  })
  const session = Prisma.session.findUnique({
    where:{
      userId: user.id
    }
  })

  if(session){
    Prisma.session.update({
      where:{
        id: session.id
      },
       data: {
      leftTime: currentTime,
      highperforming: session.highperforming
    }
    })
  }

  const dateJoined = session.timeJoined;
  const dateLeft = currentTime;

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

