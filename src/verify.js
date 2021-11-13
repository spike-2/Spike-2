const { getConsts } = require("./faccess.js");
const spikeKit = require("./spikeKit.js");

const verify = (message, bot) => {
  message.delete();

  if (message.content === "$verify") {
    const e = spikeKit.createEmbed(
      "Request sent!",
      getConsts().verify["sent-msg"],
      false,
      message.author.username,
      message.author.avatarURL(),
      spikeKit.COLORS.PURPLE
    );
    spikeKit.send(e, "bot-commands", bot);

    const title = `User "${message.author.username}" unmute request`;
    const content = `<@${message.author.id}> has requested to be unmuted`;
    const f = spikeKit.createEmbed(
      title,
      content,
      false,
      message.author.username,
      message.author.avatarURL(),
      spikeKit.COLORS.PURPLE
    );
    spikeKit.send(f, "admin-notifications", bot);
  } else {
    const content = `<@${message.author.id}> ${
      getConsts().verify["muted-msg"]
    }`;
    const e = spikeKit.createEmbed(
      "Unverified",
      content,
      false,
      message.author.username,
      message.author.avatarURL(),
      spikeKit.COLORS.RED
    );
    spikeKit.send(e, "bot-commands", bot);
  }
};

module.exports = { verify };
