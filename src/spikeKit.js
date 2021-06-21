/**
 * A one stop shop for all things a Spike Plugin could need!
 */

const Discord = require("discord.js");

const COLORS = {
  "PURPLE": 0xcc00ff
};

/**
 * Reply to a message
 * @param message {Discord.Message} Message you will be replying to.
 * @param {string} title Title of the reply embed.
 * @param {string} content Content of the reply embed.
 * @param {boolean} [monotype=false] True if the content should be monospace (```yaml).
 */
function reply(message, title, content, monotype=false){
  const embed = new Discord.MessageEmbed()
  .setColor(COLORS.PURPLE)
  .setTitle(title)
  .setDescription(monotype ? ('```yaml\n' + content + '\n```') : (content))
  .setFooter(message.author.username, message.author.avatarURL());
  message.channel.send(embed);
};

module.exports = {reply};