/**
 * A blueprint for a SpikeKit Plugin.
 */

const spikeKit = require("../../spikeKit.js");
const fs = require("fs");

const NAME = "Programming Challenges";
const AUTHOR = "Joshua Maxwell";
const COMMANDS = ["challenges", "submitchallenge"];
const FILENAME = "plugins/challenges/challenges.json";
let challenges;

function help(prefix, command, args) {
  return "How to use the command with given args.";
}

function shortHelp(prefix) {
  return `${prefix}proofofconcept - Just a proof of concept.`;
}

const listChallenges = (bot, requestMessage) => {
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

  // for ()
};

async function validateCode(language, code, stdin = "", expectedOutput = "") {
  if (language == "" || code == "") {
    throw "Missing Arguments";
  }
  const { piston } = await import("piston-client");
  const client = piston({ server: "https://emkc.org" });
  const runtimes = await client.runtimes();
  const runtimes_filtered = runtimes.filter((obj) => obj.language == language);
  if (runtimes_filtered.length != 1) {
    return {
      validated: false,
      success: false,
      error: true,
      output: "Language is not a valid option.",
    };
  }
  const result = await client.execute(language, code, { stdin: stdin });

  return {
    validated: result.run.output === expectedOutput,
    success:
      result.success ??
      (result.run.signal === null && result.run.stderr === ""),
    output: result.run.output,
    error: result.error ?? result.run.code !== 0,
  };
}

/**
 * Handles incoming commands for this plugin.
 * @param {string} command The command issued, without the prefix.
 * @param {string} args The rest of the message.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 * @param {Discord.Message} message An object representing the message sent.
 */
function processCommand(command, args, bot, message) {
  if (command === "challenges") return;
  else if (command === "submitchallenge") return;
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
 * Runs when the bot is first started if exported below.
 * @param {Discord.Client} bot The instantiated Discord Bot object.
 */
function onBotStart(bot) {
  challenges = loadFile();
}

module.exports = {
  NAME,
  shortHelp,
  AUTHOR,
  COMMANDS,
  help,
  processCommand,
  // processReaction,
  // onBotStart,
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
