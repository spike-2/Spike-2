/**
 * @author Joshua Maxwell
 * This file contains common server commands and trasfers control
 */

const Discord = require("discord.js");
const spikeKit = require("./spikeKit.js");

const plugins = [
  require("./plugins/core/main.js"),
  require("./plugins/gamble/main.js"),
  require("./plugins/betting/main.js"),
  require("./plugins/shop/main.js"),
  require("./plugins/enigma/main.js"),
  require("./plugins/challenges/main.js"),
];

/**
 * Runs startup functions for all plugins.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function onBotStart(bot) {
  for (const plugin of plugins) {
    if (plugin.onBotStart) {
      plugin.onBotStart(bot);
    }
  }
}

/**
 * This will get help for a given command and arguments
 * @param {string} args The arguments of the help command
 * @param {Message} message the message sent by the user
 * @param {string} PREFIX the bot's current prefix
 */
const help = (args, message, PREFIX) => {
  spikeKit.logger.log("debug", "Looking for help...");
  if (!args) {
    // Default Help Screen
    spikeKit.logger.log("debug", "Getting default help");
    let messageText = `Use the given help commands to learn more about each plugin and its commands.\nUse \`${PREFIX}help <command>\` to jump to info on that command.`;
    for (const plugin of plugins) {
      messageText += `\n-------\n"${plugin.NAME}" by ${plugin.AUTHOR}\n\`${PREFIX}help plugin ${plugin.SLUG}\``;
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
    const helpCommand = args.split(" ")[0].toLowerCase();
    const helpArgs = args.substring(args.split(" ")[0].length).slice(1);
    for (const plugin of plugins) {
      if (helpCommand === "plugin" && helpArgs == plugin.SLUG) {
        spikeKit.logger.log(
          "debug",
          `Getting plugin help for "${plugin.NAME}"`
        );
        spikeKit.reply(
          spikeKit.createEmbed(
            `${plugin.NAME} Help`,
            `${plugin.NAME}\nby ${
              plugin.AUTHOR
            }\nUse \`${PREFIX}help <command>\` for info on that command.\n\n${plugin.shortHelp(
              PREFIX
            )}`,
            true,
            message.author.username,
            message.author.avatarURL()
          ),
          message
        );
        break;
      } else if (plugin.COMMANDS.includes(helpCommand)) {
        spikeKit.logger.log(
          "debug",
          `Getting help for ${PREFIX}${helpCommand} from "${plugin.NAME}"`
        );
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
};

/**
 * This will select an action depending on the command given
 * @param {Message} message the message sent by the user
 * @param {string} PREFIX the bot's current prefix
 */
const execute = (message, bot, PREFIX) => {
  const command = message.content.split(/\s/)[0].toLowerCase().slice(1);
  const args = message.content
    .substring(message.content.split(/\s/)[0].length)
    .slice(1);
  if (command === "help" || command === "man") {
    help(args, message, PREFIX);
  } else {
    // Not a help command, so find the right plugin for the command
    let found = false;
    for (const plugin of plugins) {
      if (plugin.COMMANDS.includes(command)) {
        spikeKit.logger.log(
          "debug",
          `Running ${PREFIX}${command} from "${plugin.NAME}"`
        );
        plugin.processCommand(command, args, bot, message);
        found = true;
        break;
      }
    }
  }
};

/**
 *
 * @param {Discord.Messageeaction} reaction Message Reaction object for the reaction added/removed.
 * @param {Discord.User} user User who applied reaction/User whose reaction was removed.
 * @param {boolean} add True if reaction added, False if removed.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function onReaction(reaction, user, add, bot) {
  for (embed of reaction.message.embeds) {
    let found = false;
    for (plugin of plugins) {
      if (found) {
        continue;
      }
      if (
        plugin.processReaction &&
        embed.title.toLowerCase().startsWith(`${plugin.NAME.toLowerCase()}: `)
      ) {
        // prettier-ignore
        spikeKit.logger.log("debug", `Processing Reaction ${add ? "Add" : "Remove"} from "${plugin.NAME}"`);
        plugin.processReaction(reaction, user, add, bot);
        found = true;
      }
    }
  }
}

module.exports = { execute, onBotStart, onReaction };
