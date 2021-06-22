/**
 * @author Joshua Maxwell
 */

const spikeKit = require("../../spikeKit.js");

const NAME = "Core";
const AUTHOR = "Joshua Maxwell";
const COMMANDS = ['remindme', 'embedify', 'echo', 'clear', 'info'];

function help(prefix, command, args) { // TODO
  return "How to use the command with given args."
}

function shortHelp(prefix){
  return `${prefix}remindme - Set a reminder.\n`
       + `${prefix}embedify - Create an embeded message\n`
       + `${prefix}echo - Speak with Spike's voice\n`
       + `${prefix}clear - Delete a given number of messages\n`
       + `${prefix}info - View bot information}`;
}

const remindMe = (msg) => {
  const INTERVALS = [3600000, 60000, 1000] // hour, min, sec

  //splits first arg into time intervals
  const segs = msg.content
                  .split(' ')[1]
                  .split(':'); 
  
  const time = parseInt(segs[0]) * INTERVALS[0]
             + parseInt(segs[1]) * INTERVALS[1]
             + parseInt(segs[2]) * INTERVALS[2];

  const reminder = msg.content
                      .slice(msg.content.indexOf(' ') + 1)
                      .slice(msg.content.indexOf(' '));
  setTimeout(_=> {
    createEmbed("Reminder :bell:", reminder, msg.author.username, msg.author.avatarURL());
  }, time);
  
  createEmbed('Reminder Set', `Reminder set for ${math.floor(time / INTERVALS[1])}`
             + ' minutes from now.', msg.author.username, msg.author.avatarURL()); //FIXME
}

const embedify = (msg) => {
  console.log('performing embedify');
  const title = rmFirst(msg.content.slice(0, msg.content.indexOf(';')));
  const content = msg.content.slice(msg.content.indexOf(';') + 1).trimStart().trimEnd();

  createEmbed(title, content, false, msg.author.username, msg.author.avatarURL());
  msg.delete();
}

const clear = (msg) => {
  if(!msg.member.hasPermission('ADMINISTRATOR')) { // TODO allow bot experts to use
    throwErr('invalidPermsErr');
    return;
  }
  const arg = msg.content.split(' ')[1];
  if (isNaN(arg))
    throwErr('clearNaNErr');
  else if (arg > 100)
    throwErr('clearTooBigErr');
  else if (arg < 2)
    throwErr('clearTooSmallErr');
  msg.channel.bulkDelete(parseInt(arg));
}

const echo = (msg) => {
  msg.channel.send(content);
  msg.delete();
}

function getContributorsPromise(){
  return new Promise((resolve, reject) => {
		https.get({
      host: "api.github.com",
      path: "/repos/jwMaxwell/Spike-2/contributors",
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0'
      }
      }, (response) => {
			let chunks_of_data = [];

			response.on('data', fragments => {
				chunks_of_data.push(fragments);
			});

			response.on('end', () => {
				let response_body = Buffer.concat(chunks_of_data).toString('utf8');
				resolve(response_body.toString());
			});

			response.on('error', error => {
				reject(error));
		});
	});
}

function getCommitPromise(){
  return new Promise((resolve, reject) => {
    getLastCommit((err, commit) => {
      return err ? reject(err) : resolve(commit);
    })
  });
}

const info = async (msg) => {
  const https_promise = getContributorsPromise();
  const collabs_response = await https_promise;
  const collabs_response_obj = JSON.parse(collabs_response);
  const commit_promise = getCommitPromise();
  const commit_response_obj = await commit_promise;
  const package = getPackage();
  const content = `Created by: ${package.creator}\n` +
                  `Contributors: ${collabs_response_obj.map(function(e){
                    return e.login
                  }).join(", ")}\n` +
                  // `Version: ${package.version}\n` +
                  `Commit ID: ${commit_response_obj.shortHash}\n`+
                  `Committed: ${new Date(parseInt(commit_response_obj.committedOn*1000)).toUTCString()}\n` +
                  `Language: ${package.language}\n` + 
                  `Creation date: ${package.created}\n` +
                  `Repository: ${package.repository.gh_url}`;
  createEmbed(`${package.fullName} info`, content);
}

function processCommand(command, args, bot, message) {
  console.log('Searching for command');
  const command = msg.content.split(' ')[0].toLowerCase().slice(1);
  if (command.toLowerCase() === 'remindme')
    remindMe(msg);
  else if (command === 'embedify')
    embedify(msg);
  else if (command === 'clear')
    clear(msg);
  else if (command === 'echo')
    echo(args);
  else if (command === 'info')
    info(message);
}

module.exports = {NAME, shortHelp, AUTHOR, COMMANDS, help, processCommand};
