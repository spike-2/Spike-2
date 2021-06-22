/**
 * @author Joshua Maxwell
 */
const spikeKit = require("../../spikeKit.js");
const spikeLisp = require("./interpreter.js").littleLisp;

const NAME = "Lisp Interpreter";
const AUTHOR = "Joshua Maxwell and maryrosecook";
const COMMANDS = ["exec"];

 function help(prefix, command, args) {
  return `${prefix}exec [code]\n`
       + 'Spike-lisp is a simplified version of lisp created specifically '
       + 'for this server. In order to execute your code, you will need to '
       + `format your message as follows, replacing {bt} with a backtick.\n\n`
       + `${prefix}exec\n`
       + '{bt}{bt}{bt}lisp\n'
       + '(print(4, (1, 2, 3)));\n'
       + '{bt}{bt}{bt}';
}

 function shortHelp(prefix){
  return `${prefix}exec - Execute Spike-lisp code.`
}

function processCommand(command, args, bot, message){
  const cmd = args.slice('\n```lisp\n'.length, args.lastIndexOf('```'));
  spikeKit.reply(
    spikeKit.createEmbed(
      "Spike Lisp",
      '```' + spikeLisp.interpret(spikeLisp.parse(cmd)) + '```',
      false,
      message.author.username,
      message.author.avatarURL()
      ),
    message);
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};
