/**
 * @author Joshua Maxwell
 * this file throws errors and displays error messages
 */

const Discord = require("discord.js");

/**
 * creates an error embed
 * @param {Message} msg the message sent by the user
 * @param {string} title the title for the embed
 * @param {string} content the description for the embed
 */
const errEmbed = (msg, title, content) => {
  const embed = new Discord.MessageEmbed()
    .setColor(0xfc0004)
    .setTitle(title)
    .setDescription("```fix\n" + content + "\n```")
    .setFooter(msg.author.username, msg.author.avatarURL());
  msg.channel.send(embed);
};

/**
 * throws an error for invalid syntax
 * @param {Message} msg the message sent by the user
 */
const syntaxErr = (msg) => {
  const title = "Invalid Syntax";
  const description = "Please see the help menu for more information.";
  errEmbed(msg, title, description);
};

/**
 * throws an error for invalid wager amounts
 * @param {Message} msg the message sent by the user
 */
const wagerErr = (msg) => {
  const title = "Invalid Wager";
  const description =
    "Your wager must be a positive amount and you cannot bet more than you own";
  errEmbed(msg, title, description);
};

/**
 * throws an error for unknown users
 * @param {Message} msg the message sent by the user
 */
const userErr = (msg) => {
  const title = "Invalid User";
  const description =
    "The given user either doesn't exist or has yet to be cached!";
  errEmbed(msg, title, description);
};

/**
 * throws an error for unknown commands
 * @param {Message} msg the message sent by the user
 */
const commandErr = (msg) => {
  const title = "Command not found";
  const description =
    'The given command cannot be found. To view the list of commands, type "$help"';
  errEmbed(msg, title, description);
};

/**
 * throws an error for unknown Spike Shop items
 * @param {Message} msg the message sent by the user
 */
const noItemErr = (msg) => {
  const title = "Item not found";
  const description =
    'The given item does not exist. To view the Spike Shop, type "$help shop"';
  errEmbed(msg, title, description);
};

/**
 * throws an error for trying to buy items that a user already owns
 * @param {Message} msg the message sent by the user
 */
const ownedItemErr = (msg) => {
  const title = "Error";
  const description = "You already own this item, you silly goose!";
  errEmbed(msg, title, description);
};

/**
 * throws an error for trying to buy items that user cannot afford
 * @param {Message} msg the message sent by the user
 */
const tooPoorErr = (msg) => {
  const title = "Error";
  const description = "Insufficient funds";
  errEmbed(msg, title, description);
};

/**
 * throws an error for NaN number input
 * @param {Message} msg the message sent by the user
 */
const clearNaNErr = (msg) => {
  const title = "Error";
  const description = "Please input a valid number";
  errEmbed(msg, title, description);
};

/**
 * throws an error when users try to clear too many messages
 * @param {Message} msg the message sent by the user
 */
const clearTooBigErr = (msg) => {
  const title = "Error";
  const description = "Input a number that is less than 100";
  errEmbed(msg, title, description);
};

/**
 * throws an error when users try to clear too few messages
 * @param {Message} msg the message sent by the user
 */
const clearTooSmallErr = (msg) => {
  const title = "Error";
  const description = "Input a number that is at least 2";
  errEmbed(msg, title, description);
};

/**
 * throws an error when users try to use a command they don't have access to
 * @param {Message} msg the message sent by the user
 */
const invalidPermsErr = (msg) => {
  const title = "Invalid Permissions";
  const description = "This command requires special permissions to perform.";
  errEmbed(msg, title, description);
};

const invalidBetPartsErr = (msg) => {
  const title = "Invalid Bet Parts";
  const description = "Bet parts wrong lengh: Expected 3";
  errEmbed(msg, title, description);
};

const NanBetAmtErr = (msg) => {
  const title = "NaN Amount";
  const description = "NaN bet amount or win amount.";
  errEmbed(msg, title, description);
};

const betNonZeroErr = (msg) => {
  const title = "Non-zero bet/win amount";
  const description = "non-zero bet amount or win amount.";
  errEmbed(msg, title, description);
};

const invalidEndPartsErr = (msg) => {
  const title = "Invalid end parts length";
  const description = "End parts wrong length. Expected 2";
  errEmbed(msg, title, description);
};

const invalidLineArgsLengthErr = (msg) => {
  const title = "Invalid line arguements length";
  const description = "Line arguements wrong length. Expected 3";
  errEmbed(msg, title, description);
};

const invalidEndBetIdErr = (msg) => {
  const title = "Invalid ID";
  const description = "Invalid end bet ID";
  errEmbed(msg, title, description);
};

const notBetOwnerErr = (msg) => {
  const title = "Invalid close error";
  const description = "Only the creator of the bet can close the bet";
  errEmbed(msg, title, description);
};

const invalidEmojiErr = (msg) => {
  const title = "Invalid Emoji";
  const description = "Emoji is not a wager";
  errEmbed(msg, title, description);
};

const cannotAdjustBetAuthorBankErr = (msg) => {
  const title = "Cannot Adjust Author's Bank";
  const description = "Cannot adjust bet author's bank.";
  errEmbed(msg, title, description);
};

const cannotPayBettorErr = (msg, username) => {
  const title = "Cannot Pay Bettor";
  const description = `Cannot pay bettor ${username}`;
  errEmbed(msg, title, description);
};

const multipleMessageReactionErr = (msg) => {
  const title = "Multiple Messages Found Reacted To";
  const description = "Expected one message reacted to, got multiple.";
  errEmbed(msg, title, description);
};

const betOwnerBetsErr = (msg) => {
  const title = "Bet Owner Cannot Bet on Own Bet";
  const description =
    "A bet owner tried to bet on their own bet, which they cannot do.";
  errEmbed(msg, title, description);
};

const transactionErr = (msg) => {
  const title = "Transaction Error";
  const description =
    "An error occurred when making a Spike Bucks transaction.";
  errEmbed(msg, title, description);
};

const ancmtPartsErr = (msg) => {
  const title = "Announce Parts Error";
  const description = "Announcement Parts wrong length: Expected 2";
  errEmbed(msg, title, description);
};

/**
 * throws the specified error
 * @param {Message} msg the message sent by the user
 * @param {string} errType the type of error to throw
 */
const throwErr = (msg, errType) => {
  if (errType === "syntax") syntaxErr(msg);
  else if (errType === "wager") wagerErr(msg);
  else if (errType === "user") userErr(msg);
  else if (errType === "command") commandErr(msg);
  else if (errType === "noItemErr") noItemErr(msg);
  else if (errType === "ownedItemErr") ownedItemErr(msg);
  else if (errType === "tooPoorErr") tooPoorErr(msg);
  else if (errType === "clearNaNErr") clearNaNErr(msg);
  else if (errType === "clearTooBigErr") clearTooBigErr(msg);
  else if (errType === "clearTooSmallErr") clearTooSmallErr(msg);
  else if (errType === "invalidPermsErr") invalidPermsErr(msg);
  else if (errType === "invalidBetPartsErr") invalidBetPartsErr(msg);
  else if (errType === "invalidLineArgsLengthErr")
    invalidLineArgsLengthErr(err);
  else if (errType === "NanBetAmtErr") NanBetAmtErr(msg);
  else if (errType === "betNonZeroErr") betNonZeroErr(msg);
  else if (errType === "invalidEndPartsErr") invalidEndPartsErr(msg);
  else if (errType === "invalidEndBetIdErr") invalidEndBetIdErr(msg);
  else if (errType === "notBetOwnerErr") notBetOwnerErr(msg);
  else if (errType === "invalidEmojiErr") invalidEmojiErr(msg);
  else if (errType === "cannotAdjustBetAuthorBank")
    cannotAdjustBetAuthorBankErr(msg);
  else if (errType.startsWith("cannotPayBettor"))
    cannotPayBettorErr(msg, errType.split(";")[1]);
  else if (errType === "multipleMessageReaction")
    multipleMessageReactionErr(msg);
  else if (errType === "betOwnerBets") betOwnerBetsErr(msg);
  else if (errType === "invalidEndPartsErr") invalidEndPartsErr(msg);
  else if (errType === "transaction") transactionErr(msg);
  else if (errType === "invalidAnnouncePartsErr") ancmtPartsErr(msg);
};

module.exports = { throwErr };
