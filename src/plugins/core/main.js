/**
 * @author Joshua Maxwell
 */

const spikeKit = require("../../spikeKit.js");
const { getPackage, getConsts } = require("../../faccess.js");
const https = require("https");
const { getLastCommit } = require("git-last-commit");

const NAME = "Core";
const SLUG = "core";
const AUTHOR = "Joshua Maxwell and Brandon Ingli";
const COMMANDS = [
  "remindme",
  "embedify",
  "echo",
  "clear",
  "info",
  "bug",
  "request",
  "pr",
  "wiki",
  "getavatar",
];

function help(prefix, command, args) {
  switch (command) {
    case "remindme":
      return `${prefix}remindme [HH:MM:SS] [text]\nSend a reminder message to the same channel in the given time.`;
    case "embedify":
      return `${prefix}embedify [title]; [content]\nGive the embeded message a title and mark the end of the title with a semicolon. Then you can add the content/description on the embed.`;
    case "echo":
      return `${prefix}echo [text]\nIn order to use this command, you must buy it from the Spike Shop.\n\nUsing this command, you can display some text with the voice of Spike.`;
    case "clear":
      return `${prefix}clear [2 <= x <= 100]\nIn order to use this command, you must have administrator permissions or the Bot Expert role.\n\nDelete the last x messages from the channel, including the clear command itself.`;
    case "info":
      return `By typing '${prefix}info', you can see plenty of information about the bot.`;
    case "bug":
      return `${prefix}bug\nLearn how to submit a bug report.`;
    case "request":
      return `${prefix}request\nLearn how to submit a feature request.`;
    case "pr":
      return `${prefix}pr\nLearn how to submit a pull request for a new feature, bug fix, or plugin.`;
    case "wiki":
      return `${prefix}wiki\nLearn how to visit the wiki.`;
    case "getavatar":
      return `${prefix}getavatar [user]\nGet a user's avatar. To get yours, mention yourself.`;
    default:
      return "Command not found.";
  }
}

function shortHelp(prefix) {
  return (
    `Access text emoji through slash commands. Just hit /\n` +
    `${prefix}remindme - Set a reminder.\n` +
    `${prefix}embedify - Create an embeded message.\n` +
    `${prefix}echo - Speak with Spike's voice.\n` +
    `${prefix}clear - Delete a given number of messages.\n` +
    `${prefix}info - View bot information.\n` +
    `${prefix}bug - Learn how to submit bug report.\n` +
    `${prefix}request - Learn how to submit a feature request.\n` +
    `${prefix}pr - Learn how to submit new code via a PR.\n` +
    `${prefix}wiki - Get a link to the wiki.\n` +
    `${prefix}getavatar - Get a user's avatar.`
  );
}

const remindMe = (msg, args) => {
  const regexp = /^(\d{1,2}):(\d{1,2}):(\d{1,2})\s(.*)$/;
  const segs = args.match(regexp);

  if (!segs || segs.length != 5) {
    spikeKit.throwErr(msg, "syntax");
    return;
  }

  const time =
    parseInt(segs[1]) * spikeKit.HOUR +
    parseInt(segs[2]) * spikeKit.MINUTE +
    parseInt(segs[3]) * spikeKit.SECOND;

  setTimeout((_) => {
    spikeKit.reply(
      spikeKit.createEmbed(
        "Reminder :bell:",
        segs[4],
        false,
        msg.author.username,
        msg.author.avatarURL()
      ),
      msg,
      true
    );
  }, time);

  let d = new Date();
  d.setTime(d.getTime() + time);

  spikeKit.reply(
    spikeKit.createEmbed(
      "Reminder Set",
      `Reminder set for ${d.toUTCString()}`,
      false,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

const embedify = (args, msg, bot) => {
  const title = args.slice(0, args.indexOf(";"));
  const content = args
    .slice(args.indexOf(";") + 1)
    .trimStart()
    .trimEnd();

  spikeKit.send(
    spikeKit.createEmbed(
      title,
      content,
      false,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg.channelId,
    bot
  );
  msg.delete();
};

const clear = (msg) => {
  if (
    !msg.member.permissions.has("ADMINISTRATOR") &&
    !msg.member.roles.cache.has(getConsts().role.botexpert)
  ) {
    spikeKit.throwErr(msg, "invalidPermsErr");
    return;
  }
  const arg = msg.content.split(" ")[1];
  if (isNaN(arg)) {
    spikeKit.throwErr(msg, "clearNaNErr");
    return;
  } else if (arg > 100) {
    spikeKit.throwErr(msg, "clearTooBigErr");
    return;
  } else if (arg < 2) {
    spikeKit.throwErr(msg, "clearTooSmallErr");
    return;
  }
  msg.channel.bulkDelete(parseInt(arg));
};

const echo = (content, msg, bot) => {
  if (!msg.member.roles.cache.has(getConsts().role["echo"])) {
    spikeKit.throwErr(msg, "invalidPermsErr");
    return;
  }
  spikeKit.send(content, msg.channelId, bot);
  msg.delete();
};

function getContributorsPromise() {
  return new Promise((resolve, reject) => {
    https.get(
      {
        host: "api.github.com",
        path: "/repos/jwMaxwell/Spike-2/contributors",
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Mozilla/5.0",
        },
      },
      (response) => {
        let chunks_of_data = [];

        response.on("data", (fragments) => {
          chunks_of_data.push(fragments);
        });

        response.on("end", () => {
          let response_body = Buffer.concat(chunks_of_data).toString("utf8");
          resolve(response_body.toString());
        });

        response.on("error", (error) => {
          reject(error);
        });
      }
    );
  });
}

function getCommitPromise() {
  return new Promise((resolve, reject) => {
    getLastCommit((err, commit) => {
      return err ? reject(err) : resolve(commit);
    });
  });
}

const info = async (msg) => {
  const https_promise = getContributorsPromise();
  const collabs_response = await https_promise;
  const collabs_response_obj = JSON.parse(collabs_response);
  const commit_promise = getCommitPromise();
  const commit_response_obj = await commit_promise;
  const package = getPackage();
  const content =
    `Created by: ${package.creator}\n` +
    `Contributors: ${collabs_response_obj
      .map(function (e) {
        return e.login;
      })
      .join(", ")}\n` +
    // `Version: ${package.version}\n` +
    `Commit ID: ${commit_response_obj.shortHash}\n` +
    `Committed: ${new Date(
      parseInt(commit_response_obj.committedOn * 1000)
    ).toUTCString()}\n` +
    `Language: ${package.language}\n` +
    `Creation date: ${package.created}\n` +
    `Repository: ${package.repository.gh_url}\n` +
    `Wiki: ${package.repository.wiki}`;
  spikeKit.reply(
    spikeKit.createEmbed(
      `${package.fullName} info`,
      content,
      true,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
};

function bug(msg) {
  spikeKit.reply(
    spikeKit.createEmbed(
      "Bug Report",
      "To learn more about submitting a bug report, visit the [Bug Report Wiki Page](https://github.com/jwMaxwell/Spike-2/wiki/Bug-Reports).",
      false,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
}

function request(msg) {
  spikeKit.reply(
    spikeKit.createEmbed(
      "Feature Request",
      "To learn more about submitting a feature request, visit the [Feature Request Wiki Page](https://github.com/jwMaxwell/Spike-2/wiki/Feature-Requests).",
      false,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
}

function pr(msg) {
  spikeKit.reply(
    spikeKit.createEmbed(
      "Pull Request",
      "To learn more about submitting a pull request, visit the [Pull Request Wiki Page](https://github.com/jwMaxwell/Spike-2/wiki/Submitting-a-Pull-Request).",
      false,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
}

function wiki(msg) {
  spikeKit.reply(
    spikeKit.createEmbed(
      "Wiki",
      "[Visit the Wiki](https://github.com/jwMaxwell/Spike-2/wiki) for more detailed documentation, contribution information, and more!",
      false,
      msg.author.username,
      msg.author.avatarURL()
    ),
    msg
  );
}

/**
 * Get the mentioned user's avatar URL
 * @param {Discord.Message} msg Message to reply to
 * @param {string} args Should be just the mention
 * @param {Discord.Client} bot Logged in bot
 */
async function getAvatar(msg, args, bot) {
  if (args.trim().split(" ").length == 1) {
    try {
      const uid = args.replace("<@!", "").replace("<@", "").replace(">", "");
      const user = await bot.users.fetch(uid);
      const avatar = user.avatarURL() ?? "";
      if (avatar) {
        spikeKit.reply(`${args} avatar can be found at ${avatar}`, msg);
      }
    } catch (e) {
      spikeKit.reply(
        spikeKit.createEmbed(
          `Can't Get User's Avatar`,
          `Sorry, I can't get ${args} avatar right now.`,
          false,
          msg.author.username,
          msg.author.avatarURL(),
          spikeKit.COLORS.RED
        ),
        msg
      );
    }
  }
}

function processCommand(command, args, bot, message) {
  if (command.toLowerCase() === "remindme") remindMe(message, args);
  else if (command === "embedify") embedify(args, message, bot);
  else if (command === "clear") clear(message);
  else if (command === "echo") echo(args, message, bot);
  else if (command === "info") info(message);
  else if (command === "bug") bug(message);
  else if (command === "request") request(message);
  else if (command === "pr") pr(message);
  else if (command === "wiki") wiki(message);
  else if (command === "getavatar") getAvatar(message, args, bot);
}

module.exports = {
  NAME,
  SLUG,
  shortHelp,
  AUTHOR,
  COMMANDS,
  help,
  processCommand,
};
