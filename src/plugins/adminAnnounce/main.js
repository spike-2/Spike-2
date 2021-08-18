/**
 * @author Brandon Ingli
 * A Spike module to make and approve announcements.
 */

const spikeKit = require("../../spikeKit.js");
const fs = require("fs");
const { throwErr } = require("../../botErr.js");
const { getConsts } = require("../../faccess.js");

const NAME = "Admin Announcement";
const AUTHOR = "Brandon Ingli";
const COMMANDS = ["announce", "pendingannouncements"];

const ANNOUNCEMENTSFILENAME = "plugins/adminAnnounce/announcements.json";
const REQUIRED_APPROVALS = 2;
const APPROVE_EMOJI = "☑️";
const CANCEL_EMOJI = "❌";
const SEND_EMOJI = "📫";

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
function help(prefix, command, args) {
  return "Allows admins to approve and send announcements.";
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
function shortHelp(prefix) {
  return (
    `${prefix}announce - Allows admins to approve and send announcements.\n` +
    `${prefix}pendingannouncements - Allows admins to see pending announcements`
  );
}

/**
 * Determine if user has proper permissions
 * @param {Discord.Guild} guild guild to check permissions against
 * @param {string} id User ID
 * @returns True if member has "admin" permissions
 */
function hasPermission(guild, id) {
  const member = guild.members.cache.get(id);
  return (
    member.hasPermission("ADMINISTRATOR") ||
    member.roles.cache.has(getConsts().role.botexpert)
  );
}

/**
 * Read the active announcements from the file system.
 * @returns The active announcements on the file system, or the empty object.
 */
function getAnnouncements() {
  try {
    let ancmts = fs.readFileSync(ANNOUNCEMENTSFILENAME);
    return JSON.parse(ancmts);
  } catch (e) {
    console.error(
      `${ANNOUNCEMENTSFILENAME} Doesn't Exist or isn't readable. Using empty object instead.`
    );
    return {};
  }
}

/**
 * Writes active announcements to disk.
 * @param {Announcements} ancmts Active Announcements object
 */
function writeAnnouncements(ancmts) {
  fs.writeFileSync(ANNOUNCEMENTSFILENAME, JSON.stringify(ancmts));
}

/**
 * Get and reply with active announcements.
 * @param {Discord.Client} bot Instantiated discord client object
 * @param {Discord.Message} requestMessage Message object for the message that requested active announcements
 * @returns null
 */
async function pendingAnnouncements(bot, requestMessage) {
  const ancmts = getAnnouncements();

  if (Object.keys(ancmts).length == 0) {
    spikeKit.reply(
      spikeKit.createEmbed(
        "No Pending Announcements",
        "There are no pending announcements.",
        false,
        requestMessage.author.username,
        requestMessage.author.avatarURL()
      ),
      requestMessage
    );
    return;
  }

  let ancmtsString =
    "Click on an announcement title to visit that message and react.\n---\n";
  for (const [ancmtId, ancmt] of Object.entries(ancmts)) {
    const message = await bot.channels.cache
      .get(ancmt.channelID)
      .messages.fetch(ancmt.messageID);
    const ancmtAuthor = await bot.users.fetch(ancmt.createdBy);
    ancmtsString += `**[${ancmt.title}](${message.url})**\n*Created by ${ancmtAuthor.username}*\n---\n`;
  }
  const embedToSend = spikeKit.createEmbed(
    "Pending Announcements",
    ancmtsString,
    false,
    requestMessage.author.username,
    requestMessage.author.avatarURL()
  );
  spikeKit.reply(embedToSend, requestMessage);
}

/**
 * Create a new announcement
 * Message format: $command Title ; Description
 * Assuming proper permissions have been checked
 * @param {string} args Arguments from command invocation
 * @param {Discord.Client} bot instantiated discord bot object
 * @param {Discord.Message} message discord message object that sent this request
 */
async function newAnnouncement(args, bot, message) {
  let ancmts = getAnnouncements();
  const ancmtParts = args.split(";");
  if (ancmtParts.length != 2) {
    throwErr(message, "invalidAnnouncePartsErr");
    console.error(
      `Admin Announce: ancmtParts wrong length. Expected 2, got ${ancmtParts.length}`
    );
  }

  let ancmtId = Date.now();

  let ancmt = {
    channelID: message.channel.id,
    messageID: null,
    title: ancmtParts[0].trim(),
    description: ancmtParts[1].trim(),
    createdBy: message.author.id,
    approvals: [],
    approved: false,
  };

  const embed = spikeKit.createEmbed(
    `Admin Announcement: ${ancmt.title}`,
    ancmt.description,
    false,
    message.author.username,
    message.author.avatarURL()
  );
  await spikeKit.reply(embed, message);

  const getLastMessage = await message.channel.messages.fetch({ limit: 1 });
  const lastMessage = getLastMessage.first();
  ancmt.messageID = lastMessage.id;

  ancmts[ancmtId] = ancmt;
  writeAnnouncements(ancmts);

  message.delete();

  await lastMessage.react(APPROVE_EMOJI);
  await lastMessage.react(CANCEL_EMOJI);

  console.log(`Announcement ${ancmtId} successfully set up!`);
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message) {
  if (!hasPermission(message.guild, message.author.id)) {
    throwErr(message, "invalidPermsErr");
    return;
  }

  if (command === "announce") {
    newAnnouncement(args, bot, message);
  } else if (command === "pendingannouncements") {
    pendingAnnouncements(bot, message);
  }
}

/**
 * Handles reactions added/removed to embeds sent by this plugin. To receive anything in this function, plugins must...
 *  + Have this function exported
 *  + Send a message as an embed through Spike (or Simone)
 *  + Have the sent message cached. Either the message was sent during the current running session of the bot, or cached using onBotStart
 *  + The title of the embed starts with `${NAME}: `
 *  + A user other than Spike (or Simone) added or removed the reaction
 * @param {Discord.MessageReaction} reaction Message Reaction object for the reaction added/removed.
 * @param {Discord.User} user User who applied reaction/User whose reaction was removed.
 * @param {boolean} add True if reaction added, False if removed.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
async function processReaction(reaction, user, add, bot) {
  if (add && !hasPermission(reaction.message.guild, user.id)) {
    reaction.users.remove(user.id);
    return;
  }

  // Get the announcement
  let ancmts = getAnnouncements();
  const thisAncmtReduced = Object.entries(ancmts).filter(
    ([k, a]) =>
      a.channelID == reaction.message.channel.id &&
      a.messageID == reaction.message.id
  );
  if (thisAncmtReduced.length != 1) {
    throwErr(reaction.message, "multipleMessageReaction");
    // prettier-ignore
    console.error(`Admin Announcement: Expected to find one announcement, got ${thisAncmtReduced.length}`);
    return;
  }

  const [thisAncmtID, thisAncmt] = thisAncmtReduced[0];

  // Adding approval
  if (
    add &&
    reaction.emoji.name === APPROVE_EMOJI &&
    !ancmts[thisAncmtID].approvals.includes(user.id)
  ) {
    ancmts[thisAncmtID].approvals.push(user.id);

    if (
      ancmts[thisAncmtID].approvals.length >= REQUIRED_APPROVALS &&
      !ancmts[thisAncmtID].approved
    ) {
      ancmts[thisAncmtID].approved = true;
      await reaction.message.react(SEND_EMOJI);
    }

    writeAnnouncements(ancmts);
  }

  // Removing approval
  else if (
    !add &&
    reaction.emoji.name === APPROVE_EMOJI &&
    ancmts[thisAncmtID].approvals.includes(user.id)
  ) {
    ancmts[thisAncmtID].approvals.splice(
      ancmts[thisAncmtID].approvals.indexOf(user.id),
      1
    );

    if (
      ancmts[thisAncmtID].approvals.length < REQUIRED_APPROVALS &&
      ancmts[thisAncmtID].approved
    ) {
      ancmts[thisAncmtID].approved = false;
      await reaction.message.reactions.resolve(SEND_EMOJI).remove();
    }

    writeAnnouncements(ancmts);
  }

  // Cancelling
  else if (add && reaction.emoji.name === CANCEL_EMOJI) {
    if (ancmts[thisAncmtID].createdBy === user.id) {
      reaction.message.delete();
      spikeKit.reply(
        spikeKit.createEmbed(
          "Announcement Cancelled",
          `Announcement "${ancmts[thisAncmtID].title}" cancelled.`,
          false,
          user.username,
          user.avatarURL()
        ),
        reaction.message
      );
      delete ancmts[thisAncmtID];
      writeAnnouncements(ancmts);
    } else {
      reaction.users.remove(user.id);
    }
  }

  // Sending
  else if (add && reaction.emoji.name === SEND_EMOJI) {
    // Send the announcement
    spikeKit.send(
      spikeKit.createEmbed(
        ancmts[thisAncmtID].title,
        `@everyone\n${ancmts[thisAncmtID].description}`,
        false,
        user.username,
        user.avatarURL()
      ),
      "announcements",
      bot
    );

    // Deal with original message.
    reaction.message.delete();
    spikeKit.reply(
      spikeKit.createEmbed(
        "Announcement Sent",
        `Announcement "${ancmts[thisAncmtID].title}" sent`,
        false,
        user.username,
        user.avatarURL()
      ),
      reaction.message
    );
    delete ancmts[thisAncmtID];
    writeAnnouncements(ancmts);
  }
}

/**
 * Runs when the bot is first started if exported below.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function onBotStart(bot) {
  // Cache all pending announcements
  const ancmts = getAnnouncements();
  if (Object.keys(ancmts).length > 0) {
    for (const [id, ancmt] of Object.entries(ancmts)) {
      console.log(`Caching announcement ${ancmt.title}`);
      bot.channels.cache.get(ancmt.channelID).messages.fetch(ancmt.messageID);
    }
  }
  console.log(`${NAME} has started.`);
}

module.exports = {
  NAME,
  shortHelp,
  AUTHOR,
  COMMANDS,
  help,
  processCommand,
  processReaction,
  onBotStart,
};
