const { getConsts } = require("./faccess.js");
const spikeKit = require("./spikeKit.js");

const verify = (message, bot, PREFIX) => {
  message.delete();

  if (message.content === `${PREFIX}verify`) {
    const e = spikeKit.createEmbed(
      "Request sent!",
      getConsts().verify["sent-msg"],
      false,
      message.author.username,
      message.author.avatarURL(),
      spikeKit.COLORS.PURPLE
    );
    spikeKit.send(e, "bot-commands", bot, [message.author]);

    const title = `User "${message.author.username}" unmute request`;
    const content = `${message.author} has requested to be unmuted`;
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
    const content = getConsts().verify["muted-msg"].replace(
      "${PREFIX}",
      `${PREFIX}`
    );
    const e = spikeKit.createEmbed(
      "Unverified",
      content,
      false,
      message.author.username,
      message.author.avatarURL(),
      spikeKit.COLORS.RED
    );
    spikeKit.send(e, "bot-commands", bot, [message.author]);
  }
};

const alreadyVerified = (message, bot) => {
  spikeKit.send(
    spikeKit.createEmbed(
      `Already Verified!`,
      `You're already verified, ${message.author}! Enjoy the server!`,
      false,
      `${message.author.username}`,
      message.author.avatarURL(),
      spikeKit.COLORS.PURPLE
    ),
    "bot-commands",
    bot,
    [message.author]
  );
  message.delete();
};

module.exports = { verify, alreadyVerified };
