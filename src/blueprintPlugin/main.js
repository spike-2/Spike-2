/**
 * A blueprint for a SpikeKit Plugin.
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../spikeKit.js");

/**
 * The display name of the plugin.
 */
const NAME = "The Name";
/**
 * The text that will display on the main help screen.
 */
const DESCRIPTION = "Text that will be on the main help screen";
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
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
function help(command, args) {
  return "How to use the command with given args."
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message){

}

module.exports = {NAME, DESCRIPTION, AUTHOR, COMMANDS, help, processCommand};