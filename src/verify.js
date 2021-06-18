const {getConsts} = require('./faccess.js');
const Discord = require('discord.js');

/**
 * Creates an embed
 * @param {Message} msg the message sent by the user
 * @param {String} title title for the embed
 * @param {String} content description for the embed
 */
 const buildEmbed = (msg, title, content) => {
  const embed = new Discord.MessageEmbed()
    .setColor(0xcc00ff)
    .setTitle(title)
    .setDescription('\n' + content + '\n')
    .setFooter(msg.author.username, msg.author.avatarURL());

  return embed;
}

const verify = (message, bot) => {
  message.delete();
    
  if (message.content === '$verify') {
    const e = 
      buildEmbed(message, "Request sent!", getConsts().verify['sent-msg'])
    bot.channels.cache.get(getConsts().channel['bot-commands']).send(e);

    const title = `User "${message.author.username}" unmute request`
    const content = `<@${message.author.id}> has requested to be unmuted`;
    const f = buildEmbed(message, title, content);
    bot.channels.cache.get(getConsts().channel['admin-notifications'])
      .send(f); 
  }
  else {
    const content = 
      `<@${message.author.id}> ${getConsts().verify['muted-msg']}`;
    const e = buildEmbed(message, "Unverified", content);
    bot.channels.cache.get(getConsts().channel['bot-commands']).send(e);
    
  }
}

module.exports = {verify}
