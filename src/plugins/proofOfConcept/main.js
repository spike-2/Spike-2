/**
 * A proof of concept for a SpikeKit Plugin.
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../spikeKit.js");

/**
 * The display name of the plugin.
 */
const NAME = "Proof of Concept";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Brandon Ingli";
/**
 * Commands supported by this plugin. Do not include the prefix.
 * Good: command
 * Bad: $command
 */
const COMMANDS = ["proofofconcept"];

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
function help(prefix, command, args) {
  return `${prefix}${command}\nJust a proof of concept.\nArgs: ${args}`
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
function shortHelp(prefix){
  return `${prefix}proofofconcept - Just a proof of concept.`
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message){
  spikeKit.reply(
    spikeKit.createEmbed(
      "Proof of Concept",
      `This is just a Proof of Concept!\nCommand: ${command}\nArgs: ${args}`,
      true,
      message.author.username,
      message.author.avatarURL()
    ),
    message
  )
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};