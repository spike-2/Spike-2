/**
 * @author Joshua Maxwell
 * This file contains common server commands and trasfers control
 */

const Discord = require('discord.js');
const spikeKit = require("./spikeKit.js");

const plugins = [
  require("./plugins/core/main.js"),
  require("./plugins/gamble/main.js"),
  require("./plugins/shop/main.js"),
  require("./plugins/enigma/main.js"),
  require("./plugins/spike-lisp/main.js")
];

/**
 * Creates an embed
 * @param {Message} msg the message sent by the user
 * @param {String} title title for the embed
 * @param {String} content description for the embed
 */
//FIXME Remove after modularization complete
const basicEmbed = (msg, title, content) => {
  const embed = new Discord.MessageEmbed()
    .setColor(0xcc00ff)
    .setTitle(title)
    .setDescription('```yaml\n' + content + '\n```')
    .setFooter(msg.author.username, msg.author.avatarURL());
  msg.channel.send(embed);
}

/**
 * This will get help for a given command and arguments
 * @param {string} args The arguments of the help command
 * @param {Message} message the message sent by the user
 * @param {string} PREFIX the bot's current prefix
 */
const help = (args, message, PREFIX) => {
  console.log("Looking for help...");
  if (!args) {
    // Default Help Screen
    console.log("Getting default help");
    let messageText = `Use '${PREFIX}help [c]' or '${PREFIX}man [c]' to find more information about these commands.`;
    for (const plugin of plugins){
      messageText += `\n-------\n${plugin.NAME}\nby ${plugin.AUTHOR}\n\n${plugin.shortHelp(PREFIX)}`;
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
        break;
      }
    }
  }
}

/**
 * This will select an action depending on the command given
 * @param {Message} message the message sent by the user
 * @param {string} PREFIX the bot's current prefix
 */
const execute = (message, bot, PREFIX) => {
  const command = message.content.split(/\s/)[0].toLowerCase().slice(1);
  const args = message.content.substring(message.content.split(/\s/)[0].length).slice(1);
  if (command === "help" || command === "man"){
    help(args, message, PREFIX);
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
  }
}

module.exports = { execute, basicEmbed }