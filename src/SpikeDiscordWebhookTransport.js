const DiscordWebhookTransport = require("@typicalninja21/discord-winston");
const spikeKit = require("./spikeKit.js");

// prettier-ignore
module.exports = class SpikeDiscordWebhookTransport extends DiscordWebhookTransport {
  log(info, callback) {
    try {
      if (info.postToDiscord == false) return callback();
      this.postToWebhook(info);
      return callback();
    } catch (e) {
      spikeKit.logger.error(`Error occurred trying to log to Discord: ${e.stack}`, {
        postToDiscord: false,
      });
    }
  }
};
