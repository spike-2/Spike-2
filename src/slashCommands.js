/**
 * @author Brandon Ingli
 * Deals with adding, handling, and removing slash commands
 */

const { getConsts } = require("./faccess.js");
const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { SlashCommandBuilder } = require("@discordjs/builders");
var bot, GUILDID, rest;

const setBot = (theBot) => {
  bot = theBot;
  GUILDID = getConsts().guild;
  rest = new REST({ version: "9" }).setToken(process.env.DISJS_BOT_TOKEN);
};

/**
 * Delete a command
 * @param {string} commandId The ID of the command to delete
 */
const deleteCommand = async (commandId) => {
  await rest.delete(
    `${Routes.applicationGuildCommands(bot.user.id, GUILDID)}/${commandId}`
  );
};

const getCommands = async () => {
  let commands = await rest.get(
    Routes.applicationGuildCommands(bot.user.id, GUILDID)
  );
  return commands;
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
const addAllCommands = async () => {
  console.log(`Adding Slash Commands...`);
  let commands = [];
  const emojis = getConsts().emoji;
  for (let [name, params] of Object.entries(emojis)) {
    commands.push(
      new SlashCommandBuilder()
        .setName(name.toLowerCase())
        .setDescription(
          (params.premium
            ? `[PREMIUM] ${params.content}`
            : params.content
          ).substring(0, 100)
        )
        .setDefaultPermission(true)
        .toJSON()
    );
  }
  await rest.put(Routes.applicationGuildCommands(bot.user.id, GUILDID), {
    body: commands,
  });
  console.log(`All Commands Added.`);
};

const deleteAllCommands = async () => {
  const commands = await getCommands();
  for (command of commands) {
    console.log(`Deleting ${command.name}...`);
    await deleteCommand(command.id);
    console.log(`${command.name} deleted.`);
  }
};

/**
 * Handle a new Interaction
 * @param {Interaction} interaction The interaction to interact with.
 *
 * Member: https://discord.com/developers/docs/resources/guild#guild-member-object
 * Options: [{value: "", type: 4, name: "name"}, ...]
 */
const handleInteraction = async (interaction, bot) => {
  const { commandName, user } = interaction;
  const member =
    interaction.guild.members.cache.get(user) ||
    (await interaction.guild.members.fetch(user));
  const emojiRole = getConsts().role.emoji;
  let emojiRoleObject =
    interaction.guild.roles.cache.get(emojiRole) ||
    (await interaction.guild.roles.fetch(emojiRole));

  const emoji = getConsts().emoji[commandName];

  if (
    emoji &&
    member &&
    (!emoji.premium || (emoji.premium && member.roles.cache.has(emojiRole)))
  ) {
    reply(emoji.content, interaction);
  }
};

module.exports = {
  setBot,
  getCommands,
  addAllCommands,
  deleteCommand,
  deleteAllCommands,
  handleInteraction,
};
