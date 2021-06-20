/**
 * @author Brandon Ingli
 * This file handles tasks that run on some sort of schedule or interval.
 */

const Discord = require('discord.js');
const {getConsts} = require('./faccess.js');
const its = require('./truman-its-service-notes.js');
const asyncint = require('./asyncInterval.js');

// Time Constants for convenience
const SECOND = 1000;
const MINUTE = 60*SECOND;

/**
 * Starts all bot jobs that run on a timer or schedule.
 * @param {Discord.Client} bot instantiated Discord Client
 */
const startJobs = (bot) => {
  itsMessages(bot);
};

/**
 * Checks for new ITS messages, and sends them if there are new ones.
 */
const itsMessages = (bot) => {
  const asyncInterval = new asyncint.AsyncInterval(
    async function(){
      const messages = await its.getNewServiceNotes();
      for (const message of messages){
        const embed = new Discord.MessageEmbed()
          .setColor(0xcc00ff)
          .setTitle(message.title)
          .setDescription('\n' + message.content + '\n')
          .setFooter("Posted " + message.updated.toUTCString());
        bot.channels.cache.get(getConsts().channel['bot-commands']).send(embed);
      }
    }, 
    10*MINUTE
  );
  asyncInterval.start();
}

module.exports = {startJobs};