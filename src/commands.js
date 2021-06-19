/**
 * @author Joshua Maxwell
 * This file contains common server commands and trasfers control
 */

const Discord = require('discord.js');
const {throwErr} = require('./botErr.js');
const {executeGame} = require('./gamble.js');
const {getConsts, getBotInfo} = require('./faccess');
const {enigma} = require('./enigma.js');
const https = require("https");

/**
 * This will remind a user of a given thing, after a given amount of time
 * @param {Message} msg the message sent by the user
 */
const remindMe = (msg) => {
  console.log('performing remindme');
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
    const title = "Reminder :bell:";
    basicEmbed(msg, title, reminder);
  }, time);
  
  basicEmbed(msg, 'Reminder Set', 'null'); //FIXME
}

/**
 * This simply tests to see if the bot is up and running
 * @param {Message} msg the message sent by the user
 */
// const test = (msg) => {
//   console.log('performing test');
//   const title = 'Test';
//   const content = 'Testing 1 2 3';
//   basicEmbed(msg, title, content);

//   console.log('\nauthor\n');
//   console.log(msg.author);
//   console.log('\nfetch\n');
//   console.log(msg.guild.members.fetch(msg.author.id).guild);
// } 

/**
 * Generates a user made embed
 * @param {Message} msg the message sent by the user
 */
const embedify = (msg) => {
  console.log('performing embedify');
  const title = rmFirst(msg.content.slice(0, msg.content.indexOf(';')));
  const content = msg.content.slice(msg.content.indexOf(';') + 1).trimStart().trimEnd();

  basicEmbed(msg, title, content);
  msg.delete();
}

const test = (msg) => {
  const title = rmFirst(msg.content.slice(0, msg.content.indexOf(';')));
  const content = msg.content.slice(msg.content.indexOf(';') + 1);
  console.log(`title: ${title}\ncontent: ${content.trimStart()}`);
}

/**
 * Deletes a given number of messages
 * @param {Message} msg the message sent by the user
 */
const clear = (msg) => {
  if(!msg.member.hasPermission('ADMINISTRATOR')) {
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

/**
 * repeats what the user says and deletes their original message
 * @param {Message} msg the message sent by the user
 */
const echo = (msg) => {
  console.log('performing echo');
  const content = rmFirst(msg.content);
  msg.channel.send(content);
  msg.delete();
}

function getCollaboratorsPromise(){
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

			response.on('data', (fragments) => {
				chunks_of_data.push(fragments);
			});

			response.on('end', () => {
				let response_body = Buffer.concat(chunks_of_data).toString('utf8');
				resolve(response_body.toString());
			});

			response.on('error', (error) => {
				reject(error);
			});
		});
	});
}

/**
 * displays information about the bot 
 * @param {Message} msg the message sent by the user 
 */
const info = async (msg) => {
  console.log('performing info');
  const https_promise = getCollaboratorsPromise();
  const collabs_response = await https_promise;
  const response_obj = JSON.parse(collabs_response);
  const botinfo = getBotInfo();

  const content = `Created by: ${botinfo.creator}\n` +
                  `Collaborators: ${response_obj.map(function(e){
                    return e.login
                  }).join(", ")}\n` +
                  `Version: ${botinfo.version}\n` +
                  `Language: ${botinfo.language}\n` + 
                  `Creation date: ${botinfo.created}\n` +
                  `Last updated: ${botinfo.updated}\n` + 
                  `Repository: ${botinfo.repo}`;
  basicEmbed(msg, `${botinfo.name} info`, content);
}

/**
 * removes first word in a string
 * @param {String} str string to mutate
 * @returns given string without the first word
 */
const rmFirst = (str) => str.slice(str.indexOf(' ') + 1);

/**
 * Creates an embed
 * @param {Message} msg the message sent by the user
 * @param {String} title title for the embed
 * @param {String} content description for the embed
 */
const basicEmbed = (msg, title, content) => {
  const embed = new Discord.MessageEmbed()
    .setColor(0xcc00ff)
    .setTitle(title)
    .setDescription('```yaml\n' + content + '\n```')
    .setFooter(msg.author.username, msg.author.avatarURL());
  msg.channel.send(embed);
}

const useEnigma = (msg) => {
  const str = msg.content.includes(';') 
            ? rmFirst(msg.content.slice(0, msg.content.indexOf(';')))
            : rmFirst(msg.content);
  const args = msg.content.includes(';') 
             ? msg.content.slice(msg.content.indexOf(';') + 1).split(' ')
             : '';

  if (args.length) {
    args.shift();
    basicEmbed(msg, 'Enigma', enigma(str, ...args));
  }
  else
    basicEmbed(msg, 'Enigma', enigma(str));
}

const help = (msg) => {
  const arg = msg.content.split(' ')[1];

  console.log(`${msg.content} : ${arg}\n`);

  if (!arg) 
    basicEmbed(msg, 'Help', getConsts().help.main);
  else if (arg == 'embedify')
    basicEmbed(msg, 'Help', getConsts().help.embedify);
  else if (arg == 'info')
    basicEmbed(msg, 'Help', getConsts().help.info);
  else if (arg == 'cointoss')
    basicEmbed(msg, 'Help', getConsts().help.cointoss);
  else if (arg == 'gift')
    basicEmbed(msg, 'Help', getConsts().help.gift);
  else if (arg == 'leaderboard')
    basicEmbed(msg, 'Help', getConsts().help.leaderboard);
  else if (arg == 'dice')
    basicEmbed(msg, 'Help', getConsts().help.dice);
  else if (arg == 'slots')
    basicEmbed(msg, 'Help', getConsts().help.slots);
  else if (arg == 'shop')
    basicEmbed(msg, 'Help', getConsts().help.shop);
  else if (arg == 'buy')
    basicEmbed(msg, 'Help', getConsts().help.buy);
  else if (arg == 'bucks')
    basicEmbed(msg, 'Help', getConsts().help.bucks);
  else if (arg == 'echo')
    basicEmbed(msg, 'Help', getConsts().help.echo);
  else if (arg == 'wallet')
    basicEmbed(msg, 'Help', getConsts().help.wallet);
  else if (arg == 'enigma')
    basicEmbed(msg, 'Help', getConsts().help.enigma);
}

/**
 * This will select an action depending on the command given
 * @param {Message} msg the message sent by the user
 */
const execute = (msg) => {
  console.log('Searching for command');
  const command = msg.content.split(' ')[0].toLowerCase().slice(1);
  if (command.toLowerCase() === 'remindme')
    remindMe(msg);
  else if (command === 'test')
    test(msg);
  else if (command === 'embedify')
    embedify(msg);
  else if (command === 'clear')
    clear(msg);
  else if (command === 'echo')
    echo(msg);
  else if (command === 'info')
    info(msg);
  else if (command === 'help' || command === 'man')
    help(msg);
  else if (command === 'enigma')
    useEnigma(msg);
  else
    executeGame(msg); // send to gamble.js
}

module.exports = { execute, basicEmbed }