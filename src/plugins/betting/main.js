/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * A Spike module for making and maintaining bets with Spike Bucks
 */

const spikeKit = require("../../spikeKit.js");
const fs = require("fs");
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

const BETSFILENAME = "plugins/betting/bets.json";
const ACTIVE_BETS_EMBED_TITLE = "Active Bets";

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
 * Read the active bets from the file system.
 * @returns The active bets on the file system, or the empty object.
 */
function getBets() {
  try {
    let bets = fs.readFileSync(BETSFILENAME);
    return JSON.parse(bets);
  } catch (e){
    console.error(`${BETSFILENAME} Doesn't Exist or isn't readable. Using empty object instead.`);
    return {};
  }
}

/**
 * Writes active bets to disk.
 * @param {Bets} bets Active Bets object
 */
function writeBets(bets){
  fs.writeFileSync(BETSFILENAME, JSON.stringify(bets));
}

async function activeBets(bot, requestMessage){
  const bets = getBets();

  if(Object.keys(bets).length == 0){
    spikeKit.reply(spikeKit.createEmbed(
      ACTIVE_BETS_EMBED_TITLE,
      "There are no active bets.",
      false,
      requestMessage.author.username,
      requestMessage.author.avatarURL()
    ),
    requestMessage);
    return;
  }

  let betsString = "Click on a bet title to visit that message and bet.\n---\n";
  for(const [betId, bet] of Object.entries(bets)){
    const message = await bot.channels.cache.get(bet.channelID)
                          .messages.fetch(bet.messageID);
    const betAuthor = await bot.users.fetch(bet.createdBy);
    betsString += `**[${bet.title}](${message.url})**\n*Created by ${betAuthor.username}*\n${bet.description}\n---\n`;
  }
  const embedToSend = spikeKit.createEmbed(
    ACTIVE_BETS_EMBED_TITLE,
    betsString,
    false,
    requestMessage.author.username,
    requestMessage.author.avatarURL()
  );
  spikeKit.reply(embedToSend, requestMessage);
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
    activeBets(bot, message);
  }
  else if (command === 'endbet') {
    //TODO
    // ends a given bet
  }
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};
