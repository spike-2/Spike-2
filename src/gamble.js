/**
 * @author Joshua Maxwell
 * This file deals with Gambling related commands
 */

const Discord = require('discord.js');
const {getStudent, addBucks, getDat, getConsts} = require('./faccess.js');
const {throwErr} = require('./botErr');
const {executeShop} = require('./shop');

/**
 * creates an embed with relatively little codes
 * @param {Message} msg the message sent by the user
 * @param {String} title the title for the embed
 * @param {String} content the description for the embed
 */
const basicEmbed = (msg, title, content) => {
  const embed = new Discord.MessageEmbed()
    .setColor(0xcc00ff)
    .setTitle(title)
    .setDescription('```yaml\n' + content + '\n```')
    .setFooter(msg.author.username, msg.author.avatarURL());
  msg.channel.send(embed);
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

  throwErr(msg, 'wager');
  return false;
}

/**
 * Takes a user mention and turns it into their user id
 * @param {string} tag the tag/mentioned user
 * @returns the user's id
 */
const detag = (tag) => tag.replace("<@!", "")
                          .replace("<@", "")
                          .replace(">", "");

/**
 * Takes a \n separated string and turns it into a table
 * 
 * I would like to eventually make this function so that it can make tables
 * with a variable number of columns
 * @param {string} text 
 * @returns a table containing the given information
 */
const tablify = (text) => {
  const lines = text.split('\n');

  // gets length of longest line
  let maxLength = 0;
  lines.forEach(t => {if(t.length > maxLength) maxLength = t.length});
  maxLength += 4; // lil more room

  // top of table
  let result = '\n╔';
  for (let i = 0; i < maxLength; ++i)
    result += '═';
  result += "╗\n";

  // adds content
  lines.forEach(t => {
    result += `║ ${t}`;
    for (let i = 0; i < maxLength - t.length - 1; ++i)
      result += ' ';
    result += '║\n';

    if (t !== lines[lines.length - 1])
      result += '╠';
    else
      result += '╚'
    for (let i = 0; i < maxLength; ++i)
      result += '═';
    if (t !== lines[lines.length - 1])
      result += '╣\n'
    else
      result += '╝\n';
  });

  return result;
}

/**
 * gets the amount of Spike Bucks in a given user's wallet
 * @param {Message} msg the message sent by the user
 * @param {string} id the id related to the wallet we want to find
 */
const getWallet = (msg, id) => {
  if (id === null)
    id = msg.author.id;

  student = getStudent(id);

  const title = student.name;
  const content = tablify(`${student.wallet}`);
  basicEmbed(msg, title, content);
}

/**
 * Performs the cointoss gambling game
 * @param {Message} msg the message sent by the user
 */
const coinToss = (msg) => {
  // $cointoss [wager] [face]
  const args = msg.content.split(' ');
  
  // is it a valid wager?
  if(!validWager(msg, args[1]))
    return;

  // is it a valid coin face?
  if (args[2].toLowerCase() !== 'heads' && args[2].toLowerCase() !== 'tails') {
    throwErr(msg, 'cointoss');
    return;
  }

  // otherwise, play the game
  const wager = parseInt(args[1]);
  addBucks(msg.author.id, -wager);

  const coinState = Math.floor((Math.random() * 100) + 1) > 51;
  const face = args[2];
  let outcome = !coinState && face.toLowerCase() === 'heads' 
              ? 'tails'
              : !coinState && face.toLowerCase() === 'tails'
              ? 'heads'
              : face;

  const earnings = coinState ? Math.ceil(wager + (wager * 2.2)) : 0;
  addBucks(msg.author, earnings);

  const contents =  `${getConsts().gamble['coinImage']}` + 
                    `Called: ${face.toUpperCase()}\n` +
                    `Results: ${outcome.toUpperCase()}\n` +
                    `Earnings: ${(earnings - wager)}`;

  const title = 'Coin Toss';
  basicEmbed(msg, title, contents);
}

/**
 * Takes money from the caller and gifts it to a given user
 * @param {Message} msg the message sent by the user
 */
const gift = (msg) => {
  // gift [amt] [user]
  const args = msg.content.split(' ');
  const giftAmt = parseInt(args[1]);
  if (!validWager(msg, giftAmt))
    return;
  
  const recipient = getStudent(detag(args[2]));
  if (!recipient) {
    throwErr('gift');
    return;
  }

  addBucks(msg.author, -giftAmt);
  getDat()[detag(args[2])]['wallet'] += giftAmt;
  const contents =  `${getConsts.gamble['giftImage']}` +
                    `Amount: $${giftAmt}\n` +
                    `To: ${recipient.name}\n` +
                    `From: ${msg.author.username}`;
  basicEmbed(msg, 'Gift', contents);
}

/**
 * Displays the leaderboard and those with the fattest wallets
 * @param {Message} msg the message sent by the user
 */
const leaderboard = (msg) => {
  const keys = Object.keys(getDat());
  let users = [];
  keys.forEach(t => users.push(getDat()[t]));
  users.sort((a, b) => b.wallet - a.wallet);

  let result = '';
  for (let i = 0; i < 10; ++i)
    result += `${i + 1} | ${users[i].name} - ${users[i].wallet}\n`;
  result = result.slice(0, result.length - 1)
  basicEmbed(msg, 'Leaderboard', tablify(result));
}

const stitch = (a, b) => {
  const t1 = a.split('\n');
  const t2 = b.split('\n');
  let result = '';
  for (let i = 0; i < t1.length; ++i)
    result += `${t1[i]}${t2[i]}\n`;
  return result;
}

/**
 * plays a game of dice
 * @param {Message} msg the message sent by the user
 */
const dice = (msg) => {
  const wager = parseInt(msg.content.split(' ')[1]);
  if (!validWager(msg, wager))
    return;

  addBucks(msg.author, -wager);

  const die1 = Math.floor((Math.random() * 6) + 1);
  const die2 = Math.floor((Math.random() * 6) + 1);

  console.log(`${die1}, ${die2}`);

  const winnings = die1 === die2 && die1 === 6
                 ? wager * 6
                 : die1 === die2
                 ? Math.ceil(wager * 3.5)
                 : die1 + die2 > 7
                 ? Math.ceil(wager * 2.7)
                 : 0;

  addBucks(msg.author, winnings);

  const img = //long boi
  `${stitch(getConsts().gamble[`d${die1}0`], getConsts().gamble[`d0${die2}`])}`
  
  const content = 
    `${img}Die 1: ${die1}\nDie 2: ${die2}\nEarnings: ${winnings - wager}`;
  basicEmbed(msg, 'Dice Roll', content);
}

/**
 * plays a game of slots
 * @param {Message} msg the message sent by the user
 */
const slots = (msg) => {
  const wager = parseInt(msg.content.split(' ')[1]);
  if (!validWager(msg, wager))
    return;

  addBucks(msg.author, -wager);

  const fruit = "ABCDEFGHIJ$"; // the possibilities of the spinning wheels
  let result = [];

  for (let i = 0; i < 4; ++i) {
    result.push(fruit.charAt(Math.floor(Math.random() * fruit.length)));
  }

  let counts = [];
  result.forEach(t => {
    counts.push(
      result.join('').split(new RegExp(t === '$' ? '\\$' : t, "gi")).length - 1
    );
  });

  let earnings = 0;
  const max = Math.max(...counts);
  if (max === 2)
    earnings = 2.5;
  else if (max === 3)
    earnings = 6;
  else if (max === 4)
    earnings = 16;
  
  earnings += 2 * (result.join('')
                         .split(new RegExp( '\\$', "gi" ))
                         .length - 1);

  earnings *= wager;

  if (result[0] == '$' && result[1] == '$'
    && result[2] == '$' && result[3] == '$')
    earnings = wager * 151;

  addBucks(msg.author, earnings);
  let contents = getConsts().gamble['slotsImage'].replace(
    '#', `${result[0]} ${result[1]} ${result[2]} ${result[3]}`
  );
  contents += `Wager: ${wager}\nEarnings: ${earnings}`;
  basicEmbed(msg, 'Slots', contents);
}

/**
 * Determine where to send control
 * @param {Message} msg the message sent by the user
 */
const executeGame = (msg) => {
  console.log('Searching for game command');
  const command = msg.content.split(' ')[0].toLowerCase().slice(1);
  if (command === 'wallet')
    if (msg.content.split(' ')[1])
      getWallet(msg, detag(msg.content.split(' ')[1]));
    else
      getWallet(msg, null);
  else if (command === 'cointoss')
    coinToss(msg);
  else if (command === 'gift')
    gift(msg);
  else if (command === 'leaderboard')
    leaderboard(msg);
  else if (command === 'dice')
    dice(msg);
  else if (command === 'slots')
    slots(msg);
  else // whoops probably a shop command
    executeShop(msg);
}

module.exports = { executeGame }