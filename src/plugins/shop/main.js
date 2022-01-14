/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * The Spike Store
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../../spikeKit.js");
const { getStudent, addBucks, getConsts } = require("../../faccess.js");

/**
 * The display name of the plugin.
 */
const NAME = "Spike Store";
/**
 * Slug used to programmatically refer to the plugin. Lowercase letters, numbers, and dashes only.
 */
const SLUG = "spike-store";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Joshua Maxwell and Brandon Ingli";
/**
 * Commands supported by this plugin. Do not include the prefix.
 * Good: command
 * Bad: $command
 */
const COMMANDS = ["shop", "buy"];

const ITEMS = {
  textemojis: {
    roleName: "emoji", // Name in consts.json
    price: 5000,
    description:
      "Get access to premium text emojis! Use Discord's slash commands to access.",
    forSale: true,
  },
  slots: {
    roleName: "slots",
    price: 10000,
    description:
      "Play the slot machine as much as you want and make that money!",
    forSale: true,
  },
  echo: {
    roleName: "echo",
    price: 15000,
    description:
      "Use the `echo` command to make Spike say anything! Not available in all channels.",
    forSale: true,
  },
  highroller: {
    roleName: "highroller",
    price: 30000,
    description: "An exclusive role, only obtainable by the best gamblers!",
    forSale: true,
  },
  foundingbulldog: {
    roleName: "founding",
    price: 250,
    description:
      "[ON SALE FOR A LIMITED TIME] You were there when Spike left beta! Enjoy being distinguished in the roles list and other future perks!",
    forSale: true,
  },
  earlyaccess: {
    roleName: "earlyaccess",
    price: 5000,
    description:
      "Unlock early access to select new features. Be the early adopter you know you are.",
    forSale: true,
  },
  "2xmult": {
    roleName: "2xmult",
    price: 10000,
    description:
      "Earn double the Spike Bucks for every message sent! Only the highest multiplier owned is applied.",
    forSale: false,
  },
  "3xmult": {
    roleName: "3xmult",
    price: 20000,
    description:
      "Earn triple the Spike Bucks for every message sent! Only the highest multiplier owned is applied.",
    forSale: false,
  },
  "4xmult": {
    roleName: "4xmult",
    price: 30000,
    description:
      "Earn quadruple the Spike Bucks for every message sent! Only the highest multiplier owned is applied.",
    forSale: false,
  },
};

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
function help(prefix, command, args) {
  if (command == "shop") {
    return shop(prefix);
  } else if (command == "buy") {
    return `${prefix}buy [item]\nYou can use this command to make purchases from the Spike Shop. If you don't have enough money, talk more or try gambling!`;
  }
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
function shortHelp(prefix) {
  return `${prefix}help shop - See what's for sale.
${prefix}buy - Buy something.`;
}

/**
 * the shop text so people know what's for sale
 */
const shop = (prefix) => {
  let text = "Here's what's for sale!\n\n";
  for (const [key, info] of Object.entries(ITEMS)) {
    if (info.forSale) {
      text += `\`${prefix}buy ${key}\`: \$${info.price} - ${info.description}\n\n`;
    }
  }
  return text;
};

/**
 * facilitates a user's purchase
 */
const buy = (msg, arg) => {
  const roles = getConsts()["role"];

  // what did they pick?
  const buyName = arg.toLowerCase().trim();
  let choice;
  if (Object.keys(ITEMS).includes(buyName) && ITEMS[buyName].forSale) {
    choice = ITEMS[buyName];
  } else {
    spikeKit.throwErr(msg, "noItemErr");
    return;
  }

  // do they own it?
  if (msg.member.roles.cache.has(roles[choice.roleName])) {
    spikeKit.throwErr(msg, "ownedItemErr");
    return;
  }
  //do they have the money?
  else if (getStudent(msg.author.id)["wallet"] < choice.price) {
    spikeKit.throwErr(msg, "tooPoorErr");
    return;
  }

  addBucks(msg.author, -1 * choice.price);
  msg.member.roles.add(roles[choice.roleName]);

  spikeKit.reply(
    spikeKit.createEmbed(
      "Purchase Confirmation",
      `You have purchased ${buyName} ` +
        `for \$${choice.price} Spike Bucks.\nPlease come again!`,
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message) {
  if (command == "shop") {
    spikeKit.reply(
      spikeKit.createEmbed(
        "Spike Shop",
        "Please use the help menu to see what's for sale.",
        true,
        message.author.username,
        message.author.avatarURL()
      ),
      message
    );
  } else if (command == "buy") {
    buy(message, args);
  }
}

module.exports = {
  NAME,
  SLUG,
  shortHelp,
  AUTHOR,
  COMMANDS,
  help,
  processCommand,
};
