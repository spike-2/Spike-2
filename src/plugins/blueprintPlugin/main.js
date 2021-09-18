/**
 * A blueprint for a SpikeKit Plugin.
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../../spikeKit.js");

/**
 * The display name of the plugin.
 */
const NAME = "The Name";
/**
 * Slug used to programmatically refer to the plugin. Lowercase letters, numbers, and dashes only.
 */
const SLUG = "the-name";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Some Person";
/**
 * Commands supported by this plugin. Do not include the prefix.
 * Good: command
 * Bad: $command
 */
const COMMANDS = ["command1", "command2"];

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
function help(prefix, command, args) {
  return "How to use the command with given args.";
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
function shortHelp(prefix) {
  return `${prefix}proofofconcept - Just a proof of concept.`;
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message) {}

/**
 * Handles reactions added/removed to embeds sent by this plugin. To receive anything in this function, plugins must...
 *  + Have this function exported
 *  + Send a message as an embed through Spike (or Simone)
 *  + Have the sent message cached. Either the message was sent during the current running session of the bot, or cached using onBotStart
 *  + The title of the embed starts with `${NAME}: `
 *  + A user other than Spike (or Simone) added or removed the reaction
 * @param {Discord.MessageReaction} reaction Message Reaction object for the reaction added/removed.
 * @param {Discord.User} user User who applied reaction/User whose reaction was removed.
 * @param {boolean} add True if reaction added, False if removed.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function processReaction(reaction, user, add, bot) {
  console.log(
    `${user.username} ${add ? "Added" : "Removed"} a reaction on ${
      reaction.message.author.username
    }'s message: :${reaction.emoji.name}:.`
  );
}

/**
 * Runs when the bot is first started if exported below.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function onBotStart(bot) {
  console.log(`${NAME} has started.`);
}

module.exports = {
  NAME,
  SLUG,
  shortHelp,
  AUTHOR,
  COMMANDS,
  help,
  processCommand,
  // processReaction,
  // onBotStart,
};
