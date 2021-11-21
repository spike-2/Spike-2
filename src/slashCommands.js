/**
 * @author Brandon Ingli
 * Deals with adding, handling, and removing slash commands
 */

const { getConsts } = require("./faccess.js");
const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { ROUTES } = require("discord-api-types/v9");
var bot, GUILDID, rest;

const setBot = (theBot) => {
  bot = theBot;
  GUILDID = getConsts().guild;
  rest = new REST({ version: "9" }).setToken(process.env.DISJS_BOT_TOKEN);
};

/**
 * Add or Update a Command. Passing the name of an existing command updates it.
 * @param {string} name Name of the command
 * @param {string} description Description of the command
 * @param {Object} [options=null] An array of options for the command. See https://discord.com/developers/docs/interactions/slash-commands#registering-a-command
 */
const addCommand = async (name, description, options = null) => {
  await rest.put(ROUTES.applicationGuildCommands(bot.user.id, GUILDID), {
    body: {
      data: {
        name: name,
        description: description,
        options: options,
      },
    },
  });
};

/**
 * Delete a command
 * @param {string} commandId The ID of the command to delete
 */
const deleteCommand = async (commandId) => {
  await rest.delete(
    `${ROUTES.applicationGuildCommands(bot.user.id, GUILDID)}/${commandId}`
  );
};

/**
 * Reply to an interaction.
 * @param {string | Discord.MessageEmbed} response Response to send
 * @param {Object} interaction The interaction to reply to
 */
const reply = async (response, interaction) => {
  let messageData = {};
  if (response instanceof Discord.MessageEmbed) {
    messageData.embeds = [response];
  } else {
    messageData.content = `${response}`;
  }

  await interaction.reply(messageData);
};

/**
 * Bulk add the slash commands we want.
 */
const addAllCommands = () => {
  console.log(`Adding Slash Commands...`);
  const emojis = getConsts().emoji;
  for (let [name, params] of Object.entries(emojis)) {
    addCommand(
      name.toLowerCase(),
      (params.premium
        ? `[PREMIUM] ${params.content}`
        : params.content
      ).substring(0, 100)
    );
  }
  console.log(`All Commands Added.`);
};

/**
 * Handle a new Interaction
 * @param {Interaction} interaction The interaction to interact with.
 *
 * Member: https://discord.com/developers/docs/resources/guild#guild-member-object
 * Options: [{value: "", type: 4, name: "name"}, ...]
 */
const handleInteraction = async (interaction, bot) => {
  const { name, options } = interaction.data;
  const member = interaction.member;
  const emojiRole = getConsts().role.emoji;

  const emoji = getConsts().emoji[name];

  if (
    emoji &&
    (!emoji.premium || (emoji.premium && member.roles.includes(emojiRole)))
  ) {
    reply(emoji.content, interaction);
  }
};

module.exports = {
  setBot,
  getCommands,
  addCommand,
  addAllCommands,
  deleteCommand,
  handleInteraction,
};
