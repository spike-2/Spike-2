/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * This file will start the bot, send commands to the command handlers
 * and it will add Spike Bucks to users whenever they send a message
 */

// dependencies
require('dotenv').config();
const {Client} = require('discord.js');
const {execute, basicEmbed} = require('./commands.js');
const {readIn, addBucks, getConsts} = require('./faccess.js');
const { verify } = require('./verify.js');
const cron = require('./botCron.js');
const spikeKit = require("./spikeKit.js");

const plugins = [
  require("./plugins/core/main.js"),
  require("./plugins/enigma/main.js"),
  require("./plugins/spike-lisp/main.js")
];

const PREFIX = '$';

// starting the bot
const bot = new Client();
bot.on('ready', () => { // when loaded (ready event)
  console.log(`${bot.user.username} is ready...`);
  // Starts the bot cron jobs
  cron.startJobs(bot);
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
    const command = message.content.split(/\s/)[0].toLowerCase().slice(1);
    const args = message.content.substring(message.content.split(/\s/)[0].length).slice(1);

    if (command === "help" || command === "man"){
      console.log("Looking for help...");
      console.log(args);
      if (!args) {
        // Default Help Screen
        let messageText = getConsts().help.main;
        for (const plugin of plugins){
          messageText += `\n-------\n${plugin.NAME}\n${plugin.shortHelp(PREFIX)}`;
        }
        spikeKit.reply(
          spikeKit.createEmbed(
            "Help",
            messageText,
            true,
            message.author.username,
            message.author.avatarURL()
          ),
          message
        );
      } else {
        // Not default, so find the right plugin to get help from
        let foundhelp = false;
        for (const plugin of plugins) {
          const helpCommand = args.split(' ')[0].toLowerCase();
          const helpArgs = args.substring(args.split(' ')[0].length).slice(1);
          console.log(`${helpCommand} : ${helpArgs}`);
          if (plugin.COMMANDS.includes(helpCommand)){
            console.log(`Getting help for ${PREFIX}${helpCommand} from "${plugin.NAME}"`);
            spikeKit.reply(
              spikeKit.createEmbed(
                `${plugin.NAME} Help`,
                plugin.help(PREFIX, helpCommand, helpArgs), // helptext
                true,
                message.author.username,
                message.author.avatarURL()
              ),
              message
            );
            foundhelp = true;
            break;
          }
        }
        // Fallback. Will eventually become just another plugin
        if(!foundhelp){execute(message);}
      }
    } else {
      // Not a help command, so find the right plugin for the command
      let found = false;
      for (const plugin of plugins) {
        if (plugin.COMMANDS.includes(command)){
          console.log(`Running ${PREFIX}${command} from "${plugin.NAME}"`);
          plugin.processCommand(command, args, bot, message);
          found = true;
          break;
        }
      }
      // Fallback. Will eventually become just another plugin
      if(!found){execute(message);}
    }
  }

  // if a user sends a message
  if (!message.author.bot)
    addBucks(message.author, 1); 
});

// loads in data
console.log(readIn());

// brings the bot online
bot.login(process.env.DISJS_BOT_TOKEN);
