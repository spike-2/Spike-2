/**
 * @author Joshua Maxwell
 * This file contains the Spike Shop
 */

const Discord = require('discord.js');
const {throwErr} = require('./botErr.js')
const {getStudent, addBucks, getConsts} = require('./faccess.js');

/**
 * Creates an embed
 * @param {Message} msg the message sent by the user
 * @param {String} title title for the embed
 * @param {String} content description for the embed
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
 * displays the shop text so people know what's for sale
 * @param {Message} msg the message sent by the user 
 */
const shop = (msg) => basicEmbed(msg, 'Spike Shop', getConsts().gamble.shopText)

/**
 * facilitates a user's purchase
 * @param {Message} msg the message sent by the user
 */
const buy = (msg) => {
  // [role id, price]
  const EMOJIS_ROLE = ['692222442801987635', 5000];
  const SLOTS_ROLE = ['810249172606910494', 10000];
  const ECHO_ROLE = ['809151273554804806', 15000];
  const HIGHROLLER_ROLE = ['809127293955211274', 30000];

  // what did they pick?
  const buyName = msg.content.split(' ')[1].toLowerCase();
  let choice;
  if (buyName === 'textemojis')
    choice = EMOJIS_ROLE;
  else if (buyName === 'slots')
    choice = SLOTS_ROLE;
  else if (buyName === 'echo')
    choice = ECHO_ROLE;
  else if (buyName === 'highroller')
    choice = HIGHROLLER_ROLE;
  else {
    throwErr(msg, 'noItemErr');
    return;
  }

  // do they own it?
  if (msg.member.roles.cache.has(choice[0])) {
    throwErr(msg, 'ownedItemErr');
    return;
  }
  //do they have the money?
  else if (getStudent(msg.author.id)['wallet'] < choice[1]) {
    throwErr(msg, 'tooPoorErr');
    return;
  }

  addBucks(msg.author, -choice[1]);
  msg.member.roles.add(choice[0]);

  const roleName = msg.guild.roles.resolve(choice[0]).name
  basicEmbed(msg, 'Purchase Confirmation', 
                  `You have purchased ${msg.content.split(' ')[1]} ` +
                  `for ${choice[1]} Spike Bucks.\nPlease come again!`);
}

/**
 * moves control to the given function
 * @param {Message} msg the message sent by the user
 */
const executeShop = (msg) => {
  const command = msg.content.split(' ')[0].toLowerCase().slice(1);
  if (command.toLowerCase() === 'shop')
    shop(msg);
  else if (command.toLowerCase() === 'buy')
    buy(msg);
}

module.exports = {executeShop}