/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * A Spike module for making and maintaining bets with Spike Bucks
 */

const spikeKit = require("../../spikeKit.js");
const fs = require("fs");
const { getStudent, addBucks, getDat, getConsts } = require("../../faccess.js");

const NAME = "Bet";
const SLUG = "betting";
const AUTHOR = "Joshua Maxwell and Brandon Ingli";
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
  switch (command) {
    case "bet":
      return `${prefix}bet - Create a new bet.\nYou cannot wager on a bet you create.\nCreator will lose the winnings from their wallet on end, up to all money in wallet.\nWinners will receive the listed winnings if funds exist, or their bet + 1 if funds don't exist.\n\nFormat the message as shown below, noting the newlines. Repeat the last line for every option you want.\n\n${prefix}bet Title\nThis is what the bet is about\n:emoji: {bet amount} {winnings} What this wager means`;
    case "endbet":
      return `${prefix}endbet {id} {:emoji:} - Ends a bet. Only the user that starts a bet can end it.\n\n{id} is the bet ID given when created\n{:emoji:} is the emoji representing the winning wager.`;
    case "activebets":
      return `${prefix}activebets - See all bets currently active, including IDs and links.`;
  }
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
function shortHelp(prefix) {
  return `Create and manage option-based wagers.
${prefix}bet - Create a new bet.
${prefix}endbet - End a bet you created.
${prefix}activebets - See all bets currently active, including IDs and links.`;
}

/**
 * Read the active bets from the file system.
 * @returns The active bets on the file system, or the empty object.
 */
function getBets() {
  try {
    let bets = fs.readFileSync(BETSFILENAME);
    return JSON.parse(bets);
  } catch (e) {
    console.error(
      `${BETSFILENAME} Doesn't Exist or isn't readable. Using empty object instead.`
    );
    return {};
  }
}

/**
 * Writes active bets to disk.
 * @param {Bets} bets Active Bets object
 */
function writeBets(bets) {
  fs.writeFileSync(BETSFILENAME, JSON.stringify(bets));
}

/**
 * Parse an emoji out of a message string.
 * @param {String} text The emoji to parse, either a unicode character or a guild emoji tag
 * @param {Discord.guild} guild Discord Guild to seek emoji from
 * @returns {emoji: Unicode character or numeric ID of guild emoji, printEmoji: Unicode character or text required to display emoji in chat}
 */
function parseEmoji(text, guild) {
  const emojiParts = text.trim().match(/^<:[a-zA-Z0-9]+:([0-9]+)>$/);
  if (!emojiParts || emojiParts.length != 2) {
    // Unicode emoji
    emoji = printEmoji = text.trim();
  } else {
    // Assume custom guild emoji
    let emojiObj = guild.emojis.resolve(emojiParts[1]);
    emoji = emojiObj.id;
    printEmoji = emojiObj.toString();
  }

  return {
    emoji: emoji,
    printEmoji: printEmoji,
  };
}

/**
 * Get and reply with active bets.
 * @param {Discord.Client} bot Instantiated discord client object
 * @param {Discord.Message} requestMessage Message object for the message that requested active bets
 * @returns null
 */
async function activeBets(bot, requestMessage) {
  const bets = getBets();

  if (Object.keys(bets).length == 0) {
    spikeKit.reply(
      spikeKit.createEmbed(
        ACTIVE_BETS_EMBED_TITLE,
        "There are no active bets.",
        false,
        requestMessage.author.username,
        requestMessage.author.avatarURL()
      ),
      requestMessage
    );
    return;
  }

  let betsString = "Click on a bet title to visit that message and bet.\n---\n";
  for (const [betId, bet] of Object.entries(bets)) {
    const message = await bot.channels.cache
      .get(bet.channelID)
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
async function newBet(args, bot, message) {
  let bets = getBets();
  const betParts = args.split("\n");
  if (betParts.length < 3) {
    spikeKit.throwErr(message, "invalidBetPartsErr");
    console.error(
      `Bet: betParts wrong length. Expected 3, got ${betParts.length}`
    );
    return;
  }

  // Verify user can start a bet
  try {
    let student = getStudent(message.author.id);
    if (student.wallet <= 0) {
      throw "No funds!";
    }
  } catch (e) {
    spikeKit.throwErr(message, "tooPoorErr");
    console.error(
      `Bet: User ${message.author.username} doesn't have funds to set up wager.`
    );
    return;
  }

  let betID = Date.now();

  let bet = {
    channelID: message.channel.id,
    title: betParts[0].trim(),
    description: betParts[1].trim(),
    createdBy: message.author.id,
    wagers: {},
  };

  let betMessage = `ID: ${betID}\n\n${bet.description}\n\n`;
  let emojiToReact = [];

  for (const line of betParts.slice(2)) {
    const lineArgs = line.trim().match(/^(.+)\s([0-9]+)\s([0-9]+)\s(.*)$/);
    if (lineArgs == null || lineArgs.length != 5) {
      spikeKit.throwErr(message, "invalidLineArgsLengthErr");
      console.error(
        `Bet: lineArgs wrong length. Expected 3, got ${
          lineArgs ? lineArgs.length : "null"
        }\nLine: ${line}`
      );
      return;
    }

    // Get emoji used
    const { emoji, printEmoji } = parseEmoji(lineArgs[1].trim(), message.guild);
    emojiToReact = [...emojiToReact, emoji];

    if (parseInt(lineArgs[2]) == NaN || parseInt(lineArgs[3]) == NaN) {
      spikeKit.throwErr(message, "NanBetAmtErr");
      console.error(
        `Bet: Got a NaN for a bet amount or win amount.\nbet: ${lineArgs[2]}\nwin: ${lineArgs}`
      );
      return;
    }
    if (parseInt(lineArgs[2]) <= 0 || parseInt(lineArgs[3]) <= 0) {
      spikeKit.throwErr(message, "betNonPosErr");
      console.error(
        `Bet: Got a non-positive value for a bet amount or win amount.\nbet: ${lineArgs[2]}\nwin: ${lineArgs}`
      );
      return;
    }

    let wager = {
      description: lineArgs[4].trim(),
      bet: parseInt(lineArgs[2]),
      win: parseInt(lineArgs[3]),
      bettors: [],
    };

    bet.wagers[emoji] = wager;

    betMessage += `${printEmoji} ${wager.description} (bet ${wager.bet}, win ${wager.win}\\*)\n`;
  } // End for each line
  const embed = spikeKit.createEmbed(
    `Bet: ${bet.title}`,
    betMessage,
    false,
    message.author.username,
    message.author.avatarURL()
  );
  await spikeKit.reply(embed, message);

  const getLastMessage = await message.channel.messages.fetch({ limit: 1 });
  const lastMessage = getLastMessage.first();
  bet.messageID = lastMessage.id;

  bets[betID] = bet;
  writeBets(bets);

  for (const emoji of emojiToReact) {
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
async function endBet(args, bot, message) {
  let bets = getBets();

  const endParts = args.trim().split(" ");
  if (endParts.length != 2) {
    spikeKit.throwErr(message, "invalidEndPartsErr");
    console.error(
      `Bet: endParts wrong length. Expected 2, got ${endParts.length}`
    );
    return;
  }

  if (!bets[endParts[0]]) {
    spikeKit.throwErr(message, "invalidEndBetIdErr");
    console.error(`Bet: End Bet invalid ID: ${endParts[0]}`);
    return;
  }

  const thisBetID = endParts[0];
  const thisBet = bets[thisBetID];

  if (message.author.id != thisBet.createdBy) {
    spikeKit.throwErr(message, "notBetOwnerErr");
    console.error(
      `Bet: User that's not the creator tried to end ${thisBetID}: ${message.author.username}`
    );
    return;
  }

  const winningEmoji = parseEmoji(endParts[1], message.guild);
  if (!thisBet.wagers[winningEmoji.emoji]) {
    spikeKit.throwErr(message, "invalidEmojiErr");
    console.error(`Bet: Winning Emoji not a wager: ${winningEmoji.printEmoji}`);
    return;
  }

  const winningWager = thisBet.wagers[winningEmoji.emoji];

  // Calculate pot
  let pot = 0;
  for (const wager of Object.values(thisBet.wagers)) {
    pot += wager.bet * wager.bettors.length;
  }
  console.log(`Pot: ${pot}`);

  let winnings = winningWager.bettors.length * winningWager.win;

  const betAuthor = await bot.users.fetch(thisBet.createdBy);

  // Determine the actual winnings based on funding.
  let student;
  try {
    student = getStudent(betAuthor.id);
    if (!student) {
      throw "Doesn't Exist";
    }
  } catch (e) {
    spikeKit.throwErr(message, "user");
    console.error(`Bet: User ${user.username} doesn't exist.`);
    return;
  }

  let bucksToAdjust;
  let winningsPerPerson;
  if (student.wallet + pot < winnings) {
    // Creator can't pay full winnings. Wipe them out and pay bet + 1
    winnings = (winningWager.bet + 1) * winningWager.bettors.length;
    bucksToAdjust = -1 * student.wallet; // Wipe to Zero
    winningsPerPerson = winningWager.bet + 1;
  } else {
    // Creator can pay full winnings.
    bucksToAdjust = -1 * (winnings - pot);
    winningsPerPerson = winningWager.win;
  }

  // Adjust the creator's bank
  try {
    addBucks(betAuthor, bucksToAdjust);
  } catch (e) {
    spikeKit.throwErr(message, "cannotAdjustBetAuthorBank");
    console.error(
      `Bet: Couldn't adjust ${betAuthor.username}'s bank by ${bucksToAdjust}`
    );
    return;
  }

  // Process winners
  let winnersNames = [];
  for (const userID of winningWager.bettors) {
    const user = await bot.users.fetch(userID);
    try {
      addBucks(user, winningsPerPerson);
      winnersNames = [...winnersNames, user.username];
    } catch (e) {
      spikeKit.throwErr(message, "cannotPayBettor;" + user.username);
      console.error(
        `Bet: Couldn't pay ${winningsPerPerson} to ${user.username}.`
      );
    }
  }

  // Compose message

  const oldMessage = await bot.channels.cache
    .get(thisBet.channelID)
    .messages.fetch(thisBet.messageID);

  const embed = spikeKit.createEmbed(
    `Bet Ended: ${thisBet.title}`,
    `ID: ${thisBetID}\n\n${thisBet.description}\n\nWinning Bet: ${
      winningEmoji.printEmoji
    } ${winningWager.description}
Bet ${winningWager.bet}, Win ${winningsPerPerson}\nWinners: ${winnersNames.join(
      ", "
    )}\nTotal Winnings: ${winnings}\n\n[View Original Message](${
      oldMessage.url
    })`,
    false,
    betAuthor.username,
    betAuthor.avatarURL()
  );

  spikeKit.send(embed, thisBet.channelID, bot);
  const getLastMessage = await message.channel.messages.fetch({ limit: 1 });
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
function processCommand(command, args, bot, message) {
  if (command === "bet") {
    newBet(args, bot, message);
  } else if (command === "activebets") {
    activeBets(bot, message);
  } else if (command === "endbet") {
    endBet(args, bot, message);
  }
}

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

  // Get the correct bet
  let bets = getBets();
  const thisBetReduced = Object.entries(bets).filter(
    ([k, b]) =>
      b.channelID == reaction.message.channel.id &&
      b.messageID == reaction.message.id
  );
  if (thisBetReduced.length != 1) {
    spikeKit.throwErr(reaction.message, "multipleMessageReaction");
    console.error(
      `Bet: Expected to find one bet, got ${thisBetReduced.length}`
    );
    reaction.users.remove(user.id);
    return;
  }
  const [thisBetID, thisBet] = thisBetReduced[0];

  // Verify that they can bet
  if (thisBet.createdBy == user.id) {
    spikeKit.throwErr(reaction.message, "betOwnerBets");
    console.error(
      `Bet: ${user.username} tried to wager on their own bet ${thisBetID}`
    );
    reaction.users.remove(user.id);
    return;
  }

  // Get the student
  let student;
  try {
    student = getStudent(user.id);
    if (student === null) {
      throw "Doesn't Exist";
    }
  } catch (e) {
    spikeKit.throwErr(reaction.message, "user");
    console.error(`Bet: Student ${user.id} doesn't exist.`);
    reaction.users.remove(user.id);
    return;
  }

  // Get emoji
  const emoji = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;

  // Verify emoji
  if (!Object.keys(thisBet.wagers).includes(emoji)) {
    spikeKit.throwErr(reaction.message, "invalidEmojiErr");
    console.error(`Bet: Emoji ${emoji} not a wager on ${thisBetID}`);
    reaction.users.remove(user.id);
    return;
  }

  if (add) {
    // Verify that the user didn't already bet
    if (thisBet.wagers[emoji].bettors.includes(user.id)) {
      // No need to alert the user. This is likely due to caching issues on the bot.
      console.error(
        `Bet: User ${user.username} already wagered ${emoji} on ${thisBetID}`
      );
      return;
    }

    // Verify the funds exist to bet
    if (student.wallet < thisBet.wagers[emoji].bet) {
      spikeKit.throwErr(reaction.message, "tooPoorErr");
      console.error(
        `Bet: Student ${user.username} doesn't have enough to bet ${thisBet.wagers[emoji].bet} (Wallet ${student.wallet})`
      );
      reaction.users.remove(user.id);
      return;
    }

    // Take the money
    try {
      addBucks(user, parseInt(-1 * thisBet.wagers[emoji].bet));
    } catch (e) {
      spikeKit.throwErr(reaction.message, "transaction");
      console.error(
        `Bet: Couldn't take ${thisBet.wagers[emoji].bet} from ${user.username}`
      );
      reaction.users.remove(user.id);
      return;
    }

    // Add to array
    thisBet.wagers[emoji].bettors = [...thisBet.wagers[emoji].bettors, user.id];

    // Update bets
    bets[thisBetID] = thisBet;
    writeBets(bets);

    console.log(
      `Bet: ${user.username} bet ${thisBet.wagers[emoji].bet} for ${emoji} on ${thisBetID}`
    );
  } else {
    // Verify they betted this
    if (!thisBet.wagers[emoji].bettors.includes(user.id)) {
      // No need to alert the user. This is likely due to caching issues on the bot.
      console.error(
        `Bet: User ${user.username} didn't wager ${emoji} on ${thisBetID}`
      );
      return;
    }

    // Remove from array
    thisBet.wagers[emoji].bettors.splice(
      thisBet.wagers[emoji].bettors.indexOf(user.id),
      1
    );

    // Update bets
    bets[thisBetID] = thisBet;
    writeBets(bets);

    // Add money
    try {
      addBucks(user, thisBet.wagers[emoji].bet);
    } catch (e) {
      spikeKit.throwErr(reaction.message, "transaction");
      console.error(
        `Bet: Couldn't refund ${thisBet.wagers[emoji].bet} to ${user.username}.`
      );
      return;
    }
  }
}

/**
 * Runs when the bot is first started if exported below.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function onBotStart(bot) {
  // Cache all active betting messages.
  const bets = getBets();
  if (Object.keys(bets).length > 0) {
    for (const [betId, bet] of Object.entries(bets)) {
      console.log(`Caching Bet ${bet.title}`);
      bot.channels.cache.get(bet.channelID).messages.fetch(bet.messageID);
    }
  }
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
  processReaction,
  onBotStart,
};
