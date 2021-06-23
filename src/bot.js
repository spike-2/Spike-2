/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * This file will start the bot, send commands to the command handlers
 * and it will add Spike Bucks to users whenever they send a message
 */

// dependencies
require('dotenv').config();
const {Client} = require('discord.js');
const {execute} = require('./commands.js');
const {readIn, addBucks, getConsts} = require('./faccess.js');
const { verify } = require('./verify.js');
const cron = require('./botCron.js');
const slashCommands = require("./slashCommands.js");


const PREFIX = '$';

// starting the bot
const bot = new Client();



bot.on('ready', async () => { // when loaded (ready event)
  console.log(`${bot.user.username} is ready...`);
  // Starts the bot cron jobs
  cron.startJobs(bot);

  slashCommands.setBot(bot);

  // Uncomment below to delete all commands
  // const commands = await slashCommands.getCommands();
  // for (command of commands){
    // await slashCommands.deleteCommand(command.id);
  // }

  // Uncomment below to add new or update existing commands
  // slashCommands.addAllCommands();


  bot.ws.on("INTERACTION_CREATE", async(interaction) => {
    slashCommands.handleInteraction(interaction, bot);
  });

});
// on message recieved
bot.on('message', (message) => {
  if (!message.member.roles.cache.has(getConsts().role["verified"])
      && message.channel.id != getConsts().channel.introductions)
  {
    verify(message, bot);
  }
  
  if (message.channel.type === 'dm') {
    //TODO
  }

  // if it is a command
  if (message.content.charAt(0) === PREFIX){
   execute(message, bot, PREFIX);
  }

  // if a user sends a message
  if (!message.author.bot)
    addBucks(message.author, 1); 
});

// loads in data
console.log(readIn());

// brings the bot online
bot.login(process.env.DISJS_BOT_TOKEN);
