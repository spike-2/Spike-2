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

/**
 * Parse an emoji out of a message string.
 * @param {String} text The emoji to parse, either a unicode character or a guild emoji tag
 * @param {Discord.guild} guild Discord Guild to seek emoji from
 * @returns {emoji: Unicode character or numeric ID of guild emoji, printEmoji: Unicode character or text required to display emoji in chat}
 */
function parseEmoji(text, guild){
  const emojiParts = text.trim().match(/^<:[a-z]+:([0-9]+)>$/);
      if(!emojiParts || emojiParts.length != 2) {
      // Unicode emoji
      emoji = printEmoji =text.trim();
    } else {
      // Assume custom guild emoji
      let emojiObj = guild.emojis.resolve(emojiParts[1]);
      emoji = emojiObj.id;
      printEmoji = emojiObj.toString();
    }

    return {
      emoji: emoji,
      printEmoji: printEmoji
    }
}

/**
 * Get and reply with active bets.
 * @param {Discord.Client} bot Instantiated discord client object
 * @param {Discord.Message} requestMessage Message object for the message that requested active bets
 * @returns null
 */
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
 * Create a new bet
 * Message format (newlines implicit):
 * $command Title [\n]
 * Description [\n]
 * :emoji: bet win Description of wager [\n; not needed on last line]
 * ...
 * @param {string} args Arguments from command invocation
 * @param {Discord.Client} bot instantiated discord bot object
 * @param {Discord.Message} message discord message object that sent this request
 */
async function newBet(args, bot, message){
  let bets = getBets();
  const betParts = args.split('\n');
  if(betParts.length < 3){
    //TODO Error
    console.error(`Bet: betParts wrong length. Expected 3, got ${betParts.length}`);
    return;
  }
  let betID = Date.now();

  let bet = {
    channelID: message.channel.id,
    title: betParts[0].trim(),
    description: betParts[1].trim(),
    createdBy: message.author.id,
    wagers: {}
  };

  let betMessage = `ID: ${betID}\n\n${bet.description}\n\n`;
  let emojiToReact = [];

  for (const line of betParts.slice(2)){
    const lineArgs = line.trim().match(/^(.+)\s([0-9]+)\s([0-9]+)\s(.*)$/);
    if(lineArgs.length != 5) {
      //TODO Error
      console.error(`Bet: lineArgs wrong length. Expected 3, got ${lineArgs.length}\nLine: ${line}`);
      return;
    }

    // Get emoji used
    const {emoji, printEmoji} = parseEmoji(lineArgs[1].trim(), message.guild);
    emojiToReact = [...emojiToReact, emoji]

    if (parseInt(lineArgs[2]) == NaN || parseInt(lineArgs[3]) == NaN){
      //TODO Error
      console.error(`Bet: Got a NaN for a bet amount or win amount.\nbet: ${lineArgs[2]}\nwin: ${lineArgs}`);
      return;
    }

    let wager = {
      description: lineArgs[4].trim(),
      bet: parseInt(lineArgs[2]),
      win: parseInt(lineArgs[3]),
      bettors: []
    };

    bet.wagers[emoji] = wager;

    betMessage += `${printEmoji} ${wager.description} (bet ${wager.bet}, win ${wager.win})\n`;

  } // End for each line
  const embed = spikeKit.createEmbed(
    `Bet: ${bet.title}`,
    betMessage,
    false,
    message.author.username,
    message.author.avatarURL()
  );
  await spikeKit.reply(embed, message);

  const getLastMessage = await message.channel.messages.fetch({limit: 1});
  const lastMessage = getLastMessage.first();
  bet.messageID = lastMessage.id;

  bets[betID] = bet;
  writeBets(bets);

  for(const emoji of emojiToReact){
    await lastMessage.react(emoji);
  }
  console.log(`Bet ${betID} successfully set up!`);

}

/**
 * End an active bet by its ID and winning emoji
 * $endbet {id} {:emoji:}
 * @param {string} args Args from the incoming message
 * @param {Discord.Client} bot Instantiated Discord Client object
 * @param {Discord.Message} message Incoming Discord Message
 * @returns null
 */
async function endBet(args, bot, message){
  let bets = getBets();

  const endParts = args.trim().split(' ');
  if(endParts.length != 2){
    //TODO Error
    console.error(`Bet: endParts wrong length. Expected 2, got ${endParts.length}`);
    return;
  }

  if(!bets[endParts[0]]){
    //TODO Error
    console.error(`Bet: End Bet invalid ID: ${endParts[0]}`);
    return;
  }

  const thisBetID = endParts[0];
  const thisBet = bets[thisBetID];

  if(message.author.id != thisBet.createdBy){
    //TODO Error
    console.error(`Bet: User that's not the creator tried to end ${thisBetID}: ${message.author.username}`);
    return;
  }

  const winningEmoji = parseEmoji(endParts[1], message.guild);
  if(!thisBet.wagers[winningEmoji.emoji]){
    //TODO Error
    console.error(`Bet: Winning Emoji not a wager: ${winningEmoji.printEmoji}`);
    return;
  }

  const winningWager = thisBet.wagers[winningEmoji.emoji];

  // Process winners
  let winnersNames = [];
  for(const userID of winningWager.bettors){
    const user = await bot.users.fetch(userID);
    try {
      addBucks(user, winningWager.win);
      winnersNames = [...winnersNames, user.username];
    } catch (e) {
      //TODO Error
      console.error(`Bet: Couldn't pay ${winningWager.win} to ${user.username}.`);
    }
  }

  // Compose message

  const oldMessage = await bot.channels.cache.get(thisBet.channelID).messages.fetch(thisBet.messageID);
  const betAuthor = await bot.users.fetch(thisBet.createdBy);

  const embed = spikeKit.createEmbed(
    `Bet Ended: ${thisBet.title}`,
    `ID: ${thisBetID}\n\n${thisBet.description}\n\nWinning Bet: ${winningEmoji.printEmoji} ${winningWager.description}
Bet ${winningWager.bet}, Win ${winningWager.win}\nWinners:${winnersNames.join(', ')}\n\n[View Original Message](${oldMessage.url})`,
    false,
    betAuthor.username,
    betAuthor.avatarURL()
  );

  await bot.channels.cache.get(thisBet.channelID).send(embed);
  const getLastMessage = await message.channel.messages.fetch({limit: 1});
  const lastMessage = getLastMessage.first();

  // Edit Old Message
  const oldMessageNewEmbed = spikeKit.createEmbed(
    `Closed Bet: ${thisBet.title}`,
    `${oldMessage.embeds[0].description}\n\n[Results](${lastMessage.url})`,
    false,
   betAuthor.username,
   betAuthor.avatarURL()
  );
  oldMessage.edit(oldMessageNewEmbed);

  // Remove from the active bets
  delete bets[thisBetID];
  writeBets(bets);

  console.log(`Bet ${thisBetID} finished.`);

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
    newBet(args, bot, message);
  }
  else if (command === 'activebets') {
    activeBets(bot, message);
  }
  else if (command === 'endbet') {
    //TODO
    // ends a given bet
    endBet(args, bot, message);
  }
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};
