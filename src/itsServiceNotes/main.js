/**
 * A blueprint for a SpikeKit Cron Plugin.
 * This type of plugin runs things on an interval and DOES NOT handle commands.
 * startCron() is called on bot start. This plugin should then handle intervals.
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../spikeKit.js");
/**
 * Provides an Asynchronous alternative to setInverval().
 */
const {AsyncInterval} = require("../asyncInterval.js");

const its = require("./truman-its-service-notes.js");

/**
 * The display name of the plugin.
 */
const NAME = "ITS Service Notes";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Brandon Ingli";

/**
 * Called to start tasks on an interval.
 * @param {Discord.Client} bot Instantiated Discord Bot object.
 */
function startCron(bot){
  const asyncInterval = new AsyncInterval(
    async function(){
      const messages = await its.getNewServiceNotes();
      for (const message of messages){
        const embed = spikeKit.createEmbed(
          message.title,
          message.content,
          false,
          `Posted ${message.updated.toUTCString()}`,
          null
        );
        spikeKit.send(embed, "bot-lab", bot);
      }
    }, 
    10*spikeKit.MINUTE
  );
  asyncInterval.start();
}

module.exports = {NAME, AUTHOR, startCron};