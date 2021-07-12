/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * A Spike module for making and maintaining bets with Spike Bucks
 */

const spikeKit = require("../../spikeKit.js");
const fs = require("fs").promises;
const {getStudent, addBucks, getDat, getConsts} = require('../../faccess.js');
const {throwErr} = require('../../botErr.js');


const NAME = "Bet";
const AUTHOR = "Joshua Maxwell and Brandon Ingli";
/**
 * Commands supported by this plugin. Do not include the prefix.
 * Good: command
 * Bad: $command
 */
const COMMANDS = ["bet", "endbet", "activebets"];

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
 function help(prefix, command, args) {
  switch(command){
    case "bet":
      return `${prefix}bet - Create a new bet. You cannot wager on a bet you create. Format the message as shown below, noting the newlines. Repeat the last line for every option you want.\n\n${prefix}bet Title\nThis is what the bet is about\n:emoji: {bet amount} {winnings} What this wager means`;
    case "endbet":
      return `${prefix}endbet {id} {:emoji:} - Ends a bet. Only the user that starts a bet can end it.\n\n{id} is the bet ID given when created\n{:emoji:} is the emoji representing the winning wager.`
    case "activebets":
      return `${prefix}activebets - See all bets currently active, including IDs and links.`
  }
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
 function shortHelp(prefix){
  return `Create and manage option-based wagers.
${prefix}bet - Create a new bet.
${prefix}endbet - End a bet you created.
${prefix}activebets - See all bets currently active, including IDs and links.`
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message){
  if (command === 'bet') {
    //TODO
    // initialize a bet
  }
  else if (command === 'activebets') {
    //TODO
    // view all ongoing bets (along with a bet id)
  }
  else if (command === 'endbet') {
    //TODO
    // ends a given bet
  }
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};
