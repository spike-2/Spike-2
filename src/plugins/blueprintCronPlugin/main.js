/**
 * A blueprint for a SpikeKit Cron Plugin.
 * This type of plugin runs things on an interval and DOES NOT handle commands.
 * startCron() is called on bot start. This plugin should then handle intervals.
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../../spikeKit.js");
/**
 * Provides an Asynchronous alternative to setInverval().
 */
const {AsyncInterval} = require("../../asyncInterval.js");

/**
 * The display name of the plugin.
 */
const NAME = "The Name";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Some Person";

/**
 * Called to start tasks on an interval.
 * @param {Discord.Client} bot Instantiated Discord Bot object.
 */
function startCron(bot){

}

module.exports = {NAME, AUTHOR, startCron};