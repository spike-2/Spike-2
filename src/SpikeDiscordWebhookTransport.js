const DiscordWebhookTransport = require("@typicalninja21/discord-winston");

// prettier-ignore
module.exports = class SpikeDiscordWebhookTransport extends DiscordWebhookTransport {
  log(info, callback) {
    if (info.postToDiscord == false) return callback();
    this.postToWebhook(info);
    return callback();
  }
};
