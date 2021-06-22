/**
 * @author Joshua Maxwell
 */
const spikeKit = require("../../spikeKit.js");
const spikeLisp = require("./interpreter.js").littleLisp;

const NAME = "Lisp Interpreter";
const AUTHOR = "Joshua Maxwell";
const COMMANDS = ["exec"];

 function help(prefix, command, args) {
  return `${prefix}exec [code]`
       + 'Spike-lisp is a simplified version of lisp created specifically '
       + 'for this server. In order to execute your code, you will need to '
       + `use "${prefix}exec" followed by a new-line. You will need to `
       + 'surround your code with 3 backticks. These backticks will need '
       + 'to be placed on separate lines.'
}

 function shortHelp(prefix){
  return `${prefix}exec - Execute Spike-lisp code.`
}

function processCommand(command, args, bot, message){
  const cmd = args.slice('\n```lisp\n'.length, args.lastIndexOf('```'));
  reply('```' + spikeLisp.interpret(spikeLisp.parse(cmd)) + '```');
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};
