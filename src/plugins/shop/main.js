/**
 * @author Joshua Maxwell
 * @author Brandon Ingli
 * The Spike Store
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../../spikeKit.js");
const {throwErr} = require('../../botErr.js')
const {getStudent, addBucks} = require('../../faccess.js');

/**
 * The display name of the plugin.
 */
const NAME = "Spike Store";
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

/**
 * Handles help requests for this plugin.
 * @param {string} prefix The command prefix.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @returns Help text to be sent back to the user.
 */
 function help(prefix, command, args) {
  if (command == "shop"){
    return shop(prefix);
  } else if (command == "buy"){
    return `${prefix}buy [item]\nYou can use this command to make purchases from the Spike Shop. If you don't have enough money, talk more or try gambling!`;
  }
}

/**
 * Generates help text for the main help screen.
 * @param {string} prefix The command prefix.
 * @returns Help text for the main help screen.
 */
 function shortHelp(prefix){
  return `${prefix}help shop - See what's for sale.
${prefix}buy - Buy something.`
}

/**
 * the shop text so people know what's for sale
 */
 const shop = (prefix) => { return `Here's what's for sale!
'${prefix}buy textemojis' (Preorder): $5000 - A whole new list of text emojis!
'${prefix}buy slots': $10000 - Play the slot machine as much as you want and make that money!
'${prefix}buy echo': $15000 - When you type ${prefix}echo [text], you can make Spike say anything!
'${prefix}buy highroller': $30000 - An exclusive role, only obtainable by the best gamblers!`;
}

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

   spikeKit.reply(
     spikeKit.createEmbed(
       "Purchase Confirmation",
       `You have purchased ${msg.content.split(' ')[1]} ` +
       `for ${choice[1]} Spike Bucks.\nPlease come again!`,
       true,
       msg.author.username,
       msg.author.avatarURL()
     ),
     msg
   );
 }

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message){
  if (command == "shop"){
    spikeKit.reply(
      spikeKit.createEmbed(
        "Spike Shop",
        "Please use the help menu to see what's for sale.",
        true,
        message.author.username,
        message.author.avatarURL()
      ),
      message
    )
  } else if (command == "buy"){
    buy(message);
  }
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};