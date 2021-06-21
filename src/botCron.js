/**
 * @author Brandon Ingli
 * This file handles tasks that run on some sort of schedule or interval.
 */

const plugins = [require("./itsServiceNotes/main.js")];

/**
 * Starts all bot jobs that run on a timer or schedule.
 * @param {Discord.Client} bot instantiated Discord Client
 */
const startJobs = (bot) => {
  for (plugin of plugins){
    console.log(`Starting Cron Job for ${plugin.NAME}...`)
    plugin.startCron(bot);
  }
  console.log("Done Starting Cron Jobs.");
};

module.exports = {startJobs};