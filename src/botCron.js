/**
 * @author Brandon Ingli
 * This file handles tasks that run on some sort of schedule or interval.
 */

const plugins = [require("./plugins/itsServiceNotes/main.js")];

const spikeKit = require("./spikeKit.js");

/**
 * Starts all bot jobs that run on a timer or schedule.
 * @param {Discord.Client} bot instantiated Discord Client
 */
const startJobs = (bot) => {
  for (plugin of plugins) {
    spikeKit.logger.log("debug", `Starting Cron Job for ${plugin.NAME}...`);
    plugin.startCron(bot);
  }
  spikeKit.logger.log("debug", "Done Starting Cron Jobs.");
};

module.exports = { startJobs };
