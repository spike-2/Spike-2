/**
 * @author Joshua Maxwell
 * this file throws errors and displays error messages
 */

const Discord = require('discord.js');

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
    .setDescription('```fix\n' + content + '\n```')
    .setFooter(msg.author.username, msg.author.avatarURL());
  msg.channel.send(embed);
}

/**
 * throws an error for invalid coin toss syntax
 * @param {Message} msg the message sent by the user
 */
const coinTossErr = (msg) => {
  const title = 'Invalid Syntax';
  const description = 'To toss a coin type "$cointoss [wager] [face]"';
  errEmbed(msg, title, description);
}

/**
 * throws an error for invalid wager amounts
 * @param {Message} msg the message sent by the user 
 */
const wagerErr = (msg) => {
  const title = 'Invalid Wager';
  const description = 'Your wager must be a positive amount and you cannot bet more than you own';
  errEmbed(msg, title, description);
}

/**
 * throws an error for unknown users
 * @param {Message} msg the message sent by the user
 */
const giftErr = (msg) => {
  const title = 'Invalid User';
  const description = 'The given recipient either doesn\'nt exist or has yet to be cached!';
  errEmbed(msg, title, description);
}

/**
 * throws an error for unknown commands
 * @param {Message} msg the message sent by the user
 */
const commandErr = (msg) => {
  const title = 'Command not found';
  const description = 'The given command cannot be found. To view the list of commands, type "$help"';
  errEmbed(msg, title, description);
}

/**
 * throws an error for unknown Spike Shop items
 * @param {Message} msg the message sent by the user
 */
const noItemErr = (msg) => {
  const title = 'Item not found';
  const description = 'The given item does not exsist. To view the Spike Shop, type "$Shop"';
  errEmbed(msg, title, description);
}

/**
 * throws an error for trying to buy items that a user already owns
 * @param {Message} msg the message sent by the user
 */
const ownedItemErr = (msg) => {
  const title = 'Error';
  const description = 'You already own this item, you silly goose!';
  errEmbed(msg, title, description);
}

/**
 * throws an error for trying to buy items that user cannot afford
 * @param {Message} msg the message sent by the user
 */
const tooPoorErr = (msg) => {
  const title = 'Error';
  const description = 'Insufficient funds';
  errEmbed(msg, title, description);
}

/**
 * throws an error for NaN number input
 * @param {Message} msg the message sent by the user
 */
const clearNaNErr = (msg) => {
  const title = 'Error';
  const description = 'Please input a valid number';
  errEmbed(msg, title, description);
}

/**
 * throws an error when users try to clear too many messages
 * @param {Message} msg the message sent by the user
 */
const clearTooBigErr = (msg) => {
  const title = 'Error';
  const description = 'Input a number that is less than 100';
  errEmbed(msg, title, description);
}

/**
 * throws an error when users try to clear too few messages
 * @param {Message} msg the message sent by the user
 */
const clearTooSmallErr = (msg) => {
  const title = 'Error';
  const description = 'Input a number that is at least 2';
  errEmbed(msg, title, description);
}

/**
 * throws an error when users try to use a command they don't have access to
 * @param {Message} msg the message sent by the user
 */
const invalidPermsErr = (msg) => {
  const title = 'Invalid Permissions';
  const description = 'This command requires special permissions to perform.';
  errEmbed(msg, title, description);
}

/**
 * throws the specified error
 * @param {Message} msg the message sent by the user
 * @param {string} errType the type of error to throw
 */
const throwErr = (msg, errType) => {
  if (errType === 'cointoss')
    coinTossErr(msg);
  else if (errType === 'wager')
    wagerErr(msg);
  else if (errType === 'gift')
    giftErr(msg);
  else if (errType === 'command')
    commandErr(msg);
  else if (errType === 'noItemErr')
    noItemErr(msg);
  else if (errType === 'ownedItemErr')
    ownedItemErr(msg);
  else if (errType === 'tooPoorErr')
    tooPoorErr(msg);
  else if (errType === 'clearNaNErr')
    clearNaNErr(msg);
  else if (errType === 'clearTooBigErr')
    clearTooBigErr(msg);
  else if (errType === 'clearTooSmallErr')
    clearTooSmallErr(msg);
  else if (errType === 'invalidPermsErr')
    invalidPermsErr(msg)
}

module.exports = { throwErr }
