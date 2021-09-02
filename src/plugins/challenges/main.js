/**
 * A plugin to facilitate coding challenges.
 */

const spikeKit = require("../../spikeKit.js");
const fs = require("fs");
const { throwErr } = require("../../botErr.js");

const NAME = "Programming Challenges";
const AUTHOR = "Brandon Ingli and Joshua Maxwell";
const COMMANDS = ["challenges", "submitcode"];
const FILENAME = "plugins/challenges/challenges.json";
let challenges;

function help(prefix, command, args) {
  switch (command) {
    case "challenges":
      return `${prefix}challenges\nRun this command to see what challenges are available.`;
    case "submitcode":
      return `${prefix}submitcode {ID}\n\\\`\\\`\\\`{language}\n{code}\n\\\`\\\`\\\`\n\n(Don't escape backticks.)\nSubmit your code for the given challenge.`;
  }
}

function shortHelp(prefix) {
  return (
    `${prefix}challenges - See current challenges\n` +
    `${prefix}submitcode - Submit code for a challenge.`
  );
}

const listChallenges = async (bot, requestMessage) => {
  if (Object.keys(challenges).length === 0) {
    spikeKit.reply(
      spikeKit.createEmbed(
        "Programming Challenges",
        "There are no programming challenges yet.",
        false,
        requestMessage.author.username,
        requestMessage.author.avatarURL()
      ),
      requestMessage
    );
    return;
  }

  let message = "Here are the active programming challenges.\n---\n";
  for ([id, challenge] of Object.entries(challenges)) {
    const creator = await bot.users.fetch(challenge.creator);
    let completers = "";
    for (completer of challenge.passed) {
      completers += `${await bot.users.fetch(completer.submittedBy)}, `;
    }
    if (completers == "") {
      completers = "nobody!  "; // 2 extra spaces to account for slice
    }
    message += `**${
      challenge.title
    }**\n*Created by ${creator}*\n*ID: \`${id}\`*\n*Completed by ${completers.slice(
      0,
      -2
    )}*\n\n${challenge.challenge}\n---\n`;
  }
  spikeKit.reply(
    spikeKit.createEmbed(
      "Programming Challenges",
      message,
      false,
      requestMessage.author.username,
      requestMessage.author.avatarURL()
    ),
    requestMessage
  );
};

async function validateCode(language, code, stdin = "", expectedOutput = "") {
  if (language == "" || code == "") {
    throw "Missing Arguments";
  }
  const { piston } = await import("piston-client");
  const client = piston({ server: "https://emkc.org" });
  const runtimes = await client.runtimes();
  let runtimes_filtered = runtimes.filter(
    (obj) => obj.language == language || obj.aliases.includes(language)
  );
  if (runtimes_filtered.length > 1) {
    runtimes_filtered = runtimes_filtered.filter(
      (obj) => obj.runtime != "deno"
    );
  }
  if (runtimes_filtered.length == 0) {
    return {
      validated: false,
      success: false,
      error: true,
      output: "Language is not a valid option.",
    };
  } else if (runtimes_filtered.length > 1) {
    return {
      validated: false,
      success: false,
      error: true,
      output: "Language is ambiguous. Please try another name or alias.",
    };
  }
  const result = await client.execute(runtimes_filtered[0].language, code, {
    stdin: stdin,
  });

  return {
    validated: result.run.output === expectedOutput,
    success:
      result.success ??
      (result.run.signal === null && result.run.stderr === ""),
    output: result.run.output,
    error: result.error ?? result.run.code !== 0,
  };
}

async function submitCode(args, bot, message) {
  try {
    message.delete();
  } catch (e) {
    spikeKit.reply(
      `${message.author}: I couldn't delete your message! Please delete it to shield your work from others!`,
      message
    );
  }
  // Check message format
  const messageFormat = /^(\d+)\n\`\`\`(.+)\n((.|\n)+)\n\`\`\`\n?$/;
  const segs = args.match(messageFormat);
  if (!segs || segs.length < 4) {
    throwErr(message, "syntax");
    return;
  }

  // Validate challenge
  if (!Object.keys(challenges).includes(segs[1])) {
    throwErr(message, "invalidChallengeIdErr");
    return;
  }

  const challenge = challenges[segs[1]];

  // Only allow one submission
  if (
    challenge.passed.filter((obj) => obj.submittedBy == message.author.id)
      .length != 0
  ) {
    throwErr(message, "alreadySubmittedChallengeErr");
    return;
  }

  // Validate code
  const codeValidation = await validateCode(
    segs[2],
    segs[3],
    challenge.input,
    challenge.expected
  );

  if (codeValidation.validated) {
    spikeKit.reply(
      spikeKit.createEmbed(
        `Programming Challenges: ${challenge.title}`,
        `Your submission passed validation! Congratulations!`,
        false,
        message.author.username,
        message.author.avatarURL()
      ),
      message
    );
    challenges[segs[1]].passed.push({
      submittedBy: message.author.id,
      language: segs[2],
      code: segs[3],
    });
    writeChallenges(challenges);
  } else if (codeValidation.success) {
    spikeKit.reply(
      spikeKit.createEmbed(
        `Programming Challenges: ${challenge.title}`,
        `Your submission ran successfully, but produced incorrect output.`,
        false,
        message.author.username,
        message.author.avatarURL()
      ),
      message
    );
  } else {
    spikeKit.reply(
      spikeKit.createEmbed(
        `Programming Challenges: ${challenge.title}`,
        `Your submission only produced error output:\n\`\`\`\n${codeValidation.output}\n\`\`\``,
        false,
        message.author.username,
        message.author.avatarURL()
      ),
      message
    );
  }
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message) {
  if (command === "challenges") listChallenges(bot, message);
  else if (command === "submitcode") submitCode(args, bot, message);
}

/**
 * Handles reactions added/removed to embeds sent by this plugin. To receive anything in this function, plugins must...
 *  + Have this function exported
 *  + Send a message as an embed through Spike (or Simone)
 *  + Have the sent message cached. Either the message was sent during the current running session of the bot, or cached using onBotStart
 *  + The title of the embed starts with `${NAME}: `
 *  + A user other than Spike (or Simone) added or removed the reaction
 * @param {Discord.MessageReaction} reaction Message Reaction object for the reaction added/removed.
 * @param {Discord.User} user User who applied reaction/User whose reaction was removed.
 * @param {boolean} add True if reaction added, False if removed.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function processReaction(reaction, user, add, bot) {
  console.log(
    `${user.username} ${add ? "Added" : "Removed"} a reaction on ${
      reaction.message.author.username
    }'s message: :${reaction.emoji.name}:.`
  );
}

const loadFile = () => {
  try {
    let contents = fs.readFileSync(FILENAME);
    return JSON.parse(contents);
  } catch (e) {
    console.error(
      `${FILENAME} doesn't exist or isn't readable. Using empty object instead.`
    );
    return {};
  }
};

/**
 * Writes active challenges to disk.
 * @param {Challenges} challenges Active Challenges object
 */
function writeChallenges(challenges) {
  fs.writeFileSync(FILENAME, JSON.stringify(challenges));
}

/**
 * Runs when the bot is first started if exported below.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function onBotStart(bot) {
  challenges = loadFile();
  console.log(`${NAME} has started.`);
}

module.exports = {
  NAME,
  shortHelp,
  AUTHOR,
  COMMANDS,
  help,
  processCommand,
  // processReaction,
  onBotStart,
};

/**
 * Run `node main.js` to test piston with a python3 fizzbuzz
 */
if (require.main === module) {
  //prettier-ignore
  const code = 'import sys\nfor line in sys.stdin:\n  if line.rstrip() == "":\n    continue\n  num = int(line.rstrip())\n  output = ""\n  if num % 3 == 0:\n    output += "fizz"\n  if num % 5 == 0:\n    output += "buzz"\n  if output == "":\n    output = str(num)\n  print(output)';
  validateCode(
    "python",
    code,
    "1\n2\n3\n4\n5\n15\n",
    "1\n2\nfizz\n4\nbuzz\nfizzbuzz\n"
  ).then(console.log);
}
