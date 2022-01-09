/**
 * A one stop shop for all things a Spike Plugin could need!
 */

const Discord = require("discord.js");
const { getConsts, getErrs } = require("./faccess.js");
let logger;
let IS_PROD = true;

const COLORS = {
  PURPLE: 0x510c76,
  RED: 0xfc0004,
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
 * @param {string | int} channel The channel name (without the leading #) or channel ID to send this message to.
 * @param {Discord.Client} bot Instantiated Discord Client.
 * @param {Discord.User[]} [mention=null] An array of users to mention. Will add to the beginning of the content (even for embeds)
 * @throws "Invalid bot" if the bot is not properly provided.
 * @throws "Embed not provided" if Embed is not properly provided.
 * @throws "Channel not found"  if the given channel name is not in our records.
 */
async function send(content, channel, bot, mention = false) {
  if (
    !(content instanceof Discord.MessageEmbed || typeof content === "string")
  ) {
    throw "Embed or String not provided";
  }
  if (!(bot instanceof Discord.Client)) {
    throw "Invalid bot";
  }
  if (!/\d+/.test(channel)) {
    channel = getChannelID(channel);
  }

  let messageData = {};
  if (content instanceof Discord.MessageEmbed) {
    messageData.embeds = [content];
  } else {
    messageData.content = `${content}`;
  }

  if (mention && mention.length > 0) {
    let mentionString = "";
    for (const user of mention) {
      mentionString += `${user} `;
    }
    messageData.content = `${mentionString}${messageData.content ?? ""}`;
  }

  const channelObj = bot.channels.cache.get(channel);
  // prettier-ignore
  this.logger.log(
    "debug",
    `Sending message to channel #${channelObj.name} : ${content instanceof Discord.MessageEmbed ? `[${content.title}] ${content.description}` : content}`
  );
  await channelObj.send(messageData);
}

/**
 * Reply to an inbound message.
 * @param {Discord.MessageEmbed|String} content The content to include in the message.
 * @param {Discord.Message} message The message object to reply to.
 * @param {boolean} [mention=false] Mention the user you're replying to.
 * @throws "Embed not provided" if Embed is not properly provided.
 * @throws "Invalid message" if the message object is not properly provided.
 */
async function reply(content, message, mention = false) {
  if (
    !(content instanceof Discord.MessageEmbed || typeof content === "string")
  ) {
    throw "Embed or String not provided";
  }
  if (!(message instanceof Discord.Message)) {
    throw "Invalid message";
  }

  let messageData = {};
  if (content instanceof Discord.MessageEmbed) {
    messageData.embeds = [content];
  } else {
    messageData.content = `${content}`;
  }

  messageData.allowedMentions = {};
  messageData.allowedMentions.repliedUser = mention;
  messageData.failIfNotExists = false;

  // prettier-ignore
  this.logger.log(
    "debug",
    `Replying to ${message.url} : ${content instanceof Discord.MessageEmbed ? `[${content.title}] ${content.description}` : content}`
  );
  await message.reply(messageData);
}

/**
 *
 * @param {string} title Title of the embed.
 * @param {string} content Content of the embed.
 * @param {boolean} [monotype=false] True if the content should be monospace (```yaml).
 * @param {string} [footer=null] Footer text of the embed.
 * @param {string} [footerImageURL=null] Fully qualified URL to image to include in footer.
 * @param {SpikeKit.COLORS} [color=COLORS.PURPLE] Color for the embed. If not defined in enum, embed will be purple.
 * @returns {Discord.MessageEmbed} Embed to send on via another function.
 */
function createEmbed(
  title,
  content,
  monotype = false,
  footer = null,
  footerImageURL = null,
  color = COLORS.PURPLE
) {
  if (!Object.values(COLORS).includes(color)) {
    color = COLORS.PURPLE;
  }
  return new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(`${title}`)
    .setDescription(monotype ? `\`\`\`yaml\n${content}\n\`\`\`` : `${content}`)
    .setFooter(`${footer}`, footerImageURL);
}

/**
 * Send an error defined in errors.json. To send a custom error,
 * send an embed with COLORS.RED color and monotype.
 * @param {Discord.Message} msg message sent by user
 * @param {string} key Key of the error to send.
 */
async function throwErr(msg, key) {
  const errs = getErrs();
  let selectedError = {
    title: "Unknown Error",
    description: `An unknown error occurred: ${key}`,
  };

  if (!Object.keys(errs).includes(key)) {
    this.logger.warn(`Invalid error key: ${key}`);
  } else {
    selectedError = errs[key];
  }

  await reply(
    createEmbed(
      selectedError.title,
      selectedError.description,
      true,
      msg.author.username,
      msg.author.avatarURL(),
      COLORS.RED
    ),
    msg
  );
}

module.exports = {
  SECOND,
  MINUTE,
  HOUR,
  COLORS,
  IS_PROD,
  send,
  reply,
  createEmbed,
  throwErr,
  logger,
};
