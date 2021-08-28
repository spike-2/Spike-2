/**
 * A one stop shop for all things a Spike Plugin could need!
 */

const Discord = require("discord.js");
const { getConsts } = require("./faccess.js");

const COLORS = {
  PURPLE: 0xcc00ff,
};

// Time Constants for convenience
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/**
 * Get the Channel ID of a given channel name.
 * @param {string} channelName Channel name without the leading #.
 * @returns Channel ID of the given channel.
 * @throws "Channel not found" if the given channel name is not in our records.
 */
function getChannelID(channelName) {
  const channels = getConsts().channel;
  if (Object.keys(channels).includes(channelName)) {
    return channels[channelName];
  } else {
    throw "Channel not found";
  }
}

/**
 * Send a message to a channel of your choice.
 * @param {Discord.MessageEmbed|String} content The content to include in the message.
 * @param {string} channel The channel name (without the leading #) to send this message to.
 * @param {Discord.Client} bot Instantiated Discord Client.
 * @throws "Invalid bot" if the bot is not properly provided.
 * @throws "Embed not provided" if Embed is not properly provided.
 * @throws "Channel not found"  if the given channel name is not in our records.
 */
async function send(content, channel, bot) {
  if (
    !(content instanceof Discord.MessageEmbed || typeof content === "string")
  ) {
    throw "Embed or String not provided";
  }
  if (!(bot instanceof Discord.Client)) {
    throw "Invalid bot";
  }
  await bot.channels.cache.get(getChannelID(channel)).send(content);
}

/**
 * Reply to an inbound message.
 * @param {Discord.MessageEmbed|String} content The content to include in the message.
 * @param {Discord.Message} message The message object to reply to.
 * @throws "Embed not provided" if Embed is not properly provided.
 * @throws "Invalid message" if the message object is not properly provided.
 */
async function reply(content, message) {
  if (
    !(content instanceof Discord.MessageEmbed || typeof content === "string")
  ) {
    throw "Embed or String not provided";
  }
  if (!(message instanceof Discord.Message)) {
    throw "Invalid message";
  }
  await message.channel.send(content);
}

/**
 *
 * @param {string} title Title of the embed.
 * @param {string} content Content of the embed.
 * @param {boolean} [monotype=false] True if the content should be monospace (```yaml).
 * @param {string} [footer=null] Footer text of the embed.
 * @param {string} [footerImageURL=null] Fully qualified URL to image to include in footer.
 * @returns {Discord.MessageEmbed} Embed to send on via another function.
 */
function createEmbed(
  title,
  content,
  monotype = false,
  footer = null,
  footerImageURL = null
) {
  return new Discord.MessageEmbed()
    .setColor(COLORS.PURPLE)
    .setTitle(title)
    .setDescription(monotype ? "```yaml\n" + content + "\n```" : content)
    .setFooter(footer, footerImageURL);
}

module.exports = { SECOND, MINUTE, HOUR, send, reply, createEmbed };
