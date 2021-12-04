/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * Gambling functions for Spike
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../../spikeKit.js");
const { getStudent, addBucks, getDat, getConsts } = require("../../faccess.js");

/**
 * The display name of the plugin.
 */
const NAME = "Gamble";
/**
 * Slug used to programmatically refer to the plugin. Lowercase letters, numbers, and dashes only.
 */
const SLUG = "gamble";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Joshua Maxwell and Brandon Ingli";
/**
 * Commands supported by this plugin. Do not include the prefix.
 * Good: command
 * Bad: $command
 */
const COMMANDS = ["wallet", "cointoss", "gift", "leaderboard", "dice", "slots"];

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
function help(prefix, command, args) {
  switch (command) {
    case "wallet":
      return `${prefix}wallet [user]\nWith this command you can check the the amount of Spike Bucks in anyone's wallet. If you want to know how many Bucks you have in your own wallet, you can simply leave the user field blank.`;
    case "cointoss":
      return `${prefix}cointoss [wager] [face]\nYou can wager some of your Spike Bucks on a coin toss for a chance at making some money!`;
    case "gift":
      return `${prefix}gift [amount] [user]\nYou can gift some of your Spike Bucks to your friends!`;
    case "leaderboard":
      return `${prefix}leaderboard\nView the users with the most Spike Bucks. Climb to the top if you can!`;
    case "dice":
      return `${prefix}dice [wager]\nThe game of dice is a fairly simple game. You can make a lot of Spike Bucks if you roll a sum value greater than 7, or roll doubles.`;
    case "slots":
      return `${prefix}slots [wager]\nIn order to use this command, you must buy it from the Spike Shop\n\nThis game has come more complex. If you get a match, you will gain some money. The more matching results, the more money you will gain! There are also generic values '$', which will always get you money. If you get a generic and pairs, you will gain even more Spike Bugs. If you get all 4 generics, you will win a jackpot!`;
  }
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
function shortHelp(prefix) {
  return `Earn Spike Bucks to gamble or gift by sending messages.
${prefix}wallet - View Spike Bucks balance.
${prefix}cointoss - Wager Spike Bucks on Heads or Tails.
${prefix}gift - Gift some Spike Bucks to friends.
${prefix}leaderboard - View the leaderboard.
${prefix}dice - Wager Spike Bucks on a roll of the dice.
${prefix}slots - Pull the handle and find a jackpot.`;
}

/**
 * Checks whether or not a given wager is valid
 * @param {Message} msg the message sent by the user
 * @param {Integer} wager the amount of Spike Bucks being wagered
 * @returns whether or not the given wager is valid
 */
const validWager = (msg, wager) => {
  // wager will be passed in as a string
  const temp = parseInt(wager);
  if (temp && temp >= 0 && getStudent(msg.author.id).wallet >= temp)
    return true;

  spikeKit.throwErr(msg, "wager");
  return false;
};

/**
 * Takes a user mention and turns it into their user id
 * @param {string} tag the tag/mentioned user
 * @returns the user's id
 */
const detag = (tag) =>
  tag.replace("<@!", "").replace("<@", "").replace(">", "");

/**
 * Takes a \n separated string and turns it into a table
 *
 * I would like to eventually make this function so that it can make tables
 * with a variable number of columns
 * @param {string} text
 * @returns a table containing the given information
 */
const tablify = (text) => {
  const lines = text.split("\n");

  // gets length of longest line
  let maxLength = 0;
  lines.forEach((t) => {
    if (t.length > maxLength) maxLength = t.length;
  });
  maxLength += 4; // lil more room

  // top of table
  let result = "\n╔";
  for (let i = 0; i < maxLength; ++i) result += "═";
  result += "╗\n";

  // adds content
  lines.forEach((t) => {
    result += `║ ${t}`;
    for (let i = 0; i < maxLength - t.length - 1; ++i) result += " ";
    result += "║\n";

    if (t !== lines[lines.length - 1]) result += "╠";
    else result += "╚";
    for (let i = 0; i < maxLength; ++i) result += "═";
    if (t !== lines[lines.length - 1]) result += "╣\n";
    else result += "╝\n";
  });

  return result;
};

/**
 * gets the amount of Spike Bucks in a given user's wallet
 * @param {Message} msg the message sent by the user
 * @param {string} id the id related to the wallet we want to find
 */
const getWallet = (msg, id) => {
  if (id === null) id = msg.author.id;

  student = getStudent(id);
  if (!student) {
    spikeKit.throwErr(msg, "user");
    return;
  }

  const title = student.name;
  const content = tablify(`${student.wallet}`);
  spikeKit.reply(
    spikeKit.createEmbed(
      title,
      content,
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

/**
 * Performs the cointoss gambling game
 * @param {Message} msg the message sent by the user
 */
const coinToss = (msg, prefix) => {
  // $cointoss [wager] [face]
  const args = msg.content.split(" ");

  // is it a valid wager?
  if (!validWager(msg, args[1])) return;

  // is it a valid coin face?
  if (
    args.length != 3 ||
    (args[2].toLowerCase() !== "heads" && args[2].toLowerCase() !== "tails")
  ) {
    spikeKit.throwErr(msg, "syntax");
    return;
  }

  // otherwise, play the game
  const wager = parseInt(args[1]);
  addBucks(msg.author.id, -wager);

  const coinState = Math.floor(Math.random() * 100 + 1) > 51;
  const face = args[2];
  let outcome =
    !coinState && face.toLowerCase() === "heads"
      ? "tails"
      : !coinState && face.toLowerCase() === "tails"
      ? "heads"
      : face;

  const earnings = coinState ? Math.ceil(wager + wager * 2.2) : 0;
  addBucks(msg.author, earnings);

  const contents =
    `${getConsts().gamble["coinImage"]}` +
    `Called: ${face.toUpperCase()}\n` +
    `Results: ${outcome.toUpperCase()}\n` +
    `Earnings: ${earnings - wager}`;

  const title = "Coin Toss";
  spikeKit.reply(
    spikeKit.createEmbed(
      title,
      contents,
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

/**
 * Takes money from the caller and gifts it to a given user
 * @param {Message} msg the message sent by the user
 */
const gift = (msg) => {
  // gift [amt] [user]
  const args = msg.content.split(" ");

  if (args.length != 3) {
    spikeKit.throwErr(msg, "syntax");
    return;
  }

  const giftAmt = parseInt(args[1]);
  if (!validWager(msg, giftAmt)) {
    return;
  }

  const recipient = getStudent(detag(args[2]));
  if (!recipient) {
    spikeKit.throwErr(msg, "user");
    return;
  }

  addBucks(msg.author, -giftAmt);
  getDat()[detag(args[2])]["wallet"] += giftAmt;
  const contents =
    `${getConsts().gamble["giftImage"]}` +
    `Amount: $${giftAmt}\n` +
    `To: ${recipient.name}\n` +
    `From: ${msg.author.username}`;
  spikeKit.reply(
    spikeKit.createEmbed(
      "Gift",
      contents,
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

/**
 * Displays the leaderboard and those with the fattest wallets
 * @param {Message} msg the message sent by the user
 */
const leaderboard = (msg) => {
  const keys = Object.keys(getDat());
  let users = [];
  keys.forEach((t) => users.push(getDat()[t]));
  users.sort((a, b) => b.wallet - a.wallet);

  let result = "";
  for (let i = 0; i < 10 && i < users.length; ++i)
    result += `${i + 1} | ${users[i].name} - ${users[i].wallet}\n`;
  result = result.slice(0, result.length - 1);
  const title = "Coin Toss";
  spikeKit.reply(
    spikeKit.createEmbed(
      "Leaderboard",
      tablify(result),
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

const stitch = (a, b) => {
  const t1 = a.split("\n");
  const t2 = b.split("\n");
  let result = "";
  for (let i = 0; i < t1.length; ++i) result += `${t1[i]}${t2[i]}\n`;
  return result;
};

/**
 * plays a game of dice
 * @param {Message} msg the message sent by the user
 */
const dice = (msg) => {
  const wager = parseInt(msg.content.split(" ")[1]);
  if (!validWager(msg, wager)) return;

  addBucks(msg.author, -wager);

  const die1 = Math.floor(Math.random() * 6 + 1);
  const die2 = Math.floor(Math.random() * 6 + 1);

  spikeKit.logger.info(`${die1}, ${die2}`);

  const winnings =
    die1 === die2 && die1 === 6
      ? wager * 6
      : die1 === die2
      ? Math.ceil(wager * 3.5)
      : die1 + die2 > 7
      ? Math.ceil(wager * 2.7)
      : 0;

  addBucks(msg.author, winnings);

  const img =
    //long boi
    `${stitch(
      getConsts().gamble[`d${die1}0`],
      getConsts().gamble[`d0${die2}`]
    )}`;

  const content = `${img}Die 1: ${die1}\nDie 2: ${die2}\nEarnings: ${
    winnings - wager
  }`;
  spikeKit.reply(
    spikeKit.createEmbed(
      "Dice Roll",
      content,
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

/**
 * plays a game of slots
 * @param {Message} msg the message sent by the user
 */
const slots = (msg) => {
  if (!msg.member.roles.cache.has(getConsts().role["slots"])) {
    spikeKit.throwErr(msg, "invalidPermsErr");
    return;
  }
  const wager = parseInt(msg.content.split(" ")[1]);
  if (!validWager(msg, wager)) return;

  addBucks(msg.author, -wager);

  const fruit = "ABCDEFGHIJ$"; // the possibilities of the spinning wheels
  let result = [];

  for (let i = 0; i < 4; ++i) {
    result.push(fruit.charAt(Math.floor(Math.random() * fruit.length)));
  }

  let counts = [];
  result.forEach((t) => {
    counts.push(
      result.join("").split(new RegExp(t === "$" ? "\\$" : t, "gi")).length - 1
    );
  });

  let earnings = 0;
  const max = Math.max(...counts);
  if (max === 2) earnings = 2.5;
  else if (max === 3) earnings = 6;
  else if (max === 4) earnings = 16;

  earnings += 2 * (result.join("").split(new RegExp("\\$", "gi")).length - 1);

  earnings *= wager;

  if (
    result[0] == "$" &&
    result[1] == "$" &&
    result[2] == "$" &&
    result[3] == "$"
  )
    earnings = wager * 151;

  addBucks(msg.author, earnings);
  let contents = getConsts().gamble["slotsImage"].replace(
    "#",
    `${result[0]} ${result[1]} ${result[2]} ${result[3]}`
  );
  contents += `Wager: ${wager}\nEarnings: ${earnings}`;
  spikeKit.reply(
    spikeKit.createEmbed(
      "Slots",
      contents,
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message) {
  if (command === "wallet") {
    if (args) {
      getWallet(message, detag(args));
    } else {
      getWallet(message, null);
    }
  } else if (command === "cointoss") {
    coinToss(message);
  } else if (command === "gift") {
    gift(message);
  } else if (command === "leaderboard") {
    leaderboard(message);
  } else if (command === "dice") {
    dice(message);
  } else if (command === "slots") {
    slots(message);
  }
}

module.exports = {
  NAME,
  SLUG,
  shortHelp,
  AUTHOR,
  COMMANDS,
  help,
  processCommand,
};
