/**
 * A one stop shop for all things a Spike Plugin could need!
 */

const Discord = require("discord.js");
const {getConsts} = require("./faccess.js");

const COLORS = {
  "PURPLE": 0xcc00ff
};

/**
 * Get the Channel ID of a given channel name.
 * @param {string} channelName Channel name without the leading #.
 * @returns Channel ID of the given channel.
 * @throws "Channel not found" if the given channel name is not in our records.
 */
function getChannelID(channelName){
  const channels = getConsts().channel;
  if (channels.includes(channelName)){
    return channels[channelName];
  } else {
    throw 'Channel not found';
  }
}

/**
 * Send a message to a channel.
 * @param {string | Discord.MessageEmbed} content The content to include in the message.
 * @param {number} channel The channel ID to send this message to.
 * @param {Discord.Client} bot Instantiated Discord Client.
 */
function send(content, channel, bot){
  bot.channels.cache.get(channel).send(content);
};

/**
 * Reply to an inbound message.
 * @param {string | Discord.MessageEmbed} content The content to include in the message.
 * @param {Discord.Message} message The message object to reply to.
 */
function reply(content, message){
  message.channel.send(content)
};

/**
 * 
 * @param {string} title Title of the embed.
 * @param {string} content Content of the embed.
 * @param {boolean} [monotype=false] True if the content should be monospace (```yaml).
 * @param {string} [footer=null] Footer text of the embed.
 * @param {string} [footerImageURL=null] Fully qualified URL to image to include in footer.
 * @returns {Discord.MessageEmbed} Embed to send on via another function.
 */
function createEmbed(title, content, monotype=false, footer=null, footerImageURL=null){
  return new Discord.MessageEmbed()
    .setColor(COLORS.PURPLE)
    .setTitle(title)
    .setDescription(monotype ? ('```yaml\n' + content + '\n```') : (content))
    .setFooter(footer, footerImageURL);
}

module.exports = {getChannelID, send, reply, createEmbed};