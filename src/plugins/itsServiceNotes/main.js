/**
 * A plugin that retrieves and sends new ITS service notes.
 */

/**
 * A one stop shop for all things a Spike Plugin could need!
 */
const spikeKit = require("../../spikeKit.js");
/**
 * Provides an Asynchronous alternative to setInverval().
 */
const { AsyncInterval } = require("../../asyncInterval.js");

const its = require("./truman-its-service-notes.js");

/**
 * The display name of the plugin.
 */
const NAME = "ITS Service Notes";
/**
 * Slug used to programmatically refer to the plugin. Lowercase letters, numbers, and dashes only.
 */
const SLUG = "its-service-notes";
/**
 * The author(s) of this plugin.
 */
const AUTHOR = "Brandon Ingli";

/**
 * Called to start tasks on an interval.
 * @param {Discord.Client} bot Instantiated Discord Bot object.
 */
function startCron(bot) {
  const asyncInterval = new AsyncInterval(async function () {
    try {
      const messages = await its.getNewServiceNotes();
      for (const message of messages) {
        const embed = spikeKit.createEmbed(
          `ITS Service Note: ${message.title}`,
          message.content,
          false,
          `Posted ${message.updated.toUTCString()}`,
          null
        );
        spikeKit.send(embed, "bot-commands", bot);
      }
    } catch (e) {
      spikeKit.logger.error(`ITS Service Notes error: ${e}`);
    }
  }, 10 * spikeKit.MINUTE);
  asyncInterval.start();
}

module.exports = { NAME, SLUG, AUTHOR, startCron };
