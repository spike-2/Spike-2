const Discord = require('discord.js');
const {getConsts} = require('./faccess.js');

let tickets = [];



const executePM = (msg) => {
  const returningUser = tickets.includes(msg.author.id);

  //if (!returningUser && msg.content.toLowerCase() === '$close')

}