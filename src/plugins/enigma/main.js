/**
 * A plugin that emulates an enigma machine.
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../../spikeKit.js");

const {enigma} = require("./enigma.js");

/**
 * The display name of the plugin.
 */
const NAME = "Enigma Machine";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Brandon Ingli";
/**
 * Commands supported by this plugin. Do not include the prefix.
 * Good: command
 * Bad: $command
 */
const COMMANDS = ["enigma"];

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
 function help(prefix, command, args) {
  if (command == "enigma"){
    return `${prefix}enigma [message] [r1] [r1o] [r2] [r2o] [r3] [r3o] [ref]\nEncode or decode a message using Spike's enigma machine.
message - String to encode/decode
r1 - Name of rotor to use in rightmost position
r1o - Starting offset for rightmost rotor, 0<=x<=25
r2 - Name of rotor to use in center position
r2o - Starting offset for center rotor, 0<=x<=25
r3 - Name of rotor to use in leftmost position
r3o - Starting offset for leftmost rotor, 0<=x<=25
ref - Name of reflector to use

The rotors and their offsets all have defaults and can be left empty. The default values of rotors 1, 2, and 3 are I, II, and III respectively. The default values for the starting offsets are all zero. The default value for the reflector is 'B'.

Rotor Names: I, II, III, IV, V
Reflector Names: A, B, C

Note: This enigma may have the rotors in reverse order when compared to other enigma machines.

Special thanks to Brandon Ingli for creating this enigma machine!`;
  } else {
    return "";
  }
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
 function shortHelp(prefix){
  return `${prefix}enigma - encode/decode a message.`
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message){
  if (command == "enigma"){
    let enigmaArgs = args.split(' ');
    const str = enigmaArgs[0];
    let enigmaText;
    try {
      if(enigmaArgs.length) {
        enigmaArgs.shift();
        enigmaText = enigma(str, ...enigmaArgs);
      } else {
        enigmaText = enigma(str);
      }
    } catch (e){
      enigmaText = `Error: ${e}`;
    }
    spikeKit.reply(
      spikeKit.createEmbed(
        "Enigma",
        enigmaText,
        true,
        message.author.username,
        message.author.avatarURL()
      ),
      message
    );
    message.delete();
  }
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};