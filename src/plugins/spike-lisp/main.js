/**
 * @author Joshua Maxwell
 */
const spikeKit = require("../../spikeKit.js");
const spikeLisp = require("./interpreter.js").littleLisp;
fs = require('fs');
const FILENAME = './mount.json';

const NAME = "Lisp Interpreter";
const AUTHOR = "Joshua Maxwell and maryrosecook";
const COMMANDS = ["exec", "mount", "call"];

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

function mount(args, message) {
  let dat = fs.readFileSync(FILENAME, {encoding: 'utf8', flag:'r'});
  dat = JSON.parse(dat);

  if (dat[args.split(' ')[0]]) {
    spikeKit.reply(
      spikeKit.createEmbed(
        "Spike Lisp: ERROR",
        `Program ${dat[args.split(' ')[0]]} already mounted`,
        false,
        message.author.username,
        message.author.avatarURL()
        ),
      message);
    return;
  }

  fs.writeFile(FILENAME, JSON.stringify(dat), (err, t) => {
    if (err)
      return console.log(err);
    console.log(`${JSON.stringify(dat)} > ${FILENAME}`);
  });

  spikeKit.reply(
    spikeKit.createEmbed(
      "Spike Lisp: ERROR",
      `Program ${dat[args.split(' ')[0]]} has been mounted`,
      false,
      message.author.username,
      message.author.avatarURL()
      ),
    message);
}

function call(args, message) {
  let dat = fs.readFileSync(FILENAME, {encoding: 'utf8', flag:'r'});
  dat = JSON.parse(dat);

  if (!dat[args.split(' ')[0]]) {
    spikeKit.reply(
      spikeKit.createEmbed(
        "Spike Lisp: ERROR",
        `Program ${dat[args.split(' ')[0]]} has not been mounted`,
        false,
        message.author.username,
        message.author.avatarURL()
        ),
      message);
    return;
  }

  interp(dat[args.split(' ')[0]], message);
}

function interp(args, message) {
  const cmd = args.slice('\n```lisp\n'.length, args.lastIndexOf('```'));
  try {
    const content = "" + spikeLisp.interpret(spikeLisp.parse(message, cmd));
    spikeKit.reply(
      spikeKit.createEmbed(
        "Spike Lisp",
        content.length > 0 ? '```' + content + '```' : "",
        false,
        message.author.username,
        message.author.avatarURL()
        ),
      message);
  } catch (e) {
    var caller_line = e.stack.split("\n")[4];
    var index = caller_line.indexOf("at ");
    var clean = caller_line.slice(index+2, caller_line.length);
    spikeKit.reply(
      spikeKit.createEmbed(
        "Spike Lisp: ERROR",
        '```' + e + '```\n```' + clean + '```',
        false,
        message.author.username,
        message.author.avatarURL()
        ),
      message);
  }
}

function processCommand(command, args, bot, message) {
  if (command === 'exec')
    interp(args, message);
  else if (command === 'mount') 
    mount(args, message);
  else if (command === 'call') 
    call(args, message);
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};
